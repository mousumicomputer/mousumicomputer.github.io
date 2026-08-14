/**
 * ============================================================
 * MOUSUMI COMPUTER
 * SIMPLE TRANSACTION REPORT
 *
 * NEW PDF ENGINE
 * ------------------------------------------------------------
 * html2canvas ব্যবহার করা হয়নি।
 * Native Browser Print / Save as PDF ব্যবহার করা হয়েছে।
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
                d => BN_DIGITS[d]
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
            d => BN_DIGITS[d]
        );

    };


    // ============================================================
    // ৩. HTML Escape
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
    // ৪. সময়
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


        let minute =
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


        return (
            toBnSimple(
                String(hour).padStart(
                    2,
                    "0"
                )
            ) +
            ":" +
            toBnSimple(minute) +
            " " +
            ampm
        );

    };


    // ============================================================
    // ৫. তারিখ
    // ============================================================

    const getBanglaDate = (dateString) => {

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
    // ৬. REPORT PRINT ENGINE
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

        let lastBalance = 0;


        // ========================================================
        // TABLE ROWS
        // ========================================================

        let rowsHTML = "";


        reportData.forEach(
            (transaction, index) => {


                const debit =
                    Number(
                        transaction.debit
                    ) || 0;


                const credit =
                    Number(
                        transaction.credit
                    ) || 0;


                const amount =
                    debit > 0
                        ? debit
                        : credit;


                const transactionType =
                    debit > 0
                        ? "বাকী দিলাম"
                        : "বাকী পেলাম";


                const balance =
                    Number(
                        transaction.runningBalanceAtTime
                    ) || 0;


                totalAmount +=
                    Math.abs(amount);


                lastBalance =
                    balance;


                rowsHTML += `

                    <tr>

                        <td class="serial">
                            ${toBnSimple(index + 1)}।
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


                        <td class="money">
                            ${toBnMoney(
                                amount
                            )}
                        </td>


                        <td class="balance">
                            ${toBnMoney(
                                balance
                            )}
                        </td>

                    </tr>

                `;

            }
        );


        // ========================================================
        // REPORT HTML
        // ========================================================

        const reportHTML = `

<!DOCTYPE html>

<html lang="bn">

<head>

<meta charset="UTF-8">

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
        10mm
        10mm
        12mm
        10mm;

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

    background: #ffffff;

    color: #000000;

}


body {

    font-family:
        "Tiro Bangla",
        "Noto Sans Bengali",
        "Nirmala UI",
        sans-serif;

    font-size: 12px;

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

    margin-bottom: 10px;

}


.shop-name {

    font-family:
        "Times New Roman",
        serif;

    font-size: 24px;

    font-weight: bold;

    line-height: 1.2;

    margin: 0;

}


.report-title {

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

    width: 100%;

    margin-bottom: 6px;

    font-size: 12px;

}


/* ============================================================
   TABLE
   ============================================================ */

/*
 * IMPORTANT
 *
 * এখানে কোনো html2canvas নেই।
 *
 * Browser সরাসরি এই border PDF-এ
 * render করবে।
 *
 * 0.5px = চিকন single solid line
 */

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

