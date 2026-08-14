/**
 * Mousumi Computer - Professional Document Engine
 * Fixed: White PDF Issue, A4 Alignment, Tiro Bangla Font & Thin Borders
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

        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12 || 12;

        const hourText = String(hours).padStart(2, '0');

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
            day: days[dateObj.getDay()],
            date: toBnSimple(dateObj.getDate()),
            month: months[dateObj.getMonth()],
            year: toBnSimple(dateObj.getFullYear())
        };
    };


    // =========================================================
    // ৬. PDF GENERATION ENGINE
    // =========================================================

    const generateMousumiPDF = async (
        reportData,
        startDate
    ) => {

        // -----------------------------------------------------
        // html2pdf আছে কিনা পরীক্ষা
        // -----------------------------------------------------

        if (typeof html2pdf !== 'function') {

            alert(
                "PDF তৈরি করার লাইব্রেরি পাওয়া যাচ্ছে না।\n\n" +
                "দয়া করে html2pdf.js সঠিকভাবে লোড হয়েছে কিনা পরীক্ষা করুন।"
            );

            return;
        }


        // -----------------------------------------------------
        // তারিখ
        // -----------------------------------------------------

        const dateObject =
            new Date(startDate + "T00:00:00");

        const startParts =
            getBnDate(dateObject);


        // -----------------------------------------------------
        // রিপোর্ট ডাটা
        // -----------------------------------------------------

        let tableRows = '';

        let totalMoney = 0;

        let totalBalance = 0;


        reportData.forEach((t, index) => {

            const debit =
                parseFloat(t.debit) || 0;

            const credit =
                parseFloat(t.credit) || 0;

            const amount =
                debit > 0 ? debit : credit;

            const balance =
                parseFloat(
                    t.runningBalanceAtTime
                ) || 0;


            const type =
                debit > 0
                    ? "বাকী দিলাম"
                    : "বাকী পেলাম";


            totalMoney += Math.abs(amount);

            totalBalance = balance;


            tableRows += `
                <tr>

                    <td class="serial">
                        ${toBnSimple(index + 1)}।
                    </td>

                    <td class="time">
                        ${format12hBn(t.time)}
                    </td>

                    <td class="customer">
                        ${escapeHTML(t.customerName)}
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
        });


        // =====================================================
        // REPORT HTML
        // =====================================================

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


                <!-- DATE BAR -->

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

                            <th style="width:10%;">
                                ক্রমিক
                            </th>

                            <th style="width:15%;">
                                সময়
                            </th>

                            <th style="width:22%;">
                                কাস্টমার
                            </th>

                            <th style="width:18%;">
                                লেনদেন
                            </th>

                            <th style="width:17%;">
                                টাকা
                            </th>

                            <th style="width:18%;">
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
                                    style="text-align:center;"
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
                                style="text-align:right;"
                            >
                                সর্বমোট (Total):
                            </td>

                            <td
                                style="text-align:right;"
                            >
                                ${toBn(totalMoney)}
                            </td>

                            <td
                                style="text-align:right;"
                            >
                                ${toBn(totalBalance)}
                            </td>

                        </tr>

                    </tbody>

                </table>


                <!-- SIGNATURE -->

                <div class="footer-signature">

                    <div class="sig-box">

                        <div class="sig-line"></div>

                        <div>
                            Authorized Signature
                        </div>

                    </div>

                </div>

            </div>

        `;


        // =====================================================
        // REPORT CSS
        // =====================================================

        const style = `

            <style>

                /*
                 * ==================================================
                 * MAIN REPORT
                 * ==================================================
                 */

                .mousumi-report {

                    width: 700px;

                    box-sizing: border-box;

                    margin: 0 auto;

                    background: #ffffff;

                    padding: 25px;

                    color: #000000;

                    font-family:
                        'Tiro Bangla',
                        'Noto Sans Bengali',
                        'Nirmala UI',
                        Arial,
                        sans-serif;

                    font-size: 13px;

                    line-height: 1.5;

                }


                /*
                 * ==================================================
                 * HEADER
                 * ==================================================
                 */

                .header {

                    text-align: center;

                    margin-bottom: 22px;

                }


                .header h1 {

                    font-family:
                        'Times New Roman',
                        serif;

                    font-size: 30px;

                    margin: 0;

                    padding: 0;

                    font-weight: bold;

                    letter-spacing: 1px;

                    color: #000000;

                }


                .header h2 {

                    font-family:
                        'Tiro Bangla',
                        'Noto Sans Bengali',
                        'Nirmala UI',
                        sans-serif;

                    font-size: 18px;

                    margin: 5px 0 0 0;

                    padding: 0;

                    font-weight: normal;

                    color: #000000;

                }


                /*
                 * ==================================================
                 * DATE BAR
                 * ==================================================
                 */

                .date-bar {

                    display: flex;

                    justify-content: space-between;

                    align-items: center;

                    font-family:
                        'Tiro Bangla',
                        'Noto Sans Bengali',
                        'Nirmala UI',
                        sans-serif;

                    font-weight: bold;

                    font-size: 14px;

                    margin-bottom: 10px;

                    border-bottom:
                        0.5px solid #dddddd;

                    padding-bottom: 7px;

                }


                /*
                 * ==================================================
                 * TABLE
                 * ==================================================
                 *
                 * এখানে ইচ্ছাকৃতভাবে 0.5px ব্যবহার করা হয়েছে।
                 *
                 * html2canvas-এর কারণে 0.5pt তুলনামূলক মোটা
                 * দেখা যাচ্ছিল।
                 *
                 * ==================================================
                 */

                table {

                    width: 100%;

                    border-collapse: collapse;

                    border:
                        0.5px solid #000000;

                    table-layout: fixed;

                    background: #ffffff;

                }


                th,
                td {

                    border:
                        0.5px solid #000000;

                    padding: 8px 6px;

                    font-family:
                        'Tiro Bangla',
                        'Noto Sans Bengali',
                        'Nirmala UI',
                        sans-serif;

                    font-size: 13px;

                    line-height: 1.45;

                    vertical-align: middle;

                    color: #000000;

                    background: #ffffff;

                }


                th {

                    background-color: #f2f2f2;

                    font-weight: bold;

                    text-align: center;

                }


                .serial {

                    text-align: center;

                }


                .time {

                    text-align: center;

                    white-space: nowrap;

                }


                .customer {

                    text-align: left;

                    word-break: break-word;

                }


                .transaction {

                    text-align: center;

                    word-break: break-word;

                }


                .money {

                    text-align: right;

                    white-space: nowrap;

                }


                .balance {

                    text-align: right;

                    white-space: nowrap;

                }


                /*
                 * ==================================================
                 * TOTAL ROW
                 * ==================================================
                 */

                .total-row td {

                    font-weight: bold;

                    background-color: #fafafa;

                }


                /*
                 * ==================================================
                 * SIGNATURE
                 * ==================================================
                 */

                .footer-signature {

                    margin-top: 60px;

                    display: flex;

                    justify-content: flex-end;

                }


                .sig-box {

                    width: 220px;

                    text-align: center;

                    font-family:
                        'Times New Roman',
                        serif;

                    font-size: 14px;

                }


                .sig-line {

                    border-top:
                        0.5px solid #000000;

                    margin-bottom: 5px;

                    width: 100%;

                }


                /*
                 * ==================================================
                 * PRINT / PDF
                 * ==================================================
                 */

                @page {

                    size: A4 portrait;

                    margin: 10mm;

                }


                * {

                    box-sizing: border-box;

                }

            </style>

        `;


        // =====================================================
        // TEMPORARY PDF CONTAINER
        // =====================================================

        const worker =
            document.createElement('div');


        worker.style.position = 'fixed';

        worker.style.left = '-10000px';

        worker.style.top = '0';

        worker.style.width = '760px';

        worker.style.minHeight = '100px';

        worker.style.background = '#ffffff';

        worker.style.padding = '0';

        worker.style.margin = '0';

        worker.style.zIndex = '999999';

        worker.style.display = 'block';

        worker.style.visibility = 'visible';

        worker.style.opacity = '1';


        // HTML বসানো

        worker.innerHTML =
            style +
            elementHTML;


        // Body-তে যোগ করা

        document.body.appendChild(worker);


        // =====================================================
        // REPORT ELEMENT
        // =====================================================

        const reportElement =
            worker.querySelector(
                '.mousumi-report'
            );


        if (!reportElement) {

            document.body.removeChild(worker);

            alert(
                "রিপোর্ট তৈরি করা যায়নি। Report element পাওয়া যায়নি।"
            );

            return;
        }


        // =====================================================
        // FONT LOAD হওয়া পর্যন্ত অপেক্ষা
        // =====================================================

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


        // সামান্য render delay

        await new Promise(resolve =>
            setTimeout(resolve, 300)
        );


        // =====================================================
        // PDF OPTIONS
        // =====================================================

        const opt = {

            margin: [
                8,
                8,
                8,
                8
            ],

            filename:
                `Mousumi_Report_${startDate}.pdf`,

            image: {

                type: 'jpeg',

                quality: 0.98

            },

            html2canvas: {

                /*
                 * 3 থেকে 2 করা হয়েছে।
                 *
                 * এতে 0.5px border অতিরিক্ত মোটা
                 * দেখানোর সম্ভাবনা কমে।
                 */

                scale: 2,

                useCORS: true,

                allowTaint: false,

                backgroundColor: '#ffffff',

                logging: false,

                letterRendering: true,

                imageTimeout: 15000,

                scrollX: 0,

                scrollY: 0

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


        // =====================================================
        // PDF GENERATE
        // =====================================================

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
                (error.message || error)
            );

        } finally {

            // =================================================
            // TEMPORARY ELEMENT REMOVE
            // =================================================

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
            ).padStart(2, '0');


        const localDay =
            String(
                today.getDate()
            ).padStart(2, '0');


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
                // Selected date transactions
                // ------------------------------------------------

                const filtered =
                    txs.filter(
                        t =>
                            String(t.date) ===
                            String(date)
                    );


                if (!filtered.length) {

                    alert(
                        "এই তারিখে কোনো লেনদেন নেই!"
                    );

                    return;
                }


                // =================================================
                // REPORT DATA PREPARATION
                // =================================================

                const reportData =
                    filtered.map(t => {

                        // -----------------------------------------
                        // Customer
                        // -----------------------------------------

                        const customer =
                            custs.find(
                                x =>
                                    String(x.id) ===
                                    String(t.customerId)
                            );


                        // -----------------------------------------
                        // Opening balance
                        // -----------------------------------------

                        let balance =
                            parseFloat(
                                customer
                                    ? customer.openingBalance
                                    : 0
                            ) || 0;


                        // -----------------------------------------
                        // Customer history
                        // -----------------------------------------

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
                                                a.date || ''
                                            ) +
                                            String(
                                                a.time || ''
                                            );


                                        const dateB =
                                            String(
                                                b.date || ''
                                            ) +
                                            String(
                                                b.time || ''
                                            );


                                        return dateA.localeCompare(
                                            dateB
                                        );

                                    }
                                );


                        // -----------------------------------------
                        // Running balance
                        // -----------------------------------------

                        for (
                            const entry of history
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
                                String(entry.id) ===
                                String(t.id)
                            ) {

                                break;

                            }

                        }


                        // -----------------------------------------
                        // Return report item
                        // -----------------------------------------

                        return {

                            ...t,

                            customerName:
                                customer
                                    ? customer.name
                                    : "Unknown",

                            runningBalanceAtTime:
                                balance

                        };

                    });


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
    // ৮. UI START
    // =========================================================

    setTimeout(
        initUI,
        2000
    );


})();
