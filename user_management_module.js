/**
 * User Management & Comprehensive Dynamic RBAC Module
 * Real Portal Impersonation & Sidebar Dropdown Submenu
 * Mousumi Computer ERP Core Engine
 */

(function () {
    let usersDatabase = JSON.parse(localStorage.getItem('cpscl_system_users') || '[]');
    let auditLogsDatabase = JSON.parse(localStorage.getItem('cpscl_audit_logs') || '[]');
    let editingUserId = null;
    let viewingUserId = null;
    let showPasswordMap = {};

    // আসল পোর্টাল ইমপারসনেশন ট্র্যাকার
    let isImpersonating = false;
    let impersonatedUser = null;

    let dbInstance = null;
    let dbRefFunc = null;
    let dbSetFunc = null;

    // ERP-এর সকল মডিউল ও পারমিশন তালিকা
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
                    renderSummaryStats();
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
            user: userName || (isImpersonating ? impersonatedUser?.name + " (Portal Mode)" : 'Admin'),
            action: actionType,
            details: details,
            timestamp: new Date().toLocaleString('en-US', { hour12: true })
        };
        auditLogsDatabase.unshift(newLog);
        if (auditLogsDatabase.length > 250) auditLogsDatabase.pop();
        await syncLogsToFirebase(auditLogsDatabase);
        renderAuditLogsTable();
    };

    /* ==========================================================
       ২. সাইডবারে আসল ড্রপডাউন মেনু তৈরি (Customer Management-এর মতো)
       ========================================================== */
    function initUserManagementModule() {
        const menuList = document.querySelector('.sidebar .menu-list') || document.querySelector('.menu-list');
        const mainWrapper = document.querySelector('.main-wrapper') || document.querySelector('main');

        if (!menuList || !mainWrapper) {
            setTimeout(initUserManagementModule, 150);
            return;
        }

        // সাইডবারে ড্রপডাউন প্যারেন্ট মেনু তৈরি
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
                        <a onclick="openCreateUserForm()"><i class="fa-solid fa-angle-right"></i> <span>Add New User</span></a>
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

        // ভিউ প্যানেল তৈরি
        let viewPanel = document.getElementById('user-management-view');
        if (!viewPanel) {
            viewPanel = document.createElement('div');
            viewPanel.className = 'view-panel';
            viewPanel.id = 'user-management-view';
            mainWrapper.appendChild(viewPanel);
        }

        // ডায়নামিক পারমিশন গ্রুপ এইচটিএমএল
        let permissionGroupsHTML = '';
        SYSTEM_MODULES.forEach((mod, gIdx) => {
            let permItems = '';
            mod.permissions.forEach(p => {
                permItems += `
                    <label style="font-size: 0.84rem; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 10px; border-radius: 8px; background: #fff; border: 1px solid #f1f5f9;">
                        <input type="checkbox" class="perm-checkbox perm-group-${gIdx}" data-key="${p.key}" style="width: 17px; height: 17px; accent-color: #4f46e5;">
                        <span>${p.label}</span>
                    </label>
                `;
            });

            permissionGroupsHTML += `
                <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 16px; margin-bottom: 14px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 0.92rem; color: ${mod.color};">
                            <i class="fa-solid ${mod.icon}"></i>
                            <span>${mod.groupName}</span>
                        </div>
                        <button type="button" onclick="toggleGroupPerms(${gIdx})" style="background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 12px; font-size: 0.78rem; font-weight: 700; cursor: pointer; color: #475569;">
                            Toggle All
                        </button>
                    </div>
                    <div style="grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); display: grid; gap: 10px;">
                        ${permItems}
                    </div>
                </div>
            `;
        });

        viewPanel.innerHTML = `
            <style>
                .um-sub-section { display: none; animation: umFadeIn 0.25s ease-out; }
                @keyframes umFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

                .um-card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); margin-bottom: 20px; }
                .um-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; font-family: 'Plus Jakarta Sans', 'Tiro Bangla', serif; }
                .um-table th { padding: 0 18px; color: #94a3b8; font-size: 0.88rem; font-weight: 700; text-align: left; text-transform: uppercase; }
                .um-table td { background: #ffffff; padding: 16px 18px; font-size: 0.95rem; color: #1e293b; border: none; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .um-table tr td:first-child { border-radius: 14px 0 0 14px; }
                .um-table tr td:last-child { border-radius: 0 14px 14px 0; text-align: right; }

                .um-profile-data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .um-profile-data-table th, .um-profile-data-table td { padding: 12px 18px; border: 1px solid #e2e8f0; font-size: 0.92rem; }
                .um-profile-data-table th { width: 20%; background-color: #f8fafc; color: #64748b; font-weight: 600; }
                .um-profile-data-table td { width: 30%; font-weight: 700; color: #1e293b; }

                .um-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
                .um-stat-card { background: #fff; border-radius: 14px; padding: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
                .um-stat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }

                .um-btn-action { padding: 8px 14px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; transition: 0.2s; }
                .um-btn-action:hover { background: #e2e8f0; }
                .um-btn-view { color: #4f46e5; border-color: #c7d2fe; background: #eef2ff; }
                .um-btn-view:hover { background: #4f46e5; color: #fff; }
                .um-btn-impersonate { color: #d97706; border-color: #fde68a; background: #fffbeb; }
                .um-btn-impersonate:hover { background: #d97706; color: #fff; }
                .um-btn-danger { color: #ef4444; border-color: #fecaca; background: #fef2f2; }
                .um-btn-danger:hover { background: #ef4444; color: #fff; }

                .um-badge-active { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.78rem; }
                .um-badge-blocked { background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.78rem; }
                .um-control { width: 100%; height: 45px; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 14px; font-size: 0.95rem; outline: none; }
                .um-control:focus { border-color: #4f46e5; }
            </style>

            <!-- ============================================================== -->
            <!-- SUB-SECTION 1: USER DIRECTORY (MAIN LIST)                      -->
            <!-- ============================================================== -->
            <div id="um-list-section" class="um-sub-section" style="display: block;">
                
                <div class="um-stats-grid">
                    <div class="um-stat-card">
                        <div class="um-stat-icon" style="background: #eef2ff; color: #4f46e5;"><i class="fa-solid fa-users"></i></div>
                        <div>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0; font-weight: 700;">মোট ইউজার</p>
                            <h3 id="statTotalUsers" style="font-size: 1.4rem; color: #0f172a; margin: 0; font-weight: 800;">০</h3>
                        </div>
                    </div>
                    <div class="um-stat-card">
                        <div class="um-stat-icon" style="background: #f0fdf4; color: #16a34a;"><i class="fa-solid fa-user-check"></i></div>
                        <div>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0; font-weight: 700;">সক্রিয় স্টাফ</p>
                            <h3 id="statActiveUsers" style="font-size: 1.4rem; color: #16a34a; margin: 0; font-weight: 800;">০</h3>
                        </div>
                    </div>
                    <div class="um-stat-card">
                        <div class="um-stat-icon" style="background: #fef2f2; color: #dc2626;"><i class="fa-solid fa-user-lock"></i></div>
                        <div>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0; font-weight: 700;">ব্লকড ইউজার</p>
                            <h3 id="statBlockedUsers" style="font-size: 1.4rem; color: #dc2626; margin: 0; font-weight: 800;">০</h3>
                        </div>
                    </div>
                    <div class="um-stat-card">
                        <div class="um-stat-icon" style="background: #fffbeb; color: #d97706;"><i class="fa-solid fa-shield-halved"></i></div>
                        <div>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0; font-weight: 700;">ডিপার্টমেন্ট</p>
                            <h3 style="font-size: 1.4rem; color: #d97706; margin: 0; font-weight: 800;">৬ টি বিভাগ</h3>
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; gap: 10px; flex: 1; max-width: 500px;">
                        <input type="text" id="umSearchInput" class="um-control" placeholder="ইউজারের নাম বা আইডি দিয়ে খুঁজুন..." oninput="filterUMUsers()">
                        <select id="umRoleFilter" class="um-control" style="width: 180px;" onchange="filterUMUsers()">
                            <option value="">সকল রোল</option>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Education Staff">Education Staff</option>
                            <option value="CPSCL Operator">CPSCL Operator</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Custom">Custom</option>
                        </select>
                    </div>
                    <button class="um-btn-action" style="background: #4f46e5; color: #fff; border: none; padding: 10px 22px;" onclick="openCreateUserForm()">
                        <i class="fa-solid fa-plus"></i> নতুন ইউজার যুক্ত করুন
                    </button>
                </div>

                <div style="overflow-x: auto;">
                    <table class="um-table">
                        <thead>
                            <tr>
                                <th>ইউজার ও পদবী</th>
                                <th>রোল ও যোগাযোগ</th>
                                <th>পাসওয়ার্ড</th>
                                <th>অনুমোদিত বিভাগ</th>
                                <th>স্ট্যাটাস</th>
                                <th style="text-align: right;">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody id="um-users-tbody"></tbody>
                    </table>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- SUB-SECTION 2: USER PROFILE & ACCESS INSPECTION                -->
            <!-- ============================================================== -->
            <div id="um-profile-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1.5px solid #e2e8f0; padding-bottom: 15px;">
                    <button class="um-btn-action" onclick="switchUserManagementSubSection('um-list-section')" style="font-size: 0.9rem;">
                        <i class="fa-solid fa-arrow-left"></i> ইউজার তালিকায় ফিরে যান
                    </button>
                    <div style="display: flex; gap: 10px;" id="profileTopActionBtns"></div>
                </div>

                <div class="um-card">
                    <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
                        <div style="width: 75px; height: 75px; border-radius: 50%; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; border: 2px solid #c7d2fe;" id="profAvatar">
                            U
                        </div>
                        <div>
                            <h2 style="font-size: 1.4rem; color: #1e293b; margin: 0 0 4px 0; font-weight: 800;" id="profHeadingName">User Name</h2>
                            <p style="color: #64748b; margin: 0; font-size: 0.9rem;" id="profHeadingSub">ID: #--- &bull; Role: Staff</p>
                        </div>
                        <div style="margin-left: auto;" id="profStatusBadge"></div>
                    </div>

                    <h3 style="font-size: 1rem; color: #1e293b; margin-bottom: 12px; font-weight: 700;"><i class="fa-solid fa-id-card-clip text-primary mr-1"></i> ব্যক্তিগত ও অ্যাকাউন্টিং তথ্য</h3>
                    <div style="overflow-x: auto;">
                        <table class="um-profile-data-table">
                            <tbody>
                                <tr>
                                    <th>Full Name (English)</th>
                                    <td id="profRowNameEn">-</td>
                                    <th>Designation / Title</th>
                                    <td id="profRowDesignation">-</td>
                                </tr>
                                <tr>
                                    <th>Full Name (Bangla)</th>
                                    <td id="profRowNameBn">-</td>
                                    <th>Assigned Role</th>
                                    <td id="profRowRole">-</td>
                                </tr>
                                <tr>
                                    <th>Mobile Number</th>
                                    <td id="profRowMobile">-</td>
                                    <th>Employee ID</th>
                                    <td id="profRowEmpId">-</td>
                                </tr>
                                <tr>
                                    <th>Email Address</th>
                                    <td id="profRowEmail">-</td>
                                    <th>System Password</th>
                                    <td id="profRowPass">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <h3 style="font-size: 1rem; color: #1e293b; margin: 25px 0 12px 0; font-weight: 700;"><i class="fa-solid fa-shield-halved text-success mr-1"></i> অনুমোদিত মডিউল ও মেনু অডিট</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 0.85rem; text-align: left;">বিভাগ (Department)</th>
                                    <th style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 0.85rem; text-align: left;">অনুমোদিত ফিচারসমূহ (Allowed Scope)</th>
                                    <th style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 0.85rem; text-align: center; width: 120px;">স্ট্যাটাস</th>
                                </tr>
                            </thead>
                            <tbody id="profPermissionsMatrixBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- SUB-SECTION 3: CREATE / EDIT USER FORM                         -->
            <!-- ============================================================== -->
            <div id="um-form-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h2 style="font-size: 1.4rem; color: #1e293b; font-weight: 800;" id="um-form-page-title">নতুন ইউজার যোগ করুন</h2>
                        <p style="font-size: 0.88rem; color: #64748b; margin-top: 3px;">ইউজার ম্যানেজমেন্ট <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; margin: 0 5px;"></i> পারমিশন সেটআপ</p>
                    </div>
                    <button class="um-btn-action" onclick="switchUserManagementSubSection('um-list-section')">
                        <i class="fa-solid fa-arrow-left"></i> বাতিল করুন
                    </button>
                </div>

                <div class="um-card" style="max-width: 950px; margin: 0 auto;">
                    <form onsubmit="handleUserFormSubmit(event)" style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Login Username *</label>
                                <input type="text" id="um-inp-name" class="um-control" placeholder="staff1" required>
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Email Address *</label>
                                <input type="email" id="um-inp-email" class="um-control" placeholder="staff@example.com" required>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Full Name (English) *</label>
                                <input type="text" id="um-inp-name-en" class="um-control" placeholder="Md. Ashiqur Rahman" required>
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Full Name (Bangla)</label>
                                <input type="text" id="um-inp-name-bn" class="um-control" placeholder="মোঃ আশিকুর রহমান">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Employee ID *</label>
                                <input type="text" id="um-inp-emp-id" class="um-control" placeholder="MC-102" required>
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Designation / Title *</label>
                                <input type="text" id="um-inp-designation" class="um-control" placeholder="Counter Staff" required>
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Mobile Number</label>
                                <input type="text" id="um-inp-mobile" class="um-control" placeholder="01700-000000">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Password *</label>
                                <input type="text" id="um-inp-pass" class="um-control" placeholder="পাসওয়ার্ড সেট করুন" required>
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Quick Preset Role *</label>
                                <select id="um-inp-role" class="um-control" onchange="handlePresetRoleChange(this.value)">
                                    <option value="Custom">Custom Selection (নিজের মতো বেছে নিন)</option>
                                    <option value="Education Staff">Education Staff (শুধু এডুকেশন ও ফি টার্মিনাল)</option>
                                    <option value="CPSCL Operator">CPSCL Operator (শুধু সার্টিফিকেট পোর্টাল)</option>
                                    <option value="Accountant">Accountant (কাস্টমার ও ব্যালেন্স হিসাব)</option>
                                    <option value="Super Admin">Super Admin (সব মডিউলের পূর্ণ এক্সেস)</option>
                                </select>
                            </div>
                        </div>

                        <!-- পারমিশন চেকবক্স গ্রিড -->
                        <div style="margin-top: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div>
                                    <h4 style="font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0;">মডিউলার অ্যাক্সেস স্কোপ নির্বাচন করুন</h4>
                                    <p style="font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0;">যেসব ফিচারে টিক দেওয়া থাকবে, স্টাফ শুধু সেই মেনুগুলো দেখতে পারবে।</p>
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
                            <button type="button" onclick="switchUserManagementSubSection('um-list-section')" style="padding: 12px 25px; background: #94a3b8; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">বাতিল</button>
                            <button type="submit" style="padding: 12px 35px; background: #4f46e5; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                                <i class="fa-solid fa-floppy-disk mr-1"></i> সংরক্ষণ করুন
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- SUB-SECTION 4: AUDIT TRAIL                                     -->
            <!-- ============================================================== -->
            <div id="um-audit-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <button class="um-btn-action" onclick="switchUserManagementSubSection('um-list-section')">
                        <i class="fa-solid fa-arrow-left"></i> ইউজার তালিকায় ফিরুন
                    </button>
                    <button onclick="clearAuditLogs()" class="um-btn-action um-btn-danger">
                        <i class="fa-solid fa-trash-can mr-1"></i> অডিট হিস্ট্রি মুছুন
                    </button>
                </div>

                <div class="um-card">
                    <h3 style="font-size: 1.1rem; color: #1e293b; margin-bottom: 15px; font-weight: 800;"><i class="fa-solid fa-clock-rotate-left mr-1 text-primary"></i> সিস্টেম লাইভ অ্যাক্টিভিটি লগ</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                    <th style="padding: 12px; text-align: left; font-size: 0.84rem; color: #64748b;">TIMESTAMP</th>
                                    <th style="padding: 12px; text-align: left; font-size: 0.84rem; color: #64748b;">USER</th>
                                    <th style="padding: 12px; text-align: left; font-size: 0.84rem; color: #64748b;">ACTION</th>
                                    <th style="padding: 12px; text-align: left; font-size: 0.84rem; color: #64748b;">DETAILS</th>
                                </tr>
                            </thead>
                            <tbody id="um-audit-tbody"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        renderUsersTable();
        renderSummaryStats();
        renderAuditLogsTable();
    }

    /* ==========================================================
       ৩. সাব-সেকশন সুইচিং ইঞ্জিন (কাস্টমার মডিউলের হুবহু অনুরূপ)
       ========================================================== */
    window.switchUserManagementSubSection = function (sectionId) {
        // ১. সব মেইন ভিউ প্যানেল বন্ধ করে User Management ভিউ চালু
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const umView = document.getElementById('user-management-view');
        if (umView) umView.classList.add('active');

        // ২. সাইডবার প্যারেন্ট ও সাবমেনু হাইলাইট
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
        if (sectionId === 'um-audit-section' && document.getElementById('sub-um-audit')) document.getElementById('sub-um-audit').classList.add('active');

        // ৩. সাব-সেকশনগুলো হাইড করে টার্গেট সেকশন ওপেন
        document.querySelectorAll('.um-sub-section').forEach(sec => sec.style.display = 'none');
        const target = document.getElementById(sectionId);
        if (target) target.style.display = 'block';

        const topTitle = document.getElementById('top-title');
        if (topTitle) {
            if (sectionId === 'um-list-section') topTitle.innerText = "ইউজার ডিরেক্টরি";
            if (sectionId === 'um-profile-section') topTitle.innerText = "ইউজার প্রোফাইল ও অ্যাক্সেস অডিট";
            if (sectionId === 'um-form-section') topTitle.innerText = editingUserId ? "ইউজার পারমিশন সংশোধন" : "নতুন ইউজার তৈরি";
            if (sectionId === 'um-audit-section') topTitle.innerText = "অ্যাক্টিভিটি অডিট ট্রেইল";
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.switchUserManagementView = function () {
        switchUserManagementSubSection('um-list-section');
    };

    /* ==========================================================
       ৪. বাস্তব ইউজার পোর্টাল সুইচিং (TRUE PORTAL IMPERSONATION)
       ========================================================== */
    window.impersonateUser = function (userId) {
        const target = usersDatabase.find(u => u.id === userId);
        if (!target) return;

        if (target.status !== 'Active') {
            alert("এই অ্যাকাউন্টটি ব্লক করা! ব্লকড পোর্টালে ঢোকা সম্ভব নয়।");
            return;
        }

        if (confirm(`আপনি কি '${target.nameEn || target.name}' এর পোর্টালে ঢুকতে চান? আপনি শুধু এই ইউজারের অনুমোদিত মেনুগুলোই দেখতে পাবেন।`)) {
            isImpersonating = true;
            impersonatedUser = target;

            // ১. স্ক্রিনের একদম ওপরে ফিক্সড লাল ব্যানার তৈরি (যাতে যেকোনো সময় বের হওয়া যায়)
            let stickyBar = document.getElementById('global-impersonation-sticky-bar');
            if (!stickyBar) {
                stickyBar = document.createElement('div');
                stickyBar.id = 'global-impersonation-sticky-bar';
                stickyBar.style.cssText = `
                    position: fixed; top: 0; left: 0; width: 100%; height: 46px; 
                    background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); 
                    color: #fff; z-index: 999999; display: flex; align-items: center; 
                    justify-content: space-between; padding: 0 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    font-family: 'Plus Jakarta Sans', sans-serif;
                `;
                document.body.appendChild(stickyBar);
            }

            stickyBar.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.95rem;">
                    <i class="fa-solid fa-user-secret" style="font-size: 1.2rem;"></i>
                    <span>[USER PORTAL MODE]: আপনি এখন <strong>${target.nameEn || target.name}</strong> (${target.role}) এর পোর্টালে আছেন। অননুমোদিত অ্যাডমিন মেনুসমূহ লক করা হয়েছে।</span>
                </div>
                <button onclick="exitImpersonation()" style="background: #fff; color: #be123c; border: none; padding: 7px 18px; border-radius: 8px; font-weight: 800; cursor: pointer;">
                    <i class="fa-solid fa-arrow-right-from-bracket mr-1"></i> Exit Portal & Return to Admin
                </button>
            `;
            stickyBar.style.display = 'flex';
            document.body.style.paddingTop = "46px";

            // ২. এই ইউজারের পারমিশন অনুযায়ী সাইডবারের অ্যাডমিন মেনুগুলো হাইড (লক) করা
            applyUserPortalMenuRestrictions(target.permissions || {});

            // ৩. ন্যাভবারে ইউজারের নাম বসানো
            if (document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = target.nameEn || target.name;
            if (document.getElementById('dropdownRole')) document.getElementById('dropdownRole').innerText = target.role;

            window.logUserActivity("IMPERSONATION_START", `Admin logged into portal of user '${target.name}'`);

            if (typeof showToast === 'function') {
                showToast(`Switched into ${target.nameEn || target.name}'s portal!`, "warning");
            }

            // ইউজারের প্রথম অনুমোদিত পেজে ন্যাভিগেট করা
            navigateToAllowedUserModule(target.permissions || {});
        }
    };

    // পারমিশন অনুযায়ী সাইডবার লক করার ইঞ্জিন
    function applyUserPortalMenuRestrictions(perms) {
        const check = (key) => !!perms[key];

        // ১. ব্যালেন্স ম্যানেজমেন্ট লক
        const balMenu = document.getElementById('menu-bal-parent');
        if (balMenu) balMenu.style.display = check('fin_balance_update') ? '' : 'none';

        // ২. ইনভেন্টরি লক
        const invMenu = document.getElementById('menu-inv-parent');
        if (invMenu) invMenu.style.display = (check('fin_cash_inventory') || check('fin_card_inventory')) ? '' : 'none';

        // ৩. কাস্টমার ম্যানেজমেন্ট লক
        const custMenu = document.getElementById('menu-cust-parent');
        const hasCust = Object.keys(perms).some(k => k.startsWith('cust_') && perms[k]);
        if (custMenu) custMenu.style.display = hasCust ? '' : 'none';

        // ৪. ডেইলি ক্লোজিং লক
        const closeMenu = document.getElementById('menu-closing-parent');
        const hasClose = Object.keys(perms).some(k => k.startsWith('closing_') && perms[k]);
        if (closeMenu) closeMenu.style.display = hasClose ? '' : 'none';

        // ৫. সেটিংস লক
        const setMenu = document.getElementById('menu-settings-parent');
        const hasConfig = Object.keys(perms).some(k => k.startsWith('config_') && perms[k]);
        if (setMenu) setMenu.style.display = hasConfig ? '' : 'none';

        // ৬. ইউজার ম্যানেজমেন্ট সাইডবার থেকে পুরোপুরি হাইড (স্টাফ কখনো ইউজার ম্যানেজমেন্ট দেখবে না)
        const userMenu = document.getElementById('menu-user-parent');
        if (userMenu) userMenu.style.display = 'none';

        // ড্যাশবোর্ড মেনু
        const dashMenu = document.getElementById('menu-dash');
        if (dashMenu) dashMenu.style.display = check('fin_dashboard_view') ? '' : 'none';
    }

    function navigateToAllowedUserModule(perms) {
        // যদি ড্যাশবোর্ড পারমিশন থাকে তবে ড্যাশবোর্ডে যাবে
        if (perms['fin_dashboard_view'] && typeof switchMainTab === 'function') {
            switchMainTab('dashboard');
            return;
        }
        // যদি কাস্টমার পারমিশন থাকে তবে কাস্টমার সেকশনে যাবে
        if (Object.keys(perms).some(k => k.startsWith('cust_') && perms[k]) && typeof switchCustomerSubSection === 'function') {
            switchCustomerSubSection('cust-list-section');
            return;
        }
        // ক্যাশ ইনভেন্টরি
        if (perms['fin_cash_inventory'] && typeof switchMainTab === 'function') {
            switchMainTab('cash-inventory');
            return;
        }
        // বাই-ডিফল্ট ড্যাশবোর্ড
        if (typeof switchMainTab === 'function') switchMainTab('dashboard');
    }

    window.exitImpersonation = function () {
        if (!isImpersonating) return;

        isImpersonating = false;
        impersonatedUser = null;

        // ব্যানার রিমুভ ও মার্জিন রিস্টোর
        const stickyBar = document.getElementById('global-impersonation-sticky-bar');
        if (stickyBar) stickyBar.style.display = 'none';
        document.body.style.paddingTop = "0px";

        // সব সাইডবার মেনু পুনরায় আনলক করা (Full Admin View)
        const allMenuIds = ['menu-dash', 'menu-bal-parent', 'menu-inv-parent', 'menu-cust-parent', 'menu-closing-parent', 'menu-settings-parent', 'menu-user-parent'];
        allMenuIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = '';
        });

        // অ্যাডমিন তথ্য রিস্টোর
        if (document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = "Admin";
        if (document.getElementById('dropdownRole')) document.getElementById('dropdownRole').innerText = "Super Admin";

        window.logUserActivity("IMPERSONATION_EXIT", "Admin exited user portal mode and restored full session.");
        if (typeof showToast === 'function') showToast("Returned to full Admin session!", "success");

        switchUserManagementSubSection('um-list-section');
    };

    /* ==========================================================
       ৫. প্রোফাইল শিট ভিউ ইঞ্জিন
       ========================================================== */
    window.openUserProfile = function (userId) {
        viewingUserId = userId;
        renderUserProfileDetails(userId);
        switchUserManagementSubSection('um-profile-section');
    };

    function renderUserProfileDetails(userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;

        document.getElementById('profAvatar').innerText = (u.nameEn || u.name || 'U').charAt(0).toUpperCase();
        document.getElementById('profHeadingName').innerText = `${u.nameEn || u.name} ${u.nameBn ? '(' + u.nameBn + ')' : ''}`;
        document.getElementById('profHeadingSub').innerText = `Employee ID: #${u.empId || 'N/A'} • Role: ${u.role} • Designation: ${u.designation || 'Staff'}`;
        document.getElementById('profStatusBadge').innerHTML = `<span class="${u.status === 'Active' ? 'um-badge-active' : 'um-badge-blocked'}" style="font-size: 0.9rem; padding: 6px 16px;">${u.status}</span>`;

        document.getElementById('profileTopActionBtns').innerHTML = `
            <button onclick="impersonateUser('${u.id}')" class="um-btn-action um-btn-impersonate" style="padding: 9px 18px; font-size: 0.88rem;">
                <i class="fa-solid fa-key"></i> Login as User (ঐ পোর্টালে যান)
            </button>
            <button onclick="editUserById('${u.id}')" class="um-btn-action" style="padding: 9px 18px; font-size: 0.88rem;">
                <i class="fa-solid fa-pen-to-square"></i> পারমিশন সংশোধন
            </button>
            <button onclick="toggleUserStatusById('${u.id}')" class="um-btn-action um-btn-danger" style="padding: 9px 18px; font-size: 0.88rem;">
                <i class="fa-solid fa-ban"></i> ${u.status === 'Active' ? 'অ্যাকাউন্ট ব্লক করুন' : 'অ্যাক্টিভ করুন'}
            </button>
        `;

        document.getElementById('profRowNameEn').innerText = u.nameEn || u.name || '-';
        document.getElementById('profRowNameBn').innerText = u.nameBn || '-';
        document.getElementById('profRowDesignation').innerText = u.designation || '-';
        document.getElementById('profRowRole').innerText = u.role || 'Custom';
        document.getElementById('profRowEmpId').innerText = u.empId || '-';
        document.getElementById('profRowMobile').innerHTML = u.mobile ? `<a href="tel:${u.mobile}" style="color: #4f46e5; text-decoration: none;">${u.mobile}</a>` : '-';
        document.getElementById('profRowEmail').innerHTML = u.email ? `<a href="mailto:${u.email}" style="color: #4f46e5; text-decoration: none;">${u.email}</a>` : '-';
        document.getElementById('profRowPass').innerHTML = `<span style="font-family: monospace; letter-spacing: 1px;">${u.password}</span>`;

        const matrixBody = document.getElementById('profPermissionsMatrixBody');
        matrixBody.innerHTML = '';
        const userPerms = u.permissions || {};

        SYSTEM_MODULES.forEach(mod => {
            let activeBadges = '';
            let enabledCount = 0;

            mod.permissions.forEach(p => {
                if (userPerms[p.key]) {
                    enabledCount++;
                    activeBadges += `<span style="display:inline-block; background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; padding:3px 8px; border-radius:5px; font-size:0.75rem; font-weight:700; margin:2px 4px;">${p.label}</span>`;
                }
            });

            if (!activeBadges) {
                activeBadges = `<span style="color: #94a3b8; font-size: 0.8rem; font-style: italic;">No permissions granted.</span>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: 700; color: ${mod.color};">
                    <i class="fa-solid ${mod.icon} mr-1"></i> ${mod.groupName}
                </td>
                <td style="padding: 10px 15px; border: 1px solid #e2e8f0;">${activeBadges}</td>
                <td style="padding: 10px 15px; border: 1px solid #e2e8f0; text-align: center;">
                    ${enabledCount > 0 ? '<span style="color:#15803d; font-weight:800; font-size:0.8rem;">● ENABLED</span>' : '<span style="color:#94a3b8; font-size:0.8rem;">LOCKED</span>'}
                </td>
            `;
            matrixBody.appendChild(tr);
        });
    }

    /* ==========================================================
       ৬. ইউজার টেবিল ও ফর্ম হ্যান্ডলার
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
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 35px;">কোনো ইউজার কনফিগার করা নেই। নতুন ইউজার যোগ করতে 'নতুন ইউজার যোগ করুন' বাটনে চাপ দিন।</td></tr>`;
            return;
        }

        usersDatabase.forEach(u => {
            const isShown = showPasswordMap[u.id];
            const passDisplay = isShown ? u.password : '••••••••';
            const eyeIcon = isShown ? 'fa-eye-slash' : 'fa-eye';
            const statusClass = u.status === 'Active' ? 'um-badge-active' : 'um-badge-blocked';

            let scopeBadges = '';
            const perms = u.permissions || {};
            const hasEdu = Object.keys(perms).some(k => k.startsWith('edu_') && perms[k]);
            const hasCPSCL = Object.keys(perms).some(k => k.startsWith('cpscl_') && perms[k]);
            const hasCust = Object.keys(perms).some(k => k.startsWith('cust_') && perms[k]);
            const hasFin = Object.keys(perms).some(k => (k.startsWith('fin_') || k.startsWith('closing_')) && perms[k]);

            if (hasEdu) scopeBadges += `<span style="background:#eef2ff; color:#4f46e5; padding:2px 7px; border-radius:5px; font-size:0.72rem; font-weight:700; margin-right:4px;">Education</span>`;
            if (hasCPSCL) scopeBadges += `<span style="background:#ecfdf5; color:#059669; padding:2px 7px; border-radius:5px; font-size:0.72rem; font-weight:700; margin-right:4px;">CPSCL</span>`;
            if (hasCust) scopeBadges += `<span style="background:#eff6ff; color:#2563eb; padding:2px 7px; border-radius:5px; font-size:0.72rem; font-weight:700; margin-right:4px;">Customer</span>`;
            if (hasFin) scopeBadges += `<span style="background:#fffbeb; color:#d97706; padding:2px 7px; border-radius:5px; font-size:0.72rem; font-weight:700; margin-right:4px;">Finance</span>`;
            if (!scopeBadges) scopeBadges = `<span style="font-size:0.75rem; color:#94a3b8;">No Access</span>`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; border-radius: 50%; background: #f1f5f9; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-weight: 800;">
                            ${(u.nameEn || u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong style="color: #1e293b; display: block;">${u.nameEn || u.name}</strong>
                            <small style="color: #64748b;">${u.empId || 'ID: N/A'} &bull; ${u.designation || 'Staff'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <strong style="color: #334155;">${u.role || 'Custom'}</strong><br>
                    <small style="color: #64748b;">${u.mobile || u.email}</small>
                </td>
                <td>
                    <span style="font-family: monospace; font-weight: 700; color: #4338ca;">${passDisplay}</span>
                    <button onclick="togglePasswordView('${u.id}')" style="background: none; border: none; color: #6366f1; cursor: pointer; margin-left: 6px;">
                        <i class="fa-solid ${eyeIcon}"></i>
                    </button>
                </td>
                <td>${scopeBadges}</td>
                <td><span class="${statusClass}">${u.status}</span></td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                        <button onclick="openUserProfile('${u.id}')" class="um-btn-action um-btn-view" title="বিস্তারিত প্রোফাইল দেখুন">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        <button onclick="impersonateUser('${u.id}')" class="um-btn-action um-btn-impersonate" title="এই ইউজারের পোর্টালে ঢুকুন">
                            <i class="fa-solid fa-key"></i> Login As
                        </button>
                        <button onclick="editUserById('${u.id}')" class="um-btn-action" title="সংশোধন">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deleteUser('${u.id}')" class="um-btn-action um-btn-danger" title="মুছে ফেলুন">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
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
        document.getElementById('um-form-page-title').innerText = "নতুন ইউজার যোগ ও পারমিশন সেটআপ";
        document.getElementById('um-inp-name').value = '';
        document.getElementById('um-inp-name-en').value = '';
        document.getElementById('um-inp-name-bn').value = '';
        document.getElementById('um-inp-emp-id').value = 'MC-' + (100 + usersDatabase.length + 1);
        document.getElementById('um-inp-designation').value = '';
        document.getElementById('um-inp-mobile').value = '';
        document.getElementById('um-inp-email').value = '';
        document.getElementById('um-inp-pass').value = '';
        document.getElementById('um-inp-role').value = 'Custom';
        window.toggleAllGlobalPerms(false);
        switchUserManagementSubSection('um-form-section');
    };

    window.editUserById = function (userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;

        editingUserId = u.id;
        document.getElementById('um-form-page-title').innerText = `সংশোধন: ${u.nameEn || u.name}`;
        document.getElementById('um-inp-name').value = u.name || '';
        document.getElementById('um-inp-name-en').value = u.nameEn || u.name || '';
        document.getElementById('um-inp-name-bn').value = u.nameBn || '';
        document.getElementById('um-inp-emp-id').value = u.empId || '';
        document.getElementById('um-inp-designation').value = u.designation || '';
        document.getElementById('um-inp-mobile').value = u.mobile || '';
        document.getElementById('um-inp-email').value = u.email || '';
        document.getElementById('um-inp-pass').value = u.password || '';
        document.getElementById('um-inp-role').value = u.role || 'Custom';

        const p = u.permissions || {};
        document.querySelectorAll('.perm-checkbox').forEach(cb => {
            cb.checked = !!p[cb.dataset.key];
        });

        switchUserManagementSubSection('um-form-section');
    };

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

    window.handleUserFormSubmit = async function (event) {
        event.preventDefault();

        const permissionsObj = {};
        document.querySelectorAll('.perm-checkbox').forEach(cb => {
            if (cb.checked) permissionsObj[cb.dataset.key] = true;
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
            status: editingUserId ? (usersDatabase.find(u => u.id === editingUserId)?.status || 'Active') : 'Active',
            createdAt: new Date().toLocaleString('en-US')
        };

        if (editingUserId) {
            const idx = usersDatabase.findIndex(u => u.id === editingUserId);
            if (idx !== -1) usersDatabase[idx] = { ...usersDatabase[idx], ...userData };
            window.logUserActivity("USER_EDIT", `Updated profile/permissions for ${userData.name}`);
        } else {
            usersDatabase.push(userData);
            window.logUserActivity("USER_CREATE", `Created new user ${userData.name} (${userData.role})`);
        }

        await syncUsersToFirebase(usersDatabase);
        renderUsersTable();
        renderSummaryStats();

        switchUserManagementSubSection('um-list-section');
        if (typeof showToast === 'function') showToast("ইউজার সফলভাবে সংরক্ষিত হয়েছে!", "success");
    };

    window.toggleUserStatusById = async function (userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;
        u.status = u.status === 'Active' ? 'Blocked' : 'Active';
        await syncUsersToFirebase(usersDatabase);
        renderUsersTable();
        renderSummaryStats();
        if (viewingUserId === userId) renderUserProfileDetails(userId);
        window.logUserActivity("USER_STATUS_CHANGE", `User ${u.name} status changed to ${u.status}`);
    };

    window.deleteUser = async function (userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;

        if (confirm(`আপনি কি নিশ্চিতভাবে '${u.nameEn || u.name}' এর অ্যাকাউন্ট মুছে ফেলতে চান?`)) {
            usersDatabase = usersDatabase.filter(item => item.id !== userId);
            await syncUsersToFirebase(usersDatabase);
            renderUsersTable();
            renderSummaryStats();
            window.logUserActivity("USER_DELETE", `Permanently deleted user: ${u.name}`);
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
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 25px;">No activity logged yet.</td></tr>`;
            return;
        }

        auditLogsDatabase.slice(0, 100).forEach(log => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="color: #64748b; font-size: 0.84rem; padding: 12px;"><i class="fa-regular fa-clock mr-1"></i> ${log.timestamp}</td>
                <td style="padding: 12px;"><strong style="color: #1e293b;">${log.user}</strong></td>
                <td style="padding: 12px;"><span style="background: #eef2ff; color: #4338ca; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 0.78rem;">${log.action}</span></td>
                <td style="color: #334155; padding: 12px; font-size: 0.88rem;">${log.details}</td>
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
