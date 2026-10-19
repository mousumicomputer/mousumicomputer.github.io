/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Super Admin Mark Management Engine (v3.1 Filter & Strict Validation)
   Path: cpscl/mark_entry_manager.js
   Architecture: Clean White Corporate | Minimalist Drawer Accordion | Firebase Sync
   Language: Pure English (Corporate ERP Standard)
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Super Admin Mark Management Engine (v3.1 with Group Filter & Validation)...");

    // ১. সাইডবারে Exam Manager-এর নিচে "Mark Entry" সাব-মেনু ইনজেক্ট করা
    function injectMarkEntrySidebar() {
        const examSubmenu = document.getElementById('trust-exam-submenu-items');
        if (!examSubmenu) {
            setTimeout(injectMarkEntrySidebar, 200);
            return;
        }

        if (document.getElementById('sub-link-mark-entry')) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <a class="trust-sub-link" id="sub-link-mark-entry" onclick="switchCPSCLExamSubTab(this, 'mark-entry')">
                <span class="trust-sub-indicator"></span>
                <span>Mark Entry</span>
            </a>
        `;
        examSubmenu.appendChild(li);
    }

    // switchCPSCLExamSubTab হুক করে Mark Entry ভিউ ওপেন করা
    const originalSwitch = window.switchCPSCLExamSubTab;
    window.switchCPSCLExamSubTab = function (element, tabKey) {
        if (typeof originalSwitch === 'function') {
            originalSwitch(element, tabKey);
        }

        if (tabKey === 'mark-entry') {
            document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
            if (element) element.classList.add('active');

            document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
            const topTitle = document.getElementById('top-title');

            const view = document.getElementById('cpscl-mark-entry-main-view');
            if (view) view.classList.add('active');
            if (topTitle) topTitle.innerText = "CPSCL - Super Admin Mark Management";
            
            renderMarkEntryView();
            syncFromCloud();
        }
    };

    // ২. স্কোপড কর্পোরেট সিএসএস (ড্রয়ার স্টাইল)
    function injectMarkEntryStyles() {
        if (document.getElementById('cpscl-mark-entry-scoped-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-mark-entry-scoped-styles';
        style.innerHTML = `
            .mem-wrapper { padding: 15px 5px; font-family: 'Plus Jakarta Sans', sans-serif; }
            
            /* Clean White Header */
            .mem-header { background: #ffffff; border: 1.5px solid #e2e8f0; padding: 14px 24px; border-radius: 50px !important; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); flex-wrap: wrap; gap: 12px; }
            .mem-header h1 { font-size: 1.25rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; margin: 0; }
            .mem-header h1 i { color: #2563eb; }
            .mem-badge-status { font-size: 11px; font-weight: 700; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 4px 14px; border-radius: 50px !important; }

            /* Minimalist Accordion Drawer */
            .mem-drawer { margin-bottom: 12px; }
            .mem-drawer-header { background: #ffffff; border: 1.5px solid #e2e8f0; padding: 16px 24px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; transition: all 0.2s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
            .mem-drawer-header:hover { background: #f8fafc; border-color: #cbd5e1; }
            .mem-drawer.open .mem-drawer-header { border-bottom-left-radius: 0; border-bottom-right-radius: 0; background: #f8fafc; border-bottom-color: #f1f5f9; }
            .mem-drawer-title { font-size: 0.96rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; margin: 0; }
            .mem-drawer-title i { color: #2563eb; font-size: 0.95rem; }
            .mem-drawer-arrow { font-size: 0.85rem; color: #94a3b8; transition: transform 0.25s ease; }
            .mem-drawer.open .mem-drawer-arrow { transform: rotate(90deg); color: #2563eb; }

            .mem-drawer-body { display: none; background: #ffffff; border: 1.5px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; padding: 22px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .mem-drawer.open .mem-drawer-body { display: block; }

            /* Filter Controls Bar */
            .mem-filter-bar { background: #f8fafc; padding: 12px 18px; border-radius: 50px !important; border: 1.5px solid #e2e8f0; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 18px; }
            .mem-filter-group { display: flex; align-items: center; gap: 8px; background: #ffffff; padding: 7px 16px; border-radius: 50px !important; border: 1.5px solid #cbd5e1; flex: 1; min-width: 150px; }
            .mem-filter-group select { border: none; background: transparent; font-size: 0.86rem; font-weight: 700; color: #1e293b; outline: none; width: 100%; cursor: pointer; }

            /* Stats Overview Grid */
            .mem-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 14px; margin-bottom: 18px; }
            .mem-stat-card { background: #ffffff; padding: 14px 22px; border-radius: 50px !important; border: 1.5px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
            .mem-stat-card p { margin: 0; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
            .mem-stat-card h3 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #0f172a; }

            /* Table Layout */
            .mem-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
            .mem-table th { background: #f8fafc !important; color: #64748b !important; font-size: 0.75rem !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; padding: 12px 16px !important; text-align: left; }
            .mem-table td { background: #ffffff; padding: 12px 16px; font-size: 0.88rem; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; color: #334155; }
            .mem-table tr td:first-child { border-left: 1px solid #f1f5f9; border-radius: 50px 0 0 50px; }
            .mem-table tr td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 50px 50px 0; }
            .mem-table tbody tr:hover td { background: #f8fafc; }

            /* Mark Inputs */
            .mem-mark-inp { width: 95px; text-align: center; padding: 7px 12px; border-radius: 50px !important; border: 1.5px solid #cbd5e1; font-size: 0.9rem; font-weight: 700; outline: none; background: #f8fafc; transition: all 0.2s; }
            .mem-mark-inp:focus { border-color: #2563eb; background: #ffffff; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); }
            .mem-mark-inp.is-invalid { border-color: #ef4444 !important; background: #fef2f2 !important; color: #dc2626 !important; }
            .mem-badge-pill { padding: 4px 12px; border-radius: 50px !important; font-size: 0.78rem; font-weight: 800; display: inline-block; }

            /* Pill Buttons */
            .mem-btn-pill { padding: 8px 18px; border-radius: 50px !important; font-size: 0.83rem; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 7px; transition: all 0.2s; }
            .mem-btn-primary { background: #2563eb; color: #ffffff; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2); }
            .mem-btn-primary:hover { background: #1d4ed8; }
            .mem-btn-success { background: #10b981; color: #ffffff; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2); }
            .mem-btn-success:hover { background: #059669; }
            .mem-btn-outline { background: #ffffff; border: 1.5px solid #cbd5e1; color: #475569; }
            .mem-btn-outline:hover { background: #f8fafc; border-color: #94a3b8; color: #1e293b; }

            /* Config Box */
            .mem-config-card { background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 16px; padding: 18px; margin-bottom: 14px; }
            .mem-config-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
        `;
        document.head.appendChild(style);
    }

    // ৩. মাস্টার সেটিংস
    const DEFAULT_CONFIG = {
        markStructure: 'direct',
        enableGrading: false
    };

    function getMemConfig() {
        const saved = localStorage.getItem('cpscl_mark_entry_config');
        return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    }

    function saveMemConfig(cfg) {
        localStorage.setItem('cpscl_mark_entry_config', JSON.stringify(cfg));
    }

    let loadedExamsCache = [];
    let currentExamId = '';
    let currentSubject = '';
    let currentSubjectFullMark = 30;
    let currentClass = '';
    let currentStudentsList = [];
    let isFrozen = false;

    let auditLogs = [
        { time: new Date().toLocaleTimeString(), user: "Root Admin", action: "System Ready", details: "Validation & Group Filtering Engine Initialized", type: "System" }
    ];

    let gradeScales = [
        { grade: "A+", min: 80, max: 100, gpa: 5.00, status: "Active" },
        { grade: "A", min: 70, max: 79, gpa: 4.00, status: "Active" },
        { grade: "A-", min: 60, max: 69, gpa: 3.50, status: "Active" },
        { grade: "B", min: 50, max: 59, gpa: 3.00, status: "Active" },
        { grade: "C", min: 40, max: 49, gpa: 2.00, status: "Active" },
        { grade: "D", min: 33, max: 39, gpa: 1.00, status: "Active" },
        { grade: "F", min: 0, max: 32, gpa: 0.00, status: "Active" }
    ];

    let pendingApprovals = [
        { id: 101, teacher: "M. Rahman", classSec: "Class 8", subject: "Mathematics", count: 42, time: "10 mins ago", status: "Pending" },
        { id: 102, teacher: "S. Sultana", classSec: "Class 9", subject: "English", count: 38, time: "1 hour ago", status: "Pending" }
    ];

    // ৪. ক্লাউড ও লোকাল থেকে ডেটা সিঙ্ক
    async function syncFromCloud() {
        const localEx = localStorage.getItem('cpscl_exams_registry');
        if (localEx) {
            try {
                loadedExamsCache = JSON.parse(localEx);
                populateExamDropdown();
            } catch (e) {}
        }

        if (window.getDatabase && window.ref && window.get) {
            try {
                const db = window.getDatabase();
                
                const snapEx = await window.get(window.ref(db, 'cpscl_exams'));
                if (snapEx.exists()) {
                    const exData = snapEx.val();
                    loadedExamsCache = Array.isArray(exData) ? exData : Object.values(exData);
                    localStorage.setItem('cpscl_exams_registry', JSON.stringify(loadedExamsCache));
                    populateExamDropdown();
                }

                const snapStu = await window.get(window.ref(db, 'cpscl_students'));
                if (snapStu.exists()) {
                    const stuData = snapStu.val();
                    const stuArr = Array.isArray(stuData) ? stuData : Object.values(stuData);
                    localStorage.setItem('cpscl_students_cache', JSON.stringify(stuArr));
                }
            } catch (err) {
                console.warn("Cloud Sync Note:", err);
            }
        }
    }

    function populateExamDropdown() {
        const examSelect = document.getElementById('memFilterExam');
        if (!examSelect) return;

        const currentVal = examSelect.value;
        examSelect.innerHTML = '<option value="">-- Choose Exam --</option>';

        if (loadedExamsCache && loadedExamsCache.length > 0) {
            loadedExamsCache.forEach(x => {
                examSelect.innerHTML += `<option value="${x.id}">${x.name} (${x.class})</option>`;
            });

            if (currentVal && loadedExamsCache.some(x => x.id === currentVal)) {
                examSelect.value = currentVal;
            } else {
                examSelect.value = loadedExamsCache[0].id;
                window.onMemExamChange(loadedExamsCache[0].id);
            }
        }
    }

    // ৫. মূল ভিউ রেন্ডারার
    function renderMarkEntryView() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        let panel = document.getElementById('cpscl-mark-entry-main-view');
        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'view-panel active';
            panel.id = 'cpscl-mark-entry-main-view';
            mainWrapper.appendChild(panel);
        }

        const cfg = getMemConfig();

        panel.innerHTML = `
            <div class="mem-wrapper">
                <!-- Clean White Corporate Header -->
                <div class="mem-header">
                    <div>
                        <h1><i class="fa-solid fa-graduation-cap"></i> Mark Management Portal</h1>
                        <span style="font-size: 11px; color: #64748b; font-weight: 600;">CPSCL Academic Examination & Marks Control</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <span id="memSystemBadge" class="mem-badge-status"><i class="fa-solid fa-circle-check"></i> System Unlocked</span>
                        <button type="button" class="mem-btn-pill mem-btn-outline" onclick="window.toggleMemFreeze()">
                            <i class="fa-solid fa-lock" id="memFreezeIcon"></i> <span id="memFreezeText">Freeze Entry</span>
                        </button>
                        <button type="button" class="mem-btn-pill mem-btn-primary" onclick="window.publishMemResults()">
                            <i class="fa-solid fa-bullhorn"></i> Publish Results
                        </button>
                    </div>
                </div>

                <!-- DRAWER 1: Student Mark Entry & Live Sheet -->
                <div class="mem-drawer open" id="drawer-entry">
                    <div class="mem-drawer-header" onclick="window.toggleMemDrawer('entry')">
                        <div class="mem-drawer-title"><i class="fa-solid fa-table-cells"></i> Student Mark Entry & Live Sheet</div>
                        <i class="fa-solid fa-chevron-right mem-drawer-arrow"></i>
                    </div>
                    <div class="mem-drawer-body">
                        <!-- Filter Bar with Group/Section Added -->
                        <div class="mem-filter-bar">
                            <div class="mem-filter-group">
                                <i class="fa-solid fa-file-pen" style="color: #64748b; font-size: 13px;"></i>
                                <select id="memFilterExam" onchange="window.onMemExamChange(this.value)">
                                    <option value="">-- Choose Exam --</option>
                                </select>
                            </div>

                            <div class="mem-filter-group">
                                <i class="fa-solid fa-users-rectangle" style="color: #64748b; font-size: 13px;"></i>
                                <select id="memFilterGroup" onchange="window.loadMemMarksTable()">
                                    <option value="ALL">All Groups / Sections</option>
                                </select>
                            </div>

                            <div class="mem-filter-group">
                                <i class="fa-solid fa-book" style="color: #64748b; font-size: 13px;"></i>
                                <select id="memFilterSubject" onchange="window.loadMemMarksTable()">
                                    <option value="">-- Select Subject --</option>
                                </select>
                            </div>

                            <button type="button" class="mem-btn-pill mem-btn-primary" onclick="window.loadMemMarksTable()">
                                <i class="fa-solid fa-arrows-rotate"></i> Load Sheet
                            </button>
                        </div>

                        <!-- Stats Box -->
                        <div class="mem-stats-grid" id="memDynamicStatsBox"></div>

                        <!-- Action bar & Table -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                            <input type="text" id="memSearchInput" placeholder="Search roll, name or group..." class="mem-mark-inp" style="width: 260px; text-align: left; padding: 9px 18px;" oninput="window.renderMemTableOnly(this.value)">
                            <div style="display: flex; gap: 8px;">
                                <button type="button" class="mem-btn-pill mem-btn-outline" onclick="window.fillZeroMarks()"><i class="fa-solid fa-wand-magic-sparkles"></i> Fill 0</button>
                                <button type="button" class="mem-btn-pill mem-btn-outline" onclick="window.clearMarks()"><i class="fa-solid fa-trash-can"></i> Clear</button>
                                <button type="button" class="mem-btn-pill mem-btn-success" onclick="window.saveMarksToCloud()"><i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud</button>
                            </div>
                        </div>

                        <div style="overflow-x: auto;">
                            <table class="mem-table">
                                <thead id="memTableThead"></thead>
                                <tbody id="memStudentMarksTbody">
                                    <tr><td colspan="7" style="text-align:center; padding:35px; color:#94a3b8;">Choose an Exam, Group, and Subject above to load the student list.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- DRAWER 2: Teacher Submissions & Approvals -->
                <div class="mem-drawer" id="drawer-approvals">
                    <div class="mem-drawer-header" onclick="window.toggleMemDrawer('approvals')">
                        <div class="mem-drawer-title"><i class="fa-solid fa-circle-check"></i> Teacher Submissions & Approvals</div>
                        <i class="fa-solid fa-chevron-right mem-drawer-arrow"></i>
                    </div>
                    <div class="mem-drawer-body">
                        <table class="mem-table">
                            <thead>
                                <tr>
                                    <th>Teacher</th>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Students</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="memApprovalsTbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- DRAWER 3: Entry Architecture & Mode Settings -->
                <div class="mem-drawer" id="drawer-settings">
                    <div class="mem-drawer-header" onclick="window.toggleMemDrawer('settings')">
                        <div class="mem-drawer-title"><i class="fa-solid fa-sliders"></i> Entry Architecture & Mode Settings</div>
                        <i class="fa-solid fa-chevron-right mem-drawer-arrow"></i>
                    </div>
                    <div class="mem-drawer-body">
                        <div class="mem-config-card">
                            <div class="mem-config-title"><i class="fa-solid fa-layer-group" style="color:#2563eb;"></i> 1. Mark Entry Format Mode</div>
                            <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
                                    <input type="radio" name="mem_opt_structure" value="direct" ${cfg.markStructure === 'direct' ? 'checked' : ''} onchange="window.updateMemConfigSetting('markStructure', 'direct')">
                                    Direct Single Mark (e.g. 30 Mark Entry)
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
                                    <input type="radio" name="mem_opt_structure" value="split" ${cfg.markStructure === 'split' ? 'checked' : ''} onchange="window.updateMemConfigSetting('markStructure', 'split')">
                                    Split Breakdown (CQ + MCQ + Practical)
                                </label>
                            </div>
                        </div>

                        <div class="mem-config-card">
                            <div class="mem-config-title"><i class="fa-solid fa-chart-line" style="color:#2563eb;"></i> 2. Academic Grading & Result Engine</div>
                            <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-top: 10px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
                                    <input type="radio" name="mem_opt_grading" value="false" ${!cfg.enableGrading ? 'checked' : ''} onchange="window.updateMemConfigSetting('enableGrading', false)">
                                    Raw Marks Only (Hide Grade, GPA & Pass/Fail)
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.9rem; cursor: pointer;">
                                    <input type="radio" name="mem_opt_grading" value="true" ${cfg.enableGrading ? 'checked' : ''} onchange="window.updateMemConfigSetting('enableGrading', true)">
                                    Automatic Grading Enabled (Calculate GPA & Pass/Fail)
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- DRAWER 4: National Grading System Scale -->
                <div class="mem-drawer" id="drawer-grading">
                    <div class="mem-drawer-header" onclick="window.toggleMemDrawer('grading')">
                        <div class="mem-drawer-title"><i class="fa-solid fa-chart-line"></i> National Grading System Scale</div>
                        <i class="fa-solid fa-chevron-right mem-drawer-arrow"></i>
                    </div>
                    <div class="mem-drawer-body">
                        <table class="mem-table">
                            <thead>
                                <tr><th>Grade</th><th>Min %</th><th>Max %</th><th>GPA</th><th>Status</th></tr>
                            </thead>
                            <tbody id="memGradingTbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- DRAWER 5: Super Admin Audit Trail & Logs -->
                <div class="mem-drawer" id="drawer-logs">
                    <div class="mem-drawer-header" onclick="window.toggleMemDrawer('logs')">
                        <div class="mem-drawer-title"><i class="fa-solid fa-clock-rotate-left"></i> Super Admin Audit Trail & Logs</div>
                        <i class="fa-solid fa-chevron-right mem-drawer-arrow"></i>
                    </div>
                    <div class="mem-drawer-body">
                        <div style="display:flex; justify-content:flex-end; margin-bottom:12px;">
                            <button type="button" class="mem-btn-pill mem-btn-outline" onclick="window.clearMemVisualLogs()">Clear Visual Trail</button>
                        </div>
                        <table class="mem-table">
                            <thead>
                                <tr><th>Timestamp</th><th>User</th><th>Action</th><th>Details</th><th>Type</th></tr>
                            </thead>
                            <tbody id="memLogsTbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        renderApprovals();
        renderGradingScales();
        renderLogs();
    }

    // ৬. ড্রয়ার টগল মেকানিজম
    window.toggleMemDrawer = function (drawerKey) {
        const drawer = document.getElementById(`drawer-${drawerKey}`);
        if (!drawer) return;
        drawer.classList.toggle('open');
    };

    // ৭. মাস্টার কনফিগ হ্যান্ডলার
    window.updateMemConfigSetting = function (key, value) {
        const cfg = getMemConfig();
        cfg[key] = value;
        saveMemConfig(cfg);
        
        if (typeof window.showToast === 'function') {
            window.showToast("Settings updated successfully!", "info");
        }
        window.renderMemTableOnly();
    };

    // হেল্পার: শিক্ষার্থীর গ্রুপ অথবা শাখা বের করা
    function getStudentGroupOrSec(s) {
        return String(s.group || s.std_group || s.group_name || s.section || s.sec || s.batch || '').trim();
    }

    // ৮. এক্সাম নির্বাচন ও স্বয়ংক্রিয় গ্রুপ ড্রপডাউন পপুলেট করা
    window.onMemExamChange = function (examId) {
        currentExamId = examId;
        const exam = loadedExamsCache.find(x => x.id === examId);
        const subSelect = document.getElementById('memFilterSubject');
        const grpSelect = document.getElementById('memFilterGroup');
        if (!subSelect) return;

        // Populate Subjects
        subSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        if (exam && exam.subjects) {
            Object.keys(exam.subjects).forEach(sub => {
                const markVal = exam.subjects[sub] || 30;
                subSelect.innerHTML += `<option value="${sub}" data-full="${markVal}">${sub} (Full Marks: ${markVal})</option>`;
            });
            if (Object.keys(exam.subjects).length > 0) {
                subSelect.value = Object.keys(exam.subjects)[0];
            }
        }

        // Populate Groups / Sections based on students of this exam class
        if (grpSelect && exam) {
            grpSelect.innerHTML = '<option value="ALL">All Groups / Sections</option>';
            const allStudents = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            const classStudents = allStudents.filter(s => {
                const cName = String(s.class_name || s.class || '').trim().toLowerCase();
                const target = String(exam.class).trim().toLowerCase();
                return cName === target || cName.includes(target) || target.includes(cName);
            });

            const uniqueGroups = new Set();
            classStudents.forEach(st => {
                const g = getStudentGroupOrSec(st);
                if (g) uniqueGroups.add(g);
            });

            uniqueGroups.forEach(g => {
                grpSelect.innerHTML += `<option value="${g}">${g}</option>`;
            });
        }

        window.loadMemMarksTable();
    };

    // ৯. গ্রুপ ও বিষয় ফিল্টার করে আসল শিক্ষার্থী ও নম্বর লোড করা
    window.loadMemMarksTable = async function () {
        const examSelect = document.getElementById('memFilterExam');
        const subSelect = document.getElementById('memFilterSubject');
        const grpSelect = document.getElementById('memFilterGroup');
        if (!examSelect || !subSelect) return;

        const examId = examSelect.value;
        const subject = subSelect.value;
        const selectedGroup = grpSelect ? grpSelect.value : 'ALL';

        currentExamId = examId;
        currentSubject = subject;

        const exam = loadedExamsCache.find(x => x.id === examId);
        if (!exam) return;

        currentClass = exam.class;

        const opt = subSelect.options[subSelect.selectedIndex];
        currentSubjectFullMark = opt ? parseInt(opt.getAttribute('data-full')) || 30 : 30;

        let allStudents = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
        
        // Filter by class first
        let filteredStudents = allStudents.filter(s => {
            const cName = String(s.class_name || s.class || '').trim().toLowerCase();
            const target = String(exam.class).trim().toLowerCase();
            return cName === target || cName.includes(target) || target.includes(cName);
        });

        // Filter by Group/Section if not ALL
        if (selectedGroup && selectedGroup !== 'ALL') {
            filteredStudents = filteredStudents.filter(s => {
                return getStudentGroupOrSec(s).toLowerCase() === selectedGroup.toLowerCase();
            });
        }

        currentStudentsList = filteredStudents;

        currentStudentsList.sort((a, b) => {
            const rA = parseInt(a.roll_no || a.roll) || 0;
            const rB = parseInt(b.roll_no || b.roll) || 0;
            if (rA && rB) return rA - rB;
            return String(a.std_id || a.id).localeCompare(String(b.std_id || b.id));
        });

        let savedMarks = JSON.parse(localStorage.getItem(`cpscl_marks_${examId}_${subject}`) || '{}');

        if (window.getDatabase && window.ref && window.get) {
            try {
                const db = window.getDatabase();
                const snapMarks = await window.get(window.ref(db, `cpscl_exam_marks/${examId}_${subject}`));
                if (snapMarks.exists()) {
                    savedMarks = snapMarks.val();
                    localStorage.setItem(`cpscl_marks_${examId}_${subject}`, JSON.stringify(savedMarks));
                }
            } catch (e) {}
        }

        currentStudentsList.forEach(st => {
            const stId = st.std_id || st.id;
            const existing = savedMarks[stId] || {};
            st.rawMark = existing.rawMark !== undefined ? existing.rawMark : (existing.cq !== undefined ? existing.cq : null);
            st.cq = existing.cq !== undefined ? existing.cq : null;
            st.mcq = existing.mcq !== undefined ? existing.mcq : null;
            st.practical = existing.practical !== undefined ? existing.practical : null;
            st.remarks = existing.remarks || '';
        });

        window.renderMemTableOnly();
    };

    // ১০. টেবিল ও লাইভ কাউন্টার রেন্ডার
    window.renderMemTableOnly = function (searchQuery = '') {
        const thead = document.getElementById('memTableThead');
        const tbody = document.getElementById('memStudentMarksTbody');
        const statsBox = document.getElementById('memDynamicStatsBox');
        if (!tbody || !thead) return;

        const cfg = getMemConfig();
        const isDirect = (cfg.markStructure === 'direct');
        const isGrading = !!cfg.enableGrading;

        let thHtml = `<tr>
            <th style="width: 70px; text-align: center;">Roll</th>
            <th>Student Name & Group</th>
        `;

        if (isDirect) {
            thHtml += `<th style="width: 150px; text-align: center;">Marks (Max ${currentSubjectFullMark})</th>`;
        } else {
            thHtml += `
                <th style="width: 100px; text-align: center;">CQ</th>
                <th style="width: 100px; text-align: center;">MCQ</th>
                <th style="width: 100px; text-align: center;">Practical</th>
                <th style="width: 90px; text-align: center;">Total</th>
            `;
        }

        if (isGrading) {
            thHtml += `
                <th style="width: 80px; text-align: center;">Grade</th>
                <th style="width: 80px; text-align: center;">GPA</th>
                <th style="width: 90px; text-align: center;">Status</th>
            `;
        }

        thHtml += `<th>Note / Remarks</th></tr>`;
        thead.innerHTML = thHtml;

        const q = (searchQuery || '').toLowerCase();
        const filtered = currentStudentsList.filter(s => {
            const name = (s.student_name || s.name || '').toLowerCase();
            const roll = String(s.roll_no || s.roll || '');
            const grp = getStudentGroupOrSec(s).toLowerCase();
            return name.includes(q) || roll.includes(q) || grp.includes(q);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:35px; color:#94a3b8;">No student records found for the chosen criteria.</td></tr>`;
            return;
        }

        let enteredCount = 0;
        let passCount = 0;
        let failCount = 0;

        tbody.innerHTML = '';
        filtered.forEach((st, idx) => {
            const stId = st.std_id || st.id;
            const roll = st.roll_no || st.roll || (idx + 1);
            const name = st.student_name || st.name || 'Student';
            const grp = getStudentGroupOrSec(st);

            let lineMarkDisplay = '';
            let lineTotal = 0;
            let isEntered = false;

            if (isDirect) {
                isEntered = (st.rawMark !== null && st.rawMark !== undefined && st.rawMark !== '');
                lineTotal = parseFloat(st.rawMark) || 0;
                lineMarkDisplay = `
                    <td style="text-align: center;">
                        <input type="number" 
                               min="0" 
                               max="${currentSubjectFullMark}" 
                               class="mem-mark-inp ${st.rawMark > currentSubjectFullMark ? 'is-invalid' : ''}" 
                               value="${st.rawMark !== null ? st.rawMark : ''}" 
                               placeholder="0-${currentSubjectFullMark}" 
                               oninput="window.updateScoreDirect('${stId}', this.value, this)">
                    </td>
                `;
            } else {
                const cq = parseFloat(st.cq) || 0;
                const mcq = parseFloat(st.mcq) || 0;
                const practical = parseFloat(st.practical) || 0;
                lineTotal = cq + mcq + practical;
                isEntered = (st.cq !== null || st.mcq !== null);
                lineMarkDisplay = `
                    <td style="text-align: center;"><input type="number" min="0" class="mem-mark-inp" value="${st.cq !== null ? st.cq : ''}" placeholder="CQ" oninput="window.updateScoreSplit('${stId}', 'cq', this.value, this)"></td>
                    <td style="text-align: center;"><input type="number" min="0" class="mem-mark-inp" value="${st.mcq !== null ? st.mcq : ''}" placeholder="MCQ" oninput="window.updateScoreSplit('${stId}', 'mcq', this.value, this)"></td>
                    <td style="text-align: center;"><input type="number" min="0" class="mem-mark-inp" value="${st.practical !== null ? st.practical : ''}" placeholder="Prac" oninput="window.updateScoreSplit('${stId}', 'practical', this.value, this)"></td>
                    <td style="text-align: center; font-weight:800; color:#2563eb;">${isEntered ? lineTotal : '-'}</td>
                `;
            }

            if (isEntered) enteredCount++;

            const passThreshold = (currentSubjectFullMark * 0.33);
            const isPass = lineTotal >= passThreshold;
            if (isEntered) {
                if (isPass) passCount++;
                else failCount++;
            }

            let gradingDisplay = '';
            if (isGrading) {
                const pct = (lineTotal / currentSubjectFullMark) * 100;
                let gLetter = 'F';
                let gpaVal = '0.00';
                for (let sc of gradeScales) {
                    if (pct >= sc.min && pct <= sc.max && isPass) {
                        gLetter = sc.grade;
                        gpaVal = sc.gpa.toFixed(2);
                        break;
                    }
                }

                gradingDisplay = `
                    <td style="text-align: center;"><span class="mem-badge-pill" style="background:#eff6ff; color:#2563eb;">${isEntered ? gLetter : '-'}</span></td>
                    <td style="text-align: center; font-weight: 700;">${isEntered ? gpaVal : '-'}</td>
                    <td style="text-align: center;">
                        <span class="mem-badge-pill" style="background:${isPass ? '#dcfce7' : '#fee2e2'}; color:${isPass ? '#15803d' : '#dc2626'};">
                            ${isEntered ? (isPass ? 'Pass' : 'Fail') : '-'}
                        </span>
                    </td>
                `;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; font-weight: 800; background: #f8fafc;">${roll}</td>
                <td>
                    <strong>${name}</strong>
                    ${grp ? `<span class="mem-badge-pill" style="background: #f1f5f9; color: #475569; margin-left: 6px; font-size: 0.72rem;">${grp}</span>` : ''}
                    <div style="font-size:0.75rem; color:#64748b;">ID: ${stId}</div>
                </td>
                ${lineMarkDisplay}
                ${gradingDisplay}
                <td>
                    <input type="text" value="${st.remarks || ''}" placeholder="Note..." style="border:none; background:transparent; outline:none; font-size:0.85rem; width:100%;" oninput="window.updateScoreRemarks('${stId}', this.value)">
                </td>
            `;
            tbody.appendChild(tr);
        });

        const pendingCount = (filtered.length - enteredCount);
        if (statsBox) {
            statsBox.innerHTML = `
                <div class="mem-stat-card">
                    <div><p>Total Students</p><h3>${filtered.length}</h3></div>
                    <i class="fa-solid fa-users" style="color: #2563eb; font-size: 1.4rem;"></i>
                </div>
                <div class="mem-stat-card">
                    <div><p>Marks Entered</p><h3 style="color: #10b981;">${enteredCount}</h3></div>
                    <i class="fa-solid fa-circle-check" style="color: #10b981; font-size: 1.4rem;"></i>
                </div>
                <div class="mem-stat-card">
                    <div><p>Pending / Remaining</p><h3 style="color: #f59e0b;">${pendingCount}</h3></div>
                    <i class="fa-solid fa-clock" style="color: #f59e0b; font-size: 1.4rem;"></i>
                </div>
            `;
        }
    };

    // ১১. কড়া নম্বর ভ্যালিডেশন হ্যান্ডলার (৩০ এর বেশি দেওয়া যাবে না)
    window.updateScoreDirect = function (stId, val, inputEl) {
        const student = currentStudentsList.find(s => (s.std_id || s.id) === stId);
        if (!student) return;

        if (val === '') {
            student.rawMark = null;
            student.cq = null;
            if (inputEl) inputEl.classList.remove('is-invalid');
            return;
        }

        let num = parseFloat(val);

        // ভ্যালিডেশন: পূর্ণমানের বেশি হতে পারবে না
        if (num > currentSubjectFullMark) {
            alert(`সতর্কতা: এই বিষয়ের পূর্ণমান ${currentSubjectFullMark}! আপনি ${num} দিতে পারবেন না।`);
            num = currentSubjectFullMark;
            if (inputEl) {
                inputEl.value = currentSubjectFullMark;
                inputEl.classList.add('is-invalid');
                setTimeout(() => inputEl.classList.remove('is-invalid'), 1200);
            }
        } else if (num < 0) {
            alert("সতর্কতা: নম্বর ০ এর কম হতে পারে না!");
            num = 0;
            if (inputEl) inputEl.value = 0;
        }

        student.rawMark = num;
        student.cq = num;
    };

    window.updateScoreSplit = function (stId, field, val, inputEl) {
        const student = currentStudentsList.find(s => (s.std_id || s.id) === stId);
        if (!student) return;

        if (val === '') {
            student[field] = null;
            return;
        }

        let num = parseFloat(val);
        if (num < 0) num = 0;
        student[field] = num;

        const total = (parseFloat(student.cq) || 0) + (parseFloat(student.mcq) || 0) + (parseFloat(student.practical) || 0);
        if (total > currentSubjectFullMark) {
            alert(`সতর্কতা: মোট নম্বর পূর্ণমান ${currentSubjectFullMark}-এর চেয়ে বেশি হয়ে গেছে!`);
            if (inputEl) inputEl.classList.add('is-invalid');
        } else {
            if (inputEl) inputEl.classList.remove('is-invalid');
        }
    };

    window.updateScoreRemarks = function (stId, val) {
        const student = currentStudentsList.find(s => (s.std_id || s.id) === stId);
        if (student) {
            student.remarks = val;
        }
    };

    // ১২. ক্লাউডে সেভ (আগের অন্য গ্রুপের ডেটা না মুছে নির্ভুল সেভ)
    window.saveMarksToCloud = async function () {
        if (!currentExamId || !currentSubject) {
            alert("Please choose an Exam and Subject first!");
            return;
        }

        // চূড়ান্ত নিরাপত্তা চেক: কোনো শিক্ষার্থীর নম্বর পূর্ণমানের চেয়ে বেশি আছে কি না
        for (let st of currentStudentsList) {
            const mark = st.rawMark;
            if (mark !== null && mark !== undefined && mark !== '') {
                const num = parseFloat(mark);
                if (num > currentSubjectFullMark) {
                    const roll = st.roll_no || st.roll || 'N/A';
                    const name = st.student_name || st.name || 'Student';
                    alert(`ভুল হয়েছে! রোল: ${roll} (${name})-এর নম্বর পূর্ণমান ${currentSubjectFullMark}-এর বেশি (${num}) দেওয়া আছে। দয়া করে সংশোধন করুন, নয়তো সেভ হবে না।`);
                    return; // সেভ বন্ধ!
                }
            }
        }

        // পূর্বের সেভ করা ডেটা লোড করে নেওয়া যাতে অন্য গ্রুপের ডেটা মুছে না যায়
        let mergedMarks = JSON.parse(localStorage.getItem(`cpscl_marks_${currentExamId}_${currentSubject}`) || '{}');

        currentStudentsList.forEach(st => {
            const stId = st.std_id || st.id;
            mergedMarks[stId] = {
                rawMark: st.rawMark,
                cq: st.cq,
                mcq: st.mcq,
                practical: st.practical,
                remarks: st.remarks || ''
            };
        });

        localStorage.setItem(`cpscl_marks_${currentExamId}_${currentSubject}`, JSON.stringify(mergedMarks));

        if (typeof window.writeToFirebase === 'function') {
            try {
                await window.writeToFirebase(`cpscl_exam_marks/${currentExamId}_${currentSubject}`, mergedMarks);
            } catch(e) {
                console.warn("Cloud save error:", e);
            }
        }

        addAuditLog("Marks Saved", `Saved marks for Exam: ${currentExamId}, Subject: ${currentSubject}`);
        if (typeof window.showToast === 'function') {
            window.showToast("Marks successfully saved to Firebase Cloud!", "success");
        } else {
            alert("Marks successfully saved to Firebase Cloud!");
        }
        window.renderMemTableOnly();
    };

    window.fillZeroMarks = function () {
        currentStudentsList.forEach(st => {
            if (st.rawMark === null || st.rawMark === undefined) st.rawMark = 0;
            if (st.cq === null) st.cq = 0;
            if (st.mcq === null) st.mcq = 0;
            if (st.practical === null) st.practical = 0;
        });
        window.renderMemTableOnly();
    };

    window.clearMarks = function () {
        if (!confirm("Are you sure you want to clear all entered marks in this current view?")) return;
        currentStudentsList.forEach(st => {
            st.rawMark = null;
            st.cq = null;
            st.mcq = null;
            st.practical = null;
            st.remarks = '';
        });
        window.renderMemTableOnly();
    };

    function renderApprovals() {
        const tbody = document.getElementById('memApprovalsTbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        pendingApprovals.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.teacher}</strong></td>
                <td>${item.classSec}</td>
                <td style="color:#2563eb; font-weight:700;">${item.subject}</td>
                <td><strong>${item.count}</strong></td>
                <td style="color:#64748b;">${item.time}</td>
                <td><span class="mem-badge-pill" style="background:#fef3c7; color:#d97706;">Pending</span></td>
                <td style="text-align:right;">
                    <button class="mem-btn-pill mem-btn-success" style="padding:4px 14px; font-size:0.75rem;" onclick="this.closest('tr').remove();"><i class="fa-solid fa-check"></i> Approve</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderGradingScales() {
        const tbody = document.getElementById('memGradingTbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        gradeScales.forEach(sc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="mem-badge-pill" style="background:#eff6ff; color:#2563eb;">${sc.grade}</span></td>
                <td><strong>${sc.min}%</strong></td>
                <td><strong>${sc.max}%</strong></td>
                <td><strong>${sc.gpa.toFixed(2)}</strong></td>
                <td><span class="mem-badge-pill" style="background:#dcfce7; color:#15803d;">${sc.status}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function addAuditLog(action, details, type = "SuperAdmin") {
        auditLogs.unshift({
            time: new Date().toLocaleTimeString(),
            user: "Root Admin",
            action,
            details,
            type
        });
        renderLogs();
    }

    function renderLogs() {
        const tbody = document.getElementById('memLogsTbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        auditLogs.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-family:monospace; color:#64748b; font-size:0.8rem;">${l.time}</td>
                <td><strong>${l.user}</strong></td>
                <td>${l.action}</td>
                <td style="color:#475569;">${l.details}</td>
                <td><span class="mem-badge-pill" style="background:#f1f5f9; color:#475569;">${l.type}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.clearMemVisualLogs = function () {
        auditLogs = [];
        renderLogs();
    };

    window.toggleMemFreeze = function () {
        isFrozen = !isFrozen;
        const badge = document.getElementById('memSystemBadge');
        const text = document.getElementById('memFreezeText');
        const icon = document.getElementById('memFreezeIcon');
        if (isFrozen) {
            badge.innerHTML = `<i class="fa-solid fa-lock"></i> System Frozen`;
            badge.style.background = "#fee2e2";
            badge.style.color = "#dc2626";
            badge.style.borderColor = "#fca5a5";
            text.innerText = "Unfreeze Entry";
            icon.className = "fa-solid fa-unlock";
        } else {
            badge.innerHTML = `<i class="fa-solid fa-circle-check"></i> System Unlocked`;
            badge.style.background = "#eff6ff";
            badge.style.color = "#2563eb";
            badge.style.borderColor = "#bfdbfe";
            text.innerText = "Freeze Entry";
            icon.className = "fa-solid fa-lock";
        }
    };

    window.publishMemResults = function () {
        addAuditLog("Results Published", "Published batch assessment results");
        if (typeof window.showToast === 'function') {
            window.showToast("Batch results successfully published!", "success");
        } else {
            alert("Batch results successfully published!");
        }
    };

    function init() {
        injectMarkEntryStyles();
        injectMarkEntrySidebar();

        syncFromCloud();
        setTimeout(syncFromCloud, 600);
        setTimeout(syncFromCloud, 1800);
        setTimeout(syncFromCloud, 3500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200);
    }
})();
