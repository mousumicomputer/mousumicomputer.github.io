/**
 * Mousumi Computer - Professional Document Engine
 * PDF Design + Tiro Bangla Font + বিবরণ Column
 *
 * হিসাবের মূল Logic অপরিবর্তিত রাখা হয়েছে।
 */

(function() {

    // =========================================================
    // ১. সংখ্যাকে বাংলা করা (কমা ও দশমিক সহ)
    // =========================================================

    const toBn = (num) => {

        if (
            num === undefined ||
            num === null ||
            isNaN(num)
        ) {
            return "০.০০";
        }

        let formatted =
            new Intl.NumberFormat('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(Math.abs(num));

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

        return formatted.replace(
            /\d/g,
            d => digits[d]
        );
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

        return num
            .toString()
            .replace(
                /\d/g,
                d => digits[d]
            );
    };


    // =========================================================
    // ৩. ১২ ঘণ্টার সময় ফরম্যাট
    // =========================================================

    const format12h = (timeStr) => {

        if (!timeStr) {
            return '--:-- --';
        }

        let [hours, minutes] =
            timeStr.split(':');

        hours = parseInt(hours);

        const ampm =
            hours >= 12 ? 'PM' : 'AM';

        hours =
            hours % 12 || 12;

        return `${hours
            .toString()
            .padStart(2, '0')}:${minutes} ${ampm}`;
    };


    // =========================================================
    // ৪. বাংলা তারিখ ও বার
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
                days[dateObj.getDay()],

            date:
                toBnSimple(
                    dateObj.getDate()
                ),

            month:
                months[dateObj.getMonth()],

            year:
                toBnSimple(
                    dateObj.getFullYear()
                )
        };
    };


    // =========================================================
    // ৫. PDF GENERATION
    // =========================================================

    const generateMousumiPDF =
        (reportData, startDate) => {

        const startParts =
            getBnDate(
                new Date(startDate)
            );


        let tableRows = '';

        let verticalSumTaka = 0;

        let verticalSumRemaining = 0;


        // =====================================================
        // TRANSACTION ROW তৈরি
        // =====================================================

        reportData.forEach(
            (t, index) => {

            const amount =
                parseFloat(t.debit) ||
                parseFloat(t.credit) ||
                0;


            const balance =
                Math.abs(
                    parseFloat(
                        t.runningBalanceAtTime
                    ) || 0
                );


            const type =
                t.debit > 0
                    ? "বাকী দিলাম"
                    : "বাকী পেলাম";


            // =================================================
            // বিবরণ
            //
            // আপনার transaction object-এ description
            // থাকলে সেটি দেখাবে।
            //
            // description না থাকলে খালি থাকবে।
            // =================================================

            const description =
                t.description ||
                t.details ||
                t.note ||
                t.remark ||
                "";


            // =================================================
            // TOTAL
            // =================================================

            verticalSumTaka += amount;

            verticalSumRemaining += balance;


            // =================================================
            // TABLE ROW
            // =================================================

            tableRows += `

                <tr>

                    <!-- ক্রমিক -->

                    <td
                        style="
                            text-align:center;
                        "
                    >
                        ${toBnSimple(index + 1)}।
                    </td>


                    <!-- সময় -->

                    <td
                        style="
                            text-align:center;
                            direction:ltr;
                        "
                    >
                        ${format12h(t.time)}
                    </td>


                    <!-- কাস্টমার -->

                    <td
                        style="
                            text-align:left;
                            padding-left:10px;
                        "
                    >
                        ${t.customerName}
                    </td>


                    <!-- লেনদেন -->

                    <td
                        style="
                            text-align:center;
                        "
                    >
                        ${type}
                    </td>


                    <!-- বিবরণ -->

                    <td
                        style="
                            text-align:left;
                            padding-left:8px;
                        "
                    >
                        ${description}
                    </td>


                    <!-- টাকা -->

                    <td
                        style="
                            text-align:right;
                            padding-right:10px;
                        "
                    >
                        ${toBn(amount)}
                    </td>


                    <!-- অবশিষ্ট বাকী -->

                    <td
                        style="
                            text-align:right;
                            padding-right:10px;
                        "
                    >
                        ${toBn(balance)}
                    </td>

                </tr>

            `;
        });


        // =========================================================
        // PDF HTML
        // =========================================================

        const elementHTML = `

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">


            <!-- Tiro Bangla Font -->

            <link
                href="https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap"
                rel="stylesheet"
            >


            <style>

                /* =================================================
                   PAGE
                   ================================================= */

                @page {
                    size: A4;
                    margin: 0;
                }


                /* =================================================
                   BODY
                   ================================================= */

                body {

                    font-family:
                        'Tiro Bangla',
                        serif;

                    margin: 0;

                    padding: 0;

                    color: #000;

                    background: #fff;

                }


                /* =================================================
                   HEADER
                   ================================================= */

                .main-header {

                    text-align: center;

                    margin-top: 25px;

                    margin-bottom: 24px;

                }


                .main-header h1 {

                    font-family:
                        'Times New Roman',
                        serif;

                    font-size: 29pt;

                    font-weight: bold;

                    margin: 0;

                    letter-spacing: 1px;

                    line-height: 1.1;

                }


                .main-header h2 {

                    font-family:
                        'Tiro Bangla',
                        serif;

                    font-size: 13pt;

                    margin:
                        5px 0 0 0;

                    font-weight: 700;

                    display: inline-block;

                    border-bottom: none;

                    padding: 0;

                    line-height: 1.2;

                }


                /* =================================================
                   DATE BAR
                   ================================================= */

                .date-bar {

                    display: flex;

                    justify-content:
                        space-between;

                    align-items: center;

                    font-family:
                        'Tiro Bangla',
                        serif;

                    font-weight: bold;

                    font-size: 10pt;

                    margin:
                        0
                        51px
                        17px
                        51px;

                    padding: 0;

                }


                /* =================================================
                   TABLE
                   ================================================= */

                table {

                    width:
                        calc(100% - 102px);

                    margin:
                        0
                        51px;

                    border-collapse:
                        collapse;

                    border:
                        1px solid #000;

                    table-layout:
                        fixed;

                }


                th,
                td {

                    border:
                        1px solid #000;

                    padding:
                        6px 5px;

                    font-family:
                        'Tiro Bangla',
                        serif;

                    font-size:
                        9.5pt;

                    line-height:
                        1.15;

                    vertical-align:
                        middle;

                }


                th {

                    background-color:
                        #f2f2f2;

                    font-weight:
                        bold;

                    text-align:
                        center;

                    white-space:
                        nowrap;

                }


                td {

                    font-weight:
                        normal;

                }


                /* =================================================
                   TOTAL ROW
                   ================================================= */

                .total-row td {

                    font-weight:
                        bold;

                    background-color:
                        #fff;

                }


                /* =================================================
                   SIGNATURE
                   ================================================= */

                .sig-container {

                    margin-top:
                        73px;

                    margin-right:
                        51px;

                    display:
                        flex;

                    justify-content:
                        flex-end;

                }


                .sig-box {

                    width:
                        235px;

                    text-align:
                        center;

                    border-top:
                        1px solid #000;

                    padding-top:
                        5px;

                    font-family:
                        'Times New Roman',
                        serif;

                    font-weight:
                        normal;

                    font-size:
                        10pt;

                }

            </style>

        </head>


        <body>


            <!-- =================================================
                 HEADER
                 ================================================= -->

            <div class="main-header">

                <h1>
                    MOUSUMI COMPUTER
                </h1>

                <h2>
                    লেনদেন এর তালিকা
                </h2>

            </div>


            <!-- =================================================
                 DATE
                 ================================================= -->

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


            <!-- =================================================
                 TRANSACTION TABLE
                 ================================================= -->

            <table>

                <thead>

                    <tr>


                        <!-- ক্রমিক -->

                        <th style="width:7%;">
                            ক্রমিক
                        </th>


                        <!-- সময় -->

                        <th style="width:11%;">
                            সময়
                        </th>


                        <!-- কাস্টমার -->

                        <th style="width:17%;">
                            কাস্টমার
                        </th>


                        <!-- লেনদেন -->

                        <th style="width:14%;">
                            লেনদেন
                        </th>


                        <!-- বিবরণ -->

                        <th style="width:18%;">
                            বিবরণ
                        </th>


                        <!-- টাকা -->

                        <th style="width:15%;">
                            টাকা
                        </th>


                        <!-- অবশিষ্ট বাকী -->

                        <th style="width:18%;">
                            অবশিষ্ট বাকী
                        </th>


                    </tr>

                </thead>


                <tbody>


                    ${tableRows}


                    <!-- =================================================
                         TOTAL
                         ================================================= -->

                    <tr
                        class="total-row"
                    >

                        <td
                            colspan="5"
                            style="
                                text-align:right;
                                padding-right:10px;
                            "
                        >

                            সর্বমোট (Total):

                        </td>


                        <td
                            style="
                                text-align:right;
                                padding-right:10px;
                            "
                        >

                            ${toBn(
                                verticalSumTaka
                            )}

                        </td>


                        <td
                            style="
                                text-align:right;
                                padding-right:10px;
                            "
                        >

                            ${toBn(
                                verticalSumRemaining
                            )}

                        </td>

                    </tr>


                </tbody>

            </table>


            <!-- =================================================
                 SIGNATURE
                 ================================================= -->

            <div
                class="sig-container"
            >

                <div
                    class="sig-box"
                >

                    Authorized Signature

                </div>

            </div>


        </body>

        </html>

        `;


        // =========================================================
        // PDF OPTIONS
        // =========================================================

        const opt = {

            margin: 0,

            filename:
                `Mousumi_Report_${startDate}.pdf`,

            image: {

                type: 'jpeg',

                quality: 0.98

            },

            html2canvas: {

                scale: 3,

                useCORS: true,

                letterRendering: true

            },

            jsPDF: {

                unit: 'mm',

                format: 'a4',

                orientation: 'portrait'

            }

        };


        // =========================================================
        // SAVE PDF
        // =========================================================

        html2pdf()

            .set(opt)

            .from(elementHTML)

            .save();

    };


    // =========================================================
    // ৬. REPORT CENTER UI
    // =========================================================

    const initReportUI = () => {

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
                border-radius:12px;
                padding:25px;
                border:1px solid #e2e8f0;
                box-shadow:
                    0 4px 20px
                    rgba(0,0,0,0.05);
            "
        >

            <h3
                style="
                    margin-top:0;
                    font-size:18px;
                "
            >
                Download Report
            </h3>


            <div
                style="
                    display:flex;
                    gap:15px;
                    margin-bottom:20px;
                "
            >

                <div
                    style="
                        flex:1;
                    "
                >

                    <label
                        style="
                            display:block;
                            margin-bottom:5px;
                            font-weight:600;
                        "
                    >
                        তারিখ নির্বাচন করুন
                    </label>


                    <input
                        type="date"
                        id="rc-start"

                        style="
                            width:100%;
                            padding:10px;
                            border:
                                1px solid
                                #cbd5e1;
                            border-radius:8px;
                        "
                    >

                </div>

            </div>


            <button
                id="rc-download-btn"

                style="
                    background:#000;
                    color:#fff;
                    border:none;
                    padding:
                        12px 25px;
                    border-radius:8px;
                    font-weight:700;
                    cursor:pointer;
                "
            >

                Generate PDF Report

            </button>

        </div>

        `;


        // =====================================================
        // DEFAULT DATE
        // =====================================================

        document.getElementById(
            'rc-start'
        ).value =
            new Date()
                .toISOString()
                .split('T')[0];


        // =====================================================
        // DOWNLOAD BUTTON
        // =====================================================

        document.getElementById(
            'rc-download-btn'
        ).onclick = () => {


            const start =
                document.getElementById(
                    'rc-start'
                ).value;


            const allTxs =
                window.customerTransactions ||
                [];


            const allCusts =
                window.customers ||
                [];


            // =================================================
            // DATE FILTER
            // =================================================

            let filtered =
                allTxs.filter(
                    t =>
                        t.date === start
                );


            if (
                filtered.length === 0
            ) {

                return alert(
                    "এই তারিখে কোনো লেনদেন নেই!"
                );

            }


            // =================================================
            // REPORT DATA
            // =================================================

            const reportData =
                filtered.map(
                    t => {


                    const cust =
                        allCusts.find(
                            x =>
                                x.id ===
                                t.customerId
                        );


                    let balanceAtTime =
                        parseFloat(
                            cust
                                ? cust.openingBalance
                                : 0
                        );


                    // =========================================
                    // CUSTOMER HISTORY
                    // =========================================

                    const history =
                        allTxs

                            .filter(
                                x =>
                                    x.customerId ===
                                    t.customerId
                            )

                            .sort(
                                (a, b) =>
                                    (
                                        a.date +
                                        a.time
                                    ).localeCompare(
                                        b.date +
                                        b.time
                                    )
                            );


                    // =========================================
                    // RUNNING BALANCE
                    // =========================================

                    for (
                        let entry of history
                    ) {

                        balanceAtTime +=
                            (
                                parseFloat(
                                    entry.debit
                                ) || 0
                            );


                        balanceAtTime -=
                            (
                                parseFloat(
                                    entry.credit
                                ) || 0
                            );


                        if (
                            entry.id ===
                            t.id
                        ) {

                            break;

                        }

                    }


                    // =========================================
                    // RETURN REPORT OBJECT
                    // =========================================

                    return {

                        ...t,

                        customerName:
                            cust
                                ? cust.name
                                : "Unknown",

                        runningBalanceAtTime:
                            balanceAtTime

                    };

                });


            // =================================================
            // GENERATE PDF
            // =================================================

            generateMousumiPDF(
                reportData,
                start
            );

        };

    };


    // =========================================================
    // INITIALIZE
    // =========================================================

    setTimeout(
        initReportUI,
        1500
    );

})();
