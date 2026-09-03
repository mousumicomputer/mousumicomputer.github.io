function openReportWindow(meta) {
    const reportWindow = window.open('', '_blank');

    if (!reportWindow) {
        alert("Popup blocked! Please allow popups for this site.");
        return;
    }

    // সব রিপোর্ট A4 Landscape হবে
    const pageSize = 'A4 landscape';

    let tableRowsHTML = '';

    if (meta.rows.length === 0) {

        tableRowsHTML = `
            <tr>
                <td colspan="${meta.headers.length}" class="empty-row">
                    No records found for the selected period.
                </td>
            </tr>
        `;

    } else {

        meta.rows.forEach((r) => {

            tableRowsHTML += '<tr>';

            r.forEach((val, idx) => {

                const header =
                    String(meta.headers[idx] || '').toLowerCase();

                let alignClass = 'text-left';

                // Center alignment
                if (
                    idx === 0 ||
                    header.includes('date') ||
                    header.includes('receipt')
                ) {
                    alignClass = 'text-center';
                }

                // Right alignment for amount columns
                if (
                    header.includes('fee') ||
                    header.includes('charge') ||
                    header.includes('received') ||
                    header.includes('amount') ||
                    header.includes('gross')
                ) {
                    alignClass = 'text-right';
                }

                // Center alignment for ID/Class/Section
                if (
                    header.includes('student id') ||
                    header.includes('std id') ||
                    header === 'class' ||
                    header === 'section'
                ) {
                    alignClass = 'text-center';
                }

                const safeValue = String(val ?? '-')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');

                tableRowsHTML += `
                    <td class="${alignClass}">
                        ${safeValue}
                    </td>
                `;
            });

            tableRowsHTML += '</tr>';
        });


        // Grand Total
        if (meta.grandTotals) {

            tableRowsHTML += '<tr class="total-row">';

            meta.grandTotals.forEach((val, idx) => {

                const header =
                    String(meta.headers[idx] || '').toLowerCase();

                let alignClass = 'text-left';

                if (
                    header.includes('fee') ||
                    header.includes('charge') ||
                    header.includes('received') ||
                    header.includes('amount') ||
                    header.includes('gross')
                ) {
                    alignClass = 'text-right';
                }

                if (idx === 0) {
                    alignClass = 'text-left';
                }

                const safeValue = String(val ?? '')
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');

                tableRowsHTML += `
                    <td class="${alignClass}">
                        ${safeValue}
                    </td>
                `;
            });

            tableRowsHTML += '</tr>';
        }
    }


    // Table Header
    let headersHTML = '';

    meta.headers.forEach((h, idx) => {

        const header =
            String(h || '').toLowerCase();

        let alignClass = 'text-left';

        if (
            idx === 0 ||
            header.includes('date') ||
            header.includes('receipt') ||
            header.includes('student id') ||
            header.includes('std id') ||
            header === 'class' ||
            header === 'section'
        ) {
            alignClass = 'text-center';
        }

        if (
            header.includes('fee') ||
            header.includes('charge') ||
            header.includes('received') ||
            header.includes('amount') ||
            header.includes('gross')
        ) {
            alignClass = 'text-right';
        }

        headersHTML += `
            <th class="${alignClass}">
                ${String(h)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')}
            </th>
        `;
    });


    const docHTML = `
        <!DOCTYPE html>

        <html lang="bn">

        <head>

            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>${meta.title}</title>


            <!-- Google Tiro Bangla Font -->

            <link rel="preconnect"
                  href="https://fonts.googleapis.com">

            <link rel="preconnect"
                  href="https://fonts.gstatic.com"
                  crossorigin>

            <link
                href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap"
                rel="stylesheet"
            >


            <!-- Font Awesome -->

            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            >


            <!-- jsPDF -->

            <script
                src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js">
            <\/script>


            <!-- html2canvas -->

            <script
                src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js">
            <\/script>


            <!-- SheetJS -->

            <script
                src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js">
            <\/script>


            <style>

                * {
                    box-sizing: border-box;
                }


                html,
                body {
                    margin: 0;
                    padding: 0;
                }


                body {

                    background: #1e293b;

                    color: #000000;

                    font-family:
                        "Tiro Bangla",
                        "Noto Sans Bengali",
                        "Nirmala UI",
                        Arial,
                        sans-serif;

                    padding: 18px 0 35px;

                    -webkit-font-smoothing: antialiased;

                    text-rendering: optimizeLegibility;
                }


                /* ================================
                   ACTION BAR
                ================================= */

                .action-bar-strip {

                    background: #0f172a;

                    padding: 8px 14px;

                    border-radius: 30px;

                    display: flex;

                    gap: 10px;

                    margin: 0 auto 18px;

                    width: max-content;

                    box-shadow:
                        0 4px 15px rgba(0,0,0,0.3);
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
                }


                .action-icon:hover {
                    background: #475569;
                }


                .btn-pdf-act:hover {
                    background: #dc2626;
                }


                .btn-excel-act:hover {
                    background: #16a34a;
                }


                .btn-close-act:hover {
                    background: #94a3b8;
                }


                /* ================================
                   REPORT PAPER
                ================================= */

                .paper-sheet {

                    background: #ffffff;

                    width: 1120px;

                    min-height: 790px;

                    margin: 0 auto;

                    padding: 42px 48px;

                    box-shadow:
                        0 10px 30px rgba(0,0,0,0.25);
                }


                /* ================================
                   REPORT HEADER
                ================================= */

                .report-header {

                    text-align: center;

                    border-bottom: 2px solid #000000;

                    padding-bottom: 10px;

                    margin-bottom: 12px;
                }


                .report-header h1,
                .report-header h2 {

                    font-family:
                        "Tiro Bangla",
                        "Noto Sans Bengali",
                        "Nirmala UI",
                        Arial,
                        sans-serif;
                }


                .report-header h1 {

                    font-size: 22px;

                    line-height: 1.25;

                    font-weight: 700;

                    letter-spacing: 0.6px;

                    margin: 0 0 4px;
                }


                .report-header h2 {

                    font-size: 16px;

                    line-height: 1.3;

                    font-weight: 700;

                    margin: 0;
                }


                /* ================================
                   META INFORMATION
                ================================= */

                .meta-info {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    gap: 20px;

                    font-size: 11px;

                    line-height: 1.4;

                    font-weight: 600;

                    margin-bottom: 12px;

                    border-bottom: 1px solid #000000;

                    padding-bottom: 7px;
                }


                /* ================================
                   TABLE
                ================================= */

                table.report-table {

                    width: 100%;

                    border-collapse: collapse;

                    table-layout: auto;

                    font-family:
                        "Tiro Bangla",
                        "Noto Sans Bengali",
                        "Nirmala UI",
                        Arial,
                        sans-serif;

                    font-size: 11px;

                    line-height: 1.35;
                }


                table.report-table th,
                table.report-table td {

                    border: 1px solid #000000;

                    vertical-align: middle;
                }


                /* Table Header */

                table.report-table th {

                    background: #f2f2f2;

                    color: #000000;

                    padding: 7px 6px;

                    font-weight: 700;

                    white-space: nowrap;
                }


                /* Table Body */

                table.report-table td {

                    padding: 6px 6px;

                    font-weight: 400;

                    word-break: normal;

                    overflow-wrap: break-word;
                }


                /* ================================
                   ALIGNMENT
                ================================= */

                .text-left {

                    text-align: left !important;
                }


                .text-center {

                    text-align: center !important;
                }


                .text-right {

                    text-align: right !important;
                }


                /* ================================
                   GRAND TOTAL
                ================================= */

                .total-row td {

                    border:
                        1.5px solid #000000 !important;

                    background: #f2f2f2;

                    font-weight: 700 !important;

                    padding-top: 8px !important;

                    padding-bottom: 8px !important;
                }


                /* ================================
                   EMPTY REPORT
                ================================= */

                .empty-row {

                    text-align: center !important;

                    padding: 25px !important;

                    color: #333333;
                }


                /* ================================
                   PRINT
                ================================= */

                @media print {

                    @page {

                        size: A4 landscape;

                        margin: 8mm;
                    }


                    body {

                        background: #ffffff !important;

                        padding: 0 !important;
                    }


                    .no-print {

                        display: none !important;
                    }


                    .paper-sheet {

                        width: 100% !important;

                        min-height: auto !important;

                        margin: 0 !important;

                        padding: 0 !important;

                        box-shadow: none !important;
                    }
                }

            </style>

        </head>


        <body>


            <!-- ================================
                 ACTION BUTTONS
            ================================= -->

            <div class="action-bar-strip no-print">

                <button
                    class="action-icon"
                    onclick="window.print()"
                    title="Print"
                >
                    <i class="fa-solid fa-print"></i>
                </button>


                <button
                    class="action-icon btn-pdf-act"
                    onclick="downloadDirectPDF()"
                    title="Download PDF"
                >
                    <i class="fa-solid fa-file-pdf"></i>
                </button>


                <button
                    class="action-icon btn-excel-act"
                    onclick="downloadDirectExcel()"
                    title="Download Excel"
                >
                    <i class="fa-solid fa-file-excel"></i>
                </button>


                <button
                    class="action-icon btn-close-act"
                    onclick="window.close()"
                    title="Close"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>

            </div>



            <!-- ================================
                 REPORT CONTENT
            ================================= -->

            <div
                class="paper-sheet"
                id="pdfReportContent"
            >

                <div class="report-header">

                    <h1>
                        MOUSUMI COMPUTER
                    </h1>

                    <h2>
                        ${meta.title}
                    </h2>

                </div>


                <div class="meta-info">

                    <span>
                        PERIOD: ${meta.period}
                    </span>

                    <span>
                        GENERATED:
                        ${new Date().toLocaleString()}
                    </span>

                </div>


                <table class="report-table">

                    <thead>

                        <tr>
                            ${headersHTML}
                        </tr>

                    </thead>


                    <tbody>

                        ${tableRowsHTML}

                    </tbody>

                </table>

            </div>



            <script>

                const reportMeta =
                    ${JSON.stringify(meta)};


                /* ==========================================
                   DIRECT PDF DOWNLOAD
                ========================================== */

                async function downloadDirectPDF() {

                    const button =
                        document.querySelector('.btn-pdf-act');


                    try {

                        if (button) {

                            button.disabled = true;

                            button.title =
                                "Creating PDF...";

                            button.innerHTML =
                                '<i class="fa-solid fa-spinner fa-spin"></i>';
                        }


                        /*
                         * Google Tiro Bangla font load
                         */

                        if (
                            document.fonts &&
                            document.fonts.ready
                        ) {

                            await document.fonts.ready;
                        }


                        /*
                         * Browser rendering শেষ হওয়ার জন্য
                         * সামান্য অপেক্ষা
                         */

                        await new Promise(
                            resolve => setTimeout(resolve, 300)
                        );


                        const {
                            jsPDF
                        } = window.jspdf;


                        const pdf =
                            new jsPDF({

                                orientation: 'landscape',

                                unit: 'mm',

                                format: 'a4',

                                compress: true
                            });


                        const content =
                            document.getElementById(
                                'pdfReportContent'
                            );


                        /*
                         * HTML report সরাসরি PDF-এ render
                         *
                         * এতে:
                         * - Tiro Bangla
                         * - Table alignment
                         * - Black borders
                         * - Header
                         * - Grand Total
                         *
                         * একই layout থাকবে।
                         */

                        await pdf.html(

                            content,

                            {

                                x: 8,

                                y: 8,

                                width: 281,

                                windowWidth:
                                    content.scrollWidth,

                                autoPaging: 'text',

                                margin: [
                                    8,
                                    8,
                                    8,
                                    8
                                ],


                                html2canvas: {

                                    scale: 2,

                                    useCORS: true,

                                    allowTaint: false,

                                    backgroundColor:
                                        '#ffffff',

                                    logging: false
                                },


                                callback: function(doc) {

                                    doc.save(
                                        reportMeta.fileName +
                                        '.pdf'
                                    );
                                }

                            }
                        );


                    } catch (error) {

                        console.error(
                            "Direct PDF generation failed:",
                            error
                        );


                        alert(
                            "PDF তৈরি করা যায়নি। আবার চেষ্টা করুন।"
                        );


                    } finally {

                        if (button) {

                            button.disabled = false;

                            button.title =
                                "Download PDF";

                            button.innerHTML =
                                '<i class="fa-solid fa-file-pdf"></i>';
                        }
                    }
                }



                /* ==========================================
                   DIRECT EXCEL DOWNLOAD
                ========================================== */

                function downloadDirectExcel() {

                    const headers =
                        reportMeta.headers || [];


                    const rows =
                        reportMeta.rows || [];


                    const totals =
                        reportMeta.grandTotals || [];


                    const aoa = [

                        [
                            "MOUSUMI COMPUTER"
                        ],

                        [
                            reportMeta.title
                        ],

                        [
                            "PERIOD: " +
                            reportMeta.period,

                            "GENERATED: " +
                            new Date().toLocaleString()
                        ],

                        [],

                        headers,

                        ...rows
                    ];


                    if (totals.length > 0) {

                        aoa.push(totals);
                    }


                    const ws =
                        XLSX.utils.aoa_to_sheet(aoa);


                    /*
                     * Excel column width
                     */

                    ws['!cols'] =
                        headers.map(
                            (h, index) => {

                                const headerLength =
                                    String(
                                        h || ''
                                    ).length;


                                let maxLength =
                                    headerLength;


                                rows.forEach(
                                    row => {

                                        maxLength =
                                            Math.max(

                                                maxLength,

                                                String(
                                                    row[index] ??
                                                    ''
                                                ).length
                                            );
                                    }
                                );


                                return {

                                    wch:
                                        Math.min(
                                            Math.max(
                                                maxLength + 2,
                                                10
                                            ),
                                            28
                                        )
                                };

                            }
                        );


                    const wb =
                        XLSX.utils.book_new();


                    XLSX.utils.book_append_sheet(
                        wb,
                        ws,
                        "Statement"
                    );


                    XLSX.writeFile(

                        wb,

                        reportMeta.fileName +
                        '.xlsx'
                    );
                }

            <\/script>

        </body>

        </html>
    `;


    reportWindow.document.open();

    reportWindow.document.write(docHTML);

    reportWindow.document.close();
}
