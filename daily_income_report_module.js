/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - DAILY INCOME & CAPITAL RECONCILIATION MODULE
 * File: daily_income_report_module.js
 * 
 * Features:
 * 1. 1-Page Official Capital Reconciliation & Net Income Statement.
 * 2. Real-time Live calculation + Historical Closed Snapshot Sync.
 * 3. Tiro Bangla Typography & Cross-Device Embedded Web Fonts.
 * 4. Print-Ready 1-Page A4 PDF, Live Preview & Excel Export.
 * ============================================================================
 */

(function () {
    "use strict";

    // ১. বাংলা সংখ্যা ও ফরম্যাটিং হেল্পার
    const BN_DIGITS = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
    const toBn = (val) => String(val ?? "").replace(/\d/g, d => BN_DIGITS[d]);

    const toBnMoney = (val) => {
        const num = Number(val) || 0;
        const fmt = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(num));
        return fmt.replace(/\d/g, d => BN_DIGITS[d]);
    };

    const toEnMoney = (val) => {
        const num = Number(val) || 0;
        return new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);
    };

    const escapeHTML = (str) => String(str ?? "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);

    const getBanglaDate = (dateString) => {
        if (!dateString) return { day: "", date: "", month: "", year: "" };
        const date = new Date(dateString + "T00:00:00");
        const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
        const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
        return {
            day: days[date.getDay()],
            date: toBn(date.getDate()),
            month: months[date.getMonth()],
            year: toBn(date.getFullYear())
        };
    };

    // ২. সিএসএস স্টাইল
    const incomeModuleStyles = `
        <style id="custom-income-report-styles">
            @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

            .dcr-statement-card {
                background: #ffffff;
                border: 1.5px solid #000;
                padding: 25px;
                max-width: 800px;
                margin: 0 auto;
                font-family: 'Tiro Bangla', serif;
                color: #000;
            }
            .dcr-stmt-header {
                text-align: center;
                border-bottom: 2px solid #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
            }
            .dcr-stmt-header h2 {
                margin: 0;
                font-size: 22px;
                font-weight: bold;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }
            .dcr-stmt-header h4 {
                margin: 4px 0 0 0;
                font-size: 13px;
                font-weight: bold;
                color: #1e293b;
                text-transform: uppercase;
            }
            .dcr-stmt-meta {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin-bottom: 15px;
                font-weight: 600;
            }
            .dcr-rec-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            .dcr-rec-table td {
                border: 1.5px solid #000;
                padding: 12px 16px;
                font-size: 13px;
            }
            .dcr-rec-table tr.highlight-income {
                background-color: #eef2ff;
                font-weight: 900;
                font-size: 14.5px;
            }
            .dcr-rec-table tr.expected-row {
                background-color: #f8fafc;
                font-weight: 700;
            }
            .dcr-stmt-footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                margin-top: 50px;
                padding-top: 10px;
            }
            .dcr-sig-box-ind {
                width: 190px;
                text-align: center;
            }
            .dcr-sig-line-ind {
                border-top: 1.5px solid #000;
                margin-bottom: 5px;
            }
        </style>
    `;

    // ৩. লাইভ স্টোর রিডার
    function getLiveERPStore() {
        if (typeof window.getERPStore === 'function') {
            return window.getERPStore();
        }
        return {
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
    }

    // ৪. ডেইলি রিকনসিলিয়েশন ও লাভ-ক্ষতি ক্যালকুলেশন ইঞ্জিন
    function calculateDailyReconciliationData(selectedDate) {
        const store = getLiveERPStore();
        const reports = Array.isArray(store.dailyClosingReports) ? store.dailyClosingReports : [];
        const closedSnap = reports.find(r => String(r.report_date) === String(selectedDate));

        // ক. যদি হিস্ট্রিতে সংরক্ষিত রেকর্ড থাকে
        if (closedSnap) {
            return {
                reportDate: selectedDate,
                reportTime: closedSnap.closing_time || "11:59:59 PM",
                reportId: closedSnap.report_id || `DCR-${Date.now()}`,
                openingCapital: parseFloat(closedSnap.opening_capital) || 0,
                totalPelam: parseFloat(closedSnap.total_pelam) || 0,
                totalDilam: parseFloat(closedSnap.total_dilam) || 0,
                expectedClosing: parseFloat(closedSnap.expected_closing) || 0,
                actualClosing: parseFloat(closedSnap.actual_closing) || 0,
                netIncome: parseFloat(closedSnap.income) || 0,
                status: "CLOSED"
            };
        }

        // খ. আজকের লাইভ রানিং দিনের হিসাব
        let sortedReports = reports
            .filter(r => r.report_date < selectedDate)
            .sort((a, b) => b.report_date.localeCompare(a.report_date));
        
        const openingCapital = sortedReports.length > 0 ? parseFloat(sortedReports[0].actual_closing) : 50000;

        // কাস্টমার লেনদেন (দিল-পেল)
        let totalPelam = 0;
        let totalDilam = 0;
        const txs = Array.isArray(store.customerTransactions) ? store.customerTransactions : [];
        txs.filter(t => String(t.date) === String(selectedDate)).forEach(t => {
            totalPelam += parseFloat(t.credit) || 0;
            totalDilam += parseFloat(t.debit) || 0;
        });

        // মোট সমাপনী সম্পদ (Actual Closing Assets)
        const categories = Array.isArray(store.categories) ? store.categories : [];
        const accounts = Array.isArray(store.accounts) ? store.accounts : [];
        const balanceStore = store.balanceStore || {};
        let actualSumHead = 0;

        accounts.forEach(acc => {
            const cat = categories.find(c => c.id === acc.catId);
            if (cat) {
                const catName = (cat.name || '').toLowerCase();
                if (catName.includes('bank') || catName.includes('agent') || catName.includes('personal') || catName.includes('recharge')) {
                    actualSumHead += parseFloat(balanceStore[acc.id]) || 0;
                }
            }
        });

        // ক্যাশ ইনভেন্টরি
        const cashQuantities = store.cashQuantities || {};
        [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1].forEach(d => {
            actualSumHead += (parseInt(cashQuantities[d], 10) || 0) * d;
        });
        actualSumHead += parseFloat(store.cashOthersAmount) || 0;

        // কার্ড ইনভেন্টরি
        const cardConfig = store.cardConfig || {};
        const cardQuantities = store.cardQuantities || {};
        ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
            const cards = Array.isArray(cardConfig[op]) ? cardConfig[op] : Object.values(cardConfig[op] || {});
            const qMap = cardQuantities[op] || {};
            cards.filter(c => c.active !== false).forEach(c => {
                actualSumHead += (parseInt(qMap[c.id], 10) || 0) * (c.price || 0);
            });
        });

        const expectedClosing = openingCapital + totalPelam - totalDilam;
        const netIncome = actualSumHead - expectedClosing;

        const now = new Date();
        return {
            reportDate: selectedDate,
            reportTime: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
            reportId: `DCR-${Date.now()}`,
            openingCapital,
            totalPelam,
            totalDilam,
            expectedClosing,
            actualClosing: actualSumHead,
            netIncome,
            status: "OPEN (LIVE)"
        };
    }

    // ৫. ১ পাতার প্রিভিউ জেনারেটর HTML
    window.renderDailyIncomeStatementPreview = function (selectedDate, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const data = calculateDailyReconciliationData(selectedDate);
        const dateInfo = getBanglaDate(selectedDate);

        container.innerHTML = `
            <div class="dcr-statement-card">
                <div class="dcr-stmt-header">
                    <h2>MOUSUMI COMPUTER</h2>
                    <h4>DAILY CAPITAL RECONCILIATION & NET INCOME STATEMENT</h4>
                    <div style="font-size:11px; margin-top:3px; color:#475569;">দিনের লাভ-ক্ষতি ও পুঁজি সমন্বয় বিবরণী</div>
                </div>

                <div class="dcr-stmt-meta">
                    <div><strong>তারিখ:</strong> ${dateInfo.date} ${dateInfo.month} ${dateInfo.year} (${dateInfo.day})</div>
                    <div><strong>রিপোর্ট আইডি:</strong> ${data.reportId}</div>
                    <div><strong>স্ট্যাটাস:</strong> <span style="color:${data.status === 'CLOSED' ? '#15803d' : '#b45309'}; font-weight:bold;">${data.status}</span></div>
                </div>

                <table class="dcr-rec-table">
                    <tr>
                        <td style="width:65%; font-weight:600;">Opening Capital (প্রারম্ভিক মূলধন)</td>
                        <td style="width:35%; text-align:right; font-weight:700;">৳ ${toEnMoney(data.openingCapital)}</td>
                    </tr>
                    <tr>
                        <td style="color:#16a34a; font-weight:700;">Total Pelam (+) [মোট আদায়/জমা]</td>
                        <td style="text-align:right; color:#16a34a; font-weight:700;">৳ ${toEnMoney(data.totalPelam)}</td>
                    </tr>
                    <tr>
                        <td style="color:#dc2626; font-weight:700;">Total Dilam (-) [মোট বাকি/ধার দেওয়া]</td>
                        <td style="text-align:right; color:#dc2626; font-weight:700;">(৳ ${toEnMoney(data.totalDilam)})</td>
                    </tr>
                    <tr class="expected-row">
                        <td style="font-weight:700; color:#334155;">Expected Closing Capital (প্রত্যাশিত সমাপনী মূলধন)</td>
                        <td style="text-align:right; font-weight:800; color:#0f172a;">৳ ${toEnMoney(data.expectedClosing)}</td>
                    </tr>
                    <tr>
                        <td style="font-weight:700; color:#4f46e5;">Actual Closing Capital (Assets) [প্রকৃত সমাপনী সম্পদ]</td>
                        <td style="text-align:right; font-weight:800; color:#4f46e5;">৳ ${toEnMoney(data.actualClosing)}</td>
                    </tr>
                    <tr class="highlight-income">
                        <td style="font-size:15px; font-weight:800; color:#1e1b4b;">Today's Net Income (আজকের নিট আয় / কমিশন)</td>
                        <td style="text-align:right; font-size:16px; font-weight:900; color:${data.netIncome >= 0 ? '#15803d' : '#dc2626'};">
                            ৳ ${toEnMoney(data.netIncome)}
                        </td>
                    </tr>
                </table>

                <div class="dcr-stmt-footer">
                    <div style="font-size:10.5px; color:#64748b;">Generated at: ${data.reportTime} | Mousumi Computer ERP</div>
                    <div class="dcr-sig-box-ind">
                        <div class="dcr-sig-line-ind"></div>
                        <div style="font-size:11.5px; font-weight:bold;">Authorized Signature</div>
                    </div>
                </div>
            </div>
        `;
    };

    // ৬. সরাসরি ১-পাতার A4 PDF প্রিন্ট ও ডাউনলোড
    window.printDailyIncomeStatementPDF = function (selectedDate) {
        if (!selectedDate) {
            const dateInp = document.getElementById('hubFromDate') || document.getElementById('selectedReportDate');
            selectedDate = dateInp ? dateInp.value : new Date().toISOString().split('T')[0];
        }

        const data = calculateDailyReconciliationData(selectedDate);
        const dateInfo = getBanglaDate(selectedDate);

        const printHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<title>Daily Income Statement - ${data.reportDate}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

@page {
    size: A4 portrait;
    margin: 15mm 20mm 15mm 20mm;
}
* { box-sizing: border-box; }
html, body {
    margin: 0;
    padding: 0;
    width: 100%;
    background: #fff;
    color: #000;
    font-family: 'Tiro Bangla', serif;
}
.statement-wrapper {
    width: 100%;
    max-width: 720px;
    margin: 0 auto;
    border: 2px solid #000;
    padding: 25px;
}
.header {
    text-align: center;
    border-bottom: 2px solid #000;
    padding-bottom: 12px;
    margin-bottom: 18px;
}
.header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: bold;
    letter-spacing: 0.5px;
    text-transform: uppercase;
}
.header h3 {
    margin: 4px 0 0 0;
    font-size: 13.5px;
    font-weight: bold;
    text-transform: uppercase;
}
.meta-info {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
    font-weight: 600;
    margin-bottom: 20px;
}
.reconciliation-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 25px;
}
.reconciliation-table td {
    border: 1.5px solid #000;
    padding: 12px 16px;
    font-size: 13px;
}
.income-row {
    background-color: #f1f5f9;
    font-weight: bold;
    font-size: 14.5px;
}
.footer-sign {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 60px;
}
.sign-box {
    width: 200px;
    text-align: center;
}
.sign-line {
    border-top: 1.5px solid #000;
    margin-bottom: 5px;
}
@media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .statement-wrapper { page-break-inside: avoid !important; }
}
</style>
</head>
<body>
    <div class="statement-wrapper">
        <div class="header">
            <h1>MOUSUMI COMPUTER</h1>
            <h3>DAILY CAPITAL RECONCILIATION & NET INCOME STATEMENT</h3>
            <div style="font-size:12px; margin-top:3px;">দিনের লাভ-ক্ষতি ও পুঁজি সমন্বয় বিবরণী</div>
        </div>

        <div class="meta-info">
            <div><strong>তারিখ:</strong> ${dateInfo.date} ${dateInfo.month} ${dateInfo.year} (${dateInfo.day})</div>
            <div><strong>রিপোর্ট আইডি:</strong> ${data.reportId}</div>
            <div><strong>স্ট্যাটাস:</strong> ${data.status}</div>
        </div>

        <table class="reconciliation-table">
            <tr>
                <td style="width:65%; font-weight:600;">Opening Capital (প্রারম্ভিক মূলধন)</td>
                <td style="width:35%; text-align:right; font-weight:700;">৳ ${toEnMoney(data.openingCapital)}</td>
            </tr>
            <tr>
                <td style="color:#16a34a; font-weight:700;">Total Pelam (+) [মোট আদায়/জমা]</td>
                <td style="text-align:right; color:#16a34a; font-weight:700;">৳ ${toEnMoney(data.totalPelam)}</td>
            </tr>
            <tr>
                <td style="color:#dc2626; font-weight:700;">Total Dilam (-) [মোট বাকি/ধার দেওয়া]</td>
                <td style="text-align:right; color:#dc2626; font-weight:700;">(৳ ${toEnMoney(data.totalDilam)})</td>
            </tr>
            <tr style="background:#f8fafc; font-weight:700;">
                <td>Expected Closing Capital (প্রত্যাশিত সমাপনী মূলধন)</td>
                <td style="text-align:right; font-weight:800;">৳ ${toEnMoney(data.expectedClosing)}</td>
            </tr>
            <tr>
                <td style="font-weight:700;">Actual Closing Capital (Assets) [প্রকৃত সমাপনী সম্পদ]</td>
                <td style="text-align:right; font-weight:800;">৳ ${toEnMoney(data.actualClosing)}</td>
            </tr>
            <tr class="income-row">
                <td style="font-size:14px; font-weight:bold;">Today's Net Income (আজকের নিট আয় / লাভ)</td>
                <td style="text-align:right; font-size:15px; font-weight:bold;">৳ ${toEnMoney(data.netIncome)}</td>
            </tr>
        </table>

        <div class="footer-sign">
            <div style="font-size:11px; color:#475569;">Generated at: ${data.reportTime} | Mousumi Computer ERP</div>
            <div class="sign-box">
                <div class="sign-line"></div>
                <div style="font-size:12px; font-weight:bold;">Authorized Signature</div>
            </div>
        </div>
    </div>

    <script>
        window.onload = function() { setTimeout(function(){ window.focus(); window.print(); }, 350); };
        window.onafterprint = function() { setTimeout(function(){ window.close(); }, 200); };
    <\/script>
