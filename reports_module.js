/**
 * Mousumi Computer - Professional Document Engine
 * Final Version
 * Fixed: White PDF Issue + A4 Layout + Compact Professional Design
 */

(function () {

    // =========================================================
    // ১. সংখ্যাকে বাংলা করা
    // =========================================================

    const toBn = (num) => {

        if (
            num === undefined ||
            num === null ||
            isNaN(num)
        ) {
            return "০.০০";
        }

        let formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(Number(num)));

        const digits = {
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

        return formatted.replace(/\d/g, d => digits[d]);
    };


    // =========================================================
    // ২. সাধারণ বাংলা সংখ্যা
    // =========================================================

    const toBnSimple = (num) => {

        const digits = {
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

        return String(num ?? '').replace(
            /\d/g,
            d => digits[d]
        );
    };


    // =========================================================
    // ৩. HTML নিরাপদ করা
    // =========================================================

    const escapeHTML = (val) => {

        return String(val ?? '').replace(
            /[&<>"']/g,
            m => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": "&#039;"
            }[m])
        );

    };


    // =========================================================
    // ৪. ১২ ঘণ্টার সময় ফরম্যাট
    // =========================================================

    const format12hBn = (timeStr) => {

        if (!timeStr) {
            return '--:--';
        }

        let parts = String(timeStr).split(':');

        let hours = parseInt(parts[0], 10);

        let minutes = parts[1] || '00';

        if (isNaN(hours)) {
            return '--:--';
        }

        const ampm =
            hours >= 12
                ? 'PM'
                : 'AM';

        hours =
            hours % 12 || 12;

        const hourText =
            String(hours).padStart(2, '0');

        return (
            toBnSimple(hourText) +
            ":" +
            toBnSimple(minutes) +
            " " +
            ampm
        );

    };


    // =========================================================
    // ৫. বাংলা তারিখ ও বার
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
    // ৬. PDF GENERATION ENGINE
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
                typeof html2pdf !==
                'function'
            ) {

                alert(
                    "PDF তৈরি করার লাইব্রেরি পাওয়া যাচ্ছে না।\n\n" +
                    "দয়া করে html2pdf.js সঠিকভাবে লোড হয়েছে কিনা পরীক্ষা করুন।"
                );

                return;
            }


            // -------------------------------------------------
            // Date
            // -------------------------------------------------

            const dateObject =
                new Date(
                    startDate +
                    "T00:00:00"
                );

            const startParts =
                getBnDate(
                    dateObject
                );


            // -------------------------------------------------
            // Table
            // -------------------------------------------------

            let tableRows = '';

            let totalMoney = 0;

            let finalBalance = 0;


            reportData.forEach(
                (t, index) => {

                    const debit =
                        parseFloat(
                            t.debit
                        ) || 0;


                    const credit =
                        parseFloat(
                            t.credit
                        ) || 0;


                    const amount =
                        debit > 0
                            ? debit
                            : credit;


                    const balance =
                        parseFloat(
                            t.runningBalanceAtTime
                        ) || 0;


                    const type =
                        debit > 0
                            ? "বাকী দিলাম"
                            : "বাকী পেলাম";


                    totalMoney +=
                        Math.abs(
                            amount
                        );


                    // সর্বশেষ লেনদেনের balance
                    finalBalance =
                        balance;


                    tableRows += `

                        <tr>

                            <td class="serial">
                                ${toBnSimple(index + 1)}।
                            </td>

                            <td class="time">
                                ${format12hBn(t.time)}
                            </td>

                            <td class="customer">
                                ${escapeHTML(
                                    t.customerName
                                )}
                            </td>

                            <td class="transaction">
                                ${escapeHTML(type)}
                            </td>

                            <td class="money">
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

            const elementHTML = `

                <div class="mousumi-report">

                    <!-- HEADER -->

                    <div class="header">

                        <h1>
                            MOUSUMI COMPUTER
                        </h1>

                        <h2>
                            লেনদেন এর তালিকা
                        </h2>

                    </div>


                    <!-- DATE -->

                    <div class="date-bar">

                        <div>
                            তারিখ:
                            ${startParts.date}
                            ${startParts.month}
                            ${startParts.year}
                        </div>

                        <div>
                            বার:
                            ${startParts.day}
                        </div>

                    </div>


                    <!-- TABLE -->

                    <table>

                        <thead>

                            <tr>

                                <th class="col-serial">
                                    ক্রমিক
                                </th>

                                <th class="col-time">
                                    সময়
                                </th>

                                <th class="col-customer">
                                    কাস্টমার
                                </th>

                                <th class="col-type">
                                    লেনদেন
                                </th>

                                <th class="col-money">
                                    টাকা
                                </th>

                                <th class="col-balance">
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
                                        style="
                                            text-align:center;
                                            padding:10px;
                                        "
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

                                <td class="total-money">
                                    ${toBn(totalMoney)}
                                </td>

                                <td class="total-balance">
                                    ${toBn(finalBalance)}
                                </td>

                            </tr>

                        </tbody>

                    </table>


                    <!-- SIGNATURE -->

                    <div class="footer-signature">

                        <div class="sig-box">

                            <div class="sig-line"></div>

                            <div class="signature-text">
                                Authorized Signature
                            </div>

                        </div>

                    </div>

                </div>

            `;


            // =================================================
            // CSS
            // ২ নম্বর ছবির মতো Compact Professional Design
            // =================================================

            const style = `

                <style>

                    /*
                     * =========================================
                     * BASIC RESET
                     * =========================================
                     */

                    * {
                        box-sizing: border-box;
                    }


                    /*
                     * =========================================
                     * REPORT CONTAINER
                     * =========================================
                     */

                    .mousumi-report {

                        width: 760px;

                        margin: 0 auto;

                        padding: 16px 18px 14px 18px;

                        background: #ffffff;

                        color: #000000;

                        font-family:
                            'Tiro Bangla',
                            'Noto Sans Bengali',
                            'Nirmala UI',
                            Arial,
                            sans-serif;

                        font-size: 11px;

                        line-height: 1.25;

                        box-sizing: border-box;

                    }


                    /*
                     * =========================================
                     * HEADER
                     * =========================================
                     */

                    .header {

                        text-align: center;

                        margin: 0 0 15px 0;

                        padding: 0;

                    }


                    .header h1 {

                        margin: 0;

                        padding: 0;

                        font-family:
                            Georgia,
                            'Times New Roman',
                            serif;

                        font-size: 27px;

                        line-height: 1.1;

                        font-weight: 700;

                        letter-spacing: 0.5px;

                        color: #000000;

                    }


                    .header h2 {

                        margin: 5px 0 0 0;

                        padding: 0;

                        font-family:
                            'Tiro Bangla',
                            'Noto Sans Bengali',
                            'Nirmala UI',
                            sans-serif;

                        font-size: 12px;

                        line-height: 1.2;

                        font-weight: normal;

                        color: #000000;

                    }


                    /*
                     * =========================================
                     * DATE BAR
                     * =========================================
                     */

                    .date-bar {

                        display: flex;

                        justify-content: space-between;

                        align-items: center;

                        width: 100%;

                        margin: 0 0 5px 0;

                        padding: 0 2px 5px 2px;

                        border-bottom: 1px solid #dddddd;

                        font-family:
                            'Tiro Bangla',
                            'Noto Sans Bengali',
                            'Nirmala UI',
                            sans-serif;

                        font-size: 10px;

                        line-height: 1.2;

                        font-weight: bold;

                        color: #000000;

                    }


                    /*
                     * =========================================
                     * TABLE
                     * =========================================
                     */

                    table {

                        width: 100%;

                        border-collapse: collapse;

                        border-spacing: 0;

                        table-layout: fixed;

                        background: #ffffff;

                        border: 1px solid #000000;

                        margin: 0;

                    }


                    /*
                     * =========================================
                     * COLUMN WIDTH
                     * =========================================
                     */

                    .col-serial {

                        width: 10%;

                    }


                    .col-time {

                        width: 15%;

                    }


                    .col-customer {

                        width: 22%;

                    }


                    .col-type {

                        width: 18%;

                    }


                    .col-money {

                        width: 17%;

                    }


                    .col-balance {

                        width: 18%;

                    }


                    /*
                     * =========================================
                     * TABLE CELLS
                     * =========================================
                     */

                    th,
                    td {

                        border: 1px solid #000000;

                        padding: 4px 5px;

                        height: 25px;

                        font-family:
                            'Tiro Bangla',
                            'Noto Sans Bengali',
                            'Nirmala UI',
                            sans-serif;

                        font-size: 10px;

                        line-height: 1.25;

                        color: #000000;

                        vertical-align: middle;

                        background: #ffffff;

                        overflow-wrap: break-word;

                    }


                    /*
                     * =========================================
                     * TABLE HEADER
                     * =========================================
                     */

                    th {

                        height: 28px;

                        padding: 5px 4px;

                        background: #f2f2f2;

                        font-weight: bold;

                        text-align: center;

                        white-space: nowrap;

                    }


                    /*
                     * =========================================
                     * SERIAL
                     * =========================================
                     */

                    .serial {

                        text-align: center;

                        white-space: nowrap;

                    }


                    /*
                     * =========================================
                     * TIME
                     * =========================================
                     */

                    .time {

                        text-align: center;

                        white-space: nowrap;

                    }


                    /*
                     * =========================================
                     * CUSTOMER
                     * =========================================
                     */

                    .customer {

                        text-align: left;

                        white-space: normal;

                        word-break: break-word;

                    }


                    /*
                     * =========================================
                     * TRANSACTION
                     * =========================================
                     */

                    .transaction {

                        text-align: center;

                        white-space: normal;

                        word-break: break-word;

                    }


                    /*
                     * =========================================
                     * MONEY
                     * =========================================
                     */

                    .money {

                        text-align: right;

                        white-space: nowrap;

                    }


                    /*
                     * =========================================
                     * BALANCE
                     * =========================================
                     */

                    .balance {

                        text-align: right;

                        white-space: nowrap;

                    }


                    /*
                     * =========================================
                     * TOTAL ROW
                     * =========================================
                     */

                    .total-row td {

                        height: 27px;

                        padding: 5px 5px;

                        background: #ffffff;

                        font-weight: bold;

                        font-size: 10px;

                    }


                    .total-label {

                        text-align: right;

                    }


                    .total-money {

                        text-align: right;

                        white-space: nowrap;

                    }


                    .total-balance {

                        text-align: right;

                        white-space: nowrap;

                    }


                    /*
                     * =========================================
                     * SIGNATURE
                     * =========================================
                     */

                    .footer-signature {

                        width: 100%;

                        display: flex;

                        justify-content: flex-end;

                        margin-top: 48px;

                        padding-right: 5px;

                    }


                    .sig-box {

                        width: 180px;

                        text-align: center;

                        font-family:
                            Arial,
                            sans-serif;

                    }


                    .sig-line {

                        width: 100%;

                        border-top:
                            1px solid #555555;

                        margin: 0 0 5px 0;

                        height: 1px;

                    }


                    .signature-text {

                        font-family:
                            Arial,
                            sans-serif;

                        font-size: 10px;

                        line-height: 1.2;

                        color: #000000;

                    }


                    /*
                     * =========================================
                     * AVOID TABLE BREAK
                     * =========================================
                     */

                    tr {

                        page-break-inside: avoid;

                    }


                    /*
                     * =========================================
                     * A4
                     * =========================================
                     */

                    @page {

                        size: A4 portrait;

                        margin: 8mm;

                    }

                </style>

            `;


            // =================================================
            // TEMPORARY RENDER CONTAINER
            // =================================================

            const worker =
                document.createElement(
                    'div'
                );


            /*
             * IMPORTANT:
             *
             * এখানে z-index:-1 ব্যবহার করা হয়নি।
             * html2canvas যেন element দেখতে পারে।
             */

            worker.style.position =
                'fixed';

            worker.style.left =
                '-10000px';

            worker.style.top =
                '0';

            worker.style.width =
                '800px';

            worker.style.minHeight =
                '100px';

            worker.style.padding =
                '0';

            worker.style.margin =
                '0';

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


            // HTML বসানো

            worker.innerHTML =
                style +
                elementHTML;


            // Body-তে যোগ

            document.body.appendChild(
                worker
            );


            // =================================================
            // REPORT ELEMENT
            // =================================================

            const reportElement =
                worker.querySelector(
                    '.mousumi-report'
                );


            if (!reportElement) {

                document.body.removeChild(
                    worker
                );

                alert(
                    "রিপোর্ট তৈরি করা যায়নি।"
                );

                return;

            }


            // =================================================
            // FONT LOAD
            // =================================================

            try {

                if (
                    document.fonts &&
                    document.fonts.ready
                ) {

                    await document.fonts.ready;

                }

            } catch (fontError) {

                console.warn(
                    "Font loading warning:",
                    fontError
                );

            }


            // =================================================
            // RENDER DELAY
            // =================================================

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        300
                    )
            );


            // =================================================
            // PDF OPTIONS
            // =================================================

            const opt = {

                margin: [
                    7,
                    7,
                    7,
                    7
                ],

                filename:
                    `Mousumi_Report_${startDate}.pdf`,

                image: {

                    type: 'jpeg',

                    quality: 0.98

                },

                html2canvas: {

                    scale: 3,

                    useCORS: true,

                    allowTaint: false,

                    backgroundColor:
                        '#ffffff',

                    logging: false,

                    letterRendering: true,

                    imageTimeout:
                        15000,

                    scrollX: 0,

                    scrollY: 0,

                    windowWidth: 800

                },

                jsPDF: {

                    unit: 'mm',

                    format: 'a4',

                    orientation: 'portrait',

                    compress: true

                },

                pagebreak: {

                    mode: [
                        'css',
                        'legacy'
                    ]

                }

            };


            // =================================================
            // PDF GENERATE
            // =================================================

            try {

                await html2pdf()
                    .set(opt)
                    .from(reportElement)
                    .save();

            } catch (error) {

                console.error(
                    "Mousumi PDF Error:",
                    error
                );

                alert(
                    "PDF তৈরি করতে সমস্যা হয়েছে।\n\n" +
                    "Error: " +
                    (
                        error.message ||
                        error
                    )
                );

            } finally {

                // Temporary container remove

                if (
                    worker &&
                    worker.parentNode
                ) {

                    worker.parentNode.removeChild(
                        worker
                    );

                }

            }

        };


    // =========================================================
    // ৭. UI INITIALIZATION
    // =========================================================

    const initUI = () => {

        const container =
            document.getElementById(
                'cust-reports-section'
            );


        if (!container) {

            return;

        }


        // =====================================================
        // REPORT DOWNLOAD UI
        // =====================================================

        container.innerHTML = `

            <div
                style="
                    background:#fff;
                    border-radius:15px;
                    padding:30px;
                    border:1.5px solid #e2e8f0;
                    box-shadow:
                        0 10px 30px
                        rgba(0,0,0,0.05);
                    max-width:600px;
                    margin:0 auto;
                "
            >

                <h2
                    style="
                        font-family:
                            'Tiro Bangla',
                            'Noto Sans Bengali',
                            'Nirmala UI',
                            sans-serif;

                        font-size:22px;

                        color:#2176ff;

                        margin-bottom:20px;

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
                                'Noto Sans Bengali',
                                'Nirmala UI',
                                sans-serif;

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
                                1.5px solid #cbd5e1;

                            border-radius:10px;
                        "
                    />


                    <button
                        id="rc-btn"

                        style="
                            background:#2176ff;

                            color:#fff;

                            border:none;

                            padding:15px;

                            border-radius:10px;

                            font-weight:bold;

                            cursor:pointer;

                            font-family:
                                'Tiro Bangla',
                                'Noto Sans Bengali',
                                'Nirmala UI',
                                sans-serif;
                        "
                    >
                        ডাউনলোড PDF
                    </button>

                </div>

            </div>

        `;


        // =====================================================
        // TODAY DATE
        // =====================================================

        const dateInput =
            document.getElementById(
                'rc-date'
            );


        const today =
            new Date();


        const localYear =
            today.getFullYear();


        const localMonth =
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                '0'
            );


        const localDay =
            String(
                today.getDate()
            ).padStart(
                2,
                '0'
            );


        dateInput.value =
            `${localYear}-${localMonth}-${localDay}`;


        // =====================================================
        // DOWNLOAD BUTTON
        // =====================================================

        const downloadButton =
            document.getElementById(
                'rc-btn'
            );


        downloadButton.onclick =
            async () => {

                const date =
                    document.getElementById(
                        'rc-date'
                    ).value;


                if (!date) {

                    alert(
                        "দয়া করে একটি তারিখ নির্বাচন করুন।"
                    );

                    return;

                }


                // ------------------------------------------------
                // Transaction data
                // ------------------------------------------------

                const txs =
                    Array.isArray(
                        window.customerTransactions
                    )
                        ? window.customerTransactions
                        : [];


                // ------------------------------------------------
                // Customer data
                // ------------------------------------------------

                const custs =
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
                        t =>
                            String(t.date) ===
                            String(date)
                    );


                if (
                    !filtered.length
                ) {

                    alert(
                        "এই তারিখে কোনো লেনদেন নেই!"
                    );

                    return;

                }


                // =================================================
                // REPORT DATA
                // =================================================

                const reportData =
                    filtered.map(
                        t => {

                            // -------------------------------------
                            // Customer
                            // -------------------------------------

                            const customer =
                                custs.find(
                                    x =>
                                        String(x.id) ===
                                        String(
                                            t.customerId
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
                                        x =>
                                            String(
                                                x.customerId
                                            ) ===
                                            String(
                                                t.customerId
                                            )
                                    )
                                    .sort(
                                        (a, b) => {

                                            const dateA =
                                                String(
                                                    a.date ||
                                                    ''
                                                ) +
                                                String(
                                                    a.time ||
                                                    ''
                                                );

                                            const dateB =
                                                String(
                                                    b.date ||
                                                    ''
                                                ) +
                                                String(
                                                    b.time ||
                                                    ''
                                                );

                                            return dateA.localeCompare(
                                                dateB
                                            );

                                        }
                                    );


                            // -------------------------------------
                            // Running balance
                            // -------------------------------------

                            for (
                                const entry
                                of history
                            ) {

                                const debit =
                                    parseFloat(
                                        entry.debit
                                    ) || 0;


                                const credit =
                                    parseFloat(
                                        entry.credit
                                    ) || 0;


                                balance +=
                                    debit -
                                    credit;


                                if (
                                    String(
                                        entry.id
                                    ) ===
                                    String(
                                        t.id
                                    )
                                ) {

                                    break;

                                }

                            }


                            // -------------------------------------
                            // Return data
                            // -------------------------------------

                            return {

                                ...t,

                                customerName:
                                    customer
                                        ? customer.name
                                        : "Unknown",

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
    // ৮. START UI
    // =========================================================

    setTimeout(
        initUI,
        2000
    );


})();
