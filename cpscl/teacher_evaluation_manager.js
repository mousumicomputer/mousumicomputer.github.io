/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Teacher Evaluation & Duty (শিক্ষক মূল্যায়ন ও দায়িত্ব বণ্টন)
   Path: cpscl/teacher_evaluation_manager.js
   Architecture: Strictly additive | Isolated view | Firebase Realtime Database
   Collections written (NEW only):
       teachers/{mobile}
       exam_teacher_assignments/{examId}
   Collections read (READ-ONLY, never modified):
       cpscl_ssc27_exams, cpscl_exam_marks
   Load order: add AFTER cpscl/ssc27_exam_manager.js in admin.html
   ========================================================================== */

(function () {
    'use strict';
    if (window.__TEV_LOADED__) return;
    window.__TEV_LOADED__ = true;

    console.log("Loading CPSCL Teacher Evaluation & Duty Suite...");

    /* ------------------------------------------------------------------
       CONFIG
       ------------------------------------------------------------------ */
    const CFG = {
        TEACHERS_PATH: 'teachers',
        ASSIGN_PATH: 'exam_teacher_assignments',
        EXAMS_PATH: 'cpscl_ssc27_exams',          // preparatory exams (read-only)
        MARKS_PATH: 'cpscl_exam_marks',           // mark-entry logs (read-only)
        DB_URL: 'https://mousumi-computer-default-rtdb.firebaseio.com',
        DEFAULT_PIN: '2212',
        LIVE_SUBMISSIONS: true                    // false = tracker shows everything as pending (mock)
    };

    const state = {
        teachers: [],
        exams: [],
        search: '',
        showPins: false,
        section: 'directory',
        editKey: null,
        assignExamId: '',
        assignDraft: {},
        trackExamId: ''
    };

    /* ------------------------------------------------------------------
       HELPERS
       ------------------------------------------------------------------ */
    function esc(v) {
        return String(v === undefined || v === null ? '' : v).replace(/[&<>"']/g, ch => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]));
    }

    function toast(msg, type) {
        if (typeof window.showToast === 'function') window.showToast(msg, type || 'info');
        else console.log('[TEV]', type, msg);
    }

    function confirmBox(opts) {
        if (typeof window.showConfirmModal === 'function') {
            window.showConfirmModal(opts);
        } else if (window.confirm(opts.message || opts.title)) {
            opts.onConfirm && opts.onConfirm();
        }
    }

    function loader(on, msg) {
        if (on && typeof window.showLoader === 'function') window.showLoader(msg || 'Please wait...');
        if (!on && typeof window.hideLoader === 'function') window.hideLoader();
    }

    /** Accepts 1712345678 / 8801712345678 / +880 1712-345678 / 01712345678 -> 01712345678 or '' */
    function normalizeMobile(raw) {
        let d = String(raw === undefined || raw === null ? '' : raw).replace(/\D/g, '');
        if (d.startsWith('880') && d.length === 13) d = d.slice(2);
        if (d.length === 10 && d[0] === '1') d = '0' + d;
        return /^01\d{9}$/.test(d) ? d : '';
    }

    function nowIso() { return new Date().toISOString(); }
    function cleanRec(t) { const c = { ...t }; delete c._key; return c; }

    /* ------------------------------------------------------------------
       FIREBASE ACCESS (re-uses the bridge exposed by admin.html)
       ------------------------------------------------------------------ */
    function getDb() {
        if (typeof window.getDatabase !== 'function' || typeof window.ref !== 'function' || typeof window.get !== 'function') {
            throw new Error('Firebase is still connecting. Please wait a moment and try again.');
        }
        return window.getDatabase();
    }

    async function dbRead(path) {
        const snap = await window.get(window.ref(getDb(), path));
        return snap.exists() ? snap.val() : null;
    }

    async function dbWrite(path, data) {
        if (typeof window.writeToFirebase !== 'function') {
            throw new Error('Firebase write bridge is not ready yet. Please wait a moment and try again.');
        }
        return window.writeToFirebase(path, data);   // pass null to delete
    }

    /* ------------------------------------------------------------------
       DATA LOADERS
       ------------------------------------------------------------------ */
    async function loadTeachers() {
        const raw = await dbRead(CFG.TEACHERS_PATH);
        const list = raw ? Object.entries(raw).map(([k, v]) => ({ ...v, mobile: (v && v.mobile) || k, _key: k })) : [];
        list.sort((a, b) =>
            ((Number(a.sl) || 1e9) - (Number(b.sl) || 1e9)) ||
            String(a.name || '').localeCompare(String(b.name || ''))
        );
        state.teachers = list;
        return list;
    }

    async function loadExams() {
        let raw = null;
        try {
            raw = await dbRead(CFG.EXAMS_PATH);
        } catch (e) {
            // Fallback: public REST read (same approach used by ssc27_exam_manager.js)
            const res = await fetch(`${CFG.DB_URL}/${CFG.EXAMS_PATH}.json`);
            if (res.ok) raw = await res.json();
        }
        const list = raw ? (Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw)) : [];
        list.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));  // newest first
        state.exams = list;
        return list;
    }

    /* ------------------------------------------------------------------
       STYLES (prefix tev- ; emerald palette identical to SSC-27 suite)
       ------------------------------------------------------------------ */
    function injectStyles() {
        if (document.getElementById('tev-styles')) return;
        const st = document.createElement('style');
        st.id = 'tev-styles';
        st.innerHTML = `
            .tev-wrap { padding: 15px 5px; font-family: 'Plus Jakarta Sans', 'Tiro Bangla', sans-serif; color: #0f172a; }
            .tev-header { background:#fff; border:1px solid #e2e8f0; padding:16px 25px; border-radius:50px; display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,.03); flex-wrap:wrap; gap:10px; }
            .tev-header h1 { font-size:1.3rem; font-weight:800; margin:0; display:flex; align-items:center; gap:10px; }
            .tev-header h1 i { color:#059669; }
            .tev-header small { display:block; font-size:.78rem; color:#64748b; font-weight:600; margin-top:2px; }
            .tev-badge { background:#ecfdf5; color:#059669; font-weight:700; font-size:.8rem; padding:6px 16px; border-radius:50px; border:1px solid #a7f3d0; }
            .tev-tabs { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
            .tev-tab { background:#fff; border:1.5px solid #cbd5e1; color:#64748b; padding:10px 22px; border-radius:50px; font-weight:700; font-size:.86rem; cursor:pointer; display:inline-flex; align-items:center; gap:8px; transition:.2s; user-select:none; }
            .tev-tab:hover { border-color:#059669; color:#059669; }
            .tev-tab.active { background:#059669; color:#fff; border-color:#059669; box-shadow:0 4px 12px rgba(5,150,105,.25); }
            .tev-section { display:none; }
            .tev-section.active { display:block; }
            .tev-card { background:#fff; border-radius:16px; border:1px solid #cbd5e1; padding:22px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,.04); }
            .tev-card-title { font-size:1.02rem; font-weight:700; border-bottom:2px solid #f1f5f9; padding-bottom:12px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
            .tev-card-title span { display:flex; align-items:center; gap:8px; }
            .tev-card-title i { color:#059669; }
            .tev-toolbar { display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
            .tev-toolbar-group { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
            .tev-input, .tev-select { height:40px; border:1.5px solid #cbd5e1; border-radius:50px; padding:0 16px; font-size:.88rem; outline:none; background:#fff; color:#0f172a; transition:.2s; font-family:inherit; }
            .tev-input:focus, .tev-select:focus { border-color:#059669; box-shadow:0 0 0 3px rgba(5,150,105,.1); }
            .tev-select { cursor:pointer; min-width:230px; }
            .tev-btn { height:40px; padding:0 18px; border-radius:50px; font-size:.82rem; font-weight:700; cursor:pointer; border:1.5px solid #cbd5e1; background:#fff; color:#475569; display:inline-flex; align-items:center; gap:7px; transition:.2s; font-family:inherit; }
            .tev-btn:hover { background:#f8fafc; border-color:#94a3b8; }
            .tev-btn-primary { background:#059669; border-color:#059669; color:#fff; box-shadow:0 2px 8px rgba(5,150,105,.25); }
            .tev-btn-primary:hover { background:#047857; border-color:#047857; }
            .tev-stats { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
            .tev-chip { background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:50px; padding:6px 16px; font-size:.8rem; font-weight:700; color:#475569; }
            .tev-chip b { color:#059669; margin-left:4px; }
            .tev-table-wrap { overflow-x:auto; border:1px solid #eef2f5; border-radius:10px; -webkit-overflow-scrolling:touch; }
            .tev-table { width:100%; border-collapse:collapse; min-width:860px; }
            .tev-table th { background:#fff; color:#64748b; font-size:.74rem; font-weight:700; text-transform:uppercase; padding:12px 14px; border-bottom:1.5px solid #eef2f5; text-align:left; white-space:nowrap; }
            .tev-table td { color:#334155; font-size:.86rem; font-weight:500; padding:11px 14px; border-bottom:1px solid #eef2f5; vertical-align:middle; }
            .tev-table tbody tr:hover { background:#f8fafc; }
            .tev-pill { display:inline-block; padding:3px 12px; border-radius:50px; font-size:.72rem; font-weight:800; }
            .tev-pill-on { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
            .tev-pill-off { background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; }
            .tev-pin { font-family:monospace; font-weight:800; letter-spacing:1px; background:#f1f5f9; padding:2px 10px; border-radius:6px; }
            .tev-icon-btn { width:34px; height:34px; border-radius:50px; border:1.5px solid #cbd5e1; background:#fff; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; font-size:.82rem; margin:0 2px; transition:.2s; }
            .tev-icon-btn.edit { color:#2563eb; } .tev-icon-btn.edit:hover { background:#eff6ff; border-color:#2563eb; }
            .tev-icon-btn.reset { color:#d97706; } .tev-icon-btn.reset:hover { background:#fef3c7; border-color:#d97706; }
            .tev-icon-btn.on { color:#dc2626; } .tev-icon-btn.on:hover { background:#fee2e2; border-color:#dc2626; }
            .tev-icon-btn.off { color:#16a34a; } .tev-icon-btn.off:hover { background:#dcfce7; border-color:#16a34a; }
            .tev-empty { text-align:center; padding:35px; color:#94a3b8; font-weight:600; }
            .tev-hint { font-size:.8rem; color:#64748b; font-weight:600; }
            .tev-cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; margin-bottom:18px; }
            .tev-stat-card { background:#fff; border:1.5px solid #e2e8f0; border-radius:50px; padding:12px 22px; display:flex; justify-content:space-between; align-items:center; }
            .tev-stat-card p { margin:0; font-size:11px; font-weight:800; color:#64748b; text-transform:uppercase; letter-spacing:.5px; }
            .tev-stat-card h3 { margin:0; font-size:1.25rem; font-weight:800; }
            .tev-progress { height:10px; background:#e2e8f0; border-radius:50px; overflow:hidden; min-width:120px; }
            .tev-progress > div { height:100%; border-radius:50px; transition:width .4s; }
            .tev-sub-chip { display:inline-block; margin:2px 4px 2px 0; padding:2px 10px; border-radius:50px; font-size:.72rem; font-weight:800; }
            .tev-sub-done { background:#dcfce7; color:#15803d; border:1px solid #bbf7d0; }
            .tev-sub-pend { background:#fef3c7; color:#b45309; border:1px solid #fde68a; }
            .tev-modal-overlay { position:fixed; inset:0; background:rgba(15,23,42,.55); backdrop-filter:blur(3px); z-index:999999; display:none; align-items:center; justify-content:center; padding:14px; }
            .tev-modal { background:#fff; border-radius:20px; width:100%; max-width:480px; padding:24px; box-shadow:0 20px 45px rgba(0,0,0,.25); max-height:90vh; overflow-y:auto; }
            .tev-modal h4 { margin:0 0 14px; font-size:1.05rem; font-weight:800; display:flex; align-items:center; gap:8px; }
            .tev-modal h4 i { color:#059669; }
            .tev-field { margin-bottom:12px; display:flex; flex-direction:column; gap:5px; }
            .tev-field label { font-size:.82rem; font-weight:700; }
            .tev-field .tev-input { width:100%; }
            .tev-modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:18px; border-top:1px solid #e2e8f0; padding-top:14px; }
            @media (max-width:1024px) { .tev-header { border-radius:20px; } .tev-tabs { flex-direction:column; } .tev-tab { width:100%; justify-content:center; } }
        `;
        document.head.appendChild(st);
    }

    /* ------------------------------------------------------------------
       SIDEBAR  (placed immediately after the Exam Manager block)
       ------------------------------------------------------------------ */
    function placeAfterExamManager() {
        const root = document.getElementById('tev-module-root');
        const examRoot = document.getElementById('trust-cpscl-exam-module-root');
        if (!root || !examRoot || !examRoot.parentNode) return;
        if (root.previousElementSibling !== examRoot) {
            examRoot.parentNode.insertBefore(root, examRoot.nextSibling);
        }
    }

    function injectSidebar(attempt) {
        attempt = attempt || 0;
        if (document.getElementById('tev-module-root')) return;

        const examRoot = document.getElementById('trust-cpscl-exam-module-root');
        if (!examRoot) {
            if (attempt < 120) setTimeout(() => injectSidebar(attempt + 1), 250);
            return;
        }

        const li = document.createElement('li');
        li.className = 'trust-module-wrapper expanded';
        li.id = 'tev-module-root';
        li.innerHTML = `
            <a class="trust-parent-btn" onclick="window.toggleTeacherEvalModule()">
                <div class="trust-parent-left">
                    <i class="fa-solid fa-chalkboard-user" style="color:#059669;"></i>
                    <span>Teacher Evaluation &amp; Duty</span>
                </div>
                <i class="fa-solid fa-chevron-down chevron-arrow"></i>
            </a>
            <ul class="trust-submenu-box" id="tev-submenu-items">
                <li><a class="trust-sub-link" id="sub-link-tev-directory" onclick="window.openTeacherEvalView(this, 'directory')">
                    <span class="trust-sub-indicator"></span><span>Teacher Directory &amp; PIN</span></a></li>
                <li><a class="trust-sub-link" id="sub-link-tev-assign" onclick="window.openTeacherEvalView(this, 'assign')">
                    <span class="trust-sub-indicator"></span><span>Exam Duty Assignment</span></a></li>
                <li><a class="trust-sub-link" id="sub-link-tev-tracker" onclick="window.openTeacherEvalView(this, 'tracker')">
                    <span class="trust-sub-indicator"></span><span>Activity &amp; Audit Tracker</span></a></li>
            </ul>
        `;
        examRoot.parentNode.insertBefore(li, examRoot.nextSibling);

        // Other modules may inject their own menu after Exam Manager later; re-assert our position.
        [1500, 4000, 8000].forEach(ms => setTimeout(placeAfterExamManager, ms));
    }

    window.toggleTeacherEvalModule = function () {
        const w = document.getElementById('tev-module-root');
        if (w) w.classList.toggle('expanded');
    };

    /* ------------------------------------------------------------------
       VIEW SHELL
       ------------------------------------------------------------------ */
    function ensureView() {
        let view = document.getElementById('tev-main-view');
        if (view) return view;
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return null;

        view = document.createElement('div');
        view.className = 'view-panel';
        view.id = 'tev-main-view';
        view.innerHTML = `
            <div class="tev-wrap">
                <div class="tev-header">
                    <h1><i class="fa-solid fa-chalkboard-user"></i>
                        <div>Teacher Evaluation &amp; Duty<small>শিক্ষক মূল্যায়ন ও দায়িত্ব বণ্টন</small></div>
                    </h1>
                    <div class="tev-badge"><i class="fa-solid fa-cloud-bolt"></i> Firebase Cloud Synced</div>
                </div>

                <div class="tev-tabs">
                    <button type="button" class="tev-tab" data-tab="directory"><i class="fa-solid fa-address-book"></i> Teacher Directory &amp; PIN</button>
                    <button type="button" class="tev-tab" data-tab="assign"><i class="fa-solid fa-clipboard-user"></i> Exam Duty Assignment</button>
                    <button type="button" class="tev-tab" data-tab="tracker"><i class="fa-solid fa-chart-line"></i> Activity &amp; Audit Tracker</button>
                </div>

                <div class="tev-section" id="tev-sec-directory"></div>
                <div class="tev-section" id="tev-sec-assign"></div>
                <div class="tev-section" id="tev-sec-tracker"></div>
            </div>

            <div class="tev-modal-overlay" id="tev-modal">
                <div class="tev-modal" id="tev-modal-box"></div>
            </div>
        `;
        mainWrapper.appendChild(view);

        view.addEventListener('click', onViewClick);
        view.addEventListener('input', onViewInput);
        view.addEventListener('change', onViewChange);
        return view;
    }

    window.openTeacherEvalView = function (element, section) {
        document.querySelectorAll('.trust-sub-link').forEach(l => l.classList.remove('active'));
        if (element) element.classList.add('active');
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

        const view = ensureView();
        if (!view) return;
        view.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = 'CPSCL - Teacher Evaluation & Duty';

        showSection(section || 'directory');
    };

    async function showSection(section) {
        state.section = section;
        document.querySelectorAll('#tev-main-view .tev-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === section));
        document.querySelectorAll('#tev-main-view .tev-section').forEach(s => s.classList.toggle('active', s.id === 'tev-sec-' + section));

        // keep the sidebar highlight in sync when switching through the inner tabs
        document.querySelectorAll('.trust-sub-link').forEach(l => l.classList.remove('active'));
        const link = document.getElementById('sub-link-tev-' + section);
        if (link) link.classList.add('active');

        const sec = document.getElementById('tev-sec-' + section);
        if (sec) sec.innerHTML = `<div class="tev-card"><div class="tev-empty"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:24px;color:#059669;"></i></div></div>`;

        try {
            if (section === 'directory') { await loadTeachers(); renderDirectory(); }
            if (section === 'assign') { await Promise.all([loadTeachers(), loadExams()]); await prepareAssign(); }
            if (section === 'tracker') { await Promise.all([loadTeachers(), loadExams()]); await prepareTracker(); }
        } catch (err) {
            console.error('[TEV] load error', err);
            if (sec) sec.innerHTML = `<div class="tev-card"><div class="tev-empty" style="color:#dc2626;">${esc(err.message)}</div></div>`;
            toast(err.message, 'error');
        }
    }

    /* ------------------------------------------------------------------
       EVENT DELEGATION
       ------------------------------------------------------------------ */
    function onViewClick(e) {
        const tab = e.target.closest('.tev-tab');
        if (tab) { showSection(tab.dataset.tab); return; }

        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const id = btn.dataset.id;

        switch (btn.dataset.act) {
            case 'refresh-dir': showSection('directory'); break;
            case 'toggle-pins': state.showPins = !state.showPins; renderDirectory(); break;
            case 'sample': downloadSample(); break;
            case 'upload': { const f = document.getElementById('tev-file'); if (f) f.click(); break; }
            case 'edit': openEditModal(id); break;
            case 'reset-pin': resetPin(id); break;
            case 'toggle-status': toggleStatus(id); break;
            case 'modal-close': closeModal(); break;
            case 'modal-save': saveEdit(); break;
            case 'save-assign': saveAssignments(); break;
            case 'clear-assign': state.assignDraft = {}; renderAssign(); break;
            case 'refresh-track': renderTracker(); break;
        }
    }

    function onViewInput(e) {
        if (e.target.id === 'tev-search') {
            state.search = e.target.value.trim().toLowerCase();
            renderDirectoryTable();
        }
    }

    function onViewChange(e) {
        const t = e.target;
        if (t.id === 'tev-file') { handleExcelFile(t.files && t.files[0]); t.value = ''; return; }
        if (t.id === 'tev-assign-exam') { state.assignExamId = t.value; prepareAssign(true); return; }
        if (t.id === 'tev-track-exam') { state.trackExamId = t.value; renderTracker(); return; }
        if (t.dataset && t.dataset.sub !== undefined && t.classList.contains('tev-assign-sel')) {
            if (t.value) state.assignDraft[t.dataset.sub] = t.value;
            else delete state.assignDraft[t.dataset.sub];
            updateAssignCounter();
        }
    }

    function closeModal() {
        const m = document.getElementById('tev-modal');
        if (m) m.style.display = 'none';
        state.editKey = null;
    }

    /* ==================================================================
       SUB-VIEW 1 : TEACHER DIRECTORY & BULK EXCEL IMPORT
       ================================================================== */
    function renderDirectory() {
        const sec = document.getElementById('tev-sec-directory');
        if (!sec) return;
        const total = state.teachers.length;
        const active = state.teachers.filter(t => t.status !== 'inactive').length;

        sec.innerHTML = `
            <div class="tev-card">
                <div class="tev-card-title">
                    <span><i class="fa-solid fa-address-book"></i> Teacher Directory &amp; PIN Management</span>
                    <div class="tev-toolbar-group">
                        <button type="button" class="tev-btn" data-act="sample"><i class="fa-solid fa-download"></i> Sample Excel</button>
                        <button type="button" class="tev-btn tev-btn-primary" data-act="upload"><i class="fa-solid fa-file-excel"></i> Excel Upload</button>
                        <input type="file" id="tev-file" accept=".xlsx,.xls" style="display:none;">
                    </div>
                </div>

                <div class="tev-stats">
                    <div class="tev-chip">Total Teachers<b>${total}</b></div>
                    <div class="tev-chip">Active<b>${active}</b></div>
                    <div class="tev-chip">Inactive<b style="color:#dc2626;">${total - active}</b></div>
                    <div class="tev-chip" style="border-style:dashed;">Default PIN<b>${CFG.DEFAULT_PIN}</b></div>
                </div>

                <div class="tev-toolbar">
                    <input type="text" id="tev-search" class="tev-input" style="width:300px;max-width:100%;"
                           placeholder="Search name, EMP ID, subject or mobile..." value="${esc(state.search)}">
                    <div class="tev-toolbar-group">
                        <button type="button" class="tev-btn" data-act="toggle-pins">
                            <i class="fa-solid ${state.showPins ? 'fa-eye-slash' : 'fa-eye'}"></i> ${state.showPins ? 'Hide PINs' : 'Show PINs'}
                        </button>
                        <button type="button" class="tev-btn" data-act="refresh-dir"><i class="fa-solid fa-arrows-rotate"></i> Refresh</button>
                    </div>
                </div>

                <div class="tev-hint" style="margin-bottom:10px;">
                    Excel headers must be exactly: <b>SL | EMP ID | Name | Designation | Subject | Mobile</b>.
                    Re-importing an existing mobile updates profile details only &mdash; PIN and first-login flag are never touched.
                </div>

                <div class="tev-table-wrap">
                    <table class="tev-table">
                        <thead>
                            <tr>
                                <th>SL</th><th>EMP ID</th><th>Teacher Name</th><th>Designation</th><th>Subject</th>
                                <th>Mobile (Username)</th><th>PIN</th><th>Status</th><th style="text-align:right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="tev-dir-tbody"></tbody>
                    </table>
                </div>
            </div>
        `;
        renderDirectoryTable();
    }

    function renderDirectoryTable() {
        const tbody = document.getElementById('tev-dir-tbody');
        if (!tbody) return;

        const q = state.search;
        const list = state.teachers.filter(t => {
            if (!q) return true;
            return [t.name, t.emp_id, t.subject, t.mobile, t.designation].join(' ').toLowerCase().includes(q);
        });

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" class="tev-empty">${state.teachers.length ? 'No teacher matches your search.' : "No teachers yet. Click 'Excel Upload' to import the teacher list."}</td></tr>`;
            return;
        }

        tbody.innerHTML = list.map((t, i) => {
            const isActive = t.status !== 'inactive';
            const pinTxt = state.showPins ? esc(t.pin || '-') : '••••';
            const firstLogin = t.is_first_login ? ' <i class="fa-solid fa-key" title="Must change PIN on first login" style="color:#d97706;font-size:.7rem;"></i>' : '';
            return `
                <tr>
                    <td><strong>${i + 1}</strong></td>
                    <td>${esc(t.emp_id) || '-'}</td>
                    <td><strong>${esc(t.name)}</strong></td>
                    <td>${esc(t.designation) || '-'}</td>
                    <td>${esc(t.subject) || '<span style="color:#94a3b8;">Unassigned</span>'}</td>
                    <td>${esc(t.mobile)}</td>
                    <td><span class="tev-pin">${pinTxt}</span>${firstLogin}</td>
                    <td><span class="tev-pill ${isActive ? 'tev-pill-on' : 'tev-pill-off'}">${isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style="text-align:right;white-space:nowrap;">
                        <button type="button" class="tev-icon-btn edit" data-act="edit" data-id="${esc(t._key)}" title="Edit"><i class="fa-solid fa-pen"></i></button>
                        <button type="button" class="tev-icon-btn reset" data-act="reset-pin" data-id="${esc(t._key)}" title="Reset PIN to ${CFG.DEFAULT_PIN}"><i class="fa-solid fa-key"></i></button>
                        <button type="button" class="tev-icon-btn ${isActive ? 'on' : 'off'}" data-act="toggle-status" data-id="${esc(t._key)}" title="${isActive ? 'Deactivate' : 'Activate'}"><i class="fa-solid ${isActive ? 'fa-user-slash' : 'fa-user-check'}"></i></button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /* ---------- Sample Excel ---------- */
    function downloadSample() {
        if (typeof XLSX === 'undefined') { toast('Excel library is still loading, please wait...', 'warning'); return; }
        const ws = XLSX.utils.aoa_to_sheet([
            ['SL', 'EMP ID', 'Name', 'Designation', 'Subject', 'Mobile'],
            [1, 'T-001', 'Md. Example Teacher', 'Assistant Teacher', 'Physics', '01712345678']
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
        XLSX.writeFile(wb, 'CPSCL_Teacher_Import_Template.xlsx');
    }

    /* ---------- Excel import ---------- */
    async function handleExcelFile(file) {
        if (!file) return;
        if (typeof XLSX === 'undefined') { toast('Excel library is still loading, please wait...', 'warning'); return; }
        if (!/\.(xlsx|xls)$/i.test(file.name)) { toast('Please upload a valid Excel file (.xlsx / .xls).', 'error'); return; }

        try {
            const buf = await file.arrayBuffer();
            const wb = XLSX.read(buf, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });

            if (!rawRows.length) { toast('The Excel sheet contains no rows.', 'error'); return; }

            // Normalise headers: "EMP ID" -> "empid"
            const rows = rawRows.map(r => {
                const n = {};
                Object.keys(r).forEach(k => { n[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = r[k]; });
                return n;
            });
            if (!('name' in rows[0]) || !('mobile' in rows[0])) {
                toast('Invalid headers. Expected: SL | EMP ID | Name | Designation | Subject | Mobile', 'error');
                return;
            }

            await loadTeachers();
            const existing = new Map(state.teachers.map(t => [t._key, t]));
            const seen = new Set();
            const plan = [];
            const invalid = [];
            let dupInSheet = 0;

            rows.forEach((r, idx) => {
                const rowNo = idx + 2;                       // Excel row number (header = 1)
                const name = String(r.name || '').trim();
                const mobile = normalizeMobile(r.mobile);
                if (!name && !String(r.mobile || '').trim()) return;   // fully blank line
                if (!name || !mobile) { invalid.push(rowNo); return; }
                if (seen.has(mobile)) { dupInSheet++; return; }
                seen.add(mobile);

                const slNum = parseInt(r.sl, 10);
                plan.push({
                    mobile,
                    sl: Number.isFinite(slNum) ? slNum : idx + 1,
                    emp_id: String(r.empid || '').trim(),
                    name,
                    designation: String(r.designation || '').trim(),
                    subject: String(r.subject || '').trim(),
                    isUpdate: existing.has(mobile)
                });
            });

            if (!plan.length) {
                toast(`No valid rows found. Invalid row(s): ${invalid.slice(0, 10).join(', ') || '-'}`, 'error');
                return;
            }

            const newCount = plan.filter(p => !p.isUpdate).length;
            const updCount = plan.length - newCount;
            let msg = `${newCount} new teacher(s) will be created with PIN ${CFG.DEFAULT_PIN}, and ${updCount} existing teacher(s) will have profile details updated (PIN unchanged).`;
            if (invalid.length) msg += ` Skipped invalid row(s): ${invalid.slice(0, 10).join(', ')}${invalid.length > 10 ? '…' : ''}.`;
            if (dupInSheet) msg += ` ${dupInSheet} duplicate mobile row(s) ignored.`;

            confirmBox({
                title: 'Confirm Teacher Import',
                message: msg,
                confirmText: 'Import Now',
                onConfirm: () => runImport(plan, existing)
            });
        } catch (err) {
            console.error('[TEV] excel error', err);
            toast('Could not read Excel file: ' + err.message, 'error');
        }
    }

    async function runImport(plan, existing) {
        loader(true, 'Importing teachers to Firebase...');
        let ok = 0, failed = 0;
        try {
            const jobs = plan.map(p => () => {
                const old = existing.get(p.mobile);
                const rec = old
                    ? {
                        ...cleanRec(old),
                        sl: p.sl,
                        emp_id: p.emp_id,
                        name: p.name,
                        designation: p.designation,
                        subject: p.subject || old.subject || '',
                        mobile: p.mobile,
                        updated_at: nowIso()
                    }
                    : {
                        sl: p.sl,
                        emp_id: p.emp_id,
                        name: p.name,
                        designation: p.designation,
                        subject: p.subject,
                        mobile: p.mobile,
                        pin: CFG.DEFAULT_PIN,
                        is_first_login: true,
                        status: 'active',
                        created_at: nowIso()
                    };
                return dbWrite(`${CFG.TEACHERS_PATH}/${p.mobile}`, rec);
            });

            // small parallel batches
            for (let i = 0; i < jobs.length; i += 10) {
                const res = await Promise.allSettled(jobs.slice(i, i + 10).map(j => j()));
                res.forEach(r => (r.status === 'fulfilled' ? ok++ : failed++));
            }
        } finally {
            loader(false);
        }

        await loadTeachers();
        if (state.section === 'directory') renderDirectory();
        if (failed) toast(`Imported ${ok} teacher(s); ${failed} failed. Check Firebase rules/connection.`, 'warning');
        else toast(`Successfully imported ${ok} teacher(s)!`, 'success');
    }

    /* ---------- Reset PIN / Status ---------- */
    function resetPin(key) {
        const t = state.teachers.find(x => x._key === key);
        if (!t) return;
        confirmBox({
            title: 'Reset PIN?',
            message: `${t.name}'s PIN will be reset to ${CFG.DEFAULT_PIN} and a PIN change will be required at next login.`,
            confirmText: 'Reset PIN',
            onConfirm: async () => {
                loader(true, 'Resetting PIN...');
                try {
                    const updated = { ...cleanRec(t), pin: CFG.DEFAULT_PIN, is_first_login: true, pin_reset_at: nowIso() };
                    await dbWrite(`${CFG.TEACHERS_PATH}/${key}`, updated);
                    Object.assign(t, updated);
                    renderDirectoryTable();
                    toast(`PIN reset to ${CFG.DEFAULT_PIN} for ${t.name}.`, 'success');
                } catch (err) {
                    toast('Failed to reset PIN: ' + err.message, 'error');
                } finally { loader(false); }
            }
        });
    }

    async function toggleStatus(key) {
        const t = state.teachers.find(x => x._key === key);
        if (!t) return;
        const next = t.status === 'inactive' ? 'active' : 'inactive';
        loader(true, 'Updating status...');
        try {
            const updated = { ...cleanRec(t), status: next, updated_at: nowIso() };
            await dbWrite(`${CFG.TEACHERS_PATH}/${key}`, updated);
            Object.assign(t, updated);
            renderDirectory();
            toast(`${t.name} is now ${next}.`, 'success');
        } catch (err) {
            toast('Failed to update status: ' + err.message, 'error');
        } finally { loader(false); }
    }

    /* ---------- Edit modal ---------- */
    function openEditModal(key) {
        const t = state.teachers.find(x => x._key === key);
        if (!t) return;
        state.editKey = key;

        const box = document.getElementById('tev-modal-box');
        box.innerHTML = `
            <h4><i class="fa-solid fa-user-pen"></i> Edit Teacher</h4>
            <div class="tev-field"><label>EMP ID</label><input class="tev-input" id="tev-f-emp" value="${esc(t.emp_id)}"></div>
            <div class="tev-field"><label>Name *</label><input class="tev-input" id="tev-f-name" value="${esc(t.name)}"></div>
            <div class="tev-field"><label>Designation</label><input class="tev-input" id="tev-f-desig" value="${esc(t.designation)}"></div>
            <div class="tev-field"><label>Subject</label><input class="tev-input" id="tev-f-subject" value="${esc(t.subject)}"></div>
            <div class="tev-field"><label>Mobile (Username) *</label><input class="tev-input" id="tev-f-mobile" value="${esc(t.mobile)}"></div>
            <div class="tev-modal-actions">
                <button type="button" class="tev-btn" data-act="modal-close">Cancel</button>
                <button type="button" class="tev-btn tev-btn-primary" data-act="modal-save"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>
            </div>
        `;
        document.getElementById('tev-modal').style.display = 'flex';
    }

    async function saveEdit() {
        const key = state.editKey;
        const t = state.teachers.find(x => x._key === key);
        if (!t) return;

        const val = id => (document.getElementById(id).value || '').trim();
        const name = val('tev-f-name');
        const newMobile = normalizeMobile(val('tev-f-mobile'));

        if (!name) { toast('Teacher name is required.', 'warning'); return; }
        if (!newMobile) { toast('Enter a valid 11-digit mobile number (01XXXXXXXXX).', 'warning'); return; }
        if (newMobile !== key && state.teachers.some(x => x._key === newMobile)) {
            toast('Another teacher already uses this mobile number.', 'error');
            return;
        }

        loader(true, 'Saving teacher...');
        try {
            const updated = {
                ...cleanRec(t),
                emp_id: val('tev-f-emp'),
                name,
                designation: val('tev-f-desig'),
                subject: val('tev-f-subject'),
                mobile: newMobile,
                updated_at: nowIso()
            };

            await dbWrite(`${CFG.TEACHERS_PATH}/${newMobile}`, updated);
            if (newMobile !== key) {
                await dbWrite(`${CFG.TEACHERS_PATH}/${key}`, null);     // move document to the new key
                await repointAssignments(key, newMobile, updated);        // keep duty mappings valid
            }

            closeModal();
            await loadTeachers();
            renderDirectory();
            toast('Teacher updated successfully!', 'success');
        } catch (err) {
            toast('Failed to save teacher: ' + err.message, 'error');
        } finally { loader(false); }
    }

    /** Best-effort: when a mobile (doc id) changes, update duty mappings that referenced the old one. */
    async function repointAssignments(oldId, newId, teacher) {
        try {
            const all = await dbRead(CFG.ASSIGN_PATH);
            if (!all) return;
            for (const [examId, rec] of Object.entries(all)) {
                let changed = false;
                Object.values((rec && rec.subjects) || {}).forEach(s => {
                    if (s.teacher_id === oldId) {
                        s.teacher_id = newId;
                        s.teacher_name = teacher.name;
                        s.emp_id = teacher.emp_id || '';
                        changed = true;
                    }
                });
                if (changed) await dbWrite(`${CFG.ASSIGN_PATH}/${examId}`, rec);
            }
        } catch (e) {
            console.warn('[TEV] could not repoint assignments', e);
        }
    }

    /* ==================================================================
       SUB-VIEW 2 : EXAM DUTY ASSIGNMENT
       ================================================================== */
    function examLabel(ex) {
        const locked = (ex.status === 'Locked' || ex.status === 'Closed') ? ' • Locked' : '';
        return `${ex.name || ex.id} (${ex.date || 'No date'})${locked}`;
    }

    async function prepareAssign(keepSelection) {
        if (!state.exams.length) {
            document.getElementById('tev-sec-assign').innerHTML =
                `<div class="tev-card"><div class="tev-empty">No preparatory exams found. Create one in Exam Manager &rarr; SSC 27 Preparatory first.</div></div>`;
            return;
        }
        if (!state.assignExamId || !state.exams.some(e => e.id === state.assignExamId)) {
            state.assignExamId = state.exams[0].id;           // newest exam
        }

        // load existing mapping for the selected exam
        state.assignDraft = {};
        try {
            const rec = await dbRead(`${CFG.ASSIGN_PATH}/${state.assignExamId}`);
            Object.entries((rec && rec.subjects) || {}).forEach(([k, v]) => {
                if (v && v.teacher_id) state.assignDraft[k] = v.teacher_id;
            });
        } catch (err) {
            toast('Could not read existing assignments: ' + err.message, 'warning');
        }
        renderAssign();
    }

    function renderAssign() {
        const sec = document.getElementById('tev-sec-assign');
        if (!sec) return;
        const exam = state.exams.find(e => e.id === state.assignExamId);
        if (!exam) return;

        const subjects = Object.entries(exam.subjects || {});
        const activeTeachers = state.teachers.filter(t => t.status !== 'inactive');

        const rows = subjects.map(([sub, fullMark], i) => {
            const current = state.assignDraft[sub] || '';
            const opts = [`<option value="">-- Unassigned --</option>`];
            const listed = new Set();
            activeTeachers.forEach(t => {
                listed.add(t._key);
                const meta = [t.subject, t.designation].filter(Boolean).join(' • ');
                opts.push(`<option value="${esc(t._key)}" ${t._key === current ? 'selected' : ''}>${esc(t.name)}${meta ? ' — ' + esc(meta) : ''}</option>`);
            });
            // keep an inactive/removed teacher visible so the mapping is not silently lost
            if (current && !listed.has(current)) {
                const t = state.teachers.find(x => x._key === current);
                opts.push(`<option value="${esc(current)}" selected>${esc(t ? t.name + ' (inactive)' : current + ' (not found)')}</option>`);
            }
            return `
                <tr>
                    <td><strong>${i + 1}</strong></td>
                    <td><strong>${esc(sub)}</strong></td>
                    <td style="text-align:center;">${esc(fullMark)}</td>
                    <td><select class="tev-select tev-assign-sel" style="width:100%;min-width:260px;" data-sub="${esc(sub)}">${opts.join('')}</select></td>
                </tr>
            `;
        }).join('');

        sec.innerHTML = `
            <div class="tev-card">
                <div class="tev-card-title">
                    <span><i class="fa-solid fa-clipboard-user"></i> Exam Duty Assignment</span>
                    <select id="tev-assign-exam" class="tev-select">
                        ${state.exams.map(e => `<option value="${esc(e.id)}" ${e.id === state.assignExamId ? 'selected' : ''}>${esc(examLabel(e))}</option>`).join('')}
                    </select>
                </div>

                ${activeTeachers.length === 0 ? `<div class="tev-hint" style="color:#dc2626;margin-bottom:12px;"><i class="fa-solid fa-triangle-exclamation"></i> No active teachers found. Import teachers in &ldquo;Teacher Directory &amp; PIN&rdquo; first.</div>` : ''}

                <div class="tev-toolbar">
                    <div class="tev-hint"><i class="fa-solid fa-circle-info"></i> Choose the teacher responsible for entering marks of each subject.
                        <b id="tev-assign-counter"></b></div>
                    <div class="tev-toolbar-group">
                        <button type="button" class="tev-btn" data-act="clear-assign"><i class="fa-solid fa-eraser"></i> Clear All</button>
                        <button type="button" class="tev-btn tev-btn-primary" data-act="save-assign"><i class="fa-solid fa-cloud-arrow-up"></i> Save Assignments</button>
                    </div>
                </div>

                <div class="tev-table-wrap">
                    <table class="tev-table" style="min-width:640px;">
                        <thead><tr><th style="width:60px;">SL</th><th>Subject</th><th style="width:110px;text-align:center;">Full Marks</th><th>Responsible Teacher</th></tr></thead>
                        <tbody>${rows || `<tr><td colspan="4" class="tev-empty">This exam has no subjects.</td></tr>`}</tbody>
                    </table>
                </div>
            </div>
        `;
        updateAssignCounter();
    }

    function updateAssignCounter() {
        const el = document.getElementById('tev-assign-counter');
        const exam = state.exams.find(e => e.id === state.assignExamId);
        if (!el || !exam) return;
        const total = Object.keys(exam.subjects || {}).length;
        el.textContent = ` ${Object.keys(state.assignDraft).length}/${total} subjects assigned`;
    }

    async function saveAssignments() {
        const exam = state.exams.find(e => e.id === state.assignExamId);
        if (!exam) return;

        const subjects = {};
        Object.entries(state.assignDraft).forEach(([sub, teacherId]) => {
            if (!(sub in (exam.subjects || {}))) return;
            const t = state.teachers.find(x => x._key === teacherId);
            subjects[sub] = {
                subject: sub,
                full_mark: Number(exam.subjects[sub]) || 0,
                teacher_id: teacherId,
                teacher_name: t ? t.name : '',
                emp_id: t ? (t.emp_id || '') : '',
                assigned_at: nowIso()
            };
        });

        loader(true, 'Saving duty assignments...');
        try {
            await dbWrite(`${CFG.ASSIGN_PATH}/${exam.id}`, {
                exam_id: exam.id,
                exam_name: exam.name || '',
                exam_date: exam.date || '',
                updated_at: nowIso(),
                subjects
            });
            toast(`Duty assignments saved for ${exam.name}!`, 'success');
        } catch (err) {
            toast('Failed to save assignments: ' + err.message, 'error');
        } finally { loader(false); }
    }

    /* ==================================================================
       SUB-VIEW 3 : ACTIVITY & AUDIT TRACKER
       ================================================================== */
    async function prepareTracker() {
        if (!state.exams.length) {
            document.getElementById('tev-sec-tracker').innerHTML =
                `<div class="tev-card"><div class="tev-empty">No preparatory exams found.</div></div>`;
            return;
        }
        if (!state.trackExamId || !state.exams.some(e => e.id === state.trackExamId)) {
            state.trackExamId = state.exams[0].id;
        }
        await renderTracker();
    }

    /** A subject counts as "submitted" when at least one mark exists in cpscl_exam_marks/{examId}_{subject}. */
    async function hasSubmittedMarks(examId, subKey) {
        if (!CFG.LIVE_SUBMISSIONS) return false;
        try {
            const data = await dbRead(`${CFG.MARKS_PATH}/${examId}_${subKey}`);
            if (!data || typeof data !== 'object') return false;
            return Object.values(data).some(rec => {
                if (typeof rec === 'number') return true;
                if (!rec) return false;
                const v = (rec.rawMark !== undefined && rec.rawMark !== null && rec.rawMark !== '') ? rec.rawMark : rec.cq;
                return v !== undefined && v !== null && v !== '';
            });
        } catch (e) { return false; }
    }

    async function renderTracker() {
        const sec = document.getElementById('tev-sec-tracker');
        if (!sec) return;
        const exam = state.exams.find(e => e.id === state.trackExamId);
        if (!exam) return;

        sec.innerHTML = `<div class="tev-card"><div class="tev-empty"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:24px;color:#059669;"></i></div></div>`;

        try {
            const rec = await dbRead(`${CFG.ASSIGN_PATH}/${exam.id}`);
            const entries = Object.entries((rec && rec.subjects) || {});
            const doneMap = {};
            await Promise.all(entries.map(async ([sub]) => { doneMap[sub] = await hasSubmittedMarks(exam.id, sub); }));

            // group by teacher
            const byTeacher = new Map();
            entries.forEach(([sub, a]) => {
                const id = a.teacher_id;
                if (!id) return;
                if (!byTeacher.has(id)) {
                    const t = state.teachers.find(x => x._key === id);
                    byTeacher.set(id, { id, name: (t && t.name) || a.teacher_name || id, emp: (t && t.emp_id) || a.emp_id || '', subs: [] });
                }
                byTeacher.get(id).subs.push({ sub, done: !!doneMap[sub] });
            });

            const rows = Array.from(byTeacher.values()).sort((a, b) => a.name.localeCompare(b.name));
            const totalAssigned = entries.length;
            const totalDone = entries.filter(([s]) => doneMap[s]).length;
            const unassigned = Object.keys(exam.subjects || {}).filter(s => !(rec && rec.subjects && rec.subjects[s])).length;

            const body = rows.map((r, i) => {
                const done = r.subs.filter(s => s.done).length;
                const total = r.subs.length;
                const pct = total ? Math.round((done / total) * 100) : 0;
                const color = pct === 100 ? '#059669' : pct > 0 ? '#f59e0b' : '#ef4444';
                const chips = r.subs.map(s => `<span class="tev-sub-chip ${s.done ? 'tev-sub-done' : 'tev-sub-pend'}">${esc(s.sub)}</span>`).join('');
                return `
                    <tr>
                        <td><strong>${i + 1}</strong></td>
                        <td><strong>${esc(r.name)}</strong><div class="tev-hint">${esc(r.emp)}</div></td>
                        <td>${chips}</td>
                        <td style="text-align:center;"><strong>${total}</strong></td>
                        <td style="text-align:center;color:#15803d;"><strong>${done}</strong></td>
                        <td style="text-align:center;color:#b45309;"><strong>${total - done}</strong></td>
                        <td style="min-width:170px;">
                            <div style="display:flex;align-items:center;gap:8px;">
                                <div class="tev-progress" style="flex:1;"><div style="width:${pct}%;background:${color};"></div></div>
                                <strong style="font-size:.8rem;color:${color};">${pct}%</strong>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            sec.innerHTML = `
                <div class="tev-card">
                    <div class="tev-card-title">
                        <span><i class="fa-solid fa-chart-line"></i> Activity &amp; Audit Tracker</span>
                        <div class="tev-toolbar-group">
                            <select id="tev-track-exam" class="tev-select">
                                ${state.exams.map(e => `<option value="${esc(e.id)}" ${e.id === state.trackExamId ? 'selected' : ''}>${esc(examLabel(e))}</option>`).join('')}
                            </select>
                            <button type="button" class="tev-btn" data-act="refresh-track"><i class="fa-solid fa-arrows-rotate"></i> Refresh</button>
                        </div>
                    </div>

                    <div class="tev-cards">
                        <div class="tev-stat-card"><div><p>Assigned Subjects</p><h3>${totalAssigned}</h3></div><i class="fa-solid fa-book" style="color:#059669;font-size:1.3rem;"></i></div>
                        <div class="tev-stat-card"><div><p>Submitted</p><h3 style="color:#15803d;">${totalDone}</h3></div><i class="fa-solid fa-circle-check" style="color:#15803d;font-size:1.3rem;"></i></div>
                        <div class="tev-stat-card"><div><p>Pending</p><h3 style="color:#b45309;">${totalAssigned - totalDone}</h3></div><i class="fa-solid fa-clock" style="color:#f59e0b;font-size:1.3rem;"></i></div>
                        <div class="tev-stat-card"><div><p>Unassigned Subjects</p><h3 style="color:${unassigned ? '#dc2626' : '#64748b'};">${unassigned}</h3></div><i class="fa-solid fa-user-slash" style="color:#dc2626;font-size:1.3rem;"></i></div>
                    </div>

                    <div class="tev-hint" style="margin-bottom:10px;">
                        ${CFG.LIVE_SUBMISSIONS
                            ? 'A subject is counted as <b>submitted</b> once at least one mark exists for it in the mark-entry records (read-only check).'
                            : 'Preview mode: submission logs are not connected yet, so every subject shows as pending.'}
                    </div>

                    <div class="tev-table-wrap">
                        <table class="tev-table" style="min-width:900px;">
                            <thead>
                                <tr><th>SL</th><th>Teacher</th><th>Subjects</th><th style="text-align:center;">Assigned</th><th style="text-align:center;">Submitted</th><th style="text-align:center;">Pending</th><th>Progress</th></tr>
                            </thead>
                            <tbody>${body || `<tr><td colspan="7" class="tev-empty">No duty assignments saved for this exam yet.</td></tr>`}</tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('[TEV] tracker error', err);
            sec.innerHTML = `<div class="tev-card"><div class="tev-empty" style="color:#dc2626;">${esc(err.message)}</div></div>`;
            toast('Tracker error: ' + err.message, 'error');
        }
    }

    /* ------------------------------------------------------------------
       INIT
       ------------------------------------------------------------------ */
    function init() {
        injectStyles();
        injectSidebar(0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
