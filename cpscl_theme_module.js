/**
 * CPSCL Dedicated Login & Portal Theme Module
 * Institution: Cantonment Public School and College Lalmonirhat
 * Features: Top Navbar Pill, Dynamic User Avatar, Standalone Portal Dashboard
 */

(function () {
    const SUPER_ADMIN_EMAIL = "mousumicomputer.org@gmail.com";
    const CPSCL_LOGO_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-795xmOcuKYH8wjija8JrA-qVjfOp_4KieeZ1pOQJaqX2uXsqGLMo09AXsGGsfGjH9LpK5fPlUNGbebFguiAzPC_YvbRXcHePj7cORQd6GMxDUg-LCeXtmNkccGI2K4Hv73PJqJkGX0Ju9N4knQuqKOAImqB6qy_WWFXpKeIaQhRgk7YbLqBLpCmL0cio/s1600/%E0%A6%95%E0%A7%8D%E0%A6%AF%E0%A6%AA%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%9F%E0%A6%A8%E0%A6%AE%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F_%E0%A6%AA%E0%A6%BE%E0%A6%AC%E0%A6%B2%E0%A6%BF%E0%A6%9F%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A7%81%E0%A6%B2_%E0%A6%93_%E0%A6%95%E0%A6%B2%E0%A7%87%E0%A6%9C_%E0%A6%B2%E0%A6%BE%E0%A6%B2%E0%A6%AE%E0%A6%A8%E0%A6%BF%E0%A6%B0%E0%A6%B9%E0%A6%BE%E0%A6%9F%E0%A7%87%E0%A6%B0_%E0%A6%B2%E0%A7%8B%E0%A6%97%E0%A7%8B.png";
    const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    function isCPSCLPortalURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('portal') === 'cpscl';
    }

    /* ==========================================================
       ১. CPSCL সুন্দর সাইন-ইন পেজ
       ========================================================== */
    function applyCPSCLCustomLoginUI() {
        const loginCard = document.querySelector('.login-card');
        const loginSection = document.getElementById('login-section');
        if (!loginCard || !loginSection) return;

        if (document.getElementById('cpscl-login-styles')) return;

        const style = document.createElement('style');
        style.id = 'cpscl-login-styles';
        style.innerHTML = `
            #login-section.cpscl-theme-bg {
                background: #f1f5f9 !important;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .login-card.cpscl-card-style {
                background: #ffffff !important;
                border-radius: 16px !important;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
                width: 100% !important;
                max-width: 440px !important;
                padding: 0 0 35px 0 !important;
                overflow: hidden !important;
                border: 1px solid #e2e8f0 !important;
                text-align: left !important;
            }
            .cpscl-top-banner {
                background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
                padding: 30px 20px;
                text-align: center;
                border-radius: 0 0 50% 50% / 0 0 20px 20px;
                margin-bottom: 20px;
                position: relative;
            }
            .cpscl-logo-box {
                width: 90px;
                height: 90px;
                background: #ffffff;
                border-radius: 50%;
                margin: 0 auto;
                padding: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.25);
            }
            .cpscl-logo-box img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            .cpscl-body-content {
                padding: 0 35px;
            }
            .cpscl-signin-title {
                font-size: 1.5rem;
                font-weight: 800;
                color: #0f172a;
                text-align: center;
                margin-bottom: 6px;
            }
            .cpscl-signin-sub {
                font-size: 0.85rem;
                color: #64748b;
                text-align: center;
                margin-bottom: 22px;
                line-height: 1.4;
            }
            .cpscl-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                margin-bottom: 16px;
            }
            .cpscl-input-control {
                width: 100% !important;
                height: 48px !important;
                border: 1.5px solid #e2e8f0 !important;
                border-radius: 10px !important;
                padding: 0 16px !important;
                font-size: 0.95rem !important;
                color: #1e293b !important;
                background: #f8fafc !important;
                outline: none !important;
                transition: all 0.2s !important;
            }
            .cpscl-input-control:focus {
                border-color: #2563eb !important;
                background: #ffffff !important;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1) !important;
            }
            .cpscl-pwd-toggle-btn {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                color: #64748b;
            }
            .cpscl-btn-login {
                width: 100% !important;
                height: 48px !important;
                background: #2563eb !important;
                color: #ffffff !important;
                font-weight: 700 !important;
                font-size: 1rem !important;
                border-radius: 25px !important;
                border: none !important;
                cursor: pointer !important;
                margin-top: 15px !important;
                box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
                transition: 0.2s !important;
            }
            .cpscl-btn-login:hover {
                background: #1d4ed8 !important;
            }
        `;
        document.head.appendChild(style);

        loginSection.classList.add('cpscl-theme-bg');
        loginCard.classList.add('cpscl-card-style');

        loginCard.innerHTML = `
            <div class="cpscl-top-banner">
                <div class="cpscl-logo-box">
                    <img src="${CPSCL_LOGO_URL}" alt="CPSCL Logo">
                </div>
            </div>
            <div class="cpscl-body-content">
                <h2 class="cpscl-signin-title">Sign In</h2>
                <p class="cpscl-signin-sub">Enter your Mobile/Username and password to access admin panel</p>
                
                <p class="error-msg" id="errorMsg" style="display:none; text-align:center; margin-bottom:10px; color:#ef4444; font-weight:bold; font-size:0.85rem;"></p>
                <p class="success-msg" id="successMsg" style="display:none; text-align:center; margin-bottom:10px; color:#10b981; font-weight:bold; font-size:0.85rem;"></p>

                <form id="loginForm">
                    <div style="margin-bottom: 6px;">
                        <label style="font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 6px; display:block;">Mobile No/Username</label>
                        <div class="cpscl-input-wrapper">
                            <input type="text" id="username" class="cpscl-input-control" placeholder="Enter your Mobile No/Username" required>
                        </div>
                    </div>

                    <div style="margin-bottom: 6px;">
                        <label style="font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 6px; display:block;">PIN/Password</label>
                        <div class="cpscl-input-wrapper">
                            <input type="password" id="password" class="cpscl-input-control" placeholder="Enter your PIN/Password" style="padding-right: 48px !important;" required>
                            <button type="button" class="cpscl-pwd-toggle-btn" onclick="toggleLoginPasswordView()">
                                <i class="fa-solid fa-eye" id="loginEyeIcon"></i>
                            </button>
                        </div>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px; margin-bottom: 5px;">
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #475569; font-weight: 600; cursor: pointer;">
                            <input type="checkbox" id="rememberMeCheck" checked style="width: 16px; height: 16px; accent-color: #2563eb;"> Remember Me
                        </label>
                    </div>

                    <button type="submit" class="cpscl-btn-login">
                        Log In
                    </button>
                </form>
            </div>
        `;

        rebindLoginForm();
    }

    window.toggleLoginPasswordView = function () {
        const passInp = document.getElementById('password');
        const icon = document.getElementById('loginEyeIcon');
        if (!passInp) return;

        if (passInp.type === 'password') {
            passInp.type = 'text';
            icon.className = 'fa-solid fa-eye-slash';
        } else {
            passInp.type = 'password';
            icon.className = 'fa-solid fa-eye';
        }
    };

    function rebindLoginForm() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameVal = document.getElementById('username').value.trim();
            const passwordVal = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');
            if (errorMsg) errorMsg.style.display = 'none';

            if (typeof showLoader === 'function') showLoader("যাচাই করা হচ্ছে...");

            try {
                const { getAuth, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
                await signInWithEmailAndPassword(getAuth(), usernameVal, passwordVal);
            } catch (err) {
                if (typeof hideLoader === 'function') hideLoader();
                if (errorMsg) {
                    errorMsg.innerText = "ভুল ইমেইল বা পাসওয়ার্ড!";
                    errorMsg.style.display = 'block';
                }
            }
        });
    }

    /* ==========================================================
       ২. একক পোর্টাল ড্যাশবোর্ড (১টি ব্যানার + সামারি কার্ড)
       ========================================================== */
    function initCPSCLPortalDashboardUI() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('cpscl-portal-dash-view')) return;

        const dashPanel = document.createElement('div');
        dashPanel.className = 'view-panel active';
        dashPanel.id = 'cpscl-portal-dash-view';

        dashPanel.innerHTML = `
            <!-- ১টি মাত্র প্রাতিষ্ঠানিক ব্যানার -->
            <div class="cpscl-hero-banner">
                <img src="${CPSCL_LOGO_URL}" alt="CPSCL Logo" class="cpscl-hero-logo">
                <div style="flex: 1;">
                    <h2 class="cpscl-hero-title">CANTONMENT PUBLIC SCHOOL & COLLEGE LALMONIRHAT</h2>
                    <div class="cpscl-hero-meta">EIIN No. : 137653 &nbsp;|&nbsp; College Code : 7257 &nbsp;|&nbsp; School Code : 7296</div>
                    <div class="cpscl-hero-addr"><i class="fa-solid fa-location-dot" style="color: #facc15;"></i> Address: Lalmonirhat Cantonment, Lalmonirhat</div>
                </div>
            </div>

            <!-- ৪টি সামারি কার্ড -->
            <div class="cpscl-stat-grid">
                <div class="cpscl-stat-card">
                    <div class="cpscl-stat-icon" style="background:#eef2ff; color:#4f46e5;"><i class="fa-solid fa-users"></i></div>
                    <div>
                        <p style="font-size:0.85rem; color:#64748b; font-weight:700; margin-bottom:2px;">মোট শিক্ষার্থী</p>
                        <h3 id="statThemeTotal" style="font-size:1.4rem; color:#0f172a; font-weight:800; margin:0;">0</h3>
                    </div>
                </div>
                <div class="cpscl-stat-card">
                    <div class="cpscl-stat-icon" style="background:#e0f2fe; color:#0284c7;"><i class="fa-solid fa-graduation-cap"></i></div>
                    <div>
                        <p style="font-size:0.85rem; color:#64748b; font-weight:700; margin-bottom:2px;">SSC Testimonial</p>
                        <h3 id="statThemeSSC" style="font-size:1.4rem; color:#0f172a; font-weight:800; margin:0;">0</h3>
                    </div>
                </div>
                <div class="cpscl-stat-card">
                    <div class="cpscl-stat-icon" style="background:#fef3c7; color:#d97706;"><i class="fa-solid fa-user-graduate"></i></div>
                    <div>
                        <p style="font-size:0.85rem; color:#64748b; font-weight:700; margin-bottom:2px;">HSC Testimonial</p>
                        <h3 id="statThemeHSC" style="font-size:1.4rem; color:#0f172a; font-weight:800; margin:0;">0</h3>
                    </div>
                </div>
                <div class="cpscl-stat-card">
                    <div class="cpscl-stat-icon" style="background:#fee2e2; color:#dc2626;"><i class="fa-solid fa-file-invoice"></i></div>
                    <div>
                        <p style="font-size:0.85rem; color:#64748b; font-weight:700; margin-bottom:2px;">TC ও চারিত্রিক সনদ</p>
                        <h3 id="statThemeOther" style="font-size:1.4rem; color:#0f172a; font-weight:800; margin:0;">0</h3>
                    </div>
                </div>
            </div>

            <!-- কুইক অ্যাকশন কার্ড -->
            <div class="cpscl-card">
                <h3 style="font-size:1.1rem; color:#1e293b; font-weight:800; margin-bottom:15px;"><i class="fa-solid fa-bolt" style="color:#f59e0b;"></i> Quick Actions</h3>
                <div style="display:flex; gap:12px; flex-wrap:wrap;">
                    <button class="btn-submit" onclick="openCPSCLSection('list')" style="width:auto; padding:12px 22px; background:#4f46e5; border-radius:10px; font-weight:700;">
                        <i class="fa-solid fa-users"></i> শিক্ষার্থী তালিকা দেখুন
                    </button>
                    <button class="btn-submit" onclick="openCPSCLSection('entry')" style="width:auto; padding:12px 22px; background:#0284c7; border-radius:10px; font-weight:700;">
                        <i class="fa-solid fa-user-plus"></i> নতুন শিক্ষার্থী এন্ট্রি
                    </button>
                    <button class="btn-submit" onclick="openCPSCLSection('preview')" style="width:auto; padding:12px 22px; background:#10b981; border-radius:10px; font-weight:700;">
                        <i class="fa-solid fa-print"></i> সার্টিফিকেট প্রিন্ট প্যানেল
                    </button>
                </div>
            </div>
        `;

        mainWrapper.appendChild(dashPanel);

        // ব্রাউজারে সংরক্ষিত ডাটা দিয়ে পরিসংখ্যান আপডেট
        const savedData = JSON.parse(localStorage.getItem('cpscl_students_data') || '[]');
        window.updateCPSCLThemeStats(savedData);
    }

    window.openCPSCLSection = function (section) {
        const portalDash = document.getElementById('cpscl-portal-dash-view');
        if (portalDash) portalDash.classList.remove('active');
        if (typeof window.switchCPSCLSubSection === 'function') {
            window.switchCPSCLSubSection(section);
        }
    };

    window.openCPSCLHomeDashboard = function () {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const portalDash = document.getElementById('cpscl-portal-dash-view');
        if (portalDash) portalDash.classList.add('active');
    };

    window.updateCPSCLThemeStats = function (students) {
        if (!students) return;
        const total = students.length;
        const ssc = students.filter(s => s.template === 'ssc_testimonial').length;
        const hsc = students.filter(s => s.template === 'hsc_testimonial').length;
        const other = students.filter(s => s.template === 'tc_certificate' || s.template === 'character_cert').length;

        if (document.getElementById('statThemeTotal')) document.getElementById('statThemeTotal').innerText = total;
        if (document.getElementById('statThemeSSC')) document.getElementById('statThemeSSC').innerText = ssc;
        if (document.getElementById('statThemeHSC')) document.getElementById('statThemeHSC').innerText = hsc;
        if (document.getElementById('statThemeOther')) document.getElementById('statThemeOther').innerText = other;
    };

    /* ==========================================================
       ৩. টপ ন্যাভবার পিল ও প্রোফাইল ছবি
       ========================================================== */
    function injectCPSCLHeaderPill(userPhotoURL) {
        const navLeft = document.querySelector('.navbar-left');
        const topTitle = document.getElementById('top-title');

        if (navLeft && !document.getElementById('cpscl-navbar-pill')) {
            if (topTitle) topTitle.style.display = 'none';

            const pillDiv = document.createElement('div');
            pillDiv.id = 'cpscl-navbar-pill';
            pillDiv.className = 'cpscl-nav-pill';
            pillDiv.innerHTML = `
                <i class="fa-solid fa-building-columns" style="color: #2563eb;"></i>
                <span style="font-weight: 700; color: #1e40af;">Cantonment Public School And College Lalmonirhat</span>
                <span class="cpscl-pill-id">ID: 1013</span>
            `;
            navLeft.appendChild(pillDiv);
        }

        const userAvatar = document.getElementById('navAvatar');
        const dropdownHeaderImg = document.getElementById('dropdownHeaderImg');
        const avatarSrc = userPhotoURL || DEFAULT_AVATAR;

        if (userAvatar) userAvatar.src = avatarSrc;
        if (dropdownHeaderImg) dropdownHeaderImg.src = avatarSrc;
    }

    function removeCPSCLHeaderPill() {
        const pill = document.getElementById('cpscl-navbar-pill');
        const topTitle = document.getElementById('top-title');
        const portalDash = document.getElementById('cpscl-portal-dash-view');

        if (pill) pill.remove();
        if (topTitle) topTitle.style.display = 'block';
        if (portalDash) portalDash.remove();
    }

    function injectGlobalStyles() {
        if (document.getElementById('cpscl-portal-global-css')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-portal-global-css';
        style.innerHTML = `
            .cpscl-nav-pill {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                background: #eff6ff;
                border: 1.5px solid #bfdbfe;
                padding: 6px 14px;
                border-radius: 30px;
                font-size: 0.9rem;
                margin-left: 8px;
            }
            .cpscl-pill-id {
                background: #3b82f6;
                color: #ffffff;
                font-size: 0.72rem;
                padding: 3px 8px;
                border-radius: 12px;
                font-weight: 800;
            }
            .cpscl-hero-banner {
                background: linear-gradient(135deg, #064e3b 0%, #022c22 100%);
                border-radius: 14px;
                padding: 18px 24px;
                display: flex;
                align-items: center;
                gap: 20px;
                margin-bottom: 22px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.12);
                border: 1px solid rgba(250, 204, 21, 0.25);
                color: #ffffff;
            }
            .cpscl-hero-logo {
                width: 75px;
                height: 75px;
                object-fit: contain;
                filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
            }
            .cpscl-hero-title {
                font-size: 1.25rem;
                font-weight: 900;
                color: #facc15;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
                text-transform: uppercase;
            }
            .cpscl-hero-meta {
                font-size: 0.88rem;
                color: #f1f5f9;
                font-weight: 700;
                margin-bottom: 4px;
            }
            .cpscl-hero-addr {
                font-size: 0.82rem;
                color: #cbd5e1;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .cpscl-stat-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                gap: 16px;
                margin-bottom: 22px;
            }
            .cpscl-stat-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 14px;
                padding: 18px 20px;
                display: flex;
                align-items: center;
                gap: 16px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            }
            .cpscl-stat-icon {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.4rem;
            }
            @media (max-width: 768px) {
                .cpscl-hero-banner {
                    flex-direction: column;
                    text-align: center;
                }
                .cpscl-hero-addr {
                    justify-content: center;
                }
            }
        `;
        document.head.appendChild(style);
    }

    async function init() {
        injectGlobalStyles();

        if (isCPSCLPortalURL()) {
            applyCPSCLCustomLoginUI();
        }

        try {
            const { getAuth, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
            const auth = getAuth();

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    const isSuperAdmin = user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
                    if (!isSuperAdmin) {
                        injectCPSCLHeaderPill(user.photoURL);
                        initCPSCLPortalDashboardUI();
                    } else {
                        removeCPSCLHeaderPill();
                    }
                } else {
                    removeCPSCLHeaderPill();
                }
            });
        } catch (e) {}
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
