/* ==========================================================================
   MODULE: CPSCL Academic ERP
   SUB-SECTION: SSC-27 Preparatory Dynamic Exam & Group Manager (Pure Cloud Synced)
   Path: cpscl/ssc27_exam_manager.js
   Architecture: Firebase Modular SDK v9+ | Zero Hardcoding | 100% Vector Print
   Safety: Complete Isolation from Class 8 Scholarship Batch | Zero Data Loss
   ========================================================================== */

(function () {
    console.log("Loading CPSCL SSC-27 Suite (Pure Firebase Cloud Synced)...");

    const BS_STUDENT_IDS = ["602322", "601322", "700723", "802124", "903525"];

    // ১. স্টাইল ইনজেকশন
    function injectSSC27Styles() {
        if (document.getElementById('cpscl-ssc27-style')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-ssc27-style';
        style.innerHTML = `
            .s27-wrapper { padding: 15px 5px; font-family: 'Plus Jakarta Sans', sans-serif; }
            .s27-header { background: #ffffff; border: 1px solid #e2e8f0; padding: 18px 25px; border-radius: 50px !important; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
            .s27-header h1 { font-size: 1.3rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; margin: 0; }
            .s27-header h1 i { color: #059669; }
            .s27-badge { background: #ecfdf5; color: #059669; font-weight: 700; font-size: 0.82rem; padding: 6px 16px; border-radius: 50px !important; border: 1px solid #a7f3d0; }

            .s27-nav-tabs { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
            .s27-tab-btn { background: #ffffff; border: 1.5px solid #cbd5e1; color: #64748b; padding: 11px 24px; border-radius: 50px !important; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; user-select: none; }
            .s27-tab-btn:hover { border-color: #059669; color: #059669; }
            .s27-tab-btn.active { background: #059669 !important; color: #ffffff !important; border-color: #059669 !important; box-shadow: 0 4px 12px rgba(5,150,105,0.25); }

            .s27-tab-content { display: none; }
            .s27-tab-content.active { display: block; }

            .s27-card { background: #ffffff; border-radius: 16px; border: 1px solid #cbd5e1; padding: 22px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
            .s27-card-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
            .s27-card-title span { display: flex; align-items: center; gap: 8px; }
            .s27-card-title i { color: #059669; }

            .s27-form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
            .s27-form-group label { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
            .s27-control { width: 100%; height: 42px; border: 1.5px solid #cbd5e1; border-radius: 50px !important; padding: 0 18px; font-size: 0.9rem; outline: none; background: #ffffff; color: #0f172a; transition: 0.2s; }
            .s27-control:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1); }

            .s27-pills-box { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; margin-bottom: 12px; }
            .s27-pill { display: inline-flex; align-items: center; gap: 8px; background: #f0fdf4; color: #059669; border: 1.5px solid #bbf7d0; padding: 7px 16px; border-radius: 50px !important; font-size: 0.85rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; user-select: none; }
            .s27-pill:hover { background: #dcfce7; border-color: #059669; }
            .s27-pill.active { background: #059669 !important; color: #ffffff !important; }

            .s27-group-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; background: #f8fafc; padding: 8px 14px; border-radius: 50px !important; border: 1.5px solid #e2e8f0; }
            .s27-group-row input { height: 34px; border-radius: 50px !important; border: 1px solid #cbd5e1; padding: 0 14px; font-size: 0.85rem; font-weight: 700; outline: none; background: #ffffff; }

            .s27-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .s27-table th { background: #ffffff; color: #64748b; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 12px 16px; border-bottom: 1.5px solid #eef2f5; text-align: left; }
            .s27-table tbody td { color: #334155; font-size: 0.88rem; font-weight: 500; padding: 12px 16px; border-bottom: 1px solid #eef2f5; }
            .s27-table tbody tr:hover { background-color: #f8fafc; cursor: pointer; }
            .s27-table tbody tr.selected { background-color: #ecfdf5 !important; border-left: 4px solid #059669; }

            .s27-btn-submit { background: #059669 !important; color: #fff !important; border: none; width: 100%; height: 46px; border-radius: 50px !important; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; box-shadow: 0 4px 12px rgba(5,150,105,0.25); }
            .s27-btn-submit:hover { background: #047857 !important; }
            .s27-btn-add { background: #f8fafc; border: 1.5px dashed #cbd5e1; color: #059669; padding: 6px 18px; border-radius: 50px !important; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: 0.2s; }
            .s27-btn-add:hover { background: #ecfdf5; border-color: #059669; }
            .s27-btn-add.active { background: #059669 !important; color: #ffffff !important; border-style: solid !important; }

            .s27-group-badge { display: inline-block; padding: 4px 14px; border-radius: 50px !important; font-size: 0.8rem; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
            .s27-btn-icon { width: 34px; height: 34px; border-radius: 50px !important; border: 1.5px solid #cbd5e1; background: #ffffff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: 0.2s; margin: 0 2px; }
            .s27-btn-icon.delete { color: #dc2626; }
            .s27-btn-icon.delete:hover { background: #fee2e2; border-color: #dc2626; }
        `;
        document.head.appendChild(style);
    }

    // ২. সাইডবার সাবমেনু ইনজেকশন
    function injectSSC27Sidebar() {
        const subList = document.getElementById('trust-exam-submenu-items');
        if (!subList) {
            setTimeout(injectSSC27Sidebar, 200);
            return;
        }

        if (document.getElementById('sub-link-ssc27-exam')) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <a class="trust-sub-link" id="sub-link-ssc27-exam" onclick="window.openSSC27ExamView(this)">
                <span class="trust-sub-indicator" style="background: #059669;"></span>
                <span style="font-weight: 700; color: #059669;">SSC 27 Preparatory</span>
            </a>
        `;
        subList.appendChild(li);
    }

    window.openSSC27ExamView = function (element) {
        document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
        if (element) element.classList.add('active');

        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "CPSCL - SSC 27 Preparatory Management Suite";

        renderSSC27UI();
    };

    // ৩. গ্লোবাল ডাটা স্টেট
    let s27ExamRegistry = [];
    let s27SelectedSubjects = {};
    let s27AllocatedStudents = [];
    let s27SelectedStudentId = null;
    let s27CurrentGroupFilter = 'all';
    let s27GroupOverrides = {};

    try {
        const cached = localStorage.getItem('cpscl_ssc27_exams_registry');
        if (cached) s27ExamRegistry = JSON.parse(cached);
    } catch (e) {}

    // ৪. ক্লাউড ফাংশন (Firebase Modular SDK v9+ ও Namespaced ডুয়াল সাপোর্ট)
    async function getFirebaseCloudInstance() {
        if (typeof window.getDatabase === 'function' && typeof window.ref === 'function') {
            return {
                mode: 'modular',
                db: window.getDatabase(),
                ref: window.ref,
                get: window.get,
                set: window.set
            };
        }
        if (window.db && typeof window.db.ref === 'function') {
            return { mode: 'compat', db: window.db };
        }
        if (window.firebase && typeof window.firebase.database === 'function') {
            return { mode: 'compat', db: window.firebase.database() };
        }
        return null;
    }

    async function saveSSC27ExamsToCloud() {
        localStorage.setItem('cpscl_ssc27_exams_registry', JSON.stringify(s27ExamRegistry));
        const fb = await getFirebaseCloudInstance();
        if (fb) {
            try {
                if (fb.mode === 'modular') {
                    await fb.set(fb.ref(fb.db, 'cpscl_ssc27_exams'), s27ExamRegistry);
                } else {
                    await fb.db.ref('cpscl_ssc27_exams').set(s27ExamRegistry);
                }
            } catch (err) {
                console.warn("Cloud save warning:", err);
            }
        }
        return true;
    }

    async function loadSSC27ExamsFromCloud() {
        const fb = await getFirebaseCloudInstance();
        if (fb) {
            try {
                let data = null;
                if (fb.mode === 'modular') {
                    const snap = await fb.get(fb.ref(fb.db, 'cpscl_ssc27_exams'));
                    if (snap.exists()) data = snap.val();

                    const snapOv = await fb.get(fb.ref(fb.db, 'cpscl_ssc27_group_overrides'));
                    if (snapOv.exists()) s27GroupOverrides = snapOv.val() || {};
                } else {
                    const snap = await fb.db.ref('cpscl_ssc27_exams').once('value');
                    if (snap.exists()) data = snap.val();

                    const snapOv = await fb.db.ref('cpscl_ssc27_group_overrides').once('value');
                    if (snapOv.exists()) s27GroupOverrides = snapOv.val() || {};
                }

                if (data) {
                    s27ExamRegistry = Array.isArray(data) ? data : Object.values(data);
                    localStorage.setItem('cpscl_ssc27_exams_registry', JSON.stringify(s27ExamRegistry));
                    renderSSC27ExamList();
                    populateSSC27ExamDropdown();
                }
            } catch (e) {
                console.warn("Cloud load warning:", e);
            }
        }
    }

    // ৫. শিক্ষার্থীদের আসল ক্লাউড ফেচিং ইঞ্জিন (Pure Cloud + Cache Backup)
    async function getRealStudents() {
        let allStudents = [];
        const fb = await getFirebaseCloudInstance();

        // ১. সরাসরি ক্লাউড ডাটাবেজ রিড (যে কোনো কম্পিউটার বা মোবাইল থেকে শতভাগ কাজ করবে)
        if (fb) {
            try {
                if (fb.mode === 'modular') {
                    const snap = await fb.get(fb.ref(fb.db, 'cpscl_students'));
                    if (snap.exists()) {
                        const val = snap.val();
                        allStudents = Array.isArray(val) ? val : Object.values(val);
                    }
                } else {
                    const snap = await fb.db.ref('cpscl_students').once('value');
                    if (snap.exists()) {
                        const val = snap.val();
                        allStudents = Array.isArray(val) ? val : Object.values(val);
                    }
                }
            } catch (err) {
                console.warn("Direct Firebase fetch error, checking backup cache:", err);
            }
        }

        // ২. ক্লাউড রেসপন্স না পেলে ক্যাশ রিডার ব্যাকআপ
        if (allStudents.length === 0) {
            try {
                const cached = localStorage.getItem('cpscl_students_cache');
                if (cached) allStudents = JSON.parse(cached);
            } catch (e) {}
        }

        // ৩. ক্যাশ আপডেট রাখা
        if (allStudents.length > 0) {
            try { localStorage.setItem('cpscl_students_cache', JSON.stringify(allStudents)); } catch (e) {}
        }

        console.log(`[SSC27 Suite] Total students retrieved from cloud/cache: ${allStudents.length}`);

        // ৪. এসএসসি-২৭ ব্যাচ (১৭৩ জন) আলাদা করার নিরাপদ ফিল্টার
        return allStudents.filter(s => {
            const cName = String(s.class_name || s.class || s['Class Name *'] || '').trim().toLowerCase();
            const bName = String(s.section_batch || s.section || s.batch || s['Section/Batch *'] || '').trim().toLowerCase();

            const isClass10 = cName.includes('10') || cName.includes('ten') || cName.includes('ssc');
            const isSSC27 = bName.includes('ssc') || bName.includes('27') || bName.includes('prep');
            const isClass8 = cName.includes('eight') || cName.includes('8') || bName.includes('scholarship');

            return (isClass10 || isSSC27) && !isClass8;
        });
    }

    // ৬. মূল ইউজার ইন্টারফেস
    async function renderSSC27UI() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        let panel = document.getElementById('cpscl-ssc27-main-view');
        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'view-panel active';
            panel.id = 'cpscl-ssc27-main-view';
            mainWrapper.appendChild(panel);
        }
        panel.classList.add('active');

        panel.innerHTML = `
            <div class="s27-wrapper">
                <div class="s27-header">
                    <h1><i class="fa-solid fa-graduation-cap"></i> SSC 27 Preparatory Management Suite</h1>
                    <div class="s27-badge"><i class="fa-solid fa-cloud-arrow-up"></i> Pure Cloud Synced</div>
                </div>

                <div class="s27-nav-tabs">
                    <button type="button" class="s27-tab-btn active" id="s27TabBtn1" onclick="window.switchSSC27Tab('tab1')">
                        <i class="fa-solid fa-file-pen"></i> 1. Exam Setup
                    </button>
                    <button type="button" class="s27-tab-btn" id="s27TabBtn2" onclick="window.switchSSC27Tab('tab2')">
                        <i class="fa-solid fa-shuffle"></i> 2. Merit Group Allocation & Seating
                    </button>
                </div>

                <!-- TAB 1: Exam Setup -->
                <div class="s27-tab-content active" id="s27TabContent1">
                    <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px;">
                        <div class="s27-card">
                            <div class="s27-card-title">
                                <span><i class="fa-solid fa-file-pen"></i> Create New Preparatory Test</span>
                            </div>

                            <form id="s27ExamForm" onsubmit="window.handleSSC27Submit(event)">
                                <div class="s27-form-group">
                                    <label>Exam Title *</label>
                                    <input type="text" id="s27ExamName" class="s27-control" placeholder="e.g., Preparatory Daily Test - Day 01" required>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="s27-form-group">
                                        <label>Target Class *</label>
                                        <input type="text" id="s27ClassName" class="s27-control" value="Class 10" required>
                                    </div>
                                    <div class="s27-form-group">
                                        <label>Exam Date *</label>
                                        <input type="date" id="s27ExamDate" class="s27-control" value="2026-11-16" required>
                                    </div>
                                </div>

                                <div class="s27-form-group" style="margin-top: 14px;">
                                    <label>Add Subjects & Assign Full Marks (Default: 20)</label>
                                    <div class="s27-pills-box" id="s27QuickPills"></div>

                                    <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                                        <input type="text" id="s27CustomSubInput" class="s27-control" placeholder="Write custom subject name...">
                                        <input type="number" id="s27CustomSubMark" class="s27-control" style="width: 100px; text-align: center;" value="20" placeholder="Marks">
                                        <button type="button" class="s27-btn-add" onclick="window.addSSC27CustomSubject()"><i class="fa-solid fa-plus"></i> Add</button>
                                    </div>

                                    <div id="s27SelectedSubsBox" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px;">
                                        <table class="s27-table">
                                            <thead>
                                                <tr>
                                                    <th>SUBJECT</th>
                                                    <th style="width: 110px; text-align: center;">FULL MARKS</th>
                                                    <th style="width: 60px; text-align: right;">ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody id="s27SelectedSubsTbody"></tbody>
                                        </table>
                                    </div>
                                </div>

                                <div class="s27-form-group" style="margin-top: 20px; border-top: 2px solid #f1f5f9; padding-top: 15px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                        <label style="margin: 0;"><i class="fa-solid fa-layer-group" style="color: #059669;"></i> Dynamic Groups & Merit Cutoffs</label>
                                        <button type="button" class="s27-btn-add" onclick="window.addSSC27GroupRow('', '', '')"><i class="fa-solid fa-plus"></i> Add Group</button>
                                    </div>
                                    <span style="font-size: 0.78rem; color: #64748b; margin-bottom: 10px; display: block;">
                                        ইনপুট বক্সে ইচ্ছামতো টাইপ করে গ্রুপ ও মেধার রেঞ্জ পরিবর্তন করা যাবে:
                                    </span>
                                    <div id="s27GroupRulesContainer"></div>
                                </div>

                                <button type="submit" class="s27-btn-submit">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> Save Preparatory Exam Directly to Cloud
                                </button>
                            </form>
                        </div>

                        <div class="s27-card">
                            <div class="s27-card-title">
                                <span><i class="fa-solid fa-clock-rotate-left"></i> Published Preparatory Exams</span>
                            </div>
                            <div style="overflow-x: auto;">
                                <table class="s27-table">
                                    <thead>
                                        <tr>
                                            <th>EXAM TITLE</th>
                                            <th>DATE</th>
                                            <th style="text-align: right;">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody id="s27ExamListTbody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TAB 2: Merit Allocation & Blank Sheets -->
                <div class="s27-tab-content" id="s27TabContent2">
                    <div class="s27-card">
                        <div class="s27-card-title">
                            <span><i class="fa-solid fa-users-viewfinder"></i> Student Group Allocation & Isolated Blank Print</span>
                            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                                <select id="s27TargetExamSelect" class="s27-control" style="width: 310px; height: 38px; font-size: 0.85rem;" onchange="window.loadSSC27StudentAllocation()">
                                </select>
                                <button type="button" class="s27-btn-add" style="background:#059669; color:#fff; border:none; padding: 8px 20px;" onclick="window.openSSC27BlankPrintModal()">
                                    <i class="fa-solid fa-print"></i> Print Isolated Blank Sheet
                                </button>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 50px; padding: 10px 20px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                            <input type="text" id="s27StudentSearch" class="s27-control" style="max-width: 320px; height: 38px;" placeholder="Search student by Name or ID..." oninput="window.filterSSC27Students()">
                            
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span id="s27SelectedLabel" style="font-size: 0.85rem; font-weight: 700; color: #64748b;">0 Selected</span>
                                <select id="s27TransferGroupSelect" class="s27-control" style="width: 220px; height: 38px;">
                                    <option value="">-- Shift to Group --</option>
                                </select>
                                <button type="button" class="s27-btn-add" style="background: #2563eb; color: #fff; border: none; height: 38px;" onclick="window.moveSelectedStudentToGroup()">
                                    Transfer
                                </button>
                            </div>
                        </div>

                        <div id="s27GroupFilterPills" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;"></div>

                        <div style="overflow-x: auto; border: 1px solid #eef2f5; border-radius: 8px;">
                            <table class="s27-table">
                                <thead>
                                    <tr>
                                        <th style="width: 70px;">SL #</th>
                                        <th style="width: 140px;">STUDENT ID</th>
                                        <th>STUDENT NAME</th>
                                        <th style="text-align: right; width: 220px;">ASSIGNED TRACK / GROUP</th>
                                    </tr>
                                </thead>
                                <tbody id="s27StudentTableTbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ব্ল্যাঙ্ক শিট মোডাল -->
            <div id="s27BlankModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:999999; display:none; align-items:center; justify-content:center;">
                <div style="background:#fff; border-radius:20px; width:90%; max-width:440px; padding:24px; box-shadow:0 15px 35px rgba(0,0,0,0.25);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
                        <h4 style="margin:0; font-size:1.05rem; font-weight:800; color:#0f172a;"><i class="fa-solid fa-print" style="color:#059669;"></i> Print Isolated Blank Sheet</h4>
                        <button type="button" onclick="window.closeSSC27BlankModal()" style="border:none; background:none; font-size:1.3rem; cursor:pointer; color:#64748b;">✕</button>
                    </div>
                    <div class="s27-form-group">
                        <label>Select Track / Group to Print</label>
                        <select id="s27ModalGroupSelect" class="s27-control"></select>
                    </div>
                    <div class="s27-form-group">
                        <label>Select Subject</label>
                        <select id="s27ModalSubjectSelect" class="s27-control"></select>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                        <button type="button" class="s27-btn-add" onclick="window.closeSSC27BlankModal()">Cancel</button>
                        <button type="button" class="s27-btn-add" style="background:#059669; color:#fff; border:none;" onclick="window.executeSSC27BlankPrint()">
                            <i class="fa-solid fa-print"></i> Print Clean Vector Sheet
                        </button>
                    </div>
                </div>
            </div>
        `;

        initSSC27DefaultForm();
        renderSSC27ExamList();
        populateSSC27ExamDropdown();
        await loadSSC27ExamsFromCloud();
    }

    // ৭. ট্যাব স্যুইচিং
    window.switchSSC27Tab = function (tabKey) {
        document.getElementById('s27TabBtn1').classList.toggle('active', tabKey === 'tab1');
        document.getElementById('s27TabBtn2').classList.toggle('active', tabKey === 'tab2');
        document.getElementById('s27TabContent1').style.display = tabKey === 'tab1' ? 'block' : 'none';
        document.getElementById('s27TabContent2').style.display = tabKey === 'tab2' ? 'block' : 'none';

        if (tabKey === 'tab2') {
            populateSSC27ExamDropdown();
            window.loadSSC27StudentAllocation();
        }
    };

    // ৮. ডাইনামিক গ্রুপ রো যুক্ত করা
    window.addSSC27GroupRow = function (name = '', from = '', to = '') {
        const container = document.getElementById('s27GroupRulesContainer');
        if (!container) return;
        const row = document.createElement('div');
        row.className = 's27-group-row';
        row.innerHTML = `
            <input type="text" class="g-name" value="${name}" placeholder="Group Name" style="width: 40%; font-weight:700;">
            <input type="text" class="g-from" value="${from}" placeholder="From" style="width: 25%; text-align: center;">
            <span style="font-size:0.8rem; font-weight:700; color:#64748b;">to</span>
            <input type="text" class="g-to" value="${to}" placeholder="To" style="width: 25%; text-align: center;">
            <button type="button" class="s27-btn-icon delete" onclick="this.closest('.s27-group-row').remove()" title="Remove Group"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    };

    function initSSC27DefaultForm() {
        const container = document.getElementById('s27GroupRulesContainer');
        if (container) {
            container.innerHTML = '';
            window.addSSC27GroupRow("Group A (Science)", "1", "55");
            window.addSSC27GroupRow("Group B (Science)", "56", "105");
            window.addSSC27GroupRow("Group C (Science)", "106", "146");
            window.addSSC27GroupRow("Group D (Humanities)", "1", "22");
            window.addSSC27GroupRow("Group D (Business Studies)", "1", "5");
        }

        const defaultSubs = ["Physics", "Chemistry", "Biology", "Mathematics", "General Science", "Religion", "Accounting", "Geography", "Finance", "History", "Civics", "ICT"];
        const quickArea = document.getElementById('s27QuickPills');
        if (quickArea) {
            quickArea.innerHTML = '';
            defaultSubs.forEach(sub => {
                const p = document.createElement('div');
                p.className = 's27-pill';
                p.innerHTML = `<span>${sub}</span> <i class="fa-solid fa-plus" style="font-size:0.75rem;"></i>`;
                p.onclick = () => {
                    s27SelectedSubjects[sub] = 20;
                    renderSSC27SelectedSubjects();
                };
                quickArea.appendChild(p);
            });
        }
    }

    window.addSSC27CustomSubject = function () {
        const nameInput = document.getElementById('s27CustomSubInput');
        const markInput = document.getElementById('s27CustomSubMark');
        if (!nameInput) return;
        const name = nameInput.value.trim();
        const mark = parseInt(markInput.value) || 20;

        if (!name) return;
        s27SelectedSubjects[name] = mark;
        nameInput.value = '';
        renderSSC27SelectedSubjects();
    };

    function renderSSC27SelectedSubjects() {
        const tbody = document.getElementById('s27SelectedSubsTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        Object.keys(s27SelectedSubjects).forEach(sub => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${sub}</strong></td>
                <td style="text-align: center;">
                    <input type="number" class="s27-control" value="${s27SelectedSubjects[sub]}" min="1" style="width: 70px; height: 32px; text-align: center; font-weight: 700;" oninput="s27SelectedSubjects['${sub}'] = parseInt(this.value) || 0;">
                </td>
                <td style="text-align: right;">
                    <button type="button" class="s27-btn-icon delete" onclick="delete s27SelectedSubjects['${sub}']; renderSSC27SelectedSubjects();"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // ৯. ফর্ম সাবমিশন
    window.handleSSC27Submit = async function (e) {
        e.preventDefault();
        const name = document.getElementById('s27ExamName').value.trim();
        const className = document.getElementById('s27ClassName').value.trim();
        const date = document.getElementById('s27ExamDate').value;

        if (Object.keys(s27SelectedSubjects).length === 0) {
            alert("অনুগ্রহ করে অন্তত একটি বিষয় সিলেক্ট বা যোগ করুন!");
            return;
        }

        const groups = [];
        document.querySelectorAll('#s27GroupRulesContainer .s27-group-row').forEach(row => {
            const gName = row.querySelector('.g-name').value.trim();
            const gFrom = row.querySelector('.g-from').value.trim();
            const gTo = row.querySelector('.g-to').value.trim();
            if (gName) groups.push({ name: gName, from: gFrom, to: gTo });
        });

        const examObj = {
            id: 'SSC27_EX_' + Date.now(),
            name,
            class: className,
            date,
            subjects: { ...s27SelectedSubjects },
            groups,
            createdAt: new Date().toISOString()
        };

        s27ExamRegistry.unshift(examObj);
        await saveSSC27ExamsToCloud();
        alert("পরীক্ষা সফলভাবে ক্লাউডে সংরক্ষিত হয়েছে!");

        document.getElementById('s27ExamForm').reset();
        s27SelectedSubjects = {};
        renderSSC27SelectedSubjects();
        initSSC27DefaultForm();
        renderSSC27ExamList();
        populateSSC27ExamDropdown();
    };

    function renderSSC27ExamList() {
        const tbody = document.getElementById('s27ExamListTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (s27ExamRegistry.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#94a3b8; padding:20px;">No SSC-27 exams created yet.</td></tr>`;
            return;
        }

        s27ExamRegistry.forEach(ex => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${ex.name}</strong><br><small style="color:#64748b;">${ex.groups.length} Groups Configured</small></td>
                <td>${ex.date}</td>
                <td style="text-align: right;">
                    <button type="button" class="s27-btn-icon delete" onclick="window.deleteSSC27Exam('${ex.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.deleteSSC27Exam = async function (id) {
        if (confirm("Are you sure to delete this exam?")) {
            s27ExamRegistry = s27ExamRegistry.filter(x => x.id !== id);
            await saveSSC27ExamsToCloud();
            renderSSC27ExamList();
            populateSSC27ExamDropdown();
        }
    };

    function populateSSC27ExamDropdown() {
        const select = document.getElementById('s27TargetExamSelect');
        if (!select) return;
        select.innerHTML = '';
        if (s27ExamRegistry.length === 0) {
            select.innerHTML = '<option value="">No SSC-27 Exam Created</option>';
            return;
        }
        s27ExamRegistry.forEach(ex => {
            select.innerHTML += `<option value="${ex.id}">${ex.name} (${ex.date})</option>`;
        });
    }

    // ১০. স্টুডেন্ট এলোকেশন ও ফায়ারবেস ক্লাউড ম্যাপিং
    window.loadSSC27StudentAllocation = async function () {
        const select = document.getElementById('s27TargetExamSelect');
        const tbody = document.getElementById('s27StudentTableTbody');
        if (!select || !select.value) return;

        const exam = s27ExamRegistry.find(x => x.id === select.value);
        if (!exam) return;

        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:24px; color:#059669;"></i></td></tr>`;

        const students = await getRealStudents();
        const configuredGroups = exam.groups || [];

        const transferSel = document.getElementById('s27TransferGroupSelect');
        if (transferSel) {
            transferSel.innerHTML = '<option value="">-- Shift to Group --</option>';
            configuredGroups.forEach(g => {
                transferSel.innerHTML += `<option value="${g.name}">${g.name}</option>`;
            });
        }

        s27AllocatedStudents = students.map((st, idx) => {
            const sl = idx + 1;
            const sId = String(st.student_id || st.std_id || st.id || st['Student ID *'] || '').trim();
            const sName = String(st.name_english || st.student_name || st.name || st['Name (English) *'] || 'Student').trim();

            let assignedGroup = configuredGroups[0] ? configuredGroups[0].name : 'Group A (Science)';

            // ব্যবসায় শিক্ষা ও মানবিক স্বয়ংক্রিয় বিভাজন
            if (BS_STUDENT_IDS.includes(sId)) {
                assignedGroup = "Group D (Business Studies)";
            } else if (sl > 146 || (st.sec === 'HUM' || (st.student_category && st.student_category.includes('HUM')))) {
                assignedGroup = "Group D (Humanities)";
            } else {
                if (sl <= 55) assignedGroup = "Group A (Science)";
                else if (sl <= 105) assignedGroup = "Group B (Science)";
                else assignedGroup = "Group C (Science)";
            }

            // ক্লাউড ওভাররাইড থাকলে তা প্রাধান্য পাবে
            if (s27GroupOverrides[exam.id] && s27GroupOverrides[exam.id][sId]) {
                assignedGroup = s27GroupOverrides[exam.id][sId];
            }

            return {
                sl,
                id: sId,
                name: sName,
                group: assignedGroup
            };
        });

        renderSSC27FilterPills(configuredGroups);
        renderSSC27StudentTable();
    };

    function renderSSC27FilterPills(configuredGroups) {
        const container = document.getElementById('s27GroupFilterPills');
        if (!container) return;

        let html = `
            <button type="button" class="s27-btn-add ${s27CurrentGroupFilter === 'all' ? 'active' : ''}" onclick="window.setSSC27Filter('all')">
                All Students (${s27AllocatedStudents.length})
            </button>
        `;

        configuredGroups.forEach(g => {
            const count = s27AllocatedStudents.filter(s => s.group === g.name).length;
            const isActive = s27CurrentGroupFilter === g.name;
            html += `
                <button type="button" class="s27-btn-add ${isActive ? 'active' : ''}" onclick="window.setSSC27Filter('${g.name}')">
                    ${g.name} (${count})
                </button>
            `;
        });
        container.innerHTML = html;
    }

    window.setSSC27Filter = function (grp) {
        s27CurrentGroupFilter = grp;
        const exam = s27ExamRegistry.find(x => x.id === document.getElementById('s27TargetExamSelect').value);
        renderSSC27FilterPills(exam ? exam.groups : []);
        renderSSC27StudentTable();
    };

    function renderSSC27StudentTable() {
        const tbody = document.getElementById('s27StudentTableTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const filtered = s27AllocatedStudents.filter(s => {
            return (s27CurrentGroupFilter === 'all' || s.group === s27CurrentGroupFilter);
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:25px; color:#94a3b8;">No students found in this group.</td></tr>`;
            return;
        }

        filtered.forEach(st => {
            const isSelected = s27SelectedStudentId === st.id;
            const tr = document.createElement('tr');
            if (isSelected) tr.classList.add('selected');
            tr.onclick = () => {
                s27SelectedStudentId = isSelected ? null : st.id;
                document.getElementById('s27SelectedLabel').innerText = s27SelectedStudentId ? `Selected: ${st.name}` : `0 Selected`;
                renderSSC27StudentTable();
            };
            tr.innerHTML = `
                <td><strong>${st.sl}</strong></td>
                <td><strong>${st.id}</strong></td>
                <td><span style="font-weight:600;">${st.name}</span></td>
                <td style="text-align: right;"><span class="s27-group-badge">${st.group}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.moveSelectedStudentToGroup = async function () {
        if (!s27SelectedStudentId) {
            alert("প্রথমে তালিকা থেকে একজন শিক্ষার্থী সিলেক্ট করুন!");
            return;
        }
        const targetGroup = document.getElementById('s27TransferGroupSelect').value;
        if (!targetGroup) {
            alert("কোন গ্রুপে ট্রান্সফার করবেন তা সিলেক্ট করুন!");
            return;
        }

        const examId = document.getElementById('s27TargetExamSelect').value;
        const student = s27AllocatedStudents.find(s => s.id === s27SelectedStudentId);
        if (student) {
            student.group = targetGroup;
            if (!s27GroupOverrides[examId]) s27GroupOverrides[examId] = {};
            s27GroupOverrides[examId][student.id] = targetGroup;

            // ক্লাউডে সংরক্ষণ
            const fb = await getFirebaseCloudInstance();
            if (fb) {
                try {
                    if (fb.mode === 'modular') {
                        await fb.set(fb.ref(fb.db, 'cpscl_ssc27_group_overrides'), s27GroupOverrides);
                    } else {
                        await fb.db.ref('cpscl_ssc27_group_overrides').set(s27GroupOverrides);
                    }
                } catch(e){}
            }

            s27SelectedStudentId = null;
            document.getElementById('s27SelectedLabel').innerText = '0 Selected';
            const exam = s27ExamRegistry.find(x => x.id === examId);
            renderSSC27FilterPills(exam ? exam.groups : []);
            renderSSC27StudentTable();
        }
    };

    // ১১. আইসোলেটেড ব্ল্যাঙ্ক শিট ভেক্টর প্রিন্ট (মানবিক ও ব্যবসা শিক্ষা আলাদা শিট)
    window.openSSC27BlankPrintModal = function () {
        const examId = document.getElementById('s27TargetExamSelect').value;
        const exam = s27ExamRegistry.find(x => x.id === examId);
        if (!exam) {
            alert("Please select an exam first!");
            return;
        }

        const groupSel = document.getElementById('s27ModalGroupSelect');
        const subSel = document.getElementById('s27ModalSubjectSelect');

        groupSel.innerHTML = '';
        (exam.groups || []).forEach(g => {
            const count = s27AllocatedStudents.filter(s => s.group === g.name).length;
            groupSel.innerHTML += `<option value="${g.name}">${g.name} (${count} Students)</option>`;
        });

        subSel.innerHTML = '';
        Object.keys(exam.subjects || {}).forEach(s => {
            subSel.innerHTML += `<option value="${s}" data-mark="${exam.subjects[s]}">${s} (Full Mark: ${exam.subjects[s]})</option>`;
        });

        document.getElementById('s27BlankModal').style.display = 'flex';
    };

    window.closeSSC27BlankModal = function () {
        document.getElementById('s27BlankModal').style.display = 'none';
    };

    window.executeSSC27BlankPrint = function () {
        const examId = document.getElementById('s27TargetExamSelect').value;
        const exam = s27ExamRegistry.find(x => x.id === examId);
        if (!exam) return;

        const targetGroup = document.getElementById('s27ModalGroupSelect').value;
        const subSel = document.getElementById('s27ModalSubjectSelect');
        const subName = subSel.value;
        const fullMark = subSel.options[subSel.selectedIndex].getAttribute('data-mark') || '20';

        window.closeSSC27BlankModal();

        const printStudents = s27AllocatedStudents.filter(s => s.group === targetGroup);
        if (printStudents.length === 0) {
            alert(`No students found in ${targetGroup}!`);
            return;
        }

        const oldIframe = document.getElementById('s27-print-frame');
        if (oldIframe) oldIframe.remove();

        const iframe = document.createElement('iframe');
        iframe.id = 's27-print-frame';
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '210mm';
        iframe.style.height = '297mm';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        let rowsHtml = '';
        printStudents.forEach((st, idx) => {
            rowsHtml += `
                <tr>
                    <td>${idx + 1}</td>
                    <td><strong>${st.id}</strong></td>
                    <td style="text-align: left; padding-left: 14px; font-weight: 600;">${st.name}</td>
                    <td><div style="width: 60px; height: 24px; border: 1.2px solid #333; margin: 0 auto; border-radius: 4px;"></div></td>
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
                <title>Blank Evaluation Sheet - ${targetGroup}</title>
                <style>
                    @page { size: A4 portrait; margin: 10mm 10mm 12mm 10mm; }
                    * { box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; color: #000; margin: 0; padding: 0; }
                    .header { text-align: center; margin-bottom: 12px; }
                    .header h2 { font-size: 15px; font-weight: bold; margin: 0 0 4px; text-transform: uppercase; }
                    .header h3 { font-size: 13px; font-weight: bold; margin: 2px 0; color: #059669; text-transform: uppercase; }
                    .meta-bar { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; border: 1.2px solid #000; padding: 7px 12px; background: #f8fafc; margin-bottom: 12px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { border: 1.2px solid #000; padding: 5px 6px; font-size: 11px; text-align: center; }
                    th { background-color: #f1f5f9; font-weight: bold; text-transform: uppercase; }
                    .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; padding: 0 20px; font-size: 11px; font-weight: bold; page-break-inside: avoid; }
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
                    <div>Track / Group: ${targetGroup}</div>
                    <div>Subject: ${subName} (Full Marks: ${fullMark})</div>
                    <div>Date: ${exam.date || ''}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width: 8%;">SL</th>
                            <th style="width: 22%;">Student ID</th>
                            <th style="text-align: left; padding-left: 14px;">Student Name</th>
                            <th style="width: 20%;">Obtained Mark</th>
                            <th style="width: 25%;">Teacher's Signature</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
                <div class="footer">
                    <div>Printed: ${new Date().toLocaleDateString('en-GB')}</div>
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

    // ১২. বুটস্ট্র্যাপ
    function init() {
        injectSSC27Styles();
        injectSSC27Sidebar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
