/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Student Registration (Sidebar + 1:1 Screen Layout)
   Path: cpscl/student_registration.js
   ========================================================================== */

(function () {
    console.log("Initializing CPSCL Student Registration Module...");

    // ১. সাইডবার ও পেজের সমস্ত সিএসএস (CSS)
    function injectFullStyles() {
        if (document.getElementById('cpscl-full-bundle-style')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-full-bundle-style';
        style.innerHTML = `
            /* --- সাইডবার স্টাইল (Trust Edu ERP Style) --- */
            .trust-section-label {
                font-size: 11px !important;
                font-weight: 800 !important;
                color: #8c98a4 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.8px !important;
                padding: 18px 18px 6px 18px !important;
                display: block;
            }
            .trust-module-wrapper {
                margin: 4px 0 !important;
                list-style: none !important;
                position: relative;
                transition: all 0.25s ease;
            }
            .trust-module-wrapper.expanded {
                border-left: 4px solid #2563eb !important; /* সলিড নীল রেল */
            }
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
                background-color: #e5e7eb !important; /* হালকা অ্যাশ হেডার */
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
            .trust-sub-indicator {
                width: 3.5px !important;
                height: 18px !important;
                background-color: transparent !important;
                border-radius: 2px !important;
                margin-right: 12px !important;
                display: inline-block !important;
                transition: background-color 0.2s ease !important;
            }
            .trust-sub-link:hover {
                color: #2563eb !important;
                background-color: #f1f5f9 !important;
            }
            .trust-sub-link:hover .trust-sub-indicator {
                background-color: #2563eb !important;
            }
            .trust-sub-link.active {
                color: #2563eb !important;
                font-weight: 600 !important;
            }
            .trust-sub-link.active .trust-sub-indicator {
                background-color: #2563eb !important;
            }

            /* --- ১:১ স্টুডেন্ট লিস্ট স্ক্রিন স্টাইল --- */
            .stu-page-wrapper {
                padding: 10px 5px;
                font-family: 'Plus Jakarta Sans', sans-serif;
            }
            .stu-top-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                flex-wrap: wrap;
                gap: 15px;
            }
            .stu-title-area h2 {
                font-size: 1.45rem;
                font-weight: 800;
                color: #1e293b;
                margin-bottom: 4px;
            }
            .stu-breadcrumb {
                font-size: 0.82rem;
                color: #64748b;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .stu-breadcrumb a {
                color: #2563eb;
                text-decoration: none;
                font-weight: 600;
            }
            .stu-top-actions {
                display: flex;
                gap: 10px;
            }
            .btn-stu-pill {
                padding: 9px 20px;
                border-radius: 50px;
                font-size: 0.88rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            .btn-stu-primary {
                background-color: #2563eb;
                color: #ffffff;
                border: 1.5px solid #2563eb;
            }
            .btn-stu-primary:hover { background-color: #1d4ed8; }
            .btn-stu-outline {
                background-color: #ffffff;
                color: #2563eb;
                border: 1.5px solid #60a5fa;
            }
            .btn-stu-outline:hover { background-color: #eff6ff; }
            .stu-main-card {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0,0,0,0.02);
            }
            .stu-ribbon-bar {
                background: linear-gradient(90deg, #0ea5e9, #0284c7);
                color: #ffffff;
                padding: 12px 20px;
                font-weight: 700;
                font-size: 1.05rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .stu-toolbar {
                padding: 15px 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                border-bottom: 1px solid #f1f5f9;
            }
            .btn-tool {
                padding: 6px 16px;
                border-radius: 50px;
                font-size: 0.82rem;
                font-weight: 600;
                border: 1px solid #93c5fd;
                background: #ffffff;
                color: #2563eb;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .btn-tool:hover { background: #eff6ff; }
            .btn-tool-active {
                background: #06b6d4 !important;
                color: #ffffff !important;
                border-color: #06b6d4 !important;
            }
            .btn-tool-orange {
                border-color: #f59e0b !important;
                color: #d97706 !important;
            }
            .stu-filter-grid {
                padding: 20px;
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 15px;
                background: #ffffff;
                border-bottom: 1px solid #f1f5f9;
            }
            @media (max-width: 992px) {
                .stu-filter-grid { grid-template-columns: repeat(2, 1fr); }
            }
            @media (max-width: 650px) {
                .stu-filter-grid { grid-template-columns: 1fr; }
            }
            .stu-filter-box {
                background: #ffffff;
                border: 1.5px solid #e2e8f0;
                border-radius: 12px;
                padding: 8px 14px;
                transition: border-color 0.2s;
            }
            .stu-filter-box:focus-within {
                border-color: #2563eb;
            }
            .stu-filter-box label {
                display: block;
                font-size: 0.72rem;
                font-weight: 700;
                color: #64748b;
                margin-bottom: 2px;
            }
            .stu-filter-box select {
                width: 100%;
                border: none;
                background: transparent;
                font-size: 0.9rem;
                font-weight: 600;
                color: #1e293b;
                outline: none;
                cursor: pointer;
            }
            .stu-table-header {
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.85rem;
                color: #64748b;
                flex-wrap: wrap;
                gap: 12px;
            }
            .stu-search-input {
                padding: 6px 12px;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                font-size: 0.85rem;
                outline: none;
            }
            .stu-table {
                width: 100%;
                border-collapse: collapse;
                text-align: left;
            }
            .stu-table th {
                background: #f8fafc;
                padding: 12px 18px;
                font-size: 0.78rem;
                font-weight: 800;
                color: #475569;
                text-transform: uppercase;
                border-bottom: 1.5px solid #e2e8f0;
            }
            .stu-table td {
                padding: 14px 18px;
                font-size: 0.88rem;
                color: #1e293b;
                border-bottom: 1px solid #f1f5f9;
            }
        `;
        document.head.appendChild(style);
    }

    // ২. ফিল্টার অপশন রিডার (সুপার অ্যাডমিনের সেটআপ থেকে পড়বে)
    function getDynamicFilterData() {
        const defaultFilters = {
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
        const saved = localStorage.getItem('cpscl_filter_settings');
        return saved ? JSON.parse(saved) : defaultFilters;
    }

    // ৩. সাইডবারে CPSCL মডিউল তৈরি (পুনরুদ্ধার করা হলো)
    function injectTrustSidebar() {
        const menuList = document.querySelector('.sidebar .menu-list');
        if (!menuList) return;

        // আগের নোড থাকলে মুছে নতুন করে পরিষ্কার ইনজেক্ট করা
        const oldLabel = document.querySelector('.trust-section-label');
        if (oldLabel) oldLabel.remove();
        const oldRoot = document.getElementById('trust-cpscl-module-root');
        if (oldRoot) oldRoot.remove();

        // সেকশন হেডার: শুধুই "CPSCL"
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'trust-section-label';
        sectionHeader.innerText = 'CPSCL';

        // মডিউল আইটেম
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

    window.toggleTrustModule = function () {
        const wrapper = document.getElementById('trust-cpscl-module-root');
        if (wrapper) wrapper.classList.toggle('expanded');
    };

    window.switchTrustSubTab = function (element, tabKey) {
        document.querySelectorAll('.trust-sub-link').forEach(link => link.classList.remove('active'));
        if (element) element.classList.add('active');

        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        const view = document.getElementById('trust-cpscl-main-view');
        if (view) view.classList.add('active');

        const topTitle = document.getElementById('top-title');
        if (topTitle) topTitle.innerText = "CPSCL - Student Registration";
    };

    // ৪. ডান পাশের মূল কন্টেন্ট প্যানেল ও ১:১ স্ক্রিন
    function injectTrustViewPanel() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper) return;

        let panel = document.getElementById('trust-cpscl-main-view');
        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'view-panel active';
            panel.id = 'trust-cpscl-main-view';
            mainWrapper.appendChild(panel);
        }

        const filters = getDynamicFilterData();
        const buildOptions = (arr, allLabel) => {
            let html = `<option value="">${allLabel}...</option>`;
            arr.forEach(item => html += `<option value="${item}">${item}</option>`);
            return html;
        };

        panel.innerHTML = `
            <div class="stu-page-wrapper">
                <!-- টপ হেডার ও ব্রেডক্রাম্ব -->
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
                        <button class="btn-stu-pill btn-stu-primary"><i class="fa-solid fa-circle-plus"></i> Create Student</button>
                        <button class="btn-stu-pill btn-stu-outline"><i class="fa-solid fa-circle-plus"></i> Create Student (Manual ID)</button>
                    </div>
                </div>

                <!-- মূল কন্টেইনার কার্ড -->
                <div class="stu-main-card">
                    <div class="stu-ribbon-bar">
                        <i class="fa-solid fa-database"></i> <span>Student List</span>
                    </div>

                    <!-- অ্যাকশন টুলবার -->
                    <div class="stu-toolbar">
                        <button class="btn-tool"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn-tool"><i class="fa-solid fa-sliders"></i> Fee & Admission Setup</button>
                        <button class="btn-tool btn-tool-active"><i class="fa-solid fa-circle-info"></i> Detail</button>
                        <button class="btn-tool"><i class="fa-solid fa-gauge-high"></i> Dashboard</button>
                        <button class="btn-tool"><i class="fa-solid fa-shield-halved"></i> App Pin Action <i class="fa-solid fa-caret-down"></i></button>
                        <button class="btn-tool"><i class="fa-solid fa-print"></i> Print <i class="fa-solid fa-caret-down"></i></button>
                        <button class="btn-tool btn-tool-orange"><i class="fa-solid fa-user-pen"></i> Manage Student <i class="fa-solid fa-caret-down"></i></button>
                    </div>

                    <!-- ৯টি ডাইনামিক ফিল্টার বক্স (ছবি অনুযায়ী অবিকল) -->
                    <div class="stu-filter-grid">
                        <div class="stu-filter-box">
                            <label>Academic Year *</label>
                            <select id="dynFilterYear">${buildOptions(filters.academicYears, 'All')}</select>
                        </div>
                        <div class="stu-filter-box">
                            <label>Shift *</label>
                            <select id="dynFilterShift">${buildOptions(filters.shifts, 'All')}</select>
                        </div>
                        <div class="stu-filter-box">
                            <label>Education Version</label>
                            <select id="dynFilterVersion">${buildOptions(filters.versions, 'All')}</select>
                        </div>
                        <div class="stu-filter-box">
                            <label>Class Name *</label>
                            <select id="dynFilterClass">${buildOptions(filters.classes, 'All Class')}</select>
                        </div>
                        <div class="stu-filter-box">
                            <label>Section/Batch *</label>
                            <select id="dynFilterSection">${buildOptions(filters.sections, 'All Section/Batch')}</select>
                        </div>
                        <div class="stu-filter-box">
                            <label>Group</label>
                            <select id="dynFilterGroup">${buildOptions(filters.groups, 'General')}</select>
                        </div>
                        <div class="stu-filter-box">
                            <label>Student's Category</label>
                            <select id="dynFilterCategory">${buildOptions(filters.categories, 'General')}</select>
                        </div>
                        <div class="stu-filter-box">
                            <label>Student House *</label>
                            <select id="dynFilterHouse">${buildOptions(filters.houses, 'All')}</select>
                        </div>
                        <div class="stu-filter-box">
                            <label>Student Type *</label>
                            <select id="dynFilterType">${buildOptions(filters.types, 'Active')}</select>
                        </div>
                    </div>

                    <!-- টেবিল হেডার বার -->
                    <div class="stu-table-header">
                        <div>Showing 1 to 25 of 1,843 entries</div>
                        <div>Search: <input type="text" class="stu-search-input" placeholder="Search student..."></div>
                    </div>

                    <!-- ডাটা টেবিল -->
                    <div style="overflow-x: auto;">
                        <table class="stu-table">
                            <thead>
                                <tr>
                                    <th>SERIAL</th>
                                    <th>STD-ID</th>
                                    <th>NAME</th>
                                    <th>ROLL NO</th>
                                    <th>FATHER'S NAME</th>
                                    <th>MOTHER'S NAME</th>
                                    <th>STATUS</th>
                                </tr>
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
    }

    window.refreshStudentFilterDropdowns = function () {
        injectTrustViewPanel();
    };

    function init() {
        injectFullStyles();
        injectTrustSidebar();
        injectTrustViewPanel();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
