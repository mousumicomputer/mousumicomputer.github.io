/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Student Registration
   Path: cpscl/student_registration.js
   ========================================================================== */

(function () {
    console.log("Loading CPSCL -> Student Registration Module...");

    // ১. সাইডবার ডিজাইন ও অ্যানিমেশন স্টাইল (CSS)
    function injectTrustERPStyles() {
        if (document.getElementById('trust-erp-sidebar-style')) return;
        const style = document.createElement('style');
        style.id = 'trust-erp-sidebar-style';
        style.innerHTML = `
            /* সেকশন হেডিং (শুধুই CPSCL) */
            .trust-section-label {
                font-size: 11px !important;
                font-weight: 800 !important;
                color: #8c98a4 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.8px !important;
                padding: 18px 18px 6px 18px !important;
                display: block;
            }

            /* পুরো মডিউলের মূল কন্টেইনার */
            .trust-module-wrapper {
                margin: 4px 0 !important;
                list-style: none !important;
                position: relative;
                transition: all 0.25s ease;
            }

            /* ড্রপডাউন ওপেন থাকলে বাম পাশের সলিড নীল রেল */
            .trust-module-wrapper.expanded {
                border-left: 4px solid #2563eb !important;
            }

            /* প্যারেন্ট ড্রপডাউন হেডার */
            .trust-parent-btn {
                display: flex !important;
                align-items: center !important;
                justify-content: space-between !important;
                padding: 12px 18px !important;
                color: #374151 !important;
                background-color: transparent !important;
                font-size: 13.5px !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                text-decoration: none !important;
                transition: background 0.2s ease, color 0.2s ease;
            }

            .trust-module-wrapper.expanded .trust-parent-btn {
                background-color: #e5e7eb !important; /* হালকা অ্যাশ ব্যাকগ্রাউন্ড */
                color: #1f2937 !important;
            }

            .trust-parent-btn:hover {
                background-color: #e5e7eb !important;
                color: #111827 !important;
            }

            .trust-parent-left {
                display: flex !important;
                align-items: center !important;
                gap: 12px !important;
            }

            .trust-parent-left i {
                font-size: 15px !important;
                color: #4b5563 !important;
            }

            .trust-parent-btn .chevron-arrow {
                font-size: 11px !important;
                color: #6b7280 !important;
                transition: transform 0.3s ease;
            }

            .trust-module-wrapper.expanded .chevron-arrow {
                transform: rotate(180deg) !important;
            }

            /* সাব-মেনু শেডেড বক্স */
            .trust-submenu-box {
                list-style: none !important;
                padding: 6px 0 !important;
                margin: 0 !important;
                background-color: #f8fafc !important;
                display: none;
                flex-direction: column !important;
            }

            .trust-module-wrapper.expanded .trust-submenu-box {
                display: flex !important;
            }

            /* সাব-মেনু লিংক */
            .trust-sub-link {
                display: flex !important;
                align-items: center !important;
                padding: 10px 18px 10px 24px !important;
                color: #4b5563 !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                text-decoration: none !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                position: relative;
            }

            /* নীল ইন্ডিকেটর দাগ */
            .trust-sub-indicator {
                width: 3.5px !important;
                height: 18px !important;
                background-color: transparent !important;
                border-radius: 2px !important;
                margin-right: 12px !important;
                display: inline-block !important;
                transition: background-color 0.2s ease !important;
            }

            /* মাউস হোভার ইফেক্ট */
            .trust-sub-link:hover {
                color: #2563eb !important;
                background-color: #f1f5f9 !important;
            }

            .trust-sub-link:hover .trust-sub-indicator {
                background-color: #2563eb !important;
            }

            /* অ্যাক্টিভ স্টেট */
            .trust-sub-link.active {
                color: #2563eb !important;
                font-weight: 600 !important;
            }

            .trust-sub-link.active .trust-sub-indicator {
                background-color: #2563eb !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ২. সাইডবার ইনজেকশন
    function injectTrustSidebar() {
        const menuList = document.querySelector('.sidebar .menu-list');
        if (!menuList) return;

        // আগের নোড থাকলে রিমুভ করা
        const oldLabel = document.querySelector('.trust-section-label');
        if (oldLabel) oldLabel.remove();
        const oldRoot = document.getElementById('trust-cpscl-module-root');
        if (oldRoot) oldRoot.remove();

        // সেকশন হেডার: শুধুই "CPSCL"
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'trust-section-label';
        sectionHeader.innerText = 'CPSCL';

        // মডিউল কনটেইনার
        const moduleLi = document.createElement('li');
        moduleLi.className = 'trust-module-wrapper expanded';
        moduleLi.id = 'trust-cpscl-module-root';

        moduleLi.innerHTML = `
            <a class="trust-parent-btn" onclick="toggleTrustModule()">
                <div class="trust-parent-left">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>Student Registration</span>
                </div>
                <i class="fa-solid fa-chevron-down chevron-arrow"></i>
            </a>

            <ul class="trust-submenu-box" id="trust-submenu-items">
                <!-- শুধুই একটি সাব-মেনু: Student Registration -->
                <li>
                    <a class="trust-sub-link active" onclick="switchTrustSubTab(this, 'student-reg')">
                        <span class="trust-sub-indicator"></span>
                        <span>Student Registration</span>
                    </a>
                </li>
            </ul>
        `;

        menuList.appendChild(sectionHeader);
        menuList.appendChild(moduleLi);
    }

    // ৩. টগল ড্রপডাউন
    window.toggleTrustModule = function () {
        const wrapper = document.getElementById('trust-cpscl-module-root');
        if (wrapper) wrapper.classList.toggle('expanded');
    };

    // ৪. সাব-ট্যাব সুইচিং
    window.switchTrustSubTab = function (element, tabKey) {
        document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
        if (element) element.classList.add('active');

        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const view = document.getElementById('trust-cpscl-main-view');
        if (view) view.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "CPSCL - Student Registration";
    };

    // ৫. ডান পাশের মেইন কন্টেন্ট ভিউ প্যানেল
    function injectTrustViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('trust-cpscl-main-view')) return;

        const panel = document.createElement('div');
        panel.className = 'view-panel active';
        panel.id = 'trust-cpscl-main-view';
        panel.innerHTML = `
            <div class="erp-form-card" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
                <div class="erp-form-header" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 15px; border-bottom: 1.5px solid #f1f5f9;">
                    <span style="font-size: 1.15rem; font-weight: 700; color: #1e293b;">
                        <i class="fa-solid fa-user-plus" style="color: #2563eb; margin-right: 8px;"></i> 
                        <span>Student Registration</span>
                    </span>
                    <span style="font-size: 0.8rem; background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 20px; font-weight: 700;">CPSCL</span>
                </div>
                
                <!-- পরবর্তী নির্দেশনা অনুযায়ী রেজিস্ট্রেশন ফর্ম/টেবিল এই কন্টেইনারে তৈরি হবে -->
                <div id="trustModuleDynamicCanvas" style="min-height: 400px; padding: 25px 0;">
                    <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 16px; padding: 50px 20px; text-align: center;">
                        <div style="width: 65px; height: 65px; background: #eff6ff; color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 15px auto;">
                            <i class="fa-solid fa-user-plus"></i>
                        </div>
                        <h2 style="font-size: 1.3rem; color: #1e293b; margin-bottom: 8px;">Student Registration মডিউল প্রস্তুত</h2>
                        <p style="color: #64748b; font-size: 0.95rem; max-width: 520px; margin: 0 auto;">
                            সাইডবার মেনু সম্পূর্ণ সঠিক রূপ পেয়েছে। এখন এই পেজে কী কী ফিল্ড বা কাজ করতে চান, তার নির্দেশনা দিন।
                        </p>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.appendChild(panel);
    }

    function init() {
        injectTrustERPStyles();
        injectTrustSidebar();
        injectTrustViewPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200);
    }
})();
