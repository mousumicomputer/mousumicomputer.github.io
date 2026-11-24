/* ==========================================================================
   MODULE: CPSCL Academic ERP
   SUB-SECTION: Teacher Evaluation & Duty (Teacher Directory + Exam Duty)
   Path: cpscl/teacher_evaluation_manager.js
   Architecture: Direct Firebase REST | Strictly additive (no existing file or
                 collection is modified or overwritten)
   New collections:
     - teaching_assignments/{teacherId}_{subject}_{group}
     - subjects_master/{subjectKey}
   Writes to (merge only, via PATCH):
     - exam_teacher_assignments/{examId}
   LOAD ORDER: include this file AFTER cpscl/ssc27_exam_manager.js in admin.html
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Teacher Evaluation & Duty Manager...");

    const DB = "https://mousumi-computer-default-rtdb.firebaseio.com";

    // Where imported teachers live. The first path that returns data is used.
    // Change/add a path here if your teacher collection has another name.
    const TEACHER_PATHS = ['cpscl_teachers', 'cpscl_teacher_directory', 'teachers'];

    // Groups shown as columns in the matrix (same names as SSC-27 groups).
    const GROUPS = [
        'Group A (Science)', 'Group B (Science)', 'Group C (Science)',
        'Group D (Humanities)', 'Group D (Business Studies)'
    ];

    const ROUTINE_SUBJECTS = [
        "Physics", "Chemistry", "Biology", "Math", "Ban 1", "Ban 2", "Eng 1", "Eng 2",
        "ICT", "Reli", "Sci", "Acc-Geo", "Fin-His", "B-Ent-Civ", "HM-Agri-HS"
    ];

    // ---------- helpers ----------
    const cleanKey = s => String(s || '').replace(/[/#$\[\].]/g, '-').replace(/\s+/g, '_').trim();
    const norm = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const asList = d => !d ? [] : (Array.isArray(d) ? d.filter(Boolean) : Object.values(d));

    async function getJSON(path) {
        try {
            const r = await fetch(`${DB}/${path}.json`);
            return r.ok ? await r.json() : null;
        } catch (e) { return null; }
    }
    async function patchJSON(path, body) {
        const r = await fetch(`${DB}/${path}.json`, {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (!r.ok) throw new Error(`Firebase error ${r.status}`);
    }

    function teacherId(t) { return String(t.emp_id || t.empId || t.EMP_ID || t['EMP ID'] || t.teacher_id || t.id || '').trim(); }
    function teacherName(t) { return String(t.name || t.Name || t.teacher_name || t.name_english || 'Teacher').trim(); }

    // ---------- state ----------
    let teachers = [];
    let assignments = {};      // key -> {teacherId, teacherName, subject, group}
    let subjectsMaster = [];   // [{key, name}]
    let examList = [];
    let modalTeacher = null;
    let modalRows = {};        // subject -> Set(group)
    let dutyPlan = [];

    // ---------- styles ----------
    function injectStyles() {
        if (document.getElementById('cpscl-te-style')) return;
        const st = document.createElement('style');
        st.id = 'cpscl-te-style';
        st.innerHTML = `
        .te-wrap{padding:15px 5px;font-family:'Plus Jakarta Sans',sans-serif}
        .te-head{background:#fff;border:1px solid #e2e8f0;padding:16px 24px;border-radius:50px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
        .te-head h1{font-size:1.25rem;font-weight:800;margin:0;color:#0f172a}
        .te-tabs{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap}
        .te-tab{background:#fff;border:1.5px solid #cbd5e1;color:#64748b;padding:10px 22px;border-radius:50px;font-weight:700;font-size:.88rem;cursor:pointer}
        .te-tab.active{background:#7c3aed;border-color:#7c3aed;color:#fff}
        .te-card{background:#fff;border:1px solid #cbd5e1;border-radius:16px;padding:20px;margin-bottom:18px}
        .te-title{font-weight:800;color:#0f172a;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
        .te-table{width:100%;border-collapse:collapse}
        .te-table th{font-size:.74rem;text-transform:uppercase;color:#64748b;text-align:left;padding:10px 12px;border-bottom:1.5px solid #eef2f5}
        .te-table td{padding:10px 12px;border-bottom:1px solid #eef2f5;font-size:.88rem;color:#334155}
        .te-ctl{height:40px;border:1.5px solid #cbd5e1;border-radius:50px;padding:0 16px;font-size:.88rem;outline:none;background:#fff}
        .te-btn{height:38px;padding:0 18px;border-radius:50px;border:none;font-weight:700;font-size:.82rem;cursor:pointer;background:#7c3aed;color:#fff}
        .te-btn.ghost{background:#f1f5f9;color:#334155}
        .te-btn.green{background:#059669}
        .te-chip{display:inline-block;background:#f5f3ff;color:#6d28d9;border:1px solid #ddd6fe;border-radius:50px;padding:2px 10px;font-size:.74rem;font-weight:700;margin:2px 3px 2px 0}
        .te-modal{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:999999;display:none;align-items:center;justify-content:center;padding:12px}
        .te-modal-box{background:#fff;border-radius:20px;width:100%;max-width:820px;max-height:92vh;overflow:auto;padding:22px}
        .te-warn{color:#b45309;font-size:.72rem;font-weight:700}
        .te-cell{text-align:center}
        .te-cell input{width:18px;height:18px;accent-color:#7c3aed}
        .te-cell input:disabled{opacity:.35}
        @media(max-width:700px){.te-head{border-radius:20px}}
        `;
        document.head.appendChild(st);
    }

    // ---------- sidebar ----------
    function injectSidebar() {
        const sub = document.getElementById('trust-exam-submenu-items');
        if (!sub) { setTimeout(injectSidebar, 250); return; }
        if (document.getElementById('te-parent-menu')) return;

        const examParent = sub.closest('li') || sub.parentElement;
        const li = document.createElement('li');
        li.id = 'te-parent-menu';
        li.innerHTML = `
            <a class="trust-sub-link" style="font-weight:800;cursor:pointer;" onclick="document.getElementById('te-submenu').style.display = document.getElementById('te-submenu').style.display==='none'?'block':'none'">
                <span class="trust-sub-indicator" style="background:#7c3aed;"></span><span style="color:#7c3aed;">Teacher Evaluation &amp; Duty</span>
            </a>
            <ul id="te-submenu" style="list-style:none;padding-left:14px;margin:0;display:none;">
                <li><a class="trust-sub-link" id="te-link-dir" onclick="window.openTeacherEval('dir', this)"><span class="trust-sub-indicator"></span><span>Teacher Directory &amp; PIN</span></a></li>
                <li><a class="trust-sub-link" id="te-link-duty" onclick="window.openTeacherEval('duty', this)"><span class="trust-sub-indicator"></span><span>Exam Duty Assignment</span></a></li>
            </ul>`;
        if (examParent && examParent.parentElement && examParent !== sub) {
            examParent.parentElement.insertBefore(li, examParent.nextSibling);
        } else {
            sub.parentElement.appendChild(li);
        }
    }

    // ---------- data loading ----------
    async function loadAll() {
        teachers = [];
        for (const p of TEACHER_PATHS) {
            const d = await getJSON(p);
            const list = asList(d).filter(t => t && typeof t === 'object' && teacherId(t));
            if (list.length) { teachers = list; break; }
        }
        assignments = (await getJSON('teaching_assignments')) || {};

        const master = (await getJSON('subjects_master')) || {};
        const names = new Map();
        ROUTINE_SUBJECTS.forEach(n => names.set(cleanKey(n), n));
        Object.entries(master).forEach(([k, v]) => names.set(k, (v && v.name) || k));

        const ex1 = asList(await getJSON('cpscl_ssc27_exams'));
        const ex2 = asList(await getJSON('cpscl_exams'));
        const m = new Map();
        [...ex2, ...ex1].forEach(x => { if (x && x.id) m.set(String(x.id), x); });
        examList = Array.from(m.values()).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
        examList.forEach(ex => Object.keys(ex.subjects || {}).forEach(s => { if (!names.has(cleanKey(s))) names.set(cleanKey(s), s); }));

        subjectsMaster = Array.from(names.entries()).map(([key, name]) => ({ key, name }));
    }

    // ---------- main view ----------
    window.openTeacherEval = async function (tab, el) {
        document.querySelectorAll('.trust-sub-link').forEach(l => l.classList.remove('active'));
        if (el) el.classList.add('active');
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const top = document.getElementById('top-title');
        if (top) top.innerText = "CPSCL - Teacher Evaluation & Duty";

        const mw = document.querySelector('.main-wrapper');
        if (!mw) return;
        let view = document.getElementById('cpscl-te-main-view');
        if (!view) {
            view = document.createElement('div');
            view.id = 'cpscl-te-main-view';
            view.className = 'view-panel';
            mw.appendChild(view);
        }
        view.classList.add('active');
        view.innerHTML = `<div class="te-wrap"><div style="padding:40px;text-align:center;color:#64748b;">Loading from cloud...</div></div>`;
        await loadAll();
        renderShell(tab || 'dir');
    };

    function renderShell(tab) {
        const view = document.getElementById('cpscl-te-main-view');
        view.innerHTML = `
        <div class="te-wrap">
            <div class="te-head"><h1><i class="fa-solid fa-chalkboard-user" style="color:#7c3aed"></i> Teacher Evaluation &amp; Duty</h1>
                <span style="font-size:.8rem;font-weight:700;color:#6d28d9;">${teachers.length} teachers • ${Object.keys(assignments).length} teaching assignments</span></div>
            <div class="te-tabs">
                <button class="te-tab ${tab === 'dir' ? 'active' : ''}" onclick="window.openTeacherEval('dir')">Teacher Directory</button>
                <button class="te-tab ${tab === 'duty' ? 'active' : ''}" onclick="window.openTeacherEval('duty')">Exam Duty Assignment</button>
            </div>
            <div id="te-body"></div>
        </div>
        <div class="te-modal" id="te-modal"><div class="te-modal-box" id="te-modal-box"></div></div>`;
        if (tab === 'dir') renderDirectory(); else renderDuty();
    }

    // ---------- Teacher Directory ----------
    function teacherAssignments(tid) {
        return Object.values(assignments).filter(a => a && a.teacherId === tid);
    }

    function renderDirectory() {
        const body = document.getElementById('te-body');
        if (!teachers.length) {
            body.innerHTML = `<div class="te-card" style="color:#b45309;font-weight:700;">No teachers found. Checked: ${TEACHER_PATHS.join(', ')}. Edit TEACHER_PATHS at the top of teacher_evaluation_manager.js if your teacher collection has a different name.</div>`;
            return;
        }
        const rows = teachers.map(t => {
            const tid = teacherId(t);
            const mine = teacherAssignments(tid);
            const bySub = {};
            mine.forEach(a => { (bySub[a.subject] = bySub[a.subject] || []).push(a.group.replace(/^Group\s*/i, '')); });
            const chips = Object.keys(bySub).map(s => `<span class="te-chip">${esc(s)}: ${esc(bySub[s].join(', '))}</span>`).join('') || '<span style="color:#94a3b8;">Not assigned</span>';
            return `<tr><td><strong>${esc(tid)}</strong></td><td>${esc(teacherName(t))}</td><td>${chips}</td>
                <td style="text-align:right;"><button class="te-btn" onclick="window.teOpenAssign('${esc(tid)}')">Assign Subjects</button></td></tr>`;
        }).join('');
        body.innerHTML = `<div class="te-card"><div class="te-title"><span>Teacher Directory</span>
            <input class="te-ctl" placeholder="Search..." oninput="document.querySelectorAll('#te-dir-tbody tr').forEach(r=>r.style.display=r.innerText.toLowerCase().includes(this.value.toLowerCase())?'':'none')"></div>
            <div style="overflow-x:auto"><table class="te-table"><thead><tr><th>EMP ID</th><th>Name</th><th>Teaching (Subject: Groups)</th><th></th></tr></thead>
            <tbody id="te-dir-tbody">${rows}</tbody></table></div></div>`;
    }

    // ---------- Matrix modal ----------
    window.teOpenAssign = function (tid) {
        modalTeacher = teachers.find(t => teacherId(t) === tid);
        if (!modalTeacher) return;
        modalRows = {};
        teacherAssignments(tid).forEach(a => {
            (modalRows[a.subject] = modalRows[a.subject] || new Set()).add(a.group);
        });
        renderModal();
        document.getElementById('te-modal').style.display = 'flex';
    };

    window.teCloseModal = function () { document.getElementById('te-modal').style.display = 'none'; modalTeacher = null; };

    // who else owns (subject, group)?
    function ownerOf(subject, group, tid) {
        const a = assignments[cleanKey(`${tid}_${subject}_${group}`)];
        const hit = Object.values(assignments).find(x => x && norm(x.subject) === norm(subject) && x.group === group && x.teacherId !== tid);
        return a ? null : (hit || null);
    }

    function renderModal() {
        const tid = teacherId(modalTeacher);
        const used = Object.keys(modalRows);
        const options = subjectsMaster.filter(s => !used.includes(s.name))
            .map(s => `<option value="${esc(s.name)}">${esc(s.name)}</option>`).join('');

        const head = GROUPS.map(g => `<th class="te-cell">${esc(g.replace(/^Group\s*/i, ''))}</th>`).join('');
        const rows = used.map(sub => {
            const cells = GROUPS.map(g => {
                const other = ownerOf(sub, g, tid);
                const checked = modalRows[sub].has(g);
                return `<td class="te-cell"><input type="checkbox" ${checked ? 'checked' : ''} ${other ? 'disabled' : ''}
                    onchange="window.teToggle('${esc(sub)}','${esc(g)}',this.checked)">
                    ${other ? `<div class="te-warn">Taken: ${esc(other.teacherName)}</div>` : ''}</td>`;
            }).join('');
            return `<tr><td><strong>${esc(sub)}</strong></td>${cells}
                <td><button class="te-btn ghost" onclick="window.teRemoveRow('${esc(sub)}')">✕</button></td></tr>`;
        }).join('') || `<tr><td colspan="${GROUPS.length + 2}" style="text-align:center;color:#94a3b8;">No subjects yet. Add one above.</td></tr>`;

        document.getElementById('te-modal-box').innerHTML = `
            <div class="te-title"><span>Assign Subjects: ${esc(teacherName(modalTeacher))} (${esc(tid)})</span>
                <button class="te-btn ghost" onclick="window.teCloseModal()">✕</button></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
                <select id="te-sub-pick" class="te-ctl" style="min-width:200px;"><option value="">-- Pick subject --</option>${options}</select>
                <button class="te-btn" onclick="window.teAddPicked()">Add</button>
                <input id="te-sub-new" class="te-ctl" placeholder="Or new custom subject...">
                <button class="te-btn green" onclick="window.teAddCustom()">+ New Subject</button>
            </div>
            <div style="overflow-x:auto"><table class="te-table"><thead><tr><th>Subject</th>${head}<th></th></tr></thead><tbody>${rows}</tbody></table></div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px;">
                <button class="te-btn ghost" onclick="window.teCloseModal()">Cancel</button>
                <button class="te-btn" id="te-save-btn" onclick="window.teSaveAssignments()">Save</button>
            </div>`;
    }

    window.teToggle = function (sub, g, on) {
        if (!modalRows[sub]) modalRows[sub] = new Set();
        on ? modalRows[sub].add(g) : modalRows[sub].delete(g);
    };
    window.teRemoveRow = function (sub) { delete modalRows[sub]; renderModal(); };
    window.teAddPicked = function () {
        const v = document.getElementById('te-sub-pick').value;
        if (!v) return;
        if (!modalRows[v]) modalRows[v] = new Set();
        renderModal();
    };
    window.teAddCustom = async function () {
        const raw = document.getElementById('te-sub-new').value.trim();
        if (!raw) return;
        const key = cleanKey(raw);
        const existing = subjectsMaster.find(s => norm(s.name) === norm(raw));
        const name = existing ? existing.name : raw;
        if (!existing) {
            try {
                await patchJSON('subjects_master', { [key]: { name: raw, createdAt: new Date().toISOString() } });
                subjectsMaster.push({ key, name: raw });
            } catch (e) { alert("Could not save subject: " + e.message); return; }
        }
        if (!modalRows[name]) modalRows[name] = new Set();
        renderModal();
    };

    window.teSaveAssignments = async function () {
        if (!modalTeacher) return;
        const tid = teacherId(modalTeacher), tname = teacherName(modalTeacher);
        const patch = {};
        const wanted = new Set();

        Object.keys(modalRows).forEach(sub => {
            modalRows[sub].forEach(g => {
                const key = cleanKey(`${tid}_${sub}_${g}`);
                wanted.add(key);
                if (!assignments[key]) patch[key] = { teacherId: tid, teacherName: tname, subject: sub, group: g, updatedAt: new Date().toISOString() };
            });
        });
        // unticked / removed -> null deletes only this teacher's own lines
        Object.entries(assignments).forEach(([key, a]) => {
            if (a && a.teacherId === tid && !wanted.has(key)) patch[key] = null;
        });

        // final collision guard against a fresh read
        const fresh = (await getJSON('teaching_assignments')) || {};
        for (const [key, val] of Object.entries(patch)) {
            if (!val) continue;
            const clash = Object.values(fresh).find(x => x && norm(x.subject) === norm(val.subject) && x.group === val.group && x.teacherId !== tid);
            if (clash) { alert(`${val.subject} / ${val.group} was just taken by ${clash.teacherName}. Please reopen and review.`); return; }
        }

        const btn = document.getElementById('te-save-btn');
        btn.disabled = true; btn.innerText = 'Saving...';
        try {
            if (Object.keys(patch).length) await patchJSON('teaching_assignments', patch);
            assignments = (await getJSON('teaching_assignments')) || {};
            window.teCloseModal();
            renderShell('dir');
        } catch (e) {
            alert("Save failed: " + e.message);
            btn.disabled = false; btn.innerText = 'Save';
        }
    };

    // ---------- Exam Duty Assignment ----------
    function renderDuty() {
        const body = document.getElementById('te-body');
        const opts = examList.map(e => `<option value="${esc(e.id)}">${esc(e.name)} (${esc(e.class || '')}) ${esc(e.date || '')}</option>`).join('');
        body.innerHTML = `<div class="te-card">
            <div class="te-title"><span>One-Click Auto-Assign Exam Duties</span></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
                <select id="te-duty-exam" class="te-ctl" style="min-width:300px;">${opts || '<option value="">No exams</option>'}</select>
                <button class="te-btn" onclick="window.teBuildDutyPlan()">Auto-Assign (Preview)</button>
                <button class="te-btn green" id="te-confirm-duty" style="display:none;" onclick="window.teConfirmDuty()">Confirm &amp; Save</button>
            </div>
            <div id="te-duty-out" style="overflow-x:auto;"></div></div>`;
    }

    window.teBuildDutyPlan = async function () {
        const examId = document.getElementById('te-duty-exam').value;
        const exam = examList.find(e => e.id === examId);
        const out = document.getElementById('te-duty-out');
        if (!exam) return;

        assignments = (await getJSON('teaching_assignments')) || {};
        const lookup = new Map();
        Object.values(assignments).forEach(a => { if (a) lookup.set(`${norm(a.subject)}|${a.group}`, a); });

        const groups = (exam.groups && exam.groups.length ? exam.groups.map(g => g.name) : GROUPS);
        dutyPlan = [];
        Object.keys(exam.subjects || {}).forEach(sub => {
            groups.forEach(g => {
                const hit = lookup.get(`${norm(sub)}|${g}`);
                dutyPlan.push({ subject: sub, group: g, teacherId: hit ? hit.teacherId : null, teacherName: hit ? hit.teacherName : null });
            });
        });

        const matched = dutyPlan.filter(p => p.teacherId).length;
        out.innerHTML = `<div style="font-weight:700;margin-bottom:8px;color:#334155;">${matched} of ${dutyPlan.length} duties matched</div>
            <table class="te-table"><thead><tr><th>Subject</th><th>Group</th><th>Teacher</th></tr></thead><tbody>` +
            dutyPlan.map(p => `<tr><td>${esc(p.subject)}</td><td>${esc(p.group)}</td>
                <td>${p.teacherId ? `<strong>${esc(p.teacherName)}</strong> <small style="color:#64748b;">(${esc(p.teacherId)})</small>` : '<span class="te-warn">No teacher assigned</span>'}</td></tr>`).join('') +
            `</tbody></table>`;
        document.getElementById('te-confirm-duty').style.display = matched ? 'inline-flex' : 'none';
    };

    window.teConfirmDuty = async function () {
        const examId = document.getElementById('te-duty-exam').value;
        const patch = {};
        dutyPlan.filter(p => p.teacherId).forEach(p => {
            patch[cleanKey(`${p.subject}_${p.group}`)] = {
                subject: p.subject, group: p.group, teacherId: p.teacherId, teacherName: p.teacherName,
                source: 'auto-assign', assignedAt: new Date().toISOString()
            };
        });
        if (!Object.keys(patch).length) return;
        if (!confirm(`Save ${Object.keys(patch).length} duty assignments for this exam?`)) return;
        try {
            await patchJSON(`exam_teacher_assignments/${examId}`, patch);
            alert("Exam duties saved successfully.");
        } catch (e) { alert("Save failed: " + e.message); }
    };

    // ---------- Optional: show subject teacher on SSC-27 blank sheet (no edit to ssc27 file) ----------
    const origBlankPrint = window.executeSSC27BlankPrint;
    if (typeof origBlankPrint === 'function') {
        window.executeSSC27BlankPrint = async function () {
            let teacherLabel = '';
            try {
                const g = document.getElementById('s27ModalGroupSelect').value;
                const s = document.getElementById('s27ModalSubjectSelect').value;
                const all = (await getJSON('teaching_assignments')) || {};
                const hit = Object.values(all).find(a => a && a.group === g && norm(a.subject) === norm(s));
                if (hit) teacherLabel = hit.teacherName;
            } catch (e) { }
            origBlankPrint();
            if (teacherLabel) {
                const f = document.getElementById('s27-print-frame');
                const bar = f && f.contentWindow.document.querySelector('.meta-bar');
                if (bar) bar.insertAdjacentHTML('beforeend', `<div>Teacher: ${esc(teacherLabel)}</div>`);
            }
        };
    }

    function init() { injectStyles(); injectSidebar(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else setTimeout(init, 400);
})();
