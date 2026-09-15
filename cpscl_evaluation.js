/**
 * CPSCL Academic Evaluation Module - Pure Firebase Permanent Storage
 * File: cpscl_evaluation.js
 * 100% Direct Firebase Cloud Database Sync (Zero Browser Cache Hacks)
 */

(function () {
    const SUBJECTS = [
        { key: 'B1', name: 'B1' }, { key: 'B2', name: 'B2' },
        { key: 'E1', name: 'E1' }, { key: 'E2', name: 'E2' },
        { key: 'Math', name: 'Math' }, { key: 'HM_AG', name: 'HM/AG' },
        { key: 'Phy', name: 'Phy' }, { key: 'Che', name: 'Che' },
        { key: 'Bio', name: 'Bio' }, { key: 'BGS', name: 'BGS' },
        { key: 'Reli', name: 'Reli' }, { key: 'ICT', name: 'ICT' }
    ];

    let studentsList = [];
    let examMarks = {};
    let subjectPins = {};
    let currentExam = { id: "exam_fn02_2026", title: "Fortnightly Test-02", date: "15 Sep 2026", max: 15 };

    // ==========================================================
    // ১. সাইডবার ও স্ক্রিন ইনজেকশন
    // ==========================================================
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
                            <div style="display: flex; gap: 8px;">
                                <select id="evalFilterGroup" class="dcr-filter-input" onchange="window.renderEvalStudents()">
                                    <option value="All">All Groups (146 Students)</option>
                                    <option value="Group-A">Group-A (SL: 1 to 56)</option>
                                    <option value="Group-B">Group-B (SL: 1 to 50)</option>
                                    <option value="Group-C">Group-C (SL: 1 to 40)</option>
                                </select>
                                <input type="text" id="evalSearchInp" class="dcr-filter-input" placeholder="Search ID, Name, Roll..." oninput="window.renderEvalStudents()" style="width: 220px;">
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dcr-btn-filter" style="background: #10b981;" onclick="document.getElementById('evalExcelFile').click()">
                                    <i class="fa-solid fa-file-excel"></i> Import Excel File
                                </button>
                                <input type="file" id="evalExcelFile" accept=".xlsx, .xls, .csv" style="display: none;" onchange="window.importMultiSheetExcel(this)">
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
                                    <th style="text-align:center;">Merit Position</th>
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
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">View Group:</label>
                                <select id="evalTabGroup" class="dcr-filter-input" onchange="window.renderEvalTabulation()">
                                    <option value="All">All Combined Merit (146 Students)</option>
                                    <option value="Group-A">Group-A Sheet (56 Students)</option>
                                    <option value="Group-B">Group-B Sheet (50 Students)</option>
                                    <option value="Group-C">Group-C Sheet (40 Students)</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dcr-btn-filter" style="background: #10b981;" onclick="window.print()"><i class="fa-solid fa-print"></i> Print Sheet</button>
                            </div>
                        </div>
                    </div>

                    <div class="erp-form-card" style="max-width: 100%; padding: 25px; background: #fff; border: 1px solid #000;">
                        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">
                            <h2 style="font-size: 1.3rem; font-weight: 800; text-transform: uppercase; margin: 0;">Cantonment Public School and College Lalmonirhat</h2>
                            <h4 style="font-size: 0.95rem; font-weight: 700; margin: 3px 0;">Performance Evaluation</h4>
                            <p id="evalPrintMeta" style="font-size: 0.85rem; font-weight: 600; color: #475569; margin: 0;">Class: Ten (Science) • Date: 15 Sep 2026 • Total: 180</p>
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
    // ২. এক্সেল ফাইল এক ক্লিকে ফায়ারবেসে পার্মানেন্ট সেভ করা (Atomic Save)
    // ==========================================================
    window.importMultiSheetExcel = function (input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = async function (e) {
            try {
                if (typeof XLSX === 'undefined') {
                    alert("SheetJS library not found!");
                    return;
                }

                if (window.showLoader) window.showLoader("Saving 146 students permanently to Firebase Cloud...");

                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                
                let allImported = [];
                const firebaseBatchObject = {}; // সম্পূর্ণ ফায়ারবেস ব্যাচ অবজেক্ট

                for (let sheetName of wb.SheetNames) {
                    const sheet = wb.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                    let groupTag = "Group-A";
                    let baseRank = 0;

                    let sNameUpper = sheetName.trim().toUpperCase();
                    if (sNameUpper === 'A' || sNameUpper.includes('GROUP-A')) {
                        groupTag = "Group-A"; baseRank = 0;
                    } else if (sNameUpper === 'B' || sNameUpper.includes('GROUP-B')) {
                        groupTag = "Group-B"; baseRank = 56;
                    } else if (sNameUpper === 'C' || sNameUpper.includes('GROUP-C')) {
                        groupTag = "Group-C"; baseRank = 106;
                    }

                    for (let r of rows) {
                        if (!r || r.length < 5) continue;

                        let rText = r.join(' ').toUpperCase();
                        if (rText.includes('GROUP-A')) { groupTag = "Group-A"; baseRank = 0; }
                        else if (rText.includes('GROUP-B')) { groupTag = "Group-B"; baseRank = 56; }
                        else if (rText.includes('GROUP-C')) { groupTag = "Group-C"; baseRank = 106; }

                        let stdId = null;
                        let idIndex = -1;

                        for (let i = 0; i < r.length; i++) {
                            let val = String(r[i] || '').trim();
                            if (/^\d{6}$/.test(val)) {
                                stdId = val;
                                idIndex = i;
                                break;
                            }
                        }

                        if (stdId && idIndex !== -1) {
                            let sl = parseInt(r[idIndex - 1]) || 1;
                            let name = String(r[idIndex + 1] || 'Student').trim();
                            let roll = parseInt(r[idIndex + 2]) || 1;
                            let sec = String(r[idIndex + 3] || 'SA').trim().toUpperCase();

                            const studentRecord = {
                                sl: sl, // এক্সেলের আসল ক্রমিক
                                id: stdId,
                                name: name,
                                roll: roll,
                                section: sec,
                                group: "Science",
                                subGroup: groupTag,
                                overallRank: baseRank + sl
                            };

                            allImported.push(studentRecord);
                            firebaseBatchObject[stdId] = studentRecord; // ফায়ারবেসে জমা
                        }
                    }
                }

                if (allImported.length > 0) {
                    allImported.sort((a, b) => a.overallRank - b.overallRank);

                    // ১. এক ক্লিকে সম্পূর্ণ ১৪৬ জনের তালিকা সরাসরি ফায়ারবেস ক্লাউডে আজীবনের জন্য সেভ
                    if (window.writeToFirebase) {
                        await window.writeToFirebase('evaluation_system/students', firebaseBatchObject);
                    }

                    // ২. সাথে সাথে মেমোরিতে সেট ও টেবিলে রেন্ডার
                    studentsList = allImported;
                    window.renderEvalStudents();

                    if (window.hideLoader) window.hideLoader();
                    alert(`🎉 সফল! ${allImported.length} জন শিক্ষার্থীর তথ্য ও ক্রমিক সরাসরি ফায়ারবেস ক্লাউডে স্থায়ীভাবে সেভ হয়েছে!`);
                } else {
                    if (window.hideLoader) window.hideLoader();
                    alert("ফাইলে ৬ সংখ্যার কোনো স্টুডেন্ট আইডি পাওয়া যায়নি!");
                }

                input.value = '';

            } catch (err) {
                if (window.hideLoader) window.hideLoader();
                alert("ফাইল পড়তে সমস্যা: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // ==========================================================
    // ৩. এক্সেলের হুবহু ক্রমিক (SL) অনুযায়ী টেবিল দেখানো
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
            let mGrp = (grp === 'All') ? true : (s.subGroup === grp);
            let mQ = !q || String(s.id).includes(q) || (s.name || '').toLowerCase().includes(q) || String(s.roll).includes(q);
            return mGrp && mQ;
        });

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 40px; color: #94a3b8;">কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি। ফাইল আপলোড করুন।</td></tr>';
            return;
        }

        // কঠোরভাবে ক্রমিক এবং মেধা অনুযায়ী সাজানো (রোল দিয়ে কখনো নয়!)
        list.sort((a, b) => (a.overallRank || a.sl) - (b.overallRank || b.sl));

        list.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center; font-weight:800; font-size:0.95rem; color:#4f46e5;">${s.sl}</td>
                <td style="text-align:center;"><span style="font-family:monospace; font-weight:700;">${s.id}</span></td>
                <td style="text-align:left; padding-left:15px; font-weight:700;">${s.name}</td>
                <td style="text-align:center; color:#64748b;">${s.roll}</td>
                <td style="text-align:center;"><span class="badge badge-success">${s.section}</span></td>
                <td style="text-align:center;"><strong>${s.subGroup}</strong></td>
                <td style="text-align:center;"><span class="badge" style="background:#eef2ff; color:#4f46e5; font-weight:700;">Rank #${s.overallRank}</span></td>
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

        SUBJECTS.forEach(s => {
            const p = subjectPins[s.key] || '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:left; padding-left:15px; font-weight:700;">${s.name} (${s.key})</td>
                <td><span class="badge ${p ? 'badge-success' : 'badge-danger'}">${p ? 'Active' : 'Pending'}</span></td>
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
        if (confirm("Reset PIN for " + k + "?")) {
            delete subjectPins[k];
            window.renderEvalPins();
            if (window.writeToFirebase) window.writeToFirebase(`evaluation_system/pins/${k}`, null);
        }
    };

    window.saveEvalExamSettings = function () {
        currentExam.title = document.getElementById('evalExTitle').value;
        currentExam.date = document.getElementById('evalExDate').value;
        if (window.writeToFirebase) window.writeToFirebase(`evaluation_system/exams/${currentExam.id}`, currentExam);
        alert("Exam settings saved to Firebase!");
    };

    window.copyEvalTeacherLink = function () {
        const url = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + "teacher_mobile_entry.html";
        navigator.clipboard.writeText(url).then(() => alert("Copied Link: " + url));
    };

    // ==========================================================
    // ৫. টেবুলেশন শিট
    // ==========================================================
    window.renderEvalTabulation = function () {
        const grp = document.getElementById('evalTabGroup').value;
        const thead = document.getElementById('evalTabThead');
        const tbody = document.getElementById('evalTabTbody');
        const meta = document.getElementById('evalPrintMeta');
        if (!thead || !tbody) return;

        meta.innerText = "Class: Ten (Science) • Date: 15 Sep 2026 • Total: 180 Marks • Group: " + grp;

        thead.innerHTML = `
            <tr style="background:#f1f5f9;">
                <th style="border:1px solid #000; padding:6px; width:45px;">SL</th>
                <th style="border:1px solid #000; padding:6px; width:75px;">Std ID</th>
                <th style="border:1px solid #000; padding:6px; text-align:left; padding-left:10px;">Student Name</th>
                <th style="border:1px solid #000; padding:6px; width:45px;">Roll</th>
                <th style="border:1px solid #000; padding:6px; width:45px;">Sec</th>
                ${SUBJECTS.map(s => `<th style="border:1px solid #000; padding:4px;">${s.key}</th>`).join('')}
                <th style="border:1px solid #000; padding:6px; width:70px; background:#e2e8f0;">Total (180)</th>
            </tr>
        `;

        let list = (grp === 'All') ? [...studentsList] : studentsList.filter(s => s.subGroup === grp);
        list.sort((a, b) => (a.overallRank || a.sl) - (b.overallRank || b.sl));

        tbody.innerHTML = '';
        list.forEach((s) => {
            const m = examMarks[s.id] || {};
            let total = 0;
            SUBJECTS.forEach(sb => {
                let v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="border:1px solid #000; text-align:center; font-weight:700;">${s.sl}</td>
                <td style="border:1px solid #000; text-align:center; font-family:monospace; font-weight:700;">${s.id}</td>
                <td style="border:1px solid #000; text-align:left; padding-left:10px; font-weight:700;">${s.name}</td>
                <td style="border:1px solid #000; text-align:center;">${s.roll}</td>
                <td style="border:1px solid #000; text-align:center; font-weight:700;">${s.section}</td>
                ${SUBJECTS.map(sb => `<td style="border:1px solid #000; text-align:center;">${m[sb.key] !== undefined ? m[sb.key] : '0'}</td>`).join('')}
                <td style="border:1px solid #000; text-align:center; font-weight:800; background:#f8fafc;">${total}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // ==========================================================
    // ৬. সরাসরি ফায়ারবেস ক্লাউড থেকে ডেটা রিলোড করা (On Refresh)
    // ==========================================================
    async function loadDirectlyFromFirebase(retries = 25) {
        if (!window.getDatabase || !window.ref || !window.get) {
            if (retries > 0) setTimeout(() => loadDirectlyFromFirebase(retries - 1), 200);
            return;
        }

        try {
            const db = window.getDatabase();
            
            // ক) ফায়ারবেস থেকে সরাসরি শিক্ষার্থীদের ডেটা তুলে আনা
            const snap = await window.get(window.ref(db, 'evaluation_system/students'));
            if (snap && snap.exists()) {
                const val = snap.val();
                studentsList = Object.values(val);
                studentsList.sort((a, b) => (a.overallRank || a.sl) - (b.overallRank || b.sl));
                window.renderEvalStudents();
            }

            // খ) পিন লোড করা
            const pinSnap = await window.get(window.ref(db, 'evaluation_system/pins'));
            if (pinSnap && pinSnap.exists()) {
                subjectPins = pinSnap.val() || {};
                window.renderEvalPins();
            }

            // গ) রিয়েল-টাইম লিসেনার
            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(({ onValue }) => {
                onValue(window.ref(db, 'evaluation_system/students'), (s) => {
                    const d = s.val();
                    if (d) {
                        studentsList = Object.values(d);
                        studentsList.sort((a, b) => (a.overallRank || a.sl) - (b.overallRank || b.sl));
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
        loadDirectlyFromFirebase(); // পেজ রিফ্রেশ দিলেই সোজা ফায়ারবেস থেকে সব ডেটা টেনে আনবে
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', runModule);
    } else {
        runModule();
    }
})();
