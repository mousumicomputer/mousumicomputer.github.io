/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - OFFICIAL STANDARD AUDIT & LEDGER STATEMENT
 * File: due_ledger_report_module.js
 * 
 * Features:
 * 1. 100% Plain Official Format (কোনো কালার বা অপ্রয়োজনীয় ডিজাইন নেই)
 * 2. Perfect Compact Layout (১ম পাতা থেকেই টেবিল শুরু, কোনো ফাঁকা পেজ হবে না)
 * 3. Native Crisp PDF & Print Support
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

    const getBanglaDate = () => {
        const date = new Date();
        const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
        const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
        return {
            full: `${toBn(date.getDate())} ${months[date.getMonth()]} ${toBn(date.getFullYear())}`,
            day: days[date.getDay()],
            time: date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
    };

    function getLedgerData() {
        let customers = [];
        let transactions = [];

        if (typeof window.getERPStore === 'function') {
            const store = window.getERPStore();
            customers = store.customers || [];
            transactions = store.customerTransactions || [];
        } else {
            customers = window.customers || [];
            transactions = window.customerTransactions || [];
        }

        const receivableList = [];
        const payableList = [];
        let totalReceivable = 0;
        let totalPayable = 0;

        customers.forEach(c => {
            let bal = parseFloat(c.openingBalance) || 0;
            const custTxs = transactions.filter(t => String(t.customerId) === String(c.id));
            custTxs.forEach(t => {
                bal += (parseFloat(t.debit) || 0) - (parseFloat(t.credit) || 0);
            });

            if (bal > 0.009) {
                receivableList.push({
                    name: c.name || "Unknown",
                    phone: c.phone || "-",
                    address: c.address || "-",
                    amount: bal
                });
                totalReceivable += bal;
            } else if (bal < -0.009) {
                const adv = Math.abs(bal);
                payableList.push({
                    name: c.name || "Unknown",
                    phone: c.phone || "-",
                    address: c.address || "-",
                    amount: adv
                });
                totalPayable += adv;
            }
        });

        receivableList.sort((a, b) => b.amount - a.amount);
        payableList.sort((a, b) => b.amount - a.amount);

        return {
            dateInfo: getBanglaDate(),
            receivableList,
            totalReceivable,
            payableList,
            totalPayable,
            netBalance: totalReceivable - totalPayable
        };
    }

    window.openDueAdvanceTab = function (autoDownload = false) {
        const data = getLedgerData();

        let recRows = '';
        if (data.receivableList.length === 0) {
            recRows = `<tr><td colspan="5" style="text-align:center; padding:6px; color:#555;">কোনো বকেয়া পাওনা নেই</td></tr>`;
        } else {
            data.receivableList.forEach((r, i) => {
                recRows += `
                    <tr>
                        <td style="text-align:center;">${toBn(i + 1)}</td>
                        <td style="font-weight:600;">${escapeHTML(r.name)}</td>
                        <td style="text-align:center;">${toBn(r.phone)}</td>
                        <td>${escapeHTML(r.address)}</td>
                        <td style="text-align:right; font-weight:700;">${toBnMoney(r.amount)}</td>
                    </tr>`;
            });
        }

        let payRows = '';
        if (data.payableList.length === 0) {
            payRows = `<tr><td colspan="5" style="text-align:center; padding:6px; color:#555;">কোনো জমা বা দেনা নেই</td></tr>`;
        } else {
            data.payableList.forEach((p, i) => {
                payRows += `
                    <tr>
                        <td style="text-align:center;">${toBn(i + 1)}</td>
                        <td style="font-weight:600;">${escapeHTML(p.name)}</td>
                        <td style="text-align:center;">${toBn(p.phone)}</td>
                        <td>${escapeHTML(p.address)}</td>
                        <td style="text-align:right; font-weight:700;">${toBnMoney(p.amount)}</td>
                    </tr>`;
            });
        }

        const fullHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Due & Advance Ledger - Mousumi Computer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"><\/script>
    
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 20px 0;
            background: #e2e8f0;
            font-family: 'Hind Siliguri', Arial, sans-serif;
            color: #000;
            font-size: 13px;
        }

        /* প্রিন্ট অ্যাকশন বাটন */
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
            font-family: inherit;
        }
        .btn-pdf { background: #dc2626; }
        .btn-excel { background: #059669; }
        .btn-close { background: #64748b; }

        /* মূল A4 পাতা */
        .page-container {
            width: 210mm;
            margin: 0 auto;
            background: #fff;
            padding: 12mm 15mm;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }

        /* প্রাতিষ্ঠানিক হেডার */
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
            margin-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
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
            margin-bottom: 8px;
            border-bottom: 1px solid #000;
            padding-bottom: 4px;
        }

        /* টেবিল সাধারণ স্টাইল */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12.5px;
            margin-bottom: 12px;
        }
        th, td {
            border: 1px solid #000;
            padding: 4px 6px;
            line-height: 1.25;
            vertical-align: middle;
        }
        th {
            background-color: #f1f5f9;
            font-weight: 700;
            text-align: left;
        }
        .sec-title {
            background: #e2e8f0;
            font-weight: 700;
            font-size: 13px;
            border: 1px solid #000;
            border-bottom: none;
            padding: 4px 6px;
        }
        .total-row td {
            font-weight: 700;
            border-top: 1.5px solid #000;
            border-bottom: 2px solid #000;
        }

        /* স্বাক্ষর */
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
            <h2>গ্রাহক দেনা-পাওনা সমন্বয় খতিয়ান (Due & Advance Ledger)</h2>
        </div>

        <!-- মেটা তথ্য -->
        <div class="meta">
            <div>তারিখ: <strong>${data.dateInfo.full} (${data.dateInfo.day})</strong></div>
            <div>সময়: <strong>${data.dateInfo.time}</strong></div>
        </div>

        <!-- ২. সারসংক্ষেপ টেবিল -->
        <table>
            <thead>
                <tr>
                    <th style="width: 70%;">হিসাব সারসংক্ষেপ বিবরণী</th>
                    <th style="width: 30%; text-align: right;">পরিমাণ (৳)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>মোট গ্রাহকদের নিকট প্রাপ্য বকেয়া পাওনা [${toBn(data.receivableList.length)} জন]</td>
                    <td style="text-align: right; font-weight: 700;">৳ ${toBnMoney(data.totalReceivable)}</td>
                </tr>
                <tr>
                    <td>মোট গ্রাহকদের জমা / অগ্রিম দেনা [${toBn(data.payableList.length)} জন]</td>
                    <td style="text-align: right; font-weight: 700;">৳ ${toBnMoney(data.totalPayable)}</td>
                </tr>
                <tr class="total-row">
                    <td>প্রকৃত নিট অবস্থান (Net Balance)</td>
                    <td style="text-align: right;">৳ ${toBnMoney(data.netBalance)}</td>
                </tr>
            </tbody>
        </table>

        <!-- ৩. বকেয়া পাওনা টেবিল -->
        <div class="sec-title">১. গ্রাহকদের বকেয়া তালিকা (আমি যাদের কাছে টাকা পাবো) — মোট: ${toBn(data.receivableList.length)} জন</div>
        <table>
            <thead>
                <tr>
                    <th style="width:7%; text-align:center;">ক্রমিক</th>
                    <th style="width:35%;">কাস্টমারের নাম</th>
                    <th style="width:20%; text-align:center;">মোবাইল নম্বর</th>
                    <th style="width:20%;">ঠিকানা</th>
                    <th style="width:18%; text-align:right;">বকেয়া (৳)</th>
                </tr>
            </thead>
            <tbody>
                ${recRows}
                <tr class="total-row">
                    <td colspan="4" style="text-align:right;">সর্বমোট বকেয়া পাওনা:</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.totalReceivable)}</td>
                </tr>
            </tbody>
        </table>

        <!-- ৪. অগ্রিম দেনা টেবিল -->
        <div class="sec-title">২. গ্রাহকদের জমা / দেনা তালিকা (আমার কাছে যারা টাকা পাবে) — মোট: ${toBn(data.payableList.length)} জন</div>
        <table>
            <thead>
                <tr>
                    <th style="width:7%; text-align:center;">ক্রমিক</th>
                    <th style="width:35%;">কাস্টমারের নাম</th>
                    <th style="width:20%; text-align:center;">মোবাইল নম্বর</th>
                    <th style="width:20%;">ঠিকানা</th>
                    <th style="width:18%; text-align:right;">জমা / দেনা (৳)</th>
                </tr>
            </thead>
            <tbody>
                ${payRows}
                <tr class="total-row">
                    <td colspan="4" style="text-align:right;">সর্বমোট জমা / দেনা:</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.totalPayable)}</td>
                </tr>
            </tbody>
        </table>

        <!-- ৫. স্বাক্ষর -->
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
            const s1 = [["MOUSUMI COMPUTER - বকেয়া তালিকা"], ["তারিখ:", "${data.dateInfo.full}"], [], ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল", "ঠিকানা", "বকেয়া (৳)"]];
            ${JSON.stringify(data.receivableList)}.forEach((r, i) => s1.push([i + 1, r.name, r.phone, r.address, r.amount]));
            s1.push(["", "", "", "মোট বকেয়া:", ${data.totalReceivable}]);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), "বকেয়া তালিকা");

            const s2 = [["MOUSUMI COMPUTER - দেনা তালিকা"], ["তারিখ:", "${data.dateInfo.full}"], [], ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল", "ঠিকানা", "দেনা (৳)"]];
            ${JSON.stringify(data.payableList)}.forEach((p, i) => s2.push([i + 1, p.name, p.phone, p.address, p.amount]));
            s2.push(["", "", "", "মোট দেনা:", ${data.totalPayable}]);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), "দেনা তালিকা");

            XLSX.writeFile(wb, "Customer_Due_and_Advance_Ledger.xlsx");
        }

        ${autoDownload ? 'window.onload = function() { setTimeout(() => { window.print(); }, 400); };' : ''}
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

    function handleReportTypeChange() {
        const select = document.getElementById('hubReportType');
        if (!select) return;

        const isLedger = select.value === 'due_advance_ledger';
        const fromDateGroup = document.getElementById('hubFromDate')?.closest('.rpt-control-group');
        const toDateGroup = document.getElementById('hubToDate')?.closest('.rpt-control-group');
        const shortcutsBar = document.querySelector('.rpt-quick-dates');
        const previewBtn = document.querySelector('.rpt-btn-dark');
        const previewCard = document.getElementById('hub-report-print-area');

        if (isLedger) {
            if (fromDateGroup) fromDateGroup.style.display = 'none';
            if (toDateGroup) toDateGroup.style.display = 'none';
            if (shortcutsBar) shortcutsBar.style.display = 'none';
            if (previewBtn) previewBtn.style.display = 'none';
            
            if (previewCard) {
                previewCard.innerHTML = `
                    <div class="rpt-placeholder-state" style="padding: 35px 20px; text-align: center;">
                        <i class="fa-solid fa-file-lines" style="font-size:2.5rem; color:#475569; margin-bottom:10px;"></i>
                        <h4 style="font-size:1.1rem; color:#000; margin-bottom:4px;">Customer Due & Advance Ledger</h4>
                        <p style="color:#555; margin-bottom:0;">অফিশিয়াল লেজার খতিয়ান শিট। দেখতে বা প্রিন্ট করতে <strong>Download PDF</strong> বাটনে ক্লিক করুন।</p>
                    </div>
                `;
            }
        } else {
            if (fromDateGroup) fromDateGroup.style.display = 'flex';
            if (toDateGroup) toDateGroup.style.display = 'flex';
            if (shortcutsBar) shortcutsBar.style.display = 'flex';
            if (previewBtn) previewBtn.style.display = 'inline-flex';
        }
    }

    function injectDropdownOption() {
        const select = document.getElementById('hubReportType');
        if (!select) return false;

        if (!select.querySelector('option[value="due_advance_ledger"]')) {
            const opt = document.createElement('option');
            opt.value = 'due_advance_ledger';
            opt.innerText = 'Customer Due & Advance Ledger (দেনা-পাওনা খাতা)';
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
            if (select && select.value === 'due_advance_ledger') {
                window.openDueAdvanceTab(true);
                return;
            }
            if (typeof origPDF === 'function') origPDF();
        };

        const origExcel = window.hubExportExcel;
        window.hubExportExcel = function () {
            const select = document.getElementById('hubReportType');
            if (select && select.value === 'due_advance_ledger') {
                window.openDueAdvanceTab(false);
                return;
            }
            if (typeof origExcel === 'function') origExcel();
        };

        const origReset = window.hubReset;
        window.hubReset = function () {
            if (typeof origReset === 'function') origReset();
            setTimeout(handleReportTypeChange, 50);
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
