/**
 * CPSCL Dedicated Login & Portal Theme Module
 * Institution: Cantonment Public School and College Lalmonirhat
 * Features: Top Navbar Pill, Dynamic User Profile Avatar, Institutional Hero Banner
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
       ১. CPSCL ছবির মতো হুবহু সাইন-ইন পেজ
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
       ২. টপ ন্যাভবার পিল ও ইনস্টিটিউশন ব্যানার রেন্ডারার
       ========================================================== */
    function injectCPSCLHeaderAndBanner(userPhotoURL) {
        // ১. টপ ন্যাভবারে ছবির মতো স্টাইলিশ পিল ব্যাজ যোগ
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

        // ২. ইউজারের নিজস্ব প্রোফাইল ছবি আপডেট করা
        const userAvatar = document.getElementById('navAvatar');
        const dropdownHeaderImg = document.getElementById('dropdownHeaderImg');
        const avatarSrc = userPhotoURL || DEFAULT_AVATAR;

        if (userAvatar) userAvatar.src = avatarSrc;
        if (dropdownHeaderImg) dropdownHeaderImg.src = avatarSrc;

        // ৩. CPSCL ভিউ প্যানেলের উপরে ডিপ গ্রিন ইনস্টিটিউশন ব্যানার যুক্ত করা
        const cpsclView = document.getElementById('cpscl-view');
        if (cpsclView && !document.getElementById('cpscl-hero-banner')) {
            const bannerDiv = document.createElement('div');
            bannerDiv.id = 'cpscl-hero-banner';
            bannerDiv.className = 'cpscl-hero-banner';
            bannerDiv.innerHTML = `
                <img src="${CPSCL_LOGO_URL}" alt="CPSCL Logo" class="cpscl-hero-logo">
                <div style="flex: 1;">
                    <h2 class="cpscl-hero-title">CANTONMENT PUBLIC SCHOOL & COLLEGE LALMONIRHAT</h2>
                    <div class="cpscl-hero-meta">EIIN No. : 137653 &nbsp;|&nbsp; College Code : 7257 &nbsp;|&nbsp; School Code : 7296</div>
                    <div class="cpscl-hero-addr"><i class="fa-solid fa-location-dot" style="color: #facc15;"></i> Address: Lalmonirhat Cantonment, Lalmonirhat</div>
                </div>
            `;
            cpsclView.insertBefore(bannerDiv, cpsclView.firstChild);
        }
    }

    function removeCPSCLHeaderAndBanner() {
        const pill = document.getElementById('cpscl-navbar-pill');
        const topTitle = document.getElementById('top-title');
        const banner = document.getElementById('cpscl-hero-banner');

        if (pill) pill.remove();
        if (topTitle) topTitle.style.display = 'block';
        if (banner) banner.remove();
    }

    /* ==========================================================
       ৩. গ্লোবাল সিএসএস স্টাইল
       ========================================================== */
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

    /* ==========================================================
       ৪. অথ লিসেনার ও ইনিশিয়ালাইজার
       ========================================================== */
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
                        // CPSCL ইউজারের জন্য ব্যানার ও পিল অন হবে
                        injectCPSCLHeaderAndBanner(user.photoURL);
                    } else {
                        // এডমিনের জন্য সাধারণ অবস্থা বজায় থাকবে
                        removeCPSCLHeaderAndBanner();
                    }
                } else {
                    removeCPSCLHeaderAndBanner();
                }
            });
        } catch (e) {
            console.warn("Auth check error in theme module:", e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
