/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Exam & Dynamic Student Group Management Suite
   Path: cpscl/exam_manager.js
   Architecture: 100% Real Firebase (cpscl_students) Connected & Real Pagination
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Real-Data Exam & Group Suite (cpscl/exam_manager.js)...");

    // ১. এক্সাম ও গ্রুপ ম্যানেজারের পূর্ণাঙ্গ স্টাইল ইনজেকশন
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
            .em-card-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; }
            .em-card-title span { display: flex; align-items: center; gap: 8px; }
            .em-card-title i { color: #2563eb; }

            .em-form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
            .em-form-group label { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
            .em-control { width: 100%; height: 44px; border: 1.5px solid #cbd5e1; border-radius: 50px; padding: 0 18px; font-size: 0.9rem; outline: none; background: #ffffff; color: #0f172a; transition: 0.2s; }
            .em-control:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
            select.em-control { cursor: pointer; }

            /* সাবজেক্ট পিলস */
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

            /* টেবিল স্টাইল */
            .em-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .em-table th { text-align: left; padding: 12px 14px; background: #f8fafc; color: #64748b; font-size: 0.75rem; text-transform: uppercase; font-weight: 700; border-bottom: 1.5px solid #cbd5e1; }
            .em-table td { padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 0.88rem; font-weight: 600; color: #1e293b; }

            .em-mark-inp { width: 85px; height: 36px; border: 1.5px solid #cbd5e1; border-radius: 50px; text-align: center; font-weight: 700; font-size: 0.95rem; outline: none; }
            .em-mark-inp:focus { border-color: #2563eb; }

            .em-btn-icon { width: 34px; height: 34px; border-radius: 50px; border: 1.5px solid #cbd5e1; background: #ffffff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 0.82rem; transition: 0.2s; }
            .em-btn-icon.edit { color: #2563eb; }
            .em-btn-icon.edit:hover { background: #eff6ff; border-color: #2563eb; }
            .em-btn-icon.duplicate { color: #ca8a04; }
            .em-btn-icon.duplicate:hover { background: #fef9c3; border-color: #ca8a04; }
            .em-btn-icon.delete { color: #dc2626; }
            .em-btn-icon.delete:hover { background: #fee2e2; border-color: #dc2626; }

            .em-btn-submit { background: #2563eb; color: #fff; border: none; width: 100%; height: 48px; border-radius: 50px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }
            .em-btn-submit:hover { background: #1d4ed8; }

            /* ডায়নামিক গ্রুপ সারি */
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

    // ২. সাইডবারে CPSCL সেকশনে Student Registration এর নিচে ইনজেকশন
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
                                        <span style="font-size: 0.75rem; color: #64748b; margin-bottom: 12px;">Define how student serials/rolls are initially distributed into groups:</span>
                                        
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

                <!-- TAB 2: Student Group Allocation & Manual Transfer -->
                <div class="em-tab-content" id="emTabContent2">
                    <div class="em-card">
                        <div class="em-card-title">
                            <span><i class="fa-solid fa-shuffle"></i> Student Group Allocation & Manual Transfer Override</span>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <select id="emTransferExamSelect" class="em-control" style="width: 280px; height: 38px; font-size: 0.85rem;" onchange="loadEMStudentGroupAllocation()">
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                        </div>
                        <span style="font-size: 0.85rem; color: #64748b; display: block; margin-bottom: 16px;">
                            Students are initially distributed based on roll/serial sequence. Authority/Super Admin can manually transfer any student from one group to another using the action column below.
                        </span>

                        <div style="overflow-x: auto;">
                            <table class="em-table">
                                <thead>
                                    <tr>
                                        <th>Roll / Serial</th>
                                        <th>Student Name</th>
                                        <th>Class</th>
                                        <th>Assigned Group</th>
                                        <th style="text-align: right;">Manual Transfer Action</th>
                                    </tr>
                                </thead>
                                <tbody id="emStudentAllocationTbody">
                                    <!-- Populated dynamically with REAL STUDENTS -->
                                </tbody>
                            </table>
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

    // ৫. ট্যাব পরিবর্তন ফাংশন
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

    // ৬. গ্রুপ রুলস হ্যান্ডলার
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
            <input type="text" class="g-from" value="${fromVal}" placeholder="From Roll" style="width: 25%; text-align: center;">
            <span style="font-size:0.8rem; font-weight:700; color:#64748b;">to</span>
            <input type="text" class="g-to" value="${toVal}" placeholder="To Roll / Rest" style="width: 25%; text-align: center;">
            <button type="button" class="em-btn-icon delete" style="width: 30px; height: 30px; margin-left: auto;" onclick="this.closest('.em-group-row').remove()" title="Remove"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    }

    // ৭. স্প্লিট ও ফুল ভিউ নিয়ন্ত্রণ
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

    // ৮. ক্লাস ও সাবজেক্ট পিল হ্যান্ডলিং
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

    // ৯. ফর্ম সাবমিট ও ক্লাউড সেভ
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

    // ১০. TAB 2: ১০০% আসল শিক্ষার্থী (cpscl_students) লোড ও গ্রুপ বণ্টন
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
        const tbody = document.getElementById('emStudentAllocationTbody');
        const select = document.getElementById('emTransferExamSelect');
        if (!tbody || !select) return;
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:25px; color:#64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Loading students from database...</td></tr>';

        const examId = select.value;
        const exam = examRegistry.find(x => x.id === examId);
        if (!exam) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#64748b; padding:20px;">Please create and select an assessment first.</td></tr>`;
            return;
        }

        const groupsList = (exam.groups && exam.groups.length > 0) ? exam.groups : [
            { name: "Group A", from: 1, to: 40 },
            { name: "Group B", from: 41, to: "Rest" }
        ];

        // ফায়ারবেস (cpscl_students) ও ক্যাশ থেকে সরাসরি আসল শিক্ষার্থী আনা
        let studentList = await getRealStudentsForClass(exam.class);

        if (studentList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#dc2626; padding:30px; font-weight:700;">No students found in database for class: "${exam.class}". Please ensure students are registered under this class.</td></tr>`;
            return;
        }

        // রোল নম্বর অনুযায়ী ক্রমানুসারে সাজানো (১, ২, ৩, ৪...)
        studentList.sort((a, b) => {
            const rA = parseInt(a.roll_no || a.roll) || 999999;
            const rB = parseInt(b.roll_no || b.roll) || 999999;
            return rA - rB;
        });

        tbody.innerHTML = '';

        studentList.forEach(st => {
            const studentId = String(st.std_id || st.id).trim();
            const studentRoll = st.roll_no || st.roll || '-';
            const rollNum = parseInt(studentRoll) || 1;

            // রোল অনুযায়ী ইনিশিয়াল গ্রুপ নির্ণয়
            let assignedGroup = groupsList[0].name;
            for (let g of groupsList) {
                const fromNum = parseInt(g.from) || 1;
                const toNum = (g.to && String(g.to).toLowerCase() === 'rest') ? 999999 : (parseInt(g.to) || 999999);
                if (rollNum >= fromNum && rollNum <= toNum) {
                    assignedGroup = g.name;
                    break;
                }
            }

            // ম্যানুয়াল ওভাররাইড চেক (যদি এডমিন ট্রান্সফার করে থাকেন)
            if (manualGroupOverrides[exam.id] && manualGroupOverrides[exam.id][studentId]) {
                assignedGroup = manualGroupOverrides[exam.id][studentId];
            }

            let optionsHtml = '';
            groupsList.forEach(g => {
                optionsHtml += `<option value="${g.name}" ${assignedGroup === g.name ? 'selected' : ''}>${g.name}</option>`;
            });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>Roll #${studentRoll}</strong> <span style="font-size:0.75rem; color:#64748b; margin-left:4px;">(ID: ${studentId})</span></td>
                <td style="color:#2563eb; font-weight:700;">${st.student_name || st.name}</td>
                <td>${st.class_name || st.class || exam.class}</td>
                <td><span style="background:#eff6ff; color:#2563eb; padding:4px 12px; border-radius:50px; font-size:0.8rem; font-weight:700;">${assignedGroup}</span></td>
                <td style="text-align: right;">
                    <select class="em-control" style="width: 140px; height: 36px; display: inline-block; font-size: 0.85rem;" onchange="manualTransferStudent('${exam.id}', '${studentId}', '${(st.student_name || st.name).replace(/'/g, "\\'")}', this.value)">
                        ${optionsHtml}
                    </select>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // আসল শিক্ষার্থী রিডার (cpscl_students এবং cpscl_students_cache)
    async function getRealStudentsForClass(targetClass) {
        let allStudents = [];

        // ১. ফায়ারবেস ক্লাউড থেকে cpscl_students চেক
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
            } catch(e) {
                console.warn("Cloud student sync fallback:", e);
            }
        }

        // ২. লোকাল ক্যাশ চেক (যদি ক্লাউড কানেকশন দেরি করে)
        if (allStudents.length === 0) {
            try {
                const local = localStorage.getItem('cpscl_students_cache');
                if (local) allStudents = JSON.parse(local);
            } catch(e) {}
        }

        // ৩. ক্লাস অনুযায়ী ফিল্টার (কেস-ইনসেনসিটিভ ও ট্রিম করা)
        const targetClean = String(targetClass).trim().toLowerCase();
        let matched = allStudents.filter(s => {
            const cName = String(s.class_name || s.class || '').trim().toLowerCase();
            return cName === targetClean || cName.includes(targetClean) || targetClean.includes(cName);
        });

        return matched;
    }

    // ম্যানুয়াল ট্রান্সফার হ্যান্ডলার
    window.manualTransferStudent = async function(examId, studentId, studentName, newGroup) {
        if (!manualGroupOverrides[examId]) manualGroupOverrides[examId] = {};
        manualGroupOverrides[examId][studentId] = newGroup;

        await saveExamsToCloud();

        if (typeof window.showToast === 'function') {
            window.showToast(`${studentName} successfully transferred to ${newGroup}!`, "success");
        } else {
            alert(`${studentName} successfully transferred to ${newGroup}!`);
        }
        loadEMStudentGroupAllocation();
    };

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
