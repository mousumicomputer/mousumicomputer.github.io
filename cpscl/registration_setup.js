/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Registration Setup Engine
   Path: cpscl/registration_setup.js
   ========================================================================== */

(function () {
    console.log("Loading Registration Setup View Engine...");

    const DEFAULT_MASTER_CONFIG = {
        topButtons: [
            { id: 'btn_create', label: 'Create Student', icon: 'fa-circle-plus', type: 'primary', enabled: true },
            { id: 'btn_create_manual', label: 'Create Student (Manual ID)', icon: 'fa-circle-plus', type: 'outline', enabled: true }
        ],
        toolbarButtons: [
            { id: 'tb_edit', label: 'Edit', icon: 'fa-pen', active: false, hasDropdown: false, colorClass: '', enabled: true },
            { id: 'tb_fee', label: 'Fee & Admission Setup', icon: 'fa-sliders', active: false, hasDropdown: false, colorClass: '', enabled: true },
            { id: 'tb_detail', label: 'Detail', icon: 'fa-circle-info', active: true, hasDropdown: false, colorClass: 'btn-tool-active', enabled: true },
            { id: 'tb_dash', label: 'Dashboard', icon: 'fa-gauge-high', active: false, hasDropdown: false, colorClass: '', enabled: true },
            { id: 'tb_app_pin', label: 'App Pin Action', icon: 'fa-shield-halved', active: false, hasDropdown: true, colorClass: '', enabled: true },
            { id: 'tb_print', label: 'Print', icon: 'fa-print', active: false, hasDropdown: true, colorClass: '', enabled: true },
            { id: 'tb_manage', label: 'Manage Student', icon: 'fa-user-pen', active: false, hasDropdown: true, colorClass: 'btn-tool-orange', enabled: true }
        ],
        filterBoxes: [
            { id: 'academic_year', label: 'Academic Year *', placeholder: 'All', options: ['2026', '2025', '2024'], enabled: true },
            { id: 'shift', label: 'Shift *', placeholder: 'All', options: ['Morning', 'Day'], enabled: true },
            { id: 'version', label: 'Education Version', placeholder: 'All', options: ['Bangla Version', 'English Version'], enabled: true },
            { id: 'class_name', label: 'Class Name *', placeholder: 'All Class', options: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'HSC 1st Year', 'HSC 2nd Year'], enabled: true },
            { id: 'section', label: 'Section/Batch *', placeholder: 'All Section/Batch', options: ['Section A', 'Section B', 'Padma', 'Meghna', 'Jamuna'], enabled: true },
            { id: 'group', label: 'Group', placeholder: 'General', options: ['General', 'Science', 'Business Studies', 'Humanities'], enabled: true },
            { id: 'category', label: "Student's Category", placeholder: 'General', options: ['General', 'Defence', "Teacher's Child"], enabled: true },
            { id: 'house', label: 'Student House *', placeholder: 'All', options: ['House 1', 'House 2', 'House 3'], enabled: true },
            { id: 'type', label: 'Student Type *', placeholder: 'Active', options: ['Active', 'Inactive', 'TC'], enabled: true }
        ],
        tableColumns: [
            { id: 'col_serial', label: 'SERIAL', enabled: true },
            { id: 'col_stdid', label: 'STD-ID', enabled: true },
            { id: 'col_name', label: 'NAME', enabled: true },
            { id: 'col_roll', label: 'ROLL NO', enabled: true },
            { id: 'col_father', label: "FATHER'S NAME", enabled: true },
            { id: 'col_mother', label: "MOTHER'S NAME", enabled: true },
            { id: 'col_status', label: 'STATUS', enabled: true }
        ]
    };

    window.getCPSCLMasterConfig = function () {
        const saved = localStorage.getItem('cpscl_superadmin_master_config');
        return saved ? JSON.parse(saved) : DEFAULT_MASTER_CONFIG;
    };

    function saveMasterConfig(cfg) {
        localStorage.setItem('cpscl_superadmin_master_config', JSON.stringify(cfg));
        if (typeof window.renderDynamicStudentScreen === 'function') {
            window.renderDynamicStudentScreen();
        }
    }

    // সেটআপ ভিউ প্যানেল তৈরি
    function injectSetupView() {
        const mainWrapper = document.querySelector('.main-wrapper');
        if (!mainWrapper || document.getElementById('cpscl-reg-setup-view')) return;

        const panel = document.createElement('div');
        panel.className = 'view-panel';
        panel.id = 'cpscl-reg-setup-view';
        panel.innerHTML = `
            <div class="stu-page-wrapper">
                <div class="stu-top-header">
                    <div class="stu-title-area">
                        <h2>Registration Master Configuration</h2>
                        <div class="stu-breadcrumb">
                            <span>CPSCL</span> <i class="fa-solid fa-chevron-right" style="font-size: 9px;"></i>
                            <span>Super Admin Control Center</span>
                        </div>
                    </div>
                    <div>
                        <button onclick="resetToDefaultConfig()" style="background:#ef4444; color:#fff; border:none; padding:8px 18px; border-radius:8px; font-weight:700; cursor:pointer;">
                            <i class="fa-solid fa-rotate-left"></i> Reset to Default
                        </button>
                    </div>
                </div>

                <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:2px solid #e2e8f0; padding-bottom:10px; overflow-x:auto;">
                    <button class="setup-tab-btn active" onclick="switchSetupTab('tab-filters', this)">
                        <i class="fa-solid fa-filter"></i> ফিল্টার বক্সসমূহ (${9})
                    </button>
                    <button class="setup-tab-btn" onclick="switchSetupTab('tab-top-buttons', this)">
                        <i class="fa-solid fa-toggle-on"></i> টপ অ্যাকশন বাটনসমূহ
                    </button>
                    <button class="setup-tab-btn" onclick="switchSetupTab('tab-toolbar-buttons', this)">
                        <i class="fa-solid fa-screwdriver-wrench"></i> টুলবার বাটনসমূহ
                    </button>
                    <button class="setup-tab-btn" onclick="switchSetupTab('tab-columns', this)">
                        <i class="fa-solid fa-table-columns"></i> টেবিল কলামসমূহ
                    </button>
                </div>

                <div class="stu-main-card" style="padding:25px;">
                    <div id="tab-filters" class="setup-tab-panel">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h3 style="font-size:1.1rem; color:#1e293b;">ফিল্টার বক্স ম্যানেজমেন্ট ও অপশন এডিটর</h3>
                            <button onclick="openAddNewFilterBoxModal()" style="background:#2563eb; color:#fff; border:none; padding:8px 16px; border-radius:8px; font-weight:700; cursor:pointer;">
                                <i class="fa-solid fa-plus"></i> নতুন ফিল্টার বক্স যুক্ত করুন
                            </button>
                        </div>
                        <div id="adminFilterBoxesList" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;"></div>
                    </div>

                    <div id="tab-top-buttons" class="setup-tab-panel" style="display:none;">
                        <h3 style="font-size:1.1rem; color:#1e293b; margin-bottom:15px;">টপ বাটনসমূহ অন/অফ বা লেবেল পরিবর্তন</h3>
                        <div id="adminTopButtonsList" style="display:flex; flex-direction:column; gap:12px;"></div>
                    </div>

                    <div id="tab-toolbar-buttons" class="setup-tab-panel" style="display:none;">
                        <h3 style="font-size:1.1rem; color:#1e293b; margin-bottom:15px;">টুলবার অ্যাকশন বাটনসমূহ অন/অফ</h3>
                        <div id="adminToolbarButtonsList" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:15px;"></div>
                    </div>

                    <div id="tab-columns" class="setup-tab-panel" style="display:none;">
                        <h3 style="font-size:1.1rem; color:#1e293b; margin-bottom:15px;">স্টুডেন্ট টেবিলের কলাম কন্ট্রোল</h3>
                        <div id="adminTableColumnsList" style="display:flex; flex-wrap:wrap; gap:15px;"></div>
                    </div>
                </div>
            </div>
        `;
        mainWrapper.appendChild(panel);
    }

    window.switchSetupTab = function (tabId, btn) {
        document.querySelectorAll('.setup-tab-panel').forEach(p => p.style.display = 'none');
        document.querySelectorAll('.setup-tab-btn').forEach(b => b.classList.remove('active'));
        const target = document.getElementById(tabId);
        if (target) target.style.display = 'block';
        if (btn) btn.classList.add('active');
    };

    window.renderAdminSetupViews = function () {
        const cfg = window.getCPSCLMasterConfig();

        // ফিল্টার বক্স
        const filterCont = document.getElementById('adminFilterBoxesList');
        if (filterCont) {
            filterCont.innerHTML = '';
            cfg.filterBoxes.forEach((box, bIdx) => {
                const card = document.createElement('div');
                card.style.cssText = 'background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:12px; padding:18px;';
                
                let tags = box.options.map((opt, oIdx) => `
                    <span style="background:#fff; border:1px solid #cbd5e1; padding:3px 8px; border-radius:6px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; margin:3px;">
                        ${opt}
                        <i class="fa-solid fa-xmark" style="color:#ef4444; cursor:pointer;" onclick="removeFilterOption(${bIdx}, ${oIdx})"></i>
                    </span>
                `).join('');

                card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <input type="checkbox" ${box.enabled ? 'checked' : ''} onchange="toggleFilterBox(${bIdx}, this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color:#2563eb;">
                            <strong style="color:#1e293b; font-size:0.95rem;">${box.label}</strong>
                        </div>
                        <span style="font-size:0.75rem; background:${box.enabled ? '#dcfce7' : '#fee2e2'}; color:${box.enabled ? '#15803d' : '#991b1b'}; padding:2px 8px; border-radius:12px; font-weight:800;">
                            ${box.enabled ? 'সক্রিয়' : 'বন্ধ'}
                        </span>
                    </div>

                    <div style="display:flex; gap:6px; margin-bottom:12px;">
                        <input type="text" id="add_opt_input_${bIdx}" placeholder="নতুন অপশন লিখুন..." style="flex:1; padding:7px 10px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:0.85rem; outline:none;">
                        <button onclick="addFilterOption(${bIdx})" style="background:#2563eb; color:#fff; border:none; padding:7px 14px; border-radius:6px; font-weight:700; cursor:pointer;">
                            Add
                        </button>
                    </div>

                    <div style="min-height:55px; max-height:140px; overflow-y:auto; background:#fff; padding:8px; border-radius:8px; border:1px solid #e2e8f0;">
                        ${tags || '<span style="color:#94a3b8; font-size:0.8rem;">কোনো অপশন নেই</span>'}
                    </div>
                `;
                filterCont.appendChild(card);
            });
        }

        // টপ বাটন
        const topCont = document.getElementById('adminTopButtonsList');
        if (topCont) {
            topCont.innerHTML = '';
            cfg.topButtons.forEach((btn, idx) => {
                const row = document.createElement('div');
                row.style.cssText = 'background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:12px 18px; display:flex; justify-content:space-between; align-items:center;';
                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px;">
                        <input type="checkbox" ${btn.enabled ? 'checked' : ''} onchange="toggleTopBtn(${idx}, this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color:#2563eb;">
                        <strong style="color:#1e293b;"><i class="fa-solid ${btn.icon}"></i> ${btn.label}</strong>
                    </div>
                    <div>
                        <input type="text" value="${btn.label}" onchange="updateTopBtnLabel(${idx}, this.value)" style="padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.85rem; font-weight:600;">
                    </div>
                `;
                topCont.appendChild(row);
            });
        }

        // টুলবার বাটন
        const toolCont = document.getElementById('adminToolbarButtonsList');
        if (toolCont) {
            toolCont.innerHTML = '';
            cfg.toolbarButtons.forEach((btn, idx) => {
                const box = document.createElement('div');
                box.style.cssText = 'background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:12px; display:flex; align-items:center; justify-content:space-between;';
                box.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" ${btn.enabled ? 'checked' : ''} onchange="toggleToolbarBtn(${idx}, this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color:#2563eb;">
                        <span style="font-weight:700; color:#334155; font-size:0.88rem;"><i class="fa-solid ${btn.icon}"></i> ${btn.label}</span>
                    </div>
                `;
                toolCont.appendChild(box);
            });
        }

        // টেবিল কলাম
        const colCont = document.getElementById('adminTableColumnsList');
        if (colCont) {
            colCont.innerHTML = '';
            cfg.tableColumns.forEach((col, idx) => {
                const item = document.createElement('label');
                item.style.cssText = 'background:#f8fafc; border:1px solid #cbd5e1; padding:8px 14px; border-radius:8px; display:inline-flex; align-items:center; gap:8px; font-weight:700; font-size:0.85rem; cursor:pointer;';
                item.innerHTML = `
                    <input type="checkbox" ${col.enabled ? 'checked' : ''} onchange="toggleTableCol(${idx}, this.checked)" style="width:16px; height:16px; cursor:pointer; accent-color:#2563eb;">
                    <span>${col.label}</span>
                `;
                colCont.appendChild(item);
            });
        }
    };

    window.toggleFilterBox = function (bIdx, val) {
        const cfg = window.getCPSCLMasterConfig();
        cfg.filterBoxes[bIdx].enabled = val;
        saveMasterConfig(cfg);
        window.renderAdminSetupViews();
    };

    window.addFilterOption = function (bIdx) {
        const inp = document.getElementById(`add_opt_input_${bIdx}`);
        const val = inp.value.trim();
        if (!val) return;
        const cfg = window.getCPSCLMasterConfig();
        cfg.filterBoxes[bIdx].options.push(val);
        saveMasterConfig(cfg);
        inp.value = '';
        window.renderAdminSetupViews();
    };

    window.removeFilterOption = function (bIdx, oIdx) {
        const cfg = window.getCPSCLMasterConfig();
        cfg.filterBoxes[bIdx].options.splice(oIdx, 1);
        saveMasterConfig(cfg);
        window.renderAdminSetupViews();
    };

    window.openAddNewFilterBoxModal = function () {
        const label = prompt("নতুন ফিল্টার বক্সের নাম লিখুন:");
        if (!label || !label.trim()) return;
        const cfg = window.getCPSCLMasterConfig();
        cfg.filterBoxes.push({
            id: 'custom_' + Date.now(),
            label: label.trim(),
            placeholder: 'All',
            options: ['Option 1', 'Option 2'],
            enabled: true
        });
        saveMasterConfig(cfg);
        window.renderAdminSetupViews();
    };

    window.toggleTopBtn = function (idx, val) {
        const cfg = window.getCPSCLMasterConfig();
        cfg.topButtons[idx].enabled = val;
        saveMasterConfig(cfg);
    };

    window.updateTopBtnLabel = function (idx, val) {
        const cfg = window.getCPSCLMasterConfig();
        cfg.topButtons[idx].label = val.trim();
        saveMasterConfig(cfg);
    };

    window.toggleToolbarBtn = function (idx, val) {
        const cfg = window.getCPSCLMasterConfig();
        cfg.toolbarButtons[idx].enabled = val;
        saveMasterConfig(cfg);
    };

    window.toggleTableCol = function (idx, val) {
        const cfg = window.getCPSCLMasterConfig();
        cfg.tableColumns[idx].enabled = val;
        saveMasterConfig(cfg);
    };

    window.resetToDefaultConfig = function () {
        if (confirm("সব সেটিংস কি ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?")) {
            localStorage.removeItem('cpscl_superadmin_master_config');
            window.renderAdminSetupViews();
            if (typeof window.renderDynamicStudentScreen === 'function') {
                window.renderDynamicStudentScreen();
            }
        }
    };

    function init() {
        injectSetupView();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 250);
    }
})();
