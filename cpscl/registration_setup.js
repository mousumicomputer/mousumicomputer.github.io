/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Registration Master Configuration (Super Admin Suite)
   Path: cpscl/registration_setup.js
   Language: Pure English (Corporate ERP Standard)
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Super Admin Configuration Suite (English UI)...");

    const DEFAULT_MASTER_CONFIG = {
        topButtons: [
            { id: 'btn_create', label: 'Create Student', icon: 'fa-circle-plus', type: 'primary', enabled: true },
            { id: 'btn_create_manual', label: 'Create Student (Manual ID)', icon: 'fa-circle-plus', type: 'outline', enabled: true }
        ],
        toolbarButtons: [
            { id: 'tb_edit', label: 'Edit', icon: 'fa-pen', hasDropdown: false, colorClass: '', enabled: true },
            { id: 'tb_fee', label: 'Fee & Admission Setup', icon: 'fa-sliders', hasDropdown: false, colorClass: '', enabled: true },
            { id: 'tb_detail', label: 'Detail', icon: 'fa-circle-info', hasDropdown: false, colorClass: 'btn-tool-active', enabled: true },
            { id: 'tb_dash', label: 'Dashboard', icon: 'fa-gauge-high', hasDropdown: false, colorClass: '', enabled: true },
            { id: 'tb_app_pin', label: 'App Pin Action', icon: 'fa-shield-halved', hasDropdown: true, colorClass: '', enabled: true },
            { id: 'tb_print', label: 'Print', icon: 'fa-print', hasDropdown: true, colorClass: '', enabled: true },
            { id: 'tb_manage', label: 'Manage Student', icon: 'fa-user-pen', hasDropdown: true, colorClass: 'btn-tool-orange', enabled: true }
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
        if (typeof window.showToast === 'function') {
            window.showToast("Configuration saved successfully!", "success");
        }
    }

    // ১. প্রফেশনাল স্টাইলিং ও মডাল সিএসএস
    function injectSuperAdminStyles() {
        if (document.getElementById('super-admin-modal-styles')) return;
        const st = document.createElement('style');
        st.id = 'super-admin-modal-styles';
        st.innerHTML = `
            .setup-tab-btn {
                background: #f8fafc;
                border: 1.5px solid #e2e8f0;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 0.88rem;
                font-weight: 700;
                color: #64748b;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            .setup-tab-btn.active {
                background: #2563eb;
                color: #ffffff;
                border-color: #2563eb;
                box-shadow: 0 4px 12px rgba(37,99,235,0.2);
            }
            .admin-card {
                background: #ffffff;
                border: 1.5px solid #e2e8f0;
                border-radius: 12px;
                padding: 18px;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            .admin-card:hover {
                border-color: #cbd5e1;
                box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            }
            .btn-admin-action {
                border: none;
                padding: 6px 12px;
                border-radius: 6px;
                font-weight: 700;
                font-size: 0.8rem;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }
            .btn-admin-primary { background: #2563eb; color: #fff; }
            .btn-admin-primary:hover { background: #1d4ed8; }
            .btn-admin-danger { background: #fee2e2; color: #dc2626; }
            .btn-admin-danger:hover { background: #fecaca; }

            /* --- MODERN MODAL POPUP --- */
            .cpscl-modal-overlay {
                position: fixed;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.6);
                backdrop-filter: blur(4px);
                z-index: 99999;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            .cpscl-modal-card {
                background: #ffffff;
                border-radius: 16px;
                width: 100%;
                max-width: 500px;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                overflow: hidden;
                animation: modalFadeIn 0.25s ease-out;
            }
            @keyframes modalFadeIn {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .cpscl-modal-header {
                background: #f8fafc;
                padding: 16px 22px;
                border-bottom: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .cpscl-modal-header h3 {
                font-size: 1.1rem;
                font-weight: 800;
                color: #1e293b;
                margin: 0;
            }
            .cpscl-modal-body {
                padding: 22px;
            }
            .cpscl-modal-footer {
                padding: 14px 22px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            .modal-form-group {
                margin-bottom: 15px;
            }
            .modal-form-group label {
                display: block;
                font-size: 0.82rem;
                font-weight: 700;
                color: #475569;
                margin-bottom: 6px;
            }
            .modal-form-control {
                width: 100%;
                padding: 9px 12px;
                border: 1.5px solid #cbd5e1;
                border-radius: 8px;
                font-size: 0.9rem;
                outline: none;
                box-sizing: border-box;
            }
            .modal-form-control:focus {
                border-color: #2563eb;
            }
        `;
        document.head.appendChild(st);
    }

    // ২. মডাল উইন্ডো ফ্রেমওয়ার্ক
    function injectModalFrame() {
        if (document.getElementById('cpsclMasterModal')) return;
        const modal = document.createElement('div');
        modal.className = 'cpscl-modal-overlay';
        modal.id = 'cpsclMasterModal';
        modal.innerHTML = `
            <div class="cpscl-modal-card">
                <div class="cpscl-modal-header">
                    <h3 id="cpsclModalTitle">Configuration Dialog</h3>
                    <button onclick="closeCPSCLModal()" style="border:none; background:transparent; font-size:1.2rem; cursor:pointer; color:#64748b;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="cpscl-modal-body" id="cpsclModalBody"></div>
                <div class="cpscl-modal-footer">
                    <button onclick="closeCPSCLModal()" style="padding:9px 18px; border:1px solid #cbd5e1; background:#fff; border-radius:8px; font-weight:700; cursor:pointer; color:#475569;">
                        Cancel
                    </button>
                    <button id="cpsclModalSaveBtn" style="padding:9px 20px; border:none; background:#2563eb; color:#fff; border-radius:8px; font-weight:700; cursor:pointer;">
                        Save Changes
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    window.openCPSCLModal = function (title, bodyHtml, onSave) {
        document.getElementById('cpsclModalTitle').innerText = title;
        document.getElementById('cpsclModalBody').innerHTML = bodyHtml;
        const saveBtn = document.getElementById('cpsclModalSaveBtn');
        saveBtn.onclick = onSave;
        document.getElementById('cpsclMasterModal').style.display = 'flex';
    };

    window.closeCPSCLModal = function () {
        document.getElementById('cpsclMasterModal').style.display = 'none';
    };

    // ৩. সুপার অ্যাডমিন মূল ভিউ স্ক্রিন
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
                        <button onclick="resetToDefaultConfig()" style="background:#fee2e2; color:#dc2626; border:1px solid #fca5a5; padding:8px 18px; border-radius:8px; font-weight:700; cursor:pointer;">
                            <i class="fa-solid fa-rotate-left"></i> Reset to Default
                        </button>
                    </div>
                </div>

                <!-- 4 Tabs Navigation -->
                <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:2px solid #e2e8f0; padding-bottom:10px; overflow-x:auto;">
                    <button class="setup-tab-btn active" onclick="switchSetupTab('tab-filters', this)">
                        <i class="fa-solid fa-filter"></i> Filter Boxes (${9})
                    </button>
                    <button class="setup-tab-btn" onclick="switchSetupTab('tab-top-buttons', this)">
                        <i class="fa-solid fa-toggle-on"></i> Top Action Buttons
                    </button>
                    <button class="setup-tab-btn" onclick="switchSetupTab('tab-toolbar-buttons', this)">
                        <i class="fa-solid fa-screwdriver-wrench"></i> Toolbar Action Buttons
                    </button>
                    <button class="setup-tab-btn" onclick="switchSetupTab('tab-columns', this)">
                        <i class="fa-solid fa-table-columns"></i> Table Columns
                    </button>
                </div>

                <div class="stu-main-card" style="padding:25px;">
                    <!-- TAB 1: FILTER BOXES -->
                    <div id="tab-filters" class="setup-tab-panel">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                            <div>
                                <h3 style="font-size:1.15rem; color:#1e293b; margin-bottom:3px;">Filter Boxes & Dropdown Options</h3>
                                <p style="font-size:0.85rem; color:#64748b;">Create, edit, toggle or delete filter dropdowns displayed on the Student List screen.</p>
                            </div>
                            <button onclick="openAddFilterBoxDialog()" class="btn-admin-action btn-admin-primary" style="padding:9px 18px; font-size:0.88rem;">
                                <i class="fa-solid fa-plus"></i> Add New Filter Box
                            </button>
                        </div>
                        <div id="adminFilterBoxesList" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px;"></div>
                    </div>

                    <!-- TAB 2: TOP BUTTONS -->
                    <div id="tab-top-buttons" class="setup-tab-panel" style="display:none;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                            <div>
                                <h3 style="font-size:1.15rem; color:#1e293b; margin-bottom:3px;">Top Action Buttons</h3>
                                <p style="font-size:0.85rem; color:#64748b;">Manage primary pill buttons positioned at the top right header.</p>
                            </div>
                            <button onclick="openAddTopButtonDialog()" class="btn-admin-action btn-admin-primary" style="padding:9px 18px; font-size:0.88rem;">
                                <i class="fa-solid fa-plus"></i> Add New Top Button
                            </button>
                        </div>
                        <div id="adminTopButtonsList" style="display:flex; flex-direction:column; gap:12px;"></div>
                    </div>

                    <!-- TAB 3: TOOLBAR BUTTONS -->
                    <div id="tab-toolbar-buttons" class="setup-tab-panel" style="display:none;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                            <div>
                                <h3 style="font-size:1.15rem; color:#1e293b; margin-bottom:3px;">Ribbon Toolbar Action Buttons</h3>
                                <p style="font-size:0.85rem; color:#64748b;">Configure action buttons embedded in the blue ribbon toolbar.</p>
                            </div>
                            <button onclick="openAddToolbarButtonDialog()" class="btn-admin-action btn-admin-primary" style="padding:9px 18px; font-size:0.88rem;">
                                <i class="fa-solid fa-plus"></i> Add Toolbar Button
                            </button>
                        </div>
                        <div id="adminToolbarButtonsList" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:15px;"></div>
                    </div>

                    <!-- TAB 4: TABLE COLUMNS -->
                    <div id="tab-columns" class="setup-tab-panel" style="display:none;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                            <div>
                                <h3 style="font-size:1.15rem; color:#1e293b; margin-bottom:3px;">Student Table Columns</h3>
                                <p style="font-size:0.85rem; color:#64748b;">Add custom columns, re-label or delete existing columns in the main table.</p>
                            </div>
                            <button onclick="openAddTableColumnDialog()" class="btn-admin-action btn-admin-primary" style="padding:9px 18px; font-size:0.88rem;">
                                <i class="fa-solid fa-plus"></i> Add Table Column
                            </button>
                        </div>
                        <div id="adminTableColumnsList" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:15px;"></div>
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

    // ৪. অ্যাডমিন প্যানেল রেন্ডারার
    window.renderAdminSetupViews = function () {
        const cfg = window.getCPSCLMasterConfig();

        // ১. ফিল্টার বক্সসমূহ
        const filterCont = document.getElementById('adminFilterBoxesList');
        if (filterCont) {
            filterCont.innerHTML = '';
            cfg.filterBoxes.forEach((box, bIdx) => {
                const card = document.createElement('div');
                card.className = 'admin-card';
                
                let tags = box.options.map((opt, oIdx) => `
                    <span style="background:#f1f5f9; border:1px solid #cbd5e1; padding:3px 8px; border-radius:6px; font-size:0.8rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; margin:3px; color:#1e293b;">
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
                        <div style="display:flex; align-items:center; gap:8px;">
                            <span style="font-size:0.75rem; background:${box.enabled ? '#dcfce7' : '#fee2e2'}; color:${box.enabled ? '#15803d' : '#991b1b'}; padding:2px 8px; border-radius:12px; font-weight:800;">
                                ${box.enabled ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                            <button onclick="deleteFilterBox(${bIdx})" title="Delete Filter Box" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:0.9rem;">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>

                    <div style="display:flex; gap:6px; margin-bottom:12px;">
                        <input type="text" id="add_opt_input_${bIdx}" placeholder="Enter new option..." style="flex:1; padding:7px 10px; border:1.5px solid #cbd5e1; border-radius:6px; font-size:0.85rem; outline:none;">
                        <button onclick="addFilterOption(${bIdx})" class="btn-admin-action btn-admin-primary">
                            Add
                        </button>
                    </div>

                    <div style="min-height:55px; max-height:140px; overflow-y:auto; background:#f8fafc; padding:8px; border-radius:8px; border:1px solid #e2e8f0;">
                        ${tags || '<span style="color:#94a3b8; font-size:0.8rem;">No options added yet</span>'}
                    </div>
                `;
                filterCont.appendChild(card);
            });
        }

        // ২. টপ বাটনসমূহ
        const topCont = document.getElementById('adminTopButtonsList');
        if (topCont) {
            topCont.innerHTML = '';
            cfg.topButtons.forEach((btn, idx) => {
                const row = document.createElement('div');
                row.className = 'admin-card';
                row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;';
                row.innerHTML = `
                    <div style="display:flex; align-items:center; gap:12px;">
                        <input type="checkbox" ${btn.enabled ? 'checked' : ''} onchange="toggleTopBtn(${idx}, this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color:#2563eb;">
                        <strong style="color:#1e293b;"><i class="fa-solid ${btn.icon}"></i> ${btn.label}</strong>
                        <span style="font-size:0.75rem; background:#eff6ff; color:#2563eb; padding:2px 8px; border-radius:6px; font-weight:700;">${btn.type}</span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="text" value="${btn.label}" onchange="updateTopBtnLabel(${idx}, this.value)" style="padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.85rem; font-weight:600;">
                        <button onclick="deleteTopBtn(${idx})" title="Delete Button" style="background:#fee2e2; border:none; color:#dc2626; padding:7px 10px; border-radius:6px; cursor:pointer;">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;
                topCont.appendChild(row);
            });
        }

        // ৩. টুলবার বাটনসমূহ
        const toolCont = document.getElementById('adminToolbarButtonsList');
        if (toolCont) {
            toolCont.innerHTML = '';
            cfg.toolbarButtons.forEach((btn, idx) => {
                const box = document.createElement('div');
                box.className = 'admin-card';
                box.style.cssText = 'display:flex; align-items:center; justify-content:space-between;';
                box.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" ${btn.enabled ? 'checked' : ''} onchange="toggleToolbarBtn(${idx}, this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color:#2563eb;">
                        <span style="font-weight:700; color:#334155; font-size:0.88rem;">
                            <i class="fa-solid ${btn.icon}"></i> ${btn.label}
                        </span>
                    </div>
                    <button onclick="deleteToolbarBtn(${idx})" title="Delete Button" style="background:transparent; border:none; color:#ef4444; cursor:pointer;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                toolCont.appendChild(box);
            });
        }

        // ৪. টেবিল কলামসমূহ
        const colCont = document.getElementById('adminTableColumnsList');
        if (colCont) {
            colCont.innerHTML = '';
            cfg.tableColumns.forEach((col, idx) => {
                const item = document.createElement('div');
                item.className = 'admin-card';
                item.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:12px 16px;';
                item.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="checkbox" ${col.enabled ? 'checked' : ''} onchange="toggleTableCol(${idx}, this.checked)" style="width:16px; height:16px; cursor:pointer; accent-color:#2563eb;">
                        <strong style="color:#1e293b; font-size:0.88rem;">${col.label}</strong>
                    </div>
                    <button onclick="deleteTableCol(${idx})" title="Delete Column" style="background:transparent; border:none; color:#ef4444; cursor:pointer;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                `;
                colCont.appendChild(item);
            });
        }
    };

    // ৫. আধুনিক ইন-অ্যাপ মডাল ডায়লগ অ্যাকশনস
    window.openAddFilterBoxDialog = function () {
        const body = `
            <div class="modal-form-group">
                <label>Filter Box Title *</label>
                <input type="text" id="new_filter_title" class="modal-form-control" placeholder="e.g. Religion, Blood Group, Board">
            </div>
            <div class="modal-form-group">
                <label>Default Placeholder</label>
                <input type="text" id="new_filter_holder" class="modal-form-control" placeholder="e.g. All ...">
            </div>
            <div class="modal-form-group">
                <label>Initial Options (Comma separated)</label>
                <input type="text" id="new_filter_options" class="modal-form-control" placeholder="e.g. Option A, Option B, Option C">
            </div>
        `;
        window.openCPSCLModal("Create New Filter Box", body, () => {
            const title = document.getElementById('new_filter_title').value.trim();
            if (!title) { alert("Please enter filter title!"); return; }
            const holder = document.getElementById('new_filter_holder').value.trim() || 'All';
            const optsRaw = document.getElementById('new_filter_options').value;
            const opts = optsRaw ? optsRaw.split(',').map(s => s.trim()).filter(s => s) : ['Option 1', 'Option 2'];

            const cfg = window.getCPSCLMasterConfig();
            cfg.filterBoxes.push({
                id: 'filter_' + Date.now(),
                label: title,
                placeholder: holder,
                options: opts,
                enabled: true
            });
            saveMasterConfig(cfg);
            window.closeCPSCLModal();
            window.renderAdminSetupViews();
        });
    };

    window.openAddTopButtonDialog = function () {
        const body = `
            <div class="modal-form-group">
                <label>Button Label *</label>
                <input type="text" id="new_top_label" class="modal-form-control" placeholder="e.g. Bulk Import, Export Excel">
            </div>
            <div class="modal-form-group">
                <label>FontAwesome Icon Class</label>
                <input type="text" id="new_top_icon" class="modal-form-control" value="fa-circle-plus" placeholder="e.g. fa-file-excel, fa-upload">
            </div>
            <div class="modal-form-group">
                <label>Button Style / Theme</label>
                <select id="new_top_style" class="modal-form-control">
                    <option value="primary">Solid Blue (Primary)</option>
                    <option value="outline">Outline Blue</option>
                    <option value="success">Success Green</option>
                    <option value="danger">Danger Red</option>
                </select>
            </div>
        `;
        window.openCPSCLModal("Add New Top Action Button", body, () => {
            const label = document.getElementById('new_top_label').value.trim();
            if (!label) { alert("Please enter button label!"); return; }
            const icon = document.getElementById('new_top_icon').value.trim() || 'fa-circle-plus';
            const type = document.getElementById('new_top_style').value;

            const cfg = window.getCPSCLMasterConfig();
            cfg.topButtons.push({
                id: 'top_' + Date.now(),
                label,
                icon,
                type,
                enabled: true
            });
            saveMasterConfig(cfg);
            window.closeCPSCLModal();
            window.renderAdminSetupViews();
        });
    };

    window.openAddToolbarButtonDialog = function () {
        const body = `
            <div class="modal-form-group">
                <label>Toolbar Button Label *</label>
                <input type="text" id="new_tool_label" class="modal-form-control" placeholder="e.g. ID Card Print, SMS Notify">
            </div>
            <div class="modal-form-group">
                <label>FontAwesome Icon</label>
                <input type="text" id="new_tool_icon" class="modal-form-control" value="fa-star" placeholder="e.g. fa-id-card, fa-envelope">
            </div>
            <div class="modal-form-group">
                <label>Has Dropdown Arrow?</label>
                <select id="new_tool_drop" class="modal-form-control">
                    <option value="false">No (Direct Action)</option>
                    <option value="true">Yes (Dropdown Caret)</option>
                </select>
            </div>
        `;
        window.openCPSCLModal("Add Toolbar Action Button", body, () => {
            const label = document.getElementById('new_tool_label').value.trim();
            if (!label) { alert("Please enter label!"); return; }
            const icon = document.getElementById('new_tool_icon').value.trim() || 'fa-star';
            const hasDropdown = document.getElementById('new_tool_drop').value === 'true';

            const cfg = window.getCPSCLMasterConfig();
            cfg.toolbarButtons.push({
                id: 'tb_' + Date.now(),
                label,
                icon,
                hasDropdown,
                colorClass: '',
                enabled: true
            });
            saveMasterConfig(cfg);
            window.closeCPSCLModal();
            window.renderAdminSetupViews();
        });
    };

    window.openAddTableColumnDialog = function () {
        const body = `
            <div class="modal-form-group">
                <label>Table Column Header *</label>
                <input type="text" id="new_col_label" class="modal-form-control" placeholder="e.g. BLOOD GROUP, RELIGION, CONTACT">
            </div>
        `;
        window.openCPSCLModal("Add Table Column", body, () => {
            const label = document.getElementById('new_col_label').value.trim();
            if (!label) { alert("Please enter column title!"); return; }

            const cfg = window.getCPSCLMasterConfig();
            cfg.tableColumns.push({
                id: 'col_' + Date.now(),
                label: label.toUpperCase(),
                enabled: true
            });
            saveMasterConfig(cfg);
            window.closeCPSCLModal();
            window.renderAdminSetupViews();
        });
    };

    // ৬. ডিলিট এবং টগল হ্যান্ডলারসমূহ
    window.deleteFilterBox = function (idx) {
        if (confirm("Are you sure you want to delete this filter box?")) {
            const cfg = window.getCPSCLMasterConfig();
            cfg.filterBoxes.splice(idx, 1);
            saveMasterConfig(cfg);
            window.renderAdminSetupViews();
        }
    };

    window.deleteTopBtn = function (idx) {
        if (confirm("Are you sure you want to delete this top button?")) {
            const cfg = window.getCPSCLMasterConfig();
            cfg.topButtons.splice(idx, 1);
            saveMasterConfig(cfg);
            window.renderAdminSetupViews();
        }
    };

    window.deleteToolbarBtn = function (idx) {
        if (confirm("Are you sure you want to delete this toolbar button?")) {
            const cfg = window.getCPSCLMasterConfig();
            cfg.toolbarButtons.splice(idx, 1);
            saveMasterConfig(cfg);
            window.renderAdminSetupViews();
        }
    };

    window.deleteTableCol = function (idx) {
        if (confirm("Are you sure you want to delete this table column?")) {
            const cfg = window.getCPSCLMasterConfig();
            cfg.tableColumns.splice(idx, 1);
            saveMasterConfig(cfg);
            window.renderAdminSetupViews();
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
        if (confirm("Are you sure you want to reset all configurations to default?")) {
            localStorage.removeItem('cpscl_superadmin_master_config');
            window.renderAdminSetupViews();
            if (typeof window.renderDynamicStudentScreen === 'function') {
                window.renderDynamicStudentScreen();
            }
        }
    };

    function init() {
        injectSuperAdminStyles();
        injectModalFrame();
        injectSetupView();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200);
    }
})();
