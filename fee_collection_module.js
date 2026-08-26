/**
 * Mousumi Computer ERP - Education & Digital Services Module
 * Features: Restored Exact Receipt Layout, Icon-Only Software Toolbar, PDF Download, Auto SL & Pagination.
 */

(function () {
    let studentDueList = [];
    let firebaseCore = null;
    let feeTransactionsList = [];
    let selectedStudentRawDue = 0;
    let selectedStudentData = null;

    // পেজিনেশন স্টেট
    let currentPage = 1;
    let rowsPerPage = 25;
    let currentSearchQuery = "";

    // ১. মডিউল সিএসএস
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        #edu-module-container, #edu-module-container * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }

        /* --- SECTION 1 STYLE --- */
        .edu-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            width: 100%;
            max-width: 900px;
            overflow: hidden;
            border: 1px solid #e1e4e8;
            margin: 0 auto;
        }
        .edu-card-header {
            background-color: #34495e;
            color: #ffffff;
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .edu-card-header h2 { font-size: 20px !important; font-weight: 600 !important; margin: 0; }
        .edu-badge { background: #2c3e50; padding: 4px 10px; border-radius: 4px; font-size: 14px !important; color: #bdc3c7; }
        .edu-card-body { padding: 25px; }
        .edu-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .edu-form-group { display: flex; flex-direction: column; }
        .edu-form-group label { font-size: 15px !important; color: #444 !important; margin-bottom: 6px; font-weight: 600 !important; }
        .edu-form-control { padding: 10px 12px; border: 1px solid #cccccc; border-radius: 5px; font-size: 16px !important; outline: none; }
        .edu-form-control[readonly] { background-color: #f8f9fa; color: #334155; border-color: #e2e8f0; font-weight: bold; }
        .edu-sub-text { font-size: 13.5px !important; color: #2563eb !important; margin-top: 6px; font-weight: bold !important; }
        .edu-btn-submit { background-color: #2563eb; color: white !important; border: none; padding: 12px 32px; font-size: 16px !important; font-weight: bold !important; border-radius: 5px; cursor: pointer; transition: 0.2s; }
        .edu-btn-submit:hover { background-color: #1d4ed8; }
        .edu-recent-section { margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; }
        .edu-recent-title { font-size: 13px !important; color: #64748b !important; font-weight: bold !important; margin-bottom: 8px; display: flex; justify-content: space-between; }
        .edu-compact-table { width: 100%; border-collapse: collapse; font-size: 13px !important; }
        .edu-compact-table th, .edu-compact-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #f1f5f9; }

        /* --- SECTION 2 STYLE --- */
        .all-records-summary {
            background: #ffffff;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            padding: 15px 20px;
            margin-bottom: 20px;
            border-left: 4px solid #2563eb;
            display: inline-block;
        }
        .all-records-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            width: 100%;
            overflow: hidden;
            border: 1px solid #e1e4e8;
        }
        .all-records-header { background: #34495e; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .all-records-header h2 { font-size: 19px !important; margin: 0; }
        .records-table-container { padding: 20px; overflow-x: auto; }
        .records-main-table { width: 100%; border-collapse: collapse; min-width: 1300px; font-size: 13px !important; }
        .records-main-table th { background: #f8fafc; color: #475569; padding: 10px; border: 1px solid #e2e8f0; text-align: center; }
        .records-main-table td { padding: 8px; border: 1px solid #e2e8f0; text-align: center; color: #334155; }

        .btn-print-row {
            background: #1e293b;
            color: #ffffff !important;
            border: none;
            padding: 5px 12px;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: 0.2s;
        }
        .btn-print-row:hover { background: #000000; }

        /* --- SECTION 3 STYLE --- */
        .due-upload-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.04);
            border: 1px solid #e5e7eb;
            padding: 18px 22px;
            margin-bottom: 22px;
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }
        .due-file-wrapper {
            display: flex;
            align-items: center;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            overflow: hidden;
            background: #ffffff;
        }
        .due-file-btn {
            background: #f8fafc;
            border: none;
            border-right: 1px solid #cbd5e1;
            padding: 9px 16px;
            font-size: 14px;
            cursor: pointer;
            color: #1e293b;
            font-weight: 500;
        }
        .due-file-name {
            padding: 9px 15px;
            font-size: 14px;
            color: #475569;
            min-width: 180px;
        }
        .btn-due-upload {
            background: #007bff;
            color: #ffffff !important;
            border: none;
            padding: 9px 18px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }
        .btn-due-sample {
            background: #198754;
            color: #ffffff !important;
            border: none;
            padding: 9px 18px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .due-data-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.04);
            border: 1px solid #e5e7eb;
            padding: 20px;
        }
        .due-table-toolbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 12px;
        }
        .due-page-select {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 13.5px;
            outline: none;
            background: #fff;
            color: #334155;
            font-weight: 600;
            cursor: pointer;
        }
        .btn-due-refresh {
            background: #eef2ff;
            color: #4f46e5 !important;
            border: 1px solid #c7d2fe;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: bold;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .due-search-box { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; }
        .due-search-input { border: 1px solid #cbd5e1; border-radius: 4px; padding: 6px 10px; font-size: 14px; outline: none; }
        .due-table-wrapper { overflow-x: auto; }
        .due-data-table { width: 100%; border-collapse: collapse; min-width: 1350px; }
        .due-data-table th {
            color: #2563eb;
            font-weight: 700;
            font-size: 13px;
            text-transform: uppercase;
            padding: 12px 14px;
            text-align: left;
            border-bottom: 2px solid #e2e8f0;
            background: #ffffff;
            white-space: nowrap;
        }
        .due-data-table td { padding: 12px 14px; color: #334155; font-size: 13.5px; border-bottom: 1px solid #f1f5f9; white-space: nowrap; }

        .due-pagination-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 18px;
            padding-top: 15px;
            border-top: 1px solid #f1f5f9;
        }
        .due-pagination-btns { display: flex; align-items: center; gap: 4px; }
        .due-page-btn {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            color: #334155;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
        }
        .due-page-btn.active { background: #2563eb; color: #ffffff; border-color: #2563eb; }
        .due-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ২. Firebase কানেক্টর
    async function getFirebase() {
        if (firebaseCore) return firebaseCore;
        try {
            const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const fbDb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            let app;
            for (let i = 0; i < 20; i++) {
                try {
                    app = fbApp.getApp();
                    if (app) break;
                } catch (e) {}
                await new Promise(r => setTimeout(r, 200));
            }

            if (!app) {
                app = fbApp.initializeApp({
                    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                    projectId: "mousumi-computer"
                }, "feeModuleApp_" + Date.now());
            }

            const db = fbDb.getDatabase(app);
            firebaseCore = {
                db: db,
                ref: fbDb.ref,
                set: fbDb.set,
                onValue: fbDb.onValue,
                get: fbDb.get
            };
            return firebaseCore;
        } catch (err) {
            console.error("Firebase connection error:", err);
            return null;
        }
    }

    // ৩. রসিদ নতুন ট্যাবে ওপেন (Restored Exact Design & Icon-Only Action Bar)
    window.openReceiptInNewTab = function (d) {
        const receiptWindow = window.open('', '_blank');
        if (!receiptWindow) {
            alert("পপ-আপ ব্লক করা আছে! দয়া করে ব্রাউজারের পপ-আপ এলাও (Allow) করুন।");
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="bn">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Receipt_${d.receiptNo}_${d.studentName}</title>
                <!-- FontAwesome Icons & Google Fonts -->
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Lobster&family=Lora:ital,wght@1,400;1,500;1,600&family=Roboto+Mono:wght@400;500&family=Tiro+Bangla:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
                <!-- html2pdf Library for Instant PDF Download -->
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
                
                <style>
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }

                    body {
                        background-color: #0f172a;
                        font-family: 'Tiro Bangla', 'Times New Roman', serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 20px 0 40px 0;
                        color: #000;
                        min-height: 100vh;
                    }

                    /* --- ICON-ONLY MODERN FLOATING ACTION BAR --- */
                    .icon-action-bar {
                        background: rgba(30, 41, 59, 0.9);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        padding: 8px 16px;
                        border-radius: 50px;
                        margin-bottom: 20px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
                    }

                    .icon-btn {
                        width: 44px;
                        height: 44px;
                        border-radius: 50%;
                        border: none;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        cursor: pointer;
                        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    }

                    .btn-print {
                        background: linear-gradient(135deg, #00d2ff 0%, #0078ff 100%);
                        color: #ffffff;
                    }
                    .btn-print:hover {
                        transform: scale(1.1);
                        box-shadow: 0 4px 15px rgba(0, 120, 255, 0.5);
                    }

                    .btn-download {
                        background: linear-gradient(135deg, #34d399 0%, #059669 100%);
                        color: #ffffff;
                    }
                    .btn-download:hover {
                        transform: scale(1.1);
                        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
                    }

                    .btn-close {
                        background: rgba(255, 255, 255, 0.1);
                        color: #e2e8f0;
                        border: 1px solid rgba(255, 255, 255, 0.15);
                    }
                    .btn-close:hover {
                        background: #ef4444;
                        color: #ffffff;
                        border-color: #ef4444;
                        transform: scale(1.1);
                    }

                    /* --- মূল রসিদ কার্ড (আসল নিখুঁত ডিজাইন) --- */
                    .receipt-wrapper-card {
                        background: #ffffff;
                        width: 148mm;
                        min-height: 210mm;
                        padding: 12mm 15mm;
                        box-shadow: 0 15px 40px rgba(0,0,0,0.5);
                        border-radius: 2px;
                        position: relative;
                        box-sizing: border-box;
                        color: #000000;
                        overflow: hidden;
                    }

                    /* ওয়াটারমার্ক */
                    .receipt-watermark {
                        position: absolute;
                        top: 41%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 106mm;
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

                    /* রসিদ কন্টেন্ট বডি */
                    .receipt-body {
                        position: relative;
                        z-index: 2;
                    }

                    /* ১. বিসমিল্লাহ */
                    .rc-bismillah {
                        text-align: center;
                        font-family: 'Caveat', cursive !important;
                        font-size: 13.5pt;
                        font-weight: 600;
                        color: #000;
                        margin-bottom: 2px;
                        line-height: 1.2;
                    }

                    /* ২. শপ নাম */
                    .rc-brand-title {
                        text-align: center;
                        font-family: 'Lobster', cursive !important;
                        font-size: 30pt;
                        font-weight: normal;
                        color: #000;
                        margin: 0 0 4px 0;
                        line-height: 1.1;
                    }

                    /* ৩. সেবা তালিকা */
                    .rc-services-desc {
                        text-align: center;
                        font-family: 'EB Garamond', serif !important;
                        font-size: 10.5pt;
                        line-height: 1.25;
                        color: #000;
                        margin: 0 auto 12px auto;
                        max-width: 115mm;
                    }

                    /* ৪. RECEIPT টাইটেল */
                    .rc-main-title {
                        text-align: center;
                        font-family: 'Tiro Bangla', 'Times New Roman', serif !important;
                        font-size: 12.5pt;
                        font-weight: bold;
                        letter-spacing: 1.5px;
                        margin-bottom: 6px;
                        color: #000;
                        text-transform: uppercase;
                    }

                    /* ৫. টেবিল ডাটা */
                    .rc-sheet-table {
                        width: 100%;
                        border-collapse: collapse;
                        border-top: 1.5px dotted #000;
                    }

                    .rc-sheet-table td {
                        color: #000;
                        vertical-align: middle;
                        font-family: 'Tiro Bangla', 'Times New Roman', serif !important;
                        font-size: 13.5pt;
                        line-height: 1.2;
                        border: none;
                    }

                    .rc-col-b {
                        width: 37%;
                        font-weight: bold;
                        border-right: 1.5px dotted #000 !important;
                        padding: 4px 10px 4px 0 !important;
                    }

                    .rc-col-c {
                        width: 63%;
                        font-weight: normal;
                        padding: 4px 0 4px 14px !important;
                    }

                    .rc-section-end td {
                        border-bottom: 1.5px dotted #000;
                        padding-bottom: 8px !important;
                    }

                    .rc-section-start td {
                        padding-top: 8px !important;
                    }

                    .rc-payment-received-row td {
                        text-align: center !important;
                        font-weight: bold;
                        font-size: 14pt;
                        padding: 7px 0 !important;
                        border-bottom: 1.5px dotted #000 !important;
                        border-right: none !important;
                    }

                    /* ৬. PAID স্ট্যাম্প */
                    .paid-stamp-wrapper {
                        text-align: center;
                        margin: 14px 0 16px 0;
                    }

                    .paid-stamp-img {
                        width: 78px;
                        height: auto;
                        object-fit: contain;
                        display: inline-block;
                    }

                    /* ৭. রিসিভড বাই */
                    .rc-footer-sign {
                        font-family: 'Tiro Bangla', 'Times New Roman', serif !important;
                        font-size: 11pt;
                        margin: 0 0 18px 0;
                        color: #000;
                    }

                    .rc-footer-sign strong {
                        font-weight: bold;
                    }

                    /* ৮. ডিসক্লেইমার ও যোগাযোগ */
                    .rc-disclaimer-mono {
                        text-align: center;
                        font-family: 'Roboto Mono', monospace !important;
                        font-size: 9pt;
                        line-height: 1.35;
                        color: #000;
                        margin-bottom: 6px;
                    }

                    .rc-disclaimer-lora {
                        text-align: center;
                        font-family: 'Lora', serif !important;
                        font-size: 9pt;
                        font-style: italic;
                        line-height: 1.3;
                        color: #000;
                    }

                    /* প্রিন্ট মিডিয়া স্টাইলিং (A5 পারফেক্ট) */
                    @media print {
                        @page {
                            size: A5 portrait;
                            margin: 0;
                        }
                        body {
                            background: #ffffff !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .receipt-wrapper-card {
                            width: 100% !important;
                            min-height: 100% !important;
                            box-shadow: none !important;
                            border-radius: 0 !important;
                            padding: 10mm 12mm !important;
                            margin: 0 auto !important;
                            page-break-inside: avoid !important;
                            page-break-after: avoid !important;
                        }
                    }
                </style>
            </head>
            <body>

                <!-- ICON-ONLY CONTROLS -->
                <div class="icon-action-bar no-print">
                    <button class="icon-btn btn-print" onclick="window.print()" title="Print (A5)">
                        <i class="fa-solid fa-print"></i>
                    </button>
                    <button class="icon-btn btn-download" onclick="downloadReceiptPDF()" title="Download PDF">
                        <i class="fa-solid fa-file-arrow-down"></i>
                    </button>
                    <button class="icon-btn btn-close" onclick="window.close()" title="Close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <!-- মূল রসিদ কার্ড -->
                <div class="receipt-wrapper-card" id="printableReceiptCard">
                    
                    <!-- ওয়াটারমার্ক -->
                    <div class="receipt-watermark">
                        <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgBBifAiiveIb1xVgQZv6AxAD_YCVu7JRmBqQOX2eeSJFxavzFEhsWQlYpN6b_aUIiUVCdNu39EHD2-tG1Li5b2Jx4U1DqTH98zbWgxmegb-xPADeDbJBdCqt-WhP71NUrFTlJLeEpZgVoAxEcUufpJNxMQs8nVE28Jj6Ch0LRjTnDBICBibZxxgwE7nFyB/s1600/Receipt%20%281%29.png" alt="Watermark" />
                    </div>

                    <div class="receipt-body">
                        <!-- ১. বিসমিল্লাহ -->
                        <div class="rc-bismillah">“In the name of Allah, the Most Gracious, the Most Merciful”</div>

                        <!-- ২. শপ নাম -->
                        <div class="rc-brand-title">Mousumi Computer</div>

                        <!-- ৩. সেবা তালিকা -->
                        <div class="rc-services-desc">
                            All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash, <br>
                            Nagad, Rocket, Upay, Flexiload, and Computer Works.
                        </div>

                        <!-- ৪. RECEIPT টাইটেল -->
                        <div class="rc-main-title">RECEIPT</div>

                        <!-- ৫. টেবিল ডাটা -->
                        <table class="rc-sheet-table">
                            <tr>
                                <td class="rc-col-b">Receipt No</td>
                                <td class="rc-col-c">${d.receiptNo}</td>
                            </tr>
                            <tr class="rc-section-end">
                                <td class="rc-col-b">Date</td>
                                <td class="rc-col-c">${d.date}</td>
                            </tr>

                            <tr class="rc-section-start">
                                <td class="rc-col-b">Student Name</td>
                                <td class="rc-col-c">${d.studentName}</td>
                            </tr>
                            <tr class="rc-section-end">
                                <td class="rc-col-b">Student ID</td>
                                <td class="rc-col-c">${d.studentId}</td>
                            </tr>

                            <tr class="rc-section-start">
                                <td class="rc-col-b">Tuition Fee</td>
                                <td class="rc-col-c">${d.tuitionFee}</td>
                            </tr>
                            <tr>
                                <td class="rc-col-b">Charge</td>
                                <td class="rc-col-c">${d.charge}</td>
                            </tr>
                            <tr class="rc-section-end">
                                <td class="rc-col-b">Total</td>
                                <td class="rc-col-c">${d.total}</td>
                            </tr>

                            <tr class="rc-payment-received-row">
                                <td colspan="2">Payment Received: ${d.received}</td>
                            </tr>
                        </table>

                        <!-- ৬. PAID স্ট্যাম্প -->
                        <div class="paid-stamp-wrapper">
                            <img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkW_Mz8uWQPQY8WqCQEVSh7ff6C8_ZE02lZw3o42e8QtmSIE8Sxgx_ejXTZmN_QNLHg0nfS5hrG4Mu2Y6NGCztsTnRZfvFuZ3bZzLAkMtvHxP6tkMxi9YUWcKG9gKXpJHrmnuWFFDAw0qIcAPb6WvHNVT_eiZkM2xDyI3HvRxrrqrpqyv8Zv2FIICwIQQr/s1600/Receipt.png" alt="PAID Stamp" class="paid-stamp-img" />
                        </div>

                        <!-- ৭. রিসিভড বাই -->
                        <div class="rc-footer-sign">
                            <strong>Received By:</strong> ${d.receivedBy || 'Riyal Robiul'}
                        </div>

                        <!-- ৮. ফুটার টেক্সট -->
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

                <script>
                    function downloadReceiptPDF() {
                        const element = document.getElementById('printableReceiptCard');
                        const opt = {
                            margin: 0,
                            filename: 'Receipt_${d.receiptNo}_${d.studentId}.pdf',
                            image: { type: 'jpeg', quality: 0.98 },
                            html2canvas: { scale: 2.5, useCORS: true },
                            jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
                        };
                        html2pdf().set(opt).from(element).save();
                    }
                <\/script>
            </body>
            </html>
        `;

        receiptWindow.document.open();
        receiptWindow.document.write(htmlContent);
        receiptWindow.document.close();
    };

    // ৪. সাইডবার মেনু ইনজেক্ট করা
    function injectMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-edu-parent')) return;

        const html = `
            <li class="menu-item" id="menu-edu-parent">
                <a onclick="this.parentElement.classList.toggle('open')">
                    <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>শিক্ষা ও ডিজিটাল সেবা</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon" style="font-size: 0.7rem;"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-form')"><i class="fa-solid fa-angle-right"></i> <span>ফি এন্ট্রি (Fee Entry)</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-records')"><i class="fa-solid fa-angle-right"></i> <span>সকল ফি রেকর্ডস</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-due-data')"><i class="fa-solid fa-angle-right"></i> <span>বকেয়া ডেটা তালিকা (Due Data)</span></a></li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    // ৫. ভিউ প্যানেল ইনজেক্ট করা
    function injectPanels() {
        const wrapper = document.querySelector('.main-wrapper');
        if (!wrapper) return;

        const panelsHTML = `
            <div id="edu-module-container">
                <!-- প্যানেল ১: ফি এন্ট্রি ফর্ম -->
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-card">
                        <div class="edu-card-header">
                            <h2>ফি কালেকশন মডিউল (Fee Collection)</h2>
                            <span class="edu-badge">ERP v2.4</span>
                        </div>
                        <div class="edu-card-body">
                            <form id="feeFormOriginal">
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>তারিখ (Date)</label>
                                        <input type="date" id="origDate" class="edu-form-control" required>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>স্টুডেন্ট আইডি (ID)</label>
                                        <input type="text" id="origId" class="edu-form-control" placeholder="আইডি লিখুন" required autocomplete="off">
                                    </div>
                                    <div class="edu-form-group">
                                        <label>শিক্ষার্থীর নাম (Student Name)</label>
                                        <input type="text" id="origName" class="edu-form-control" placeholder="শিক্ষার্থীর নাম" readonly>
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>বকেয়া (Net Due)</label>
                                        <input type="text" id="origDue" class="edu-form-control" value="0.00" readonly>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>ট্রানজেকশন ফি (Txn Fee)</label>
                                        <input type="number" step="any" id="origTxn" class="edu-form-control" value="6.00">
                                        <span class="edu-sub-text">মোট চার্জ (Total Charge): ৳ <span id="origCharge">6.00</span></span>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>গৃহীত মোট টাকা (Net Received)</label>
                                        <input type="text" id="origRec" class="edu-form-control" value="0.00" readonly>
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>ছাড় (Discount)</label>
                                        <input type="number" step="any" id="origDisc" class="edu-form-control" value="0.00">
                                    </div>
                                </div>
                                <div style="display:flex; justify-content:flex-end;">
                                    <button type="submit" class="edu-btn-submit">সাবমিট করুন</button>
                                </div>
                            </form>
                            <div class="edu-recent-section">
                                <div class="edu-recent-title"><span>সর্বশেষ এন্ট্রি (Recent Entries)</span><span>সর্বোচ্চ ৩টি</span></div>
                                <table class="edu-compact-table">
                                    <thead><tr><th>তারিখ</th><th>আইডি</th><th>নাম</th><th>গৃহীত টাকা</th><th style="text-align:right;">রসিদ</th></tr></thead>
                                    <tbody id="origRecentBody"><tr><td colspan="5" style="text-align:center; color:#999; padding:15px;">কোনো রিসেন্ট এন্ট্রি নেই</td></tr></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- প্যানেল ২: সকল ফি রেকর্ডস সেকশন -->
                <div class="view-panel" id="edu-fee-records-view">
                    <div class="all-records-summary">
                        <span>সর্বমোট এন্ট্রি টাকা (Total Received):</span>
                        <strong>৳ <span id="totalFeeSum">0.00</span></strong>
                    </div>
                    <div class="all-records-card">
                        <div class="all-records-header">
                            <h2>সকল জমা হওয়া ফি তালিকা (All Fee Records)</h2>
                            <span style="font-size:12px; opacity:0.7;">Live Data</span>
                        </div>
                        <div class="records-table-container">
                            <table class="records-main-table">
                                <thead>
                                    <tr>
                                        <th>SL</th><th>Date</th><th>Student Name</th><th>Id</th><th>Class</th><th>Month</th>
                                        <th>Category</th><th>Mobile</th><th>Net Due</th><th>Txn Fee</th><th>Total Charge</th>
                                        <th>Net Received</th><th>Gross Payment</th><th>Remarks</th><th>রসিদ প্রিন্ট</th>
                                    </tr>
                                </thead>
                                <tbody id="allRecordsTableBody">
                                    <tr><td colspan="15" style="padding:20px; color:#999;">এখনও কোনো ডেটা জমা হয়নি</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- প্যানেল ৩: বকেয়া ডেটা আপলোড ও তালিকা -->
                <div class="view-panel" id="edu-due-data-view">
                    <div class="due-upload-card">
                        <input type="file" id="dueFileInput" accept=".xlsx, .xls, .csv" style="display: none;">
                        <div class="due-file-wrapper">
                            <button type="button" class="due-file-btn" onclick="document.getElementById('dueFileInput').click()">Choose File</button>
                            <span class="due-file-name" id="dueFileNameDisplay">No file chosen</span>
                        </div>
                        <button type="button" class="btn-due-upload" id="btnUploadDueData"><i class="fa-solid fa-cloud-arrow-up"></i> Upload Data</button>
                        <button type="button" class="btn-due-sample" id="btnDownloadSample"><i class="fa-solid fa-file-excel"></i> Sample Download</button>
                    </div>

                    <div class="due-data-card">
                        <div class="due-table-toolbar">
                            <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 14px; color: #475569;">Show</span>
                                    <select id="duePageSizeSelect" class="due-page-select">
                                        <option value="10">10</option>
                                        <option value="25" selected>25</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                        <option value="-1">All</option>
                                    </select>
                                    <span style="font-size: 14px; color: #475569;">entries</span>
                                </div>
                                <button type="button" class="btn-due-refresh" id="btnRefreshDueData" title="লাইভ ডেটা রিফ্রেশ করুন"><i class="fa-solid fa-arrows-rotate"></i> রিফ্রেশ</button>
                            </div>
                            <div class="due-search-box">
                                <label for="dueTableSearch">Search:</label>
                                <input type="text" id="dueTableSearch" class="due-search-input" placeholder="যেকোনো তথ্য দিয়ে খুঁজুন...">
                            </div>
                        </div>

                        <div class="due-table-wrapper">
                            <table class="due-data-table">
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">SL</th>
                                        <th>Class</th>
                                        <th>Section</th>
                                        <th>STD ID</th>
                                        <th>Student Name</th>
                                        <th>Category</th>
                                        <th>Month Due</th>
                                        <th>Due items</th>
                                        <th>Due Amount</th>
                                        <th>Mobile</th>
                                        <th>Fathers name</th>
                                        <th>Fathers Mobile</th>
                                        <th>Mothers Name</th>
                                        <th>Mothers Mobile</th>
                                    </tr>
                                </thead>
                                <tbody id="dueDataTableBody">
                                    <tr><td colspan="14" style="text-align: center; color: #94a3b8; padding: 25px;">কোনো ডেটা লোড করা হয়নি। এক্সেল ফাইল আপলোড করুন।</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="due-pagination-wrapper">
                            <div class="due-entries-info" id="dueEntriesInfo">Showing 0 to 0 of 0 entries</div>
                            <div class="due-pagination-btns" id="duePaginationBtns"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', panelsHTML);
    }

    // ৬. অটোমেটিক ক্যালকুলেশন
    function calculateAutoValues() {
        const discountInp = document.getElementById('origDisc');
        const txnInp = document.getElementById('origTxn');
        const dueInp = document.getElementById('origDue');
        const chargeText = document.getElementById('origCharge');
        const recInp = document.getElementById('origRec');

        const discount = parseFloat(discountInp ? discountInp.value : 0) || 0;
        const txnFee = parseFloat(txnInp ? txnInp.value : 0) || 0;

        const netDue = Math.max(0, selectedStudentRawDue - discount);
        const percentCharge = netDue * 0.01;
        const totalCharge = percentCharge + txnFee;
        const netReceived = netDue + totalCharge;

        if (dueInp) dueInp.value = netDue.toFixed(2);
        if (chargeText) chargeText.innerText = totalCharge.toFixed(2);
        if (recInp) recInp.value = netReceived.toFixed(2);
    }

    // ৭. তারিখ ফরম্যাটার
    function formatDateToDDMMYYYY(dateStr) {
        if (!dateStr) return new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        const parts = dateStr.split('-');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return dateStr;
    }

    // ৮. পেজিনেশন ও বকেয়া টেবিল রেন্ডার
    function renderDueDataTable() {
        const tbody = document.getElementById('dueDataTableBody');
        const entriesInfo = document.getElementById('dueEntriesInfo');
        const paginationBtns = document.getElementById('duePaginationBtns');
        if (!tbody) return;

        let filtered = studentDueList;
        if (currentSearchQuery) {
            const q = currentSearchQuery.toLowerCase();
            filtered = studentDueList.filter(item => 
                (item.studentName && item.studentName.toLowerCase().includes(q)) ||
                (item.stdId && item.stdId.toLowerCase().includes(q)) ||
                (item.class && item.class.toLowerCase().includes(q)) ||
                (item.mobile && item.mobile.toLowerCase().includes(q)) ||
                (item.fathersMobile && item.fathersMobile.toLowerCase().includes(q)) ||
                (item.dueItems && item.dueItems.toLowerCase().includes(q))
            );
        }

        const totalEntries = filtered.length;
        const effectivePageSize = rowsPerPage === -1 ? totalEntries : rowsPerPage;
        const totalPages = Math.max(1, Math.ceil(totalEntries / (effectivePageSize || 1)));

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * effectivePageSize;
        const endIndex = rowsPerPage === -1 ? totalEntries : Math.min(startIndex + effectivePageSize, totalEntries);
        const currentSlice = rowsPerPage === -1 ? filtered : filtered.slice(startIndex, endIndex);

        if (entriesInfo) {
            const startDisplay = totalEntries > 0 ? startIndex + 1 : 0;
            entriesInfo.innerText = `Showing ${startDisplay} to ${endIndex} of ${totalEntries} entries`;
        }

        if (totalEntries === 0) {
            tbody.innerHTML = `<tr><td colspan="14" style="text-align: center; color: #94a3b8; padding: 25px;">কোনো রেকর্ড পাওয়া যায়নি।</td></tr>`;
            if (paginationBtns) paginationBtns.innerHTML = '';
            return;
        }

        let html = '';
        currentSlice.forEach((item, index) => {
            const autoSL = startIndex + index + 1;
            html += `
                <tr>
                    <td style="font-weight: 700; color: #64748b;">${autoSL}</td>
                    <td>${item.class || '-'}</td>
                    <td>${item.section || '-'}</td>
                    <td><strong>${item.stdId || '-'}</strong></td>
                    <td>${item.studentName || '-'}</td>
                    <td>${item.category || '-'}</td>
                    <td>${item.monthDue || '-'}</td>
                    <td>${item.dueItems || '-'}</td>
                    <td style="font-weight: bold; color: #e11d48;">${item.dueAmount || 0}</td>
                    <td>${item.mobile || '-'}</td>
                    <td>${item.fathersName || '-'}</td>
                    <td>${item.fathersMobile || '-'}</td>
                    <td>${item.mothersName || '-'}</td>
                    <td>${item.mothersMobile || '-'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        renderPaginationButtons(totalPages);
    }

    function renderPaginationButtons(totalPages) {
        const container = document.getElementById('duePaginationBtns');
        if (!container) return;
        container.innerHTML = '';
        if (totalPages <= 1) return;

        const prevBtn = document.createElement('button');
        prevBtn.className = 'due-page-btn';
        prevBtn.innerText = 'Previous';
        prevBtn.disabled = (currentPage === 1);
        prevBtn.onclick = () => { if (currentPage > 1) { currentPage--; renderDueDataTable(); } };
        container.appendChild(prevBtn);

        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.className = `due-page-btn ${i === currentPage ? 'active' : ''}`;
            btn.innerText = i;
            btn.onclick = () => { currentPage = i; renderDueDataTable(); };
            container.appendChild(btn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'due-page-btn';
        nextBtn.innerText = 'Next';
        nextBtn.disabled = (currentPage === totalPages);
        nextBtn.onclick = () => { if (currentPage < totalPages) { currentPage++; renderDueDataTable(); } };
        container.appendChild(nextBtn);
    }

    // ৯. Firebase লাইভ সিঙ্ক
    async function listenFirebaseData() {
        const fb = await getFirebase();
        if (!fb) return;

        fb.onValue(fb.ref(fb.db, 'erp/studentDueData'), (snapshot) => {
            const data = snapshot.val();
            studentDueList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            renderDueDataTable();
        });

        fb.onValue(fb.ref(fb.db, 'erp/feeTransactions'), (snapshot) => {
            const data = snapshot.val();
            feeTransactionsList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            renderFullTable(feeTransactionsList);
            renderRecentEntries(feeTransactionsList);
        });
    }

    // ১০. টেবিল বা সাম্প্রতিক এন্ট্রি থেকে রসিদ ওপেন ফাংশন
    window.printRowReceipt = function(txId) {
        const tx = feeTransactionsList.find(t => t.id === txId);
        if (!tx) return;

        const netDueVal = parseFloat(tx.netDue || 0);
        const chargeVal = parseFloat(tx.totalCharge || 0);
        const totalVal = parseFloat(tx.netReceived || 0);

        const receiptData = {
            receiptNo: tx.receiptNo || tx.id.replace(/\D/g, '').slice(-4) || '3410',
            date: formatDateToDDMMYYYY(tx.date),
            studentName: tx.studentName || '-',
            studentId: tx.customerId || '-',
            tuitionFee: netDueVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            charge: chargeVal.toFixed(1),
            total: totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            received: totalVal.toString(),
            receivedBy: tx.receivedBy || (window.profileSettings && window.profileSettings.fullName) || 'Riyal Robiul'
        };

        window.openReceiptInNewTab(receiptData);
    };

    // ১১. ইভেন্ট লজিক
    function initLogic() {
        const idInp = document.getElementById('origId');
        const nameInp = document.getElementById('origName');
        const dateInp = document.getElementById('origDate');
        const discInp = document.getElementById('origDisc');
        const txnInp = document.getElementById('origTxn');

        if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];

        if (idInp) {
            idInp.addEventListener('input', function() {
                const val = this.value.trim();
                if (!val) {
                    selectedStudentRawDue = 0;
                    selectedStudentData = null;
                    if (nameInp) nameInp.value = '';
                    calculateAutoValues();
                    return;
                }

                const dueFound = studentDueList.find(s => String(s.stdId).trim() === val || String(s.mobile).trim() === val);
                if (dueFound) {
                    selectedStudentData = dueFound;
                    selectedStudentRawDue = parseFloat(dueFound.dueAmount || 0);
                    if (nameInp) nameInp.value = dueFound.studentName || '';
                } else {
                    selectedStudentData = null;
                    selectedStudentRawDue = 0;
                    if (nameInp) nameInp.value = '';
                }
                calculateAutoValues();
            });
        }

        if (discInp) discInp.addEventListener('input', calculateAutoValues);
        if (txnInp) txnInp.addEventListener('input', calculateAutoValues);

        // ফর্ম সাবমিট (সেভ হবে এবং সাথে সাথে নতুন ট্যাবে রসিদ ওপেন হবে)
        const origForm = document.getElementById('feeFormOriginal');
        if (origForm) {
            origForm.onsubmit = async function(e) {
                e.preventDefault();
                const studentId = idInp ? idInp.value.trim() : '';
                const studentName = nameInp ? nameInp.value.trim() : '';
                const netDue = parseFloat(document.getElementById('origDue').value) || 0;
                const txnFee = parseFloat(document.getElementById('origTxn').value) || 0;
                const totalCharge = parseFloat(document.getElementById('origCharge').innerText) || 0;
                const netReceived = parseFloat(document.getElementById('origRec').value) || 0;
                const discount = parseFloat(document.getElementById('origDisc').value) || 0;

                if (!studentId || netReceived <= 0) {
                    alert("দয়া করে সঠিক শিক্ষার্থী আইডি ও তথ্য প্রদান করুন!");
                    return;
                }

                if (typeof showLoader === 'function') showLoader("সংরক্ষণ করা হচ্ছে...");

                const percentCapCharge = Math.min(netDue * 0.01, 60);
                const calculatedGross = netDue + percentCapCharge;
                const receiptNumeric = (feeTransactionsList.length + 1) + 3400;

                const txData = {
                    id: 'EDU-' + Date.now(),
                    receiptNo: String(receiptNumeric),
                    customerId: studentId,
                    studentName: studentName || '-',
                    class: selectedStudentData ? (selectedStudentData.class || '-') : '-',
                    month: selectedStudentData ? (selectedStudentData.monthDue || '-') : '-',
                    category: selectedStudentData ? (selectedStudentData.category || '-') : '-',
                    mobile: selectedStudentData ? (selectedStudentData.mobile || '-') : '-',
                    netDue: netDue,
                    txnFee: txnFee,
                    totalCharge: totalCharge,
                    discount: discount,
                    netReceived: netReceived,
                    grossPayment: calculatedGross,
                    date: dateInp ? dateInp.value : new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString(),
                    receivedBy: (window.profileSettings && window.profileSettings.fullName) || 'Riyal Robiul'
                };

                try {
                    const fb = await getFirebase();
                    if (fb) {
                        const snap = await fb.get(fb.ref(fb.db, 'erp/feeTransactions'));
                        let txs = snap.val();
                        txs = txs ? (Array.isArray(txs) ? txs : Object.values(txs)) : [];
                        txs.push(txData);
                        await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), txs);
                    }

                    if (typeof showToast === 'function') showToast("ফি সফলভাবে সংরক্ষিত হয়েছে!", "success");

                    // রসিদ অবজেক্ট তৈরি এবং নতুন ট্যাবে ওপেন
                    const receiptData = {
                        receiptNo: txData.receiptNo,
                        date: formatDateToDDMMYYYY(txData.date),
                        studentName: txData.studentName,
                        studentId: txData.customerId,
                        tuitionFee: netDue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                        charge: totalCharge.toFixed(1),
                        total: netReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                        received: netReceived.toString(),
                        receivedBy: txData.receivedBy
                    };

                    window.openReceiptInNewTab(receiptData);

                    // ফর্ম রিসেট
                    this.reset();
                    selectedStudentRawDue = 0;
                    selectedStudentData = null;
                    if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];
                    if (txnInp) txnInp.value = "6.00";
                    calculateAutoValues();
                } catch(err) { 
                    console.error(err); 
                    if (typeof showToast === 'function') showToast("ফি সেভ করতে সমস্যা হয়েছে!", "error");
                }
                if (typeof hideLoader === 'function') hideLoader();
            };
        }

        // এক্সেল ফাইল ইনপুট
        const fileInput = document.getElementById('dueFileInput');
        const fileNameDisplay = document.getElementById('dueFileNameDisplay');
        if (fileInput && fileNameDisplay) {
            fileInput.addEventListener('change', function() {
                fileNameDisplay.innerText = (this.files && this.files.length > 0) ? this.files[0].name : "No file chosen";
            });
        }

        const pageSizeSelect = document.getElementById('duePageSizeSelect');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', function() {
                rowsPerPage = parseInt(this.value);
                currentPage = 1;
                renderDueDataTable();
            });
        }

        const btnUpload = document.getElementById('btnUploadDueData');
        if (btnUpload && fileInput) {
            btnUpload.addEventListener('click', function() {
                if (!fileInput.files || fileInput.files.length === 0) {
                    if (typeof showToast === 'function') showToast("অনুগ্রহ করে একটি এক্সেল ফাইল নির্বাচন করুন!", "warning");
                    return;
                }

                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = async function(e) {
                    try {
                        const data = e.target.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const firstSheetName = workbook.SheetNames[0];
                        const json = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], { defval: '' });

                        const formatted = json.map(r => ({
                            class: r['Class'] || r['class'] || '-',
                            section: r['Section'] || r['section'] || '-',
                            stdId: String(r['STD ID'] || r['Std Id'] || r['Student ID'] || r['ID'] || '').trim(),
                            studentName: r['Student Name'] || r['Name'] || '-',
                            category: r['Category'] || '-',
                            monthDue: r['Month Due'] || r['Month'] || '-',
                            dueItems: r['Due items'] || r['Due Items'] || '-',
                            dueAmount: parseFloat(r['Due Amount'] || r['Amount'] || 0) || 0,
                            mobile: String(r['Mobile'] || '').trim(),
                            fathersName: r['Fathers name'] || '-',
                            fathersMobile: String(r['Fathers Mobile'] || '').trim(),
                            mothersName: r['Mothers Name'] || '-',
                            mothersMobile: String(r['Mothers Mobile'] || '').trim()
                        }));

                        const fb = await getFirebase();
                        if (fb) {
                            await fb.set(fb.ref(fb.db, 'erp/studentDueData'), formatted);
                            studentDueList = formatted;
                            currentPage = 1;
                            renderDueDataTable();
                            if (typeof showToast === 'function') showToast(`✅ সফলভাবে ${formatted.length} টি রেকর্ড সেভ হয়েছে!`, "success");
                        }
                    } catch(err) {
                        if (typeof showToast === 'function') showToast("আপলোডে সমস্যা হয়েছে!", "error");
                    }
                };
                reader.readAsBinaryString(file);
            });
        }

        const btnRefresh = document.getElementById('btnRefreshDueData');
        if (btnRefresh) {
            btnRefresh.addEventListener('click', async function() {
                const icon = this.querySelector('i');
                if (icon) icon.classList.add('fa-spin');
                const fb = await getFirebase();
                if (fb) {
                    const snap = await fb.get(fb.ref(fb.db, 'erp/studentDueData'));
                    studentDueList = snap.val() ? Object.values(snap.val()) : [];
                    renderDueDataTable();
                }
                setTimeout(() => { if (icon) icon.classList.remove('fa-spin'); }, 400);
            });
        }

        const searchInput = document.getElementById('dueTableSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                currentSearchQuery = this.value.trim();
                currentPage = 1;
                renderDueDataTable();
            });
        }

        const btnSample = document.getElementById('btnDownloadSample');
        if (btnSample) {
            btnSample.addEventListener('click', function() {
                const sampleData = [
                    ["Class", "Section", "STD ID", "Student Name", "Category", "Month Due", "Due items", "Due Amount", "Mobile", "Fathers name", "Fathers Mobile", "Mothers Name", "Mothers Mobile"],
                    ["Nursery", "Dhorola", "1400626", "MOST NAFISA KHANDOKER", "Army", 1, "Tuition Fee (August-2026)", 600, "01774258066", "MD NABIUL", "01774258066", "MST DISA KHAN", "01748808957"]
                ];
                const ws = XLSX.utils.aoa_to_sheet(sampleData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "Sample");
                XLSX.writeFile(wb, "Student_Sample.xlsx");
            });
        }
    }

    // সর্বশেষ এন্ট্রি (সর্বোচ্চ ৩টি)
    function renderRecentEntries(feeTxs) {
        const body = document.getElementById('origRecentBody');
        if (!body) return;
        if (!feeTxs || feeTxs.length === 0) {
            body.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#999; padding:15px;">কোনো রিসেন্ট এন্ট্রি নেই</td></tr>';
            return;
        }

        const top3 = feeTxs.slice(-3).reverse();
        let html = '';
        top3.forEach(t => {
            const amt = parseFloat(t.netReceived || 0);
            html += `
                <tr>
                    <td>${t.date || '-'}</td>
                    <td><strong>${t.customerId || '-'}</strong></td>
                    <td>${t.studentName || '-'}</td>
                    <td style="font-weight:bold; color:#2563eb;">৳ ${amt.toFixed(2)}</td>
                    <td style="text-align:right;">
                        <button class="btn-print-row" onclick="printRowReceipt('${t.id}')" title="Print Receipt">
                            <i class="fa-solid fa-print"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        body.innerHTML = html;
    }

    // সকল জমা হওয়া ফি তালিকা
    function renderFullTable(feeTxs) {
        const body = document.getElementById('allRecordsTableBody');
        const totalFeeSumEl = document.getElementById('totalFeeSum');
        if (!body) return;

        if (!feeTxs || feeTxs.length === 0) {
            body.innerHTML = '<tr><td colspan="15" style="padding:20px; color:#999; text-align:center;">এখনও কোনো ডেটা জমা হয়নি</td></tr>';
            if (totalFeeSumEl) totalFeeSumEl.innerText = '0.00';
            return;
        }

        body.innerHTML = '';
        let total = 0;
        const list = feeTxs.slice().reverse();
        list.forEach((t, i) => {
            const netDue = parseFloat(t.netDue || 0);
            const txnFee = parseFloat(t.txnFee || 0);
            const totalCharge = parseFloat(t.totalCharge || 0);
            const netReceived = parseFloat(t.netReceived || 0);
            const percentCapped = Math.min(netDue * 0.01, 60);
            const grossPayment = t.grossPayment !== undefined ? parseFloat(t.grossPayment) : (netDue + percentCapped);
            const autoSL = list.length - i;

            total += netReceived;

            body.innerHTML += `
                <tr>
                    <td style="font-weight:bold; color:#64748b;">${autoSL}</td>
                    <td>${t.date || '-'}</td>
                    <td><strong>${t.studentName || '-'}</strong></td>
                    <td>${t.customerId || '-'}</td>
                    <td>${t.class || '-'}</td>
                    <td>${t.month || '-'}</td>
                    <td>${t.category || '-'}</td>
                    <td>${t.mobile || '-'}</td>
                    <td style="font-weight:bold;">${netDue.toFixed(2)}</td>
                    <td>${txnFee.toFixed(2)}</td>
                    <td>${totalCharge.toFixed(2)}</td>
                    <td style="font-weight:bold; color:#16a34a;">${netReceived.toFixed(2)}</td>
                    <td style="color:#2563eb; font-weight:bold;">${grossPayment.toFixed(2)}</td>
                    <td>${t.discount > 0 ? `ছাড়: ৳${t.discount}` : '-'}</td>
                    <td>
                        <button class="btn-print-row" onclick="printRowReceipt('${t.id}')" title="Print Receipt">
                            <i class="fa-solid fa-print"></i>
                        </button>
                    </td>
                </tr>`;
        });
        
        if (totalFeeSumEl) {
            totalFeeSumEl.innerText = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
        }
    }

    window.addEventListener('load', () => {
        injectMenu();
        injectPanels();
        initLogic();
        listenFirebaseData();
    });
})();
