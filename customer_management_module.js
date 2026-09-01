/* ==========================================================
   ENTERPRISE CUSTOMER MANAGEMENT & DIRECT VECTOR PDF ENGINE
   Engine: pdfmake Pure Direct Vector Generator (No Print Dialog)
   File: customer_management_module.js
   ========================================================== */

const injectCorporateStyles = () => {
    if (document.getElementById('erp-tiro-bangla-font')) return;
    
    const fontLink = document.createElement('link');
    fontLink.id = 'erp-tiro-bangla-font';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(fontLink);

    // pdfmake লাইব্রেরি ডায়নামিক ইনজেকশন
    if (!window.pdfMake) {
        const s1 = document.createElement('script');
        s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js';
        document.head.appendChild(s1);

        const s2 = document.createElement('script');
        s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js';
        document.head.appendChild(s2);
    }

    const style = document.createElement('style');
    style.id = 'erp-corporate-css';
    style.innerHTML = `
        :root {
            --brand-primary: #4f46e5;
            --brand-primary-hover: #4338ca;
            --brand-light: #eef2ff;
            --due-red: #e11d48;
            --paid-green: #10b981;
            --card-border: #e2e8f0;
            --text-dark: #1e293b;
            --text-muted: #64748b;
        }

        #customer-ledger-view,
        #customer-ledger-view *,
        .corp-search-input,
        .btn-strip-ledger,
        .corp-btn,
        .strip-cust-name,
        .strip-due-val,
        table, th, td, tr, input, button, label, span, h2, h3, h4 {
            font-family: 'Tiro Bangla', serif !important;
        }

        #customer-ledger-view .fa-solid, 
        #customer-ledger-view .fas, 
        #customer-ledger-view .fa {
            font-family: "Font Awesome 6 Free" !important;
            font-weight: 900 !important;
        }

        .corp-kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
            margin-bottom: 22px;
        }
        .corp-kpi-card {
            background: #ffffff;
            border: 1px solid var(--card-border);
            border-radius: 12px;
            padding: 18px 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            transition: all 0.2s;
        }
        .corp-kpi-card:hover {
            border-color: #cbd5e1;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.04);
        }
        .corp-kpi-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 6px;
        }
        .corp-kpi-title {
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--text-muted);
        }
        .corp-kpi-icon {
            font-size: 1.1rem;
            color: #94a3b8;
        }
        .corp-kpi-value {
            font-size: 1.6rem;
            font-weight: 800;
            color: var(--text-dark);
        }
        .corp-kpi-subtitle {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-top: 2px;
        }

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
            color: #94a3b8;
            font-size: 0.95rem;
        }
        .corp-search-input {
            width: 100%;
            height: 44px;
            padding: 0 14px 0 40px;
            border: 1.5px solid var(--card-border);
            border-radius: 10px;
            font-size: 0.95rem;
            color: var(--text-dark);
            background: #ffffff;
            outline: none;
            transition: all 0.2s;
        }
        .corp-search-input:focus {
            border-color: var(--brand-primary);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .corp-btn-group {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .corp-btn {
            height: 44px;
            padding: 0 20px;
            border-radius: 10px;
            font-size: 0.95rem;
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
            border-color: var(--card-border);
            color: var(--text-dark);
        }
        .corp-btn-default:hover {
            background: #f8fafc;
            border-color: #cbd5e1;
            color: var(--brand-primary);
        }
        .corp-btn-primary {
            background: var(--brand-primary);
            color: #ffffff;
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
        }
        .corp-btn-primary:hover {
            background: var(--brand-primary-hover);
        }

        .customer-card-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .cust-strip-card {
            background: #ffffff;
            border: 1.5px solid var(--card-border);
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
            border-color: #c7d2fe;
            box-shadow: 0 4px 14px rgba(79, 70, 229, 0.05);
            transform: translateY(-1px);
        }

        .strip-left-section {
            display: flex;
            align-items: center;
            gap: 16px;
            flex: 1;
        }
        .strip-avatar-img {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            object-fit: cover;
            border: 1.5px solid #e2e8f0;
            background: #f8fafc;
            flex-shrink: 0;
        }
        .strip-cust-meta {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }
        .strip-cust-name {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-dark);
            line-height: 1.2;
        }
        .strip-cust-sub {
            font-size: 0.9rem;
            color: var(--text-muted);
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .strip-cust-sub .dot {
            width: 4px;
            height: 4px;
            background: #cbd5e1;
            border-radius: 50%;
            display: inline-block;
        }

        .strip-right-section {
            display: flex;
            align-items: center;
            gap: 22px;
        }
        .strip-due-box {
            text-align: right;
        }
        .strip-due-label {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #94a3b8;
            display: block;
            margin-bottom: 2px;
        }
        .strip-due-val {
            font-size: 1.4rem;
            font-weight: 800;
            letter-spacing: -0.3px;
        }
        .btn-strip-ledger {
            background: var(--brand-light);
            color: var(--brand-primary);
            border: 1px solid #c7d2fe;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 0.92rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .btn-strip-ledger:hover {
            background: var(--brand-primary);
            color: #ffffff;
            border-color: var(--brand-primary);
            box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
        }

        .btn-action-delete {
            background: #ffffff;
            border: 1px solid #fee2e2;
            color: var(--due-red);
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
            background: var(--due-red);
            color: #ffffff;
        }
    `;
    document.head.appendChild(style);
};

