/**
 * Mousumi ERP - Master Configuration Addon Module
 * (Account Setup + Card Setup + Collection Setup)
 * Language: English | Font: Tiro Bangla | Pure Text, Tables & Clean Shapes
 */

(function () {
    let dbInstance = null;
    let dbRef = null;
    let dbSet = null;
    let dbGet = null;

    // ডিফল্ট কালেকশন আইটেম (যাতে আগের কোনো হিসাব হারিয়ে না যায়)
    const DEFAULT_COLLECTION_CONFIG = [
        { id: 'col_1', category: 'banking', name: 'bKash', order: 1, active: true },
        { id: 'col_2', category: 'banking', name: 'Nagad', order: 2, active: true },
        { id: 'col_3', category: 'banking', name: 'Rocket', order: 3, active: true },
        { id: 'col_4', category: 'banking', name: 'Tap', order: 4, active: true },
        { id: 'col_5', category: 'banking', name: 'Cant Public', order: 5, active: true },
        { id: 'col_6', category: 'recharge', name: 'Grameen-1', order: 1, active: true },
        { id: 'col_7', category: 'recharge', name: 'Grameen-2', order: 2, active: true },
        { id: 'col_8', category: 'recharge', name: 'Banglalink', order: 3, active: true },
        { id: 'col_9', category: 'recharge', name: 'Robi', order: 4, active: true },
        { id: 'col_10', category: 'recharge', name: 'Airtel', order: 5, active: true },
        { id: 'col_11', category: 'services', name: 'Photocopy', order: 1, active: true },
        { id: 'col_12', category: 'services', name: 'Computer', order: 2, active: true },
        { id: 'col_13', category: 'services', name: 'Others', order: 3, active: true }
    ];

    async function initFirebaseBridge() {
        try {
            const { getApps, initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getDatabase, ref, set, get } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            let app;
            const apps = getApps();
            if (apps.length > 0) {
                app = apps[0];
            } else {
                app = initializeApp({
                    apiKey: "AIzaSyA1PhRiTkICNCd8sA4he3ZxKjHtIzM0d5E",
                    authDomain: "mousumi-computer.firebaseapp.com",
                    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                    projectId: "mousumi-computer"
                });
            }
            dbInstance = getDatabase(app);
            dbRef = ref;
            dbSet = set;
            dbGet = get;

            // কালেকশন কনফিগ ক্লাউড থেকে ফেচ করা
            syncCollectionConfigFromCloud();
        } catch (err) {
            console.warn("Firebase Bridge fallback:", err);
        }
    }

    async function saveToFirebase(path, data) {
        if (dbInstance && dbSet && dbRef) {
            try {
                await dbSet(dbRef(dbInstance, path), data);
                return true;
            } catch (e) {
                console.error("Firebase write error:", e);
            }
        }
        return false;
    }

    async function syncCollectionConfigFromCloud() {
        if (dbInstance && dbGet && dbRef) {
            try {
                const snap = await dbGet(dbRef(dbInstance, 'erp/collection_config'));
                if (snap.exists() && Array.isArray(snap.val()) && snap.val().length > 0) {
                    window.collectionConfig = snap.val();
                } else {
                    window.collectionConfig = DEFAULT_COLLECTION_CONFIG;
                    await saveToFirebase('erp/collection_config', DEFAULT_COLLECTION_CONFIG);
                }
            } catch (e) {
                window.collectionConfig = DEFAULT_COLLECTION_CONFIG;
            }
        } else {
            window.collectionConfig = DEFAULT_COLLECTION_CONFIG;
        }
    }

    // ফিল্টার স্টেট
    let activeAccCatFilter = 'ALL';
    let activeCardFilter = 'ALL';
    let activeColFilter = 'ALL';

    function injectStyles() {
        if (document.getElementById('mc-dropdown-styles')) return;
        const style = document.createElement('style');
        style.id = 'mc-dropdown-styles';
        style.innerHTML = `
            #master-config-view, #master-config-view * {
                font-family: 'Tiro Bangla', 'Plus Jakarta Sans', serif !important;
                box-sizing: border-box;
            }
            .mc-box-card {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 18px;
                margin-bottom: 20px;
            }
            .mc-box-title {
                font-size: 1.15rem;
                font-weight: bold;
                color: #0f172a;
                border-bottom: 2px solid #e2e8f0;
                padding-bottom: 10px;
                margin-bottom: 16px;
            }
            .mc-form-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                align-items: flex-end;
                margin-bottom: 15px;
                background: #f8fafc;
                padding: 12px;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
            }
            .mc-input-group {
                display: flex;
                flex-direction: column;
                gap: 4px;
                flex: 1;
                min-width: 130px;
            }
            .mc-input-group label {
                font-size: 0.85rem;
                font-weight: bold;
                color: #334155;
            }
            .mc-input-control {
                height: 36px;
                padding: 0 10px;
                border: 1px solid #94a3b8;
                border-radius: 4px;
                font-size: 0.95rem;
                outline: none;
                background: #ffffff;
            }
            .mc-input-control:focus { border-color: #0284c7; }
            .mc-btn {
                height: 36px;
                padding: 0 16px;
                border: 1px solid transparent;
                border-radius: 4px;
                font-size: 0.92rem;
                font-weight: bold;
                cursor: pointer;
            }
            .mc-btn-primary { background: #0284c7; color: #ffffff; }
            .mc-btn-primary:hover { background: #0369a1; }
            .mc-btn-edit { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; padding: 2px 8px; font-size: 0.85rem; cursor: pointer; border-radius: 4px; font-weight: bold; }
            .mc-btn-edit:hover { background: #0284c7; color: #ffffff; }
            .mc-btn-danger { background: #fee2e2; color: #dc2626; border: 1px solid #fca5a5; padding: 2px 8px; font-size: 0.85rem; cursor: pointer; border-radius: 4px; font-weight: bold; }
            .mc-btn-danger:hover { background: #dc2626; color: #ffffff; }
            .mc-btn-cancel { background: #e2e8f0; color: #475569; }
            .mc-btn-cancel:hover { background: #cbd5e1; }
            .mc-btn-toggle { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 8px; font-size: 0.85rem; cursor: pointer; border-radius: 4px; font-weight: bold; }
            .mc-btn-active { background: #dcfce7; color: #15803d; border-color: #86efac; }
            .mc-btn-inactive { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
            .mc-table-responsive { overflow-x: auto; }
            .mc-simple-table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
            .mc-simple-table th, .mc-simple-table td {
                border: 1px solid #cbd5e1;
                padding: 8px 10px;
                text-align: left;
            }
            .mc-simple-table th { background-color: #f8fafc; color: #334155; font-weight: bold; }
            .mc-simple-table tr:hover { background-color: #f8fafc; }
            .mc-text-right { text-align: right; }
            .mc-text-center { text-align: center; }
            .mc-filter-links { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
            .mc-filter-btn {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                padding: 5px 12px;
                border-radius: 4px;
                font-size: 0.85rem;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s;
            }
            .mc-filter-btn.active { background: #0f172a; color: #ffffff; border-color: #0f172a; }
        `;
        document.head.appendChild(style);
    }

    // সাইডবারে Card Setup-এর নিচে ৩ নম্বর "Collection Setup" যুক্ত করা
    function injectSidebarDropdownMenu() {
        if (document.getElementById('menu-master-config-parent')) return;
        const menuList = document.querySelector('#sidebar .menu-list');
        if (!menuList) return;

        const li = document.createElement('li');
        li.className = 'menu-item';
        li.id = 'menu-master-config-parent';
        li.innerHTML = `
            <a onclick="window.toggleMasterConfigParent()">
                <span class="menu-link-inner">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Master Config</span>
                </span>
                <i class="fa-solid fa-chevron-down chevron-icon"></i>
            </a>
            <ul class="submenu-list">
                <li class="submenu-item" id="sub-mc-accounts">
                    <a onclick="window.switchMCSubSection('accounts')">
                        <i class="fa-solid fa-angle-right"></i> <span>Account Setup</span>
                    </a>
                </li>
                <li class="submenu-item" id="sub-mc-cards">
                    <a onclick="window.switchMCSubSection('cards')">
                        <i class="fa-solid fa-angle-right"></i> <span>Card Setup</span>
                    </a>
                </li>
                <li class="submenu-item" id="sub-mc-collections">
                    <a onclick="window.switchMCSubSection('collections')">
                        <i class="fa-solid fa-angle-right"></i> <span>Collection Setup</span>
                    </a>
                </li>
            </ul>
        `;

        const closingParent = document.getElementById('menu-closing-parent');
        if (closingParent && closingParent.nextSibling) {
            menuList.insertBefore(li, closingParent.nextSibling);
        } else {
            menuList.appendChild(li);
        }
    }

    // ভিউ প্যানেল ইনজেকশন (নতুন Collection Setup প্যানেল সহ)
    function injectViewPanel() {
        if (document.getElementById('master-config-view')) return;
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        const panel = document.createElement('div');
        panel.className = 'view-panel';
        panel.id = 'master-config-view';
        panel.innerHTML = `
            <!-- ১. অ্যাকাউন্ট সেটআপ সেকশন -->
            <div id="mc-panel-accounts" style="display: none;">
                <div class="mc-box-card">
                    <div class="mc-box-title">Account Management & Setup</div>
                    <form class="mc-form-row" id="mcAccountForm" onsubmit="window.saveMCAccount(event)">
                        <input type="hidden" id="mcAccEditId" value="">
                        <div class="mc-input-group" style="max-width: 90px;">
                            <label>SL No.</label>
                            <input type="number" id="mcAccSerial" class="mc-input-control" value="1" required>
                        </div>
                        <div class="mc-input-group">
                            <label>Category</label>
                            <select id="mcAccCat" class="mc-input-control" required></select>
                        </div>
                        <div class="mc-input-group" style="flex: 2;">
                            <label>Account Name</label>
                            <input type="text" id="mcAccName" class="mc-input-control" placeholder="e.g. Dutch Bangla Bank or Bkash Agent" required>
                        </div>
                        <div class="mc-input-group">
                            <label>Balance (৳)</label>
                            <input type="number" step="any" id="mcAccBalance" class="mc-input-control" placeholder="0.00" value="0">
                        </div>
                        <button type="submit" class="mc-btn mc-btn-primary" id="mcBtnAccSubmit">Save Account</button>
                        <button type="button" class="mc-btn mc-btn-cancel" id="mcBtnAccCancel" style="display:none;" onclick="window.cancelMCAccEdit()">Cancel</button>
                    </form>

                    <div class="mc-filter-links" id="mcAccFilterContainer"></div>

                    <div class="mc-table-responsive">
                        <table class="mc-simple-table">
                            <thead>
                                <tr>
                                    <th style="width: 8%;" class="mc-text-center">SL</th>
                                    <th style="width: 22%;">Category</th>
                                    <th style="width: 32%;">Account Name</th>
                                    <th style="width: 18%;" class="mc-text-right">Balance (৳)</th>
                                    <th style="width: 10%;" class="mc-text-center">Status</th>
                                    <th style="width: 10%;" class="mc-text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody id="mcAccTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ২. কার্ড সেটআপ সেকশন -->
            <div id="mc-panel-cards" style="display: none;">
                <div class="mc-box-card">
                    <div class="mc-box-title">Card Inventory Configuration</div>
                    <form class="mc-form-row" id="mcCardForm" onsubmit="window.saveMCCard(event)">
                        <input type="hidden" id="mcCardEditId" value="">
                        <input type="hidden" id="mcCardOldOp" value="">

                        <div class="mc-input-group" style="max-width: 90px;">
                            <label>SL No.</label>
                            <input type="number" id="mcCardSerial" class="mc-input-control" value="1" required>
                        </div>
                        <div class="mc-input-group">
                            <label>Operator</label>
                            <select id="mcCardOp" class="mc-input-control" required>
                                <option value="GP">GP</option>
                                <option value="Banglalink">Banglalink</option>
                                <option value="Robi">Robi</option>
                                <option value="Airtel">Airtel</option>
                            </select>
                        </div>
                        <div class="mc-input-group" style="flex: 1.5;">
                            <label>Type</label>
                            <select id="mcCardType" class="mc-input-control" required>
                                <option value="Recharge">Recharge</option>
                                <option value="Minute">Minute</option>
                                <option value="MB">MB</option>
                                <option value="Combo">Combo</option>
                            </select>
                        </div>
                        <div class="mc-input-group">
                            <label>Rate (৳)</label>
                            <input type="number" step="any" id="mcCardPrice" class="mc-input-control" placeholder="e.g. 20 or 99" required>
                        </div>
                        <button type="submit" class="mc-btn mc-btn-primary" id="mcBtnCardSubmit">Save Card</button>
                        <button type="button" class="mc-btn mc-btn-cancel" id="mcBtnCardCancel" style="display:none;" onclick="window.cancelMCCardEdit()">Cancel</button>
                    </form>

                    <div class="mc-filter-links">
                        <button class="mc-filter-btn active" onclick="window.filterMCCards('ALL')">All Operators</button>
                        <button class="mc-filter-btn" onclick="window.filterMCCards('GP')">GP</button>
                        <button class="mc-filter-btn" onclick="window.filterMCCards('Banglalink')">Banglalink</button>
                        <button class="mc-filter-btn" onclick="window.filterMCCards('Robi')">Robi</button>
                        <button class="mc-filter-btn" onclick="window.filterMCCards('Airtel')">Airtel</button>
                    </div>

                    <div class="mc-table-responsive">
                        <table class="mc-simple-table">
                            <thead>
                                <tr>
                                    <th style="width: 8%;" class="mc-text-center">SL</th>
                                    <th style="width: 20%;">Operator</th>
                                    <th style="width: 30%;" class="mc-text-center">Type</th>
                                    <th style="width: 22%;" class="mc-text-right">Rate (৳)</th>
                                    <th style="width: 10%;" class="mc-text-center">Status</th>
                                    <th style="width: 10%;" class="mc-text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody id="mcCardTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ৩. নতুন কালেকশন সেটআপ সেকশন (Collection Heads Setup) -->
            <div id="mc-panel-collections" style="display: none;">
                <div class="mc-box-card">
                    <div class="mc-box-title">Counter Daily Collection Heads Setup</div>
                    <form class="mc-form-row" id="mcColHeadForm" onsubmit="window.saveMCColHead(event)">
                        <input type="hidden" id="mcColEditId" value="">

                        <div class="mc-input-group" style="max-width: 90px;">
                            <label>SL No.</label>
                            <input type="number" id="mcColSerial" class="mc-input-control" value="1" required>
                        </div>
                        <div class="mc-input-group">
                            <label>Category</label>
                            <select id="mcColCat" class="mc-input-control" required>
                                <option value="banking">Mobile Banking</option>
                                <option value="recharge">Operator Recharge</option>
                                <option value="services">Counter Services</option>
                            </select>
                        </div>
                        <div class="mc-input-group" style="flex: 2;">
                            <label>Head / Service Name</label>
                            <input type="text" id="mcColName" class="mc-input-control" placeholder="e.g. Upay, Bkash, Photocopy" required>
                        </div>
                        <button type="submit" class="mc-btn mc-btn-primary" id="mcBtnColSubmit">Save Item</button>
                        <button type="button" class="mc-btn mc-btn-cancel" id="mcBtnColCancel" style="display:none;" onclick="window.cancelMCColEdit()">Cancel</button>
                    </form>

                    <div class="mc-filter-links">
                        <button class="mc-filter-btn active" onclick="window.filterMCCols('ALL')">All Heads</button>
                        <button class="mc-filter-btn" onclick="window.filterMCCols('banking')">Mobile Banking</button>
                        <button class="mc-filter-btn" onclick="window.filterMCCols('recharge')">Operator Recharge</button>
                        <button class="mc-filter-btn" onclick="window.filterMCCols('services')">Counter Services</button>
                    </div>

                    <div class="mc-table-responsive">
                        <table class="mc-simple-table">
                            <thead>
                                <tr>
                                    <th style="width: 8%;" class="mc-text-center">SL</th>
                                    <th style="width: 25%;">Category</th>
                                    <th style="width: 37%;">Head / Service Name</th>
                                    <th style="width: 15%;" class="mc-text-center">Status</th>
                                    <th style="width: 15%;" class="mc-text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody id="mcColTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.appendChild(panel);
    }

    // সাইডবার টগল
    window.toggleMasterConfigParent = function () {
        const parent = document.getElementById('menu-master-config-parent');
        if (parent) {
            const sub = parent.querySelector('.submenu-list');
            if (sub) sub.classList.toggle('show');
            parent.classList.toggle('open');
        }
    };

    // সাব-সেকশন সুইচিং (Accounts, Cards, Collections)
    window.switchMCSubSection = function (sectionKey) {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const masterPanel = document.getElementById('master-config-view');
        if (masterPanel) masterPanel.classList.add('active');

        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.submenu-item').forEach(si => si.classList.remove('active'));

        const parentMenu = document.getElementById('menu-master-config-parent');
        if (parentMenu) parentMenu.classList.add('active');

        const secAccounts = document.getElementById('mc-panel-accounts');
        const secCards = document.getElementById('mc-panel-cards');
        const secCols = document.getElementById('mc-panel-collections');
        const titleEl = document.getElementById('top-title');

        if (secAccounts) secAccounts.style.display = 'none';
        if (secCards) secCards.style.display = 'none';
        if (secCols) secCols.style.display = 'none';

        if (sectionKey === 'accounts') {
            document.getElementById('sub-mc-accounts')?.classList.add('active');
            if (secAccounts) secAccounts.style.display = 'block';
            if (titleEl) titleEl.innerText = "ACCOUNT MANAGEMENT & SETUP";
            populateCategoryDropdown();
            renderAccCategoryFilterButtons();
            renderMCAccountsTable();
        } else if (sectionKey === 'cards') {
            document.getElementById('sub-mc-cards')?.classList.add('active');
            if (secCards) secCards.style.display = 'block';
            if (titleEl) titleEl.innerText = "CARD INVENTORY CONFIGURATION";
            renderMCCardsTable();
        } else if (sectionKey === 'collections') {
            document.getElementById('sub-mc-collections')?.classList.add('active');
            if (secCols) secCols.style.display = 'block';
            if (titleEl) titleEl.innerText = "COLLECTION HEADS SETUP";
            renderMCColTable();
        }
    };

    function populateCategoryDropdown() {
        const sel = document.getElementById('mcAccCat');
        if (!sel) return;
        const current = sel.value;
        sel.innerHTML = '';

        const cats = Array.isArray(window.categories) ? window.categories : [];
        cats.filter(c => c.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(c => {
            const opt = document.createElement('option');
            opt.value = c.id;
            opt.innerText = c.name;
            sel.appendChild(opt);
        });

        if (current) sel.value = current;
    }

    function renderAccCategoryFilterButtons() {
        const container = document.getElementById('mcAccFilterContainer');
        if (!container) return;
        container.innerHTML = '';

        const cats = Array.isArray(window.categories) ? window.categories : [];
        const allBtn = document.createElement('button');
        allBtn.className = `mc-filter-btn ${activeAccCatFilter === 'ALL' ? 'active' : ''}`;
        allBtn.innerText = 'All Accounts';
        allBtn.onclick = () => window.filterMCAccounts('ALL');
        container.appendChild(allBtn);

        cats.filter(c => c.enabled !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `mc-filter-btn ${activeAccCatFilter === cat.id ? 'active' : ''}`;
            btn.innerText = cat.name;
            btn.onclick = () => window.filterMCAccounts(cat.id);
            container.appendChild(btn);
        });
    }

    window.filterMCAccounts = function (catId) {
        activeAccCatFilter = catId;
        renderAccCategoryFilterButtons();
        renderMCAccountsTable();
    };

    /* ==================== ACCOUNT OPERATIONS ==================== */
    function renderMCAccountsTable() {
        const tbody = document.getElementById('mcAccTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const accs = Array.isArray(window.accounts) ? window.accounts : [];
        const cats = Array.isArray(window.categories) ? window.categories : [];
        const balances = window.balanceStore || {};

        let list = [...accs].sort((a, b) => (a.order || 0) - (b.order || 0));
        if (activeAccCatFilter !== 'ALL') {
            list = list.filter(acc => acc.catId === activeAccCatFilter);
        }

        list.forEach((acc, idx) => {
            const cat = cats.find(c => c.id === acc.catId) || { name: 'General' };
            const bal = parseFloat(balances[acc.id]) || 0;
            const sl = acc.order || (idx + 1);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="mc-text-center" style="font-weight:bold;">${sl}</td>
                <td>${cat.name}</td>
                <td><strong>${acc.name}</strong></td>
                <td class="mc-text-right">৳ ${bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td class="mc-text-center">
                    <button class="mc-btn-toggle ${acc.enabled !== false ? 'mc-btn-active' : 'mc-btn-inactive'}" onclick="window.toggleMCAccStatus('${acc.id}')">
                        ${acc.enabled !== false ? 'Active' : 'Disabled'}
                    </button>
                </td>
                <td class="mc-text-center" style="white-space: nowrap;">
                    <button class="mc-btn-edit" onclick="window.editMCAccount('${acc.id}')">Edit</button>
                    <button class="mc-btn-danger" onclick="window.deleteMCAccount('${acc.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('mcAccSerial').value = (window.accounts || []).length + 1;
    }

    window.saveMCAccount = async function (e) {
        e.preventDefault();
        const editId = document.getElementById('mcAccEditId').value;
        const sl = parseInt(document.getElementById('mcAccSerial').value) || 1;
        const catId = document.getElementById('mcAccCat').value;
        const name = document.getElementById('mcAccName').value.trim();
        const bal = parseFloat(document.getElementById('mcAccBalance').value) || 0;

        if (!Array.isArray(window.accounts)) window.accounts = [];
        if (!window.balanceStore) window.balanceStore = {};

        if (editId) {
            const item = window.accounts.find(a => a.id === editId);
            if (item) {
                item.catId = catId;
                item.name = name;
                item.order = sl;
            }
            window.balanceStore[editId] = bal;
        } else {
            const newId = 'acc_' + Date.now();
            window.accounts.push({
                id: newId,
                catId: catId,
                name: name,
                order: sl,
                enabled: true
            });
            window.balanceStore[newId] = bal;
        }

        await saveToFirebase('erp/accounts', window.accounts);
        await saveToFirebase('erp/balances', window.balanceStore);

        if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();
        if (typeof window.showToast === 'function') window.showToast("Account saved successfully!", "success");

        window.cancelMCAccEdit();
        renderMCAccountsTable();
    };

    window.editMCAccount = function (id) {
        const item = (window.accounts || []).find(a => a.id === id);
        if (!item) return;

        document.getElementById('mcAccEditId').value = item.id;
        document.getElementById('mcAccSerial').value = item.order || 1;
        document.getElementById('mcAccCat').value = item.catId;
        document.getElementById('mcAccName').value = item.name;
        document.getElementById('mcAccBalance').value = window.balanceStore ? (window.balanceStore[item.id] || 0) : 0;

        document.getElementById('mcBtnAccSubmit').innerText = 'Update Account';
        document.getElementById('mcBtnAccCancel').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.cancelMCAccEdit = function () {
        document.getElementById('mcAccEditId').value = '';
        document.getElementById('mcAccName').value = '';
        document.getElementById('mcAccBalance').value = '0';
        document.getElementById('mcBtnAccSubmit').innerText = 'Save Account';
        document.getElementById('mcBtnAccCancel').style.display = 'none';
        document.getElementById('mcAccSerial').value = (window.accounts || []).length + 1;
    };

    window.toggleMCAccStatus = async function (id) {
        const item = (window.accounts || []).find(a => a.id === id);
        if (item) {
            item.enabled = item.enabled === false ? true : false;
            await saveToFirebase('erp/accounts', window.accounts);
            if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();
            renderMCAccountsTable();
        }
    };

    window.deleteMCAccount = function (id) {
        if (confirm("Are you sure you want to delete this account?")) {
            window.accounts = (window.accounts || []).filter(a => a.id !== id);
            if (window.balanceStore) delete window.balanceStore[id];

            saveToFirebase('erp/accounts', window.accounts);
            saveToFirebase('erp/balances', window.balanceStore);
            if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();
            renderMCAccountsTable();
        }
    };

    /* ==================== CARD OPERATIONS ==================== */
    function getAllCardsFlatList() {
        const config = window.cardConfig || {};
        const list = [];
        ['GP', 'Banglalink', 'Robi', 'Airtel'].forEach(op => {
            const opCards = Array.isArray(config[op]) ? config[op] : Object.values(config[op] || {});
            opCards.forEach((c, idx) => {
                list.push({
                    ...c,
                    op: op,
                    sl: c.order || (idx + 1)
                });
            });
        });
        return list;
    }

    function renderMCCardsTable() {
        const tbody = document.getElementById('mcCardTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        let allCards = getAllCardsFlatList().sort((a, b) => a.sl - b.sl);
        if (activeCardFilter !== 'ALL') {
            allCards = allCards.filter(c => c.op === activeCardFilter);
        }

        allCards.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="mc-text-center" style="font-weight:bold;">${c.sl}</td>
                <td><strong>${c.op}</strong></td>
                <td class="mc-text-center">${c.type || 'Recharge'}</td>
                <td class="mc-text-right">৳ ${c.price || 0}</td>
                <td class="mc-text-center">
                    <button class="mc-btn-toggle ${c.active !== false ? 'mc-btn-active' : 'mc-btn-inactive'}" onclick="window.toggleMCCardStatus('${c.op}', '${c.id}')">
                        ${c.active !== false ? 'Active' : 'Disabled'}
                    </button>
                </td>
                <td class="mc-text-center" style="white-space: nowrap;">
                    <button class="mc-btn-edit" onclick="window.editMCCard('${c.op}', '${c.id}')">Edit</button>
                    <button class="mc-btn-danger" onclick="window.deleteMCCard('${c.op}', '${c.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('mcCardSerial').value = allCards.length + 1;
    }

    window.saveMCCard = async function (e) {
        e.preventDefault();
        const editId = document.getElementById('mcCardEditId').value;
        const oldOp = document.getElementById('mcCardOldOp').value;
        const sl = parseInt(document.getElementById('mcCardSerial').value) || 1;
        const op = document.getElementById('mcCardOp').value;
        const type = document.getElementById('mcCardType').value;
        const price = parseFloat(document.getElementById('mcCardPrice').value) || 0;

        if (!window.cardConfig) window.cardConfig = { GP: [], Banglalink: [], Robi: [], Airtel: [] };
        if (!Array.isArray(window.cardConfig[op])) window.cardConfig[op] = Object.values(window.cardConfig[op] || {});

        if (editId) {
            if (oldOp && oldOp !== op && Array.isArray(window.cardConfig[oldOp])) {
                window.cardConfig[oldOp] = window.cardConfig[oldOp].filter(c => c.id !== editId);
            }
            const existing = (window.cardConfig[op] || []).find(c => c.id === editId);
            if (existing) {
                existing.name = type;
                existing.type = type;
                existing.price = price;
                existing.order = sl;
            } else {
                window.cardConfig[op].push({
                    id: editId,
                    name: type,
                    type: type,
                    price: price,
                    order: sl,
                    active: true
                });
            }
        } else {
            const newId = 'card_' + Date.now();
            window.cardConfig[op].push({
                id: newId,
                name: type,
                type: type,
                price: price,
                order: sl,
                active: true
            });
        }

        await saveToFirebase('erp/cardConfig', window.cardConfig);
        if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();
        if (typeof window.showToast === 'function') window.showToast("Card saved successfully!", "success");

        window.cancelMCCardEdit();
        renderMCCardsTable();
    };

    window.editMCCard = function (op, id) {
        const list = Array.isArray(window.cardConfig[op]) ? window.cardConfig[op] : Object.values(window.cardConfig[op] || {});
        const item = list.find(c => c.id === id);
        if (!item) return;

        document.getElementById('mcCardEditId').value = item.id;
        document.getElementById('mcCardOldOp').value = op;
        document.getElementById('mcCardSerial').value = item.order || 1;
        document.getElementById('mcCardOp').value = op;
        document.getElementById('mcCardType').value = item.type || 'Recharge';
        document.getElementById('mcCardPrice').value = item.price || 0;

        document.getElementById('mcBtnCardSubmit').innerText = 'Update Card';
        document.getElementById('mcBtnCardCancel').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.cancelMCCardEdit = function () {
        document.getElementById('mcCardEditId').value = '';
        document.getElementById('mcCardOldOp').value = '';
        document.getElementById('mcCardPrice').value = '';
        document.getElementById('mcBtnCardSubmit').innerText = 'Save Card';
        document.getElementById('mcBtnCardCancel').style.display = 'none';
        document.getElementById('mcCardSerial').value = getAllCardsFlatList().length + 1;
    };

    window.toggleMCCardStatus = async function (op, id) {
        const list = Array.isArray(window.cardConfig[op]) ? window.cardConfig[op] : Object.values(window.cardConfig[op] || {});
        const item = list.find(c => c.id === id);
        if (item) {
            item.active = item.active === false ? true : false;
            await saveToFirebase('erp/cardConfig', window.cardConfig);
            if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();
            renderMCCardsTable();
        }
    };

    window.deleteMCCard = function (op, id) {
        if (confirm("Are you sure you want to delete this card?")) {
            if (Array.isArray(window.cardConfig[op])) {
                window.cardConfig[op] = window.cardConfig[op].filter(c => c.id !== id);
            }
            saveToFirebase('erp/cardConfig', window.cardConfig);
            if (typeof window.updateDashboardCards === 'function') window.updateDashboardCards();
            renderMCCardsTable();
        }
    };

    window.filterMCCards = function (op) {
        activeCardFilter = op;
        document.querySelectorAll('#mc-panel-cards .mc-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.includes(op) || (op === 'ALL' && btn.innerText.includes('All'))) {
                btn.classList.add('active');
            }
        });
        renderMCCardsTable();
    };

    /* ==================== ৩. COLLECTION HEADS OPERATIONS ==================== */
    function getCategoryLabel(cat) {
        if (cat === 'banking') return 'Mobile Banking';
        if (cat === 'recharge') return 'Operator Recharge';
        if (cat === 'services') return 'Counter Services';
        return cat;
    }

    function renderMCColTable() {
        const tbody = document.getElementById('mcColTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!Array.isArray(window.collectionConfig)) {
            window.collectionConfig = DEFAULT_COLLECTION_CONFIG;
        }

        let list = [...window.collectionConfig].sort((a, b) => (a.order || 0) - (b.order || 0));
        if (activeColFilter !== 'ALL') {
            list = list.filter(item => item.category === activeColFilter);
        }

        list.forEach((item, idx) => {
            const sl = item.order || (idx + 1);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="mc-text-center" style="font-weight:bold;">${sl}</td>
                <td><span style="font-weight:600; color:#4338ca;">${getCategoryLabel(item.category)}</span></td>
                <td><strong>${item.name}</strong></td>
                <td class="mc-text-center">
                    <button class="mc-btn-toggle ${item.active !== false ? 'mc-btn-active' : 'mc-btn-inactive'}" onclick="window.toggleMCColStatus('${item.id}')">
                        ${item.active !== false ? 'Active' : 'Disabled'}
                    </button>
                </td>
                <td class="mc-text-center" style="white-space: nowrap;">
                    <button class="mc-btn-edit" onclick="window.editMCColHead('${item.id}')">Edit</button>
                    <button class="mc-btn-danger" onclick="window.deleteMCColHead('${item.id}')">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        document.getElementById('mcColSerial').value = (window.collectionConfig || []).length + 1;
    }

    window.saveMCColHead = async function (e) {
        e.preventDefault();
        const editId = document.getElementById('mcColEditId').value;
        const sl = parseInt(document.getElementById('mcColSerial').value) || 1;
        const cat = document.getElementById('mcColCat').value;
        const name = document.getElementById('mcColName').value.trim();

        if (!Array.isArray(window.collectionConfig)) window.collectionConfig = [];

        if (editId) {
            const item = window.collectionConfig.find(c => c.id === editId);
            if (item) {
                item.category = cat;
                item.name = name;
                item.order = sl;
            }
        } else {
            const newId = 'col_' + Date.now();
            window.collectionConfig.push({
                id: newId,
                category: cat,
                name: name,
                order: sl,
                active: true
            });
        }

        await saveToFirebase('erp/collection_config', window.collectionConfig);
        if (typeof window.showToast === 'function') window.showToast("Collection Head saved successfully!", "success");

        // যদি কালেকশন পেজ ব্যাকগ্রাউন্ডে খোলা থাকে তবে তা আপডেট করা
        if (typeof window.rebuildCollectionFormUI === 'function') window.rebuildCollectionFormUI();

        window.cancelMCColEdit();
        renderMCColTable();
    };

    window.editMCColHead = function (id) {
        const item = (window.collectionConfig || []).find(c => c.id === id);
        if (!item) return;

        document.getElementById('mcColEditId').value = item.id;
        document.getElementById('mcColSerial').value = item.order || 1;
        document.getElementById('mcColCat').value = item.category || 'banking';
        document.getElementById('mcColName').value = item.name || '';

        document.getElementById('mcBtnColSubmit').innerText = 'Update Item';
        document.getElementById('mcBtnColCancel').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.cancelMCColEdit = function () {
        document.getElementById('mcColEditId').value = '';
        document.getElementById('mcColName').value = '';
        document.getElementById('mcBtnColSubmit').innerText = 'Save Item';
        document.getElementById('mcBtnColCancel').style.display = 'none';
        document.getElementById('mcColSerial').value = (window.collectionConfig || []).length + 1;
    };

    window.toggleMCColStatus = async function (id) {
        const item = (window.collectionConfig || []).find(c => c.id === id);
        if (item) {
            item.active = item.active === false ? true : false;
            await saveToFirebase('erp/collection_config', window.collectionConfig);
            if (typeof window.rebuildCollectionFormUI === 'function') window.rebuildCollectionFormUI();
            renderMCColTable();
        }
    };

    window.deleteMCColHead = function (id) {
        if (confirm("Are you sure you want to delete this collection head?")) {
            window.collectionConfig = (window.collectionConfig || []).filter(c => c.id !== id);
            saveToFirebase('erp/collection_config', window.collectionConfig);
            if (typeof window.rebuildCollectionFormUI === 'function') window.rebuildCollectionFormUI();
            renderMCColTable();
        }
    };

    window.filterMCCols = function (cat) {
        activeColFilter = cat;
        document.querySelectorAll('#mc-panel-collections .mc-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.toLowerCase().includes(cat.toLowerCase()) || (cat === 'ALL' && btn.innerText.includes('All'))) {
                btn.classList.add('active');
            }
        });
        renderMCColTable();
    };

    // স্টার্টআপ ইনিশিয়ালাইজার
    function initMasterConfigModule() {
        initFirebaseBridge();
        injectStyles();
        injectSidebarDropdownMenu();
        injectViewPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMasterConfigModule);
    } else {
        initMasterConfigModule();
    }
})();
