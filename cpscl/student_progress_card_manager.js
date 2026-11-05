/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Individual Student Progress & Evaluation Card Suite
   Path: cpscl/student_progress_card_manager.js
   Architecture: Standalone Modular Engine | Single A5 Slip & Dual A4 Batch Print
   Features: Distinct Watermark | Subject-Header Matrix | 100% Pure English Corporate
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Student Progress Card Suite (Distinct Watermark & Dual-Print Active)...");

    const CPSCL_LOGO_URL = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-795xmOcuKYH8wjija8JrA-qVjfOp_4KieeZ1pOQJaqX2uXsqGLMo09AXsGGsfGjH9LpK5fPlUNGbebFguiAzPC_YvbRXcHePj7cORQd6GMxDUg-LCeXtmNkccGI2K4Hv73PJqJkGX0Ju9N4knQuqKOAImqB6qy_WWFXpKeIaQhRgk7YbLqBLpCmL0cio/s1600/%E0%A6%95%E0%A7%8D%E0%A6%AF%E0%A6%AA%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%9F%E0%A6%A8%E0%A6%AE%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F_%E0%A6%AA%E0%A6%BE%E0%A6%AC%E0%A6%B2%E0%A6%BF%E0%A6%95_%E0%A6%B8%E0%A7%8D%E0%A6%9F%E0%A7%81%E0%A6%B2_%E0%A6%93_%E0%A6%95%E0%A6%B2%E0%A7%87%E0%A6%9C_%E0%A6%B2%E0%A6%BE%E0%A6%B2%E0%A6%AE%E0%A6%A8%E0%A6%BF%E0%A6%B0%E0%A6%B9%E0%A6%BE%E0%A6%9F%E0%A7%87%E0%A6%B0_%E0%A6%B2%E0%A7%8B%E0%A6%97%E0%A7%8B.png';

    // 1. Inject Sidebar Sub-menu under Exam Manager
    function injectProgressCardSidebar() {
        const examSubmenu = document.getElementById('trust-exam-submenu-items');
        if (!examSubmenu) {
            setTimeout(injectProgressCardSidebar, 200);
            return;
        }

        if (document.getElementById('sub-link-student-progress-card')) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <a class="trust-sub-link" id="sub-link-student-progress-card" onclick="window.switchCPSCLExamSubTab(this, 'student-progress-card')">
                <span class="trust-sub-indicator"></span>
                <span>Student Progress Card</span>
            </a>
        `;
        examSubmenu.appendChild(li);
    }

    // 2. Hook switchCPSCLExamSubTab
    const prevSwitch = window.switchCPSCLExamSubTab;
    window.switchCPSCLExamSubTab = function (element, tabKey) {
        if (typeof prevSwitch === 'function') {
            prevSwitch(element, tabKey);
        }

        if (tabKey === 'student-progress-card') {
            document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
            if (element) element.classList.add('active');

            document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
            const topTitle = document.getElementById('top-title');
            if (topTitle) topTitle.innerText = "CPSCL Academic ERP – Student Progress Card";

            let view = document.getElementById('cpscl-student-progress-card-main-view');
            if (!view) {
                const mainWrapper = document.querySelector('.main-wrapper');
                if (mainWrapper) {
                    view = document.createElement('div');
                    view.className = 'view-panel active';
                    view.id = 'cpscl-student-progress-card-main-view';
                    mainWrapper.appendChild(view);
                }
            } else {
                view.classList.add('active');
            }

            renderCardWorkspace();
            loadCardAvailableExams();
        }
    };

    // 3. Inject Scoped Styles (Distinct Watermark & Clean Layout)
    function injectCardStyles() {
        if (document.getElementById('cpscl-card-scoped-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-card-scoped-styles';
        style.innerHTML = `
            .spc-wrapper { padding: 15px 5px; font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #0f172a; }
            .spc-header { background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 50px !important; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); flex-wrap: wrap; gap: 12px; }
            .spc-header h1 { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; display: flex; align-items: center; gap: 10px; }
            .spc-header h1 i { color: #2563eb; }
            .spc-badge { font-size: 11px; font-weight: 700; background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 5px 16px; border-radius: 50px !important; }

            .spc-filter-card { background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 18px 22px; margin-bottom: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
            .spc-filter-title { font-size: 0.95rem; font-weight: 800; color: #1e3a8a; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
            .spc-exam-checkboxes { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 10px; margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; }
            .spc-chk-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; color: #334155; cursor: pointer; user-select: none; }
            .spc-chk-item input { width: 16px; height: 16px; accent-color: #2563eb; cursor: pointer; }

            .spc-search-bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-top: 12px; border-top: 1px solid #e2e8f0; padding-top: 14px; }
            .spc-search-input { height: 42px; border: 1.5px solid #cbd5e1; border-radius: 50px; padding: 0 18px; font-size: 0.9rem; font-weight: 600; outline: none; width: 260px; }
            .spc-search-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.12); }

            .spc-btn-pill { height: 40px; padding: 0 20px; border-radius: 50px !important; font-size: 13px; font-weight: 700; cursor: pointer; border: none; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s; text-decoration: none; }
            .spc-btn-primary { background: #2563eb; color: #fff; box-shadow: 0 2px 8px rgba(37,99,235,0.25); }
            .spc-btn-primary:hover { background: #1d4ed8; }
            .spc-btn-success { background: #059669; color: #fff; box-shadow: 0 2px 8px rgba(5,150,105,0.25); }
            .spc-btn-success:hover { background: #047857; }
            .spc-btn-outline { background: #fff; border: 1.5px solid #cbd5e1; color: #334155; }
            .spc-btn-outline:hover { background: #f8fafc; border-color: #94a3b8; }

            .spc-preview-container { background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 20px; padding: 22px; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }

            /* Student Slip Card Design */
            .student-slip-card {
                position: relative;
                background: #ffffff;
                border: 1.5px solid #000;
                border-radius: 8px;
                padding: 14px 18px 12px 18px;
                overflow: hidden;
                margin-bottom: 15px;
            }

            /* 🌟 Distinct Watermark: Opacity 0.12 for Clear Visibility */
            .watermark-bg {
                position: absolute;
                top: 55%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 250px;
                height: 250px;
                background-image: url('${CPSCL_LOGO_URL}');
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
                opacity: 0.12 !important; /* স্পষ্ট কিন্তু লেখার কোনো ক্ষতি করবে না */
                pointer-events: none;
                z-index: 0;
            }

            .card-inner { position: relative; z-index: 1; }

            .slip-header { display: flex; align-items: center; border-bottom: 1.5px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
            .slip-logo { width: 48px; height: 48px; object-fit: contain; flex-shrink: 0; }
            .slip-titles { flex: 1; text-align: center; margin-right: 48px; }
            .slip-titles h2 { font-size: 14px; font-weight: 800; margin: 0 0 2px 0; text-transform: uppercase; letter-spacing: 0.2px; color: #000; }
            .slip-titles h3 { font-size: 11.5px; font-weight: 700; margin: 0 0 2px 0; color: #1e3a8a; }
            .slip-titles h4 { font-size: 10.5px; font-weight: 800; margin: 0; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; }

            .bio-strip { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 5px; padding: 5px 10px; margin-bottom: 8px; display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 4px 10px; font-size: 10px; }
            .bio-item { display: flex; align-items: center; gap: 4px; }
            .bio-label { color: #64748b; font-weight: 700; }
            .bio-val { font-weight: 800; color: #0f172a; }
            .badge-grp { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 1px 7px; border-radius: 50px; font-size: 9.5px; font-weight: 800; }

            .matrix-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            .matrix-table th, .matrix-table td { border: 1px solid #000; padding: 3.5px 4px; font-size: 9.5px; text-align: center; line-height: 1.15; }
            .matrix-table th { background-color: #f1f5f9; font-weight: 800; color: #000; }
            .matrix-table td.exam-name { text-align: left; font-weight: 700; padding-left: 6px; }
            .matrix-table td.score-total { font-weight: 800; background-color: #f8fafc; }
            .matrix-table tr.total-row td { font-weight: 900; background-color: #e2e8f0; border-top: 1.5px solid #000; }

            .summary-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 8px; }
            .sum-box { border: 1px solid #000; border-radius: 4px; padding: 4px 2px; text-align: center; background: #ffffff; }
            .sum-box .sb-title { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #64748b; margin-bottom: 1px; }
            .sum-box .sb-val { font-size: 11.5px; font-weight: 900; color: #000; }
            .sum-box.highlight { background: #fef2f2; border-color: #b91c1c; }
            .sum-box.highlight .sb-val { color: #b91c1c; }

            .remarks-line { border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px 8px; font-size: 9.5px; background: #f8fafc; margin-bottom: 8px; color: #334155; }
            .remarks-line strong { color: #0f172a; }

            /* সিগনেচার ব্লক: সই ও সিল মারার জন্য পর্যাপ্ত ফাঁকা জায়গা (35px) */
            .sig-container { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 8px 2px 8px; margin-top: 6px; }
            .sig-box { text-align: center; min-width: 140px; }
            .sig-space { height: 35px; } /* সই ও সিল মারার পর্যাপ্ত জায়গা */
            .sig-line { width: 100%; border-top: 1.2px solid #000; margin-bottom: 3px; }
            .sig-text { font-size: 9.5px; font-weight: 800; color: #000; }

            .scissor-cut-divider { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 12px 0; color: #64748b; font-size: 10.5px; font-weight: 700; }
            .scissor-cut-divider::before, .scissor-cut-divider::after { content: ''; flex: 1; border-bottom: 1.5px dashed #94a3b8; }
        `;
        document.head.appendChild(style);
    }

    // 4. Render Main UI Structure
    function renderCardWorkspace() {
        const view = document.getElementById('cpscl-student-progress-card-main-view');
        if (!view) return;

        view.innerHTML = `
            <div class="spc-wrapper">
                <div class="spc-header">
                    <div>
                        <h1><i class="fa-solid fa-address-card"></i> Student Progress Report Card</h1>
                        <span style="font-size: 11px; color: #64748b; font-weight: 600;">Individual Evaluation Card • Single A5 Slip & Dual A4 Batch Printing</span>
                    </div>
                    <span class="spc-badge"><i class="fa-solid fa-certificate"></i> 100% Pure English Corporate</span>
                </div>

                <!-- Control & Search Card -->
                <div class="spc-filter-card">
                    <div class="spc-filter-title">
                        <i class="fa-solid fa-list-check"></i> 1. Select Assessments to Include in the Card
                    </div>
                    <div class="spc-exam-checkboxes" id="spcExamCheckboxes">
                        <div style="font-size: 12px; color: #64748b;">Loading registered examinations...</div>
                    </div>

                    <div class="spc-search-bar">
                        <input type="text" id="spcStudentSearchInput" class="spc-search-input" placeholder="Search by Student ID or Name..." oninput="window.onProgressCardSearch(this.value)">
                        
                        <select id="spcStudentSelectDropdown" class="spc-search-input" style="width: 280px;" onchange="window.onProgressCardSelectStudent(this.value)">
                            <option value="">-- Choose Student --</option>
                        </select>

                        <button type="button" class="spc-btn-pill spc-btn-primary" onclick="window.generateProgressCardsData()">
                            <i class="fa-solid fa-arrows-rotate"></i> Refresh Data
                        </button>

                        <button type="button" class="spc-btn-pill spc-btn-outline" onclick="window.printSingleSelectedStudentCard()">
                            <i class="fa-solid fa-print"></i> Print This Card (Single A5)
                        </button>

                        <button type="button" class="spc-btn-pill spc-btn-success" onclick="window.printAllStudentCardsBatch()">
                            <i class="fa-solid fa-copy"></i> Print All Cards (2 per A4)
                        </button>
                    </div>
                </div>

                <!-- On-Screen Preview Area -->
                <div class="spc-preview-container">
                    <div id="spcSinglePreviewArea">
                        <div style="text-align: center; padding: 40px 20px; color: #64748b;">
                            <i class="fa-solid fa-address-card" style="font-size: 38px; color: #cbd5e1; margin-bottom: 10px;"></i>
                            <p style="font-weight: 700; margin: 0;">Select a student above to preview their individual progress card.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 5. Data Stores & State
    let allExamsList = [];
    let allStudentsList = [];
    let groupOverrides = {};
    let computedCardStudents = [];
    let activeSelectedStudentId = null;

    async function loadCardAvailableExams() {
        const container = document.getElementById('spcExamCheckboxes');
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

        allExamsList = examList;
        allExamsList.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

        if (allExamsList.length === 0) {
            container.innerHTML = '<div style="color:#ef4444; font-weight:700;">No examinations found.</div>';
            return;
        }

        let html = '';
        allExamsList.forEach((ex, idx) => {
            const isChecked = idx >= Math.max(0, allExamsList.length - 4); // Default select last 4
            html += `
                <label class="spc-chk-item">
                    <input type="checkbox" class="spc-exam-chk" value="${ex.id}" ${isChecked ? 'checked' : ''} onchange="window.generateProgressCardsData()">
                    <span>${ex.name} <small style="color:#64748b;">(${ex.date ? ex.date.substring(5) : ''})</small></span>
                </label>
            `;
        });
        container.innerHTML = html;

        await window.generateProgressCardsData();
    }

    // 6. Comprehensive Calculation Engine
    window.generateProgressCardsData = async function () {
        const checkboxes = document.querySelectorAll('.spc-exam-chk:checked');
        if (!checkboxes || checkboxes.length === 0) {
            alert("Please select at least one assessment!");
            return;
        }

        const selectedExamIds = Array.from(checkboxes).map(c => c.value);
        const selectedExams = allExamsList.filter(x => selectedExamIds.includes(x.id));
        selectedExams.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

        // 1. Fetch Students
        let students = [];
        try {
            const local = localStorage.getItem('cpscl_students_cache');
            if (local) students = JSON.parse(local);
        } catch(e){}

        if (window.getDatabase && window.ref && window.get) {
            try {
                const snapS = await window.get(window.ref(window.getDatabase(), 'cpscl_students'));
                if (snapS.exists()) {
                    const data = snapS.val();
                    students = Array.isArray(data) ? data : Object.values(data);
                }
            } catch(e){}
        }

        const targetClassClean = String(selectedExams[0].class || '').trim().toLowerCase();
        let classStudents = students.filter(s => {
            const cName = String(s.class_name || s.class || '').trim().toLowerCase();
            return cName === targetClassClean || cName.includes(targetClassClean) || targetClassClean.includes(cName);
        });

        allStudentsList = classStudents;

        // 2. Fetch Group Overrides
        if (window.getDatabase && window.ref && window.get) {
            try {
                const snapO = await window.get(window.ref(window.getDatabase(), 'cpscl_exam_group_overrides'));
                if (snapO.exists()) groupOverrides = snapO.val() || {};
            } catch(e){}
        }

        const latestExam = selectedExams[selectedExams.length - 1];

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
                examMarksStore[ex.id][sub] = sMap;
            }
        }

        // 4. Precompute Ranks for Each Exam
        const examStudentRanks = {};
        selectedExams.forEach(ex => {
            const exId = ex.id;
            const subs = Object.keys(ex.subjects || {});
            const studentExamScores = classStudents.map(st => {
                const sId = String(st.std_id || st.id || '').trim();
                let testSum = 0;
                subs.forEach(sub => {
                    const rec = (examMarksStore[exId] && examMarksStore[exId][sub]) ? examMarksStore[exId][sub][sId] : null;
                    if (rec) {
                        const val = (rec.rawMark !== null && rec.rawMark !== undefined && rec.rawMark !== '')
                            ? parseFloat(rec.rawMark)
                            : (parseFloat(rec.cq) || 0) + (parseFloat(rec.mcq) || 0) + (parseFloat(rec.practical) || 0);
                        if (!isNaN(val)) testSum += val;
                    }
                });
                return { sId, testSum };
            });

            studentExamScores.sort((a, b) => b.testSum - a.testSum);

            examStudentRanks[exId] = {};
            studentExamScores.forEach((row, idx) => {
                examStudentRanks[exId][row.sId] = idx + 1;
            });
        });

        // 5. Compute Grand Totals & Cumulative Ranking
        const standardSubjects = ["Bangla", "English", "Mathematics", "Science", "BGS"];
        let cumulativeMaxScore = selectedExams.length * 60; // Standard 60 per test

        computedCardStudents = classStudents.map(st => {
            const sId = String(st.std_id || st.id || '').trim();
            const sName = st.student_name || st.name || 'Unnamed';

            let currentGroup = "Group A";
            if (groupOverrides[latestExam.id] && groupOverrides[latestExam.id][sId]) {
                currentGroup = groupOverrides[latestExam.id][sId];
            }

            let grandTotal = 0;
            const subjectTotals = { Bangla: 0, English: 0, Mathematics: 0, Science: 0, BGS: 0 };
            const subjectMaxPossibles = { Bangla: 0, English: 0, Mathematics: 0, Science: 0, BGS: 0 };
            const examRows = [];

            selectedExams.forEach(ex => {
                const exId = ex.id;
                const subs = Object.keys(ex.subjects || {});
                let testScore = 0;
                const scores = {};

                standardSubjects.forEach(subName => {
                    let markVal = '-';
                    // Match subject flexibly (e.g. Math vs Mathematics)
                    const matchingKey = subs.find(k => k.toLowerCase().startsWith(subName.substring(0, 3).toLowerCase()));
                    if (matchingKey && examMarksStore[exId][matchingKey]) {
                        const rec = examMarksStore[exId][matchingKey][sId];
                        if (rec) {
                            const val = (rec.rawMark !== null && rec.rawMark !== undefined && rec.rawMark !== '')
                                ? parseFloat(rec.rawMark)
                                : (parseFloat(rec.cq) || 0) + (parseFloat(rec.mcq) || 0) + (parseFloat(rec.practical) || 0);
                            if (!isNaN(val)) {
                                markVal = val;
                                testScore += val;
                                subjectTotals[subName] += val;
                                subjectMaxPossibles[subName] += (ex.subjects[matchingKey] || 30);
                            }
                        }
                    }
                    scores[subName] = markVal;
                });

                grandTotal += testScore;
                const examRank = examStudentRanks[exId] ? examStudentRanks[exId][sId] : '-';

                examRows.push({
                    examName: ex.name,
                    date: ex.date || '',
                    scores,
                    testScore,
                    examRank
                });
            });

            const convertedScore = cumulativeMaxScore > 0 ? ((grandTotal / cumulativeMaxScore) * 100) : 0;

            return {
                id: sId,
                name: sName,
                class: selectedExams[0].class || 'Eight Scholarship Batch-2026',
                group: currentGroup,
                range: `${selectedExams[0].name} to ${latestExam.name}`,
                date: new Date().toISOString().split('T')[0],
                examRows,
                subjectTotals,
                subjectMaxPossibles,
                grandTotal,
                maxPossible: cumulativeMaxScore,
                convertedScore: parseFloat(convertedScore.toFixed(2))
            };
        });

        // Sort by Grand Total descending
        computedCardStudents.sort((a, b) => b.grandTotal - a.grandTotal);
        computedCardStudents.forEach((st, idx) => {
            st.cumulativeRank = idx + 1;
        });

        populateStudentDropdown();

        // If a student was previously selected, re-render their card
        if (activeSelectedStudentId) {
            renderSingleStudentCardOnScreen(activeSelectedStudentId);
        } else if (computedCardStudents.length > 0) {
            activeSelectedStudentId = computedCardStudents[0].id;
            renderSingleStudentCardOnScreen(activeSelectedStudentId);
        }
    };

    function populateStudentDropdown() {
        const select = document.getElementById('spcStudentSelectDropdown');
        if (!select) return;

        const current = select.value;
        select.innerHTML = '<option value="">-- Choose Student --</option>';

        computedCardStudents.forEach(st => {
            select.innerHTML += `<option value="${st.id}">#${st.cumulativeRank} - ${st.name} (ID: ${st.id})</option>`;
        });

        if (current && computedCardStudents.some(s => s.id === current)) {
            select.value = current;
        } else if (activeSelectedStudentId) {
            select.value = activeSelectedStudentId;
        }
    }

    window.onProgressCardSearch = function (query) {
        const q = String(query || '').trim().toLowerCase();
        const select = document.getElementById('spcStudentSelectDropdown');
        if (!q) return;

        const match = computedCardStudents.find(s => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
        if (match) {
            if (select) select.value = match.id;
            activeSelectedStudentId = match.id;
            renderSingleStudentCardOnScreen(match.id);
        }
    };

    window.onProgressCardSelectStudent = function (studentId) {
        if (!studentId) return;
        activeSelectedStudentId = studentId;
        renderSingleStudentCardOnScreen(studentId);
    };

    // Helper: Build a Student Slip HTML (Exact Compact Fit)
    function buildStudentCardHTML(st) {
        const ordinal = (n) => {
            const s = ["th", "st", "nd", "rd"], v = n % 100;
            return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };

        let rowsHtml = '';
        st.examRows.forEach(row => {
            rowsHtml += `
                <tr>
                    <td class="exam-name">${row.examName}</td>
                    <td>${row.date}</td>
                    <td>${row.scores.Bangla}</td>
                    <td>${row.scores.English}</td>
                    <td>${row.scores.Mathematics}</td>
                    <td>${row.scores.Science}</td>
                    <td>${row.scores.BGS}</td>
                    <td class="score-total">${row.testScore}</td>
                    <td style="font-weight:700;">${row.examRank !== '-' ? ordinal(row.examRank) : '-'}</td>
                </tr>
            `;
        });

        const subTot = (sub) => {
            const got = st.subjectTotals[sub];
            const max = st.subjectMaxPossibles[sub];
            return max > 0 ? `${got}/${max}` : '-';
        };

        const remarksText = (st.cumulativeRank <= 10) 
            ? "Outstanding academic excellence and consistency. Maintained top-tier performance in Group A."
            : (st.cumulativeRank <= 40)
            ? "Good performance and steady improvement. Maintained position in Group A."
            : "Needs focused preparation and extra effort in key subjects to advance into Group A.";

        return `
            <div class="student-slip-card">
                <div class="watermark-bg"></div>
                <div class="card-inner">
                    
                    <div class="slip-header">
                        <img src="${CPSCL_LOGO_URL}" class="slip-logo" alt="Logo">
                        <div class="slip-titles">
                            <h2>CANTONMENT PUBLIC SCHOOL AND COLLEGE LALMONIRHAT</h2>
                            <h3>${st.class}</h3>
                            <h4>Student Academic Progress Report Card</h4>
                        </div>
                    </div>

                    <div class="bio-strip">
                        <div class="bio-item"><span class="bio-label">Name:</span> <span class="bio-val">${st.name}</span></div>
                        <div class="bio-item"><span class="bio-label">ID:</span> <span class="bio-val">${st.id}</span></div>
                        <div class="bio-item"><span class="bio-label">Group:</span> <span class="badge-grp">${st.group}</span></div>
                        <div class="bio-item"><span class="bio-label">Program:</span> <span class="bio-val">Scholarship Batch</span></div>
                        <div class="bio-item"><span class="bio-label">Evaluation:</span> <span class="bio-val">${st.range}</span></div>
                        <div class="bio-item"><span class="bio-label">Date:</span> <span class="bio-val">${st.date}</span></div>
                    </div>

                    <table class="matrix-table">
                        <thead>
                            <tr>
                                <th style="width: 25%;">Assessment</th>
                                <th style="width: 14%;">Date</th>
                                <th style="width: 9%;">Bangla<br><small>(30)</small></th>
                                <th style="width: 9%;">English<br><small>(30)</small></th>
                                <th style="width: 9%;">Math<br><small>(30)</small></th>
                                <th style="width: 9%;">Science<br><small>(30)</small></th>
                                <th style="width: 9%;">BGS<br><small>(30)</small></th>
                                <th style="width: 8%;">Score<br><small>(60)</small></th>
                                <th style="width: 8%;">Rank</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rowsHtml}
                            <tr class="total-row">
                                <td class="exam-name">Total Marks</td>
                                <td>${st.examRows.length} Tests</td>
                                <td>${subTot('Bangla')}</td>
                                <td>${subTot('English')}</td>
                                <td>${subTot('Mathematics')}</td>
                                <td>${subTot('Science')}</td>
                                <td>${subTot('BGS')}</td>
                                <td class="score-total">${st.grandTotal}/${st.maxPossible}</td>
                                <td>${ordinal(st.cumulativeRank)}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="summary-bar">
                        <div class="sum-box"><div class="sb-title">Grand Total</div><div class="sb-val">${st.grandTotal} / ${st.maxPossible}</div></div>
                        <div class="sum-box highlight"><div class="sb-title">Converted Score</div><div class="sb-val">${st.convertedScore.toFixed(2)}%</div></div>
                        <div class="sum-box"><div class="sb-title">Cumulative Rank</div><div class="sb-val">${ordinal(st.cumulativeRank)} / ${computedCardStudents.length}</div></div>
                        <div class="sum-box"><div class="sb-title">Current Group</div><div class="sb-val" style="color: #2563eb;">${st.group.toUpperCase()}</div></div>
                    </div>

                    <div class="remarks-line">
                        <strong>Remarks:</strong> ${remarksText}
                    </div>

                    <div class="sig-container">
                        <div class="sig-box"><div class="sig-space"></div><div class="sig-line"></div><div class="sig-text">Guardian's Signature</div></div>
                        <div class="sig-box"><div class="sig-space"></div><div class="sig-line"></div><div class="sig-text">Course Coordinator</div></div>
                        <div class="sig-box"><div class="sig-space"></div><div class="sig-line"></div><div class="sig-text">Principal</div></div>
                    </div>

                </div>
            </div>
        `;
    }

    function renderSingleStudentCardOnScreen(studentId) {
        const container = document.getElementById('spcSinglePreviewArea');
        if (!container) return;

        const st = computedCardStudents.find(s => s.id === studentId);
        if (!st) {
            container.innerHTML = '<div style="text-align:center; padding:30px; color:#ef4444; font-weight:700;">Student record not found.</div>';
            return;
        }

        container.innerHTML = buildStudentCardHTML(st);
    }

    // 7. Print Engine: Single Student (Clean A5 / Half Slip Fit)
    window.printSingleSelectedStudentCard = function () {
        if (!activeSelectedStudentId) {
            alert("Please select a student first!");
            return;
        }

        const st = computedCardStudents.find(s => s.id === activeSelectedStudentId);
        if (!st) return;

        const oldFrame = document.getElementById('spc-print-iframe');
        if (oldFrame) oldFrame.remove();

        const iframe = document.createElement('iframe');
        iframe.id = 'spc-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const cardHtml = buildStudentCardHTML(st);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Student Progress Card - ${st.name} (${st.id})</title>
                <style>
                    @page {
                        size: A5 landscape; /* বা যেকোনো হাফ পেজে নিখুঁত ফিট */
                        margin: 5mm 7mm;
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
                    }
                    .student-slip-card {
                        position: relative;
                        background: #ffffff;
                        border: 1.2px solid #000;
                        border-radius: 6px;
                        padding: 10px 14px;
                        overflow: hidden;
                    }
                    .watermark-bg {
                        position: absolute;
                        top: 55%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 240px;
                        height: 240px;
                        background-image: url('${CPSCL_LOGO_URL}');
                        background-repeat: no-repeat;
                        background-position: center;
                        background-size: contain;
                        opacity: 0.12 !important;
                        pointer-events: none;
                        z-index: 0;
                    }
                    .card-inner { position: relative; z-index: 1; }
                    .slip-header { display: flex; align-items: center; border-bottom: 1.5px solid #000; padding-bottom: 5px; margin-bottom: 6px; }
                    .slip-logo { width: 44px; height: 44px; object-fit: contain; }
                    .slip-titles { flex: 1; text-align: center; margin-right: 44px; }
                    .slip-titles h2 { font-size: 13.5px; font-weight: bold; margin: 0 0 2px 0; text-transform: uppercase; color: #000; }
                    .slip-titles h3 { font-size: 11px; font-weight: bold; margin: 0 0 2px 0; color: #1e3a8a; }
                    .slip-titles h4 { font-size: 10px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase; }
                    .bio-strip { background: #f8fafc; border: 1px solid #000; border-radius: 4px; padding: 4px 8px; margin-bottom: 6px; display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 4px 8px; font-size: 9.5px; }
                    .bio-item { display: flex; gap: 4px; }
                    .bio-label { font-weight: bold; }
                    .bio-val { font-weight: bold; }
                    .badge-grp { font-weight: bold; }
                    .matrix-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
                    th, td { border: 1px solid #000; padding: 3px 3px; font-size: 9px; text-align: center; }
                    th { background-color: #f1f5f9; font-weight: bold; }
                    .matrix-table td.exam-name { text-align: left; font-weight: bold; padding-left: 5px; }
                    .matrix-table tr.total-row td { font-weight: bold; background-color: #e2e8f0; }
                    .summary-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 6px; }
                    .sum-box { border: 1px solid #000; border-radius: 4px; padding: 3px 2px; text-align: center; }
                    .sum-box .sb-title { font-size: 7.5px; font-weight: bold; text-transform: uppercase; }
                    .sum-box .sb-val { font-size: 11px; font-weight: bold; }
                    .remarks-line { border: 1px solid #000; border-radius: 4px; padding: 4px 6px; font-size: 9px; margin-bottom: 6px; }
                    .sig-container { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 6px; margin-top: 4px; }
                    .sig-box { text-align: center; min-width: 130px; }
                    .sig-space { height: 35px; }
                    .sig-line { width: 100%; border-top: 1.2px solid #000; margin-bottom: 3px; }
                    .sig-text { font-size: 9px; font-weight: bold; }
                </style>
            </head>
            <body>
                ${cardHtml}
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 400);
    };

    // 8. Batch Print Engine: All Students (2 Cards per A4 Page)
    window.printAllStudentCardsBatch = function () {
        if (!computedCardStudents || computedCardStudents.length === 0) {
            alert("No students data generated to print!");
            return;
        }

        const oldFrame = document.getElementById('spc-print-iframe');
        if (oldFrame) oldFrame.remove();

        const iframe = document.createElement('iframe');
        iframe.id = 'spc-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        let pagesHtml = '';
        const total = computedCardStudents.length;

        for (let i = 0; i < total; i += 2) {
            const st1 = computedCardStudents[i];
            const st2 = (i + 1 < total) ? computedCardStudents[i + 1] : null;

            pagesHtml += `
                <div class="a4-batch-page">
                    ${buildStudentCardHTML(st1)}
                    ${st2 ? `
                        <div class="scissor-cut-divider">
                            ✂ CUT ALONG THIS LINE TO SEPARATE ✂
                        </div>
                        ${buildStudentCardHTML(st2)}
                    ` : ''}
                </div>
            `;
        }

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>All Students Progress Cards (Batch Print) - CPSCL</title>
                <style>
                    @page {
                        size: A4 portrait;
                        margin: 6mm 8mm 6mm 8mm;
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
                    }
                    .a4-batch-page {
                        page-break-after: always;
                        height: 100%;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }
                    .a4-batch-page:last-child {
                        page-break-after: avoid;
                    }
                    .student-slip-card {
                        position: relative;
                        background: #ffffff;
                        border: 1.2px solid #000;
                        border-radius: 6px;
                        padding: 10px 14px;
                        overflow: hidden;
                    }
                    .watermark-bg {
                        position: absolute;
                        top: 55%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 240px;
                        height: 240px;
                        background-image: url('${CPSCL_LOGO_URL}');
                        background-repeat: no-repeat;
                        background-position: center;
                        background-size: contain;
                        opacity: 0.12 !important;
                        pointer-events: none;
                        z-index: 0;
                    }
                    .card-inner { position: relative; z-index: 1; }
                    .slip-header { display: flex; align-items: center; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 5px; }
                    .slip-logo { width: 44px; height: 44px; object-fit: contain; }
                    .slip-titles { flex: 1; text-align: center; margin-right: 44px; }
                    .slip-titles h2 { font-size: 13.5px; font-weight: bold; margin: 0 0 2px 0; text-transform: uppercase; color: #000; }
                    .slip-titles h3 { font-size: 11px; font-weight: bold; margin: 0 0 2px 0; color: #1e3a8a; }
                    .slip-titles h4 { font-size: 10px; font-weight: bold; margin: 0; color: #000; text-transform: uppercase; }
                    .bio-strip { background: #f8fafc; border: 1px solid #000; border-radius: 4px; padding: 4px 8px; margin-bottom: 5px; display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 4px 8px; font-size: 9.5px; }
                    .bio-item { display: flex; gap: 4px; }
                    .bio-label { font-weight: bold; }
                    .bio-val { font-weight: bold; }
                    .badge-grp { font-weight: bold; }
                    .matrix-table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
                    th, td { border: 1px solid #000; padding: 3px 3px; font-size: 9px; text-align: center; }
                    th { background-color: #f1f5f9; font-weight: bold; }
                    .matrix-table td.exam-name { text-align: left; font-weight: bold; padding-left: 5px; }
                    .matrix-table tr.total-row td { font-weight: bold; background-color: #e2e8f0; }
                    .summary-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 5px; }
                    .sum-box { border: 1px solid #000; border-radius: 4px; padding: 3px 2px; text-align: center; }
                    .sum-box .sb-title { font-size: 7.5px; font-weight: bold; text-transform: uppercase; }
                    .sum-box .sb-val { font-size: 11px; font-weight: bold; }
                    .remarks-line { border: 1px solid #000; border-radius: 4px; padding: 4px 6px; font-size: 9px; margin-bottom: 5px; }
                    .sig-container { display: flex; justify-content: space-between; align-items: flex-end; padding: 0 6px; margin-top: 4px; }
                    .sig-box { text-align: center; min-width: 130px; }
                    .sig-space { height: 35px; }
                    .sig-line { width: 100%; border-top: 1.2px solid #000; margin-bottom: 3px; }
                    .sig-text { font-size: 9px; font-weight: bold; }
                    .scissor-cut-divider { display: flex; align-items: center; justify-content: center; gap: 10px; margin: 10px 0; color: #64748b; font-size: 10.5px; font-weight: bold; }
                    .scissor-cut-divider::before, .scissor-cut-divider::after { content: ''; flex: 1; border-bottom: 1.5px dashed #000; }
                </style>
            </head>
            <body>
                ${pagesHtml}
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }, 500);
    };

    // 9. Initialize Suite
    function init() {
        injectCardStyles();
        injectProgressCardSidebar();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
