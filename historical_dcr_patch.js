/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - FUTURE-PROOF HISTORICAL SNAPSHOT ENGINE
 * File: historical_dcr_patch.js
 * ============================================================================
 */

(function () {
    "use strict";

    console.log("[Historical DCR Patch] Engine activated. Full breakdown capture enabled.");

    const toEnMoney = (val) => Number(val || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const escapeHTML = (str) => String(str ?? "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);

    // ১. প্রতিদিন ক্লোজ করার সময় ফুল ব্রেকডাউন স্ন্যাপশট তৈরি নিশ্চিত করা
    function captureCurrentFullSnapshot(rDate) {
        const categories = window.categories || [];
        const accounts = window.accounts || [];
        const balanceStore = window.balanceStore || {};
        const cardConfig = window.cardConfig || {};
        const cardQuantities = window.cardQuantities || {};
        const cashQuantities = window.cashQuantities || {};
        const cashOthers = Number(window.cashOthersAmount) || 0;

        const getCatDetails = (matchNames) => {
            const list = [];
            let total = 0;
            const matchedCats = categories.filter(c => matchNames.some(m => (c.name || '').toLowerCase().includes(m.toLowerCase())));
            matchedCats.forEach(cat => {
                accounts.filter(a => a.catId === cat.id && a.enabled !== false).forEach(acc => {
                    const bal = parseFloat(balanceStore[acc.id]) || 0;
                    total += bal;
                    if (bal > 0) list.push({ name: acc.name, balance: bal });
                });
            });
            return { list, total };
        };

        const bankAccounts = getCatDetails(['bank']);
        const personalAccounts = getCatDetails(['personal']);
        const agentAccounts = getCatDetails(['agent']);
        const rechargeBalances = getCatDetails(['recharge']);

        // ক্যাশ
        const cashRows = [];
        let totalCash = 0;
        [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(denom => {
            const qty = parseInt(cashQuantities[denom], 10) || 0;
            const amt = qty * denom;
            totalCash += amt;
            if (qty > 0) cashRows.push({ note: `৳ ${denom} Notes`, qty, amount: amt });
        });
        if (cashOthers > 0) {
            totalCash += cashOthers;
            cashRows.push({ note: "Others / Coins", qty: 1, amount: cashOthers });
        }

        // কার্ড
        const cardRows = [];
        let totalCard = 0;
        ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
            const cards = Array.isArray(cardConfig[op]) ? cardConfig[op] : Object.values(cardConfig[op] || {});
            const qMap = cardQuantities[op] || {};
            cards.filter(c => c.active !== false).forEach(c => {
                const q = parseInt(qMap[c.id], 10) || 0;
                const amt = q * (c.price || 0);
                totalCard += amt;
                if (q > 0) cardRows.push({ name: `${op} ${c.name}`, qty: q, total: amt });
            });
        });

        return {
            bankAccounts,
            personalAccounts,
            agentAccounts,
            rechargeBalances,
            cashInventory: { rows: cashRows, total: totalCash },
            cardInventory: { rows: cardRows, total: totalCard },
            summary: {
                totalCash,
                totalCard,
                totalBank: bankAccounts.total,
                totalPersonal: personalAccounts.total,
                totalAgent: agentAccounts.total,
                totalRecharge: rechargeBalances.total
            }
        };
    }

    // ২. ক্লোজ ডে বাটনের সাথে ফুল স্ন্যাপশট ইন্টিগ্রেশন
    function patchDailyClosingSave() {
        if (typeof window.generateDailyClosingSnapshot === 'function') {
            const originalSave = window.generateDailyClosingSnapshot;
            window.generateDailyClosingSnapshot = async function () {
                const rDate = document.getElementById('selectedReportDate')?.value;
                if (rDate) {
                    const fullDetails = captureCurrentFullSnapshot(rDate);
                    // এক্সিস্টিং অবজেক্টে details ঢুকিয়ে দেওয়া
                    window._lastCapturedDetails = fullDetails;
                }
                const res = await originalSave.apply(this, arguments);
                
                // ফায়ারবেসে সেভ হওয়া লেটেস্ট রিপোর্টে details যুক্ত করা
                if (window.dailyClosingReports && window.dailyClosingReports.length > 0 && window._lastCapturedDetails) {
                    if (window.dailyClosingReports[0].report_date === rDate) {
                        window.dailyClosingReports[0].details = window._lastCapturedDetails;
                    }
                }
                return res;
            };
        }
    }

    // ৩. রিপোর্ট ডাউনলোড ভিউয়ার প্যাচ
    function patchReportPreview() {
        if (typeof window.hubGeneratePreview === 'function') {
            const originalPreview = window.hubGeneratePreview;

            window.hubGeneratePreview = function () {
                const rptType = document.getElementById('hubReportType')?.value;
                if (rptType !== 'daily_closing') return originalPreview.apply(this, arguments);

                const fromDate = document.getElementById('hubFromDate')?.value;
                const toDate = document.getElementById('hubToDate')?.value || fromDate;
                const container = document.getElementById('hub-report-print-area');

                if (!fromDate) {
                    alert("দয়া করে তারিখ নির্বাচন করুন।");
                    return;
                }

                const reports = window.dailyClosingReports || [];
                const closedSnap = reports.find(r => String(r.report_date) === String(toDate));
                const todayStr = new Date().toISOString().split('T')[0];

                let dataToRender = null;

                // যদি সেভ করা স্ন্যাপশট থাকে (আজকের পর থেকে যা যা সেভ হবে)
                if (closedSnap && closedSnap.details) {
                    const det = closedSnap.details;
                    const totalAssets = det.summary.totalCash + det.summary.totalCard + det.summary.totalBank + det.summary.totalPersonal + det.summary.totalAgent + det.summary.totalRecharge;
                    dataToRender = {
                        reportDate: toDate,
                        reportTime: closedSnap.closing_time || "Day End",
                        reportId: closedSnap.report_id,
                        summary: { ...det.summary, totalNetBalance: totalAssets },
                        dueSummary: {
                            todayDilam: closedSnap.total_dilam || 0,
                            todayPelam: closedSnap.total_pelam || 0,
                            totalCustomerDue: closedSnap.total_due || 0
                        },
                        bankAccounts: det.bankAccounts,
                        personalAccounts: det.personalAccounts,
                        agentAccounts: det.agentAccounts,
                        rechargeBalances: det.rechargeBalances,
                        cashInventory: det.cashInventory,
                        cardInventory: det.cardInventory
                    };
                } else if (toDate === todayStr) {
                    // আজকের জন্য বর্তমান ব্যালেন্স দেখাবে
                    const currentSnap = captureCurrentFullSnapshot(todayStr);
                    const totalAssets = currentSnap.summary.totalCash + currentSnap.summary.totalCard + currentSnap.summary.totalBank + currentSnap.summary.totalPersonal + currentSnap.summary.totalAgent + currentSnap.summary.totalRecharge;
                    
                    let dilam = 0, pelam = 0;
                    (window.customerTransactions || []).filter(t => String(t.date) === todayStr).forEach(t => {
                        dilam += parseFloat(t.debit) || 0;
                        pelam += parseFloat(t.credit) || 0;
                    });

                    dataToRender = {
                        reportDate: todayStr,
                        reportTime: new Date().toLocaleTimeString('en-US'),
                        reportId: `DCR-LIVE-${Date.now()}`,
                        summary: { ...currentSnap.summary, totalNetBalance: totalAssets },
                        dueSummary: { todayDilam: dilam, todayPelam: pelam, totalCustomerDue: 0 },
                        bankAccounts: currentSnap.bankAccounts,
                        personalAccounts: currentSnap.personalAccounts,
                        agentAccounts: currentSnap.agentAccounts,
                        rechargeBalances: currentSnap.rechargeBalances,
                        cashInventory: currentSnap.cashInventory,
                        cardInventory: currentSnap.cardInventory
                    };
                }

                if (!dataToRender) {
                    container.innerHTML = `
                        <div class="rpt-placeholder-state" style="padding: 40px; text-align: center;">
                            <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #f59e0b; margin-bottom: 15px;"></i>
                            <h4 style="font-size: 1.1rem; color: #1e293b;">${toDate} তারিখের কোনো ক্লোজিং রেকর্ড পাওয়া যায়নি!</h4>
                            <p style="color: #64748b; max-width: 500px; margin: 8px auto;">ঐ তারিখে সিস্টেমে <strong>CLOSE DAY</strong> সম্পন্ন করা হয়নি। <strong>আজকের দিন থেকে প্রতিদিন ক্লোজ সম্পন্ন করলে</strong> স্বয়ংক্রিয়ভাবে পরবর্তী সকল দিনের পূর্ণাঙ্গ বিবরণী এখানে দেখতে পাবেন।</p>
                        </div>
                    `;
                    return;
                }

                const renderRows = (list) => {
                    if (!list || list.length === 0) return `<tr><td colspan="2" style="text-align:center; color:#94a3b8;">No records</td></tr>`;
                    return list.map(a => `<tr><td>${escapeHTML(a.name)}</td><td style="text-align:right;">${toEnMoney(a.balance)}</td></tr>`).join('');
                };

                container.innerHTML = `
                    <div class="dcr-preview-doc">
                        <div class="dcr-preview-header">
                            <div>Date: ${dataToRender.reportDate}<br>Time: ${dataToRender.reportTime}</div>
                            <div class="dcr-preview-header-center">
                                <h2>MOUSUMI COMPUTER</h2>
                                <h4>DAILY CLOSING FINANCIAL STATEMENT</h4>
                            </div>
                            <div style="text-align:right;">ID: ${dataToRender.reportId}</div>
                        </div>

                        <div class="dcr-sec-box">
                            <div class="dcr-sec-bar">SECTION 1: EXECUTIVE FINANCIAL SUMMARY</div>
                            <table class="dcr-sec-table">
                                <tr><td style="width:70%;">Total Cash Inventory (ক্যাশ ব্যালেন্স)</td><td style="text-align:right;">৳ ${toEnMoney(dataToRender.summary.totalCash)}</td></tr>
                                <tr><td>Total Card Inventory Stock (কার্ড স্টক)</td><td style="text-align:right;">৳ ${toEnMoney(dataToRender.summary.totalCard)}</td></tr>
                                <tr><td>Total Bank Accounts (ব্যাংক ব্যালেন্স)</td><td style="text-align:right;">৳ ${toEnMoney(dataToRender.summary.totalBank)}</td></tr>
                                <tr><td>Total Personal Accounts (পার্সোনাল ওয়ালেট)</td><td style="text-align:right;">৳ ${toEnMoney(dataToRender.summary.totalPersonal)}</td></tr>
                                <tr><td>Total Agent Accounts (এজেন্ট ওয়ালেট)</td><td style="text-align:right;">৳ ${toEnMoney(dataToRender.summary.totalAgent)}</td></tr>
                                <tr><td>Total Recharge Balances (রিচার্জ ব্যালেন্স)</td><td style="text-align:right;">৳ ${toEnMoney(dataToRender.summary.totalRecharge)}</td></tr>
                                <tr class="total-row" style="background:#f9fafb;">
                                    <td>TOTAL CLOSING FINANCIAL BALANCE (ASSETS)</td>
                                    <td style="text-align:right; font-weight:bold;">৳ ${toEnMoney(dataToRender.summary.totalNetBalance)}</td>
                                </tr>
                            </table>
                        </div>

                        <div class="dcr-sec-box">
                            <div class="dcr-sec-bar">BANK ACCOUNTS</div>
                            <table class="dcr-sec-table">
                                <thead><tr><th>ACCOUNT NAME</th><th style="text-align:right;">BALANCE (৳)</th></tr></thead>
                                <tbody>
                                    ${renderRows(dataToRender.bankAccounts.list)}
                                    <tr class="total-row"><td>TOTAL BANK ACCOUNTS</td><td style="text-align:right;">${toEnMoney(dataToRender.bankAccounts.total)}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="dcr-sec-box">
                            <div class="dcr-sec-bar">AGENT ACCOUNTS</div>
                            <table class="dcr-sec-table">
                                <thead><tr><th>ACCOUNT NAME</th><th style="text-align:right;">BALANCE (৳)</th></tr></thead>
                                <tbody>
                                    ${renderRows(dataToRender.agentAccounts.list)}
                                    <tr class="total-row"><td>TOTAL AGENT ACCOUNTS</td><td style="text-align:right;">${toEnMoney(dataToRender.agentAccounts.total)}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            };
        }
    }

    const timer = setInterval(() => {
        if (typeof window.generateDailyClosingSnapshot === 'function' && typeof window.hubGeneratePreview === 'function') {
            patchDailyClosingSave();
            patchReportPreview();
            clearInterval(timer);
        }
    }, 400);

})();
