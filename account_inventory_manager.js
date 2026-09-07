/**
 * Mousumi ERP - Master Configuration Addon Module
 * (Accounts, Card Inventory & Others Setup)
 * Language: English | Font: Tiro Bangla | Zero Core Modification
 */

(function () {
    // ১. ফায়ারবেস মডিউলার ডাটাবেজ সংযোগ ইঞ্জিন
    let dbInstance = null;
    let dbRef = null;
    let dbSet = null;

    async function initFirebaseBridge() {
        try {
            const { getApp, getApps, initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getDatabase, ref, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

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
        } catch (err) {
            console.warn("Firebase Bridge fallback active:", err);
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

    // ২. লোকাল মেমোরি স্টোর
    let activeCardFilter = 'ALL';

    // ৩. সিএসএস স্টাইল ইনজেকশন
    function injectStyles() {
        if (document.getElementById('master-config-styles')) return;
        const style = document.createElement('style');
        style.id = 'master-config-styles';
        style.innerHTML = `
            #master-config-view, #master-config-view * {
                font-family: 'Tiro Bangla', 'Plus Jakarta Sans', serif !important;
                box-sizing: border-box;
            }
            .mc-page-header {
                background: #ffffff;
                padding: 14px 20px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                margin-bottom: 15px;
                font-size: 1.25rem;
                font-weight: bold;
                color: #0f172a;
            }
            .mc-accordion-box {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                margin-bottom: 15px;
                overflow: hidden;
            }
            .mc-accordion-header {
                background: #f8fafc;
                padding: 13px 18px;
                font-size: 1.05rem;
                font-weight: bold;
                color: #0f172a;
                cursor: pointer;
                display: flex;
                justify-content: space-between;
                align-items: center;
                user-select: none;
                border-bottom: 1px solid #e2e8f0;
            }
            .mc-accordion-header:hover { background: #f1f5f9; }
            .mc-accordion-header.active { border-bottom: 2px solid #0284c7; color: #0284c7; }
            .mc-accordion-content { padding: 16px; display: block; }
            
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
            
            .mc-filter-links { display: flex; gap: 8px; margin-bottom: 10px; }
            .mc-filter-btn {
                background: #ffffff;
                border: 1px solid #cbd5e1;
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 0.85rem;
                cursor: pointer;
                font-weight: bold;
            }
            .mc-filter-btn.active { background: #0f172a; color: #ffffff; border-color: #0f172a; }
        `;
        document.head.appendChild(style);
    }

    // ৪. সাইডবারে বাটন ইনজেকশন
    function injectSidebarMenu() {
        if (document.getElementById('menu-master-config')) return;
        const menuList = document.querySelector('#sidebar .menu-list');
        if (!menuList) return;

        const li = document.createElement('li');
        li.className = 'menu-item';
        li.id = 'menu-master-config';
        li.innerHTML = `
            <a onclick="window.openMasterConfigPanel()">
                <span class="menu-link-inner">
                    <i class="fa-solid fa-sliders"></i>
                    <span>Master Config</span>
                </span>
            </a>
        `;

        // Daily Closing বা Settings এর নিচে বসানো
        const closingMenu = document.getElementById('menu-closing-parent');
        if (closingMenu && closingMenu.nextSibling) {
            menuList.insertBefore(li, closingMenu.nextSibling);
        } else {
            menuList.appendChild(li);
        }
    }

    // ৫. ভিউ প্যানেল ইনজেকশন
    function injectViewPanel() {
        if (document.getElementById('master-config-view')) return;
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        const panel = document.createElement('div');
        panel.className = 'view-panel';
        panel.id = 'master-config-view';
        panel.innerHTML = `
            <div class="mc-page-header">
                Master Configuration (Account, Card & Others Management)
            </div>

            <!-- SECTION 1: ACCOUNT MANAGEMENT -->
            <div class="mc-accordion-box">
                <div class="mc-accordion-header active" id="mc-header-1" onclick="window.toggleMCAcordion(1)">
                    <span>1. Account Management & Setup</span>
                    <span id="mc-icon-1">▼</span>
                </div>
                <div class="mc-accordion-content" id="mc-content-1">
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

            <!-- SECTION 2: CARD INVENTORY CONFIGURATION -->
            <div class="mc-accordion-box">
                <div class="mc-accordion-header active" id="mc-header-2" onclick="window.toggleMCAcordion(2)">
                    <span>2. Card Inventory Configuration</span>
                    <span id="mc-icon-2">▼</span>
                </div>
                <div class="mc-accordion-content" id="mc-content-2">
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

            <!-- SECTION 3: OTHERS CONFIGURATION (অন্যান্য) -->
            <div class="mc-accordion-box">
                <div class="mc-accordion-header active" id="mc-header-3" onclick="window.toggleMCAcordion(3)">
                    <span>3. Others Configuration (অন্যান্য সেটিংস)</span>
                    <span id="mc-icon-3">▼</span>
                </div>
                <div class="mc-accordion-content" id="mc-content-3">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 4px; margin-bottom: 12px;">
                        <p style="font-size: 0.95rem; color: #334155; font-weight: bold; margin-bottom: 6px;">
                            ভবিষ্যত ব্যবহারের জন্য এই সেকশনটি প্রস্তুত রাখা হয়েছে।
                        </p>
                        <p style="font-size: 0.88rem; color: #64748b;">
                            এখানে পরবর্তীতে দোকানের ফটোকপি/প্রিন্ট চার্জ রেট, ক্যাশ ডিনোমিনেশন বা যেকোনো কাস্টম সেটিংস খুব সহজে যোগ করে নেওয়া যাবে।
                        </p>
                    </div>
                    <div class="mc-form-row" style="margin-bottom: 0;">
                        <div class="mc-input-group">
                            <label>Custom Note / Configuration Remark</label>
                            <input type="text" id="mcOthersNote" class="mc-input-control" placeholder="যেমন: সাধারণ নোট বা প্যারামিটার...">
                        </div>
                        <button type="button" class="mc-btn mc-btn-primary" onclick="window.saveMCOthersNote()">Save Remark</button>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.appendChild(panel);
    }

    // ৬. নেভিগেশন ও প্যানেল ওপেনার
    window.openMasterConfigPanel = function () {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));

        const panel = document.getElementById('master-config-view');
        if (panel) panel.classList.add('active');

        const menu = document.getElementById('menu-master-config');
        if (menu) menu.classList.add('active');

        const titleEl = document.getElementById('top-title');
        if (titleEl) titleEl.innerText = "MASTER CONFIGURATION";

        populateCategoryDropdown();
        renderMCAccountsTable();
        renderMCCardsTable();
    };

    // ৭. স্বাধীন অ্যাকর্ডিয়ন টগল
    window.toggleMCAcordion = function (id) {
        const content = document.getElementById('mc-content-' + id);
        const icon = document.getElementById('mc-icon-' + id);
        const header = document.getElementById('mc-header-' + id);
        if (!content) return;

        const isHidden = content.style.display === 'none';
        content.style.display = isHidden ? 'block' : 'none';
        header.classList.toggle('active', isHidden);
        if (icon) icon.innerText = isHidden ? '▼' : '►';
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

    /* ==================== ACCOUNT CONTROLLERS ==================== */
    function renderMCAccountsTable() {
        const tbody = document.getElementById('mcAccTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const accs = Array.isArray(window.accounts) ? window.accounts : [];
        const cats = Array.isArray(window.categories) ? window.categories : [];
        const balances = window.balanceStore || {};

        const list = [...accs].sort((a, b) => (a.order || 0) - (b.order || 0));

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

        document.getElementById('mcAccSerial').value = list.length + 1;
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

    /* ==================== CARD CONTROLLERS ==================== */
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
            // পুরাতন অপারেটর থেকে মুছে নতুনটিতে যুক্ত করা যদি অপারেটর বদলানো হয়
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
        document.querySelectorAll('.mc-filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.innerText.includes(op) || (op === 'ALL' && btn.innerText.includes('All'))) {
                btn.classList.add('active');
            }
        });
        renderMCCardsTable();
    };

    /* ==================== OTHERS CONTROLLER ==================== */
    window.saveMCOthersNote = async function () {
        const note = document.getElementById('mcOthersNote').value.trim();
        await saveToFirebase('erp/othersConfig', { note: note, lastUpdated: new Date().toLocaleString() });
        if (typeof window.showToast === 'function') window.showToast("Remarks saved successfully!", "success");
    };

    // শুরুতেই লোড ও ইন্সটল
    function initMasterConfigModule() {
        initFirebaseBridge();
        injectStyles();
        injectSidebarMenu();
        injectViewPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMasterConfigModule);
    } else {
        initMasterConfigModule();
    }
})();
