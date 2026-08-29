/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - OFFICIAL CUSTOMER DUE & ADVANCE LEDGER ADDON
 * File: due_ledger_report_module.js
 * 
 * Reports Included (3 Pages):
 * 1. Page 1: আমি কতজনের কাছে টাকা পাবো (গ্রাহকদের বকেয়া তালিকা)
 * 2. Page 2: আমার কাছে কে কে টাকা পাবে (গ্রাহকদের জমা / দেনা তালিকা)
 * 3. Page 3: দেনা-পাওনা হিসাব সমন্বয় বিবরণী (Adjustment & Summary)
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
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
    };

    // ডেটা লোডার
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

    // ৩ পাতার অফিশিয়াল PDF প্রিন্ট মেকানিজম
    function triggerDirectPrintPDF() {
        const data = getLedgerData();

        let recRows = '';
        if (data.receivableList.length === 0) {
            recRows = `<tr><td colspan="5" style="text-align:center; padding:10px;">কোনো বকেয়া পাওনা নেই</td></tr>`;
        } else {
            data.receivableList.forEach((r, i) => {
                recRows += `
                    <tr>
                        <td style="text-align:center;">${toBn(i + 1)}</td>
                        <td>${escapeHTML(r.name)}</td>
                        <td style="text-align:center;">${toBn(r.phone)}</td>
                        <td>${escapeHTML(r.address)}</td>
                        <td style="text-align:right;">${toBnMoney(r.amount)}</td>
                    </tr>`;
            });
        }

        let payRows = '';
        if (data.payableList.length === 0) {
            payRows = `<tr><td colspan="5" style="text-align:center; padding:10px;">কোনো জমা/দেনা নেই</td></tr>`;
        } else {
            data.payableList.forEach((p, i) => {
                payRows += `
                    <tr>
                        <td style="text-align:center;">${toBn(i + 1)}</td>
                        <td>${escapeHTML(p.name)}</td>
                        <td style="text-align:center;">${toBn(p.phone)}</td>
                        <td>${escapeHTML(p.address)}</td>
                        <td style="text-align:right;">${toBnMoney(p.amount)}</td>
                    </tr>`;
            });
        }

        const printHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<title>Customer Due & Advance Ledger</title>
<style>
    @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');
    @page { size: A4 portrait; margin: 10mm 12mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Tiro Bangla', serif; font-size: 11px; margin: 0; padding: 0; color: #000; }
    .page { page-break-after: always; display: flex; flex-direction: column; min-height: 98vh; justify-content: space-between; }
    .page:last-child { page-break-after: avoid; }
    .header { text-align: center; border-bottom: 1.5px solid #000; padding-bottom: 4px; margin-bottom: 8px; }
    .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
    .header h4 { margin: 2px 0 0 0; font-size: 13px; font-weight: normal; }
    .meta { display: flex; justify-content: space-between; font-size: 10.5px; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 0.5px solid #000; padding: 4px 6px; font-size: 10.5px; word-break: break-word; }
    th { background: #f2f2f2; text-align: left; }
    .total-row td { font-weight: bold; background: #fafafa; }
    .sig-area { margin-top: 35px; display: flex; justify-content: flex-end; }
    .sig-box { width: 180px; text-align: center; }
    .sig-line { border-top: 0.5px solid #000; margin-bottom: 3px; }
    .page-footer { text-align: center; font-size: 10px; margin-top: 10px; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
    <!-- পাতা ১ -->
    <div class="page">
        <div>
            <div class="header">
                <h2>MOUSUMI COMPUTER</h2>
                <h4>গ্রাহকদের বকেয়া তালিকা (আমি কতজনের কাছে টাকা পাবো)</h4>
            </div>
            <div class="meta">
                <div>তারিখ: ${data.dateInfo.full}</div>
                <div>মোট গ্রাহক: ${toBn(data.receivableList.length)} জন</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width:7%; text-align:center;">ক্রমিক</th>
                        <th style="width:33%;">কাস্টমারের নাম</th>
                        <th style="width:20%; text-align:center;">মোবাইল</th>
                        <th style="width:23%;">ঠিকানা</th>
                        <th style="width:17%; text-align:right;">বকেয়া টাকা (৳)</th>
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
        </div>
        <div>
            <div class="sig-area"><div class="sig-box"><div class="sig-line"></div>Authorized Signature</div></div>
            <div class="page-footer">পাতা নং: ০১ / ০৩</div>
        </div>
    </div>

    <!-- পাতা ২ -->
    <div class="page">
        <div>
            <div class="header">
                <h2>MOUSUMI COMPUTER</h2>
                <h4>গ্রাহকদের জমা / দেনা তালিকা (আমার কাছে কে কে টাকা পাবে)</h4>
            </div>
            <div class="meta">
                <div>তারিখ: ${data.dateInfo.full}</div>
                <div>মোট গ্রাহক: ${toBn(data.payableList.length)} জন</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width:7%; text-align:center;">ক্রমিক</th>
                        <th style="width:33%;">কাস্টমারের নাম</th>
                        <th style="width:20%; text-align:center;">মোবাইল</th>
                        <th style="width:23%;">ঠিকানা</th>
                        <th style="width:17%; text-align:right;">জমা / দেনা (৳)</th>
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
        </div>
        <div>
            <div class="sig-area"><div class="sig-box"><div class="sig-line"></div>Authorized Signature</div></div>
            <div class="page-footer">পাতা নং: ০২ / ০৩</div>
        </div>
    </div>

    <!-- পাতা ৩ -->
    <div class="page">
        <div>
            <div class="header">
                <h2>MOUSUMI COMPUTER</h2>
                <h4>দেনা-পাওনা হিসাব সমন্বয় বিবরণী</h4>
            </div>
            <div class="meta">
                <div>তারিখ: ${data.dateInfo.full}</div>
                <div>সময়: ${data.dateInfo.time}</div>
            </div>
            <table style="margin-top: 10px;">
                <thead>
                    <tr>
                        <th style="width:70%;">বিবরণ</th>
                        <th style="width:30%; text-align:right;">টাকা (৳)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>সর্বমোট গ্রাহকদের নিকট প্রাপ্য বকেয়া (Account Receivables) [${toBn(data.receivableList.length)} জন]</td>
                        <td style="text-align:right;">৳ ${toBnMoney(data.totalReceivable)}</td>
                    </tr>
                    <tr>
                        <td>সর্বমোট গ্রাহকদের জমা / দেনা (Account Payables) [${toBn(data.payableList.length)} জন]</td>
                        <td style="text-align:right;">৳ ${toBnMoney(data.totalPayable)}</td>
                    </tr>
                    <tr class="total-row">
                        <td>প্রকৃত নিট অবস্থান (Net Receivable / Due)</td>
                        <td style="text-align:right; font-size:12px;">৳ ${toBnMoney(data.netBalance)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <div class="sig-area"><div class="sig-box"><div class="sig-line"></div>Authorized Signature</div></div>
            <div class="page-footer">পাতা নং: ০৩ / ০৩</div>
        </div>
    </div>

    <script>
        window.onload = function() { setTimeout(function(){ window.focus(); window.print(); }, 300); };
        window.onafterprint = function() { setTimeout(function(){ window.close(); }, 100); };
    <\/script>
</body>
</html>`;

        const printWin = window.open("", "_blank", "width=850,height=900");
        if (!printWin) {
            alert("প্রিন্ট উইন্ডো খুলতে পারেনি! ব্রাউজারের পপ-আপ অন করুন।");
            return;
        }
        printWin.document.open();
        printWin.document.write(printHTML);
        printWin.document.close();
    }

    // সরাসরি এক্সেল এক্সপোর্ট
    function triggerDirectExcel() {
        if (!window.XLSX) {
            alert("Excel লাইব্রেরি পাওয়া যায়নি!");
            return;
        }
        const data = getLedgerData();
        const wb = XLSX.utils.book_new();

        // শিট ১: বকেয়া
        const s1 = [
            ["MOUSUMI COMPUTER - গ্রাহকদের বকেয়া তালিকা"],
            ["তারিখ:", data.dateInfo.full],
            [],
            ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল নম্বর", "ঠিকানা", "বকেয়া টাকা (৳)"]
        ];
        data.receivableList.forEach((r, i) => s1.push([i + 1, r.name, r.phone, r.address, r.amount]));
        s1.push(["", "", "", "সর্বমোট বকেয়া:", data.totalReceivable]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s1), "আমি পাবো (Receivable)");

        // শিট ২: জমা
        const s2 = [
            ["MOUSUMI COMPUTER - গ্রাহকদের জমা / দেনা তালিকা"],
            ["তারিখ:", data.dateInfo.full],
            [],
            ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল নম্বর", "ঠিকানা", "জমা টাকা (৳)"]
        ];
        data.payableList.forEach((p, i) => s2.push([i + 1, p.name, p.phone, p.address, p.amount]));
        s2.push(["", "", "", "সর্বমোট দেনা:", data.totalPayable]);
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s2), "আমার কাছে পাবে (Payable)");

        // শিট ৩: সমন্বয়
        const s3 = [
            ["MOUSUMI COMPUTER - দেনা-পাওনা সমন্বয় বিবরণী"],
            ["তারিখ:", data.dateInfo.full],
            [],
            ["বিবরণ", "টাকা (৳)"],
            ["সর্বমোট গ্রাহকদের নিকট প্রাপ্য বকেয়া", data.totalReceivable],
            ["সর্বমোট গ্রাহকদের জমা / দেনা", data.totalPayable],
            ["প্রকৃত নিট অবস্থান", data.netBalance]
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(s3), "সমন্বয় বিবরণী (Summary)");

        XLSX.writeFile(wb, "Customer_Due_and_Advance_Ledger.xlsx");
    }

    // ড্রপডাউনে অপশন যোগ করা
    function injectDropdownOption() {
        const select = document.getElementById('hubReportType');
        if (!select) return false;
        if (select.querySelector('option[value="due_advance_ledger"]')) return true;

        const opt = document.createElement('option');
        opt.value = 'due_advance_ledger';
        opt.innerText = 'Customer Due & Advance Ledger (দেনা-পাওনা সমন্বয় ৩ পাতার খাতা)';
        select.appendChild(opt);
        return true;
    }

    // বাটন হুকিং (ডাউনলোড হাবের বাটনগুলোর সাথে সংযোগ)
    function attachHubHooks() {
        const origPDF = window.hubDownloadPDF;
        window.hubDownloadPDF = function () {
            const select = document.getElementById('hubReportType');
            if (select && select.value === 'due_advance_ledger') {
                triggerDirectPrintPDF();
                return;
            }
            if (typeof origPDF === 'function') origPDF();
        };

        const origExcel = window.hubExportExcel;
        window.hubExportExcel = function () {
            const select = document.getElementById('hubReportType');
            if (select && select.value === 'due_advance_ledger') {
                triggerDirectExcel();
                return;
            }
            if (typeof origExcel === 'function') origExcel();
        };

        const origPreview = window.hubGeneratePreview;
        window.hubGeneratePreview = function () {
            const select = document.getElementById('hubReportType');
            if (select && select.value === 'due_advance_ledger') {
                triggerDirectPrintPDF();
                return;
            }
            if (typeof origPreview === 'function') origPreview();
        };
    }

    function init() {
        injectDropdownOption();
        attachHubHooks();
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
        if (injectDropdownOption() || count > 30) {
            clearInterval(timer);
        }
    }, 300);

})();
