/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - DAILY INCOME, EXPENSE & BALANCE STATEMENT
 * File: daily_income_expense_ledger_module.js
 * 
 * Features:
 * 1. খরচের খাত: দোকানের ব্যয়, বাড়ি খরচ, ইএসডিও, টিএমএসএস (স্বয়ংক্রিয় ডিটেকশন)।
 * 2. আয়: ডেইলি ক্লোজিং এর প্রকৃত আয় (Daily Net Business Income)।
 * 3. কলাম: ক্রমিক | তারিখ | বার | আয় | খরচ | অবশিষ্ট | বর্তমান স্থিতি
 * 4. 100% Tiro Bangla Typography, ক্রমিক (১। ২। ৩।) ও ক্লাসিক অফিশিয়াল ফরম্যাট।
 * ============================================================================
 */

(function () {
    "use strict";

    // বাংলা সংখ্যা ও ফরম্যাটিং হেল্পার
    const BN_DIGITS = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
    const toBn = (val) => String(val ?? "").replace(/\d/g, d => BN_DIGITS[d]);

    const toBnMoney = (val) => {
        const num = Number(val) || 0;
        const fmt = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(num));
        return fmt.replace(/\d/g, d => BN_DIGITS[d]);
    };

    const escapeHTML = (str) => String(str ?? "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);

    const getBanglaDateInfo = (dateString) => {
        if (!dateString) return { full: "", day: "" };
        const date = new Date(dateString + "T00:00:00");
        const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
        const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
        return {
            full: `${toBn(date.getDate())} ${months[date.getMonth()]} ${toBn(date.getFullYear())}`,
            day: days[date.getDay()],
            formattedDate: `${toBn(String(date.getDate()).padStart(2, '0'))}-${toBn(String(date.getMonth() + 1).padStart(2, '0'))}-${toBn(date.getFullYear())}`
        };
    };

    // খরচের নির্ধারিত খাতসমূহের তালিকা (কী-ওয়ার্ড ভিত্তিক ফিল্টারিং)
    const EXPENSE_HEAD_KEYWORDS = [
        'দোকানের ব্যয়', 'দোকানের ব্যয়', 'দোকান ব্যয়', 'দোকান ব্যয়',
        'বাড়ি খরচ', 'বাড়ি খরচ', 'বাড়ি ব্যয়', 'বাড়ি ব্যয়',
        'ইএসডিও', 'esdo', 'esdo loan',
        'টিএমএসএস', 'tmss', 'tmss loan'
    ];

    function isExpenseCustomer(custName) {
        if (!custName) return false;
        const name = custName.trim().toLowerCase();
        return EXPENSE_HEAD_KEYWORDS.some(keyword => name.includes(keyword.toLowerCase()));
    }

    // স্টোর থেকে ডেটা প্রসেসিং ও হিসাব
    function getLedgerData() {
        let store = {};
        if (typeof window.getERPStore === 'function') {
            store = window.getERPStore();
        }

        const closings = store.dailyClosingReports || window.dailyClosingReports || [];
        const customers = store.customers || window.customers || [];
        const transactions = store.customerTransactions || window.customerTransactions || [];

        // খরচের কাস্টমার আইডি চিহ্নিতকরণ
        const expenseCustomerIds = new Set();
        customers.forEach(c => {
            if (isExpenseCustomer(c.name)) {
                expenseCustomerIds.add(String(c.id));
            }
        });

        // তারিখ ফিল্টার
        const fromInput = document.getElementById('hubFromDate');
        const toInput = document.getElementById('hubToDate');
        const fromDateVal = fromInput ? fromInput.value : '';
        const toDateVal = toInput ? toInput.value : '';

        // ক্লোজিং থেকে ইউনিক তারিখগুলো সংগ্রহ
        let dateList = closings.map(r => r.report_date).filter(Boolean);
        transactions.forEach(t => {
            if (t.date && !dateList.includes(t.date)) dateList.push(t.date);
        });

        // ইউনিক ও তারিখ অনুযায়ী সাজানো (Oldest to Newest)
        dateList = Array.from(new Set(dateList)).sort((a, b) => a.localeCompare(b));

        if (fromDateVal && toDateVal) {
            dateList = dateList.filter(d => d >= fromDateVal && d <= toDateVal);
        } else if (fromDateVal) {
            dateList = dateList.filter(d => d >= fromDateVal);
        } else if (toDateVal) {
            dateList = dateList.filter(d => d <= toDateVal);
        }

        const ledgerRows = [];
        let runningBalance = 0;
        let grandTotalIncome = 0;
        let grandTotalExpense = 0;
        let grandTotalRemaining = 0;

        dateList.forEach(dateStr => {
            // ১. ওই দিনের আয়
            const closedSnap = closings.find(r => String(r.report_date) === String(dateStr));
            let dailyIncome = 0;
            if (closedSnap) {
                dailyIncome = parseFloat(closedSnap.income) || 0;
            }

            // ২. ওই দিনের খরচ (নির্ধারিত ৪টি খাতের ডেবিট যোগফল)
            let dailyExpense = 0;
            const dayTxs = transactions.filter(t => String(t.date) === String(dateStr));
            dayTxs.forEach(t => {
                const isExp = expenseCustomerIds.has(String(t.customerId)) || isExpenseCustomer(t.customerName);
                if (isExp) {
                    dailyExpense += (parseFloat(t.debit) || 0);
                }
            });

            // ৩. অবশিষ্ট ও বর্তমান স্থিতি
            const remaining = dailyIncome - dailyExpense;
            runningBalance += remaining;

            grandTotalIncome += dailyIncome;
            grandTotalExpense += dailyExpense;
            grandTotalRemaining += remaining;

            const dateMeta = getBanglaDateInfo(dateStr);

            ledgerRows.push({
                rawDate: dateStr,
                dateText: dateMeta.formattedDate,
                dayText: dateMeta.day,
                income: dailyIncome,
                expense: dailyExpense,
                remaining: remaining,
                balance: runningBalance
            });
        });

        const today = new Date();
        const printDateStr = today.toISOString().split('T')[0];

        return {
            dateInfo: getBanglaDateInfo(printDateStr),
            rangeText: fromDateVal && toDateVal ? `${fromDateVal} হতে ${toDateVal}` : 'সকল তারিখের প্রতিবেদন',
            ledgerRows,
            grandTotalIncome,
            grandTotalExpense,
            grandTotalRemaining,
            finalBalance: runningBalance
        };
    }

    // নতুন ট্যাবে প্রিন্ট ভিউ ওপেন
    window.openDailyIncomeExpenseTab = function (autoPrint = false) {
        const data = getLedgerData();

        let tbodyHTML = '';
        if (data.ledgerRows.length === 0) {
            tbodyHTML = `<tr><td colspan="7" style="text-align:center; padding:15px; color:#555;">নির্বাচিত মেয়াদে কোনো আয় ও খরচের রেকর্ড পাওয়া যায়নি</td></tr>`;
        } else {
            data.ledgerRows.forEach((r, i) => {
                const remColor = r.remaining >= 0 ? '#000000' : '#dc2626';
                const balColor = r.balance >= 0 ? '#000000' : '#dc2626';

                tbodyHTML += `
                    <tr>
                        <td style="text-align:center; font-weight:600;">${toBn(i + 1)}।</td>
                        <td style="text-align:center;">${r.dateText}</td>
                        <td style="text-align:center;">${r.dayText}</td>
                        <td style="text-align:right; font-weight:600;">৳ ${toBnMoney(r.income)}</td>
                        <td style="text-align:right; font-weight:600;">৳ ${toBnMoney(r.expense)}</td>
                        <td style="text-align:right; font-weight:700; color:${remColor};">
                            ${r.remaining < 0 ? '(-)' : ''} ৳ ${toBnMoney(r.remaining)}
                        </td>
                        <td style="text-align:right; font-weight:700; color:${balColor};">
                            ${r.balance < 0 ? '(-)' : ''} ৳ ${toBnMoney(r.balance)}
                        </td>
                    </tr>`;
            });
        }

        const fullHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Daily Income, Expense & Balance Ledger - Mousumi Computer</title>
    <!-- Google Fonts: Tiro Bangla -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"><\/script>
    
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 20px 0;
            background: #e2e8f0;
            font-family: 'Tiro Bangla', serif;
            color: #000;
            font-size: 13.5px;
        }

        .no-print-bar {
            position: fixed;
            top: 15px;
            right: 20px;
            z-index: 9999;
            display: flex;
            gap: 10px;
            background: #1e293b;
            padding: 8px 14px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        }
        .btn {
            background: #0284c7;
            color: #fff;
            border: none;
            padding: 7px 14px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border-radius: 4px;
            font-family: 'Tiro Bangla', serif;
        }
        .btn-pdf { background: #dc2626; }
        .btn-excel { background: #059669; }
        .btn-close { background: #64748b; }

        .page-container {
            width: 210mm;
            margin: 0 auto;
            background: #fff;
            padding: 12mm 15mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 23px;
            font-weight: 800;
            letter-spacing: 0.5px;
        }
        .header h2 {
            margin: 2px 0 0 0;
            font-size: 15px;
            font-weight: 600;
        }

        .meta {
            display: flex;
            justify-content: space-between;
            font-size: 12.5px;
            margin-bottom: 10px;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 14px;
        }
        th, td {
            border: 1px solid #000;
            padding: 5px 6px;
            line-height: 1.3;
            vertical-align: middle;
        }
        th {
            background-color: #f1f5f9;
            font-weight: 700;
            text-align: center;
        }
        .total-row td {
            font-weight: 800;
            border-top: 1.5px solid #000;
            border-bottom: 2px solid #000;
            background-color: #f8fafc;
        }

        .signature-block {
            margin-top: 35px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        .sig-box {
            width: 160px;
            text-align: center;
        }
        .sig-line {
            border-top: 1px solid #000;
            margin-bottom: 3px;
        }

        @media print {
            body { background: #fff; padding: 0; }
            .no-print-bar { display: none !important; }
            .page-container { width: 100%; padding: 0; box-shadow: none; }
            @page { size: A4 portrait; margin: 10mm; }
            tr { page-break-inside: avoid; }
            thead { display: table-header-group; }
        }
    </style>
</head>
<body>

    <div class="no-print-bar">
        <button class="btn btn-pdf" onclick="window.print()">🖨️ Print / Save as PDF</button>
        <button class="btn btn-excel" onclick="downloadExcel()">📊 Export Excel</button>
        <button class="btn btn-close" onclick="window.close()">✕ Close</button>
    </div>

    <div class="page-container">
        
        <!-- ১. হেডার -->
        <div class="header">
            <h1>MOUSUMI COMPUTER</h1>
            <h2>দৈনিক আয়, ব্যয় ও স্থিতি বিবরণী (Daily Income, Expense & Balance Ledger)</h2>
        </div>

        <div class="meta">
            <div>সময়কাল: <strong>${escapeHTML(data.rangeText)}</strong></div>
            <div>প্রতিবেদন তারিখ: <strong>${data.dateInfo.full}</strong> | মোট কার্যদিবস: <strong>${toBn(data.ledgerRows.length)} দিন</strong></div>
        </div>

        <!-- ২. মূল লেজার টেবিল -->
        <table>
            <thead>
                <tr>
                    <th style="width:7%;">ক্রমিক</th>
                    <th style="width:14%;">তারিখ</th>
                    <th style="width:13%;">বার</th>
                    <th style="width:16%; text-align:right;">আয় (৳)</th>
                    <th style="width:16%; text-align:right;">খরচ (৳)</th>
                    <th style="width:17%; text-align:right;">অবশিষ্ট (৳)</th>
                    <th style="width:17%; text-align:right;">বর্তমান স্থিতি (৳)</th>
                </tr>
            </thead>
            <tbody>
                ${tbodyHTML}
                <tr class="total-row">
                    <td colspan="3" style="text-align:right;">সর্বমোট যোগফল:</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalIncome)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalExpense)}</td>
                    <td style="text-align:right;">${data.grandTotalRemaining < 0 ? '(-)' : ''} ৳ ${toBnMoney(data.grandTotalRemaining)}</td>
                    <td style="text-align:right; border-bottom: 3px double #000;">${data.finalBalance < 0 ? '(-)' : ''} ৳ ${toBnMoney(data.finalBalance)}</td>
                </tr>
            </tbody>
        </table>

        <div style="font-size: 11px; color: #475569; margin-top: 5px;">
            * খরচের খাতসমূহ: দোকানের ব্যয়, বাড়ি খরচ, ইএসডিও ও টিএমএসএস।
        </div>

        <!-- ৩. স্বাক্ষর -->
        <div class="signature-block">
            <div class="sig-box">
                <div class="sig-line"></div>
                <div>হিসাবরক্ষক</div>
            </div>
            <div class="sig-box">
                <div class="sig-line"></div>
                <div>স্বত্বাধিকারী / অনুমোদনকারী</div>
            </div>
        </div>

    </div>

    <script>
        function downloadExcel() {
            const wb = XLSX.utils.book_new();

            const rows = [
                ["MOUSUMI COMPUTER - দৈনিক আয়, ব্যয় ও স্থিতি বিবরণী"],
                ["সময়কাল:", "${data.rangeText}"],
                ["প্রতিবেদন তারিখ:", "${data.dateInfo.full}"],
                [],
                ["ক্রমিক", "তারিখ", "বার", "আয় (৳)", "খরচ (৳)", "অবশিষ্ট (৳)", "বর্তমান স্থিতি (৳)"]
            ];

            ${JSON.stringify(data.ledgerRows)}.forEach((r, i) => {
                rows.push([
                    i + 1 + "।",
                    r.dateText,
                    r.dayText,
                    r.income,
                    r.expense,
                    r.remaining,
                    r.balance
                ]);
            });

            rows.push([
                "", "সর্বমোট যোগফল:", "",
                ${data.grandTotalIncome},
                ${data.grandTotalExpense},
                ${data.grandTotalRemaining},
                ${data.finalBalance}
            ]);

            const ws = XLSX.utils.aoa_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, "Income & Expense Ledger");
            XLSX.writeFile(wb, "Daily_Income_Expense_and_Balance_Ledger.xlsx");
        }

        ${autoPrint ? 'window.onload = function() { setTimeout(() => { window.print(); }, 400); };' : ''}
    <\/script>
</body>
</html>
        `;

        const reportWindow = window.open("", "_blank");
        if (!reportWindow) {
            alert("অনুগ্রহ করে ব্রাউজারের Pop-up Allow করুন।");
            return;
        }
        reportWindow.document.open();
        reportWindow.document.write(fullHTML);
        reportWindow.document.close();
    };

    // ডাউনলোড সেন্টার ড্রপডাউন ও বাটন ইন্টিগ্রেশন
    function handleReportTypeChange() {
        const select = document.getElementById('hubReportType');
        if (!select) return;

        const isLedger = select.value === 'daily_income_expense_statement';
        const fromDateGroup = document.getElementById('hubFromDate')?.closest('.rpt-control-group');
        const toDateGroup = document.getElementById('hubToDate')?.closest('.rpt-control-group');
        const shortcutsBar = document.querySelector('.rpt-quick-dates');
        const previewBtn = document.querySelector('.rpt-btn-dark');
        const previewCard = document.getElementById('hub-report-print-area');

        if (isLedger) {
            // তারিখ ফিল্টার চালু থাকবে
            if (fromDateGroup) fromDateGroup.style.display = 'flex';
            if (toDateGroup) toDateGroup.style.display = 'flex';
            if (shortcutsBar) shortcutsBar.style.display = 'flex';
            if (previewBtn) previewBtn.style.display = 'none';
            
            if (previewCard) {
                previewCard.innerHTML = `
                    <div class="rpt-placeholder-state" style="padding: 35px 20px; text-align: center;">
                        <i class="fa-solid fa-file-invoice" style="font-size:2.5rem; color:#0f172a; margin-bottom:10px;"></i>
                        <h4 style="font-size:1.1rem; color:#000; margin-bottom:4px; font-family:'Tiro Bangla', serif;">Daily Income, Expense & Balance Ledger</h4>
                        <p style="color:#555; margin-bottom:0; font-family:'Tiro Bangla', serif;">তারিখ নির্বাচন করে সরাসরি রিপোর্ট দেখতে বা প্রিন্ট করতে <strong>Download PDF</strong> বাটনে ক্লিক করুন।</p>
                    </div>
                `;
            }
        }
    }

    function injectDropdownOption() {
        const select = document.getElementById('hubReportType');
        if (!select) return false;

        if (!select.querySelector('option[value="daily_income_expense_statement"]')) {
            const opt = document.createElement('option');
            opt.value = 'daily_income_expense_statement';
            opt.innerText = 'Daily Income, Expense & Balance Ledger (দৈনিক আয়, ব্যয় ও স্থিতি খাতা)';
            select.appendChild(opt);
        }

        select.removeEventListener('change', handleReportTypeChange);
        select.addEventListener('change', handleReportTypeChange);
        return true;
    }

    function attachHubHooks() {
        const origPDF = window.hubDownloadPDF;
        window.hubDownloadPDF = function () {
            const select = document.getElementById('hubReportType');
            if (select && select.value === 'daily_income_expense_statement') {
                window.openDailyIncomeExpenseTab(true);
                return;
            }
            if (typeof origPDF === 'function') origPDF();
        };

        const origExcel = window.hubExportExcel;
        window.hubExportExcel = function () {
            const select = document.getElementById('hubReportType');
            if (select && select.value === 'daily_income_expense_statement') {
                window.openDailyIncomeExpenseTab(false);
                return;
            }
            if (typeof origExcel === 'function') origExcel();
        };
    }

    function init() {
        injectDropdownOption();
        attachHubHooks();
        handleReportTypeChange();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('load', init);

    let count = 0;
    const timer = setInterval(() => {
        count++;
        if (injectDropdownOption() || count > 30) clearInterval(timer);
    }, 300);

})();
