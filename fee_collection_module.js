/**
 * Mousumi Computer ERP - Education & Digital Services Module
 * Design: Image 1 Recreation (Exact Layout)
 * Fonts: Kalpurush (Bengali), Times New Roman (English)
 */

(function () {
    // ১. CSS ইনজেক্ট করা (কালপুরুষ ও টাইমস নিউ রোমান ফন্ট সহ)
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;600;700&display=swap');

        /* মেইন কার্ড ডিজাইন */
        .edu-card { 
            background: #ffffff; 
            border-radius: 8px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); 
            overflow: hidden; 
            margin-bottom: 25px; 
            font-family: 'Kalpurush', 'Hind Siliguri', 'Times New Roman', serif;
        }

        /* হেডার ডিজাইন - প্রথম ছবির মতো গাঢ় নীল */
        .edu-header { 
            background: #34495e; 
            color: #ffffff; 
            padding: 15px 25px; 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
        }
        .edu-header h2 { 
            font-size: 1.4rem; 
            margin: 0; 
            font-weight: 500; 
            letter-spacing: 0.5px;
        }
        .erp-tag { 
            font-size: 0.85rem; 
            background: rgba(255,255,255,0.1); 
            padding: 2px 10px; 
            border-radius: 4px; 
            font-family: 'Times New Roman';
        }

        .edu-body { padding: 30px; }

        /* গ্রিড লেআউট - ৩ কলাম বিশিষ্ট */
        .edu-grid { 
            display: grid; 
            grid-template-columns: repeat(3, 1fr); 
            gap: 25px; 
            margin-bottom: 20px; 
        }

        .edu-input-group { display: flex; flex-direction: column; gap: 8px; }
        
        /* লেবেলে কালপুরুষ ও টাইমস নিউ রোমান এর সমন্বয় */
        .edu-input-group label { 
            font-weight: 600; 
            color: #444; 
            font-size: 1rem; 
        }

        .edu-control { 
            width: 100%; 
            height: 45px; 
            border: 1px solid #ccc; 
            border-radius: 6px; 
            padding: 0 15px; 
            font-size: 1.05rem; 
            outline: none; 
            transition: 0.2s;
            color: #333;
        }
        .edu-control:focus { border-color: #3498db; }
        .edu-control:disabled { background: #f9f9f9; color: #777; }

        .fee-helper { 
            font-size: 0.9rem; 
            color: #2980b9; 
            margin-top: 5px; 
            font-weight: 500;
        }

        /* সাবমিট বাটন ডিজাইন */
        .edu-btn-container { text-align: right; margin-top: 15px; }
        .edu-btn-submit { 
            background: #2563eb; 
            color: #fff; 
            border: none; 
            padding: 12px 45px; 
            border-radius: 6px; 
            font-size: 1.1rem; 
            font-weight: 600; 
            cursor: pointer; 
            transition: 0.3s; 
        }
        .edu-btn-submit:hover { background: #1d4ed8; }

        /* টেবিল এরিয়া - ডটেড লাইন এবং ডিজাইন */
        .recent-section { 
            margin-top: 40px; 
            border-top: 1px dotted #bbb; 
            padding-top: 20px; 
        }
        .recent-header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 15px; 
            color: #666; 
            font-size: 0.95rem; 
            font-weight: 600;
        }

        .edu-table { width: 100%; border-collapse: collapse; }
        .edu-table th { 
            text-align: left; 
            color: #888; 
            font-size: 0.9rem; 
            padding: 12px 10px; 
            border-bottom: 1px solid #eee; 
            font-weight: normal;
        }
        .edu-table td { 
            padding: 15px 10px; 
            border-bottom: 1px solid #f5f5f5; 
            color: #333; 
            font-weight: 500; 
        }

        /* সাইডবার সাব-মেনু স্টাইল */
        #menu-edu-parent.open .submenu-list { display: flex; flex-direction: column; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ২. সাইডবার মেনু ইনজেক্ট করা
    function injectEduMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-edu-parent')) return;

        const html = `
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
        menuList.insertAdjacentHTML('beforeend', html);
    }

    // ৩. মেইন ইন্টারফেস ইনজেক্ট করা (প্রথম ছবির মতো হুবহু লেআউট)
    function injectEduPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        const panelHTML = `
            <div class="view-panel" id="edu-fee-collection-view">
                <div class="edu-card">
                    <div class="edu-header">
                        <h2>ফি কালেকশন মডিউল (Fee Collection)</h2>
                        <span class="erp-tag">ERP v2.4</span>
                    </div>
                    <div class="edu-body">
                        <form id="exactFeeForm">
                            <!-- প্রথম সারি: তারিখ, আইডি, নাম -->
                            <div class="edu-grid">
                                <div class="edu-input-group">
                                    <label>তারিখ (Date)</label>
                                    <input type="date" id="exDate" class="edu-control" required>
                                </div>
                                <div class="edu-input-group">
                                    <label>স্টুডেন্ট আইডি (ID)</label>
                                    <input type="text" id="exId" class="edu-control" placeholder="আইডি লিখুন" required>
                                </div>
                                <div class="edu-input-group">
                                    <label>শিক্ষার্থীর নাম (Student Name)</label>
                                    <input type="text" id="exName" class="edu-control" placeholder="আব্দুর রহমান">
                                </div>
                            </div>

                            <!-- দ্বিতীয় সারি: বকেয়া, ট্রানজ্যাকশন ফি, প্রাপ্ত টাকা -->
                            <div class="edu-grid">
                                <div class="edu-input-group">
                                    <label>বকেয়া (Net Due)</label>
                                    <input type="text" id="exDue" class="edu-control" value="0.00" disabled>
                                </div>
                                <div class="edu-input-group">
                                    <label>ট্রানজ্যাকশন ফি (Txn Fee)</label>
                                    <input type="number" id="exTxn" class="edu-control" placeholder="">
                                    <div class="fee-helper">মোট চার্জ (Total Charge): ৳ <span id="exChargeDisp">0.00</span></div>
                                </div>
                                <div class="edu-input-group">
                                    <label>গৃহীত মোট টাকা (Net Received)</label>
                                    <input type="number" id="exReceived" class="edu-control" placeholder="">
                                </div>
                            </div>

                            <!-- তৃতীয় সারি: ছাড় -->
                            <div class="edu-grid" style="grid-template-columns: 1fr 1fr 1fr;">
                                <div class="edu-input-group">
                                    <label>ছাড় (Discount)</label>
                                    <input type="number" id="exDiscount" class="edu-control" placeholder="">
                                </div>
                            </div>

                            <div class="edu-btn-container">
                                <button type="submit" class="edu-btn-submit">সাবমিট করুন</button>
                            </div>
                        </form>

                        <!-- রিসেন্ট এন্ট্রি সেকশন -->
                        <div class="recent-section">
                            <div class="recent-header">
                                <span>সর্বশেষ এন্ট্রি (Recent Entries)</span>
                                <span>সর্বোচ্চ ৫টি</span>
                            </div>
                            <table class="edu-table">
                                <thead>
                                    <tr>
                                        <th>তারিখ</th>
                                        <th>আইডি</th>
                                        <th>নাম</th>
                                        <th>গৃহীত টাকা</th>
                                    </tr>
                                </thead>
                                <tbody id="exRecentBody">
                                    <tr><td colspan="4" style="text-align:center; color:#999; padding:30px;">কোনো রিসেন্ট এন্ট্রি নেই</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.insertAdjacentHTML('beforeend', panelHTML);
    }

    // ৪. লজিক সেটআপ
    function setupExactLogic() {
        const idInp = document.getElementById('exId');
        const dateInp = document.getElementById('exDate');
        dateInp.value = new Date().toISOString().split('T')[0];

        // সার্চ লজিক
        idInp.addEventListener('input', function() {
            const val = this.value.trim();
            const customers = window.customers || [];
            const found = customers.find(c => c.id === val || c.phone === val);
            if(found) {
                document.getElementById('exName').value = found.name;
                if(window.calculateCustomerCurrentDue) {
                    document.getElementById('exDue').value = window.calculateCustomerCurrentDue(found.id).toFixed(2);
                }
            }
        });

        // চার্জ ক্যালকুলেশন
        document.getElementById('exTxn').addEventListener('input', function() {
            const val = parseFloat(this.value) || 0;
            document.getElementById('exChargeDisp').innerText = val > 0 ? "6.00" : "0.00";
        });

        // সাবমিট লজিক
        document.getElementById('exactFeeForm').onsubmit = async function(e) {
            e.preventDefault();
            const received = parseFloat(document.getElementById('exReceived').value) || 0;
            if(received <= 0) return alert("টাকার অংক লিখুন!");

            showLoader("সংরক্ষণ হচ্ছে...");
            const tx = {
                id: 'EDU-' + Date.now(),
                customerId: idInp.value,
                type: 'Credit',
                credit: received,
                debit: 0,
                date: dateInp.value,
                time: new Date().toLocaleTimeString(),
                description: "Education Fee Received"
            };

            try {
                if(window.customerTransactions) {
                    window.customerTransactions.push(tx);
                    const db = window.getDatabase();
                    const { ref, set } = window.firebase_database;
                    await set(ref(db, 'transactions'), window.customerTransactions);
                    
                    showToast("ফি জমা হয়েছে!", "success");
                    updateExUI(tx);
                    this.reset();
                    dateInp.value = new Date().toISOString().split('T')[0];
                }
            } catch(e) { console.error(e); }
            hideLoader();
        };
    }

    function updateExUI(t) {
        const body = document.getElementById('exRecentBody');
        const name = document.getElementById('exName').value || "Unknown";
        const row = `<tr><td>${t.date}</td><td>${t.customerId}</td><td>${name}</td><td style="color:#2ecc71;">৳ ${t.credit.toFixed(2)}</td></tr>`;
        if(body.innerText.includes("কোনো রিসেন্ট এন্ট্রি নেই")) body.innerHTML = "";
        body.insertAdjacentHTML('afterbegin', row);
    }

    // ইনিশিয়ালাইজ
    window.addEventListener('load', () => {
        injectEduMenu();
        injectEduPanel();
        setupExactLogic();
    });
})();
