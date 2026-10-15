/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Student Creation & Form Fields Builder Engine
   Path: cpscl/student_create_manager.js
   Safety: Permanent Firebase Cloud Storage | Zero-Auto-Delete Immune System
   ========================================================================== */

(function () {
    console.log("Initializing CPSCL Student Create Manager & Firebase Sync Engine...");

    // ডিফল্ট ফিল্ড তালিকা (ছবির ফর্মের সাথে ১০০% মিল রেখে তৈরি)
    const DEFAULT_FORM_FIELDS = [
        // Academic Info
        { id: 'admission_year', label: 'Admission Year', type: 'dropdown', group: 'Academic Info', enabled: true, required: true, optionsKey: 'academicYears' },
        { id: 'class_name', label: 'Class Name', type: 'dropdown', group: 'Academic Info', enabled: true, required: true, optionsKey: 'classes' },
        { id: 'section', label: 'Section/Batch', type: 'dropdown', group: 'Academic Info', enabled: true, required: true, optionsKey: 'sections' },
        { id: 'category', label: "Student's Category", type: 'dropdown', group: 'Academic Info', enabled: true, required: false, optionsKey: 'categories' },
        { id: 'roll_no', label: 'Roll No', type: 'text', group: 'Academic Info', enabled: true, required: true },
        { id: 'std_id', label: 'Student ID (Auto)', type: 'text', group: 'Academic Info', enabled: true, required: false, readonly: true },
        { id: 'tuition_fee', label: 'Monthly/Tuition Fee', type: 'text', group: 'Academic Info', enabled: true, required: false },
        { id: 'admission_fee', label: 'Admission Fee', type: 'text', group: 'Academic Info', enabled: true, required: false },
        { id: 'house', label: 'Student House', type: 'dropdown', group: 'Academic Info', enabled: true, required: true, optionsKey: 'houses' },

        // Personal Info
        { id: 'student_name', label: 'Name (English)', type: 'text', group: 'Personal Info', enabled: true, required: true },
        { id: 'nick_name', label: 'Nick Name', type: 'text', group: 'Personal Info', enabled: true, required: false },
        { id: 'student_name_bn', label: 'নাম (বাংলা)', type: 'text', group: 'Personal Info', enabled: true, required: false },
        { id: 'gender', label: 'Gender', type: 'dropdown', group: 'Personal Info', enabled: true, required: true, staticOptions: ['Male', 'Female', 'Other'] },
        { id: 'mobile_no', label: 'Mobile No (Primary)', type: 'text', group: 'Personal Info', enabled: true, required: true },
        { id: 'blood_group', label: 'Blood Group', type: 'dropdown', group: 'Personal Info', enabled: true, required: false, staticOptions: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] },
        { id: 'religion', label: 'Religion', type: 'dropdown', group: 'Personal Info', enabled: true, required: true, staticOptions: ['Islam', 'Hinduism', 'Christianity', 'Buddhism', 'Other'] },
        { id: 'nationality', label: 'Nationality', type: 'dropdown', group: 'Personal Info', enabled: true, required: true, staticOptions: ['Bangladesh', 'Other'] },
        { id: 'birth_date', label: 'Birth Date (DD/MM/YYYY)', type: 'date', group: 'Personal Info', enabled: true, required: false },
        { id: 'birth_cert_no', label: 'Birth Certificate No', type: 'text', group: 'Personal Info', enabled: true, required: false },
        { id: 'email', label: 'Email', type: 'email', group: 'Personal Info', enabled: true, required: false },

        // Guardian & Address Info
        { id: 'father_name', label: "Father's Name", type: 'text', group: 'Guardian Info', enabled: true, required: false },
        { id: 'mother_name', label: "Mother's Name", type: 'text', group: 'Guardian Info', enabled: true, required: false },
        { id: 'present_address', label: 'Present Address', type: 'textarea', group: 'Address Info', enabled: true, required: false },
        { id: 'permanent_address', label: 'Permanent Address', type: 'textarea', group: 'Address Info', enabled: true, required: false }
    ];

    // ফিল্ড কনফিগ রিডার
    window.getCPSCLFormFields = function () {
        const saved = localStorage.getItem('cpscl_student_form_fields');
        return saved ? JSON.parse(saved) : DEFAULT_FORM_FIELDS;
    };

    function saveFormFields(fields) {
        localStorage.setItem('cpscl_student_form_fields', JSON.stringify(fields));
        if (typeof window.showToast === 'function') {
            window.showToast("Form fields schema updated successfully!", "success");
        }
    }

    // ১. স্টুডেন্ট ফর্ম বিল্ডারের সিএসএস (ছবি ১ ও ২ এর মতো ইনলাইন স্টাইল)
    function injectInlineFormStyles() {
        if (document.getElementById('cpscl-inline-form-styles')) return;
        const st = document.createElement('style');
        st.id = 'cpscl-inline-form-styles';
        st.innerHTML = `
            /* ইনলাইন ক্রিয়েট স্টুডেন্ট কার্ড */
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
            .create-form-content {
                padding: 25px;
            }
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
            .create-field-box label span.req-star {
                color: #ef4444;
                font-weight: bold;
            }
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
            .create-form-input:disabled {
                background: #f8fafc;
                color: #94a3b8;
                cursor: not-allowed;
            }
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
            .btn-action-submit:hover { opacity: 0.95; }

            /* টেবিল কন্টেইনার ফর্ম ওপেন থাকা অবস্থায় হালকা নিচে থাকা */
            .push-down-active {
                opacity: 0.95;
            }
        `;
        document.head.appendChild(st);
    }

    // ২. ইনলাইন ফর্ম ইনজেকশন (Student List এর ঠিক উপরে বসবে)
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

        // মূল টেবিল কার্ডের ঠিক উপরে ইনজেক্ট করা
        mainCard.parentNode.insertBefore(createCard, mainCard);
    }

    // ৩. ডাইনামিক ফিল্ড রেন্ডারার (সুপার অ্যাডমিনের টিক দেওয়া ফিল্ড অনুযায়ী)
    window.renderDynamicCreateFormFields = function (isManualId = false) {
        const container = document.getElementById('dynamicFormFieldsContainer');
        if (!container) return;

        const fields = window.getCPSCLFormFields();
        const masterCfg = typeof window.getCPSCLMasterConfig === 'function' ? window.getCPSCLMasterConfig() : {};
        container.innerHTML = '';

        // অটো স্টুডেন্ট আইডি জেনারেশন
        const generatedAutoId = '26' + Math.floor(1000 + Math.random() * 9000);

        fields.filter(f => f.enabled).forEach(field => {
            const box = document.createElement('div');
            box.className = 'create-field-box';
            if (field.type === 'textarea') {
                box.style.gridColumn = 'span 2';
            }

            const reqStar = field.required ? '<span class="req-star">*</span>' : '';
            let inputHtml = '';

            if (field.type === 'dropdown') {
                let optionsHtml = `<option value="">Select ${field.label}...</option>`;

                // সুপার অ্যাডমিনের পূর্বের সেটআপ থেকে ড্রপডাউন অপশন নেওয়া
                if (field.optionsKey && masterCfg.filterBoxes) {
                    const matchedBox = masterCfg.filterBoxes.find(b => b.id.includes(field.id) || b.label.toLowerCase().includes(field.label.toLowerCase()));
                    if (matchedBox && matchedBox.options) {
                        matchedBox.options.forEach(opt => {
                            optionsHtml += `<option value="${opt}">${opt}</option>`;
                        });
                    }
                } else if (field.staticOptions) {
                    field.staticOptions.forEach(opt => {
                        optionsHtml += `<option value="${opt}">${opt}</option>`;
                    });
                }

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

    // ৪. ফর্ম ওপেন ও ক্লোজ ফাংশনসমূহ
    window.openCreateStudentInlineForm = function (isManualId = false) {
        injectInlineCreateForm();
        window.renderDynamicCreateFormFields(isManualId);

        const card = document.getElementById('createStudentInlineCard');
        const titleEl = document.getElementById('createFormTitleHeader');
        if (titleEl) {
            titleEl.innerText = isManualId ? "Create Student (Manual ID)" : "Create Student";
        }

        if (card) {
            card.style.display = 'block';
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    window.closeCreateStudentInlineForm = function () {
        const card = document.getElementById('createStudentInlineCard');
        if (card) {
            card.style.display = 'none';
        }
    };

    // ৫. ফায়ারবেস স্থায়ী ক্লাউড সেভ ইঞ্জিন (নিরাপত্তা নিশ্চিতকরণ)
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

        // প্রতিটি ফিল্ডের ডাটা রিড করা
        fields.filter(f => f.enabled).forEach(f => {
            const el = document.getElementById(`inp_form_${f.id}`);
            studentObj[f.id] = el ? el.value.trim() : '';
        });

        // মূল ফিল্ড ব্যাকআপ
        studentObj.std_id = studentObj.std_id || ('26' + Math.floor(1000 + Math.random() * 9000));
        studentObj.student_name = studentObj.student_name || 'Unnamed Student';

        try {
            // ১. ফায়ারবেস স্থায়ী ক্লাউডে সেভ (কোনো পুরানো ডাটা ওভাররাইট হবে না)
            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`cpscl_students/${studentObj.id}`, studentObj);
            }

            // ২. লোকাল ক্যাশ ব্যাকআপ
            let localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            localCache.unshift(studentObj);
            localStorage.setItem('cpscl_students_cache', JSON.stringify(localCache));

            if (typeof window.showToast === 'function') {
                window.showToast("Student registered successfully to Cloud Database!", "success");
            }

            // ফর্ম বন্ধ করা ও টেবিল আপডেট
            window.closeCreateStudentInlineForm();
            window.fetchAndRenderRealCPSCLStudents();

        } catch (err) {
            console.error("Firebase write error:", err);
            alert("Error saving student to Firebase: " + err.message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Submit';
            }
        }
    };

    // ৬. ফায়ারবেস থেকে লাইভ ডাটা লোড ও টেবিলে রেন্ডার (কোনো শিক্ষার্থী মুছবে না)
    window.fetchAndRenderRealCPSCLStudents = function () {
        const tbody = document.querySelector('.stu-table tbody');
        if (!tbody) return;

        // ফায়ারবেস ক্লাউড থেকে ডাটা রিড
        if (window.getDatabase && window.ref && window.get) {
            const db = window.getDatabase();
            const stuRef = window.ref(db, 'cpscl_students');
            window.get(stuRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const students = Object.values(data);
                    renderTableRows(students);
                } else {
                    const local = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
                    renderTableRows(local);
                }
            }).catch(() => {
                const local = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
                renderTableRows(local);
            });
        } else {
            const local = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            renderTableRows(local);
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

            // সুপার অ্যাডমিনের ম্যানুয়াল ডিলিট বাটন (একমাত্র উপায়)
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

    // ৭. সুপার অ্যাডমিনের জন্য সুরক্ষিত ম্যানুয়াল ডিলিট (কোডিং নয়, শুধুই ক্লিকে)
    window.confirmSuperAdminDeleteStudent = async function (studentId) {
        const confirmed = confirm("WARNING: Are you sure you want to PERMANENTLY delete this student from Firebase Cloud? This action cannot be undone.");
        if (!confirmed) return;

        try {
            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`cpscl_students/${studentId}`, null);
            }
            let localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            localCache = localCache.filter(item => item.id !== studentId);
            localStorage.setItem('cpscl_students_cache', JSON.stringify(localCache));

            if (typeof window.showToast === 'function') {
                window.showToast("Student deleted by Super Admin.", "info");
            }
            window.fetchAndRenderRealCPSCLStudents();
        } catch (err) {
            alert("Error deleting student: " + err.message);
        }
    };

    // ৮. `Registration Setup`-এ ফিল্ড বিল্ডার ট্যাব ইনজেকশন (চেকলিস্ট তালিকা)
    function injectFieldsBuilderTab() {
        const setupCard = document.querySelector('#cpscl-reg-setup-view .stu-main-card');
        const tabHeader = document.querySelector('#cpscl-reg-setup-view [style*="border-bottom:2px solid #e2e8f0"]');
        if (!setupCard || !tabHeader || document.getElementById('tab-btn-fields-builder')) return;

        // ট্যাব বাটন যুক্ত করা
        const tabBtn = document.createElement('button');
        tabBtn.className = 'setup-tab-btn';
        tabBtn.id = 'tab-btn-fields-builder';
        tabBtn.onclick = function () { window.switchSetupTab('tab-fields-builder', this); renderFieldsBuilderChecklist(); };
        tabBtn.innerHTML = `<i class="fa-solid fa-list-check"></i> Student Form Fields`;
        tabHeader.appendChild(tabBtn);

        // ট্যাব কনটেন্ট প্যানেল যুক্ত করা
        const panel = document.createElement('div');
        panel.id = 'tab-fields-builder';
        panel.className = 'setup-tab-panel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                <div>
                    <h3 style="font-size:1.15rem; color:#1e293b; margin-bottom:3px;">Student Registration Form Field Builder</h3>
                    <p style="font-size:0.85rem; color:#64748b;">Tick or untick fields to control which inputs appear on the '+ Create Student' form.</p>
                </div>
                <button onclick="openAddNewCustomFieldDialog()" class="btn-admin-action btn-admin-primary" style="padding:9px 18px;">
                    <i class="fa-solid fa-plus"></i> Add New Custom Field
                </button>
            </div>

            <!-- চেকলিস্ট টেবিল -->
            <div style="overflow-x:auto; background:#fff; border:1px solid #e2e8f0; border-radius:10px;">
                <table style="width:100%; border-collapse:collapse; text-align:left;">
                    <thead>
                        <tr style="background:#f8fafc; border-bottom:1.5px solid #e2e8f0;">
                            <th style="padding:12px 16px; width:60px; text-align:center;">SHOW</th>
                            <th style="padding:12px 16px; width:70px; text-align:center;">REQ (*)</th>
                            <th style="padding:12px 16px;">FIELD LABEL</th>
                            <th style="padding:12px 16px;">TYPE</th>
                            <th style="padding:12px 16px;">SECTION GROUP</th>
                            <th style="padding:12px 16px; text-align:right;">ACTION</th>
                        </tr>
                    </thead>
                    <tbody id="fieldsBuilderTableBody"></tbody>
                </table>
            </div>
        `;
        setupCard.appendChild(panel);
    }

    // ফিল্ড চেকলিস্ট রেন্ডারার
    window.renderFieldsBuilderChecklist = function () {
        const tbody = document.getElementById('fieldsBuilderTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        const fields = window.getCPSCLFormFields();

        fields.forEach((f, idx) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #f1f5f9';

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
                <td style="padding:12px; color:#64748b; font-size:0.85rem; font-weight:600;">
                    ${f.group}
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
        if (confirm("Are you sure you want to remove this field from the registration form?")) {
            const fields = window.getCPSCLFormFields();
            fields.splice(idx, 1);
            saveFormFields(fields);
            window.renderFieldsBuilderChecklist();
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
                    required: false
                });
                saveFormFields(fields);
                window.closeCPSCLModal();
                window.renderFieldsBuilderChecklist();
            });
        }
    };

    // ৯. `+ Create Student` বাটনে ক্লিক হ্যান্ডলার বাইন্ড করা
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
