/**
 * Mousumi Computer ERP - Daily Liquid Asset & Balance Input Hub
 * File: daily_asset_input_module.js
 * Feature: Operator Filter Pills (All / GP / Banglalink / Robi / Airtel),
 *          Precise Sidebar Menu Placement,
 *          Native FontAwesome Icons & Master Config Bridge.
 */

(function () {
    // ১. স্টাইলিং ও সিএসএস
    const moduleStyles = `
        <style id="asset-hub-styles">
            #asset-hub-view { 
                font-family: 'Tiro Bangla', serif !important; 
                text-transform: none !important; 
                color: #0f172a; 
                padding: 15px 25px 95px 25px; 
                position: relative; 
            }
            #asset-hub-view * { 
                font-family: 'Tiro Bangla', serif !important; 
                text-transform: none !important; 
                box-sizing: border-box; 
            }

            .hub-top-ctrl {
                background: #fff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 10px 16px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
            }
            .hub-date-wrap { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; }
            .hub-date-wrap input { height: 32px; padding: 0 10px; border: 1px solid #94a3b8; border-radius: 4px; font-size: 13px; font-weight: 700; outline: none; background: #fff; }

            /* উইজার্ড সেকশন বক্স */
            .hub-wizard-sec {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                margin-bottom: 18px;
                overflow: hidden;
                transition: border-color 0.2s;
            }
            .hub-wizard-sec.active { 
                border-color: #0f172a; 
                border-width: 1.5px; 
            }

            .hub-wizard-head {
                background: #f8fafc;
                padding: 10px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                user-select: none;
                border-bottom: 1px solid #cbd5e1;
            }
            .hub-wizard-sec:not(.active) .hub-wizard-head { border-bottom: none; }
            .hub-wizard-head:hover { background: #f1f5f9; }

            .hub-wizard-title { font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
            .hub-wizard-meta { display: flex; align-items: center; gap: 16px; font-size: 12px; font-weight: 700; color: #334155; }
            
            .hub-native-arrow {
                font-size: 11px;
                display: inline-block;
                transition: transform 0.2s ease;
                color: #64748b;
            }
            .hub-wizard-sec:not(.active) .hub-native-arrow { transform: rotate(-90deg); }
            .hub-wizard-sec:not(.active) .hub-wizard-body { display: none; }

            .hub-wizard-body { padding: 16px 20px; }

            /* স্লিম স্ট্রিপ গ্রিড */
            .hub-strip-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 10px 16px;
                margin-bottom: 15px;
            }
            .hub-strip-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 6px 12px;
            }
            .hub-strip-item:hover { border-color: #94a3b8; }
            .hub-strip-label { font-size: 12.5px; font-weight: 800; color: #0f172a; }
            .hub-input-wrap { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #64748b; }
            
            .hub-inp-text {
                width: 115px;
                height: 28px;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 0 8px;
                font-size: 12.5px;
                font-weight: 800;
                text-align: right;
                outline: none;
                background: #fff;
            }
            .hub-inp-text:focus { border-color: #0f172a; }

            .hub-qty-inp {
                width: 65px;
                height: 28px;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                text-align: center;
                font-size: 12.5px;
                font-weight: 800;
                outline: none;
                background: #fff;
            }
            .hub-qty-inp:focus { border-color: #0f172a; }
            .hub-sub-val { font-size: 12px; font-weight: 800; min-width: 75px; text-align: right; color: #0f172a; }

            /* অপারেটর ফিল্টার পিলস */
            .card-op-filter-bar {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 15px;
                flex-wrap: wrap;
            }
            .op-pill-btn {
                padding: 5px 14px;
                border: 1px solid #cbd5e1;
                border-radius: 20px;
                background: #fff;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                transition: 0.2s;
                color: #334155;
            }
            .op-pill-btn:hover { background: #f1f5f9; }
            .op-pill-btn.active {
                background: #0f172a;
                color: #fff;
                border-color: #0f172a;
            }

            .op-segment-box {
                margin-bottom: 16px;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 10px 14px;
                background: #ffffff;
            }
            .op-segment-header {
                font-size: 12.5px;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 10px;
                padding-bottom: 5px;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .hub-step-footer { display: flex; justify-content: flex-end; padding-top: 10px; border-top: 1px solid #f1f5f9; }
            .hub-btn-next {
                background: #fff;
                border: 1.5px solid #0f172a;
                color: #0f172a;
                padding: 6px 16px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 800;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                transition: 0.2s;
            }
            .hub-btn-next:hover { background: #0f172a; color: #fff; }

            /* ভাসমান সেভ বাটন */
            .hub-floating-btn {
                position: fixed;
                bottom: 25px;
                right: 35px;
                background: #0f172a;
                color: #fff;
                border: none;
                padding: 11px 24px;
                border-radius: 50px;
                font-size: 13px;
                font-weight: 800;
                cursor: pointer;
                box-shadow: 0 6px 20px rgba(0,0,0,0.25);
                display: flex;
                align-items: center;
                gap: 8px;
                z-index: 9999;
                transition: transform 0.2s, background 0.2s;
            }
            .hub-floating-btn:hover { background: #1e293b; transform: scale(1.04); }

            /* হিস্ট্রি কার্ড */
            .hub-history-card {
                background: #fff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 12px 18px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 12px;
            }
            .hub-hist-date { font-size: 13px; font-weight: 800; }
            .hub-hist-date span { font-size: 11px; font-weight: normal; color: #64748b; margin-left: 5px; }
            .hub-hist-stats { display: flex; gap: 20px; font-size: 12px; font-weight: 700; color: #334155; }
            .hub-hist-total { font-size: 13.5px; font-weight: 800; color: #0f172a; }
            .hub-icon-btn {
                background: #fff;
                border: 1px solid #cbd5e1;
                border-radius: 4px;
                padding: 5px 9px;
                cursor: pointer;
                font-size: 11px;
                margin-left: 4px;
            }
            .hub-icon-btn:hover { border-color: #000; background: #f1f5f9; }
            .hub-icon-delete { color: #dc2626; border-color: #fecaca; }
            .hub-icon-delete:hover { background: #fee2e2; border-color: #dc2626; }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', moduleStyles);

    // ২. সাইডবারে সঠিক পজিশনে মেনু ইনজেকশন (FontAwesome Chevron আইকন সহ)
    function injectSidebarMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-asset-hub-parent')) return;

        const menuItemHTML = `
            <li class="menu-item" id="menu-asset-hub-parent">
                <a onclick="window.toggleParentMenu('menu-asset-hub-parent')">
                    <span class="menu-link-inner"><i class="fa-solid fa-coins"></i> <span>Daily Asset Hub</span></span>
                    <span class="chevron-icon"><i class="fa-solid fa-chevron-down"></i></span>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item active" id="sub-asset-entry">
                        <a onclick="window.switchAssetHubSubTab('entry')"><span><i class="fa-solid fa-chevron-right" style="font-size: 10px; margin-right: 4px;"></i> Balance Entry</span></a>
                    </li>
                    <li class="submenu-item" id="sub-asset-history">
                        <a onclick="window.switchAssetHubSubTab('history')"><span><i class="fa-solid fa-chevron-right" style="font-size: 10px; margin-right: 4px;"></i> Entry History</span></a>
                    </li>
                </ul>
            </li>
        `;

        // Daily Closing মেনুর ঠিক ওপরে ইনসার্ট করা
        const dailyClosingMenu = document.getElementById('menu-closing-parent');
        if (dailyClosingMenu) {
            dailyClosingMenu.insertAdjacentHTML('beforebegin', menuItemHTML);
        } else {
            menuList.insertAdjacentHTML('beforeend', menuItemHTML);
        }
    }

    // ৩. ভিউ প্যানেল ইনজেকশন
    function injectViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('asset-hub-view')) return;

        const viewPanelHTML = `
            <div class="view-panel" id="asset-hub-view">
                <!-- SUB-TAB 1: BALANCE ENTRY -->
                <div id="hub-tab-entry">
                    <div class="hub-top-ctrl">
                        <div class="hub-date-wrap">
                            <label>Statement Date:</label>
                            <input type="date" id="hubSelectedDate" onchange="window.onAssetHubDateChange()">
                        </div>
                        <div style="font-size: 13px; font-weight: 800;">
                            Live Total: <span id="hubLiveGrandTotal">৳ 0.00</span>
                        </div>
                    </div>

                    <div id="hubWizardContainer">
                        <!-- Dynamic Categories, Cash, and Segmented Cards loaded here -->
                    </div>

                    <!-- ভাসমান সেভ বাটন -->
                    <button class="hub-floating-btn" onclick="window.saveAssetHubToFirebase()">
                        &#10003; Save Balance
                    </button>
                </div>

                <!-- SUB-TAB 2: ENTRY HISTORY -->
                <div id="hub-tab-history" style="display: none;">
                    <div class="hub-top-ctrl">
                        <div style="font-size: 13px; font-weight: 800;">Archived Daily Asset Snapshots</div>
                        <button class="hub-icon-btn" onclick="window.renderAssetHistoryList()">&#8635; Reload</button>
                    </div>
                    <div id="hubHistoryListContainer"></div>
                </div>
            </div>
        `;
        mainWrapper.insertAdjacentHTML('beforeend', viewPanelHTML);
    }

    const fmt = (n) => (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

    let currentBalances = {};
    let currentCash = {};
    let currentCards = {};
    let allHistoryRecords = [];
    let activeCardFilter = 'ALL';

    // ৪. মাস্টার কনফিগ ডেটা ফেচিং
    function getMasterAccountsAndCategories() {
        const rawCats = window.accountManagerData?.categories || window.categories || [];
        const rawAccs = window.accountManagerData?.accounts || window.accounts || [];

        const cats = (Array.isArray(rawCats) ? rawCats : Object.values(rawCats))
            .filter(c => c.enabled !== false)
            .sort((a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0));

        const accs = (Array.isArray(rawAccs) ? rawAccs : Object.values(rawAccs))
            .filter(a => a.enabled !== false);

        return { cats, accs };
    }

    function getMasterCardConfig() {
        return window.cardManagerData?.cards || window.cardConfig || {};
    }

    // ৫. সাব-ট্যাব সুইচিং
    window.switchAssetHubSubTab = function (tabType) {
        window.switchMainTab('asset-hub');
        document.querySelectorAll('#menu-asset-hub-parent .submenu-item').forEach(i => i.classList.remove('active'));

        const entrySec = document.getElementById('hub-tab-entry');
        const histSec = document.getElementById('hub-tab-history');

        if (tabType === 'entry') {
            if (entrySec) entrySec.style.display = 'block';
            if (histSec) histSec.style.display = 'none';
            document.getElementById('sub-asset-entry')?.classList.add('active');
            window.loadAssetHubInputs();
        } else {
            if (entrySec) entrySec.style.display = 'none';
            if (histSec) histSec.style.display = 'block';
            document.getElementById('sub-asset-history')?.classList.add('active');
            window.renderAssetHistoryList();
        }
    };

    // ৬. তারিখ পরিবর্তনে ডেটা লোড
    window.onAssetHubDateChange = async function () {
        const d = document.getElementById('hubSelectedDate').value;
        if (typeof window.showLoader === 'function') window.showLoader("Loading records for " + d);

        try {
            let existingRecord = null;
            if (window.getDatabase && window.ref && window.get) {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_balance_snapshots/${d}`));
                if (snap.exists()) existingRecord = snap.val();
            }

            if (existingRecord) {
                currentBalances = { ...(existingRecord.balances || {}) };
                currentCash = { ...(existingRecord.cash || {}) };
                currentCards = { ...(existingRecord.cards || {}) };
                if (typeof window.showToast === 'function') window.showToast(`Loaded snapshot for ${d}`, "info");
            } else {
                currentBalances = { ...(window.balanceStore || {}) };
                currentCash = { ...(window.cashQuantities || {}), others: window.cashOthersAmount || 0 };
                currentCards = { ...(window.cardQuantities || {}) };
            }
            window.renderWizardUI();
        } catch (e) {
            console.error("Fetch Error:", e);
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ৭. ফিল্টার বাটন হ্যান্ডলার
    window.filterCardOperatorView = function (opName) {
        activeCardFilter = opName;
        document.querySelectorAll('.op-pill-btn').forEach(btn => {
            if (btn.getAttribute('data-op') === opName) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        document.querySelectorAll('.op-segment-box').forEach(box => {
            const boxOp = box.getAttribute('data-op');
            if (opName === 'ALL' || boxOp === opName) {
                box.style.display = 'block';
            } else {
                box.style.display = 'none';
            }
        });
    };

    // ৮. উইজার্ড ইন্টারফেস রেন্ডারার (FontAwesome Chevron আইকন সহ)
    window.renderWizardUI = function () {
        const container = document.getElementById('hubWizardContainer');
        if (!container) return;
        container.innerHTML = '';

        const { cats, accs } = getMasterAccountsAndCategories();
        const cardConfig = getMasterCardConfig();

        let stepIndex = 1;

        // ১. অ্যাকাউন্টস সেকশন
        cats.forEach(cat => {
            const catAccs = accs.filter(a => a.catId === cat.id);
            if (catAccs.length === 0) return;

            let catSubtotal = 0;
            let stripsHTML = '';

            catAccs.forEach(acc => {
                const bal = parseFloat(currentBalances[acc.id]) || 0;
                catSubtotal += bal;

                let cleanName = acc.name
                    .replace(/personal\s*accounts?|agent\s*accounts?|bank\s*accounts?|recharge/gi, '')
                    .replace(/personal|agent|account|bank/gi, '')
                    .trim();
                if (!cleanName) cleanName = acc.name;

                stripsHTML += `
                    <div class="hub-strip-item">
                        <span class="hub-strip-label">${cleanName}</span>
                        <div class="hub-input-wrap">
                            <span>৳</span>
                            <input type="number" step="any" class="hub-inp-text" value="${bal}" 
                                oninput="window.updateHubBalance('${acc.id}', this.value, 'cat-sub-${cat.id}')">
                        </div>
                    </div>
                `;
            });

            const currentStepId = `hub-sec-${stepIndex}`;
            const nextStepId = `hub-sec-${stepIndex + 1}`;
            const isFirst = (stepIndex === 1);

            const sectionHTML = `
                <div class="hub-wizard-sec ${isFirst ? 'active' : ''}" id="${currentStepId}">
                    <div class="hub-wizard-head" onclick="window.toggleSingleWizardSec('${currentStepId}')">
                        <span class="hub-wizard-title">${stepIndex}. ${cat.name}</span>
                        <div class="hub-wizard-meta">
                            <span id="cat-sub-${cat.id}">Subtotal: ৳ ${fmt(catSubtotal)}</span>
                            <i class="fa-solid fa-chevron-down hub-native-arrow"></i>
                        </div>
                    </div>
                    <div class="hub-wizard-body">
                        <div class="hub-strip-grid">${stripsHTML}</div>
                        <div class="hub-step-footer">
                            <button class="hub-btn-next" onclick="window.wizardGoToNext('${nextStepId}')">
                                Next Step &rarr;
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', sectionHTML);
            stepIndex++;
        });

        // ২. ক্যাশ ড্রয়ার সেকশন
        let cashSubtotal = 0;
        let cashStripsHTML = '';
        [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(note => {
            const q = parseInt(currentCash[note]) || 0;
            const line = q * note;
            cashSubtotal += line;
            cashStripsHTML += `
                <div class="hub-strip-item">
                    <span class="hub-strip-label">৳ ${note}</span>
                    <div class="hub-input-wrap">
                        <input type="number" class="hub-qty-inp" placeholder="0" value="${q}" 
                            oninput="window.updateHubCash(${note}, this.value, 'cash-line-${note}')">
                        <span class="hub-sub-val" id="cash-line-${note}">${fmt(line)}</span>
                    </div>
                </div>
            `;
        });
        const othersAmt = parseFloat(currentCash.others) || 0;
        cashSubtotal += othersAmt;
        cashStripsHTML += `
            <div class="hub-strip-item">
                <span class="hub-strip-label">Coins & Loose</span>
                <div class="hub-input-wrap">
                    <span>৳</span>
                    <input type="number" step="any" class="hub-inp-text" value="${othersAmt}" 
                        oninput="window.updateHubCashOthers(this.value)">
                </div>
            </div>
        `;

        const cashSecId = `hub-sec-${stepIndex}`;
        const cardsSecId = `hub-sec-${stepIndex + 1}`;

        container.insertAdjacentHTML('beforeend', `
            <div class="hub-wizard-sec" id="${cashSecId}">
                <div class="hub-wizard-head" onclick="window.toggleSingleWizardSec('${cashSecId}')">
                    <span class="hub-wizard-title">${stepIndex}. Cash Drawer</span>
                    <div class="hub-wizard-meta">
                        <span id="cash-subtotal-disp">Total Cash: ৳ ${fmt(cashSubtotal)}</span>
                        <i class="fa-solid fa-chevron-down hub-native-arrow"></i>
                    </div>
                </div>
                <div class="hub-wizard-body">
                    <div class="hub-strip-grid">${cashStripsHTML}</div>
                    <div class="hub-step-footer">
                        <button class="hub-btn-next" onclick="window.wizardGoToNext('${cardsSecId}')">
                            Next: Cards Stock &rarr;
                        </button>
                    </div>
                </div>
            </div>
        `);
        stepIndex++;

        // ৩. কার্ডস স্টক সেকশন
        let grandCardSubtotal = 0;
        let operatorBlocksHTML = '';
        const operatorList = ['GP', 'Banglalink', 'Robi', 'Airtel'];

        operatorList.forEach(op => {
            const rawCards = cardConfig[op] || [];
            const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
            const opQtys = currentCards[op] || {};

            let opSubtotal = 0;
            let opStripsHTML = '';

            opCards.filter(c => c.active !== false).forEach(c => {
                const q = parseInt(opQtys[c.id]) || 0;
                const line = q * (parseFloat(c.price) || 0);
                opSubtotal += line;
                grandCardSubtotal += line;

                opStripsHTML += `
                    <div class="hub-strip-item">
                        <span class="hub-strip-label">${c.name} (${c.price}৳)</span>
                        <div class="hub-input-wrap">
                            <input type="number" class="hub-qty-inp" placeholder="0" value="${q}" 
                                oninput="window.updateHubCard('${op}', '${c.id}', ${c.price}, this.value, 'card-line-${c.id}', 'op-sub-${op}')">
                            <span class="hub-sub-val" id="card-line-${c.id}">${fmt(line)}</span>
                        </div>
                    </div>
                `;
            });

            if (opStripsHTML) {
                operatorBlocksHTML += `
                    <div class="op-segment-box" data-op="${op}">
                        <div class="op-segment-header">
                            <span>${op} Operator Cards</span>
                            <span id="op-sub-${op}">Subtotal: ৳ ${fmt(opSubtotal)}</span>
                        </div>
                        <div class="hub-strip-grid">${opStripsHTML}</div>
                    </div>
                `;
            }
        });

        const filterPillsHTML = `
            <div class="card-op-filter-bar">
                <button class="op-pill-btn active" data-op="ALL" onclick="window.filterCardOperatorView('ALL')">All Operators</button>
                ${operatorList.map(op => `<button class="op-pill-btn" data-op="${op}" onclick="window.filterCardOperatorView('${op}')">${op}</button>`).join('')}
            </div>
        `;

        container.insertAdjacentHTML('beforeend', `
            <div class="hub-wizard-sec" id="${cardsSecId}">
                <div class="hub-wizard-head" onclick="window.toggleSingleWizardSec('${cardsSecId}')">
                    <span class="hub-wizard-title">${stepIndex}. Cards Stock</span>
                    <div class="hub-wizard-meta">
                        <span id="cards-subtotal-disp">Total Cards: ৳ ${fmt(grandCardSubtotal)}</span>
                        <i class="fa-solid fa-chevron-down hub-native-arrow"></i>
                    </div>
                </div>
                <div class="hub-wizard-body">
                    ${filterPillsHTML}
                    ${operatorBlocksHTML || '<p style="font-size:12px;color:#64748b;">No active cards in Card Setup.</p>'}
                    <div class="hub-step-footer">
                        <span style="font-size: 12px; font-weight: 700; color: #16a34a;">&#10003; All sections reviewed. Click Save Balance below.</span>
                    </div>
                </div>
            </div>
        `);

        window.recalculateGrandLiveTotal();
    };

    // ৯. উইজার্ড নেভিগেশন
    window.toggleSingleWizardSec = function (secId) {
        document.querySelectorAll('.hub-wizard-sec').forEach(sec => {
            if (sec.id === secId) sec.classList.toggle('active');
            else sec.classList.remove('active');
        });
    };

    window.wizardGoToNext = function (nextSecId) {
        document.querySelectorAll('.hub-wizard-sec').forEach(sec => sec.classList.remove('active'));
        const nextSec = document.getElementById(nextSecId);
        if (nextSec) {
            nextSec.classList.add('active');
            nextSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // ১০. লাইভ ক্যালকুলেশন
    window.updateHubBalance = function (accId, val) {
        currentBalances[accId] = parseFloat(val) || 0;
        window.recalculateGrandLiveTotal();
    };

    window.updateHubCash = function (note, val, lineId) {
        const q = parseInt(val) || 0;
        currentCash[note] = q;
        const line = q * note;
        const lineEl = document.getElementById(lineId);
        if (lineEl) lineEl.innerText = fmt(line);
        window.recalculateGrandLiveTotal();
    };

    window.updateHubCashOthers = function (val) {
        currentCash.others = parseFloat(val) || 0;
        window.recalculateGrandLiveTotal();
    };

    window.updateHubCard = function (op, cardId, price, val, lineId, opSubId) {
        if (!currentCards[op]) currentCards[op] = {};
        const q = parseInt(val) || 0;
        currentCards[op][cardId] = q;
        const line = q * price;
        const lineEl = document.getElementById(lineId);
        if (lineEl) lineEl.innerText = fmt(line);

        const cardConfig = getMasterCardConfig();
        const rawCards = cardConfig[op] || [];
        const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
        let opTotal = 0;
        opCards.forEach(c => opTotal += ((parseInt(currentCards[op]?.[c.id]) || 0) * (parseFloat(c.price) || 0)));
        const opSubEl = document.getElementById(opSubId);
        if (opSubEl) opSubEl.innerText = `Subtotal: ৳ ${fmt(opTotal)}`;

        window.recalculateGrandLiveTotal();
    };

    window.recalculateGrandLiveTotal = function () {
        let total = 0;
        // Accounts
        Object.values(currentBalances).forEach(v => total += (parseFloat(v) || 0));
        // Cash
        [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => total += ((parseInt(currentCash[n]) || 0) * n));
        total += (parseFloat(currentCash.others) || 0);
        // Cards
        let cardsTotal = 0;
        const cardConfig = getMasterCardConfig();
        ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
            const rawCards = cardConfig[op] || [];
            const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
            const opQtys = currentCards[op] || {};
            opCards.forEach(c => cardsTotal += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
        });
        total += cardsTotal;

        const cardsSubEl = document.getElementById('cards-subtotal-disp');
        if (cardsSubEl) cardsSubEl.innerText = `Total Cards: ৳ ${fmt(cardsTotal)}`;

        const liveEl = document.getElementById('hubLiveGrandTotal');
        if (liveEl) liveEl.innerText = `৳ ${fmt(total)}`;
    };

    // ১১. ফায়ারবেসে ফাইনাল সেভ
    window.saveAssetHubToFirebase = async function () {
        const d = document.getElementById('hubSelectedDate').value || new Date().toISOString().split('T')[0];
        if (typeof window.showLoader === 'function') window.showLoader("Saving Daily Asset Data...");

        try {
            const snapshotObj = {
                date: d,
                timestamp: Date.now(),
                balances: { ...currentBalances },
                cash: { ...currentCash },
                cards: { ...currentCards }
            };

            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`erp/daily_balance_snapshots/${d}`, snapshotObj);
            }

            const todayStr = new Date().toISOString().split('T')[0];
            if (d === todayStr && typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`erp/balances`, currentBalances);
                await window.writeToFirebase(`erp/cashInventory`, { quantities: currentCash, others: currentCash.others || 0 });
                await window.writeToFirebase(`erp/cardInventory`, currentCards);
            }

            if (typeof window.showToast === 'function') window.showToast(`Balance recorded for ${d}!`, "success");
            else alert(`Balance recorded for ${d}!`);
        } catch (e) {
            console.error("Save Error:", e);
            if (typeof window.showToast === 'function') window.showToast("Error saving data!", "error");
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ১২. হিস্ট্রি রেন্ডারার
    window.renderAssetHistoryList = async function () {
        const container = document.getElementById('hubHistoryListContainer');
        if (!container) return;
        container.innerHTML = '<p style="font-size:12px; padding:15px;">Loading history records...</p>';

        try {
            if (window.getDatabase && window.ref && window.get) {
                const snap = await window.get(window.ref(window.getDatabase(), `erp/daily_balance_snapshots`));
                if (snap.exists()) {
                    const data = snap.val();
                    allHistoryRecords = Object.values(data).sort((a,b) => b.date.localeCompare(a.date));
                } else {
                    allHistoryRecords = [];
                }
            }

            if (allHistoryRecords.length === 0) {
                container.innerHTML = '<p style="font-size:12px; padding:20px; color:#64748b;">No saved records found.</p>';
                return;
            }

            container.innerHTML = '';
            const cardConfig = getMasterCardConfig();

            allHistoryRecords.forEach(rec => {
                let aTotal = 0, cTotal = 0, cardTotal = 0;
                Object.values(rec.balances || {}).forEach(v => aTotal += (parseFloat(v) || 0));
                [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTotal += ((parseInt(rec.cash?.[n]) || 0) * n));
                cTotal += (parseFloat(rec.cash?.others) || 0);

                ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                    const rawCards = cardConfig[op] || [];
                    const opCards = Array.isArray(rawCards) ? rawCards : Object.values(rawCards);
                    const opQtys = rec.cards?.[op] || {};
                    opCards.forEach(c => cardTotal += ((parseInt(opQtys[c.id]) || 0) * (parseFloat(c.price) || 0)));
                });

                const grand = aTotal + cTotal + cardTotal;
                const timeStr = rec.timestamp ? new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                const cardHTML = `
                    <div class="hub-history-card">
                        <div class="hub-hist-date">
                            ${rec.date} <span>(${timeStr})</span>
                        </div>
                        <div class="hub-hist-stats">
                            <div>Accounts: ৳ ${fmt(aTotal)}</div>
                            <div>Cash: ৳ ${fmt(cTotal)}</div>
                            <div>Cards: ৳ ${fmt(cardTotal)}</div>
                        </div>
                        <div class="hub-hist-total">Total: ৳ ${fmt(grand)}</div>
                        <div>
                            <button class="hub-icon-btn" title="Edit / Load" onclick="window.loadHistoricalRecordToForm('${rec.date}')">Edit</button>
                            <button class="hub-icon-btn" title="View Audit Report" onclick="window.viewAuditFromHistory('${rec.date}')">Report</button>
                            <button class="hub-icon-btn hub-icon-delete" title="Delete" onclick="window.deleteHistoricalRecord('${rec.date}')">Delete</button>
                        </div>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        } catch (e) {
            container.innerHTML = '<p style="color:red; font-size:12px;">Failed to load history.</p>';
        }
    };

    window.loadHistoricalRecordToForm = function (dateStr) {
        document.getElementById('hubSelectedDate').value = dateStr;
        window.switchAssetHubSubTab('entry');
        window.onAssetHubDateChange();
    };

    window.viewAuditFromHistory = function (dateStr) {
        if (typeof window.switchMainTab === 'function') {
            window.switchMainTab('liquid-audit');
            const dInput = document.getElementById('liquidStatementDate');
            if (dInput) {
                dInput.value = dateStr;
                if (typeof window.renderLiquidStatementReport === 'function') {
                    window.renderLiquidStatementReport();
                }
            }
        }
    };

    window.deleteHistoricalRecord = function (dateStr) {
        if (confirm(`Are you sure you want to delete the record for ${dateStr}?`)) {
            if (typeof window.writeToFirebase === 'function') {
                window.writeToFirebase(`erp/daily_balance_snapshots/${dateStr}`, null).then(() => {
                    window.renderAssetHistoryList();
                });
            }
        }
    };

    window.loadAssetHubInputs = function () {
        const dInput = document.getElementById('hubSelectedDate');
        if (dInput && !dInput.value) {
            dInput.value = new Date().toISOString().split('T')[0];
        }
        window.onAssetHubDateChange();
    };

    function init() {
        injectSidebarMenu();
        injectViewPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
