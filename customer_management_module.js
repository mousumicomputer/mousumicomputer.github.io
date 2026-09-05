/* ==========================================================
   ENTERPRISE CUSTOMER MANAGEMENT & DEDICATED NEW ENTRY MODULE
   Features: Dedicated New Customer & Correction Section, Tabular Layout,
             Top-Right Photo Frame, Search Bar & Edit, Standalone PDF
   File: customer_management_module.js
   ========================================================== */

const injectCorporateStyles = () => {
    if (document.getElementById('erp-tiro-bangla-font')) return;
    
    const fontLink = document.createElement('link');
    fontLink.id = 'erp-tiro-bangla-font';
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(fontLink);

    const style = document.createElement('style');
    style.id = 'erp-corporate-css';
    style.innerHTML = `
        :root {
            --brand-primary: #4f46e5;
            --brand-primary-hover: #4338ca;
            --brand-light: #eef2ff;
            --due-red: #e11d48;
            --paid-green: #10b981;
            --card-border: #cbd5e1;
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
            text-transform: none !important;
        }

        #customer-ledger-view .fa-solid, 
        #customer-ledger-view .fas, 
        #customer-ledger-view .fa {
            font-family: "Font Awesome 6 Free" !important;
            font-weight: 900 !important;
        }

        /* KPI GRID & TOOLBAR */
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

        /* ================= NEW CUSTOMER COMPACT DEDICATED STYLES ================= */
        .new-cust-wrapper {
            max-width: 900px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 18px;
        }
        .nc-card {
            background: #ffffff;
            border: 1px solid var(--card-border);
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.03);
            overflow: hidden;
        }
        .nc-header {
            background: #ffffff;
            padding: 8px 14px;
            border-bottom: 1.5px solid var(--card-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .nc-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .nc-photo-bar {
            display: flex;
            justify-content: flex-end;
            padding: 10px 14px 4px 14px;
        }
        .nc-photo-box {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #f8fafc;
            border: 1px solid var(--card-border);
            padding: 4px 8px;
            border-radius: 6px;
        }
        .nc-photo-img {
            width: 38px;
            height: 38px;
            border-radius: 4px;
            object-fit: cover;
            border: 1px solid var(--card-border);
            background: #fff;
        }
        .nc-btn-upload {
            padding: 4px 10px;
            font-size: 0.78rem;
            font-weight: 600;
            background: #ffffff;
            border: 1px solid var(--card-border);
            border-radius: 4px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            color: #334151;
            height: 28px;
        }
        .nc-btn-upload:hover {
            background: #f1f5f9;
            border-color: #94a3b8;
        }
        .nc-table-wrap {
            padding: 0 14px 12px 14px;
        }
        .nc-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid var(--card-border);
        }
        .nc-table tr {
            border-bottom: 1px solid #e2e8f0;
        }
        .nc-table tr:last-child {
            border-bottom: none;
        }
        .nc-table th {
            width: 24%;
            background: #f8fafc;
            padding: 6px 12px;
            font-size: 0.86rem;
            font-weight: 600;
            color: #334151;
            border-right: 1px solid var(--card-border);
            text-align: left;
            white-space: nowrap;
        }
        .nc-table td {
            padding: 4px 8px;
            background: #ffffff;
        }
        .nc-input {
            width: 100%;
            height: 30px;
            padding: 0 8px;
            border: 1px solid var(--card-border);
            border-radius: 4px;
            font-size: 0.9rem;
            color: #0f172a;
            outline: none;
        }
        .nc-input:focus {
            border-color: #4f46e5;
            background: #faf5ff;
        }
        .nc-footer {
            background: #f8fafc;
            padding: 8px 14px;
            border-top: 1px solid var(--card-border);
            display: flex;
            justify-content: flex-end;
            gap: 8px;
        }
        .nc-btn {
            height: 30px;
            padding: 0 16px;
            border-radius: 4px;
            font-size: 0.88rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1px solid transparent;
        }
        .nc-btn-cancel {
            background: #ffffff;
            border-color: var(--card-border);
            color: #475569;
        }
        .nc-btn-cancel:hover { background: #f1f5f9; }
        .nc-btn-save {
            background: #4f46e5;
            color: #ffffff;
        }
        .nc-btn-save:hover { background: #4338ca; }

        /* LIST & SEARCH TOOLBAR */
        .nc-list-toolbar {
            padding: 8px 14px;
            background: #f8fafc;
            border-bottom: 1px solid var(--card-border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }
        .nc-search-box {
            position: relative;
            flex: 1;
            max-width: 380px;
        }
        .nc-search-box i {
            position: absolute;
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 0.85rem;
        }
        .nc-search-input {
            width: 100%;
            height: 30px;
            padding: 0 10px 0 32px;
            border: 1px solid var(--card-border);
            border-radius: 4px;
            font-size: 0.88rem;
            outline: none;
            background: #ffffff;
        }
        .nc-search-input:focus { border-color: #4f46e5; }
        .nc-list-table {
            width: 100%;
            border-collapse: collapse;
        }
        .nc-list-table th {
            background: #f8fafc;
            padding: 7px 12px;
            font-size: 0.84rem;
            font-weight: 600;
            color: #334151;
            border-bottom: 1.5px solid var(--card-border);
            text-align: left;
        }
        .nc-list-table td {
            padding: 6px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.88rem;
            color: #1e293b;
        }
        .nc-list-table tr:hover { background: #f8fafc; }
        .nc-avatar-tiny {
            width: 26px;
            height: 26px;
            border-radius: 4px;
            object-fit: cover;
            vertical-align: middle;
            border: 1px solid var(--card-border);
            margin-right: 6px;
        }
        .nc-btn-edit {
            background: #eef2ff;
            color: #4f46e5;
            border: 1px solid #c7d2fe;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 0.78rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }
        .nc-btn-edit:hover {
            background: #4f46e5;
            color: #ffffff;
        }
    `;
    document.head.appendChild(style);
};

