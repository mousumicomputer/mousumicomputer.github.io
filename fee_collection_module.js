/**
 * Mousumi Computer ERP - Education & Digital Services Module
 * 100% Standalone - No changes needed in admin.html.
 * Auto-detects logged-in Firebase Admin session for seamless cross-device sync.
 */

(function () {
    let studentDueList = [];
    let firebaseCore = null;

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
            gap: 12px;
        }
        .due-entries-info {
            font-size: 14px;
            color: #475569;
            font-weight: 600;
        }
        .btn-due-refresh {
            background: #eef2ff;
            color: #4f46e5 !important;
            border: 1px solid #c7d2fe;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: 0.2s;
        }
        .btn-due-refresh:hover {
            background: #e0e7ff;
            border-color: #a5b4fc;
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

    // ২. স্বয়ংক্রিয় Firebase কানেক্টর (মূল কোডে কোনো হাত না দিয়ে)
    async function getFirebase() {
        if (firebaseCore) return firebaseCore;
        try {
            const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const fbDb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            // admin.html এর ইনিশিয়ালাইজেশনের জন্য অপেক্ষা
            let app;
            for (let i = 0; i < 20; i++) {
                try {
                    app = fbApp.getApp();
                    if (app) break;
                } catch (e) {}
                await new Promise(r => setTimeout(r, 200));
            }

            if (!app) {
                // ফলব্যাক কনফিগারেশন
                app = fbApp.initializeApp({
                    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                    projectId: "mousumi-computer"
                }, "feeModuleApp_" + Date.now());
            }

            const db = fbDb.getDatabase(app);
            firebaseCore = {
                db: db,
                ref: fbDb.ref,
                set: fbDb.set,
                onValue: fbDb.onValue,
                get: fbDb.get
            };
            return firebaseCore;
        } catch (err) {
            console.error("Firebase connection error:", err);
            return null;
        }
    }

    // ৩. সাইডবার মেনু ইনজেক্ট করা
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

    // ৪. ভিউ প্যানেল ইনজেক্ট করা
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

                <!-- প্যানেল ৩: বকেয়া ডেটা আপলোড ও তালিকা -->
                <div class="view-panel" id="edu-due-data-view">
                    
                    <!-- টপ আপলোড বার -->
                    <div class="due-upload-card">
                        <input type="file" id="dueFileInput" accept=".xlsx, .xls, .csv" style="display: none;">
                        
                        <div class="due-file-wrapper">
                            <button type="button" class="due-file-btn" onclick="document.getElementById('dueFileInput').click()">Choose File</button>
                            <span class="due-file-name" id="dueFileNameDisplay">No file chosen</span>
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
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <div class="due-entries-info" id="dueEntriesInfo">
                                    Showing 0 of 0 entries
                                </div>
                                <button type="button" class="btn-due-refresh" id="btnRefreshDueData" title="লাইভ ডেটা রিফ্রেশ করুন">
                                    <i class="fa-solid fa-arrows-rotate"></i> রিফ্রেশ
                                </button>
                            </div>
                            <div class="due-search-box">
                                <label for="dueTableSearch">Search:</label>
                                <input type="text" id="dueTableSearch" class="due-search-input" placeholder="যেকোনো তথ্য দিয়ে খুঁজুন...">
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
                                    <tr><td colspan="13" style="text-align: center; color: #94a3b8; padding: 25px;">কোনো ডেটা লোড করা হয়নি। এক্সেল ফাইল আপলোড করুন।</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', panelsHTML);
    }

    // ৫. টেবিল রেন্ডার ফাংশন
    function renderDueDataTable(listToRender) {
        const tbody = document.getElementById('dueDataTableBody');
        const entriesInfo = document.getElementById('dueEntriesInfo');
        if (!tbody) return;

        const totalCount = studentDueList.length;
        const currentCount = (listToRender || []).length;

        if (entriesInfo) {
            entriesInfo.innerText = `Showing 1 to ${currentCount} of ${totalCount} entries`;
        }

        if (currentCount === 0) {
            tbody.innerHTML = `<tr><td colspan="13" style="text-align: center; color: #94a3b8; padding: 25px;">কোনো রেকর্ড পাওয়া যায়নি। এক্সেল ফাইল আপলোড করুন।</td></tr>`;
            return;
        }

        let html = '';
        listToRender.forEach(item => {
            html += `
                <tr>
                    <td>${item.class || '-'}</td>
                    <td>${item.section || '-'}</td>
                    <td><strong>${item.stdId || '-'}</strong></td>
                    <td>${item.studentName || '-'}</td>
                    <td>${item.category || '-'}</td>
                    <td>${item.monthDue || '-'}</td>
                    <td>${item.dueItems || '-'}</td>
                    <td style="font-weight: bold; color: #e11d48;">${item.dueAmount || 0}</td>
                    <td>${item.mobile || '-'}</td>
                    <td>${item.fathersName || '-'}</td>
                    <td>${item.fathersMobile || '-'}</td>
                    <td>${item.mothersName || '-'}</td>
                    <td>${item.mothersMobile || '-'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    // ৬. লাইভ ফায়ারবেস লিসেনার (Cross-device realtime sync)
    async function listenFirebaseData() {
        const fb = await getFirebase();
        if (!fb) return;

        const dueRef = fb.ref(fb.db, 'erp/studentDueData');
        fb.onValue(dueRef, (snapshot) => {
            const data = snapshot.val();
            studentDueList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            renderDueDataTable(studentDueList);
        });
    }

    // ৭. ইভেন্ট লজিক
    function initLogic() {
        const idInp = document.getElementById('origId');
        const dateInp = document.getElementById('origDate');
        if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];

        // ফি ফর্ম আইডি দিয়ে অটোমেটিক ডিউ সার্চ
        if (idInp) {
            idInp.addEventListener('input', function() {
                const val = this.value.trim();
                const dueFound = studentDueList.find(s => String(s.stdId) === val || String(s.mobile) === val);
                if (dueFound) {
                    document.getElementById('origName').value = dueFound.studentName;
                    document.getElementById('origDue').value = parseFloat(dueFound.dueAmount || 0).toFixed(2);
                    return;
                }

                const customers = window.customers || [];
                const found = customers.find(c => c.id === val || c.phone === val);
                if (found) {
                    document.getElementById('origName').value = found.name;
                    if (window.calculateCustomerCurrentDue) {
                        document.getElementById('origDue').value = window.calculateCustomerCurrentDue(found.id).toFixed(2);
                    }
                }
            });
        }

        // ফি ফর্ম সাবমিট
        const origForm = document.getElementById('feeFormOriginal');
        if (origForm) {
            origForm.onsubmit = async function(e) {
                e.preventDefault();
                const rec = parseFloat(document.getElementById('origRec').value) || 0;
                const txn = parseFloat(document.getElementById('origTxn').value) || 0;
                const studentId = idInp.value;

                if (rec <= 0 || !studentId) return alert("তথ্য সঠিক নয়!");

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
                    const fb = await getFirebase();
                    const txs = window.customerTransactions || [];
                    txs.push(txData);

                    if (fb) {
                        await fb.set(fb.ref(fb.db, 'transactions'), txs);
                    }

                    showToast("ফি সফলভাবে ক্লাউডে জমা হয়েছে!", "success");
                    updateRecent(txData);
                    this.reset();
                    dateInp.value = new Date().toISOString().split('T')[0];
                    renderFullTable();
                } catch(err) { 
                    console.error(err); 
                    showToast("ফি সেভ করতে সমস্যা হয়েছে!", "error");
                }
                hideLoader();
            };
        }

        // ফাইল নেম সিলেক্টর ডিসপ্লে
        const fileInput = document.getElementById('dueFileInput');
        const fileNameDisplay = document.getElementById('dueFileNameDisplay');
        if (fileInput && fileNameDisplay) {
            fileInput.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    fileNameDisplay.innerText = this.files[0].name;
                } else {
                    fileNameDisplay.innerText = "No file chosen";
                }
            });
        }

        // =========================================================================
        // ৮. এক্সেল ফাইল আপলোড ও নিরাপদ ক্লাউড সেভ
        // =========================================================================
        const btnUpload = document.getElementById('btnUploadDueData');
        if (btnUpload && fileInput) {
            btnUpload.addEventListener('click', function() {
                if (!fileInput.files || fileInput.files.length === 0) {
                    showToast("অনুগ্রহ করে প্রথমে একটি এক্সেল ফাইল নির্বাচন করুন!", "warning");
                    return;
                }

                if (typeof XLSX === 'undefined') {
                    showToast("SheetJS লাইব্রেরি পাওয়া যায়নি!", "error");
                    return;
                }

                const file = fileInput.files[0];
                const reader = new FileReader();

                reader.onload = async function(e) {
                    try {
                        const data = e.target.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const firstSheetName = workbook.SheetNames[0];
                        const worksheet = workbook.Sheets[firstSheetName];
                        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                        if (!json || json.length === 0) {
                            showToast("এক্সেল ফাইলে কোনো ডেটা পাওয়া যায়নি!", "warning");
                            return;
                        }

                        const totalRows = json.length;
                        showToast(`📊 ${totalRows} টি ডেটা Firebase ক্লাউডে সেভ হচ্ছে...`, "info");

                        // ফরম্যাটিং
                        const formatted = json.map((r, idx) => ({
                            sl: idx + 1,
                            class: r['Class'] || r['class'] || '-',
                            section: r['Section'] || r['section'] || '-',
                            stdId: String(r['STD ID'] || r['Std Id'] || r['Student ID'] || r['ID'] || '').trim(),
                            studentName: r['Student Name'] || r['Name'] || '-',
                            category: r['Category'] || '-',
                            monthDue: r['Month Due'] || r['Month'] || '-',
                            dueItems: r['Due items'] || r['Due Items'] || r['Due Item'] || '-',
                            dueAmount: parseFloat(r['Due Amount'] || r['Amount'] || 0) || 0,
                            mobile: String(r['Mobile'] || r['Phone'] || '').trim(),
                            fathersName: r['Fathers name'] || r['Father Name'] || '-',
                            fathersMobile: String(r['Fathers Mobile'] || '').trim(),
                            mothersName: r['Mothers Name'] || r['Mother Name'] || '-',
                            mothersMobile: String(r['Mothers Mobile'] || '').trim()
                        }));

                        // Firebase ক্লাউডে অথেনটিকেটেড সেভ
                        const fb = await getFirebase();
                        if (fb) {
                            await fb.set(fb.ref(fb.db, 'erp/studentDueData'), formatted);
                            studentDueList = formatted;
                            renderDueDataTable(studentDueList);
                            showToast(`✅ সফলভাবে ${totalRows} টি ডেটা Firebase ক্লাউডে সংরক্ষিত হয়েছে!`, "success");
                        } else {
                            showToast("Firebase ক্লাউড সংযোগ পাওয়া যায়নি!", "error");
                        }

                    } catch(err) {
                        console.error(err);
                        showToast("Firebase ক্লাউডে আপলোডে সমস্যা হয়েছে: " + err.message, "error");
                    }
                };

                reader.readAsBinaryString(file);
            });
        }

        // ৯. লাইভ রিফ্রেশ বাটন
        const btnRefresh = document.getElementById('btnRefreshDueData');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', async function() {
                const icon = this.querySelector('i');
                if (icon) icon.classList.add('fa-spin');

                const fb = await getFirebase();
                if (fb) {
                    const snap = await fb.get(fb.ref(fb.db, 'erp/studentDueData'));
                    const data = snap.val();
                    studentDueList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
                    renderDueDataTable(studentDueList);
                    showToast(`🔄 ক্লাউডে মোট ${studentDueList.length} টি রেকর্ড সংরক্ষিত রয়েছে।`, "success");
                }

                setTimeout(() => {
                    if (icon) icon.classList.remove('fa-spin');
                }, 500);
            });
        }

        // ১০. রিয়েল-টাইম সার্চ
        const searchInput = document.getElementById('dueTableSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase().trim();
                if (!query) {
                    renderDueDataTable(studentDueList);
                    return;
                }

                const filtered = studentDueList.filter(item => 
                    (item.studentName && item.studentName.toLowerCase().includes(query)) ||
                    (item.stdId && item.stdId.toLowerCase().includes(query)) ||
                    (item.class && item.class.toLowerCase().includes(query)) ||
                    (item.mobile && item.mobile.toLowerCase().includes(query)) ||
                    (item.fathersMobile && item.fathersMobile.toLowerCase().includes(query)) ||
                    (item.dueItems && item.dueItems.toLowerCase().includes(query))
                );

                renderDueDataTable(filtered);
            });
        }

        // ১১. স্যাম্পল এক্সেল ডাউনলোড
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
        if (body.innerText.includes("কোনো রিসেন্ট এন্ট্রি নেই")) body.innerHTML = "";
        body.insertAdjacentHTML('afterbegin', row);
        if (body.children.length > 3) body.removeChild(body.lastChild);
    }

    function renderFullTable() {
        const body = document.getElementById('allRecordsTableBody');
        if (!body) return;
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
        listenFirebaseData();
        setTimeout(renderFullTable, 1000);
    });
})();
