/**
 * Mousumi Computer ERP - Google Sheet Legacy Migration & Import Module
 * Dedicated Section to Upload, Track, and Manage Sheet Pending Records
 * With Clean 25-Row Pagination & Filter System
 */

(function () {
    let firebaseCore = null;

    // পেজিনেশন স্টেট
    let legacyCurrentPage = 1;
    let legacyRowsPerPage = 25;
    let legacySearchQuery = "";

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
        if (!parentMenu) return false;

        const submenuList = parentMenu.querySelector('.submenu-list');
        if (!submenuList) return false;

        if (document.getElementById('menu-item-legacy-import')) return true;

        const menuItemHTML = `
            <li class="submenu-item" id="menu-item-legacy-import">
                <a onclick="switchMainTab('edu-legacy-import')" style="cursor:pointer;">
                    <i class="fa-solid fa-angle-right"></i> <span>Sheet Pending Import</span>
                </a>
            </li>
        `;
        submenuList.insertAdjacentHTML('beforeend', menuItemHTML);
        return true;
    }

    // ৩. নতুন ভিউ প্যানেল ইনজেক্ট (পেজিনেশন ও ড্রপডাউন সহ)
    function injectLegacyPanel() {
        const container = document.getElementById('edu-module-container');
        if (!container || document.getElementById('edu-legacy-import-view')) return false;

        const panelHTML = `
            <div class="view-panel" id="edu-legacy-import-view" style="display:none;">
                <div class="edu-view-card">
                    <div class="edu-card-header-clean">
                        <h3><i class="fa-solid fa-file-excel" style="color:#10b981; margin-right:8px;"></i> Sheet Pending Import</h3>
                        <div>
                            <span class="edu-pill-badge badge-pending" id="legacyCountBadge">0 Imported</span>
                            <span style="font-size:0.88rem; font-weight:700; margin-left:12px;">Total Payable: ৳ <span id="legacyTotalPayable" style="color:#10b981;">0.00</span></span>
                        </div>
                    </div>

                    <!-- আপলোড বার -->
                    <div style="padding:12px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                            <input type="file" id="legacyExcelFileInput" accept=".xlsx, .xls, .csv" style="display:none;">
                            <button type="button" class="btn-act btn-act-undo" onclick="document.getElementById('legacyExcelFileInput').click()">
                                Choose File
                            </button>
                            <span id="legacyFileName" style="font-size:0.82rem; color:#64748b;">No file chosen</span>
                            <button type="button" class="btn-act btn-act-pay" id="btnProcessLegacyExcel">
                                Upload & Sync
                            </button>
                            <button type="button" class="btn-act btn-act-void" id="btnClearSheetImports" title="Delete only sheet imported data">
                                Clear Sheet Data ✕
                            </button>
                        </div>
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:0.8rem; font-weight:700; color:#64748b;">Show</span>
                            <select id="legacyPageSizeSelect" class="edu-input" style="height:35px; width:70px; padding:0 6px;">
                                <option value="25" selected>25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                                <option value="-1">All</option>
                            </select>
                            <input type="text" id="legacySearchInput" class="edu-input" placeholder="Search Records..." style="height:35px; width:200px;">
                        </div>
                    </div>

                    <!-- টেবিল -->
                    <div class="edu-table-responsive">
                        <table class="edu-clean-table">
                            <thead>
                                <tr>
                                    <th>REC NO</th>
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
                                <tr><td colspan="10" style="text-align:center; padding:25px; color:#94a3b8;">No sheet records imported yet.</td></tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- পেজিনেশন বার -->
                    <div style="padding:10px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                        <span id="legacyPaginationInfo" style="font-size:0.82rem; color:#64748b; font-weight:600;">Showing 0 to 0 of 0 entries</span>
                        <div id="legacyPaginationBtns" style="display:flex; gap:5px;"></div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', panelHTML);
        initLegacyEvents();
        return true;
    }

    // ৪. টেক্সট ও ডেট স্যানিটাইজার
    function sanitizeNumber(val) {
        if (!val) return 0;
        const cleaned = String(val).replace(/,/g, '').replace(/[^0-9.-]/g, '');
        return parseFloat(cleaned) || 0;
    }

    function sanitizeText(val) {
        if (val === undefined || val === null) return '-';
        const str = String(val).trim();
        if (str.includes('#REF!') || str.includes('#N/A') || str === '') return '-';
        return str;
    }

    function sanitizeDate(val) {
        if (!val) return new Date().toISOString().split('T')[0];
        
        if (typeof val === 'number' || (!isNaN(val) && String(val).trim().length >= 4 && !String(val).includes('-') && !String(val).includes('/'))) {
            try {
                const numericDate = parseFloat(val);
                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                const realDate = new Date(excelEpoch.getTime() + numericDate * 86400000);
                return realDate.toISOString().split('T')[0];
            } catch(e) {}
        }

        const str = String(val).trim();
        if (str.includes('-') || str.includes('/')) {
            const delimiter = str.includes('-') ? '-' : '/';
            const parts = str.split(delimiter);
            if (parts.length === 3) {
                if (parts[2].length === 4) {
                    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
                return str;
            }
        }
        return str;
    }

    function extractReceiptNo(row, fallbackIndex) {
        const keys = Object.keys(row);
        for (let k of keys) {
            const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (clean === 'rcvno' || clean === 'receiptno' || clean === 'recno' || clean === 'receipt' || clean === 'voucherno') {
                const v = String(row[k]).trim();
                if (v && v.toLowerCase() !== 'total') return v;
            }
        }
        for (let k of keys) {
            const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (clean === 'sl' || clean === 'slno') {
                const v = String(row[k]).trim();
                if (v && v.toLowerCase() !== 'total') return v;
            }
        }
        return String(3400 + fallbackIndex);
    }

    // ৫. প্রসেসিং ও অটো রিপ্লেস
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
                    alert("File has no data!");
                    return;
                }

                const fb = await getFirebase();
                if (!fb) return;

                const snap = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
                let currentTransactions = snap.exists() ? (Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val())) : [];

                const hasOldSheetData = currentTransactions.some(t => t.source === 'Excel Sheet');
                if (hasOldSheetData) {
                    const confirmClean = confirm("Replace previous uploaded sheet records with this new file?");
                    if (confirmClean) {
                        currentTransactions = currentTransactions.filter(t => t.source !== 'Excel Sheet');
                    }
                }

                let addedCount = 0;

                json.forEach((row, idx) => {
                    const studentName = sanitizeText(row['Student Name'] || row['Name']);
                    const stdId = sanitizeText(row['Id'] || row['ID'] || row['Std Id'] || row['stdid']);
                    
                    if (String(row['Sl']).toLowerCase() === 'total' || String(row['Rcv. No']).toLowerCase() === 'total' || (!studentName && !stdId) || stdId === '-') {
                        return;
                    }

                    const slNo = extractReceiptNo(row, idx);
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
                        studentName: studentName,
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
                        source: 'Excel Sheet',
                        receivedBy: 'Google Sheet Migration'
                    };

                    currentTransactions.unshift(record);
                    addedCount++;
                });

                await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), currentTransactions);

                alert(`Success! ${addedCount} records uploaded cleanly with correct Receipt numbers.`);
                legacyCurrentPage = 1;
                renderLegacyTable();

            } catch (err) {
                console.error(err);
                alert("Error processing file!");
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // আগের শিট ডাটা পুরোপুরি ক্লিন করার ফাংশন
    async function clearAllSheetImports() {
        if (!confirm("Are you sure you want to remove all imported sheet records? (Normal shop records will NOT be deleted)")) {
            return;
        }

        const fb = await getFirebase();
        if (!fb) return;

        const snap = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
        if (!snap.exists()) return;

        let allData = Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val());
        const filteredData = allData.filter(t => t.source !== 'Excel Sheet');

        await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), filteredData);
        alert("All imported sheet records cleared!");
        legacyCurrentPage = 1;
        renderLegacyTable();
    }

    // ৬. পেজিনেশন সহ ডাটা রেন্ডার করা
    async function renderLegacyTable() {
        const tbody = document.getElementById('legacyTableBody');
        const badge = document.getElementById('legacyCountBadge');
        const totalEl = document.getElementById('legacyTotalPayable');
        const paginationInfo = document.getElementById('legacyPaginationInfo');
        const paginationBtns = document.getElementById('legacyPaginationBtns');

        if (!tbody) return;

        const fb = await getFirebase();
        if (!fb) return;

        const snap = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
        if (!snap.exists()) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:25px; color:#94a3b8;">No records found.</td></tr>`;
            if (paginationInfo) paginationInfo.innerText = "Showing 0 to 0 of 0 entries";
            if (paginationBtns) paginationBtns.innerHTML = "";
            return;
        }

        const allData = Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val());
        let sheetRecords = allData.filter(t => t.source === 'Excel Sheet');

        // সার্চ ফিল্টার
        if (legacySearchQuery) {
            const q = legacySearchQuery.toLowerCase();
            sheetRecords = sheetRecords.filter(r => 
                (r.studentName && r.studentName.toLowerCase().includes(q)) ||
                (r.customerId && r.customerId.toLowerCase().includes(q)) ||
                (r.receiptNo && String(r.receiptNo).includes(q)) ||
                (r.class && r.class.toLowerCase().includes(q))
            );
        }

        let totalPayable = 0;
        sheetRecords.forEach(r => totalPayable += parseFloat(r.grossPayment || r.netDue || 0));

        const totalEntries = sheetRecords.length;
        if (badge) badge.innerText = `${totalEntries} Imported`;
        if (totalEl) totalEl.innerText = totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2 });

        if (totalEntries === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:25px; color:#94a3b8;">No Excel sheet records found.</td></tr>`;
            if (paginationInfo) paginationInfo.innerText = "Showing 0 to 0 of 0 entries";
            if (paginationBtns) paginationBtns.innerHTML = "";
            return;
        }

        // পেজিনেশন হিসাব
        const effectivePageSize = legacyRowsPerPage === -1 ? totalEntries : legacyRowsPerPage;
        const totalPages = Math.max(1, Math.ceil(totalEntries / (effectivePageSize || 1)));

        if (legacyCurrentPage > totalPages) legacyCurrentPage = totalPages;
        const startIndex = (legacyCurrentPage - 1) * effectivePageSize;
        const currentSlice = legacyRowsPerPage === -1 ? sheetRecords : sheetRecords.slice(startIndex, startIndex + effectivePageSize);

        let html = '';
        currentSlice.forEach(r => {
            const payable = parseFloat(r.grossPayment || r.netDue || 0);
            const isPaid = (r.status === 'Paid');
            const statusBadge = isPaid 
                ? `<span class="edu-pill-badge badge-paid">Paid</span>` 
                : `<span class="edu-pill-badge badge-pending">Pending</span>`;

            html += `
                <tr>
                    <td style="font-weight:700; color:#2563eb;">${r.receiptNo || '-'}</td>
                    <td>${r.date || '-'}</td>
                    <td><strong style="font-family:monospace;">${r.customerId || '-'}</strong></td>
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

        // পেজিনেশন ইনফো আপডেট
        if (paginationInfo) {
            const endIdx = Math.min(startIndex + effectivePageSize, totalEntries);
            paginationInfo.innerText = `Showing ${startIndex + 1} to ${endIdx} of ${totalEntries} entries`;
        }

        // পেজিনেশন বাটন তৈরি
        if (paginationBtns) {
            paginationBtns.innerHTML = '';
            if (totalPages > 1) {
                for (let i = 1; i <= Math.min(totalPages, 8); i++) {
                    const btn = document.createElement('button');
                    btn.className = `btn-act ${i === legacyCurrentPage ? 'btn-act-print' : 'btn-act-undo'}`;
                    btn.innerText = i;
                    btn.style.padding = "4px 10px";
                    btn.onclick = () => { 
                        legacyCurrentPage = i; 
                        renderLegacyTable(); 
                    };
                    paginationBtns.appendChild(btn);
                }
            }
        }
    }

    // ৭. ইভেন্ট লিসেনার
    function initLegacyEvents() {
        const fileInp = document.getElementById('legacyExcelFileInput');
        const fileNameEl = document.getElementById('legacyFileName');
        const btnUpload = document.getElementById('btnProcessLegacyExcel');
        const btnClear = document.getElementById('btnClearSheetImports');
        const searchInp = document.getElementById('legacySearchInput');
        const pageSizeSelect = document.getElementById('legacyPageSizeSelect');

        if (fileInp && fileNameEl) {
            fileInp.onchange = function () {
                fileNameEl.innerText = (this.files && this.files.length > 0) ? this.files[0].name : "No file chosen";
            };
        }

        if (btnUpload && fileInp) {
            btnUpload.onclick = function () {
                if (!fileInp.files || fileInp.files.length === 0) {
                    alert("Please select your Google Sheet file first!");
                    return;
                }
                processSheetExcel(fileInp.files[0]);
            };
        }

        if (btnClear) {
            btnClear.onclick = clearAllSheetImports;
        }

        if (searchInp) {
            searchInp.oninput = function() {
                legacySearchQuery = this.value.trim();
                legacyCurrentPage = 1;
                renderLegacyTable();
            };
        }

        if (pageSizeSelect) {
            pageSizeSelect.onchange = function() {
                legacyRowsPerPage = parseInt(this.value);
                legacyCurrentPage = 1;
                renderLegacyTable();
            };
        }
    }

    // ৮. টাইমার
    let retryTimer = setInterval(() => {
        const menuOk = injectLegacyMenuItem();
        const panelOk = injectLegacyPanel();
        if (menuOk && panelOk) {
            clearInterval(retryTimer);
            renderLegacyTable();
        }
    }, 250);

    getFirebase().then(fb => {
        if (fb) {
            fb.onValue(fb.ref(fb.db, 'erp/feeTransactions'), () => {
                renderLegacyTable();
            });
        }
    });

})();
