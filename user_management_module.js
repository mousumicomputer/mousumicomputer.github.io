/**
 * User Management & Granular RBAC Engine
 * Architecture: Separated Profile & Dedicated Permissions Manager
 * Fix: Complete Isolation of Global Download Reports Menu
 * Mousumi Computer ERP Core Engine
 */

(function () {
    let usersDatabase = JSON.parse(localStorage.getItem('cpscl_system_users') || '[]');
    let auditLogsDatabase = JSON.parse(localStorage.getItem('cpscl_audit_logs') || '[]');
    let editingUserId = null;
    let viewingUserId = null;
    let selectedPermUserId = null;
    let showPasswordMap = {};

    let isImpersonating = false;
    let impersonatedUser = null;

    let dbInstance = null;
    let dbRefFunc = null;
    let dbSetFunc = null;

    // ERP Module Definitions (Strictly Isolated Keys)
    const SYSTEM_MODULES = [
        {
            groupName: "Education & Digital Services",
            prefix: "edu_",
            menuId: "menu-edu-parent",
            permissions: [
                { key: "edu_fee_collection", label: "Fee Collection Terminal" },
                { key: "edu_pending_clearance", label: "Pending Clearance & Tap Pay" },
                { key: "edu_paid_settlement", label: "Paid Settlement" },
                { key: "edu_due_database", label: "Due Master Database" },
                { key: "edu_void_trash", label: "Void & Cancelled Logs" },
                { key: "edu_reports_export", label: "Edu Reports & Export" },
                { key: "edu_sheet_import", label: "Sheet Pending Import" }
            ]
        },
        {
            groupName: "CPSCL Campus Portal",
            prefix: "cpscl_",
            menuId: "menu-cpscl-parent",
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
            prefix: "cust_",
            menuId: "menu-cust-parent",
            permissions: [
                { key: "cust_view_list", label: "Customer List & Profile" },
                { key: "cust_add_new", label: "Add / Edit Customer" },
                { key: "cust_new_tx", label: "New Transaction Entry" },
                { key: "cust_ledger", label: "Customer Ledger Statement" },
                { key: "cust_due_summary", label: "Due Summary & Analytics" }
            ]
        },
        {
            groupName: "Accounts, Balance & Inventory",
            prefix: "fin_",
            menuId: "menu-inv-parent",
            permissions: [
                { key: "fin_dashboard_view", label: "Financial Dashboard View" },
                { key: "fin_balance_update", label: "Update Balances (Bank/Agent/Personal)" },
                { key: "fin_cash_inventory", label: "Cash Inventory Audit" },
                { key: "fin_card_inventory", label: "Card Inventory Audit" }
            ]
        },
        {
            groupName: "Daily Closing & Audit",
            prefix: "closing_",
            menuId: "menu-closing-parent",
            permissions: [
                { key: "closing_close_day", label: "Execute Daily Closing" },
                { key: "closing_history", label: "Closing History & Logs" },
                { key: "closing_report_pdf", label: "Download Financial Statements (PDF)" }
            ]
        },
        {
            groupName: "Settings & System Access",
            prefix: "config_",
            menuId: "menu-settings-parent",
            permissions: [
                { key: "config_categories", label: "Category & Accounts Setup" },
                { key: "config_cards", label: "Master Card Configuration" },
                { key: "global_download_reports", label: "Global Download Reports Center" } // স্বতন্ত্র চাবি
            ]
        }
    ];

    /* ==========================================================
       1. Firebase Sync Engine (Non-Destructive)
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
                    renderSummaryStats();
                    populatePermissionsUserDropdown();
                    if (viewingUserId) renderUserProfileDetails(viewingUserId);
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
            console.warn("User Management Firebase Offline:", err);
        }
    }

    async function syncUsersToFirebase(data) {
        localStorage.setItem('cpscl_system_users', JSON.stringify(data));
        if (dbInstance && dbSetFunc && dbRefFunc) {
            try {
                const usersRef = dbRefFunc(dbInstance, 'system/users');
                await dbSetFunc(usersRef, data);
            } catch (e) {
                console.error("Firebase Sync Error:", e);
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
            user: userName || (isImpersonating ? impersonatedUser?.name : 'Admin'),
            action: actionType,
            details: details,
            timestamp: new Date().toLocaleString('en-US')
        };
        auditLogsDatabase.unshift(newLog);
        if (auditLogsDatabase.length > 200) auditLogsDatabase.pop();
        await syncLogsToFirebase(auditLogsDatabase);
        renderAuditLogsTable();
    };

    /* ==========================================================
       2. Clean Minimalist UI Engine & Sidebar Submenus
       ========================================================== */
    function initUserManagementModule() {
        const menuList = document.querySelector('.sidebar .menu-list') || document.querySelector('.menu-list');
        const mainWrapper = document.querySelector('.main-wrapper') || document.querySelector('main');

        if (!menuList || !mainWrapper) {
            setTimeout(initUserManagementModule, 150);
            return;
        }

        // Sidebar Dropdown Menu
        if (!document.getElementById('menu-user-parent')) {
            const umMenuItem = document.createElement('li');
            umMenuItem.className = 'menu-item';
            umMenuItem.id = 'menu-user-parent';

            umMenuItem.innerHTML = `
                <a onclick="toggleParentMenu('menu-user-parent')">
                    <span class="menu-link-inner"><i class="fa-solid fa-users-gear"></i> <span>User Management</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item" id="sub-um-list">
                        <a onclick="switchUserManagementSubSection('um-list-section')"><i class="fa-solid fa-angle-right"></i> <span>User Directory</span></a>
                    </li>
                    <li class="submenu-item" id="sub-um-add">
                        <a onclick="openCreateUserForm()"><i class="fa-solid fa-angle-right"></i> <span>Add User</span></a>
                    </li>
                    <li class="submenu-item" id="sub-um-perm">
                        <a onclick="openPermissionsManager()"><i class="fa-solid fa-angle-right"></i> <span>Permissions</span></a>
                    </li>
                    <li class="submenu-item" id="sub-um-audit">
                        <a onclick="switchUserManagementSubSection('um-audit-section')"><i class="fa-solid fa-angle-right"></i> <span>Audit Logs</span></a>
                    </li>
                </ul>
            `;

            const settingsMenu = document.getElementById('menu-settings-parent');
            if (settingsMenu) {
                menuList.insertBefore(umMenuItem, settingsMenu);
            } else {
                menuList.appendChild(umMenuItem);
            }
        }

        let viewPanel = document.getElementById('user-management-view');
        if (!viewPanel) {
            viewPanel = document.createElement('div');
            viewPanel.className = 'view-panel';
            viewPanel.id = 'user-management-view';
            mainWrapper.appendChild(viewPanel);
        }

        let permissionGroupsHTML = '';
        SYSTEM_MODULES.forEach((mod, gIdx) => {
            let permItems = '';
            mod.permissions.forEach(p => {
                permItems += `
                    <label style="font-size: 13px; font-weight: 500; color: #334155; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 10px; border-radius: 6px; background: #fff; border: 1px solid #e2e8f0;">
                        <input type="checkbox" class="perm-checkbox perm-group-${gIdx}" data-key="${p.key}" style="width: 15px; height: 15px; accent-color: #4f46e5;">
                        <span>${p.label}</span>
                    </label>
                `;
            });

            permissionGroupsHTML += `
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
                        <span style="font-weight: 700; font-size: 14px; color: #1e293b;">${mod.groupName}</span>
                        <button type="button" onclick="toggleGroupPerms(${gIdx})" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; cursor: pointer;">Toggle</button>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px;">
                        ${permItems}
                    </div>
                </div>
            `;
        });

        viewPanel.innerHTML = `
            <style>
                .um-sub-section { display: none; }
                .um-card { background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 20px; }
                
                .um-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
                .um-table th { background: #f8fafc; padding: 12px 14px; color: #64748b; font-weight: 700; border-bottom: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
                .um-table td { padding: 14px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; color: #1e293b; }
                .um-table tbody tr:hover { background-color: #fafbfc; }

                .um-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 20px; }
                .um-stat-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; }
                .um-stat-box p { font-size: 12px; color: #64748b; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; }
                .um-stat-box h3 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0; }

                .um-btn-clean { border: 1px solid #e2e8f0; background: #ffffff; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 5px; color: #334155; transition: 0.2s; }
                .um-btn-clean:hover { background: #f1f5f9; }
                .um-btn-primary { background: #4f46e5; color: #ffffff; border: 1px solid #4f46e5; }
                .um-btn-primary:hover { background: #4338ca; }
                .um-btn-danger { color: #ef4444; border-color: #fecaca; }
                .um-btn-danger:hover { background: #fee2e2; }
                .um-btn-login { color: #d97706; border-color: #fde68a; background: #fffbeb; }
                .um-btn-login:hover { background: #fef3c7; }
                .um-btn-perm { color: #059669; border-color: #a7f3d0; background: #ecfdf5; }
                .um-btn-perm:hover { background: #d1fae5; }

                .um-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
                .um-badge-active { background: #dcfce7; color: #15803d; }
                .um-badge-blocked { background: #fee2e2; color: #dc2626; }
                .um-scope-pill { background: #eff6ff; color: #2563eb; border: 1px solid #dbeafe; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; margin-right: 4px; display: inline-block; margin-bottom: 2px; }

                .um-control { height: 38px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0 12px; font-size: 13px; outline: none; background: #ffffff; width: 100%; }
                .um-control:focus { border-color: #4f46e5; }

                .um-details-table { width: 100%; border-collapse: collapse; }
                .um-details-table th, .um-details-table td { padding: 12px 14px; border: 1px solid #e2e8f0; font-size: 13px; }
                .um-details-table th { width: 22%; background: #f8fafc; color: #64748b; font-weight: 600; }
                .um-details-table td { width: 28%; font-weight: 600; }
            </style>

            <!-- SUB-SECTION 1: USER DIRECTORY LIST -->
            <div id="um-list-section" class="um-sub-section" style="display: block;">
                
                <div class="um-stats-grid">
                    <div class="um-stat-box">
                        <p>Total Users</p>
                        <h3 id="statTotalUsers">0</h3>
                    </div>
                    <div class="um-stat-box">
                        <p>Active Staff</p>
                        <h3 id="statActiveUsers" style="color: #16a34a;">0</h3>
                    </div>
                    <div class="um-stat-box">
                        <p>Blocked</p>
                        <h3 id="statBlockedUsers" style="color: #dc2626;">0</h3>
                    </div>
                    <div class="um-stat-box">
                        <p>Departments</p>
                        <h3>6 Modules</h3>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 10px; flex-wrap: wrap;">
                    <div style="display: flex; gap: 8px; flex: 1; max-width: 460px;">
                        <input type="text" id="umSearchInput" class="um-control" placeholder="Search user by name or ID..." oninput="filterUMUsers()">
                        <select id="umRoleFilter" class="um-control" style="width: 150px;" onchange="filterUMUsers()">
                            <option value="">All Roles</option>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Education Staff">Education Staff</option>
                            <option value="CPSCL Operator">CPSCL Operator</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Custom">Custom</option>
                        </select>
                    </div>
                    <button class="um-btn-clean um-btn-primary" onclick="openCreateUserForm()">
                        <i class="fa-solid fa-plus"></i> Add User
                    </button>
                </div>

                <div class="um-card" style="padding: 0; overflow-x: auto;">
                    <table class="um-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role / Phone</th>
                                <th>Password</th>
                                <th>Scope</th>
                                <th>Status</th>
                                <th style="text-align: right;">Action</th>
                            </tr>
                        </thead>
                        <tbody id="um-users-tbody"></tbody>
                    </table>
                </div>
            </div>

            <!-- SUB-SECTION 2: USER PROFILE VIEW -->
            <div id="um-profile-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <button class="um-btn-clean" onclick="switchUserManagementSubSection('um-list-section')">
                        <i class="fa-solid fa-arrow-left"></i> Back to Users
                    </button>
                    <div style="display: flex; gap: 8px;" id="profileTopActionBtns"></div>
                </div>

                <div class="um-card">
                    <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 20px;">
                        <div>
                            <h2 style="font-size: 18px; font-weight: 800; margin: 0;" id="profHeadingName">User Name</h2>
                            <p style="color: #64748b; font-size: 13px; margin: 2px 0 0 0;" id="profHeadingSub">ID: #---</p>
                        </div>
                        <div id="profStatusBadge"></div>
                    </div>

                    <p style="font-weight: 700; font-size: 12px; margin-bottom: 8px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Employment & Account Profile</p>
                    <table class="um-details-table" style="margin-bottom: 24px;">
                        <tbody>
                            <tr>
                                <th>Full Name (EN)</th><td id="profRowNameEn">-</td>
                                <th>Designation</th><td id="profRowDesignation">-</td>
                            </tr>
                            <tr>
                                <th>Name (Bangla)</th><td id="profRowNameBn">-</td>
                                <th>Role</th><td id="profRowRole">-</td>
                            </tr>
                            <tr>
                                <th>Mobile</th><td id="profRowMobile">-</td>
                                <th>Employee ID</th><td id="profRowEmpId">-</td>
                            </tr>
                            <tr>
                                <th>Email</th><td id="profRowEmail">-</td>
                                <th>Password</th><td id="profRowPass">-</td>
                            </tr>
                        </tbody>
                    </table>

                    <p style="font-weight: 700; font-size: 12px; margin-bottom: 8px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Module Access Permissions Matrix</p>
                    <table class="um-table" style="border: 1px solid #e2e8f0;">
                        <thead>
                            <tr>
                                <th style="width: 28%;">Department</th>
                                <th>Allowed Features</th>
                                <th style="text-align: center; width: 100px;">Scope</th>
                            </tr>
                        </thead>
                        <tbody id="profPermissionsMatrixBody"></tbody>
                    </table>
                </div>
            </div>

            <!-- SUB-SECTION 3: ADD / EDIT PROFILE ONLY -->
            <div id="um-form-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <h2 style="font-size: 17px; font-weight: 800;" id="um-form-page-title">Add User</h2>
                        <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">Create basic account & login profile</p>
                    </div>
                    <button class="um-btn-clean" onclick="switchUserManagementSubSection('um-list-section')">
                        <i class="fa-solid fa-arrow-left"></i> Cancel
                    </button>
                </div>

                <div class="um-card">
                    <form onsubmit="handleUserFormSubmit(event)" style="display: flex; flex-direction: column; gap: 14px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Username *</label>
                                <input type="text" id="um-inp-name" class="um-control" placeholder="staff1" required>
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Email *</label>
                                <input type="email" id="um-inp-email" class="um-control" placeholder="staff@example.com" required>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Full Name (EN) *</label>
                                <input type="text" id="um-inp-name-en" class="um-control" placeholder="John Doe" required>
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Name (Bangla)</label>
                                <input type="text" id="um-inp-name-bn" class="um-control" placeholder="Optional">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Employee ID *</label>
                                <input type="text" id="um-inp-emp-id" class="um-control" placeholder="MC-101" required>
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Designation *</label>
                                <input type="text" id="um-inp-designation" class="um-control" placeholder="Operator" required>
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Phone</label>
                                <input type="text" id="um-inp-mobile" class="um-control" placeholder="017XXXXXXXX">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <div>
                                <label style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Password *</label>
                                <input type="text" id="um-inp-pass" class="um-control" placeholder="Password" required>
                            </div>
                            <div>
                                <label style="font-size: 12px; font-weight: 700; color: #475569; display: block; margin-bottom: 4px;">Role *</label>
                                <select id="um-inp-role" class="um-control">
                                    <option value="Custom">Custom</option>
                                    <option value="Education Staff">Education Staff</option>
                                    <option value="CPSCL Operator">CPSCL Operator</option>
                                    <option value="Accountant">Accountant</option>
                                    <option value="Super Admin">Super Admin</option>
                                </select>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9;">
                            <button type="button" class="um-btn-clean" onclick="switchUserManagementSubSection('um-list-section')">Cancel</button>
                            <button type="submit" class="um-btn-clean um-btn-primary" style="padding: 8px 24px;">Save Profile</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- SUB-SECTION 4: DEDICATED MODULE PERMISSIONS MANAGER -->
            <div id="um-permissions-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <div>
                        <h2 style="font-size: 17px; font-weight: 800;">Manage Module Permissions</h2>
                        <p style="font-size: 12px; color: #64748b; margin: 2px 0 0 0;">Assign and update security access scope</p>
                    </div>
                    <button class="um-btn-clean" onclick="switchUserManagementSubSection('um-list-section')">
                        <i class="fa-solid fa-arrow-left"></i> Back to Users
                    </button>
                </div>

                <div class="um-card" style="margin-bottom: 14px;">
                    <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
                        <label style="font-weight: 700; font-size: 13px; color: #1e293b;">Select User:</label>
                        <select id="permUserSelect" class="um-control" style="max-width: 320px;" onchange="loadUserPermissionsForConfig(this.value)">
                            <!-- Dynamic user options -->
                        </select>
                        <div style="margin-left: auto; display: flex; gap: 8px;">
                            <button type="button" class="um-btn-clean" onclick="toggleAllGlobalPerms(true)">Grant All</button>
                            <button type="button" class="um-btn-clean" onclick="toggleAllGlobalPerms(false)">Revoke All</button>
                        </div>
                    </div>
                </div>

                <form onsubmit="handleSavePermissionsSubmit(event)">
                    <div id="dynamic-permission-container">${permissionGroupsHTML}</div>
                    
                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px;">
                        <button type="button" class="um-btn-clean" onclick="switchUserManagementSubSection('um-list-section')">Cancel</button>
                        <button type="submit" class="um-btn-clean um-btn-primary" style="padding: 10px 28px;">
                            <i class="fa-solid fa-shield-halved"></i> Update Permissions
                        </button>
                    </div>
                </form>
            </div>

            <!-- SUB-SECTION 5: AUDIT LOGS -->
            <div id="um-audit-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <button class="um-btn-clean" onclick="switchUserManagementSubSection('um-list-section')">
                        <i class="fa-solid fa-arrow-left"></i> Back to Users
                    </button>
                    <button onclick="clearAuditLogs()" class="um-btn-clean um-btn-danger">Clear Logs</button>
                </div>

                <div class="um-card" style="padding: 0;">
                    <table class="um-table">
                        <thead>
                            <tr>
                                <th style="width: 180px;">Timestamp</th>
                                <th style="width: 140px;">User</th>
                                <th style="width: 160px;">Action</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody id="um-audit-tbody"></tbody>
                    </table>
                </div>
            </div>
        `;

        renderUsersTable();
        renderSummaryStats();
        populatePermissionsUserDropdown();
        renderAuditLogsTable();
    }

    /* ==========================================================
       3. Sub-Section Switcher
       ========================================================== */
    window.switchUserManagementSubSection = function (sectionId) {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const umView = document.getElementById('user-management-view');
        if (umView) umView.classList.add('active');

        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        const parentMenu = document.getElementById('menu-user-parent');
        if (parentMenu) {
            parentMenu.classList.add('active');
            const subList = parentMenu.querySelector('.submenu-list');
            if (subList) subList.classList.add('show');
        }

        document.querySelectorAll('.submenu-item').forEach(s => s.classList.remove('active'));
        if (sectionId === 'um-list-section' && document.getElementById('sub-um-list')) document.getElementById('sub-um-list').classList.add('active');
        if (sectionId === 'um-form-section' && document.getElementById('sub-um-add')) document.getElementById('sub-um-add').classList.add('active');
        if (sectionId === 'um-permissions-section' && document.getElementById('sub-um-perm')) document.getElementById('sub-um-perm').classList.add('active');
        if (sectionId === 'um-audit-section' && document.getElementById('sub-um-audit')) document.getElementById('sub-um-audit').classList.add('active');

        document.querySelectorAll('.um-sub-section').forEach(sec => sec.style.display = 'none');
        const target = document.getElementById(sectionId);
        if (target) target.style.display = 'block';

        const topTitle = document.getElementById('top-title');
        if (topTitle) {
            if (sectionId === 'um-list-section') topTitle.innerText = "User Directory";
            if (sectionId === 'um-profile-section') topTitle.innerText = "User Profile";
            if (sectionId === 'um-form-section') topTitle.innerText = editingUserId ? "Edit Profile" : "Add User";
            if (sectionId === 'um-permissions-section') topTitle.innerText = "Manage Permissions";
            if (sectionId === 'um-audit-section') topTitle.innerText = "Audit Logs";
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.switchUserManagementView = function () {
        switchUserManagementSubSection('um-list-section');
    };

    /* ==========================================================
       4. Real User Portal Login (Fixed Isolation & Whitelist)
       ========================================================== */
    window.impersonateUser = function (userId) {
        const target = usersDatabase.find(u => u.id === userId);
        if (!target) return;

        if (target.status !== 'Active') {
            alert("Account is blocked.");
            return;
        }

        if (confirm(`Login to portal of: ${target.nameEn || target.name}?`)) {
            isImpersonating = true;
            impersonatedUser = target;

            // 1. Immediately deactivate all panels
            document.querySelectorAll('.view-panel').forEach(p => {
                p.classList.remove('active');
                p.style.display = 'none';
            });

            // 2. Create Top Sticky Bar
            let stickyBar = document.getElementById('global-impersonation-sticky-bar');
            if (!stickyBar) {
                stickyBar = document.createElement('div');
                stickyBar.id = 'global-impersonation-sticky-bar';
                stickyBar.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 42px; 
                    background: #dc2626; color: #fff; z-index: 999999; display: flex; 
                    align-items: center; justify-content: space-between; padding: 0 20px; 
                    font-size: 13px; font-weight: 600; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    font-family: system-ui, -apple-system, sans-serif;
                `;
                document.body.appendChild(stickyBar);
            }

            stickyBar.innerHTML = `
                <div>
                    <i class="fa-solid fa-user-lock" style="margin-right: 8px;"></i>
                    Portal Mode: <strong>${target.nameEn || target.name}</strong> (${target.role})
                </div>
                <button onclick="exitImpersonation()" style="background: #ffffff; color: #dc2626; border: none; padding: 5px 14px; border-radius: 4px; font-weight: 700; cursor: pointer; font-size: 12px;">
                    Exit Portal
                </button>
            `;
            stickyBar.style.display = 'flex';
            document.body.style.paddingTop = "42px";

            // 3. Apply Strict Sidebar Lockdown
            applyPortalPermissionsSmart(target.permissions || {});

            if (document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = target.nameEn || target.name;
            if (document.getElementById('dropdownRole')) document.getElementById('dropdownRole').innerText = target.role;

            window.logUserActivity("IMPERSONATION_START", `Admin switched to user portal: ${target.name}`);

            // 4. Auto-redirect to first allowed section
            setTimeout(() => {
                navigateToFirstAllowedSmart(target.permissions || {});
            }, 60);
        }
    };

    function applyPortalPermissionsSmart(perms) {
        const has = (prefix) => Object.keys(perms).some(k => k.startsWith(prefix) && perms[k]);

        document.querySelectorAll('.sidebar .menu-list > li').forEach(li => {
            const text = li.innerText.toLowerCase().trim();

            // Dashboard View
            if (text.includes('dashboard')) {
                li.style.display = perms['fin_dashboard_view'] ? '' : 'none';
            } 
            // Balance Management
            else if (text.includes('balance')) {
                li.style.display = perms['fin_balance_update'] ? '' : 'none';
            } 
            // Inventory
            else if (text.includes('inventory')) {
                li.style.display = (perms['fin_cash_inventory'] || perms['fin_card_inventory']) ? '' : 'none';
            } 
            // Customer
            else if (text.includes('customer')) {
                li.style.display = has('cust_') ? '' : 'none';
            } 
            // Daily Closing
            else if (text.includes('closing')) {
                li.style.display = has('closing_') ? '' : 'none';
            } 
            // CPSCL
            else if (text.includes('cpscl')) {
                li.style.display = has('cpscl_') ? '' : 'none';
            } 
            // Education
            else if (text.includes('education')) {
                li.style.display = has('edu_') ? '' : 'none';
            } 
            // Settings
            else if (text.includes('settings') || text.includes('configuration')) {
                li.style.display = has('config_') ? '' : 'none';
            } 
            // User Management (Always hidden in portal mode)
            else if (text.includes('user management')) {
                li.style.display = 'none';
            }
            // Global "Download Reports" (Strictly hidden unless explicitly granted)
            else if (text.startsWith('download reports') || text.includes('download reports')) {
                li.style.display = perms['global_download_reports'] ? '' : 'none';
            }
        });
    }

    function navigateToFirstAllowedSmart(perms) {
        const has = (prefix) => Object.keys(perms).some(k => k.startsWith(prefix) && perms[k]);

        // 1. CPSCL (e.g. MD Rabbi Hosen) -> Open Student List
        if (has('cpscl_')) {
            const parent = document.getElementById('menu-cpscl-parent') || 
                           Array.from(document.querySelectorAll('.sidebar li')).find(li => li.innerText.includes('CPSCL'));
            if (parent) {
                parent.classList.add('active', 'open');
                const subMenu = parent.querySelector('.submenu-list');
                if (subMenu) subMenu.classList.add('show');
                const firstSubLink = parent.querySelector('.submenu-list a') || parent.querySelector('a');
                if (firstSubLink) {
                    firstSubLink.click();
                    return;
                }
            }
        }

        // 2. Education (e.g. MD Robiul Islam) -> Open Fee Collection
        if (has('edu_')) {
            const eduParent = document.getElementById('menu-edu-parent') || 
                              Array.from(document.querySelectorAll('.sidebar li')).find(li => li.innerText.includes('Education'));
            if (eduParent) {
                eduParent.classList.add('active', 'open');
                const subMenu = eduParent.querySelector('.submenu-list');
                if (subMenu) subMenu.classList.add('show');
                const firstLink = eduParent.querySelector('.submenu-list a') || eduParent.querySelector('a');
                if (firstLink) {
                    firstLink.click();
                    return;
                }
            }
        }

        // 3. Customer
        if (has('cust_') && typeof switchCustomerSubSection === 'function') {
            switchCustomerSubSection('cust-list-section');
            return;
        }

        // 4. Financial Dashboard
        if (perms['fin_dashboard_view'] && typeof switchMainTab === 'function') {
            switchMainTab('dashboard');
            return;
        }
    }

    window.exitImpersonation = function () {
        if (!isImpersonating) return;

        isImpersonating = false;
        impersonatedUser = null;

        const stickyBar = document.getElementById('global-impersonation-sticky-bar');
        if (stickyBar) stickyBar.style.display = 'none';
        document.body.style.paddingTop = "0px";

        // Restore all navigation
        document.querySelectorAll('.sidebar .menu-list > li').forEach(m => m.style.display = '');

        if (document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = "Admin";
        if (document.getElementById('dropdownRole')) document.getElementById('dropdownRole').innerText = "Super Admin";

        window.logUserActivity("IMPERSONATION_EXIT", "Admin exited portal session.");
        switchUserManagementSubSection('um-list-section');
    };

    /* ==========================================================
       5. User Profile Rendering
       ========================================================== */
    window.openUserProfile = function (userId) {
        viewingUserId = userId;
        renderUserProfileDetails(userId);
        switchUserManagementSubSection('um-profile-section');
    };

    function renderUserProfileDetails(userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;

        document.getElementById('profHeadingName').innerText = `${u.nameEn || u.name}`;
        document.getElementById('profHeadingSub').innerText = `ID: #${u.empId || 'N/A'} • ${u.designation || 'Staff'} • ${u.role}`;
        document.getElementById('profStatusBadge').innerHTML = `<span class="um-badge ${u.status === 'Active' ? 'um-badge-active' : 'um-badge-blocked'}">${u.status}</span>`;

        document.getElementById('profileTopActionBtns').innerHTML = `
            <button onclick="impersonateUser('${u.id}')" class="um-btn-clean um-btn-login">
                <i class="fa-solid fa-key"></i> Login Portal
            </button>
            <button onclick="editUserById('${u.id}')" class="um-btn-clean">
                <i class="fa-solid fa-pen"></i> Edit Profile
            </button>
            <button onclick="openPermissionsManager('${u.id}')" class="um-btn-clean um-btn-perm">
                <i class="fa-solid fa-shield-halved"></i> Permissions
            </button>
            <button onclick="toggleUserStatusById('${u.id}')" class="um-btn-clean um-btn-danger">
                ${u.status === 'Active' ? 'Block' : 'Activate'}
            </button>
        `;

        document.getElementById('profRowNameEn').innerText = u.nameEn || u.name || '-';
        document.getElementById('profRowNameBn').innerText = u.nameBn || '-';
        document.getElementById('profRowDesignation').innerText = u.designation || '-';
        document.getElementById('profRowRole').innerText = u.role || 'Custom';
        document.getElementById('profRowEmpId').innerText = u.empId || '-';
        document.getElementById('profRowMobile').innerHTML = u.mobile ? `<a href="tel:${u.mobile}" style="color: #4f46e5; text-decoration: none;">${u.mobile}</a>` : '-';
        document.getElementById('profRowEmail').innerHTML = u.email ? `<a href="mailto:${u.email}" style="color: #4f46e5; text-decoration: none;">${u.email}</a>` : '-';
        document.getElementById('profRowPass').innerText = u.password || '-';

        const matrixBody = document.getElementById('profPermissionsMatrixBody');
        matrixBody.innerHTML = '';
        const userPerms = u.permissions || {};

        SYSTEM_MODULES.forEach(mod => {
            let pills = '';
            let count = 0;

            mod.permissions.forEach(p => {
                if (userPerms[p.key]) {
                    count++;
                    pills += `<span class="um-scope-pill">${p.label}</span>`;
                }
            });

            if (!pills) pills = `<span style="color: #94a3b8; font-size: 12px;">No Access</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 700;">${mod.groupName}</td>
                <td>${pills}</td>
                <td style="text-align: center;">
                    ${count > 0 ? '<span style="color: #16a34a; font-weight: 700;">Active</span>' : '<span style="color: #94a3b8;">Locked</span>'}
                </td>
            `;
            matrixBody.appendChild(tr);
        });
    }

    /* ==========================================================
       6. Directory List & Profile Form
       ========================================================== */
    function renderSummaryStats() {
        const total = usersDatabase.length;
        const active = usersDatabase.filter(u => u.status === 'Active').length;
        const blocked = total - active;

        if (document.getElementById('statTotalUsers')) document.getElementById('statTotalUsers').innerText = total;
        if (document.getElementById('statActiveUsers')) document.getElementById('statActiveUsers').innerText = active;
        if (document.getElementById('statBlockedUsers')) document.getElementById('statBlockedUsers').innerText = blocked;
    }

    function renderUsersTable() {
        const tbody = document.getElementById('um-users-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (usersDatabase.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 25px;">No users found.</td></tr>`;
            return;
        }

        usersDatabase.forEach(u => {
            const isShown = showPasswordMap[u.id];
            const passDisplay = isShown ? u.password : '••••••••';
            const eyeIcon = isShown ? 'fa-eye-slash' : 'fa-eye';

            let scopeBadges = '';
            const perms = u.permissions || {};
            const hasEdu = Object.keys(perms).some(k => k.startsWith('edu_') && perms[k]);
            const hasCPSCL = Object.keys(perms).some(k => k.startsWith('cpscl_') && perms[k]);
            const hasCust = Object.keys(perms).some(k => k.startsWith('cust_') && perms[k]);
            const hasFin = Object.keys(perms).some(k => (k.startsWith('fin_') || k.startsWith('closing_')) && perms[k]);

            if (hasEdu) scopeBadges += `<span class="um-scope-pill">Education</span>`;
            if (hasCPSCL) scopeBadges += `<span class="um-scope-pill">CPSCL</span>`;
            if (hasCust) scopeBadges += `<span class="um-scope-pill">Customer</span>`;
            if (hasFin) scopeBadges += `<span class="um-scope-pill">Finance</span>`;
            if (!scopeBadges) scopeBadges = `<span style="font-size: 11px; color: #94a3b8;">None</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="display: block;">${u.nameEn || u.name}</strong>
                    <small style="color: #64748b;">${u.empId || 'N/A'} • ${u.designation || 'Staff'}</small>
                </td>
                <td>
                    <strong>${u.role || 'Custom'}</strong><br>
                    <small style="color: #64748b;">${u.mobile || u.email || '-'}</small>
                </td>
                <td>
                    <span style="font-family: monospace;">${passDisplay}</span>
                    <button onclick="togglePasswordView('${u.id}')" style="background: none; border: none; color: #64748b; cursor: pointer; margin-left: 4px;">
                        <i class="fa-solid ${eyeIcon}"></i>
                    </button>
                </td>
                <td>${scopeBadges}</td>
                <td><span class="um-badge ${u.status === 'Active' ? 'um-badge-active' : 'um-badge-blocked'}">${u.status}</span></td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 4px;">
                        <button onclick="openUserProfile('${u.id}')" class="um-btn-clean" title="View Profile">View</button>
                        <button onclick="editUserById('${u.id}')" class="um-btn-clean" title="Edit Profile"><i class="fa-solid fa-pen"></i></button>
                        <button onclick="openPermissionsManager('${u.id}')" class="um-btn-clean um-btn-perm" title="Permissions"><i class="fa-solid fa-shield-halved"></i></button>
                        <button onclick="impersonateUser('${u.id}')" class="um-btn-clean um-btn-login" title="Login Portal">Login</button>
                        <button onclick="deleteUser('${u.id}')" class="um-btn-clean um-btn-danger" title="Delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.filterUMUsers = function () {
        const q = (document.getElementById('umSearchInput')?.value || '').toLowerCase();
        const role = (document.getElementById('umRoleFilter')?.value || '').toLowerCase();

        const rows = document.querySelectorAll('#um-users-tbody tr');
        rows.forEach(r => {
            const text = r.innerText.toLowerCase();
            const matchQ = !q || text.includes(q);
            const matchR = !role || text.includes(role);
            r.style.display = (matchQ && matchR) ? '' : 'none';
        });
    };

    window.openCreateUserForm = function () {
        editingUserId = null;
        document.getElementById('um-form-page-title').innerText = "Add User";
        document.getElementById('um-inp-name').value = '';
        document.getElementById('um-inp-name-en').value = '';
        document.getElementById('um-inp-name-bn').value = '';
        document.getElementById('um-inp-emp-id').value = 'MC-' + (100 + usersDatabase.length + 1);
        document.getElementById('um-inp-designation').value = '';
        document.getElementById('um-inp-mobile').value = '';
        document.getElementById('um-inp-email').value = '';
        document.getElementById('um-inp-pass').value = '';
        document.getElementById('um-inp-role').value = 'Custom';
        switchUserManagementSubSection('um-form-section');
    };

    window.editUserById = function (userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;

        editingUserId = u.id;
        document.getElementById('um-form-page-title').innerText = `Edit Profile: ${u.nameEn || u.name}`;
        document.getElementById('um-inp-name').value = u.name || '';
        document.getElementById('um-inp-name-en').value = u.nameEn || u.name || '';
        document.getElementById('um-inp-name-bn').value = u.nameBn || '';
        document.getElementById('um-inp-emp-id').value = u.empId || '';
        document.getElementById('um-inp-designation').value = u.designation || '';
        document.getElementById('um-inp-mobile').value = u.mobile || '';
        document.getElementById('um-inp-email').value = u.email || '';
        document.getElementById('um-inp-pass').value = u.password || '';
        document.getElementById('um-inp-role').value = u.role || 'Custom';

        switchUserManagementSubSection('um-form-section');
    };

    window.handleUserFormSubmit = async function (event) {
        event.preventDefault();

        const roleVal = document.getElementById('um-inp-role').value;
        let existingUser = editingUserId ? usersDatabase.find(u => u.id === editingUserId) : null;
        let userPermissions = existingUser?.permissions || {};

        if (!editingUserId) {
            if (roleVal === 'Super Admin') {
                SYSTEM_MODULES.forEach(m => m.permissions.forEach(p => userPermissions[p.key] = true));
            } else if (roleVal === 'Education Staff') {
                SYSTEM_MODULES[0].permissions.forEach(p => userPermissions[p.key] = true);
            } else if (roleVal === 'CPSCL Operator') {
                SYSTEM_MODULES[1].permissions.forEach(p => userPermissions[p.key] = true);
            } else if (roleVal === 'Accountant') {
                SYSTEM_MODULES[2].permissions.forEach(p => userPermissions[p.key] = true);
                SYSTEM_MODULES[3].permissions.forEach(p => userPermissions[p.key] = true);
            }
        }

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
            role: roleVal,
            permissions: userPermissions,
            status: existingUser?.status || 'Active',
            createdAt: existingUser?.createdAt || new Date().toLocaleString('en-US')
        };

        if (editingUserId) {
            const idx = usersDatabase.findIndex(u => u.id === editingUserId);
            if (idx !== -1) usersDatabase[idx] = { ...usersDatabase[idx], ...userData };
            window.logUserActivity("USER_EDIT", `Updated profile for: ${userData.name}`);
        } else {
            usersDatabase.push(userData);
            window.logUserActivity("USER_CREATE", `Created profile: ${userData.name}`);
        }

        await syncUsersToFirebase(usersDatabase);
        renderUsersTable();
        renderSummaryStats();
        populatePermissionsUserDropdown();

        switchUserManagementSubSection('um-list-section');
    };

    /* ==========================================================
       7. Dedicated Permissions Manager Engine
       ========================================================== */
    function populatePermissionsUserDropdown() {
        const select = document.getElementById('permUserSelect');
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '';

        usersDatabase.forEach(u => {
            const opt = document.createElement('option');
            opt.value = u.id;
            opt.innerText = `${u.nameEn || u.name} (${u.empId || 'No ID'}) - ${u.role}`;
            select.appendChild(opt);
        });

        if (currentVal && usersDatabase.some(u => u.id === currentVal)) {
            select.value = currentVal;
        }
    }

    window.openPermissionsManager = function (userId = null) {
        populatePermissionsUserDropdown();

        const targetId = userId || usersDatabase[0]?.id;
        if (!targetId) {
            alert("Please create a user first.");
            return;
        }

        document.getElementById('permUserSelect').value = targetId;
        loadUserPermissionsForConfig(targetId);
        switchUserManagementSubSection('um-permissions-section');
    };

    window.loadUserPermissionsForConfig = function (userId) {
        selectedPermUserId = userId;
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;

        const p = u.permissions || {};
        document.querySelectorAll('.perm-checkbox').forEach(cb => {
            cb.checked = !!p[cb.dataset.key];
        });
    };

    window.toggleGroupPerms = function (gIdx) {
        const boxes = document.querySelectorAll(`.perm-group-${gIdx}`);
        const allChecked = Array.from(boxes).every(b => b.checked);
        boxes.forEach(b => b.checked = !allChecked);
    };

    window.toggleAllGlobalPerms = function (status) {
        document.querySelectorAll('.perm-checkbox').forEach(b => b.checked = status);
    };

    window.handleSavePermissionsSubmit = async function (event) {
        event.preventDefault();

        const userId = document.getElementById('permUserSelect').value;
        const user = usersDatabase.find(u => u.id === userId);
        if (!user) return;

        const permissionsObj = {};
        document.querySelectorAll('.perm-checkbox').forEach(cb => {
            if (cb.checked) permissionsObj[cb.dataset.key] = true;
        });

        user.permissions = permissionsObj;

        await syncUsersToFirebase(usersDatabase);
        renderUsersTable();
        window.logUserActivity("PERMISSIONS_UPDATE", `Updated permissions for ${user.name}`);

        if (typeof showToast === 'function') {
            showToast(`Permissions updated for ${user.nameEn || user.name}!`, "success");
        } else {
            alert("Permissions updated successfully!");
        }

        switchUserManagementSubSection('um-list-section');
    };

    window.toggleUserStatusById = async function (userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;
        u.status = u.status === 'Active' ? 'Blocked' : 'Active';
        await syncUsersToFirebase(usersDatabase);
        renderUsersTable();
        renderSummaryStats();
        if (viewingUserId === userId) renderUserProfileDetails(userId);
        window.logUserActivity("USER_STATUS_CHANGE", `User ${u.name} status: ${u.status}`);
    };

    window.deleteUser = async function (userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;

        if (confirm(`Delete user '${u.nameEn || u.name}'?`)) {
            usersDatabase = usersDatabase.filter(item => item.id !== userId);
            await syncUsersToFirebase(usersDatabase);
            renderUsersTable();
            renderSummaryStats();
            populatePermissionsUserDropdown();
            window.logUserActivity("USER_DELETE", `Deleted user: ${u.name}`);
            switchUserManagementSubSection('um-list-section');
        }
    };

    window.togglePasswordView = function (userId) {
        showPasswordMap[userId] = !showPasswordMap[userId];
        renderUsersTable();
    };

    function renderAuditLogsTable() {
        const tbody = document.getElementById('um-audit-tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (auditLogsDatabase.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">No logs found.</td></tr>`;
            return;
        }

        auditLogsDatabase.slice(0, 100).forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="color: #64748b;">${log.timestamp}</td>
                <td><strong>${log.user}</strong></td>
                <td><span class="um-scope-pill">${log.action}</span></td>
                <td>${log.details}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.clearAuditLogs = async function () {
        if (confirm("Clear all audit logs?")) {
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
