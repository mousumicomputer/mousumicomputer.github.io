/**
 * ============================================================
 * MOUSUMI COMPUTER
 * Simple Customer Transaction PDF Report
 * ============================================================
 *
 * Features:
 * - Simple accounting-style report
 * - A4 Portrait
 * - Tiro Bangla / Noto Sans Bengali
 * - Bengali numbers
 * - Bengali date
 * - Customer transaction data
 * - Running balance
 * - Thin single-line table
 * - Total row
 * - Authorized Signature
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
    // ২. টাকা বাংলা ফরম্যাট
    // ============================================================

    const toBnMoney = (value) => {

        const number = Number(value);

        if (
            !Number.isFinite(number)
        ) {
            return "০.০০";
        }


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
            toBnSimple(hourText) +
            ":" +
            toBnSimple(minute) +
            " " +
            ampm
        );

    };


    // ============================================================
    // ৫. বাংলা তারিখ
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
    // ৬. PDF REPORT
    // ============================================================

    const generateMousumiReport = async (
        reportData,
        selectedDate
    ) => {


        // --------------------------------------------------------
        // html2pdf check
        // --------------------------------------------------------

        if (
            typeof html2pdf !== "function"
        ) {

            alert(
                "PDF তৈরির লাইব্রেরি পাওয়া যায়নি।\n\n" +
                "html2pdf.js সঠিকভাবে লোড হয়েছে কিনা পরীক্ষা করুন।"
            );

            return;

        }


        // --------------------------------------------------------
        // Date
        // --------------------------------------------------------

        const dateInfo =
            getBanglaDate(
                selectedDate
            );


        // --------------------------------------------------------
        // Total
        // --------------------------------------------------------

        let totalAmount = 0;

        let lastBalance = 0;


        // --------------------------------------------------------
        // Table rows
        // --------------------------------------------------------

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


                /*
                 * Debit = বাকী দিলাম
                 * Credit = বাকী পেলাম
                 */

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

                        <td class="col-serial">
                            ${toBnSimple(index + 1)}।
                        </td>


                        <td class="col-time">
                            ${formatTime(
                                transaction.time
                            )}
                        </td>


                        <td class="col-customer">
                            ${escapeHTML(
                                transaction.customerName
                            )}
                        </td>


                        <td class="col-type">
                            ${escapeHTML(
                                transactionType
                            )}
                        </td>


                        <td class="col-money">
                            ${toBnMoney(
                                amount
                            )}
                        </td>


                        <td class="col-balance">
                            ${toBnMoney(
                                balance
                            )}
                        </td>

                    </tr>

                `;

            }
        );


        // --------------------------------------------------------
        // No transaction
        // --------------------------------------------------------

        if (
            !rowsHTML
        ) {

            rowsHTML = `

                <tr>

                    <td
                        colspan="6"
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

            <div class="mousumi-report">


                <!-- =================================================
                     HEADER
                ================================================== -->

                <div class="report-header">

                    <div class="shop-name">
                        MOUSUMI COMPUTER
                    </div>


                    <div class="report-title">
                        লেনদেনের রিপোর্ট
                    </div>

                </div>


                <!-- =================================================
                     DATE
                ================================================== -->

                <div class="report-info">

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


                <!-- =================================================
                     TABLE
                ================================================== -->

                <table class="transaction-table">


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

                        ${rowsHTML}


                        <!-- =========================================
                             TOTAL
                        ========================================== -->

                        <tr class="total-row">


                            <td
                                colspan="4"
                                class="total-label"
                            >
                                সর্বমোট (Total):
                            </td>


                            <td class="col-money total-value">
                                ${toBnMoney(
                                    totalAmount
                                )}
                            </td>


                            <td class="col-balance total-value">
                                ${toBnMoney(
                                    lastBalance
                                )}
                            </td>

                        </tr>

                    </tbody>


                </table>


                <!-- =================================================
                     SIGNATURE
                ================================================== -->

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


        // ========================================================
        // CSS
        // ========================================================

        const reportCSS = `

            <style>

                /*
                 * =================================================
                 * A4 REPORT
                 * =================================================
                 */

                @page {

                    size: A4 portrait;

                    margin: 10mm;

                }


                * {

                    box-sizing: border-box;

                }


                html,
                body {

                    margin: 0;

                    padding: 0;

                    background: #ffffff;

                }


                body {

                    font-family:
                        "Tiro Bangla",
                        "Noto Sans Bengali",
                        "Nirmala UI",
                        sans-serif;

                    color: #000000;

                }


                /*
                 * =================================================
                 * MAIN REPORT
                 * =================================================
                 */

                .mousumi-report {

                    width: 700px;

                    margin: 0 auto;

                    padding: 12px;

                    background: #ffffff;

                    color: #000000;

                    font-family:
                        "Tiro Bangla",
                        "Noto Sans Bengali",
                        "Nirmala UI",
                        sans-serif;

                    font-size: 13px;

                    line-height: 1.35;

                }


                /*
                 * =================================================
                 * HEADER
                 * =================================================
                 */

                .report-header {

                    text-align: center;

                    margin-bottom: 14px;

                }


                .shop-name {

                    font-family:
                        "Times New Roman",
                        serif;

                    font-size: 25px;

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

                    font-size: 17px;

                    font-weight: normal;

                    margin-top: 3px;

                }


                /*
                 * =================================================
                 * DATE INFORMATION
                 * =================================================
                 */

                .report-info {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    font-family:
                        "Tiro Bangla",
                        "Noto Sans Bengali",
                        "Nirmala UI",
                        sans-serif;

                    font-size: 13px;

                    font-weight: normal;

                    margin-bottom: 7px;

                    padding-bottom: 5px;

                }


                /*
                 * =================================================
                 * TABLE
                 *
                 * খুব পাতলা সাধারণ রিপোর্ট বর্ডার
                 * =================================================
                 */

                .transaction-table {

                    width: 100%;

                    border-collapse: collapse;

                    border-spacing: 0;

                    table-layout: fixed;

                    margin: 0;

                    padding: 0;

                    background: #ffffff;

                }


                /*
                 * IMPORTANT:
                 *
                 * 0.35px ব্যবহার করা হয়েছে।
                 * html2canvas-এর raster rendering-এ
                 * এটি সাধারণ ১px-এর চেয়ে অনেক পাতলা
                 * দেখাবে।
                 */

                .transaction-table th,
                .transaction-table td {

                    border:
                        0.35px solid #000000;

                    padding:
                        5px 5px;

                    font-family:
                        "Tiro Bangla",
                        "Noto Sans Bengali",
                        "Nirmala UI",
                        sans-serif;

                    font-size: 12px;

                    line-height: 1.25;

                    color: #000000;

                    vertical-align: middle;

                    background: #ffffff;

                }


                /*
                 * =================================================
                 * HEADER CELLS
                 * =================================================
                 */

                .transaction-table th {

                    font-weight: bold;

                    text-align: center;

                    white-space: nowrap;

                    background: #f7f7f7;

                }


                /*
                 * =================================================
                 * COLUMN WIDTH
                 * =================================================
                 */

                .col-serial {

                    width: 10%;

                    text-align: center;

                }


                .col-time {

                    width: 15%;

                    text-align: center;

                    white-space: nowrap;

                }


                .col-customer {

                    width: 22%;

                    text-align: left;

                    word-break: break-word;

                }


                .col-type {

                    width: 18%;

                    text-align: center;

                    word-break: break-word;

                }


                .col-money {

                    width: 17.5%;

                    text-align: right;

                    white-space: nowrap;

                }


                .col-balance {

                    width: 17.5%;

                    text-align: right;

                    white-space: nowrap;

                }


                /*
                 * =================================================
                 * TOTAL
                 * =================================================
                 */

                .total-row td {

                    font-weight: bold;

                    background: #ffffff;

                }


                .total-label {

                    text-align: right;

                    padding-right: 7px !important;

                }


                .total-value {

                    text-align: right;

                    white-space: nowrap;

                }


                /*
                 * =================================================
                 * NO DATA
                 * =================================================
                 */

                .no-data {

                    text-align: center;

                    padding: 12px !important;

                }


                /*
                 * =================================================
                 * SIGNATURE
                 * =================================================
                 */

                .signature-area {

                    display: flex;

                    justify-content: flex-end;

                    margin-top: 45px;

                }


                .signature-box {

                    width: 190px;

                    text-align: center;

                    font-family:
                        "Times New Roman",
                        serif;

                }


                .signature-line {

                    width: 100%;

                    border-top:
                        0.35px solid #000000;

                    margin-bottom: 4px;

                }


                .signature-text {

                    font-size: 12px;

                }


                /*
                 * =================================================
                 * PRINT
                 * =================================================
                 */

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


            </style>

        `;


        // ========================================================
        // TEMPORARY CONTAINER
        // ========================================================

        const container =
            document.createElement(
                "div"
            );


        container.style.position =
            "fixed";


        container.style.left =
            "-10000px";


        container.style.top =
            "0";


        container.style.width =
            "720px";


        container.style.background =
            "#ffffff";


        container.style.padding =
            "0";


        container.style.margin =
            "0";


        container.style.zIndex =
            "999999";


        container.style.visibility =
            "visible";


        container.style.opacity =
            "1";


        container.innerHTML =
            reportCSS +
            reportHTML;


        document.body.appendChild(
            container
        );


        // ========================================================
        // REPORT ELEMENT
        // ========================================================

        const reportElement =
            container.querySelector(
                ".mousumi-report"
            );


        if (
            !reportElement
        ) {

            container.remove();

            alert(
                "রিপোর্ট তৈরি করা যায়নি।"
            );

            return;

        }


        // ========================================================
        // FONT LOAD
        // ========================================================

        try {

            if (
                document.fonts &&
                document.fonts.ready
            ) {

                await document.fonts.ready;

            }

        } catch (error) {

            console.warn(
                "Font loading warning:",
                error
            );

        }


        // ========================================================
        // RENDER WAIT
        // ========================================================

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    250
                )
        );


        // ========================================================
        // PDF OPTIONS
        // ========================================================

        const pdfOptions = {

            margin: [
                8,
                8,
                8,
                8
            ],


            filename:
                `Mousumi_Computer_Report_${selectedDate}.pdf`,


            image: {

                type: "jpeg",

                quality: 0.98

            },


            html2canvas: {

                /*
                 * আগের 3 নয়।
                 *
                 * scale 1 রাখা হয়েছে যাতে
                 * পাতলা border অতিরিক্ত বড়
                 * rasterize না হয়।
                 */

                scale: 1,

                useCORS: true,

                allowTaint: false,

                backgroundColor:
                    "#ffffff",

                logging: false,

                letterRendering: true,

                imageTimeout: 15000,

                scrollX: 0,

                scrollY: 0

            },


            jsPDF: {

                unit: "mm",

                format: "a4",

                orientation: "portrait",

                compress: true

            },


            pagebreak: {

                mode: [
                    "css",
                    "legacy"
                ]

            }

        };


        // ========================================================
        // CREATE PDF
        // ========================================================

        try {

            await html2pdf()

                .set(
                    pdfOptions
                )

                .from(
                    reportElement
                )

                .save();

        } catch (error) {

            console.error(
                "Mousumi Report PDF Error:",
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

            if (
                container &&
                container.parentNode
            ) {

                container.parentNode.removeChild(
                    container
                );

            }

        }

    };


    // ============================================================
    // ৭. REPORT UI
    // ============================================================

    const initReportUI = () => {


        const container =
            document.getElementById(
                "cust-reports-section"
            );


        if (!container) {

            return;

        }


        // ========================================================
        // SIMPLE UI
        // ========================================================

        container.innerHTML = `

            <div
                style="
                    background:#ffffff;
                    padding:20px;
                    max-width:500px;
                    margin:0 auto;
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
                        font-size:20px;
                        font-weight:bold;
                        text-align:center;
                        margin-bottom:18px;
                    "
                >
                    রিপোর্ট ডাউনলোড
                </div>


                <div
                    style="
                        display:flex;
                        flex-direction:column;
                        gap:10px;
                    "
                >

                    <label
                        for="rc-date"
                        style="
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
                            padding:10px;
                            border:1px solid #bbb;
                            font-family:
                                'Tiro Bangla',
                                'Noto Sans Bengali',
                                'Nirmala UI',
                                sans-serif;
                        "
                    />


                    <button
                        id="rc-btn"
                        type="button"
                        style="
                            width:100%;
                            padding:11px;
                            border:1px solid #333;
                            background:#ffffff;
                            color:#000000;
                            cursor:pointer;
                            font-weight:bold;
                            font-family:
                                'Tiro Bangla',
                                'Noto Sans Bengali',
                                'Nirmala UI',
                                sans-serif;
                        "
                    >
                        PDF ডাউনলোড
                    </button>

                </div>

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


        const year =
            today.getFullYear();


        const month =
            String(
                today.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                today.getDate()
            ).padStart(
                2,
                "0"
            );


        dateInput.value =
            `${year}-${month}-${day}`;


        // ========================================================
        // DOWNLOAD
        // ========================================================

        const button =
            document.getElementById(
                "rc-btn"
            );


        button.addEventListener(
            "click",
            async () => {


                const selectedDate =
                    dateInput.value;


                if (
                    !selectedDate
                ) {

                    alert(
                        "দয়া করে একটি তারিখ নির্বাচন করুন।"
                    );

                    return;

                }


                // ==================================================
                // TRANSACTIONS
                // ==================================================

                const transactions =
                    Array.isArray(
                        window.customerTransactions
                    )
                        ? window.customerTransactions
                        : [];


                // ==================================================
                // CUSTOMERS
                // ==================================================

                const customers =
                    Array.isArray(
                        window.customers
                    )
                        ? window.customers
                        : [];


                // ==================================================
                // FILTER DATE
                // ==================================================

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

                    alert(
                        "এই তারিখে কোনো লেনদেন নেই!"
                    );

                    return;

                }


                // ==================================================
                // PREPARE REPORT DATA
                // ==================================================

                const reportData =
                    selectedTransactions.map(
                        transaction => {


                            // --------------------------------------
                            // Customer
                            // --------------------------------------

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


                            // --------------------------------------
                            // Opening Balance
                            // --------------------------------------

                            let balance =
                                Number(
                                    customer
                                        ? customer.openingBalance
                                        : 0
                                ) || 0;


                            // --------------------------------------
                            // Customer history
                            // --------------------------------------

                            const customerHistory =
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


                                            const aDate =
                                                String(
                                                    a.date || ""
                                                );


                                            const bDate =
                                                String(
                                                    b.date || ""
                                                );


                                            const aTime =
                                                String(
                                                    a.time || ""
                                                );


                                            const bTime =
                                                String(
                                                    b.time || ""
                                                );


                                            const first =
                                                aDate +
                                                " " +
                                                aTime;


                                            const second =
                                                bDate +
                                                " " +
                                                bTime;


                                            return first.localeCompare(
                                                second
                                            );

                                        }
                                    );


                            // --------------------------------------
                            // Running Balance
                            // --------------------------------------

                            for (
                                const historyItem
                                of customerHistory
                            ) {


                                const debit =
                                    Number(
                                        historyItem.debit
                                    ) || 0;


                                const credit =
                                    Number(
                                        historyItem.credit
                                    ) || 0;


                                balance +=
                                    debit -
                                    credit;


                                if (
                                    String(
                                        historyItem.id
                                    ) ===
                                    String(
                                        transaction.id
                                    )
                                ) {

                                    break;

                                }

                            }


                            // --------------------------------------
                            // Report Item
                            // --------------------------------------

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


                // ==================================================
                // GENERATE
                // ==================================================

                await generateMousumiReport(
                    reportData,
                    selectedDate
                );

            }
        );

    };


    // ============================================================
    // ৮. START
    // ============================================================

    setTimeout(
        initReportUI,
        1000
    );


})();
