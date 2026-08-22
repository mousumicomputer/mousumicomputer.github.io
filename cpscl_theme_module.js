/**
 * CPSCL Dedicated Theme & Branding Module
 * Institution: Cantonment Public School and College Lalmonirhat
 * Transforms Login Screen, Dashboard Header & Sidebar into CPSCL Official Branding
 */

(function () {
    const CPSCL_LOGO_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-795xmOcuKYH8wjija8JrA-qVjfOp_4KieeZ1pOQJaqX2uXsqGLMo09AXsGGsfGjH9LpK5fPlUNGbebFguiAzPC_YvbRXcHePj7cORQd6GMxDUg-LCeXtmNkccGI2K4Hv73PJqJkGX0Ju9N4knQuqKOAImqB6qy_WWFXpKeIaQhRgk7YbLqBLpCmL0cio/s1600/%E0%A6%95%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%9F%E0%A6%A8%E0%A6%AE%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F_%E0%A6%AA%E0%A6%BE%E0%A6%AC%E0%A6%B2%E0%A6%BF%E0%A6%9F%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A7%81%E0%A6%B2_%E0%A6%93_%E0%A6%95%E0%A6%B2%E0%A7%87%E0%A6%9C_%E0%A6%B2%E0%A6%BE%E0%A6%B2%E0%A6%AE%E0%A6%A8%E0%A6%BF%E0%A6%B0%E0%A6%B9%E0%A6%BE%E0%A6%9F%E0%A7%87%E0%A6%B0_%E0%A6%B2%E0%A7%8B%E0%A6%97%E0%A7%8B.png";
    const CPSCL_TITLE = "Cantonment Public School and College";
    const CPSCL_SUB = "Lalmonirhat";

    // চেক করা হচ্ছে URL এ ?portal=cpscl আছে কি না অথবা কোনো CPSCL ইউজার লগইন করছে কি না
    function isCPSCLPortalRequested() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('portal') === 'cpscl' || sessionStorage.getItem('active_portal') === 'cpscl';
    }

    /* ==========================================================
       ১. ছবির মতো হুবহু লগইন পেজ ডিজাইন ইনজেকশন
       ========================================================== */
    function applyCPSCLCustomLoginUI() {
        const loginCard = document.querySelector('.login-card');
        const loginSection = document.getElementById('login-section');
        if (!loginCard || !loginSection) return;

        // গ্লোবাল স্টাইল যোগ
        const style = document.createElement('style');
        style.id = 'cpscl-custom-theme-styles';
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
                margin-bottom: 25px;
                position: relative;
            }
            .cpscl-logo-box {
                width: 85px;
                height: 85px;
                background: #ffffff;
                border-radius: 50%;
                margin: 0 auto;
                padding: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
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
                margin-bottom: 25px;
                line-height: 1.4;
            }
            .cpscl-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                margin-bottom: 18px;
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

        // কার্ডের ভেতরের HTML ছবির মতো তৈরি করা
        loginCard.innerHTML = `
            <div class="cpscl-top-banner">
                <div class="cpscl-logo-box">
                    <img src="${CPSCL_LOGO_URL}" alt="CPSCL Logo">
                </div>
            </div>
            <div class="cpscl-body-content">
                <h2 class="cpscl-signin-title">Sign In</h2>
                <p class="cpscl-signin-sub">Enter your Mobile/Username and password to access CPSCL panel</p>
                
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

        // অরিজিনাল লগইন লিসেনার পুনরায় বাইন্ড করা
        rebindLoginFormSubmit();
    }

    // পাসওয়ার্ড শো/হাইড ফাংশন
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

    function rebindLoginFormSubmit() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const usernameVal = document.getElementById('username').value.trim();
            const passwordVal = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');
            if (errorMsg) errorMsg.style.display = 'none';

            let emailToAuth = usernameVal;
            if (!emailToAuth.includes('@')) {
                emailToAuth = "mousumicomputer.org@gmail.com";
            }

            if (typeof showLoader === 'function') showLoader("CPSCL পোর্টালে প্রবেশ করা হচ্ছে...");

            try {
                const { getAuth, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
                await signInWithEmailAndPassword(getAuth(), emailToAuth, passwordVal);
                sessionStorage.setItem('active_portal', 'cpscl');
            } catch (err) {
                if (typeof hideLoader === 'function') hideLoader();
                if (errorMsg) {
                    errorMsg.innerText = "ভুল ইউজারনেম বা পাসওয়ার্ড!";
                    errorMsg.style.display = 'block';
                }
            }
        });
    }

    /* ==========================================================
       ২. লগইন হওয়ার পর ড্যাশবোর্ড ও সাইডবার ব্র্যান্ডিং ট্রান্সফর্ম
       ========================================================= */
    function applyCPSCLDashboardBranding() {
        // সাইডবারের টপ লোগো পরিবর্তন
        const brandLogoImg = document.querySelector('.brand-logo img');
        const brandLogoWrapper = document.querySelector('.brand-logo-img-wrapper');
        const brandTextH3 = document.querySelector('.brand-text h3');
        const brandTextSpan = document.querySelector('.brand-text span');

        if (brandLogoImg) brandLogoImg.src = CPSCL_LOGO_URL;
        if (brandLogoWrapper) brandLogoWrapper.style.background = "#ffffff";
        if (brandTextH3) brandTextH3.innerText = "CPSCL";
        if (brandTextSpan) brandTextSpan.innerText = "LALMONIRHAT";

        // প্রোফাইল হেডার
        const dropdownHeaderImg = document.getElementById('dropdownHeaderImg');
        if (dropdownHeaderImg) dropdownHeaderImg.src = CPSCL_LOGO_URL;
    }

    /* ==========================================================
       ৩. ইনিশিয়ালাইজার
       ========================================================== */
    function initCPSCLTheme() {
        if (isCPSCLPortalRequested()) {
            applyCPSCLCustomLoginUI();
        }

        // লগইন হওয়ার পর যদি CPSCL এক্সেস থাকে
        const checkLoginInterval = setInterval(() => {
            const dashSection = document.getElementById('dashboard-section');
            if (dashSection && dashSection.style.display !== 'none') {
                applyCPSCLDashboardBranding();
                clearInterval(checkLoginInterval);
            }
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCPSCLTheme);
    } else {
        initCPSCLTheme();
    }
})();