const DEFAULT_HUMAN_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'><path d='M250 80c-55 0-95 40-95 95 0 35 15 65 40 80-5 25-10 40-10 65 0 20 20 40 65 40s65-20 65-40c0-25-5-40-10-65 25-15 40-45 40-80 0-55-40-95-95-95z' fill='%23ffffff' stroke='%23334155' stroke-width='16'/><path d='M195 85c-20 0-40 25-35 55 5-25 20-40 40-45 25-5 45-20 85 5 15 10 25 10 35 0 5 25 10 35 15 45 5-30-10-60-40-70-35-10-70-5-100 10z' fill='%23334155'/><path d='M110 420c0-60 60-95 140-95s140 35 140 95' fill='%23475569' stroke='%23334155' stroke-width='16'/><path d='M200 325c15 15 30 20 50 20s35-5 50-20' fill='none' stroke='%23334155' stroke-width='16'/></svg>";

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
                    <i class="fa-solid fa-hand-holding-dollar corp-kpi-icon" style="color: #e11d48;"></i>
                </div>
                <div class="corp-kpi-value" style="color: #e11d48;">${fmt(totalReceivable)}</div>
                <div class="corp-kpi-subtitle">Outstanding customer dues</div>
            </div>

            <div class="corp-kpi-card">
                <div class="corp-kpi-header">
                    <span class="corp-kpi-title">TODAY'S COLLECTION</span>
                    <i class="fa-solid fa-calendar-check corp-kpi-icon" style="color: #10b981;"></i>
                </div>
                <div class="corp-kpi-value" style="color: #10b981;">${fmt(todayColl)}</div>
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

        let dueColor = '#10b981';
        let dueLabel = 'PAID / SETTLED';

        if (currentDue > 0) {
            dueColor = '#e11d48';
            dueLabel = 'OUTSTANDING DUE';
        } else if (currentDue < 0) {
            dueColor = '#2563eb';
            dueLabel = 'ADVANCE BALANCE';
        }

        const locationText = c.address || c.area || 'ঠিকানা দেওয়া নেই';

        const card = document.createElement('div');
        card.className = 'cust-strip-card';
        card.innerHTML = `
            <div class="strip-left-section">
                <img src="${avatarSrc}" class="strip-avatar-img" alt="${c.name}">
                <div class="strip-cust-meta">
                    <span class="strip-cust-name">${c.name}</span>
                    <span class="strip-cust-sub">
                        <span><i class="fa-solid fa-phone" style="font-size: 0.75rem; color: #94a3b8; margin-right: 4px;"></i> ${c.phone || '-'}</span>
                        <span class="dot"></span>
                        <span><i class="fa-solid fa-location-dot" style="font-size: 0.75rem; color: #94a3b8; margin-right: 4px;"></i> ${locationText}</span>
                    </span>
                </div>
            </div>

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
                    <img src="${avatarSrc}" style="width: 50px; height: 50px; border-radius: 50%; border: 1.5px solid #e2e8f0;">
                    <div>
                        <h2 style="font-size: 1.4rem; font-weight: 700; color: #1e293b; margin: 0;">${cust.name}</h2>
                        <span style="font-size: 0.92rem; color: #64748b;">মোবাইল: ${cust.phone || '-'} | ঠিকানা: ${cust.address || '-'}</span>
                    </div>
                </div>

                <div style="text-align: right;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; display: block;">Total Due Balance</span>
                    <strong style="font-size: 1.7rem; color: ${currentDue > 0 ? '#e11d48' : '#10b981'}; font-weight: 800; font-family: 'Inter', sans-serif;">${fmt(currentDue)}</strong>
                </div>
            </div>
        </div>

        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 22px; margin-bottom: 20px;">
            <h4 style="font-size: 1rem; font-weight: 700; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px;">Post New Transaction</h4>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 15px;">
                <div>
                    <label style="font-size: 0.9rem; font-weight: 600; color: #e11d48; display: block; margin-bottom: 6px;">Debit (+) [বিক্রয় / বাকি]</label>
                    <input type="number" id="modernTxDebit" class="corp-search-input" placeholder="0.00" oninput="handleDualInput('debit')">
                </div>
                <div>
                    <label style="font-size: 0.9rem; font-weight: 600; color: #10b981; display: block; margin-bottom: 6px;">Credit (-) [টাকা গ্রহণ / জমা]</label>
                    <input type="number" id="modernTxCredit" class="corp-search-input" placeholder="0.00" oninput="handleDualInput('credit')">
                </div>
                <div>
                    <label style="font-size: 0.9rem; font-weight: 600; color: #64748b; display: block; margin-bottom: 6px;">তারিখ</label>
                    <input type="date" id="txDateInput" class="corp-search-input" value="${now}">
                </div>
                <div style="grid-column: span 2;">
                    <label style="font-size: 0.9rem; font-weight: 600; color: #64748b; display: block; margin-bottom: 6px;">বিবরণ / নোট</label>
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
            <div style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <strong style="font-size: 1.05rem; color: #1e293b;">Ledger History</strong>
                <div style="display: flex; gap: 8px;">
                    <button class="corp-btn corp-btn-default" onclick="exportCustomerStatementExcel()" style="height: 36px; font-size: 0.88rem;">
                        <i class="fa-solid fa-file-excel" style="color: #10b981;"></i> Export Excel
                    </button>
                    <!-- ১ ক্লিকে কোনো প্রিন্ট ডায়ালগ ছাড়া সরাসরি ডাইরেক্ট PDF ডাউনলোড বাটন -->
                    <button class="corp-btn corp-btn-default" id="btnInstantDownloadPDF" onclick="downloadPureVectorPDF('${cust.id}')" style="height: 36px; font-size: 0.88rem; background: #eef2ff; color: #4f46e5; border-color: #c7d2fe;">
                        <i class="fa-solid fa-download"></i> Download PDF
                    </button>
                </div>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                        <th style="padding: 14px 18px; font-size: 0.85rem; color: #64748b; font-weight: 700;">DATE</th>
                        <th style="padding: 14px 18px; font-size: 0.85rem; color: #64748b; font-weight: 700;">PARTICULARS</th>
                        <th style="padding: 14px 18px; font-size: 0.85rem; color: #e11d48; font-weight: 700;">DEBIT (+)</th>
                        <th style="padding: 14px 18px; font-size: 0.85rem; color: #10b981; font-weight: 700;">CREDIT (-)</th>
                        <th style="padding: 14px 18px; font-size: 0.85rem; text-align: center; width: 60px;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${txs.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 30px;">কোনো লেনদেন রেকর্ড পাওয়া যায়নি।</td></tr>` : ''}
                    ${txs.map(t => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 14px 18px; color: #475569; font-size: 0.95rem;">${t.date} ${t.time || ''}</td>
                            <td style="padding: 14px 18px; font-weight: 600; color: #1e293b; font-size: 1rem;">${t.description || '-'}</td>
                            <td style="padding: 14px 18px; font-weight: 700; color: #e11d48; font-size: 1rem;">${t.debit > 0 ? fmt(t.debit) : '-'}</td>
                            <td style="padding: 14px 18px; font-weight: 700; color: #10b981; font-size: 1rem;">${t.credit > 0 ? fmt(t.credit) : '-'}</td>
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

// ==========================================================
// 100% DIRECT VECTOR PDF DOWNLOAD ENGINE (NO PRINT DIALOG)
// ==========================================================
window.downloadPureVectorPDF = function(custId) {
    const customers = window.customers || [];
    const cust = customers.find(c => c.id === custId);
    if (!cust) return;

    const btn = document.getElementById('btnInstantDownloadPDF');
    if (btn) {
        btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Downloading...`;
        btn.disabled = true;
    }

    const allTxs = window.customerTransactions || [];
    let txs = allTxs.filter(t => t.customerId === custId);
    txs.sort((a,b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));

    const fmt = (num) => '৳ ' + (parseFloat(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    let totalDebit = 0;
    let totalCredit = 0;
    let runningBalance = parseFloat(cust.openingBalance) || 0;

    const tableBody = [
        [
            { text: 'তারিখ', style: 'tableHeader', alignment: 'center' },
            { text: 'বিবরণ', style: 'tableHeader' },
            { text: 'দিলাম (+)', style: 'tableHeader', alignment: 'right' },
            { text: 'পেলাম (-)', style: 'tableHeader', alignment: 'right' },
            { text: 'ব্যালেন্স', style: 'tableHeader', alignment: 'right' }
        ]
    ];

    if (runningBalance !== 0) {
        tableBody.push([
            { text: '-', alignment: 'center' },
            { text: 'প্রারম্ভিক ব্যালেন্স (Opening Balance)', bold: true },
            { text: '-', alignment: 'right' },
            { text: '-', alignment: 'right' },
            { text: fmt(runningBalance), alignment: 'right', bold: true }
        ]);
    }

    txs.forEach((t) => {
        const d = parseFloat(t.debit) || 0;
        const c = parseFloat(t.credit) || 0;
        totalDebit += d;
        totalCredit += c;
        runningBalance += (d - c);

        tableBody.push([
            { text: `${t.date} ${t.time || ''}`, alignment: 'center', fontSize: 9 },
            { text: t.description || 'পণ্য বিক্রয়/ধার', fontSize: 10 },
            { text: d > 0 ? fmt(d) : '-', alignment: 'right', color: '#dc2626', fontSize: 10 },
            { text: c > 0 ? fmt(c) : '-', alignment: 'right', color: '#16a34a', fontSize: 10 },
            { text: fmt(runningBalance), alignment: 'right', bold: true, fontSize: 10 }
        ]);
    });

    // ডাইরেক্ট ভেক্টর PDF ডকুমেন্ট স্ট্রাকচার
    const docDefinition = {
        pageSize: 'A4',
        pageMargins: [30, 30, 30, 30],
        content: [
            { text: 'মৌসুমি কম্পিউটার', fontSize: 20, bold: true, alignment: 'center', color: '#0f172a' },
            { text: 'কম্পিউটার সেলস, সার্ভিসিং ও ডিজিটাল পয়েন্ট', fontSize: 11, alignment: 'center', color: '#475569', margin: [0, 2, 0, 2] },
            { text: `স্টেটমেন্ট প্রিন্ট তারিখ: ${new Date().toLocaleString()}`, fontSize: 9, alignment: 'center', color: '#64748b', margin: [0, 0, 0, 10] },
            { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 535, y2: 0, lineWidth: 1.5, lineColor: '#0f172a' }] },
            { text: 'গ্রাহক হিসাব বিবরণী (ACCOUNT STATEMENT)', fontSize: 11, bold: true, alignment: 'center', margin: [0, 8, 0, 15] },
            
            // গ্রাহকের তথ্য বক্স
            {
                table: {
                    widths: ['*'],
                    body: [[
                        {
                            fillColor: '#f8fafc',
                            margin: [8, 6, 8, 6],
                            stack: [
                                { text: `গ্রাহকের নাম: ${cust.name}`, bold: true, fontSize: 12 },
                                { text: `কাস্টমার আইডি: ${cust.id} | মোবাইল: ${cust.phone || '-'} | ঠিকানা: ${cust.address || '-'}`, fontSize: 10, color: '#334155', margin: [0, 2, 0, 0] }
                            ]
                        }
                    ]]
                },
                layout: 'lightHorizontalLines',
                margin: [0, 0, 0, 12]
            },

            // সামারি হাইলাইটস
            {
                table: {
                    widths: ['*', '*', '*'],
                    body: [[
                        { text: `মোট বাকি (+):\n${fmt(totalDebit)}`, alignment: 'center', fontSize: 10, bold: true, color: '#dc2626', margin: [0, 4, 0, 4] },
                        { text: `মোট জমা (-):\n${fmt(totalCredit)}`, alignment: 'center', fontSize: 10, bold: true, color: '#16a34a', margin: [0, 4, 0, 4] },
                        { text: `বর্তমান নিট পাওনা (DUE):\n${fmt(runningBalance)}`, alignment: 'center', fontSize: 11, bold: true, color: runningBalance > 0 ? '#dc2626' : '#16a34a', fillColor: '#fafafa', margin: [0, 4, 0, 4] }
                    ]]
                },
                margin: [0, 0, 0, 15]
            },

            // লেজার হিস্ট্রি টেবিল
            {
                table: {
                    headerRows: 1,
                    widths: [95, '*', 75, 75, 85],
                    body: tableBody
                },
                layout: {
                    fillColor: function (rowIndex) {
                        return (rowIndex === 0) ? '#f2f2f2' : null;
                    },
                    hLineWidth: function () { return 0.5; },
                    vLineWidth: function () { return 0.5; },
                    hLineColor: function () { return '#000000'; },
                    vLineColor: function () { return '#000000'; }
                }
            },

            // সিগনেচার সেকশন
            {
                columns: [
                    { text: 'গ্রাহকের স্বাক্ষর\n\n______________________', alignment: 'center', margin: [0, 40, 0, 0], fontSize: 10 },
                    { text: 'কর্তৃপক্ষের স্বাক্ষর\n\n______________________', alignment: 'center', margin: [0, 40, 0, 0], fontSize: 10 }
                ]
            },

            // ফুটার ব্র্যান্ডিং
            {
                text: 'সফটওয়্যার প্রস্তুতকারক ও সার্বিক পরিচালনায়: মৌসুমি কম্পিউটার',
                alignment: 'center',
                fontSize: 8,
                color: '#64748b',
                margin: [0, 30, 0, 0]
            }
        ],
        styles: {
            tableHeader: {
                bold: true,
                fontSize: 10,
                color: '#000000'
            }
        }
    };

    try {
        // ১ ক্লিকে কোনো ডায়ালগ ছাড়া সরাসরি ভেক্টর PDF ডাউনলোড
        pdfMake.createPdf(docDefinition).download(`Statement_${cust.name.replace(/\s+/g, '_')}.pdf`);
        if (typeof showToast === 'function') showToast("পিডিএফ সফলভাবে ডাউনলোড হয়েছে!", "success");
    } catch (err) {
        console.error("PDF generation failed:", err);
        if (typeof showToast === 'function') showToast("ডাউনলোডে সমস্যা হয়েছে!", "error");
    } finally {
        if (btn) {
            btn.innerHTML = `<i class="fa-solid fa-download"></i> Download PDF`;
            btn.disabled = false;
        }
    }
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

// এক্সেল এক্সপোর্ট
window.exportCustomerStatementExcel = function() {
    if (!window.activeViewingCustomerId) return;
    const customers = window.customers || [];
    const cust = customers.find(c => c.id === window.activeViewingCustomerId);
    if (!cust) return;

    const allTxs = window.customerTransactions || [];
    let txs = allTxs.filter(t => t.customerId === window.activeViewingCustomerId);
    txs.sort((a,b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));

    let running = parseFloat(cust.openingBalance) || 0;
    const data = [
        ["মৌসুমি কম্পিউটার - গ্রাহক হিসাব বিবরণী"],
        ["Customer Name:", cust.name, "ID:", cust.id],
        ["Phone:", cust.phone || '', "Address:", cust.address || ''],
        ["Statement Date:", new Date().toLocaleDateString()],
        [],
        ["Date & Time", "Description", "Debit (৳)", "Credit (৳)", "Running Balance (৳)"],
        ["Initial", "Opening Balance", 0, 0, running]
    ];

    txs.forEach(t => {
        const d = parseFloat(t.debit) || 0;
        const c = parseFloat(t.credit) || 0;
        running += (d - c);
        data.push([`${t.date} ${t.time || ''}`, t.description || '', d, c, running]);
    });

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Statement");
    XLSX.writeFile(wb, `${cust.name}_Statement.xlsx`);
};
