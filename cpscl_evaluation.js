/**
 * CPSCL Academic Evaluation Module - Bulletproof Multi-Department Manager
 * File: cpscl_evaluation.js
 * Explicit Department Routing & Zero Data Contamination
 * UI: Professional Academic Theme with Tiro Bangla Google Font
 */

(function () {
    // ==========================================================
    // ১. গুগল ফন্ট ও আধুনিক মার্জিত স্টাইল ইনজেকশন
    // ==========================================================
    const evalStyle = document.createElement('style');
    evalStyle.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

        #exam-eval-view, #exam-eval-view *, #evalUploadModal, #evalUploadModal * {
            font-family: 'Tiro Bangla', serif !important;
            box-sizing: border-box;
        }

        /* ১. স্লিম ও কমপ্যাক্ট পরিসংখ্যান রিবন */
        .eval-stats-ribbon {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 12px;
        }
        .eval-stat-item {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-left: 4px solid #94a3b8;
            border-radius: 8px;
            padding: 8px 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            transition: 0.15s ease;
        }
        .eval-stat-item:hover { background: #fbfcfe; border-color: #cbd5e1; }
        .eval-stat-item.active { border-left-color: #1e40af; background: #eff6ff; border-color: #bfdbfe; }
        .eval-stat-title { font-size: 0.72rem; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
        .eval-stat-meta { font-size: 0.68rem; color: #94a3b8; }
        .eval-stat-num { font-size: 1.35rem; font-weight: 700; color: #0f172a; }

        /* ২. মূল কার্ড ও কন্ট্রোল বার */
        .eval-main-box { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.03); }
        .eval-ctrl-bar {
            padding: 8px 14px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            background: #ffffff;
        }
        .eval-tab-group { display: flex; background: #f1f5f9; padding: 3px; border-radius: 6px; gap: 2px; flex-wrap: wrap; }
        .eval-tab-btn {
            border: none; background: transparent; padding: 5px 12px; border-radius: 5px;
            font-size: 0.78rem; font-weight: 600; color: #64748b; cursor: pointer; transition: 0.15s; white-space: nowrap;
        }
        .eval-tab-btn:hover { color: #0f172a; }
        .eval-tab-btn.active { background: #ffffff; color: #1e40af; font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.06); }
        
        .eval-search-wrap { position: relative; width: 220px; }
        .eval-search-wrap i { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; color: #94a3b8; }
        .eval-search-inp { width: 100%; padding: 5px 10px 5px 28px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.78rem; outline: none; }
        .eval-search-inp:focus { border-color: #1e40af; }

        .btn-eval-upload-open {
            background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 5px 12px;
            border-radius: 6px; font-size: 0.78rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: 0.15s;
        }
        .btn-eval-upload-open:hover { background: #dbeafe; }

        /* ৩. মার্জিত টেবিল ও ব্যাজ */
        .eval-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
        .eval-table thead tr { background: #f8fafc; border-bottom: 1.5px solid #cbd5e1; }
        .eval-table th { padding: 8px 12px; text-align: left; font-size: 0.70rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
        .eval-table td { padding: 7px 12px; border-bottom: 1px solid #f1f5f9; color: #0f172a; vertical-align: middle; white-space: nowrap; }
        .eval-table tbody tr:hover { background-color: #f8faff; }

        .sec-sa  { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
        .sec-dh  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
        .sec-sho { background: #f5f3ff; color: #6d28d9; border: 1px solid #ddd6fe; }
        .sec-hum { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
        .sec-bs  { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

        /* ৪. আপলোড মডাল */
        .eval-modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(3px); display: none; align-items: center; justify-content: center; z-index: 999999;
        }
        .eval-modal-card {
            background: #ffffff; border-radius: 14px; width: 100%; max-width: 440px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15); padding: 22px; animation: evalPop 0.2s ease-out;
        }
        @keyframes evalPop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .eval-dropzone {
            border: 2px dashed #93c5fd; border-radius: 10px; background: #f8fafc; padding: 24px 16px;
            text-align: center; cursor: pointer; transition: 0.15s ease; margin-top: 10px;
        }
        .eval-dropzone:hover, .eval-dropzone.dragover { border-color: #1e40af; background: #eff6ff; }
        .btn-eval-upload-now {
            width: 100%; margin-top: 16px; padding: 10px; background: #e2e8f0; color: #94a3b8;
            border: none; border-radius: 8px; font-size: 0.85rem; font-weight: 700; cursor: not-allowed; transition: 0.15s;
        }
        .btn-eval-upload-now.active { background: #1e40af; color: white; cursor: pointer; box-shadow: 0 3px 8px rgba(30,64,175,0.25); }
    `;
    document.head.appendChild(evalStyle);

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
    let currentEvalFilter = 'All';
    let evalChosenFile = null;

    // ==========================================================
    // ২. মডিউল ইনজেকশন ও মূল লেআউট নির্মাণ
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
                    <div class="eval-stats-ribbon">
                        <div class="eval-stat-item active" id="statCardAll" style="border-left-color: #2563eb;" onclick="window.filterEvalByTab('All')">
                            <div>
                                <div class="eval-stat-title">Total Database</div>
                                <div class="eval-stat-meta">Active Records</div>
                            </div>
                            <div class="eval-stat-num" id="statValTotal">0</div>
                        </div>

                        <div class="eval-stat-item" id="statCardSci" style="border-left-color: #4f46e5;" onclick="window.filterEvalByTab('Science')">
                            <div>
                                <div class="eval-stat-title">Science Stream</div>
                                <div class="eval-stat-meta" id="statSciBreakdown">A: 0 | B: 0 | C: 0</div>
                            </div>
                            <div class="eval-stat-num" id="statValSci">0</div>
                        </div>

                        <div class="eval-stat-item" id="statCardHum" style="border-left-color: #d97706;" onclick="window.filterEvalByTab('Humanities')">
                            <div>
                                <div class="eval-stat-title">Humanities</div>
                                <div class="eval-stat-meta">General Arts</div>
                            </div>
                            <div class="eval-stat-num" id="statValHum">0</div>
                        </div>

                        <div class="eval-stat-item" id="statCardBs" style="border-left-color: #059669;" onclick="window.filterEvalByTab('B.Studies')">
                            <div>
                                <div class="eval-stat-title">Business Studies</div>
                                <div class="eval-stat-meta">Commerce Group</div>
                            </div>
                            <div class="eval-stat-num" id="statValBs">0</div>
                        </div>
                    </div>

                    <div class="eval-main-box">
                        <div class="eval-ctrl-bar">
                            <div class="eval-tab-group" id="evalTabButtonsGroup">
                                <button class="eval-tab-btn active" onclick="window.filterEvalByTab('All', this)">All Students (<span id="cntAll">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Science', this)">Science (<span id="cntSci">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Group-A', this)">Group-A (<span id="cntGrpA">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Group-B', this)">Group-B (<span id="cntGrpB">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Group-C', this)">Group-C (<span id="cntGrpC">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('Humanities', this)">Humanities (<span id="cntHum">0</span>)</button>
                                <button class="eval-tab-btn" onclick="window.filterEvalByTab('B.Studies', this)">B.Studies (<span id="cntBs">0</span>)</button>
                            </div>

                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="eval-search-wrap">
                                    <i class="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" id="evalSearchInp" class="eval-search-inp" placeholder="Search ID, Name, Roll..." oninput="window.renderEvalStudents()">
                                </div>
                                <button class="btn-eval-upload-open" onclick="window.openEvalUploadModal()">
                                    <i class="fa-solid fa-cloud-arrow-up"></i> <span>Import Excel</span>
                                </button>
                            </div>
                        </div>

                        <div style="padding: 6px 14px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; font-size: 0.75rem; color: #64748b;">
                            <div>Showing: <strong id="evalShowingCount" style="color: #1e40af;">0</strong> Students in current view</div>
                            <div style="font-size: 0.72rem; color: #94a3b8;">CPSCL Evaluation Module • Live Firebase Sync</div>
                        </div>

                        <div style="overflow-x: auto;">
                            <table class="eval-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px; text-align:center;">SL</th>
                                        <th style="width: 110px;">Student ID</th>
                                        <th>Student Full Name</th>
                                        <th style="width: 60px; text-align:center;">Roll</th>
                                        <th style="width: 70px; text-align:center;">Sec</th>
                                        <th style="width: 120px;">Group</th>
                                        <th style="width: 100px; text-align:center;">Position</th>
                                    </tr>
                                </thead>
                                <tbody id="evalStudentTbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SUB-SECTION 2: EXAM & PIN SETUP -->
                <div id="eval-config-sec" class="eval-sub-sec" style="display: none;">
                    <div class="erp-form-card" style="max-width: 100%; padding: 16px; margin-bottom: 16px; background:#fff; border-radius:10px; border:1px solid #e2e8f0;">
                        <div style="display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;">
                            <div style="flex: 1; min-width: 180px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Exam Name</label>
                                <input type="text" id="evalExTitle" value="${currentExam.title}" class="dcr-filter-input" style="width: 100%;">
                            </div>
                            <div style="width: 140px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Exam Date</label>
                                <input type="text" id="evalExDate" value="${currentExam.date}" class="dcr-filter-input" style="width: 100%;">
                            </div>
                            <div style="width: 110px;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">Full Mark (Per Sub)</label>
                                <input type="number" id="evalExMax" value="${currentExam.max || 15}" class="dcr-filter-input" style="width: 100%;">
                            </div>
                            <button class="dcr-btn-filter" onclick="window.saveEvalExamSettings()"><i class="fa-solid fa-save"></i> Save Settings</button>
                            <button class="dcr-btn-filter" style="background: #0ea5e9;" onclick="window.copyEvalTeacherLink()"><i class="fa-solid fa-link"></i> Copy Teacher Link</button>
                        </div>
                    </div>
                    <div class="table-container" style="background:#fff; border-radius:10px; border:1px solid #e2e8f0; overflow:hidden;">
                        <table class="eval-table">
                            <thead>
                                <tr>
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
                    <div class="erp-form-card no-print" style="max-width: 100%; padding: 14px; margin-bottom: 15px; background:#fff; border-radius:10px; border:1px solid #e2e8f0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <label style="font-size: 0.75rem; font-weight: 700; color: #64748b;">View Group Sheet:</label>
                                <select id="evalTabGroup" class="dcr-filter-input" onchange="window.renderEvalTabulation()">
                                    <option value="Science_Merit">Science (Combined Merit)</option>
                                    <option value="Group-A">Science (Group-A)</option>
                                    <option value="Group-B">Science (Group-B)</option>
                                    <option value="Group-C">Science (Group-C)</option>
                                    <option value="Humanities">Humanities</option>
                                    <option value="B.Studies">Business Studies</option>
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
                            <h4 style="font-size: 0.95rem; font-weight: 700; margin: 3px 0;">Academic Performance Evaluation</h4>
                            <p id="evalPrintMeta" style="font-size: 0.85rem; font-weight: 600; color: #475569; margin: 0;"></p>
                        </div>
                        <div class="table-container" style="border: 1px solid #000; overflow-x: auto;">
                            <table id="evalTabTable" style="width:100%; border-collapse: collapse;">
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

                <!-- ৪. আপলোড ইঞ্জিন মডাল পপ-আপ -->
                <div class="eval-modal-overlay" id="evalUploadModal" onclick="if(event.target === this) window.closeEvalUploadModal()">
                    <div class="eval-modal-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                            <div style="font-size: 1.05rem; font-weight: 700; color: #0f172a;"><i class="fa-solid fa-file-excel text-success"></i> Upload Student List</div>
                            <button style="background:transparent; border:none; font-size:1.1rem; color:#94a3b8; cursor:pointer;" onclick="window.closeEvalUploadModal()"><i class="fa-solid fa-xmark"></i></button>
                        </div>

                        <div style="margin-bottom: 14px;">
                            <label style="font-size: 0.75rem; font-weight: 700; color: #64748b; margin-bottom: 5px; display: block;">Target Stream / Department:</label>
                            <select id="evalUploadTargetGroup" style="width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.82rem; font-weight: 600; outline:none; background:#fff;">
                                <option value="Science">Science (Group-A, B, C)</option>
                                <option value="Humanities">Humanities</option>
                                <option value="B.Studies">Business Studies</option>
                            </select>
                        </div>

                        <div class="eval-dropzone" id="evalDropzone" onclick="document.getElementById('evalExcelFile').click()">
                            <div style="font-size: 2.2rem; color: #f59e0b; margin-bottom: 6px;"><i class="fa-solid fa-folder-open"></i></div>
                            <div style="font-size: 0.82rem; color: #475569; margin-bottom: 8px; font-weight: 600;">Drag & drop files here or</div>
                            <button type="button" style="background:#2563eb; color:white; border:none; padding:6px 18px; border-radius:6px; font-size:0.78rem; font-weight:700; cursor:pointer;" onclick="event.stopPropagation(); document.getElementById('evalExcelFile').click()">Browse</button>
                            <input type="file" id="evalExcelFile" accept=".xlsx, .xls, .csv" style="display: none;" onchange="window.handleEvalFileSelected(this.files[0])">
                        </div>

                        <div id="evalFileStatusBox" style="display:none; align-items:center; justify-content:space-between; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:6px; padding:8px 12px; margin-top:12px; font-size:0.78rem;">
                            <span id="evalSelectedFileName" style="font-weight:700; color:#0f172a; max-width:300px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"></span>
                            <i class="fa-solid fa-circle-check text-success"></i>
                        </div>

                        <button type="button" class="btn-eval-upload-now" id="evalUploadNowBtn" onclick="window.triggerEvalUpload()">Upload Now</button>
                    </div>
                </div>
            `;
            mainWrapper.appendChild(viewDiv);
            setupDropzoneListeners();
        }
    }

    // ==========================================================
    // ৩. ড্রপজোন এবং মডাল হ্যান্ডলার
    // ==========================================================
    window.openEvalUploadModal = function () {
        const modal = document.getElementById('evalUploadModal');
        if (modal) modal.style.display = 'flex';
    };

    window.closeEvalUploadModal = function () {
        const modal = document.getElementById('evalUploadModal');
        if (modal) modal.style.display = 'none';
        evalChosenFile = null;
        const statusBox = document.getElementById('evalFileStatusBox');
        if (statusBox) statusBox.style.display = 'none';
        const btn = document.getElementById('evalUploadNowBtn');
        if (btn) {
            btn.classList.remove('active');
            btn.innerText = 'Upload Now';
        }
    };

    window.handleEvalFileSelected = function (file) {
        if (!file) return;
        evalChosenFile = file;
        const nameEl = document.getElementById('evalSelectedFileName');
        const box = document.getElementById('evalFileStatusBox');
        const btn = document.getElementById('evalUploadNowBtn');

        if (nameEl) nameEl.innerText = file.name;
        if (box) box.style.display = 'flex';
        if (btn) {
            btn.classList.add('active');
            btn.innerText = `Upload Now (${file.name})`;
        }
    };

    window.triggerEvalUpload = function () {
        if (!evalChosenFile) return;
        window.importUniversalExcel({ files: [evalChosenFile], value: '' });
        window.closeEvalUploadModal();
    };

    function setupDropzoneListeners() {
        setTimeout(() => {
            const dz = document.getElementById('evalDropzone');
            if (!dz) return;

            ['dragenter', 'dragover'].forEach(name => {
                dz.addEventListener(name, (e) => {
                    e.preventDefault();
                    dz.classList.add('dragover');
                });
            });

            ['dragleave', 'drop'].forEach(name => {
                dz.addEventListener(name, (e) => {
                    e.preventDefault();
                    dz.classList.remove('dragover');
                });
            });

            dz.addEventListener('drop', (e) => {
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                    window.handleEvalFileSelected(e.dataTransfer.files[0]);
                }
            });
        }, 500);
    }

    // ==========================================================
    // ৪. সাব-সেকশন স্যুইচিং ও মেনু টগল
    // ==========================================================
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
    // ৫. নিরাপদ বিভাগভিত্তিক এক্সেল আপলোডার
    // ==========================================================
    window.importUniversalExcel = function (input) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        const reader = new FileReader();

        const targetGroupEl = document.getElementById('evalUploadTargetGroup');
        const targetGroup = targetGroupEl ? targetGroupEl.value : 'Science';

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
                                if (/^\d{5,8}$/.test(val)) { stdId = val; idIdx = i; break; }
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
                } else if (targetGroup === 'Humanities' || targetGroup === 'B.Studies') {
                    const sheet = wb.Sheets[wb.SheetNames[0]];
                    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                    let autoSl = 1;

                    for (let r of rows) {
                        if (!r || r.length < 4) continue;
                        let stdId = null, idIdx = -1;
                        for (let i = 0; i < r.length; i++) {
                            let val = String(r[i] || '').trim();
                            if (/^\d{5,8}$/.test(val)) { stdId = val; idIdx = i; break; }
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
                                section: targetGroup === 'Humanities' ? 'HUM' : 'BS',
                                group: targetGroup,
                                subGroup: targetGroup,
                                overallRank: sl
                            };
                            count++;
                            autoSl++;
                        }
                    }
                }

                if (count > 0) {
                    const finalMerged = {};
                    studentsList.forEach(s => {
                        if (s.group !== targetGroup) finalMerged[s.id] = s;
                    });
                    Object.keys(newBatch).forEach(id => {
                        finalMerged[id] = newBatch[id];
                    });

                    if (window.writeToFirebase) {
                        await window.writeToFirebase('evaluation_system/students', finalMerged);
                    }

                    studentsList = Object.values(finalMerged);
                    window.renderEvalStudents();

                    if (window.hideLoader) window.hideLoader();
                    alert(`🎉 Success! ${count} records for stream "${targetGroup}" saved successfully!`);
                } else {
                    if (window.hideLoader) window.hideLoader();
                    alert("No valid student IDs found in this file!");
                }

                if (input) input.value = '';

            } catch (err) {
                if (window.hideLoader) window.hideLoader();
                alert("Error importing file: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    // ==========================================================
    // ৬. লাইভ পরিসংখ্যান ও ডাইনামিক টেবিল রেন্ডার
    // ==========================================================
    window.filterEvalByTab = function (filter, btn) {
        currentEvalFilter = filter;
        document.querySelectorAll('.eval-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.eval-stat-item').forEach(b => b.classList.remove('active'));

        if (btn) btn.classList.add('active');
        if (filter === 'All') document.getElementById('statCardAll')?.classList.add('active');
        if (filter === 'Science') document.getElementById('statCardSci')?.classList.add('active');
        if (filter === 'Humanities') document.getElementById('statCardHum')?.classList.add('active');
        if (filter === 'B.Studies') document.getElementById('statCardBs')?.classList.add('active');

        window.renderEvalStudents();
    };

    window.renderEvalStudents = function () {
        const tbody = document.getElementById('evalStudentTbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const total = studentsList.length;
        const sciList = studentsList.filter(s => s.group === 'Science');
        const humList = studentsList.filter(s => s.group === 'Humanities');
        const bsList = studentsList.filter(s => s.group === 'B.Studies');

        const grpA = sciList.filter(s => s.subGroup === 'Group-A').length;
        const grpB = sciList.filter(s => s.subGroup === 'Group-B').length;
        const grpC = sciList.filter(s => s.subGroup === 'Group-C').length;

        // পরিসংখ্যান কার্ড
        if (document.getElementById('statValTotal')) document.getElementById('statValTotal').innerText = total;
        if (document.getElementById('statValSci')) document.getElementById('statValSci').innerText = sciList.length;
        if (document.getElementById('statSciBreakdown')) document.getElementById('statSciBreakdown').innerText = `A: ${grpA} | B: ${grpB} | C: ${grpC}`;
        if (document.getElementById('statValHum')) document.getElementById('statValHum').innerText = humList.length;
        if (document.getElementById('statValBs')) document.getElementById('statValBs').innerText = bsList.length;

        // বাটনের লাইভ কাউন্ট
        if (document.getElementById('cntAll')) document.getElementById('cntAll').innerText = total;
        if (document.getElementById('cntSci')) document.getElementById('cntSci').innerText = sciList.length;
        if (document.getElementById('cntGrpA')) document.getElementById('cntGrpA').innerText = grpA;
        if (document.getElementById('cntGrpB')) document.getElementById('cntGrpB').innerText = grpB;
        if (document.getElementById('cntGrpC')) document.getElementById('cntGrpC').innerText = grpC;
        if (document.getElementById('cntHum')) document.getElementById('cntHum').innerText = humList.length;
        if (document.getElementById('cntBs')) document.getElementById('cntBs').innerText = bsList.length;

        const qEl = document.getElementById('evalSearchInp');
        const q = (qEl ? qEl.value : '').toLowerCase().trim();

        let list = studentsList.filter(s => {
            let mGrp = true;
            if (currentEvalFilter === 'Humanities') mGrp = s.group === 'Humanities';
            else if (currentEvalFilter === 'B.Studies') mGrp = s.group === 'B.Studies';
            else if (currentEvalFilter === 'Science') mGrp = s.group === 'Science';
            else if (['Group-A', 'Group-B', 'Group-C'].includes(currentEvalFilter)) mGrp = s.subGroup === currentEvalFilter;

            let mQ = !q || String(s.id).includes(q) || (s.name || '').toLowerCase().includes(q) || String(s.roll).includes(q);
            return mGrp && mQ;
        });

        if (document.getElementById('evalShowingCount')) {
            document.getElementById('evalShowingCount').innerText = list.length;
        }

        if (list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding: 24px; color: #94a3b8;">No student records found in current view.</td></tr>';
            return;
        }

        list.sort((a, b) => {
            if (a.group !== b.group) return a.group === 'Science' ? -1 : 1;
            return (a.overallRank || a.sl) - (b.overallRank || b.sl);
        });

        list.forEach(s => {
            let secClass = 'sec-sa';
            if (s.section === 'DH') secClass = 'sec-dh';
            else if (s.section === 'SHO') secClass = 'sec-sho';
            else if (s.group === 'Humanities') secClass = 'sec-hum';
            else if (s.group === 'B.Studies') secClass = 'sec-bs';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center; font-weight:700; color:#1e40af;">${s.sl}</td>
                <td><span style="background:#f1f5f9; border:1px solid #e2e8f0; padding:2px 6px; border-radius:4px; font-weight:700; font-size:0.78rem;">${s.id}</span></td>
                <td style="font-weight:600; color:#0f172a;">${s.name}</td>
                <td style="text-align:center; color:#64748b; font-weight:600;">${s.roll}</td>
                <td style="text-align:center;"><span class="${secClass}" style="display:inline-block; font-size:0.68rem; font-weight:700; padding:2px 6px; border-radius:4px; min-width:30px;">${s.section}</span></td>
                <td><span style="background:#f8fafc; border:1px solid #e2e8f0; padding:2px 7px; border-radius:4px; font-size:0.70rem; font-weight:600; color:#334155;">${s.subGroup || s.group}</span></td>
                <td style="text-align:center;"><span style="background:#eff6ff; color:#1d4ed8; border:1px solid #dbeafe; padding:1px 8px; border-radius:10px; font-size:0.70rem; font-weight:700;">Position #${s.overallRank || s.sl}</span></td>
            `;
            tbody.appendChild(tr);
        });
    };

    // ==========================================================
    // ৭. পিন ও শিক্ষক কন্ট্রোল (লাইভ সিঙ্ক)
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
            // গ্রুপভিত্তিক বা সাধারণ পিন উভয়ই চেক করা হচ্ছে
            const p = subjectPins[s.key] || subjectPins[`Group-A_${s.key}`] || subjectPins[`Humanities_${s.key}`] || subjectPins[`B.Studies_${s.key}`] || '';
            
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
                <td><strong style="letter-spacing: 2px; font-size:1.05rem; color:#1e40af;">${p || '----'}</strong></td>
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
            delete subjectPins[`Group-A_${k}`];
            delete subjectPins[`Group-B_${k}`];
            delete subjectPins[`Group-C_${k}`];
            delete subjectPins[`Humanities_${k}`];
            delete subjectPins[`B.Studies_${k}`];
            
            window.renderEvalPins();
            if (window.writeToFirebase) {
                window.writeToFirebase(`evaluation_system/pins/${k}`, null);
                window.writeToFirebase(`evaluation_system/pins/Group-A_${k}`, null);
            }
        }
    };

    window.saveEvalExamSettings = function () {
        currentExam.title = document.getElementById('evalExTitle').value;
        currentExam.date = document.getElementById('evalExDate').value;
        currentExam.max = parseFloat(document.getElementById('evalExMax').value) || 15;
        
        if (window.writeToFirebase) {
            window.writeToFirebase(`evaluation_system/exams/${currentExam.id}`, currentExam);
        }
        alert("Exam settings saved successfully!");
    };

    window.copyEvalTeacherLink = function () {
        const liveTeacherUrl = "https://cpscl.vercel.app";
        navigator.clipboard.writeText(liveTeacherUrl).then(() => {
            alert("Teacher link copied successfully!\n" + liveTeacherUrl);
        });
    };

    // ==========================================================
    // ৮. টেবুলেশন শিট ও লাইভ মেরিট লিস্ট (ডাইনামিক মোট নম্বর)
    // ==========================================================
    window.renderEvalTabulation = function () {
        const grp = document.getElementById('evalTabGroup').value;
        const thead = document.getElementById('evalTabThead');
        const tbody = document.getElementById('evalTabTbody');
        const meta = document.getElementById('evalPrintMeta');
        if (!thead || !tbody) return;

        let activeSubs = SUBJECTS_CONFIG.Science;
        let groupTitle = "Science";

        if (grp === 'Humanities') {
            activeSubs = SUBJECTS_CONFIG.Humanities;
            groupTitle = "Humanities";
        } else if (grp === 'B.Studies') {
            activeSubs = SUBJECTS_CONFIG.BStudies;
            groupTitle = "Business Studies";
        }

        const perSubMax = currentExam.max || 15;
        const streamTotalMarks = activeSubs.length * perSubMax;

        meta.innerText = `Class: Ten (${groupTitle}) • Exam: ${currentExam.title} • Date: ${currentExam.date} • Total: ${streamTotalMarks} Marks`;

        thead.innerHTML = `
            <tr style="background:#f1f5f9;">
                <th style="border:1px solid #000; padding:6px; width:45px; text-align:center;">SL</th>
                <th style="border:1px solid #000; padding:6px; width:75px; text-align:center;">Std ID</th>
                <th style="border:1px solid #000; padding:6px; text-align:left; padding-left:10px;">Student Name</th>
                <th style="border:1px solid #000; padding:6px; width:45px; text-align:center;">Roll</th>
                <th style="border:1px solid #000; padding:6px; width:45px; text-align:center;">Sec</th>
                ${activeSubs.map(s => `<th style="border:1px solid #000; padding:4px; text-align:center;">${s.key}</th>`).join('')}
                <th style="border:1px solid #000; padding:6px; width:75px; background:#e2e8f0; text-align:center;">Total (${streamTotalMarks})</th>
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

        // মেরিট সাজানো (সমান নম্বর হলে রোল দিয়ে টাই-ব্রেক)
        if (grp === 'Science_Merit') {
            computedList.sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                return (a.roll || 0) - (b.roll || 0);
            });
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
                ${activeSubs.map(sb => {
                    const markVal = s.marksObj[sb.key];
                    // নম্বর না দেওয়া থাকলে '-' দেখাবে, আর দেওয়া থাকলে মান দেখাবে
                    const displayMark = markVal !== undefined && markVal !== null && markVal !== '' ? markVal : '-';
                    return `<td style="border:1px solid #000; text-align:center; font-weight:${displayMark !== '-' ? '700' : 'normal'}; color:${displayMark === '0' ? '#dc2626' : 'inherit'};">${displayMark}</td>`;
                }).join('')}
                <td style="border:1px solid #000; text-align:center; font-weight:800; background:#f8fafc; color:#1e40af;">${s.total}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // ==========================================================
    // ৯. ফায়ারবেস ক্লাউড ডেটাবেজ রিয়েল-টাইম লোডার
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

            // রিয়েল-টাইম সিঙ্ক লিসেনার (লাইভ আপডেট)
            import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(({ onValue }) => {
                onValue(window.ref(db, `evaluation_system/marks/${currentExam.id}`), (s) => {
                    examMarks = s.val() || {};
                    window.renderEvalPins();
                    if (document.getElementById('eval-tab-sec') && document.getElementById('eval-tab-sec').style.display !== 'none') {
                        window.renderEvalTabulation();
                    }
                });
                onValue(window.ref(db, 'evaluation_system/pins'), (s) => {
                    subjectPins = s.val() || {};
                    window.renderEvalPins();
                });
                onValue(window.ref(db, 'evaluation_system/students'), (s) => {
                    const d = s.val();
                    if (d) {
                        studentsList = Object.values(d);
                        window.renderEvalStudents();
                    }
                });
            }).catch(() => {});

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
