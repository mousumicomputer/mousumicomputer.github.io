/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - DAILY AUDIT & DISCREPANCY INSPECTOR (LANDSCAPE)
 * File: daily_audit_discrepancy_module.js
 * 
 * Features:
 * 1. Expected vs Actual Closing পাশাপাশি তুলনা।
 * 2. কোন তারিখে কত টাকা গরমিল (ঘাটতি বা উদ্বৃত্ত) হয়েছে তা লাল/নীল কালারে শনাক্তকরণ।
 * 3. A4 Landscape Mode, 100% Tiro Bangla Typography ও ক্রমিক (১। ২। ৩।)।
 * 4. প্রিন্ট / PDF এবং মাল্টি-কলাম Excel এক্সপোর্ট।
 * ============================================================================
 */

(function () {
    "use strict";

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

    // ডেটা প্রসেসিং ও গরমিল হিসাব
    function getAuditData() {
        let store = {};
        if (typeof window.getERPStore === 'function') {
            store = window.getERPStore();
        }

        const closings = store.dailyClosingReports || window.dailyClosingReports || [];

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

        const auditRows = [];
        let totalExpectedAll = 0;
        let totalActualAll = 0;
        let totalDiscrepancyAll = 0;
        let matchedCount = 0;
        let shortageCount = 0;
        let surplusCount = 0;

        dateList.forEach(dateStr => {
            const closedSnap = closings.find(r => String(r.report_date) === String(dateStr));
            if (!closedSnap) return;

            const opening = parseFloat(closedSnap.opening_capital) || 0;
            const pelam = parseFloat(closedSnap.total_pelam) || 0;
            const dilam = parseFloat(closedSnap.total_dilam) || 0;
            
            // হিসাব অনুযায়ী থাকার কথা = প্রারম্ভিক + পেলাম - দিলাম
            const expected = opening + pelam - dilam;
            // বাস্তবে যা গোনা হয়েছিল
            const actual = parseFloat(closedSnap.actual_closing) || 0;
            // গরমিল = বাস্তব - থাকার কথা
            const discrepancy = actual - expected;

            totalExpectedAll += expected;
            totalActualAll += actual;
            totalDiscrepancyAll += discrepancy;

            let auditStatus = "সঠিক (মিলেছে)";
            let statusType = "matched"; // matched, shortage, surplus

            if (Math.abs(discrepancy) < 0.01) {
                auditStatus = "হিসাব সঠিক (০.০০)";
                statusType = "matched";
                matchedCount++;
            } else if (discrepancy < -0.01) {
                auditStatus = "ক্যাশ ঘাটতি (টাকা কম)";
                statusType = "shortage";
                shortageCount++;
            } else {
                auditStatus = "ক্যাশ উদ্বৃত্ত (টাকা বেশি)";
                statusType = "surplus";
                surplusCount++;
            }

            const dateMeta = getBanglaDateInfo(dateStr);

            auditRows.push({
                rawDate: dateStr,
                dateText: dateMeta.formattedDate,
                dayText: dateMeta.day,
                opening,
                pelam,
                dilam,
                expected,
                actual,
                discrepancy,
                auditStatus,
                statusType
            });
        });

        const today = new Date();
        const printDateStr = today.toISOString().split('T')[0];

        return {
            dateInfo: getBanglaDateInfo(printDateStr),
            rangeText: fromDateVal && toDateVal ? `${fromDateVal} হতে ${toDateVal}` : 'সকল তারিখের অডিট প্রতিবেদন',
            auditRows,
            totalExpectedAll,
            totalActualAll,
            totalDiscrepancyAll,
            matchedCount,
            shortageCount,
            surplusCount
        };
    }

    // নতুন ট্যাবে A4 Landscape অডিট ভিউ ওপেন
    window.openDailyAuditTab = function (autoPrint = false) {
        const data = getAuditData();

        let tbodyHTML = '';
        if (data.auditRows.length === 0) {
            tbodyHTML = `<tr><td colspan="9" style="text-align:center; padding:15px; color:#555;">নির্বাচিত মেয়াদে কোনো ক্লোজিং অডিট রেকর্ড পাওয়া যায়নি</td></tr>`;
        } else {
            data.auditRows.forEach((r, i) => {
                let discColor = '#000000';
                let discSign = '';
                let statusBadgeColor = '#15803d';

                if (r.statusType === 'shortage') {
                    discColor = '#dc2626';
                    discSign = '(-) ';
                    statusBadgeColor = '#dc2626';
                } else if (r.statusType === 'surplus') {
                    discColor = '#0284c7';
                    discSign = '(+) ';
                    statusBadgeColor = '#0284c7';
                }

                tbodyHTML += `
                    <tr>
                        <td style="text-align:center; font-weight:600;">${toBn(i + 1)}।</td>
                        <td style="text-align:center; font-weight:600; white-space:nowrap;">${r.dateText} (${r.dayText})</td>
                        <td style="text-align:right;">৳ ${toBnMoney(r.opening)}</td>
                        <td style="text-align:right;">৳ ${toBnMoney(r.pelam)}</td>
                        <td style="text-align:right;">৳ ${toBnMoney(r.dilam)}</td>
                        <td style="text-align:right; font-weight:700; background:#f8fafc;">৳ ${toBnMoney(r.expected)}</td>
                        <td style="text-align:right; font-weight:700; background:#f1f5f9;">৳ ${toBnMoney(r.actual)}</td>
                        <td style="text-align:right; font-weight:800; color:${discColor};">
                            ${discSign}৳ ${toBnMoney(r.discrepancy)}
                        </td>
                        <td style="text-align:center; font-weight:700; color:${statusBadgeColor}; white-space:nowrap;">
                            ${r.auditStatus}
                        </td>
                    </tr>`;
            });
        }

        const grandSign = data.totalDiscrepancyAll > 0 ? '(+) ' : (data.totalDiscrepancyAll < 0 ? '(-) ' : '');
        const grandColor = data.totalDiscrepancyAll < 0 ? '#dc2626' : (data.totalDiscrepancyAll > 0 ? '#0284c7' : '#15803d');

        const fullHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Daily Audit & Discrepancy Ledger - Mousumi Computer</title>
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

        /* A4 Landscape পেজ */
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

        /* সারসংক্ষেপ কার্ড টেবিল */
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

        /* মূল অডিট টেবিল */
        table.audit-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
            margin-bottom: 10px;
        }
        table.audit-table th, table.audit-table td {
            border: 1px solid #000;
            padding: 4px 5px;
            line-height: 1.25;
            vertical-align: middle;
        }
        table.audit-table th {
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
            <h2>দৈনিক হিসাব গরমিল ও অডিট খতিয়ান (Daily Audit & Discrepancy Inspector)</h2>
        </div>

        <div class="meta">
            <div>সময়কাল: <strong>${escapeHTML(data.rangeText)}</strong></div>
            <div>প্রতিবেদন তারিখ: <strong>${data.dateInfo.full}</strong> | মোট কার্যদিবস: <strong>${toBn(data.auditRows.length)} দিন</strong></div>
        </div>

        <!-- ২. অডিট সারসংক্ষেপ -->
        <table class="summary-table">
            <thead>
                <tr>
                    <th style="width: 25%;">সঠিক মিলে যাওয়া দিন</th>
                    <th style="width: 25%;">ক্যাশ ঘাটতি পাওয়া দিন</th>
                    <th style="width: 25%;">ক্যাশ উদ্বৃত্ত পাওয়া দিন</th>
                    <th style="width: 25%;">সার্বিক নিট গরমিল (Variance)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="text-align: center; font-weight: 700; color: #15803d; font-size: 13px;">${toBn(data.matchedCount)} দিন (১০০% সঠিক)</td>
                    <td style="text-align: center; font-weight: 700; color: #dc2626; font-size: 13px;">${toBn(data.shortageCount)} দিন (টাকা কম)</td>
                    <td style="text-align: center; font-weight: 700; color: #0284c7; font-size: 13px;">${toBn(data.surplusCount)} দিন (টাকা বেশি)</td>
                    <td style="text-align: center; font-weight: 800; font-size: 13.5px; color:${grandColor}; border-bottom: 3px double #000;">
                        ${grandSign}৳ ${toBnMoney(data.totalDiscrepancyAll)}
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- ৩. মূল অডিট টেবিল -->
        <table class="audit-table">
            <thead>
                <tr>
                    <th style="width:4%;">ক্রমিক</th>
                    <th style="width:14%;">তারিখ ও বার</th>
                    <th style="width:10%;">প্রারম্ভিক (ক)</th>
                    <th style="width:10%;">পেলাম (খ)</th>
                    <th style="width:10%;">দিলাম (গ)</th>
                    <th style="width:13%;">থাকার কথা (ঘ = ক+খ-গ)</th>
                    <th style="width:13%;">বাস্তবে পাওয়া (ঙ)</th>
                    <th style="width:13%;">গরমিল (চ = ঙ - ঘ)</th>
                    <th style="width:13%;">অডিট ফলাফল</th>
                </tr>
            </thead>
            <tbody>
                ${tbodyHTML}
                <tr class="total-row">
                    <td colspan="5" style="text-align:right;">সর্বমোট পুঞ্জীভূত তুলনা:</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.totalExpectedAll)}</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.totalActualAll)}</td>
                    <td style="text-align:right; color:${grandColor}; border-bottom: 3px double #000;">
                        ${grandSign}৳ ${toBnMoney(data.totalDiscrepancyAll)}
                    </td>
                    <td style="text-align:center; color:${grandColor};">
                        ${data.totalDiscrepancyAll === 0 ? 'সম্পূর্ণ সঠিক' : (data.totalDiscrepancyAll < 0 ? 'সার্বিক ঘাটতি' : 'সার্বিক উদ্বৃত্ত')}
                    </td>
                </tr>
            </tbody>
        </table>

        <div style="font-size: 11px; color: #475569; margin-top: 4px;">
            * অডিট ব্যাখ্যা: যদি 'গরমিল' ঘরে লাল কালির (-) মাইনাস টাকা থাকে, তার মানে ওই দিন ড্রয়ার থেকে টাকা সরানো হয়েছে কিন্তু 'দিলাম' এন্ট্রি দেওয়া হয়নি।
        </div>

        <!-- ৪. স্বাক্ষর -->
        <div class="signature-block">
            <div class="sig-box">
                <div class="sig-line"></div>
                <div>নিরীক্ষক / হিসাবরক্ষক</div>
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
                ["MOUSUMI COMPUTER - দৈনিক হিসাব গরমিল ও অডিট খতিয়ান"],
                ["সময়কাল:", "${data.rangeText}"],
                ["প্রতিবেদন তারিখ:", "${data.dateInfo.full}"],
                [],
                ["ক্রমিক", "তারিখ ও বার", "প্রারম্ভিক (৳)", "পেলাম (৳)", "দিলাম (৳)", "থাকার কথা (৳)", "বাস্তবে পাওয়া (৳)", "গরমিল/অমিল (৳)", "অডিট ফলাফল"]
            ];

            ${JSON.stringify(data.auditRows)}.forEach((r, i) => {
                rows.push([
                    i + 1 + "।",
                    r.dateText + " (" + r.dayText + ")",
                    r.opening,
                    r.pelam,
                    r.dilam,
                    r.expected,
                    r.actual,
                    r.discrepancy,
                    r.auditStatus
                ]);
            });

            rows.push([
                "", "সর্বমোট তুলনা:", "", "", "",
                ${data.totalExpectedAll},
                ${data.totalActualAll},
                ${data.totalDiscrepancyAll},
                "${data.totalDiscrepancyAll === 0 ? 'সম্পূর্ণ সঠিক' : (data.totalDiscrepancyAll < 0 ? 'সার্বিক ঘাটতি' : 'সার্বিক উদ্বৃত্ত')}"
            ]);

            const ws = XLSX.utils.aoa_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, "Audit & Discrepancy Ledger");
            XLSX.writeFile(wb, "Daily_Audit_and_Discrepancy_Ledger.xlsx");
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

        const isLedger = select.value === 'daily_audit_discrepancy_statement';
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
                        <i class="fa-solid fa-magnifying-glass-chart" style="font-size:2.5rem; color:#dc2626; margin-bottom:10px;"></i>
                        <h4 style="font-size:1.1rem; color:#000; margin-bottom:4px; font-family:'Tiro Bangla', serif;">Daily Audit & Discrepancy Inspector</h4>
                        <p style="color:#555; margin-bottom:0; font-family:'Tiro Bangla', serif;">দৈনিক হিসাব গরমিল ও অমিল শনাক্তকরণ খতিয়ান। দেখতে বা প্রিন্ট করতে <strong>Download PDF</strong> বাটনে ক্লিক করুন।</p>
                    </div>
                `;
            }
        }
    }

    function injectDropdownOption() {
        const select = document.getElementById('hubReportType');
        if (!select) return false;

        if (!select.querySelector('option[value="daily_audit_discrepancy_statement"]')) {
            const opt = document.createElement('option');
            opt.value = 'daily_audit_discrepancy_statement';
            opt.innerText = 'Daily Audit & Discrepancy (দৈনিক হিসাব গরমিল ও অডিট খাতা)';
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
            if (select && select.value === 'daily_audit_discrepancy_statement') {
                window.openDailyAuditTab(true);
                return;
            }
            if (typeof origPDF === 'function') origPDF();
        };

        const origExcel = window.hubExportExcel;
        window.hubExportExcel = function () {
            const select = document.getElementById('hubReportType');
            if (select && select.value === 'daily_audit_discrepancy_statement') {
                window.openDailyAuditTab(false);
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
