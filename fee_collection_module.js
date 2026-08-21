/**
 * Mousumi Computer ERP - Education & Digital Services Module
 * Features: Auto Calculation, Max 60 Tk Cap Gross Payment, Live Persistent Firebase Sync, 
 * Auto SL & Pagination, and Direct A5 Receipt PDF Generator on Submit.
 */

(function () {
    let studentDueList = [];
    let firebaseCore = null;
    let selectedStudentRawDue = 0; // মূল বকেয়া
    let selectedStudentData = null; // বর্তমান শিক্ষার্থীর তথ্য

    // পেজিনেশন স্টেট
    let currentPage = 1;
    let rowsPerPage = 25;
    let currentSearchQuery = "";

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
        .edu-form-control[readonly] { background-color: #f8f9fa; color: #334155; border-color: #e2e8f0; font-weight: bold; }
        .edu-sub-text { font-size: 13.5px !important; color: #2563eb !important; margin-top: 6px; font-weight: bold !important; }
        .edu-btn-submit { background-color: #2563eb; color: white !important; border: none; padding: 12px 32px; font-size: 16px !important; font-weight: bold !important; border-radius: 5px; cursor: pointer; transition: 0.2s; }
        .edu-btn-submit:hover { background-color: #1d4ed8; }
        .edu-recent-section { margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; }
        .edu-recent-title { font-size: 13px !important; color: #64748b !important; font-weight: bold !important; margin-bottom: 8px; display: flex; justify-content: space-between; }
        .edu-compact-table { width: 100%; border-collapse: collapse; font-size: 13px !important; }
        .edu-compact-table th, .edu-compact-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #f1f5f9; }

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
        .due-entries-info { font-size: 14px; color: #475569; font-weight: 600; }
        .due-page-select {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 13.5px;
            outline: none;
            background: #fff;
            color: #334155;
            font-weight: 600;
            cursor: pointer;
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
        .btn-due-refresh:hover { background: #e0e7ff; border-color: #a5b4fc; }

        .due-search-box { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; }
        .due-search-input { border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; font-size: 14px; outline: none; }
        .due-table-wrapper { overflow-x: auto; }
        .due-data-table { width: 100%; border-collapse: collapse; min-width: 1350px; }
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
        .due-data-table td { padding: 12px 14px; color: #334155; font-size: 13.5px; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }
        .due-data-table tr:hover td { background-color: #f8fafc; }

        .due-pagination-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 18px;
            padding-top: 15px;
            border-top: 1px solid #f1f5f9;
            flex-wrap: wrap;
            gap: 12px;
        }
        .due-pagination-btns { display: flex; align-items: center; gap: 4px; }
        .due-page-btn {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            color: #334155;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
        }
        .due-page-btn:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
        .due-page-btn.active { background: #2563eb; color: #ffffff; border-color: #2563eb; }
        .due-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        #menu-edu-parent.open .submenu-list { display: block; }

        /* রিসিট প্রিন্ট কন্টেইনার (লুকানো থাকবে স্ক্রিনে) */
        #printable-receipt-container {
            display: none;
            width: 148mm;
            background: #ffffff;
            color: #000000;
            padding: 8mm 10mm;
            box-sizing: border-box;
        }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ২. স্বয়ংক্রিয় Firebase কানেক্টর
    async function getFirebase() {
        if (firebaseCore) return firebaseCore;
        try {
            const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const fbDb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            let app;
            for (let i = 0; i < 20; i++) {
                try {
                    app = fbApp.getApp();
                    if (app) break;
                } catch (e) {}
                await new Promise(r => setTimeout(r, 200));
            }

            if (!app) {
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
                                        <input type="text" id="origId" class="edu-form-control" placeholder="আইডি লিখুন" required autocomplete="off">
                                    </div>
                                    <div class="edu-form-group">
                                        <label>শিক্ষার্থীর নাম (Student Name)</label>
                                        <input type="text" id="origName" class="edu-form-control" placeholder="শিক্ষার্থীর নাম" readonly>
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>বকেয়া (Net Due)</label>
                                        <input type="text" id="origDue" class="edu-form-control" value="0.00" readonly>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>ট্রানজেকশন ফি (Txn Fee)</label>
                                        <input type="number" step="any" id="origTxn" class="edu-form-control" value="6.00">
                                        <span class="edu-sub-text">মোট চার্জ (Total Charge): ৳ <span id="origCharge">6.00</span></span>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>গৃহীত মোট টাকা (Net Received)</label>
                                        <input type="text" id="origRec" class="edu-form-control" value="0.00" readonly>
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>ছাড় (Discount)</label>
                                        <input type="number" step="any" id="origDisc" class="edu-form-control" value="0.00">
                                    </div>
                                </div>
                                <div style="display:flex; justify-content:flex-end;">
                                    <button type="submit" class="edu-btn-submit"><i class="fa-solid fa-print"></i> সাবমিট করুন ও রিসিট নিন</button>
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

                    <div class="due-data-card">
                        <div class="due-table-toolbar">
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 14px; color: #475569;">Show</span>
                                    <select id="duePageSizeSelect" class="due-page-select">
                                        <option value="10">10</option>
                                        <option value="25" selected>25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                        <option value="-1">All</option>
                                    </select>
                                    <span style="font-size: 14px; color: #475569;">entries</span>
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
                                        <th style="width: 50px;">SL</th>
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
                                    <tr><td colspan="14" style="text-align: center; color: #94a3b8; padding: 25px;">কোনো ডেটা লোড করা হয়নি। এক্সেল ফাইল আপলোড করুন।</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="due-pagination-wrapper">
                            <div class="due-entries-info" id="dueEntriesInfo">Showing 0 to 0 of 0 entries</div>
                            <div class="due-pagination-btns" id="duePaginationBtns"></div>
                        </div>
                    </div>
                </div>

                <!-- লুকানো রিসিট কন্টেইনার (A5 PDF জেনারেট করার জন্য) -->
                <div id="printable-receipt-container"></div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', panelsHTML);
    }

    // ৫. অটোমেটিক ক্যালকুলেশন ফাংশন
    function calculateAutoValues() {
        const discountInp = document.getElementById('origDisc');
        const txnInp = document.getElementById('origTxn');
        const dueInp = document.getElementById('origDue');
        const chargeText = document.getElementById('origCharge');
        const recInp = document.getElementById('origRec');

        const discount = parseFloat(discountInp ? discountInp.value : 0) || 0;
        const txnFee = parseFloat(txnInp ? txnInp.value : 0) || 0;

        // বকেয়া (Net Due) = মূল বকেয়া - ডিসকাউন্ট
        const netDue = Math.max(0, selectedStudentRawDue - discount);

        // মোট চার্জ (Total Charge) = বকেয়া (Net Due) এর ১% + ট্রানজেকশন ফি (Txn Fee)
        const percentCharge = netDue * 0.01;
        const totalCharge = percentCharge + txnFee;

        // গৃহীত মোট টাকা (Net Received) = বকেয়া (Net Due) + মোট চার্জ (Total Charge)
        const netReceived = netDue + totalCharge;

        // ভ্যালু আপডেট
        if (dueInp) dueInp.value = netDue.toFixed(2);
        if (chargeText) chargeText.innerText = totalCharge.toFixed(2);
        if (recInp) recInp.value = netReceived.toFixed(2);
    }

    // ৬. পেজিনেশন ও অটোমেটিক ক্রমিক (SL) সহ বকেয়া টেবিল রেন্ডার
    function renderDueDataTable() {
        const tbody = document.getElementById('dueDataTableBody');
        const entriesInfo = document.getElementById('dueEntriesInfo');
        const paginationBtns = document.getElementById('duePaginationBtns');
        if (!tbody) return;

        let filtered = studentDueList;
        if (currentSearchQuery) {
            const q = currentSearchQuery.toLowerCase();
            filtered = studentDueList.filter(item => 
                (item.studentName && item.studentName.toLowerCase().includes(q)) ||
                (item.stdId && item.stdId.toLowerCase().includes(q)) ||
                (item.class && item.class.toLowerCase().includes(q)) ||
                (item.mobile && item.mobile.toLowerCase().includes(q)) ||
                (item.fathersMobile && item.fathersMobile.toLowerCase().includes(q)) ||
                (item.dueItems && item.dueItems.toLowerCase().includes(q))
            );
        }

        const totalEntries = filtered.length;
        const effectivePageSize = rowsPerPage === -1 ? totalEntries : rowsPerPage;
        const totalPages = Math.max(1, Math.ceil(totalEntries / (effectivePageSize || 1)));

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * effectivePageSize;
        const endIndex = rowsPerPage === -1 ? totalEntries : Math.min(startIndex + effectivePageSize, totalEntries);
        const currentSlice = rowsPerPage === -1 ? filtered : filtered.slice(startIndex, endIndex);

        if (entriesInfo) {
            const startDisplay = totalEntries > 0 ? startIndex + 1 : 0;
            entriesInfo.innerText = `Showing ${startDisplay} to ${endIndex} of ${totalEntries} entries`;
        }

        if (totalEntries === 0) {
            tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; color: #94a3b8; padding: 25px;">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>`;
            if (paginationBtns) paginationBtns.innerHTML = '';
            return;
        }

        let html = '';
        currentSlice.forEach((item, index) => {
            const autoSL = startIndex + index + 1;
            html += `
                <tr>
                    <td style="font-weight: 700; color: #64748b;">${autoSL}</td>
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

        renderPaginationButtons(totalPages);
    }

    function renderPaginationButtons(totalPages) {
        const container = document.getElementById('duePaginationBtns');
        if (!container) return;
        container.innerHTML = '';

        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.className = 'due-page-btn';
        prevBtn.innerText = 'Previous';
        prevBtn.disabled = (currentPage === 1);
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderDueDataTable();
            }
        };
        container.appendChild(prevBtn);

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            container.appendChild(createPageButton(1));
            if (startPage > 2) {
                const dots = document.createElement('span');
                dots.innerText = '...';
                dots.style.padding = '0 5px';
                container.appendChild(dots);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            container.appendChild(createPageButton(i));
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const dots = document.createElement('span');
                dots.innerText = '...';
                dots.style.padding = '0 5px';
                container.appendChild(dots);
            }
            container.appendChild(createPageButton(totalPages));
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'due-page-btn';
        nextBtn.innerText = 'Next';
        nextBtn.disabled = (currentPage === totalPages);
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderDueDataTable();
            }
        };
        container.appendChild(nextBtn);
    }

    function createPageButton(pageNum) {
        const btn = document.createElement('button');
        btn.className = `due-page-btn ${pageNum === currentPage ? 'active' : ''}`;
        btn.innerText = pageNum;
        btn.onclick = () => {
            currentPage = pageNum;
            renderDueDataTable();
        };
        return btn;
    }

    // ৭. লাইভ রিয়েল-টাইম Firebase লিসেনার (স্থায়ী সংরক্ষণ)
    async function listenFirebaseData() {
        const fb = await getFirebase();
        if (!fb) return;

        // বকেয়া ডেটা লিসেনার
        const dueRef = fb.ref(fb.db, 'erp/studentDueData');
        fb.onValue(dueRef, (snapshot) => {
            const data = snapshot.val();
            studentDueList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            renderDueDataTable();
        });

        // লেনদেন ডেটা লিসেনার (যাতে রিফ্রেশেও ফি রেকর্ড না হারায়)
        const txRef = fb.ref(fb.db, 'transactions');
        fb.onValue(txRef, (snapshot) => {
            const data = snapshot.val();
            const allTxs = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            window.customerTransactions = allTxs;
            
            const eduTxs = allTxs.filter(t => t && t.id && String(t.id).startsWith('EDU-'));
            renderFullTable(eduTxs);
            renderRecentEntries(eduTxs);
        });
    }

    // ৮. A5 রিসিট জেনারেটর (Google Sheet Receipt Format)
    async function generateAndDownloadReceiptPDF(receiptData) {
        const container = document.getElementById('printable-receipt-container');
        if (!container) return;

        const fmt = (num) => (parseFloat(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        container.innerHTML = `
            <div style="font-family: Arial, sans-serif; color: #1e293b; border: 2px solid #2563eb; border-radius: 8px; padding: 18px; background: #ffffff; width: 100%; box-sizing: border-box;">
                
                <!-- HEADER -->
                <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 12px;">
                    <h2 style="margin: 0; color: #1e3a8a; font-size: 20px; font-weight: 800; text-transform: uppercase;">MOUSUMI COMPUTER</h2>
                    <p style="margin: 2px 0; font-size: 11px; color: #475569;">Education & Digital Financial Services Center</p>
                    <div style="display: inline-block; background: #2563eb; color: #ffffff; padding: 3px 15px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-top: 5px;">
                        TUITION FEE MONEY RECEIPT
                    </div>
                </div>

                <!-- META INFO -->
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px;">
                    <tr>
                        <td style="padding: 3px 0;"><strong>Receipt No:</strong> #${receiptData.serialNumber}</td>
                        <td style="padding: 3px 0; text-align: right;"><strong>Date:</strong> ${receiptData.date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 3px 0;"><strong>Student ID:</strong> ${receiptData.customerId}</td>
                        <td style="padding: 3px 0; text-align: right;"><strong>Class:</strong> ${receiptData.class || '-'} (${receiptData.section || '-'})</td>
                    </tr>
                    <tr>
                        <td style="padding: 3px 0;" colspan="2"><strong>Student Name:</strong> ${receiptData.studentName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 3px 0;"><strong>Month/Fee:</strong> ${receiptData.month || '-'}</td>
                        <td style="padding: 3px 0; text-align: right;"><strong>Mobile:</strong> ${receiptData.mobile || '-'}</td>
                    </tr>
                </table>

                <!-- FEE DETAILS TABLE -->
                <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 12px; border: 1px solid #cbd5e1;">
                    <thead>
                        <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                            <th style="padding: 6px 8px; text-align: left; border-right: 1px solid #cbd5e1;">Description</th>
                            <th style="padding: 6px 8px; text-align: right; width: 120px;">Amount (৳)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 6px 8px; border-right: 1px solid #cbd5e1;">Net Tuition Due</td>
                            <td style="padding: 6px 8px; text-align: right;">৳ ${fmt(receiptData.netDue)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 8px; border-right: 1px solid #cbd5e1;">Transaction & Processing Fee</td>
                            <td style="padding: 6px 8px; text-align: right;">৳ ${fmt(receiptData.totalCharge)}</td>
                        </tr>
                        ${receiptData.discount > 0 ? `
                        <tr style="color: #ef4444;">
                            <td style="padding: 6px 8px; border-right: 1px solid #cbd5e1;">Discount / Concession</td>
                            <td style="padding: 6px 8px; text-align: right;">- ৳ ${fmt(receiptData.discount)}</td>
                        </tr>` : ''}
                        <tr style="background: #f8fafc; font-weight: bold; border-top: 1px solid #cbd5e1; font-size: 13px;">
                            <td style="padding: 8px; border-right: 1px solid #cbd5e1; color: #1e3a8a;">Total Payment Received</td>
                            <td style="padding: 8px; text-align: right; color: #16a34a;">৳ ${fmt(receiptData.netReceived)}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- REMARKS & FOOTER -->
                <div style="font-size: 11px; margin-bottom: 30px; color: #475569;">
                    <strong>Payment Status:</strong> <span style="color: #16a34a; font-weight: bold;">PAID</span> | 
                    <strong>Remarks:</strong> ${receiptData.dueItems || 'Tuition Fee Collected'}
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: center; margin-top: 20px;">
                    <tr>
                        <td style="width: 50%; padding-top: 15px; border-top: 1px dashed #94a3b8;">Customer Signature</td>
                        <td style="width: 50%; padding-top: 15px; border-top: 1px dashed #94a3b8;">Authorized Seal & Signature</td>
                    </tr>
                </table>

                <div style="text-align: center; font-size: 9px; color: #94a3b8; margin-top: 15px;">
                    * This is a computer generated receipt. Thank you for choosing Mousumi Computer.
                </div>
            </div>
        `;

        container.style.display = 'block';

        const opt = {
            margin: 6,
            filename: `Receipt_${receiptData.serialNumber}_${receiptData.customerId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
        };

        if (typeof html2pdf !== 'undefined') {
            await html2pdf().set(opt).from(container).save();
        } else {
            window.print();
        }

        container.style.display = 'none';
    }

    // ৯. ইভেন্ট লজিক
    function initLogic() {
        const idInp = document.getElementById('origId');
        const nameInp = document.getElementById('origName');
        const dateInp = document.getElementById('origDate');
        const discInp = document.getElementById('origDisc');
        const txnInp = document.getElementById('origTxn');

        if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];

        // আইডি লেখার সাথে সাথে স্বয়ংক্রিয় ডিউ ও নাম লোড
        if (idInp) {
            idInp.addEventListener('input', function() {
                const val = this.value.trim();
                
                if (!val) {
                    selectedStudentRawDue = 0;
                    selectedStudentData = null;
                    if (nameInp) nameInp.value = '';
                    calculateAutoValues();
                    return;
                }

                // বকেয়া তালিকা থেকে সার্চ
                const dueFound = studentDueList.find(s => String(s.stdId).trim() === val || String(s.mobile).trim() === val);
                
                if (dueFound) {
                    selectedStudentData = dueFound;
                    selectedStudentRawDue = parseFloat(dueFound.dueAmount || 0);
                    if (nameInp) nameInp.value = dueFound.studentName || '';
                } else {
                    const customers = window.customers || [];
                    const foundCust = customers.find(c => String(c.id).trim() === val || String(c.phone).trim() === val);
                    if (foundCust) {
                        selectedStudentData = foundCust;
                        selectedStudentRawDue = window.calculateCustomerCurrentDue ? window.calculateCustomerCurrentDue(foundCust.id) : 0;
                        if (nameInp) nameInp.value = foundCust.name || '';
                    } else {
                        selectedStudentData = null;
                        selectedStudentRawDue = 0;
                        if (nameInp) nameInp.value = '';
                    }
                }

                calculateAutoValues();
            });
        }

        if (discInp) discInp.addEventListener('input', calculateAutoValues);
        if (txnInp) txnInp.addEventListener('input', calculateAutoValues);

        // ফি ফর্ম সাবমিট
        const origForm = document.getElementById('feeFormOriginal');
        if (origForm) {
            origForm.onsubmit = async function(e) {
                e.preventDefault();
                const studentId = idInp ? idInp.value.trim() : '';
                const studentName = nameInp ? nameInp.value.trim() : '';
                const netDue = parseFloat(document.getElementById('origDue').value) || 0;
                const txnFee = parseFloat(document.getElementById('origTxn').value) || 0;
                const totalCharge = parseFloat(document.getElementById('origCharge').innerText) || 0;
                const netReceived = parseFloat(document.getElementById('origRec').value) || 0;
                const discount = parseFloat(document.getElementById('origDisc').value) || 0;

                if (!studentId || netReceived <= 0) {
                    alert("দয়া করে সঠিক শিক্ষার্থী আইডি ও তথ্য প্রদান করুন!");
                    return;
                }

                if (typeof showLoader === 'function') showLoader("সংরক্ষণ ও রিসিট তৈরি হচ্ছে...");

                // ৩নং ছবির রুল: Gross Payment = Net Due + ১% (তবে চার্জ ৬০ টাকার বেশি হবে না)
                const percentCapCharge = Math.min(netDue * 0.01, 60);
                const calculatedGross = netDue + percentCapCharge;

                try {
                    const fb = await getFirebase();
                    let currentSerial = 1001;

                    if (fb) {
                        // সিরিয়াল ট্র্যাকার রিড ও আপডেট
                        const serialRef = fb.ref(fb.db, 'erp/serialTracker');
                        const serialSnap = await fb.get(serialRef);
                        if (serialSnap.exists()) {
                            currentSerial = (parseInt(serialSnap.val()) || 1000) + 1;
                        }
                        await fb.set(serialRef, currentSerial);
                    }

                    const txData = {
                        id: 'EDU-' + Date.now(),
                        serialNumber: currentSerial,
                        customerId: studentId,
                        studentName: studentName || '-',
                        class: selectedStudentData ? (selectedStudentData.class || '-') : '-',
                        section: selectedStudentData ? (selectedStudentData.section || '-') : '-',
                        month: selectedStudentData ? (selectedStudentData.monthDue || '-') : '-',
                        category: selectedStudentData ? (selectedStudentData.category || '-') : '-',
                        mobile: selectedStudentData ? (selectedStudentData.mobile || '-') : '-',
                        dueItems: selectedStudentData ? (selectedStudentData.dueItems || '-') : 'Tuition Fee',
                        netDue: netDue,
                        txnFee: txnFee,
                        totalCharge: totalCharge,
                        discount: discount,
                        netReceived: netReceived,
                        grossPayment: calculatedGross,
                        credit: netReceived,
                        date: dateInp ? dateInp.value : new Date().toISOString().split('T')[0],
                        time: new Date().toLocaleTimeString(),
                        type: 'Credit'
                    };

                    if (fb) {
                        const snap = await fb.get(fb.ref(fb.db, 'transactions'));
                        let txs = snap.val();
                        txs = txs ? (Array.isArray(txs) ? txs : Object.values(txs)) : [];
                        txs.push(txData);
                        await fb.set(fb.ref(fb.db, 'transactions'), txs);
                        window.customerTransactions = txs;
                    }

                    // A5 রিসিট PDF সরাসরি তৈরি ও ডাউনলোড
                    await generateAndDownloadReceiptPDF(txData);

                    if (typeof showToast === 'function') showToast(`ফি সংরক্ষিত হয়েছে এবং রিসিট #${currentSerial} তৈরি হয়েছে!`, "success");
                    
                    // ফর্ম রিসেট
                    this.reset();
                    selectedStudentRawDue = 0;
                    selectedStudentData = null;
                    if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];
                    if (txnInp) txnInp.value = "6.00";
                    calculateAutoValues();
                } catch(err) { 
                    console.error(err); 
                    if (typeof showToast === 'function') showToast("ফি সেভ করতে সমস্যা হয়েছে!", "error");
                }
                if (typeof hideLoader === 'function') hideLoader();
            };
        }

        // ফাইল সিলেক্টর
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

        // পেজ সাইজ ড্রপডাউন
        const pageSizeSelect = document.getElementById('duePageSizeSelect');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', function() {
                rowsPerPage = parseInt(this.value);
                currentPage = 1;
                renderDueDataTable();
            });
        }

        // এক্সেল ফাইল আপলোড
        const btnUpload = document.getElementById('btnUploadDueData');
        if (btnUpload && fileInput) {
            btnUpload.addEventListener('click', function() {
                if (!fileInput.files || fileInput.files.length === 0) {
                    if (typeof showToast === 'function') showToast("অনুগ্রহ করে প্রথমে একটি এক্সেল ফাইল নির্বাচন করুন!", "warning");
                    return;
                }

                if (typeof XLSX === 'undefined') {
                    if (typeof showToast === 'function') showToast("SheetJS লাইব্রেরি পাওয়া যায়নি!", "error");
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
                            if (typeof showToast === 'function') showToast("এক্সেল ফাইলে কোনো ডেটা পাওয়া যায়নি!", "warning");
                            return;
                        }

                        const totalRows = json.length;
                        if (typeof showToast === 'function') showToast(`📊 ${totalRows} টি ডেটা Firebase ক্লাউডে সেভ হচ্ছে...`, "info");

                        const formatted = json.map(r => ({
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

                        const fb = await getFirebase();
                        if (fb) {
                            await fb.set(fb.ref(fb.db, 'erp/studentDueData'), formatted);
                            studentDueList = formatted;
                            currentPage = 1;
                            renderDueDataTable();
                            if (typeof showToast === 'function') showToast(`✅ সফলভাবে ${totalRows} টি ডেটা ক্লাউডে সংরক্ষিত হয়েছে!`, "success");
                        }
                    } catch(err) {
                        console.error(err);
                        if (typeof showToast === 'function') showToast("Firebase আপলোডে সমস্যা হয়েছে: " + err.message, "error");
                    }
                };

                reader.readAsBinaryString(file);
            });
        }

        // রিফ্রেশ বাটন
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
                    renderDueDataTable();
                    if (typeof showToast === 'function') showToast(`🔄 ক্লাউডে মোট ${studentDueList.length} টি রেকর্ড রয়েছে।`, "success");
                }

                setTimeout(() => {
                    if (icon) icon.classList.remove('fa-spin');
                }, 500);
            });
        }

        // সার্চ
        const searchInput = document.getElementById('dueTableSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                currentSearchQuery = this.value.trim();
                currentPage = 1;
                renderDueDataTable();
            });
        }

        // স্যাম্পল ডাউনলোড
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

    // ২নং ছবির সেকশন: সর্বশেষ এন্ট্রি (সর্বোচ্চ ৩টি)
    function renderRecentEntries(eduTxs) {
        const body = document.getElementById('origRecentBody');
        if (!body) return;
        
        if (!eduTxs || eduTxs.length === 0) {
            body.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#999; padding:15px;">কোনো রিসেন্ট এন্ট্রি নেই</td></tr>';
            return;
        }

        const top3 = eduTxs.slice(-3).reverse();
        let html = '';
        top3.forEach(t => {
            const amt = parseFloat(t.netReceived || t.credit || 0);
            html += `
                <tr>
                    <td>${t.date || '-'}</td>
                    <td><strong>${t.customerId || '-'}</strong></td>
                    <td>${t.studentName || '-'}</td>
                    <td style="font-weight:bold; color:#2563eb;">৳ ${amt.toFixed(2)}</td>
                </tr>
            `;
        });
        body.innerHTML = html;
    }

    // ১নং ছবির সেকশন: সকল জমা হওয়া ফি তালিকা
    function renderFullTable(eduTxs) {
        const body = document.getElementById('allRecordsTableBody');
        const totalFeeSumEl = document.getElementById('totalFeeSum');
        if (!body) return;

        if (!eduTxs || eduTxs.length === 0) {
            body.innerHTML = '<tr><td colspan="14" style="padding:20px; color:#999; text-align:center;">এখনও কোনো ডেটা জমা হয়নি</td></tr>';
            if (totalFeeSumEl) totalFeeSumEl.innerText = '0.00';
            return;
        }

        body.innerHTML = '';
        let total = 0;
        
        const list = eduTxs.slice().reverse();
        list.forEach((t, i) => {
            const netDue = parseFloat(t.netDue || 0);
            const txnFee = parseFloat(t.txnFee || 0);
            const totalCharge = parseFloat(t.totalCharge || 0);
            const netReceived = parseFloat(t.netReceived || t.credit || 0);
            
            // Gross Payment রুল: Net Due + ১% (তবে চার্জ সর্বোচ্চ ৬০ টাকা)
            const percentCapped = Math.min(netDue * 0.01, 60);
            const grossPayment = t.grossPayment !== undefined ? parseFloat(t.grossPayment) : (netDue + percentCapped);

            total += netReceived;

            body.innerHTML += `
                <tr>
                    <td style="font-weight:bold; color:#64748b;">${list.length - i}</td>
                    <td>${t.date || '-'}</td>
                    <td><strong>${t.studentName || '-'}</strong></td>
                    <td>${t.customerId || '-'}</td>
                    <td>${t.class || '-'}</td>
                    <td>${t.month || '-'}</td>
                    <td>${t.category || '-'}</td>
                    <td>${t.mobile || '-'}</td>
                    <td style="font-weight:bold;">${netDue.toFixed(2)}</td>
                    <td>${txnFee.toFixed(2)}</td>
                    <td>${totalCharge.toFixed(2)}</td>
                    <td style="font-weight:bold; color:#16a34a;">${netReceived.toFixed(2)}</td>
                    <td style="color:#2563eb; font-weight:bold;">${grossPayment.toFixed(2)}</td>
                    <td>${t.discount > 0 ? `ছাড়: ৳${t.discount}` : '-'}</td>
                </tr>`;
        });
        
        if (totalFeeSumEl) {
            totalFeeSumEl.innerText = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
        }
    }

    window.addEventListener('load', () => {
        injectMenu();
        injectPanels();
        initLogic();
        listenFirebaseData();
    });
})();
