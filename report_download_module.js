/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - DEDICATED REPORT DOWNLOAD CENTER
 * File: report_download_module.js
 * 
 * Includes: Auto-Retry DOM Injector & Bulletproof Tab Switching Engine.
 * ============================================================================
 */

(function () {
    "use strict";

    // ১. বাংলা সংখ্যা ও ফরম্যাটিং
    const BN_DIGITS = { "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪", "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯" };
    const toBn = (val) => String(val ?? "").replace(/\d/g, d => BN_DIGITS[d]);

    const toBnMoney = (val) => {
        const num = Number(val) || 0;
        const fmt = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(num));
        return fmt.replace(/\d/g, d => BN_DIGITS[d]);
    };

    const escapeHTML = (str) => String(str ?? "").replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);

    const formatTime = (time) => {
        if (!time) return "--:--";
        const parts = String(time).split(":");
        let hour = parseInt(parts[0], 10);
        const minute = String(parts[1] || "00").padStart(2, "0");
        if (Number.isNaN(hour)) return "--:--";
        const ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
        return `${toBn(String(hour).padStart(2, "0"))}:${toBn(minute)} ${ampm}`;
    };

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
    const moduleStyles = `
        <style id="custom-download-module-styles">
            .rpt-center-wrap {
                max-width: 1100px;
                margin: 0 auto;
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #1e293b;
            }
            .rpt-box {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            }
            .rpt-box-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #f1f5f9;
                padding-bottom: 14px;
                margin-bottom: 20px;
            }
            .rpt-box-header h3 {
                font-size: 1.15rem;
                font-weight: 700;
                color: #0f172a;
                margin: 0;
            }
            .rpt-box-header span {
                font-size: 0.82rem;
                color: #64748b;
            }
            .rpt-filter-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 16px;
                margin-bottom: 18px;
            }
            .rpt-control-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .rpt-control-group label {
                font-size: 0.8rem;
                font-weight: 600;
                color: #475569;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .rpt-inp, .rpt-sel {
                width: 100%;
                height: 42px;
                padding: 0 12px;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                font-size: 0.9rem;
                color: #1e293b;
                background-color: #ffffff;
                outline: none;
                transition: border-color 0.2s;
            }
            .rpt-inp:focus, .rpt-sel:focus { border-color: #0f172a; }
            .rpt-quick-dates {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px dashed #e2e8f0;
            }
            .rpt-quick-dates span {
                font-size: 0.8rem;
                font-weight: 600;
                color: #64748b;
                margin-right: 4px;
            }
            .rpt-pill-btn {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 6px 14px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 600;
                color: #475569;
                cursor: pointer;
                transition: all 0.15s;
            }
            .rpt-pill-btn:hover, .rpt-pill-btn.active {
                background: #0f172a;
                color: #ffffff;
                border-color: #0f172a;
            }
            .rpt-action-bar {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .rpt-btn-base {
                height: 40px;
                padding: 0 18px;
                border-radius: 8px;
                font-size: 0.88rem;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
            }
            .rpt-btn-dark { background: #0f172a; color: #ffffff; }
            .rpt-btn-dark:hover { background: #334155; }
            .rpt-btn-light { background: #ffffff; color: #334155; border-color: #cbd5e1; }
            .rpt-btn-light:hover { background: #f8fafc; border-color: #94a3b8; }
            .rpt-btn-clear { background: transparent; color: #64748b; border: none; }
            .rpt-btn-clear:hover { color: #0f172a; text-decoration: underline; }
            
            .rpt-preview-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 25px;
                min-height: 400px;
                overflow-x: auto;
            }
            .rpt-preview-table {
                width: 100%;
                border-collapse: collapse;
                font-family: 'Tiro Bangla', serif;
                margin-top: 15px;
            }
            .rpt-preview-table th, .rpt-preview-table td {
                border: 1px solid #cbd5e1;
                padding: 8px 10px;
                font-size: 0.9rem;
            }
            .rpt-preview-table th {
                background: #f1f5f9;
                font-weight: 700;
                text-align: center;
            }
            .rpt-placeholder-state {
                text-align: center;
                padding: 60px 20px;
                color: #94a3b8;
            }
            .rpt-placeholder-state i { font-size: 2.8rem; color: #cbd5e1; margin-bottom: 12px; }
            .rpt-placeholder-state h4 { font-size: 1.05rem; color: #475569; margin-bottom: 4px; }
        </style>
    `;

    // ৩. সাইডবারে বাটন ইনজেকশন
    function injectModuleMenu() {
        const sidebarList = document.querySelector('.sidebar .menu-list');
        if (!sidebarList || document.getElementById('menu-download-hub')) return false;

        const li = document.createElement('li');
        li.className = 'menu-item';
        li.id = 'menu-download-hub';
        li.innerHTML = `
            <a onclick="window.openReportDownloadHub()">
                <span class="menu-link-inner"><i class="fa-solid fa-cloud-arrow-down"></i> <span>Download Reports</span></span>
            </a>
        `;

        const settingsMenu = document.getElementById('menu-settings-parent');
        if (settingsMenu) {
            sidebarList.insertBefore(li, settingsMenu);
        } else {
            sidebarList.appendChild(li);
        }
        return true;
    }

    // ৪. ভিউ প্যানেল ইনজেকশন
    function injectModuleView() {
        const wrapper = document.querySelector('.main-wrapper');
        if (!wrapper || document.getElementById('report-download-hub-view')) return false;

        const panel = document.createElement('div');
        panel.className = 'view-panel';
        panel.id = 'report-download-hub-view';

        panel.innerHTML = `
            <div class="rpt-center-wrap">
                <div class="rpt-box">
                    <div class="rpt-box-header">
                        <div>
                            <h3>Report Download Center</h3>
                            <span>Select statement parameters to generate, preview, and download</span>
                        </div>
                    </div>

                    <div class="rpt-filter-grid">
                        <div class="rpt-control-group" style="grid-column: span 2;">
                            <label>Select Report</label>
                            <select id="hubReportType" class="rpt-sel">
                                <option value="daily_transactions" selected>Daily Transactions (লেনদেনের রিপোর্ট)</option>
                                <option value="daily_closing">Daily Closing Statement</option>
                                <option value="all_dues">Customer Outstanding Due</option>
                                <option value="card_inventory">Card Inventory Stock</option>
                                <option value="cash_inventory">Physical Cash Denominations</option>
                            </select>
                        </div>
                        <div class="rpt-control-group">
                            <label>Report Date</label>
                            <input type="date" id="hubFromDate" class="rpt-inp" />
                        </div>
                    </div>

                    <div class="rpt-quick-dates">
                        <span>Shortcuts:</span>
                        <button type="button" class="rpt-pill-btn active" onclick="window.hubDateShortcut('today')">Today</button>
                        <button type="button" class="rpt-pill-btn" onclick="window.hubDateShortcut('yesterday')">Yesterday</button>
                    </div>

                    <div class="rpt-action-bar">
                        <button type="button" class="rpt-btn-base rpt-btn-clear" onclick="window.hubReset()">
                            <i class="fa-solid fa-arrow-rotate-left"></i> Reset
                        </button>
                        <button type="button" class="rpt-btn-base rpt-btn-dark" onclick="window.hubGeneratePreview()">
                            <i class="fa-solid fa-magnifying-glass"></i> Generate Preview
                        </button>
                        <button type="button" class="rpt-btn-base rpt-btn-light" onclick="window.hubDownloadPDF()">
                            <i class="fa-solid fa-file-pdf" style="color:#ef4444;"></i> Download PDF
                        </button>
                        <button type="button" class="rpt-btn-base rpt-btn-light" onclick="window.hubExportExcel()">
                            <i class="fa-solid fa-file-excel" style="color:#10b981;"></i> Export Excel
                        </button>
                    </div>
                </div>

                <!-- PREVIEW CONTAINER -->
                <div class="rpt-preview-card" id="hub-report-print-area">
                    <div class="rpt-placeholder-state">
                        <i class="fa-regular fa-file-lines"></i>
                        <h4>Report Ready for Generation</h4>
                        <p>Click <strong>Generate Preview</strong> to preview the statement, or click <strong>Download PDF</strong> / <strong>Export Excel</strong> directly.</p>
                    </div>
                </div>
            </div>
        `;

        wrapper.appendChild(panel);
        return true;
    }

    // ৫. মাস্টার ট্যাব সুইচিং ফাংশন (ক্লিক করলে ওপেন হওয়া নিশ্চিত করে)
    window.openReportDownloadHub = function() {
        if (typeof window.switchMainTab === 'function') {
            window.switchMainTab('report-download-hub');
        } else {
            document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
            const p = document.getElementById('report-download-hub-view');
            if (p) p.classList.add('active');
        }

        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        const m = document.getElementById('menu-download-hub');
        if (m) m.classList.add('active');

        const title = document.getElementById('top-title');
        if (title) title.innerText = "REPORT DOWNLOAD CENTER";
    };

    // ৬. ডাটা প্রিপারেশন
    function getTransactionReportData(selectedDate) {
        const txs = Array.isArray(window.customerTransactions) ? window.customerTransactions : [];
        const custs = Array.isArray(window.customers) ? window.customers : [];

        const dayTxs = txs.filter(t => String(t.date) === String(selectedDate));
        if (dayTxs.length === 0) return null;

        return dayTxs.map(t => {
            const cust = custs.find(c => String(c.id) === String(t.customerId));
            const debit = Number(t.debit) || 0;
            const credit = Number(t.credit) || 0;
            return {
                ...t,
                customerName: cust ? cust.name : "Unknown",
                amount: debit > 0 ? debit : credit,
                transactionType: debit > 0 ? "বাকী দিলাম" : "বাকী পেলাম",
                description: t.description || "",
                comment: t.comment || ""
            };
        });
    }

    // ৭. প্রিভিউ টেবিল
    window.hubGeneratePreview = function () {
        const rptType = document.getElementById('hubReportType').value;
        const selectedDate = document.getElementById('hubFromDate').value;
        const container = document.getElementById('hub-report-print-area');

        if (!selectedDate) {
            alert("দয়া করে একটি তারিখ নির্বাচন করুন।");
            return;
        }

        if (rptType === 'daily_transactions') {
            const data = getTransactionReportData(selectedDate);
            if (!data) {
                container.innerHTML = `
                    <div class="rpt-placeholder-state">
                        <i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b;"></i>
                        <h4>এই তারিখে (${selectedDate}) কোনো লেনদেন নেই</h4>
                    </div>
                `;
                return;
            }

            const dateInfo = getBanglaDate(selectedDate);
            let totalAmount = 0;
            let rowsHtml = '';

            data.forEach((item, index) => {
                totalAmount += Math.abs(item.amount);
                rowsHtml += `
                    <tr>
                        <td style="text-align:center;">${toBn(index + 1)}।</td>
                        <td style="text-align:center;">${formatTime(item.time)}</td>
                        <td style="font-weight:600;">${escapeHTML(item.customerName)}</td>
                        <td style="text-align:center;">${escapeHTML(item.transactionType)}</td>
                        <td>${escapeHTML(item.description)}</td>
                        <td style="text-align:right; font-weight:700;">৳ ${toBnMoney(item.amount)}</td>
                        <td>${escapeHTML(item.comment)}</td>
                    </tr>
                `;
            });

            container.innerHTML = `
                <div style="text-align:center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
                    <h2 style="margin:0; font-family:'Times New Roman', serif; font-size:22px; font-weight:bold;">MOUSUMI COMPUTER</h2>
                    <h4 style="margin:3px 0; font-family:'Tiro Bangla', serif; font-size:16px;">লেনদেনের রিপোর্ট</h4>
                </div>
                <div style="display:flex; justify-content:space-between; font-family:'Tiro Bangla', serif; font-size:13px; margin-bottom:8px; font-weight:600;">
                    <div>তারিখ: ${dateInfo.date} ${dateInfo.month} ${dateInfo.year}</div>
                    <div>বার: ${dateInfo.day}</div>
                </div>
                <table class="rpt-preview-table">
                    <thead>
                        <tr>
                            <th style="width:8%;">ক্রমিক</th>
                            <th style="width:14%;">সময়</th>
                            <th style="width:20%;">কাস্টমার</th>
                            <th style="width:15%;">লেনদেন</th>
                            <th style="width:23%;">বিস্তারিত</th>
                            <th style="width:12%;">টাকা</th>
                            <th style="width:8%;">মন্তব্য</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                        <tr style="font-weight:bold; background:#f8fafc;">
                            <td colspan="5" style="text-align:right; padding-right:15px;">সর্বমোট:</td>
                            <td style="text-align:right;">৳ ${toBnMoney(totalAmount)}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
    };

    // ৮. PDF ডাউনলোড ইঞ্জিন
    window.hubDownloadPDF = function () {
        const rptType = document.getElementById('hubReportType').value;
        const selectedDate = document.getElementById('hubFromDate').value;

        if (!selectedDate) {
            alert("দয়া করে একটি তারিখ নির্বাচন করুন।");
            return;
        }

        if (rptType === 'daily_transactions') {
            const reportData = getTransactionReportData(selectedDate);
            if (!reportData) {
                alert("এই তারিখে কোনো লেনদেন নেই!");
                return;
            }

            const dateInfo = getBanglaDate(selectedDate);
            let totalAmount = 0;
            let rowsHTML = "";

            reportData.forEach((t, index) => {
                totalAmount += Math.abs(t.amount);
                rowsHTML += `
                    <tr>
                        <td class="serial">${toBn(index + 1)}।</td>
                        <td class="time">${formatTime(t.time)}</td>
                        <td class="customer">${escapeHTML(t.customerName)}</td>
                        <td class="type">${escapeHTML(t.transactionType)}</td>
                        <td class="details">${escapeHTML(t.description)}</td>
                        <td class="money">${toBnMoney(t.amount)}</td>
                        <td class="comment">${escapeHTML(t.comment)}</td>
                    </tr>
                `;
            });

            const printHTML = `
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="UTF-8">
<title>Mousumi Computer Transaction Report</title>
<style>
@page { size: A4 portrait; margin: 9mm 8mm 12mm 8mm; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; width: 100%; background: #fff; color: #000; font-family: "Tiro Bangla", "Noto Sans Bengali", sans-serif; font-size: 11px; }
.header { text-align: center; margin-bottom: 9px; }
.shop-name { font-family: "Times New Roman", serif; font-size: 24px; font-weight: bold; margin: 0; }
.report-title { font-size: 16px; margin-top: 2px; }
.info { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 6px; font-size: 11px; }
.transaction-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.transaction-table th, .transaction-table td { border: 0.5px solid #000; padding: 4px; font-size: 10.5px; line-height: 1.25; vertical-align: middle; }
.transaction-table th { font-weight: bold; text-align: center; background: #f5f5f5; }
.serial { width: 7%; text-align: center; }
.time { width: 12%; text-align: center; }
.customer { width: 18%; text-align: left; }
.type { width: 15%; text-align: center; }
.details { width: 25%; text-align: left; }
.money { width: 11%; text-align: right; }
.comment { width: 12%; text-align: left; }
.total-row td { font-weight: bold; background: #fff; }
.total-label { text-align: right; padding-right: 7px !important; }
.signature-area { margin-top: 42px; display: flex; justify-content: flex-end; }
.signature { width: 180px; text-align: center; }
.signature-line { width: 100%; border-top: 0.5px solid #000; margin-bottom: 4px; }
.signature-text { font-family: "Times New Roman", serif; font-size: 10.5px; }
@media print { .transaction-table { page-break-inside: auto; } .transaction-table tr { page-break-inside: avoid; } .signature-area { page-break-inside: avoid; } }
</style>
</head>
<body>
    <div class="header">
        <div class="shop-name">MOUSUMI COMPUTER</div>
        <div class="report-title">লেনদেনের রিপোর্ট</div>
    </div>
    <div class="info">
        <div>তারিখ: ${dateInfo.date} ${dateInfo.month} ${dateInfo.year}</div>
        <div>বার: ${dateInfo.day}</div>
    </div>
    <table class="transaction-table">
        <thead>
            <tr>
                <th class="serial">ক্রমিক</th>
                <th class="time">সময়</th>
                <th class="customer">কাস্টমার</th>
                <th class="type">লেনদেন</th>
                <th class="details">বিস্তারিত</th>
                <th class="money">টাকা</th>
                <th class="comment">মন্তব্য</th>
            </tr>
        </thead>
        <tbody>
            ${rowsHTML}
            <tr class="total-row">
                <td colspan="5" class="total-label">সর্বমোট:</td>
                <td class="money">${toBnMoney(totalAmount)}</td>
                <td class="comment"></td>
            </tr>
        </tbody>
    </table>
    <div class="signature-area">
        <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-text">Authorized Signature</div>
        </div>
    </div>
    <script>
        window.onload = function() { setTimeout(function(){ window.focus(); window.print(); }, 350); };
        window.onafterprint = function() { setTimeout(function(){ window.close(); }, 200); };
    </script>
</body>
</html>
            `;

            const printWindow = window.open("", "_blank", "width=900,height=900");
            if (!printWindow) {
                alert("Print Window খোলা যায়নি! Browser-এর Popup Allow করুন।");
                return;
            }
            printWindow.document.open();
            printWindow.document.write(printHTML);
            printWindow.document.close();
        }
    };

    // ৯. Excel এক্সপোর্ট
    window.hubExportExcel = function () {
        const rptType = document.getElementById('hubReportType').value;
        const selectedDate = document.getElementById('hubFromDate').value;

        if (rptType === 'daily_transactions') {
            const data = getTransactionReportData(selectedDate);
            if (!data) {
                alert("এই তারিখে কোনো লেনদেন নেই!");
                return;
            }

            const excelRows = [
                ["MOUSUMI COMPUTER - DAILY TRANSACTION REPORT"],
                ["Date:", selectedDate],
                [],
                ["SL", "Time", "Customer Name", "Type", "Description", "Amount (BDT)", "Comment"]
            ];

            let total = 0;
            data.forEach((d, idx) => {
                total += Math.abs(d.amount);
                excelRows.push([
                    idx + 1,
                    d.time || '--:--',
                    d.customerName,
                    d.transactionType,
                    d.description,
                    d.amount,
                    d.comment
                ]);
            });
            excelRows.push(["", "", "", "", "Total:", total, ""]);

            if (window.XLSX) {
                const ws = XLSX.utils.aoa_to_sheet(excelRows);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Transactions");
                XLSX.writeFile(wb, `Transaction_Report_${selectedDate}.xlsx`);
            }
        }
    };

    // ১০. ডেট শর্টকাট ও রিসেট
    window.hubDateShortcut = function (preset) {
        document.querySelectorAll('.rpt-pill-btn').forEach(b => b.classList.remove('active'));
        if (event && event.target) event.target.classList.add('active');

        const fromInp = document.getElementById('hubFromDate');
        if (!fromInp) return;
        const now = new Date();
        const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

        if (preset === 'today') {
            fromInp.value = fmt(now);
        } else if (preset === 'yesterday') {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            fromInp.value = fmt(y);
        }
    };

    window.hubReset = function () {
        const sel = document.getElementById('hubReportType');
        if (sel) sel.selectedIndex = 0;
        window.hubDateShortcut('today');
        const area = document.getElementById('hub-report-print-area');
        if (area) {
            area.innerHTML = `
                <div class="rpt-placeholder-state">
                    <i class="fa-regular fa-file-lines"></i>
                    <h4>Report Ready for Generation</h4>
                    <p>Click <strong>Generate Preview</strong> to preview the statement, or click <strong>Download PDF</strong> / <strong>Export Excel</strong> directly.</p>
                </div>
            `;
        }
    };

    // ১১. অটো-রিট্রাই ইনিশিয়ালাইজার (সাইডবার লোড হওয়া নিশ্চিত করবে)
    function autoInit() {
        if (!document.getElementById('custom-download-module-styles')) {
            document.head.insertAdjacentHTML('beforeend', moduleStyles);
        }

        const menuInjected = injectModuleMenu();
        const viewInjected = injectModuleView();

        if (menuInjected && viewInjected) {
            window.hubDateShortcut('today');
            return true;
        }
        return false;
    }

    // প্রতি ২৫০ মিলিসেকেন্ড পরপর চেক করবে যতক্ষণ না সাইডবার পাওয়া যায়
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        if (autoInit() || attempts > 40) {
            clearInterval(interval);
        }
    }, 250);

})();
