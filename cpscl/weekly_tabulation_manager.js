/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Weekly Master Tabulation Suite (100% Pure English Corporate)
   Path: cpscl/weekly_tabulation_manager.js
   Architecture: Standalone Modular Engine | A4 Landscape Vector Print | Read-Only
   Features: Multi-Exam Aggregation | Dynamic 100 Conversion | Latest Group Tracking
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Weekly Master Tabulation Suite (Standalone & 100% English)...");

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
            .wm-table th, .wm-table td { border: 1px solid #111 !important; padding: 5px 3px; font-size: 10px; text-align: center; color: #000; line-height: 1.15; }
            
            .wm-table th.th-main { background-color: #f8fafc !important; font-weight: 800; }
            .wm-table th.th-exam-1 { background-color: #e0f2fe !important; color: #0369a1 !important; font-weight: 800; }
            .wm-table th.th-exam-2 { background-color: #fef3c7 !important; color: #b45309 !important; font-weight: 800; }
            .wm-table th.th-exam-3 { background-color: #dcfce7 !important; color: #15803d !important; font-weight: 800; }
            .wm-table th.th-exam-4 { background-color: #f3e8ff !important; color: #7e22ce !important; font-weight: 800; }
            .wm-table th.th-exam-default { background-color: #f1f5f9 !important; color: #334155 !important; font-weight: 800; }

            .wm-table th.th-grand { background-color: #f1f5f9 !important; color: #1e293b !important; font-weight: 800; }
            .wm-table th.th-conv { background-color: #fee2e2 !important; color: #991b1b !important; font-weight: 900; }

            .wm-table th.sub-head { background-color: #f8fafc !important; font-weight: 700; font-size: 9px; }
            .wm-table th.sub-total { background-color: #f1f5f9 !important; font-weight: 800; font-size: 9px; }

            .wm-table td.name-col { text-align: left !important; padding-left: 8px !important; font-weight: 600; white-space: nowrap !important; }
            .wm-table td.test-total { font-weight: 800; background-color: #f8fafc !important; }
            .wm-table td.grand-col { font-weight: 800; background-color: #f8fafc !important; }
            .wm-table td.conv-col { font-weight: 900; background-color: #fef2f2 !important; color: #991b1b; }
            .wm-table td.rank-col { font-weight: 900; background-color: #eff6ff !important; color: #1d4ed8; }

            .wm-sig-container { display: flex; justify-content: space-around; align-items: flex-end; margin-top: 50px; padding: 0 20px 20px; page-break-inside: avoid; }
            .wm-sig-box { text-align: center; min-width: 170px; }
            .wm-sig-space { height: 50px; }
            .wm-sig-line { width: 100%; border-top: 1.5px solid #000; margin-bottom: 5px; }
            .wm-sig-label { font-size: 11px; font-weight: 800; color: #000; }
        `;
        document.head.appendChild(style);
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
                        Check the assessments conducted this week to combine into the master sheet:
                    </div>

                    <div class="wm-exam-checkboxes-grid" id="wmExamsCheckboxContainer">
                        <div style="color: #64748b; font-size: 12px;">Loading registered exams...</div>
                    </div>

                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <button type="button" class="wm-btn-pill wm-btn-primary" onclick="window.generateWeeklyMasterTabulation()">
                            <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Master Tabulation
                        </button>
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
                                <i class="fa-solid fa-print"></i> Print Sheet (A4 Landscape)
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

    // 5. Load Registered Exams for Checkboxes
    let allWeeklyExams = [];

    async function loadWeeklyAvailableExams() {
        const container = document.getElementById('wmExamsCheckboxContainer');
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

        allWeeklyExams = examList;

        if (allWeeklyExams.length === 0) {
            container.innerHTML = '<div style="color:#ef4444; font-weight:700;">No examinations found in database.</div>';
            return;
        }

        // Sort chronologically by date if available
        allWeeklyExams.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

        let html = '';
        allWeeklyExams.forEach((ex, idx) => {
            const isChecked = idx >= Math.max(0, allWeeklyExams.length - 4); // Default select last 4 tests
            html += `
                <label class="wm-checkbox-item">
                    <input type="checkbox" class="wm-exam-chk" value="${ex.id}" ${isChecked ? 'checked' : ''}>
                    <span>${ex.name} <small style="color:#64748b;">(${ex.date || 'No Date'})</small></span>
                </label>
            `;
        });
        container.innerHTML = html;
    }

    // 6. Master Generation Engine (100% Pure Dynamic, Math Verified & Safe)
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

        // Sort selected exams chronologically
        selectedExams.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

        // Update Date Range
        const firstDate = selectedExams[0].date || '';
        const lastDate = selectedExams[selectedExams.length - 1].date || '';
        document.getElementById('wmDisplayDateRange').innerText = `Assessment Period: ${firstDate} to ${lastDate}`;
        document.getElementById('wmDisplayClass').innerText = selectedExams[0].class || 'Eight Scholarship Batch-2026';

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
                }
            } catch(e){}
        }

        const targetClassClean = String(selectedExams[0].class || '').trim().toLowerCase();
        let classStudents = allStudents.filter(s => {
            const cName = String(s.class_name || s.class || '').trim().toLowerCase();
            return cName === targetClassClean || cName.includes(targetClassClean) || targetClassClean.includes(cName);
        });

        if (classStudents.length === 0) {
            alert("No students registered for this class!");
            return;
        }

        // 2. Fetch Group Overrides & Merit Order
        let overrides = {};
        if (window.getDatabase && window.ref && window.get) {
            try {
                const snapO = await window.get(window.ref(window.getDatabase(), 'cpscl_exam_group_overrides'));
                if (snapO.exists()) overrides = snapO.val() || {};
            } catch(e){}
        }

        // Identify the latest exam to read current group
        const latestExam = selectedExams[selectedExams.length - 1];

        // 3. Fetch Marks for All Selected Exams and All Subjects
        // Structure: examMarksStore[examId][subName][studentId]
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

        // 4. Calculate Exam-Wise & Grand Cumulative Scores
        let cumulativeMaxScore = 0; // e.g. 60 + 60 + 60 + 60 = 240

        // Compute active subject columns for each exam (only include subjects that were actually taken)
        const examMetaList = selectedExams.map(ex => {
            const subs = Object.keys(ex.subjects || {});
            // Filter to subjects where at least one student has a mark
            let activeSubs = subs.filter(sub => {
                const sMap = examMarksStore[ex.id][sub] || {};
                return Object.keys(sMap).length > 0;
            });

            if (activeSubs.length === 0) activeSubs = subs;

            // Attempted full mark: each student took e.g. 2 subjects (60)
            const examFullMark = 60; // Standard shift exam full mark
            cumulativeMaxScore += examFullMark;

            return {
                exam: ex,
                activeSubs,
                fullMark: examFullMark
            };
        });

        // 5. Compute Rows for Each Student
        const computedStudents = classStudents.map(st => {
            const sId = String(st.std_id || st.id || '').trim();
            const sName = st.student_name || st.name || 'Unnamed';

            // Determine latest group (from latest selected exam)
            let currentGroup = "Group A";
            if (overrides[latestExam.id] && overrides[latestExam.id][sId]) {
                currentGroup = overrides[latestExam.id][sId];
            }

            let grandTotal = 0;
            const examBreakdown = {};

            examMetaList.forEach(meta => {
                const exId = meta.exam.id;
                let testTotal = 0;
                const subScores = {};

                meta.activeSubs.forEach(sub => {
                    const sMap = examMarksStore[exId][sub] || {};
                    const rec = sMap[sId];
                    let val = null;
                    if (rec) {
                        if (rec.rawMark !== null && rec.rawMark !== undefined && rec.rawMark !== '') {
                            val = parseFloat(rec.rawMark);
                        } else if (rec.cq !== null && rec.cq !== undefined) {
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

            // Convert to 100
            const converted100 = cumulativeMaxScore > 0 ? ((grandTotal / cumulativeMaxScore) * 100) : 0;

            return {
                id: sId,
                name: sName,
                group: currentGroup,
                examBreakdown,
                grandTotal,
                converted100: parseFloat(converted100.toFixed(2))
            };
        });

        // 6. Sort by Final Merit: Highest Converted / Grand Total First
        computedStudents.sort((a, b) => {
            if (b.grandTotal !== a.grandTotal) return b.grandTotal - a.grandTotal;
            return a.id.localeCompare(b.id);
        });

        // 7. Build Two-Tier Table Header
        let tr1 = `<tr>
            <th rowspan="2" class="th-main" style="width: 3.5%;">Serial</th>
            <th rowspan="2" class="th-main" style="width: 7.5%;">Student ID</th>
            <th rowspan="2" class="th-main" style="width: 14%; text-align: left; padding-left: 6px;">Student Name</th>
            <th rowspan="2" class="th-main" style="width: 6.5%;">Group<br><small>(Latest)</small></th>
        `;

        let tr2 = `<tr>`;

        const examColorClasses = ['th-exam-1', 'th-exam-2', 'th-exam-3', 'th-exam-4'];

        examMetaList.forEach((meta, idx) => {
            const colClass = examColorClasses[idx % examColorClasses.length];
            const spanCount = meta.activeSubs.length + 1; // subjects + total
            const exDate = meta.exam.date ? ` (${meta.exam.date.substring(5)})` : '';

            tr1 += `<th colspan="${spanCount}" class="${colClass}">${meta.exam.name.toUpperCase()}${exDate}</th>`;

            meta.activeSubs.forEach(sub => {
                tr2 += `<th class="sub-head">${sub}</th>`;
            });
            tr2 += `<th class="sub-total">Total (${meta.fullMark})</th>`;
        });

        tr1 += `
            <th rowspan="2" class="th-grand" style="width: 5%;">Grand Total<br><small>(${cumulativeMaxScore})</small></th>
            <th rowspan="2" class="th-conv" style="width: 6.5%;">Converted<br><small>(100)</small></th>
            <th rowspan="2" class="th-conv" style="width: 4.5%;">Final<br>Rank</th>
        </tr>`;

        tr2 += `</tr>`;

        thead.innerHTML = tr1 + tr2;

        // 8. Build Table Body
        tbody.innerHTML = '';
        computedStudents.forEach((row, idx) => {
            const tr = document.createElement('tr');
            const groupColor = (row.group === 'Group A') ? '#2563eb' : '#059669';

            let tdHtml = `
                <td><strong>${idx + 1}</strong></td>
                <td><strong>${row.id}</strong></td>
                <td class="name-col">${row.name}</td>
                <td style="font-weight:700; font-size:9px; color:${groupColor};">${row.group}</td>
            `;

            examMetaList.forEach(meta => {
                const exId = meta.exam.id;
                const b = row.examBreakdown[exId];

                meta.activeSubs.forEach(sub => {
                    const sc = b.subScores[sub];
                    tdHtml += `<td>${sc}</td>`;
                });

                tdHtml += `<td class="test-total">${b.testTotal}</td>`;
            });

            tdHtml += `
                <td class="grand-col">${row.grandTotal}</td>
                <td class="conv-col">${row.converted100.toFixed(2)}</td>
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

    // 7. Isolated Vector Print Engine (A4 Landscape Print-Ready)
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
        iframe.style.width = '297mm'; // A4 Landscape
        iframe.style.height = '210mm';
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
                        size: A4 landscape;
                        margin: 6mm 6mm 8mm 6mm;
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
                        padding: 3.5px 2px !important;
                        font-size: 9px !important;
                        text-align: center;
                        color: #000;
                        line-height: 1.15;
                    }
                    th.th-main { background-color: #f8fafc !important; font-weight: bold; }
                    th.th-exam-1 { background-color: #e0f2fe !important; color: #0369a1 !important; font-weight: bold; }
                    th.th-exam-2 { background-color: #fef3c7 !important; color: #b45309 !important; font-weight: bold; }
                    th.th-exam-3 { background-color: #dcfce7 !important; color: #15803d !important; font-weight: bold; }
                    th.th-exam-4 { background-color: #f3e8ff !important; color: #7e22ce !important; font-weight: bold; }
                    th.th-grand { background-color: #f1f5f9 !important; font-weight: bold; }
                    th.th-conv { background-color: #fee2e2 !important; color: #991b1b !important; font-weight: bold; }

                    th.sub-head { background-color: #f8fafc !important; font-size: 8px; font-weight: bold; }
                    th.sub-total { background-color: #f1f5f9 !important; font-size: 8px; font-weight: bold; }

                    td.name-col {
                        text-align: left !important;
                        padding-left: 6px !important;
                        font-weight: bold;
                        white-space: nowrap !important;
                    }
                    td.test-total { font-weight: bold; background-color: #f8fafc !important; }
                    td.grand-col { font-weight: bold; background-color: #f8fafc !important; }
                    td.conv-col { font-weight: bold; background-color: #fef2f2 !important; color: #991b1b; }
                    td.rank-col { font-weight: bold; background-color: #eff6ff !important; color: #1d4ed8; }

                    tr { page-break-inside: avoid !important; }

                    .wm-sig-container {
                        display: flex;
                        justify-content: space-around;
                        align-items: flex-end;
                        margin-top: 45px;
                        padding: 0 20px 5px;
                        page-break-inside: avoid !important;
                    }
                    .wm-sig-box { text-align: center; min-width: 170px; }
                    .wm-sig-space { height: 50px; }
                    .wm-sig-line { width: 100%; border-top: 1.5px solid #000; margin-bottom: 4px; }
                    .wm-sig-label { font-size: 10.5px; font-weight: bold; color: #000; }
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

    // 8. Excel Export
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

    // 9. Initialize
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
