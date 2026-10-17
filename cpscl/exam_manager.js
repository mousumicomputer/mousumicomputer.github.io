/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Exam & Dynamic Student Group Management Suite (v2.2)
   Path: cpscl/exam_manager.js
   Design: 1:1 Trust ERP Style (Solid Blue Row Selection & Top Action Bar)
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Trust-ERP 1:1 Styled Suite (cpscl/exam_manager.js)...");

    // ১. ট্রাস্ট ইআরপি হুবহু স্টাইল ইনজেকশন
    function injectExamStyles() {
        if (document.getElementById('cpscl-exam-manager-style')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-exam-manager-style';
        style.innerHTML = `
            .em-wrapper { padding: 15px 5px; font-family: 'Plus Jakarta Sans', sans-serif; }
            .em-header { background: #ffffff; border: 1px solid #e2e8f0; padding: 18px 25px; border-radius: 50px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
            .em-header h1 { font-size: 1.35rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; margin: 0; }
            .em-header h1 i { color: #2563eb; }
            .em-badge { background: #eff6ff; color: #2563eb; font-weight: 700; font-size: 0.82rem; padding: 6px 16px; border-radius: 50px; border: 1px solid #bfdbfe; }

            /* মডিউল ন্যাভ ট্যাব */
            .em-nav-tabs { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
            .em-tab-btn { background: #ffffff; border: 1.5px solid #cbd5e1; color: #64748b; padding: 11px 22px; border-radius: 50px; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; }
            .em-tab-btn:hover { border-color: #2563eb; color: #2563eb; }
            .em-tab-btn.active { background: #2563eb; color: #ffffff; border-color: #2563eb; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }

            .em-tab-content { display: none; }
            .em-tab-content.active { display: block; }

            /* ওয়ার্কস্পেস ভিউ বার */
            .em-view-bar { display: flex; gap: 8px; margin-bottom: 20px; background: #ffffff; padding: 10px 18px; border-radius: 50px; border: 1px solid #e2e8f0; align-items: center; flex-wrap: wrap; }
            .em-view-bar span { font-size: 0.85rem; font-weight: 700; color: #64748b; margin-right: 5px; }
            .em-btn-toggle { background: #f8fafc; border: 1px solid #cbd5e1; color: #0f172a; padding: 7px 16px; border-radius: 50px; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
            .em-btn-toggle:hover { border-color: #2563eb; color: #2563eb; }
            .em-btn-toggle.active { background: #2563eb; color: #ffffff; border-color: #2563eb; box-shadow: 0 4px 10px rgba(37,99,235,0.25); }

            /* গ্রিড ও কার্ড */
            .em-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; transition: all 0.3s ease; }
            @media (max-width: 1024px) { .em-grid { grid-template-columns: 1fr !important; } }

            .em-card { background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 22px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
            .em-card-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
            .em-card-title span { display: flex; align-items: center; gap: 8px; }
            .em-card-title i { color: #2563eb; }

            .em-form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
            .em-form-group label { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
            .em-control { width: 100%; height: 42px; border: 1.5px solid #cbd5e1; border-radius: 50px; padding: 0 18px; font-size: 0.9rem; outline: none; background: #ffffff; color: #0f172a; transition: 0.2s; }
            .em-control:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
            select.em-control { cursor: pointer; }

            /* পিলস */
            .em-pills-box { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; margin-bottom: 12px; }
            .em-pill { display: inline-flex; align-items: center; gap: 8px; background: #eff6ff; color: #2563eb; border: 1.5px solid #bfdbfe; padding: 7px 15px; border-radius: 50px; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; user-select: none; }
            .em-pill:hover { background: #dbeafe; border-color: #2563eb; transform: translateY(-1px); }
            .em-pill.active { background: #2563eb; color: #ffffff; border-color: #2563eb; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25); }
            .em-pill-actions { display: flex; gap: 5px; margin-left: 6px; align-items: center; }
            .em-pill-btn { font-size: 0.72rem; opacity: 0.7; cursor: pointer; transition: 0.2s; padding: 2px; }
            .em-pill-btn:hover { opacity: 1; }

            .em-custom-sub-bar { display: flex; gap: 8px; margin-bottom: 15px; }
            .em-btn-add { background: #f8fafc; border: 1.5px dashed #cbd5e1; color: #2563eb; padding: 0 18px; border-radius: 50px; font-weight: 700; font-size: 0.82rem; cursor: pointer; white-space: nowrap; transition: 0.2s; }
            .em-btn-add:hover { background: #eff6ff; border-color: #2563eb; }

            /* =======================================================
               ছবি ২, ৩ ও ৪-এর হুবহু ১:১ ট্রাস্ট ইআরপি টেবিল ও সিলেকশন সিএসএস
               ======================================================= */
            .em-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .em-table th {
                background: #ffffff !important;
                color: #8c98a4 !important;
                font-size: 0.75rem !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
                padding: 14px 18px !important;
                border-bottom: 1.5px solid #eef2f5 !important;
                user-select: none;
                text-align: left;
            }
            .em-table tbody td {
                color: #334155 !important;
                font-size: 0.88rem !important;
                font-weight: 500 !important;
                padding: 13px 18px !important;
                border-bottom: 1px solid #eef2f5 !important;
                user-select: none;
            }

            /* জেব্রা স্ট্রাইপ ও হোভার */
            .em-table tbody tr:nth-child(even) { background-color: #f8fafc !important; }
            .em-table tbody tr:nth-child(odd) { background-color: #ffffff !important; }
            .em-table tbody tr:hover { background-color: #f1f5f9 !important; cursor: pointer; }

            /* ছবি ৩ ও ৪-এর হুবহু সলিড ব্লু সিলেকশন (#3b82f6) */
            .em-table tbody tr.erp-row-selected,
            .em-table tbody tr.erp-row-selected:nth-child(even),
            .em-table tbody tr.erp-row-selected:nth-child(odd) {
                background-color: #3b82f6 !important;
            }
            .em-table tbody tr.erp-row-selected td,
            .em-table tbody tr.erp-row-selected td * {
                color: #ffffff !important;
            }
            .em-table tbody tr.erp-row-selected .em-group-badge {
                background-color: rgba(255, 255, 255, 0.25) !important;
                color: #ffffff !important;
                border-color: rgba(255, 255, 255, 0.4) !important;
            }

            /* গ্রুপ ব্যাজ */
            .em-group-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 50px;
                font-size: 0.8rem;
                font-weight: 700;
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
            }

            /* উপরের ট্রান্সফার অ্যাকশন বার */
            .em-top-transfer-bar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f8fafc;
                border: 1.5px solid #e2e8f0;
                border-radius: 14px;
                padding: 10px 18px;
                margin-bottom: 16px;
                flex-wrap: wrap;
                gap: 12px;
            }
            .em-transfer-btns-group {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
            }
            .em-btn-move {
                padding: 7px 16px;
                border-radius: 50px;
                font-size: 0.82rem;
                font-weight: 700;
                cursor: pointer;
                border: none;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: 0.2s;
            }
            .em-btn-move-a { background: #2563eb; color: #fff; box-shadow: 0 2px 6px rgba(37,99,235,0.25); }
            .em-btn-move-a:hover { background: #1d4ed8; }
            .em-btn-move-b { background: #059669; color: #fff; box-shadow: 0 2px 6px rgba(5,150,105,0.25); }
            .em-btn-move-b:hover { background: #047857; }
            .em-btn-move:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

            /* পেজিনেশন ফুটার */
            .em-pagination-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 8px; border-top: 1.5px solid #eef2f5; flex-wrap: wrap; gap: 12px; margin-top: 15px; }
            .em-page-btn { min-width: 32px; height: 32px; display: inline-flex; align-items: center; justify-content: center; padding: 0 8px; border: 1px solid #e2e8f0; background: #ffffff; color: #475569; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
            .em-page-btn:hover:not(.disabled):not(.active) { background: #f1f5f9; border-color: #cbd5e1; }
            .em-page-btn.active { background: #3b82f6; border-color: #3b82f6; color: #ffffff; font-weight: 700; }
            .em-page-btn.disabled { opacity: 0.35; cursor: not-allowed; }

            /* ড্যাশবোর্ড ফর্ম বাটন */
            .em-btn-submit { background: #2563eb; color: #fff; border: none; width: 100%; height: 48px; border-radius: 50px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
            .em-btn-submit:hover { background: #1d4ed8; }
            .em-group-row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; background: #f8fafc; padding: 8px 14px; border-radius: 50px; border: 1.5px solid #cbd5e1; }
            .em-group-row input { height: 34px; border-radius: 50px; border: 1px solid #cbd5e1; padding: 0 14px; font-size: 0.85rem; font-weight: 700; outline: none; background: #ffffff; }

            /* মোডাল */
            .em-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: none; justify-content: center; align-items: center; z-index: 999999; }
            .em-modal-card { background: #ffffff; border: 2px solid #cbd5e1; padding: 25px; border-radius: 25px; width: 100%; max-width: 420px; box-shadow: 0 20px 35px rgba(0,0,0,0.2); text-align: center; }
            .em-modal-card h3 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
            .em-modal-inp { width: 100%; height: 44px; border: 1.5px solid #cbd5e1; border-radius: 50px; padding: 0 18px; font-size: 0.95rem; font-weight: 600; outline: none; text-align: center; margin-bottom: 18px; background: #f8fafc; }
            .em-modal-inp:focus { border-color: #2563eb; background: #fff; }
            .em-modal-btn { padding: 9px 20px; border-radius: 50px; font-weight: 700; font-size: 0.85rem; cursor: pointer; border: none; }
            .em-modal-btn.confirm { background: #2563eb; color: #ffffff; }
            .em-modal-btn.cancel { background: #f1f5f9; color: #64748b; border: 1.5px solid #cbd5e1; }
        `;
        document.head.appendChild(style);
    }

    // ২. সাইডবার ইনজেকশন
    function injectExamManagerSidebar() {
        const studentRegModule = document.getElementById('trust-cpscl-module-root');
        if (!studentRegModule) {
            setTimeout(injectExamManagerSidebar, 200);
            return;
        }

        if (document.getElementById('trust-cpscl-exam-module-root')) return;

        const examLi = document.createElement('li');
        examLi.className = 'trust-module-wrapper expanded';
        examLi.id = 'trust-cpscl-exam-module-root';

        examLi.innerHTML = `
            <a class="trust-parent-btn" onclick="toggleCPSCLExamModule()">
                <div class="trust-parent-left">
                    <i class="fa-solid fa-graduation-cap" style="color: #2563eb;"></i>
                    <span>Exam Manager</span>
                </div>
                <i class="fa-solid fa-chevron-down chevron-arrow"></i>
            </a>

            <ul class="trust-submenu-box" id="trust-exam-submenu-items">
                <li>
                    <a class="trust-sub-link active" id="sub-link-create-exam" onclick="switchCPSCLExamSubTab(this, 'create-exam')">
                        <span class="trust-sub-indicator"></span>
                        <span>Create Exam</span>
                    </a>
                </li>
            </ul>
        `;

        studentRegModule.parentNode.insertBefore(examLi, studentRegModule.nextSibling);
    }

    window.toggleCPSCLExamModule = function () {
        const wrapper = document.getElementById('trust-cpscl-exam-module-root');
        if (wrapper) wrapper.classList.toggle('expanded');
    };

    window.switchCPSCLExamSubTab = function (element, tabKey) {
        document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
        if (element) element.classList.add('active');

        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const topTitle = document.getElementById('top-title');

        if (tabKey === 'create-exam') {
            const view = document.getElementById('cpscl-exam-manager-main-view');
            if (view) view.classList.add('active');
            if (topTitle) topTitle.innerText = "CPSCL - Exam & Group Management Suite";
            renderExamManagerUI();
        }
    };

    // ৩. ডাটা স্টোর
    const defaultMasterSubjects = {
        "Class 1": ["Bangla", "English", "Mathematics"],
        "Class 2": ["Bangla", "English", "Mathematics"],
        "Class 3": ["Bangla", "English", "Mathematics", "Science"],
        "Class 4": ["Bangla", "English", "Mathematics", "Science", "BGS"],
        "Class 5": ["Bangla", "English", "Mathematics", "Science", "BGS", "Religion"],
        "Class 6": ["Mathematics", "English", "Science", "Bangla", "ICT"],
        "Class 7": ["Mathematics", "English", "Science", "Bangla", "Social Science"],
        "Class 8": ["Mathematics", "English", "Science", "Bangla", "Religion", "ICT"],
        "Class 9": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Bangla"],
        "Class 10": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "Higher Math"],
        "HSC 1st Year": ["Bangla", "English", "Physics", "Chemistry", "Mathematics", "Biology"],
        "HSC 2nd Year": ["Bangla", "English", "Physics", "Chemistry", "Mathematics", "Biology"]
    };

    let examRegistry = [];
    let currentActiveSubjectsList = [];
    let selectedSubjectsMap = {};
    let manualGroupOverrides = {};

    // Tab 2 শিক্ষার্থী তালিকা ও সিলেকশন স্টেট
    let allocatedStudentsCache = [];
    let selectedStudentIds = new Set(); // ক্লিক করে সিলেক্ট করা ছাত্রদের সেট
    let emStudentSearchQuery = '';
    let emSelectedGroupFilter = 'all';
    let emStudentCurrentPage = 1;
    let emStudentPageSize = 25;

    function getDynamicClassOptions() {
        if (typeof window.getCPSCLMasterConfig === 'function') {
            const cfg = window.getCPSCLMasterConfig();
            const classFilter = cfg.filterBoxes.find(b => b.id === 'class_name');
            if (classFilter && classFilter.options && classFilter.options.length > 0) {
                return classFilter.options;
            }
        }
        return ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
    }

    // ৪. মূল ইন্টারফেস রেন্ডার
    function renderExamManagerUI() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        let panel = document.getElementById('cpscl-exam-manager-main-view');
        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'view-panel active';
            panel.id = 'cpscl-exam-manager-main-view';
            mainWrapper.appendChild(panel);
        }

        const classList = getDynamicClassOptions();
        const defaultClass = classList.includes("Eight Scholarship Batch-2026") ? "Eight Scholarship Batch-2026" : 
                            (classList.includes("Class 8") ? "Class 8" : classList[0]);

        let classOptsHtml = '<option value="">-- Choose Class --</option>';
        classList.forEach(c => {
            classOptsHtml += `<option value="${c}" ${c === defaultClass ? 'selected' : ''}>${c}</option>`;
        });

        panel.innerHTML = `
            <div class="em-wrapper">
                <div class="em-header">
                    <h1><i class="fa-solid fa-graduation-cap"></i> CPSCL Academic ERP - Exam & Group Management</h1>
                    <div class="em-badge"><i class="fa-solid fa-user-shield"></i> Administrator Portal</div>
                </div>

                <div class="em-nav-tabs">
                    <button class="em-tab-btn active" id="emTabBtn1" onclick="switchEMMainTab('createExam')">
                        <i class="fa-solid fa-file-pen"></i> 1. Exam & Dynamic Group Setup
                    </button>
                    <button class="em-tab-btn" id="emTabBtn2" onclick="switchEMMainTab('transferModule')">
                        <i class="fa-solid fa-shuffle"></i> 2. Student Group Allocation & Manual Transfer
                    </button>
                </div>

                <!-- TAB 1: Exam & Dynamic Group Setup -->
                <div class="em-tab-content active" id="emTabContent1">
                    <div class="em-view-bar">
                        <span><i class="fa-solid fa-eye"></i> Workspace View:</span>
                        <button type="button" class="em-btn-toggle active" id="emBtnShowBoth" onclick="setEMWorkspaceView('both')">
                            <i class="fa-solid fa-columns"></i> Split View (Both)
                        </button>
                        <button type="button" class="em-btn-toggle" id="emBtnShowForm" onclick="setEMWorkspaceView('form')">
                            <i class="fa-solid fa-file-pen"></i> Form Only (Max)
                        </button>
                        <button type="button" class="em-btn-toggle" id="emBtnShowHistory" onclick="setEMWorkspaceView('history')">
                            <i class="fa-solid fa-clock-rotate-left"></i> History Registry Only (Max)
                        </button>
                    </div>

                    <div class="em-grid" id="emMainGrid">
                        <!-- Left: Form -->
                        <div id="emFormCol">
                            <div class="em-card">
                                <div class="em-card-title">
                                    <span id="emFormTitle"><i class="fa-solid fa-file-pen"></i> Create New Assessment & Rules</span>
                                    <button type="button" id="emCancelEditBtn" style="display:none; background:none; border:none; color:#dc2626; font-size:0.8rem; font-weight:700; cursor:pointer;" onclick="resetEMForm()">Cancel Edit</button>
                                </div>

                                <form id="emAssessmentForm" onsubmit="handleEMSubmit(event)">
                                    <input type="hidden" id="emEditingId" value="">

                                    <div class="em-form-group">
                                        <label>1. Exam Name / Title *</label>
                                        <input type="text" id="emExamName" class="em-control" placeholder="e.g., Daily Assessment - 01" required>
                                    </div>

                                    <div class="em-form-group">
                                        <label>2. Select Target Class *</label>
                                        <select id="emClassName" class="em-control" onchange="onEMClassChange(this.value)" required>
                                            ${classOptsHtml}
                                        </select>
                                    </div>

                                    <div class="em-form-group">
                                        <label>3. Exam Date *</label>
                                        <input type="date" id="emExamDate" class="em-control" required>
                                    </div>

                                    <div class="em-form-group" style="margin-top: 14px;">
                                        <label>4. Select Subjects & Assign Marks *</label>
                                        <div class="em-pills-box" id="emPillsArea"></div>

                                        <div class="em-custom-sub-bar">
                                            <input type="text" id="emCustomSubInput" class="em-control" placeholder="Add custom subject name...">
                                            <button type="button" class="em-btn-add" onclick="addEMCustomSubject()"><i class="fa-solid fa-plus"></i> Add</button>
                                        </div>
                                    </div>

                                    <div id="emSelectedSubContainer" style="display:none; margin-top:14px;">
                                        <table class="em-table">
                                            <thead>
                                                <tr>
                                                    <th>Subject</th>
                                                    <th style="text-align: center; width: 110px;">Full Marks</th>
                                                    <th style="text-align: right; width: 70px;">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody id="emSelectedSubTbody"></tbody>
                                        </table>
                                        <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:700; margin-top:12px; padding:10px 18px; background:#f8fafc; border-radius:50px;">
                                            <span>Total Subjects: <span id="emSummaryCount">0</span></span>
                                            <span>Total Full Marks: <span id="emSummaryTotal">0</span></span>
                                        </div>
                                    </div>

                                    <!-- ৫. ডায়নামিক গ্রুপ রুলস -->
                                    <div class="em-form-group" style="margin-top: 25px; border-top: 2px solid #f1f5f9; padding-top: 18px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                            <label style="margin: 0;"><i class="fa-solid fa-layer-group" style="color: #2563eb;"></i> 5. Initial Serial-based Grouping Rules</label>
                                            <button type="button" class="em-btn-add" onclick="addEMGroupRuleRow()"><i class="fa-solid fa-plus"></i> Add Group</button>
                                        </div>
                                        <span style="font-size: 0.75rem; color: #64748b; margin-bottom: 12px;">Define how student serials are distributed: (e.g. 1 to 40 = Group A, 41 to Rest = Group B)</span>
                                        
                                        <div id="emGroupRulesContainer"></div>
                                    </div>

                                    <button type="submit" id="emSubmitBtn" class="em-btn-submit">
                                        <i class="fa-solid fa-check-circle"></i> Save Exam & Generate Initial Groups
                                    </button>
                                </form>
                            </div>
                        </div>

                        <!-- Right: History Registry -->
                        <div id="emHistoryCol">
                            <div class="em-card">
                                <div class="em-card-title">
                                    <span><i class="fa-solid fa-clock-rotate-left"></i> Exam Registry & Status</span>
                                    <span style="font-size: 0.8rem; color: #64748b; font-weight: normal;">Manage, Edit & Duplicate</span>
                                </div>

                                <div style="overflow-x: auto;">
                                    <table class="em-table">
                                        <thead>
                                            <tr>
                                                <th>Exam Title & Group Rules</th>
                                                <th>Class</th>
                                                <th>Date</th>
                                                <th style="text-align: right;">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody id="emRegistryTbody"></tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB 2: Student Group Allocation & Manual Transfer (Trust ERP Style) -->
                <div class="em-tab-content" id="emTabContent2">
                    <div class="em-card">
                        <div class="em-card-title">
                            <span><i class="fa-solid fa-shuffle"></i> Student Group Allocation & Manual Transfer</span>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <select id="emTransferExamSelect" class="em-control" style="width: 290px; height: 38px; font-size: 0.85rem;" onchange="loadEMStudentGroupAllocation()">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                        </div>

                        <!-- উপরের স্মার্ট ট্রান্সফার অ্যাকশন বার (ছবি ৩ ও ৪-এর জন্য নতুন কন্ট্রোল) -->
                        <div class="em-top-transfer-bar">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; max-width: 380px;">
                                <input type="text" id="emStudentSearchInp" class="em-control" style="height: 38px;" placeholder="Search student by Name, ID, or SL..." oninput="onEMStudentSearch(this.value)">
                            </div>
                            
                            <!-- নির্বাচিত শিক্ষার্থীদের জন্য ট্রান্সফার অ্যাকশন বাটনসমূহ -->
                            <div class="em-transfer-btns-group">
                                <span id="emSelectedCountBadge" style="font-size: 0.82rem; font-weight: 700; color: #64748b; padding: 0 8px;">
                                    0 Selected
                                </span>
                                <div id="emDynamicTransferBtns" style="display: inline-flex; gap: 8px;">
                                    <!-- Dynamic Action Buttons (e.g. Move to Group A, Move to Group B) -->
                                </div>
                            </div>
                        </div>

                        <!-- গ্রুপ ফিল্টার পিলস -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
                            <div class="em-group-pills-filter" id="emGroupFilterPills"></div>
                            <span style="font-size: 0.8rem; color: #64748b; font-style: italic;">
                                <i class="fa-solid fa-circle-info"></i> Click on any student row to select (turns blue) and click action buttons above to transfer.
                            </span>
                        </div>

                        <!-- ট্রাস্ট ইআরপি ১:১ টেবিল -->
                        <div style="overflow-x: auto; border: 1px solid #eef2f5; border-radius: 8px;">
                            <table class="em-table">
                                <thead>
                                    <tr>
                                        <th style="width: 70px;">SL #</th>
                                        <th style="width: 140px;">Student ID</th>
                                        <th>Student Name</th>
                                        <th>Class</th>
                                        <th style="text-align: right; width: 140px;">Assigned Group</th>
                                    </tr>
                                </thead>
                                <tbody id="emStudentAllocationTbody">
                                    <!-- Dynamic Rows with Solid Blue Row Click -->
                                </tbody>
                            </table>
                        </div>

                        <!-- পেজিনেশন ও ফুটার (ছবি ৪-এর হুবহু) -->
                        <div class="em-pagination-footer">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #64748b;">
                                <select class="em-control" style="width: 75px; height: 32px; padding: 0 10px; border-radius: 6px;" onchange="changeEMPageSize(this.value)">
                                    <option value="10">10</option>
                                    <option value="25" selected>25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                <span>entries per page</span>
                                <span id="emPaginationCounterText" style="margin-left: 14px; font-weight: 600;"></span>
                            </div>
                            <div id="emPaginationBtnsContainer" style="display: flex; gap: 4px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Subject Edit Modal -->
            <div id="emCustomModalOverlay" class="em-modal-overlay">
                <div class="em-modal-card">
                    <h3 id="emModalTitle">Edit Subject Name</h3>
                    <input type="text" id="emModalInput" class="em-modal-inp" placeholder="Enter subject name...">
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button type="button" class="em-modal-btn cancel" onclick="closeEMModal()">Cancel</button>
                        <button type="button" class="em-modal-btn confirm" id="emModalConfirmBtn">Update Name</button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('emExamDate').value = new Date().toISOString().split('T')[0];
        initDefaultEMGroupRules();
        onEMClassChange(defaultClass);
        syncFromFirebase();
    }

    // ৫. ট্যাব সুইচিং
    window.switchEMMainTab = function(tabKey) {
        document.getElementById('emTabBtn1').classList.remove('active');
        document.getElementById('emTabBtn2').classList.remove('active');
        document.getElementById('emTabContent1').classList.remove('active');
        document.getElementById('emTabContent2').classList.remove('active');

        if (tabKey === 'createExam') {
            document.getElementById('emTabBtn1').classList.add('active');
            document.getElementById('emTabContent1').classList.add('active');
        } else if (tabKey === 'transferModule') {
            document.getElementById('emTabBtn2').classList.add('active');
            document.getElementById('emTabContent2').classList.add('active');
            populateEMExamDropdown();
            loadEMStudentGroupAllocation();
        }
    };

    // ৬. গ্রুপ রুলস
    function initDefaultEMGroupRules() {
        const container = document.getElementById('emGroupRulesContainer');
        if (!container) return;
        container.innerHTML = '';
        addEMGroupRuleRowData("Group A", "1", "40");
        addEMGroupRuleRowData("Group B", "41", "Rest");
    }

    window.addEMGroupRuleRow = function() {
        addEMGroupRuleRowData("Group C", "", "");
    };

    function addEMGroupRuleRowData(name, fromVal, toVal) {
        const container = document.getElementById('emGroupRulesContainer');
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'em-group-row';
        row.innerHTML = `
            <input type="text" class="g-name" value="${name}" placeholder="Group Name" style="width: 35%;">
            <input type="text" class="g-from" value="${fromVal}" placeholder="From Serial" style="width: 25%; text-align: center;">
            <span style="font-size:0.8rem; font-weight:700; color:#64748b;">to</span>
            <input type="text" class="g-to" value="${toVal}" placeholder="To Serial / Rest" style="width: 25%; text-align: center;">
            <button type="button" class="em-btn-icon delete" style="width: 30px; height: 30px; margin-left: auto;" onclick="this.closest('.em-group-row').remove()" title="Remove"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    }

    // ৭. ভিউ মোড
    window.setEMWorkspaceView = function(mode) {
        const grid = document.getElementById('emMainGrid');
        const formCol = document.getElementById('emFormCol');
        const historyCol = document.getElementById('emHistoryCol');

        document.getElementById('emBtnShowBoth').classList.remove('active');
        document.getElementById('emBtnShowForm').classList.remove('active');
        document.getElementById('emBtnShowHistory').classList.remove('active');

        if (mode === 'both') {
            grid.style.gridTemplateColumns = '1fr 1fr';
            formCol.style.display = 'block';
            historyCol.style.display = 'block';
            document.getElementById('emBtnShowBoth').classList.add('active');
        } else if (mode === 'form') {
            grid.style.gridTemplateColumns = '1fr';
            formCol.style.display = 'block';
            historyCol.style.display = 'none';
            document.getElementById('emBtnShowForm').classList.add('active');
        } else if (mode === 'history') {
            grid.style.gridTemplateColumns = '1fr';
            formCol.style.display = 'none';
            historyCol.style.display = 'block';
            document.getElementById('emBtnShowHistory').classList.add('active');
        }
    };

    // ৮. ক্লাস ও পিলস
    window.onEMClassChange = function(className) {
        if (!className) {
            currentActiveSubjectsList = [];
        } else if (defaultMasterSubjects[className]) {
            currentActiveSubjectsList = [...defaultMasterSubjects[className]];
        } else {
            currentActiveSubjectsList = ["Bangla", "English", "Mathematics", "Science", "BGS"];
        }
        selectedSubjectsMap = {};
        renderEMPills();
        renderEMSelectedTable();
    };

    function renderEMPills() {
        const area = document.getElementById('emPillsArea');
        if (!area) return;
        area.innerHTML = '';

        if (currentActiveSubjectsList.length === 0) {
            area.innerHTML = '<span style="color:#64748b; font-size:0.85rem;">Select a class first.</span>';
            return;
        }

        currentActiveSubjectsList.forEach(sub => {
            const isSelected = selectedSubjectsMap.hasOwnProperty(sub);
            const pill = document.createElement('div');
            pill.className = `em-pill ${isSelected ? 'active' : ''}`;
            pill.innerHTML = `
                <span>${sub}</span>
                <div class="em-pill-actions">
                    <i class="fa-solid fa-pen em-pill-btn" title="Edit name" onclick="openEMEditSubjectModal(event, '${sub}')"></i>
                    <i class="fa-solid fa-xmark em-pill-btn" title="Remove" onclick="deleteEMSubjectPill(event, '${sub}')"></i>
                </div>
            `;
            pill.onclick = (e) => {
                if (!e.target.classList.contains('em-pill-btn')) {
                    toggleEMSubject(sub);
                }
            };
            area.appendChild(pill);
        });
    }

    function toggleEMSubject(sub) {
        if (selectedSubjectsMap[sub]) {
            delete selectedSubjectsMap[sub];
        } else {
            selectedSubjectsMap[sub] = 50;
        }
        renderEMPills();
        renderEMSelectedTable();
    }

    window.openEMEditSubjectModal = function(e, oldName) {
        e.stopPropagation();
        const overlay = document.getElementById('emCustomModalOverlay');
        const inputField = document.getElementById('emModalInput');
        const confirmBtn = document.getElementById('emModalConfirmBtn');
        const modalTitle = document.getElementById('emModalTitle');

        modalTitle.innerText = `Edit Subject: '${oldName}'`;
        inputField.value = oldName;
        overlay.style.display = 'flex';
        inputField.focus();

        confirmBtn.onclick = () => {
            const newName = inputField.value.trim();
            if (!newName) return;
            const idx = currentActiveSubjectsList.indexOf(oldName);
            if (idx !== -1) currentActiveSubjectsList[idx] = newName;
            if (selectedSubjectsMap.hasOwnProperty(oldName)) {
                selectedSubjectsMap[newName] = selectedSubjectsMap[oldName];
                delete selectedSubjectsMap[oldName];
            }
            renderEMPills();
            renderEMSelectedTable();
            closeEMModal();
        };
    };

    window.closeEMModal = function() {
        document.getElementById('emCustomModalOverlay').style.display = 'none';
    };

    function deleteEMSubjectPill(e, sub) {
        e.stopPropagation();
        if (confirm(`Remove '${sub}' from active subject list?`)) {
            currentActiveSubjectsList = currentActiveSubjectsList.filter(s => s !== sub);
            delete selectedSubjectsMap[sub];
            renderEMPills();
            renderEMSelectedTable();
        }
    }

    window.addEMCustomSubject = function() {
        const inp = document.getElementById('emCustomSubInput');
        const name = inp.value.trim();
        if (!name) return;
        if (currentActiveSubjectsList.includes(name)) {
            alert("Subject already exists!");
            return;
        }
        currentActiveSubjectsList.push(name);
        selectedSubjectsMap[name] = 50;
        inp.value = '';
        renderEMPills();
        renderEMSelectedTable();
    };

    function renderEMSelectedTable() {
        const container = document.getElementById('emSelectedSubContainer');
        const tbody = document.getElementById('emSelectedSubTbody');
        const keys = Object.keys(selectedSubjectsMap);

        if (!container || !tbody) return;

        if (keys.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        tbody.innerHTML = '';
        let totalMarks = 0;

        keys.forEach(sub => {
            const m = selectedSubjectsMap[sub];
            totalMarks += Number(m) || 0;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sub}</td>
                <td style="text-align: center;">
                    <input type="number" class="em-mark-inp" value="${m}" min="1" oninput="updateEMMark('${sub}', this.value)">
                </td>
                <td style="text-align: right;">
                    <button type="button" class="em-btn-icon delete" onclick="toggleEMSubject('${sub}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('emSummaryCount').innerText = keys.length;
        document.getElementById('emSummaryTotal').innerText = totalMarks;
    }

    window.updateEMMark = function(sub, val) {
        selectedSubjectsMap[sub] = Number(val) || 0;
        let sum = 0;
        Object.values(selectedSubjectsMap).forEach(m => sum += m);
        document.getElementById('emSummaryTotal').innerText = sum;
    };

    // ৯. ফর্ম সাবমিট
    window.handleEMSubmit = async function(e) {
        e.preventDefault();
        const editId = document.getElementById('emEditingId').value;
        const name = document.getElementById('emExamName').value.trim();
        const className = document.getElementById('emClassName').value;
        const date = document.getElementById('emExamDate').value;
        const keys = Object.keys(selectedSubjectsMap);

        if (keys.length === 0) {
            alert("Please select at least one subject!");
            return;
        }

        let groupsArr = [];
        document.querySelectorAll('.em-group-row').forEach(row => {
            const gName = row.querySelector('.g-name').value.trim() || "Group";
            const gFrom = row.querySelector('.g-from').value.trim() || "1";
            const gTo = row.querySelector('.g-to').value.trim() || "Rest";
            groupsArr.push({ name: gName, from: gFrom, to: gTo });
        });

        let totalMarks = 0;
        Object.values(selectedSubjectsMap).forEach(m => totalMarks += m);

        const examObj = {
            id: editId || ('EX_' + Date.now()),
            name,
            class: className,
            date,
            subjects: { ...selectedSubjectsMap },
            totalMarks,
            groups: groupsArr,
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        if (editId) {
            const idx = examRegistry.findIndex(x => x.id === editId);
            if (idx !== -1) examRegistry[idx] = examObj;
        } else {
            examRegistry.unshift(examObj);
        }

        await saveExamsToCloud();

        if (typeof window.showToast === 'function') {
            window.showToast("Exam & Groups saved successfully!", "success");
        } else {
            alert("Exam & Groups saved successfully!");
        }

        resetEMForm();
        renderEMRegistry();
        populateEMExamDropdown();
        setEMWorkspaceView('history');
    };

    async function saveExamsToCloud() {
        if (typeof window.writeToFirebase === 'function') {
            try {
                await window.writeToFirebase('cpscl_exams', examRegistry);
                await window.writeToFirebase('cpscl_exam_group_overrides', manualGroupOverrides);
            } catch (err) {
                console.error("Firebase Save Error:", err);
            }
        }
        localStorage.setItem('cpscl_exams_registry', JSON.stringify(examRegistry));
        localStorage.setItem('cpscl_exam_group_overrides', JSON.stringify(manualGroupOverrides));
    }

    async function syncFromFirebase() {
        const local = localStorage.getItem('cpscl_exams_registry');
        if (local) {
            try { examRegistry = JSON.parse(local); } catch(e) {}
            renderEMRegistry();
            populateEMExamDropdown();
        }
        const localOverrides = localStorage.getItem('cpscl_exam_group_overrides');
        if (localOverrides) {
            try { manualGroupOverrides = JSON.parse(localOverrides); } catch(e) {}
        }

        if (typeof window.getDatabase === 'function' && typeof window.ref === 'function' && typeof window.get === 'function') {
            try {
                const db = window.getDatabase();
                const snap = await window.get(window.ref(db, 'cpscl_exams'));
                if (snap.exists()) {
                    const data = snap.val();
                    examRegistry = Array.isArray(data) ? data : Object.values(data);
                    localStorage.setItem('cpscl_exams_registry', JSON.stringify(examRegistry));
                    renderEMRegistry();
                    populateEMExamDropdown();
                }
                const snapOv = await window.get(window.ref(db, 'cpscl_exam_group_overrides'));
                if (snapOv.exists()) {
                    manualGroupOverrides = snapOv.val() || {};
                    localStorage.setItem('cpscl_exam_group_overrides', JSON.stringify(manualGroupOverrides));
                }
            } catch (e) {
                console.log("Firebase sync fallback.");
            }
        }
    }

    function renderEMRegistry() {
        const tbody = document.getElementById('emRegistryTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (examRegistry.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b; padding:20px;">No exams published yet.</td></tr>`;
            return;
        }

        examRegistry.forEach(ex => {
            const groupDesc = (ex.groups && ex.groups.length > 0)
                ? ex.groups.map(g => `${g.name} (${g.from}-${g.to})`).join(', ')
                : 'Default Groups';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong>${ex.name}</strong><br>
                    <span style="font-size:0.75rem; color:#2563eb; font-weight:700;">
                        <i class="fa-solid fa-layer-group"></i> ${groupDesc}
                    </span>
                </td>
                <td><span style="background:#eff6ff; color:#2563eb; padding:4px 12px; border-radius:50px; font-size:0.8rem; font-weight:700;">${ex.class}</span></td>
                <td>${ex.date}</td>
                <td style="text-align: right;">
                    <button class="em-btn-icon edit" onclick="editEMExam('${ex.id}')" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="em-btn-icon duplicate" onclick="duplicateEMExam('${ex.id}')" title="Duplicate"><i class="fa-solid fa-copy"></i></button>
                    <button class="em-btn-icon delete" onclick="deleteEMExam('${ex.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ১০. TAB 2: ১:১ ট্রাস্ট ইআরপি স্টাইল স্টুডেন্ট টেবিল ও টপ অ্যাকশন বার
    function populateEMExamDropdown() {
        const select = document.getElementById('emTransferExamSelect');
        if (!select) return;
        select.innerHTML = '';
        if (examRegistry.length === 0) {
            select.innerHTML = '<option value="">No exams available</option>';
            return;
        }
        examRegistry.forEach(ex => {
            select.innerHTML += `<option value="${ex.id}">${ex.name} (${ex.class})</option>`;
        });
    }

    window.loadEMStudentGroupAllocation = async function() {
        const select = document.getElementById('emTransferExamSelect');
        if (!select) return;

        const examId = select.value;
        const exam = examRegistry.find(x => x.id === examId);
        if (!exam) return;

        const groupsList = (exam.groups && exam.groups.length > 0) ? exam.groups : [
            { name: "Group A", from: 1, to: 40 },
            { name: "Group B", from: 41, to: "Rest" }
        ];

        // ১. ফায়ারবেস বা ক্যাশ থেকে আসল শিক্ষার্থী লোড
        let rawStudents = await getRealStudentsForClass(exam.class);

        // ২. ক্রমানুসারে সাজানো
        rawStudents.sort((a, b) => {
            const rA = parseInt(a.roll_no || a.roll) || 0;
            const rB = parseInt(b.roll_no || b.roll) || 0;
            if (rA && rB) return rA - rB;
            return String(a.std_id || a.id).localeCompare(String(b.std_id || b.id));
        });

        // ৩. প্রতিটি শিক্ষার্থীর জন্য সিরিয়াল ও গ্রুপ নির্ধারণ
        allocatedStudentsCache = rawStudents.map((st, idx) => {
            const slNumber = idx + 1;
            const studentId = String(st.std_id || st.id || '').trim();
            const studentRoll = st.roll_no || st.roll || '';

            const effectiveNum = (studentRoll && !isNaN(parseInt(studentRoll))) ? parseInt(studentRoll) : slNumber;

            let assignedGroup = groupsList[0].name;
            for (let g of groupsList) {
                const fromNum = parseInt(g.from) || 1;
                const toNum = (g.to && String(g.to).toLowerCase() === 'rest') ? 999999 : (parseInt(g.to) || 999999);
                if (effectiveNum >= fromNum && effectiveNum <= toNum) {
                    assignedGroup = g.name;
                    break;
                }
            }

            if (manualGroupOverrides[exam.id] && manualGroupOverrides[exam.id][studentId]) {
                assignedGroup = manualGroupOverrides[exam.id][studentId];
            }

            return {
                sl: slNumber,
                id: studentId,
                name: st.student_name || st.name || 'Student',
                class: st.class_name || st.class || exam.class,
                roll: studentRoll,
                group: assignedGroup
            };
        });

        // সিলেকশন ক্লিয়ার
        selectedStudentIds.clear();
        updateTopTransferBar(groupsList);
        renderGroupFilterPills();
        emStudentCurrentPage = 1;
        renderEMPaginatedStudentTable();
    };

    // উপরের অ্যাকশন বার বাটন রেন্ডার (Move to Group A, Move to Group B)
    function updateTopTransferBar(groupsList) {
        const btnsBox = document.getElementById('emDynamicTransferBtns');
        const countBadge = document.getElementById('emSelectedCountBadge');
        if (!btnsBox) return;

        const count = selectedStudentIds.size;
        if (countBadge) {
            countBadge.innerText = `${count} Row(s) Selected`;
            countBadge.style.color = count > 0 ? '#2563eb' : '#64748b';
        }

        const examSelect = document.getElementById('emTransferExamSelect');
        const examId = examSelect ? examSelect.value : '';
        const exam = examRegistry.find(x => x.id === examId);
        const groups = (exam && exam.groups) ? exam.groups : (groupsList || [{ name: 'Group A' }, { name: 'Group B' }]);

        let btnsHtml = '';
        groups.forEach((g, idx) => {
            const btnClass = idx % 2 === 0 ? 'em-btn-move-a' : 'em-btn-move-b';
            btnsHtml += `
                <button type="button" class="em-btn-move ${btnClass}" ${count === 0 ? 'disabled' : ''} onclick="bulkMoveSelectedStudents('${g.name}')">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i> Move to ${g.name}
                </button>
            `;
        });

        btnsBox.innerHTML = btnsHtml;
    }

    // নির্বাচিত শিক্ষার্থীদের এক ক্লিকে গ্রুপ ট্রান্সফার
    window.bulkMoveSelectedStudents = async function(targetGroup) {
        if (selectedStudentIds.size === 0) return;

        const examSelect = document.getElementById('emTransferExamSelect');
        const examId = examSelect ? examSelect.value : '';
        if (!examId) return;

        if (!manualGroupOverrides[examId]) manualGroupOverrides[examId] = {};

        selectedStudentIds.forEach(sId => {
            manualGroupOverrides[examId][sId] = targetGroup;
            const stu = allocatedStudentsCache.find(s => s.id === sId);
            if (stu) stu.group = targetGroup;
        });

        await saveExamsToCloud();

        if (typeof window.showToast === 'function') {
            window.showToast(`${selectedStudentIds.size} student(s) moved to ${targetGroup}!`, "success");
        } else {
            alert(`${selectedStudentIds.size} student(s) moved to ${targetGroup}!`);
        }

        selectedStudentIds.clear();
        updateTopTransferBar();
        renderGroupFilterPills();
        renderEMPaginatedStudentTable();
    };

    // সারি সিলেকশন হ্যান্ডলার (ক্লিক করলে সলিড ব্লু হবে)
    window.toggleStudentRowSelection = function(studentId) {
        if (selectedStudentIds.has(studentId)) {
            selectedStudentIds.delete(studentId);
        } else {
            selectedStudentIds.add(studentId);
        }
        updateTopTransferBar();
        renderEMPaginatedStudentTable();
    };

    // গ্রুপ ফিল্টার পিলস
    function renderGroupFilterPills() {
        const container = document.getElementById('emGroupFilterPills');
        if (!container) return;

        const total = allocatedStudentsCache.length;
        const groupCounts = {};
        allocatedStudentsCache.forEach(s => {
            groupCounts[s.group] = (groupCounts[s.group] || 0) + 1;
        });

        let html = `
            <button type="button" class="em-filter-btn ${emSelectedGroupFilter === 'all' ? 'active' : ''}" onclick="setEMGroupFilter('all')">
                All Students (${total})
            </button>
        `;

        Object.keys(groupCounts).forEach(gName => {
            html += `
                <button type="button" class="em-filter-btn ${emSelectedGroupFilter === gName ? 'active' : ''}" onclick="setEMGroupFilter('${gName}')">
                    ${gName} (${groupCounts[gName]})
                </button>
            `;
        });

        container.innerHTML = html;
    }

    window.setEMGroupFilter = function(groupName) {
        emSelectedGroupFilter = groupName;
        emStudentCurrentPage = 1;
        renderGroupFilterPills();
        renderEMPaginatedStudentTable();
    };

    window.onEMStudentSearch = function(val) {
        emStudentSearchQuery = val.trim().toLowerCase();
        emStudentCurrentPage = 1;
        renderEMPaginatedStudentTable();
    };

    window.changeEMPageSize = function(size) {
        emStudentPageSize = parseInt(size) || 25;
        emStudentCurrentPage = 1;
        renderEMPaginatedStudentTable();
    };

    window.goToEMStudentPage = function(page) {
        emStudentCurrentPage = page;
        renderEMPaginatedStudentTable();
    };

    // পেজ অনুযায়ী শিক্ষার্থী টেবিল রেন্ডার (ছবি ৩ ও ৪-এর সলিড ব্লু এফেক্টসহ)
    function renderEMPaginatedStudentTable() {
        const tbody = document.getElementById('emStudentAllocationTbody');
        const counterEl = document.getElementById('emPaginationCounterText');
        const btnsContainer = document.getElementById('emPaginationBtnsContainer');
        if (!tbody) return;

        let filtered = allocatedStudentsCache.filter(s => {
            const matchesGroup = (emSelectedGroupFilter === 'all') || (s.group === emSelectedGroupFilter);
            if (!matchesGroup) return false;

            if (!emStudentSearchQuery) return true;
            return s.name.toLowerCase().includes(emStudentSearchQuery) ||
                   s.id.toLowerCase().includes(emStudentSearchQuery) ||
                   String(s.sl).includes(emStudentSearchQuery);
        });

        const totalFiltered = filtered.length;
        const totalPages = Math.ceil(totalFiltered / emStudentPageSize) || 1;
        if (emStudentCurrentPage > totalPages) emStudentCurrentPage = totalPages;
        if (emStudentCurrentPage < 1) emStudentCurrentPage = 1;

        tbody.innerHTML = '';

        if (totalFiltered === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:35px; color:#94a3b8;">No students match the criteria.</td></tr>`;
            if (counterEl) counterEl.innerText = `Showing 0 of 0 entries`;
            if (btnsContainer) btnsContainer.innerHTML = '';
            return;
        }

        const startIndex = (emStudentCurrentPage - 1) * emStudentPageSize;
        const pageStudents = filtered.slice(startIndex, startIndex + emStudentPageSize);

        pageStudents.forEach(st => {
            const isSelected = selectedStudentIds.has(st.id);
            const rollBadge = st.roll ? `<span style="font-size:0.75rem; background:rgba(0,0,0,0.06); padding:2px 8px; border-radius:10px; margin-left:6px;">Roll: ${st.roll}</span>` : '';

            const tr = document.createElement('tr');
            if (isSelected) {
                tr.classList.add('erp-row-selected'); // সলিড ব্লু ব্যাকগ্রাউন্ড ও সাদা টেক্সট
            }

            tr.onclick = () => toggleStudentRowSelection(st.id);

            tr.innerHTML = `
                <td><strong>${st.sl}</strong></td>
                <td><strong>${st.id}</strong></td>
                <td>
                    <span style="font-weight:700;">${st.name}</span>
                    ${rollBadge}
                </td>
                <td>${st.class}</td>
                <td style="text-align: right;">
                    <span class="em-group-badge">${st.group}</span>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // ফুটার কাউন্টার
        const end = Math.min(startIndex + emStudentPageSize, totalFiltered);
        if (counterEl) {
            const selCountText = selectedStudentIds.size > 0 ? ` (${selectedStudentIds.size} row selected)` : '';
            counterEl.innerText = `Showing ${startIndex + 1} to ${end} of ${totalFiltered} entries ${selCountText}`;
        }

        // পেজিনেশন বাটন (« < 1 2 3 > »)
        if (btnsContainer) {
            let btnsHtml = `
                <button type="button" class="em-page-btn ${emStudentCurrentPage === 1 ? 'disabled' : ''}" onclick="goToEMStudentPage(1)">«</button>
                <button type="button" class="em-page-btn ${emStudentCurrentPage === 1 ? 'disabled' : ''}" onclick="goToEMStudentPage(${emStudentCurrentPage - 1})">&lt;</button>
            `;

            let startP = Math.max(1, emStudentCurrentPage - 2);
            let endP = Math.min(totalPages, startP + 4);
            if (endP - startP < 4) startP = Math.max(1, endP - 4);

            for (let p = startP; p <= endP; p++) {
                btnsHtml += `<button type="button" class="em-page-btn ${p === emStudentCurrentPage ? 'active' : ''}" onclick="goToEMStudentPage(${p})">${p}</button>`;
            }

            btnsHtml += `
                <button type="button" class="em-page-btn ${emStudentCurrentPage === totalPages ? 'disabled' : ''}" onclick="goToEMStudentPage(${emStudentCurrentPage + 1})">&gt;</button>
                <button type="button" class="em-page-btn ${emStudentCurrentPage === totalPages ? 'disabled' : ''}" onclick="goToEMStudentPage(${totalPages})">»</button>
            `;
            btnsContainer.innerHTML = btnsHtml;
        }
    }

    // আসল শিক্ষার্থী রিডার
    async function getRealStudentsForClass(targetClass) {
        let allStudents = [];

        if (window.getDatabase && window.ref && window.get) {
            try {
                const db = window.getDatabase();
                const stuRef = window.ref(db, 'cpscl_students');
                const snap = await window.get(stuRef);
                if (snap.exists()) {
                    const data = snap.val();
                    allStudents = Array.isArray(data) ? data : Object.values(data);
                    localStorage.setItem('cpscl_students_cache', JSON.stringify(allStudents));
                }
            } catch(e) {}
        }

        if (allStudents.length === 0) {
            try {
                const local = localStorage.getItem('cpscl_students_cache');
                if (local) allStudents = JSON.parse(local);
            } catch(e) {}
        }

        const targetClean = String(targetClass).trim().toLowerCase();
        let matched = allStudents.filter(s => {
            const cName = String(s.class_name || s.class || '').trim().toLowerCase();
            return cName === targetClean || cName.includes(targetClean) || targetClean.includes(cName);
        });

        return matched;
    }

    // ১১. এডিট, ডুপ্লিকেট, ডিলিট ও রিসেট
    window.editEMExam = function(id) {
        const exam = examRegistry.find(x => x.id === id);
        if (!exam) return;

        document.getElementById('emEditingId').value = exam.id;
        document.getElementById('emExamName').value = exam.name;
        document.getElementById('emClassName').value = exam.class;
        document.getElementById('emExamDate').value = exam.date;

        onEMClassChange(exam.class);
        selectedSubjectsMap = { ...exam.subjects };

        Object.keys(exam.subjects).forEach(sub => {
            if (!currentActiveSubjectsList.includes(sub)) currentActiveSubjectsList.push(sub);
        });

        const container = document.getElementById('emGroupRulesContainer');
        container.innerHTML = '';
        if (exam.groups && exam.groups.length > 0) {
            exam.groups.forEach(g => addEMGroupRuleRowData(g.name, g.from, g.to));
        } else {
            initDefaultEMGroupRules();
        }

        renderEMPills();
        renderEMSelectedTable();

        document.getElementById('emFormTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Assessment: ${exam.name}`;
        document.getElementById('emSubmitBtn').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Update Assessment & Rules`;
        document.getElementById('emCancelEditBtn').style.display = 'block';

        switchEMMainTab('createExam');
        setEMWorkspaceView('form');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.duplicateEMExam = function(id) {
        const exam = examRegistry.find(x => x.id === id);
        if (!exam) return;

        document.getElementById('emEditingId').value = '';
        document.getElementById('emExamName').value = exam.name + " (Copy)";
        document.getElementById('emClassName').value = exam.class;
        document.getElementById('emExamDate').value = new Date().toISOString().split('T')[0];

        onEMClassChange(exam.class);
        selectedSubjectsMap = { ...exam.subjects };

        Object.keys(exam.subjects).forEach(sub => {
            if (!currentActiveSubjectsList.includes(sub)) currentActiveSubjectsList.push(sub);
        });

        const container = document.getElementById('emGroupRulesContainer');
        container.innerHTML = '';
        if (exam.groups && exam.groups.length > 0) {
            exam.groups.forEach(g => addEMGroupRuleRowData(g.name, g.from, g.to));
        } else {
            initDefaultEMGroupRules();
        }

        renderEMPills();
        renderEMSelectedTable();

        document.getElementById('emFormTitle').innerHTML = `<i class="fa-solid fa-copy"></i> Duplicate Assessment`;
        document.getElementById('emSubmitBtn').innerHTML = `<i class="fa-solid fa-check-circle"></i> Save Duplicated Exam`;
        document.getElementById('emCancelEditBtn').style.display = 'block';

        switchEMMainTab('createExam');
        setEMWorkspaceView('form');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteEMExam = async function(id) {
        if (confirm("Are you sure you want to delete this exam?")) {
            examRegistry = examRegistry.filter(x => x.id !== id);
            await saveExamsToCloud();
            renderEMRegistry();
            populateEMExamDropdown();
        }
    };

    window.resetEMForm = function() {
        document.getElementById('emAssessmentForm').reset();
        document.getElementById('emEditingId').value = '';
        document.getElementById('emExamDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('emFormTitle').innerHTML = `<i class="fa-solid fa-file-pen"></i> Create New Assessment & Rules`;
        document.getElementById('emSubmitBtn').innerHTML = `<i class="fa-solid fa-check-circle"></i> Save Exam & Generate Initial Groups`;
        document.getElementById('emCancelEditBtn').style.display = 'none';
        initDefaultEMGroupRules();
        const classList = getDynamicClassOptions();
        onEMClassChange(classList[0]);
    };

    function init() {
        injectExamStyles();
        injectExamManagerSidebar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
