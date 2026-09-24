/**
 * CPSCL Academic Evaluation - Independent Result & Promotion Engine
 * File: cpscl_result_engine.js
 * Safety: 100% Non-destructive Read-Only Mark Processing
 * UI: Square outer frames, compact rounded pills, Tiro Bangla font, all-English UI
 */

(function () {
    // 1. STYLESHEET INJECTION (SQUARE OUTER FRAMES + ROUNDED INNER ELEMENTS)
    const engineStyle = document.createElement('style');
    engineStyle.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

        #result-engine-view, #result-engine-view * {
            font-family: 'Tiro Bangla', serif !important;
            box-sizing: border-box;
        }

        /* Square Outer Container */
        .re-square-card {
            background: #ffffff;
            border: 1.5px solid #cbd5e1;
            border-radius: 0px !important;
            padding: 16px 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }

        .re-header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 14px;
        }

        .re-card-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #0f172a;
        }

        /* 2-Row x 2-Column Spacious Grid */
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

        /* Rounded Compact Inputs */
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
        .re-select:focus {
            border-color: #0f172a;
        }

        /* Refined, Elegant Pill Buttons */
        .re-toolbar {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            border-top: 1px solid #f1f5f9;
            padding-top: 10px;
        }

        .re-btn-pill {
            height: 34px;
            padding: 0 18px;
            border-radius: 18px;
            font-size: 0.80rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
            border: none;
        }
        .re-btn-pill:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .re-btn-dark {
            background: #0f172a;
            color: #ffffff;
        }
        .re-btn-dark:hover { background: #1e293b; }

        .re-btn-navy {
            background: #1e3a8a;
            color: #ffffff;
        }
        .re-btn-navy:hover { background: #172554; }

        .re-btn-neutral {
            background: #ffffff;
            color: #334155;
            border: 1.5px solid #cbd5e1;
        }
        .re-btn-neutral:hover {
            background: #f1f5f9;
            color: #0f172a;
            border-color: #94a3b8;
        }

        .re-btn-slate {
            background: #334155;
            color: #ffffff;
        }
        .re-btn-slate:hover { background: #1e293b; }

        /* Square Table Frame */
        .re-table-box {
            border: 1px solid #cbd5e1;
            border-radius: 0px !important;
            overflow-x: auto;
        }

        .re-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.85rem;
            background: #ffffff;
        }
        .re-table th {
            background: #f8fafc;
            padding: 9px 12px;
            text-align: left;
            font-size: 0.72rem;
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
        .re-table tr:hover {
            background: #f8fafc;
        }

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
    `;
    document.head.appendChild(engineStyle);

    // MASTER SUBJECT DEFINITIONS
    const MASTER_SUBJECTS = {
        Science: ['B1', 'B2', 'E1', 'E2', 'Math', 'HM_AG', 'Phy', 'Che', 'Bio', 'BGS', 'Reli', 'ICT'],
        Humanities: ['B1', 'B2', 'E1', 'E2', 'Math', 'AG_HE', 'His', 'Geo', 'Civ', 'Sci', 'Reli', 'ICT'],
        BStudies: ['B1', 'B2', 'E1', 'E2', 'Math', 'AG_HE', 'Fin', 'Acc', 'BE', 'Sci', 'Reli', 'ICT']
    };

    // INTERNAL DATA STATE
    let _db = null;
    let _ref = null;
    let _get = null;
    let _update = null;

    let studentsList = [];
    let examsList = {};
    let activeExamId = "exam_fn02_2026";
    let activeExamData = { title: "Fortnightly Test 02", max: 15 };
    let marksData = {};
    let compiledResultsCache = {
        scienceCombined: [],
        groupA: [],
        groupB: [],
        groupC: [],
        humanities: [],
        bstudies: []
    };

    // 2. INJECT NEW SUBMENU & VIEW PANEL
    function injectResultEngineUI() {
        // Try finding the Exam Evaluation parent submenu
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
                <div class="content-area" style="padding: 10px 0; max-width: 1100px; margin: 0 auto;">

                    <!-- Step 1: Compilation Action Bar -->
                    <div class="re-square-card" style="padding: 12px 18px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                            <div>
                                <span style="font-size: 0.90rem; font-weight: 700; color: #0f172a;">1. Process & Compile Marks</span>
                                <div style="font-size: 0.75rem; color: #64748b;">Read live teacher marks, calculate totals, and establish merit rankings.</div>
                            </div>
                            <button class="re-btn-pill re-btn-dark" onclick="window.reCompileResults()">Generate Results</button>
                        </div>
                    </div>

                    <!-- Step 2: 2-Line Spacious Criteria Box -->
                    <div class="re-square-card">
                        <div class="re-header-bar">
                            <div class="re-card-title">2. Select & Export Statements</div>
                            <span id="reStatusBadge" style="font-size: 0.75rem; font-weight: 700; color: #475569;">Status: Ready for Selection</span>
                        </div>

                        <div class="re-grid-2x2">
                            <!-- Row 1 -->
                            <div class="re-input-group">
                                <label>Exam Session</label>
                                <select class="re-select" id="reExamSession" onchange="window.reOnExamChanged()">
                                    <!-- Populated dynamically -->
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
                                    <!-- Populated dynamically -->
                                </select>
                            </div>
                        </div>

                        <div class="re-toolbar">
                            <button class="re-btn-pill re-btn-navy" onclick="window.rePrintPDF()">Print PDF</button>
                            <button class="re-btn-pill re-btn-neutral" onclick="window.reExportExcel()">Export Excel</button>
                        </div>
                    </div>

                    <!-- Step 3: Table and Promotion Setup -->
                    <div class="re-square-card">
                        <div class="re-header-bar">
                            <span class="re-card-title" id="reTableTitle">Statement Preview</span>
                            <button class="re-btn-pill re-btn-slate" onclick="window.rePromoteNextExam()">
                                Promote & Lock for Next Exam
                            </button>
                        </div>

                        <div class="re-table-box">
                            <table class="re-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px; text-align: center;">SL</th>
                                        <th style="width: 130px;">Student ID</th>
                                        <th>Student Name</th>
                                        <th style="width: 100px; text-align: center;">Total</th>
                                        <th style="width: 110px; text-align: center;">Current Group</th>
                                        <th style="width: 120px; text-align: center;">Assigned Group</th>
                                        <th style="width: 120px; text-align: center; background: #f8fafc;">Next Class SL</th>
                                    </tr>
                                </thead>
                                <tbody id="reResultTbody">
                                    <tr><td colspan="7" style="text-align: center; padding: 24px; color: #94a3b8;">Click "Generate Results" to compile statement.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            `;
            mainWrapper.appendChild(viewDiv);
        }
    }

    // 3. NAVIGATION SWITCHER
    window.switchResultEngineView = function () {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('result-engine-view');
        if (panel) panel.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "Result & Promotion Hub";

        // Highlight submenu
        document.querySelectorAll('.submenu-item').forEach(i => i.classList.remove('active'));
        const activeSub = document.getElementById('sub-result-engine');
        if (activeSub) activeSub.classList.add('active');

        window.reInitDropdowns();
    };

    // 4. DATA ENGINE (NON-DESTRUCTIVE READ)
    window.reInitDropdowns = async function () {
        const exSel = document.getElementById('reExamSession');
        if (!exSel) return;
        exSel.innerHTML = '';

        if (Object.keys(examsList).length > 0) {
            Object.keys(examsList).forEach(id => {
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
        const stream = document.getElementById('reClassSelect').value;
        const cat = document.getElementById('reReportCategory').value;
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

        window.reRenderActiveTable();
    };

    window.reCompileResults = function () {
        const exId = document.getElementById('reExamSession').value || activeExamId;
        const currentExamMarks = marksData[exId] || {};

        // 1. Process Science
        const sciStudents = studentsList.filter(s => s.group === 'Science');
        const sciSubs = MASTER_SUBJECTS.Science;

        let computedSci = sciStudents.map(s => {
            const m = currentExamMarks[s.id] || {};
            let total = 0;
            sciSubs.forEach(sb => {
                const v = parseFloat(m[sb]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, marksObj: m };
        });

        // Combined Science Merit Sort (Highest marks first)
        computedSci.sort((a, b) => b.total - a.total);

        // Tie-friendly boundary cutoffs
        let cutoffA = null;
        let cutoffB = null;

        computedSci.forEach((s, idx) => {
            s.overallMerit = idx + 1;
            if (idx === 54) cutoffA = s.total;  // 55th student score
            if (idx === 104) cutoffB = s.total; // 105th student score
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

        // Assign Next Class SL (1, 2, 3... within each assigned group)
        grpAList.forEach((s, idx) => s.nextClassSL = idx + 1);
        grpBList.forEach((s, idx) => s.nextClassSL = idx + 1);
        grpCList.forEach((s, idx) => s.nextClassSL = idx + 1);

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
                const v = parseFloat(m[sb]);
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
                const v = parseFloat(m[sb]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, assignedGroup: 'B.Studies', marksObj: m };
        });
        computedBs.sort((a, b) => b.total - a.total);
        computedBs.forEach((s, idx) => { s.overallMerit = idx + 1; s.nextClassSL = idx + 1; });
        compiledResultsCache.bstudies = computedBs;

        // Update badge and table
        const badge = document.getElementById('reStatusBadge');
        if (badge) {
            badge.innerText = "● Compiled & Active";
            badge.style.color = "#15803d";
        }

        window.reRenderActiveTable();
        alert("Results compiled successfully!\nTotal scores calculated and merit rankings established without modifying teacher entries.");
    };

    window.reRenderActiveTable = function () {
        const target = document.getElementById('reSpecificSheet') ? document.getElementById('reSpecificSheet').value : 'grp_a';
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
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: #94a3b8;">No calculated data found. Click "Generate Results".</td></tr>`;
            return;
        }

        list.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
                <td style="font-family: monospace; font-weight: 700;">${s.id}</td>
                <td style="font-weight: 700;">${s.name}</td>
                <td style="text-align: center; font-weight: 700;">${s.total}</td>
                <td style="text-align: center; color: #64748b;">${s.subGroup || s.group}</td>
                <td style="text-align: center;"><span class="re-tag">${s.assignedGroup}</span></td>
                <td style="text-align: center; font-weight: 700; background: #f8fafc;">${s.nextClassSL || (idx + 1)}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // 5. PRINT & EXCEL REPORTING
    window.rePrintPDF = function () {
        const target = document.getElementById('reSpecificSheet') ? document.getElementById('reSpecificSheet').value : 'grp_a';
        let list = compiledResultsCache.groupA;
        let sheetTitle = "New Group-A Statement";

        if (target === 'grp_b') { list = compiledResultsCache.groupB; sheetTitle = "New Group-B Statement"; }
        else if (target === 'grp_c') { list = compiledResultsCache.groupC; sheetTitle = "New Group-C Statement"; }
        else if (target === 'sci_combined') { list = compiledResultsCache.scienceCombined; sheetTitle = "Science Combined Merit"; }
        else if (target === 'hum_all') { list = compiledResultsCache.humanities; sheetTitle = "Humanities Merit Statement"; }
        else if (target === 'bs_all') { list = compiledResultsCache.bstudies; sheetTitle = "Business Studies Merit Statement"; }

        if (!list || list.length === 0) {
            alert("Please click 'Generate Results' first!");
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
        th, td { border: 1px solid #000; padding: 5px 6px; text-align: center; }
        th { background: #f8fafc; font-weight: bold; }
        .name-col { text-align: left; padding-left: 8px; }
        .signatures { margin-top: 60px; display: flex; justify-content: space-between; padding: 0 40px; font-size: 12px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h2>Cantonment Public School and College Lalmonirhat</h2>
        <p>Performance Evaluation & Merit Statement</p>
        <p>${sheetTitle}</p>
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
                    <td>${s.total}</td>
                    <td>${s.assignedGroup}</td>
                    <td>${s.nextClassSL || (idx + 1)}</td>
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

    window.reExportExcel = function () {
        if (typeof XLSX === 'undefined') {
            alert("SheetJS (XLSX) library not found on the page!");
            return;
        }

        const target = document.getElementById('reSpecificSheet') ? document.getElementById('reSpecificSheet').value : 'grp_a';
        let list = compiledResultsCache.groupA;
        let sheetTitle = "New_Group_A";

        if (target === 'grp_b') { list = compiledResultsCache.groupB; sheetTitle = "New_Group_B"; }
        else if (target === 'grp_c') { list = compiledResultsCache.groupC; sheetTitle = "New_Group_C"; }
        else if (target === 'sci_combined') { list = compiledResultsCache.scienceCombined; sheetTitle = "Science_Combined_Merit"; }
        else if (target === 'hum_all') { list = compiledResultsCache.humanities; sheetTitle = "Humanities_Merit"; }
        else if (target === 'bs_all') { list = compiledResultsCache.bstudies; sheetTitle = "Business_Studies_Merit"; }

        if (!list || list.length === 0) {
            alert("Please click 'Generate Results' first!");
            return;
        }

        const data = [
            ["Cantonment Public School and College Lalmonirhat"],
            [`Performance Evaluation - ${sheetTitle.replace(/_/g, ' ')}`],
            [],
            ["SL", "Student ID", "Student Name", "Total Marks", "Current Group", "Assigned Group", "Next Class SL"]
        ];

        list.forEach((s, idx) => {
            data.push([idx + 1, s.id, s.name, s.total, s.subGroup || s.group, s.assignedGroup, s.nextClassSL || (idx + 1)]);
        });

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Merit_Report");
        XLSX.writeFile(wb, `${sheetTitle}_Statement.xlsx`);
    };

    // 6. SAFE PROMOTION FOR NEXT EXAM (UPDATES ONLY STUDENT ROSTER, NEVER TOUCHES MARKS)
    window.rePromoteNextExam = async function () {
        const allComputed = [
            ...compiledResultsCache.groupA,
            ...compiledResultsCache.groupB,
            ...compiledResultsCache.groupC,
            ...compiledResultsCache.humanities,
            ...compiledResultsCache.bstudies
        ];

        if (allComputed.length === 0) {
            alert("Please compile results before promoting!");
            return;
        }

        if (confirm("Are you sure you want to finalize these new groups and class serials for the next exam?")) {
            const updates = {};
            allComputed.forEach(s => {
                const found = studentsList.find(st => st.id === s.id);
                if (found) {
                    found.subGroup = s.assignedGroup;
                    found.classSerial = s.nextClassSL;
                    found.overallRank = s.overallMerit || s.nextClassSL;
                }
                // Updates student profile safely (Marks tree is 100% untouched!)
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
                alert("Success!\nStudents have been promoted to their newly assigned groups and class serials (1, 2, 3...). Teachers' future blank sheets and tabulation will automatically start with these new class rosters.");
            } catch (err) {
                alert("Error updating groups: " + err.message);
            }
        }
    };

    // 7. SYNC DATA FROM FIREBASE (READ-ONLY)
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
            // Read active exam ID
            const actSnap = await _get(_ref(_db, 'evaluation_system/active_exam_id'));
            if (actSnap.exists()) activeExamId = actSnap.val();

            // Read exams list
            const exSnap = await _get(_ref(_db, 'evaluation_system/exams'));
            if (exSnap.exists()) examsList = exSnap.val();

            // Read students list
            const stdSnap = await _get(_ref(_db, 'evaluation_system/students'));
            if (stdSnap.exists()) {
                studentsList = Object.values(stdSnap.val());
            }

            // Read marks list (ReadOnly copy)
            const mSnap = await _get(_ref(_db, 'evaluation_system/marks'));
            if (mSnap.exists()) {
                marksData = mSnap.val() || {};
            }
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
