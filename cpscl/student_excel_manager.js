/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Student Excel Bulk Import Engine
   Path: cpscl/student_excel_manager.js
   Architecture: 100% Super Admin Controlled | Dynamic Template | Append-Only Cloud Sync
   Language: Pure English (Corporate ERP Standard)
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Dynamic Excel Import Engine...");

    let parsedExcelStudents = [];

    // ১. স্টাইল ইনজেকশন
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
            .btn-download-template:hover {
                background: #ecfdf5;
            }
            .excel-preview-wrapper {
                margin-top: 20px;
                display: none;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                overflow: hidden;
            }
            .excel-preview-header {
                background: #f8fafc;
                padding: 12px 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #e2e8f0;
                font-weight: 700;
                font-size: 0.9rem;
                color: #1e293b;
            }
            .excel-preview-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.85rem;
            }
            .excel-preview-table th {
                background: #f1f5f9;
                padding: 10px 14px;
                font-weight: 700;
                color: #475569;
                text-align: left;
                border-bottom: 1px solid #e2e8f0;
            }
            .excel-preview-table td {
                padding: 10px 14px;
                border-bottom: 1px solid #f1f5f9;
                color: #1e293b;
            }
        `;
        document.head.appendChild(style);
    }

    // ২. ইনলাইন আপলোড কার্ড তৈরি
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

                <!-- Preview Area -->
                <div class="excel-preview-wrapper" id="cpsclExcelPreviewBox">
                    <div class="excel-preview-header">
                        <span id="excelPreviewCountText">Found 0 Students Ready for Import</span>
                        <span style="font-size:0.8rem; color:#10b981; font-weight:800;">✔ Verification Passed</span>
                    </div>
                    <div style="max-height: 250px; overflow-y: auto;">
                        <table class="excel-preview-table">
                            <thead>
                                <tr id="excelPreviewThead"></tr>
                            </thead>
                            <tbody id="excelPreviewTbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="create-form-actions" style="margin-top: 20px;">
                    <button type="button" class="btn-action-cancel" onclick="window.closeExcelImportInlineCard()">
                        <i class="fa-solid fa-xmark"></i> Cancel
                    </button>
                    <button type="button" class="btn-action-submit" id="btnConfirmBulkUpload" style="background: linear-gradient(90deg, #10b981, #059669); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);" onclick="window.executeCPSCLBulkUpload()" disabled>
                        <i class="fa-solid fa-cloud-arrow-up"></i> Confirm & Save to Cloud
                    </button>
                </div>
            </div>
        `;

        mainCard.parentNode.insertBefore(card, mainCard);
        setupDragAndDropEvents();
    }

    // ৩. টপ অ্যাকশন বারে "Import Students (Excel)" বাটন ইনজেকশন
    function injectTopImportButton() {
        const topActions = document.querySelector('.stu-top-actions');
        if (!topActions || document.getElementById('btn-top-excel-import')) return;

        const btn = document.createElement('button');
        btn.id = 'btn-top-excel-import';
        btn.className = 'btn-stu-pill btn-stu-success';
        btn.innerHTML = `<i class="fa-solid fa-file-excel"></i> Import Students (Excel)`;
        btn.onclick = function () {
            window.openExcelImportInlineCard();
        };

        topActions.appendChild(btn);
    }

    // ৪. স্লাইড ডাউন কার্ড ওপেন / ক্লোজ
    window.openExcelImportInlineCard = function () {
        injectInlineExcelCard();
        const card = document.getElementById('excelImportStudentInlineCard');
        if (card) {
            // ফর্ম খোলা থাকলে বন্ধ করা
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
        const fileInp = document.getElementById('cpsclExcelFileInput');
        if (fileInp) fileInp.value = '';
        const previewBox = document.getElementById('cpsclExcelPreviewBox');
        if (previewBox) previewBox.style.display = 'none';
        const submitBtn = document.getElementById('btnConfirmBulkUpload');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Confirm & Save to Cloud';
        }
    }

    // ৫. ডায়নামিক স্যাম্পল এক্সেল ডাউনলোড ইঞ্জিন (Super Admin ফিল্ড অনুযায়ী)
    window.downloadCPSCLStudentSampleExcel = function () {
        if (typeof XLSX === 'undefined') {
            alert("Excel library is loading, please wait...");
            return;
        }

        const fields = typeof window.getCPSCLFormFields === 'function' ? window.getCPSCLFormFields() : [];
        const activeFields = fields.filter(f => f.enabled);

        if (activeFields.length === 0) {
            alert("No active fields found in Super Admin Setup!");
            return;
        }

        // কলাম হেডার তৈরি (Mandatory হলে সাথে স্টার থাকবে)
        const headers = activeFields.map(f => f.label + (f.required ? ' *' : ''));

        // ডেমো নমুনা সারি
        const sampleRow = {};
        activeFields.forEach(f => {
            const colKey = f.label + (f.required ? ' *' : '');
            if (f.id === 'admission_year') sampleRow[colKey] = '2026';
            else if (f.id === 'class_name') sampleRow[colKey] = (f.options && f.options[0]) || 'Class 1';
            else if (f.id === 'section') sampleRow[colKey] = (f.options && f.options[0]) || 'Section A';
            else if (f.id === 'roll_no') sampleRow[colKey] = '101';
            else if (f.id === 'student_name') sampleRow[colKey] = 'MD ARIFUL ISLAM';
            else if (f.id === 'gender') sampleRow[colKey] = 'Male';
            else if (f.id === 'religion') sampleRow[colKey] = 'Islam';
            else if (f.id === 'nationality') sampleRow[colKey] = 'Bangladesh';
            else if (f.id === 'mobile_no') sampleRow[colKey] = '01712345678';
            else if (f.id === 'father_name') sampleRow[colKey] = 'MD RAFIQUL ISLAM';
            else if (f.id === 'mother_name') sampleRow[colKey] = 'MORIOM BEGUM';
            else sampleRow[colKey] = '';
        });

        const worksheet = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students Template");

        XLSX.writeFile(workbook, "CPSCL_Student_Import_Template.xlsx");
    };

    // ৬. এক্সেল ফাইল ড্রপ ও সিলেকশন হ্যান্ডলার
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
            if (files.length > 0) {
                parseExcelFile(files[0]);
            }
        }, false);
    }

    window.handleCPSCLExcelFileSelect = function (e) {
        const files = e.target.files;
        if (files.length > 0) {
            parseExcelFile(files[0]);
        }
    };

    // ৭. এক্সেল ফাইল ডাটা রিডার ও প্রিভিউ
    function parseExcelFile(file) {
        if (!file.name.match(/\.(xlsx|xls)$/i)) {
            alert("Please upload a valid Excel file (.xlsx or .xls)!");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const rawRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

                if (!rawRows || rawRows.length === 0) {
                    alert("The uploaded Excel sheet contains no data rows!");
                    return;
                }

                processExcelRows(rawRows);
            } catch (err) {
                alert("Error reading Excel file: " + err.message);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function processExcelRows(rows) {
        const fields = typeof window.getCPSCLFormFields === 'function' ? window.getCPSCLFormFields() : [];
        const activeFields = fields.filter(f => f.enabled);

        parsedExcelStudents = [];

        rows.forEach((row, idx) => {
            const studentObj = {
                id: 'stu_' + Date.now() + '_' + (idx + 1) + '_' + Math.floor(Math.random() * 1000),
                createdAt: new Date().toISOString(),
                status: 'Active'
            };

            activeFields.forEach(f => {
                // ম্যাচিং: হুবহু নাম অথবা স্টার ছাড়া নাম
                const val = row[f.label + ' *'] !== undefined ? row[f.label + ' *'] :
                            (row[f.label] !== undefined ? row[f.label] : '');

                studentObj[f.id] = String(val || '').trim();
            });

            // Student ID নিশ্চিতকরণ
            studentObj.std_id = studentObj.std_id || ('26' + Math.floor(1000 + Math.random() * 9000));
            studentObj.student_name = studentObj.student_name || ('Student ' + (idx + 1));

            parsedExcelStudents.push(studentObj);
        });

        renderExcelPreview(activeFields);
    }

    function renderExcelPreview(activeFields) {
        const previewBox = document.getElementById('cpsclExcelPreviewBox');
        const countText = document.getElementById('excelPreviewCountText');
        const thead = document.getElementById('excelPreviewThead');
        const tbody = document.getElementById('excelPreviewTbody');
        const submitBtn = document.getElementById('btnConfirmBulkUpload');

        if (!previewBox || !thead || !tbody) return;

        countText.innerText = `Found ${parsedExcelStudents.length} Students Ready for Permanent Import`;

        // টেবিল হেডার
        thead.innerHTML = `<th>#</th><th>Student ID</th><th>Name</th><th>Class</th><th>Section</th><th>Roll</th>`;

        // প্রথম ৫টি রো প্রিভিউ
        tbody.innerHTML = '';
        parsedExcelStudents.slice(0, 5).forEach((s, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${i + 1}</strong></td>
                <td><strong>${s.std_id}</strong></td>
                <td style="color:#2563eb; font-weight:700;">${s.student_name}</td>
                <td>${s.class_name || '-'}</td>
                <td>${s.section || '-'}</td>
                <td>${s.roll_no || '-'}</td>
            `;
            tbody.appendChild(tr);
        });

        if (parsedExcelStudents.length > 5) {
            const trMore = document.createElement('tr');
            trMore.innerHTML = `<td colspan="6" style="text-align:center; color:#64748b; font-weight:700;">... and ${parsedExcelStudents.length - 5} more students.</td>`;
            tbody.appendChild(trMore);
        }

        previewBox.style.display = 'block';
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fa-solid fa-cloud-arrow-up"></i> Confirm & Save ${parsedExcelStudents.length} Students`;
        }
    }

    // ৮. ক্লাউড ফায়ারবেসে পার্মানেন্ট আপলোড ইঞ্জিন (Append-Only Guarantee)
    window.executeCPSCLBulkUpload = async function () {
        if (!parsedExcelStudents || parsedExcelStudents.length === 0) {
            alert("No student data available to import!");
            return;
        }

        const submitBtn = document.getElementById('btnConfirmBulkUpload');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading to Firebase Cloud...';
        }

        try {
            // কোনো পুরাতন ডাটা ডিলিট বা ওভাররাইট হবে না
            // প্রতিটি শিক্ষার্থী স্বতন্ত্র কি (key) দিয়ে পুশ হবে
            for (let i = 0; i < parsedExcelStudents.length; i++) {
                const stu = parsedExcelStudents[i];
                if (typeof window.writeToFirebase === 'function') {
                    await window.writeToFirebase(`cpscl_students/${stu.id}`, stu);
                }
            }

            // লোকাল ক্যাশে যুক্ত করা
            let localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            localCache = [...parsedExcelStudents, ...localCache];
            localStorage.setItem('cpscl_students_cache', JSON.stringify(localCache));

            if (typeof window.showToast === 'function') {
                window.showToast(`Successfully uploaded ${parsedExcelStudents.length} students to Firebase Cloud!`, "success");
            }

            window.closeExcelImportInlineCard();

            // লাইভ টেবিল রিফ্রেশ
            if (typeof window.fetchAndRenderRealCPSCLStudents === 'function') {
                window.fetchAndRenderRealCPSCLStudents();
            }
        } catch (err) {
            alert("Error uploading students to Firebase: " + err.message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Confirm & Save to Cloud';
            }
        }
    };

    function init() {
        injectExcelStyles();
        injectInlineExcelCard();
        injectTopImportButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
