/**
 * User Management & Comprehensive Dynamic RBAC Module
 * Full Enterprise Standard: Sub-Section Architecture & User Impersonation
 * Mousumi Computer ERP Core Engine
 */

(function () {
    let usersDatabase = JSON.parse(localStorage.getItem('cpscl_system_users') || '[]');
    let auditLogsDatabase = JSON.parse(localStorage.getItem('cpscl_audit_logs') || '[]');
    let editingUserId = null;
    let viewingUserId = null;
    let showPasswordMap = {};

    // ইমপারসনেশন ট্র্যাকার (Login As User)
    let originalAdminSession = null;
    let isImpersonating = false;

    let dbInstance = null;
    let dbRefFunc = null;
    let dbSetFunc = null;

    // ERP-এর সকল মডিউল ও সাব-মডিউল তালিকা (Granular Permissions)
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
            user: userName || (isImpersonating ? originalAdminSession?.name + " (as User)" : 'Admin'),
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
       ২. মডিউল UI তৈরি (Sub-Sections Architecture)
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

        // মূল ভিউ প্যানেল তৈরি
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
                    <label style="font-size: 0.84rem; font-weight: 600; color: #334155; display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 10px; border-radius: 8px; background: #fff; border: 1px solid #f1f5f9; transition: 0.2s;">
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
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px;">
                        ${permItems}
                    </div>
                </div>
            `;
        });

        viewPanel.innerHTML = `
            <style>
                .um-sub-section { display: none; animation: umFadeIn 0.25s ease-out; }
                @keyframes umFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

                /* ইমপারসনেশন ফ্লোটিং ব্যানার */
                #um-impersonation-bar {
                    display: none;
                    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                    color: #fff;
                    padding: 12px 20px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    align-items: center;
                    justify-content: space-between;
                    box-shadow: 0 4px 15px rgba(217, 119, 6, 0.3);
                }

                /* কার্ড ও টেবিল ডিজাইন */
                .um-card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 22px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); margin-bottom: 20px; }
                .um-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; font-family: 'Plus Jakarta Sans', 'Tiro Bangla', serif; }
                .um-table th { padding: 0 18px; color: #94a3b8; font-size: 0.88rem; font-weight: 700; text-align: left; text-transform: uppercase; }
                .um-table td { background: #ffffff; padding: 16px 18px; font-size: 0.95rem; color: #1e293b; border: none; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .um-table tr td:first-child { border-radius: 14px 0 0 14px; }
                .um-table tr td:last-child { border-radius: 0 14px 14px 0; text-align: right; }

                /* ৪-কলাম ডাটা টেবিল (প্রোফাইলের জন্য) */
                .um-profile-data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                .um-profile-data-table th, .um-profile-data-table td { padding: 12px 18px; border: 1px solid #e2e8f0; font-size: 0.92rem; }
                .um-profile-data-table th { width: 20%; background-color: #f8fafc; color: #64748b; font-weight: 600; }
                .um-profile-data-table td { width: 30%; font-weight: 700; color: #1e293b; }

                /* সামারি কার্ড */
                .um-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
                .um-stat-card { background: #fff; border-radius: 14px; padding: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
                .um-stat-icon { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }

                /* অ্যাকশন বাটন */
                .um-btn-action { padding: 7px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 0.82rem; transition: 0.2s; }
                .um-btn-action:hover { background: #e2e8f0; }
                .um-btn-view { color: #4f46e5; border-color: #c7d2fe; background: #eef2ff; }
                .um-btn-view:hover { background: #4f46e5; color: #fff; }
                .um-btn-impersonate { color: #d97706; border-color: #fde68a; background: #fffbeb; }
                .um-btn-impersonate:hover { background: #d97706; color: #fff; }
                .um-btn-danger { color: #ef4444; border-color: #fecaca; background: #fef2f2; }
                .um-btn-danger:hover { background: #ef4444; color: #fff; }

                /* ব্যাজ */
                .um-badge-active { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.78rem; }
                .um-badge-blocked { background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.78rem; }
                .um-control { width: 100%; height: 45px; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 14px; font-size: 0.95rem; outline: none; }
                .um-control:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
            </style>

            <!-- ইমপারসনেশন সক্রিয় থাকলে এই ব্যানারটি দেখাবে -->
            <div id="um-impersonation-bar">
                <div style="display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 0.95rem;">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <span>Currently Browsing System as: <strong id="impersonatingUserName">Staff</strong> (<span id="impersonatingUserRole">Role</span>)</span>
                </div>
                <button onclick="exitImpersonation()" style="background: #fff; color: #d97706; border: none; padding: 7px 16px; border-radius: 8px; font-weight: 800; cursor: pointer;">
                    <i class="fa-solid fa-arrow-right-from-bracket mr-1"></i> Exit to Admin Account
                </button>
            </div>

            <!-- ============================================================== -->
            <!-- SUB-SECTION 1: ইউজার তালিকা ও ডিরেক্টরি (MAIN LIST)              -->
            <!-- ============================================================== -->
            <div id="um-list-section" class="um-sub-section" style="display: block;">
                
                <!-- ৪টি পরিসংখ্যান কার্ড -->
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
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0; font-weight: 700;">সক্রিয় ইউজার</p>
                            <h3 id="statActiveUsers" style="font-size: 1.4rem; color: #16a34a; margin: 0; font-weight: 800;">০</h3>
                        </div>
                    </div>
                    <div class="um-stat-card">
                        <div class="um-stat-icon" style="background: #fef2f2; color: #dc2626;"><i class="fa-solid fa-user-lock"></i></div>
                        <div>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0; font-weight: 700;">ব্লকড একাউন্ট</p>
                            <h3 id="statBlockedUsers" style="font-size: 1.4rem; color: #dc2626; margin: 0; font-weight: 800;">০</h3>
                        </div>
                    </div>
                    <div class="um-stat-card">
                        <div class="um-stat-icon" style="background: #fffbeb; color: #d97706;"><i class="fa-solid fa-shield-halved"></i></div>
                        <div>
                            <p style="font-size: 0.85rem; color: #64748b; margin: 0; font-weight: 700;">মডিউল পারমিশন</p>
                            <h3 style="font-size: 1.4rem; color: #d97706; margin: 0; font-weight: 800;">৬ টি বিভাগ</h3>
                        </div>
                    </div>
                </div>

                <!-- সার্চ ও অ্যাকশন বার -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                    <div style="display: flex; gap: 10px; flex: 1; max-width: 500px;">
                        <input type="text" id="umSearchInput" class="um-control" placeholder="নাম, ইউজারনেম বা আইডি দিয়ে খুঁজুন..." oninput="filterUMUsers()">
                        <select id="umRoleFilter" class="um-control" style="width: 180px;" onchange="filterUMUsers()">
                            <option value="">সকল রোল (All)</option>
                            <option value="Super Admin">Super Admin</option>
                            <option value="Education Staff">Education Staff</option>
                            <option value="CPSCL Operator">CPSCL Operator</option>
                            <option value="Accountant">Accountant</option>
                            <option value="Custom">Custom</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button class="um-btn-action" onclick="switchUMSubSection('um-audit-section')">
                            <i class="fa-solid fa-clock-rotate-left"></i> অডিট হিস্ট্রি
                        </button>
                        <button class="um-btn-action" style="background: #4f46e5; color: #fff; border: none; padding: 10px 20px;" onclick="openCreateUserForm()">
                            <i class="fa-solid fa-user-plus"></i> নতুন ইউজার তৈরি
                        </button>
                    </div>
                </div>

                <!-- মূল ইউজার তালিকা টেবিল -->
                <div style="overflow-x: auto;">
                    <table class="um-table">
                        <thead>
                            <tr>
                                <th>ইউজার ও পদবী</th>
                                <th>রোল ও যোগাযোগ</th>
                                <th>পাসওয়ার্ড</th>
                                <th>এক্সেস স্কোপ</th>
                                <th>স্ট্যাটাস</th>
                                <th style="text-align: right;">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody id="um-users-tbody"></tbody>
                    </table>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- SUB-SECTION 2: বিস্তারিত ইউজার প্রোফাইল শিট (PROFILE VIEW)         -->
            <!-- ============================================================== -->
            <div id="um-profile-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                    <button class="um-btn-action" onclick="switchUMSubSection('um-list-section')" style="font-size: 0.9rem;">
                        <i class="fa-solid fa-arrow-left"></i> ইউজার তালিকায় ফিরে যান
                    </button>
                    <div style="display: flex; gap: 10px;" id="profileTopActionBtns">
                        <!-- জাভাস্ক্রিপ্ট দিয়ে বাটন রেন্ডার হবে -->
                    </div>
                </div>

                <div class="um-card">
                    <!-- হেডার মেটা -->
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

                    <!-- টেবিল ১: ব্যক্তিগত ও প্রাতিষ্ঠানিক তথ্য -->
                    <h3 style="font-size: 1rem; color: #1e293b; margin-bottom: 12px; font-weight: 700;"><i class="fa-solid fa-id-card-clip text-primary mr-1"></i> ব্যক্তিগত ও প্রাতিষ্ঠানিক তথ্য</h3>
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

                    <!-- টেবিল ২: পারমিশন ব্রেকডাউন অডিট টেবিল -->
                    <h3 style="font-size: 1rem; color: #1e293b; margin: 25px 0 12px 0; font-weight: 700;"><i class="fa-solid fa-shield-halved text-success mr-1"></i> মডিউল পারমিশন অডিট ম্যাট্রিক্স</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 0.85rem; text-align: left;">বিভাগ (Department / Group)</th>
                                    <th style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 0.85rem; text-align: left;">অনুমোদিত ফিচারসমূহ (Allowed Privileges)</th>
                                    <th style="padding: 10px 15px; border: 1px solid #e2e8f0; font-size: 0.85rem; text-align: center; width: 120px;">স্ট্যাটাস</th>
                                </tr>
                            </thead>
                            <tbody id="profPermissionsMatrixBody"></tbody>
                        </table>
                    </div>

                    <!-- টেবিল ৩: এই ইউজারের সাম্প্রতিক কর্মকাণ্ড -->
                    <h3 style="font-size: 1rem; color: #1e293b; margin: 25px 0 12px 0; font-weight: 700;"><i class="fa-solid fa-user-clock text-warning mr-1"></i> এই ইউজারের সাম্প্রতিক অ্যাক্টিভিটি হিস্ট্রি</h3>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
                            <thead>
                                <tr style="background: #f8fafc;">
                                    <th style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 0.8rem; text-align: left;">সময়</th>
                                    <th style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 0.8rem; text-align: left;">অ্যাকশন</th>
                                    <th style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 0.8rem; text-align: left;">বিবরণ</th>
                                </tr>
                            </thead>
                            <tbody id="profUserAuditBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- SUB-SECTION 3: ইউজার তৈরি ও পারমিশন এডিটর (CREATE / EDIT FORM)    -->
            <!-- ============================================================== -->
            <div id="um-form-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h2 style="font-size: 1.4rem; color: #1e293b; font-weight: 800;" id="um-form-page-title">Create New User</h2>
                        <p style="font-size: 0.88rem; color: #64748b; margin-top: 3px;">User Management <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; margin: 0 5px;"></i> Access Scope</p>
                    </div>
                    <button class="um-btn-action" onclick="switchUMSubSection('um-list-section')">
                        <i class="fa-solid fa-arrow-left"></i> বাতিল করুন
                    </button>
                </div>

                <div class="um-card" style="max-width: 950px; margin: 0 auto;">
                    <form onsubmit="handleUserFormSubmit(event)" style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Login Username *</label>
                                <input type="text" id="um-inp-name" class="um-control" placeholder="e.g. staff" required>
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Email Address *</label>
                                <input type="email" id="um-inp-email" class="um-control" placeholder="staff@gmail.com" required>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Full Name (English) *</label>
                                <input type="text" id="um-inp-name-en" class="um-control" placeholder="e.g. Md. Ashiqur Rahman" required>
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
                                <input type="text" id="um-inp-designation" class="um-control" placeholder="Counter Operator" required>
                            </div>
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Mobile Number</label>
                                <input type="text" id="um-inp-mobile" class="um-control" placeholder="01700-000000">
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">Password *</label>
                                <input type="text" id="um-inp-pass" class="um-control" placeholder="Set password" required>
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

                        <!-- মডিউলার পারমিশন গ্রিড -->
                        <div style="margin-top: 15px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                                <div>
                                    <h4 style="font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0;">মডিউলার মেনু ও ফিচার পারমিশন নির্বাচন</h4>
                                    <p style="font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0;">যেসব ফিচারে টিক থাকবে, ইউজার শুধুমাত্র সেগুলোতে এক্সেস পাবে।</p>
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
                            <button type="button" onclick="switchUMSubSection('um-list-section')" style="padding: 12px 25px; background: #94a3b8; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer;">বাতিল</button>
                            <button type="submit" style="padding: 12px 35px; background: #4f46e5; color: #fff; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 1rem;">
                                <i class="fa-solid fa-floppy-disk mr-1"></i> সংরক্ষণ করুন
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ============================================================== -->
            <!-- SUB-SECTION 4: গ্লোবাল অডিট লগ (AUDIT LOGS)                    -->
            <!-- ============================================================== -->
            <div id="um-audit-section" class="um-sub-section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <button class="um-btn-action" onclick="switchUMSubSection('um-list-section')">
                        <i class="fa-solid fa-arrow-left"></i> ইউজার তালিকায় ফিরুন
                    </button>
                    <button onclick="clearAuditLogs()" class="um-btn-action um-btn-danger">
                        <i class="fa-solid fa-trash-can mr-1"></i> অডিট হিস্ট্রি মুছুন
                    </button>
                </div>

                <div class="um-card">
                    <h3 style="font-size: 1.1rem; color: #1e293b; margin-bottom: 15px; font-weight: 800;"><i class="fa-solid fa-clock-rotate-left mr-1 text-primary"></i> সিস্টেম লাইভ অ্যাক্টিভিটি লগ (Last 100)</h3>
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
       ৩. সাব-সেকশন সুইচিং ও ন্যাভিগেশন কন্ট্রোল
       ========================================================== */
    window.switchUMSubSection = function (sectionId) {
        document.querySelectorAll('.um-sub-section').forEach(sec => sec.style.display = 'none');
        const target = document.getElementById(sectionId);
        if (target) target.style.display = 'block';

        const topTitle = document.getElementById('top-title');
        if (topTitle) {
            if (sectionId === 'um-list-section') topTitle.innerText = "USER & ACCESS MANAGEMENT";
            if (sectionId === 'um-profile-section') topTitle.innerText = "USER PROFILE INSPECTION";
            if (sectionId === 'um-form-section') topTitle.innerText = editingUserId ? "EDIT USER PERMISSIONS" : "CREATE NEW USER";
            if (sectionId === 'um-audit-section') topTitle.innerText = "SYSTEM AUDIT TRAIL";
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

        switchUMSubSection('um-list-section');
    };

    /* ==========================================================
       ৪. ইউজার তালিকা ও পরিসংখ্যান রেন্ডারার
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
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 35px;">No users configured yet. Click '+ Create New User' to add one.</td></tr>`;
            return;
        }

        usersDatabase.forEach((u, index) => {
            const isShown = showPasswordMap[u.id];
            const passDisplay = isShown ? u.password : '••••••••';
            const eyeIcon = isShown ? 'fa-eye-slash' : 'fa-eye';
            const statusClass = u.status === 'Active' ? 'um-badge-active' : 'um-badge-blocked';

            // মডিউল স্কোপ ব্যাজ
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
                        <button onclick="openUserProfile('${u.id}')" class="um-btn-action um-btn-view" title="View Detailed Profile">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        <button onclick="impersonateUser('${u.id}')" class="um-btn-action um-btn-impersonate" title="Login As This User">
                            <i class="fa-solid fa-key"></i> Login As
                        </button>
                        <button onclick="editUserById('${u.id}')" class="um-btn-action" title="Edit Permissions">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deleteUser('${u.id}')" class="um-btn-action um-btn-danger" title="Delete User">
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

    /* ==========================================================
       ৫. প্রোফাইল শিট ভিউ ইঞ্জিন (SUB-SECTION 2)
       ========================================================== */
    window.openUserProfile = function (userId) {
        viewingUserId = userId;
        renderUserProfileDetails(userId);
        switchUMSubSection('um-profile-section');
    };

    function renderUserProfileDetails(userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;

        // হেডার
        document.getElementById('profAvatar').innerText = (u.nameEn || u.name || 'U').charAt(0).toUpperCase();
        document.getElementById('profHeadingName').innerText = `${u.nameEn || u.name} ${u.nameBn ? '(' + u.nameBn + ')' : ''}`;
        document.getElementById('profHeadingSub').innerText = `Employee ID: #${u.empId || 'N/A'} • Role: ${u.role} • Designation: ${u.designation || 'Staff'}`;
        document.getElementById('profStatusBadge').innerHTML = `<span class="${u.status === 'Active' ? 'um-badge-active' : 'um-badge-blocked'}" style="font-size: 0.9rem; padding: 6px 16px;">${u.status}</span>`;

        // টপ বাটনসমূহ
        document.getElementById('profileTopActionBtns').innerHTML = `
            <button onclick="impersonateUser('${u.id}')" class="um-btn-action um-btn-impersonate" style="padding: 8px 16px;">
                <i class="fa-solid fa-key"></i> Login as User
            </button>
            <button onclick="editUserById('${u.id}')" class="um-btn-action" style="padding: 8px 16px;">
                <i class="fa-solid fa-pen-to-square"></i> Edit Permissions
            </button>
            <button onclick="toggleUserStatusById('${u.id}')" class="um-btn-action um-btn-danger" style="padding: 8px 16px;">
                <i class="fa-solid fa-ban"></i> ${u.status === 'Active' ? 'Block Account' : 'Activate Account'}
            </button>
        `;

        // টেবিল ১ ডাটা
        document.getElementById('profRowNameEn').innerText = u.nameEn || u.name || '-';
        document.getElementById('profRowNameBn').innerText = u.nameBn || '-';
        document.getElementById('profRowDesignation').innerText = u.designation || '-';
        document.getElementById('profRowRole').innerText = u.role || 'Custom';
        document.getElementById('profRowEmpId').innerText = u.empId || '-';
        document.getElementById('profRowMobile').innerHTML = u.mobile ? `<a href="tel:${u.mobile}" style="color: #4f46e5; text-decoration: none;">${u.mobile}</a>` : '-';
        document.getElementById('profRowEmail').innerHTML = u.email ? `<a href="mailto:${u.email}" style="color: #4f46e5; text-decoration: none;">${u.email}</a>` : '-';
        document.getElementById('profRowPass').innerHTML = `<span style="font-family: monospace; letter-spacing: 1px;">${u.password}</span>`;

        // টেবিল ২ পারমিশন ম্যাট্রিক্স
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
                activeBadges = `<span style="color: #94a3b8; font-size: 0.8rem; font-style: italic;">No permissions granted in this module.</span>`;
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding: 10px 15px; border: 1px solid #e2e8f0; font-weight: 700; color: ${mod.color};">
                    <i class="fa-solid ${mod.icon} mr-1"></i> ${mod.groupName}
                </td>
                <td style="padding: 10px 15px; border: 1px solid #e2e8f0;">${activeBadges}</td>
                <td style="padding: 10px 15px; border: 1px solid #e2e8f0; text-align: center;">
                    ${enabledCount > 0 ? '<span style="color:#15803d; font-weight:800; font-size:0.8rem;">● ENABLED</span>' : '<span style="color:#94a3b8; font-size:0.8rem;">OFF</span>'}
                </td>
            `;
            matrixBody.appendChild(tr);
        });

        // টেবিল ৩ এই ইউজারের ব্যক্তিগত হিস্ট্রি
        const auditBody = document.getElementById('profUserAuditBody');
        auditBody.innerHTML = '';
        const userLogs = auditLogsDatabase.filter(l => l.user === u.name || l.details.includes(u.name)).slice(0, 10);

        if (userLogs.length === 0) {
            auditBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 15px;">No specific logs recorded for this user.</td></tr>`;
        } else {
            userLogs.forEach(log => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 0.8rem; color: #64748b;">${log.timestamp}</td>
                    <td style="padding: 8px 12px; border: 1px solid #e2e8f0;"><span style="background: #eef2ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 0.75rem;">${log.action}</span></td>
                    <td style="padding: 8px 12px; border: 1px solid #e2e8f0; font-size: 0.82rem; color: #334155;">${log.details}</td>
                `;
                auditBody.appendChild(tr);
            });
        }
    }

    /* ==========================================================
       ৬. ইউজার ইমপারসনেশন (LOGIN AS USER ENGINE)
       ========================================================== */
    window.impersonateUser = function (userId) {
        const target = usersDatabase.find(u => u.id === userId);
        if (!target) return;

        if (target.status !== 'Active') {
            alert("This account is blocked! Cannot login to a suspended account.");
            return;
        }

        if (confirm(`Are you sure you want to login to '${target.nameEn || target.name}' portal without a password?`)) {
            isImpersonating = true;
            originalAdminSession = {
                name: document.getElementById('dropdownName')?.innerText || 'Admin',
                role: document.getElementById('dropdownRole')?.innerText || 'Super Admin'
            };

            // ওপরের ব্যানার চালু করা
            document.getElementById('impersonatingUserName').innerText = target.nameEn || target.name;
            document.getElementById('impersonatingUserRole').innerText = target.role;
            document.getElementById('um-impersonation-bar').style.display = 'flex';

            // ন্যাভবার তথ্য পরিবর্তন
            if (document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = target.nameEn || target.name;
            if (document.getElementById('dropdownRole')) document.getElementById('dropdownRole').innerText = target.role;

            window.logUserActivity("IMPERSONATION_START", `Admin switched session and logged in as '${target.name}'`);

            if (typeof showToast === 'function') {
                showToast(`Switched portal to ${target.nameEn || target.name}!`, "warning");
            }

            // ড্যাশবোর্ডে নিয়ে যাওয়া
            if (typeof switchMainTab === 'function') {
                switchMainTab('dashboard');
            }
        }
    };

    window.exitImpersonation = function () {
        if (!isImpersonating) return;

        isImpersonating = false;
        document.getElementById('um-impersonation-bar').style.display = 'none';

        // অ্যাডমিন তথ্য রিস্টোর
        if (originalAdminSession) {
            if (document.getElementById('dropdownName')) document.getElementById('dropdownName').innerText = originalAdminSession.name;
            if (document.getElementById('dropdownRole')) document.getElementById('dropdownRole').innerText = originalAdminSession.role;
        }

        window.logUserActivity("IMPERSONATION_EXIT", "Admin exited user impersonation mode.");
        if (typeof showToast === 'function') showToast("Returned to full Admin session!", "success");

        switchUserManagementView();
    };

    /* ==========================================================
       ৭. ফর্ম হ্যান্ডলার ও পারমিশন কন্ট্রোল
       ========================================================== */
    window.openCreateUserForm = function () {
        editingUserId = null;
        document.getElementById('um-form-page-title').innerText = "Create New User & Assign Permissions";
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
        switchUMSubSection('um-form-section');
    };

    window.editUserById = function (userId) {
        const u = usersDatabase.find(item => item.id === userId);
        if (!u) return;

        editingUserId = u.id;
        document.getElementById('um-form-page-title').innerText = `Edit: ${u.nameEn || u.name}`;
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

        switchUMSubSection('um-form-section');
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

        switchUMSubSection('um-list-section');
        if (typeof showToast === 'function') showToast("ইউজার সফলভাবে সংরক্ষণ করা হয়েছে!", "success");
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

        if (confirm(`Are you sure you want to permanently delete '${u.nameEn || u.name}'?`)) {
            usersDatabase = usersDatabase.filter(item => item.id !== userId);
            await syncUsersToFirebase(usersDatabase);
            renderUsersTable();
            renderSummaryStats();
            window.logUserActivity("USER_DELETE", `Permanently deleted user: ${u.name}`);
            switchUMSubSection('um-list-section');
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
