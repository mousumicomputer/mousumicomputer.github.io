/* ==========================================================================
   MODULE: CPSCL Academic ERP
   SUB-SECTION: Teacher Evaluation, PIN Management & Duty Suite (Phase 2 & 3)
   Path: cpscl/teacher_evaluation_manager.js
   Architecture: 100% Direct Firebase REST | Integrated with CPSCL_MASTER
   Features:
     - 22 Individual Master Subjects Integration (Zero Combined Slots)
     - Teacher PIN Reset to 2212 & Mobile Authentication State
     - Student Religion Setup (1-Click Islam / Hinduism Toggle for IME / HME)
     - Subject & Group Assignment Matrix with Collision Warnings
     - 1-Click Auto-Assign Exam Duty Engine
   Language: 100% Pure Corporate English (Zero Bengali)
   Safety: Strictly Additive | Preserves Historical Exams & Tabulations
   ========================================================================== */

(function () {
    "use strict";

    console.log("Loading CPSCL Teacher Evaluation & Duty Suite (v2.0 Phase 2/3 Active)...");

    const DB = "https://mousumi-computer-default-rtdb.firebaseio.com";
    const TEACHER_PATHS = ['cpscl_teachers', 'cpscl_teacher_directory', 'teachers'];

    // Frozen Group Definitions (Same as CPSCL_MASTER)
    const GROUPS = [
        'Group A (Science)', 'Group B (Science)', 'Group C (Science)',
        'Group D (Humanities)', 'Group D (Business Studies)'
    ];

    // Helper functions
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
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!r.ok) throw new Error(`Firebase write error (${r.status})`);
    }

    async function putJSON(path, body) {
        const r = await fetch(`${DB}/${path}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!r.ok) throw new Error(`Firebase write error (${r.status})`);
    }

    function teacherId(t) { return String(t.emp_id || t.empId || t.EMP_ID || t['EMP ID'] || t.teacher_id || t.id || '').trim(); }
    function teacherName(t) { return String(t.name || t.Name || t.teacher_name || t.name_english || 'Teacher').trim(); }
    function teacherMobile(t) { return String(t.mobile || t.Mobile || t.phone || t.contact || '').trim(); }

    // State Variables
    let teachers = [];
    let teacherPathUsed = 'cpscl_teachers';
    let assignments = {};      // key -> {teacherId, teacherName, subject, group}
    let subjectsMaster = [];   // [{key, name, code}]
    let examList = [];
    let allStudents = [];
    let modalTeacher = null;
    let modalRows = {};        // subject -> Set(group)
    let dutyPlan = [];

    // Inject Styles
    function injectStyles() {
        if (document.getElementById('cpscl-te-style')) return;
        const st = document.createElement('style');
        st.id = 'cpscl-te-style';
        st.innerHTML = `
        .te-wrap { padding: 15px 5px; font-family: 'Plus Jakarta Sans', sans-serif; }
        .te-head { background: #fff; border: 1.5px solid #e2e8f0; padding: 16px 24px; border-radius: 50px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
        .te-head h1 { font-size: 1.25rem; font-weight: 800; margin: 0; color: #0f172a; display: flex; align-items: center; gap: 10px; }
        .te-head h1 i { color: #7c3aed; }
        .te-badge { font-size: .8rem; font-weight: 700; color: #6d28d9; background: #f5f3ff; border: 1px solid #ddd6fe; padding: 5px 16px; border-radius: 50px; }
        .te-tabs { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
        .te-tab { background: #fff; border: 1.5px solid #cbd5e1; color: #64748b; padding: 10px 22px; border-radius: 50px; font-weight: 700; font-size: .88rem; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; }
        .te-tab:hover { border-color: #7c3aed; color: #7c3aed; }
        .te-tab.active { background: #7c3aed !important; border-color: #7c3aed !important; color: #fff !important; box-shadow: 0 4px 12px rgba(124,58,237,0.25); }
        .te-card { background: #fff; border: 1px solid #cbd5e1; border-radius: 16px; padding: 20px; margin-bottom: 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
        .te-title { font-weight: 800; color: #0f172a; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .te-table { width: 100%; border-collapse: collapse; }
        .te-table th { font-size: .74rem; text-transform: uppercase; color: #64748b; text-align: left; padding: 11px 12px; border-bottom: 1.5px solid #eef2f5; font-weight: 800; }
        .te-table td { padding: 11px 12px; border-bottom: 1px solid #eef2f5; font-size: .88rem; color: #334155; font-weight: 500; }
        .te-table tbody tr:hover { background-color: #f8fafc; }
        .te-ctl { height: 40px; border: 1.5px solid #cbd5e1; border-radius: 50px; padding: 0 16px; font-size: .88rem; outline: none; background: #fff; }
        .te-ctl:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .te-btn { height: 38px; padding: 0 18px; border-radius: 50px; border: none; font-weight: 700; font-size: .82rem; cursor: pointer; background: #7c3aed; color: #fff; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
        .te-btn:hover { background: #6d28d9; }
        .te-btn.ghost { background: #f1f5f9; color: #334155; }
        .te-btn.ghost:hover { background: #e2e8f0; }
        .te-btn.green { background: #059669; }
        .te-btn.green:hover { background: #047857; }
        .te-btn.orange { background: #ea580c; color: #fff; }
        .te-btn.orange:hover { background: #c2410c; }
        .te-chip { display: inline-block; background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; border-radius: 50px; padding: 3px 10px; font-size: .75rem; font-weight: 700; margin: 2px 3px 2px 0; }
        .te-pin-badge { display: inline-flex; align-items: center; gap: 5px; font-size: .75rem; font-weight: 800; padding: 3px 10px; border-radius: 50px; border: 1px solid #e2e8f0; }
        .te-pin-default { background: #fef3c7; color: #b45309; border-color: #fde68a; }
        .te-pin-custom { background: #ecfdf5; color: #047857; border-color: #a7f3d0; }
        .te-modal { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 999999; display: none; align-items: center; justify-content: center; padding: 12px; }
        .te-modal-box { background: #fff; border-radius: 20px; width: 100%; max-width: 860px; max-height: 92vh; overflow: auto; padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.25); }
        .te-warn { color: #dc2626; font-size: .72rem; font-weight: 700; margin-top: 2px; }
        .te-cell { text-align: center; }
        .te-cell input { width: 19px; height: 19px; accent-color: #7c3aed; cursor: pointer; }
        .te-cell input:disabled { opacity: .35; cursor: not-allowed; }
        .te-toggle-pill { display: inline-flex; align-items: center; gap: 8px; padding: 4px 14px; border-radius: 50px; font-size: .8rem; font-weight: 800; cursor: pointer; border: 1.5px solid #cbd5e1; background: #fff; }
        .te-toggle-pill.islam { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .te-toggle-pill.hindu { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
        @media(max-width:700px){.te-head{border-radius:20px}}
        `;
        document.head.appendChild(st);
    }

    // Sidebar Injection
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
                <li><a class="trust-sub-link" id="te-link-rel" onclick="window.openTeacherEval('religion', this)"><span class="trust-sub-indicator"></span><span>Student Religion Setup</span></a></li>
            </ul>`;
        if (examParent && examParent.parentElement && examParent !== sub) {
            examParent.parentElement.insertBefore(li, examParent.nextSibling);
        } else {
            sub.parentElement.appendChild(li);
        }
    }

    // Load Data
    async function loadAll() {
        // Run Master Data Seed if available
        if (window.CPSCL_MASTER && typeof window.CPSCL_MASTER.seed === 'function') {
            await window.CPSCL_MASTER.seed();
        }

        // 1. Load Teachers
        teachers = [];
        for (const p of TEACHER_PATHS) {
            const d = await getJSON(p);
            const list = asList(d).filter(t => t && typeof t === 'object' && teacherId(t));
            if (list.length) {
                teachers = list;
                teacherPathUsed = p;
                break;
            }
        }

        // 2. Load Teaching Assignments
        assignments = (await getJSON('teaching_assignments')) || {};

        // 3. Load Master Subjects
        let masterSubjectsMap = new Map();
        if (window.CPSCL_MASTER && Array.isArray(window.CPSCL_MASTER.SUBJECTS)) {
            window.CPSCL_MASTER.SUBJECTS.forEach(s => {
                masterSubjectsMap.set(cleanKey(s.name), { key: s.key, name: s.name, code: s.code });
            });
        }

        const cloudMaster = (await getJSON('subjects_master')) || {};
        Object.entries(cloudMaster).forEach(([k, v]) => {
            if (v && v.name && !masterSubjectsMap.has(cleanKey(v.name))) {
                masterSubjectsMap.set(k, { key: k, name: v.name, code: v.code || v.name });
            }
        });

        subjectsMaster = Array.from(masterSubjectsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

        // 4. Load Exams
        const ex1 = asList(await getJSON('cpscl_ssc27_exams'));
        const ex2 = asList(await getJSON('cpscl_exams'));
        const exMap = new Map();
        [...ex2, ...ex1].forEach(x => { if (x && x.id) exMap.set(String(x.id), x); });
        examList = Array.from(exMap.values()).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

        // 5. Load Students
        const stdRaw = await getJSON('cpscl_students');
        allStudents = asList(stdRaw).filter(s => {
            const cName = String(s.class_name || s.class || s['Class Name *'] || '').trim().toLowerCase();
            const bName = String(s.section_batch || s.section || s.batch || s['Section/Batch *'] || '').trim().toLowerCase();
            return (cName.includes('10') || cName.includes('ssc') || bName.includes('ssc') || bName.includes('27')) && !cName.includes('8');
        });
    }

    // Main Open View
    window.openTeacherEval = async function (tab, el) {
        document.querySelectorAll('.trust-sub-link').forEach(l => l.classList.remove('active'));
        if (el) el.classList.add('active');
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const top = document.getElementById('top-title');
        if (top) top.innerText = "CPSCL - Teacher Evaluation & Duty Suite";

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
        view.innerHTML = `<div class="te-wrap"><div style="padding:40px;text-align:center;color:#64748b;"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading data from Cloud...</div></div>`;
        await loadAll();
        renderShell(tab || 'dir');
    };

    function renderShell(tab) {
        const view = document.getElementById('cpscl-te-main-view');
        view.innerHTML = `
        <div class="te-wrap">
            <div class="te-head">
                <h1><i class="fa-solid fa-chalkboard-user"></i> Teacher Evaluation &amp; Duty Suite</h1>
                <span class="te-badge">${teachers.length} Active Teachers • ${Object.keys(assignments).length} Assignments</span>
            </div>
            <div class="te-tabs">
                <button class="te-tab ${tab === 'dir' ? 'active' : ''}" onclick="window.openTeacherEval('dir')">
                    <i class="fa-solid fa-users"></i> Teacher Directory &amp; PIN
                </button>
                <button class="te-tab ${tab === 'duty' ? 'active' : ''}" onclick="window.openTeacherEval('duty')">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Exam Duty Assignment
                </button>
                <button class="te-tab ${tab === 'religion' ? 'active' : ''}" onclick="window.openTeacherEval('religion')">
                    <i class="fa-solid fa-hands-praying"></i> Student Religion Setup
                </button>
            </div>
            <div id="te-body"></div>
        </div>
        <div class="te-modal" id="te-modal"><div class="te-modal-box" id="te-modal-box"></div></div>`;

        if (tab === 'dir') renderDirectory();
        else if (tab === 'duty') renderDuty();
        else if (tab === 'religion') renderReligionSetup();
    }

    // -------------------------------------------------------------
    // SUB-VIEW 1: Teacher Directory & PIN Management
    // -------------------------------------------------------------
    function teacherAssignments(tid) {
        return Object.values(assignments).filter(a => a && a.teacherId === tid);
    }

    function renderDirectory() {
        const body = document.getElementById('te-body');
        if (!teachers.length) {
            body.innerHTML = `<div class="te-card" style="color:#b45309;font-weight:700;">No teachers found in collections: ${TEACHER_PATHS.join(', ')}.</div>`;
            return;
        }

        const rows = teachers.map(t => {
            const tid = teacherId(t);
            const tmob = teacherMobile(t) || 'No Mobile';
            const mine = teacherAssignments(tid);
            const bySub = {};
            mine.forEach(a => {
                const subName = a.subject;
                (bySub[subName] = bySub[subName] || []).push(a.group.replace(/^Group\s*/i, ''));
            });

            const chips = Object.keys(bySub).map(s => `<span class="te-chip">${esc(s)}: ${esc(bySub[s].join(', '))}</span>`).join('') || '<span style="color:#94a3b8; font-weight:600;">Not assigned</span>';

            const isPinDefault = t.must_change_pin !== false;
            const pinBadge = isPinDefault
                ? `<span class="te-pin-badge te-pin-default"><i class="fa-solid fa-key"></i> Default PIN (2212)</span>`
                : `<span class="te-pin-badge te-pin-custom"><i class="fa-solid fa-shield-check"></i> Customized</span>`;

            return `
            <tr>
                <td><strong>${esc(tid)}</strong></td>
                <td><strong>${esc(teacherName(t))}</strong><br><small style="color:#64748b;"><i class="fa-solid fa-phone" style="font-size:10px;"></i> ${esc(tmob)}</small></td>
                <td>${pinBadge}</td>
                <td>${chips}</td>
                <td style="text-align:right; white-space:nowrap;">
                    <button class="te-btn ghost" style="margin-right:6px;" onclick="window.teResetTeacherPin('${esc(tid)}')" title="Reset PIN back to 2212">
                        <i class="fa-solid fa-rotate-left" style="color:#ea580c;"></i> Reset PIN
                    </button>
                    <button class="te-btn" onclick="window.teOpenAssign('${esc(tid)}')">
                        <i class="fa-solid fa-list-check"></i> Assign Subjects
                    </button>
                </td>
            </tr>`;
        }).join('');

        body.innerHTML = `
        <div class="te-card">
            <div class="te-title">
                <span>Teacher Directory &amp; Security PINs</span>
                <input class="te-ctl" style="width:280px;" placeholder="Search by name, ID or mobile..." oninput="document.querySelectorAll('#te-dir-tbody tr').forEach(r=>r.style.display=r.innerText.toLowerCase().includes(this.value.toLowerCase())?'':'none')">
            </div>
            <div style="overflow-x:auto">
                <table class="te-table">
                    <thead>
                        <tr>
                            <th>EMP ID</th>
                            <th>Teacher Name &amp; Mobile</th>
                            <th>PIN Status</th>
                            <th>Teaching (Subject: Groups)</th>
                            <th style="text-align:right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="te-dir-tbody">${rows}</tbody>
                </table>
            </div>
        </div>`;
    }

    // Reset PIN action
    window.teResetTeacherPin = async function (tid) {
        const teacher = teachers.find(t => teacherId(t) === tid);
        if (!teacher) return;

        if (!confirm(`Are you sure you want to reset PIN to default '2212' for ${teacherName(teacher)} (${tid})?\n\nThis will force the teacher to set a new PIN on their next login.`)) return;

        try {
            const updates = {
                pin: "2212",
                must_change_pin: true,
                session_epoch: Date.now(),
                pin_reset_at: new Date().toISOString()
            };

            await patchJSON(`${teacherPathUsed}/${tid}`, updates);
            teacher.must_change_pin = true;
            teacher.pin = "2212";

            alert(`Success: PIN for ${teacherName(teacher)} has been reset to '2212'.`);
            renderDirectory();
        } catch (e) {
            alert("Reset failed: " + e.message);
        }
    };

    // -------------------------------------------------------------
    // SUB-VIEW 2: Matrix Modal (Assign Subjects & Groups)
    // -------------------------------------------------------------
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

    window.teCloseModal = function () {
        document.getElementById('te-modal').style.display = 'none';
        modalTeacher = null;
    };

    function ownerOf(subject, group, tid) {
        const a = assignments[cleanKey(`${tid}_${subject}_${group}`)];
        const hit = Object.values(assignments).find(x => x && norm(x.subject) === norm(subject) && x.group === group && x.teacherId !== tid);
        return a ? null : (hit || null);
    }

    function renderModal() {
        const tid = teacherId(modalTeacher);
        const used = Object.keys(modalRows);

        // Populate options with 22 master subjects
        const options = subjectsMaster.filter(s => !used.includes(s.name))
            .map(s => `<option value="${esc(s.name)}">${esc(s.name)} (${esc(s.code)})</option>`).join('');

        const head = GROUPS.map(g => `<th class="te-cell">${esc(g.replace(/^Group\s*/i, ''))}</th>`).join('');

        const rows = used.map(sub => {
            const cells = GROUPS.map(g => {
                const other = ownerOf(sub, g, tid);
                const checked = modalRows[sub].has(g);
                return `
                    <td class="te-cell">
                        <input type="checkbox" ${checked ? 'checked' : ''} ${other ? 'disabled' : ''} onchange="window.teToggle('${esc(sub)}','${esc(g)}',this.checked)">
                        ${other ? `<div class="te-warn">Taken: ${esc(other.teacherName)}</div>` : ''}
                    </td>`;
            }).join('');

            return `
                <tr>
                    <td><strong>${esc(sub)}</strong></td>
                    ${cells}
                    <td style="text-align:right;"><button class="te-btn ghost" onclick="window.teRemoveRow('${esc(sub)}')"><i class="fa-solid fa-trash" style="color:#dc2626;"></i></button></td>
                </tr>`;
        }).join('') || `<tr><td colspan="${GROUPS.length + 2}" style="text-align:center;color:#94a3b8;padding:20px;">No subjects assigned yet. Select a subject from above.</td></tr>`;

        document.getElementById('te-modal-box').innerHTML = `
            <div class="te-title">
                <span>Assign Subjects &amp; Groups: ${esc(teacherName(modalTeacher))} (${esc(tid)})</span>
                <button class="te-btn ghost" onclick="window.teCloseModal()">✕</button>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;background:#f8fafc;padding:12px;border-radius:12px;border:1.5px solid #e2e8f0;">
                <select id="te-sub-pick" class="te-ctl" style="flex:1;min-width:240px;">
                    <option value="">-- Choose Individual Subject --</option>
                    ${options}
                </select>
                <button class="te-btn" onclick="window.teAddPicked()"><i class="fa-solid fa-plus"></i> Add Subject</button>
                <input id="te-sub-new" class="te-ctl" style="flex:1;min-width:180px;" placeholder="Or write custom subject...">
                <button class="te-btn green" onclick="window.teAddCustom()"><i class="fa-solid fa-folder-plus"></i> + Create New</button>
            </div>
            <div style="overflow-x:auto">
                <table class="te-table">
                    <thead><tr><th>Subject Name</th>${head}<th style="text-align:right;">Remove</th></tr></thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:18px;">
                <button class="te-btn ghost" onclick="window.teCloseModal()">Cancel</button>
                <button class="te-btn" id="te-save-btn" onclick="window.teSaveAssignments()">Save Assignments</button>
            </div>`;
    }

    window.teToggle = function (sub, g, on) {
        if (!modalRows[sub]) modalRows[sub] = new Set();
        on ? modalRows[sub].add(g) : modalRows[sub].delete(g);
    };

    window.teRemoveRow = function (sub) {
        delete modalRows[sub];
        renderModal();
    };

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
                await patchJSON('subjects_master', {
                    [key]: { name: raw, code: raw.substring(0, 6), active: true, createdAt: new Date().toISOString() }
                });
                subjectsMaster.push({ key, name: raw, code: raw.substring(0, 6) });
            } catch (e) {
                alert("Could not register subject: " + e.message);
                return;
            }
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
                if (!assignments[key]) {
                    patch[key] = { teacherId: tid, teacherName: tname, subject: sub, group: g, updatedAt: new Date().toISOString() };
                }
            });
        });

        // Unticked entries are deleted by setting them to null
        Object.entries(assignments).forEach(([key, a]) => {
            if (a && a.teacherId === tid && !wanted.has(key)) patch[key] = null;
        });

        const btn = document.getElementById('te-save-btn');
        btn.disabled = true; btn.innerText = 'Saving to Cloud...';
        try {
            if (Object.keys(patch).length) await patchJSON('teaching_assignments', patch);
            assignments = (await getJSON('teaching_assignments')) || {};
            window.teCloseModal();
            renderShell('dir');
        } catch (e) {
            alert("Save failed: " + e.message);
            btn.disabled = false; btn.innerText = 'Save Assignments';
        }
    };

    // -------------------------------------------------------------
    // SUB-VIEW 3: Student Religion Setup (Islam / Hinduism Toggle)
    // -------------------------------------------------------------
    function renderReligionSetup() {
        const body = document.getElementById('te-body');
        if (!allStudents.length) {
            body.innerHTML = `<div class="te-card" style="color:#b45309;font-weight:700;">No Class 10 / SSC 27 students found in cpscl_students.</div>`;
            return;
        }

        const counts = { islam: 0, hinduism: 0 };
        allStudents.forEach(st => {
            const rel = norm(st.religion) === 'hinduism' || norm(st.religion) === 'hindu' ? 'hinduism' : 'islam';
            counts[rel]++;
        });

        const rows = allStudents.map(st => {
            const sId = String(st.student_id || st.std_id || st.id || '').trim();
            const sName = String(st.student_name || st.name_english || st.name || 'Student').trim();
            const isHindu = norm(st.religion) === 'hinduism' || norm(st.religion) === 'hindu';
            const relLabel = isHindu ? 'Hinduism' : 'Islam';
            const pillClass = isHindu ? 'hindu' : 'islam';
            const icon = isHindu ? 'fa-om' : 'fa-star-and-crescent';

            return `
            <tr>
                <td><strong>${esc(sId)}</strong></td>
                <td><strong>${esc(sName)}</strong></td>
                <td><span style="font-weight:700; color:#64748b;">${esc(st.class_name || 'Class 10')} (${esc(st.section_batch || 'SSC 27')})</span></td>
                <td>
                    <button type="button" class="te-toggle-pill ${pillClass}" onclick="window.teToggleReligion('${esc(sId)}', ${!isHindu})">
                        <i class="fa-solid ${icon}"></i> <span>${relLabel}</span> (Click to Switch)
                    </button>
                </td>
            </tr>`;
        }).join('');

        body.innerHTML = `
        <div class="te-card">
            <div class="te-title">
                <div>
                    <span>Student Religion Setup (IME / HME Audience Filter)</span>
                    <div style="font-size:0.8rem; font-weight:700; color:#059669; margin-top:3px;">
                        Summary: Islam (${counts.islam} students) • Hinduism (${counts.hinduism} students)
                    </div>
                </div>
                <input class="te-ctl" style="width:280px;" placeholder="Search student by name or ID..." oninput="document.querySelectorAll('#te-rel-tbody tr').forEach(r=>r.style.display=r.innerText.toLowerCase().includes(this.value.toLowerCase())?'':'none')">
            </div>
            <div style="overflow-x:auto">
                <table class="te-table">
                    <thead>
                        <tr>
                            <th>Student ID</th>
                            <th>Student Name</th>
                            <th>Class &amp; Batch</th>
                            <th>Current Religion (1-Click Toggle)</th>
                        </tr>
                    </thead>
                    <tbody id="te-rel-tbody">${rows}</tbody>
                </table>
            </div>
        </div>`;
    }

    window.teToggleReligion = async function (sId, makeHindu) {
        const student = allStudents.find(s => String(s.student_id || s.std_id || s.id || '').trim() === sId);
        if (!student) return;

        const newRel = makeHindu ? "hinduism" : "islam";
        student.religion = newRel;

        try {
            await patchJSON(`cpscl_students/${sId}`, { religion: newRel });
            renderReligionSetup();
        } catch (e) {
            alert("Religion update failed: " + e.message);
        }
    };

    // -------------------------------------------------------------
    // SUB-VIEW 4: Exam Duty Auto-Assign Engine
    // -------------------------------------------------------------
    function renderDuty() {
        const body = document.getElementById('te-body');
        const opts = examList.map(e => `<option value="${esc(e.id)}">${esc(e.name)} (${esc(e.class || '')}) ${esc(e.date || '')}</option>`).join('');
        body.innerHTML = `
        <div class="te-card">
            <div class="te-title"><span>One-Click Auto-Assign Exam Duties</span></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
                <select id="te-duty-exam" class="te-ctl" style="min-width:300px;">${opts || '<option value="">No exams found</option>'}</select>
                <button class="te-btn" onclick="window.teBuildDutyPlan()"><i class="fa-solid fa-wand-magic-sparkles"></i> Auto-Assign (Preview)</button>
                <button class="te-btn green" id="te-confirm-duty" style="display:none;" onclick="window.teConfirmDuty()"><i class="fa-solid fa-cloud-arrow-up"></i> Confirm &amp; Save Duties</button>
            </div>
            <div id="te-duty-out" style="overflow-x:auto;"></div>
        </div>`;
    }

    window.teBuildDutyPlan = async function () {
        const examId = document.getElementById('te-duty-exam').value;
        const exam = examList.find(e => e.id === examId);
        const out = document.getElementById('te-duty-out');
        if (!exam) return;

        assignments = (await getJSON('teaching_assignments')) || {};
        const lookup = new Map();
        Object.values(assignments).forEach(a => {
            if (a) lookup.set(`${norm(a.subject)}|${a.group}`, a);
        });

        const groups = (exam.groups && exam.groups.length ? exam.groups.map(g => g.name) : GROUPS);
        dutyPlan = [];

        Object.keys(exam.subjects || {}).forEach(sub => {
            groups.forEach(g => {
                const hit = lookup.get(`${norm(sub)}|${g}`);
                dutyPlan.push({
                    subject: sub,
                    group: g,
                    teacherId: hit ? hit.teacherId : null,
                    teacherName: hit ? hit.teacherName : null
                });
            });
        });

        const matched = dutyPlan.filter(p => p.teacherId).length;
        out.innerHTML = `
            <div style="font-weight:700;margin-bottom:8px;color:#334155;">${matched} of ${dutyPlan.length} duties matched with permanent assignments</div>
            <table class="te-table">
                <thead><tr><th>Subject</th><th>Group</th><th>Assigned Responsible Teacher</th></tr></thead>
                <tbody>` +
            dutyPlan.map(p => `
                <tr>
                    <td><strong>${esc(p.subject)}</strong></td>
                    <td>${esc(p.group)}</td>
                    <td>${p.teacherId ? `<strong>${esc(p.teacherName)}</strong> <small style="color:#64748b;">(${esc(p.teacherId)})</small>` : '<span class="te-warn"><i class="fa-solid fa-triangle-exclamation"></i> No teacher assigned</span>'}</td>
                </tr>`).join('') +
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
        if (!confirm(`Save ${Object.keys(patch).length} duty assignments for this exam to Cloud?`)) return;
        try {
            await patchJSON(`exam_teacher_assignments/${examId}`, patch);
            alert("Success: Exam duties saved to Cloud successfully.");
        } catch (e) {
            alert("Save failed: " + e.message);
        }
    };

    // Optional: Blank Print Teacher Name Insertion
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

    function init() {
        injectStyles();
        injectSidebar();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else setTimeout(init, 350);
})();