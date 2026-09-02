/**
 * User Management & Role-Based Fine-Grained Access Control (RBAC) Module
 * Realtime Firebase Cloud Database Sync & Live Activity Audit Log
 */

(function () {
    let usersDatabase = JSON.parse(localStorage.getItem('cpscl_system_users') || '[]');
    let auditLogsDatabase = JSON.parse(localStorage.getItem('cpscl_audit_logs') || '[]');
    let editingUserId = null;
    let showPasswordMap = {};

    let dbInstance = null;
    let dbRefFunc = null;
    let dbSetFunc = null;

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
            const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig, "USER_MGMT_APP");
            
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
                } else if (usersDatabase.length === 0) {
                    usersDatabase = [{
                        id: 'usr_' + Date.now(),
                        name: 'cpscl',
                        email: 'cpscl@gmail.com',
                        password: 'admin123@cpscl',
                        role: 'CPSCL Operator',
                        permissions: {
                            can_view_print: true,
                            can_upload_excel: false,
                            can_manual_entry: false,
                            can_delete_data: false
                        },
                        status: 'Active',
                        createdAt: new Date().toLocaleString('en-US')
                    }];
                    syncUsersToFirebase(usersDatabase);
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
            user: userName || 'Admin / Operator',
            action: actionType,
            details: details,
            timestamp: new Date().toLocaleString('en-US', { hour12: true })
        };
        auditLogsDatabase.unshift(newLog);
        if (auditLogsDatabase.length > 200) auditLogsDatabase.pop();
        await syncLogsToFirebase(auditLogsDatabase);
        renderAuditLogsTable();
    };

    function initUserManagementModule() {
        const menuList = document.querySelector('.sidebar .menu-list') || document.querySelector('.menu-list');
        const mainWrapper = document.querySelector('.main-wrapper') || document.querySelector('main');

        if (!menuList || !mainWrapper) {
            setTimeout(initUserManagementModule, 150);
            return;
        }

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

            const eduMenu = document.getElementById('menu-education-parent') || document.querySelector('[id*="education"]');
            if (eduMenu) {
                menuList.insertBefore(umMenuItem, eduMenu);
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

        viewPanel.innerHTML = `
            <style>
                .um-card { background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); margin-bottom: 20px; }
                .um-tabs-wrap { display: flex; gap: 10px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 20px; }
                .um-tab-btn { padding: 9px 18px; border-radius: 10px; font-weight: 700; font-size: 0.88rem; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
                .um-tab-btn.active { background: #4f46e5; color: #ffffff; border-color: #4f46e5; box-shadow: 0 3px 10px rgba(79, 70, 229, 0.25); }
                .um-table { width: 100%; border-collapse: separate; border-spacing: 0 8px; }
                .um-table th { padding: 12px 16px; color: #64748b; font-size: 0.84rem; font-weight: 700; text-align: left; }
                .um-table td { background: #ffffff; padding: 14px 16px; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #1e293b; }
                .um-table tr td:first-child { border-left: 1px solid #f1f5f9; border-radius: 12px 0 0 12px; }
                .um-table tr td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 12px 12px 0; }
                .um-badge-active { background: #dcfce7; color: #16a34a; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; }
                .um-badge-blocked { background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; }
                .um-perm-tag { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; margin: 2px; }
                .um-perm-on { background: #e0f2fe; color: #0369a1; }
                .um-perm-off { background: #f1f5f9; color: #94a3b8; text-decoration: line-through; }
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
                        <i class="fa-solid fa-users"></i> ইউজার তালিকা ( <span id="um-count">1</span> )
                    </button>
                    <button class="um-tab-btn" id="tab-btn-create" onclick="switchUMTab('create')">
                        <i class="fa-solid fa-user-plus"></i> <span id="um-form-title">নতুন ইউজার তৈরি</span>
                    </button>
                    <button class="um-tab-btn" id="tab-btn-audit" onclick="switchUMTab('audit')">
                        <i class="fa-solid fa-clock-rotate-left"></i> অ্যাক্টিভিটি অডিট লগ
                    </button>
                </div>

                <div id="um-sec-users">
                    <div style="overflow-x: auto;">
                        <table class="um-table">
                            <thead>
                                <tr>
                                    <th>নাম ও ইমেইল</th>
                                    <th>রোল</th>
                                    <th>পাসওয়ার্ড (Admin View)</th>
                                    <th>অনুমোদিত ফিচারসমূহ (Permissions)</th>
                                    <th>স্ট্যাটাস</th>
                                    <th style="text-align: right;">অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody id="um-users-tbody"></tbody>
                        </table>
                    </div>
                </div>

                <div id="um-sec-create" style="display: none; max-width: 750px;">
                    <form onsubmit="handleUserFormSubmit(event)" style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">ইউজারনেম / নাম *</label>
                                <input type="text" id="um-inp-name" class="um-control" placeholder="যেমন: cpscl" required>
                            </div>
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">ইমেইল অ্যাড্রেস *</label>
                                <input type="email" id="um-inp-email" class="um-control" placeholder="cpscl@gmail.com" required>
                            </div>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">পাসওয়ার্ড *</label>
                                <input type="text" id="um-inp-pass" class="um-control" placeholder="গোপন পাসওয়ার্ড দিন" required>
                            </div>
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">ব্যবহারকারীর পদবী / রোল *</label>
                                <select id="um-inp-role" class="um-control">
                                    <option value="CPSCL Operator">CPSCL Operator (স্কুল অপারেটর)</option>
                                    <option value="Accountant">Accountant (অ্যাকাউন্টস)</option>
                                    <option value="Teacher">Teacher (শিক্ষক)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 8px;">ইউজারের অনুমোদিত কাজ (Fine-Grained Permissions):</label>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
                                <label style="font-size: 0.85rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="perm-view-print" checked> ১. ভিউ ও সার্টিফিকেট প্রিন্ট
                                </label>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="perm-upload-excel"> ২. এক্সেল ফাইল আপলোড
                                </label>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="perm-manual-entry"> ৩. নতুন শিক্ষার্থী এন্ট্রি
                                </label>
                                <label style="font-size: 0.85rem; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                    <input type="checkbox" id="perm-delete-data"> ৪. ডাটা ক্লিয়ার / ডিলিট
                                </label>
                            </div>
                            <p style="font-size: 0.78rem; color: #64748b; margin-top: 5px;">* ডিফল্টভাবে ইউজার শুধু সার্টিফিকেট দেখতে ও প্রিন্ট করতে পারবে।</p>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
                            <button type="button" onclick="cancelUserEdit()" style="padding: 10px 20px; background: #94a3b8; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">বাতিল</button>
                            <button type="submit" style="padding: 10px 28px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
                                <i class="fa-solid fa-floppy-disk mr-1"></i> সংরক্ষণ করুন
                            </button>
                        </div>
                    </form>
                </div>

                <div id="um-sec-audit" style="display: none;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                        <span style="font-size: 0.85rem; color: #64748b; font-weight: 600;">রিয়েল-টাইম ইউজার অ্যাক্টিভিটি মনিটরিং</span>
                        <button onclick="clearAuditLogs()" style="background: none; border: none; color: #ef4444; font-weight: 700; font-size: 0.82rem; cursor: pointer;">
                            <i class="fa-solid fa-trash-can mr-1"></i> লগ হিস্ট্রি ক্লিয়ার
                        </button>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="um-table">
                            <thead>
                                <tr>
                                    <th>সময় ও তারিখ</th>
                                    <th>ব্যবহারকারী</th>
                                    <th>অ্যাকশন</th>
                                    <th>বিস্তারিত বিবরণ</th>
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

        const topTitle = document.getElementById('top-title') || document.querySelector('.page-title');
        if (topTitle) topTitle.innerText = "ইউজার ও পারমিশন কন্ট্রোল";
    };

    function renderUsersTable() {
        const tbody = document.getElementById('um-users-tbody');
        const countSpan = document.getElementById('um-count');
        if (!tbody) return;

        if (countSpan) countSpan.innerText = usersDatabase.length;
        tbody.innerHTML = '';

        if (usersDatabase.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 25px;">কোনো ইউজার পাওয়া যায়নি।</td></tr>`;
            return;
        }

        usersDatabase.forEach((u, index) => {
            const isShown = showPasswordMap[u.id];
            const passDisplay = isShown ? u.password : '••••••••';
            const eyeIcon = isShown ? 'fa-eye-slash' : 'fa-eye';
            const statusClass = u.status === 'Active' ? 'um-badge-active' : 'um-badge-blocked';
            const toggleIcon = u.status === 'Active' ? 'fa-ban' : 'fa-check';
            const toggleTitle = u.status === 'Active' ? 'ব্লক করুন' : 'সক্রিয় করুন';

            const p = u.permissions || { can_view_print: true, can_upload_excel: false, can_manual_entry: false, can_delete_data: false };
            const tags = `
                <span class="um-perm-tag ${p.can_view_print ? 'um-perm-on' : 'um-perm-off'}">Print</span>
                <span class="um-perm-tag ${p.can_upload_excel ? 'um-perm-on' : 'um-perm-off'}">Excel</span>
                <span class="um-perm-tag ${p.can_manual_entry ? 'um-perm-on' : 'um-perm-off'}">Entry</span>
                <span class="um-perm-tag ${p.can_delete_data ? 'um-perm-on' : 'um-perm-off'}">Delete</span>
            `;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong style="color: #1e293b; display: block;">${u.name}</strong>
                    <span style="font-size: 0.8rem; color: #64748b;">${u.email}</span>
                </td>
                <td><strong style="color: #334155;">${u.role}</strong></td>
                <td>
                    <span style="font-family: monospace; font-weight: 700; color: #4338ca; letter-spacing: 1px;">${passDisplay}</span>
                    <button onclick="togglePasswordView('${u.id}')" style="background: none; border: none; color: #6366f1; cursor: pointer; margin-left: 8px;">
                        <i class="fa-solid ${eyeIcon}"></i>
                    </button>
                </td>
                <td>${tags}</td>
                <td><span class="${statusClass}">${u.status}</span></td>
                <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                        <button onclick="toggleUserStatus(${index})" title="${toggleTitle}" class="um-btn-action um-btn-toggle">
                            <i class="fa-solid ${toggleIcon}"></i>
                        </button>
                        <button onclick="editUser(${index})" title="এডিট করুন" class="um-btn-action um-btn-edit">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="deleteUser(${index})" title="মুছে ফেলুন" class="um-btn-action um-btn-del">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderAuditLogsTable() {
        const tbody = document.getElementById('um-audit-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';
        if (auditLogsDatabase.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 25px;">এখনো কোনো অ্যাক্টিভিটি রেকর্ড হয়নি।</td></tr>`;
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

    window.handleUserFormSubmit = async function (event) {
        event.preventDefault();

        const userData = {
            id: editingUserId || ('usr_' + Date.now()),
            name: document.getElementById('um-inp-name').value.trim(),
            email: document.getElementById('um-inp-email').value.trim(),
            password: document.getElementById('um-inp-pass').value.trim(),
            role: document.getElementById('um-inp-role').value,
            permissions: {
                can_view_print: document.getElementById('perm-view-print').checked,
                can_upload_excel: document.getElementById('perm-upload-excel').checked,
                can_manual_entry: document.getElementById('perm-manual-entry').checked,
                can_delete_data: document.getElementById('perm-delete-data').checked
            },
            status: 'Active',
            createdAt: new Date().toLocaleString('en-US')
        };

        if (editingUserId) {
            const idx = usersDatabase.findIndex(u => u.id === editingUserId);
            if (idx !== -1) usersDatabase[idx] = userData;
            window.logUserActivity("USER_EDIT", `User details updated for ${userData.name}`);
        } else {
            usersDatabase.push(userData);
            window.logUserActivity("USER_CREATE", `New user created: ${userData.name} (${userData.role})`);
        }

        await syncUsersToFirebase(usersDatabase);
        cancelUserEdit();
        switchUMTab('users');
    };

    window.editUser = function (index) {
        const u = usersDatabase[index];
        if (!u) return;

        editingUserId = u.id;
        document.getElementById('um-form-title').innerText = "ইউজার এডিট করুন";
        document.getElementById('um-inp-name').value = u.name;
        document.getElementById('um-inp-email').value = u.email;
        document.getElementById('um-inp-pass').value = u.password;
        document.getElementById('um-inp-role').value = u.role;

        const p = u.permissions || { can_view_print: true, can_upload_excel: false, can_manual_entry: false, can_delete_data: false };
        document.getElementById('perm-view-print').checked = p.can_view_print !== false;
        document.getElementById('perm-upload-excel').checked = !!p.can_upload_excel;
        document.getElementById('perm-manual-entry').checked = !!p.can_manual_entry;
        document.getElementById('perm-delete-data').checked = !!p.can_delete_data;

        switchUMTab('create');
    };

    window.cancelUserEdit = function () {
        editingUserId = null;
        document.getElementById('um-form-title').innerText = "নতুন ইউজার তৈরি";
        document.getElementById('um-inp-name').value = '';
        document.getElementById('um-inp-email').value = '';
        document.getElementById('um-inp-pass').value = '';
        document.getElementById('perm-view-print').checked = true;
        document.getElementById('perm-upload-excel').checked = false;
        document.getElementById('perm-manual-entry').checked = false;
        document.getElementById('perm-delete-data').checked = false;
        switchUMTab('users');
    };

    window.deleteUser = async function (index) {
        const u = usersDatabase[index];
        if (!u) return;

        if (confirm(`আপনি কি নিশ্চিত যে '${u.name}' ইউজারটিকে মুছে ফেলতে চান?`)) {
            usersDatabase.splice(index, 1);
            await syncUsersToFirebase(usersDatabase);
            renderUsersTable();
            window.logUserActivity("USER_DELETE", `User deleted: ${u.name}`);
        }
    };

    window.clearAuditLogs = async function () {
        if (confirm("আপনি কি সকল অ্যাক্টিভিটি হিস্ট্রি মুছে ফেলতে চান?")) {
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
