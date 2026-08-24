/**
 * ==========================================================================
 * EDUCATION & DIGITAL SERVICES -> 100% EXACT GOOGLE SHEET RECEIPT TEMPLATE
 * Mousumi Computer ERP Extension
 * ==========================================================================
 */

(function () {
    // ১. গুগল ফন্টস ও নিখুঁত সিএসএস ইনজেকশন
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Lobster&family=Lora:ital,wght@1,400;1,500;1,600&family=Roboto+Mono:wght@400;500&family=Tiro+Bangla:ital,wght@0,400;0,700;1,400&display=swap');

        /* রসিদ কার্ড ফ্রেম */
        .receipt-wrapper-card {
            background: #ffffff;
            width: 100%;
            max-width: 590px;
            margin: 0 auto;
            padding: 30px 25px 25px 25px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            border-radius: 4px;
            position: relative;
            box-sizing: border-box;
            color: #000000;
            overflow: hidden;
        }

        /* ওয়াটারমার্ক (গাঢ় এবং স্পষ্ট জলছাপ) */
        .receipt-watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.65; /* অপাসিটি বৃদ্ধি করা হয়েছে যাতে একদম ক্লিয়ার দেখা যায় */
            pointer-events: none;
            z-index: 1;
            text-align: center;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .receipt-watermark img {
            max-width: 420px;
            width: 80%;
            height: auto;
            object-fit: contain;
            filter: contrast(1.15) brightness(0.95); /* দাগগুলো গাঢ় করার জন্য */
        }

        .receipt-body {
            position: relative;
            z-index: 2;
        }

        /* Row 1: Caveat 10pt */
        .rc-bismillah {
            text-align: center;
            font-family: 'Caveat', cursive !important;
            font-size: 10pt !important;
            color: #000;
            margin-bottom: 2px;
            line-height: 1.2;
        }

        /* Row 2: Lobster 29pt Bold */
        .rc-brand-title {
            text-align: center;
            font-family: 'Lobster', cursive !important;
            font-size: 29pt !important;
            font-weight: bold !important;
            color: #000;
            margin: 0 0 4px 0;
            line-height: 1.15;
        }

        /* Row 3: EB Garamond 11pt */
        .rc-services-desc {
            text-align: center;
            font-family: 'EB Garamond', serif !important;
            font-size: 11pt !important;
            line-height: 1.25;
            color: #000;
            margin: 0 auto 12px auto;
            max-width: 500px;
        }

        /* Row 5: Tiro Bangla 12pt Bold */
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

        /* Row 6-15: ডাটা টেবিল ও ডটেড লাইন */
        .rc-sheet-table {
            width: 100%;
            border-collapse: collapse;
            border-top: 1.5px dotted #000;
        }

        .rc-sheet-table td {
            padding: 3px 8px;
            color: #000;
            vertical-align: middle;
            font-family: 'Tiro Bangla', serif !important;
            font-size: 14pt !important;
        }

        .rc-col-b {
            width: 38%;
            font-weight: bold !important;
            border-right: 1.5px dotted #000;
            padding-left: 4px !important;
        }

        .rc-col-c {
            width: 62%;
            font-weight: normal !important;
            padding-left: 12px !important;
        }

        .rc-border-bottom {
            border-bottom: 1.5px dotted #000;
        }

        .rc-gap-row td {
            height: 18px !important;
            padding: 0 !important;
        }

        /* Row 15: Payment Received ব্যানার */
        .rc-payment-received-row td {
            text-align: center !important;
            font-weight: bold !important;
            padding: 6px 0 !important;
            border-bottom: 1.5px dotted #000 !important;
            border-right: none !important;
        }

        /* Row 16-19: PAID স্ট্যাম্প ইমেজ */
        .paid-stamp-wrapper {
            text-align: center;
            margin: 12px 0 14px 0;
        }

        .paid-stamp-img {
            width: 85px;
            height: auto;
            max-height: 85px;
            object-fit: contain;
            display: inline-block;
        }

        /* Row 21: Tiro Bangla 10pt (Received By) */
        .rc-footer-sign {
            font-family: 'Tiro Bangla', serif !important;
            font-size: 10pt !important;
            margin: 12px 0 14px 0;
            color: #000;
        }
        .rc-footer-sign strong {
            font-weight: bold;
        }

        /* Row 23: Roboto Mono 10pt */
        .rc-disclaimer-mono {
            text-align: center;
            font-family: 'Roboto Mono', monospace !important;
            font-size: 10pt !important;
            line-height: 1.4;
            color: #000;
            margin-bottom: 6px;
        }

        /* Row 24: Lora 10pt Italic */
        .rc-disclaimer-lora {
            text-align: center;
            font-family: 'Lora', serif !important;
            font-size: 10pt !important;
            font-style: italic !important;
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
                max-width: 590px !important;
                box-shadow: none !important;
                padding: 15px !important;
            }
            .no-print {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);

    // ২. সাইডবারে সাব-মেনু ইনজেকশন
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

                <!-- গুগল শিটের সাথে ১০০% হুবহু রসিদ -->
                <div class="receipt-wrapper-card" id="printable-receipt-card">
                    <!-- নতুন গাঢ় জলছাপ (Watermark Image) -->
                    <div class="receipt-watermark">
                        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgBBifAiiveIb1xVgQZv6AxAD_YCVu7JRmBqQOX2eeSJFxavzFEhsWQlYpN6b_aUIiUVCdNu39EHD2-tG1Li5b2Jx4U1DqTH98zbWgxmegb-xPADeDbJBdCqt-WhP71NUrFTlJLeEpZgVoAxEcUufpJNxMQs8nVE28Jj6Ch0LRjTnDBICBibZxxgwE7nFyB/s1600/Receipt%20%281%29.png" alt="Watermark" crossorigin="anonymous" />
                    </div>

                    <div class="receipt-body">
                        <!-- Row 1: Caveat 10pt -->
                        <div class="rc-bismillah">“In the name of Allah, the Most Gracious, the Most Merciful”</div>
                        
                        <!-- Row 2: Lobster 29pt Bold -->
                        <div class="rc-brand-title">Mousumi Computer</div>
                        
                        <!-- Row 3: EB Garamond 11pt -->
                        <div class="rc-services-desc">
                            All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash, <br>
                            Nagad, Rocket, Upay, Flexiload, and Computer Works.
                        </div>

                        <!-- Row 5: Tiro Bangla 12pt Bold -->
                        <div class="rc-main-title">RECEIPT</div>

                        <!-- Row 6-15: Tiro Bangla 14pt (লেবেল বোল্ড, ভ্যালু রেগুলার) -->
                        <table class="rc-sheet-table">
                            <!-- Row 6 -->
                            <tr>
                                <td class="rc-col-b">Receipt No</td>
                                <td class="rc-col-c">3465</td>
                            </tr>
                            <!-- Row 7 -->
                            <tr class="rc-border-bottom">
                                <td class="rc-col-b">Date</td>
                                <td class="rc-col-c">21-08-2026</td>
                            </tr>

                            <!-- Row 8 (Gap Row) -->
                            <tr class="rc-gap-row rc-border-bottom">
                                <td class="rc-col-b"></td>
                                <td class="rc-col-c"></td>
                            </tr>

                            <!-- Row 9 -->
                            <tr>
                                <td class="rc-col-b">Student Name</td>
                                <td class="rc-col-c">Md. Jobayer Ahmed Joy</td>
                            </tr>
                            <!-- Row 10 -->
                            <tr class="rc-border-bottom">
                                <td class="rc-col-b">Student ID</td>
                                <td class="rc-col-c">804325</td>
                            </tr>

                            <!-- Row 11 (Gap Row) -->
                            <tr class="rc-gap-row rc-border-bottom">
                                <td class="rc-col-b"></td>
                                <td class="rc-col-c"></td>
                            </tr>

                            <!-- Row 12 -->
                            <tr>
                                <td class="rc-col-b">Tuition Fee</td>
                                <td class="rc-col-c">4,760.00</td>
                            </tr>
                            <!-- Row 13 -->
                            <tr>
                                <td class="rc-col-b">Charge</td>
                                <td class="rc-col-c">59.6</td>
                            </tr>
                            <!-- Row 14 -->
                            <tr class="rc-border-bottom">
                                <td class="rc-col-b">Total</td>
                                <td class="rc-col-c">4,819.00</td>
                            </tr>

                            <!-- Row 15: Merged Row -->
                            <tr class="rc-payment-received-row">
                                <td colspan="2">Payment Received: 4819.6</td>
                            </tr>
                        </table>

                        <!-- Row 16-19: PAID স্ট্যাম্প ইমেজ -->
                        <div class="paid-stamp-wrapper">
                            <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkW_Mz8uWQPQY8WqCQEVSh7ff6C8_ZE02lZw3o42e8QtmSIE8Sxgx_ejXTZmN_QNLHg0nfS5hrG4Mu2Y6NGCztsTnRZfvFuZ3bZzLAkMtvHxP6tkMxi9YUWcKG9gKXpJHrmnuWFFDAw0qIcAPb6WvHNVT_eiZkM2xDyI3HvRxrrqrpqyv8Zv2FIICwIQQr/s1600/Receipt.png" alt="PAID Stamp" class="paid-stamp-img" crossorigin="anonymous" />
                        </div>

                        <!-- Row 21: Tiro Bangla 10pt -->
                        <div class="rc-footer-sign">
                            <strong>Received By:</strong> Riyal Robiul
                        </div>

                        <!-- Row 23: Roboto Mono 10pt -->
                        <div class="rc-disclaimer-mono">
                            This is a computer-generated receipt.<br>
                            Thank you for your payment.
                        </div>

                        <!-- Row 24: Lora 10pt Italic -->
                        <div class="rc-disclaimer-lora">
                            For any queries or assistance, please contact<br>
                            Md. Robiul Islam at 01608-314552 or 01893-201584.
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
            margin: 8,
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
