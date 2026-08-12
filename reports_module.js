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
    // নিরাপদ HTML TEXT
    // =========================================================

    const escapeHTML = (value) => {

        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\"/g, '&quot;')
            .replace(/'/g, '&#039;');
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
        async (reportData, startDate) => {

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
                parseFloat(t.debit) > 0
                    ? "বাকী দিলাম"
                    : "বাকী পেলাম";


            // =================================================
            // বিবরণ
            // =================================================

            const description =
                String(
                    t.description ??
                    t.details ??
                    t.note ??
                    t.remark ??
                    ""
                ).trim();


            verticalSumTaka += amount;
            verticalSumRemaining += balance;


            // =================================================
            // TABLE ROW
            // =================================================

            tableRows += `
                <tr>
                    <td class="col-no">${toBnSimple(index + 1)}।</td>

                    <td class="col-time">
                        ${escapeHTML(format12h(t.time))}
                    </td>

                    <td class="col-customer">
                        ${escapeHTML(t.customerName || "Unknown")}
                    </td>

                    <td class="col-type">
                        ${escapeHTML(type)}
                    </td>

                    <td class="col-description">
                        ${escapeHTML(description || "—")}
                    </td>

                    <td class="col-money">
                        ${toBn(amount)}
                    </td>

                    <td class="col-balance">
                        ${toBn(balance)}
                    </td>
                </tr>
            `;
        });


        // =========================================================
        // PDF HTML
        // =========================================================

        const elementHTML = `
        <div class="mousumi-pdf-page">

            <div class="main-header">
                <h1>MOUSUMI COMPUTER</h1>
                <h2>লেনদেন এর তালিকা</h2>
            </div>

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

            <table class="transaction-table">
                <colgroup>
                    <col style="width:7%">
                    <col style="width:11%">
                    <col style="width:17%">
                    <col style="width:14%">
                    <col style="width:20%">
                    <col style="width:14%">
                    <col style="width:17%">
                </colgroup>

                <thead>
                    <tr>
                        <th>ক্রমিক</th>
                        <th>সময়</th>
                        <th>কাস্টমার</th>
                        <th>লেনদেন</th>
                        <th>বিবরণ</th>
                        <th>টাকা</th>
                        <th>অবশিষ্ট বাকী</th>
                    </tr>
                </thead>

                <tbody>
                    ${tableRows}

                    <tr class="total-row">
                        <td colspan="5" class="total-label">
                            সর্বমোট (Total):
                        </td>

                        <td class="col-money total-number">
                            ${toBn(verticalSumTaka)}
                        </td>

                        <td class="col-balance total-number">
                            ${toBn(verticalSumRemaining)}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="sig-container">
                <div class="sig-box">
                    Authorized Signature
                </div>
            </div>

        </div>
        `;


        // =========================================================
        // CSS
        // =========================================================

        const css = `
            @page {
                size: A4 portrait;
                margin: 0;
            }

            * {
                box-sizing: border-box;
            }

            html,
            body {
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
            }

            .mousumi-pdf-page {
                width: 794px;
                min-height: 1123px;
                box-sizing: border-box;
                padding: 25px 52px 0 52px;
                background: #ffffff;
                color: #000000;
                font-family: 'Tiro Bangla', serif !important;
                overflow: hidden;
            }

            .main-header {
                width: 100%;
                text-align: center;
                margin: 0 0 23px 0;
                padding: 0;
            }

            .main-header h1 {
                margin: 0;
                padding: 0;
                font-family: Arial, 'Helvetica Neue', sans-serif !important;
                font-size: 29px;
                line-height: 1.08;
                font-weight: 700;
                letter-spacing: 0.7px;
                color: #000;
            }

            .main-header h2 {
                margin: 4px 0 0 0;
                padding: 0;
                font-family: 'Tiro Bangla', serif !important;
                font-size: 14px;
                line-height: 1.25;
                font-weight: 700;
                color: #000;
            }

            .date-bar {
                width: 100%;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin: 0 0 17px 0;
                padding: 0;
                font-family: 'Tiro Bangla', serif !important;
                font-size: 10px;
                line-height: 1.25;
                font-weight: 700;
                color: #000;
            }

            .transaction-table {
                width: 100%;
                margin: 0;
                padding: 0;
                border-collapse: collapse;
                border-spacing: 0;
                table-layout: fixed;
                border: 1px solid #111;
                font-family: 'Tiro Bangla', serif !important;
                color: #000;
            }

            .transaction-table th,
            .transaction-table td {
                border: 1px solid #111;
                box-sizing: border-box;
                font-family: 'Tiro Bangla', serif !important;
                font-size: 9.4px;
                line-height: 1.25;
                vertical-align: middle;
                padding: 5px 5px;
            }

            .transaction-table th {
                height: 30px;
                padding: 4px 3px;
                background: #f3f3f3;
                text-align: center;
                font-weight: 700;
                white-space: nowrap;
            }

            .transaction-table td {
                min-height: 28px;
                font-weight: 400;
                white-space: normal;
                overflow-wrap: break-word;
                word-break: normal;
            }

            .transaction-table .col-no {
                text-align: center;
                padding-left: 2px;
                padding-right: 2px;
            }

            .transaction-table .col-time {
                text-align: center;
                direction: ltr;
                white-space: nowrap;
                padding-left: 2px;
                padding-right: 2px;
                font-family: 'Tiro Bangla', serif !important;
            }

            .transaction-table .col-customer {
                text-align: left;
                padding-left: 7px;
                padding-right: 5px;
            }

            .transaction-table .col-type {
                text-align: center;
                padding-left: 3px;
                padding-right: 3px;
            }

            .transaction-table .col-description {
                text-align: left;
                padding-left: 7px;
                padding-right: 5px;
                white-space: normal;
                overflow-wrap: break-word;
                word-break: normal;
            }

            .transaction-table .col-money,
            .transaction-table .col-balance {
                text-align: right;
                padding-left: 4px;
                padding-right: 7px;
                white-space: nowrap;
            }

            .transaction-table tr {
                page-break-inside: avoid;
                break-inside: avoid;
            }

            .total-row td {
                height: 29px;
                background: #fff;
                font-weight: 700 !important;
            }

            .total-label {
                text-align: right !important;
                padding-right: 9px !important;
                white-space: nowrap;
            }

            .total-number {
                font-weight: 700 !important;
            }

            .sig-container {
                width: 100%;
                display: flex;
                justify-content: flex-end;
                margin-top: 68px;
                padding: 0;
            }

            .sig-box {
                width: 235px;
                padding-top: 5px;
                border-top: 1px solid #111;
                text-align: center;
                font-family: Arial, 'Helvetica Neue', sans-serif !important;
                font-size: 10px;
                line-height: 1.2;
                font-weight: 400;
            }
        `;


        // =========================================================
        // FONT + REAL DOM RENDER
        // =========================================================

        let renderHost = null;

        try {

            // -----------------------------------------------------
            // মূল document-এ Tiro Bangla font load করানো
            // -----------------------------------------------------

            let tiroLink =
                document.getElementById(
                    'mousumi-tiro-bangla-font'
                );

            if (!tiroLink) {

                tiroLink =
                    document.createElement('link');

                tiroLink.id =
                    'mousumi-tiro-bangla-font';

                tiroLink.rel =
                    'stylesheet';

                tiroLink.href =
                    'https://fonts.googleapis.com/css2?family=Tiro+Bangla:ital@0;1&display=swap';

                document.head.appendChild(
                    tiroLink
                );
            }


            if (document.fonts) {

                await document.fonts.load(
                    "16px 'Tiro Bangla'"
                );

                await document.fonts.ready;

            }


            // -----------------------------------------------------
            // বাস্তব DOM element
            //
            // display:none / visibility:hidden ব্যবহার করা হয়নি।
            // html2canvas যেন element দেখতে পারে।
            // -----------------------------------------------------

            renderHost =
                document.createElement('div');

            renderHost.id =
                'mousumi-pdf-render-host';

            renderHost.style.position =
                'fixed';

            renderHost.style.left =
                '0px';

            renderHost.style.top =
                '0px';

            renderHost.style.width =
                '794px';

            renderHost.style.minHeight =
                '1123px';

            renderHost.style.background =
                '#ffffff';

            renderHost.style.zIndex =
                '2147483647';

            renderHost.style.margin =
                '0';

            renderHost.style.padding =
                '0';

            renderHost.innerHTML = `
                <style>${css}</style>
                ${elementHTML}
            `;

            document.body.appendChild(
                renderHost
            );


            // -----------------------------------------------------
            // Font rendering নিশ্চিত করা
            // -----------------------------------------------------

            if (document.fonts) {

                await document.fonts.load(
                    "16px 'Tiro Bangla'"
                );

                await document.fonts.ready;

            }

            await new Promise(
                resolve =>
                    requestAnimationFrame(
                        () =>
                            requestAnimationFrame(
                                resolve
                            )
                    )
            );


            // -----------------------------------------------------
            // PDF options
            // -----------------------------------------------------

            const opt = {

                margin: 0,

                filename:
                    `Mousumi_Report_${startDate}.pdf`,

                image: {
                    type: 'jpeg',
                    quality: 0.98
                },

                html2canvas: {
                    scale: 2.5,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff',
                    letterRendering: true,
                    logging: false,
                    width: 794,
                    windowWidth: 794
                },

                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                },

                pagebreak: {
                    mode: ['css', 'legacy']
                }
            };


            // -----------------------------------------------------
            // PDF তৈরি
            // -----------------------------------------------------

            await html2pdf()
                .set(opt)
                .from(
                    renderHost.querySelector(
                        '.mousumi-pdf-page'
                    )
                )
                .save();

        } catch (error) {

            console.error(
                'Mousumi PDF generation error:',
                error
            );

            alert(
                'PDF তৈরি করা যায়নি। Browser Console-এ Error দেখুন।'
            );

        } finally {

            // -----------------------------------------------------
            // Temporary DOM পরিষ্কার
            // -----------------------------------------------------

            if (
                renderHost &&
                renderHost.parentNode
            ) {

                renderHost.parentNode.removeChild(
                    renderHost
                );

            }

        }

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
        ).onclick = async () => {


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

            await generateMousumiPDF(
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
