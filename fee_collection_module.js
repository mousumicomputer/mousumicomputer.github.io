/**
 * Mousumi Computer ERP - Education & Digital Services Module
 * Updated Section 3: Exact Excel Columns Header & Real Sample Excel Download Functionality.
 */

(function () {
    // ১. CSS ইনজেক্ট করা
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        #edu-module-container, #edu-module-container * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }

        /* --- SECTION 1 STYLE --- */
        .edu-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            width: 100%;
            max-width: 900px;
            overflow: hidden;
            border: 1px solid #e1e4e8;
            margin: 0 auto;
        }
        .edu-card-header {
            background-color: #34495e;
            color: #ffffff;
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .edu-card-header h2 { font-size: 20px !important; font-weight: 600 !important; margin: 0; }
        .edu-badge { background: #2c3e50; padding: 4px 10px; border-radius: 4px; font-size: 14px !important; color: #bdc3c7; }
        .edu-card-body { padding: 25px; }
        .edu-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .edu-form-group { display: flex; flex-direction: column; }
        .edu-form-group label { font-size: 15px !important; color: #444 !important; margin-bottom: 6px; font-weight: 600 !important; }
        .edu-form-control { padding: 10px 12px; border: 1px solid #cccccc; border-radius: 5px; font-size: 16px !important; outline: none; }
        .edu-form-control[readonly] { background-color: #f8f9fa; color: #6c757d; border-color: #e9ecef; }
        .edu-sub-text { font-size: 13px !important; color: #2563eb !important; margin-top: 5px; font-weight: bold !important; }
        .edu-btn-submit { background-color: #2563eb; color: white !important; border: none; padding: 10px 28px; font-size: 16px !important; font-weight: bold !important; border-radius: 5px; cursor: pointer; }
        .edu-recent-section { margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; }
        .edu-recent-title { font-size: 13px !important; color: #64748b !important; font-weight: bold !important; margin-bottom: 8px; display: flex; justify-content: space-between; }
        .edu-compact-table { width: 100%; border-collapse: collapse; font-size: 13px !important; }
        .edu-compact-table th, .edu-compact-table td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #f1f5f9; }

        /* --- SECTION 2 STYLE --- */
        .all-records-summary {
            background: #ffffff;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            padding: 15px 20px;
            margin-bottom: 20px;
            border-left: 4px solid #2563eb;
            display: inline-block;
        }
        .all-records-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            width: 100%;
            overflow: hidden;
            border: 1px solid #e1e4e8;
        }
        .all-records-header { background: #34495e; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .all-records-header h2 { font-size: 19px !important; margin: 0; }
        .records-table-container { padding: 20px; overflow-x: auto; }
        .records-main-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 13px !important; }
        .records-main-table th { background: #f8fafc; color: #475569; padding: 10px; border: 1px solid #e2e8f0; text-align: center; }
        .records-main-table td { padding: 8px; border: 1px solid #e2e8f0; text-align: center; color: #334155; }

        /* --- SECTION 3 STYLE --- */
        .due-upload-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.04);
            border: 1px solid #e5e7eb;
            padding: 18px 22px;
            margin-bottom: 22px;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        .due-file-wrapper {
            display: flex;
            align-items: center;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            overflow: hidden;
            background: #ffffff;
        }
        .due-file-btn {
            background: #f8fafc;
            border: none;
            border-right: 1px solid #cbd5e1;
            padding: 9px 16px;
            font-size: 14px;
            cursor: pointer;
            color: #1e293b;
            font-weight: 500;
        }
        .due-file-name {
            padding: 9px 15px;
            font-size: 14px;
            color: #475569;
            min-width: 180px;
        }
        .btn-due-upload {
            background: #007bff;
            color: #ffffff !important;
            border: none;
            padding: 9px 18px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn-due-upload:hover { background: #0069d9; }
        .btn-due-sample {
            background: #198754;
            color: #ffffff !important;
            border: none;
            padding: 9px 18px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn-due-sample:hover { background: #157347; }

        .due-data-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.04);
            border: 1px solid #e5e7eb;
            padding: 20px;
        }
        .due-table-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .due-entries-info {
            font-size: 14px;
            color: #475569;
        }
        .due-search-box {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #475569;
        }
        .due-search-input {
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 6px 10px;
            font-size: 14px;
            outline: none;
        }
        .due-table-wrapper {
            overflow-x: auto;
        }
        .due-data-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 1300px;
        }
        .due-data-table th {
            color: #2563eb;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            padding: 12px 14px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
            background: #ffffff;
            white-space: nowrap;
        }
        .due-data-table td {
            padding: 12px 14px;
            color: #334155;
            font-size: 13.5px;
            border-bottom: 1px solid #f1f5f9;
            white-space: nowrap;
        }
        .due-data-table tr:hover td {
            background-color: #f8fafc;
        }

        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ২. সাইডবার মেনু ইনজেক্ট করা
    function injectMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-edu-parent')) return;

        const html = `
            <li class="menu-item" id="menu-edu-parent">
                <a onclick="this.parentElement.classList.toggle('open')">
                    <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>শিক্ষা ও ডিজিটাল সেবা</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon" style="font-size: 0.7rem;"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-form')"><i class="fa-solid fa-angle-right"></i> <span>ফি এন্ট্রি (Fee Entry)</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-records')"><i class="fa-solid fa-angle-right"></i> <span>সকল ফি রেকর্ডস</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-due-data')"><i class="fa-solid fa-angle-right"></i> <span>বকেয়া ডেটা তালিকা (Due Data)</span></a></li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    // ৩. ভিউ প্যানেল ইনজেক্ট করা (সংশোধিত কলাম হেডারসহ)
    function injectPanels() {
        const wrapper = document.querySelector('.main-wrapper');
        if (!wrapper) return;

        const panelsHTML = `
            <div id="edu-module-container">
                <!-- প্যানেল ১: ফি এন্ট্রি ফর্ম -->
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-card">
                        <div class="edu-card-header">
                            <h2>ফি কালেকশন মডিউল (Fee Collection)</h2>
                            <span class="edu-badge">ERP v2.4</span>
                        </div>
                        <div class="edu-card-body">
                            <form id="feeFormOriginal">
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>তারিখ (Date)</label>
                                        <input type="date" id="origDate" class="edu-form-control" required>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>স্টুডেন্ট আইডি (ID)</label>
                                        <input type="text" id="origId" class="edu-form-control" placeholder="আইডি লিখুন" required>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>শিক্ষার্থীর নাম (Student Name)</label>
                                        <input type="text" id="origName" class="edu-form-control" placeholder="শিক্ষার্থীর নাম">
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>বকেয়া (Net Due)</label>
                                        <input type="text" id="origDue" class="edu-form-control" value="0.00" readonly>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>ট্রানজেকশন ফি (Txn Fee)</label>
                                        <input type="number" id="origTxn" class="edu-form-control" value="6.00">
                                        <span class="edu-sub-text">মোট চার্জ (Total Charge): ৳ <span id="origCharge">6.00</span></span>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>গৃহীত মোট টাকা (Net Received)</label>
                                        <input type="number" id="origRec" class="edu-form-control" placeholder="0.00" required>
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>ছাড় (Discount)</label>
                                        <input type="number" id="origDisc" class="edu-form-control" value="0.00">
                                    </div>
                                </div>
                                <div style="display:flex; justify-content:flex-end;">
                                    <button type="submit" class="edu-btn-submit">সাবমিট করুন</button>
                                </div>
                            </form>
                            <div class="edu-recent-section">
                                <div class="edu-recent-title"><span>সর্বশেষ এন্ট্রি (Recent Entries)</span><span>সর্বোচ্চ ৩টি</span></div>
                                <table class="edu-compact-table">
                                    <thead><tr><th>তারিখ</th><th>আইডি</th><th>নাম</th><th>গৃহীত টাকা</th></tr></thead>
                                    <tbody id="origRecentBody"><tr><td colspan="4" style="text-align:center; color:#999; padding:15px;">কোনো রিসেন্ট এন্ট্রি নেই</td></tr></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- প্যানেল ২: সকল ফি রেকর্ডস সেকশন -->
                <div class="view-panel" id="edu-fee-records-view">
                    <div class="all-records-summary">
                        <span>সর্বমোট এন্ট্রি টাকা (Total Received):</span>
                        <strong>৳ <span id="totalFeeSum">0.00</span></strong>
                    </div>
                    <div class="all-records-card">
                        <div class="all-records-header">
                            <h2>সকল জমা হওয়া ফি তালিকা (All Fee Records)</h2>
                            <span style="font-size:12px; opacity:0.7;">Live Data</span>
                        </div>
                        <div class="records-table-container">
                            <table class="records-main-table">
                                <thead>
                                    <tr>
                                        <th>SL</th><th>Date</th><th>Student Name</th><th>Id</th><th>Class</th><th>Month</th>
                                        <th>Category</th><th>Mobile</th><th>Net Due</th><th>Txn Fee</th><th>Total Charge</th>
                                        <th>Net Received</th><th>Gross Payment</th><th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody id="allRecordsTableBody">
                                    <tr><td colspan="14" style="padding:20px; color:#999;">এখনও কোনো ডেটা জমা হয়নি</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- প্যানেল ৩: বকেয়া ডেটা আপলোড ও তালিকা (আপনার দেওয়া এক্সেল হেডার অনুযায়ী) -->
                <div class="view-panel" id="edu-due-data-view">
                    
                    <!-- টপ আপলোড বার -->
                    <div class="due-upload-card">
                        <input type="file" id="dueFileInput" accept=".xlsx, .xls, .csv" style="display: none;">
                        
                        <div class="due-file-wrapper">
                            <button type="button" class="due-file-btn" onclick="document.getElementById('dueFileInput').click()">Choose File</button>
                            <span class="due-file-name" id="dueFileNameDisplay">Student_Data_Sample.xlsx</span>
                        </div>

                        <button type="button" class="btn-due-upload" id="btnUploadDueData">
                            <i class="fa-solid fa-cloud-arrow-up"></i> Upload Data
                        </button>

                        <button type="button" class="btn-due-sample" id="btnDownloadSample">
                            <i class="fa-solid fa-file-excel"></i> Sample Download
                        </button>
                    </div>

                    <!-- নিচের ডেটা টেবিল কার্ড -->
                    <div class="due-data-card">
                        <div class="due-table-toolbar">
                            <div class="due-entries-info" id="dueEntriesInfo">
                                Showing 1 to 3 of 3 entries
                            </div>
                            <div class="due-search-box">
                                <label for="dueTableSearch">Search:</label>
                                <input type="text" id="dueTableSearch" class="due-search-input">
                            </div>
                        </div>

                        <div class="due-table-wrapper">
                            <table class="due-data-table">
                                <thead>
                                    <tr>
                                        <th>Class</th>
                                        <th>Section</th>
                                        <th>STD ID</th>
                                        <th>Student Name</th>
                                        <th>Category</th>
                                        <th>Month Due</th>
                                        <th>Due items</th>
                                        <th>Due Amount</th>
                                        <th>Mobile</th>
                                        <th>Fathers name</th>
                                        <th>Fathers Mobile</th>
                                        <th>Mothers Name</th>
                                        <th>Mothers Mobile</th>
                                    </tr>
                                </thead>
                                <tbody id="dueDataTableBody">
                                    <tr>
                                        <td>Nursery</td>
                                        <td>Dhorola</td>
                                        <td>1400626</td>
                                        <td>MOST NAFISA KHANDOKER</td>
                                        <td>Army</td>
                                        <td>1</td>
                                        <td>Tuition Fee (August-2026)</td>
                                        <td>600</td>
                                        <td>01774258066</td>
                                        <td>MD NABIUL</td>
                                        <td>01774258066</td>
                                        <td>MST DISA KHAN</td>
                                        <td>01748808957</td>
                                    </tr>
                                    <tr>
                                        <td>Nursery</td>
                                        <td>Dhorola</td>
                                        <td>1400726</td>
                                        <td>Sahrish Anaya</td>
                                        <td>Civil</td>
                                        <td>2</td>
                                        <td>Tuition Fee (July-2026 - Aug...</td>
                                        <td>2400</td>
                                        <td>01749492670</td>
                                        <td>Md Shafiullah</td>
                                        <td>01718909989</td>
                                        <td>Jannatul Ferdaus</td>
                                        <td>01749492670</td>
                                    </tr>
                                    <tr>
                                        <td>Nursery</td>
                                        <td>Dhorola</td>
                                        <td>1400826</td>
                                        <td>Afia Sultana Tamanna</td>
                                        <td>Civil</td>
                                        <td>2</td>
                                        <td>Tuition Fee (July-2026 - Aug...</td>
                                        <td>2550</td>
                                        <td>01712550232</td>
                                        <td>Md Abdul Aziz</td>
                                        <td>0171772190</td>
                                        <td>Most Taniya Akte...</td>
                                        <td>01712550232</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', panelsHTML);
    }

    // ৪. ইভেন্ট এবং এক্সেল ডাউনলোড লজিক
    function initLogic() {
        const idInp = document.getElementById('origId');
        const dateInp = document.getElementById('origDate');
        if(dateInp) dateInp.value = new Date().toISOString().split('T')[0];

        if(idInp) {
            idInp.addEventListener('input', function() {
                const val = this.value.trim();
                const customers = window.customers || [];
                const found = customers.find(c => c.id === val || c.phone === val);
                if(found) {
                    document.getElementById('origName').value = found.name;
                    if(window.calculateCustomerCurrentDue) {
                        document.getElementById('origDue').value = window.calculateCustomerCurrentDue(found.id).toFixed(2);
                    }
                }
            });
        }

        const origForm = document.getElementById('feeFormOriginal');
        if(origForm) {
            origForm.onsubmit = async function(e) {
                e.preventDefault();
                const rec = parseFloat(document.getElementById('origRec').value) || 0;
                const txn = parseFloat(document.getElementById('origTxn').value) || 0;
                const studentId = idInp.value;

                if(rec <= 0 || !studentId) return alert("তথ্য সঠিক নয়!");

                showLoader("সংরক্ষণ করা হচ্ছে...");
                const txData = {
                    id: 'EDU-' + Date.now(),
                    customerId: studentId,
                    studentName: document.getElementById('origName').value,
                    credit: rec,
                    netReceived: rec,
                    txnFee: txn,
                    grossPayment: rec + txn,
                    date: dateInp.value,
                    time: new Date().toLocaleTimeString(),
                    type: 'Credit'
                };

                try {
                    if(window.customerTransactions) {
                        window.customerTransactions.push(txData);
                        const db = window.getDatabase();
                        const { ref, set } = window.firebase_database;
                        await set(ref(db, 'transactions'), window.customerTransactions);
                        
                        showToast("ফি জমা হয়েছে!", "success");
                        updateRecent(txData);
                        this.reset();
                        dateInp.value = new Date().toISOString().split('T')[0];
                        renderFullTable();
                    }
                } catch(err) { console.error(err); }
                hideLoader();
            };
        }

        // ফাইল নেম ডিসপ্লে হ্যান্ডলার
        const fileInput = document.getElementById('dueFileInput');
        const fileNameDisplay = document.getElementById('dueFileNameDisplay');
        if(fileInput && fileNameDisplay) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    fileNameDisplay.innerText = this.files[0].name;
                } else {
                    fileNameDisplay.innerText = "Student_Data_Sample.xlsx";
                }
            });
        }

        // নমুনা এক্সেল ডাউনলোড বাটন লজিক (আপনার ছবি অনুযায়ী হুবহু কলাম ও ডেটা)
        const btnSample = document.getElementById('btnDownloadSample');
        if (btnSample) {
            btnSample.addEventListener('click', function() {
                if (typeof XLSX === 'undefined') {
                    alert("Excel Library (SheetJS) লোড হয়নি!");
                    return;
                }

                const sampleData = [
                    ["Class", "Section", "STD ID", "Student Name", "Category", "Month Due", "Due items", "Due Amount", "Mobile", "Fathers name", "Fathers Mobile", "Mothers Name", "Mothers Mobile"],
                    ["Nursery", "Dhorola", "1400626", "MOST NAFISA KHANDOKER", "Army", 1, "Tuition Fee (August-2026)", 600, "01774258066", "MD NABIUL", "01774258066", "MST DISA KHAN", "01748808957"],
                    ["Nursery", "Dhorola", "1400726", "Sahrish Anaya", "Civil", 2, "Tuition Fee (July-2026 - August-2026)", 2400, "01749492670", "Md Shafiullah", "01718909989", "Jannatul Ferdaus", "01749492670"],
                    ["Nursery", "Dhorola", "1400826", "Afia Sultana Tamanna", "Civil", 2, "Tuition Fee (July-2026 - August-2026)", 2550, "01712550232", "Md Abdul Aziz", "0171772190", "Most Taniya Akter", "01712550232"]
                ];

                const ws = XLSX.utils.aoa_to_sheet(sampleData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Sample_Data");
                XLSX.writeFile(wb, "Student_Data_Sample.xlsx");
            });
        }
    }

    function updateRecent(t) {
        const body = document.getElementById('origRecentBody');
        if (!body) return;
        const row = `<tr><td>${t.date}</td><td>${t.customerId}</td><td>${t.studentName || '-'}</td><td>৳ ${t.credit.toFixed(2)}</td></tr>`;
        if(body.innerText.includes("কোনো রিসেন্ট এন্ট্রি নেই")) body.innerHTML = "";
        body.insertAdjacentHTML('afterbegin', row);
        if (body.children.length > 3) body.removeChild(body.lastChild);
    }

    function renderFullTable() {
        const body = document.getElementById('allRecordsTableBody');
        if(!body) return;
        const eduTxs = (window.customerTransactions || []).filter(t => t.id && t.id.startsWith('EDU-'));
        body.innerHTML = '';
        let total = 0;
        eduTxs.reverse().forEach((t, i) => {
            total += (parseFloat(t.netReceived) || 0);
            body.innerHTML += `
                <tr>
                    <td>${eduTxs.length - i}</td><td>${t.date}</td><td>${t.studentName || '-'}</td><td>${t.customerId}</td>
                    <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>${(t.txnFee || 0).toFixed(2)}</td>
                    <td>${(t.txnFee || 0).toFixed(2)}</td><td>${(t.netReceived || 0).toFixed(2)}</td>
                    <td style="color:#2563eb; font-weight:bold;">${(t.grossPayment || 0).toFixed(2)}</td><td>-</td>
                </tr>`;
        });
        const totalFeeSumEl = document.getElementById('totalFeeSum');
        if (totalFeeSumEl) totalFeeSumEl.innerText = total.toLocaleString('en-US', {minimumFractionDigits:2});
    }

    window.addEventListener('load', () => {
        injectMenu();
        injectPanels();
        initLogic();
        setTimeout(renderFullTable, 2000);
    });
})();
