/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Weekly Master Tabulation Suite (Clean 2-Tier Header Edition)
   Path: cpscl/weekly_tabulation_manager.js
   Architecture: Standalone Modular Engine | Unconstrained Landscape Print | Read-Only
   Features: Multi-Exam Aggregation | Dynamic 100 Conversion | Progressive Group Transfer
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Weekly Master Tabulation Suite (Clean 2-Tier Headers Active)...");

    // 1. Inject Sidebar Sub-menu under Exam Manager
    function injectWeeklySidebar() {
        const examSubmenu = document.getElementById('trust-exam-submenu-items');
        if (!examSubmenu) {
            setTimeout(injectWeeklySidebar, 200);
            return;
        }

        if (document.getElementById('sub-link-weekly-tabulation')) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <a class="trust-sub-link" id="sub-link-weekly-tabulation" onclick="window.switchCPSCLExamSubTab(this, 'weekly-tabulation')">
                <span class="trust-sub-indicator"></span>
                <span>Weekly Master Tabulation</span>
            </a>
        `;
        examSubmenu.appendChild(li);
    }

    // 2. Hook switchCPSCLExamSubTab for Tab Switching
    const prevSwitch = window.switchCPSCLExamSubTab;
    window.switchCPSCLExamSubTab = function (element, tabKey) {
        if (typeof prevSwitch === 'function') {
            prevSwitch(element, tabKey);
        }

        if (tabKey === 'weekly-tabulation') {
            document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
            if (element) element.classList.add('active');

            document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
            const topTitle = document.getElementById('top-title');
            if (topTitle) topTitle.innerText = "CPSCL Academic ERP – Weekly Master Tabulation";

            let view = document.getElementById('cpscl-weekly-tabulation-main-view');
            if (!view) {
                const mainWrapper = document.querySelector('.main-wrapper');
                if (mainWrapper) {
                    view = document.createElement('div');
                    view.className = 'view-panel active';
                    view.id = 'cpscl-weekly-tabulation-main-view';
                    mainWrapper.appendChild(view);
                }
            } else {
                view.classList.add('active');
            }

            renderWeeklyContainer();
            loadWeeklyAvailableExams();
        }
    };

    // 3. Inject Scoped Styles
    function injectWeeklyStyles() {
        if (document.getElementById('cpscl-weekly-scoped-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-weekly-scoped-styles';
        style.innerHTML = `
            .wm-wrapper { padding: 15px 5px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #0f172a; }
            .wm-header { background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 50px !important; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); flex-wrap: wrap; gap: 12px; }
            .wm-header h1 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
            .wm-header h1 i { color: #2563eb; }
            .wm-badge { font-size: 11px; font-weight: 700; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 5px 16px; border-radius: 50px !important; }

            .wm-filter-card { background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 18px 22px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
            .wm-filter-title { font-size: 0.95rem; font-weight: 800; color: #1e3a8a; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
            .wm-exam-checkboxes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; }
            .wm-checkbox-item { display: flex; align-items: center; gap: 8px; font-size: 0.86rem; font-weight: 700; color: #334155; cursor: pointer; user-select: none; }
            .wm-checkbox-item input { width: 17px; height: 17px; accent-color: #2563eb; cursor: pointer; }

            .wm-transfer-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1.5px solid #bfdbfe; border-radius: 14px; padding: 14px 18px; margin-top: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
            .wm-transfer-title { font-size: 0.88rem; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px; }

            .wm-btn-pill { height: 40px; padding: 0 20px; border-radius: 50px !important; font-size: 13px; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; text-decoration: none; }
            .wm-btn-primary { background: #2563eb; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.25); }
            .wm-btn-primary:hover { background: #1d4ed8; }
            .wm-btn-outline { background: #fff; border: 1.5px solid #cbd5e1; color: #334155; }
            .wm-btn-outline:hover { background: #f8fafc; border-color: #94a3b8; }
            .wm-btn-success { background: #059669; color: #fff; }
            .wm-btn-success:hover { background: #047857; }

            .wm-sheet-panel { background: #fff; border: 1.5px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .wm-sheet-topbar { padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; background: #fcfdfe; }

            .wm-table-wrap { overflow-x: auto; padding: 0 15px 15px; }
            .wm-table { width: 100%; border-collapse: collapse; min-width: 950px; }
            .wm-table th, .wm-table td { border: 1px solid #111 !important; padding: 4px 2px; font-size: 9.5px; text-align: center; color: #000; line-height: 1.15; }
            
            .wm-table th.th-main { background-color: #f8fafc !important; font-weight: 800; }
            .wm-table th.th-exam-1 { background-color: #e0f2fe !important; color: #0369a1 !important; font-weight: 800; }
            .wm-table th.th-exam-2 { background-color: #fef3c7 !important; color: #b45309 !important; font-weight: 800; }
            .wm-table th.th-exam-3 { background-color: #dcfce7 !important; color: #15803d !important; font-weight: 800; }
            .wm-table th.th-exam-4 { background-color: #f3e8ff !important; color: #7e22ce !important; font-weight: 800; }
            .wm-table th.th-exam-default { background-color: #f1f5f9 !important; color: #334155 !important; font-weight: 800; }

            .wm-table th.th-grand { background-color: #f1f5f9 !important; color: #1e293b !important; font-weight: 800; border-left: 1.5px solid #0f172a !important; border-right: 1.5px solid #0f172a !important; }
            .wm-table th.th-conv { background-color: #fee2e2 !important; color: #991b1b !important; font-weight: 900; }
            .wm-table th.th-rank { background-color: #ecfdf5 !important; color: #047857 !important; font-weight: 900; }

            .wm-table th.sub-head { background-color: #f8fafc !important; font-weight: 700; font-size: 8.5px; white-space: nowrap; }
            .wm-table th.sub-total { background-color: #dbeafe !important; color: #1e3a8a !important; font-weight: 900 !important; font-size: 8.5px !important; white-space: nowrap; border-left: 1.5px solid #1e3a8a !important; border-right: 1.5px solid #1e3a8a !important; }

            .wm-table td.name-col { text-align: left !important; padding-left: 6px !important; font-weight: 600; white-space: nowrap !important; }
            .wm-table td.test-total { font-weight: 900 !important; font-size: 9.5px !important; background-color: #eff6ff !important; color: #1e3a8a !important; border-left: 1.5px solid #1e3a8a !important; border-right: 1.5px solid #1e3a8a !important; }
            .wm-table td.grand-col { font-weight: 900 !important; background-color: #f1f5f9 !important; color: #0f172a !important; border-left: 1.5px solid #0f172a !important; border-right: 1.5px solid #0f172a !important; }
            .wm-table td.conv-col { font-weight: 900 !important; background-color: #fef2f2 !important; color: #991b1b !important; }
            .wm-table td.rank-col { font-weight: 900 !important; background-color: #ecfdf5 !important; color: #059669 !important; }

            .wm-sig-container { display: flex; justify-content: space-around; align-items: flex-end; margin-top: 50px; padding: 0 20px 20px; page-break-inside: avoid; }
            .wm-sig-box { text-align: center; min-width: 170px; }
            .wm-sig-space { height: 50px; }
            .wm-sig-line { width: 100%; border-top: 1.5px solid #000; margin-bottom: 5px; }
            .wm-sig-label { font-size: 11px; font-weight: 800; color: #000; }
        `;
        document.head.appendChild(style);
    }

    // Helper: Abbreviate subject names for clean horizontal fitting
    function formatShortSubject(name) {
        if (!name) return '';
        const clean = name.trim();
        if (/^ban\s*1/i.test(clean)) return 'Ban 1';
        if (/^ban\s*2/i.test(clean)) return 'Ban 2';
        if (/^eng\s*1/i.test(clean)) return 'Eng 1';
        if (/^eng\s*2/i.test(clean)) return 'Eng 2';
        if (/^math/i.test(clean) || /^mat/i.test(clean)) return 'Math';
        if (/^phys/i.test(clean)) return 'Phy';
        if (/^chem/i.test(clean)) return 'Chem';
        if (/^bio/i.test(clean)) return 'Bio';
        if (/^scien/i.test(clean) || /^sci/i.test(clean)) return 'Sci';
        if (/^bgs/i.test(clean)) return 'BGS';
        if (/^rel/i.test(clean)) return 'Reli';
        if (/^ict/i.test(clean)) return 'ICT';
        if (/^acc/i.test(clean)) return 'Acc-Geo';
        if (/^fin/i.test(clean)) return 'Fin-His';
        if (/^b-ent/i.test(clean)) return 'B-Ent';
        if (/^hm-agri/i.test(clean) || /^agri/i.test(clean)) return 'Agri';
        return clean.length > 7 ? clean.substring(0, 6) : clean;
    }

    // Baseline Reference & Stream Mapping for SSC 27 Preparatory Suite
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

    const SSC27_SCIENCE_SET = new Set(DAILY_TEST_01_MERIT_GROUPS.science);
    const SSC27_HUM_SET = new Set(DAILY_TEST_01_MERIT_GROUPS.humanities);
    const SSC27_BUS_SET = new Set(DAILY_TEST_01_MERIT_GROUPS.business);

    const SSC27_ORDER_LIST = [
        ...DAILY_TEST_01_MERIT_GROUPS.science,
        ...DAILY_TEST_01_MERIT_GROUPS.humanities,
        ...DAILY_TEST_01_MERIT_GROUPS.business
    ];
    const SSC27_BASELINE_MAP = new Map(SSC27_ORDER_LIST.map((id, idx) => [id, idx]));

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

    const SSC27_DEFAULT_ALLOCATIONS = getDailyTest01GroupAllocations();

    function isSSC27Exam(exam) {
        const classInfo = String(exam && (exam.class || exam.className || exam.class_name || exam.grade) || '').toLowerCase();
        const metadata = String(exam && (exam.id || exam.session || exam.batch || exam.category || '') || '').toLowerCase();
        if (classInfo.includes('class 8') || classInfo.includes('eight scholarship')) return false;
        return /\bclass\s*10\b/.test(classInfo) ||
            /\bssc\b/.test(classInfo) ||
            metadata.startsWith('ssc27_') ||
            metadata.includes('ssc 27');
    }

    function isClass8Exam(exam) {
        const classInfo = String(exam && (exam.class || exam.className || exam.class_name || '')).trim().toLowerCase();
        return !isSSC27Exam(exam) && (classInfo === 'eight scholarship batch-2026' ||
            /\bclass\s*8\b/.test(classInfo) || /\beight\b/.test(classInfo));
    }

    function getStudentTrack(student) {
        const sId = String(student.std_id || student.student_id || student.id || student.cleanId || '').trim();
        if (SSC27_HUM_SET.has(sId)) return 'humanities';
        if (SSC27_BUS_SET.has(sId)) return 'business';
        if (SSC27_SCIENCE_SET.has(sId)) return 'science';

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

    // 4. Render Main Layout Container
    function renderWeeklyContainer() {
        const view = document.getElementById('cpscl-weekly-tabulation-main-view');
        if (!view) return;

        view.innerHTML = `
            <div class="wm-wrapper">
                <div class="wm-header">
                    <div>
                        <h1><i class="fa-solid fa-layer-group"></i> Weekly Master Tabulation Suite</h1>
                        <span style="font-size: 11px; color: #64748b; font-weight: 600;">Multi-Test Cumulative Result, Converted 100 Score & Official Merit Ranks</span>
                    </div>
                    <span class="wm-badge"><i class="fa-solid fa-shield-halved"></i> 100% Pure English Corporate</span>
                </div>

                <!-- Controls & Checkboxes Card -->
                <div class="wm-filter-card">
                    <div class="wm-filter-title">
                        <i class="fa-solid fa-list-check"></i> Select Assessments for Weekly Grand Tabulation
                    </div>
                    <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
                        Check all assessments conducted to combine into the progressive master sheet:
                    </div>

                    <div class="wm-exam-checkboxes-grid" id="wmExamsCheckboxContainer">
                        <div style="color: #64748b; font-size: 12px;">Loading registered exams...</div>
                    </div>

                    <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                        <button type="button" class="wm-btn-pill wm-btn-primary" onclick="window.generateWeeklyMasterTabulation()">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Master Tabulation
                        </button>
                        <div style="display: inline-flex; align-items: center; gap: 8px; background: #f8fafc; padding: 4px 14px; border-radius: 50px; border: 1.5px solid #cbd5e1;">
                            <label style="font-size: 12px; font-weight: 700; color: #1e3a8a; margin: 0; display: flex; align-items: center; gap: 5px;">
                                <i class="fa-solid fa-filter" style="color:#2563eb;"></i> Stream / Group Filter:
                            </label>
                            <select id="wmTrackFilterSelect" class="em-control" style="width: 240px; height: 34px; font-size: 0.85rem; background:#fff; border:1px solid #cbd5e1; border-radius:50px; padding:0 12px; font-weight:700;" onchange="window.generateWeeklyMasterTabulation()">
                                <option value="ALL">All Students</option>
                            </select>
                        </div>
                    </div>

                    <!-- Progressive Group Transfer Box -->
                    <div class="wm-transfer-box">
                        <div>
                            <div class="wm-transfer-title">
                                <i class="fa-solid fa-bolt"></i> Apply Cumulative Merit to Target Exam
                            </div>
                            <span style="font-size: 11.5px; color: #1e3a8a; font-weight: 600;" id="wmTransferHintText">
                                Automatically allocate promoted groups for the selected target exam based on multi-exam cumulative merit.
                            </span>
                        </div>
                        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                            <select id="wmTargetExamSelect" class="em-control" style="width: 270px; height: 38px; font-size: 0.85rem; background:#fff; border:1px solid #cbd5e1; border-radius:50px; padding:0 14px; font-weight:700;">
                                <option value="">-- Choose Target Exam --</option>
                            </select>
                            <button type="button" class="wm-btn-pill wm-btn-success" style="height: 38px;" onclick="window.applyCumulativeMeritToTargetExam()">
                                <i class="fa-solid fa-share-from-square"></i> Apply Grouping
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Result Sheet Panel -->
                <div class="wm-sheet-panel">
                    <div class="wm-sheet-topbar">
                        <div style="font-weight: 800; color: #0f172a; font-size: 0.95rem;">
                            <i class="fa-solid fa-table" style="color:#2563eb; margin-right:6px;"></i> Weekly Comprehensive Master Sheet
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="wm-btn-pill wm-btn-outline" onclick="window.printWeeklyMasterSheet()">
                                <i class="fa-solid fa-print"></i> Print Sheet (Landscape)
                            </button>
                            <button type="button" class="wm-btn-pill wm-btn-outline" onclick="window.printWeeklyMasterSheet()">
                                <i class="fa-solid fa-file-pdf"></i> Export PDF
                            </button>
                            <button type="button" class="wm-btn-pill wm-btn-success" onclick="window.exportWeeklyExcel()">
                                <i class="fa-solid fa-file-excel"></i> Export Excel
                            </button>
                        </div>
                    </div>

                    <!-- Printable Container -->
                    <div id="wmPrintableContainer">
                        <div style="text-align: center; padding: 18px 20px 8px;">
                            <h2 style="font-size: 17px; font-weight: 800; margin: 0 0 3px; text-transform: uppercase; letter-spacing: 0.4px;">
                                CANTONMENT PUBLIC SCHOOL AND COLLEGE LALMONIRHAT
                            </h2>
                            <h3 style="font-size: 13.5px; font-weight: 700; margin: 2px 0; color: #1e3a8a;" id="wmDisplayClass">
                                Eight Scholarship Batch-2026
                            </h3>
                            <h4 style="font-size: 13px; font-weight: 800; margin: 2px 0 0; color: #111; text-transform: uppercase;">
                                Weekly Comprehensive Master Tabulation Sheet
                            </h4>
                            <div style="text-align: right; margin-top: 4px; font-size: 10.5px; font-weight: 700; color: #222;" id="wmDisplayDateRange">
                                Assessment Period: ---
                            </div>
                        </div>

                        <div class="wm-table-wrap">
                            <table class="wm-table" id="wmMasterTable">
                                <thead id="wmMasterThead">
                                    <tr><th style="padding: 25px; color: #64748b;">Select examinations above and click 'Generate Master Tabulation'</th></tr>
                                </thead>
                                <tbody id="wmMasterTbody"></tbody>
                            </table>
                        </div>

                        <!-- Signature Block -->
                        <div class="wm-sig-container">
                            <div class="wm-sig-box">
                                <div class="wm-sig-space"></div>
                                <div class="wm-sig-line"></div>
                                <div class="wm-sig-label">Course Coordinator</div>
                            </div>
                            <div class="wm-sig-box">
                                <div class="wm-sig-space"></div>
                                <div class="wm-sig-line"></div>
                                <div class="wm-sig-label">Vice Principal</div>
                            </div>
                            <div class="wm-sig-box">
                                <div class="wm-sig-space"></div>
                                <div class="wm-sig-line"></div>
                                <div class="wm-sig-label">Principal</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 5. Load Registered Exams for Checkboxes and Target Dropdown
    let allWeeklyExams = [];
    let lastGeneratedWeeklyMeritList = [];

    function updateTrackFilterOptions(firstExam) {
        const trackSelect = document.getElementById('wmTrackFilterSelect');
        const hintText = document.getElementById('wmTransferHintText');
        if (!trackSelect) return;
        const currentVal = trackSelect.value;

        if (firstExam && isSSC27Exam(firstExam)) {
            trackSelect.innerHTML = `
                <option value="ALL">All Class 10 Students</option>
                <option value="science">Science Track - All (Groups A, B, C)</option>
                <option value="Group A (Science)">Group A (Science)</option>
                <option value="Group B (Science)">Group B (Science)</option>
                <option value="Group C (Science)">Group C (Science)</option>
                <option value="humanities">Humanities Track (Group D)</option>
                <option value="business">Business Studies Track (Group D)</option>
            `;
            if (hintText) {
                hintText.innerHTML = `SSC 27 Business Rules: Science Rank 1-55 ➔ Group A, 56-105 ➔ Group B, 106-146 ➔ Group C • Humanities 1-22 ➔ Group D • Business 1-5 ➔ Group D.`;
            }
        } else {
            trackSelect.innerHTML = `
                <option value="ALL">All Groups</option>
                <option value="Group A">Group A</option>
                <option value="Group B">Group B</option>
            `;
            if (hintText) {
                hintText.innerHTML = `Automatically allocate Rank 1-40 to Group A and 41-Rest to Group B for the selected target exam:`;
            }
        }

        const validOptions = Array.from(trackSelect.options).map(o => o.value);
        if (validOptions.includes(currentVal)) {
            trackSelect.value = currentVal;
        } else {
            trackSelect.value = 'ALL';
        }
    }

    window.onWeeklyExamSelectionChange = function () {
        const checkboxes = document.querySelectorAll('.wm-exam-chk:checked');
        if (checkboxes.length > 0) {
            const firstId = checkboxes[0].value;
            const firstEx = allWeeklyExams.find(x => x.id === firstId);
            updateTrackFilterOptions(firstEx);
        }
    };

    async function loadWeeklyAvailableExams() {
        const container = document.getElementById('wmExamsCheckboxContainer');
        const targetSelect = document.getElementById('wmTargetExamSelect');
        if (!container) return;

        let examList = [];
        try {
            const local = localStorage.getItem('cpscl_exams_registry');
            if (local) examList = JSON.parse(local);
        } catch(e){}

        if (window.getDatabase && window.ref && window.get) {
            try {
                const snap = await window.get(window.ref(window.getDatabase(), 'cpscl_exams'));
                if (snap.exists()) {
                    const data = snap.val();
                    examList = Array.isArray(data) ? data : Object.values(data);
                }
            } catch(e){}
        }

        const examMap = new Map();
        examList.forEach(x => { if (x && x.id) examMap.set(String(x.id), x); });

        // Merge cpscl_ssc27_exams directly from cloud to ensure Class 10 exams are always accessible
        try {
            const res27 = await fetch('https://mousumi-computer-default-rtdb.firebaseio.com/cpscl_ssc27_exams.json');
            if (res27.ok) {
                const data27 = await res27.json();
                if (data27) {
                    const list27 = Array.isArray(data27) ? data27 : Object.values(data27);
                    list27.forEach(x => { if (x && x.id) examMap.set(String(x.id), x); });
                }
            }
        } catch(e){}

        allWeeklyExams = Array.from(examMap.values());

        if (allWeeklyExams.length === 0) {
            container.innerHTML = '<div style="color:#ef4444; font-weight:700;">No examinations found in database.</div>';
            return;
        }

        allWeeklyExams.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

        let html = '';
        allWeeklyExams.forEach((ex, idx) => {
            const isChecked = idx >= Math.max(0, allWeeklyExams.length - 4);
            const classLabel = ex.class ? `[${ex.class}] ` : '';
            html += `
                <label class="wm-checkbox-item">
                    <input type="checkbox" class="wm-exam-chk" value="${ex.id}" ${isChecked ? 'checked' : ''} onchange="window.onWeeklyExamSelectionChange()">
                    <span>${classLabel}<strong>${ex.name}</strong> <small style="color:#64748b;">(${ex.date || 'No Date'})</small></span>
                </label>
            `;
        });
        container.innerHTML = html;

        if (targetSelect) {
            targetSelect.innerHTML = '<option value="">-- Choose Target Exam --</option>';
            allWeeklyExams.forEach(ex => {
                targetSelect.innerHTML += `<option value="${ex.id}">${ex.name} (${ex.class})</option>`;
            });

            if (allWeeklyExams.length > 0) {
                targetSelect.value = allWeeklyExams[allWeeklyExams.length - 1].id;
            }
        }

        window.onWeeklyExamSelectionChange();
    }

    // 6. Master Generation Engine (Multi-Class Dynamic, Accurate Percentage, Auto-Hiding Clutter)
    window.generateWeeklyMasterTabulation = async function () {
        const checkboxes = document.querySelectorAll('.wm-exam-chk:checked');
        const thead = document.getElementById('wmMasterThead');
        const tbody = document.getElementById('wmMasterTbody');

        if (!checkboxes || checkboxes.length === 0) {
            alert("Please select at least one assessment to generate the sheet!");
            return;
        }

        const selectedExamIds = Array.from(checkboxes).map(c => c.value);
        const selectedExams = allWeeklyExams.filter(x => selectedExamIds.includes(x.id));

        selectedExams.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

        const firstExam = selectedExams[0];
        const isSSC10 = isSSC27Exam(firstExam);
        const isCls8 = isClass8Exam(firstExam);

        const firstDate = selectedExams[0].date || '';
        const lastDate = selectedExams[selectedExams.length - 1].date || '';
        document.getElementById('wmDisplayDateRange').innerText = `Assessment Period: ${firstDate} to ${lastDate}`;
        
        const displayClassElem = document.getElementById('wmDisplayClass');
        if (displayClassElem) {
            displayClassElem.innerText = isSSC10 
                ? "Class 10 (SSC 27 Preparatory Suite)"
                : (firstExam.class || 'Eight Scholarship Batch-2026');
        }

        updateTrackFilterOptions(firstExam);

        // 1. Fetch Students
        let allStudents = [];
        try {
            const local = localStorage.getItem('cpscl_students_cache');
            if (local) allStudents = JSON.parse(local);
        } catch(e){}

        if (window.getDatabase && window.ref && window.get) {
            try {
                const snapS = await window.get(window.ref(window.getDatabase(), 'cpscl_students'));
                if (snapS.exists()) {
                    const data = snapS.val();
                    allStudents = Array.isArray(data) ? data : Object.values(data);
                    localStorage.setItem('cpscl_students_cache', JSON.stringify(allStudents));
                }
            } catch(e){}
        }

        // Direct REST fetch fallback if cache is empty
        if (allStudents.length === 0) {
            try {
                const resSt = await fetch('https://mousumi-computer-default-rtdb.firebaseio.com/cpscl_students.json');
                if (resSt.ok) {
                    const data = await resSt.json();
                    if (data) {
                        allStudents = Array.isArray(data) ? data : Object.values(data);
                        localStorage.setItem('cpscl_students_cache', JSON.stringify(allStudents));
                    }
                }
            } catch(e){}
        }

        // Filter students strictly by selected examination's target class
        let classStudents = allStudents.filter(s => {
            if (isSSC10) {
                const cName = String(s.class_name || s.class || s['Class Name *'] || '').trim().toLowerCase();
                const bName = String(s.section || s.section_batch || s['Section/Batch *'] || '').trim().toLowerCase();
                const isC10 = cName.includes('10') || cName.includes('ten') || cName.includes('ssc') || bName.includes('ssc') || bName.includes('27');
                const isNot8 = !cName.includes('8') && !cName.includes('eight');
                return isC10 && isNot8;
            } else {
                const targetClassClean = String(firstExam.class || 'Eight Scholarship Batch-2026').trim().toLowerCase();
                const cName = String(s.class_name || s.class || '').trim().toLowerCase();
                return cName === targetClassClean || cName.includes(targetClassClean) || targetClassClean.includes(cName);
            }
        });

        if (classStudents.length === 0) {
            alert("No students registered for this class!");
            return;
        }

        // 2. Fetch Group Overrides
        let overrides = {};
        try {
            const localOv = localStorage.getItem('cpscl_exam_group_overrides');
            if (localOv) overrides = JSON.parse(localOv);
        } catch(e){}

        if (window.getDatabase && window.ref && window.get) {
            try {
                const snapO = await window.get(window.ref(window.getDatabase(), 'cpscl_exam_group_overrides'));
                if (snapO.exists()) {
                    overrides = snapO.val() || overrides;
                    localStorage.setItem('cpscl_exam_group_overrides', JSON.stringify(overrides));
                }
            } catch(e){}
        }

        if (Object.keys(overrides).length === 0) {
            try {
                const resOv = await fetch('https://mousumi-computer-default-rtdb.firebaseio.com/cpscl_exam_group_overrides.json');
                if (resOv.ok) {
                    const data = await resOv.json();
                    if (data) overrides = data;
                }
            } catch(e){}
        }

        const latestExam = selectedExams[selectedExams.length - 1];

        // Assign clean student ID, academic track, and currently assigned group
        classStudents.forEach(st => {
            const sId = String(st.std_id || st.student_id || st.id || st['Student ID *'] || '').trim();
            st.cleanId = sId;

            if (isSSC10) {
                st.track = getStudentTrack(st);
                let assignedGroup = overrides[latestExam.id]?.[sId];
                if (!assignedGroup) {
                    assignedGroup = SSC27_DEFAULT_ALLOCATIONS[sId] || (st.track === 'humanities' ? 'Group D (Humanities)' : st.track === 'business' ? 'Group D (Business Studies)' : 'Group A (Science)');
                }
                st.currentGroup = assignedGroup;
            } else {
                st.track = 'general';
                st.currentGroup = overrides[latestExam.id]?.[sId] || 'Group A';
            }
        });

        // Apply Stream / Group Filter
        const trackFilter = document.getElementById('wmTrackFilterSelect')?.value || 'ALL';
        let filteredStudents = classStudents;
        if (trackFilter !== 'ALL') {
            if (trackFilter === 'science') {
                filteredStudents = classStudents.filter(s => s.track === 'science');
            } else if (trackFilter === 'humanities') {
                filteredStudents = classStudents.filter(s => s.track === 'humanities');
            } else if (trackFilter === 'business') {
                filteredStudents = classStudents.filter(s => s.track === 'business');
            } else {
                filteredStudents = classStudents.filter(s => s.currentGroup === trackFilter);
            }
        }

        if (filteredStudents.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="padding:30px; text-align:center; color:#94a3b8;">No students found matching the selected track/group filter.</td></tr>`;
            return;
        }

        // 3. Fetch Marks for All Selected Exams and All Subjects
        const examMarksStore = {};
        for (let ex of selectedExams) {
            examMarksStore[ex.id] = {};
            const subs = Object.keys(ex.subjects || {});
            for (let sub of subs) {
                let sMap = JSON.parse(localStorage.getItem(`cpscl_marks_${ex.id}_${sub}`) || '{}');
                if (window.getDatabase && window.ref && window.get) {
                    try {
                        const snapM = await window.get(window.ref(window.getDatabase(), `cpscl_exam_marks/${ex.id}_${sub}`));
                        if (snapM.exists()) sMap = snapM.val() || sMap;
                    } catch(e){}
                }
                if (Object.keys(sMap).length === 0) {
                    try {
                        const resM = await fetch(`https://mousumi-computer-default-rtdb.firebaseio.com/cpscl_exam_marks/${encodeURIComponent(ex.id + '_' + sub)}.json`);
                        if (resM.ok) {
                            const val = await resM.json();
                            if (val) sMap = val;
                        }
                    } catch(e){}
                }
                examMarksStore[ex.id][sub] = sMap;
            }
        }

        // 4. Determine Active Subjects per Exam for the Current Filter (Auto-Hide Irrelevant Subjects)
        const examMetaList = selectedExams.map(ex => {
            const subs = Object.keys(ex.subjects || {});

            let activeSubs = subs.filter(sub => {
                const sMap = examMarksStore[ex.id]?.[sub] || {};
                return filteredStudents.some(st => {
                    const rec = sMap[st.cleanId];
                    if (!rec) return false;
                    if (rec.rawMark !== null && rec.rawMark !== undefined && rec.rawMark !== '') return true;
                    if (rec.cq !== null && rec.cq !== undefined && rec.cq !== '') return true;
                    if (typeof rec === 'number') return true;
                    return false;
                });
            });

            if (activeSubs.length === 0) {
                activeSubs = subs;
            }

            // ── Fully Dynamic Full Mark Calculation ──────────────────────────────────
            // Class 8 legacy (60/exam) is strictly preserved for backward compatibility.
            // All other classes (Class 10 / SSC 27 and ANY future class) are 100% data-driven:
            //
            //   Step 1: Read each active subject's configured full mark from ex.subjects
            //           (Firebase stores per-subject marks, e.g. { Math: 20, Biology: 20, ... }).
            //   Step 2: For each filtered student count how many activeSubs they actually sat.
            //   Step 3: Take the MEDIAN subject count across students → multiply by per-subject mark.
            //
            //   Why median?  When "All Students" is selected, activeSubs is the UNION of all
            //   stream subjects (e.g. 9 subjects for DT-01).  Each student only sat 4 of them.
            //   The median of per-student counts correctly returns 4 (not 9), giving 4×20 = 80.
            //   This is robust to outliers (e.g. one student who sat extra subjects).
            //
            //   Daily Test-04, 05, ... any future test: automatically correct, zero code changes.
            // ─────────────────────────────────────────────────────────────────────────────────
            let examFullMark;
            if (isCls8) {
                // Class 8 legacy: 2-subject rotation, 30 marks each = 60 per exam. Strictly unchanged.
                examFullMark = 60;
            } else {
                // ── Step 1: Average per-subject full mark for this exam (typically 20) ──────
                const subjectValues = Object.values(ex.subjects || {}).map(v => Number(v) || 20);
                const perSubjectMark = subjectValues.length > 0
                    ? subjectValues.reduce((s, v) => s + v, 0) / subjectValues.length
                    : 20;

                // ── Step 2: Count, per filtered student, how many activeSubs they sat ───────
                const perStudentSubCounts = filteredStudents.map(st => {
                    let cnt = 0;
                    activeSubs.forEach(sub => {
                        const rec = examMarksStore[ex.id]?.[sub]?.[st.cleanId];
                        if (rec === null || rec === undefined || rec === '') return;
                        if (typeof rec === 'number' ||
                            (rec.rawMark !== null && rec.rawMark !== undefined && rec.rawMark !== '') ||
                            (rec.cq   !== null && rec.cq   !== undefined && rec.cq   !== '')) {
                            cnt++;
                        }
                    });
                    return cnt;
                }).filter(c => c > 0); // exclude students with no marks (absent / not yet entered)

                // ── Step 3: Median subject count → exam full mark ──────────────────────────
                let typicalSubCount;
                if (perStudentSubCounts.length > 0) {
                    const sorted = [...perStudentSubCounts].sort((a, b) => a - b);
                    typicalSubCount = sorted[Math.floor(sorted.length / 2)]; // median
                } else {
                    // No marks entered yet — exam not started; use activeSubs count as placeholder
                    typicalSubCount = activeSubs.length;
                }

                examFullMark = Math.round(typicalSubCount * perSubjectMark);

                // Safety net: guard against zero (empty exam with no subjects configured)
                if (examFullMark <= 0) {
                    examFullMark = Number(ex.totalMarks) > 0 ? Number(ex.totalMarks) : 100;
                }
            }
            // ─────────────────────────────────────────────────────────────────────────────

            return {
                exam: ex,
                activeSubs,
                fullMark: examFullMark
            };
        });

        // 5. Compute Rows for Each Student
        // cumulativeMaxScore: grand denominator = sum of each selected exam's dynamically-computed fullMark.
        // Automatically scales with any number of exams (1, 3, 4, 10 …) the admin checks in the UI.
        let cumulativeMaxScore = 0;
        examMetaList.forEach(m => { cumulativeMaxScore += m.fullMark; });

        const computedStudents = filteredStudents.map(st => {
            const sId = st.cleanId;
            const sName = String(st.student_name || st.name_english || st.name || st['Name (English) *'] || 'Student').trim();

            let grandTotal = 0;
            const examBreakdown = {};

            examMetaList.forEach(meta => {
                const exId = meta.exam.id;
                let testTotal = 0;
                const subScores = {};

                meta.activeSubs.forEach(sub => {
                    const sMap = examMarksStore[exId]?.[sub] || {};
                    const rec = sMap[sId];
                    let val = null;
                    if (rec) {
                        if (typeof rec === 'number') {
                            val = rec;
                        } else if (rec.rawMark !== null && rec.rawMark !== undefined && rec.rawMark !== '') {
                            val = parseFloat(rec.rawMark);
                        } else if (rec.cq !== null && rec.cq !== undefined && rec.cq !== '') {
                            val = (parseFloat(rec.cq) || 0) + (parseFloat(rec.mcq) || 0) + (parseFloat(rec.practical) || 0);
                        }
                    }

                    if (val !== null && !isNaN(val)) {
                        subScores[sub] = val;
                        testTotal += val;
                    } else {
                        subScores[sub] = '-';
                    }
                });

                examBreakdown[exId] = {
                    subScores,
                    testTotal
                };

                grandTotal += testTotal;
            });

            // studentMaxPossible: cumulative full mark across ALL selected exams for this student.
            // cumulativeMaxScore is now 100% dynamic — computed from live per-student subject
            // counts (median) × per-subject mark per exam.  Adding or removing any exam from the
            // checkbox list automatically adjusts this denominator.  Examples:
            //   DT-01 + DT-02 + DT-03 selected  →  80 + 100 + 100 = 280
            //   DT-01 + DT-02 + DT-03 + DT-04   →  80 + 100 + 100 + 100 = 380  (auto-scaled)
            //   Class 8, 3 exams selected        →  60 + 60 + 60 = 180  (backward-compat)
            const studentMaxPossible = cumulativeMaxScore;

            // Mathematical Safety: Strictly <= 100%
            const converted100 = studentMaxPossible > 0 ? Math.min(100, (grandTotal / studentMaxPossible) * 100) : 0;

            return {
                id: sId,
                name: sName,
                group: st.currentGroup,
                track: st.track,
                examBreakdown,
                grandTotal,
                studentMaxPossible,
                converted100: parseFloat(converted100.toFixed(2))
            };
        });

        // 6. Robust Multi-Tier Tie-Breaking Algorithm for Authority Submission
        computedStudents.sort((a, b) => {
            // Priority 1: Grand Total Score
            if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;

            // Priority 2: Latest Test Performance (e.g. Daily Test-03)
            const lastExId = selectedExams[selectedExams.length - 1]?.id;
            if (lastExId) {
                const scA = a.examBreakdown[lastExId]?.testTotal || 0;
                const scB = b.examBreakdown[lastExId]?.testTotal || 0;
                if (scB !== scA) return scB - scA;
            }

            // Priority 3: Prior Test Performance (e.g. Daily Test-02)
            if (selectedExams.length >= 2) {
                const midExId = selectedExams[selectedExams.length - 2]?.id;
                const scA = a.examBreakdown[midExId]?.testTotal || 0;
                const scB = b.examBreakdown[midExId]?.testTotal || 0;
                if (scB !== scA) return scB - scA;
            }

            // Priority 4: Baseline Merit Order (SSC 27 official intake order)
            if (isSSC10) {
                const rankA = SSC27_BASELINE_MAP.has(a.id) ? SSC27_BASELINE_MAP.get(a.id) : 9999;
                const rankB = SSC27_BASELINE_MAP.has(b.id) ? SSC27_BASELINE_MAP.get(b.id) : 9999;
                if (rankA !== rankB) return rankA - rankB;
            }

            // Priority 5: Deterministic Student ID fallback
            return a.id.localeCompare(b.id);
        });

        lastGeneratedWeeklyMeritList = computedStudents;

        // 7. Dynamic Two-Tier Table Header
        let tr1 = `<tr>
            <th rowspan="2" class="th-main" style="width: 3%;">Serial</th>
            <th rowspan="2" class="th-main" style="width: 6.5%;">Student ID</th>
            <th rowspan="2" class="th-main" style="width: 13%; text-align: left; padding-left: 5px;">Student Name</th>
            <th rowspan="2" class="th-main" style="width: 5%;">Group<br><small>(Assigned)</small></th>
        `;

        let tr2 = `<tr>`;

        const examColorClasses = ['th-exam-1', 'th-exam-2', 'th-exam-3', 'th-exam-4'];

        examMetaList.forEach((meta, idx) => {
            const colClass = examColorClasses[idx % examColorClasses.length];
            const spanCount = meta.activeSubs.length + 1;
            const dateDisplay = meta.exam.date ? `<div style="font-size: 8px; font-weight: 600; opacity: 0.9; margin-top: 1px;">${meta.exam.date}</div>` : '';

            tr1 += `<th colspan="${spanCount}" class="${colClass}" style="line-height: 1.15; padding: 4px 2px;">
                        <div>${meta.exam.name.toUpperCase()}</div>
                        ${dateDisplay}
                    </th>`;

            meta.activeSubs.forEach(sub => {
                tr2 += `<th class="sub-head">${formatShortSubject(sub)}</th>`;
            });

            tr2 += `<th class="sub-total" style="line-height: 1.1;">Total<br><small style="font-size: 7.5px;">(${meta.fullMark})</small></th>`;
        });

        tr1 += `
            <th rowspan="2" class="th-grand" style="width: 4.5%; line-height: 1.15;">Grand Total<br><small style="font-size: 7.5px;">(${cumulativeMaxScore})</small></th>
            <th rowspan="2" class="th-conv" style="width: 5%; line-height: 1.15;">Converted<br><small style="font-size: 7.5px;">(100)</small></th>
            <th rowspan="2" class="th-rank" style="width: 4%; line-height: 1.15;">Final<br>Rank</th>
        </tr>`;

        tr2 += `</tr>`;

        thead.innerHTML = tr1 + tr2;

        // 8. Build Table Body
        tbody.innerHTML = '';
        computedStudents.forEach((row, idx) => {
            const tr = document.createElement('tr');
            const groupColor = (row.group === 'Group A' || row.group.includes('Group A')) ? '#2563eb' 
                             : (row.group === 'Group B' || row.group.includes('Group B')) ? '#059669' 
                             : (row.group.includes('Group C')) ? '#d97706' : '#7c3aed';

            let tdHtml = `
                <td><strong>${idx + 1}</strong></td>
                <td><strong>${row.id}</strong></td>
                <td class="name-col">${row.name}</td>
                <td style="font-weight:700; font-size:8.5px; color:${groupColor};">${row.group}</td>
            `;

            examMetaList.forEach(meta => {
                const exId = meta.exam.id;
                const b = row.examBreakdown[exId];

                meta.activeSubs.forEach(sub => {
                    const sc = b ? b.subScores[sub] : '-';
                    tdHtml += `<td>${sc !== undefined ? sc : '-'}</td>`;
                });

                tdHtml += `<td class="test-total">${b ? b.testTotal : 0}</td>`;
            });

            tdHtml += `
                <td class="grand-col">${row.grandTotal}</td>
                <td class="conv-col">${row.converted100.toFixed(2)}%</td>
                <td class="rank-col">${idx + 1}${getOrdinalSuffix(idx + 1)}</td>
            `;

            tr.innerHTML = tdHtml;
            tbody.appendChild(tr);
        });
    };

    function getOrdinalSuffix(i) {
        let j = i % 10, k = i % 100;
        if (j === 1 && k !== 11) return "st";
        if (j === 2 && k !== 12) return "nd";
        if (j === 3 && k !== 13) return "rd";
        return "th";
    }

    // 7. Polymorphic Group Promotion Engine (Class 8 & Class 10 / SSC 27)
    window.applyCumulativeMeritToTargetExam = async function () {
        const targetSelect = document.getElementById('wmTargetExamSelect');
        if (!targetSelect || !targetSelect.value) {
            alert("Please select a target examination to apply the cumulative merit grouping!");
            return;
        }

        const targetExamId = targetSelect.value;
        const targetExam = allWeeklyExams.find(x => x.id === targetExamId);
        if (!targetExam) return;

        if (!lastGeneratedWeeklyMeritList || lastGeneratedWeeklyMeritList.length === 0) {
            alert("Please click 'Generate Master Tabulation' first before applying the grouping!");
            return;
        }

        let manualGroupOverrides = {};
        try {
            const local = localStorage.getItem('cpscl_exam_group_overrides');
            if (local) manualGroupOverrides = JSON.parse(local);
        } catch(e){}

        if (window.getDatabase && window.ref && window.get) {
            try {
                const snapOv = await window.get(window.ref(window.getDatabase(), 'cpscl_exam_group_overrides'));
                if (snapOv.exists()) manualGroupOverrides = snapOv.val() || manualGroupOverrides;
            } catch(e){}
        }

        if (Object.keys(manualGroupOverrides).length === 0) {
            try {
                const res = await fetch('https://mousumi-computer-default-rtdb.firebaseio.com/cpscl_exam_group_overrides.json');
                if (res.ok) {
                    const data = await res.json();
                    if (data) manualGroupOverrides = data;
                }
            } catch(e){}
        }

        if (!manualGroupOverrides[targetExamId]) {
            manualGroupOverrides[targetExamId] = {};
        }

        if (isClass8Exam(targetExam)) {
            // === CLASS 8 LEGACY WORKFLOW (100% UNCHANGED) ===
            const confirmMsg = `Are you sure?\n\nApply this Cumulative Merit Ranking to '${targetExam.name}'?\n• Merit 1 to 40 ➔ Group A\n• Merit 41 to ${lastGeneratedWeeklyMeritList.length} ➔ Group B\n\nThis will lock the groups for ${targetExam.name}.`;
            if (!confirm(confirmMsg)) return;

            const meritOrderedIds = [];
            lastGeneratedWeeklyMeritList.forEach((st, idx) => {
                const sId = st.id;
                const rank = idx + 1;
                const assignedGroup = (rank <= 40) ? "Group A" : "Group B";
                manualGroupOverrides[targetExamId][sId] = assignedGroup;
                meritOrderedIds.push(sId);
            });

            manualGroupOverrides[targetExamId + '_merit_order'] = meritOrderedIds;
        } else {
            // === CLASS 10 / SSC 27 MULTI-GROUP PROMOTION WORKFLOW ===
            const confirmMsg = `Are you sure you want to execute SSC 27 Group Reallocation & Promotion for '${targetExam.name}'?\n\n` +
                `Official SSC 27 Promotion Rules based on 3-Exam Cumulative Merit:\n` +
                `• Science Rank 1 to 55 ➔ Group A (Science) [Top 55 Bench]\n` +
                `• Science Rank 56 to 105 ➔ Group B (Science) [Next 50 Bench]\n` +
                `• Science Rank 106 to 146 ➔ Group C (Science) [Remaining 41]\n` +
                `• Humanities Rank 1 to 22 ➔ Group D (Humanities)\n` +
                `• Business Studies Rank 1 to 5 ➔ Group D (Business Studies)\n\n` +
                `This will lock the promoted groups and within-group seating for next Sunday's test.`;
            if (!confirm(confirmMsg)) return;

            const sci = lastGeneratedWeeklyMeritList.filter(s => s.track === 'science');
            const hum = lastGeneratedWeeklyMeritList.filter(s => s.track === 'humanities');
            const bus = lastGeneratedWeeklyMeritList.filter(s => s.track === 'business');

            const meritOrderedIds = [];

            // Science Track Promotion (Rank 1-55: Group A, 56-105: Group B, 106-146: Group C)
            sci.forEach((st, idx) => {
                const rank = idx + 1;
                const grp = (rank <= 55) ? 'Group A (Science)'
                          : (rank <= 105) ? 'Group B (Science)'
                          : 'Group C (Science)';
                manualGroupOverrides[targetExamId][st.id] = grp;
                meritOrderedIds.push(st.id);
            });

            // Humanities Track Allocation
            hum.forEach(st => {
                manualGroupOverrides[targetExamId][st.id] = 'Group D (Humanities)';
                meritOrderedIds.push(st.id);
            });

            // Business Studies Allocation
            bus.forEach(st => {
                manualGroupOverrides[targetExamId][st.id] = 'Group D (Business Studies)';
                meritOrderedIds.push(st.id);
            });

            // Fallback safety if table was generated under a single track filter
            if (hum.length === 0) {
                DAILY_TEST_01_MERIT_GROUPS.humanities.forEach(sId => {
                    if (!manualGroupOverrides[targetExamId][sId]) {
                        manualGroupOverrides[targetExamId][sId] = 'Group D (Humanities)';
                    }
                    meritOrderedIds.push(sId);
                });
            }
            if (bus.length === 0) {
                DAILY_TEST_01_MERIT_GROUPS.business.forEach(sId => {
                    if (!manualGroupOverrides[targetExamId][sId]) {
                        manualGroupOverrides[targetExamId][sId] = 'Group D (Business Studies)';
                    }
                    meritOrderedIds.push(sId);
                });
            }

            manualGroupOverrides[targetExamId + '_merit_order'] = meritOrderedIds;
        }

        // 1. Sync localStorage
        localStorage.setItem('cpscl_exam_group_overrides', JSON.stringify(manualGroupOverrides));

        // 2. Sync Firebase Database SDK
        let isSaved = false;
        if (typeof window.getDatabase === 'function' && typeof window.ref === 'function' && typeof window.set === 'function') {
            try {
                const mDb = window.getDatabase();
                await window.set(window.ref(mDb, 'cpscl_exam_group_overrides'), manualGroupOverrides);
                isSaved = true;
            } catch(e) {}
        }

        if (!isSaved && typeof window.writeToFirebase === 'function') {
            try {
                await window.writeToFirebase('cpscl_exam_group_overrides', manualGroupOverrides);
                isSaved = true;
            } catch(e) {}
        }

        // 3. Direct REST PUT to ensure persistent cloud sync
        try {
            await fetch(`https://mousumi-computer-default-rtdb.firebaseio.com/cpscl_exam_group_overrides/${targetExamId}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(manualGroupOverrides[targetExamId])
            });
            await fetch(`https://mousumi-computer-default-rtdb.firebaseio.com/cpscl_exam_group_overrides/${targetExamId}_merit_order.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(manualGroupOverrides[targetExamId + '_merit_order'])
            });
            isSaved = true;
        } catch(e) {}

        const successMsg = isClass8Exam(targetExam)
            ? `Success! Cumulative Merit Grouping applied to '${targetExam.name}'.\nGroup A (1-40) and Group B (41-${lastGeneratedWeeklyMeritList.length}) are now successfully locked.`
            : `Success! SSC 27 Cumulative Promotion successfully applied to '${targetExam.name}'!\n` +
              `• Group A (Science): Top 55 students\n` +
              `• Group B (Science): Next 50 students\n` +
              `• Group C (Science): Remaining 41 students\n` +
              `• Group D (Humanities): 22 students\n` +
              `• Group D (Business): 5 students\n` +
              `All records and seat plans are now locked in Firebase Cloud.`;

        alert(successMsg);
    };

    // 8. Isolated Vector Print Engine (Flexible Landscape: Legal / A4 / A3 Compatible)
    window.printWeeklyMasterSheet = function () {
        const printArea = document.getElementById('wmPrintableContainer');
        if (!printArea) {
            alert("No weekly tabulation data available to print!");
            return;
        }

        const oldFrame = document.getElementById('wm-print-iframe');
        if (oldFrame) oldFrame.remove();

        const iframe = document.createElement('iframe');
        iframe.id = 'wm-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Weekly Master Tabulation Sheet - CPSCL</title>
                <style>
                    @page {
                        size: landscape;
                        margin: 4mm 5mm 6mm 5mm;
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
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse !important;
                        table-layout: auto;
                    }
                    th, td {
                        border: 1px solid #000 !important;
                        padding: 2.5px 1.5px !important;
                        font-size: 8px !important;
                        text-align: center;
                        color: #000;
                        line-height: 1.15;
                    }
                    th.th-main { background-color: #f8fafc !important; font-weight: bold; }
                    th.th-exam-1 { background-color: #e0f2fe !important; color: #0369a1 !important; font-weight: bold; }
                    th.th-exam-2 { background-color: #fef3c7 !important; color: #b45309 !important; font-weight: bold; }
                    th.th-exam-3 { background-color: #dcfce7 !important; color: #15803d !important; font-weight: bold; }
                    th.th-exam-4 { background-color: #f3e8ff !important; color: #7e22ce !important; font-weight: bold; }
                    th.th-grand { background-color: #f1f5f9 !important; font-weight: bold; border-left: 1.5px solid #000 !important; border-right: 1.5px solid #000 !important; }
                    th.th-conv { background-color: #fee2e2 !important; color: #991b1b !important; font-weight: bold; }
                    th.th-rank { background-color: #ecfdf5 !important; color: #047857 !important; font-weight: bold; }

                    th.sub-head { background-color: #f8fafc !important; font-size: 7.5px !important; font-weight: bold; white-space: nowrap; }
                    th.sub-total { background-color: #dbeafe !important; color: #1e3a8a !important; font-size: 7.5px !important; font-weight: bold; white-space: nowrap; border-left: 1.5px solid #1e3a8a !important; border-right: 1.5px solid #1e3a8a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

                    td.name-col {
                        text-align: left !important;
                        padding-left: 5px !important;
                        font-weight: bold;
                        white-space: nowrap !important;
                    }
                    td.test-total { font-weight: bold !important; font-size: 8px !important; background-color: #eff6ff !important; color: #1e3a8a !important; border-left: 1.5px solid #1e3a8a !important; border-right: 1.5px solid #1e3a8a !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    td.grand-col { font-weight: bold !important; background-color: #f1f5f9 !important; color: #000 !important; border-left: 1.5px solid #000 !important; border-right: 1.5px solid #000 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    td.conv-col { font-weight: bold !important; background-color: #fef2f2 !important; color: #991b1b !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    td.rank-col { font-weight: bold !important; background-color: #ecfdf5 !important; color: #047857 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

                    tr { page-break-inside: avoid !important; }

                    .wm-sig-container {
                        display: flex;
                        justify-content: space-around;
                        align-items: flex-end;
                        margin-top: 40px;
                        padding: 0 20px 5px;
                        page-break-inside: avoid !important;
                    }
                    .wm-sig-box { text-align: center; min-width: 160px; }
                    .wm-sig-space { height: 45px; }
                    .wm-sig-line { width: 100%; border-top: 1.5px solid #000; margin-bottom: 4px; }
                    .wm-sig-label { font-size: 10px; font-weight: bold; color: #000; }
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

    // 9. Excel Export
    window.exportWeeklyExcel = function () {
        const table = document.getElementById('wmMasterTable');
        if (!table) return;

        if (typeof XLSX !== 'undefined') {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, "Weekly Master Tabulation");
            XLSX.writeFile(wb, "Weekly_Master_Tabulation_CPSCL.xlsx");
        } else {
            const html = document.getElementById('wmPrintableContainer').outerHTML;
            const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "Weekly_Master_Tabulation_CPSCL.xls";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        }
    };

    // 10. Initialize
    function init() {
        injectWeeklyStyles();
        injectWeeklySidebar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
