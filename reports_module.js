--- START OF FILE reports_module.js ---

/**
 * Mousumi Computer - Professional Document Engine
 * PDF Design + Tiro Bangla Font + বিবরণ Column
 * 
 * ১নং নমুনা ছবির ডিজাইন ও ফন্ট অনুসরণ করা হয়েছে।
 * হিসাবের মূল Logic আপনার আগের কোডের মতোই অপরিবর্তিত রাখা হয়েছে।
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
        // PDF HTML (Design Matched to Image 1)
        // =========================================================

        const elementHTML = `
        <div class="mousumi-pdf-page">

            <div class="main-header">
                <h1 class="tiro-font">MOUSUMI COMPUTER</h1>
                <h2 class="tiro-font">লেনদেন এর তালিকা</h2>
            </div>

            <div class="date-bar">
                <div class="tiro-font">
                    তারিখ:
                    ${startParts.date}
                    ${startParts.month}
                    ${startParts.year}
                </div>

                <div class="tiro-font">
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
                        <td colspan="5" class="total-label tiro-font">
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
        // CSS (Exact Layout Match Image 1)
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
                padding: 45px 55px;
                background: #ffffff;
                color: #000000;
                font-family: 'Tiro Bangla', serif !important;
                -webkit-font-smoothing: antialiased;
            }

            .tiro-font {
                font-family: 'Tiro Bangla', serif !important;
            }

            .main-header {
                width: 100%;
                text-align: center;
                margin-bottom: 25px;
            }

            .main-header h1 {
                margin: 0;
                padding: 0;
                font-family: 'Tiro Bangla', serif !important;
                font-size: 34px;
                font-weight: 700;
                letter-spacing: 0.5px;
                color: #000;
                text-transform: uppercase;
            }

            .main-header h2 {
                margin: 4px 0 0 0;
                font-family: 'Tiro Bangla', serif !important;
                font-size: 18px;
                font-weight: 700;
                color: #000;
            }

            .date-bar {
                width: 100%;
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                font-weight: 700;
                margin-bottom: 12px;
                color: #000;
            }

            .transaction-table {
                width: 100%;
                border-collapse: collapse;
                border: 1px solid #000;
                table-layout: fixed;
            }

            .transaction-table th,
            .transaction-table td {
                border: 1px solid #000;
                font-size: 13.5px;
                line-height: 1.25;
                vertical-align: middle;
                padding: 8px 6px;
                color: #000;
            }

            .transaction-table th {
                background: #f4f4f4;
                font-weight: 700;
                text-align: center;
                border-bottom: 1.5px solid #000;
            }

            .col-no, .col-time, .col-type {
                text-align: center;
            }

            .col-customer, .col-description {
                text-align: left;
                padding-left: 10px;
            }

            .col-money, .col-balance {
                text-align: right;
                padding-right: 12px;
            }

            .total-row td {
                font-weight: 700 !important;
                height: 38px;
            }

            .total-label {
                text-align: right !important;
                padding-right: 15px !important;
            }

            .sig-container {
                width: 100%;
                display: flex;
                justify-content: flex-end;
                margin-top: 100px;
            }

            .sig-box {
                width: 250px;
                border-top: 1px solid #000;
                text-align: center;
                font-family: Arial, sans-serif;
                font-size: 13px;
                padding-top: 6px;
            }
        `;


        // =========================================================
        // FONT + REAL DOM RENDER
        // =========================================================

        let renderHost = null;

        try {

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
                    'https://fonts.googleapis.com/css2?family=Tiro+Bangla&display=swap';

                document.head.appendChild(
                    tiroLink
                );
            }


            if (document.fonts) {
                await document.fonts.load("16px 'Tiro Bangla'");
                await document.fonts.ready;
            }


            renderHost =
                document.createElement('div');

            renderHost.id =
                'mousumi-pdf-render-host';

            renderHost.style.position =
                'fixed';

            renderHost.style.left =
                '-10000px';

            renderHost.innerHTML = `
                <style>${css}</style>
                ${elementHTML}
            `;

            document.body.appendChild(
                renderHost
            );

            await new Promise(
                resolve =>
                    requestAnimationFrame(
                        () =>
                            requestAnimationFrame(
                                resolve
                            )
                    )
            );


            // =========================================================
            // PDF options (Higher Scale for Image 1 Clarity)
            // =========================================================

            const opt = {

                margin: 0,

                filename:
                    `Mousumi_Report_${startDate}.pdf`,

                image: {
                    type: 'jpeg',
                    quality: 1.0
                },

                html2canvas: {
                    scale: 3.5,
                    useCORS: true,
                    letterRendering: true,
                    backgroundColor: '#ffffff'
                },

                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                    compress: true
                }
            };


            await html2pdf()
                .set(opt)
                .from(
                    renderHost.querySelector(
                        '.mousumi-pdf-page'
                    )
                )
                .save();

        } finally {

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
                box-shadow: 0 4px 20px rgba(0,0,0,0.05);
            "
        >

            <h3 style="margin-top:0;">Download Report</h3>

            <div style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">
                    তারিখ নির্বাচন করুন
                </label>

                <input
                    type="date"
                    id="rc-start"
                    style="width:100%; padding:10px; border:1px solid #ccc; border-radius:8px;"
                >
            </div>

            <button
                id="rc-download-btn"
                style="background:#000; color:#fff; border:none; padding:12px 25px; border-radius:8px; font-weight:700; cursor:pointer; width:100%;"
            >
                Generate PDF Report
            </button>

        </div>
        `;


        document.getElementById(
            'rc-start'
        ).value =
            new Date()
                .toISOString()
                .split('T')[0];


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


            await generateMousumiPDF(
                reportData,
                start
            );

        };

    };


    setTimeout(
        initReportUI,
        1500
    );

})();
