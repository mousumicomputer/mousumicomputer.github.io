/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Live Tabulation & Result Sheet Engine (Portrait Print-Ready)
   Path: cpscl/live_tabulation_manager.js
   Architecture: Real-time Cloud Synced | Zero Mock Data | Pure Dynamic Calculation
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Live Tabulation Engine (Portrait Print & Cloud Synced)...");

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
            <a class="trust-sub-link" id="sub-link-live-tabulation" onclick="switchCPSCLExamSubTab(this, 'live-tabulation')">
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

    // ৩. স্টাইল ইনজেকশন (স্ক্রিন এবং A4 Portrait প্রিন্টের জন্য নিখুঁত সিএসএস)
    function injectTabulationStyles() {
        if (document.getElementById('cpscl-tabulation-scoped-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-tabulation-scoped-styles';
        style.innerHTML = `
            .tab-wrapper { padding: 15px 5px; font-family: 'Inter', 'Plus Jakarta Sans', sans-serif; color: #17233c; }
            .tab-head-card { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 50px !important; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); flex-wrap: wrap; gap: 12px; }
            .tab-head-card h1 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
            .tab-head-card h1 i { color: #2563eb; }
            .tab-badge-sync { font-size: 11px; font-weight: 700; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 5px 16px; border-radius: 50px !important; }

            .tab-filter-bar { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 16px 20px; display: grid; grid-template-columns: 1.5fr 1fr 1fr auto; gap: 14px; margin-bottom: 20px; align-items: flex-end; }
            .tab-filter-group label { display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 6px; }
            .tab-filter-group select, .tab-filter-group input { width: 100%; height: 40px; border: 1.5px solid #cbd5e1; border-radius: 50px !important; padding: 0 16px; font-size: 13px; font-weight: 600; outline: none; background: #fff; color: #1e293b; }
            
            .tab-btn-pill { height: 40px; padding: 0 20px; border-radius: 50px !important; font-size: 13px; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; text-decoration: none; }
            .tab-btn-primary { background: #2563eb; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.25); }
            .tab-btn-primary:hover { background: #1d4ed8; }
            .tab-btn-outline { background: #fff; border: 1.5px solid #cbd5e1; color: #334155; }
            .tab-btn-outline:hover { background: #f8fafc; border-color: #94a3b8; }

            .tab-sheet-panel { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .tab-sheet-topbar { padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: #fcfdfe; }
            
            .tab-heading-area { text-align: center; padding: 22px 15px 12px; color: #111; }
            .tab-heading-area h2 { font-size: 17px; font-weight: 800; margin: 0 0 5px; text-transform: uppercase; letter-spacing: -0.2px; }
            .tab-heading-area h3 { font-size: 14px; font-weight: 700; margin: 3px 0; color: #2563eb; }
            .tab-heading-area p { font-size: 12px; margin: 5px 0 0; color: #475569; }
            .tab-heading-area .tab-date-line { text-align: right; margin-top: 10px; font-size: 12px; font-weight: 700; color: #334155; }

            .tab-table-wrap { overflow-x: auto; padding: 0 15px 15px; }
            .tab-table { width: 100%; border-collapse: collapse; min-width: 760px; }
            .tab-table th { background: #fbe7d9 !important; color: #111 !important; border: 1px solid #202020 !important; font-size: 12px; font-weight: 700; text-align: center; padding: 7px 6px; }
            .tab-table th small { font-size: 10px; font-weight: 600; color: #444; }
            .tab-table td { border: 1px solid #202020 !important; padding: 6px 8px; font-size: 12px; text-align: center; color: #111; }
            .tab-table td.name-col { text-align: left; font-weight: 600; white-space: nowrap; }
            .tab-table td.total-col { font-weight: 800; background: #fdfaf6; }

            /* PRINT CSS SPECIFIC TO PORTRAIT A4 */
            @media print {
                @page { size: portrait; margin: 8mm; }
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                body { background: #fff !important; }
                .sidebar, .top-navbar, .tab-head-card, .tab-filter-bar, .tab-sheet-topbar, #toast-container, .modal-overlay, #loader { display: none !important; }
                .main-wrapper { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                .view-panel { display: none !important; padding: 0 !important; }
                #cpscl-live-tabulation-main-view { display: block !important; padding: 0 !important; }
                .tab-wrapper { padding: 0 !important; }
                .tab-sheet-panel { border: none !important; box-shadow: none !important; border-radius: 0 !important; }
                .tab-heading-area { padding: 0 0 10px !important; }
                .tab-heading-area h2 { font-size: 16px !important; }
                .tab-heading-area h3 { font-size: 13px !important; }
                .tab-heading-area p { font-size: 11px !important; }
                .tab-table-wrap { overflow: visible !important; padding: 0 !important; }
                .tab-table { width: 100% !important; min-width: 0 !important; table-layout: fixed; font-size: 11px !important; }
                .tab-table th, .tab-table td { padding: 5px 3px !important; font-size: 11px !important; line-height: 1.15; word-break: normal; }
                .tab-table th small { font-size: 10px !important; }
                .name-col { font-size: 11px !important; white-space: nowrap !important; }
            }
        `;
        document.head.appendChild(style);
    }

    // ৪. মূল কন্টেইনার তৈরি
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
                            <button type="button" class="tab-btn-pill tab-btn-outline" onclick="window.print()">
                                <i class="fa-solid fa-print"></i> Print
                            </button>
                            <button type="button" class="tab-btn-pill tab-btn-outline" onclick="window.print()">
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
                            <h3 id="tabHeadingClass">---</h3>
                            <h3 id="tabHeadingExam" style="color: #111;">---</h3>
                            <p class="tab-date-line">Examination Date: <span id="tabHeadingDate">---</span></p>
                        </div>

                        <div class="tab-table-wrap">
                            <table class="tab-table" id="tabMainTable">
                                <thead id="tabTableThead">
                                    <tr><th>Serial</th><th>ID</th><th>Name</th><th>Total</th></tr>
                                </thead>
                                <tbody id="tabTableTbody">
                                    <tr><td colspan="4" style="padding: 30px; color: #94a3b8;">Choose an examination above to view tabulation data.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ৫. পরীক্ষা ও ক্লাসের তালিকা ক্লাউড থেকে সিঙ্ক
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

        // প্রথম পরীক্ষাটি স্বয়ংক্রিয় নির্বাচন
        if (cachedExams.length > 0) {
            examSelect.value = cachedExams[0].id;
            window.onTabExamChange(cachedExams[0].id);
        }
    }

    // ৬. পরীক্ষা পরিবর্তন হলে ক্লাস ও গ্রুপ ড্রপডাউন রিফ্রেশ
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

            // ম্যানুয়াল ট্রান্সফার ওভাররাইড চেক
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

    // ৭. গ্রুপ নির্ধারণের হেল্পার
    function determineStudentGroup(st, sl, exam, overrides) {
        const studentId = String(st.std_id || st.id || '').trim();
        const studentRoll = st.roll_no || st.roll || '';
        const effectiveNum = (studentRoll && !isNaN(parseInt(studentRoll))) ? parseInt(studentRoll) : sl;

        const groupsList = (exam && exam.groups && exam.groups.length > 0) ? exam.groups : [
            { name: "Group A", from: 1, to: 40 },
            { name: "Group B", from: 41, to: "Rest" }
        ];

        let assigned = groupsList[0].name;
        for (let g of groupsList) {
            const fromNum = parseInt(g.from) || 1;
            const toNum = (g.to && String(g.to).toLowerCase() === 'rest') ? 999999 : (parseInt(g.to) || 999999);
            if (effectiveNum >= fromNum && effectiveNum <= toNum) {
                assigned = g.name;
                break;
            }
        }

        if (overrides && overrides[exam.id] && overrides[exam.id][studentId]) {
            assigned = overrides[exam.id][studentId];
        }

        return assigned || st.group || "Group A";
    }

    // ৮. লাইভ ট্যাবুলেশন ডাটা লোড ও গণনা ইঞ্জিন (১০০% ডাইনামিক)
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

        // হেডারে পরীক্ষার তথ্য আপডেট
        document.getElementById('tabHeadingClass').innerText = exam.class || '';
        document.getElementById('tabHeadingExam').innerText = exam.name || '';
        document.getElementById('tabHeadingDate').innerText = exam.date || new Date().toISOString().split('T')[0];

        // ১. পরীক্ষার বিষয়সমূহ
        const subjects = exam.subjects || {};
        const subjectKeys = Object.keys(subjects);

        // ২. ক্লাসের আসল শিক্ষার্থীদের লোড
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

        // ক্লাস অনুযায়ী ফিল্টার
        let targetStudents = allStudents.filter(s => {
            const cName = String(s.class_name || s.class || '').trim().toLowerCase();
            const examC = String(exam.class).trim().toLowerCase();
            return cName === examC || cName.includes(examC) || examC.includes(cName);
        });

        // রোল বা সিরিয়াল অনুযায়ী সর্ট
        targetStudents.sort((a, b) => {
            const rA = parseInt(a.roll_no || a.roll) || 0;
            const rB = parseInt(b.roll_no || b.roll) || 0;
            if (rA && rB) return rA - rB;
            return String(a.std_id || a.id).localeCompare(String(b.std_id || b.id));
        });

        // গ্রুপ অনুযায়ী ফিল্টার
        targetStudents.forEach((st, idx) => {
            st.computedGroup = determineStudentGroup(st, idx + 1, exam, overrides);
        });

        if (selectedGroup && selectedGroup !== 'ALL') {
            targetStudents = targetStudents.filter(s => s.computedGroup === selectedGroup);
        }

        if (targetStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="${4 + subjectKeys.length}" style="padding:35px; color:#94a3b8; text-align:center;">কোনো শিক্ষার্থী পাওয়া যায়নি (No students found for this class/group).</td></tr>`;
            return;
        }

        // ৩. বিষয়ভিত্তিক নম্বর ফেচ করা (Firebase & LocalStorage)
        const marksBySubject = {};
        let totalFullMarks = 0;

        for (let sub of subjectKeys) {
            totalFullMarks += (parseInt(subjects[sub]) || 0);
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

        // ৪. টেবিল হেডার তৈরি
        let thHtml = `<tr>
            <th style="width: 6%;">Serial</th>
            <th style="width: 10%;">ID</th>
            <th style="width: 28%; text-align: left; padding-left: 12px;">Name</th>
        `;

        subjectKeys.forEach(sub => {
            const fMark = subjects[sub] || 100;
            thHtml += `<th>${sub}<br><small>M-${fMark}</small></th>`;
        });

        thHtml += `<th style="width: 10%;">Total<br><small>(${totalFullMarks})</small></th></tr>`;
        thead.innerHTML = thHtml;

        // ৫. প্রতিটি শিক্ষার্থীর নম্বর ও মোট নম্বর হিসাব করা
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
                roll: st.roll_no || st.roll,
                subjectScores,
                total: studentTotal,
                hasAnyMark
            };
        });

        // যদি কোনো শিক্ষার্থীরই কোনো বিষয়ে নম্বর এন্ট্রি না থাকে
        const anyEntryDone = computedRows.some(r => r.hasAnyMark);
        if (!anyEntryDone) {
            tbody.innerHTML = `<tr><td colspan="${4 + subjectKeys.length}" style="padding:35px; color:#64748b; text-align:center;">এই পরীক্ষার জন্য কোনো নম্বর এখনো এন্ট্রি করা হয়নি (No marks entered yet). 'Mark Entry' মেনু থেকে নম্বর সেভ করুন।</td></tr>`;
            return;
        }

        // ৬. মোট নম্বর অনুযায়ী মেধা স্থান (Merit Rank) ক্রমানুসারে সাজানো
        computedRows.sort((a, b) => b.total - a.total);

        // ৭. টেবিল বডিতে রো রেন্ডার করা
        tbody.innerHTML = '';
        computedRows.forEach((row, idx) => {
            const tr = document.createElement('tr');

            let tdHtml = `
                <td>${idx + 1}</td>
                <td>${row.id}</td>
                <td class="name-col" style="padding-left: 12px;">${row.name}</td>
            `;

            subjectKeys.forEach(sub => {
                const score = row.subjectScores[sub];
                tdHtml += `<td>${score}</td>`;
            });

            tdHtml += `<td class="total-col">${row.total}</td>`;
            tr.innerHTML = tdHtml;
            tbody.appendChild(tr);
        });
    };

    // ৯. এক্সেল এক্সপোর্ট ইঞ্জিন (SheetJS সম্বলিত)
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
            // ফলব্যাক ডাউনলোড
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

    // ১০. ইনিশিয়ালাইজেশন
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
