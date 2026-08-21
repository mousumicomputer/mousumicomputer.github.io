/**
 * Mousumi Computer ERP - Education & Digital Services Module
 * Exact Recreation from User Provided HTML Design
 */

(function () {
    // ১. আপনার দেয়া HTML থেকে CSS ইনজেক্ট করা
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        .edu-wrapper { font-family: 'Kalpurush', 'Times New Roman', serif; padding: 10px; }
        
        .edu-card {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            width: 100%;
            max-width: 950px;
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

        .edu-card-header h2 { font-size: 20px; font-weight: 600; margin: 0; }

        .edu-badge {
            background: #2c3e50;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 14px;
            color: #bdc3c7;
            font-family: 'Times New Roman', serif;
        }

        .edu-card-body { padding: 25px; }

        .edu-form-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }

        .edu-form-group { display: flex; flex-direction: column; }

        .edu-form-group label {
            font-size: 15px;
            color: #444;
            margin-bottom: 6px;
            font-weight: 600;
        }

        .edu-form-control {
            padding: 10px 12px;
            border: 1px solid #cccccc;
            border-radius: 5px;
            font-size: 16px;
            font-family: 'Kalpurush', 'Times New Roman', serif;
            outline: none;
            transition: border-color 0.2s;
        }

        .edu-form-control:focus { border-color: #2563eb; }

        .edu-form-control[readonly] { background-color: #f8f9fa; color: #6c757d; border-color: #e9ecef; }

        .edu-sub-text {
            font-size: 13px;
            color: #2563eb;
            margin-top: 5px;
            font-weight: bold;
        }

        .edu-action-box { display: flex; justify-content: flex-end; margin-top: 10px; }

        .edu-btn-submit {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 10px 35px;
            font-size: 16px;
            font-family: 'Kalpurush', sans-serif;
            font-weight: bold;
            border-radius: 5px;
            cursor: pointer;
        }

        .edu-recent-section {
            margin-top: 25px;
            padding-top: 15px;
            border-top: 1px dashed #cbd5e1;
        }

        .edu-recent-title {
            font-size: 13px;
            color: #64748b;
            font-weight: bold;
            margin-bottom: 8px;
            display: flex;
            justify-content: space-between;
        }

        .edu-compact-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .edu-compact-table th, .edu-compact-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #f1f5f9; }
        .edu-compact-table th { color: #475569; background-color: #f8fafc; font-weight: 600; }
        
        /* মেনু ড্রপডাউন কন্ট্রোল */
        #menu-edu-parent .submenu-list { display: none; }
        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ২. সাইডবার মেনু ইনজেক্ট করা (শিক্ষা ও ডিজিটাল সেবা নামে)
    function injectSidebar() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList) return;

        const eduMenu = `
            <li class="menu-item" id="menu-edu-parent">
                <a onclick="this.parentElement.classList.toggle('open')">
                    <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>শিক্ষা ও ডিজিটাল সেবা</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon" style="font-size: 0.7rem;"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item" id="sub-fee-collection">
                        <a onclick="switchMainTab('edu-fee-collection')">
                            <i class="fa-solid fa-angle-right"></i> <span>ফি কালেকশন (Fees)</span>
                        </a>
                    </li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', eduMenu);
    }

    // ৩. আপনার পাঠানো HTML স্ট্রাকচার অনুযায়ী ভিউ প্যানেল তৈরি
    function injectViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        const html = `
            <div class="view-panel" id="edu-fee-collection-view">
                <div class="edu-wrapper">
                    <div class="edu-card">
                        <div class="edu-card-header">
                            <h2>ফি কালেকশন মডিউল (Fee Collection)</h2>
                            <span class="edu-badge">ERP v2.4</span>
                        </div>
                        <div class="edu-card-body">
                            <form id="exactFeeForm">
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>তারিখ (Date)</label>
                                        <input type="date" id="exDate" class="edu-form-control" required>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>স্টুডেন্ট আইডি (ID)</label>
                                        <input type="text" id="exStudentId" class="edu-form-control" placeholder="আইডি লিখুন" required>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>শিক্ষার্থীর নাম (Student Name)</label>
                                        <input type="text" id="exStudentName" class="edu-form-control" placeholder="আব্দুর রহমান">
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>বকেয়া (Net Due)</label>
                                        <input type="text" id="exNetDue" class="edu-form-control" value="0.00" readonly>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>ট্রানজেকশন ফি (Txn Fee)</label>
                                        <input type="number" id="exTxnFee" class="edu-form-control" value="6.00" step="0.01">
                                        <span class="edu-sub-text">মোট চার্জ (Total Charge): ৳ <span id="exChargeDisp">6.00</span></span>
                                    </div>
                                    <div class="edu-form-group">
                                        <label>গৃহীত মোট টাকা (Net Received)</label>
                                        <input type="number" id="exReceived" class="edu-form-control" placeholder="0.00" step="0.01" required>
                                    </div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group">
                                        <label>ছাড় (Discount)</label>
                                        <input type="number" id="exDiscount" class="edu-form-control" value="0.00" step="0.01">
                                    </div>
                                </div>
                                <div class="edu-action-box">
                                    <button type="submit" class="edu-btn-submit">সাবমিট করুন</button>
                                </div>
                            </form>

                            <div class="edu-recent-section">
                                <div class="edu-recent-title">
                                    <span>সর্বশেষ এন্ট্রি (Recent Entries)</span>
                                    <span>সর্বোচ্চ ৩টি</span>
                                </div>
                                <table class="edu-compact-table">
                                    <thead>
                                        <tr>
                                            <th>তারিখ</th>
                                            <th>আইডি</th>
                                            <th>নাম</th>
                                            <th>গৃহীত টাকা</th>
                                        </tr>
                                    </thead>
                                    <tbody id="exRecentList">
                                        <tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:15px;">কোনো রিসেন্ট এন্ট্রি নেই</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.insertAdjacentHTML('beforeend', html);
    }

    // ৪. লজিক ও ডেটাবেস হ্যান্ডলিং
    function initLogic() {
        const idInput = document.getElementById('exStudentId');
        const dateInput = document.getElementById('exDate');
        dateInput.value = new Date().toISOString().split('T')[0];

        // আইডি দিয়ে সার্চ করে নাম ও বকেয়া আনা
        idInput.addEventListener('input', function() {
            const val = this.value.trim();
            const customers = window.customers || [];
            const found = customers.find(c => c.id === val || c.phone === val);
            if(found) {
                document.getElementById('exStudentName').value = found.name;
                if(window.calculateCustomerCurrentDue) {
                    document.getElementById('exNetDue').value = window.calculateCustomerCurrentDue(found.id).toFixed(2);
                }
            } else {
                document.getElementById('exStudentName').value = "";
                document.getElementById('exNetDue').value = "0.00";
            }
        });

        // চার্জ ডিসপ্লে আপডেট
        document.getElementById('exTxnFee').oninput = function() {
            document.getElementById('exChargeDisp').innerText = (parseFloat(this.value) || 0).toFixed(2);
        };

        // ফর্ম সাবমিশন
        document.getElementById('exactFeeForm').onsubmit = async function(e) {
            e.preventDefault();
            const received = parseFloat(document.getElementById('exReceived').value) || 0;
            const studentId = idInput.value;

            if(received <= 0 || !studentId) return alert("তথ্য সঠিক নয়!");

            showLoader("সংরক্ষণ করা হচ্ছে...");
            
            const txData = {
                id: 'EDU-' + Date.now(),
                customerId: studentId,
                type: 'Credit',
                credit: received,
                debit: 0,
                date: dateInput.value,
                time: new Date().toLocaleTimeString(),
                description: "Education Fee Received"
            };

            try {
                if(window.customerTransactions) {
                    window.customerTransactions.push(txData);
                    const db = window.getDatabase();
                    const { ref, set } = window.firebase_database;
                    await set(ref(db, 'transactions'), window.customerTransactions);
                    
                    showToast("ফি সফলভাবে গ্রহণ করা হয়েছে!", "success");
                    updateUI(txData);
                    this.reset();
                    dateInput.value = new Date().toISOString().split('T')[0];
                }
            } catch(err) { console.error(err); }
            hideLoader();
        };
    }

    function updateUI(entry) {
        const list = document.getElementById('exRecentList');
        const name = document.getElementById('exStudentName').value || "Unknown Student";
        const row = `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.customerId}</td>
                <td>${name}</td>
                <td><strong>৳ ${entry.credit.toFixed(2)}</strong></td>
            </tr>
        `;
        if(list.innerText.includes("কোনো রিসেন্ট এন্ট্রি নেই")) list.innerHTML = "";
        list.insertAdjacentHTML('afterbegin', row);
        
        // সর্বোচ্চ ৩টি রাখা
        if (list.children.length > 3) list.removeChild(list.lastChild);
    }

    // পেজ লোড হলে চালু হবে
    window.addEventListener('load', () => {
        injectSidebar();
        injectViewPanel();
        initLogic();
    });
})();
