/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - DAILY COUNTER COLLECTION & AUDIT MODULE
 * File: daily_collection_module.js
 * 
 * Features:
 * 1. 100% English Typography (Google Tiro Bangla).
 * 2. Permanent Firebase Cloud Storage (erp/daily_collection_records/{date}).
 * 3. Minimal Circular / Pill UI & Dedicated Floating Save Button.
 * 4. Official 1-Page A4 Printable Detailed Collection Statement.
 * 5. Integrated Audit Discrepancy (Asset Income vs Real Collection).
 * ============================================================================
 */

(function () {
    "use strict";

    // ১. সিএসএস ও প্রিন্ট স্টাইল ইনজেকশন
    const moduleStyles = `
        <style id="collection-module-styles">
            @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

            #hub-tab-collection *, #hub-tab-col-history *, #col-printable-invoice * {
                font-family: 'Tiro Bangla', serif !important;
                box-sizing: border-box;
            }

            /* Floating Pill Save Button */
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
            .col-floating-save-btn:hover {
                background: #1e293b;
                transform: scale(1.04);
            }

            /* Dedicated A4 Print Setup */
            #col-printable-invoice { display: none; }

            @media print {
                body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
                aside, main, .no-print, .col-floating-save-btn, .hub-floating-btn { display: none !important; }
                
                #col-printable-invoice {
                    display: block !important;
                    width: 100% !important;
                    max-width: 680px !important;
                    margin: 0 auto !important;
                    padding: 15mm 10mm !important;
                    color: #000 !important;
                    font-size: 12px !important;
                    font-family: 'Tiro Bangla', serif !important;
                }

                .col-rpt-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    margin-bottom: 15px;
                }
                .col-rpt-table th, .col-rpt-table td {
                    border: 1px solid #000 !important;
                    padding: 5px 8px !important;
                    font-size: 11.5px !important;
                }
                .col-rpt-table th {
                    background: #f1f5f9 !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .col-rpt-sub-head {
                    background: #f8fafc !important;
                    font-weight: bold;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .col-rpt-grand-row {
                    background: #e2e8f0 !important;
                    font-weight: bold;
                    font-size: 13px !important;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', moduleStyles);

    const fmt = (n) => '৳ ' + (Number(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // ২. সাইডবারে নতুন দুটি মেনু আইটেম যুক্ত করা
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

    // ৩. ভিউ কনটেন্ট (Daily Collection Form & Collection History Table) ইনজেকশন
    function injectViews() {
        const hubView = document.getElementById('asset-hub-view');
        if (!hubView || document.getElementById('hub-tab-collection')) return;

        const viewsHTML = `
            <!-- SUB-TAB: DAILY COLLECTION -->
            <div id="hub-tab-collection" style="display: none;" class="space-y-3 print-area">
                
                <!-- Date Bar Minimal -->
                <div class="bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center justify-between">
                    <div class="flex items-center gap-2 text-xs font-bold text-slate-600">
                        <span>Date:</span>
                        <input type="date" id="colInputDate" class="border border-slate-200 rounded-full px-2.5 py-0.5 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500" onchange="window.onCollectionDateChange()">
                    </div>
                    <div class="text-xs font-bold text-slate-800">
                        Live Total: <span class="text-indigo-600 font-extrabold" id="colLiveGrandTotal">৳ 0.00</span>
                    </div>
                </div>

                <!-- 3-Column Compact Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    
                    <!-- Col 1: Banking -->
                    <div class="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between shadow-sm">
                        <div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Mobile Banking</div>
                            <div class="space-y-1.5 text-xs">
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">bKash</span>
                                    <input type="number" id="col_bkash" oninput="window.calculateCollectionLive()" class="inp-col-bank w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Nagad</span>
                                    <input type="number" id="col_nagad" oninput="window.calculateCollectionLive()" class="inp-col-bank w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Rocket</span>
                                    <input type="number" id="col_rocket" oninput="window.calculateCollectionLive()" class="inp-col-bank w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Tap</span>
                                    <input type="number" id="col_tap" oninput="window.calculateCollectionLive()" class="inp-col-bank w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Cant Public</span>
                                    <input type="number" id="col_cant" oninput="window.calculateCollectionLive()" class="inp-col-bank w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                            </div>
                        </div>
                        <div class="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 flex items-center justify-between mt-2">
                            <span class="text-[10px] font-bold text-blue-800 uppercase">Sub</span>
                            <span id="colBankSubtotal" class="text-xs font-bold text-blue-800">৳ 0.00</span>
                        </div>
                    </div>

                    <!-- Col 2: Recharge -->
                    <div class="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between shadow-sm">
                        <div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Recharge</div>
                            <div class="space-y-1.5 text-xs">
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Grameen-1</span>
                                    <input type="number" id="col_gp1" oninput="window.calculateCollectionLive()" class="inp-col-recharge w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Grameen-2</span>
                                    <input type="number" id="col_gp2" oninput="window.calculateCollectionLive()" class="inp-col-recharge w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Banglalink</span>
                                    <input type="number" id="col_bl" oninput="window.calculateCollectionLive()" class="inp-col-recharge w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Robi</span>
                                    <input type="number" id="col_robi" oninput="window.calculateCollectionLive()" class="inp-col-recharge w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Airtel</span>
                                    <input type="number" id="col_airtel" oninput="window.calculateCollectionLive()" class="inp-col-recharge w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                            </div>
                        </div>
                        <div class="bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200 flex items-center justify-between mt-2">
                            <span class="text-[10px] font-bold text-indigo-800 uppercase">Sub</span>
                            <span id="colRechargeSubtotal" class="text-xs font-bold text-indigo-800">৳ 0.00</span>
                        </div>
                    </div>

                    <!-- Col 3: Services -->
                    <div class="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 flex flex-col justify-between shadow-sm">
                        <div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">Services</div>
                            <div class="space-y-1.5 text-xs">
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Photocopy</span>
                                    <input type="number" id="col_photo" oninput="window.calculateCollectionLive()" class="inp-col-service w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Computer</span>
                                    <input type="number" id="col_comp" oninput="window.calculateCollectionLive()" class="inp-col-service w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                                <div class="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                    <span class="font-bold text-slate-700">Others</span>
                                    <input type="number" id="col_oth" oninput="window.calculateCollectionLive()" class="inp-col-service w-20 px-2 py-0.5 bg-white border border-slate-200 rounded-full text-right font-bold text-xs outline-none focus:border-indigo-500" placeholder="0.00">
                                </div>
                            </div>
                        </div>
                        <div class="bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 flex items-center justify-between mt-2">
                            <span class="text-[10px] font-bold text-amber-800 uppercase">Sub</span>
                            <span id="colServiceSubtotal" class="text-xs font-bold text-amber-800">৳ 0.00</span>
                        </div>
                    </div>

                </div>

                <!-- Action Bar -->
                <div class="bg-white px-4 py-2.5 rounded-full border border-slate-200 shadow-sm flex items-center justify-between flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Collection:</span>
                        <span id="colGrandTotalBottom" class="text-sm font-extrabold text-indigo-700">৳ 0.00</span>
                    </div>

                    <div class="flex items-center gap-2 no-print">
                        <button onclick="window.resetCollectionInputs()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-1 rounded-full transition flex items-center gap-1.5">
                            <svg class="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                            Reset
                        </button>
                        <button onclick="window.printActiveCollectionStatement()" class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-1 rounded-full transition flex items-center gap-1.5 border border-slate-300">
                            <svg class="w-3 h-3 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                            PDF
                        </button>
                    </div>
                </div>

            </div>

            <!-- SUB-TAB: COLLECTION HISTORY -->
            <div id="hub-tab-col-history" style="display: none;" class="space-y-3">
                <div class="bg-white p-3 rounded-full border border-slate-200 flex justify-between items-center text-xs font-bold shadow-sm">
                    <span>Archived Records</span>
                    <button onclick="window.renderCollectionHistoryList()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full flex items-center gap-1 text-[11px]">
                        Reload
                    </button>
                </div>

                <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <table class="w-full text-xs text-left">
                        <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                            <tr>
                                <th class="p-2.5">Date</th>
                                <th class="p-2.5 text-right">Banking</th>
                                <th class="p-2.5 text-right">Recharge</th>
                                <th class="p-2.5 text-right">Service</th>
                                <th class="p-2.5 text-right">Total</th>
                                <th class="p-2.5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody id="colHistoryTableBody" class="divide-y divide-slate-100 font-semibold text-slate-700">
                            <tr><td colspan="6" style="text-align:center; padding: 20px; color:#64748b;">Loading collection records...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Floating Save Button -->
            <button class="col-floating-save-btn no-print" id="btnFloatingSaveCol" onclick="window.saveDailyCollectionToFirebase()">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                <span>Save</span>
            </button>

            <!-- A4 Printable Document Container -->
            <div id="col-printable-invoice">
                <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">Mousumi Computer</h1>
                    <h3 style="margin: 3px 0 0 0; font-size: 13px; font-weight: 700; text-transform: uppercase;">Daily Collection & Counter Income Statement</h3>
                    <div style="font-size: 11px; margin-top: 4px; color: #333;" id="colRptDateHeader">Date: --- | Shift: Counter Day Close</div>
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

                <div style="margin-top: 50px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="width: 170px; text-align: center;">
                        <div style="border-top: 1px solid #000; margin-bottom: 4px;"></div>
                        <div style="font-size: 11px; font-weight: bold;">Prepared By</div>
                    </div>
                    <div style="font-size: 10px; color: #555;">Generated from Mousumi ERP</div>
                    <div style="width: 170px; text-align: center;">
                        <div style="border-top: 1px solid #000; margin-bottom: 4px;"></div>
                        <div style="font-size: 11px; font-weight: bold;">Authorized Signature</div>
                    </div>
                </div>
            </div>
        `;

        hubView.insertAdjacentHTML('beforeend', viewsHTML);
    }

    // ৪. লাইভ ক্যালকুলেশন
    function sumClass(cls) {
        let sum = 0;
        document.querySelectorAll(cls).forEach(i => {
            const v = parseFloat(i.value) || 0;
            sum += v;
        });
        return sum;
    }

    window.calculateCollectionLive = function () {
        const bTot = sumClass('.inp-col-bank');
        const rTot = sumClass('.inp-col-recharge');
        const sTot = sumClass('.inp-col-service');
        const grand = bTot + rTot + sTot;

        const setT = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = fmt(val); };
        setT('colBankSubtotal', bTot);
        setT('colRechargeSubtotal', rTot);
        setT('colServiceSubtotal', sTot);
        setT('colGrandTotalBottom', grand);
        setT('colLiveGrandTotal', grand);

        // Daily Income ভিউতে সরাসরি আপডেট পাঠানো
        syncWithDailyIncomeView(grand);
    };

    // ৫. ফায়ারবেসে স্থায়ীভাবে সংরক্ষণ (Permanent Cloud Sync)
    window.saveDailyCollectionToFirebase = async function () {
        const d = document.getElementById('colInputDate')?.value || new Date().toISOString().split('T')[0];
        if (typeof window.showLoader === 'function') window.showLoader("Saving Collection to Firebase...");

        const payload = {
            date: d,
            timestamp: Date.now(),
            updatedAt: new Date().toLocaleString(),
            banking: {
                'bKash': parseFloat(document.getElementById('col_bkash')?.value) || 0,
                'Nagad': parseFloat(document.getElementById('col_nagad')?.value) || 0,
                'Rocket': parseFloat(document.getElementById('col_rocket')?.value) || 0,
                'Tap': parseFloat(document.getElementById('col_tap')?.value) || 0,
                'Cant Public': parseFloat(document.getElementById('col_cant')?.value) || 0
            },
            recharge: {
                'Grameen-1': parseFloat(document.getElementById('col_gp1')?.value) || 0,
                'Grameen-2': parseFloat(document.getElementById('col_gp2')?.value) || 0,
                'Banglalink': parseFloat(document.getElementById('col_bl')?.value) || 0,
                'Robi': parseFloat(document.getElementById('col_robi')?.value) || 0,
                'Airtel': parseFloat(document.getElementById('col_airtel')?.value) || 0
            },
            services: {
                'Photocopy': parseFloat(document.getElementById('col_photo')?.value) || 0,
                'Computer': parseFloat(document.getElementById('col_comp')?.value) || 0,
                'Others': parseFloat(document.getElementById('col_oth')?.value) || 0
            }
        };

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
                window.showToast("Saved to Firebase!", "success");
            }
        } catch (e) {
            console.error("Save error:", e);
            if (typeof window.showToast === 'function') window.showToast("Save Error: " + e.message, "error");
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ৬. তারিখ পরিবর্তন হলে ফায়ারবেস থেকে স্বয়ংক্রিয়ভাবে লোড
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

            if (record) {
                setInp('col_bkash', record.banking?.['bKash']);
                setInp('col_nagad', record.banking?.['Nagad']);
                setInp('col_rocket', record.banking?.['Rocket']);
                setInp('col_tap', record.banking?.['Tap']);
                setInp('col_cant', record.banking?.['Cant Public']);

                setInp('col_gp1', record.recharge?.['Grameen-1']);
                setInp('col_gp2', record.recharge?.['Grameen-2']);
                setInp('col_bl', record.recharge?.['Banglalink']);
                setInp('col_robi', record.recharge?.['Robi']);
                setInp('col_airtel', record.recharge?.['Airtel']);

                setInp('col_photo', record.services?.['Photocopy']);
                setInp('col_comp', record.services?.['Computer']);
                setInp('col_oth', record.services?.['Others']);
            } else {
                window.resetCollectionInputs(false);
            }

            window.calculateCollectionLive();
        } catch (e) {
            console.error("Fetch error:", e);
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    function setInp(id, val) {
        const el = document.getElementById(id);
        if (el) el.value = (val && val !== 0) ? val : '';
    }

    window.resetCollectionInputs = function (showConfirm = true) {
        if (!showConfirm || confirm("Reset all collection inputs to 0.00?")) {
            document.querySelectorAll('.inp-col-bank, .inp-col-recharge, .inp-col-service').forEach(i => i.value = '');
            window.calculateCollectionLive();
        }
    };

    // ৭. হিস্ট্রি টেবিল লোড
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
                const tr = `
                    <tr>
                        <td class="p-2.5 font-bold">${item.date}</td>
                        <td class="p-2.5 text-right">${fmt(item.totals?.banking)}</td>
                        <td class="p-2.5 text-right">${fmt(item.totals?.recharge)}</td>
                        <td class="p-2.5 text-right">${fmt(item.totals?.services)}</td>
                        <td class="p-2.5 text-right font-bold text-emerald-700">${fmt(item.totals?.grandTotal)}</td>
                        <td class="p-2.5 text-center">
                            <div class="inline-flex items-center gap-1.5">
                                <button onclick="window.loadCollectionDateToEdit('${item.date}')" class="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-full text-[10px] font-bold text-slate-700 transition">
                                    Edit
                                </button>
                                <button onclick="window.printCollectionA4Report('${item.date}')" title="Print Detailed Report" class="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
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

    window.loadCollectionDateToEdit = function (dateStr) {
        const dInput = document.getElementById('colInputDate');
        if (dInput) dInput.value = dateStr;
        window.switchAssetHubSubTab('collection');
        window.onCollectionDateChange();
    };

    // ৮. ১ পাতার অফিসিয়াল A4 ডিটেইল্ড স্টেটমেন্ট প্রিন্ট ইঞ্জিন
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

        document.getElementById('colRptDateHeader').innerText = `Date: ${record.date} | Shift: Counter Day Close | Verified`;

        let rowsHtml = '';
        let bSub = 0, rSub = 0, sSub = 0;

        // Banking
        rowsHtml += `<tr class="col-rpt-sub-head"><td colspan="2">1. Mobile Banking Collection</td><td style="text-align:right;">Subtotal</td></tr>`;
        for (let k in record.banking) {
            const val = record.banking[k] || 0;
            bSub += val;
            rowsHtml += `<tr><td>Mobile Banking</td><td>${k}</td><td style="text-align:right;">${fmt(val)}</td></tr>`;
        }
        rowsHtml += `<tr style="font-weight:bold; background:#f8fafc;"><td colspan="2" style="text-align:right;">Banking Subtotal:</td><td style="text-align:right;">${fmt(bSub)}</td></tr>`;

        // Recharge
        rowsHtml += `<tr class="col-rpt-sub-head"><td colspan="2">2. Operator Recharge Collection</td><td style="text-align:right;">Subtotal</td></tr>`;
        for (let k in record.recharge) {
            const val = record.recharge[k] || 0;
            rSub += val;
            rowsHtml += `<tr><td>Operators</td><td>${k}</td><td style="text-align:right;">${fmt(val)}</td></tr>`;
        }
        rowsHtml += `<tr style="font-weight:bold; background:#f8fafc;"><td colspan="2" style="text-align:right;">Recharge Subtotal:</td><td style="text-align:right;">${fmt(rSub)}</td></tr>`;

        // Services
        rowsHtml += `<tr class="col-rpt-sub-head"><td colspan="2">3. Other Services Collection</td><td style="text-align:right;">Subtotal</td></tr>`;
        for (let k in record.services) {
            const val = record.services[k] || 0;
            sSub += val;
            rowsHtml += `<tr><td>Services</td><td>${k}</td><td style="text-align:right;">${fmt(val)}</td></tr>`;
        }
        rowsHtml += `<tr style="font-weight:bold; background:#f8fafc;"><td colspan="2" style="text-align:right;">Service Subtotal:</td><td style="text-align:right;">${fmt(sSub)}</td></tr>`;

        // Grand Total
        const grandTotal = bSub + rSub + sSub;
        rowsHtml += `<tr class="col-rpt-grand-row"><td colspan="2">GRAND TOTAL REAL COLLECTION:</td><td style="text-align:right;">${fmt(grandTotal)}</td></tr>`;

        document.getElementById('colRptTableContent').innerHTML = rowsHtml;

        setTimeout(() => {
            window.print();
        }, 150);
    };

    window.printActiveCollectionStatement = function () {
        const d = document.getElementById('colInputDate')?.value || new Date().toISOString().split('T')[0];
        window.saveDailyCollectionToFirebase().then(() => {
            window.printCollectionA4Report(d);
        });
    };

    // ৯. Daily Income পেজে সমন্বয় (Reconciliation Integration)
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

    // ১০. সাব-ট্যাব হ্যান্ডলার এক্সটেনশন
    function hookSubTabSwitching() {
        const origSwitch = window.switchAssetHubSubTab;
        window.switchAssetHubSubTab = function (tabType) {
            // আসল ফাংশন এক্সিকিউট
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
                    dInp.value = new Date().toISOString().split('T')[0];
                }
                window.onCollectionDateChange();
            } else if (tabType === 'col-history') {
                document.querySelectorAll('#menu-asset-hub-parent .submenu-item').forEach(i => i.classList.remove('active'));
                document.getElementById('sub-asset-col-history')?.classList.add('active');
                if (colHistSec) colHistSec.style.display = 'block';
                window.renderCollectionHistoryList();
            }
        };
    }

    // ইনিশিয়ালাইজেশন
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
    setInterval(() => {
        injectSubmenus();
        injectViews();
    }, 1000);

})();
