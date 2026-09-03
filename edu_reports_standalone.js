/**
 * Mousumi Computer ERP - Standalone Education Reports Hub
 * Engine: jsPDF + jspdf-autotable (Native Vector Engine) + SheetJS
 * Features:
 * - Minimalist filter strip replacing cards
 * - Date Range (From - To)
 * - Opens new tab with pure icon toolbar (Print, Native PDF, Excel, Close)
 * - 1-Click Direct Vector PDF download using jsPDF AutoTable
 * - 1-Click Direct Excel download using SheetJS
 */

(function () {
    let feeTransactions = [];
    let studentDueList = [];
    let voidLogs = [];
    let firebaseCore = null;

    // ১. মিনিমালিস্ট ড্যাশবোর্ড ফিল্টার বার সিএসএস
    const hubCSS = `
        .edu-reports-minimal-box {
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            padding: 24px;
            margin-bottom: 25px;
        }

        .edu-reports-header-strip {
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }

        .edu-reports-header-strip h3 {
            font-size: 1rem;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .edu-filter-row {
            display: flex;
            align-items: flex-end;
            gap: 16px;
            flex-wrap: wrap;
        }

        .edu-filter-field {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .edu-filter-field label {
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
        }

        .edu-field-input {
            height: 38px;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 0 10px;
            font-size: 0.88rem;
            color: #0f172a;
            outline: none;
            background: #ffffff;
            min-width: 140px;
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

    // ২. ফায়ারবেস কানেকশন ও ডেটা রিড
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

    // ৩. এক্সিস্টিং কার্ডগুলো সরিয়ে মিনিমালিস্ট ইন্টারফেস সেট করা
    function renderMinimalHub() {
        const targetView = document.getElementById('edu-reports-hub-view');
        if (!targetView) return;

        const today = new Date().toISOString().split('T')[0];
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

        targetView.innerHTML = `
            <div class="edu-reports-minimal-box">
                <div class="edu-reports-header-strip">
                    <h3>Reports & Audit Terminal</h3>
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

        const reportSelect = document.getElementById('eduReportType');
        const wrapFrom = document.getElementById('wrapFromDate');
        const wrapTo = document.getElementById('wrapToDate');
        const btnOpen = document.getElementById('btnOpenReportTab');

        reportSelect.addEventListener('change', function () {
            if (this.value === 'due') {
                wrapFrom.style.display = 'none';
                wrapTo.style.display = 'none';
            } else {
                wrapFrom.style.display = 'flex';
                wrapTo.style.display = 'flex';
            }
        });

        btnOpen.addEventListener('click', generateAndOpenReport);
    }

    // ৪. ডেটা ফিল্টারিং লজিক
    function generateAndOpenReport() {
        const reportType = document.getElementById('eduReportType').value;
        const fromDate = document.getElementById('eduFromDate').value;
        const toDate = document.getElementById('eduToDate').value;

        let title = "";
        let isLandscape = false;
        let tableHeaders = [];
        let rows = [];
        let grandTotals = null;

        if (reportType === 'collection') {
            title = "FEE COLLECTION STATEMENT";
            tableHeaders = ["SL", "Receipt #", "Date", "Student ID", "Student Name", "Class", "Tuition Fee", "Charge", "Net Received"];
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

            grandTotals = ["Grand Total", "", "", "", "", "", sumDue.toFixed(2), sumCharge.toFixed(2), sumTotal.toFixed(2)];

        } else if (reportType === 'pending') {
            title = "PENDING CLEARANCE REPORT (TO-PAY TAP)";
            tableHeaders = ["SL", "Receipt #", "Date", "Student ID", "Student Name", "Tuition Fee", "Gross Required", "Net Received"];
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

            grandTotals = ["Grand Total", "", "", "", "", sumFee.toFixed(2), sumGross.toFixed(2), sumRec.toFixed(2)];

        } else if (reportType === 'settled') {
            title = "PAID SETTLEMENT AUDIT REPORT";
            tableHeaders = ["SL", "Receipt #", "Date", "Student ID", "Student Name", "Gross Paid", "Settled Timestamp"];
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

            grandTotals = ["Grand Total", "", "", "", "", sumGross.toFixed(2), ""];

        } else if (reportType === 'due') {
            title = "MASTER STUDENT DUE DATABASE";
            isLandscape = true;
            tableHeaders = ["SL", "Class", "Section", "STD ID", "Student Name", "Category", "Month Due", "Due Amount", "Mobile"];
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

            grandTotals = ["Grand Total", "", "", "", "", "", "", sumDue.toFixed(2), ""];

        } else if (reportType === 'void') {
            title = "VOID & CANCELLATION AUDIT LOG";
            tableHeaders = ["SL", "Receipt #", "Void Date", "Student ID & Name", "Amount", "Reason for Void", "Voided By"];
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

            grandTotals = ["Grand Total", "", "", "", sumVoid.toFixed(2), "", ""];
        }

        openReportWindow({
            title,
            isLandscape,
            period: reportType === 'due' ? 'Active Database' : `${fromDate} to ${toDate}`,
            headers: tableHeaders,
            rows,
            grandTotals,
            fileName: `${reportType}_report_${Date.now()}`
        });
    }

    // ৫. নিউ ট্যাব রেন্ডারিং এবং jsPDF AutoTable ইঞ্জিন দিয়ে ডাউনলোড
    function openReportWindow(meta) {
        const reportWindow = window.open('', '_blank');
        if (!reportWindow) {
            alert("Popup blocked! Please allow popups for this site.");
            return;
        }

        const pageSize = meta.isLandscape ? 'A4 landscape' : 'A4 portrait';

        let tableRowsHTML = '';
        if (meta.rows.length === 0) {
            tableRowsHTML = `<tr><td colspan="${meta.headers.length}" style="text-align: center; padding: 25px; color: #555;">No records found for the selected period.</td></tr>`;
        } else {
            meta.rows.forEach(r => {
                tableRowsHTML += '<tr>';
                r.forEach((val, idx) => {
                    const isNumeric = !isNaN(val) && val !== '' && typeof val !== 'boolean' && idx > 0;
                    tableRowsHTML += `<td style="${isNumeric ? 'text-align: right;' : 'text-align: left;'}">${val}</td>`;
                });
                tableRowsHTML += '</tr>';
            });

            if (meta.grandTotals) {
                tableRowsHTML += '<tr class="total-row">';
                meta.grandTotals.forEach((val, idx) => {
                    const isNumeric = !isNaN(val) && val !== '';
                    tableRowsHTML += `<td style="${isNumeric ? 'text-align: right;' : 'text-align: left;'}">${val}</td>`;
                });
                tableRowsHTML += '</tr>';
            }
        }

        let headersHTML = '';
        meta.headers.forEach(h => {
            const alignRight = h.includes('Fee') || h.includes('Charge') || h.includes('Received') || h.includes('Amount') || h.includes('Gross');
            headersHTML += `<th style="${alignRight ? 'text-align: right;' : 'text-align: left;'}">${h}</th>`;
        });

        const docHTML = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${meta.title}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                
                <!-- jsPDF এবং AutoTable নেটিভ ইঞ্জিন -->
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
                
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body {
                        background-color: #1e293b;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                        color: #000000;
                        padding: 20px 0 40px 0;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    /* শুধু আইকন নির্ভর অ্যাকশন বার */
                    .action-bar-strip {
                        background: #0f172a;
                        padding: 8px 14px;
                        border-radius: 30px;
                        display: flex;
                        gap: 12px;
                        margin-bottom: 20px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    }

                    .action-icon {
                        width: 38px;
                        height: 38px;
                        border-radius: 50%;
                        border: none;
                        background: #334155;
                        color: #ffffff;
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 15px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }

                    .action-icon:hover { background: #475569; }
                    .btn-pdf-act:hover { background: #dc2626; }
                    .btn-excel-act:hover { background: #16a34a; }
                    .btn-close-act:hover { background: #94a3b8; }

                    /* ক্লিন টেক্সট-বেসড পেপার ভিউ */
                    .paper-sheet {
                        background: #ffffff;
                        width: ${meta.isLandscape ? '287mm' : '200mm'};
                        min-height: ${meta.isLandscape ? '200mm' : '287mm'};
                        padding: 15mm;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
                    }

                    .report-header {
                        text-align: center;
                        border-bottom: 1.5px solid #000;
                        padding-bottom: 10px;
                        margin-bottom: 12px;
                    }

                    .report-header h1 {
                        font-size: 16pt;
                        font-weight: 800;
                        letter-spacing: 1px;
                        margin-bottom: 3px;
                    }

                    .report-header h2 {
                        font-size: 11pt;
                        font-weight: 600;
                        margin-bottom: 4px;
                    }

                    .meta-info {
                        display: flex;
                        justify-content: space-between;
                        font-size: 8.5pt;
                        font-weight: 600;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 5px;
                    }

                    table.report-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 8.5pt;
                    }

                    table.report-table th {
                        border-top: 1px solid #000;
                        border-bottom: 1px solid #000;
                        padding: 6px 4px;
                        font-weight: 700;
                        text-transform: uppercase;
                        background: #f8fafc;
                    }

                    table.report-table td {
                        border-bottom: 1px solid #e2e8f0;
                        padding: 5px 4px;
                    }

                    table.report-table tr.total-row td {
                        border-top: 1.5px solid #000;
                        border-bottom: 1.5px solid #000;
                        font-weight: 800;
                        background: #f8fafc;
                        padding: 7px 4px;
                    }

                    @media print {
                        @page { size: ${pageSize}; margin: 8mm; }
                        body { background: #ffffff !important; padding: 0 !important; }
                        .no-print { display: none !important; }
                        .paper-sheet { width: 100% !important; min-height: 100% !important; padding: 0 !important; box-shadow: none !important; }
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

                <div class="paper-sheet">
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
                    // ১-ক্লিকে jsPDF AutoTable ইঞ্জিন দিয়ে নেটিভ ভেক্টর পিডিএফ ডাউনলোড
                    function downloadDirectPDF() {
                        const { jsPDF } = window.jspdf;
                        const doc = new jsPDF({
                            orientation: '${meta.isLandscape ? 'landscape' : 'portrait'}',
                            unit: 'mm',
                            format: 'a4'
                        });

                        // শিরোনাম ও মেটা ডেটা
                        doc.setFont("Helvetica", "bold");
                        doc.setFontSize(16);
                        doc.text("MOUSUMI COMPUTER", doc.internal.pageSize.getWidth() / 2, 14, { align: "center" });

                        doc.setFontSize(11);
                        doc.text("${meta.title}", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });

                        doc.setFont("Helvetica", "normal");
                        doc.setFontSize(8.5);
                        doc.text("PERIOD: ${meta.period}", 14, 27);
                        doc.text("GENERATED: " + new Date().toLocaleString(), doc.internal.pageSize.getWidth() - 14, 27, { align: "right" });

                        // টেবিল কন্টেন্ট প্রিপারেশন
                        const headers = ${JSON.stringify(meta.headers)};
                        const rows = ${JSON.stringify(meta.rows)};
                        const totals = ${JSON.stringify(meta.grandTotals || [])};

                        const finalRows = [...rows];
                        if (totals && totals.length > 0) {
                            finalRows.push(totals);
                        }

                        // নেটিভ AutoTable জেনারেশন
                        doc.autoTable({
                            head: [headers],
                            body: finalRows,
                            startY: 31,
                            theme: 'plain',
                            styles: { 
                                fontSize: 8, 
                                font: "Helvetica", 
                                cellPadding: 2, 
                                textColor: [0, 0, 0],
                                lineColor: [200, 200, 200],
                                lineWidth: 0.1
                            },
                            headStyles: { 
                                fontStyle: 'bold', 
                                textColor: [0, 0, 0], 
                                lineColor: [0, 0, 0], 
                                lineWidth: { top: 0.3, bottom: 0.3 } 
                            },
                            didParseCell: function (data) {
                                // গ্র্যান্ড টোটাল রো হাইলাইট
                                if (totals && totals.length > 0 && data.row.index === finalRows.length - 1) {
                                    data.cell.styles.fontStyle = 'bold';
                                    data.cell.styles.lineColor = [0, 0, 0];
                                    data.cell.styles.lineWidth = { top: 0.3, bottom: 0.3 };
                                }
                                // সংখ্যা কলাম ডানপাশে অ্যালাইন করা
                                const hName = headers[data.column.index] || '';
                                if (hName.includes('Fee') || hName.includes('Charge') || hName.includes('Received') || hName.includes('Amount') || hName.includes('Gross')) {
                                    data.cell.styles.halign = 'right';
                                }
                            }
                        });

                        // ১ ক্লিকে কোনো ডায়ালগ ছাড়া সরাসরি ফাইল ডাউনলোড
                        doc.save('${meta.fileName}.pdf');
                    }

                    // ১-ক্লিকে সরাসরি এক্সেল ফাইল ডাউনলোড
                    function downloadDirectExcel() {
                        const headers = ${JSON.stringify(meta.headers)};
                        const rows = ${JSON.stringify(meta.rows)};
                        const totals = ${JSON.stringify(meta.grandTotals || [])};

                        const aoa = [
                            ["MOUSUMI COMPUTER"],
                            ["${meta.title}"],
                            ["PERIOD: ${meta.period}", "GENERATED: " + new Date().toLocaleString()],
                            [],
                            headers,
                            ...rows
                        ];

                        if (totals && totals.length > 0) {
                            aoa.push(totals);
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
