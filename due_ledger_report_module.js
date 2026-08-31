/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - PROFESSIONAL AUDIT & LEDGER STATEMENT
 * File: due_ledger_report_module.js
 * 
 * Features:
 * 1. Pure Accounting Ledger Layout: সম্পূর্ণ টেবিল ও ডেটা-ভিত্তিক প্রফেশনাল রিপোর্ট।
 * 2. Natural Multi-page Flow: কোনো ফালতু গ্যাপ বা ভাঙা পেজ নেই, ১ম পাতা থেকেই টেবিল শুরু।
 * 3. Formal Typography & Grid: ঝকঝকে বাংলা ফন্ট, স্পষ্ট গ্রিড এবং ডাবল-আন্ডারলাইন টোটাল।
 * 4. Dual Export: সরাসরি A4 PDF এবং মাল্টি-শিট Excel।
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

    // নতুন ট্যাবে পিওর অ্যাকাউন্টিং লেজার পেজ
    window.openDueAdvanceTab = function (autoDownload = false) {
        const data = getLedgerData();

        let recRows = '';
        if (data.receivableList.length === 0) {
            recRows = `<tr><td colspan="5" style="text-align:center; padding:10px; color:#475569;">কোনো গ্রাহকের নিকট বকেয়া পাওনা নেই</td></tr>`;
        } else {
            data.receivableList.forEach((r, i) => {
                recRows += `
                    <tr>
                        <td style="text-align:center; font-weight:600;">${toBn(i + 1)}</td>
                        <td style="font-weight:700; color:#000;">${escapeHTML(r.name)}</td>
                        <td style="text-align:center;">${toBn(r.phone)}</td>
                        <td>${escapeHTML(r.address)}</td>
                        <td style="text-align:right; font-weight:700; color:#000;">৳ ${toBnMoney(r.amount)}</td>
                    </tr>`;
            });
        }

        let payRows = '';
        if (data.payableList.length === 0) {
            payRows = `<tr><td colspan="5" style="text-align:center; padding:10px; color:#475569;">কোনো গ্রাহকের জমা বা অগ্রিম দেনা নেই</td></tr>`;
        } else {
            data.payableList.forEach((p, i) => {
                payRows += `
                    <tr>
                        <td style="text-align:center; font-weight:600;">${toBn(i + 1)}</td>
                        <td style="font-weight:700; color:#000;">${escapeHTML(p.name)}</td>
                        <td style="text-align:center;">${toBn(p.phone)}</td>
                        <td>${escapeHTML(p.address)}</td>
                        <td style="text-align:right; font-weight:700; color:#000;">৳ ${toBnMoney(p.amount)}</td>
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"><\/script>
    
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 20px 0 80px 0;
            background: #cbd5e1;
            font-family: 'Hind Siliguri', sans-serif;
            color: #000000;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            box-shadow: 0 10px 30px rgba(0,0,0,0.4);
            border: 1px solid #334155;
        }
        .float-btn {
            background: #1e293b;
            color: #ffffff;
            border: none;
            outline: none;
            padding: 9px 18px;
            border-radius: 30px;
            font-family: 'Hind Siliguri', sans-serif;
            font-size: 13.5px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: 0.2s;
        }
        .float-btn:hover { transform: translateY(-2px); }
        .btn-pdf { background: #b91c1c; }
        .btn-pdf:hover { background: #991b1b; }
        .btn-excel { background: #047857; }
        .btn-excel:hover { background: #065f46; }
        .btn-close { background: #475569; }

        /* A4 ক্লাসিক প্রিন্ট কনটেইনার */
        #report-render-wrapper {
            width: 210mm;
            margin: 0 auto;
            background: #ffffff;
            padding: 15mm 15mm;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        }

        /* প্রাতিষ্ঠানিক লেটারহেড */
        .rpt-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .rpt-header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .rpt-header h3 {
            margin: 2px 0 0 0;
            font-size: 15px;
            font-weight: 700;
            color: #1e293b;
        }
        .rpt-header p {
            margin: 2px 0 0 0;
            font-size: 12px;
            color: #475569;
        }

        /* রিপোর্ট মেটা ডাটা */
        .meta-strip {
            display: flex;
            justify-content: space-between;
            font-size: 12.5px;
            font-weight: 600;
            border-bottom: 1px dashed #64748b;
            padding-bottom: 6px;
            margin-bottom: 14px;
        }

        /* পিওর একাউন্টিং সামারি টেবিল */
        .summary-box {
            width: 100%;
            margin-bottom: 18px;
            page-break-inside: avoid;
        }
        .summary-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }
        .summary-table th {
            background: #e2e8f0;
            border: 1px solid #000;
            padding: 5px 8px;
            font-weight: 700;
            text-align: left;
        }
        .summary-table td {
            border: 1px solid #000;
            padding: 5px 8px;
            font-weight: 600;
        }

        /* সেকশন হেডিং */
        .table-heading {
            font-size: 14px;
            font-weight: 800;
            background: #f1f5f9;
            border: 1px solid #000;
            border-bottom: none;
            padding: 6px 10px;
            margin-top: 14px;
            display: flex;
            justify-content: space-between;
            page-break-after: avoid;
            break-after: avoid;
        }

        /* মূল লেজার টেবিল */
        table.ledger-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 16px;
        }
        table.ledger-table thead {
            display: table-header-group;
        }
        table.ledger-table tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        table.ledger-table th, 
        table.ledger-table td {
            border: 1px solid #000;
            padding: 6px 8px;
            line-height: 1.35;
        }
        table.ledger-table th {
            background-color: #e2e8f0;
            font-weight: 700;
            color: #000;
            text-align: left;
        }
        
        /* অ্যাকাউন্টিং টোটাল রো */
        .acc-total-row td {
            font-weight: 800;
            background-color: #f8fafc;
            border-top: 1.5px solid #000 !important;
            border-bottom: 3px double #000 !important; /* ক্লাসিক অ্যাকাউন্টিং ডাবল আন্ডারলাইন */
        }

        /* স্বাক্ষর এরিয়া */
        .sig-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        .sig-box {
            width: 190px;
            text-align: center;
        }
        .sig-line {
            border-top: 1px solid #000;
            margin-bottom: 4px;
        }
        .sig-title {
            font-size: 12px;
            font-weight: 700;
        }

        @media print {
            body { background: #fff; padding: 0; }
            .floating-action-bar { display: none !important; }
            #report-render-wrapper { width: 100%; box-shadow: none; padding: 0; }
        }
    </style>
</head>
<body>

    <!-- ফ্লোটিং বাটন -->
    <div class="floating-action-bar">
        <button type="button" class="float-btn btn-pdf" id="btnDownloadPDF" onclick="downloadDirectPDF()">
            <i class="fa-solid fa-file-pdf"></i> Download PDF
        </button>
        <button type="button" class="float-btn btn-excel" onclick="downloadExcel()">
            <i class="fa-solid fa-file-excel"></i> Export Excel
        </button>
        <button type="button" class="float-btn btn-close" onclick="window.close()">
            <i class="fa-solid fa-xmark"></i> Close
        </button>
    </div>

    <!-- মূল অডিট লেজার শিট -->
    <div id="report-render-wrapper">
        
        <!-- ১. হেডার -->
        <div class="rpt-header">
            <h1>MOUSUMI COMPUTER</h1>
            <h3>গ্রাহক দেনা-পাওনা ও সমন্বয় খতিয়ান (Customer Due & Advance Ledger)</h3>
            <p>সম্পূর্ণ খতিয়ান ও স্থিতি বিবরণী</p>
        </div>

        <!-- মেটা তথ্য -->
        <div class="meta-strip">
            <div>প্রতিবেদন তারিখ: <strong>${data.dateInfo.full} (${data.dateInfo.day})</strong></div>
            <div>সময়: <strong>${data.dateInfo.time}</strong></div>
        </div>

        <!-- ২. পিওর অ্যাকাউন্টিং সারসংক্ষেপ টেবিল -->
        <div class="summary-box">
            <table class="summary-table">
                <thead>
                    <tr>
                        <th style="width: 70%;">হিসাব বিবরণী সারসংক্ষেপ (Account Summary)</th>
                        <th style="width: 30%; text-align: right;">টাকা (৳)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>সর্বমোট গ্রাহকদের নিকট প্রাপ্য বকেয়া (Account Receivables) [${toBn(data.receivableList.length)} জন]</td>
                        <td style="text-align: right; font-weight: 700;">৳ ${toBnMoney(data.totalReceivable)}</td>
                    </tr>
                    <tr>
                        <td>সর্বমোট গ্রাহকদের জমা / অগ্রিম দেনা (Account Payables) [${toBn(data.payableList.length)} জন]</td>
                        <td style="text-align: right; font-weight: 700;">৳ ${toBnMoney(data.totalPayable)}</td>
                    </tr>
                    <tr style="background: #f8fafc;">
                        <td style="font-weight: 800;">প্রকৃত নিট অবস্থান (Net Receivable / Due Balance)</td>
                        <td style="text-align: right; font-weight: 800; border-bottom: 3px double #000;">৳ ${toBnMoney(data.netBalance)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- ৩. বকেয়া তালিকা টেবিল (১ম পাতা থেকেই শুরু) -->
        <div class="table-heading">
            <span>১. গ্রাহকদের বকেয়া তালিকা (আমি কতজনের কাছে টাকা পাবো)</span>
            <span>মোট গ্রাহক: ${toBn(data.receivableList.length)} জন</span>
        </div>
        <table class="ledger-table">
            <thead>
                <tr>
                    <th style="width:7%; text-align:center;">ক্রমিক</th>
                    <th style="width:33%;">কাস্টমারের নাম</th>
                    <th style="width:20%; text-align:center;">মোবাইল নম্বর</th>
                    <th style="width:22%;">ঠিকানা</th>
                    <th style="width:18%; text-align:right;">বকেয়া টাকা (৳)</th>
                </tr>
            </thead>
            <tbody>
                ${recRows}
                <tr class="acc-total-row">
                    <td colspan="4" style="text-align:right;">সর্বমোট বকেয়া পাওনা (Total Receivables):</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.totalReceivable)}</td>
                </tr>
            </tbody>
        </table>

        <!-- ৪. জমা / অগ্রিম তালিকা টেবিল -->
        <div class="table-heading">
            <span>২. গ্রাহকদের জমা / অগ্রিম দেনা তালিকা (আমার কাছে কে কে টাকা পাবে)</span>
            <span>মোট গ্রাহক: ${toBn(data.payableList.length)} জন</span>
        </div>
        <table class="ledger-table">
            <thead>
                <tr>
                    <th style="width:7%; text-align:center;">ক্রমিক</th>
                    <th style="width:33%;">কাস্টমারের নাম</th>
                    <th style="width:20%; text-align:center;">মোবাইল নম্বর</th>
                    <th style="width:22%;">ঠিকানা</th>
                    <th style="width:18%; text-align:right;">জমা / দেনা (৳)</th>
                </tr>
            </thead>
            <tbody>
                ${payRows}
                <tr class="acc-total-row">
                    <td colspan="4" style="text-align:right;">সর্বমোট জমা / দেনা (Total Payables):</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.totalPayable)}</td>
                </tr>
            </tbody>
        </table>

        <!-- ৫. স্বাক্ষর এরিয়া -->
        <div class="sig-section">
            <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-title">হিসাবরক্ষক (Accountant)</div>
            </div>
            <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-title">অনুমোদনকারী (Authorized Signature)</div>
            </div>
        </div>

    </div>

    <!-- এক্সপোর্ট স্ক্রিপ্ট -->
    <script>
        function downloadDirectPDF() {
            const btn = document.getElementById('btnDownloadPDF');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> প্রসেসিং হচ্ছে...';
            
            const element = document.getElementById('report-render-wrapper');
            const opt = {
                margin: [10, 8, 12, 8],
                filename: 'Customer_Due_and_Advance_Ledger.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                if (btn) btn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Download PDF';
            });
        }

        function downloadExcel() {
            const wb = XLSX.utils.book_new();
            
            const s1 = [["MOUSUMI COMPUTER - বকেয়া তালিকা"], ["তারিখ:", "${data.dateInfo.full}"], [], ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল নম্বর", "ঠিকানা", "বকেয়া টাকা (৳)"]];
            ${JSON.stringify(data.receivableList)}.forEach((r, i) => s1.push([i + 1, r.name, r.phone, r.address, r.amount]));
            s1.push(["", "", "", "সর্বমোট বকেয়া:", ${data.totalReceivable}]);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), "বকেয়া পাওনা (Receivable)");

            const s2 = [["MOUSUMI COMPUTER - জমা/দেনা তালিকা"], ["তারিখ:", "${data.dateInfo.full}"], [], ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল নম্বর", "ঠিকানা", "জমা টাকা (৳)"]];
            ${JSON.stringify(data.payableList)}.forEach((p, i) => s2.push([i + 1, p.name, p.phone, p.address, p.amount]));
            s2.push(["", "", "", "সর্বমোট জমা:", ${data.totalPayable}]);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), "অগ্রিম দেনা (Payable)");

            const s3 = [["MOUSUMI COMPUTER - সমন্বয় বিবরণী"], ["তারিখ:", "${data.dateInfo.full}"], [], ["বিবরণ", "টাকা (৳)"], ["মোট বকেয়া পাওনা", ${data.totalReceivable}], ["মোট জমা / দেনা", ${data.totalPayable}], ["প্রকৃত নিট অবস্থান", ${data.netBalance}]];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s3), "সারসংক্ষেপ (Summary)");

            XLSX.writeFile(wb, "Customer_Due_and_Advance_Ledger.xlsx");
        }

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

    // ডাউনলোড সেন্টার ইন্টিগ্রেশন
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
                        <h4 style="font-size:1.1rem; color:#0f172a; margin-bottom:6px;">Customer Due & Advance Ledger (দেনা-পাওনা লেজার খাতা)</h4>
                        <p style="color:#64748b; margin-bottom:0;">অ্যাকাউন্টিং স্ট্যান্ডার্ড পূর্ণাঙ্গ লেজার শিট। সরাসরি দেখতে বা প্রিন্ট করতে <strong>Download PDF</strong> বাটনে ক্লিক করুন।</p>
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
            opt.innerText = 'Customer Due & Advance Ledger (দেনা-পাওনা সমন্বয় খাতা)';
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
