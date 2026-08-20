/**
 * Mousumi Computer - Quick Transaction Module (Kalpurush & Times New Roman Typography)
 */

(function () {
    // 1. Kalpurush WebFont সরাসরি Head-এ ইনজেক্ট করা
    if (!document.getElementById('kalpurush-font-link')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'kalpurush-font-link';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.maateen.me/kalpurush/font.css';
        document.head.appendChild(fontLink);
    }

    // 2. Firebase Bridge Integration
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

    // 3. ফন্ট এবং ব্যালান্সড গ্রিড সিএসএস (Kalpurush & Times New Roman)
    const cleanStyles = `
    /* সম্পূর্ণ কুইক ট্রানজ্যাকশন সেকশন ও সার্চ ড্রপডাউনে কালপুরুষ ও টাইমস নিউ রোমান ফন্ট */
    #cust-quick-tx-section,
    #cust-quick-tx-section *:not(i),
    .qt-clean-card,
    .qt-clean-card *:not(i),
    .qt-search-results,
    .qt-search-results *:not(i),
    .qt-search-item,
    .qt-search-item * {
        font-family: 'Kalpurush', 'Times New Roman', Times, serif !important;
    }

    .qt-clean-wrapper {
        display: none;
        animation: qtSimpleFade 0.2s ease-in-out;
    }
    .qt-clean-wrapper.active {
        display: block;
    }
    .qt-clean-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px 24px;
        max-width: 100%;
        margin-bottom: 25px;
    }
    .qt-clean-header {
        font-size: 1.2rem;
        font-weight: 700;
        color: #1e293b;
        padding-bottom: 12px;
        margin-bottom: 18px;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    /* পারফেক্ট ৪-কলাম ব্যালান্সড গ্রিড */
    .qt-balanced-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 16px;
    }
    .qt-group-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
        position: relative;
    }
    .qt-group-item label {
        font-size: 0.95rem;
        font-weight: 700;
        color: #475569;
    }
    .qt-control-input {
        width: 100%;
        height: 44px;
        padding: 0 12px;
        border: 1.5px solid #cbd5e1;
        border-radius: 8px;
        font-size: 1rem;
        color: #1e293b;
        outline: none;
        background: #ffffff;
        box-sizing: border-box;
        transition: 0.2s;
    }
    .qt-control-input:focus {
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    /* সার্চ ড্রপডাউন রেজাল্ট বক্স */
    .qt-search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #ffffff;
        border: 1.5px solid #cbd5e1;
        border-radius: 8px;
        max-height: 240px;
        overflow-y: auto;
        z-index: 10000;
        box-shadow: 0 12px 28px rgba(0,0,0,0.15);
        display: none;
        margin-top: 4px;
    }
    .qt-search-item {
        padding: 10px 14px;
        cursor: pointer;
        font-size: 1rem;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: 0.15s;
    }
    .qt-search-item:hover {
        background: #ecfdf5;
        color: #059669;
        font-weight: 700;
    }

    .qt-bottom-action-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
        padding-top: 12px;
        border-top: 1px solid #f8fafc;
    }
    .qt-clean-backdated {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.95rem;
        color: #4b5563;
        font-weight: 700;
        cursor: pointer;
    }
    .qt-clean-backdated input {
        width: 18px;
        height: 18px;
        accent-color: #10b981;
        cursor: pointer;
    }

    .qt-clean-btn {
        padding: 11px 30px;
        background: #10b981;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: 0.2s;
    }
    .qt-clean-btn:hover {
        background: #059669;
    }

    @media (max-width: 992px) {
        .qt-balanced-grid { grid-template-columns: repeat(2, 1fr); }
        .qt-col-span-2 { grid-column: span 2 !important; }
    }
    @media (max-width: 600px) {
        .qt-balanced-grid { grid-template-columns: 1fr; }
        .qt-col-span-2 { grid-column: span 1 !important; }
    }
    @keyframes qtSimpleFade {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
    }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = cleanStyles;
    document.head.appendChild(styleEl);

    // 4. এইচটিএমএল স্ট্রাকচার
    function getCleanQuickTxHTML() {
        const todayStr = new Date().toISOString().split('T')[0];
        return `
        <div id="cust-quick-tx-section" class="cust-sub-section qt-clean-wrapper" style="display:none;">
            <div class="qt-clean-card">
                <div class="qt-clean-header">
                    <i class="fa-solid fa-money-bill-transfer" style="color: #10b981;"></i>
                    <span>Quick Transaction Entry</span>
                </div>

                <form id="qtCleanForm" onsubmit="window.saveCleanQuickTransaction(event)">
                    <div class="qt-balanced-grid">
                        <!-- সারি ১: গ্রাহক সিলেকশন (২ কলাম জুড়ে) -->
                        <div class="qt-group-item qt-col-span-2" style="grid-column: span 2;">
                            <label>Customer Selection (নাম বা মোবাইল লিখুন)</label>
                            <input type="text" id="qtCustSearchInput" class="qt-control-input" placeholder="কাস্টমারের নাম বা মোবাইল নাম্বার দিয়ে খুঁজুন..." autocomplete="off" oninput="window.filterQuickCustomers(this.value)" onfocus="window.filterQuickCustomers(this.value)">
                            <input type="hidden" id="qtSelectedCustId" value="" required>
                            <div id="qtCustSearchResults" class="qt-search-results"></div>
                        </div>

                        <!-- সারি ১: লেনদেনের ধরন (১ কলাম) -->
                        <div class="qt-group-item">
                            <label>Transaction Type</label>
                            <select id="qtCleanType" class="qt-control-input">
                                <option value="Received">Received (পেলাম)</option>
                                <option value="Given">Given (দিলাম)</option>
                            </select>
                        </div>

                        <!-- সারি ১: পরিমাণ (১ কলাম) -->
                        <div class="qt-group-item">
                            <label>Amount (৳)</label>
                            <input type="number" step="any" min="1" id="qtCleanAmount" class="qt-control-input" placeholder="0.00" required style="font-weight: 700;">
                        </div>

                        <!-- সারি ২: তারিখ (১ কলাম) -->
                        <div class="qt-group-item">
                            <label>Date</label>
                            <input type="date" id="qtCleanDate" class="qt-control-input" value="${todayStr}" required style="cursor: pointer;">
                        </div>

                        <!-- সারি ২: পেমেন্ট মাধ্যম (১ কলাম) -->
                        <div class="qt-group-item">
                            <label>Payment Method</label>
                            <select id="qtCleanPaymentMethod" class="qt-control-input">
                                <option value="Cash" selected>Cash</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                                <option value="Rocket">Rocket</option>
                                <option value="Upay">Upay</option>
                                <option value="Bank">Bank Account</option>
                            </select>
                        </div>

                        <!-- সারি ২: বিবরণ (২ কলাম জুড়ে) -->
                        <div class="qt-group-item qt-col-span-2" style="grid-column: span 2;">
                            <label>Description / Particulars (ঐচ্ছিক)</label>
                            <input type="text" id="qtCleanDesc" class="qt-control-input" placeholder="Notes, Item Details or Receipt info...">
                        </div>
                    </div>

                    <!-- সারি ৩: চেকবক্স এবং সেভ বাটন -->
                    <div class="qt-bottom-action-bar">
                        <label class="qt-clean-backdated" for="qtCleanIsBackdated">
                            <input type="checkbox" id="qtCleanIsBackdated">
                            <span>পুরানা হিসাব / ব্যাকডেটেড এন্ট্রি (শুধুমাত্র কাস্টমার লেজারে যোগ হবে, ক্যাশ বা ক্লোজিংয়ে প্রভাব পড়বে না)</span>
                        </label>
                        <button type="submit" class="qt-clean-btn" id="qtCleanSubmitBtn">
                            <i class="fa-solid fa-circle-check"></i> Save Transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
        `;
    }

    // 5. দ্রুত কাস্টমার সার্চ ও ড্রপডাউন রেন্ডার (Kalpurush Font Supported)
    window.filterQuickCustomers = function (keyword) {
        const resultsBox = document.getElementById('qtCustSearchResults');
        if (!resultsBox) return;

        const custs = window.customers || (window.getERPStore ? window.getERPStore().customers : []);
        const term = (keyword || '').trim().toLowerCase();

        const filtered = custs.filter(c => 
            (c.name || '').toLowerCase().includes(term) || 
            (c.phone || '').toLowerCase().includes(term)
        );

        if (filtered.length === 0) {
            resultsBox.innerHTML = '<div style="padding: 10px 14px; color:#9ca3af; font-size:0.9rem;">কোনো গ্রাহক পাওয়া যায়নি</div>';
            resultsBox.style.display = 'block';
            return;
        }

        let html = '';
        filtered.slice(0, 15).forEach(c => {
            html += `<div class="qt-search-item" onclick="window.selectQuickCustomer('${c.id}', '${c.name}', '${c.phone || ''}')">
                <span style="font-weight: 700; font-size: 1.05rem;">${c.name}</span>
                <span style="font-size: 0.9rem; color: #64748b;">${c.phone ? '(' + c.phone + ')' : ''}</span>
            </div>`;
        });

        resultsBox.innerHTML = html;
        resultsBox.style.display = 'block';
    };

    window.selectQuickCustomer = function (id, name, phone) {
        document.getElementById('qtSelectedCustId').value = id;
        document.getElementById('qtCustSearchInput').value = `${name} ${phone ? '(' + phone + ')' : ''}`;
        document.getElementById('qtCustSearchResults').style.display = 'none';
    };

    document.addEventListener('click', (e) => {
        const box = document.getElementById('qtCustSearchResults');
        const inp = document.getElementById('qtCustSearchInput');
        if (box && e.target !== box && e.target !== inp) {
            box.style.display = 'none';
        }
    });

    // 6. ট্রানজ্যাকশন সেভ ইঞ্জিন
    window.saveCleanQuickTransaction = async function (e) {
        e.preventDefault();

        const custId = document.getElementById('qtSelectedCustId').value;
        if (!custId) {
            if (typeof window.showToast === 'function') window.showToast("দয়া করে গ্রাহক সিলেক্ট করুন!", "warning");
            return;
        }

        const amount = parseFloat(document.getElementById('qtCleanAmount').value) || 0;
        if (amount <= 0) {
            if (typeof window.showToast === 'function') window.showToast("টাকার পরিমাণ সঠিকভাবে লিখুন!", "warning");
            return;
        }

        const txType = document.getElementById('qtCleanType').value;
        const dateVal = document.getElementById('qtCleanDate').value;
        const method = document.getElementById('qtCleanPaymentMethod').value;
        const descInput = document.getElementById('qtCleanDesc').value.trim();
        const isBackdated = document.getElementById('qtCleanIsBackdated').checked;

        if (typeof window.showLoader === 'function') window.showLoader("সংরক্ষণ করা হচ্ছে...");

        let finalDesc = descInput;
        if (!finalDesc) {
            finalDesc = (txType === 'Received' ? 'টাকা আদায় / গ্রহণ' : 'পণ্য বিক্রয় / ধার');
        }
        finalDesc += ` (${method})`;
        if (isBackdated) finalDesc += ' [পুরানা হিসাব]';

        const now = new Date();
        const txObj = {
            id: 'tx_' + Date.now(),
            customerId: custId,
            type: txType === 'Received' ? 'Credit' : 'Debit',
            debit: txType === 'Given' ? amount : 0,
            credit: txType === 'Received' ? amount : 0,
            date: dateVal,
            time: now.toTimeString().split(' ')[0].substring(0, 5),
            method: method,
            description: finalDesc,
            isBackdated: isBackdated,
            timestamp: Date.now()
        };

        try {
            if (!window.customerTransactions) window.customerTransactions = [];
            window.customerTransactions.push(txObj);

            if (fbDb && fbSet && fbRef) {
                await fbSet(fbRef(fbDb, 'transactions'), window.customerTransactions);
            } else if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase('transactions', window.customerTransactions);
            }

            if (typeof window.renderCustomerListTable === 'function') window.renderCustomerListTable();
            if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();

            // ক্লিয়ার ফিল্ডস
            document.getElementById('qtSelectedCustId').value = '';
            document.getElementById('qtCustSearchInput').value = '';
            document.getElementById('qtCleanAmount').value = '';
            document.getElementById('qtCleanDesc').value = '';
            document.getElementById('qtCleanIsBackdated').checked = false;

            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast("লেনদেন সফলভাবে সম্পন্ন হয়েছে!", "success");

        } catch (err) {
            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast("Error: " + err.message, "error");
        }
    };

    // 7. সাইডবার সাব-মেনু ও সেকশন সুইচ
    window.openCleanQuickTxSection = function () {
        if (typeof window.switchCustomerSubSection === 'function') {
            window.switchCustomerSubSection('cust-quick-tx-section');
        } else {
            document.querySelectorAll('.cust-sub-section').forEach(sec => sec.style.display = 'none');
            const target = document.getElementById('cust-quick-tx-section');
            if (target) target.style.display = 'block';
        }
    };

    function injectCleanQuickTx() {
        const customerLedgerView = document.getElementById('customer-ledger-view');
        if (customerLedgerView && !document.getElementById('cust-quick-tx-section')) {
            customerLedgerView.insertAdjacentHTML('beforeend', getCleanQuickTxHTML());
        }

        const custParentMenu = document.getElementById('menu-cust-parent');
        if (custParentMenu) {
            const subList = custParentMenu.querySelector('.submenu-list');
            if (subList && !document.getElementById('sub-cust-quick-tx')) {
                const li = document.createElement('li');
                li.className = 'submenu-item';
                li.id = 'sub-cust-quick-tx';
                li.innerHTML = `<a onclick="window.openCleanQuickTxSection()" style="color: #10b981; font-weight: 700;"><i class="fa-solid fa-bolt"></i> <span>Quick Transaction ⚡</span></a>`;
                
                const secondChild = subList.children[1];
                if (secondChild) subList.insertBefore(li, secondChild);
                else subList.appendChild(li);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCleanQuickTx);
    } else {
        injectCleanQuickTx();
    }
    setTimeout(injectCleanQuickTx, 1500);

})();
