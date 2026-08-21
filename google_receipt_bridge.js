/**
 * Mousumi Computer ERP - High-Precision SVG/Canvas Template Overlay Receipt Engine
 * 100% Vector Sharpness, 0.01s Instant Preview, Direct Print & PDF Export.
 */

(function () {
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyKE66KEqM1yoYihUfyhGptC3Txk2RCCuJuPqZvPcRy3dLYJUZiL2NuOEa-rphiFa-qBw/exec";

    // ১. পপআপ মোডাল ও স্টাইল ইনজেক্ট করা
    function injectTemplateModal() {
        if (document.getElementById('receiptTemplateModalOverlay')) return;

        const css = `
            #receiptTemplateModalOverlay {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.75);
                backdrop-filter: blur(4px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                padding: 15px;
                box-sizing: border-box;
            }
            .tpl-modal-box {
                background: #ffffff;
                border-radius: 14px;
                max-width: 480px;
                width: 100%;
                max-height: 96vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                display: flex;
                flex-direction: column;
            }
            .tpl-modal-header {
                background: #1e293b;
                color: #ffffff;
                padding: 12px 18px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top-left-radius: 14px;
                border-top-right-radius: 14px;
            }
            .tpl-modal-header h4 { margin: 0; font-size: 15px; font-weight: 700; }
            .tpl-close-btn { background: transparent; border: none; color: #fff; font-size: 20px; cursor: pointer; }
            .tpl-modal-body {
                padding: 15px;
                background: #f1f5f9;
                display: flex;
                justify-content: center;
            }

            /* SVG রিসিট কন্টেইনার */
            #svgReceiptWrapper {
                background: #ffffff;
                box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                border-radius: 4px;
                width: 100%;
                max-width: 420px;
            }

            .tpl-modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 12px 18px;
                background: #ffffff;
                border-top: 1px solid #e2e8f0;
                border-bottom-left-radius: 14px;
                border-bottom-right-radius: 14px;
            }
            .tpl-btn {
                padding: 9px 16px;
                border-radius: 6px;
                font-size: 13.5px;
                font-weight: 700;
                cursor: pointer;
                border: none;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: 0.2s;
            }
            .tpl-btn-print { background: #2563eb; color: #fff; }
            .tpl-btn-print:hover { background: #1d4ed8; }
            .tpl-btn-download { background: #16a34a; color: #fff; }
            .tpl-btn-download:hover { background: #15803d; }
            .tpl-btn-close { background: #e2e8f0; color: #475569; }
            .tpl-btn-close:hover { background: #cbd5e1; }
        `;

        const style = document.createElement('style');
        style.innerText = css;
        document.head.appendChild(style);

        const modalHTML = `
            <div id="receiptTemplateModalOverlay">
                <div class="tpl-modal-box">
                    <div class="tpl-modal-header">
                        <h4>Money Receipt Preview</h4>
                        <button class="tpl-close-btn" onclick="window.closeTemplateModal()">&times;</button>
                    </div>
                    <div class="tpl-modal-body">
                        <div id="svgReceiptWrapper"></div>
                    </div>
                    <div class="tpl-modal-footer">
                        <button type="button" class="tpl-btn tpl-btn-close" onclick="window.closeTemplateModal()">বন্ধ করুন</button>
                        <button type="button" class="tpl-btn tpl-btn-download" onclick="window.downloadTemplatePDF()"><i class="fa-solid fa-file-pdf"></i> PDF ডাউনলোড</button>
                        <button type="button" class="tpl-btn tpl-btn-print" onclick="window.printTemplateReceipt()"><i class="fa-solid fa-print"></i> সরাসরি প্রিন্ট</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ২. ছবির মতো নিখুঁত ভেক্টর SVG টেমপ্লেট জেনারেটর
    function generateVectorReceiptSVG(data) {
        const fmt = (n) => (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const clean = (n) => {
            const val = parseFloat(n) || 0;
            return val % 1 === 0 ? val.toString() : val.toFixed(1);
        };

        // তারিখ dd-mm-yyyy তে রূপান্তর
        let dateStr = data.date;
        if (dateStr && dateStr.includes('-')) {
            const parts = dateStr.split('-');
            if (parts[0].length === 4) dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }

        return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="100%" height="100%" style="background:#ffffff; font-family:'Times New Roman', serif;">
            <defs>
                <style>
                    .bismillah { font-size: 11px; font-style: italic; text-anchor: middle; fill: #222; }
                    .brand-title { font-size: 32px; font-weight: 900; font-style: italic; text-anchor: middle; fill: #000; font-family:'Georgia', serif; }
                    .brand-sub { font-size: 10px; text-anchor: middle; fill: #222; }
                    .tbl-title { font-size: 13.5px; font-weight: bold; text-anchor: middle; fill: #000; letter-spacing: 1px; }
                    .lbl-text { font-size: 14px; font-weight: bold; fill: #000; }
                    .val-text { font-size: 14px; font-weight: bold; fill: #111; }
                    .pay-banner { font-size: 15px; font-weight: 900; text-anchor: middle; fill: #000; }
                    .received-by { font-size: 12px; font-weight: bold; fill: #000; }
                    .footer-note { font-size: 11px; text-anchor: middle; fill: #222; }
                    .dotted-line { stroke: #333; stroke-width: 1.1; stroke-dasharray: 2, 2; }
                    .watermark-main { font-size: 160px; font-weight: bold; fill: rgba(0, 0, 0, 0.05); text-anchor: middle; font-family: 'Times New Roman', serif; }
                    .watermark-sub { font-size: 30px; font-weight: bold; fill: rgba(0, 0, 0, 0.055); text-anchor: middle; font-family: 'Times New Roman', serif; }
                </style>
            </defs>

            <!-- ১. ব্যাকগ্রাউন্ড ওয়াটারমার্ক -->
            <g transform="translate(250, 360)">
                <text x="0" y="0" class="watermark-main">MC</text>
                <text x="0" y="32" class="watermark-sub">Mousumi Computer</text>
            </g>

            <!-- ২. হেডার ইনফরমেশন -->
            <text x="250" y="35" class="bismillah">"In the name of Allah, the Most Gracious, the Most Merciful"</text>
            <text x="250" y="70" class="brand-title">Mousumi Computer</text>
            <text x="250" y="90" class="brand-sub">All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash,</text>
            <text x="250" y="103" class="brand-sub">Nagad, Rocket, Upay, Flexiload, and Computer Works.</text>

            <!-- ৩. রিসিট টেবিল (ডটেড বর্ডার সহ) -->
            <!-- Top Line of RECEIPT -->
            <line x1="30" y1="130" x2="470" y2="130" class="dotted-line" />
            <text x="250" y="145" class="tbl-title">RECEIPT</text>
            <!-- Header Bottom Line -->
            <line x1="30" y1="155" x2="470" y2="155" class="dotted-line" />

            <!-- ভার্টিকাল ডটেড ডিভাইডার -->
            <line x1="180" y1="155" x2="180" y2="340" class="dotted-line" />

            <!-- Row 1: Receipt No -->
            <text x="35" y="175" class="lbl-text">Receipt No</text>
            <text x="190" y="175" class="val-text">${data.serialNumber}</text>
            <line x1="30" y1="185" x2="470" y2="185" class="dotted-line" />

            <!-- Row 2: Date -->
            <text x="35" y="205" class="lbl-text">Date</text>
            <text x="190" y="205" class="val-text">${dateStr}</text>
            <line x1="30" y1="218" x2="470" y2="218" class="dotted-line" />

            <!-- Row 3: Student Name -->
            <text x="35" y="240" class="lbl-text">Student Name</text>
            <text x="190" y="240" class="val-text">${data.studentName}</text>
            <line x1="30" y1="252" x2="470" y2="252" class="dotted-line" />

            <!-- Row 4: Student ID -->
            <text x="35" y="272" class="lbl-text">Student ID</text>
            <text x="190" y="272" class="val-text">${data.studentId}</text>
            <line x1="30" y1="285" x2="470" y2="285" class="dotted-line" />

            <!-- Row 5: Tuition Fee -->
            <text x="35" y="306" class="lbl-text">Tuition Fee</text>
            <text x="190" y="306" class="val-text">${fmt(data.netDue)}</text>
            <line x1="30" y1="316" x2="470" y2="316" class="dotted-line" />

            <!-- Row 6: Charge -->
            <text x="35" y="336" class="lbl-text">Charge</text>
            <text x="190" y="336" class="val-text">${clean(data.totalCharge)}</text>
            <line x1="30" y1="346" x2="470" y2="346" class="dotted-line" />

            <!-- Row 7: Total -->
            <text x="35" y="366" class="lbl-text">Total</text>
            <text x="190" y="366" class="val-text">${fmt(data.netReceived)}</text>
            <line x1="30" y1="376" x2="470" y2="376" class="dotted-line" />

            <!-- ৪. পেমেন্ট রিসিভড হাইলাইট বার -->
            <text x="250" y="398" class="pay-banner">Payment Received: ${clean(data.netReceived)}</text>
            <line x1="30" y1="410" x2="470" y2="410" class="dotted-line" />

            <!-- ৫. পেইড স্ট্যাম্প (PAID STAMP) -->
            <g transform="translate(250, 460) rotate(-7)">
                <circle cx="0" cy="0" r="34" fill="none" stroke="#000" stroke-width="2" stroke-dasharray="3, 2" />
                <circle cx="0" cy="0" r="29" fill="none" stroke="#000" stroke-width="1.2" />
                <text x="0" y="-14" font-size="7" font-weight="bold" text-anchor="middle" letter-spacing="0.5">★ THANK YOU ★</text>
                <text x="0" y="5" font-size="16" font-weight="900" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="1">PAID</text>
                <text x="0" y="18" font-size="7" font-weight="bold" text-anchor="middle">★★★★★</text>
            </g>

            <!-- ৬. ফুটার টেক্সট -->
            <text x="35" y="555" class="received-by">Received By: <tspan font-weight="normal">Riyal Robiul</tspan></text>
            
            <text x="250" y="610" class="footer-note">This is a computer-generated receipt.</text>
            <text x="250" y="625" class="footer-note">Thank you for your payment.</text>
            <text x="250" y="648" class="footer-note" font-size="10px">For any queries or assistance, please contact</text>
            <text x="250" y="662" class="footer-note" font-size="10px">Md. Robiul Islam at 01608-314552 or 01893-201584.</text>
        </svg>
        `;
    }

    let activeData = null;

    function showTemplateReceipt(data) {
        activeData = data;
        const container = document.getElementById('svgReceiptWrapper');
        if (container) {
            container.innerHTML = generateVectorReceiptSVG(data);
        }
        const overlay = document.getElementById('receiptTemplateModalOverlay');
        if (overlay) overlay.style.display = 'flex';
    }

    window.closeTemplateModal = function () {
        const overlay = document.getElementById('receiptTemplateModalOverlay');
        if (overlay) overlay.style.display = 'none';
    };

    // ১-ক্লিকে ব্রাউজার সরাসরি প্রিন্ট
    window.printTemplateReceipt = function () {
        const svgContent = document.getElementById('svgReceiptWrapper')?.innerHTML;
        if (!svgContent) return;

        const printWin = window.open('', '_blank', 'width=600,height=800');
        printWin.document.write(`
            <html>
                <head>
                    <title>Receipt_${activeData?.serialNumber || ''}</title>
                    <style>
                        @page { size: A5 portrait; margin: 5mm; }
                        body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: #fff; }
                        svg { width: 100%; max-width: 140mm; height: auto; }
                    </style>
                </head>
                <body>
                    ${svgContent}
                </body>
            </html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
            printWin.print();
            printWin.close();
        }, 250);
    };

    // ১-ক্লিকে A5 PDF ডাউনলোড
    window.downloadTemplatePDF = function () {
        const element = document.getElementById('svgReceiptWrapper');
        if (!element) return;

        const opt = {
            margin: 6,
            filename: `Receipt_${activeData?.serialNumber || '3465'}_${activeData?.studentId || ''}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
        };

        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(element).save();
        } else {
            window.printTemplateReceipt();
        }
    };

    // সাবমিট লিসেনার
    function initBridge() {
        injectTemplateModal();
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

            // ⚡ ০.০১ সেকেন্ডে স্ক্রিনে ভেক্টর রিসিট ওপেন
            showTemplateReceipt(receiptPayload);

            // ⚡ ব্যাকগ্রাউন্ডে গুগল শিটে ডাটা পাঠানো (ইউজারের কোনো লোডিং থাকবে না)
            fetch(GOOGLE_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(receiptPayload)
            }).catch(() => {});

        }, true);
    }

    if (document.readyState === 'complete') {
        initBridge();
    } else {
        window.addEventListener('load', initBridge);
    }
})();
