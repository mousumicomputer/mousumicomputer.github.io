/**
 * CPSCL UI Patch & Minimal English Dashboard
 * No clutter, instant dashboard on reload, and clean browser tab favicon
 */

(function () {
    const LOGO_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-795xmOcuKYH8wjija8JrA-qVjfOp_4KieeZ1pOQJaqX2uXsqGLMo09AXsGGsfGjH9LpK5fPlUNGbebFguiAzPC_YvbRXcHePj7cORQd6GMxDUg-LCeXtmNkccGI2K4Hv73PJqJkGX0Ju9N4knQuqKOAImqB6qy_WWFXpKeIaQhRgk7YbLqBLpCmL0cio/s1600/%E0%A6%95%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%9F%E0%A6%A8%E0%A6%AE%E0%A7%87%E0%A6%A8%E0%A7%8D%E0%A6%9F_%E0%A6%AA%E0%A6%BE%E0%A6%AC%E0%A6%B2%E0%A6%BF%E0%A6%95_%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A7%81%E0%A6%B2_%E0%A6%93_%E0%A6%95%E0%A6%B2%E0%A7%87%E0%A6%9C_%E0%A6%B2%E0%A6%BE%E0%A6%B2%E0%A6%AE%E0%A6%A8%E0%A6%BF%E0%A6%B0%E0%A6%B9%E0%A6%BE%E0%A6%9F%E0%A7%87%E0%A6%B0_%E0%A6%B2%E0%A7%8B%E0%A6%97%E0%A7%8B.png";

    // ================= ১. রিফ্রেশ দিলে শিক্ষার্থী লিস্টের ফ্লিকার সাথে সাথে বন্ধ করা =================
    function forceInstantDashboard() {
        const isAuth = localStorage.getItem('cpscl_auth_session');
        if (isAuth) {
            const listEl = document.getElementById('cpscl-list-view');
            const dashEl = document.getElementById('cpscl-dashboard-view');
            const topTitle = document.getElementById('top-title');
            
            if (listEl) listEl.classList.add('hidden');
            if (dashEl) dashEl.classList.remove('hidden');
            if (topTitle) topTitle.innerText = "CPSCL - DASHBOARD OVERVIEW";

            // সাইডবারে ড্যাশবোর্ড বাটন এক্টিভ করা
            document.querySelectorAll('#sidebar-menu button').forEach(b => {
                b.classList.remove('bg-emerald-50', 'text-emerald-700', 'dark:bg-emerald-950/40', 'dark:text-emerald-300');
            });
            const dashBtn = document.getElementById('menu-cpscl-dashboard');
            if (dashBtn) {
                dashBtn.classList.add('bg-emerald-50', 'text-emerald-700', 'dark:bg-emerald-950/40', 'dark:text-emerald-300');
            }
        }
    }
    // ফাইল লোড হওয়ার ১ম মিলিসেকেন্ডেই এক্সিকিউট হবে
    forceInstantDashboard();

    // ================= ২. ট্যাবের লোগো ফিক্স (Cross-browser Native PNG Icon) =================
    function setBrowserTabFavicon() {
        try {
            document.querySelectorAll("link[rel*='icon']").forEach(e => e.remove());

            const link = document.createElement('link');
            link.rel = 'icon';
            link.type = 'image/png';
            link.href = LOGO_URL;
            document.head.appendChild(link);

            const shortcutLink = document.createElement('link');
            shortcutLink.rel = 'shortcut icon';
            shortcutLink.type = 'image/png';
            shortcutLink.href = LOGO_URL;
            document.head.appendChild(shortcutLink);
        } catch (err) {
            console.error("Favicon set error:", err);
        }
    }

    // ================= ৩. সম্পূর্ণ ইংরেজিতে সাধারণ ও মার্জিত ড্যাশবোর্ড =================
    function injectMinimalDashboardUI() {
        const dashContainer = document.getElementById('cpscl-dashboard-view');
        if (!dashContainer) return;

        dashContainer.innerHTML = `
            <div class="space-y-5 max-w-7xl mx-auto font-sans">
                <!-- Clean Top Institutional Header -->
                <div class="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 text-lg border border-emerald-100 dark:border-emerald-800 shrink-0">
                            <i class="fa-solid fa-school"></i>
                        </div>
                        <div>
                            <h2 class="text-sm md:text-base font-bold text-slate-800 dark:text-white leading-tight">
                                Cantonment Public School and College Lalmonirhat
                            </h2>
                            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Campus Management & Academic Testimonials Portal
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                            <i class="fa-regular fa-calendar-check text-slate-400 mr-1.5"></i>Session: 2024–2026
                        </span>
                    </div>
                </div>

                <!-- 4 Simple & Clean Metric Cards -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                            <span>Total Students</span>
                            <i class="fa-solid fa-users text-slate-400"></i>
                        </div>
                        <div class="mt-2 flex items-baseline gap-2">
                            <span id="patch-total-students" class="text-2xl font-bold text-slate-800 dark:text-white">0</span>
                            <span class="text-[11px] text-emerald-600 font-semibold">Enrolled</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                            <span>SSC Candidates</span>
                            <i class="fa-solid fa-graduation-cap text-slate-400"></i>
                        </div>
                        <div class="mt-2 flex items-baseline gap-2">
                            <span id="patch-ssc-students" class="text-2xl font-bold text-slate-800 dark:text-white">0</span>
                            <span class="text-[11px] text-indigo-600 font-semibold">Testimonial</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                            <span>HSC Candidates</span>
                            <i class="fa-solid fa-user-graduate text-slate-400"></i>
                        </div>
                        <div class="mt-2 flex items-baseline gap-2">
                            <span id="patch-hsc-students" class="text-2xl font-bold text-slate-800 dark:text-white">0</span>
                            <span class="text-[11px] text-sky-600 font-semibold">Testimonial</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                            <span>Database Sync</span>
                            <i class="fa-solid fa-cloud text-slate-400"></i>
                        </div>
                        <div class="mt-2 flex items-baseline gap-2">
                            <span class="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Cloud Active
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Quick Navigation Buttons -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
                    <h3 class="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-3">Quick Actions</h3>
                    <div class="flex flex-wrap gap-3 text-xs">
                        <button onclick="switchCPSCLSubSection('list')" class="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-600 transition flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-users text-emerald-600"></i> Student Records
                        </button>
                        <button onclick="switchCPSCLSubSection('preview')" class="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-600 transition flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-print text-indigo-600"></i> Certificate Print
                        </button>
                        <button onclick="switchCPSCLSubSection('profile')" class="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-600 transition flex items-center gap-2 cursor-pointer">
                            <i class="fa-regular fa-circle-user text-sky-600"></i> My Profile
                        </button>
                    </div>
                </div>
            </div>
        `;
        updatePatchCounters();
    }

    // ================= ৪. রিয়েল স্টুডেন্ট কাউন্টার (১৮১ জন স্টুডেন্ট সঠিকভাবে পড়া) =================
    function updatePatchCounters() {
        let students = [];
        try {
            students = JSON.parse(localStorage.getItem('cpscl_students_data') || '[]');
        } catch(e) {
            students = [];
        }

        const totalEl = document.getElementById('patch-total-students');
        const sscEl = document.getElementById('patch-ssc-students');
        const hscEl = document.getElementById('patch-hsc-students');

        if (totalEl) totalEl.innerText = students.length;
        if (sscEl) sscEl.innerText = students.filter(s => s.template === 'ssc_testimonial' || !s.template).length;
        if (hscEl) hscEl.innerText = students.filter(s => s.template === 'hsc_testimonial').length;
    }

    // মূল ফাংশন ওভাররাইড করা যাতে রিফ্রেশে সবসময় Dashboard আসে
    function interceptNavigation() {
        if (typeof window.switchCPSCLSubSection === 'function') {
            const originalSwitch = window.switchCPSCLSubSection;
            let initialBoot = true;

            window.switchCPSCLSubSection = function (section) {
                if (initialBoot && section === 'list') {
                    section = 'dashboard';
                    initialBoot = false;
                }
                originalSwitch(section);
                if (section === 'dashboard') {
                    const topTitle = document.getElementById('top-title');
                    if (topTitle) topTitle.innerText = "CPSCL - DASHBOARD OVERVIEW";
                    updatePatchCounters();
                }
            };
        }
    }

    // ইনিশিয়ালাইজেশন
    function init() {
        setBrowserTabFavicon();
        interceptNavigation();
        injectMinimalDashboardUI();
        forceInstantDashboard();
        updatePatchCounters();
        setInterval(updatePatchCounters, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
