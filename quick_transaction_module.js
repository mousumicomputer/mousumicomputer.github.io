/**
 * Mousumi Computer - Quick Transaction Module (দ্রুত লেনদেন এন্ট্রি মডিউল)
 * Standalone Zero-Conflict Module
 */

(function () {
    // 1. Firebase Bridge Integration (নিরাপদ ডাটাবেজ সংযোগ)
    let fbDb = null, fbRef = null, fbSet = null;

    async function initFirebaseBridge() {
        try {
            const { getApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getDatabase, ref, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
            const app = getApp();
            fbDb = getDatabase(app);
            fbRef = ref;
            fbSet = set;
        } catch (e) {
            console.warn("Firebase Bridge Note:", e);
        }
    }
    initFirebaseBridge();

    // 2. মডিউলের নিজস্ব আধুনিক সিএসএস (Modern Fintech UI)
    const quickTxStyles = `
    .qt-card {
        background: #ffffff;
        border-radius: 16px;
        border: 1.5px solid #e2e8f0;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        padding: 22px 25px;
        margin-bottom: 25px;
        font-family: 'Plus Jakarta Sans', 'Tiro Bangla', sans-serif;
    }
    .qt-header {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.15rem;
        font-weight: 800;
        color: #1e3a8a;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1.5px solid #f1f5f9;
    }
    .qt-header i {
        color: #2563eb;
        font-size: 1.25rem;
    }
    .qt-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
    }
    .qt-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .qt-group label {
        font-size: 0.88rem;
        font-weight: 700;
        color: #475569;
    }
    .qt-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }
    .qt-input-wrapper i {
        position: absolute;
        left: 14px;
        color: #3b82f6;
        font-size: 0.95rem;
    }
    .qt-control {
        width: 100%;
        height: 46px;
        border: 1.5px solid #cbd5e1;
        border-radius: 10px;
        padding: 0 14px;
        font-size: 0.95rem;
        font-weight: 600;
        color: #1e293b;
        outline: none;
        background: #ffffff;
        transition: all 0.2s;
    }
    .qt-control.with-icon {
        padding-left: 38px;
    }
    .qt-control:focus {
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
    .qt-radio-box {
        display: flex;
        align-items: center;
        gap: 20px;
        height: 46px;
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 10px;
        padding: 0 16px;
    }
    .qt-radio-label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        font-weight: 700;
        color: #334155;
        cursor: pointer;
    }
    .qt-radio-label input[type="radio"] {
        width: 18px;
        height: 18px;
        accent-color: #2563eb;
        cursor: pointer;
    }
    .qt-checkbox-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        background: #fffbeb;
        border: 1.5px solid #fef3c7;
        border-radius: 10px;
        margin-bottom: 18px;
        cursor: pointer;
    }
    .qt-checkbox-wrapper input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #d97706;
        cursor: pointer;
    }
    .qt-checkbox-wrapper span {
        font-size: 0.88rem;
        font-weight: 700;
        color: #92400e;
    }
    .qt-footer {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        border-top: 1.5px solid #f1f5f9;
        padding-top: 16px;
    }
    .qt-btn-submit {
        background: #2563eb;
        color: #ffffff;
        border: none;
        padding: 12px 36px;
        border-radius: 10px;
        font-size: 1.05rem;
        font-weight: 800;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
        transition: 0.2s;
    }
    .qt-btn-submit:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
    }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = quickTxStyles;
    document.head.appendChild(styleEl);

    // 3. কুইক এন্ট্রি মডিউল HTML
    function getQuickTxHTML() {
        const todayStr = new Date().toISOString().split('T')[0];
        return `
        <div class="qt-card" id="quickTransactionContainer">
            <div class="qt-header">
                <i class="fa-solid fa-bolt"></i>
                <span>দ্রুত লেনদেন এন্ট্রি মডিউল (Quick Transaction Module)</span>
            </div>
            
            <form id="quickTransactionForm" onsubmit="window.handleQuickTxSubmit(event)">
                <!-- Row 1: গ্রাহক ও লেনদেনের ধরন -->
                <div class="qt-grid" style="grid-template-columns: 1.5fr 1fr;">
                    <div class="qt-group">
                        <label>গ্রাহক নির্বাচন করুন</label>
                        <div class="qt-input-wrapper">
                            <i class="fa-solid fa-user"></i>
                            <select id="qtCustomerSelect" class="qt-control with-icon" required>
                                <option value="">-- গ্রাহক সিলেক্ট করুন --</option>
                            </select>
                        </div>
                    </div>

                    <div class="qt-group">
                        <label>লেনদেনের ধরন</label>
                        <div class="qt-radio-box">
                            <label class="qt-radio-label">
                                <input type="radio" name="qtType" value="pelam" checked> 
                                <span style="color: #16a34a;">● পেলাম</span>
                            </label>
                            <label class="qt-radio-label">
                                <input type="radio" name="qtType" value="dilam"> 
                                <span style="color: #dc2626;">● দিলাম</span>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Row 2: পরিমাণ, তারিখ, পেমেন্ট মাধ্যম, বিবরণ -->
                <div class="qt-grid" style="grid-template-columns: 1fr 1.2fr 1fr 1.5fr;">
                    <div class="qt-group">
                        <label>পরিমাণ (৳)</label>
                        <input type="number" step="any" min="1" id="qtAmount" class="qt-control" placeholder="0.00" required style="font-weight: 800; font-size: 1.1rem;">
                    </div>

                    <div class="qt-group">
                        <label>তারিখ</label>
                        <input type="date" id="qtDate" class="qt-control" value="${todayStr}" required style="cursor: pointer;">
                    </div>

                    <div class="qt-group">
                        <label>পেমেন্ট মাধ্যম</label>
                        <div class="qt-input-wrapper">
                            <i class="fa-solid fa-wallet"></i>
                            <select id="qtPaymentMethod" class="qt-control with-icon">
                                <option value="Cash" selected>Cash</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                                <option value="Rocket">Rocket</option>
                                <option value="Upay">Upay</option>
                                <option value="Bank">Bank</option>
                            </select>
                        </div>
                    </div>

                    <div class="qt-group">
                        <label>বিবরণ (ঐচ্ছিক)</label>
                        <input type="text" id="qtDescription" class="qt-control" placeholder="বকেয়া আদায় / মন্তব্য">
                    </div>
                </div>

                <!-- পুরানা হিসাব চেকবক্স -->
                <label class="qt-checkbox-wrapper" for="qtIsBackdated">
                    <input type="checkbox" id="qtIsBackdated">
                    <span><i class="fa-solid fa-clock-rotate-left"></i> পুরানা হিসাব / ব্যাকডেটেড এন্ট্রি (এটি শুধুমাত্র কাস্টমার স্টেটমেন্টে বসবে, আজকের ক্যাশ বা দৈনন্দিন আদায়ে প্রভাব ফেলবে না)</span>
                </label>

                <!-- Footer Submit -->
                <div class="qt-footer">
                    <button type="submit" class="qt-btn-submit" id="qtSubmitBtn">
                        <i class="fa-solid fa-paper-plane"></i> দাখিল করুন
                    </button>
                </div>
            </form>
        </div>
        `;
    }

    // 4. কাস্টমার ড্রপডাউন পপুলেট করা
    function populateQuickTxCustomers() {
        const select = document.getElementById('qtCustomerSelect');
        if (!select) return;

        const currentVal = select.value;
        const custs = window.customers || (window.getERPStore ? window.getERPStore().customers : []);

        select.innerHTML = '<option value="">-- গ্রাহক সিলেক্ট করুন --</option>';
        custs.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.innerText = `${c.name} (${c.phone || 'No Phone'})`;
            select.appendChild(opt);
        });

        if (currentVal) select.value = currentVal;
    }

    // 5. লেনদেন সাবমিট ইঞ্জিন
    window.handleQuickTxSubmit = async function (e) {
        e.preventDefault();

        const custSelect = document.getElementById('qtCustomerSelect');
        const custId = custSelect.value;
        if (!custId) {
            if (typeof window.showToast === 'function') window.showToast("দয়া করে একজন গ্রাহক নির্বাচন করুন!", "warning");
            return;
        }

        const amount = parseFloat(document.getElementById('qtAmount').value) || 0;
        if (amount <= 0) {
            if (typeof window.showToast === 'function') window.showToast("টাকার পরিমাণ সঠিকভাবে লিখুন!", "warning");
            return;
        }

        const txType = document.querySelector('input[name="qtType"]:checked').value;
        const dateVal = document.getElementById('qtDate').value;
        const method = document.getElementById('qtPaymentMethod').value;
        const descInput = document.getElementById('qtDescription').value.trim();
        const isBackdated = document.getElementById('qtIsBackdated').checked;

        if (typeof window.showLoader === 'function') window.showLoader("লেনদেন দাখিল হচ্ছে...");

        // বিবরণ প্রস্তুত
        let finalDesc = descInput;
        if (!finalDesc) {
            finalDesc = (txType === 'pelam' ? 'টাকা গ্রহণ' : 'পণ্য বিক্রয়/ধার');
        }
        finalDesc += ` (${method})`;
        if (isBackdated) finalDesc += ' [পুরানা হিসাব]';

        const now = new Date();
        const txObj = {
            id: 'tx_' + Date.now(),
            customerId: custId,
            type: txType === 'pelam' ? 'Credit' : 'Debit',
            debit: txType === 'dilam' ? amount : 0,
            credit: txType === 'pelam' ? amount : 0,
            date: dateVal,
            time: now.toTimeString().split(' ')[0].substring(0, 5),
            method: method,
            description: finalDesc,
            isBackdated: isBackdated, // পুরানা হিসাব ফ্ল্যাগ
            timestamp: Date.now()
        };

        try {
            if (!window.customerTransactions) window.customerTransactions = [];
            window.customerTransactions.push(txObj);

            // ডাটাবেজে সেভ
            if (fbDb && fbSet && fbRef) {
                await fbSet(fbRef(fbDb, 'transactions'), window.customerTransactions);
            } else if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase('transactions', window.customerTransactions);
            }

            // UI রিফ্রেশ
            if (typeof window.renderCustomerListTable === 'function') window.renderCustomerListTable();
            if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();

            // ফর্ম রিসেট (তারিখ পরিবর্তন হবে না, নির্বাচিত তারিখই থাকবে)
            document.getElementById('qtAmount').value = '';
            document.getElementById('qtDescription').value = '';
            document.getElementById('qtIsBackdated').checked = false;

            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast("লেনদেন সফলভাবে সম্পন্ন হয়েছে!", "success");

        } catch (err) {
            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast("ত্রুটি: " + err.message, "error");
        }
    };

    // 6. ইউআই-তে স্বয়ংক্রিয়ভাবে ইনজেক্ট করা
    function injectQuickTxModule() {
        const custListSection = document.getElementById('cust-list-section');
        if (custListSection && !document.getElementById('quickTransactionContainer')) {
            const searchBar = custListSection.querySelector('.mc-action-bar');
            if (searchBar) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = getQuickTxHTML();
                custListSection.insertBefore(tempDiv.firstElementChild, searchBar);
                populateQuickTxCustomers();
            }
        }
    }

    // ব্যাকগ্রাউন্ড লিসেনার ও ইনিশিয়ালাইজেশন
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectQuickTxModule);
    } else {
        injectQuickTxModule();
    }

    // কাস্টমার ডাটা লোড হলে অটো ড্রপডাউন রিফ্রেশ
    setInterval(() => {
        if (!document.getElementById('quickTransactionContainer')) {
            injectQuickTxModule();
        } else {
            const sel = document.getElementById('qtCustomerSelect');
            if (sel && sel.options.length <= 1 && (window.customers && window.customers.length > 0)) {
                populateQuickTxCustomers();
            }
        }
    }, 1000);

})();
