import {
    initializeApp,
    getApps
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    get
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";


/*
==========================================================
 MOUSUMI COMPUTER
 STANDALONE REPORTS MODULE
==========================================================

 এই ফাইলটি admin.html পরিবর্তন করে না।

 এটি সরাসরি Firebase থেকে ERP-এর প্রয়োজনীয় ডাটা
 Read করে রিপোর্ট তৈরি করে।

==========================================================
*/


/* ========================================================
   FIREBASE CONFIGURATION
======================================================== */

const firebaseConfig = {
    apiKey: "AIzaSyA1PhRiTkICNCd8sA4he3ZxKjHtIzM0d5E",
    authDomain: "mousumi-computer.firebaseapp.com",
    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
    projectId: "mousumi-computer",
    storageBucket: "mousumi-computer.firebasestorage.app",
    messagingSenderId: "104820462623",
    appId: "1:104820462623:web:e3abae9533cc841463712a",
    measurementId: "G-EPYJ70W97Z"
};


const app =
    getApps().length
        ? getApps()[0]
        : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getDatabase(app);


/* ========================================================
   GLOBAL DATA
======================================================== */

let customers = [];
let customerTransactions = [];

let categories = [];
let accounts = [];

let balanceStore = {};
let historyLogs = [];

let cashHistoryLogs = [];
let cardHistoryLogs = [];

let dailyClosingReports = [];

let cashInventory = {};
let cardInventory = {};
let cardConfig = {};

let currentRows = [];
let currentReportTitle = "";


/* ========================================================
   HELPER
======================================================== */

const $ = (id) => document.getElementById(id);


function arr(value) {

    if (!value) return [];

    return Array.isArray(value)
        ? value
        : Object.values(value);

}


function num(value) {

    const n = Number(value);

    return Number.isFinite(n) ? n : 0;

}


function money(value) {

    const n = num(value);

    return "৳ " + n.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

}


function localDate(date) {

    const y = date.getFullYear();

    const m = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const d = String(
        date.getDate()
    ).padStart(2, "0");

    return `${y}-${m}-${d}`;

}


function todayStr() {

    return localDate(new Date());

}


function normalizeDate(value) {

    if (!value) return "";

    const str = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {

        return str;

    }

    const date = new Date(str);

    if (Number.isNaN(date.getTime())) {

        return "";

    }

    return localDate(date);

}


function formatDate(value) {

    if (!value) return "-";

    const normalized = normalizeDate(value);

    if (!normalized) return String(value);

    const parts = normalized.split("-");

    if (parts.length !== 3) {

        return normalized;

    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;

}


function bn(value) {

    return String(value ?? "")
        .replace(
            /\d/g,
            digit => "০১২৩৪৫৬৭৮৯"[digit]
        );

}


function esc(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function stripHtml(value) {

    const div = document.createElement("div");

    div.innerHTML = String(value ?? "");

    return div.textContent || div.innerText || "";

}


/* ========================================================
   DATE RANGE
======================================================== */

function getDateRange() {

    return {

        from: $("fromDate")?.value || "",

        to: $("toDate")?.value || ""

    };

}


function inRange(date, from, to) {

    const d = normalizeDate(date);

    if (!d) return true;

    if (from && d < from) return false;

    if (to && d > to) return false;

    return true;

}


/* ========================================================
   LOADING
======================================================== */

function setLoading(show, text = "লোড হচ্ছে...") {

    const loading = $("loading");

    if (!loading) return;

    const loadingText = $("loadingText");

    if (loadingText) {

        loadingText.textContent = text;

    }

    loading.classList.toggle("show", show);

}


/* ========================================================
   CUSTOMER DUE
======================================================== */

function customerDue(customerId) {

    const customer =
        customers.find(
            c => c.id === customerId
        );

    if (!customer) return 0;


    let due =
        num(customer.openingBalance);


    customerTransactions

        .filter(
            transaction =>
                transaction.customerId === customerId
        )

        .forEach(transaction => {

            due += num(transaction.debit);

            due -= num(transaction.credit);

        });


    return due;

}


function totalDueData() {

    return customers.map(customer => ({

        ...customer,

        due: customerDue(customer.id)

    }));

}


/* ========================================================
   LOAD FIREBASE DATA
======================================================== */

async function loadData() {

    setLoading(
        true,
        "Firebase data synchronizing..."
    );


    try {

        const [
            erpSnap,
            customerSnap,
            transactionSnap
        ] = await Promise.all([

            get(
                ref(db, "erp")
            ),

            get(
                ref(db, "customers")
            ),

            get(
                ref(db, "transactions")
            )

        ]);


        const erp =
            erpSnap.exists()
                ? (erpSnap.val() || {})
                : {};


        customers =
            customerSnap.exists()
                ? arr(customerSnap.val())
                : [];


        customerTransactions =
            transactionSnap.exists()
                ? arr(transactionSnap.val())
                : [];


        categories =
            arr(erp.categories);


        accounts =
            arr(erp.accounts);


        balanceStore =
            erp.balances || {};


        historyLogs =
            arr(erp.fintechHistory);


        cashHistoryLogs =
            arr(erp.cashHistory);


        cardHistoryLogs =
            arr(erp.cardHistory);


        dailyClosingReports =
            arr(erp.dailyClosingReports);


        cashInventory =
            erp.cashInventory || {};


        cardInventory =
            erp.cardInventory || {};


        cardConfig =
            erp.cardConfig || {};


        populateSelects();

        updateDynamicFields();

        setLoading(false);


    } catch (error) {

        console.error(
            "Firebase Load Error:",
            error
        );

        setLoading(false);

        alert(
            "Firebase data load failed:\n" +
            error.message
        );

    }

}


/* ========================================================
   POPULATE DROPDOWNS
======================================================== */

function populateSelects() {


    /* CUSTOMER */

    const customerSelect =
        $("customerSelect");


    if (customerSelect) {

        customerSelect.innerHTML =
            `<option value="">সব Customer</option>`;


        customers

            .slice()

            .sort(
                (a, b) =>
                    String(a.name || "")
                        .localeCompare(
                            String(b.name || "")
                        )
            )

            .forEach(customer => {

                const option =
                    document.createElement("option");


                option.value =
                    customer.id;


                option.textContent =
                    `${customer.name || "Unnamed"}${
                        customer.phone
                            ? " (" + customer.phone + ")"
                            : ""
                    }`;


                customerSelect.appendChild(
                    option
                );

            });

    }


    /* CATEGORY */

    const categorySelect =
        $("categorySelect");


    if (categorySelect) {

        categorySelect.innerHTML =
            `<option value="">সব Category</option>`;


        categories

            .slice()

            .sort(
                (a, b) =>
                    num(a.order) -
                    num(b.order)
            )

            .forEach(category => {

                const option =
                    document.createElement("option");


                option.value =
                    category.id;


                option.textContent =
                    category.name ||
                    category.id;


                categorySelect.appendChild(
                    option
                );

            });

    }


    /* ACCOUNT */

    const accountSelect =
        $("accountSelect");


    if (accountSelect) {

        accountSelect.innerHTML =
            `<option value="">সব Account</option>`;


        accounts

            .slice()

            .sort(
                (a, b) =>
                    String(a.name || "")
                        .localeCompare(
                            String(b.name || "")
                        )
            )

            .forEach(account => {

                const option =
                    document.createElement("option");


                option.value =
                    account.id;


                option.textContent =
                    account.name ||
                    account.id;


                accountSelect.appendChild(
                    option
                );

            });

    }

}


/* ========================================================
   DYNAMIC FILTERS
======================================================== */

function updateDynamicFields() {

    const type =
        $("reportType")?.value;


    if (!type) return;


    const customerField =
        $("customerField");


    const categoryField =
        $("categoryField");


    const accountField =
        $("accountField");


    const statusField =
        $("statusField");


    const fromField =
        $("fromField");


    const toField =
        $("toField");


    if (customerField) {

        customerField.style.display =
            [
                "customer_statement",
                "daily_transactions"
            ].includes(type)
                ? ""
                : "none";

    }


    if (categoryField) {

        categoryField.style.display =
            [
                "account_balance",
                "balance_history"
            ].includes(type)
                ? ""
                : "none";

    }


    if (accountField) {

        accountField.style.display =
            [
                "account_balance",
                "balance_history"
            ].includes(type)
                ? ""
                : "none";

    }


    if (statusField) {

        statusField.style.display =
            type === "customer_due"
                ? ""
                : "none";

    }


    const dateNeeded =
        ![
            "customer_list",
            "account_balance"
        ].includes(type);


    if (fromField) {

        fromField.style.display =
            dateNeeded ? "" : "none";

    }


    if (toField) {

        toField.style.display =
            dateNeeded ? "" : "none";

    }

}


/* ========================================================
   QUICK DATE RANGE
======================================================== */

function setRange(type) {

    const now =
        new Date();


    let from = "";

    let to =
        localDate(now);


    if (type === "today") {

        from = to =
            localDate(now);

    }


    else if (type === "yesterday") {

        const date =
            new Date(now);


        date.setDate(
            date.getDate() - 1
        );


        from = to =
            localDate(date);

    }


    else if (type === "week") {

        const date =
            new Date(now);


        const day =
            date.getDay();


        const diff =
            day === 0
                ? 6
                : day - 1;


        date.setDate(
            date.getDate() - diff
        );


        from =
            localDate(date);

    }


    else if (type === "month") {

        from =
            localDate(
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                )
            );

    }


    else if (type === "last_month") {

        from =
            localDate(
                new Date(
                    now.getFullYear(),
                    now.getMonth() - 1,
                    1
                )
            );


        to =
            localDate(
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    0
                )
            );

    }


    else if (type === "all") {

        from = "";

        to = "";

    }


    if ($("fromDate")) {

        $("fromDate").value =
            from;

    }


    if ($("toDate")) {

        $("toDate").value =
            to;

    }

}


/* ========================================================
   REPORT HEADER
======================================================== */

function header(
    title,
    subtitle = ""
) {

    currentReportTitle =
        title;


    const {
        from,
        to
    } =
        getDateRange();


    return `

        <div class="report-header">

            <h1>
                Mousumi Computer
            </h1>

            <h2>
                ${esc(title)}
            </h2>

            <p>
                ${esc(
                    subtitle ||
                    "Accounting ERP Report"
                )}
            </p>

            <p>
                সময়কাল:
                ${
                    from
                        ? formatDate(from)
                        : "শুরু থেকে"
                }

                —

                ${
                    to
                        ? formatDate(to)
                        : "বর্তমান"
                }

                |

                Generated:
                ${new Date().toLocaleString("bn-BD")}

            </p>

        </div>

    `;

}


/* ========================================================
   SUMMARY BOXES
======================================================== */

function summary(items) {

    return `

        <div class="report-summary">

            ${items.map(item => `

                <div class="summary-box">

                    <div class="label">

                        ${esc(item.label)}

                    </div>

                    <div class="value">

                        ${esc(item.value)}

                    </div>

                </div>

            `).join("")}

        </div>

    `;

}


/* ========================================================
   TABLE
======================================================== */

function table(
    headers,
    rows
) {

    if (!rows.length) {

        return `

            <div class="empty">

                <i class="fa-solid fa-folder-open"></i>

                <div>
                    এই Filter অনুযায়ী
                    কোনো রেকর্ড পাওয়া যায়নি।
                </div>

            </div>

        `;

    }


    return `

        <table class="report-table">

            <thead>

                <tr>

                    ${headers.map(header => `

                        <th
                            class="${
                                header.num
                                    ? "num"
                                    : ""
                            }"
                        >

                            ${esc(header.label)}

                        </th>

                    `).join("")}

                </tr>

            </thead>


            <tbody>

                ${rows.map(row => `

                    <tr>

                        ${row.map(
                            (value, index) => `

                            <td
                                class="${
                                    headers[index]?.num
                                        ? "num"
                                        : ""
                                }"
                            >

                                ${value}

                            </td>

                        `).join("")}

                    </tr>

                `).join("")}

            </tbody>

        </table>

    `;

}


