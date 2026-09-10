/**
 * Mousumi Computer ERP - Daily Liquid Balance & Physical Audit Module
 * File: daily_liquid_report_module.js
 * Feature: Standalone Realtime Sync, Permanent Snapshot, & Native Vector PDF Engine
 */

(function () {
    // ১. প্রয়োজনীয় সিএসএস ও প্রিন্ট ইঞ্জিন (প্রিন্ট সাদা হওয়া ফিক্সড)
    const moduleStyles = `
        <style id="liquid-report-styles">
            #liquid-audit-view { font-family: 'Tiro Bangla', serif !important; text-transform: none !important; }
            #liquid-audit-view * { font-family: 'Tiro Bangla', serif !important; text-transform: none !important; }
            
            .liquid-toolbar {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                padding: 12px 18px;
                margin-bottom: 18px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                flex-wrap: wrap;
                gap: 12px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.04);
            }
            .liquid-date-box { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.85rem; }
            .liquid-date-box input { height: 36px; border: 1px solid #94a3b8; border-radius: 6px; padding: 0 10px; font-size: 0.9rem; font-weight: 600; outline: none; background: #f8fafc; }
            .liquid-btn-group { display: flex; gap: 8px; }
            .liquid-btn { height: 36px; padding: 0 14px; border: 1px solid #000; border-radius: 6px; font-size: 0.8rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; background: #fff; color: #000; transition: 0.2s; }
            .liquid-btn:hover { background: #f1f5f9; }
            .liquid-btn-black { background: #000; color: #fff; }
            .liquid-btn-black:hover { background: #222; }
            .liquid-btn-save { background: #16a34a; color: #fff; border-color: #16a34a; }
            .liquid-btn-save:hover { background: #15803d; }

            .liquid-preview-container { background: #fff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 25px; overflow-x: auto; }
            #printable-liquid-doc { width: 100%; max-width: 760px; margin: 0 auto; background: #fff; color: #000; }
            
            .liquid-doc-header { text-align: center; border-bottom: 1.5px solid #000; padding-bottom: 5px; margin-bottom: 12px; }
            .liquid-doc-header h2 { font-size: 18px; font-weight: 800; line-height: 1.2; margin-bottom: 3px; }
            .liquid-doc-header h4 { font-size: 12px; font-weight: 700; margin-bottom: 3px; color: #1e293b; }
            .liquid-doc-header p { font-size: 10.5px; color: #475569; }

            .liquid-summary-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; border: 1.5px solid #000; }
            .liquid-summary-table th { background-color: #f1f5f9; border-bottom: 1.5px solid #000; padding: 5px 8px; font-size: 11.5px; font-weight: 800; text-align: left; }
            .liquid-summary-table td { padding: 4px 8px; font-size: 11px; border-bottom: 1px solid #e2e8f0; }
            .liquid-summary-total { background-color: #f8fafc; border-top: 1.5px solid #000; font-weight: 800; font-size: 12.5px; }

            .liquid-section-bar { font-size: 11px; font-weight: 800; background: #f1f5f9; border: 1px solid #000; padding: 4px 8px; margin-top: 12px; margin-bottom: 3px; }
            .liquid-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
            .liquid-table th, .liquid-table td { border: 1px solid #000; padding: 3.5px 6px !important; font-size: 11px; line-height: 1.2; }
            .liquid-table th { background-color: #f8fafc; font-weight: 700; text-align: left; }
            
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            .bold { font-weight: 700; }

            .liquid-footer { display: flex; justify-content: space-between; margin-top: 35px; padding-top: 5px; }
            .liquid-sign-box { width: 130px; border-top: 1px solid #000; text-align: center; font-size: 9.5px; font-weight: 700; padding-top: 3px; }

            /* =========================================================
               গুরুত্বপূর্ণ ফিক্স: মূল ফাইলের হাইড রুলকে ওভাররাইড করা
               ========================================================= */
            @media print {
                @page { size: A4 portrait; margin: 10mm; }
                
                /* মূল admin.html এর হাইড রুল ওভাররাইড */
                body * {
                    visibility: hidden !important;
                }

                /* শুধুমাত্র আমাদের এই রিপোর্ট এলাকাটিকে দৃশ্যমান করা */
                #printable-liquid-doc, #printable-liquid-doc * {
                    visibility: visible !important;
                }

                #printable-liquid-doc {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    background: #ffffff !important;
                    display: block !important;
                }

                /* পেজ ব্রেক সুরক্ষা */
                tr { page-break-inside: avoid !important; break-inside: avoid !important; }
                thead { display: table-header-group !important; }
                .liquid-section-bar { page-break-after: avoid !important; break-after: avoid !important; }
                .liquid-footer { page-break-inside: avoid !important; break-inside: avoid !important; }
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', moduleStyles);

    // ২. সাইডবারে নতুন ড্রপডাউন মেনু যুক্ত করা
    function injectSidebarMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-report-hub-parent')) return;

        const menuItemHTML = `
            <li class="menu-item" id="menu-report-hub-parent">
                <a onclick="window.toggleParentMenu('menu-report-hub-parent')">
                    <span class="menu-link-inner"><i class="fa-solid fa-file-invoice"></i> <span>Report Center</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item active" id="sub-liquid-report">
                        <a onclick="window.switchMainTab('liquid-audit')"><i class="fa-solid fa-angle-right"></i> <span>Daily Liquid Audit</span></a>
                    </li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', menuItemHTML);
    }

    // ৩. মূল ভিউ প্যানেল ইনজেক্ট করা
    function injectViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('liquid-audit-view')) return;

        const viewPanelHTML = `
            <div class="view-panel" id="liquid-audit-view">
                <div class="liquid-toolbar">
                    <div class="liquid-date-box">
                        <label for="liquidStatementDate"><i class="fa-solid fa-calendar-day"></i> Select Statement Date:</label>
                        <input type="date" id="liquidStatementDate" onchange="window.renderLiquidStatementReport()">
                    </div>
                    <div class="liquid-btn-group">
                        <button class="liquid-btn" onclick="window.renderLiquidStatementReport()"><i class="fa-solid fa-rotate-right"></i> Reload</button>
                        <button class="liquid-btn liquid-btn-save" onclick="window.archiveCurrentLiquidSnapshot()"><i class="fa-solid fa-lock"></i> Lock / Save Snapshot</button>
                        <button class="liquid-btn liquid-btn-black" onclick="window.printLiquidVectorPDF()"><i class="fa-solid fa-file-pdf"></i> Save Vector PDF</button>
                        <button class="liquid-btn" onclick="window.exportLiquidExcel()"><i class="fa-solid fa-file-excel"></i> Export Excel</button>
                    </div>
                </div>
                <div class="liquid-preview-container">
                    <div id="printable-liquid-doc">
                        <!-- Dynamic Report Populated Here -->
                    </div>
                </div>
            </div>
        `;
        mainWrapper.insertAdjacentHTML('beforeend', viewPanelHTML);
    }

    const fmt = (n) => (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // ৪. লাইভ ব্যালেন্স ও স্থায়ী স্ন্যাপশট রেন্ডারার
    window.renderLiquidStatementReport = async function () {
        const target = document.getElementById('printable-liquid-doc');
        const dateInput = document.getElementById('liquidStatementDate');
        if (!target || !dateInput) return;

        const selectedDate = dateInput.value || new Date().toISOString().split('T')[0];

        // লাইভ ডাটা রিড করা
        const cats = window.categories || [];
        const accs = window.accounts || [];
        const balances = window.balanceStore || {};
        const cashQtys = window.cashQuantities || { 1000: 0, 500: 0, 200: 0, 100: 0, 50: 0, 20: 0, 10: 0, 5: 0, 2: 0 };
        const cashOthers = window.cashOthersAmount || 0;
        const cardConfig = window.cardConfig || {};
        const cardQtys = window.cardQuantities || {};

        let bankTotal = 0, personalTotal = 0, agentTotal = 0, rechargeTotal = 0;
        let detailedAccountsRows = '';
        let sl = 1;

        // অ্যাকাউন্টস গ্রুপিং
        cats.filter(c => c.enabled !== false).sort((a,b) => a.order - b.order).forEach(cat => {
            const catAccs = accs.filter(a => a.catId === cat.id && a.enabled !== false);
            if (catAccs.length === 0) return;

            let catSum = 0;
            detailedAccountsRows += `<tr style="background:#fafafa; font-weight:700;"><td colspan="3">${cat.name}</td></tr>`;

            catAccs.forEach(acc => {
                const bal = parseFloat(balances[acc.id]) || 0;
                catSum += bal;
                detailedAccountsRows += `
                    <tr>
                        <td class="text-center" style="width: 8%;">${sl++}</td>
                        <td>${acc.name}</td>
                        <td class="text-right bold">${fmt(bal)}</td>
                    </tr>
                `;
            });

            const catNameLower = cat.name.toLowerCase();
            if (catNameLower.includes('bank')) bankTotal += catSum;
            else if (catNameLower.includes('personal')) personalTotal += catSum;
            else if (catNameLower.includes('agent')) agentTotal += catSum;
            else if (catNameLower.includes('recharge')) rechargeTotal += catSum;

            detailedAccountsRows += `
                <tr style="background:#fcfcfc; font-weight:700;">
                    <td colspan="2" class="text-right">Subtotal (${cat.name}):</td>
                    <td class="text-right bold">${fmt(catSum)}</td>
                </tr>
            `;
        });

        // ক্যাশ নোটস বিবরণ
        let totalCash = 0;
        let cashRows = '';
        [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(note => {
            const q = parseInt(cashQtys[note]) || 0;
            const line = q * note;
            totalCash += line;
            cashRows += `
                <tr>
                    <td>৳ ${note} Notes</td>
                    <td class="text-center">${q}</td>
                    <td class="text-right bold">${fmt(line)}</td>
                </tr>
            `;
        });
        totalCash += cashOthers;
        cashRows += `
            <tr>
                <td>Coins & Loose Change</td>
                <td class="text-center">-</td>
                <td class="text-right bold">${fmt(cashOthers)}</td>
            </tr>
        `;

        // কার্ডস বিবরণ
        let totalCardsValue = 0;
        let totalCardsQty = 0;
        let cardRows = '';
        let cardSl = 1;

        ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
            const opCards = cardConfig[op] || [];
            const opQtys = cardQtys[op] || {};
            opCards.filter(c => c.active !== false).forEach(c => {
                const q = parseInt(opQtys[c.id]) || 0;
                const line = q * (c.price || 0);
                totalCardsQty += q;
                totalCardsValue += line;
                cardRows += `
                    <tr>
                        <td class="text-center" style="width: 8%;">${cardSl++}</td>
                        <td>${op} - ${c.name}</td>
                        <td class="text-center">৳ ${c.price}</td>
                        <td class="text-center">${q}</td>
                        <td class="text-right bold">${fmt(line)}</td>
                    </tr>
                `;
            });
        });

        const grandTotalLiquid = bankTotal + personalTotal + agentTotal + rechargeTotal + totalCash + totalCardsValue;

        target.innerHTML = `
            <div class="liquid-doc-header">
                <h2>Mousumi Computer</h2>
                <h4>Daily Liquid Balance & Physical Assets Statement</h4>
                <p>Statement Date: ${selectedDate} | Prepared Time: ${new Date().toLocaleTimeString()}</p>
            </div>

            <!-- 1. EXECUTIVE SUMMARY TABLE -->
            <table class="liquid-summary-table">
                <thead>
                    <tr>
                        <th style="width: 70%;">Liquid Asset Head (Summary)</th>
                        <th style="width: 30%;" class="text-right">Balance Amount (৳)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Bank Accounts Balance</td><td class="text-right bold">${fmt(bankTotal)}</td></tr>
                    <tr><td>Personal Accounts Balance</td><td class="text-right bold">${fmt(personalTotal)}</td></tr>
                    <tr><td>Agent Accounts Balance</td><td class="text-right bold">${fmt(agentTotal)}</td></tr>
                    <tr><td>Recharge Balances</td><td class="text-right bold">${fmt(rechargeTotal)}</td></tr>
                    <tr><td>Physical Cash in Drawer</td><td class="text-right bold">${fmt(totalCash)}</td></tr>
                    <tr><td>Recharge Cards Stock Value</td><td class="text-right bold">${fmt(totalCardsValue)}</td></tr>
                    <tr class="liquid-summary-total">
                        <td class="text-right">Total Liquid Balance in Hand:</td>
                        <td class="text-right" style="color: #000; font-size: 13px;">${fmt(grandTotalLiquid)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 2. DETAILED BREAKDOWN: ACCOUNTS -->
            <div class="liquid-section-bar">1. Bank & Digital Accounts Breakdown</div>
            <table class="liquid-table">
                <thead>
                    <tr>
                        <th style="width: 8%;" class="text-center">Sl</th>
                        <th style="width: 62%;">Account Name</th>
                        <th style="width: 30%;" class="text-right">Balance (৳)</th>
                    </tr>
                </thead>
                <tbody>
                    ${detailedAccountsRows || '<tr><td colspan="3" class="text-center">No accounts found.</td></tr>'}
                </tbody>
            </table>

            <!-- 3. DETAILED BREAKDOWN: CASH DRAWER -->
            <div class="liquid-section-bar">2. Physical Cash Drawer Notes Audit</div>
            <table class="liquid-table">
                <thead>
                    <tr>
                        <th style="width: 50%;">Denomination Note</th>
                        <th style="width: 20%;" class="text-center">Count (Qty)</th>
                        <th style="width: 30%;" class="text-right">Total Amount (৳)</th>
                    </tr>
                </thead>
                <tbody>
                    ${cashRows}
                    <tr style="background:#f8fafc; font-weight:700;">
                        <td colspan="2" class="text-right">Total Physical Cash:</td>
                        <td class="text-right bold">${fmt(totalCash)}</td>
                    </tr>
                </tbody>
            </table>

            <!-- 4. DETAILED BREAKDOWN: CARDS INVENTORY -->
            <div class="liquid-section-bar">3. Recharge & SIM Cards Inventory Audit</div>
            <table class="liquid-table">
                <thead>
                    <tr>
                        <th style="width: 8%;" class="text-center">Sl</th>
                        <th style="width: 42%;">Card Item</th>
                        <th style="width: 15%;" class="text-center">Rate (৳)</th>
                        <th style="width: 15%;" class="text-center">Qty</th>
                        <th style="width: 20%;" class="text-right">Total (৳)</th>
                    </tr>
                </thead>
                <tbody>
                    ${cardRows || '<tr><td colspan="5" class="text-center">No cards configured.</td></tr>'}
                    <tr style="background:#f8fafc; font-weight:700;">
                        <td colspan="3" class="text-right">Total Cards Stock (${totalCardsQty} Pcs):</td>
                        <td colspan="2" class="text-right bold">${fmt(totalCardsValue)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="liquid-footer">
                <div class="liquid-sign-box">Prepared By</div>
                <div class="liquid-sign-box">Audited By</div>
                <div class="liquid-sign-box">Proprietor Sign</div>
            </div>
        `;
    };

    // ৫. আজকের স্ন্যাপশট স্থায়ীভাবে ফায়ারবেসে সেভ করা
    window.archiveCurrentLiquidSnapshot = async function () {
        const d = document.getElementById('liquidStatementDate').value || new Date().toISOString().split('T')[0];
        if (typeof window.showLoader === 'function') window.showLoader("Archiving daily snapshot...");

        try {
            const snapshotObj = {
                date: d,
                timestamp: Date.now(),
                balances: { ...(window.balanceStore || {}) },
                cash: { ...(window.cashQuantities || {}), others: window.cashOthersAmount || 0 },
                cards: { ...(window.cardQuantities || {}) }
            };

            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`erp/daily_balance_snapshots/${d}`, snapshotObj);
            }
            if (typeof window.showToast === 'function') {
                window.showToast(`Snapshot permanently archived for ${d}!`, "success");
            } else {
                alert(`Snapshot permanently archived for ${d}!`);
            }
        } catch (e) {
            console.error("Archive Error:", e);
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ৬. প্রিন্ট ও এক্সেল
    window.printLiquidVectorPDF = function () {
        window.print();
    };

    window.exportLiquidExcel = function () {
        const d = document.getElementById('liquidStatementDate').value || new Date().toISOString().split('T')[0];
        const wb = XLSX.utils.book_new();
        const tables = document.querySelectorAll("#printable-liquid-doc table");
        const names = ["Summary", "Accounts", "Cash_Drawer", "Card_Stock"];
        tables.forEach((t, i) => {
            const ws = XLSX.utils.table_to_sheet(t);
            XLSX.utils.book_append_sheet(wb, ws, names[i] || `Sheet_${i+1}`);
        });
        XLSX.writeFile(wb, `Liquid_Statement_${d}.xlsx`);
    };

    // ৭. ইনিশিয়ালাইজেশন
    function init() {
        injectSidebarMenu();
        injectViewPanel();
        const dInput = document.getElementById('liquidStatementDate');
        if (dInput) dInput.value = new Date().toISOString().split('T')[0];
        
        // অটো রেন্ডার লোড
        setTimeout(() => {
            if (typeof window.renderLiquidStatementReport === 'function') {
                window.renderLiquidStatementReport();
            }
        }, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
