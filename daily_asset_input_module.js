/**
 * Mousumi Computer ERP - Daily Liquid Asset & Balance Input Hub
 * File: daily_asset_input_module.js
 * Feature: Operator Filter Pills (All / GP / Banglalink / Robi / Airtel),
 *          Precise Sidebar Menu Placement,
 *          Pure SVG/CSS Crisp Chevron Arrows,
 *          Pill Rounded Next Step Button & Master Config Bridge,
 *          Full Responsive Fixed Daily Income Engine.
 */

(function () {
    // ১. স্টাইলিং ও সিএসএস
    const moduleStyles = `
        <style id="asset-hub-styles">
            #asset-hub-view { 
                font-family: 'Tiro Bangla', sans-serif !important; 
                text-transform: none !important; 
                color: #0f172a; 
                padding: 15px 25px 95px 25px; 
                position: relative; 
            }
            #asset-hub-view * { 
                box-sizing: border-box; 
            }

            .hub-top-ctrl {
                background: #fff;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 10px 16px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
            }
            .hub-date-wrap { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; }
            .hub-date-wrap input { 
                height: 32px; 
                padding: 0 10px; 
                border: 1px solid #94a3b8; 
                border-radius: 6px; 
                font-size: 13px; 
                font-weight: 700; 
                outline: none; 
                background: #fff; 
            }

            /* উইজার্ড সেকশন বক্স */
            .hub-wizard-sec {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                margin-bottom: 16px;
                overflow: hidden;
                transition: border-color 0.2s;
            }
            .hub-wizard-sec.active { 
                border-color: #0284c7; 
                border-width: 1.5px; 
            }

            .hub-wizard-head {
                background: #f8fafc;
                padding: 12px 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                user-select: none;
                border-bottom: 1px solid #cbd5e1;
            }
            .hub-wizard-sec:not(.active) .hub-wizard-head { border-bottom: none; }
            .hub-wizard-head:hover { background: #f1f5f9; }

            .hub-wizard-title { font-size: 13.5px; font-weight: 800; display: flex; align-items: center; gap: 8px; color: #0f172a; }
            .hub-wizard-meta { display: flex; align-items: center; gap: 14px; font-size: 12.5px; font-weight: 700; color: #334155; }
            
            /* বিশুদ্ধ SVG অ্যারো */
            .hub-arrow-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.25s ease;
                color: #64748b;
            }
            .hub-wizard-sec:not(.active) .hub-arrow-icon { 
                transform: rotate(-90deg); 
            }
            .hub-wizard-sec:not(.active) .hub-wizard-body { display: none; }

            .hub-wizard-body { padding: 18px 20px; }

            /* স্লিম স্ট্রিপ গ্রিড */
            .hub-strip-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 10px 16px;
                margin-bottom: 15px;
            }
            .hub-strip-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 6px 12px;
            }
            .hub-strip-item:hover { border-color: #94a3b8; }
            .hub-strip-label { font-size: 12.5px; font-weight: 800; color: #0f172a; }
            .hub-input-wrap { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #64748b; }
            
            .hub-inp-text {
                width: 115px;
                height: 28px;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 0 8px;
                font-size: 12.5px;
                font-weight: 800;
                text-align: right;
                outline: none;
                background: #fff;
            }
            .hub-inp-text:focus { border-color: #0284c7; }

            .hub-qty-inp {
                width: 65px;
                height: 28px;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                text-align: center;
                font-size: 12.5px;
                font-weight: 800;
                outline: none;
                background: #fff;
            }
            .hub-qty-inp:focus { border-color: #0284c7; }
            .hub-sub-val { font-size: 12px; font-weight: 800; min-width: 75px; text-align: right; color: #0f172a; }

            /* অপারেটর ফিল্টার পিলস */
            .card-op-filter-bar {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }
            .op-pill-btn {
                padding: 5px 14px;
                border: 1px solid #cbd5e1;
                border-radius: 20px;
                background: #fff;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                transition: 0.2s;
                color: #334155;
            }
            .op-pill-btn:hover { background: #f1f5f9; }
            .op-pill-btn.active {
                background: #0f172a;
                color: #fff;
                border-color: #0f172a;
            }

            .op-segment-box {
                margin-bottom: 16px;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 10px 14px;
                background: #ffffff;
            }
            .op-segment-header {
                font-size: 12.5px;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .hub-step-footer { 
                display: flex; 
                justify-content: flex-end; 
                padding-top: 14px; 
                border-top: 1px solid #f1f5f9; 
            }

            .hub-btn-next {
                background: #f8fafc;
                border: 1.5px solid #0f172a;
                color: #0f172a;
                padding: 7px 22px;
                border-radius: 30px;
                font-size: 12px;
                font-weight: 800;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                transition: all 0.2s ease;
            }
            .hub-btn-next:hover { 
                background: #0f172a; 
                color: #fff; 
                transform: translateX(2px);
            }

            .hub-floating-btn {
                position: fixed;
                bottom: 25px;
                right: 35px;
                background: #0f172a;
                color: #fff;
                border: none;
                padding: 11px 24px;
                border-radius: 50px;
                font-size: 13px;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 9999;
                transition: transform 0.2s, background 0.2s;
            }
            .hub-floating-btn:hover { background: #1e293b; transform: scale(1.04); }

            .hub-history-card {
                background: #fff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 12px 18px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
            }
            .hub-hist-date { font-size: 13px; font-weight: 800; }
            .hub-hist-date span { font-size: 11px; font-weight: normal; color: #64748b; margin-left: 5px; }
            .hub-hist-stats { display: flex; gap: 20px; font-size: 12px; font-weight: 700; color: #334155; }
            .hub-hist-total { font-size: 13.5px; font-weight: 800; color: #0f172a; }
            .hub-icon-btn {
                background: #fff;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 5px 9px;
                cursor: pointer;
                font-size: 11px;
                margin-left: 4px;
            }
            .hub-icon-btn:hover { border-color: #000; background: #f1f5f9; }
            .hub-icon-delete { color: #dc2626; border-color: #fecaca; }
            .hub-icon-delete:hover { background: #fee2e2; border-color: #dc2626; }

            /* DEDICATED DAILY INCOME ENGINE STYLES (ফিক্সড ও ফুল ভিউ) */
            .hub-income-container {
                display: flex;
                justify-content: flex-start;
                padding: 10px 0 30px 0;
                font-family: 'Tiro Bangla', serif !important;
                width: 100%;
            }
            .hub-inc-card {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 12px;
                width: 100%;
                max-width: 640px; /* উইথ বাড়িয়ে দেওয়া হলো যাতে নম্বর না কাটে */
                box-shadow: 0 4px 16px rgba(0,0,0,0.04);
                overflow: hidden;
                font-family: 'Tiro Bangla', serif !important;
            }
            .hub-inc-header {
                padding: 12px 18px;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .hub-inc-title {
                font-size: 0.95rem;
                font-weight: 800;
                color: #0f172a;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                display: flex;
                align-items: center;
                gap: 8px;
                font-family: 'Tiro Bangla', serif !important;
            }
            .hub-inc-badge {
                font-size: 0.8rem;
                font-weight: 700;
                color: #0284c7;
                background: #f0f9ff;
                border: 1px solid #bae6fd;
                padding: 3px 12px;
                border-radius: 6px;
                font-family: 'Tiro Bangla', serif !important;
            }
            .hub-inc-shortcuts {
                padding: 10px 14px;
                background: #ffffff;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .hub-btn-quick {
                background: #f1f5f9;
                border: 1px solid #cbd5e1;
                color: #475569;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.15s ease;
                flex: 1 1 auto;
                text-align: center;
                font-family: 'Tiro Bangla', serif !important;
            }
            .hub-btn-quick:hover { background: #e2e8f0; }
            .hub-btn-quick.active {
                background: #0f172a;
                color: #ffffff;
                border-color: #0f172a;
            }
            .hub-inc-dates {
                padding: 10px 14px;
                background: #fbfcfe;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 10px;
            }
            .hub-inc-date-field {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.82rem;
                font-weight: 700;
                color: #475569;
                flex: 1;
                min-width: 140px;
                font-family: 'Tiro Bangla', serif !important;
            }
            .hub-inc-date-field input {
                width: 100%;
                height: 32px;
                padding: 0 8px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                font-size: 0.82rem;
                font-weight: 700;
                outline: none;
                background: #fff;
                color: #0f172a;
                font-family: 'Tiro Bangla', serif !important;
            }
            .hub-inc-table {
                width: 100%;
                border-collapse: collapse;
                font-family: 'Tiro Bangla', serif !important;
            }
            .hub-inc-table tr td {
                padding: 12px 20px;
                border-bottom: 1px solid #f1f5f9;
                font-size: 0.95rem;
                font-family: 'Tiro Bangla', serif !important;
            }
            .hub-inc-table .hub-lbl {
                color: #475569;
                font-weight: 600;
                white-space: nowrap;
            }
            .hub-inc-table .hub-val {
                text-align: right;
                font-weight: 700;
                color: #0f172a;
                font-size: 1.05rem;
                white-space: nowrap; /* সংখ্যা ভাঙবে না */
            }
            .hub-inc-table tr.hub-row-exp {
                background: #f8fafc;
            }
            .hub-inc-table tr.hub-row-inc {
                background: #f0fdf4;
                border-top: 2px solid #86efac;
            }
            .hub-inc-table tr.hub-row-inc .hub-lbl-inc {
                font-size: 1.05rem;
                font-weight: 800;
                color: #15803d;
                white-space: nowrap;
            }
            .hub-inc-table tr.hub-row-inc .hub-val-inc {
                text-align: right;
                font-size: 1.25rem;
                font-weight: 900;
                color: #15803d;
                white-space: nowrap; /* সংখ্যা কাটবে না */
            }
            @media (max-width: 600px) {
                .hub-income-container { padding: 5px 0 25px 0; }
                .hub-inc-card { max-width: 100%; border-radius: 8px; }
                .hub-inc-table tr td { padding: 10px 14px; font-size: 0.88rem; }
                .hub-inc-table tr.hub-row-inc .hub-val-inc { font-size: 1.15rem; }
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', moduleStyles);

    // এসভিজি শেভরন ডাউন আইকন
    const svgChevron = `<svg class="hub-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

    // ২. সাইডবারে সঠিক পজিশনে মেনু ইনজেকশন
    function injectSidebarMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-asset-hub-parent')) return;

        const menuItemHTML = `
            <li class="menu-item" id="menu-asset-hub-parent">
                <a onclick="window.toggleParentMenu('menu-asset-hub-parent')">
                    <span class="menu-link-inner"><i class="fa fa-coins"></i> <span>Daily Asset Hub</span></span>
                    <span class="chevron-icon"><i class="fa fa-chevron-down"></i></span>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item active" id="sub-asset-entry">
                        <a onclick="window.switchAssetHubSubTab('entry')">
                            <span><i class="fa fa-chevron-right" style="font-size: 9px; margin-right: 6px; opacity: 0.7;"></i>Balance Entry</span>
                        </a>
                    </li>
                    <li class="submenu-item" id="sub-asset-income">
                        <a onclick="window.switchAssetHubSubTab('income')">
                            <span><i class="fa fa-chevron-right" style="font-size: 9px; margin-right: 6px; opacity: 0.7;"></i>Daily Income</span>
                        </a>
                    </li>
                    <li class="submenu-item" id="sub-asset-history">
                        <a onclick="window.switchAssetHubSubTab('history')">
                            <span><i class="fa fa-chevron-right" style="font-size: 9px; margin-right: 6px; opacity: 0.7;"></i>Entry History</span>
                        </a>
                    </li>
                </ul>
            </li>
        `;

        const dailyClosingMenu = document.getElementById('menu-closing-parent');
        if (dailyClosingMenu) {
            dailyClosingMenu.insertAdjacentHTML('beforebegin', menuItemHTML);
        } else {
            menuList.insertAdjacentHTML('beforeend', menuItemHTML);
        }
    }

    // ৩. ভিউ প্যানেল ইনজেকশন
    function injectViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('asset-hub-view')) return;

        const viewPanelHTML = `
            <div class="view-panel" id="asset-hub-view">
                <!-- SUB-TAB 1: BALANCE ENTRY -->
                <div id="hub-tab-entry">
                    <div class="hub-top-ctrl">
                        <div class="hub-date-wrap">
                            <label>Statement Date:</label>
                            <input type="date" id="hubSelectedDate" onchange="window.onAssetHubDateChange()">
                        </div>
                        <div style="font-size: 13px; font-weight: 800;">
                            Live Total: <span id="hubLiveGrandTotal">৳ 0.00</span>
                        </div>
                    </div>

                    <div id="hubWizardContainer"></div>

                    <!-- ভাসমান সেভ বাটন -->
                    <button class="hub-floating-btn" onclick="window.saveAssetHubToFirebase()">
                        &#10003; Save Balance
                    </button>
                </div>

                <!-- SUB-TAB 2: DAILY INCOME -->
                <div id="hub-tab-income" style="display: none;">
                    <div class="hub-income-container">
                        <div class="hub-inc-card">
                            <div class="hub-inc-header">
                                <div class="hub-inc-title">
                                    <i class="fa-solid fa-file-invoice-dollar" style="color: #0284c7;"></i>
                                    <span>Daily Income Statement</span>
                                </div>
                                <span class="hub-inc-badge" id="hubIncomePeriodBadge">Today</span>
                            </div>

                            <!-- Shortcuts Bar -->
                            <div class="hub-inc-shortcuts">
                                <button type="button" class="hub-btn-quick active" id="btnHubIncToday" onclick="window.setHubIncomeShortcut('today')">Today</button>
                                <button type="button" class="hub-btn-quick" id="btnHubIncYesterday" onclick="window.setHubIncomeShortcut('yesterday')">Yesterday</button>
                                <button type="button" class="hub-btn-quick" id="btnHubInc7Days" onclick="window.setHubIncomeShortcut('7days')">Last 7 Days</button>
                                <button type="button" class="hub-btn-quick" id="btnHubIncThisMonth" onclick="window.setHubIncomeShortcut('this_month')">This Month</button>
                                <button type="button" class="hub-btn-quick" id="btnHubIncLastMonth" onclick="window.setHubIncomeShortcut('last_month')">Last Month</button>
                            </div>

                            <!-- Date Range Bar -->
                            <div class="hub-inc-dates">
                                <div class="hub-inc-date-field">
                                    <label>From:</label>
                                    <input type="date" id="hubIncDateFrom" onchange="window.calcHubIncomeDynamically()">
                                </div>
                                <div class="hub-inc-date-field">
                                    <label>To:</label>
                                    <input type="date" id="hubIncDateTo" onchange="window.calcHubIncomeDynamically()">
                                </div>
                                <button type="button" class="hub-btn-quick" onclick="window.calcHubIncomeDynamically()" style="flex: 0 0 auto; height: 32px; padding: 0 12px;" title="Refresh calculation">
                                    <i class="fa-solid fa-rotate-right"></i>
                                </button>
                            </div>

                            <!-- Income Statement Table -->
                            <table class="hub-inc-table">
                                <tbody>
                                    <tr>
                                        <td class="hub-lbl">Opening Capital</td>
                                        <td class="hub-val" id="hubIncOpening">৳ 0.00</td>
                                    </tr>
                                    <tr>
                                        <td class="hub-lbl">Total Pelam (+)</td>
                                        <td class="hub-val" style="color: #16a34a;" id="hubIncPelam">+ ৳ 0.00</td>
                                    </tr>
                                    <tr>
                                        <td class="hub-lbl">Total Dilam (-)</td>
                                        <td class="hub-val" style="color: #dc2626;" id="hubIncDilam">- ৳ 0.00</td>
                                    </tr>
                                    <tr class="hub-row-exp">
                                        <td class="hub-lbl" style="font-weight: 700;">Expected Capital</td>
                                        <td class="hub-val" id="hubIncExpected">৳ 0.00</td>
                                    </tr>
                                    <tr class="hub-row-act">
                                        <td class="hub-lbl" style="font-weight: 700; color: #0284c7;">Actual Assets</td>
                                        <td class="hub-val" style="color: #0284c7; font-weight: 800;" id="hubIncActual">৳ 0.00</td>
                                    </tr>
                                    <tr class="hub-row-inc">
                                        <td class="hub-lbl-inc">Net Income</td>
                                        <td class="hub-val-inc" id="hubIncNetIncome">৳ 0.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SUB-TAB 3: ENTRY HISTORY -->
                <div id="hub-tab-history" style="display: none;">
                    <div class="hub-top-ctrl">
                        <div style="font-size: 13px; font-weight: 800;">Archived Daily Asset Snapshots</div>
                        <button class="hub-icon-btn" onclick="window.renderAssetHistoryList()">&#8635; Reload</button>
                    </div>
                    <div id="hubHistoryListContainer"></div>
                </div>
            </div>
        `;
        mainWrapper.insertAdjacentHTML('beforeend', viewPanelHTML);
    }

    const fmt = (n) => (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

    let currentBalances = {};
    let currentCash = {};
    let currentCards = {};
    let allHistoryRecords = [];
    let activeCardFilter = 'ALL';

    // ৪. মাস্টার কনফিগ ডেটা ফেচিং
    function getMasterAccountsAndCategories() {
        const rawCats = window.accountManagerData?.categories || window.categories || [];
        const rawAccs = window.accountManagerData?.accounts || window.accounts || [];

        const cats = (Array.isArray(rawCats) ? rawCats : Object.values(rawCats))
            .filter(c => c.enabled !== false)
            .sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));

        const accs = (Array.isArray(rawAccs) ? rawAccs : Object.values(rawAccs))
            .filter(a => a.enabled !== false);

        return { cats, accs };
    }

    function getMasterCardConfig() {
        return window.cardManagerData?.cards || window.cardConfig || {};
    }

    // ৫. সাব-ট্যাব সুইচিং
    window.switchAssetHubSubTab = function (tabType) {
        if (typeof window.switchMainTab === 'function') {
            window.switchMainTab('asset-hub');
        }
        document.querySelectorAll('#menu-asset-hub-parent .submenu-item').forEach(i => i.classList.remove('active'));

        const entrySec = document.getElementById('hub-tab-entry');
        const incSec = document.getElementById('hub-tab-income');
        const histSec = document.getElementById('hub-tab-history');

        if (entrySec) entrySec.style.display = 'none';
        if (incSec) incSec.style.display = 'none';
        if (histSec) histSec.style.display = 'none';

        if (tabType === 'entry') {
            if (entrySec) entrySec.style.display = 'block';
            document.getElementById('sub-asset-entry')?.classList.add('active');
            window.loadAssetHubInputs();
        } else if (tabType === 'income') {
            if (incSec) entrySec ? (incSec.style.display = 'block') : null;
            document.getElementById('sub-asset-income')?.classList.add('active');
            window.loadAssetHubIncome();
        } else {
            if (histSec) histSec.style.display = 'block';
            document.getElementById('sub-asset-history')?.classList.add('active');
            window.renderAssetHistoryList();
        }
    };

    // ৬. তারিখ পরিবর্তনে ডেটা লোড
    window.onAssetHubDateChange = async function () {
        const d = document.getElementById('hubSelectedDate').value;
        if (typeof window.showLoader === 'function') window.showLoader("Loading records for " + d);

        try {
            let existingRecord = null;
            if (window.getDatabase && window.ref && window.get) {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_balance_snapshots/${d}`));
                if (snap.exists()) existingRecord = snap.val();
            }

            if (existingRecord) {
                currentBalances = { ...(existingRecord.balances || {}) };
                currentCash = { ...(existingRecord.cash || {}) };
                currentCards = { ...(existingRecord.cards || {}) };
                if (typeof window.showToast === 'function') window.showToast(`Loaded snapshot for ${d}`, "info");
            } else {
                currentBalances = { ...(window.balanceStore || {}) };
                currentCash = { ...(window.cashQuantities || {}), others: window.cashOthersAmount || 0 };
                currentCards = { ...(window.cardQuantities || {}) };
            }
            window.renderWizardUI();
        } catch (e) {
            console.error("Fetch Error:", e);
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ৭. ফিল্টার বাটন হ্যান্ডলার
    window.filterCardOperatorView = function (opName) {
        activeCardFilter = opName;
        document.querySelectorAll('.op-pill-btn').forEach(btn => {
            if (btn.getAttribute('data-op') === opName) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        document.querySelectorAll('.op-segment-box').forEach(box => {
            const boxOp = box.getAttribute('data-op');
            if (opName === 'ALL' || boxOp === opName) {
                box.style.display = 'block';
            } else {
                box.style.display = 'none';
            }
        });
    };

    // ৮. উইজার্ড ইন্টারফেস রেন্ডারার
    window.renderWizardUI = function () {
        const container = document.getElementById('hubWizardContainer');
        if (!container) return;
        container.innerHTML = '';

        const { cats, accs } = getMasterAccountsAndCategories();
        const cardConfig = getMasterCardConfig();

        let stepIndex = 1;

        // ১. অ্যাকাউন্টস সেকশন
        cats.forEach(cat => {
            const catAccs = accs.filter(a => a.catId === cat.id);
            if (catAccs.length === 0) return;

            let catSubtotal = 0;
            let stripsHTML = '';

            catAccs.forEach(acc => {
                const bal = parseFloat(currentBalances[acc.id]) || 0;
                catSubtotal += bal;

                let cleanName = acc.name
                    .replace(/personal\s*accounts?|agent\s*accounts?|bank\s*accounts?|recharge/gi, '')
                    .replace(/personal|agent|account|bank/gi, '')
                    .trim();
                if (!cleanName) cleanName = acc.name;

                stripsHTML += `
                    <div class="hub-strip-item">
                        <span class="hub-strip-label">${cleanName}</span>
                        <div class="hub-input-wrap">
                            <span>৳</span>
                            <input type="number" step="any" class="hub-inp-text" value="${bal}" 
                                oninput="window.updateHubBalance('${acc.id}', this.value, 'cat-sub-${cat.id}')">
                        </div>
                    </div>
                `;
            });

            const currentStepId = `hub-sec-${stepIndex}`;
            const nextStepId = `hub-sec-${stepIndex + 1}`;
            const isFirst = (stepIndex === 1);

            const sectionHTML = `
                <div class="hub-wizard-sec ${isFirst ? 'active' : ''}" id="${currentStepId}">
                    <div class="hub-wizard-head" onclick="window.toggleSingleWizardSec('${currentStepId}')">
                        <span class="hub-wizard-title">${stepIndex}. ${cat.name}</span>
                        <div class="hub-wizard-meta">
                            <span id="cat-sub-${cat.id}">Subtotal: ৳ ${fmt(catSubtotal)}</span>
                            ${svgChevron}
                        </div>
                    </div>
                    <div class="hub-wizard-body">
                        <div class="hub-strip-grid">${stripsHTML}</div>
                        <div class="hub-step-footer">
                            <button class="hub-btn-next" onclick="window.wizardGoToNext('${nextStepId}')">
                                <span>Next Step</span> &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', sectionHTML);
            stepIndex++;
        });

        // ২. ক্যাশ ড্রয়ার সেকশন
        let cashSubtotal = 0;
        let cashStripsHTML = '';
        [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(note => {
            const q = parseInt(currentCash[note]) || 0;
            const line = q * note;
            cashSubtotal += line;
            cashStripsHTML += `
                <div class="hub-strip-item">
                    <span class="hub-strip-label">৳ ${note}</span>
                    <div class="hub-input-wrap">
                        <input type="number" class="hub-qty-inp" placeholder="0" value="${q}" 
                            oninput="window.updateHubCash(${note}, this.value, 'cash-line-${note}')">
                        <span class="hub-sub-val" id="cash-line-${note}">${fmt(line)}</span>
                    </div>
                </div>
            `;
        });
        const othersAmt = parseFloat(currentCash.others) || 0;
        cashSubtotal += othersAmt;
        cashStripsHTML += `
            <div class="hub-strip-item">
                <span class="hub-strip-label">Coins & Loose</span>
                <div class="hub-input-wrap">
                    <span>৳</span>
                    <input type="number" step="any" class="hub-inp-text" value="${othersAmt}" 
                        oninput="window.updateHubCashOthers(this.value)">
                </div>
            </div>
        `;

        const cashSecId = `hub-sec-${stepIndex}`;
        const cardsSecId = `hub-sec-${stepIndex + 1}`;

        container.insertAdjacentHTML('beforeend', `
            <div class="hub-wizard-sec" id="${cashSecId}">
                <div class="hub-wizard-head" onclick="window.toggleSingleWizardSec('${cashSecId}')">
                    <span class="hub-wizard-title">${stepIndex}. Cash Drawer</span>
                    <div class="hub-wizard-meta">
                        <span id="cash-subtotal-disp">Total Cash: ৳ ${fmt(cashSubtotal)}</span>
                        ${svgChevron}
                    </div>
                </div>
                <div class="hub-wizard-body">
                    <div class="hub-strip-grid">${cashStripsHTML}</div>
                    <div class="hub-step-footer">
                        <button class="hub-btn-next" onclick="window.wizardGoToNext('${cardsSecId}')">
                            <span>Next: Cards Stock</span> &rarr;
                        </button>
                    </div>
                </div>
            </div>
        `);
        stepIndex++;

        // ৩. কার্ডস স্টক সেকশন
        let grandCardSubtotal = 0;
        let operatorBlocksHTML = '';
        const operatorList = ['GP', 'Banglalink', 'Robi', 'Airtel'];

        operatorList.forEach(op => {
            const rawCards = cardConfig[op] || [];
            const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
            const opQtys = currentCards[op] || {};

            let opSubtotal = 0;
            let opStripsHTML = '';

            opCards.filter(c => c.active !== false).forEach(c => {
                const q = parseInt(opQtys[c.id]) || 0;
                const line = q * (parseFloat(c.price) || 0);
                opSubtotal += line;
                grandCardSubtotal += line;

                opStripsHTML += `
                    <div class="hub-strip-item">
                        <span class="hub-strip-label">${c.name} (${c.price}৳)</span>
                        <div class="hub-input-wrap">
                            <input type="number" class="hub-qty-inp" placeholder="0" value="${q}" 
                                oninput="window.updateHubCard('${op}', '${c.id}', ${c.price}, this.value, 'card-line-${c.id}', 'op-sub-${op}')">
                            <span class="hub-sub-val" id="card-line-${c.id}">${fmt(line)}</span>
                        </div>
                    </div>
                `;
            });

            if (opStripsHTML) {
                operatorBlocksHTML += `
                    <div class="op-segment-box" data-op="${op}">
                        <div class="op-segment-header">
                            <span>${op} Operator Cards</span>
                            <span id="op-sub-${op}">Subtotal: ৳ ${fmt(opSubtotal)}</span>
                        </div>
                        <div class="hub-strip-grid">${opStripsHTML}</div>
                    </div>
                `;
            }
        });

        const filterPillsHTML = `
            <div class="card-op-filter-bar">
                <button class="op-pill-btn active" data-op="ALL" onclick="window.filterCardOperatorView('ALL')">All Operators</button>
                ${operatorList.map(op => `<button class="op-pill-btn" data-op="${op}" onclick="window.filterCardOperatorView('${op}')">${op}</button>`).join('')}
            </div>
        `;

        container.insertAdjacentHTML('beforeend', `
            <div class="hub-wizard-sec" id="${cardsSecId}">
                <div class="hub-wizard-head" onclick="window.toggleSingleWizardSec('${cardsSecId}')">
                    <span class="hub-wizard-title">${stepIndex}. Cards Stock</span>
                    <div class="hub-wizard-meta">
                        <span id="cards-subtotal-disp">Total Cards: ৳ ${fmt(grandCardSubtotal)}</span>
                        ${svgChevron}
                    </div>
                </div>
                <div class="hub-wizard-body">
                    ${filterPillsHTML}
                    ${operatorBlocksHTML || '<p style="font-size:12px;color:#64748b;">No active cards in Card Setup.</p>'}
                    <div class="hub-step-footer">
                        <span style="font-size: 12px; font-weight: 700; color: #16a34a;">&#10003; All sections reviewed. Click Save Balance below.</span>
                    </div>
                </div>
            </div>
        `);

        window.recalculateGrandLiveTotal();
    };

    // ৯. উইজার্ড নেভিগেশন
    window.toggleSingleWizardSec = function (secId) {
        document.querySelectorAll('.hub-wizard-sec').forEach(sec => {
            if (sec.id === secId) sec.classList.toggle('active');
            else sec.classList.remove('active');
        });
    };

    window.wizardGoToNext = function (nextSecId) {
        document.querySelectorAll('.hub-wizard-sec').forEach(sec => sec.classList.remove('active'));
        const nextSec = document.getElementById(nextSecId);
        if (nextSec) {
            nextSec.classList.add('active');
            nextSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // ১০. লাইভ ক্যালকুলেশন হ্যান্ডলার (FIXED)
    window.updateHubBalance = function (accId, val, catSubId) {
        currentBalances[accId] = parseFloat(val) || 0;

        if (catSubId) {
            const subEl = document.getElementById(catSubId);
            if (subEl) {
                const catId = catSubId.replace('cat-sub-', '');
                const { accs } = getMasterAccountsAndCategories();
                const catAccs = accs.filter(a => a.catId === catId);
                let total = 0;
                catAccs.forEach(a => total += (parseFloat(currentBalances[a.id]) || 0));
                subEl.innerText = `Subtotal: ৳ ${fmt(total)}`;
            }
        }
        window.recalculateGrandLiveTotal();
    };

    function updateCashHeaderDisplay() {
        let cashSubtotal = 0;
        [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(note => {
            cashSubtotal += ((parseInt(currentCash[note]) || 0) * note);
        });
        cashSubtotal += (parseFloat(currentCash.others) || 0);
        const disp = document.getElementById('cash-subtotal-disp');
        if (disp) disp.innerText = `Total Cash: ৳ ${fmt(cashSubtotal)}`;
    }

    window.updateHubCash = function (note, val, lineId) {
        const q = parseInt(val) || 0;
        currentCash[note] = q;
        const line = q * note;
        const lineEl = document.getElementById(lineId);
        if (lineEl) lineEl.innerText = fmt(line);
        updateCashHeaderDisplay();
        window.recalculateGrandLiveTotal();
    };

    window.updateHubCashOthers = function (val) {
        currentCash.others = parseFloat(val) || 0;
        updateCashHeaderDisplay();
        window.recalculateGrandLiveTotal();
    };

    window.updateHubCard = function (op, cardId, price, val, lineId, opSubId) {
        if (!currentCards[op]) currentCards[op] = {};
        const q = parseInt(val) || 0;
        currentCards[op][cardId] = q;
        const line = q * price;
        const lineEl = document.getElementById(lineId);
        if (lineEl) lineEl.innerText = fmt(line);

        const cardConfig = getMasterCardConfig();
        const rawCards = cardConfig[op] || [];
        const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
        let opTotal = 0;
        opCards.forEach(c => opTotal += ((parseInt(currentCards[op]?.[c.id]) || 0) * (parseFloat(c.price) || 0)));
        const opSubEl = document.getElementById(opSubId);
        if (opSubEl) opSubEl.innerText = `Subtotal: ৳ ${fmt(opTotal)}`;

        window.recalculateGrandLiveTotal();
    };

    window.recalculateGrandLiveTotal = function () {
        let total = 0;
        Object.values(currentBalances).forEach(v => total += (parseFloat(v) || 0));
        [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => total += ((parseInt(currentCash[n]) || 0) * n));
        total += (parseFloat(currentCash.others) || 0);

        let cardsTotal = 0;
        const cardConfig = getMasterCardConfig();
        ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
            const rawCards = cardConfig[op] || [];
            const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
            const opQtys = currentCards[op] || {};
            opCards.forEach(c => cardsTotal += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
        });
        total += cardsTotal;

        const cardsSubEl = document.getElementById('cards-subtotal-disp');
        if (cardsSubEl) cardsSubEl.innerText = `Total Cards: ৳ ${fmt(cardsTotal)}`;

        const liveEl = document.getElementById('hubLiveGrandTotal');
        if (liveEl) liveEl.innerText = `৳ ${fmt(total)}`;
    };

    // ১১. ফায়ারবেসে ফাইনাল সেভ
    window.saveAssetHubToFirebase = async function () {
        const d = document.getElementById('hubSelectedDate').value || new Date().toISOString().split('T')[0];
        if (typeof window.showLoader === 'function') window.showLoader("Saving Daily Asset Data...");

        try {
            const snapshotObj = {
                date: d,
                timestamp: Date.now(),
                balances: { ...currentBalances },
                cash: { ...currentCash },
                cards: { ...currentCards }
            };

            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`erp/daily_balance_snapshots/${d}`, snapshotObj);
            }

            const todayStr = new Date().toISOString().split('T')[0];
            if (d === todayStr && typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`erp/balances`, currentBalances);
                await window.writeToFirebase(`erp/cashInventory`, { quantities: currentCash, others: currentCash.others || 0 });
                await window.writeToFirebase(`erp/cardInventory`, currentCards);
            }

            // Auto-sync with erp/dailyClosingReports
            try {
                let actualClosingTotal = 0;
                const cardCfg = getMasterCardConfig();
                Object.values(currentBalances || {}).forEach(v => actualClosingTotal += (parseFloat(v) || 0));
                [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => actualClosingTotal += ((parseInt(currentCash?.[n]) || 0) * n));
                actualClosingTotal += (parseFloat(currentCash?.others) || 0);
                ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                    const rawCards = cardCfg[op] || [];
                    const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                    const opQtys = currentCards?.[op] || {};
                    opCards.forEach(c => actualClosingTotal += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
                });

                let sortedReports = (window.dailyClosingReports || [])
                    .filter(r => r.report_date < d)
                    .sort((a, b) => b.report_date.localeCompare(a.report_date));
                const openingCap = sortedReports.length > 0 ? parseFloat(sortedReports[0].actual_closing) : 50000;

                let totalPelam = 0, totalDilam = 0;
                (window.customerTransactions || []).filter(t => String(t.date) === String(d)).forEach(t => {
                    totalPelam += parseFloat(t.credit) || 0;
                    totalDilam += parseFloat(t.debit) || 0;
                });

                const expectedCap = openingCap + totalPelam - totalDilam;
                const netIncome = actualClosingTotal - expectedCap;

                const closingSnapshot = {
                    report_id: 'DCR-' + Date.now(),
                    report_date: d,
                    opening_capital: openingCap,
                    total_pelam: totalPelam,
                    total_dilam: totalDilam,
                    expected_closing: expectedCap,
                    actual_closing: actualClosingTotal,
                    income: netIncome,
                    status: 'Closed',
                    closing_time: new Date().toLocaleTimeString()
                };

                if (window.dailyClosingReports) {
                    window.dailyClosingReports = window.dailyClosingReports.filter(r => r.report_date !== d);
                    window.dailyClosingReports.unshift(closingSnapshot);
                    if (typeof window.writeToFirebase === 'function') {
                        await window.writeToFirebase('erp/dailyClosingReports', window.dailyClosingReports);
                    }
                }
            } catch (syncErr) {
                console.warn("Auto closing sync note:", syncErr);
            }

            if (typeof window.showToast === 'function') window.showToast(`Balance recorded for ${d}!`, "success");
            else alert(`Balance recorded for ${d}!`);
        } catch (e) {
            console.error("Save Error:", e);
            if (typeof window.showToast === 'function') window.showToast("Error saving data!", "error");
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ১২. হিস্ট্রি রেন্ডারার
    window.renderAssetHistoryList = async function () {
        const container = document.getElementById('hubHistoryListContainer');
        if (!container) return;
        container.innerHTML = '<p style="font-size:12px; padding:15px;">Loading history records...</p>';

        try {
            if (window.getDatabase && window.ref && window.get) {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_balance_snapshots`));
                if (snap.exists()) {
                    const data = snap.val();
                    allHistoryRecords = Object.values(data).sort((a,b) => b.date.localeCompare(a.date));
                } else {
                    allHistoryRecords = [];
                }
            }

            if (allHistoryRecords.length === 0) {
                container.innerHTML = '<p style="font-size:12px; padding:20px; color:#64748b;">No saved records found.</p>';
                return;
            }

            container.innerHTML = '';
            const cardConfig = getMasterCardConfig();

            allHistoryRecords.forEach(rec => {
                let aTotal = 0, cTotal = 0, cardTotal = 0;
                Object.values(rec.balances || {}).forEach(v => aTotal += (parseFloat(v) || 0));
                [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTotal += ((parseInt(rec.cash?.[n]) || 0) * n));
                cTotal += (parseFloat(rec.cash?.others) || 0);

                ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                    const rawCards = cardConfig[op] || [];
                    const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                    const opQtys = rec.cards?.[op] || {};
                    opCards.forEach(c => cardTotal += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
                });

                const grand = aTotal + cTotal + cardTotal;
                const timeStr = rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                const cardHTML = `
                    <div class="hub-history-card">
                        <div class="hub-hist-date">
                            ${rec.date} <span>(${timeStr})</span>
                        </div>
                        <div class="hub-hist-stats">
                            <div>Accounts: ৳ ${fmt(aTotal)}</div>
                            <div>Cash: ৳ ${fmt(cTotal)}</div>
                            <div>Cards: ৳ ${fmt(cardTotal)}</div>
                        </div>
                        <div class="hub-hist-total">Total: ৳ ${fmt(grand)}</div>
                        <div>
                            <button class="hub-icon-btn" title="Edit / Load" onclick="window.loadHistoricalRecordToForm('${rec.date}')">Edit</button>
                            <button class="hub-icon-btn" title="View Audit Report" onclick="window.viewAuditFromHistory('${rec.date}')">Report</button>
                            <button class="hub-icon-btn hub-icon-delete" title="Delete" onclick="window.deleteHistoricalRecord('${rec.date}')">Delete</button>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        } catch (e) {
            container.innerHTML = '<p style="color:red; font-size:12px;">Failed to load history.</p>';
        }
    };

    window.loadHistoricalRecordToForm = function (dateStr) {
        document.getElementById('hubSelectedDate').value = dateStr;
        window.switchAssetHubSubTab('entry');
        window.onAssetHubDateChange();
    };

    window.viewAuditFromHistory = function (dateStr) {
        if (typeof window.switchMainTab === 'function') {
            window.switchMainTab('liquid-audit');
            const dInput = document.getElementById('liquidStatementDate');
            if (dInput) {
                dInput.value = dateStr;
                if (typeof window.renderLiquidStatementReport === 'function') {
                    window.renderLiquidStatementReport();
                }
            }
        }
    };

    window.deleteHistoricalRecord = function (dateStr) {
        if (confirm(`Are you sure you want to delete the record for ${dateStr}?`)) {
            if (typeof window.writeToFirebase === 'function') {
                window.writeToFirebase(`erp/daily_balance_snapshots/${dateStr}`, null).then(() => {
                    window.renderAssetHistoryList();
                });
            }
        }
    };

    // ১৩. ডেইলি ইনকাম ক্যালকুলেশন ইঞ্জিন
    window.loadAssetHubIncome = function () {
        const fromInp = document.getElementById('hubIncDateFrom');
        const toInp = document.getElementById('hubIncDateTo');
        if (fromInp && !fromInp.value) {
            window.setHubIncomeShortcut('today');
        } else {
            window.calcHubIncomeDynamically();
        }
    };

    window.setHubIncomeShortcut = function (type) {
        document.querySelectorAll('.hub-btn-quick').forEach(b => b.classList.remove('active'));

        const now = new Date();
        const toYMD = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        let fromStr = toYMD(now);
        let toStr = toYMD(now);

        if (type === 'today') {
            document.getElementById('btnHubIncToday')?.classList.add('active');
        } else if (type === 'yesterday') {
            document.getElementById('btnHubIncYesterday')?.classList.add('active');
            const y = new Date(now);
            y.setDate(y.getDate() - 1);
            fromStr = toYMD(y);
            toStr = toYMD(y);
        } else if (type === '7days') {
            document.getElementById('btnHubInc7Days')?.classList.add('active');
            const d7 = new Date(now);
            d7.setDate(d7.getDate() - 6);
            fromStr = toYMD(d7);
        } else if (type === 'this_month') {
            document.getElementById('btnHubIncThisMonth')?.classList.add('active');
            const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
            fromStr = toYMD(mStart);
        } else if (type === 'last_month') {
            document.getElementById('btnHubIncLastMonth')?.classList.add('active');
            const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0);
            fromStr = toYMD(lmStart);
            toStr = toYMD(lmEnd);
        }

        const fromInp = document.getElementById('hubIncDateFrom');
        const toInp = document.getElementById('hubIncDateTo');
        if (fromInp) fromInp.value = fromStr;
        if (toInp) toInp.value = toStr;

        window.calcHubIncomeDynamically();
    };

    window.calcHubIncomeDynamically = async function () {
        const fromInp = document.getElementById('hubIncDateFrom');
        const toInp = document.getElementById('hubIncDateTo');
        if (!fromInp || !toInp) return;

        const fromDate = fromInp.value || new Date().toISOString().split('T')[0];
        const toDate = toInp.value || fromDate;

        // আপডেট পিরিয়ড ব্যাজ
        const badge = document.getElementById('hubIncomePeriodBadge');
        if (badge) {
            badge.innerText = (fromDate === toDate) ? fromDate : `${fromDate} to ${toDate}`;
        }

        // ১. কাস্টমার লেনদেন (পেলেন ও দিলেন)
        const txs = Array.isArray(window.customerTransactions) ? window.customerTransactions : [];
        let totalPelam = 0;
        let totalDilam = 0;
        txs.forEach(t => {
            const tDate = String(t.date || '');
            if (tDate >= fromDate && tDate <= toDate) {
                totalPelam += parseFloat(t.credit) || 0;
                totalDilam += parseFloat(t.debit) || 0;
            }
        });

        // ২. ওপেনিং ক্যাপিটাল
        let openingCapital = 50000;
        try {
            if (allHistoryRecords.length === 0 && window.getDatabase && window.ref && window.get) {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_balance_snapshots`));
                if (snap.exists()) {
                    allHistoryRecords = Object.values(snap.val()).sort((a,b) => b.date.localeCompare(a.date));
                }
            }

            const priorSnap = allHistoryRecords
                .filter(r => r.date < fromDate)
                .sort((a, b) => b.date.localeCompare(a.date))[0];

            if (priorSnap) {
                let aTot = 0, cTot = 0, cardTot = 0;
                const cardCfg = getMasterCardConfig();
                Object.values(priorSnap.balances || {}).forEach(v => aTot += (parseFloat(v) || 0));
                [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTot += ((parseInt(priorSnap.cash?.[n]) || 0) * n));
                cTot += (parseFloat(priorSnap.cash?.others) || 0);
                ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                    const rawCards = cardCfg[op] || [];
                    const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                    const opQtys = priorSnap.cards?.[op] || {};
                    opCards.forEach(c => cardTot += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
                });
                openingCapital = aTot + cTot + cardTot;
            } else {
                const closings = window.dailyClosingReports || [];
                const priorClosing = closings
                    .filter(r => r.report_date < fromDate)
                    .sort((a, b) => b.report_date.localeCompare(a.report_date))[0];
                if (priorClosing && priorClosing.actual_closing) {
                    openingCapital = parseFloat(priorClosing.actual_closing) || 50000;
                }
            }
        } catch (e) {
            console.warn("Opening fetch error:", e);
        }

        // ৩. একচুয়াল ক্লোজিং সম্পদ
        const todayStr = new Date().toISOString().split('T')[0];
        let actualAssets = 0;

        if (toDate === todayStr) {
            let aTot = 0, cTot = 0, cardTot = 0;
            const cardCfg = getMasterCardConfig();
            const liveBals = (window.balanceStore && Object.keys(window.balanceStore).length > 0) ? window.balanceStore : currentBalances;
            Object.values(liveBals).forEach(v => aTot += (parseFloat(v) || 0));

            const liveCash = (window.cashQuantities && Object.keys(window.cashQuantities).length > 0) ? window.cashQuantities : currentCash;
            [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTot += ((parseInt(liveCash[n]) || 0) * n));
            cTot += (parseFloat(window.cashOthersAmount || currentCash.others) || 0);

            const liveCards = (window.cardQuantities && Object.keys(window.cardQuantities).length > 0) ? window.cardQuantities : currentCards;
            ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                const rawCards = cardCfg[op] || [];
                const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                const opQtys = liveCards[op] || {};
                opCards.forEach(c => cardTot += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
            });
            actualAssets = aTot + cTot + cardTot;
        } else {
            const targetSnap = allHistoryRecords.find(r => r.date === toDate);
            if (targetSnap) {
                let aTot = 0, cTot = 0, cardTot = 0;
                const cardCfg = getMasterCardConfig();
                Object.values(targetSnap.balances || {}).forEach(v => aTot += (parseFloat(v) || 0));
                [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTot += ((parseInt(targetSnap.cash?.[n]) || 0) * n));
                cTot += (parseFloat(targetSnap.cash?.others) || 0);
                ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                    const rawCards = cardCfg[op] || [];
                    const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                    const opQtys = targetSnap.cards?.[op] || {};
                    opCards.forEach(c => cardTot += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
                });
                actualAssets = aTot + cTot + cardTot;
            } else {
                const closings = window.dailyClosingReports || [];
                const exactClosing = closings.find(r => r.report_date === toDate);
                if (exactClosing) actualAssets = parseFloat(exactClosing.actual_closing) || 0;
            }
        }

        // ৪. প্রত্যাশিত মূলধন ও নিট আয়
        const expectedCapital = openingCapital + totalPelam - totalDilam;
        const netIncome = actualAssets - expectedCapital;

        // ৫. ইউআই আপডেট
        const elOpening = document.getElementById('hubIncOpening');
        const elPelam = document.getElementById('hubIncPelam');
        const elDilam = document.getElementById('hubIncDilam');
        const elExpected = document.getElementById('hubIncExpected');
        const elActual = document.getElementById('hubIncActual');
        const elNetIncome = document.getElementById('hubIncNetIncome');

        if (elOpening) elOpening.innerText = `৳ ${fmt(openingCapital)}`;
        if (elPelam) elPelam.innerText = `+ ৳ ${fmt(totalPelam)}`;
        if (elDilam) elDilam.innerText = `- ৳ ${fmt(totalDilam)}`;
        if (elExpected) elExpected.innerText = `৳ ${fmt(expectedCapital)}`;
        if (elActual) elActual.innerText = `৳ ${fmt(actualAssets)}`;

        if (elNetIncome) {
            elNetIncome.innerText = `${netIncome >= 0 ? '' : '- '}৳ ${fmt(Math.abs(netIncome))}`;
            elNetIncome.style.color = netIncome >= 0 ? '#15803d' : '#dc2626';
        }
    };

    window.generateDailyClosingSnapshot = async function() {
        if (typeof window.calcHubIncomeDynamically === 'function') {
            await window.calcHubIncomeDynamically();
        }
    };

    window.loadAssetHubInputs = function () {
        const dInput = document.getElementById('hubSelectedDate');
        if (dInput && !dInput.value) {
            dInput.value = new Date().toISOString().split('T')[0];
        }
        window.onAssetHubDateChange();
    };

    function init() {
        injectSidebarMenu();
        injectViewPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
