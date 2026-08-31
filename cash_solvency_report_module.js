/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - CASH LIQUIDITY & SOLVENCY STATEMENT
 * File: cash_solvency_report_module.js
 * 
 * Features:
 * 1. বর্তমান মোট ক্যাশ ও ব্যাংক স্থিতি হিসাব।
 * 2. পাওনাদারদের সমস্ত দেনা তালিকা।
 * 3. দেনা পরিশোধের পর অবশিষ্ট ফ্রি ক্যাশ (Free Usable Cash) ও ঘাটতি নিরুপণ।
 * 4. 100% Tiro Bangla Typography & অফিশিয়াল পরিপাটি টেবিল লেআউট।
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

    // লাইভ ডেটা ক্যালকুলেশন
    function getSolvencyData() {
        let store = {};
        if (typeof window.getERPStore === 'function') {
            store = window.getERPStore();
        }

        const customers = store.customers || window.customers || [];
        const transactions = store.customerTransactions || window.customerTransactions || [];
        const closings = store.dailyClosingReports || window.dailyClosingReports || [];
        const accounts = store.accounts || window.accounts || [];
        const suppliers = store.suppliers || window.suppliers || [];

        // ১. বর্তমান ক্যাশ ও ব্যাংক তহবিল
        const cashFunds = [];
        let totalCashInHand = 0;
        let totalBankFunds = 0;

        // ড্রয়ার ক্যাশ (Daily Closing বা স্টোর থেকে)
        if (closings.length > 0) {
            const lastClosing = closings[closings.length - 1];
            totalCashInHand = parseFloat(lastClosing.actual_closing) || parseFloat(lastClosing.closing_capital) || 0;
        } else if (store.cashInHand !== undefined) {
            totalCashInHand = parseFloat(store.cashInHand) || 0;
        }

        cashFunds.push({
            name: "ক্যাশ ড্রয়ার / কাউন্টার নগদ (Cash in Hand)",
            type: "নগদ তহবিল",
            amount: totalCashInHand
        });

        // ব্যাংক ও মোবাইল ব্যাংকিং অ্যাকাউন্টসমূহ
        if (Array.isArray(accounts) && accounts.length > 0) {
            accounts.forEach(acc => {
                const bal = parseFloat(acc.balance) || 0;
                if (acc.type !== 'cash' && bal !== 0) {
                    cashFunds.push({
                        name: `${acc.name || 'ব্যাংক অ্যাকাউন্ট'} ${acc.accountNumber ? '(' + acc.accountNumber + ')' : ''}`,
                        type: acc.type === 'mobile_banking' ? 'মোবাইল ব্যাংকিং' : 'ব্যাংক হিসাব',
                        amount: bal
                    });
                    totalBankFunds += bal;
                }
            });
        }

        const totalAvailableCash = totalCashInHand + totalBankFunds;

        // ২. কাস্টমার বকেয়া ও দেনা হিসাব
        const receivableList = [];
        const payableList = [];
        let totalReceivable = 0;
        let totalCustomerPayable = 0;

        customers.forEach(c => {
            let bal = parseFloat(c.openingBalance) || 0;
            const custTxs = transactions.filter(t => String(t.customerId) === String(c.id));
            custTxs.forEach(t => {
                bal += (parseFloat(t.debit) || 0) - (parseFloat(t.credit) || 0);
            });

            if (bal > 0.009) {
                receivableList.push({
                    name: c.name || "Unknown",
                    type: "কাস্টমার বাকি",
                    phone: c.phone || "-",
                    amount: bal
                });
                totalReceivable += bal;
            } else if (bal < -0.009) {
                const adv = Math.abs(bal);
                payableList.push({
                    name: c.name || "Unknown",
                    type: "কাস্টমার অগ্রিম জমা",
                    phone: c.phone || "-",
                    amount: adv
                });
                totalCustomerPayable += adv;
            }
        });

        // ৩. সাপ্লায়ার / মহাজনদের পাওনা (যদি থাকে)
        let totalSupplierPayable = 0;
        if (Array.isArray(suppliers)) {
            suppliers.forEach(s => {
                const due = parseFloat(s.dueBalance) || parseFloat(s.balance) || 0;
                if (due > 0.009) {
                    payableList.push({
                        name: s.name || "সাপ্লায়ার",
                        type: "মহাজন / সাপ্লায়ার পাওনা",
                        phone: s.phone || "-",
                        amount: due
                    });
                    totalSupplierPayable += due;
                }
            });
        }

        const totalPayable = totalCustomerPayable + totalSupplierPayable;
        const freeCash = totalAvailableCash - totalPayable;
        const projectedTotalCash = freeCash + totalReceivable;

        return {
            dateInfo: getBanglaDate(),
            cashFunds,
            totalAvailableCash,
            payableList,
            totalPayable,
            receivableList,
            totalReceivable,
            freeCash,
            projectedTotalCash
        };
    }

    // নতুন ট্যাবে পূর্ণাঙ্গ স্টেটমেন্ট ওপেন করা
    window.openSolvencyReportTab = function (autoPrint = false) {
        const data = getSolvencyData();

        // ফান্ড টেবিল রো
        let fundRows = '';
        data.cashFunds.forEach((f, i) => {
            fundRows += `
                <tr>
                    <td style="text-align:center;">${toBn(i + 1)}।</td>
                    <td style="font-weight:600;">${escapeHTML(f.name)}</td>
                    <td style="text-align:center;">${escapeHTML(f.type)}</td>
                    <td style="text-align:right; font-weight:700;">৳ ${toBnMoney(f.amount)}</td>
                </tr>`;
        });

        // পাওনাদার দেনা রো
        let payRows = '';
        if (data.payableList.length === 0) {
            payRows = `<tr><td colspan="5" style="text-align:center; padding:6px; color:#555;">কোনো পাওনাদারের দেনা বকেয়া নেই</td></tr>`;
        } else {
            data.payableList.forEach((p, i) => {
                payRows += `
                    <tr>
                        <td style="text-align:center;">${toBn(i + 1)}।</td>
                        <td style="font-weight:600;">${escapeHTML(p.name)}</td>
                        <td style="text-align:center;">${escapeHTML(p.type)}</td>
                        <td style="text-align:center;">${toBn(p.phone)}</td>
                        <td style="text-align:right; font-weight:700;">৳ ${toBnMoney(p.amount)}</td>
                    </tr>`;
            });
        }

        const isSurplus = data.freeCash >= 0;

        const fullHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <title>Cash Liquidity & Solvency Statement - Mousumi Computer</title>
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
            margin-bottom: 8px;
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
            text-align: left;
        }
        .sec-title {
            background: #e2e8f0;
            font-weight: 700;
            font-size: 13.5px;
            border: 1px solid #000;
            border-bottom: none;
            padding: 5px 6px;
        }
        .total-row td {
            font-weight: 700;
            border-top: 1.5px solid #000;
            border-bottom: 2px solid #000;
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
        
        <!-- ১. প্রাতিষ্ঠানিক হেডার -->
        <div class="header">
            <h1>MOUSUMI COMPUTER</h1>
            <h2>ক্যাশ স্থিতি ও দেনা পরিশোধ বিবরণী (Cash Liquidity & Solvency Statement)</h2>
        </div>

        <div class="meta">
            <div>প্রতিবেদন তারিখ: <strong>${data.dateInfo.full} (${data.dateInfo.day})</strong></div>
            <div>সময়: <strong>${data.dateInfo.time}</strong></div>
        </div>

        <!-- ২. চূড়ান্ত সিদ্ধান্ত ও মূল সারসংক্ষেপ টেবিল -->
        <div class="sec-title">সারসংক্ষেপ: দেনা পরিশোধ সক্ষমতা ও অবশিষ্ট ক্যাশ অবস্থান (Executive Summary)</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 65%;">বিবরণ</th>
                    <th style="width: 20%; text-align: right;">টাকা (৳)</th>
                    <th style="width: 15%; text-align: center;">অবস্থা</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>১। বর্তমান মোট নগদ ও ব্যাংক তহবিল (Total Available Liquid Cash)</td>
                    <td style="text-align: right; font-weight: 700;">৳ ${toBnMoney(data.totalAvailableCash)}</td>
                    <td style="text-align: center;">হাতে জমা</td>
                </tr>
                <tr>
                    <td>২। বাদ: পাওনাদারদের সর্বমোট দেনা (Less: Total Outstanding Payables)</td>
                    <td style="text-align: right; font-weight: 700;">(-) ৳ ${toBnMoney(data.totalPayable)}</td>
                    <td style="text-align: center;">মোট দেনা</td>
                </tr>
                <tr class="total-row" style="background: ${isSurplus ? '#f8fafc' : '#fff1f2'};">
                    <td><strong>সব দেনা মিটিয়ে দিলে অবশিষ্ট ক্যাশ থাকবে (Net Free Cash)</strong></td>
                    <td style="text-align: right; font-weight: 800;">৳ ${toBnMoney(data.freeCash)}</td>
                    <td style="text-align: center; font-weight: 700;">${isSurplus ? 'উদ্বৃত্ত (নিরাপদ)' : 'ঘাটতি (ঝুঁকি)'}</td>
                </tr>
                <tr>
                    <td>৩। যোগ: বাজারে কাস্টমারদের কাছে বাকি পাওনা (Add: Customer Dues)</td>
                    <td style="text-align: right; font-weight: 700;">(+) ৳ ${toBnMoney(data.totalReceivable)}</td>
                    <td style="text-align: center;">আদায়যোগ্য</td>
                </tr>
                <tr class="total-row" style="background: #f1f5f9;">
                    <td><strong>ভবিষ্যতে সম্ভাব্য মোট প্রকৃত ক্যাশ স্থিতি (Projected Total Liquidity)</strong></td>
                    <td style="text-align: right; font-weight: 800;">৳ ${toBnMoney(data.projectedTotalCash)}</td>
                    <td style="text-align: center; font-weight: 700;">চূড়ান্ত অবস্থান</td>
                </tr>
            </tbody>
        </table>

        <!-- ৩. বর্তমান ক্যাশ ও ব্যাংক ব্যালেন্স টেবিল -->
        <div class="sec-title">১। বর্তমান নগদ ও ব্যাংক তহবিল বিবরণী (Available Cash & Bank Balances)</div>
        <table>
            <thead>
                <tr>
                    <th style="width:8%; text-align:center;">ক্রমিক</th>
                    <th style="width:52%;">হিসাবের নাম / বিবরণ</th>
                    <th style="width:20%; text-align:center;">হিসাবের ধরন</th>
                    <th style="width:20%; text-align:right;">ব্যালেন্স (৳)</th>
                </tr>
            </thead>
            <tbody>
                ${fundRows}
                <tr class="total-row">
                    <td colspan="3" style="text-align:right;">সর্বমোট উপলব্ধ নগদ তহবিল:</td>
                    <td style="text-align:right;">৳ ${toBnMoney(data.totalAvailableCash)}</td>
                </tr>
            </tbody>
        </table>

        <!-- ৪. পাওনাদারদের তালিকা ও দেনা টেবিল -->
        <div class="sec-title">২। পাওনাদারদের বিস্তারিত তালিকা ও মোট দেনা (Outstanding Payables) — মোট: ${toBn(data.payableList.length)} জন</div>
        <table>
            <thead>
                <tr>
                    <th style="width:8%; text-align:center;">ক্রমিক</th>
                    <th style="width:38%;">পাওনাদারের নাম</th>
                    <th style="width:20%; text-align:center;">দেনার ধরন</th>
                    <th style="width:16%; text-align:center;">মোবাইল নম্বর</th>
                    <th style="width:18%; text-align:right;">পাওনার পরিমাণ (৳)</th>
                </tr>
            </thead>
            <tbody>
                ${payRows}
                <tr class="total-row">
                    <td colspan="4" style="text-align:right;">সর্বমোট দেনা (Total Payables):</td>
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

            const s1 = [
                ["MOUSUMI COMPUTER - দেনা পরিশোধ সক্ষমতা ও ক্যাশ স্থিতি"],
                ["তারিখ:", "${data.dateInfo.full}"],
                [],
                ["বিবরণ", "টাকা (৳)", "মন্তব্য"],
                ["বর্তমান মোট নগদ ও ব্যাংক তহবিল", ${data.totalAvailableCash}, "হাতে জমা"],
                ["বাদ: সর্বমোট দেনা", ${data.totalPayable}, "মোট পাওনাদার"],
                ["দেনা পরিশোধের পর অবশিষ্ট ক্যাশ (Free Cash)", ${data.freeCash}, "${isSurplus ? 'উদ্বৃত্ত' : 'ঘাটতি'}"],
                ["যোগ: বাজারে কাস্টমার বকেয়া", ${data.totalReceivable}, "আদায়যোগ্য বাকি"],
                ["ভবিষ্যতে মোট সম্ভাব্য ক্যাশ স্থিতি", ${data.projectedTotalCash}, "চূড়ান্ত"]
            ];
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), "সারসংক্ষেপ");

            const s2 = [
                ["MOUSUMI COMPUTER - নগদ ও ব্যাংক তহবিল"],
                ["তারিখ:", "${data.dateInfo.full}"],
                [],
                ["ক্রমিক", "হিসাবের নাম", "ধরন", "ব্যালেন্স (৳)"]
            ];
            ${JSON.stringify(data.cashFunds)}.forEach((f, i) => s2.push([i + 1 + "।", f.name, f.type, f.amount]));
            s2.push(["", "", "সর্বমোট তহবিল:", ${data.totalAvailableCash}]);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), "তহবিল তালিকা");

            const s3 = [
                ["MOUSUMI COMPUTER - পাওনাদার দেনা তালিকা"],
                ["তারিখ:", "${data.dateInfo.full}"],
                [],
                ["ক্রমিক", "পাওনাদারের নাম", "ধরন", "মোবাইল", "টাকা (৳)"]
            ];
            ${JSON.stringify(data.payableList)}.forEach((p, i) => s3.push([i + 1 + "।", p.name, p.type, p.phone, p.amount]));
            s3.push(["", "", "", "সর্বমোট দেনা:", ${data.totalPayable}]);
            XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s3), "দেনা তালিকা");

            XLSX.writeFile(wb, "Cash_Liquidity_and_Solvency_Statement.xlsx");
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

    // ডাউনলোড সেন্টারের সাথে ইন্টিগ্রেশন
    function handleReportTypeChange() {
        const select = document.getElementById('hubReportType');
        if (!select) return;

        const isSolvency = select.value === 'cash_solvency_statement';
        const fromDateGroup = document.getElementById('hubFromDate')?.closest('.rpt-control-group');
        const toDateGroup = document.getElementById('hubToDate')?.closest('.rpt-control-group');
        const shortcutsBar = document.querySelector('.rpt-quick-dates');
        const previewBtn = document.querySelector('.rpt-btn-dark');
        const previewCard = document.getElementById('hub-report-print-area');

        if (isSolvency) {
            if (fromDateGroup) fromDateGroup.style.display = 'none';
            if (toDateGroup) toDateGroup.style.display = 'none';
            if (shortcutsBar) shortcutsBar.style.display = 'none';
            if (previewBtn) previewBtn.style.display = 'none';
            
            if (previewCard) {
                previewCard.innerHTML = `
                    <div class="rpt-placeholder-state" style="padding: 35px 20px; text-align: center;">
                        <i class="fa-solid fa-scale-balanced" style="font-size:2.5rem; color:#0f172a; margin-bottom:10px;"></i>
                        <h4 style="font-size:1.1rem; color:#000; margin-bottom:4px; font-family:'Tiro Bangla', serif;">Cash Liquidity & Solvency Statement</h4>
                        <p style="color:#555; margin-bottom:0; font-family:'Tiro Bangla', serif;">ক্যাশ স্থিতি ও দেনা পরিশোধ বিবরণী দেখতে বা প্রিন্ট করতে <strong>Download PDF</strong> বাটনে ক্লিক করুন।</p>
                    </div>
                `;
            }
        }
    }

    function injectDropdownOption() {
        const select = document.getElementById('hubReportType');
        if (!select) return false;

        if (!select.querySelector('option[value="cash_solvency_statement"]')) {
            const opt = document.createElement('option');
            opt.value = 'cash_solvency_statement';
            opt.innerText = 'Cash Liquidity & Solvency Statement (ক্যাশ স্থিতি ও দেনা পরিশোধ বিবরণী)';
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
            if (select && select.value === 'cash_solvency_statement') {
                window.openSolvencyReportTab(true);
                return;
            }
            if (typeof origPDF === 'function') origPDF();
        };

        const origExcel = window.hubExportExcel;
        window.hubExportExcel = function () {
            const select = document.getElementById('hubReportType');
            if (select && select.value === 'cash_solvency_statement') {
                window.openSolvencyReportTab(false);
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
