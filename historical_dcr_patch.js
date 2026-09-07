/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - HISTORICAL DCR SNAPSHOT & RECONSTRUCTION PATCH
 * File: historical_dcr_patch.js
 * 
 * কাজ:
 * ১. যেকোনো অতীত তারিখ দিলে সেদিনের সেভ করা ডাটা বা লগ রিকনস্ট্রাক্ট করে আনা।
 * ২. বর্তমান ব্যালেন্স দেখানো সম্পূর্ণ বন্ধ করা।
 * ৩. কোনো পুরোনো ফাইলে হাত না দিয়েই স্বয়ংক্রিয়ভাবে কাজ করা।
 * ============================================================================
 */

(function () {
    "use strict";

    console.log("[Historical DCR Patch] Initializing date-accurate engine...");

    const toEnMoney = (val) => {
        const num = Number(val) || 0;
        return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    };

    const escapeHTML = (str) => String(str ?? "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);

    // হিস্টোরিক্যাল ডাটা সংগ্রহক ইঞ্জিন
    function getHistoricalAccurateStatement(fromDate, toDate) {
        const store = (typeof window.getERPStore === 'function') ? window.getERPStore() : {
            categories: window.categories || [],
            accounts: window.accounts || [],
            balanceStore: window.balanceStore || {},
            cardConfig: window.cardConfig || {},
            cardQuantities: window.cardQuantities || {},
            cashQuantities: window.cashQuantities || {},
            cashOthersAmount: window.cashOthersAmount || 0,
            dailyClosingReports: window.dailyClosingReports || [],
            customers: window.customers || [],
            customerTransactions: window.customerTransactions || []
        };

        const reports = Array.isArray(store.dailyClosingReports) ? store.dailyClosingReports : [];
        const isRange = fromDate !== toDate;

        // ১. ওই নির্দিষ্ট তারিখের সেভ করা স্ন্যাপশট খোঁজা
        const closedSnap = reports.find(r => String(r.report_date) === String(toDate));

        const categories = Array.isArray(store.categories) ? store.categories : [];
        const accounts = Array.isArray(store.accounts) ? store.accounts : [];
        const balanceStore = store.balanceStore || {};
        const customers = Array.isArray(store.customers) ? store.customers : [];
        const customerTransactions = Array.isArray(store.customerTransactions) ? store.customerTransactions : [];

        // ২. কাস্টমার দিল / পেল হিসাব (নির্বাচিত তারিখের)
        let totalDilam = 0;
        let totalPelam = 0;
        customerTransactions.filter(t => {
            const d = String(t.date);
            return d >= fromDate && d <= toDate;
        }).forEach(t => {
            totalDilam += (parseFloat(t.debit) || 0);
            totalPelam += (parseFloat(t.credit) || 0);
        });

        // ৩. নির্দিষ্ট তারিখ পর্যন্ত মোট বকেয়া (Due)
        let totalCustomerDue = 0;
        customers.forEach(c => {
            let due = parseFloat(c.openingBalance) || 0;
            customerTransactions.filter(t => String(t.customerId) === String(c.id) && String(t.date) <= toDate).forEach(t => {
                due += (parseFloat(t.debit) || 0) - (parseFloat(t.credit) || 0);
            });
            if (due > 0) totalCustomerDue += due;
        });

        // ক. যদি সেই দিনের ক্লোজিং সেভ করা থাকে (হিস্ট্রি থেকে সরাসরি)
        if (!isRange && closedSnap) {
            let snapCash = 0, snapCard = 0, snapBank = 0, snapPersonal = 0, snapAgent = 0, snapRecharge = 0;
            let bankList = [], personalList = [], agentList = [], rechargeList = [];
            let cashRows = [], cardRows = [];

            if (closedSnap.details) {
                const det = closedSnap.details;
                snapCash = det.cashInventory ? det.cashInventory.total : 0;
                snapCard = det.cardInventory ? det.cardInventory.total : 0;
                snapBank = det.bankAccounts ? det.bankAccounts.total : 0;
                snapPersonal = det.personalAccounts ? det.personalAccounts.total : 0;
                snapAgent = det.agentAccounts ? det.agentAccounts.total : 0;
                snapRecharge = det.rechargeBalances ? det.rechargeBalances.total : 0;

                bankList = det.bankAccounts ? det.bankAccounts.list : [];
                personalList = det.personalAccounts ? det.personalAccounts.list : [];
                agentList = det.agentAccounts ? det.agentAccounts.list : [];
                rechargeList = det.rechargeBalances ? det.rechargeBalances.list : [];
                cashRows = det.cashInventory ? det.cashInventory.rows : [];
                cardRows = det.cardInventory ? det.cardInventory.rows : [];
            } else {
                snapBank = parseFloat(closedSnap.total_bank) || 0;
                snapPersonal = parseFloat(closedSnap.total_personal) || 0;
                snapAgent = parseFloat(closedSnap.total_agent) || 0;
                snapRecharge = parseFloat(closedSnap.total_recharge) || 0;
                snapCash = parseFloat(closedSnap.total_cash) || 0;
                snapCard = parseFloat(closedSnap.total_card) || 0;

                if (!snapCash && !snapCard && closedSnap.actual_closing) {
                    snapCash = parseFloat(closedSnap.actual_closing);
                }
            }

            const correctTotalAssets = (snapCash + snapCard + snapBank + snapPersonal + snapAgent + snapRecharge) || parseFloat(closedSnap.actual_closing) || 0;

            return {
                isRange: false,
                reportDate: toDate,
                dateRangeText: `Date: ${toDate}`,
                reportTime: closedSnap.closing_time || "--:--",
                reportId: closedSnap.report_id || `DCR-${Date.now()}`,
                refId: `REF-${String(Math.abs((closedSnap.report_id || '').split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0))).padStart(6, '0').slice(-6)}`,
                summary: {
                    totalCash: snapCash,
                    totalCard: snapCard,
                    totalBank: snapBank,
                    totalPersonal: snapPersonal,
                    totalAgent: snapAgent,
                    totalRecharge: snapRecharge,
                    totalCustomerDue: closedSnap.total_due || totalCustomerDue,
                    totalNetBalance: correctTotalAssets
                },
                dueSummary: {
                    todayDilam: (closedSnap.total_dilam !== undefined) ? closedSnap.total_dilam : totalDilam,
                    todayPelam: (closedSnap.total_pelam !== undefined) ? closedSnap.total_pelam : totalPelam,
                    totalCustomerDue: closedSnap.total_due || totalCustomerDue
                },
                bankAccounts: { list: bankList, total: snapBank },
                personalAccounts: { list: personalList, total: snapPersonal },
                agentAccounts: { list: agentList, total: snapAgent },
                rechargeBalances: { list: rechargeList, total: snapRecharge },
                cashInventory: { rows: cashRows, total: snapCash },
                cardInventory: { rows: cardRows, total: snapCard }
            };
        }

        // খ. ক্লোজিং সেভ না থাকলে: অডিট লগ ও ট্রানজ্যাকশন রি-কনস্ট্রাকশন
        const todayStr = new Date().toISOString().split('T')[0];
        const isHistorical = toDate < todayStr;

        const getHistoricalCategory = (matchNames) => {
            const list = [];
            let total = 0;
            const matchedCats = categories.filter(c => matchNames.some(m => (c.name || '').toLowerCase().includes(m.toLowerCase())));
            
            matchedCats.forEach(cat => {
                const accs = accounts.filter(a => a.catId === cat.id && a.enabled !== false);
                accs.forEach(acc => {
                    let bal = parseFloat(balanceStore[acc.id]) || 0;
                    
                    // যদি পেছনের তারিখ হয়, তবে ঐ তারিখের পরের লগগুলো রিভার্স করা
                    if (isHistorical && Array.isArray(window.historyLogs)) {
                        const laterLogs = window.historyLogs.filter(h => h.accountName === acc.name && h.date && new Date(h.date) > new Date(toDate + 'T23:59:59'));
                        laterLogs.forEach(l => {
                            bal -= (parseFloat(l.difference) || 0);
                        });
                    }
                    total += bal;
                    if (bal > 0) list.push({ name: acc.name, balance: bal });
                });
            });
            return { list, total };
        };

        const bankAccs = getHistoricalCategory(['bank']);
        const personalAccs = getHistoricalCategory(['personal']);
        const agentAccs = getHistoricalCategory(['agent']);
        const rechargeAccs = getHistoricalCategory(['recharge']);

        let totalCash = 0;
        let cashRows = [];
        if (isHistorical && Array.isArray(window.cashHistoryLogs)) {
            const matchCash = window.cashHistoryLogs.filter(c => c.date && new Date(c.date) <= new Date(toDate + 'T23:59:59'));
            totalCash = matchCash.length > 0 ? (matchCash[0].grandTotal || 0) : 0;
            cashRows.push({ note: "Cash Balance (As on Date)", qty: 1, amount: totalCash });
        } else {
            const cashNotes = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
            cashNotes.forEach(denom => {
                const qty = parseInt(store.cashQuantities[denom], 10) || 0;
                const amt = qty * denom;
                totalCash += amt;
                if (qty > 0) cashRows.push({ note: `৳ ${denom} Notes`, qty, amount: amt });
            });
            totalCash += (Number(store.cashOthersAmount) || 0);
        }

        let totalCard = 0;
        let cardRows = [];
        if (isHistorical && Array.isArray(window.cardHistoryLogs)) {
            const matchCard = window.cardHistoryLogs.filter(c => c.date && new Date(c.date) <= new Date(toDate + 'T23:59:59'));
            totalCard = matchCard.length > 0 ? (matchCard[0].grandTotalValue || 0) : 0;
            cardRows.push({ name: "Card Inventory Stock (As on Date)", qty: 1, total: totalCard });
        } else {
            totalCard = typeof window.calculateGrandCardInventoryValue === 'function' ? window.calculateGrandCardInventoryValue() : 0;
        }

        const totalAssets = totalCash + totalCard + bankAccs.total + personalAccs.total + agentAccs.total + rechargeAccs.total;

        return {
            isRange: isRange,
            fromDate: fromDate,
            toDate: toDate,
            dateRangeText: isRange ? `Range: ${fromDate} to ${toDate}` : `Date: ${toDate} (Audited)`,
            reportDate: toDate,
            reportTime: isHistorical ? "11:59:59 PM (Day End)" : new Date().toLocaleTimeString('en-US'),
            reportId: `DCR-${toDate.replace(/-/g, '')}`,
            refId: `REF-${toDate.replace(/-/g, '').slice(-6)}`,
            summary: {
                totalCash,
                totalCard,
                totalBank: bankAccs.total,
                totalPersonal: personalAccs.total,
                totalAgent: agentAccs.total,
                totalRecharge: rechargeAccs.total,
                totalCustomerDue,
                totalNetBalance: totalAssets
            },
            dueSummary: {
                todayDilam: totalDilam,
                todayPelam: totalPelam,
                totalCustomerDue
            },
            bankAccounts: bankAccs,
            personalAccounts: personalAccs,
            agentAccounts: agentAccs,
            rechargeBalances: rechargeAccs,
            cashInventory: { rows: cashRows, total: totalCash },
            cardInventory: { rows: cardRows, total: totalCard }
        };
    }

    // মূল ফাংশনটিকে ইন্টারসেপ্ট বা ওভাররাইড করা
    function applyPatch() {
        if (typeof window.hubGeneratePreview === 'function') {
            const originalPreview = window.hubGeneratePreview;

            window.hubGeneratePreview = function () {
                const rptType = document.getElementById('hubReportType')?.value;
                if (rptType === 'daily_closing') {
                    const fromDate = document.getElementById('hubFromDate')?.value;
                    const toDate = document.getElementById('hubToDate')?.value || fromDate;
                    const container = document.getElementById('hub-report-print-area');

                    if (!fromDate) {
                        alert("দয়া করে তারিখ নির্বাচন করুন।");
                        return;
                    }

                    const data = getHistoricalAccurateStatement(fromDate, toDate);

                    const renderAccRows = (accList) => {
                        if (!accList || accList.length === 0) return `<tr><td colspan="2" style="text-align:center; color:#64748b;">No active balance</td></tr>`;
                        return accList.map(a => `<tr><td>${escapeHTML(a.name)}</td><td style="text-align:right;">${toEnMoney(a.balance)}</td></tr>`).join('');
                    };

                    const renderCashRows = (rows) => {
                        if (!rows || rows.length === 0) return `<tr><td colspan="3" style="text-align:center; color:#64748b;">No cash in hand</td></tr>`;
                        return rows.map(r => `<tr><td>${escapeHTML(r.note)}</td><td style="text-align:center;">${r.qty}</td><td style="text-align:right;">${toEnMoney(r.amount)}</td></tr>`).join('');
                    };

                    const renderCardRows = (rows) => {
                        if (!rows || rows.length === 0) return `<tr><td colspan="3" style="text-align:center; color:#64748b;">No cards in stock</td></tr>`;
                        return rows.map(r => `<tr><td>${escapeHTML(r.name)}</td><td style="text-align:center;">${r.qty}</td><td style="text-align:right;">${toEnMoney(r.total)}</td></tr>`).join('');
                    };

                    container.innerHTML = `
                        <div class="dcr-preview-doc">
                            <div class="dcr-preview-header">
                                <div style="font-size:11px; line-height:1.4;">
                                    <div>${data.dateRangeText}</div>
                                    <div>Time: ${data.reportTime}</div>
                                </div>
                                <div class="dcr-preview-header-center">
                                    <h2>MOUSUMI COMPUTER</h2>
                                    <h4>DAILY CLOSING FINANCIAL STATEMENT</h4>
                                </div>
                                <div style="font-size:11px; line-height:1.4; text-align:right;">
                                    <div>Report ID: ${data.reportId}</div>
                                    <div>Ref: ${data.refId}</div>
                                </div>
                            </div>

                            <div class="dcr-sec-box">
                                <div class="dcr-sec-bar">SECTION 1: EXECUTIVE FINANCIAL SUMMARY</div>
                                <table class="dcr-sec-table">
                                    <tr><td style="width:70%;">Total Cash Inventory (ক্যাশ ব্যালেন্স)</td><td style="text-align:right; width:30%;">৳ ${toEnMoney(data.summary.totalCash)}</td></tr>
                                    <tr><td>Total Card Inventory Stock (কার্ড স্টক)</td><td style="text-align:right;">৳ ${toEnMoney(data.summary.totalCard)}</td></tr>
                                    <tr><td>Total Bank Accounts (ব্যাংক ব্যালেন্স)</td><td style="text-align:right;">৳ ${toEnMoney(data.summary.totalBank)}</td></tr>
                                    <tr><td>Total Personal Accounts (পার্সোনাল ওয়ালেট)</td><td style="text-align:right;">৳ ${toEnMoney(data.summary.totalPersonal)}</td></tr>
                                    <tr><td>Total Agent Accounts (এজেন্ট ওয়ালেট)</td><td style="text-align:right;">৳ ${toEnMoney(data.summary.totalAgent)}</td></tr>
                                    <tr><td>Total Recharge Balances (রিচার্জ ব্যালেন্স)</td><td style="text-align:right;">৳ ${toEnMoney(data.summary.totalRecharge)}</td></tr>
                                    <tr class="total-row" style="background:#f9fafb;">
                                        <td>TOTAL CLOSING FINANCIAL BALANCE (ASSETS)</td>
                                        <td style="text-align:right; font-size:12px; font-weight:bold;">৳ ${toEnMoney(data.summary.totalNetBalance)}</td>
                                    </tr>
                                </table>
                            </div>

                            <div class="dcr-sec-box">
                                <div class="dcr-sec-bar">SECTION 2: CUSTOMER TRANSACTIONS & DUE SUMMARY</div>
                                <table class="dcr-sec-table">
                                    <tr>
                                        <td style="width:70%; color:#dc2626; font-weight:bold;">${data.isRange ? 'Period Total Dilam (-)' : "Today's Total Dilam (-)"}</td>
                                        <td style="text-align:right; width:30%; color:#dc2626; font-weight:bold;">৳ ${toEnMoney(data.dueSummary.todayDilam)}</td>
                                    </tr>
                                    <tr>
                                        <td style="color:#16a34a; font-weight:bold;">${data.isRange ? 'Period Total Pelam (+)' : "Today's Total Pelam (+)"}</td>
                                        <td style="text-align:right; color:#16a34a; font-weight:bold;">৳ ${toEnMoney(data.dueSummary.todayPelam)}</td>
                                    </tr>
                                    <tr class="total-row" style="background:#fef2f2;">
                                        <td style="color:#b91c1c;">TOTAL CUSTOMER OUTSTANDING DUE (সর্বমোট পাওনা)</td>
                                        <td style="text-align:right; color:#b91c1c; font-size:12px;">৳ ${toEnMoney(data.dueSummary.totalCustomerDue)}</td>
                                    </tr>
                                </table>
                            </div>

                            <div class="dcr-sec-box">
                                <div class="dcr-sec-bar">BANK ACCOUNTS</div>
                                <table class="dcr-sec-table">
                                    <thead><tr><th style="width:70%;">ACCOUNT NAME</th><th style="text-align:right; width:30%;">BALANCE (৳)</th></tr></thead>
                                    <tbody>
                                        ${renderAccRows(data.bankAccounts.list)}
                                        <tr class="total-row"><td>TOTAL BANK ACCOUNTS</td><td style="text-align:right;">${toEnMoney(data.bankAccounts.total)}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="dcr-sec-box">
                                <div class="dcr-sec-bar">PERSONAL ACCOUNTS</div>
                                <table class="dcr-sec-table">
                                    <thead><tr><th style="width:70%;">ACCOUNT NAME</th><th style="text-align:right; width:30%;">BALANCE (৳)</th></tr></thead>
                                    <tbody>
                                        ${renderAccRows(data.personalAccounts.list)}
                                        <tr class="total-row"><td>TOTAL PERSONAL ACCOUNTS</td><td style="text-align:right;">${toEnMoney(data.personalAccounts.total)}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="dcr-sec-box">
                                <div class="dcr-sec-bar">AGENT ACCOUNTS</div>
                                <table class="dcr-sec-table">
                                    <thead><tr><th style="width:70%;">ACCOUNT NAME</th><th style="text-align:right; width:30%;">BALANCE (৳)</th></tr></thead>
                                    <tbody>
                                        ${renderAccRows(data.agentAccounts.list)}
                                        <tr class="total-row"><td>TOTAL AGENT ACCOUNTS</td><td style="text-align:right;">${toEnMoney(data.agentAccounts.total)}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="dcr-sec-box">
                                <div class="dcr-sec-bar">RECHARGE BALANCES</div>
                                <table class="dcr-sec-table">
                                    <thead><tr><th style="width:70%;">ACCOUNT NAME</th><th style="text-align:right; width:30%;">BALANCE (৳)</th></tr></thead>
                                    <tbody>
                                        ${renderAccRows(data.rechargeBalances.list)}
                                        <tr class="total-row"><td>TOTAL RECHARGE BALANCES</td><td style="text-align:right;">${toEnMoney(data.rechargeBalances.total)}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="dcr-sec-box">
                                <div class="dcr-sec-bar">CASH INVENTORY DETAILS</div>
                                <table class="dcr-sec-table">
                                    <thead><tr><th style="width:50%;">NOTES</th><th style="text-align:center; width:20%;">QTY</th><th style="text-align:right; width:30%;">AMOUNT (৳)</th></tr></thead>
                                    <tbody>
                                        ${renderCashRows(data.cashInventory.rows)}
                                        <tr class="total-row"><td colspan="2">TOTAL CASH INVENTORY</td><td style="text-align:right;">${toEnMoney(data.cashInventory.total)}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            <div class="dcr-sec-box">
                                <div class="dcr-sec-bar">CARD INVENTORY DETAILS</div>
                                <table class="dcr-sec-table">
                                    <thead><tr><th style="width:50%;">CARD NAME</th><th style="text-align:center; width:20%;">QTY</th><th style="text-align:right; width:30%;">TOTAL (৳)</th></tr></thead>
                                    <tbody>
                                        ${renderCardRows(data.cardInventory.rows)}
                                        <tr class="total-row"><td colspan="2">TOTAL CARD INVENTORY</td><td style="text-align:right;">${toEnMoney(data.cardInventory.total)}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                    return;
                }
                return originalPreview.apply(this, arguments);
            };
            console.log("[Historical DCR Patch] Applied successfully.");
        }
    }

    const timer = setInterval(() => {
        if (typeof window.hubGeneratePreview === 'function') {
            applyPatch();
            clearInterval(timer);
        }
    }, 400);

})();
