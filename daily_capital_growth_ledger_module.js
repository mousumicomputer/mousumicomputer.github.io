/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - CAPITAL GROWTH & ROOT-CAUSE ANALYSIS LEDGER (LANDSCAPE)
 * File: daily_capital_growth_ledger_module.js
 * 
 * Features:
 * 1. A4 Landscape Mode: কোনো লেখা ২ লাইনে ভাঙবে না, এক পাতায় সম্পূর্ণ পরিপাটি।
 * 2. কেন বৃদ্ধি বা হ্রাস পেল তার স্বয়ংক্রিয় কারণ বিশ্লেষণ (Root-Cause Analysis)।
 * 3. 100% Tiro Bangla Typography & ক্রমিক (১। ২। ৩।)।
 * 4. প্রিন্ট / PDF এবং মাল্টি-কলাম Excel এক্সপোর্ট।
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

    // খরচের খাত
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

    // ডেটা প্রসেসিং ও বৃদ্ধির/হ্রাসের কারণ বের করা
    function getCapitalGrowthData() {
        let store = {};
        if (typeof window.getERPStore === 'function') {
            store = window.getERPStore();
        }

        const closings = store.dailyClosingReports || window.dailyClosingReports || [];
        const customers = store.customers || window.customers || [];
        const transactions = store.customerTransactions || window.customerTransactions || [];

        const expenseCustomerIds = new Set();
        customers.forEach(c => {
            if (isExpenseCustomer(c.name)) {
                expenseCustomerIds.add(String(c.id));
            }
        });

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

            let expense = 0;
            const dayTxs = transactions.filter(t => String(t.date) === String(dateStr));
            dayTxs.forEach(t => {
                const isExp = expenseCustomerIds.has(String(t.customerId)) || isExpenseCustomer(t.customerName);
                if (isExp) {
                    expense += (parseFloat(t.debit) || 0);
                }
            });

            // পরিবর্তন ও লেনদেনের নিট প্রভাব
            const change = closing - opening;
            const cashFlowNet = pelam - dilam; // পেলাম - দিলাম

            // কেন বাড়ল বা কমল তার কারণ নির্ণয়
            let reasonText = "";
            let statusText = "সমান";

            if (change > 0.009) {
                statusText = "বৃদ্ধি";
                if (cashFlowNet > 0 && income > 0) {
                    reasonText = "আদায় ও আয় বেশি";
                } else if (cashFlowNet > 0) {
                    reasonText = "নগদ আদায়/পেলাম বেশি";
                } else {
                    reasonText = "ব্যবসায়িক আয় বৃদ্ধি";
                }
            } else if (change < -0.009) {
                statusText = "হ্রাস";
                if (cashFlowNet < 0 && expense > 0) {
                    reasonText = "প্রদান/বাকি ও খরচ বেশি";
                } else if (cashFlowNet < 0) {
                    reasonText = "প্রদান/বাকি দেওয়া বেশি";
                } else if (income < 0) {
                    reasonText = "আয় ঘাটতি/ক্ষতি";
                } else {
                    reasonText = "ক্যাশ আউটফ্লো বেশি";
                }
            } else {
                reasonText = "ব্যালেন্স অপরিবর্তিত";
            }

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
                cashFlowNet,
                income,
                expense,
                closing,
                change,
                statusText,
                reasonText
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

    // নতুন ট্যাবে A4 Landscape প্রিন্ট ভিউ
    window.openCapitalGrowthLedgerTab = function (autoPrint = false) {
        const data = getCapitalGrowthData();

        let tbodyHTML = '';
        if (data.ledgerRows.length === 0) {
            tbodyHTML = `<tr><td colspan="11" style="text-align:center; padding:15px; color:#555;">নির্বাচিত মেয়াদে কোনো ক্লোজিং ডাটা পাওয়া যায়নি</td></tr>`;
        } else {
            data.ledgerRows.forEach((r, i) => {
                const isGrowth = r.change >= 0;
                const changeSign = r.change > 0 ? '(+)' : (r.change < 0 ? '(-)' : '');
                const flowSign = r.cashFlowNet > 0 ? '(+)' : (r.cashFlowNet < 0 ? '(-)' : '');

                tbodyHTML += `
                    <tr>
                        <td style="text-align:center; font-weight:600;">${toBn(i + 1)}।</td>
                        <td style="text-align:center; font-weight:600; white-space:nowrap;">${r.dateText} (${r.dayText})</td>
                        <td style="text-align:right;">৳ ${toBnMoney(r.opening)}</td>
                        <td style="text-align:right;">৳ ${toBnMoney(r.pelam)}</td>
                        <td style="text-align:right;">৳ ${toBnMoney(r.dilam)}</td>
                        <td style="text-align:right; font-weight:600; color:${r.cashFlowNet >= 0 ? '#000' : '#dc2626'};">
                            ${flowSign} ৳ ${toBnMoney(r.cashFlowNet)}
                        </td>
                        <td style="text-align:right; font-weight:700;">৳ ${toBnMoney(r.income)}</td>
                        <td style="text-align:right;">৳ ${toBnMoney(r.expense)}</td>
                        <td style="text-align:right; font-weight:700;">৳ ${toBnMoney(r.closing)}</td>
                        <td style="text-align:right; font-weight:800; color:${isGrowth ? '#000' : '#dc2626'};">
                            ${changeSign} ৳ ${toBnMoney(r.change)}
                        </td>
                        <td style="text-align:center; font-size:12px; font-weight:600; color:${isGrowth ? '#15803d' : '#b91c1c'}; white-space:nowrap;">
                            ${r.statusText} (${r.reasonText})
                        </td>
                    </tr>`;
            });
        }

        const overallSign = data.totalNetGrowth > 0 ? '(+)' : (data.totalNetGrowth < 0 ? '(-)' : '');
        const overallStatus = data.totalNetGrowth > 0 ? 'বৃদ্ধি পেয়েছে' : (data.totalNetGrowth < 0 ? 'হ্রাস পেয়েছে' : 'অপরিবর্তিত');
        const grandFlow = data.grandTotalPelam - data.grandTotalDilam;
        const grandFlowSign = grandFlow > 0 ? '(+)' : (grandFlow < 0 ? '(-)' : '');

        const fullHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Capital Growth & Cause Analysis Ledger - Mousumi Computer</title>
    <!-- Google Fonts: Tiro Bangla -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"><\/script>
    
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 15px 0;
            background: #cbd5e1;
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
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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

        /* A4 Landscape পেজ সাইজ */
        .page-container {
            width: 297mm;
            margin: 0 auto;
            background: #fff;
            padding: 10mm 12mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.15);
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 4px;
            margin-bottom: 8px;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.5px;
        }
        .header h2 {
            margin: 2px 0 0 0;
            font-size: 14.5px;
            font-weight: 600;
        }

        .meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 3px;
        }

        /* সারসংক্ষেপ */
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
            margin-bottom: 10px;
        }
        .summary-table th, .summary-table td {
            border: 1px solid #000;
            padding: 4px 6px;
        }
        .summary-table th {
            background: #f1f5f9;
            font-weight: 700;
        }

        /* মূল লেজার টেবিল (Landscape) */
        table.main-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
            margin-bottom: 10px;
        }
        table.main-table th, table.main-table td {
            border: 1px solid #000;
            padding: 4px 5px;
            line-height: 1.2;
            vertical-align: middle;
        }
        table.main-table th {
            background-color: #f1f5f9;
            font-weight: 700;
            text-align: center;
            white-space: nowrap;
        }
        .total-row td {
            font-weight: 800;
            border-top: 1.5px solid #000;
            border-bottom: 2px solid #000;
            background-color: #f8fafc;
        }

        .signature-block {
            margin-top: 25px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        .sig-box {
            width: 170px;
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
            @page { size: A4 landscape; margin: 8mm 10mm; }
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
            <h2>মূল ক্যাশ বৃদ্ধি-হ্রাস ও কারণ বিশ্লেষণ খতিয়ান (Capital Growth & Cause Analysis Ledger)</h2>
        </div>

        <div class="meta">
            <div>সময়কাল: <strong>${escapeHTML(data.rangeText)}</strong></div>
            <div>প্রতিবেদন তারিখ: <strong>${data.dateInfo.full}</strong> | মোট কার্যদিবস: <strong>${toBn(data.ledgerRows.length)} দিন</strong></div>
        </div>

        <!-- ২. সারসংক্ষেপ -->
        <table class="summary-table">
            <thead>
                <tr>
                    <th style="width: 25%;">শুরুর মোট মূলধন</th>
                    <th style="width: 25%;">সমাপনী মোট স্থিতি</th>
                    <th style="width: 25%;">নগদ প্রবাহ নিট প্রভাব (পেলেন - দিলেন)</th>
                    <th style="width: 25%;">সার্বিক মূলধন পরিবর্তন ও অবস্থা</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center; font-weight: 700; font-size: 13px;">৳ ${toBnMoney(data.initialOpening)}</td>
                    <td style="text-align: center; font-weight: 700; font-size: 13px;">৳ ${toBnMoney(data.finalClosing)}</td>
                    <td style="text-align: center; font-weight: 700; font-size: 13px; color:${grandFlow >= 0 ? '#000' : '#dc2626'};">
                        ${grandFlowSign} ৳ ${toBnMoney(grandFlow)}
                    </td>
                    <td style="text-align: center; font-weight: 800; font-size: 13px; border-bottom: 3px double #000;">
                        ${overallSign} ৳ ${toBnMoney(data.totalNetGrowth)} (${overallStatus})
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- ৩. মূল ল্যান্ডস্কেপ টেবিল -->
        <table class="main-table">
            <thead>
                <tr>
                    <th style="width:4%;">ক্রমিক</th>
                    <th style="width:13%;">তারিখ ও বার</th>
                    <th style="width:9%;">প্রারম্ভিক (৳)</th>
                    <th style="width:9%;">পেলাম (+)</th>
                    <th style="width:9%;">দিলাম (-)</th>
                    <th style="width:10%;">প্রভাব (পেল-দিল)</th>
                    <th style="width:8%;">আয় (৳)</th>
                    <th style="width:7%;">ব্যয় (৳)</th>
                    <th style="width:10%;">সমাপনী স্থিতি (৳)</th>
                    <th style="width:9%;">পরিবর্তন (৳)</th>
                    <th style="width:12%;">কেন বাড়ল / কমল (কারণ)</th>
                </tr>
            </thead>
            <tbody>
                ${tbodyHTML}
                <tr class="total-row">
                    <td colspan="3" style="text-align:right;">সর্বমোট যোগফল:</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalPelam)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalDilam)}</td>
                    <td style="text-align:right;">${grandFlowSign} ৳ ${toBnMoney(grandFlow)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalIncome)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.grandTotalExpense)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.finalClosing)}</td>
                    <td style="text-align:right; border-bottom: 3px double #000;">${overallSign} ৳ ${toBnMoney(data.totalNetGrowth)}</td>
                    <td style="text-align:center;">${data.totalNetGrowth >= 0 ? 'সার্বিক বৃদ্ধি' : 'সার্বিক হ্রাস'}</td>
                </tr>
            </tbody>
        </table>

        <div style="font-size: 11px; color: #475569; margin-top: 3px;">
            * সূত্র: ক্যাশের পরিবর্তন = (পেলাম - দিলাম) + আয়। ব্যয় খাতের অন্তর্ভুক্ত: দোকানের ব্যয়, বাড়ি খরচ, ইএসডিও ও টিএমএসএস।
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
                ["MOUSUMI COMPUTER - মূল ক্যাশ বৃদ্ধি-হ্রাস ও কারণ বিশ্লেষণ খতিয়ান"],
                ["সময়কাল:", "${data.rangeText}"],
                ["প্রতিবেদন তারিখ:", "${data.dateInfo.full}"],
                [],
                ["ক্রমিক", "তারিখ ও বার", "প্রারম্ভিক (৳)", "পেলাম (+)", "দিলাম (-)", "প্রভাব (পেল-দিল)", "আয় (৳)", "ব্যয় (৳)", "সমাপনী স্থিতি (৳)", "পরিবর্তন (৳)", "অবস্থা ও কারণ"]
            ];

            ${JSON.stringify(data.ledgerRows)}.forEach((r, i) => {
                rows.push([
                    i + 1 + "।",
                    r.dateText + " (" + r.dayText + ")",
                    r.opening,
                    r.pelam,
                    r.dilam,
                    r.cashFlowNet,
                    r.income,
                    r.expense,
                    r.closing,
                    r.change,
                    r.statusText + " (" + r.reasonText + ")"
                ]);
            });

            rows.push([
                "", "সর্বমোট যোগফল:",
                ${data.initialOpening},
                ${data.grandTotalPelam},
                ${data.grandTotalDilam},
                ${grandFlow},
                ${data.grandTotalIncome},
                ${data.grandTotalExpense},
                ${data.finalClosing},
                ${data.totalNetGrowth},
                "${data.totalNetGrowth >= 0 ? 'সার্বিক বৃদ্ধি' : 'সার্বিক হ্রাস'}"
            ]);

            const ws = XLSX.utils.aoa_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, "Capital Growth & Cause Ledger");
            XLSX.writeFile(wb, "Capital_Growth_and_Cause_Ledger.xlsx");
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
                        <h4 style="font-size:1.1rem; color:#000; margin-bottom:4px; font-family:'Tiro Bangla', serif;">Capital Growth & Cause Analysis Ledger</h4>
                        <p style="color:#555; margin-bottom:0; font-family:'Tiro Bangla', serif;">মূল ক্যাশ বৃদ্ধি-হ্রাসের কারণ বিশ্লেষণ খতিয়ান। দেখতে বা প্রিন্ট করতে <strong>Download PDF</strong> বাটনে ক্লিক করুন।</p>
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
            opt.innerText = 'Capital Growth & Cause Analysis (মূল ক্যাশ বৃদ্ধি-হ্রাসের কারণ বিশ্লেষণ)';
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
