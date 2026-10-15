/* ==========================================================================
   MODULE: NEW CPSCL (ISOLATED STANDALONE ARCHITECTURE)
   SUB-SECTION: Student Registration
   Path: cpscl/student_registration.js
   ========================================================================== */

(function () {
    console.log("Initializing Brand New Isolated CPSCL Module...");

    // ১. ছবির মতো সাব-মেনুর নীল ইন্ডিকেটর ও ফন্টের CSS
    function injectStyles() {
        if (document.getElementById('new-cpscl-custom-style')) return;
        const style = document.createElement('style');
        style.id = 'new-cpscl-custom-style';
        style.innerHTML = `
            /* নতুন CPSCL সাব-মেনু স্টাইল */
            #new-cpscl-parent-menu .submenu-list {
                padding-left: 20px;
                margin-top: 4px;
                display: none;
                flex-direction: column;
                gap: 4px;
            }
            #new-cpscl-parent-menu.open .submenu-list,
            #new-cpscl-parent-menu .submenu-list.show {
                display: flex !important;
            }
            #new-cpscl-parent-menu.open .chevron-icon {
                transform: rotate(180deg);
            }
            .new-cpscl-sub-item a {
                display: flex !important;
                align-items: center !important;
                gap: 10px;
                padding: 9px 12px;
                border-radius: 6px;
                text-decoration: none;
            }
            .new-cpscl-blue-bar {
                width: 3px;
                height: 18px;
                background-color: #3b82f6; /* ছবির মতো নীল দাগ */
                border-radius: 2px;
                display: inline-block;
            }
            .new-cpscl-sub-text {
                color: #3b82f6 !important;
                font-weight: 600;
                font-size: 0.88rem;
            }
        `;
        document.head.appendChild(style);
    }

    // ২. সাইডবারে সম্পূর্ণ নতুন ও স্বাধীন "CPSCL" প্যারেন্ট মেনু তৈরি করা (পুরনোটাতে হাত দেওয়া হবে না)
    function injectNewCPSCLMenu() {
        // ডুপ্লিকেট রোধ
        if (document.getElementById('new-cpscl-parent-menu')) return;

        const menuList = document.querySelector('.sidebar .menu-list');
        if (!menuList) return;

        // সম্পূর্ণ নতুন প্যারেন্ট আইটেম তৈরি
        const newParentLi = document.createElement('li');
        newParentLi.className = 'menu-item';
        newParentLi.id = 'new-cpscl-parent-menu';

        newParentLi.innerHTML = `
            <a onclick="toggleNewCPSCLMenu()" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;">
                <span class="menu-link-inner" style="display: flex; align-items: center; gap: 12px;">
                    <i class="fa-solid fa-graduation-cap"></i> 
                    <span>CPSCL</span>
                </span>
                <i class="fa-solid fa-chevron-down chevron-icon"></i>
            </a>
            <ul class="submenu-list" id="new-cpscl-submenu-wrapper">
                <li class="submenu-item new-cpscl-sub-item active" id="sub-new-student-reg">
                    <a onclick="openNewStudentRegistrationView()" style="cursor: pointer;">
                        <span class="new-cpscl-blue-bar"></span>
                        <span class="new-cpscl-sub-text">Student Registration</span>
                    </a>
                </li>
            </ul>
        `;

        // সাইডবারে নতুন আইটেমটি যুক্ত করা
        menuList.appendChild(newParentLi);
    }

    // ৩. নতুন CPSCL ড্রপডাউন টগল ফাংশন
    window.toggleNewCPSCLMenu = function () {
        const parent = document.getElementById('new-cpscl-parent-menu');
        if (parent) {
            parent.classList.toggle('open');
            const sub = document.getElementById('new-cpscl-submenu-wrapper');
            if (sub) sub.classList.toggle('show');
        }
    };

    // ৪. সম্পূর্ণ স্বাধীন কন্টেন্ট প্যানেল তৈরি করা
    function injectNewCPSCLView() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('new-cpscl-student-reg-view')) return;

        const panel = document.createElement('div');
        panel.className = 'view-panel';
        panel.id = 'new-cpscl-student-reg-view';
        panel.innerHTML = `
            <div class="erp-form-card" style="max-width: 100%;">
                <div class="erp-form-header">
                    <span><i class="fa-solid fa-user-plus" style="color: #3b82f6;"></i> CPSCL - Student Registration</span>
                </div>
                
                <!-- এই ফ্রেশ কন্টেইনারে আমাদের নতুন সব কাজ ধাপে ধাপে হবে -->
                <div id="newCPSCLRegistrationAppArea" style="min-height: 350px; padding: 25px 0;">
                    <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 40px; text-align: center;">
                        <div style="width: 60px; height: 60px; background: #eff6ff; color: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto 15px auto;">
                            <i class="fa-solid fa-user-plus"></i>
                        </div>
                        <h2 style="font-size: 1.3rem; color: #1e293b; margin-bottom: 8px;">নতুন CPSCL মডিউল প্রস্তুত</h2>
                        <p style="color: #64748b; font-size: 0.95rem; max-width: 500px; margin: 0 auto;">
                            এটি সম্পূর্ণ আলাদা ও সুরক্ষিত একটি সেকশন। পুরনো কোনো কোডে এর কোনো প্রভাব নেই। আপনার পরবর্তী নির্দেশনার অপেক্ষায়...
                        </p>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.appendChild(panel);
    }

    // ৫. সাব-মেনু ক্লিকে শুধু নতুন ভিউটি ওপেন হওয়ার ফাংশন
    window.openNewStudentRegistrationView = function () {
        // অন্যান্য সব ভিউ প্যানেল হাইড করা
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        
        // শুধু নতুন প্যানেলটি শো করা
        const panel = document.getElementById('new-cpscl-student-reg-view');
        if (panel) panel.classList.add('active');

        // সব মেনু আইটেম আন-সিলেক্ট করে শুধু নতুন CPSCL হাইলাইট করা
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        const parent = document.getElementById('new-cpscl-parent-menu');
        if (parent) parent.classList.add('active');

        // টপবার টাইটেল আপডেট
        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "CPSCL - Student Registration";
    };

    // ৬. লোডার এক্সিকিউশন
    function init() {
        injectStyles();
        injectNewCPSCLMenu();
        injectNewCPSCLView();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
