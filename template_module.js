/**
 * ==========================================================================
 * EDUCATION & DIGITAL SERVICES -> TEMPLATE SUBMODULE
 * Mousumi Computer ERP Extension
 * ==========================================================================
 */

(function () {
    function injectTemplateSubMenu() {
        // ১. 'শিক্ষা ও ডিজিটাল সেবা' প্যারেন্ট মেনুটি স্বয়ংক্রিয়ভাবে খুঁজে বের করা
        const menuItems = document.querySelectorAll('.menu-item');
        let eduParentMenu = null;
        let submenuList = null;

        menuItems.forEach(item => {
            if (item.textContent.includes('শিক্ষা ও ডিজিটাল সেবা')) {
                eduParentMenu = item;
                submenuList = item.querySelector('.submenu-list');
            }
        });

        // ২. যদি মেনু পাওয়া যায় এবং Template আগে থেকে না থাকে, তাহলে ইনজেক্ট করা
        if (submenuList && !document.getElementById('sub-edu-template')) {
            const templateSubItem = document.createElement('li');
            templateSubItem.className = 'submenu-item';
            templateSubItem.id = 'sub-edu-template';
            templateSubItem.innerHTML = `
                <a onclick="openTemplateSection()" style="cursor: pointer;">
                    <i class="fa-solid fa-angle-right"></i> 
                    <span>Template</span>
                </a>
            `;
            submenuList.appendChild(templateSubItem);
        }

        // ৩. ড্যাশবোর্ডে "Template" ভিউ প্যানেল তৈরি ও যুক্ত করা
        const mainWrapper = document.querySelector('.main-wrapper');
        if (mainWrapper && !document.getElementById('template-view')) {
            const templatePanel = document.createElement('div');
            templatePanel.className = 'view-panel';
            templatePanel.id = 'template-view';
            templatePanel.innerHTML = `
                <div class="erp-form-card" style="max-width: 100%; border-radius: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                    <div class="erp-form-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px;">
                        <span style="font-family: 'Tiro Bangla', serif; font-size: 1.15rem; font-weight: 700; color: #1e293b;">
                            <i class="fa-solid fa-shapes" style="color: #4f46e5; margin-right: 8px;"></i> Template Management
                        </span>
                        <span style="font-size: 0.85rem; color: #64748b;">শিক্ষা ও ডিজিটাল সেবা</span>
                    </div>

                    <!-- কন্টেন্ট এরিয়া -->
                    <div id="templateContainer" style="padding: 30px 20px; text-align: center;">
                        <div style="width: 70px; height: 70px; background: #eef2ff; color: #4f46e5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 15px;">
                            <i class="fa-solid fa-file-code"></i>
                        </div>
                        <h3 style="font-family: 'Tiro Bangla', serif; font-size: 1.3rem; color: #1e293b; font-weight: 800; margin-bottom: 8px;">Template সেকশন প্রস্তুত</h3>
                        <p style="font-family: 'Tiro Bangla', serif; font-size: 0.95rem; color: #64748b; max-width: 500px; margin: 0 auto 20px auto;">
                            এখানে আপনার প্রয়োজনীয় নতুন ফরম, রশিদ টেমপ্লেট বা ডেটা ম্যানেজমেন্ট ডিজাইন যুক্ত করা যাবে।
                        </p>
                    </div>
                </div>
            `;
            mainWrapper.appendChild(templatePanel);
        }
    }

    // ৪. টেমপ্লেট ভিউ ওপেন করার ফাংশন
    window.openTemplateSection = function () {
        // সব ভিউ প্যানেল এবং মেনু ডিঅ্যাক্টিভ করা
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.submenu-item').forEach(i => i.classList.remove('active'));

        // টেমপ্লেট প্যানেল অ্যাক্টিভ করা
        const tPanel = document.getElementById('template-view');
        if (tPanel) tPanel.classList.add('active');

        // সাবমেনু সিলেক্টেড স্টাইল
        const subItem = document.getElementById('sub-edu-template');
        if (subItem) subItem.classList.add('active');

        // টপ বার টাইটেল আপডেট
        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "TEMPLATE";
    };

    // DOM সম্পূর্ণ লোড হওয়ার পর এবং কিছুটা সময় বিরতি দিয়ে (অন্যান্য স্ক্রিপ্ট লোড হওয়া নিশ্চিত করতে) রান করা
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => setTimeout(injectTemplateSubMenu, 300));
    } else {
        setTimeout(injectTemplateSubMenu, 300);
    }
})();
