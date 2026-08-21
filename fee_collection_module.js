/**
 * Mousumi Computer ERP - Education & Digital Services Module
 * Version: 2.5 (Scalable Sub-menu Architecture)
 */

(function () {
    // ১. মডিউল এর জন্য প্রয়োজনীয় CSS ইনজেক্ট করা
    const css = `
        /* নতুন মেনুর ড্রপডাউন এনিমেশন */
        #menu-edu-parent .submenu-list { display: none; transition: all 0.3s ease; }
        #menu-edu-parent.open .submenu-list { display: flex; }
        #menu-edu-parent.open .chevron-icon { transform: rotate(180deg); }

        .edu-card { background: #fff; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 25px; font-family: 'Tiro Bangla', serif; }
        .edu-header { background: #1e293b; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .edu-header h2 { font-size: 1.2rem; margin: 0; font-weight: 600; color: #f8fafc; }
        .edu-body { padding: 25px; }
        .edu-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .edu-input-group { display: flex; flex-direction: column; gap: 8px; }
        .edu-input-group label { font-weight: 700; color: #475569; font-size: 0.9rem; }
        .edu-control { width: 100%; height: 48px; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 0 15px; font-size: 1rem; outline: none; transition: 0.3s; background: #fcfdfe; }
        .edu-control:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
        .edu-control:disabled { background: #f8fafc; cursor: not-allowed; }
        .edu-helper { font-size: 0.85rem; color: #4f46e5; font-weight: 700; margin-top: 5px; }
        .edu-btn-submit { background: #4f46e5; color: #fff; border: none; padding: 12px 35px; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; float: right; transition: 0.3s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2); }
        .edu-btn-submit:hover { background: #4338ca; transform: translateY(-1px); }
        
        .edu-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .edu-table th { text-align: left; color: #94a3b8; font-size: 0.8rem; padding: 10px; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; }
        .edu-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; font-size: 0.95rem; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ২. সাইডবারে ড্রপডাউন মেনু (Parent & Sub-menu) ইনজেক্ট করা
    function injectScalableMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList) return;

        const eduMenuHTML = `
            <li class="menu-item" id="menu-edu-parent">
                <a onclick="toggleEduMenu()">
                    <span class="menu-link-inner">
                        <i class="fa-solid fa-graduation-cap"></i> 
                        <span>শিক্ষা ও ডিজিটাল সেবা</span>
                    </span>
                    <i class="fa-solid fa-chevron-down chevron-icon" style="font-size: 0.7rem;"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item" id="sub-fee-collection">
                        <a onclick="openEduService('fee-collection')">
                            <i class="fa-solid fa-angle-right"></i> <span>ফি কালেকশন (Fees)</span>
                        </a>
                    </li>
                    <!-- এখানে ভবিষ্যতে আরও সাব-মেনু যুক্ত করা যাবে -->
                    <li class="submenu-item" style="opacity: 0.5;">
                        <a href="#"><i class="fa-solid fa-angle-right"></i> <span>ভর্তি ফরম (আসন্ন)</span></a>
                    </li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', eduMenuHTML);
    }

    // ৩. ড্রপডাউন টগল এবং সার্ভিস ওপেন করার লজিক
    window.toggleEduMenu = function() {
        const parent = document.getElementById('menu-edu-parent');
        parent.classList.toggle('open');
    };

    window.openEduService = function(service) {
        // মেইন ড্রাইভের switchMainTab ব্যবহার করে প্যানেল দেখানো
        if(service === 'fee-collection') {
            switchMainTab('edu-fee-collection');
            // সাব-মেনু একটিভ ক্লাস যোগ করা
            document.querySelectorAll('.submenu-item').forEach(el => el.classList.remove('active'));
            document.getElementById('sub-fee-collection').classList.add('active');
        }
    };

    // ৪. মেইন প্যানেল (View) যোগ করা
    function injectViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        const feePanelHTML = `
            <div class="view-panel" id="edu-fee-collection-view">
                <div class="edu-card">
                    <div class="edu-header">
                        <h2>ফি কালেকশন মডিউল (Education Fee Collection)</h2>
                        <span style="font-size: 0.75rem; font-weight: 700; background: rgba(255,255,255,0.1); padding: 3px 8px; border-radius: 4px;">Service ID: EDU-F01</span>
                    </div>
                    <div class="edu-body">
                        <form id="eduFeeForm">
                            <div class="edu-grid">
                                <div class="edu-input-group">
                                    <label>তারিখ (Date)</label>
                                    <input type="date" id="eduDate" class="edu-control" required>
                                </div>
                                <div class="edu-input-group">
                                    <label>স্টুডেন্ট আইডি / মোবাইল (ID/Phone)</label>
                                    <input type="text" id="eduStudentId" class="edu-control" placeholder="আইডি বা মোবাইল লিখুন" required>
                                </div>
                                <div class="edu-input-group">
                                    <label>শিক্ষার্থীর নাম (Student Name)</label>
                                    <input type="text" id="eduStudentName" class="edu-control" readonly placeholder="নাম অটোমেটিক আসবে">
                                </div>
                                <div class="edu-input-group">
                                    <label>বর্তমান বকেয়া (Net Due)</label>
                                    <input type="text" id="eduNetDue" class="edu-control" value="0.00" readonly style="color: #ef4444; font-weight: 800;">
                                </div>
                                <div class="edu-input-group">
                                    <label>সার্ভিস ফি / চার্জ (Service Fee)</label>
                                    <input type="number" id="eduServiceCharge" class="edu-control" value="0.00">
                                    <div class="edu-helper">অতিরিক্ত চার্জ: ৳ <span id="eduChargeDisplay">0.00</span></div>
                                </div>
                                <div class="edu-input-group">
                                    <label>গৃহীত মোট টাকা (Net Received)</label>
                                    <input type="number" id="eduReceived" class="edu-control" placeholder="0.00" required>
                                </div>
                            </div>
                            <button type="submit" class="edu-btn-submit"><i class="fa-solid fa-check-circle"></i> সাবমিট করুন</button>
                            <div style="clear:both;"></div>
                        </form>

                        <div style="margin-top: 35px; border-top: 1.5px dashed #e2e8f0; padding-top: 20px;">
                            <h4 style="font-family: 'Tiro Bangla', serif; color: #64748b; margin-bottom: 15px;">সাম্প্রতিক ফি কালেকশন (Recent Collection)</h4>
                            <div class="table-container" style="background: #fcfdfe; border: 1px solid #f1f5f9; border-radius: 8px;">
                                <table class="edu-table">
                                    <thead>
                                        <tr>
                                            <th>তারিখ</th>
                                            <th>আইডি/ফোন</th>
                                            <th>শিক্ষার্থীর নাম</th>
                                            <th style="text-align: right;">গৃহীত টাকা</th>
                                        </tr>
                                    </thead>
                                    <tbody id="eduRecentList">
                                        <tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">কোনো রেকর্ড পাওয়া যায়নি</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.insertAdjacentHTML('beforeend', feePanelHTML);
    }

    // ৫. ফাংশনালিটি সেটআপ
    function setupLogic() {
        const idInp = document.getElementById('eduStudentId');
        const dateInp = document.getElementById('eduDate');
        dateInp.value = new Date().toISOString().split('T')[0];

        // কাস্টমার ডাটাবেস থেকে সার্চ লজিক
        idInp.addEventListener('input', function() {
            const val = this.value.trim();
            const customers = window.customers || [];
            const found = customers.find(c => c.id === val || c.phone === val);

            if(found) {
                document.getElementById('eduStudentName').value = found.name;
                if(window.calculateCustomerCurrentDue) {
                    const due = window.calculateCustomerCurrentDue(found.id);
                    document.getElementById('eduNetDue').value = due.toFixed(2);
                }
            } else {
                document.getElementById('eduStudentName').value = "";
                document.getElementById('eduNetDue').value = "0.00";
            }
        });

        // ফর্ম সাবমিশন
        document.getElementById('eduFeeForm').onsubmit = async function(e) {
            e.preventDefault();
            const studentId = idInp.value;
            const received = parseFloat(document.getElementById('eduReceived').value) || 0;
            const charge = parseFloat(document.getElementById('eduServiceCharge').value) || 0;

            if(!studentId || received <= 0) {
                showToast("সঠিক তথ্য দিন!", "warning");
                return;
            }

            if(confirm("আপনি কি নিশ্চিতভাবে এই ফি ডাটাবেসে যুক্ত করতে চান?")) {
                showLoader("সংরক্ষণ করা হচ্ছে...");
                
                const txData = {
                    id: 'EDU-' + Date.now(),
                    customerId: studentId,
                    type: 'Credit',
                    credit: received,
                    debit: 0,
                    date: dateInp.value,
                    time: new Date().toLocaleTimeString(),
                    description: `Education Fee Received (Charge: ${charge})`
                };

                try {
                    if(window.customerTransactions) {
                        window.customerTransactions.push(txData);
                        
                        // ফায়ারবেস আপডেট
                        const db = window.getDatabase();
                        const { ref, set } = window.firebase_database;
                        await set(ref(db, 'transactions'), window.customerTransactions);
                        
                        showToast("ফি সফলভাবে জমা হয়েছে!", "success");
                        updateEduUI(txData);
                        this.reset();
                        dateInp.value = new Date().toISOString().split('T')[0];
                    }
                } catch(err) {
                    showToast("ত্রুটি হয়েছে!", "error");
                }
                hideLoader();
            }
        };
    }

    function updateEduUI(entry) {
        const list = document.getElementById('eduRecentList');
        const name = document.getElementById('eduStudentName').value || "নতুন শিক্ষার্থী";
        const row = `
            <tr>
                <td>${entry.date}</td>
                <td>${entry.customerId}</td>
                <td>${name}</td>
                <td style="text-align: right; color: #10b981; font-weight: 800;">৳ ${entry.credit.toFixed(2)}</td>
            </tr>
        `;
        if(list.innerText.includes("কোনো রেকর্ড পাওয়া যায়নি")) list.innerHTML = "";
        list.insertAdjacentHTML('afterbegin', row);
    }

    // মডিউল ইনিশিয়ালাইজেশন
    window.addEventListener('load', () => {
        injectScalableMenu();
        injectViewPanel();
        setupLogic();
    });

})();
