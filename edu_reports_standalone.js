/**
 * Mousumi Computer ERP - Standalone Education Reports Hub
 * Font: 'Tiro Bangla', serif (Sharp Vector & Crisp Print)
 * Fixes:
 * 1. Native High-Precision Vector Engine (Eliminates image blurriness & blank 2nd page).
 * 2. Proper Title Case for Student Names (e.g., 'Md Rabbi Hosen').
 * 3. Exact column widths, zero line clipping, and clean 'Grand Total =' alignment.
 */

(function () {
    let feeTransactions = [];
    let studentDueList = [];
    let voidLogs = [];
    let firebaseCore = null;

    // ১. মিনিমালিস্ট ড্যাশবোর্ড ফিল্টার বার সিএসএস
    const hubCSS = `
        @import url('https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap');

        .edu-reports-minimal-box {
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            padding: 22px;
            margin-bottom: 25px;
            font-family: 'Tiro Bangla', serif;
        }

        .edu-reports-header-strip {
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 12px;
            margin-bottom: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 10px;
        }

        .edu-reports-header-strip h3 {
            font-size: 1.05rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .quick-filter-grp {
            display: flex;
            gap: 6px;
        }

        .btn-quick-tag {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 5px 12px;
            border-radius: 4px;
            font-size: 0.78rem;
            font-weight: 700;
            cursor: pointer;
            color: #334155;
            transition: all 0.15s ease;
            font-family: 'Tiro Bangla', serif;
        }

        .btn-quick-tag:hover {
            background: #0f172a;
            color: #ffffff;
            border-color: #0f172a;
        }

        .edu-filter-row {
            display: flex;
            align-items: flex-end;
            gap: 14px;
            flex-wrap: wrap;
        }

        .edu-filter-field {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .edu-filter-field label {
            font-size: 0.78rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #475569;
            letter-spacing: 0.5px;
        }

        .edu-field-input {
            height: 38px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0 10px;
            font-size: 0.9rem;
            color: #0f172a;
            outline: none;
            background: #ffffff;
            min-width: 145px;
            font-family: 'Tiro Bangla', serif;
        }

        .edu-field-input:focus {
            border-color: #0f172a;
        }

        .edu-btn-icon-view {
            height: 38px;
            width: 44px;
            background: #0f172a;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
            transition: background 0.2s ease;
        }

        .edu-btn-icon-view:hover {
            background: #334155;
        }
    `;

    const styleEl = document.createElement("style");
    styleEl.innerText = hubCSS;
    document.head.appendChild(styleEl);

    // ২. ফায়ারবেস কানেকশন
    async function getFirebaseInstance() {
        if (firebaseCore) return firebaseCore;
        try {
            const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const fbDb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            let app;
            for (let i = 0; i < 20; i++) {
                try { app = fbApp.getApp(); if (app) break; } catch (e) { }
                await new Promise(r => setTimeout(r, 200));
            }
            if (!app) {
                app = fbApp.initializeApp({
                    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                    projectId: "mousumi-computer"
                }, "eduReportsApp_" + Date.now());
            }

            const db = fbDb.getDatabase(app);
            firebaseCore = { db, ref: fbDb.ref, onValue: fbDb.onValue };
            return firebaseCore;
        } catch (e) {
            console.error("Firebase connection error:", e);
            return null;
        }
    }

    async function initDataSync() {
        const fb = await getFirebaseInstance();
        if (!fb) return;

        fb.onValue(fb.ref(fb.db, 'erp/feeTransactions'), snap => {
            const d = snap.val();
            feeTransactions = d ? (Array.isArray(d) ? d : Object.values(d)) : [];
        });

        fb.onValue(fb.ref(fb.db, 'erp/studentDueData'), snap => {
            const d = snap.val();
            studentDueList = d ? (Array.isArray(d) ? d : Object.values(d)) : [];
        });

        fb.onValue(fb.ref(fb.db, 'erp/feeVoidLogs'), snap => {
            const d = snap.val();
            voidLogs = d ? (Array.isArray(d) ? d : Object.values(d)) : [];
        });
    }

    // ৩. ফিল্টার প্যানেল রেন্ডার
    function renderMinimalHub() {
        const targetView = document.getElementById('edu-reports-hub-view');
        if (!targetView) return;

        const today = new Date().toISOString().split('T')[0];
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        targetView.innerHTML = `
            <div class="edu-reports-minimal-box">
                <div class="edu-reports-header-strip">
                    <h3>Reports & Audit Terminal</h3>
                    <div class="quick-filter-grp" id="quickFilterContainer">
                        <button type="button" class="btn-quick-tag" onclick="window.setEduDateRange('today')">Today</button>
                        <button type="button" class="btn-quick-tag" onclick="window.setEduDateRange('thisMonth')">This Month</button>
                        <button type="button" class="btn-quick-tag" onclick="window.setEduDateRange('lastMonth')">Last Month</button>
                    </div>
                </div>
                <div class="edu-filter-row">
                    <div class="edu-filter-field" style="flex: 1; min-width: 220px;">
                        <label>Report</label>
                        <select id="eduReportType" class="edu-field-input" style="width: 100%;">
                            <option value="collection">Fee Collection Statement</option>
                            <option value="pending">Pending Clearance (To-Pay Tap)</option>
                            <option value="settled">Settled / Paid Report</option>
                            <option value="due">Master Student Due Database</option>
                            <option value="void">Void & Cancellation Audit Log</option>
                        </select>
                    </div>

                    <div class="edu-filter-field" id="wrapFromDate">
                        <label>From</label>
                        <input type="date" id="eduFromDate" class="edu-field-input" value="${firstDayOfMonth}">
                    </div>

                    <div class="edu-filter-field" id="wrapToDate">
                        <label>To</label>
                        <input type="date" id="eduToDate" class="edu-field-input" value="${today}">
                    </div>

                    <div class="edu-filter-field">
                        <button type="button" class="edu-btn-icon-view" id="btnOpenReportTab" title="Generate Report in New Tab">
                            <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        window.setEduDateRange = function (type) {
            const fromInput = document.getElementById('eduFromDate');
            const toInput = document.getElementById('eduToDate');
            const now = new Date();

            if (type === 'today') {
                const d = now.toISOString().split('T')[0];
                fromInput.value = d;
                toInput.value = d;
            } else if (type === 'thisMonth') {
                fromInput.value = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                toInput.value = now.toISOString().split('T')[0];
            } else if (type === 'lastMonth') {
                fromInput.value = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
                toInput.value = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
            }
        };

        const reportSelect = document.getElementById('eduReportType');
        const wrapFrom = document.getElementById('wrapFromDate');
        const wrapTo = document.getElementById('wrapToDate');
        const quickGrp = document.getElementById('quickFilterContainer');
        const btnOpen = document.getElementById('btnOpenReportTab');

        reportSelect.addEventListener('change', function () {
            if (this.value === 'due') {
                wrapFrom.style.display = 'none';
                wrapTo.style.display = 'none';
                quickGrp.style.display = 'none';
            } else {
                wrapFrom.style.display = 'flex';
                wrapTo.style.display = 'flex';
                quickGrp.style.display = 'flex';
            }
        });

        btnOpen.addEventListener('click', generateAndOpenReport);
    }

    // টেক্সট ক্লিন এবং টাইটেল কেস (Md Rabbi Hosen ফরম্যাট)
    function toTitleCase(str) {
        if (!str) return "";
        const clean = String(str).trim();
        if (clean === "-" || clean === "undefined" || clean === "null") return "";
        return clean.toLowerCase().split(' ').map(word => {
            if (!word) return "";
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
    }

    function cleanValue(val) {
        if (val === undefined || val === null) return "";
        const str = String(val).trim();
        return (str === "-" || str === "undefined" || str === "null") ? "" : str;
    }

    // ৪. ডেটা ফিল্টারিং
    function generateAndOpenReport() {
        const reportType = document.getElementById('eduReportType').value;
        const fromDate = document.getElementById('eduFromDate').value;
        const toDate = document.getElementById('eduToDate').value;

        let title = "";
        let isLandscape = false;
        let tableHeaders = [];
        let rows = [];
        let grandTotalConfig = null;
        let columnAlignments = [];
        let colWidths = [];

        if (reportType === 'collection') {
            title = "FEE COLLECTION STATEMENT";
            tableHeaders = ["SL", "Receipt #", "Date", "Student ID", "Student Name", "Class", "Tuition Fee", "Charge", "Net Received"];
            columnAlignments = ["center", "center", "center", "center", "left", "center", "right", "right", "right"];
            colWidths = ["4%", "8%", "10%", "10%", "30%", "9%", "12%", "8%", "9%"];

            let list = feeTransactions.filter(t => t.date >= fromDate && t.date <= toDate);
            let sumDue = 0, sumCharge = 0, sumTotal = 0;

            list.forEach((t, i) => {
                const due = parseFloat(t.netDue || 0);
                const charge = parseFloat(t.totalCharge || 0);
                const rec = parseFloat(t.netReceived || 0);
                sumDue += due;
                sumCharge += charge;
                sumTotal += rec;

                rows.push([
                    i + 1,
                    cleanValue(t.receiptNo || t.receipt_no),
                    cleanValue(t.date),
                    cleanValue(t.customerId || t.studentId || t.stdId),
                    toTitleCase(t.studentName || t.student_name || t.name),
                    cleanValue(t.class || t.className),
                    due.toFixed(2),
                    charge.toFixed(2),
                    rec.toFixed(2)
                ]);
            });

            grandTotalConfig = {
                spanCols: 6,
                values: [sumDue.toFixed(2), sumCharge.toFixed(2), sumTotal.toFixed(2)]
            };

        } else if (reportType === 'pending') {
            title = "PENDING CLEARANCE REPORT (TO-PAY TAP)";
            tableHeaders = ["SL", "Receipt #", "Date", "Student ID", "Student Name", "Tuition Fee", "Gross Required", "Net Received"];
            columnAlignments = ["center", "center", "center", "center", "left", "right", "right", "right"];
            colWidths = ["4%", "8%", "11%", "10%", "33%", "12%", "11%", "11%"];

            let list = feeTransactions.filter(t => t.status !== 'Paid' && (t.date >= fromDate && t.date <= toDate));
            let sumFee = 0, sumGross = 0, sumRec = 0;

            list.forEach((t, i) => {
                const fee = parseFloat(t.netDue || 0);
                const gross = parseFloat(t.grossPayment || fee);
                const rec = parseFloat(t.netReceived || 0);
                sumFee += fee;
                sumGross += gross;
                sumRec += rec;

                rows.push([
                    i + 1,
                    cleanValue(t.receiptNo || t.receipt_no),
                    cleanValue(t.date),
                    cleanValue(t.customerId || t.studentId || t.stdId),
                    toTitleCase(t.studentName || t.student_name || t.name),
                    fee.toFixed(2),
                    gross.toFixed(2),
                    rec.toFixed(2)
                ]);
            });

            grandTotalConfig = {
                spanCols: 5,
                values: [sumFee.toFixed(2), sumGross.toFixed(2), sumRec.toFixed(2)]
            };

        } else if (reportType === 'settled') {
            title = "PAID SETTLEMENT AUDIT REPORT";
            tableHeaders = ["SL", "Receipt #", "Date", "Student ID", "Student Name", "Gross Paid", "Settled Timestamp"];
            columnAlignments = ["center", "center", "center", "center", "left", "right", "center"];
            colWidths = ["4%", "9%", "11%", "10%", "36%", "12%", "18%"];

            let list = feeTransactions.filter(t => t.status === 'Paid' && (t.date >= fromDate && t.date <= toDate));
            let sumGross = 0;

            list.forEach((t, i) => {
                const gross = parseFloat(t.grossPayment || t.netReceived || 0);
                sumGross += gross;

                rows.push([
                    i + 1,
                    cleanValue(t.receiptNo || t.receipt_no),
                    cleanValue(t.date),
                    cleanValue(t.customerId || t.studentId || t.stdId),
                    toTitleCase(t.studentName || t.student_name || t.name),
                    gross.toFixed(2),
                    cleanValue(t.paidTimestamp || t.settledTime)
                ]);
            });

            grandTotalConfig = {
                spanCols: 5,
                values: [sumGross.toFixed(2), ""]
            };

        } else if (reportType === 'due') {
            title = "MASTER STUDENT DUE DATABASE";
            isLandscape = true;
            tableHeaders = ["SL", "Class", "Section", "STD ID", "Student Name", "Category", "Month Due", "Due Amount", "Mobile"];
            columnAlignments = ["center", "center", "center", "center", "left", "center", "center", "right", "center"];
            colWidths = ["4%", "7%", "6%", "9%", "30%", "9%", "11%", "12%", "12%"];

            let sumDue = 0;
            studentDueList.forEach((s, i) => {
                const due = parseFloat(s.dueAmount || 0);
                sumDue += due;

                rows.push([
                    i + 1,
                    cleanValue(s.class),
                    cleanValue(s.section),
                    cleanValue(s.stdId || s.id),
                    toTitleCase(s.studentName || s.name),
                    cleanValue(s.category),
                    cleanValue(s.monthDue || s.month),
                    due.toFixed(2),
                    cleanValue(s.mobile)
                ]);
            });

            grandTotalConfig = {
                spanCols: 7,
                values: [sumDue.toFixed(2), ""]
            };

        } else if (reportType === 'void') {
            title = "VOID & CANCELLATION AUDIT LOG";
            tableHeaders = ["SL", "Receipt #", "Void Date", "Student ID & Name", "Amount", "Reason for Void", "Voided By"];
            columnAlignments = ["center", "center", "center", "left", "right", "left", "center"];
            colWidths = ["4%", "9%", "14%", "26%", "11%", "24%", "12%"];

            let sumVoid = 0;
            voidLogs.forEach((v, i) => {
                const amt = parseFloat(v.netReceived || 0);
                sumVoid += amt;

                const nameDisplay = [cleanValue(v.customerId), toTitleCase(v.studentName)].filter(Boolean).join(" - ");

                rows.push([
                    i + 1,
                    cleanValue(v.receiptNo),
                    cleanValue(v.voidDate),
                    nameDisplay,
                    amt.toFixed(2),
                    cleanValue(v.voidReason || 'Cancelled'),
                    cleanValue(v.voidedBy || 'Admin')
                ]);
            });

            grandTotalConfig = {
                spanCols: 4,
                values: [sumVoid.toFixed(2), "", ""]
            };
        }

        openReportWindow({
            title,
            isLandscape,
            period: reportType === 'due' ? 'Active Database' : `${fromDate} to ${toDate}`,
            headers: tableHeaders,
            alignments: columnAlignments,
            colWidths,
            rows,
            grandTotalConfig,
            fileName: `${reportType}_report_${Date.now()}`
        });
    }

    // ৫. নিউ ট্যাব রেন্ডারিং (শার্প ভেক্টর ও ১-পেজ ফিক্স)
    function openReportWindow(meta) {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            alert("Popup blocked! Please allow popups for this site.");
            return;
        }

        const pageSize = meta.isLandscape ? 'A4 landscape' : 'A4 portrait';

        let tableRowsHTML = '';
        if (meta.rows.length === 0) {
            tableRowsHTML = `<tr><td colspan="${meta.headers.length}" style="text-align: center; padding: 25px; color: #000;">No records found for the selected period.</td></tr>`;
        } else {
            meta.rows.forEach(r => {
                tableRowsHTML += '<tr>';
                r.forEach((val, idx) => {
                    const align = meta.alignments[idx] || 'left';
                    tableRowsHTML += `<td style="text-align: ${align};">${val}</td>`;
                });
                tableRowsHTML += '</tr>';
            });

            if (meta.grandTotalConfig) {
                tableRowsHTML += '<tr class="total-row">';
                tableRowsHTML += `<td colspan="${meta.grandTotalConfig.spanCols}" style="text-align: right; padding-right: 12px; font-weight: 700; letter-spacing: 0.5px;">Grand Total =</td>`;
                meta.grandTotalConfig.values.forEach(val => {
                    const isNum = !isNaN(val) && val !== '';
                    tableRowsHTML += `<td style="text-align: ${isNum ? 'right' : 'center'}; font-weight: 700;">${val}</td>`;
                });
                tableRowsHTML += '</tr>';
            }
        }

        let headersHTML = '';
        meta.headers.forEach((h, idx) => {
            const align = meta.alignments[idx] || 'left';
            const w = meta.colWidths && meta.colWidths[idx] ? `width: ${meta.colWidths[idx]};` : '';
            headersHTML += `<th style="text-align: ${align}; ${w}">${h}</th>`;
        });

        const docHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${meta.title}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">
                
                <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
                
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        background-color: #0f172a;
                        font-family: 'Tiro Bangla', serif !important;
                        color: #000000;
                        padding: 20px 0 40px 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        -webkit-font-smoothing: antialiased;
                    }

                    .action-bar-strip {
                        background: rgba(30, 41, 59, 0.95);
                        padding: 8px 16px;
                        border-radius: 40px;
                        display: flex;
                        gap: 12px;
                        margin-bottom: 20px;
                        box-shadow: 0 6px 20px rgba(0,0,0,0.4);
                    }

                    .action-icon {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        border: none;
                        background: #1e293b;
                        color: #ffffff;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }

                    .action-icon:hover { background: #334155; }
                    .btn-pdf-act:hover { background: #dc2626; }
                    .btn-excel-act:hover { background: #16a34a; }
                    .btn-close-act:hover { background: #ef4444; }

                    .paper-sheet {
                        background: #ffffff;
                        width: ${meta.isLandscape ? '287mm' : '205mm'};
                        padding: 8mm 10mm;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        color: #000000;
                        page-break-inside: avoid;
                    }

                    .report-header {
                        text-align: center;
                        border-bottom: 1.5px solid #000000;
                        padding-bottom: 4px;
                        margin-bottom: 6px;
                    }

                    .report-header h1 {
                        font-size: 17pt;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        margin-bottom: 1px;
                        color: #000000;
                    }

                    .report-header h2 {
                        font-size: 10.5pt;
                        font-weight: 600;
                        margin-bottom: 3px;
                        color: #000000;
                    }

                    .meta-info {
                        display: flex;
                        justify-content: space-between;
                        font-size: 8pt;
                        font-weight: 600;
                        margin-bottom: 6px;
                        border-bottom: 1px solid #000000;
                        padding-bottom: 3px;
                        color: #000000;
                    }

                    /* নিখুঁত তীক্ষ্ণ টেবিল ডিজাইন */
                    table.report-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 8.2pt;
                        color: #000000;
                        table-layout: fixed;
                    }

                    table.report-table th {
                        border: 1px solid #000000;
                        border-top: 1.5px solid #000000;
                        border-bottom: 1.5px solid #000000;
                        padding: 4px 3px;
                        font-weight: 700;
                        background: #ffffff;
                        color: #000000;
                        white-space: normal;
                        word-break: break-word;
                    }

                    table.report-table td {
                        border: 1px solid #000000;
                        padding: 3.5px 4px;
                        color: #000000;
                        vertical-align: middle;
                        white-space: normal;
                        word-break: break-word;
                        line-height: 1.2;
                    }

                    table.report-table tr.total-row td {
                        border-top: 1.5px solid #000000;
                        border-bottom: 1.5px solid #000000;
                        font-weight: 700;
                        background: #ffffff;
                        padding: 5px 4px;
                    }

                    @media print {
                        @page { size: ${pageSize}; margin: 5mm; }
                        body { background: #ffffff !important; padding: 0 !important; }
                        .no-print { display: none !important; }
                        .paper-sheet { width: 100% !important; padding: 0 !important; box-shadow: none !important; margin: 0 !important; }
                        table.report-table th, table.report-table td { border-color: #000000 !important; color: #000000 !important; }
                    }
                </style>
            </head>
            <body>
                <div class="action-bar-strip no-print">
                    <button class="action-icon" onclick="window.print()" title="Print"><i class="fa-solid fa-print"></i></button>
                    <button class="action-icon btn-pdf-act" onclick="downloadVectorPDF()" title="Download PDF"><i class="fa-solid fa-file-pdf"></i></button>
                    <button class="action-icon btn-excel-act" onclick="downloadDirectExcel()" title="Download Excel"><i class="fa-solid fa-file-excel"></i></button>
                    <button class="action-icon btn-close-act" onclick="window.close()" title="Close"><i class="fa-solid fa-xmark"></i></button>
                </div>

                <div class="paper-sheet" id="reportPrintWrapper">
                    <div class="report-header">
                        <h1>MOUSUMI COMPUTER</h1>
                        <h2>${meta.title}</h2>
                    </div>

                    <div class="meta-info">
                        <span>PERIOD: ${meta.period}</span>
                        <span>GENERATED: ${new Date().toLocaleString()}</span>
                    </div>

                    <table class="report-table">
                        <thead>
                            <tr>${headersHTML}</tr>
                        </thead>
                        <tbody>
                            ${tableRowsHTML}
                        </tbody>
                    </table>
                </div>

                <script>
                    // তীক্ষ্ণ ক্রিস্টাল ক্লিয়ার নেটিভ ভেক্টর পিডিএফ ডাউনলোড
                    function downloadVectorPDF() {
                        const originalTitle = document.title;
                        document.title = '${meta.fileName}';
                        window.print();
                        document.title = originalTitle;
                    }

                    // ১-ক্লিকে সরাসরি এক্সেল ফাইল ডাউনলোড
                    function downloadDirectExcel() {
                        const headers = ${JSON.stringify(meta.headers)};
                        const rows = ${JSON.stringify(meta.rows)};
                        const grandCfg = ${JSON.stringify(meta.grandTotalConfig)};

                        const aoa = [
                            ["MOUSUMI COMPUTER"],
                            ["${meta.title}"],
                            ["PERIOD: ${meta.period}", "GENERATED: " + new Date().toLocaleString()],
                            [],
                            headers,
                            ...rows
                        ];

                        if (grandCfg) {
                            const totalLine = Array(grandCfg.spanCols).fill("");
                            totalLine[grandCfg.spanCols - 1] = "Grand Total =";
                            grandCfg.values.forEach(v => totalLine.push(v));
                            aoa.push(totalLine);
                        }

                        const ws = XLSX.utils.aoa_to_sheet(aoa);
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Statement");
                        XLSX.writeFile(wb, '${meta.fileName}.xlsx');
                    }
                <\/script>
            </body>
            </html>
        `;

        reportWindow.document.open();
        reportWindow.document.write(docHTML);
        reportWindow.document.close();
    }

    // ৬. লোডার অবজারভার
    function startObserver() {
        initDataSync();

        const checkInterval = setInterval(() => {
            const hubView = document.getElementById('edu-reports-hub-view');
            if (hubView) {
                renderMinimalHub();
                clearInterval(checkInterval);
            }
        }, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserver);
    } else {
        startObserver();
    }
})();
