/**
 * CPSCL Module - Dynamic Sidebar & View Injection
 * মূল HTML ফাইলে হাত না দিয়েই সাইডবার এবং ভিউ প্যানেল যুক্ত করার কোড
 */

(function () {
    // পেজ এবং সাইডবার লোড হওয়া পর্যন্ত অপেক্ষা করা
    function initCPSCLModule() {
        const menuList = document.querySelector('.sidebar .menu-list');
        const mainWrapper = document.querySelector('.main-wrapper');

        if (!menuList || !mainWrapper) {
            // যদি DOM এখনো তৈরি না হয়ে থাকে, সামান্য অপেক্ষা করে আবার চেষ্টা করবে
            setTimeout(initCPSCLModule, 100);
            return;
        }

        // ডুপ্লিকেট ইনজেকশন রোধ করা
        if (document.getElementById('menu-cpscl-parent')) return;

        /* ==========================================================
           ১. সাইডবারে CPSCL মেনু আইটেম তৈরি ও যুক্ত করা
           ========================================================== */
        const cpsclMenuItem = document.createElement('li');
        cpsclMenuItem.className = 'menu-item';
        cpsclMenuItem.id = 'menu-cpscl-parent';

        cpsclMenuItem.innerHTML = `
            <a onclick="toggleParentMenu('menu-cpscl-parent')">
                <span class="menu-link-inner">
                    <i class="fa-solid fa-graduation-cap"></i> 
                    <span>CPSCL</span>
                </span>
                <i class="fa-solid fa-chevron-down chevron-icon"></i>
            </a>
            <ul class="submenu-list">
                <li class="submenu-item" id="sub-cpscl-dash">
                    <a onclick="openCPSCLView('cpscl-dashboard')">
                        <i class="fa-solid fa-angle-right"></i> <span>CPSCL Dashboard</span>
                    </a>
                </li>
                <li class="submenu-item" id="sub-cpscl-fees">
                    <a onclick="openCPSCLView('cpscl-fees')">
                        <i class="fa-solid fa-angle-right"></i> <span>Fee Collection</span>
                    </a>
                </li>
                <li class="submenu-item" id="sub-cpscl-reports">
                    <a onclick="openCPSCLView('cpscl-reports')">
                        <i class="fa-solid fa-angle-right"></i> <span>Reports</span>
                    </a>
                </li>
            </ul>
        `;

        // সেটিংস মেনুর ঠিক উপরে CPSCL মেনুটি বসানো
        const settingsMenu = document.getElementById('menu-settings-parent');
        if (settingsMenu) {
            menuList.insertBefore(cpsclMenuItem, settingsMenu);
        } else {
            menuList.appendChild(cpsclMenuItem);
        }

        /* ==========================================================
           ২. CPSCL ভিউ প্যানেল (View Panel) তৈরি ও মূল কন্টেন্টে যুক্ত করা
           ========================================================== */
        const cpsclViewPanel = document.createElement('div');
        cpsclViewPanel.className = 'view-panel';
        cpsclViewPanel.id = 'cpscl-view';

        cpsclViewPanel.innerHTML = `
            <div class="erp-form-card" style="max-width: 100%;">
                <div class="erp-form-header">
                    <span><i class="fa-solid fa-graduation-cap" style="color: #4f46e5;"></i> CPSCL Management Panel</span>
                </div>
                
                <!-- ড্যাশবোর্ড কার্ড সামারি -->
                <div class="summary-grid" style="margin-bottom: 25px;">
                    <div class="fintech-card">
                        <div class="card-icon" style="background:#eef2ff; color:#4f46e5;">
                            <i class="fa-solid fa-user-graduate"></i>
                        </div>
                        <h4>Total Students</h4>
                        <div class="amount" id="cpsclTotalStudents">0</div>
                    </div>
                    <div class="fintech-card">
                        <div class="card-icon" style="background:#dcfce7; color:#16a34a;">
                            <i class="fa-solid fa-money-check-dollar"></i>
                        </div>
                        <h4>Today Collection</h4>
                        <div class="amount" style="color:#16a34a;" id="cpsclTodayColl">৳ 0.00</div>
                    </div>
                    <div class="fintech-card">
                        <div class="card-icon" style="background:#fee2e2; color:#ef4444;">
                            <i class="fa-solid fa-hand-holding-dollar"></i>
                        </div>
                        <h4>Total Dues</h4>
                        <div class="amount" style="color:#ef4444;" id="cpsclTotalDues">৳ 0.00</div>
                    </div>
                </div>

                <div style="padding: 20px; text-align: center; background: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <i class="fa-solid fa-school" style="font-size: 3rem; color: #4f46e5; margin-bottom: 12px;"></i>
                    <h3 style="color: #1e293b; margin-bottom: 6px;">Cantonment Public School and College Lalmonirhat (CPSCL)</h3>
                    <p style="color: #64748b; font-size: 0.9rem;">Module successfully loaded and integrated dynamically.</p>
                </div>
            </div>
        `;

        mainWrapper.appendChild(cpsclViewPanel);
    }

    /* ==========================================================
       ৩. CPSCL ভিউ ওপেন করার গ্লোবাল ফাংশন
       ========================================================== */
    window.openCPSCLView = function (subTabName) {
        // সব প্যানেল ও মেনুর এক্টিভ ক্লাস সরানো
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.submenu-item').forEach(s => s.classList.remove('active'));

        // CPSCL প্যানেল চালু করা
        const panel = document.getElementById('cpscl-view');
        if (panel) panel.classList.add('active');

        // সাইডবার হাইলাইট করা
        const parentMenu = document.getElementById('menu-cpscl-parent');
        if (parentMenu) parentMenu.classList.add('active');

        // হেডার টাইটেল আপডেট করা
        const titleEl = document.getElementById('top-title');
        if (titleEl) {
            titleEl.innerText = "CPSCL - " + (subTabName || 'Dashboard').toUpperCase();
        }
    };

    // DOM প্রস্তুত হলে স্বয়ংক্রিয়ভাবে চালু হবে
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCPSCLModule);
    } else {
        initCPSCLModule();
    }
})();
