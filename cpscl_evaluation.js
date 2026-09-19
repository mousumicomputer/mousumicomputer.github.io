/**
 * CPSCL Academic Evaluation Module - Bulletproof Multi-Department Manager
 * File: cpscl_evaluation.js
 * Architecture: End-to-End Exam Lifecycle, Admin Override & Dynamic Tabulation
 * UI: Professional Academic Theme with Google Tiro Bangla & Rounded Aesthetic
 */

(function () {
    // ==========================================================
    // ১. গুগল ফন্ট ও সম্পূর্ণ গোলাকার (Rounded) স্টাইল ইনজেকশন
    // ==========================================================
    const evalStyle = document.createElement('style');
    evalStyle.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

        #exam-eval-view, #exam-eval-view *, #evalUploadModal, #evalUploadModal *, #createExamModal, #createExamModal * {
            font-family: 'Tiro Bangla', serif !important;
            box-sizing: border-box;
        }

        .eval-sub-sec { display: none; }
        .eval-sub-sec.active { display: block; }

        /* পরিসংখ্যান কার্ড (গোলাকার শেপ) */
        .eval-stats-ribbon {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            margin-bottom: 14px;
        }
        .eval-stat-item {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 5px solid #94a3b8;
            border-radius: 16px;
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            transition: 0.15s ease;
        }
        .eval-stat-item:hover { background: #fbfcfe; border-color: #cbd5e1; transform: translateY(-1px); }
        .eval-stat-item.active { border-left-color: #1e40af; background: #eff6ff; border-color: #bfdbfe; }
        .eval-stat-title { font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; }
        .eval-stat-meta { font-size: 0.68rem; color: #94a3b8; }
        .eval-stat-num { font-size: 1.35rem; font-weight: 700; color: #0f172a; }

        .eval-main-box { 
            background: #fff; 
            border: 1px solid #e2e8f0; 
            border-radius: 18px; 
            overflow: hidden; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.03); 
            margin-bottom: 16px; 
        }
        .eval-ctrl-bar {
            padding: 10px 16px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            background: #ffffff;
        }
        .eval-tab-group { display: flex; background: #f1f5f9; padding: 4px; border-radius: 25px; gap: 3px; flex-wrap: wrap; }
        .eval-tab-btn {
            border: none; background: transparent; padding: 6px 14px; border-radius: 20px;
            font-size: 0.78rem; font-weight: 700; color: #64748b; cursor: pointer; transition: 0.15s; white-space: nowrap;
        }
        .eval-tab-btn:hover { color: #0f172a; }
        .eval-tab-btn.active { background: #ffffff; color: #1e40af; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

        .eval-search-wrap { position: relative; width: 220px; }
        .eval-search-wrap .eval-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; fill: #94a3b8; }
        .eval-search-inp { width: 100%; padding: 7px 14px 7px 32px; border: 1.5px solid #cbd5e1; border-radius: 25px; font-size: 0.78rem; outline: none; }
        .eval-search-inp:focus { border-color: #1e40af; }

        /* সব বাটন সম্পূর্ণ গোলাকার (Pill Shapes) */
        .eval-btn {
            padding: 8px 18px; border-radius: 25px; font-size: 0.78rem; font-weight: 700;
            cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border: none; transition: 0.15s; text-decoration: none;
        }
        .eval-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
        .eval-btn-primary { background: #1e40af; color: white; }
        .eval-btn-primary:hover { background: #1e3a8a; }
        .eval-btn-success { background: #16a34a; color: white; }
        .eval-btn-success:hover { background: #15803d; }
        .eval-btn-info { background: #0ea5e9; color: white; }
        .eval-btn-purple { background: #6366f1; color: white; }

        .eval-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .eval-table thead tr { background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; }
        .eval-table th { padding: 10px 14px; text-align: left; font-size: 0.70rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
        .eval-table td { padding: 8px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a; vertical-align: middle; white-space: nowrap; }
        .eval-table tbody tr:hover { background-color: #f8faff; }

        .eval-modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(3px); display: none; align-items: center; justify-content: center; z-index: 999999;
        }
        .eval-modal-card {
            background: #ffffff; border-radius: 20px; width: 100%; max-width: 480px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 24px; animation: evalPop 0.2s ease-out;
        }
        @keyframes evalPop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .sub-chip {
            display: inline-flex; align-items: center; gap: 5px; padding: 4px 12px; background: #f1f5f9;
            border-radius: 20px; font-size: 0.75rem; font-weight: 700; cursor: pointer; user-select: none; border: 1px solid #cbd5e1;
        }
        .sub-chip.active { background: #dbeafe; border-color: #3b82f6; color: #1e40af; }

        .eval-badge {
            display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700;
        }
        .eval-badge-primary { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
        .eval-badge-success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .eval-badge-danger { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

        /* Admin Override Input */
        .admin-eval-inp {
            width: 70px; height: 36px; border-radius: 12px; border: 1.5px solid #cbd5e1;
            text-align: center; font-size: 1.15rem; font-weight: 800; color: #1e40af; outline: none; background: #ffffff;
            transition: border-color 0.2s, background-color 0.2s;
        }
        .admin-eval-inp:focus { border-color: #2563eb; background-color: #eff6ff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18); }
        .admin-eval-inp.has-error { border-color: #dc2626 !important; background-color: #fef2f2 !important; color: #dc2626 !important; }

        .eval-icon { width: 14px; height: 14px; fill: currentColor; display: inline-block; vertical-align: middle; }
    `;
    document.head.appendChild(evalStyle);

    // এসভিজি আইকন
    const ICONS = {
        users: `<svg class="eval-icon" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>`,
        sliders: `<svg class="eval-icon" viewBox="0 0 24 24"><path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z"/></svg>`,
        pen: `<svg class="eval-icon" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
        table: `<svg class="eval-icon" viewBox="0 0 24 24"><path d="M4 3h16c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zm0 4h16V5H4v2zm0 4h7V9H4v2zm9 0h7V9h-7v2zm-9 4h7v-2H4v2zm9 0h7v-2h-7v2zm-9 4h7v-2H4v2zm9 0h7v-2h-7v2z"/></svg>`,
        star: `<svg class="eval-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
        box: `<svg class="eval-icon" viewBox="0 0 24 24"><path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/></svg>`,
        arrowRight: `<svg class="eval-icon" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>`,
        save: `<svg class="eval-icon" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>`,
        search: `<svg class="eval-icon" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`
    };

    // সব বিষয়ের মাস্টার তালিকা
    const MASTER_SUBJECTS = {
        Science: [
            { key: 'B1', name: 'Bangla 1st' }, { key: 'B2', name: 'Bangla 2nd' },
            { key: 'E1', name: 'English 1st' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'HM_AG', name: 'HM/AG' },
            { key: 'Phy', name: 'Physics' }, { key: 'Che', name: 'Chemistry' },
            { key: 'Bio', name: 'Biology' }, { key: 'BGS', name: 'BGS' },
            { key: 'Reli', name: 'Religion' }, { key: 'ICT', name: 'ICT' }
        ],
        Humanities: [
            { key: 'B1', name: 'Bangla 1st' }, { key: 'B2', name: 'Bangla 2nd' },
            { key: 'E1', name: 'English 1st' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'AG_HE', name: 'AG/HE' },
            { key: 'His', name: 'History' }, { key: 'Geo', name: 'Geography' },
            { key: 'Civ', name: 'Civics' }, { key: 'Sci', name: 'General Science' },
            { key: 'Reli', name: 'Religion' }, { key: 'ICT', name: 'ICT' }
        ],
        BStudies: [
            { key: 'B1', name: 'Bangla 1st' }, { key: 'B2', name: 'Bangla 2nd' },
            { key: 'E1', name: 'English 1st' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'AG_HE', name: 'AG/HE' },
            { key: 'Fin', name: 'Finance' }, { key: 'Acc', name: 'Accounting' },
            { key: 'BE', name: 'Business Ent.' },
            { key: 'Sci', name: 'General Science' }, { key: 'Reli', name: 'Religion' },
            { key: 'ICT', name: 'ICT' }
        ]
    };

    // স্ট্রিম-সচেতন পিন কি
    function getStreamPinKey(stream, subKey) {
        const cleanStream = stream === 'B.Studies' ? 'BStudies' : stream;
        return `${cleanStream}_${subKey}`;
    }

    // ফায়ারবেস মডিউল ইন্টারনাল রেফারেন্স
    let _db = null;
    let _ref = null;
    let _get = null;
    let _set = null;
    let _update = null;

    let studentsList = [];
    let examMarks = {};
    let subjectPins = {};
    let activeExamId = "exam_fn02_2026";
    let activeExamData = {
        id: "exam_fn02_2026",
        title: "Fortnightly Test-02",
        date: "15 Sep 2026",
        max: 15,
        isLocked: false,
        activeSubjects: ['B1', 'B2', 'E1', 'E2', 'Math', 'HM_AG', 'Phy', 'Che', 'Bio', 'BGS', 'Reli', 'ICT', 'His', 'Geo', 'Civ', 'Fin', 'Acc', 'BE', 'Sci', 'AG_HE']
    };
    let currentEvalFilter = 'All';
    let computedMeritCache = [];
    let selectedUploadFile = null;

    // নিরাপদ ডাটাবেজ রাইটার হেল্পার
    async function dbSet(path, val) {
        if (_set && _ref && _db) {
            return await _set(_ref(_db, path), val);
        } else if (window.writeToFirebase) {
            return await window.writeToFirebase(path, val);
        }
    }

    async function dbUpdate(updates) {
        if (_update && _ref && _db) {
            return await _update(_ref(_db), updates);
        } else if (window.update && window.ref && window.getDatabase) {
            return await window.update(window.ref(window.getDatabase()), updates);
        } else if (window.writeToFirebase) {
            for (const [p, v] of Object.entries(updates)) {
                await window.writeToFirebase(p, v);
            }
        }
    }

    // ==========================================================
    // ২. সাইডবার ইনজেকশন
    // ==========================================================
    function injectExamModule() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList) return;

        const oldMenu = document.getElementById('menu-exam-eval-parent');
        if (oldMenu) oldMenu.remove();

        const evalLi = document.createElement('li');
        evalLi.className = 'menu-item';
        evalLi.id = 'menu-exam-eval-parent';
        evalLi.innerHTML = `
            <a onclick="window.toggleExamMenu(event)">
                <span class="menu-link-inner">${ICONS.pen} <span>Exam Evaluation</span></span>
                <span id="exam-chevron-icon" style="transition:0.2s; display:inline-block;">▾</span>
            </a>
            <ul class="submenu-list" id="exam-submenu-list" style="display: none;">
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-student-sec')">${ICONS.users} <span>Student Directory</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-config-sec')">${ICONS.sliders} <span>Exam Manager</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-admin-entry-sec')" style="color:#16a34a; font-weight:700;">${ICONS.pen} <span>Admin Mark Entry</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-tab-sec')">${ICONS.table} <span>Live Tabulation</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-regroup-sec')">${ICONS.star} <span>Merit & Grouping</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-archive-sec')">${ICONS.box} <span>Exam Archives</span></a></li>
            </ul>
        `;
        menuList.appendChild(evalLi);

        const mainWrapper = document.querySelector('.main-wrapper');
        if (mainWrapper && !document.getElementById('exam-eval-view')) {
            const viewDiv = document.createElement('div');
            viewDiv.className = 'view-panel';
            viewDiv.id = 'exam-eval-view';
            viewDiv.innerHTML = `
                <!-- SUB-SECTION 1: STUDENT DIRECTORY -->
                <div id="eval-student-sec" class="eval-sub-sec active">
                    <div class="eval-stats-ribbon">
                        <div class="eval-stat-item active" id="statCardAll" style="border-left-color: #2563eb;" onclick="window.filterEvalByTab('All')">
                            <div><div class="eval-stat-title">Total Database</div><div class="eval-stat-meta">Active Records</div></div>
                            <div class="eval-stat-num" id="statValTotal">0</div>
                        </div>
                        <div class="eval-stat-item" id="statCardSci" style="border-left-color: #4f46e5;" onclick="window.filterEvalByTab('Science')">
                            <div><div class="eval-stat-title">Science Stream</div><div class="eval-stat-meta" id="statSciBreakdown">A: 0 | B: 0 | C: 0</div></div>
                            <div class="eval-stat-num" id="statValSci">0</div>
                        </div>
                        <div class="eval-stat-item" id="statCardHum" style="border-left-color: #d97706;" onclick="window.filterEvalByTab('Humanities')">
                            <div><div class="eval-stat-title">Humanities</div><div class="eval-stat-meta">Arts Group</div></div>
                            <div class="eval-stat-num" id="statValHum">0</div>
                        </div>
                        <div class="eval-stat-item" id="statCardBs" style="border-left-color: #059669;" onclick="window.filterEvalByTab('B.Studies')">
                            <div><div class="eval-stat-title">Business Studies</div><div class="eval-stat-meta">Commerce Group</div></div>
                            <div class="eval-stat-num" id="statValBs">0</div>
                        </div>
                    </div>

                    <div class="eval-main-box">
                        <div class="eval-ctrl-bar">
                            <div class="eval-tab-group" id="evalTabButtonsGroup">
                                <button class="eval-tab-btn active" onclick="window.filterEvalByTab('All', this)">All (<span id="cntAll">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Science', this)">Science (<span id="cntSci">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Group-A', this)">Group-A (<span id="cntGrpA">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Group-B', this)">Group-B (<span id="cntGrpB">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Group-C', this)">Group-C (<span id="cntGrpC">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Humanities', this)">Humanities (<span id="cntHum">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('B.Studies', this)">B.Studies (<span id="cntBs">0</span>)</button>
                            </div>

                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="eval-search-wrap">
                                    ${ICONS.search}
                                    <input type="text" id="evalSearchInp" class="eval-search-inp" placeholder="Search ID, Name, Roll..." oninput="window.renderEvalStudents()">
                                </div>
                                <button class="eval-btn eval-btn-primary" onclick="window.openEvalUploadModal()">
                                    ${ICONS.save} <span>Import Excel</span>
                                </button>
                            </div>
                        </div>

                        <div style="overflow-x: auto;">
                            <table class="eval-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px; text-align:center;">SL</th>
                                        <th style="width: 110px;">Student ID</th>
                                        <th>Full Name</th>
                                        <th style="width: 60px; text-align:center;">Roll</th>
                                        <th style="width: 70px; text-align:center;">Sec</th>
                                        <th style="width: 120px;">Current Group</th>
                                        <th style="width: 100px; text-align:center;">Position</th>
                                    </tr>
                                </thead>
                                <tbody id="evalStudentTbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SUB-SECTION 2: EXAM MANAGER -->
                <div id="eval-config-sec" class="eval-sub-sec">
                    <div class="eval-main-box" style="padding: 18px; margin-bottom: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                            <div>
                                <h3 id="mgrExamTitle" style="font-size: 1.15rem; font-weight: 800; margin: 0; color: #0f172a;">Active: Fortnightly Test-02</h3>
                                <p id="mgrExamMeta" style="font-size: 0.78rem; color: #64748b; margin: 2px 0 0 0;">Date: 15 Sep 2026 • Full Mark: 15</p>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <button class="eval-btn eval-btn-purple" onclick="window.openCreateExamModal()">+ Create New Exam</button>
                                <button class="eval-btn" id="btnToggleLock" style="background:#dc2626; color:white;" onclick="window.toggleExamLock()">
                                    Lock Entry
                                </button>
                                <button class="eval-btn eval-btn-info" onclick="window.copyEvalTeacherLink()">Copy Teacher Link</button>
                            </div>
                        </div>

                        <div>
                            <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 8px; display: block;">
                                Active Exam Subjects (Uncheck to exclude):
                            </label>
                            <div id="activeSubjectsChips" style="display: flex; flex-wrap: wrap; gap: 8px;"></div>
                        </div>
                    </div>

                    <div class="eval-main-box">
                        <div class="eval-ctrl-bar">
                            <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a;">Teacher PINs & Submission Status</div>
                            <div style="display: flex; gap: 8px;">
                                <button class="eval-btn eval-btn-purple" id="btnRefreshPins" onclick="window.refreshEvalPinsLive()">Refresh PINs</button>
                                <button class="eval-btn eval-btn-success" onclick="window.switchExamSubSection('eval-admin-entry-sec')">${ICONS.pen} Open Admin Mark Entry</button>
                            </div>
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="eval-table">
                                <thead>
                                    <tr>
                                        <th style="padding-left: 15px;">Stream</th>
                                        <th>Subject</th>
                                        <th>Status</th>
                                        <th>Teacher Secret PIN</th>
                                        <th style="text-align: center; width: 100px;">Control</th>
                                    </tr>
                                </thead>
                                <tbody id="evalPinTbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SUB-SECTION 3: ADMIN MARK ENTRY ENGINE -->
                <div id="eval-admin-entry-sec" class="eval-sub-sec">
                    <div class="eval-main-box" style="border-radius: 20px;">
                        <div style="background: linear-gradient(90deg, #1e40af 0%, #2563eb 100%); color: #fff; padding: 12px 20px; font-weight: 700; font-size: 0.92rem; display: flex; align-items: center; gap: 8px;">
                            ${ICONS.pen} Admin Mark Entry (Direct Override)
                        </div>

                        <div style="padding: 18px 20px;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px 18px;">
                                <div>
                                    <label style="font-size: 0.72rem; color: #64748b; margin-bottom: 5px; margin-left: 6px; font-weight: 700; text-transform: uppercase; display: block;">Academic Year <span style="color:#dc2626;">*</span></label>
                                    <select class="eval-search-inp" id="adminSelYear" style="width: 100%; border-radius: 25px; padding: 8px 14px;">
                                        <option selected>2026</option>
                                        <option>2025</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size: 0.72rem; color: #64748b; margin-bottom: 5px; margin-left: 6px; font-weight: 700; text-transform: uppercase; display: block;">Exam Name <span style="color:#dc2626;">*</span></label>
                                    <select class="eval-search-inp" id="adminSelExam" style="width: 100%; border-radius: 25px; padding: 8px 14px;">
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size: 0.72rem; color: #64748b; margin-bottom: 5px; margin-left: 6px; font-weight: 700; text-transform: uppercase; display: block;">Group / Stream <span style="color:#dc2626;">*</span></label>
                                    <select class="eval-search-inp" id="adminSelGroup" style="width: 100%; border-radius: 25px; padding: 8px 14px;" onchange="window.adminOnGroupChanged()">
                                        <option value="Group-A" selected>Science (Group-A)</option>
                                        <option value="Group-B">Science (Group-B)</option>
                                        <option value="Group-C">Science (Group-C)</option>
                                        <option value="Humanities">Humanities</option>
                                        <option value="B.Studies">Business Studies</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="font-size: 0.72rem; color: #64748b; margin-bottom: 5px; margin-left: 6px; font-weight: 700; text-transform: uppercase; display: block;">Subject <span style="color:#dc2626;">*</span></label>
                                    <select class="eval-search-inp" id="adminSelSubject" style="width: 100%; border-radius: 25px; padding: 8px 14px;">
                                    </select>
                                </div>
                            </div>

                            <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
                                <button class="eval-btn eval-btn-primary" onclick="window.adminLoadStudentsForEntry()">
                                    Next ${ICONS.arrowRight}
                                </button>
                            </div>
                        </div>

                        <!-- মার্ক টেবিল বক্স -->
                        <div id="adminMarkTableBox" style="display: none; border-top: 1px solid #e2e8f0;">
                            <div style="overflow-x: auto;">
                                <table class="eval-table">
                                    <thead>
                                        <tr>
                                            <th style="width: 50px; text-align: center;">SL</th>
                                            <th style="width: 120px;">Student ID</th>
                                            <th>Name</th>
                                            <th style="width: 70px; text-align: center;">Roll</th>
                                            <th style="width: 70px; text-align: center;">Sec</th>
                                            <th style="width: 130px; text-align: center;">Mark (<span id="adminMaxMarkSpan">15</span>)</th>
                                        </tr>
                                    </thead>
                                    <tbody id="adminStudentTbody"></tbody>
                                </table>
                            </div>

                            <div style="padding: 14px 22px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                                <span style="font-size: 0.78rem; color: #64748b; font-weight: 600;">
                                    * Type 0 for Zero/Absent. Leave blank to retain previous marks. Press [Enter] for next student.
                                </span>
                                <button class="eval-btn eval-btn-success" id="btnAdminSaveMarks" onclick="window.adminSaveMarksLive()">
                                    ${ICONS.save} Save Marks
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SUB-SECTION 4: LIVE TABULATION -->
                <div id="eval-tab-sec" class="eval-sub-sec">
                    <div class="eval-main-box" style="padding: 12px 18px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">View Stream Sheet:</label>
                                <select id="evalTabGroup" class="eval-search-inp" style="width: auto; border-radius: 20px;" onchange="window.renderEvalTabulation()">
                                    <option value="Science_Merit" selected>Science (Combined Merit)</option>
                                    <option value="Group-A">Science (Group-A)</option>
                                    <option value="Group-B">Science (Group-B)</option>
                                    <option value="Group-C">Science (Group-C)</option>
                                    <option value="Humanities">Humanities</option>
                                    <option value="B.Studies">Business Studies</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="eval-btn" style="background:#475569; color:white;" onclick="window.openEvaluationPrintTab(true)">Blank Sheet</button>
                                <button class="eval-btn eval-btn-success" onclick="window.exportTabulationToExcel()">Export Excel</button>
                                <button class="eval-btn eval-btn-primary" onclick="window.openEvaluationPrintTab(false)">Print Result PDF</button>
                            </div>
                        </div>
                    </div>

                    <div class="eval-main-box" style="padding: 25px; border: 1px solid #000; background: #fff;" id="printTabArea">
                        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">
                            <h2 style="font-size: 1.3rem; font-weight: 800; text-transform: uppercase; margin: 0;">Cantonment Public School and College Lalmonirhat</h2>
                            <h4 style="font-size: 0.95rem; font-weight: 700; margin: 3px 0;">Performance Evaluation</h4>
                            <p id="evalPrintMeta" style="font-size: 0.85rem; font-weight: 600; color: #475569; margin: 0;"></p>
                        </div>
                        <div style="overflow-x: auto;">
                            <table id="evalTabTable" style="width:100%; border-collapse: collapse;">
                                <thead id="evalTabThead"></thead>
                                <tbody id="evalTabTbody"></tbody>
                            </table>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 50px; padding: 0 30px;">
                            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;"><strong>Course Coordinator</strong></div>
                            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;"><strong>Vice Principal</strong></div>
                            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;"><strong>Principal</strong></div>
                        </div>
                    </div>
                </div>

                <!-- SUB-SECTION 5: MERIT & AUTO-GROUPING ENGINE -->
                <div id="eval-regroup-sec" class="eval-sub-sec">
                    <div class="eval-main-box" style="padding: 18px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                            <div>
                                <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0; color: #0f172a;">Dynamic Merit & Grouping Engine</h3>
                                <p style="font-size: 0.78rem; color: #64748b; margin: 2px 0 0 0;">Top 55 ➔ Group-A | Next 50 ➔ Group-B | Rest ➔ Group-C (Combined Science Merit)</p>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="eval-btn eval-btn-primary" onclick="window.runAutoGroupingPreview()">Calculate New Groups</button>
                                <button class="eval-btn eval-btn-success" id="btnApplyRegroup" style="display:none;" onclick="window.applyPromoteNewGroups()">Promote & Set for Next Exam</button>
                            </div>
                        </div>
                    </div>

                    <div class="eval-main-box" id="regroupPreviewBox" style="display: none;">
                        <div style="padding: 10px 16px; background: #eff6ff; border-bottom: 1px solid #bfdbfe; font-size: 0.82rem; font-weight: 700; color: #1e40af;">
                            Preview of Generated New Groups:
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="eval-table">
                                <thead>
                                    <tr>
                                        <th style="width: 60px; text-align:center;">Merit</th>
                                        <th style="width: 110px;">Student ID</th>
                                        <th>Name</th>
                                        <th style="width: 60px; text-align:center;">Roll</th>
                                        <th style="width: 90px; text-align:center;">Total Marks</th>
                                        <th style="width: 110px; text-align:center;">Previous Group</th>
                                        <th style="width: 130px; text-align:center; background:#dbeafe; color:#1e40af;">PROMOTED GROUP</th>
                                    </tr>
                                </thead>
                                <tbody id="regroupPreviewTbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SUB-SECTION 6: EXAM ARCHIVES -->
                <div id="eval-archive-sec" class="eval-sub-sec">
                    <div class="eval-main-box" style="padding: 16px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label style="font-size: 0.80rem; font-weight: 700; color: #475569;">Select Past Exam:</label>
                            <select id="archiveExamSelect" class="eval-search-inp" style="width: 260px; border-radius: 20px;" onchange="window.loadArchivedExamData()">
                                <option value="">-- Select Archived Exam --</option>
                            </select>
                        </div>
                    </div>
                    <div id="archiveContentArea"></div>
                </div>

                <!-- CREATE NEW EXAM MODAL -->
                <div class="eval-modal-overlay" id="createExamModal" onclick="if(event.target === this) window.closeCreateExamModal()">
                    <div class="eval-modal-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <div style="font-size: 1.05rem; font-weight: 800; color: #0f172a;">Create New Exam Session</div>
                            <button style="background:transparent; border:none; font-size:1.2rem; color:#94a3b8; cursor:pointer;" onclick="window.closeCreateExamModal()">✕</button>
                        </div>

                        <div style="margin-bottom: 10px;">
                            <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 4px; display: block;">Exam Name:</label>
                            <input type="text" id="newExName" placeholder="e.g. Fortnightly Test-03" class="eval-search-inp" style="width: 100%; border-radius:12px;">
                        </div>

                        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                            <div style="flex: 1;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 4px; display: block;">Exam Date:</label>
                                <input type="text" id="newExDate" placeholder="e.g. 05 Oct 2026" class="eval-search-inp" style="width: 100%; border-radius:12px;">
                            </div>
                            <div style="width: 120px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 4px; display: block;">Mark Per Sub:</label>
                                <input type="number" id="newExMax" value="15" class="eval-search-inp" style="width: 100%; border-radius:12px;">
                            </div>
                        </div>

                        <button type="button" class="eval-btn eval-btn-primary" style="width: 100%; justify-content: center; padding: 10px; border-radius:25px;" onclick="window.confirmCreateNewExam()">
                            Create Exam Session
                        </button>
                    </div>
                </div>

                <!-- IMPORT EXCEL MODAL -->
                <div class="eval-modal-overlay" id="evalUploadModal" onclick="if(event.target === this) window.closeEvalUploadModal()">
                    <div class="eval-modal-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a;">Upload Student List</div>
                            <button style="background:transparent; border:none; font-size:1.2rem; color:#94a3b8; cursor:pointer;" onclick="window.closeEvalUploadModal()">✕</button>
                        </div>
                        <div style="margin-bottom: 14px;">
                            <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 5px; display: block;">Target Stream:</label>
                            <select id="evalUploadTargetGroup" style="width: 100%; padding: 8px 12px; border: 1.5px solid #cbd5e1; border-radius: 20px; font-size: 0.82rem; font-weight: 600; outline:none; background:#fff;">
                                <option value="Science">Science (Group-A, B, C)</option>
                                <option value="Humanities">Humanities</option>
                                <option value="B.Studies">Business Studies</option>
                            </select>
                        </div>
                        <div style="border: 2px dashed #93c5fd; border-radius: 16px; background: #f8fafc; padding: 20px; text-align: center; cursor: pointer;" onclick="document.getElementById('evalExcelFile').click()">
                            <div style="font-size: 0.85rem; color: #1e40af; font-weight: 700;">Choose Excel File (.xlsx, .csv)</div>
                            <input type="file" id="evalExcelFile" accept=".xlsx, .xls, .csv" style="display: none;" onchange="window.handleEvalFileSelected(this.files[0])">
                        </div>
                        <div id="evalFileStatusBox" style="display:none; align-items:center; justify-content:space-between; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:12px; padding:8px 12px; margin-top:12px; font-size:0.78rem;">
                            <span id="evalSelectedFileName" style="font-weight:700; color:#0f172a;"></span>
                        </div>
                        <button type="button" class="eval-btn eval-btn-primary" id="evalUploadNowBtn" style="width: 100%; margin-top: 14px; justify-content:center; border-radius:25px;" onclick="window.triggerEvalUpload()">Upload Now</button>
                    </div>
                </div>
            `;
            mainWrapper.appendChild(viewDiv);
        }
    }

    // ==========================================================
    // ৩. সাব-সেকশন স্যুইচিং
    // ==========================================================
    window.toggleExamMenu = function (e) {
        if (e) e.preventDefault();
        const sub = document.getElementById('exam-submenu-list');
        const chevron = document.getElementById('exam-chevron-icon');
        if (!sub) return;
        if (sub.style.display === 'flex') {
            sub.style.display = 'none';
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        } else {
            sub.style.display = 'flex';
            sub.style.flexDirection = 'column';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
    };

    window.switchExamSubSection = function (secId) {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const pnl = document.getElementById('exam-eval-view');
        if (pnl) pnl.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "Exam Evaluation & Tabulation";

        document.querySelectorAll('.eval-sub-sec').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(secId);
        if (target) target.classList.add('active');

        if (secId === 'eval-student-sec') window.renderEvalStudents();
        if (secId === 'eval-config-sec') window.renderExamManager();
        if (secId === 'eval-admin-entry-sec') window.initAdminMarkEntryView();
        if (secId === 'eval-tab-sec') window.renderEvalTabulation();
        if (secId === 'eval-regroup-sec') window.setupRegroupSection();
        if (secId === 'eval-archive-sec') window.renderArchivesDropdown();
    };

    // ==========================================================
    // ৪. এডমিন মার্ক এন্ট্রি ইঞ্জিন লজিক
    // ==========================================================
    window.initAdminMarkEntryView = function () {
        const exSel = document.getElementById('adminSelExam');
        if (exSel) {
            exSel.innerHTML = `<option value="${activeExamId}">${activeExamData.title}</option>`;
        }
        document.getElementById('adminMaxMarkSpan').innerText = activeExamData.max || 15;
        window.adminOnGroupChanged();
        document.getElementById('adminMarkTableBox').style.display = 'none';
    };

    window.adminOnGroupChanged = function () {
        const grp = document.getElementById('adminSelGroup').value;
        const subSel = document.getElementById('adminSelSubject');
        if (!subSel) return;
        subSel.innerHTML = '';

        let cat = 'Science';
        if (grp === 'Humanities') cat = 'Humanities';
        else if (grp === 'B.Studies') cat = 'BStudies';

        let subs = MASTER_SUBJECTS[cat] || [];
        if (activeExamData.activeSubjects && activeExamData.activeSubjects.length > 0) {
            subs = subs.filter(s => activeExamData.activeSubjects.includes(s.key));
        }

        subs.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.key;
            opt.innerText = `${s.name} (${s.key})`;
            subSel.appendChild(opt);
        });
    };

    window.adminLoadStudentsForEntry = function () {
        const grp = document.getElementById('adminSelGroup').value;
        const sub = document.getElementById('adminSelSubject').value;
        const tbody = document.getElementById('adminStudentTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!sub) {
            alert("Please select a subject!");
            return;
        }

        let filtered = studentsList.filter(s => {
            if (grp === 'Humanities') return s.group === 'Humanities';
            if (grp === 'B.Studies') return s.group === 'B.Studies';
            
            // সায়েন্স গ্রুপ সমন্বয় (নিরাপদ fallback সহ)
            const sRank = Number(s.overallRank !== undefined && s.overallRank !== null ? s.overallRank : s.sl);
            const subGrp = s.subGroup || (sRank <= 55 ? 'Group-A' : (sRank <= 105 ? 'Group-B' : 'Group-C'));
            return s.group === 'Science' && subGrp === grp;
        });

        // মেধা অনুযায়ী সর্ট
        filtered.sort((a, b) => {
            const rA = (a.overallRank !== undefined && a.overallRank !== null) ? Number(a.overallRank) : (Number(a.sl) || 9999);
            const rB = (b.overallRank !== undefined && b.overallRank !== null) ? Number(b.overallRank) : (Number(b.sl) || 9999);
            return rA - rB;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:#dc2626; font-weight:700;">No students found for ${grp}!</td></tr>`;
            document.getElementById('adminMarkTableBox').style.display = 'block';
            return;
        }

        const maxMark = activeExamData.max || 15;

        filtered.forEach((s, idx) => {
            const prevVal = (examMarks[s.id] && examMarks[s.id][sub] !== undefined) ? examMarks[s.id][sub] : '';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; font-weight: 700; color: #1e40af;">${idx + 1}</td>
                <td><span style="font-family: monospace; font-weight: 700;">${s.id}</span></td>
                <td style="font-weight: 600;">${s.name}</td>
                <td style="text-align: center;">${s.roll}</td>
                <td style="text-align: center; font-weight: 700;">${s.section || ''}</td>
                <td style="text-align: center;">
                    <input type="text" 
                           inputmode="decimal" 
                           class="admin-eval-inp" 
                           id="admin_inp_${idx}" 
                           data-id="${s.id}" 
                           value="${prevVal}" 
                           placeholder="-"
                           oninput="window.adminValidateInput(this, ${maxMark})"
                           onkeydown="window.adminOnKeyEnter(event, ${idx})">
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('adminMarkTableBox').style.display = 'block';

        setTimeout(() => {
            const first = document.getElementById('admin_inp_0');
            if (first) {
                first.focus();
                first.select();
            }
        }, 150);
    };

    window.adminValidateInput = function (inp, max) {
        inp.value = inp.value.replace(/[^0-9.]/g, '');
        if ((inp.value.match(/\./g) || []).length > 1) {
            inp.value = inp.value.slice(0, -1);
        }
        const num = parseFloat(inp.value);
        if (!isNaN(num) && (num > max || num < 0)) {
            inp.classList.add('has-error');
        } else {
            inp.classList.remove('has-error');
        }
    };

    window.adminOnKeyEnter = function (e, idx) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const next = document.getElementById(`admin_inp_${idx + 1}`);
            if (next) {
                next.focus();
                next.select();
            } else {
                document.getElementById('btnAdminSaveMarks').focus();
            }
        }
    };

    // নিরাপদ মার্কস সেভ (নিরাপত্তা গার্ড সহ)
    window.adminSaveMarksLive = async function () {
        const sub = document.getElementById('adminSelSubject').value;
        const grp = document.getElementById('adminSelGroup').value;
        const inputs = document.querySelectorAll('.admin-eval-inp');
        if (inputs.length === 0) return;

        const maxMark = activeExamData.max || 15;
        let hasErrors = false;
        inputs.forEach(inp => {
            const num = parseFloat(inp.value.trim());
            if (!isNaN(num) && (num > maxMark || num < 0)) hasErrors = true;
        });

        if (hasErrors) {
            alert(`Some marks exceed the maximum mark (${maxMark}). Please correct red fields.`);
            return;
        }

        const btn = document.getElementById('btnAdminSaveMarks');
        const updates = {};
        let count = 0;

        inputs.forEach(inp => {
            const stdId = inp.getAttribute('data-id');
            const val = inp.value.trim();
            const path = `evaluation_system/marks/${activeExamId}/${stdId}/${sub}`;

            if (val !== '') {
                const num = parseFloat(val);
                if (!isNaN(num) && num >= 0 && num <= maxMark) {
                    updates[path] = String(num);
                    if (!examMarks[stdId]) examMarks[stdId] = {};
                    examMarks[stdId][sub] = String(num);
                    count++;
                }
            }
        });

        if (Object.keys(updates).length === 0) {
            alert("কোনো নতুন বা পরিবর্তিত নম্বর পাওয়া যায়নি। দয়া করে নম্বর বসিয়ে সেভ করুন।");
            return;
        }

        btn.disabled = true;
        btn.innerText = "Saving...";

        try {
            await dbUpdate(updates);
            alert(`Success!\nMarks saved for ${count} students in ${sub} (${grp}).`);
        } catch (err) {
            alert("Error saving: " + err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = `${ICONS.save} Save Marks`;
        }
    };

    // ==========================================================
    // ৫. এক্সাম ম্যানেজার ও সাবজেক্ট কন্ট্রোল
    // ==========================================================
    window.renderExamManager = function () {
        document.getElementById('mgrExamTitle').innerText = `Active: ${activeExamData.title}`;
        document.getElementById('mgrExamMeta').innerText = `Date: ${activeExamData.date} • Full Mark: ${activeExamData.max || 15}`;

        const lockBtn = document.getElementById('btnToggleLock');
        if (activeExamData.isLocked) {
            lockBtn.style.background = "#16a34a";
            lockBtn.innerHTML = 'Unlock Entry';
        } else {
            lockBtn.style.background = "#dc2626";
            lockBtn.innerHTML = 'Lock Entry';
        }

        const chipBox = document.getElementById('activeSubjectsChips');
        chipBox.innerHTML = '';
        
        const allSubsMap = new Map();
        Object.keys(MASTER_SUBJECTS).forEach(stream => {
            MASTER_SUBJECTS[stream].forEach(s => {
                if (!allSubsMap.has(s.key)) allSubsMap.set(s.key, s.name);
            });
        });

        allSubsMap.forEach((name, key) => {
            const isAct = !activeExamData.activeSubjects || activeExamData.activeSubjects.includes(key);
            const chip = document.createElement('span');
            chip.className = `sub-chip ${isAct ? 'active' : ''}`;
            chip.innerHTML = `${isAct ? '✓' : '+'} ${key}`;
            chip.title = name;
            chip.onclick = () => window.toggleSubjectActive(key);
            chipBox.appendChild(chip);
        });

        window.renderEvalPins();
    };

    window.toggleSubjectActive = async function (key) {
        if (!activeExamData.activeSubjects) activeExamData.activeSubjects = [];
        const idx = activeExamData.activeSubjects.indexOf(key);
        if (idx > -1) activeExamData.activeSubjects.splice(idx, 1);
        else activeExamData.activeSubjects.push(key);

        await dbSet(`evaluation_system/exams/${activeExamId}/activeSubjects`, activeExamData.activeSubjects);
        window.renderExamManager();
    };

    window.toggleExamLock = async function () {
        activeExamData.isLocked = !activeExamData.isLocked;
        await dbSet(`evaluation_system/exams/${activeExamId}/isLocked`, activeExamData.isLocked);
        window.renderExamManager();
        alert(activeExamData.isLocked ? "Exam locked! Teachers cannot edit marks." : "Exam unlocked! Teachers can now enter marks.");
    };

    window.openCreateExamModal = function () { document.getElementById('createExamModal').style.display = 'flex'; };
    window.closeCreateExamModal = function () { document.getElementById('createExamModal').style.display = 'none'; };

    window.confirmCreateNewExam = async function () {
        const title = document.getElementById('newExName').value.trim();
        const date = document.getElementById('newExDate').value.trim();
        const max = parseFloat(document.getElementById('newExMax').value) || 15;

        if (!title) {
            alert("Please enter exam title!");
            return;
        }

        let freshMarks = examMarks;
        if (_get && _ref && _db) {
            try {
                const mSnap = await _get(_ref(_db, `evaluation_system/marks/${activeExamId}`));
                if (mSnap.exists()) freshMarks = mSnap.val();
            } catch (e) {
                console.warn("Could not fetch fresh marks for archive:", e);
            }
        }

        const newId = `exam_${Date.now()}`;
        const newExamObj = {
            id: newId,
            title: title,
            date: date,
            max: max,
            isLocked: false,
            createdAt: new Date().toISOString(),
            activeSubjects: ['B1', 'B2', 'E1', 'E2', 'Math', 'HM_AG', 'Phy', 'Che', 'Bio', 'BGS', 'Reli', 'ICT', 'His', 'Geo', 'Civ', 'Fin', 'Acc', 'BE', 'Sci', 'AG_HE']
        };

        await dbSet(`evaluation_system/archives/${activeExamId}`, {
            examInfo: activeExamData,
            marks: freshMarks,
            archivedAt: new Date().toISOString()
        });

        await dbSet(`evaluation_system/exams/${newId}`, newExamObj);
        await dbSet(`evaluation_system/active_exam_id`, newId);

        alert(`New Exam Session "${title}" created successfully! The system will now reload.`);
        window.location.reload();
    };

    // ==========================================================
    // ৬. পিন ও কন্ট্রোল
    // ==========================================================
    window.renderEvalPins = function () {
        const tbody = document.getElementById('evalPinTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const streams = [
            { name: 'Science', list: MASTER_SUBJECTS.Science },
            { name: 'Humanities', list: MASTER_SUBJECTS.Humanities },
            { name: 'B.Studies', list: MASTER_SUBJECTS.BStudies }
        ];

        streams.forEach(strObj => {
            strObj.list.forEach(s => {
                const isAct = !activeExamData.activeSubjects || activeExamData.activeSubjects.includes(s.key);
                if (!isAct) return;

                const pinKey = getStreamPinKey(strObj.name, s.key);
                const p = subjectPins[pinKey] || subjectPins[s.key] || '';

                let hasMarks = false;
                Object.keys(examMarks).forEach(stdId => {
                    const student = studentsList.find(st => st.id === stdId);
                    if (student && student.group === strObj.name) {
                        const stdObj = examMarks[stdId];
                        if (stdObj && stdObj[s.key] !== undefined && stdObj[s.key] !== '') hasMarks = true;
                    }
                });

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding-left: 15px;"><span class="eval-badge eval-badge-primary">${strObj.name}</span></td>
                    <td style="font-weight:700;">${s.name} (${s.key})</td>
                    <td><span class="eval-badge ${hasMarks ? 'eval-badge-success' : (p ? 'eval-badge-primary' : 'eval-badge-danger')}">${hasMarks ? '✓ Submitted' : (p ? 'Ready' : 'Pending')}</span></td>
                    <td><strong style="letter-spacing: 2px; color:#1e40af;">${p || '----'}</strong></td>
                    <td style="text-align:center;">
                        <button class="eval-btn" style="background:#fee2e2; color:#dc2626; padding:4px 10px; font-size:0.72rem;" onclick="window.resetEvalPin('${pinKey}')" ${!p ? 'disabled style="opacity:0.3;"' : ''}>Reset</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        });
    };

    window.refreshEvalPinsLive = async function () {
        const btn = document.getElementById('btnRefreshPins');
        if (btn) btn.innerText = "Syncing...";
        try {
            if (_get && _ref && _db) {
                const pSnap = await _get(_ref(_db, 'evaluation_system/pins'));
                subjectPins = pSnap.exists() ? pSnap.val() : {};
                const mSnap = await _get(_ref(_db, `evaluation_system/marks/${activeExamId}`));
                examMarks = mSnap.exists() ? mSnap.val() : {};
                window.renderEvalPins();
                alert("Pins & Marks live synced!");
            }
        } finally {
            if (btn) btn.innerText = "Refresh PINs";
        }
    };

    window.resetEvalPin = async function (pinKey) {
        if (confirm("Reset PIN for " + pinKey + "?")) {
            delete subjectPins[pinKey];
            window.renderEvalPins();
            await dbSet(`evaluation_system/pins/${pinKey}`, null);
        }
    };

    window.copyEvalTeacherLink = function () {
        const link = "https://cpscl.vercel.app";
        navigator.clipboard.writeText(link).then(() => alert("Teacher link copied:\n" + link));
    };

    // ==========================================================
    // ৭. টেবুলেশন ডাটা ও অন-স্ক্রিন শিট রেন্ডার (কম্বাইন্ড মেধা ভিত্তি)
    // ==========================================================
    function getProcessedTabulationData() {
        const grp = document.getElementById('evalTabGroup') ? document.getElementById('evalTabGroup').value : 'Science_Merit';
        let activeSubs = MASTER_SUBJECTS.Science;
        let groupLabel = "Science";
        let subGroupLabel = grp;

        if (grp === 'Humanities') {
            activeSubs = MASTER_SUBJECTS.Humanities;
            groupLabel = "Humanities";
            subGroupLabel = "Humanities";
        } else if (grp === 'B.Studies') {
            activeSubs = MASTER_SUBJECTS.BStudies;
            groupLabel = "Business Studies";
            subGroupLabel = "Business Studies";
        } else if (grp === 'Science_Merit') {
            subGroupLabel = "Combined Merit";
        }

        if (activeExamData.activeSubjects && activeExamData.activeSubjects.length > 0) {
            activeSubs = activeSubs.filter(s => activeExamData.activeSubjects.includes(s.key));
        }

        const perSubMax = activeExamData.max || 15;
        const streamTotalMarks = activeSubs.length * perSubMax;

        let list = [];
        if (grp === 'Humanities') list = studentsList.filter(s => s.group === 'Humanities');
        else if (grp === 'B.Studies') list = studentsList.filter(s => s.group === 'B.Studies');
        else if (grp === 'Science_Merit') list = studentsList.filter(s => s.group === 'Science');
        else {
            list = studentsList.filter(s => {
                if (s.group !== 'Science') return false;
                const sRank = Number(s.overallRank !== undefined && s.overallRank !== null ? s.overallRank : s.sl);
                const subGrp = s.subGroup || (sRank <= 55 ? 'Group-A' : (sRank <= 105 ? 'Group-B' : 'Group-C'));
                return subGrp === grp;
            });
        }

        let computedList = list.map(s => {
            const m = examMarks[s.id] || {};
            let total = 0;
            activeSubs.forEach(sb => {
                let v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, marksObj: m };
        });

        // বিজ্ঞান বিভাগের কম্বাইন্ড মেধা তালিকা তৈরি (মোট নম্বরের ভিত্তিতে সর্টিং)
        if (grp === 'Science_Merit') {
            computedList.sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                const prevRankA = (a.overallRank !== undefined && a.overallRank !== null) ? Number(a.overallRank) : (Number(a.sl) || 9999);
                const prevRankB = (b.overallRank !== undefined && b.overallRank !== null) ? Number(b.overallRank) : (Number(b.sl) || 9999);
                return prevRankA - prevRankB;
            });
        } else {
            computedList.sort((a, b) => {
                const rankA = (a.overallRank !== undefined && a.overallRank !== null) ? Number(a.overallRank) : (Number(a.sl) || 9999);
                const rankB = (b.overallRank !== undefined && b.overallRank !== null) ? Number(b.overallRank) : (Number(b.sl) || 9999);
                return rankA - rankB;
            });
        }

        return { grp, groupLabel, subGroupLabel, activeSubs, streamTotalMarks, computedList };
    }

    window.renderEvalTabulation = function () {
        const thead = document.getElementById('evalTabThead');
        const tbody = document.getElementById('evalTabTbody');
        const meta = document.getElementById('evalPrintMeta');
        if (!thead || !tbody) return;

        const { groupLabel, activeSubs, streamTotalMarks, computedList } = getProcessedTabulationData();

        meta.innerText = `Class: Ten (${groupLabel}) • Exam: ${activeExamData.title} • Date: ${activeExamData.date} • Total: ${streamTotalMarks} Marks`;

        thead.innerHTML = `
            <tr style="background:#f1f5f9;">
                <th style="border:1px solid #000; padding:6px; width:45px; text-align:center;">SL</th>
                <th style="border:1px solid #000; padding:6px; width:75px; text-align:center;">Std ID</th>
                <th style="border:1px solid #000; padding:6px; text-align:left; padding-left:10px;">Student Name</th>
                <th style="border:1px solid #000; padding:6px; width:45px; text-align:center;">Roll</th>
                <th style="border:1px solid #000; padding:6px; width:45px; text-align:center;">Sec</th>
                ${activeSubs.map(s => `<th style="border:1px solid #000; padding:4px; text-align:center;">${s.key === 'HM_AG' ? 'HM/AG' : (s.key === 'AG_HE' ? 'AG/HE' : s.key)}</th>`).join('')}
                <th style="border:1px solid #000; padding:6px; width:75px; background:#e2e8f0; text-align:center;">Total (${streamTotalMarks})</th>
            </tr>
        `;

        tbody.innerHTML = '';
        computedList.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="border:1px solid #000; text-align:center; font-weight:700;">${idx + 1}</td>
                <td style="border:1px solid #000; text-align:center; font-family:monospace; font-weight:700;">${s.id}</td>
                <td style="border:1px solid #000; text-align:left; padding-left:10px; font-weight:700;">${s.name}</td>
                <td style="border:1px solid #000; text-align:center;">${s.roll}</td>
                <td style="border:1px solid #000; text-align:center; font-weight:700;">${s.section || ''}</td>
                ${activeSubs.map(sb => {
                    const markVal = s.marksObj[sb.key];
                    const displayMark = markVal !== undefined && markVal !== null && markVal !== '' ? markVal : '-';
                    return `<td style="border:1px solid #000; text-align:center; font-weight:${displayMark !== '-' ? '700' : 'normal'}; color:${displayMark === '0' ? '#dc2626' : 'inherit'};">${displayMark}</td>`;
                }).join('')}
                <td style="border:1px solid #000; text-align:center; font-weight:800; background:#f8fafc; color:#1e40af;">${s.total}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // ==========================================================
    // ৮. প্রিন্ট ও এক্সেল রিপোর্ট (নিখুঁত ফাঁকা শিট ও ৩ জনের স্বাক্ষর)
    // ==========================================================
    window.openEvaluationPrintTab = function (isBlank = false) {
        const { groupLabel, subGroupLabel, activeSubs, streamTotalMarks, computedList } = getProcessedTabulationData();

        const printWin = window.open('', '_blank');
        if (!printWin) {
            alert("Pop-up blocked! Please allow pop-ups for this site.");
            return;
        }

        const totalCols = 5 + activeSubs.length + 1;

        const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${activeExamData.title} - ${subGroupLabel} ${isBlank ? '(Blank Sheet)' : ''}</title>
    <style>
        @page { size: A4 portrait; margin: 12mm 10mm 12mm 10mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 0; background-color: #fff; }
        .report-container { width: 100%; max-width: 210mm; margin: 0 auto; }
        .header-cell { border: none !important; padding: 0 0 8px 0 !important; text-align: center; }
        .header-cell h1 { font-size: 18px; font-weight: bold; margin: 0 0 3px 0; }
        .header-cell p { font-size: 13px; margin: 2px 0; font-weight: normal; }
        .date-container { text-align: right; font-size: 12px; font-weight: normal; margin-top: 5px; padding-right: 5px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; page-break-inside: avoid; }
        th, td { border: 1px solid #000; padding: 4px 3px; text-align: center; }
        th.col-header { font-weight: bold; font-size: 11px; background-color: #fff; padding: 5px 2px; }
        .col-name { width: 185px; text-align: left; padding-left: 6px; white-space: nowrap; }
        .signature-section { margin-top: calc(60px + 0.8in); display: flex; justify-content: space-between; padding: 0 30px; font-size: 13px; font-weight: bold; }
        @media print { body { padding: 0; background: #fff; } .report-container { padding: 0; box-shadow: none; } }
    </style>
</head>
<body>
    <div class="report-container">
        <table>
            <thead>
                <tr>
                    <th colspan="${totalCols}" class="header-cell">
                        <h1>Cantonment Public School and College Lalmonirhat</h1>
                        <p>Performance Evaluation</p>
                        <p>Class: Ten (${groupLabel})</p>
                        <p>${activeExamData.title}</p>
                        <p>${subGroupLabel}</p>
                        <div class="date-container">Date : ${activeExamData.date || ''}</div>
                    </th>
                </tr>
                <tr>
                    <th class="col-header">SL</th>
                    <th class="col-header">Std ID</th>
                    <th class="col-header col-name">Student Name</th>
                    <th class="col-header">Roll</th>
                    <th class="col-header">Sec</th>
                    ${activeSubs.map(s => `<th class="col-header">${s.key === 'HM_AG' ? 'HM/AG' : (s.key === 'AG_HE' ? 'AG/HE' : s.key)}</th>`).join('')}
                    <th class="col-header">Total<br>(${streamTotalMarks})</th>
                </tr>
            </thead>
            <tbody>
                ${computedList.map((s, idx) => `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${s.id}</td>
                        <td class="col-name">${s.name}</td>
                        <td>${s.roll}</td>
                        <td>${s.section || ''}</td>
                        ${activeSubs.map(sb => {
                            if (isBlank) return '<td></td>';
                            const markVal = s.marksObj[sb.key];
                            return `<td>${(markVal !== undefined && markVal !== null && markVal !== '') ? markVal : '0'}</td>`;
                        }).join('')}
                        <td>${isBlank ? '' : s.total}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="signature-section">
            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;">Course Coordinator</div>
            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;">Vice Principal</div>
            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;">Principal</div>
        </div>
    </div>
</body>
</html>`;

        printWin.document.open();
        printWin.document.write(reportHTML);
        printWin.document.close();
        setTimeout(() => {
            printWin.focus();
            printWin.print();
        }, 500);
    };

    window.exportTabulationToExcel = function () {
        if (typeof XLSX === 'undefined') {
            alert("SheetJS (XLSX) library not found!");
            return;
        }

        const { groupLabel, subGroupLabel, activeSubs, streamTotalMarks, computedList } = getProcessedTabulationData();

        const aoaData = [
            ["Cantonment Public School and College Lalmonirhat"],
            ["Performance Evaluation"],
            [`Class: Ten (${groupLabel})`],
            [`${activeExamData.title} - ${subGroupLabel}`],
            [`Date : ${activeExamData.date || ''}`],
            []
        ];

        const headerRow = ["SL", "Std ID", "Student Name", "Roll", "Sec"];
        activeSubs.forEach(s => headerRow.push(s.key === 'HM_AG' ? 'HM/AG' : (s.key === 'AG_HE' ? 'AG/HE' : s.key)));
        headerRow.push(`Total (${streamTotalMarks})`);
        aoaData.push(headerRow);

        computedList.forEach((s, idx) => {
            const row = [idx + 1, s.id, s.name, s.roll, s.section || ''];
            activeSubs.forEach(sb => {
                const markVal = s.marksObj[sb.key];
                row.push((markVal !== undefined && markVal !== null && markVal !== '') ? Number(markVal) : 0);
            });
            row.push(s.total);
            aoaData.push(row);
        });

        const ws = XLSX.utils.aoa_to_sheet(aoaData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Evaluation_Report");
        XLSX.writeFile(wb, `${activeExamData.title}_${subGroupLabel}_Report.xlsx`);
    };

    // ==========================================================
    // ৯. অটো-গ্রুপিং ইঞ্জিন (আগে একক রেজাল্ট ➔ পরে গ্রুপ বণ্টন)
    // ==========================================================
    window.setupRegroupSection = function () {
        document.getElementById('regroupPreviewBox').style.display = 'none';
        document.getElementById('btnApplyRegroup').style.display = 'none';
    };

    window.runAutoGroupingPreview = function () {
        let activeSubs = MASTER_SUBJECTS.Science;
        if (activeExamData.activeSubjects && activeExamData.activeSubjects.length > 0) {
            activeSubs = activeSubs.filter(s => activeExamData.activeSubjects.includes(s.key));
        }

        const sciList = studentsList.filter(s => s.group === 'Science');
        let computed = sciList.map(s => {
            const m = examMarks[s.id] || {};
            let total = 0;
            activeSubs.forEach(sb => {
                let v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total };
        });

        // নিরাপত্তা গার্ড: বিজ্ঞান বিভাগের কারও নম্বর না উঠলে গ্রুপ পরিবর্তন বন্ধ থাকবে
        const maxScore = Math.max(...computed.map(s => s.total), 0);
        if (maxScore <= 0) {
            alert("⚠️ পরীক্ষার কোনো নম্বর এখনো ওঠেনি (সবার মোট নম্বর ০)!\nআগে শিক্ষকদের নম্বর এন্ট্রি করতে দিন, তারপর মেধা অনুযায়ী নতুন গ্রুপ তৈরি করা যাবে।");
            return;
        }

        // বিজ্ঞান বিভাগের একক মেধা তালিকা (Combined Merit) তৈরি
        computed.sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            const rankA = (a.overallRank !== undefined && a.overallRank !== null) ? Number(a.overallRank) : (Number(a.sl) || 9999);
            const rankB = (b.overallRank !== undefined && b.overallRank !== null) ? Number(b.overallRank) : (Number(b.sl) || 9999);
            return rankA - rankB;
        });

        // কাট-অফ স্কোর নির্ধারণ
        let cutoffScoreA = null;
        let cutoffScoreB = null;

        computed.forEach((s, idx) => {
            s.overallRank = idx + 1;
            if (idx === 54) cutoffScoreA = s.total;  // ৫৫তম পজিশন
            if (idx === 104) cutoffScoreB = s.total; // ১০৫তম পজিশন
        });

        // মেধার ভিত্তিতে গ্রুপ বণ্টন
        computed.forEach(s => {
            const rank = s.overallRank;
            let newGrp = "Group-C";

            if (rank <= 55 || (cutoffScoreA !== null && cutoffScoreA > 0 && s.total >= cutoffScoreA)) {
                newGrp = "Group-A";
            } else if (rank <= 105 || (cutoffScoreB !== null && cutoffScoreB > 0 && s.total >= cutoffScoreB)) {
                newGrp = "Group-B";
            }

            s.newGroupTag = newGrp;
        });

        computedMeritCache = computed;

        const tbody = document.getElementById('regroupPreviewTbody');
        tbody.innerHTML = '';
        computed.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center; font-weight:800; color:#1e40af;">#${s.overallRank}</td>
                <td><span style="font-weight:700; font-family:monospace;">${s.id}</span></td>
                <td style="font-weight:700;">${s.name}</td>
                <td style="text-align:center;">${s.roll}</td>
                <td style="text-align:center; font-weight:800;">${s.total}</td>
                <td style="text-align:center;"><span style="color:#64748b;">${s.subGroup || s.group}</span></td>
                <td style="text-align:center;"><span style="background:#1e40af; color:white; padding:3px 10px; border-radius:20px; font-weight:800;">${s.newGroupTag}</span></td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('regroupPreviewBox').style.display = 'block';
        document.getElementById('btnApplyRegroup').style.display = 'inline-flex';
    };

    window.applyPromoteNewGroups = async function () {
        if (!computedMeritCache || computedMeritCache.length === 0) return;

        if (confirm("Are you sure you want to promote and save these NEW groups permanently for the Next Exam?")) {
            const updates = {};
            computedMeritCache.forEach(s => {
                const found = studentsList.find(st => st.id === s.id);
                if (found) {
                    found.subGroup = s.newGroupTag;
                    found.overallRank = s.overallRank;
                }
                updates[`evaluation_system/students/${s.id}/subGroup`] = s.newGroupTag;
                updates[`evaluation_system/students/${s.id}/overallRank`] = s.overallRank;
            });

            try {
                await dbUpdate(updates);
                alert("Groups successfully updated and locked for Next Exam!");
                window.renderEvalStudents();
            } catch (err) {
                alert("Failed to update groups: " + err.message);
            }
        }
    };

    // ==========================================================
    // ১০. আর্কাইভ ভিউয়ার
    // ==========================================================
    window.renderArchivesDropdown = async function () {
        const sel = document.getElementById('archiveExamSelect');
        sel.innerHTML = '<option value="">-- Select Archived Exam --</option>';

        if (_get && _ref && _db) {
            const snap = await _get(_ref(_db, 'evaluation_system/archives'));
            if (snap.exists()) {
                const data = snap.val();
                Object.keys(data).forEach(k => {
                    const ex = data[k].examInfo || {};
                    const opt = document.createElement('option');
                    opt.value = k;
                    opt.innerText = `${ex.title || k} (${ex.date || ''})`;
                    sel.appendChild(opt);
                });
            }
        }
    };

    window.loadArchivedExamData = async function () {
        const exId = document.getElementById('archiveExamSelect').value;
        const area = document.getElementById('archiveContentArea');
        if (!exId) { area.innerHTML = ''; return; }

        area.innerHTML = '<div style="text-align:center; padding:20px;">Loading Archive...</div>';
        if (_get && _ref && _db) {
            const snap = await _get(_ref(_db, `evaluation_system/archives/${exId}`));
            if (snap.exists()) {
                const data = snap.val();
                area.innerHTML = `
                    <div class="eval-main-box" style="padding:16px; margin-top:12px;">
                        <h4 style="font-weight:800; color:#1e40af; margin-bottom:5px;">${data.examInfo?.title} (${data.examInfo?.date})</h4>
                        <p style="font-size:0.80rem; color:#64748b;">Archived at: ${new Date(data.archivedAt).toLocaleString()}</p>
                        <div style="background:#f8fafc; padding:12px; border-radius:12px; font-size:0.85rem;">
                            Total student marks archived: <strong>${Object.keys(data.marks || {}).length}</strong> records.
                        </div>
                    </div>
                `;
            }
        }
    };

    // ==========================================================
    // ১১. স্টুডেন্ট ডিরেক্টরি ও এক্সেল আপলোড ফাংশনসমূহ
    // ==========================================================
    window.openEvalUploadModal = function () {
        document.getElementById('evalUploadModal').style.display = 'flex';
    };

    window.closeEvalUploadModal = function () {
        document.getElementById('evalUploadModal').style.display = 'none';
        selectedUploadFile = null;
        document.getElementById('evalFileStatusBox').style.display = 'none';
        document.getElementById('evalExcelFile').value = '';
    };

    window.handleEvalFileSelected = function (file) {
        if (!file) return;
        selectedUploadFile = file;
        document.getElementById('evalSelectedFileName').innerText = file.name;
        document.getElementById('evalFileStatusBox').style.display = 'flex';
    };

    window.triggerEvalUpload = async function () {
        if (!selectedUploadFile) {
            alert("Please choose an Excel (.xlsx, .xls) file first!");
            return;
        }

        if (typeof XLSX === 'undefined') {
            alert("SheetJS (XLSX) library not found on the page!");
            return;
        }

        const targetGroup = document.getElementById('evalUploadTargetGroup').value;
        const uploadBtn = document.getElementById('evalUploadNowBtn');
        uploadBtn.disabled = true;
        uploadBtn.innerText = "Processing...";

        try {
            const data = await selectedUploadFile.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rawRows = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

            if (rawRows.length === 0) {
                alert("Excel file contains no data!");
                return;
            }

            const updates = {};
            let count = 0;

            rawRows.forEach((row, index) => {
                const sId = String(row.id || row.ID || row.Student_ID || row.Roll || (index + 1)).trim();
                const sName = String(row.name || row.Name || row.Student_Name || 'Unknown').trim();
                const sRoll = String(row.roll || row.Roll || '').trim();
                const sSec = String(row.section || row.Sec || row.Section || '').trim();
                const sSl = Number(row.sl || row.SL || (index + 1));

                let sSubGroup = targetGroup;
                if (targetGroup === 'Science') {
                    sSubGroup = row.subGroup || row.sub_group || (sSl <= 55 ? 'Group-A' : (sSl <= 105 ? 'Group-B' : 'Group-C'));
                }

                const stdObj = {
                    id: sId,
                    name: sName,
                    roll: sRoll,
                    section: sSec,
                    group: targetGroup,
                    subGroup: sSubGroup,
                    sl: sSl,
                    overallRank: sSl
                };

                updates[`evaluation_system/students/${sId}`] = stdObj;
                count++;
            });

            await dbUpdate(updates);
            alert(`🎉 Success!\nUploaded ${count} students to ${targetGroup}.`);
            window.closeEvalUploadModal();

            if (_get && _ref && _db) {
                const stdSnap = await _get(_ref(_db, 'evaluation_system/students'));
                if (stdSnap.exists()) {
                    studentsList = Object.values(stdSnap.val());
                    window.renderEvalStudents();
                }
            }
        } catch (err) {
            alert("Upload failed: " + err.message);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.innerText = "Upload Now";
        }
    };

    window.filterEvalByTab = function (filter, btn) {
        currentEvalFilter = filter;
        document.querySelectorAll('.eval-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.eval-stat-item').forEach(b => b.classList.remove('active'));

        if (btn) btn.classList.add('active');
        if (filter === 'All') document.getElementById('statCardAll')?.classList.add('active');
        if (filter === 'Science') document.getElementById('statCardSci')?.classList.add('active');
        if (filter === 'Humanities') document.getElementById('statCardHum')?.classList.add('active');
        if (filter === 'B.Studies') document.getElementById('statCardBs')?.classList.add('active');

        window.renderEvalStudents();
    };

    window.renderEvalStudents = function () {
        const tbody = document.getElementById('evalStudentTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const total = studentsList.length;
        const sciList = studentsList.filter(s => s.group === 'Science');
        const humList = studentsList.filter(s => s.group === 'Humanities');
        const bsList = studentsList.filter(s => s.group === 'B.Studies');

        const grpA = sciList.filter(s => s.subGroup === 'Group-A').length;
        const grpB = sciList.filter(s => s.subGroup === 'Group-B').length;
        const grpC = sciList.filter(s => s.subGroup === 'Group-C').length;

        if (document.getElementById('statValTotal')) document.getElementById('statValTotal').innerText = total;
        if (document.getElementById('statValSci')) document.getElementById('statValSci').innerText = sciList.length;
        if (document.getElementById('statSciBreakdown')) document.getElementById('statSciBreakdown').innerText = `A: ${grpA} | B: ${grpB} | C: ${grpC}`;
        if (document.getElementById('statValHum')) document.getElementById('statValHum').innerText = humList.length;
        if (document.getElementById('statValBs')) document.getElementById('statValBs').innerText = bsList.length;

        if (document.getElementById('cntAll')) document.getElementById('cntAll').innerText = total;
        if (document.getElementById('cntSci')) document.getElementById('cntSci').innerText = sciList.length;
        if (document.getElementById('cntGrpA')) document.getElementById('cntGrpA').innerText = grpA;
        if (document.getElementById('cntGrpB')) document.getElementById('cntGrpB').innerText = grpB;
        if (document.getElementById('cntGrpC')) document.getElementById('cntGrpC').innerText = grpC;
        if (document.getElementById('cntHum')) document.getElementById('cntHum').innerText = humList.length;
        if (document.getElementById('cntBs')) document.getElementById('cntBs').innerText = bsList.length;

        const qEl = document.getElementById('evalSearchInp');
        const q = (qEl ? qEl.value : '').toLowerCase().trim();

        let list = studentsList.filter(s => {
            let mGrp = true;
            if (currentEvalFilter === 'Humanities') mGrp = s.group === 'Humanities';
            else if (currentEvalFilter === 'B.Studies') mGrp = s.group === 'B.Studies';
            else if (currentEvalFilter === 'Science') mGrp = s.group === 'Science';
            else if (['Group-A', 'Group-B', 'Group-C'].includes(currentEvalFilter)) mGrp = s.subGroup === currentEvalFilter;

            let mQ = !q || String(s.id).toLowerCase().includes(q) || (s.name || '').toLowerCase().includes(q) || String(s.roll).toLowerCase().includes(q);
            return mGrp && mQ;
        });

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color: #94a3b8;">No student records found.</td></tr>';
            return;
        }

        // মেধা অনুযায়ী সঠিক সর্টিং
        list.sort((a, b) => {
            if (a.group !== b.group) return a.group === 'Science' ? -1 : 1;
            const rankA = (a.overallRank !== undefined && a.overallRank !== null) ? Number(a.overallRank) : (Number(a.sl) || 9999);
            const rankB = (b.overallRank !== undefined && b.overallRank !== null) ? Number(b.overallRank) : (Number(b.sl) || 9999);
            return rankA - rankB;
        });

        list.forEach(s => {
            const meritVal = (s.overallRank !== undefined && s.overallRank !== null && s.overallRank !== '') ? s.overallRank : (s.sl || '-');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center; font-weight:700; color:#1e40af;">${meritVal}</td>
                <td><span style="background:#f1f5f9; border:1px solid #e2e8f0; padding:3px 8px; border-radius:12px; font-weight:700; font-size:0.78rem;">${s.id}</span></td>
                <td style="font-weight:600; color:#0f172a;">${s.name}</td>
                <td style="text-align:center; color:#64748b; font-weight:600;">${s.roll}</td>
                <td style="text-align:center;"><span class="eval-badge ${s.section === 'DH' ? 'eval-badge-primary' : 'eval-badge-success'}">${s.section || '-'}</span></td>
                <td><span style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; padding:3px 10px; border-radius:14px; font-size:0.75rem; font-weight:700;">${s.subGroup || s.group}</span></td>
                <td style="text-align:center;"><span style="background:#f8fafc; border:1px solid #e2e8f0; padding:2px 10px; border-radius:14px; font-size:0.70rem; font-weight:700;">Rank #${meritVal}</span></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // ==========================================================
    // ১২. ফায়ারবেস ক্লাউড লোডার
    // ==========================================================
    async function loadDirectlyFromFirebase(retries = 25) {
        try {
            const fb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
            _get = fb.get;
            _ref = fb.ref;
            _set = fb.set;
            _update = fb.update;

            if (window.getDatabase) {
                _db = window.getDatabase();
            } else if (fb.getDatabase) {
                _db = fb.getDatabase();
            }
        } catch (e) {
            if (window.getDatabase && window.ref && window.get) {
                _db = window.getDatabase();
                _ref = window.ref;
                _get = window.get;
                _set = window.set;
                _update = window.update;
            }
        }

        if (!_db || !_ref || !_get) {
            if (retries > 0) setTimeout(() => loadDirectlyFromFirebase(retries - 1), 200);
            return;
        }

        try {
            const actSnap = await _get(_ref(_db, 'evaluation_system/active_exam_id'));
            if (actSnap.exists()) activeExamId = actSnap.val();

            const exSnap = await _get(_ref(_db, `evaluation_system/exams/${activeExamId}`));
            if (exSnap.exists()) activeExamData = exSnap.val();

            const stdSnap = await _get(_ref(_db, 'evaluation_system/students'));
            if (stdSnap.exists()) {
                studentsList = Object.values(stdSnap.val());
                window.renderEvalStudents();
            }

            const pinSnap = await _get(_ref(_db, 'evaluation_system/pins'));
            if (pinSnap.exists()) {
                subjectPins = pinSnap.val() || {};
                window.renderEvalPins();
            }

            const mSnap = await _get(_ref(_db, `evaluation_system/marks/${activeExamId}`));
            if (mSnap.exists()) {
                examMarks = mSnap.val() || {};
                window.renderEvalTabulation();
            }

            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(({ onValue }) => {
                onValue(_ref(_db, `evaluation_system/marks/${activeExamId}`), (s) => {
                    examMarks = s.val() || {};
                    window.renderEvalPins();
                });
                onValue(_ref(_db, 'evaluation_system/pins'), (s) => {
                    subjectPins = s.val() || {};
                    window.renderEvalPins();
                });
            }).catch(() => {});

        } catch (err) {
            console.error("Firebase sync error:", err);
        }
    }

    function runModule() {
        injectExamModule();
        loadDirectlyFromFirebase();
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', runModule);
    } else {
        runModule();
    }
})();
