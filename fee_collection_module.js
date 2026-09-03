/**
 * Mousumi Computer ERP - Education & Digital Services Module (Enterprise Edition)
 * Fixed: Sidebar Submenu Dropdown, 1-Click Tap Pay, Reason Void, Reports Hub, A5 Print.
 */

(function () {
    let studentDueList = [];
    let firebaseCore = null;
    let feeTransactionsList = [];
    let voidLogsList = [];
    let selectedStudentRawDue = 0;
    let selectedStudentData = null;

    // পেজিনেশন স্টেট (Due Database)
    let currentPage = 1;
    let rowsPerPage = 25;
    let currentSearchQuery = "";

    // ১. মডিউল সিএসএস
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');

        #edu-module-container, #edu-module-container * {
            box-sizing: border-box !important;
            font-family: 'Plus Jakarta Sans', 'Kalpurush', sans-serif !important;
        }

        /* ড্রপডাউন সাবমেনু ফিক্স (ডিফল্টভাবে বন্ধ থাকবে) */
        #menu-edu-parent .submenu-list {
            display: none !important;
        }

        #menu-edu-parent.open > .submenu-list,
        #menu-edu-parent .submenu-list.show {
            display: flex !important;
            flex-direction: column;
        }

        #menu-edu-parent .chevron-icon {
            transition: transform 0.25s ease;
        }

        #menu-edu-parent.open .chevron-icon {
            transform: rotate(180deg);
        }

        .edu-view-card {
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.04);
            border: 1px solid #e2e8f0;
            overflow: hidden;
            margin-bottom: 25px;
        }

        .edu-card-header-clean {
            background: #ffffff;
            padding: 18px 24px;
            border-bottom: 1.5px solid #f1f5f9;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }

        .edu-card-header-clean h3 {
            font-size: 1.15rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .edu-pill-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.3px;
        }

        .badge-pending { background: #fef3c7; color: #b45309; }
        .badge-paid { background: #dcfce7; color: #15803d; }
        .badge-void { background: #fee2e2; color: #b91c1c; }

        /* FORM STYLING */
        .edu-form-container { padding: 25px; max-width: 950px; margin: 0 auto; }
        .edu-form-grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px; margin-bottom: 18px; }
        .edu-field-box label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 6px; }
        .edu-input {
            width: 100%;
            height: 46px;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            padding: 0 14px;
            font-size: 0.95rem;
            font-weight: 600;
            color: #1e293b;
            outline: none;
            transition: all 0.2s;
            background: #ffffff;
        }
        .edu-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
        .edu-input[readonly] { background: #f8fafc; color: #475569; font-weight: 700; }

        /* ADJUSTMENT BANNER */
        .edu-adjustment-box {
            background: #eff6ff;
            border: 1.5px dashed #3b82f6;
            border-radius: 8px;
            padding: 12px 18px;
            margin-bottom: 18px;
            display: none;
            align-items: center;
            justify-content: space-between;
            color: #1e40af;
            font-size: 0.88rem;
            font-weight: 600;
        }

        /* TABLES */
        .edu-table-responsive { overflow-x: auto; padding: 15px 20px; }
        .edu-clean-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; min-width: 900px; }
        .edu-clean-table th {
            padding: 10px 14px;
            font-size: 0.78rem;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
            text-align: left;
            border: none;
        }
        .edu-clean-table td {
            background: #ffffff;
            padding: 14px;
            font-size: 0.88rem;
            font-weight: 600;
            color: #1e293b;
            border-top: 1px solid #f1f5f9;
            border-bottom: 1px solid #f1f5f9;
        }
        .edu-clean-table tr td:first-child { border-left: 1px solid #f1f5f9; border-radius: 8px 0 0 8px; }
        .edu-clean-table tr td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 8px 8px 0; text-align: right; }
        .edu-clean-table tr:hover td { background: #f8fafc; }

        /* ACTION BUTTONS */
        .btn-act {
            border: none;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        .btn-act-pay { background: #10b981; color: #ffffff; }
        .btn-act-pay:hover { background: #059669; }
        .btn-act-undo { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
        .btn-act-undo:hover { background: #e2e8f0; }
        .btn-act-print { background: #0f172a; color: #ffffff; }
        .btn-act-print:hover { background: #334155; }
        .btn-act-void { background: #fee2e2; color: #dc2626; }
        .btn-act-void:hover { background: #fecaca; }

        /* REPORT HUB CARDS */
        .report-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
            padding: 25px;
        }
        .report-card-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 22px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .report-card-item h4 { font-size: 1rem; color: #0f172a; margin-bottom: 6px; }
        .report-card-item p { font-size: 0.8rem; color: #64748b; margin-bottom: 16px; line-height: 1.4; }

        /* VOID MODAL */
        .edu-modal-bg {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(4px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 999999;
        }
        .edu-modal-box {
            background: #ffffff;
            border-radius: 14px;
            padding: 25px;
            max-width: 440px;
            width: 90%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        }
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
                try { app = fbApp.getApp(); if (app) break; } catch (e) {}
                await new Promise(r => setTimeout(r, 200));
            }
            if (!app) {
                app = fbApp.initializeApp({
                    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                    projectId: "mousumi-computer"
                }, "feeModuleApp_" + Date.now());
            }

            const db = fbDb.getDatabase(app);
            firebaseCore = { db, ref: fbDb.ref, set: fbDb.set, onValue: fbDb.onValue, get: fbDb.get };
            return firebaseCore;
        } catch (err) {
            console.error("Firebase connection error:", err);
            return null;
        }
    }

    // ৩. গ্লোবাল মেনু টগল ফাংশন
    window.toggleEduMenu = function () {
        const item = document.getElementById('menu-edu-parent');
        if (item) {
            item.classList.toggle('open');
            const sub = item.querySelector('.submenu-list');
            if (sub) sub.classList.toggle('show');
        }
    };

    // ৪. সাইডবার মেনু ইনজেকশন (show ক্লাস সরিয়ে ডিফল্ট ক্লোজ করা হয়েছে)
    function injectMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-edu-parent')) return;

        const html = `
            <li class="menu-item" id="menu-edu-parent">
                <a onclick="toggleEduMenu()" style="cursor: pointer;">
                    <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>Education & Digital</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon" style="font-size: 0.7rem;"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-form')"><i class="fa-solid fa-angle-right"></i> <span>Fee Collection</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-pending-clearance')"><i class="fa-solid fa-angle-right"></i> <span>Pending Clearance</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-paid-settlement')"><i class="fa-solid fa-angle-right"></i> <span>Paid Settlement</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-due-data')"><i class="fa-solid fa-angle-right"></i> <span>Due Database</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-void-logs')"><i class="fa-solid fa-angle-right"></i> <span>Void & Trash Log</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-reports-hub')"><i class="fa-solid fa-angle-right"></i> <span>Reports & Export</span></a></li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    // ৫. ভিউ প্যানেল ইনজেকশন
    function injectPanels() {
        const wrapper = document.querySelector('.main-wrapper');
        if (!wrapper) return;

        const panelsHTML = `
            <div id="edu-module-container">
                
                <!-- PANEL 1: FEE COLLECTION (NEW ENTRY) -->
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-view-card edu-form-container">
                        <div class="edu-card-header-clean" style="padding:0 0 18px 0; margin-bottom:20px;">
                            <h3><i class="fa-solid fa-receipt" style="color:#2563eb;"></i> Fee Collection Terminal</h3>
                            <span class="edu-pill-badge badge-pending">Instant Receipt</span>
                        </div>

                        <!-- DYNAMIC ADJUSTMENT NOTIFICATION BOX -->
                        <div class="edu-adjustment-box" id="adjustmentAlertBox">
                            <div><i class="fa-solid fa-circle-info"></i> <span id="adjustmentDetailsText">Previous payment found and adjusted.</span></div>
                            <span class="edu-pill-badge badge-paid" id="adjustmentAmountTag">Adjusted: ৳ 0</span>
                        </div>

                        <form id="feeFormOriginal">
                            <div class="edu-form-grid-3">
                                <div class="edu-field-box">
                                    <label>Date</label>
                                    <input type="date" id="origDate" class="edu-input" required>
                                </div>
                                <div class="edu-field-box">
                                    <label>Student ID / Mobile</label>
                                    <input type="text" id="origId" class="edu-input" placeholder="Enter ID..." required autocomplete="off">
                                </div>
                                <div class="edu-field-box">
                                    <label>Student Name</label>
                                    <input type="text" id="origName" class="edu-input" placeholder="Student Name" readonly>
                                </div>
                            </div>
                            <div class="edu-form-grid-3">
                                <div class="edu-field-box">
                                    <label>Net Due (৳)</label>
                                    <input type="text" id="origDue" class="edu-input" value="0.00" readonly>
                                </div>
                                <div class="edu-field-box">
                                    <label>Service Charge (৳)</label>
                                    <input type="number" step="any" id="origTxn" class="edu-input" value="6.00">
                                    <div style="font-size:0.75rem; color:#2563eb; font-weight:700; margin-top:4px;">Total Charge: ৳ <span id="origCharge">6.00</span></div>
                                </div>
                                <div class="edu-field-box">
                                    <label>Total Received (৳)</label>
                                    <input type="text" id="origRec" class="edu-input" value="0.00" readonly style="color:#15803d; font-size:1.1rem;">
                                </div>
                            </div>
                            <div class="edu-form-grid-3">
                                <div class="edu-field-box">
                                    <label>Discount (৳)</label>
                                    <input type="number" step="any" id="origDisc" class="edu-input" value="0.00">
                                </div>
                            </div>
                            <div style="display:flex; justify-content:flex-end; margin-top:15px;">
                                <button type="submit" class="btn-act btn-act-print" style="padding:12px 30px; font-size:0.95rem; border-radius:8px;">
                                    <i class="fa-solid fa-print"></i> Submit & Open Receipt
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- PANEL 2: PENDING CLEARANCE (TAP PAYMENT CHECKLIST) -->
                <div class="view-panel" id="edu-pending-clearance-view">
                    <div class="edu-view-card">
                        <div class="edu-card-header-clean">
                            <h3><i class="fa-solid fa-clock-rotate-left" style="color:#b45309;"></i> Pending Clearance (To Pay via Tap)</h3>
                            <div>
                                <span class="edu-pill-badge badge-pending" id="pendingCountBadge">0 Pending</span>
                                <span style="font-size:0.9rem; font-weight:800; margin-left:12px;">Total: ৳ <span id="pendingTotalSum">0.00</span></span>
                            </div>
                        </div>
                        <div class="edu-table-responsive">
                            <table class="edu-clean-table">
                                <thead>
                                    <tr>
                                        <th>Receipt #</th>
                                        <th>Date</th>
                                        <th>Student ID</th>
                                        <th>Student Name</th>
                                        <th>Tuition Fee</th>
                                        <th>Total Collected</th>
                                        <th style="text-align:right;">Action (Tap Pay)</th>
                                    </tr>
                                </thead>
                                <tbody id="pendingClearanceTableBody">
                                    <tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No pending clearance records.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- PANEL 3: PAID SETTLEMENT (PAID RECORDS WITH REVERT/UNDO) -->
                <div class="view-panel" id="edu-paid-settlement-view">
                    <div class="edu-view-card">
                        <div class="edu-card-header-clean">
                            <h3><i class="fa-solid fa-circle-check" style="color:#10b981;"></i> Paid Settlement Records</h3>
                            <div>
                                <span class="edu-pill-badge badge-paid" id="paidCountBadge">0 Paid</span>
                                <span style="font-size:0.9rem; font-weight:800; margin-left:12px;">Total: ৳ <span id="paidTotalSum">0.00</span></span>
                            </div>
                        </div>
                        <div class="edu-table-responsive">
                            <table class="edu-clean-table">
                                <thead>
                                    <tr>
                                        <th>Receipt #</th>
                                        <th>Date</th>
                                        <th>Student ID</th>
                                        <th>Student Name</th>
                                        <th>Gross Paid</th>
                                        <th>Paid Time</th>
                                        <th style="text-align:right;">Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="paidSettlementTableBody">
                                    <tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No paid records found.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- PANEL 4: DUE DATABASE (MASTER EXCEL) -->
                <div class="view-panel" id="edu-due-data-view">
                    <div class="edu-view-card" style="padding:20px;">
                        <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:20px; align-items:center;">
                            <input type="file" id="dueFileInput" accept=".xlsx, .xls, .csv" style="display:none;">
                            <button type="button" class="btn-act btn-act-undo" onclick="document.getElementById('dueFileInput').click()"><i class="fa-solid fa-file-excel"></i> Choose Excel File</button>
                            <span id="dueFileNameDisplay" style="font-size:0.85rem; color:#64748b; font-weight:600;">No file chosen</span>
                            <button type="button" class="btn-act btn-act-print" id="btnUploadDueData"><i class="fa-solid fa-cloud-arrow-up"></i> Upload Master Data</button>
                            <button type="button" class="btn-act btn-act-pay" id="btnDownloadSample"><i class="fa-solid fa-download"></i> Sample Sheet</button>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; flex-wrap:wrap; gap:10px;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-size:0.85rem; font-weight:700; color:#475569;">Show</span>
                                <select id="duePageSizeSelect" class="edu-input" style="height:36px; width:80px; padding:0 8px;">
                                    <option value="25">25</option><option value="50">50</option><option value="100">100</option><option value="-1">All</option>
                                </select>
                            </div>
                            <input type="text" id="dueTableSearch" class="edu-input" placeholder="Search student, id, mobile..." style="height:38px; width:260px;">
                        </div>

                        <div class="edu-table-responsive" style="padding:0;">
                            <table class="edu-clean-table">
                                <thead>
                                    <tr>
                                        <th>SL</th><th>Class</th><th>Section</th><th>STD ID</th><th>Student Name</th><th>Due Month</th><th>Due Amount (৳)</th><th>Mobile</th>
                                    </tr>
                                </thead>
                                <tbody id="dueDataTableBody">
                                    <tr><td colspan="8" style="text-align:center; padding:25px; color:#94a3b8;">No due records loaded.</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="duePaginationBtns" style="display:flex; justify-content:flex-end; gap:6px; margin-top:15px;"></div>
                    </div>
                </div>

                <!-- PANEL 5: VOID & TRASH LOG -->
                <div class="view-panel" id="edu-void-logs-view">
                    <div class="edu-view-card">
                        <div class="edu-card-header-clean">
                            <h3><i class="fa-solid fa-trash-can" style="color:#dc2626;"></i> Voided & Deleted Records Log</h3>
                            <span class="edu-pill-badge badge-void" id="voidCountBadge">0 Voided</span>
                        </div>
                        <div class="edu-table-responsive">
                            <table class="edu-clean-table">
                                <thead>
                                    <tr>
                                        <th>Receipt #</th>
                                        <th>Void Date</th>
                                        <th>Student ID & Name</th>
                                        <th>Amount (৳)</th>
                                        <th>Reason for Void</th>
                                        <th>Voided By</th>
                                        <th style="text-align:right;">Action</th>
                                    </tr>
                                </thead>
                                <tbody id="voidLogsTableBody">
                                    <tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No void logs found.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- PANEL 6: REPORTS & EXPORT HUB -->
                <div class="view-panel" id="edu-reports-hub-view">
                    <div class="edu-view-card">
                        <div class="edu-card-header-clean">
                            <h3><i class="fa-solid fa-file-export" style="color:#2563eb;"></i> Reports & Export Hub</h3>
                        </div>
                        <div class="report-grid">
                            <div class="report-card-item">
                                <div>
                                    <h4><i class="fa-solid fa-clock" style="color:#b45309;"></i> Pending Clearance Report</h4>
                                    <p>Export all fees currently collected at shop but not yet cleared/paid to Tap.</p>
                                </div>
                                <div style="display:flex; gap:8px;">
                                    <button class="btn-act btn-act-pay" onclick="exportDataToExcel('pending')"><i class="fa-solid fa-file-excel"></i> Excel</button>
                                </div>
                            </div>

                            <div class="report-card-item">
                                <div>
                                    <h4><i class="fa-solid fa-circle-check" style="color:#10b981;"></i> Paid Settlement Report</h4>
                                    <p>Export all successful Tap payment settlement logs with timestamps.</p>
                                </div>
                                <div style="display:flex; gap:8px;">
                                    <button class="btn-act btn-act-pay" onclick="exportDataToExcel('paid')"><i class="fa-solid fa-file-excel"></i> Excel</button>
                                </div>
                            </div>

                            <div class="report-card-item">
                                <div>
                                    <h4><i class="fa-solid fa-table-list" style="color:#0f172a;"></i> Master Due Database</h4>
                                    <p>Export the complete student due database currently stored in system.</p>
                                </div>
                                <div style="display:flex; gap:8px;">
                                    <button class="btn-act btn-act-pay" onclick="exportDataToExcel('due')"><i class="fa-solid fa-file-excel"></i> Excel</button>
                                </div>
                            </div>

                            <div class="report-card-item">
                                <div>
                                    <h4><i class="fa-solid fa-trash-can" style="color:#dc2626;"></i> Void / Deleted Audit Log</h4>
                                    <p>Export all deleted entries along with mandatory audit reasons.</p>
                                </div>
                                <div style="display:flex; gap:8px;">
                                    <button class="btn-act btn-act-void" onclick="exportDataToExcel('void')"><i class="fa-solid fa-file-excel"></i> Excel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <!-- MANDATORY VOID REASON MODAL -->
            <div class="edu-modal-bg" id="voidReasonModal">
                <div class="edu-modal-box">
                    <h3 style="font-size:1.1rem; font-weight:800; color:#0f172a; margin-bottom:10px;"><i class="fa-solid fa-triangle-exclamation" style="color:#dc2626;"></i> Reason for Voiding Record</h3>
                    <p style="font-size:0.85rem; color:#64748b; margin-bottom:15px;">Please provide the reason why this fee record is being cancelled:</p>
                    <input type="hidden" id="voidTargetTxId" value="">
                    <select id="voidReasonPreset" class="edu-input" style="margin-bottom:10px;" onchange="if(this.value!=='Other') document.getElementById('voidCustomReason').value=this.value;">
                        <option value="Student did not pay / Cancelled">Student did not pay / Cancelled</option>
                        <option value="Incorrect Student ID / Amount">Incorrect Student ID / Amount</option>
                        <option value="Paid through another channel">Paid through another channel</option>
                        <option value="Other">Other (Type below)</option>
                    </select>
                    <input type="text" id="voidCustomReason" class="edu-input" placeholder="Type reason here..." style="margin-bottom:20px;" value="Student did not pay / Cancelled">
                    <div style="display:flex; justify-content:flex-end; gap:10px;">
                        <button class="btn-act btn-act-undo" onclick="document.getElementById('voidReasonModal').style.display='none'">Cancel</button>
                        <button class="btn-act btn-act-void" onclick="confirmVoidTransaction()"><i class="fa-solid fa-trash"></i> Confirm Void</button>
                    </div>
                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', panelsHTML);
    }

    // ৬. রসিদ নতুন ট্যাবে ওপেন (Restored Exact Design & Clean Icon-Only Toolbar)
    window.openReceiptInNewTab = function (d) {
        const receiptWindow = window.open('', '_blank');
        if (!receiptWindow) {
            alert("Popup blocked! Please allow popups for this site.");
            return;
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="bn">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Receipt_${d.receiptNo}_${d.studentName}</title>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=EB+Garamond:ital,wght@0,500;0,600;0,700;1,400&family=Lobster&family=Lora:ital,wght@1,400;1,500;1,600&family=Roboto+Mono:wght@400;500&family=Tiro+Bangla:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { background-color: #0f172a; font-family: 'Tiro Bangla', 'Times New Roman', serif; display: flex; flex-direction: column; align-items: center; padding: 20px 0 40px 0; color: #000; min-height: 100vh; }
                    .icon-action-bar { background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.12); padding: 8px 16px; border-radius: 50px; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
                    .icon-btn { width: 44px; height: 44px; border-radius: 50%; border: none; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: 0.2s; }
                    .btn-print { background: linear-gradient(135deg, #00d2ff 0%, #0078ff 100%); color: #ffffff; }
                    .btn-download { background: linear-gradient(135deg, #34d399 0%, #059669 100%); color: #ffffff; }
                    .btn-close { background: rgba(255, 255, 255, 0.1); color: #e2e8f0; border: 1px solid rgba(255, 255, 255, 0.15); }
                    .btn-close:hover { background: #ef4444; color: #ffffff; }
                    .receipt-wrapper-card { background: #ffffff; width: 148mm; min-height: 210mm; padding: 12mm 15mm; box-shadow: 0 15px 40px rgba(0,0,0,0.5); border-radius: 2px; position: relative; box-sizing: border-box; color: #000000; overflow: hidden; }
                    .receipt-watermark { position: absolute; top: 48mm; left: 21mm; width: 106mm; opacity: 0.38; pointer-events: none; z-index: 1; text-align: center; }
                    .receipt-watermark img { width: 100%; height: auto; display: block; }
                    .receipt-body { position: relative; z-index: 2; }
                    .rc-bismillah { text-align: center; font-family: 'Caveat', cursive !important; font-size: 13.5pt; font-weight: 600; color: #000; margin-bottom: 2px; line-height: 1.2; }
                    .rc-brand-title { text-align: center; font-family: 'Lobster', cursive !important; font-size: 30pt; color: #000; margin: 0 0 4px 0; line-height: 1.1; }
                    .rc-services-desc { text-align: center; font-family: 'EB Garamond', serif !important; font-size: 10.5pt; line-height: 1.25; color: #000; margin: 0 auto 12px auto; max-width: 115mm; }
                    .rc-main-title { text-align: center; font-family: 'Tiro Bangla', 'Times New Roman', serif !important; font-size: 12.5pt; font-weight: bold; letter-spacing: 1.5px; margin-bottom: 6px; color: #000; text-transform: uppercase; }
                    .rc-sheet-table { width: 100%; border-collapse: collapse; border-top: 1.5px dotted #000; }
                    .rc-sheet-table td { color: #000; vertical-align: middle; font-family: 'Tiro Bangla', 'Times New Roman', serif !important; font-size: 13.5pt; line-height: 1.2; border: none; }
                    .rc-col-b { width: 37%; font-weight: bold; border-right: 1.5px dotted #000 !important; padding: 4px 10px 4px 0 !important; }
                    .rc-col-c { width: 63%; font-weight: normal; padding: 4px 0 4px 14px !important; }
                    .rc-section-end td { border-bottom: 1.5px dotted #000; padding-bottom: 8px !important; }
                    .rc-section-start td { padding-top: 8px !important; }
                    .rc-payment-received-row td { text-align: center !important; font-weight: bold; font-size: 14pt; padding: 7px 0 !important; border-bottom: 1.5px dotted #000 !important; border-right: none !important; }
                    .paid-stamp-wrapper { text-align: center; margin: 14px 0 16px 0; position: relative; z-index: 5; }
                    .paid-stamp-img { width: 78px; height: auto; object-fit: contain; display: inline-block; }
                    .rc-footer-sign { font-family: 'Tiro Bangla', 'Times New Roman', serif !important; font-size: 11pt; margin: 0 0 18px 0; color: #000; }
                    .rc-disclaimer-mono { text-align: center; font-family: 'Roboto Mono', monospace !important; font-size: 9pt; line-height: 1.35; color: #000; margin-bottom: 6px; }
                    .rc-disclaimer-lora { text-align: center; font-family: 'Lora', serif !important; font-size: 9pt; font-style: italic; line-height: 1.3; color: #000; }
                    @media print {
                        @page { size: A5 portrait; margin: 0; }
                        body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                        .no-print { display: none !important; }
                        .receipt-wrapper-card { width: 100% !important; min-height: 100% !important; box-shadow: none !important; border-radius: 0 !important; padding: 10mm 12mm !important; margin: 0 auto !important; page-break-inside: avoid !important; }
                    }
                </style>
            </head>
            <body>
                <div class="icon-action-bar no-print">
                    <button class="icon-btn btn-print" onclick="window.print()" title="Print (A5)"><i class="fa-solid fa-print"></i></button>
                    <button class="icon-btn btn-download" onclick="downloadReceiptPDF()" title="Download PDF"><i class="fa-solid fa-file-arrow-down"></i></button>
                    <button class="icon-btn btn-close" onclick="window.close()" title="Close"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="receipt-wrapper-card" id="printableReceiptCard">
                    <div class="receipt-watermark"><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgBBifAiiveIb1xVgQZv6AxAD_YCVu7JRmBqQOX2eeSJFxavzFEhsWQlYpN6b_aUIiUVCdNu39EHD2-tG1Li5b2Jx4U1DqTH98zbWgxmegb-xPADeDbJBdCqt-WhP71NUrFTlJLeEpZgVoAxEcUufpJNxMQs8nVE28Jj6Ch0LRjTnDBICBibZxxgwE7nFyB/s1600/Receipt%20%281%29.png" alt="Watermark" crossorigin="anonymous" /></div>
                    <div class="receipt-body">
                        <div class="rc-bismillah">“In the name of Allah, the Most Gracious, the Most Merciful”</div>
                        <div class="rc-brand-title">Mousumi Computer</div>
                        <div class="rc-services-desc">All kinds of services: Tuition Fee Payment, T-Cash (Tap), bKash, <br>Nagad, Rocket, Upay, Flexiload, and Computer Works.</div>
                        <div class="rc-main-title">RECEIPT</div>
                        <table class="rc-sheet-table">
                            <tr><td class="rc-col-b">Receipt No</td><td class="rc-col-c">${d.receiptNo}</td></tr>
                            <tr class="rc-section-end"><td class="rc-col-b">Date</td><td class="rc-col-c">${d.date}</td></tr>
                            <tr class="rc-section-start"><td class="rc-col-b">Student Name</td><td class="rc-col-c">${d.studentName}</td></tr>
                            <tr class="rc-section-end"><td class="rc-col-b">Student ID</td><td class="rc-col-c">${d.studentId}</td></tr>
                            <tr class="rc-section-start"><td class="rc-col-b">Tuition Fee</td><td class="rc-col-c">${d.tuitionFee}</td></tr>
                            <tr><td class="rc-col-b">Charge</td><td class="rc-col-c">${d.charge}</td></tr>
                            <tr class="rc-section-end"><td class="rc-col-b">Total</td><td class="rc-col-c">${d.total}</td></tr>
                            <tr class="rc-payment-received-row"><td colspan="2">Payment Received: ${d.received}</td></tr>
                        </table>
                        <div class="paid-stamp-wrapper"><img src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgkW_Mz8uWQPQY8WqCQEVSh7ff6C8_ZE02lZw3o42e8QtmSIE8Sxgx_ejXTZmN_QNLHg0nfS5hrG4Mu2Y6NGCztsTnRZfvFuZ3bZzLAkMtvHxP6tkMxi9YUWcKG9gKXpJHrmnuWFFDAw0qIcAPb6WvHNVT_eiZkM2xDyI3HvRxrrqrpqyv8Zv2FIICwIQQr/s1600/Receipt.png" alt="PAID Stamp" class="paid-stamp-img" crossorigin="anonymous" /></div>
                        <div class="rc-footer-sign"><strong>Received By:</strong> ${d.receivedBy || 'Riyal Robiul'}</div>
                        <div class="rc-disclaimer-mono">This is a computer-generated receipt.<br>Thank you for your payment.</div>
                        <div class="rc-disclaimer-lora">For any queries or assistance, please contact<br>Md. Robiul Islam at 01608-314552 or 01893-201584.</div>
                    </div>
                </div>
                <script>
                    function downloadReceiptPDF() {
                        const element = document.getElementById('printableReceiptCard');
                        html2pdf().set({ margin: 0, filename: 'Receipt_${d.receiptNo}_${d.studentId}.pdf', image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2.5, useCORS: true, allowTaint: true }, jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' } }).from(element).save();
                    }
                <\/script>
            </body>
            </html>
        `;

        receiptWindow.document.open();
        receiptWindow.document.write(htmlContent);
        receiptWindow.document.close();
    };

    // ৭. অটো ক্যালকুলেশন
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

    function formatDateToDDMMYYYY(dateStr) {
        if (!dateStr) return new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
        const parts = dateStr.split('-');
        return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
    }

    // ৮. ১-ক্লিকে Tap Pay এবং Revert লজিক
    window.markAsTapPaid = async function(txId) {
        const tx = feeTransactionsList.find(t => t.id === txId);
        if (!tx) return;

        tx.status = 'Paid';
        tx.paidTimestamp = new Date().toLocaleString();
        
        try {
            const fb = await getFirebase();
            if (fb) await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
            if (typeof showToast === 'function') showToast(`✔ ${tx.studentName} marked as PAID to Tap!`, "success");
        } catch(e) { console.error(e); }
    };

    window.revertTapPaidToPending = async function(txId) {
        const tx = feeTransactionsList.find(t => t.id === txId);
        if (!tx) return;

        tx.status = 'Pending';
        delete tx.paidTimestamp;

        try {
            const fb = await getFirebase();
            if (fb) await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
            if (typeof showToast === 'function') showToast(`↩ ${tx.studentName} restored to Pending Clearance!`, "info");
        } catch(e) { console.error(e); }
    };

    // ৯. Void / Delete Modal
    window.openVoidModal = function(txId) {
        document.getElementById('voidTargetTxId').value = txId;
        document.getElementById('voidReasonModal').style.display = 'flex';
    };

    window.confirmVoidTransaction = async function() {
        const txId = document.getElementById('voidTargetTxId').value;
        const reason = document.getElementById('voidCustomReason').value.trim() || 'Cancelled';
        const txIndex = feeTransactionsList.findIndex(t => t.id === txId);
        if (txIndex === -1) return;

        const [removedTx] = feeTransactionsList.splice(txIndex, 1);
        removedTx.voidReason = reason;
        removedTx.voidDate = new Date().toLocaleString();
        removedTx.voidedBy = (window.profileSettings && window.profileSettings.fullName) || 'Admin';

        voidLogsList.unshift(removedTx);

        try {
            const fb = await getFirebase();
            if (fb) {
                await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
                await fb.set(fb.ref(fb.db, 'erp/feeVoidLogs'), voidLogsList);
            }
            document.getElementById('voidReasonModal').style.display = 'none';
            if (typeof showToast === 'function') showToast("Record voided and moved to Trash Log.", "warning");
        } catch(e) { console.error(e); }
    };

    window.restoreVoidedRecord = async function(txId) {
        const vIndex = voidLogsList.findIndex(v => v.id === txId);
        if (vIndex === -1) return;

        const [restored] = voidLogsList.splice(vIndex, 1);
        restored.status = 'Pending';
        delete restored.voidReason;
        delete restored.voidDate;

        feeTransactionsList.push(restored);

        try {
            const fb = await getFirebase();
            if (fb) {
                await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
                await fb.set(fb.ref(fb.db, 'erp/feeVoidLogs'), voidLogsList);
            }
            if (typeof showToast === 'function') showToast("Record restored to Pending Clearance!", "success");
        } catch(e) { console.error(e); }
    };

    // ১০. টেবিল রেন্ডারিং
    function renderPendingTable() {
        const tbody = document.getElementById('pendingClearanceTableBody');
        const badge = document.getElementById('pendingCountBadge');
        const sumEl = document.getElementById('pendingTotalSum');
        if (!tbody) return;

        const pendingList = feeTransactionsList.filter(t => t.status !== 'Paid');
        let total = 0;

        if (pendingList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No pending clearance records. All fees cleared!</td></tr>';
            if (badge) badge.innerText = '0 Pending';
            if (sumEl) sumEl.innerText = '0.00';
            return;
        }

        let html = '';
        pendingList.forEach(t => {
            const netRec = parseFloat(t.netReceived || 0);
            total += netRec;
            html += `
                <tr>
                    <td style="font-weight:800; color:#2563eb;">#${t.receiptNo || '-'}</td>
                    <td>${t.date}</td>
                    <td><strong>${t.customerId}</strong></td>
                    <td>${t.studentName}</td>
                    <td>৳ ${parseFloat(t.netDue||0).toFixed(2)}</td>
                    <td style="color:#15803d; font-weight:800;">৳ ${netRec.toFixed(2)}</td>
                    <td style="text-align:right;">
                        <button class="btn-act btn-act-pay" onclick="markAsTapPaid('${t.id}')"><i class="fa-solid fa-check"></i> Pay</button>
                        <button class="btn-act btn-act-print" onclick="printRowReceipt('${t.id}')"><i class="fa-solid fa-print"></i></button>
                        <button class="btn-act btn-act-void" onclick="openVoidModal('${t.id}')"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        if (badge) badge.innerText = `${pendingList.length} Pending`;
        if (sumEl) sumEl.innerText = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }

    function renderPaidTable() {
        const tbody = document.getElementById('paidSettlementTableBody');
        const badge = document.getElementById('paidCountBadge');
        const sumEl = document.getElementById('paidTotalSum');
        if (!tbody) return;

        const paidList = feeTransactionsList.filter(t => t.status === 'Paid');
        let total = 0;

        if (paidList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No paid records found yet.</td></tr>';
            if (badge) badge.innerText = '0 Paid';
            if (sumEl) sumEl.innerText = '0.00';
            return;
        }

        let html = '';
        paidList.forEach(t => {
            const gross = parseFloat(t.grossPayment || t.netReceived || 0);
            total += gross;
            html += `
                <tr>
                    <td style="font-weight:800; color:#10b981;">#${t.receiptNo || '-'}</td>
                    <td>${t.date}</td>
                    <td><strong>${t.customerId}</strong></td>
                    <td>${t.studentName}</td>
                    <td style="font-weight:800; color:#15803d;">৳ ${gross.toFixed(2)}</td>
                    <td style="font-size:0.8rem; color:#64748b;">${t.paidTimestamp || '-'}</td>
                    <td style="text-align:right;">
                        <button class="btn-act btn-act-undo" onclick="revertTapPaidToPending('${t.id}')" title="Revert to Pending"><i class="fa-solid fa-rotate-left"></i> Revert</button>
                        <button class="btn-act btn-act-print" onclick="printRowReceipt('${t.id}')"><i class="fa-solid fa-print"></i></button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        if (badge) badge.innerText = `${paidList.length} Paid`;
        if (sumEl) sumEl.innerText = total.toLocaleString('en-US', { minimumFractionDigits: 2 });
    }

    function renderVoidTable() {
        const tbody = document.getElementById('voidLogsTableBody');
        const badge = document.getElementById('voidCountBadge');
        if (!tbody) return;

        if (voidLogsList.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#94a3b8;">No void logs found.</td></tr>';
            if (badge) badge.innerText = '0 Voided';
            return;
        }

        let html = '';
        voidLogsList.forEach(v => {
            html += `
                <tr>
                    <td style="font-weight:800; color:#dc2626;">#${v.receiptNo || '-'}</td>
                    <td style="font-size:0.8rem;">${v.voidDate || '-'}</td>
                    <td><strong>${v.customerId}</strong> (${v.studentName})</td>
                    <td>৳ ${parseFloat(v.netReceived||0).toFixed(2)}</td>
                    <td style="color:#b91c1c; font-style:italic;">${v.voidReason || 'Cancelled'}</td>
                    <td style="font-size:0.8rem;">${v.voidedBy || 'Admin'}</td>
                    <td style="text-align:right;">
                        <button class="btn-act btn-act-undo" onclick="restoreVoidedRecord('${v.id}')"><i class="fa-solid fa-trash-arrow-up"></i> Restore</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
        if (badge) badge.innerText = `${voidLogsList.length} Voided`;
    }

    // ১১. মাস্টার এক্সেল এক্সপোর্ট
    window.exportDataToExcel = function(type) {
        if (typeof XLSX === 'undefined') {
            alert("SheetJS library not loaded!");
            return;
        }

        let data = [];
        let fileName = "";

        if (type === 'pending') {
            fileName = "Pending_Clearance_List.xlsx";
            data.push(["Receipt No", "Date", "Student ID", "Student Name", "Class", "Tuition Fee", "Net Collected"]);
            feeTransactionsList.filter(t => t.status !== 'Paid').forEach(t => {
                data.push([t.receiptNo, t.date, t.customerId, t.studentName, t.class, t.netDue, t.netReceived]);
            });
        } else if (type === 'paid') {
            fileName = "Paid_Settlement_List.xlsx";
            data.push(["Receipt No", "Date", "Student ID", "Student Name", "Class", "Gross Payment", "Settled Time"]);
            feeTransactionsList.filter(t => t.status === 'Paid').forEach(t => {
                data.push([t.receiptNo, t.date, t.customerId, t.studentName, t.class, t.grossPayment, t.paidTimestamp]);
            });
        } else if (type === 'due') {
            fileName = "Master_Due_Database.xlsx";
            data.push(["STD ID", "Student Name", "Class", "Section", "Category", "Month Due", "Due Amount", "Mobile"]);
            studentDueList.forEach(s => {
                data.push([s.stdId, s.studentName, s.class, s.section, s.category, s.monthDue, s.dueAmount, s.mobile]);
            });
        } else if (type === 'void') {
            fileName = "Void_Audit_Log.xlsx";
            data.push(["Receipt No", "Void Date", "Student ID", "Student Name", "Amount", "Void Reason", "Voided By"]);
            voidLogsList.forEach(v => {
                data.push([v.receiptNo, v.voidDate, v.customerId, v.studentName, v.netReceived, v.voidReason, v.voidedBy]);
            });
        }

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, fileName);
    };

    // ১২. পেজিনেশন ও বকেয়া টেবিল
    function renderDueDataTable() {
        const tbody = document.getElementById('dueDataTableBody');
        const paginationBtns = document.getElementById('duePaginationBtns');
        if (!tbody) return;

        let filtered = studentDueList;
        if (currentSearchQuery) {
            const q = currentSearchQuery.toLowerCase();
            filtered = studentDueList.filter(item => 
                (item.studentName && item.studentName.toLowerCase().includes(q)) ||
                (item.stdId && item.stdId.toLowerCase().includes(q)) ||
                (item.class && item.class.toLowerCase().includes(q)) ||
                (item.mobile && item.mobile.toLowerCase().includes(q))
            );
        }

        const totalEntries = filtered.length;
        const effectivePageSize = rowsPerPage === -1 ? totalEntries : rowsPerPage;
        const totalPages = Math.max(1, Math.ceil(totalEntries / (effectivePageSize || 1)));

        if (currentPage > totalPages) currentPage = totalPages;
        const startIndex = (currentPage - 1) * effectivePageSize;
        const currentSlice = rowsPerPage === -1 ? filtered : filtered.slice(startIndex, startIndex + effectivePageSize);

        if (totalEntries === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:25px; color:#94a3b8;">No records found.</td></tr>`;
            if (paginationBtns) paginationBtns.innerHTML = '';
            return;
        }

        let html = '';
        currentSlice.forEach((item, index) => {
            html += `
                <tr>
                    <td style="font-weight:700; color:#64748b;">${startIndex + index + 1}</td>
                    <td>${item.class || '-'}</td>
                    <td>${item.section || '-'}</td>
                    <td><strong>${item.stdId || '-'}</strong></td>
                    <td>${item.studentName || '-'}</td>
                    <td>${item.monthDue || '-'}</td>
                    <td style="font-weight:800; color:#e11d48;">৳ ${item.dueAmount || 0}</td>
                    <td>${item.mobile || '-'}</td>
                </tr>
            `;
        });
        tbody.innerHTML = html;

        if (paginationBtns) {
            paginationBtns.innerHTML = '';
            if (totalPages > 1) {
                for (let i = 1; i <= Math.min(totalPages, 6); i++) {
                    const btn = document.createElement('button');
                    btn.className = `btn-act ${i === currentPage ? 'btn-act-print' : 'btn-act-undo'}`;
                    btn.innerText = i;
                    btn.onclick = () => { currentPage = i; renderDueDataTable(); };
                    paginationBtns.appendChild(btn);
                }
            }
        }
    }

    // ১৩. Firebase লিসেনার
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
            renderPendingTable();
            renderPaidTable();
        });

        fb.onValue(fb.ref(fb.db, 'erp/feeVoidLogs'), (snapshot) => {
            const data = snapshot.val();
            voidLogsList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            renderVoidTable();
        });
    }

    window.printRowReceipt = function(txId) {
        const tx = feeTransactionsList.find(t => t.id === txId);
        if (!tx) return;

        const receiptData = {
            receiptNo: tx.receiptNo || tx.id.replace(/\D/g, '').slice(-4) || '3410',
            date: formatDateToDDMMYYYY(tx.date),
            studentName: tx.studentName || '-',
            studentId: tx.customerId || '-',
            tuitionFee: parseFloat(tx.netDue||0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            charge: parseFloat(tx.totalCharge||0).toFixed(1),
            total: parseFloat(tx.netReceived||0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
            received: parseFloat(tx.netReceived||0).toString(),
            receivedBy: tx.receivedBy || (window.profileSettings && window.profileSettings.fullName) || 'Riyal Robiul'
        };

        window.openReceiptInNewTab(receiptData);
    };

    // ১৪. ফর্ম ও ইভেন্ট লজিক
    function initLogic() {
        const idInp = document.getElementById('origId');
        const nameInp = document.getElementById('origName');
        const dateInp = document.getElementById('origDate');
        const discInp = document.getElementById('origDisc');
        const txnInp = document.getElementById('origTxn');
        const alertBox = document.getElementById('adjustmentAlertBox');
        const alertTag = document.getElementById('adjustmentAmountTag');
        const alertText = document.getElementById('adjustmentDetailsText');

        if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];

        if (idInp) {
            idInp.addEventListener('input', function() {
                const val = this.value.trim();
                if (!val) {
                    selectedStudentRawDue = 0;
                    selectedStudentData = null;
                    if (nameInp) nameInp.value = '';
                    if (alertBox) alertBox.style.display = 'none';
                    calculateAutoValues();
                    return;
                }

                const dueFound = studentDueList.find(s => String(s.stdId).trim() === val || String(s.mobile).trim() === val);
                const prevPayments = feeTransactionsList.filter(t => String(t.customerId).trim() === val && t.status === 'Pending');
                let prevPaidSum = 0;
                prevPayments.forEach(p => prevPaidSum += (parseFloat(p.netDue) || 0));

                if (dueFound) {
                    selectedStudentData = dueFound;
                    const sheetDue = parseFloat(dueFound.dueAmount || 0);

                    if (prevPaidSum > 0) {
                        selectedStudentRawDue = Math.max(0, sheetDue - prevPaidSum);
                        if (alertBox && alertTag && alertText) {
                            alertBox.style.display = 'flex';
                            alertTag.innerText = `Adjusted: ৳ ${prevPaidSum.toFixed(2)}`;
                            alertText.innerText = `Sheet Due: ৳ ${sheetDue} | Previously Paid at Shop: ৳ ${prevPaidSum}`;
                        }
                    } else {
                        selectedStudentRawDue = sheetDue;
                        if (alertBox) alertBox.style.display = 'none';
                    }

                    if (nameInp) nameInp.value = dueFound.studentName || '';
                } else {
                    selectedStudentData = null;
                    selectedStudentRawDue = 0;
                    if (nameInp) nameInp.value = '';
                    if (alertBox) alertBox.style.display = 'none';
                }
                calculateAutoValues();
            });
        }

        if (discInp) discInp.addEventListener('input', calculateAutoValues);
        if (txnInp) txnInp.addEventListener('input', calculateAutoValues);

        // FORM SUBMIT
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
                    alert("Please enter valid student ID and amount!");
                    return;
                }

                if (typeof showLoader === 'function') showLoader("Saving fee record...");

                const percentCapCharge = Math.min(netDue * 0.01, 60);
                const calculatedGross = netDue + percentCapCharge;
                const receiptNumeric = (feeTransactionsList.length + voidLogsList.length + 1) + 3400;

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
                    status: 'Pending',
                    receivedBy: (window.profileSettings && window.profileSettings.fullName) || 'Riyal Robiul'
                };

                try {
                    const fb = await getFirebase();
                    if (fb) {
                        feeTransactionsList.unshift(txData);
                        await fb.set(fb.ref(fb.db, 'erp/feeTransactions'), feeTransactionsList);
                    }

                    if (typeof showToast === 'function') showToast("Fee collected successfully!", "success");

                    const receiptData = {
                        receiptNo: txData.receiptNo,
                        date: formatDateToDDMMYYYY(txData.date),
                        studentName: txData.studentName,
                        studentId: txData.customerId,
                        tuitionFee: netDue.toLocaleString('en-US', { minimumFractionDigits: 2 }),
                        charge: totalCharge.toFixed(1),
                        total: netReceived.toLocaleString('en-US', { minimumFractionDigits: 2 }),
                        received: netReceived.toString(),
                        receivedBy: txData.receivedBy
                    };

                    window.openReceiptInNewTab(receiptData);

                    this.reset();
                    selectedStudentRawDue = 0;
                    selectedStudentData = null;
                    if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];
                    if (txnInp) txnInp.value = "6.00";
                    if (alertBox) alertBox.style.display = 'none';
                    calculateAutoValues();
                } catch(err) { console.error(err); }
                if (typeof hideLoader === 'function') hideLoader();
            };
        }

        // EXCEL UPLOAD
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
                    if (typeof showToast === 'function') showToast("Please choose an Excel file!", "warning");
                    return;
                }

                const reader = new FileReader();
                reader.onload = async function(e) {
                    try {
                        const data = e.target.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });

                        const formatted = json.map(r => ({
                            class: r['Class'] || r['class'] || '-',
                            section: r['Section'] || r['section'] || '-',
                            stdId: String(r['STD ID'] || r['Std Id'] || r['Student ID'] || r['ID'] || '').trim(),
                            studentName: r['Student Name'] || r['Name'] || '-',
                            category: r['Category'] || '-',
                            monthDue: r['Month Due'] || r['Month'] || '-',
                            dueAmount: parseFloat(r['Due Amount'] || r['Amount'] || 0) || 0,
                            mobile: String(r['Mobile'] || '').trim()
                        }));

                        const fb = await getFirebase();
                        if (fb) {
                            await fb.set(fb.ref(fb.db, 'erp/studentDueData'), formatted);
                            studentDueList = formatted;
                            currentPage = 1;
                            renderDueDataTable();
                            if (typeof showToast === 'function') showToast(`✔ ${formatted.length} students loaded to Due Database!`, "success");
                        }
                    } catch(err) {
                        if (typeof showToast === 'function') showToast("Excel upload failed!", "error");
                    }
                };
                reader.readAsBinaryString(fileInput.files[0]);
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
    }

    window.addEventListener('load', () => {
        injectMenu();
        injectPanels();
        initLogic();
        listenFirebaseData();
    });
})();
