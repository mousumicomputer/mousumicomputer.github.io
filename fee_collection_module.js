/**
 * Mousumi Computer ERP - Education & Digital Services Module (Enterprise Edition)
 * Super-Smart Multi-Tag Filtering & Multi-Select Bulk Terminal Edition
 */

(function () {
    let studentDueList = [];
    let firebaseCore = null;
    let feeTransactionsList = [];
    let voidLogsList = [];
    let selectedStudentRawDue = 0;
    let selectedStudentData = null;

    // মাল্টিপল সিলেকশন সেট (একের অধিক আইডি ধরে রাখার জন্য)
    let selectedPendingTxIds = new Set();

    // ফিল্টার স্টেট
    let pendingFilters = {
        category: null, // 'Army', 'Civil'
        months: null,   // 'urgent', '1', '2', '3+'
        class: null     // 'Nursery', 'KG', etc.
    };

    // পেজিনেশন
    let currentPage = 1;
    let rowsPerPage = 25;
    let currentSearchQuery = "";

    // মিনিমাল আইকন SVG
    const ICONS = {
        pay: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`,
        trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`,
        print: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>`
    };

    // ১. মডিউল সিএসএস
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        #edu-module-container, #edu-module-container * {
            box-sizing: border-box !important;
            font-family: 'Plus Jakarta Sans', 'Kalpurush', sans-serif !important;
        }

        #menu-edu-parent .submenu-list { display: none !important; }
        #menu-edu-parent.open > .submenu-list,
        #menu-edu-parent .submenu-list.show { display: flex !important; flex-direction: column; }
        #menu-edu-parent .chevron-icon { transition: transform 0.2s ease; }
        #menu-edu-parent.open .chevron-icon { transform: rotate(180deg); }

        .edu-view-card {
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            margin-bottom: 25px;
        }

        .edu-card-header-clean {
            background: #ffffff;
            padding: 14px 20px;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }

        .edu-card-header-clean h3 {
            font-size: 1.05rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .edu-pill-badge {
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 0.76rem;
            font-weight: 700;
        }
        .badge-pending { background: #fef3c7; color: #b45309; }
        .badge-paid { background: #dcfce7; color: #15803d; }
        .badge-void { background: #fee2e2; color: #b91c1c; }

        /* FORM */
        .edu-form-container { padding: 20px; max-width: 900px; margin: 0 auto; }
        .edu-form-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 15px; }
        .edu-field-box label { display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 5px; }
        .edu-input {
            width: 100%;
            height: 42px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0 12px;
            font-size: 0.9rem;
            font-weight: 600;
            color: #1e293b;
            outline: none;
            background: #ffffff;
        }
        .edu-input:focus { border-color: #0f172a; }
        .edu-input[readonly] { background: #f8fafc; color: #475569; }

        .edu-adjustment-box {
            background: #eff6ff;
            border: 1px dashed #3b82f6;
            border-radius: 6px;
            padding: 10px 15px;
            margin-bottom: 15px;
            display: none;
            align-items: center;
            justify-content: space-between;
            color: #1e40af;
            font-size: 0.85rem;
            font-weight: 600;
        }

        /* SMART MULTI-TAG FILTER BAR */
        .filter-tag-wrapper {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 16px;
            margin: 12px 20px 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
        }

        .filter-tag-box {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            position: relative;
        }

        .filter-label {
            font-size: 0.78rem;
            font-weight: 800;
            text-transform: uppercase;
            color: #475569;
        }

        .tag-chip-list {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }

        .tag-chip {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 3px 8px;
            font-size: 0.78rem;
            font-weight: 700;
            color: #0f172a;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }

        .tag-chip.tag-urgent {
            background: #fee2e2;
            border-color: #fca5a5;
            color: #dc2626;
        }

        .tag-close-x {
            cursor: pointer;
            font-size: 0.82rem;
            color: #64748b;
            line-height: 1;
        }
        .tag-close-x:hover { color: #dc2626; }

        .no-filter-text {
            font-size: 0.82rem;
            color: #94a3b8;
            font-style: italic;
        }

        .filter-dropdown-wrap {
            position: relative;
            display: inline-block;
        }

        .btn-filter-add {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 5px 12px;
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
            color: #2563eb;
            transition: all 0.15s;
        }
        .btn-filter-add:hover { background: #eff6ff; border-color: #2563eb; }

        .filter-menu-popup {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: 6px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            padding: 12px 14px;
            z-index: 9999;
            min-width: 240px;
            display: none;
        }

        .filter-section-title {
            font-size: 0.72rem;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
            margin: 6px 0 4px 0;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 2px;
        }

        .filter-options-grid {
            display: flex;
            gap: 4px;
            flex-wrap: wrap;
            margin-bottom: 6px;
        }

        .filter-opt-btn {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
            padding: 3px 8px;
            font-size: 0.76rem;
            font-weight: 700;
            color: #334155;
            cursor: pointer;
            transition: all 0.1s;
        }
        .filter-opt-btn:hover { background: #0f172a; color: #ffffff; border-color: #0f172a; }
        .filter-opt-btn.opt-active { background: #2563eb; color: #ffffff; border-color: #2563eb; }

        .btn-filter-clear {
            background: transparent;
            border: none;
            color: #dc2626;
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
            text-decoration: underline;
        }

        /* MINIMAL ACTION TOOLBAR */
        .pending-action-bar-strip {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 8px 16px;
            margin: 8px 20px 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        .selection-status-badge { font-size: 0.85rem; color: #64748b; }
        .pending-action-btns { display: flex; align-items: center; gap: 8px; }

        .btn-top-act {
            border: 1px solid #059669;
            padding: 6px 16px;
            border-radius: 4px;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #10b981;
            color: #ffffff;
            transition: opacity 0.15s;
        }
        .btn-top-act:hover:not(:disabled) { background: #059669; }

        .btn-top-separator { width: 1px; height: 20px; background: #cbd5e1; margin: 0 4px; }

        .btn-top-icon {
            width: 32px;
            height: 32px;
            border-radius: 4px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            color: #334155;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: background 0.15s;
        }
        .btn-top-void:hover:not(:disabled) { background: #fee2e2; color: #dc2626; border-color: #f87171; }
        .btn-top-print:hover:not(:disabled) { background: #0f172a; color: #ffffff; border-color: #0f172a; }

        .btn-top-act:disabled, .btn-top-icon:disabled {
            opacity: 0.3;
            cursor: not-allowed;
        }

        /* CHECKBOX STYLING */
        .edu-checkbox {
            width: 17px;
            height: 17px;
            cursor: pointer;
            accent-color: #10b981;
            vertical-align: middle;
            margin: 0;
        }

        /* CLEAN FOCUSED TABLE WITH ROUNDED ROW CARD BORDERS */
        .edu-table-responsive { 
            width: 100%; 
            padding: 10px 20px 18px 20px; 
            overflow-x: auto;
        }
        
        .edu-clean-table { 
            width: 100%; 
            border-collapse: separate; 
            border-spacing: 0 5px; 
        }

        .edu-clean-table th {
            padding: 8px 12px;
            font-size: 0.74rem;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
            background: transparent;
            white-space: nowrap;
        }

        .edu-clean-table td {
            background: #ffffff;
            padding: 10px 12px;
            font-size: 0.84rem;
            color: #1e293b;
            vertical-align: middle;
            white-space: nowrap;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
            transition: all 0.15s ease;
        }

        .edu-clean-table td:first-child {
            border-left: 1px solid #e2e8f0;
            border-top-left-radius: 6px;
            border-bottom-left-radius: 6px;
        }

        .edu-clean-table td:last-child {
            border-right: 1px solid #e2e8f0;
            border-top-right-radius: 6px;
            border-bottom-right-radius: 6px;
        }

        .edu-clean-table tbody tr.row-selectable { cursor: pointer; }
        .edu-clean-table tbody tr.row-selectable:hover td { 
            background: #f8fafc; 
            border-color: #cbd5e1;
        }

        .edu-clean-table tbody tr.row-selected td {
            background: #f0fdf4 !important;
            border-top: 1px solid #10b981 !important;
            border-bottom: 1px solid #10b981 !important;
        }
        .edu-clean-table tbody tr.row-selected td:first-child {
            border-left: 1px solid #10b981 !important;
        }
        .edu-clean-table tbody tr.row-selected td:last-child {
            border-right: 1px solid #10b981 !important;
        }

        .btn-act {
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .btn-act-undo { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
        .btn-act-undo:hover { background: #e2e8f0; }
        .btn-act-print { background: #0f172a; color: #ffffff; }
        .btn-act-print:hover { background: #334155; }
        .btn-act-pay { background: #10b981; color: #ffffff; }
        .btn-act-void { background: #fee2e2; color: #dc2626; }

        .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px; padding: 20px; }
        .report-card-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; }
        .report-card-item h4 { font-size: 0.95rem; color: #0f172a; margin-bottom: 6px; }
        .report-card-item p { font-size: 0.78rem; color: #64748b; margin-bottom: 14px; }

        .edu-modal-bg {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.5); display: none; align-items: center; justify-content: center; z-index: 999999;
        }
        .edu-modal-box { background: #ffffff; border-radius: 8px; padding: 22px; max-width: 400px; width: 90%; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ২. Firebase কানেক্টর
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
                }, "feeModuleApp_" + Date.now());
            }

            const db = fbDb.getDatabase(app);
            firebaseCore = { db, ref: fbDb.ref, set: fbDb.set, onValue: fbDb.onValue, get: fbDb.get };
            return firebaseCore;
        } catch (err) {
            console.error("Firebase connection error:", err);
            return null;
        }
    }

    // ৩. মেনু টগল
    window.toggleEduMenu = function () {
        const item = document.getElementById('menu-edu-parent');
        if (item) {
            item.classList.toggle('open');
            const sub = item.querySelector('.submenu-list');
            if (sub) sub.classList.toggle('show');
        }
    };

    // ৪. সাইডবার ইনজেকশন
    function injectMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-edu-parent')) return;

        const html = `
            <li class="menu-item" id="menu-edu-parent">
                <a onclick="toggleEduMenu()" style="cursor: pointer;">
                    <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>Education & Digital</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon" style="font-size: 0.7rem;"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-form')"><i class="fa-solid fa-angle-right"></i> <span>Fee Collection</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-pending-clearance')"><i class="fa-solid fa-angle-right"></i> <span>Pending Clearance</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-paid-settlement')"><i class="fa-solid fa-angle-right"></i> <span>Paid Settlement</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-due-data')"><i class="fa-solid fa-angle-right"></i> <span>Due Database</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-void-logs')"><i class="fa-solid fa-angle-right"></i> <span>Void & Trash Log</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-reports-hub')"><i class="fa-solid fa-angle-right"></i> <span>Reports & Export</span></a></li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    // ৫. ভিউ প্যানেল ইনজেকশন
    function injectPanels() {
        const wrapper = document.querySelector('.main-wrapper');
        if (!wrapper) return;

        const panelsHTML = `
            <div id="edu-module-container">
                
                <!-- PANEL 1: FEE COLLECTION -->
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-view-card edu-form-container">
                        <div class="edu-card-header-clean" style="padding:0 0 15px 0; margin-bottom:18px;">
                            <h3>Fee Collection Terminal</h3>
                            <span class="edu-pill-badge badge-pending">Instant Receipt</span>
                        </div>

                        <div class="edu-adjustment-box" id="adjustmentAlertBox">
                            <div><span id="adjustmentDetailsText">Previous payment found and adjusted.</span></div>
                            <span class="edu-pill-badge badge-paid" id="adjustmentAmountTag">Adjusted: ৳ 0</span>
                        </div>

                        <form id="feeFormOriginal">
                            <div class="edu-form-grid-3">
                                <div class="edu-field-box">
                                    <label>Date</label>
                                    <input type="date" id="origDate" class="edu-input" required>
                                </div>
                                <div class="edu-field-box">
                                    <label>Student ID / Mobile</label>
                                    <input type="text" id="origId" class="edu-input" placeholder="ID or Mobile..." required autocomplete="off">
                                </div>
                                <div class="edu-field-box">
                                    <label>Student Name</label>
                                    <input type="text" id="origName" class="edu-input" placeholder="Student Name" readonly>
                                </div>
                            </div>
                            <div class="edu-form-grid-3">
                                <div class="edu-field-box">
                                    <label>Net Due (৳)</label>
                                    <input type="text" id="origDue" class="edu-input" value="0.00" readonly>
                                </div>
                                <div class="edu-field-box">
                                    <label>Service Charge (৳)</label>
                                    <input type="number" step="any" id="origTxn" class="edu-input" value="6.00">
                                    <div style="font-size:0.75rem; color:#2563eb; font-weight:700; margin-top:3px;">Total Charge: ৳ <span id="origCharge">6.00</span></div>
                                </div>
                                <div class="edu-field-box">
                                    <label>Total Received (৳)</label>
                                    <input type="text" id="origRec" class="edu-input" value="0.00" readonly style="color:#15803d; font-size:1.05rem;">
                                </div>
                            </div>
                            <div class="edu-form-grid-3">
                                <div class="edu-field-box">
                                    <label>Discount (৳)</label>
                                    <input type="number" step="any" id="origDisc" class="edu-input" value="0.00">
                                </div>
                            </div>
                            <div style="display:flex; justify-content:flex-end; margin-top:10px;">
                                <button type="submit" class="btn-act btn-act-print" style="padding:10px 24px; font-size:0.9rem;">Submit & Open Receipt</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- PANEL 2: PENDING CLEARANCE (মাল্টি-সিলেক্ট এবং ক্লিন ভিউ) -->
                <div class="view-panel" id="edu-pending-clearance-view">
                    <div class="edu-view-card">
                        <div class="edu-card-header-clean">
                            <h3>Pending Clearance</h3>
                            <div>
                                <span class="edu-pill-badge badge-pending" id="pendingCountBadge">0 Pending</span>
                                <span style="font-size:0.88rem; font-weight:700; margin-left:12px;">Tap Total: ৳ <span id="pendingTotalSum" style="color:#10b981;">0.00</span></span>
                            </div>
                        </div>

                        <!-- ফিল্টার বার -->
                        <div class="filter-tag-wrapper">
                            <div class="filter-tag-box">
                                <span class="filter-label">Tags:</span>
                                <div id="filterTagContainer" class="tag-chip-list">
                                    <span class="no-filter-text">All</span>
                                </div>
                                <div class="filter-dropdown-wrap">
                                    <button type="button" class="btn-filter-add" id="btnFilterAddTrigger">+ Filter ▾</button>
                                    <div id="filterMenuPopup" class="filter-menu-popup">
                                        <div class="filter-section-title">Category</div>
                                        <div class="filter-options-grid">
                                            <button type="button" class="filter-opt-btn" onclick="applyPendingTag('category', 'Army')">Army</button>
                                            <button type="button" class="filter-opt-btn" onclick="applyPendingTag('category', 'Civil')">Civil</button>
                                        </div>

                                        <div class="filter-section-title">Months Due</div>
                                        <div class="filter-options-grid">
                                            <button type="button" class="filter-opt-btn" style="color:#dc2626; font-weight:800;" onclick="applyPendingTag('months', 'urgent')">2+ Mos ⚠️</button>
                                            <button type="button" class="filter-opt-btn" onclick="applyPendingTag('months', '1')">1 Mo</button>
                                            <button type="button" class="filter-opt-btn" onclick="applyPendingTag('months', '2')">2 Mos</button>
                                            <button type="button" class="filter-opt-btn" onclick="applyPendingTag('months', '3+')">3+ Mos</button>
                                        </div>

                                        <div class="filter-section-title">Class</div>
                                        <div class="filter-options-grid" id="filterClassMenuGrid">
                                            <span style="font-size:0.75rem; color:#94a3b8;">Loading...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="btn-filter-clear" onclick="clearAllPendingFilters()">Clear ✕</button>
                        </div>

                        <!-- সিলেকশন অ্যাকশন কন্ট্রোল বার -->
                        <div class="pending-action-bar-strip">
                            <div class="selection-status-badge" id="pendingSelectedLabel">
                                <span>No student selected</span>
                            </div>
                            <div class="pending-action-btns">
                                <button type="button" class="btn-top-act btn-top-pay" id="btnTopPay" onclick="executeBulkPendingAction('pay')" disabled>
                                    ${ICONS.pay} Pay Selected
                                </button>
                                <div class="btn-top-separator"></div>
                                <button type="button" class="btn-top-icon btn-top-void" id="btnTopVoid" onclick="executeBulkPendingAction('void')" title="Void Selected" disabled>
                                    ${ICONS.trash}
                                </button>
                                <button type="button" class="btn-top-icon btn-top-print" id="btnTopPrint" onclick="executeBulkPendingAction('print')" title="Print (Single)" disabled>
                                    ${ICONS.print}
                                </button>
                            </div>
                        </div>

                        <!-- ক্লিন টেবিল (চেকবক্স সহ) -->
                        <div class="edu-table-responsive">
                            <table class="edu-clean-table">
                                <thead>
                                    <tr>
                                        <th style="width:36px; text-align:center;">
                                            <input type="checkbox" id="selectAllPendingCheckbox" class="edu-checkbox" title="Select All">
                                        </th>
                                        <th>REC</th>
                                        <th>DATE & TIME</th>
                                        <th>STD ID</th>
                                        <th>STUDENT NAME</th>
                                        <th>CLASS</th>
                                        <th>TAP PAYABLE</th>
                                        <th>COLLECTED</th>
                                    </tr>
                                </thead>
                                <tbody id="pendingClearanceTableBody">
                                    <tr><td colspan="8" style="text-align:center; padding:25px; color:#94a3b8;">No pending records.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- PANEL 3: PAID SETTLEMENT -->
                <div class="view-panel" id="edu-paid-settlement-view">
                    <div class="edu-view-card">
                        <div class="edu-card-header-clean">
                            <h3>Paid Settlement</h3>
                            <div>
                                <span class="edu-pill-badge badge-paid" id="paidCountBadge">0 Paid</span>
                                <span style="font-size:0.88rem; font-weight:700; margin-left:12px;">Total: ৳ <span id="paidTotalSum">0.00</span></span>
                            </div>
                        </div>
                        <div class="edu-table-responsive">
                            <table class="edu-clean-table">
                                <thead>
                                    <tr>
                                        <th>REC</th>
                                        <th>DATE & TIME</th>
                                        <th>STD ID</th>
                                        <th>STUDENT NAME</th>
                                        <th>GROSS PAID</th>
                                        <th>SETTLED TIME</th>
                                        <th style="text-align:right;">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody id="paidSettlementTableBody">
                                    <tr><td colspan="7" style="text-align:center; padding:25px; color:#94a3b8;">No paid records found.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- PANEL 4: DUE DATABASE -->
                <div class="view-panel" id="edu-due-data-view">
                    <div class="edu-view-card" style="padding:18px;">
                        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:18px; align-items:center;">
                            <input type="file" id="dueFileInput" accept=".xlsx, .xls, .csv" style="display:none;">
                            <button type="button" class="btn-act btn-act-undo" onclick="document.getElementById('dueFileInput').click()">Choose Excel</button>
                            <span id="dueFileNameDisplay" style="font-size:0.82rem; color:#64748b;">No file chosen</span>
                            <button type="button" class="btn-act btn-act-print" id="btnUploadDueData">Upload Master Data</button>
                            <button type="button" class="btn-act btn-act-pay" id="btnDownloadSample">Sample Sheet</button>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
                            <div style="display:flex; align-items:center; gap:6px;">
                                <span style="font-size:0.82rem; font-weight:700; color:#475569;">Show</span>
                                <select id="duePageSizeSelect" class="edu-input" style="height:34px; width:75px; padding:0 6px;">
                                    <option value="25">25</option><option value="50">50</option><option value="100">100</option><option value="-1">All</option>
                                </select>
                            </div>
                            <input type="text" id="dueTableSearch" class="edu-input" placeholder="Search ID, Student, Mobile..." style="height:36px; width:280px;">
                        </div>

                        <div class="edu-table-responsive" style="padding:0;">
                            <table class="edu-clean-table">
                                <thead>
                                    <tr>
                                        <th>SL</th><th>Class</th><th>Section</th><th>STD ID</th><th>Student Name</th><th>Category</th><th>Due Month</th><th>Due Items</th><th>Due Amount (৳)</th><th>Mobile</th><th>Father's Info</th><th>Mother's Info</th>
                                    </tr>
                                </thead>
                                <tbody id="dueDataTableBody">
                                    <tr><td colspan="12" style="text-align:center; padding:25px; color:#94a3b8;">No due records loaded.</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="duePaginationBtns" style="display:flex; justify-content:flex-end; gap:5px; margin-top:12px;"></div>
                    </div>
                </div>

                <!-- PANEL 5: VOID LOG -->
                <div class="view-panel" id="edu-void-logs-view">
                    <div class="edu-view-card">
                        <div class="edu-card-header-clean">
                            <h3>Void & Deleted Records</h3>
                            <span class="edu-pill-badge badge-void" id="voidCountBadge">0 Voided</span>
                        </div>
                        <div class="edu-table-responsive">
                            <table class="edu-clean-table">
                                <thead>
                                    <tr>
                                        <th>REC</th><th>VOID DATE</th><th>STUDENT</th><th>AMOUNT</th><th>REASON</th><th>BY</th><th style="text-align:right;">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody id="voidLogsTableBody">
                                    <tr><td colspan="7" style="text-align:center; padding:25px; color:#94a3b8;">No void logs found.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- PANEL 6: REPORTS HUB -->
                <div class="view-panel" id="edu-reports-hub-view">
                    <div class="edu-view-card">
                        <div class="edu-card-header-clean">
                            <h3>Reports & Export Hub</h3>
                        </div>
                        <div class="report-grid">
                            <div class="report-card-item">
                                <h4>Pending Clearance Report</h4>
                                <p>Export all pending fees collected at shop.</p>
                                <button class="btn-act btn-act-pay" onclick="exportDataToExcel('pending')">Export Excel</button>
                            </div>
                            <div class="report-card-item">
                                <h4>Paid Settlement Report</h4>
                                <p>Export all settled Tap payment records.</p>
                                <button class="btn-act btn-act-pay" onclick="exportDataToExcel('paid')">Export Excel</button>
                            </div>
                            <div class="report-card-item">
                                <h4>Master Due Database</h4>
                                <p>Export master student dues.</p>
                                <button class="btn-act btn-act-pay" onclick="exportDataToExcel('due')">Export Excel</button>
                            </div>
                            <div class="report-card-item">
                                <h4>Void / Trash Log</h4>
                                <p>Export cancelled audit logs.</p>
                                <button class="btn-act btn-act-void" onclick="exportDataToExcel('void')">Export Excel</button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- VOID MODAL -->
            <div class="edu-modal-bg" id="voidReasonModal">
                <div class="edu-modal-box">
                    <h3 style="font-size:1.05rem; font-weight:700; color:#0f172a; margin-bottom:8px;">Reason for Voiding</h3>
                    <input type="hidden" id="voidTargetTxId" value="">
                    <select id="voidReasonPreset" class="edu-input" style="margin-bottom:8px;" onchange="if(this.value!=='Other') document.getElementById('voidCustomReason').value=this.value;">
                        <option value="Student did not pay / Cancelled">Student did not pay / Cancelled</option>
                        <option value="Incorrect Student ID / Amount">Incorrect Student ID / Amount</option>
                        <option value="Paid through another channel">Paid through another channel</option>
                        <option value="Other">Other</option>
                    </select>
                    <input type="text" id="voidCustomReason" class="edu-input" placeholder="Type reason here..." style="margin-bottom:15px;" value="Student did not pay / Cancelled">
                    <div style="display:flex; justify-content:flex-end; gap:8px;">
                        <button class="btn-act btn-act-undo" onclick="document.getElementById('voidReasonModal').style.display='none'">Cancel</button>
                        <button class="btn-act btn-act-void" onclick="confirmVoidTransaction()">Confirm</button>
                    </div>
                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', panelsHTML);
    }

    // ৬. রসিদ ওপেন
    window.openReceiptInNewTab = function (d) {
        const receiptWindow = window.open('', '_blank');
        if (!receiptWindow) {
            alert("Popup blocked! Please allow popups for this site.");
            return;
        }

        const watermarkImgUrl = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgBBifAiiveIb1xVgQZv6AxAD_YCVu7JRmBqQOX2eeSJFxavzFEhsWQlYpN6b_aUIiUVCdNu39EHD2-tG1Li5b2Jx4U1DqTH98zbWgxmegb-xPADeDbJBdCqt-WhP71NUrFTlJLeEpZgVoAxEcUufpJNxMQs8nVE28Jj6Ch0LRjTnDBICBibZxxgwE7nFyB/s1600/Receipt%20%281%29.png";
        const paidStampImgUrl = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkW_Mz8uWQPQY8WqCQEVSh7ff6C8_ZE02lZw3o42e8QtmSIE8Sxgx_ejXTZmN_QNLHg0nfS5hrG4Mu2Y6NGCztsTnRZfvFuZ3bZzLAkMtvHxP6tkMxi9YUWcKG9gKXpJHrmnuWFFDAw0qIcAPb6WvHNVT_eiZkM2xDyI3HvRxrrqrpqyv8Zv2FIICwIQQr/s1600/Receipt.png";

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="bn">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Receipt_${d.receiptNo}_${d.studentName}</title>
                <link rel="preload" as="image" href="${watermarkImgUrl}">
                <link rel="preload" as="image" href="${paidStampImgUrl}">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Lobster&family=Lora:ital,wght@1,400;1,500;1,600&family=Roboto+Mono:wght@400;500&family=Tiro+Bangla:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { background-color: #0f172a; font-family: 'Tiro Bangla', 'Times New Roman', serif; display: flex; flex-direction: column; align-items: center; padding: 20px 0 40px 0; color: #000; min-height: 100vh; }
                    .icon-action-bar { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.12); padding: 8px 16px; border-radius: 50px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
                    .icon-btn { width: 44px; height: 44px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: 0.2s; }
                    .btn-print { background: linear-gradient(135deg, #00d2ff 0%, #0078ff 100%); color: #ffffff; }
                    .btn-download { background: linear-gradient(135deg, #34d399 0%, #059669 100%); color: #ffffff; }
                    .btn-close { background: rgba(255, 255, 255, 0.1); color: #e2e8f0; border: 1px solid rgba(255, 255, 255, 0.15); }
                    .btn-close:hover { background: #ef4444; color: #ffffff; }
                    .receipt-wrapper-card { background: #ffffff; width: 148mm; min-height: 210mm; padding: 12mm 15mm; box-shadow: 0 15px 40px rgba(0,0,0,0.5); border-radius: 2px; position: relative; box-sizing: border-box; color: #000000; overflow: hidden; }
                    .receipt-watermark { position: absolute; top: 48mm; left: 21mm; width: 106mm; opacity: 0.58; pointer-events: none; z-index: 1; text-align: center; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .receipt-watermark img { width: 100%; height: auto; display: block; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .receipt-body { position: relative; z-index: 2; }
                    .rc-bismillah { text-align: center; font-family: 'Caveat', cursive !important; font-size: 13.5pt; font-weight: 600; color: #000; margin-bottom: 2px; line-height: 1.2; }
                    .rc-brand-title { text-align: center; font-family: 'Lobster', cursive !important; font-size: 30pt; color: #000; margin: 0 0 4px 0; line-height: 1.1; }
                    .rc-services-desc { text-align: center; font-family: 'EB Garamond', serif !important; font-size: 10.5pt; line-height: 1.25; color: #000; margin: 0 auto 12px auto; max-width: 115mm; }
                    .rc-main-title { text-align: center; font-family: 'Tiro Bangla', 'Times New Roman', serif !important; font-size: 12.5pt; font-weight: bold; letter-spacing: 1.5px; margin-bottom: 6px; color: #000; text-transform: uppercase; }
                    .rc-sheet-table { width: 100%; border-collapse: collapse; border-top: 1.5px dotted #000; }
                    .rc-sheet-table td { color: #000; vertical-align: middle; font-family: 'Tiro Bangla', 'Times New Roman', serif !important; font-size: 13.5pt; line-height: 1.2; border: none; }
                    .rc-col-b { width: 37%; font-weight: bold; border-right: 1.5px dotted #000 !important; padding: 4px 10px 4px 0 !important; }
                    .rc-col-c { width: 63%; font-weight: normal; padding: 4px 0 4px 14px !important; }
                    .rc-section-end td { border-bottom: 1.5px dotted #000; padding-bottom: 8px !important; }
                    .rc-section-start td { padding-top: 8px !important; }
                    .rc-payment-received-row td { text-align: center !important; font-weight: bold; font-size: 14pt; padding: 7px 0 !important; border-bottom: 1.5px dotted #000 !important; border-right: none !important; }
                    .paid-stamp-wrapper { text-align: center; margin: 14px 0 16px 0; position: relative; z-index: 5; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .paid-stamp-img { width: 78px; height: auto; object-fit: contain; display: inline-block; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .rc-footer-sign { font-family: 'Tiro Bangla', 'Times New Roman', serif !important; font-size: 11pt; margin: 0 0 18px 0; color: #000; }
                    .rc-disclaimer-mono { text-align: center; font-family: 'Roboto Mono', monospace !important; font-size: 9pt; line-height: 1.35; color: #000; margin-bottom: 6px; }
                    .rc-disclaimer-lora { text-align: center; font-family: 'Lora', serif !important; font-size: 9pt; font-style: italic; line-height: 1.3; color: #000; }
                    @media print {
                        @page { size: A5 portrait; margin: 0; }
                        body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .no-print { display: none !important; }
                        .receipt-wrapper-card { width: 100% !important; min-height: 100% !important; box-shadow: none !important; border-radius: 0 !important; padding: 10mm 12mm !important; margin: 0 auto !important; page-break-inside: avoid !important; }
                        .receipt-watermark { display: block !important; opacity: 0.58 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .receipt-watermark img, .paid-stamp-img { display: inline-block !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    }
                </style>
            </head>
            <body>
                <div class="icon-action-bar no-print">
                    <button class="icon-btn btn-print" onclick="window.print()" title="Print"><i class="fa-solid fa-print"></i></button>
                    <button class="icon-btn btn-download" onclick="downloadReceiptPDF()" title="Download PDF"><i class="fa-solid fa-file-arrow-down"></i></button>
                    <button class="icon-btn btn-close" onclick="window.close()" title="Close"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="receipt-wrapper-card" id="printableReceiptCard">
                    <div class="receipt-watermark"><img src="${watermarkImgUrl}" alt="Watermark" loading="eager" /></div>
                    <div class="receipt-body">
                        <div class="rc-bismillah">“In the name of Allah, the Most Gracious, the Most Merciful”</div>
                        <div class="rc-brand-title">Mousumi Computer</div>
                        <div class="rc-services-desc">All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash, <br>Nagad, Rocket, Upay, Flexiload, and Computer Works.</div>
                        <div class="rc-main-title">RECEIPT</div>
                        <table class="rc-sheet-table">
                            <tr><td class="rc-col-b">Receipt No</td><td class="rc-col-c">${d.receiptNo}</td></tr>
                            <tr class="rc-section-end"><td class="rc-col-b">Date</td><td class="rc-col-c">${d.date}</td></tr>
                            <tr class="rc-section-start"><td class="rc-col-b">Student Name</td><td class="rc-col-c">${d.studentName}</td></tr>
                            <tr class="rc-section-end"><td class="rc-col-b">Student ID</td><td class="rc-col-c">${d.studentId}</td></tr>
                            <tr class="rc-section-start"><td class="rc-col-b">Tuition Fee</td><td class="rc-col-c">${d.tuitionFee}</td></tr>
                            <tr><td class="rc-col-b">Charge</td><td class="rc-col-c">${d.charge}</td></tr>
                            <tr class="rc-section-end"><td class="rc-col-b">Total</td><td class="rc-col-c">${d.total}</td></tr>
                            <tr class="rc-payment-received-row"><td colspan="2">Payment Received: ${d.received}</td></tr>
                        </table>
                        <div class="paid-stamp-wrapper"><img src="${paidStampImgUrl}" alt="PAID Stamp" class="paid-stamp-img" loading="eager" /></div>
                        <div class="rc-footer-sign"><strong>Received By:</strong> ${d.receivedBy || 'Riyal Robiul'}</div>
                        <div class="rc-disclaimer-mono">This is a computer-generated receipt.<br>Thank you for your payment.</div>
                        <div class="rc-disclaimer-lora">For any queries or assistance, please contact<br>Md. Robiul Islam at 01608-314552 or 01893-201584.</div>
                    </div>
                </div>
                <script>
                    function downloadReceiptPDF() {
                        const element = document.getElementById('printableReceiptCard');
                        html2pdf().set({ 
                            margin: 0, 
                            filename: 'Receipt_${d.receiptNo}_${d.studentId}.pdf', 
                            image: { type: 'jpeg', quality: 0.98 }, 
                            html2canvas: { scale: 2.5, useCORS: true, allowTaint: true }, 
                            jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' } 
                        }).from(element).save();
                    }
                <\/script>
            </body>
            </html>
        `;

        receiptWindow.document.open();
        receiptWindow.document.write(htmlContent);
        receiptWindow.document.close();
    };

    // ৭. হিসাব
    function calculateAutoValues() {
        const discountInp = document.getElementById('origDisc');
        const txnInp = document.getElementById('origTxn');
        const dueInp = document.getElementById('origDue');
        const chargeText = document.getElementById('origCharge');
        const recInp = document.getElementById('origRec');

        const discount = parseFloat(discountInp ? discountInp.value : 0) || 0;
        const txnFee = parseFloat(txnInp ? txnInp.value : 0) || 0;

        const netDue = Math.max(0, selectedStudentRawDue - discount);
        const percentCharge = netDue * 0.01;
        const totalCharge = percentCharge + txnFee;
        const netReceived = netDue + totalCharge;

        if (dueInp) dueInp.value = netDue.toFixed(2);
        if (chargeText) chargeText.innerText = totalCharge.toFixed(2);
        if (recInp) recInp.value = netReceived.toFixed(2);
    }

    function formatDateToDDMMYYYY(dateStr) {
        if (!dateStr) return new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
    }

    // ৮. বাল্ক Tap Pay (একের অধিক বা একক একসাথে পে করা)
    async function markBulkAsTapPaid(txIds) {
        if (!txIds || txIds.length === 0) return;
        const nowFormatted = new Date().toLocaleDateString('en-GB').replace(/\//g, '-') + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        let count = 0;
        feeTransactionsList.forEach(t => {
            if (txIds.includes(t.id) && t.status !== 'Paid') {
                t.status = 'Paid';
                t.paidTimestamp = nowFormatted;
                count++;
            }
        });

        try {
            const fb = await getFirebase();
            if (fb) await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
            selectedPendingTxIds.clear();
            if (typeof showToast === 'function') showToast(`${count} records paid successfully`, "success");
            renderPendingTable();
        } catch(e) { console.error(e); }
    }

    window.revertTapPaidToPending = async function(txId) {
        const tx = feeTransactionsList.find(t => t.id === txId);
        if (!tx) return;

        tx.status = 'Pending';
        delete tx.paidTimestamp;

        try {
            const fb = await getFirebase();
            if (fb) await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
            if (typeof showToast === 'function') showToast("Restored to Pending", "info");
        } catch(e) { console.error(e); }
    };

    // ৯. Void
    window.openVoidModalForSelection = function() {
        if (selectedPendingTxIds.size === 0) return;
        document.getElementById('voidReasonModal').style.display = 'flex';
    };

    window.confirmVoidTransaction = async function() {
        const reason = document.getElementById('voidCustomReason').value.trim() || 'Cancelled';
        const nowFormatted = new Date().toLocaleDateString('en-GB').replace(/\//g, '-') + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const user = (window.profileSettings && window.profileSettings.fullName) || 'Admin';

        const idsToVoid = Array.from(selectedPendingTxIds);
        let voidCount = 0;

        for (let i = feeTransactionsList.length - 1; i >= 0; i--) {
            if (idsToVoid.includes(feeTransactionsList[i].id)) {
                const [removedTx] = feeTransactionsList.splice(i, 1);
                removedTx.voidReason = reason;
                removedTx.voidDate = nowFormatted;
                removedTx.voidedBy = user;
                voidLogsList.unshift(removedTx);
                voidCount++;
            }
        }

        try {
            const fb = await getFirebase();
            if (fb) {
                await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
                await fb.set(fb.ref(fb.db, 'erp/feeVoidLogs'), voidLogsList);
            }
            document.getElementById('voidReasonModal').style.display = 'none';
            selectedPendingTxIds.clear();
            if (typeof showToast === 'function') showToast(`${voidCount} record(s) voided`, "warning");
            renderPendingTable();
        } catch(e) { console.error(e); }
    };

    window.restoreVoidedRecord = async function(txId) {
        const vIndex = voidLogsList.findIndex(v => v.id === txId);
        if (vIndex === -1) return;

        const [restored] = voidLogsList.splice(vIndex, 1);
        restored.status = 'Pending';
        delete restored.voidReason;
        delete restored.voidDate;

        feeTransactionsList.push(restored);

        try {
            const fb = await getFirebase();
            if (fb) {
                await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
                await fb.set(fb.ref(fb.db, 'erp/feeVoidLogs'), voidLogsList);
            }
            if (typeof showToast === 'function') showToast("Record restored", "success");
        } catch(e) { console.error(e); }
    };

    // ১০. মাল্টি-সিলেকশন লজিক
    window.togglePendingRowSelection = function(txId, event) {
        if (event && event.stopPropagation) event.stopPropagation();
        if (selectedPendingTxIds.has(txId)) {
            selectedPendingTxIds.delete(txId);
        } else {
            selectedPendingTxIds.add(txId);
        }
        renderPendingTable();
    };

    window.toggleSelectAllPending = function(checked, visibleIds) {
        if (checked) {
            visibleIds.forEach(id => selectedPendingTxIds.add(id));
        } else {
            visibleIds.forEach(id => selectedPendingTxIds.delete(id));
        }
        renderPendingTable();
    };

    window.executeBulkPendingAction = function(actionType) {
        if (selectedPendingTxIds.size === 0) return;

        if (actionType === 'pay') {
            markBulkAsTapPaid(Array.from(selectedPendingTxIds));
        } else if (actionType === 'void') {
            openVoidModalForSelection();
        } else if (actionType === 'print') {
            // প্রিন্ট শুধুমাত্র প্রথম সিলেক্ট করাটির রসিদ বের করবে
            const firstId = Array.from(selectedPendingTxIds)[0];
            printRowReceipt(firstId);
        }
    };

    // ১১. স্মার্ট মাল্টি-ট্যাগ ফিল্টার লজিক
    window.applyPendingTag = function(type, value) {
        pendingFilters[type] = value;
        selectedPendingTxIds.clear();
        closeFilterMenu();
        renderPendingTable();
    };

    window.removePendingTag = function(type) {
        pendingFilters[type] = null;
        selectedPendingTxIds.clear();
        renderPendingTable();
    };

    window.clearAllPendingFilters = function() {
        pendingFilters.category = null;
        pendingFilters.months = null;
        pendingFilters.class = null;
        selectedPendingTxIds.clear();
        closeFilterMenu();
        renderPendingTable();
    };

    function toggleFilterMenu() {
        const popup = document.getElementById('filterMenuPopup');
        if (popup) {
            popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';
        }
    }

    function closeFilterMenu() {
        const popup = document.getElementById('filterMenuPopup');
        if (popup) popup.style.display = 'none';
    }

    // মাস্টার ডাটাবেস থেকে তথ্য সমৃদ্ধ করা
    function enrichTransactionData(t) {
        const master = studentDueList.find(s => 
            String(s.stdId).trim() === String(t.customerId).trim() || 
            (s.mobile && String(s.mobile).trim() === String(t.customerId).trim())
        );

        return {
            ...t,
            class: t.class && t.class !== '-' ? t.class : (master ? master.class : '-'),
            section: t.section && t.section !== '-' ? t.section : (master ? master.section : '-'),
            category: t.category && t.category !== '-' ? t.category : (master ? master.category : '-'),
            month: t.month && t.month !== '-' ? t.month : (master ? master.monthDue : '1'),
            dueItems: t.dueItems && t.dueItems !== '-' ? t.dueItems : (master ? master.dueItems : '-'),
            mobile: t.mobile && t.mobile !== '-' ? t.mobile : (master ? master.mobile : '-')
        };
    }

    // ১২. পেন্ডিং টেবিল ও মাল্টি-সিলেক্ট কন্ট্রোল রেন্ডারিং
    function renderPendingTable() {
        const tbody = document.getElementById('pendingClearanceTableBody');
        const badge = document.getElementById('pendingCountBadge');
        const sumEl = document.getElementById('pendingTotalSum');
        const selectedLabel = document.getElementById('pendingSelectedLabel');
        const btnPay = document.getElementById('btnTopPay');
        const btnVoid = document.getElementById('btnTopVoid');
        const btnPrint = document.getElementById('btnTopPrint');
        const tagContainer = document.getElementById('filterTagContainer');
        const classGrid = document.getElementById('filterClassMenuGrid');
        const selectAllCheckbox = document.getElementById('selectAllPendingCheckbox');

        if (!tbody) return;

        const rawPending = feeTransactionsList
            .filter(t => t.status !== 'Paid')
            .map(t => enrichTransactionData(t));

        // ক্লাস ড্রপডাউন মেনু তৈরি
        if (classGrid) {
            const existingClasses = [...new Set(rawPending.map(t => (t.class || '').trim()).filter(Boolean))];
            if (existingClasses.length === 0) {
                classGrid.innerHTML = `<span style="font-size:0.75rem; color:#94a3b8;">No classes</span>`;
            } else {
                let html = '';
                existingClasses.forEach(c => {
                    const isSel = (pendingFilters.class === c);
                    html += `<button type="button" class="filter-opt-btn ${isSel ? 'opt-active' : ''}" onclick="applyPendingTag('class', '${c}')">${c}</button>`;
                });
                classGrid.innerHTML = html;
            }
        }

        // ট্যাগ চিপস
        if (tagContainer) {
            let tagsHtml = '';
            let hasActiveFilter = false;

            if (pendingFilters.category) {
                hasActiveFilter = true;
                tagsHtml += `<span class="tag-chip">${pendingFilters.category} <span class="tag-close-x" onclick="removePendingTag('category')">✕</span></span>`;
            }

            if (pendingFilters.months) {
                hasActiveFilter = true;
                const mText = (pendingFilters.months === 'urgent') ? '2+ Mos ⚠️' : `${pendingFilters.months} Mo`;
                const isUrg = (pendingFilters.months === 'urgent' || parseInt(pendingFilters.months) >= 2);
                tagsHtml += `<span class="tag-chip ${isUrg ? 'tag-urgent' : ''}">${mText} <span class="tag-close-x" onclick="removePendingTag('months')">✕</span></span>`;
            }

            if (pendingFilters.class) {
                hasActiveFilter = true;
                tagsHtml += `<span class="tag-chip">${pendingFilters.class} <span class="tag-close-x" onclick="removePendingTag('class')">✕</span></span>`;
            }

            tagContainer.innerHTML = hasActiveFilter ? tagsHtml : `<span class="no-filter-text">All</span>`;
        }

        // ফিল্টারিং প্রয়োগ
        let filteredPending = rawPending;

        if (pendingFilters.category) {
            filteredPending = filteredPending.filter(t => (t.category || '').toLowerCase().trim() === pendingFilters.category.toLowerCase().trim());
        }

        if (pendingFilters.months) {
            if (pendingFilters.months === "urgent") {
                filteredPending = filteredPending.filter(t => (parseInt(t.month) || 1) >= 2);
            } else if (pendingFilters.months === "1") {
                filteredPending = filteredPending.filter(t => (parseInt(t.month) || 1) === 1);
            } else if (pendingFilters.months === "2") {
                filteredPending = filteredPending.filter(t => (parseInt(t.month) || 1) === 2);
            } else if (pendingFilters.months === "3+") {
                filteredPending = filteredPending.filter(t => (parseInt(t.month) || 1) >= 3);
            }
        }

        if (pendingFilters.class) {
            filteredPending = filteredPending.filter(t => (t.class || '').toLowerCase().trim() === pendingFilters.class.toLowerCase().trim());
        }

        const visibleIds = filteredPending.map(t => t.id);

        // সিলেকশন ক্লিনআপ (যদি ফিল্টারে কিছু হাইড হয়ে যায়)
        for (let id of selectedPendingTxIds) {
            if (!visibleIds.includes(id)) selectedPendingTxIds.delete(id);
        }

        // মোট হিসাব ও সিলেক্টেড সামারি
        let totalGrossSum = 0;
        let selectedGrossSum = 0;

        filteredPending.forEach(t => {
            const tuition = parseFloat(t.netDue || 0);
            const tapFee = Math.min(tuition * 0.01, 60);
            const gross = t.grossPayment ? parseFloat(t.grossPayment) : (tuition + tapFee);
            totalGrossSum += gross;
            if (selectedPendingTxIds.has(t.id)) {
                selectedGrossSum += gross;
            }
        });

        // সিলেকশন স্ট্যাটাস বার টেক্সট
        const selCount = selectedPendingTxIds.size;
        if (selCount > 0) {
            if (selectedLabel) {
                selectedLabel.innerHTML = `<strong style="color:#0f172a;">${selCount} Selected</strong> <span style="color:#10b981; font-weight:700; margin-left:8px;">(Tap: ৳ ${selectedGrossSum.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>`;
            }
            if (btnPay) {
                btnPay.disabled = false;
                btnPay.innerHTML = `${ICONS.pay} Pay (${selCount})`;
            }
            if (btnVoid) btnVoid.disabled = false;
            if (btnPrint) btnPrint.disabled = (selCount !== 1); // প্রিন্ট শুধুমাত্র ১ জন সিলেক্ট হলে এনাবল হবে
        } else {
            if (selectedLabel) {
                selectedLabel.innerHTML = `<span>No student selected</span>`;
            }
            if (btnPay) {
                btnPay.disabled = true;
                btnPay.innerHTML = `${ICONS.pay} Pay`;
            }
            if (btnVoid) btnVoid.disabled = true;
            if (btnPrint) btnPrint.disabled = true;
        }

        // সিলেক্ট অল চেকবক্স আপডেট
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = (visibleIds.length > 0 && selCount === visibleIds.length);
            selectAllCheckbox.onclick = (e) => toggleSelectAllPending(e.target.checked, visibleIds);
        }

        if (filteredPending.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:25px; color:#94a3b8;">No matching pending records.</td></tr>';
            if (badge) badge.innerText = '0 Pending';
            if (sumEl) sumEl.innerText = '0.00';
            return;
        }

        let html = '';
        filteredPending.forEach(t => {
            const tuition = parseFloat(t.netDue || 0);
            const netRec = parseFloat(t.netReceived || 0);
            const tapFee = Math.min(tuition * 0.01, 60);
            const grossPayable = t.grossPayment ? parseFloat(t.grossPayment) : (tuition + tapFee);

            const isSelected = selectedPendingTxIds.has(t.id);
            const classSec = `${t.class || '-'} ${t.section && t.section !== '-' ? '(' + t.section + ')' : ''}`;
            const formattedDate = formatDateToDDMMYYYY(t.date);
            const formattedTime = t.time ? `<span style="font-size:0.75rem; color:#64748b; margin-left:5px;">${t.time}</span>` : '';

            html += `
                <tr class="row-selectable ${isSelected ? 'row-selected' : ''}" onclick="togglePendingRowSelection('${t.id}')">
                    <td style="text-align:center;" onclick="event.stopPropagation();">
                        <input type="checkbox" class="edu-checkbox" ${isSelected ? 'checked' : ''} onchange="togglePendingRowSelection('${t.id}', event)">
                    </td>
                    <td style="font-weight:700; color:#2563eb;">${t.receiptNo || '-'}</td>
                    <td>${formattedDate} ${formattedTime}</td>
                    <td><strong style="font-family:monospace; font-size:0.9rem;">${t.customerId}</strong></td>
                    <td style="font-weight:600;">${t.studentName}</td>
                    <td>${classSec}</td>
                    <td style="font-weight:800; color:#b45309; font-size:0.92rem;">৳ ${grossPayable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="color:#15803d; font-weight:700;">৳ ${netRec.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        if (badge) badge.innerText = `${filteredPending.length} Pending`;
        if (sumEl) sumEl.innerText = totalGrossSum.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }

    function renderPaidTable() {
        const tbody = document.getElementById('paidSettlementTableBody');
        const badge = document.getElementById('paidCountBadge');
        const sumEl = document.getElementById('paidTotalSum');
        if (!tbody) return;

        const paidList = feeTransactionsList.filter(t => t.status === 'Paid');
        let total = 0;

        if (paidList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:25px; color:#94a3b8;">No paid records found.</td></tr>';
            if (badge) badge.innerText = '0 Paid';
            if (sumEl) sumEl.innerText = '0.00';
            return;
        }

        let html = '';
        paidList.forEach(t => {
            const gross = parseFloat(t.grossPayment || t.netReceived || 0);
            total += gross;
            const formattedDate = formatDateToDDMMYYYY(t.date);
            const formattedTime = t.time ? `<span style="font-size:0.75rem; color:#64748b; margin-left:5px;">${t.time}</span>` : '';

            html += `
                <tr>
                    <td style="font-weight:700; color:#10b981;">${t.receiptNo || '-'}</td>
                    <td>${formattedDate} ${formattedTime}</td>
                    <td><strong style="font-family:monospace;">${t.customerId}</strong></td>
                    <td style="font-weight:600;">${t.studentName}</td>
                    <td style="font-weight:700; color:#15803d;">৳ ${gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="font-size:0.8rem; color:#64748b;">${t.paidTimestamp || '-'}</td>
                    <td style="text-align:right;">
                        <button class="btn-act btn-act-undo" onclick="revertTapPaidToPending('${t.id}')">Revert</button>
                        <button class="btn-act btn-act-print" onclick="printRowReceipt('${t.id}')">Print</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        if (badge) badge.innerText = `${paidList.length} Paid`;
        if (sumEl) sumEl.innerText = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }

    function renderVoidTable() {
        const tbody = document.getElementById('voidLogsTableBody');
        const badge = document.getElementById('voidCountBadge');
        if (!tbody) return;

        if (voidLogsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:25px; color:#94a3b8;">No void logs found.</td></tr>';
            if (badge) badge.innerText = '0 Voided';
            return;
        }

        let html = '';
        voidLogsList.forEach(v => {
            html += `
                <tr>
                    <td style="font-weight:700; color:#dc2626;">${v.receiptNo || '-'}</td>
                    <td style="font-size:0.8rem;">${v.voidDate || '-'}</td>
                    <td><strong>${v.customerId}</strong> (${v.studentName})</td>
                    <td>৳ ${parseFloat(v.netReceived||0).toFixed(2)}</td>
                    <td style="color:#b91c1c;">${v.voidReason || 'Cancelled'}</td>
                    <td style="font-size:0.8rem;">${v.voidedBy || 'Admin'}</td>
                    <td style="text-align:right;">
                        <button class="btn-act btn-act-undo" onclick="restoreVoidedRecord('${v.id}')">Restore</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        if (badge) badge.innerText = `${voidLogsList.length} Voided`;
    }

    // মাস্টার এক্সেল এক্সপোর্ট
    window.exportDataToExcel = function(type) {
        if (typeof XLSX === 'undefined') return;

        let data = [];
        let fileName = "";

        if (type === 'pending') {
            fileName = "Pending_Clearance.xlsx";
            data.push(["Receipt No", "Date", "Student ID", "Student Name", "Class", "Section", "Category", "Months Due", "Due Items", "Tuition Fee", "Tap Payable", "Net Collected", "Mobile"]);
            feeTransactionsList.filter(t => t.status !== 'Paid').forEach(t => {
                const en = enrichTransactionData(t);
                const tuition = parseFloat(en.netDue || 0);
                const tapFee = Math.min(tuition * 0.01, 60);
                const gross = en.grossPayment ? parseFloat(en.grossPayment) : (tuition + tapFee);
                data.push([
                    en.receiptNo, en.date, en.customerId, en.studentName, en.class, en.section, en.category, 
                    en.month, en.dueItems, tuition, gross, en.netReceived, en.mobile
                ]);
            });
        } else if (type === 'paid') {
            fileName = "Paid_Settlement.xlsx";
            data.push(["Receipt No", "Date", "Student ID", "Student Name", "Class", "Gross Payment", "Settled Time"]);
            feeTransactionsList.filter(t => t.status === 'Paid').forEach(t => {
                data.push([t.receiptNo, t.date, t.customerId, t.studentName, t.class, t.grossPayment, t.paidTimestamp]);
            });
        } else if (type === 'due') {
            fileName = "Master_Due.xlsx";
            data.push(["Class", "Section", "STD ID", "Student Name", "Category", "Month Due", "Due items", "Due Amount", "Mobile"]);
            studentDueList.forEach(s => {
                data.push([s.class || '', s.section || '', s.stdId || '', s.studentName || '', s.category || '', s.monthDue || '', s.dueItems || '', s.dueAmount || 0, s.mobile || '']);
            });
        } else if (type === 'void') {
            fileName = "Void_Audit_Log.xlsx";
            data.push(["Receipt No", "Void Date", "Student ID", "Student Name", "Amount", "Void Reason", "Voided By"]);
            voidLogsList.forEach(v => {
                data.push([v.receiptNo, v.voidDate, v.customerId, v.studentName, v.netReceived, v.voidReason, v.voidedBy]);
            });
        }

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, fileName);
    };

    // ১৩. বকেয়া তালিকা টেবিল
    function renderDueDataTable() {
        const tbody = document.getElementById('dueDataTableBody');
        const paginationBtns = document.getElementById('duePaginationBtns');
        if (!tbody) return;

        let filtered = studentDueList;
        if (currentSearchQuery) {
            const q = currentSearchQuery.toLowerCase();
            filtered = studentDueList.filter(item => 
                (item.studentName && item.studentName.toLowerCase().includes(q)) ||
                (item.stdId && item.stdId.toLowerCase().includes(q)) ||
                (item.class && item.class.toLowerCase().includes(q)) ||
                (item.section && item.section.toLowerCase().includes(q)) ||
                (item.category && item.category.toLowerCase().includes(q)) ||
                (item.mobile && item.mobile.toLowerCase().includes(q))
            );
        }

        const totalEntries = filtered.length;
        const effectivePageSize = rowsPerPage === -1 ? totalEntries : rowsPerPage;
        const totalPages = Math.max(1, Math.ceil(totalEntries / (effectivePageSize || 1)));

        if (currentPage > totalPages) currentPage = totalPages;
        const startIndex = (currentPage - 1) * effectivePageSize;
        const currentSlice = rowsPerPage === -1 ? filtered : filtered.slice(startIndex, startIndex + effectivePageSize);

        if (totalEntries === 0) {
            tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; padding:25px; color:#94a3b8;">No records found.</td></tr>`;
            if (paginationBtns) paginationBtns.innerHTML = '';
            return;
        }

        let html = '';
        currentSlice.forEach((item, index) => {
            const fName = (item.fathersName && item.fathersName !== '-') ? item.fathersName : '';
            const fMob = (item.fathersMobile && item.fathersMobile !== '-') ? item.fathersMobile : '';
            const fatherDisplay = (fName || fMob) ? `${fName} ${fMob ? '(' + fMob + ')' : ''}` : '-';

            const mName = (item.mothersName && item.mothersName !== '-') ? item.mothersName : '';
            const mMob = (item.mothersMobile && item.mothersMobile !== '-') ? item.mothersMobile : '';
            const motherDisplay = (mName || mMob) ? `${mName} ${mMob ? '(' + mMob + ')' : ''}` : '-';

            html += `
                <tr>
                    <td style="font-weight:700; color:#64748b;">${startIndex + index + 1}</td>
                    <td>${item.class || '-'}</td>
                    <td>${item.section || '-'}</td>
                    <td><strong>${item.stdId || '-'}</strong></td>
                    <td style="font-weight:600;">${item.studentName || '-'}</td>
                    <td>${item.category || '-'}</td>
                    <td style="text-align:center;">${item.monthDue || '-'}</td>
                    <td style="font-size:0.78rem; color:#475569;">${item.dueItems || '-'}</td>
                    <td style="font-weight:700; color:#e11d48;">৳ ${parseFloat(item.dueAmount || 0).toLocaleString()}</td>
                    <td>${item.mobile || '-'}</td>
                    <td style="font-size:0.8rem;">${fatherDisplay}</td>
                    <td style="font-size:0.8rem;">${motherDisplay}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        if (paginationBtns) {
            paginationBtns.innerHTML = '';
            if (totalPages > 1) {
                for (let i = 1; i <= Math.min(totalPages, 8); i++) {
                    const btn = document.createElement('button');
                    btn.className = `btn-act ${i === currentPage ? 'btn-act-print' : 'btn-act-undo'}`;
                    btn.innerText = i;
                    btn.onclick = () => { currentPage = i; renderDueDataTable(); };
                    paginationBtns.appendChild(btn);
                }
            }
        }
    }

    // ১৪. Firebase লিসেনার
    async function listenFirebaseData() {
        const fb = await getFirebase();
        if (!fb) return;

        fb.onValue(fb.ref(fb.db, 'erp/studentDueData'), (snapshot) => {
            const data = snapshot.val();
            studentDueList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            renderDueDataTable();
        });

        fb.onValue(fb.ref(fb.db, 'erp/feeTransactions'), (snapshot) => {
            const data = snapshot.val();
            feeTransactionsList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            renderPendingTable();
            renderPaidTable();
        });

        fb.onValue(fb.ref(fb.db, 'erp/feeVoidLogs'), (snapshot) => {
            const data = snapshot.val();
            voidLogsList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            renderVoidTable();
        });
    }

    window.printRowReceipt = function(txId) {
        const tx = feeTransactionsList.find(t => t.id === txId);
        if (!tx) return;

        const receiptData = {
            receiptNo: tx.receiptNo || tx.id.replace(/\D/g, '').slice(-4) || '3410',
            date: formatDateToDDMMYYYY(tx.date),
            studentName: tx.studentName || '-',
            studentId: tx.customerId || '-',
            tuitionFee: parseFloat(tx.netDue||0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            charge: parseFloat(tx.totalCharge||0).toFixed(1),
            total: parseFloat(tx.netReceived||0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            received: parseFloat(tx.netReceived||0).toString(),
            receivedBy: tx.receivedBy || (window.profileSettings && window.profileSettings.fullName) || 'Riyal Robiul'
        };

        window.openReceiptInNewTab(receiptData);
    };

    function extractExcelValue(row, possibleKeys) {
        const keys = Object.keys(row);
        for (const p of possibleKeys) {
            const cleanTarget = p.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (const k of keys) {
                const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                if (cleanKey === cleanTarget) {
                    const val = row[k];
                    if (val !== undefined && val !== null && String(val).trim() !== '') {
                        return String(val).trim();
                    }
                }
            }
        }
        return '';
    }

    // ১৫. ফর্ম ও ইভেন্ট ইনিশিয়ালাইজেশন
    function initLogic() {
        const idInp = document.getElementById('origId');
        const nameInp = document.getElementById('origName');
        const dateInp = document.getElementById('origDate');
        const discInp = document.getElementById('origDisc');
        const txnInp = document.getElementById('origTxn');
        const alertBox = document.getElementById('adjustmentAlertBox');
        const alertTag = document.getElementById('adjustmentAmountTag');
        const alertText = document.getElementById('adjustmentDetailsText');

        if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];

        if (idInp) {
            idInp.addEventListener('input', function() {
                const val = this.value.trim();
                if (!val) {
                    selectedStudentRawDue = 0;
                    selectedStudentData = null;
                    if (nameInp) nameInp.value = '';
                    if (alertBox) alertBox.style.display = 'none';
                    calculateAutoValues();
                    return;
                }

                const dueFound = studentDueList.find(s => 
                    String(s.stdId).trim() === val || 
                    String(s.mobile).trim() === val ||
                    String(s.fathersMobile).trim() === val ||
                    String(s.mothersMobile).trim() === val
                );
                const prevPayments = feeTransactionsList.filter(t => String(t.customerId).trim() === val && t.status === 'Pending');
                let prevPaidSum = 0;
                prevPayments.forEach(p => prevPaidSum += (parseFloat(p.netDue) || 0));

                if (dueFound) {
                    selectedStudentData = dueFound;
                    const sheetDue = parseFloat(dueFound.dueAmount || 0);

                    if (prevPaidSum > 0) {
                        selectedStudentRawDue = Math.max(0, sheetDue - prevPaidSum);
                        if (alertBox && alertTag && alertText) {
                            alertBox.style.display = 'flex';
                            alertTag.innerText = `Adjusted: ৳ ${prevPaidSum.toFixed(2)}`;
                            alertText.innerText = `Sheet Due: ৳ ${sheetDue} | Previously Paid at Shop: ৳ ${prevPaidSum}`;
                        }
                    } else {
                        selectedStudentRawDue = sheetDue;
                        if (alertBox) alertBox.style.display = 'none';
                    }

                    if (nameInp) nameInp.value = dueFound.studentName || '';
                } else {
                    selectedStudentData = null;
                    selectedStudentRawDue = 0;
                    if (nameInp) nameInp.value = '';
                    if (alertBox) alertBox.style.display = 'none';
                }
                calculateAutoValues();
            });
        }

        if (discInp) discInp.addEventListener('input', calculateAutoValues);
        if (txnInp) txnInp.addEventListener('input', calculateAutoValues);

        // ফর্ম সাবমিট
        const origForm = document.getElementById('feeFormOriginal');
        if (origForm) {
            origForm.onsubmit = async function(e) {
                e.preventDefault();
                const studentId = idInp ? idInp.value.trim() : '';
                const studentName = nameInp ? nameInp.value.trim() : '';
                const netDue = parseFloat(document.getElementById('origDue').value) || 0;
                const txnFee = parseFloat(document.getElementById('origTxn').value) || 0;
                const totalCharge = parseFloat(document.getElementById('origCharge').innerText) || 0;
                const netReceived = parseFloat(document.getElementById('origRec').value) || 0;
                const discount = parseFloat(document.getElementById('origDisc').value) || 0;

                if (!studentId || netReceived <= 0) {
                    alert("Please enter valid student ID and amount!");
                    return;
                }

                if (typeof showLoader === 'function') showLoader("Saving fee record...");

                const percentCapCharge = Math.min(netDue * 0.01, 60);
                const calculatedGross = netDue + percentCapCharge;
                const receiptNumeric = (feeTransactionsList.length + voidLogsList.length + 1) + 3400;
                const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const txData = {
                    id: 'EDU-' + Date.now(),
                    receiptNo: String(receiptNumeric),
                    customerId: studentId,
                    studentName: studentName || '-',
                    class: selectedStudentData ? (selectedStudentData.class || '-') : '-',
                    section: selectedStudentData ? (selectedStudentData.section || '-') : '-',
                    month: selectedStudentData ? (selectedStudentData.monthDue || '-') : '-',
                    category: selectedStudentData ? (selectedStudentData.category || '-') : '-',
                    dueItems: selectedStudentData ? (selectedStudentData.dueItems || '-') : '-',
                    mobile: selectedStudentData ? (selectedStudentData.mobile || '-') : '-',
                    netDue: netDue,
                    txnFee: txnFee,
                    totalCharge: totalCharge,
                    discount: discount,
                    netReceived: netReceived,
                    grossPayment: calculatedGross,
                    date: dateInp ? dateInp.value : new Date().toISOString().split('T')[0],
                    time: nowTime,
                    status: 'Pending',
                    receivedBy: (window.profileSettings && window.profileSettings.fullName) || 'Riyal Robiul'
                };

                try {
                    const fb = await getFirebase();
                    if (fb) {
                        feeTransactionsList.unshift(txData);
                        await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
                    }

                    if (typeof showToast === 'function') showToast("Fee collected successfully!", "success");

                    const receiptData = {
                        receiptNo: txData.receiptNo,
                        date: formatDateToDDMMYYYY(txData.date),
                        studentName: txData.studentName,
                        studentId: txData.customerId,
                        tuitionFee: netDue.toLocaleString('en-US', { minimumFractionDigits: 2 }),
                        charge: totalCharge.toFixed(1),
                        total: netReceived.toLocaleString('en-US', { minimumFractionDigits: 2 }),
                        received: netReceived.toString(),
                        receivedBy: txData.receivedBy
                    };

                    window.openReceiptInNewTab(receiptData);

                    this.reset();
                    selectedStudentRawDue = 0;
                    selectedStudentData = null;
                    if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];
                    if (txnInp) txnInp.value = "6.00";
                    if (alertBox) alertBox.style.display = 'none';
                    calculateAutoValues();
                } catch(err) { console.error(err); }
                if (typeof hideLoader === 'function') hideLoader();
            };
        }

        // এক্সেল স্যাম্পল
        const btnDownloadSample = document.getElementById('btnDownloadSample');
        if (btnDownloadSample) {
            btnDownloadSample.addEventListener('click', function () {
                if (typeof XLSX === 'undefined') return;

                const sampleHeaders = ["Class", "Section", "STD ID", "Student Name", "Category", "Month Due", "Due items", "Due Amount", "Mobile", "Fathers Name", "Fathers Mobile", "Mothers Name", "Mothers Mobile"];
                const sampleData = [
                    sampleHeaders,
                    ["Nursery", "Dhorola", "1400126", "Md Abrar Awsaf Abid", "Army", "1", "Tuition Fee", 650, "01722695846", "Md Samsujjaman", "01722695846", "Argina Khatun", "01794914861"]
                ];

                const ws = XLSX.utils.aoa_to_sheet(sampleData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Master Due Sample");
                XLSX.writeFile(wb, "Student_Due_Master_Sample.xlsx");
            });
        }

        // এক্সেল আপলোড
        const fileInput = document.getElementById('dueFileInput');
        const fileNameDisplay = document.getElementById('dueFileNameDisplay');
        if (fileInput && fileNameDisplay) {
            fileInput.addEventListener('change', function() {
                fileNameDisplay.innerText = (this.files && this.files.length > 0) ? this.files[0].name : "No file chosen";
            });
        }

        const pageSizeSelect = document.getElementById('duePageSizeSelect');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', function() {
                rowsPerPage = parseInt(this.value);
                currentPage = 1;
                renderDueDataTable();
            });
        }

        const btnUpload = document.getElementById('btnUploadDueData');
        if (btnUpload && fileInput) {
            btnUpload.addEventListener('click', function() {
                if (!fileInput.files || fileInput.files.length === 0) {
                    if (typeof showToast === 'function') showToast("Please choose an Excel file!", "warning");
                    return;
                }

                const reader = new FileReader();
                reader.onload = async function(e) {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array' });
                        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });

                        const formatted = json.map(r => ({
                            class: extractExcelValue(r, ['class']) || '-',
                            section: extractExcelValue(r, ['section', 'sec']) || '-',
                            stdId: extractExcelValue(r, ['stdid', 'studentid', 'id', 'roll']) || '-',
                            studentName: extractExcelValue(r, ['studentname', 'studentna', 'name']) || '-',
                            category: extractExcelValue(r, ['category', 'cat']) || '-',
                            monthDue: extractExcelValue(r, ['monthdue', 'duemonth', 'month']) || '-',
                            dueItems: extractExcelValue(r, ['dueitems', 'dueitem', 'items', 'item']) || '-',
                            dueAmount: parseFloat(extractExcelValue(r, ['dueamount', 'amount', 'due', 'totaldue'])) || 0,
                            mobile: extractExcelValue(r, ['mobile', 'stdmobile', 'studentmobile', 'phone']) || '-',
                            fathersName: extractExcelValue(r, ['fathersname', 'fathername', 'fathersna', 'father']) || '-',
                            fathersMobile: extractExcelValue(r, ['fathersmobile', 'fathermobile', 'fathersmo', 'fatherno', 'fatherphone']) || '',
                            mothersName: extractExcelValue(r, ['mothersname', 'mothername', 'mothersn', 'mother']) || '-',
                            mothersMobile: extractExcelValue(r, ['mothersmobile', 'mothermobile', 'mothersmo', 'motherno', 'motherphone']) || ''
                        }));

                        const fb = await getFirebase();
                        if (fb) {
                            await fb.set(fb.ref(fb.db, 'erp/studentDueData'), formatted);
                            studentDueList = formatted;
                            currentPage = 1;
                            renderDueDataTable();
                            if (typeof showToast === 'function') showToast("Data loaded successfully!", "success");
                        }
                    } catch(err) {
                        if (typeof showToast === 'function') showToast("Excel upload failed!", "error");
                    }
                };
                reader.readAsArrayBuffer(fileInput.files[0]);
            });
        }

        const searchInput = document.getElementById('dueTableSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                currentSearchQuery = this.value.trim();
                currentPage = 1;
                renderDueDataTable();
            });
        }

        // ফিল্টার ড্রপডাউন ট্রিপল-ক্লিক প্রতিরোধ
        const btnFilterTrigger = document.getElementById('btnFilterAddTrigger');
        if (btnFilterTrigger) {
            btnFilterTrigger.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleFilterMenu();
            });
        }

        document.addEventListener('click', function(e) {
            const popup = document.getElementById('filterMenuPopup');
            if (popup && popup.style.display === 'block') {
                if (!popup.contains(e.target) && e.target.id !== 'btnFilterAddTrigger') {
                    popup.style.display = 'none';
                }
            }
        });
    }

    window.addEventListener('load', () => {
        injectMenu();
        injectPanels();
        initLogic();
        listenFirebaseData();
    });
})();
