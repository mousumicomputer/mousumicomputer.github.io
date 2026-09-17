/**
 * CPSCL Academic Evaluation Module - Bulletproof Multi-Department Manager
 * File: cpscl_evaluation.js
 * Architecture: End-to-End Exam Lifecycle, Auto-Grouping & Dynamic Tabulation
 * UI: Professional Academic Theme with Google Tiro Bangla
 */

(function () {
    // ==========================================================
    // ১. গুগল ফন্ট ও মার্জিত স্টাইল ইনজেকশন
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

        /* স্লিম পরিসংখ্যান রিবন */
        .eval-stats-ribbon {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 12px;
        }
        .eval-stat-item {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #94a3b8;
            border-radius: 8px;
            padding: 8px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            transition: 0.15s ease;
        }
        .eval-stat-item:hover { background: #fbfcfe; border-color: #cbd5e1; }
        .eval-stat-item.active { border-left-color: #1e40af; background: #eff6ff; border-color: #bfdbfe; }
        .eval-stat-title { font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
        .eval-stat-meta { font-size: 0.68rem; color: #94a3b8; }
        .eval-stat-num { font-size: 1.35rem; font-weight: 700; color: #0f172a; }

        .eval-main-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.03); margin-bottom: 15px; }
        .eval-ctrl-bar {
            padding: 8px 14px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            background: #ffffff;
        }
        .eval-tab-group { display: flex; background: #f1f5f9; padding: 3px; border-radius: 6px; gap: 2px; flex-wrap: wrap; }
        .eval-tab-btn {
            border: none; background: transparent; padding: 5px 12px; border-radius: 5px;
            font-size: 0.78rem; font-weight: 600; color: #64748b; cursor: pointer; transition: 0.15s; white-space: nowrap;
        }
        .eval-tab-btn:hover { color: #0f172a; }
        .eval-tab-btn.active { background: #ffffff; color: #1e40af; font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }

        .eval-search-wrap { position: relative; width: 220px; }
        .eval-search-wrap i { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: #94a3b8; }
        .eval-search-inp { width: 100%; padding: 5px 10px 5px 28px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.78rem; outline: none; }
        .eval-search-inp:focus { border-color: #1e40af; }

        .eval-btn {
            padding: 6px 14px; border-radius: 6px; font-size: 0.78rem; font-weight: 700;
            cursor: pointer; display: inline-flex; align-items: center; gap: 6px; border: none; transition: 0.15s; text-decoration: none;
        }
        .eval-btn-primary { background: #1e40af; color: white; }
        .eval-btn-primary:hover { background: #1e3a8a; }
        .eval-btn-success { background: #10b981; color: white; }
        .eval-btn-success:hover { background: #059669; }
        .eval-btn-info { background: #0ea5e9; color: white; }
        .eval-btn-purple { background: #6366f1; color: white; }

        .eval-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .eval-table thead tr { background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; }
        .eval-table th { padding: 8px 12px; text-align: left; font-size: 0.70rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
        .eval-table td { padding: 7px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; vertical-align: middle; white-space: nowrap; }
        .eval-table tbody tr:hover { background-color: #f8faff; }

        .eval-modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(3px); display: none; align-items: center; justify-content: center; z-index: 999999;
        }
        .eval-modal-card {
            background: #ffffff; border-radius: 14px; width: 100%; max-width: 480px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 22px; animation: evalPop 0.2s ease-out;
        }
        @keyframes evalPop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .sub-chip {
            display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: #f1f5f9;
            border-radius: 4px; font-size: 0.75rem; font-weight: 600; cursor: pointer; user-select: none; border: 1px solid #cbd5e1;
        }
        .sub-chip.active { background: #dbeafe; border-color: #3b82f6; color: #1e40af; }
    `;
    document.head.appendChild(evalStyle);

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
            { key: 'Sci', name: 'General Science' }, { key: 'Reli', name: 'Religion' }
        ]
    };

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
        activeSubjects: ['B1', 'B2', 'E1', 'E2', 'Math', 'HM_AG', 'Phy', 'Che', 'Bio', 'BGS', 'Reli', 'ICT', 'His', 'Geo', 'Civ', 'Fin', 'Acc', 'Sci']
    };
    let currentEvalFilter = 'All';
    let evalChosenFile = null;
    let computedMeritCache = [];

    // ==========================================================
    // ২. সাইডবার ইনজেকশন ও মূল লেআউট নির্মাণ (৫টি সাব-সেকশন)
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
                <span class="menu-link-inner"><i class="fa-solid fa-file-signature"></i> <span>Exam Evaluation</span></span>
                <i class="fa-solid fa-chevron-down chevron-icon" id="exam-chevron-icon"></i>
            </a>
            <ul class="submenu-list" id="exam-submenu-list" style="display: none;">
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-student-sec')"><i class="fa-solid fa-users"></i> <span>Student Directory</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-config-sec')"><i class="fa-solid fa-sliders"></i> <span>Exam Manager</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-tab-sec')"><i class="fa-solid fa-table-list"></i> <span>Live Tabulation</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-regroup-sec')"><i class="fa-solid fa-ranking-star"></i> <span>Merit & Grouping</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-archive-sec')"><i class="fa-solid fa-box-archive"></i> <span>Exam Archives</span></a></li>
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
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="evalSearchInp" class="eval-search-inp" placeholder="Search ID, Name, Roll..." oninput="window.renderEvalStudents()">
                                </div>
                                <button class="eval-btn eval-btn-primary" onclick="window.openEvalUploadModal()">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> <span>Import Excel</span>
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
                    <div class="eval-main-box" style="padding: 16px; margin-bottom: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
                            <div>
                                <h3 id="mgrExamTitle" style="font-size: 1.15rem; font-weight: 800; margin: 0; color: #0f172a;">Active: Fortnightly Test-02</h3>
                                <p id="mgrExamMeta" style="font-size: 0.78rem; color: #64748b; margin: 2px 0 0 0;">Date: 15 Sep 2026 • Full Mark: 15</p>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <button class="eval-btn eval-btn-purple" onclick="window.openCreateExamModal()"><i class="fa-solid fa-plus"></i> Create New Exam</button>
                                <button class="eval-btn" id="btnToggleLock" style="background:#dc2626; color:white;" onclick="window.toggleExamLock()">
                                    <i class="fa-solid fa-lock"></i> Lock Entry
                                </button>
                                <button class="eval-btn eval-btn-info" onclick="window.copyEvalTeacherLink()"><i class="fa-solid fa-link"></i> Copy Teacher Link</button>
                            </div>
                        </div>

                        <!-- সিলেক্টেড বিষয় নির্বাচন -->
                        <div>
                            <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 6px; display: block;">
                                Active Exam Subjects (Uncheck to exclude non-evaluated subjects):
                            </label>
                            <div id="activeSubjectsChips" style="display: flex; flex-wrap: wrap; gap: 6px;"></div>
                        </div>
                    </div>

                    <!-- পিন ম্যানেজমেন্ট টেবিল -->
                    <div class="eval-main-box">
                        <div class="eval-ctrl-bar">
                            <div style="font-size: 0.85rem; font-weight: 700; color: #0f172a;"><i class="fa-solid fa-key text-warning"></i> Teacher PINs & Status</div>
                            <div style="display: flex; gap: 8px;">
                                <button class="eval-btn eval-btn-purple" id="btnRefreshPins" onclick="window.refreshEvalPinsLive()"><i class="fa-solid fa-rotate"></i> Refresh PINs</button>
                                <button class="eval-btn eval-btn-success" onclick="window.openAdminOverrideModal()"><i class="fa-solid fa-pen-to-square"></i> Admin Mark Entry</button>
                            </div>
                        </div>
                        <div style="overflow-x: auto;">
                            <table class="eval-table">
                                <thead>
                                    <tr>
                                        <th style="padding-left: 15px;">Subject</th>
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

                <!-- SUB-SECTION 3: LIVE TABULATION -->
                <div id="eval-tab-sec" class="eval-sub-sec">
                    <div class="eval-main-box" style="padding: 12px 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">View Stream Sheet:</label>
                                <select id="evalTabGroup" class="eval-search-inp" style="width: auto;" onchange="window.renderEvalTabulation()">
                                    <option value="Science_Merit">Science (Combined Merit)</option>
                                    <option value="Group-A">Science (Group-A)</option>
                                    <option value="Group-B">Science (Group-B)</option>
                                    <option value="Group-C">Science (Group-C)</option>
                                    <option value="Humanities">Humanities</option>
                                    <option value="B.Studies">Business Studies</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="eval-btn" style="background:#475569; color:white;" onclick="window.openEvaluationPrintTab(true)"><i class="fa-solid fa-file-lines"></i> Blank Sheet (Print)</button>
                                <button class="eval-btn eval-btn-success" onclick="window.exportTabulationToExcel()"><i class="fa-solid fa-file-excel"></i> Export Excel</button>
                                <button class="eval-btn eval-btn-primary" onclick="window.openEvaluationPrintTab(false)"><i class="fa-solid fa-print"></i> Print Result PDF</button>
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

                <!-- SUB-SECTION 4: MERIT & AUTO-GROUPING ENGINE -->
                <div id="eval-regroup-sec" class="eval-sub-sec">
                    <div class="eval-main-box" style="padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                            <div>
                                <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0; color: #0f172a;">Dynamic Merit & Grouping Engine</h3>
                                <p style="font-size: 0.78rem; color: #64748b; margin: 2px 0 0 0;">Top 55 ➔ Group-A | Next 50 ➔ Group-B | Rest ➔ Group-C</p>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="eval-btn eval-btn-primary" onclick="window.runAutoGroupingPreview()"><i class="fa-solid fa-calculator"></i> Calculate New Groups</button>
                                <button class="eval-btn eval-btn-success" id="btnApplyRegroup" style="display:none;" onclick="window.applyPromoteNewGroups()"><i class="fa-solid fa-check-double"></i> Promote & Set for Next Exam</button>
                            </div>
                        </div>
                    </div>

                    <div class="eval-main-box" id="regroupPreviewBox" style="display: none;">
                        <div style="padding: 10px 14px; background: #eff6ff; border-bottom: 1px solid #bfdbfe; font-size: 0.82rem; font-weight: 700; color: #1e40af;">
                            Preview of Generated New Groups (Review before applying):
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
                                        <th style="width: 110px; text-align:center; background:#dbeafe; color:#1e40af;">PROMOTED GROUP</th>
                                    </tr>
                                </thead>
                                <tbody id="regroupPreviewTbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SUB-SECTION 5: EXAM ARCHIVES -->
                <div id="eval-archive-sec" class="eval-sub-sec">
                    <div class="eval-main-box" style="padding: 14px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label style="font-size: 0.80rem; font-weight: 700; color: #475569;">Select Past Exam:</label>
                            <select id="archiveExamSelect" class="eval-search-inp" style="width: 260px;" onchange="window.loadArchivedExamData()">
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
                            <div style="font-size: 1.05rem; font-weight: 800; color: #0f172a;"><i class="fa-solid fa-calendar-plus text-primary"></i> Create New Exam Sheet</div>
                            <button style="background:transparent; border:none; font-size:1.1rem; color:#94a3b8; cursor:pointer;" onclick="window.closeCreateExamModal()"><i class="fa-solid fa-xmark"></i></button>
                        </div>

                        <div style="margin-bottom: 10px;">
                            <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 3px; display: block;">Exam Name:</label>
                            <input type="text" id="newExName" placeholder="e.g. Fortnightly Test-03" class="eval-search-inp" style="width: 100%;">
                        </div>

                        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
                            <div style="flex: 1;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 3px; display: block;">Exam Date:</label>
                                <input type="text" id="newExDate" placeholder="e.g. 05 Oct 2026" class="eval-search-inp" style="width: 100%;">
                            </div>
                            <div style="width: 120px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 3px; display: block;">Mark Per Sub:</label>
                                <input type="number" id="newExMax" value="15" class="eval-search-inp" style="width: 100%;">
                            </div>
                        </div>

                        <p style="font-size: 0.72rem; color: #64748b; margin-bottom: 14px;">
                            <i class="fa-solid fa-circle-info"></i> This will create a fresh blank evaluation session and prompt new PINs. Past marks will be automatically archived safely.
                        </p>

                        <button type="button" class="eval-btn eval-btn-primary" style="width: 100%; justify-content: center; padding: 10px;" onclick="window.confirmCreateNewExam()">
                            Create Exam Session
                        </button>
                    </div>
                </div>

                <!-- IMPORT EXCEL MODAL -->
                <div class="eval-modal-overlay" id="evalUploadModal" onclick="if(event.target === this) window.closeEvalUploadModal()">
                    <div class="eval-modal-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a;"><i class="fa-solid fa-file-excel text-success"></i> Upload Student List</div>
                            <button style="background:transparent; border:none; font-size:1.1rem; color:#94a3b8; cursor:pointer;" onclick="window.closeEvalUploadModal()"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <div style="margin-bottom: 14px;">
                            <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 5px; display: block;">Target Stream:</label>
                            <select id="evalUploadTargetGroup" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.82rem; font-weight: 600; outline:none; background:#fff;">
                                <option value="Science">Science (Group-A, B, C)</option>
                                <option value="Humanities">Humanities</option>
                                <option value="B.Studies">Business Studies</option>
                            </select>
                        </div>
                        <div style="border: 2px dashed #93c5fd; border-radius: 10px; background: #f8fafc; padding: 20px; text-align: center; cursor: pointer;" onclick="document.getElementById('evalExcelFile').click()">
                            <i class="fa-solid fa-folder-open fa-2x text-warning"></i>
                            <div style="font-size: 0.82rem; color: #475569; margin-top: 6px; font-weight: 600;">Choose Excel File</div>
                            <input type="file" id="evalExcelFile" accept=".xlsx, .xls, .csv" style="display: none;" onchange="window.handleEvalFileSelected(this.files[0])">
                        </div>
                        <div id="evalFileStatusBox" style="display:none; align-items:center; justify-content:space-between; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; margin-top:12px; font-size:0.78rem;">
                            <span id="evalSelectedFileName" style="font-weight:700; color:#0f172a;"></span>
                            <i class="fa-solid fa-circle-check text-success"></i>
                        </div>
                        <button type="button" class="eval-btn eval-btn-primary" id="evalUploadNowBtn" style="width: 100%; margin-top: 14px; justify-content:center;" onclick="window.triggerEvalUpload()">Upload Now</button>
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
        if (secId === 'eval-tab-sec') window.renderEvalTabulation();
        if (secId === 'eval-regroup-sec') window.setupRegroupSection();
        if (secId === 'eval-archive-sec') window.renderArchivesDropdown();
    };

    // ==========================================================
    // ৪. এক্সাম ম্যানেজার ও সাবজেক্ট কন্ট্রোল
    // ==========================================================
    window.renderExamManager = function () {
        document.getElementById('mgrExamTitle').innerText = `Active: ${activeExamData.title}`;
        document.getElementById('mgrExamMeta').innerText = `Date: ${activeExamData.date} • Full Mark: ${activeExamData.max || 15}`;

        const lockBtn = document.getElementById('btnToggleLock');
        if (activeExamData.isLocked) {
            lockBtn.style.background = "#16a34a";
            lockBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Unlock Entry';
        } else {
            lockBtn.style.background = "#dc2626";
            lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Lock Entry';
        }

        const chipBox = document.getElementById('activeSubjectsChips');
        chipBox.innerHTML = '';
        const allSubs = [
            ...MASTER_SUBJECTS.Science,
            { key: 'His', name: 'History' }, { key: 'Geo', name: 'Geography' },
            { key: 'Civ', name: 'Civics' }, { key: 'Fin', name: 'Finance' }, { key: 'Acc', name: 'Accounting' }
        ];
        const uniqueSubs = Array.from(new Set(allSubs.map(a => a.key))).map(k => allSubs.find(a => a.key === k));

        uniqueSubs.forEach(s => {
            const isAct = !activeExamData.activeSubjects || activeExamData.activeSubjects.includes(s.key);
            const chip = document.createElement('span');
            chip.className = `sub-chip ${isAct ? 'active' : ''}`;
            chip.innerHTML = `${isAct ? '✓' : '+'} ${s.key}`;
            chip.onclick = () => window.toggleSubjectActive(s.key);
            chipBox.appendChild(chip);
        });

        window.renderEvalPins();
    };

    window.toggleSubjectActive = function (key) {
        if (!activeExamData.activeSubjects) {
            activeExamData.activeSubjects = [];
        }
        const idx = activeExamData.activeSubjects.indexOf(key);
        if (idx > -1) {
            activeExamData.activeSubjects.splice(idx, 1);
        } else {
            activeExamData.activeSubjects.push(key);
        }
        if (window.writeToFirebase) {
            window.writeToFirebase(`evaluation_system/exams/${activeExamId}/activeSubjects`, activeExamData.activeSubjects);
        }
        window.renderExamManager();
    };

    window.toggleExamLock = function () {
        activeExamData.isLocked = !activeExamData.isLocked;
        if (window.writeToFirebase) {
            window.writeToFirebase(`evaluation_system/exams/${activeExamId}/isLocked`, activeExamData.isLocked);
        }
        window.renderExamManager();
        alert(activeExamData.isLocked ? "Exam locked! Teachers cannot edit marks." : "Exam unlocked! Teachers can now enter marks.");
    };

    // ==========================================================
    // ৫. নতুন পরীক্ষা তৈরি (New Exam Creation)
    // ==========================================================
    window.openCreateExamModal = function () {
        document.getElementById('createExamModal').style.display = 'flex';
    };
    window.closeCreateExamModal = function () {
        document.getElementById('createExamModal').style.display = 'none';
    };

    window.confirmCreateNewExam = async function () {
        const title = document.getElementById('newExName').value.trim();
        const date = document.getElementById('newExDate').value.trim();
        const max = parseFloat(document.getElementById('newExMax').value) || 15;

        if (!title) {
            alert("Please enter exam title!");
            return;
        }

        const newId = `exam_${Date.now()}`;
        const newExamObj = {
            id: newId,
            title: title,
            date: date,
            max: max,
            isLocked: false,
            createdAt: new Date().toISOString(),
            activeSubjects: ['B1', 'B2', 'E1', 'E2', 'Math', 'HM_AG', 'Phy', 'Che', 'Bio', 'BGS', 'Reli', 'ICT', 'His', 'Geo', 'Civ', 'Fin', 'Acc', 'Sci']
        };

        if (window.writeToFirebase) {
            await window.writeToFirebase(`evaluation_system/archives/${activeExamId}`, {
                examInfo: activeExamData,
                marks: examMarks,
                archivedAt: new Date().toISOString()
            });

            await window.writeToFirebase(`evaluation_system/exams/${newId}`, newExamObj);
            await window.writeToFirebase(`evaluation_system/active_exam_id`, newId);
        }

        activeExamId = newId;
        activeExamData = newExamObj;
        examMarks = {};
        subjectPins = {};

        window.closeCreateExamModal();
        window.renderExamManager();
        alert(`🎉 New Exam Session "${title}" created successfully!\nPast marks safely archived.`);
    };

    // ==========================================================
    // ৬. পিন ও কন্ট্রোল
    // ==========================================================
    window.renderEvalPins = function () {
        const tbody = document.getElementById('evalPinTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const allSubs = [
            ...MASTER_SUBJECTS.Science,
            { key: 'His', name: 'History' }, { key: 'Geo', name: 'Geography' },
            { key: 'Civ', name: 'Civics' }, { key: 'Fin', name: 'Finance' }, { key: 'Acc', name: 'Accounting' }
        ];
        const uniqueSubs = Array.from(new Set(allSubs.map(a => a.key))).map(k => allSubs.find(a => a.key === k));

        uniqueSubs.forEach(s => {
            const isAct = !activeExamData.activeSubjects || activeExamData.activeSubjects.includes(s.key);
            if (!isAct) return;

            const p = subjectPins[s.key] || '';
            let hasMarks = false;
            Object.values(examMarks).forEach(stdObj => {
                if (stdObj && stdObj[s.key] !== undefined && stdObj[s.key] !== '') hasMarks = true;
            });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding-left: 15px; font-weight:700;">${s.name} (${s.key})</td>
                <td><span class="badge ${hasMarks ? 'badge-success' : (p ? 'badge-primary' : 'badge-danger')}">${hasMarks ? '✓ Submitted' : (p ? 'Ready' : 'Pending')}</span></td>
                <td><strong style="letter-spacing: 2px; color:#1e40af;">${p || '----'}</strong></td>
                <td style="text-align:center;">
                    <button class="btn-action btn-delete" onclick="window.resetEvalPin('${s.key}')" ${!p ? 'disabled style="opacity:0.3;"' : ''}><i class="fa-solid fa-rotate-left"></i> Reset</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.refreshEvalPinsLive = async function () {
        const btn = document.getElementById('btnRefreshPins');
        if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        try {
            if (window.getDatabase && window.ref && window.get) {
                const db = window.getDatabase();
                const pSnap = await window.get(window.ref(db, 'evaluation_system/pins'));
                subjectPins = pSnap.exists() ? pSnap.val() : {};
                const mSnap = await window.get(window.ref(db, `evaluation_system/marks/${activeExamId}`));
                examMarks = mSnap.exists() ? mSnap.val() : {};
                window.renderEvalPins();
                alert("✅ Pins & Marks live synced!");
            }
        } finally {
            if (btn) btn.innerHTML = '<i class="fa-solid fa-rotate"></i> Refresh PINs';
        }
    };

    window.resetEvalPin = function (k) {
        if (confirm("Reset PIN for " + k + "?")) {
            delete subjectPins[k];
            window.renderEvalPins();
            if (window.writeToFirebase) window.writeToFirebase(`evaluation_system/pins/${k}`, null);
        }
    };

    window.copyEvalTeacherLink = function () {
        const link = "https://cpscl.vercel.app";
        navigator.clipboard.writeText(link).then(() => alert("Teacher link copied:\n" + link));
    };

    // ==========================================================
    // ৭. সার্বজনীন ডাটা প্রসেসর (Tabulation Data Helper)
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
        else list = studentsList.filter(s => s.subGroup === grp);

        let computedList = list.map(s => {
            const m = examMarks[s.id] || {};
            let total = 0;
            activeSubs.forEach(sb => {
                let v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, marksObj: m };
        });

        if (grp === 'Science_Merit') {
            computedList.sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                return (a.roll || 0) - (b.roll || 0);
            });
        } else {
            computedList.sort((a, b) => (a.overallRank || a.sl) - (b.overallRank || b.sl));
        }

        return { grp, groupLabel, subGroupLabel, activeSubs, streamTotalMarks, computedList };
    }

    // ==========================================================
    // ৮. অন-স্ক্রিন লাইভ টেবুলেশন রেন্ডার
    // ==========================================================
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
    // ৯. নতুন ট্যাবে নিখুঁত প্রিন্ট রিপোর্ট ওপেন করা (Result & Blank)
    // ==========================================================
    window.openEvaluationPrintTab = function (isBlank = false) {
        const { groupLabel, subGroupLabel, activeSubs, streamTotalMarks, computedList } = getProcessedTabulationData();

        const printWin = window.open('', '_blank');
        if (!printWin) {
            alert("পপ-আপ উইন্ডো ব্লক করা রয়েছে! দয়া করে ব্রাউজারের Pop-up Allow করুন।");
            return;
        }

        const totalCols = 5 + activeSubs.length + 1;

        const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${activeExamData.title} - ${subGroupLabel} ${isBlank ? '(Blank Sheet)' : ''}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 10mm 12mm 10mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', Times, serif;
            color: #000;
            margin: 0;
            padding: 0;
            background-color: #fff;
            -webkit-print-color-adjust: exact;
        }

        .report-container {
            width: 100%;
            max-width: 210mm;
            margin: 0 auto;
        }

        /* প্রাতিষ্ঠানিক হেডার */
        .header-cell {
            border: none !important;
            padding: 0 0 8px 0 !important;
            text-align: center;
        }

        .header-cell h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 3px 0;
        }

        .header-cell p {
            font-size: 13px;
            margin: 2px 0;
            font-weight: normal;
        }

        .date-container {
            text-align: right;
            font-size: 12px;
            font-weight: normal;
            margin-top: 5px;
            padding-right: 5px;
        }

        /* টেবিল ফরম্যাট */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px; /* আরামদায়ক ও স্পষ্ট ফন্ট সাইজ */
        }

        thead {
            display: table-header-group; /* প্রতিটি পাতায় স্বয়ংক্রিয় হেডার রিপিট */
        }

        tr {
            break-inside: avoid;
            page-break-inside: avoid; /* রো মাঝখান দিয়ে কাটবে না */
        }

        th, td {
            border: 1px solid #000;
            padding: 4px 3px;
            text-align: center;
        }

        th.col-header {
            font-weight: bold;
            font-size: 11px;
            background-color: #fff;
            padding: 5px 2px;
        }

        .col-sl { width: 26px; }
        .col-id { width: 50px; }
        .col-name { 
            width: 185px; 
            text-align: left; 
            padding-left: 6px; 
            white-space: nowrap; 
        }
        .col-roll { width: 30px; }
        .col-sec { width: 32px; }
        .col-sub { width: 28px; }
        .col-hm { width: 32px; font-size: 9.5px; line-height: 1.1; }
        .col-total { width: 38px; }

        /* স্বাক্ষর এরিয়া (১ ইঞ্চি নিচে নামানো) */
        .signature-section {
            margin-top: calc(60px + 1in);
            display: flex;
            justify-content: space-between;
            padding: 0 60px;
            font-size: 13px;
            font-weight: bold;
            break-inside: avoid;
            page-break-inside: avoid;
        }

        /* প্রিন্ট কন্ট্রোল বার (শুধু স্ক্রিনে দেখাবে) */
        .no-print-bar {
            max-width: 210mm;
            margin: 15px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #1e40af;
            color: white;
            padding: 10px 18px;
            border-radius: 8px;
            font-family: sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-print-action {
            background: #ffffff;
            color: #1e40af;
            font-weight: 700;
            border: none;
            padding: 7px 18px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        .btn-print-action:hover { background: #eff6ff; }

        @media screen {
            body { background-color: #e5e5e5; padding-bottom: 30px; }
            .report-container {
                background: white;
                padding: 15mm 12mm;
                box-shadow: 0 0 10px rgba(0,0,0,0.15);
            }
        }

        @media print {
            .no-print-bar { display: none !important; }
            body { padding: 0; background: #fff; }
            .report-container { padding: 0; box-shadow: none; }
        }
    </style>
</head>
<body>

    <div class="no-print-bar">
        <span><strong>${activeExamData.title}</strong> — ${subGroupLabel} (${isBlank ? 'Blank Sheet' : 'Result Sheet'})</span>
        <button class="btn-print-action" onclick="window.print()">🖨️ Print Report</button>
    </div>

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
                    <th class="col-header col-sl">SL</th>
                    <th class="col-header col-id">Std ID</th>
                    <th class="col-header col-name">Student Name</th>
                    <th class="col-header col-roll">Roll</th>
                    <th class="col-header col-sec">Sec</th>
                    ${activeSubs.map(s => {
                        const key = s.key;
                        const label = (key === 'HM_AG') ? 'HM/<br>AG' : ((key === 'AG_HE') ? 'AG/<br>HE' : key);
                        const isHm = (key === 'HM_AG' || key === 'AG_HE');
                        return `<th class="col-header ${isHm ? 'col-hm' : 'col-sub'}">${label}</th>`;
                    }).join('')}
                    <th class="col-header col-total">Total<br>(${streamTotalMarks})</th>
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
                            const displayMark = (markVal !== undefined && markVal !== null && markVal !== '') ? markVal : '0';
                            return `<td>${displayMark}</td>`;
                        }).join('')}
                        <td>${isBlank ? '0' : s.total}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- সিগনেচার সেকশন -->
        <div class="signature-section">
            <div>Vice Principal</div>
            <div>Principal</div>
        </div>
    </div>

    <script>
        window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
        };
    <\/script>
</body>
</html>`;

        printWin.document.open();
        printWin.document.write(reportHTML);
        printWin.document.close();
    };

    // ব্ল্যাঙ্ক শিট প্রিন্ট ট্রিগার
    window.printBlankSheet = function () {
        window.openEvaluationPrintTab(true);
    };

    // ==========================================================
    // ১০. প্রাতিষ্ঠানিক ফরম্যাটে এক্সেল এক্সপোর্ট
    // ==========================================================
    window.exportTabulationToExcel = function () {
        if (typeof XLSX === 'undefined') {
            alert("SheetJS (XLSX) লাইব্রেরি পাওয়া যায়নি!");
            return;
        }

        const { groupLabel, subGroupLabel, activeSubs, streamTotalMarks, computedList } = getProcessedTabulationData();

        // প্রাতিষ্ঠানিক হেডার সহ সম্পূর্ণ ডাটা অ্যারে তৈরি
        const aoaData = [
            ["Cantonment Public School and College Lalmonirhat"],
            ["Performance Evaluation"],
            [`Class: Ten (${groupLabel})`],
            [`${activeExamData.title} - ${subGroupLabel}`],
            [`Date : ${activeExamData.date || ''}`],
            [] // খালি রো
        ];

        // টেবিল কলাম হেডার
        const headerRow = ["SL", "Std ID", "Student Name", "Roll", "Sec"];
        activeSubs.forEach(s => {
            headerRow.push(s.key === 'HM_AG' ? 'HM/AG' : (s.key === 'AG_HE' ? 'AG/HE' : s.key));
        });
        headerRow.push(`Total (${streamTotalMarks})`);
        aoaData.push(headerRow);

        // ছাত্র-ছাত্রীদের ডাটা
        computedList.forEach((s, idx) => {
            const row = [idx + 1, s.id, s.name, s.roll, s.section || ''];
            activeSubs.forEach(sb => {
                const markVal = s.marksObj[sb.key];
                row.push((markVal !== undefined && markVal !== null && markVal !== '') ? Number(markVal) : 0);
            });
            row.push(s.total);
            aoaData.push(row);
        });

        // সিগনেচার স্পেস
        aoaData.push([]);
        aoaData.push([]);
        aoaData.push(["Vice Principal", "", "", "", "", ...new Array(activeSubs.length - 1).fill(""), "Principal"]);

        const ws = XLSX.utils.aoa_to_sheet(aoaData);

        // হেডার সেল মার্জ করা
        const lastColIdx = headerRow.length - 1;
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: lastColIdx } },
            { s: { r: 1, c: 0 }, e: { r: 1, c: lastColIdx } },
            { s: { r: 2, c: 0 }, e: { r: 2, c: lastColIdx } },
            { s: { r: 3, c: 0 }, e: { r: 3, c: lastColIdx } },
            { s: { r: 4, c: 0 }, e: { r: 4, c: lastColIdx } }
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Evaluation_Report");
        XLSX.writeFile(wb, `${activeExamData.title}_${subGroupLabel}_Report.xlsx`);
    };

    // ==========================================================
    // ১১. ডাইনামিক অটো-গ্রুপিং ইঞ্জিন (Top 55=A, 50=B, Rest=C)
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

        computed.sort((a, b) => {
            if (b.total !== a.total) return b.total - a.total;
            return (a.roll || 0) - (b.roll || 0);
        });

        computed.forEach((s, idx) => {
            const rank = idx + 1;
            let newGrp = "Group-C";
            if (rank <= 55) newGrp = "Group-A";
            else if (rank <= 105) newGrp = "Group-B";

            s.newGroupTag = newGrp;
            s.overallRank = rank;
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
                <td style="text-align:center;"><span style="background:#1e40af; color:white; padding:2px 8px; border-radius:4px; font-weight:800;">${s.newGroupTag}</span></td>
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
                updates[`evaluation_system/students/${s.id}/subGroup`] = s.newGroupTag;
                updates[`evaluation_system/students/${s.id}/overallRank`] = s.overallRank;

                const found = studentsList.find(st => st.id === s.id);
                if (found) {
                    found.subGroup = s.newGroupTag;
                    found.overallRank = s.overallRank;
                }
            });

            if (window.writeToFirebase) {
                await window.writeToFirebase('evaluation_system/students', studentsList.reduce((acc, cur) => { acc[cur.id] = cur; return acc; }, {}));
            }

            alert("🎉 Groups successfully updated and locked for Next Exam!\nTeachers will now see students in their new groups.");
            window.renderEvalStudents();
        }
    };

    // ==========================================================
    // ১২. আর্কাইভ ভিউয়ার
    // ==========================================================
    window.renderArchivesDropdown = async function () {
        const sel = document.getElementById('archiveExamSelect');
        sel.innerHTML = '<option value="">-- Select Archived Exam --</option>';

        if (window.getDatabase && window.ref && window.get) {
            const snap = await window.get(window.ref(window.getDatabase(), 'evaluation_system/archives'));
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

        area.innerHTML = '<div class="text-center p-4"><i class="fa-solid fa-spinner fa-spin fa-2x"></i> Loading Archive...</div>';
        const snap = await window.get(window.ref(window.getDatabase(), `evaluation_system/archives/${exId}`));
        if (snap.exists()) {
            const data = snap.val();
            area.innerHTML = `
                <div class="eval-main-box" style="padding:15px; margin-top:12px;">
                    <h4 style="font-weight:800; color:#1e40af; margin-bottom:5px;">${data.examInfo?.title} (${data.examInfo?.date})</h4>
                    <p style="font-size:0.80rem; color:#64748b;">Archived at: ${new Date(data.archivedAt).toLocaleString()}</p>
                    <div style="background:#f8fafc; padding:12px; border-radius:6px; font-size:0.85rem;">
                        Total student marks archived: <strong>${Object.keys(data.marks || {}).length}</strong> records.
                    </div>
                </div>
            `;
        }
    };

    // ==========================================================
    // ১৩. স্টুডেন্ট ডিরেক্টরি লাইভ টেবিল
    // ==========================================================
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

            let mQ = !q || String(s.id).includes(q) || (s.name || '').toLowerCase().includes(q) || String(s.roll).includes(q);
            return mGrp && mQ;
        });

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color: #94a3b8;">No student records found.</td></tr>';
            return;
        }

        list.sort((a, b) => {
            if (a.group !== b.group) return a.group === 'Science' ? -1 : 1;
            return (a.overallRank || a.sl) - (b.overallRank || b.sl);
        });

        list.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center; font-weight:700; color:#1e40af;">${s.sl}</td>
                <td><span style="background:#f1f5f9; border:1px solid #e2e8f0; padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.78rem;">${s.id}</span></td>
                <td style="font-weight:600; color:#0f172a;">${s.name}</td>
                <td style="text-align:center; color:#64748b; font-weight:600;">${s.roll}</td>
                <td style="text-align:center;"><span class="badge ${s.section === 'DH' ? 'badge-primary' : 'badge-success'}">${s.section}</span></td>
                <td><span style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe; padding:2px 7px; border-radius:4px; font-size:0.75rem; font-weight:700;">${s.subGroup || s.group}</span></td>
                <td style="text-align:center;"><span style="background:#f8fafc; border:1px solid #e2e8f0; padding:1px 8px; border-radius:10px; font-size:0.70rem; font-weight:700;">Rank #${s.overallRank || s.sl}</span></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // ==========================================================
    // ১৪. ফায়ারবেস ক্লাউড লোডার
    // ==========================================================
    async function loadDirectlyFromFirebase(retries = 25) {
        if (!window.getDatabase || !window.ref || !window.get) {
            if (retries > 0) setTimeout(() => loadDirectlyFromFirebase(retries - 1), 200);
            return;
        }

        try {
            const db = window.getDatabase();

            const actSnap = await window.get(window.ref(db, 'evaluation_system/active_exam_id'));
            if (actSnap.exists()) activeExamId = actSnap.val();

            const exSnap = await window.get(window.ref(db, `evaluation_system/exams/${activeExamId}`));
            if (exSnap.exists()) activeExamData = exSnap.val();

            const stdSnap = await window.get(window.ref(db, 'evaluation_system/students'));
            if (stdSnap.exists()) {
                studentsList = Object.values(stdSnap.val());
                window.renderEvalStudents();
            }

            const pinSnap = await window.get(window.ref(db, 'evaluation_system/pins'));
            if (pinSnap.exists()) {
                subjectPins = pinSnap.val() || {};
                window.renderEvalPins();
            }

            const mSnap = await window.get(window.ref(db, `evaluation_system/marks/${activeExamId}`));
            if (mSnap.exists()) {
                examMarks = mSnap.val() || {};
                window.renderEvalTabulation();
            }

            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(({ onValue }) => {
                onValue(window.ref(db, `evaluation_system/marks/${activeExamId}`), (s) => {
                    examMarks = s.val() || {};
                    window.renderEvalPins();
                });
                onValue(window.ref(db, 'evaluation_system/pins'), (s) => {
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
