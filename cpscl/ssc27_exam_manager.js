/* ==========================================================================
   MODULE: CPSCL Academic ERP
   SUB-SECTION: SSC-27 Preparatory Dynamic Suite (v14.0 Safe-Merge Shield)
   Path: cpscl/ssc27_exam_manager.js
   Architecture: Zero Data Loss | Safe Cloud Merging | Routine-Exact 20 Marks Engine
   Safety: 100% Protection for Class 8 & Other General Exams
   ========================================================================== */

(function () {
    console.log("Loading CPSCL SSC-27 Suite v14.0 (Safe-Merge Shield Active)...");

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
            .s27-status-badge { display: inline-block; padding: 3px 10px; border-radius: 50px !important; font-size: 0.72rem; font-weight: 800; }
            .s27-btn-icon { width: 34px; height: 34px; border-radius: 50px !important; border: 1.5px solid #cbd5e1; background: #ffffff; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; transition: 0.2s; margin: 0 2px; }
            .s27-btn-icon.lock { color: #dc2626; }
            .s27-btn-icon.lock:hover { background: #fee2e2; border-color: #dc2626; }
            .s27-btn-icon.unlock { color: #16a34a; }
            .s27-btn-icon.unlock:hover { background: #dcfce7; border-color: #16a34a; }
            .s27-btn-icon.delete { color: #dc2626; }
            .s27-btn-icon.delete:hover { background: #fee2e2; border-color: #dc2626; }
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
    const SSC27_EXAM_REGISTRY_PATH = 'cpscl_exams';
    
    // পিডিএফ রুটিন অনুযায়ী অফিশিয়াল গ্রুপ বিভাজন
    const DEFAULT_SSC27_GROUPS = [
        { name: 'Group A (Science)', from: '1', to: '55' },
        { name: 'Group B (Science)', from: '56', to: '105' },
        { name: 'Group C (Science)', from: '106', to: '146' },
        { name: 'Group D (Humanities)', from: '1', to: '22' },
        { name: 'Group D (Business Studies)', from: '1', to: '5' }
    ];

    // ১৭৩ জন শিক্ষার্থীর ফ্রোজেন মেধা ক্রম (Zero Shuffling Snapshot)
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

    async function getFirebaseCloudInstance() {
        if (typeof window.getDatabase === 'function' &&
            typeof window.ref === 'function' &&
            typeof window.get === 'function' &&
            typeof window.set === 'function') {
            const db = window.getDatabase();
            if (!db) return null;
            return {
                mode: 'modular',
                db,
                ref: window.ref,
                get: window.get,
                set: window.set,
                runTransaction: window.runTransaction || null
            };
        }
        return null;
    }

    function isSSC27Exam(exam) {
        if (!exam || !exam.id) return false;
        const normalize = values => values.filter(v => v !== null && v !== undefined).join(' ').toLowerCase();
        const classInfo = normalize([exam.class, exam.className, exam.class_name, exam.grade]);
        const metadata = normalize([exam.id, exam.session, exam.batch, exam.category, exam.name]);

        if (classInfo.includes('class 8') || classInfo.includes('eight scholarship')) return false;

        return /\bclass\s*10\b/.test(classInfo) ||
            /\bssc\b/.test(classInfo) ||
            metadata.includes('ssc 27') ||
            metadata.includes('ssc27') ||
            metadata.includes('daily test') ||
            String(exam.id).toUpperCase().startsWith('SSC27_');
    }

    function normalizeSSC27Exam(exam, fallbackId) {
        if (!exam || typeof exam !== 'object') return null;
        const id = exam.id || exam.examId || exam.exam_id || fallbackId;
        if (!id) return null;
        return {
            ...exam,
            id: String(id),
            name: exam.name || exam.examName || exam.exam_name || exam.title || '',
            class: exam.class || exam.className || exam.class_name || exam.grade || 'Class 10',
            date: exam.date || exam.examDate || exam.exam_date || '',
            status: exam.status || exam.examStatus || exam.exam_status || (exam.isLocked ? 'Closed' : 'Active')
        };
    }

    function getSSC27ExamRecords(data) {
        if (Array.isArray(data)) {
            return data.map(exam => normalizeSSC27Exam(exam)).filter(Boolean);
        }
        if (!data || typeof data !== 'object') return [];
        if (data.id || data.examId || data.exam_id) {
            const exam = normalizeSSC27Exam(data);
            return exam ? [exam] : [];
        }
        return Object.entries(data)
            .map(([key, exam]) => normalizeSSC27Exam(exam, key))
            .filter(Boolean);
    }

    function isDailyTest01(exam) {
        const name = String(exam && (exam.name || exam.examName || exam.exam_name || exam.title) || '');
        return /^daily\s+test\s*[-–]?\s*0?1$/i.test(name.trim());
    }

    // ক্লাউড থেকে SSC-27 পরীক্ষা লোড করা
    async function loadSSC27ExamsFromCloud() {
        const fb = await getFirebaseCloudInstance();
        let combinedMap = new Map();

        try {
            const cached = localStorage.getItem('cpscl_exams_registry');
            if (cached) {
                getSSC27ExamRecords(JSON.parse(cached)).forEach(x => {
                    if (isSSC27Exam(x)) combinedMap.set(String(x.id), x);
                });
            }
        } catch (error) {
            console.warn("Local SSC-27 exam cache read note:", error);
        }

        if (fb) {
            try {
                let mainRaw = null;
                const snap = await fb.get(fb.ref(fb.db, SSC27_EXAM_REGISTRY_PATH));
                if (snap.exists()) {
                    combinedMap.clear();
                    mainRaw = snap.val();
                    getSSC27ExamRecords(mainRaw).forEach(x => {
                        if (isSSC27Exam(x)) combinedMap.set(String(x.id), x);
                    });
                }
            } catch (e) {
                console.warn("Main cloud exams load note:", e);
            }
        }

        // Daily Test-01 এর ডিফল্ট গ্রুপ ও রুটিন এনশিওর করা
        const dailyTest01 = Array.from(combinedMap.values()).find(isDailyTest01);
        if (dailyTest01 && (!dailyTest01.groups || dailyTest01.groups.length === 0)) {
            dailyTest01.groups = DEFAULT_SSC27_GROUPS.map(group => ({ ...group }));
            try {
                await syncExamsToMainRegistry([dailyTest01]);
            } catch (err) {}
        }

        s27ExamRegistry = Array.from(combinedMap.values());
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

    // SAFE MERGE: সাধারণ পরীক্ষাগুলোকে বিন্দুমাত্র নষ্ট না করে শুধু SSC-27 অংশটি সিঙ্ক করা
    async function syncExamsToMainRegistry(examsToSync, removedIds = []) {
        if (!Array.isArray(examsToSync)) throw new Error("Exam registry must be an array.");

        const fb = await getFirebaseCloudInstance();
        if (!fb) throw new Error("Firebase is unavailable; the exam was not saved.");

        // ১. বর্তমান ক্লাউড রেজিস্ট্রি পড়া
        const snap = await fb.get(fb.ref(fb.db, SSC27_EXAM_REGISTRY_PATH));
        let currentCloudList = snap.exists() ? (Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val())) : [];

        // ২. সাধারণ পরীক্ষাগুলোকে (Non-SSC27) ১০০% অক্ষত রাখা
        const nonSSCExams = currentCloudList.filter(ex => ex && !isSSC27Exam(ex));

        // ৩. SSC-27 এর বর্তমান পরীক্ষাগুলো নিয়ে ম্যাপ তৈরি
        const sscMap = new Map();
        currentCloudList.filter(ex => ex && isSSC27Exam(ex)).forEach(ex => {
            sscMap.set(String(ex.id), ex);
        });

        // ডিলিট হওয়া আইডি বাদ দেওয়া
        removedIds.forEach(id => sscMap.delete(String(id)));

        // নতুন/আপডেট হওয়া পরীক্ষা যুক্ত করা
        examsToSync.forEach(ex => {
            if (isSSC27Exam(ex) && ex.id) sscMap.set(String(ex.id), ex);
        });

        // ৪. অক্ষত সাধারণ পরীক্ষা + SSC-27 এর তালিকা একত্র করা
        const mergedRegistry = [...nonSSCExams, ...sscMap.values()];

        await fb.set(fb.ref(fb.db, SSC27_EXAM_REGISTRY_PATH), mergedRegistry);
        localStorage.setItem('cpscl_exams_registry', JSON.stringify(mergedRegistry));
    }

    async function getRealStudents() {
        let allStudents = [];
        const fb = await getFirebaseCloudInstance();

        if (fb) {
            try {
                const snap = await fb.get(fb.ref(fb.db, 'cpscl_students'));
                if (snap.exists()) {
                    const val = snap.val();
                    allStudents = Array.isArray(val) ? val : Object.values(val);
                }
            } catch (err) {}
        }

        if (allStudents.length === 0) {
            try {
                const cached = localStorage.getItem('cpscl_students_cache');
                if (cached) allStudents = JSON.parse(cached);
            } catch (e) {}
        }

        if (allStudents.length > 0) {
            try { localStorage.setItem('cpscl_students_cache', JSON.stringify(allStudents)); } catch (e) {}
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

    function getStudentTrack(student) {
        const info = [
            student.department,
            student.student_category,
            student.studentCategory,
            student.academic_group,
            student.group,
            student.group_name,
            student.stream,
            student.sec
        ].filter(Boolean).join(' ').toLowerCase();
        if (/business|commerce|b\.?\s*studies/.test(info)) return 'business';
        if (/humanities|arts|\bhum\b/.test(info)) return 'humanities';
        return 'science';
    }

    function getStudentMeritRank(student) {
        const rank = Number(student.merit_rank || student.meritRank || student.overallRank || student.overall_rank || student.rank || student.merit_position);
        return Number.isFinite(rank) && rank > 0 ? rank : Number.POSITIVE_INFINITY;
    }

    function getConfiguredGroupForTrackRank(track, rank, groups) {
        const trackGroups = (groups || []).filter(group => {
            const name = String(group.name || '').toLowerCase();
            return track === 'business'
                ? /business|commerce|b\.?\s*studies/.test(name)
                : track === 'humanities'
                    ? /humanities|arts|\bhum\b/.test(name)
                    : /science/.test(name);
        });
        const group = trackGroups.find(item => {
            const from = Number.parseInt(item.from, 10);
            const to = Number.parseInt(item.to, 10);
            return Number.isFinite(from) && rank >= from && (!Number.isFinite(to) || rank <= to);
        });
        return group ? group.name : (trackGroups[0] ? trackGroups[0].name : 'Unassigned');
    }

    async function saveSSC27Overrides(examId, allocations, meritOrder, saveMeritOrder, replaceMeritOrder) {
        const path = `cpscl_exam_group_overrides/${examId}`;
        const fb = await getFirebaseCloudInstance();
        if (!fb) throw new Error('Firebase is unavailable; group allocation was not synced.');

        const snapCurrent = await fb.get(fb.ref(fb.db, path));
        const currentData = snapCurrent.exists() ? snapCurrent.val() : {};
        const mergedData = { ...currentData, ...allocations };

        await fb.set(fb.ref(fb.db, path), mergedData);

        if (saveMeritOrder) {
            const meritPath = `cpscl_exam_group_overrides/${examId}_merit_order`;
            const currentMeritSnap = await fb.get(fb.ref(fb.db, meritPath));
            if (!currentMeritSnap.exists() || replaceMeritOrder) {
                await fb.set(fb.ref(fb.db, meritPath), meritOrder);
            }
        }

        let cachedOverrides = {};
        try {
            cachedOverrides = JSON.parse(localStorage.getItem('cpscl_exam_group_overrides') || '{}');
        } catch (error) {}
        cachedOverrides[examId] = mergedData;
        if (saveMeritOrder) {
            cachedOverrides[`${examId}_merit_order`] = meritOrder;
        }
        localStorage.setItem('cpscl_exam_group_overrides', JSON.stringify(cachedOverrides));
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
                    <div class="s27-badge"><i class="fa-solid fa-shield-halved"></i> 20-Marks Daily Engine Active</div>
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
                    <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px;">
                        <div class="s27-card">
                            <div class="s27-card-title">
                                <span><i class="fa-solid fa-file-pen"></i> Create Preparatory Daily Test</span>
                            </div>
                            <form id="s27ExamForm" onsubmit="window.handleSSC27Submit(event)">
                                <div class="s27-form-group">
                                    <label>Exam Title *</label>
                                    <input type="text" id="s27ExamName" class="s27-control" placeholder="e.g., Daily Test-01" required>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div class="s27-form-group">
                                        <label>Target Class *</label>
                                        <input type="text" id="s27ClassName" class="s27-control" value="Class 10" readonly style="background:#f8fafc; font-weight:700;">
                                    </div>
                                    <div class="s27-form-group">
                                        <label>Exam Date *</label>
                                        <input type="date" id="s27ExamDate" class="s27-control" value="2026-11-16" required>
                                    </div>
                                </div>
                                <div class="s27-form-group" style="margin-top: 14px;">
                                    <label>Routine Subjects (Click to Add • Default Full Mark: 20)</label>
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
                                        <label style="margin: 0;"><i class="fa-solid fa-layer-group" style="color: #059669;"></i> Routine Groups & Merit Cutoffs</label>
                                        <button type="button" class="s27-btn-add" onclick="window.addSSC27GroupRow('', '', '')"><i class="fa-solid fa-plus"></i> Add Group</button>
                                    </div>
                                    <div id="s27GroupRulesContainer"></div>
                                </div>
                                <button type="submit" class="s27-btn-submit">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> Save & Sync with Live Tabulation
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
                            <span><i class="fa-solid fa-users-viewfinder"></i> Student Group Allocation & Isolated Blank Print</span>
                            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                                <select id="s27TargetExamSelect" class="s27-control" style="width: 310px; height: 38px; font-size: 0.85rem;" onchange="window.loadSSC27StudentAllocation()"></select>
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
                                <button type="button" class="s27-btn-add" style="background: #2563eb; color: #fff; border: none; height: 38px;" onclick="window.moveSelectedStudentToGroup()">Transfer</button>
                            </div>
                        </div>
                        <div id="s27GroupFilterPills" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px;"></div>
                        <div style="overflow-x: auto; border: 1px solid #eef2f5; border-radius: 8px;">
                            <table class="s27-table">
                                <thead>
                                    <tr>
                                        <th style="width: 90px;">MERIT RANK</th>
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
                        <button type="button" class="s27-btn-add" style="background:#059669; color:#fff; border:none;" onclick="window.executeSSC27BlankPrint()"><i class="fa-solid fa-print"></i> Print Clean Vector Sheet</button>
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

        // পিডিএফ রুটিনের সম্পূর্ণ বিষয়ের তালিকা (সবগুলো ২০ মার্কস ডিফল্ট)
        const routineSubjects = [
            "Physics", "Chemistry", "Biology", "Math", 
            "Ban 1", "Ban 2", "Eng 1", "Eng 2", 
            "ICT", "Reli", "Sci", 
            "Acc/Geo", "Fin/His", "B.En/Civ", "HM/Agri/HS"
        ];
        
        const quickArea = document.getElementById('s27QuickPills');
        if (quickArea) {
            quickArea.innerHTML = '';
            routineSubjects.forEach(sub => {
                const p = document.createElement('div');
                p.className = 's27-pill';
                p.innerHTML = `<span>${sub} (20)</span> <i class="fa-solid fa-plus" style="font-size:0.75rem;"></i>`;
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

    window.handleSSC27Submit = async function (e) {
        e.preventDefault();
        const name = document.getElementById('s27ExamName').value.trim();
        const className = document.getElementById('s27ClassName').value.trim();
        const date = document.getElementById('s27ExamDate').value;

        if (Object.keys(s27SelectedSubjects).length === 0) {
            alert("অনুগ্রহ করে অন্তত একটি বিষয় যুক্ত করুন!");
            return;
        }

        const groups = [];
        document.querySelectorAll('#s27GroupRulesContainer .s27-group-row').forEach(row => {
            const gName = row.querySelector('.g-name').value.trim();
            const gFrom = row.querySelector('.g-from').value.trim();
            const gTo = row.querySelector('.g-to').value.trim();
            if (gName) groups.push({ name: gName, from: gFrom, to: gTo });
        });

        let totalMarks = 0;
        Object.values(s27SelectedSubjects).forEach(m => totalMarks += m);

        const existingExam = s27ExamRegistry.find(x => x.name === name);
        const examObj = {
            id: existingExam ? existingExam.id : ('SSC27_EX_' + Date.now()),
            name,
            class: className || 'Class 10',
            date,
            subjects: { ...s27SelectedSubjects },
            totalMarks,
            groups: groups.length > 0 ? groups : DEFAULT_SSC27_GROUPS,
            status: existingExam ? existingExam.status : 'Active',
            createdAt: new Date().toISOString()
        };

        try {
            await syncExamsToMainRegistry([examObj]);
            s27ExamRegistry = s27ExamRegistry.filter(exam => exam.id !== examObj.id);
            s27ExamRegistry.unshift(examObj);
        } catch (error) {
            console.error("SSC-27 exam cloud sync failed:", error);
            alert(`পরীক্ষাটি Firebase-এ সংরক্ষণ হয়নি: ${error.message}`);
            return;
        }

        alert("Daily Test পরীক্ষা সফলভাবে তৈরি হয়েছে এবং লাইভ ট্যাবুলেশনের সাথে যুক্ত হয়েছে!");

        document.getElementById('s27ExamForm').reset();
        document.getElementById('s27ClassName').value = 'Class 10';
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
            tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#94a3b8; padding:20px;">No SSC-27 exams found.</td></tr>`;
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
                    <button type="button" class="s27-btn-icon ${isLocked ? 'unlock' : 'lock'}" onclick="window.toggleSSC27ExamLock('${ex.id}')" title="${isLocked ? 'Unlock' : 'Lock'}">
                        <i class="fa-solid ${isLocked ? 'fa-lock' : 'fa-lock-open'}"></i>
                    </button>
                    <button type="button" class="s27-btn-icon delete" onclick="window.deleteSSC27Exam('${ex.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.toggleSSC27ExamLock = async function (examId) {
        const exam = s27ExamRegistry.find(x => x.id === examId);
        if (!isSSC27Exam(exam)) return;
        const previousStatus = exam.status;
        const isCurrentlyLocked = (exam.status === 'Locked' || exam.status === 'Closed');
        exam.status = isCurrentlyLocked ? 'Active' : 'Closed';
        try {
            await syncExamsToMainRegistry([exam]);
        } catch (error) {
            exam.status = previousStatus;
            console.error("SSC-27 exam status sync failed:", error);
            alert(`স্ট্যাটাস Firebase-এ সংরক্ষণ হয়নি: ${error.message}`);
        }
        renderSSC27ExamList();
    };

    window.deleteSSC27Exam = async function (id) {
        const exam = s27ExamRegistry.find(x => x.id === id);
        if (!isSSC27Exam(exam)) return;
        if (!confirm("Are you sure to delete this exam?")) return;
        try {
            await syncExamsToMainRegistry([], [id]);
        } catch (error) {
            console.error("SSC-27 exam deletion sync failed:", error);
            alert(`পরীক্ষাটি Firebase থেকে মুছে ফেলা যায়নি: ${error.message}`);
            return;
        }

        s27ExamRegistry = s27ExamRegistry.filter(x => x.id !== id);
        renderSSC27ExamList();
        populateSSC27ExamDropdown();
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

    window.loadSSC27StudentAllocation = async function () {
        const select = document.getElementById('s27TargetExamSelect');
        const tbody = document.getElementById('s27StudentTableTbody');
        if (!select || !select.value) return;

        const exam = s27ExamRegistry.find(x => x.id === select.value);
        if (!exam) return;

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

        let overrides = {};
        try {
            const locOv = localStorage.getItem('cpscl_exam_group_overrides');
            if (locOv) overrides = JSON.parse(locOv);
        } catch(e){}

        const fb = await getFirebaseCloudInstance();
        if (fb) {
            try {
                const snap = await fb.get(fb.ref(fb.db, 'cpscl_exam_group_overrides'));
                if (snap.exists()) overrides = { ...overrides, ...(snap.val() || {}) };
            } catch(e){}
        }

        const studentOverrides = overrides[exam.id] && typeof overrides[exam.id] === 'object'
            ? overrides[exam.id]
            : {};
            
        const dailyTest01 = isDailyTest01(exam);
        const dailyTest01Order = dailyTest01 ? getDailyTest01Order() : [];
        const dailyTest01OrderIndex = new Map(dailyTest01Order.map((studentId, index) => [studentId, index]));
        const dailyTest01RankByStudentId = new Map([
            ...DAILY_TEST_01_MERIT_GROUPS.science.map((studentId, index) => [studentId, index + 1]),
            ...DAILY_TEST_01_MERIT_GROUPS.humanities.map((studentId, index) => [studentId, index + 1]),
            ...DAILY_TEST_01_MERIT_GROUPS.business.map((studentId, index) => [studentId, index + 1])
        ]);
        const dailyTest01Allocations = dailyTest01 ? getDailyTest01GroupAllocations() : {};
        const savedMeritOrder = Array.isArray(overrides[`${exam.id}_merit_order`])
            ? overrides[`${exam.id}_merit_order`]
            : [];

        const orderedStudents = students
            .filter(student => {
                const studentId = getStudentId(student);
                return studentId && (!dailyTest01 || dailyTest01OrderIndex.has(studentId));
            })
            .sort((a, b) => {
                const idA = getStudentId(a);
                const idB = getStudentId(b);
                if (dailyTest01) return dailyTest01OrderIndex.get(idA) - dailyTest01OrderIndex.get(idB);
                const rankA = getStudentMeritRank(a);
                const rankB = getStudentMeritRank(b);
                if (savedMeritOrder.length) {
                    const savedA = savedMeritOrder.indexOf(idA);
                    const savedB = savedMeritOrder.indexOf(idB);
                    const orderA = savedA === -1 ? Number.POSITIVE_INFINITY : savedA;
                    const orderB = savedB === -1 ? Number.POSITIVE_INFINITY : savedB;
                    if (orderA !== orderB) return orderA - orderB;
                }
                if (rankA !== rankB) return rankA - rankB;
                return idA.localeCompare(idB);
            });

        const trackRanks = new Map();
        ['science', 'humanities', 'business'].forEach(track => {
            orderedStudents.filter(student => getStudentTrack(student) === track)
                .forEach((student, index) => trackRanks.set(getStudentId(student), index + 1));
        });

        const newAllocations = {};
        const meritOrder = dailyTest01 ? dailyTest01Order : orderedStudents.map(getStudentId);
        if (dailyTest01) {
            Object.entries(dailyTest01Allocations).forEach(([studentId, group]) => {
                if (studentOverrides[studentId] !== group) newAllocations[studentId] = group;
            });
        }

        const meritByStudentId = new Map(orderedStudents.map((student, index) => [getStudentId(student), index + 1]));
        s27AllocatedStudents = orderedStudents.map(st => {
            const sId = getStudentId(st);
            const track = getStudentTrack(st);
            const trackRank = trackRanks.get(sId);
            const assignedGroup = (dailyTest01 ? dailyTest01Allocations[sId] : studentOverrides[sId]) ||
                getConfiguredGroupForTrackRank(track, trackRank, configuredGroups);
            if (!dailyTest01 && !studentOverrides[sId]) newAllocations[sId] = assignedGroup;

            const savedRank = getStudentMeritRank(st);
            return {
                sl: dailyTest01
                    ? dailyTest01RankByStudentId.get(sId)
                    : Number.isFinite(savedRank) ? savedRank : meritByStudentId.get(sId),
                id: sId,
                name: String(st.name_english || st.student_name || st.name || st['Name (English) *'] || 'Student').trim(),
                group: assignedGroup
            };
        });

        const shouldSaveMeritOrder = dailyTest01
            ? savedMeritOrder.length !== meritOrder.length || savedMeritOrder.some((studentId, index) => studentId !== meritOrder[index])
            : savedMeritOrder.length === 0;

        if (Object.keys(newAllocations).length || shouldSaveMeritOrder) {
            try {
                await saveSSC27Overrides(exam.id, newAllocations, meritOrder, shouldSaveMeritOrder, dailyTest01);
                Object.assign(studentOverrides, newAllocations);
                overrides[exam.id] = studentOverrides;
                if (shouldSaveMeritOrder) overrides[`${exam.id}_merit_order`] = meritOrder;
            } catch (error) {
                console.error('SSC-27 group allocation note:', error);
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
            let overrides = {};
            try {
                const loc = localStorage.getItem('cpscl_exam_group_overrides');
                if (loc) overrides = JSON.parse(loc);
            } catch(e){}

            if (!overrides[examId]) overrides[examId] = {};
            overrides[examId][student.id] = targetGroup;
            localStorage.setItem('cpscl_exam_group_overrides', JSON.stringify(overrides));

            try {
                await saveSSC27Overrides(examId, { [student.id]: targetGroup }, null, false);
            } catch (error) {
                console.error('SSC-27 student group override note:', error);
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
                            <th style="width: 8%;">Merit Rank</th>
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
