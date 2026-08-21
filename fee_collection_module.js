/**
 * Mousumi Computer ERP - Education & Digital Services Module
 * New Section: All Fee Records with Summary Card
 */

(function () {
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        #edu-module-wrapper, #edu-module-wrapper * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }

        /* সামারি কার্ড ডিজাইন */
        .edu-summary-card {
            background: #ffffff;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            padding: 15px 20px;
            margin-bottom: 20px;
            border-left: 4px solid #2563eb;
            display: inline-block;
            min-width: 280px;
        }
        .edu-summary-card span { font-size: 16px; color: #475569; }
        .edu-summary-card strong { font-size: 18px; color: #1e293b; margin-left: 10px; }

        /* মেইন রেকর্ড কার্ড */
        .edu-record-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            width: 100%;
            overflow: hidden;
            border: 1px solid #e1e4e8;
        }
        .edu-record-header {
            background-color: #34495e;
            color: #ffffff;
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .edu-record-header h2 { font-size: 19px !important; margin: 0; font-weight: 500; }
        .live-data-tag { font-size: 13px; color: #bdc3c7; font-style: italic; }

        /* বড় টেবিল ডিজাইন */
        .edu-table-container { padding: 20px; overflow-x: auto; }
        .edu-main-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
        .edu-main-table th {
            background: #f8fafc;
            color: #475569;
            font-size: 13px !important;
            padding: 12px 8px;
            border: 1px solid #e2e8f0;
            text-align: center;
            font-weight: 600;
        }
        .edu-main-table td {
            padding: 10px 8px;
            border: 1px solid #e2e8f0;
            font-size: 14px;
            text-align: center;
            color: #334155;
        }
        .no-data-msg { padding: 30px; text-align: center; color: #94a3b8; font-style: italic; font-size: 15px; }

        /* ইনপুট ফর্ম গ্রিড আপডেট (নতুন ফিল্ডের জন্য) */
        .edu-form-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 15px; }
        
        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    function injectSidebar() {
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
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    function injectPanels() {
        const wrapper = document.querySelector('.main-wrapper');
        if (!wrapper) return;

        const panelsHTML = `
            <div id="edu-module-wrapper">
                <!-- PANEL 1: FEE ENTRY FORM -->
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-card">
                        <div class="edu-card-header" style="background:#34495e; color:#fff; padding:15px 25px;">
                            <h2 style="margin:0; font-size:20px;">ফি কালেকশন মডিউল (Fee Collection)</h2>
                            <span style="font-family:Times New Roman; font-size:14px; opacity:0.7;">ERP v2.4</span>
                        </div>
                        <div class="edu-card-body" style="padding:25px;">
                            <form id="enhancedFeeForm">
                                <div class="edu-form-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; margin-bottom:20px;">
                                    <div class="edu-form-group"><label>তারিখ (Date)</label><input type="date" id="efDate" class="edu-form-control" required></div>
                                    <div class="edu-form-group"><label>স্টুডেন্ট আইডি (ID)</label><input type="text" id="efId" class="edu-form-control" placeholder="আইডি লিখুন" required></div>
                                    <div class="edu-form-group"><label>শিক্ষার্থীর নাম (Student Name)</label><input type="text" id="efName" class="edu-form-control" placeholder="নাম অটো আসবে"></div>
                                </div>
                                <div class="edu-form-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; margin-bottom:20px;">
                                    <div class="edu-form-group"><label>শ্রেণী (Class)</label><input type="text" id="efClass" class="edu-form-control" placeholder="যেমন: ১০ম"></div>
                                    <div class="edu-form-group"><label>মাস (Month)</label><input type="text" id="efMonth" class="edu-form-control" placeholder="জানুয়ারি"></div>
                                    <div class="edu-form-group"><label>ক্যাটাগরি (Category)</label><input type="text" id="efCat" class="edu-form-control" placeholder="বেতন / ফি"></div>
                                </div>
                                <div class="edu-form-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:20px; margin-bottom:20px;">
                                    <div class="edu-form-group"><label>বকেয়া (Net Due)</label><input type="text" id="efDue" class="edu-form-control" value="0.00" readonly></div>
                                    <div class="edu-form-group">
                                        <label>ট্রানজেকশন ফি (Txn Fee)</label>
                                        <input type="number" id="efTxn" class="edu-form-control" value="6.00">
                                        <div style="font-size:13px; color:#2563eb; margin-top:5px; font-weight:bold;">মোট চার্জ: ৳ <span id="efChargeDisp">6.00</span></div>
                                    </div>
                                    <div class="edu-form-group"><label>গৃহীত মোট টাকা (Net Received)</label><input type="number" id="efRec" class="edu-form-control" required></div>
                                </div>
                                <div class="edu-form-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:20px; margin-bottom:20px;">
                                    <div class="edu-form-group"><label>ছাড় (Discount)</label><input type="number" id="efDisc" class="edu-form-control" value="0.00"></div>
                                    <div class="edu-form-group"><label>মন্তব্য (Remarks)</label><input type="text" id="efRem" class="edu-form-control" placeholder="..."></div>
                                </div>
                                <div style="text-align:right;"><button type="submit" class="edu-btn-submit" style="background:#2563eb; color:#fff; border:none; padding:10px 30px; border-radius:5px; cursor:pointer; font-weight:bold;">সাবমিট করুন</button></div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- PANEL 2: ALL FEE RECORDS (আপনার নতুন স্ক্রিনশট অনুযায়ী) -->
                <div class="view-panel" id="edu-fee-records-view">
                    <div class="edu-summary-card">
                        <span>সর্বমোট এন্ট্রি টাকা (Total Received):</span>
                        <strong>৳ <span id="totalFeeRecDisp">0.00</span></strong>
                    </div>

                    <div class="edu-record-card">
                        <div class="edu-record-header">
                            <h2>সকল জমা হওয়া ফি তালিকা (All Fee Records)</h2>
                            <span class="live-data-tag">Live Data</span>
                        </div>
                        <div class="edu-table-container">
                            <table class="edu-main-table">
                                <thead>
                                    <tr>
                                        <th>SL</th><th>Date</th><th>Student Name</th><th>Id</th><th>Class</th><th>Month</th>
                                        <th>Category</th><th>Mobile</th><th>Net Due</th><th>Txn Fee</th><th>Total Charge</th>
                                        <th>Net Received</th><th>Gross Payment</th><th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody id="eduAllRecordsBody">
                                    <!-- Data will be loaded here -->
                                </tbody>
                            </table>
                            <div id="noDataArea" class="no-data-msg">এখনও কোনো ডেটা জমা হয়নি</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', panelsHTML);
    }

    function initLogic() {
        const idInp = document.getElementById('efId');
        const dateInp = document.getElementById('efDate');
        dateInp.value = new Date().toISOString().split('T')[0];

        idInp.addEventListener('input', function() {
            const val = this.value.trim();
            const customers = window.customers || [];
            const found = customers.find(c => c.id === val || c.phone === val);
            if(found) {
                document.getElementById('efName').value = found.name;
                if(window.calculateCustomerCurrentDue) {
                    document.getElementById('efDue').value = window.calculateCustomerCurrentDue(found.id).toFixed(2);
                }
            }
        });

        document.getElementById('efTxn').oninput = function() {
            document.getElementById('efChargeDisp').innerText = (parseFloat(this.value) || 0).toFixed(2);
        };

        document.getElementById('enhancedFeeForm').onsubmit = async function(e) {
            e.preventDefault();
            const rec = parseFloat(document.getElementById('efRec').value) || 0;
            const txn = parseFloat(document.getElementById('efTxn').value) || 0;
            const studentId = idInp.value;

            if(rec <= 0 || !studentId) return alert("সঠিক তথ্য দিন!");

            showLoader("সংরক্ষণ করা হচ্ছে...");
            
            const cust = (window.customers || []).find(c => c.id === studentId);
            const txData = {
                id: 'EDU-' + Date.now(),
                customerId: studentId,
                studentName: document.getElementById('efName').value,
                class: document.getElementById('efClass').value,
                month: document.getElementById('efMonth').value,
                category: document.getElementById('efCat').value,
                mobile: cust ? cust.phone : 'N/A',
                netDue: parseFloat(document.getElementById('efDue').value) || 0,
                txnFee: txn,
                totalCharge: txn, // ছবিতে যা আছে
                credit: rec,
                netReceived: rec,
                grossPayment: rec + txn,
                remarks: document.getElementById('efRem').value,
                type: 'Credit',
                debit: 0,
                date: dateInp.value,
                time: new Date().toLocaleTimeString()
            };

            try {
                if(window.customerTransactions) {
                    window.customerTransactions.push(txData);
                    const db = window.getDatabase();
                    const { ref, set } = window.firebase_database;
                    await set(ref(db, 'transactions'), window.customerTransactions);
                    
                    showToast("রেকর্ড সংরক্ষিত হয়েছে!", "success");
                    this.reset();
                    dateInp.value = new Date().toISOString().split('T')[0];
                    renderRecordsTable();
                }
            } catch(err) { console.error(err); }
            hideLoader();
        };
    }

    function renderRecordsTable() {
        const body = document.getElementById('eduAllRecordsBody');
        const noData = document.getElementById('noDataArea');
        if(!body) return;

        const eduTxs = (window.customerTransactions || []).filter(t => t.id && t.id.startsWith('EDU-'));
        body.innerHTML = '';
        
        if(eduTxs.length === 0) {
            noData.style.display = 'block';
            return;
        }
        noData.style.display = 'none';

        let totalRec = 0;
        eduTxs.reverse().forEach((t, index) => {
            totalRec += (parseFloat(t.netReceived) || 0);
            const row = `
                <tr>
                    <td>${eduTxs.length - index}</td>
                    <td>${t.date}</td>
                    <td>${t.studentName || '-'}</td>
                    <td>${t.customerId}</td>
                    <td>${t.class || '-'}</td>
                    <td>${t.month || '-'}</td>
                    <td>${t.category || '-'}</td>
                    <td>${t.mobile || '-'}</td>
                    <td>${(t.netDue || 0).toFixed(2)}</td>
                    <td>${(t.txnFee || 0).toFixed(2)}</td>
                    <td>${(t.totalCharge || 0).toFixed(2)}</td>
                    <td style="font-weight:bold;">${(t.netReceived || 0).toFixed(2)}</td>
                    <td style="font-weight:bold; color:#2563eb;">${(t.grossPayment || 0).toFixed(2)}</td>
                    <td>${t.remarks || '-'}</td>
                </tr>
            `;
            body.insertAdjacentHTML('beforeend', row);
        });
        document.getElementById('totalFeeRecDisp').innerText = totalRec.toLocaleString('en-US', {minimumFractionDigits:2});
    }

    window.addEventListener('load', () => {
        injectSidebar();
        injectPanels();
        initLogic();
        // ডাটা লোড হওয়ার জন্য একটু সময় দেওয়া
        setTimeout(renderRecordsTable, 2000);
    });

    // গ্লোবাল ফাংশন থেকে কল করার জন্য
    window.refreshEduRecords = renderRecordsTable;
})();
