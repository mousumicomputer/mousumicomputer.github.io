/**
 * CPSCL All-in-One Autonomous Plug-and-Play Module
 * File: cpscl_module.js
 * Works automatically without touching any HTML file!
 */

(function () {
    // সাবজেক্ট ডেফিনিশন
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
    // ১. সাইডবার ও স্ক্রিন স্বয়ংক্রিয়ভাবে ইনজেক্ট করা (Auto-Inject)
    // ==========================================================
    function injectCPSCLModule() {
        // সাইডবার ড্রপডাউন ইনজেকশন (২নং ছবির মতো)
        const menuList = document.querySelector('.menu-list');
        if (menuList && !document.getElementById('menu-cpscl-parent')) {
            const cpsclLi = document.createElement('li');
            cpsclLi.className = 'menu-item';
            cpsclLi.id = 'menu-cpscl-parent';
            cpsclLi.innerHTML = `
                <a onclick="window.toggleParentMenu('menu-cpscl-parent')">
                    <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>CPSCL</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon"></i>
                </a>
                <ul class="submenu-list" style="display: none;">
                    <li class="submenu-item"><a onclick="window.switchCPSCLSubSection('cpscl-student-sec')"><i class="fa-solid fa-angle-right"></i> <span>Student Database</span></a></li>
                    <li class="submenu-item"><a onclick="window.switchCPSCLSubSection('cpscl-exam-sec')"><i class="fa-solid fa-angle-right"></i> <span>Exam & PIN Setup</span></a></li>
                    <li class="submenu-item"><a onclick="window.switchCPSCLSubSection('cpscl-tab-sec')"><i class="fa-solid fa-angle-right"></i> <span>Tabulation & Merit</span></a></li>
                </ul>
            `;
            // User Management এর ঠিক উপরে স্থাপন
            const userMgmt = document.getElementById('menu-user-parent') || menuList.children[menuList.children.length - 2];
            if (userMgmt) menuList.insertBefore(cpsclLi, userMgmt);
            else menuList.appendChild(cpsclLi);
        }

        // মূল স্ক্রিন ইনজেকশন (Main Wrapper এর ভেতর)
        const mainWrapper = document.querySelector('.main-wrapper');
        if (mainWrapper && !document.getElementById('cpscl-view')) {
            const viewDiv = document.createElement('div');
            viewDiv.className = 'view-panel';
            viewDiv.id = 'cpscl-view';
            viewDiv.innerHTML = `
                <!-- SUB-SECTION 1: STUDENT DATABASE -->
                <div id="cpscl-student-sec" class="cpscl-sub-sec">
                    <div class="erp-form-card" style="max-width: 100%; padding: 16px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; gap: 8px;">
                                <select id="cpsclFilterGroup" class="dcr-filter-input" onchange="window.renderCpsclStudents()">
                                    <option value="All">All Groups (All Students)</option>
                                    <option value="Science">Science (Combined)</option>
                                    <option value="SA">Science (Sec: SA)</option>
                                    <option value="DH">Science (Sec: DH)</option>
                                    <option value="SHO">Science (Sec: SHO)</option>
                                    <option value="Humanities">Humanities</option>
                                    <option value="B.Studies">Business Studies</option>
                                </select>
                                <input type="text" id="cpsclSearchInp" class="dcr-filter-input" placeholder="Search ID or Name..." oninput="window.renderCpsclStudents()" style="width: 200px;">
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dcr-btn-filter" style="background: #10b981;" onclick="document.getElementById('cpsclExcelFile').click()">
                                    <i class="fa-solid fa-file-excel"></i> Import Excel / CSV
                                </button>
                                <input type="file" id="cpsclExcelFile" accept=".xlsx, .xls, .csv" style="display: none;" onchange="window.importExcelData(this)">
                                <button class="dcr-btn-filter" onclick="window.addNewStudentPrompt()">
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
                            <tbody id="cpsclStudentTbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- SUB-SECTION 2: EXAM & PIN SETUP -->
                <div id="cpscl-exam-sec" class="cpscl-sub-sec" style="display: none;">
                    <div class="erp-form-card" style="max-width: 100%; padding: 16px; margin-bottom: 16px;">
                        <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 180px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Exam Name</label>
                                <input type="text" id="cpsclExTitle" value="${currentExam.title}" class="dcr-filter-input" style="width: 100%;">
                            </div>
                            <div style="width: 140px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Exam Date</label>
                                <input type="text" id="cpsclExDate" value="${currentExam.date}" class="dcr-filter-input" style="width: 100%;">
                            </div>
                            <div style="width: 100px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Full Marks</label>
                                <input type="number" id="cpsclExMax" value="${currentExam.max}" class="dcr-filter-input" style="width: 100%;">
                            </div>
                            <button class="dcr-btn-filter" onclick="window.saveExamSettings()"><i class="fa-solid fa-save"></i> Save Exam</button>
                            <button class="dcr-btn-filter" style="background: #0ea5e9;" onclick="window.copyEntryLink()"><i class="fa-solid fa-link"></i> Copy Teacher Link</button>
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
                            <tbody id="cpsclPinTbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- SUB-SECTION 3: TABULATION & MERIT -->
                <div id="cpscl-tab-sec" class="cpscl-sub-sec" style="display: none;">
                    <div class="erp-form-card no-print" style="max-width: 100%; padding: 14px; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Select Group:</label>
                                <select id="cpsclTabGroup" class="dcr-filter-input" onchange="window.renderTabulationSheet()">
                                    <option value="Science_Merit">Science (Combined Merit - SA, DH, SHO)</option>
                                    <option value="Humanities">Humanities</option>
                                    <option value="B.Studies">Business Studies</option>
                                </select>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="dcr-btn-filter" onclick="window.renderTabulationSheet()"><i class="fa-solid fa-arrows-rotate"></i> Refresh</button>
                                <button class="dcr-btn-filter" style="background: #10b981;" onclick="window.print()"><i class="fa-solid fa-print"></i> Print PDF</button>
                            </div>
                        </div>
                    </div>

                    <!-- প্রিন্ট পেপার -->
                    <div class="erp-form-card" style="max-width: 100%; padding: 25px; background: #fff; border: 1px solid #000;">
                        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px;">
                            <h2 style="font-size: 1.3rem; font-weight: 800; text-transform: uppercase; margin: 0;">Cantonment Public School and College Lalmonirhat</h2>
                            <h4 style="font-size: 0.95rem; font-weight: 700; margin: 3px 0;">Performance Evaluation</h4>
                            <p id="cpsclPrintMeta" style="font-size: 0.85rem; font-weight: 600; color: #475569; margin: 0;">Class: Ten (Science) • Date: 12 Sep 2026 • Combined Sections (SA, DH, SHO)</p>
                        </div>
                        <div class="table-container" style="border: 1px solid #000;">
                            <table id="cpsclTabTable">
                                <thead id="cpsclTabThead"></thead>
                                <tbody id="cpsclTabTbody"></tbody>
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

    // ==========================================================
    // ২. সাব-সেকশন ন্যাভিগেশন কন্ট্রোল
    // ==========================================================
    window.switchCPSCLSubSection = function (secId) {
        // মেনু হাইলাইট
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const pnl = document.getElementById('cpscl-view');
        if (pnl) pnl.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "CPSCL Academic Evaluation";

        document.querySelectorAll('.cpscl-sub-sec').forEach(s => s.style.display = 'none');
        const target = document.getElementById(secId);
        if (target) target.style.display = 'block';

        if (secId === 'cpscl-student-sec') window.renderCpsclStudents();
        if (secId === 'cpscl-exam-sec') window.renderCpsclPins();
        if (secId === 'cpscl-tab-sec') window.renderTabulationSheet();
    };

    // ==========================================================
    // ৩. ফায়ারবেস ডেটাবেজ সিঙ্ক (জিরো ওভাররাইট ও আজীবন সংরক্ষণ)
    // ==========================================================
    function initFirebaseListeners() {
        if (!window.getDatabase || !window.ref) return;
        const db = window.getDatabase();

        import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(({ onValue }) => {
            // ১. শিক্ষার্থী তালিকা
            onValue(window.ref(db, 'cpscl/students'), (snap) => {
                const val = snap.val();
                studentsList = val ? Object.values(val) : [];
                if (studentsList.length === 0) seedSampleData();
                else window.renderCpsclStudents();
            });

            // ২. শিক্ষকদের পিন
            onValue(window.ref(db, 'cpscl/pins'), (snap) => {
                subjectPins = snap.val() || {};
                window.renderCpsclPins();
            });

            // ৩. পরীক্ষার নম্বরসমূহ (আলাদা আলাদা পাথে সংরক্ষিত)
            onValue(window.ref(db, `cpscl/marks/${currentExam.id}`), (snap) => {
                examMarks = snap.val() || {};
                window.renderTabulationSheet();
            });
        });
    }

    // ==========================================================
    // ৪. স্টুডেন্ট রেন্ডার ও এক্সেল ইমপোর্ট
    // ==========================================================
    window.renderCpsclStudents = function () {
        const tbody = document.getElementById('cpsclStudentTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const grp = document.getElementById('cpsclFilterGroup').value;
        const q = (document.getElementById('cpsclSearchInp').value || '').toLowerCase().trim();

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
                    <button class="btn-action btn-delete" onclick="window.deleteStudent('${s.id}')"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // এক্সেল শিট আপলোড
    window.importExcelData = function (input) {
        if (!input.files || !input.files[0]) return;
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const wb = XLSX.read(data, { type: 'array' });
                const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

                if (window.showLoader) window.showLoader("Saving students to Firebase...");

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
                    // সারাজীবনের জন্য সুরক্ষিত ইউনিক পাথ
                    await window.writeToFirebase(`cpscl/students/${stdId}`, obj);
                }

                if (window.hideLoader) window.hideLoader();
                if (window.showToast) window.showToast("Students imported successfully!", "success");
                input.value = '';
            } catch (err) {
                if (window.hideLoader) window.hideLoader();
                alert("Error importing Excel: " + err.message);
            }
        };
        reader.readAsArrayBuffer(input.files[0]);
    };

    window.deleteStudent = function (id) {
        if (confirm("Delete student ID " + id + "?")) {
            window.writeToFirebase(`cpscl/students/${id}`, null);
        }
    };

    window.addNewStudentPrompt = async function () {
        const id = prompt("Enter Student ID (e.g. 702723):");
        if (!id) return;
        const name = prompt("Enter Student Name:");
        const roll = prompt("Enter Roll:");
        const grp = prompt("Enter Group (Science / Humanities / B.Studies):", "Science");
        const sec = prompt("Enter Section (SA / DH / SHO):", "SA");

        const obj = { id, name, roll: parseInt(roll)||1, group: grp, section: sec };
        await window.writeToFirebase(`cpscl/students/${id}`, obj);
        if (window.showToast) window.showToast("Student Added!", "success");
    };

    // ==========================================================
    // ৫. পরীক্ষা ও শিক্ষক পিন কন্ট্রোল
    // ==========================================================
    window.renderCpsclPins = function () {
        const tbody = document.getElementById('cpsclPinTbody');
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
                    <button class="btn-action btn-delete" onclick="window.resetPin('${s.key}')" ${!p ? 'disabled style="opacity:0.3;"' : ''}>
                        <i class="fa-solid fa-rotate-left"></i> Reset
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.resetPin = async function (k) {
        if (confirm("Reset PIN for " + k + "? Teacher can set a new PIN.")) {
            await window.writeToFirebase(`cpscl/pins/${k}`, null);
            if (window.showToast) window.showToast("PIN Reset for " + k, "info");
        }
    };

    window.saveExamSettings = async function () {
        currentExam.title = document.getElementById('cpsclExTitle').value;
        currentExam.date = document.getElementById('cpsclExDate').value;
        currentExam.max = parseFloat(document.getElementById('cpsclExMax').value) || 15;
        await window.writeToFirebase(`cpscl/exams/${currentExam.id}`, currentExam);
        if (window.showToast) window.showToast("Exam settings saved!", "success");
    };

    window.copyEntryLink = function () {
        const url = window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + "teacher_mobile_entry.html";
        navigator.clipboard.writeText(url).then(() => {
            if (window.showToast) window.showToast("Teacher mobile entry link copied!", "success");
            else alert("Copied: " + url);
        });
    };

    // ==========================================================
    // ৬. টেবুলেশন ও বিজ্ঞান মেধা তালিকা (Auto Merit Sorting)
    // ==========================================================
    window.renderTabulationSheet = function () {
        const grp = document.getElementById('cpsclTabGroup').value;
        const thead = document.getElementById('cpsclTabThead');
        const tbody = document.getElementById('cpsclTabTbody');
        const meta = document.getElementById('cpsclPrintMeta');
        if (!thead || !tbody) return;

        if (grp === 'Humanities') {
            meta.innerText = "Class: Ten (Humanities) • Date: " + currentExam.date + " • 22 Students";
            buildGroupReport('Humanities', 135, SUBJECTS.Humanities, thead, tbody);
        } else if (grp === 'B.Studies') {
            meta.innerText = "Class: Ten (B.Studies) • Date: " + currentExam.date + " • 5 Students";
            buildGroupReport('B.Studies', 120, SUBJECTS.BStudies, thead, tbody);
        } else {
            // Science: SA, DH, SHO কম্বাইন্ড মেধা তালিকা
            meta.innerText = "Class: Ten (Science) • Date: " + currentExam.date + " • Combined Sections (SA, DH, SHO)";
            buildScienceReport(thead, tbody);
        }
    };

    function buildScienceReport(thead, tbody) {
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
            const marksObj = examMarks[s.id] || {};
            let total = 0;
            subs.forEach(sb => {
                const val = parseFloat(marksObj[sb.key]);
                if (!isNaN(val)) total += val;
            });
            return { ...s, total, marks: marksObj };
        });

        // মোট নম্বরের ভিত্তিতে ১ থেকে ১৪৬তম মেধা তালিকায় সর্টিং
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

    function buildGroupReport(grpName, maxTot, subs, thead, tbody) {
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
            const marksObj = examMarks[s.id] || {};
            let total = 0;
            subs.forEach(sb => {
                const val = parseFloat(marksObj[sb.key]);
                if (!isNaN(val)) total += val;
            });
            return { ...s, total, marks: marksObj };
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

    // প্রাথমিক স্যাম্পল ডাটা (আপনার পিডিএফের আসল ছাত্ররা)
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
            await window.writeToFirebase(`cpscl/students/${d.id}`, d);
        }
    }

    // পেজ লোড হলে স্বয়ংক্রিয় স্টার্ট
    window.addEventListener('DOMContentLoaded', () => {
        injectCPSCLModule();
        setTimeout(initFirebaseListeners, 800);
    });

})();
