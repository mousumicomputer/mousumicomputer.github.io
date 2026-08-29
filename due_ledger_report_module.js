/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - 3-PAGE DUE & ADVANCE LEDGER (DIRECT PDF GENERATOR)
 * File: due_ledger_report_module.js
 * 
 * Features:
 * 1. Opens report in a clean New Tab with a Floating Action Bar.
 * 2. Directly downloads .pdf file via html2pdf.js (NO Print Dialog / No Preview).
 * 3. Page 1: আমি কতজনের কাছে টাকা পাবো (Receivables)
 * 4. Page 2: আমার কাছে কে কে টাকা পাবে (Payables)
 * 5. Page 3: দেনা-পাওনা হিসাব সমন্বয় বিবরণী (Adjustment & Summary)
 * 6. 100% Tiro Bangla Typography.
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

    // লাইভ ডেটা লোডার
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

    // নতুন ট্যাবে ৩ পাতার HTML ও ফ্লোটিং ডাউনলোড বাটন খোলা
    window.openDueAdvanceTab = function (autoDownload = false) {
        const data = getLedgerData();

        let recRows = '';
        if (data.receivableList.length === 0) {
            recRows = `<tr><td colspan="5" style="text-align:center; padding:15px; color:#64748b;">কোনো গ্রাহকের নিকট বকেয়া পাওনা নেই</td></tr>`;
        } else {
            data.receivableList.forEach((r, i) => {
                recRows += `
                    <tr>
                        <td style="text-align:center;">${toBn(i + 1)}</td>
                        <td style="font-weight:600;">${escapeHTML(r.name)}</td>
                        <td style="text-align:center;">${toBn(r.phone)}</td>
                        <td>${escapeHTML(r.address)}</td>
                        <td style="text-align:right; font-weight:bold; color:#dc2626;">৳ ${toBnMoney(r.amount)}</td>
                    </tr>`;
            });
        }

        let payRows = '';
        if (data.payableList.length === 0) {
            payRows = `<tr><td colspan="5" style="text-align:center; padding:15px; color:#64748b;">কোনো গ্রাহকের জমা বা অগ্রিম দেনা নেই</td></tr>`;
        } else {
            data.payableList.forEach((p, i) => {
                payRows += `
                    <tr>
                        <td style="text-align:center;">${toBn(i + 1)}</td>
                        <td style="font-weight:600;">${escapeHTML(p.name)}</td>
                        <td style="text-align:center;">${toBn(p.phone)}</td>
                        <td>${escapeHTML(p.address)}</td>
                        <td style="text-align:right; font-weight:bold; color:#16a34a;">৳ ${toBnMoney(p.amount)}</td>
                    </tr>`;
            });
        }

        const fullHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Customer Due & Advance Ledger - Mousumi Computer</title>
    <!-- Fonts & Icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- html2pdf.js & SheetJS for direct client-side download -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"><\/script>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            background: #e2e8f0;
            font-family: 'Tiro Bangla', serif;
            color: #000;
        }

        /* ঝুলন্ত ফ্লোটিং অ্যাকশন বার */
        .floating-action-bar {
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 99999;
            background: #0f172a;
            border-radius: 50px;
            padding: 8px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3);
            border: 1px solid #334155;
        }
        .float-btn {
            background: #1e293b;
            color: #ffffff;
            border: none;
            outline: none;
            padding: 10px 18px;
            border-radius: 30px;
            font-family: 'Tiro Bangla', serif;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: 0.2s;
        }
        .float-btn:hover { transform: translateY(-2px); }
        .btn-pdf { background: #ef4444; }
        .btn-pdf:hover { background: #dc2626; }
        .btn-excel { background: #10b981; }
        .btn-excel:hover { background: #059669; }
        .btn-close { background: #475569; }
        .btn-close:hover { background: #334155; }

        /* A4 পাতার কাঠামো */
        #report-render-wrapper {
            width: 210mm;
            margin: 20px auto;
        }
        .a4-page {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm 15mm;
            margin-bottom: 20px;
            background: #ffffff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.08);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            page-break-after: always;
            break-after: page;
        }
        .a4-page:last-child {
            page-break-after: avoid;
            break-after: avoid;
        }

        .rpt-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
            margin-bottom: 10px;
        }
        .rpt-header h1 {
            margin: 0;
            font-size: 22px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .rpt-header h3 {
            margin: 3px 0 0 0;
            font-size: 14px;
            font-weight: normal;
        }
        .rpt-meta {
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            margin-bottom: 8px;
            font-weight: 600;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
            font-size: 11.5px;
        }
        th, td {
            border: 0.5px solid #000;
            padding: 5px 7px;
            line-height: 1.3;
            word-break: break-word;
        }
        th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: left;
        }
        .total-row td {
            font-weight: bold;
            background-color: #f8fafc;
        }

        .sig-container {
            margin-top: 35px;
            display: flex;
            justify-content: flex-end;
        }
        .sig-box {
            width: 180px;
            text-align: center;
        }
        .sig-line {
            border-top: 0.5px solid #000;
            margin-bottom: 4px;
        }
        .sig-text {
            font-size: 11px;
            font-weight: bold;
        }
        .page-num {
            text-align: center;
            font-size: 10.5px;
            color: #64748b;
            margin-top: 15px;
        }
    </style>
</head>
<body>

    <!-- ঝুলন্ত ডাউনলোড অ্যাকশন বার -->
    <div class="floating-action-bar">
        <button type="button" class="float-btn btn-pdf" id="btnDownloadPDF" onclick="downloadDirectPDF()">
            <i class="fa-solid fa-download"></i> Download PDF
        </button>
        <button type="button" class="float-btn btn-excel" onclick="downloadExcel()">
            <i class="fa-solid fa-file-excel"></i> Export Excel
        </button>
        <button type="button" class="float-btn btn-close" onclick="window.close()">
            <i class="fa-solid fa-xmark"></i> Close
        </button>
    </div>

    <!-- মূল ৩ পাতার রিপোর্ট কন্টেইনার -->
    <div id="report-render-wrapper">
        
        <!-- পাতা ১ -->
        <div class="a4-page">
            <div>
                <div class="rpt-header">
                    <h1>MOUSUMI COMPUTER</h1>
                    <h3>গ্রাহকদের বকেয়া তালিকা (আমি কতজনের কাছে টাকা পাবো)</h3>
                </div>
                <div class="rpt-meta">
                    <div>তারিখ: ${data.dateInfo.full} (${data.dateInfo.day})</div>
                    <div>মোট গ্রাহক: ${toBn(data.receivableList.length)} জন</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:7%; text-align:center;">ক্রমিক</th>
                            <th style="width:33%;">কাস্টমারের নাম</th>
                            <th style="width:20%; text-align:center;">মোবাইল নম্বর</th>
                            <th style="width:23%;">ঠিকানা</th>
                            <th style="width:17%; text-align:right;">বকেয়া টাকা (৳)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recRows}
                        <tr class="total-row">
                            <td colspan="4" style="text-align:right; font-weight:bold;">সর্বমোট বকেয়া পাওনা:</td>
                            <td style="text-align:right; font-weight:bold; color:#dc2626;">৳ ${toBnMoney(data.totalReceivable)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <div class="sig-container">
                    <div class="sig-box"><div class="sig-line"></div>Authorized Signature</div>
                </div>
                <div class="page-num">পাতা নং: ০১ / ০৩</div>
            </div>
        </div>

        <!-- পাতা ২ -->
        <div class="a4-page">
            <div>
                <div class="rpt-header">
                    <h1>MOUSUMI COMPUTER</h1>
                    <h3>গ্রাহকদের জমা / দেনা তালিকা (আমার কাছে কে কে টাকা পাবে)</h3>
                </div>
                <div class="rpt-meta">
                    <div>তারিখ: ${data.dateInfo.full} (${data.dateInfo.day})</div>
                    <div>মোট গ্রাহক: ${toBn(data.payableList.length)} জন</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th style="width:7%; text-align:center;">ক্রমিক</th>
                            <th style="width:33%;">কাস্টমারের নাম</th>
                            <th style="width:20%; text-align:center;">মোবাইল নম্বর</th>
                            <th style="width:23%;">ঠিকানা</th>
                            <th style="width:17%; text-align:right;">জমা / দেনা (৳)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payRows}
                        <tr class="total-row">
                            <td colspan="4" style="text-align:right; font-weight:bold;">সর্বমোট জমা / দেনা:</td>
                            <td style="text-align:right; font-weight:bold; color:#16a34a;">৳ ${toBnMoney(data.totalPayable)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <div class="sig-container">
                    <div class="sig-box"><div class="sig-line"></div>Authorized Signature</div>
                </div>
                <div class="page-num">পাতা নং: ০২ / ০৩</div>
            </div>
        </div>

        <!-- পাতা ৩ -->
        <div class="a4-page">
            <div>
                <div class="rpt-header">
                    <h1>MOUSUMI COMPUTER</h1>
                    <h3>দেনা-পাওনা হিসাব সমন্বয় বিবরণী (Adjustment Summary)</h3>
                </div>
                <div class="rpt-meta">
                    <div>তারিখ: ${data.dateInfo.full}</div>
                    <div>সময়: ${data.dateInfo.time}</div>
                </div>
                <table style="margin-top:15px;">
                    <thead>
                        <tr>
                            <th style="width:70%;">বিবরণ</th>
                            <th style="width:30%; text-align:right;">টাকা (৳)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>সর্বমোট গ্রাহকদের নিকট প্রাপ্য বকেয়া (Account Receivables) [${toBn(data.receivableList.length)} জন]</td>
                            <td style="text-align:right; font-weight:bold; color:#dc2626;">৳ ${toBnMoney(data.totalReceivable)}</td>
                        </tr>
                        <tr>
                            <td>সর্বমোট গ্রাহকদের জমা / দেনা (Account Payables) [${toBn(data.payableList.length)} জন]</td>
                            <td style="text-align:right; font-weight:bold; color:#16a34a;">৳ ${toBnMoney(data.totalPayable)}</td>
                        </tr>
                        <tr class="total-row">
                            <td style="font-size:12px;">প্রকৃত নিট অবস্থান (Net Receivable / Due)</td>
                            <td style="text-align:right; font-size:12.5px; font-weight:bold; color:#2563eb;">৳ ${toBnMoney(data.netBalance)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <div class="sig-container">
                    <div class="sig-box"><div class="sig-line"></div>Authorized Signature</div>
                </div>
                <div class="page-num">পাতা নং: ০৩ / ০৩</div>
            </div>
        </div>

    </div>

    <!-- সরাসরি PDF ও Excel ডাউনলোড স্ক্রিপ্ট -->
    <script>
        function downloadDirectPDF() {
            const btn = document.getElementById('btnDownloadPDF');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Downloading...';
            
            const element = document.getElementById('report-render-wrapper');
            const opt = {
                margin: 0,
                filename: 'Customer_Due_and_Advance_Ledger.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                if (btn) btn.innerHTML = '<i class="fa-solid fa-download"></i> Download PDF';
            });
        }

        function downloadExcel() {
            const wb = XLSX.utils.book_new();
            
            const s1 = [["MOUSUMI COMPUTER - বকেয়া তালিকা"], ["তারিখ:", "${data.dateInfo.full}"], [], ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল নম্বর", "ঠিকানা", "বকেয়া টাকা (৳)"]];
            ${JSON.stringify(data.receivableList)}.forEach((r, i) => s1.push([i + 1, r.name, r.phone, r.address, r.amount]));
            s1.push(["", "", "", "সর্বমোট বকেয়া:", ${data.totalReceivable}]);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), "আমি পাবো (Receivable)");

            const s2 = [["MOUSUMI COMPUTER - জমা/দেনা তালিকা"], ["তারিখ:", "${data.dateInfo.full}"], [], ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল নম্বর", "ঠিকানা", "জমা টাকা (৳)"]];
            ${JSON.stringify(data.payableList)}.forEach((p, i) => s2.push([i + 1, p.name, p.phone, p.address, p.amount]));
            s2.push(["", "", "", "সর্বমোট জমা:", ${data.totalPayable}]);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), "আমার কাছে পাবে (Payable)");

            const s3 = [["MOUSUMI COMPUTER - সমন্বয় বিবরণী"], ["তারিখ:", "${data.dateInfo.full}"], [], ["বিবরণ", "টাকা (৳)"], ["মোট বকেয়া পাওনা", ${data.totalReceivable}], ["মোট জমা / দেনা", ${data.totalPayable}], ["প্রকৃত নিট অবস্থান", ${data.netBalance}]];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s3), "সমন্বয় বিবরণী (Summary)");

            XLSX.writeFile(wb, "Customer_Due_and_Advance_Ledger.xlsx");
        }

        // অটো ডাউনলোড ট্রিগার
        ${autoDownload ? 'window.onload = function() { setTimeout(downloadDirectPDF, 500); };' : ''}
    <\/script>
