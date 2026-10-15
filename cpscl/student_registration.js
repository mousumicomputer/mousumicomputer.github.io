/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Student Registration (Fully Dynamic 1:1 Engine)
   Path: cpscl/student_registration.js
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Dynamic Student Registration Suite...");

    function injectFullStyles() {
        if (document.getElementById('cpscl-full-bundle-style')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-full-bundle-style';
        style.innerHTML = `
            /* সাইডবার ডিজাইন */
            .trust-section-label { font-size: 11px !important; font-weight: 800 !important; color: #8c98a4 !important; text-transform: uppercase !important; letter-spacing: 0.8px !important; padding: 18px 18px 6px 18px !important; display: block; }
            .trust-module-wrapper { margin: 4px 0 !important; list-style: none !important; position: relative; transition: all 0.25s ease; }
            .trust-module-wrapper.expanded { border-left: 4px solid #2563eb !important; }
            .trust-parent-btn { display: flex !important; align-items: center !important; justify-content: space-between !important; padding: 12px 18px !important; color: #374151 !important; background-color: transparent !important; font-size: 13.5px !important; font-weight: 600 !important; cursor: pointer !important; text-decoration: none !important; transition: background 0.2s ease, color 0.2s ease; }
            .trust-module-wrapper.expanded .trust-parent-btn { background-color: #e5e7eb !important; color: #1f2937 !important; }
            .trust-parent-btn:hover { background-color: #e5e7eb !important; color: #111827 !important; }
            .trust-parent-left { display: flex !important; align-items: center !important; gap: 12px !important; }
            .trust-parent-left i { font-size: 15px !important; color: #4b5563 !important; }
            .trust-parent-btn .chevron-arrow { font-size: 11px !important; color: #6b7280 !important; transition: transform 0.3s ease; }
            .trust-module-wrapper.expanded .chevron-arrow { transform: rotate(180deg) !important; }
            .trust-submenu-box { list-style: none !important; padding: 6px 0 !important; margin: 0 !important; background-color: #f8fafc !important; display: none; flex-direction: column !important; }
            .trust-module-wrapper.expanded .trust-submenu-box { display: flex !important; }
            .trust-sub-link { display: flex !important; align-items: center !important; padding: 10px 18px 10px 24px !important; color: #4b5563 !important; font-size: 13px !important; font-weight: 500 !important; text-decoration: none !important; cursor: pointer !important; transition: all 0.2s ease !important; position: relative; }
            .trust-sub-indicator { width: 3.5px !important; height: 18px !important; background-color: transparent !important; border-radius: 2px !important; margin-right: 12px !important; display: inline-block !important; transition: background-color 0.2s ease !important; }
            .trust-sub-link:hover { color: #2563eb !important; background-color: #f1f5f9 !important; }
            .trust-sub-link:hover .trust-sub-indicator { background-color: #2563eb !important; }
            .trust-sub-link.active { color: #2563eb !important; font-weight: 600 !important; }
            .trust-sub-link.active .trust-sub-indicator { background-color: #2563eb !important; }

            /* ১:১ স্ক্রিন সিএসএস */
            .stu-page-wrapper { padding: 10px 5px; font-family: 'Plus Jakarta Sans', sans-serif; }
            .stu-top-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
            .stu-title-area h2 { font-size: 1.45rem; font-weight: 800; color: #1e293b; margin-bottom: 4px; }
            .stu-breadcrumb { font-size: 0.82rem; color: #64748b; display: flex; align-items: center; gap: 6px; }
            .stu-breadcrumb a { color: #2563eb; text-decoration: none; font-weight: 600; }
            .stu-top-actions { display: flex; gap: 10px; flex-wrap: wrap; }
            .btn-stu-pill { padding: 9px 20px; border-radius: 50px; font-size: 0.88rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s; }
            .btn-stu-primary { background-color: #2563eb; color: #ffffff; border: 1.5px solid #2563eb; }
            .btn-stu-primary:hover { background-color: #1d4ed8; }
            .btn-stu-outline { background-color: #ffffff; color: #2563eb; border: 1.5px solid #60a5fa; }
            .btn-stu-outline:hover { background-color: #eff6ff; }
            .btn-stu-success { background-color: #16a34a; color: #ffffff; border: 1.5px solid #16a34a; }
            .btn-stu-danger { background-color: #dc2626; color: #ffffff; border: 1.5px solid #dc2626; }

            .stu-main-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.02); }
            .stu-ribbon-bar { background: linear-gradient(90deg, #0ea5e9, #0284c7); color: #ffffff; padding: 12px 20px; font-weight: 700; font-size: 1.05rem; display: flex; align-items: center; gap: 10px; }
            .stu-toolbar { padding: 15px 20px; display: flex; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid #f1f5f9; }
            .btn-tool { padding: 6px 16px; border-radius: 50px; font-size: 0.82rem; font-weight: 600; border: 1px solid #93c5fd; background: #ffffff; color: #2563eb; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
            .btn-tool:hover { background: #eff6ff; }
            .btn-tool-active { background: #06b6d4 !important; color: #ffffff !important; border-color: #06b6d4 !important; }
            .btn-tool-orange { border-color: #f59e0b !important; color: #d97706 !important; }

            .stu-filter-grid { padding: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; background: #ffffff; border-bottom: 1px solid #f1f5f9; }
            @media (max-width: 992px) { .stu-filter-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 650px) { .stu-filter-grid { grid-template-columns: 1fr; } }
            .stu-filter-box { background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 8px 14px; transition: border-color 0.2s; }
            .stu-filter-box:focus-within { border-color: #2563eb; }
            .stu-filter-box label { display: block; font-size: 0.72rem; font-weight: 700; color: #64748b; margin-bottom: 2px; }
            .stu-filter-box select { width: 100%; border: none; background: transparent; font-size: 0.9rem; font-weight: 600; color: #1e293b; outline: none; cursor: pointer; }
            .stu-table-header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #64748b; flex-wrap: wrap; gap: 12px; }
            .stu-search-input { padding: 6px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem; outline: none; }
            .stu-table { width: 100%; border-collapse: collapse; text-align: left; }
            .stu-table th { background: #f8fafc; padding: 12px 18px; font-size: 0.78rem; font-weight: 800; color: #475569; text-transform: uppercase; border-bottom: 1.5px solid #e2e8f0; }
            .stu-table td { padding: 14px 18px; font-size: 0.88rem; color: #1e293b; border-bottom: 1px solid #f1f5f9; }
        `;
        document.head.appendChild(style);
    }

    function injectTrustSidebar() {
        const menuList = document.querySelector('.sidebar .menu-list');
        if (!menuList) return;

        const oldLabel = document.querySelector('.trust-section-label');
        if (oldLabel) oldLabel.remove();
        const oldRoot = document.getElementById('trust-cpscl-module-root');
        if (oldRoot) oldRoot.remove();

        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'trust-section-label';
        sectionHeader.innerText = 'CPSCL';

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
                <li>
                    <a class="trust-sub-link active" id="sub-link-student-reg" onclick="switchTrustSubTab(this, 'student-reg')">
                        <span class="trust-sub-indicator"></span>
                        <span>Student Registration</span>
                    </a>
                </li>
                <li>
                    <a class="trust-sub-link" id="sub-link-reg-setup" onclick="switchTrustSubTab(this, 'reg-setup')">
                        <span class="trust-sub-indicator"></span>
                        <span>Registration Setup</span>
                    </a>
                </li>
            </ul>
        `;

        menuList.appendChild(sectionHeader);
        menuList.appendChild(moduleLi);
    }

    window.toggleTrustModule = function () {
        const wrapper = document.getElementById('trust-cpscl-module-root');
        if (wrapper) wrapper.classList.toggle('expanded');
    };

    window.switchTrustSubTab = function (element, tabKey) {
        document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
        if (element) element.classList.add('active');

        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const topTitle = document.getElementById('top-title');

        if (tabKey === 'student-reg') {
            const view = document.getElementById('trust-cpscl-main-view');
            if (view) view.classList.add('active');
            if (topTitle) topTitle.innerText = "CPSCL - Student Registration";
            if (typeof window.renderDynamicStudentScreen === 'function') {
                window.renderDynamicStudentScreen();
            }
        } else if (tabKey === 'reg-setup') {
            const view = document.getElementById('cpscl-reg-setup-view');
            if (view) view.classList.add('active');
            if (topTitle) topTitle.innerText = "CPSCL - Registration Setup";
            if (typeof window.renderAdminSetupViews === 'function') {
                window.renderAdminSetupViews();
            }
        }
    };

    window.renderDynamicStudentScreen = function () {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        let panel = document.getElementById('trust-cpscl-main-view');
        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'view-panel active';
            panel.id = 'trust-cpscl-main-view';
            mainWrapper.appendChild(panel);
        }

        const cfg = typeof window.getCPSCLMasterConfig === 'function' ? window.getCPSCLMasterConfig() : null;
        if (!cfg) return;

        // টপ বাটনসমূহ
        let topBtnsHtml = '';
        cfg.topButtons.filter(b => b.enabled).forEach(btn => {
            let cls = 'btn-stu-outline';
            if (btn.type === 'primary') cls = 'btn-stu-primary';
            if (btn.type === 'success') cls = 'btn-stu-success';
            if (btn.type === 'danger') cls = 'btn-stu-danger';
            topBtnsHtml += `<button class="btn-stu-pill ${cls}"><i class="fa-solid ${btn.icon}"></i> ${btn.label}</button>`;
        });

        // টুলবার বাটনসমূহ
        let toolbarBtnsHtml = '';
        cfg.toolbarButtons.filter(b => b.enabled).forEach(btn => {
            const dropCaret = btn.hasDropdown ? ' <i class="fa-solid fa-caret-down"></i>' : '';
            toolbarBtnsHtml += `<button class="btn-tool ${btn.colorClass}"><i class="fa-solid ${btn.icon}"></i> ${btn.label}${dropCaret}</button>`;
        });

        // ফিল্টার বক্সসমূহ
        let filterBoxesHtml = '';
        cfg.filterBoxes.filter(b => b.enabled).forEach(box => {
            let optHtml = `<option value="">${box.placeholder}...</option>`;
            box.options.forEach(o => {
                optHtml += `<option value="${o}">${o}</option>`;
            });

            filterBoxesHtml += `
                <div class="stu-filter-box">
                    <label>${box.label}</label>
                    <select id="dyn_${box.id}">${optHtml}</select>
                </div>
            `;
        });

        // টেবিল কলামসমূহ
        let tableThsHtml = '';
        cfg.tableColumns.filter(c => c.enabled).forEach(c => {
            tableThsHtml += `<th>${c.label}</th>`;
        });

        panel.innerHTML = `
            <div class="stu-page-wrapper">
                <div class="stu-top-header">
                    <div class="stu-title-area">
                        <h2>Student List</h2>
                        <div class="stu-breadcrumb">
                            <a href="#">Home</a> <i class="fa-solid fa-chevron-right" style="font-size: 9px;"></i>
                            <a href="#">Student Information</a> <i class="fa-solid fa-chevron-right" style="font-size: 9px;"></i>
                            <span>Student List</span>
                        </div>
                    </div>
                    <div class="stu-top-actions">
                        ${topBtnsHtml}
                    </div>
                </div>

                <div class="stu-main-card">
                    <div class="stu-ribbon-bar">
                        <i class="fa-solid fa-database"></i> <span>Student List</span>
                    </div>

                    <div class="stu-toolbar">
                        ${toolbarBtnsHtml}
                    </div>

                    <div class="stu-filter-grid">
                        ${filterBoxesHtml || '<p style="color:#64748b; padding:10px;">No filter boxes currently enabled.</p>'}
                    </div>

                    <div class="stu-table-header">
                        <div>Showing 1 to 25 of 1,843 entries</div>
                        <div>Search: <input type="text" class="stu-search-input" placeholder="Search student..."></div>
                    </div>

                    <div style="overflow-x: auto;">
                        <table class="stu-table">
                            <thead>
                                <tr>${tableThsHtml}</tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1843</td>
                                    <td><strong>251012</strong></td>
                                    <td style="font-weight: 700; color: #2563eb;">RIDOWANUZZAMAN</td>
                                    <td>2132</td>
                                    <td>MD NURUZZAMAN MIAH</td>
                                    <td>RASHIDA KHATUN</td>
                                    <td><span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-weight: 800; font-size: 0.75rem;">Active</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    };

    function init() {
        injectFullStyles();
        injectTrustSidebar();
        setTimeout(window.renderDynamicStudentScreen, 250);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200);
    }
})();
