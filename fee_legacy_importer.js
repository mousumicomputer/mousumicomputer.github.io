/**
 * Mousumi Computer ERP - Google Sheet Legacy Migration & Import Module
 * Dedicated Section to Upload, Track, and Manage Sheet Pending Records
 */

(function () {
    let firebaseCore = null;
    let legacySheetData = [];

    // ১. ফায়ারবেস কানেক্টর
    async function getFirebase() {
        if (firebaseCore) return firebaseCore;
        try {
            const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const fbDb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            let app;
            for (let i = 0; i < 20; i++) {
                try { app = fbApp.getApp(); if (app) break; } catch (e) {}
                await new Promise(r => setTimeout(r, 200));
            }
            if (!app) {
                app = fbApp.initializeApp({
                    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                    projectId: "mousumi-computer"
                }, "legacyModuleApp_" + Date.now());
            }

            const db = fbDb.getDatabase(app);
            firebaseCore = { db, ref: fbDb.ref, set: fbDb.set, get: fbDb.get, onValue: fbDb.onValue };
            return firebaseCore;
        } catch (err) {
            console.error("Firebase error:", err);
            return null;
        }
    }

    // ২. সাইডবারে নতুন সাব-মেনু ইনজেক্ট
    function injectLegacyMenuItem() {
        const parentMenu = document.getElementById('menu-edu-parent');
        if (!parentMenu) return;

        const submenuList = parentMenu.querySelector('.submenu-list');
        if (!submenuList || document.getElementById('menu-item-legacy-import')) return;

        const menuItemHTML = `
            <li class="submenu-item" id="menu-item-legacy-import">
                <a onclick="switchMainTab('edu-legacy-import')">
                    <i class="fa-solid fa-file-import"></i> <span>Sheet Pending Import</span>
                </a>
            </li>
        `;
        // Reports Hub এর ঠিক আগে ইনসার্ট করা
        submenuList.insertAdjacentHTML('beforeend', menuItemHTML);
    }

    // ৩. নতুন ভিউ প্যানেল ইনজেক্ট
    function injectLegacyPanel() {
        const container = document.getElementById('edu-module-container');
        if (!container || document.getElementById('edu-legacy-import-view')) return;

        const panelHTML = `
            <div class="view-panel" id="edu-legacy-import-view" style="display:none;">
                <div class="edu-view-card">
                    <!-- হেডার -->
                    <div class="edu-card-header-clean">
                        <div>
                            <h3 style="display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-file-excel" style="color:#10b981;"></i> Google Sheet Pending Importer
                            </h3>
                            <div style="font-size:0.78rem; color:#64748b; margin-top:3px;">
                                Upload your legacy sheet records to track and clear pending fees.
                            </div>
                        </div>
                        <div>
                            <span class="edu-pill-badge badge-pending" id="legacyCountBadge">0 Imported</span>
                            <span style="font-size:0.88rem; font-weight:700; margin-left:12px;">Total Payable: ৳ <span id="legacyTotalPayable" style="color:#10b981;">0.00</span></span>
                        </div>
                    </div>

                    <!-- আপলোড কন্ট্রোল বক্স -->
                    <div style="padding:16px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                            <input type="file" id="legacyExcelFileInput" accept=".xlsx, .xls, .csv" style="display:none;">
                            <button type="button" class="btn-act btn-act-undo" onclick="document.getElementById('legacyExcelFileInput').click()">
                                <i class="fa-solid fa-folder-open"></i> Choose Sheet Excel
                            </button>
                            <span id="legacyFileName" style="font-size:0.82rem; color:#64748b; font-weight:600;">No file chosen</span>
                            <button type="button" class="btn-act btn-act-pay" id="btnProcessLegacyExcel">
                                <i class="fa-solid fa-cloud-arrow-up"></i> Upload & Sync to Pending
                            </button>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="text" id="legacySearchInput" class="edu-input" placeholder="Search Sheet Records..." style="height:35px; width:240px;">
                        </div>
                    </div>

                    <!-- ইমপোর্টেড টেবিল -->
                    <div class="edu-table-responsive">
                        <table class="edu-clean-table">
                            <thead>
                                <tr>
                                    <th>SL / REC</th>
                                    <th>DATE</th>
                                    <th>STD ID</th>
                                    <th>STUDENT NAME</th>
                                    <th>CLASS</th>
                                    <th>CATEGORY</th>
                                    <th>MONTH</th>
                                    <th>TAP PAYABLE</th>
                                    <th>COLLECTED</th>
                                    <th>STATUS</th>
                                </tr>
                            </thead>
                            <tbody id="legacyTableBody">
                                <tr><td colspan="10" style="text-align:center; padding:30px; color:#94a3b8;">No sheet records imported yet.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', panelHTML);
    }

    // ৪. টেক্সট ও নাম্বার স্যানিটাইজার
    function sanitizeNumber(val) {
        if (!val) return 0;
        const cleaned = String(val).replace(/,/g, '').replace(/[^0-9.-]/g, '');
        return parseFloat(cleaned) || 0;
    }

    function sanitizeText(val) {
        if (!val) return '-';
        const str = String(val).trim();
        if (str.includes('#REF!') || str.includes('#N/A') || str === '') return '-';
        return str;
    }

    function sanitizeDate(val) {
        if (!val) return new Date().toISOString().split('T')[0];
        const str = String(val).trim();
        if (str.includes('-')) {
            const parts = str.split('-');
            if (parts.length === 3) {
                // DD-MM-YYYY কে YYYY-MM-DD ফরম্যাট করা
                if (parts[2].length === 4) return `${parts[2]}-${parts[1]}-${parts[0]}`;
                return str;
            }
        }
        return str;
    }

    // ৫. গুগল শিট এক্সেল প্রসেসিং
    async function processSheetExcel(file) {
        if (typeof XLSX === 'undefined') {
            alert("XLSX library not ready!");
            return;
        }

        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });

                if (!json || json.length === 0) {
                    alert("Excel file has no data!");
                    return;
                }

                const fb = await getFirebase();
                if (!fb) return;

                // বিদ্যমান ডাটা লোড
                const snap = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
                let currentTransactions = snap.exists() ? (Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val())) : [];

                const newImports = [];
                let addedCount = 0;

                json.forEach((row, idx) => {
                    const stdId = sanitizeText(row['Id'] || row['ID'] || row['Std Id'] || row['stdid']);
                    if (stdId === '-' || !stdId) return;

                    const slNo = sanitizeText(row['Sl'] || row['SL'] || row['Rec No'] || (3400 + idx));
                    const rawDate = row['Date'] || row['DATE'];
                    const dateFormatted = sanitizeDate(rawDate);

                    const netDue = sanitizeNumber(row['Net Due'] || row['Due']);
                    const txnFee = sanitizeNumber(row['Txn Fee'] || 6);
                    const totalCharge = sanitizeNumber(row['Total Charge'] || 6);
                    const netReceived = sanitizeNumber(row['Net Received'] || (netDue + totalCharge));
                    const grossPayment = sanitizeNumber(row['Gross Payment'] || netDue);

                    const record = {
                        id: 'SHEET-' + Date.now() + '-' + idx,
                        receiptNo: slNo,
                        customerId: stdId,
                        studentName: sanitizeText(row['Student Name'] || row['Name']),
                        class: sanitizeText(row['Class']),
                        category: sanitizeText(row['Category'] || row['Cat']),
                        month: sanitizeText(row['Month'] || '1'),
                        mobile: sanitizeText(row['Mobile']),
                        netDue: netDue,
                        txnFee: txnFee,
                        totalCharge: totalCharge,
                        netReceived: netReceived,
                        grossPayment: grossPayment,
                        date: dateFormatted,
                        time: '10:00 AM',
                        status: 'Pending',
                        source: 'Excel Sheet', // এই ট্যাগটি দ্বারা চিহ্নিত হবে এটি এক্সেল থেকে এসেছে
                        receivedBy: 'Google Sheet Migration'
                    };

                    // ডুপ্লিকেট চেকিং (একই Receipt No থাকলে আপডেট বা স্কিপ)
                    const existsIndex = currentTransactions.findIndex(t => String(t.receiptNo) === String(slNo));
                    if (existsIndex !== -1) {
                        currentTransactions[existsIndex] = record;
                    } else {
                        currentTransactions.unshift(record);
                    }
                    newImports.push(record);
                    addedCount++;
                });

                // ফায়ারবেসে সেভ করা
                await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), currentTransactions);

                alert(`Success! ${addedCount} records uploaded & synced to Pending Clearance.`);
                renderLegacyTable();

            } catch (err) {
                console.error(err);
                alert("Error reading Excel sheet!");
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // ৬. ইমপোর্টেড শিট ডাটা রেন্ডার করা
    async function renderLegacyTable() {
        const tbody = document.getElementById('legacyTableBody');
        const badge = document.getElementById('legacyCountBadge');
        const totalEl = document.getElementById('legacyTotalPayable');
        const searchInput = document.getElementById('legacySearchInput');
        if (!tbody) return;

        const fb = await getFirebase();
        if (!fb) return;

        const snap = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
        if (!snap.exists()) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:#94a3b8;">No records found.</td></tr>`;
            return;
        }

        const allData = Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val());
        // শুধুমাত্র এক্সেল থেকে আনা রেকর্ডগুলো ফিল্টার করা
        let sheetRecords = allData.filter(t => t.source === 'Excel Sheet');

        if (searchInput && searchInput.value.trim() !== '') {
            const q = searchInput.value.trim().toLowerCase();
            sheetRecords = sheetRecords.filter(r => 
                (r.studentName && r.studentName.toLowerCase().includes(q)) ||
                (r.customerId && r.customerId.toLowerCase().includes(q)) ||
                (r.receiptNo && String(r.receiptNo).includes(q)) ||
                (r.class && r.class.toLowerCase().includes(q))
            );
        }

        let totalPayable = 0;
        if (badge) badge.innerText = `${sheetRecords.length} Imported`;

        if (sheetRecords.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:30px; color:#94a3b8;">No Excel sheet records found.</td></tr>`;
            if (totalEl) totalEl.innerText = '0.00';
            return;
        }

        let html = '';
        sheetRecords.forEach(r => {
            const payable = parseFloat(r.grossPayment || r.netDue || 0);
            totalPayable += payable;

            const isPaid = (r.status === 'Paid');
            const statusBadge = isPaid 
                ? `<span class="edu-pill-badge badge-paid">Paid</span>` 
                : `<span class="edu-pill-badge badge-pending">Pending</span>`;

            html += `
                <tr>
                    <td style="font-weight:700; color:#2563eb;">${r.receiptNo || '-'}</td>
                    <td>${r.date || '-'}</td>
                    <td><strong style="font-family:monospace; font-size:0.9rem;">${r.customerId || '-'}</strong></td>
                    <td style="font-weight:600;">${r.studentName || '-'}</td>
                    <td>${r.class || '-'}</td>
                    <td><span style="font-size:0.75rem; font-weight:700; background:#f1f5f9; padding:2px 6px; border-radius:4px;">${r.category || '-'}</span></td>
                    <td style="text-align:center;">${r.month || '1'} Mo</td>
                    <td style="font-weight:800; color:#b45309;">৳ ${payable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="color:#15803d; font-weight:700;">৳ ${parseFloat(r.netReceived || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td>${statusBadge}</td>
                </tr>
            `;
        });

        tbody.innerHTML = html;
        if (totalEl) totalEl.innerText = totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }

    // ৭. ইভেন্ট লিসেনার ইনিশিয়ালাইজেশন
    function initLegacyEvents() {
        const fileInp = document.getElementById('legacyExcelFileInput');
        const fileNameEl = document.getElementById('legacyFileName');
        const btnUpload = document.getElementById('btnProcessLegacyExcel');
        const searchInp = document.getElementById('legacySearchInput');

        if (fileInp && fileNameEl) {
            fileInp.addEventListener('change', function () {
                fileNameEl.innerText = (this.files && this.files.length > 0) ? this.files[0].name : "No file chosen";
            });
        }

        if (btnUpload && fileInp) {
            btnUpload.addEventListener('click', function () {
                if (!fileInp.files || fileInp.files.length === 0) {
                    alert("Please select your Google Sheet Excel file first!");
                    return;
                }
                processSheetExcel(fileInp.files[0]);
            });
        }

        if (searchInp) {
            searchInp.addEventListener('input', renderLegacyTable);
        }
    }

    // ৮. ডম লোড হলে রান করা
    function init() {
        injectLegacyMenuItem();
        injectLegacyPanel();
        initLegacyEvents();

        // ফায়ারবেস চেঞ্জ হলে টেবিল আপডেট
        getFirebase().then(fb => {
            if (fb) {
                fb.onValue(fb.ref(fb.db, 'erp/feeTransactions'), () => {
                    renderLegacyTable();
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
