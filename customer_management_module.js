/* ==========================================================
   ENTERPRISE CUSTOMER MANAGEMENT & LEDGER MODULE
   Design: Modern Corporate SaaS UI (English, Minimalist)
   File: customer_management_module.js
   ========================================================== */

// ১. কর্পোরেট সিএসএস
const injectCorporateStyles = () => {
    if (document.getElementById('erp-corporate-css')) return;
    const style = document.createElement('style');
    style.id = 'erp-corporate-css';
    style.innerHTML = `
        #customer-ledger-view {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            color: #0f172a;
        }
        .corp-kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }
        .corp-kpi-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 16px 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .corp-kpi-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .corp-kpi-title {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
        }
        .corp-kpi-icon {
            font-size: 1rem;
            color: #94a3b8;
        }
        .corp-kpi-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.5px;
        }
        .corp-kpi-subtitle {
            font-size: 0.75rem;
            color: #94a3b8;
            margin-top: 4px;
            font-weight: 500;
        }
        .corp-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
        }
        .corp-search-wrapper {
            position: relative;
            flex: 1;
            max-width: 380px;
            min-width: 250px;
        }
        .corp-search-wrapper i {
            position: absolute;
            left: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 0.85rem;
        }
        .corp-search-input {
            width: 100%;
            height: 38px;
            padding: 0 12px 0 36px;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            font-size: 0.88rem;
            color: #1e293b;
            background: #ffffff;
            outline: none;
            transition: border-color 0.2s;
        }
        .corp-search-input:focus {
            border-color: #0f172a;
        }
        .corp-btn-group {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .corp-btn {
            height: 38px;
            padding: 0 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            border: 1px solid transparent;
        }
        .corp-btn-default {
            background: #ffffff;
            border-color: #cbd5e1;
            color: #334155;
        }
        .corp-btn-default:hover {
            background: #f8fafc;
            border-color: #94a3b8;
        }
        .corp-btn-primary {
            background: #0f172a;
            color: #ffffff;
        }
        .corp-btn-primary:hover {
            background: #1e293b;
        }
        .corp-table-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .corp-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }
        .corp-table th {
            background: #f8fafc;
            padding: 12px 16px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
        }
        .corp-table td {
            padding: 14px 16px;
            font-size: 0.88rem;
            color: #334155;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
        }
        .corp-table tr:hover td {
            background: #fcfdfe;
        }
        .corp-table tr:last-child td {
            border-bottom: none;
        }
        .corp-cust-cell {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .corp-avatar {
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: #f1f5f9;
            color: #475569;
            font-weight: 700;
            font-size: 0.85rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
        }
        .corp-cust-meta strong {
            display: block;
            color: #0f172a;
            font-weight: 600;
            font-size: 0.9rem;
        }
        .corp-cust-meta span {
            font-size: 0.75rem;
            color: #94a3b8;
        }
        .corp-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .badge-due {
            background: #fef2f2;
            color: #dc2626;
            border: 1px solid #fee2e2;
        }
        .badge-settled {
            background: #f0fdf4;
            color: #16a34a;
            border: 1px solid #dcfce7;
        }
        .badge-advance {
            background: #eff6ff;
            color: #2563eb;
            border: 1px solid #dbeafe;
        }
        .btn-table-action {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            color: #334155;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-table-action:hover {
            background: #0f172a;
            color: #ffffff;
            border-color: #0f172a;
        }
        .btn-action-delete {
            background: #fff;
            border: 1px solid #fee2e2;
            color: #ef4444;
            width: 30px;
            height: 30px;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn-action-delete:hover {
            background: #ef4444;
            color: #ffffff;
        }
    `;
    document.head.appendChild(style);
};

// ২. কাস্টমার বর্তমান বকেয়া হিসাব
window.calculateCustomerCurrentDue = function(custId) {
    const customers = window.customers || [];
    const cust = customers.find(c => c.id === custId);
    if (!cust) return 0;

    let due = parseFloat(cust.openingBalance) || 0;
    const txs = (window.customerTransactions || []).filter(t => t.customerId === custId);

    txs.forEach(t => {
        due += (parseFloat(t.debit) || 0);
        due -= (parseFloat(t.credit) || 0);
    });

    return due;
};

