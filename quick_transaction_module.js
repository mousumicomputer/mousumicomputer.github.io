/**
 * Mousumi Computer - Quick Transaction Module with Customer Summary Popup
 */

(function () {
    // 1. Kalpurush WebFont সরাসরি Head-এ ইনজেক্ট
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

    // 3. ফন্ট ও পপ-আপ সিএসএস (Kalpurush & Times New Roman)
    const cleanStyles = `
    #cust-quick-tx-section,
    #cust-quick-tx-section *:not(i),
    .qt-clean-card,
    .qt-clean-card *:not(i),
    .qt-search-results,
    .qt-search-results *:not(i),
    .qt-popup-modal,
    .qt-popup-modal *:not(i) {
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
    
    .qt-balanced-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 12px;
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
    
    /* কাস্টমার লাইভ ইনফো স্ট্রিপ */
    .qt-cust-live-info {
        display: none;
        align-items: center;
        justify-content: space-between;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 8px 14px;
        margin-top: 6px;
        font-size: 0.95rem;
    }
    .qt-btn-view-summary {
        background: #eef2ff;
        color: #4f46e5;
        border: 1px solid #c7d2fe;
        padding: 4px 10px;
        border-radius: 6px;
        font-weight: 700;
        cursor: pointer;
        font-size: 0.88rem;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: 0.2s;
    }
    .qt-btn-view-summary:hover {
        background: #4f46e5;
        color: #ffffff;
    }

    /* সার্চ রেজাল্ট ড্রপডাউন */
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

    /* পপ-আপ মোডাল (POPUP MODAL STYLES) */
    .qt-popup-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(4px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 15px;
    }
    .qt-popup-overlay.active { display: flex; animation: qtSimpleFade 0.2s ease-out; }
    
    .qt-popup-modal {
        background: #ffffff;
        border-radius: 16px;
        width: 100%;
        max-width: 650px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 40px rgba(0,0,0,0.25);
        overflow: hidden;
    }
    .qt-popup-header {
        padding: 16px 20px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .qt-popup-header h3 {
        font-size: 1.15rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
    }
    .qt-popup-close {
        background: #e2e8f0;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-weight: bold;
        color: #475569;
    }
    .qt-popup-body {
        padding: 20px;
        overflow-y: auto;
    }
    .qt-stat-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 18px;
    }
    .qt-stat-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        text-align: center;
    }
    .qt-stat-box span {
        font-size: 0.82rem;
        color: #64748b;
        display: block;
        font-weight: 600;
    }
    .qt-stat-box strong {
        font-size: 1.1rem;
        color: #1e293b;
    }

    @media (max-width: 992px) {
        .qt-balanced-grid { grid-template-columns: repeat(2, 1fr); }
        .qt-col-span-2 { grid-column: span 2 !important; }
    }
    @media (max-width: 600px) {
        .qt-balanced-grid { grid-template-columns: 1fr; }
        .qt-col-span-2 { grid-column: span 1 !important; }
        .qt-stat-grid { grid-template-columns: 1fr; }
    }
    @keyframes qtSimpleFade {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = cleanStyles;
    document.head.appendChild(styleEl);

    // 4. এইচটিএমএল স্ট্রাকচার ও পপ-আপ মোডাল
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

                            <!-- লাইভ কাস্টমার ইনফো বার -->
                            <div class="qt-cust-live-info" id="qtCustLiveInfo">
                                <div>
                                    <span style="color:#64748b;">বর্তমান বকেয়া:</span> 
                                    <strong id="qtLiveDueVal" style="color:#dc2626; font-size:1.05rem; margin-left:4px;">৳ 0.00</strong>
                                </div>
                                <button type="button" class="qt-btn-view-summary" onclick="window.openCustomerSummaryPopup()">
                                    <i class="fa-solid fa-file-invoice"></i> <span>View Summary / হিস্ট্রি</span>
                                </button>
                            </div>
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

        <!-- কাস্টমার সামারি পপ-আপ মোডাল -->
        <div class="qt-popup-overlay" id="qtSummaryPopupOverlay">
            <div class="qt-popup-modal">
                <div class="qt-popup-header">
                    <h3 id="qtPopCustName">গ্রাহকের হিসাব বিবরণী</h3>
                    <button class="qt-popup-close" onclick="window.closeCustomerSummaryPopup()">✕</button>
                </div>
                <div class="qt-popup-body" id="qtPopBody">
                    <!-- Dynamic Summary Content -->
                </div>
            </div>
        </div>
        `;
    }

    // 5. দ্রুত কাস্টমার সার্চ ও ড্রপডাউন রেন্ডার
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

    // কাস্টমার সিলেক্ট করলে লাইভ ব্যালেন্স দেখানো
    window.selectQuickCustomer = function (id, name, phone) {
        document.getElementById('qtSelectedCustId').value = id;
        document.getElementById('qtCustSearchInput').value = `${name} ${phone ? '(' + phone + ')' : ''}`;
        document.getElementById('qtCustSearchResults').style.display = 'none';

        // বর্তমান বকেয়া বের করা
        let due = 0;
        if (typeof window.calculateCustomerCurrentDue === 'function') {
            due = window.calculateCustomerCurrentDue(id);
        } else {
            const cust = (window.customers || []).find(c => c.id === id);
            due = parseFloat(cust ? cust.openingBalance : 0) || 0;
            (window.customerTransactions || []).filter(t => t.customerId === id).forEach(t => {
                due += (parseFloat(t.debit) || 0) - (parseFloat(t.credit) || 0);
            });
        }

        const infoBar = document.getElementById('qtCustLiveInfo');
        const dueVal = document.getElementById('qtLiveDueVal');
        if (infoBar && dueVal) {
            dueVal.innerText = '৳ ' + due.toLocaleString('en-US', { minimumFractionDigits: 2 });
            dueVal.style.color = due > 0 ? '#dc2626' : (due < 0 ? '#16a34a' : '#1e293b');
            infoBar.style.display = 'flex';
        }
    };

    // বাইরে ক্লিক করলে ড্রপডাউন বন্ধ
    document.addEventListener('click', (e) => {
        const box = document.getElementById('qtCustSearchResults');
        const inp = document.getElementById('qtCustSearchInput');
        if (box && e.target !== box && e.target !== inp) {
            box.style.display = 'none';
        }
    });

    // 6. পপ-আপ সামারি মোডাল ওপেন ও রেন্ডার
    window.openCustomerSummaryPopup = function () {
        const custId = document.getElementById('qtSelectedCustId').value;
        if (!custId) return;

        const cust = (window.customers || []).find(c => c.id === custId);
        if (!cust) return;

        let opening = parseFloat(cust.openingBalance) || 0;
        let totalDebit = 0, totalCredit = 0;

        const txs = (window.customerTransactions || []).filter(t => t.customerId === custId);
        txs.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).reverse();

        txs.forEach(t => {
            totalDebit += (parseFloat(t.debit) || 0);
            totalCredit += (parseFloat(t.credit) || 0);
        });

        const currentDue = opening + totalDebit - totalCredit;

        document.getElementById('qtPopCustName').innerText = `${cust.name} - এর হিসাব সারসংক্ষেপ`;

        let rowsHtml = '';
        txs.slice(0, 10).forEach(t => {
            rowsHtml += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 8px 10px; font-size: 0.9rem; color: #64748b;">${t.date}</td>
                    <td style="padding: 8px 10px; font-size: 0.92rem; font-weight: 600;">${t.description || '-'}</td>
                    <td style="padding: 8px 10px; font-size: 0.95rem; font-weight: 700; color: #dc2626; text-align: right;">${t.debit > 0 ? '৳ ' + t.debit.toLocaleString('en-US') : '-'}</td>
                    <td style="padding: 8px 10px; font-size: 0.95rem; font-weight: 700; color: #16a34a; text-align: right;">${t.credit > 0 ? '৳ ' + t.credit.toLocaleString('en-US') : '-'}</td>
                </tr>
            `;
        });

        document.getElementById('qtPopBody').innerHTML = `
            <div style="background:#f1f5f9; padding:10px 14px; border-radius:8px; margin-bottom:15px; font-size:0.92rem;">
                <strong>মোবাইল:</strong> ${cust.phone || 'নেই'} | <strong>ঠিকানা:</strong> ${cust.address || 'নেই'}
            </div>

            <div class="qt-stat-grid">
                <div class="qt-stat-box">
                    <span>মোট বিক্রয় / দিলাম</span>
                    <strong style="color:#dc2626;">৳ ${totalDebit.toLocaleString('en-US')}</strong>
                </div>
                <div class="qt-stat-box">
                    <span>মোট আদায় / পেলাম</span>
                    <strong style="color:#16a34a;">৳ ${totalCredit.toLocaleString('en-US')}</strong>
                </div>
                <div class="qt-stat-box">
                    <span>বর্তমান বকেয়া (Due)</span>
                    <strong style="color:${currentDue > 0 ? '#dc2626' : '#16a34a'}; font-size:1.2rem;">৳ ${currentDue.toLocaleString('en-US')}</strong>
                </div>
            </div>

            <div style="font-weight:700; margin-bottom:8px; font-size:1rem; color:#1e293b;">সাম্প্রতিক ১০টি লেনদেন:</div>
            <div style="max-height: 220px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8fafc; text-align: left; font-size: 0.88rem; color: #475569;">
                            <th style="padding: 8px 10px;">তারিখ</th>
                            <th style="padding: 8px 10px;">বিবরণ</th>
                            <th style="padding: 8px 10px; text-align: right; color:#dc2626;">দিলাম (+)</th>
                            <th style="padding: 8px 10px; text-align: right; color:#16a34a;">পেলাম (-)</th>
                        </tr>
                    </thead>
                    <tbody>${rowsHtml || '<tr><td colspan="4" style="text-align:center; padding:15px; color:#9ca3af;">কোনো লেনদেন রেকর্ড নেই</td></tr>'}</tbody>
                </table>
            </div>
        `;

        document.getElementById('qtSummaryPopupOverlay').classList.add('active');
    };

    window.closeCustomerSummaryPopup = function () {
        document.getElementById('qtSummaryPopupOverlay').classList.remove('active');
    };

    // 7. ট্রানজ্যাকশন সেভ ইঞ্জিন
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

            // ক্লিয়ার ফিল্ডস ও লাইভ ইনফো আপডেট
            document.getElementById('qtCleanAmount').value = '';
            document.getElementById('qtCleanDesc').value = '';
            document.getElementById('qtCleanIsBackdated').checked = false;

            // লাইভ ব্যালেন্স রিফ্রেশ
            const cust = (window.customers || []).find(c => c.id === custId);
            window.selectQuickCustomer(custId, cust ? cust.name : '', cust ? cust.phone : '');

            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast("লেনদেন সফলভাবে সম্পন্ন হয়েছে!", "success");

        } catch (err) {
            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast("Error: " + err.message, "error");
        }
    };

    // 8. সাইডবার সাব-মেনু ও সেকশন সুইচ
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
