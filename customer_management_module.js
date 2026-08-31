/* ==========================================================
   ENTERPRISE CUSTOMER MANAGEMENT - MINIMALIST STRIP CARDS
   Clean, High-Contrast & Crisp Typography
   File: customer_management_module.js
   ========================================================== */

const injectCorporateStyles = () => {
    if (document.getElementById('erp-corporate-css')) return;
    
    // Tiro Bangla ও Inter ফন্ট
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.id = 'erp-corporate-css';
    style.innerHTML = `
        #customer-ledger-view {
            font-family: 'Tiro Bangla', 'Inter', -apple-system, sans-serif !important;
            color: #0f172a;
        }

        /* ফন্টঅসাম আইকন যাতে ভেঙে না যায় */
        #customer-ledger-view .fa-solid, 
        #customer-ledger-view .fas, 
        #customer-ledger-view .fa {
            font-family: "Font Awesome 6 Free" !important;
            font-weight: 900 !important;
        }

        /* Top 4 KPI Metric Cards */
        .corp-kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 22px;
        }
        .corp-kpi-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .corp-kpi-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        .corp-kpi-title {
            font-size: 0.8rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
        }
        .corp-kpi-icon {
            font-size: 1.1rem;
            color: #64748b;
        }
        .corp-kpi-value {
            font-size: 1.6rem;
            font-weight: 800;
            color: #0f172a;
            font-family: 'Inter', 'Tiro Bangla', sans-serif !important;
        }
        .corp-kpi-subtitle {
            font-size: 0.78rem;
            color: #64748b;
            margin-top: 2px;
        }

        /* Action Toolbar */
        .corp-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin-bottom: 18px;
            flex-wrap: wrap;
        }
        .corp-search-wrapper {
            position: relative;
            flex: 1;
            max-width: 420px;
            min-width: 260px;
        }
        .corp-search-wrapper i {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #64748b;
            font-size: 0.95rem;
        }
        .corp-search-input {
            width: 100%;
            height: 42px;
            padding: 0 14px 0 40px;
            border: 1.5px solid #cbd5e1;
            border-radius: 10px;
            font-size: 0.95rem;
            color: #0f172a;
            background: #ffffff;
            outline: none;
            transition: all 0.2s;
        }
        .corp-search-input:focus {
            border-color: #0f172a;
            box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.06);
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
            font-size: 0.9rem;
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
            color: #1e293b;
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

        /* MINIMALIST STRIP CARD (Clean & Readable) */
        .customer-card-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .cust-strip-card {
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.02);
            transition: all 0.2s;
        }
        .cust-strip-card:hover {
            border-color: #cbd5e1;
            box-shadow: 0 4px 12px rgba(0,0,0,0.04);
            transform: translateY(-1px);
        }

        /* Left Side: Avatar + Customer Main Info */
        .strip-left-section {
            display: flex;
            align-items: center;
            gap: 14px;
            flex: 1;
        }
        .strip-avatar-img {
            width: 46px;
            height: 46px;
            border-radius: 50%;
            object-fit: cover;
            border: 1.5px solid #cbd5e1;
            background: #f8fafc;
            flex-shrink: 0;
        }
        .strip-cust-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .strip-cust-name {
            font-size: 1.15rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.2;
        }
        .strip-cust-sub {
            font-size: 0.88rem;
            color: #475569;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .strip-cust-sub .dot {
            width: 4px;
            height: 4px;
            background: #94a3b8;
            border-radius: 50%;
            display: inline-block;
        }

        /* Right Side: Due Balance & Action Button */
        .strip-right-section {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        .strip-due-box {
            text-align: right;
        }
        .strip-due-label {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            display: block;
        }
        .strip-due-val {
            font-size: 1.3rem;
            font-weight: 800;
            letter-spacing: -0.3px;
            font-family: 'Inter', 'Tiro Bangla', sans-serif !important;
        }
        .btn-strip-ledger {
            background: #0f172a;
            color: #ffffff;
            border: none;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 0.88rem;
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
        .btn-action-delete {
            background: #ffffff;
            border: 1px solid #fee2e2;
            color: #dc2626;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: 0.2s;
        }
        .btn-action-delete:hover {
            background: #dc2626;
            color: #ffffff;
        }
    `;
    document.head.appendChild(style);
};

