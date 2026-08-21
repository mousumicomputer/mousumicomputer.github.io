/**
 * ==========================================================================
 * EDUCATION & DIGITAL SERVICES -> EXACT GOOGLE SHEET RECEIPT TEMPLATE
 * Mousumi Computer ERP Extension
 * ==========================================================================
 */

(function () {
    // ১. গুগল ফন্ট ও নিখুঁত সিএসএস ইনজেকশন
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Lobster&family=Tiro+Bangla:ital,wght@0,400;0,700;1,400&display=swap');

        /* রসিদ কন্টেইনার */
        .receipt-wrapper-card {
            background: #ffffff;
            width: 100%;
            max-width: 580px;
            margin: 0 auto;
            padding: 35px 30px 25px 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            border-radius: 4px;
            position: relative;
            box-sizing: border-box;
            color: #000000;
            overflow: hidden;
        }

        /* ওয়াটারমার্ক */
        .receipt-watermark {
            position: absolute;
            top: 48%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.07;
            pointer-events: none;
            z-index: 1;
            text-align: center;
            width: 100%;
        }
        .receipt-watermark .wm-logo {
            font-family: 'EB Garamond', serif;
            font-size: 190px;
            font-weight: 700;
            line-height: 1;
            color: #000;
        }
        .receipt-watermark .wm-text {
            font-family: 'EB Garamond', serif;
            font-size: 30px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-top: -35px;
            color: #000;
        }

        /* রসিদ কনটেন্ট লেয়ার */
        .receipt-body {
            position: relative;
            z-index: 2;
        }

        /* ১নং ছবি: Caveat 10pt */
        .rc-bismillah {
            text-align: center;
            font-family: 'Caveat', cursive !important;
            font-size: 10pt !important;
            color: #000;
            margin-bottom: 2px;
            line-height: 1.2;
        }

        /* ২নং ছবি: Lobster 29pt Bold */
        .rc-brand-title {
            text-align: center;
            font-family: 'Lobster', cursive !important;
            font-size: 29pt !important;
            font-weight: bold !important;
            color: #000;
            margin: 0 0 4px 0;
            line-height: 1.15;
        }

        /* ৩নং ছবি: EB Garamond 11pt */
        .rc-services-desc {
            text-align: center;
            font-family: 'EB Garamond', serif !important;
            font-size: 11pt !important;
            line-height: 1.25;
            color: #000;
            margin: 0 auto 12px auto;
            max-width: 480px;
        }

        /* ৪নং ছবি: Tiro Bangla 12pt Bold */
        .rc-main-title {
            text-align: center;
            font-family: 'Tiro Bangla', serif !important;
            font-size: 12pt !important;
            font-weight: bold !important;
            letter-spacing: 1.5px;
            margin-bottom: 4px;
            color: #000;
            text-transform: uppercase;
        }

        /* ৫নং ছবি: Tiro Bangla 14pt Bold ও ডাটা টেবিল */
        .rc-table {
            width: 100%;
            border-collapse: collapse;
        }

        .rc-table tr {
            border-bottom: 1px dotted #000;
        }

        .rc-table td {
            padding: 5px 8px;
            color: #000;
            vertical-align: middle;
        }

        .rc-col-label {
            width: 38%;
            font-family: 'Tiro Bangla', serif !important;
            font-size: 14pt !important;
            font-weight: bold !important;
            border-right: 1px dotted #000;
        }

        .rc-col-val {
            width: 62%;
            font-family: 'EB Garamond', 'Tiro Bangla', serif !important;
            font-size: 13.5pt !important;
            font-weight: 600;
            padding-left: 12px !important;
        }

        /* Payment Received ব্যানার */
        .rc-payment-banner {
            text-align: center;
            font-family: 'Tiro Bangla', serif !important;
            font-size: 14pt !important;
            font-weight: bold !important;
            padding: 8px 0;
            border-bottom: 1px dotted #000;
            margin-bottom: 15px;
            color: #000;
        }

        /* PAID স্ট্যাম্প */
        .paid-stamp-wrapper {
            text-align: center;
            margin: 10px 0 16px 0;
        }

        .paid-seal {
            display: inline-block;
            width: 78px;
            height: 78px;
            border: 2.5px dotted #000;
            border-radius: 50%;
            padding: 3px;
            box-sizing: border-box;
        }

        .paid-seal-inner {
            width: 100%;
            height: 100%;
            border: 1.5px solid #000;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }

        .paid-seal-text-top {
            font-family: 'EB Garamond', serif;
            font-size: 7px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .paid-seal-main {
            font-family: 'EB Garamond', serif;
            font-size: 17px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: 1px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 2px 4px;
            margin: 1px 0;
        }

        .paid-seal-text-bot {
            font-family: 'EB Garamond', serif;
            font-size: 7px;
            font-weight: bold;
            letter-spacing: 0.5px;
        }

        .rc-footer-sign {
            font-family: 'Tiro Bangla', serif !important;
            font-size: 12pt !important;
            font-weight: bold !important;
            margin-bottom: 18px;
        }

        .rc-disclaimer {
            text-align: center;
            font-family: 'EB Garamond', serif !important;
            font-size: 11pt !important;
            line-height: 1.35;
            color: #000;
        }

        /* প্রিন্ট স্টাইলিং */
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-receipt-card, #printable-receipt-card * {
                visibility: visible;
            }
            #printable-receipt-card {
                position: absolute;
                left: 50%;
                top: 0;
                transform: translateX(-50%);
                width: 100% !important;
                max-width: 580px !important;
                box-shadow: none !important;
                padding: 15px !important;
            }
            .no-print {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);

    // ২. সাইডবার সাব-মেনু ইনজেকশন
    function injectTemplateSubMenu() {
        const menuItems = document.querySelectorAll('.menu-item');
        let submenuList = null;

        menuItems.forEach(item => {
            if (item.textContent.includes('শিক্ষা ও ডিজিটাল সেবা')) {
                submenuList = item.querySelector('.submenu-list');
            }
        });

        if (submenuList && !document.getElementById('sub-edu-template')) {
            const templateSubItem = document.createElement('li');
            templateSubItem.className = 'submenu-item';
            templateSubItem.id = 'sub-edu-template';
            templateSubItem.innerHTML = `
                <a onclick="openTemplateSection()" style="cursor: pointer;">
                    <i class="fa-solid fa-angle-right"></i> 
                    <span>Template</span>
                </a>
            `;
            submenuList.appendChild(templateSubItem);
        }

        // ৩. ড্যাশবোর্ডে রসিদ ভিউ প্যানেল তৈরি
        const mainWrapper = document.querySelector('.main-wrapper');
        if (mainWrapper && !document.getElementById('template-view')) {
            const templatePanel = document.createElement('div');
            templatePanel.className = 'view-panel';
            templatePanel.id = 'template-view';
            templatePanel.innerHTML = `
                <div style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;" class="no-print">
                    <button onclick="window.print()" class="mc-btn-primary" style="background: #1e293b; padding: 10px 22px; border-radius: 8px;">
                        <i class="fa-solid fa-print"></i> প্রিন্ট রসিদ
                    </button>
                    <button onclick="downloadReceiptPDF()" class="mc-btn-primary" style="background: #4f46e5; padding: 10px 22px; border-radius: 8px;">
                        <i class="fa-solid fa-file-pdf"></i> PDF ডাউনলোড
                    </button>
                </div>

                <!-- গুগল শিট অনুযায়ী হুবহু রসিদ কার্ড -->
                <div class="receipt-wrapper-card" id="printable-receipt-card">
                    <!-- ওয়াটারমার্ক -->
                    <div class="receipt-watermark">
                        <div class="wm-logo">MC</div>
                        <div class="wm-text">Mousumi Computer</div>
                    </div>

                    <div class="receipt-body">
                        <!-- ১নং ছবি: Caveat 10pt -->
                        <div class="rc-bismillah">“In the name of Allah, the Most Gracious, the Most Merciful”</div>
                        
                        <!-- ২নং ছবি: Lobster 29pt Bold -->
                        <div class="rc-brand-title">Mousumi Computer</div>
                        
                        <!-- ৩নং ছবি: EB Garamond 11pt -->
                        <div class="rc-services-desc">
                            All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash, <br>
                            Nagad, Rocket, Upay, Flexiload, and Computer Works.
                        </div>

                        <!-- ৪নং ছবি: Tiro Bangla 12pt Bold -->
                        <div class="rc-main-title">RECEIPT</div>

                        <!-- ৫নং ছবি: Tiro Bangla 14pt Bold -->
                        <table class="rc-table" style="border-top: 1px dotted #000;">
                            <tr>
                                <td class="rc-col-label">Receipt No</td>
                                <td class="rc-col-val">3465</td>
                            </tr>
                            <tr>
                                <td class="rc-col-label">Date</td>
                                <td class="rc-col-val">21-08-2026</td>
                            </tr>
                        </table>

                        <table class="rc-table">
                            <tr>
                                <td class="rc-col-label">Student Name</td>
                                <td class="rc-col-val">Md. Jobayer Ahmed Joy</td>
                            </tr>
                            <tr>
                                <td class="rc-col-label">Student ID</td>
                                <td class="rc-col-val">804325</td>
                            </tr>
                        </table>

                        <table class="rc-table">
                            <tr>
                                <td class="rc-col-label">Tuition Fee</td>
                                <td class="rc-col-val">4,760.00</td>
                            </tr>
                            <tr>
                                <td class="rc-col-label">Charge</td>
                                <td class="rc-col-val">59.6</td>
                            </tr>
                            <tr>
                                <td class="rc-col-label">Total</td>
                                <td class="rc-col-val">4,819.60</td>
                            </tr>
                        </table>

                        <!-- পেমেন্ট রিসিভড ব্যানার -->
                        <div class="rc-payment-banner">Payment Received: 4819.6</div>

                        <!-- PAID সিল -->
                        <div class="paid-stamp-wrapper">
                            <div class="paid-seal">
                                <div class="paid-seal-inner">
                                    <div class="paid-seal-text-top">★ THANK YOU ★</div>
                                    <div class="paid-seal-main">PAID</div>
                                    <div class="paid-seal-text-bot">★ THANK YOU ★</div>
                                </div>
                            </div>
                        </div>

                        <!-- রিসিভার -->
                        <div class="rc-footer-sign">Received By: Riyal Robiul</div>

                        <!-- ফুটনোট -->
                        <div class="rc-disclaimer">
                            This is a computer-generated receipt.<br>
                            Thank you for your payment.<br>
                            <span style="display:inline-block; margin-top: 4px;">
                                For any queries or assistance, please contact<br>
                                <strong>Md. Robiul Islam at 01608-314552 or 01893-201584.</strong>
                            </span>
                        </div>
                    </div>
                </div>
            `;
            mainWrapper.appendChild(templatePanel);
        }
    }

    // ৪. সেকশন ওপেন ফাংশন
    window.openTemplateSection = function () {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.submenu-item').forEach(i => i.classList.remove('active'));

        const tPanel = document.getElementById('template-view');
        if (tPanel) tPanel.classList.add('active');

        const subItem = document.getElementById('sub-edu-template');
        if (subItem) subItem.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "RECEIPT TEMPLATE";
    };

    // ৫. PDF ডাউনলোড ফাংশন
    window.downloadReceiptPDF = function () {
        const element = document.getElementById('printable-receipt-card');
        const opt = {
            margin: 10,
            filename: 'Receipt_3465.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(injectTemplateSubMenu, 300));
    } else {
        setTimeout(injectTemplateSubMenu, 300);
    }
})();
