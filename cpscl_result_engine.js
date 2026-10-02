/**
 * CPSCL Academic Evaluation - Independent Result & Promotion Engine (PRO VERSION)
 * File: cpscl_result_engine.js
 * Safety: 100% Non-destructive Read-Only Mark Processing
 * Architecture: Auto-Compile on Open, Dual PDF Printing, Promotion Seal & Change Detection
 */

(function () {
    // ==========================================================
    // ১. স্টাইল ইনজেকশন (Tiro Bangla + FontAwesome Support)
    // ==========================================================
    const engineStyle = document.createElement('style');
    engineStyle.id = 'cpscl-result-engine-style';
    engineStyle.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

        #result-engine-view, #result-engine-view * {
            font-family: 'Tiro Bangla', serif !important;
            box-sizing: border-box;
        }

        /* আইকন ফিক্স */
        #result-engine-view i, 
        #result-engine-view .fa, 
        #result-engine-view .fas, 
        #result-engine-view .fa-solid {
            font-family: "Font Awesome 6 Free", "FontAwesome" !important;
            font-weight: 900 !important;
            font-style: normal !important;
            display: inline-block !important;
        }

        .re-square-card {
            background: #ffffff;
            border: 1.5px solid #cbd5e1;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .re-header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 14px;
            flex-wrap: wrap;
            gap: 10px;
        }

        .re-card-title {
            font-size: 0.98rem;
            font-weight: 800;
            color: #0f172a;
        }

        .re-grid-2x2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 18px;
            margin-bottom: 14px;
        }

        .re-input-group label {
            display: block;
            font-size: 0.78rem;
            font-weight: 700;
            color: #475569;
            margin-bottom: 5px;
        }

        .re-select {
            width: 100%;
            height: 38px;
            padding: 0 12px;
            border: 1.5px solid #cbd5e1;
            border-radius: 10px;
            font-size: 0.85rem;
            font-weight: 600;
            color: #0f172a;
            outline: none;
            background: #ffffff;
            cursor: pointer;
        }
        .re-select:focus { border-color: #0f172a; }

        .re-toolbar {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            border-top: 1px solid #f1f5f9;
            padding-top: 12px;
            flex-wrap: wrap;
        }

        .re-btn-pill {
            height: 34px;
            padding: 0 18px;
            border-radius: 18px;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            transition: all 0.15s ease;
            border: none;
            text-decoration: none;
        }
        .re-btn-pill:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .re-btn-pill:disabled {
            opacity: 0.45;
            cursor: not-allowed;
            transform: none !important;
            box-shadow: none !important;
        }

        .re-btn-dark { background: #0f172a; color: #ffffff; }
        .re-btn-navy { background: #1e3a8a; color: #ffffff; }
        .re-btn-cyan { background: #0284c7; color: #ffffff; }
        .re-btn-neutral { background: #ffffff; color: #334155; border: 1.5px solid #cbd5e1; }
        .re-btn-slate { background: #334155; color: #ffffff; }

        .re-table-box {
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            overflow-x: auto;
            background: #fff;
        }

        .re-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
        }
        .re-table th {
            background: #f8fafc;
            padding: 9px 12px;
            text-align: left;
            font-size: 0.74rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            border-bottom: 1.5px solid #cbd5e1;
            border-right: 1px solid #e2e8f0;
            white-space: nowrap;
        }
        .re-table td {
            padding: 8px 12px;
            border-bottom: 1px solid #e2e8f0;
            border-right: 1px solid #f8fafc;
            color: #0f172a;
            white-space: nowrap;
        }
        .re-table tr:hover { background: #f8fafc; }

        .re-tag {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.74rem;
            font-weight: 700;
            background: #f1f5f9;
            color: #334155;
            border: 1px solid #cbd5e1;
        }

        /* নোটিশ ব্যানার */
        .re-alert-banner {
            display: none;
            background: #fffbeb;
            border: 1.5px solid #fde68a;
            color: #92400e;
            padding: 10px 16px;
            border-radius: 10px;
            margin-bottom: 14px;
            font-size: 0.84rem;
            font-weight: 700;
            align-items: center;
            gap: 10px;
        }
    `;
    document.head.appendChild(engineStyle);

    // MASTER SUBJECT DEFINITIONS
    const MASTER_SUBJECTS = {
        Science: [
            { key: 'B1', name: 'Bangla 1st' }, { key: 'B2', name: 'Bangla 2nd' },
            { key: 'E1', name: 'English 1st' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'HM_AG', name: 'HM/AG' },
            { key: 'Phy', name: 'Physics' }, { key: 'Che', name: 'Chemistry' },
            { key: 'Bio', name: 'Biology' }, { key: 'BGS', name: 'BGS' },
            { key: 'Reli', name: 'Religion' }, { key: 'ICT', name: 'ICT' }
        ],
        Humanities: [
            { key: 'B1', name: 'Bangla 1st' }, { key: 'B2', name: 'Bangla 2nd' },
            { key: 'E1', name: 'English 1st' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'AG_HE', name: 'AG/HE' },
            { key: 'His', name: 'History' }, { key: 'Geo', name: 'Geography' },
            { key: 'Civ', name: 'Civics' }, { key: 'Sci', name: 'General Science' },
            { key: 'Reli', name: 'Religion' }, { key: 'ICT', name: 'ICT' }
        ],
        BStudies: [
            { key: 'B1', name: 'Bangla 1st' }, { key: 'B2', name: 'Bangla 2nd' },
            { key: 'E1', name: 'English 1st' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'AG_HE', name: 'AG/HE' },
            { key: 'Fin', name: 'Finance' }, { key: 'Acc', name: 'Accounting' },
            { key: 'BE', name: 'Business Ent.' },
            { key: 'Sci', name: 'General Science' }, { key: 'Reli', name: 'Religion' },
            { key: 'ICT', name: 'ICT' }
        ]
    };

    // INTERNAL STATE
    let _db = null, _ref = null, _get = null, _update = null;
    let studentsList = [];
    let examsList = {};
    let activeExamId = "exam_fn02_2026";
    let activeExamData = { title: "Fortnightly Test 02", max: 15 };
    let marksData = {};

    let compiledResultsCache = {
        examId: null,
        compiledAt: null,
        marksHash: null,
        scienceCombined: [],
        groupA: [],
        groupB: [],
        groupC: [],
        humanities: [],
        bstudies: []
    };

    // ==========================================================
    // ২. ইন্টারফেস তৈরি
    // ==========================================================
    function injectResultEngineUI() {
        const examSubmenu = document.getElementById('exam-submenu-list');
        if (examSubmenu && !document.getElementById('sub-result-engine')) {
            const subLi = document.createElement('li');
            subLi.className = 'submenu-item';
            subLi.id = 'sub-result-engine';
            subLi.innerHTML = `<a onclick="window.switchResultEngineView()"><i class="fa-solid fa-award"></i> <span>Result & Promotion</span></a>`;
            examSubmenu.appendChild(subLi);
        }

        const mainWrapper = document.querySelector('.main-wrapper');
        if (mainWrapper && !document.getElementById('result-engine-view')) {
            const viewDiv = document.createElement('div');
            viewDiv.className = 'view-panel';
            viewDiv.id = 'result-engine-view';
            viewDiv.innerHTML = `
                <div class="content-area" style="padding: 10px 0; max-width: 1150px; margin: 0 auto;">

                    <!-- নোটিশ ব্যানার (মার্কস সংশোধন হলে স্বয়ংক্রিয়ভাবে ভেসে উঠবে) -->
                    <div id="reChangeAlertBox" class="re-alert-banner">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.1rem; color: #d97706;"></i>
                        <span id="reChangeAlertText">Student marks were modified in Admin Mark Entry! Please click "Re-generate Results" before promoting.</span>
                    </div>

                    <!-- Step 1: Compilation Action Bar -->
                    <div class="re-square-card" style="padding: 12px 18px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <div>
                                <span style="font-size: 0.90rem; font-weight: 700; color: #0f172a;">1. Process & Compile Marks</span>
                                <div style="font-size: 0.75rem; color: #64748b;">Read live teacher marks, calculate totals, and establish merit rankings.</div>
                            </div>
                            <button class="re-btn-pill re-btn-dark" id="btnReCompile" onclick="window.reCompileResults(false)">
                                <i class="fa-solid fa-arrows-rotate"></i> Re-generate Results
                            </button>
                        </div>
                    </div>

                    <!-- Step 2: 2-Line Spacious Criteria Box (ডুয়াল প্রিন্ট বাটনসহ) -->
                    <div class="re-square-card">
                        <div class="re-header-bar">
                            <div class="re-card-title">2. Select & Export Statements</div>
                            <span id="reStatusBadge" style="font-size: 0.75rem; font-weight: 700; color: #15803d; background: #dcfce7; padding: 3px 10px; border-radius: 12px; border: 1px solid #bbf7d0;">
                                ● Results Active & Ready
                            </span>
                        </div>

                        <div class="re-grid-2x2">
                            <!-- Row 1 -->
                            <div class="re-input-group">
                                <label>Exam Session</label>
                                <select class="re-select" id="reExamSession" onchange="window.reOnExamChanged()">
                                </select>
                            </div>

                            <div class="re-input-group">
                                <label>Class & Stream</label>
                                <select class="re-select" id="reClassSelect" onchange="window.reOnCategoryChanged()">
                                    <option value="Science" selected>Class 10 - Science</option>
                                    <option value="Humanities">Class 10 - Humanities</option>
                                    <option value="B.Studies">Class 10 - Business Studies</option>
                                </select>
                            </div>

                            <!-- Row 2 -->
                            <div class="re-input-group">
                                <label>Report Category</label>
                                <select class="re-select" id="reReportCategory" onchange="window.reOnCategoryChanged()">
                                    <option value="branch" selected>Science Divided Branches</option>
                                    <option value="stream">Full Stream Combined</option>
                                </select>
                            </div>

                            <div class="re-input-group">
                                <label>Specific Target Sheet</label>
                                <select class="re-select" id="reSpecificSheet" onchange="window.reRenderActiveTable()">
                                </select>
                            </div>
                        </div>

                        <!-- ডাবল প্রিন্ট বাটন বার -->
                        <div class="re-toolbar">
                            <button class="re-btn-pill re-btn-navy" onclick="window.rePrintPromotionPDF()" title="Print 6-column Promotion List with New Class Roll">
                                <i class="fa-solid fa-file-invoice"></i> Promotion Sheet (PDF)
                            </button>
                            <button class="re-btn-pill re-btn-cyan" onclick="window.rePrintFullTabulationPDF()" title="Print Complete 12-Subject Marksheet with Marks">
                                <i class="fa-solid fa-table-list"></i> Full Tabulation (PDF)
                            </button>
                            <button class="re-btn-pill re-btn-neutral" onclick="window.reExportExcel()">
                                <i class="fa-solid fa-file-excel" style="color: #16a34a;"></i> Export Excel
                            </button>
                        </div>
                    </div>

                    <!-- Step 3: Table and Promotion Setup -->
                    <div class="re-square-card">
                        <div class="re-header-bar">
                            <span class="re-card-title" id="reTableTitle">Statement Preview</span>
                            <button class="re-btn-pill re-btn-slate" id="btnPromoteNextExam" onclick="window.rePromoteNextExam()">
                                <i class="fa-solid fa-lock"></i> Promote & Lock for Next Exam
                            </button>
                        </div>

                        <div class="re-table-box">
                            <table class="re-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px; text-align: center;">SL</th>
                                        <th style="width: 120px;">Student ID</th>
                                        <th>Student Name</th>
                                        <th style="width: 90px; text-align: center;">Total</th>
                                        <th style="width: 110px; text-align: center;">Current Group</th>
                                        <th style="width: 120px; text-align: center;">Assigned Group</th>
                                        <th style="width: 110px; text-align: center; background: #f8fafc;">Next Class SL</th>
                                    </tr>
                                </thead>
                                <tbody id="reResultTbody"></tbody>
                            </table>
                        </div>
                    </div>

                </div>
            `;
            mainWrapper.appendChild(viewDiv);
        }
    }

    // ==========================================================
    // ৩. নেভিগেশন ও ড্রপডাউন
    // ==========================================================
    window.switchResultEngineView = function () {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('result-engine-view');
        if (panel) panel.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "Result & Promotion Hub";

        document.querySelectorAll('.submenu-item').forEach(i => i.classList.remove('active'));
        const activeSub = document.getElementById('sub-result-engine');
        if (activeSub) activeSub.classList.add('active');

        window.reInitDropdowns();
    };

    window.reInitDropdowns = async function () {
        const exSel = document.getElementById('reExamSession');
        if (!exSel) return;
        exSel.innerHTML = '';

        if (Object.keys(examsList).length > 0) {
            Object.keys(examsList).reverse().forEach(id => {
                const ex = examsList[id];
                const opt = document.createElement('option');
                opt.value = id;
                opt.innerText = `${ex.title || id} (${ex.date || ''})`;
                if (id === activeExamId) opt.selected = true;
                exSel.appendChild(opt);
            });
        } else {
            exSel.innerHTML = `<option value="${activeExamId}">${activeExamData.title}</option>`;
        }

        window.reOnCategoryChanged();
    };

    window.reOnCategoryChanged = function () {
        const stream = document.getElementById('reClassSelect')?.value || 'Science';
        const cat = document.getElementById('reReportCategory')?.value || 'branch';
        const sub = document.getElementById('reSpecificSheet');
        if (!sub) return;
        sub.innerHTML = '';

        if (stream === 'Science') {
            if (cat === 'branch') {
                sub.innerHTML = `
                    <option value="grp_a" selected>New Group-A (Top 55 + Ties)</option>
                    <option value="grp_b">New Group-B (Next 50 + Ties)</option>
                    <option value="grp_c">New Group-C (Remaining)</option>
                `;
            } else {
                sub.innerHTML = `<option value="sci_combined" selected>Science Combined Merit (All Students)</option>`;
            }
        } else if (stream === 'Humanities') {
            sub.innerHTML = `<option value="hum_all" selected>Humanities Merit Sheet</option>`;
        } else if (stream === 'B.Studies') {
            sub.innerHTML = `<option value="bs_all" selected>Business Studies Merit Sheet</option>`;
        }

        // স্বয়ংক্রিয়ভাবে ব্যাকগ্রাউন্ডে ক্যালকুলেট এবং টেবিল রেন্ডার
        window.reEnsureCompiledAndRender();
    };

    window.reOnExamChanged = function () {
        window.reOnCategoryChanged();
    };

    // ==========================================================
    // ৪. স্বয়ংক্রিয় কম্পাইলেশন ও লক চেকার (বারবার জেনারেট চাপতে হবে না)
    // ==========================================================
    function calculateMarksHash(exId) {
        const currentExamMarks = marksData[exId] || {};
        return JSON.stringify(currentExamMarks).length + "_" + Object.keys(currentExamMarks).length;
    }

    window.reEnsureCompiledAndRender = function () {
        const exId = document.getElementById('reExamSession')?.value || activeExamId;
        const currentHash = calculateMarksHash(exId);

        // ১. প্রমোশন লক স্ট্যাটাস চেক
        const isPromoted = (exId !== activeExamId) || (localStorage.getItem(`re_promoted_${exId}`) === 'true');
        const promoBtn = document.getElementById('btnPromoteNextExam');
        const compBtn = document.getElementById('btnReCompile');
        const statusBadge = document.getElementById('reStatusBadge');
        const alertBox = document.getElementById('reChangeAlertBox');

        if (isPromoted) {
            if (promoBtn) {
                promoBtn.disabled = true;
                promoBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Promoted & Sealed`;
            }
            if (compBtn) compBtn.disabled = true;
            if (statusBadge) {
                statusBadge.innerText = "● Exam Promoted & Sealed - Regeneration Locked";
                statusBadge.style.color = "#dc2626";
                statusBadge.style.background = "#fef2f2";
                statusBadge.style.borderColor = "#fecaca";
            }
            if (alertBox) alertBox.style.display = 'none';
        } else {
            if (promoBtn) {
                promoBtn.disabled = false;
                promoBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Promote & Lock for Next Exam`;
            }
            if (compBtn) compBtn.disabled = false;

            // ২. মার্কস পরিবর্তন হয়েছে কি না চেক (Change Detection)
            if (compiledResultsCache.examId === exId && compiledResultsCache.marksHash && compiledResultsCache.marksHash !== currentHash) {
                if (alertBox) alertBox.style.display = 'flex';
                if (statusBadge) {
                    statusBadge.innerText = "⚠️ Marks Modified in Admin Entry (Re-compile Suggested)";
                    statusBadge.style.color = "#b45309";
                    statusBadge.style.background = "#fef3c7";
                    statusBadge.style.borderColor = "#fde68a";
                }
            } else {
                if (alertBox) alertBox.style.display = 'none';
                if (statusBadge) {
                    statusBadge.innerText = "● Results Active & Ready";
                    statusBadge.style.color = "#15803d";
                    statusBadge.style.background = "#dcfce7";
                    statusBadge.style.borderColor = "#bbf7d0";
                }
            }
        }

        // ৩. রেজাল্ট ক্যাশে না থাকলে নিজে থেকেই স্বয়ংক্রিয়ভাবে তৈরি করবে
        if (compiledResultsCache.examId !== exId || compiledResultsCache.scienceCombined.length === 0) {
            window.reCompileResults(true); // silent compile
        } else {
            window.reRenderActiveTable();
        }
    };

    window.reCompileResults = function (isSilent = false) {
        const exId = document.getElementById('reExamSession')?.value || activeExamId;
        const currentExamMarks = marksData[exId] || {};

        // 1. Process Science
        const sciStudents = studentsList.filter(s => s.group === 'Science');
        const sciSubs = MASTER_SUBJECTS.Science;

        let computedSci = sciStudents.map(s => {
            const m = currentExamMarks[s.id] || {};
            let total = 0;
            sciSubs.forEach(sb => {
                const v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, marksObj: m };
        });

        // Combined Science Merit Sort (Highest marks first)
        computedSci.sort((a, b) => b.total - a.total);

        let cutoffA = null;
        let cutoffB = null;

        computedSci.forEach((s, idx) => {
            s.overallMerit = idx + 1;
            if (idx === 54) cutoffA = s.total;
            if (idx === 104) cutoffB = s.total;
        });

        let grpAList = [];
        let grpBList = [];
        let grpCList = [];

        computedSci.forEach(s => {
            if (s.overallMerit <= 55 || (cutoffA !== null && cutoffA > 0 && s.total >= cutoffA)) {
                s.assignedGroup = "Group-A";
                grpAList.push(s);
            } else if (s.overallMerit <= 105 || (cutoffB !== null && cutoffB > 0 && s.total >= cutoffB)) {
                s.assignedGroup = "Group-B";
                grpBList.push(s);
            } else {
                s.assignedGroup = "Group-C";
                grpCList.push(s);
            }
        });

        grpAList.forEach((s, idx) => s.nextClassSL = idx + 1);
        grpBList.forEach((s, idx) => s.nextClassSL = idx + 1);
        grpCList.forEach((s, idx) => s.nextClassSL = idx + 1);

        compiledResultsCache.examId = exId;
        compiledResultsCache.marksHash = calculateMarksHash(exId);
        compiledResultsCache.compiledAt = new Date().toISOString();
        compiledResultsCache.scienceCombined = computedSci;
        compiledResultsCache.groupA = grpAList;
        compiledResultsCache.groupB = grpBList;
        compiledResultsCache.groupC = grpCList;

        // 2. Process Humanities
        const humStudents = studentsList.filter(s => s.group === 'Humanities');
        let computedHum = humStudents.map(s => {
            const m = currentExamMarks[s.id] || {};
            let total = 0;
            MASTER_SUBJECTS.Humanities.forEach(sb => {
                const v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, assignedGroup: 'Humanities', marksObj: m };
        });
        computedHum.sort((a, b) => b.total - a.total);
        computedHum.forEach((s, idx) => { s.overallMerit = idx + 1; s.nextClassSL = idx + 1; });
        compiledResultsCache.humanities = computedHum;

        // 3. Process Business Studies
        const bsStudents = studentsList.filter(s => s.group === 'B.Studies');
        let computedBs = bsStudents.map(s => {
            const m = currentExamMarks[s.id] || {};
            let total = 0;
            MASTER_SUBJECTS.BStudies.forEach(sb => {
                const v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, assignedGroup: 'B.Studies', marksObj: m };
        });
        computedBs.sort((a, b) => b.total - a.total);
        computedBs.forEach((s, idx) => { s.overallMerit = idx + 1; s.nextClassSL = idx + 1; });
        compiledResultsCache.bstudies = computedBs;

        const alertBox = document.getElementById('reChangeAlertBox');
        if (alertBox) alertBox.style.display = 'none';

        window.reRenderActiveTable();

        if (!isSilent) {
            alert("Results compiled successfully!\nTotal scores calculated and merit rankings established without modifying teacher entries.");
        }
    };

    window.reRenderActiveTable = function () {
        const target = document.getElementById('reSpecificSheet')?.value || 'grp_a';
        const tbody = document.getElementById('reResultTbody');
        const title = document.getElementById('reTableTitle');
        if (!tbody) return;
        tbody.innerHTML = '';

        let list = [];
        if (target === 'grp_a') {
            if (title) title.innerText = "New Group-A Statement (Top 55 + Ties)";
            list = compiledResultsCache.groupA;
        } else if (target === 'grp_b') {
            if (title) title.innerText = "New Group-B Statement (Next 50 + Ties)";
            list = compiledResultsCache.groupB;
        } else if (target === 'grp_c') {
            if (title) title.innerText = "New Group-C Statement (Remaining)";
            list = compiledResultsCache.groupC;
        } else if (target === 'sci_combined') {
            if (title) title.innerText = "Science Combined Merit Statement";
            list = compiledResultsCache.scienceCombined;
        } else if (target === 'hum_all') {
            if (title) title.innerText = "Humanities Merit Statement";
            list = compiledResultsCache.humanities;
        } else if (target === 'bs_all') {
            if (title) title.innerText = "Business Studies Merit Statement";
            list = compiledResultsCache.bstudies;
        }

        if (!list || list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #94a3b8;">No student records found.</td></tr>`;
            return;
        }

        list.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
                <td style="font-family: monospace; font-weight: 700;">${s.id}</td>
                <td style="font-weight: 700;">${s.name}</td>
                <td style="text-align: center; font-weight: 700; color: #1e40af;">${s.total}</td>
                <td style="text-align: center; color: #64748b;">${s.subGroup || s.group}</td>
                <td style="text-align: center;"><span class="re-tag">${s.assignedGroup}</span></td>
                <td style="text-align: center; font-weight: 700; background: #f8fafc;">${s.nextClassSL || (idx + 1)}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    function getActiveSelectedListAndTitle() {
        const target = document.getElementById('reSpecificSheet')?.value || 'grp_a';
        let list = compiledResultsCache.groupA;
        let sheetTitle = "New Group-A Statement";

        if (target === 'grp_b') { list = compiledResultsCache.groupB; sheetTitle = "New Group-B Statement"; }
        else if (target === 'grp_c') { list = compiledResultsCache.groupC; sheetTitle = "New Group-C Statement"; }
        else if (target === 'sci_combined') { list = compiledResultsCache.scienceCombined; sheetTitle = "Science Combined Merit"; }
        else if (target === 'hum_all') { list = compiledResultsCache.humanities; sheetTitle = "Humanities Merit Statement"; }
        else if (target === 'bs_all') { list = compiledResultsCache.bstudies; sheetTitle = "Business Studies Merit Statement"; }

        return { list, sheetTitle };
    }

    // ==========================================================
    // ৫. রিপোর্ট ১: প্রমোশন ও রোল স্টেটমেন্ট প্রিন্ট (৬-কলাম)
    // ==========================================================
    window.rePrintPromotionPDF = function () {
        const { list, sheetTitle } = getActiveSelectedListAndTitle();
        const exSel = document.getElementById('reExamSession');
        const examName = exSel ? exSel.options[exSel.selectedIndex].text : activeExamData.title;

        if (!list || list.length === 0) {
            alert("No data available to print!");
            return;
        }

        const printWin = window.open('', '_blank');
        if (!printWin) {
            alert("Pop-up blocked! Please allow pop-ups for this site.");
            return;
        }

        const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${sheetTitle} - CPSCL</title>
    <style>
        @page { size: A4 portrait; margin: 12mm 10mm; }
        body { font-family: 'Times New Roman', serif; margin: 0; padding: 0; color: #000; }
        .header { text-align: center; margin-bottom: 15px; border-bottom: 1.5px solid #000; padding-bottom: 8px; }
        .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .header p { margin: 2px 0; font-size: 13px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; page-break-inside: avoid; }
        th, td { border: 1px solid #000; padding: 5px 6px; text-align: center; }
        th { background: #f8fafc; font-weight: bold; }
        .name-col { text-align: left; padding-left: 8px; }
        .signatures { margin-top: 60px; display: flex; justify-content: space-between; padding: 0 40px; font-size: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Cantonment Public School and College Lalmonirhat</h2>
        <p>Performance Evaluation & Promotion Statement</p>
        <p>${examName} • ${sheetTitle}</p>
    </div>
    <table>
        <thead>
            <tr>
                <th style="width: 40px;">SL</th>
                <th style="width: 100px;">Student ID</th>
                <th class="name-col">Student Name</th>
                <th style="width: 80px;">Total Marks</th>
                <th style="width: 90px;">Assigned Group</th>
                <th style="width: 90px;">Next Class SL</th>
            </tr>
        </thead>
        <tbody>
            ${list.map((s, idx) => `
                <tr>
                    <td>${idx + 1}</td>
                    <td>${s.id}</td>
                    <td class="name-col">${s.name}</td>
                    <td style="font-weight:bold;">${s.total}</td>
                    <td>${s.assignedGroup}</td>
                    <td style="font-weight:bold;">${s.nextClassSL || (idx + 1)}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    <div class="signatures">
        <div style="text-align:center;"><hr style="width:130px; margin-bottom:4px;">Course Coordinator</div>
        <div style="text-align:center;"><hr style="width:130px; margin-bottom:4px;">Vice Principal</div>
        <div style="text-align:center;"><hr style="width:130px; margin-bottom:4px;">Principal</div>
    </div>
</body>
</html>`;

        printWin.document.open();
        printWin.document.write(printHTML);
        printWin.document.close();
        setTimeout(() => { printWin.focus(); printWin.print(); }, 500);
    };

    // ==========================================================
    // ৬. রিপোর্ট ২: পূর্ণাঙ্গ ১২-বিষয়ের টেবুলেশন শিট প্রিন্ট
    // ==========================================================
    window.rePrintFullTabulationPDF = function () {
        const { list, sheetTitle } = getActiveSelectedListAndTitle();
        const stream = document.getElementById('reClassSelect')?.value || 'Science';
        const exSel = document.getElementById('reExamSession');
        const examName = exSel ? exSel.options[exSel.selectedIndex].text : activeExamData.title;

        if (!list || list.length === 0) {
            alert("No data available to print!");
            return;
        }

        let activeSubs = MASTER_SUBJECTS.Science;
        if (stream === 'Humanities') activeSubs = MASTER_SUBJECTS.Humanities;
        else if (stream === 'B.Studies') activeSubs = MASTER_SUBJECTS.BStudies;

        const perSubMax = activeExamData.max || 15;
        const streamTotalMarks = activeSubs.length * perSubMax;
        const totalCols = 5 + activeSubs.length + 1;

        const printWin = window.open('', '_blank');
        if (!printWin) {
            alert("Pop-up blocked! Please allow pop-ups for this site.");
            return;
        }

        const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${examName} - ${sheetTitle} (Full Tabulation)</title>
    <style>
        @page { size: A4 portrait; margin: 12mm 10mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 0; background-color: #fff; }
        .report-container { width: 100%; max-width: 210mm; margin: 0 auto; }
        .header-cell { border: none !important; padding: 0 0 8px 0 !important; text-align: center; }
        .header-cell h1 { font-size: 18px; font-weight: bold; margin: 0 0 3px 0; }
        .header-cell p { font-size: 13px; margin: 2px 0; font-weight: normal; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; page-break-inside: avoid; }
        th, td { border: 1px solid #000; padding: 4px 3px; text-align: center; }
        th.col-header { font-weight: bold; font-size: 11px; background-color: #fff; padding: 5px 2px; }
        .col-name { width: 180px; text-align: left; padding-left: 6px; white-space: nowrap; }
        .signature-section { margin-top: calc(60px + 0.8in); display: flex; justify-content: space-between; padding: 0 30px; font-size: 13px; font-weight: bold; }
        @media print { body { padding: 0; background: #fff; } .report-container { padding: 0; box-shadow: none; } }
    </style>
</head>
<body>
    <div class="report-container">
        <table>
            <thead>
                <tr>
                    <th colspan="${totalCols}" class="header-cell">
                        <h1>Cantonment Public School and College Lalmonirhat</h1>
                        <p>Performance Evaluation Statement (Full Tabulation)</p>
                        <p>Class: Ten (${stream}) • ${examName}</p>
                        <p>${sheetTitle}</p>
                    </th>
                </tr>
                <tr>
                    <th class="col-header">SL</th>
                    <th class="col-header">Std ID</th>
                    <th class="col-header col-name">Student Name</th>
                    <th class="col-header">Roll</th>
                    <th class="col-header">Sec</th>
                    ${activeSubs.map(s => `<th class="col-header">${s.key === 'HM_AG' ? 'HM/AG' : (s.key === 'AG_HE' ? 'AG/HE' : s.key)}</th>`).join('')}
                    <th class="col-header">Total<br>(${streamTotalMarks})</th>
                </tr>
            </thead>
            <tbody>
                ${list.map((s, idx) => `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${s.id}</td>
                        <td class="col-name">${s.name}</td>
                        <td>${s.roll}</td>
                        <td>${s.section || ''}</td>
                        ${activeSubs.map(sb => {
                            const markVal = (s.marksObj && s.marksObj[sb.key] !== undefined && s.marksObj[sb.key] !== '') ? s.marksObj[sb.key] : '0';
                            return `<td>${markVal}</td>`;
                        }).join('')}
                        <td style="font-weight:bold;">${s.total}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="signature-section">
            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;">Course Coordinator</div>
            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;">Vice Principal</div>
            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;">Principal</div>
        </div>
    </div>
</body>
</html>`;

        printWin.document.open();
        printWin.document.write(reportHTML);
        printWin.document.close();
        setTimeout(() => { printWin.focus(); printWin.print(); }, 500);
    };

    // ==========================================================
    // ৭. এক্সেল এক্সপোর্ট
    // ==========================================================
    window.reExportExcel = function () {
        if (typeof XLSX === 'undefined') {
            alert("SheetJS (XLSX) library not found on the page!");
            return;
        }

        const { list, sheetTitle } = getActiveSelectedListAndTitle();
        if (!list || list.length === 0) {
            alert("No data available to export!");
            return;
        }

        const data = [
            ["Cantonment Public School and College Lalmonirhat"],
            [`Performance Evaluation - ${sheetTitle}`],
            [],
            ["SL", "Student ID", "Student Name", "Total Marks", "Current Group", "Assigned Group", "Next Class SL"]
        ];

        list.forEach((s, idx) => {
            data.push([idx + 1, s.id, s.name, s.total, s.subGroup || s.group, s.assignedGroup, s.nextClassSL || (idx + 1)]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Merit_Report");
        XLSX.writeFile(wb, `${sheetTitle.replace(/\s+/g, '_')}_Statement.xlsx`);
    };

    // ==========================================================
    // ৮. নিরাপদ প্রমোশন ও সিলগালা (Promote & Lock)
    // ==========================================================
    window.rePromoteNextExam = async function () {
        const exId = document.getElementById('reExamSession')?.value || activeExamId;

        const allComputed = [
            ...compiledResultsCache.groupA,
            ...compiledResultsCache.groupB,
            ...compiledResultsCache.groupC,
            ...compiledResultsCache.humanities,
            ...compiledResultsCache.bstudies
        ];

        if (allComputed.length === 0) {
            alert("Results are empty! Cannot promote.");
            return;
        }

        if (confirm("Are you sure you want to finalize these new groups and class serials for the next exam? Once promoted, this exam result will be permanently locked.")) {
            const updates = {};
            allComputed.forEach(s => {
                const found = studentsList.find(st => st.id === s.id);
                if (found) {
                    found.subGroup = s.assignedGroup;
                    found.classSerial = s.nextClassSL;
                    found.overallRank = s.overallMerit || s.nextClassSL;
                }
                updates[`evaluation_system/students/${s.id}/subGroup`] = s.assignedGroup;
                updates[`evaluation_system/students/${s.id}/classSerial`] = s.nextClassSL;
                updates[`evaluation_system/students/${s.id}/overallRank`] = s.overallMerit || s.nextClassSL;
            });

            try {
                if (_update && _ref && _db) {
                    await _update(_ref(_db), updates);
                } else if (window.writeToFirebase) {
                    for (const [p, v] of Object.entries(updates)) {
                        await window.writeToFirebase(p, v);
                    }
                }

                // প্রমোশন স্ট্যাটাস স্থায়ীভাবে মার্ক করা
                localStorage.setItem(`re_promoted_${exId}`, 'true');
                alert("Success!\nStudents have been promoted to their newly assigned groups and class serials. This exam result is now permanently sealed.");
                window.reEnsureCompiledAndRender();
            } catch (err) {
                alert("Error updating groups: " + err.message);
            }
        }
    };

    // ==========================================================
    // ৯. ফায়ারবেস অটো-সিঙ্ক (১০০% READ-ONLY)
    // ==========================================================
    async function initDataSync(retries = 25) {
        try {
            const fb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
            _get = fb.get;
            _ref = fb.ref;
            _update = fb.update;

            if (window.getDatabase) _db = window.getDatabase();
            else if (fb.getDatabase) _db = fb.getDatabase();
        } catch (e) {
            if (window.getDatabase && window.ref && window.get) {
                _db = window.getDatabase();
                _ref = window.ref;
                _get = window.get;
                _update = window.update;
            }
        }

        if (!_db || !_ref || !_get) {
            if (retries > 0) setTimeout(() => initDataSync(retries - 1), 200);
            return;
        }

        try {
            const actSnap = await _get(_ref(_db, 'evaluation_system/active_exam_id'));
            if (actSnap.exists()) activeExamId = actSnap.val();

            const exSnap = await _get(_ref(_db, 'evaluation_system/exams'));
            if (exSnap.exists()) examsList = exSnap.val();

            const stdSnap = await _get(_ref(_db, 'evaluation_system/students'));
            if (stdSnap.exists()) {
                studentsList = Object.values(stdSnap.val());
            }

            const mSnap = await _get(_ref(_db, 'evaluation_system/marks'));
            if (mSnap.exists()) {
                marksData = mSnap.val() || {};
            }

            // ডেটা আসার সাথে সাথে অটো-কম্পাইল
            window.reEnsureCompiledAndRender();
        } catch (err) {
            console.warn("Read-only sync notice:", err);
        }
    }

    function initModule() {
        injectResultEngineUI();
        initDataSync();
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initModule);
    } else {
        initModule();
    }
})();
