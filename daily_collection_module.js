/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - DAILY COUNTER COLLECTION & AUDIT MODULE
 * File: daily_collection_module.js (Dynamic Master-Linked Production Edition)
 * 
 * Features:
 * 1. 100% Dynamic Collection Heads linked to Master Config.
 * 2. Permanent Firebase Cloud Storage (erp/daily_collection_records/{date}).
 * 3. Safe Deletion relocated strictly inside History Table with alert.
 * 4. Locked strictly to Bangladesh Timezone (Asia/Dhaka).
 * 5. No lagging loops (Super lightweight).
 * 6. 1-Page Locked A4 Portrait Printable Statement.
 * ============================================================================
 */

(function () {
    "use strict";

    // বাংলাদেশ সময় অনুযায়ী YYYY-MM-DD ফরম্যাটে তারিখ
    function getBDDateString() {
        try {
            return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date());
        } catch (e) {
            const now = new Date();
            const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
            const bdTime = new Date(utc + (3600000 * 6));
            return bdTime.toISOString().split('T')[0];
        }
    }

    const fmt = (n) => '৳ ' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // ১. সম্পূর্ণ পিওর সিএসএস ইনজেকশন
    const moduleStyles = `
        <style id="collection-module-styles">
            @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

            #hub-tab-collection, #hub-tab-col-history, #col-printable-invoice {
                font-family: 'Tiro Bangla', serif !important;
                color: #0f172a;
                box-sizing: border-box;
            }
            #hub-tab-collection *, #hub-tab-col-history *, #col-printable-invoice * {
                font-family: 'Tiro Bangla', serif !important;
                box-sizing: border-box;
            }

            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
            input[type=number] { -moz-appearance: textfield; }

            .dcol-top-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 9999px;
                padding: 7px 18px;
                margin-bottom: 14px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.03);
            }
            .dcol-date-wrap {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 12px;
                font-weight: 700;
                color: #475569;
            }
            .dcol-date-inp {
                border: 1px solid #cbd5e1;
                border-radius: 9999px;
                padding: 3px 10px;
                font-size: 12px;
                font-weight: 800;
                color: #0f172a;
                outline: none;
                background: #fff;
            }
            .dcol-date-inp:focus { border-color: #4f46e5; }
            .dcol-live-total-text {
                font-size: 12.5px;
                font-weight: 800;
                color: #0f172a;
            }
            .dcol-live-total-text span {
                color: #4f46e5;
                font-weight: 900;
            }

            .dcol-grid-3 {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
                gap: 12px;
                margin-bottom: 14px;
            }
            .dcol-card {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 16px;
                padding: 12px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-shadow: 0 1px 4px rgba(0,0,0,0.02);
            }
            .dcol-card-title {
                font-size: 10.5px;
                font-weight: 800;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 10px;
                padding-left: 4px;
            }

            .dcol-item-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .dcol-pill-row {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 9999px;
                padding: 4px 10px;
            }
            .dcol-label {
                font-size: 12px;
                font-weight: 700;
                color: #334155;
            }
            .dcol-inp {
                width: 85px;
                height: 25px;
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 9999px;
                text-align: right;
                font-size: 12px;
                font-weight: 800;
                color: #0f172a;
                padding: 0 8px;
                outline: none;
            }
            .dcol-inp:focus { border-color: #4f46e5; }

            .dcol-subtotal-pill {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 12px;
                border-radius: 9999px;
                font-size: 11.5px;
                font-weight: 800;
                margin-top: 12px;
            }
            .sub-blue { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
            .sub-indigo { background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; }
            .sub-amber { background: #fffbeb; border: 1px solid #fde68a; color: #b45309; }

            .dcol-bottom-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 9999px;
                padding: 8px 18px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.03);
                flex-wrap: wrap;
                gap: 10px;
            }
            .dcol-grand-text {
                font-size: 12.5px;
                font-weight: 800;
                color: #334155;
            }
            .dcol-grand-text span {
                color: #4338ca;
                font-size: 13.5px;
                font-weight: 900;
                margin-left: 5px;
            }
            .dcol-actions-group {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .dcol-btn {
                background: #f8fafc;
                border: 1px solid #cbd5e1;
                border-radius: 9999px;
                padding: 4px 14px;
                font-size: 11.5px;
                font-weight: 800;
                color: #334155;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: 0.2s;
            }
            .dcol-btn:hover { background: #e2e8f0; color: #0f172a; }

            .col-floating-save-btn {
                position: fixed;
                bottom: 24px;
                right: 28px;
                background: #0f172a;
                color: #ffffff;
                border: none;
                padding: 10px 26px;
                border-radius: 9999px;
                font-size: 13px;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 8px 20px rgba(15, 23, 42, 0.25);
                z-index: 9999;
                display: none;
                align-items: center;
                gap: 8px;
                transition: transform 0.2s, background 0.2s;
            }
            .col-floating-save-btn:hover { background: #1e293b; transform: scale(1.04); }

            .dcol-table-card {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0,0,0,0.03);
            }
            .dcol-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                text-align: left;
            }
            .dcol-table th {
                background: #f8fafc;
                padding: 10px 12px;
                border-bottom: 1px solid #cbd5e1;
                font-weight: 800;
                color: #475569;
            }
            .dcol-table td {
                padding: 9px 12px;
                border-bottom: 1px solid #f1f5f9;
                font-weight: 700;
                color: #1e293b;
            }
            .dcol-table tr:hover td { background: #fbfcfe; }
            .dcol-icon-btn {
                border-radius: 9999px;
                padding: 5px 8px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;
            }
            .dcol-print-btn { background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; }
            .dcol-print-btn:hover { background: #dbeafe; color: #1e40af; }
            .dcol-delete-btn { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
            .dcol-delete-btn:hover { background: #fee2e2; color: #b91c1c; }

            /* A4 প্রিন্ট স্টাইল */
            #col-printable-invoice { display: none; }

            @media print {
                @page {
                    size: A4 portrait !important;
                    margin: 8mm 12mm !important;
                }
                html, body {
                    background: #ffffff !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    height: auto !important;
                }
                body * { visibility: hidden !important; }
                #col-printable-invoice, #col-printable-invoice * { visibility: visible !important; }
                #col-printable-invoice {
                    display: block !important;
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                    background: #ffffff !important;
                    color: #000000 !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    z-index: 9999999 !important;
                    page-break-inside: avoid !important;
                }
                .col-rpt-table {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    margin-top: 10px !important;
                    margin-bottom: 12px !important;
                    page-break-inside: avoid !important;
                }
                .col-rpt-table th, .col-rpt-table td {
                    border: 1.5px solid #000 !important;
                    padding: 5px 10px !important;
                    font-size: 14px !important;
                    line-height: 1.3 !important;
                    color: #000 !important;
                }
                .col-rpt-table th { background: #f1f5f9 !important; font-weight: 800 !important; }
                .col-rpt-sub-head { background: #f8fafc !important; font-weight: 800 !important; }
                .col-rpt-grand-row { background: #e2e8f0 !important; font-weight: 900 !important; font-size: 16px !important; }
            }
        </style>
    `;
    if (!document.getElementById('collection-module-styles')) {
        document.head.insertAdjacentHTML('beforeend', moduleStyles);
    }

    // ডিফল্ট আইটেম (ব্যাকআপ)
    const DEFAULT_HEADS = [
        { id: 'col_1', category: 'banking', name: 'bKash', order: 1, active: true },
        { id: 'col_2', category: 'banking', name: 'Nagad', order: 2, active: true },
        { id: 'col_3', category: 'banking', name: 'Rocket', order: 3, active: true },
        { id: 'col_4', category: 'banking', name: 'Tap', order: 4, active: true },
        { id: 'col_5', category: 'banking', name: 'Cant Public', order: 5, active: true },
        { id: 'col_6', category: 'recharge', name: 'Grameen-1', order: 1, active: true },
        { id: 'col_7', category: 'recharge', name: 'Grameen-2', order: 2, active: true },
        { id: 'col_8', category: 'recharge', name: 'Banglalink', order: 3, active: true },
        { id: 'col_9', category: 'recharge', name: 'Robi', order: 4, active: true },
        { id: 'col_10', category: 'recharge', name: 'Airtel', order: 5, active: true },
        { id: 'col_11', category: 'services', name: 'Photocopy', order: 1, active: true },
        { id: 'col_12', category: 'services', name: 'Computer', order: 2, active: true },
        { id: 'col_13', category: 'services', name: 'Others', order: 3, active: true }
    ];

    function getActiveHeads() {
        const list = Array.isArray(window.collectionConfig) && window.collectionConfig.length > 0 
            ? window.collectionConfig 
            : DEFAULT_HEADS;
        return list.filter(item => item.active !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    // ২. সাইডবার সাব-মেনু ইনজেকশন
    function injectSubmenus() {
        const submenuList = document.querySelector('#menu-asset-hub-parent .submenu-list');
        if (!submenuList || document.getElementById('sub-asset-collection')) return;

        const collectionMenuHTML = `
            <li class="submenu-item" id="sub-asset-collection">
                <a onclick="window.switchAssetHubSubTab('collection')">
                    <span><i class="fa fa-chevron-right" style="font-size: 9px; margin-right: 6px; opacity: 0.7;"></i>Daily Collection</span>
                </a>
            </li>
            <li class="submenu-item" id="sub-asset-col-history">
                <a onclick="window.switchAssetHubSubTab('col-history')">
                    <span><i class="fa fa-chevron-right" style="font-size: 9px; margin-right: 6px; opacity: 0.7;"></i>Collection History</span>
                </a>
            </li>
        `;

        const incHistoryMenu = document.getElementById('sub-asset-inc-history');
        if (incHistoryMenu) {
            incHistoryMenu.insertAdjacentHTML('afterend', collectionMenuHTML);
        } else {
            submenuList.insertAdjacentHTML('beforeend', collectionMenuHTML);
        }
    }

    // ৩. ভিউ কনটেন্ট ইনজেকশন
    function injectViews() {
        const hubView = document.getElementById('asset-hub-view');
        if (!hubView || document.getElementById('hub-tab-collection')) return;

        const viewsHTML = `
            <!-- SUB-TAB: DAILY COLLECTION -->
            <div id="hub-tab-collection" style="display: none;">
                
                <div class="dcol-top-bar">
                    <div class="dcol-date-wrap">
                        <span>Date:</span>
                        <input type="date" id="colInputDate" class="dcol-date-inp" onchange="window.onCollectionDateChange()">
                    </div>
                    <div class="dcol-live-total-text">
                        Live Total: <span id="colLiveGrandTotal">৳ 0.00</span>
                    </div>
                </div>

                <!-- ৩টি কলাম যা Master Config অনুযায়ী রেন্ডার হবে -->
                <div class="dcol-grid-3">
                    
                    <!-- Col 1: Banking -->
                    <div class="dcol-card">
                        <div>
                            <div class="dcol-card-title">Mobile Banking</div>
                            <div class="dcol-item-list" id="dynColListBanking"></div>
                        </div>
                        <div class="dcol-subtotal-pill sub-blue">
                            <span>Sub</span>
                            <span id="colBankSubtotal">৳ 0.00</span>
                        </div>
                    </div>

                    <!-- Col 2: Recharge -->
                    <div class="dcol-card">
                        <div>
                            <div class="dcol-card-title">Recharge</div>
                            <div class="dcol-item-list" id="dynColListRecharge"></div>
                        </div>
                        <div class="dcol-subtotal-pill sub-indigo">
                            <span>Sub</span>
                            <span id="colRechargeSubtotal">৳ 0.00</span>
                        </div>
                    </div>

                    <!-- Col 3: Services -->
                    <div class="dcol-card">
                        <div>
                            <div class="dcol-card-title">Services</div>
                            <div class="dcol-item-list" id="dynColListServices"></div>
                        </div>
                        <div class="dcol-subtotal-pill sub-amber">
                            <span>Sub</span>
                            <span id="colServiceSubtotal">৳ 0.00</span>
                        </div>
                    </div>

                </div>

                <!-- Action Bar -->
                <div class="dcol-bottom-bar">
                    <div class="dcol-grand-text">
                        Total Collection: <span id="colGrandTotalBottom">৳ 0.00</span>
                    </div>

                    <div class="dcol-actions-group no-print">
                        <button onclick="window.resetCollectionInputs()" class="dcol-btn">
                            <svg style="width:13px;height:13px;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            Reset
                        </button>
                        <button onclick="window.printActiveCollectionStatement()" class="dcol-btn">
                            <svg style="width:13px;height:13px;color:#4338ca;" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                            Print
                        </button>
                    </div>
                </div>

            </div>

            <!-- SUB-TAB: COLLECTION HISTORY -->
            <div id="hub-tab-col-history" style="display: none;">
                <div class="dcol-top-bar">
                    <span style="font-size: 12.5px; font-weight: 800;">Archived Records</span>
                    <button onclick="window.renderCollectionHistoryList()" class="dcol-btn">Reload</button>
                </div>

                <div class="dcol-table-card">
                    <table class="dcol-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th style="text-align:right;">Banking</th>
                                <th style="text-align:right;">Recharge</th>
                                <th style="text-align:right;">Service</th>
                                <th style="text-align:right;">Total</th>
                                <th style="text-align:center;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="colHistoryTableBody">
                            <tr><td colspan="6" style="text-align:center; padding: 20px; color:#64748b;">Loading records...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Floating Save Button -->
            <button class="col-floating-save-btn no-print" id="btnFloatingSaveCol" onclick="window.saveDailyCollectionToFirebase()">
                <svg style="width:16px;height:16px;color:#fff;" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <span>Save</span>
            </button>
        `;

        hubView.insertAdjacentHTML('beforeend', viewsHTML);

        // A4 প্রিন্ট টেমপ্লেট
        if (!document.getElementById('col-printable-invoice')) {
            const printHTML = `
                <div id="col-printable-invoice">
                    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
                        <h1 style="margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase;">Mousumi Computer</h1>
                        <h3 style="margin: 3px 0 0 0; font-size: 14.5px; font-weight: 700; text-transform: uppercase;">Daily Collection & Counter Income Statement</h3>
                        <div style="font-size: 12px; margin-top: 4px; color: #333;" id="colRptDateHeader">Date: --- | Shift: Counter Day Close</div>
                    </div>

                    <table class="col-rpt-table">
                        <thead>
                            <tr>
                                <th style="width: 35%; text-align: left;">Category / Head</th>
                                <th style="width: 40%; text-align: left;">Particulars</th>
                                <th style="width: 25%; text-align: right;">Amount (৳)</th>
                            </tr>
                        </thead>
                        <tbody id="colRptTableContent"></tbody>
                    </table>

                    <div style="margin-top: 25px; display: flex; justify-content: space-between; align-items: flex-end;">
                        <div style="width: 160px; text-align: center;">
                            <div style="border-top: 1px solid #000; margin-bottom: 4px;"></div>
                            <div style="font-size: 12px; font-weight: bold;">Prepared By</div>
                        </div>
                        <div style="font-size: 11px; color: #555;">Generated from Mousumi ERP</div>
                        <div style="width: 160px; text-align: center;">
                            <div style="border-top: 1px solid #000; margin-bottom: 4px;"></div>
                            <div style="font-size: 12px; font-weight: bold;">Authorized Signature</div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', printHTML);
        }

        window.rebuildCollectionFormUI();
    }

    // ৪. ডাইনামিক ইনপুট ফিল্ড তৈরি (Master Config থেকে)
    window.rebuildCollectionFormUI = function () {
        const bankListEl = document.getElementById('dynColListBanking');
        const rechListEl = document.getElementById('dynColListRecharge');
        const servListEl = document.getElementById('dynColListServices');

        if (!bankListEl || !rechListEl || !servListEl) return;

        // বর্তমান টাইপ করা মান সাময়িকভাবে সেভ রাখা
        const currentVals = {};
        document.querySelectorAll('.inp-dyn-col').forEach(inp => {
            currentVals[inp.dataset.headName] = inp.value;
        });

        bankListEl.innerHTML = '';
        rechListEl.innerHTML = '';
        servListEl.innerHTML = '';

        const heads = getActiveHeads();
        const noNeg = `min="0" onkeydown="if(['-','+','e','E'].includes(event.key)) event.preventDefault();"`;

        heads.forEach(h => {
            const cleanKey = h.name.replace(/[^a-zA-Z0-9]/g, '_');
            const rowHtml = `
                <div class="dcol-pill-row">
                    <span class="dcol-label">${h.name}</span>
                    <input type="number" step="any" ${noNeg} 
                        id="dyn_col_${cleanKey}" 
                        data-head-name="${h.name}" 
                        data-head-cat="${h.category}" 
                        oninput="window.calculateCollectionLive()" 
                        class="inp-dyn-col inp-dyn-${h.category} dcol-inp" 
                        placeholder="0.00" 
                        value="${currentVals[h.name] || ''}">
                </div>
            `;

            if (h.category === 'banking') bankListEl.insertAdjacentHTML('beforeend', rowHtml);
            else if (h.category === 'recharge') rechListEl.insertAdjacentHTML('beforeend', rowHtml);
            else if (h.category === 'services') servListEl.insertAdjacentHTML('beforeend', rowHtml);
        });

        window.calculateCollectionLive();
    };

    // ৫. লাইভ ক্যালকুলেশন
    function sumDynClass(cls) {
        let sum = 0;
        document.querySelectorAll(cls).forEach(i => {
            const v = Math.max(0, parseFloat(i.value) || 0);
            sum += v;
        });
        return sum;
    }

    window.calculateCollectionLive = function () {
        const bTot = sumDynClass('.inp-dyn-banking');
        const rTot = sumDynClass('.inp-dyn-recharge');
        const sTot = sumDynClass('.inp-dyn-services');
        const grand = bTot + rTot + sTot;

        const setT = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = fmt(val); };
        setT('colBankSubtotal', bTot);
        setT('colRechargeSubtotal', rTot);
        setT('colServiceSubtotal', sTot);
        setT('colGrandTotalBottom', grand);
        setT('colLiveGrandTotal', grand);

        syncWithDailyIncomeView(grand);
    };

    // ৬. ফায়ারবেসে সেভ করা (ডাইনামিক অবজেক্ট)
    window.saveDailyCollectionToFirebase = async function () {
        const d = document.getElementById('colInputDate')?.value || getBDDateString();
        if (typeof window.showLoader === 'function') window.showLoader("Saving Collection to Firebase...");

        const payload = {
            date: d,
            timestamp: Date.now(),
            updatedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
            banking: {},
            recharge: {},
            services: {}
        };

        document.querySelectorAll('.inp-dyn-col').forEach(inp => {
            const headName = inp.dataset.headName;
            const cat = inp.dataset.headCat;
            const val = Math.max(0, parseFloat(inp.value) || 0);

            if (payload[cat]) {
                payload[cat][headName] = val;
            }
        });

        const bTot = Object.values(payload.banking).reduce((a, b) => a + b, 0);
        const rTot = Object.values(payload.recharge).reduce((a, b) => a + b, 0);
        const sTot = Object.values(payload.services).reduce((a, b) => a + b, 0);
        payload.totals = {
            banking: bTot,
            recharge: rTot,
            services: sTot,
            grandTotal: bTot + rTot + sTot
        };

        try {
            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`erp/daily_collection_records/${d}`, payload);
            }
            if (typeof window.showToast === 'function') {
                window.showToast("Saved to Firebase successfully!", "success");
            }
        } catch (e) {
            console.error("Save error:", e);
            if (typeof window.showToast === 'function') window.showToast("Save Error: " + e.message, "error");
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ৭. তারিখ পরিবর্তনে লোড
    window.onCollectionDateChange = async function () {
        const d = document.getElementById('colInputDate')?.value;
        if (!d) return;

        if (typeof window.showLoader === 'function') window.showLoader("Fetching data for " + d);

        try {
            let record = null;
            if (window.getDatabase && window.ref && window.get) {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_collection_records/${d}`));
                if (snap.exists()) record = snap.val();
            }

            // আগের ইনপুটগুলো খালি করা
            document.querySelectorAll('.inp-dyn-col').forEach(i => i.value = '');

            if (record) {
                document.querySelectorAll('.inp-dyn-col').forEach(inp => {
                    const headName = inp.dataset.headName;
                    const cat = inp.dataset.headCat;
                    const val = record[cat]?.[headName];
                    inp.value = (val && val !== 0) ? val : '';
                });
            }

            window.calculateCollectionLive();
        } catch (e) {
            console.error("Fetch error:", e);
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    window.resetCollectionInputs = function (showConfirm = true) {
        if (!showConfirm || confirm("Reset all collection inputs to 0.00?")) {
            document.querySelectorAll('.inp-dyn-col').forEach(i => i.value = '');
            window.calculateCollectionLive();
        }
    };

    // ৮. হিস্ট্রি টেবিল লোড
    window.renderCollectionHistoryList = async function () {
        const tbody = document.getElementById('colHistoryTableBody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color:#64748b;">Loading cloud records...</td></tr>';

        try {
            let list = [];
            if (window.getDatabase && window.ref && window.get) {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_collection_records`));
                if (snap.exists()) {
                    list = Object.values(snap.val()).sort((a, b) => b.date.localeCompare(a.date));
                }
            }

            if (list.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px; color:#64748b;">No saved records found.</td></tr>';
                return;
            }

            tbody.innerHTML = '';
            list.forEach(item => {
                const grandTotal = item.totals?.grandTotal || 0;
                const tr = `
                    <tr>
                        <td style="font-weight:800;">${item.date}</td>
                        <td style="text-align:right;">${fmt(item.totals?.banking)}</td>
                        <td style="text-align:right;">${fmt(item.totals?.recharge)}</td>
                        <td style="text-align:right;">${fmt(item.totals?.services)}</td>
                        <td style="text-align:right; font-weight:800; color:#15803d;">${fmt(grandTotal)}</td>
                        <td style="text-align:center;">
                            <div style="display:inline-flex; align-items:center; gap:6px;">
                                <button onclick="window.loadCollectionDateToEdit('${item.date}')" class="dcol-btn" style="padding:2px 10px; font-size:10px;">
                                    Edit
                                </button>
                                <button onclick="window.printCollectionA4Report('${item.date}')" title="Print Detailed Report" class="dcol-icon-btn dcol-print-btn">
                                    <svg style="width:13px;height:13px;" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
                                </button>
                                <button onclick="window.deleteCollectionRecordFromHistory('${item.date}', ${grandTotal})" title="Delete Record" class="dcol-icon-btn dcol-delete-btn">
                                    <svg style="width:13px;height:13px;" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', tr);
            });
        } catch (e) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:15px; color:red;">Error: ${e.message}</td></tr>`;
        }
    };

    // ৯. হিস্ট্রি টেবিল থেকে নিরাপদ ডিলিট
    window.deleteCollectionRecordFromHistory = async function (dateStr, totalVal) {
        const confirmMsg = `⚠️ সতর্কবার্তা (Warning)!\n\nআপনি কি নিশ্চিত যে [ ${dateStr} ] তারিখের মোট ${fmt(totalVal)} টাকার হিসাবটি ক্লাউড থেকে স্থায়ীভাবে মুছে ফেলতে চান?\n\nমুছে ফেললে এটি আর কখনো ফিরিয়ে আনা যাবে না!`;
        
        if (!confirm(confirmMsg)) return;

        if (typeof window.showLoader === 'function') window.showLoader("Deleting record for " + dateStr);
        try {
            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`erp/daily_collection_records/${dateStr}`, null);
            }
            if (typeof window.showToast === 'function') {
                window.showToast(`Record for ${dateStr} deleted!`, "success");
            }
            
            const currentInputDate = document.getElementById('colInputDate')?.value;
            if (currentInputDate === dateStr) {
                window.resetCollectionInputs(false);
            }

            window.renderCollectionHistoryList();
        } catch (e) {
            alert("Delete Error: " + e.message);
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    window.loadCollectionDateToEdit = function (dateStr) {
        const dInput = document.getElementById('colInputDate');
        if (dInput) dInput.value = dateStr;
        window.switchAssetHubSubTab('collection');
        window.onCollectionDateChange();
    };

    // ১০. প্রিন্ট বাটন
    window.printActiveCollectionStatement = function () {
        const d = document.getElementById('colInputDate')?.value || getBDDateString();
        const liveRecord = {
            date: d,
            banking: {},
            recharge: {},
            services: {}
        };

        document.querySelectorAll('.inp-dyn-col').forEach(inp => {
            const headName = inp.dataset.headName;
            const cat = inp.dataset.headCat;
            const val = Math.max(0, parseFloat(inp.value) || 0);
            if (liveRecord[cat]) liveRecord[cat][headName] = val;
        });

        window.renderAndPrintInvoice(liveRecord);
    };

    window.printCollectionA4Report = async function (dateStr) {
        let record = null;
        if (window.getDatabase && window.ref && window.get) {
            const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_collection_records/${dateStr}`));
            if (snap.exists()) record = snap.val();
        }

        if (!record) {
            alert("No data found for date: " + dateStr);
            return;
        }

        window.renderAndPrintInvoice(record);
    };

    // ১১. ডাইনামিক প্রিন্ট রেন্ডারার
    window.renderAndPrintInvoice = function (record) {
        const dateHeader = document.getElementById('colRptDateHeader');
        if (dateHeader) dateHeader.innerText = `Date: ${record.date} | Shift: Counter Day Close | Verified`;

        let rowsHtml = '';
        let bSub = 0, rSub = 0, sSub = 0;

        // 1. Mobile Banking
        rowsHtml += `<tr class="col-rpt-sub-head"><td colspan="2">1. Mobile Banking Collection</td><td style="text-align:right;">Subtotal</td></tr>`;
        const bankingItems = record.banking || {};
        Object.keys(bankingItems).forEach(k => {
            const val = parseFloat(bankingItems[k]) || 0;
            bSub += val;
            rowsHtml += `<tr><td>Mobile Banking</td><td>${k}</td><td style="text-align:right;">${fmt(val)}</td></tr>`;
        });
        rowsHtml += `<tr style="font-weight:bold; background:#f8fafc;"><td colspan="2" style="text-align:right;">Banking Subtotal:</td><td style="text-align:right;">${fmt(bSub)}</td></tr>`;

        // 2. Recharge
        rowsHtml += `<tr class="col-rpt-sub-head"><td colspan="2">2. Operator Recharge Collection</td><td style="text-align:right;">Subtotal</td></tr>`;
        const rechargeItems = record.recharge || {};
        Object.keys(rechargeItems).forEach(k => {
            const val = parseFloat(rechargeItems[k]) || 0;
            rSub += val;
            rowsHtml += `<tr><td>Operators</td><td>${k}</td><td style="text-align:right;">${fmt(val)}</td></tr>`;
        });
        rowsHtml += `<tr style="font-weight:bold; background:#f8fafc;"><td colspan="2" style="text-align:right;">Recharge Subtotal:</td><td style="text-align:right;">${fmt(rSub)}</td></tr>`;

        // 3. Services
        rowsHtml += `<tr class="col-rpt-sub-head"><td colspan="2">3. Other Services Collection</td><td style="text-align:right;">Subtotal</td></tr>`;
        const serviceItems = record.services || {};
        Object.keys(serviceItems).forEach(k => {
            const val = parseFloat(serviceItems[k]) || 0;
            sSub += val;
            rowsHtml += `<tr><td>Services</td><td>${k}</td><td style="text-align:right;">${fmt(val)}</td></tr>`;
        });
        rowsHtml += `<tr style="font-weight:bold; background:#f8fafc;"><td colspan="2" style="text-align:right;">Service Subtotal:</td><td style="text-align:right;">${fmt(sSub)}</td></tr>`;

        // Grand Total
        const grandTotal = bSub + rSub + sSub;
        rowsHtml += `<tr class="col-rpt-grand-row"><td colspan="2">GRAND TOTAL REAL COLLECTION:</td><td style="text-align:right;">${fmt(grandTotal)}</td></tr>`;

        const contentEl = document.getElementById('colRptTableContent');
        if (contentEl) contentEl.innerHTML = rowsHtml;

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => {
                setTimeout(() => { window.print(); }, 200);
            });
        } else {
            setTimeout(() => { window.print(); }, 300);
        }
    };

    // ১২. Daily Income সমন্বয়
    function syncWithDailyIncomeView(realTotal) {
        const table = document.querySelector('.hub-inc-table tbody');
        if (!table) return;

        let realRow = document.getElementById('hub-inc-row-real');
        let diffRow = document.getElementById('hub-inc-row-diff');

        if (!realRow) {
            table.insertAdjacentHTML('beforeend', `
                <tr id="hub-inc-row-real" style="background:#f8fafc; font-weight:bold; border-top: 1.5px solid #cbd5e1;">
                    <td class="hub-lbl">Real Collection (Counter)</td>
                    <td class="hub-val" id="hubValRealCol" style="color:#4338ca;">৳ 0.00</td>
                </tr>
                <tr id="hub-inc-row-diff" style="background:#eff6ff; font-weight:bold;">
                    <td class="hub-lbl" style="display:flex; align-items:center; gap:8px;">
                        <span>Variance (Diff)</span>
                        <span id="hubVariancePill" style="font-size:9px; padding:2px 8px; border-radius:9999px; background:#dbeafe; color:#1e40af;">Matched</span>
                    </td>
                    <td class="hub-val" id="hubValVariance">৳ 0.00</td>
                </tr>
            `);
            realRow = document.getElementById('hub-inc-row-real');
            diffRow = document.getElementById('hub-inc-row-diff');
        }

        const netIncEl = document.getElementById('hubIncNetIncome');
        const netIncomeVal = netIncEl ? (parseFloat(netIncEl.innerText.replace(/[^0-9.-]+/g, "")) || 0) : 0;
        const diff = realTotal - netIncomeVal;

        const valRealEl = document.getElementById('hubValRealCol');
        if (valRealEl) valRealEl.innerText = fmt(realTotal);

        const pill = document.getElementById('hubVariancePill');
        const valDiffEl = document.getElementById('hubValVariance');

        if (pill && valDiffEl) {
            if (Math.abs(diff) < 0.01) {
                pill.innerText = "Matched";
                pill.style.background = "#dcfce7";
                pill.style.color = "#166534";
                valDiffEl.innerText = "৳ 0.00";
                valDiffEl.style.color = "#166534";
            } else if (diff > 0) {
                pill.innerText = "Surplus (+)";
                pill.style.background = "#dbeafe";
                pill.style.color = "#1e40af";
                valDiffEl.innerText = "(+) " + fmt(diff);
                valDiffEl.style.color = "#1d4ed8";
            } else {
                pill.innerText = "Shortage (-)";
                pill.style.background = "#fee2e2";
                pill.style.color = "#991b1b";
                valDiffEl.innerText = "(-) " + fmt(Math.abs(diff));
                valDiffEl.style.color = "#dc2626";
            }
        }
    }

    // ১৩. সাব-ট্যাব হ্যান্ডলার
    let isHooked = false;
    function hookSubTabSwitching() {
        if (isHooked) return;
        const origSwitch = window.switchAssetHubSubTab;
        window.switchAssetHubSubTab = function (tabType) {
            if (typeof origSwitch === 'function') {
                origSwitch(tabType);
            }

            const colSec = document.getElementById('hub-tab-collection');
            const colHistSec = document.getElementById('hub-tab-col-history');
            const floatBtn = document.getElementById('btnFloatingSaveCol');

            if (colSec) colSec.style.display = 'none';
            if (colHistSec) colHistSec.style.display = 'none';
            if (floatBtn) floatBtn.style.display = 'none';

            if (tabType === 'collection') {
                document.querySelectorAll('#menu-asset-hub-parent .submenu-item').forEach(i => i.classList.remove('active'));
                document.getElementById('sub-asset-collection')?.classList.add('active');
                if (colSec) colSec.style.display = 'block';
                if (floatBtn) floatBtn.style.display = 'flex';

                const dInp = document.getElementById('colInputDate');
                if (dInp && !dInp.value) {
                    dInp.value = getBDDateString();
                }
                window.rebuildCollectionFormUI();
                window.onCollectionDateChange();
            } else if (tabType === 'col-history') {
                document.querySelectorAll('#menu-asset-hub-parent .submenu-item').forEach(i => i.classList.remove('active'));
                document.getElementById('sub-asset-col-history')?.classList.add('active');
                if (colHistSec) colHistSec.style.display = 'block';
                window.renderCollectionHistoryList();
            }
        };
        isHooked = true;
    }

    function init() {
        injectSubmenus();
        injectViews();
        hookSubTabSwitching();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('load', init);

    let retries = 0;
    const safetyCheck = setInterval(() => {
        init();
        retries++;
        if (document.getElementById('hub-tab-collection') && retries >= 5) {
            clearInterval(safetyCheck);
        }
    }, 1000);

})();
