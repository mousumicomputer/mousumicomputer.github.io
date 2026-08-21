/**
 * Mousumi Computer ERP - Instant Receipt Modal & Google Sheet Sync Bridge
 * Features: 0s Latency Instant Modal Preview, Direct 1-Click Print & PDF, Background Google Sheet Sync.
 */

(function () {
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyKE66KEqM1yoYihUfyhGptC3Txk2RCCuJuPqZvPcRy3dLYJUZiL2NuOEa-rphiFa-qBw/exec";

    // ১. পপআপ মোডালের জন্য প্রয়োজনীয় CSS ও HTML ইনজেক্ট করা
    function injectReceiptModal() {
        if (document.getElementById('receiptModalOverlay')) return;

        const css = `
            #receiptModalOverlay {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.7);
                backdrop-filter: blur(4px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                padding: 15px;
                box-sizing: border-box;
                animation: rcFadeIn 0.2s ease-out;
            }
            @keyframes rcFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .rc-modal-container {
                background: #ffffff;
                border-radius: 16px;
                max-width: 520px;
                width: 100%;
                max-height: 95vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
                display: flex;
                flex-direction: column;
            }
            .rc-modal-topbar {
                background: linear-gradient(135deg, #1e3a8a, #2563eb);
                color: #ffffff;
                padding: 14px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top-left-radius: 16px;
                border-top-right-radius: 16px;
            }
            .rc-modal-topbar h3 {
                margin: 0;
                font-size: 16px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .rc-close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: #fff;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;
            }
            .rc-close-btn:hover { background: rgba(255, 255, 255, 0.35); }
            
            .rc-modal-body {
                padding: 20px;
                background: #f8fafc;
            }

            /* গুগল শিটের হুবহু A5 সাইজ রিসিট ডিজাইন */
            #sheetReceiptTemplate {
                background: #ffffff;
                border: 2px solid #2563eb;
                border-radius: 10px;
                padding: 20px;
                color: #1e293b;
                box-sizing: border-box;
                font-family: Arial, sans-serif;
            }
            .rc-header {
                text-align: center;
                border-bottom: 2px solid #2563eb;
                padding-bottom: 10px;
                margin-bottom: 14px;
            }
            .rc-header h2 {
                margin: 0;
                color: #1e3a8a;
                font-size: 22px;
                font-weight: 900;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }
            .rc-header p {
                margin: 3px 0;
                font-size: 11px;
                color: #64748b;
                font-weight: 600;
            }
            .rc-badge {
                display: inline-block;
                background: #2563eb;
                color: #ffffff;
                padding: 4px 14px;
                border-radius: 20px;
                font-size: 11px;
                font-weight: 800;
                margin-top: 5px;
                letter-spacing: 0.5px;
            }
            .rc-meta-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                margin-bottom: 12px;
            }
            .rc-meta-table td {
                padding: 4px 0;
                color: #334155;
            }
            .rc-items-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                margin-bottom: 14px;
                border: 1px solid #cbd5e1;
            }
            .rc-items-table th {
                background: #f1f5f9;
                padding: 8px 10px;
                text-align: left;
                border: 1px solid #cbd5e1;
                color: #1e3a8a;
                font-weight: 700;
            }
            .rc-items-table td {
                padding: 8px 10px;
                border: 1px solid #cbd5e1;
                color: #334155;
            }
            .rc-total-row td {
                background: #eff6ff;
                font-weight: 800;
                font-size: 13.5px;
                color: #1e3a8a;
            }
            .rc-footer-sign {
                width: 100%;
                border-collapse: collapse;
                font-size: 11px;
                text-align: center;
                margin-top: 30px;
            }
            .rc-footer-sign td {
                padding-top: 15px;
                border-top: 1px dashed #94a3b8;
                width: 50%;
                color: #475569;
                font-weight: 600;
            }
            
            /* মোডাল নিচের বাটনসমূহ */
            .rc-modal-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 15px 20px;
                background: #ffffff;
                border-top: 1px solid #e2e8f0;
                border-bottom-left-radius: 16px;
                border-bottom-right-radius: 16px;
            }
            .rc-btn {
                padding: 10px 18px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                border: none;
                transition: 0.2s;
            }
            .rc-btn-print { background: #2563eb; color: #ffffff; }
            .rc-btn-print:hover { background: #1d4ed8; }
            .rc-btn-download { background: #10b981; color: #ffffff; }
            .rc-btn-download:hover { background: #059669; }
            .rc-btn-close { background: #e2e8f0; color: #475569; }
            .rc-btn-close:hover { background: #cbd5e1; }
        `;

        const style = document.createElement('style');
        style.innerText = css;
        document.head.appendChild(style);

        const modalHTML = `
            <div id="receiptModalOverlay">
                <div class="rc-modal-container">
                    <div class="rc-modal-topbar">
                        <h3><i class="fa-solid fa-circle-check"></i> ফি কালেকশন সফল হয়েছে</h3>
                        <button type="button" class="rc-close-btn" onclick="window.closeReceiptModal()">&times;</button>
                    </div>
                    <div class="rc-modal-body">
                        <!-- প্রিন্ট/ডাউনলোডের মূল রিসিট কনটেন্ট -->
                        <div id="sheetReceiptTemplate">
                            <div class="rc-header">
                                <h2>MOUSUMI COMPUTER</h2>
                                <p>Education & Digital Financial Services Center</p>
                                <div class="rc-badge">TUITION FEE MONEY RECEIPT</div>
                            </div>
                            <table class="rc-meta-table">
                                <tr>
                                    <td><strong>Receipt No:</strong> <span id="rcSerialNo">#1001</span></td>
                                    <td style="text-align: right;"><strong>Date:</strong> <span id="rcDate">--</span></td>
                                </tr>
                                <tr>
                                    <td><strong>Student ID:</strong> <span id="rcStudentId">--</span></td>
                                    <td style="text-align: right;"><strong>Status:</strong> <span style="color:#16a34a; font-weight:800;">PAID</span></td>
                                </tr>
                                <tr>
                                    <td colspan="2"><strong>Student Name:</strong> <span id="rcStudentName">--</span></td>
                                </tr>
                            </table>
                            <table class="rc-items-table">
                                <thead>
                                    <tr>
                                        <th>Description</th>
                                        <th style="text-align: right; width: 120px;">Amount (৳)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Net Tuition Fee Due</td>
                                        <td style="text-align: right;" id="rcNetDue">৳ 0.00</td>
                                    </tr>
                                    <tr>
                                        <td>Processing & Txn Fee (1% + ৳6)</td>
                                        <td style="text-align: right;" id="rcTxnFee">৳ 0.00</td>
                                    </tr>
                                    <tr id="rcDiscountRow" style="display:none; color:#ef4444;">
                                        <td>Discount / Concession</td>
                                        <td style="text-align: right;" id="rcDiscount">- ৳ 0.00</td>
                                    </tr>
                                    <tr class="rc-total-row">
                                        <td>Total Payment Received</td>
                                        <td style="text-align: right; color:#16a34a;" id="rcNetRec">৳ 0.00</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style="font-size: 10.5px; color: #64748b; margin-top: 5px;">
                                <strong>Payment Method:</strong> Cash / Digital Counter | <strong>Verified by:</strong> Mousumi Computer ERP
                            </div>
                            <table class="rc-footer-sign">
                                <tr>
                                    <td>Customer Signature</td>
                                    <td>Authorized Seal & Signature</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    <div class="rc-modal-actions">
                        <button type="button" class="rc-btn rc-btn-close" onclick="window.closeReceiptModal()">বন্ধ করুন</button>
                        <button type="button" class="rc-btn rc-btn-download" onclick="window.downloadReceiptPDF()"><i class="fa-solid fa-file-pdf"></i> PDF ডাউনলোড</button>
                        <button type="button" class="rc-btn rc-btn-print" onclick="window.printDirectReceipt()"><i class="fa-solid fa-print"></i> সরাসরি প্রিন্ট</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // ২. রিসিট মোডাল ওপেন ও ডাটা সেট করা (০ সেকেন্ডে)
    let currentReceiptData = null;

    function showReceiptModal(data) {
        currentReceiptData = data;
        const fmt = (num) => (parseFloat(num) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        document.getElementById('rcSerialNo').innerText = '#' + data.serialNumber;
        document.getElementById('rcDate').innerText = data.date;
        document.getElementById('rcStudentId').innerText = data.studentId;
        document.getElementById('rcStudentName').innerText = data.studentName;
        document.getElementById('rcNetDue').innerText = '৳ ' + fmt(data.netDue);
        document.getElementById('rcTxnFee').innerText = '৳ ' + fmt(data.totalCharge);
        document.getElementById('rcNetRec').innerText = '৳ ' + fmt(data.netReceived);

        const discRow = document.getElementById('rcDiscountRow');
        if (data.discount > 0) {
            discRow.style.display = 'table-row';
            document.getElementById('rcDiscount').innerText = '- ৳ ' + fmt(data.discount);
        } else {
            discRow.style.display = 'none';
        }

        const overlay = document.getElementById('receiptModalOverlay');
        if (overlay) overlay.style.display = 'flex';
    }

    window.closeReceiptModal = function () {
        const overlay = document.getElementById('receiptModalOverlay');
        if (overlay) overlay.style.display = 'none';
    };

    // ৩. সরাসরি ১-ক্লিক প্রিন্ট ফাংশন
    window.printDirectReceipt = function () {
        const content = document.getElementById('sheetReceiptTemplate');
        if (!content) return;

        const printWindow = window.open('', '_blank', 'width=600,height=750');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Money Receipt - ${currentReceiptData?.studentId || ''}</title>
                    <style>
                        @page { size: A5 portrait; margin: 10mm; }
                        body { margin: 0; padding: 10px; font-family: Arial, sans-serif; }
                        #sheetReceiptTemplate { border: 2px solid #2563eb; border-radius: 10px; padding: 20px; }
                        .rc-header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 14px; }
                        .rc-header h2 { margin: 0; color: #1e3a8a; font-size: 22px; text-transform: uppercase; }
                        .rc-header p { margin: 3px 0; font-size: 11px; color: #64748b; }
                        .rc-badge { display: inline-block; background: #2563eb; color: #ffffff; padding: 4px 14px; border-radius: 20px; font-size: 11px; font-weight: bold; margin-top: 5px; }
                        .rc-meta-table, .rc-items-table, .rc-footer-sign { width: 100%; border-collapse: collapse; font-size: 12px; }
                        .rc-meta-table td { padding: 4px 0; }
                        .rc-items-table { border: 1px solid #cbd5e1; margin: 12px 0; }
                        .rc-items-table th, .rc-items-table td { border: 1px solid #cbd5e1; padding: 8px 10px; }
                        .rc-items-table th { background: #f1f5f9; color: #1e3a8a; }
                        .rc-total-row td { background: #eff6ff; font-weight: bold; font-size: 13.5px; color: #1e3a8a; }
                        .rc-footer-sign { margin-top: 40px; text-align: center; }
                        .rc-footer-sign td { border-top: 1px dashed #94a3b8; padding-top: 15px; width: 50%; }
                    </style>
                </head>
                <body>
                    ${content.outerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 300);
    };

    // ৪. সরাসরি ১-ক্লিক PDF ডাউনলোড ফাংশন
    window.downloadReceiptPDF = function () {
        const element = document.getElementById('sheetReceiptTemplate');
        if (!element) return;

        const opt = {
            margin: 8,
            filename: `Receipt_${currentReceiptData?.serialNumber || '00'}_${currentReceiptData?.studentId || ''}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
        };

        if (typeof html2pdf !== 'undefined') {
            html2pdf().set(opt).from(element).save();
        } else {
            window.print();
        }
    };

    // ৫. ফর্ম সাবমিট ক্যাপচার ও ব্যাকগ্রাউন্ড সিঙ্ক
    function attachSubmitListener() {
        injectReceiptModal();
        const form = document.getElementById('feeFormOriginal');
        if (!form) return;

        let localSerial = parseInt(localStorage.getItem('mc_fee_serial') || '1000') + 1;

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

            // সিরিয়াল নম্বর বৃদ্ধি ও সেভ
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

            localSerial++; // পরবর্তী এন্ট্রির জন্য সিরিয়াল বাড়ানো হলো

            // ⚡ ধাপ ১: কোনো ডিলে ছাড়া চোখের পলকে মোডাল রিসিট ওপেন করা
            showReceiptModal(receiptPayload);

            // ⚡ ধাপ ২: পর্দার আড়ালে (Asynchronously) গুগল শিটে ডাটা পাঠানো (ইউজারকে অপেক্ষা করতে হবে না)
            fetch(GOOGLE_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(receiptPayload)
            })
            .then(res => res.json())
            .then(resData => {
                console.log("Google Sheet Background Sync Completed:", resData);
            })
            .catch(err => {
                console.warn("Google Sheet Background Sync Warning:", err);
            });

        }, true);
    }

    if (document.readyState === 'complete') {
        attachSubmitListener();
    } else {
        window.addEventListener('load', attachSubmitListener);
    }
})();
