/**
 * Mousumi Computer - Daily Closing Wizard Module (Wide & No-Scroll Edition)
 */

(function () {
    // 1. ইনজেক্টেড সিএসএস (Ultra-Wide, Responsive & Compact Grid)
    const wizardStyles = `
    .dcw-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(6px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 20px;
    }
    .dcw-overlay.active { display: flex; animation: dcwFadeIn 0.2s ease-out; }
    
    .dcw-modal {
        background: #ffffff;
        border-radius: 20px;
        width: 96%;
        max-width: 1180px; /* পাশে আরও প্রশস্ত করা হয়েছে */
        max-height: 94vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
        overflow: hidden;
        font-family: 'Plus Jakarta Sans', 'Tiro Bangla', sans-serif;
    }

    /* HEADER */
    .dcw-header {
        padding: 16px 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #f1f5f9;
        background: #ffffff;
    }
    .dcw-header h3 {
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .dcw-close-btn {
        background: #f1f5f9;
        border: none;
        width: 34px;
        height: 34px;
        border-radius: 50%;
        font-size: 1rem;
        color: #64748b;
        cursor: pointer;
        transition: 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .dcw-close-btn:hover { background: #fee2e2; color: #ef4444; }

    /* STEPPER */
    .dcw-stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 30px;
        background: #f8fafc;
        border-bottom: 1px solid #f1f5f9;
    }
    .dcw-step-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.88rem;
        font-weight: 600;
        color: #94a3b8;
        cursor: pointer;
    }
    .dcw-step-badge {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: 800;
        border: 2px solid #e2e8f0;
        color: #64748b;
        background: #fff;
    }
    .dcw-step-item.active { color: #047857; font-weight: 700; }
    .dcw-step-item.active .dcw-step-badge {
        background: #10b981;
        border-color: #10b981;
        color: #ffffff;
    }
    .dcw-step-item.completed { color: #0f172a; }
    .dcw-step-item.completed .dcw-step-badge {
        background: #e6fcf5;
        border-color: #10b981;
        color: #10b981;
    }
    .dcw-step-arrow { color: #cbd5e1; font-size: 0.7rem; }

    /* BODY */
    .dcw-body {
        padding: 20px 25px;
        overflow-y: auto;
        flex: 1;
        background: #ffffff;
    }
    .dcw-step-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 2px;
    }
    .dcw-step-desc {
        font-size: 0.82rem;
        color: #64748b;
        margin-bottom: 16px;
    }

    /* COMPACT GRID FOR ACCOUNTS (3 COLUMNS) */
    .dcw-grid-3 {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 14px;
    }
    .dcw-card-box {
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        padding: 12px 14px;
        background: #ffffff;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transition: 0.2s border-color, 0.2s box-shadow;
    }
    .dcw-card-box:focus-within {
        border-color: #00a8ef;
        box-shadow: 0 0 0 3px rgba(0, 168, 239, 0.1);
    }
    .dcw-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .dcw-icon-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: #fff;
        font-size: 0.95rem;
    }
    .dcw-card-header strong {
        font-size: 0.9rem;
        color: #1e293b;
        font-weight: 700;
    }
    .dcw-input-field {
        width: 100%;
        padding: 9px 12px;
        border: 1.5px solid #e2e8f0;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 700;
        color: #0f172a;
        outline: none;
        background: #f8fafc;
    }
    .dcw-input-field:focus {
        background: #ffffff;
        border-color: #00a8ef;
    }

    /* 4-COLUMN OPERATOR CARDS LAYOUT */
    .dcw-card-operators-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
    }
    .dcw-op-column {
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
        background: #ffffff;
        display: flex;
        flex-direction: column;
    }
    .dcw-op-header {
        padding: 8px 12px;
        font-size: 0.9rem;
        font-weight: 800;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .op-header-gp { background: #00a8ef; }
    .op-header-bl { background: #f97316; }
    .op-header-robi { background: #dc2626; }
    .op-header-airtel { background: #b91c1c; }

    .dcw-card-list {
        padding: 6px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 48vh;
        overflow-y: auto;
    }
    .dcw-card-row-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        border-radius: 6px;
        background: #f8fafc;
        border: 1px solid #f1f5f9;
    }
    .dcw-card-row-item:hover { background: #f1f5f9; }
    .dcw-card-name {
        font-size: 0.8rem;
        font-weight: 700;
        color: #1e293b;
    }
    .dcw-card-price {
        font-size: 0.7rem;
        color: #64748b;
        font-weight: 600;
    }

    /* CASH 2-COLUMN LAYOUT */
    .dcw-cash-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    /* FOOTER */
    .dcw-footer {
        padding: 14px 25px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fcfdfe;
    }
    .dcw-btn {
        padding: 10px 22px;
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.92rem;
        cursor: pointer;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: 0.2s;
    }
    .dcw-btn-prev { background: #f1f5f9; color: #475569; }
    .dcw-btn-prev:hover { background: #e2e8f0; }
    .dcw-btn-next { background: #00a8ef; color: #ffffff; }
    .dcw-btn-next:hover { background: #0088e8; }
    .dcw-btn-finish { background: #10b981; color: #ffffff; }
    .dcw-btn-finish:hover { background: #059669; }

    @media (max-width: 900px) {
        .dcw-card-operators-grid { grid-template-columns: 1fr 1fr; }
        .dcw-cash-grid-2 { grid-template-columns: 1fr; }
    }
    @keyframes dcwFadeIn { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
    `;

    const styleEl = document.createElement('style');
    styleEl.innerHTML = wizardStyles;
    document.head.appendChild(styleEl);

    // 2. উইজার্ড HTML ফ্রেমওয়ার্ক
    const wizardModalHTML = `
    <div class="dcw-overlay" id="dailyClosingWizardOverlay">
        <div class="dcw-modal">
            <div class="dcw-header">
                <h3><i class="fa-solid fa-wand-magic-sparkles" style="color: #00a8ef;"></i> DAILY CLOSING WIZARD</h3>
                <button class="dcw-close-btn" onclick="window.closeClosingWizard()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="dcw-stepper">
                <div class="dcw-step-item active" id="dcwStepNav1" onclick="window.jumpToClosingWizardStep(1)">
                    <div class="dcw-step-badge">1</div> <span>Bank</span>
                </div>
                <i class="fa-solid fa-arrow-right dcw-step-arrow"></i>
                <div class="dcw-step-item" id="dcwStepNav2" onclick="window.jumpToClosingWizardStep(2)">
                    <div class="dcw-step-badge">2</div> <span>Agent</span>
                </div>
                <i class="fa-solid fa-arrow-right dcw-step-arrow"></i>
                <div class="dcw-step-item" id="dcwStepNav3" onclick="window.jumpToClosingWizardStep(3)">
                    <div class="dcw-step-badge">3</div> <span>Recharge</span>
                </div>
                <i class="fa-solid fa-arrow-right dcw-step-arrow"></i>
                <div class="dcw-step-item" id="dcwStepNav4" onclick="window.jumpToClosingWizardStep(4)">
                    <div class="dcw-step-badge">4</div> <span>Cash</span>
                </div>
                <i class="fa-solid fa-arrow-right dcw-step-arrow"></i>
                <div class="dcw-step-item" id="dcwStepNav5" onclick="window.jumpToClosingWizardStep(5)">
                    <div class="dcw-step-badge">5</div> <span>Card</span>
                </div>
            </div>

            <div class="dcw-body" id="dcwStepBody"></div>

            <div class="dcw-footer">
                <button class="dcw-btn dcw-btn-prev" id="dcwBtnPrev" onclick="window.navClosingWizard(-1)" style="visibility: hidden;">
                    <i class="fa-solid fa-arrow-left"></i> Previous
                </button>
                <div style="display: flex; gap: 10px;">
                    <button class="dcw-btn dcw-btn-next" id="dcwBtnNext" onclick="window.saveAndProceedWizardStep()">
                        <i class="fa-solid fa-floppy-disk"></i> Save & Continue
                    </button>
                </div>
            </div>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', wizardModalHTML);

    let currentStep = 1;
    const TOTAL_STEPS = 5;

    const BRAND_COLORS = {
        'bkash': { bg: '#e11d48', icon: '<i class="fa-solid fa-paper-plane"></i>' },
        'nagad': { bg: '#ea580c', icon: '<i class="fa-solid fa-fire"></i>' },
        'rocket': { bg: '#8b5cf6', icon: '<i class="fa-solid fa-rocket"></i>' },
        'upay': { bg: '#0284c7', icon: '<i class="fa-solid fa-u"></i>' },
        'tap': { bg: '#0f172a', icon: '<i class="fa-solid fa-hand-pointer"></i>' },
        'dbbl': { bg: '#047857', icon: '<i class="fa-solid fa-building-columns"></i>' },
        'trust': { bg: '#1e3a8a', icon: '<i class="fa-solid fa-shield-halved"></i>' },
        'brac': { bg: '#2563eb', icon: '<i class="fa-solid fa-building-columns"></i>' },
        'gp': { bg: '#00a8ef', icon: '<i class="fa-solid fa-tower-broadcast"></i>' },
        'robi': { bg: '#dc2626', icon: '<i class="fa-solid fa-tower-broadcast"></i>' },
        'airtel': { bg: '#b91c1c', icon: '<i class="fa-solid fa-tower-broadcast"></i>' },
        'banglalink': { bg: '#f97316', icon: '<i class="fa-solid fa-tower-broadcast"></i>' }
    };

    function getBrandMeta(accName) {
        const nameLower = (accName || '').toLowerCase();
        for (let key in BRAND_COLORS) {
            if (nameLower.includes(key)) return BRAND_COLORS[key];
        }
        return { bg: '#4f46e5', icon: '<i class="fa-solid fa-wallet"></i>' };
    }

    window.openClosingWizard = function () {
        currentStep = 1;
        document.getElementById('dailyClosingWizardOverlay').classList.add('active');
        renderWizardCurrentStep();
    };

    window.closeClosingWizard = function () {
        document.getElementById('dailyClosingWizardOverlay').classList.remove('active');
    };

    window.jumpToClosingWizardStep = function (step) {
        currentStep = step;
        renderWizardCurrentStep();
    };

    window.navClosingWizard = function (dir) {
        const target = currentStep + dir;
        if (target >= 1 && target <= TOTAL_STEPS) {
            currentStep = target;
            renderWizardCurrentStep();
        }
    };

    function renderWizardCurrentStep() {
        for (let i = 1; i <= TOTAL_STEPS; i++) {
            const navEl = document.getElementById(`dcwStepNav${i}`);
            if (!navEl) continue;
            navEl.classList.remove('active', 'completed');
            if (i === currentStep) navEl.classList.add('active');
            else if (i < currentStep) navEl.classList.add('completed');
        }

        const prevBtn = document.getElementById('dcwBtnPrev');
        const nextBtn = document.getElementById('dcwBtnNext');
        prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

        if (currentStep === TOTAL_STEPS) {
            nextBtn.className = 'dcw-btn dcw-btn-finish';
            nextBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Complete & Close';
        } else {
            nextBtn.className = 'dcw-btn dcw-btn-next';
            nextBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save & Continue';
        }

        const body = document.getElementById('dcwStepBody');

        if (currentStep === 1) renderStepAccountsCategory(body, 'Bank Accounts', 'Update Bank Accounts', 'Enter the end-of-day closing balances for all bank accounts.');
        else if (currentStep === 2) renderStepAccountsCategory(body, 'Agent Accounts', 'Update Agent Accounts', 'Enter the end-of-day balances for all agent wallets.');
        else if (currentStep === 3) renderStepAccountsCategory(body, 'Recharge Balances', 'Update Recharge Accounts', 'Enter closing balances for all SIM recharge accounts.');
        else if (currentStep === 4) renderStepCashInventory(body);
        else if (currentStep === 5) renderStepCardInventory(body);
    }

    // অ্যাকাউন্টস (Step 1, 2, 3) - ৩-কলাম কম্প্যাক্ট গ্রিড
    function renderStepAccountsCategory(container, categoryKeyword, title, desc) {
        const store = window.getERPStore ? window.getERPStore() : {
            categories: window.categories || [],
            accounts: window.accounts || [],
            balanceStore: window.balanceStore || {}
        };

        const targetCat = (store.categories || []).find(c =>
            c.name.toLowerCase().includes(categoryKeyword.toLowerCase())
        );

        let accList = [];
        if (targetCat) {
            accList = (store.accounts || []).filter(a => a.catId === targetCat.id && a.enabled !== false);
        }

        let html = `
            <div class="dcw-step-title">${title}</div>
            <div class="dcw-step-desc">${desc}</div>
            <div class="dcw-grid-3">
        `;

        if (accList.length === 0) {
            html += `<div style="grid-column: 1 / -1; padding: 25px; text-align: center; color: #94a3b8; background: #f8fafc; border-radius: 12px;">No accounts found under ${categoryKeyword}.</div>`;
        } else {
            accList.forEach(acc => {
                const meta = getBrandMeta(acc.name);
                const currentBal = (store.balanceStore && store.balanceStore[acc.id]) !== undefined ? store.balanceStore[acc.id] : 0;
                html += `
                    <div class="dcw-card-box">
                        <div class="dcw-card-header">
                            <div class="dcw-icon-avatar" style="background: ${meta.bg};">${meta.icon}</div>
                            <strong>${acc.name}</strong>
                        </div>
                        <input type="number" step="any" class="dcw-input-field" id="dcwInp_${acc.id}" value="${currentBal}" placeholder="0.00">
                    </div>
                `;
            });
        }

        html += `</div>`;
        container.innerHTML = html;
    }

    // ক্যাশ ইনভেন্টরি (Step 4) - ২-কলাম স্প্লিট ভিউ
    function renderStepCashInventory(container) {
        const cashQ = window.cashQuantities || {};
        const others = window.cashOthersAmount || 0;
        const col1 = [1000, 500, 200, 100, 50];
        const col2 = [20, 10, 5, 2, 1];

        const renderRow = (d) => {
            const q = parseInt(cashQ[d]) || 0;
            const lineVal = q * d;
            return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; border-bottom: 1px solid #f1f5f9;">
                    <strong style="color: #1e293b; font-size: 0.88rem; width: 90px;">৳ ${d} Note</strong>
                    <input type="number" min="0" class="dcw-input-field" style="width: 80px; padding: 6px; text-align: center;" id="dcwCashQty_${d}" value="${q}" oninput="window.calcWizardCashTotal()">
                    <div style="width: 100px; text-align: right; font-weight: 700; color: #047857; font-size: 0.9rem;" id="dcwCashVal_${d}">৳ ${lineVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
            `;
        };

        let total = 0;
        [...col1, ...col2].forEach(d => total += (parseInt(cashQ[d]) || 0) * d);
        total += parseFloat(others) || 0;

        container.innerHTML = `
            <div class="dcw-step-title">Physical Cash Audit</div>
            <div class="dcw-step-desc">Enter note counts. Side-by-side view for rapid zero-scroll entry.</div>
            <div class="dcw-cash-grid-2">
                <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fff;">
                    ${col1.map(renderRow).join('')}
                </div>
                <div style="border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fff;">
                    ${col2.map(renderRow).join('')}
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 10px; background: #f8fafc;">
                        <strong style="color: #00a8ef; font-size: 0.88rem; width: 90px;">Coins/Others</strong>
                        <input type="number" step="any" min="0" class="dcw-input-field" style="width: 80px; padding: 6px; text-align: center;" id="dcwCashOthers" value="${others}" oninput="window.calcWizardCashTotal()">
                        <div style="width: 100px; text-align: right; font-weight: 700; color: #00a8ef; font-size: 0.9rem;" id="dcwCashValOthers">৳ ${parseFloat(others || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                    </div>
                </div>
            </div>
            <div style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 10px; padding: 10px 18px; margin-top: 14px; display: flex; justify-content: space-between; color: #15803d; font-weight: 800; font-size: 1.05rem;">
                <span>Total Cash:</span>
                <span id="dcwCashGrandTotal">৳ ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
        `;
    }

    window.calcWizardCashTotal = function () {
        const denoms = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
        let sum = 0;
        denoms.forEach(d => {
            const el = document.getElementById(`dcwCashQty_${d}`);
            const valEl = document.getElementById(`dcwCashVal_${d}`);
            const q = parseInt(el ? el.value : 0) || 0;
            const line = q * d;
            sum += line;
            if (valEl) valEl.innerText = `৳ ${line.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        });
        const othersEl = document.getElementById('dcwCashOthers');
        const othersVal = parseFloat(othersEl ? othersEl.value : 0) || 0;
        const othersValEl = document.getElementById('dcwCashValOthers');
        if (othersValEl) othersValEl.innerText = `৳ ${othersVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        sum += othersVal;

        const grandEl = document.getElementById('dcwCashGrandTotal');
        if (grandEl) grandEl.innerText = `৳ ${sum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    // কার্ড ইনভেন্টরি (Step 5) - ৪-কলাম পাশাপাশি গ্রিড (NO SCROLL)
    function renderStepCardInventory(container) {
        const cardCfg = window.cardConfig || {};
        const cardQ = window.cardQuantities || {};
        const ops = [
            { name: 'GP', headerClass: 'op-header-gp' },
            { name: 'Banglalink', headerClass: 'op-header-bl' },
            { name: 'Robi', headerClass: 'op-header-robi' },
            { name: 'Airtel', headerClass: 'op-header-airtel' }
        ];

        let colsHtml = '';

        ops.forEach(op => {
            const cards = (cardCfg[op.name] || []).filter(c => c.active !== false);
            const opQtys = cardQ[op.name] || {};

            let rows = '';
            cards.forEach(c => {
                const q = parseInt(opQtys[c.id]) || 0;
                rows += `
                    <div class="dcw-card-row-item">
                        <div>
                            <div class="dcw-card-name">${c.name}</div>
                            <div class="dcw-card-price">৳${c.price}</div>
                        </div>
                        <input type="number" min="0" class="dcw-input-field" style="width: 60px; padding: 5px; text-align: center; font-size: 0.9rem;" id="dcwCardInp_${op.name}_${c.id}" value="${q}">
                    </div>
                `;
            });

            colsHtml += `
                <div class="dcw-op-column">
                    <div class="dcw-op-header ${op.headerClass}">
                        <span>${op.name}</span>
                        <i class="fa-solid fa-sim-card"></i>
                    </div>
                    <div class="dcw-card-list">
                        ${rows || '<div style="padding: 10px; color: #94a3b8; font-size: 0.75rem; text-align:center;">No cards</div>'}
                    </div>
                </div>
            `;
        });

        container.innerHTML = `
            <div class="dcw-step-title">Scratch Cards Inventory Audit</div>
            <div class="dcw-step-desc">Enter stock counts for all operators side-by-side.</div>
            <div class="dcw-card-operators-grid">
                ${colsHtml}
            </div>
        `;
    }

    // ডাটা সংরক্ষণ লজিক
    window.saveAndProceedWizardStep = async function () {
        if (typeof window.showLoader === 'function') window.showLoader("Saving step data...");

        try {
            if (currentStep >= 1 && currentStep <= 3) {
                const inputs = document.querySelectorAll('#dcwStepBody input[id^="dcwInp_"]');
                inputs.forEach(inp => {
                    const accId = inp.id.replace('dcwInp_', '');
                    const val = parseFloat(inp.value) || 0;
                    if (window.balanceStore) window.balanceStore[accId] = val;
                });
                await writeFirebaseDirect('erp/balances', window.balanceStore);
            } else if (currentStep === 4) {
                const denoms = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
                if (!window.cashQuantities) window.cashQuantities = {};

                denoms.forEach(d => {
                    const inp = document.getElementById(`dcwCashQty_${d}`);
                    window.cashQuantities[d] = parseInt(inp ? inp.value : 0) || 0;
                });

                const othersInp = document.getElementById('dcwCashOthers');
                window.cashOthersAmount = parseFloat(othersInp ? othersInp.value : 0) || 0;

                const cashTotal = typeof window.calculateCashGrandTotal === 'function' ? window.calculateCashGrandTotal() : 0;
                await writeFirebaseDirect('erp/cashInventory', {
                    quantities: window.cashQuantities,
                    others: window.cashOthersAmount,
                    grandTotal: cashTotal
                });
            } else if (currentStep === 5) {
                const ops = ['GP', 'Banglalink', 'Robi', 'Airtel'];
                if (!window.cardQuantities) window.cardQuantities = {};

                ops.forEach(op => {
                    if (!window.cardQuantities[op]) window.cardQuantities[op] = {};
                    const cards = (window.cardConfig && window.cardConfig[op]) || [];
                    cards.forEach(c => {
                        const inp = document.getElementById(`dcwCardInp_${op}_${c.id}`);
                        if (inp) window.cardQuantities[op][c.id] = parseInt(inp.value) || 0;
                    });
                });

                await writeFirebaseDirect('erp/cardInventory', window.cardQuantities);
            }

            if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();
            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast(`Step ${currentStep} saved!`, 'success');

            if (currentStep < TOTAL_STEPS) {
                currentStep++;
                renderWizardCurrentStep();
            } else {
                window.closeClosingWizard();
                if (typeof window.showToast === 'function') window.showToast('Daily Closing Wizard Completed!', 'success');
                if (typeof window.switchMainTab === 'function') window.switchMainTab('daily-closing');
            }

        } catch (err) {
            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast("Error saving: " + err.message, "error");
        }
    };

    async function writeFirebaseDirect(path, data) {
        if (window.writeToFirebase) return await window.writeToFirebase(path, data);
    }

    function injectWizardTriggerButtons() {
        const closingMenu = document.getElementById('menu-closing-parent');
        if (closingMenu) {
            const subList = closingMenu.querySelector('.submenu-list');
            if (subList && !document.getElementById('sub-closing-wizard')) {
                const li = document.createElement('li');
                li.className = 'submenu-item';
                li.id = 'sub-closing-wizard';
                li.innerHTML = `<a onclick="window.openClosingWizard()" style="color: #10b981; font-weight: 700;"><i class="fa-solid fa-wand-magic-sparkles"></i> <span>Closing Wizard ⚡</span></a>`;
                subList.insertBefore(li, subList.firstChild);
            }
        }

        const dcrFormCard = document.querySelector('#dcr-form-section .erp-form-header');
        if (dcrFormCard && !document.getElementById('btnQuickWizardHeader')) {
            const btn = document.createElement('button');
            btn.id = 'btnQuickWizardHeader';
            btn.className = 'mc-btn-primary';
            btn.style.cssText = 'padding: 6px 14px; font-size: 0.85rem; background: linear-gradient(135deg, #10b981, #059669); border-radius: 8px; margin-left: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;';
            btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> ⚡ Start Wizard';
            btn.onclick = (e) => {
                e.preventDefault();
                window.openClosingWizard();
            };
            dcrFormCard.appendChild(btn);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWizardTriggerButtons);
    } else {
        injectWizardTriggerButtons();
    }
    setTimeout(injectWizardTriggerButtons, 1500);

})();
