/* ==========================================================
   ENTERPRISE CUSTOMER MANAGEMENT & HORIZONTAL CARDS
   Design: Full-Width Clean Strip Cards with Human Avatars
   File: customer_management_module.js
   ========================================================== */

// ১. স্টাইল ও গুগল ফন্ট ইনজেকশন
const injectCorporateStyles = () => {
    if (document.getElementById('erp-corporate-css')) return;
    
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.id = 'erp-corporate-css';
    style.innerHTML = `
        #customer-ledger-view {
            font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif !important;
            color: #0f172a;
        }

        .bangla-text {
            font-family: 'Hind Siliguri', sans-serif !important;
        }

        /* Top KPI Grid */
        .corp-kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 20px;
        }
        .corp-kpi-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .corp-kpi-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        .corp-kpi-title {
            font-size: 0.78rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
        }
        .corp-kpi-icon {
            font-size: 1.1rem;
            color: #94a3b8;
        }
        .corp-kpi-value {
            font-size: 1.5rem;
            font-weight: 800;
            color: #0f172a;
        }
        .corp-kpi-subtitle {
            font-size: 0.75rem;
            color: #94a3b8;
            margin-top: 4px;
            font-weight: 500;
        }

        /* Toolbar */
        .corp-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        .corp-search-wrapper {
            position: relative;
            flex: 1;
            max-width: 400px;
            min-width: 260px;
        }
        .corp-search-wrapper i {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 0.9rem;
        }
        .corp-search-input {
            width: 100%;
            height: 42px;
            padding: 0 12px 0 40px;
            border: 1.5px solid #cbd5e1;
            border-radius: 10px;
            font-size: 0.92rem;
            color: #1e293b;
            background: #ffffff;
            outline: none;
            transition: all 0.2s;
        }
        .corp-search-input:focus {
            border-color: #0f172a;
            box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08);
        }
        .corp-btn-group {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .corp-btn {
            height: 42px;
            padding: 0 18px;
            border-radius: 10px;
            font-size: 0.88rem;
            font-weight: 700;
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

        /* FULL-WIDTH HORIZONTAL STRIP CARDS (1 Per Row) */
        .customer-card-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .cust-strip-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            transition: all 0.2s;
        }
        .cust-strip-card:hover {
            border-color: #cbd5e1;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            transform: translateY(-1px);
        }

        /* Left Side: Avatar + Customer Main Info */
        .strip-left-section {
            display: flex;
            align-items: center;
            gap: 16px;
            min-width: 260px;
        }
        .strip-avatar-img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid #e2e8f0;
            background: #f8fafc;
            flex-shrink: 0;
        }
        .strip-cust-meta h3 {
            font-size: 1.05rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 2px 0;
        }
        .strip-cust-meta span {
            font-size: 0.75rem;
            color: #94a3b8;
            font-weight: 600;
        }

        /* Middle Info: Phone & Address Columns */
        .strip-info-col {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 140px;
        }
        .strip-info-col span {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #94a3b8;
        }
        .strip-info-col strong {
            font-size: 0.9rem;
            color: #334155;
            font-weight: 600;
        }

        /* Right Side: Due Balance & Action Button */
        .strip-right-section {
            display: flex;
            align-items: center;
            gap: 24px;
            text-align: right;
        }
        .strip-balance-box span {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #94a3b8;
            display: block;
        }
        .strip-balance-box strong {
            font-size: 1.25rem;
            font-weight: 800;
            letter-spacing: -0.3px;
        }
        .btn-strip-ledger {
            background: #0f172a;
            color: #ffffff;
            border: none;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .btn-strip-ledger:hover {
            background: #1e293b;
        }

        /* Status Pills */
        .status-pill {
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            display: inline-block;
            width: fit-content;
        }
        .pill-due { background: #fee2e2; color: #dc2626; }
        .pill-settled { background: #dcfce7; color: #16a34a; }
        .pill-advance { background: #dbeafe; color: #2563eb; }

        @media (max-width: 900px) {
            .cust-strip-card {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
            .strip-right-section {
                width: 100%;
                justify-content: space-between;
                border-top: 1px solid #f1f5f9;
                padding-top: 10px;
            }
        }
    `;
    document.head.appendChild(style);
};

// ২. হিউম্যান ইলাস্ট্রেশন অ্যাভাটার লিস্ট
const HUMAN_AVATARS = [
    "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Alexander",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Oliver",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Leo",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=Caleb",
    "https://api.dicebear.com/7.x/adventurer/svg?seed=James"
];