/* ========================================================
   RENDER REPORT
======================================================== */

function renderReport(
    html,
    count
) {

    $("reportArea").innerHTML = `

        <div class="report-paper">

            ${html}

            <div class="report-footer">

                This is a computer-generated
                statement from
                Mousumi Computer Accounting ERP.

            </div>

        </div>

    `;


    $("recordCount").textContent =
        `${count} records`;

}


/* ========================================================
   REPORT 1
   CUSTOMER STATEMENT
======================================================== */

function buildCustomerStatement() {

    const {
        from,
        to
    } =
        getDateRange();


    const customerId =
        $("customerSelect")?.value || "";


    const list =
        customerId
            ? customers.filter(
                c => c.id === customerId
            )
            : customers;


    const rows = [];


    let totalDebit = 0;

    let totalCredit = 0;


    list.forEach(customer => {

        const transactions =
            customerTransactions

                .filter(
                    transaction =>

                        transaction.customerId ===
                            customer.id &&

                        inRange(
                            transaction.date,
                            from,
                            to
                        )
                )

                .sort(
                    (a, b) =>
                        (
                            String(a.date) +
                            String(a.time || "")
                        ).localeCompare(
                            String(b.date) +
                            String(b.time || "")
                        )
                );


        let opening =
            num(customer.openingBalance);


        if (from) {

            customerTransactions

                .filter(
                    transaction =>
                        transaction.customerId ===
                            customer.id &&

                        normalizeDate(
                            transaction.date
                        ) < from
                )

                .forEach(transaction => {

                    opening +=
                        num(transaction.debit);

                    opening -=
                        num(transaction.credit);

                });

        }


        let running =
            opening;


        transactions.forEach(
            transaction => {

                const debit =
                    num(transaction.debit);


                const credit =
                    num(transaction.credit);


                running +=
                    debit - credit;


                totalDebit +=
                    debit;


                totalCredit +=
                    credit;


                rows.push([

                    formatDate(
                        transaction.date
                    ),

                    esc(
                        customer.name
                    ),

                    esc(
                        transaction.time || "-"
                    ),

                    esc(
                        transaction.description ||
                        "-"
                    ),

                    debit
                        ? money(debit)
                        : "-",

                    credit
                        ? money(credit)
                        : "-",

                    money(running)

                ]);

            }
        );


        if (
            !transactions.length &&
            customerId
        ) {

            rows.push([

                "-",

                esc(
                    customer.name
                ),

                "-",

                "কোনো লেনদেন নেই",

                "-",

                "-",

                money(opening)

            ]);

        }

    });


    renderReport(

        header(
            "Customer Transaction / Statement",
            "Customer ledger with Debit, Credit and Running Balance"
        )

        +

        summary([

            {
                label:
                    "Customers",

                value:
                    list.length
            },

            {
                label:
                    "Total Debit",

                value:
                    money(totalDebit)
            },

            {
                label:
                    "Total Credit",

                value:
                    money(totalCredit)
            },

            {
                label:
                    "Net Movement",

                value:
                    money(
                        totalDebit -
                        totalCredit
                    )
            }

        ])

        +

        table(

            [

                {
                    label:
                        "তারিখ"
                },

                {
                    label:
                        "Customer"
                },

                {
                    label:
                        "সময়"
                },

                {
                    label:
                        "বিবরণ"
                },

                {
                    label:
                        "দিলাম",
                    num:true
                },

                {
                    label:
                        "পেলাম",
                    num:true
                },

                {
                    label:
                        "Balance",
                    num:true
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   REPORT 2
   CUSTOMER DUE
======================================================== */

function buildCustomerDue() {

    const status =
        $("statusSelect")?.value ||
        "all";


    let list =
        totalDueData();


    if (status === "due") {

        list =
            list.filter(
                customer =>
                    customer.due > 0
            );

    }


    if (status === "advance") {

        list =
            list.filter(
                customer =>
                    customer.due < 0
            );

    }


    if (status === "paid") {

        list =
            list.filter(
                customer =>
                    Math.abs(
                        customer.due
                    ) < 0.005
            );

    }


    list.sort(
        (a,b) =>
            b.due -
            a.due
    );


    const receivable =
        list

            .filter(
                c => c.due > 0
            )

            .reduce(
                (sum,c) =>
                    sum + c.due,
                0
            );


    const advance =
        list

            .filter(
                c => c.due < 0
            )

            .reduce(
                (sum,c) =>
                    sum +
                    Math.abs(c.due),
                0
            );


    const rows =
        list.map(
            (customer,index) => [

                bn(index + 1),

                esc(
                    customer.id
                ),

                esc(
                    customer.name ||
                    "-"
                ),

                esc(
                    customer.phone ||
                    "-"
                ),

                customer.due > 0

                    ? `<span class="status status-due">পাওনা</span>`

                    : customer.due < 0

                        ? `<span class="status status-advance">Advance/দেনা</span>`

                        : `<span class="status status-paid">Paid</span>`,

                money(
                    Math.abs(
                        customer.due
                    )
                )

            ]
        );


    renderReport(

        header(
            "Customer Due Summary",
            "Current customer receivable / advance position"
        )

        +

        summary([

            {
                label:
                    "Total Customers",

                value:
                    customers.length
            },

            {
                label:
                    "Customers Shown",

                value:
                    list.length
            },

            {
                label:
                    "Total Receivable",

                value:
                    money(receivable)
            },

            {
                label:
                    "Total Advance / Payable",

                value:
                    money(advance)
            }

        ])

        +

        table(

            [

                {
                    label:
                        "ক্রম"
                },

                {
                    label:
                        "Customer ID"
                },

                {
                    label:
                        "Customer Name"
                },

                {
                    label:
                        "Phone"
                },

                {
                    label:
                        "Status"
                },

                {
                    label:
                        "Amount",
                    num:true
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   REPORT 3
   CUSTOMER LIST
======================================================== */

function buildCustomerList() {

    const list =
        customers

            .slice()

            .sort(
                (a,b) =>
                    String(
                        a.name || ""
                    ).localeCompare(
                        String(
                            b.name || ""
                        )
                    )
            );


    const dueData =
        totalDueData();


    const totalReceivable =
        dueData

            .filter(
                c => c.due > 0
            )

            .reduce(
                (sum,c) =>
                    sum + c.due,
                0
            );


    const totalAdvance =
        dueData

            .filter(
                c => c.due < 0
            )

            .reduce(
                (sum,c) =>
                    sum +
                    Math.abs(c.due),
                0
            );


    const rows =
        list.map(
            (customer,index) => [

                bn(index + 1),

                esc(
                    customer.id
                ),

                esc(
                    customer.name ||
                    "-"
                ),

                esc(
                    customer.phone ||
                    "-"
                ),

                esc(
                    customer.area ||
                    customer.address ||
                    "-"
                ),

                esc(
                    customer.type ||
                    "-"
                ),

                esc(
                    customer.status ||
                    "Active"
                ),

                money(
                    customerDue(
                        customer.id
                    )
                )

            ]
        );


    renderReport(

        header(
            "Customer List",
            "Complete customer directory"
        )

        +

        summary([

            {
                label:
                    "Total Customers",

                value:
                    customers.length
            },

            {
                label:
                    "Active",

                value:
                    customers.filter(
                        customer =>
                            String(
                                customer.status ||
                                "Active"
                            ).toLowerCase()
                            === "active"
                    ).length
            },

            {
                label:
                    "Total Receivable",

                value:
                    money(
                        totalReceivable
                    )
            },

            {
                label:
                    "Total Advance",

                value:
                    money(
                        totalAdvance
                    )
            }

        ])

        +

        table(

            [

                {
                    label:
                        "ক্রম"
                },

                {
                    label:
                        "ID"
                },

                {
                    label:
                        "নাম"
                },

                {
                    label:
                        "Phone"
                },

                {
                    label:
                        "Area / Address"
                },

                {
                    label:
                        "Type"
                },

                {
                    label:
                        "Status"
                },

                {
                    label:
                        "Current Due",
                    num:true
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   REPORT 4
   DAILY CUSTOMER TRANSACTIONS
======================================================== */

function buildDailyTransactions() {

    const {
        from,
        to
    } =
        getDateRange();


    const customerId =
        $("customerSelect")?.value ||
        "";


    const list =
        customerTransactions

            .filter(
                transaction =>

                    (
                        !customerId ||
                        transaction.customerId ===
                            customerId
                    )

                    &&

                    inRange(
                        transaction.date,
                        from,
                        to
                    )
            )

            .sort(
                (a,b) =>
                    (
                        String(a.date) +
                        String(a.time || "")
                    ).localeCompare(
                        String(b.date) +
                        String(b.time || "")
                    )
            );


    let totalDebit = 0;

    let totalCredit = 0;


    const rows =
        list.map(
            (transaction,index) => {

                const customer =
                    customers.find(
                        c =>
                            c.id ===
                            transaction.customerId
                    );


                const debit =
                    num(
                        transaction.debit
                    );


                const credit =
                    num(
                        transaction.credit
                    );


                totalDebit +=
                    debit;


                totalCredit +=
                    credit;


                return [

                    bn(index + 1),

                    formatDate(
                        transaction.date
                    ),

                    esc(
                        transaction.time ||
                        "-"
                    ),

                    esc(
                        customer?.name ||
                        transaction.customerId ||
                        "-"
                    ),

                    esc(
                        transaction.type ||
                        "-"
                    ),

                    esc(
                        transaction.description ||
                        "-"
                    ),

                    debit
                        ? money(debit)
                        : "-",

                    credit
                        ? money(credit)
                        : "-"

                ];

            }
        );


    renderReport(

        header(
            "Daily Customer Transactions",
            "All customer ledger transactions for selected date range"
        )

        +

        summary([

            {
                label:
                    "Transactions",

                value:
                    list.length
            },

            {
                label:
                    "Total Debit",

                value:
                    money(totalDebit)
            },

            {
                label:
                    "Total Credit",

                value:
                    money(totalCredit)
            },

            {
                label:
                    "Net",

                value:
                    money(
                        totalDebit -
                        totalCredit
                    )
            }

        ])

        +

        table(

            [

                {
                    label:
                        "ক্রম"
                },

                {
                    label:
                        "তারিখ"
                },

                {
                    label:
                        "সময়"
                },

                {
                    label:
                        "Customer"
                },

                {
                    label:
                        "Type"
                },

                {
                    label:
                        "বিবরণ"
                },

                {
                    label:
                        "দিলাম",
                    num:true
                },

                {
                    label:
                        "পেলাম",
                    num:true
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   REPORT 5
   ACCOUNT BALANCE
======================================================== */

function buildAccountBalance() {

    const categoryId =
        $("categorySelect")?.value ||
        "";


    const accountId =
        $("accountSelect")?.value ||
        "";


    const list =
        accounts.filter(
            account =>

                (
                    !categoryId ||
                    account.catId ===
                        categoryId
                )

                &&

                (
                    !accountId ||
                    account.id ===
                        accountId
                )
        );


    let total =
        0;


    const rows =
        list.map(
            (account,index) => {

                const category =
                    categories.find(
                        c =>
                            c.id ===
                            account.catId
                    );


                const balance =
                    num(
                        balanceStore[
                            account.id
                        ]
                    );


                total +=
                    balance;


                return [

                    bn(index + 1),

                    esc(
                        category?.name ||
                        "-"
                    ),

                    esc(
                        account.id
                    ),

                    esc(
                        account.name ||
                        "-"
                    ),

                    money(
                        balance
                    )

                ];

            }
        );


    renderReport(

        header(
            "Account Balance Snapshot",
            "Current balance of ERP financial accounts"
        )

        +

        summary([

            {
                label:
                    "Accounts",

                value:
                    list.length
            },

            {
                label:
                    "Total Balance",

                value:
                    money(total)
            },

            {
                label:
                    "Categories",

                value:
                    new Set(
                        list.map(
                            a => a.catId
                        )
                    ).size
            },

            {
                label:
                    "Snapshot",

                value:
                    formatDate(
                        todayStr()
                    )
            }

        ])

        +

        table(

            [

                {
                    label:
                        "ক্রম"
                },

                {
                    label:
                        "Category"
                },

                {
                    label:
                        "Account ID"
                },

                {
                    label:
                        "Account Name"
                },

                {
                    label:
                        "Balance",
                    num:true
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   REPORT 6
   BALANCE HISTORY
======================================================== */

function buildBalanceHistory() {

    const {
        from,
        to
    } =
        getDateRange();


    const categoryId =
        $("categorySelect")?.value ||
        "";


    const accountId =
        $("accountSelect")?.value ||
        "";


    const selectedAccount =
        accounts.find(
            account =>
                account.id ===
                accountId
        );


    const selectedCategory =
        categories.find(
            category =>
                category.id ===
                categoryId
        );


    const list =
        historyLogs.filter(
            history => {

                if (
                    !inRange(
                        history.date,
                        from,
                        to
                    )
                ) {

                    return false;

                }


                if (
                    categoryId
                    &&
                    history.category !==
                        categoryId
                    &&
                    history.category !==
                        selectedCategory?.name
                ) {

                    return false;

                }


                if (
                    accountId
                    &&
                    history.accountId !==
                        accountId
                    &&
                    history.accountName !==
                        selectedAccount?.name
                ) {

                    return false;

                }


                return true;

            }
        );


    const rows =
        list.map(
            (history,index) => [

                bn(index + 1),

                esc(
                    history.date ||
                    "-"
                ),

                esc(
                    history.category ||
                    "-"
                ),

                esc(
                    history.accountName ||
                    "-"
                ),

                money(
                    history.previousBalance
                ),

                money(
                    history.currentBalance
                ),

                num(
                    history.difference
                ) >= 0

                    ? `<span style="color:#15803d">
                        ${money(history.difference)}
                      </span>`

                    : `<span style="color:#be123c">
                        ${money(history.difference)}
                      </span>`

            ]
        );


    renderReport(

        header(
            "Balance Change History",
            "Financial account balance update history"
        )

        +

        summary([

            {
                label:
                    "Changes",

                value:
                    list.length
            },

            {
                label:
                    "Positive Changes",

                value:
                    list.filter(
                        x =>
                            num(
                                x.difference
                            ) > 0
                    ).length
            },

            {
                label:
                    "Negative Changes",

                value:
                    list.filter(
                        x =>
                            num(
                                x.difference
                            ) < 0
                    ).length
            },

            {
                label:
                    "Period",

                value:
                    `${
                        from
                            ? formatDate(from)
                            : "Start"
                    } - ${
                        to
                            ? formatDate(to)
                            : "Now"
                    }`
            }

        ])

        +

        table(

            [

                {
                    label:
                        "ক্রম"
                },

                {
                    label:
                        "Date & Time"
                },

                {
                    label:
                        "Category"
                },

                {
                    label:
                        "Account"
                },

                {
                    label:
                        "Previous",
                    num:true
                },

                {
                    label:
                        "Current",
                    num:true
                },

                {
                    label:
                        "Difference",
                    num:true
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   REPORT 7
   CASH HISTORY
======================================================== */

function buildCashHistory() {

    const {
        from,
        to
    } =
        getDateRange();


    const list =
        cashHistoryLogs

            .filter(
                history =>
                    inRange(
                        history.date,
                        from,
                        to
                    )
            );


    const rows =
        list.map(
            (history,index) => [

                bn(index + 1),

                esc(
                    history.date ||
                    "-"
                ),

                money(
                    history.others
                ),

                money(
                    history.grandTotal
                )

            ]
        );


    renderReport(

        header(
            "Cash Inventory History",
            "Saved cash inventory snapshots"
        )

        +

        summary([

            {
                label:
                    "Snapshots",

                value:
                    list.length
            },

            {
                label:
                    "Current Cash",

                value:
                    money(
                        cashInventory.grandTotal
                    )
            },

            {
                label:
                    "Other Cash",

                value:
                    money(
                        cashInventory.others
                    )
            },

            {
                label:
                    "Latest Update",

                value:
                    list[0]?.date ||
                    "-"
            }

        ])

        +

        table(

            [

                {
                    label:
                        "ক্রম"
                },

                {
                    label:
                        "Date & Time"
                },

                {
                    label:
                        "Other Cash",
                    num:true
                },

                {
                    label:
                        "Grand Total",
                    num:true
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   REPORT 8
   CARD HISTORY
======================================================== */

function buildCardHistory() {

    const {
        from,
        to
    } =
        getDateRange();


    const list =
        cardHistoryLogs

            .filter(
                history =>
                    inRange(
                        history.date,
                        from,
                        to
                    )
            );


    const rows =
        list.map(
            (history,index) => [

                bn(index + 1),

                esc(
                    history.date ||
                    "-"
                ),

                esc(
                    history.operator ||
                    "-"
                ),

                bn(
                    history.totalCards ||
                    0
                ),

                money(
                    history.grandTotalValue
                )

            ]
        );


    const totalValue =
        list.reduce(
            (sum,history) =>
                sum +
                num(
                    history.grandTotalValue
                ),
            0
        );


    const totalCards =
        list.reduce(
            (sum,history) =>
                sum +
                num(
                    history.totalCards
                ),
            0
        );


    renderReport(

        header(
            "Card Inventory History",
            "Operator-wise saved card inventory snapshots"
        )

        +

        summary([

            {
                label:
                    "Snapshots",

                value:
                    list.length
            },

            {
                label:
                    "Total Cards in Records",

                value:
                    bn(totalCards)
            },

            {
                label:
                    "Recorded Value",

                value:
                    money(totalValue)
            },

            {
                label:
                    "Operators",

                value:
                    new Set(
                        list.map(
                            x =>
                                x.operator
                        )
                    ).size
            }

        ])

        +

        table(

            [

                {
                    label:
                        "ক্রম"
                },

                {
                    label:
                        "Date & Time"
                },

                {
                    label:
                        "Operator"
                },

                {
                    label:
                        "Total Cards",
                    num:true
                },

                {
                    label:
                        "Total Value",
                    num:true
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   REPORT 9
   DAILY CLOSING
======================================================== */

function buildDailyClosing() {

    const {
        from,
        to
    } =
        getDateRange();


    const list =
        dailyClosingReports

            .filter(
                report =>
                    inRange(
                        report.report_date,
                        from,
                        to
                    )
            )

            .sort(
                (a,b) =>
                    String(
                        b.report_date
                    ).localeCompare(
                        String(
                            a.report_date
                        )
                    )
            );


    const rows =
        list.map(
            (report,index) => [

                bn(index + 1),

                esc(
                    report.report_date ||
                    "-"
                ),

                money(
                    report.opening_capital
                ),

                money(
                    report.total_pelam
                ),

                money(
                    report.total_dilam
                ),

                money(
                    report.expected_closing
                ),

                money(
                    report.actual_closing
                ),

                money(
                    report.income
                ),

                `<span class="status status-paid">
                    ${esc(
                        report.status ||
                        "Closed"
                    )}
                </span>`

            ]
        );


    const income =
        list.reduce(
            (sum,report) =>
                sum +
                num(report.income),
            0
        );


    const actual =
        list.reduce(
            (sum,report) =>
                sum +
                num(report.actual_closing),
            0
        );


    renderReport(

        header(
            "Daily Closing Report",
            "Daily capital reconciliation and closing result"
        )

        +

        summary([

            {
                label:
                    "Closing Days",

                value:
                    list.length
            },

            {
                label:
                    "Actual Closing Total",

                value:
                    money(actual)
            },

            {
                label:
                    "Income / Commission",

                value:
                    money(income)
            },

            {
                label:
                    "Status",

                value:
                    "Closed"
            }

        ])

        +

        table(

            [

                {
                    label:
                        "ক্রম"
                },

                {
                    label:
                        "Date"
                },

                {
                    label:
                        "Opening",
                    num:true
                },

                {
                    label:
                        "পেলাম",
                    num:true
                },

                {
                    label:
                        "দিলাম",
                    num:true
                },

                {
                    label:
                        "Expected",
                    num:true
                },

                {
                    label:
                        "Actual",
                    num:true
                },

                {
                    label:
                        "Income",
                    num:true
                },

                {
                    label:
                        "Status"
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   REPORT 10
   FINANCIAL SUMMARY
======================================================== */

function buildFinancialSummary() {

    const {
        from,
        to
    } =
        getDateRange();


    const closing =
        dailyClosingReports.filter(
            report =>
                inRange(
                    report.report_date,
                    from,
                    to
                )
        );


    const transactions =
        customerTransactions.filter(
            transaction =>
                inRange(
                    transaction.date,
                    from,
                    to
                )
        );


    const totalDebit =
        transactions.reduce(
            (sum,transaction) =>
                sum +
                num(transaction.debit),
            0
        );


    const totalCredit =
        transactions.reduce(
            (sum,transaction) =>
                sum +
                num(transaction.credit),
            0
        );


    const income =
        closing.reduce(
            (sum,report) =>
                sum +
                num(report.income),
            0
        );


    const dueData =
        totalDueData();


    const receivable =
        dueData

            .filter(
                customer =>
                    customer.due > 0
            )

            .reduce(
                (sum,customer) =>
                    sum +
                    customer.due,
                0
            );


    const advance =
        dueData

            .filter(
                customer =>
                    customer.due < 0
            )

            .reduce(
                (sum,customer) =>
                    sum +
                    Math.abs(
                        customer.due
                    ),
                0
            );


    const rows = [

        [
            "Customer Transactions",
            bn(transactions.length),
            money(totalDebit),
            money(totalCredit),
            money(
                totalDebit -
                totalCredit
            )
        ],

        [

            "Daily Closing Records",

            bn(closing.length),

            money(
                closing.reduce(
                    (sum,report) =>
                        sum +
                        num(
                            report.total_pelam
                        ),
                    0
                )
            ),

            money(
                closing.reduce(
                    (sum,report) =>
                        sum +
                        num(
                            report.total_dilam
                        ),
                    0
                )
            ),

            money(income)

        ],

        [

            "Current Customer Receivable",

            bn(
                dueData.filter(
                    c => c.due > 0
                ).length
            ),

            money(receivable),

            money(0),

            money(receivable)

        ],

        [

            "Current Customer Advance",

            bn(
                dueData.filter(
                    c => c.due < 0
                ).length
            ),

            money(advance),

            money(0),

            money(advance)

        ]

    ].map(
        row =>
            row.map(
                value =>
                    esc(value)
            )
    );


    renderReport(

        header(
            "Financial Summary",
            "Combined summary from existing ERP customer transaction and daily closing data"
        )

        +

        summary([

            {
                label:
                    "Transactions",

                value:
                    transactions.length
            },

            {
                label:
                    "Transaction Debit",

                value:
                    money(totalDebit)
            },

            {
                label:
                    "Transaction Credit",

                value:
                    money(totalCredit)
            },

            {
                label:
                    "Closing Income",

                value:
                    money(income)
            }

        ])

        +

        table(

            [

                {
                    label:
                        "Section"
                },

                {
                    label:
                        "Records",
                    num:true
                },

                {
                    label:
                        "Amount A",
                    num:true
                },

                {
                    label:
                        "Amount B",
                    num:true
                },

                {
                    label:
                        "Net / Result",
                    num:true
                }

            ],

            rows

        ),

        rows.length

    );


    currentRows =
        rows.map(
            row =>
                row.map(
                    stripHtml
                )
        );

}


/* ========================================================
   GENERATE SELECTED REPORT
======================================================== */

function generateReport() {

    const type =
        $("reportType")?.value;


    switch(type) {

        case "customer_statement":

            buildCustomerStatement();

            break;


        case "customer_due":

            buildCustomerDue();

            break;


        case "customer_list":

            buildCustomerList();

            break;


        case "daily_transactions":

            buildDailyTransactions();

            break;


        case "account_balance":

            buildAccountBalance();

            break;


        case "balance_history":

            buildBalanceHistory();

            break;


        case "cash_history":

            buildCashHistory();

            break;


        case "card_history":

            buildCardHistory();

            break;


        case "daily_closing":

            buildDailyClosing();

            break;


        case "financial_summary":

            buildFinancialSummary();

            break;


        default:

            alert(
                "রিপোর্ট নির্বাচন করুন।"
            );

    }

}


/* ========================================================
   EXCEL DOWNLOAD
======================================================== */

function downloadExcel() {

    if (
        !currentRows.length
    ) {

        alert(
            "আগে Preview Report তৈরি করুন।"
        );

        return;

    }


    if (
        typeof XLSX === "undefined"
    ) {

        alert(
            "Excel library load হয়নি।"
        );

        return;

    }


    const data = [

        [
            "Mousumi Computer"
        ],

        [
            currentReportTitle
        ],

        [
            "Generated",
            new Date().toLocaleString()
        ],

        [],

        ...currentRows

    ];


    const worksheet =
        XLSX.utils.aoa_to_sheet(
            data
        );


    const workbook =
        XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Report"
    );


    const safeName =
        currentReportTitle

            .replace(
                /[\\/:*?"<>|]/g,
                "_"
            )

            .replace(
                /\s+/g,
                "_"
            );


    XLSX.writeFile(
        workbook,
        `${safeName || "Report"}.xlsx`
    );

}


/* ========================================================
   PDF DOWNLOAD
======================================================== */

async function downloadPDF() {

    const element =
        document.querySelector(
            "#reportArea .report-paper"
        );


    if (!element) {

        alert(
            "আগে Preview Report তৈরি করুন।"
        );

        return;

    }


    if (
        typeof window.html2pdf !==
        "function"
    ) {

        alert(
            "PDF library load হয়নি।"
        );

        return;

    }


    setLoading(
        true,
        "PDF তৈরি হচ্ছে..."
    );


    try {

        const safeName =
            currentReportTitle

                .replace(
                    /[\\/:*?"<>|]/g,
                    "_"
                )

                .replace(
                    /\s+/g,
                    "_"
                );


        const options = {

            margin: [
                8,
                8,
                10,
                8
            ],

            filename:
                `${safeName || "Report"}.pdf`,

            image: {

                type:
                    "jpeg",

                quality:
                    0.98

            },

            html2canvas: {

                scale:
                    2,

                useCORS:
                    true,

                backgroundColor:
                    "#ffffff"

            },

            jsPDF: {

                unit:
                    "mm",

                format:
                    "a4",

                orientation:
                    "portrait"

            },

            pagebreak: {

                mode: [
                    "css",
                    "legacy"
                ]

            }

        };


        await window
            .html2pdf()
            .set(options)
            .from(element)
            .save();


    } catch(error) {

        console.error(
            "PDF Error:",
            error
        );


        alert(
            "PDF তৈরি করা যায়নি:\n" +
            error.message
        );

    }


    finally {

        setLoading(false);

    }

}


/* ========================================================
   RESET
======================================================== */

function resetFilters() {

    if ($("reportType")) {

        $("reportType").value =
            "customer_statement";

    }


    if ($("customerSelect")) {

        $("customerSelect").value =
            "";

    }


    if ($("categorySelect")) {

        $("categorySelect").value =
            "";

    }


    if ($("accountSelect")) {

        $("accountSelect").value =
            "";

    }


    if ($("statusSelect")) {

        $("statusSelect").value =
            "all";

    }


    setRange(
        "month"
    );


    updateDynamicFields();


    if ($("reportArea")) {

        $("reportArea").innerHTML = `

            <div class="empty">

                <i class="fa-solid fa-file-circle-question"></i>

                <div>
                    রিপোর্ট Preview করতে
                    “Preview Report”
                    চাপুন।
                </div>

            </div>

        `;

    }


    if ($("recordCount")) {

        $("recordCount").textContent =
            "0 records";

    }


    currentRows = [];

    currentReportTitle = "";

}


/* ========================================================
   EVENTS
======================================================== */

if ($("reportType")) {

    $("reportType")
        .addEventListener(
            "change",
            updateDynamicFields
        );

}


if ($("previewBtn")) {

    $("previewBtn")
        .addEventListener(
            "click",
            generateReport
        );

}


if ($("excelBtn")) {

    $("excelBtn")
        .addEventListener(
            "click",
            downloadExcel
        );

}


if ($("pdfBtn")) {

    $("pdfBtn")
        .addEventListener(
            "click",
            downloadPDF
        );

}


if ($("printBtn")) {

    $("printBtn")
        .addEventListener(
            "click",
            () => window.print()
        );

}


if ($("resetBtn")) {

    $("resetBtn")
        .addEventListener(
            "click",
            resetFilters
        );

}


/* ========================================================
   QUICK DATE BUTTONS
======================================================== */

document
    .querySelectorAll(
        ".quick-btn"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                setRange(
                    button.dataset.range
                );


                generateReport();

            }
        );

    });


/* ========================================================
   LOGIN
======================================================== */

if ($("loginForm")) {

    $("loginForm")
        .addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                const error =
                    $("loginError");


                if (error) {

                    error.style.display =
                        "none";

                }


                setLoading(
                    true,
                    "Login হচ্ছে..."
                );


                try {

                    await signInWithEmailAndPassword(

                        auth,

                        $(
                            "loginEmail"
                        ).value.trim(),

                        $(
                            "loginPassword"
                        ).value

                    );


                } catch(errorObject) {

                    console.error(
                        "Login Error:",
                        errorObject
                    );


                    if (error) {

                        error.textContent =
                            "Login failed: " +
                            errorObject.message;

                        error.style.display =
                            "block";

                    }

                }


                finally {

                    setLoading(
                        false
                    );

                }

            }
        );

}


/* ========================================================
   AUTH STATE
======================================================== */

onAuthStateChanged(
    auth,
    user => {

        if (user) {

            if ($("loginScreen")) {

                $("loginScreen")
                    .style.display =
                        "none";

            }


            if ($("userEmail")) {

                $("userEmail")
                    .textContent =
                        user.email ||
                        "Authenticated";

            }


            setRange(
                "month"
            );


            loadData();


        } else {

            if ($("userEmail")) {

                $("userEmail")
                    .textContent =
                        "Not logged in";

            }


            if ($("loginScreen")) {

                $("loginScreen")
                    .style.display =
                        "grid";

            }

        }

    }
);
