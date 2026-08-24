/**
 * ==========================================================================
 * EDUCATION & DIGITAL SERVICES -> 100% EXACT MASTER RECEIPT TEMPLATE (A5 FIX)
 * Mousumi Computer ERP Extension
 * ==========================================================================
 */

(function () {
    // ১. ফন্ট লিঙ্ক ইনজেকশন
    if (!document.getElementById('mc-receipt-fonts')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'mc-receipt-fonts';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Lobster&family=Lora:ital,wght@1,400;1,500;1,600&family=Roboto+Mono:wght@400;500&family=Tiro+Bangla:ital,wght@0,400;0,700;1,400&display=swap';
        document.head.appendChild(fontLink);
    }

    // ২. সিএসএস ডিজাইন (A5 প্রিন্ট ও জলছাপ ফিক্স)
    const style = document.createElement('style');
    style.innerHTML = `
        /* A5 পেপার প্রিন্ট রুল */
        @page {
            size: A5 portrait;
            margin: 4mm 5mm;
        }

        /* রসিদ কার্ড ফ্রেম */
        .receipt-wrapper-card {
            background: #ffffff !important;
            width: 100%;
            max-width: 510px;
            margin: 0 auto;
            padding: 16px 20px 18px 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            border-radius: 4px;
            position: relative;
            box-sizing: border-box;
            color: #000000;
            overflow: hidden;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* নিখুঁত পজিশন ও অপাসিটির জলছাপ (প্রিন্ট ফিক্স) */
        .receipt-watermark {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.45 !important;
            pointer-events: none;
            z-index: 1;
            text-align: center;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        .receipt-watermark img {
            max-width: 390px;
            width: 80%;
            height: auto;
            object-fit: contain;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        .receipt-body {
            position: relative;
            z-index: 2;
        }

        /* Row 1: Bismillah */
        .rc-bismillah {
            text-align: center;
            font-family: 'Caveat', cursive !important;
            font-size: 10.5pt !important;
            color: #000;
            margin-bottom: 2px;
            line-height: 1.1;
        }

        /* Row 2: Brand Title */
        .rc-brand-title {
            text-align: center;
            font-family: 'Lobster', cursive !important;
            font-size: 26pt !important;
            font-weight: bold !important;
            color: #000;
            margin: 0 0 2px 0;
            line-height: 1.1;
        }

        /* Row 3: Services Description */
        .rc-services-desc {
            text-align: center;
            font-family: 'EB Garamond', serif !important;
            font-size: 10pt !important;
            line-height: 1.2;
            color: #000;
            margin: 0 auto 8px auto;
            max-width: 480px;
        }

        /* Row 5: Main RECEIPT Title */
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

        /* ডাটা টেবিল ও শার্প ডটেড লাইন */
        .rc-sheet-table {
            width: 100%;
            border-collapse: collapse !important;
            border-top: 1.5px dotted #000 !important;
        }

        .rc-sheet-table td {
            padding: 3px 8px !important;
            color: #000;
            vertical-align: middle;
            font-family: 'Tiro Bangla', serif !important;
            font-size: 13pt !important;
            line-height: 1.2;
            border: none;
        }

        .rc-col-b {
            width: 38%;
            font-weight: bold !important;
            border-right: 1.5px dotted #000 !important;
            padding-left: 2px !important;
        }

        .rc-col-c {
            width: 62%;
            font-weight: normal !important;
            padding-left: 12px !important;
        }

        /* সেকশন শেষের একক ডটেড বর্ডার ও গ্যাপ */
        .rc-section-end td {
            border-bottom: 1.5px dotted #000 !important;
            padding-bottom: 7px !important;
        }

        /* পরবর্তী সেকশন শুরুর টপ প্যাডিং */
        .rc-section-start td {
            padding-top: 7px !important;
        }

        /* Payment Received ব্যানার */
        .rc-payment-received-row td {
            text-align: center !important;
            font-weight: bold !important;
            font-size: 13.5pt !important;
            padding: 5px 0 !important;
            border-bottom: 1.5px dotted #000 !important;
            border-right: none !important;
        }

        /* PAID স্ট্যাম্প ইমেজ */
        .paid-stamp-wrapper {
            text-align: center;
            margin: 8px 0 8px 0;
        }

        .paid-stamp-img {
            width: 72px;
            height: auto;
            max-height: 72px;
            object-fit: contain;
            display: inline-block;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }

        /* Received By */
        .rc-footer-sign {
            font-family: 'Tiro Bangla', serif !important;
            font-size: 10pt !important;
            margin: 8px 0 10px 0;
            color: #000;
        }
        .rc-footer-sign strong {
            font-weight: bold;
        }

        /* ফুটার টেক্সট ও ডিসক্লেইমার */
        .rc-disclaimer-mono {
            text-align: center;
            font-family: 'Roboto Mono', monospace !important;
            font-size: 9pt !important;
            line-height: 1.3;
            color: #000;
            margin-bottom: 4px;
        }

        .rc-disclaimer-lora {
            text-align: center;
            font-family: 'Lora', serif !important;
            font-size: 9pt !important;
            font-style: italic !important;
            line-height: 1.25;
            color: #000;
        }

        /* প্রিন্ট স্টাইলিং (A5 হুবহু ফিট ও জলছাপ নিশ্চিতকরণ) */
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-receipt-card, #printable-receipt-card * {
                visibility: visible !important;
            }
            #printable-receipt-card {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                max-width: 100% !important;
                box-shadow: none !important;
                padding: 4mm 4mm !important;
                margin: 0 auto !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .receipt-watermark {
                display: flex !important;
                visibility: visible !important;
                opacity: 0.45 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .receipt-watermark img {
                visibility: visible !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .no-print {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);

    // ৩. অটো-ডিটেকশন ও ইনজেকশন লজিক
    function injectTemplateModule() {
        const menuItems = document.querySelectorAll('.menu-item');
        let submenuList = null;

        menuItems.forEach(item => {
            if (item.textContent.includes('শিক্ষা ও ডিজিটাল সেবা')) {
                submenuList = item.querySelector('.submenu-list') || item.querySelector('ul');
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

        const mainWrapper = document.querySelector('.main-wrapper') || document.querySelector('.content-wrapper') || document.querySelector('main');
        if (mainWrapper && !document.getElementById('template-view')) {
            const templatePanel = document.createElement('div');
            templatePanel.className = 'view-panel';
            templatePanel.id = 'template-view';
            templatePanel.innerHTML = `
                <div style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;" class="no-print">
                    <button onclick="window.print()" class="mc-btn-primary" style="background: #1e293b; padding: 10px 22px; border-radius: 8px; cursor: pointer;">
                        <i class="fa-solid fa-print"></i> প্রিন্ট রসিদ
                    </button>
                    <button onclick="downloadReceiptPDF()" class="mc-btn-primary" style="background: #4f46e5; padding: 10px 22px; border-radius: 8px; cursor: pointer;">
                        <i class="fa-solid fa-file-pdf"></i> A5 PDF ডাউনলোড
                    </button>
                </div>

                <!-- হুবহু সফট কপির মত রসিদ কার্ড -->
                <div class="receipt-wrapper-card" id="printable-receipt-card">
                    <!-- সঠিক স্থানে বসানো জলছাপ -->
                    <div class="receipt-watermark">
                        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgBBifAiiveIb1xVgQZv6AxAD_YCVu7JRmBqQOX2eeSJFxavzFEhsWQlYpN6b_aUIiUVCdNu39EHD2-tG1Li5b2Jx4U1DqTH98zbWgxmegb-xPADeDbJBdCqt-WhP71NUrFTlJLeEpZgVoAxEcUufpJNxMQs8nVE28Jj6Ch0LRjTnDBICBibZxxgwE7nFyB/s1600/Receipt%20%281%29.png" alt="Watermark" crossorigin="anonymous" />
                    </div>

                    <div class="receipt-body">
                        <div class="rc-bismillah">“In the name of Allah, the Most Gracious, the Most Merciful”</div>
                        <div class="rc-brand-title">Mousumi Computer</div>
                        <div class="rc-services-desc">
                            All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash, <br>
                            Nagad, Rocket, Upay, Flexiload, and Computer Works.
                        </div>

                        <div class="rc-main-title">RECEIPT</div>

                        <!-- ডাটা টেবিল (একক ডটেড লাইন স্ট্রাকচার) -->
                        <table class="rc-sheet-table">
                            <tr>
                                <td class="rc-col-b">Receipt No</td>
                                <td class="rc-col-c">3521</td>
                            </tr>
                            <tr class="rc-section-end">
                                <td class="rc-col-b">Date</td>
                                <td class="rc-col-c">24-08-2026</td>
                            </tr>

                            <tr class="rc-section-start">
                                <td class="rc-col-b">Student Name</td>
                                <td class="rc-col-c">Md. Tamim Eqbul</td>
                            </tr>
                            <tr class="rc-section-end">
                                <td class="rc-col-b">Student ID</td>
                                <td class="rc-col-c">252062</td>
                            </tr>

                            <tr class="rc-section-start">
                                <td class="rc-col-b">Tuition Fee</td>
                                <td class="rc-col-c">16,330.00</td>
                            </tr>
                            <tr>
                                <td class="rc-col-b">Charge</td>
                                <td class="rc-col-c">170.3</td>
                            </tr>
                            <tr class="rc-section-end">
                                <td class="rc-col-b">Total</td>
                                <td class="rc-col-c">16,500.30</td>
                            </tr>

                            <tr class="rc-payment-received-row">
                                <td colspan="2">Payment Received: 16500.3</td>
                            </tr>
                        </table>

                        <!-- PAID স্ট্যাম্প -->
                        <div class="paid-stamp-wrapper">
                            <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkW_Mz8uWQPQY8WqCQEVSh7ff6C8_ZE02lZw3o42e8QtmSIE8Sxgx_ejXTZmN_QNLHg0nfS5hrG4Mu2Y6NGCztsTnRZfvFuZ3bZzLAkMtvHxP6tkMxi9YUWcKG9gKXpJHrmnuWFFDAw0qIcAPb6WvHNVT_eiZkM2xDyI3HvRxrrqrpqyv8Zv2FIICwIQQr/s1600/Receipt.png" alt="PAID Stamp" class="paid-stamp-img" crossorigin="anonymous" />
                        </div>

                        <!-- Received By -->
                        <div class="rc-footer-sign">
                            <strong>Received By:</strong> Riyal Robiul
                        </div>

                        <div class="rc-disclaimer-mono">
                            This is a computer-generated receipt.<br>
                            Thank you for your payment.
                        </div>

                        <div class="rc-disclaimer-lora">
                            For any queries or assistance, please contact<br>
                            Md. Robiul Islam at 01608-314552 or 01893-201584.
                        </div>
                    </div>
                </div>
            `;
            mainWrapper.appendChild(templatePanel);
        }

        return !!(document.getElementById('sub-edu-template') && document.getElementById('template-view'));
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
        if (topTitle) topTitle.innerText = "RECEIPT TEMPLATE (A5)";
    };

    // ৫. নিখুঁত A5 PDF ডাউনলোড ফাংশন
    window.downloadReceiptPDF = function () {
        const element = document.getElementById('printable-receipt-card');
        const opt = {
            margin: [4, 4, 4, 4],
            filename: 'Receipt_3521_24-08-2026.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    };

    // সাইডবার অটো চেকার
    const autoChecker = setInterval(() => {
        if (injectTemplateModule()) {
            clearInterval(autoChecker);
        }
    }, 100);

    setTimeout(() => clearInterval(autoChecker), 5000);
})();
