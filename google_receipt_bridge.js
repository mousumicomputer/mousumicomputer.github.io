/**
 * Mousumi Computer ERP - Pixel-Perfect A5 Receipt Module (Exact Sheet Match)
 * Replicates the exact typography, dotted layout, watermark, and paid stamp.
 */

(function () {
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyKE66KEqM1yoYihUfyhGptC3Txk2RCCuJuPqZvPcRy3dLYJUZiL2NuOEa-rphiFa-qBw/exec";

    function injectReceiptModal() {
        if (document.getElementById('receiptModalOverlay')) return;

        const css = `
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Great+Vibes&family=Playfair+Display:ital,wght@1,600&family=Roboto+Mono:wght@400;600;700&display=swap');

            #receiptModalOverlay {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.75);
                backdrop-filter: blur(5px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                padding: 15px;
                box-sizing: border-box;
            }
            .rc-modal-box {
                background: #ffffff;
                border-radius: 12px;
                max-width: 500px;
                width: 100%;
                max-height: 95vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                display: flex;
                flex-direction: column;
            }
            .rc-modal-header {
                background: #1e293b;
                color: #ffffff;
                padding: 12px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .rc-modal-header h4 { margin: 0; font-size: 15px; font-weight: 600; }
            .rc-close {
                background: transparent; border: none; color: #fff; font-size: 20px; cursor: pointer;
            }

            /* --- নিখুঁত রিসিট ডিজাইন (A5 Portrait Layout) --- */
            #mc-official-receipt-print {
                width: 100%;
                background: #ffffff;
                color: #000000;
                padding: 25px 30px;
                box-sizing: border-box;
                font-family: 'Times New Roman', Times, serif;
                position: relative;
                overflow: hidden;
            }

            /* ব্যাকগ্রাউন্ড ওয়াটারমার্ক */
            .rc-watermark {
                position: absolute;
                top: 48%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 140px;
                font-family: 'Times New Roman', serif;
                font-weight: bold;
                color: rgba(0, 0, 0, 0.045);
                user-select: none;
                pointer-events: none;
                z-index: 0;
                line-height: 0.9;
                text-align: center;
                width: 100%;
            }
            .rc-watermark-sub {
                font-size: 32px;
                display: block;
                letter-spacing: 2px;
                color: rgba(0, 0, 0, 0.05);
            }

            .rc-content-layer {
                position: relative;
                z-index: 1;
            }

            .rc-top-bismillah {
                text-align: center;
                font-style: italic;
                font-size: 11px;
                color: #333333;
                margin-bottom: 6px;
            }

            .rc-shop-name {
                text-align: center;
                font-size: 30px;
                font-weight: 900;
                font-family: 'Georgia', 'Times New Roman', serif;
                font-style: italic;
                margin: 0;
                line-height: 1.1;
                letter-spacing: -0.5px;
            }

            .rc-services-sub {
                text-align: center;
                font-size: 10px;
                color: #222222;
                margin-top: 6px;
                margin-bottom: 18px;
                line-height: 1.35;
                font-style: normal;
            }

            /* ডটেড গ্রিড টেবিল */
            .rc-grid-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13.5px;
            }
            .rc-grid-table td {
                padding: 4px 6px;
                vertical-align: middle;
                border: 1px dotted #444444;
            }
            .rc-cell-title {
                font-weight: 900;
                width: 35%;
                font-size: 14px;
            }
            .rc-cell-val {
                font-weight: 600;
                width: 65%;
            }
            .rc-header-cell {
                text-align: center;
                font-weight: 900;
                font-size: 13px;
                letter-spacing: 1px;
                border-top: 1px dotted #444444 !important;
                border-bottom: 1px dotted #444444 !important;
                border-left: none !important;
                border-right: none !important;
                padding: 3px 0;
            }

            .rc-payment-banner {
                text-align: center;
                font-size: 15px;
                font-weight: 900;
                padding: 5px 0;
                border-top: 1px dotted #444444;
                border-bottom: 1px dotted #444444;
                margin-top: 4px;
                margin-bottom: 12px;
            }

            /* পেইড স্ট্যাম্প */
            .rc-stamp-wrapper {
                text-align: center;
                margin: 12px 0 16px 0;
            }
            .rc-paid-stamp {
                display: inline-block;
                border: 2px dashed #111111;
                border-radius: 50%;
                width: 64px;
                height: 64px;
                padding: 3px;
                box-sizing: border-box;
                transform: rotate(-8deg);
            }
            .rc-paid-stamp-inner {
                border: 1.5px solid #111111;
                border-radius: 50%;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                box-sizing: border-box;
            }
            .rc-paid-stamp-inner span {
                font-size: 6.5px;
                font-weight: bold;
                letter-spacing: 0.5px;
            }
            .rc-paid-stamp-inner strong {
                font-size: 14px;
                font-weight: 900;
                letter-spacing: 1px;
                line-height: 1;
            }

            /* ফুটার */
            .rc-received-by {
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 18px;
            }
            .rc-received-by span {
                font-weight: normal;
                margin-left: 5px;
            }
            .rc-footer-text {
                text-align: center;
                font-size: 11px;
                color: #222222;
                line-height: 1.4;
            }

            .rc-btn-bar {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 12px 20px;
                background: #f1f5f9;
                border-top: 1px solid #e2e8f0;
            }
            .rc-btn-action {
                padding: 9px 16px;
                border-radius: 6px;
                font-size: 13.5px;
                font-weight: bold;
                cursor: pointer;
                border: none;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .rc-btn-p { background: #2563eb; color: #fff; }
            .rc-btn-d { background: #16a34a; color: #fff; }
            .rc-btn-c { background: #cbd5e1; color: #334155; }
        `;

        const style = document.createElement('style');
        style.innerText = css;
        document.head.appendChild(style);

        const modalHTML = `
            <div id="receiptModalOverlay">
                <div class="rc-modal-box">
                    <div class="rc-modal-header">
                        <h4>Receipt Preview</h4>
                        <button class="rc-close" onclick="window.closeReceiptModal()">&times;</button>
                    </div>
                    <div style="padding: 10px; background: #e2e8f0;">
                        
                        <!-- মূল রিসিট প্রিন্ট এলাকা -->
                        <div id="mc-official-receipt-print">
                            <!-- ওয়াটারমার্ক -->
                            <div class="rc-watermark">
                                MC
                                <span class="rc-watermark-sub">Mousumi Computer</span>
                            </div>

                            <div class="rc-content-layer">
                                <div class="rc-top-bismillah">"In the name of Allah, the Most Gracious, the Most Merciful"</div>
                                <h1 class="rc-shop-name">Mousumi Computer</h1>
                                <div class="rc-services-sub">
                                    All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash,<br>
                                    Nagad, Rocket, Upay, Flexiload, and Computer Works.
                                </div>

                                <table class="rc-grid-table">
                                    <tr>
                                        <td colspan="2" class="rc-header-cell">RECEIPT</td>
                                    </tr>
                                    <tr>
                                        <td class="rc-cell-title">Receipt No</td>
                                        <td class="rc-cell-val" id="rPrintSerial">3465</td>
                                    </tr>
                                    <tr>
                                        <td class="rc-cell-title">Date</td>
                                        <td class="rc-cell-val" id="rPrintDate">21-08-2026</td>
                                    </tr>
                                    <tr>
                                        <td class="rc-cell-title">Student Name</td>
                                        <td class="rc-cell-val" id="rPrintName">Md. Jobayer Ahmed Joy</td>
                                    </tr>
                                    <tr>
                                        <td class="rc-cell-title">Student ID</td>
                                        <td class="rc-cell-val" id="rPrintId">804325</td>
                                    </tr>
                                    <tr>
                                        <td class="rc-cell-title">Tuition Fee</td>
                                        <td class="rc-cell-val" id="rPrintDue">4,760.00</td>
                                    </tr>
                                    <tr>
                                        <td class="rc-cell-title">Charge</td>
                                        <td class="rc-cell-val" id="rPrintCharge">59.6</td>
                                    </tr>
                                    <tr>
                                        <td class="rc-cell-title">Total</td>
                                        <td class="rc-cell-val" id="rPrintTotal">4,819.60</td>
                                    </tr>
                                </table>

                                <div class="rc-payment-banner">
                                    Payment Received: <span id="rPrintReceived">4819.6</span>
                                </div>

                                <div class="rc-stamp-wrapper">
                                    <div class="rc-paid-stamp">
                                        <div class="rc-paid-stamp-inner">
                                            <span>★ THANK YOU ★</span>
                                            <strong>PAID</strong>
                                            <span>★★★★★</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="rc-received-by">
                                    Received By: <span>Riyal Robiul</span>
                                </div>

                                <div class="rc-footer-text">
                                    This is a computer-generated receipt.<br>
                                    Thank you for your payment.<br>
                                    <span style="font-size: 10px; margin-top: 3px; display: inline-block;">
                                        For any queries or assistance, please contact<br>
                                        Md. Robiul Islam at 01608-314552 or 01893-201584.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rc-btn-bar">
                        <button type="button" class="rc-btn-action rc-btn-c" onclick="window.closeReceiptModal()">Close</button>
                        <button type="button" class="rc-btn-action rc-btn-d" onclick="window.downloadReceiptPDF()"><i class="fa-solid fa-file-pdf"></i> Download PDF</button>
                        <button type="button" class="rc-btn-action rc-btn-p" onclick="window.printDirectReceipt()"><i class="fa-solid fa-print"></i> Print Receipt</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    let activeReceiptData = null;

    function renderReceipt(data) {
        activeReceiptData = data;
        const fmt = (n) => (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const clean = (n) => {
            const val = parseFloat(n) || 0;
            return val % 1 === 0 ? val.toString() : val.toFixed(1);
        };

        // তারিখ ফরম্যাট dd-mm-yyyy তে রূপান্তর
        let displayDate = data.date;
        if (displayDate && displayDate.includes('-')) {
            const parts = displayDate.split('-');
            if (parts[0].length === 4) {
                displayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
        }

        document.getElementById('rPrintSerial').innerText = data.serialNumber;
        document.getElementById('rPrintDate').innerText = displayDate;
        document.getElementById('rPrintName').innerText = data.studentName;
        document.getElementById('rPrintId').innerText = data.studentId;
        document.getElementById('rPrintDue').innerText = fmt(data.netDue);
        document.getElementById('rPrintCharge').innerText = clean(data.totalCharge);
        document.getElementById('rPrintTotal').innerText = fmt(data.netReceived);
        document.getElementById('rPrintReceived').innerText = clean(data.netReceived);

        document.getElementById('receiptModalOverlay').style.display = 'flex';
    }

    window.closeReceiptModal = function () {
        document.getElementById('receiptModalOverlay').style.display = 'none';
    };

    // সরাসরি প্রিন্ট ফাংশন
    window.printDirectReceipt = function () {
        const content = document.getElementById('mc-official-receipt-print');
        if (!content) return;

        const printWin = window.open('', '_blank', 'width=550,height=750');
        printWin.document.write(`
            <html>
                <head>
                    <title>Receipt_${activeReceiptData?.serialNumber || ''}</title>
                    <style>
                        @page { size: A5 portrait; margin: 8mm; }
                        body { margin: 0; padding: 0; background: #fff; }
                        ${document.querySelector('style').innerText}
                    </style>
                </head>
                <body>
                    ${content.outerHTML}
                </body>
            </html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
            printWin.print();
            printWin.close();
        }, 350);
    };

    // সরাসরি PDF ডাউনলোড
    window.downloadReceiptPDF = function () {
        const element = document.getElementById('mc-official-receipt-print');
        if (!element) return;

        const opt = {
            margin: 6,
            filename: `Receipt_${activeReceiptData?.serialNumber || '3465'}_${activeReceiptData?.studentId || ''}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2.5, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
        };

        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(element).save();
        } else {
            window.print();
        }
    };

    function attachSubmitListener() {
        injectReceiptModal();
        const form = document.getElementById('feeFormOriginal');
        if (!form) return;

        let localSerial = parseInt(localStorage.getItem('mc_fee_serial') || '3465') + 1;

        form.addEventListener('submit', function (e) {
            const studentId = document.getElementById('origId')?.value.trim();
            const studentName = document.getElementById('origName')?.value.trim();
            const netDue = parseFloat(document.getElementById('origDue')?.value) || 0;
            const txnFee = parseFloat(document.getElementById('origTxn')?.value) || 0;
            const totalCharge = parseFloat(document.getElementById('origCharge')?.innerText) || (netDue * 0.01 + txnFee);
            const discount = parseFloat(document.getElementById('origDisc')?.value) || 0;
            const netReceived = parseFloat(document.getElementById('origRec')?.value) || (netDue + totalCharge);
            const date = document.getElementById('origDate')?.value || new Date().toISOString().split('T')[0];

            if (!studentId || netReceived <= 0) return;

            localStorage.setItem('mc_fee_serial', localSerial.toString());

            const receiptPayload = {
                serialNumber: localSerial,
                studentId: studentId,
                studentName: studentName || 'Student',
                netDue: netDue,
                txnFee: txnFee,
                totalCharge: totalCharge,
                discount: discount,
                netReceived: netReceived,
                date: date
            };

            localSerial++;

            // ১. ০ সেকেন্ডে স্ক্রিনে হুবহু ডিজাইনের রিসিট ওপেন
            renderReceipt(receiptPayload);

            // ২. ব্যাকগ্রাউন্ডে গুগল শিটে ডাটা পাঠানো (ইউজার ইন্টারফেসে কোনো ল্যাগ ছাড়া)
            fetch(GOOGLE_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(receiptPayload)
            }).catch(() => {});

        }, true);
    }

    if (document.readyState === 'complete') {
        attachSubmitListener();
    } else {
        window.addEventListener('load', attachSubmitListener);
    }
})();
