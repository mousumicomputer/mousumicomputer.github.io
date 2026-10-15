/* ==========================================================================
   MODULE: CPSCL (Trust Edu ERP Modern Design Pattern)
   SUB-SECTION: Student Registration Suite
   Path: cpscl/student_registration.js
   ========================================================================== */

(function () {
    console.log("Loading Pixel-Perfect CPSCL Trust ERP Suite...");

    // ১. হুবহু ২য় ও ৩য় ছবির মতো পিউর সিএসএস (CSS)
    function injectTrustERPStyles() {
        if (document.getElementById('trust-erp-sidebar-style')) return;
        const style = document.createElement('style');
        style.id = 'trust-erp-sidebar-style';
        style.innerHTML = `
            /* সেকশন হেডিং (যেমন: REGISTRATION) */
            .trust-section-label {
                font-size: 11px !important;
                font-weight: 800 !important;
                color: #8c98a4 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.8px !important;
                padding: 18px 18px 6px 18px !important;
                display: block;
            }

            /* পুরো মডিউলটির মূল কন্টেইনার */
            .trust-module-wrapper {
                margin: 4px 0 !important;
                list-style: none !important;
                position: relative;
                transition: all 0.25s ease;
            }

            /* যখন মডিউলটি ওপেন বা সিলেক্টেড থাকবে - বাম পাশের লম্বা নীল বর্ডার */
            .trust-module-wrapper.expanded {
                border-left: 4px solid #2563eb !important; /* ছবির সলিড নীল রেল */
            }

            /* প্যারেন্ট ড্রপডাউন হেডার (যেমন ২য় ও ৩য় ছবিতে ধূসর শেড) */
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
                background-color: #e5e7eb !important; /* ছবির মতো অ্যাশ ব্যাকগ্রাউন্ড */
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

            /* সাব-মেনু গ্রুপ কন্টেইনার */
            .trust-submenu-box {
                list-style: none !important;
                padding: 6px 0 !important;
                margin: 0 !important;
                background-color: #f8fafc !important; /* হালকা সফট শেড যা সাবমেনুকে আটকে রাখে */
                display: none;
                flex-direction: column !important;
            }

            .trust-module-wrapper.expanded .trust-submenu-box {
                display: flex !important;
            }

            /* প্রতিটি সাব-মেনু আইটেম */
            .trust-sub-link {
                display: flex !important;
                align-items: center !important;
                padding: 9px 18px 9px 24px !important;
                color: #4b5563 !important;
                font-size: 13px !important;
                font-weight: 500 !important;
                text-decoration: none !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                position: relative;
            }

            /* ২য় ও ৩য় ছবির মতো নীল ইন্ডিকেটর বার */
            .trust-sub-indicator {
                width: 3.5px !important;
                height: 18px !important;
                background-color: transparent !important;
                border-radius: 2px !important;
                margin-right: 12px !important;
                display: inline-block !important;
                transition: background-color 0.2s ease !important;
            }

            /* হোভার ইফেক্ট (৩য় ছবিতে যেমন মাউস ধরলে নীল দাগ ও টেক্সট হয়) */
            .trust-sub-link:hover {
                color: #2563eb !important;
                background-color: #f1f5f9 !important;
            }

            .trust-sub-link:hover .trust-sub-indicator {
                background-color: #2563eb !important; /* হোভারে নীল দাগ */
            }

            /* অ্যাক্টিভ আইটেম (যেটিতে ক্লিক করা আছে) */
            .trust-sub-link.active {
                color: #2563eb !important;
                font-weight: 600 !important;
            }

            .trust-sub-link.active .trust-sub-indicator {
                background-color: #2563eb !important; /* অ্যাক্টিভ নীল দাগ */
            }
        `;
        document.head.appendChild(style);
    }

    // ২. সাইডবারে হুবহু ট্রাস্ট এডু ইআরপি'র মতো স্ট্রাকচার তৈরি
    function injectTrustSidebar() {
        const menuList = document.querySelector('.sidebar .menu-list');
        if (!menuList) return;

        // আগের কোনো ড্রাফট থাকলে তা রিমুভ করা
        const oldModule = document.getElementById('new-cpscl-parent-menu');
        if (oldModule) oldModule.remove();
        const oldWrapper = document.getElementById('trust-cpscl-module-root');
        if (oldWrapper) oldWrapper.remove();

        // ১. সেকশন হেডার
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'trust-section-label';
        sectionHeader.innerText = 'CPSCL REGISTRATION';

        // ২. মডিউল কন্টেইনার
        const moduleLi = document.createElement('li');
        moduleLi.className = 'trust-module-wrapper expanded'; // ডিফল্টভাবে ড্রপডাউন ওপেন রাখা
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
                <!-- ১. Student Registration (Active) -->
                <li>
                    <a class="trust-sub-link active" onclick="switchTrustSubTab(this, 'student-reg')">
                        <span class="trust-sub-indicator"></span>
                        <span>Student Registration</span>
                    </a>
                </li>
                <!-- ২. Student Info Reports -->
                <li>
                    <a class="trust-sub-link" onclick="switchTrustSubTab(this, 'info-reports')">
                        <span class="trust-sub-indicator"></span>
                        <span>Student Info Reports</span>
                    </a>
                </li>
                <!-- ৩. Student Bulk Edit -->
                <li>
                    <a class="trust-sub-link" onclick="switchTrustSubTab(this, 'bulk-edit')">
                        <span class="trust-sub-indicator"></span>
                        <span>Student Bulk Edit</span>
                    </a>
                </li>
                <!-- ৪. Student Subject -->
                <li>
                    <a class="trust-sub-link" onclick="switchTrustSubTab(this, 'student-subject')">
                        <span class="trust-sub-indicator"></span>
                        <span>Student Subject</span>
                    </a>
                </li>
                <!-- ৫. Student Transfer (Same Year) -->
                <li>
                    <a class="trust-sub-link" onclick="switchTrustSubTab(this, 'student-transfer')">
                        <span class="trust-sub-indicator"></span>
                        <span>Student Transfer (Same Year)</span>
                    </a>
                </li>
                <!-- ৬. Promotion -->
                <li>
                    <a class="trust-sub-link" onclick="switchTrustSubTab(this, 'promotion')">
                        <span class="trust-sub-indicator"></span>
                        <span>Promotion</span>
                    </a>
                </li>
                <!-- ৭. Batch Promotion By Result -->
                <li>
                    <a class="trust-sub-link" onclick="switchTrustSubTab(this, 'batch-promo-result')">
                        <span class="trust-sub-indicator"></span>
                        <span>Batch Promotion By Result</span>
                    </a>
                </li>
                <!-- ৮. Batch Promotion By Zig-Zag -->
                <li>
                    <a class="trust-sub-link" onclick="switchTrustSubTab(this, 'batch-promo-zigzag')">
                        <span class="trust-sub-indicator"></span>
                        <span>Batch Promotion By Zig-Zag</span>
                    </a>
                </li>
            </ul>
        `;

        menuList.appendChild(sectionHeader);
        menuList.appendChild(moduleLi);
    }

    // ৩. টগল ফাংশন
    window.toggleTrustModule = function () {
        const wrapper = document.getElementById('trust-cpscl-module-root');
        if (wrapper) wrapper.classList.toggle('expanded');
    };

    // ৪. সাব-ট্যাব সুইচিং ও ইন্টারঅ্যাকশন হ্যান্ডলার
    window.switchTrustSubTab = function (element, tabKey) {
        // সব সাবলিংক থেকে অ্যাক্টিভ ক্লাস সরানো
        document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
        // ক্লিক করা লিংকে অ্যাক্টিভ করা
        if (element) element.classList.add('active');

        // মূল ড্যাশবোর্ডের সব ভিউ হাইড করা
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));

        // টার্গেট ভিউ প্যানেল শো করা
        const view = document.getElementById('trust-cpscl-main-view');
        if (view) view.classList.add('active');

        // টপবার টাইটেল আপডেট
        const topTitle = document.getElementById('top-title');
        const clickedTitle = element ? element.querySelector('span:last-child').innerText : 'Student Registration';
        if (topTitle) topTitle.innerText = `CPSCL - ${clickedTitle}`;

        // কন্টেন্ট এরিয়ার ডাইনামিক হেডিং
        const headerTitle = document.getElementById('trustActiveSubTitle');
        if (headerTitle) headerTitle.innerText = clickedTitle;
    };

    // ৫. ডান পাশের মূল কন্টেন্ট প্যানেল
    function injectTrustViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('trust-cpscl-main-view')) return;

        const panel = document.createElement('div');
        panel.className = 'view-panel active'; // ডিফল্ট ওপেন
        panel.id = 'trust-cpscl-main-view';
        panel.innerHTML = `
            <div class="erp-form-card" style="max-width: 100%; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
                <div class="erp-form-header" style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 15px; border-bottom: 1.5px solid #f1f5f9;">
                    <span style="font-size: 1.15rem; font-weight: 700; color: #1e293b;">
                        <i class="fa-solid fa-graduation-cap" style="color: #2563eb; margin-right: 8px;"></i> 
                        <span id="trustActiveSubTitle">Student Registration</span>
                    </span>
                    <span style="font-size: 0.8rem; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 20px; font-weight: 700;">TRUST ERP SUITE</span>
                </div>
                
                <!-- পরবর্তী নির্দেশনা অনুযায়ী এই ফ্রেশ কন্টেইনারে ফর্ম/টেবিল তৈরি হবে -->
                <div id="trustModuleDynamicCanvas" style="min-height: 400px; padding: 25px 0;">
                    <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 16px; padding: 50px 20px; text-align: center;">
                        <div style="width: 65px; height: 65px; background: #eff6ff; color: #2563eb; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 15px auto;">
                            <i class="fa-solid fa-user-graduate"></i>
                        </div>
                        <h2 style="font-size: 1.3rem; color: #1e293b; margin-bottom: 8px;">Trust Innovation স্টাইল মডিউল সংযুক্ত হয়েছে</h2>
                        <p style="color: #64748b; font-size: 0.95rem; max-width: 520px; margin: 0 auto;">
                            বাম পাশের সাইডবারটি এখন অবিকল রেফারেন্স ডিজাইনের মতো সলিড নীল রেল, অ্যাশ হেডার এবং হোভার ও অ্যাক্টিভ ইন্ডিকেটরসহ কার্যকর।
                        </p>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.appendChild(panel);
    }

    // ইনিট
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
