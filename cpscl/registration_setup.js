/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Registration Setup (Super Admin Dynamic Filter Engine)
   Path: cpscl/registration_setup.js
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Registration Setup Sub-Section...");

    // ডিফল্ট ফিল্টার লিস্ট
    const DEFAULT_CONFIG = {
        academicYears: ["2026", "2025", "2024"],
        shifts: ["Morning", "Day"],
        versions: ["Bangla Version", "English Version"],
        classes: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "HSC 1st Year", "HSC 2nd Year"],
        sections: ["Section A", "Section B", "Padma", "Meghna", "Jamuna"],
        groups: ["General", "Science", "Business Studies", "Humanities"],
        categories: ["General", "Defence", "Teacher's Child"],
        houses: ["House 1", "House 2", "House 3"],
        types: ["Active", "Inactive", "TC"]
    };

    // লোকাল স্টোরেজ হেল্পার
    function getStoredConfig() {
        const data = localStorage.getItem('cpscl_filter_settings');
        return data ? JSON.parse(data) : DEFAULT_CONFIG;
    }

    function saveConfig(cfg) {
        localStorage.setItem('cpscl_filter_settings', JSON.stringify(cfg));
        // স্টুডেন্ট লিস্টের ড্রপডাউনগুলো সাথে সাথে লাইভ রিফ্রেশ করা
        if (typeof window.refreshStudentFilterDropdowns === 'function') {
            window.refreshStudentFilterDropdowns();
        }
    }

    // ১. সাইডবারে নতুন সাব-মেনু যুক্ত করা ("Registration Setup")
    function injectSubmenuItem() {
        const submenuList = document.getElementById('trust-submenu-items');
        if (!submenuList || document.getElementById('sub-link-reg-setup')) return;

        const li = document.createElement('li');
        li.innerHTML = `
            <a class="trust-sub-link" id="sub-link-reg-setup" onclick="openRegistrationSetupView(this)">
                <span class="trust-sub-indicator"></span>
                <span>Registration Setup</span>
            </a>
        `;
        submenuList.appendChild(li);
    }

    // ২. সুপার অ্যাডমিন সেটআপ প্যানেল
    function injectSetupViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('cpscl-reg-setup-view')) return;

        const panel = document.createElement('div');
        panel.className = 'view-panel';
        panel.id = 'cpscl-reg-setup-view';
        panel.innerHTML = `
            <div class="stu-page-wrapper">
                <div class="stu-top-header">
                    <div class="stu-title-area">
                        <h2>Registration & Filter Setup</h2>
                        <div class="stu-breadcrumb">
                            <span>CPSCL</span> <i class="fa-solid fa-chevron-right" style="font-size: 9px;"></i>
                            <span>Super Admin Configuration</span>
                        </div>
                    </div>
                </div>

                <div class="stu-main-card" style="padding: 25px;">
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px 20px; border-radius: 10px; margin-bottom: 25px; color: #166534; font-size: 0.92rem; font-weight: 600;">
                        <i class="fa-solid fa-shield-halved"></i> সুপার অ্যাডমিন কন্ট্রোল প্যানেল: এখানে যুক্ত করা প্রতিটি তথ্য স্বয়ংক্রিয়ভাবে "Student Registration" পেজের ফিল্টার বক্সে চলে যাবে।
                    </div>

                    <!-- ফিল্টার ক্যাটাগরি গ্রিড -->
                    <div id="setupCategoryContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <!-- ডাইনামিক ফিল্টার ম্যানেজমেন্ট কার্ড লোড হবে -->
                    </div>
                </div>
            </div>
        `;
        mainWrapper.appendChild(panel);
    }

    // কার্ড রেন্ডারার
    function renderSetupCards() {
        const container = document.getElementById('setupCategoryContainer');
        if (!container) return;
        const cfg = getStoredConfig();

        const fieldMeta = [
            { key: 'academicYears', label: 'Academic Year', icon: 'fa-calendar' },
            { key: 'shifts', label: 'Shift', icon: 'fa-clock' },
            { key: 'versions', label: 'Education Version', icon: 'fa-book' },
            { key: 'classes', label: 'Class Name', icon: 'fa-graduation-cap' },
            { key: 'sections', label: 'Section / Batch', icon: 'fa-users-rectangle' },
            { key: 'groups', label: 'Group', icon: 'fa-layer-group' },
            { key: 'categories', label: "Student's Category", icon: 'fa-tags' },
            { key: 'houses', label: 'Student House', icon: 'fa-house' },
            { key: 'types', label: 'Student Type', icon: 'fa-user-check' }
        ];

        container.innerHTML = '';

        fieldMeta.forEach(meta => {
            const list = cfg[meta.key] || [];
            const card = document.createElement('div');
            card.style.cssText = 'background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 18px;';
            
            let tagsHtml = list.map((val, idx) => `
                <span style="background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 0.82rem; font-weight: 700; color: #1e293b; display: inline-flex; align-items: center; gap: 6px; margin: 3px;">
                    ${val}
                    <i class="fa-solid fa-xmark" style="color: #ef4444; cursor: pointer;" onclick="removeSetupItem('${meta.key}', ${idx})"></i>
                </span>
            `).join('');

            card.innerHTML = `
                <div style="font-weight: 700; color: #1e293b; font-size: 1rem; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid ${meta.icon}" style="color: #2563eb;"></i> ${meta.label}
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 15px;">
                    <input type="text" id="inp_${meta.key}" placeholder="নতুন যুক্ত করুন..." style="flex:1; padding: 8px 12px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 0.88rem; outline: none;">
                    <button onclick="addSetupItem('${meta.key}')" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; cursor: pointer;">
                        <i class="fa-solid fa-plus"></i> Add
                    </button>
                </div>
                <div style="min-height: 50px; background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    ${tagsHtml || '<span style="color:#94a3b8; font-size: 0.8rem;">কোনো আইটেম নেই</span>'}
                </div>
            `;
            container.appendChild(card);
        });
    }

    // অ্যাড ও রিমুভ ফাংশন
    window.addSetupItem = function(key) {
        const inp = document.getElementById(`inp_${key}`);
        const val = inp.value.trim();
        if (!val) return;
        const cfg = getStoredConfig();
        if (!cfg[key]) cfg[key] = [];
        cfg[key].push(val);
        saveConfig(cfg);
        inp.value = '';
        renderSetupCards();
    };

    window.removeSetupItem = function(key, index) {
        const cfg = getStoredConfig();
        cfg[key].splice(index, 1);
        saveConfig(cfg);
        renderSetupCards();
    };

    // সাব-মেনু ক্লিক হ্যান্ডলার
    window.openRegistrationSetupView = function(el) {
        document.querySelectorAll('.trust-sub-link').forEach(l => l.classList.remove('active'));
        if (el) el.classList.add('active');

        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const panel = document.getElementById('cpscl-reg-setup-view');
        if (panel) panel.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "CPSCL - Registration Setup";

        renderSetupCards();
    };

    function init() {
        injectSubmenuItem();
        injectSetupViewPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