// ৩. গ্রাহকের বকেয়া হিসাব
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

// ৪. কাস্টমারদের ১ লাইনে লম্বা কার্ডে রেন্ডার করা
window.renderCustomerListTable = function() {
    injectCorporateStyles();

    const topTitle = document.getElementById('top-title');
    if (topTitle) topTitle.innerText = "Customer Management";

    const container = document.getElementById('cust-list-section');
    if (!container) return;

    const customers = window.customers || [];
    const customerTransactions = window.customerTransactions || [];

    const searchInput = document.getElementById('custSearchInput');
    const filterVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const filtered = customers.filter(c => 
        (c.name || '').toLowerCase().includes(filterVal) ||
        (c.phone || '').toLowerCase().includes(filterVal) ||
        (c.id || '').toLowerCase().includes(filterVal) ||
        (c.address || '').toLowerCase().includes(filterVal) ||
        (c.area || '').toLowerCase().includes(filterVal)
    );

    let totalReceivable = 0;
    let dueCount = 0;
    let todayColl = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    customers.forEach(c => {
        const currentDue = window.calculateCustomerCurrentDue(c.id);
        if (currentDue > 0) {
            totalReceivable += currentDue;
            dueCount++;
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
                <input type="text" id="custSearchInput" class="corp-search-input" placeholder="Search by name, mobile, ID, address..." value="${filterVal}" autocomplete="off" oninput="renderCustomerListTable()">
            </div>
            <div class="corp-btn-group">
                <button class="corp-btn corp-btn-default" onclick="exportOutstandingDueExcel()"><i class="fa-solid fa-file-excel"></i> Export Excel</button>
                <button class="corp-btn corp-btn-primary" onclick="openAddCustomerModal()"><i class="fa-solid fa-plus"></i> New Customer</button>
            </div>
        </div>

        <!-- HORIZONTAL STRIP CARDS (1 per row) -->
        <div class="customer-card-list" id="customerCardList"></div>
    `;

    const cardList = document.getElementById('customerCardList');
    if (!cardList) return;

    if (filtered.length === 0) {
        cardList.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 60px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;">No customer records found.</div>`;
        return;
    }

    filtered.forEach((c, idx) => {
        const currentDue = window.calculateCustomerCurrentDue(c.id);
        const avatarUrl = c.avatarUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(c.name || 'Customer')}&backgroundColor=f1f5f9`;

        let statusPill = '<span class="status-pill pill-settled">Settled</span>';
        let dueColor = '#16a34a';

        if (currentDue > 0) {
            statusPill = '<span class="status-pill pill-due">Pending Due</span>';
            dueColor = '#dc2626';
        } else if (currentDue < 0) {
            statusPill = '<span class="status-pill pill-advance">Advance</span>';
            dueColor = '#2563eb';
        }

        const card = document.createElement('div');
        card.className = 'cust-strip-card';
        card.innerHTML = `
            <!-- Left: Avatar + Name + ID -->
            <div class="strip-left-section">
                <img src="${avatarUrl}" class="strip-avatar-img" alt="${c.name}">
                <div class="strip-cust-meta">
                    <h3 class="bangla-text">${c.name}</h3>
                    <span>ID: ${c.id}</span>
                </div>
            </div>

            <!-- Middle: Phone -->
            <div class="strip-info-col">
                <span>Phone Number</span>
                <strong style="font-family: monospace; font-size: 0.92rem;">${c.phone || '-'}</strong>
            </div>

            <!-- Middle: Address -->
            <div class="strip-info-col">
                <span>Address / Area</span>
                <strong class="bangla-text">${c.address || c.area || '-'}</strong>
            </div>

            <!-- Middle: Status -->
            <div class="strip-info-col" style="min-width: 100px;">
                <span>Status</span>
                ${statusPill}
            </div>

            <!-- Right: Balance & Ledger Action -->
            <div class="strip-right-section">
                <div class="strip-balance-box">
                    <span>Outstanding Due</span>
                    <strong style="color: ${dueColor};">
                        ${fmt(Math.abs(currentDue))} ${currentDue < 0 ? '<small>(Adv)</small>' : ''}
                    </strong>
                </div>
                <button class="btn-strip-ledger" onclick="openCustomerLedgerDirect('${c.id}')">
                    <i class="fa-solid fa-file-invoice"></i> View Ledger
                </button>
            </div>
        `;
        cardList.appendChild(card);
    });
};

// ৫. কাস্টমার লেজার স্টেটমেন্ট
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

    const avatarUrl = cust.avatarUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(cust.name || 'Customer')}&backgroundColor=f1f5f9`;

    container.innerHTML = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button class="corp-btn corp-btn-default" onclick="switchCustomerSubSection('cust-list-section')" style="height: 38px; padding: 0 14px;">
                        <i class="fa-solid fa-arrow-left"></i> Back
                    </button>
                    <img src="${avatarUrl}" style="width: 48px; height: 48px; border-radius: 50%; border: 2px solid #e2e8f0;">
                    <div>
                        <h2 class="bangla-text" style="font-size: 1.3rem; font-weight: 700; color: #0f172a; margin: 0;">${cust.name}</h2>
                        <span class="bangla-text" style="font-size: 0.82rem; color: #64748b;">Phone: ${cust.phone || '-'} | ID: ${cust.id} | Address: ${cust.address || '-'}</span>
                    </div>
                </div>

                <div style="text-align: right;">
                    <span style="font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Total Due Balance</span>
                    <strong style="font-size: 1.6rem; color: ${currentDue > 0 ? '#dc2626' : '#16a34a'}; font-weight: 800;">${fmt(currentDue)}</strong>
                </div>
            </div>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h4 style="font-size: 0.88rem; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px;">Post New Transaction</h4>
            
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
                    <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 6px;">Date</label>
                    <input type="date" id="txDateInput" class="corp-search-input" value="${now}">
                </div>
                <div style="grid-column: span 2;">
                    <label style="font-size: 0.8rem; font-weight: 600; color: #475569; display: block; margin-bottom: 6px;">Description / Particulars</label>
                    <input type="text" id="txCommonDesc" class="corp-search-input bangla-text" placeholder="Invoice details, bill or notes...">
                </div>
            </div>

            <div style="text-align: right;">
                <button class="corp-btn corp-btn-primary" onclick="submitModernTransaction()" style="padding: 0 24px;">
                    <i class="fa-solid fa-check"></i> Save Transaction
                </button>
            </div>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 0.95rem; color: #0f172a;">Ledger History</strong>
                <button class="corp-btn corp-btn-default" onclick="exportCustomerStatementExcel()" style="height: 34px; font-size: 0.8rem;">
                    <i class="fa-solid fa-download"></i> Export Excel
                </button>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 12px 16px; font-size: 0.75rem; color: #64748b; font-weight: 700;">DATE</th>
                        <th style="padding: 12px 16px; font-size: 0.75rem; color: #64748b; font-weight: 700;">PARTICULARS</th>
                        <th style="padding: 12px 16px; font-size: 0.75rem; color: #dc2626; font-weight: 700;">DEBIT (+)</th>
                        <th style="padding: 12px 16px; font-size: 0.75rem; color: #16a34a; font-weight: 700;">CREDIT (-)</th>
                        <th style="padding: 12px 16px; font-size: 0.75rem; text-align: center; width: 60px;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${txs.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 30px;">No transaction entries found.</td></tr>` : ''}
                    ${txs.map(t => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 14px 16px; color: #64748b; font-size: 0.85rem;">${t.date} ${t.time || ''}</td>
                            <td class="bangla-text" style="padding: 14px 16px; font-weight: 600; color: #1e293b;">${t.description || '-'}</td>
                            <td style="padding: 14px 16px; font-weight: 700; color: #dc2626;">${t.debit > 0 ? fmt(t.debit) : '-'}</td>
                            <td style="padding: 14px 16px; font-weight: 700; color: #16a34a;">${t.credit > 0 ? fmt(t.credit) : '-'}</td>
                            <td style="padding: 14px 16px; text-align: center;">
                                <button class="btn-action-delete" onclick="deleteCustomerTransaction('${t.id}', '${custId}')" title="Delete">
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

// ৬. ডুয়াল ইনপুট লজিক
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

// ৭. ট্রানজ্যাকশন পোস্ট করা
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

    if (typeof showLoader === 'function') showLoader("Saving Transaction...");
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
        if (typeof showToast === 'function') showToast("Transaction saved successfully!", "success");
    } catch (err) {
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("Error: " + err.message, "error");
    }
};

// ৮. ট্রানজ্যাকশন ডিলিট করা
window.deleteCustomerTransaction = function(txId, custId) {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal({
            title: "Delete Transaction?",
            message: "This transaction will be permanently deleted and the customer balance will be updated.",
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
    if (typeof showLoader === 'function') showLoader("Deleting...");
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