.transaction-table th,
.transaction-table td {

    border:
        0.5px solid #000000;

    padding:
        4px 5px;

    font-family:
        "Tiro Bangla",
        "Noto Sans Bengali",
        "Nirmala UI",
        sans-serif;

    font-size: 11.5px;

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
   COLUMN WIDTH
   ============================================================ */

.serial {

    width: 10%;

    text-align: center;

}


.time {

    width: 15%;

    text-align: center;

    white-space: nowrap;

}


.customer {

    width: 22%;

    text-align: left;

}


.type {

    width: 18%;

    text-align: center;

}


.money {

    width: 17.5%;

    text-align: right;

    white-space: nowrap;

}


.balance {

    width: 17.5%;

    text-align: right;

    white-space: nowrap;

}


/* ============================================================
   TOTAL
   ============================================================ */

.total-row td {

    font-weight: bold;

    background: #ffffff;

}


.total-label {

    text-align: right;

    padding-right: 7px !important;

}


/* ============================================================
   SIGNATURE
   ============================================================ */

.signature-area {

    margin-top: 45px;

    display: flex;

    justify-content: flex-end;

}


.signature {

    width: 190px;

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

    font-size: 11px;

}


/* ============================================================
   PRINT
   ============================================================ */

@media print {

    html,
    body {

        width: 100%;

        background: #ffffff;

    }


    .transaction-table {

        page-break-inside: auto;

    }


    .transaction-table tr {

        page-break-inside: avoid;

        page-break-after: auto;

    }


    .transaction-table thead {

        display: table-header-group;

    }


    .signature-area {

        page-break-inside: avoid;

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
         TABLE
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


                <th class="money">
                    টাকা
                </th>


                <th class="balance">
                    অবশিষ্ট বাকী
                </th>

            </tr>

        </thead>


        <tbody>

            ${
                rowsHTML ||
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


            <!-- =================================================
                 TOTAL
            ================================================== -->

            <tr class="total-row">


                <td
                    colspan="4"
                    class="total-label"
                >
                    সর্বমোট (Total):
                </td>


                <td class="money">

                    ${toBnMoney(
                        totalAmount
                    )}

                </td>


                <td class="balance">

                    ${toBnMoney(
                        lastBalance
                    )}

                </td>

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
 * Print dialog automatically open হবে।
 *
 * Chrome থেকে:
 *
 * Destination
 *     ↓
 * Save to PDF
 *     ↓
 * Save
 */

window.onload = function () {

    setTimeout(
        function () {

            window.focus();

            window.print();

        },
        300
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
        // NEW WINDOW
        // ========================================================

        const printWindow =
            window.open(
                "",
                "_blank",
                "width=900,height=900"
            );


        if (!printWindow) {

            alert(
                "নতুন Print Window খোলা যায়নি।\n\n" +
                "Browser-এর popup blocked থাকলে Allow করুন।"
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


        const transactions =
            Array.isArray(
                window.customerTransactions
            )
                ? window.customerTransactions
                : [];


        const customers =
            Array.isArray(
                window.customers
            )
                ? window.customers
                : [];


        // --------------------------------------------------------
        // Selected date
        // --------------------------------------------------------

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


        // --------------------------------------------------------
        // Prepare each transaction
        // --------------------------------------------------------

        const reportData =
            selectedTransactions.map(
                transaction => {


                    // --------------------------------------------
                    // Customer
                    // --------------------------------------------

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


                    // --------------------------------------------
                    // Opening balance
                    // --------------------------------------------

                    let balance =
                        Number(
                            customer
                                ? customer.openingBalance
                                : 0
                        ) || 0;


                    // --------------------------------------------
                    // Customer history
                    // --------------------------------------------

                    const history =
                        transactions
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


                                    const aKey =
                                        String(
                                            a.date || ""
                                        ) +
                                        " " +
                                        String(
                                            a.time || ""
                                        );


                                    const bKey =
                                        String(
                                            b.date || ""
                                        ) +
                                        " " +
                                        String(
                                            b.time || ""
                                        );


                                    return aKey.localeCompare(
                                        bKey
                                    );

                                }
                            );


                    // --------------------------------------------
                    // Running balance
                    // --------------------------------------------

                    for (
                        const item
                        of history
                    ) {


                        const debit =
                            Number(
                                item.debit
                            ) || 0;


                        const credit =
                            Number(
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
                                : "Unknown",

                        runningBalanceAtTime:
                            balance

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


        if (!container) {

            return;

        }


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
        // TODAY
        // ========================================================

        const dateInput =
            document.getElementById(
                "rc-date"
            );


        const today =
            new Date();


        dateInput.value =
            today.getFullYear() +
            "-" +
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );


        // ========================================================
        // BUTTON
        // ========================================================

        const button =
            document.getElementById(
                "rc-btn"
            );


        button.addEventListener(
            "click",
            function () {


                const selectedDate =
                    dateInput.value;


                if (!selectedDate) {

                    alert(
                        "দয়া করে একটি তারিখ নির্বাচন করুন।"
                    );

                    return;

                }


                // -----------------------------------------------
                // Prepare
                // -----------------------------------------------

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


                // -----------------------------------------------
                // PRINT
                // -----------------------------------------------

                printMousumiReport(
                    reportData,
                    selectedDate
                );

            }
        );

    };


    // ============================================================
    // ৯. START
    // ============================================================

    setTimeout(
        initReportUI,
        1000
    );


})();