</body>
</html>
        `;

        const reportWindow = window.open("", "_blank");
        if (!reportWindow) {
            alert("নতুন ট্যাব খোলা যায়নি! অনুগ্রহ করে ব্রাউজারের Pop-up Allow করুন।");
            return;
        }
        reportWindow.document.open();
        reportWindow.document.write(fullHTML);
        reportWindow.document.close();
    };

    // ৫. রিপোর্ট ডাউনলোড সেন্টারে ড্রপডাউন ও বাটন ইন্টিগ্রেশন
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
                    <div class="rpt-placeholder-state" style="padding: 40px 20px;">
                        <i class="fa-solid fa-file-invoice-dollar" style="font-size:2.8rem; color:#0284c7; margin-bottom:12px;"></i>
                        <h4 style="font-size:1.1rem; color:#0f172a; margin-bottom:6px;">Customer Due & Advance Ledger (৩ পাতার খাতা)</h4>
                        <p style="color:#64748b; margin-bottom:0;">এটি ৩ পাতার সমন্বিত খাতা। সরাসরি ডাউনলোড করতে <strong>Download PDF</strong> বাটনে ক্লিক করুন।</p>
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
            opt.innerText = 'Customer Due & Advance Ledger (দেনা-পাওনা সমন্বয় ৩ পাতার খাতা)';
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
                window.openDueAdvanceTab(true); // অটো PDF ডাউনলোড সহ নতুন ট্যাব খুলবে
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
