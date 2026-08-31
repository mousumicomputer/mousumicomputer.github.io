/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - DYNAMIC DUE & ADVANCE LEDGER (LARGE FONT & AUTO PAGINATION)
 * File: due_ledger_report_module.js
 * 
 * Features:
 * 1. Dynamic Pagination: কাস্টমার যত বেশিই হোক, ফন্ট ছোট হবে না; স্বয়ংক্রিয়ভাবে পেজ বাড়বে।
 * 2. Large & Clear Font: পড়তে সহজ ও ঝকঝকে বড় ফন্ট (13.5px - 14px)।
 * 3. Modern Executive Summary: উপরে আকর্ষণীয় ৩টি সারসংক্ষেপ কার্ড।
 * 4. Crisp Print & PDF Export with html2pdf.js & SheetJS.
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

    // নতুন ট্যাবে ডায়নামিক পেজ ও আকর্ষণীয় ড্যাশবোর্ড স্টাইল ভিউ
    window.openDueAdvanceTab = function (autoDownload = false) {
        const data = getLedgerData();

        let recRows = '';
        if (data.receivableList.length === 0) {
            recRows = `<tr><td colspan="5" style="text-align:center; padding:18px; color:#64748b; font-size:14px;">কোনো গ্রাহকের নিকট বকেয়া পাওনা নেই</td></tr>`;
        } else {
            data.receivableList.forEach((r, i) => {
                recRows += `
                    <tr>
                        <td style="text-align:center; font-weight:600;">${toBn(i + 1)}</td>
                        <td style="font-weight:700; color:#0f172a;">${escapeHTML(r.name)}</td>
                        <td style="text-align:center; font-weight:500;">${toBn(r.phone)}</td>
                        <td style="color:#334155;">${escapeHTML(r.address)}</td>
                        <td style="text-align:right; font-weight:800; color:#dc2626; font-size:14.5px;">৳ ${toBnMoney(r.amount)}</td>
                    </tr>`;
            });
        }

        let payRows = '';
        if (data.payableList.length === 0) {
            payRows = `<tr><td colspan="5" style="text-align:center; padding:18px; color:#64748b; font-size:14px;">কোনো গ্রাহকের জমা বা অগ্রিম দেনা নেই</td></tr>`;
        } else {
            data.payableList.forEach((p, i) => {
                payRows += `
                    <tr>
                        <td style="text-align:center; font-weight:600;">${toBn(i + 1)}</td>
                        <td style="font-weight:700; color:#0f172a;">${escapeHTML(p.name)}</td>
                        <td style="text-align:center; font-weight:500;">${toBn(p.phone)}</td>
                        <td style="color:#334155;">${escapeHTML(p.address)}</td>
                        <td style="text-align:right; font-weight:800; color:#16a34a; font-size:14.5px;">৳ ${toBnMoney(p.amount)}</td>
                    </tr>`;
            });
        }

        const fullHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Customer Due & Advance Ledger - Mousumi Computer</title>
    <!-- Google Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <!-- PDF & Excel Libraries -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"><\/script>
    
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 20px 0 80px 0;
            background: #f1f5f9;
            font-family: 'Hind Siliguri', 'Tiro Bangla', sans-serif;
            color: #0f172a;
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
            box-shadow: 0 10px 30px rgba(0,0,0,0.35);
            border: 1px solid #334155;
        }
        .float-btn {
            background: #1e293b;
            color: #ffffff;
            border: none;
            outline: none;
            padding: 10px 20px;
            border-radius: 30px;
            font-family: 'Hind Siliguri', sans-serif;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
        }
        .float-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .btn-pdf { background: #dc2626; }
        .btn-pdf:hover { background: #b91c1c; }
        .btn-excel { background: #059669; }
        .btn-excel:hover { background: #047857; }
        .btn-close { background: #475569; }
        .btn-close:hover { background: #334155; }

        /* মূল কনটেইনার */
        #report-render-wrapper {
            width: 210mm;
            margin: 0 auto;
            background: #ffffff;
            padding: 20mm 18mm;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            border-radius: 6px;
        }

        /* হেডার ডিজাইন */
        .rpt-header {
            text-align: center;
            border-bottom: 2.5px solid #0f172a;
            padding-bottom: 12px;
            margin-bottom: 18px;
        }
        .rpt-header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.8px;
            text-transform: uppercase;
        }
        .rpt-header h3 {
            margin: 4px 0 0 0;
            font-size: 16px;
            font-weight: 700;
            color: #4f46e5;
        }
        .rpt-meta {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            margin-top: 10px;
            font-weight: 600;
            color: #475569;
        }

        /* সারসংক্ষেপ কার্ড বক্স */
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        .sum-card {
            border: 1.5px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 14px;
            background: #f8fafc;
        }
        .sum-card.red { border-left: 5px solid #dc2626; background: #fff5f5; }
        .sum-card.green { border-left: 5px solid #16a34a; background: #f0fdf4; }
        .sum-card.blue { border-left: 5px solid #2563eb; background: #eff6ff; }
        
        .sum-card .label { font-size: 12.5px; font-weight: 600; color: #475569; margin-bottom: 4px; }
        .sum-card .val { font-size: 18px; font-weight: 800; }
        .sum-card.red .val { color: #dc2626; }
        .sum-card.green .val { color: #16a34a; }
        .sum-card.blue .val { color: #2563eb; }

        /* সেকশন হেডার */
        .section-title {
            font-size: 15px;
            font-weight: 800;
            color: #0f172a;
            margin: 20px 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 1.5px solid #cbd5e1;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            page-break-after: avoid;
        }

        /* টেবিল ডিজাইন (বড় ও ক্লিয়ার ফন্ট) */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13.5px;
            margin-bottom: 25px;
        }
        thead {
            display: table-header-group;
        }
        tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            line-height: 1.4;
            vertical-align: middle;
        }
        th {
            background-color: #f1f5f9;
            font-weight: 700;
            color: #1e293b;
            font-size: 13.5px;
        }
        .total-row {
            background-color: #f8fafc;
            font-size: 14.5px;
        }

        /* স্বাক্ষর এরিয়া */
        .sig-container {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            page-break-inside: avoid;
        }
        .sig-box {
            width: 200px;
            text-align: center;
        }
        .sig-line {
            border-top: 1.5px dashed #475569;
            margin-bottom: 6px;
        }
        .sig-text {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
        }

        @media print {
            body { background: #fff; padding: 0; }
            .floating-action-bar { display: none !important; }
            #report-render-wrapper { width: 100%; box-shadow: none; padding: 0; }
        }
    </style>
</head>
<body>

    <!-- অ্যাকশন বার -->
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

    <!-- মূল ডায়নামিক রিপোর্ট কন্টেইনার -->
    <div id="report-render-wrapper">
        
        <!-- ১. হেডার -->
        <div class="rpt-header">
            <h1>MOUSUMI COMPUTER</h1>
            <h3>গ্রাহক দেনা-পাওনা ও বকেয়া খতিয়ান (Due & Advance Ledger)</h3>
            <div class="rpt-meta">
                <div>তারিখ: <strong>${data.dateInfo.full} (${data.dateInfo.day})</strong></div>
                <div>সময়: <strong>${data.dateInfo.time}</strong></div>
            </div>
        </div>

        <!-- ২. ড্যাশবোর্ড সারসংক্ষেপ কার্ড -->
        <div class="summary-grid">
            <div class="sum-card red">
                <div class="label"><i class="fa-solid fa-arrow-down-left"></i> মোট বকেয়া পাওনা (Receivable)</div>
                <div class="val">৳ ${toBnMoney(data.totalReceivable)}</div>
                <div style="font-size:11.5px; color:#64748b; margin-top:2px;">গ্রাহক সংখ্যা: ${toBn(data.receivableList.length)} জন</div>
            </div>
            <div class="sum-card green">
                <div class="label"><i class="fa-solid fa-arrow-up-right"></i> মোট অগ্রিম জমা (Payable)</div>
                <div class="val">৳ ${toBnMoney(data.totalPayable)}</div>
                <div style="font-size:11.5px; color:#64748b; margin-top:2px;">গ্রাহক সংখ্যা: ${toBn(data.payableList.length)} জন</div>
            </div>
            <div class="sum-card blue">
                <div class="label"><i class="fa-solid fa-scale-balanced"></i> প্রকৃত নিট ব্যালেন্স (Net Position)</div>
                <div class="val">৳ ${toBnMoney(data.netBalance)}</div>
                <div style="font-size:11.5px; color:#64748b; margin-top:2px;">${data.netBalance >= 0 ? '(পাওনা বেশি)' : '(দেনা বেশি)'}</div>
            </div>
        </div>

        <!-- ৩. বকেয়া তালিকা (Receivables) -->
        <div class="section-title">
            <span>১. গ্রাহকদের বকেয়া তালিকা (আমি যাদের কাছে টাকা পাবো)</span>
            <span style="font-size:13px; color:#64748b; font-weight:600;">মোট: ${toBn(data.receivableList.length)} জন</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width:8%; text-align:center;">ক্রমিক</th>
                    <th style="width:34%;">কাস্টমারের নাম</th>
                    <th style="width:20%; text-align:center;">মোবাইল নম্বর</th>
                    <th style="width:21%;">ঠিকানা</th>
                    <th style="width:17%; text-align:right;">বকেয়া টাকা (৳)</th>
                </tr>
            </thead>
            <tbody>
                ${recRows}
                <tr class="total-row">
                    <td colspan="4" style="text-align:right; font-weight:800;">সর্বমোট বকেয়া পাওনা:</td>
                    <td style="text-align:right; font-weight:800; color:#dc2626;">৳ ${toBnMoney(data.totalReceivable)}</td>
                </tr>
            </tbody>
        </table>

        <!-- ৪. অগ্রিম দেনা তালিকা (Payables) -->
        <div class="section-title">
            <span>২. গ্রাহকদের জমা / অগ্রিম তালিকা (আমার কাছে যারা টাকা পাবে)</span>
            <span style="font-size:13px; color:#64748b; font-weight:600;">মোট: ${toBn(data.payableList.length)} জন</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width:8%; text-align:center;">ক্রমিক</th>
                    <th style="width:34%;">কাস্টমারের নাম</th>
                    <th style="width:20%; text-align:center;">মোবাইল নম্বর</th>
                    <th style="width:21%;">ঠিকানা</th>
                    <th style="width:17%; text-align:right;">জমা / দেনা (৳)</th>
                </tr>
            </thead>
            <tbody>
                ${payRows}
                <tr class="total-row">
                    <td colspan="4" style="text-align:right; font-weight:800;">সর্বমোট জমা / দেনা:</td>
                    <td style="text-align:right; font-weight:800; color:#16a34a;">৳ ${toBnMoney(data.totalPayable)}</td>
                </tr>
            </tbody>
        </table>

        <!-- ৫. স্বাক্ষর এরিয়া -->
        <div class="sig-container">
            <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-text">হিসাবরক্ষক (Accountant)</div>
            </div>
            <div class="sig-box">
                <div class="sig-line"></div>
                <div class="sig-text">অনুমোদনকারী (Authorized Signature)</div>
            </div>
        </div>

    </div>

    <!-- PDF ও Excel স্ক্রিপ্ট -->
    <script>
        function downloadDirectPDF() {
            const btn = document.getElementById('btnDownloadPDF');
            if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> প্রসেসিং হচ্ছে...';
            
            const element = document.getElementById('report-render-wrapper');
            const opt = {
                margin: [8, 8, 10, 8],
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

        ${autoDownload ? 'window.onload = function() { setTimeout(downloadDirectPDF, 600); };' : ''}
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

    // ডাউনলোড সেন্টার ড্রপডাউন ও বাটন ইন্টিগ্রেশন
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
                        <h4 style="font-size:1.1rem; color:#0f172a; margin-bottom:6px;">Customer Due & Advance Ledger (দেনা-পাওনা সমন্বয় খাতা)</h4>
                        <p style="color:#64748b; margin-bottom:0;">এটি পূর্ণাঙ্গ ও বড় ফন্টের সমন্বিত লেজার। সরাসরি রিপোর্ট দেখতে বা প্রিন্ট করতে <strong>Download PDF</strong> বাটনে ক্লিক করুন।</p>
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
