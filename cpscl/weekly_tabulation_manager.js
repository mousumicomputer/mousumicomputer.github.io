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

            /* Processing Pill Overlay */
            .wm-progress-overlay {
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
                background: rgba(15, 23, 42, 0.45); backdrop-filter: blur(4px);
                display: flex; align-items: center; justify-content: center; z-index: 999999;
            }
            .wm-progress-card {
                background: #ffffff; border-radius: 50px; padding: 18px 30px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.2); display: flex; flex-direction: column;
                align-items: center; gap: 10px; min-width: 340px; border: 2px solid #3b82f6;
            }
            .wm-progress-title { font-size: 13px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 8px; }
            .wm-progress-bar-wrap { width: 100%; height: 10px; background: #e2e8f0; border-radius: 50px; overflow: hidden; position: relative; }
            .wm-progress-bar-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #3b82f6); border-radius: 50px; width: 0%; transition: width 0.25s ease; }
            .wm-progress-pct { font-size: 12px; font-weight: 800; color: #2563eb; }
        `;
        document.head.appendChild(style);
    }

    // Helper: Dynamic Progress Pill Modal
    function showWeeklyProgressPill(pct = 0, titleText = 'Processing Master Tabulation...') {
        let overlay = document.getElementById('wm-progress-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'wm-progress-overlay';
            overlay.className = 'wm-progress-overlay';
            overlay.innerHTML = `
                <div class="wm-progress-card">
                    <div class="wm-progress-title" id="wm-progress-title">
                        <i class="fa-solid fa-spinner fa-spin"></i> <span>${titleText}</span>
                    </div>
                    <div class="wm-progress-bar-wrap">
                        <div class="wm-progress-bar-fill" id="wm-progress-bar-fill" style="width: ${pct}%;"></div>
                    </div>
                    <div class="wm-progress-pct" id="wm-progress-pct">${Math.round(pct)}%</div>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            overlay.style.display = 'flex';
            const fill = document.getElementById('wm-progress-bar-fill');
            const text = document.getElementById('wm-progress-pct');
            const title = document.getElementById('wm-progress-title');
            if (fill) fill.style.width = pct + '%';
            if (text) text.innerText = Math.round(pct) + '%';
            if (title && titleText) title.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>${titleText}</span>`;
        }
    }

    async function updateWeeklyProgressPill(pct, titleText) {
        showWeeklyProgressPill(pct, titleText);
        await new Promise(r => setTimeout(r, 25));
    }

    function hideWeeklyProgressPill() {
        const overlay = document.getElementById('wm-progress-overlay');
        if (overlay) {
            setTimeout(() => {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 350);
        }
    }

    // Helper: Abbreviate & Normalize Subject Names for Clean Horizontal Fitting
    function formatShortSubject(name) {
        if (!name) return '';
        const clean = String(name).trim();

        // 1. Bangladesh and Global Studies (strictly BGS, checked before Bangla to avoid truncation)
        if (/^bangladesh\s*(and|&)?\s*global/i.test(clean) || /\bbgs\b/i.test(clean) || /^bangladesh/i.test(clean)) {
            return 'BGS';
        }

        // 2. Bangla 1st & 2nd Paper (Ban 1 / Ban 2)
        if (/(?:bangla|ban|bengali)[\s\-_]*(?:1st|1|first|\(1st\b|\(1\b)/i.test(clean)) {
            return 'Ban 1';
        }
        if (/(?:bangla|ban|bengali)[\s\-_]*(?:2nd|2|second|\(2nd\b|\(2\b)/i.test(clean)) {
            return 'Ban 2';
        }

        // 3. English 1st & 2nd Paper (Eng 1 / Eng 2)
        if (/(?:english|eng)[\s\-_]*(?:1st|1|first|\(1st\b|\(1\b)/i.test(clean)) {
            return 'Eng 1';
        }
        if (/(?:english|eng)[\s\-_]*(?:2nd|2|second|\(2nd\b|\(2\b)/i.test(clean)) {
            return 'Eng 2';
        }

        // 4. Religion Slot
        if (/religion|islam|hindu|buddhis|christian|moral\s*edu|\bime\b|\bhme\b/i.test(clean)) {
            return 'Reli';
        }

        // 5. Elective / 4th Subject
        if (/higher\s*math|\bhm\b/i.test(clean) && /agri/i.test(clean)) return 'HM / Agri';
        if (/higher\s*math|\bhm\b/i.test(clean)) return 'H.Math';
        if (/agri/i.test(clean)) return 'Agri';

        // 6. Common Core & Departmental Subjects
        if (/^general\s*math|^math/i.test(clean) || /^mat\b/i.test(clean)) return 'Math';
        if (/^phys/i.test(clean)) return 'Phy';
        if (/^chem/i.test(clean) || /^che\b/i.test(clean)) return 'Chem';
        if (/^bio/i.test(clean)) return 'Bio';
        if (/^scien/i.test(clean) || /^sci\b/i.test(clean)) return 'Sci';
        if (/^ict/i.test(clean) || /information\s*(&|and)\s*comm/i.test(clean)) return 'ICT';
        if (/^acc/i.test(clean)) return 'Acc-Geo';
        if (/^fin/i.test(clean)) return 'Fin-His';
        if (/^b-?ent/i.test(clean)) return 'B-Ent';
        if (/^geo/i.test(clean)) return 'Geo';
        if (/^his/i.test(clean)) return 'His';
        if (/^civ/i.test(clean)) return 'Civ';

        return clean.length > 7 ? clean.substring(0, 6) : clean;
    }

    // Helper: Slot classification for Religion & Elective column merging
    function classifySubjectSlot(subName) {
        const s = String(subName || '').trim();

        // Religion Slot (Islam & Moral Education, Hindu Religion, Buddhist, Christian -> 'Reli')
        if (/religion|islam|hindu|buddhis|christian|moral\s*edu|\bime\b|\bhme\b/i.test(s)) {
            return {
                slotKey: 'slot_religion',
                slotLabel: 'Reli',
                type: 'religion'
            };
        }

        // Optional / Elective Slot (Higher Math and Agriculture / Agri Studies -> 'HM / Agri')
        if (/higher\s*math|\bhm\b|agriculture|agri/i.test(s)) {
            return {
                slotKey: 'slot_elective',
                slotLabel: 'HM / Agri',
                type: 'elective'
            };
        }

        // Standard individual subject slot
        return {
            slotKey: 'sub_' + s,
            slotLabel: formatShortSubject(s),
            type: 'standard'
        };
    }

    // Helper: Extract valid numeric mark from multi-format storage records
    function extractStudentScore(rec) {
        if (rec === null || rec === undefined || rec === '') return null;
        if (typeof rec === 'number') return isNaN(rec) ? null : rec;
        if (typeof rec === 'string' && rec.trim() !== '' && !isNaN(Number(rec))) return parseFloat(rec);
        if (typeof rec === 'object') {
            if (rec.rawMark !== null && rec.rawMark !== undefined && String(rec.rawMark).trim() !== '' && !isNaN(Number(rec.rawMark))) {
                return parseFloat(rec.rawMark);
            }
            if (rec.total !== null && rec.total !== undefined && String(rec.total).trim() !== '' && !isNaN(Number(rec.total))) {
                return parseFloat(rec.total);
            }
            let partSum = 0;
            let hasPart = false;
            ['cq', 'mcq', 'practical'].forEach(field => {
                if (rec[field] !== null && rec[field] !== undefined && String(rec[field]).trim() !== '' && !isNaN(Number(rec[field]))) {
                    partSum += parseFloat(rec[field]);
                    hasPart = true;
                }
            });
            if (hasPart) return partSum;
        }
        return null;
    }

    // Helper: Determine if two students are completely tied across grand total and all exam breakdowns
    function areStudentsTied(a, b, exams) {
        if (a.grandTotal !== b.grandTotal) return false;
        for (let i = exams.length - 1; i >= 0; i--) {
            const exId = exams[i].id;
            const scA = a.examBreakdown[exId]?.testTotal || 0;
            const scB = b.examBreakdown[exId]?.testTotal || 0;
            if (scA !== scB) return false;
        }
        return true;
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
            const isChecked = false; // All assessments unchecked by default
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

        try {
            await updateWeeklyProgressPill(5, "Initializing Master Tabulation...");

            const selectedExamIds = Array.from(checkboxes).map(c => c.value);
            const selectedExams = allWeeklyExams.filter(x => selectedExamIds.includes(x.id));

            selectedExams.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

            const firstExam = selectedExams[0];
            const isSSC10 = isSSC27Exam(firstExam);
            const isCls8 = isClass8Exam(firstExam);

            const firstDate = selectedExams[0].date || '';
            const lastDate = selectedExams[selectedExams.length - 1].date || '';
            const dateRangeElem = document.getElementById('wmDisplayDateRange');
            if (dateRangeElem) {
                dateRangeElem.innerText = `Assessment Period: ${firstDate} to ${lastDate}`;
            }
            
            const displayClassElem = document.getElementById('wmDisplayClass');
            if (displayClassElem) {
                displayClassElem.innerText = isSSC10 
                    ? "Class 10 (SSC 27 Preparatory Suite)"
                    : (firstExam.class || 'Eight Scholarship Batch-2026');
            }

            updateTrackFilterOptions(firstExam);

            await updateWeeklyProgressPill(15, "Fetching student roster...");

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

            await updateWeeklyProgressPill(25, "Loading group allocations...");

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
            for (let i = 0; i < selectedExams.length; i++) {
                const ex = selectedExams[i];
                const pct = 30 + Math.round((i / selectedExams.length) * 35);
                await updateWeeklyProgressPill(pct, `Loading marks: ${ex.name}...`);

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

            await updateWeeklyProgressPill(70, "Optimizing subject slots & merging columns...");

            // 4. Construct Subject Slots per Exam with Slot Merging Engine (Reli & HM / Agri)
            const examMetaList = selectedExams.map(ex => {
                const subs = Object.keys(ex.subjects || {});

                // Check if any mark exists for this exam among filtered students
                let examHasMarks = false;
                for (const sub of subs) {
                    const sMap = examMarksStore[ex.id]?.[sub] || {};
                    if (filteredStudents.some(st => extractStudentScore(sMap[st.cleanId]) !== null)) {
                        examHasMarks = true;
                        break;
                    }
                }

                const slotMap = new Map();
                const examSlots = [];

                subs.forEach(sub => {
                    const sMap = examMarksStore[ex.id]?.[sub] || {};
                    const subHasMarks = filteredStudents.some(st => extractStudentScore(sMap[st.cleanId]) !== null);

                    if (examHasMarks && !subHasMarks) {
                        return; // Auto-hide subject with no entered marks for current filter
                    }

                    const info = classifySubjectSlot(sub);
                    const subFullMark = Number(ex.subjects?.[sub]) || (isCls8 ? 30 : 20);

                    if (slotMap.has(info.slotKey)) {
                        const slot = slotMap.get(info.slotKey);
                        if (!slot.subjects.includes(sub)) {
                            slot.subjects.push(sub);
                        }
                        if (subFullMark > slot.fullMark) {
                            slot.fullMark = subFullMark;
                        }
                    } else {
                        const slot = {
                            id: info.slotKey,
                            label: info.slotLabel,
                            type: info.type,
                            subjects: [sub],
                            fullMark: subFullMark
                        };
                        slotMap.set(info.slotKey, slot);
                        examSlots.push(slot);
                    }
                });

                // Fallback: If no slots active, preserve all configured
                if (examSlots.length === 0) {
                    subs.forEach(sub => {
                        const info = classifySubjectSlot(sub);
                        const subFullMark = Number(ex.subjects?.[sub]) || (isCls8 ? 30 : 20);
                        if (slotMap.has(info.slotKey)) {
                            const slot = slotMap.get(info.slotKey);
                            if (!slot.subjects.includes(sub)) slot.subjects.push(sub);
                        } else {
                            const slot = {
                                id: info.slotKey,
                                label: info.slotLabel,
                                type: info.type,
                                subjects: [sub],
                                fullMark: subFullMark
                            };
                            slotMap.set(info.slotKey, slot);
                            examSlots.push(slot);
                        }
                    });
                }

                // Default representative full mark for this exam header
                let defaultFullMark = isCls8 ? 60 : 0;
                if (!isCls8) {
                    examSlots.forEach(s => { defaultFullMark += s.fullMark; });
                }

                return {
                    exam: ex,
                    slots: examSlots,
                    fullMark: defaultFullMark
                };
            });

            await updateWeeklyProgressPill(80, "Calculating student scores & dynamic full marks...");

            // 5. Compute Rows for Each Student (Personalized studentMaxPossible)
            const computedStudents = filteredStudents.map(st => {
                const sId = st.cleanId;
                const sName = String(st.student_name || st.name_english || st.name || st['Name (English) *'] || 'Student').trim();

                let grandTotal = 0;
                let studentMaxPossible = 0;
                const examBreakdown = {};

                examMetaList.forEach(meta => {
                    const exId = meta.exam.id;
                    let testTotal = 0;
                    let examSatMax = 0;
                    const slotScores = {};

                    meta.slots.forEach(slot => {
                        let score = null;
                        let satSubName = null;

                        for (const sub of slot.subjects) {
                            const sMap = examMarksStore[exId]?.[sub] || {};
                            const val = extractStudentScore(sMap[sId]);
                            if (val !== null) {
                                score = val;
                                satSubName = sub;
                                break;
                            }
                        }

                        slotScores[slot.id] = score;

                        if (score !== null) {
                            testTotal += score;
                            const subFullMark = Number(meta.exam.subjects?.[satSubName]) || slot.fullMark || (isCls8 ? 30 : 20);
                            examSatMax += subFullMark;
                        }
                    });

                    examBreakdown[exId] = {
                        slotScores,
                        testTotal,
                        examSatMax
                    };

                    grandTotal += testTotal;
                    studentMaxPossible += examSatMax;
                });

                // Accurate Per-Student Converted 100 Percentage
                const converted100 = studentMaxPossible > 0 ? (grandTotal / studentMaxPossible) * 100 : 0;

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

            // Update meta.fullMark in headers to reflect actual maximum score possible in that exam
            examMetaList.forEach(meta => {
                const exId = meta.exam.id;
                const maxExamSat = Math.max(...computedStudents.map(s => s.examBreakdown[exId]?.examSatMax || 0), 0);
                if (maxExamSat > 0) {
                    meta.fullMark = maxExamSat;
                }
            });

            const grandMaxPossible = Math.max(...computedStudents.map(s => s.studentMaxPossible), 0);

            await updateWeeklyProgressPill(88, "Applying multi-exam tie-breaking & fair merit ranks...");

        // Priority 1: Fair Normalized Percentage (Converted 100%) - STRICT PRIMARY METRIC
        computedStudents.sort((a, b) => {
            const diffPct = b.converted100 - a.converted100;
            if (Math.abs(diffPct) > 0.001) {
                return diffPct;
            }

            // Priority 2: Raw Grand Total (if percentages are genuinely identical)
            if (b.grandTotal !== a.grandTotal) {
                return b.grandTotal - a.grandTotal;
            }

            // Priority 3: Sequential Recency across selected exams (Newest test down to oldest)
            for (let i = selectedExams.length - 1; i >= 0; i--) {
                const exId = selectedExams[i].id;
                const scA = a.examBreakdown[exId]?.testTotal || 0;
                const scB = b.examBreakdown[exId]?.testTotal || 0;
                if (scB !== scA) return scB - scA;
            }

            // Priority 4: SSC 27 Baseline Intake Rank fallback
            if (isSSC10) {
                const rA = SSC27_BASELINE_MAP.has(a.id) ? SSC27_BASELINE_MAP.get(a.id) : 9999;
                const rB = SSC27_BASELINE_MAP.has(b.id) ? SSC27_BASELINE_MAP.get(b.id) : 9999;
                if (rA !== rB) return rA - rB;
            }

            // Priority 5: Deterministic Student ID
            return a.id.localeCompare(b.id);
        });

        // Compute Fair Standard Competition Tied Ranks based on converted100
        computedStudents.forEach((st, idx) => {
            if (idx > 0) {
                const prev = computedStudents[idx - 1];
                const isExactTie = (Math.abs(st.converted100 - prev.converted100) <= 0.001 && st.grandTotal === prev.grandTotal);
                st.meritRank = isExactTie ? prev.meritRank : (idx + 1);
            } else {
                st.meritRank = 1;
            }
            st.rank = st.meritRank;
        });

            lastGeneratedWeeklyMeritList = computedStudents;

            await updateWeeklyProgressPill(94, "Rendering master tabulation table...");

        // Render Clean Two-Tier Table Header (No misleading static numbers in headers)
        let tr1 = `<tr>
            <th rowspan="2" class="th-main" style="width: 3%;">SL</th>
            <th rowspan="2" class="th-main" style="width: 6.5%;">Student ID</th>
            <th rowspan="2" class="th-main" style="width: 14%; text-align: left; padding-left: 5px;">Student Name</th>
            <th rowspan="2" class="th-main" style="width: 5.5%;">Group<br><small>(Assigned)</small></th>
        `;
        let tr2 = `<tr>`;

        const examColorClasses = ['th-exam-1', 'th-exam-2', 'th-exam-3', 'th-exam-4'];
        examMetaList.forEach((meta, idx) => {
            const colClass = examColorClasses[idx % examColorClasses.length];
            const spanCount = meta.slots.length + 1;
            const dateDisplay = meta.exam.date ? `<div style="font-size: 8px; font-weight: 600; opacity: 0.9; margin-top: 1px;">${meta.exam.date}</div>` : '';

            tr1 += `<th colspan="${spanCount}" class="${colClass}" style="line-height: 1.15; padding: 4px 2px;">
                        <div>${meta.exam.name.toUpperCase()}</div>
                        ${dateDisplay}
                    </th>`;

            meta.slots.forEach(slot => {
                tr2 += `<th class="sub-head">${slot.label}</th>`;
            });

            // Clean Exam Total without misleading fixed numbers
            tr2 += `<th class="sub-total" style="line-height: 1.1;">Total</th>`;
        });

        // Clean Grand Total, Converted %, and Merit Rank
        tr1 += `
            <th rowspan="2" class="th-grand" style="width: 5.5%; line-height: 1.15;">Grand<br>Total</th>
            <th rowspan="2" class="th-conv" style="width: 6%; line-height: 1.15;">Converted<br><small style="font-size: 7.5px;">(100%)</small></th>
            <th rowspan="2" class="th-rank" style="width: 4.5%; line-height: 1.15;">Merit<br>Rank</th>
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

                    meta.slots.forEach(slot => {
                        const sc = b ? b.slotScores[slot.id] : null;
                        tdHtml += `<td>${sc !== null && sc !== undefined ? sc : '-'}</td>`;
                    });

                    tdHtml += `<td class="test-total">${b ? b.testTotal : 0}</td>`;
                });

                tdHtml += `
                    <td class="grand-col">${row.grandTotal}</td>
                    <td class="conv-col">${row.converted100.toFixed(2)}%</td>
                    <td class="rank-col">${(row.meritRank || row.rank)}${getOrdinalSuffix(row.meritRank || row.rank)}</td>
                `;

                tr.innerHTML = tdHtml;
                tbody.appendChild(tr);
            });

            await updateWeeklyProgressPill(100, "Tabulation complete!");
        } catch (err) {
            console.error("Error generating master tabulation:", err);
            alert("Error generating master tabulation: " + (err.message || err));
        } finally {
            hideWeeklyProgressPill();
        }
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
                const rank = st.rank || (idx + 1);
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

            // Science Track Promotion strictly on Fair Converted % Merit Order
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

            // ── Weekly Promotion Mode stamp ─────────────────────────────────────────
            // Write an explicit boolean so loadSSC27StudentAllocation() can
            // reliably distinguish Weekly Promotion Mode from Daily Seating Mode.
            // This flag is the AUTHORITATIVE signal — the daily seating reload must
            // never overwrite group assignments when this flag is present and true.
            await fetch(`https://mousumi-computer-default-rtdb.firebaseio.com/cpscl_exam_group_overrides/${targetExamId}_is_weekly.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(true)
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

    // Helper: Build dynamic filename with auto-incrementing version (_v2, _v3...)
    if (!window.cpsclPdfVersionMap) window.cpsclPdfVersionMap = {};

    function generateSmartTabulationFileName(extension = 'pdf') {
        const classEl = document.getElementById('wmDisplayClass');
        const trackSelect = document.getElementById('wmTrackFilterSelect');

        // 1. Clean Class
        let cleanClass = 'Class_10';
        if (classEl && classEl.innerText) {
            const raw = classEl.innerText;
            if (/10|ten|ssc/i.test(raw)) cleanClass = 'Class_10';
            else if (/8|eight/i.test(raw)) cleanClass = 'Class_8';
            else cleanClass = raw.split('(')[0].trim().replace(/[^a-zA-Z0-9]/g, '_');
        }

        // 2. Clean Track / Filter
        let cleanTrack = 'All_Groups';
        const filterVal = trackSelect ? trackSelect.value : 'ALL';
        if (filterVal === 'ALL') cleanTrack = 'All_Groups';
        else if (filterVal === 'science') cleanTrack = 'Science';
        else if (filterVal === 'humanities') cleanTrack = 'Humanities';
        else if (filterVal === 'business') cleanTrack = 'Business_Studies';
        else if (filterVal.includes('Group A')) cleanTrack = 'Group_A';
        else if (filterVal.includes('Group B')) cleanTrack = 'Group_B';
        else if (filterVal.includes('Group C')) cleanTrack = 'Group_C';
        else if (filterVal.includes('Group D')) cleanTrack = 'Group_D';
        else cleanTrack = filterVal.replace(/[^a-zA-Z0-9]/g, '_');

        // 3. Clean Exam Range (e.g. DT-04_to_DT-08)
        const checkedBoxes = Array.from(document.querySelectorAll('.wm-exam-chk:checked'));
        let examRange = 'Result';
        if (checkedBoxes.length > 0) {
            const getShortExName = (id) => {
                const ex = allWeeklyExams.find(x => x.id === id);
                if (!ex || !ex.name) return 'Exam';
                const m = ex.name.match(/(?:daily\s*test|dt)[\s-_]*0*(\d+)/i);
                if (m) return `DT-${m[1].padStart(2, '0')}`;
                return ex.name.trim().replace(/[^a-zA-Z0-9]/g, '_').substring(0, 8);
            };

            const firstEx = getShortExName(checkedBoxes[0].value);
            const lastEx = getShortExName(checkedBoxes[checkedBoxes.length - 1].value);

            if (checkedBoxes.length === 1 || firstEx === lastEx) {
                examRange = firstEx;
            } else {
                examRange = `${firstEx}_to_${lastEx}`;
            }
        }

        // 4. Construct Base Name
        const baseName = `${cleanClass}_${cleanTrack}_Weekly_Result_${examRange}`;

        // 5. Version Tracker (_v2, _v3, _v4...)
        const prevCount = window.cpsclPdfVersionMap[baseName] || 0;
        const newCount = prevCount + 1;
        window.cpsclPdfVersionMap[baseName] = newCount;

        const versionSuffix = newCount > 1 ? `_v${newCount}` : '';
        return `${baseName}${versionSuffix}`;
    }

    // 8. Isolated Vector Print Engine (Flexible Landscape: Legal / A4 / A3 Compatible)
    window.printWeeklyMasterSheet = function () {
        const printArea = document.getElementById('wmPrintableContainer');
        if (!printArea) {
            alert("No weekly tabulation data available to print!");
            return;
        }

        const dynamicFileName = generateSmartTabulationFileName('pdf');

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
                <title>${dynamicFileName}</title>
                <style>
                    @page { size: landscape; margin: 4mm 5mm 6mm 5mm; }
                    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    body { font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; color: #000; background: #fff; margin: 0; padding: 0; }
                    table { width: 100%; border-collapse: collapse !important; table-layout: auto; }
                    th, td { border: 1px solid #000 !important; padding: 2.5px 1.5px !important; font-size: 8px !important; text-align: center; color: #000; line-height: 1.15; }
                    th.th-main { background-color: #f8fafc !important; font-weight: bold; }
                    th.th-exam-1 { background-color: #e0f2fe !important; color: #0369a1 !important; font-weight: bold; }
                    th.th-exam-2 { background-color: #fef3c7 !important; color: #b45309 !important; font-weight: bold; }
                    th.th-exam-3 { background-color: #dcfce7 !important; color: #15803d !important; font-weight: bold; }
                    th.th-exam-4 { background-color: #f3e8ff !important; color: #7e22ce !important; font-weight: bold; }
                    th.th-grand { background-color: #f1f5f9 !important; font-weight: bold; border-left: 1.5px solid #000 !important; border-right: 1.5px solid #000 !important; }
                    th.th-conv { background-color: #fee2e2 !important; color: #991b1b !important; font-weight: bold; }
                    th.th-rank { background-color: #ecfdf5 !important; color: #047857 !important; font-weight: bold; }
                    th.sub-head { background-color: #f8fafc !important; font-size: 7.5px !important; font-weight: bold; white-space: nowrap; }
                    th.sub-total { background-color: #dbeafe !important; color: #1e3a8a !important; font-size: 7.5px !important; font-weight: bold; white-space: nowrap; border-left: 1.5px solid #1e3a8a !important; border-right: 1.5px solid #1e3a8a !important; }
                    td.name-col { text-align: left !important; padding-left: 5px !important; font-weight: bold; white-space: nowrap !important; }
                    td.test-total { font-weight: bold !important; font-size: 8px !important; background-color: #eff6ff !important; color: #1e3a8a !important; border-left: 1.5px solid #1e3a8a !important; border-right: 1.5px solid #1e3a8a !important; }
                    td.grand-col { font-weight: bold !important; background-color: #f1f5f9 !important; color: #000 !important; border-left: 1.5px solid #000 !important; border-right: 1.5px solid #000 !important; }
                    td.conv-col { font-weight: bold !important; background-color: #fef2f2 !important; color: #991b1b !important; }
                    td.rank-col { font-weight: bold !important; background-color: #ecfdf5 !important; color: #047857 !important; }
                    tr { page-break-inside: avoid !important; }
                    .wm-sig-container { display: flex; justify-content: space-around; align-items: flex-end; margin-top: 40px; padding: 0 20px 5px; page-break-inside: avoid !important; }
                    .wm-sig-box { text-align: center; min-width: 160px; }
                    .wm-sig-space { height: 45px; }
                    .wm-sig-line { width: 100%; border-top: 1.5px solid #000; margin-bottom: 4px; }
                    .wm-sig-label { font-size: 10px; font-weight: bold; color: #000; }
                </style>
            </head>
            <body>${printArea.innerHTML}</body>
            </html>
        `);
        doc.close();

        const originalDocTitle = document.title;
        document.title = dynamicFileName;

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            setTimeout(() => { document.title = originalDocTitle; }, 2000);
        }, 500);
    };

    // 9. Excel Export
    window.exportWeeklyExcel = function () {
        const table = document.getElementById('wmMasterTable');
        if (!table) return;

        const dynamicFileName = generateSmartTabulationFileName('xlsx');

        if (typeof XLSX !== 'undefined') {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, "Weekly Master Tabulation");
            XLSX.writeFile(wb, `${dynamicFileName}.xlsx`);
        } else {
            const html = document.getElementById('wmPrintableContainer').outerHTML;
            const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${dynamicFileName}.xls`;
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
