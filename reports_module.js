/* =========================================================
   MOUSUMI COMPUTER
   REPORT CENTER MODULE
   ---------------------------------------------------------
   Version : 1.0
   Purpose : Central Report Center
   Current Report:
            Customer Transaction Report

   IMPORTANT:
   - This module does NOT modify customer transaction data.
   - This module only reads:
       window.customers
       window.customerTransactions
   - Future reports can be added to REPORT_TYPES.
   ========================================================= */

(function () {

    "use strict";


    /* =========================================================
       CONFIGURATION
       ========================================================= */

    const CONFIG = {

        companyName: "MOUSUMI COMPUTER",

        reportTitle: "Customer Transaction Report",

        currency: "৳",

        fontFamily:
            "'Tiro Bangla', 'Noto Sans Bengali', 'Nirmala UI', sans-serif",

        pdfFileName:
            "Mousumi_Customer_Transaction_Report",

        colors: {
            primary: "#2176ff",
            primaryDark: "#172554",
            border: "#d6d9de",
            lightBorder: "#e5e7eb",
            headerBg: "#f4f5f7",
            pageBg: "#f8fafc",
            text: "#1f2937",
            muted: "#6b7280",
            green: "#059669",
            red: "#dc2626",
            white: "#ffffff"
        }

    };


    /* =========================================================
       REPORT TYPES
       ---------------------------------------------------------
       ভবিষ্যতে নতুন রিপোর্ট এখানে যোগ করা যাবে।
       ========================================================= */

    const REPORT_TYPES = [

        {
            id: "customer-transaction",
            title: "Customer Transaction Report",
            banglaTitle: "কাস্টমার লেনদেন রিপোর্ট",
            available: true
        }

        /*
        ভবিষ্যতে যেমন:

        {
            id: "customer-ledger",
            title: "Customer Ledger",
            banglaTitle: "কাস্টমার লেজার",
            available: false
        },

        {
            id: "due-report",
            title: "Outstanding Due Report",
            banglaTitle: "বকেয়া রিপোর্ট",
            available: false
        }
        */

    ];


    /* =========================================================
       HELPER
       ========================================================= */

    function getCustomers() {

        if (Array.isArray(window.customers)) {
            return window.customers;
        }

        if (Array.isArray(window.customerList)) {
            return window.customerList;
        }

        return [];

    }


    function getTransactions() {

        if (Array.isArray(window.customerTransactions)) {
            return window.customerTransactions;
        }

        return [];

    }


    /* =========================================================
       BANGLA NUMBER
       ========================================================= */

    function toBanglaNumber(value) {

        const digits = [
            "০",
            "১",
            "২",
            "৩",
            "৪",
            "৫",
            "৬",
            "৭",
            "৮",
            "৯"
        ];

        return String(value ?? "")
            .replace(/\d/g, function (digit) {
                return digits[Number(digit)];
            });

    }


    /* =========================================================
       BANGLA DIGIT REVERSE
       ========================================================= */

    function toEnglishNumber(value) {

        const bn = "০১২৩৪৫৬৭৮৯";
        const en = "0123456789";

        return String(value ?? "")
            .replace(/[০-৯]/g, function (digit) {
                return en[bn.indexOf(digit)];
            });

    }


    /* =========================================================
       MONEY FORMAT
       ========================================================= */

    function formatMoney(value, bangla = true) {

        let number = Number(value);

        if (!Number.isFinite(number)) {
            number = 0;
        }

        const formatted = number.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

        return CONFIG.currency +
            " " +
            (
                bangla
                    ? toBanglaNumber(formatted)
                    : formatted
            );

    }


    /* =========================================================
       DATE FORMAT
       ========================================================= */

    function formatDate(dateValue, bangla = true) {

        if (!dateValue) {
            return "-";
        }

        const value = String(dateValue);

        const parts = value.split("-");

        if (parts.length !== 3) {
            return bangla
                ? toBanglaNumber(value)
                : value;
        }

        const formatted =
            `${parts[2]}/${parts[1]}/${parts[0]}`;

        return bangla
            ? toBanglaNumber(formatted)
            : formatted;

    }


    /* =========================================================
       GET LOCAL TODAY
       ========================================================= */

    function getToday() {

        const now = new Date();

        const year =
            now.getFullYear();

        const month =
            String(now.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(now.getDate())
                .padStart(2, "0");

        return `${year}-${month}-${day}`;

    }


    /* =========================================================
       HTML ESCAPE
       ========================================================= */

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    /* =========================================================
       FIND CUSTOMER
       ========================================================= */

    function findCustomer(customerId) {

        const list = getCustomers();

        return list.find(function (customer) {

            return String(
                customer.customerId
            ) === String(customerId);

        }) || null;

    }


    /* =========================================================
       GET CUSTOMER NAME
       ========================================================= */

    function getCustomerName(customerId) {

        const customer =
            findCustomer(customerId);

        if (!customer) {
            return "Unknown Customer";
        }

        return customer.name ||
            "Unnamed Customer";

    }


    /* =========================================================
       GET CUSTOMER PHONE
       ========================================================= */

    function getCustomerPhone(customerId) {

        const customer =
            findCustomer(customerId);

        if (!customer) {
            return "-";
        }

        return customer.phone || "-";

    }


    /* =========================================================
       GET CUSTOMER OPENING BALANCE
       ========================================================= */

    function getOpeningBalance(customerId) {

        const customer =
            findCustomer(customerId);

        if (!customer) {
            return 0;
        }

        return Number(
            customer.openingBalance
        ) || 0;

    }


    /* =========================================================
       SORT TRANSACTIONS
       ========================================================= */

    function sortTransactions(list) {

        return [...list].sort(function (a, b) {

            const dateA =
                String(a.date || "");

            const dateB =
                String(b.date || "");

            if (dateA !== dateB) {
                return dateA.localeCompare(dateB);
            }

            const timeA =
                String(a.time || "");

            const timeB =
                String(b.time || "");

            return timeA.localeCompare(timeB);

        });

    }


    /* =========================================================
       CALCULATE RUNNING BALANCE
       ---------------------------------------------------------
       Formula used by the existing customer system:

       Opening Balance
       + Debit
       - Credit
       ========================================================= */

    function calculateRunningBalances() {

        const transactions =
            sortTransactions(getTransactions());

        const customers =
            getCustomers();

        const balances = {};

        customers.forEach(function (customer) {

            const id =
                customer.customerId;

            balances[id] =
                Number(customer.openingBalance) || 0;

        });


        const result = new Map();


        transactions.forEach(function (transaction) {

            const customerId =
                transaction.customerId;

            if (
                !Object.prototype.hasOwnProperty
                    .call(balances, customerId)
            ) {

                balances[customerId] = 0;

            }


            const debit =
                Number(transaction.debit) || 0;

            const credit =
                Number(transaction.credit) || 0;


            balances[customerId] +=
                debit - credit;


            result.set(
                String(transaction.id),
                balances[customerId]
            );

        });


        return result;

    }


    /* =========================================================
       GET FILTERED TRANSACTIONS
       ========================================================= */

    function getFilteredTransactions() {

        const all =
            getTransactions();


        const dateMode =
            document.getElementById(
                "mc-report-date-mode"
            )?.value || "range";


        const fromDate =
            document.getElementById(
                "mc-report-from-date"
            )?.value || "";


        const toDate =
            document.getElementById(
                "mc-report-to-date"
            )?.value || "";


        const customerId =
            document.getElementById(
                "mc-report-customer"
            )?.value || "all";


        let filtered =
            [...all];


        /* -----------------------------------------------------
           CUSTOMER FILTER
           ----------------------------------------------------- */

        if (customerId !== "all") {

            filtered =
                filtered.filter(function (transaction) {

                    return String(
                        transaction.customerId
                    ) === String(customerId);

                });

        }


        /* -----------------------------------------------------
           DATE FILTER
           ----------------------------------------------------- */

        if (dateMode === "single") {

            if (!fromDate) {
                return [];
            }

            filtered =
                filtered.filter(function (transaction) {

                    return String(transaction.date) ===
                        String(fromDate);

                });

        }


        if (dateMode === "range") {

            if (fromDate) {

                filtered =
                    filtered.filter(function (transaction) {

                        return String(transaction.date) >=
                            String(fromDate);

                    });

            }


            if (toDate) {

                filtered =
                    filtered.filter(function (transaction) {

                        return String(transaction.date) <=
                            String(toDate);

                    });

            }

        }


        return sortTransactions(filtered);

    }


    /* =========================================================
       REPORT CSS
       ========================================================= */

    function injectStyles() {

        if (
            document.getElementById(
                "mousumi-report-center-style"
            )
        ) {
            return;
        }


        const style =
            document.createElement("style");

        style.id =
            "mousumi-report-center-style";


        style.textContent = `

        /* =====================================================
           REPORT CENTER
           ===================================================== */

        #cust-reports-section {
            font-family:
                ${CONFIG.fontFamily};
        }


        .mc-report-wrapper {
            width:100%;
            box-sizing:border-box;
        }


        .mc-report-card {
            width:100%;
            background:#ffffff;
            border:1px solid ${CONFIG.colors.border};
            border-radius:12px;
            overflow:hidden;
            box-shadow:
                0 3px 12px rgba(0,0,0,0.035);
        }


        /* -----------------------------------------------------
           HEADER
           ----------------------------------------------------- */

        .mc-report-header {
            padding:20px 22px;
            border-bottom:1px solid ${CONFIG.colors.lightBorder};
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:15px;
        }


        .mc-report-header-left {
            display:flex;
            align-items:center;
            gap:12px;
        }


        .mc-report-icon {
            width:42px;
            height:42px;
            border-radius:9px;
            background:#eff6ff;
            color:${CONFIG.colors.primary};
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:18px;
        }


        .mc-report-header-title {
            margin:0;
            font-size:19px;
            line-height:1.2;
            font-weight:800;
            color:${CONFIG.colors.primaryDark};
        }


        .mc-report-header-subtitle {
            margin:4px 0 0;
            font-size:12px;
            color:${CONFIG.colors.muted};
            font-weight:400;
        }


        /* -----------------------------------------------------
           FILTER AREA
           ----------------------------------------------------- */

        .mc-report-filter {
            padding:20px 22px;
            background:#fbfcfd;
            border-bottom:1px solid ${CONFIG.colors.lightBorder};
        }


        .mc-report-grid {
            display:grid;
            grid-template-columns:
                repeat(4, minmax(0, 1fr));
            gap:15px;
        }


        .mc-report-field {
            min-width:0;
        }


        .mc-report-field label {
            display:block;
            margin-bottom:6px;
            font-size:12px;
            font-weight:700;
            color:#374151;
        }


        .mc-report-field label i {
            color:${CONFIG.colors.primary};
            margin-right:5px;
        }


        .mc-report-field input,
        .mc-report-field select {
            width:100%;
            height:40px;
            box-sizing:border-box;
            padding:0 11px;
            border:1px solid #cfd5dc;
            border-radius:7px;
            background:#ffffff;
            color:#1f2937;
            font-family:${CONFIG.fontFamily};
            font-size:12px;
            outline:none;
            transition:
                border-color .15s,
                box-shadow .15s;
        }


        .mc-report-field input:focus,
        .mc-report-field select:focus {
            border-color:${CONFIG.colors.primary};
            box-shadow:
                0 0 0 3px rgba(33,118,255,0.08);
        }


        .mc-report-actions {
            margin-top:17px;
            display:flex;
            align-items:center;
            justify-content:flex-end;
            gap:9px;
            flex-wrap:wrap;
        }


        .mc-report-btn {
            height:39px;
            padding:0 16px;
            border-radius:7px;
            border:1px solid transparent;
            font-family:${CONFIG.fontFamily};
            font-size:12px;
            font-weight:700;
            cursor:pointer;
            display:inline-flex;
            align-items:center;
            justify-content:center;
            gap:7px;
            transition:all .15s;
        }


        .mc-report-btn-primary {
            background:${CONFIG.colors.primary};
            color:#ffffff;
        }


        .mc-report-btn-primary:hover {
            background:#1268e8;
        }


        .mc-report-btn-secondary {
            background:#ffffff;
            color:#374151;
            border-color:#d5d9df;
        }


        .mc-report-btn-secondary:hover {
            background:#f3f4f6;
        }


        .mc-report-btn-pdf {
            background:#111827;
            color:#ffffff;
        }


        .mc-report-btn-pdf:hover {
            background:#000000;
        }


        .mc-report-message {
            display:none;
            margin-top:12px;
            padding:9px 11px;
            border-radius:7px;
            font-size:12px;
            font-weight:600;
        }


        .mc-report-message.show {
            display:block;
        }


        .mc-report-message.error {
            background:#fef2f2;
            color:#b91c1c;
            border:1px solid #fecaca;
        }


        .mc-report-message.success {
            background:#ecfdf5;
            color:#047857;
            border:1px solid #a7f3d0;
        }


        .mc-report-message.info {
            background:#eff6ff;
            color:#1d4ed8;
            border:1px solid #bfdbfe;
        }


        /* -----------------------------------------------------
           PREVIEW
           ----------------------------------------------------- */

        .mc-report-preview {
            display:none;
            padding:22px;
        }


        .mc-report-preview.show {
            display:block;
        }


        .mc-preview-toolbar {
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            margin-bottom:15px;
        }


        .mc-preview-title {
            margin:0;
            color:${CONFIG.colors.primaryDark};
            font-size:14px;
            font-weight:800;
        }


        .mc-preview-count {
            color:${CONFIG.colors.muted};
            font-size:11px;
        }


        /* -----------------------------------------------------
           REPORT PAPER
           ----------------------------------------------------- */

        .mc-report-paper {
            background:#ffffff;
            border:1px solid ${CONFIG.colors.lightBorder};
            padding:24px;
            box-sizing:border-box;
            overflow:hidden;
        }


        .mc-paper-heading {
            text-align:center;
            margin-bottom:17px;
        }


        .mc-paper-company {
            margin:0;
            font-family:
                Arial,
                "Times New Roman",
                sans-serif;
            font-size:23px;
            line-height:1.2;
            font-weight:800;
            color:#111111;
            letter-spacing:.2px;
        }


        .mc-paper-title {
            margin:5px 0 0;
            font-size:15px;
            font-weight:700;
            color:#222222;
        }


        .mc-paper-meta {
            margin:8px 0 0;
            font-size:10.5px;
            color:#555555;
            line-height:1.7;
        }


        .mc-paper-info {
            display:grid;
            grid-template-columns:
                repeat(3, minmax(0,1fr));
            gap:8px;
            margin-bottom:15px;
        }


        .mc-paper-info-box {
            border:1px solid #d9dde2;
            padding:7px 9px;
            background:#fafafa;
            min-width:0;
        }


        .mc-paper-info-label {
            display:block;
            font-size:9px;
            color:#777777;
            margin-bottom:2px;
        }


        .mc-paper-info-value {
            display:block;
            font-size:10px;
            font-weight:700;
            color:#222222;
            word-break:break-word;
        }


        /* -----------------------------------------------------
           TABLE
           ----------------------------------------------------- */

        .mc-table-wrap {
            width:100%;
            overflow-x:auto;
        }


        .mc-report-table {
            width:100%;
            border-collapse:collapse;
            table-layout:fixed;
        }


        .mc-report-table th,
        .mc-report-table td {
            border:1px solid #222222;
            padding:6px 6px;
            font-family:${CONFIG.fontFamily};
            font-size:10px;
            line-height:1.35;
            vertical-align:middle;
            word-wrap:break-word;
            overflow-wrap:anywhere;
        }


        .mc-report-table th {
            background:#f2f2f2;
            color:#111111;
            font-weight:700;
            text-align:center;
        }


        .mc-report-table td {
            color:#222222;
        }


        .mc-report-table .center {
            text-align:center;
        }


        .mc-report-table .right {
            text-align:right;
        }


        .mc-report-table .debit {
            color:${CONFIG.colors.red};
            font-weight:700;
        }


        .mc-report-table .credit {
            color:${CONFIG.colors.green};
            font-weight:700;
        }


        .mc-report-table tfoot td {
            background:#f7f7f7;
            font-weight:700;
        }


        .mc-report-empty {
            padding:45px 20px;
            text-align:center;
            color:#8a8f98;
            font-size:13px;
        }


        .mc-report-empty i {
            display:block;
            font-size:25px;
            margin-bottom:8px;
        }


        /* -----------------------------------------------------
           COLUMN WIDTH
           ----------------------------------------------------- */

        .mc-col-no {
            width:5%;
        }

        .mc-col-date {
            width:9%;
        }

        .mc-col-time {
            width:8%;
        }

        .mc-col-customer {
            width:13%;
        }

        .mc-col-type {
            width:9%;
        }

        .mc-col-details {
            width:18%;
        }

        .mc-col-comment {
            width:14%;
        }

        .mc-col-debit {
            width:8%;
        }

        .mc-col-credit {
            width:8%;
        }

        .mc-col-balance {
            width:8%;
        }


        /* -----------------------------------------------------
           RESPONSIVE
           ----------------------------------------------------- */

        @media (max-width: 1000px) {

            .mc-report-grid {
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
            }

        }


        @media (max-width: 650px) {

            .mc-report-header {
                padding:16px;
            }


            .mc-report-filter {
                padding:16px;
            }


            .mc-report-preview {
                padding:12px;
            }


            .mc-report-grid {
                grid-template-columns:1fr;
            }


            .mc-paper-info {
                grid-template-columns:1fr;
            }


            .mc-report-actions {
                justify-content:stretch;
            }


            .mc-report-btn {
                flex:1;
            }


            .mc-report-paper {
                padding:12px;
            }

        }


        /* -----------------------------------------------------
           PDF AREA
           ----------------------------------------------------- */

        .mc-pdf-render-area {
            width:210mm;
            min-height:297mm;
            box-sizing:border-box;
            padding:10mm;
            background:#ffffff;
            color:#111111;
            font-family:${CONFIG.fontFamily};
        }


        .mc-pdf-render-area .mc-report-table th,
        .mc-pdf-render-area .mc-report-table td {
            font-size:9px;
            padding:5px 5px;
        }


        /* -----------------------------------------------------
           PRINT
           ----------------------------------------------------- */

        @media print {

            body * {
                visibility:hidden !important;
            }


            #mc-report-pdf-area,
            #mc-report-pdf-area * {
                visibility:visible !important;
            }


            #mc-report-pdf-area {
                position:absolute;
                left:0;
                top:0;
                width:210mm !important;
                margin:0 !important;
                padding:10mm !important;
                border:none !important;
            }

        }

        `;


        document.head.appendChild(style);

    }


    /* =========================================================
       BUILD REPORT CENTER UI
       ========================================================= */

    function buildUI() {

        const container =
            document.getElementById(
                "cust-reports-section"
            );


        if (!container) {
            return false;
        }


        injectStyles();


        container.innerHTML = `

        <div class="mc-report-wrapper">

            <div class="mc-report-card">


                <!-- =============================================
                     HEADER
                     ============================================= -->

                <div class="mc-report-header">

                    <div class="mc-report-header-left">

                        <div class="mc-report-icon">

                            <i class="fa-solid fa-file-invoice-dollar"></i>

                        </div>


                        <div>

                            <h2 class="mc-report-header-title">

                                রিপোর্ট সেন্টার

                            </h2>


                            <p class="mc-report-header-subtitle">

                                প্রয়োজন অনুযায়ী রিপোর্ট নির্বাচন করুন এবং PDF ডাউনলোড করুন।

                            </p>

                        </div>

                    </div>

                </div>


                <!-- =============================================
                     FILTER
                     ============================================= -->

                <div class="mc-report-filter">


                    <div class="mc-report-grid">


                        <!-- REPORT TYPE -->

                        <div class="mc-report-field">

                            <label>

                                <i class="fa-solid fa-file-lines"></i>

                                রিপোর্টের ধরন

                            </label>


                            <select id="mc-report-type">

                                ${REPORT_TYPES.map(function (report) {

                                    return `

                                    <option
                                        value="${escapeHtml(report.id)}"
                                        ${report.available ? "" : "disabled"}
                                    >

                                        ${escapeHtml(
                                            report.banglaTitle
                                        )}

                                    </option>

                                    `;

                                }).join("")}

                            </select>

                        </div>


                        <!-- DATE MODE -->

                        <div class="mc-report-field">

                            <label>

                                <i class="fa-solid fa-calendar-days"></i>

                                তারিখের ধরন

                            </label>


                            <select id="mc-report-date-mode">

                                <option value="single">

                                    নির্দিষ্ট তারিখ

                                </option>


                                <option value="range" selected>

                                    তারিখের পরিসর

                                </option>


                                <option value="all">

                                    সকল তারিখ

                                </option>

                            </select>

                        </div>


                        <!-- FROM DATE -->

                        <div
                            class="mc-report-field"
                            id="mc-from-date-field"
                        >

                            <label>

                                <i class="fa-solid fa-calendar-plus"></i>

                                শুরু তারিখ

                            </label>


                            <input
                                type="date"
                                id="mc-report-from-date"
                            >

                        </div>


                        <!-- TO DATE -->

                        <div
                            class="mc-report-field"
                            id="mc-to-date-field"
                        >

                            <label>

                                <i class="fa-solid fa-calendar-check"></i>

                                শেষ তারিখ

                            </label>


                            <input
                                type="date"
                                id="mc-report-to-date"
                            >

                        </div>


                        <!-- CUSTOMER -->

                        <div class="mc-report-field">

                            <label>

                                <i class="fa-solid fa-user"></i>

                                কাস্টমার

                            </label>


                            <select id="mc-report-customer">

                                <option value="all">

                                    সকল কাস্টমার

                                </option>

                            </select>

                        </div>


                    </div>


                    <!-- =========================================
                         ACTIONS
                         ========================================= -->

                    <div class="mc-report-actions">


                        <button
                            type="button"
                            class="mc-report-btn mc-report-btn-secondary"
                            id="mc-report-reset"
                        >

                            <i class="fa-solid fa-rotate-left"></i>

                            রিসেট

                        </button>


                        <button
                            type="button"
                            class="mc-report-btn mc-report-btn-primary"
                            id="mc-report-generate"
                        >

                            <i class="fa-solid fa-file-circle-check"></i>

                            রিপোর্ট তৈরি করুন

                        </button>


                        <button
                            type="button"
                            class="mc-report-btn mc-report-btn-pdf"
                            id="mc-report-download"
                            style="display:none;"
                        >

                            <i class="fa-solid fa-file-pdf"></i>

                            PDF ডাউনলোড

                        </button>


                    </div>


                    <!-- STATUS -->

                    <div
                        id="mc-report-message"
                        class="mc-report-message"
                    ></div>


                </div>


                <!-- =============================================
                     PREVIEW
                     ============================================= -->

                <div
                    class="mc-report-preview"
                    id="mc-report-preview"
                >

                    <div class="mc-preview-toolbar">


                        <div>

                            <h3 class="mc-preview-title">

                                <i class="fa-solid fa-eye"></i>

                                রিপোর্ট প্রিভিউ

                            </h3>

                        </div>


                        <span
                            class="mc-preview-count"
                            id="mc-report-count"
                        ></span>


                    </div>


                    <div
                        id="mc-report-paper"
                        class="mc-report-paper"
                    ></div>


                </div>


            </div>

        </div>

        `;


        setDefaultDates();

        populateCustomerDropdown();

        attachEvents();

        handleDateMode();


        return true;

    }


    /* =========================================================
       SET DEFAULT DATES
       ========================================================= */

    function setDefaultDates() {

        const today =
            getToday();


        const from =
            document.getElementById(
                "mc-report-from-date"
            );


        const to =
            document.getElementById(
                "mc-report-to-date"
            );


        if (from) {
            from.value = today;
        }


        if (to) {
            to.value = today;
        }

    }


    /* =========================================================
       POPULATE CUSTOMER DROPDOWN
       ========================================================= */

    function populateCustomerDropdown() {

        const select =
            document.getElementById(
                "mc-report-customer"
            );


        if (!select) {
            return;
        }


        const currentValue =
            select.value || "all";


        const customers =
            getCustomers();


        const sorted =
            [...customers].sort(function (a, b) {

                return String(a.name || "")
                    .localeCompare(
                        String(b.name || ""),
                        "bn"
                    );

            });


        select.innerHTML = `

            <option value="all">

                সকল কাস্টমার

            </option>

        `;


        sorted.forEach(function (customer) {

            if (!customer.customerId) {
                return;
            }


            select.insertAdjacentHTML(
                "beforeend",
                `

                <option
                    value="${escapeHtml(
                        customer.customerId
                    )}"
                >

                    ${escapeHtml(
                        customer.name ||
                        "Unnamed Customer"
                    )}

                    — ${escapeHtml(
                        customer.customerId
                    )}

                </option>

                `
            );

        });


        if (
            currentValue === "all" ||
            sorted.some(function (customer) {

                return String(
                    customer.customerId
                ) === String(currentValue);

            })
        ) {

            select.value =
                currentValue;

        }

    }


    /* =========================================================
       DATE MODE
       ========================================================= */

    function handleDateMode() {

        const mode =
            document.getElementById(
                "mc-report-date-mode"
            )?.value;


        const fromField =
            document.getElementById(
                "mc-from-date-field"
            );


        const toField =
            document.getElementById(
                "mc-to-date-field"
            );


        if (!fromField || !toField) {
            return;
        }


        if (mode === "single") {

            fromField.style.display =
                "block";

            toField.style.display =
                "none";

        }


        else if (mode === "range") {

            fromField.style.display =
                "block";

            toField.style.display =
                "block";

        }


        else {

            fromField.style.display =
                "none";

            toField.style.display =
                "none";

        }

    }


    /* =========================================================
       MESSAGE
       ========================================================= */

    function showMessage(
        message,
        type = "info"
    ) {

        const box =
            document.getElementById(
                "mc-report-message"
            );


        if (!box) {
            return;
        }


        box.textContent =
            message;


        box.className =
            "mc-report-message show " +
            type;

    }


    function hideMessage() {

        const box =
            document.getElementById(
                "mc-report-message"
            );


        if (!box) {
            return;
        }


        box.className =
            "mc-report-message";

        box.textContent =
            "";

    }


    /* =========================================================
       ATTACH EVENTS
       ========================================================= */

    function attachEvents() {

        const dateMode =
            document.getElementById(
                "mc-report-date-mode"
            );


        if (dateMode) {

            dateMode.addEventListener(
                "change",
                handleDateMode
            );

        }


        const generate =
            document.getElementById(
                "mc-report-generate"
            );


        if (generate) {

            generate.addEventListener(
                "click",
                generateReport
            );

        }


        const reset =
            document.getElementById(
                "mc-report-reset"
            );


        if (reset) {

            reset.addEventListener(
                "click",
                resetReport
            );

        }


        const download =
            document.getElementById(
                "mc-report-download"
            );


        if (download) {

            download.addEventListener(
                "click",
                downloadPDF
            );

        }


        const reportType =
            document.getElementById(
                "mc-report-type"
            );


        if (reportType) {

            reportType.addEventListener(
                "change",
                function () {

                    const selected =
                        reportType.value;


                    if (
                        selected ===
                        "customer-transaction"
                    ) {

                        return;

                    }

                }
            );

        }

    }


    /* =========================================================
       VALIDATE FILTER
       ========================================================= */

    function validateFilter() {

        const mode =
            document.getElementById(
                "mc-report-date-mode"
            )?.value;


        const from =
            document.getElementById(
                "mc-report-from-date"
            )?.value;


        const to =
            document.getElementById(
                "mc-report-to-date"
            )?.value;


        if (mode === "single") {

            if (!from) {

                showMessage(
                    "দয়া করে একটি তারিখ নির্বাচন করুন।",
                    "error"
                );

                return false;

            }

        }


        if (mode === "range") {

            if (!from || !to) {

                showMessage(
                    "শুরু এবং শেষ—দুইটি তারিখ নির্বাচন করুন।",
                    "error"
                );

                return false;

            }


            if (from > to) {

                showMessage(
                    "শুরু তারিখ শেষ তারিখের পরে হতে পারে না।",
                    "error"
                );

                return false;

            }

        }


        return true;

    }


    /* =========================================================
       GENERATE REPORT
       ========================================================= */

    function generateReport() {

        hideMessage();


        if (!validateFilter()) {
            return;
        }


        const reportType =
            document.getElementById(
                "mc-report-type"
            )?.value;


        if (
            reportType !==
            "customer-transaction"
        ) {

            showMessage(
                "এই রিপোর্টটি এখনো তৈরি করা হয়নি।",
                "error"
            );

            return;

        }


        const transactions =
            getFilteredTransactions();


        if (!transactions.length) {

            const preview =
                document.getElementById(
                    "mc-report-preview"
                );


            const download =
                document.getElementById(
                    "mc-report-download"
                );


            if (preview) {

                preview.classList.remove(
                    "show"
                );

            }


            if (download) {

                download.style.display =
                    "none";

            }


            showMessage(
                "নির্বাচিত সময়ের মধ্যে কোনো লেনদেন পাওয়া যায়নি।",
                "error"
            );

            return;

        }


        renderCustomerTransactionReport(
            transactions
        );


        const preview =
            document.getElementById(
                "mc-report-preview"
            );


        const download =
            document.getElementById(
                "mc-report-download"
            );


        if (preview) {

            preview.classList.add(
                "show"
            );

        }


        if (download) {

            download.style.display =
                "inline-flex";

        }


        showMessage(
            "রিপোর্ট সফলভাবে তৈরি হয়েছে।",
            "success"
        );

    }


    /* =========================================================
       BUILD REPORT HEADER
       ========================================================= */

    function buildReportHeader(
        transactions
    ) {

        const mode =
            document.getElementById(
                "mc-report-date-mode"
            )?.value;


        const from =
            document.getElementById(
                "mc-report-from-date"
            )?.value;


        const to =
            document.getElementById(
                "mc-report-to-date"
            )?.value;


        const customerId =
            document.getElementById(
                "mc-report-customer"
            )?.value ||
            "all";


        let period =
            "সকল তারিখ";


        if (mode === "single") {

            period =
                formatDate(
                    from
                );

        }


        if (mode === "range") {

            period =
                `${formatDate(from)} — ${formatDate(to)}`;

        }


        let customerText =
            "সকল কাস্টমার";


        if (customerId !== "all") {

            customerText =
                getCustomerName(
                    customerId
                );

        }


        return `

            <div class="mc-paper-heading">

                <h1 class="mc-paper-company">

                    ${escapeHtml(
                        CONFIG.companyName
                    )}

                </h1>


                <div class="mc-paper-title">

                    ${escapeHtml(
                        CONFIG.reportTitle
                    )}

                </div>


                <div class="mc-paper-meta">

                    রিপোর্ট সময়কাল:
                    <strong>
                        ${escapeHtml(period)}
                    </strong>

                    <br>

                    কাস্টমার:
                    <strong>
                        ${escapeHtml(customerText)}
                    </strong>

                </div>

            </div>


            <div class="mc-paper-info">


                <div class="mc-paper-info-box">

                    <span class="mc-paper-info-label">

                        মোট লেনদেন

                    </span>


                    <span class="mc-paper-info-value">

                        ${toBanglaNumber(
                            transactions.length
                        )}

                    </span>

                </div>


                <div class="mc-paper-info-box">

                    <span class="mc-paper-info-label">

                        মোট দিলাম

                    </span>


                    <span
                        class="mc-paper-info-value"
                        style="color:${CONFIG.colors.red};"
                    >

                        ${formatMoney(
                            transactions.reduce(
                                function (sum, transaction) {

                                    return sum +
                                        (
                                            Number(
                                                transaction.debit
                                            ) || 0
                                        );

                                },
                                0
                            )
                        )}

                    </span>

                </div>


                <div class="mc-paper-info-box">

                    <span class="mc-paper-info-label">

                        মোট পেলাম

                    </span>


                    <span
                        class="mc-paper-info-value"
                        style="color:${CONFIG.colors.green};"
                    >

                        ${formatMoney(
                            transactions.reduce(
                                function (sum, transaction) {

                                    return sum +
                                        (
                                            Number(
                                                transaction.credit
                                            ) || 0
                                        );

                                },
                                0
                            )
                        )}

                    </span>

                </div>


            </div>

        `;

    }


    /* =========================================================
       RENDER CUSTOMER TRANSACTION REPORT
       ========================================================= */

    function renderCustomerTransactionReport(
        transactions
    ) {

        const paper =
            document.getElementById(
                "mc-report-paper"
            );


        if (!paper) {
            return;
        }


        const runningBalances =
            calculateRunningBalances();


        let totalDebit = 0;

        let totalCredit = 0;


        let rows = "";


        transactions.forEach(
            function (transaction, index) {

                const debit =
                    Number(
                        transaction.debit
                    ) || 0;


                const credit =
                    Number(
                        transaction.credit
                    ) || 0;


                totalDebit +=
                    debit;


                totalCredit +=
                    credit;


                const customerName =
                    getCustomerName(
                        transaction.customerId
                    );


                const balance =
                    runningBalances.get(
                        String(transaction.id)
                    );


                /*
                   বিস্তারিত:
                   Existing transaction data has
                   description field.
                */

                const details =
                    transaction.description ||
                    transaction.details ||
                    transaction.particulars ||
                    "-";


                /*
                   মন্তব্য:
                   Existing transaction object may
                   not contain a comment field.
                   তাই future compatibility রাখা হয়েছে.
                */

                const comment =
                    transaction.comment ||
                    transaction.remarks ||
                    transaction.note ||
                    transaction.notes ||
                    "-";


                const type =
                    transaction.type ||
                    "-";


                rows += `

                    <tr>


                        <td class="center">

                            ${toBanglaNumber(
                                index + 1
                            )}।

                        </td>


                        <td class="center">

                            ${escapeHtml(
                                formatDate(
                                    transaction.date
                                )
                            )}

                        </td>


                        <td class="center">

                            ${escapeHtml(
                                toBanglaNumber(
                                    transaction.time ||
                                    "-"
                                )
                            )}

                        </td>


                        <td>

                            <strong>

                                ${escapeHtml(
                                    customerName
                                )}

                            </strong>


                            <br>


                            <span
                                style="
                                    font-size:8px;
                                    color:#777;
                                "
                            >

                                ${escapeHtml(
                                    transaction.customerId ||
                                    ""
                                )}

                            </span>

                        </td>


                        <td class="center">

                            ${escapeHtml(
                                type
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                details
                            )}

                        </td>


                        <td>

                            ${escapeHtml(
                                comment
                            )}

                        </td>


                        <td
                            class="right debit"
                        >

                            ${
                                debit > 0
                                    ? formatMoney(debit)
                                    : "-"
                            }

                        </td>


                        <td
                            class="right credit"
                        >

                            ${
                                credit > 0
                                    ? formatMoney(credit)
                                    : "-"
                            }

                        </td>


                        <td class="right">

                            ${
                                typeof balance ===
                                "number"

                                    ? formatMoney(
                                        balance
                                    )

                                    : "-"
                            }

                        </td>


                    </tr>

                `;

            }
        );


        paper.innerHTML = `

            ${buildReportHeader(
                transactions
            )}


            <div class="mc-table-wrap">

                <table class="mc-report-table">


                    <colgroup>

                        <col class="mc-col-no">

                        <col class="mc-col-date">

                        <col class="mc-col-time">

                        <col class="mc-col-customer">

                        <col class="mc-col-type">

                        <col class="mc-col-details">

                        <col class="mc-col-comment">

                        <col class="mc-col-debit">

                        <col class="mc-col-credit">

                        <col class="mc-col-balance">

                    </colgroup>


                    <thead>

                        <tr>

                            <th>ক্রমিক</th>

                            <th>তারিখ</th>

                            <th>সময়</th>

                            <th>কাস্টমার</th>

                            <th>লেনদেন</th>

                            <th>বিস্তারিত</th>

                            <th>মন্তব্য</th>

                            <th>দিলাম</th>

                            <th>পেলাম</th>

                            <th>অবশিষ্ট বাকি</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>


                    <tfoot>

                        <tr>

                            <td
                                colspan="7"
                                class="right"
                            >

                                সর্বমোট:

                            </td>


                            <td
                                class="right debit"
                            >

                                ${formatMoney(
                                    totalDebit
                                )}

                            </td>


                            <td
                                class="right credit"
                            >

                                ${formatMoney(
                                    totalCredit
                                )}

                            </td>


                            <td class="right">

                                -

                            </td>

                        </tr>

                    </tfoot>


                </table>

            </div>

        `;


        const count =
            document.getElementById(
                "mc-report-count"
            );


        if (count) {

            count.textContent =
                `${toBanglaNumber(
                    transactions.length
                )}টি লেনদেন পাওয়া গেছে`;

        }

    }


    /* =========================================================
       RESET
       ========================================================= */

    function resetReport() {

        const reportType =
            document.getElementById(
                "mc-report-type"
            );


        const dateMode =
            document.getElementById(
                "mc-report-date-mode"
            );


        const customer =
            document.getElementById(
                "mc-report-customer"
            );


        const preview =
            document.getElementById(
                "mc-report-preview"
            );


        const download =
            document.getElementById(
                "mc-report-download"
            );


        const paper =
            document.getElementById(
                "mc-report-paper"
            );


        if (reportType) {

            reportType.value =
                "customer-transaction";

        }


        if (dateMode) {

            dateMode.value =
                "range";

        }


        if (customer) {

            customer.value =
                "all";

        }


        setDefaultDates();


        handleDateMode();


        if (preview) {

            preview.classList.remove(
                "show"
            );

        }


        if (download) {

            download.style.display =
                "none";

        }


        if (paper) {

            paper.innerHTML =
                "";

        }


        hideMessage();

    }


    /* =========================================================
       CREATE PDF HTML
       ========================================================= */

    function createPDFDocument() {

        const paper =
            document.getElementById(
                "mc-report-paper"
            );


        if (!paper) {
            return null;
        }


        const clone =
            paper.cloneNode(true);


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "mc-pdf-render-area";


        wrapper.id =
            "mc-report-pdf-area";


        wrapper.innerHTML =
            clone.innerHTML;


        return wrapper;

    }


    /* =========================================================
       DOWNLOAD PDF
       ========================================================= */

    async function downloadPDF() {

        hideMessage();


        const paper =
            document.getElementById(
                "mc-report-paper"
            );


        if (
            !paper ||
            !paper.innerHTML.trim()
        ) {

            showMessage(
                "আগে রিপোর্ট তৈরি করুন।",
                "error"
            );

            return;

        }


        /*
           html2pdf availability
        */

        if (
            typeof window.html2pdf !==
            "function"
        ) {

            showMessage(
                "PDF engine পাওয়া যায়নি। html2pdf library load হয়েছে কিনা পরীক্ষা করুন।",
                "error"
            );

            return;

        }


        const button =
            document.getElementById(
                "mc-report-download"
            );


        const originalText =
            button
                ? button.innerHTML
                : "";


        if (button) {

            button.disabled =
                true;

            button.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                PDF তৈরি হচ্ছে...

            `;

        }


        try {

            /*
               Font ready
            */

            if (document.fonts) {

                await document.fonts.ready;

                try {

                    await document.fonts.load(
                        "16px 'Tiro Bangla'"
                    );

                } catch (fontError) {

                    console.warn(
                        "Tiro Bangla font load warning:",
                        fontError
                    );

                }

            }


            /*
               Small render delay
            */

            await new Promise(
                function (resolve) {

                    setTimeout(
                        resolve,
                        250
                    );

                }
            );


            /*
               Create a normal DOM element.
               It is NOT placed at negative
               z-index or far off-screen.
            */

            const pdfElement =
                createPDFDocument();


            if (!pdfElement) {

                throw new Error(
                    "PDF content could not be created."
                );

            }


            /*
               Put it temporarily in the body.
            */

            pdfElement.style.position =
                "fixed";

            pdfElement.style.left =
                "0";

            pdfElement.style.top =
                "0";

            pdfElement.style.zIndex =
                "999999";

            pdfElement.style.visibility =
                "hidden";

            pdfElement.style.pointerEvents =
                "none";


            document.body.appendChild(
                pdfElement
            );


            /*
               Force layout.
            */

            void pdfElement.offsetHeight;


            const from =
                document.getElementById(
                    "mc-report-from-date"
                )?.value ||
                getToday();


            const to =
                document.getElementById(
                    "mc-report-to-date"
                )?.value ||
                from;


            const dateMode =
                document.getElementById(
                    "mc-report-date-mode"
                )?.value;


            let dateName =
                from;


            if (dateMode === "range") {

                dateName =
                    `${from}_${to}`;

            }


            const fileName =
                `${CONFIG.pdfFileName}_${dateName}.pdf`;


            const options = {

                margin: 0,

                filename:
                    fileName,

                image: {

                    type: "jpeg",

                    quality: 0.98

                },

                html2canvas: {

                    scale: 3,

                    useCORS: true,

                    allowTaint: false,

                    backgroundColor:
                        "#ffffff",

                    logging: false,

                    letterRendering: true,

                    imageTimeout:
                        15000,

                    scrollX: 0,

                    scrollY: 0

                },

                jsPDF: {

                    unit: "mm",

                    format: "a4",

                    orientation: "landscape",

                    compress: true

                },

                pagebreak: {

                    mode: [
                        "css",
                        "legacy"
                    ]

                }

            };


            /*
               Generate PDF
            */

            await window
                .html2pdf()
                .set(options)
                .from(pdfElement)
                .save();


            showMessage(
                "PDF সফলভাবে ডাউনলোড হয়েছে।",
                "success"
            );


        }

        catch (error) {

            console.error(
                "Mousumi Report PDF Error:",
                error
            );


            showMessage(
                "PDF তৈরি করতে সমস্যা হয়েছে। Browser Console পরীক্ষা করুন।",
                "error"
            );

        }

        finally {

            const pdfElement =
                document.getElementById(
                    "mc-report-pdf-area"
                );


            if (
                pdfElement &&
                pdfElement.parentNode
            ) {

                pdfElement.parentNode
                    .removeChild(
                        pdfElement
                    );

            }


            if (button) {

                button.disabled =
                    false;

                button.innerHTML =
                    originalText;

            }

        }

    }


    /* =========================================================
       REFRESH CUSTOMER DROPDOWN
       ---------------------------------------------------------
       Main ERP-তে নতুন customer যোগ হলে
       এই function manually call করা যাবে.
       ========================================================= */

    window.refreshMousumiReportCustomers =
        function () {

            populateCustomerDropdown();

        };


    /* =========================================================
       OPEN REPORT CENTER
       ========================================================= */

    window.openMousumiReportCenter =
        function () {

            const container =
                document.getElementById(
                    "cust-reports-section"
                );


            if (!container) {
                return;
            }


            if (
                !container.querySelector(
                    ".mc-report-wrapper"
                )
            ) {

                buildUI();

            }


            populateCustomerDropdown();

            handleDateMode();

        };


    /* =========================================================
       SIDEBAR REPORT MENU
       ---------------------------------------------------------
       Existing index.html না বদলিয়ে Reports menu-কে
       single Reports entry হিসেবে ব্যবহার করার চেষ্টা।
       ========================================================= */

    function configureSidebar() {

        const parent =
            document.getElementById(
                "menu-reports-parent"
            );


        if (!parent) {
            return;
        }


        /*
           Change menu title
        */

        const title =
            parent.querySelector(
                ".menu-link-inner span"
            );


        if (title) {

            title.textContent =
                "Reports";

        }


        /*
           Hide old report submenu.
           Main Reports page remains one page.
        */

        const submenu =
            parent.querySelector(
                ".submenu-list"
            );


        if (submenu) {

            submenu.style.display =
                "none";

        }


        /*
           Parent click opens the existing
           customer report section.
        */

        const anchor =
            parent.querySelector(
                ":scope > a"
            );


        if (anchor) {

            anchor.onclick =
                function (event) {

                    if (event) {

                        event.preventDefault();

                    }


                    /*
                       Use existing navigation
                       function when available.
                    */

                    if (
                        typeof window
                            .switchCustomerSubSection ===
                        "function"
                    ) {

                        window.switchCustomerSubSection(
                            "cust-reports-section"
                        );

                    }


                    else {

                        const section =
                            document.getElementById(
                                "cust-reports-section"
                            );


                        if (section) {

                            section.style.display =
                                "block";

                        }

                    }


                    window.openMousumiReportCenter();

                };

        }

    }


    /* =========================================================
       INITIALIZATION
       ========================================================= */

    function initialize() {

        injectStyles();


        /*
           Try several times because Firebase/
           main application may initialize after
           this module.
        */

        let attempts = 0;


        const timer =
            setInterval(
                function () {

                    attempts++;


                    const container =
                        document.getElementById(
                            "cust-reports-section"
                        );


                    if (container) {

                        buildUI();

                        configureSidebar();

                        clearInterval(timer);

                        return;

                    }


                    if (attempts >= 30) {

                        clearInterval(timer);

                        console.warn(
                            "Mousumi Reports Center: cust-reports-section not found."
                        );

                    }

                },
                300
            );

    }


    /* =========================================================
       DOM READY
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    }

    else {

        initialize();

    }


})();
