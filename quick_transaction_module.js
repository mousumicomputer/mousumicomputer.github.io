/**
 * Mousumi Computer - Quick Transaction Module (Dedicated English Fintech Section)
 * Standalone Zero-Conflict Module
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

    // 2. মডার্ন ইংলিশ ইউআই সিএসএস (Modern Fintech Styling)
    const quickTxStyles = `
    .qt-wrapper {
        display: none;
        animation: qtFadeIn 0.3s ease-out;
        font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .qt-wrapper.active {
        display: block;
    }
    .qt-card-modern {
        background: #ffffff;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
        padding: 30px;
        max-width: 950px;
        margin: 0 auto 25px auto;
    }
    .qt-banner-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 20px;
        margin-bottom: 25px;
        border-bottom: 2px solid #f1f5f9;
    }
    .qt-title-box {
        display: flex;
        align-items: center;
        gap: 14px;
    }
    .qt-title-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.3rem;
        box-shadow: 0 6px 15px rgba(37, 99, 235, 0.25);
    }
    .qt-title-box h2 {
        font-size: 1.35rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 4px 0;
    }
    .qt-title-box p {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0;
        font-weight: 600;
    }
    .qt-form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin-bottom: 20px;
    }
    .qt-form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .qt-form-group.full-col {
        grid-column: span 2;
    }
    .qt-form-group label {
        font-size: 0.88rem;
        font-weight: 700;
        color: #334155;
    }
    .qt-input-box {
        position: relative;
        display: flex;
        align-items: center;
    }
    .qt-input-box i {
        position: absolute;
        left: 15px;
        color: #64748b;
        font-size: 1rem;
    }
    .qt-control-modern {
        width: 100%;
        height: 50px;
        border: 1.5px solid #cbd5e1;
        border-radius: 12px;
        padding: 0 16px 0 44px;
        font-size: 1rem;
        font-weight: 600;
        color: #0f172a;
        background: #f8fafc;
        outline: none;
        transition: 0.2s;
    }
    .qt-control-modern:focus {
        background: #ffffff;
        border-color: #2563eb;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
    }
    .qt-type-toggle {
        display: flex;
        gap: 12px;
    }
    .qt-type-btn {
        flex: 1;
        height: 50px;
        border-radius: 12px;
        border: 2px solid #e2e8f0;
        background: #f8fafc;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 0.95rem;
        font-weight: 800;
        color: #64748b;
        cursor: pointer;
        transition: 0.2s;
        user-select: none;
    }
    .qt-type-btn.active-received {
        border-color: #10b981;
        background: #ecfdf5;
        color: #059669;
    }
    .qt-type-btn.active-given {
        border-color: #ef4444;
        background: #fef2f2;
        color: #dc2626;
    }
    .qt-backdated-card {
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 14px;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 25px;
        cursor: pointer;
        transition: 0.2s;
    }
    .qt-backdated-card:hover {
        background: #f1f5f9;
    }
    .qt-backdated-card input[type="checkbox"] {
        width: 20px;
        height: 20px;
        accent-color: #2563eb;
        cursor: pointer;
    }
    .qt-backdated-info strong {
        display: block;
        font-size: 0.92rem;
        color: #1e293b;
    }
    .qt-backdated-info span {
        font-size: 0.8rem;
        color: #64748b;
    }
    .qt-btn-submit-main {
        width: 100%;
        height: 54px;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: #ffffff;
        border: none;
        border-radius: 12px;
        font-size: 1.08rem;
        font-weight: 800;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
        transition: 0.2s;
    }
    .qt-btn-submit-main:hover {
        background: #1d4ed8;
        transform: translateY(-1px);
    }
    @keyframes qtFadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 768px) {
        .qt-form-grid { grid-template-columns: 1fr; }
        .qt-form-group.full-col { grid-column: span 1; }
    }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = quickTxStyles;
    document.head.appendChild(styleEl);

    // 3. ডেডিকেটেড ইংলিশ সেকশন HTML
    function getQuickTxSectionHTML() {
        const todayStr = new Date().toISOString().split('T')[0];
        return `
        <div id="cust-quick-tx-section" class="cust-sub-section qt-wrapper" style="display:none;">
            <div class="qt-card-modern">
                <div class="qt-banner-header">
                    <div class="qt-title-box">
                        <div class="qt-title-icon"><i class="fa-solid fa-bolt"></i></div>
                        <div>
                            <h2>Quick Transaction Entry</h2>
                            <p>Instantly record customer credit (debit) or payment collection without leaving this screen.</p>
                        </div>
                    </div>
                </div>

                <form id="qtDedicatedForm" onsubmit="window.submitDedicatedQuickTx(event)">
                    <div class="qt-form-grid">
                        <!-- Customer Selection -->
                        <div class="qt-form-group full-col">
                            <label>Select Customer <span style="color:#ef4444;">*</span></label>
                            <div class="qt-input-box">
                                <i class="fa-solid fa-user-check"></i>
                                <select id="qtDedCustomerSelect" class="qt-control-modern" required>
                                    <option value="">-- Choose Customer --</option>
                                </select>
                            </div>
                        </div>

                        <!-- Transaction Type -->
                        <div class="qt-form-group">
                            <label>Transaction Type <span style="color:#ef4444;">*</span></label>
                            <div class="qt-type-toggle">
                                <div class="qt-type-btn active-received" id="qtTypeReceived" onclick="window.setDedicatedTxType('Received')">
                                    <i class="fa-solid fa-arrow-down-left"></i> Received (+ Payment)
                                </div>
                                <div class="qt-type-btn" id="qtTypeGiven" onclick="window.setDedicatedTxType('Given')">
                                    <i class="fa-solid fa-arrow-up-right"></i> Given (+ Sales/Due)
                                </div>
                            </div>
                            <input type="hidden" id="qtDedType" value="Received">
                        </div>

                        <!-- Amount -->
                        <div class="qt-form-group">
                            <label>Amount (৳) <span style="color:#ef4444;">*</span></label>
                            <div class="qt-input-box">
                                <i class="fa-solid fa-bangladeshi-taka-sign"></i>
                                <input type="number" step="any" min="1" id="qtDedAmount" class="qt-control-modern" placeholder="0.00" required style="font-weight: 800; font-size: 1.15rem; color: #047857;">
                            </div>
                        </div>

                        <!-- Date -->
                        <div class="qt-form-group">
                            <label>Transaction Date <span style="color:#ef4444;">*</span></label>
                            <div class="qt-input-box">
                                <i class="fa-solid fa-calendar-day"></i>
                                <input type="date" id="qtDedDate" class="qt-control-modern" value="${todayStr}" required style="cursor: pointer;">
                            </div>
                        </div>

                        <!-- Payment Method -->
                        <div class="qt-form-group">
                            <label>Payment Method</label>
                            <div class="qt-input-box">
                                <i class="fa-solid fa-wallet"></i>
                                <select id="qtDedPaymentMethod" class="qt-control-modern">
                                    <option value="Cash" selected>Cash</option>
                                    <option value="bKash">bKash</option>
                                    <option value="Nagad">Nagad</option>
                                    <option value="Rocket">Rocket</option>
                                    <option value="Upay">Upay</option>
                                    <option value="Bank">Bank Account</option>
                                </select>
                            </div>
                        </div>

                        <!-- Description / Note -->
                        <div class="qt-form-group full-col">
                            <label>Description / Note (Optional)</label>
                            <div class="qt-input-box">
                                <i class="fa-solid fa-pen-to-square"></i>
                                <input type="text" id="qtDedDescription" class="qt-control-modern" placeholder="e.g. Due Collection, Goods purchase, Voucher Ref...">
                            </div>
                        </div>
                    </div>

                    <!-- Old/Backdated Transaction Toggle -->
                    <label class="qt-backdated-card" for="qtDedIsBackdated">
                        <input type="checkbox" id="qtDedIsBackdated">
                        <div class="qt-backdated-info">
                            <strong><i class="fa-solid fa-clock-rotate-left" style="color: #2563eb; margin-right: 6px;"></i> Backdated / Ledger-Only Entry</strong>
                            <span>Check this if entering past records. This will update the customer's ledger/due without affecting today's cash or closing report.</span>
                        </div>
                    </label>

                    <!-- Submit Button -->
                    <button type="submit" class="qt-btn-submit-main" id="qtDedSubmitBtn">
                        <i class="fa-solid fa-circle-check"></i> Post & Save Transaction
                    </button>
                </form>
            </div>
        </div>
        `;
    }

    // 4. টাইপ সুইচার (Received / Given)
    window.setDedicatedTxType = function (type) {
        document.getElementById('qtDedType').value = type;
        const btnRec = document.getElementById('qtTypeReceived');
        const btnGiv = document.getElementById('qtTypeGiven');
        const amtInput = document.getElementById('qtDedAmount');

        if (type === 'Received') {
            btnRec.className = 'qt-type-btn active-received';
            btnGiv.className = 'qt-type-btn';
            amtInput.style.color = '#047857';
        } else {
            btnRec.className = 'qt-type-btn';
            btnGiv.className = 'qt-type-btn active-given';
            amtInput.style.color = '#dc2626';
        }
    };

    // 5. কাস্টমার ড্রপডাউন পপুলেট
    function populateDedicatedCustomers() {
        const select = document.getElementById('qtDedCustomerSelect');
        if (!select) return;

        const currentVal = select.value;
        const custs = window.customers || (window.getERPStore ? window.getERPStore().customers : []);

        select.innerHTML = '<option value="">-- Choose Customer --</option>';
        custs.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.innerText = `${c.name} (${c.phone || 'No Phone'})`;
            select.appendChild(opt);
        });

        if (currentVal) select.value = currentVal;
    }

    // 6. ডেডিকেটেড সেকশনে যাওয়ার ফাংশন
    window.openQuickTxSection = function () {
        if (typeof window.switchCustomerSubSection === 'function') {
            window.switchCustomerSubSection('cust-quick-tx-section');
        } else {
            document.querySelectorAll('.cust-sub-section').forEach(sec => sec.style.display = 'none');
            const target = document.getElementById('cust-quick-tx-section');
            if (target) target.style.display = 'block';
        }
        populateDedicatedCustomers();
    };

    // 7. লেনদেন সেভ করার ইঞ্জিন
    window.submitDedicatedQuickTx = async function (e) {
        e.preventDefault();

        const custId = document.getElementById('qtDedCustomerSelect').value;
        if (!custId) {
            if (typeof window.showToast === 'function') window.showToast("Please select a customer!", "warning");
            return;
        }

        const amount = parseFloat(document.getElementById('qtDedAmount').value) || 0;
        if (amount <= 0) {
            if (typeof window.showToast === 'function') window.showToast("Please enter a valid amount!", "warning");
            return;
        }

        const txType = document.getElementById('qtDedType').value;
        const dateVal = document.getElementById('qtDedDate').value;
        const method = document.getElementById('qtDedPaymentMethod').value;
        const descInput = document.getElementById('qtDedDescription').value.trim();
        const isBackdated = document.getElementById('qtDedIsBackdated').checked;

        if (typeof window.showLoader === 'function') window.showLoader("Saving transaction...");

        let finalDesc = descInput;
        if (!finalDesc) {
            finalDesc = (txType === 'Received' ? 'Payment Received' : 'Sales / Credit Due');
        }
        finalDesc += ` (${method})`;
        if (isBackdated) finalDesc += ' [Backdated Record]';

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

            // ফর্ম রিসেট (তারিখ যা ছিল তাই থাকবে)
            document.getElementById('qtDedAmount').value = '';
            document.getElementById('qtDedDescription').value = '';
            document.getElementById('qtDedIsBackdated').checked = false;

            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast("Transaction saved successfully!", "success");

        } catch (err) {
            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast("Error: " + err.message, "error");
        }
    };

    // 8. সাইডবার সাব-মেনু এবং সেকশন ইনজেকশন
    function injectDedicatedQuickTxModule() {
        // সেকশন ইনজেক্ট করা
        const customerLedgerView = document.getElementById('customer-ledger-view');
        if (customerLedgerView && !document.getElementById('cust-quick-tx-section')) {
            customerLedgerView.insertAdjacentHTML('beforeend', getQuickTxSectionHTML());
            populateDedicatedCustomers();
        }

        // সাইডবারে নতুন সাব-মেনু যোগ করা
        const custParentMenu = document.getElementById('menu-cust-parent');
        if (custParentMenu) {
            const subList = custParentMenu.querySelector('.submenu-list');
            if (subList && !document.getElementById('sub-cust-quick-tx')) {
                const li = document.createElement('li');
                li.className = 'submenu-item';
                li.id = 'sub-cust-quick-tx';
                li.innerHTML = `<a onclick="window.openQuickTxSection()" style="color: #2563eb; font-weight: 700;"><i class="fa-solid fa-bolt"></i> <span>Quick Transaction ⚡</span></a>`;
                
                // Customer List-এর ঠিক পরে ২য় অবস্থানে বসানো
                const secondChild = subList.children[1];
                if (secondChild) subList.insertBefore(li, secondChild);
                else subList.appendChild(li);
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectDedicatedQuickTxModule);
    } else {
        injectDedicatedQuickTxModule();
    }

    setInterval(() => {
        if (!document.getElementById('cust-quick-tx-section')) {
            injectDedicatedQuickTxModule();
        } else {
            const sel = document.getElementById('qtDedCustomerSelect');
            if (sel && sel.options.length <= 1 && (window.customers && window.customers.length > 0)) {
                populateDedicatedCustomers();
            }
        }
    }, 1000);

})();
