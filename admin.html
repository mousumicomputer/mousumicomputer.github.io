/**
 * ==========================================================================
 * EDUCATION & DIGITAL SERVICES -> EXACT RECEIPT TEMPLATE MODULE
 * Mousumi Computer ERP Extension
 * ==========================================================================
 */

(function () {
    // ১. স্টাইলশীট ইনজেক্ট করা (রসিদের নিখুঁত ডিজাইন ও প্রিন্ট ফরম্যাটের জন্য)
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,400;1,600&display=swap');

        /* রসিদ কন্টেইনার */
        .receipt-wrapper-card {
            background: #ffffff;
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 35px 30px 35px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.08);
            border-radius: 4px;
            position: relative;
            box-sizing: border-box;
            color: #000000;
            font-family: 'Times New Roman', Times, serif;
            background-color: #fff;
            overflow: hidden;
        }

        /* ওয়াটারমার্ক লোগো */
        .receipt-watermark {
            position: absolute;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.08;
            pointer-events: none;
            z-index: 1;
            text-align: center;
            width: 100%;
        }
        .receipt-watermark .wm-logo {
            font-family: 'Playfair Display', serif;
            font-size: 160px;
            font-weight: 800;
            line-height: 1;
            color: #000;
        }
        .receipt-watermark .wm-text {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 2px;
            margin-top: -30px;
            color: #000;
        }

        /* কনটেন্ট লেয়ার */
        .receipt-body {
            position: relative;
            z-index: 2;
        }

        .rc-bismillah {
            text-align: center;
            font-style: italic;
            font-size: 14px;
            margin-bottom: 8px;
            letter-spacing: 0.3px;
        }

        .rc-brand-title {
            text-align: center;
            font-family: 'Playfair Display', serif;
            font-size: 36px;
            font-weight: 900;
            font-style: italic;
            margin: 0 0 8px 0;
            color: #000;
        }

        .rc-services-desc {
            text-align: center;
            font-size: 13.5px;
            line-height: 1.35;
            color: #111;
            margin: 0 auto 16px auto;
            max-width: 480px;
        }

        .rc-main-title {
            text-align: center;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 2px;
            margin-bottom: 6px;
            text-transform: uppercase;
        }

        /* রসিদ ডাটা টেবিল */
        .rc-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 4px;
        }

        .rc-table tr {
            border-bottom: 1.5px dashed #444;
        }
        .rc-table tr.no-border {
            border-bottom: none !important;
        }
        .rc-table tr.border-top {
            border-top: 1.5px dashed #444;
        }

        .rc-table td {
            padding: 7px 10px;
            font-size: 17px;
            color: #000;
            vertical-align: middle;
        }

        .rc-col-label {
            width: 40%;
            font-weight: bold;
            border-right: 1.5px dashed #444;
        }

        .rc-col-val {
            width: 60%;
            padding-left: 15px !important;
        }

        .rc-payment-banner {
            text-align: center;
            font-size: 20px;
            font-weight: 900;
            padding: 10px 0;
            border-bottom: 1.5px dashed #444;
            margin-bottom: 15px;
            color: #000;
        }

        /* PAID স্ট্যাম্প / সিল */
        .paid-stamp-wrapper {
            text-align: center;
            margin: 12px 0 20px 0;
        }

        .paid-seal {
            display: inline-block;
            width: 85px;
            height: 85px;
            border: 3px dashed #000;
            border-radius: 50%;
            padding: 4px;
            box-sizing: border-box;
        }

        .paid-seal-inner {
            width: 100%;
            height: 100%;
            border: 2px solid #000;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }

        .paid-seal-text-top {
            font-size: 7.5px;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .paid-seal-main {
            font-size: 19px;
            font-weight: 900;
            line-height: 1;
            letter-spacing: 1.5px;
            border-top: 1.5px solid #000;
            border-bottom: 1.5px solid #000;
            padding: 2px 5px;
            margin: 2px 0;
        }

        .paid-seal-text-bot {
            font-size: 7.5px;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .rc-footer-sign {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 25px;
        }

        .rc-disclaimer {
            text-align: center;
            font-size: 13.5px;
            line-height: 1.45;
            color: #111;
        }

        /* প্রিন্ট স্টাইল */
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
                max-width: 650px !important;
                box-shadow: none !important;
                padding: 20px !important;
            }
            .no-print {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);

    // ২. সাইডবার মেনু ইনজেকশন
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

                <!-- মূল রসিদ কার্ড (ছবি অনুযায়ী নিখুঁত লেআউট) -->
                <div class="receipt-wrapper-card" id="printable-receipt-card">
                    <!-- ওয়াটারমার্ক ব্যাকগ্রাউন্ড -->
                    <div class="receipt-watermark">
                        <div class="wm-logo">MC</div>
                        <div class="wm-text">Mousumi Computer</div>
                    </div>

                    <div class="receipt-body">
                        <!-- হেডার সেকশন -->
                        <div class="rc-bismillah">“In the name of Allah, the Most Gracious, the Most Merciful”</div>
                        <div class="rc-brand-title">Mousumi Computer</div>
                        <div class="rc-services-desc">
                            All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash, <br>
                            Nagad, Rocket, Upay, Flexiload, and Computer Works.
                        </div>

                        <div class="rc-main-title">RECEIPT</div>

                        <!-- টেবিল সেকশন ১: ইনভয়েস ও তারিখ -->
                        <table class="rc-table" style="border-top: 1.5px dashed #444;">
                            <tr>
                                <td class="rc-col-label">Receipt No</td>
                                <td class="rc-col-val" style="font-weight: bold;">3465</td>
                            </tr>
                            <tr>
                                <td class="rc-col-label">Date</td>
                                <td class="rc-col-val" style="font-weight: bold;">21-08-2026</td>
                            </tr>
                        </table>

                        <!-- টেবিল সেকশন ২: শিক্ষার্থীর তথ্য -->
                        <table class="rc-table">
                            <tr>
                                <td class="rc-col-label">Student Name</td>
                                <td class="rc-col-val" style="font-weight: bold;">Md. Jobayer Ahmed Joy</td>
                            </tr>
                            <tr>
                                <td class="rc-col-label">Student ID</td>
                                <td class="rc-col-val" style="font-weight: bold;">804325</td>
                            </tr>
                        </table>

                        <!-- টেবিল সেকশন ৩: ফিসের বিবরণ -->
                        <table class="rc-table">
                            <tr>
                                <td class="rc-col-label">Tuition Fee</td>
                                <td class="rc-col-val" style="font-weight: bold;">4,760.00</td>
                            </tr>
                            <tr>
                                <td class="rc-col-label">Charge</td>
                                <td class="rc-col-val" style="font-weight: bold;">59.6</td>
                            </tr>
                            <tr>
                                <td class="rc-col-label">Total</td>
                                <td class="rc-col-val" style="font-weight: bold;">4,819.60</td>
                            </tr>
                        </table>

                        <!-- পেমেন্ট রিসিভড হাইলাইট -->
                        <div class="rc-payment-banner">Payment Received: 4819.6</div>

                        <!-- PAID স্ট্যাম্প -->
                        <div class="paid-stamp-wrapper">
                            <div class="paid-seal">
                                <div class="paid-seal-inner">
                                    <div class="paid-seal-text-top">★ THANK YOU ★</div>
                                    <div class="paid-seal-main">PAID</div>
                                    <div class="paid-seal-text-bot">★ THANK YOU ★</div>
                                </div>
                            </div>
                        </div>

                        <!-- রিসিভার সিগনেচার -->
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

    // ৪. টেমপ্লেট ভিউ ওপেন করার ফাংশন
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

    // পৃষ্ঠা লোড হলে চালু হবে
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(injectTemplateSubMenu, 300));
    } else {
        setTimeout(injectTemplateSubMenu, 300);
    }
})();
