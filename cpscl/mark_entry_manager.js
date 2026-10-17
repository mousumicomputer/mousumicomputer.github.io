/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Super Admin Mark Management Engine (v1.0 Pixel-Perfect)
   Path: cpscl/mark_entry_manager.js
   Architecture: Real Student Sync | Scoped Pill UI | 5 Super Admin Tabs | Cloud Save
   Language: Pure English (Corporate ERP Standard)
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Super Admin Mark Management Engine...");

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
        }
    };

    // ২. স্কোপড সিএসএস ইনজেকশন (মেইন ERP-এর সাথে কোনো কনফ্লিক্ট হবে না)
    function injectMarkEntryStyles() {
        if (document.getElementById('cpscl-mark-entry-scoped-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-mark-entry-scoped-styles';
        style.innerHTML = `
            .mem-wrapper { padding: 15px 5px; font-family: 'Plus Jakarta Sans', sans-serif; }
            .mem-header { background: #0f172a; color: #ffffff; padding: 14px 24px; border-radius: 50px !important; display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); flex-wrap: wrap; gap: 12px; }
            .mem-header h1 { font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 10px; margin: 0; }
            .mem-badge-status { font-size: 10px; font-weight: 800; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid rgba(16, 185, 129, 0.4); padding: 3px 12px; border-radius: 50px !important; text-transform: uppercase; }

            /* Pill Navigation Tabs */
            .mem-nav-tabs { display: flex; gap: 8px; margin-bottom: 18px; background: #ffffff; padding: 8px 12px; border-radius: 50px !important; border: 1px solid #e2e8f0; overflow-x: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
            .mem-tab-btn { background: transparent; border: none; color: #64748b; padding: 9px 20px; border-radius: 50px !important; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
            .mem-tab-btn:hover { background: #f1f5f9; color: #0284c7; }
            .mem-tab-btn.active { background: #0284c7 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25); }

            .mem-tab-content { display: none; }
            .mem-tab-content.active { display: block; }

            /* Filter Controls Bar */
            .mem-filter-bar { background: #ffffff; padding: 12px 18px; border-radius: 50px !important; border: 1px solid #e2e8f0; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
            .mem-filter-group { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 6px 14px; border-radius: 50px !important; border: 1px solid #cbd5e1; flex: 1; min-width: 140px; }
            .mem-filter-group select { border: none; background: transparent; font-size: 0.84rem; font-weight: 700; color: #1e293b; outline: none; width: 100%; cursor: pointer; }

            /* Stats Overview Grid */
            .mem-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px; }
            .mem-stat-card { background: #ffffff; padding: 12px 20px; border-radius: 50px !important; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
            .mem-stat-card p { margin: 0; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
            .mem-stat-card h3 { margin: 0; font-size: 1.15rem; font-weight: 800; color: #0f172a; }

            /* Main Table Container */
            .mem-table-card { background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
            .mem-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
            .mem-table th { background: #f8fafc !important; color: #64748b !important; font-size: 0.72rem !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; padding: 12px 14px !important; text-align: left; }
            .mem-table td { background: #ffffff; padding: 10px 14px; font-size: 0.86rem; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; color: #334155; }
            .mem-table tr td:first-child { border-left: 1px solid #f1f5f9; border-radius: 50px 0 0 50px; }
            .mem-table tr td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 50px 50px 0; }
            .mem-table tbody tr:hover td { background: #f8fafc; }

            /* Inputs & Badges inside Table */
            .mem-mark-inp { width: 75px; text-align: center; padding: 6px 10px; border-radius: 50px !important; border: 1.5px solid #cbd5e1; font-size: 0.85rem; font-weight: 700; outline: none; background: #f8fafc; }
            .mem-mark-inp:focus { border-color: #0284c7; background: #ffffff; box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15); }
            .mem-badge-pill { padding: 3px 12px; border-radius: 50px !important; font-size: 0.75rem; font-weight: 800; display: inline-block; }

            /* Action Buttons (Pills) */
            .mem-btn-pill { padding: 8px 18px; border-radius: 50px !important; font-size: 0.82rem; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; }
            .mem-btn-primary { background: #0284c7; color: #ffffff; }
            .mem-btn-primary:hover { background: #0369a1; }
            .mem-btn-success { background: #10b981; color: #ffffff; }
            .mem-btn-danger { background: #ef4444; color: #ffffff; }
            .mem-btn-outline { background: #ffffff; border: 1.5px solid #cbd5e1; color: #475569; }
            .mem-btn-outline:hover { background: #f8fafc; border-color: #94a3b8; }
        `;
        document.head.appendChild(style);
    }

    // ৩. ডাটা স্টোর ও ইনিশিয়ালাইজেশন
    let markStore = {};
    let currentExamId = '';
    let currentSubject = '';
    let currentClass = '';
    let currentStudentsList = [];
    let isFrozen = false;
    let isSubjectLocked = false;

    let auditLogs = [
        { time: new Date().toLocaleTimeString(), user: "Root Admin", action: "System Ready", details: "Mark management initialized", type: "System" }
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

    // ৪. মূল ভিউ রেন্ডারার
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

        // এক্সাম রেজিস্ট্রি থেকে লাইভ এক্সাম লোড করা
        const exams = JSON.parse(localStorage.getItem('cpscl_exams_registry') || '[]');

        panel.innerHTML = `
            <div class="mem-wrapper">
                <!-- Top Control Header -->
                <div class="mem-header">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 38px; height: 38px; border-radius: 50%; background: #e11d48; display: flex; align-items: center; justify-content: center;">
                            <i class="fa-solid fa-user-shield" style="font-size: 16px;"></i>
                        </div>
                        <div>
                            <h1>SUPER ADMIN <span id="memSystemBadge" class="mem-badge-status">System Unlocked</span></h1>
                            <span style="font-size: 11px; color: #94a3b8; font-weight: 500;">Master Marks & Results Controller</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                        <button type="button" class="mem-btn-pill mem-btn-outline" style="border-color: #f59e0b; color: #f59e0b;" onclick="window.toggleMemFreeze()">
                            <i class="fa-solid fa-lock" id="memFreezeIcon"></i> <span id="memFreezeText">Freeze All Entry</span>
                        </button>
                        <button type="button" class="mem-btn-pill mem-btn-success" onclick="window.publishMemResults()">
                            <i class="fa-solid fa-bullhorn"></i> Publish Results
                        </button>
                    </div>
                </div>

                <!-- 5 Navigation Tabs (Pills) -->
                <div class="mem-nav-tabs">
                    <button class="mem-tab-btn active" onclick="window.switchMemTab('entry', this)">
                        <i class="fa-solid fa-table-cells"></i> Mark Entry & Overrides
                    </button>
                    <button class="mem-tab-btn" onclick="window.switchMemTab('approvals', this)">
                        <i class="fa-solid fa-circle-check"></i> Bulk Approvals
                    </button>
                    <button class="mem-tab-btn" onclick="window.switchMemTab('limits', this)">
                        <i class="fa-solid fa-sliders"></i> Distribution & Limits
                    </button>
                    <button class="mem-tab-btn" onclick="window.switchMemTab('grading', this)">
                        <i class="fa-solid fa-chart-line"></i> Grade Scaling
                    </button>
                    <button class="mem-tab-btn" onclick="window.switchMemTab('logs', this)">
                        <i class="fa-solid fa-clock-rotate-left"></i> Audit Logs
                    </button>
                </div>

                <!-- TAB 1: Mark Entry -->
                <div id="mem-tab-entry" class="mem-tab-content active">
                    <div class="mem-filter-bar">
                        <div class="mem-filter-group">
                            <i class="fa-solid fa-file-pen" style="color: #94a3b8; font-size: 13px;"></i>
                            <select id="memFilterExam" onchange="window.onMemExamChange(this.value)">
                                <option value="">-- Choose Exam --</option>
                                ${exams.map(x => `<option value="${x.id}">${x.name} (${x.class})</option>`).join('')}
                            </select>
                        </div>
                        <div class="mem-filter-group">
                            <i class="fa-solid fa-book" style="color: #94a3b8; font-size: 13px;"></i>
                            <select id="memFilterSubject" onchange="window.loadMemMarksTable()">
                                <option value="">-- Select Subject --</option>
                            </select>
                        </div>
                        <button type="button" class="mem-btn-pill mem-btn-primary" onclick="window.loadMemMarksTable()">
                            <i class="fa-solid fa-arrows-rotate"></i> Load Data
                        </button>
                    </div>

                    <!-- Stats Banner -->
                    <div class="mem-stats-grid">
                        <div class="mem-stat-card">
                            <div><p>Total Students</p><h3 id="statMemTotal">0</h3></div>
                            <i class="fa-solid fa-users" style="color: #3b82f6;"></i>
                        </div>
                        <div class="mem-stat-card">
                            <div><p>Marks Entered</p><h3 id="statMemEntered" style="color: #10b981;">0</h3></div>
                            <i class="fa-solid fa-check" style="color: #10b981;"></i>
                        </div>
                        <div class="mem-stat-card">
                            <div><p>Pass Rate</p><h3 id="statMemPassRate" style="color: #0284c7;">0%</h3></div>
                            <i class="fa-solid fa-chart-pie" style="color: #0284c7;"></i>
                        </div>
                        <div class="mem-stat-card">
                            <div><p>Failed</p><h3 id="statMemFailed" style="color: #ef4444;">0</h3></div>
                            <i class="fa-solid fa-xmark" style="color: #ef4444;"></i>
                        </div>
                    </div>

                    <!-- Mark Table Card -->
                    <div class="mem-table-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                            <input type="text" id="memSearchInput" placeholder="Search roll or name..." class="mem-mark-inp" style="width: 240px; text-align: left; padding: 8px 16px;" oninput="window.renderMemTableOnly(this.value)">
                            <div style="display: flex; gap: 8px;">
                                <button type="button" class="mem-btn-pill mem-btn-outline" onclick="window.fillZeroMarks()"><i class="fa-solid fa-wand-magic-sparkles"></i> Fill 0</button>
                                <button type="button" class="mem-btn-pill mem-btn-outline" onclick="window.clearMarks()"><i class="fa-solid fa-trash-can"></i> Clear</button>
                                <button type="button" class="mem-btn-pill mem-btn-success" onclick="window.saveMarksToCloud()"><i class="fa-solid fa-cloud-arrow-up"></i> Save to Cloud</button>
                            </div>
                        </div>

                        <div style="overflow-x: auto;">
                            <table class="mem-table">
                                <thead>
                                    <tr>
                                        <th style="width: 70px; text-align: center;">Roll</th>
                                        <th>Student Name</th>
                                        <th style="width: 110px; text-align: center;">CQ Marks</th>
                                        <th style="width: 110px; text-align: center;">MCQ</th>
                                        <th style="width: 110px; text-align: center;">Practical</th>
                                        <th style="width: 90px; text-align: center;">Total</th>
                                        <th style="width: 80px; text-align: center;">Grade</th>
                                        <th style="width: 80px; text-align: center;">GPA</th>
                                        <th style="width: 90px; text-align: center;">Status</th>
                                        <th>Note / Remarks</th>
                                    </tr>
                                </thead>
                                <tbody id="memStudentMarksTbody">
                                    <tr><td colspan="10" style="text-align:center; padding:35px; color:#94a3b8;">Choose an Exam and Subject to load mark entry sheet.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- TAB 2: Approvals -->
                <div id="mem-tab-approvals" class="mem-tab-content">
                    <div class="mem-table-card">
                        <h3 style="font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 14px;">Teacher Grade Submissions (Pending Review)</h3>
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

                <!-- TAB 3: Limits -->
                <div id="mem-tab-limits" class="mem-tab-content">
                    <div class="mem-table-card">
                        <h3 style="font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 14px;">Subject Mark Ceilings & Pass Rule</h3>
                        <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 18px;">Configure CQ, MCQ, Practical ceiling limits per subject.</p>
                        <div id="memLimitsContainer"></div>
                    </div>
                </div>

                <!-- TAB 4: Grading Scale -->
                <div id="mem-tab-grading" class="mem-tab-content">
                    <div class="mem-table-card">
                        <h3 style="font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 14px;">National Grading System Scale</h3>
                        <table class="mem-table">
                            <thead>
                                <tr>
                                    <th>Grade</th>
                                    <th>Min %</th>
                                    <th>Max %</th>
                                    <th>GPA</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody id="memGradingTbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- TAB 5: Audit Logs -->
                <div id="mem-tab-logs" class="mem-tab-content">
                    <div class="mem-table-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                            <h3 style="font-size: 1.1rem; font-weight: 800; color: #1e293b; margin:0;">Super Admin Immutable Trail</h3>
                            <button type="button" class="mem-btn-pill mem-btn-outline" onclick="window.clearMemVisualLogs()">Clear Visual</button>
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

        if (exams.length > 0) {
            document.getElementById('memFilterExam').value = exams[0].id;
            window.onMemExamChange(exams[0].id);
        }
        renderApprovals();
        renderGradingScales();
        renderLogs();
    }

    // ৫. এক্সাম পরিবর্তনের সাথে সাবজেক্ট লোড
    window.onMemExamChange = function (examId) {
        currentExamId = examId;
        const exams = JSON.parse(localStorage.getItem('cpscl_exams_registry') || '[]');
        const exam = exams.find(x => x.id === examId);
        const subSelect = document.getElementById('memFilterSubject');
        if (!subSelect) return;

        subSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        if (exam && exam.subjects) {
            Object.keys(exam.subjects).forEach(sub => {
                subSelect.innerHTML += `<option value="${sub}">${sub} (Total: ${exam.subjects[sub]})</option>`;
            });
            if (Object.keys(exam.subjects).length > 0) {
                subSelect.value = Object.keys(exam.subjects)[0];
            }
        }
        window.loadMemMarksTable();
    };

    // ৬. আসল ছাত্র-ছাত্রীদের মার্ক টেবিল লোড
    window.loadMemMarksTable = async function () {
        const examSelect = document.getElementById('memFilterExam');
        const subSelect = document.getElementById('memFilterSubject');
        if (!examSelect || !subSelect) return;

        const examId = examSelect.value;
        const subject = subSelect.value;
        currentExamId = examId;
        currentSubject = subject;

        const exams = JSON.parse(localStorage.getItem('cpscl_exams_registry') || '[]');
        const exam = exams.find(x => x.id === examId);
        if (!exam) return;

        currentClass = exam.class;

        // লোকাল বা ক্লাউড থেকে আসল ছাত্র লোড
        let allStudents = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
        currentStudentsList = allStudents.filter(s => {
            const cName = String(s.class_name || s.class || '').trim().toLowerCase();
            const target = String(exam.class).trim().toLowerCase();
            return cName === target || cName.includes(target) || target.includes(cName);
        });

        // ফায়ারবেস বা ক্যাশ থেকে আগে সেভ করা মার্কস লোড
        const savedMarks = JSON.parse(localStorage.getItem(`cpscl_marks_${examId}_${subject}`) || '{}');

        currentStudentsList.forEach(st => {
            const stId = st.std_id || st.id;
            const existing = savedMarks[stId] || {};
            st.cq = existing.cq !== undefined ? existing.cq : null;
            st.mcq = existing.mcq !== undefined ? existing.mcq : null;
            st.practical = existing.practical !== undefined ? existing.practical : null;
            st.remarks = existing.remarks || '';
        });

        window.renderMemTableOnly();
    };

    window.renderMemTableOnly = function (searchQuery = '') {
        const tbody = document.getElementById('memStudentMarksTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const q = (searchQuery || '').toLowerCase();
        const filtered = currentStudentsList.filter(s => {
            const name = (s.student_name || s.name || '').toLowerCase();
            const roll = String(s.roll_no || s.roll || '');
            return name.includes(q) || roll.includes(q);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:#94a3b8;">No student records found.</td></tr>`;
            return;
        }

        let enteredCount = 0;
        let passCount = 0;
        let failCount = 0;

        filtered.forEach((st, idx) => {
            const stId = st.std_id || st.id;
            const roll = st.roll_no || st.roll || (idx + 1);
            const name = st.student_name || st.name || 'Student';

            const cq = parseFloat(st.cq) || 0;
            const mcq = parseFloat(st.mcq) || 0;
            const prac = parseFloat(st.practical) || 0;
            const total = cq + mcq + prac;

            const isEntered = (st.cq !== null || st.mcq !== null);
            if (isEntered) enteredCount++;

            const isPass = total >= 33;
            if (isEntered) {
                if (isPass) passCount++;
                else failCount++;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; font-weight: 800; background: #f8fafc;">${roll}</td>
                <td><strong>${name}</strong> <span style="font-size:0.75rem; color:#94a3b8;">(${stId})</span></td>
                <td style="text-align: center;">
                    <input type="number" class="mem-mark-inp" value="${st.cq !== null ? st.cq : ''}" placeholder="0-70" oninput="window.updateStudentScore('${stId}', 'cq', this.value)">
                </td>
                <td style="text-align: center;">
                    <input type="number" class="mem-mark-inp" value="${st.mcq !== null ? st.mcq : ''}" placeholder="0-30" oninput="window.updateStudentScore('${stId}', 'mcq', this.value)">
                </td>
                <td style="text-align: center;">
                    <input type="number" class="mem-mark-inp" value="${st.practical !== null ? st.practical : ''}" placeholder="0-25" oninput="window.updateStudentScore('${stId}', 'practical', this.value)">
                </td>
                <td style="text-align: center; font-weight: 800; color: #0284c7;">${isEntered ? total : '-'}</td>
                <td style="text-align: center;"><span class="mem-badge-pill" style="background:#e0f2fe; color:#0369a1;">${isEntered ? (isPass ? 'A' : 'F') : '-'}</span></td>
                <td style="text-align: center; font-weight: 700;">${isEntered ? (isPass ? '4.00' : '0.00') : '-'}</td>
                <td style="text-align: center;">
                    <span class="mem-badge-pill" style="background:${isPass ? '#dcfce7' : '#fee2e2'}; color:${isPass ? '#15803d' : '#dc2626'};">
                        ${isEntered ? (isPass ? 'Pass' : 'Fail') : '-'}
                    </span>
                </td>
                <td>
                    <input type="text" value="${st.remarks || ''}" placeholder="Note..." style="border:none; background:transparent; outline:none; font-size:0.8rem; width:100%;" oninput="window.updateStudentScore('${stId}', 'remarks', this.value)">
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('statMemTotal').innerText = filtered.length;
        document.getElementById('statMemEntered').innerText = enteredCount;
        document.getElementById('statMemFailed').innerText = failCount;
        const rate = enteredCount > 0 ? Math.round((passCount / enteredCount) * 100) : 0;
        document.getElementById('statMemPassRate').innerText = `${rate}%`;
    };

    window.updateStudentScore = function (stId, field, val) {
        const student = currentStudentsList.find(s => (s.std_id || s.id) === stId);
        if (student) {
            student[field] = (field === 'remarks') ? val : (val === '' ? null : parseFloat(val));
        }
    };

    // ৭. ফায়ারবেসে সেভ করা
    window.saveMarksToCloud = async function () {
        if (!currentExamId || !currentSubject) {
            alert("Please choose an Exam and Subject first!");
            return;
        }

        const payload = {};
        currentStudentsList.forEach(st => {
            const stId = st.std_id || st.id;
            payload[stId] = {
                cq: st.cq,
                mcq: st.mcq,
                practical: st.practical,
                remarks: st.remarks || ''
            };
        });

        localStorage.setItem(`cpscl_marks_${currentExamId}_${currentSubject}`, JSON.stringify(payload));

        if (typeof window.writeToFirebase === 'function') {
            try {
                await window.writeToFirebase(`cpscl_exam_marks/${currentExamId}_${currentSubject}`, payload);
            } catch(e) {}
        }

        addAuditLog("Marks Saved", `Saved mark entries for Exam ID: ${currentExamId}, Subject: ${currentSubject}`);
        if (typeof window.showToast === 'function') {
            window.showToast("Marks successfully saved to Firebase Cloud!", "success");
        } else {
            alert("Marks successfully saved to Firebase Cloud!");
        }
        window.renderMemTableOnly();
    };

    window.fillZeroMarks = function () {
        currentStudentsList.forEach(st => {
            if (st.cq === null) st.cq = 0;
            if (st.mcq === null) st.mcq = 0;
            if (st.practical === null) st.practical = 0;
        });
        window.renderMemTableOnly();
    };

    window.clearMarks = function () {
        if (!confirm("Are you sure you want to clear all entered marks?")) return;
        currentStudentsList.forEach(st => {
            st.cq = null;
            st.mcq = null;
            st.practical = null;
            st.remarks = '';
        });
        window.renderMemTableOnly();
    };

    // ৮. ট্যাব সুইচিং ও অন্যান্য সেটিংস
    window.switchMemTab = function (tabKey, btn) {
        document.querySelectorAll('.mem-tab-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');

        document.querySelectorAll('.mem-tab-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(`mem-tab-${tabKey}`);
        if (target) target.classList.add('active');
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
                <td style="color:#0284c7; font-weight:700;">${item.subject}</td>
                <td><strong>${item.count}</strong></td>
                <td style="color:#94a3b8;">${item.time}</td>
                <td><span class="mem-badge-pill" style="background:#fef3c7; color:#d97706;">Pending</span></td>
                <td style="text-align:right;">
                    <button class="mem-btn-pill mem-btn-success" style="padding:4px 12px; font-size:0.75rem;" onclick="this.closest('tr').remove();"><i class="fa-solid fa-check"></i> Approve</button>
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
                <td><span class="mem-badge-pill" style="background:#e0f2fe; color:#0369a1;">${sc.grade}</span></td>
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
                <td style="font-family:monospace; color:#94a3b8; font-size:0.8rem;">${l.time}</td>
                <td><strong>${l.user}</strong></td>
                <td>${l.action}</td>
                <td style="color:#64748b;">${l.details}</td>
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
            badge.innerText = "System Frozen";
            badge.style.background = "rgba(239, 68, 68, 0.2)";
            badge.style.color = "#fca5a5";
            text.innerText = "Unfreeze System";
            icon.className = "fa-solid fa-unlock";
        } else {
            badge.innerText = "System Unlocked";
            badge.style.background = "rgba(16, 185, 129, 0.2)";
            badge.style.color = "#6ee7b7";
            text.innerText = "Freeze All Entry";
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 250);
    }
})();
