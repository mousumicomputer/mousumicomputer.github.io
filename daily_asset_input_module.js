/**
 * Mousumi Computer ERP - Daily Liquid Asset, Balance & Income Hub
 * File: daily_asset_input_module.js
 * Feature: Multi-Device Permanent Cloud Sync, Clean 0.00 on New Day,
 *          Dedicated Income History Table, Pill-Shaped Minimal Save Button,
 *          Real System Toast Notification, Tiro Bangla Font, Single-Source of Truth.
 */

(function () {
    // ১. স্টাইলিং ও সিএসএস (মিনিমাল, টিরো বাংলা, কোনো অতিরিক্ত ডিজাইন ছাড়া)
    const moduleStyles = `
        <style id="asset-hub-styles">
            #asset-hub-view { 
                font-family: 'Tiro Bangla', serif !important; 
                text-transform: none !important; 
                color: #0f172a; 
                padding: 15px 25px 95px 25px; 
                position: relative; 
            }
            #asset-hub-view * { box-sizing: border-box; font-family: 'Tiro Bangla', serif !important; }

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

            .hub-wizard-sec {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                margin-bottom: 16px;
                overflow: hidden;
                transition: border-color 0.2s;
            }
            .hub-wizard-sec.active { border-color: #0284c7; border-width: 1.5px; }

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
            
            .hub-arrow-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.25s ease;
                color: #64748b;
            }
            .hub-wizard-sec:not(.active) .hub-arrow-icon { transform: rotate(-90deg); }
            .hub-wizard-sec:not(.active) .hub-wizard-body { display: none; }

            .hub-wizard-body { padding: 18px 20px; }

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

            .card-op-filter-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 15px; flex-wrap: wrap; }
            .op-pill-btn {
                padding: 5px 14px;
                border: 1px solid #cbd5e1;
                border-radius: 20px;
                background: #fff;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                color: #334155;
            }
            .op-pill-btn:hover { background: #f1f5f9; }
            .op-pill-btn.active { background: #0f172a; color: #fff; border-color: #0f172a; }

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

            .hub-step-footer { display: flex; justify-content: flex-end; padding-top: 14px; border-top: 1px solid #f1f5f9; }
            .hub-btn-next {
                background: #f8fafc;
                border: 1.5px solid #0f172a;
                color: #0f172a;
                padding: 7px 22px;
                border-radius: 30px;
                font-size: 12px;
                font-weight: 800;
                cursor: pointer;
            }

            /* শুধু গোল শেপ ও শুধুই SAVE বাটন */
            .hub-floating-btn {
                position: fixed;
                bottom: 30px;
                right: 40px;
                background: #0f172a;
                color: #fff;
                border: none;
                padding: 11px 32px;
                border-radius: 30px;
                font-size: 13px;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(0,0,0,0.18);
                z-index: 9999;
                transition: transform 0.2s, background 0.2s;
            }
            .hub-floating-btn:hover { background: #1e293b; transform: scale(1.03); }

            /* BALANCE ENTRY HISTORY */
            .hub-history-card {
                background: #fff;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 14px 18px;
                margin-bottom: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
            }
            .hub-hist-date { font-size: 13.5px; font-weight: 800; color: #0f172a; }
            .hub-hist-date span { font-size: 11px; font-weight: normal; color: #64748b; margin-left: 5px; }
            .hub-hist-stats { display: flex; gap: 20px; font-size: 12px; font-weight: 700; color: #334155; }
            .hub-hist-total { font-size: 14px; font-weight: 900; color: #0f172a; }
            
            .hub-icon-btn {
                background: #fff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 5px 12px;
                cursor: pointer;
                font-size: 11.5px;
                font-weight: 800;
                color: #334155;
            }
            .hub-icon-btn:hover { border-color: #0f172a; background: #f8fafc; color: #0f172a; }
            .hub-btn-edit { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
            .hub-btn-edit:hover { background: #dbeafe; border-color: #1d4ed8; }

            /* DAILY INCOME STYLES (MINIMAL TABLE) */
            .hub-income-container { display: flex; justify-content: flex-start; padding: 10px 0 30px 0; width: 100%; }
            .hub-inc-card {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                width: 100%;
                max-width: 600px;
                overflow: hidden;
            }
            .hub-inc-header {
                padding: 12px 16px;
                background: #f8fafc;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .hub-inc-title { font-size: 13.5px; font-weight: 800; text-transform: uppercase; color: #0f172a; }
            .hub-inc-badge { font-size: 11px; font-weight: 700; color: #0f172a; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 8px; border-radius: 4px; }
            .hub-inc-shortcuts { padding: 10px 14px; background: #ffffff; border-bottom: 1px solid #f1f5f9; display: flex; flex-wrap: wrap; gap: 6px; }
            .hub-btn-quick {
                background: #fff;
                border: 1px solid #cbd5e1;
                color: #475569;
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 11.5px;
                font-weight: 700;
                cursor: pointer;
            }
            .hub-btn-quick:hover { background: #f1f5f9; }
            .hub-btn-quick.active { background: #0f172a; color: #ffffff; border-color: #0f172a; }
            
            .hub-inc-dates { padding: 10px 14px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px; font-size: 12px; font-weight: 700; }
            .hub-inc-dates input { height: 28px; padding: 0 8px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 12px; font-weight: 700; outline: none; }

            .hub-inc-table { width: 100%; border-collapse: collapse; }
            .hub-inc-table tr td { padding: 11px 16px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .hub-inc-table .hub-lbl { color: #475569; font-weight: 700; }
            .hub-inc-table .hub-val { text-align: right; font-weight: 800; color: #0f172a; font-size: 13.5px; }
            .hub-inc-table tr.hub-row-exp { background: #f8fafc; }
            .hub-inc-table tr.hub-row-inc { background: #f0fdf4; border-top: 1.5px solid #86efac; }
            .hub-inc-table tr.hub-row-inc .hub-lbl-inc { font-size: 14px; font-weight: 800; color: #15803d; }
            .hub-inc-table tr.hub-row-inc .hub-val-inc { text-align: right; font-size: 15px; font-weight: 900; color: #15803d; }

            .hub-inc-status {
                padding: 10px 16px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
                font-size: 11px;
                color: #64748b;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            /* SECTION 4: INCOME HISTORY ARCHIVE TABLE */
            .hub-hist-table-wrap {
                background: #fff;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                overflow-x: auto;
                max-width: 950px;
            }
            .hub-hist-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                text-align: left;
            }
            .hub-hist-table th {
                background: #f8fafc;
                padding: 10px 12px;
                border-bottom: 1px solid #cbd5e1;
                color: #475569;
                font-weight: 800;
                white-space: nowrap;
            }
            .hub-hist-table td {
                padding: 10px 12px;
                border-bottom: 1px solid #f1f5f9;
                font-weight: 700;
                white-space: nowrap;
            }
            .hub-hist-table tr:hover td { background: #fbfcfe; }
            .t-right { text-align: right; }
            .t-green { color: #16a34a; }
            .t-red { color: #dc2626; }
            .t-net-green { color: #15803d; font-weight: 900; }
            .t-subtext { font-size: 10.5px; color: #64748b; display: block; font-weight: normal; }

            .btn-table-report {
                background: #fff;
                border: 1px solid #cbd5e1;
                padding: 4px 12px;
                border-radius: 4px;
                font-size: 11.5px;
                font-weight: 800;
                cursor: pointer;
                color: #0f172a;
            }
            .btn-table-report:hover { background: #0f172a; color: #fff; }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', moduleStyles);

    const svgChevron = `<svg class="hub-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

    // ২. সাইডবার মেনুতে ৪টি পরিষ্কার সাব-মেনু ইনজেকশন
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
                    <li class="submenu-item" id="sub-asset-inc-history">
                        <a onclick="window.switchAssetHubSubTab('inc-history')">
                            <span><i class="fa fa-chevron-right" style="font-size: 9px; margin-right: 6px; opacity: 0.7;"></i>Income History</span>
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
                        <div style="font-size: 13.5px; font-weight: 800;">
                            Live Total: <span id="hubLiveGrandTotal" style="color: #0284c7;">৳ 0.00</span>
                        </div>
                    </div>

                    <div id="hubWizardContainer"></div>

                    <button class="hub-floating-btn" onclick="window.saveAssetHubToFirebase()">Save</button>
                </div>

                <!-- SUB-TAB 2: DAILY INCOME -->
                <div id="hub-tab-income" style="display: none;">
                    <div class="hub-income-container">
                        <div class="hub-inc-card">
                            <div class="hub-inc-header">
                                <span class="hub-inc-title">Daily Income</span>
                                <span class="hub-inc-badge" id="hubIncomePeriodBadge">Today</span>
                            </div>

                            <div class="hub-inc-shortcuts">
                                <button type="button" class="hub-btn-quick active" id="btnHubIncToday" onclick="window.setHubIncomeShortcut('today')">Today</button>
                                <button type="button" class="hub-btn-quick" id="btnHubIncYesterday" onclick="window.setHubIncomeShortcut('yesterday')">Yesterday</button>
                                <button type="button" class="hub-btn-quick" id="btnHubInc7Days" onclick="window.setHubIncomeShortcut('7days')">7 Days</button>
                                <button type="button" class="hub-btn-quick" id="btnHubIncThisMonth" onclick="window.setHubIncomeShortcut('this_month')">This Month</button>
                                <button type="button" class="hub-btn-quick" id="btnHubIncLastMonth" onclick="window.setHubIncomeShortcut('last_month')">Last Month</button>
                            </div>

                            <div class="hub-inc-dates">
                                <div>From: <input type="date" id="hubIncDateFrom" onchange="window.calcHubIncomeDynamically()"></div>
                                <div>To: <input type="date" id="hubIncDateTo" onchange="window.calcHubIncomeDynamically()"></div>
                                <button type="button" class="hub-btn-quick" onclick="window.calcHubIncomeDynamically()" style="height: 28px; padding: 0 10px;">
                                    <i class="fa-solid fa-rotate"></i>
                                </button>
                            </div>

                            <table class="hub-inc-table">
                                <tbody>
                                    <tr>
                                        <td class="hub-lbl">Opening</td>
                                        <td class="hub-val" id="hubIncOpening">৳ 0.00</td>
                                    </tr>
                                    <tr>
                                        <td class="hub-lbl">Pelam (+)</td>
                                        <td class="hub-val" style="color: #16a34a;" id="hubIncPelam">+ ৳ 0.00</td>
                                    </tr>
                                    <tr>
                                        <td class="hub-lbl">Dilam (-)</td>
                                        <td class="hub-val" style="color: #dc2626;" id="hubIncDilam">- ৳ 0.00</td>
                                    </tr>
                                    <tr class="hub-row-exp">
                                        <td class="hub-lbl">Expected</td>
                                        <td class="hub-val" id="hubIncExpected">৳ 0.00</td>
                                    </tr>
                                    <tr>
                                        <td class="hub-lbl">Actual</td>
                                        <td class="hub-val" id="hubIncActual">৳ 0.00</td>
                                    </tr>
                                    <tr class="hub-row-inc">
                                        <td class="hub-lbl-inc">Net Income</td>
                                        <td class="hub-val-inc" id="hubIncNetIncome">৳ 0.00</td>
                                    </tr>
                                </tbody>
                            </table>

                            <div class="hub-inc-status">
                                <span>Auto-Sync: Active</span>
                                <span id="hubIncomeLastUpdated">Last Updated: ---</span>
                            </div>
                        </div>
                    </div>

                    <!-- শুধুই SAVE বাটন -->
                    <button class="hub-floating-btn" onclick="window.saveDailyIncomeToFirebase()">Save</button>
                </div>

                <!-- SUB-TAB 3: ENTRY HISTORY (BALANCE ONLY) -->
                <div id="hub-tab-history" style="display: none;">
                    <div class="hub-top-ctrl">
                        <div style="font-size: 13.5px; font-weight: 800; text-transform: uppercase;">Saved Daily Balances</div>
                        <button class="hub-icon-btn" onclick="window.renderAssetHistoryList()"><i class="fa-solid fa-rotate"></i> Reload</button>
                    </div>
                    <div id="hubHistoryListContainer"></div>
                </div>

                <!-- SUB-TAB 4: INCOME HISTORY (DEDICATED MINIMAL TABLE) -->
                <div id="hub-tab-inc-history" style="display: none;">
                    <div class="hub-top-ctrl">
                        <div style="font-size: 13.5px; font-weight: 800; text-transform: uppercase;">Income History Archive</div>
                        <button class="hub-icon-btn" onclick="window.renderIncomeHistoryList()"><i class="fa-solid fa-rotate"></i> Reload</button>
                    </div>
                    <div class="hub-hist-table-wrap">
                        <table class="hub-hist-table">
                            <thead>
                                <tr>
                                    <th>Period</th>
                                    <th class="t-right">Opening</th>
                                    <th class="t-right">Pelam (+)</th>
                                    <th class="t-right">Dilam (-)</th>
                                    <th class="t-right">Actual</th>
                                    <th class="t-right">Net Income</th>
                                    <th>Updated</th>
                                    <th style="text-align: center;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="hubIncomeHistoryTableBody">
                                <tr><td colspan="8" style="text-align:center; padding: 15px;">Loading income records...</td></tr>
                            </tbody>
                        </table>
                    </div>
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

    // বর্তমান হিসাবের গ্লোবাল ক্যাশ
    let latestCalculatedIncome = {
        opening: 0,
        pelam: 0,
        dilam: 0,
        expected: 0,
        actual: 0,
        netIncome: 0,
        fromDate: '',
        toDate: ''
    };

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

    // ৪. সাব-ট্যাব সুইচিং
    window.switchAssetHubSubTab = function (tabType) {
        if (typeof window.switchMainTab === 'function') {
            window.switchMainTab('asset-hub');
        }
        document.querySelectorAll('#menu-asset-hub-parent .submenu-item').forEach(i => i.classList.remove('active'));

        const entrySec = document.getElementById('hub-tab-entry');
        const incSec = document.getElementById('hub-tab-income');
        const histSec = document.getElementById('hub-tab-history');
        const incHistSec = document.getElementById('hub-tab-inc-history');

        if (entrySec) entrySec.style.display = 'none';
        if (incSec) incSec.style.display = 'none';
        if (histSec) histSec.style.display = 'none';
        if (incHistSec) incHistSec.style.display = 'none';

        if (tabType === 'entry') {
            if (entrySec) entrySec.style.display = 'block';
            document.getElementById('sub-asset-entry')?.classList.add('active');
            window.loadAssetHubInputs();
        } else if (tabType === 'income') {
            if (incSec) incSec.style.display = 'block';
            document.getElementById('sub-asset-income')?.classList.add('active');
            window.loadAssetHubIncome();
        } else if (tabType === 'history') {
            if (histSec) histSec.style.display = 'block';
            document.getElementById('sub-asset-history')?.classList.add('active');
            window.renderAssetHistoryList();
        } else if (tabType === 'inc-history') {
            if (incHistSec) incHistSec.style.display = 'block';
            document.getElementById('sub-asset-inc-history')?.classList.add('active');
            window.renderIncomeHistoryList();
        }
    };

    // ৫. তারিখ পরিবর্তনে ব্যালেন্স লোড (নতুন দিন = ফ্রেশ ০.০০)
    window.onAssetHubDateChange = async function () {
        const d = document.getElementById('hubSelectedDate').value;
        if (!d) return;

        if (typeof window.showLoader === 'function') window.showLoader("Checking Firebase for " + d + "...");

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
                if (typeof window.showToast === 'function') window.showToast(`Loaded saved records for ${d}`, "info");
            } else {
                currentBalances = {};
                currentCash = { others: 0 };
                currentCards = {};
            }

            window.renderWizardUI();
        } catch (e) {
            console.error("Fetch Error:", e);
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    window.filterCardOperatorView = function (opName) {
        activeCardFilter = opName;
        document.querySelectorAll('.op-pill-btn').forEach(btn => {
            if (btn.getAttribute('data-op') === opName) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        document.querySelectorAll('.op-segment-box').forEach(box => {
            const boxOp = box.getAttribute('data-op');
            if (opName === 'ALL' || boxOp === opName) box.style.display = 'block';
            else box.style.display = 'none';
        });
    };

    window.renderWizardUI = function () {
        const container = document.getElementById('hubWizardContainer');
        if (!container) return;
        container.innerHTML = '';

        const { cats, accs } = getMasterAccountsAndCategories();
        const cardConfig = getMasterCardConfig();

        let stepIndex = 1;

        // অ্যাকাউন্টস
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
                            <input type="number" step="any" class="hub-inp-text" value="${bal === 0 ? '' : bal}" placeholder="0.00"
                                oninput="window.updateHubBalance('${acc.id}', this.value, 'cat-sub-${cat.id}')">
                        </div>
                    </div>
                `;
            });

            const currentStepId = `hub-sec-${stepIndex}`;
            const nextStepId = `hub-sec-${stepIndex + 1}`;
            const isFirst = (stepIndex === 1);

            container.insertAdjacentHTML('beforeend', `
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
                            <button class="hub-btn-next" onclick="window.wizardGoToNext('${nextStepId}')">Next Step &rarr;</button>
                        </div>
                    </div>
                </div>
            `);
            stepIndex++;
        });

        // ক্যাশ
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
                        <input type="number" class="hub-qty-inp" placeholder="0" value="${q === 0 ? '' : q}" 
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
                    <input type="number" step="any" class="hub-inp-text" value="${othersAmt === 0 ? '' : othersAmt}" placeholder="0.00"
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
                        <button class="hub-btn-next" onclick="window.wizardGoToNext('${cardsSecId}')">Next: Cards Stock &rarr;</button>
                    </div>
                </div>
            </div>
        `);
        stepIndex++;

        // কার্ডস
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
                            <input type="number" class="hub-qty-inp" placeholder="0" value="${q === 0 ? '' : q}" 
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
                </div>
            </div>
        `);

        window.recalculateGrandLiveTotal();
    };

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

    // ৬. লাইভ টোটাল হিসাব (কার্ড ডাবল কাউন্টিং ছাড়া)
    window.recalculateGrandLiveTotal = function () {
        let total = 0;
        const { accs } = getMasterAccountsAndCategories();
        accs.forEach(a => {
            if (a.id !== 'acc_9' && a.catId !== 'cat_4') {
                total += (parseFloat(currentBalances[a.id]) || 0);
            }
        });

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

    // ৭. ব্যালেন্স ফায়ারবেসে সেভ (Single Source of Truth)
    window.saveAssetHubToFirebase = async function () {
        const d = document.getElementById('hubSelectedDate').value || new Date().toISOString().split('T')[0];
        if (typeof window.showLoader === 'function') window.showLoader("Saving Daily Asset to Firebase...");

        try {
            let cardsTotal = 0;
            const cardCfg = getMasterCardConfig();
            ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                const rawCards = cardCfg[op] || [];
                const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                const opQtys = currentCards[op] || {};
                opCards.forEach(c => cardsTotal += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
            });

            let accountsTotal = 0;
            const { accs } = getMasterAccountsAndCategories();
            accs.forEach(a => {
                if (a.id !== 'acc_9' && a.catId !== 'cat_4') {
                    accountsTotal += (parseFloat(currentBalances[a.id]) || 0);
                }
            });

            let cashTotal = 0;
            [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cashTotal += ((parseInt(currentCash[n]) || 0) * n));
            cashTotal += (parseFloat(currentCash.others) || 0);

            const grandTotal = accountsTotal + cashTotal + cardsTotal;
            currentBalances['acc_9'] = cardsTotal;

            const snapshotObj = {
                date: d,
                timestamp: Date.now(),
                accountsTotal: accountsTotal,
                cashTotal: cashTotal,
                cardsTotal: cardsTotal,
                grandTotal: grandTotal,
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

            if (typeof window.showToast === 'function') {
                window.showToast("Saved", "success");
            }
        } catch (e) {
            console.error("Save Error:", e);
            if (typeof window.showToast === 'function') window.showToast("Error saving data", "error");
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ৮. ব্যালেন্স হিস্ট্রি রেন্ডারার (আসল টোটালসহ)
    window.renderAssetHistoryList = async function () {
        const container = document.getElementById('hubHistoryListContainer');
        if (!container) return;
        container.innerHTML = '<p style="font-size:12px; padding:15px; color:#64748b;">Loading history records...</p>';

        try {
            if (window.getDatabase && window.ref && window.get) {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_balance_snapshots`));
                if (snap.exists()) {
                    allHistoryRecords = Object.values(snap.val()).sort((a,b) => b.date.localeCompare(a.date));
                } else {
                    allHistoryRecords = [];
                }
            }

            if (allHistoryRecords.length === 0) {
                container.innerHTML = '<p style="font-size:12px; padding:15px; color:#64748b;">No saved records found.</p>';
                return;
            }

            container.innerHTML = '';
            const cardConfig = getMasterCardConfig();

            allHistoryRecords.forEach(rec => {
                let aTotal = rec.accountsTotal;
                let cTotal = rec.cashTotal;
                let cardTotal = rec.cardsTotal;
                let grand = rec.grandTotal;

                if (grand === undefined) {
                    aTotal = 0; cTotal = 0; cardTotal = 0;
                    Object.entries(rec.balances || {}).forEach(([k, v]) => {
                        if (k !== 'acc_9') aTotal += (parseFloat(v) || 0);
                    });
                    [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTotal += ((parseInt(rec.cash?.[n]) || 0) * n));
                    cTotal += (parseFloat(rec.cash?.others) || 0);
                    ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                        const rawCards = cardConfig[op] || [];
                        const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                        const opQtys = rec.cards?.[op] || {};
                        opCards.forEach(c => cardTotal += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
                    });
                    grand = aTotal + cTotal + cardTotal;
                }

                const timeStr = rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                container.insertAdjacentHTML('beforeend', `
                    <div class="hub-history-card">
                        <div>
                            <div class="hub-hist-date">${rec.date} <span>(${timeStr})</span></div>
                            <div class="hub-hist-stats" style="margin-top: 5px;">
                                <div>Accounts: ৳ ${fmt(aTotal)}</div>
                                <div>Cash: ৳ ${fmt(cTotal)}</div>
                                <div>Cards: ৳ ${fmt(cardTotal)}</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="hub-hist-total">Total: ৳ ${fmt(grand)}</div>
                            <div style="margin-top: 6px;">
                                <button class="hub-icon-btn hub-btn-edit" onclick="window.loadHistoricalRecordToForm('${rec.date}')">Edit</button>
                                <button class="hub-icon-btn" onclick="window.viewAuditFromHistory('${rec.date}')">Report</button>
                            </div>
                        </div>
                    </div>
                `);
            });
        } catch (e) {
            container.innerHTML = '<p style="color:red; font-size:12px;">Failed to load history.</p>';
        }
    };

    window.loadHistoricalRecordToForm = function (dateStr) {
        document.getElementById('hubSelectedDate').value = dateStr;
        window.switchAssetHubSubTab('entry');
        window.onAssetHubDateChange();
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // ৯. ডেইলি ইনকাম ইঞ্জিন (অটো-সিঙ্ক ও লাইভ ক্যালকুলেটর)
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

        const badge = document.getElementById('hubIncomePeriodBadge');
        if (badge) badge.innerText = (fromDate === toDate) ? fromDate : `${fromDate} to ${toDate}`;

        const txs = Array.isArray(window.customerTransactions) ? window.customerTransactions : [];
        let totalPelam = 0, totalDilam = 0;
        txs.forEach(t => {
            const tDate = String(t.date || '');
            if (tDate >= fromDate && tDate <= toDate) {
                totalPelam += parseFloat(t.credit) || 0;
                totalDilam += parseFloat(t.debit) || 0;
            }
        });

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
                if (priorSnap.grandTotal !== undefined) {
                    openingCapital = priorSnap.grandTotal;
                } else {
                    let aTot = 0, cTot = 0, cardTot = 0;
                    const cardCfg = getMasterCardConfig();
                    Object.entries(priorSnap.balances || {}).forEach(([k, v]) => {
                        if (k !== 'acc_9') aTot += (parseFloat(v) || 0);
                    });
                    [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTot += ((parseInt(priorSnap.cash?.[n]) || 0) * n));
                    cTot += (parseFloat(priorSnap.cash?.others) || 0);
                    ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                        const rawCards = cardCfg[op] || [];
                        const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                        const opQtys = priorSnap.cards?.[op] || {};
                        opCards.forEach(c => cardTot += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
                    });
                    openingCapital = aTot + cTot + cardTot;
                }
            }
        } catch (e) {
            console.warn("Opening fetch error:", e);
        }

        // ৩. একচুয়াল সম্পদ (সরাসরি ফায়ারবেস হিস্ট্রি থেকে ডাটা নেওয়া)
        let actualAssets = 0;
        let targetSnap = allHistoryRecords.find(r => r.date === toDate);

        if (!targetSnap && window.getDatabase && window.ref && window.get) {
            try {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_balance_snapshots/${toDate}`));
                if (snap.exists()) targetSnap = snap.val();
            } catch(e) {}
        }

        if (targetSnap) {
            if (targetSnap.grandTotal !== undefined) {
                actualAssets = targetSnap.grandTotal;
            } else {
                let aTot = 0, cTot = 0, cardTot = 0;
                const cardCfg = getMasterCardConfig();
                Object.entries(targetSnap.balances || {}).forEach(([k, v]) => {
                    if (k !== 'acc_9') aTot += (parseFloat(v) || 0);
                });
                [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTot += ((parseInt(targetSnap.cash?.[n]) || 0) * n));
                cTot += (parseFloat(targetSnap.cash?.others) || 0);
                ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                    const rawCards = cardCfg[op] || [];
                    const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                    const opQtys = targetSnap.cards?.[op] || {};
                    opCards.forEach(c => cardTot += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
                });
                actualAssets = aTot + cTot + cardTot;
            }
        } else {
            let aTot = 0, cTot = 0, cardTot = 0;
            const liveBals = (window.balanceStore && Object.keys(window.balanceStore).length > 0) ? window.balanceStore : currentBalances;
            const { accs } = getMasterAccountsAndCategories();
            accs.forEach(a => {
                if (a.id !== 'acc_9' && a.catId !== 'cat_4') {
                    aTot += (parseFloat(liveBals[a.id]) || 0);
                }
            });

            const liveCash = (window.cashQuantities && Object.keys(window.cashQuantities).length > 0) ? window.cashQuantities : currentCash;
            [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTot += ((parseInt(liveCash[n]) || 0) * n));
            cTot += (parseFloat(window.cashOthersAmount || currentCash.others) || 0);

            if (liveBals['acc_9']) {
                cardTot = parseFloat(liveBals['acc_9']) || 0;
            }
            actualAssets = aTot + cTot + cardTot;
        }
        const expectedCapital = openingCapital + totalPelam - totalDilam;
        const netIncome = actualAssets - expectedCapital;

        // গ্লোবাল ক্যাশ সংরক্ষণ
        latestCalculatedIncome = {
            fromDate,
            toDate,
            opening: openingCapital,
            pelam: totalPelam,
            dilam: totalDilam,
            expected: expectedCapital,
            actual: actualAssets,
            netIncome: netIncome
        };

        document.getElementById('hubIncOpening').innerText = `৳ ${fmt(openingCapital)}`;
        document.getElementById('hubIncPelam').innerText = `+ ৳ ${fmt(totalPelam)}`;
        document.getElementById('hubIncDilam').innerText = `- ৳ ${fmt(totalDilam)}`;
        document.getElementById('hubIncExpected').innerText = `৳ ${fmt(expectedCapital)}`;
        document.getElementById('hubIncActual').innerText = `৳ ${fmt(actualAssets)}`;

        const elNetIncome = document.getElementById('hubIncNetIncome');
        if (elNetIncome) {
            elNetIncome.innerText = `${netIncome >= 0 ? '' : '- '}৳ ${fmt(Math.abs(netIncome))}`;
            elNetIncome.style.color = netIncome >= 0 ? '#15803d' : '#dc2626';
        }
    };

    // ১০. ফায়ারবেস ক্লাউডে ইনকাম সেভ (ডুপ্লিকেট ছাড়া এক তারিখের একটাই পার্মানেন্ট রেকর্ড)
    window.saveDailyIncomeToFirebase = async function () {
        const fromDate = latestCalculatedIncome.fromDate;
        const toDate = latestCalculatedIncome.toDate;
        if (!fromDate || !toDate) return;

        const periodKey = (fromDate === toDate) ? fromDate : `${fromDate}_to_${toDate}`;
        const periodLabel = (fromDate === toDate) ? fromDate : `${fromDate} to ${toDate}`;
        const now = new Date();
        const updatedTimeStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (typeof window.showLoader === 'function') window.showLoader("Saving Income to Cloud...");

        try {
            const incomeRecord = {
                periodKey: periodKey,
                periodLabel: periodLabel,
                fromDate: fromDate,
                toDate: toDate,
                opening: latestCalculatedIncome.opening,
                pelam: latestCalculatedIncome.pelam,
                dilam: latestCalculatedIncome.dilam,
                expected: latestCalculatedIncome.expected,
                actual: latestCalculatedIncome.actual,
                netIncome: latestCalculatedIncome.netIncome,
                updatedAt: updatedTimeStr,
                timestamp: Date.now()
            };

            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`erp/daily_income_snapshots/${periodKey}`, incomeRecord);
            }

            const statusEl = document.getElementById('hubIncomeLastUpdated');
            if (statusEl) statusEl.innerText = `Last Updated: ${updatedTimeStr}`;

            if (typeof window.showToast === 'function') {
                window.showToast("Saved", "success");
            }
        } catch (e) {
            console.error("Save Income Error:", e);
            if (typeof window.showToast === 'function') window.showToast("Error saving income", "error");
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ১১. ইনকাম হিস্ট্রি টেবিল রেন্ডারার (ক্লাউড থেকে ফেচ)
    window.renderIncomeHistoryList = async function () {
        const tbody = document.getElementById('hubIncomeHistoryTableBody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:15px; color:#64748b;">Loading cloud records...</td></tr>';

        try {
            let records = [];
            if (window.getDatabase && window.ref && window.get) {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_income_snapshots`));
                if (snap.exists()) {
                    records = Object.values(snap.val()).sort((a,b) => b.timestamp - a.timestamp);
                }
            }

            if (records.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px; color:#64748b;">No saved income records found.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            records.forEach(r => {
                const isNetPositive = (r.netIncome >= 0);
                const trHTML = `
                    <tr>
                        <td>
                            ${r.periodLabel}
                            <span class="t-subtext">Auto-Synced</span>
                        </td>
                        <td class="t-right">৳ ${fmt(r.opening)}</td>
                        <td class="t-right t-green">+ ৳ ${fmt(r.pelam)}</td>
                        <td class="t-right t-red">- ৳ ${fmt(r.dilam)}</td>
                        <td class="t-right">৳ ${fmt(r.actual)}</td>
                        <td class="t-right ${isNetPositive ? 't-net-green' : 't-red'}">
                            ${isNetPositive ? '' : '- '}৳ ${fmt(Math.abs(r.netIncome))}
                        </td>
                        <td>${r.updatedAt || '---'}</td>
                        <td style="text-align: center;">
                            <button class="btn-table-report" onclick="window.viewIncomeReportModal('${r.periodKey}')">Report</button>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', trHTML);
            });
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:15px; color:red;">Error: ${e.message}</td></tr>`;
        }
    };

    // ১২. রিপোর্ট সেন্টারের জন্য রেডি স্টেটমেন্ট প্রিভিউ
    window.viewIncomeReportModal = async function (periodKey) {
        try {
            const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_income_snapshots/${periodKey}`));
            if (!snap.exists()) return;
            const r = snap.val();

            const win = window.open('', '_blank');
            win.document.write(`
                <html>
                <head>
                    <title>Income Statement - ${r.periodLabel}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla&display=swap" rel="stylesheet">
                    <style>
                        body { font-family: 'Tiro Bangla', serif; padding: 40px; color: #000; }
                        .box { max-width: 650px; margin: 0 auto; border: 1.5px solid #000; padding: 25px; }
                        h2 { text-align: center; margin-bottom: 5px; text-transform: uppercase; }
                        p { text-align: center; font-size: 13px; margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        td { padding: 10px 14px; border-bottom: 1px solid #ddd; font-size: 14px; }
                        .lbl { font-weight: bold; }
                        .val { text-align: right; font-weight: bold; }
                        .total-row { background: #f0fdf4; border-top: 2px solid #000; font-size: 16px; }
                    </style>
                </head>
                <body>
                    <div class="box">
                        <h2>Mousumi Computer</h2>
                        <p>Daily Income Statement | Period: ${r.periodLabel} | Last Synced: ${r.updatedAt}</p>
                        <table>
                            <tr><td class="lbl">Opening Capital</td><td class="val">৳ ${fmt(r.opening)}</td></tr>
                            <tr><td class="lbl">(+) Total Pelam (Collection)</td><td class="val" style="color: green;">+ ৳ ${fmt(r.pelam)}</td></tr>
                            <tr><td class="lbl">(-) Total Dilam (Outflow)</td><td class="val" style="color: red;">- ৳ ${fmt(r.dilam)}</td></tr>
                            <tr style="background: #f8fafc;"><td class="lbl">Expected Capital</td><td class="val">৳ ${fmt(r.expected)}</td></tr>
                            <tr><td class="lbl">Actual Assets</td><td class="val">৳ ${fmt(r.actual)}</td></tr>
                            <tr class="total-row"><td class="lbl">Net Income / Profit</td><td class="val">৳ ${fmt(r.netIncome)}</td></tr>
                        </table>
                        <div style="margin-top: 30px; text-align: right; font-size: 12px;">Computer Generated Statement</div>
                    </div>
                    <script>window.print();<\/script>
                </body>
                </html>
            `);
            win.document.close();
        } catch (e) {
            alert("Error loading report: " + e.message);
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
