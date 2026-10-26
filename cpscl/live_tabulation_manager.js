/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Live Tabulation & Result Sheet Engine (Full Master Pro)
   Path: cpscl/live_tabulation_manager.js
   Architecture: Zero Omission | Auto-Hide Unexamined Subjects | Dynamic Full Marks
   Sorting: Pure Merit Ordering (Fallback to Source Merit) | Zero Roll Column
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Live Tabulation Master Engine (Pure Merit & Auto-Hide Active)...");

    // ১. সাইডবারে Exam Manager ড্রপডাউনে "Live Tabulation" মেনু ইনজেক্ট করা
    function injectLiveTabulationSidebar() {
        const examSubmenu = document.getElementById('trust-exam-submenu-items');
        if (!examSubmenu) {
            setTimeout(injectLiveTabulationSidebar, 200);
            return;
        }

        if (document.getElementById('sub-link-live-tabulation')) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <a class="trust-sub-link" id="sub-link-live-tabulation" onclick="window.switchCPSCLExamSubTab(this, 'live-tabulation')">
                <span class="trust-sub-indicator"></span>
                <span>Live Tabulation</span>
            </a>
        `;
        examSubmenu.appendChild(li);
    }

    // ২. switchCPSCLExamSubTab হুক করে Live Tabulation ভিউ লোড করা
    const prevSwitch = window.switchCPSCLExamSubTab;
    window.switchCPSCLExamSubTab = function (element, tabKey) {
        if (typeof prevSwitch === 'function') {
            prevSwitch(element, tabKey);
        }

        if (tabKey === 'live-tabulation') {
            document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
            if (element) element.classList.add('active');

            document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
            const topTitle = document.getElementById('top-title');

            let view = document.getElementById('cpscl-live-tabulation-main-view');
            if (!view) {
                const mainWrapper = document.querySelector('.main-wrapper');
                if (mainWrapper) {
                    view = document.createElement('div');
                    view.className = 'view-panel active';
                    view.id = 'cpscl-live-tabulation-main-view';
                    mainWrapper.appendChild(view);
                }
            } else {
                view.classList.add('active');
            }

            if (topTitle) topTitle.innerText = "CPSCL Academic ERP – Live Tabulation";

            renderTabulationContainer();
            syncDataAndPopulateExams();
        }
    };

    // ৩. স্ক্রিন ও স্টাইল ইনজেকশন
    function injectTabulationStyles() {
        if (document.getElementById('cpscl-tabulation-scoped-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-tabulation-scoped-styles';
        style.innerHTML = `
            .tab-wrapper { padding: 15px 5px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #17233c; }
            .tab-head-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 50px !important; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); flex-wrap: wrap; gap: 12px; }
            .tab-head-card h1 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
            .tab-head-card h1 i { color: #2563eb; }
            .tab-badge-sync { font-size: 11px; font-weight: 700; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 5px 16px; border-radius: 50px !important; }

            .tab-filter-bar { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 16px 20px; display: grid; grid-template-columns: 1.5fr 1fr 1fr auto; gap: 14px; margin-bottom: 20px; align-items: flex-end; }
            .tab-filter-group label { display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
            .tab-filter-group select, .tab-filter-group input { width: 100%; height: 40px; border: 1.5px solid #cbd5e1; border-radius: 50px !important; padding: 0 16px; font-size: 13px; font-weight: 600; outline: none; background: #fff; color: #1e293b; }
            
            .tab-btn-pill { height: 40px; padding: 0 18px; border-radius: 50px !important; font-size: 13px; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 7px; transition: all 0.2s; text-decoration: none; }
            .tab-btn-primary { background: #2563eb; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.25); }
            .tab-btn-primary:hover { background: #1d4ed8; }
            .tab-btn-outline { background: #fff; border: 1.5px solid #cbd5e1; color: #334155; }
            .tab-btn-outline:hover { background: #f8fafc; border-color: #94a3b8; }
            .tab-btn-signature { background: #f1f5f9; border: 1.5px solid #cbd5e1; color: #475569; }
            .tab-btn-signature:hover { background: #e2e8f0; color: #0f172a; }

            .tab-sheet-panel { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .tab-sheet-topbar { padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: #fcfdfe; }
            
            /* অফিশিয়াল হেডার ডিজাইন */
            .tab-heading-area { text-align: center; padding: 18px 20px 8px; color: #111; }
            .tab-heading-area h2 { font-size: 17px; font-weight: 800; margin: 0 0 4px; text-transform: uppercase; color: #000; letter-spacing: 0.3px; }
            .tab-heading-area h3.class-title { font-size: 14px; font-weight: 700; margin: 2px 0; color: #2563eb; }
            .tab-heading-area h3.exam-title { font-size: 13.5px; font-weight: 700; margin: 2px 0; color: #111; }
            .tab-heading-area h4.group-title { font-size: 13px; font-weight: 700; margin: 2px 0 0; color: #334155; }
            .tab-heading-area .tab-date-line { text-align: right; margin-top: 6px; font-size: 12px; font-weight: 700; color: #222; }

            .tab-table-wrap { overflow-x: auto; padding: 0 15px 15px; }
            .tab-table { width: 100%; border-collapse: collapse; min-width: 650px; }
            .tab-table th { background: #fbe7d9 !important; color: #111 !important; border: 1px solid #202020 !important; font-size: 12px; font-weight: 700; text-align: center; padding: 6px 4px; }
            .tab-table th small { font-size: 10px; font-weight: 600; color: #333; }
            .tab-table td { border: 1px solid #202020 !important; padding: 5px 6px; font-size: 12px; text-align: center; color: #111; }
            .tab-table td.name-col { text-align: left; font-weight: 600; white-space: nowrap !important; padding-left: 10px; }
            .tab-table td.total-col { font-weight: 800; background: #fdfaf6; }

            /* সিগনেচার ব্লক ডিজাইন */
            .tab-signature-container { display: flex; justify-content: space-around; align-items: flex-end; margin-top: 50px; padding: 0 20px 20px; page-break-inside: avoid; }
            .tab-sig-item { text-align: center; min-width: 170px; }
            .tab-sig-space { height: 50px; }
            .tab-sig-line { width: 100%; border-top: 1.5px solid #000; margin-bottom: 5px; }
            .tab-sig-label { font-size: 12px; font-weight: 700; color: #000; }

            /* সিগনেচার সেটিংস মোডাল */
            .sig-modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100000; display: none; align-items: center; justify-content: center; }
            .sig-modal-box { background: #fff; border-radius: 16px; width: 90%; max-width: 460px; padding: 22px; box-shadow: 0 15px 35px rgba(0,0,0,0.25); }
            .sig-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            .sig-item-row { display: flex; gap: 8px; margin-bottom: 10px; align-items: center; }
            .sig-item-row input { flex: 1; height: 38px; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 0 12px; font-size: 13px; font-weight: 600; outline: none; }
            .sig-del-btn { width: 34px; height: 34px; border: none; background: #fee2e2; color: #dc2626; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        `;
        document.head.appendChild(style);
    }

    // ৪. সিগনেচার তালিকা ম্যানেজমেন্ট
    const DEFAULT_SIGNATURES = ["Course Coordinator", "Vice Principal", "Principal"];

    window.getSavedSignatures = function() {
        try {
            const saved = localStorage.getItem('cpscl_tab_signatures');
            if (saved) return JSON.parse(saved);
        } catch(e){}
        return DEFAULT_SIGNATURES;
    };

    window.openSignatureConfigModal = function() {
        const modal = document.getElementById('cpscl-sig-modal');
        if (!modal) return;
        renderSignatureInputs();
        modal.style.display = 'flex';
    };

    window.closeSignatureConfigModal = function() {
        const modal = document.getElementById('cpscl-sig-modal');
        if (modal) modal.style.display = 'none';
    };

    function renderSignatureInputs() {
        const list = window.getSavedSignatures();
        const container = document.getElementById('sig-items-list');
        if (!container) return;
        container.innerHTML = '';

        list.forEach((sigText) => {
            const row = document.createElement('div');
            row.className = 'sig-item-row';
            row.innerHTML = `
                <input type="text" class="sig-input-val" value="${sigText}" placeholder="Enter designation (e.g. Principal)">
                <button type="button" class="sig-del-btn" onclick="window.removeSigRow(this)"><i class="fa-solid fa-trash"></i></button>
            `;
            container.appendChild(row);
        });
    }

    window.addSigRow = function() {
        const container = document.getElementById('sig-items-list');
        if (!container) return;
        const row = document.createElement('div');
        row.className = 'sig-item-row';
        row.innerHTML = `
            <input type="text" class="sig-input-val" value="" placeholder="New designation (e.g. Class Teacher)">
            <button type="button" class="sig-del-btn" onclick="window.removeSigRow(this)"><i class="fa-solid fa-trash"></i></button>
        `;
        container.appendChild(row);
    };

    window.removeSigRow = function(btn) {
        btn.closest('.sig-item-row').remove();
    };

    window.saveSignaturesFromModal = function() {
        const inputs = document.querySelectorAll('.sig-input-val');
        const updated = [];
        inputs.forEach(inp => {
            const val = inp.value.trim();
            if (val) updated.push(val);
        });

        localStorage.setItem('cpscl_tab_signatures', JSON.stringify(updated.length > 0 ? updated : DEFAULT_SIGNATURES));
        window.closeSignatureConfigModal();
        renderOnScreenSignatureBlock();
        if (window.showToast) window.showToast("সিগনেচার তালিকা সফলভাবে আপডেট হয়েছে!", "success");
    };

    function renderOnScreenSignatureBlock() {
        const sigContainer = document.getElementById('tabSignatureArea');
        if (!sigContainer) return;
        const list = window.getSavedSignatures();

        let sigHtml = '<div class="tab-signature-container">';
        list.forEach(sig => {
            sigHtml += `
                <div class="tab-sig-item">
                    <div class="tab-sig-space"></div>
                    <div class="tab-sig-line"></div>
                    <div class="tab-sig-label">${sig}</div>
                </div>
            `;
        });
        sigHtml += '</div>';
        sigContainer.innerHTML = sigHtml;
    }

    // ৫. মূল কন্টেইনার তৈরি
    function renderTabulationContainer() {
        const view = document.getElementById('cpscl-live-tabulation-main-view');
        if (!view) return;

        view.innerHTML = `
            <div class="tab-wrapper">
                <div class="tab-head-card">
                    <div>
                        <h1><i class="fa-solid fa-chart-column"></i> CPSCL Academic ERP – Live Tabulation</h1>
                        <span style="font-size: 11px; color: #64748b; font-weight: 600;">Real-Time Marks Calculation, Merit Position & Portrait Print Sheet</span>
                    </div>
                    <span class="tab-badge-sync"><i class="fa-solid fa-bolt"></i> Live Calculation Mode</span>
                </div>

                <!-- Filters -->
                <div class="tab-filter-bar">
                    <div class="tab-filter-group">
                        <label>Select Examination</label>
                        <select id="tabSelectExam" onchange="window.onTabExamChange(this.value)">
                            <option value="">-- Loading Exams --</option>
                        </select>
                    </div>
                    <div class="tab-filter-group">
                        <label>Class</label>
                        <input type="text" id="tabDisplayClass" readonly placeholder="Class will auto load..." style="background:#f8fafc; font-weight:700;">
                    </div>
                    <div class="tab-filter-group">
                        <label>Group / Section</label>
                        <select id="tabSelectGroup" onchange="window.loadLiveTabulationData()">
                            <option value="ALL">All Groups</option>
                        </select>
                    </div>
                    <div>
                        <button type="button" class="tab-btn-pill tab-btn-primary" onclick="window.loadLiveTabulationData()">
                            <i class="fa-solid fa-filter"></i> View Results
                        </button>
                    </div>
                </div>

                <!-- Tabulation Sheet Panel -->
                <div class="tab-sheet-panel">
                    <div class="tab-sheet-topbar">
                        <div style="font-weight: 700; color: #1e293b; font-size: 0.95rem;">
                            <i class="fa-solid fa-table-list" style="color:#2563eb; margin-right:6px;"></i> Live Result & Tabulation Sheet
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="tab-btn-pill tab-btn-signature" onclick="window.openSignatureConfigModal()">
                                <i class="fa-solid fa-pen-nib"></i> Signatures
                            </button>
                            <button type="button" class="tab-btn-pill tab-btn-outline" onclick="window.printTabulationSheet()">
                                <i class="fa-solid fa-print"></i> Print
                            </button>
                            <button type="button" class="tab-btn-pill tab-btn-outline" onclick="window.printTabulationSheet()">
                                <i class="fa-solid fa-file-pdf"></i> Export PDF
                            </button>
                            <button type="button" class="tab-btn-pill tab-btn-primary" onclick="window.exportTabulationExcel()">
                                <i class="fa-solid fa-file-excel"></i> Export Excel
                            </button>
                        </div>
                    </div>

                    <!-- Print Sheet Area -->
                    <div id="tabPrintableArea">
                        <div class="tab-heading-area">
                            <h2>CANTONMENT PUBLIC SCHOOL AND COLLEGE LALMONIRHAT</h2>
                            <h3 class="class-title" id="tabHeadingClass">---</h3>
                            <h3 class="exam-title" id="tabHeadingExam">---</h3>
                            <h4 class="group-title" id="tabHeadingGroup">Group: All</h4>
                            <p class="tab-date-line">Date: <span id="tabHeadingDate">---</span></p>
                        </div>

                        <div class="tab-table-wrap">
                            <table class="tab-table" id="tabMainTable">
                                <thead id="tabTableThead">
                                    <tr><th>Merit</th><th>Student ID</th><th>Student Name</th><th>Total</th></tr>
                                </thead>
                                <tbody id="tabTableTbody">
                                    <tr><td colspan="4" style="padding: 30px; color: #94a3b8;">Choose an examination above to view tabulation data.</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div id="tabSignatureArea"></div>
                    </div>
                </div>
            </div>

            <!-- সিগনেচার এডিট করার মোডাল -->
            <div id="cpscl-sig-modal" class="sig-modal-backdrop">
                <div class="sig-modal-box">
                    <div class="sig-modal-header">
                        <h3 style="margin:0; font-size: 1.1rem; font-weight:800; color: #0f172a;"><i class="fa-solid fa-signature" style="color:#2563eb;"></i> Signature Settings</h3>
                        <button type="button" onclick="window.closeSignatureConfigModal()" style="border:none; background:transparent; font-size:1.2rem; cursor:pointer; color:#64748b;">✕</button>
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-bottom: 14px;">প্রতিটি পদবি নিজের মতো পরিবর্তন, ডিলিট বা নতুন যোগ করতে পারেন:</p>
                    <div id="sig-items-list" style="max-height: 250px; overflow-y:auto; margin-bottom: 14px;"></div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <button type="button" onclick="window.addSigRow()" style="background:#eff6ff; color:#2563eb; border:1px dashed #bfdbfe; padding:8px 14px; border-radius:8px; font-weight:700; font-size:12px; cursor:pointer;">
                            <i class="fa-solid fa-plus"></i> Add Signature
                        </button>
                        <div style="display:flex; gap:8px;">
                            <button type="button" onclick="window.closeSignatureConfigModal()" style="background:#f1f5f9; border:none; padding:8px 14px; border-radius:8px; font-weight:700; font-size:12px; cursor:pointer;">Cancel</button>
                            <button type="button" onclick="window.saveSignaturesFromModal()" style="background:#2563eb; color:#fff; border:none; padding:8px 18px; border-radius:8px; font-weight:700; font-size:12px; cursor:pointer;">Save</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        renderOnScreenSignatureBlock();
    }

    // ৬. পরীক্ষা ও ক্লাসের তালিকা ক্লাউড থেকে সিঙ্ক
    let cachedExams = [];

    async function syncDataAndPopulateExams() {
        const localEx = localStorage.getItem('cpscl_exams_registry');
        if (localEx) {
            try { cachedExams = JSON.parse(localEx); } catch(e){}
        }

        if (window.getDatabase && window.ref && window.get) {
            try {
                const db = window.getDatabase();
                const snap = await window.get(window.ref(db, 'cpscl_exams'));
                if (snap.exists()) {
                    const data = snap.val();
                    cachedExams = Array.isArray(data) ? data : Object.values(data);
                    localStorage.setItem('cpscl_exams_registry', JSON.stringify(cachedExams));
                }
            } catch(e) {
                console.warn("Exams sync note:", e);
            }
        }

        const examSelect = document.getElementById('tabSelectExam');
        if (!examSelect) return;

        examSelect.innerHTML = '';
        if (cachedExams.length === 0) {
            examSelect.innerHTML = '<option value="">-- No Exams Configured --</option>';
            return;
        }

        cachedExams.forEach(ex => {
            examSelect.innerHTML += `<option value="${ex.id}">${ex.name} (${ex.class})</option>`;
        });

        if (cachedExams.length > 0) {
            examSelect.value = cachedExams[0].id;
            window.onTabExamChange(cachedExams[0].id);
        }
    }

    // ৭. পরীক্ষা পরিবর্তন হলে ক্লাস ও গ্রুপ ড্রপডাউন রিফ্রেশ
    window.onTabExamChange = function(examId) {
        const exam = cachedExams.find(x => x.id === examId);
        const classInp = document.getElementById('tabDisplayClass');
        const grpSelect = document.getElementById('tabSelectGroup');

        if (!exam) return;

        if (classInp) classInp.value = exam.class || 'N/A';

        if (grpSelect) {
            grpSelect.innerHTML = '<option value="ALL">All Groups</option>';
            const groupSet = new Set();
            if (exam.groups && exam.groups.length > 0) {
                exam.groups.forEach(g => { if (g.name) groupSet.add(g.name.trim()); });
            } else {
                groupSet.add("Group A");
                groupSet.add("Group B");
            }

            try {
                const overrides = JSON.parse(localStorage.getItem('cpscl_exam_group_overrides') || '{}');
                if (overrides[exam.id]) {
                    Object.values(overrides[exam.id]).forEach(ovG => groupSet.add(ovG));
                }
            } catch(e){}

            groupSet.forEach(g => {
                grpSelect.innerHTML += `<option value="${g}">${g}</option>`;
            });
        }

        window.loadLiveTabulationData();
    };

    // ৮. গ্রুপ নির্ধারণের হেল্পার (আগে ওভাররাইড চেক করবে)
    function determineStudentGroup(st, sl, exam, overrides) {
        const studentId = String(st.std_id || st.id || '').trim();

        // ১. ক্লাউডে মেধা অনুযায়ী নির্ধারিত গ্রুপ থাকলে সবার আগে সেটিই কার্যকর হবে
        if (overrides && overrides[exam.id] && overrides[exam.id][studentId]) {
            return overrides[exam.id][studentId];
        }

        // ২. ফলব্যাক নিয়ম
        return (sl <= 40) ? "Group A" : "Group B";
    }

    // ৯. লাইভ ট্যাবুলেশন ডাটা লোড ও গণনা ইঞ্জিন (১০০% মেধাভিত্তিক ও অটো-হাইড)
    window.loadLiveTabulationData = async function() {
        const examSelect = document.getElementById('tabSelectExam');
        const grpSelect = document.getElementById('tabSelectGroup');
        const thead = document.getElementById('tabTableThead');
        const tbody = document.getElementById('tabTableTbody');

        if (!examSelect || !examSelect.value) return;

        const examId = examSelect.value;
        const exam = cachedExams.find(x => x.id === examId);
        if (!exam) return;

        const selectedGroup = grpSelect ? grpSelect.value : 'ALL';
        const isAllGroup = (selectedGroup === 'ALL');

        // হেডারে পরীক্ষার তথ্য আপডেট
        document.getElementById('tabHeadingClass').innerText = exam.class || '';
        document.getElementById('tabHeadingExam').innerText = exam.name || '';
        document.getElementById('tabHeadingDate').innerText = exam.date || new Date().toISOString().split('T')[0];

        // গ্রুপ হেডার লাইন
        let groupDisplayLabel = "Group: All";
        if (!isAllGroup) {
            groupDisplayLabel = `Group: ${selectedGroup.replace(/group\s*/i, '')}`;
        }
        document.getElementById('tabHeadingGroup').innerText = groupDisplayLabel;

        // বিষয়সমূহ লোড করা
        const subjects = exam.subjects || {};
        const subjectKeys = Object.keys(subjects);

        // ক্লাসের শিক্ষার্থীদের লোড করা
        let allStudents = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
        if (allStudents.length === 0 && window.getDatabase && window.ref && window.get) {
            try {
                const snap = await window.get(window.ref(window.getDatabase(), 'cpscl_students'));
                if (snap.exists()) {
                    const data = snap.val();
                    allStudents = Array.isArray(data) ? data : Object.values(data);
                    localStorage.setItem('cpscl_students_cache', JSON.stringify(allStudents));
                }
            } catch(e){}
        }

        let overrides = {};
        try { overrides = JSON.parse(localStorage.getItem('cpscl_exam_group_overrides') || '{}'); } catch(e){}

        if (window.getDatabase && window.ref && window.get) {
            try {
                const snapOv = await window.get(window.ref(window.getDatabase(), 'cpscl_exam_group_overrides'));
                if (snapOv.exists()) {
                    overrides = snapOv.val() || overrides;
                    localStorage.setItem('cpscl_exam_group_overrides', JSON.stringify(overrides));
                }
            } catch(e){}
        }

        // ক্লাস অনুযায়ী ফিল্টার
        let targetStudents = allStudents.filter(s => {
            const cName = String(s.class_name || s.class || '').trim().toLowerCase();
            const examC = String(exam.class).trim().toLowerCase();
            return cName === examC || cName.includes(examC) || examC.includes(cName);
        });

        // মেধা সর্ট অর্ডার (যদি এক্সাম ম্যানেজারে সংরক্ষিত থাকে)
        const savedMeritOrder = (overrides && overrides[exam.id + '_merit_order']) ? overrides[exam.id + '_merit_order'] : [];

        if (savedMeritOrder && savedMeritOrder.length > 0) {
            targetStudents.sort((a, b) => {
                const idA = String(a.std_id || a.id || '').trim();
                const idB = String(b.std_id || b.id || '').trim();
                let idxA = savedMeritOrder.indexOf(idA);
                let idxB = savedMeritOrder.indexOf(idB);
                if (idxA === -1) idxA = 99999;
                if (idxB === -1) idxB = 99999;
                return idxA - idxB;
            });
        }

        // গ্রুপ অ্যাসাইন করা
        targetStudents.forEach((st, idx) => {
            st.computedGroup = determineStudentGroup(st, idx + 1, exam, overrides);
        });

        // নির্বাচিত গ্রুপ অনুযায়ী ফিল্টার
        if (!isAllGroup) {
            targetStudents = targetStudents.filter(s => s.computedGroup === selectedGroup);
        }

        if (targetStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding:35px; color:#94a3b8; text-align:center;">কোনো শিক্ষার্থী পাওয়া যায়নি (No students found for this class/group).</td></tr>`;
            return;
        }

        // বিষয়ভিত্তিক নম্বর সংগ্রহ করা
        const marksBySubject = {};

        for (let sub of subjectKeys) {
            let subMarks = JSON.parse(localStorage.getItem(`cpscl_marks_${examId}_${sub}`) || '{}');

            if (window.getDatabase && window.ref && window.get) {
                try {
                    const snapM = await window.get(window.ref(window.getDatabase(), `cpscl_exam_marks/${examId}_${sub}`));
                    if (snapM.exists()) {
                        subMarks = snapM.val() || subMarks;
                    }
                } catch(e){}
            }
            marksBySubject[sub] = subMarks;
        }

        // শিক্ষার্থীদের নম্বর হিসাব করা
        const computedRows = targetStudents.map(st => {
            const stId = String(st.std_id || st.id || '').trim();
            const stName = st.student_name || st.name || 'Unnamed';
            let studentTotal = 0;
            let hasAnyMark = false;

            const subjectScores = {};

            subjectKeys.forEach(sub => {
                const rec = (marksBySubject[sub] && marksBySubject[sub][stId]) ? marksBySubject[sub][stId] : null;
                let val = null;
                if (rec) {
                    if (rec.rawMark !== null && rec.rawMark !== undefined && rec.rawMark !== '') {
                        val = parseFloat(rec.rawMark);
                    } else if (rec.cq !== null && rec.cq !== undefined) {
                        val = (parseFloat(rec.cq) || 0) + (parseFloat(rec.mcq) || 0) + (parseFloat(rec.practical) || 0);
                    }
                }

                if (val !== null && !isNaN(val)) {
                    subjectScores[sub] = val;
                    studentTotal += val;
                    hasAnyMark = true;
                } else {
                    subjectScores[sub] = '-';
                }
            });

            return {
                id: stId,
                name: stName,
                group: st.computedGroup || 'Group A',
                subjectScores,
                total: studentTotal,
                hasAnyMark
            };
        });

        // 🌟 স্মার্ট অটো-হাইড: যে যে বিষয়ের পরীক্ষা হয়েছে শুধু সেই বিষয়গুলো দৃশ্যমান হবে
        let activeSubjectsForView = [];
        let totalFullMarks = 0;

        const anyMarkEnteredInView = computedRows.some(r => r.hasAnyMark);

        if (anyMarkEnteredInView) {
            // যদি নম্বর এন্ট্রি শুরু হয়ে থাকে, তবে যে বিষয়ে অন্তত ১ জন পরীক্ষা দিয়েছে কেবল সেটাই থাকবে
            activeSubjectsForView = subjectKeys.filter(sub => {
                return computedRows.some(r => r.subjectScores[sub] !== '-');
            });
        } else {
            // যদি এখনো কারও নম্বর এন্ট্রি না হয়ে থাকে (ব্ল্যাঙ্ক ভিউ)
            activeSubjectsForView = [...subjectKeys];
        }

        activeSubjectsForView.forEach(sub => {
            totalFullMarks += (parseInt(subjects[sub]) || 30);
        });

        // 🌟 মেধা সর্টিং লজিক:
        // ১. যদি মোট নম্বর থাকে, তবে বেশি নম্বর পাওয়া শিক্ষার্থী উপরে থাকবে (Merit Order)
        // ২. যদি সবার নম্বর ০ হয় (পরীক্ষার আগে), তবে পূর্ববর্তী মেধা ক্রমেই ১, ২, ৩ ... সাজানো থাকবে (মেহরাব ১ নম্বরে)
        computedRows.sort((a, b) => {
            if (b.total !== a.total) {
                return b.total - a.total;
            }
            if (savedMeritOrder && savedMeritOrder.length > 0) {
                let idxA = savedMeritOrder.indexOf(a.id);
                let idxB = savedMeritOrder.indexOf(b.id);
                if (idxA === -1) idxA = 99999;
                if (idxB === -1) idxB = 99999;
                return idxA - idxB;
            }
            return a.id.localeCompare(b.id);
        });

        // টেবিল হেডার তৈরি (কোনো রোল কলাম নেই, একক গ্রুপে গ্রুপ কলামও থাকবে না)
        let thHtml = `<tr>
            <th style="width: 6%;">Merit</th>
            <th style="width: 14%;">Student ID</th>
            <th style="text-align: left; padding-left: 10px;">Student Name</th>
        `;

        if (isAllGroup) {
            thHtml += `<th style="width: 9%;">Group</th>`;
        }

        activeSubjectsForView.forEach(sub => {
            const fMark = subjects[sub] || 30;
            thHtml += `<th style="min-width: 50px;">${sub}<br><small>(${fMark})</small></th>`;
        });

        thHtml += `<th style="width: 10%;">Total<br><small>(${totalFullMarks})</small></th></tr>`;
        thead.innerHTML = thHtml;

        // টেবিল বডিতে রো রেন্ডার করা
        tbody.innerHTML = '';
        computedRows.forEach((row, idx) => {
            const tr = document.createElement('tr');

            let tdHtml = `
                <td>${idx + 1}</td>
                <td>${row.id}</td>
                <td class="name-col">${row.name}</td>
            `;

            if (isAllGroup) {
                tdHtml += `<td>${row.group}</td>`;
            }

            activeSubjectsForView.forEach(sub => {
                const score = row.subjectScores[sub];
                tdHtml += `<td>${score}</td>`;
            });

            tdHtml += `<td class="total-col">${row.total}</td>`;
            tr.innerHTML = tdHtml;
            tbody.appendChild(tr);
        });

        renderOnScreenSignatureBlock();
    };

    // ১০. আসল ভেক্টর অফিশিয়াল প্রিন্ট ইঞ্জিন (কোনো রোল নেই, ধারালো লেখা)
    window.printTabulationSheet = function() {
        const printArea = document.getElementById('tabPrintableArea');
        if (!printArea) {
            alert("প্রিন্ট করার কোনো তথ্য পাওয়া যায়নি!");
            return;
        }

        const oldFrame = document.getElementById('cpscl-print-iframe');
        if (oldFrame) oldFrame.remove();

        const iframe = document.createElement('iframe');
        iframe.id = 'cpscl-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '210mm';
        iframe.style.height = '297mm';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Tabulation Sheet - CPSCL</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 7mm 8mm 10mm 8mm;
                    }
                    * {
                        box-sizing: border-box;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
                        color: #000;
                        background: #fff;
                        margin: 0;
                        padding: 0;
                        -webkit-font-smoothing: antialiased;
                        text-rendering: optimizeLegibility;
                    }
                    .tab-heading-area {
                        text-align: center;
                        margin-bottom: 6px;
                    }
                    .tab-heading-area h2 {
                        font-size: 15px;
                        font-weight: bold;
                        margin: 0 0 3px;
                        text-transform: uppercase;
                        letter-spacing: 0.4px;
                        color: #000;
                    }
                    .tab-heading-area h3.class-title {
                        font-size: 12.5px;
                        font-weight: bold;
                        margin: 2px 0;
                        color: #0f3460;
                    }
                    .tab-heading-area h3.exam-title {
                        font-size: 12px;
                        font-weight: bold;
                        margin: 2px 0;
                        color: #111;
                    }
                    .tab-heading-area h4.group-title {
                        font-size: 11.5px;
                        font-weight: bold;
                        margin: 2px 0 0;
                        color: #222;
                    }
                    .tab-heading-area .tab-date-line {
                        text-align: right;
                        margin: 2px 0 4px 0;
                        font-size: 10.5px;
                        font-weight: bold;
                        color: #111;
                    }
                    .tab-table-wrap {
                        width: 100%;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse !important;
                        table-layout: auto;
                    }
                    th, td {
                        border: 1.2px solid #000 !important;
                        padding: 3.2px 3px !important;
                        font-size: 10px !important;
                        text-align: center;
                        color: #000;
                        line-height: 1.15;
                    }
                    th {
                        background-color: #fbe7d9 !important;
                        font-weight: bold;
                        padding: 4px 3px !important;
                    }
                    th small {
                        font-size: 8.5px;
                        font-weight: bold;
                    }
                    td.name-col {
                        text-align: left !important;
                        padding-left: 6px !important;
                        font-weight: bold;
                        white-space: nowrap !important;
                    }
                    td.total-col {
                        font-weight: bold;
                        background-color: #faf5ee !important;
                    }
                    tr {
                        page-break-inside: avoid !important;
                    }
                    .tab-signature-container {
                        display: flex;
                        justify-content: space-around;
                        align-items: flex-end;
                        margin-top: 45px;
                        padding: 0 15px 5px;
                        page-break-inside: avoid !important;
                    }
                    .tab-sig-item {
                        text-align: center;
                        min-width: 160px;
                    }
                    .tab-sig-space {
                        height: 55px;
                    }
                    .tab-sig-line {
                        width: 100%;
                        border-top: 1.5px solid #000;
                        margin-bottom: 4px;
                    }
                    .tab-sig-label {
                        font-size: 11px;
                        font-weight: bold;
                        color: #000;
                    }
                </style>
            </head>
            <body>
                ${printArea.innerHTML}
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 500);
    };

    // ১১. এক্সেল এক্সপোর্ট
    window.exportTabulationExcel = function() {
        const table = document.getElementById('tabMainTable');
        const examTitle = document.getElementById('tabHeadingExam').innerText || 'Tabulation';
        if (!table) return;

        if (typeof XLSX !== 'undefined') {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, "Tabulation Sheet");
            XLSX.writeFile(wb, `${examTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Tabulation.xlsx`);
        } else {
            const html = document.getElementById('tabPrintableArea').outerHTML;
            const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${examTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Tabulation.xls`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }
    };

    // ১২. ইনিশিয়ালাইজেশন
    function init() {
        injectTabulationStyles();
        injectLiveTabulationSidebar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200);
    }
})();
