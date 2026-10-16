/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Student Excel Bulk Import Engine (Permanent Auto-Persistence)
   Path: cpscl/student_excel_manager.js
   Architecture: 100% Super Admin Controlled | Permanent Auto-Seed | Smart ID Engine
   Language: Pure English (Corporate ERP Standard)
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Permanent Excel Import Engine...");

    let parsedExcelStudents = [];
    let currentFilterStatus = 'all';

    // ১. বাটনটিকে মাস্টার কনফিগারেশনে স্থায়ীভাবে যুক্ত ও আজীবন ধরে রাখার লজিক
    function ensureButtonInMasterConfig() {
        try {
            const saved = localStorage.getItem('cpscl_superadmin_master_config');
            let cfg = saved ? JSON.parse(saved) : null;

            if (cfg && Array.isArray(cfg.topButtons)) {
                const btnExists = cfg.topButtons.some(b => b.id === 'btn_excel' || b.label.includes('Import Students'));
                if (!btnExists) {
                    cfg.topButtons.push({
                        id: 'btn_excel',
                        label: 'Import Students (Excel)',
                        icon: 'fa-file-excel',
                        type: 'success',
                        enabled: true
                    });
                    localStorage.setItem('cpscl_superadmin_master_config', JSON.stringify(cfg));
                }
            }
        } catch (e) {
            console.error("Config auto-seed error:", e);
        }
    }

    // মাস্টার কনফিগ হুক (যাতে ক্যাশ মুছে গেলেও বাটন সব সময় জীবিত থাকে)
    const originalGetMasterConfig = window.getCPSCLMasterConfig;
    window.getCPSCLMasterConfig = function () {
        let cfg = typeof originalGetMasterConfig === 'function' ? originalGetMasterConfig() : null;
        if (cfg && Array.isArray(cfg.topButtons)) {
            const hasBtn = cfg.topButtons.some(b => b.id === 'btn_excel' || b.label.includes('Import Students'));
            if (!hasBtn) {
                cfg.topButtons.push({
                    id: 'btn_excel',
                    label: 'Import Students (Excel)',
                    icon: 'fa-file-excel',
                    type: 'success',
                    enabled: true
                });
                try {
                    localStorage.setItem('cpscl_superadmin_master_config', JSON.stringify(cfg));
                } catch(err){}
            }
        }
        return cfg;
    };

    // ২. স্টাইল ইনজেকশন
    function injectExcelStyles() {
        if (document.getElementById('cpscl-excel-import-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-excel-import-styles';
        style.innerHTML = `
            #excelImportStudentInlineCard {
                display: none;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 25px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.04);
                animation: slideDownExcel 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes slideDownExcel {
                from { opacity: 0; transform: translateY(-15px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .excel-ribbon-bar {
                background: linear-gradient(90deg, #10b981, #059669);
                color: #ffffff;
                padding: 14px 22px;
                font-weight: 700;
                font-size: 1.1rem;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
            }
            .excel-content-body { padding: 25px; }
            .excel-drop-zone {
                border: 2px dashed #cbd5e1;
                border-radius: 12px;
                background: #f8fafc;
                padding: 35px 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }
            .excel-drop-zone:hover, .excel-drop-zone.dragover {
                border-color: #10b981;
                background: #f0fdf4;
            }
            .excel-drop-zone i.drop-icon {
                font-size: 42px;
                color: #10b981;
                margin-bottom: 12px;
                display: inline-block;
            }
            .excel-drop-zone h4 {
                font-size: 1.05rem;
                font-weight: 700;
                color: #1e293b;
                margin-bottom: 5px;
            }
            .excel-drop-zone p {
                font-size: 0.85rem;
                color: #64748b;
                margin-bottom: 15px;
            }
            .btn-browse-file {
                padding: 9px 24px;
                background: #10b981;
                color: #ffffff;
                border: none;
                border-radius: 50px;
                font-weight: 700;
                font-size: 0.88rem;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            .btn-browse-file:hover { background: #059669; }
            .btn-download-template {
                background: #ffffff;
                border: 1.5px solid #10b981;
                color: #059669;
                padding: 8px 18px;
                border-radius: 50px;
                font-size: 0.85rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            .btn-download-template:hover { background: #ecfdf5; }

            .excel-preview-wrapper {
                margin-top: 20px;
                display: none;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                overflow: hidden;
            }
            .excel-filter-pills-bar {
                background: #f8fafc;
                padding: 12px 18px;
                display: flex;
                flex-wrap: wrap;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1.5px solid #e2e8f0;
                gap: 10px;
            }
            .pills-group { display: flex; gap: 8px; flex-wrap: wrap; }
            .filter-pill-btn {
                padding: 6px 14px;
                border-radius: 50px;
                border: 1.5px solid #cbd5e1;
                font-size: 0.8rem;
                font-weight: 700;
                cursor: pointer;
                background: #ffffff;
                color: #475569;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: all 0.2s;
            }
            .filter-pill-btn:hover { background: #f1f5f9; }
            .filter-pill-btn.active {
                border-color: #2563eb;
                background: #eff6ff;
                color: #2563eb;
            }
            .filter-pill-btn.pill-danger { border-color: #fca5a5; color: #dc2626; }
            .filter-pill-btn.pill-danger.active { background: #fee2e2; border-color: #dc2626; color: #b91c1c; }
            .filter-pill-btn.pill-warning { border-color: #fde68a; color: #d97706; }
            .filter-pill-btn.pill-warning.active { background: #fef3c7; border-color: #d97706; color: #b45309; }
            .filter-pill-btn.pill-success { border-color: #86efac; color: #16a34a; }
            .filter-pill-btn.pill-success.active { background: #dcfce7; border-color: #16a34a; color: #15803d; }

            .excel-preview-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.86rem;
            }
            .excel-preview-table th {
                background: #f1f5f9;
                padding: 11px 14px;
                font-weight: 800;
                color: #475569;
                text-align: left;
                border-bottom: 1px solid #e2e8f0;
            }
            .excel-preview-table td {
                padding: 11px 14px;
                border-bottom: 1px solid #f1f5f9;
                color: #1e293b;
            }
            .badge-status-pill {
                padding: 4px 10px;
                border-radius: 50px;
                font-size: 0.74rem;
                font-weight: 800;
                display: inline-flex;
                align-items: center;
                gap: 5px;
                text-transform: uppercase;
                letter-spacing: 0.3px;
            }
            .badge-danger-fill { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
            .badge-warning-fill { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }
            .badge-success-fill { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }

            .row-missing-alert { background: #fff5f5 !important; }
            .row-existing-alert { background: #fffdf5 !important; }
        `;
        document.head.appendChild(style);
    }

    // ৩. স্লাইড-ডাউন ইনলাইন প্যানেল
    function injectInlineExcelCard() {
        const view = document.getElementById('trust-cpscl-main-view');
        if (!view || document.getElementById('excelImportStudentInlineCard')) return;

        const mainCard = view.querySelector('.stu-main-card');
        if (!mainCard) return;

        const card = document.createElement('div');
        card.id = 'excelImportStudentInlineCard';
        card.innerHTML = `
            <div class="excel-ribbon-bar">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fa-solid fa-file-excel"></i> <span>Import Students via Excel</span>
                </div>
                <button type="button" class="btn-download-template" onclick="window.downloadCPSCLStudentSampleExcel()">
                    <i class="fa-solid fa-download"></i> Download Sample Sheet (.xlsx)
                </button>
            </div>
            <div class="excel-content-body">
                <div class="excel-drop-zone" id="cpsclExcelDropZone" onclick="document.getElementById('cpsclExcelFileInput').click()">
                    <input type="file" id="cpsclExcelFileInput" accept=".xlsx, .xls" style="display: none;" onchange="window.handleCPSCLExcelFileSelect(event)">
                    <i class="fa-solid fa-cloud-arrow-up drop-icon"></i>
                    <h4>Click to browse or drag & drop student Excel sheet here</h4>
                    <p>Supported formats: Microsoft Excel (.xlsx, .xls)</p>
                    <button type="button" class="btn-browse-file" onclick="event.stopPropagation(); document.getElementById('cpsclExcelFileInput').click();">
                        <i class="fa-solid fa-folder-open"></i> Browse Excel File
                    </button>
                </div>

                <div class="excel-preview-wrapper" id="cpsclExcelPreviewBox">
                    <div class="excel-filter-pills-bar">
                        <div class="pills-group" id="excelFilterPillsGroup"></div>
                        <div style="font-size:0.82rem; font-weight:700; color:#64748b;" id="excelFilterStatusNotice"></div>
                    </div>
                    <div style="max-height: 280px; overflow-y: auto;">
                        <table class="excel-preview-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Class</th>
                                    <th>Section</th>
                                    <th>Roll</th>
                                    <th>Verification Status</th>
                                </tr>
                            </thead>
                            <tbody id="excelPreviewTbody"></tbody>
                        </table>
                    </div>
                </div>

                <div class="create-form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn-action-cancel" onclick="window.closeExcelImportInlineCard()">
                        <i class="fa-solid fa-xmark"></i> Cancel
                    </button>
                    <button type="button" class="btn-action-submit" id="btnConfirmBulkUpload" style="background: linear-gradient(90deg, #10b981, #059669);" onclick="window.executeCPSCLBulkUpload()" disabled>
                        <i class="fa-solid fa-cloud-arrow-up"></i> Confirm & Save to Cloud
                    </button>
                </div>
            </div>
        `;

        mainCard.parentNode.insertBefore(card, mainCard);
        setupDragAndDropEvents();
    }

    // ৪. বাটন ক্লিক হ্যান্ডলার (ডায়নামিক ইভেন্ট ডেলিগেশন)
    function bindExcelButtonEvents() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-stu-pill');
            if (!btn) return;
            const text = btn.innerText.trim();

            if (text.includes('Import') || text.includes('Excel')) {
                e.preventDefault();
                window.openExcelImportInlineCard();
            }
        });
    }

    window.openExcelImportInlineCard = function () {
        injectInlineExcelCard();
        const card = document.getElementById('excelImportStudentInlineCard');
        if (card) {
            if (typeof window.closeCreateStudentInlineForm === 'function') {
                window.closeCreateStudentInlineForm();
            }
            card.style.display = 'block';
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    window.closeExcelImportInlineCard = function () {
        const card = document.getElementById('excelImportStudentInlineCard');
        if (card) card.style.display = 'none';
        resetExcelImportState();
    };

    function resetExcelImportState() {
        parsedExcelStudents = [];
        currentFilterStatus = 'all';
        const fileInp = document.getElementById('cpsclExcelFileInput');
        if (fileInp) fileInp.value = '';
        const previewBox = document.getElementById('cpsclExcelPreviewBox');
        if (previewBox) previewBox.style.display = 'none';
        const submitBtn = document.getElementById('btnConfirmBulkUpload');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.background = '#94a3b8';
            submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Confirm & Save to Cloud';
        }
    }

    // ৫. স্যাম্পল এক্সেল ডাউনলোড
    window.downloadCPSCLStudentSampleExcel = function () {
        if (typeof XLSX === 'undefined') {
            alert("Excel library is still loading, please wait...");
            return;
        }

        const fields = typeof window.getCPSCLFormFields === 'function' ? window.getCPSCLFormFields() : [];
        const activeFields = fields.filter(f => f.enabled);

        if (activeFields.length === 0) {
            alert("No active form fields found in Super Admin Setup!");
            return;
        }

        let headers = ['Student ID *'];
        activeFields.forEach(f => {
            if (f.id !== 'std_id') {
                headers.push(f.label + (f.required ? ' *' : ''));
            }
        });

        const sampleRow = { 'Student ID *': '26101' };
        activeFields.forEach(f => {
            if (f.id !== 'std_id') {
                const colKey = f.label + (f.required ? ' *' : '');
                if (f.id === 'admission_year') sampleRow[colKey] = '2026';
                else if (f.id === 'class_name') sampleRow[colKey] = (f.options && f.options[0]) || 'Class 1';
                else if (f.id === 'section') sampleRow[colKey] = (f.options && f.options[0]) || 'Section A';
                else if (f.id === 'roll_no') sampleRow[colKey] = '101';
                else if (f.id === 'student_name') sampleRow[colKey] = 'MD RABBI HOSEN';
                else if (f.id === 'gender') sampleRow[colKey] = 'Male';
                else if (f.id === 'religion') sampleRow[colKey] = 'Islam';
                else if (f.id === 'nationality') sampleRow[colKey] = 'Bangladesh';
                else if (f.id === 'mobile_no') sampleRow[colKey] = '01712345678';
                else sampleRow[colKey] = '';
            }
        });

        const worksheet = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students Template");
        XLSX.writeFile(workbook, "CPSCL_Student_Import_Template.xlsx");
    };

    // ৬. ড্র্যাগ অ্যান্ড ড্রপ ইভেন্ট
    function setupDragAndDropEvents() {
        const dropZone = document.getElementById('cpsclExcelDropZone');
        if (!dropZone) return;

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.remove('dragover');
            }, false);
        });

        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) parseExcelFile(files[0]);
        }, false);
    }

    window.handleCPSCLExcelFileSelect = function (e) {
        const files = e.target.files;
        if (files.length > 0) parseExcelFile(files[0]);
    };

    // ফায়ারবেস থেকে আগের সংরক্ষিত শিক্ষার্থী ডাটাবেস চেক করা
    async function getExistingStudentsFromCloud() {
        const map = new Map();
        try {
            if (window.getDatabase && window.ref && window.get) {
                const db = window.getDatabase();
                const stuRef = window.ref(db, 'cpscl_students');
                const snapshot = await window.get(stuRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    Object.values(data).forEach(s => {
                        if (s && s.std_id) {
                            map.set(String(s.std_id).trim(), s);
                        }
                    });
                    return map;
                }
            }
        } catch (e) {
            console.warn("Using local cache fallback:", e);
        }

        const localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
        localCache.forEach(s => {
            if (s && s.std_id) {
                map.set(String(s.std_id).trim(), s);
            }
        });
        return map;
    }

    // ৭. এক্সেল ফাইল রিডিং ও ভ্যালিডেশন ইঞ্জিন
    async function parseExcelFile(file) {
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            alert("Please upload a valid Excel file (.xlsx or .xls)!");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

                if (!rawRows || rawRows.length === 0) {
                    alert("Uploaded Excel sheet contains no student records!");
                    return;
                }

                await processAndValidateExcelRows(rawRows);
            } catch (err) {
                alert("Error reading Excel file: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    async function processAndValidateExcelRows(rows) {
        const fields = typeof window.getCPSCLFormFields === 'function' ? window.getCPSCLFormFields() : [];
        const activeFields = fields.filter(f => f.enabled);
        const existingCloudStudents = await getExistingStudentsFromCloud();

        parsedExcelStudents = [];
        const seenInSheet = new Set();

        let missingCount = 0;
        let existingCount = 0;
        let newCount = 0;

        rows.forEach((row, idx) => {
            const studentObj = {
                id: 'stu_' + Date.now() + '_' + (idx + 1) + '_' + Math.floor(Math.random() * 1000),
                createdAt: new Date().toISOString(),
                status: 'Active'
            };

            activeFields.forEach(f => {
                const val = row[f.label + ' *'] !== undefined ? row[f.label + ' *'] :
                            (row[f.label] !== undefined ? row[f.label] : '');
                studentObj[f.id] = String(val !== undefined && val !== null ? val : '').trim();
            });

            // Student ID খুঁজে বের করা
            const explicitId = row['Student ID *'] || row['Student ID'] || row['std_id'] || studentObj.std_id || '';
            const stdIdClean = String(explicitId).trim();
            studentObj.std_id = stdIdClean;
            studentObj.student_name = studentObj.student_name || row['Name *'] || row['Name'] || ('Row ' + (idx + 2));

            // ভ্যালিডেশন
            if (!stdIdClean || stdIdClean === '' || stdIdClean.toLowerCase() === 'undefined') {
                studentObj.validationStatus = 'missing';
                missingCount++;
            } else if (existingCloudStudents.has(stdIdClean)) {
                studentObj.validationStatus = 'existing';
                const oldRec = existingCloudStudents.get(stdIdClean);
                studentObj.existingTargetId = oldRec.id;
                existingCount++;
            } else if (seenInSheet.has(stdIdClean)) {
                studentObj.validationStatus = 'existing';
                existingCount++;
            } else {
                studentObj.validationStatus = 'new';
                seenInSheet.add(stdIdClean);
                newCount++;
            }

            parsedExcelStudents.push(studentObj);
        });

        // সংক্ষিপ্ত টোস্ট
        if (typeof window.showToast === 'function') {
            if (missingCount > 0) {
                window.showToast(`Alert: ${missingCount} student(s) have Missing ID! Upload blocked.`, "error");
            } else if (existingCount > 0) {
                window.showToast(`Notice: ${existingCount} student(s) already exist (will overwrite/update).`, "warning");
            } else {
                window.showToast(`Success: All ${newCount} students verified and ready!`, "success");
            }
        }

        renderFilterPills(missingCount, existingCount, newCount);
        renderExcelPreviewTable();
        updateSaveButtonState(missingCount, existingCount, newCount);
    }

    // ৮. ফিল্টার পিলস
    function renderFilterPills(missingCount, existingCount, newCount) {
        const pillsGroup = document.getElementById('excelFilterPillsGroup');
        const statusNotice = document.getElementById('excelFilterStatusNotice');
        if (!pillsGroup) return;

        const total = parsedExcelStudents.length;

        pillsGroup.innerHTML = `
            <button type="button" class="filter-pill-btn ${currentFilterStatus === 'all' ? 'active' : ''}" onclick="window.filterExcelPreview('all')">
                All Students (${total})
            </button>
            <button type="button" class="filter-pill-btn pill-danger ${currentFilterStatus === 'missing' ? 'active' : ''}" onclick="window.filterExcelPreview('missing')">
                <i class="fa-solid fa-circle-exclamation"></i> Missing ID (${missingCount})
            </button>
            <button type="button" class="filter-pill-btn pill-warning ${currentFilterStatus === 'existing' ? 'active' : ''}" onclick="window.filterExcelPreview('existing')">
                <i class="fa-solid fa-arrows-rotate"></i> Existing / Overwrite (${existingCount})
            </button>
            <button type="button" class="filter-pill-btn pill-success ${currentFilterStatus === 'new' ? 'active' : ''}" onclick="window.filterExcelPreview('new')">
                <i class="fa-solid fa-circle-check"></i> New Entry (${newCount})
            </button>
        `;

        if (statusNotice) {
            if (missingCount > 0) {
                statusNotice.innerHTML = `<span style="color:#dc2626;"><i class="fa-solid fa-lock"></i> Fix ${missingCount} missing ID(s) to unlock upload</span>`;
            } else if (existingCount > 0) {
                statusNotice.innerHTML = `<span style="color:#d97706;"><i class="fa-solid fa-triangle-exclamation"></i> Overwrite mode enabled</span>`;
            } else {
                statusNotice.innerHTML = `<span style="color:#16a34a;"><i class="fa-solid fa-check-double"></i> 100% Ready to save</span>`;
            }
        }
    }

    window.filterExcelPreview = function (status) {
        currentFilterStatus = status;
        document.querySelectorAll('.filter-pill-btn').forEach(btn => btn.classList.remove('active'));

        const targetBtn = Array.from(document.querySelectorAll('.filter-pill-btn')).find(b => {
            if (status === 'all') return b.innerText.includes('All Students');
            if (status === 'missing') return b.innerText.includes('Missing ID');
            if (status === 'existing') return b.innerText.includes('Existing');
            if (status === 'new') return b.innerText.includes('New Entry');
            return false;
        });
        if (targetBtn) targetBtn.classList.add('active');

        renderExcelPreviewTable();
    };

    // ৯. প্রিভিউ টেবিল
    function renderExcelPreviewTable() {
        const previewBox = document.getElementById('cpsclExcelPreviewBox');
        const tbody = document.getElementById('excelPreviewTbody');
        if (!previewBox || !tbody) return;

        tbody.innerHTML = '';

        const filteredList = parsedExcelStudents.filter(s => {
            if (currentFilterStatus === 'all') return true;
            return s.validationStatus === currentFilterStatus;
        });

        if (filteredList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#94a3b8;">No records found for this filter.</td></tr>`;
            previewBox.style.display = 'block';
            return;
        }

        filteredList.forEach((s, i) => {
            const tr = document.createElement('tr');

            let badgeHtml = '';
            let rowClass = '';
            let idDisplay = s.std_id;

            if (s.validationStatus === 'missing') {
                rowClass = 'row-missing-alert';
                idDisplay = '<span style="color:#dc2626; font-weight:800;"><i class="fa-solid fa-circle-xmark"></i> Empty</span>';
                badgeHtml = '<span class="badge-status-pill badge-danger-fill"><i class="fa-solid fa-triangle-exclamation"></i> Missing ID</span>';
            } else if (s.validationStatus === 'existing') {
                rowClass = 'row-existing-alert';
                idDisplay = `<strong>${s.std_id}</strong>`;
                badgeHtml = '<span class="badge-status-pill badge-warning-fill"><i class="fa-solid fa-arrows-rotate"></i> Overwrites Old</span>';
            } else {
                idDisplay = `<strong>${s.std_id}</strong>`;
                badgeHtml = '<span class="badge-status-pill badge-success-fill"><i class="fa-solid fa-check"></i> New Student</span>';
            }

            tr.className = rowClass;
            tr.innerHTML = `
                <td><strong>${i + 1}</strong></td>
                <td>${idDisplay}</td>
                <td style="color:#2563eb; font-weight:700;">${s.student_name}</td>
                <td>${s.class_name || '-'}</td>
                <td>${s.section || '-'}</td>
                <td>${s.roll_no || '-'}</td>
                <td>${badgeHtml}</td>
            `;
            tbody.appendChild(tr);
        });

        previewBox.style.display = 'block';
    }

    // ১০. সেভ বাটন কন্ট্রোল
    function updateSaveButtonState(missingCount, existingCount, newCount) {
        const submitBtn = document.getElementById('btnConfirmBulkUpload');
        if (!submitBtn) return;

        if (missingCount > 0) {
            submitBtn.disabled = true;
            submitBtn.style.background = '#dc2626';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.style.boxShadow = 'none';
            submitBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Cannot Save: Fix ${missingCount} Missing ID(s) First`;
        } else if (existingCount > 0) {
            submitBtn.disabled = false;
            submitBtn.style.background = 'linear-gradient(90deg, #d97706, #b45309)';
            submitBtn.style.cursor = 'pointer';
            submitBtn.style.boxShadow = '0 4px 15px rgba(217, 119, 6, 0.3)';
            submitBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Save & Update (${existingCount} Overwrite, ${newCount} New)`;
        } else {
            submitBtn.disabled = false;
            submitBtn.style.background = 'linear-gradient(90deg, #10b981, #059669)';
            submitBtn.style.cursor = 'pointer';
            submitBtn.style.boxShadow = '0 4px 15px rgba(16, 185, 129, 0.3)';
            submitBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Confirm & Save All ${newCount} Students`;
        }
    }

    // ১১. ক্লাউড ফায়ারবেসে পার্মানেন্ট সেভ
    window.executeCPSCLBulkUpload = async function () {
        if (!parsedExcelStudents || parsedExcelStudents.length === 0) return;

        const hasMissing = parsedExcelStudents.some(s => s.validationStatus === 'missing');
        if (hasMissing) {
            alert("Upload rejected: Please assign Student IDs to all rows before uploading.");
            return;
        }

        const submitBtn = document.getElementById('btnConfirmBulkUpload');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Firebase Cloud...';
        }

        try {
            for (let i = 0; i < parsedExcelStudents.length; i++) {
                const stu = parsedExcelStudents[i];
                const targetCloudKey = stu.existingTargetId || stu.id;

                const payload = { ...stu };
                delete payload.validationStatus;
                delete payload.existingTargetId;

                payload.id = targetCloudKey;
                payload.updatedAt = new Date().toISOString();

                if (typeof window.writeToFirebase === 'function') {
                    await window.writeToFirebase(`cpscl_students/${targetCloudKey}`, payload);
                }
            }

            let localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            parsedExcelStudents.forEach(newStu => {
                const cleanObj = { ...newStu };
                delete cleanObj.validationStatus;
                delete cleanObj.existingTargetId;

                const existIdx = localCache.findIndex(c => String(c.std_id).trim() === String(cleanObj.std_id).trim());
                if (existIdx !== -1) {
                    localCache[existIdx] = cleanObj;
                } else {
                    localCache.unshift(cleanObj);
                }
            });
            localStorage.setItem('cpscl_students_cache', JSON.stringify(localCache));

            if (typeof window.showToast === 'function') {
                window.showToast(`Successfully processed ${parsedExcelStudents.length} student records in Firebase!`, "success");
            }

            window.closeExcelImportInlineCard();

            if (typeof window.fetchAndRenderRealCPSCLStudents === 'function') {
                window.fetchAndRenderRealCPSCLStudents();
            }
        } catch (err) {
            alert("Error saving students to Firebase: " + err.message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
            }
        }
    };

    function init() {
        ensureButtonInMasterConfig();
        injectExcelStyles();
        bindExcelButtonEvents();

        // লাইভ স্ক্রিন রেন্ডার যাতে বাটনটি সাথে সাথে দৃশ্যমান হয়
        if (typeof window.renderDynamicStudentScreen === 'function') {
            window.renderDynamicStudentScreen();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 150);
    }
})();
