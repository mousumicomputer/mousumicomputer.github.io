/**
 * CPSCL UI Patch & Minimal Dashboard Extension
 * মূল কোডে হাত না দিয়ে ড্যাশবোর্ড, লোগো রেশিও ও রিফ্রেশ লজিক নিয়ন্ত্রণ
 */

(function () {
    const LOGO_URL = "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg-795xmOcuKYH8wjija8JrA-qVjfOp_4KieeZ1pOQJaqX2uXsqGLMo09AXsGGsfGjH9LpK5fPlUNGbebFguiAzPC_YvbRXcHePj7cORQd6GMxDUg-LCeXtmNkccGI2K4Hv73PJqJkGX0Ju9N4knQuqKOAImqB6qy_WWFXpKeIaQhRgk7YbLqBLpCmL0cio/s1600/%E0%A6%95%E0%A7%8D%E0%A6%AF%E0%A6%AE%E0%A6%A8%E0%A7%8D%E0%A6%9F_%E0%A6%AA%E0%A6%BE%E0%A6%AC%E0%A6%B2%E0%A6%BF%E0%A6%95_%E0%A6%B8%E0%A7%8D%E0%A6%95%E0%A7%81%E0%A6%B2_%E0%A6%93_%E0%A6%95%E0%A6%B2%E0%A7%87%E0%A6%9C_%E0%A6%B2%E0%A6%BE%E0%A6%B2%E0%A6%AE%E0%A6%A8%E0%A6%BF%E0%A6%B0%E0%A6%B9%E0%A6%BE%E0%A6%9F%E0%A7%87%E0%A6%B0_%E0%A6%B2%E0%A7%8B%E0%A6%97%E0%A7%8B.png";

    // ================= ১. লোগো যাতে কোনোভাবেই চ্যাপ্টা না হয় (SVG Aspect-Ratio Wrapper) =================
    function applyPerfectSquareFavicon() {
        try {
            let faviconLink = document.querySelector("link[rel*='icon']");
            if (!faviconLink) {
                faviconLink = document.createElement('link');
                faviconLink.rel = 'icon';
                document.head.appendChild(faviconLink);
            }
            // SVG এর ভেতরে প্রোপোরশন ঠিক রেখে লোগো রেন্ডার করা হয়েছে
            const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <image href="${LOGO_URL}" width="100" height="100" preserveAspectRatio="xMidYMid meet"/>
            </svg>`;
            faviconLink.type = 'image/svg+xml';
            faviconLink.href = `data:image/svg+xml,${encodeURIComponent(svgIcon)}`;
        } catch (e) {
            console.warn("Favicon patch error:", e);
        }
    }

    // ================= ২. অত্যন্ত সাধারণ ও মার্জিত ড্যাশবোর্ড লেআউট =================
    function injectMinimalDashboardUI() {
        const dashContainer = document.getElementById('cpscl-dashboard-view');
        if (!dashContainer) return;

        dashContainer.innerHTML = `
            <div class="space-y-6 max-w-7xl mx-auto">
                <!-- সাধারণ টপ হেডার বার -->
                <div class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 shadow-xs">
                    <div>
                        <h2 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <i class="fa-solid fa-school text-emerald-600"></i>
                            ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ লালমনিরহাট
                        </h2>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            ক্যাম্পাস ম্যানেজমেন্ট ও প্রত্যয়নপত্র/টেস্টিমোনিয়াল পোর্টাল
                        </p>
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                        <span class="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                            <i class="fa-regular fa-calendar-check text-slate-400 mr-1.5"></i>অ্যাকাডেমিক সেশন: ২০২৪–২০২৫
                        </span>
                    </div>
                </div>

                <!-- ৪টি সাধারণ ও ক্লিন স্ট্যাটস কার্ড -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                            <span>মোট শিক্ষার্থী</span>
                            <i class="fa-solid fa-users text-slate-400 text-sm"></i>
                        </div>
                        <div class="mt-2 flex items-baseline gap-2">
                            <span id="patch-total-students" class="text-2xl font-bold text-slate-800 dark:text-white">0</span>
                            <span class="text-[11px] text-emerald-600">ডাটাবেজ যুক্ত</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                            <span>এসএসসি (SSC)</span>
                            <i class="fa-solid fa-graduation-cap text-slate-400 text-sm"></i>
                        </div>
                        <div class="mt-2 flex items-baseline gap-2">
                            <span id="patch-ssc-students" class="text-2xl font-bold text-slate-800 dark:text-white">0</span>
                            <span class="text-[11px] text-slate-400">পরীক্ষার্থী</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                            <span>এইচএসসি (HSC)</span>
                            <i class="fa-solid fa-user-graduate text-slate-400 text-sm"></i>
                        </div>
                        <div class="mt-2 flex items-baseline gap-2">
                            <span id="patch-hsc-students" class="text-2xl font-bold text-slate-800 dark:text-white">0</span>
                            <span class="text-[11px] text-slate-400">পরীক্ষার্থী</span>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
                        <div class="flex items-center justify-between text-slate-500 dark:text-slate-400 font-medium">
                            <span>সার্ভার স্ট্যাটাস</span>
                            <i class="fa-solid fa-server text-slate-400 text-sm"></i>
                        </div>
                        <div class="mt-2 flex items-baseline gap-2">
                            <span class="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> লাইভ সিঙ্ক
                            </span>
                        </div>
                    </div>
                </div>

                <!-- কুইক নেভিগেশন ও সাধারণ নির্দেশনা ব্লক -->
                <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-xs">
                    <h3 class="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-3">দ্রুত কার্যক্রম</h3>
                    <div class="flex flex-wrap gap-3 text-xs">
                        <button onclick="switchCPSCLSubSection('list')" class="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-users text-emerald-600"></i> শিক্ষার্থী তালিকা দেখুন
                        </button>
                        <button onclick="switchCPSCLSubSection('preview')" class="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition flex items-center gap-2 cursor-pointer">
                            <i class="fa-solid fa-print text-indigo-600"></i> সার্টিফিকেট প্রিন্ট প্রিভিউ
                        </button>
                        <button onclick="switchCPSCLSubSection('profile')" class="px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition flex items-center gap-2 cursor-pointer">
                            <i class="fa-regular fa-user text-sky-600"></i> প্রোফাইল বিবরণ
                        </button>
                    </div>
                </div>
            </div>
        `;
        updatePatchCounters();
    }

    // কাউন্টার আপডেট করা
    function updatePatchCounters() {
        const list = window.studentDatabase || [];
        const totalEl = document.getElementById('patch-total-students');
        const sscEl = document.getElementById('patch-ssc-students');
        const hscEl = document.getElementById('patch-hsc-students');

        if (totalEl) totalEl.innerText = list.length;
        if (sscEl) sscEl.innerText = list.filter(s => s.template === 'ssc_testimonial' || !s.template).length;
        if (hscEl) hscEl.innerText = list.filter(s => s.template === 'hsc_testimonial').length;
    }

    // ================= ৩. রিফ্রেশ দিলে সরাসরি ড্যাশবোর্ডে নিয়ে যাওয়া =================
    function setupDefaultToDashboard() {
        const isAuth = localStorage.getItem('cpscl_auth_session');
        if (isAuth && typeof window.switchCPSCLSubSection === 'function') {
            // লিস্টের পরিবর্তে ড্যাশবোর্ড ওপেন করবে
            window.switchCPSCLSubSection('dashboard');
        }
    }

    // পেজ লোড হবার সাথে সাথে এক্সিকিউট করা
    function initPatch() {
        applyPerfectSquareFavicon();
        injectMinimalDashboardUI();
        setupDefaultToDashboard();

        // ডাটাবেজ আপডেট হলে কাউন্টারও সাথে সাথে আপডেট হবে
        setInterval(updatePatchCounters, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPatch);
    } else {
        initPatch();
    }
})();
