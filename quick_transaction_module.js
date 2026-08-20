/**
 * Mousumi Computer - Quick Transaction Module (Classic Clean Layout & Searchable Customer)
 */

(function () {
    // 1. Firebase Bridge Integration
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

    // 2. কালপুরুষ ও টাইমস নিউ রোমান ফন্টসহ ২নং ছবির মতো সাধারণ সিএসএস
    const cleanStyles = `
    @import url('https://fonts.maateen.me/kalpurush/font.css');

    .qt-clean-wrapper {
        display: none;
        animation: qtSimpleFade 0.2s ease-in-out;
    }
    .qt-clean-wrapper.active {
        display: block;
    }
    .qt-clean-card {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 22px 25px;
        max-width: 100%;
        margin-bottom: 25px;
        font-family: 'Kalpurush', 'Times New Roman', Times, serif !important;
    }
    .qt-clean-header {
        font-size: 1.15rem;
        font-weight: 700;
        color: #1e293b;
        padding-bottom: 14px;
        margin-bottom: 18px;
        border-bottom: 1px solid #f1f5f9;
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Kalpurush', 'Times New Roman', Times, serif !important;
    }
    .qt-clean-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 14px;
        margin-bottom: 15px;
    }
    .qt-clean-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
        position: relative;
    }
    .qt-clean-group label {
        font-size: 0.88rem;
        font-weight: 700;
        color: #475569;
        font-family: 'Kalpurush', 'Times New Roman', Times, serif !important;
    }
    .qt-clean-input {
        width: 100%;
        padding: 9px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 0.95rem;
        color: #1e293b;
        outline: none;
        background: #ffffff;
        font-family: 'Kalpurush', 'Times New Roman', Times, serif !important;
    }
    .qt-clean-input:focus {
        border-color: #10b981;
    }
    
    /* Searchable Customer Dropdown List */
    .qt-search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        max-height: 220px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        display: none;
        margin-top: 4px;
    }
    .qt-search-item {
        padding: 8px 12px;
        cursor: pointer;
        font-size: 0.92rem;
        border-bottom: 1px solid #f1f5f9;
        font-family: 'Kalpurush', 'Times New Roman', Times, serif !important;
    }
    .qt-search-item:hover {
        background: #f0fdf4;
        color: #16a34a;
        font-weight: 700;
    }

    .qt-clean-backdated {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.88rem;
        color: #4b5563;
        font-weight: 700;
        margin-top: 10px;
        cursor: pointer;
        font-family: 'Kalpurush', 'Times New Roman', Times, serif !important;
    }
    .qt-clean-backdated input {
        width: 16px;
        height: 16px;
        accent-color: #10b981;
        cursor: pointer;
    }

    .qt-clean-btn {
        padding: 10px 26px;
        background: #10b981;
        color: #ffffff;
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: 0.2s;
        font-family: 'Kalpurush', 'Times New Roman', Times, serif !important;
    }
    .qt-clean-btn:hover {
        background: #059669;
    }

    @keyframes qtSimpleFade {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = cleanStyles;
    document.head.appendChild(styleEl);

    // 3. এইচটিএমএল স্ট্রাকচার (২নং ছবির মতো মার্জিত)
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
                    <div class="qt-clean-grid">
                        <!-- Searchable Customer Input -->
                        <div class="qt-clean-group" style="grid-column: span 1.5; min-width: 220px;">
                            <label>Customer Selection (নাম বা মোবাইল লিখুন)</label>
                            <input type="text" id="qtCustSearchInput" class="qt-clean-input" placeholder="কাস্টমারের নাম বা মোবাইল লিখুন..." autocomplete="off" oninput="window.filterQuickCustomers(this.value)" onfocus="window.filterQuickCustomers(this.value)">
                            <input type="hidden" id="qtSelectedCustId" value="" required>
                            <div id="qtCustSearchResults" class="qt-search-results"></div>
                        </div>

                        <!-- Transaction Type -->
                        <div class="qt-clean-group">
                            <label>Transaction Type</label>
                            <select id="qtCleanType" class="qt-clean-input">
                                <option value="Received">Received (+ Payment / পেলাম)</option>
                                <option value="Given">Given (+ Due / Sales / দিলাম)</option>
                            </select>
                        </div>

                        <!-- Amount -->
                        <div class="qt-clean-group">
                            <label>Amount (৳)</label>
                            <input type="number" step="any" min="1" id="qtCleanAmount" class="qt-clean-input" placeholder="0.00" required>
                        </div>

                        <!-- Date -->
                        <div class="qt-clean-group">
                            <label>Date</label>
                            <input type="date" id="qtCleanDate" class="qt-clean-input" value="${todayStr}" required style="cursor: pointer;">
                        </div>

                        <!-- Payment Method -->
                        <div class="qt-clean-group">
                            <label>Payment Method</label>
                            <select id="qtCleanPaymentMethod" class="qt-clean-input">
                                <option value="Cash" selected>Cash</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                                <option value="Rocket">Rocket</option>
                                <option value="Upay">Upay</option>
                                <option value="Bank">Bank Account</option>
                            </select>
                        </div>

                        <!-- Description -->
                        <div class="qt-clean-group" style="grid-column: 1 / -1;">
                            <label>Description / Particulars (ঐচ্ছিক)</label>
                            <input type="text" id="qtCleanDesc" class="qt-clean-input" placeholder="Notes, Item Details or Receipt info...">
                        </div>
                    </div>

                    <!-- Backdated Checkbox & Action Button -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-top: 10px;">
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

    // 4. দ্রুত কাস্টমার সার্চ ও সিলেক্ট লজিক (Search-as-you-type)
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
            resultsBox.innerHTML = '<div style="padding: 8px 12px; color:#9ca3af; font-size:0.85rem;">কোনো গ্রাহক পাওয়া যায়নি</div>';
            resultsBox.style.display = 'block';
            return;
        }

        let html = '';
        filtered.slice(0, 15).forEach(c => {
            html += `<div class="qt-search-item" onclick="window.selectQuickCustomer('${c.id}', '${c.name}', '${c.phone || ''}')">
                <strong>${c.name}</strong> <span style="font-size:0.82rem; color:#64748b; margin-left:6px;">(${c.phone || 'No Phone'})</span>
            </div>`;
        });

        resultsBox.innerHTML = html;
        resultsBox.style.display = 'block';
    };

    window.selectQuickCustomer = function (id, name, phone) {
        document.getElementById('qtSelectedCustId').value = id;
        document.getElementById('qtCustSearchInput').value = `${name} (${phone || 'No Phone'})`;
        document.getElementById('qtCustSearchResults').style.display = 'none';
    };

    // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ হওয়া
    document.addEventListener('click', (e) => {
        const box = document.getElementById('qtCustSearchResults');
        const inp = document.getElementById('qtCustSearchInput');
        if (box && e.target !== box && e.target !== inp) {
            box.style.display = 'none';
        }
    });

    // 5. ট্রানজ্যাকশন সেভ ইঞ্জিন
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

            // ফর্ম ক্লিয়ার (তারিখ পরিবর্তন হবে না)
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

    // 6. সাইডবার সাব-মেনু ও সেকশন ইনজেক্ট
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
