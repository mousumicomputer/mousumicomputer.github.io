/**
 * Mousumi Computer ERP - Legacy Importer & Core Enhancement Suite
 * Features Added:
 * 1. Google Sheet Pending Importer with Pagination
 * 2. Auto Receipt Numbering starting from 3601 (Max + 1 logic)
 * 3. Auto Unlock Manual Entry for Unknown / New Students
 * 4. Multi-Select, Bulk Restore & Permanent Delete for EDU VOID LOGS
 */

(function () {
    let firebaseCore = null;

    // শিট ইমপোর্ট পেজিনেশন স্টেট
    let legacyCurrentPage = 1;
    let legacyRowsPerPage = 25;
    let legacySearchQuery = "";

    // ভয়েড লগ মাল্টি-সিলেক্ট স্টেট
    let selectedVoidIds = new Set();

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
                }, "enhancerModuleApp_" + Date.now());
            }

            const db = fbDb.getDatabase(app);
            firebaseCore = { db, ref: fbDb.ref, set: fbDb.set, get: fbDb.get, onValue: fbDb.onValue };
            return firebaseCore;
        } catch (err) {
            console.error("Firebase error:", err);
            return null;
        }
    }

    // =========================================================================
    // FEATURE 1: রসিদ নম্বর ৩৬০১ থেকে শুরু এবং নতুন শিক্ষার্থী ম্যানুয়াল এন্ট্রি
    // =========================================================================

    function initFeeFormEnhancements() {
        const idInp = document.getElementById('origId');
        const nameInp = document.getElementById('origName');
        const dueInp = document.getElementById('origDue');
        const origForm = document.getElementById('feeFormOriginal');

        if (!idInp || !nameInp || !dueInp || !origForm) return;

        // নোটিশ ব্যাজ তৈরি
        let statusBadge = document.getElementById('manualStudentBadge');
        if (!statusBadge) {
            statusBadge = document.createElement('div');
            statusBadge.id = 'manualStudentBadge';
            statusBadge.style.cssText = 'display:none; font-size:0.75rem; font-weight:700; color:#2563eb; margin-top:4px;';
            statusBadge.innerHTML = '<i class="fa-solid fa-user-plus"></i> New Student (Manual Input Enabled)';
            nameInp.parentNode.appendChild(statusBadge);
        }

        // আইডি টাইপ করার সময় স্বয়ংক্রিয়ভাবে চেক
        idInp.addEventListener('input', async function () {
            const val = this.value.trim();
            if (!val) {
                statusBadge.style.display = 'none';
                nameInp.readOnly = true;
                dueInp.readOnly = true;
                return;
            }

            const fb = await getFirebase();
            if (!fb) return;

            // মাস্টার ডিউ ডাটাবেস চেক
            const dueSnap = await fb.get(fb.ref(fb.db, 'erp/studentDueData'));
            const dues = dueSnap.exists() ? (Array.isArray(dueSnap.val()) ? dueSnap.val() : Object.values(dueSnap.val())) : [];

            const found = dues.find(s => 
                String(s.stdId).trim() === val || 
                String(s.mobile).trim() === val
            );

            if (!found) {
                // ডাটাবেসে না পাওয়া গেলে আনলক করা
                nameInp.readOnly = false;
                dueInp.readOnly = false;
                statusBadge.style.display = 'block';
                nameInp.placeholder = "Enter Student Name";
                dueInp.placeholder = "0.00";
            } else {
                nameInp.readOnly = true;
                dueInp.readOnly = true;
                statusBadge.style.display = 'none';
            }
        });

        // ম্যানুয়াল ডিউ টাইপ করলে হিসাব আপডেট
        dueInp.addEventListener('input', function() {
            if (!dueInp.readOnly) {
                const discount = parseFloat(document.getElementById('origDisc')?.value || 0) || 0;
                const txnFee = parseFloat(document.getElementById('origTxn')?.value || 6) || 6;
                const inputDue = parseFloat(this.value || 0) || 0;

                const netDue = Math.max(0, inputDue - discount);
                const percentCharge = netDue * 0.01;
                const totalCharge = percentCharge + txnFee;
                const netReceived = netDue + totalCharge;

                const chargeText = document.getElementById('origCharge');
                const recInp = document.getElementById('origRec');
                if (chargeText) chargeText.innerText = totalCharge.toFixed(2);
                if (recInp) recInp.value = netReceived.toFixed(2);
            }
        });

        // ফর্ম সাবমিট ইন্টারসেপ্ট - ৩৬০১ থেকে রসিদ নম্বর নির্ধারণ
        origForm.addEventListener('submit', async function (e) {
            // মূল ইভেন্টকে সামান্য ওভাররাইড করে নিশ্চিত করা হচ্ছে ৩৬০১ থেকে শুরু হবে
            const fb = await getFirebase();
            if (!fb) return;

            const snapTx = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
            const snapVoid = await fb.get(fb.ref(fb.db, 'erp/feeVoidLogs'));

            const txList = snapTx.exists() ? (Array.isArray(snapTx.val()) ? snapTx.val() : Object.values(snapTx.val())) : [];
            const voidList = snapVoid.exists() ? (Array.isArray(snapVoid.val()) ? snapVoid.val() : Object.values(snapVoid.val())) : [];

            // সর্বোচ্চ রসিদ নম্বর খুঁজে বের করা
            let maxReceipt = 3600; // বেস পয়েন্ট ৩৬০০, যাতে প্রথমটি হয় ৩৬০১
            [...txList, ...voidList].forEach(t => {
                const num = parseInt(String(t.receiptNo).replace(/\D/g, ''));
                if (!isNaN(num) && num > maxReceipt) {
                    maxReceipt = num;
                }
            });

            const nextReceiptNo = String(maxReceipt + 1);

            // নতুন তৈরি হওয়া রেকর্ডের রসিদ নম্বর ৩৬০১+ নিশ্চিত করা
            setTimeout(async () => {
                const latestSnap = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
                if (latestSnap.exists()) {
                    let currentList = Array.isArray(latestSnap.val()) ? latestSnap.val() : Object.values(latestSnap.val());
                    if (currentList.length > 0) {
                        const firstTx = currentList[0];
                        if (parseInt(firstTx.receiptNo) < 3601) {
                            firstTx.receiptNo = nextReceiptNo;
                            await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), currentList);
                        }
                    }
                }
            }, 100);
        }, true);
    }

    // =========================================================================
    // FEATURE 2: EDU VOID LOGS - মাল্টি সিলেক্ট ও পার্মানেন্ট ডিলিট
    // =========================================================================

    function enhanceVoidLogsUI() {
        const voidCard = document.querySelector('#edu-void-logs-view .edu-view-card');
        if (!voidCard || document.getElementById('voidActionBarStrip')) return;

        // অ্যাকশন কন্ট্রোল বার ইনজেক্ট
        const actionBarHTML = `
            <div class="pending-action-bar-strip" id="voidActionBarStrip" style="margin: 10px 20px 0 20px;">
                <div class="selection-status-badge" id="voidSelectionLabel">
                    <span>No record selected</span>
                </div>
                <div class="pending-action-btns">
                    <button type="button" class="btn-act btn-act-undo" id="btnBulkRestoreVoid" disabled style="padding:5px 12px; font-size:0.78rem;">
                        <i class="fa-solid fa-rotate-left"></i> Restore Selected
                    </button>
                    <button type="button" class="btn-act btn-act-void" id="btnBulkDeleteVoid" disabled style="padding:5px 12px; font-size:0.78rem;">
                        <i class="fa-solid fa-trash-can"></i> Delete Permanently
                    </button>
                </div>
            </div>
        `;

        const headerClean = voidCard.querySelector('.edu-card-header-clean');
        if (headerClean) headerClean.insertAdjacentHTML('afterend', actionBarHTML);

        // টেবিল হেডারে চেকবক্স যোগ করা
        const theadRow = voidCard.querySelector('thead tr');
        if (theadRow && !theadRow.querySelector('.void-th-cb')) {
            const th = document.createElement('th');
            th.className = 'void-th-cb';
            th.style.width = '36px';
            th.style.textAlign = 'center';
            th.innerHTML = `<input type="checkbox" id="selectAllVoidCheckbox" class="edu-checkbox" title="Select All">`;
            theadRow.insertBefore(th, theadRow.firstChild);
        }

        // ইভেন্ট বাইন্ডিং
        document.getElementById('selectAllVoidCheckbox')?.addEventListener('change', function () {
            toggleSelectAllVoid(this.checked);
        });
        document.getElementById('btnBulkRestoreVoid')?.addEventListener('click', bulkRestoreVoid);
        document.getElementById('btnBulkDeleteVoid')?.addEventListener('click', bulkPermanentDeleteVoid);
    }

    // কাস্টম রেন্ডারিং ফর ভয়েড টেবিল (চেকবক্স সহ)
    async function renderCustomVoidTable() {
        const tbody = document.getElementById('voidLogsTableBody');
        const badge = document.getElementById('voidCountBadge');
        const selectLabel = document.getElementById('voidSelectionLabel');
        const btnRestore = document.getElementById('btnBulkRestoreVoid');
        const btnDelete = document.getElementById('btnBulkDeleteVoid');
        const selectAllCb = document.getElementById('selectAllVoidCheckbox');

        if (!tbody) return;

        const fb = await getFirebase();
        if (!fb) return;

        const snap = await fb.get(fb.ref(fb.db, 'erp/feeVoidLogs'));
        const voidList = snap.exists() ? (Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val())) : [];

        if (badge) badge.innerText = `${voidList.length} Voided`;

        // সিলেকশন স্ট্যাটাস
        const selCount = selectedVoidIds.size;
        if (selCount > 0) {
            if (selectLabel) selectLabel.innerHTML = `<strong style="color:#0f172a;">${selCount} Record(s) Selected</strong>`;
            if (btnRestore) btnRestore.disabled = false;
            if (btnDelete) btnDelete.disabled = false;
        } else {
            if (selectLabel) selectLabel.innerHTML = `<span>No record selected</span>`;
            if (btnRestore) btnRestore.disabled = true;
            if (btnDelete) btnDelete.disabled = true;
        }

        if (selectAllCb) {
            selectAllCb.checked = (voidList.length > 0 && selCount === voidList.length);
        }

        if (voidList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:25px; color:#94a3b8;">No void logs found.</td></tr>`;
            return;
        }

        let html = '';
        voidList.forEach(v => {
            const isSelected = selectedVoidIds.has(v.id);
            html += `
                <tr class="row-selectable ${isSelected ? 'row-selected' : ''}" onclick="window.toggleVoidSelection('${v.id}')">
                    <td style="text-align:center;" onclick="event.stopPropagation();">
                        <input type="checkbox" class="edu-checkbox" ${isSelected ? 'checked' : ''} onchange="window.toggleVoidSelection('${v.id}', event)">
                    </td>
                    <td style="font-weight:700; color:#dc2626;">${v.receiptNo || '-'}</td>
                    <td style="font-size:0.8rem;">${v.voidDate || '-'}</td>
                    <td><strong>${v.customerId}</strong> (${v.studentName})</td>
                    <td>৳ ${parseFloat(v.netReceived || 0).toFixed(2)}</td>
                    <td style="color:#b91c1c;">${v.voidReason || 'Cancelled'}</td>
                    <td style="font-size:0.8rem;">${v.voidedBy || 'Admin'}</td>
                    <td style="text-align:right;">
                        <button class="btn-act btn-act-undo" style="padding:4px 8px; font-size:0.75rem;" onclick="window.restoreVoidedRecord('${v.id}')">Restore</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    window.toggleVoidSelection = function (id, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (selectedVoidIds.has(id)) {
            selectedVoidIds.delete(id);
        } else {
            selectedVoidIds.add(id);
        }
        renderCustomVoidTable();
    };

    function toggleSelectAllVoid(checked) {
        getFirebase().then(async fb => {
            if (!fb) return;
            const snap = await fb.get(fb.ref(fb.db, 'erp/feeVoidLogs'));
            const voidList = snap.exists() ? (Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val())) : [];
            if (checked) {
                voidList.forEach(v => selectedVoidIds.add(v.id));
            } else {
                selectedVoidIds.clear();
            }
            renderCustomVoidTable();
        });
    }

    async function bulkRestoreVoid() {
        if (selectedVoidIds.size === 0) return;
        const fb = await getFirebase();
        if (!fb) return;

        const snapVoid = await fb.get(fb.ref(fb.db, 'erp/feeVoidLogs'));
        const snapTx = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));

        let voidList = snapVoid.exists() ? (Array.isArray(snapVoid.val()) ? snapVoid.val() : Object.values(snapVoid.val())) : [];
        let txList = snapTx.exists() ? (Array.isArray(snapTx.val()) ? snapTx.val() : Object.values(snapTx.val())) : [];

        const ids = Array.from(selectedVoidIds);
        let restoredCount = 0;

        for (let i = voidList.length - 1; i >= 0; i--) {
            if (ids.includes(voidList[i].id)) {
                const [item] = voidList.splice(i, 1);
                item.status = 'Pending';
                delete item.voidReason;
                delete item.voidDate;
                txList.unshift(item);
                restoredCount++;
            }
        }

        await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), txList);
        await fb.set(fb.ref(fb.db, 'erp/feeVoidLogs'), voidList);

        selectedVoidIds.clear();
        alert(`${restoredCount} record(s) restored to Pending!`);
        renderCustomVoidTable();
    }

    async function bulkPermanentDeleteVoid() {
        if (selectedVoidIds.size === 0) return;
        if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${selectedVoidIds.size} record(s)? This cannot be undone!`)) {
            return;
        }

        const fb = await getFirebase();
        if (!fb) return;

        const snapVoid = await fb.get(fb.ref(fb.db, 'erp/feeVoidLogs'));
        let voidList = snapVoid.exists() ? (Array.isArray(snapVoid.val()) ? snapVoid.val() : Object.values(snapVoid.val())) : [];

        const ids = Array.from(selectedVoidIds);
        voidList = voidList.filter(v => !ids.includes(v.id));

        await fb.set(fb.ref(fb.db, 'erp/feeVoidLogs'), voidList);
        selectedVoidIds.clear();
        alert("Selected records permanently deleted!");
        renderCustomVoidTable();
    }

    // =========================================================================
    // FEATURE 3: GOOGLE SHEET IMPORTER (WITH PAGINATION)
    // =========================================================================

    function injectLegacyMenuItem() {
        const parentMenu = document.getElementById('menu-edu-parent');
        if (!parentMenu) return false;
        const submenuList = parentMenu.querySelector('.submenu-list');
        if (!submenuList || document.getElementById('menu-item-legacy-import')) return false;

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

    function sanitizeNumber(val) {
        if (!val) return 0;
        return parseFloat(String(val).replace(/,/g, '').replace(/[^0-9.-]/g, '')) || 0;
    }

    function sanitizeText(val) {
        if (!val) return '-';
        const str = String(val).trim();
        return (str.includes('#REF!') || str.includes('#N/A') || str === '') ? '-' : str;
    }

    function sanitizeDate(val) {
        if (!val) return new Date().toISOString().split('T')[0];
        if (typeof val === 'number' || (!isNaN(val) && String(val).trim().length >= 4 && !String(val).includes('-') && !String(val).includes('/'))) {
            try {
                const numericDate = parseFloat(val);
                const excelEpoch = new Date(Date.UTC(1899, 11, 30));
                return new Date(excelEpoch.getTime() + numericDate * 86400000).toISOString().split('T')[0];
            } catch(e) {}
        }
        const str = String(val).trim();
        if (str.includes('-') || str.includes('/')) {
            const parts = str.split(str.includes('-') ? '-' : '/');
            if (parts.length === 3 && parts[2].length === 4) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        return str;
    }

    function extractReceiptNo(row, fallbackIndex) {
        const keys = Object.keys(row);
        for (let k of keys) {
            const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (['rcvno', 'receiptno', 'recno', 'receipt', 'voucherno'].includes(clean)) {
                const v = String(row[k]).trim();
                if (v && v.toLowerCase() !== 'total') return v;
            }
        }
        for (let k of keys) {
            const clean = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (['sl', 'slno'].includes(clean)) {
                const v = String(row[k]).trim();
                if (v && v.toLowerCase() !== 'total') return v;
            }
        }
        return String(3400 + fallbackIndex);
    }

    async function processSheetExcel(file) {
        if (typeof XLSX === 'undefined') return alert("XLSX library not ready!");
        const reader = new FileReader();
        reader.onload = async function (e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
                if (!json || json.length === 0) return alert("File is empty!");

                const fb = await getFirebase();
                if (!fb) return;

                const snap = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
                let currentTransactions = snap.exists() ? (Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val())) : [];

                if (currentTransactions.some(t => t.source === 'Excel Sheet')) {
                    if (confirm("Replace previous uploaded sheet records with this new file?")) {
                        currentTransactions = currentTransactions.filter(t => t.source !== 'Excel Sheet');
                    }
                }

                let addedCount = 0;
                json.forEach((row, idx) => {
                    const studentName = sanitizeText(row['Student Name'] || row['Name']);
                    const stdId = sanitizeText(row['Id'] || row['ID'] || row['Std Id'] || row['stdid']);
                    if (String(row['Sl']).toLowerCase() === 'total' || String(row['Rcv. No']).toLowerCase() === 'total' || (!studentName && !stdId) || stdId === '-') return;

                    const slNo = extractReceiptNo(row, idx);
                    const netDue = sanitizeNumber(row['Net Due'] || row['Due']);
                    const txnFee = sanitizeNumber(row['Txn Fee'] || 6);
                    const totalCharge = sanitizeNumber(row['Total Charge'] || 6);
                    const netReceived = sanitizeNumber(row['Net Received'] || (netDue + totalCharge));
                    const grossPayment = sanitizeNumber(row['Gross Payment'] || netDue);

                    currentTransactions.unshift({
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
                        date: sanitizeDate(row['Date'] || row['DATE']),
                        time: '10:00 AM',
                        status: 'Pending',
                        source: 'Excel Sheet',
                        receivedBy: 'Google Sheet Migration'
                    });
                    addedCount++;
                });

                await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), currentTransactions);
                alert(`Success! ${addedCount} records uploaded cleanly.`);
                legacyCurrentPage = 1;
                renderLegacyTable();
            } catch (err) { alert("Error processing file!"); }
        };
        reader.readAsArrayBuffer(file);
    }

    async function clearAllSheetImports() {
        if (!confirm("Remove all imported sheet records? (Normal shop records will NOT be deleted)")) return;
        const fb = await getFirebase();
        if (!fb) return;
        const snap = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
        if (!snap.exists()) return;
        const allData = Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val());
        await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), allData.filter(t => t.source !== 'Excel Sheet'));
        alert("All imported sheet records cleared!");
        legacyCurrentPage = 1;
        renderLegacyTable();
    }

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
            return;
        }

        let sheetRecords = (Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val())).filter(t => t.source === 'Excel Sheet');

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

        const effectivePageSize = legacyRowsPerPage === -1 ? totalEntries : legacyRowsPerPage;
        const totalPages = Math.max(1, Math.ceil(totalEntries / (effectivePageSize || 1)));
        if (legacyCurrentPage > totalPages) legacyCurrentPage = totalPages;
        const startIndex = (legacyCurrentPage - 1) * effectivePageSize;
        const currentSlice = legacyRowsPerPage === -1 ? sheetRecords : sheetRecords.slice(startIndex, startIndex + effectivePageSize);

        let html = '';
        currentSlice.forEach(r => {
            const payable = parseFloat(r.grossPayment || r.netDue || 0);
            const statusBadge = (r.status === 'Paid') 
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

        if (paginationInfo) {
            paginationInfo.innerText = `Showing ${startIndex + 1} to ${Math.min(startIndex + effectivePageSize, totalEntries)} of ${totalEntries} entries`;
        }

        if (paginationBtns) {
            paginationBtns.innerHTML = '';
            if (totalPages > 1) {
                for (let i = 1; i <= Math.min(totalPages, 8); i++) {
                    const btn = document.createElement('button');
                    btn.className = `btn-act ${i === legacyCurrentPage ? 'btn-act-print' : 'btn-act-undo'}`;
                    btn.innerText = i;
                    btn.style.padding = "4px 10px";
                    btn.onclick = () => { legacyCurrentPage = i; renderLegacyTable(); };
                    paginationBtns.appendChild(btn);
                }
            }
        }
    }

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
                if (!fileInp.files || fileInp.files.length === 0) return alert("Select Excel file first!");
                processSheetExcel(fileInp.files[0]);
            };
        }
        if (btnClear) btnClear.onclick = clearAllSheetImports;
        if (searchInp) searchInp.oninput = function () { legacySearchQuery = this.value.trim(); legacyCurrentPage = 1; renderLegacyTable(); };
        if (pageSizeSelect) pageSizeSelect.onchange = function () { legacyRowsPerPage = parseInt(this.value); legacyCurrentPage = 1; renderLegacyTable(); };
    }

    // স্বয়ংক্রিয় ইনিট টাইমার
    let retryTimer = setInterval(() => {
        const menuOk = injectLegacyMenuItem();
        const panelOk = injectLegacyPanel();
        enhanceVoidLogsUI();
        initFeeFormEnhancements();
        if (menuOk && panelOk) {
            clearInterval(retryTimer);
            renderLegacyTable();
            renderCustomVoidTable();
        }
    }, 250);

    // ফায়ারবেস চেঞ্জ লিসেনার
    getFirebase().then(fb => {
        if (fb) {
            fb.onValue(fb.ref(fb.db, 'erp/feeTransactions'), renderLegacyTable);
            fb.onValue(fb.ref(fb.db, 'erp/feeVoidLogs'), renderCustomVoidTable);
        }
    });

})();
