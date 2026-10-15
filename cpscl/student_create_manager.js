/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Student Creation & Form Fields Builder Engine
   Path: cpscl/student_create_manager.js
   Architecture: 100% Super Admin Controlled Dropdowns | Firebase Permanent Sync
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Super Admin Controlled Student Engine with Auto-Repair...");

    // ডিফল্ট ফিল্ড ও অপশন তালিকা (Admission Year সহ সব ড্রপডাউনে অপশন দেওয়া আছে)
    const DEFAULT_FORM_FIELDS = [
        // Academic Info
        { id: 'admission_year', label: 'Admission Year', type: 'dropdown', group: 'Academic Info', enabled: true, required: true, options: ['2026', '2025', '2024'] },
        { id: 'class_name', label: 'Class Name', type: 'dropdown', group: 'Academic Info', enabled: true, required: true, options: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'HSC 1st Year', 'HSC 2nd Year'] },
        { id: 'section', label: 'Section/Batch', type: 'dropdown', group: 'Academic Info', enabled: true, required: true, options: ['Section A', 'Section B', 'Padma', 'Meghna', 'Jamuna'] },
        { id: 'category', label: "Student's Category", type: 'dropdown', group: 'Academic Info', enabled: true, required: false, options: ['Civil', 'General', 'Defence', "Teacher's Child"] },
        { id: 'roll_no', label: 'Roll No', type: 'text', group: 'Academic Info', enabled: true, required: true },
        { id: 'std_id', label: 'Student ID (Auto)', type: 'text', group: 'Academic Info', enabled: true, required: false, readonly: true },
        { id: 'tuition_fee', label: 'Monthly/Tuition Fee', type: 'text', group: 'Academic Info', enabled: true, required: false },
        { id: 'admission_fee', label: 'Admission Fee', type: 'text', group: 'Academic Info', enabled: true, required: false },
        { id: 'house', label: 'Student House', type: 'dropdown', group: 'Academic Info', enabled: true, required: true, options: ['House 1', 'House 2', 'House 3'] },

        // Personal Info
        { id: 'student_name', label: 'Name (English)', type: 'text', group: 'Personal Info', enabled: true, required: true },
        { id: 'nick_name', label: 'Nick Name', type: 'text', group: 'Personal Info', enabled: true, required: false },
        { id: 'student_name_bn', label: 'নাম (বাংলা)', type: 'text', group: 'Personal Info', enabled: true, required: false },
        { id: 'gender', label: 'Gender', type: 'dropdown', group: 'Personal Info', enabled: true, required: true, options: ['Male', 'Female', 'Other'] },
        { id: 'mobile_no', label: 'Mobile No (Primary)', type: 'text', group: 'Personal Info', enabled: true, required: true },
        { id: 'blood_group', label: 'Blood Group', type: 'dropdown', group: 'Personal Info', enabled: true, required: false, options: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
        { id: 'religion', label: 'Religion', type: 'dropdown', group: 'Personal Info', enabled: true, required: true, options: ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'] },
        { id: 'nationality', label: 'Nationality', type: 'dropdown', group: 'Personal Info', enabled: true, required: true, options: ['Bangladesh', 'Other'] },
        { id: 'birth_date', label: 'Birth Date (DD/MM/YYYY)', type: 'date', group: 'Personal Info', enabled: true, required: false },
        { id: 'birth_cert_no', label: 'Birth Certificate No', type: 'text', group: 'Personal Info', enabled: true, required: false },
        { id: 'email', label: 'Email', type: 'email', group: 'Personal Info', enabled: true, required: false },

        // Guardian & Address Info
        { id: 'father_name', label: "Father's Name", type: 'text', group: 'Guardian Info', enabled: true, required: false },
        { id: 'mother_name', label: "Mother's Name", type: 'text', group: 'Guardian Info', enabled: true, required: false },
        { id: 'present_address', label: 'Present Address', type: 'textarea', group: 'Address Info', enabled: true, required: false },
        { id: 'permanent_address', label: 'Permanent Address', type: 'textarea', group: 'Address Info', enabled: true, required: false }
    ];

    // অটো-রিপেয়ার যুক্ত রিডার: কোনো ড্রপডাউনে অপশন খালি থাকলে তা সাথে সাথে পূরণ করবে
    window.getCPSCLFormFields = function () {
        const saved = localStorage.getItem('cpscl_student_form_fields');
        let fields = saved ? JSON.parse(saved) : DEFAULT_FORM_FIELDS;

        // Auto-Repair: নিশ্চিত করা যে admission_year বা যেকোনো ড্রপডাউনে অপশন যেন ফাঁকা না থাকে
        let repaired = false;
        fields.forEach(f => {
            if (f.type === 'dropdown' && (!f.options || f.options.length === 0)) {
                const def = DEFAULT_FORM_FIELDS.find(d => d.id === f.id);
                if (def && def.options) {
                    f.options = [...def.options];
                    repaired = true;
                }
            }
        });

        if (repaired) {
            localStorage.setItem('cpscl_student_form_fields', JSON.stringify(fields));
        }

        return fields;
    };

    function saveFormFields(fields) {
        localStorage.setItem('cpscl_student_form_fields', JSON.stringify(fields));
        if (typeof window.showToast === 'function') {
            window.showToast("Configuration saved successfully!", "success");
        }
    }

    // ১. স্টাইল ইনজেকশন
    function injectInlineFormStyles() {
        if (document.getElementById('cpscl-inline-form-styles')) return;
        const st = document.createElement('style');
        st.id = 'cpscl-inline-form-styles';
        st.innerHTML = `
            #createStudentInlineCard {
                display: none;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                overflow: hidden;
                margin-bottom: 25px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.04);
                animation: slideDownSmooth 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes slideDownSmooth {
                from { opacity: 0; transform: translateY(-15px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .create-ribbon-bar {
                background: linear-gradient(90deg, #00b4d8, #0ea5e9);
                color: #ffffff;
                padding: 14px 22px;
                font-weight: 700;
                font-size: 1.1rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .create-form-content { padding: 25px; }
            .form-grid-layout {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 16px;
            }
            @media (max-width: 1200px) { .form-grid-layout { grid-template-columns: repeat(3, 1fr); } }
            @media (max-width: 850px) { .form-grid-layout { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 550px) { .form-grid-layout { grid-template-columns: 1fr; } }

            .create-field-box {
                background: #ffffff;
                border: 1.5px solid #e2e8f0;
                border-radius: 10px;
                padding: 7px 12px;
                transition: all 0.2s;
            }
            .create-field-box:focus-within {
                border-color: #00b4d8;
                box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.15);
            }
            .create-field-box label {
                display: block;
                font-size: 0.73rem;
                font-weight: 700;
                color: #64748b;
                margin-bottom: 2px;
            }
            .create-field-box label span.req-star { color: #ef4444; font-weight: bold; }
            .create-form-input {
                width: 100%;
                border: none;
                background: transparent;
                font-size: 0.92rem;
                font-weight: 600;
                color: #1e293b;
                outline: none;
                padding: 2px 0;
            }
            .create-form-input:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
            .create-form-actions {
                display: flex;
                justify-content: flex-end;
                align-items: center;
                gap: 12px;
                margin-top: 25px;
                padding-top: 18px;
                border-top: 1.5px solid #f1f5f9;
            }
            .btn-action-cancel {
                padding: 10px 24px;
                border: 1.5px solid #cbd5e1;
                background: #ffffff;
                color: #475569;
                border-radius: 50px;
                font-weight: 700;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.2s;
            }
            .btn-action-cancel:hover { background: #f1f5f9; }
            .btn-action-submit {
                padding: 10px 32px;
                border: none;
                background: linear-gradient(90deg, #00b4d8, #0ea5e9);
                color: #ffffff;
                border-radius: 50px;
                font-weight: 700;
                font-size: 0.95rem;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 15px rgba(0, 180, 216, 0.3);
                transition: all 0.2s;
            }
        `;
        document.head.appendChild(st);
    }

    // ২. ইনলাইন ফর্ম ইনজেকশন
    function injectInlineCreateForm() {
        const view = document.getElementById('trust-cpscl-main-view');
        if (!view || document.getElementById('createStudentInlineCard')) return;

        const mainCard = view.querySelector('.stu-main-card');
        if (!mainCard) return;

        const createCard = document.createElement('div');
        createCard.id = 'createStudentInlineCard';
        createCard.innerHTML = `
            <div class="create-ribbon-bar">
                <i class="fa-solid fa-circle-plus"></i> <span id="createFormTitleHeader">Create Student</span>
            </div>
            <form id="cpsclStudentCreateForm" onsubmit="handleStudentFormSubmit(event)" class="create-form-content">
                <div class="form-grid-layout" id="dynamicFormFieldsContainer"></div>
                <div class="create-form-actions">
                    <button type="button" class="btn-action-cancel" onclick="closeCreateStudentInlineForm()">
                        <i class="fa-solid fa-xmark"></i> Cancel
                    </button>
                    <button type="submit" class="btn-action-submit" id="btnSubmitStudent">
                        <i class="fa-solid fa-check"></i> Submit
                    </button>
                </div>
            </form>
        `;

        mainCard.parentNode.insertBefore(createCard, mainCard);
    }

    // ৩. ড্রপডাউনে অপশনসহ সরাসরি ফর্ম ফিল্ড রেন্ডার
    window.renderDynamicCreateFormFields = function (isManualId = false) {
        const container = document.getElementById('dynamicFormFieldsContainer');
        if (!container) return;

        const fields = window.getCPSCLFormFields();
        container.innerHTML = '';
        const generatedAutoId = '26' + Math.floor(1000 + Math.random() * 9000);

        fields.filter(f => f.enabled).forEach(field => {
            const box = document.createElement('div');
            box.className = 'create-field-box';
            if (field.type === 'textarea') box.style.gridColumn = 'span 2';

            const reqStar = field.required ? '<span class="req-star">*</span>' : '';
            let inputHtml = '';

            if (field.type === 'dropdown') {
                let optionsHtml = `<option value="">Select ${field.label}...</option>`;
                const opts = field.options || [];

                opts.forEach(opt => {
                    optionsHtml += `<option value="${opt}">${opt}</option>`;
                });

                inputHtml = `
                    <select id="inp_form_${field.id}" class="create-form-input" ${field.required ? 'required' : ''}>
                        ${optionsHtml}
                    </select>
                `;
            } else if (field.type === 'textarea') {
                inputHtml = `
                    <textarea id="inp_form_${field.id}" class="create-form-input" rows="2" placeholder="Enter ${field.label}..." ${field.required ? 'required' : ''}></textarea>
                `;
            } else {
                let valAttr = '';
                let readonlyAttr = '';
                if (field.id === 'std_id') {
                    if (isManualId) {
                        valAttr = '';
                        readonlyAttr = '';
                    } else {
                        valAttr = `value="${generatedAutoId}"`;
                        readonlyAttr = 'readonly';
                    }
                }

                inputHtml = `
                    <input type="${field.type || 'text'}" id="inp_form_${field.id}" class="create-form-input" placeholder="Enter ${field.label}..." ${valAttr} ${readonlyAttr} ${field.required ? 'required' : ''}>
                `;
            }

            box.innerHTML = `
                <label>${field.label} ${reqStar}</label>
                ${inputHtml}
            `;
            container.appendChild(box);
        });
    };

    window.openCreateStudentInlineForm = function (isManualId = false) {
        injectInlineCreateForm();
        window.renderDynamicCreateFormFields(isManualId);

        const card = document.getElementById('createStudentInlineCard');
        const titleEl = document.getElementById('createFormTitleHeader');
        if (titleEl) titleEl.innerText = isManualId ? "Create Student (Manual ID)" : "Create Student";

        if (card) {
            card.style.display = 'block';
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    window.closeCreateStudentInlineForm = function () {
        const card = document.getElementById('createStudentInlineCard');
        if (card) card.style.display = 'none';
    };

    // ৪. ফায়ারবেসে পার্মানেন্ট সেভ
    window.handleStudentFormSubmit = async function (e) {
        e.preventDefault();
        const submitBtn = document.getElementById('btnSubmitStudent');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Cloud...';
        }

        const fields = window.getCPSCLFormFields();
        const studentObj = {
            id: 'stu_' + Date.now(),
            createdAt: new Date().toISOString(),
            status: 'Active'
        };

        fields.filter(f => f.enabled).forEach(f => {
            const el = document.getElementById(`inp_form_${f.id}`);
            studentObj[f.id] = el ? el.value.trim() : '';
        });

        studentObj.std_id = studentObj.std_id || ('26' + Math.floor(1000 + Math.random() * 9000));
        studentObj.student_name = studentObj.student_name || 'Unnamed Student';

        try {
            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`cpscl_students/${studentObj.id}`, studentObj);
            }
            let localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            localCache.unshift(studentObj);
            localStorage.setItem('cpscl_students_cache', JSON.stringify(localCache));

            if (typeof window.showToast === 'function') {
                window.showToast("Student registered successfully to Firebase!", "success");
            }
            window.closeCreateStudentInlineForm();
            window.fetchAndRenderRealCPSCLStudents();
        } catch (err) {
            alert("Error saving student: " + err.message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Submit';
            }
        }
    };

    // ৫. ফায়ারবেস থেকে ডাটা লোড ও টেবিলে দেখানো
    window.fetchAndRenderRealCPSCLStudents = function () {
        const tbody = document.querySelector('.stu-table tbody');
        if (!tbody) return;

        if (window.getDatabase && window.ref && window.get) {
            const db = window.getDatabase();
            const stuRef = window.ref(db, 'cpscl_students');
            window.get(stuRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    renderTableRows(Object.values(data));
                } else {
                    renderTableRows(JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]'));
                }
            }).catch(() => {
                renderTableRows(JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]'));
            });
        } else {
            renderTableRows(JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]'));
        }
    };

    function renderTableRows(studentsList) {
        const tbody = document.querySelector('.stu-table tbody');
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!studentsList || studentsList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#94a3b8;">No registered students found in database. Click '+ Create Student' to add one.</td></tr>`;
            return;
        }

        const masterCfg = typeof window.getCPSCLMasterConfig === 'function' ? window.getCPSCLMasterConfig() : {};
        const activeCols = (masterCfg.tableColumns || []).filter(c => c.enabled);

        studentsList.forEach((s, idx) => {
            const tr = document.createElement('tr');
            let colsHtml = '';

            activeCols.forEach(col => {
                let val = '-';
                if (col.id === 'col_serial') val = (idx + 1);
                else if (col.id === 'col_stdid') val = `<strong>${s.std_id || s.id}</strong>`;
                else if (col.id === 'col_name') val = `<span style="font-weight:700; color:#2563eb;">${s.student_name || '-'}</span>`;
                else if (col.id === 'col_roll') val = s.roll_no || '-';
                else if (col.id === 'col_father') val = s.father_name || '-';
                else if (col.id === 'col_mother') val = s.mother_name || '-';
                else if (col.id === 'col_status') val = `<span style="background:#dcfce7; color:#15803d; padding:3px 10px; border-radius:20px; font-weight:800; font-size:0.75rem;">${s.status || 'Active'}</span>`;
                else val = s[col.id] || '-';

                colsHtml += `<td>${val}</td>`;
            });

            colsHtml += `
                <td style="text-align:right;">
                    <button onclick="confirmSuperAdminDeleteStudent('${s.id}')" title="Delete Student" style="background:#fee2e2; border:none; color:#dc2626; padding:5px 10px; border-radius:6px; cursor:pointer;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;

            tr.innerHTML = colsHtml;
            tbody.appendChild(tr);
        });
    }

    window.confirmSuperAdminDeleteStudent = async function (studentId) {
        if (!confirm("WARNING: Are you sure you want to PERMANENTLY delete this student from Firebase Cloud?")) return;
        try {
            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`cpscl_students/${studentId}`, null);
            }
            let localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            localCache = localCache.filter(item => item.id !== studentId);
            localStorage.setItem('cpscl_students_cache', JSON.stringify(localCache));

            if (typeof window.showToast === 'function') window.showToast("Student deleted by Super Admin.", "info");
            window.fetchAndRenderRealCPSCLStudents();
        } catch (err) {
            alert("Error deleting student: " + err.message);
        }
    };

    // ৬. `Registration Setup`-এ ফিল্ড বিল্ডার ও ড্রপডাউন অপশন ম্যানেজমেন্ট টেবিল
    function injectFieldsBuilderTab() {
        const setupCard = document.querySelector('#cpscl-reg-setup-view .stu-main-card');
        const tabHeader = document.querySelector('#cpscl-reg-setup-view [style*="border-bottom:2px solid #e2e8f0"]');
        if (!setupCard || !tabHeader || document.getElementById('tab-btn-fields-builder')) return;

        const tabBtn = document.createElement('button');
        tabBtn.className = 'setup-tab-btn';
        tabBtn.id = 'tab-btn-fields-builder';
        tabBtn.onclick = function () { window.switchSetupTab('tab-fields-builder', this); renderFieldsBuilderChecklist(); };
        tabBtn.innerHTML = `<i class="fa-solid fa-list-check"></i> Student Form Fields`;
        tabHeader.appendChild(tabBtn);

        const panel = document.createElement('div');
        panel.id = 'tab-fields-builder';
        panel.className = 'setup-tab-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                <div>
                    <h3 style="font-size:1.15rem; color:#1e293b; margin-bottom:3px;">Student Form Fields & Dropdown Options Manager</h3>
                    <p style="font-size:0.85rem; color:#64748b;">Control form inputs and directly manage options for any dropdown field.</p>
                </div>
                <button onclick="openAddNewCustomFieldDialog()" class="btn-admin-action btn-admin-primary" style="padding:9px 18px;">
                    <i class="fa-solid fa-plus"></i> Add New Custom Field
                </button>
            </div>

            <div style="overflow-x:auto; background:#fff; border:1px solid #e2e8f0; border-radius:10px;">
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr style="background:#f8fafc; border-bottom:1.5px solid #e2e8f0;">
                            <th style="padding:12px 16px; width:60px; text-align:center;">SHOW</th>
                            <th style="padding:12px 16px; width:70px; text-align:center;">REQ (*)</th>
                            <th style="padding:12px 16px;">FIELD LABEL</th>
                            <th style="padding:12px 16px;">TYPE</th>
                            <th style="padding:12px 16px;">DROPDOWN OPTIONS</th>
                            <th style="padding:12px 16px; text-align:right;">ACTION</th>
                        </tr>
                    </thead>
                    <tbody id="fieldsBuilderTableBody"></tbody>
                </table>
            </div>
        `;
        setupCard.appendChild(panel);
    }

    // ফিল্ড চেকলিস্ট টেবিল রেন্ডার
    window.renderFieldsBuilderChecklist = function () {
        const tbody = document.getElementById('fieldsBuilderTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const fields = window.getCPSCLFormFields();

        fields.forEach((f, idx) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';

            let manageOptsBtn = '-';
            if (f.type === 'dropdown') {
                const optCount = (f.options || []).length;
                manageOptsBtn = `
                    <button onclick="openManageFieldOptionsModal(${idx})" class="btn-admin-action" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; padding:4px 10px; font-size:0.8rem;">
                        <i class="fa-solid fa-gear"></i> Options (${optCount})
                    </button>
                `;
            }

            tr.innerHTML = `
                <td style="text-align:center; padding:12px;">
                    <input type="checkbox" ${f.enabled ? 'checked' : ''} onchange="toggleFormFieldProp(${idx}, 'enabled', this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color:#2563eb;">
                </td>
                <td style="text-align:center; padding:12px;">
                    <input type="checkbox" ${f.required ? 'checked' : ''} onchange="toggleFormFieldProp(${idx}, 'required', this.checked)" style="width:18px; height:18px; cursor:pointer; accent-color:#ef4444;">
                </td>
                <td style="padding:12px; font-weight:700; color:#1e293b;">
                    ${f.label} ${f.required ? '<span style="color:#ef4444;">*</span>' : ''}
                </td>
                <td style="padding:12px;">
                    <span style="background:#f1f5f9; padding:3px 10px; border-radius:6px; font-size:0.8rem; font-weight:700; color:#475569;">${f.type.toUpperCase()}</span>
                </td>
                <td style="padding:12px;">
                    ${manageOptsBtn}
                </td>
                <td style="padding:12px; text-align:right;">
                    <button onclick="deleteCustomFormField(${idx})" title="Delete Field" style="background:#fee2e2; border:none; color:#dc2626; padding:6px 10px; border-radius:6px; cursor:pointer;">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    window.toggleFormFieldProp = function (idx, prop, val) {
        const fields = window.getCPSCLFormFields();
        fields[idx][prop] = val;
        saveFormFields(fields);
        window.renderFieldsBuilderChecklist();
    };

    window.deleteCustomFormField = function (idx) {
        if (!confirm("Are you sure you want to remove this field?")) return;
        const fields = window.getCPSCLFormFields();
        fields.splice(idx, 1);
        saveFormFields(fields);
        window.renderFieldsBuilderChecklist();
    };

    // ৭. ড্রপডাউন অপশন এডিটর মডাল
    window.openManageFieldOptionsModal = function (fieldIdx) {
        const fields = window.getCPSCLFormFields();
        const field = fields[fieldIdx];
        if (!field) return;

        const renderTags = () => {
            const list = field.options || [];
            return list.map((opt, oIdx) => `
                <span style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:5px 12px; border-radius:20px; font-size:0.85rem; font-weight:700; display:inline-flex; align-items:center; gap:8px; margin:4px;">
                    ${opt}
                    <i class="fa-solid fa-xmark" style="color:#ef4444; cursor:pointer;" onclick="removeOptionFromField(${fieldIdx}, ${oIdx})"></i>
                </span>
            `).join('') || '<span style="color:#94a3b8; font-size:0.85rem;">No options currently configured.</span>';
        };

        const body = `
            <div style="margin-bottom:15px;">
                <p style="font-size:0.88rem; color:#64748b; margin-bottom:12px;">Add or remove options for <strong>${field.label}</strong> dropdown:</p>
                <div style="display:flex; gap:8px;">
                    <input type="text" id="new_opt_val_input" class="modal-form-control" placeholder="Type new option (e.g. 2026, Science, House A)...">
                    <button type="button" onclick="addOptionToField(${fieldIdx})" class="btn-admin-action btn-admin-primary" style="padding:9px 18px; white-space:nowrap;">
                        <i class="fa-solid fa-plus"></i> Add
                    </button>
                </div>
            </div>
            <div style="min-height:100px; max-height:220px; overflow-y:auto; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:12px;" id="fieldOptionsTagContainer">
                ${renderTags()}
            </div>
        `;

        if (typeof window.openCPSCLModal === 'function') {
            window.openCPSCLModal(`Manage Options: ${field.label}`, body, () => {
                window.closeCPSCLModal();
                window.renderFieldsBuilderChecklist();
            });
        }
    };

    window.addOptionToField = function (fieldIdx) {
        const inp = document.getElementById('new_opt_val_input');
        const val = inp ? inp.value.trim() : '';
        if (!val) return;

        const fields = window.getCPSCLFormFields();
        if (!fields[fieldIdx].options) fields[fieldIdx].options = [];
        fields[fieldIdx].options.push(val);
        saveFormFields(fields);

        const cont = document.getElementById('fieldOptionsTagContainer');
        if (cont) {
            cont.innerHTML = fields[fieldIdx].options.map((opt, oIdx) => `
                <span style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:5px 12px; border-radius:20px; font-size:0.85rem; font-weight:700; display:inline-flex; align-items:center; gap:8px; margin:4px;">
                    ${opt}
                    <i class="fa-solid fa-xmark" style="color:#ef4444; cursor:pointer;" onclick="removeOptionFromField(${fieldIdx}, ${oIdx})"></i>
                </span>
            `).join('');
        }
        inp.value = '';
    };

    window.removeOptionFromField = function (fieldIdx, optIdx) {
        const fields = window.getCPSCLFormFields();
        fields[fieldIdx].options.splice(optIdx, 1);
        saveFormFields(fields);

        const cont = document.getElementById('fieldOptionsTagContainer');
        if (cont) {
            cont.innerHTML = fields[fieldIdx].options.map((opt, oIdx) => `
                <span style="background:#eff6ff; border:1px solid #bfdbfe; color:#1e40af; padding:5px 12px; border-radius:20px; font-size:0.85rem; font-weight:700; display:inline-flex; align-items:center; gap:8px; margin:4px;">
                    ${opt}
                    <i class="fa-solid fa-xmark" style="color:#ef4444; cursor:pointer;" onclick="removeOptionFromField(${fieldIdx}, ${oIdx})"></i>
                </span>
            `).join('') || '<span style="color:#94a3b8; font-size:0.85rem;">No options currently configured.</span>';
        }
    };

    window.openAddNewCustomFieldDialog = function () {
        const body = `
            <div class="modal-form-group">
                <label>Field Name / Label *</label>
                <input type="text" id="new_custom_f_label" class="modal-form-control" placeholder="e.g. Previous School, Father NID">
            </div>
            <div class="modal-form-group">
                <label>Field Type</label>
                <select id="new_custom_f_type" class="modal-form-control">
                    <option value="text">Text Box</option>
                    <option value="number">Number</option>
                    <option value="date">Date Picker</option>
                    <option value="textarea">Textarea (Long Text)</option>
                    <option value="dropdown">Dropdown Select</option>
                </select>
            </div>
            <div class="modal-form-group">
                <label>Section Group</label>
                <select id="new_custom_f_group" class="modal-form-control">
                    <option value="Academic Info">Academic Info</option>
                    <option value="Personal Info">Personal Info</option>
                    <option value="Guardian Info">Guardian Info</option>
                    <option value="Address Info">Address Info</option>
                </select>
            </div>
        `;
        if (typeof window.openCPSCLModal === 'function') {
            window.openCPSCLModal("Add New Form Field", body, () => {
                const label = document.getElementById('new_custom_f_label').value.trim();
                if (!label) { alert("Please enter field label!"); return; }
                const type = document.getElementById('new_custom_f_type').value;
                const group = document.getElementById('new_custom_f_group').value;

                const fields = window.getCPSCLFormFields();
                fields.push({
                    id: 'custom_' + Date.now(),
                    label,
                    type,
                    group,
                    enabled: true,
                    required: false,
                    options: type === 'dropdown' ? ['Option 1', 'Option 2'] : []
                });
                saveFormFields(fields);
                window.closeCPSCLModal();
                window.renderFieldsBuilderChecklist();
            });
        }
    };

    function bindCreateStudentButtons() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-stu-pill');
            if (!btn) return;
            const text = btn.innerText.trim();
            if (text.includes('Create Student (Manual ID)')) {
                window.openCreateStudentInlineForm(true);
            } else if (text.includes('Create Student')) {
                window.openCreateStudentInlineForm(false);
            }
        });
    }

    function init() {
        injectInlineFormStyles();
        bindCreateStudentButtons();
        setTimeout(injectFieldsBuilderTab, 350);
        setTimeout(window.fetchAndRenderRealCPSCLStudents, 400);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
})();
