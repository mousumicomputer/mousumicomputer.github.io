/**
 * ============================================================
 * MOUSUMI COMPUTER
 * SIMPLE TRANSACTION REPORT
 *
 * FINAL REVISED VERSION
 * ============================================================
 *
 * REPORT COLUMNS:
 *
 * ক্রমিক | সময় | কাস্টমার | লেনদেন | বিস্তারিত | টাকা | মন্তব্য
 *
 * ------------------------------------------------------------
 * PDF ENGINE:
 * Native Browser Print / Save as PDF
 *
 * html2canvas ব্যবহার করা হয়নি।
 * ============================================================
 */

(function () {

    "use strict";


    // ============================================================
    // ১. বাংলা সংখ্যা
    // ============================================================

    const BN_DIGITS = {
        "0": "০",
        "1": "১",
        "2": "২",
        "3": "৩",
        "4": "৪",
        "5": "৫",
        "6": "৬",
        "7": "৭",
        "8": "৮",
        "9": "৯"
    };


    const toBnSimple = (value) => {

        return String(value ?? "")
            .replace(
                /\d/g,
                digit => BN_DIGITS[digit]
            );

    };


    // ============================================================
    // ২. টাকা ফরম্যাট
    // ============================================================

    const toBnMoney = (value) => {

        const number =
            Number(value) || 0;


        const formatted =
            new Intl.NumberFormat(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ).format(
                Math.abs(number)
            );


        return formatted.replace(
            /\d/g,
            digit => BN_DIGITS[digit]
        );

    };


    // ============================================================
    // ৩. HTML নিরাপদ করা
    // ============================================================

    const escapeHTML = (value) => {

        return String(value ?? "")
            .replace(
                /[&<>"']/g,
                character => {

                    const map = {

                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#039;"

                    };

                    return map[character];

                }
            );

    };


    // ============================================================
    // ৪. সময় ফরম্যাট
    // ============================================================

    const formatTime = (time) => {

        if (!time) {

            return "--:--";

        }


        const parts =
            String(time).split(":");


        let hour =
            parseInt(
                parts[0],
                10
            );


        const minute =
            String(
                parts[1] || "00"
            ).padStart(
                2,
                "0"
            );


        if (
            Number.isNaN(hour)
        ) {

            return "--:--";

        }


        const ampm =
            hour >= 12
                ? "PM"
                : "AM";


        hour =
            hour % 12 || 12;


        const hourText =
            String(hour).padStart(
                2,
                "0"
            );


        return (

            toBnSimple(
                hourText
            )

            +

            ":"

            +

            toBnSimple(
                minute
            )

            +

            " "

            +

            ampm

        );

    };


    // ============================================================
    // ৫. বাংলা তারিখ
    // ============================================================

    const getBanglaDate = (
        dateString
    ) => {

        const date =
            new Date(
                dateString +
                "T00:00:00"
            );


        const days = [

            "রবিবার",
            "সোমবার",
            "মঙ্গলবার",
            "বুধবার",
            "বৃহস্পতিবার",
            "শুক্রবার",
            "শনিবার"

        ];


        const months = [

            "জানুয়ারি",
            "ফেব্রুয়ারি",
            "মার্চ",
            "এপ্রিল",
            "মে",
            "জুন",
            "জুলাই",
            "আগস্ট",
            "সেপ্টেম্বর",
            "অক্টোবর",
            "নভেম্বর",
            "ডিসেম্বর"

        ];


        return {

            day:
                days[
                    date.getDay()
                ],


            date:
                toBnSimple(
                    date.getDate()
                ),


            month:
                months[
                    date.getMonth()
                ],


            year:
                toBnSimple(
                    date.getFullYear()
                )

        };

    };


    // ============================================================
    // ৬. রিপোর্ট PRINT ENGINE
    // ============================================================

    const printMousumiReport = (
        reportData,
        selectedDate
    ) => {


        const dateInfo =
            getBanglaDate(
                selectedDate
            );


        // ========================================================
        // TOTAL
        // ========================================================

        let totalAmount = 0;


        // ========================================================
        // TABLE ROWS
        // ========================================================

        let rowsHTML = "";


        reportData.forEach(
            (
                transaction,
                index
            ) => {


                const debit =
                    Number(
                        transaction.debit
                    ) || 0;


                const credit =
                    Number(
                        transaction.credit
                    ) || 0;


                // ------------------------------------------------
                // Amount
                // ------------------------------------------------

                const amount =
                    debit > 0
                        ? debit
                        : credit;


                // ------------------------------------------------
                // Transaction Type
                // ------------------------------------------------

                const transactionType =
                    debit > 0
                        ? "বাকী দিলাম"
                        : "বাকী পেলাম";


                // ------------------------------------------------
                // Description
                //
                // আপনার মূল কোডে transaction.description
                // হিসেবে সংরক্ষিত হয়।
                // ------------------------------------------------

                const description =
                    transaction.description ||
                    "";


                // ------------------------------------------------
                // Comment
                //
                // বর্তমানে আপনার ডাটায় comment field নেই।
                // তাই থাকলে দেখাবে, না থাকলে খালি থাকবে।
                // ------------------------------------------------

                const comment =
                    transaction.comment ||
                    "";


                // ------------------------------------------------
                // Total
                // ------------------------------------------------

                totalAmount +=
                    Math.abs(
                        amount
                    );


                // ------------------------------------------------
                // ROW
                // ------------------------------------------------

                rowsHTML += `

                    <tr>

                        <td class="serial">

                            ${toBnSimple(
                                index + 1
                            )}।

                        </td>


                        <td class="time">

                            ${formatTime(
                                transaction.time
                            )}

                        </td>


                        <td class="customer">

                            ${escapeHTML(
                                transaction.customerName
                            )}

                        </td>


                        <td class="type">

                            ${escapeHTML(
                                transactionType
                            )}

                        </td>


                        <td class="details">

                            ${escapeHTML(
                                description
                            )}

                        </td>


                        <td class="money">

                            ${toBnMoney(
                                amount
                            )}

                        </td>


                        <td class="comment">

                            ${escapeHTML(
                                comment
                            )}

                        </td>

                    </tr>

                `;

            }
        );


        // ========================================================
        // NO DATA
        // ========================================================

        if (
            !rowsHTML
        ) {

            rowsHTML = `

                <tr>

                    <td
                        colspan="7"
                        class="no-data"
                    >

                        কোনো লেনদেন নেই

                    </td>

                </tr>

            `;

        }


        // ========================================================
        // REPORT HTML
        // ========================================================

        const reportHTML = `

<!DOCTYPE html>

<html lang="bn">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
>


<title>
    Mousumi Computer Transaction Report
</title>


<style>

/* ============================================================
   PAGE
   ============================================================ */

@page {

    size: A4 portrait;

    margin:
        9mm
        8mm
        12mm
        8mm;

}


/* ============================================================
   GLOBAL
   ============================================================ */

* {

    box-sizing: border-box;

}


html,
body {

    margin: 0;

    padding: 0;

    width: 100%;

    background: #ffffff;

    color: #000000;

}


body {

    font-family:
        "Tiro Bangla",
        "Noto Sans Bengali",
        "Nirmala UI",
        sans-serif;

    font-size: 11px;

}


/* ============================================================
   REPORT
   ============================================================ */

.report {

    width: 100%;

    margin: 0;

    padding: 0;

}


/* ============================================================
   HEADER
   ============================================================ */

.header {

    text-align: center;

    margin-bottom: 9px;

}


.shop-name {

    font-family:
        "Times New Roman",
        serif;

    font-size: 24px;

    font-weight: bold;

    line-height: 1.2;

    margin: 0;

    padding: 0;

}


.report-title {

    font-family:
        "Tiro Bangla",
        "Noto Sans Bengali",
        "Nirmala UI",
        sans-serif;

    font-size: 16px;

    line-height: 1.3;

    margin-top: 2px;

}


/* ============================================================
   DATE INFORMATION
   ============================================================ */

.info {

    display: flex;

    justify-content:
        space-between;

    align-items: center;

    width: 100%;

    margin-bottom: 6px;

    font-size: 11px;

}


/* ============================================================
   TABLE
   ============================================================ */

.transaction-table {

    width: 100%;

    border-collapse:
        collapse;

    border-spacing: 0;

    table-layout: fixed;

    margin: 0;

    padding: 0;

}


/* ============================================================
   TABLE CELLS
   ============================================================ */

/*
 * পাতলা single solid border
 */

.transaction-table th,
.transaction-table td {

    border:
        0.5px solid #000000;

    padding:
        4px 4px;

    font-family:
        "Tiro Bangla",
        "Noto Sans Bengali",
        "Nirmala UI",
        sans-serif;

    font-size: 10.5px;

    line-height: 1.25;

    color: #000000;

    vertical-align: middle;

}


/* ============================================================
   TABLE HEADER
   ============================================================ */

.transaction-table th {

    font-weight: bold;

    text-align: center;

    background:
        #f5f5f5;

    white-space: nowrap;

}


/* ============================================================
   COLUMN WIDTHS
   ============================================================ */

/*
 * মোট 100%
 *
 * ক্রমিক     7%
 * সময়        12%
 * কাস্টমার   18%
 * লেনদেন     15%
 * বিস্তারিত   25%
 * টাকা        11%
 * মন্তব্য     12%
 *
 * TOTAL = 100%
 */


/* ------------------------------------------------------------
   ক্রমিক
------------------------------------------------------------- */

.serial {

    width: 7%;

    text-align: center;

}


/* ------------------------------------------------------------
   সময়
------------------------------------------------------------- */

.time {

    width: 12%;

    text-align: center;

    white-space: nowrap;

}


/* ------------------------------------------------------------
   কাস্টমার
------------------------------------------------------------- */

.customer {

    width: 18%;

    text-align: left;

    word-break: break-word;

}


/* ------------------------------------------------------------
   লেনদেন
------------------------------------------------------------- */

.type {

    width: 15%;

    text-align: center;

    word-break: break-word;

}


/* ------------------------------------------------------------
   বিস্তারিত
------------------------------------------------------------- */

.details {

    width: 25%;

    text-align: left;

    word-break: break-word;

}


/* ------------------------------------------------------------
   টাকা
------------------------------------------------------------- */

.money {

    width: 11%;

    text-align: right;

    white-space: nowrap;

}


/* ------------------------------------------------------------
   মন্তব্য
------------------------------------------------------------- */

.comment {

    width: 12%;

    text-align: left;

    word-break: break-word;

}


/* ============================================================
   TOTAL ROW
   ============================================================ */

.total-row td {

    font-weight: bold;

    background:
        #ffffff;

}


.total-label {

    text-align: right;

    padding-right: 7px !important;

}


/* ============================================================
   NO DATA
   ============================================================ */

.no-data {

    text-align: center;

    padding:
        10px !important;

}


/* ============================================================
   SIGNATURE
   ============================================================ */

.signature-area {

    margin-top: 42px;

    display: flex;

    justify-content: flex-end;

}


.signature {

    width: 180px;

    text-align: center;

}


.signature-line {

    width: 100%;

    border-top:
        0.5px solid #000000;

    margin-bottom: 4px;

}


.signature-text {

    font-family:
        "Times New Roman",
        serif;

    font-size: 10.5px;

}


/* ============================================================
   PRINT RULES
   ============================================================ */

@media print {

    html,
    body {

        width: 100%;

        background: #ffffff;

    }


    .transaction-table {

        page-break-inside:
            auto;

    }


    .transaction-table tr {

        page-break-inside:
            avoid;

        page-break-after:
            auto;

    }


    .transaction-table thead {

        display:
            table-header-group;

    }


    .signature-area {

        page-break-inside:
            avoid;

    }

}

</style>

</head>


<body>


<div class="report">


    <!-- ========================================================
         HEADER
    ========================================================= -->

    <div class="header">


        <div class="shop-name">

            MOUSUMI COMPUTER

        </div>


        <div class="report-title">

            লেনদেনের রিপোর্ট

        </div>


    </div>


    <!-- ========================================================
         DATE
    ========================================================= -->

    <div class="info">


        <div>

            তারিখ:

            ${dateInfo.date}

            ${dateInfo.month}

            ${dateInfo.year}

        </div>


        <div>

            বার:

            ${dateInfo.day}

        </div>


    </div>


    <!-- ========================================================
         TRANSACTION TABLE
    ========================================================= -->

    <table
        class="transaction-table"
    >


        <thead>


            <tr>


                <th class="serial">

                    ক্রমিক

                </th>


                <th class="time">

                    সময়

                </th>


                <th class="customer">

                    কাস্টমার

                </th>


                <th class="type">

                    লেনদেন

                </th>


                <th class="details">

                    বিস্তারিত

                </th>


                <th class="money">

                    টাকা

                </th>


                <th class="comment">

                    মন্তব্য

                </th>


            </tr>


        </thead>


        <tbody>


            ${rowsHTML}


            <!-- ================================================
                 TOTAL
            ================================================= -->


            <tr
                class="total-row"
            >


                <td
                    colspan="5"
                    class="total-label"
                >

                    সর্বমোট:

                </td>


                <td class="money">

                    ${toBnMoney(
                        totalAmount
                    )}

                </td>


                <td class="comment"></td>


            </tr>


        </tbody>


    </table>


    <!-- ========================================================
         SIGNATURE
    ========================================================= -->

    <div class="signature-area">


        <div class="signature">


            <div class="signature-line"></div>


            <div class="signature-text">

                Authorized Signature

            </div>


        </div>


    </div>


</div>


<script>

/*
 * ============================================================
 * PRINT
 * ============================================================
 *
 * Browser-এর native print system ব্যবহার করা হচ্ছে।
 *
 * Chrome:
 *
 * Destination
 *      ↓
 * Save to PDF
 *      ↓
 * Save
 *
 * ============================================================
 */

window.onload = function () {


    setTimeout(
        function () {

            window.focus();

            window.print();

        },
        350
    );

};


window.onafterprint = function () {


    setTimeout(
        function () {

            window.close();

        },
        200
    );

};

</script>


</body>

</html>

        `;


        // ========================================================
        // OPEN PRINT WINDOW
        // ========================================================

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=900,height=900"
            );


        if (
            !printWindow
        ) {

            alert(

                "Print Window খোলা যায়নি।\n\n" +

                "Browser-এর Popup Blocked থাকলে " +

                "এই সাইটের জন্য Popup Allow করুন।"

            );

            return;

        }


        printWindow.document.open();


        printWindow.document.write(
            reportHTML
        );


        printWindow.document.close();

    };


    // ============================================================
    // ৭. REPORT DATA PREPARATION
    // ============================================================

    const prepareReportData = (
        selectedDate
    ) => {


        // ========================================================
        // TRANSACTIONS
        // ========================================================

        const transactions =
            Array.isArray(
                window.customerTransactions
            )
                ? window.customerTransactions
                : [];


        // ========================================================
        // CUSTOMERS
        // ========================================================

        const customers =
            Array.isArray(
                window.customers
            )
                ? window.customers
                : [];


        // ========================================================
        // SELECTED DATE
        // ========================================================

        const selectedTransactions =
            transactions.filter(
                transaction =>

                    String(
                        transaction.date
                    ) ===

                    String(
                        selectedDate
                    )

            );


        if (
            selectedTransactions.length === 0
        ) {

            return null;

        }


        // ========================================================
        // REPORT DATA
        // ========================================================

        const reportData =
            selectedTransactions.map(
                transaction => {


                    // ==================================================
                    // CUSTOMER
                    // ==================================================

                    const customer =
                        customers.find(
                            item =>

                                String(
                                    item.id
                                ) ===

                                String(
                                    transaction.customerId
                                )

                        );


                    // ==================================================
                    // REPORT ITEM
                    // ==================================================
                    //
                    // এখানে description সরাসরি transaction থেকে
                    // নেওয়া হচ্ছে।
                    //
                    // comment থাকলে সেটিও নেওয়া হবে।
                    //
                    // ==================================================

                    return {

                        ...transaction,


                        customerName:

                            customer

                                ? customer.name

                                : "Unknown",


                        description:

                            transaction.description ||

                            "",


                        comment:

                            transaction.comment ||

                            ""

                    };

                }
            );


        return reportData;

    };


    // ============================================================
    // ৮. REPORT UI
    // ============================================================

    const initReportUI = () => {


        const container =
            document.getElementById(
                "cust-reports-section"
            );


        if (
            !container
        ) {

            return;

        }


        // ========================================================
        // REPORT CONTROL
        // ========================================================

        container.innerHTML = `

            <div

                style="

                    width:100%;

                    max-width:500px;

                    margin:0 auto;

                    padding:20px;

                    background:#ffffff;

                    border:1px solid #ddd;

                    font-family:

                        'Tiro Bangla',

                        'Noto Sans Bengali',

                        'Nirmala UI',

                        sans-serif;

                "

            >


                <div

                    style="

                        text-align:center;

                        font-size:20px;

                        font-weight:bold;

                        margin-bottom:18px;

                    "

                >

                    লেনদেনের রিপোর্ট

                </div>


                <label

                    for="rc-date"

                    style="

                        display:block;

                        margin-bottom:7px;

                        font-weight:bold;

                    "

                >

                    তারিখ নির্বাচন করুন:

                </label>


                <input

                    type="date"

                    id="rc-date"

                    style="

                        width:100%;

                        height:42px;

                        padding:8px;

                        border:1px solid #bbb;

                        font-size:14px;

                        margin-bottom:12px;

                    "

                />


                <button

                    type="button"

                    id="rc-btn"

                    style="

                        width:100%;

                        height:44px;

                        border:1px solid #222;

                        background:#222;

                        color:#fff;

                        cursor:pointer;

                        font-size:14px;

                        font-weight:bold;

                        font-family:

                            'Tiro Bangla',

                            'Noto Sans Bengali',

                            'Nirmala UI',

                            sans-serif;

                    "

                >

                    PDF রিপোর্ট তৈরি করুন

                </button>


            </div>

        `;


        // ========================================================
        // TODAY DATE
        // ========================================================

        const dateInput =
            document.getElementById(
                "rc-date"
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
                "0"
            );


        const localDay =
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );


        dateInput.value =
            `${localYear}-${localMonth}-${localDay}`;


        // ========================================================
        // DOWNLOAD / PRINT BUTTON
        // ========================================================

        const downloadButton =
            document.getElementById(
                "rc-btn"
            );


        downloadButton.onclick =
            () => {


                // ==================================================
                // SELECTED DATE
                // ==================================================

                const selectedDate =
                    document.getElementById(
                        "rc-date"
                    ).value;


                if (
                    !selectedDate
                ) {

                    alert(

                        "দয়া করে একটি তারিখ নির্বাচন করুন।"

                    );

                    return;

                }


                // ==================================================
                // PREPARE REPORT
                // ==================================================

                const reportData =
                    prepareReportData(
                        selectedDate
                    );


                if (
                    !reportData ||
                    reportData.length === 0
                ) {

                    alert(

                        "এই তারিখে কোনো লেনদেন নেই!"

                    );

                    return;

                }


                // ==================================================
                // PRINT REPORT
                // ==================================================

                printMousumiReport(

                    reportData,

                    selectedDate

                );

            };

    };


    // ============================================================
    // ৯. INITIALIZE
    // ============================================================

    setTimeout(
        initReportUI,
        1000
    );


})();
