/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Exam & Dynamic Student Group Management Suite (v10.0 Final Pro)
   Path: cpscl/exam_manager.js
   Architecture: All Buttons Working | Pure Merit Auto-Grouping | Blank Sheet Print | Cloud Synced
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Suite v10.0 (Tab Switch Fixed & Full Suite Active)...");

    // ১. সম্পূর্ণ ও নিখুঁত পিল (Pill) স্টাইল ইনজেকশন
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

            .em-group-badge, .em-class-badge { display: inline-block !important; padding: 4px 14px !important; border-radius: 50px !important; font-size: 0.8rem !important; font-weight: 700; background: #eff6ff !important; color: #2563eb !important; border: 1px solid #bfdbfe !important; }
            .em-rule-badge { display: inline-flex !important; align-items: center !important; gap: 5px !important; padding: 3px 12px !important; border-radius: 50px !important; font-size: 0.75rem !important; font-weight: 700 !important; background: #f1f5f9 !important; color: #2563eb !important; border: 1px solid #e2e8f0 !important; margin-top: 4px !important; }
            .em-status-badge { display: inline-block !important; padding: 3px 10px !important; border-radius: 50px !important; font-size: 0.72rem !important; font-weight: 800 !important; }

            .em-btn-icon { width: 36px !important; height: 36px !important; border-radius: 50px !important; border: 1.5px solid #cbd5e1 !important; background: #ffffff !important; cursor: pointer !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; font-size: 0.85rem !important; transition: all 0.2s ease !important; margin: 0 3px !important; outline: none !important; }
            .em-btn-icon.edit { color: #2563eb !important; }
            .em-btn-icon.edit:hover { background: #eff6ff !important; border-color: #2563eb !important; transform: scale(1.05); }
            .em-btn-icon.duplicate { color: #ca8a04 !important; }
            .em-btn-icon.duplicate:hover { background: #fef9c3 !important; border-color: #ca8a04 !important; transform: scale(1.05); }
            .em-btn-icon.delete { color: #dc2626 !important; }
            .em-btn-icon.delete:hover { background: #fee2e2 !important; border-color: #dc2626 !important; transform: scale(1.05); }
            .em-btn-icon.lock { color: #dc2626 !important; }
            .em-btn-icon.lock:hover { background: #fee2e2 !important; border-color: #dc2626 !important; transform: scale(1.05); }
            .em-btn-icon.unlock { color: #16a34a !important; }
            .em-btn-icon.unlock:hover { background: #dcfce7 !important; border-color: #16a34a !important; transform: scale(1.05); }

            .em-top-transfer-bar { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 50px !important; padding: 10px 20px; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
            .em-transfer-btns-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
            .em-btn-move { padding: 8px 20px !important; border-radius: 50px !important; font-size: 0.82rem !important; font-weight: 700 !important; cursor: pointer !important; border: none !important; display: inline-flex !important; align-items: center !important; gap: 6px !important; transition: 0.2s !important; }
            .em-btn-move-a { background: #2563eb !important; color: #fff !important; box-shadow: 0 2px 6px rgba(37,99,235,0.25); }
            .em-btn-move-a:hover { background: #1d4ed8 !important; }
            .em-btn-move-b { background: #059669 !important; color: #fff !important; box-shadow: 0 2px 6px rgba(5,150,105,0.25); }
            .em-btn-move-b:hover { background: #047857 !important; }
            .em-btn-move:disabled { opacity: 0.45 !important; cursor: not-allowed !important; box-shadow: none !important; }

            .em-auto-merit-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1.5px solid #bfdbfe; border-radius: 16px; padding: 14px 20px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
            .em-auto-merit-title { font-size: 0.9rem; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 8px; }

            .em-pagination-footer { display: flex; justify-content: space-between; align-items: center; padding: 16px 8px; border-top: 1.5px solid #eef2f5; flex-wrap: wrap; gap: 12px; margin-top: 15px; }
            .em-page-btn { min-width: 32px !important; height: 32px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; padding: 0 10px !important; border: 1px solid #e2e8f0 !important; background: #ffffff !important; color: #475569 !important; border-radius: 50px !important; font-size: 0.85rem !important; font-weight: 600 !important; cursor: pointer !important; transition: all 0.2s !important; }
            .em-page-btn:hover:not(.disabled):not(.active) { background: #f1f5f9 !important; border-color: #cbd5e1 !important; }
            .em-page-btn.active { background: #3b82f6 !important; border-color: #3b82f6 !important; color: #ffffff !important; font-weight: 700 !important; }
            .em-page-btn.disabled { opacity: 0.35 !important; cursor: not-allowed !important; }

            .em-btn-submit { background: #2563eb !important; color: #fff !important; border: none !important; width: 100% !important; height: 48px !important; border-radius: 50px !important; font-size: 0.95rem !important; font-weight: 700 !important; cursor: pointer !important; transition: 0.2s !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; margin-top: 18px !important; box-shadow: 0 4px 12px rgba(37,99,235,0.25) !important; }
            .em-btn-submit:hover { background: #1d4ed8 !important; }
            .em-group-row { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; background: #f8fafc; padding: 8px 14px; border-radius: 50px !important; border: 1.5px solid #cbd5e1; }
            .em-group-row input { height: 34px; border-radius: 50px !important; border: 1px solid #cbd5e1; padding: 0 14px; font-size: 0.85rem; font-weight: 700; outline: none; background: #ffffff; }

            .em-center-toast-wrap { position: fixed; top: 30px; left: 50%; transform: translate(-50%, -40px) scale(0.9); z-index: 99999999; pointer-events: none; opacity: 0; transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .em-center-toast-wrap.show { opacity: 1; transform: translate(-50%, 0) scale(1); }
            .em-center-toast-card { background: #0f172a; color: #ffffff; padding: 13px 28px; border-radius: 50px !important; box-shadow: 0 15px 35px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 10px; font-size: 0.92rem; font-weight: 700; border: 1.5px solid #22c55e; }
        `;
        document.head.appendChild(style);
    }

    function showCenterToast(message, isSuccess = true) {
        let wrap = document.getElementById('em-center-toast-wrap');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'em-center-toast-wrap';
            wrap.className = 'em-center-toast-wrap';
            wrap.innerHTML = `<div class="em-center-toast-card" id="em-center-toast-card"></div>`;
            document.body.appendChild(wrap);
        }
        const card = document.getElementById('em-center-toast-card');
        const icon = isSuccess ? 'fa-circle-check' : 'fa-triangle-exclamation';
        const borderColor = isSuccess ? '#22c55e' : '#ef4444';
        const iconColor = isSuccess ? '#22c55e' : '#ef4444';

        card.style.borderColor = borderColor;
        card.innerHTML = `<i class="fa-solid ${icon}" style="color:${iconColor};"></i> <span>${message}</span>`;
        wrap.classList.add('show');
        setTimeout(() => { wrap.classList.remove('show'); }, 2200);
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
            <a class="trust-parent-btn" onclick="window.toggleCPSCLExamModule()">
                <div class="trust-parent-left">
                    <i class="fa-solid fa-graduation-cap" style="color: #2563eb;"></i>
                    <span>Exam Manager</span>
                </div>
                <i class="fa-solid fa-chevron-down chevron-arrow"></i>
            </a>

            <ul class="trust-submenu-box" id="trust-exam-submenu-items">
                <li>
                    <a class="trust-sub-link active" id="sub-link-create-exam" onclick="window.switchCPSCLExamSubTab(this, 'create-exam')">
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

    // ৩. গ্লোবাল ডাটা
    let examRegistry = [];
    let currentActiveSubjectsList = [];
    let selectedSubjectsMap = {};
    let manualGroupOverrides = {};

    let allocatedStudentsCache = [];
    let selectedSingleStudentId = null;
    let emStudentSearchQuery = '';
    let emSelectedGroupFilter = 'all';
    let emStudentCurrentPage = 1;
    let emStudentPageSize = 50;
    let dynamicClassList = [];

    try {
        const cached = localStorage.getItem('cpscl_exams_registry');
        if (cached) examRegistry = JSON.parse(cached);
    } catch(e) {}

    function getActiveFirebaseDb() {
        if (window.db && typeof window.db.ref === 'function') return window.db;
        if (window.firebase && typeof window.firebase.database === 'function') {
            try { return window.firebase.database(); } catch(e) {}
        }
        return null;
    }

    // ৪. ক্লাউড থেকে আসল ক্লাস লোড
    async function fetchDynamicClassesFromDB() {
        let classesFound = new Set();
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

        const defaultClass = dynamicClassList.includes("Eight Scholarship Batch-2026") ? "Eight Scholarship Batch-2026" : dynamicClassList[0];

        let classOptsHtml = '<option value="">-- Choose Class From Database --</option>';
        dynamicClassList.forEach(c => {
            classOptsHtml += `<option value="${c}" ${c === defaultClass ? 'selected' : ''}>${c}</option>`;
        });

        panel.innerHTML = `
            <div class="em-wrapper">
                <div class="em-header">
                    <h1><i class="fa-solid fa-graduation-cap"></i> CPSCL Academic ERP - Exam & Group Management</h1>
                    <div class="em-badge"><i class="fa-solid fa-cloud-arrow-up"></i> Pure Cloud Synced</div>
                </div>

                <div class="em-nav-tabs">
                    <button type="button" class="em-tab-btn active" id="emTabBtn1" onclick="window.switchEMMainTab('createExam')">
                        <i class="fa-solid fa-file-pen"></i> 1. Exam Setup
                    </button>
                    <button type="button" class="em-tab-btn" id="emTabBtn2" onclick="window.switchEMMainTab('transferModule')">
                        <i class="fa-solid fa-shuffle"></i> 2. Student Merit Grouping & Allocation
                    </button>
                </div>

                <!-- TAB 1: Exam Setup -->
                <div class="em-tab-content active" id="emTabContent1">
                    <div class="em-view-bar">
                        <span><i class="fa-solid fa-eye"></i> View:</span>
                        <button type="button" class="em-btn-toggle active" id="emBtnShowBoth" onclick="window.setEMWorkspaceView('both')">Split View</button>
                        <button type="button" class="em-btn-toggle" id="emBtnShowForm" onclick="window.setEMWorkspaceView('form')">Form Only</button>
                        <button type="button" class="em-btn-toggle" id="emBtnShowHistory" onclick="window.setEMWorkspaceView('history')">History Registry Only</button>
                    </div>

                    <div class="em-grid" id="emMainGrid">
                        <!-- Left: Form -->
                        <div id="emFormCol">
                            <div class="em-card">
                                <div class="em-card-title">
                                    <span id="emFormTitle"><i class="fa-solid fa-file-pen"></i> Create New Examination</span>
                                    <button type="button" id="emCancelEditBtn" style="display:none; background:none; border:none; color:#dc2626; font-size:0.8rem; font-weight:700; cursor:pointer;" onclick="window.resetEMForm()">Cancel Edit</button>
                                </div>

                                <form id="emAssessmentForm" onsubmit="window.handleEMSubmit(event)">
                                    <input type="hidden" id="emEditingId" value="">

                                    <div class="em-form-group">
                                        <label>Exam Name / Title *</label>
                                        <input type="text" id="emExamName" class="em-control" placeholder="e.g., Model Test - 02" required>
                                    </div>

                                    <div class="em-form-group">
                                        <label>Select Target Class *</label>
                                        <select id="emClassName" class="em-control" onchange="window.onEMClassChange(this.value)" required>
                                            ${classOptsHtml}
                                        </select>
                                    </div>

                                    <div class="em-form-group">
                                        <label>Exam Date *</label>
                                        <input type="date" id="emExamDate" class="em-control" required>
                                    </div>

                                    <div class="em-form-group" style="margin-top: 14px;">
                                        <label>Select Subjects & Assign Marks *</label>
                                        <div class="em-pills-box" id="emPillsArea"></div>

                                        <div class="em-custom-sub-bar">
                                            <input type="text" id="emCustomSubInput" class="em-control" placeholder="Add custom subject name...">
                                            <button type="button" class="em-btn-add" onclick="window.addEMCustomSubject()"><i class="fa-solid fa-plus"></i> Add</button>
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
                                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                            <label style="margin:0;"><i class="fa-solid fa-layer-group" style="color: #2563eb;"></i> Groups Structure</label>
                                            <button type="button" class="em-btn-add" onclick="window.addEMGroupRuleRow()"><i class="fa-solid fa-plus"></i> Add Group</button>
                                        </div>
                                        <span style="font-size: 0.75rem; color: #64748b; margin-bottom: 12px;">Default: Group A (Top 40 Merit) and Group B (41-Rest Merit)</span>
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
                                </div>
                                <div style="overflow-x: auto;">
                                    <table class="em-table">
                                        <thead>
                                            <tr>
                                                <th>EXAM TITLE</th>
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

                <!-- TAB 2: Student Merit Grouping & Allocation -->
                <div class="em-tab-content" id="emTabContent2">
                    <div class="em-card">
                        <div class="em-card-title">
                            <span><i class="fa-solid fa-shuffle"></i> Student Merit Grouping & Seat Plan Allocation</span>
                            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                                <select id="emTransferExamSelect" class="em-control" style="width: 290px; height: 38px; font-size: 0.85rem;" onchange="window.loadEMStudentGroupAllocation()">
                                </select>
                                <button type="button" class="em-btn-toggle" style="background:#059669; color:#fff; border-color:#059669;" onclick="window.openBlankSheetPrintModal()">
                                    <i class="fa-solid fa-print"></i> Print Blank Sheet
                                </button>
                            </div>
                        </div>

                        <!-- স্বয়ংক্রিয় মেধা গ্রুপিং বার -->
                        <div class="em-auto-merit-box">
                            <div>
                                <div class="em-auto-merit-title">
                                    <i class="fa-solid fa-bolt"></i> Auto-Assign Groups from Previous Exam Merit
                                </div>
                                <span style="font-size: 11.5px; color: #1e3a8a; font-weight: 600;">
                                    নির্বাচিত পূর্ববর্তী পরীক্ষার মেধা তালিকা অনুযায়ী ১-৪০ জন Group A এবং ৪১-৮১ জন Group B হিসেবে ক্রমিক ১ থেকে ৮১ সাজানো হবে।
                                </span>
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                                <select id="emSourceMeritExamSelect" class="em-control" style="width: 230px; height: 36px; font-size: 0.82rem; background:#fff;">
                                    <option value="">-- Choose Source Exam --</option>
                                </select>
                                <button type="button" class="em-btn-move em-btn-move-a" style="height: 36px;" onclick="window.autoAssignGroupsFromPreviousMerit()">
                                    <i class="fa-solid fa-wand-magic-sparkles"></i> Apply Merit Grouping
                                </button>
                            </div>
                        </div>

                        <div class="em-top-transfer-bar">
                            <div style="display: flex; align-items: center; gap: 12px; flex: 1; max-width: 380px;">
                                <input type="text" id="emStudentSearchInp" class="em-control" style="height: 38px;" placeholder="Search student by Name or ID..." oninput="window.onEMStudentSearch(this.value)">
                            </div>
                            
                            <div class="em-transfer-btns-group">
                                <span id="emSelectedCountBadge" style="font-size: 0.85rem; font-weight: 700; color: #64748b; padding: 0 8px;">
                                    0 Row Selected
                                </span>
                                <div id="emDynamicTransferBtns" style="display: inline-flex; gap: 8px;"></div>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
                            <div class="em-group-pills-filter" id="emGroupFilterPills"></div>
                            <span style="font-size: 0.8rem; color: #64748b; font-style: italic;">
                                <i class="fa-solid fa-circle-info"></i> Click any student row to select and move group manually.
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
                                <select class="em-control" style="width: 75px; height: 32px; padding: 0 10px; border-radius: 50px !important;" onchange="window.changeEMPageSize(this.value)">
                                    <option value="25">25</option>
                                    <option value="50" selected>50</option>
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

            <!-- এডিট সাবজেক্ট মডাল -->
            <div id="emCustomModalOverlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:999999; display:none; align-items:center; justify-content:center;">
                <div style="background:#fff; border-radius:20px; width:90%; max-width:400px; padding:22px; box-shadow:0 15px 35px rgba(0,0,0,0.25);">
                    <h4 id="emModalTitle" style="margin:0 0 12px 0; font-size:1.05rem; font-weight:800; color:#0f172a;">Edit Subject Name</h4>
                    <input type="text" id="emModalInput" class="em-control" style="margin-bottom:15px;">
                    <div style="display:flex; justify-content:flex-end; gap:8px;">
                        <button type="button" class="em-btn-toggle" onclick="window.closeEMModal()">Cancel</button>
                        <button type="button" class="em-btn-move em-btn-move-a" id="emModalConfirmBtn">Update</button>
                    </div>
                </div>
            </div>

            <!-- ব্ল্যাঙ্ক শিট প্রিন্ট মোডাল -->
            <div id="emBlankSheetModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:999999; display:none; align-items:center; justify-content:center;">
                <div style="background:#fff; border-radius:20px; width:90%; max-width:440px; padding:24px; box-shadow:0 15px 35px rgba(0,0,0,0.25);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
                        <h4 style="margin:0; font-size:1.05rem; font-weight:800; color:#0f172a;"><i class="fa-solid fa-print" style="color:#2563eb;"></i> Print Blank Evaluation Sheet</h4>
                        <button type="button" onclick="window.closeBlankSheetPrintModal()" style="border:none; background:none; font-size:1.3rem; cursor:pointer; color:#64748b;">✕</button>
                    </div>
                    <div class="em-form-group">
                        <label>Select Group to Print</label>
                        <select id="modalBlankGroupSelect" class="em-control"></select>
                    </div>
                    <div class="em-form-group">
                        <label>Subject Name</label>
                        <select id="modalBlankSubjectSelect" class="em-control"></select>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                        <button type="button" class="em-btn-toggle" onclick="window.closeBlankSheetPrintModal()">Cancel</button>
                        <button type="button" class="em-btn-move em-btn-move-a" onclick="window.executeBlankSheetPrint()">
                            <i class="fa-solid fa-print"></i> Print Now
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('emExamDate').value = new Date().toISOString().split('T')[0];
        initDefaultEMGroupRules();
        window.onEMClassChange(defaultClass);

        renderEMRegistry(false);
        populateEMExamDropdown();
        syncCloudExamsDirectly();
    }

    // ৬. ক্লাউডে সরাসরি সংরক্ষণ
    async function saveExamsToCloud() {
        let isSaved = false;
        const cleanRegistry = JSON.parse(JSON.stringify(examRegistry));
        const cleanOverrides = JSON.parse(JSON.stringify(manualGroupOverrides));

        localStorage.setItem('cpscl_exams_registry', JSON.stringify(cleanRegistry));
        localStorage.setItem('cpscl_exam_group_overrides', JSON.stringify(cleanOverrides));

        if (typeof window.getDatabase === 'function' && typeof window.ref === 'function' && typeof window.set === 'function') {
            try {
                const mDb = window.getDatabase();
                await window.set(window.ref(mDb, 'cpscl_exams'), cleanRegistry);
                await window.set(window.ref(mDb, 'cpscl_exam_group_overrides'), cleanOverrides);
                isSaved = true;
            } catch(e) {}
        }

        const db = getActiveFirebaseDb();
        if (!isSaved && db && typeof db.ref === 'function') {
            try {
                await db.ref('cpscl_exams').set(cleanRegistry);
                await db.ref('cpscl_exam_group_overrides').set(cleanOverrides);
                isSaved = true;
            } catch (err) {}
        }

        if (!isSaved && typeof window.writeToFirebase === 'function') {
            try {
                await window.writeToFirebase('cpscl_exams', cleanRegistry);
                await window.writeToFirebase('cpscl_exam_group_overrides', cleanOverrides);
                isSaved = true;
            } catch(e) {}
        }

        return true;
    }

    // ৭. সরাসরি ক্লাউড ডাটা সিঙ্ক
    async function syncCloudExamsDirectly() {
        let cloudData = null;

        if (typeof window.getDatabase === 'function' && typeof window.ref === 'function' && typeof window.get === 'function') {
            try {
                const mDb = window.getDatabase();
                const snap = await window.get(window.ref(mDb, 'cpscl_exams'));
                if (snap.exists()) cloudData = snap.val();

                const snapOv = await window.get(window.ref(mDb, 'cpscl_exam_group_overrides'));
                if (snapOv.exists()) manualGroupOverrides = snapOv.val() || {};
            } catch(e) {}
        }

        const db = getActiveFirebaseDb();
        if (!cloudData && db && typeof db.ref === 'function') {
            try {
                const snap = await db.ref('cpscl_exams').once('value');
                if (snap.exists()) cloudData = snap.val();

                const snapOv = await db.ref('cpscl_exam_group_overrides').once('value');
                if (snapOv.exists()) manualGroupOverrides = snapOv.val() || {};
            } catch(e) {}
        }

        if (!cloudData && typeof window.readFromFirebase === 'function') {
            try {
                cloudData = await window.readFromFirebase('cpscl_exams');
            } catch(e) {}
        }

        if (cloudData) {
            examRegistry = Array.isArray(cloudData) ? cloudData : Object.values(cloudData);
            localStorage.setItem('cpscl_exams_registry', JSON.stringify(examRegistry));
            renderEMRegistry(false);
            populateEMExamDropdown();
        }
    }

    // ৮. স্টুডেন্ট রিডার
    async function getRealStudentsForClass(targetClass) {
        let allStudents = [];

        if (typeof window.getDatabase === 'function' && typeof window.ref === 'function' && typeof window.get === 'function') {
            try {
                const mDb = window.getDatabase();
                const snap = await window.get(window.ref(mDb, 'cpscl_students'));
                if (snap.exists()) {
                    const data = snap.val();
                    allStudents = Array.isArray(data) ? data : Object.values(data);
                }
            } catch(e) {}
        }

        if (allStudents.length === 0) {
            const db = getActiveFirebaseDb();
            if (db && typeof db.ref === 'function') {
                try {
                    const snap = await db.ref('cpscl_students').once('value');
                    if (snap.exists()) {
                        const data = snap.val();
                        allStudents = Array.isArray(data) ? data : Object.values(data);
                    }
                } catch(e) {}
            }
        }

        if (allStudents.length === 0 && window.cpscl_students_data) {
            allStudents = window.cpscl_students_data;
        }

        if (allStudents.length > 0) {
            try { localStorage.setItem('cpscl_students_cache', JSON.stringify(allStudents)); } catch(e) {}
        } else {
            try {
                const local = localStorage.getItem('cpscl_students_cache');
                if (local) allStudents = JSON.parse(local);
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
            const gFrom = row.querySelector('.g-from') ? row.querySelector('.g-from').value.trim() : "1";
            const gTo = row.querySelector('.g-to') ? row.querySelector('.g-to').value.trim() : "Rest";
            groupsArr.push({ name: gName, from: gFrom, to: gTo });
        });

        if (groupsArr.length === 0) {
            groupsArr = [
                { name: "Group A", from: "1", to: "40" },
                { name: "Group B", from: "41", to: "Rest" }
            ];
        }

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
            if (idx !== -1) {
                examObj.status = examRegistry[idx].status || 'Active';
                examRegistry[idx] = examObj;
            }
        } else {
            examRegistry.unshift(examObj);
        }

        await saveExamsToCloud();
        showCenterToast("সফলভাবে পরীক্ষা সংরক্ষিত হয়েছে!");

        window.resetEMForm();
        renderEMRegistry(false);
        populateEMExamDropdown();
        window.setEMWorkspaceView('history');
    };

    // ১০. হিস্ট্রি টেবিল রেন্ডার
    function renderEMRegistry(isLoading = false) {
        const tbody = document.getElementById('emRegistryTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (isLoading) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align:center; padding:45px 20px;">
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
            const isLocked = (ex.status === 'Locked' || ex.status === 'Closed');
            const statusBadge = isLocked 
                ? `<span class="em-status-badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5;">Locked (Hidden)</span>`
                : `<span class="em-status-badge" style="background:#dcfce7; color:#15803d; border:1px solid #bbf7d0;">Active (Live)</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color: #0f172a; font-size: 0.95rem;">${ex.name}</strong> ${statusBadge}
                </td>
                <td><span class="em-class-badge">${ex.class}</span></td>
                <td style="font-weight: 600; color: #475569;">${ex.date}</td>
                <td style="text-align: right; white-space: nowrap;">
                    <button type="button" class="em-btn-icon ${isLocked ? 'unlock' : 'lock'}" onclick="window.toggleExamLockStatus('${ex.id}')" title="${isLocked ? 'Unlock Exam (Show to Teachers)' : 'Lock Exam (Hide from Teachers)'}">
                        <i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-lock-open'}"></i>
                    </button>
                    <button type="button" class="em-btn-icon edit" onclick="window.editEMExam('${ex.id}')" title="Edit Assessment"><i class="fa-solid fa-pen"></i></button>
                    <button type="button" class="em-btn-icon duplicate" onclick="window.duplicateEMExam('${ex.id}')" title="Duplicate Assessment"><i class="fa-solid fa-copy"></i></button>
                    <button type="button" class="em-btn-icon delete" onclick="window.deleteEMExam('${ex.id}')" title="Delete Assessment"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ১১. শিক্ষকদের ফোন থেকে পরীক্ষা লক/হাইড করার টগল
    window.toggleExamLockStatus = async function(examId) {
        const exam = examRegistry.find(x => x.id === examId);
        if (!exam) return;

        const isCurrentlyLocked = (exam.status === 'Locked' || exam.status === 'Closed');
        exam.status = isCurrentlyLocked ? 'Active' : 'Closed';

        await saveExamsToCloud();
        renderEMRegistry(false);

        if (exam.status === 'Closed') {
            showCenterToast(`'${exam.name}' লক করা হয়েছে (শিক্ষকদের ফোনে এটি আর দেখা যাবে না)!`);
        } else {
            showCenterToast(`'${exam.name}' আনলক করা হয়েছে (শিক্ষকরা দেখতে পাবেন)!`);
        }
    };

    // ১২. পূর্ববর্তী পরীক্ষার মেধা অনুযায়ী স্বয়ংক্রিয় গ্রুপ ও মেধা সর্টিং ইঞ্জিন
    window.autoAssignGroupsFromPreviousMerit = async function() {
        const targetSelect = document.getElementById('emTransferExamSelect');
        const sourceSelect = document.getElementById('emSourceMeritExamSelect');

        if (!targetSelect || !sourceSelect) return;

        const targetExamId = targetSelect.value;
        const sourceExamId = sourceSelect.value;

        if (!targetExamId) {
            alert("অনুগ্রহ করে যে পরীক্ষার জন্য গ্রুপ করবেন (Target Exam) তা নির্বাচন করুন!");
            return;
        }

        if (!sourceExamId) {
            alert("অনুগ্রহ করে যে পরীক্ষার রেজাল্ট অনুযায়ী গ্রুপ করবেন (Source Exam) তা নির্বাচন করুন!");
            return;
        }

        const targetExam = examRegistry.find(x => x.id === targetExamId);
        const sourceExam = examRegistry.find(x => x.id === sourceExamId);

        if (!targetExam || !sourceExam) return;

        let students = await getRealStudentsForClass(targetExam.class);
        if (students.length === 0) {
            alert("এই ক্লাসে কোনো শিক্ষার্থী পাওয়া যায়নি!");
            return;
        }

        showCenterToast("মেধা তালিকা বিশ্লেষণ করা হচ্ছে...", true);

        const sourceSubjects = Object.keys(sourceExam.subjects || {});
        const studentTotals = {};

        for (let sub of sourceSubjects) {
            let marksMap = JSON.parse(localStorage.getItem(`cpscl_marks_${sourceExamId}_${sub}`) || '{}');

            if (window.getDatabase && window.ref && window.get) {
                try {
                    const snap = await window.get(window.ref(window.getDatabase(), `cpscl_exam_marks/${sourceExamId}_${sub}`));
                    if (snap.exists()) {
                        marksMap = snap.val() || marksMap;
                    }
                } catch(e) {}
            }

            students.forEach(st => {
                const sId = String(st.std_id || st.id || '').trim();
                if (!studentTotals[sId]) studentTotals[sId] = 0;

                const rec = marksMap[sId];
                if (rec) {
                    let val = (rec.rawMark !== null && rec.rawMark !== undefined && rec.rawMark !== '') 
                        ? parseFloat(rec.rawMark) 
                        : (rec.cq !== null && rec.cq !== undefined ? (parseFloat(rec.cq) || 0) : null);
                    if (val !== null && !isNaN(val)) studentTotals[sId] += val;
                }
            });
        }

        students.sort((a, b) => {
            const idA = String(a.std_id || a.id || '').trim();
            const idB = String(b.std_id || b.id || '').trim();
            const totalA = studentTotals[idA] || 0;
            const totalB = studentTotals[idB] || 0;
            if (totalB !== totalA) return totalB - totalA;
            return idA.localeCompare(idB);
        });

        if (!manualGroupOverrides[targetExamId]) {
            manualGroupOverrides[targetExamId] = {};
        }

        const meritOrderedStudentIds = [];
        students.forEach((st, idx) => {
            const sId = String(st.std_id || st.id || '').trim();
            const meritRank = idx + 1;
            const assignedGroup = (meritRank <= 40) ? "Group A" : "Group B";
            manualGroupOverrides[targetExamId][sId] = assignedGroup;
            meritOrderedStudentIds.push(sId);
        });

        manualGroupOverrides[targetExamId + '_merit_order'] = meritOrderedStudentIds;

        await saveExamsToCloud();
        showCenterToast(`সফল হয়েছে! মেধা অনুযায়ী ১-৪০ জন Group A এবং ৪১-৮১ জন Group B সাজানো হয়েছে।`, true);

        window.loadEMStudentGroupAllocation();
    };

    // ১৩. স্টুডেন্ট টেবিল লোড করার ফাংশন (মেধা অনুযায়ী ক্রমিক ১ থেকে ৮১ সাজানো)
    window.loadEMStudentGroupAllocation = async function() {
        const select = document.getElementById('emTransferExamSelect');
        const tbody = document.getElementById('emStudentAllocationTbody');
        if (!select) return;

        const examId = select.value;
        const exam = examRegistry.find(x => x.id === examId);
        if (!exam) return;

        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:35px;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:26px; color:#2563eb;"></i></td></tr>`;
        }

        let rawStudents = await getRealStudentsForClass(exam.class);

        const savedMeritOrder = (manualGroupOverrides && manualGroupOverrides[exam.id + '_merit_order']) ? manualGroupOverrides[exam.id + '_merit_order'] : [];

        if (savedMeritOrder && savedMeritOrder.length > 0) {
            rawStudents.sort((a, b) => {
                const idA = String(a.std_id || a.id || '').trim();
                const idB = String(b.std_id || b.id || '').trim();
                let idxA = savedMeritOrder.indexOf(idA);
                let idxB = savedMeritOrder.indexOf(idB);
                if (idxA === -1) idxA = 99999;
                if (idxB === -1) idxB = 99999;
                return idxA - idxB;
            });
        } else {
            rawStudents.sort((a, b) => {
                return String(a.std_id || a.id).localeCompare(String(b.std_id || b.id));
            });
        }

        allocatedStudentsCache = rawStudents.map((st, idx) => {
            const slNumber = idx + 1;
            const studentId = String(st.std_id || st.id || '').trim();

            let assignedGroup = (slNumber <= 40) ? "Group A" : "Group B";

            if (manualGroupOverrides[exam.id] && manualGroupOverrides[exam.id][studentId]) {
                assignedGroup = manualGroupOverrides[exam.id][studentId];
            }

            return {
                sl: slNumber,
                id: studentId,
                name: st.student_name || st.name || 'Student',
                class: st.class_name || st.class || exam.class,
                group: assignedGroup
            };
        });

        selectedSingleStudentId = null;
        updateTopTransferBar();
        renderGroupFilterPills();
        emStudentCurrentPage = 1;
        renderEMPaginatedStudentTable();
    };

    function updateTopTransferBar() {
        const btnsBox = document.getElementById('emDynamicTransferBtns');
        const countBadge = document.getElementById('emSelectedCountBadge');
        if (!btnsBox) return;

        const selectedStudent = allocatedStudentsCache.find(s => s.id === selectedSingleStudentId);

        if (countBadge) {
            if (selectedStudent) {
                countBadge.innerHTML = `<span style="color:#2563eb; font-weight:800;">Selected:</span> <span style="color:#0f172a;">${selectedStudent.name} (SL #${selectedStudent.sl})</span>`;
            } else {
                countBadge.innerText = '0 Row Selected';
                countBadge.style.color = '#64748b';
            }
        }

        btnsBox.innerHTML = `
            <button type="button" class="em-btn-move em-btn-move-a" ${(!selectedStudent || selectedStudent.group === 'Group A') ? 'disabled' : ''} onclick="window.moveSingleSelectedStudent('Group A')">
                Move to Group A
            </button>
            <button type="button" class="em-btn-move em-btn-move-b" ${(!selectedStudent || selectedStudent.group === 'Group B') ? 'disabled' : ''} onclick="window.moveSingleSelectedStudent('Group B')">
                Move to Group B
            </button>
        `;
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
        const countA = allocatedStudentsCache.filter(s => s.group === 'Group A').length;
        const countB = allocatedStudentsCache.filter(s => s.group === 'Group B').length;

        container.innerHTML = `
            <button type="button" class="em-filter-pill-btn ${emSelectedGroupFilter === 'all' ? 'active' : ''}" onclick="window.setEMGroupFilter('all')">
                All Students (${total})
            </button>
            <button type="button" class="em-filter-pill-btn ${emSelectedGroupFilter === 'Group A' ? 'active' : ''}" onclick="window.setEMGroupFilter('Group A')">
                Group A (${countA})
            </button>
            <button type="button" class="em-filter-pill-btn ${emSelectedGroupFilter === 'Group B' ? 'active' : ''}" onclick="window.setEMGroupFilter('Group B')">
                Group B (${countB})
            </button>
        `;
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
        emStudentPageSize = parseInt(size) || 50;
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

            const tr = document.createElement('tr');
            if (isSelected) tr.classList.add('erp-row-selected');

            tr.onclick = () => window.toggleSingleStudentSelection(st.id);

            tr.innerHTML = `
                <td><strong>${st.sl}</strong></td>
                <td><strong>${st.id}</strong></td>
                <td><span style="font-weight:700;">${st.name}</span></td>
                <td>${st.class}</td>
                <td style="text-align: right;"><span class="em-group-badge">${st.group}</span></td>
            `;
            tbody.appendChild(tr);
        });

        const end = Math.min(startIndex + emStudentPageSize, totalFiltered);
        if (counterEl) {
            counterEl.innerText = `Showing ${startIndex + 1} to ${end} of ${totalFiltered} entries`;
        }

        if (btnsContainer) {
            let btnsHtml = `
                <button type="button" class="em-page-btn ${emStudentCurrentPage === 1 ? 'disabled' : ''}" onclick="window.goToEMStudentPage(1)">«</button>
                <button type="button" class="em-page-btn ${emStudentCurrentPage === 1 ? 'disabled' : ''}" onclick="window.goToEMStudentPage(${emStudentCurrentPage - 1})">&lt;</button>
            `;
            for (let p = 1; p <= totalPages; p++) {
                btnsHtml += `<button type="button" class="em-page-btn ${p === emStudentCurrentPage ? 'active' : ''}" onclick="window.goToEMStudentPage(${p})">${p}</button>`;
            }
            btnsHtml += `
                <button type="button" class="em-page-btn ${emStudentCurrentPage === totalPages ? 'disabled' : ''}" onclick="window.goToEMStudentPage(${emStudentCurrentPage + 1})">&gt;</button>
                <button type="button" class="em-page-btn ${emStudentCurrentPage === totalPages ? 'disabled' : ''}" onclick="window.goToEMStudentPage(${totalPages})">»</button>
            `;
            btnsContainer.innerHTML = btnsHtml;
        }
    }

    // ১৪. ব্ল্যাঙ্ক শিট প্রিন্ট মোডাল ও ইঞ্জিন
    window.openBlankSheetPrintModal = function() {
        const select = document.getElementById('emTransferExamSelect');
        const examId = select ? select.value : '';
        const exam = examRegistry.find(x => x.id === examId);
        if (!exam) {
            alert("Please select an exam first!");
            return;
        }

        const grpSelect = document.getElementById('modalBlankGroupSelect');
        const subSelect = document.getElementById('modalBlankSubjectSelect');

        grpSelect.innerHTML = `
            <option value="Group A">Group A (Top 40 Merit)</option>
            <option value="Group B">Group B (41-Rest Merit)</option>
        `;

        subSelect.innerHTML = '';
        const subs = exam.subjects || {};
        Object.keys(subs).forEach(s => {
            subSelect.innerHTML += `<option value="${s}" data-full="${subs[s] || 30}">${s} (Full Marks: ${subs[s] || 30})</option>`;
        });

        document.getElementById('emBlankSheetModal').style.display = 'flex';
    };

    window.closeBlankSheetPrintModal = function() {
        document.getElementById('emBlankSheetModal').style.display = 'none';
    };

    window.executeBlankSheetPrint = function() {
        const select = document.getElementById('emTransferExamSelect');
        const examId = select ? select.value : '';
        const exam = examRegistry.find(x => x.id === examId);
        if (!exam) return;

        const grpName = document.getElementById('modalBlankGroupSelect').value;
        const subSelect = document.getElementById('modalBlankSubjectSelect');
        const subName = subSelect.value;
        const opt = subSelect.options[subSelect.selectedIndex];
        const fullMark = opt ? opt.getAttribute('data-full') : '30';

        window.closeBlankSheetPrintModal();

        let groupStudents = allocatedStudentsCache.filter(s => s.group === grpName);
        if (groupStudents.length === 0) {
            alert(`No students found in ${grpName}!`);
            return;
        }

        const oldIframe = document.getElementById('em-blank-print-frame');
        if (oldIframe) oldIframe.remove();

        const iframe = document.createElement('iframe');
        iframe.id = 'em-blank-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '210mm';
        iframe.style.height = '297mm';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        let rowsHtml = '';
        groupStudents.forEach((st, idx) => {
            rowsHtml += `
                <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${st.id}</strong></td>
                    <td style="text-align:left; padding-left:10px; font-weight:600;">${st.name}</td>
                    <td><div style="width:55px; height:24px; border:1px solid #444; margin:0 auto; border-radius:4px;"></div></td>
                    <td></td>
                </tr>
            `;
        });

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Blank Evaluation Sheet - ${grpName}</title>
                <style>
                    @page { size: A4 portrait; margin: 8mm 8mm 12mm 8mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 0; }
                    .header { text-align: center; margin-bottom: 12px; }
                    .header h2 { font-size: 15.5px; font-weight: bold; margin: 0 0 4px; text-transform: uppercase; }
                    .header h3 { font-size: 13px; font-weight: bold; margin: 2px 0; color: #1e3a8a; }
                    .meta-bar { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; border: 1.2px solid #000; padding: 6px 12px; background: #f8fafc; margin-bottom: 12px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1.2px solid #000; padding: 4.5px 4px; font-size: 10.5px; text-align: center; }
                    th { background-color: #f1f5f9; font-weight: bold; }
                    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 55px; padding: 0 20px; font-size: 11px; font-weight: bold; page-break-inside: avoid; }
                    .sig-line { width: 180px; border-top: 1.2px solid #000; margin-bottom: 4px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>CANTONMENT PUBLIC SCHOOL AND COLLEGE LALMONIRHAT</h2>
                    <h3>${exam.name} • Blank Evaluation Sheet</h3>
                </div>
                <div class="meta-bar">
                    <div>Class: ${exam.class}</div>
                    <div>Group: ${grpName}</div>
                    <div>Subject: ${subName} (Full Marks: ${fullMark})</div>
                    <div>Date: ${exam.date || ''}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 8%;">SL</th>
                            <th style="width: 22%;">Student ID</th>
                            <th style="text-align: left; padding-left: 10px;">Student Name</th>
                            <th style="width: 20%;">Obtained Mark</th>
                            <th style="width: 25%;">Teacher's Signature</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
                <div class="footer">
                    <div>Printed Date: ${new Date().toLocaleDateString('en-GB')}</div>
                    <div style="text-align:center;">
                        <div class="sig-line"></div>
                        Subject Teacher's Signature
                    </div>
                </div>
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 400);
    };

    // ১৫. ট্যাব ও ওয়ার্কস্পেস ন্যাভিগেশন (১০০% ফিক্সড)
    window.switchEMMainTab = function(tabKey) {
        const btn1 = document.getElementById('emTabBtn1');
        const btn2 = document.getElementById('emTabBtn2');
        const content1 = document.getElementById('emTabContent1');
        const content2 = document.getElementById('emTabContent2');

        if (btn1) btn1.classList.remove('active');
        if (btn2) btn2.classList.remove('active');
        if (content1) content1.classList.remove('active');
        if (content2) content2.classList.remove('active');

        if (tabKey === 'createExam') {
            if (btn1) btn1.classList.add('active');
            if (content1) content1.classList.add('active');
        } else if (tabKey === 'transferModule') {
            if (btn2) btn2.classList.add('active');
            if (content2) content2.classList.add('active');
            populateEMExamDropdown();
            window.loadEMStudentGroupAllocation();
        }
    };

    function initDefaultEMGroupRules() {
        const container = document.getElementById('emGroupRulesContainer');
        if (!container) return;
        container.innerHTML = `
            <div class="em-group-row">
                <input type="text" class="g-name" value="Group A" style="width: 40%; font-weight:700;" readonly>
                <span style="font-size:0.85rem; font-weight:700; color:#2563eb;">Merit Rank 1 to 40</span>
            </div>
            <div class="em-group-row">
                <input type="text" class="g-name" value="Group B" style="width: 40%; font-weight:700;" readonly>
                <span style="font-size:0.85rem; font-weight:700; color:#059669;">Merit Rank 41 to 81</span>
            </div>
        `;
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
            <input type="text" class="g-from" value="${fromVal}" placeholder="From" style="width: 25%; text-align: center;">
            <span style="font-size:0.8rem; font-weight:700; color:#64748b;">to</span>
            <input type="text" class="g-to" value="${toVal}" placeholder="To" style="width: 25%; text-align: center;">
            <button type="button" class="em-btn-icon delete" style="width: 32px; height: 32px; margin-left: auto;" onclick="this.closest('.em-group-row').remove()" title="Remove"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    }

    window.setEMWorkspaceView = function(mode) {
        const grid = document.getElementById('emMainGrid');
        const formCol = document.getElementById('emFormCol');
        const historyCol = document.getElementById('emHistoryCol');

        const btnBoth = document.getElementById('emBtnShowBoth');
        const btnForm = document.getElementById('emBtnShowForm');
        const btnHistory = document.getElementById('emBtnShowHistory');

        if (btnBoth) btnBoth.classList.remove('active');
        if (btnForm) btnForm.classList.remove('active');
        if (btnHistory) btnHistory.classList.remove('active');

        if (mode === 'both') {
            if (grid) grid.style.gridTemplateColumns = '1fr 1fr';
            if (formCol) formCol.style.display = 'block';
            if (historyCol) historyCol.style.display = 'block';
            if (btnBoth) btnBoth.classList.add('active');
        } else if (mode === 'form') {
            if (grid) grid.style.gridTemplateColumns = '1fr';
            if (formCol) formCol.style.display = 'block';
            if (historyCol) historyCol.style.display = 'none';
            if (btnForm) btnForm.classList.add('active');
        } else if (mode === 'history') {
            if (grid) grid.style.gridTemplateColumns = '1fr';
            if (formCol) formCol.style.display = 'none';
            if (historyCol) historyCol.style.display = 'block';
            if (btnHistory) btnHistory.classList.add('active');
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
                    <i class="fa-solid fa-pen em-pill-btn" title="Edit" onclick="window.openEMEditSubjectModal(event, '${sub}')"></i>
                    <i class="fa-solid fa-xmark em-pill-btn" title="Remove" onclick="window.deleteEMSubjectPill(event, '${sub}')"></i>
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
            selectedSubjectsMap[sub] = 30;
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

        if (modalTitle) modalTitle.innerText = `Edit Subject: '${oldName}'`;
        if (inputField) inputField.value = oldName;
        if (overlay) overlay.style.display = 'flex';
        if (inputField) inputField.focus();

        if (confirmBtn) {
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
                window.closeEMModal();
            };
        }
    };

    window.closeEMModal = function() {
        const overlay = document.getElementById('emCustomModalOverlay');
        if (overlay) overlay.style.display = 'none';
    };

    window.deleteEMSubjectPill = function(e, sub) {
        e.stopPropagation();
        if (confirm(`Remove '${sub}' from active subject list?`)) {
            currentActiveSubjectsList = currentActiveSubjectsList.filter(s => s !== sub);
            delete selectedSubjectsMap[sub];
            renderEMPills();
            renderEMSelectedTable();
        }
    };

    window.addEMCustomSubject = function() {
        const inp = document.getElementById('emCustomSubInput');
        if (!inp) return;
        const name = inp.value.trim();
        if (!name) return;
        if (currentActiveSubjectsList.includes(name)) {
            alert("Subject already exists!");
            return;
        }
        currentActiveSubjectsList.push(name);
        selectedSubjectsMap[name] = 30;
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
                <td><strong>${sub}</strong></td>
                <td style="text-align: center;">
                    <input type="number" class="em-control" value="${m}" min="1" oninput="window.updateEMMark('${sub}', this.value)" style="width:75px; height:34px; text-align:center; font-weight:700;">
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
        const sourceSelect = document.getElementById('emSourceMeritExamSelect');
        if (!select) return;
        select.innerHTML = '';
        if (sourceSelect) sourceSelect.innerHTML = '<option value="">-- Choose Source Exam --</option>';

        if (examRegistry.length === 0) {
            select.innerHTML = '<option value="">No exams available</option>';
            return;
        }
        examRegistry.forEach(ex => {
            select.innerHTML += `<option value="${ex.id}">${ex.name} (${ex.class})</option>`;
            if (sourceSelect) {
                sourceSelect.innerHTML += `<option value="${ex.id}">${ex.name}</option>`;
            }
        });
    }

    // ১৬. এডিট, ডুপ্লিকেট, ডিলিট ও রিসেট
    window.editEMExam = function(id) {
        const exam = examRegistry.find(x => x.id === id);
        if (!exam) return;

        document.getElementById('emEditingId').value = exam.id;
        document.getElementById('emExamName').value = exam.name;
        document.getElementById('emClassName').value = exam.class;
        document.getElementById('emExamDate').value = exam.date;

        window.onEMClassChange(exam.class);
        selectedSubjectsMap = { ...exam.subjects };

        renderEMPills();
        renderEMSelectedTable();

        document.getElementById('emFormTitle').innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Assessment: ${exam.name}`;
        document.getElementById('emSubmitBtn').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Update In Firebase`;
        document.getElementById('emCancelEditBtn').style.display = 'block';

        window.switchEMMainTab('createExam');
        window.setEMWorkspaceView('form');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.duplicateEMExam = function(id) {
        const exam = examRegistry.find(x => x.id === id);
        if (!exam) return;

        document.getElementById('emEditingId').value = '';
        document.getElementById('emExamName').value = exam.name + " (Copy)";
        document.getElementById('emClassName').value = exam.class;
        document.getElementById('emExamDate').value = new Date().toISOString().split('T')[0];

        window.onEMClassChange(exam.class);
        selectedSubjectsMap = { ...exam.subjects };

        renderEMPills();
        renderEMSelectedTable();

        document.getElementById('emFormTitle').innerHTML = `<i class="fa-solid fa-copy"></i> Duplicate Assessment`;
        document.getElementById('emSubmitBtn').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save Duplicated to Firebase`;
        document.getElementById('emCancelEditBtn').style.display = 'block';

        window.switchEMMainTab('createExam');
        window.setEMWorkspaceView('form');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.deleteEMExam = async function(id) {
        if (confirm("Are you sure you want to delete this exam permanently from cloud?")) {
            examRegistry = examRegistry.filter(x => x.id !== id);
            await saveExamsToCloud();
            renderEMRegistry(false);
            populateEMExamDropdown();
            showCenterToast("Exam Deleted!");
        }
    };

    window.resetEMForm = function() {
        document.getElementById('emAssessmentForm').reset();
        document.getElementById('emEditingId').value = '';
        document.getElementById('emExamDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('emFormTitle').innerHTML = `<i class="fa-solid fa-file-pen"></i> Create New Examination`;
        document.getElementById('emSubmitBtn').innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save Directly to Firebase`;
        document.getElementById('emCancelEditBtn').style.display = 'none';
        initDefaultEMGroupRules();
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
