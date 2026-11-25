/* ==========================================================================
   MODULE: CPSCL Academic ERP
   SUB-SECTION: SSC-27 Preparatory Suite (v21.0 Central Master Data Edition)
   Path: cpscl/ssc27_exam_manager.js
   Architecture: 100% Direct Firebase Cloud REST | Linked with CPSCL_MASTER
   Features:
     - 22 Individual Master Subjects Dynamic Pills (Zero Combined Slots)
     - Exact 'rawMark' & 'cq' Extraction from cpscl_exam_marks
     - Protected Mode 1 (Weekly Cumulative Promotion) & Mode 2 (Daily Intra-Group Seating)
     - 100% Mobile & Desktop Fully Responsive UI
     - Add / Edit Subjects Safe Modal
   Language: 100% Pure Corporate English (Zero Bengali Everywhere)
   Safety: 100% Zero LocalStorage | Permanent Realtime Cloud Sync
   ========================================================================== */

(function () {
    "use strict";

    console.log("Loading CPSCL SSC-27 Suite v21.0 (Master Subjects Active)...");

    const FIREBASE_BASE_URL = "https://mousumi-computer-default-rtdb.firebaseio.com";

    function cleanFirebaseKey(name) {
        return String(name || '').replace(/[/#$\[\].]/g, '-').trim();
    }

    // Dynamic Master Subject List Resolver
    function getMasterSubjectList() {
        if (window.CPSCL_MASTER && Array.isArray(window.CPSCL_MASTER.SUBJECTS)) {
            return window.CPSCL_MASTER.SUBJECTS.map(s => s.name);
        }
        return [
            "Bangla 1st Paper", "Bangla 2nd Paper", "English 1st Paper", "English 2nd Paper",
            "Mathematics", "Information & Communication Technology", "Islam & Moral Education",
            "Hindu Religion & Moral Education", "Physics", "Chemistry", "Biology",
            "Higher Mathematics", "Bangladesh & Global Studies", "General Science",
            "Accounting", "Finance & Banking", "Business Entrepreneurship",
            "History of Bangladesh & World Civilization", "Geography & Environment",
            "Civics & Citizenship", "Agriculture Studies", "Home Science"
        ];
    }

    function injectSSC27Styles() {
        if (document.getElementById('cpscl-ssc27-style')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-ssc27-style';
        style.innerHTML = `
            .s27-wrapper { padding: 15px 5px; font-family: 'Plus Jakarta Sans', sans-serif; }
            .s27-header { background: #ffffff; border: 1.5px solid #e2e8f0; padding: 18px 25px; border-radius: 50px !important; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }
            .s27-header h1 { font-size: 1.3rem; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 10px; margin: 0; }
            .s27-header h1 i { color: #059669; }
            .s27-badge { background: #ecfdf5; color: #059669; font-weight: 700; font-size: 0.82rem; padding: 6px 16px; border-radius: 50px !important; border: 1px solid #a7f3d0; }
            .s27-nav-tabs { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
            .s27-tab-btn { background: #ffffff; border: 1.5px solid #cbd5e1; color: #64748b; padding: 11px 24px; border-radius: 50px !important; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; user-select: none; }
            .s27-tab-btn:hover { border-color: #059669; color: #059669; }
            .s27-tab-btn.active { background: #059669 !important; color: #ffffff !important; border-color: #059669 !important; box-shadow: 0 4px 12px rgba(5,150,105,0.25); }
            .s27-tab-content { display: none; }
            .s27-tab-content.active { display: block; }
            .s27-card { background: #ffffff; border-radius: 16px; border: 1.5px solid #cbd5e1; padding: 22px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
            .s27-card-title { font-size: 1.05rem; font-weight: 800; color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 18px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
            .s27-card-title span { display: flex; align-items: center; gap: 8px; }
            .s27-card-title i { color: #059669; }
            .s27-form-group { margin-bottom: 15px; display: flex; flex-direction: column; gap: 5px; }
            .s27-form-group label { font-size: 0.85rem; font-weight: 700; color: #0f172a; }
            .s27-control { width: 100%; height: 42px; border: 1.5px solid #cbd5e1; border-radius: 50px !important; padding: 0 18px; font-size: 0.9rem; outline: none; background: #ffffff; color: #0f172a; transition: 0.2s; }
            .s27-control:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1); }
            .s27-pills-box { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px; margin-bottom: 12px; }
            .s27-pill { display: inline-flex; align-items: center; gap: 8px; background: #f0fdf4; color: #059669; border: 1.5px solid #bbf7d0; padding: 7px 16px; border-radius: 50px !important; font-size: 0.82rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; user-select: none; }
            .s27-pill:hover { background: #dcfce7; border-color: #059669; }
            .s27-group-row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; background: #f8fafc; padding: 8px 14px; border-radius: 50px !important; border: 1.5px solid #e2e8f0; }
            .s27-group-row input { height: 34px; border-radius: 50px !important; border: 1px solid #cbd5e1; padding: 0 14px; font-size: 0.85rem; font-weight: 700; outline: none; background: #ffffff; }
            .s27-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            .s27-table th { background: #ffffff; color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; padding: 12px 16px; border-bottom: 1.5px solid #eef2f5; text-align: left; }
            .s27-table tbody td { color: #334155; font-size: 0.88rem; font-weight: 500; padding: 12px 16px; border-bottom: 1px solid #eef2f5; }
            .s27-table tbody tr:hover { background-color: #f8fafc; cursor: pointer; }
            .s27-table tbody tr.selected { background-color: #ecfdf5 !important; border-left: 4px solid #059669; }
            .s27-btn-submit { background: #059669 !important; color: #fff !important; border: none; width: 100%; height: 46px; border-radius: 50px !important; font-size: 0.95rem; font-weight: 800; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 18px; box-shadow: 0 4px 12px rgba(5,150,105,0.25); }
            .s27-btn-submit:hover { background: #047857 !important; }
            .s27-btn-add { background: #f8fafc; border: 1.5px dashed #cbd5e1; color: #059669; padding: 7px 18px; border-radius: 50px !important; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: 0.2s; }
            .s27-btn-add:hover { background: #ecfdf5; border-color: #059669; }
            .s27-btn-add.active { background: #059669 !important; color: #ffffff !important; border-style: solid !important; }
            .s27-group-badge { display: inline-block; padding: 4px 14px; border-radius: 50px !important; font-size: 0.8rem; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
            .s27-status-badge { display: inline-block; padding: 3px 10px; border-radius: 50px !important; font-size: 0.72rem; font-weight: 800; }
            .s27-score-badge { display: inline-block; padding: 2px 10px; border-radius: 50px; font-size: 0.78rem; font-weight: 800; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; margin-left: 8px; }
            .s27-btn-icon { width: 34px; height: 34px; border-radius: 50px !important; border: 1.5px solid #cbd5e1; background: #ffffff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: 0.2s; margin: 0 2px; }
            .s27-btn-icon.edit { color: #2563eb; }
            .s27-btn-icon.edit:hover { background: #eff6ff; border-color: #2563eb; }
            .s27-btn-icon.lock { color: #dc2626; }
            .s27-btn-icon.lock:hover { background: #fee2e2; border-color: #dc2626; }
            .s27-btn-icon.unlock { color: #16a34a; }
            .s27-btn-icon.unlock:hover { background: #dcfce7; border-color: #16a34a; }
            .s27-btn-icon.delete { color: #dc2626; }
            .s27-btn-icon.delete:hover { background: #fee2e2; border-color: #dc2626; }

            .s27-main-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; }
            @media (max-width: 1024px) {
                .s27-main-grid { grid-template-columns: 1fr !important; }
                .s27-header { border-radius: 20px !important; flex-direction: column; align-items: flex-start; gap: 12px; }
                .s27-header h1 { font-size: 1.15rem; }
                .s27-nav-tabs { flex-direction: column; }
                .s27-tab-btn { width: 100%; justify-content: center; }
            }
        `;
        document.head.appendChild(style);
    }

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

    let s27ExamRegistry = [];
    let s27SelectedSubjects = {};
    let s27AllocatedStudents = [];
    let s27SelectedStudentId = null;
    let s27CurrentGroupFilter = 'all';

    let s27EditingExamId = null;
    let s27EditingSubjects = {};

    const DEFAULT_SSC27_GROUPS = [
        { name: 'Group A (Science)', from: '1', to: '55' },
        { name: 'Group B (Science)', from: '56', to: '105' },
        { name: 'Group C (Science)', from: '106', to: '146' },
        { name: 'Group D (Humanities)', from: '1', to: '22' },
        { name: 'Group D (Business Studies)', from: '1', to: '5' }
    ];

    const DAILY_TEST_01_MERIT_GROUPS = {
        science: [
            "702723", "805524", "702123", "102017", "300919", "602722", "800824", "300319", "601422", "801224",
            "802624", "900525", "701423", "901425", "600822", "100917", "601722", "900625", "901125", "300219",
            "602022", "700223", "900125", "800324", "400120", "803324", "801124", "804924", "805224", "702823",
            "901625", "702523", "400620", "600222", "604422", "700523", "700623", "501021", "603522", "701823",
            "903325", "100417", "200718", "903025", "100317", "803824", "600722", "604322", "802724", "700923",
            "805724", "804124", "800924", "300719", "801424", "501921", "803424", "400220", "900225", "602822",
            "600122", "500521", "501421", "601922", "603822", "803724", "804724", "801824", "101517", "501721",
            "903125", "803224", "200518", "802024", "804324", "604022", "804424", "604222", "600522", "602922",
            "805024", "803924", "701923", "800524", "300119", "104416", "101317", "602622", "300519", "800224",
            "805824", "401220", "601222", "701123", "701723", "102117", "702023", "804024", "805324", "902525",
            "700823", "701623", "900425", "902425", "801024", "801324", "802424", "804224", "400920", "803624",
            "900825", "901325", "101017", "109516", "602522", "702223", "801924", "804624", "500921", "800424",
            "900725", "802824", "902325", "902725", "700123", "701023", "104716", "700423", "901025", "702423",
            "200218", "901525", "902625", "500821", "200818", "801524", "900325", "701523", "800624", "600422",
            "500321", "702923", "802924", "900925", "804824", "601822"
        ],
        humanities: [
            "601122", "603322", "901825", "604822", "805424", "902225", "902825", "603222", "603122", "500221",
            "603422", "901725", "601022", "301319", "501121", "802324", "803124", "903225", "602222", "200618",
            "802224", "501821"
        ],
        business: ["602322", "601322", "700723", "802124", "903525"]
    };

    function getDailyTest01Order() {
        return [
            ...DAILY_TEST_01_MERIT_GROUPS.science,
            ...DAILY_TEST_01_MERIT_GROUPS.humanities,
            ...DAILY_TEST_01_MERIT_GROUPS.business
        ];
    }

    function getDailyTest01GroupAllocations() {
        const allocations = {};
        DAILY_TEST_01_MERIT_GROUPS.science.forEach((studentId, index) => {
            allocations[studentId] = index < 55
                ? 'Group A (Science)'
                : index < 105
                    ? 'Group B (Science)'
                    : 'Group C (Science)';
        });
        DAILY_TEST_01_MERIT_GROUPS.humanities.forEach(studentId => {
            allocations[studentId] = 'Group D (Humanities)';
        });
        DAILY_TEST_01_MERIT_GROUPS.business.forEach(studentId => {
            allocations[studentId] = 'Group D (Business Studies)';
        });
        return allocations;
    }

    function isDailyTest01(exam) {
        const name = String(exam && (exam.name || exam.examName || exam.exam_name || exam.title) || '');
        return /^daily\s+test\s*[-–]?\s*0?1$/i.test(name.trim());
    }

    function getImmediatelyPreviousExam(currentExam, examList) {
        if (!currentExam || !Array.isArray(examList) || examList.length === 0) return null;

        const currentName = String(currentExam.name || currentExam.examName || currentExam.exam_name || currentExam.title || '').trim();
        const numMatch = currentName.match(/daily\s+test\s*[-–]?\s*0?(\d+)/i);

        if (numMatch) {
            const currentNum = parseInt(numMatch[1], 10);
            if (currentNum > 1) {
                const targetPrevNum = currentNum - 1;
                const prevByNum = examList.find(x => {
                    const xName = String(x.name || x.examName || x.exam_name || x.title || '').trim();
                    const xm = xName.match(/daily\s+test\s*[-–]?\s*0?(\d+)/i);
                    return xm && parseInt(xm[1], 10) === targetPrevNum;
                });
                if (prevByNum) return prevByNum;
            } else if (currentNum === 1) {
                return null;
            }
        }

        const getExamTime = (ex) => {
            if (ex.date) {
                const d = new Date(ex.date).getTime();
                if (!isNaN(d)) return d;
            }
            if (ex.createdAt) {
                const c = new Date(ex.createdAt).getTime();
                if (!isNaN(c)) return c;
            }
            const idMatch = String(ex.id || '').match(/(\d{10,})/);
            if (idMatch) return parseInt(idMatch[1], 10);
            return 0;
        };

        const sorted = [...examList].sort((a, b) => getExamTime(a) - getExamTime(b));
        const currentIdx = sorted.findIndex(x => x.id === currentExam.id);
        if (currentIdx > 0) {
            return sorted[currentIdx - 1];
        }

        return null;
    }

    async function fetchExamStudentTotalMarks(targetExamId) {
        if (!targetExamId) return {};
        const scores = {};
        try {
            const shallowRes = await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_marks.json?shallow=true`);
            if (shallowRes.ok) {
                const allKeys = await shallowRes.json();
                if (allKeys && typeof allKeys === 'object') {
                    const prefix = targetExamId + '_';
                    const matchingKeys = Object.keys(allKeys).filter(k => k.startsWith(prefix));

                    const promises = matchingKeys.map(async key => {
                        try {
                            const res = await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_marks/${encodeURIComponent(key)}.json`);
                            if (res.ok) {
                                const data = await res.json();
                                if (data && typeof data === 'object') {
                                    Object.keys(data).forEach(sId => {
                                        const rec = data[sId];
                                        if (!rec) return;
                                        let mark = 0;
                                        if (typeof rec === 'number') {
                                            mark = rec;
                                        } else if (typeof rec === 'object') {
                                            if (rec.rawMark !== undefined && rec.rawMark !== null && rec.rawMark !== '') {
                                                mark = parseFloat(rec.rawMark) || 0;
                                            } else if (rec.cq !== undefined && rec.cq !== null && rec.cq !== '') {
                                                mark = parseFloat(rec.cq) || 0;
                                            } else {
                                                mark = parseFloat(rec.mark || rec.marks || rec.total || 0) || 0;
                                            }
                                        }
                                        scores[sId] = (scores[sId] || 0) + mark;
                                    });
                                }
                            }
                        } catch (e) {
                            console.warn("Fetch subject marks error:", key, e);
                        }
                    });

                    await Promise.all(promises);
                }
            }
        } catch (err) {
            console.error("Marks fetch error:", err);
        }
        return scores;
    }

    async function loadSSC27ExamsFromCloud() {
        s27ExamRegistry = [];
        try {
            const res = await fetch(`${FIREBASE_BASE_URL}/cpscl_ssc27_exams.json`);
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    s27ExamRegistry = Array.isArray(data) ? data.filter(Boolean) : Object.values(data);
                }
            }
        } catch (e) {
            console.error("Firebase fetch error:", e);
        }

        renderSSC27ExamList();
        populateSSC27ExamDropdown();

        if (s27ExamRegistry.length > 0) {
            const sel = document.getElementById('s27TargetExamSelect');
            if (sel && (!sel.value || sel.value === '')) {
                sel.value = s27ExamRegistry[0].id;
            }
            window.loadSSC27StudentAllocation();
        }
    }

    async function getRealStudents() {
        let allStudents = [];
        try {
            const res = await fetch(`${FIREBASE_BASE_URL}/cpscl_students.json`);
            if (res.ok) {
                const val = await res.json();
                if (val) allStudents = Array.isArray(val) ? val : Object.values(val);
            }
        } catch (err) {
            console.error("Firebase student fetch error:", err);
        }

        return allStudents.filter(s => {
            const cName = String(s.class_name || s.class || s['Class Name *'] || '').trim().toLowerCase();
            const bName = String(s.section_batch || s.section || s.batch || s['Section/Batch *'] || '').trim().toLowerCase();
            const isClass10 = cName.includes('10') || cName.includes('ten') || cName.includes('ssc');
            const isSSC27 = bName.includes('ssc') || bName.includes('27') || bName.includes('prep');
            const isClass8 = cName.includes('eight') || cName.includes('8') || bName.includes('scholarship');
            return (isClass10 || isSSC27) && !isClass8;
        });
    }

    function getStudentId(student) {
        return String(student.student_id || student.std_id || student.id || student['Student ID *'] || '').trim();
    }

    async function saveSSC27Overrides(examId, allocations, meritOrder, saveMeritOrder, replaceMeritOrder, isWeeklyPromotion) {
        const path = `cpscl_exam_group_overrides/${examId}`;
        try {
            let currentData = {};
            const res = await fetch(`${FIREBASE_BASE_URL}/${path}.json`);
            if (res.ok) {
                const raw = await res.json();
                if (raw) currentData = raw;
            }
            const mergedData = { ...currentData, ...allocations };
            await fetch(`${FIREBASE_BASE_URL}/${path}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mergedData)
            });

            if (saveMeritOrder) {
                const meritPath = `cpscl_exam_group_overrides/${examId}_merit_order`;
                const mRes = await fetch(`${FIREBASE_BASE_URL}/${meritPath}.json`);
                const currentMerit = mRes.ok ? await mRes.json() : null;
                if (!currentMerit || replaceMeritOrder) {
                    await fetch(`${FIREBASE_BASE_URL}/${meritPath}.json`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(meritOrder)
                    });
                }
            }

            if (isWeeklyPromotion) {
                await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_group_overrides/${examId}_is_weekly.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(true)
                });
            }
        } catch (e) {
            console.error("Overrides save error:", e);
        }
    }

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
                    <div class="s27-badge"><i class="fa-solid fa-cloud-bolt"></i> 100% Direct Cloud Active</div>
                </div>

                <div class="s27-nav-tabs">
                    <button type="button" class="s27-tab-btn active" id="s27TabBtn1" onclick="window.switchSSC27Tab('tab1')">
                        <i class="fa-solid fa-file-pen"></i> 1. Exam Setup
                    </button>
                    <button type="button" class="s27-tab-btn" id="s27TabBtn2" onclick="window.switchSSC27Tab('tab2')">
                        <i class="fa-solid fa-shuffle"></i> 2. Merit Group Allocation & Seating
                    </button>
                </div>

                <div class="s27-tab-content active" id="s27TabContent1">
                    <div class="s27-main-grid">
                        <div class="s27-card">
                            <div class="s27-card-title">
                                <span><i class="fa-solid fa-file-pen"></i> Create Preparatory Daily Test</span>
                            </div>
                            <form id="s27ExamForm" onsubmit="window.handleSSC27Submit(event)">
                                <div class="s27-form-group">
                                    <label>Exam Title *</label>
                                    <input type="text" id="s27ExamName" class="s27-control" placeholder="e.g., Daily Test-08" required>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="s27-form-group">
                                        <label>Target Class *</label>
                                        <input type="text" id="s27ClassName" class="s27-control" value="Class 10" readonly style="background:#f8fafc; font-weight:700;">
                                    </div>
                                    <div class="s27-form-group">
                                        <label>Exam Date *</label>
                                        <input type="date" id="s27ExamDate" class="s27-control" value="${new Date().toISOString().split('T')[0]}" required>
                                    </div>
                                </div>
                                <div class="s27-form-group" style="margin-top: 14px;">
                                    <label>Master Individual Subjects (Click to Add • Default Full Mark: 20)</label>
                                    <div class="s27-pills-box" id="s27QuickPills"></div>
                                    <div style="display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap;">
                                        <input type="text" id="s27CustomSubInput" class="s27-control" style="flex: 1; min-width: 160px;" placeholder="Write custom subject...">
                                        <input type="number" id="s27CustomSubMark" class="s27-control" style="width: 90px; text-align: center;" value="20" placeholder="Marks">
                                        <button type="button" class="s27-btn-add" onclick="window.addSSC27CustomSubject()"><i class="fa-solid fa-plus"></i> Add</button>
                                    </div>
                                    <div id="s27SelectedSubsBox" style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 12px; overflow-x: auto;">
                                        <table class="s27-table">
                                            <thead>
                                                <tr>
                                                    <th>SUBJECT NAME</th>
                                                    <th style="width: 110px; text-align: center;">FULL MARKS</th>
                                                    <th style="width: 60px; text-align: right;">ACTION</th>
                                                </tr>
                                            </thead>
                                            <tbody id="s27SelectedSubsTbody"></tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="s27-form-group" style="margin-top: 20px; border-top: 2px solid #f1f5f9; padding-top: 15px;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
                                        <label style="margin: 0;"><i class="fa-solid fa-layer-group" style="color: #059669;"></i> Routine Groups & Merit Cutoffs</label>
                                        <button type="button" class="s27-btn-add" onclick="window.addSSC27GroupRow('', '', '')"><i class="fa-solid fa-plus"></i> Add Group</button>
                                    </div>
                                    <div id="s27GroupRulesContainer"></div>
                                </div>
                                <button type="submit" class="s27-btn-submit" id="s27SubmitBtn">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> Save Directly to Firebase Cloud
                                </button>
                            </form>
                        </div>
                        <div class="s27-card">
                            <div class="s27-card-title">
                                <span><i class="fa-solid fa-cloud"></i> Firebase Cloud Registered Exams</span>
                            </div>
                            <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
                                <table class="s27-table">
                                    <thead>
                                        <tr>
                                            <th>EXAM TITLE</th>
                                            <th>DATE</th>
                                            <th style="text-align: right;">ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody id="s27ExamListTbody"></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="s27-tab-content" id="s27TabContent2">
                    <div class="s27-card">
                        <div class="s27-card-title">
                            <div>
                                <span><i class="fa-solid fa-users-viewfinder"></i> Student Group Allocation & Seating</span>
                                <div id="s27SeatingInfoBadge" style="font-size: 0.82rem; color: #059669; font-weight: 700; margin-top: 3px;">
                                    <i class="fa-solid fa-circle-check"></i> Groups Locked • Bench seating arranged by rawMark within each group
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                                <select id="s27TargetExamSelect" class="s27-control" style="width: 310px; height: 38px; font-size: 0.85rem;" onchange="window.loadSSC27StudentAllocation()"></select>
                                <button type="button" class="s27-btn-add" style="background:#059669; color:#fff; border:none; padding: 8px 20px;" onclick="window.openSSC27BlankPrintModal()">
                                    <i class="fa-solid fa-print"></i> Print Isolated Blank Sheet
                                </button>
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 50px; padding: 10px 20px; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
                            <input type="text" id="s27StudentSearch" class="s27-control" style="max-width: 320px; height: 38px;" placeholder="Search student by Name or ID..." oninput="window.filterSSC27Students()">
                            <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                                <span id="s27SelectedLabel" style="font-size: 0.85rem; font-weight: 700; color: #64748b;">0 Selected</span>
                                <select id="s27TransferGroupSelect" class="s27-control" style="width: 220px; height: 38px;">
                                    <option value="">-- Shift to Group --</option>
                                </select>
                                <button type="button" class="s27-btn-add" style="background: #2563eb; color: #fff; border: none; height: 38px;" onclick="window.moveSelectedStudentToGroup()">Transfer</button>
                            </div>
                        </div>
                        <div id="s27GroupFilterPills" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;"></div>
                        <div style="overflow-x: auto; border: 1px solid #eef2f5; border-radius: 8px; -webkit-overflow-scrolling: touch;">
                            <table class="s27-table">
                                <thead>
                                    <tr>
                                        <th style="width: 120px;">GROUP SEAT / RANK</th>
                                        <th style="width: 140px;">STUDENT ID</th>
                                        <th>STUDENT NAME</th>
                                        <th style="text-align: right; width: 220px;">ASSIGNED GROUP</th>
                                    </tr>
                                </thead>
                                <tbody id="s27StudentTableTbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Blank Print Modal -->
            <div id="s27BlankModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:999999; display:none; align-items:center; justify-content:center; padding:10px;">
                <div style="background:#fff; border-radius:20px; width:100%; max-width:440px; padding:24px; box-shadow:0 15px 35px rgba(0,0,0,0.25);">
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
                        <button type="button" class="s27-btn-add" style="background:#059669; color:#fff; border:none;" onclick="window.executeSSC27BlankPrint()"><i class="fa-solid fa-print"></i> Print Clean Vector Sheet</button>
                    </div>
                </div>
            </div>

            <!-- Safe Edit Modal -->
            <div id="s27EditModal" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); z-index:999999; display:none; align-items:center; justify-content:center; padding:12px;">
                <div style="background:#fff; border-radius:20px; width:100%; max-width:540px; padding:22px; box-shadow:0 15px 35px rgba(0,0,0,0.25); max-height: 90vh; overflow-y: auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #e2e8f0; padding-bottom:10px;">
                        <div>
                            <h4 style="margin:0; font-size:1.1rem; font-weight:800; color:#0f172a;"><i class="fa-solid fa-pen-to-square" style="color:#2563eb;"></i> Add / Edit Exam Subjects</h4>
                            <span id="s27EditModalExamName" style="font-size:0.85rem; font-weight:700; color:#059669;">Exam: Daily Test</span>
                        </div>
                        <button type="button" onclick="window.closeSSC27EditModal()" style="border:none; background:none; font-size:1.3rem; cursor:pointer; color:#64748b;">✕</button>
                    </div>

                    <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:10px 14px; border-radius:12px; margin-bottom:15px; font-size:0.82rem; color:#166534;">
                        <i class="fa-solid fa-circle-check"></i> <strong>Safe Action:</strong> Adding new subjects will not affect or overwrite marks already entered by teachers.
                    </div>

                    <div class="s27-form-group">
                        <label>Click to Add Missing Routine Subject (Full Mark: 20)</label>
                        <div class="s27-pills-box" id="s27EditQuickPills"></div>
                    </div>

                    <div class="s27-form-group">
                        <label>Or Add Custom Subject</label>
                        <div style="display:flex; gap:8px; flex-wrap: wrap;">
                            <input type="text" id="s27EditCustomSubInput" class="s27-control" style="flex:1; min-width:160px;" placeholder="Write subject name...">
                            <input type="number" id="s27EditCustomSubMark" class="s27-control" style="width:90px; text-align:center;" value="20" placeholder="Marks">
                            <button type="button" class="s27-btn-add" onclick="window.addSSC27CustomSubjectToEdit()"><i class="fa-solid fa-plus"></i> Add</button>
                        </div>
                    </div>

                    <div class="s27-form-group" style="margin-top:15px;">
                        <label>Currently Registered Subjects in This Exam</label>
                        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 10px; max-height: 200px; overflow-y:auto;">
                            <table class="s27-table">
                                <thead>
                                    <tr>
                                        <th>SUBJECT</th>
                                        <th style="width: 100px; text-align: center;">FULL MARKS</th>
                                        <th style="width: 60px; text-align: right;">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody id="s27EditSelectedSubsTbody"></tbody>
                            </table>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px; border-top:1px solid #e2e8f0; padding-top:14px;">
                        <button type="button" class="s27-btn-add" onclick="window.closeSSC27EditModal()">Cancel</button>
                        <button type="button" class="s27-btn-add" id="s27EditSaveBtn" style="background:#2563eb; color:#fff; border:none; padding: 9px 24px;" onclick="window.saveSSC27SubjectChanges()">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Save Changes to Cloud
                        </button>
                    </div>
                </div>
            </div>
        `;

        initSSC27DefaultForm();
        await loadSSC27ExamsFromCloud();
    }

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
            DEFAULT_SSC27_GROUPS.forEach(group => {
                window.addSSC27GroupRow(group.name, group.from, group.to);
            });
        }

        const quickArea = document.getElementById('s27QuickPills');
        if (quickArea) {
            quickArea.innerHTML = '';
            const masterList = getMasterSubjectList();
            masterList.forEach(sub => {
                const p = document.createElement('div');
                p.className = 's27-pill';
                p.innerHTML = `<span>${sub} (20)</span> <i class="fa-solid fa-plus" style="font-size:0.75rem;"></i>`;
                p.onclick = () => {
                    const safeKey = cleanFirebaseKey(sub);
                    s27SelectedSubjects[safeKey] = 20;
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
        const rawName = nameInput.value.trim();
        const safeName = cleanFirebaseKey(rawName);
        const mark = parseInt(markInput.value) || 20;
        if (!safeName) return;
        s27SelectedSubjects[safeName] = mark;
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

    window.handleSSC27Submit = async function (e) {
        e.preventDefault();
        const submitBtn = document.getElementById('s27SubmitBtn');
        const name = document.getElementById('s27ExamName').value.trim();
        const className = document.getElementById('s27ClassName').value.trim();
        const date = document.getElementById('s27ExamDate').value;

        if (Object.keys(s27SelectedSubjects).length === 0) {
            alert("Please add at least one subject for the exam!");
            return;
        }

        const groups = [];
        document.querySelectorAll('#s27GroupRulesContainer .s27-group-row').forEach(row => {
            const gName = row.querySelector('.g-name').value.trim();
            const gFrom = row.querySelector('.g-from').value.trim();
            const gTo = row.querySelector('.g-to').value.trim();
            if (gName) groups.push({ name: gName, from: gFrom, to: gTo });
        });

        const cleanSubjects = {};
        let totalMarks = 0;
        Object.keys(s27SelectedSubjects).forEach(sub => {
            const safeSub = cleanFirebaseKey(sub);
            const m = parseInt(s27SelectedSubjects[sub]) || 0;
            cleanSubjects[safeSub] = m;
            totalMarks += m;
        });

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Saving directly to Firebase Cloud...`;

        const examObj = {
            id: 'SSC27_EX_' + Date.now(),
            name,
            class: className || 'Class 10',
            date,
            subjects: cleanSubjects,
            totalMarks,
            groups: groups.length > 0 ? groups : DEFAULT_SSC27_GROUPS,
            status: 'Active',
            createdAt: new Date().toISOString()
        };

        try {
            const res1 = await fetch(`${FIREBASE_BASE_URL}/cpscl_ssc27_exams/${examObj.id}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examObj)
            });

            if (!res1.ok) {
                const errTxt = await res1.text();
                throw new Error(`Firebase Server Error: ${res1.status} (${errTxt})`);
            }

            await fetch(`${FIREBASE_BASE_URL}/cpscl_exams/${examObj.id}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(examObj)
            });

            alert("Congratulations! Exam saved directly to Firebase Cloud successfully.");

            document.getElementById('s27ExamForm').reset();
            document.getElementById('s27ClassName').value = 'Class 10';
            s27SelectedSubjects = {};
            renderSSC27SelectedSubjects();
            initSSC27DefaultForm();

            await loadSSC27ExamsFromCloud();

        } catch (err) {
            alert("Save failed! Reason: " + err.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save Directly to Firebase Cloud`;
        }
    };

    function renderSSC27ExamList() {
        const tbody = document.getElementById('s27ExamListTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (s27ExamRegistry.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#94a3b8; padding:20px;">No SSC-27 exams found in Cloud.</td></tr>`;
            return;
        }

        s27ExamRegistry.forEach(ex => {
            const isLocked = (ex.status === 'Locked' || ex.status === 'Closed');
            const statusBadge = isLocked 
                ? `<span class="s27-status-badge" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5;">Locked (Closed)</span>`
                : `<span class="s27-status-badge" style="background:#dcfce7; color:#15803d; border:1px solid #bbf7d0;">Active (Live)</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong>${ex.name}</strong> ${statusBadge}<br>
                    <small style="color:#64748b;">${(ex.groups || []).length} Groups • Class: ${ex.class}</small>
                </td>
                <td style="font-weight:600; color:#475569;">${ex.date}</td>
                <td style="text-align: right; white-space: nowrap;">
                    <button type="button" class="s27-btn-icon edit" onclick="window.openSSC27EditModal('${ex.id}')" title="Add / Edit Missing Subjects">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button type="button" class="s27-btn-icon ${isLocked ? 'unlock' : 'lock'}" onclick="window.toggleSSC27ExamLock('${ex.id}')" title="${isLocked ? 'Unlock' : 'Lock'}">
                        <i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-lock-open'}"></i>
                    </button>
                    <button type="button" class="s27-btn-icon delete" onclick="window.deleteSSC27Exam('${ex.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Add / Edit Missing Subjects Modal
    window.openSSC27EditModal = function (examId) {
        const exam = s27ExamRegistry.find(x => x.id === examId);
        if (!exam) return;

        s27EditingExamId = examId;
        s27EditingSubjects = { ...(exam.subjects || {}) };

        document.getElementById('s27EditModalExamName').innerText = `Exam: ${exam.name} (${exam.date})`;

        renderEditingPills();
        renderEditingSubjectsTable();
        document.getElementById('s27EditModal').style.display = 'flex';
    };

    function renderEditingPills() {
        const pillContainer = document.getElementById('s27EditQuickPills');
        if (!pillContainer) return;
        pillContainer.innerHTML = '';

        const masterList = getMasterSubjectList();
        masterList.forEach(sub => {
            const safeKey = cleanFirebaseKey(sub);
            const isAlreadyAdded = !!s27EditingSubjects[safeKey];
            const p = document.createElement('div');
            p.className = 's27-pill';
            p.style.opacity = isAlreadyAdded ? '0.4' : '1';
            p.style.cursor = isAlreadyAdded ? 'default' : 'pointer';
            p.innerHTML = `<span>${sub} (20)</span> <i class="fa-solid ${isAlreadyAdded ? 'fa-check' : 'fa-plus'}" style="font-size:0.75rem;"></i>`;
            
            p.onclick = () => {
                if (!s27EditingSubjects[safeKey]) {
                    s27EditingSubjects[safeKey] = 20;
                    renderEditingSubjectsTable();
                    renderEditingPills();
                }
            };
            pillContainer.appendChild(p);
        });
    }

    function renderEditingSubjectsTable() {
        const tbody = document.getElementById('s27EditSelectedSubsTbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const subs = Object.keys(s27EditingSubjects);
        if (subs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#94a3b8; padding:15px;">No subjects added yet.</td></tr>`;
            return;
        }

        subs.forEach(sub => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${sub}</strong></td>
                <td style="text-align: center;">
                    <input type="number" class="s27-control" value="${s27EditingSubjects[sub]}" min="1" style="width: 70px; height: 32px; text-align: center; font-weight: 700;" oninput="s27EditingSubjects['${sub}'] = parseInt(this.value) || 0;">
                </td>
                <td style="text-align: right;">
                    <button type="button" class="s27-btn-icon delete" onclick="delete s27EditingSubjects['${sub}']; renderEditingSubjectsTable(); renderEditingPills();" title="Remove Subject"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.addSSC27CustomSubjectToEdit = function () {
        const nameInput = document.getElementById('s27EditCustomSubInput');
        const markInput = document.getElementById('s27EditCustomSubMark');
        if (!nameInput) return;
        const rawName = nameInput.value.trim();
        const safeName = cleanFirebaseKey(rawName);
        const mark = parseInt(markInput.value) || 20;
        if (!safeName) return;
        s27EditingSubjects[safeName] = mark;
        nameInput.value = '';
        renderEditingSubjectsTable();
        renderEditingPills();
    };

    window.closeSSC27EditModal = function () {
        document.getElementById('s27EditModal').style.display = 'none';
        s27EditingExamId = null;
        s27EditingSubjects = {};
    };

    window.saveSSC27SubjectChanges = async function () {
        if (!s27EditingExamId) return;
        const exam = s27ExamRegistry.find(x => x.id === s27EditingExamId);
        if (!exam) return;

        if (Object.keys(s27EditingSubjects).length === 0) {
            alert("Exam must have at least one subject!");
            return;
        }

        let totalMarks = 0;
        Object.values(s27EditingSubjects).forEach(m => {
            totalMarks += (parseInt(m) || 0);
        });

        const saveBtn = document.getElementById('s27EditSaveBtn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Updating in Cloud...`;

        try {
            await fetch(`${FIREBASE_BASE_URL}/cpscl_ssc27_exams/${s27EditingExamId}/subjects.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(s27EditingSubjects)
            });
            await fetch(`${FIREBASE_BASE_URL}/cpscl_ssc27_exams/${s27EditingExamId}/totalMarks.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(totalMarks)
            });

            await fetch(`${FIREBASE_BASE_URL}/cpscl_exams/${s27EditingExamId}/subjects.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(s27EditingSubjects)
            });
            await fetch(`${FIREBASE_BASE_URL}/cpscl_exams/${s27EditingExamId}/totalMarks.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(totalMarks)
            });

            exam.subjects = { ...s27EditingSubjects };
            exam.totalMarks = totalMarks;

            alert("Success! Subjects have been saved to Cloud successfully.");
            window.closeSSC27EditModal();
            renderSSC27ExamList();
        } catch (err) {
            alert("Update failed: " + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save Changes to Cloud`;
        }
    };

    window.toggleSSC27ExamLock = async function (examId) {
        const exam = s27ExamRegistry.find(x => x.id === examId);
        if (!exam) return;
        const newStatus = (exam.status === 'Locked' || exam.status === 'Closed') ? 'Active' : 'Closed';
        try {
            await fetch(`${FIREBASE_BASE_URL}/cpscl_ssc27_exams/${examId}/status.json`, {
                method: 'PUT',
                body: JSON.stringify(newStatus)
            });
            await fetch(`${FIREBASE_BASE_URL}/cpscl_exams/${examId}/status.json`, {
                method: 'PUT',
                body: JSON.stringify(newStatus)
            });
            exam.status = newStatus;
            renderSSC27ExamList();
        } catch(e) {
            alert("Status update failed: " + e.message);
        }
    };

    window.deleteSSC27Exam = async function (id) {
        if (!confirm("Are you sure you want to permanently delete this exam from Cloud?")) return;
        try {
            await fetch(`${FIREBASE_BASE_URL}/cpscl_ssc27_exams/${id}.json`, { method: 'DELETE' });
            await fetch(`${FIREBASE_BASE_URL}/cpscl_exams/${id}.json`, { method: 'DELETE' });
            alert("Exam deleted successfully from Firebase Cloud!");
            await loadSSC27ExamsFromCloud();
        } catch(e) {
            alert("Delete failed: " + e.message);
        }
    };

    function populateSSC27ExamDropdown() {
        const select = document.getElementById('s27TargetExamSelect');
        if (!select) return;
        select.innerHTML = '';
        if (s27ExamRegistry.length === 0) {
            select.innerHTML = '<option value="">No SSC-27 Exam Available</option>';
            return;
        }
        s27ExamRegistry.forEach(ex => {
            select.innerHTML += `<option value="${ex.id}">${ex.name} (${ex.date})</option>`;
        });
    }

    // =========================================================================
    // PROTECTED ZONE: Dual-Mode Seating & Promotion (Mode 1 & Mode 2)
    // 100% UNTOUCHED LOGIC
    // =========================================================================
    window.loadSSC27StudentAllocation = async function () {
        const select = document.getElementById('s27TargetExamSelect');
        const tbody = document.getElementById('s27StudentTableTbody');
        if (!select || !select.value) return;

        const exam = s27ExamRegistry.find(x => x.id === select.value);
        if (!exam) return;
        const examId = exam.id;

        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:30px;"><i class="fa-solid fa-circle-notch fa-spin" style="font-size:24px; color:#059669;"></i></td></tr>`;

        const students = await getRealStudents();
        const configuredGroups = (exam.groups && exam.groups.length > 0) ? exam.groups : DEFAULT_SSC27_GROUPS;

        const transferSel = document.getElementById('s27TransferGroupSelect');
        if (transferSel) {
            transferSel.innerHTML = '<option value="">-- Shift to Group --</option>';
            configuredGroups.forEach(g => {
                transferSel.innerHTML += `<option value="${g.name}">${g.name}</option>`;
            });
        }

        // Step 1: Fetch per-exam overrides
        let studentOverrides = {};
        try {
            const ovRes = await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_group_overrides/${examId}.json`);
            if (ovRes.ok) {
                const raw = await ovRes.json();
                if (raw && typeof raw === 'object') studentOverrides = raw;
            }
        } catch (e) {}

        // Step 2: Detect Mode via explicit _is_weekly flag
        let isWeeklyPromotionMode = false;
        let weeklyMeritOrder = null;
        try {
            const flagRes = await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_group_overrides/${examId}_is_weekly.json`);
            if (flagRes.ok) {
                const flagVal = await flagRes.json();
                if (flagVal === true) {
                    isWeeklyPromotionMode = true;
                }
            }
        } catch (e) {}

        if (isWeeklyPromotionMode) {
            try {
                const moRes = await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_group_overrides/${examId}_merit_order.json`);
                if (moRes.ok) {
                    const moRaw = await moRes.json();
                    if (Array.isArray(moRaw) && moRaw.length > 0) weeklyMeritOrder = moRaw;
                }
            } catch (e) {}
            if (!weeklyMeritOrder) {
                console.warn(`[CPSCL] _is_weekly flag is set for ${examId} but _merit_order is missing. Falling back to Daily Seating Mode.`);
                isWeeklyPromotionMode = false;
            }
        }

        // Step 3: Mode-specific context resolution
        const dailyTest01 = isDailyTest01(exam);
        const dailyTest01Allocations = getDailyTest01GroupAllocations();
        const dailyTest01Order = getDailyTest01Order();
        const dailyTest01OrderIndex = new Map(dailyTest01Order.map((sid, idx) => [sid, idx]));

        let studentScores = {};
        let previousExamUsed = null;
        let previousExamGroups = null;
        let prevMeritIndex = new Map();
        let manualTransfers = {};

        if (!isWeeklyPromotionMode && !dailyTest01) {
            previousExamUsed = getImmediatelyPreviousExam(exam, s27ExamRegistry);
            if (previousExamUsed) {
                try {
                    const pegRes = await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_group_overrides/${previousExamUsed.id}.json`);
                    if (pegRes.ok) {
                        const peg = await pegRes.json();
                        if (peg && typeof peg === 'object') previousExamGroups = peg;
                    }
                } catch (e) {
                    console.warn("Previous exam groups fetch error:", e);
                }

                studentScores = await fetchExamStudentTotalMarks(previousExamUsed.id);

                try {
                    const pmoRes = await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_group_overrides/${previousExamUsed.id}_merit_order.json`);
                    if (pmoRes.ok) {
                        const pmo = await pmoRes.json();
                        if (Array.isArray(pmo) && pmo.length > 0) {
                            pmo.forEach((sid, idx) => prevMeritIndex.set(String(sid).trim(), idx));
                        }
                    }
                } catch (e) {
                    console.warn("Previous exam merit order fetch error:", e);
                }
            }

            try {
                const mtRes = await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_group_overrides/${examId}_manual_transfers.json`);
                if (mtRes.ok) {
                    const mt = await mtRes.json();
                    if (mt && typeof mt === 'object') manualTransfers = mt;
                }
            } catch (e) {}
        }

        // Step 4: Build studentMap
        const studentMap = new Map();
        students.forEach(st => {
            const sId = getStudentId(st);
            if (!sId) return;

            let assignedGroup;
            if (isWeeklyPromotionMode) {
                assignedGroup = studentOverrides[sId] || dailyTest01Allocations[sId] || 'Group A (Science)';
            } else if (previousExamGroups && previousExamGroups[sId]) {
                assignedGroup = (manualTransfers && manualTransfers[sId]) || previousExamGroups[sId];
            } else {
                assignedGroup = (manualTransfers && manualTransfers[sId]) || studentOverrides[sId] || dailyTest01Allocations[sId] || 'Group A (Science)';
            }

            studentMap.set(sId, {
                raw: st,
                id: sId,
                name: String(st.name_english || st.student_name || st.name || st['Name (English) *'] || 'Student').trim(),
                group: assignedGroup,
                originalRank: dailyTest01OrderIndex.has(sId) ? dailyTest01OrderIndex.get(sId) : 999
            });
        });

        if (isWeeklyPromotionMode) {
            const meritIndex = new Map(weeklyMeritOrder.map((sid, idx) => [sid, idx]));
            studentMap.forEach(stu => {
                stu.weeklyMeritPos = meritIndex.has(stu.id) ? meritIndex.get(stu.id) : 99999;
            });
        }

        // Step 5: Update info badge in English
        const infoBadge = document.getElementById('s27SeatingInfoBadge');
        if (infoBadge) {
            if (isWeeklyPromotionMode) {
                infoBadge.innerHTML = `<i class="fa-solid fa-trophy" style="color:#f59e0b;"></i> <span style="color:#b45309; font-weight:800;">Weekly Cumulative Merit Group Promotion & Seating Active</span>`;
            } else if (previousExamUsed) {
                infoBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Groups Locked • Bench seating by <strong>${previousExamUsed.name}</strong> marks (Highest Score = Bench #1)`;
            } else {
                infoBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Groups Locked • Internal seating according to Baseline Merit List`;
            }
        }

        // Step 6: Allocate seats per group
        const allocated = [];
        const groupNames = [
            'Group A (Science)',
            'Group B (Science)',
            'Group C (Science)',
            'Group D (Humanities)',
            'Group D (Business Studies)'
        ];

        groupNames.forEach(grpName => {
            const grpStudents = Array.from(studentMap.values()).filter(s => s.group === grpName);

            if (isWeeklyPromotionMode) {
                grpStudents.sort((a, b) => {
                    if (a.weeklyMeritPos !== b.weeklyMeritPos) return a.weeklyMeritPos - b.weeklyMeritPos;
                    return a.originalRank - b.originalRank;
                });
            } else if (dailyTest01 || !previousExamUsed) {
                grpStudents.sort((a, b) => a.originalRank - b.originalRank);
            } else {
                grpStudents.sort((a, b) => {
                    const scoreA = (studentScores[a.id] !== undefined && studentScores[a.id] !== null) ? studentScores[a.id] : -1;
                    const scoreB = (studentScores[b.id] !== undefined && studentScores[b.id] !== null) ? studentScores[b.id] : -1;
                    if (scoreB !== scoreA) return scoreB - scoreA;

                    if (prevMeritIndex.size > 0) {
                        const idxA = prevMeritIndex.has(a.id) ? prevMeritIndex.get(a.id) : 99999;
                        const idxB = prevMeritIndex.has(b.id) ? prevMeritIndex.get(b.id) : 99999;
                        if (idxA !== idxB) return idxA - idxB;
                    }

                    if (a.originalRank !== b.originalRank) return a.originalRank - b.originalRank;
                    return a.id.localeCompare(b.id);
                });
            }

            grpStudents.forEach((st, idx) => {
                allocated.push({
                    sl: idx + 1,
                    id: st.id,
                    name: st.name,
                    group: st.group,
                    score: (studentScores[st.id] !== undefined && studentScores[st.id] !== null) ? studentScores[st.id] : null,
                    prevExamName: previousExamUsed ? previousExamUsed.name : null,
                    isWeeklyMode: isWeeklyPromotionMode
                });
            });
        });

        s27AllocatedStudents = allocated;

        // Step 7: Persist Mode 2 (Daily Seating)
        if (!isWeeklyPromotionMode) {
            const newMeritOrder = allocated.map(s => s.id);
            const newAllocations = {};
            allocated.forEach(s => {
                if (!studentOverrides[s.id]) newAllocations[s.id] = s.group;
            });
            if (Object.keys(newAllocations).length > 0 || (newMeritOrder && newMeritOrder.length > 0)) {
                try {
                    await saveSSC27Overrides(examId, newAllocations, newMeritOrder, true, true, false);
                } catch (err) {
                    console.error("Group note:", err);
                }
            }
        }

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

        const shortLabels = {
            'Group A (Science)': 'A (Science)',
            'Group B (Science)': 'B (Science)',
            'Group C (Science)': 'C (Science)',
            'Group D (Humanities)': 'D (Humanities)',
            'Group D (Business Studies)': 'D (Business)'
        };

        configuredGroups.forEach(g => {
            const count = s27AllocatedStudents.filter(s => s.group === g.name).length;
            const isActive = s27CurrentGroupFilter === g.name;
            const label = shortLabels[g.name] || g.name;
            html += `
                <button type="button" class="s27-btn-add ${isActive ? 'active' : ''}" onclick="window.setSSC27Filter('${g.name}')">
                    ${label} (${count})
                </button>
            `;
        });
        container.innerHTML = html;
    }

    window.setSSC27Filter = function (grp) {
        s27CurrentGroupFilter = grp;
        const exam = s27ExamRegistry.find(x => x.id === document.getElementById('s27TargetExamSelect').value);
        renderSSC27FilterPills(exam ? (exam.groups || DEFAULT_SSC27_GROUPS) : DEFAULT_SSC27_GROUPS);
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
            const scoreTxt = (st.score !== undefined && st.score !== null) 
                ? `<span class="s27-score-badge" title="Marks from ${st.prevExamName || 'Previous Exam'}">${st.prevExamName ? st.prevExamName + ' ' : ''}Marks: ${st.score}</span>` 
                : (st.prevExamName ? `<span class="s27-score-badge" style="background:#fef2f2; color:#dc2626; border:1px solid #fca5a5;">No Marks</span>` : '');
            tr.innerHTML = `
                <td><strong>#${st.sl}</strong></td>
                <td><strong>${st.id}</strong></td>
                <td><span style="font-weight:600;">${st.name}</span> ${scoreTxt}</td>
                <td style="text-align: right;"><span class="s27-group-badge">${st.group}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.moveSelectedStudentToGroup = async function () {
        if (!s27SelectedStudentId) {
            alert("Please select a student from the table first!");
            return;
        }
        const targetGroup = document.getElementById('s27TransferGroupSelect').value;
        if (!targetGroup) {
            alert("Please select a target group to transfer!");
            return;
        }

        const examId = document.getElementById('s27TargetExamSelect').value;
        const student = s27AllocatedStudents.find(s => s.id === s27SelectedStudentId);
        if (student) {
            student.group = targetGroup;
            try {
                await fetch(`${FIREBASE_BASE_URL}/cpscl_exam_group_overrides/${examId}_manual_transfers/${student.id}.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(targetGroup)
                });
                await saveSSC27Overrides(examId, { [student.id]: targetGroup }, null, false);
            } catch (error) {
                console.error('SSC-27 student group override error:', error);
            }

            s27SelectedStudentId = null;
            document.getElementById('s27SelectedLabel').innerText = '0 Selected';
            const exam = s27ExamRegistry.find(x => x.id === examId);
            renderSSC27FilterPills(exam ? (exam.groups || DEFAULT_SSC27_GROUPS) : DEFAULT_SSC27_GROUPS);
            renderSSC27StudentTable();
        }
    };

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
        const grps = (exam.groups && exam.groups.length > 0) ? exam.groups : DEFAULT_SSC27_GROUPS;
        grps.forEach(g => {
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
        printStudents.forEach((st) => {
            rowsHtml += `
                <tr>
                    <td>${st.sl}</td>
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
                            <th style="width: 10%;">Group Seat</th>
                            <th style="width: 20%;">Student ID</th>
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