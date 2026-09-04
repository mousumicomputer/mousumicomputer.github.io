/**
 * User Management & Comprehensive Dynamic RBAC Module
 * Full Enterprise Standard: Modular Category Permissions
 * Mousumi Computer ERP Core Engine
 */

(function () {
    let usersDatabase = JSON.parse(localStorage.getItem('cpscl_system_users') || '[]');
    let auditLogsDatabase = JSON.parse(localStorage.getItem('cpscl_audit_logs') || '[]');
    let editingUserId = null;
    let showPasswordMap = {};

    let dbInstance = null;
    let dbRefFunc = null;
    let dbSetFunc = null;

    // ERP-এর সকল মডিউল ও সাব-মডিউল তালিকা (যাতে ভবিষ্যতে যেকোনো মডিউল এক ক্লিকে অ্যাড/রিমুভ করা যায়)
    const SYSTEM_MODULES = [
        {
            groupName: "Education & Digital Services",
            icon: "fa-graduation-cap",
            color: "#4f46e5",
            permissions: [
                { key: "edu_fee_collection", label: "Fee Collection Terminal" },
                { key: "edu_pending_clearance", label: "Pending Clearance & Tap Pay" },
                { key: "edu_paid_settlement", label: "Paid Settlement" },
                { key: "edu_due_database", label: "Due Master Database" },
                { key: "edu_void_trash", label: "Void & Cancelled Log" },
                { key: "edu_reports_export", label: "Reports & Data Export" },
                { key: "edu_sheet_import", label: "Sheet Pending Import" }
            ]
        },
        {
            groupName: "CPSCL Campus Portal",
            icon: "fa-school",
            color: "#059669",
            permissions: [
                { key: "cpscl_student_list", label: "Student List & View" },
                { key: "cpscl_cert_print", label: "Certificate / Testimonial Print" },
                { key: "cpscl_excel_upload", label: "Excel Data Import" },
                { key: "cpscl_manual_entry", label: "Manual Student Entry" },
                { key: "cpscl_delete_data", label: "Delete / Clear Student Data" }
            ]
        },
        {
            groupName: "Customer Management",
            icon: "fa-users",
            color: "#2563eb",
            permissions: [
                { key: "cust_view_list", label: "Customer List & Profile" },
                { key: "cust_add_new", label: "Add / Edit Customer" },
                { key: "cust_new_tx", label: "New Transaction (Debit/Credit)" },
                { key: "cust_ledger", label: "Customer Ledger Statement" },
                { key: "cust_due_summary", label: "Due Summary & Analytics" }
            ]
        },
        {
            groupName: "Accounts, Balance & Inventory",
            icon: "fa-wallet",
            color: "#d97706",
            permissions: [
                { key: "fin_dashboard_view", label: "Dashboard Balance Overview" },
                { key: "fin_balance_update", label: "Update Balances (Bank/Agent/Personal)" },
                { key: "fin_cash_inventory", label: "Cash Inventory Audit" },
                { key: "fin_card_inventory", label: "Card Inventory Audit" }
            ]
        },
        {
            groupName: "Daily Closing & Audit",
            icon: "fa-lock",
            color: "#dc2626",
            permissions: [
                { key: "closing_close_day", label: "Execute Daily Closing" },
                { key: "closing_history", label: "Closing History & Audit Reports" },
                { key: "closing_report_pdf", label: "Download Financial Statements (PDF)" }
            ]
        },
        {
            groupName: "Settings & Master Config",
            icon: "fa-sliders",
            color: "#475569",
            permissions: [
                { key: "config_categories", label: "Category & Accounts Management" },
                { key: "config_cards", label: "Master Card Configuration" }
            ]
        }
    ];

    /* ==========================================================
       ১. ফায়ারবেস কানেকশন ও লাইভ সিঙ্ক
       ========================================================== */
    async function initUserManagementFirebase() {
        try {
            const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getDatabase, ref, set, onValue } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            const firebaseConfig = {
                apiKey: "AIzaSyA1PhRiTkICNCd8sA4he3ZxKjHtIzM0d5E",
                authDomain: "mousumi-computer.firebaseapp.com",
                databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                projectId: "mousumi-computer",
                storageBucket: "mousumi-computer.firebasestorage.app",
                messagingSenderId: "104820462623",
                appId: "1:104820462623:web:e3abae9533cc841463712a",
                measurementId: "G-EPYJ70W97Z"
            };

            const existingApps = getApps();
            const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig, "USER_MGMT_CORE");
            
            dbInstance = getDatabase(app);
            dbRefFunc = ref;
            dbSetFunc = set;

            const usersRef = ref(dbInstance, 'system/users');
            onValue(usersRef, (snapshot) => {
                const cloudData = snapshot.val();
                if (cloudData) {
                    usersDatabase = Array.isArray(cloudData) ? cloudData : Object.values(cloudData);
                    localStorage.setItem('cpscl_system_users', JSON.stringify(usersDatabase));
                    renderUsersTable();
                }
            });

            const logsRef = ref(dbInstance, 'system/audit_logs');
            onValue(logsRef, (snapshot) => {
                const cloudLogs = snapshot.val();
                if (cloudLogs) {
                    auditLogsDatabase = Array.isArray(cloudLogs) ? cloudLogs : Object.values(cloudLogs);
                    localStorage.setItem('cpscl_audit_logs', JSON.stringify(auditLogsDatabase));
                    renderAuditLogsTable();
                }
            });

        } catch (err) {
            console.warn("User Management Firebase Fallback:", err);
        }
    }

    async function syncUsersToFirebase(data) {
        localStorage.setItem('cpscl_system_users', JSON.stringify(data));
        if (dbInstance && dbSetFunc && dbRefFunc) {
            try {
                const usersRef = dbRefFunc(dbInstance, 'system/users');
                await dbSetFunc(usersRef, data);
            } catch (e) {
                console.error("Users Sync Error:", e);
            }
        }
    }

    async function syncLogsToFirebase(data) {
        localStorage.setItem('cpscl_audit_logs', JSON.stringify(data));
        if (dbInstance && dbSetFunc && dbRefFunc) {
            try {
                const logsRef = dbRefFunc(dbInstance, 'system/audit_logs');
                await dbSetFunc(logsRef, data);
            } catch (e) {
                console.error("Audit Logs Sync Error:", e);
            }
        }
    }

    window.logUserActivity = async function (actionType, details, userName) {
        const newLog = {
            id: 'log_' + Date.now(),
            user: userName || 'Admin',
            action: actionType,
            details: details,
            timestamp: new Date().toLocaleString('en-US', { hour12: true })
        };
        auditLogsDatabase.unshift(newLog);
        if (auditLogsDatabase.length > 200) auditLogsDatabase.pop();
        await syncLogsToFirebase(auditLogsDatabase);
        renderAuditLogsTable();
    };

    /* ==========================================================
       ২. মডিউল UI তৈরি ও রেন্ডারিং
       ========================================================== */
    function initUserManagementModule() {
        const menuList = document.querySelector('.sidebar .menu-list') || document.querySelector('.menu-list');
        const mainWrapper = document.querySelector('.main-wrapper') || document.querySelector('main');

        if (!menuList || !mainWrapper) {
            setTimeout(initUserManagementModule, 150);
            return;
        }

        // সাইডবার মেনু ইনজেকশন
        if (!document.getElementById('menu-user-management')) {
            const umMenuItem = document.createElement('li');
            umMenuItem.className = 'menu-item';
            umMenuItem.id = 'menu-user-management';

            umMenuItem.innerHTML = `
                <a onclick="switchUserManagementView()" style="cursor: pointer;">
                    <span class="menu-link-inner">
                        <i class="fa-solid fa-users-gear"></i> 
                        <span>User Management</span>
                    </span>
                </a>
            `;

            const eduMenu = document.getElementById('menu-settings-parent');
            if (eduMenu) {
                menuList.insertBefore(umMenuItem, eduMenu);
            } else {
                menuList.appendChild(umMenuItem);
            }
        }

        // ভিউ প্যানেল তৈরি
        let viewPanel = document.getElementById('user-management-view');
        if (!viewPanel) {
            viewPanel = document.createElement('div');
            viewPanel.className = 'view-panel';
            viewPanel.id = 'user-management-view';
            mainWrapper.appendChild(viewPanel);
        }

        // ডায়নামিক পারমিশন গ্রুপ এইচটিএমএল জেনারেট করা
        let permissionGroupsHTML = '';
        SYSTEM_MODULES.forEach((mod, gIdx) => {
            let permItems = '';
            mod.permissions.forEach(p => {
                permItems += `
                    <label style="font-size: 0.82rem; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 6px; border-radius: 6px; background: #fff; border: 1px solid #f1f5f9;">
                        <input type="checkbox" class="perm-checkbox perm-group-${gIdx}" data-key="${p.key}" style="width: 16px; height: 16px; accent-color: #4f46e5;">
                        <span>${p.label}</span>
                    </label>
                `;
            });

            permissionGroupsHTML += `
                <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
                        <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.88rem; color: ${mod.color};">
                            <i class="fa-solid ${mod.icon}"></i>
                            <span>${mod.groupName}</span>
                        </div>
                        <button type="button" onclick="toggleGroupPerms(${gIdx})" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 3px 10px; font-size: 0.75rem; font-weight: 700; cursor: pointer; color: #475569;">
                            Toggle All
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px;">
                        ${permItems}
                    </div>
                </div>
            `;
        });

        viewPanel.innerHTML = `
            <style>
                .um-card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); margin-bottom: 20px; }
                .um-tabs-wrap { display: flex; gap: 10px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px; }
                .um-tab-btn { padding: 9px 18px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
                .um-tab-btn.active { background: #4f46e5; color: #ffffff; border-color: #4f46e5; box-shadow: 0 3px 10px rgba(79, 70, 229, 0.25); }
                .um-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
                .um-table th { padding: 12px 16px; color: #64748b; font-size: 0.84rem; font-weight: 700; text-align: left; text-transform: uppercase; }
                .um-table td { background: #ffffff; padding: 14px 16px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #1e293b; }
                .um-table tr td:first-child { border-left: 1px solid #f1f5f9; border-radius: 12px 0 0 12px; }
                .um-table tr td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 12px 12px 0; }
                .um-badge-active { background: #dcfce7; color: #16a34a; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; text-transform: uppercase; }
                .um-badge-blocked { background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; text-transform: uppercase; }
                .um-btn-action { width: 32px; height: 32px; border-radius: 8px; border: none; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .um-btn-toggle { background: #fef2f2; color: #ef4444; }
                .um-btn-edit { background: #f0fdf4; color: #16a34a; }
                .um-btn-del { background: #f1f5f9; color: #64748b; }
                .um-control { width: 100%; height: 42px; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 14px; font-size: 0.9rem; outline: none; }
                .um-control:focus { border-color: #4f46e5; }
            </style>

            <div class="um-card">
                <div class="um-tabs-wrap">
                    <button class="um-tab-btn active" id="tab-btn-users" onclick="switchUMTab('users')">
                        <i class="fa-solid fa-users"></i> Users List (<span id="um-count">0</span>)
                    </button>
                    <button class="um-tab-btn" id="tab-btn-create" onclick="switchUMTab('create')">
                        <i class="fa-solid fa-user-plus"></i> <span id="um-form-title">Create New User</span>
                    </button>
                    <button class="um-tab-btn" id="tab-btn-audit" onclick="switchUMTab('audit')">
                        <i class="fa-solid fa-clock-rotate-left"></i> Activity Audit Logs
                    </button>
                </div>

                <!-- Tab 1: Users List -->
                <div id="um-sec-users">
                    <div style="overflow-x: auto;">
                        <table class="um-table">
                            <thead>
                                <tr>
                                    <th>User & Designation</th>
                                    <th>Role / Mobile</th>
                                    <th>Password</th>
                                    <th>Assigned Access Scope</th>
                                    <th>Status</th>
                                    <th style="text-align: right;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="um-users-tbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- Tab 2: Create / Edit User Form -->
                <div id="um-sec-create" style="display: none; max-width: 950px;">
                    <form onsubmit="handleUserFormSubmit(event)" style="display: flex; flex-direction: column; gap: 16px;">
                        
                        <!-- ব্যক্তিগত ও লগইন ক্রেডেনশিয়াল -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Login Username *</label>
                                <input type="text" id="um-inp-name" class="um-control" placeholder="e.g. staff" required>
                            </div>
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Email Address *</label>
                                <input type="email" id="um-inp-email" class="um-control" placeholder="staff@gmail.com" required>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Full Name (English) *</label>
                                <input type="text" id="um-inp-name-en" class="um-control" placeholder="e.g. Md. Ashiqur Rahman" required>
                            </div>
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Full Name (Bangla)</label>
                                <input type="text" id="um-inp-name-bn" class="um-control" placeholder="মোঃ আশিকুর রহমান">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Employee ID *</label>
                                <input type="text" id="um-inp-emp-id" class="um-control" placeholder="MC-102" required>
                            </div>
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Designation / Title *</label>
                                <input type="text" id="um-inp-designation" class="um-control" placeholder="Counter Operator" required>
                            </div>
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Mobile Number</label>
                                <input type="text" id="um-inp-mobile" class="um-control" placeholder="01700-000000">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Password *</label>
                                <input type="text" id="um-inp-pass" class="um-control" placeholder="Set user password" required>
                            </div>
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Quick Preset Role *</label>
                                <select id="um-inp-role" class="um-control" onchange="handlePresetRoleChange(this.value)">
                                    <option value="Custom">Custom Selection (নিজের মতো বেছে নিন)</option>
                                    <option value="Education Staff">Education Staff (শুধু এডুকেশন ও ফি টার্মিনাল)</option>
                                    <option value="CPSCL Operator">CPSCL Operator (শুধু সার্টিফিকেট পোর্টাল)</option>
                                    <option value="Accountant">Accountant (কাস্টমার ও ব্যালেন্স হিসাব)</option>
                                    <option value="Super Admin">Super Admin (সব মডিউলের পূর্ণ এক্সেস)</option>
                                </select>
                            </div>
                        </div>

                        <!-- 🎯 ডায়নামিক মডিউলার পারমিশন গ্রিড -->
                        <div style="margin-top: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div>
                                    <h4 style="font-size: 0.95rem; font-weight: 800; color: #1e293b; margin: 0;">Modular Feature & Menu Permissions</h4>
                                    <p style="font-size: 0.78rem; color: #64748b; margin: 2px 0 0 0;">যেসব মডিউলে টিক দেওয়া থাকবে, ইউজার শুধুমাত্র সেগুলোতে ঢুকতে পারবে।</p>
                                </div>
                                <div style="display: flex; gap: 8px;">
                                    <button type="button" onclick="toggleAllGlobalPerms(true)" style="background: #eef2ff; border: 1px solid #c7d2fe; color: #4338ca; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; cursor: pointer;">Select All</button>
                                    <button type="button" onclick="toggleAllGlobalPerms(false)" style="background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; cursor: pointer;">Clear All</button>
                                </div>
                            </div>

                            <div id="dynamic-permission-container">
                                ${permissionGroupsHTML}
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                            <button type="button" onclick="cancelUserEdit()" style="padding: 10px 22px; background: #94a3b8; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Cancel</button>
                            <button type="submit" style="padding: 10px 32px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 0.95rem;">
                                <i class="fa-solid fa-floppy-disk mr-1"></i> Save User & Access
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Tab 3: Activity Audit Logs -->
                <div id="um-sec-audit" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 0.85rem; color: #64748b; font-weight: 600;">Realtime Live Activity Tracking</span>
                        <button onclick="clearAuditLogs()" style="background: none; border: none; color: #ef4444; font-weight: 700; font-size: 0.82rem; cursor: pointer;">
                            <i class="fa-solid fa-trash-can mr-1"></i> Clear Audit Logs
                        </button>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="um-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody id="um-audit-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        renderUsersTable();
        renderAuditLogsTable();
    }

    /* ==========================================================
       ৩. পারমিশন হেল্পার লজিক ও প্রিসেট হ্যান্ডলিং
       ========================================================= */
    window.toggleGroupPerms = function (gIdx) {
        const boxes = document.querySelectorAll(`.perm-group-${gIdx}`);
        const allChecked = Array.from(boxes).every(b => b.checked);
        boxes.forEach(b => b.checked = !allChecked);
    };

    window.toggleAllGlobalPerms = function (status) {
        document.querySelectorAll('.perm-checkbox').forEach(b => b.checked = status);
    };

    window.handlePresetRoleChange = function (role) {
        window.toggleAllGlobalPerms(false);

        if (role === 'Super Admin') {
            window.toggleAllGlobalPerms(true);
        } else if (role === 'Education Staff') {
            document.querySelectorAll('.perm-group-0').forEach(b => b.checked = true);
        } else if (role === 'CPSCL Operator') {
            document.querySelectorAll('.perm-group-1').forEach(b => b.checked = true);
        } else if (role === 'Accountant') {
            document.querySelectorAll('.perm-group-2, .perm-group-3, .perm-group-4').forEach(b => b.checked = true);
        }
    };

    function renderUsersTable() {
        const tbody = document.getElementById('um-users-tbody');
        const countSpan = document.getElementById('um-count');
        if (!tbody) return;

        if (countSpan) countSpan.innerText = usersDatabase.length;
        tbody.innerHTML = '';

        if (usersDatabase.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 25px;">No users configured yet.</td></tr>`;
            return;
        }

        usersDatabase.forEach((u, index) => {
            const isShown = showPasswordMap[u.id];
            const passDisplay = isShown ? u.password : '••••••••';
            const eyeIcon = isShown ? 'fa-eye-slash' : 'fa-eye';
            const statusClass = u.status === 'Active' ? 'um-badge-active' : 'um-badge-blocked';
            const toggleIcon = u.status === 'Active' ? 'fa-ban' : 'fa-check';
            const toggleTitle = u.status === 'Active' ? 'Block User' : 'Activate User';

            // মডিউল স্কোপ ব্যাজ তৈরি
            let scopeBadges = '';
            const perms = u.permissions || {};
            
            if (Object.keys(perms).length === 0) {
                scopeBadges = `<span style="font-size:0.75rem; color:#94a3b8;">No Access</span>`;
            } else {
                const hasEdu = Object.keys(perms).some(k => k.startsWith('edu_') && perms[k]);
                const hasCPSCL = Object.keys(perms).some(k => k.startsWith('cpscl_') && perms[k]);
                const hasCust = Object.keys(perms).some(k => k.startsWith('cust_') && perms[k]);
                const hasFin = Object.keys(perms).some(k => (k.startsWith('fin_') || k.startsWith('closing_')) && perms[k]);

                if (hasEdu) scopeBadges += `<span style="background:#eef2ff; color:#4f46e5; padding:2px 7px; border-radius:5px; font-size:0.72rem; font-weight:700; margin-right:4px;">Education</span>`;
                if (hasCPSCL) scopeBadges += `<span style="background:#ecfdf5; color:#059669; padding:2px 7px; border-radius:5px; font-size:0.72rem; font-weight:700; margin-right:4px;">CPSCL</span>`;
                if (hasCust) scopeBadges += `<span style="background:#eff6ff; color:#2563eb; padding:2px 7px; border-radius:5px; font-size:0.72rem; font-weight:700; margin-right:4px;">Customers</span>`;
                if (hasFin) scopeBadges += `<span style="background:#fffbeb; color:#d97706; padding:2px 7px; border-radius:5px; font-size:0.72rem; font-weight:700; margin-right:4px;">Finance</span>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color: #1e293b; display: block;">${u.nameEn || u.name} (${u.empId || 'N/A'})</strong>
                    <span style="font-size: 0.8rem; color: #64748b;">${u.designation || 'Staff'} &bull; ${u.email}</span>
                </td>
                <td>
                    <strong style="color: #334155;">${u.role || 'Staff'}</strong><br>
                    <span style="font-size:0.75rem; color:#64748b;">${u.mobile || '-'}</span>
                </td>
                <td>
                    <span style="font-family: monospace; font-weight: 700; color: #4338ca; letter-spacing: 1px;">${passDisplay}</span>
                    <button onclick="togglePasswordView('${u.id}')" title="View Password" style="background: none; border: none; color: #6366f1; cursor: pointer; margin-left: 6px;">
                        <i class="fa-solid ${eyeIcon}"></i>
                    </button>
                </td>
                <td>${scopeBadges}</td>
                <td><span class="${statusClass}">${u.status}</span></td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                        <button onclick="toggleUserStatus(${index})" title="${toggleTitle}" class="um-btn-action um-btn-toggle">
                            <i class="fa-solid ${toggleIcon}"></i>
                        </button>
                        <button onclick="editUser(${index})" title="Edit User & Permissions" class="um-btn-action um-btn-edit">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deleteUser(${index})" title="Delete User" class="um-btn-action um-btn-del">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.handleUserFormSubmit = async function (event) {
        event.preventDefault();

        // চেকবক্সগুলো থেকে পারমিশন সংগ্রহ করা
        const permissionsObj = {};
        document.querySelectorAll('.perm-checkbox').forEach(cb => {
            if (cb.checked) {
                permissionsObj[cb.dataset.key] = true;
            }
        });

        const userData = {
            id: editingUserId || ('usr_' + Date.now()),
            name: document.getElementById('um-inp-name').value.trim(),
            nameEn: document.getElementById('um-inp-name-en').value.trim(),
            nameBn: document.getElementById('um-inp-name-bn').value.trim(),
            empId: document.getElementById('um-inp-emp-id').value.trim(),
            designation: document.getElementById('um-inp-designation').value.trim(),
            mobile: document.getElementById('um-inp-mobile').value.trim(),
            email: document.getElementById('um-inp-email').value.trim(),
            password: document.getElementById('um-inp-pass').value.trim(),
            role: document.getElementById('um-inp-role').value,
            permissions: permissionsObj,
            status: 'Active',
            createdAt: new Date().toLocaleString('en-US')
        };

        if (editingUserId) {
            const idx = usersDatabase.findIndex(u => u.id === editingUserId);
            if (idx !== -1) usersDatabase[idx] = { ...usersDatabase[idx], ...userData };
            window.logUserActivity("USER_EDIT", `User updated: ${userData.name}`);
        } else {
            usersDatabase.push(userData);
            window.logUserActivity("USER_CREATE", `New user created: ${userData.name} (${userData.role})`);
        }

        await syncUsersToFirebase(usersDatabase);
        cancelUserEdit();
        switchUMTab('users');
        if (typeof showToast === 'function') showToast("ইউজার এবং পারমিশন সফলভাবে সেভ হয়েছে!", "success");
    };

    window.editUser = function (index) {
        const u = usersDatabase[index];
        if (!u) return;

        editingUserId = u.id;
        document.getElementById('um-form-title').innerText = "Edit User Profile & Permissions";
        document.getElementById('um-inp-name').value = u.name || '';
        document.getElementById('um-inp-name-en').value = u.nameEn || u.name || '';
        document.getElementById('um-inp-name-bn').value = u.nameBn || '';
        document.getElementById('um-inp-emp-id').value = u.empId || '';
        document.getElementById('um-inp-designation').value = u.designation || '';
        document.getElementById('um-inp-mobile').value = u.mobile || '';
        document.getElementById('um-inp-email').value = u.email || '';
        document.getElementById('um-inp-pass').value = u.password || '';
        document.getElementById('um-inp-role').value = u.role || 'Custom';

        // পারমিশন চেকবক্স চেক করা
        const p = u.permissions || {};
        document.querySelectorAll('.perm-checkbox').forEach(cb => {
            cb.checked = !!p[cb.dataset.key];
        });

        switchUMTab('create');
    };

    window.cancelUserEdit = function () {
        editingUserId = null;
        document.getElementById('um-form-title').innerText = "Create New User";
        document.getElementById('um-inp-name').value = '';
        document.getElementById('um-inp-name-en').value = '';
        document.getElementById('um-inp-name-bn').value = '';
        document.getElementById('um-inp-emp-id').value = '';
        document.getElementById('um-inp-designation').value = '';
        document.getElementById('um-inp-mobile').value = '';
        document.getElementById('um-inp-email').value = '';
        document.getElementById('um-inp-pass').value = '';
        document.getElementById('um-inp-role').value = 'Custom';
        window.toggleAllGlobalPerms(false);
        switchUMTab('users');
    };

    window.switchUMTab = function (tabKey) {
        document.getElementById('um-sec-users').style.display = tabKey === 'users' ? 'block' : 'none';
        document.getElementById('um-sec-create').style.display = tabKey === 'create' ? 'block' : 'none';
        document.getElementById('um-sec-audit').style.display = tabKey === 'audit' ? 'block' : 'none';

        document.getElementById('tab-btn-users').classList.toggle('active', tabKey === 'users');
        document.getElementById('tab-btn-create').classList.toggle('active', tabKey === 'create');
        document.getElementById('tab-btn-audit').classList.toggle('active', tabKey === 'audit');
    };

    window.togglePasswordView = function (userId) {
        showPasswordMap[userId] = !showPasswordMap[userId];
        renderUsersTable();
    };

    window.toggleUserStatus = async function (index) {
        const u = usersDatabase[index];
        if (!u) return;

        u.status = u.status === 'Active' ? 'Blocked' : 'Active';
        await syncUsersToFirebase(usersDatabase);
        renderUsersTable();

        window.logUserActivity("USER_STATUS_CHANGE", `User ${u.name} status changed to ${u.status}`);
    };

    window.deleteUser = async function (index) {
        const u = usersDatabase[index];
        if (!u) return;

        if (confirm(`Are you sure you want to permanently delete '${u.name}'?`)) {
            usersDatabase.splice(index, 1);
            await syncUsersToFirebase(usersDatabase);
            renderUsersTable();
            window.logUserActivity("USER_DELETE", `User deleted: ${u.name}`);
        }
    };

    window.switchUserManagementView = function () {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));

        const panel = document.getElementById('user-management-view');
        if (panel) {
            panel.classList.add('active');
            panel.style.display = 'block';
        }

        const menuItem = document.getElementById('menu-user-management');
        if (menuItem) menuItem.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "USER & ACCESS MANAGEMENT";
    };

    function renderAuditLogsTable() {
        const tbody = document.getElementById('um-audit-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (auditLogsDatabase.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 25px;">No activity logged yet.</td></tr>`;
            return;
        }

        auditLogsDatabase.slice(0, 50).forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="color: #64748b; font-size: 0.82rem;"><i class="fa-regular fa-clock mr-1"></i> ${log.timestamp}</td>
                <td><strong style="color: #1e293b;">${log.user}</strong></td>
                <td><span style="background: #eef2ff; color: #4338ca; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 0.76rem;">${log.action}</span></td>
                <td style="color: #334155;">${log.details}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.clearAuditLogs = async function () {
        if (confirm("Are you sure you want to clear all activity audit history?")) {
            auditLogsDatabase = [];
            await syncLogsToFirebase([]);
            renderAuditLogsTable();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initUserManagementModule();
            initUserManagementFirebase();
        });
    } else {
        initUserManagementModule();
        initUserManagementFirebase();
    }
})();
