/* ==========================================================
   ENTERPRISE CUSTOMER MANAGEMENT & CARD GRID MODULE
   Design: Modern SaaS Grid Cards with Elegant Bangla Typography
   File: customer_management_module.js
   ========================================================== */

// ১. ক্লাসিক বাংলা ফন্ট এবং কার্ড স্টাইল ইনজেকশন
const injectCorporateStyles = () => {
    if (document.getElementById('erp-corporate-css')) return;
    
    // গুগল থেকে Hind Siliguri এবং Tiro Bangla ফন্ট লোড
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Tiro+Bangla&display=swap';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.id = 'erp-corporate-css';
    style.innerHTML = `
        #customer-ledger-view {
            font-family: 'Plus Jakarta Sans', 'Hind Siliguri', 'Tiro Bangla', sans-serif !important;
            color: #0f172a;
        }

        .bangla-text {
            font-family: 'Hind Siliguri', 'Tiro Bangla', serif !important;
            letter-spacing: 0.2px;
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

        /* CUSTOMER CARDS GRID SYSTEM */
        .customer-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 18px;
        }

        .cust-profile-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.02);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
            position: relative;
        }
        .cust-profile-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.06);
            border-color: #cbd5e1;
        }

        .card-top-header {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-bottom: 15px;
        }

        .card-avatar-box {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: 800;
            flex-shrink: 0;
            background: #f1f5f9;
            color: #334155;
            border: 1.5px solid #e2e8f0;
            overflow: hidden;
        }
        .card-avatar-box img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .card-meta-info h3 {
            font-size: 1.1rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 3px 0;
            line-height: 1.3;
        }
        .card-meta-info span {
            font-size: 0.75rem;
            color: #94a3b8;
            font-weight: 600;
        }

        .card-body-details {
            background: #f8fafc;
            border-radius: 10px;
            padding: 12px;
            margin-bottom: 16px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            border: 1px solid #f1f5f9;
        }
        .card-detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
        }
        .card-detail-row span {
            color: #64748b;
            font-weight: 500;
        }
        .card-detail-row strong {
            color: #1e293b;
            font-weight: 600;
        }

        .card-footer-action {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 12px;
            border-top: 1px solid #f1f5f9;
        }
        .card-due-amount {
            font-size: 1.15rem;
            font-weight: 800;
            letter-spacing: -0.3px;
        }
        .btn-card-ledger {
            background: #0f172a;
            color: #ffffff;
            border: none;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: background 0.2s;
        }
        .btn-card-ledger:hover {
            background: #1e293b;
        }

        /* Status Pills */
        .status-pill {
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
        }
        .pill-due { background: #fee2e2; color: #dc2626; }
        .pill-settled { background: #dcfce7; color: #16a34a; }
        .pill-advance { background: #dbeafe; color: #2563eb; }
    `;
    document.head.appendChild(style);
};

// ২. বকেয়া ব্যালেন্স হিসাব
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

// ৩. কাস্টমার কার্ড গ্রিড রেন্ডার
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

    // কালার প্যালেট অ্যাভাটারের জন্য
    const avatarGradients = [
        { bg: '#e0e7ff', text: '#4338ca' },
        { bg: '#fef3c7', text: '#b45309' },
        { bg: '#dcfce7', text: '#15803d' },
        { bg: '#fee2e2', text: '#b91c1c' },
        { bg: '#e0f2fe', text: '#0369a1' },
        { bg: '#f3e8ff', text: '#7e22ce' }
    ];

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

        <!-- CUSTOMER PROFILE CARDS GRID -->
        <div class="customer-card-grid" id="customerCardGrid"></div>
    `;

    const grid = document.getElementById('customerCardGrid');
    if (!grid) return;

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 60px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0;">No customer records found.</div>`;
        return;
    }

    filtered.forEach((c, idx) => {
        const currentDue = window.calculateCustomerCurrentDue(c.id);
        const firstLetter = (c.name || 'C').trim().charAt(0);
        const color = avatarGradients[idx % avatarGradients.length];

        let statusPill = '<span class="status-pill pill-settled">Settled</span>';
        let dueColor = '#16a34a';

        if (currentDue > 0) {
            statusPill = '<span class="status-pill pill-due">Pending Due</span>';
            dueColor = '#dc2626';
        } else if (currentDue < 0) {
            statusPill = '<span class="status-pill pill-advance">Advance</span>';
            dueColor = '#2563eb';
        }

        // ছবি থাকলে ইমেজ, না থাকলে স্টাইলিশ টেক্সট অ্যাভাটার
        const avatarHtml = c.avatarUrl ? 
            `<img src="${c.avatarUrl}" alt="${c.name}">` : 
            `<span style="color: ${color.text}; font-family: 'Hind Siliguri', sans-serif;">${firstLetter}</span>`;

        const card = document.createElement('div');
        card.className = 'cust-profile-card';
        card.innerHTML = `
            <div>
                <div class="card-top-header">
                    <div class="card-avatar-box" style="background: ${color.bg};">
                        ${avatarHtml}
                    </div>
                    <div class="card-meta-info">
                        <h3 class="bangla-text">${c.name}</h3>
                        <span>ID: ${c.id}</span>
                    </div>
                </div>

                <div class="card-body-details">
                    <div class="card-detail-row">
                        <span>Phone</span>
                        <strong style="font-family: monospace; font-size: 0.9rem;">${c.phone || '-'}</strong>
                    </div>
                    <div class="card-detail-row">
                        <span>Address</span>
                        <strong class="bangla-text">${c.address || c.area || '-'}</strong>
                    </div>
                    <div class="card-detail-row">
                        <span>Status</span>
                        ${statusPill}
                    </div>
                </div>
            </div>

            <div class="card-footer-action">
                <div>
                    <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; display: block;">Balance</span>
                    <span class="card-due-amount" style="color: ${dueColor};">
                        ${fmt(Math.abs(currentDue))} ${currentDue < 0 ? '<small>(Adv)</small>' : ''}
                    </span>
                </div>
                <button class="btn-card-ledger" onclick="openCustomerLedgerDirect('${c.id}')">
                    <i class="fa-solid fa-file-invoice"></i> Ledger
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
};

// ৪. কাস্টমার লেজার স্টেটমেন্ট
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

    const firstLetter = (cust.name || 'C').trim().charAt(0);

    container.innerHTML = `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <button class="corp-btn corp-btn-default" onclick="switchCustomerSubSection('cust-list-section')" style="height: 38px; padding: 0 14px;">
                        <i class="fa-solid fa-arrow-left"></i> Back
                    </button>
                    <div class="card-avatar-box" style="width: 45px; height: 45px; background: #e0e7ff; color: #4338ca;">
                        ${cust.avatarUrl ? `<img src="${cust.avatarUrl}">` : `<span class="bangla-text">${firstLetter}</span>`}
                    </div>
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

// ৭. ট্রানজ্যাকশন ডিলিট করা
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
