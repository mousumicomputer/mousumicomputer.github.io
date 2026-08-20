/**
 * Mousumi Computer - Daily Closing Wizard Module
 * Standalone Step-by-Step Multi-Step Closing Wizard
 */

(function () {
    // 1. ইনজেক্টেড সিএসএস স্টাইল (Modern Fintech UI)
    const wizardStyles = `
    /* WIZARD MODAL WRAPPER */
    .dcw-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.7);
        backdrop-filter: blur(6px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        padding: 15px;
    }
    .dcw-overlay.active { display: flex; animation: dcwFadeIn 0.25s ease-out; }
    
    .dcw-modal {
        background: #ffffff;
        border-radius: 20px;
        width: 100%;
        max-width: 820px;
        max-height: 92vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        font-family: 'Plus Jakarta Sans', 'Tiro Bangla', sans-serif;
    }

    /* HEADER */
    .dcw-header {
        padding: 20px 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #f1f5f9;
    }
    .dcw-header h3 {
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .dcw-close-btn {
        background: #f1f5f9;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        font-size: 1.1rem;
        color: #64748b;
        cursor: pointer;
        transition: 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .dcw-close-btn:hover { background: #fee2e2; color: #ef4444; }

    /* STEP PROGRESS BAR */
    .dcw-stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 15px 30px;
        background: #fcfdfe;
        border-bottom: 1px solid #f1f5f9;
        overflow-x: auto;
    }
    .dcw-step-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.88rem;
        font-weight: 600;
        color: #94a3b8;
        cursor: pointer;
        white-space: nowrap;
    }
    .dcw-step-badge {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
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
    .dcw-step-arrow { color: #cbd5e1; font-size: 0.75rem; }

    /* CONTENT BODY */
    .dcw-body {
        padding: 25px 30px;
        overflow-y: auto;
        flex: 1;
        background: #ffffff;
    }
    .dcw-step-title {
        font-size: 1.25rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 4px;
    }
    .dcw-step-desc {
        font-size: 0.88rem;
        color: #64748b;
        margin-bottom: 22px;
    }

    /* CARD GRID FOR INPUTS */
    .dcw-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
    }
    .dcw-card-box {
        border: 1.5px solid #e2e8f0;
        border-radius: 14px;
        padding: 16px;
        background: #ffffff;
        transition: 0.2s border-color, 0.2s box-shadow;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .dcw-card-box:focus-within {
        border-color: #00a8ef;
        box-shadow: 0 0 0 3px rgba(0, 168, 239, 0.12);
    }
    .dcw-card-header {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    .dcw-icon-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        color: #fff;
        font-size: 1.1rem;
    }
    .dcw-card-header strong {
        font-size: 0.98rem;
        color: #1e293b;
        font-weight: 700;
    }
    .dcw-input-field {
        width: 100%;
        padding: 12px 14px;
        border: 1.5px solid #e2e8f0;
        border-radius: 10px;
        font-size: 1.05rem;
        font-weight: 700;
        color: #0f172a;
        outline: none;
        background: #f8fafc;
        transition: 0.2s;
    }
    .dcw-input-field:focus {
        background: #ffffff;
        border-color: #00a8ef;
    }

    /* CASH & CARD SPECIFIC STYLES */
    .dcw-cash-row {
        display: grid;
        grid-template-columns: 1fr 100px 140px;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-bottom: 1px solid #f1f5f9;
    }
    .dcw-cash-row:last-child { border-bottom: none; }
    .dcw-summary-strip {
        background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        border: 1.5px solid #bbf7d0;
        border-radius: 12px;
        padding: 14px 20px;
        margin-top: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #15803d;
        font-weight: 800;
        font-size: 1.1rem;
    }

    /* FOOTER */
    .dcw-footer {
        padding: 16px 25px;
        border-top: 1px solid #f1f5f9;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fcfdfe;
    }
    .dcw-btn {
        padding: 12px 24px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 0.95rem;
        cursor: pointer;
        border: none;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: 0.2s;
    }
    .dcw-btn-prev {
        background: #f1f5f9;
        color: #475569;
    }
    .dcw-btn-prev:hover { background: #e2e8f0; }
    .dcw-btn-next {
        background: #00a8ef;
        color: #ffffff;
    }
    .dcw-btn-next:hover { background: #0088e8; }
    .dcw-btn-finish {
        background: #10b981;
        color: #ffffff;
    }
    .dcw-btn-finish:hover { background: #059669; }

    @keyframes dcwFadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
    }
    `;

    // 2. স্টাইল ইনজেক্ট করা
    const styleEl = document.createElement('style');
    styleEl.innerHTML = wizardStyles;
    document.head.appendChild(styleEl);

    // 3. উইজার্ড HTML স্ট্রাকচার
    const wizardModalHTML = `
    <div class="dcw-overlay" id="dailyClosingWizardOverlay">
        <div class="dcw-modal">
            <!-- Header -->
            <div class="dcw-header">
                <h3><i class="fa-solid fa-wand-magic-sparkles" style="color: #00a8ef;"></i> DAILY CLOSING WIZARD</h3>
                <button class="dcw-close-btn" onclick="window.closeClosingWizard()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <!-- Steps Stepper -->
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

            <!-- Body Container -->
            <div class="dcw-body" id="dcwStepBody">
                <!-- Dynamically rendered per step -->
            </div>

            <!-- Footer Action Controls -->
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

    // 4. উইজার্ড স্টেট এবং লজিক
    let currentStep = 1;
    const TOTAL_STEPS = 5;

    const BRAND_COLORS = {
        'bkash': { bg: '#e11d48', icon: '<i class="fa-solid fa-paper-plane"></i>', text: 'bKash' },
        'nagad': { bg: '#ea580c', icon: '<i class="fa-solid fa-fire"></i>', text: 'Nagad' },
        'rocket': { bg: '#8b5cf6', icon: '<i class="fa-solid fa-rocket"></i>', text: 'Rocket' },
        'upay': { bg: '#0284c7', icon: '<i class="fa-solid fa-u"></i>', text: 'Upay' },
        'tap': { bg: '#0f172a', icon: '<i class="fa-solid fa-hand-pointer"></i>', text: 'Tap' },
        'dbbl': { bg: '#047857', icon: '<i class="fa-solid fa-building-columns"></i>', text: 'DBBL' },
        'trust': { bg: '#1e3a8a', icon: '<i class="fa-solid fa-shield-halved"></i>', text: 'Trust Bank' },
        'gp': { bg: '#00a8ef', icon: '<i class="fa-solid fa-tower-broadcast"></i>', text: 'GP' },
        'robi': { bg: '#dc2626', icon: '<i class="fa-solid fa-tower-broadcast"></i>', text: 'Robi' },
        'airtel': { bg: '#b91c1c', icon: '<i class="fa-solid fa-tower-broadcast"></i>', text: 'Airtel' },
        'banglalink': { bg: '#f97316', icon: '<i class="fa-solid fa-tower-broadcast"></i>', text: 'Banglalink' }
    };

    function getBrandMeta(accName) {
        const nameLower = (accName || '').toLowerCase();
        for (let key in BRAND_COLORS) {
            if (nameLower.includes(key)) return BRAND_COLORS[key];
        }
        return { bg: '#4f46e5', icon: '<i class="fa-solid fa-wallet"></i>', text: accName };
    }

    // উইজার্ড ওপেন ও ক্লোজ ফাংশন
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

    // বর্তমান স্টেপ রেন্ডারিং
    function renderWizardCurrentStep() {
        // নেভিগেশন স্টেপার আপডেট
        for (let i = 1; i <= TOTAL_STEPS; i++) {
            const navEl = document.getElementById(`dcwStepNav${i}`);
            if (!navEl) continue;
            navEl.classList.remove('active', 'completed');
            if (i === currentStep) {
                navEl.classList.add('active');
            } else if (i < currentStep) {
                navEl.classList.add('completed');
            }
        }

        // বাটন নিয়ন্ত্রণ
        const prevBtn = document.getElementById('dcwBtnPrev');
        const nextBtn = document.getElementById('dcwBtnNext');
        prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

        if (currentStep === TOTAL_STEPS) {
            nextBtn.className = 'dcw-btn dcw-btn-finish';
            nextBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Complete & Close Wizard';
        } else {
            nextBtn.className = 'dcw-btn dcw-btn-next';
            nextBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save & Continue';
        }

        const body = document.getElementById('dcwStepBody');

        // ধাপ অনুযায়ী কন্টেন্ট তৈরি
        if (currentStep === 1) renderStepAccountsCategory(body, 'Bank Accounts', 'Update Bank Accounts', 'Enter the end-of-day closing balances for all bank accounts.');
        else if (currentStep === 2) renderStepAccountsCategory(body, 'Agent Accounts', 'Update Agent Accounts', 'Enter the end-of-day balances for all agent wallets.');
        else if (currentStep === 3) renderStepAccountsCategory(body, 'Recharge Balances', 'Update Recharge Accounts', 'Enter closing balances for all SIM recharge accounts.');
        else if (currentStep === 4) renderStepCashInventory(body);
        else if (currentStep === 5) renderStepCardInventory(body);
    }

    // অ্যাকাউন্ট ক্যাটাগরি রেন্ডারার (Step 1, 2, 3)
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
            <div class="dcw-grid">
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

    // ক্যাশ ইনভেন্টরি রেন্ডারার (Step 4)
    function renderStepCashInventory(container) {
        const cashQ = window.cashQuantities || {};
        const others = window.cashOthersAmount || 0;
        const denoms = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];

        let rowsHtml = '';
        let total = 0;

        denoms.forEach(d => {
            const q = parseInt(cashQ[d]) || 0;
            const lineVal = q * d;
            total += lineVal;
            rowsHtml += `
                <div class="dcw-cash-row">
                    <strong style="color: #1e293b; font-size: 0.95rem;">৳ ${d} Note</strong>
                    <input type="number" min="0" class="dcw-input-field" style="padding: 8px; text-align: center;" id="dcwCashQty_${d}" value="${q}" oninput="window.calcWizardCashTotal()">
                    <div style="text-align: right; font-weight: 700; color: #047857;" id="dcwCashVal_${d}">৳ ${lineVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
            `;
        });

        total += parseFloat(others) || 0;

        container.innerHTML = `
            <div class="dcw-step-title">Physical Cash Audit</div>
            <div class="dcw-step-desc">Enter the count of each cash note denomination in the drawer.</div>
            <div style="border: 1.5px solid #e2e8f0; border-radius: 14px; overflow: hidden; background: #fff;">
                ${rowsHtml}
                <div class="dcw-cash-row" style="background: #f8fafc;">
                    <strong style="color: #00a8ef; font-size: 0.95rem;">Others / Coins</strong>
                    <input type="number" step="any" min="0" class="dcw-input-field" style="padding: 8px; text-align: center;" id="dcwCashOthers" value="${others}" oninput="window.calcWizardCashTotal()">
                    <div style="text-align: right; font-weight: 700; color: #00a8ef;" id="dcwCashValOthers">৳ ${parseFloat(others || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>
            <div class="dcw-summary-strip">
                <span>Total Cash Amount</span>
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

    // কার্ড ইনভেন্টরি রেন্ডারার (Step 5)
    function renderStepCardInventory(container) {
        const cardCfg = window.cardConfig || {};
        const cardQ = window.cardQuantities || {};
        const ops = ['GP', 'Banglalink', 'Robi', 'Airtel'];

        let html = `
            <div class="dcw-step-title">Scratch Cards Inventory</div>
            <div class="dcw-step-desc">Audit remaining stock count of all scratch cards by operator.</div>
        `;

        ops.forEach(op => {
            const cards = (cardCfg[op] || []).filter(c => c.active !== false);
            const opQtys = cardQ[op] || {};

            let rows = '';
            cards.forEach(c => {
                const q = parseInt(opQtys[c.id]) || 0;
                rows += `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #f1f5f9;">
                        <div>
                            <strong style="color: #1e293b;">${c.name}</strong>
                            <span style="font-size: 0.75rem; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; margin-left: 6px;">৳${c.price}</span>
                        </div>
                        <input type="number" min="0" class="dcw-input-field" style="width: 90px; padding: 6px; text-align: center;" id="dcwCardInp_${op}_${c.id}" value="${q}">
                    </div>
                `;
            });

            html += `
                <div style="margin-bottom: 15px; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #fff;">
                    <div style="background: #f8fafc; padding: 10px 15px; font-weight: 800; font-size: 0.95rem; color: #0f172a; border-bottom: 1px solid #e2e8f0;">
                        ${op} Cards
                    </div>
                    ${rows || '<div style="padding: 12px; color: #94a3b8; font-size: 0.85rem;">No cards active.</div>'}
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // প্রতি ধাপে সেভ ও প্রসেসিং
    window.saveAndProceedWizardStep = async function () {
        if (typeof window.showLoader === 'function') window.showLoader("Saving step data...");

        try {
            // STEP 1, 2, 3 SAVING (Accounts)
            if (currentStep >= 1 && currentStep <= 3) {
                const inputs = document.querySelectorAll('#dcwStepBody input[id^="dcwInp_"]');
                inputs.forEach(inp => {
                    const accId = inp.id.replace('dcwInp_', '');
                    const val = parseFloat(inp.value) || 0;
                    if (window.balanceStore) {
                        window.balanceStore[accId] = val;
                    }
                });

                if (typeof window.writeToFirebase === 'function' || window.db) {
                    await writeFirebaseDirect('erp/balances', window.balanceStore);
                }
            }
            // STEP 4 SAVING (Cash)
            else if (currentStep === 4) {
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
            }
            // STEP 5 SAVING (Card)
            else if (currentStep === 5) {
                const ops = ['GP', 'Banglalink', 'Robi', 'Airtel'];
                if (!window.cardQuantities) window.cardQuantities = {};

                ops.forEach(op => {
                    if (!window.cardQuantities[op]) window.cardQuantities[op] = {};
                    const cards = (window.cardConfig && window.cardConfig[op]) || [];
                    cards.forEach(c => {
                        const inp = document.getElementById(`dcwCardInp_${op}_${c.id}`);
                        if (inp) {
                            window.cardQuantities[op][c.id] = parseInt(inp.value) || 0;
                        }
                    });
                });

                await writeFirebaseDirect('erp/cardInventory', window.cardQuantities);
            }

            // ড্যাশবোর্ড আপডেট কল
            if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();

            if (typeof window.hideLoader === 'function') window.hideLoader();
            if (typeof window.showToast === 'function') window.showToast(`Step ${currentStep} saved!`, 'success');

            // পরবর্তী স্টেপে যাওয়া বা শেষ করা
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

    // ফায়ারবেস সেভ হেল্পার
    async function writeFirebaseDirect(path, data) {
        if (window.writeToFirebase) {
            return await window.writeToFirebase(path, data);
        }
    }

    // 5. ইউআই-তে বাটন ইনজেক্ট করা (Sidebar & Daily Closing Header)
    function injectWizardTriggerButtons() {
        // সাইডবারে সাব-মেনু যুক্ত করা
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

        // Daily Closing Form সেকশনের হেডার-এ কুইক বাটন যুক্ত করা
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

    // ডম রেডি হলে বাটন যুক্ত করা
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWizardTriggerButtons);
    } else {
        injectWizardTriggerButtons();
    }
    setTimeout(injectWizardTriggerButtons, 1500);

})();