// হিউম্যান ভেক্টর লাইন-আর্ট অ্যাভাটার
const DEFAULT_HUMAN_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'><path d='M250 80c-55 0-95 40-95 95 0 35 15 65 40 80-5 25-10 40-10 65 0 20 20 40 65 40s65-20 65-40c0-25-5-40-10-65 25-15 40-45 40-80 0-55-40-95-95-95z' fill='%23ffffff' stroke='%231e293b' stroke-width='16'/><path d='M195 85c-20 0-40 25-35 55 5-25 20-40 40-45 25-5 45-20 85 5 15 10 25 10 35 0 5 25 10 35 15 45 5-30-10-60-40-70-35-10-70-5-100 10z' fill='%231e293b'/><path d='M110 420c0-60 60-95 140-95s140 35 140 95' fill='%23334155' stroke='%231e293b' stroke-width='16'/><path d='M200 325c15 15 30 20 50 20s35-5 50-20' fill='none' stroke='%231e293b' stroke-width='16'/></svg>";

// বকেয়া হিসাব
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

// কাস্টমারদের পরিষ্কার ১ লাইনের কার্ডে প্রদর্শন
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
                <input type="text" id="custSearchInput" class="corp-search-input" placeholder="গ্রাহকের নাম, মোবাইল বা ঠিকানা দিয়ে খুঁজুন..." value="${filterVal}" autocomplete="off" oninput="renderCustomerListTable()">
            </div>
            <div class="corp-btn-group">
                <button class="corp-btn corp-btn-default" onclick="exportOutstandingDueExcel()"><i class="fa-solid fa-file-excel"></i> Export Excel</button>
                <button class="corp-btn corp-btn-primary" onclick="openAddCustomerModal()"><i class="fa-solid fa-plus"></i> New Customer</button>
            </div>
        </div>

        <!-- MINIMALIST STRIP CARDS -->
        <div class="customer-card-list" id="customerCardList"></div>
    `;

    const cardList = document.getElementById('customerCardList');
    if (!cardList) return;

    if (filtered.length === 0) {
        cardList.innerHTML = `<div style="text-align: center; color: #94a3b8; padding: 50px; background: #fff; border-radius: 12px; border: 1.5px solid #e2e8f0;">কোনো গ্রাহক পাওয়া যায়নি।</div>`;
        return;
    }

    filtered.forEach((c) => {
        const currentDue = window.calculateCustomerCurrentDue(c.id);
        const avatarSrc = c.avatarUrl ? c.avatarUrl : DEFAULT_HUMAN_AVATAR;

        let dueColor = '#16a34a';
        let dueLabel = 'PAID / SETTLED';

        if (currentDue > 0) {
            dueColor = '#dc2626';
            dueLabel = 'OUTSTANDING DUE';
        } else if (currentDue < 0) {
            dueColor = '#2563eb';
            dueLabel = 'ADVANCE BALANCE';
        }

        const locationText = c.address || c.area || 'ঠিকানা দেওয়া নেই';

        const card = document.createElement('div');
        card.className = 'cust-strip-card';
        card.innerHTML = `
            <!-- Left: Avatar + Name + Phone/Address -->
            <div class="strip-left-section">
                <img src="${avatarSrc}" class="strip-avatar-img" alt="${c.name}">
                <div class="strip-cust-meta">
                    <span class="strip-cust-name">${c.name}</span>
                    <span class="strip-cust-sub">
                        <span><i class="fa-solid fa-phone" style="font-size: 0.75rem; margin-right: 4px;"></i> ${c.phone || '-'}</span>
                        <span class="dot"></span>
                        <span><i class="fa-solid fa-location-dot" style="font-size: 0.75rem; margin-right: 4px;"></i> ${locationText}</span>
                    </span>
                </div>
            </div>

            <!-- Right: Due Amount & Action -->
            <div class="strip-right-section">
                <div class="strip-due-box">
                    <span class="strip-due-label">${dueLabel}</span>
                    <span class="strip-due-val" style="color: ${dueColor};">
                        ${fmt(Math.abs(currentDue))} ${currentDue < 0 ? '<small>(Adv)</small>' : ''}
                    </span>
                </div>
                <button class="btn-strip-ledger" onclick="openCustomerLedgerDirect('${c.id}')">
                    <i class="fa-solid fa-file-invoice"></i> View Ledger
                </button>
            </div>
        `;
        cardList.appendChild(card);
    });
};

// কাস্টমার স্টেটমেন্ট (লেজার পেজ)
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

    const avatarSrc = cust.avatarUrl ? cust.avatarUrl : DEFAULT_HUMAN_AVATAR;

    container.innerHTML = `
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <button class="corp-btn corp-btn-default" onclick="switchCustomerSubSection('cust-list-section')" style="height: 40px; padding: 0 15px;">
                        <i class="fa-solid fa-arrow-left"></i> Back
                    </button>
                    <img src="${avatarSrc}" style="width: 50px; height: 50px; border-radius: 50%; border: 1.5px solid #cbd5e1;">
                    <div>
                        <h2 style="font-size: 1.35rem; font-weight: 700; color: #0f172a; margin: 0;">${cust.name}</h2>
                        <span style="font-size: 0.88rem; color: #475569;">মোবাইল: ${cust.phone || '-'} | ঠিকানা: ${cust.address || '-'}</span>
                    </div>
                </div>

                <div style="text-align: right;">
                    <span style="font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Total Due Balance</span>
                    <strong style="font-size: 1.7rem; color: ${currentDue > 0 ? '#dc2626' : '#16a34a'}; font-weight: 800; font-family: 'Inter', sans-serif;">${fmt(currentDue)}</strong>
                </div>
            </div>
        </div>

        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 22px; margin-bottom: 20px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px;">Post New Transaction</h4>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div>
                    <label style="font-size: 0.85rem; font-weight: 600; color: #dc2626; display: block; margin-bottom: 6px;">Debit (+) [বিক্রয় / বাকি]</label>
                    <input type="number" id="modernTxDebit" class="corp-search-input" placeholder="0.00" oninput="handleDualInput('debit')">
                </div>
                <div>
                    <label style="font-size: 0.85rem; font-weight: 600; color: #16a34a; display: block; margin-bottom: 6px;">Credit (-) [টাকা গ্রহণ / জমা]</label>
                    <input type="number" id="modernTxCredit" class="corp-search-input" placeholder="0.00" oninput="handleDualInput('credit')">
                </div>
                <div>
                    <label style="font-size: 0.85rem; font-weight: 600; color: #475569; display: block; margin-bottom: 6px;">তারিখ</label>
                    <input type="date" id="txDateInput" class="corp-search-input" value="${now}">
                </div>
                <div style="grid-column: span 2;">
                    <label style="font-size: 0.85rem; font-weight: 600; color: #475569; display: block; margin-bottom: 6px;">বিবরণ / নোট</label>
                    <input type="text" id="txCommonDesc" class="corp-search-input" placeholder="পণ্য বা বিলের বিবরণ লিখুন...">
                </div>
            </div>

            <div style="text-align: right;">
                <button class="corp-btn corp-btn-primary" onclick="submitModernTransaction()" style="padding: 0 26px;">
                    <i class="fa-solid fa-check"></i> Save Transaction
                </button>
            </div>
        </div>

        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <strong style="font-size: 1rem; color: #0f172a;">Ledger History</strong>
                <button class="corp-btn corp-btn-default" onclick="exportCustomerStatementExcel()" style="height: 36px; font-size: 0.85rem;">
                    <i class="fa-solid fa-download"></i> Export Excel
                </button>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 14px 18px; font-size: 0.8rem; color: #64748b; font-weight: 700;">DATE</th>
                        <th style="padding: 14px 18px; font-size: 0.8rem; color: #64748b; font-weight: 700;">PARTICULARS</th>
                        <th style="padding: 14px 18px; font-size: 0.8rem; color: #dc2626; font-weight: 700;">DEBIT (+)</th>
                        <th style="padding: 14px 18px; font-size: 0.8rem; color: #16a34a; font-weight: 700;">CREDIT (-)</th>
                        <th style="padding: 14px 18px; font-size: 0.8rem; text-align: center; width: 60px;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${txs.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 30px;">কোনো লেনদেন রেকর্ড পাওয়া যায়নি।</td></tr>` : ''}
                    ${txs.map(t => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 14px 18px; color: #475569; font-size: 0.9rem;">${t.date} ${t.time || ''}</td>
                            <td style="padding: 14px 18px; font-weight: 600; color: #0f172a; font-size: 0.95rem;">${t.description || '-'}</td>
                            <td style="padding: 14px 18px; font-weight: 700; color: #dc2626; font-size: 0.95rem;">${t.debit > 0 ? fmt(t.debit) : '-'}</td>
                            <td style="padding: 14px 18px; font-weight: 700; color: #16a34a; font-size: 0.95rem;">${t.credit > 0 ? fmt(t.credit) : '-'}</td>
                            <td style="padding: 14px 18px; text-align: center;">
                                <button class="btn-action-delete" onclick="deleteCustomerTransaction('${t.id}', '${custId}')" title="Delete">
                                    <i class="fa-solid fa-trash-can" style="font-size: 0.85rem;"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
};

// ডুয়াল ইনপুট
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

// ট্রানজ্যাকশন সেভ
window.submitModernTransaction = async function() {
    const d = document.getElementById('modernTxDebit');
    const c = document.getElementById('modernTxCredit');
    const desc = document.getElementById('txCommonDesc');
    const date = document.getElementById('txDateInput');

    const debitVal = parseFloat(d.value) || 0;
    const creditVal = parseFloat(c.value) || 0;

    if (debitVal === 0 && creditVal === 0) {
        if (typeof showToast === 'function') showToast("দয়া করে টাকার অংক লিখুন!", "warning");
        return;
    }

    if (typeof showLoader === 'function') showLoader("সংরক্ষণ করা হচ্ছে...");
    const now = new Date();
    const txObj = {
        id: 'tx_' + Date.now(),
        customerId: window.activeViewingCustomerId,
        type: debitVal > 0 ? 'Debit' : 'Credit',
        debit: debitVal,
        credit: creditVal,
        date: (date && date.value) ? date.value : now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0,5),
        description: desc.value.trim() || (debitVal > 0 ? 'পণ্য বিক্রয়/ধার' : 'টাকা গ্রহণ')
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
        if (typeof showToast === 'function') showToast("লেনদেন সফলভাবে সংরক্ষণ করা হয়েছে!", "success");
    } catch (err) {
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("Error: " + err.message, "error");
    }
};

// ডিলিট ট্রানজ্যাকশন
window.deleteCustomerTransaction = function(txId, custId) {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal({
            title: "লেনদেন মুছে ফেলবেন?",
            message: "এই লেনদেনটি স্থায়ীভাবে মুছে ফেলা হবে এবং ব্যালেন্স স্বয়ংক্রিয়ভাবে আপডেট হবে।",
            confirmText: "মুছে ফেলুন",
            onConfirm: async () => {
                await executeTransactionDeletion(txId, custId);
            }
        });
    } else {
        if (confirm("আপনি কি নিশ্চিত এই লেনদেনটি মুছে ফেলতে চান?")) {
            executeTransactionDeletion(txId, custId);
        }
    }
};

async function executeTransactionDeletion(txId, custId) {
    if (typeof showLoader === 'function') showLoader("মুছে ফেলা হচ্ছে...");
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
        if (typeof showToast === 'function') showToast("লেনদেন মুছে ফেলা হয়েছে!", "success");
    } catch (err) {
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("Error: " + err.message, "error");
    }
}
