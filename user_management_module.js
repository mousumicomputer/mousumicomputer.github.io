/**
 * User Management & Role-Based Access Control (RBAC) Module
 * Realtime Firebase Cloud Database Sync & Activity Audit Log
 */

(function () {
    let usersDatabase = JSON.parse(localStorage.getItem('cpscl_system_users') || '[]');
    let auditLogsDatabase = JSON.parse(localStorage.getItem('cpscl_audit_logs') || '[]');
    let editingUserId = null;
    let showPasswordMap = {};

    let dbInstance = null;
    let dbRefFunc = null;
    let dbSetFunc = null;

    /* ==========================================================
       ১. ফায়ারবেস ক্লাউড ডেটাবেজ সংযোগ
       ========================================================== */
    async function initUserManagementFirebase() {
        try {
            const { initializeApp, getApps } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getDatabase, ref, set, onValue, push } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

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

            // ইউজার লিস্ট সিঙ্ক
            const usersRef = ref(dbInstance, 'system/users');
            onValue(usersRef, (snapshot) => {
                const cloudData = snapshot.val();
                if (cloudData) {
                    usersDatabase = Array.isArray(cloudData) ? cloudData : Object.values(cloudData);
                    localStorage.setItem('cpscl_system_users', JSON.stringify(usersDatabase));
                    renderUsersTable();
                } else if (usersDatabase.length === 0) {
                    // ডিফল্ট ডেমো ইউজার তৈরি
                    usersDatabase = [{
                        id: 'usr_' + Date.now(),
                        name: 'cpscl',
                        email: 'cpscl@gmail.com',
                        password: 'admin123@cpscl',
                        role: 'CPSCL Operator',
                        modules: ['CPSCL'],
                        status: 'Active',
                        createdAt: new Date().toLocaleString('en-US')
                    }];
                    syncUsersToFirebase(usersDatabase);
                }
            });

            // অডিট লগ সিঙ্ক
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
            if (usersDatabase.length === 0) {
                usersDatabase = [{
                    id: 'usr_1',
                    name: 'cpscl',
                    email: 'cpscl@gmail.com',
                    password: 'admin123@cpscl',
                    role: 'CPSCL Operator',
                    modules: ['CPSCL'],
                    status: 'Active',
                    createdAt: new Date().toLocaleString('en-US')
                }];
                renderUsersTable();
            }
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

    /* ==========================================================
       ২. গ্লোবাল অ্যাক্টিভিটি লগার (সব মডিউল থেকে লগ রেকর্ড হবে)
       ========================================================== */
    window.logUserActivity = async function (actionType, details, userName) {
        const newLog = {
            id: 'log_' + Date.now(),
            user: userName || 'CPSCL Operator (cpscl@gmail.com)',
            action: actionType,
            details: details,
            timestamp: new Date().toLocaleString('en-US', { hour12: true })
        };
        auditLogsDatabase.unshift(newLog);
        if (auditLogsDatabase.length > 200) auditLogsDatabase.pop(); // সর্বোচ্চ ২০০টি হিস্ট্রি সংরক্ষণ
        await syncLogsToFirebase(auditLogsDatabase);
        renderAuditLogsTable();
    };

    /* ==========================================================
       ৩. UI রেন্ডার ও প্যানেল ইনিশিয়ালাইজেশন
       ========================================================== */
    function initUserManagementView() {
        const viewPanel = document.getElementById('user-management-view') || document.querySelector('.view-panel#user-management-view');
        if (!viewPanel) return;

        viewPanel.innerHTML = `
            <style>
                .um-card {
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.02);
                    margin-bottom: 20px;
                }
                .um-tabs-wrap {
                    display: flex;
                    gap: 10px;
                    border-bottom: 2px solid #f1f5f9;
                    padding-bottom: 12px;
                    margin-bottom: 20px;
                }
                .um-tab-btn {
                    padding: 9px 18px;
                    border-radius: 10px;
                    font-weight: 700;
                    font-size: 0.88rem;
                    border: 1px solid #e2e8f0;
                    background: #f8fafc;
                    color: #475569;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                .um-tab-btn.active {
                    background: #4f46e5;
                    color: #ffffff;
                    border-color: #4f46e5;
                    box-shadow: 0 3px 10px rgba(79, 70, 229, 0.25);
                }
                .um-table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0 8px;
                }
                .um-table th {
                    padding: 12px 16px;
                    color: #64748b;
                    font-size: 0.84rem;
                    font-weight: 700;
                    text-align: left;
                }
                .um-table td {
                    background: #ffffff;
                    padding: 14px 16px;
                    border-top: 1px solid #f1f5f9;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 0.9rem;
                    color: #1e293b;
                }
                .um-table tr td:first-child { border-left: 1px solid #f1f5f9; border-radius: 12px 0 0 12px; }
                .um-table tr td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 12px 12px 0; }
                .um-badge-active { background: #dcfce7; color: #16a34a; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; }
                .um-badge-blocked { background: #fee2e2; color: #dc2626; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.78rem; }
                .um-module-pill { background: #eef2ff; color: #4338ca; padding: 3px 8px; border-radius: 6px; font-weight: 700; font-size: 0.76rem; }
                .um-btn-action { width: 32px; height: 32px; border-radius: 8px; border: none; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .um-btn-toggle { background: #fef2f2; color: #ef4444; }
                .um-btn-toggle:hover { background: #fee2e2; }
                .um-btn-edit { background: #f0fdf4; color: #16a34a; }
                .um-btn-edit:hover { background: #dcfce7; }
                .um-btn-del { background: #f1f5f9; color: #64748b; }
                .um-btn-del:hover { background: #e2e8f0; color: #dc2626; }
                .um-control { width: 100%; height: 42px; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0 14px; font-size: 0.9rem; outline: none; }
                .um-control:focus { border-color: #4f46e5; }
            </style>

            <div class="um-card">
                <!-- টপ ট্যাব বার -->
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

                <!-- ১. ইউজার তালিকা সাব-সেকশন -->
                <div id="um-sec-users">
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
                            <tbody id="um-users-tbody"></tbody>
                        </table>
                    </div>
                </div>

                <!-- ২. নতুন ইউজার তৈরি ও এডিট ফর্ম -->
                <div id="um-sec-create" style="display: none; max-width: 750px;">
                    <form onsubmit="handleUserFormSubmit(event)" style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">ইউজারনেম / নাম *</label>
                                <input type="text" id="um-inp-name" class="um-control" placeholder="যেমন: cpscl_operator" required>
                            </div>
                            <div>
                                <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 6px;">ইমেইল অ্যাড্রেস *</label>
                                <input type="email" id="um-inp-email" class="um-control" placeholder="user@school.edu.bd" required>
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
                                    <option value="Manager">Manager (ম্যানেজার)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style="font-size: 0.84rem; font-weight: 700; color: #475569; display: block; margin-bottom: 8px;">অনুমোদিত মডিউল নির্বাচন করুন (Permissions):</label>
                            <div style="display: flex; gap: 18px; flex-wrap: wrap; background: #f8fafc; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0;">
                                <label style="font-size: 0.86rem; font-weight: 600; display: flex; items-center; gap: 6px; cursor: pointer;">
                                    <input type="checkbox" id="perm-cpscl" value="CPSCL" checked> CPSCL Student & Certificate
                                </label>
                                <label style="font-size: 0.86rem; font-weight: 600; display: flex; items-center; gap: 6px; cursor: pointer;">
                                    <input type="checkbox" id="perm-fees" value="Fee Collection"> Fee Collection
                                </label>
                                <label style="font-size: 0.86rem; font-weight: 600; display: flex; items-center; gap: 6px; cursor: pointer;">
                                    <input type="checkbox" id="perm-inventory" value="Inventory"> Inventory Management
                                </label>
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 10px;">
                            <button type="button" onclick="cancelUserEdit()" style="padding: 10px 20px; background: #94a3b8; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">বাতিল</button>
                            <button type="submit" style="padding: 10px 28px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
                                <i class="fa-solid fa-floppy-disk mr-1"></i> সংরক্ষণ করুন
                            </button>
                        </div>
                    </form>
                </div>

                <!-- ৩. অ্যাক্টিভিটি অডিট লগ সাব-সেকশন -->
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

    /* ==========================================================
       ৪. টেবিল রেন্ডারিং ফাংশনসমূহ
       ========================================================== */
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

            const modulePills = (u.modules || ['CPSCL']).map(m => `<span class="um-module-pill">${m}</span>`).join(' ');

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
                <td>${modulePills}</td>
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

    /* ==========================================================
       ৫. ইউজার অ্যাকশন ও হ্যান্ডলারসমূহ
       ========================================================== */
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

        const selectedModules = [];
        if (document.getElementById('perm-cpscl').checked) selectedModules.push('CPSCL');
        if (document.getElementById('perm-fees').checked) selectedModules.push('Fee Collection');
        if (document.getElementById('perm-inventory').checked) selectedModules.push('Inventory');

        const userData = {
            id: editingUserId || ('usr_' + Date.now()),
            name: document.getElementById('um-inp-name').value.trim(),
            email: document.getElementById('um-inp-email').value.trim(),
            password: document.getElementById('um-inp-pass').value.trim(),
            role: document.getElementById('um-inp-role').value,
            modules: selectedModules.length > 0 ? selectedModules : ['CPSCL'],
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

        document.getElementById('perm-cpscl').checked = (u.modules || []).includes('CPSCL');
        document.getElementById('perm-fees').checked = (u.modules || []).includes('Fee Collection');
        document.getElementById('perm-inventory').checked = (u.modules || []).includes('Inventory');

        switchUMTab('create');
    };

    window.cancelUserEdit = function () {
        editingUserId = null;
        document.getElementById('um-form-title').innerText = "নতুন ইউজার তৈরি";
        document.getElementById('um-inp-name').value = '';
        document.getElementById('um-inp-email').value = '';
        document.getElementById('um-inp-pass').value = '';
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
            initUserManagementView();
            initUserManagementFirebase();
        });
    } else {
        initUserManagementView();
        initUserManagementFirebase();
    }
})();