const DEFAULT_HUMAN_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";
let currentUploadedBase64Photo = "";

// CALCULATE DUE
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

// ENSURE SIDEBAR SUBMENU EXISTS DYNAMICALLY WITHOUT TOUCHING HTML
function ensureSidebarNewCustomerMenu() {
    const parentSubmenu = document.querySelector('#menu-cust-parent .submenu-list');
    if (parentSubmenu && !document.getElementById('sub-cust-new')) {
        const li = document.createElement('li');
        li.className = 'submenu-item';
        li.id = 'sub-cust-new';
        li.innerHTML = `<a onclick="switchCustomerSubSection('cust-new-section')"><i class="fa-solid fa-angle-right"></i> <span>New Customer</span></a>`;
        
        const listMenu = document.getElementById('sub-cust-list');
        if (listMenu && listMenu.nextSibling) {
            parentSubmenu.insertBefore(li, listMenu.nextSibling);
        } else {
            parentSubmenu.appendChild(li);
        }
    }
}

// 1. CUSTOMER LIST VIEW
window.renderCustomerListTable = function() {
    injectCorporateStyles();
    ensureSidebarNewCustomerMenu();

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
                    <span class="corp-kpi-title">Total Customers</span>
                    <i class="fa-solid fa-users corp-kpi-icon"></i>
                </div>
                <div class="corp-kpi-value">${customers.length}</div>
                <div class="corp-kpi-subtitle">Active customer database</div>
            </div>

            <div class="corp-kpi-card">
                <div class="corp-kpi-header">
                    <span class="corp-kpi-title">Total Receivables</span>
                    <i class="fa-solid fa-hand-holding-dollar corp-kpi-icon" style="color: #e11d48;"></i>
                </div>
                <div class="corp-kpi-value" style="color: #e11d48;">${fmt(totalReceivable)}</div>
                <div class="corp-kpi-subtitle">Outstanding customer dues</div>
            </div>

            <div class="corp-kpi-card">
                <div class="corp-kpi-header">
                    <span class="corp-kpi-title">Today's Collection</span>
                    <i class="fa-solid fa-calendar-check corp-kpi-icon" style="color: #10b981;"></i>
                </div>
                <div class="corp-kpi-value" style="color: #10b981;">${fmt(todayColl)}</div>
                <div class="corp-kpi-subtitle">Received today</div>
            </div>

            <div class="corp-kpi-card">
                <div class="corp-kpi-header">
                    <span class="corp-kpi-title">Due Accounts</span>
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
                <button class="corp-btn corp-btn-primary" onclick="switchCustomerSubSection('cust-new-section')"><i class="fa-solid fa-plus"></i> New Customer</button>
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

// 2. DEDICATED NEW CUSTOMER & CORRECTION SECTION
window.renderNewCustomerSection = function() {
    injectCorporateStyles();
    ensureSidebarNewCustomerMenu();

    const topTitle = document.getElementById('top-title');
    if (topTitle) topTitle.innerText = "New Customer";

    let container = document.getElementById('cust-new-section');
    if (!container) {
        container = document.createElement('div');
        container.id = 'cust-new-section';
        container.className = 'cust-sub-section';
        const parent = document.getElementById('customer-ledger-view');
        if (parent) parent.appendChild(container);
    }

    container.innerHTML = `
        <div class="new-cust-wrapper">
            <!-- 1. ENTRY & CORRECTION FORM -->
            <div class="nc-card">
                <div class="nc-header">
                    <div class="nc-title">
                        <i class="fa-solid fa-user-pen" style="color: #4f46e5;"></i>
                        <span id="ncFormTitle">New Customer</span>
                    </div>
                    <span style="font-size: 0.8rem; color: #64748b;">Customer Information Entry</span>
                </div>

                <form onsubmit="handleNewCustomerSubmit(event)">
                    <input type="hidden" id="ncEditId" value="">

                    <!-- PHOTO BOX ON TOP RIGHT -->
                    <div class="nc-photo-bar">
                        <div class="nc-photo-box">
                            <img id="ncPhotoPreview" src="${DEFAULT_HUMAN_AVATAR}" class="nc-photo-img" alt="Photo">
                            <label class="nc-btn-upload">
                                <i class="fa-solid fa-camera"></i> Choose Photo
                                <input type="file" accept="image/*" style="display: none;" onchange="handleCustomerPhotoUpload(event)">
                            </label>
                            <span id="ncPhotoStatus" style="font-size: 0.78rem; color: #64748b;">Default</span>
                        </div>
                    </div>

                    <!-- COMPACT TABLE INPUTS -->
                    <div class="nc-table-wrap">
                        <table class="nc-table">
                            <tr>
                                <th>Full Name *</th>
                                <td>
                                    <input type="text" id="ncCustName" class="nc-input" placeholder="Customer Name" required>
                                </td>
                            </tr>
                            <tr>
                                <th>Phone Number *</th>
                                <td>
                                    <input type="tel" id="ncCustPhone" class="nc-input" placeholder="01XXXXXXXXX" required>
                                </td>
                            </tr>
                            <tr>
                                <th>Address</th>
                                <td>
                                    <input type="text" id="ncCustAddress" class="nc-input" placeholder="Shop / Village / Area">
                                </td>
                            </tr>
                            <tr>
                                <th>Opening Due</th>
                                <td>
                                    <input type="number" step="any" id="ncCustDue" class="nc-input" placeholder="0.00" value="0">
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- FOOTER BUTTONS -->
                    <div class="nc-footer">
                        <button type="button" class="nc-btn nc-btn-cancel" onclick="resetNewCustomerForm()">Clear</button>
                        <button type="submit" class="nc-btn nc-btn-save" id="ncBtnSave">
                            <i class="fa-solid fa-check"></i> Save Customer
                        </button>
                    </div>
                </form>
            </div>

            <!-- 2. EXISTING CUSTOMERS FOR INFORMATION CORRECTION -->
            <div class="nc-card">
                <div class="nc-list-toolbar">
                    <span style="font-size: 0.88rem; font-weight: 600; color: #334151;">Customer Records</span>
                    <div class="nc-search-box">
                        <i class="fa-solid fa-magnifying-glass"></i>
                        <input type="text" id="ncSearchInput" class="nc-search-input" placeholder="Search by name or phone..." oninput="filterCorrectionList()">
                    </div>
                </div>

                <table class="nc-list-table">
                    <thead>
                        <tr>
                            <th style="width: 32%;">Customer Name</th>
                            <th style="width: 20%;">Phone Number</th>
                            <th style="width: 25%;">Address</th>
                            <th style="width: 13%; text-align: right;">Opening Due</th>
                            <th style="width: 10%; text-align: center;">Action</th>
                        </tr>
                    </thead>
                    <tbody id="ncTableBody"></tbody>
                </table>
            </div>
        </div>
    `;

    renderCorrectionTable();
};

window.renderCorrectionTable = function(query = "") {
    const tbody = document.getElementById('ncTableBody');
    if (!tbody) return;
    tbody.innerHTML = "";

    const customers = window.customers || [];
    const q = (query || "").trim().toLowerCase();

    const list = customers.filter(c => 
        (c.name || '').toLowerCase().includes(q) || 
        (c.phone || '').includes(q) || 
        (c.address || '').toLowerCase().includes(q)
    );

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 18px;">No matching customer found.</td></tr>`;
        return;
    }

    const fmt = (num) => '৳ ' + (parseFloat(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    list.forEach(c => {
        const avatar = c.avatarUrl ? c.avatarUrl : DEFAULT_HUMAN_AVATAR;
        const dueVal = parseFloat(c.openingBalance) || 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <img src="${avatar}" class="nc-avatar-tiny" alt="">
                <strong>${c.name}</strong>
            </td>
            <td>${c.phone || '-'}</td>
            <td>${c.address || '-'}</td>
            <td style="text-align: right; color: ${dueVal > 0 ? '#e11d48' : '#10b981'}; font-weight: 600;">${fmt(dueVal)}</td>
            <td style="text-align: center;">
                <button class="nc-btn-edit" onclick="loadCustomerToEditForm('${c.id}')">
                    <i class="fa-solid fa-pen-to-square"></i> Edit
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

window.filterCorrectionList = function() {
    const input = document.getElementById('ncSearchInput');
    renderCorrectionTable(input ? input.value : "");
};

window.handleCustomerPhotoUpload = function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentUploadedBase64Photo = e.target.result;
            const preview = document.getElementById('ncPhotoPreview');
            if (preview) preview.src = currentUploadedBase64Photo;
            const status = document.getElementById('ncPhotoStatus');
            if (status) status.innerText = "Selected";
        };
        reader.readAsDataURL(file);
    }
};

window.loadCustomerToEditForm = function(id) {
    const customers = window.customers || [];
    const c = customers.find(item => item.id === id);
    if (!c) return;

    document.getElementById('ncEditId').value = c.id;
    document.getElementById('ncCustName').value = c.name || '';
    document.getElementById('ncCustPhone').value = c.phone || '';
    document.getElementById('ncCustAddress').value = c.address || '';
    document.getElementById('ncCustDue').value = c.openingBalance || 0;
    
    currentUploadedBase64Photo = c.avatarUrl || "";
    document.getElementById('ncPhotoPreview').src = c.avatarUrl ? c.avatarUrl : DEFAULT_HUMAN_AVATAR;
    document.getElementById('ncPhotoStatus').innerText = c.avatarUrl ? "Current" : "Default";

    document.getElementById('ncFormTitle').innerText = "Edit Customer Information";
    document.getElementById('ncBtnSave').innerHTML = '<i class="fa-solid fa-check"></i> Update Customer';

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.resetNewCustomerForm = function() {
    document.getElementById('ncEditId').value = '';
    document.getElementById('ncCustName').value = '';
    document.getElementById('ncCustPhone').value = '';
    document.getElementById('ncCustAddress').value = '';
    document.getElementById('ncCustDue').value = '0';
    document.getElementById('ncPhotoPreview').src = DEFAULT_HUMAN_AVATAR;
    document.getElementById('ncPhotoStatus').innerText = "Default";
    currentUploadedBase64Photo = "";

    document.getElementById('ncFormTitle').innerText = "New Customer";
    document.getElementById('ncBtnSave').innerHTML = '<i class="fa-solid fa-check"></i> Save Customer';
};

window.handleNewCustomerSubmit = async function(e) {
    e.preventDefault();
    const editId = document.getElementById('ncEditId').value;
    const name = document.getElementById('ncCustName').value.trim();
    const phone = document.getElementById('ncCustPhone').value.trim();
    const address = document.getElementById('ncCustAddress').value.trim();
    const openingBalance = parseFloat(document.getElementById('ncCustDue').value) || 0;

    if (!name || !phone) {
        if (typeof showToast === 'function') showToast("Please enter customer name & phone!", "warning");
        return;
    }

    if (typeof showLoader === 'function') showLoader(editId ? "Updating Customer..." : "Saving Customer...");

    let customers = window.customers || [];

    if (editId) {
        const idx = customers.findIndex(c => c.id === editId);
        if (idx !== -1) {
            customers[idx] = {
                ...customers[idx],
                name,
                phone,
                address,
                openingBalance,
                avatarUrl: currentUploadedBase64Photo || customers[idx].avatarUrl || ""
            };
        }
    } else {
        const newCust = {
            id: 'cust_' + Date.now(),
            name,
            phone,
            address,
            openingBalance,
            avatarUrl: currentUploadedBase64Photo || "",
            status: "Active"
        };
        customers.unshift(newCust);
    }

    try {
        const { getDatabase, ref, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        const db = getDatabase();
        await set(ref(db, 'customers'), customers);

        window.customers = customers;

        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast(editId ? "Customer updated successfully!" : "Customer created successfully!", "success");

        resetNewCustomerForm();
        renderCorrectionTable();
        if (typeof updateDashboardCards === 'function') updateDashboardCards();
    } catch (err) {
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("Error: " + err.message, "error");
    }
};

// 3. OVERRIDE SUB-SECTION SWITCHER TO RECOGNIZE 'cust-new-section'
const originalSwitchSubSection = window.switchCustomerSubSection;
window.switchCustomerSubSection = function(sectionId) {
    ensureSidebarNewCustomerMenu();

    if (sectionId === 'cust-new-section') {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const mainLedgerView = document.getElementById('customer-ledger-view');
        if (mainLedgerView) mainLedgerView.classList.add('active');

        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        const menuCust = document.getElementById('menu-cust-parent');
        if (menuCust) menuCust.classList.add('active');

        document.querySelectorAll('.cust-sub-section').forEach(sec => sec.style.display = 'none');
        
        let newSec = document.getElementById('cust-new-section');
        if (!newSec) {
            newSec = document.createElement('div');
            newSec.id = 'cust-new-section';
            newSec.className = 'cust-sub-section';
            if (mainLedgerView) mainLedgerView.appendChild(newSec);
        }
        newSec.style.display = 'block';

        window.renderNewCustomerSection();
        return;
    }

    if (typeof originalSwitchSubSection === 'function') {
        originalSwitchSubSection(sectionId);
    } else {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const mainLedgerView = document.getElementById('customer-ledger-view');
        if (mainLedgerView) mainLedgerView.classList.add('active');

        document.querySelectorAll('.cust-sub-section').forEach(sec => sec.style.display = 'none');
        const target = document.getElementById(sectionId);
        if (target) target.style.display = 'block';
        if (sectionId === 'cust-list-section') renderCustomerListTable();
    }
};

// 4. CUSTOMER LEDGER STATEMENT VIEW (UNTOUCHED)
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
                    <button class="corp-btn corp-btn-default" onclick="openCustomerStatementNewTab('${cust.id}')" style="height: 36px; font-size: 0.88rem; background: #eef2ff; color: #4f46e5; border-color: #c7d2fe;">
                        <i class="fa-solid fa-file-pdf"></i> Download PDF / Print
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

// STANDALONE TAB REPORT GENERATOR (UNTOUCHED)
window.openCustomerStatementNewTab = function(custId) {
    const customers = window.customers || [];
    const cust = customers.find(c => c.id === custId);
    if (!cust) return;

    const allTxs = window.customerTransactions || [];
    let txs = allTxs.filter(t => t.customerId === custId);
    txs.sort((a,b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));

    const fmt = (num) => '৳ ' + (parseFloat(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    let totalDebit = 0;
    let totalCredit = 0;
    let runningBalance = parseFloat(cust.openingBalance) || 0;

    let rowsHtml = '';
    
    if (runningBalance !== 0) {
        rowsHtml += `
            <tr>
                <td style="text-align: center; border: 1px solid #000; padding: 6px 8px; font-size: 13px;">-</td>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 13px; font-weight: bold;">প্রারম্ভিক ব্যালেন্স (Opening Balance)</td>
                <td style="text-align: right; border: 1px solid #000; padding: 6px 8px; font-size: 13px;">-</td>
                <td style="text-align: right; border: 1px solid #000; padding: 6px 8px; font-size: 13px;">-</td>
                <td style="text-align: right; border: 1px solid #000; padding: 6px 8px; font-size: 13px; font-weight: bold;">${fmt(runningBalance)}</td>
            </tr>
        `;
    }

    txs.forEach((t) => {
        const d = parseFloat(t.debit) || 0;
        const c = parseFloat(t.credit) || 0;
        totalDebit += d;
        totalCredit += c;
        runningBalance += (d - c);

        rowsHtml += `
            <tr>
                <td style="text-align: center; border: 1px solid #000; padding: 6px 8px; font-size: 13px;">${t.date} ${t.time || ''}</td>
                <td style="border: 1px solid #000; padding: 6px 8px; font-size: 13px;">${t.description || 'পণ্য বিক্রয়/ধার'}</td>
                <td style="text-align: right; border: 1px solid #000; padding: 6px 8px; font-size: 13px;">${d > 0 ? fmt(d) : ''}</td>
                <td style="text-align: right; border: 1px solid #000; padding: 6px 8px; font-size: 13px;">${c > 0 ? fmt(c) : ''}</td>
                <td style="text-align: right; border: 1px solid #000; padding: 6px 8px; font-size: 13px; font-weight: bold;">${fmt(runningBalance)}</td>
            </tr>
        `;
    });

    const reportFullHtml = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>গ্রাহক হিসাব বিবরণী - ${cust.name}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Tiro Bangla', serif;
            color: #111;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px;
            font-size: 14px;
        }
        .action-bar {
            max-width: 800px;
            margin: 0 auto 20px auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .btn-download {
            background-color: #0d6efd;
            color: #fff;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-family: 'Tiro Bangla', serif;
            border-radius: 4px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-download:hover { background-color: #0b5ed7; }
        .statement-container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 30px;
            border: 1px solid #ddd;
            box-shadow: 0 0 10px rgba(0,0,0,0.05);
        }
        .top-heading {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            border-bottom: 1.5px solid #222;
            padding-bottom: 5px;
        }
        .customer-outbox {
            border: 1px solid #000;
            border-radius: 6px;
            padding: 12px 16px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #fafafa;
        }
        .customer-details {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .avatar-box {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #e2e8f0;
            border: 1px solid #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .avatar-box svg {
            width: 36px;
            height: 36px;
            fill: #64748b;
        }
        .info-text p { margin: 2px 0; font-size: 13.5px; }
        .print-meta { text-align: right; font-size: 12.5px; color: #333; }
        .summary-box {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .summary-box td {
            border: 1px solid #000;
            padding: 7px 10px;
            text-align: center;
            background-color: #fff;
        }
        .statement-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .statement-table th, .statement-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            font-size: 13px;
        }
        .statement-table th {
            background-color: #f2f2f2;
            text-align: center;
        }
        .signature-section {
            width: 100%;
            margin-top: 50px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            width: 220px;
            text-align: center;
            border-top: 1px solid #000;
            padding-top: 5px;
        }
        .footer-branding {
            border-top: 1px dashed #777;
            padding-top: 8px;
            text-align: center;
            font-size: 12px;
            color: #444;
            margin-top: 20px;
        }
        .footer-branding strong { font-size: 13px; color: #000; }
        @media print {
            .action-bar { display: none !important; }
            body { background: #fff; padding: 0; }
            .statement-container { border: none; box-shadow: none; padding: 0; width: 100%; max-width: 100%; }
        }
    </style>
</head>
<body>

    <div class="action-bar">
        <span style="font-weight: bold; color: #475569;">গ্রাহক হিসাব বিবরণী প্রিভিউ</span>
        <button class="btn-download" onclick="window.print()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            ডাইরেক্ট পিডিএফ ডাউনলোড / প্রিন্ট
        </button>
    </div>

    <div class="statement-container">
        <div class="top-heading">
            গ্রাহক হিসাব বিবরণী (ACCOUNT STATEMENT)
        </div>

        <div class="customer-outbox">
            <div class="customer-details">
                <div class="avatar-box">
                    <svg viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>
                <div class="info-text">
                    <p><strong>গ্রাহকের নাম:</strong> ${cust.name}</p>
                    <p><strong>কাস্টমার আইডি:</strong> ${cust.id}</p>
                    <p><strong>মোবাইল:</strong> ${cust.phone || '-'}</p>
                    <p><strong>ঠিকানা:</strong> ${cust.address || '-'}</p>
                </div>
            </div>
            <div class="print-meta">
                <strong>প্রিন্ট তারিখ:</strong><br>
                ${new Date().toLocaleString()}
            </div>
        </div>

        <table class="summary-box">
            <tr>
                <td><strong>মোট বাকি (+):</strong> ${fmt(totalDebit)}</td>
                <td><strong>মোট জমা (-):</strong> ${fmt(totalCredit)}</td>
                <td><strong>বর্তমান নিট পাওনা (DUE):</strong> ${fmt(runningBalance)}</td>
            </tr>
        </table>

        <table class="statement-table">
            <thead>
                <tr>
                    <th width="18%">তারিখ</th>
                    <th>বিবরণ</th>
                    <th width="15%">দিলাম (+)</th>
                    <th width="15%">পেলাম (-)</th>
                    <th width="15%">ব্যালেন্স</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml || '<tr><td colspan="5" style="text-align:center; padding: 20px;">কোনো লেনদেন রেকর্ড পাওয়া যায়নি</td></tr>'}
            </tbody>
        </table>

        <div class="signature-section">
            <div class="signature-box">গ্রাহকের স্বাক্ষর</div>
            <div class="signature-box">কর্তৃপক্ষের স্বাক্ষর</div>
        </div>

        <div class="footer-branding">
            সফটওয়্যার প্রস্তুতকারক ও সার্বিক পরিচালনায়: <strong>মৌসুমি কম্পিউটার</strong> — কম্পিউটার সেলস, সার্ভিসিং ও ডিজিটাল পয়েন্ট
        </div>
    </div>

</body>
</html>
    `;

    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
        reportWindow.document.open();
        reportWindow.document.write(reportFullHtml);
        reportWindow.document.close();
    } else {
        alert("পপ-আপ ব্লক করা আছে। ব্রাউজার সেটিং থেকে Pop-up Allow করুন।");
    }
};

// DUAL INPUT
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

// SUBMIT TRANSACTION
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

// DELETE TRANSACTION
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

// EXPORT EXCEL
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

// AUTO-INIT ON LOAD
window.addEventListener('DOMContentLoaded', () => {
    ensureSidebarNewCustomerMenu();
});