// ৩. কাস্টমার লিস্ট এবং মডার্ন ড্যাশবোর্ড রেন্ডার
window.renderCustomerListTable = function() {
    injectCorporateStyles();

    // হেডার টাইটেল আপডেট
    const topTitle = document.getElementById('top-title');
    if (topTitle) topTitle.innerText = "Customer Management";

    const container = document.getElementById('cust-list-section');
    if (!container) return;

    const customers = window.customers || [];
    const customerTransactions = window.customerTransactions || [];

    // সার্চ ইনপুট চেক
    const searchInput = document.getElementById('custSearchInput');
    const filterVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = customers.filter(c => 
        (c.name || '').toLowerCase().includes(filterVal) ||
        (c.phone || '').toLowerCase().includes(filterVal) ||
        (c.id || '').toLowerCase().includes(filterVal)
    );

    let totalReceivable = 0;
    let totalPayable = 0;
    let dueCount = 0;
    let todayColl = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    customers.forEach(c => {
        const currentDue = window.calculateCustomerCurrentDue(c.id);
        if (currentDue > 0) {
            totalReceivable += currentDue;
            dueCount++;
        } else if (currentDue < 0) {
            totalPayable += Math.abs(currentDue);
        }
    });

    customerTransactions.filter(t => t.date === todayStr).forEach(t => {
        todayColl += (parseFloat(t.credit) || 0);
    });

    const fmt = (num) => '৳ ' + (parseFloat(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    container.innerHTML = `
        <!-- Top KPI Metric Cards -->
        <div class="corp-kpi-grid">
            <div class="corp-kpi-card">
                <div class="corp-kpi-header">
                    <span class="corp-kpi-title">TOTAL CUSTOMERS</span>
                    <i class="fa-solid fa-users corp-kpi-icon"></i>
                </div>
                <div class="corp-kpi-value">${customers.length}</div>
                <div class="corp-kpi-subtitle">Active customer database</div>
            </div>

            <div class="corp-kpi-card">
                <div class="corp-kpi-header">
                    <span class="corp-kpi-title">TOTAL RECEIVABLES</span>
                    <i class="fa-solid fa-hand-holding-dollar corp-kpi-icon"></i>
                </div>
                <div class="corp-kpi-value" style="color: #dc2626;">${fmt(totalReceivable)}</div>
                <div class="corp-kpi-subtitle">Outstanding customer dues</div>
            </div>

            <div class="corp-kpi-card">
                <div class="corp-kpi-header">
                    <span class="corp-kpi-title">TODAY'S COLLECTION</span>
                    <i class="fa-solid fa-calendar-check corp-kpi-icon"></i>
                </div>
                <div class="corp-kpi-value" style="color: #16a34a;">${fmt(todayColl)}</div>
                <div class="corp-kpi-subtitle">Received today</div>
            </div>

            <div class="corp-kpi-card">
                <div class="corp-kpi-header">
                    <span class="corp-kpi-title">DUE ACCOUNTS</span>
                    <i class="fa-solid fa-user-clock corp-kpi-icon"></i>
                </div>
                <div class="corp-kpi-value">${dueCount}</div>
                <div class="corp-kpi-subtitle">Customers with pending dues</div>
            </div>
        </div>

        <!-- Action Toolbar -->
        <div class="corp-toolbar">
            <div class="corp-search-wrapper">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" id="custSearchInput" class="corp-search-input" placeholder="Search customer by name, phone or ID..." value="${filterVal}" autocomplete="off" oninput="renderCustomerListTable()">
            </div>
            <div class="corp-btn-group">
                <button class="corp-btn corp-btn-default" onclick="exportOutstandingDueExcel()"><i class="fa-solid fa-file-excel"></i> Export Excel</button>
                <button class="corp-btn corp-btn-primary" onclick="openAddCustomerModal()"><i class="fa-solid fa-plus"></i> New Customer</button>
            </div>
        </div>

        <!-- Data Grid Table -->
        <div class="corp-table-card">
            <table class="corp-table">
                <thead>
                    <tr>
                        <th>CUSTOMER DETAILS</th>
                        <th>PHONE NUMBER</th>
                        <th>ADDRESS / AREA</th>
                        <th>OUTSTANDING BALANCE</th>
                        <th>STATUS</th>
                        <th style="text-align: right;">ACTION</th>
                    </tr>
                </thead>
                <tbody id="corpCustomerTbody"></tbody>
            </table>
        </div>
    `;

    const tbody = document.getElementById('corpCustomerTbody');
    if (!tbody) return;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 40px;">No matching customer records found.</td></tr>`;
        return;
    }

    filtered.forEach(c => {
        const currentDue = window.calculateCustomerCurrentDue(c.id);
        const firstLetter = (c.name || 'C').charAt(0).toUpperCase();

        let badgeStatus = '<span class="corp-badge badge-settled">Settled</span>';
        if (currentDue > 0) badgeStatus = '<span class="corp-badge badge-due">Pending Due</span>';
        if (currentDue < 0) badgeStatus = '<span class="corp-badge badge-advance">Advance</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div class="corp-cust-cell">
                    <div class="corp-avatar">${firstLetter}</div>
                    <div class="corp-cust-meta">
                        <strong>${c.name}</strong>
                        <span>ID: ${c.id}</span>
                    </div>
                </div>
            </td>
            <td style="font-weight: 500;">${c.phone || '-'}</td>
            <td style="color: #64748b;">${c.address || c.area || '-'}</td>
            <td style="font-weight: 700; color: ${currentDue > 0 ? '#dc2626' : (currentDue < 0 ? '#2563eb' : '#0f172a')};">
                ${fmt(Math.abs(currentDue))} ${currentDue < 0 ? '(Adv)' : ''}
            </td>
            <td>${badgeStatus}</td>
            <td style="text-align: right;">
                <button class="btn-table-action" onclick="openCustomerLedgerDirect('${c.id}')">
                    <i class="fa-solid fa-file-invoice" style="margin-right: 4px;"></i> View Ledger
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

// ৪. কর্পোরেট লেজার স্টেটমেন্ট রেন্ডার
window.renderCustomerStatement = function(custId) {
    injectCorporateStyles();
    window.activeViewingCustomerId = custId;

    const customers = window.customers || [];
    const cust = customers.find(c => c.id === custId);
    if (!cust) return;

    const container = document.getElementById('cust-ledger-section');
    if (!container) return;

    const currentDue = window.calculateCustomerCurrentDue(cust.id);
    const fmt = (num) => '৳ ' + (parseFloat(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const now = new Date().toISOString().split('T')[0];

    const allTxs = window.customerTransactions || [];
    let txs = allTxs.filter(t => t.customerId === custId);
    txs.sort((a,b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))).reverse();

    container.innerHTML = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button class="corp-btn corp-btn-default" onclick="switchCustomerSubSection('cust-list-section')" style="height: 36px; padding: 0 12px;">
                        <i class="fa-solid fa-arrow-left"></i> Back
                    </button>
                    <div>
                        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0;">${cust.name}</h2>
                        <span style="font-size: 0.8rem; color: #64748b;">Phone: ${cust.phone || '-'} | ID: ${cust.id} | Address: ${cust.address || '-'}</span>
                    </div>
                </div>

                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Total Due Balance</span>
                    <strong style="font-size: 1.5rem; color: ${currentDue > 0 ? '#dc2626' : '#16a34a'}; font-weight: 800;">${fmt(currentDue)}</strong>
                </div>
            </div>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
            <h4 style="font-size: 0.9rem; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px;">New Transaction Entry</h4>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div>
                    <label style="font-size: 0.8rem; font-weight: 600; color: #dc2626; display: block; margin-bottom: 6px;">Debit (+) [Sales / Due]</label>
                    <input type="number" id="modernTxDebit" class="corp-search-input" placeholder="0.00" oninput="handleDualInput('debit')">
                </div>
                <div>
                    <label style="font-size: 0.8rem; font-weight: 600; color: #16a34a; display: block; margin-bottom: 6px;">Credit (-) [Payment Received]</label>
                    <input type="number" id="modernTxCredit" class="corp-search-input" placeholder="0.00" oninput="handleDualInput('credit')">
                </div>
                <div>
                    <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 6px;">Transaction Date</label>
                    <input type="date" id="txDateInput" class="corp-search-input" value="${now}">
                </div>
                <div style="grid-column: span 2;">
                    <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 6px;">Description / Particulars</label>
                    <input type="text" id="txCommonDesc" class="corp-search-input" placeholder="Enter invoice details, bill no or note...">
                </div>
            </div>

            <div style="text-align: right;">
                <button class="corp-btn corp-btn-primary" onclick="submitModernTransaction()" style="padding: 0 24px;">
                    <i class="fa-solid fa-check"></i> Post Transaction
                </button>
            </div>
        </div>

        <div class="corp-table-card">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 0.95rem; color: #0f172a;">Transaction Ledger Statement</strong>
                <button class="corp-btn corp-btn-default" onclick="exportCustomerStatementExcel()" style="height: 32px; font-size: 0.8rem;">
                    <i class="fa-solid fa-download"></i> Export Excel
                </button>
            </div>
            
            <table class="corp-table">
                <thead>
                    <tr>
                        <th>DATE & TIME</th>
                        <th>DESCRIPTION / PARTICULARS</th>
                        <th style="color: #dc2626;">DEBIT (+)</th>
                        <th style="color: #16a34a;">CREDIT (-)</th>
                        <th style="text-align: center; width: 60px;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${txs.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 30px;">No transaction entries recorded yet.</td></tr>` : ''}
                    ${txs.map(t => `
                        <tr>
                            <td style="color: #64748b; font-size: 0.82rem;">${t.date} ${t.time || ''}</td>
                            <td style="font-weight: 600; color: #1e293b;">${t.description || 'General Transaction'}</td>
                            <td style="font-weight: 700; color: #dc2626;">${t.debit > 0 ? fmt(t.debit) : '-'}</td>
                            <td style="font-weight: 700; color: #16a34a;">${t.credit > 0 ? fmt(t.credit) : '-'}</td>
                            <td style="text-align: center;">
                                <button class="btn-action-delete" onclick="deleteCustomerTransaction('${t.id}', '${custId}')" title="Delete Transaction">
                                    <i class="fa-solid fa-trash-can" style="font-size: 0.8rem;"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

// ৫. ডুয়াল ইনপুট লজিক
window.handleDualInput = function(type) {
    const d = document.getElementById('modernTxDebit');
    const c = document.getElementById('modernTxCredit');
    if (!d || !c) return;

    if (type === 'debit' && d.value.length > 0) {
        c.value = ''; c.disabled = true;
    } else if (type === 'credit' && c.value.length > 0) {
        d.value = ''; d.disabled = true;
    } else {
        d.disabled = false; c.disabled = false;
    }
};

// ৬. ট্রানজ্যাকশন পোস্ট করা
window.submitModernTransaction = async function() {
    const d = document.getElementById('modernTxDebit');
    const c = document.getElementById('modernTxCredit');
    const desc = document.getElementById('txCommonDesc');
    const date = document.getElementById('txDateInput');

    const debitVal = parseFloat(d.value) || 0;
    const creditVal = parseFloat(c.value) || 0;

    if (debitVal === 0 && creditVal === 0) {
        if (typeof showToast === 'function') showToast("Please enter an amount!", "warning");
        return;
    }

    if (typeof showLoader === 'function') showLoader("Posting Transaction...");
    const now = new Date();
    const txObj = {
        id: 'tx_' + Date.now(),
        customerId: window.activeViewingCustomerId,
        type: debitVal > 0 ? 'Debit' : 'Credit',
        debit: debitVal,
        credit: creditVal,
        date: (date && date.value) ? date.value : now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0,5),
        description: desc.value.trim() || (debitVal > 0 ? 'Sales / Due' : 'Payment Received')
    };

    try {
        let allTxs = window.customerTransactions || [];
        allTxs.push(txObj);

        const { getDatabase, ref, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        const db = getDatabase();
        await set(ref(db, 'transactions'), allTxs);

        window.customerTransactions = allTxs;

        renderCustomerStatement(window.activeViewingCustomerId);
        if (typeof updateDashboardCards === 'function') updateDashboardCards();
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("Transaction posted successfully!", "success");
    } catch (err) {
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("Error: " + err.message, "error");
    }
};

// ৭. ট্রানজ্যাকশন ডিলিট করা
window.deleteCustomerTransaction = function(txId, custId) {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal({
            title: "Delete Transaction?",
            message: "This transaction record will be permanently deleted and customer balance will be recalculated.",
            confirmText: "Delete",
            onConfirm: async () => {
                await executeTransactionDeletion(txId, custId);
            }
        });
    } else {
        if (confirm("Are you sure you want to delete this transaction?")) {
            executeTransactionDeletion(txId, custId);
        }
    }
};

async function executeTransactionDeletion(txId, custId) {
    if (typeof showLoader === 'function') showLoader("Deleting record...");
    try {
        let allTxs = window.customerTransactions || [];
        const updatedTxs = allTxs.filter(t => t.id !== txId);

        const { getDatabase, ref, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        const db = getDatabase();
        await set(ref(db, 'transactions'), updatedTxs);

        window.customerTransactions = updatedTxs;

        renderCustomerStatement(custId);
        if (typeof updateDashboardCards === 'function') updateDashboardCards();

        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("Transaction deleted successfully!", "success");
    } catch (err) {
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("Error: " + err.message, "error");
    }
}
