/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - DAILY CAPITAL GROWTH & COMPREHENSIVE FINANCIAL LEDGER
 * File: daily_capital_growth_ledger_module.js
 * 
 * Features:
 * 1. পূর্ণাঙ্গ কলাম: ক্রমিক | তারিখ ও বার | প্রারম্ভিক | পেলাম | দিলাম | আয় | ব্যয় | সমাপনী স্থিতি | পরিবর্তন | অবস্থা
 * 2. মূল ক্যাশ বৃদ্ধি না হ্রাসের নিখুঁত হিসাব ও ট্র্যাকিং।
 * 3. 100% Tiro Bangla Typography, ক্রমিক (১। ২। ৩।) ও ক্লাসিক অ্যাকাউন্টিং টেবিল।
 * 4. তারিখ ফিল্টারিং, প্রিন্ট / PDF এবং মাল্টি-কলাম Excel এক্সপোর্ট।
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
        if (!dateString) return { full: "", day: "", formattedDate: "" };
        const date = new Date(dateString + "T00:00:00");
        const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
        const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
        return {
            full: `${toBn(date.getDate())} ${months[date.getMonth()]} ${toBn(date.getFullYear())}`,
            day: days[date.getDay()],
            formattedDate: `${toBn(String(date.getDate()).padStart(2, '0'))}-${toBn(String(date.getMonth() + 1).padStart(2, '0'))}-${toBn(date.getFullYear())}`
        };
    };

    // খরচের নির্ধারিত খাতসমূহের তালিকা
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

    // স্টোর থেকে ডেটা প্রসেসিং
    function getCapitalGrowthData() {
        let store = {};
        if (typeof window.getERPStore === 'function') {
            store = window.getERPStore();
        }

        const closings = store.dailyClosingReports || window.dailyClosingReports || [];
        const customers = store.customers || window.customers || [];
        const transactions = store.customerTransactions || window.customerTransactions || [];

        // খরচের কাস্টমার আইডি সংগ্রহ
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

        let dateList = closings.map(r => r.report_date).filter(Boolean);
        dateList = Array.from(new Set(dateList)).sort((a, b) => a.localeCompare(b));

        if (fromDateVal && toDateVal) {
            dateList = dateList.filter(d => d >= fromDateVal && d <= toDateVal);
        } else if (fromDateVal) {
            dateList = dateList.filter(d => d >= fromDateVal);
        } else if (toDateVal) {
            dateList = dateList.filter(d => d <= toDateVal);
        }

        const ledgerRows = [];
        let grandTotalPelam = 0;
        let grandTotalDilam = 0;
        let grandTotalIncome = 0;
        let grandTotalExpense = 0;

        dateList.forEach(dateStr => {
            const closedSnap = closings.find(r => String(r.report_date) === String(dateStr));
            const opening = closedSnap ? (parseFloat(closedSnap.opening_capital) || 0) : 0;
            const pelam = closedSnap ? (parseFloat(closedSnap.total_pelam) || 0) : 0;
            const dilam = closedSnap ? (parseFloat(closedSnap.total_dilam) || 0) : 0;
            const income = closedSnap ? (parseFloat(closedSnap.income) || 0) : 0;
            const closing = closedSnap ? (parseFloat(closedSnap.actual_closing) || 0) : 0;

            // ব্যয় হিসাব
            let expense = 0;
            const dayTxs = transactions.filter(t => String(t.date) === String(dateStr));
            dayTxs.forEach(t => {
                const isExp = expenseCustomerIds.has(String(t.customerId)) || isExpenseCustomer(t.customerName);
                if (isExp) {
                    expense += (parseFloat(t.debit) || 0);
                }
            });

            // পুঁজির পরিবর্তন (সমাপনী - প্রারম্ভিক)
            const change = closing - opening;
            let statusText = "সমান";
            if (change > 0.009) statusText = "বৃদ্ধি";
            else if (change < -0.009) statusText = "হ্রাস";

            grandTotalPelam += pelam;
            grandTotalDilam += dilam;
            grandTotalIncome += income;
            grandTotalExpense += expense;

            const dateMeta = getBanglaDateInfo(dateStr);

            ledgerRows.push({
                rawDate: dateStr,
                dateText: dateMeta.formattedDate,
                dayText: dateMeta.day,
                opening,
                pelam,
                dilam,
                income,
                expense,
                closing,
                change,
                statusText
            });
        });

        const initialOpening = ledgerRows.length > 0 ? ledgerRows[0].opening : 0;
        const finalClosing = ledgerRows.length > 0 ? ledgerRows[ledgerRows.length - 1].closing : 0;
        const totalNetGrowth = finalClosing - initialOpening;

        const today = new Date();
        const printDateStr = today.toISOString().split('T')[0];

        return {
            dateInfo: getBanglaDateInfo(printDateStr),
            rangeText: fromDateVal && toDateVal ? `${fromDateVal} হতে ${toDateVal}` : 'সকল তারিখের প্রতিবেদন',
            ledgerRows,
            initialOpening,
            finalClosing,
            totalNetGrowth,
            grandTotalPelam,
            grandTotalDilam,
            grandTotalIncome,
            grandTotalExpense
        };
    }

    // নতুন ট্যাবে প্রিন্ট ভিউ ওপেন
    window.openCapitalGrowthLedgerTab = function (autoPrint = false) {
        const data = getCapitalGrowthData();

        let tbodyHTML = '';
        if (data.ledgerRows.length === 0) {
            tbodyHTML = `<tr><td colspan="10" style="text-align:center; padding:15px; color:#555;">নির্বাচিত মেয়াদে কোনো ক্লোজিং ডাটা পাওয়া যায়নি</td></tr>`;
        } else {
            data.ledgerRows.forEach((r, i) => {
                const isGrowth = r.change >= 0;
                const changeSign = r.change > 0 ? '(+)' : (r.change < 0 ? '(-)' : '');

                tbodyHTML += `
                    <tr>
                        <td style="text-align:center; font-weight:600;">${toBn(i + 1)}।</td>
                        <td style="text-align:center;">${r.dateText}<br><span style="font-size:11.5px; color:#475569;">(${r.dayText})</span></td>
                        <td style="text-align:right;">৳ ${toBnMoney(r.opening)}</td>
                        <td style="text-align:right; font-weight:600;">৳ ${toBnMoney(r.pelam)}</td>
                        <td style="text-align:right; font-weight:600;">৳ ${toBnMoney(r.dilam)}</td>
                        <td style="text-align:right; font-weight:700;">৳ ${toBnMoney(r.income)}</td>
                        <td style="text-align:right; font-weight:600;">৳ ${toBnMoney(r.expense)}</td>
                        <td style="text-align:right; font-weight:700;">৳ ${toBnMoney(r.closing)}</td>
                        <td style="text-align:right; font-weight:800; color:${isGrowth ? '#000' : '#dc2626'};">
                            ${changeSign} ৳ ${toBnMoney(r.change)}
                        </td>
                        <td style="text-align:center; font-weight:700; color:${isGrowth ? '#15803d' : '#dc2626'};">
                            ${r.statusText}
                        </td>
                    </tr>`;
            });
        }

        const overallSign = data.totalNetGrowth > 0 ? '(+)' : (data.totalNetGrowth < 0 ? '(-)' : '');
        const overallStatus = data.totalNetGrowth > 0 ? 'বৃদ্ধি পেয়েছে' : (data.totalNetGrowth < 0 ? 'হ্রাস পেয়েছে' : 'অপরিবর্তিত');

        const fullHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Daily Capital Growth & Comprehensive Ledger - Mousumi Computer</title>
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
            font-size: 13px;
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
            padding: 12mm 12mm;
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
            font-size: 12px;
            margin-bottom: 10px;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
        }

        /* সারসংক্ষেপ টেবিল */
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
            margin-bottom: 14px;
        }
        .summary-table th, .summary-table td {
            border: 1px solid #000;
            padding: 4px 6px;
        }
        .summary-table th {
            background: #f1f5f9;
            font-weight: 700;
        }

        /* মূল লেজার টেবিল */
        table.main-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-bottom: 14px;
        }
        table.main-table th, table.main-table td {
            border: 1px solid #000;
            padding: 4px 4px;
            line-height: 1.25;
            vertical-align: middle;
        }
        table.main-table th {
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
            @page { size: A4 portrait; margin: 8mm; }
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
            <h2>মূল ক্যাশ বৃদ্ধি-হ্রাস ও সমন্বিত খতিয়ান (Capital Growth & Comprehensive Ledger)</h2>
        </div>

        <div class="meta">
            <div>সময়কাল: <strong>${escapeHTML(data.rangeText)}</strong></div>
            <div>প্রতিবেদন তারিখ: <strong>${data.dateInfo.full}</strong> | মোট কার্যদিবস: <strong>${toBn(data.ledgerRows.length)} দিন</strong></div>
        </div>

        <!-- ২. সারসংক্ষেপ সারসংক্ষেপ -->
        <table class="summary-table">
            <thead>
                <tr>
                    <th style="width: 35%;">মেয়াদের শুরুর মোট মূলধন</th>
                    <th style="width: 35%;">মেয়াদের সমাপনী মোট স্থিতি</th>
                    <th style="width: 30%;">সার্বিক মূলধন পরিবর্তন</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center; font-weight: 700; font-size: 13.5px;">৳ ${toBnMoney(data.initialOpening)}</td>
                    <td style="text-align: center; font-weight: 700; font-size: 13.5px;">৳ ${toBnMoney(data.finalClosing)}</td>
                    <td style="text-align: center; font-weight: 800; font-size: 13.5px; border-bottom: 3px double #000;">
                        ${overallSign} ৳ ${toBnMoney(data.totalNetGrowth)} (${overallStatus})
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- ৩. মূল সমন্বিত টেবিল -->
        <table class="main-table">
            <thead>
                <tr>
                    <th style="width:5%;">ক্রমিক</th>
                    <th style="width:13%;">তারিখ ও বার</th>
                    <th style="width:10%;">প্রারম্ভিক (৳)</th>
                    <th style="width:10%;">পেলাম (+)</th>
                    <th style="width:10%;">দিলাম (-)</th>
                    <th style="width:10%;">আয় (৳)</th>
                    <th style="width:9%;">ব্যয় (৳)</th>
                    <th style="width:11%;">সমাপনী স্থিতি (৳)</th>
                    <th style="width:13%;">পরিবর্তন (৳)</th>
                    <th style="width:9%;">অবস্থা</th>
                </tr>
            </thead>
            <tbody>
                ${tbodyHTML}
                <tr class="total-row">
                    <td colspan="3" style="text-align:right;">সর্বমোট যোগফল:</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalPelam)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalDilam)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalIncome)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalExpense)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.finalClosing)}</td>
                    <td style="text-align:right; border-bottom: 3px double #000;">${overallSign} ৳ ${toBnMoney(data.totalNetGrowth)}</td>
                    <td style="text-align:center;">${data.totalNetGrowth >= 0 ? 'বৃদ্ধি' : 'হ্রাস'}</td>
                </tr>
            </tbody>
        </table>

        <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            * ব্যয় খাতের অন্তর্ভুক্ত: দোকানের ব্যয়, বাড়ি খরচ, ইএসডিও ও টিএমএসএস।
        </div>

        <!-- ৪. স্বাক্ষর -->
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
                ["MOUSUMI COMPUTER - মূল ক্যাশ বৃদ্ধি-হ্রাস ও সমন্বিত খতিয়ান"],
                ["সময়কাল:", "${data.rangeText}"],
                ["প্রতিবেদন তারিখ:", "${data.dateInfo.full}"],
                [],
                ["ক্রমিক", "তারিখ", "বার", "প্রারম্ভিক (৳)", "পেলাম (+)", "দিলাম (-)", "আয় (৳)", "ব্যয় (৳)", "সমাপনী স্থিতি (৳)", "পরিবর্তন (৳)", "অবস্থা"]
            ];

            ${JSON.stringify(data.ledgerRows)}.forEach((r, i) => {
                rows.push([
                    i + 1 + "।",
                    r.dateText,
                    r.dayText,
                    r.opening,
                    r.pelam,
                    r.dilam,
                    r.income,
                    r.expense,
                    r.closing,
                    r.change,
                    r.statusText
                ]);
            });

            rows.push([
                "", "সর্বমোট যোগফল:", "",
                ${data.initialOpening},
                ${data.grandTotalPelam},
                ${data.grandTotalDilam},
                ${data.grandTotalIncome},
                ${data.grandTotalExpense},
                ${data.finalClosing},
                ${data.totalNetGrowth},
                "${data.totalNetGrowth >= 0 ? 'বৃদ্ধি' : 'হ্রাস'}"
            ]);

            const ws = XLSX.utils.aoa_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, "Capital Growth Ledger");
            XLSX.writeFile(wb, "Daily_Capital_Growth_and_Ledger.xlsx");
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

        const isLedger = select.value === 'daily_capital_growth_statement';
        const fromDateGroup = document.getElementById('hubFromDate')?.closest('.rpt-control-group');
        const toDateGroup = document.getElementById('hubToDate')?.closest('.rpt-control-group');
        const shortcutsBar = document.querySelector('.rpt-quick-dates');
        const previewBtn = document.querySelector('.rpt-btn-dark');
        const previewCard = document.getElementById('hub-report-print-area');

        if (isLedger) {
            if (fromDateGroup) fromDateGroup.style.display = 'flex';
            if (toDateGroup) toDateGroup.style.display = 'flex';
            if (shortcutsBar) shortcutsBar.style.display = 'flex';
            if (previewBtn) previewBtn.style.display = 'none';
            
            if (previewCard) {
                previewCard.innerHTML = `
                    <div class="rpt-placeholder-state" style="padding: 35px 20px; text-align: center;">
                        <i class="fa-solid fa-chart-line" style="font-size:2.5rem; color:#0f172a; margin-bottom:10px;"></i>
                        <h4 style="font-size:1.1rem; color:#000; margin-bottom:4px; font-family:'Tiro Bangla', serif;">Capital Growth & Comprehensive Ledger</h4>
                        <p style="color:#555; margin-bottom:0; font-family:'Tiro Bangla', serif;">মূল ক্যাশ বৃদ্ধি-হ্রাসের পূর্ণাঙ্গ সমন্বিত খতিয়ান। দেখতে বা প্রিন্ট করতে <strong>Download PDF</strong> বাটনে ক্লিক করুন।</p>
                    </div>
                `;
            }
        }
    }

    function injectDropdownOption() {
        const select = document.getElementById('hubReportType');
        if (!select) return false;

        if (!select.querySelector('option[value="daily_capital_growth_statement"]')) {
            const opt = document.createElement('option');
            opt.value = 'daily_capital_growth_statement';
            opt.innerText = 'Capital Growth & Comprehensive Ledger (মূল ক্যাশ বৃদ্ধি-হ্রাস ও পূর্ণাঙ্গ খতিয়ান)';
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
            if (select && select.value === 'daily_capital_growth_statement') {
                window.openCapitalGrowthLedgerTab(true);
                return;
            }
            if (typeof origPDF === 'function') origPDF();
        };

        const origExcel = window.hubExportExcel;
        window.hubExportExcel = function () {
            const select = document.getElementById('hubReportType');
            if (select && select.value === 'daily_capital_growth_statement') {
                window.openCapitalGrowthLedgerTab(false);
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
