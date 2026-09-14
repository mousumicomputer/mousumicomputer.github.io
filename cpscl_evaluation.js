/**
 * Standalone Academic Evaluation Module
 * File: cpscl_evaluation.js
 */

(function () {
    const SUBJECTS = {
        Science: [
            { key: 'B2', name: 'Bangla 2nd' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'HM', name: 'Higher Math / AG' },
            { key: 'Phy', name: 'Physics' }, { key: 'Che', name: 'Chemistry' },
            { key: 'Bio', name: 'Biology' }, { key: 'BGS', name: 'BGS' },
            { key: 'Reli', name: 'Religion' }, { key: 'ICT', name: 'ICT' }
        ],
        Humanities: [
            { key: 'B2', name: 'Bangla 2nd' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'AG_HE', name: 'AG / Home Eco' },
            { key: 'His', name: 'History' }, { key: 'Geo', name: 'Geography' },
            { key: 'Civ', name: 'Civics' }, { key: 'Sci', name: 'General Science' },
            { key: 'Reli', name: 'Religion' }
        ],
        BStudies: [
            { key: 'B2', name: 'Bangla 2nd' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'AG_HE', name: 'AG / Home Eco' },
            { key: 'Fin', name: 'Finance' }, { key: 'Acc', name: 'Accounting' },
            { key: 'Sci', name: 'General Science' }, { key: 'Reli', name: 'Religion' }
        ]
    };

    let studentsList = [];
    let examMarks = {};
    let subjectPins = {};
    let currentExam = { id: "exam_fn02_2026", title: "Fortnightly Test-02", date: "12 Sep 2026", max: 15 };

    // ==========================================================
    // ১. সাইডবারে ইউনিক ড্রপডাউন ইনজেক্ট (২নং ছবির হুবহু স্টাইল)
    // ==========================================================
    function injectExamModule() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList) return;

        // আগের কোনো ডুপ্লিকেট থাকলে রিমুভ করা
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
            <ul class="submenu-list" id="exam-submenu-list">
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-student-sec')"><i class="fa-solid fa-angle-right"></i> <span>Student Database</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-config-sec')"><i class="fa-solid fa-angle-right"></i> <span>Exam & PIN Setup</span></a></li>
                <li class="submenu-item"><a onclick="window.switchExamSubSection('eval-tab-sec')"><i class="fa-solid fa-angle-right"></i> <span>Tabulation & Merit</span></a></li>
            </ul>
        `;

        // সাইডবারের শেষের দিকে নিরাপদে ইনসার্ট করা
        menuList.appendChild(evalLi);

        // মূল স্ক্রিন ইনজেক্ট (Main Wrapper এর ভেতর)
        const mainWrapper = document.querySelector('.main-wrapper');
        if (mainWrapper && !document.getElementById('exam-eval-view')) {
            const viewDiv = document.createElement('div');
            viewDiv.className = 'view-panel';
            viewDiv.id = 'exam-eval-view';
            viewDiv.innerHTML = `
                <!-- SUB-SECTION 1: STUDENT DATABASE -->
                <div id="eval-student-sec" class="eval-sub-sec">
                    <div class="erp-form-card" style="max-width: 100%; padding: 16px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; gap: 8px;">
                                <select id="evalFilterGroup" class="dcr-filter-input" onchange="window.renderEvalStudents()">
                                    <option value="All">All Groups (All Students)</option>
                                    <option value="Science">Science (Combined)</option>
                                    <option value="SA">Science (Sec: SA)</option>
                                    <option value="DH">Science (Sec: DH)</option>
                                    <option value="SHO">Science (Sec: SHO)</option>
                                    <option value="Humanities">Humanities</option>
                                    <option value="B.Studies">Business Studies</option>
                                </select>
                                <input type="text" id="evalSearchInp" class="dcr-filter-input" placeholder="Search ID or Name..." oninput="window.renderEvalStudents()" style="width: 200px;">
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dcr-btn-filter" style="background: #10b981;" onclick="document.getElementById('evalExcelFile').click()">
                                    <i class="fa-solid fa-file-excel"></i> Import Excel / CSV
                                </button>
                                <input type="file" id="evalExcelFile" accept=".xlsx, .xls, .csv" style="display: none;" onchange="window.importEvalExcel(this)">
                                <button class="dcr-btn-filter" onclick="window.addNewEvalStudent()">
                                    <i class="fa-solid fa-plus"></i> Add Student
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="table-container" style="background:#fff;">
                        <table>
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="width: 60px;">Roll</th>
                                    <th style="width: 100px;">Student ID</th>
                                    <th style="text-align: left; padding-left: 15px;">Student Name</th>
                                    <th>Group</th>
                                    <th>Section</th>
                                    <th style="text-align: center; width: 100px;">Action</th>
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
                            <div style="width: 100px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Full Marks</label>
                                <input type="number" id="evalExMax" value="${currentExam.max}" class="dcr-filter-input" style="width: 100%;">
                            </div>
                            <button class="dcr-btn-filter" onclick="window.saveEvalExamSettings()"><i class="fa-solid fa-save"></i> Save Exam</button>
                            <button class="dcr-btn-filter" style="background: #0ea5e9;" onclick="window.copyEvalTeacherLink()"><i class="fa-solid fa-link"></i> Copy Teacher Link</button>
                        </div>
                    </div>
                    <div class="table-container" style="background:#fff;">
                        <table>
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="text-align: left; padding-left: 15px;">Subject Name</th>
                                    <th>Group</th>
                                    <th>Status</th>
                                    <th>Secret PIN</th>
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
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Select Group:</label>
                                <select id="evalTabGroup" class="dcr-filter-input" onchange="window.renderEvalTabulation()">
                                    <option value="Science_Merit">Science (Combined Merit - SA, DH, SHO)</option>
                                    <option value="Humanities">Humanities</option>
                                    <option value="B.Studies">Business Studies</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dcr-btn-filter" onclick="window.renderEvalTabulation()"><i class="fa-solid fa-arrows-rotate"></i> Refresh</button>
                                <button class="dcr-btn-filter" style="background: #10b981;" onclick="window.print()"><i class="fa-solid fa-print"></i> Print PDF</button>
                            </div>
                        </div>
                    </div>

                    <!-- প্রিন্ট পেপার -->
                    <div class="erp-form-card" style="max-width: 100%; padding: 25px; background: #fff; border: 1px solid #000;">
                        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">
                            <h2 style="font-size: 1.3rem; font-weight: 800; text-transform: uppercase; margin: 0;">Cantonment Public School and College Lalmonirhat</h2>
                            <h4 style="font-size: 0.95rem; font-weight: 700; margin: 3px 0;">Performance Evaluation</h4>
                            <p id="evalPrintMeta" style="font-size: 0.85rem; font-weight: 600; color: #475569; margin: 0;">Class: Ten (Science) • Date: 12 Sep 2026 • Combined Sections (SA, DH, SHO)</p>
                        </div>
                        <div class="table-container" style="border: 1px solid #000;">
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

    // ড্রপডাউন খোলা ও বন্ধ করার টগল
    window.toggleExamMenu = function (e) {
        if (e) e.preventDefault();
        const sub = document.getElementById('exam-submenu-list');
        const chevron = document.getElementById('exam-chevron-icon');
        const parent = document.getElementById('menu-exam-eval-parent');
        if (!sub) return;

        if (sub.style.display === 'flex') {
            sub.style.display = 'none';
            if (chevron) chevron.style.transform = 'rotate(0deg)';
            if (parent) parent.classList.remove('open');
        } else {
            sub.style.display = 'flex';
            sub.style.flexDirection = 'column';
            if (chevron) chevron.style.transform = 'rotate(180deg)';
            if (parent) parent.classList.add('open');
        }
    };

    // সাব-সেকশন স্যুইচিং
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
    // ২. ফায়ারবেস ডেটা সিঙ্ক (আজীবন সংরক্ষিত ও নিরাপদ)
    // ==========================================================
    function initFirebaseSync() {
        if (!window.getDatabase || !window.ref) return;
        const db = window.getDatabase();

        import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(({ onValue }) => {
            onValue(window.ref(db, 'evaluation_system/students'), (snap) => {
                const val = snap.val();
                studentsList = val ? Object.values(val) : [];
                if (studentsList.length === 0) seedSampleData();
                else window.renderEvalStudents();
            });

            onValue(window.ref(db, 'evaluation_system/pins'), (snap) => {
                subjectPins = snap.val() || {};
                window.renderEvalPins();
            });

            onValue(window.ref(db, `evaluation_system/marks/${currentExam.id}`), (snap) => {
                examMarks = snap.val() || {};
                window.renderEvalTabulation();
            });
        });
    }

    // ==========================================================
    // ৩. রেন্ডারিং ও ফাংশনালিটি
    // ==========================================================
    window.renderEvalStudents = function () {
        const tbody = document.getElementById('evalStudentTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const grp = document.getElementById('evalFilterGroup').value;
        const q = (document.getElementById('evalSearchInp').value || '').toLowerCase().trim();

        let list = studentsList.filter(s => {
            let mGrp = true;
            if (grp === 'Science') mGrp = s.group === 'Science';
            else if (['SA', 'DH', 'SHO'].includes(grp)) mGrp = s.section === grp;
            else if (grp === 'Humanities') mGrp = s.group === 'Humanities';
            else if (grp === 'B.Studies') mGrp = s.group === 'B.Studies';

            let mQ = !q || String(s.id).includes(q) || (s.name || '').toLowerCase().includes(q) || String(s.roll).includes(q);
            return mGrp && mQ;
        });

        list.sort((a, b) => (parseInt(a.roll) || 0) - (parseInt(b.roll) || 0));

        list.forEach(s => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${s.roll || '-'}</strong></td>
                <td><span style="font-family:monospace; font-weight:700;">${s.id}</span></td>
                <td style="text-align:left; padding-left:15px; font-weight:700;">${s.name}</td>
                <td>${s.group}</td>
                <td><span class="badge badge-success">${s.section || 'A'}</span></td>
                <td style="text-align:center;">
                    <button class="btn-action btn-delete" onclick="window.deleteEvalStudent('${s.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.importEvalExcel = function (input) {
        if (!input.files || !input.files[0]) return;
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

                if (window.showLoader) window.showLoader("Saving students...");

                for (let r of rows) {
                    const stdId = String(r['Std ID'] || r['ID'] || r['Student ID'] || Date.now() + Math.floor(Math.random()*1000));
                    const obj = {
                        id: stdId,
                        roll: parseInt(r['Roll'] || r['roll']) || 1,
                        name: r['Student Name'] || r['Name'] || 'Student',
                        group: r['Group'] || 'Science',
                        section: r['Sec'] || r['Section'] || 'SA',
                        created: new Date().toISOString()
                    };
                    await window.writeToFirebase(`evaluation_system/students/${stdId}`, obj);
                }

                if (window.hideLoader) window.hideLoader();
                if (window.showToast) window.showToast("Students imported!", "success");
                input.value = '';
            } catch (err) {
                if (window.hideLoader) window.hideLoader();
                alert("Error: " + err.message);
            }
        };
        reader.readAsArrayBuffer(input.files[0]);
    };

    window.deleteEvalStudent = function (id) {
        if (confirm("Delete student ID " + id + "?")) {
            window.writeToFirebase(`evaluation_system/students/${id}`, null);
        }
    };

    window.addNewEvalStudent = async function () {
        const id = prompt("Student ID:");
        if (!id) return;
        const name = prompt("Student Name:");
        const roll = prompt("Roll:");
        const grp = prompt("Group (Science / Humanities / B.Studies):", "Science");
        const sec = prompt("Section (SA / DH / SHO):", "SA");

        const obj = { id, name, roll: parseInt(roll)||1, group: grp, section: sec };
        await window.writeToFirebase(`evaluation_system/students/${id}`, obj);
        if (window.showToast) window.showToast("Added!", "success");
    };

    window.renderEvalPins = function () {
        const tbody = document.getElementById('evalPinTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const subs = [
            { key: 'Phy', name: 'Physics', grp: 'Science' },
            { key: 'HM', name: 'Higher Math', grp: 'Science' },
            { key: 'Che', name: 'Chemistry', grp: 'Science' },
            { key: 'Bio', name: 'Biology', grp: 'Science' },
            { key: 'B2', name: 'Bangla 2nd', grp: 'All Groups' },
            { key: 'E2', name: 'English 2nd', grp: 'All Groups' },
            { key: 'Math', name: 'General Math', grp: 'All Groups' },
            { key: 'ICT', name: 'ICT', grp: 'Science' }
        ];

        subs.forEach(s => {
            const p = subjectPins[s.key] || '';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:left; padding-left:15px; font-weight:700;">${s.name} (${s.key})</td>
                <td>${s.grp}</td>
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

    window.resetEvalPin = async function (k) {
        if (confirm("Reset PIN for " + k + "?")) {
            await window.writeToFirebase(`evaluation_system/pins/${k}`, null);
            if (window.showToast) window.showToast("PIN Reset for " + k, "info");
        }
    };

    window.saveEvalExamSettings = async function () {
        currentExam.title = document.getElementById('evalExTitle').value;
        currentExam.date = document.getElementById('evalExDate').value;
        currentExam.max = parseFloat(document.getElementById('evalExMax').value) || 15;
        await window.writeToFirebase(`evaluation_system/exams/${currentExam.id}`, currentExam);
        if (window.showToast) window.showToast("Exam saved!", "success");
    };

    window.copyEvalTeacherLink = function () {
        const url = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + "teacher_mobile_entry.html";
        navigator.clipboard.writeText(url).then(() => {
            if (window.showToast) window.showToast("Copied Link!", "success");
            else alert("Copied: " + url);
        });
    };

    window.renderEvalTabulation = function () {
        const grp = document.getElementById('evalTabGroup').value;
        const thead = document.getElementById('evalTabThead');
        const tbody = document.getElementById('evalTabTbody');
        const meta = document.getElementById('evalPrintMeta');
        if (!thead || !tbody) return;

        if (grp === 'Humanities') {
            meta.innerText = "Class: Ten (Humanities) • Date: " + currentExam.date + " • 22 Students";
            buildGroupTable('Humanities', 135, SUBJECTS.Humanities, thead, tbody);
        } else if (grp === 'B.Studies') {
            meta.innerText = "Class: Ten (B.Studies) • Date: " + currentExam.date + " • 5 Students";
            buildGroupTable('B.Studies', 120, SUBJECTS.BStudies, thead, tbody);
        } else {
            meta.innerText = "Class: Ten (Science) • Date: " + currentExam.date + " • Combined Sections (SA, DH, SHO)";
            buildScienceTable(thead, tbody);
        }
    };

    function buildScienceTable(thead, tbody) {
        const subs = SUBJECTS.Science;
        thead.innerHTML = `
            <tr style="background:#f1f5f9;">
                <th style="border:1px solid #000; padding:6px; width:45px;">SL</th>
                <th style="border:1px solid #000; padding:6px; width:75px;">Std ID</th>
                <th style="border:1px solid #000; padding:6px; text-align:left; padding-left:10px;">Student Name</th>
                <th style="border:1px solid #000; padding:6px; width:45px;">Roll</th>
                <th style="border:1px solid #000; padding:6px; width:45px;">Sec</th>
                ${subs.map(s => `<th style="border:1px solid #000; padding:6px;">${s.key}</th>`).join('')}
                <th style="border:1px solid #000; padding:6px; width:75px; background:#e2e8f0;">Total (150)</th>
            </tr>
        `;

        let list = studentsList.filter(s => s.group === 'Science' || ['SA', 'DH', 'SHO'].includes(s.section));
        let computed = list.map(s => {
            const m = examMarks[s.id] || {};
            let total = 0;
            subs.forEach(sb => {
                const v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, marks: m };
        });

        computed.sort((a, b) => b.total - a.total);

        tbody.innerHTML = '';
        computed.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="border:1px solid #000; text-align:center; font-weight:700;">${idx + 1}</td>
                <td style="border:1px solid #000; text-align:center; font-family:monospace; font-weight:700;">${s.id}</td>
                <td style="border:1px solid #000; text-align:left; padding-left:10px; font-weight:700;">${s.name}</td>
                <td style="border:1px solid #000; text-align:center;">${s.roll || '-'}</td>
                <td style="border:1px solid #000; text-align:center; font-weight:700;">${s.section || 'SA'}</td>
                ${subs.map(sb => `<td style="border:1px solid #000; text-align:center;">${s.marks[sb.key] !== undefined ? s.marks[sb.key] : '-'}</td>`).join('')}
                <td style="border:1px solid #000; text-align:center; font-weight:800; background:#f8fafc;">${s.total}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function buildGroupTable(grpName, maxTot, subs, thead, tbody) {
        thead.innerHTML = `
            <tr style="background:#f1f5f9;">
                <th style="border:1px solid #000; padding:6px; width:45px;">SL</th>
                <th style="border:1px solid #000; padding:6px; width:80px;">Std ID</th>
                <th style="border:1px solid #000; padding:6px; text-align:left; padding-left:10px;">Student Name</th>
                <th style="border:1px solid #000; padding:6px; width:50px;">Roll</th>
                ${subs.map(s => `<th style="border:1px solid #000; padding:6px;">${s.key}</th>`).join('')}
                <th style="border:1px solid #000; padding:6px; width:80px; background:#e2e8f0;">Total (${maxTot})</th>
            </tr>
        `;

        let list = studentsList.filter(s => s.group === grpName);
        let computed = list.map(s => {
            const m = examMarks[s.id] || {};
            let total = 0;
            subs.forEach(sb => {
                const v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, marks: m };
        });

        computed.sort((a, b) => b.total - a.total);

        tbody.innerHTML = '';
        computed.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="border:1px solid #000; text-align:center; font-weight:700;">${idx + 1}</td>
                <td style="border:1px solid #000; text-align:center; font-family:monospace; font-weight:700;">${s.id}</td>
                <td style="border:1px solid #000; text-align:left; padding-left:10px; font-weight:700;">${s.name}</td>
                <td style="border:1px solid #000; text-align:center;">${s.roll || '-'}</td>
                ${subs.map(sb => `<td style="border:1px solid #000; text-align:center;">${s.marks[sb.key] !== undefined ? s.marks[sb.key] : '-'}</td>`).join('')}
                <td style="border:1px solid #000; text-align:center; font-weight:800; background:#f8fafc;">${s.total}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    async function seedSampleData() {
        const demos = [
            { id: "702723", roll: 1, name: "Md. Nahiduzzaman Arik", group: "Science", section: "SA" },
            { id: "701923", roll: 4, name: "Md. Tazbiduzzaman", group: "Science", section: "DH" },
            { id: "700623", roll: 7, name: "Zarin Tasnim", group: "Science", section: "SA" },
            { id: "702123", roll: 1, name: "Rukaiya Rahnuma", group: "Science", section: "SHO" },
            { id: "100917", roll: 5, name: "Indika Tarannum Nusfy", group: "Science", section: "SA" },
            { id: "601122", roll: 2, name: "Syeda Nusrat Jahan", group: "Humanities", section: "A" },
            { id: "901825", roll: 1, name: "Nafisa Anjum Hiya", group: "Humanities", section: "A" },
            { id: "602322", roll: 1, name: "Md. Israfil Hossain Nehal", group: "B.Studies", section: "A" }
        ];
        for (let d of demos) {
            await window.writeToFirebase(`evaluation_system/students/${d.id}`, d);
        }
    }

    // স্বয়ংক্রিয় লোডার (Page ready)
    function runModule() {
        injectExamModule();
        setTimeout(initFirebaseSync, 1000);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', runModule);
    } else {
        runModule();
    }
})();
