/**
 * ==========================================================================
 * EDUCATION & DIGITAL SERVICES -> 100% PERFECT A5 ISOLATED PRINT ENGINE
 * Mousumi Computer ERP Extension (Exact Match Edition)
 * ==========================================================================
 */

(function () {
    // ১. মূল ড্যাশবোর্ড ডিসপ্লে সিএসএস
    const style = document.createElement('style');
    style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Lobster&family=Lora:ital,wght@1,400;1,500;1,600&family=Roboto+Mono:wght@400;500&family=Tiro+Bangla:ital,wght@0,400;0,700;1,400&display=swap');

        .receipt-wrapper-card {
            background: #ffffff;
            width: 100%;
            max-width: 520px;
            margin: 0 auto;
            padding: 24px 24px 20px 24px;
            box-shadow: 0 5px 25px rgba(0,0,0,0.08);
            border-radius: 4px;
            position: relative;
            box-sizing: border-box;
            color: #000000;
            overflow: hidden;
        }

        .receipt-watermark {
            position: absolute;
            top: 42%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 82%;
            max-width: 400px;
            opacity: 0.38;
            pointer-events: none;
            z-index: 1;
            text-align: center;
        }
        .receipt-watermark img {
            width: 100%;
            height: auto;
            display: block;
        }

        .receipt-body {
            position: relative;
            z-index: 2;
        }

        .rc-bismillah {
            text-align: center;
            font-family: 'Caveat', cursive !important;
            font-size: 13pt;
            font-weight: 600;
            color: #000;
            margin-bottom: 2px;
        }

        .rc-brand-title {
            text-align: center;
            font-family: 'Lobster', cursive !important;
            font-size: 30pt;
            font-weight: normal;
            color: #000;
            margin: 0 0 4px 0;
            line-height: 1.1;
        }

        .rc-services-desc {
            text-align: center;
            font-family: 'EB Garamond', serif !important;
            font-size: 10pt;
            line-height: 1.25;
            color: #000;
            margin: 0 auto 10px auto;
            max-width: 460px;
        }

        .rc-main-title {
            text-align: center;
            font-family: 'Tiro Bangla', 'Times New Roman', serif !important;
            font-size: 12.5pt;
            font-weight: bold;
            letter-spacing: 1.5px;
            margin-bottom: 5px;
            color: #000;
            text-transform: uppercase;
        }

        .rc-sheet-table {
            width: 100%;
            border-collapse: collapse;
            border-top: 1.5px dotted #000;
        }

        .rc-sheet-table td {
            padding: 4px 6px;
            color: #000;
            vertical-align: middle;
            font-family: 'Tiro Bangla', 'Times New Roman', serif !important;
            font-size: 13.5pt;
            line-height: 1.2;
            border: none;
        }

        .rc-col-b {
            width: 38%;
            font-weight: bold;
            border-right: 1.5px dotted #000;
            padding-left: 2px !important;
        }

        .rc-col-c {
            width: 62%;
            font-weight: normal;
            padding-left: 12px !important;
        }

        .rc-section-end td {
            border-bottom: 1.5px dotted #000;
            padding-bottom: 8px;
        }

        .rc-section-start td {
            padding-top: 8px;
        }

        .rc-payment-received-row td {
            text-align: center !important;
            font-weight: bold;
            font-size: 14pt;
            padding: 6px 0;
            border-bottom: 1.5px dotted #000;
            border-right: none;
        }

        .paid-stamp-wrapper {
            text-align: center;
            margin: 10px 0;
        }

        .paid-stamp-img {
            width: 78px;
            height: auto;
            object-fit: contain;
            display: inline-block;
        }

        .rc-footer-sign {
            font-family: 'Tiro Bangla', 'Times New Roman', serif !important;
            font-size: 11pt;
            margin: 10px 0 12px 0;
            color: #000;
        }

        .rc-disclaimer-mono {
            text-align: center;
            font-family: 'Roboto Mono', monospace !important;
            font-size: 9pt;
            line-height: 1.35;
            color: #000;
            margin-bottom: 4px;
        }

        .rc-disclaimer-lora {
            text-align: center;
            font-family: 'Lora', serif !important;
            font-size: 9pt;
            font-style: italic;
            line-height: 1.3;
            color: #000;
        }
    `;
    document.head.appendChild(style);

    // ২. সাইডবার ও ড্যাশবোর্ড ইনজেকশন
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
                <div style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button onclick="printReceiptA5Clean()" class="mc-btn-primary" style="background: #1e293b; padding: 12px 28px; font-size: 15px; font-weight: bold; border-radius: 8px; cursor: pointer; color: #fff; border: none; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-print"></i> প্রিন্ট রসিদ (A5)
                    </button>
                </div>

                <!-- মূল রসিদ কার্ড -->
                <div class="receipt-wrapper-card" id="receipt-card-container">
                    <div class="receipt-watermark">
                        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgBBifAiiveIb1xVgQZv6AxAD_YCVu7JRmBqQOX2eeSJFxavzFEhsWQlYpN6b_aUIiUVCdNu39EHD2-tG1Li5b2Jx4U1DqTH98zbWgxmegb-xPADeDbJBdCqt-WhP71NUrFTlJLeEpZgVoAxEcUufpJNxMQs8nVE28Jj6Ch0LRjTnDBICBibZxxgwE7nFyB/s1600/Receipt%20%281%29.png" alt="Watermark" />
                    </div>

                    <div class="receipt-body">
                        <div class="rc-bismillah">“In the name of Allah, the Most Gracious, the Most Merciful”</div>
                        <div class="rc-brand-title">Mousumi Computer</div>
                        <div class="rc-services-desc">
                            All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash, <br>
                            Nagad, Rocket, Upay, Flexiload, and Computer Works.
                        </div>

                        <div class="rc-main-title">RECEIPT</div>

                        <table class="rc-sheet-table">
                            <tr>
                                <td class="rc-col-b">Receipt No</td>
                                <td class="rc-col-c">3546</td>
                            </tr>
                            <tr class="rc-section-end">
                                <td class="rc-col-b">Date</td>
                                <td class="rc-col-c">25-08-2026</td>
                            </tr>

                            <tr class="rc-section-start">
                                <td class="rc-col-b">Student Name</td>
                                <td class="rc-col-c">Amit Partho Roy</td>
                            </tr>
                            <tr class="rc-section-end">
                                <td class="rc-col-b">Student ID</td>
                                <td class="rc-col-c">602722</td>
                            </tr>

                            <tr class="rc-section-start">
                                <td class="rc-col-b">Tuition Fee</td>
                                <td class="rc-col-c">4,760.00</td>
                            </tr>
                            <tr>
                                <td class="rc-col-b">Charge</td>
                                <td class="rc-col-c">59.6</td>
                            </tr>
                            <tr class="rc-section-end">
                                <td class="rc-col-b">Total</td>
                                <td class="rc-col-c">4,819.60</td>
                            </tr>

                            <tr class="rc-payment-received-row">
                                <td colspan="2">Payment Received: 4819.6</td>
                            </tr>
                        </table>

                        <div class="paid-stamp-wrapper">
                            <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkW_Mz8uWQPQY8WqCQEVSh7ff6C8_ZE02lZw3o42e8QtmSIE8Sxgx_ejXTZmN_QNLHg0nfS5hrG4Mu2Y6NGCztsTnRZfvFuZ3bZzLAkMtvHxP6tkMxi9YUWcKG9gKXpJHrmnuWFFDAw0qIcAPb6WvHNVT_eiZkM2xDyI3HvRxrrqrpqyv8Zv2FIICwIQQr/s1600/Receipt.png" alt="PAID Stamp" class="paid-stamp-img" />
                        </div>

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

    // ৩. সেকশন ওপেন ফাংশন
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

    // ৪. আইসোলেটেড পারফেক্ট A5 প্রিন্টার ফাংশন (১০০% ফন্ট ও ইমেজ নিশ্চিতকরণ)
    window.printReceiptA5Clean = function () {
        let printFrame = document.getElementById('mc-isolated-print-frame');
        if (printFrame) printFrame.remove();

        printFrame = document.createElement('iframe');
        printFrame.id = 'mc-isolated-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);

        const cardContent = document.getElementById('receipt-card-container').innerHTML;

        const printDoc = printFrame.contentWindow.document;
        printDoc.open();
        printDoc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt_Print</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Lobster&family=Lora:ital,wght@1,400;1,500;1,600&family=Roboto+Mono:wght@400;500&family=Tiro+Bangla:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
                <style>
                    @page {
                        size: A5 portrait;
                        margin: 0;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        width: 100%;
                        height: 100%;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .receipt-wrapper-card {
                        background: #ffffff !important;
                        width: 136mm !important;
                        max-width: 136mm !important;
                        margin: 5mm auto 0 auto !important;
                        padding: 2mm 3mm !important;
                        position: relative !important;
                        box-sizing: border-box !important;
                        color: #000000 !important;
                        overflow: hidden !important;
                    }
                    .receipt-watermark {
                        position: absolute !important;
                        top: 41% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        width: 110mm !important;
                        opacity: 0.38 !important;
                        z-index: 1 !important;
                        text-align: center !important;
                    }
                    .receipt-watermark img {
                        width: 100% !important;
                        height: auto !important;
                        display: block !important;
                    }
                    .receipt-body {
                        position: relative !important;
                        z-index: 2 !important;
                    }
                    .rc-bismillah {
                        text-align: center !important;
                        font-family: 'Caveat', cursive !important;
                        font-size: 11pt !important;
                        font-weight: 600 !important;
                        color: #000 !important;
                        margin-bottom: 2px !important;
                        line-height: 1.15 !important;
                    }
                    .rc-brand-title {
                        text-align: center !important;
                        font-family: 'Lobster', cursive !important;
                        font-size: 28pt !important;
                        font-weight: normal !important;
                        color: #000 !important;
                        margin: 0 0 3px 0 !important;
                        line-height: 1.1 !important;
                    }
                    .rc-services-desc {
                        text-align: center !important;
                        font-family: 'EB Garamond', serif !important;
                        font-size: 10pt !important;
                        line-height: 1.25 !important;
                        color: #000 !important;
                        margin: 0 auto 8px auto !important;
                        max-width: 125mm !important;
                    }
                    .rc-main-title {
                        text-align: center !important;
                        font-family: 'Tiro Bangla', 'Times New Roman', serif !important;
                        font-size: 12pt !important;
                        font-weight: bold !important;
                        letter-spacing: 1.5px !important;
                        margin-bottom: 4px !important;
                        color: #000 !important;
                        text-transform: uppercase !important;
                    }
                    .rc-sheet-table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        border-top: 1.5px dotted #000 !important;
                    }
                    .rc-sheet-table td {
                        padding: 3.8px 6px !important;
                        color: #000 !important;
                        vertical-align: middle !important;
                        font-family: 'Tiro Bangla', 'Times New Roman', serif !important;
                        font-size: 13.5pt !important;
                        line-height: 1.2 !important;
                        border: none !important;
                    }
                    .rc-col-b {
                        width: 38% !important;
                        font-weight: bold !important;
                        border-right: 1.5px dotted #000 !important;
                        padding-left: 2px !important;
                    }
                    .rc-col-c {
                        width: 62% !important;
                        font-weight: normal !important;
                        padding-left: 12px !important;
                    }
                    .rc-section-end td {
                        border-bottom: 1.5px dotted #000 !important;
                        padding-bottom: 8px !important;
                    }
                    .rc-section-start td {
                        padding-top: 8px !important;
                    }
                    .rc-payment-received-row td {
                        text-align: center !important;
                        font-weight: bold !important;
                        font-size: 14pt !important;
                        padding: 6px 0 !important;
                        border-bottom: 1.5px dotted #000 !important;
                        border-right: none !important;
                    }
                    .paid-stamp-wrapper {
                        text-align: center !important;
                        margin: 10px 0 !important;
                    }
                    .paid-stamp-img {
                        width: 78px !important;
                        height: auto !important;
                        object-fit: contain !important;
                        display: inline-block !important;
                    }
                    .rc-footer-sign {
                        font-family: 'Tiro Bangla', 'Times New Roman', serif !important;
                        font-size: 10.5pt !important;
                        margin: 8px 0 10px 0 !important;
                        color: #000 !important;
                    }
                    .rc-footer-sign strong {
                        font-weight: bold !important;
                    }
                    .rc-disclaimer-mono {
                        text-align: center !important;
                        font-family: 'Roboto Mono', monospace !important;
                        font-size: 9pt !important;
                        line-height: 1.35 !important;
                        color: #000 !important;
                        margin-bottom: 4px !important;
                    }
                    .rc-disclaimer-lora {
                        text-align: center !important;
                        font-family: 'Lora', serif !important;
                        font-size: 9pt !important;
                        font-style: italic !important;
                        line-height: 1.3 !important;
                        color: #000 !important;
                    }
                </style>
            </head>
            <body>
                <div class="receipt-wrapper-card">
                    ${cardContent}
                </div>
            </body>
            </html>
        `);
        printDoc.close();

        // ফন্ট ও সকল ইমেজ সম্পূর্ণ লোড হওয়া নিশ্চিত করার পর প্রিন্ট ট্রিগার
        const triggerFinalPrint = () => {
            setTimeout(() => {
                printFrame.contentWindow.focus();
                printFrame.contentWindow.print();
            }, 350);
        };

        const images = printDoc.images;
        let loadedImages = 0;
        const totalImages = images.length;

        const checkAllReady = () => {
            if (printDoc.fonts && printDoc.fonts.ready) {
                printDoc.fonts.ready.then(() => {
                    triggerFinalPrint();
                }).catch(() => {
                    triggerFinalPrint();
                });
            } else {
                triggerFinalPrint();
            }
        };

        if (totalImages === 0) {
            checkAllReady();
        } else {
            for (let i = 0; i < totalImages; i++) {
                if (images[i].complete) {
                    loadedImages++;
                    if (loadedImages === totalImages) checkAllReady();
                } else {
                    images[i].onload = images[i].onerror = function () {
                        loadedImages++;
                        if (loadedImages === totalImages) checkAllReady();
                    };
                }
            }
        }
    };

    // সাইডবার অটো চেকার
    const autoChecker = setInterval(() => {
        if (injectTemplateModule()) {
            clearInterval(autoChecker);
        }
    }, 100);

    setTimeout(() => clearInterval(autoChecker), 5000);
})();
