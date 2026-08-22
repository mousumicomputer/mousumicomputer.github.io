/**
 * CPSCL Module - 100% Calibrated Baseline-to-Baseline Overlay
 * Exact MS Word Match: Multiple 1.8 Line-Height & 10pt After-Spacing
 */

(function () {
    let studentDatabase = JSON.parse(localStorage.getItem('cpscl_students_data') || '[]');

    function initCPSCLModule() {
        const menuList = document.querySelector('.sidebar .menu-list');
        const mainWrapper = document.querySelector('.main-wrapper');

        if (!menuList || !mainWrapper) {
            setTimeout(initCPSCLModule, 100);
            return;
        }

        if (document.getElementById('menu-cpscl-parent')) return;

        /* ==========================================================
           ১. সাইডবার মেনু
           ========================================================== */
        const cpsclMenuItem = document.createElement('li');
        cpsclMenuItem.className = 'menu-item';
        cpsclMenuItem.id = 'menu-cpscl-parent';

        cpsclMenuItem.innerHTML = `
            <a onclick="toggleParentMenu('menu-cpscl-parent')">
                <span class="menu-link-inner">
                    <i class="fa-solid fa-graduation-cap"></i> 
                    <span>CPSCL</span>
                </span>
                <i class="fa-solid fa-chevron-down chevron-icon"></i>
            </a>
            <ul class="submenu-list">
                <li class="submenu-item active" id="sub-cpscl-list">
                    <a onclick="switchCPSCLSubSection('list')">
                        <i class="fa-solid fa-users"></i> <span>Student List</span>
                    </a>
                </li>
                <li class="submenu-item" id="sub-cpscl-entry">
                    <a onclick="switchCPSCLSubSection('entry')">
                        <i class="fa-solid fa-user-plus"></i> <span>Student Entry</span>
                    </a>
                </li>
                <li class="submenu-item" id="sub-cpscl-preview">
                    <a onclick="switchCPSCLSubSection('preview')">
                        <i class="fa-solid fa-print"></i> <span>Certificate Print</span>
                    </a>
                </li>
            </ul>
        `;

        const settingsMenu = document.getElementById('menu-settings-parent');
        if (settingsMenu) {
            menuList.insertBefore(cpsclMenuItem, settingsMenu);
        } else {
            menuList.appendChild(cpsclMenuItem);
        }

        /* ==========================================================
           ২. CPSCL ভিউ প্যানেল (Exact Calibrated Line Height & Spacing)
           ========================================================== */
        const cpsclViewPanel = document.createElement('div');
        cpsclViewPanel.className = 'view-panel';
        cpsclViewPanel.id = 'cpscl-view';

        cpsclViewPanel.innerHTML = `
            <style>
                .cpscl-card {
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    padding: 25px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                    margin-bottom: 20px;
                }
                .cpscl-template-select-box {
                    background: #eef2ff;
                    border: 1.5px solid #c7d2fe;
                    color: #3730a3;
                    font-weight: 700;
                    padding: 8px 14px;
                    border-radius: 10px;
                    outline: none;
                    cursor: pointer;
                }
                .cpscl-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-bottom: 20px;
                }
                .cpscl-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .cpscl-input-group label {
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #475569;
                }
                .cpscl-control {
                    width: 100%;
                    height: 44px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 0 14px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    outline: none;
                    background: #fcfdfe;
                }
                .cpscl-control:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                    background: #fff;
                }

                .excel-dropzone {
                    border: 2px dashed #6366f1;
                    background: #f8faff;
                    border-radius: 14px;
                    padding: 25px;
                    text-align: center;
                    cursor: pointer;
                }
                .excel-dropzone:hover { background: #eef2ff; }

                .cpscl-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 8px;
                }
                .cpscl-table th {
                    padding: 10px 14px;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-align: left;
                }
                .cpscl-table td {
                    background: #ffffff;
                    padding: 12px 14px;
                    border-top: 1px solid #f1f5f9;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.92rem;
                    color: #1e293b;
                }
                .cpscl-table tr td:first-child { border-left: 1px solid #f1f5f9; border-radius: 10px 0 0 10px; }
                .cpscl-table tr td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 10px 10px 0; }

                /* ==========================================================
                   A4 LANDSCAPE EXACT 1:1 CALIBRATED OVERLAY
                   ========================================================== */
                .cpscl-preview-wrapper {
                    background: #525659;
                    padding: 30px 15px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow-x: auto;
                }
                .cpscl-toolbar {
                    width: 297mm;
                    max-width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .cpscl-a4-sheet {
                    background: #ffffff;
                    width: 297mm;
                    height: 210mm;
                    min-height: 210mm;
                    max-height: 210mm;
                    padding-top: 2.1in;
                    padding-right: 1.8in;
                    padding-bottom: 1.4in;
                    padding-left: 2.4in;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                    color: #000000;
                    box-sizing: border-box;
                    position: relative;
                    overflow: hidden;
                }

                /* 1. Reference -> Calibri 13pt */
                .cert-ref, 
                .cert-ref * {
                    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif !important;
                    font-size: 13pt !important;
                    font-weight: 400 !important;
                    font-style: normal !important;
                    color: #000000 !important;
                    line-height: 1.15 !important;
                }
                .cert-ref {
                    margin-bottom: 18pt !important;
                }

                /* 2. Certificate Body -> MS Word Multiple 1.8 Line Spacing & 10pt Spacing After */
                .cert-body-block {
                    width: 100%;
                    box-sizing: border-box;
                }

                .cert-paragraph {
                    text-indent: 0.5in !important;         /* 0.5" Tab / Indentation */
                    text-align: justify !important;        /* MS Word Justified Alignment */
                    line-height: 1.8 !important;           /* MS Word Multiple 1.8 Line Spacing */
                    margin-top: 0pt !important;            /* MS Word Spacing Before 0pt */
                    margin-bottom: 10pt !important;        /* MS Word Spacing After 10pt */
                    word-break: normal !important;
                }

                .cert-body-block,
                .cert-body-block *,
                .cert-paragraph,
                .cert-paragraph span,
                #prevRelation,
                #prevExamName,
                #prevBoard,
                #prevPronoun,
                #prevPronounLower,
                #prevPossessive,
                #prevObjective {
                    font-family: 'Monotype Corsiva', 'Corsiva Hebrew', 'Apple Chancery', cursive, serif !important;
                    font-size: 15pt !important;
                    font-weight: 400 !important;
                    font-style: normal !important;
                    color: #000000 !important;
                }

                /* 3. Variables -> Cambria 15pt Bold Italic */
                .cert-paragraph span.cert-bold,
                .cert-paragraph span.cert-meta-bold,
                #prevName,
                #prevFather,
                #prevMother,
                #prevRoll,
                #prevReg,
                #prevSession,
                #prevYear,
                #prevGroup,
                #prevGpa {
                    font-family: 'Cambria', 'Georgia', serif !important;
                    font-size: 15pt !important;
                    font-weight: 700 !important;
                    font-style: italic !important;
                    color: #000000 !important;
                    letter-spacing: 0px !important;
                }

                /* 4. Publication Date -> Calibri 9pt */
                .cert-footer-date,
                .cert-footer-date *,
                .cert-footer-date span {
                    font-family: 'Calibri', 'Segoe UI', Arial, sans-serif !important;
                    font-size: 9pt !important;
                    font-weight: 400 !important;
                    font-style: normal !important;
                    color: #000000 !important;
                    line-height: 1.2;
                }
                .cert-footer-date {
                    margin-top: 18pt !important;
                }

                /* ==========================================================
                   STRICT A4 LANDSCAPE PRINT RULES
                   ========================================================== */
                @page {
                    size: A4 landscape !important;
                    margin: 0mm !important;
                }

                @media print {
                    @page {
                        size: A4 landscape !important;
                        margin: 0mm !important;
                    }
                    html, body {
                        width: 297mm !important;
                        height: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        overflow: hidden !important;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #cpsclPrintArea, #cpsclPrintArea * {
                        visibility: visible !important;
                    }
                    #cpsclPrintArea {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 297mm !important;
                        height: 210mm !important;
                        max-height: 210mm !important;
                        padding-top: 2.1in !important;
                        padding-right: 1.8in !important;
                        padding-bottom: 1.4in !important;
                        padding-left: 2.4in !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        box-sizing: border-box !important;
                        overflow: hidden !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            </style>

            <!-- ================= ১. স্টুডেন্ট লিস্ট সেকশন ================= -->
            <div id="cpscl-list-view" class="cpscl-sub-view">
                <div class="cpscl-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <h2 style="font-size: 1.3rem; color: #1e293b; font-weight: 800;"><i class="fa-solid fa-file-excel" style="color: #10b981;"></i> Student Excel Import & Database</h2>
                            <p style="font-size: 0.85rem; color: #64748b;">এক্সেল ফাইল আপলোড করে শিক্ষার্থীদের ডাটাবেইজ তৈরি করুন</p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn-submit" onclick="downloadSampleExcel()" style="width: auto; padding: 10px 16px; background: #0284c7; border-radius: 8px; font-size: 0.88rem;">
                                <i class="fa-solid fa-download"></i> স্যাম্পল এক্সেল ডাউনলোড
                            </button>
                            <button class="btn-submit" onclick="switchCPSCLSubSection('entry')" style="width: auto; padding: 10px 18px; background: #4f46e5; border-radius: 8px; font-size: 0.88rem;">
                                <i class="fa-solid fa-user-plus"></i> নতুন শিক্ষার্থী এন্ট্রি
                            </button>
                        </div>
                    </div>

                    <div class="excel-dropzone" onclick="document.getElementById('excelFileInput').click()">
                        <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2.5rem; color: #6366f1; margin-bottom: 8px;"></i>
                        <h4 style="color: #1e293b; font-weight: 700; margin-bottom: 4px;">এক্সেল ফাইল আপলোড করতে এখানে ক্লিক করুন</h4>
                        <p style="font-size: 0.82rem; color: #64748b;">সমর্থিত ফাইল: .xlsx, .xls, .csv</p>
                        <input type="file" id="excelFileInput" accept=".xlsx, .xls, .csv" style="display: none;" onchange="handleExcelUpload(event)">
                    </div>
                </div>

                <div class="cpscl-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <div style="position: relative; width: 320px;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 14px; top: 14px; color: #94a3b8;"></i>
                            <input type="text" id="studentSearchInput" placeholder="রোল, নাম বা রেজি. দিয়ে খুঁজুন..." class="cpscl-control" style="padding-left: 38px;" oninput="renderStudentTable()">
                        </div>
                        <div style="font-weight: 700; color: #64748b;">
                            মোট শিক্ষার্থী: <span id="totalStudentsCount" style="color: #4f46e5; font-size: 1.1rem;">0</span> জন
                            <button onclick="clearAllStudents()" style="margin-left: 15px; background: none; border: none; color: #ef4444; font-weight: 700; cursor: pointer; font-size: 0.85rem;"><i class="fa-solid fa-trash-can"></i> ডাটা ক্লিয়ার করুন</button>
                        </div>
                    </div>

                    <div style="overflow-x: auto;">
                        <table class="cpscl-table">
                            <thead>
                                <tr>
                                    <th>রোল</th>
                                    <th>রেজিস্ট্রেশন</th>
                                    <th>শিক্ষার্থীর নাম</th>
                                    <th>পিতার নাম</th>
                                    <th>গ্রুপ</th>
                                    <th>GPA</th>
                                    <th style="text-align: right;">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody id="studentTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ================= ২. ম্যানুয়াল এন্ট্রি সেকশন ================= -->
            <div id="cpscl-entry-view" class="cpscl-sub-view" style="display:none;">
                <div class="cpscl-card" style="max-width: 900px; margin: 0 auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <h2 style="font-size: 1.3rem; color: #1e293b; font-weight: 800;"><i class="fa-solid fa-pen-to-square" style="color: #4f46e5;"></i> Student Information Entry</h2>
                            <p style="font-size: 0.85rem; color: #64748b;">ম্যানুয়ালি তথ্য ইনপুট দিয়ে প্রশংসাপত্র তৈরি করুন</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <select id="entryTemplateSelect" class="cpscl-template-select-box" onchange="onTemplateChange(this.value)">
                                <option value="ssc_testimonial">SSC Testimonial (এসএসসি প্রশংসাপত্র)</option>
                                <option value="hsc_testimonial">HSC Testimonial (এইচএসসি প্রশংসাপত্র)</option>
                                <option value="tc_certificate">Transfer Certificate - TC (ছাড়পত্র)</option>
                                <option value="character_cert">Character Certificate (চারিত্রিক সনদ)</option>
                            </select>
                        </div>
                    </div>

                    <form id="cpsclEntryForm" onsubmit="event.preventDefault(); saveAndPreviewFromForm();">
                        <div class="cpscl-grid">
                            <div class="cpscl-input-group" style="grid-column: 1 / -1;">
                                <label>Reference No. <span>*</span></label>
                                <input type="text" id="inpRef" class="cpscl-control" value="CPSCL/ 801023/SSC-26/001" required>
                            </div>
                            <div class="cpscl-input-group" style="grid-column: 1 / -1;">
                                <label>Student's Full Name <span>*</span></label>
                                <input type="text" id="inpName" class="cpscl-control" value="K M ANISUJJAMAN MASUM" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Gender <span>*</span></label>
                                <select id="inpGender" class="cpscl-control">
                                    <option value="Male">Male (Son / He / His)</option>
                                    <option value="Female">Female (Daughter / She / Her)</option>
                                </select>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Father's Name <span>*</span></label>
                                <input type="text" id="inpFather" class="cpscl-control" value="MD ASHRAFUL HABIB" required>
                            </div>
                            <div class="cpscl-input-group" style="grid-column: 1 / -1;">
                                <label>Mother's Name <span>*</span></label>
                                <input type="text" id="inpMother" class="cpscl-control" value="MST AKLIMA KHATUN" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Roll No <span>*</span></label>
                                <input type="text" id="inpRoll" class="cpscl-control" value="229083" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Registration No <span>*</span></label>
                                <input type="text" id="inpReg" class="cpscl-control" value="2317722960" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Session <span>*</span></label>
                                <input type="text" id="inpSession" class="cpscl-control" value="2024–2025" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Passing Year <span>*</span></label>
                                <input type="text" id="inpYear" class="cpscl-control" value="2026" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Group <span>*</span></label>
                                <input type="text" id="inpGroup" class="cpscl-control" value="Science" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Education Board <span>*</span></label>
                                <input type="text" id="inpBoard" class="cpscl-control" value="Dinajpur" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>GPA <span>*</span></label>
                                <input type="text" id="inpGpa" class="cpscl-control" value="5.00" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Result Publication Date</label>
                                <input type="text" id="inpPubDate" class="cpscl-control" value="10 August 2026">
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                            <button type="button" class="btn-submit" onclick="switchCPSCLSubSection('list')" style="width: auto; padding: 12px 25px; background: #64748b; border-radius: 10px;">
                                <i class="fa-solid fa-arrow-left"></i> ব্যাক টু লিস্ট
                            </button>
                            <button type="submit" class="btn-submit" style="width: auto; padding: 12px 35px; background: #4f46e5; border-radius: 10px; font-size: 1rem;">
                                <i class="fa-solid fa-file-circle-check"></i> Generate & View Certificate
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ================= ৩. প্রিন্ট ও প্রিভিউ সেকশন ================= -->
            <div id="cpscl-preview-view" class="cpscl-sub-view" style="display:none;">
                <div class="cpscl-preview-wrapper">
                    <div class="cpscl-toolbar">
                        <button class="btn-submit" onclick="switchCPSCLSubSection('list')" style="width: auto; padding: 10px 18px; background: #334155; border-radius: 8px;">
                            <i class="fa-solid fa-arrow-left"></i> Back to Student List
                        </button>
                        
                        <div style="display: flex; align-items: center; gap: 8px; background: #fff; padding: 4px 12px; border-radius: 8px;">
                            <span style="font-size: 0.85rem; font-weight: 700; color: #475569;">Template:</span>
                            <select id="previewTemplateSelect" class="cpscl-template-select-box" style="border: none; background: transparent; padding: 4px 6px;" onchange="onTemplateChange(this.value)">
                                <option value="ssc_testimonial">SSC Testimonial (এসএসসি প্রশংসাপত্র)</option>
                                <option value="hsc_testimonial">HSC Testimonial (এইচএসসি প্রশংসাপত্র)</option>
                                <option value="tc_certificate">Transfer Certificate - TC (ছাড়পত্র)</option>
                                <option value="character_cert">Character Certificate (চারিত্রিক সনদ)</option>
                            </select>
                        </div>

                        <button class="btn-submit" onclick="window.print()" style="width: auto; padding: 10px 25px; background: #22c55e; border-radius: 8px; font-weight: 800; font-size: 1rem;">
                            <i class="fa-solid fa-print"></i> Print / Download PDF
                        </button>
                    </div>

                    <!-- A4 LANDSCAPE SHEET (100% Calibrated Overlay) -->
                    <div class="cpscl-a4-sheet" id="cpsclPrintArea">
                        <div class="cert-ref" id="prevRef">CPSCL/ 801023/SSC-26/001</div>
                        
                        <div class="cert-body-block">
                            <!-- প্যারা ১ -->
                            <p class="cert-paragraph">
                                This is to certify that <span class="cert-bold" id="prevName">K M ANISUJJAMAN MASUM</span>, <span id="prevRelation">son of</span> <span class="cert-bold" id="prevFather">MD ASHRAFUL HABIB</span> and <span class="cert-bold" id="prevMother">MST AKLIMA KHATUN</span> bearing Roll No. <span class="cert-meta-bold" id="prevRoll">229083</span>, Registration No. <span class="cert-meta-bold" id="prevReg">2317722960</span>, Session <span class="cert-meta-bold" id="prevSession">2024–2025</span> passed <span id="prevExamName">Secondary School Certificate Examination</span> in <span class="cert-meta-bold" id="prevYear">2026</span> from <span class="cert-meta-bold" id="prevGroup">Science</span> group under the Board of Intermediate and Secondary Education, <span id="prevBoard">Dinajpur</span> as a regular student of this institution and acquired GPA- <span class="cert-meta-bold" id="prevGpa">5.00</span>.
                            </p>
                            
                            <!-- প্যারা ২ -->
                            <p class="cert-paragraph">
                                <span id="prevPronoun">He</span> bears a good moral character. To the best of my concern, <span id="prevPronounLower">he</span> did not take part in any activity subversive of the state or against discipline during <span id="prevPossessive">his</span> stay at this institution.
                            </p>
                            
                            <!-- প্যারা ৩ -->
                            <p class="cert-paragraph">
                                I wish <span id="prevObjective">him</span> a bright future.
                            </p>
                        </div>

                        <div class="cert-footer-date">
                            [Result Publication Date: <span id="prevPubDate">10 August 2026</span>]
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainWrapper.appendChild(cpsclViewPanel);
        renderStudentTable();
    }

    window.handleExcelUpload = function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    alert("এক্সেল ফাইলে কোনো ডাটা পাওয়া যায়নি!");
                    return;
                }

                const newStudents = jsonData.map((row, index) => {
                    const roll = row['Roll'] || row['রোল'] || (index + 1);
                    return {
                        ref: row['Reference'] || row['Ref'] || row['রেফারেন্স'] || `CPSCL/ 801023/SSC-26/${String(roll).padStart(3, '0')}`,
                        name: row['Student Name'] || row['Name'] || row['নাম'] || 'STUDENT NAME',
                        gender: (row['Gender'] || row['লিঙ্গ'] || 'Male').toString().toLowerCase().startsWith('f') ? 'Female' : 'Male',
                        father: row['Father Name'] || row['Father'] || row['পিতার নাম'] || '',
                        mother: row['Mother Name'] || row['Mother'] || row['মাতার নাম'] || '',
                        roll: roll,
                        reg: row['Registration'] || row['Reg'] || row['রেজিস্ট্রেশন'] || '',
                        session: row['Session'] || row['সেশন'] || '2024–2025',
                        year: row['Passing Year'] || row['Year'] || row['সাল'] || '2026',
                        group: row['Group'] || row['বিভাগ'] || 'Science',
                        board: row['Board'] || row['বোর্ড'] || 'Dinajpur',
                        gpa: row['GPA'] || row['জিপিএ'] || '5.00',
                        pubDate: row['Date'] || row['Publication Date'] || row['তারিখ'] || '10 August 2026'
                    };
                });

                studentDatabase = newStudents;
                localStorage.setItem('cpscl_students_data', JSON.stringify(studentDatabase));
                renderStudentTable();
                alert(`সফলভাবে ${newStudents.length} জন শিক্ষার্থীর তথ্য ইমপোর্ট হয়েছে!`);
            } catch (err) {
                alert("এক্সেল ফাইল রিড করতে সমস্যা হয়েছে: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    window.renderStudentTable = function () {
        const tbody = document.getElementById('studentTableBody');
        const countEl = document.getElementById('totalStudentsCount');
        if (!tbody) return;

        const searchVal = (document.getElementById('studentSearchInput')?.value || '').toLowerCase();
        const filtered = studentDatabase.filter(s => 
            String(s.roll).toLowerCase().includes(searchVal) ||
            String(s.reg).toLowerCase().includes(searchVal) ||
            s.name.toLowerCase().includes(searchVal)
        );

        if (countEl) countEl.innerText = studentDatabase.length;
        tbody.innerHTML = '';

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 25px;">কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি। এক্সেল ফাইল আপলোড করুন।</td></tr>`;
            return;
        }

        filtered.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${s.roll}</strong></td>
                <td>${s.reg || '-'}</td>
                <td><strong style="color:#1e293b;">${s.name}</strong></td>
                <td>${s.father || '-'}</td>
                <td><span style="background:#eef2ff; color:#4f46e5; padding: 3px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;">${s.group}</span></td>
                <td><strong style="color:#16a34a;">${s.gpa}</strong></td>
                <td style="text-align: right;">
                    <button onclick="loadStudentToPrint(${idx})" style="background: #4f46e5; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.85rem;">
                        <i class="fa-solid fa-print"></i> Print Certificate
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.loadStudentToPrint = function (idx) {
        const s = studentDatabase[idx];
        if (!s) return;

        document.getElementById('inpRef').value = s.ref;
        document.getElementById('inpName').value = s.name;
        document.getElementById('inpGender').value = s.gender;
        document.getElementById('inpFather').value = s.father;
        document.getElementById('inpMother').value = s.mother;
        document.getElementById('inpRoll').value = s.roll;
        document.getElementById('inpReg').value = s.reg;
        document.getElementById('inpSession').value = s.session;
        document.getElementById('inpYear').value = s.year;
        document.getElementById('inpGroup').value = s.group;
        document.getElementById('inpBoard').value = s.board;
        document.getElementById('inpGpa').value = s.gpa;
        document.getElementById('inpPubDate').value = s.pubDate;

        switchCPSCLSubSection('preview');
    };

    window.downloadSampleExcel = function () {
        const sampleData = [
            {
                "Reference": "CPSCL/ 801023/SSC-26/001",
                "Roll": 229083,
                "Registration": "2317722960",
                "Student Name": "K M ANISUJJAMAN MASUM",
                "Gender": "Male",
                "Father Name": "MD ASHRAFUL HABIB",
                "Mother Name": "MST AKLIMA KHATUN",
                "Session": "2024–2025",
                "Passing Year": 2026,
                "Group": "Science",
                "Board": "Dinajpur",
                "GPA": 5.00,
                "Publication Date": "10 August 2026"
            }
        ];

        const ws = XLSX.utils.json_to_sheet(sampleData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Students_Demo");
        XLSX.writeFile(wb, "CPSCL_Students_Sample.xlsx");
    };

    window.clearAllStudents = function () {
        if (confirm("আপনি কি নিশ্চিত যে সকল শিক্ষার্থীর তালিকা মুছে ফেলতে চান?")) {
            studentDatabase = [];
            localStorage.removeItem('cpscl_students_data');
            renderStudentTable();
        }
    };

    window.switchCPSCLSubSection = function (sectionType) {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.submenu-item').forEach(s => s.classList.remove('active'));

        const panel = document.getElementById('cpscl-view');
        if (panel) panel.classList.add('active');

        const parentMenu = document.getElementById('menu-cpscl-parent');
        if (parentMenu) parentMenu.classList.add('active');

        const listView = document.getElementById('cpscl-list-view');
        const entryView = document.getElementById('cpscl-entry-view');
        const previewView = document.getElementById('cpscl-preview-view');

        const subList = document.getElementById('sub-cpscl-list');
        const subEntry = document.getElementById('sub-cpscl-entry');
        const subPreview = document.getElementById('sub-cpscl-preview');

        if (listView) listView.style.display = 'none';
        if (entryView) entryView.style.display = 'none';
        if (previewView) previewView.style.display = 'none';

        if (sectionType === 'list') {
            if (listView) listView.style.display = 'block';
            if (subList) subList.classList.add('active');
            document.getElementById('top-title').innerText = "CPSCL - STUDENT LIST";
            renderStudentTable();
        } else if (sectionType === 'entry') {
            if (entryView) entryView.style.display = 'block';
            if (subEntry) subEntry.classList.add('active');
            document.getElementById('top-title').innerText = "CPSCL - STUDENT ENTRY";
        } else {
            updateCertificateData();
            if (previewView) previewView.style.display = 'block';
            if (subPreview) subPreview.classList.add('active');
            document.getElementById('top-title').innerText = "CPSCL - CERTIFICATE PRINT";
        }
    };

    window.onTemplateChange = function (templateVal) {
        const entrySel = document.getElementById('entryTemplateSelect');
        const prevSel = document.getElementById('previewTemplateSelect');
        if (entrySel) entrySel.value = templateVal;
        if (prevSel) prevSel.value = templateVal;

        const examSpan = document.getElementById('prevExamName');
        const refInp = document.getElementById('inpRef');

        if (templateVal === 'hsc_testimonial') {
            if (examSpan) examSpan.innerText = "Higher Secondary Certificate Examination";
            if (refInp && refInp.value.includes('SSC')) refInp.value = refInp.value.replace('SSC', 'HSC');
        } else {
            if (examSpan) examSpan.innerText = "Secondary School Certificate Examination";
            if (refInp && refInp.value.includes('HSC')) refInp.value = refInp.value.replace('HSC', 'SSC');
        }

        updateCertificateData();
    };

    function updateCertificateData() {
        const isMale = document.getElementById('inpGender').value === 'Male';

        document.getElementById('prevRef').innerText = document.getElementById('inpRef').value;
        document.getElementById('prevName').innerText = document.getElementById('inpName').value;
        document.getElementById('prevFather').innerText = document.getElementById('inpFather').value;
        document.getElementById('prevMother').innerText = document.getElementById('inpMother').value;
        document.getElementById('prevRoll').innerText = document.getElementById('inpRoll').value;
        document.getElementById('prevReg').innerText = document.getElementById('inpReg').value;
        document.getElementById('prevSession').innerText = document.getElementById('inpSession').value;
        document.getElementById('prevYear').innerText = document.getElementById('inpYear').value;
        document.getElementById('prevGroup').innerText = document.getElementById('inpGroup').value;
        document.getElementById('prevBoard').innerText = document.getElementById('inpBoard').value;
        document.getElementById('prevGpa').innerText = document.getElementById('inpGpa').value;
        document.getElementById('prevPubDate').innerText = document.getElementById('inpPubDate').value;

        document.getElementById('prevRelation').innerText = isMale ? "son of" : "daughter of";
        document.getElementById('prevPronoun').innerText = isMale ? "He" : "She";
        document.getElementById('prevPronounLower').innerText = isMale ? "he" : "she";
        document.getElementById('prevPossessive').innerText = isMale ? "his" : "her";
        document.getElementById('prevObjective').innerText = isMale ? "him" : "her";
    }

    window.saveAndPreviewFromForm = function () {
        const studentObj = {
            ref: document.getElementById('inpRef').value,
            name: document.getElementById('inpName').value,
            gender: document.getElementById('inpGender').value,
            father: document.getElementById('inpFather').value,
            mother: document.getElementById('inpMother').value,
            roll: document.getElementById('inpRoll').value,
            reg: document.getElementById('inpReg').value,
            session: document.getElementById('inpSession').value,
            year: document.getElementById('inpYear').value,
            group: document.getElementById('inpGroup').value,
            board: document.getElementById('inpBoard').value,
            gpa: document.getElementById('inpGpa').value,
            pubDate: document.getElementById('inpPubDate').value
        };

        const existingIdx = studentDatabase.findIndex(s => s.roll === studentObj.roll);
        if (existingIdx !== -1) {
            studentDatabase[existingIdx] = studentObj;
        } else {
            studentDatabase.unshift(studentObj);
        }

        localStorage.setItem('cpscl_students_data', JSON.stringify(studentDatabase));
        switchCPSCLSubSection('preview');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCPSCLModule);
    } else {
        initCPSCLModule();
    }
})();
