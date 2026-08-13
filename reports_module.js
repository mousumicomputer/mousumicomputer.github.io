/**
 * ============================================================
 * MOUSUMI COMPUTER
 * TRANSACTION REPORT PDF MODULE
 * ============================================================
 *
 * Features:
 * - MOUSUMI COMPUTER in English
 * - Tiro Bangla font
 * - Thin table borders
 * - Compact cell spacing
 * - No left/right clipping
 * - A4 centered report
 * - Modern PDF filename
 * - White PDF issue fixed
 * ============================================================
 */

(function () {

    // =========================================================
    // বাংলা সংখ্যা
    // =========================================================

    const BN_DIGITS = {
        '0': '০',
        '1': '১',
        '2': '২',
        '3': '৩',
        '4': '৪',
        '5': '৫',
        '6': '৬',
        '7': '৭',
        '8': '৮',
        '9': '৯'
    };


    const toBnSimple = (value) => {

        return String(value ?? '')
            .replace(
                /\d/g,
                d => BN_DIGITS[d]
            );

    };


    // =========================================================
    // টাকা ফরম্যাট
    // =========================================================

    const toBn = (num) => {

        if (
            num === undefined ||
            num === null ||
            isNaN(num)
        ) {
            return '০.০০';
        }

        const formatted =
            new Intl.NumberFormat('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(
                Math.abs(Number(num))
            );

        return formatted.replace(
            /\d/g,
            d => BN_DIGITS[d]
        );

    };


    // =========================================================
    // HTML নিরাপদ করা
    // =========================================================

    const escapeHTML = (value) => {

        return String(value ?? '')
            .replace(
                /[&<>"']/g,
                character => ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#039;'
                }[character])
            );

    };


    // =========================================================
    // 12 Hour Time
    // =========================================================

    const format12hBn = (timeStr) => {

        if (!timeStr) {
            return '--:--';
        }

        const parts =
            String(timeStr).split(':');

        let hours =
            parseInt(parts[0], 10);

        const minutes =
            parts[1] || '00';

        if (isNaN(hours)) {
            return '--:--';
        }

        const ampm =
            hours >= 12
                ? 'PM'
                : 'AM';

        hours =
            hours % 12 || 12;

        return (
            toBnSimple(
                String(hours).padStart(2, '0')
            ) +
            ':' +
            toBnSimple(minutes) +
            ' ' +
            ampm
        );

    };


    // =========================================================
    // বাংলা তারিখ
    // =========================================================

    const getBnDate = (dateObj) => {

        const days = [
            'রবিবার',
            'সোমবার',
            'মঙ্গলবার',
            'বুধবার',
            'বৃহস্পতিবার',
            'শুক্রবার',
            'শনিবার'
        ];

        const months = [
            'জানুয়ারি',
            'ফেব্রুয়ারি',
            'মার্চ',
            'এপ্রিল',
            'মে',
            'জুন',
            'জুলাই',
            'আগস্ট',
            'সেপ্টেম্বর',
            'অক্টোবর',
            'নভেম্বর',
            'ডিসেম্বর'
        ];

        return {

            day:
                days[
                    dateObj.getDay()
                ],

            date:
                toBnSimple(
                    dateObj.getDate()
                ),

            month:
                months[
                    dateObj.getMonth()
                ],

            year:
                toBnSimple(
                    dateObj.getFullYear()
                )

        };

    };


    // =========================================================
    // Tiro Bangla Font Load
    // =========================================================

    const ensureTiroBangla = async () => {

        try {

            let fontLink =
                document.getElementById(
                    'mousumi-tiro-bangla-font'
                );


            if (!fontLink) {

                fontLink =
                    document.createElement('link');

                fontLink.id =
                    'mousumi-tiro-bangla-font';

                fontLink.rel =
                    'stylesheet';

                fontLink.href =
                    'https://fonts.googleapis.com/css2?family=Tiro+Bangla&display=swap';

                document.head.appendChild(
                    fontLink
                );

            }


            if (
                document.fonts &&
                document.fonts.load
            ) {

                await document.fonts.load(
                    "16px 'Tiro Bangla'"
                );

                await document.fonts.ready;

            }

        } catch (error) {

            console.warn(
                'Tiro Bangla loading warning:',
                error
            );

        }

    };


    // =========================================================
    // আধুনিক PDF Filename
    // =========================================================

    const makePDFFileName = (date) => {

        return (
            'Mousumi-Computer_' +
            'Transaction-Report_' +
            date +
            '.pdf'
        );

    };


    // =========================================================
    // PDF GENERATOR
    // =========================================================

    const generateMousumiPDF =
        async (
            reportData,
            startDate
        ) => {

            // -------------------------------------------------
            // html2pdf আছে কিনা
            // -------------------------------------------------

            if (
                typeof html2pdf !== 'function'
            ) {

                alert(
                    'PDF তৈরির লাইব্রেরি পাওয়া যাচ্ছে না।'
                );

                return;

            }


            // -------------------------------------------------
            // Font load
            // -------------------------------------------------

            await ensureTiroBangla();


            // -------------------------------------------------
            // Date
            // -------------------------------------------------

            const dateObj =
                new Date(
                    startDate +
                    'T00:00:00'
                );

            const dateInfo =
                getBnDate(
                    dateObj
                );


            // -------------------------------------------------
            // Table
            // -------------------------------------------------

            let tableRows = '';

            let totalMoney = 0;

            let finalBalance = 0;


            reportData.forEach(
                (transaction, index) => {

                    const debit =
                        parseFloat(
                            transaction.debit
                        ) || 0;


                    const credit =
                        parseFloat(
                            transaction.credit
                        ) || 0;


                    const amount =
                        debit > 0
                            ? debit
                            : credit;


                    const balance =
                        parseFloat(
                            transaction.runningBalanceAtTime
                        ) || 0;


                    const transactionType =
                        debit > 0
                            ? 'বাকী দিলাম'
                            : 'বাকী পেলাম';


                    totalMoney +=
                        Math.abs(amount);


                    finalBalance =
                        balance;


                    tableRows += `

                        <tr>

                            <td class="serial">
                                ${toBnSimple(
                                    index + 1
                                )}।
                            </td>

                            <td class="time">
                                ${format12hBn(
                                    transaction.time
                                )}
                            </td>

                            <td class="customer">
                                ${escapeHTML(
                                    transaction.customerName
                                )}
                            </td>

                            <td class="transaction-type">
                                ${escapeHTML(
                                    transactionType
                                )}
                            </td>

                            <td class="amount">
                                ${toBn(amount)}
                            </td>

                            <td class="balance">
                                ${toBn(balance)}
                            </td>

                        </tr>

                    `;

                }
            );


            // =================================================
            // REPORT HTML
            // =================================================

            const reportHTML = `

                <div class="mousumi-report">

                    <!-- HEADER -->

                    <div class="report-header">

                        <!-- IMPORTANT:
                             English text + Tiro Bangla
                        -->

                        <div class="shop-name">
                            MOUSUMI COMPUTER
                        </div>


                        <div class="report-title">
                            লেনদেন এর তালিকা
                        </div>

                    </div>


                    <!-- DATE -->

                    <div class="report-meta">

                        <div class="date">
                            তারিখ:
                            ${dateInfo.date}
                            ${dateInfo.month}
                            ${dateInfo.year}
                        </div>


                        <div class="day">
                            বার:
                            ${dateInfo.day}
                        </div>

                    </div>


                    <!-- TABLE -->

                    <table class="transaction-table">

                        <colgroup>

                            <col style="width:9%;">

                            <col style="width:15%;">

                            <col style="width:23%;">

                            <col style="width:18%;">

                            <col style="width:17%;">

                            <col style="width:18%;">

                        </colgroup>


                        <thead>

                            <tr>

                                <th>
                                    ক্রমিক
                                </th>

                                <th>
                                    সময়
                                </th>

                                <th>
                                    কাস্টমার
                                </th>

                                <th>
                                    লেনদেন
                                </th>

                                <th>
                                    টাকা
                                </th>

                                <th>
                                    অবশিষ্ট বাকী
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            ${
                                tableRows ||
                                `
                                <tr>

                                    <td
                                        colspan="6"
                                        class="empty-row"
                                    >
                                        কোনো লেনদেন নেই
                                    </td>

                                </tr>
                                `
                            }


                            <!-- TOTAL -->

                            <tr class="total-row">

                                <td
                                    colspan="4"
                                    class="total-label"
                                >
                                    সর্বমোট (Total):
                                </td>


                                <td class="amount">
                                    ${toBn(
                                        totalMoney
                                    )}
                                </td>


                                <td class="balance">
                                    ${toBn(
                                        finalBalance
                                    )}
                                </td>

                            </tr>

                        </tbody>

                    </table>


                    <!-- SIGNATURE -->

                    <div class="signature-area">

                        <div class="signature-box">

                            <div class="signature-line"></div>

                            <div class="signature-text">
                                Authorized Signature
                            </div>

                        </div>

                    </div>

                </div>

            `;


            // =================================================
            // CSS
            // =================================================

            const reportCSS = `

                <style>

                    /*
                     * =================================================
                     * FONT
                     * =================================================
                     */

                    @import url(
                        'https://fonts.googleapis.com/css2?family=Tiro+Bangla&display=swap'
                    );


                    /*
                     * =================================================
                     * RESET
                     * =================================================
                     */

                    * {

                        box-sizing:
                            border-box;

                    }


                    /*
                     * =================================================
                     * REPORT WIDTH
                     *
                     * আগের 760px এর কারণে A4-এর ভিতরে
                     * বাম পাশ কেটে যাচ্ছিল।
                     *
                     * এখন 700px রাখা হয়েছে।
                     * =================================================
                     */

                    .mousumi-report {

                        width:
                            700px;

                        max-width:
                            700px;

                        margin:
                            0 auto;

                        padding:
                            10px 8px 10px 8px;

                        background:
                            #ffffff;

                        color:
                            #000000;

                        font-family:
                            'Tiro Bangla',
                            serif;

                        font-size:
                            10px;

                        line-height:
                            1.05;

                        overflow:
                            visible;

                    }


                    /*
                     * =================================================
                     * HEADER
                     * =================================================
                     */

                    .report-header {

                        width:
                            100%;

                        text-align:
                            center;

                        margin:
                            0 0 15px 0;

                        padding:
                            0;

                    }


                    /*
                     * ইংরেজি লেখা
                     * কিন্তু font Tiro Bangla
                     */

                    .shop-name {

                        font-family:
                            'Tiro Bangla',
                            serif;

                        font-size:
                            26px;

                        font-weight:
                            normal;

                        line-height:
                            1.05;

                        letter-spacing:
                            0;

                        margin:
                            0;

                        padding:
                            0;

                        white-space:
                            nowrap;

                    }


                    /*
                     * বাংলা Subtitle
                     */

                    .report-title {

                        font-family:
                            'Tiro Bangla',
                            serif;

                        font-size:
                            12px;

                        font-weight:
                            normal;

                        line-height:
                            1;

                        margin-top:
                            4px;

                        padding:
                            0;

                    }


                    /*
                     * =================================================
                     * DATE / DAY
                     * =================================================
                     */

                    .report-meta {

                        width:
                            100%;

                        display:
                            flex;

                        justify-content:
                            space-between;

                        align-items:
                            center;

                        margin:
                            0 0 4px 0;

                        padding:
                            0 1px 3px 1px;

                        font-family:
                            'Tiro Bangla',
                            serif;

                        font-size:
                            9.5px;

                        line-height:
                            1.05;

                    }


                    /*
                     * =================================================
                     * TABLE
                     * =================================================
                     */

                    .transaction-table {

                        width:
                            100%;

                        max-width:
                            100%;

                        border-collapse:
                            collapse;

                        border-spacing:
                            0;

                        table-layout:
                            fixed;

                        margin:
                            0;

                        padding:
                            0;

                        background:
                            #ffffff;

                        border:
                            0.4px solid #333333;

                    }


                    /*
                     * =================================================
                     * CELLS
                     *
                     * Border আরও চিকন
                     * Padding কম
                     * =================================================
                     */

                    .transaction-table th,
                    .transaction-table td {

                        border:
                            0.4px solid #444444;

                        font-family:
                            'Tiro Bangla',
                            serif;

                        font-size:
                            9px;

                        line-height:
                            1;

                        color:
                            #000000;

                        vertical-align:
                            middle;

                        padding:
                            1.5px 3px;

                        height:
                            21px;

                    }


                    /*
                     * =================================================
                     * HEADER
                     * =================================================
                     */

                    .transaction-table th {

                        height:
                            23px;

                        padding:
                            2px 2px;

                        text-align:
                            center;

                        font-weight:
                            normal;

                        background:
                            #fafafa;

                        white-space:
                            nowrap;

                    }


                    /*
                     * =================================================
                     * SERIAL
                     * =================================================
                     */

                    .serial {

                        text-align:
                            center;

                        white-space:
                            nowrap;

                    }


                    /*
                     * =================================================
                     * TIME
                     * =================================================
                     */

                    .time {

                        text-align:
                            center;

                        white-space:
                            nowrap;

                    }


                    /*
                     * =================================================
                     * CUSTOMER
                     * =================================================
                     */

                    .customer {

                        text-align:
                            left;

                        white-space:
                            nowrap;

                        overflow:
                            hidden;

                        text-overflow:
                            ellipsis;

                    }


                    /*
                     * =================================================
                     * TRANSACTION
                     * =================================================
                     */

                    .transaction-type {

                        text-align:
                            center;

                        white-space:
                            nowrap;

                    }


                    /*
                     * =================================================
                     * MONEY
                     * =================================================
                     */

                    .amount {

                        text-align:
                            right;

                        white-space:
                            nowrap;

                    }


                    /*
                     * =================================================
                     * BALANCE
                     * =================================================
                     */

                    .balance {

                        text-align:
                            right;

                        white-space:
                            nowrap;

                    }


                    /*
                     * =================================================
                     * TOTAL
                     * =================================================
                     */

                    .total-row td {

                        height:
                            22px;

                        padding:
                            2px 3px;

                        font-weight:
                            bold;

                        background:
                            #ffffff;

                    }


                    .total-label {

                        text-align:
                            right;

                    }


                    /*
                     * =================================================
                     * EMPTY
                     * =================================================
                     */

                    .empty-row {

                        text-align:
                            center;

                        height:
                            28px;

                    }


                    /*
                     * =================================================
                     * SIGNATURE
                     * =================================================
                     */

                    .signature-area {

                        width:
                            100%;

                        display:
                            flex;

                        justify-content:
                            flex-end;

                        margin-top:
                            40px;

                        padding:
                            0;

                    }


                    .signature-box {

                        width:
                            170px;

                        text-align:
                            center;

                    }


                    .signature-line {

                        width:
                            100%;

                        border-top:
                            0.5px solid #444444;

                        height:
                            1px;

                        margin:
                            0 0 4px 0;

                    }


                    .signature-text {

                        font-family:
                            Arial,
                            sans-serif;

                        font-size:
                            9px;

                        line-height:
                            1;

                    }


                    /*
                     * =================================================
                     * TABLE BREAK
                     * =================================================
                     */

                    tr {

                        page-break-inside:
                            avoid;

                    }


                    /*
                     * =================================================
                     * A4
                     * =================================================
                     */

                    @page {

                        size:
                            A4 portrait;

                        margin:
                            8mm;

                    }

                </style>

            `;


            // =================================================
            // RENDER CONTAINER
            // =================================================

            const worker =
                document.createElement(
                    'div'
                );


            /*
             * IMPORTANT:
             *
             * Worker width এবং report width একই রাখা হয়েছে।
             * এতে left clipping হবে না।
             */

            worker.style.position =
                'fixed';

            worker.style.left =
                '0';

            worker.style.top =
                '0';

            worker.style.width =
                '700px';

            worker.style.minWidth =
                '700px';

            worker.style.maxWidth =
                '700px';

            worker.style.background =
                '#ffffff';

            worker.style.display =
                'block';

            worker.style.visibility =
                'visible';

            worker.style.opacity =
                '1';

            worker.style.zIndex =
                '999999';

            worker.style.padding =
                '0';

            worker.style.margin =
                '0';


            worker.innerHTML =
                reportCSS +
                reportHTML;


            document.body.appendChild(
                worker
            );


            // =================================================
            // Report element
            // =================================================

            const reportElement =
                worker.querySelector(
                    '.mousumi-report'
                );


            if (!reportElement) {

                worker.remove();

                alert(
                    'রিপোর্ট তৈরি করা যায়নি।'
                );

                return;

            }


            // =================================================
            // Fonts
            // =================================================

            try {

                if (
                    document.fonts &&
                    document.fonts.ready
                ) {

                    await document.fonts.ready;

                }

                if (
                    document.fonts &&
                    document.fonts.load
                ) {

                    await document.fonts.load(
                        "16px 'Tiro Bangla'"
                    );

                }

            } catch (error) {

                console.warn(
                    error
                );

            }


            // =================================================
            // Browser render delay
            // =================================================

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );


            // =================================================
            // PDF OPTIONS
            // =================================================

            const pdfOptions = {

                /*
                 * খুব কম margin।
                 * এতে A4-এর ভিতরে পুরো report থাকবে।
                 */

                margin:
                    [
                        6,
                        6,
                        6,
                        6
                    ],

                filename:
                    makePDFFileName(
                        startDate
                    ),

                image: {

                    type:
                        'jpeg',

                    quality:
                        0.98

                },

                html2canvas: {

                    scale:
                        3,

                    useCORS:
                        true,

                    allowTaint:
                        false,

                    backgroundColor:
                        '#ffffff',

                    logging:
                        false,

                    letterRendering:
                        true,

                    imageTimeout:
                        15000,

                    scrollX:
                        0,

                    scrollY:
                        0,

                    /*
                     * আগের 800px-এর বদলে
                     * report-এর exact width
                     */

                    width:
                        700,

                    windowWidth:
                        700

                },

                jsPDF: {

                    unit:
                        'mm',

                    format:
                        'a4',

                    orientation:
                        'portrait',

                    compress:
                        true

                },

                pagebreak: {

                    mode:
                        [
                            'css',
                            'legacy'
                        ]

                }

            };


            // =================================================
            // Generate PDF
            // =================================================

            try {

                await html2pdf()
                    .set(pdfOptions)
                    .from(reportElement)
                    .save();

            } catch (error) {

                console.error(
                    'PDF Error:',
                    error
                );

                alert(
                    'PDF তৈরি করতে সমস্যা হয়েছে।\n\n' +
                    (
                        error.message ||
                        error
                    )
                );

            } finally {

                if (
                    worker &&
                    worker.parentNode
                ) {

                    worker.parentNode
                        .removeChild(
                            worker
                        );

                }

            }

        };


    // =========================================================
    // REPORT UI
    // =========================================================

    const initUI = () => {

        const container =
            document.getElementById(
                'cust-reports-section'
            );


        if (!container) {
            return;
        }


        container.innerHTML = `

            <div
                style="
                    background:#fff;
                    border-radius:15px;
                    padding:30px;
                    border:1px solid #e2e8f0;
                    box-shadow:
                        0 8px 25px
                        rgba(0,0,0,0.05);
                    max-width:600px;
                    margin:0 auto;
                "
            >

                <h2
                    style="
                        font-family:
                            'Tiro Bangla',
                            serif;

                        font-size:22px;

                        color:#2176ff;

                        margin:
                            0 0 20px 0;

                        text-align:center;
                    "
                >
                    রিপোর্ট ডাউনলোড সেন্টার
                </h2>


                <div
                    style="
                        display:flex;
                        flex-direction:column;
                        gap:15px;
                    "
                >

                    <label
                        style="
                            font-family:
                                'Tiro Bangla',
                                serif;

                            font-weight:bold;
                        "
                    >
                        তারিখ নির্বাচন করুন:
                    </label>


                    <input
                        type="date"
                        id="rc-date"

                        style="
                            padding:12px;

                            border:
                                1px solid #cbd5e1;

                            border-radius:10px;
                        "
                    />


                    <button
                        id="rc-btn"

                        style="
                            background:#2176ff;

                            color:#fff;

                            border:none;

                            padding:14px;

                            border-radius:10px;

                            font-weight:bold;

                            cursor:pointer;

                            font-family:
                                'Tiro Bangla',
                                serif;
                        "
                    >
                        ডাউনলোড PDF
                    </button>

                </div>

            </div>

        `;


        // =====================================================
        // TODAY
        // =====================================================

        const dateInput =
            document.getElementById(
                'rc-date'
            );


        const today =
            new Date();


        dateInput.value =
            today.getFullYear() +
            '-' +
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                '0'
            ) +
            '-' +
            String(
                today.getDate()
            ).padStart(
                2,
                '0'
            );


        // =====================================================
        // DOWNLOAD
        // =====================================================

        const downloadButton =
            document.getElementById(
                'rc-btn'
            );


        downloadButton.onclick =
            async () => {

                const date =
                    dateInput.value;


                if (!date) {

                    alert(
                        'দয়া করে একটি তারিখ নির্বাচন করুন।'
                    );

                    return;

                }


                // ------------------------------------------------
                // Transactions
                // ------------------------------------------------

                const txs =
                    Array.isArray(
                        window.customerTransactions
                    )
                        ? window.customerTransactions
                        : [];


                // ------------------------------------------------
                // Customers
                // ------------------------------------------------

                const customers =
                    Array.isArray(
                        window.customers
                    )
                        ? window.customers
                        : [];


                // ------------------------------------------------
                // Selected date
                // ------------------------------------------------

                const filtered =
                    txs.filter(
                        transaction =>
                            String(
                                transaction.date
                            ) ===
                            String(date)
                    );


                if (
                    !filtered.length
                ) {

                    alert(
                        'এই তারিখে কোনো লেনদেন নেই!'
                    );

                    return;

                }


                // =================================================
                // REPORT DATA
                // =================================================

                const reportData =
                    filtered.map(
                        transaction => {

                            // -------------------------------------
                            // Customer
                            // -------------------------------------

                            const customer =
                                customers.find(
                                    customerItem =>
                                        String(
                                            customerItem.id
                                        ) ===
                                        String(
                                            transaction.customerId
                                        )
                                );


                            // -------------------------------------
                            // Opening balance
                            // -------------------------------------

                            let balance =
                                parseFloat(
                                    customer
                                        ? customer.openingBalance
                                        : 0
                                ) || 0;


                            // -------------------------------------
                            // Customer history
                            // -------------------------------------

                            const history =
                                txs
                                    .filter(
                                        item =>
                                            String(
                                                item.customerId
                                            ) ===
                                            String(
                                                transaction.customerId
                                            )
                                    )
                                    .sort(
                                        (a, b) => {

                                            const keyA =
                                                String(
                                                    a.date || ''
                                                ) +
                                                String(
                                                    a.time || ''
                                                );

                                            const keyB =
                                                String(
                                                    b.date || ''
                                                ) +
                                                String(
                                                    b.time || ''
                                                );

                                            return keyA.localeCompare(
                                                keyB
                                            );

                                        }
                                    );


                            // -------------------------------------
                            // Running balance
                            // -------------------------------------

                            for (
                                const item
                                of history
                            ) {

                                const debit =
                                    parseFloat(
                                        item.debit
                                    ) || 0;


                                const credit =
                                    parseFloat(
                                        item.credit
                                    ) || 0;


                                balance +=
                                    debit -
                                    credit;


                                if (
                                    String(
                                        item.id
                                    ) ===
                                    String(
                                        transaction.id
                                    )
                                ) {

                                    break;

                                }

                            }


                            return {

                                ...transaction,

                                customerName:
                                    customer
                                        ? customer.name
                                        : 'Unknown',

                                runningBalanceAtTime:
                                    balance

                            };

                        }
                    );


                // =================================================
                // GENERATE PDF
                // =================================================

                await generateMousumiPDF(
                    reportData,
                    date
                );

            };

    };


    // =========================================================
    // START
    // =========================================================

    setTimeout(
        initUI,
        2000
    );


})();
