/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Exam & Dynamic Student Group Management Suite (v4.5 Fast Cloud)
   Path: cpscl/exam_manager.js
   Architecture: 100% Uniform Pill Shapes | Fast Cloud Sync | Clean Loading Spinner
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Suite v4.5 (Fast Pure Cloud Active)...");

    // ১. স্টাইল ইনজেকশন
    function injectExamStyles() {
        const oldStyle = document.getElementById('cpscl-exam-manager-style');
        if (oldStyle) oldStyle.remove();

        const style = document.createElement('style');
        style.id = 'cpscl-exam-manager-style';
        style.innerHTML = `
            .em-wrapper { padding: 15px 5px; font-family: 'Plus Jakarta Sans', sans-serif; }
            .em-header { background: #ffffff; border: 1px solid #e2e8f0; padding: 18px 25px; border-radius: 50px !important; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
            .em-header h1 { font-size: 1.35rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; margin: 0; }
            .em-header h1 i { color: #2563eb; }
            .em-badge { background: #eff6ff; color: #2563eb; font-weight: 700; font-size: 0.82rem; padding: 6px 16px; border-radius: 50px !important; border: 1px solid #bfdbfe; }

            .em-nav-tabs { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
            .em-tab-btn { background: #ffffff; border: 1.5px solid #cbd5e1; color: #64748b; padding: 11px 24px; border-radius: 50px !important; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; }
            .em-tab-btn:hover { border-color: #2563eb; color: #2563eb; }
            .em-tab-btn.active { background: #2563eb !important; color: #ffffff !important; border-color: #2563eb !important; box-shadow: 0 4px 12px rgba(37,99,235,0.25); }

            .em-tab-content { display: none; }
            .em-tab-content.active { display: block; }

            .em-view-bar { display: flex; gap: 8px; margin-bottom: 20px; background: #ffffff; padding: 10px 18px; border-radius: 50px !important; border: 1px solid #e2e8f0; align-items: center; flex-wrap: wrap; }
            .em-view-bar span { font-size: 0.85rem; font-weight: 700; color: #64748b; margin-right: 5px; }
            .em-btn-toggle { background: #f8fafc; border: 1.5px solid #cbd5e1; color: #0f172a; padding: 7px 18px; border-radius: 50px !important; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 6px; }
            .em-btn-toggle:hover { border-color: #2563eb; color: #2563eb; }
            .em-btn-toggle.active { background: #2563eb !important; color: #ffffff !important; border-color: #2563eb !important; box-shadow: 0 4px 10px rgba(37,99,235,0.25); }

            .em-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; transition: all 0.3s ease; }
            @media (max-width: 1024px) { .em-grid { grid-template-columns: 1fr !important; } }

            .em-card { background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 22px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
            .em-card-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
            .em-card-title span { display: flex; align-items: center; gap: 8px; }
            .em-card-title i { color: #2563eb; }

            .em-form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
            .em-form-group label { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
            .em-control { width: 100%; height: 44px; border: 1.5px solid #cbd5e1; border-radius: 50px !important; padding: 0 18px; font-size: 0.9rem; outline: none; background: #ffffff; color: #0f172a; transition: 0.2s; }
            .em-control:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1); }
            select.em-control { cursor: pointer; }

            .em-pills-box { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; margin-bottom: 12px; }
            .em-pill { display: inline-flex; align-items: center; gap: 8px; background: #eff6ff; color: #2563eb; border: 1.5px solid #bfdbfe; padding: 7px 16px; border-radius: 50px !important; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; user-select: none; }
            .em-pill:hover { background: #dbeafe; border-color: #2563eb; transform: translateY(-1px); }
            .em-pill.active { background: #2563eb !important; color: #ffffff !important; border-color: #2563eb !important; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25); }
            .em-pill-actions { display: flex; gap: 5px; margin-left: 6px; align-items: center; }
            .em-pill-btn { font-size: 0.72rem; opacity: 0.7; cursor: pointer; transition: 0.2s; padding: 2px; }
            .em-pill-btn:hover { opacity: 1; }

            .em-custom-sub-bar { display: flex; gap: 8px; margin-bottom: 15px; }
            .em-btn-add { background: #f8fafc; border: 1.5px dashed #cbd5e1; color: #2563eb; padding: 0 20px; border-radius: 50px !important; font-weight: 700; font-size: 0.82rem; cursor: pointer; white-space: nowrap; transition: 0.2s; }
            .em-btn-add:hover { background: #eff6ff; border-color: #2563eb; }

            .em-group-pills-filter { display: flex !important; gap: 8px !important; align-items: center !important; flex-wrap: wrap !important; }
            .em-filter-pill-btn { padding: 7px 18px !important; border-radius: 50px !important; border: 1.5px solid #cbd5e1 !important; background: #ffffff !important; color: #475569 !important; font-size: 0.82rem !important; font-weight: 700 !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; transition: all 0.2s ease !important; outline: none !important; user-select: none !important; }
            .em-filter-pill-btn:hover { background: #f1f5f9 !important; border-color: #94a3b8 !important; }
            .em-filter-pill-btn.active { background: #2563eb !important; color: #ffffff !important; border-color: #2563eb !important; box-shadow: 0 4px 10px rgba(37,99,235,0.25) !important; }

            .em-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .em-table th { background: #ffffff !important; color: #8c98a4 !important; font-size: 0.75rem !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.5px !important; padding: 14px 18px !important; border-bottom: 1.5px solid #eef2f5 !important; text-align: left; }
            .em-table tbody td { color: #334155 !important; font-size: 0.88rem !important; font-weight: 500 !important; padding: 13px 18px !important; border-bottom: 1px solid #eef2f5 !important; }

            .em-table tbody tr:nth-child(even) { background-color: #f8fafc !important; }
            .em-table tbody tr:nth-child(odd) { background-color: #ffffff !important; }
            .em-table tbody tr:hover { background-color: #f1f5f9 !important; cursor: pointer; }

            .em-table tbody tr.erp-row-selected { background-color: #3b82f6 !important; }
            .em-table tbody tr.erp-row-selected td, .em-table tbody tr.erp-row-selected td * { color: #ffffff !important; }
            .em-table tbody tr.erp-row-selected .em-group-badge { background-color: rgba(255, 255, 255, 0.25) !important; color: #ffffff !important; border-color: rgba(255, 255, 255, 0.4) !important; }

            .em-group-badge, .em-class-badge { display: inline-block !important; padding: 4px 14px !important; border-radius: 50px !important; font-size: 0.8rem !important; font-weight: 700 !important; background: #eff6ff !important; color: #2563eb !important; border: 1px solid #bfdbfe !important; }
            .em-rule-badge { display: inline-flex !important; align-items: center !important; gap: 5px !important; padding: 3px 12px !important; border-radius: 50px !important; font-size: 0.75rem !important; font-weight: 700 !important; background: #f1f5f9 !important; color: #2563eb !important; border: 1px solid #e2e8f0 !important; margin-top: 4px !important; }

            .em-btn-icon { width: 36px !important; height: 36px !important; border-radius: 50px !important; border: 1.5px solid #cbd5e1 !important; background: #ffffff !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; font-size: 0.85rem !important; transition: all 0.2s ease !important; margin: 0 3px !important; outline: none !important; }
            .em-btn-icon.edit { color: #2563eb !important; }
            .em-btn-icon.edit:hover { background: #eff6ff !important; border-color: #2563eb !important; transform: scale(1.05); }
            .em-btn-icon.duplicate { color: #ca8a04 !important; }
            .em-btn-icon.duplicate:hover { background: #fef9c3 !important; border-color: #ca8a04 !important; transform: scale(1.05); }
            .em-btn-icon.delete { color: #dc2626 !important; }
            .em-btn-icon.delete:hover { background: #fee2e2 !important; border-color: #dc2626 !important; transform: scale(1.05); }

            .em-top-transfer-bar { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 50px !important; padding: 10px 20px; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
            .em-transfer-btns-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
            .em-btn-move { padding: 8px 20px !important; border-radius: 50px !important; font-size: 0.82rem !important; font-weight: 700 !important; cursor: pointer !important; border: none !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; transition: 0.2s !important; }
            .em-btn-move-a { background: #2563eb !important; color: #fff !important; box-shadow: 0 2px 6px rgba(37,99,235,0.25); }
            .em-btn-move-a:hover { background: #1d4ed8 !important; }
            .em-btn-move-b { background: #059669 !important; color: #fff !important; box-shadow: 0 2px 6px rgba(5,150,105,0.25); }
            .em-btn-move-b:hover { background: #047857 !important; }
            .em-btn-move:disabled { opacity: 0.45 !important; cursor: not-allowed !important; box-shadow: none !important; }

            .em-pagination-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 8px; border-top: 1.5px solid #eef2f5; flex-wrap: wrap; gap: 12px; margin-top: 15px; }
            .em-page-btn { min-width: 32px !important; height: 32px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; padding: 0 10px !important; border: 1px solid #e2e8f0 !important; background: #ffffff !important; color: #475569 !important; border-radius: 50px !important; font-size: 0.85rem !important; font-weight: 600 !important; cursor: pointer !important; transition: all 0.2s !important; }
            .em-page-btn:hover:not(.disabled):not(.active) { background: #f1f5f9 !important; border-color: #cbd5e1 !important; }
            .em-page-btn.active { background: #3b82f6 !important; border-color: #3b82f6 !important; color: #ffffff !important; font-weight: 700 !important; }
            .em-page-btn.disabled { opacity: 0.35 !important; cursor: not-allowed !important; }

            .em-btn-submit { background: #2563eb !important; color: #fff !important; border: none !important; width: 100% !important; height: 48px !important; border-radius: 50px !important; font-size: 0.95rem !important; font-weight: 700 !important; cursor: pointer !important; transition: 0.2s !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; margin-top: 18px !important; box-shadow: 0 4px 12px rgba(37,99,235,0.25) !important; }
            .em-btn-submit:hover { background: #1d4ed8 !important; }
            .em-group-row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; background: #f8fafc; padding: 8px 14px; border-radius: 50px !important; border: 1.5px solid #cbd5e1; }
            .em-group-row input { height: 34px; border-radius: 50px !important; border: 1px solid #cbd5e1; padding: 0 14px; font-size: 0.85rem; font-weight: 700; outline: none; background: #ffffff; }

            .em-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: none; justify-content: center; align-items: center; z-index: 999999; }
            .em-modal-card { background: #ffffff; border: 2px solid #cbd5e1; padding: 25px; border-radius: 30px !important; width: 100%; max-width: 420px; box-shadow: 0 20px 35px rgba(0,0,0,0.2); text-align: center; }
            .em-modal-card h3 { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
            .em-modal-inp { width: 100%; height: 44px; border: 1.5px solid #cbd5e1; border-radius: 50px !important; padding: 0 18px; font-size: 0.95rem; font-weight: 600; outline: none; text-align: center; margin-bottom: 18px; background: #f8fafc; }
            .em-modal-inp:focus { border-color: #2563eb; background: #fff; }
            .em-modal-btn { padding: 9px 22px !important; border-radius: 50px !important; font-weight: 700 !important; font-size: 0.85rem !important; cursor: pointer !important; border: none !important; }
            .em-modal-btn.confirm { background: #2563eb !important; color: #ffffff !important; }
            .em-modal-btn.cancel { background: #f1f5f9 !important; color: #64748b !important; border: 1.5px solid #cbd5e1 !important; }
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

    // ৩. গ্লোবাল ডাটা (১০০% পিওর ক্লাউড)
    let examRegistry = [];
    let isCloudDataLoaded = false;
    let currentActiveSubjectsList = [];
    let selectedSubjectsMap = {};
    let manualGroupOverrides = {};

    let allocatedStudentsCache = [];
    let selectedSingleStudentId = null;
    let emStudentSearchQuery = '';
    let emSelectedGroupFilter = 'all';
    let emStudentCurrentPage = 1;
    let emStudentPageSize = 25;
    let dynamicClassList = [];

    function getActiveFirebaseDb() {
        if (window.db && typeof window.db.ref === 'function') return window.db;
        if (window.firebase && typeof window.firebase.database === 'function') {
            try { return window.firebase.database(); } catch(e) {}
        }
        return null;
    }

    // ৪. ডেটাবেস থেকে আসল ক্লাস লোড
    async function fetchDynamicClassesFromDB() {
        let classesFound = new Set();

        if (typeof window.getCPSCLMasterConfig === 'function') {
            try {
                const cfg = window.getCPSCLMasterConfig();
                const classFilter = cfg && cfg.filterBoxes ? cfg.filterBoxes.find(b => b.id === 'class_name') : null;
                if (classFilter && classFilter.options) {
                    classFilter.options.forEach(c => classesFound.add(c.trim()));
                }
            } catch(e) {}
        }

        const students = await getRealStudentsForClass('');
        if (students && students.length > 0) {
            students.forEach(st => {
                const c = (st.class_name || st.class || '').trim();
                if (c) classesFound.add(c);
            });
        }

        if (classesFound.size === 0) {
            classesFound = new Set(['Eight Scholarship Batch-2026', 'Class 8', 'Class 9', 'Class 10']);
        }

        dynamicClassList = Array.from(classesFound);
        return dynamicClassList;
    }

    // ৫. মূল ইন্টারফেস রেন্ডার
    async function renderExamManagerUI() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        let panel = document.getElementById('cpscl-exam-manager-main-view');
        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'view-panel active';
            panel.id = 'cpscl-exam-manager-main-view';
            mainWrapper.appendChild(panel);
        }

        await fetchDynamicClassesFromDB();

        const defaultClass = dynamicClassList.includes("Eight Scholarship Batch-2026") ? "Eight Scholarship Batch-2026" : 
                            (dynamicClassList.includes("Class 8") ? "Class 8" : dynamicClassList[0]);

        let classOptsHtml = '<option value="">-- Choose Class From Database --</option>';
        dynamicClassList.forEach(c => {
            classOptsHtml += `<option value="${c}" ${c === defaultClass ? 'selected' : ''}>${c}</option>`;
        });

        panel.innerHTML = `
            <div class="em-wrapper">
                <div class="em-header">
                    <h1><i class="fa-solid fa-graduation-cap"></i> CPSCL Academic ERP - Exam & Group Management</h1>
                    <div class="em-badge"><i class="fa-solid fa-cloud-arrow-up"></i> 100% Pure Cloud Synced</div>
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
                                        <input type="text" id="emExamName" class="em-control" placeholder="e.g., Model Test - 01" required>
                                    </div>

                                    <div class="em-form-group">
                                        <label>2. Select Target Class (From Cloud DB) *</label>
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

                                    <div class="em-form-group" style="margin-top: 25px; border-top: 2px solid #f1f5f9; padding-top: 18px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                            <label style="margin: 0;"><i class="fa-solid fa-layer-group" style="color: #2563eb;"></i> 5. Initial Serial-based Grouping Rules</label>
                                            <button type="button" class="em-btn-add" onclick="addEMGroupRuleRow()"><i class="fa-solid fa-plus"></i> Add Group</button>
                                        </div>
                                        <span style="font-size: 0.75rem; color: #64748b; margin-bottom: 12px;">Define how student serials are distributed: (e.g. 1 to 40 = Group A, 41 to Rest = Group B)</span>
                                        
                                        <div id="emGroupRulesContainer"></div>
                                    </div>

                                    <button type="submit" id="emSubmitBtn" class="em-btn-submit">
                                        <i class="fa-solid fa-cloud-arrow-up"></i> Save Directly to Firebase
                                    </button>
                                </form>
                            </div>
                        </div>

                        <!-- Right: History Registry -->
                        <div id="emHistoryCol">
                            <div class="em-card">
                                <div class="em-card-title">
                                    <span><i class="fa-solid fa-clock-rotate-left"></i> Exam Registry & Status</span>
                                    <span style="font-size: 0.8rem; color: #64748b; font-weight: normal;">Live Cloud Synced</span>
                                </div>

                                <div style="overflow-x: auto;">
                                    <table class="em-table">
                                        <thead>
                                            <tr>
                                                <th>EXAM TITLE & GROUP RULES</th>
                                                <th>CLASS</th>
                                                <th>DATE</th>
                                                <th style="text-align: right;">ACTIONS</th>
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
                            <span><i class="fa-solid fa-shuffle"></i> Student Group Allocation & Manual Transfer</span>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <select id="emTransferExamSelect" class="em-control" style="width: 290px; height: 38px; font-size: 0.85rem;" onchange="loadEMStudentGroupAllocation()">
                                    <!-- Dynamic -->
                                </select>
                            </div>
                        </div>

                        <div class="em-top-transfer-bar">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; max-width: 380px;">
                                <input type="text" id="emStudentSearchInp" class="em-control" style="height: 38px;" placeholder="Search student by Name, ID, or SL..." oninput="onEMStudentSearch(this.value)">
                            </div>
                            
                            <div class="em-transfer-btns-group">
                                <span id="emSelectedCountBadge" style="font-size: 0.85rem; font-weight: 700; color: #64748b; padding: 0 8px;">
                                    0 Row Selected (Click a row below)
                                </span>
                                <div id="emDynamicTransferBtns" style="display: inline-flex; gap: 8px;"></div>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                            <div class="em-group-pills-filter" id="emGroupFilterPills"></div>
                            <span style="font-size: 0.8rem; color: #64748b; font-style: italic;">
                                <i class="fa-solid fa-circle-info"></i> Click any student row to select and move group.
                            </span>
                        </div>

                        <div style="overflow-x: auto; border: 1px solid #eef2f5; border-radius: 8px;">
                            <table class="em-table">
                                <thead>
                                    <tr>
                                        <th style="width: 70px;">SL #</th>
                                        <th style="width: 140px;">STUDENT ID</th>
                                        <th>STUDENT NAME</th>
                                        <th>CLASS</th>
                                        <th style="text-align: right; width: 140px;">ASSIGNED GROUP</th>
                                    </tr>
                                </thead>
                                <tbody id="emStudentAllocationTbody"></tbody>
                            </table>
                        </div>

                        <div class="em-pagination-footer">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #64748b;">
                                <select class="em-control" style="width: 75px; height: 32px; padding: 0 10px; border-radius: 50px !important;" onchange="changeEMPageSize(this.value)">
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

            <!-- Modal -->
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

        if (!isCloudDataLoaded) {
            renderEMRegistry(true);
            loadCloudExamsFast();
        } else {
            renderEMRegistry(false);
            populateEMExamDropdown();
        }
    }

    // ৬. ক্লাউডে সরাসরি সংরক্ষণ
    async function saveExamsToCloud() {
        let isSaved = false;

        if (typeof window.writeToFirebase === 'function') {
            try {
                await window.writeToFirebase('cpscl_exams', examRegistry);
                await window.writeToFirebase('cpscl_exam_group_overrides', manualGroupOverrides);
                isSaved = true;
            } catch(e) {}
        }

        const db = getActiveFirebaseDb();
        if (!isSaved && db && typeof db.ref === 'function') {
            try {
                await db.ref('cpscl_exams').set(examRegistry);
                await db.ref('cpscl_exam_group_overrides').set(manualGroupOverrides);
                isSaved = true;
            } catch (err) {}
        }

        if (!isSaved && typeof window.set === 'function' && typeof window.ref === 'function' && typeof window.getDatabase === 'function') {
            try {
                const mDb = window.getDatabase();
                await window.set(window.ref(mDb, 'cpscl_exams'), examRegistry);
                await window.set(window.ref(mDb, 'cpscl_exam_group_overrides'), manualGroupOverrides);
                isSaved = true;
            } catch(e) {}
        }

        return isSaved;
    }

    // ৭. দ্রুত ক্লাউড লোডার (সর্বোচ্চ ১.৫ সেকেন্ড লোডিং থাকবে, কোনো লেখা থাকবে না)
    let isFetchingDone = false;

    async function loadCloudExamsFast() {
        if (isFetchingDone) return;

        // টাইমআউট সেফগার্ড: কোনোভাবেই যেন ১.৫ সেকেন্ডের বেশি লোডার না ঘোরে
        const timer = setTimeout(() => {
            if (!isCloudDataLoaded) {
                isCloudDataLoaded = true;
                isFetchingDone = true;
                renderEMRegistry(false);
            }
        }, 1500);

        function applyCloudData(data) {
            clearTimeout(timer);
            isCloudDataLoaded = true;
            isFetchingDone = true;
            if (data) {
                examRegistry = Array.isArray(data) ? data : Object.values(data);
            } else {
                examRegistry = [];
            }
            renderEMRegistry(false);
            populateEMExamDropdown();
        }

        // পদ্ধতি ১: গ্লোবাল ব্রিজ রিডার
        if (typeof window.readFromFirebase === 'function') {
            try {
                const d = await window.readFromFirebase('cpscl_exams');
                if (d) { applyCloudData(d); return; }
            } catch(e) {}
        }

        // পদ্ধতি ২: ফায়ারবেস v8 লিসেনার
        const db = getActiveFirebaseDb();
        if (db && typeof db.ref === 'function') {
            try {
                db.ref('cpscl_exams').on('value', (snap) => {
                    applyCloudData(snap.val());
                });
                db.ref('cpscl_exam_group_overrides').on('value', (snap) => {
                    if (snap.val()) manualGroupOverrides = snap.val();
                });
                return;
            } catch(e) {}
        }

        // পদ্ধতি ৩: মডুলার SDK
        if (typeof window.getDatabase === 'function' && typeof window.ref === 'function') {
            try {
                const mDb = window.getDatabase();
                if (typeof window.onValue === 'function') {
                    window.onValue(window.ref(mDb, 'cpscl_exams'), (snap) => {
                        applyCloudData(snap.val());
                    });
                } else if (typeof window.get === 'function') {
                    const snap = await window.get(window.ref(mDb, 'cpscl_exams'));
                    applyCloudData(snap.exists() ? snap.val() : null);
                }
            } catch(e) {}
        }
    }

    // ৮. স্টুডেন্ট ডাটা আনা
    async function getRealStudentsForClass(targetClass) {
        let allStudents = [];
        const db = getActiveFirebaseDb();

        if (db) {
            try {
                const snap = await db.ref('cpscl_students').once('value');
                if (snap.exists()) {
                    const data = snap.val();
                    allStudents = Array.isArray(data) ? data : Object.values(data);
                }
            } catch(e) {}
        }

        if (!targetClass) return allStudents;

        const targetClean = String(targetClass).trim().toLowerCase();
        return allStudents.filter(s => {
            const cName = String(s.class_name || s.class || '').trim().toLowerCase();
            return cName === targetClean || cName.includes(targetClean) || targetClean.includes(cName);
        });
    }

    // ৯. ফর্ম সাবমিট
    window.handleEMSubmit = async function(e) {
        e.preventDefault();
        const editId = document.getElementById('emEditingId').value;
        const name = document.getElementById('emExamName').value.trim();
        const className = document.getElementById('emClassName').value;
        const date = document.getElementById('emExamDate').value;
        const keys = Object.keys(selectedSubjectsMap);

        if (!name || !className || keys.length === 0) {
            alert("সবগুলো তথ্য সঠিকভাবে পূরণ করুন!");
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

        const saved = await saveExamsToCloud();

        if (saved) {
            alert("✅ Success! সফল হয়েছে।");
        } else {
            alert("⚠️ ক্লাউড ডেটাবেসে কানেক্ট হতে পারেনি। ইন্টারনেট চেক করুন।");
        }

        resetEMForm();
        renderEMRegistry(false);
        populateEMExamDropdown();
        setEMWorkspaceView('history');
    };

    // ১০. হিস্ট্রি টেবিল ও নিখুঁত স্পিনার (কোনো লেখা ছাড়া)
    function renderEMRegistry(isLoading = false) {
        const tbody = document.getElementById('emRegistryTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        // কোনো লেখা থাকবে না, শুধু পরিচ্ছন্ন স্পিনার
        if (isLoading) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding:50px 20px;">
                        <i class="fa-solid fa-circle-notch fa-spin" style="font-size:32px; color:#2563eb;"></i>
                    </td>
                </tr>`;
            return;
        }

        if (examRegistry.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#64748b; padding:25px;">No exams published yet in cloud database.</td></tr>`;
            return;
        }

        examRegistry.forEach(ex => {
            const groupDesc = (ex.groups && ex.groups.length > 0)
                ? ex.groups.map(g => `${g.name} (${g.from}-${g.to})`).join(', ')
                : 'Default Groups';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color: #0f172a; font-size: 0.95rem;">${ex.name}</strong><br>
                    <span class="em-rule-badge">
                        <i class="fa-solid fa-layer-group"></i> ${groupDesc}
                    </span>
                </td>
                <td><span class="em-class-badge">${ex.class}</span></td>
                <td style="font-weight: 600; color: #475569;">${ex.date}</td>
                <td style="text-align: right; white-space: nowrap;">
                    <button class="em-btn-icon edit" onclick="editEMExam('${ex.id}')" title="Edit Assessment"><i class="fa-solid fa-pen"></i></button>
                    <button class="em-btn-icon duplicate" onclick="duplicateEMExam('${ex.id}')" title="Duplicate Assessment"><i class="fa-solid fa-copy"></i></button>
                    <button class="em-btn-icon delete" onclick="deleteEMExam('${ex.id}')" title="Delete Assessment"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ১১. গ্রুপ ট্রান্সফার ও বাকি ফাংশনসমূহ
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
            <button type="button" class="em-btn-icon delete" style="width: 32px; height: 32px; margin-left: auto;" onclick="this.closest('.em-group-row').remove()" title="Remove"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    }

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

    window.onEMClassChange = function(className) {
        const defaultSubs = ["Bangla", "English", "Mathematics", "Science", "BGS", "ICT", "Religion"];
        currentActiveSubjectsList = [...defaultSubs];
        selectedSubjectsMap = {};
        renderEMPills();
        renderEMSelectedTable();
    };

    function renderEMPills() {
        const area = document.getElementById('emPillsArea');
        if (!area) return;
        area.innerHTML = '';

        currentActiveSubjectsList.forEach(sub => {
            const isSelected = selectedSubjectsMap.hasOwnProperty(sub);
            const pill = document.createElement('div');
            pill.className = `em-pill ${isSelected ? 'active' : ''}`;
            pill.innerHTML = `
                <span>${sub}</span>
                <div class="em-pill-actions">
                    <i class="fa-solid fa-pen em-pill-btn" title="Edit" onclick="openEMEditSubjectModal(event, '${sub}')"></i>
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
                    <input type="number" class="em-mark-inp" value="${m}" min="1" oninput="updateEMMark('${sub}', this.value)" style="width:70px; height:32px; border-radius:50px; border:1px solid #cbd5e1; text-align:center;">
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

        let rawStudents = await getRealStudentsForClass(exam.class);

        rawStudents.sort((a, b) => {
            const rA = parseInt(a.roll_no || a.roll) || 0;
            const rB = parseInt(b.roll_no || b.roll) || 0;
            if (rA && rB) return rA - rB;
            return String(a.std_id || a.id).localeCompare(String(b.std_id || b.id));
        });

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

        selectedSingleStudentId = null;
        updateTopTransferBar(groupsList);
        renderGroupFilterPills();
        emStudentCurrentPage = 1;
        renderEMPaginatedStudentTable();
    };

    function updateTopTransferBar(groupsList) {
        const btnsBox = document.getElementById('emDynamicTransferBtns');
        const countBadge = document.getElementById('emSelectedCountBadge');
        if (!btnsBox) return;

        const selectedStudent = allocatedStudentsCache.find(s => s.id === selectedSingleStudentId);

        if (countBadge) {
            if (selectedStudent) {
                countBadge.innerHTML = `<span style="color:#2563eb; font-weight:800;">1 Row Selected:</span> <span style="color:#0f172a;">${selectedStudent.name} (SL #${selectedStudent.sl})</span>`;
            } else {
                countBadge.innerText = '0 Row Selected (Click a row below)';
                countBadge.style.color = '#64748b';
            }
        }

        const examSelect = document.getElementById('emTransferExamSelect');
        const examId = examSelect ? examSelect.value : '';
        const exam = examRegistry.find(x => x.id === examId);
        const groups = (exam && exam.groups) ? exam.groups : (groupsList || [{ name: 'Group A' }, { name: 'Group B' }]);

        let btnsHtml = '';
        groups.forEach((g, idx) => {
            const btnClass = idx % 2 === 0 ? 'em-btn-move-a' : 'em-btn-move-b';
            const isCurrentGroup = selectedStudent && (selectedStudent.group === g.name);

            btnsHtml += `
                <button type="button" class="em-btn-move ${btnClass}" ${(!selectedStudent || isCurrentGroup) ? 'disabled' : ''} onclick="moveSingleSelectedStudent('${g.name}')">
                    <i class="fa-solid fa-arrow-right-arrow-left"></i> Move to ${g.name}
                </button>
            `;
        });

        btnsBox.innerHTML = btnsHtml;
    }

    window.moveSingleSelectedStudent = async function(targetGroup) {
        if (!selectedSingleStudentId) return;

        const examSelect = document.getElementById('emTransferExamSelect');
        const examId = examSelect ? examSelect.value : '';
        if (!examId) return;

        if (!manualGroupOverrides[examId]) manualGroupOverrides[examId] = {};
        manualGroupOverrides[examId][selectedSingleStudentId] = targetGroup;

        const stu = allocatedStudentsCache.find(s => s.id === selectedSingleStudentId);
        if (stu) stu.group = targetGroup;

        await saveExamsToCloud();

        updateTopTransferBar();
        renderGroupFilterPills();
        renderEMPaginatedStudentTable();
    };

    window.toggleSingleStudentSelection = function(studentId) {
        selectedSingleStudentId = (selectedSingleStudentId === studentId) ? null : studentId;
        updateTopTransferBar();
        renderEMPaginatedStudentTable();
    };

    function renderGroupFilterPills() {
        const container = document.getElementById('emGroupFilterPills');
        if (!container) return;

        const total = allocatedStudentsCache.length;
        const groupCounts = {};
        allocatedStudentsCache.forEach(s => {
            groupCounts[s.group] = (groupCounts[s.group] || 0) + 1;
        });

        let html = `
            <button type="button" class="em-filter-pill-btn ${emSelectedGroupFilter === 'all' ? 'active' : ''}" onclick="setEMGroupFilter('all')">
                All Students (${total})
            </button>
        `;

        Object.keys(groupCounts).forEach(gName => {
            html += `
                <button type="button" class="em-filter-pill-btn ${emSelectedGroupFilter === gName ? 'active' : ''}" onclick="setEMGroupFilter('${gName}')">
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
            const isSelected = (selectedSingleStudentId === st.id);
            const rollBadge = st.roll ? `<span style="font-size:0.75rem; background:rgba(0,0,0,0.06); padding:2px 8px; border-radius:10px; margin-left:6px;">Roll: ${st.roll}</span>` : '';

            const tr = document.createElement('tr');
            if (isSelected) tr.classList.add('erp-row-selected');

            tr.onclick = () => toggleSingleStudentSelection(st.id);

            tr.innerHTML = `
                <td><strong>${st.sl}</strong></td>
                <td><strong>${st.id}</strong></td>
                <td><span style="font-weight:700;">${st.name}</span>${rollBadge}</td>
                <td>${st.class}</td>
                <td style="text-align: right;"><span class="em-group-badge">${st.group}</span></td>
            `;
            tbody.appendChild(tr);
        });

        const end = Math.min(startIndex + emStudentPageSize, totalFiltered);
        if (counterEl) {
            const selText = selectedSingleStudentId ? ` (1 row selected)` : '';
            counterEl.innerText = `Showing ${startIndex + 1} to ${end} of ${totalFiltered} entries ${selText}`;
        }

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

    // এডিট, ডুপ্লিকেট, ডিলিট
    window.editEMExam = function(id) {
        const exam = examRegistry.find(x => x.id === id);
        if (!exam) return;

        document.getElementById('emEditingId').value = exam.id;
        document.getElementById('emExamName').value = exam.name;
        document.getElementById('emClassName').value = exam.class;
        document.getElementById('emExamDate').value = exam.date;

        onEMClassChange(exam.class);
        selectedSubjectsMap = { ...exam.subjects };

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
        document.getElementById('emSubmitBtn').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Update In Firebase`;
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
        document.getElementById('emSubmitBtn').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save Duplicated to Firebase`;
        document.getElementById('emCancelEditBtn').style.display = 'block';

        switchEMMainTab('createExam');
        setEMWorkspaceView('form');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteEMExam = async function(id) {
        if (confirm("Are you sure you want to delete this exam permanently from cloud?")) {
            examRegistry = examRegistry.filter(x => x.id !== id);
            await saveExamsToCloud();
            renderEMRegistry(false);
            populateEMExamDropdown();
        }
    };

    window.resetEMForm = function() {
        document.getElementById('emAssessmentForm').reset();
        document.getElementById('emEditingId').value = '';
        document.getElementById('emExamDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('emFormTitle').innerHTML = `<i class="fa-solid fa-file-pen"></i> Create New Assessment & Rules`;
        document.getElementById('emSubmitBtn').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save Directly to Firebase`;
        document.getElementById('emCancelEditBtn').style.display = 'none';
        initDefaultEMGroupRules();
    };

    function init() {
        injectExamStyles();
        injectExamManagerSidebar();
        loadCloudExamsFast();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
