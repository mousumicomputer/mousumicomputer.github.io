/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Student Registration
   Path: cpscl/student_registration.js
   ========================================================================== */

(function () {
    console.log("CPSCL -> Student Registration Subsection Loaded.");

    // ১. ২য় ছবির মতো সাব-মেনু ইন্ডিকেটর ও টেক্সট কালার CSS
    function injectStyles() {
        if (document.getElementById('cpscl-student-reg-style')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-student-reg-style';
        style.innerHTML = `
            .cpscl-sub-indicator {
                width: 3px;
                height: 18px;
                background-color: #3b82f6; /* ২য় ছবির নীল ইন্ডিকেটর দাগ */
                border-radius: 2px;
                display: inline-block;
                margin-right: 8px;
            }
            .cpscl-sub-active-text {
                color: #3b82f6 !important;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }

    // ২. সাইডবারে CPSCL মডিউলের ভেতর "Student Registration" সাব-মেনু যুক্ত করা
    function injectSubmenu() {
        if (document.getElementById('sub-cpscl-student-reg')) return;

        const menuList = document.querySelector('.sidebar .menu-list');
        if (!menuList) return;

        // চেক করা আগে থেকে কোনো CPSCL প্যারেন্ট মেনু আছে কিনা
        let cpsclMenu = document.getElementById('menu-cpscl-parent');
        
        // যদি না থাকে, নতুন CPSCL প্যারেন্ট মেনু তৈরি করা
        if (!cpsclMenu) {
            // বিদ্যমান তালিকায় CPSCL লেখা খোঁজা
            const existingItems = Array.from(menuList.querySelectorAll('.menu-item'));
            const matched = existingItems.find(el => el.innerText.toUpperCase().includes('CPSCL'));

            if (matched) {
                cpsclMenu = matched;
            } else {
                // একদম ফ্রেশ CPSCL মেনু তৈরি
                cpsclMenu = document.createElement('li');
                cpsclMenu.className = 'menu-item';
                cpsclMenu.id = 'menu-cpscl-parent';
                cpsclMenu.innerHTML = `
                    <a onclick="toggleParentMenu('menu-cpscl-parent')" style="cursor: pointer;">
                        <span class="menu-link-inner">
                            <i class="fa-solid fa-graduation-cap"></i> 
                            <span>CPSCL</span>
                        </span>
                        <i class="fa-solid fa-chevron-down chevron-icon"></i>
                    </a>
                    <ul class="submenu-list"></ul>
                `;
                menuList.appendChild(cpsclMenu);
            }
        }

        // প্যারেন্ট মেনুর ভেতর সাব-মেনু কনটেইনার নিশ্চিত করা
        let submenuList = cpsclMenu.querySelector('.submenu-list');
        if (!submenuList) {
            submenuList = document.createElement('ul');
            submenuList.className = 'submenu-list';
            cpsclMenu.appendChild(submenuList);
        }

        // ২য় ছবির ডিজাইনে সাব-মেনু যুক্ত করা
        const subItem = document.createElement('li');
        subItem.className = 'submenu-item';
        subItem.id = 'sub-cpscl-student-reg';
        subItem.innerHTML = `
            <a onclick="openStudentRegistrationView()" style="cursor: pointer; display: flex; align-items: center;">
                <span class="cpscl-sub-indicator"></span>
                <span class="cpscl-sub-active-text">Student Registration</span>
            </a>
        `;
        submenuList.appendChild(subItem);
    }

    // ৩. ড্যাশবোর্ডে ভিউ প্যানেল (কন্টেন্ট এরিয়া) তৈরি করা
    function injectViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('cpscl-student-reg-view')) return;

        const panel = document.createElement('div');
        panel.className = 'view-panel';
        panel.id = 'cpscl-student-reg-view';
        panel.innerHTML = `
            <div class="erp-form-card" style="max-width: 100%;">
                <div class="erp-form-header">
                    <span><i class="fa-solid fa-user-plus" style="color: #3b82f6;"></i> Student Registration</span>
                </div>
                
                <!-- পরবর্তী নির্দেশনা অনুযায়ী এই কন্টেইনারে সব কাজ হবে -->
                <div id="studentRegistrationContainer" style="padding: 20px 0; min-height: 300px;">
                    <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 30px; text-align: center;">
                        <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: #3b82f6; margin-bottom: 12px;"></i>
                        <h3 style="color: #1e293b; margin-bottom: 6px;">CPSCL / Student Registration</h3>
                        <p style="color: #64748b; font-size: 0.95rem;">মডিউলের সাব-সেকশন সফলভাবে লোড হয়েছে। আপনার পরবর্তী নির্দেশনার অপেক্ষায়...</p>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.appendChild(panel);
    }

    // ৪. সাব-মেনু ক্লিকে পেজ ওপেন হওয়ার ফাংশন
    window.openStudentRegistrationView = function () {
        // সব প্যানেল হাইড করে এই সাব-সেকশন শো করা
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('cpscl-student-reg-view');
        if (panel) panel.classList.add('active');

        // মেনু সিলেকশন হাইলাইট
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        const cpsclParent = document.getElementById('menu-cpscl-parent');
        if (cpsclParent) cpsclParent.classList.add('active');

        // টপ বার টাইটেল আপডেট
        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "CPSCL - Student Registration";
    };

    // পেজ লোড হলে চালু হবে
    function init() {
        injectStyles();
        injectSubmenu();
        injectViewPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // অল্প কিছু সময় পর কল করা যাতে আগের লোড হওয়া মেনু প্রস্তুত থাকে
        setTimeout(init, 300);
    }
})();
