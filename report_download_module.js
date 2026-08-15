/**
 * ============================================================================
 * MOUSUMI COMPUTER ERP - DEDICATED REPORT DOWNLOAD CENTER
 * File: report_download_module.js
 * 
 * Concept: Minimalist, clean, monochrome & structured UI in English.
 * Does not overwrite or conflict with any existing modules.
 * ============================================================================
 */

(function () {
    // ১. ক্লিন ও প্রফেশনাল সিএসএস স্টাইল ইনজেকশন
    const downloadModuleStyles = `
        <style id="custom-download-module-styles">
            /* Main Wrapper */
            .rpt-center-wrap {
                max-width: 1050px;
                margin: 0 auto;
                font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #1e293b;
            }

            /* Card Container */
            .rpt-box {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 24px;
                margin-bottom: 24px;
            }

            .rpt-box-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #f1f5f9;
                padding-bottom: 14px;
                margin-bottom: 20px;
            }

            .rpt-box-header h3 {
                font-size: 1.15rem;
                font-weight: 700;
                color: #0f172a;
                margin: 0;
            }

            .rpt-box-header span {
                font-size: 0.82rem;
                color: #64748b;
            }

            /* Grid Layout */
            .rpt-filter-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 16px;
                margin-bottom: 18px;
            }

            .rpt-control-group {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .rpt-control-group label {
                font-size: 0.8rem;
                font-weight: 600;
                color: #475569;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .rpt-inp, .rpt-sel {
                width: 100%;
                height: 42px;
                padding: 0 12px;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                font-size: 0.9rem;
                color: #1e293b;
                background-color: #ffffff;
                outline: none;
                transition: border-color 0.2s;
            }

            .rpt-inp:focus, .rpt-sel:focus {
                border-color: #0f172a;
            }

            /* Date Range Shortcuts */
            .rpt-quick-dates {
                display: flex;
                align-items: center;
                gap: 8px;
                flex-wrap: wrap;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px dashed #e2e8f0;
            }

            .rpt-quick-dates span {
                font-size: 0.8rem;
                font-weight: 600;
                color: #64748b;
                margin-right: 4px;
            }

            .rpt-pill-btn {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                padding: 6px 14px;
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 600;
                color: #475569;
                cursor: pointer;
                transition: all 0.15s;
            }

            .rpt-pill-btn:hover, .rpt-pill-btn.active {
                background: #0f172a;
                color: #ffffff;
                border-color: #0f172a;
            }

            /* Action Buttons */
            .rpt-action-bar {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }

            .rpt-btn-base {
                height: 40px;
                padding: 0 18px;
                border-radius: 8px;
                font-size: 0.88rem;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.2s;
                border: 1px solid transparent;
            }

            .rpt-btn-dark {
                background: #0f172a;
                color: #ffffff;
            }

            .rpt-btn-dark:hover {
                background: #334155;
            }

            .rpt-btn-light {
                background: #ffffff;
                color: #334155;
                border-color: #cbd5e1;
            }

            .rpt-btn-light:hover {
                background: #f8fafc;
                border-color: #94a3b8;
            }

            .rpt-btn-clear {
                background: transparent;
                color: #64748b;
                border: none;
            }

            .rpt-btn-clear:hover {
                color: #0f172a;
                text-decoration: underline;
            }

            /* Clean Monochrome Preview Area */
            .rpt-preview-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 30px;
                min-height: 420px;
            }

            .rpt-sheet {
                border: 1px solid #e2e8f0;
                padding: 35px;
                background: #ffffff;
                border-radius: 4px;
            }

            .rpt-placeholder-state {
                text-align: center;
                padding: 60px 20px;
                color: #94a3b8;
            }

            .rpt-placeholder-state i {
                font-size: 2.8rem;
                color: #cbd5e1;
                margin-bottom: 12px;
            }

            .rpt-placeholder-state h4 {
                font-size: 1.05rem;
                color: #475569;
                margin-bottom: 4px;
            }

            .rpt-placeholder-state p {
                font-size: 0.85rem;
                color: #94a3b8;
            }
        </style>
    `;

    // ২. সাইডবারে নতুন "Report Download" মেনু যুক্ত করা
    function injectModuleMenu() {
        const sidebarList = document.querySelector('.sidebar .menu-list');
        if (!sidebarList || document.getElementById('menu-download-hub')) return;

        const li = document.createElement('li');
        li.className = 'menu-item';
        li.id = 'menu-download-hub';
        li.innerHTML = `
            <a onclick="window.switchMainTab('report-download-hub')">
                <span class="menu-link-inner"><i class="fa-solid fa-cloud-arrow-down"></i> <span>Download Reports</span></span>
            </a>
        `;

        const settingsMenu = document.getElementById('menu-settings-parent');
        if (settingsMenu) {
            sidebarList.insertBefore(li, settingsMenu);
        } else {
            sidebarList.appendChild(li);
        }
    }

    // ৩. রিপোর্ট ডাউনলোড ভিউ প্যানেল তৈরি করা
    function injectModuleView() {
        const wrapper = document.querySelector('.main-wrapper');
        if (!wrapper || document.getElementById('report-download-hub-view')) return;

        const panel = document.createElement('div');
        panel.className = 'view-panel';
        panel.id = 'report-download-hub-view';

        panel.innerHTML = `
            <div class="rpt-center-wrap">
                
                <!-- FILTER & CONFIGURATION BOX -->
                <div class="rpt-box">
                    <div class="rpt-box-header">
                        <div>
                            <h3>Report Download Center</h3>
                            <span>Select statement parameters to generate, preview, and download</span>
                        </div>
                    </div>

                    <div class="rpt-filter-grid">
                        
                        <!-- Report Type Dropdown -->
                        <div class="rpt-control-group" style="grid-column: span 2;">
                            <label>Report Type</label>
                            <select id="hubReportType" class="rpt-sel">
                                <option value="" disabled selected>-- Select Report to Download --</option>
                                <optgroup label="Financial & Daily Closings">
                                    <option value="daily_closing">Daily Closing Statement</option>
                                    <option value="overall_balance_sheet">All Accounts Balance Sheet</option>
                                    <option value="cash_flow">Cash Inflow & Outflow Summary</option>
                                </optgroup>
                                <optgroup label="Customer & Receivable">
                                    <option value="all_dues">Customer Outstanding Due Report</option>
                                    <option value="customer_statement">Individual Customer Statement</option>
                                    <option value="collection_summary">Daily / Periodic Collection Report</option>
                                </optgroup>
                                <optgroup label="Inventories">
                                    <option value="card_inventory">Card Inventory Audit Report</option>
                                    <option value="cash_inventory">Physical Cash Denomination Report</option>
                                </optgroup>
                            </select>
                        </div>

                        <!-- From Date -->
                        <div class="rpt-control-group">
                            <label>From Date</label>
                            <input type="date" id="hubFromDate" class="rpt-inp" />
                        </div>

                        <!-- To Date -->
                        <div class="rpt-control-group">
                            <label>To Date</label>
                            <input type="date" id="hubToDate" class="rpt-inp" />
                        </div>

                    </div>

                    <!-- Quick Date Presets -->
                    <div class="rpt-quick-dates">
                        <span>Preset:</span>
                        <button type="button" class="rpt-pill-btn active" onclick="window.hubDateShortcut('today')">Today</button>
                        <button type="button" class="rpt-pill-btn" onclick="window.hubDateShortcut('yesterday')">Yesterday</button>
                        <button type="button" class="rpt-pill-btn" onclick="window.hubDateShortcut('last7')">Last 7 Days</button>
                        <button type="button" class="rpt-pill-btn" onclick="window.hubDateShortcut('thismonth')">This Month</button>
                        <button type="button" class="rpt-pill-btn" onclick="window.hubDateShortcut('lastmonth')">Last Month</button>
                        <button type="button" class="rpt-pill-btn" onclick="window.hubDateShortcut('all')">All Time</button>
                    </div>

                    <!-- Action Buttons -->
                    <div class="rpt-action-bar">
                        <button type="button" class="rpt-btn-base rpt-btn-clear" onclick="window.hubReset()">
                            <i class="fa-solid fa-arrow-rotate-left"></i> Reset
                        </button>
                        <button type="button" class="rpt-btn-base rpt-btn-dark" onclick="window.hubPreview()">
                            <i class="fa-solid fa-magnifying-glass"></i> Generate Preview
                        </button>
                        <button type="button" class="rpt-btn-base rpt-btn-light" onclick="window.hubDownloadPDF()">
                            <i class="fa-solid fa-file-pdf" style="color:#ef4444;"></i> Download PDF
                        </button>
                        <button type="button" class="rpt-btn-base rpt-btn-light" onclick="window.hubExportExcel()">
                            <i class="fa-solid fa-file-excel" style="color:#10b981;"></i> Export Excel
                        </button>
                    </div>

                </div>

                <!-- PREVIEW CANVAS (A4 READY CONTAINER) -->
                <div class="rpt-preview-card">
                    <div class="rpt-sheet" id="hub-report-print-area">
                        <div class="rpt-placeholder-state">
                            <i class="fa-regular fa-file-lines"></i>
                            <h4>Report Ready for Generation</h4>
                            <p>Select your desired report type and date range above, then click <strong>Generate Preview</strong>.</p>
                        </div>
                    </div>
                </div>

            </div>
        `;

        wrapper.appendChild(panel);
    }

    // ৪. তারিখ শর্টকাট হ্যান্ডলার
    window.hubDateShortcut = function (preset) {
        document.querySelectorAll('.rpt-pill-btn').forEach(b => b.classList.remove('active'));
        if (event && event.target) event.target.classList.add('active');

        const fromInp = document.getElementById('hubFromDate');
        const toInp = document.getElementById('hubToDate');
        const now = new Date();
        const fmt = d => d.toISOString().split('T')[0];

        const today = fmt(now);

        if (preset === 'today') {
            fromInp.value = today;
            toInp.value = today;
        } else if (preset === 'yesterday') {
            const y = new Date();
            y.setDate(y.getDate() - 1);
            fromInp.value = fmt(y);
            toInp.value = fmt(y);
        } else if (preset === 'last7') {
            const d = new Date();
            d.setDate(d.getDate() - 6);
            fromInp.value = fmt(d);
            toInp.value = today;
        } else if (preset === 'thismonth') {
            fromInp.value = fmt(new Date(now.getFullYear(), now.getMonth(), 1));
            toInp.value = today;
        } else if (preset === 'lastmonth') {
            fromInp.value = fmt(new Date(now.getFullYear(), now.getMonth() - 1, 1));
            toInp.value = fmt(new Date(now.getFullYear(), now.getMonth(), 0));
        } else if (preset === 'all') {
            fromInp.value = '';
            toInp.value = '';
        }
    };

    // ৫. বেসিক বাটন ইভেন্ট (শুধুমাত্র ডিজাইন ট্রিগার)
    window.hubReset = function () {
        document.getElementById('hubReportType').selectedIndex = 0;
        window.hubDateShortcut('today');
        document.getElementById('hub-report-print-area').innerHTML = `
            <div class="rpt-placeholder-state">
                <i class="fa-regular fa-file-lines"></i>
                <h4>Report Ready for Generation</h4>
                <p>Select your desired report type and date range above, then click <strong>Generate Preview</strong>.</p>
            </div>
        `;
    };

    window.hubPreview = function () {
        const type = document.getElementById('hubReportType').value;
        const from = document.getElementById('hubFromDate').value || 'Start';
        const to = document.getElementById('hubToDate').value || 'End';

        if (!type) {
            if (typeof window.showToast === 'function') {
                window.showToast("Please select a report type first.", "warning");
            } else {
                alert("Please select a report type!");
            }
            return;
        }

        const area = document.getElementById('hub-report-print-area');
        area.innerHTML = `
            <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 1.3rem; text-transform: uppercase; color: #0f172a;">MOUSUMI COMPUTER</h2>
                <h4 style="margin: 4px 0; font-size: 1rem; color: #334155; text-transform: uppercase;">${type.replace(/_/g, ' ')}</h4>
                <p style="margin: 0; font-size: 0.8rem; color: #64748b;">Period: <strong>${from}</strong> to <strong>${to}</strong> | Generated: ${new Date().toLocaleString()}</p>
            </div>
            <div style="padding: 30px; text-align: center; color: #64748b; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">
                <i class="fa-solid fa-table" style="font-size: 2rem; margin-bottom: 10px; color: #94a3b8; display: block;"></i>
                <strong>UI Design Loaded Successfully</strong>
                <p style="font-size: 0.85rem; margin-top: 5px;">Ready to connect with your specified report data and columns.</p>
            </div>
        `;

        if (typeof window.showToast === 'function') {
            window.showToast("Layout preview generated.", "info");
        }
    };

    window.hubDownloadPDF = function () {
        if (typeof window.showToast === 'function') {
            window.showToast("PDF generator will trigger with your chosen report.", "info");
        }
    };

    window.hubExportExcel = function () {
        if (typeof window.showToast === 'function') {
            window.showToast("Excel exporter will trigger with your chosen report.", "info");
        }
    };

    // ৬. সেলফ ইনিশিয়ালাইজেশন
    function initDownloadModule() {
        document.head.insertAdjacentHTML('beforeend', downloadModuleStyles);
        injectModuleMenu();
        injectModuleView();
        window.hubDateShortcut('today');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDownloadModule);
    } else {
        initDownloadModule();
    }
})();
