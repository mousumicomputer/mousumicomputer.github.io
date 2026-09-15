/**
 * CPSCL Academic Evaluation Module - Bulletproof Multi-Department Manager
 * File: cpscl_evaluation.js
 * Explicit Department Routing & Zero Data Contamination
 */

(function () {
    const SUBJECTS_CONFIG = {
        Science: [
            { key: 'B1', name: 'B1' }, { key: 'B2', name: 'B2' },
            { key: 'E1', name: 'E1' }, { key: 'E2', name: 'E2' },
            { key: 'Math', name: 'Math' }, { key: 'HM_AG', name: 'HM/AG' },
            { key: 'Phy', name: 'Phy' }, { key: 'Che', name: 'Che' },
            { key: 'Bio', name: 'Bio' }, { key: 'BGS', name: 'BGS' },
            { key: 'Reli', name: 'Reli' }, { key: 'ICT', name: 'ICT' }
        ],
        Humanities: [
            { key: 'B1', name: 'B1' }, { key: 'B2', name: 'B2' },
            { key: 'E1', name: 'E1' }, { key: 'E2', name: 'E2' },
            { key: 'Math', name: 'Math' }, { key: 'AG_HE', name: 'AG/HE' },
            { key: 'His', name: 'His' }, { key: 'Geo', name: 'Geo' },
            { key: 'Civ', name: 'Civ' }, { key: 'Sci', name: 'Sci' },
            { key: 'Reli', name: 'Reli' }, { key: 'ICT', name: 'ICT' }
        ],
        BStudies: [
            { key: 'B1', name: 'B1' }, { key: 'B2', name: 'B2' },
            { key: 'E1', name: 'E1' }, { key: 'E2', name: 'E2' },
            { key: 'Math', name: 'Math' }, { key: 'AG_HE', name: 'AG/HE' },
            { key: 'Fin', name: 'Fin' }, { key: 'Acc', name: 'Acc' },
            { key: 'Sci', name: 'Sci' }, { key: 'Reli', name: 'Reli' }
        ]
    };

    let studentsList = [];
    let examMarks = {};
    let subjectPins = {};
    let currentExam = { id: "exam_fn02_2026", title: "Fortnightly Test-02", date: "15 Sep 2026", max: 15 };

    function injectExamModule() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList) return;

        const oldMenu = document.getElementById('menu-exam-eval-parent');
        if (oldMenu) oldMenu.remove();

        const evalLi = document.createElement('li');
        evalLi.className = 'menu-item';
        evalLi.id = 'menu-exam-eval-parent';
        evalLi.innerHTML = `
            <a onclick="window.toggleExamMenu(event)">
                <span class="menu-link-inner"><i class="fa-solid fa-file-signature"></i> <span>Exam Evaluation</span></span>
                <i class="fa-solid fa-chevron-down chevron-icon" id="exam-chevron-icon"></i>
            </a>
            <ul class="submenu-list" id="exam-submenu-list" style="display: none;">
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-student-sec')"><i class="fa-solid fa-angle-right"></i> <span>Student Database</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-config-sec')"><i class="fa-solid fa-angle-right"></i> <span>Exam & PIN Setup</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-tab-sec')"><i class="fa-solid fa-angle-right"></i> <span>Tabulation & Merit</span></a></li>
            </ul>
        `;
        menuList.appendChild(evalLi);

        const mainWrapper = document.querySelector('.main-wrapper');
        if (mainWrapper && !document.getElementById('exam-eval-view')) {
            const viewDiv = document.createElement('div');
            viewDiv.className = 'view-panel';
            viewDiv.id = 'exam-eval-view';
            viewDiv.innerHTML = `
                <!-- SUB-SECTION 1: STUDENT DATABASE -->
                <div id="eval-student-sec" class="eval-sub-sec">
                    <div class="erp-form-card" style="max-width: 100%; padding: 14px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; gap: 8px; align-items: center;">
                                <label style="font-size:0.75rem; font-weight:700; color:#64748b;">View:</label>
                                <select id="evalFilterGroup" class="dcr-filter-input" onchange="window.renderEvalStudents()">
                                    <option value="All">All Students (Total Database)</option>
                                    <option value="Science">Science (All Combined: 146)</option>
                                    <option value="Group-A">Science (Group-A: 56)</option>
                                    <option value="Group-B">Science (Group-B: 50)</option>
                                    <option value="Group-C">Science (Group-C: 40)</option>
                                    <option value="Humanities">Humanities (22)</option>
                                    <option value="B.Studies">Business Studies (5)</option>
                                </select>
                                <input type="text" id="evalSearchInp" class="dcr-filter-input" placeholder="Search ID, Name, Roll..." oninput="window.renderEvalStudents()" style="width: 200px;">
                            </div>
                            
                            <!-- নিখুঁত ও নিরাপদ আপলোড বার -->
                            <div style="display: flex; gap: 8px; align-items: center; background: #f8fafc; padding: 6px 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                                <label style="font-size:0.75rem; font-weight:800; color:#0f172a;">Upload For:</label>
                                <select id="evalUploadTargetGroup" class="dcr-filter-input" style="font-weight:700; border-color:#4f46e5;">
                                    <option value="Science">Science (3 Sheets: A, B, C)</option>
                                    <option value="Humanities">Humanities (মানবিক)</option>
                                    <option value="B.Studies">Business Studies (ব্যবসায় শিক্ষা)</option>
                                </select>
                                <button class="dcr-btn-filter" style="background: #10b981;" onclick="document.getElementById('evalExcelFile').click()">
                                    <i class="fa-solid fa-file-excel"></i> Select & Upload
                                </button>
                                <input type="file" id="evalExcelFile" accept=".xlsx, .xls, .csv" style="display: none;" onchange="window.importUniversalExcel(this)">
                            </div>
                        </div>
                    </div>

                    <div class="table-container" style="background:#fff;">
                        <table>
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="width: 70px; text-align:center;">SL (ক্রমিক)</th>
                                    <th style="width: 100px; text-align:center;">Student ID</th>
                                    <th style="text-align: left; padding-left: 15px;">Student Name</th>
                                    <th style="width: 70px; text-align:center;">Roll</th>
                                    <th style="width: 70px; text-align:center;">Sec</th>
                                    <th style="text-align:center;">Group</th>
                                    <th style="text-align:center;">Position</th>
                                </tr>
                            </thead>
                            <tbody id="evalStudentTbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- SUB-SECTION 2: EXAM & PIN SETUP -->
                <div id="eval-config-sec" class="eval-sub-sec" style="display: none;">
                    <div class="erp-form-card" style="max-width: 100%; padding: 16px; margin-bottom: 16px;">
                        <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 180px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Exam Name</label>
                                <input type="text" id="evalExTitle" value="${currentExam.title}" class="dcr-filter-input" style="width: 100%;">
                            </div>
                            <div style="width: 140px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Exam Date</label>
                                <input type="text" id="evalExDate" value="${currentExam.date}" class="dcr-filter-input" style="width: 100%;">
                            </div>
                            <button class="dcr-btn-filter" onclick="window.saveEvalExamSettings()"><i class="fa-solid fa-save"></i> Save</button>
                            <button class="dcr-btn-filter" style="background: #0ea5e9;" onclick="window.copyEvalTeacherLink()"><i class="fa-solid fa-link"></i> Copy Teacher Link</button>
                        </div>
                    </div>
                    <div class="table-container" style="background:#fff;">
                        <table>
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="text-align: left; padding-left: 15px;">Subject Name</th>
                                    <th>Status</th>
                                    <th>Teacher Secret PIN</th>
                                    <th style="text-align: center; width: 100px;">Control</th>
                                </tr>
                            </thead>
                            <tbody id="evalPinTbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- SUB-SECTION 3: TABULATION & MERIT -->
                <div id="eval-tab-sec" class="eval-sub-sec" style="display: none;">
                    <div class="erp-form-card no-print" style="max-width: 100%; padding: 14px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">View Group Sheet:</label>
                                <select id="evalTabGroup" class="dcr-filter-input" onchange="window.renderEvalTabulation()">
                                    <option value="Science_Merit">Science (Combined Merit - 146 Students)</option>
                                    <option value="Group-A">Science (Group-A: 56)</option>
                                    <option value="Group-B">Science (Group-B: 50)</option>
                                    <option value="Group-C">Science (Group-C: 40)</option>
                                    <option value="Humanities">Humanities (মানবিক - ২২ জন)</option>
                                    <option value="B.Studies">Business Studies (ব্যবসায় শিক্ষা - ৫ জন)</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dcr-btn-filter" onclick="window.renderEvalTabulation()"><i class="fa-solid fa-rotate"></i> Refresh</button>
                                <button class="dcr-btn-filter" style="background: #10b981;" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Result PDF</button>
                            </div>
                        </div>
                    </div>

                    <div class="erp-form-card" style="max-width: 100%; padding: 25px; background: #fff; border: 1px solid #000;">
                        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">
                            <h2 style="font-size: 1.3rem; font-weight: 800; text-transform: uppercase; margin: 0;">Cantonment Public School and College Lalmonirhat</h2>
                            <h4 style="font-size: 0.95rem; font-weight: 700; margin: 3px 0;">Performance Evaluation</h4>
                            <p id="evalPrintMeta" style="font-size: 0.85rem; font-weight: 600; color: #475569; margin: 0;">Class: Ten • Total: 180 Marks</p>
                        </div>
                        <div class="table-container" style="border: 1px solid #000; overflow-x: auto;">
                            <table id="evalTabTable">
                                <thead id="evalTabThead"></thead>
                                <tbody id="evalTabTbody"></tbody>
                            </table>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-top: 50px; padding: 0 40px;">
                            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;"><strong>Course Coordinator</strong></div>
                            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;"><strong>Vice Principal</strong></div>
                            <div style="text-align: center;"><hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;"><strong>Principal</strong></div>
                        </div>
                    </div>
                </div>
            `;
            mainWrapper.appendChild(viewDiv);
        }
    }

    window.toggleExamMenu = function (e) {
        if (e) e.preventDefault();
        const sub = document.getElementById('exam-submenu-list');
        const chevron = document.getElementById('exam-chevron-icon');
        if (!sub) return;
        if (sub.style.display === 'flex') {
            sub.style.display = 'none';
            if (chevron) chevron.style.transform = 'rotate(0deg)';
        } else {
            sub.style.display = 'flex';
            sub.style.flexDirection = 'column';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
        }
    };

    window.switchExamSubSection = function (secId) {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const pnl = document.getElementById('exam-eval-view');
        if (pnl) pnl.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "Exam Evaluation & Tabulation";

        document.querySelectorAll('.eval-sub-sec').forEach(s => s.style.display = 'none');
        const target = document.getElementById(secId);
        if (target) target.style.display = 'block';

        if (secId === 'eval-student-sec') window.renderEvalStudents();
        if (secId === 'eval-config-sec') window.renderEvalPins();
        if (secId === 'eval-tab-sec') window.renderEvalTabulation();
    };

    // ==========================================================
    // ২. ১০০% নিরাপদ বিভাগভিত্তিক আপলোডার (কখনোই ডেটা ওভাররাইট হবে না)
    // ==========================================================
    window.importUniversalExcel = function (input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();

        const targetGroup = document.getElementById('evalUploadTargetGroup').value;

        reader.onload = async function (e) {
            try {
                if (typeof XLSX === 'undefined') {
                    alert("SheetJS library not loaded!");
                    return;
                }

                if (window.showLoader) window.showLoader(`Importing ${targetGroup} records...`);

                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                
                let newBatch = {};
                let count = 0;

                // ১. যদি বিজ্ঞান (Science) নির্বাচন করা হয়:
                if (targetGroup === 'Science') {
                    for (let sheetName of wb.SheetNames) {
                        const sheet = wb.Sheets[sheetName];
                        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                        let groupTag = "Group-A";
                        let baseRank = 0;
                        let sName = sheetName.trim().toUpperCase();

                        if (sName === 'B' || sName.includes('GROUP-B')) { groupTag = "Group-B"; baseRank = 56; }
                        else if (sName === 'C' || sName.includes('GROUP-C')) { groupTag = "Group-C"; baseRank = 106; }
                        else { groupTag = "Group-A"; baseRank = 0; }

                        let autoSl = 1;
                        for (let r of rows) {
                            if (!r || r.length < 4) continue;
                            let rText = r.join(' ').toUpperCase();
                            if (rText.includes('GROUP-B')) { groupTag = "Group-B"; baseRank = 56; }
                            else if (rText.includes('GROUP-C')) { groupTag = "Group-C"; baseRank = 106; }

                            let stdId = null, idIdx = -1;
                            for (let i = 0; i < r.length; i++) {
                                let val = String(r[i] || '').trim();
                                if (/^\d{6}$/.test(val)) { stdId = val; idIdx = i; break; }
                            }

                            if (stdId && idIdx !== -1) {
                                let sl = parseInt(r[idIdx - 1]) || autoSl;
                                let name = String(r[idIdx + 1] || 'Student').trim();
                                let roll = parseInt(r[idIdx + 2]) || 1;
                                let sec = String(r[idIdx + 3] || 'SA').trim().toUpperCase();
                                if (!['SA', 'DH', 'SHO'].includes(sec)) sec = "SA";

                                newBatch[stdId] = {
                                    sl: sl,
                                    id: stdId,
                                    name: name,
                                    roll: roll,
                                    section: sec,
                                    group: "Science",
                                    subGroup: groupTag,
                                    overallRank: baseRank + sl
                                };
                                count++;
                                autoSl++;
                            }
                        }
                    }
                } 
                // ২. যদি মানবিক (Humanities) নির্বাচন করা হয়:
                else if (targetGroup === 'Humanities') {
                    const sheet = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    let autoSl = 1;

                    for (let r of rows) {
                        if (!r || r.length < 4) continue;
                        let stdId = null, idIdx = -1;
                        for (let i = 0; i < r.length; i++) {
                            let val = String(r[i] || '').trim();
                            if (/^\d{6}$/.test(val)) { stdId = val; idIdx = i; break; }
                        }

                        if (stdId && idIdx !== -1) {
                            let sl = parseInt(r[idIdx - 1]) || autoSl;
                            let name = String(r[idIdx + 1] || 'Student').trim();
                            let roll = parseInt(r[idIdx + 2]) || 1;

                            newBatch[stdId] = {
                                sl: sl,
                                id: stdId,
                                name: name,
                                roll: roll,
                                section: "HUM",
                                group: "Humanities",
                                subGroup: "Humanities",
                                overallRank: sl
                            };
                            count++;
                            autoSl++;
                        }
                    }
                }
                // ৩. যদি ব্যবসায় শিক্ষা (B.Studies) নির্বাচন করা হয়:
                else if (targetGroup === 'B.Studies') {
                    const sheet = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    let autoSl = 1;

                    for (let r of rows) {
                        if (!r || r.length < 4) continue;
                        let stdId = null, idIdx = -1;
                        for (let i = 0; i < r.length; i++) {
                            let val = String(r[i] || '').trim();
                            if (/^\d{6}$/.test(val)) { stdId = val; idIdx = i; break; }
                        }

                        if (stdId && idIdx !== -1) {
                            let sl = parseInt(r[idIdx - 1]) || autoSl;
                            let name = String(r[idIdx + 1] || 'Student').trim();
                            let roll = parseInt(r[idIdx + 2]) || 1;

                            newBatch[stdId] = {
                                sl: sl,
                                id: stdId,
                                name: name,
                                roll: roll,
                                section: "BS",
                                group: "B.Studies",
                                subGroup: "B.Studies",
                                overallRank: sl
                            };
                            count++;
                            autoSl++;
                        }
                    }
                }

                if (count > 0) {
                    // ★★★ পারফেক্ট মার্জ সিস্টেম: অন্য গ্রুপের কাউকে স্পর্শ করবে না ★★★
                    const finalMerged = {};
                    
                    // ১. বর্তমান ডেটাবেজের অন্যান্য গ্রুপের ছাত্রদের অক্ষত রাখা
                    studentsList.forEach(s => {
                        if (s.group !== targetGroup) {
                            finalMerged[s.id] = s;
                        }
                    });

                    // ২. নতুন আপলোড করা গ্রুপের ছাত্রদের যোগ করা
                    Object.keys(newBatch).forEach(id => {
                        finalMerged[id] = newBatch[id];
                    });

                    // ৩. ফায়ারবেসে পার্মানেন্ট সেভ
                    if (window.writeToFirebase) {
                        await window.writeToFirebase('evaluation_system/students', finalMerged);
                    }

                    studentsList = Object.values(finalMerged);
                    window.renderEvalStudents();

                    if (window.hideLoader) window.hideLoader();
                    alert(`🎉 সফল! ${targetGroup} বিভাগের ${count} জন শিক্ষার্থীর তালিকা ও আসল ক্রমিক ফায়ারবেসে সুরক্ষিতভাবে সেভ হয়েছে!`);
                } else {
                    if (window.hideLoader) window.hideLoader();
                    alert("ফাইলে ৬ সংখ্যার কোনো স্টুডেন্ট আইডি পাওয়া যায়নি!");
                }

                input.value = '';

            } catch (err) {
                if (window.hideLoader) window.hideLoader();
                alert("Error: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // ==========================================================
    // ৩. এক্সেলের আসল ক্রমিক (SL) অনুযায়ী টেবিল দেখানো
    // ==========================================================
    window.renderEvalStudents = function () {
        const tbody = document.getElementById('evalStudentTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const grpEl = document.getElementById('evalFilterGroup');
        const grp = grpEl ? grpEl.value : 'All';
        const qEl = document.getElementById('evalSearchInp');
        const q = (qEl ? qEl.value : '').toLowerCase().trim();

        let list = studentsList.filter(s => {
            let mGrp = true;
            if (grp === 'Humanities') mGrp = s.group === 'Humanities';
            else if (grp === 'B.Studies') mGrp = s.group === 'B.Studies';
            else if (grp === 'Science') mGrp = s.group === 'Science';
            else if (['Group-A', 'Group-B', 'Group-C'].includes(grp)) mGrp = s.subGroup === grp;

            let mQ = !q || String(s.id).includes(q) || (s.name || '').toLowerCase().includes(q) || String(s.roll).includes(q);
            return mGrp && mQ;
        });

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 30px; color: #94a3b8;">কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি। ফাইল আপলোড করুন।</td></tr>';
            return;
        }

        list.sort((a, b) => {
            if (a.group !== b.group) return a.group === 'Science' ? -1 : 1;
            return (a.overallRank || a.sl) - (b.overallRank || b.sl);
        });

        list.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center; font-weight:800; font-size:0.95rem; color:#4f46e5;">${s.sl}</td>
                <td style="text-align:center;"><span style="font-family:monospace; font-weight:700;">${s.id}</span></td>
                <td style="text-align:left; padding-left:15px; font-weight:700;">${s.name}</td>
                <td style="text-align:center; color:#64748b;">${s.roll}</td>
                <td style="text-align:center;"><span class="badge ${s.group === 'Humanities' ? 'badge-primary' : (s.group === 'B.Studies' ? 'badge-warning' : 'badge-success')}">${s.section}</span></td>
                <td style="text-align:center;"><strong>${s.subGroup || s.group}</strong></td>
                <td style="text-align:center;"><span class="badge" style="background:#eef2ff; color:#4f46e5; font-weight:700;">Position #${s.overallRank || s.sl}</span></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // ==========================================================
    // ৪. পিন ও শিক্ষক কন্ট্রোল
    // ==========================================================
    window.renderEvalPins = function () {
        const tbody = document.getElementById('evalPinTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const allSubs = [
            ...SUBJECTS_CONFIG.Science,
            { key: 'His', name: 'History' }, { key: 'Geo', name: 'Geography' },
            { key: 'Civ', name: 'Civics' }, { key: 'Fin', name: 'Finance' }, { key: 'Acc', name: 'Accounting' }
        ];

        const uniqueSubs = Array.from(new Set(allSubs.map(a => a.key))).map(k => allSubs.find(a => a.key === k));

        uniqueSubs.forEach(s => {
            const p = subjectPins[s.key] || '';
            let hasMarks = false;
            Object.values(examMarks).forEach(stdMarkObj => {
                if (stdMarkObj && stdMarkObj[s.key] !== undefined && stdMarkObj[s.key] !== '') hasMarks = true;
            });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:left; padding-left:15px; font-weight:700;">${s.name} (${s.key})</td>
                <td>
                    <span class="badge ${hasMarks ? 'badge-success' : (p ? 'badge-primary' : 'badge-danger')}">
                        ${hasMarks ? '✓ Submitted' : (p ? 'PIN Set (Ready)' : 'Pending (No PIN)')}
                    </span>
                </td>
                <td><strong style="letter-spacing: 2px;">${p || '----'}</strong></td>
                <td style="text-align:center;">
                    <button class="btn-action btn-delete" onclick="window.resetEvalPin('${s.key}')" ${!p ? 'disabled style="opacity:0.3;"' : ''}>
                        <i class="fa-solid fa-rotate-left"></i> Reset
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.resetEvalPin = function (k) {
        if (confirm("Reset PIN for " + k + "? Teacher can set a new PIN.")) {
            delete subjectPins[k];
            window.renderEvalPins();
            if (window.writeToFirebase) window.writeToFirebase(`evaluation_system/pins/${k}`, null);
        }
    };

    window.saveEvalExamSettings = function () {
        currentExam.title = document.getElementById('evalExTitle').value;
        currentExam.date = document.getElementById('evalExDate').value;
        if (window.writeToFirebase) window.writeToFirebase(`evaluation_system/exams/${currentExam.id}`, currentExam);
        alert("Exam settings saved!");
    };

    window.copyEvalTeacherLink = function () {
    const liveTeacherUrl = "https://cpscl.vercel.app";
    navigator.clipboard.writeText(liveTeacherUrl).then(() => {
        alert("Teacher link copied successfully!\n" + liveTeacherUrl);
    });
};
    // ==========================================================
    // ৫. টেবুলেশন শিট ও লাইভ মেধা তালিকা
    // ==========================================================
    window.renderEvalTabulation = function () {
        const grp = document.getElementById('evalTabGroup').value;
        const thead = document.getElementById('evalTabThead');
        const tbody = document.getElementById('evalTabTbody');
        const meta = document.getElementById('evalPrintMeta');
        if (!thead || !tbody) return;

        let activeSubs = SUBJECTS_CONFIG.Science;
        let groupTitle = "Science (বিজ্ঞান)";

        if (grp === 'Humanities') {
            activeSubs = SUBJECTS_CONFIG.Humanities;
            groupTitle = "Humanities (মানবিক)";
        } else if (grp === 'B.Studies') {
            activeSubs = SUBJECTS_CONFIG.BStudies;
            groupTitle = "Business Studies (ব্যবসায় শিক্ষা)";
        }

        meta.innerText = `Class: Ten (${groupTitle}) • Exam: ${currentExam.title} • Date: ${currentExam.date} • Total: 180 Marks`;

        thead.innerHTML = `
            <tr style="background:#f1f5f9;">
                <th style="border:1px solid #000; padding:6px; width:45px;">SL</th>
                <th style="border:1px solid #000; padding:6px; width:75px;">Std ID</th>
                <th style="border:1px solid #000; padding:6px; text-align:left; padding-left:10px;">Student Name</th>
                <th style="border:1px solid #000; padding:6px; width:45px;">Roll</th>
                <th style="border:1px solid #000; padding:6px; width:45px;">Sec</th>
                ${activeSubs.map(s => `<th style="border:1px solid #000; padding:4px;">${s.key}</th>`).join('')}
                <th style="border:1px solid #000; padding:6px; width:70px; background:#e2e8f0;">Total (180)</th>
            </tr>
        `;

        let list = [];
        if (grp === 'Humanities') list = studentsList.filter(s => s.group === 'Humanities');
        else if (grp === 'B.Studies') list = studentsList.filter(s => s.group === 'B.Studies');
        else if (grp === 'Science_Merit') list = studentsList.filter(s => s.group === 'Science');
        else list = studentsList.filter(s => s.subGroup === grp);

        let computedList = list.map(s => {
            const m = examMarks[s.id] || {};
            let total = 0;
            activeSubs.forEach(sb => {
                let v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, marksObj: m };
        });

        if (grp === 'Science_Merit') {
            computedList.sort((a, b) => b.total - a.total);
        } else {
            computedList.sort((a, b) => (a.overallRank || a.sl) - (b.overallRank || b.sl));
        }

        tbody.innerHTML = '';
        computedList.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="border:1px solid #000; text-align:center; font-weight:700;">${idx + 1}</td>
                <td style="border:1px solid #000; text-align:center; font-family:monospace; font-weight:700;">${s.id}</td>
                <td style="border:1px solid #000; text-align:left; padding-left:10px; font-weight:700;">${s.name}</td>
                <td style="border:1px solid #000; text-align:center;">${s.roll}</td>
                <td style="border:1px solid #000; text-align:center; font-weight:700;">${s.section}</td>
                ${activeSubs.map(sb => `<td style="border:1px solid #000; text-align:center;">${s.marksObj[sb.key] !== undefined ? s.marksObj[sb.key] : '0'}</td>`).join('')}
                <td style="border:1px solid #000; text-align:center; font-weight:800; background:#f8fafc;">${s.total}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // ==========================================================
    // ৬. সরাসরি ফায়ারবেস ক্লাউড লোডার
    // ==========================================================
    async function loadDirectlyFromFirebase(retries = 25) {
        if (!window.getDatabase || !window.ref || !window.get) {
            if (retries > 0) setTimeout(() => loadDirectlyFromFirebase(retries - 1), 200);
            return;
        }

        try {
            const db = window.getDatabase();
            
            const snap = await window.get(window.ref(db, 'evaluation_system/students'));
            if (snap && snap.exists()) {
                studentsList = Object.values(snap.val());
                window.renderEvalStudents();
            }

            const pinSnap = await window.get(window.ref(db, 'evaluation_system/pins'));
            if (pinSnap && pinSnap.exists()) {
                subjectPins = pinSnap.val() || {};
                window.renderEvalPins();
            }

            const marksSnap = await window.get(window.ref(db, `evaluation_system/marks/${currentExam.id}`));
            if (marksSnap && marksSnap.exists()) {
                examMarks = marksSnap.val() || {};
                window.renderEvalTabulation();
            }

            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(({ onValue }) => {
                onValue(window.ref(db, `evaluation_system/marks/${currentExam.id}`), (s) => {
                    examMarks = s.val() || {};
                    window.renderEvalPins();
                    if (document.getElementById('eval-tab-sec').style.display !== 'none') {
                        window.renderEvalTabulation();
                    }
                });
                onValue(window.ref(db, 'evaluation_system/students'), (s) => {
                    const d = s.val();
                    if (d) {
                        studentsList = Object.values(d);
                        window.renderEvalStudents();
                    }
                });
            }).catch(e => {});

        } catch (err) {
            console.error("Firebase sync error:", err);
        }
    }

    function runModule() {
        injectExamModule();
        loadDirectlyFromFirebase();
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', runModule);
    } else {
        runModule();
    }
})();
