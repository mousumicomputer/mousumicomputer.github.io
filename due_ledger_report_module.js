/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - CUSTOMER DUE & ADVANCE LEDGER REPORT MODULE
 * File: due_ledger_report_module.js
 * 
 * Features:
 * 1. Page 1: আমি কতজনের কাছে টাকা পাবো (গ্রাহকদের বকেয়া তালিকা / দেনাদার খাতা)
 * 2. Page 2: আমার কাছে কে কে টাকা পাবে (গ্রাহকদের জমা/অগ্রিম তালিকা / পাওনাদার খাতা)
 * 3. Page 3: সার্বিক হিসাব-নিকাশ সমন্বয় ও আর্থিক বিশ্লেষণ (Adjustment & Net Position)
 * 4. Google Font 'Tiro Bangla' Typography with strict A4 Page Breaks.
 * 5. Opens in dedicated New Tab with 'Download PDF', 'Export Excel', and 'Close' controls.
 * 6. 100% Non-destructive (Main file untouched).
 * ============================================================================
 */

(function () {
    "use strict";

    // ১. বাংলা সংখ্যা ও টাকার ফরম্যাটার
    const BN_DIGITS = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
    const toBn = (val) => String(val ?? "").replace(/\d/g, d => BN_DIGITS[d]);

    const toBnMoney = (val) => {
        const num = Number(val) || 0;
        const fmt = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(num));
        return fmt.replace(/\d/g, d => BN_DIGITS[d]);
    };

    const escapeHTML = (str) => String(str ?? "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);

    const getBanglaCurrentDate = () => {
        const date = new Date();
        const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
        const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
        return {
            day: days[date.getDay()],
            date: toBn(date.getDate()),
            month: months[date.getMonth()],
            year: toBn(date.getFullYear()),
            time: date.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true }),
            full: `${toBn(date.getDate())} ${months[date.getMonth()]} ${toBn(date.getFullYear())}`
        };
    };

    // ২. লাইভ স্টোর থেকে হিসাব গণনা
    function getDueAndAdvanceData() {
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

        const willReceiveList = []; // আমি পাবো (Customer Due)
        const willPayList = [];     // আমার কাছে পাবে (Customer Advance / Deposit)
        let totalReceivable = 0;
        let totalPayable = 0;

        customers.forEach(c => {
            let balance = parseFloat(c.openingBalance) || 0;
            const custTxs = transactions.filter(t => String(t.customerId) === String(c.id));
            custTxs.forEach(t => {
                balance += (parseFloat(t.debit) || 0) - (parseFloat(t.credit) || 0);
            });

            if (balance > 0.009) {
                willReceiveList.push({
                    id: c.id,
                    name: c.name || "নামহীন কাস্টমার",
                    phone: c.phone || "---",
                    address: c.address || "---",
                    amount: balance
                });
                totalReceivable += balance;
            } else if (balance < -0.009) {
                const advAmount = Math.abs(balance);
                willPayList.push({
                    id: c.id,
                    name: c.name || "নামহীন কাস্টমার",
                    phone: c.phone || "---",
                    address: c.address || "---",
                    amount: advAmount
                });
                totalPayable += advAmount;
            }
        });

        // বড় থেকে ছোট সাজানো
        willReceiveList.sort((a, b) => b.amount - a.amount);
        willPayList.sort((a, b) => b.amount - a.amount);

        const netPosition = totalReceivable - totalPayable;

        return {
            dateInfo: getBanglaCurrentDate(),
            willReceiveList,
            totalReceivable,
            totalReceivableCount: willReceiveList.length,
            willPayList,
            totalPayable,
            totalPayableCount: willPayList.length,
            netPosition
        };
    }

    // ৩. ৩ পাতার সম্পূর্ণ HTML ও অ্যাকশন বার জেনারেটর
    window.openDueAdvanceLedgerTab = function () {
        const data = getDueAndAdvanceData();

        // টেবিল রো - আমি পাবো (পাতা ১)
        let receiveRowsHtml = '';
        if (data.willReceiveList.length === 0) {
            receiveRowsHtml = `<tr><td colspan="5" class="empty-msg">বর্তমানে কোনো গ্রাহকের কাছে বকেয়া পাওনা নেই।</td></tr>`;
        } else {
            data.willReceiveList.forEach((item, index) => {
                receiveRowsHtml += `
                    <tr>
                        <td class="text-center">${toBn(index + 1)}।</td>
                        <td class="font-bold">${escapeHTML(item.name)}</td>
                        <td class="text-center">${toBn(item.phone)}</td>
                        <td>${escapeHTML(item.address)}</td>
                        <td class="text-right font-bold text-red">৳ ${toBnMoney(item.amount)}</td>
                    </tr>
                `;
            });
        }

        // টেবিল রো - আমার কাছে পাবে (পাতা ২)
        let payRowsHtml = '';
        if (data.willPayList.length === 0) {
            payRowsHtml = `<tr><td colspan="5" class="empty-msg">বর্তমানে কোনো গ্রাহকের অগ্রিম জমা বা পাওনা নেই।</td></tr>`;
        } else {
            data.willPayList.forEach((item, index) => {
                payRowsHtml += `
                    <tr>
                        <td class="text-center">${toBn(index + 1)}।</td>
                        <td class="font-bold">${escapeHTML(item.name)}</td>
                        <td class="text-center">${toBn(item.phone)}</td>
                        <td>${escapeHTML(item.address)}</td>
                        <td class="text-right font-bold text-green">৳ ${toBnMoney(item.amount)}</td>
                    </tr>
                `;
            });
        }

        const fullDocumentHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>বকেয়া ও দেনা-পাওনা সমন্বয় রিপোর্ট - মৌসুমী কম্পিউটার</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"><\/script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

        * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        body {
            margin: 0;
            padding: 0;
            background-color: #f1f5f9;
            font-family: 'Tiro Bangla', serif;
            color: #1e293b;
        }

        /* স্টিকি টপবার কন্ট্রোল */
        .top-action-bar {
            position: sticky;
            top: 0;
            z-index: 9999;
            background: #0f172a;
            color: #ffffff;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .bar-title {
            font-size: 1.05rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .bar-buttons {
            display: flex;
            gap: 12px;
        }
        .btn-act {
            border: none;
            outline: none;
            padding: 8px 16px;
            border-radius: 6px;
            font-family: 'Tiro Bangla', serif;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
        }
        .btn-pdf { background: #ef4444; color: #ffffff; }
        .btn-pdf:hover { background: #dc2626; }
        .btn-excel { background: #10b981; color: #ffffff; }
        .btn-excel:hover { background: #059669; }
        .btn-close { background: #475569; color: #ffffff; }
        .btn-close:hover { background: #334155; }

        /* প্রিন্ট পেজ কন্টেইনার */
        .page-container {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm 15mm;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        /* হেডার */
        .report-header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        .shop-name {
            font-size: 24px;
            font-weight: bold;
            color: #0f172a;
            margin: 0;
            letter-spacing: 0.5px;
        }
        .report-subtitle {
            font-size: 16px;
            font-weight: bold;
            color: #334155;
            margin: 4px 0 0 0;
        }
        .meta-info-strip {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
            padding: 4px 8px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4px;
        }

        /* টেবিল স্টাইল */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
            margin-top: 4px;
        }
        .data-table th, .data-table td {
            border: 1px solid #0f172a;
            padding: 5px 7px;
            line-height: 1.3;
        }
        .data-table th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: left;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .text-red { color: #dc2626; }
        .text-green { color: #16a34a; }
        .text-blue { color: #2563eb; }
        .empty-msg {
            text-align: center;
            padding: 25px;
            color: #64748b;
            font-size: 13px;
        }

        .summary-total-row {
            background-color: #f8fafc;
            font-weight: bold;
        }

        /* সমন্বয় কার্ড গ্রিড (৩য় পাতা) */
        .adj-cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 15px;
            margin-bottom: 20px;
        }
        .adj-card {
            border: 1.5px solid #0f172a;
            border-radius: 6px;
            padding: 16px;
            background: #ffffff;
        }
        .adj-card-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
        }
        .adj-card-val {
            font-size: 20px;
            font-weight: bold;
        }
        .adj-card-count {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
        }

        .net-status-box {
            border: 2px dashed #0f172a;
            border-radius: 8px;
            padding: 18px;
            text-align: center;
            background: #f8fafc;
            margin-top: 10px;
        }
        .net-status-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 6px;
        }
        .net-status-val {
            font-size: 26px;
            font-weight: bold;
        }

        /* সিগনেচার ও ফুটার */
        .report-footer-area {
            margin-top: 40px;
        }
        .signature-wrap {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 30px;
        }
        .sig-block {
            width: 190px;
            text-align: center;
        }
        .sig-line {
            border-top: 1px solid #000;
            margin-bottom: 4px;
        }
        .sig-text {
            font-size: 11.5px;
            font-weight: bold;
        }
        .page-number-text {
            text-align: center;
            font-size: 10.5px;
            color: #64748b;
            margin-top: 15px;
        }

        /* প্রিন্ট মিডিয়া কোয়েরি */
        @media print {
            body {
                background: #ffffff !important;
            }
            .top-action-bar {
                display: none !important;
            }
            .page-container {
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 10mm 12mm !important;
                border: none !important;
                box-shadow: none !important;
                page-break-after: always !important;
                break-after: page !important;
            }
            .page-container:last-child {
                page-break-after: avoid !important;
                break-after: avoid !important;
            }
        }
    </style>
</head>
<body>

    <!-- অ্যাকশন বাটন কন্ট্রোল বার -->
    <div class="top-action-bar">
        <div class="bar-title">
            <i class="fa-solid fa-scale-balanced"></i>
            <span>গ্রাহক দেনা-পাওনা ও সমন্বয় রিপোর্ট (৩ পাতার বিবরণী)</span>
        </div>
        <div class="bar-buttons">
            <button type="button" class="btn-act btn-pdf" onclick="window.print()">
                <i class="fa-solid fa-file-pdf"></i> Download PDF / Print
            </button>
            <button type="button" class="btn-act btn-excel" onclick="exportFullExcel()">
                <i class="fa-solid fa-file-excel"></i> Export Excel
            </button>
            <button type="button" class="btn-act btn-close" onclick="window.close()">
                <i class="fa-solid fa-xmark"></i> Close Tab
            </button>
        </div>
    </div>

    <!-- ==================== পাতা ১: আমি কতজনের কাছে টাকা পাবো ==================== -->
    <div class="page-container" id="page-1">
        <div>
            <div class="report-header">
                <h1 class="shop-name">MOUSUMI COMPUTER</h1>
                <h3 class="report-subtitle">আমি কতজনের কাছে টাকা পাবো (গ্রাহকদের বকেয়া খাতা)</h3>
            </div>

            <div class="meta-info-strip">
                <div>তারিখ: ${data.dateInfo.full} (${data.dateInfo.day})</div>
                <div>সময়: ${data.dateInfo.time}</div>
                <div>মোট দেনাদার গ্রাহক: ${toBn(data.totalReceivableCount)} জন</div>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 8%;" class="text-center">ক্রমিক</th>
                        <th style="width: 32%;">কাস্টমারের নাম</th>
                        <th style="width: 20%;" class="text-center">মোবাইল নম্বর</th>
                        <th style="width: 20%;">ঠিকানা</th>
                        <th style="width: 20%;" class="text-right">পাওনা টাকা (৳)</th>
                    </tr>
                </thead>
                <tbody>
                    ${receiveRowsHtml}
                    <tr class="summary-total-row">
                        <td colspan="4" class="text-right font-bold" style="padding-right: 12px;">সর্বমোট বকেয়া পাওনা:</td>
                        <td class="text-right font-bold text-red" style="font-size: 12.5px;">৳ ${toBnMoney(data.totalReceivable)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="report-footer-area">
            <div class="signature-wrap">
                <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-text">হিসাবরক্ষক</div>
                </div>
                <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-text">স্বত্বাধিকারী / কর্তৃপক্ষ</div>
                </div>
            </div>
            <div class="page-number-text">পাতা নং: ০১ / ০৩</div>
        </div>
    </div>

    <!-- ==================== পাতা ২: আমার কাছে কে কে টাকা পাবে ==================== -->
    <div class="page-container" id="page-2">
        <div>
            <div class="report-header">
                <h1 class="shop-name">MOUSUMI COMPUTER</h1>
                <h3 class="report-subtitle">আমার কাছে কে কে টাকা পাবে (গ্রাহকদের জমা / অগ্রিম খাতা)</h3>
            </div>

            <div class="meta-info-strip">
                <div>তারিখ: ${data.dateInfo.full} (${data.dateInfo.day})</div>
                <div>সময়: ${data.dateInfo.time}</div>
                <div>মোট পাওনাদার গ্রাহক: ${toBn(data.totalPayableCount)} জন</div>
            </div>

            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 8%;" class="text-center">ক্রমিক</th>
                        <th style="width: 32%;">কাস্টমারের নাম</th>
                        <th style="width: 20%;" class="text-center">মোবাইল নম্বর</th>
                        <th style="width: 20%;">ঠিকানা</th>
                        <th style="width: 20%;" class="text-right">দেনা / জমা টাকা (৳)</th>
                    </tr>
                </thead>
                <tbody>
                    ${payRowsHtml}
                    <tr class="summary-total-row">
                        <td colspan="4" class="text-right font-bold" style="padding-right: 12px;">সর্বমোট অগ্রিম / দেনা:</td>
                        <td class="text-right font-bold text-green" style="font-size: 12.5px;">৳ ${toBnMoney(data.totalPayable)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="report-footer-area">
            <div class="signature-wrap">
                <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-text">হিসাবরক্ষক</div>
                </div>
                <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-text">স্বত্বাধিকারী / কর্তৃপক্ষ</div>
                </div>
            </div>
            <div class="page-number-text">পাতা নং: ০২ / ০৩</div>
        </div>
    </div>

    <!-- ==================== পাতা ৩: হিসাব-নিকাশ সমন্বয় ও এক নজরে অবস্থা ==================== -->
    <div class="page-container" id="page-3">
        <div>
            <div class="report-header">
                <h1 class="shop-name">MOUSUMI COMPUTER</h1>
                <h3 class="report-subtitle">সার্বিক দেনা-পাওনা হিসাব সমন্বয় বিবরণী (Adjustment & Summary)</h3>
            </div>

            <div class="meta-info-strip">
                <div>তারিখ: ${data.dateInfo.full} (${data.dateInfo.day})</div>
                <div>সময়: ${data.dateInfo.time}</div>
                <div>প্রতিবেদন ধরন: চূড়ান্ত সমন্বয়</div>
            </div>

            <div class="adj-cards-grid">
                <div class="adj-card" style="border-left: 5px solid #dc2626;">
                    <div class="adj-card-title text-red">১. মোট বকেয়া পাওনা (আমি পাবো)</div>
                    <div class="adj-card-val text-red">৳ ${toBnMoney(data.totalReceivable)}</div>
                    <div class="adj-card-count">মোট গ্রাহক সংখ্যা: ${toBn(data.totalReceivableCount)} জন</div>
                </div>
                <div class="adj-card" style="border-left: 5px solid #16a34a;">
                    <div class="adj-card-title text-green">২. মোট অগ্রিম জমা (আমার কাছে পাবে)</div>
                    <div class="adj-card-val text-green">৳ ${toBnMoney(data.totalPayable)}</div>
                    <div class="adj-card-count">মোট গ্রাহক সংখ্যা: ${toBn(data.totalPayableCount)} জন</div>
                </div>
            </div>

            <!-- সমন্বয় সারণী -->
            <table class="data-table" style="margin-top: 20px;">
                <thead>
                    <tr>
                        <th style="width: 70%;">বিবরণ</th>
                        <th style="width: 30%;" class="text-right">পরিমাণ (৳)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>সর্বমোট গ্রাহকদের নিকট প্রাপ্য বকেয়া (Account Receivables)</td>
                        <td class="text-right font-bold text-red">৳ ${toBnMoney(data.totalReceivable)}</td>
                    </tr>
                    <tr>
                        <td>সর্বমোট গ্রাহকদের জমা / দেনা সমন্বয় (Account Payables / Advances)</td>
                        <td class="text-right font-bold text-green">৳ ${toBnMoney(data.totalPayable)}</td>
                    </tr>
                    <tr class="summary-total-row">
                        <td class="font-bold">প্রকৃত নিট অবস্থান (Net Receivable / Due Position)</td>
                        <td class="text-right font-bold ${data.netPosition >= 0 ? 'text-blue' : 'text-red'}" style="font-size: 13px;">
                            ৳ ${toBnMoney(data.netPosition)}
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- সমন্বয় বিশ্লেষণ বক্স -->
            <div class="net-status-box" style="border-color: ${data.netPosition >= 0 ? '#2563eb' : '#dc2626'};">
                <div class="net-status-title" style="color: ${data.netPosition >= 0 ? '#1d4ed8' : '#b91c1c'};">
                    ${data.netPosition >= 0 ? 'সার্বিক সমন্বয় শেষে প্রতিষ্ঠানের প্রকৃত নিট পাওনা' : 'সার্বিক সমন্বয় শেষে প্রতিষ্ঠানের নিট দেনা/দায়'}
                </div>
                <div class="net-status-val" style="color: ${data.netPosition >= 0 ? '#1d4ed8' : '#b91c1c'};">
                    ৳ ${toBnMoney(data.netPosition)}
                </div>
                <div style="font-size: 12px; color: #475569; margin-top: 6px;">
                    ${data.netPosition >= 0 
                        ? `(প্রতিষ্ঠানের অগ্রিম দেনা সমন্বয়ের পরেও গ্রাহকদের নিকট সর্বমোট ৳ ${toBnMoney(data.netPosition)} নগদ প্রাপ্য রয়েছে)` 
                        : `(গ্রাহকদের মোট পাওনা বকেয়ার চেয়ে ৳ ${toBnMoney(Math.abs(data.netPosition))} বেশি জমা রয়েছে)`}
                </div>
            </div>
        </div>

        <div class="report-footer-area">
            <div class="signature-wrap">
                <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-text">হিসাবরক্ষক</div>
                </div>
                <div class="sig-block">
                    <div class="sig-line"></div>
                    <div class="sig-text">স্বত্বাধিকারী / কর্তৃপক্ষ</div>
                </div>
            </div>
            <div class="page-number-text">পাতা নং: ০৩ / ০৩</div>
        </div>
    </div>

    <!-- এক্সেল এক্সপোর্ট স্ক্রিপ্ট -->
    <script>
        function exportFullExcel() {
            if (!window.XLSX) {
                alert("Excel লাইব্রেরি পাওয়া যায়নি!");
                return;
            }

            const wb = XLSX.utils.book_new();

            // শিট ১: আমি পাবো
            const recData = [
                ["মৌসুমী কম্পিউটার - গ্রাহকদের বকেয়া খাতা (আমি যাদের কাছে পাবো)"],
                ["তারিখ:", "${data.dateInfo.full}", "সময়:", "${data.dateInfo.time}"],
                [],
                ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল নম্বর", "ঠিকানা", "পাওনা টাকা (৳)"]
            ];
            const rawRecList = ${JSON.stringify(data.willReceiveList)};
            rawRecList.forEach((item, idx) => {
                recData.push([idx + 1, item.name, item.phone, item.address, item.amount]);
            });
            recData.push(["", "", "", "সর্বমোট পাওনা:", ${data.totalReceivable}]);
            const ws1 = XLSX.utils.aoa_to_sheet(recData);
            XLSX.utils.book_append_sheet(wb, ws1, "আমি পাবো (Receivable)");

            // শিট ২: আমার কাছে পাবে
            const payData = [
                ["মৌসুমী কম্পিউটার - গ্রাহকদের জমা/অগ্রিম খাতা (আমার কাছে যারা পাবে)"],
                ["তারিখ:", "${data.dateInfo.full}", "সময়:", "${data.dateInfo.time}"],
                [],
                ["ক্রমিক", "কাস্টমারের নাম", "মোবাইল নম্বর", "ঠিকানা", "দেনা/জমা টাকা (৳)"]
            ];
            const rawPayList = ${JSON.stringify(data.willPayList)};
            rawPayList.forEach((item, idx) => {
                payData.push([idx + 1, item.name, item.phone, item.address, item.amount]);
            });
            payData.push(["", "", "", "সর্বমোট দেনা/জমা:", ${data.totalPayable}]);
            const ws2 = XLSX.utils.aoa_to_sheet(payData);
            XLSX.utils.book_append_sheet(wb, ws2, "আমার কাছে পাবে (Payable)");

            // শিট ৩: সমন্বয়
            const adjData = [
                ["মৌসুমী কম্পিউটার - দেনা-পাওনা সমন্বয় বিবরণী"],
                ["তারিখ:", "${data.dateInfo.full}", "সময়:", "${data.dateInfo.time}"],
                [],
                ["বিবরণ", "পরিমাণ (৳)"],
                ["মোট বকেয়া পাওনা (Receivables)", ${data.totalReceivable}],
                ["মোট অগ্রিম জমা / দেনা (Payables)", ${data.totalPayable}],
                ["প্রকৃত নিট অবস্থান (Net Receivable)", ${data.netPosition}]
            ];
            const ws3 = XLSX.utils.aoa_to_sheet(adjData);
            XLSX.utils.book_append_sheet(wb, ws3, "সমন্বয় বিবরণী (Summary)");

            XLSX.writeFile(wb, "Customer_Due_and_Advance_Ledger.xlsx");
        }
    <\/script>
</body>
</html>
        `;

        // নতুন ট্যাবে ওপেন করা
        const reportTab = window.open("", "_blank");
        if (!reportTab) {
            alert("নতুন ট্যাব খুলতে পারেনি! অনুগ্রহ করে ব্রাউজারের Pop-up Allow করুন।");
            return;
        }
        reportTab.document.open();
        reportTab.document.write(fullDocumentHTML);
        reportTab.document.close();
    };

    // ৪. সাইডবারে সরাসরি বাটন ইনজেকশন
    function injectDueLedgerMenuButton() {
        if (document.getElementById('menu-due-advance-ledger')) return true;

        const sidebarList = document.querySelector('#sidebar .menu-list') || document.querySelector('.sidebar .menu-list');
        if (!sidebarList) return false;

        const li = document.createElement('li');
        li.className = 'menu-item';
        li.id = 'menu-due-advance-ledger';
        li.innerHTML = `
            <a onclick="window.openDueAdvanceLedgerTab()" style="cursor: pointer;">
                <span class="menu-link-inner">
                    <i class="fa-solid fa-scale-balanced" style="color: #38bdf8;"></i> 
                    <span>দেনা-পাওনা সমন্বয় রিপোর্ট</span>
                </span>
            </a>
        `;

        const downloadMenu = document.getElementById('menu-download-hub');
        if (downloadMenu && downloadMenu.parentNode === sidebarList) {
            sidebarList.insertBefore(li, downloadMenu.nextSibling);
        } else {
            sidebarList.appendChild(li);
        }
        return true;
    }

    // অটো ইনিশিয়ালাইজেশন
    function init() {
        injectDueLedgerMenuButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    window.addEventListener('load', init);

    let checkCount = 0;
    const timer = setInterval(() => {
        checkCount++;
        if (injectDueLedgerMenuButton() || checkCount > 30) {
            clearInterval(timer);
        }
    }, 300);

})();
