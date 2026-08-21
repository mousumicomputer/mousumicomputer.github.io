/**
 * Mousumi Computer ERP - Education & Digital Services Module
 * Reverted Section 1 to User's Exact HTML & Added Section 2 as requested.
 */

(function () {
    // ১. CSS ইনজেক্ট করা (কালপুরুষ ও টাইমস নিউ রোমান ফন্ট এবং আপনার অরিজিনাল লেআউট)
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        #edu-module-container, #edu-module-container * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }

        /* --- SECTION 1 STYLE (User Original HTML Design) --- */
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
        .edu-form-control[readonly] { background-color: #f8f9fa; color: #6c757d; border-color: #e9ecef; }
        .edu-sub-text { font-size: 13px !important; color: #2563eb !important; margin-top: 5px; font-weight: bold !important; }
        .edu-btn-submit { background-color: #2563eb; color: white !important; border: none; padding: 10px 28px; font-size: 16px !important; font-weight: bold !important; border-radius: 5px; cursor: pointer; }
        .edu-recent-section { margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; }
        .edu-recent-title { font-size: 13px !important; color: #64748b !important; font-weight: bold !important; margin-bottom: 8px; display: flex; justify-content: space-between; }
        .edu-compact-table { width: 100%; border-collapse: collapse; font-size: 13px !important; }
        .edu-compact-table th, .edu-compact-table td { padding: 6px 10px; text-align: left; border-bottom: 1px solid #f1f5f9; }

        /* --- SECTION 2 STYLE (New All Fee Records) --- */
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
        .records-main-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 13px !important; }
        .records-main-table th { background: #f8fafc; color: #475569; padding: 10px; border: 1px solid #e2e8f0; text-align: center; }
        .records-main-table td { padding: 8px; border: 1px solid #e2e8f0; text-align: center; color: #334155; }

        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ২. সাইডবার সাব-মেনু
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
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    // ৩. ভিউ প্যানেল ইনজেক্ট করা
    function injectPanels() {
        const wrapper = document.querySelector('.main-wrapper');
        if (!wrapper) return;

        const panelsHTML = `
            <div id="edu-module-container">
                <!-- প্যানেল ১: আপনার দেওয়া এইচটিএমএল ডিজাইনের ফি এন্ট্রি ফর্ম -->
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
                                        <input type="text" id="origId" class="edu-form-control" placeholder="আইডি লিখুন" required>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>শিক্ষার্থীর নাম (Student Name)</label>
                                        <input type="text" id="origName" class="edu-form-control" placeholder="শিক্ষার্থীর নাম">
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>বকেয়া (Net Due)</label>
                                        <input type="text" id="origDue" class="edu-form-control" value="0.00" readonly>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>ট্রানজেকশন ফি (Txn Fee)</label>
                                        <input type="number" id="origTxn" class="edu-form-control" value="6.00">
                                        <span class="edu-sub-text">মোট চার্জ (Total Charge): ৳ <span id="origCharge">6.00</span></span>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>গৃহীত মোট টাকা (Net Received)</label>
                                        <input type="number" id="origRec" class="edu-form-control" placeholder="0.00" required>
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>ছাড় (Discount)</label>
                                        <input type="number" id="origDisc" class="edu-form-control" value="0.00">
                                    </div>
                                </div>
                                <div style="display:flex; justify-content:flex-end;">
                                    <button type="submit" class="edu-btn-submit">সাবমিট করুন</button>
                                </div>
                            </form>
                            <div class="edu-recent-section">
                                <div class="edu-recent-title"><span>সর্বশেষ এন্ট্রি (Recent Entries)</span><span>সর্বোচ্চ ৩টি</span></div>
                                <table class="edu-compact-table">
                                    <thead><tr><th>তারিখ</th><th>আইডি</th><th>নাম</th><th>গৃহীত টাকা</th></tr></thead>
                                    <tbody id="origRecentBody"><tr><td colspan="4" style="text-align:center; color:#999; padding:15px;">কোনো রিসেন্ট এন্ট্রি নেই</td></tr></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- প্যানেল ২: সকল ফি রেকর্ডস সেকশন (নতুন ডিজাইন) -->
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
                                        <th>Net Received</th><th>Gross Payment</th><th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody id="allRecordsTableBody">
                                    <tr><td colspan="14" style="padding:20px; color:#999;">এখনও কোনো ডেটা জমা হয়নি</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', panelsHTML);
    }

    // ৪. লজিক (অরিজিনাল এইচটিএমএল লজিক অনুযায়ী)
    function initLogic() {
        const idInp = document.getElementById('origId');
        const dateInp = document.getElementById('origDate');
        dateInp.value = new Date().toISOString().split('T')[0];

        idInp.addEventListener('input', function() {
            const val = this.value.trim();
            const customers = window.customers || [];
            const found = customers.find(c => c.id === val || c.phone === val);
            if(found) {
                document.getElementById('origName').value = found.name;
                if(window.calculateCustomerCurrentDue) {
                    document.getElementById('origDue').value = window.calculateCustomerCurrentDue(found.id).toFixed(2);
                }
            }
        });

        document.getElementById('feeFormOriginal').onsubmit = async function(e) {
            e.preventDefault();
            const rec = parseFloat(document.getElementById('origRec').value) || 0;
            const txn = parseFloat(document.getElementById('origTxn').value) || 0;
            const studentId = idInp.value;

            if(rec <= 0 || !studentId) return alert("তথ্য সঠিক নয়!");

            showLoader("সংরক্ষণ করা হচ্ছে...");
            const txData = {
                id: 'EDU-' + Date.now(),
                customerId: studentId,
                studentName: document.getElementById('origName').value,
                credit: rec,
                netReceived: rec,
                txnFee: txn,
                grossPayment: rec + txn,
                date: dateInp.value,
                time: new Date().toLocaleTimeString(),
                type: 'Credit'
            };

            try {
                if(window.customerTransactions) {
                    window.customerTransactions.push(txData);
                    const db = window.getDatabase();
                    const { ref, set } = window.firebase_database;
                    await set(ref(db, 'transactions'), window.customerTransactions);
                    
                    showToast("ফি জমা হয়েছে!", "success");
                    updateRecent(txData);
                    this.reset();
                    dateInp.value = new Date().toISOString().split('T')[0];
                    renderFullTable();
                }
            } catch(err) { console.error(err); }
            hideLoader();
        };
    }

    function updateRecent(t) {
        const body = document.getElementById('origRecentBody');
        const row = `<tr><td>${t.date}</td><td>${t.customerId}</td><td>${t.studentName || '-'}</td><td>৳ ${t.credit.toFixed(2)}</td></tr>`;
        if(body.innerText.includes("কোনো রিসেন্ট এন্ট্রি নেই")) body.innerHTML = "";
        body.insertAdjacentHTML('afterbegin', row);
        if (body.children.length > 3) body.removeChild(body.lastChild);
    }

    function renderFullTable() {
        const body = document.getElementById('allRecordsTableBody');
        if(!body) return;
        const eduTxs = (window.customerTransactions || []).filter(t => t.id && t.id.startsWith('EDU-'));
        body.innerHTML = '';
        let total = 0;
        eduTxs.reverse().forEach((t, i) => {
            total += (parseFloat(t.netReceived) || 0);
            body.innerHTML += `
                <tr>
                    <td>${eduTxs.length - i}</td><td>${t.date}</td><td>${t.studentName || '-'}</td><td>${t.customerId}</td>
                    <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>${(t.txnFee || 0).toFixed(2)}</td>
                    <td>${(t.txnFee || 0).toFixed(2)}</td><td>${(t.netReceived || 0).toFixed(2)}</td>
                    <td style="color:#2563eb; font-weight:bold;">${(t.grossPayment || 0).toFixed(2)}</td><td>-</td>
                </tr>`;
        });
        document.getElementById('totalFeeSum').innerText = total.toLocaleString('en-US', {minimumFractionDigits:2});
    }

    window.addEventListener('load', () => {
        injectMenu();
        injectPanels();
        initLogic();
        setTimeout(renderFullTable, 2000);
    });
})();
