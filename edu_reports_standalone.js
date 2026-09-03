/**
 * Mousumi Computer ERP - Standalone Education Reports Hub
 * Font: True Embedded Google Font 'Tiro Bangla' (Browser View & Downloaded PDF)
 * Fixes:
 * 1. Merged Colspan for Grand Total row (No empty vertical lines).
 * 2. Quick Filter Buttons: [Today], [This Month], [Last Month].
 * 3. Exact font preservation in exported PDF.
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

        /* কুইক শর্টকাট বাটন */
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

    // ৩. কুইক ডেট বাটন ফাংশনালিটি সহ ফিল্টার বার সেটআপ
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

    // ৪. ডেটা প্রসেসিং ও গ্র্যান্ড টোটাল মার্জিং লজিক
    function generateAndOpenReport() {
        const reportType = document.getElementById('eduReportType').value;
        const fromDate = document.getElementById('eduFromDate').value;
        const toDate = document.getElementById('eduToDate').value;

        let title = "";
        let isLandscape = false;
        let tableHeaders = [];
        let rows = [];
        let grandTotalConfig = null; // { spanCols: 6, values: [57965.00, 702.65, 58667.65] }
        let columnAlignments = [];

        if (reportType === 'collection') {
            title = "FEE COLLECTION STATEMENT";
            tableHeaders = ["SL", "Receipt #", "Date", "Student ID", "Student Name", "Class", "Tuition Fee", "Charge", "Net Received"];
            columnAlignments = ["center", "center", "center", "center", "left", "center", "right", "right", "right"];

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
                    t.receiptNo || '-',
                    t.date,
                    t.customerId || '-',
                    t.studentName || '-',
                    t.class || '-',
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
                    t.receiptNo || '-',
                    t.date,
                    t.customerId || '-',
                    t.studentName || '-',
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

            let list = feeTransactions.filter(t => t.status === 'Paid' && (t.date >= fromDate && t.date <= toDate));
            let sumGross = 0;

            list.forEach((t, i) => {
                const gross = parseFloat(t.grossPayment || t.netReceived || 0);
                sumGross += gross;

                rows.push([
                    i + 1,
                    t.receiptNo || '-',
                    t.date,
                    t.customerId || '-',
                    t.studentName || '-',
                    gross.toFixed(2),
                    t.paidTimestamp || '-'
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

            let sumDue = 0;
            studentDueList.forEach((s, i) => {
                const due = parseFloat(s.dueAmount || 0);
                sumDue += due;

                rows.push([
                    i + 1,
                    s.class || '-',
                    s.section || '-',
                    s.stdId || '-',
                    s.studentName || '-',
                    s.category || '-',
                    s.monthDue || '-',
                    due.toFixed(2),
                    s.mobile || '-'
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

            let sumVoid = 0;
            voidLogs.forEach((v, i) => {
                const amt = parseFloat(v.netReceived || 0);
                sumVoid += amt;

                rows.push([
                    i + 1,
                    v.receiptNo || '-',
                    v.voidDate || '-',
                    `${v.customerId || ''} - ${v.studentName || ''}`,
                    amt.toFixed(2),
                    v.voidReason || 'Cancelled',
                    v.voidedBy || 'Admin'
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
            rows,
            grandTotalConfig,
            fileName: `${reportType}_report_${Date.now()}`
        });
    }

    // ৫. নিউ ট্যাব রেন্ডারিং (মার্জড গ্র্যান্ড টোটাল + এমবেডেড Tiro Bangla ফন্ট)
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

            // পারফেক্ট গ্র্যান্ড টোটাল রো (মার্জ করা ফাঁকা ছাড়া)
            if (meta.grandTotalConfig) {
                tableRowsHTML += '<tr class="total-row">';
                tableRowsHTML += `<td colspan="${meta.grandTotalConfig.spanCols}" style="text-align: left; padding-left: 15px;">Grand Total</td>`;
                meta.grandTotalConfig.values.forEach(val => {
                    const isNum = !isNaN(val) && val !== '';
                    tableRowsHTML += `<td style="text-align: ${isNum ? 'right' : 'center'};">${val}</td>`;
                });
                tableRowsHTML += '</tr>';
            }
        }

        let headersHTML = '';
        meta.headers.forEach((h, idx) => {
            const align = meta.alignments[idx] || 'left';
            headersHTML += `<th style="text-align: ${align};">${h}</th>`;
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
                
                <!-- jsPDF এবং AutoTable নেটিভ ইঞ্জিন -->
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
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
                        min-height: ${meta.isLandscape ? '200mm' : '287mm'};
                        padding: 12mm 15mm;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                        color: #000000;
                    }

                    .report-header {
                        text-align: center;
                        border-bottom: 2px solid #000000;
                        padding-bottom: 6px;
                        margin-bottom: 10px;
                    }

                    .report-header h1 {
                        font-size: 19pt;
                        font-weight: 700;
                        letter-spacing: 0.5px;
                        margin-bottom: 2px;
                        color: #000000;
                        font-family: 'Tiro Bangla', serif !important;
                    }

                    .report-header h2 {
                        font-size: 12pt;
                        font-weight: 600;
                        margin-bottom: 4px;
                        color: #000000;
                        font-family: 'Tiro Bangla', serif !important;
                    }

                    .meta-info {
                        display: flex;
                        justify-content: space-between;
                        font-size: 9pt;
                        font-weight: 600;
                        margin-bottom: 8px;
                        border-bottom: 1px solid #000000;
                        padding-bottom: 4px;
                        color: #000000;
                        font-family: 'Tiro Bangla', serif !important;
                    }

                    table.report-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 9.5pt;
                        color: #000000;
                        font-family: 'Tiro Bangla', serif !important;
                    }

                    table.report-table th {
                        border-top: 1.5px solid #000000;
                        border-bottom: 1.5px solid #000000;
                        border-left: 1px solid #000000;
                        border-right: 1px solid #000000;
                        padding: 6px 5px;
                        font-weight: 700;
                        background: #ffffff;
                        color: #000000;
                    }

                    table.report-table td {
                        border: 1px solid #000000;
                        padding: 5px 6px;
                        color: #000000;
                        vertical-align: middle;
                    }

                    table.report-table tr.total-row td {
                        border-top: 2px solid #000000;
                        border-bottom: 2px solid #000000;
                        font-weight: 700;
                        background: #ffffff;
                        padding: 7px 6px;
                    }

                    @media print {
                        @page { size: ${pageSize}; margin: 8mm; }
                        body { background: #ffffff !important; padding: 0 !important; }
                        .no-print { display: none !important; }
                        .paper-sheet { width: 100% !important; min-height: 100% !important; padding: 0 !important; box-shadow: none !important; }
                        table.report-table th, table.report-table td { border-color: #000000 !important; color: #000000 !important; }
                    }
                </style>
            </head>
            <body>
                <div class="action-bar-strip no-print">
                    <button class="action-icon" onclick="window.print()" title="Print"><i class="fa-solid fa-print"></i></button>
                    <button class="action-icon btn-pdf-act" onclick="downloadDirectPDF()" title="Download PDF"><i class="fa-solid fa-file-pdf"></i></button>
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
                    // ১-ক্লিকে Tiro Bangla ফন্ট সহ নেটিভ ভেক্টর পিডিএফ ডাউনলোড
                    async function downloadDirectPDF() {
                        const { jsPDF } = window.jspdf;
                        const doc = new jsPDF({
                            orientation: '${meta.isLandscape ? 'landscape' : 'portrait'}',
                            unit: 'mm',
                            format: 'a4'
                        });

                        // Tiro Bangla ফন্ট ডায়নামিক লোড ও এমবেড
                        try {
                            const fontUrl = "https://fonts.gstatic.com/s/tirobangla/v5/0FlxVPmxr4q3nB7mN3xI6qLp.woff";
                            // ফন্ট ফেচ
                            const fontData = await fetch(fontUrl).then(res => res.arrayBuffer());
                            const base64Font = btoa(new Uint8Array(fontData).reduce((data, byte) => data + String.fromCharCode(byte), ''));
                            
                            doc.addFileToVFS('TiroBangla-Regular.ttf', base64Font);
                            doc.addFont('TiroBangla-Regular.ttf', 'TiroBangla', 'normal');
                            doc.setFont('TiroBangla');
                        } catch(e) {
                            doc.setFont("Helvetica");
                        }

                        doc.setFontSize(16);
                        doc.text("MOUSUMI COMPUTER", doc.internal.pageSize.getWidth() / 2, 14, { align: "center" });

                        doc.setFontSize(11);
                        doc.text("${meta.title}", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

                        doc.setFontSize(8.5);
                        doc.text("PERIOD: ${meta.period}", 14, 27);
                        doc.text("GENERATED: " + new Date().toLocaleString(), doc.internal.pageSize.getWidth() - 14, 27, { align: "right" });

                        const headers = ${JSON.stringify(meta.headers)};
                        const rows = ${JSON.stringify(meta.rows)};
                        const aligns = ${JSON.stringify(meta.alignments)};
                        const grandCfg = ${JSON.stringify(meta.grandTotalConfig)};

                        const bodyData = [...rows];

                        // মার্জড গ্র্যান্ড টোটাল রো যোগ করা
                        if (grandCfg) {
                            const totalRow = [];
                            totalRow.push({
                                content: 'Grand Total',
                                colSpan: grandCfg.spanCols,
                                styles: { halign: 'left', fontStyle: 'bold' }
                            });
                            grandCfg.values.forEach(v => {
                                totalRow.push({
                                    content: v,
                                    styles: { halign: !isNaN(v) && v !== '' ? 'right' : 'center', fontStyle: 'bold' }
                                });
                            });
                            bodyData.push(totalRow);
                        }

                        doc.autoTable({
                            head: [headers],
                            body: bodyData,
                            startY: 31,
                            theme: 'grid',
                            styles: { 
                                fontSize: 8, 
                                font: doc.getFontList()['TiroBangla'] ? 'TiroBangla' : 'Helvetica', 
                                cellPadding: 2, 
                                textColor: [0, 0, 0],
                                lineColor: [0, 0, 0],
                                lineWidth: 0.15
                            },
                            headStyles: { 
                                fontStyle: 'bold', 
                                textColor: [0, 0, 0], 
                                fillColor: [255, 255, 255],
                                lineColor: [0, 0, 0], 
                                lineWidth: 0.25 
                            },
                            didParseCell: function (data) {
                                if (data.row.index < rows.length) {
                                    const colIdx = data.column.index;
                                    data.cell.styles.halign = aligns[colIdx] || 'left';
                                }
                            }
                        });

                        doc.save('${meta.fileName}.pdf');
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
                            totalLine[0] = "Grand Total";
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
