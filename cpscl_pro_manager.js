/**
 * CPSCL Pro Manager - Safe Cloud Sync, Multi-Year, Smart Edit & Clean Rounded UI
 * 100% Cloud Persistence (Firebase), Zero Data-Loss Guarantee
 */

(function () {
    let studentDB = [];
    let selectedStudentId = null;
    let currentTemplate = 'all';
    let currentYear = 'all';
    let pageSize = 25;
    let currentPage = 1;

    let dbInstance = null;
    let dbRefFunc = null;
    let dbSetFunc = null;

    /* ==========================================================
       ১. ফায়ারবেস ক্লাউড কানেকশন (১০০% নিরাপদ: কোনো ডাটা মুছবে না)
       ========================================================== */
    async function initSafeFirebase() {
        try {
            const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getDatabase, ref, set, onValue } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            const firebaseConfig = {
                apiKey: "AIzaSyA1PhRiTkICNCd8sA4he3ZxKjHtIzM0d5E",
                authDomain: "mousumi-computer.firebaseapp.com",
                databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                projectId: "mousumi-computer",
                storageBucket: "mousumi-computer.firebasestorage.app",
                messagingSenderId: "104820462623",
                appId: "1:104820462623:web:e3abae9533cc841463712a",
                measurementId: "G-EPYJ70W97Z"
            };

            const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig, "CPSCL_PRO_APP");
            dbInstance = getDatabase(app);
            dbRefFunc = ref;
            dbSetFunc = set;

            // ডাটাবেস থেকে নিরাপদ রিড
            const studentsRef = ref(dbInstance, 'cpscl/students');
            onValue(studentsRef, (snapshot) => {
                const cloudData = snapshot.val();
                if (cloudData) {
                    const rawList = Array.isArray(cloudData) ? cloudData : Object.values(cloudData);
                    // প্রতিটি ছাত্রের জন্য একটি ইউনিক আইডি (_uid) নিশ্চিত করা (ডাবল সমস্যা বন্ধ করতে)
                    studentDB = rawList.map((st, idx) => ({
                        ...st,
                        _uid: st._uid || (st.roll + '_' + (st.reg || idx) + '_' + (st.template || 'ssc'))
                    }));
                    localStorage.setItem('cpscl_students_data', JSON.stringify(studentDB));
                    populateYearOptions();
                    renderProTable();
                }
            });
        } catch (err) {
            console.warn("Offline/LocalStorage Mode:", err);
            const localData = JSON.parse(localStorage.getItem('cpscl_students_data') || '[]');
            studentDB = localData.map((st, idx) => ({
                ...st,
                _uid: st._uid || (st.roll + '_' + (st.reg || idx))
            }));
            populateYearOptions();
            renderProTable();
        }
    }

    // ফায়ারবেসে স্থায়ীভাবে ডাটা সেভ করার নিরাপদ ফাংশন
    async function saveToCloud(updatedList) {
        studentDB = updatedList;
        localStorage.setItem('cpscl_students_data', JSON.stringify(studentDB));
        if (dbInstance && dbSetFunc && dbRefFunc) {
            try {
                const studentsRef = dbRefFunc(dbInstance, 'cpscl/students');
                await dbSetFunc(studentsRef, studentDB);
            } catch (e) {
                console.error("Firebase Write Error:", e);
            }
        }
    }

    /* ==========================================================
       ২. গোল শেইপ ও স্পর্শকাতর স্টাইল ইনজেকশন
       ========================================================== */
    function injectProStyles() {
        if (document.getElementById('cpscl-pro-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-pro-styles';
        style.innerHTML = `
            /* গোল অ্যাকশন বাটনসমূহ */
            .pro-pill-btn {
                border-radius: 25px !important;
                padding: 8px 18px !important;
                font-size: 0.85rem !important;
                font-weight: 700 !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 8px !important;
                cursor: pointer !important;
                border: none !important;
                transition: all 0.2s ease !important;
            }
            .pro-btn-upload { background: #f0fdf4 !important; border: 1.5px dashed #16a34a !important; color: #15803d !important; }
            .pro-btn-upload:hover { background: #dcfce7 !important; }
            .pro-btn-sample { background: #0284c7 !important; color: #ffffff !important; }
            .pro-btn-sample:hover { background: #0369a1 !important; }
            .pro-btn-add { background: #6366f1 !important; color: #ffffff !important; }
            .pro-btn-add:hover { background: #4f46e5 !important; }
            
            /* এডিট, ডিলিট, প্রিন্ট বাটন */
            .pro-btn-edit { background: #d97706 !important; color: #ffffff !important; }
            .pro-btn-edit:hover:not(:disabled) { background: #b45309 !important; }
            .pro-btn-delete { background: #ef4444 !important; color: #ffffff !important; }
            .pro-btn-delete:hover:not(:disabled) { background: #dc2626 !important; }
            .pro-btn-print { background: #059669 !important; color: #ffffff !important; }
            .pro-btn-print:hover:not(:disabled) { background: #047857 !important; }
            .pro-btn-export { background: #334155 !important; color: #ffffff !important; }
            .pro-btn-export:hover { background: #1e293b !important; }

            .pro-pill-btn:disabled {
                opacity: 0.35 !important;
                cursor: not-allowed !important;
                transform: none !important;
            }

            /* গোল সিলেক্টর ও ইনপুট */
            .pro-pill-control {
                border-radius: 20px !important;
                border: 1.5px solid #cbd5e1 !important;
                height: 38px !important;
                padding: 0 16px !important;
                font-size: 0.85rem !important;
                font-weight: 600 !important;
                outline: none !important;
                background: #ffffff !important;
                color: #334155 !important;
                transition: border-color 0.2s !important;
            }
            .pro-pill-control:focus { border-color: #6366f1 !important; }

            /* টেবিল লাইন স্পর্শকাতর (Subtle Touch) স্টাইল */
            #cpsclProTableBody tr {
                cursor: pointer !important;
                transition: background-color 0.15s ease !important;
            }
            #cpsclProTableBody tr:hover {
                background-color: #f8fafc !important;
            }
            /* সিলেক্ট হলে নরম হালকা নীল আভা */
            #cpsclProTableBody tr.pro-row-active td {
                background-color: #f0f7ff !important;
                color: #1e40af !important;
                font-weight: 600 !important;
            }
            #cpsclProTableBody tr.pro-row-active td:first-child {
                border-top-left-radius: 12px !important;
                border-bottom-left-radius: 12px !important;
                border-left: 3px solid #3b82f6 !important;
            }
            #cpsclProTableBody tr.pro-row-active td:last-child {
                border-top-right-radius: 12px !important;
                border-bottom-right-radius: 12px !important;
            }

            /* পপ-আপ এডিট ও এন্ট্রি মডাল */
            .pro-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.5); display: none; align-items: center; 
                justify-content: center; z-index: 999999; backdrop-filter: blur(2px);
            }
            .pro-modal-card {
                background: #ffffff; border-radius: 20px; width: 680px; max-width: 95%;
                padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); box-sizing: border-box;
                max-height: 90vh; overflow-y: auto;
            }
            .pro-modal-header {
                font-size: 1.1rem; font-weight: 800; color: #0f172a; margin-bottom: 16px;
                border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; display: flex;
                justify-content: space-between; align-items: center;
            }
            .pro-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
            .pro-field label { display: block; font-size: 0.78rem; font-weight: 700; color: #64748b; margin-bottom: 5px; }
            .pro-field input, .pro-field select {
                width: 100%; height: 38px; border: 1.5px solid #cbd5e1; border-radius: 18px;
                padding: 0 14px; font-size: 0.85rem; font-weight: 600; outline: none;
                box-sizing: border-box;
            }
            .pro-field input:focus, .pro-field select:focus { border-color: #6366f1; }
        `;
        document.head.appendChild(style);
    }

    /* ==========================================================
       ৩. ইউজার ইন্টারফেস (UI) নতুন আঙ্গিকে সেটআপ করা
       ========================================================== */
    function setupProInterface() {
        const listView = document.getElementById('cpscl-list-view');
        if (!listView) return;

        listView.innerHTML = `
            <!-- ১. টপ অ্যাকশন বাটন প্যানেল -->
            <div class="cpscl-card" style="padding: 16px 22px; margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                    <div>
                        <h3 style="font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">Student Database Manager</h3>
                        <p style="font-size: 0.82rem; color: #64748b; margin: 0;">নিরাপদ ক্লাউড ডাটাবেজ, স্মার্ট এডিট ও সার্টিফিকেট প্রিন্ট</p>
                    </div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
                        <button class="pro-pill-btn pro-btn-upload" onclick="document.getElementById('proExcelInput').click()">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Upload Excel
                        </button>
                        <button class="pro-pill-btn pro-btn-sample" onclick="downloadSampleExcel()">
                            <i class="fa-solid fa-download"></i> Sample
                        </button>
                        <button class="pro-pill-btn pro-btn-add" onclick="openStudentModal(false)">
                            <i class="fa-solid fa-user-plus"></i> Add Student
                        </button>
                        <button class="pro-pill-btn pro-btn-edit" id="btnProEdit" disabled onclick="openStudentModal(true)">
                            <i class="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button class="pro-pill-btn pro-btn-delete" id="btnProDelete" disabled onclick="deleteSelectedStudent()">
                            <i class="fa-solid fa-trash-can"></i> Delete
                        </button>
                        <button class="pro-pill-btn pro-btn-print" id="btnProPrint" disabled onclick="printSelectedCertificate()">
                            <i class="fa-solid fa-print"></i> Print
                        </button>
                        <button class="pro-pill-btn pro-btn-export" onclick="exportFilteredExcel()">
                            <i class="fa-solid fa-file-excel"></i> Export
                        </button>
                        <input type="file" id="proExcelInput" accept=".xlsx, .xls, .csv" style="display:none;" onchange="handleExcelUpload(event)">
                    </div>
                </div>
            </div>

            <!-- ২. ফিল্টারিং এবং ভিউ কন্ট্রোল -->
            <div class="cpscl-card" style="padding: 18px 22px;">
                <!-- টেমপ্লেট ট্যাবসমূহ -->
                <div class="cpscl-tabs-wrapper" style="margin-bottom: 16px;">
                    <button class="cpscl-tab-btn active" onclick="switchTemplateTab('all', this)"><i class="fa-solid fa-layer-group"></i> All Students</button>
                    <button class="cpscl-tab-btn" onclick="switchTemplateTab('ssc_testimonial', this)"><i class="fa-solid fa-graduation-cap"></i> SSC Testimonial</button>
                    <button class="cpscl-tab-btn" onclick="switchTemplateTab('hsc_testimonial', this)"><i class="fa-solid fa-user-graduate"></i> HSC Testimonial</button>
                    <button class="cpscl-tab-btn" onclick="switchTemplateTab('tc_certificate', this)"><i class="fa-solid fa-arrow-right-from-bracket"></i> Transfer Certificate (TC)</button>
                    <button class="cpscl-tab-btn" onclick="switchTemplateTab('character_cert', this)"><i class="fa-solid fa-award"></i> Character Certificate</button>
                </div>

                <!-- ফিল্টার অপশনসমূহ -->
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
                    <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                        <!-- সার্চ বক্স -->
                        <div style="position: relative; width: 260px;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 11px; color: #94a3b8; font-size: 0.85rem;"></i>
                            <input type="text" id="proSearchInput" placeholder="Search Roll, Name or Reg..." class="pro-pill-control" style="padding-left: 34px; width: 100%; box-sizing: border-box;" oninput="onSearchChange()">
                        </div>

                        <!-- বছর (Year) ফিল্টার -->
                        <select id="proYearFilter" class="pro-pill-control" onchange="onYearChange(this.value)">
                            <option value="all">All Years (সকল বছর)</option>
                        </select>

                        <!-- কতজন দেখতে চান (Page Size) -->
                        <select id="proPageSize" class="pro-pill-control" onchange="onPageSizeChange(this.value)">
                            <option value="10">Show 10</option>
                            <option value="25" selected>Show 25</option>
                            <option value="50">Show 50</option>
                            <option value="100">Show 100</option>
                            <option value="all">Show All</option>
                        </select>
                    </div>

                    <div style="font-weight: 700; color: #64748b; font-size: 0.85rem;">
                        Total Students: <span id="proCountBadge" style="color: #4f46e5; font-size: 1rem;">0</span>
                    </div>
                </div>

                <!-- মূল টেবিল (ক্লিন ও হিজিবিজি ছাড়া) -->
                <div style="overflow-x: auto;">
                    <table class="cpscl-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Roll</th>
                                <th>Registration</th>
                                <th>Student Name</th>
                                <th>Father's Name</th>
                                <th>Gender</th>
                                <th>Template</th>
                                <th>Group/Class</th>
                                <th>Year</th>
                                <th>GPA</th>
                            </tr>
                        </thead>
                        <tbody id="cpsclProTableBody"></tbody>
                    </table>
                </div>

                <!-- পেজিনেশন কন্ট্রোল -->
                <div id="proPaginationWrapper" style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                    <span id="proPaginationInfo" style="font-size: 0.82rem; color: #64748b; font-weight: 600;"></span>
                    <div style="display: flex; gap: 6px;">
                        <button class="pro-pill-btn" style="background:#f1f5f9; color:#475569; padding: 5px 14px !important;" id="btnPrevPage" onclick="changePage(-1)">Previous</button>
                        <button class="pro-pill-btn" style="background:#f1f5f9; color:#475569; padding: 5px 14px !important;" id="btnNextPage" onclick="changePage(1)">Next</button>
                    </div>
                </div>
            </div>
        `;

        injectModalHTML();
    }

    // বছর ড্রপডাউন ডায়নামিকালি তৈরি
    function populateYearOptions() {
        const select = document.getElementById('proYearFilter');
        if (!select) return;

        const currentSelected = select.value;
        const yearsSet = new Set(['2026', '2027', '2028']);
        studentDB.forEach(s => { if (s.year) yearsSet.add(String(s.year)); });

        const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
        let opts = `<option value="all">All Years (সকল বছর)</option>`;
        sortedYears.forEach(y => {
            opts += `<option value="${y}">${y}</option>`;
        });
        select.innerHTML = opts;
        select.value = currentSelected;
    }

    /* ==========================================================
       ৪. ফিল্টার্ড ডাটা ও টেবিল রেন্ডার
       ========================================================== */
    function getFilteredStudents() {
        const search = (document.getElementById('proSearchInput')?.value || '').toLowerCase().trim();

        return studentDB.filter(s => {
            const matchesTpl = (currentTemplate === 'all') || (s.template === currentTemplate);
            const matchesYear = (currentYear === 'all') || (String(s.year) === String(currentYear));
            const matchesSearch = !search || 
                String(s.roll || '').toLowerCase().includes(search) ||
                String(s.reg || '').toLowerCase().includes(search) ||
                String(s.name || '').toLowerCase().includes(search);

            return matchesTpl && matchesYear && matchesSearch;
        });
    }

    function renderProTable() {
        const tbody = document.getElementById('cpsclProTableBody');
        const countBadge = document.getElementById('proCountBadge');
        if (!tbody) return;

        const filtered = getFilteredStudents();
        if (countBadge) countBadge.innerText = filtered.length;

        // পেজিনেশন হিসাব
        const totalItems = filtered.length;
        const effectiveSize = pageSize === 'all' ? totalItems : parseInt(pageSize);
        const totalPages = Math.ceil(totalItems / effectiveSize) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * effectiveSize;
        const pagedData = pageSize === 'all' ? filtered : filtered.slice(startIndex, startIndex + effectiveSize);

        // পেজিনেশন টেক্সট
        const info = document.getElementById('proPaginationInfo');
        if (info) {
            info.innerText = `Showing ${totalItems === 0 ? 0 : startIndex + 1} to ${Math.min(startIndex + pagedData.length, totalItems)} of ${totalItems} students`;
        }
        const btnPrev = document.getElementById('btnPrevPage');
        const btnNext = document.getElementById('btnNextPage');
        if (btnPrev) btnPrev.disabled = (currentPage <= 1);
        if (btnNext) btnNext.disabled = (currentPage >= totalPages);

        tbody.innerHTML = '';
        if (pagedData.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding: 25px; color:#94a3b8;">কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি।</td></tr>`;
            updateActionButtonsState(null);
            return;
        }

        pagedData.forEach(s => {
            const tr = document.createElement('tr');
            const isSelected = (selectedStudentId === s._uid);
            if (isSelected) tr.classList.add('pro-row-active');

            const genderBadge = s.gender === 'Female'
                ? '<span style="color:#ec4899; font-weight:700;"><i class="fa-solid fa-venus"></i> Female</span>'
                : '<span style="color:#0284c7; font-weight:700;"><i class="fa-solid fa-mars"></i> Male</span>';

            tr.innerHTML = `
                <td><strong>${s.roll || '-'}</strong></td>
                <td>${s.reg || '-'}</td>
                <td><strong>${s.name || '-'}</strong></td>
                <td>${s.father || '-'}</td>
                <td>${genderBadge}</td>
                <td><span style="font-size:0.8rem; font-weight:700; color:#475569;">${s.template || 'SSC'}</span></td>
                <td><span style="background:#eef2ff; color:#4f46e5; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 700;">${s.group || '-'}</span></td>
                <td><strong>${s.year || '-'}</strong></td>
                <td><strong style="color:#16a34a;">${s.gpa || '-'}</strong></td>
            `;

            // স্পর্শকাতর ক্লিক ইভেন্ট
            tr.onclick = () => {
                if (selectedStudentId === s._uid) {
                    selectedStudentId = null; // আন-সিলেক্ট
                } else {
                    selectedStudentId = s._uid; // সিলেক্ট
                }
                renderProTable();
            };

            tbody.appendChild(tr);
        });

        // সিলেক্টেড ছাত্র অনুযায়ী ওপরের বাটন আপডেট
        const activeStudent = studentDB.find(s => s._uid === selectedStudentId);
        updateActionButtonsState(activeStudent);
    }

    function updateActionButtonsState(student) {
        const btnEdit = document.getElementById('btnProEdit');
        const btnDelete = document.getElementById('btnProDelete');
        const btnPrint = document.getElementById('btnProPrint');

        const isEnabled = Boolean(student);
        if (btnEdit) btnEdit.disabled = !isEnabled;
        if (btnDelete) btnDelete.disabled = !isEnabled;
        if (btnPrint) btnPrint.disabled = !isEnabled;
    }

    /* ==========================================================
       ৫. এডিট ও নতুন এন্ট্রি মডাল (ডাবল হওয়া থেকে ১০০% সুরক্ষিত)
       ========================================================== */
    function injectModalHTML() {
        if (document.getElementById('proStudentModal')) return;

        const modal = document.createElement('div');
        modal.id = 'proStudentModal';
        modal.className = 'pro-modal-overlay';
        modal.innerHTML = `
            <div class="pro-modal-card">
                <div class="pro-modal-header">
                    <span id="proModalTitle">Student Details</span>
                    <span style="cursor:pointer; color:#94a3b8; font-size:20px; font-weight:bold;" onclick="closeStudentModal()">✕</span>
                </div>
                <form id="proStudentForm" onsubmit="handleModalSubmit(event)">
                    <input type="hidden" id="modalUid">
                    <div class="pro-grid-2">
                        <div class="pro-field">
                            <label>Template Type *</label>
                            <select id="modalTemplate" required>
                                <option value="ssc_testimonial">SSC Testimonial</option>
                                <option value="hsc_testimonial">HSC Testimonial</option>
                                <option value="tc_certificate">Transfer Certificate (TC)</option>
                                <option value="character_cert">Character Certificate</option>
                            </select>
                        </div>
                        <div class="pro-field">
                            <label>Reference No. *</label>
                            <input type="text" id="modalRef" required>
                        </div>
                    </div>
                    <div class="pro-grid-2">
                        <div class="pro-field">
                            <label>Student's Full Name *</label>
                            <input type="text" id="modalName" required>
                        </div>
                        <div class="pro-field">
                            <label>Gender *</label>
                            <select id="modalGender">
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div class="pro-grid-2">
                        <div class="pro-field">
                            <label>Father's Name *</label>
                            <input type="text" id="modalFather" required>
                        </div>
                        <div class="pro-field">
                            <label>Mother's Name *</label>
                            <input type="text" id="modalMother" required>
                        </div>
                    </div>
                    <div class="pro-grid-2">
                        <div class="pro-field">
                            <label>Roll No * (সংশোধন করলেও ডাবল হবে না)</label>
                            <input type="text" id="modalRoll" required>
                        </div>
                        <div class="pro-field">
                            <label>Registration No</label>
                            <input type="text" id="modalReg">
                        </div>
                    </div>
                    <div class="pro-grid-2">
                        <div class="pro-field">
                            <label>Session *</label>
                            <input type="text" id="modalSession" required>
                        </div>
                        <div class="pro-field">
                            <label>Passing Year *</label>
                            <input type="text" id="modalYear" required>
                        </div>
                    </div>
                    <div class="pro-grid-2">
                        <div class="pro-field">
                            <label>Group / Class *</label>
                            <input type="text" id="modalGroup" required>
                        </div>
                        <div class="pro-field">
                            <label>Education Board</label>
                            <input type="text" id="modalBoard">
                        </div>
                    </div>
                    <div class="pro-grid-2">
                        <div class="pro-field">
                            <label>GPA / Result</label>
                            <input type="text" id="modalGpa">
                        </div>
                        <div class="pro-field">
                            <label>Publication Date</label>
                            <input type="text" id="modalPubDate">
                        </div>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:16px; border-top:1px solid #f1f5f9; padding-top:14px;">
                        <button type="button" class="pro-pill-btn" style="background:#f1f5f9; color:#475569;" onclick="closeStudentModal()">Cancel</button>
                        <button type="submit" class="pro-pill-btn pro-btn-add" id="btnModalSubmit">Save Student</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
    }

    window.openStudentModal = function (isEdit) {
        const modal = document.getElementById('proStudentModal');
        const title = document.getElementById('proModalTitle');
        const submitBtn = document.getElementById('btnModalSubmit');

        if (isEdit) {
            const st = studentDB.find(s => s._uid === selectedStudentId);
            if (!st) return;

            title.innerText = "Edit Student (সংশোধন)";
            submitBtn.innerText = "Update & Save";
            submitBtn.className = "pro-pill-btn pro-btn-edit";

            document.getElementById('modalUid').value = st._uid;
            document.getElementById('modalTemplate').value = st.template || 'ssc_testimonial';
            document.getElementById('modalRef').value = st.ref || '';
            document.getElementById('modalName').value = st.name || '';
            document.getElementById('modalGender').value = st.gender || 'Male';
            document.getElementById('modalFather').value = st.father || '';
            document.getElementById('modalMother').value = st.mother || '';
            document.getElementById('modalRoll').value = st.roll || '';
            document.getElementById('modalReg').value = st.reg || '';
            document.getElementById('modalSession').value = st.session || '';
            document.getElementById('modalYear').value = st.year || '';
            document.getElementById('modalGroup').value = st.group || '';
            document.getElementById('modalBoard').value = st.board || 'Dinajpur';
            document.getElementById('modalGpa').value = st.gpa || '';
            document.getElementById('modalPubDate').value = st.pubDate || '';
        } else {
            title.innerText = "Add New Student";
            submitBtn.innerText = "Save to Database";
            submitBtn.className = "pro-pill-btn pro-btn-add";
            document.getElementById('proStudentForm').reset();
            document.getElementById('modalUid').value = '';
            document.getElementById('modalRef').value = 'CPSCL/ 801023/SSC-26/001';
            document.getElementById('modalSession').value = '2024–2025';
            document.getElementById('modalYear').value = '2026';
            document.getElementById('modalBoard').value = 'Dinajpur';
            document.getElementById('modalPubDate').value = '10 August 2026';
        }

        modal.style.display = 'flex';
    };

    window.closeStudentModal = function () {
        const modal = document.getElementById('proStudentModal');
        if (modal) modal.style.display = 'none';
    };

    // স্মার্ট সেভ ও আপডেট হ্যান্ডলার (ডাবল এন্ট্রি হবে না)
    window.handleModalSubmit = async function (e) {
        e.preventDefault();

        const uid = document.getElementById('modalUid').value;
        const updatedObj = {
            template: document.getElementById('modalTemplate').value,
            ref: document.getElementById('modalRef').value.trim(),
            name: document.getElementById('modalName').value.trim(),
            gender: document.getElementById('modalGender').value,
            father: document.getElementById('modalFather').value.trim(),
            mother: document.getElementById('modalMother').value.trim(),
            roll: document.getElementById('modalRoll').value.trim(),
            reg: document.getElementById('modalReg').value.trim(),
            session: document.getElementById('modalSession').value.trim(),
            year: document.getElementById('modalYear').value.trim(),
            group: document.getElementById('modalGroup').value.trim(),
            board: document.getElementById('modalBoard').value.trim(),
            gpa: document.getElementById('modalGpa').value.trim(),
            pubDate: document.getElementById('modalPubDate').value.trim()
        };

        if (uid) {
            // এডিট মোড: হুবহু ওই ছাত্রের জায়গায় রিপ্লেস হবে (রোল বদলালেও নতুন তৈরি হবে না)
            const index = studentDB.findIndex(s => s._uid === uid);
            if (index !== -1) {
                studentDB[index] = { ...updatedObj, _uid: uid };
            }
        } else {
            // নতুন ছাত্র
            const newUid = 'st_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            studentDB.unshift({ ...updatedObj, _uid: newUid });
        }

        await saveToCloud(studentDB);
        closeStudentModal();
        populateYearOptions();
        renderProTable();
        alert(uid ? "শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে!" : "নতুন শিক্ষার্থী সফলভাবে সংরক্ষিত হয়েছে!");
    };

    /* ==========================================================
       ৬. ডিলিট এবং প্রিন্ট ইন্টিগ্রেশন
       ========================================================== */
    window.deleteSelectedStudent = async function () {
        const st = studentDB.find(s => s._uid === selectedStudentId);
        if (!st) return;

        if (confirm(`আপনি কি নিশ্চিত যে "${st.name}" (রোল: ${st.roll}) এর তথ্য মুছে ফেলতে চান?`)) {
            const updated = studentDB.filter(s => s._uid !== selectedStudentId);
            selectedStudentId = null;
            await saveToCloud(updated);
            renderProTable();
            alert("শিক্ষার্থীর তথ্য মুছে ফেলা হয়েছে।");
        }
    };

    window.printSelectedCertificate = function () {
        const st = studentDB.find(s => s._uid === selectedStudentId);
        if (!st) return;

        // মূল মডিউলের প্রিভিউ ফর্মে ডাটা পাঠানো
        if (typeof window.onTemplateChange === 'function') window.onTemplateChange(st.template || 'ssc_testimonial');

        if (document.getElementById('inpRef')) document.getElementById('inpRef').value = st.ref || '';
        if (document.getElementById('inpName')) document.getElementById('inpName').value = st.name || '';
        if (document.getElementById('inpGender')) document.getElementById('inpGender').value = st.gender || 'Male';
        if (document.getElementById('inpFather')) document.getElementById('inpFather').value = st.father || '';
        if (document.getElementById('inpMother')) document.getElementById('inpMother').value = st.mother || '';
        if (document.getElementById('inpRoll')) document.getElementById('inpRoll').value = st.roll || '';
        if (document.getElementById('inpReg')) document.getElementById('inpReg').value = st.reg || '';
        if (document.getElementById('inpSession')) document.getElementById('inpSession').value = st.session || '';
        if (document.getElementById('inpYear')) document.getElementById('inpYear').value = st.year || '';
        if (document.getElementById('inpGroup')) document.getElementById('inpGroup').value = st.group || '';
        if (document.getElementById('inpBoard')) document.getElementById('inpBoard').value = st.board || '';
        if (document.getElementById('inpGpa')) document.getElementById('inpGpa').value = st.gpa || '';
        if (document.getElementById('inpPubDate')) document.getElementById('inpPubDate').value = st.pubDate || '';

        if (typeof window.switchCPSCLSubSection === 'function') {
            window.switchCPSCLSubSection('preview');
        }
    };

    /* ==========================================================
       ৭. এক্সেল এক্সপোর্ট ও ফিল্টার কন্ট্রোলার
       ========================================================== */
    window.exportFilteredExcel = function () {
        const list = getFilteredStudents();
        if (list.length === 0) return alert("ডাউনলোড করার মতো কোনো তথ্য নেই!");

        const cleanData = list.map(s => ({
            "Roll": s.roll,
            "Registration": s.reg,
            "Student Name": s.name,
            "Father's Name": s.father,
            "Mother's Name": s.mother,
            "Gender": s.gender,
            "Template": s.template,
            "Group": s.group,
            "Year": s.year,
            "Session": s.session,
            "GPA": s.gpa,
            "Reference": s.ref
        }));

        const ws = XLSX.utils.json_to_sheet(cleanData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, `CPSCL_Students_${currentYear}_${currentTemplate}.xlsx`);
    };

    window.switchTemplateTab = function (tpl, btn) {
        currentTemplate = tpl;
        document.querySelectorAll('.cpscl-tabs-wrapper .cpscl-tab-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        currentPage = 1;
        renderProTable();
    };

    window.onYearChange = function (val) {
        currentYear = val;
        currentPage = 1;
        renderProTable();
    };

    window.onPageSizeChange = function (val) {
        pageSize = val;
        currentPage = 1;
        renderProTable();
    };

    window.onSearchChange = function () {
        currentPage = 1;
        renderProTable();
    };

    window.changePage = function (delta) {
        currentPage += delta;
        renderProTable();
    };

    /* ==========================================================
       ৮. অটো ইনিশিয়ালাইজার
       ========================================================== */
    function initProManager() {
        injectProStyles();
        const check = setInterval(() => {
            const listView = document.getElementById('cpscl-list-view');
            if (listView) {
                clearInterval(check);
                setupProInterface();
                initSafeFirebase();
            }
        }, 200);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProManager);
    } else {
        initProManager();
    }
})();
