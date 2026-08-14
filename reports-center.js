/* ============================================================
   MOUSUMI COMPUTER
   REPORTS CENTER MODULE
   ------------------------------------------------------------
   Standalone Report Center

   IMPORTANT:
   - Existing accounting logic is NOT modified.
   - Existing Firebase data is only READ.
   - Existing modules remain untouched.
   - Reports are generated from existing Firebase data.
   - PDF uses Browser Native Print -> Save as PDF.
   ============================================================ */

(function () {

    "use strict";


    /* ============================================================
       CONFIGURATION
       ============================================================ */

    const REPORTS_CONFIG = {

        firebase: {
            apiKey: "AIzaSyA1PhRiTkICNCd8sA4he3ZxKjHtIzM0d5E",
            authDomain: "mousumi-computer.firebaseapp.com",
            databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
            projectId: "mousumi-computer",
            storageBucket: "mousumi-computer.firebasestorage.app",
            messagingSenderId: "104820462623",
            appId: "1:104820462623:web-e3abae9533cc841463712a"
        },

        shopName: "MOUSUMI COMPUTER"

    };


    /* ============================================================
       FIREBASE MODULE REFERENCES
       ============================================================ */

    let firebaseDB = null;
    let firebaseAuth = null;

    let reportDataCache = {

        customers: [],
        transactions: [],
        erp: {}

    };


    /* ============================================================
       BASIC HELPERS
       ============================================================ */

    function toArray(value) {

        if (Array.isArray(value)) {

            return value;

        }

        if (
            value &&
            typeof value === "object"
        ) {

            return Object.values(value);

        }

        return [];

    }


    function escapeHTML(value) {

        return String(value ?? "")
            .replace(
                /[&<>"']/g,
                function (character) {

                    const map = {

                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': "&quot;",
                        "'": "&#039;"

                    };

                    return map[character];

                }
            );

    }


    function money(value) {

        const amount =
            Number(value) || 0;


        return amount.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    }


    function moneyBD(value) {

        return "৳ " + money(value);

    }


    function formatDate(dateValue) {

        if (!dateValue) {

            return "-";

        }


        const date =
            new Date(
                String(dateValue).length === 10
                    ? String(dateValue) + "T00:00:00"
                    : dateValue
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return escapeHTML(
                dateValue
            );

        }


        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            }
        );

    }


    function todayString() {

        const date =
            new Date();


        const year =
            date.getFullYear();


        const month =
            String(
                date.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                date.getDate()
            ).padStart(
                2,
                "0"
            );


        return (
            year +
            "-" +
            month +
            "-" +
            day
        );

    }


    function setDefaultDates() {

        const today =
            todayString();


        const first =
            new Date();


        first.setDate(1);


        const firstMonth =
            String(
                first.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const firstDay =
            String(
                first.getDate()
            ).padStart(
                2,
                "0"
            );


        return {

            from:
                first.getFullYear() +
                "-" +
                firstMonth +
                "-" +
                firstDay,

            to:
                today

        };

    }


    /* ============================================================
       FIREBASE INITIALIZATION
       ============================================================ */

    async function initializeReportsFirebase() {

        if (
            firebaseDB &&
            firebaseAuth
        ) {

            return true;

        }


        try {

            const firebaseAppModule =
                await import(
                    "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"
                );


            const firebaseAuthModule =
                await import(
                    "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"
                );


            const firebaseDatabaseModule =
                await import(
                    "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js"
                );


            const {

                initializeApp,
                getApps,
                getApp

            } =
                firebaseAppModule;


            const {

                getAuth

            } =
                firebaseAuthModule;


            const {

                getDatabase,
                ref,
                get

            } =
                firebaseDatabaseModule;


            let app;


            if (
                getApps().length > 0
            ) {

                app =
                    getApp();

            } else {

                app =
                    initializeApp(
                        REPORTS_CONFIG.firebase
                    );

            }


            firebaseAuth =
                getAuth(
                    app
                );


            firebaseDB =
                getDatabase(
                    app
                );


            window.__MOUSUMI_REPORTS_FIREBASE__ = {

                ref,
                get

            };


            return true;

        } catch (error) {

            console.error(
                "Reports Firebase initialization failed:",
                error
            );


            return false;

        }

    }


    /* ============================================================
       LOAD REPORT DATA
       ============================================================ */

    async function loadReportData() {

        const initialized =
            await initializeReportsFirebase();


        if (!initialized) {

            throw new Error(
                "Firebase could not be initialized."
            );

        }


        const {

            ref,
            get

        } =
            window.__MOUSUMI_REPORTS_FIREBASE__;


        const customersSnapshot =
            await get(
                ref(
                    firebaseDB,
                    "customers"
                )
            );


        const transactionsSnapshot =
            await get(
                ref(
                    firebaseDB,
                    "transactions"
                )
            );


        const erpSnapshot =
            await get(
                ref(
                    firebaseDB,
                    "erp"
                )
            );


        reportDataCache.customers =
            customersSnapshot.exists()
                ? toArray(
                    customersSnapshot.val()
                )
                : [];


        reportDataCache.transactions =
            transactionsSnapshot.exists()
                ? toArray(
                    transactionsSnapshot.val()
                )
                : [];


        reportDataCache.erp =
            erpSnapshot.exists()
                ? erpSnapshot.val()
                : {};


        return reportDataCache;

    }


    /* ============================================================
       CUSTOMER HELPER
       ============================================================ */

    function getCustomer(
        customerId
    ) {

        return reportDataCache.customers.find(
            function (customer) {

                return String(
                    customer.customerId
                ) ===
                String(
                    customerId
                );

            }
        );

    }


    /* ============================================================
       CUSTOMER DUE
       ============================================================ */

    function calculateCustomerDue(
        customerId
    ) {

        const customer =
            getCustomer(
                customerId
            );


        if (!customer) {

            return 0;

        }


        const transactions =
            reportDataCache.transactions
                .filter(
                    function (transaction) {

                        return String(
                            transaction.customerId
                        ) ===
                        String(
                            customerId
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return new Date(
                            a.createdAt || (
                                a.date +
                                " " +
                                a.time
                            )
                        ) -
                        new Date(
                            b.createdAt || (
                                b.date +
                                " " +
                                b.time
                            )
                        );

                    }
                );


        if (
            transactions.length === 0
        ) {

            return Number(
                customer.openingBalance
            ) || 0;

        }


        const last =
            transactions[
                transactions.length - 1
            ];


        return Number(
            last.runningBalance
        ) || 0;

    }


    function calculateTotalDue() {

        let total = 0;


        reportDataCache.customers
            .filter(
                function (customer) {

                    return (
                        customer.status ===
                        "Active"
                    );

                }
            )
            .forEach(
                function (customer) {

                    total +=
                        calculateCustomerDue(
                            customer.customerId
                        );

                }
            );


        return total;

    }


    /* ============================================================
       REPORT CENTER CSS
       ============================================================ */

    function injectReportCSS() {

        if (
            document.getElementById(
                "mousumi-reports-center-css"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "mousumi-reports-center-css";


        style.textContent = `

/* ============================================================
   REPORT CENTER
   ============================================================ */

#reports-center-view {

    width: 100%;

}


.mrc-header {

    display: flex;

    justify-content: space-between;

    align-items: center;

    gap: 20px;

    margin-bottom: 20px;

    flex-wrap: wrap;

}


.mrc-title {

    margin: 0;

    font-size: 1.35rem;

    font-weight: 800;

    color: var(--primary-dark, #172554);

}


.mrc-subtitle {

    margin: 5px 0 0;

    color: #64748b;

    font-size: 0.86rem;

}


.mrc-refresh {

    border: 1px solid #dbe3ee;

    background: #ffffff;

    color: #334155;

    padding: 9px 14px;

    border-radius: 8px;

    cursor: pointer;

    font-weight: 700;

}


.mrc-refresh:hover {

    background: #f8fafc;

}


.mrc-grid {

    display: grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(
                250px,
                1fr
            )
        );

    gap: 16px;

}


.mrc-card {

    background: #ffffff;

    border: 1px solid #e5e7eb;

    border-radius: 12px;

    padding: 20px;

    transition:
        transform .15s ease,
        box-shadow .15s ease;

}


.mrc-card:hover {

    transform:
        translateY(-2px);

    box-shadow:
        0 8px 22px
        rgba(
            15,
            23,
            42,
            0.08
        );

}


.mrc-icon {

    width: 44px;

    height: 44px;

    border-radius: 10px;

    display: flex;

    align-items: center;

    justify-content: center;

    background: #eff6ff;

    color: #2563eb;

    font-size: 19px;

    margin-bottom: 14px;

}


.mrc-card h4 {

    margin: 0 0 6px;

    font-size: 1rem;

    color: #172033;

}


.mrc-card p {

    margin: 0 0 16px;

    color: #64748b;

    font-size: 0.82rem;

    line-height: 1.5;

}


.mrc-actions {

    display: flex;

    gap: 8px;

    flex-wrap: wrap;

}


.mrc-btn {

    border: 0;

    border-radius: 8px;

    padding: 9px 12px;

    cursor: pointer;

    font-size: 0.8rem;

    font-weight: 700;

    display: inline-flex;

    align-items: center;

    justify-content: center;

    gap: 7px;

}


.mrc-btn-primary {

    background: #2563eb;

    color: #ffffff;

}


.mrc-btn-secondary {

    background: #f1f5f9;

    color: #334155;

}


.mrc-btn-success {

    background: #059669;

    color: #ffffff;

}


.mrc-filter-card {

    background: #ffffff;

    border: 1px solid #e5e7eb;

    border-radius: 12px;

    padding: 20px;

    margin-bottom: 18px;

}


.mrc-filter-grid {

    display: grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(
                180px,
                1fr
            )
        );

    gap: 12px;

}


.mrc-field label {

    display: block;

    font-size: 0.78rem;

    font-weight: 700;

    color: #475569;

    margin-bottom: 5px;

}


.mrc-field input,
.mrc-field select {

    width: 100%;

    height: 40px;

    border: 1px solid #dbe3ee;

    border-radius: 7px;

    padding: 0 10px;

    background: #ffffff;

    color: #1e293b;

}


.mrc-report-result {

    margin-top: 18px;

}


.mrc-summary-grid {

    display: grid;

    grid-template-columns:
        repeat(
            auto-fit,
            minmax(
                170px,
                1fr
            )
        );

    gap: 12px;

    margin-bottom: 16px;

}


.mrc-summary {

    border: 1px solid #e5e7eb;

    background: #ffffff;

    border-radius: 10px;

    padding: 14px;

}


.mrc-summary-label {

    color: #64748b;

    font-size: 0.76rem;

}


.mrc-summary-value {

    margin-top: 5px;

    font-size: 1.05rem;

    font-weight: 800;

    color: #172033;

}


.mrc-table-wrap {

    overflow-x: auto;

    border: 1px solid #e5e7eb;

    border-radius: 10px;

    background: #ffffff;

}


.mrc-table {

    width: 100%;

    border-collapse: collapse;

    min-width: 700px;

}


.mrc-table th,
.mrc-table td {

    border-bottom:
        1px solid #e5e7eb;

    padding: 10px;

    text-align: left;

    font-size: 0.82rem;

}


.mrc-table th {

    background: #f8fafc;

    color: #475569;

    font-weight: 800;

}


.mrc-table td {

    color: #334155;

}


.mrc-empty {

    padding: 35px;

    text-align: center;

    color: #94a3b8;

}


.mrc-loading {

    padding: 35px;

    text-align: center;

    color: #64748b;

}


.mrc-back {

    margin-bottom: 12px;

    border: 0;

    background: transparent;

    color: #2563eb;

    cursor: pointer;

    font-weight: 700;

}


@media (max-width: 700px) {

    .mrc-card {

        padding: 16px;

    }

}

        `;


        document.head.appendChild(
            style
        );

    }


    /* ============================================================
       SIDEBAR INSTALLATION
       ============================================================ */

    function installSidebarModule() {

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        if (!sidebar) {

            return false;

        }


        const oldReports =
            document.getElementById(
                "menu-reports-parent"
            );


        /*
         * Existing Reports & History menu already exists
         * in the ERP. We reuse its position and convert it
         * into the new Reports Center without changing the
         * accounting source code.
         */

        if (oldReports) {

            const anchor =
                oldReports.querySelector(
                    ":scope > a"
                );


            if (anchor) {

                const newAnchor =
                    anchor.cloneNode(
                        true
                    );


                newAnchor.removeAttribute(
                    "onclick"
                );


                newAnchor.onclick =
                    function (event) {

                        event.preventDefault();

                        event.stopPropagation();

                        openReportsCenter();

                    };


                oldReports.replaceChild(
                    newAnchor,
                    anchor
                );

            }


            const oldSubmenu =
                oldReports.querySelector(
                    ":scope > .submenu-list"
                );


            if (oldSubmenu) {

                oldSubmenu.style.display =
                    "none";

            }


            const text =
                oldReports.querySelector(
                    ":scope > a .menu-link-inner span"
                );


            if (text) {

                text.textContent =
                    "Reports";

            }


            oldReports.classList.remove(
                "open"
            );


            oldReports.classList.remove(
                "active"
            );


            oldReports.dataset.mousumiReportsCenter =
                "true";


            return true;

        }


        /*
         * Fallback:
         * If old reports menu does not exist,
         * create a new one before Settings.
         */

        const settings =
            document.getElementById(
                "menu-settings-parent"
            );


        const li =
            document.createElement(
                "li"
            );


        li.className =
            "menu-item";


        li.id =
            "menu-mousumi-reports";


        li.innerHTML = `

            <a href="#">

                <span class="menu-link-inner">

                    <i class="fa-solid fa-file-invoice-dollar"></i>

                    <span>Reports</span>

                </span>

            </a>

        `;


        li.querySelector(
            "a"
        ).onclick =
            function (event) {

                event.preventDefault();

                openReportsCenter();

            };


        if (settings) {

            sidebar
                .querySelector(
                    ".menu-list"
                )
                .insertBefore(
                    li,
                    settings
                );

        } else {

            sidebar
                .querySelector(
                    ".menu-list"
                )
                .appendChild(
                    li
                );

        }


        return true;

    }


    /* ============================================================
       CREATE REPORT CENTER VIEW
       ============================================================ */

    function createReportCenterView() {

        if (
            document.getElementById(
                "reports-center-view"
            )
        ) {

            return;

        }


        const mainWrapper =
            document.querySelector(
                ".main-wrapper"
            );


        if (!mainWrapper) {

            return;

        }


        const view =
            document.createElement(
                "div"
            );


        view.className =
            "view-panel";


        view.id =
            "reports-center-view";


        view.innerHTML = `

            <div class="mrc-header">

                <div>

                    <h2 class="mrc-title">

                        REPORT CENTER

                    </h2>

                    <p class="mrc-subtitle">

                        আপনার প্রয়োজনীয় সকল রিপোর্ট
                        এক জায়গা থেকে তৈরি ও PDF হিসেবে
                        সংরক্ষণ করুন।

                    </p>

                </div>


                <button
                    class="mrc-refresh"
                    type="button"
                    onclick="MousumiReports.refresh()"
                >

                    <i class="fa-solid fa-rotate"></i>

                    Refresh

                </button>

            </div>


            <div
                id="mrc-main-content"
            >

                <div class="mrc-loading">

                    Reports Center প্রস্তুত হচ্ছে...

                </div>

            </div>

        `;


        mainWrapper.appendChild(
            view
        );

    }


    /* ============================================================
       REPORT CARD DEFINITIONS
       ============================================================ */

    function reportCardsHTML() {

        return `

            <div class="mrc-grid">


                <!-- DAILY TRANSACTION -->

                <div class="mrc-card">

                    <div class="mrc-icon">

                        <i class="fa-solid fa-receipt"></i>

                    </div>

                    <h4>
                        Daily Transaction Report
                    </h4>

                    <p>
                        নির্দিষ্ট তারিখের সকল
                        কাস্টমার লেনদেনের রিপোর্ট।
                    </p>

                    <div class="mrc-actions">

                        <button
                            class="mrc-btn mrc-btn-primary"
                            onclick="MousumiReports.open('transactions')"
                        >

                            <i class="fa-solid fa-file-pdf"></i>

                            Report

                        </button>

                    </div>

                </div>


                <!-- CUSTOMER LEDGER -->

                <div class="mrc-card">

                    <div class="mrc-icon">

                        <i class="fa-solid fa-user"></i>

                    </div>

                    <h4>
                        Customer Ledger
                    </h4>

                    <p>
                        নির্দিষ্ট কাস্টমারের
                        সম্পূর্ণ লেনদেনের বিবরণ।
                    </p>

                    <div class="mrc-actions">

                        <button
                            class="mrc-btn mrc-btn-primary"
                            onclick="MousumiReports.open('ledger')"
                        >

                            <i class="fa-solid fa-book"></i>

                            Report

                        </button>

                    </div>

                </div>


                <!-- DUE -->

                <div class="mrc-card">

                    <div class="mrc-icon">

                        <i class="fa-solid fa-money-bill-transfer"></i>

                    </div>

                    <h4>
                        Outstanding Due Report
                    </h4>

                    <p>
                        সকল Active Customer-এর
                        বর্তমান বকেয়া/পাওনা।
                    </p>

                    <div class="mrc-actions">

                        <button
                            class="mrc-btn mrc-btn-primary"
                            onclick="MousumiReports.open('due')"
                        >

                            <i class="fa-solid fa-file-invoice-dollar"></i>

                            Report

                        </button>

                    </div>

                </div>


                <!-- BALANCE -->

                <div class="mrc-card">

                    <div class="mrc-icon">

                        <i class="fa-solid fa-wallet"></i>

                    </div>

                    <h4>
                        Balance Summary
                    </h4>

                    <p>
                        সকল Category ও Account-এর
                        বর্তমান ব্যালেন্স।
                    </p>

                    <div class="mrc-actions">

                        <button
                            class="mrc-btn mrc-btn-primary"
                            onclick="MousumiReports.open('balance')"
                        >

                            <i class="fa-solid fa-chart-column"></i>

                            Report

                        </button>

                    </div>

                </div>


                <!-- CASH -->

                <div class="mrc-card">

                    <div class="mrc-icon">

                        <i class="fa-solid fa-money-bill-wave"></i>

                    </div>

                    <h4>
                        Cash Inventory Report
                    </h4>

                    <p>
                        Cash denomination এবং
                        মোট Cash Inventory।
                    </p>

                    <div class="mrc-actions">

                        <button
                            class="mrc-btn mrc-btn-primary"
                            onclick="MousumiReports.open('cash')"
                        >

                            <i class="fa-solid fa-file-lines"></i>

                            Report

                        </button>

                    </div>

                </div>


                <!-- CARD -->

                <div class="mrc-card">

                    <div class="mrc-icon">

                        <i class="fa-solid fa-sim-card"></i>

                    </div>

                    <h4>
                        Card Inventory Report
                    </h4>

                    <p>
                        Operator অনুযায়ী Card
                        Inventory ও মূল্য।
                    </p>

                    <div class="mrc-actions">

                        <button
                            class="mrc-btn mrc-btn-primary"
                            onclick="MousumiReports.open('card')"
                        >

                            <i class="fa-solid fa-boxes-stacked"></i>

                            Report

                        </button>

                    </div>

                </div>


                <!-- DAILY CLOSING -->

                <div class="mrc-card">

                    <div class="mrc-icon">

                        <i class="fa-solid fa-lock"></i>

                    </div>

                    <h4>
                        Daily Closing Report
                    </h4>

                    <p>
                        সংরক্ষিত Daily Closing
                        Snapshot রিপোর্ট।
                    </p>

                    <div class="mrc-actions">

                        <button
                            class="mrc-btn mrc-btn-primary"
                            onclick="MousumiReports.open('closing')"
                        >

                            <i class="fa-solid fa-file-shield"></i>

                            Report

                        </button>

                    </div>

                </div>


                <!-- AUDIT -->

                <div class="mrc-card">

                    <div class="mrc-icon">

                        <i class="fa-solid fa-clock-rotate-left"></i>

                    </div>

                    <h4>
                        Audit & History Report
                    </h4>

                    <p>
                        Account, Cash এবং Card-এর
                        সংরক্ষিত History।
                    </p>

                    <div class="mrc-actions">

                        <button
                            class="mrc-btn mrc-btn-primary"
                            onclick="MousumiReports.open('audit')"
                        >

                            <i class="fa-solid fa-history"></i>

                            Report

                        </button>

                    </div>

                </div>


            </div>

        `;

    }


    /* ============================================================
       RENDER HOME
       ============================================================ */

    function renderHome() {

        const container =
            document.getElementById(
                "mrc-main-content"
            );


        if (!container) {

            return;

        }


        container.innerHTML =
            reportCardsHTML();

    }


    /* ============================================================
       OPEN REPORT CENTER
       ============================================================ */

    async function openReportsCenter() {

        const view =
            document.getElementById(
                "reports-center-view"
            );


        if (!view) {

            return;

        }


        document
            .querySelectorAll(
                ".view-panel"
            )
            .forEach(
                function (panel) {

                    panel.classList.remove(
                        "active"
                    );

                }
            );


        document
            .querySelectorAll(
                ".menu-item"
            )
            .forEach(
                function (item) {

                    item.classList.remove(
                        "active"
                    );

                }
            );


        view.classList.add(
            "active"
        );


        const menu =
            document.getElementById(
                "menu-reports-parent"
            ) ||
            document.getElementById(
                "menu-mousumi-reports"
            );


        if (menu) {

            menu.classList.add(
                "active"
            );

        }


        const title =
            document.getElementById(
                "top-title"
            );


        if (title) {

            title.innerText =
                "Reports Center";

        }


        const content =
            document.getElementById(
                "mrc-main-content"
            );


        if (content) {

            content.innerHTML = `

                <div class="mrc-loading">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    Reports data loading...

                </div>

            `;

        }


        try {

            await loadReportData();


            renderHome();

        } catch (error) {

            console.error(
                error
            );


            if (content) {

                content.innerHTML = `

                    <div class="mrc-empty">

                        Reports data load করা যায়নি।

                        <br><br>

                        ${escapeHTML(
                            error.message
                        )}

                        <br><br>

                        <button
                            class="mrc-btn mrc-btn-primary"
                            onclick="MousumiReports.refresh()"
                        >

                            Retry

                        </button>

                    </div>

                `;

            }

        }

    }


    /* ============================================================
       OPEN INDIVIDUAL REPORT
       ============================================================ */

    async function openReport(
        reportType
    ) {

        const container =
            document.getElementById(
                "mrc-main-content"
            );


        if (!container) {

            return;

        }


        container.innerHTML = `

            <div class="mrc-loading">

                <i class="fa-solid fa-spinner fa-spin"></i>

                Report প্রস্তুত হচ্ছে...

            </div>

        `;


        try {

            await loadReportData();


            if (
                reportType ===
                "transactions"
            ) {

                renderTransactionReport();

            }

            else if (
                reportType ===
                "ledger"
            ) {

                renderLedgerReport();

            }

            else if (
                reportType ===
                "due"
            ) {

                renderDueReport();

            }

            else if (
                reportType ===
                "balance"
            ) {

                renderBalanceReport();

            }

            else if (
                reportType ===
                "cash"
            ) {

                renderCashReport();

            }

            else if (
                reportType ===
                "card"
            ) {

                renderCardReport();

            }

            else if (
                reportType ===
                "closing"
            ) {

                renderClosingReport();

            }

            else if (
                reportType ===
                "audit"
            ) {

                renderAuditReport();

            }

        } catch (error) {

            container.innerHTML = `

                <div class="mrc-empty">

                    Report তৈরি করা যায়নি।

                    <br><br>

                    ${escapeHTML(
                        error.message
                    )}

                </div>

            `;

        }

    }


    /* ============================================================
       BACK BUTTON
       ============================================================ */

    function backHome() {

        renderHome();

    }


    /* ============================================================
       DAILY TRANSACTION REPORT UI
       ============================================================ */

    function renderTransactionReport() {

        const defaults =
            setDefaultDates();


        const container =
            document.getElementById(
                "mrc-main-content"
            );


        container.innerHTML = `

            <button
                class="mrc-back"
                onclick="MousumiReports.back()"
            >

                ← Back to Reports

            </button>


            <div class="mrc-filter-card">

                <div class="mrc-title"
                     style="font-size:1.05rem; margin-bottom:15px;">

                    Daily Transaction Report

                </div>


                <div class="mrc-filter-grid">

                    <div class="mrc-field">

                        <label>
                            From Date
                        </label>

                        <input
                            type="date"
                            id="mrcTxFrom"
                            value="${defaults.from}"
                        />

                    </div>


                    <div class="mrc-field">

                        <label>
                            To Date
                        </label>

                        <input
                            type="date"
                            id="mrcTxTo"
                            value="${defaults.to}"
                        />

                    </div>

                </div>


                <div style="margin-top:14px;">

                    <button
                        class="mrc-btn mrc-btn-primary"
                        onclick="MousumiReports.generateTransactionReport()"
                    >

                        <i class="fa-solid fa-file-pdf"></i>

                        Generate PDF

                    </button>

                </div>

            </div>


            <div
                id="mrcTxResult"
                class="mrc-report-result"
            ></div>

        `;


        generateTransactionReport();

    }


    /* ============================================================
       DAILY TRANSACTION REPORT
       ============================================================ */

    function generateTransactionReport() {

        const from =
            document.getElementById(
                "mrcTxFrom"
            ).value;


        const to =
            document.getElementById(
                "mrcTxTo"
            ).value;


        let transactions =
            reportDataCache.transactions
                .filter(
                    function (transaction) {

                        if (
                            from &&
                            transaction.date <
                            from
                        ) {

                            return false;

                        }


                        if (
                            to &&
                            transaction.date >
                            to
                        ) {

                            return false;

                        }


                        return true;

                    }
                );


        transactions.sort(
            function (a, b) {

                return (
                    String(a.date)
                    +
                    " "
                    +
                    String(a.time)
                ).localeCompare(
                    String(b.date)
                    +
                    " "
                    +
                    String(b.time)
                );

            }
        );


        let totalDebit = 0;

        let totalCredit = 0;


        transactions.forEach(
            function (transaction) {

                totalDebit +=
                    Number(
                        transaction.debit
                    ) || 0;


                totalCredit +=
                    Number(
                        transaction.credit
                    ) || 0;

            }
        );


        const rows =
            transactions.map(
                function (
                    transaction,
                    index
                ) {

                    const customer =
                        getCustomer(
                            transaction.customerId
                        );


                    const amount =
                        Number(
                            transaction.debit
                        ) ||
                        Number(
                            transaction.credit
                        ) ||
                        0;


                    const type =
                        Number(
                            transaction.debit
                        ) > 0
                            ? "বাকী দিলাম"
                            : "বাকী পেলাম";


                    return `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${formatDate(
                                    transaction.date
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    transaction.time || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    customer
                                        ? customer.name
                                        : transaction.customerId
                                )}
                            </td>

                            <td>
                                ${type}
                            </td>

                            <td>
                                ${escapeHTML(
                                    transaction.description || ""
                                )}
                            </td>

                            <td style="text-align:right;">
                                ${moneyBD(amount)}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


        document.getElementById(
            "mrcTxResult"
        ).innerHTML = `

            <div class="mrc-summary-grid">

                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Total Transactions
                    </div>

                    <div class="mrc-summary-value">
                        ${transactions.length}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Total Due Added
                    </div>

                    <div class="mrc-summary-value">
                        ${moneyBD(totalDebit)}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Total Payment Received
                    </div>

                    <div class="mrc-summary-value">
                        ${moneyBD(totalCredit)}
                    </div>

                </div>

            </div>


            <div class="mrc-table-wrap">

                <table class="mrc-table">

                    <thead>

                        <tr>

                            <th>SL</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Customer</th>
                            <th>Transaction</th>
                            <th>Details</th>
                            <th>Amount</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            rows ||
                            `
                            <tr>
                                <td
                                    colspan="7"
                                    class="mrc-empty"
                                >
                                    No transactions found.
                                </td>
                            </tr>
                            `
                        }

                    </tbody>

                </table>

            </div>


            <div style="margin-top:14px;">

                <button
                    class="mrc-btn mrc-btn-success"
                    onclick="MousumiReports.printCurrentTransactionReport()"
                >

                    <i class="fa-solid fa-print"></i>

                    Print / Save PDF

                </button>

            </div>

        `;

    }


    /* ============================================================
       CUSTOMER LEDGER REPORT
       ============================================================ */

    function renderLedgerReport() {

        const customers =
            reportDataCache.customers
                .filter(
                    function (customer) {

                        return (
                            customer.status !==
                            "Disabled"
                        );

                    }
                );


        const options =
            customers.map(
                function (customer) {

                    return `

                        <option
                            value="${escapeHTML(
                                customer.customerId
                            )}"
                        >

                            ${escapeHTML(
                                customer.name
                            )}
                            -
                            ${escapeHTML(
                                customer.customerId
                            )}

                        </option>

                    `;

                }
            )
            .join("");


        const defaults =
            setDefaultDates();


        document.getElementById(
            "mrc-main-content"
        ).innerHTML = `

            <button
                class="mrc-back"
                onclick="MousumiReports.back()"
            >

                ← Back to Reports

            </button>


            <div class="mrc-filter-card">

                <div
                    class="mrc-title"
                    style="font-size:1.05rem; margin-bottom:15px;"
                >

                    Customer Ledger Report

                </div>


                <div class="mrc-filter-grid">

                    <div class="mrc-field">

                        <label>
                            Customer
                        </label>

                        <select
                            id="mrcLedgerCustomer"
                        >

                            <option value="">
                                Select Customer
                            </option>

                            ${options}

                        </select>

                    </div>


                    <div class="mrc-field">

                        <label>
                            From Date
                        </label>

                        <input
                            type="date"
                            id="mrcLedgerFrom"
                            value="${defaults.from}"
                        />

                    </div>


                    <div class="mrc-field">

                        <label>
                            To Date
                        </label>

                        <input
                            type="date"
                            id="mrcLedgerTo"
                            value="${defaults.to}"
                        />

                    </div>

                </div>


                <div style="margin-top:14px;">

                    <button
                        class="mrc-btn mrc-btn-primary"
                        onclick="MousumiReports.generateLedgerReport()"
                    >

                        <i class="fa-solid fa-file-pdf"></i>

                        Generate PDF

                    </button>

                </div>

            </div>


            <div
                id="mrcLedgerResult"
                class="mrc-report-result"
            ></div>

        `;

    }


    function generateLedgerReport() {

        const customerId =
            document.getElementById(
                "mrcLedgerCustomer"
            ).value;


        if (!customerId) {

            alert(
                "Please select a customer."
            );

            return;

        }


        const from =
            document.getElementById(
                "mrcLedgerFrom"
            ).value;


        const to =
            document.getElementById(
                "mrcLedgerTo"
            ).value;


        const customer =
            getCustomer(
                customerId
            );


        let transactions =
            reportDataCache.transactions
                .filter(
                    function (transaction) {

                        return String(
                            transaction.customerId
                        ) ===
                        String(
                            customerId
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return new Date(
                            a.createdAt
                        ) -
                        new Date(
                            b.createdAt
                        );

                    }
                );


        const currentDue =
            calculateCustomerDue(
                customerId
            );


        if (from) {

            transactions =
                transactions.filter(
                    function (transaction) {

                        return (
                            transaction.date >=
                            from
                        );

                    }
                );

        }


        if (to) {

            transactions =
                transactions.filter(
                    function (transaction) {

                        return (
                            transaction.date <=
                            to
                        );

                    }
                );

        }


        const rows =
            transactions.map(
                function (
                    transaction,
                    index
                ) {

                    return `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${formatDate(
                                    transaction.date
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    transaction.time || "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    transaction.description || ""
                                )}
                            </td>

                            <td style="text-align:right;">
                                ${moneyBD(
                                    transaction.debit
                                )}
                            </td>

                            <td style="text-align:right;">
                                ${moneyBD(
                                    transaction.credit
                                )}
                            </td>

                            <td style="text-align:right;">
                                ${moneyBD(
                                    transaction.runningBalance
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


        document.getElementById(
            "mrcLedgerResult"
        ).innerHTML = `

            <div class="mrc-summary-grid">

                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Customer
                    </div>

                    <div class="mrc-summary-value">
                        ${escapeHTML(
                            customer.name
                        )}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Current Due
                    </div>

                    <div class="mrc-summary-value">
                        ${moneyBD(
                            currentDue
                        )}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Transactions
                    </div>

                    <div class="mrc-summary-value">
                        ${transactions.length}
                    </div>

                </div>

            </div>


            <div class="mrc-table-wrap">

                <table class="mrc-table">

                    <thead>

                        <tr>

                            <th>SL</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Details</th>
                            <th>Debit</th>
                            <th>Credit</th>
                            <th>Running Balance</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            rows ||
                            `
                            <tr>
                                <td
                                    colspan="7"
                                    class="mrc-empty"
                                >
                                    No transactions found.
                                </td>
                            </tr>
                            `
                        }

                    </tbody>

                </table>

            </div>


            <div style="margin-top:14px;">

                <button
                    class="mrc-btn mrc-btn-success"
                    onclick="MousumiReports.printCurrentReport('Customer Ledger Report')"
                >

                    <i class="fa-solid fa-print"></i>

                    Print / Save PDF

                </button>

            </div>

        `;

    }


    /* ============================================================
       DUE REPORT
       ============================================================ */

    function renderDueReport() {

        const customers =
            reportDataCache.customers
                .filter(
                    function (customer) {

                        return (
                            customer.status ===
                            "Active"
                        );

                    }
                )
                .map(
                    function (customer) {

                        return {

                            ...customer,

                            currentDue:
                                calculateCustomerDue(
                                    customer.customerId
                                )

                        };

                    }
                )
                .filter(
                    function (customer) {

                        return (
                            customer.currentDue >
                            0
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            b.currentDue -
                            a.currentDue
                        );

                    }
                );


        const totalDue =
            customers.reduce(
                function (sum, customer) {

                    return (
                        sum +
                        customer.currentDue
                    );

                },
                0
            );


        const rows =
            customers.map(
                function (
                    customer,
                    index
                ) {

                    return `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHTML(
                                    customer.customerId
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    customer.name
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    customer.phone || "-"
                                )}
                            </td>

                            <td style="text-align:right;">
                                ${moneyBD(
                                    customer.currentDue
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


        document.getElementById(
            "mrc-main-content"
        ).innerHTML = `

            <button
                class="mrc-back"
                onclick="MousumiReports.back()"
            >

                ← Back to Reports

            </button>


            <div class="mrc-summary-grid">

                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Customers With Due
                    </div>

                    <div class="mrc-summary-value">
                        ${customers.length}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Total Outstanding
                    </div>

                    <div class="mrc-summary-value">
                        ${moneyBD(
                            totalDue
                        )}
                    </div>

                </div>

            </div>


            <div class="mrc-table-wrap">

                <table class="mrc-table">

                    <thead>

                        <tr>

                            <th>SL</th>
                            <th>Customer ID</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Outstanding Due</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            rows ||
                            `
                            <tr>
                                <td
                                    colspan="5"
                                    class="mrc-empty"
                                >
                                    No outstanding due found.
                                </td>
                            </tr>
                            `
                        }

                    </tbody>

                </table>

            </div>


            <div style="margin-top:14px;">

                <button
                    class="mrc-btn mrc-btn-success"
                    onclick="MousumiReports.printCurrentReport('Outstanding Due Report')"
                >

                    <i class="fa-solid fa-print"></i>

                    Print / Save PDF

                </button>

            </div>

        `;

    }


    /* ============================================================
       BALANCE REPORT
       ============================================================ */

    function renderBalanceReport() {

        const erp =
            reportDataCache.erp || {};


        const categories =
            toArray(
                erp.categories
            );


        const accounts =
            toArray(
                erp.accounts
            );


        const balances =
            erp.balances || {};


        let grandTotal = 0;


        const rows =
            categories
                .filter(
                    function (category) {

                        return (
                            category.enabled !==
                            false
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        return (
                            Number(a.order || 0) -
                            Number(b.order || 0)
                        );

                    }
                )
                .map(
                    function (category) {


                        const catAccounts =
                            accounts.filter(
                                function (account) {

                                    return (
                                        account.catId ===
                                        category.id &&
                                        account.enabled !==
                                        false
                                    );

                                }
                            );


                        const categoryTotal =
                            catAccounts.reduce(
                                function (
                                    sum,
                                    account
                                ) {

                                    return (
                                        sum +
                                        (
                                            Number(
                                                balances[
                                                    account.id
                                                ]
                                            ) || 0
                                        )
                                    );

                                },
                                0
                            );


                        grandTotal +=
                            categoryTotal;


                        return catAccounts.map(
                            function (
                                account
                            ) {

                                const amount =
                                    Number(
                                        balances[
                                            account.id
                                        ]
                                    ) || 0;


                                return `

                                    <tr>

                                        <td>
                                            ${escapeHTML(
                                                category.name
                                            )}
                                        </td>

                                        <td>
                                            ${escapeHTML(
                                                account.name
                                            )}
                                        </td>

                                        <td style="text-align:right;">
                                            ${moneyBD(
                                                amount
                                            )}
                                        </td>

                                    </tr>

                                `;

                            }
                        ).join("");

                    }
                )
                .join("");


        document.getElementById(
            "mrc-main-content"
        ).innerHTML = `

            <button
                class="mrc-back"
                onclick="MousumiReports.back()"
            >

                ← Back to Reports

            </button>


            <div class="mrc-summary-grid">

                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Total Accounts
                    </div>

                    <div class="mrc-summary-value">
                        ${accounts.length}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Total Balance
                    </div>

                    <div class="mrc-summary-value">
                        ${moneyBD(
                            grandTotal
                        )}
                    </div>

                </div>

            </div>


            <div class="mrc-table-wrap">

                <table class="mrc-table">

                    <thead>

                        <tr>

                            <th>Category</th>
                            <th>Account</th>
                            <th>Balance</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            rows ||
                            `
                            <tr>
                                <td
                                    colspan="3"
                                    class="mrc-empty"
                                >
                                    No account data found.
                                </td>
                            </tr>
                            `
                        }

                    </tbody>


                    <tfoot>

                        <tr>

                            <th
                                colspan="2"
                                style="text-align:right;"
                            >

                                Grand Total

                            </th>

                            <th style="text-align:right;">

                                ${moneyBD(
                                    grandTotal
                                )}

                            </th>

                        </tr>

                    </tfoot>

                </table>

            </div>


            <div style="margin-top:14px;">

                <button
                    class="mrc-btn mrc-btn-success"
                    onclick="MousumiReports.printCurrentReport('Balance Summary Report')"
                >

                    <i class="fa-solid fa-print"></i>

                    Print / Save PDF

                </button>

            </div>

        `;

    }


    /* ============================================================
       CASH REPORT
       ============================================================ */

    function renderCashReport() {

        const erp =
            reportDataCache.erp || {};


        const cash =
            erp.cashInventory || {};


        const quantities =
            cash.quantities || {};


        const denominations = [

            1000,
            500,
            200,
            100,
            50,
            20,
            10,
            5,
            2,
            1

        ];


        let calculatedTotal = 0;


        const rows =
            denominations.map(
                function (denomination) {

                    const quantity =
                        Number(
                            quantities[
                                denomination
                            ]
                        ) || 0;


                    const value =
                        denomination *
                        quantity;


                    calculatedTotal +=
                        value;


                    return `

                        <tr>

                            <td>
                                ৳ ${denomination}
                            </td>

                            <td>
                                ${quantity}
                            </td>

                            <td style="text-align:right;">
                                ${moneyBD(
                                    value
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


        const others =
            Number(
                cash.others
            ) || 0;


        const storedGrandTotal =
            Number(
                cash.grandTotal
            ) || calculatedTotal + others;


        document.getElementById(
            "mrc-main-content"
        ).innerHTML = `

            <button
                class="mrc-back"
                onclick="MousumiReports.back()"
            >

                ← Back to Reports

            </button>


            <div class="mrc-summary-grid">

                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Denomination Total
                    </div>

                    <div class="mrc-summary-value">
                        ${moneyBD(
                            calculatedTotal
                        )}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Others
                    </div>

                    <div class="mrc-summary-value">
                        ${moneyBD(
                            others
                        )}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Grand Total Cash
                    </div>

                    <div class="mrc-summary-value">
                        ${moneyBD(
                            storedGrandTotal
                        )}
                    </div>

                </div>

            </div>


            <div class="mrc-table-wrap">

                <table class="mrc-table">

                    <thead>

                        <tr>

                            <th>Denomination</th>
                            <th>Quantity</th>
                            <th>Total Value</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>


                    <tfoot>

                        <tr>

                            <th
                                colspan="2"
                                style="text-align:right;"
                            >

                                Grand Total

                            </th>

                            <th style="text-align:right;">

                                ${moneyBD(
                                    storedGrandTotal
                                )}

                            </th>

                        </tr>

                    </tfoot>

                </table>

            </div>


            <div style="margin-top:14px;">

                <button
                    class="mrc-btn mrc-btn-success"
                    onclick="MousumiReports.printCurrentReport('Cash Inventory Report')"
                >

                    <i class="fa-solid fa-print"></i>

                    Print / Save PDF

                </button>

            </div>

        `;

    }


    /* ============================================================
       CARD REPORT
       ============================================================ */

    function renderCardReport() {

        const erp =
            reportDataCache.erp || {};


        const cardConfig =
            erp.cardConfig || {};


        const cardInventory =
            erp.cardInventory || {};


        const operators = [

            "GP",
            "Banglalink",
            "Robi",
            "Airtel"

        ];


        let grandTotal =
            0;


        const rows =
            operators.map(
                function (operator) {

                    const cards =
                        toArray(
                            cardConfig[
                                operator
                            ]
                        );


                    const quantities =
                        cardInventory[
                            operator
                        ] || {};


                    let operatorTotal =
                        0;


                    let cardCount =
                        0;


                    cards.forEach(
                        function (card) {

                            const quantity =
                                Number(
                                    quantities[
                                        card.id
                                    ]
                                ) || 0;


                            cardCount +=
                                quantity;


                            operatorTotal +=
                                quantity *
                                (
                                    Number(
                                        card.price
                                    ) || 0
                                );

                        }
                    );


                    grandTotal +=
                        operatorTotal;


                    return `

                        <tr>

                            <td>
                                ${escapeHTML(
                                    operator
                                )}
                            </td>

                            <td>
                                ${cardCount}
                            </td>

                            <td style="text-align:right;">
                                ${moneyBD(
                                    operatorTotal
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


        document.getElementById(
            "mrc-main-content"
        ).innerHTML = `

            <button
                class="mrc-back"
                onclick="MousumiReports.back()"
            >

                ← Back to Reports

            </button>


            <div class="mrc-summary-grid">

                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Operators
                    </div>

                    <div class="mrc-summary-value">
                        ${operators.length}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Total Inventory Value
                    </div>

                    <div class="mrc-summary-value">
                        ${moneyBD(
                            grandTotal
                        )}
                    </div>

                </div>

            </div>


            <div class="mrc-table-wrap">

                <table class="mrc-table">

                    <thead>

                        <tr>

                            <th>Operator</th>
                            <th>Total Cards</th>
                            <th>Total Value</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${rows}

                    </tbody>


                    <tfoot>

                        <tr>

                            <th
                                colspan="2"
                                style="text-align:right;"
                            >

                                Grand Total

                            </th>

                            <th style="text-align:right;">

                                ${moneyBD(
                                    grandTotal
                                )}

                            </th>

                        </tr>

                    </tfoot>

                </table>

            </div>


            <div style="margin-top:14px;">

                <button
                    class="mrc-btn mrc-btn-success"
                    onclick="MousumiReports.printCurrentReport('Card Inventory Report')"
                >

                    <i class="fa-solid fa-print"></i>

                    Print / Save PDF

                </button>

            </div>

        `;

    }


    /* ============================================================
       DAILY CLOSING REPORT
       ============================================================ */

    function renderClosingReport() {

        const erp =
            reportDataCache.erp || {};


        const reports =
            toArray(
                erp.dailyClosingReports
            );


        const sorted =
            reports.sort(
                function (a, b) {

                    return String(
                        b.closingDate ||
                        b.reportDate ||
                        ""
                    ).localeCompare(
                        String(
                            a.closingDate ||
                            a.reportDate ||
                            ""
                        )
                    );

                }
            );


        const rows =
            sorted.map(
                function (
                    report,
                    index
                ) {

                    return `

                        <tr>

                            <td>
                                ${index + 1}
                            </td>

                            <td>
                                ${escapeHTML(
                                    report.closingDate ||
                                    report.reportDate ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${escapeHTML(
                                    report.closingTime ||
                                    "-"
                                )}
                            </td>

                            <td>
                                ${moneyBD(
                                    report.openingCapital ||
                                    report.openingBalance ||
                                    0
                                )}
                            </td>

                            <td>
                                ${moneyBD(
                                    report.closingCapital ||
                                    report.netBalance ||
                                    0
                                )}
                            </td>

                            <td>
                                ${moneyBD(
                                    report.netIncome ||
                                    report.netProfit ||
                                    0
                                )}
                            </td>

                        </tr>

                    `;

                }
            )
            .join("");


        document.getElementById(
            "mrc-main-content"
        ).innerHTML = `

            <button
                class="mrc-back"
                onclick="MousumiReports.back()"
            >

                ← Back to Reports

            </button>


            <div class="mrc-summary-grid">

                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Saved Closing Reports
                    </div>

                    <div class="mrc-summary-value">
                        ${reports.length}
                    </div>

                </div>

            </div>


            <div class="mrc-table-wrap">

                <table class="mrc-table">

                    <thead>

                        <tr>

                            <th>SL</th>
                            <th>Closing Date</th>
                            <th>Closing Time</th>
                            <th>Opening</th>
                            <th>Closing</th>
                            <th>Net Income</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            rows ||
                            `
                            <tr>
                                <td
                                    colspan="6"
                                    class="mrc-empty"
                                >
                                    No Daily Closing reports found.
                                </td>
                            </tr>
                            `
                        }

                    </tbody>

                </table>

            </div>


            <div style="margin-top:14px;">

                <button
                    class="mrc-btn mrc-btn-success"
                    onclick="MousumiReports.printCurrentReport('Daily Closing Report')"
                >

                    <i class="fa-solid fa-print"></i>

                    Print / Save PDF

                </button>

            </div>

        `;

    }


    /* ============================================================
       AUDIT REPORT
       ============================================================ */

    function renderAuditReport() {

        const erp =
            reportDataCache.erp || {};


        const history =
            toArray(
                erp.fintechHistory
            );


        const cashHistory =
            toArray(
                erp.cashHistory
            );


        const cardHistory =
            toArray(
                erp.cardHistory
            );


        document.getElementById(
            "mrc-main-content"
        ).innerHTML = `

            <button
                class="mrc-back"
                onclick="MousumiReports.back()"
            >

                ← Back to Reports

            </button>


            <div class="mrc-summary-grid">

                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Account History
                    </div>

                    <div class="mrc-summary-value">
                        ${history.length}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Cash History
                    </div>

                    <div class="mrc-summary-value">
                        ${cashHistory.length}
                    </div>

                </div>


                <div class="mrc-summary">

                    <div class="mrc-summary-label">
                        Card History
                    </div>

                    <div class="mrc-summary-value">
                        ${cardHistory.length}
                    </div>

                </div>

            </div>


            <div class="mrc-table-wrap">

                <table class="mrc-table">

                    <thead>

                        <tr>

                            <th>Type</th>
                            <th>Date / Time</th>
                            <th>Details</th>

                        </tr>

                    </thead>


                    <tbody>

                        ${history
                            .slice(
                                0,
                                100
                            )
                            .map(
                                function (item) {

                                    return `

                                        <tr>

                                            <td>
                                                Account
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    item.timestamp ||
                                                    item.date ||
                                                    "-"
                                                )}
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    item.accountName ||
                                                    item.categoryName ||
                                                    item.message ||
                                                    "Account balance history"
                                                )}
                                            </td>

                                        </tr>

                                    `;

                                }
                            )
                            .join("")}


                        ${cashHistory
                            .slice(
                                0,
                                100
                            )
                            .map(
                                function (item) {

                                    return `

                                        <tr>

                                            <td>
                                                Cash
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    item.timestamp ||
                                                    item.date ||
                                                    "-"
                                                )}
                                            </td>

                                            <td>
                                                Cash Inventory:
                                                ${moneyBD(
                                                    item.grandTotal ||
                                                    item.total ||
                                                    0
                                                )}
                                            </td>

                                        </tr>

                                    `;

                                }
                            )
                            .join("")}


                        ${cardHistory
                            .slice(
                                0,
                                100
                            )
                            .map(
                                function (item) {

                                    return `

                                        <tr>

                                            <td>
                                                Card
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    item.timestamp ||
                                                    item.date ||
                                                    "-"
                                                )}
                                            </td>

                                            <td>
                                                Operator:
                                                ${escapeHTML(
                                                    item.operator ||
                                                    "-"
                                                )}
                                                -
                                                ${moneyBD(
                                                    item.grandTotalValue ||
                                                    0
                                                )}
                                            </td>

                                        </tr>

                                    `;

                                }
                            )
                            .join("")}


                    </tbody>

                </table>

            </div>


            <div style="margin-top:14px;">

                <button
                    class="mrc-btn mrc-btn-success"
                    onclick="MousumiReports.printCurrentReport('Audit and History Report')"
                >

                    <i class="fa-solid fa-print"></i>

                    Print / Save PDF

                </button>

            </div>

        `;

    }


    /* ============================================================
       PRINT CURRENT REPORT
       ============================================================ */

    function printCurrentReport(
        reportTitle
    ) {

        const view =
            document.getElementById(
                "reports-center-view"
            );


        if (!view) {

            return;

        }


        const content =
            document.getElementById(
                "mrc-main-content"
            );


        if (!content) {

            return;

        }


        const printWindow =
            window.open(
                "",
                "_blank",
                "width=1000,height=900"
            );


        if (!printWindow) {

            alert(
                "Popup blocked. Please allow popups for this site."
            );

            return;

        }


        printWindow.document.open();


        printWindow.document.write(`

<!DOCTYPE html>

<html lang="en">

<head>

<meta charset="UTF-8">


<title>
    ${escapeHTML(
        reportTitle
    )}
</title>


<style>

@page {

    size: A4 portrait;

    margin:
        12mm;

}


* {

    box-sizing: border-box;

}


body {

    margin: 0;

    color: #000;

    background: #fff;

    font-family:
        Arial,
        "Noto Sans Bengali",
        "Nirmala UI",
        sans-serif;

    font-size: 11px;

}


.header {

    text-align: center;

    margin-bottom: 18px;

}


.shop {

    font-size: 22px;

    font-weight: 800;

}


.title {

    font-size: 16px;

    font-weight: 700;

    margin-top: 4px;

}


table {

    width: 100%;

    border-collapse: collapse;

}


th,
td {

    border:
        0.5px solid #000;

    padding:
        6px;

    vertical-align: middle;

}


th {

    background: #f5f5f5;

    font-weight: 700;

}


tfoot th {

    background: #fff;

}


.summary {

    display: flex;

    gap: 10px;

    margin-bottom: 15px;

}


.summary-box {

    flex: 1;

    border:
        0.5px solid #000;

    padding: 8px;

}


.small {

    font-size: 9px;

    color: #555;

}


@media print {

    table {

        page-break-inside: auto;

    }


    tr {

        page-break-inside: avoid;

    }


    thead {

        display: table-header-group;

    }

}

</style>

</head>


<body>


<div class="header">

    <div class="shop">
        ${REPORTS_CONFIG.shopName}
    </div>

    <div class="title">
        ${escapeHTML(
            reportTitle
        )}
    </div>

    <div class="small">
        Generated:
        ${new Date().toLocaleString()}
    </div>

</div>


${content.innerHTML}


<script>

window.onload = function () {

    setTimeout(
        function () {

            window.print();

        },
        350
    );

};

window.onafterprint = function () {

    setTimeout(
        function () {

            window.close();

        },
        300
    );

};

<\/script>


</body>

</html>

        `);


        printWindow.document.close();

    }


    /* ============================================================
       SPECIAL TRANSACTION PRINT
       ============================================================ */

    function printCurrentTransactionReport() {

        printCurrentReport(
            "Daily Transaction Report"
        );

    }


    /* ============================================================
       PUBLIC API
       ============================================================ */

    window.MousumiReports = {

        open:
            openReport,

        back:
            backHome,

        refresh:
            openReportsCenter,

        generateTransactionReport:
            generateTransactionReport,

        generateLedgerReport:
            generateLedgerReport,

        printCurrentReport:
            printCurrentReport,

        printCurrentTransactionReport:
            printCurrentTransactionReport

    };


    /* ============================================================
       INITIALIZATION
       ============================================================ */

    async function initializeModule() {

        injectReportCSS();


        /*
         * Wait until the ERP DOM is available.
         */

        let attempts = 0;


        const timer =
            setInterval(
                function () {

                    attempts++;


                    const sidebar =
                        document.getElementById(
                            "sidebar"
                        );


                    const mainWrapper =
                        document.querySelector(
                            ".main-wrapper"
                        );


                    if (
                        sidebar &&
                        mainWrapper
                    ) {

                        clearInterval(
                            timer
                        );


                        installSidebarModule();

                        createReportCenterView();

                        openReportsCenter();

                    }


                    if (
                        attempts >
                        100
                    ) {

                        clearInterval(
                            timer
                        );

                        console.error(
                            "Mousumi Reports Center: ERP DOM not found."
                        );

                    }

                },
                100
            );

    }


    /*
     * Start after DOM ready.
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeModule
        );

    } else {

        initializeModule();

    }


})();