</body>
</html>
        `;

        const printWindow = window.open("", "_blank", "width=850,height=900");
        if (!printWindow) {
            alert("Print Window খোলা যায়নি! ব্রাউজারের Pop-up Allow করুন।");
            return;
        }
        printWindow.document.open();
        printWindow.document.write(printHTML);
        printWindow.document.close();
    };

    // ৭. Excel এক্সপোর্ট
    window.exportDailyIncomeStatementExcel = function (selectedDate) {
        if (!selectedDate) {
            const dateInp = document.getElementById('hubFromDate') || document.getElementById('selectedReportDate');
            selectedDate = dateInp ? dateInp.value : new Date().toISOString().split('T')[0];
        }

        const data = calculateDailyReconciliationData(selectedDate);
        const excelRows = [
            ["MOUSUMI COMPUTER - DAILY RECONCILIATION & NET INCOME STATEMENT"],
            ["Date:", selectedDate, "Report ID:", data.reportId, "Status:", data.status],
            [],
            ["PARTICULARS", "AMOUNT (BDT)"],
            ["Opening Capital", data.openingCapital],
            ["Total Pelam (+)", data.totalPelam],
            ["Total Dilam (-)", data.totalDilam],
            ["Expected Closing Capital", data.expectedClosing],
            ["Actual Closing Capital (Assets)", data.actualClosing],
            ["Today Net Income (Profit/Loss)", data.netIncome]
        ];

        if (window.XLSX) {
            const ws = XLSX.utils.aoa_to_sheet(excelRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Income Statement");
            XLSX.writeFile(wb, `Income_Statement_${selectedDate}.xlsx`);
        }
    };

    // ৮. অটো ইনিট ও ড্রপডাউনে অপশন যোগ করা
    function autoInitIncomeModule() {
        if (!document.getElementById('custom-income-report-styles')) {
            document.head.insertAdjacentHTML('beforeend', incomeModuleStyles);
        }

        // ডাউনলোড হাবের ড্রপডাউনে এই অপশনটি স্বয়ংক্রিয়ভাবে ইনজেক্ট করা
        const hubSelect = document.getElementById('hubReportType');
        if (hubSelect && !document.getElementById('opt-income-reconciliation')) {
            const opt = document.createElement('option');
            opt.id = 'opt-income-reconciliation';
            opt.value = 'daily_income_reconciliation';
            opt.innerText = "Daily Capital Reconciliation & Net Income Statement (১ পাতা)";
            hubSelect.appendChild(opt);
        }
    }

    // প্রিভিউ ইন্টারসেপ্টর
    const prevGenPreview = window.hubGeneratePreview;
    window.hubGeneratePreview = function () {
        const rptType = document.getElementById('hubReportType') ? document.getElementById('hubReportType').value : '';
        const selectedDate = document.getElementById('hubFromDate') ? document.getElementById('hubFromDate').value : '';

        if (rptType === 'daily_income_reconciliation') {
            if (!selectedDate) {
                alert("দয়া করে একটি তারিখ নির্বাচন করুন।");
                return;
            }
            window.renderDailyIncomeStatementPreview(selectedDate, 'hub-report-print-area');
            return;
        }

        if (typeof prevGenPreview === 'function') {
            prevGenPreview();
        }
    };

    // ডাউনলোড ইন্টারসেপ্টর
    const prevDownloadPDF = window.hubDownloadPDF;
    window.hubDownloadPDF = function () {
        const rptType = document.getElementById('hubReportType') ? document.getElementById('hubReportType').value : '';
        const selectedDate = document.getElementById('hubFromDate') ? document.getElementById('hubFromDate').value : '';

        if (rptType === 'daily_income_reconciliation') {
            window.printDailyIncomeStatementPDF(selectedDate);
            return;
        }

        if (typeof prevDownloadPDF === 'function') {
            prevDownloadPDF();
        }
    };

    // এক্সেল ইন্টারসেপ্টর
    const prevExportExcel = window.hubExportExcel;
    window.hubExportExcel = function () {
        const rptType = document.getElementById('hubReportType') ? document.getElementById('hubReportType').value : '';
        const selectedDate = document.getElementById('hubFromDate') ? document.getElementById('hubFromDate').value : '';

        if (rptType === 'daily_income_reconciliation') {
            window.exportDailyIncomeStatementExcel(selectedDate);
            return;
        }

        if (typeof prevExportExcel === 'function') {
            prevExportExcel();
        }
    };

    // এক্সিকিউশন
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitIncomeModule);
    } else {
        autoInitIncomeModule();
    }
    window.addEventListener('load', autoInitIncomeModule);
    setInterval(autoInitIncomeModule, 1000);

})();
