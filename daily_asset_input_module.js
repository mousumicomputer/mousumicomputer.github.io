/**
 * Mousumi Computer ERP - Daily Liquid Asset & Balance Input Hub (Standalone Module)
 * File: daily_asset_input_module.js
 * Feature: Clean Strips, Single Accordion Wizard Flow, Date-wise Firebase Sync, Floating Action Button, History Manager
 */

(function () {
    // ১. প্রয়োজনীয় সিএসএস ইনজেকশন (Clean, No Tables, Tiro Bangla Font)
    const moduleStyles = `
        <style id="asset-hub-styles">
            #asset-hub-view { font-family: 'Tiro Bangla', serif !important; text-transform: none !important; color: #0f172a; padding: 15px 25px 95px 25px; position: relative; }
            #asset-hub-view * { font-family: 'Tiro Bangla', serif !important; text-transform: none !important; box-sizing: border-box; }

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
            .hub-date-wrap { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; }
            .hub-date-wrap input { height: 32px; padding: 0 10px; border: 1px solid #94a3b8; border-radius: 4px; font-size: 13px; font-weight: 700; outline: none; background: #fff; }

            /* উইজার্ড সেকশন কার্ড */
            .hub-wizard-sec {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                margin-bottom: 18px;
                overflow: hidden;
                transition: border-color 0.2s;
            }
            .hub-wizard-sec.active { border-color: #0f172a; border-width: 1.5px; }

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
            .hub-arrow-icon { font-size: 11px; transition: transform 0.2s ease; }
            .hub-wizard-sec:not(.active) .hub-arrow-icon { transform: rotate(-90deg); }
            .hub-wizard-sec:not(.active) .hub-wizard-body { display: none; }

            .hub-wizard-body { padding: 16px 20px; }

            /* স্ট্রিপ গ্রিড (No Tables) */
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

            /* উইজার্ড নেক্সট বাটন */
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

            /* হিস্ট্রি কার্ডস */
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

    // ২. সাইডবার মেনু ইনজেকশন (২টি সাব-মেনু সহ)
    function injectSidebarMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-asset-hub-parent')) return;

        const menuItemHTML = `
            <li class="menu-item" id="menu-asset-hub-parent">
                <a onclick="window.toggleParentMenu('menu-asset-hub-parent')">
                    <span class="menu-link-inner"><i class="fa-solid fa-coins"></i> <span>Daily Asset Hub</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item active" id="sub-asset-entry">
                        <a onclick="window.switchAssetHubSubTab('entry')"><i class="fa-solid fa-angle-right"></i> <span>Balance Entry</span></a>
                    </li>
                    <li class="submenu-item" id="sub-asset-history">
                        <a onclick="window.switchAssetHubSubTab('history')"><i class="fa-solid fa-angle-right"></i> <span>Entry History</span></a>
                    </li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', menuItemHTML);
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
                            <label><i class="fa-regular fa-calendar"></i> Statement Date:</label>
                            <input type="date" id="hubSelectedDate" onchange="window.onAssetHubDateChange()">
                        </div>
                        <div style="font-size: 13px; font-weight: 800;">
                            Live Total: <span id="hubLiveGrandTotal">৳ 0.00</span>
                        </div>
                    </div>

                    <div id="hubWizardContainer">
                        <!-- Dynamic Categories, Cash, and Cards will be loaded here -->
                    </div>

                    <!-- ভাসমান সেভ বাটন -->
                    <button class="hub-floating-btn" onclick="window.saveAssetHubToFirebase()">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Save Balance
                    </button>
                </div>

                <!-- SUB-TAB 2: ENTRY HISTORY -->
                <div id="hub-tab-history" style="display: none;">
                    <div class="hub-top-ctrl">
                        <div style="font-size: 13px; font-weight: 800;">Archived Daily Asset Snapshots</div>
                        <button class="hub-icon-btn" onclick="window.renderAssetHistoryList()"><i class="fa-solid fa-rotate-right"></i> Reload</button>
                    </div>
                    <div id="hubHistoryListContainer">
                        <!-- History Records Loaded here -->
                    </div>
                </div>

            </div>
        `;
        mainWrapper.insertAdjacentHTML('beforeend', viewPanelHTML);
    }

    // ফরম্যাটার
    const fmt = (n) => (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

    // স্টেট স্টোর
    let currentBalances = {};
    let currentCash = {};
    let currentCards = {};
    let allHistoryRecords = [];

    // ৪. সাব-ট্যাব সুইচিং
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

    // ৫. তারিখ পরিবর্তনে ডাটা হ্যান্ডলার
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
                if (typeof window.showToast === 'function') window.showToast(`Found saved snapshot for ${d}`, "info");
            } else {
                // ডিফল্ট বর্তমান রিয়েলটাইম স্টেট
                currentBalances = { ...(window.balanceStore || {}) };
                currentCash = { ...(window.cashQuantities || {}), others: window.cashOthersAmount || 0 };
                currentCards = { ...(window.cardQuantities || {}) };
            }
            window.renderWizardUI();
        } catch (e) {
            console.error(e);
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ৬. উইজার্ড ইন্টারফেস রেন্ডারার
    window.renderWizardUI = function () {
        const container = document.getElementById('hubWizardContainer');
        if (!container) return;
        container.innerHTML = '';

        const cats = (window.categories || []).filter(c => c.enabled !== false).sort((a,b) => a.order - b.order);
        const accs = window.accounts || [];

        let stepIndex = 1;
        const totalSteps = cats.length + 2; // Categories + Cash + Cards

        // ১. অ্যাকাউন্টস ক্যাটাগরি তৈরি
        cats.forEach((cat, idx) => {
            const catAccs = accs.filter(a => a.catId === cat.id && a.enabled !== false);
            if (catAccs.length === 0) return;

            let catSubtotal = 0;
            let stripsHTML = '';

            catAccs.forEach(acc => {
                const bal = parseFloat(currentBalances[acc.id]) || 0;
                catSubtotal += bal;
                
                // পরিচ্ছন্ন ছোট নাম তৈরি (অপ্রয়োজনীয় রিপিটেশন দূর করা)
                let cleanName = acc.name.replace(/personal|agent|account|bank/gi, '').trim();
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
                            <i class="fa-solid fa-chevron-down hub-arrow-icon"></i>
                        </div>
                    </div>
                    <div class="hub-wizard-body">
                        <div class="hub-strip-grid">
                            ${stripsHTML}
                        </div>
                        <div class="hub-step-footer">
                            <button class="hub-btn-next" onclick="window.wizardGoToNext('${nextStepId}')">
                                Next Step <i class="fa-solid fa-arrow-right"></i>
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
                        <i class="fa-solid fa-chevron-down hub-arrow-icon"></i>
                    </div>
                </div>
                <div class="hub-wizard-body">
                    <div class="hub-strip-grid">${cashStripsHTML}</div>
                    <div class="hub-step-footer">
                        <button class="hub-btn-next" onclick="window.wizardGoToNext('${cardsSecId}')">
                            Next: Cards Stock <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `);
        stepIndex++;

        // ৩. কার্ডস স্টক সেকশন
        let cardSubtotal = 0;
        let cardStripsHTML = '';
        const cardConfig = window.cardConfig || {};

        ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
            const opCards = cardConfig[op] || [];
            const opQtys = currentCards[op] || {};

            opCards.filter(c => c.active !== false).forEach(c => {
                const q = parseInt(opQtys[c.id]) || 0;
                const line = q * (c.price || 0);
                cardSubtotal += line;
                cardStripsHTML += `
                    <div class="hub-strip-item">
                        <span class="hub-strip-label">${op} ${c.name} (${c.price}৳)</span>
                        <div class="hub-input-wrap">
                            <input type="number" class="hub-qty-inp" placeholder="0" value="${q}" 
                                oninput="window.updateHubCard('${op}', '${c.id}', ${c.price}, this.value, 'card-line-${c.id}')">
                            <span class="hub-sub-val" id="card-line-${c.id}">${fmt(line)}</span>
                        </div>
                    </div>
                `;
            });
        });

        container.insertAdjacentHTML('beforeend', `
            <div class="hub-wizard-sec" id="${cardsSecId}">
                <div class="hub-wizard-head" onclick="window.toggleSingleWizardSec('${cardsSecId}')">
                    <span class="hub-wizard-title">${stepIndex}. Cards Stock</span>
                    <div class="hub-wizard-meta">
                        <span id="cards-subtotal-disp">Total Cards: ৳ ${fmt(cardSubtotal)}</span>
                        <i class="fa-solid fa-chevron-down hub-arrow-icon"></i>
                    </div>
                </div>
                <div class="hub-wizard-body">
                    <div class="hub-strip-grid">${cardStripsHTML || '<p style="font-size:12px;color:#64748b;">No active cards configured.</p>'}</div>
                    <div class="hub-step-footer">
                        <span style="font-size: 12px; font-weight: 700; color: #16a34a;"><i class="fa-solid fa-check"></i> All steps reviewed. Click floating Save button to finish.</span>
                    </div>
                </div>
            </div>
        `);

        window.recalculateGrandLiveTotal();
    };

    // ৭. সিঙ্গেল অ্যাকর্ডিয়ন ও নেক্সট লজিক
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

    // ৮. লাইভ ক্যালকুলেশন হ্যান্ডলার্স
    window.updateHubBalance = function (accId, val, subId) {
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

    window.updateHubCard = function (op, cardId, price, val, lineId) {
        if (!currentCards[op]) currentCards[op] = {};
        const q = parseInt(val) || 0;
        currentCards[op][cardId] = q;
        const line = q * price;
        const lineEl = document.getElementById(lineId);
        if (lineEl) lineEl.innerText = fmt(line);
        window.recalculateGrandLiveTotal();
    };

    window.recalculateGrandLiveTotal = function () {
        let total = 0;
        // Accs
        Object.values(currentBalances).forEach(v => total += (parseFloat(v) || 0));
        // Cash
        [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => total += ((parseInt(currentCash[n]) || 0) * n));
        total += (parseFloat(currentCash.others) || 0);
        // Cards
        const cardConfig = window.cardConfig || {};
        ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
            const opCards = cardConfig[op] || [];
            const opQtys = currentCards[op] || {};
            opCards.forEach(c => total += ((parseInt(opQtys[c.id]) || 0) * (c.price || 0)));
        });

        const liveEl = document.getElementById('hubLiveGrandTotal');
        if (liveEl) liveEl.innerText = `৳ ${fmt(total)}`;
    };

    // ৯. ফায়ারবেসে ফাইনাল সেভ
    window.saveAssetHubToFirebase = async function () {
        const d = document.getElementById('hubSelectedDate').value || new Date().toISOString().split('T')[0];
        if (typeof window.showLoader === 'function') window.showLoader("Saving Asset Hub Data...");

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

            // যদি আজকের তারিখ সেভ করা হয়, তবে লাইভ স্টেটও আপডেট হয়ে যাবে
            const todayStr = new Date().toISOString().split('T')[0];
            if (d === todayStr) {
                if (typeof window.writeToFirebase === 'function') {
                    await window.writeToFirebase(`erp/balances`, currentBalances);
                    await window.writeToFirebase(`erp/cashInventory`, { quantities: currentCash, others: currentCash.others || 0 });
                    await window.writeToFirebase(`erp/cardInventory`, currentCards);
                }
            }

            if (typeof window.showToast === 'function') window.showToast(`Balances successfully recorded for ${d}!`, "success");
            else alert(`Balances successfully recorded for ${d}!`);
        } catch (e) {
            console.error("Save Error:", e);
            if (typeof window.showToast === 'function') window.showToast("Error saving data!", "error");
        } finally {
            if (typeof window.hideLoader === 'function') window.hideLoader();
        }
    };

    // ১০. হিস্ট্রি রেন্ডারার (Date & Time সহ)
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
            allHistoryRecords.forEach(rec => {
                let aTotal = 0, cTotal = 0, cardTotal = 0;
                Object.values(rec.balances || {}).forEach(v => aTotal += (parseFloat(v) || 0));
                [1000, 500, 200, 100, 50, 20, 10, 5, 2].forEach(n => cTotal += ((parseInt(rec.cash?.[n]) || 0) * n));
                cTotal += (parseFloat(rec.cash?.others) || 0);

                const cardConfig = window.cardConfig || {};
                ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
                    const opCards = cardConfig[op] || [];
                    const opQtys = rec.cards?.[op] || {};
                    opCards.forEach(c => cardTotal += ((parseInt(opQtys[c.id]) || 0) * (c.price || 0)));
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
                            <button class="hub-icon-btn" title="Edit / Load" onclick="window.loadHistoricalRecordToForm('${rec.date}')"><i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="hub-icon-btn" title="View Audit Report" onclick="window.viewAuditFromHistory('${rec.date}')"><i class="fa-solid fa-file-invoice"></i></button>
                            <button class="hub-icon-btn hub-icon-delete" title="Delete" onclick="window.deleteHistoricalRecord('${rec.date}')"><i class="fa-solid fa-trash"></i></button>
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

    // ১১. ইনিশিয়ালাইজেশন
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
