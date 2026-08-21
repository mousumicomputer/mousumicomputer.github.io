/**
 * Fee Collection Module for Mousumi Computer ERP
 * Integrated via Standalone Module
 */

(function () {
    // ১. মডিউল এর জন্য CSS ইনজেক্ট করা
    const css = `
        .fee-card { background: #fff; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 25px; font-family: 'Tiro Bangla', serif; }
        .fee-header { background: #334155; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .fee-header h2 { font-size: 1.3rem; margin: 0; font-weight: 600; }
        .fee-body { padding: 25px; }
        .fee-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .fee-input-group { display: flex; flex-direction: column; gap: 8px; }
        .fee-input-group label { font-weight: 600; color: #475569; font-size: 0.95rem; }
        .fee-control { width: 100%; height: 48px; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 0 15px; font-size: 1rem; outline: none; transition: 0.3s; }
        .fee-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .fee-control:disabled { background: #f8fafc; cursor: not-allowed; }
        .fee-helper { font-size: 0.85rem; color: #3b82f6; font-weight: 600; margin-top: 5px; }
        .fee-btn-submit { background: #2563eb; color: #fff; border: none; padding: 12px 35px; border-radius: 8px; font-size: 1.1rem; font-weight: 700; cursor: pointer; float: right; transition: 0.3s; }
        .fee-btn-submit:hover { background: #1d4ed8; transform: translateY(-2px); }
        .recent-entries-card { background: #fff; border-radius: 12px; border: 1px solid #f1f5f9; padding: 20px; margin-top: 30px; }
        .recent-title { color: #64748b; font-size: 0.95rem; font-weight: 700; border-bottom: 1.5px dashed #e2e8f0; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; }
        .fee-table { width: 100%; border-collapse: collapse; }
        .fee-table th { text-align: left; color: #94a3b8; font-size: 0.85rem; padding: 10px; text-transform: uppercase; }
        .fee-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #1e293b; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ২. সাইডবারে মেনু আইটেম যোগ করা (মূল কোড পরিবর্তন না করে)
    function injectSidebarMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList) return;

        const feeMenuItem = `
            <li class="menu-item" id="menu-fee-collection">
                <a onclick="switchMainTab('fee-collection')">
                    <span class="menu-link-inner"><i class="fa-solid fa-file-invoice-dollar"></i> <span>Fee Collection</span></span>
                </a>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', feeMenuItem);
    }

    // ৩. ড্যাশবোর্ডে নতুন প্যানেল (View) যোগ করা
    function injectViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        const feePanelHTML = `
            <div class="view-panel" id="fee-collection-view">
                <div class="fee-card">
                    <div class="fee-header">
                        <h2>ফি কালেকশন মডিউল (Fee Collection)</h2>
                        <span style="font-size: 0.8rem; opacity: 0.8;">ERP v2.4</span>
                    </div>
                    <div class="fee-body">
                        <form id="feeForm">
                            <div class="fee-grid">
                                <div class="fee-input-group">
                                    <label>তারিখ (Date)</label>
                                    <input type="date" id="feeDate" class="fee-control" required>
                                </div>
                                <div class="fee-input-group">
                                    <label>স্টুডেন্ট আইডি (ID)</label>
                                    <input type="text" id="feeStudentId" class="fee-control" placeholder="আইডি লিখুন" required>
                                </div>
                                <div class="fee-input-group">
                                    <label>শিক্ষার্থীর নাম (Student Name)</label>
                                    <input type="text" id="feeStudentName" class="fee-control" readonly placeholder="নাম এখানে আসবে">
                                </div>
                                <div class="fee-input-group">
                                    <label>বকেয়া (Net Due)</label>
                                    <input type="text" id="feeNetDue" class="fee-control" value="0.00" readonly>
                                </div>
                                <div class="fee-input-group">
                                    <label>ট্রানজ্যাকশন ফি (Txn Fee)</label>
                                    <input type="number" id="feeTxnAmount" class="fee-control" placeholder="0.00">
                                    <div class="fee-helper">মোট চার্জ (Total Charge): ৳ <span id="displayTotalCharge">0.00</span></div>
                                </div>
                                <div class="fee-input-group">
                                    <label>গৃহীত মোট টাকা (Net Received)</label>
                                    <input type="number" id="feeReceived" class="fee-control" placeholder="0.00" required>
                                </div>
                                <div class="fee-input-group">
                                    <label>ছাড় (Discount)</label>
                                    <input type="number" id="feeDiscount" class="fee-control" placeholder="0.00">
                                </div>
                            </div>
                            <button type="submit" class="fee-btn-submit">সাবমিট করুন</button>
                            <div style="clear:both;"></div>
                        </form>

                        <div class="recent-entries-card">
                            <div class="recent-title">
                                <span>সর্বশেষ এন্ট্রি (Recent Entries)</span>
                                <span style="font-size: 0.8rem;">সর্বোচ্চ ৫টি</span>
                            </div>
                            <table class="fee-table">
                                <thead>
                                    <tr>
                                        <th>তারিখ</th>
                                        <th>আইডি</th>
                                        <th>নাম</th>
                                        <th>গৃহীত টাকা</th>
                                    </tr>
                                </thead>
                                <tbody id="recentFeesBody">
                                    <tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">কোনো রিসেন্ট এন্ট্রি নেই</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.insertAdjacentHTML('beforeend', feePanelHTML);
    }

    // ৪. লজিক এবং ইভেন্ট হ্যান্ডলিং
    function initFeeLogic() {
        const idInput = document.getElementById('feeStudentId');
        const dateInput = document.getElementById('feeDate');
        
        // আজকের তারিখ সেট করা
        dateInput.value = new Date().toISOString().split('T')[0];

        // আইডি অনুযায়ী অটো নাম এবং বকেয়া বের করা (আপনার কাস্টমার ডাটাবেস থেকে)
        idInput.oninput = function() {
            const val = this.value.trim();
            const students = window.customers || []; // গ্লোবাল কাস্টমার লিস্ট থেকে খুঁজবে
            const student = students.find(s => s.id === val || s.phone === val);
            
            if(student) {
                document.getElementById('feeStudentName').value = student.name;
                // গ্লোবাল ফাংশন ব্যবহার করে বকেয়া বের করা
                if(window.calculateCustomerCurrentDue) {
                    const due = window.calculateCustomerCurrentDue(student.id);
                    document.getElementById('feeNetDue').value = due.toFixed(2);
                }
            } else {
                document.getElementById('feeStudentName').value = "";
                document.getElementById('feeNetDue').value = "0.00";
            }
        };

        // চার্জ ক্যালকুলেশন
        document.getElementById('feeTxnAmount').oninput = function() {
            const amount = parseFloat(this.value) || 0;
            const charge = amount > 0 ? 6.00 : 0; // উদাহরন হিসেবে ৬ টাকা চার্জ
            document.getElementById('displayTotalCharge').innerText = charge.toFixed(2);
        };

        // ফর্ম সাবমিট
        document.getElementById('feeForm').onsubmit = async function(e) {
            e.preventDefault();
            const studentId = idInput.value;
            const received = parseFloat(document.getElementById('feeReceived').value) || 0;
            
            if(!studentId || received <= 0) {
                alert("সঠিক তথ্য প্রদান করুন!");
                return;
            }

            if(confirm("আপনি কি নিশ্চিতভাবে এই ফি জমা দিতে চান?")) {
                showLoader("ফি প্রসেস করা হচ্ছে...");
                
                // এখানে আপনার মেইন ট্রানজ্যাকশন অবজেক্টের মতো ডাটা তৈরি হবে
                const feeData = {
                    id: 'fee_' + Date.now(),
                    customerId: studentId,
                    type: 'Credit',
                    credit: received,
                    debit: 0,
                    date: dateInput.value,
                    time: new Date().toLocaleTimeString(),
                    description: "School/Course Fee Received"
                };

                try {
                    // মেইন সিস্টেমের ট্রানজ্যাকশন এরে তে পুশ করা
                    if(window.customerTransactions) {
                        window.customerTransactions.push(feeData);
                        
                        // Firebase এ ডাটা পাঠানো (মেইন কোডের মতো লজিক)
                        const database = window.getDatabase(); // Firebase DB Instance
                        const { ref, set } = window.firebase_database; // Firebase methods
                        await set(ref(database, 'transactions'), window.customerTransactions);
                        
                        showToast("ফি সফলভাবে গ্রহণ করা হয়েছে!", "success");
                        this.reset();
                        dateInput.value = new Date().toISOString().split('T')[0];
                        updateRecentFees(feeData);
                    }
                } catch(err) {
                    showToast("ডাটা সংরক্ষণে সমস্যা হয়েছে!", "error");
                    console.error(err);
                }
                hideLoader();
            }
        };
    }

    function updateRecentFees(newEntry) {
        const tbody = document.getElementById('recentFeesBody');
        const name = document.getElementById('feeStudentName').value || "Unknown";
        const row = `
            <tr>
                <td>${newEntry.date}</td>
                <td>${newEntry.customerId}</td>
                <td>${name}</td>
                <td style="color:#16a34a;">৳ ${newEntry.credit.toFixed(2)}</td>
            </tr>
        `;
        if(tbody.innerText.includes("কোনো রিসেন্ট এন্ট্রি নেই")) tbody.innerHTML = "";
        tbody.insertAdjacentHTML('afterbegin', row);
    }

    // পেজ লোড হলে রান করবে
    window.addEventListener('load', () => {
        injectSidebarMenu();
        injectViewPanel();
        initFeeLogic();
    });
})();
