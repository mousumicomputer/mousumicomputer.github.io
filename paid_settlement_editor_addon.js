/**
 * Mousumi Computer ERP - Paid Settlement Enhanced Addon (Fixed & Compatible Edition)
 * 100% Compatible with fee_collection_module & fee_legacy_importer
 */

(function () {
    let firebaseCore = null;
    let paidList = [];
    let selectedRecord = null;

    let paidCurrentPage = 1;
    let paidRowsPerPage = 25;
    let paidSearchQuery = "";

    // ফায়ারবেস কানেক্টর (কমন কানেকশন ব্যবহারের চেষ্টা)
    async function getFirebase() {
        if (firebaseCore) return firebaseCore;
        try {
            const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const fbDb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            let app;
            try { app = fbApp.getApp(); } catch (e) {}
            
            if (!app) {
                app = fbApp.initializeApp({
                    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                    projectId: "mousumi-computer"
                }, "paidAddonApp");
            }

            const db = fbDb.getDatabase(app);
            firebaseCore = { 
                db, 
                ref: fbDb.ref, 
                set: fbDb.set, 
                update: fbDb.update, 
                get: fbDb.get, 
                onValue: fbDb.onValue 
            };
            return firebaseCore;
        } catch (err) {
            console.error("Firebase connection error:", err);
            return null;
        }
    }

    function injectStyles() {
        if (document.getElementById('paid-addon-styles')) return;
        const style = document.createElement('style');
        style.id = 'paid-addon-styles';
        style.innerHTML = `
            .paid-controls-bar {
                display: flex; justify-content: space-between; align-items: center;
                background: #f8fafc; padding: 10px 18px; border-radius: 30px;
                border: 1px solid #e2e8f0; margin: 12px 20px 0 20px; flex-wrap: wrap; gap: 10px;
            }
            .btn-paid-round {
                border-radius: 25px !important; padding: 8px 18px !important;
                font-size: 0.82rem !important; font-weight: 700 !important; border: none !important;
                cursor: pointer !important; display: inline-flex !important; align-items: center !important;
                gap: 6px !important; transition: all 0.2s !important;
            }
            .btn-paid-edit { background: #d97706 !important; color: #ffffff !important; }
            .btn-paid-edit:hover:not(:disabled) { background: #b45309 !important; }
            .btn-paid-edit:disabled { opacity: 0.35 !important; cursor: not-allowed !important; }

            .input-paid-round {
                height: 38px !important; border: 1px solid #cbd5e1 !important; border-radius: 20px !important;
                padding: 0 16px !important; font-size: 0.83rem !important; font-weight: 600 !important;
                outline: none !important; background: #ffffff !important; box-sizing: border-box !important;
            }
            .input-paid-round:focus { border-color: #2563eb !important; }

            #customPaidTableBody tr { cursor: pointer; transition: background 0.15s; }
            #customPaidTableBody tr.paid-row-selected td {
                background: #eff6ff !important; color: #1e40af !important;
                border-top: 1px solid #93c5fd !important; border-bottom: 1px solid #93c5fd !important;
            }
            #customPaidTableBody tr.paid-row-selected td:first-child {
                border-left: 2px solid #2563eb !important; border-top-left-radius: 12px !important; border-bottom-left-radius: 12px !important;
            }
            #customPaidTableBody tr.paid-row-selected td:last-child {
                border-right: 2px solid #2563eb !important; border-top-right-radius: 12px !important; border-bottom-right-radius: 12px !important;
            }

            .paid-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.45); display: none; align-items: center;
                justify-content: center; z-index: 999999; backdrop-filter: blur(2px);
            }
            .paid-modal-card {
                background: #ffffff; border-radius: 24px; width: 560px; max-width: 95%;
                padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); box-sizing: border-box;
            }
            .paid-modal-header {
                font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 16px;
                border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; display: flex;
                justify-content: space-between; align-items: center;
            }
            .paid-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
            .paid-field label { display: block; font-size: 0.76rem; font-weight: 700; color: #64748b; margin-bottom: 5px; padding-left: 6px; }
            .paid-field input {
                width: 100%; height: 38px; border: 1px solid #cbd5e1; border-radius: 20px;
                padding: 0 14px; font-size: 0.85rem; font-weight: 600; outline: none; background: #f8fafc; box-sizing: border-box;
            }
            .paid-field input:focus { border-color: #2563eb; background: #ffffff; }
        `;
        document.head.appendChild(style);
    }

    function setupPaidPanelUI() {
        const view = document.getElementById('edu-paid-settlement-view');
        if (!view || document.getElementById('paidControlsBar')) return;

        const originalTableBody = document.getElementById('paidSettlementTableBody');
        if (originalTableBody) {
            originalTableBody.id = 'deactivatedPaidTableBody';
        }

        const tableCard = view.querySelector('.edu-view-card');
        const tableResponsive = view.querySelector('.edu-table-responsive');
        if (!tableCard || !tableResponsive) return;

        const controlsHTML = `
            <div class="paid-controls-bar" id="paidControlsBar">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:0.8rem; font-weight:700; color:#64748b;">Show</span>
                    <select id="paidPageSizeSelect" class="input-paid-round" style="height:35px; width:75px; padding:0 8px;">
                        <option value="25" selected>25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="-1">All</option>
                    </select>
                    <button type="button" class="btn-paid-round btn-paid-edit" id="btnEditPaidRecord" disabled>
                        <i class="fa-solid fa-pen-to-square"></i> Edit Record
                    </button>
                </div>
                <div>
                    <input type="text" id="paidSearchInput" class="input-paid-round" placeholder="Search REC, STD ID, Name..." style="width:240px;">
                </div>
            </div>
        `;

        const headerClean = tableCard.querySelector('.edu-card-header-clean');
        if (headerClean) headerClean.insertAdjacentHTML('afterend', controlsHTML);

        tableResponsive.innerHTML = `
            <table class="edu-clean-table">
                <thead>
                    <tr>
                        <th>REC</th>
                        <th>DATE & TIME</th>
                        <th>STD ID</th>
                        <th>STUDENT NAME</th>
                        <th>GROSS PAID</th>
                        <th>COLLECTED</th>
                        <th>SETTLED TIME</th>
                        <th style="text-align:right;">ACTION</th>
                    </tr>
                </thead>
                <tbody id="customPaidTableBody">
                    <tr><td colspan="8" style="text-align:center; padding:25px; color:#94a3b8;">Loading records...</td></tr>
                </tbody>
            </table>
        `;

        const paginationHTML = `
            <div style="padding:10px 20px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <span id="paidPaginationInfo" style="font-size:0.82rem; color:#64748b; font-weight:600;">Showing 0 to 0 of 0 entries</span>
                <div id="paidPaginationBtns" style="display:flex; gap:5px;"></div>
            </div>
        `;
        tableCard.insertAdjacentHTML('beforeend', paginationHTML);

        injectEditModal();

        document.getElementById('paidSearchInput').oninput = function () {
            paidSearchQuery = this.value.trim();
            paidCurrentPage = 1;
            renderCustomPaidTable();
        };

        document.getElementById('paidPageSizeSelect').onchange = function () {
            paidRowsPerPage = parseInt(this.value);
            paidCurrentPage = 1;
            renderCustomPaidTable();
        };

        document.getElementById('btnEditPaidRecord').onclick = openEditModal;
    }

    function injectEditModal() {
        if (document.getElementById('paidEditModal')) return;

        const modalHTML = `
            <div class="paid-modal-overlay" id="paidEditModal">
                <div class="paid-modal-card">
                    <div class="paid-modal-header">
                        <span><i class="fa-solid fa-pen-to-square" style="color:#d97706; margin-right:6px;"></i> Edit Paid Record</span>
                        <span style="cursor:pointer; color:#94a3b8; font-size:18px; font-weight:bold;" id="btnClosePaidModal">✕</span>
                    </div>

                    <form id="paidEditForm">
                        <div class="paid-grid-2">
                            <div class="paid-field">
                                <label>REC (Receipt No)</label>
                                <input type="text" id="mFieldRec" readonly style="background:#f1f5f9; color:#64748b;">
                            </div>
                            <div class="paid-field">
                                <label>DATE (YYYY-MM-DD)</label>
                                <input type="date" id="mFieldDate" required>
                            </div>
                        </div>

                        <div class="paid-grid-2">
                            <div class="paid-field">
                                <label>STD ID</label>
                                <input type="text" id="mFieldStdId" required>
                            </div>
                            <div class="paid-field">
                                <label>STUDENT NAME</label>
                                <input type="text" id="mFieldName" required>
                            </div>
                        </div>

                        <div class="paid-grid-2">
                            <div class="paid-field">
                                <label>GROSS PAID (৳)</label>
                                <input type="number" step="any" id="mFieldGross" style="font-weight:700;">
                            </div>
                            <div class="paid-field">
                                <label>COLLECTED (৳)</label>
                                <input type="number" step="any" id="mFieldCollected" style="color:#15803d; font-weight:700;">
                            </div>
                        </div>

                        <div class="paid-field" style="margin-bottom:15px;">
                            <label>SETTLED TIME (Date & Time) *</label>
                            <input type="text" id="mFieldSettledTime" style="color:#2563eb; font-weight:700;" placeholder="DD-MM-YYYY hh:mm AM/PM" required>
                        </div>

                        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
                            <button type="button" class="btn-paid-round" style="background:#f1f5f9; color:#475569;" id="btnCancelPaidModal">Cancel</button>
                            <button type="submit" class="btn-paid-round btn-paid-edit">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        document.getElementById('btnClosePaidModal').onclick = closeEditModal;
        document.getElementById('btnCancelPaidModal').onclick = closeEditModal;
        document.getElementById('paidEditForm').onsubmit = handleSaveChanges;
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return '-';
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
    }

    function renderCustomPaidTable() {
        const tbody = document.getElementById('customPaidTableBody');
        const countBadge = document.getElementById('paidCountBadge');
        const sumEl = document.getElementById('paidTotalSum');
        const paginationInfo = document.getElementById('paidPaginationInfo');
        const paginationBtns = document.getElementById('paidPaginationBtns');
        const btnEdit = document.getElementById('btnEditPaidRecord');

        if (!tbody) return;

        let filtered = paidList.filter(t => t.status === 'Paid');

        if (paidSearchQuery) {
            const q = paidSearchQuery.toLowerCase();
            filtered = filtered.filter(t => 
                (t.receiptNo && String(t.receiptNo).includes(q)) ||
                (t.customerId && String(t.customerId).toLowerCase().includes(q)) ||
                (t.studentName && t.studentName.toLowerCase().includes(q)) ||
                (t.date && t.date.includes(q))
            );
        }

        let totalSum = 0;
        filtered.forEach(t => totalSum += parseFloat(t.grossPayment || t.netReceived || 0));

        if (countBadge) countBadge.innerText = `${filtered.length} Paid`;
        if (sumEl) sumEl.innerText = totalSum.toLocaleString('en-US', { minimumFractionDigits: 2 });

        const totalEntries = filtered.length;
        if (totalEntries === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:25px; color:#94a3b8;">No paid records found.</td></tr>`;
            if (paginationInfo) paginationInfo.innerText = "Showing 0 to 0 of 0 entries";
            if (paginationBtns) paginationBtns.innerHTML = "";
            if (btnEdit) btnEdit.disabled = true;
            return;
        }

        const effectiveSize = paidRowsPerPage === -1 ? totalEntries : paidRowsPerPage;
        const totalPages = Math.max(1, Math.ceil(totalEntries / (effectiveSize || 1)));
        if (paidCurrentPage > totalPages) paidCurrentPage = totalPages;

        const startIndex = (paidCurrentPage - 1) * effectiveSize;
        const currentSlice = paidRowsPerPage === -1 ? filtered : filtered.slice(startIndex, startIndex + effectiveSize);

        let html = '';
        currentSlice.forEach(t => {
            const isSelected = selectedRecord && (selectedRecord.id === t.id);
            const gross = parseFloat(t.grossPayment || t.netDue || 0);
            const collected = parseFloat(t.netReceived || gross || 0);
            const dateDisplay = formatDateDisplay(t.date);
            const dateTimeDisplay = `${dateDisplay} ${t.time ? '<span style="font-size:0.75rem; color:#64748b;">' + t.time + '</span>' : ''}`;

            html += `
                <tr class="${isSelected ? 'paid-row-selected' : ''}" onclick="window.selectPaidRow('${t.id}')">
                    <td style="font-weight:700; color:#10b981;">${t.receiptNo || '-'}</td>
                    <td>${dateTimeDisplay}</td>
                    <td><strong style="font-family:monospace;">${t.customerId || '-'}</strong></td>
                    <td style="font-weight:600;">${t.studentName || '-'}</td>
                    <td style="font-weight:700; color:#b45309;">৳ ${gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="font-weight:700; color:#15803d;">৳ ${collected.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="color:#2563eb; font-weight:700;">${t.paidTimestamp || '-'}</td>
                    <td style="text-align:right;" onclick="event.stopPropagation();">
                        <button class="btn-act btn-act-undo" style="padding:4px 8px; font-size:0.75rem;" onclick="window.revertTapPaidToPending('${t.id}')">Revert</button>
                        <button class="btn-act btn-act-print" style="padding:4px 8px; font-size:0.75rem;" onclick="window.printRowReceipt('${t.id}')">Print</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        if (paginationInfo) {
            paginationInfo.innerText = `Showing ${startIndex + 1} to ${Math.min(startIndex + effectiveSize, totalEntries)} of ${totalEntries} entries`;
        }

        if (paginationBtns) {
            paginationBtns.innerHTML = '';
            if (totalPages > 1) {
                for (let i = 1; i <= Math.min(totalPages, 8); i++) {
                    const btn = document.createElement('button');
                    btn.className = `btn-act ${i === paidCurrentPage ? 'btn-act-print' : 'btn-act-undo'}`;
                    btn.innerText = i;
                    btn.style.padding = "4px 10px";
                    btn.onclick = () => { paidCurrentPage = i; renderCustomPaidTable(); };
                    paginationBtns.appendChild(btn);
                }
            }
        }
    }

    window.selectPaidRow = function (txId) {
        selectedRecord = paidList.find(t => t.id === txId) || null;
        const btnEdit = document.getElementById('btnEditPaidRecord');
        if (btnEdit) btnEdit.disabled = !selectedRecord;
        renderCustomPaidTable();
    };

    function openEditModal() {
        if (!selectedRecord) return;

        document.getElementById('mFieldRec').value = selectedRecord.receiptNo || '-';
        document.getElementById('mFieldDate').value = selectedRecord.date || '';
        document.getElementById('mFieldStdId').value = selectedRecord.customerId || '';
        document.getElementById('mFieldName').value = selectedRecord.studentName || '';
        document.getElementById('mFieldGross').value = selectedRecord.grossPayment || '';
        document.getElementById('mFieldCollected').value = selectedRecord.netReceived || '';
        document.getElementById('mFieldSettledTime').value = selectedRecord.paidTimestamp || '';

        document.getElementById('paidEditModal').style.display = 'flex';
    }

    function closeEditModal() {
        const modal = document.getElementById('paidEditModal');
        if (modal) modal.style.display = 'none';
    }

    // ১০০% নিরাপদ সেভ: শুধুমাত্র পরিবর্তন হওয়া ফিল্ডগুলোতে fb.update()
    async function handleSaveChanges(e) {
        e.preventDefault();
        if (!selectedRecord || !selectedRecord.id) return;

        const updatedDate = document.getElementById('mFieldDate').value;
        const updatedStdId = document.getElementById('mFieldStdId').value.trim();
        const updatedName = document.getElementById('mFieldName').value.trim();
        const updatedGross = parseFloat(document.getElementById('mFieldGross').value) || selectedRecord.grossPayment;
        const updatedCollected = parseFloat(document.getElementById('mFieldCollected').value) || selectedRecord.netReceived;
        const updatedSettled = document.getElementById('mFieldSettledTime').value.trim();

        const fb = await getFirebase();
        if (!fb) return alert("Firebase connection failed!");

        const updates = {
            date: updatedDate,
            customerId: updatedStdId,
            studentName: updatedName,
            grossPayment: updatedGross,
            netReceived: updatedCollected,
            paidTimestamp: updatedSettled
        };

        try {
            // শুধুমাত্র নির্ধারিত ট্রানজাকশন নোড আপডেট (অন্য কোনো ফিল্ড ডিলিট হবে না)
            await fb.update(fb.ref(fb.db, 'erp/feeTransactions/' + selectedRecord.id), updates);
            
            // লোকাল স্টেট সিঙ্ক
            Object.assign(selectedRecord, updates);
            closeEditModal();
            if (typeof showToast === 'function') showToast("Record updated successfully!", "success");
            else alert("Record updated successfully!");
            renderCustomPaidTable();
        } catch (err) {
            console.error("Save error:", err);
            alert("Error updating record in Firebase!");
        }
    }

    // ফায়ারবেস লিসেনার (ID মিসিং প্রতিরোধক)
    async function initFirebaseListener() {
        const fb = await getFirebase();
        if (!fb) return;

        fb.onValue(fb.ref(fb.db, 'erp/feeTransactions'), (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                paidList = [];
            } else if (Array.isArray(data)) {
                paidList = data.map((item, idx) => ({ ...item, id: item.id || String(idx) }));
            } else {
                paidList = Object.entries(data).map(([key, val]) => ({
                    ...val,
                    id: val.id || key
                }));
            }
            
            // সর্টিং: নতুন তারিখ ও বড় রসিদ উপরে থাকবে
            paidList.sort((a, b) => {
                const dateA = a.date || '';
                const dateB = b.date || '';
                if (dateA !== dateB) return dateB.localeCompare(dateA);
                const recA = parseInt(a.receiptNo) || 0;
                const recB = parseInt(b.receiptNo) || 0;
                return recB - recA;
            });

            renderCustomPaidTable();
        });
    }

    let checkInterval = setInterval(() => {
        const view = document.getElementById('edu-paid-settlement-view');
        if (view) {
            clearInterval(checkInterval);
            injectStyles();
            setupPaidPanelUI();
            initFirebaseListener();
        }
    }, 300);

})();
