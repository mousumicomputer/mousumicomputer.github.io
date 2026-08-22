/**
 * User Management & Hardened Security Module - Mousumi Computer ERP
 * Bulletproof Strict CSS Lock & Realtime Firebase Sync
 */

(function () {
    const SUPER_ADMIN_EMAIL = "mousumicomputer.org@gmail.com";
    const MOUSUMI_LOGO = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEifAQVAOjeF0ccNQdBRY2gpfOlc19vjYbQiNjCUUJ9jJqxHEjVJB7nhST4fbzYcdaaV3DtoBrxxrhi4nQJsuwHoWnEmQKud8muKsZIRcWV6YgFLEmdsDc8TRv8Vcmw5jktkvXt4cnlRnbxOW8MlFzlJ4P7QSA7E1Owl9bxDsaW7wjMJQ91bdczQa5zjxu94/s1600/Screenshot_1.jpg";
    const CPSCL_LOGO = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-795xmOcuKYH8wjija8JrA-qVjfOp_4KieeZ1pOQJaqX2uXsqGLMo09AXsGGsfGjH9LpK5fPlUNGbebFguiAzPC_YvbRXcHePj7cORQd6GMxDUg-LCeXtmNkccGI2K4Hv73PJqJkGX0Ju9N4knQuqKOAImqB6qy_WWFXpKeIaQhRgk7YbLqBLpCmL0cio/s1600/%E0%A6%95%E0%A7%8D%E0%A6%AF%E0%A6%AA%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%9F%E0%A6%A8%E0%A6%AE%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F_%E0%A6%AA%E0%A6%BE%E0%A6%AC%E0%A6%B2%E0%A6%BF%E0%A6%9F%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A7%81%E0%A6%B2_%E0%A6%93_%E0%A6%95%E0%A6%B2%E0%A7%87%E0%A6%9C_%E0%A6%B2%E0%A6%BE%E0%A6%B2%E0%A6%AE%E0%A6%A8%E0%A6%BF%E0%A6%B0%E0%A6%B9%E0%A6%BE%E0%A6%9F%E0%A7%87%E0%A6%B0_%E0%A6%B2%E0%A7%8B%E0%A6%97%E0%A7%8B.png";

    let systemUsers = [];
    let activityLogs = [];
    let currentAuthUser = null;
    let currentUserProfile = null;
    let dbInstance = null;
    let dbRefFunc = null;
    let dbSetFunc = null;

    // গ্লোবাল বুলেটপ্রুফ সিএসএস লক ইনজেকশন
    function injectStrictCSSLock() {
        if (document.getElementById('strict-security-lock-css')) return;
        const style = document.createElement('style');
        style.id = 'strict-security-lock-css';
        style.innerHTML = `
            /* CPSCL অপারেটরের জন্য অন্য সব মেনু সম্পূর্ণভাবে বলপ্রয়োগে বন্ধ (Force Kill) */
            body.role-cpscl-only .sidebar .menu-list > li:not(#menu-cpscl-parent) {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                overflow: hidden !important;
                pointer-events: none !important;
            }
            body.role-cpscl-only #menu-settings-parent,
            body.role-cpscl-only #menu-user-mgmt,
            body.role-cpscl-only #dashboard-view,
            body.role-cpscl-only .fintech-hero-card {
                display: none !important;
            }
            body.role-super-admin .sidebar .menu-list > li {
                display: block !important;
            }
        `;
        document.head.appendChild(style);
    }

    async function initFirebase() {
        injectStrictCSSLock();
        try {
            const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getDatabase, ref, set, onValue } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
            const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");

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

            const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig, "USER_MGMT_APP");
            dbInstance = getDatabase(app);
            dbRefFunc = ref;
            dbSetFunc = set;

            const auth = getAuth(app);

            const usersRef = ref(dbInstance, 'erp/system_users');
            onValue(usersRef, (snapshot) => {
                const data = snapshot.val();
                systemUsers = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
                renderUsersTable();
                if (currentAuthUser) enforceSecurity(currentAuthUser);
            });

            const logsRef = ref(dbInstance, 'erp/activity_logs');
            onValue(logsRef, (snapshot) => {
                const data = snapshot.val();
                activityLogs = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
                renderActivityLogsTable();
            });

            onAuthStateChanged(auth, async (user) => {
                currentAuthUser = user;
                if (user) {
                    await enforceSecurity(user);
                } else {
                    document.body.classList.remove('role-cpscl-only');
                    document.body.classList.remove('role-super-admin');
                    currentUserProfile = null;
                    restoreAdminBranding();
                }
            });

        } catch (err) {
            console.error("User Mgmt Init Error:", err);
        }
    }

    async function saveUsersToCloud(users) {
        if (dbInstance && dbSetFunc && dbRefFunc) {
            try {
                await dbSetFunc(dbRefFunc(dbInstance, 'erp/system_users'), users);
            } catch (e) {}
        }
    }

    window.logUserActivity = async function (actionType, details) {
        const now = new Date();
        const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString();
        const userName = currentUserProfile ? currentUserProfile.name : (currentAuthUser ? currentAuthUser.email : 'System');
        const userEmail = currentAuthUser ? currentAuthUser.email : 'N/A';
        const userRole = currentUserProfile ? currentUserProfile.role : (userEmail === SUPER_ADMIN_EMAIL ? 'Super Admin' : 'User');

        const logEntry = {
            id: 'log_' + Date.now(),
            timestamp: timestamp,
            userName: userName,
            userEmail: userEmail,
            role: userRole,
            action: actionType,
            details: details
        };

        activityLogs.unshift(logEntry);
        if (activityLogs.length > 500) activityLogs = activityLogs.slice(0, 500);

        if (dbInstance && dbSetFunc && dbRefFunc) {
            try {
                await dbSetFunc(dbRefFunc(dbInstance, 'erp/activity_logs'), activityLogs);
            } catch (e) {}
        }
    };

    async function enforceSecurity(user) {
        const email = (user.email || '').toLowerCase().trim();

        // ১. সুপার এডমিন
        if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
            document.body.classList.remove('role-cpscl-only');
            document.body.classList.add('role-super-admin');
            currentUserProfile = { name: "Rabbi Hosen", role: "Admin", status: "Active" };
            restoreAdminBranding();
            unlockAllMenusForAdmin();
            return;
        }

        // ২. সাব-ইউজার
        const profile = systemUsers.find(u => (u.email || '').toLowerCase().trim() === email);
        if (profile) {
            currentUserProfile = profile;

            if (profile.status === 'Blocked' || profile.status === 'Inactive') {
                alert("আপনার একাউন্টটি বন্ধ আছে! যোগাযোগ করুন।");
                const { getAuth, signOut } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
                await signOut(getAuth());
                window.location.reload();
                return;
            }

            const dName = document.getElementById('dropdownName');
            const dRole = document.getElementById('dropdownRole');
            if (dName) dName.innerText = profile.name || 'User';
            if (dRole) dRole.innerText = profile.role || 'Operator';

            const allowed = profile.permissions || {};

            // যদি শুধু CPSCL অপারেটর হয় -> সম্পূর্ণ সিকিউরিটি লক কার্যকর হবে
            if (allowed.cpscl && !allowed.dashboard && !allowed.balance && !allowed.customers && !allowed.closing) {
                document.body.classList.add('role-cpscl-only');
                document.body.classList.remove('role-super-admin');
                applyCPSCLBranding();

                // সরাসরি CPSCL ড্যাশবোর্ডে নিয়ে যাওয়া
                if (typeof window.switchCPSCLSubSection === 'function') {
                    window.switchCPSCLSubSection('dash');
                }
            } else {
                document.body.classList.remove('role-cpscl-only');
            }

            if (allowed.cpscl && !allowed.canDeleteCPSCL) {
                const clearBtn = document.querySelector('button[onclick="clearAllStudents()"]');
                if (clearBtn) clearBtn.style.setProperty('display', 'none', 'important');
            }
        }
    }

    function restoreAdminBranding() {
        const brandLogoImg = document.querySelector('.brand-logo img');
        const brandTextH3 = document.querySelector('.brand-text h3');
        const brandTextSpan = document.querySelector('.brand-text span');

        if (brandLogoImg) brandLogoImg.src = MOUSUMI_LOGO;
        if (brandTextH3) brandTextH3.innerText = "Mousumi";
        if (brandTextSpan) brandTextSpan.innerText = "Accounting ERP";
    }

    function applyCPSCLBranding() {
        const brandLogoImg = document.querySelector('.brand-logo img');
        const brandTextH3 = document.querySelector('.brand-text h3');
        const brandTextSpan = document.querySelector('.brand-text span');

        if (brandLogoImg) brandLogoImg.src = CPSCL_LOGO;
        if (brandTextH3) brandTextH3.innerText = "CPSCL";
        if (brandTextSpan) brandTextSpan.innerText = "LALMONIRHAT";
    }

    function unlockAllMenusForAdmin() {
        document.querySelectorAll('.sidebar .menu-list > li').forEach(el => {
            el.style.removeProperty('display');
        });
        const userMenu = document.getElementById('menu-user-mgmt');
        if (userMenu) userMenu.style.setProperty('display', 'block', 'important');
    }

    function initUserManagementUI() {
        const menuList = document.querySelector('.sidebar .menu-list');
        const mainWrapper = document.querySelector('.main-wrapper');

        if (!menuList || !mainWrapper) {
            setTimeout(initUserManagementUI, 100);
            return;
        }

        if (document.getElementById('menu-user-mgmt')) return;

        const userMenuItem = document.createElement('li');
        userMenuItem.className = 'menu-item';
        userMenuItem.id = 'menu-user-mgmt';
        userMenuItem.innerHTML = `
            <a onclick="switchUserMgmtSubSection('users-list')">
                <span class="menu-link-inner">
                    <i class="fa-solid fa-users-gear" style="color: #38bdf8;"></i> 
                    <span>User Management</span>
                </span>
            </a>
        `;
        menuList.appendChild(userMenuItem);

        const userViewPanel = document.createElement('div');
        userViewPanel.className = 'view-panel';
        userViewPanel.id = 'user-mgmt-view';

        userViewPanel.innerHTML = `
            <style>
                .um-card {
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    padding: 25px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                    margin-bottom: 20px;
                }
                .um-nav-tabs {
                    display: flex;
                    gap: 10px;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 12px;
                    margin-bottom: 20px;
                }
                .um-tab-btn {
                    padding: 10px 20px;
                    border-radius: 10px;
                    border: none;
                    background: #f8fafc;
                    color: #64748b;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: 0.2s;
                }
                .um-tab-btn.active {
                    background: #4f46e5;
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);
                }
                .um-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 8px;
                }
                .um-table th {
                    padding: 12px 16px;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-align: left;
                    background: #f8fafc;
                }
                .um-table td {
                    background: #ffffff;
                    padding: 14px 16px;
                    border-top: 1px solid #f1f5f9;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.92rem;
                    color: #1e293b;
                }
                .um-table tr td:first-child { border-left: 1px solid #f1f5f9; border-radius: 10px 0 0 10px; }
                .um-table tr td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 10px 10px 0; }
                
                .um-pwd-box {
                    font-family: monospace;
                    background: #f1f5f9;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-weight: 700;
                    color: #0f172a;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }
                .um-badge-active { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.78rem; }
                .um-badge-blocked { background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 20px; font-weight: 700; font-size: 0.78rem; }
            </style>

            <div class="um-card">
                <div class="um-nav-tabs">
                    <button class="um-tab-btn active" id="btn-tab-users" onclick="switchUMTab('users')">
                        <i class="fa-solid fa-users"></i> ইউজার তালিকা (<span id="umUserCount">0</span>)
                    </button>
                    <button class="um-tab-btn" id="btn-tab-add" onclick="switchUMTab('add')">
                        <i class="fa-solid fa-user-plus"></i> নতুন ইউজার তৈরি
                    </button>
                    <button class="um-tab-btn" id="btn-tab-logs" onclick="switchUMTab('logs')">
                        <i class="fa-solid fa-clock-rotate-left"></i> অ্যাক্টিভিটি অডিট লগ
                    </button>
                </div>

                <div id="um-screen-users">
                    <div style="overflow-x: auto;">
                        <table class="um-table">
                            <thead>
                                <tr>
                                    <th>নাম ও ইমেইল</th>
                                    <th>রোল</th>
                                    <th>পাসওয়ার্ড (Admin View)</th>
                                    <th>অনুমোদিত মডিউলসমূহ</th>
                                    <th>স্ট্যাটাস</th>
                                    <th style="text-align: right;">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody id="umUsersTableBody"></tbody>
                        </table>
                    </div>
                </div>

                <div id="um-screen-add" style="display:none; max-width: 800px;">
                    <h3 id="umFormTitle" style="margin-bottom: 20px; color:#1e293b; font-size:1.15rem; font-weight:800;">
                        <i class="fa-solid fa-user-shield" style="color:#4f46e5;"></i> নতুন ইউজার একাউন্ট তৈরি করুন
                    </h3>
                    <form id="umUserForm" onsubmit="event.preventDefault(); handleSaveUser();">
                        <input type="hidden" id="umEditUserId" value="">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="font-size:0.85rem; font-weight:700; color:#475569;">ইউজারের পুরো নাম *</label>
                                <input type="text" id="umName" placeholder="যেমন: মো: রফিকুল ইসলাম" class="mc-form-control" style="height:44px; margin-top:5px;" required>
                            </div>
                            <div>
                                <label style="font-size:0.85rem; font-weight:700; color:#475569;">লগইন ইমেইল *</label>
                                <input type="email" id="umEmail" placeholder="user@cpscl.com" class="mc-form-control" style="height:44px; margin-top:5px;" required>
                            </div>
                            <div>
                                <label style="font-size:0.85rem; font-weight:700; color:#475569;">লগইন পাসওয়ার্ড *</label>
                                <input type="text" id="umPassword" placeholder="কমপক্ষে ৬ ডিজিট" class="mc-form-control" style="height:44px; margin-top:5px;" required>
                            </div>
                            <div>
                                <label style="font-size:0.85rem; font-weight:700; color:#475569;">পদবী / রোল</label>
                                <input type="text" id="umRole" placeholder="যেমন: CPSCL Operator" value="CPSCL Operator" class="mc-form-control" style="height:44px; margin-top:5px;">
                            </div>
                        </div>

                        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                            <h4 style="font-size: 0.95rem; color: #1e1b4b; font-weight: 800; margin-bottom: 15px;">
                                <i class="fa-solid fa-key" style="color: #f59e0b;"></i> মডিউল এক্সেস পারমিশন সিলেক্ট করুন:
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #334155; cursor: pointer;">
                                    <input type="checkbox" id="permCPSCL" checked style="width: 18px; height: 18px; accent-color: #4f46e5;">
                                    <span>CPSCL Module (সার্টিফিকেট)</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #dc2626; cursor: pointer;">
                                    <input type="checkbox" id="permCanDeleteCPSCL" style="width: 18px; height: 18px; accent-color: #dc2626;">
                                    <span>CPSCL ডাটা ডিলিট ক্ষমতা</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer;">
                                    <input type="checkbox" id="permDash" style="width: 18px; height: 18px; accent-color: #4f46e5;">
                                    <span>Dashboard Overview</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer;">
                                    <input type="checkbox" id="permBalance" style="width: 18px; height: 18px; accent-color: #4f46e5;">
                                    <span>Balance Management</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer;">
                                    <input type="checkbox" id="permInv" style="width: 18px; height: 18px; accent-color: #4f46e5;">
                                    <span>Cash & Card Inventory</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer;">
                                    <input type="checkbox" id="permCust" style="width: 18px; height: 18px; accent-color: #4f46e5;">
                                    <span>Customer Management</span>
                                </label>
                                <label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #64748b; cursor: pointer;">
                                    <input type="checkbox" id="permClosing" style="width: 18px; height: 18px; accent-color: #4f46e5;">
                                    <span>Daily Closing</span>
                                </label>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 12px;">
                            <button type="button" onclick="switchUMTab('users')" class="mc-btn-cancel">বাতিল</button>
                            <button type="submit" class="mc-btn-primary" style="padding: 12px 30px;">
                                <i class="fa-solid fa-save"></i> ইউজার সংরক্ষণ করুন
                            </button>
                        </div>
                    </form>
                </div>

                <div id="um-screen-logs" style="display:none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="font-weight: 800; color: #1e1b4b;">লাইভ সিস্টেম অডিট হিস্ট্রি</h4>
                        <button onclick="clearActivityLogs()" style="background:none; border:none; color:#ef4444; font-weight:700; cursor:pointer;">
                            <i class="fa-solid fa-trash"></i> লগ ক্লিয়ার করুন
                        </button>
                    </div>
                    <div style="max-height: 500px; overflow-y: auto;">
                        <table class="um-table">
                            <thead>
                                <tr>
                                    <th>সময় ও তারিখ</th>
                                    <th>ইউজার</th>
                                    <th>অ্যাকশন</th>
                                    <th>বিস্তারিত বিবরণ</th>
                                </tr>
                            </thead>
                            <tbody id="umLogsTableBody"></tbody>
                        </table>
                    </div>
                </div>

            </div>
        `;

        mainWrapper.appendChild(userViewPanel);
    }

    window.switchUMTab = function (tab) {
        document.querySelectorAll('.um-tab-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('um-screen-users').style.display = 'none';
        document.getElementById('um-screen-add').style.display = 'none';
        document.getElementById('um-screen-logs').style.display = 'none';

        if (tab === 'users') {
            document.getElementById('btn-tab-users').classList.add('active');
            document.getElementById('um-screen-users').style.display = 'block';
            renderUsersTable();
        } else if (tab === 'add') {
            document.getElementById('btn-tab-add').classList.add('active');
            document.getElementById('um-screen-add').style.display = 'block';
        } else if (tab === 'logs') {
            document.getElementById('btn-tab-logs').classList.add('active');
            document.getElementById('um-screen-logs').style.display = 'block';
            renderActivityLogsTable();
        }
    };

    window.switchUserMgmtSubSection = function () {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));

        const panel = document.getElementById('user-mgmt-view');
        if (panel) panel.classList.add('active');

        const menu = document.getElementById('menu-user-mgmt');
        if (menu) menu.classList.add('active');

        document.getElementById('top-title').innerText = "ইউজার ও পারমিশন কন্ট্রোল";
        switchUMTab('users');
    };

    function renderUsersTable() {
        const tbody = document.getElementById('umUsersTableBody');
        const countEl = document.getElementById('umUserCount');
        if (!tbody) return;

        if (countEl) countEl.innerText = systemUsers.length;
        tbody.innerHTML = '';

        if (systemUsers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:25px;">কোনো সাব-ইউজার পাওয়া যায়নি।</td></tr>`;
            return;
        }

        systemUsers.forEach((u, idx) => {
            const isBlocked = u.status === 'Blocked';
            const permList = [];
            if (u.permissions?.cpscl) permList.push('<span style="background:#eef2ff; color:#4f46e5; padding:2px 6px; border-radius:4px; font-size:0.75rem; font-weight:700;">CPSCL</span>');

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color:#1e293b; display:block;">${u.name}</strong>
                    <span style="font-size:0.8rem; color:#64748b;">${u.email}</span>
                </td>
                <td><span style="font-weight:700; color:#334155;">${u.role || 'Operator'}</span></td>
                <td>
                    <div class="um-pwd-box">
                        <span id="pwd-text-${u.id}">••••••</span>
                        <i class="fa-solid fa-eye" style="cursor:pointer; color:#4f46e5;" onclick="togglePasswordView('${u.id}', '${u.password}')" title="পাসওয়ার্ড দেখুন"></i>
                    </div>
                </td>
                <td>${permList.join(' ') || '<span style="color:#94a3b8;">কোনো পারমিশন নেই</span>'}</td>
                <td>
                    <span class="${isBlocked ? 'um-badge-blocked' : 'um-badge-active'}">
                        ${isBlocked ? 'Blocked' : 'Active'}
                    </span>
                </td>
                <td style="text-align: right;">
                    <button onclick="toggleBlockUser(${idx})" class="btn-action" style="background:${isBlocked ? '#dcfce7' : '#fee2e2'}; color:${isBlocked ? '#15803d' : '#dc2626'};">
                        <i class="fa-solid ${isBlocked ? 'fa-lock-open' : 'fa-ban'}"></i>
                    </button>
                    <button onclick="editSystemUser(${idx})" class="btn-action btn-edit"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteSystemUser(${idx})" class="btn-action btn-delete"><i class="fa-solid fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.togglePasswordView = function (uid, pwd) {
        const el = document.getElementById(`pwd-text-${uid}`);
        if (el) {
            el.innerText = el.innerText === '••••••' ? pwd : '••••••';
        }
    };

    window.handleSaveUser = async function () {
        const editId = document.getElementById('umEditUserId').value;
        const name = document.getElementById('umName').value.trim();
        const email = document.getElementById('umEmail').value.trim().toLowerCase();
        const password = document.getElementById('umPassword').value.trim();
        const role = document.getElementById('umRole').value.trim();

        const permissions = {
            cpscl: document.getElementById('permCPSCL').checked,
            canDeleteCPSCL: document.getElementById('permCanDeleteCPSCL').checked,
            dashboard: document.getElementById('permDash').checked,
            balance: document.getElementById('permBalance').checked,
            inventory: document.getElementById('permInv').checked,
            customers: document.getElementById('permCust').checked,
            closing: document.getElementById('permClosing').checked
        };

        if (password.length < 6) {
            alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!");
            return;
        }

        if (typeof showLoader === 'function') showLoader("ইউজার সংরক্ষণ করা হচ্ছে...");

        try {
            if (editId) {
                const idx = systemUsers.findIndex(u => u.id === editId);
                if (idx !== -1) {
                    systemUsers[idx] = { ...systemUsers[idx], name, email, password, role, permissions };
                    window.logUserActivity("USER_UPDATED", `User (${name} - ${email}) updated`);
                }
            } else {
                const { getAuth, createUserWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
                try {
                    await createUserWithEmailAndPassword(getAuth(), email, password);
                } catch (authErr) {}

                const newUser = {
                    id: 'usr_' + Date.now(),
                    name,
                    email,
                    password,
                    role,
                    permissions,
                    status: 'Active',
                    createdAt: new Date().toLocaleDateString()
                };
                systemUsers.push(newUser);
                window.logUserActivity("USER_CREATED", `New user created (${name} - ${email})`);
            }

            await saveUsersToCloud(systemUsers);
            if (typeof hideLoader === 'function') hideLoader();
            if (typeof showToast === 'function') showToast("ইউজার সফলভাবে সংরক্ষিত হয়েছে!", "success");

            document.getElementById('umUserForm').reset();
            document.getElementById('umEditUserId').value = '';
            switchUMTab('users');
        } catch (err) {
            if (typeof hideLoader === 'function') hideLoader();
            alert("ত্রুটি: " + err.message);
        }
    };

    window.toggleBlockUser = async function (idx) {
        const u = systemUsers[idx];
        if (!u) return;
        u.status = u.status === 'Blocked' ? 'Active' : 'Blocked';
        await saveUsersToCloud(systemUsers);
        window.logUserActivity("USER_STATUS_CHANGE", `User (${u.name}) status changed to ${u.status}`);
        renderUsersTable();
    };

    window.editSystemUser = function (idx) {
        const u = systemUsers[idx];
        if (!u) return;

        document.getElementById('umEditUserId').value = u.id;
        document.getElementById('umName').value = u.name;
        document.getElementById('umEmail').value = u.email;
        document.getElementById('umPassword').value = u.password;
        document.getElementById('umRole').value = u.role || '';

        document.getElementById('permCPSCL').checked = !!u.permissions?.cpscl;
        document.getElementById('permCanDeleteCPSCL').checked = !!u.permissions?.canDeleteCPSCL;
        document.getElementById('permDash').checked = !!u.permissions?.dashboard;
        document.getElementById('permBalance').checked = !!u.permissions?.balance;
        document.getElementById('permInv').checked = !!u.permissions?.inventory;
        document.getElementById('permCust').checked = !!u.permissions?.customers;
        document.getElementById('permClosing').checked = !!u.permissions?.closing;

        document.getElementById('umFormTitle').innerHTML = `<i class="fa-solid fa-user-pen" style="color:#4f46e5;"></i> ইউজার তথ্য সম্পাদন (Edit)`;
        switchUMTab('add');
    };

    window.deleteSystemUser = async function (idx) {
        const u = systemUsers[idx];
        if (!u) return;
        if (confirm(`আপনি কি নিশ্চিত যে (${u.name}) ইউজারটি মুছে ফেলতে চান?`)) {
            systemUsers.splice(idx, 1);
            await saveUsersToCloud(systemUsers);
            window.logUserActivity("USER_DELETED", `User (${u.name} - ${u.email}) deleted`);
            renderUsersTable();
        }
    };

    function renderActivityLogsTable() {
        const tbody = document.getElementById('umLogsTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (activityLogs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">কোনো অ্যাক্টিভিটি লগ পাওয়া যায়নি।</td></tr>`;
            return;
        }

        activityLogs.forEach(l => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-size:0.82rem; color:#64748b; font-family:monospace;">${l.timestamp}</td>
                <td><strong>${l.userName}</strong> <span style="font-size:0.75rem; color:#94a3b8;">(${l.role})</span></td>
                <td><span style="background:#f1f5f9; color:#1e1b4b; padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">${l.action}</span></td>
                <td style="font-size:0.88rem; color:#334155;">${l.details}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.clearActivityLogs = async function () {
        if (confirm("সকল অ্যাক্টিভিটি লগ কি মুছে ফেলতে চান?")) {
            activityLogs = [];
            if (dbInstance && dbSetFunc && dbRefFunc) {
                await dbSetFunc(dbRefFunc(dbInstance, 'erp/activity_logs'), []);
            }
            renderActivityLogsTable();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initUserManagementUI();
            initFirebase();
        });
    } else {
        initUserManagementUI();
        initFirebase();
    }
})();
