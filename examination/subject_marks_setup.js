/**
 * Mousumi Computer - Dynamic Examination Management System
 * Subject & Marks Setup Module (100% Dynamic - Zero Hardcode)
 */

(function () {
    "use strict";

    const SubjectMarksSetup = {
        activeTab: "subjects", // "subjects" | "assignments" | "components" | "types" | "grades"
        activeSessionId: null,
        activeSessionObj: null,

        // Data caches
        subjects: [],
        assignments: [],
        subjectTypes: [],
        gradeRules: [],
        classes: [],
        sections: [],
        groups: [],
        shifts: [],
        marksComponents: {}, // subjectId -> components array

        // Modal tracker
        modalType: null,
        editingId: null,
        currentSubjectForMarks: null,

        init: function () {
            this.injectStyles();
            this.bindEvents();
            this.loadAllData();
        },

        injectStyles: function () {
            if (document.getElementById("subject-marks-setup-styles")) return;
            const style = document.createElement("style");
            style.id = "subject-marks-setup-styles";
            style.innerHTML = `
                .sub-tabs-bar {
                    display: flex;
                    gap: 6px;
                    border-bottom: 2px solid #e2e8f0;
                    margin-bottom: 16px;
                    overflow-x: auto;
                    background: #ffffff;
                    padding: 8px 12px 0 12px;
                    border-radius: 10px 10px 0 0;
                }
                .sub-tab-btn {
                    padding: 10px 18px;
                    border: none;
                    background: transparent;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #64748b;
                    cursor: pointer;
                    border-bottom: 3px solid transparent;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                }
                .sub-tab-btn:hover { color: #4f46e5; background: #f8fafc; }
                .sub-tab-btn.active {
                    color: #4f46e5;
                    border-bottom-color: #4f46e5;
                    background: #f5f3ff;
                    border-radius: 8px 8px 0 0;
                }
                .sub-tab-count {
                    font-size: 0.72rem;
                    background: #e2e8f0;
                    color: #475569;
                    padding: 1px 7px;
                    border-radius: 12px;
                    font-weight: 800;
                }
                .sub-tab-btn.active .sub-tab-count {
                    background: #4f46e5;
                    color: #ffffff;
                }
                .badge-valid { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
                .badge-mismatch { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }
            `;
            document.head.appendChild(style);
        },

        bindEvents: function () {
            window.addEventListener("exam-navigate", (e) => {
                if (e.detail === "subject-marks-setup") {
                    this.loadAllData();
                }
            });
        },

        loadAllData: async function () {
            try {
                if (typeof window.getDatabase === "function" && typeof window.ref === "function" && typeof window.get === "function") {
                    const db = window.getDatabase();

                    // 1. Fetch active session context
                    const configSnap = await window.get(window.ref(db, "exam_system/config"));
                    this.activeSessionId = configSnap.exists() ? configSnap.val().active_session_id : null;

                    if (this.activeSessionId) {
                        const sessionSnap = await window.get(window.ref(db, `exam_system/sessions/${this.activeSessionId}`));
                        this.activeSessionObj = sessionSnap.exists() ? sessionSnap.val() : null;

                        // 2. Fetch session-scoped academic items
                        const sessionDataSnap = await window.get(window.ref(db, `exam_system/session_data/${this.activeSessionId}`));
                        if (sessionDataSnap.exists()) {
                            const data = sessionDataSnap.val();
                            this.classes = Object.values(data.classes || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
                            this.sections = Object.values(data.sections || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
                            this.groups = Object.values(data.groups || {}).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                            this.shifts = Object.values(data.shifts || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
                            this.subjects = Object.values(data.subjects || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
                            this.assignments = Object.values(data.subject_assignments || {}).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                            this.subjectTypes = Object.values(data.subject_types || {}).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                            this.gradeRules = Object.values(data.grade_rules || {}).sort((a, b) => (b.minScore || 0) - (a.minScore || 0));
                            this.marksComponents = data.marks_components || {};
                        } else {
                            this.resetData();
                        }
                    } else {
                        this.activeSessionObj = null;
                        this.resetData();
                    }
                }
            } catch (err) {
                console.error("[SubjectMarksSetup] Error loading data:", err);
            }

            this.render();

            if (window.ExamSystem && window.ExamSystem.submodules.dashboard) {
                window.ExamSystem.submodules.dashboard.refresh();
            }
        },

        resetData: function () {
            this.subjects = [];
            this.assignments = [];
            this.subjectTypes = [];
            this.gradeRules = [];
            this.classes = [];
            this.sections = [];
            this.groups = [];
            this.shifts = [];
            this.marksComponents = {};
        },

        switchTab: function (tab) {
            this.activeTab = tab;
            this.render();
        },

        render: function () {
            const container = document.getElementById("exam-subject-setup-panel");
            if (!container) return;

            const isSessionActive = !!this.activeSessionObj;

            container.innerHTML = `
                <!-- Active Session Context Banner -->
                <div class="exam-active-banner ${isSessionActive ? "banner-active" : "banner-empty"}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="active-badge-icon">
                            <i class="fa-solid ${isSessionActive ? "fa-book-bookmark" : "fa-triangle-exclamation"}"></i>
                        </div>
                        <div>
                            <span class="active-banner-label">Subject & Marks Configuration Context</span>
                            <h3 class="active-banner-title">
                                ${isSessionActive ? this.activeSessionObj.name : "No Active Academic Session"}
                            </h3>
                            <p class="active-banner-dates">
                                ${isSessionActive ? `All subjects, marks distributions, and assignments are isolated to session "${this.activeSessionObj.name}".` : "Please create and activate an Academic Session before managing subjects and grading rules."}
                            </p>
                        </div>
                    </div>
                    ${isSessionActive ? `
                        <button class="btn-submit" onclick="ExamSubjectSetup.openAddModal('${this.activeTab}')" style="width: auto; padding: 9px 18px; font-size: 0.85rem; background: #4f46e5; border-radius: 8px;">
                            <i class="fa-solid fa-plus"></i> Add New
                        </button>
                    ` : ""}
                </div>

                <!-- Navigation Tabs Bar -->
                <div class="sub-tabs-bar">
                    <button class="sub-tab-btn ${this.activeTab === "subjects" ? "active" : ""}" onclick="ExamSubjectSetup.switchTab('subjects')">
                        <i class="fa-solid fa-book"></i> Subjects Catalog <span class="sub-tab-count">${this.subjects.length}</span>
                    </button>
                    <button class="sub-tab-btn ${this.activeTab === "assignments" ? "active" : ""}" onclick="ExamSubjectSetup.switchTab('assignments')">
                        <i class="fa-solid fa-diagram-project"></i> Subject Assignments <span class="sub-tab-count">${this.assignments.length}</span>
                    </button>
                    <button class="sub-tab-btn ${this.activeTab === "components" ? "active" : ""}" onclick="ExamSubjectSetup.switchTab('components')">
                        <i class="fa-solid fa-calculator"></i> Marks Distribution
                    </button>
                    <button class="sub-tab-btn ${this.activeTab === "types" ? "active" : ""}" onclick="ExamSubjectSetup.switchTab('types')">
                        <i class="fa-solid fa-tags"></i> Subject Types <span class="sub-tab-count">${this.subjectTypes.length}</span>
                    </button>
                    <button class="sub-tab-btn ${this.activeTab === "grades" ? "active" : ""}" onclick="ExamSubjectSetup.switchTab('grades')">
                        <i class="fa-solid fa-award"></i> Grade Rules <span class="sub-tab-count">${this.gradeRules.length}</span>
                    </button>
                </div>

                <!-- Tab Content Area -->
                <div class="erp-form-card" style="max-width: 100%; padding: 20px; border-radius: 0 0 10px 10px;">
                    ${this.renderActiveTabContent()}
                </div>

                <!-- Universal Add/Edit Modal -->
                <div class="modal-overlay" id="subMasterModal" style="display: none; align-items: center; justify-content: center; z-index: 999999;">
                    <div class="modal-card" style="max-width: 540px; width: 92%; text-align: left; padding: 22px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                            <h3 id="subModalTitle" style="font-size: 1.1rem; font-weight: 800; color: #1e1b4b; margin: 0;">Modal Title</h3>
                            <button type="button" onclick="ExamSubjectSetup.closeModal()" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #64748b;">&times;</button>
                        </div>
                        <div id="subModalAlert" style="display: none; padding: 8px 12px; border-radius: 6px; font-size: 0.82rem; margin-bottom: 12px; font-weight: 600;"></div>
                        <form id="subMasterForm" onsubmit="ExamSubjectSetup.handleModalSubmit(event)">
                            <div id="subModalBody"></div>
                            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 16px;">
                                <button type="button" class="btn-modal-cancel" onclick="ExamSubjectSetup.closeModal()" style="width: auto; padding: 8px 18px;">Cancel</button>
                                <button type="submit" id="btnSaveSubModal" class="btn-submit" style="width: auto; padding: 8px 24px; background: #4f46e5;">
                                    <i class="fa-solid fa-floppy-disk"></i> Save Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        renderActiveTabContent: function () {
            if (!this.activeSessionObj) {
                return `
                    <div style="text-align: center; padding: 45px 20px; color: #64748b;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.2rem; color: #f59e0b; margin-bottom: 12px;"></i>
                        <h4 style="font-size: 1.05rem; font-weight: 800; color: #1e1b4b; margin-bottom: 6px;">No Active Academic Session Found</h4>
                        <p style="font-size: 0.85rem; max-width: 480px; margin: 0 auto 16px auto;">
                            Please activate an Academic Session from the Academic Setup menu first.
                        </p>
                    </div>
                `;
            }

            if (this.activeTab === "subjects") return this.renderSubjectsTab();
            if (this.activeTab === "assignments") return this.renderAssignmentsTab();
            if (this.activeTab === "components") return this.renderComponentsTab();
            if (this.activeTab === "types") return this.renderTypesTab();
            if (this.activeTab === "grades") return this.renderGradesTab();
            return "";
        },

        // ---------------- TAB 1: SUBJECTS CATALOG ----------------
        renderSubjectsTab: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <div>
                        <span><i class="fa-solid fa-book" style="color: #4f46e5;"></i> Subjects Master Catalog</span>
                        <p style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin: 2px 0 0 0;">Configuring subjects for session: <strong>${this.activeSessionObj.name}</strong></p>
                    </div>
                    <button class="btn-submit" onclick="ExamSubjectSetup.openAddModal('subjects')" style="width: auto; padding: 7px 16px; font-size: 0.82rem; background: #4f46e5;">
                        <i class="fa-solid fa-plus"></i> Add Subject
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 70px;">Order</th>
                                <th>Subject Name</th>
                                <th>Code</th>
                                <th>Short Name</th>
                                <th>Type</th>
                                <th>Full Marks</th>
                                <th>Pass Marks</th>
                                <th>Credit</th>
                                <th>Status</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.subjects.length === 0 ? `<tr><td colspan="10" style="text-align:center; padding: 25px; color:#94a3b8;">No subjects added yet. Click 'Add Subject' to register a new subject.</td></tr>` : ""}
                            ${this.subjects.map(s => `
                                <tr>
                                    <td style="font-weight: 800; color: #475569;">#${s.order || 1}</td>
                                    <td style="font-weight: 700; color: #1e293b;">${s.name}</td>
                                    <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700;">${s.code}</code></td>
                                    <td style="color: #64748b;">${s.shortName || "-"}</td>
                                    <td><span class="badge" style="background:#eef2ff; color:#4f46e5;">${s.typeName || "General"}</span></td>
                                    <td style="font-weight: 700; color: #0f172a;">${s.fullMarks}</td>
                                    <td style="color: #64748b;">${s.passMarks}</td>
                                    <td style="color: #64748b;">${s.credit || "-"}</td>
                                    <td><span class="badge ${s.status === "Active" ? "acad-badge-active" : "acad-badge-inactive"}">${s.status}</span></td>
                                    <td style="text-align: right; white-space: nowrap;">
                                        <button class="btn-action" onclick="ExamSubjectSetup.toggleSubjectStatus('${s.id}')" title="Toggle Active/Inactive" style="background:#f1f5f9; color:#334155;">
                                            <i class="fa-solid fa-power-off"></i>
                                        </button>
                                        <button class="btn-action btn-edit" onclick="ExamSubjectSetup.openEditModal('subjects', '${s.id}')" title="Edit Subject">
                                            <i class="fa-solid fa-pen"></i>
                                        </button>
                                        <button class="btn-action btn-delete" onclick="ExamSubjectSetup.deleteSubject('${s.id}')" title="Delete Subject">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        },

        // ---------------- TAB 2: SUBJECT ASSIGNMENTS ----------------
        renderAssignmentsTab: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <div>
                        <span><i class="fa-solid fa-diagram-project" style="color: #4f46e5;"></i> Subject Class & Group Assignments</span>
                        <p style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin: 2px 0 0 0;">Assigning subjects to academic classes, sections, groups, and shifts</p>
                    </div>
                    <button class="btn-submit" onclick="ExamSubjectSetup.openAddModal('assignments')" style="width: auto; padding: 7px 16px; font-size: 0.82rem; background: #4f46e5;">
                        <i class="fa-solid fa-plus"></i> Assign Subject
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Target Class</th>
                                <th>Section</th>
                                <th>Group</th>
                                <th>Shift</th>
                                <th>Status</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.assignments.length === 0 ? `<tr><td colspan="7" style="text-align:center; padding: 25px; color:#94a3b8;">No subject assignments configured. Click 'Assign Subject' to link subjects to classes.</td></tr>` : ""}
                            ${this.assignments.map(a => `
                                <tr>
                                    <td style="font-weight: 700; color: #1e293b;">${a.subjectName}</td>
                                    <td style="font-weight: 700; color: #4f46e5;">${a.className}</td>
                                    <td>${a.sectionName || "All Sections"}</td>
                                    <td>${a.groupName || "All Groups"}</td>
                                    <td>${a.shiftName || "All Shifts"}</td>
                                    <td><span class="badge ${a.status === "Active" ? "acad-badge-active" : "acad-badge-inactive"}">${a.status}</span></td>
                                    <td style="text-align: right; white-space: nowrap;">
                                        <button class="btn-action" onclick="ExamSubjectSetup.toggleAssignmentStatus('${a.id}')" title="Toggle Status" style="background:#f1f5f9; color:#334155;">
                                            <i class="fa-solid fa-power-off"></i>
                                        </button>
                                        <button class="btn-action btn-delete" onclick="ExamSubjectSetup.deleteAssignment('${a.id}')" title="Remove Assignment">
                                            <i class="fa-solid fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        },

        // ---------------- TAB 3: MARKS DISTRIBUTION ----------------
        renderComponentsTab: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <div>
                        <span><i class="fa-solid fa-calculator" style="color: #4f46e5;"></i> Marks Distribution by Subject Component</span>
                        <p style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin: 2px 0 0 0;">Define CQ, MCQ, Practical, Viva, Class Test components with auto-validation</p>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px;">
                    ${this.subjects.length === 0 ? `<p style="color:#94a3b8; padding:20px;">Please create subjects first in the Subjects Catalog tab.</p>` : ""}
                    ${this.subjects.map(sub => {
                        const compObj = this.marksComponents[sub.id] || {};
                        const comps = Object.values(compObj.components || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
                        const totalConfigured = comps.reduce((acc, c) => acc + (parseFloat(c.maxMarks) || 0), 0);
                        const isMatch = totalConfigured === parseFloat(sub.fullMarks);

                        return `
                            <div style="background: #f8fafc; border: 1.5px solid ${isMatch ? "#a7f3d0" : "#cbd5e1"}; border-radius: 10px; padding: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                                    <div>
                                        <h4 style="font-size: 1rem; font-weight: 800; color: #1e293b; margin: 0;">${sub.name}</h4>
                                        <span style="font-size: 0.75rem; color: #64748b; font-weight: 600;">Code: ${sub.code} &bull; Required Full Marks: <strong>${sub.fullMarks}</strong></span>
                                    </div>
                                    <button class="btn-action btn-edit" onclick="ExamSubjectSetup.openComponentModal('${sub.id}')" style="padding: 5px 12px; font-size: 0.78rem;">
                                        <i class="fa-solid fa-plus"></i> Add Component
                                    </button>
                                </div>

                                <div style="margin-bottom: 12px;">
                                    <span class="badge ${isMatch ? "badge-valid" : "badge-mismatch"}" style="padding: 4px 10px; font-size: 0.75rem;">
                                        ${isMatch ? `Valid Distribution: ${totalConfigured} / ${sub.fullMarks}` : `Mismatch: ${totalConfigured} / ${sub.fullMarks} (Diff: ${Math.abs(sub.fullMarks - totalConfigured)})`}
                                    </span>
                                </div>

                                <table style="width: 100%; border-collapse: collapse; background: #ffffff; border-radius: 6px; overflow: hidden; font-size: 0.8rem;">
                                    <thead>
                                        <tr style="background: #f1f5f9; border-bottom: 1px solid #e2e8f0;">
                                            <th style="padding: 6px 10px; text-align: left;">Component</th>
                                            <th style="padding: 6px 10px; text-align: center;">Max</th>
                                            <th style="padding: 6px 10px; text-align: center;">Pass</th>
                                            <th style="padding: 6px 10px; text-align: right;">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${comps.length === 0 ? `<tr><td colspan="4" style="text-align:center; padding: 12px; color: #94a3b8;">No marks components configured yet.</td></tr>` : ""}
                                        ${comps.map(c => `
                                            <tr style="border-bottom: 1px solid #f8fafc;">
                                                <td style="padding: 6px 10px; font-weight: 700; color: #334155;">${c.name}</td>
                                                <td style="padding: 6px 10px; text-align: center; font-weight: 700; color: #0f172a;">${c.maxMarks}</td>
                                                <td style="padding: 6px 10px; text-align: center; color: #64748b;">${c.passMarks || 0}</td>
                                                <td style="padding: 6px 10px; text-align: right;">
                                                    <button onclick="ExamSubjectSetup.deleteComponent('${sub.id}', '${c.id}')" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete">
                                                        <i class="fa-solid fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                            </div>
                        `;
                    }).join("")}
                </div>
            `;
        },

        // ---------------- TAB 4: SUBJECT TYPES ----------------
        renderTypesTab: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <div>
                        <span><i class="fa-solid fa-tags" style="color: #4f46e5;"></i> Subject Types Configuration</span>
                        <p style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin: 2px 0 0 0;">Create dynamic classifications (e.g. Compulsory, Optional, Practical, Theory, Elective)</p>
                    </div>
                    <button class="btn-submit" onclick="ExamSubjectSetup.openAddModal('types')" style="width: auto; padding: 7px 16px; font-size: 0.82rem; background: #4f46e5;">
                        <i class="fa-solid fa-plus"></i> Add Subject Type
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Type Name</th>
                                <th>Code</th>
                                <th>Status</th>
                                <th>Elective / Optional Flag</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.subjectTypes.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding: 25px; color:#94a3b8;">No subject types created yet. Click 'Add Subject Type' to define your types.</td></tr>` : ""}
                            ${this.subjectTypes.map(t => `
                                <tr>
                                    <td style="font-weight: 700; color: #1e293b;">${t.name}</td>
                                    <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700;">${t.code}</code></td>
                                    <td><span class="badge ${t.status === "Active" ? "acad-badge-active" : "acad-badge-inactive"}">${t.status}</span></td>
                                    <td>${t.isElective ? '<span class="badge" style="background:#fef3c7; color:#b45309;">Yes (Elective)</span>' : '<span class="badge" style="background:#e0f2fe; color:#0369a1;">Standard</span>'}</td>
                                    <td style="text-align: right; white-space: nowrap;">
                                        <button class="btn-action btn-edit" onclick="ExamSubjectSetup.openEditModal('types', '${t.id}')"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-action btn-delete" onclick="ExamSubjectSetup.deleteSubjectType('${t.id}')"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        },

        // ---------------- TAB 5: GRADE RULES ----------------
        renderGradesTab: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <div>
                        <span><i class="fa-solid fa-award" style="color: #4f46e5;"></i> Dynamic Grading System & GPA Scale</span>
                        <p style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin: 2px 0 0 0;">Define percentage intervals, letter grades, and grade points for automated calculations</p>
                    </div>
                    <button class="btn-submit" onclick="ExamSubjectSetup.openAddModal('grades')" style="width: auto; padding: 7px 16px; font-size: 0.82rem; background: #4f46e5;">
                        <i class="fa-solid fa-plus"></i> Add Grade Rule
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Grade Name</th>
                                <th>Score Range (%)</th>
                                <th>Grade Point</th>
                                <th>Status</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.gradeRules.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding: 25px; color:#94a3b8;">No grade rules defined yet. Click 'Add Grade Rule' to set up your grading intervals.</td></tr>` : ""}
                            ${this.gradeRules.map(g => `
                                <tr>
                                    <td style="font-weight: 800; font-size: 1.05rem; color: #1e1b4b;">${g.name}</td>
                                    <td style="font-weight: 600; color: #334155;">${g.minScore}% - ${g.maxScore}%</td>
                                    <td style="font-weight: 800; color: #4f46e5; font-size: 1rem;">${parseFloat(g.point).toFixed(2)}</td>
                                    <td><span class="badge ${g.status === "Active" ? "acad-badge-active" : "acad-badge-inactive"}">${g.status}</span></td>
                                    <td style="text-align: right; white-space: nowrap;">
                                        <button class="btn-action btn-edit" onclick="ExamSubjectSetup.openEditModal('grades', '${g.id}')"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-action btn-delete" onclick="ExamSubjectSetup.deleteGradeRule('${g.id}')"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        },

        // ---------------- MODALS & SUBMISSIONS ----------------
        openAddModal: function (type) {
            this.modalType = type;
            this.editingId = null;
            this.buildModalForm();
            document.getElementById("subMasterModal").style.display = "flex";
        },

        openEditModal: function (type, id) {
            this.modalType = type;
            this.editingId = id;
            this.buildModalForm();
            document.getElementById("subMasterModal").style.display = "flex";
        },

        openComponentModal: function (subjectId) {
            this.modalType = "component";
            this.currentSubjectForMarks = subjectId;
            this.editingId = null;
            this.buildModalForm();
            document.getElementById("subMasterModal").style.display = "flex";
        },

        closeModal: function () {
            document.getElementById("subMasterModal").style.display = "none";
            this.modalType = null;
            this.editingId = null;
            this.currentSubjectForMarks = null;
        },

        showModalAlert: function (msg, isSuccess = false) {
            const el = document.getElementById("subModalAlert");
            if (!el) return;
            el.innerText = msg;
            el.style.display = "block";
            el.style.background = isSuccess ? "#dcfce7" : "#fee2e2";
            el.style.color = isSuccess ? "#15803d" : "#ef4444";
        },

        buildModalForm: function () {
            const titleEl = document.getElementById("subModalTitle");
            const bodyEl = document.getElementById("subModalBody");
            const alertEl = document.getElementById("subModalAlert");
            if (alertEl) alertEl.style.display = "none";
            const isEdit = !!this.editingId;

            // Form 1: Subject
            if (this.modalType === "subjects") {
                const s = isEdit ? this.subjects.find(x => x.id === this.editingId) : {};
                titleEl.innerText = isEdit ? "Edit Subject" : "Add Subject";
                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Subject Name <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="m_sub_name" value="${s.name || ""}" placeholder="e.g. English 1st Paper, Mathematics" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Subject Code <span style="color:#ef4444;">*</span></label>
                            <input type="text" id="m_sub_code" value="${s.code || ""}" placeholder="e.g. 101, ENG-1" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Short Name</label>
                            <input type="text" id="m_sub_short" value="${s.shortName || ""}" placeholder="e.g. ENG1, MATH" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Subject Type</label>
                            <select id="m_sub_type" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                                ${this.subjectTypes.length === 0 ? `<option value="General">General</option>` : this.subjectTypes.map(t => `<option value="${t.name}" ${s.typeName === t.name ? "selected" : ""}>${t.name}</option>`).join("")}
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Display Order</label>
                            <input type="number" id="m_sub_order" value="${s.order || (this.subjects.length + 1)}" min="1" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Full Marks <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="m_sub_full" value="${s.fullMarks || 100}" min="1" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Pass Marks <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="m_sub_pass" value="${s.passMarks || 33}" min="0" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Credit (Opt)</label>
                            <input type="number" step="any" id="m_sub_credit" value="${s.credit || ""}" placeholder="e.g. 3.0" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Status</label>
                        <select id="m_sub_status" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                            <option value="Active" ${s.status === "Active" ? "selected" : ""}>Active</option>
                            <option value="Inactive" ${s.status === "Inactive" ? "selected" : ""}>Inactive</option>
                        </select>
                    </div>
                `;
            }

            // Form 2: Assignment
            else if (this.modalType === "assignments") {
                titleEl.innerText = "Assign Subject to Class / Group";
                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Select Subject <span style="color:#ef4444;">*</span></label>
                        <select id="m_asgn_sub" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                            ${this.subjects.map(sub => `<option value="${sub.id}">${sub.name} (${sub.code}) - Full: ${sub.fullMarks}</option>`).join("")}
                        </select>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Target Class <span style="color:#ef4444;">*</span></label>
                        <select id="m_asgn_class" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                            ${this.classes.map(cl => `<option value="${cl.id}">${cl.name} (${cl.code})</option>`).join("")}
                        </select>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Section (Optional)</label>
                            <select id="m_asgn_sec" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                                <option value="">All Sections</option>
                                ${this.sections.map(sec => `<option value="${sec.id}">${sec.name}</option>`).join("")}
                            </select>
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Group (Optional)</label>
                            <select id="m_asgn_grp" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                                <option value="">All Groups</option>
                                ${this.groups.map(grp => `<option value="${grp.id}">${grp.name}</option>`).join("")}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Shift (Optional)</label>
                        <select id="m_asgn_shift" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                            <option value="">All Shifts</option>
                            ${this.shifts.map(sh => `<option value="${sh.id}">${sh.name}</option>`).join("")}
                        </select>
                    </div>
                `;
            }

            // Form 3: Marks Component
            else if (this.modalType === "component") {
                const sub = this.subjects.find(x => x.id === this.currentSubjectForMarks);
                titleEl.innerText = `Add Marks Component for ${sub ? sub.name : ""}`;
                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Component Name <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="m_comp_name" placeholder="e.g. Written, MCQ, Practical, Viva, Class Test" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Maximum Marks <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="m_comp_max" placeholder="e.g. 70" min="1" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Pass Marks (Opt)</label>
                            <input type="number" id="m_comp_pass" placeholder="e.g. 23" min="0" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Weight / % (Opt)</label>
                            <input type="number" id="m_comp_weight" placeholder="100" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Display Order</label>
                            <input type="number" id="m_comp_order" value="1" min="1" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                `;
            }

            // Form 4: Subject Types
            else if (this.modalType === "types") {
                const t = isEdit ? this.subjectTypes.find(x => x.id === this.editingId) : {};
                titleEl.innerText = isEdit ? "Edit Subject Type" : "Add Subject Type";
                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Type Name <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="m_type_name" value="${t.name || ""}" placeholder="e.g. Compulsory, Optional, Practical, Theory, Elective" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Type Code <span style="color:#ef4444;">*</span></label>
                            <input type="text" id="m_type_code" value="${t.code || ""}" placeholder="e.g. COMP, OPT, PRAC" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Status</label>
                            <select id="m_type_status" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                                <option value="Active" ${t.status === "Active" ? "selected" : ""}>Active</option>
                                <option value="Inactive" ${t.status === "Inactive" ? "selected" : ""}>Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="m_type_elective" ${t.isElective ? "checked" : ""} style="width:18px; height:18px; cursor:pointer;">
                        <label for="m_type_elective" style="font-size:0.85rem; font-weight:600; color:#334155; cursor:pointer;">Mark as Optional / Elective Subject Type</label>
                    </div>
                `;
            }

            // Form 5: Grade Rules
            else if (this.modalType === "grades") {
                const g = isEdit ? this.gradeRules.find(x => x.id === this.editingId) : {};
                titleEl.innerText = isEdit ? "Edit Grade Rule" : "Add Grade Rule";
                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Grade Name <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="m_grade_name" value="${g.name || ""}" placeholder="e.g. A+, A, A-, B, C, D, F" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Min Percentage (%) <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="m_grade_min" value="${g.minScore !== undefined ? g.minScore : 80}" min="0" max="100" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Max Percentage (%) <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="m_grade_max" value="${g.maxScore !== undefined ? g.maxScore : 100}" min="0" max="100" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Grade Point <span style="color:#ef4444;">*</span></label>
                            <input type="number" step="0.01" id="m_grade_point" value="${g.point !== undefined ? g.point : "5.00"}" min="0" max="10" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Status</label>
                            <select id="m_grade_status" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                                <option value="Active" ${g.status === "Active" ? "selected" : ""}>Active</option>
                                <option value="Inactive" ${g.status === "Inactive" ? "selected" : ""}>Inactive</option>
                            </select>
                        </div>
                    </div>
                `;
            }
        },

        handleModalSubmit: async function (e) {
            e.preventDefault();
            const btn = document.getElementById("btnSaveSubModal");
            btn.disabled = true;
            btn.innerText = "Saving...";

            try {
                if (this.modalType === "subjects") await this.saveSubject();
                else if (this.modalType === "assignments") await this.saveAssignment();
                else if (this.modalType === "component") await this.saveComponent();
                else if (this.modalType === "types") await this.saveSubjectType();
                else if (this.modalType === "grades") await this.saveGradeRule();
            } catch (err) {
                this.showModalAlert("Error: " + err.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Configuration`;
            }
        },

        saveSubject: async function () {
            const name = document.getElementById("m_sub_name").value.trim();
            const code = document.getElementById("m_sub_code").value.trim().toUpperCase();
            const shortName = document.getElementById("m_sub_short").value.trim().toUpperCase();
            const typeName = document.getElementById("m_sub_type").value;
            const order = parseInt(document.getElementById("m_sub_order").value) || 1;
            const fullMarks = parseFloat(document.getElementById("m_sub_full").value) || 100;
            const passMarks = parseFloat(document.getElementById("m_sub_pass").value) || 33;
            const credit = document.getElementById("m_sub_credit").value.trim();
            const status = document.getElementById("m_sub_status").value;

            if (passMarks > fullMarks) {
                this.showModalAlert("Pass marks cannot be greater than full marks.");
                return;
            }

            const dupCode = this.subjects.find(s => s.code.toLowerCase() === code.toLowerCase() && s.id !== this.editingId);
            if (dupCode) {
                this.showModalAlert(`Subject code "${code}" already exists.`);
                return;
            }

            const now = Date.now();
            const id = this.editingId || "sub_" + now;
            const payload = { id, name, code, shortName, typeName, order, fullMarks, passMarks, credit, status, updatedAt: now };
            if (!this.editingId) payload.createdAt = now;

            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/subjects/${id}`, payload);
            this.closeModal();
            this.showToast("Subject saved successfully.");
            await this.loadAllData();
        },

        saveAssignment: async function () {
            const subjectId = document.getElementById("m_asgn_sub").value;
            const classId = document.getElementById("m_asgn_class").value;
            const sectionId = document.getElementById("m_asgn_sec").value;
            const groupId = document.getElementById("m_asgn_grp").value;
            const shiftId = document.getElementById("m_asgn_shift").value;

            const sub = this.subjects.find(x => x.id === subjectId);
            const cl = this.classes.find(x => x.id === classId);
            const sec = this.sections.find(x => x.id === sectionId);
            const grp = this.groups.find(x => x.id === groupId);
            const shf = this.shifts.find(x => x.id === shiftId);

            // Duplicate assignment check
            const dup = this.assignments.find(a => 
                a.subjectId === subjectId &&
                a.classId === classId &&
                (a.sectionId || "") === (sectionId || "") &&
                (a.groupId || "") === (groupId || "") &&
                (a.shiftId || "") === (shiftId || "")
            );

            if (dup) {
                this.showModalAlert("This subject is already assigned to this specific class/group/section.");
                return;
            }

            const now = Date.now();
            const id = "asgn_" + now;
            const payload = {
                id,
                subjectId,
                subjectName: sub ? sub.name : "",
                classId,
                className: cl ? cl.name : "",
                sectionId: sectionId || null,
                sectionName: sec ? sec.name : null,
                groupId: groupId || null,
                groupName: grp ? grp.name : null,
                shiftId: shiftId || null,
                shiftName: shf ? shf.name : null,
                status: "Active",
                createdAt: now
            };

            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/subject_assignments/${id}`, payload);
            this.closeModal();
            this.showToast("Subject assigned successfully.");
            await this.loadAllData();
        },

        saveComponent: async function () {
            const name = document.getElementById("m_comp_name").value.trim();
            const maxMarks = parseFloat(document.getElementById("m_comp_max").value) || 0;
            const passMarks = parseFloat(document.getElementById("m_comp_pass").value) || 0;
            const weight = parseFloat(document.getElementById("m_comp_weight").value) || 100;
            const order = parseInt(document.getElementById("m_comp_order").value) || 1;

            if (maxMarks <= 0) {
                this.showModalAlert("Maximum marks must be greater than zero.");
                return;
            }

            const now = Date.now();
            const compId = "comp_" + now;
            const payload = { id: compId, name, maxMarks, passMarks, weight, order, status: "Active" };

            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/marks_components/${this.currentSubjectForMarks}/components/${compId}`, payload);
            this.closeModal();
            this.showToast("Marks component added.");
            await this.loadAllData();
        },

        saveSubjectType: async function () {
            const name = document.getElementById("m_type_name").value.trim();
            const code = document.getElementById("m_type_code").value.trim().toUpperCase();
            const status = document.getElementById("m_type_status").value;
            const isElective = document.getElementById("m_type_elective").checked;

            const dup = this.subjectTypes.find(t => (t.name.toLowerCase() === name.toLowerCase() || t.code === code) && t.id !== this.editingId);
            if (dup) {
                this.showModalAlert("Subject type name or code already exists.");
                return;
            }

            const now = Date.now();
            const id = this.editingId || "type_" + now;
            const payload = { id, name, code, status, isElective, updatedAt: now };
            if (!this.editingId) payload.createdAt = now;

            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/subject_types/${id}`, payload);
            this.closeModal();
            this.showToast("Subject type saved.");
            await this.loadAllData();
        },

        saveGradeRule: async function () {
            const name = document.getElementById("m_grade_name").value.trim().toUpperCase();
            const minScore = parseFloat(document.getElementById("m_grade_min").value);
            const maxScore = parseFloat(document.getElementById("m_grade_max").value);
            const point = parseFloat(document.getElementById("m_grade_point").value);
            const status = document.getElementById("m_grade_status").value;

            if (minScore > maxScore) {
                this.showModalAlert("Minimum score cannot be greater than maximum score.");
                return;
            }

            const dup = this.gradeRules.find(g => g.name === name && g.id !== this.editingId);
            if (dup) {
                this.showModalAlert(`Grade "${name}" already exists.`);
                return;
            }

            const now = Date.now();
            const id = this.editingId || "grd_" + now;
            const payload = { id, name, minScore, maxScore, point, status, updatedAt: now };
            if (!this.editingId) payload.createdAt = now;

            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/grade_rules/${id}`, payload);
            this.closeModal();
            this.showToast("Grade rule saved.");
            await this.loadAllData();
        },

        // ---------------- TOGGLES & PROTECTED DELETES ----------------
        toggleSubjectStatus: async function (id) {
            const s = this.subjects.find(x => x.id === id);
            if (!s) return;
            const newStatus = s.status === "Active" ? "Inactive" : "Active";
            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/subjects/${id}/status`, newStatus);
            this.showToast(`Subject "${s.name}" is now ${newStatus}.`);
            await this.loadAllData();
        },

        toggleAssignmentStatus: async function (id) {
            const a = this.assignments.find(x => x.id === id);
            if (!a) return;
            const newStatus = a.status === "Active" ? "Inactive" : "Active";
            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/subject_assignments/${id}/status`, newStatus);
            this.showToast(`Assignment status updated to ${newStatus}.`);
            await this.loadAllData();
        },

        deleteSubject: async function (id) {
            const s = this.subjects.find(x => x.id === id);
            if (!s) return;

            // Protection: Check if assigned to any class
            const hasAssignments = this.assignments.some(a => a.subjectId === id);
            if (hasAssignments) {
                this.showToast(`Cannot delete subject "${s.name}" because it is actively assigned to classes. Please remove its assignments first, or set status to Inactive.`, "error");
                return;
            }

            this.confirmAction(
                "Delete Subject?",
                `Permanently delete subject "${s.name}" (${s.code}) from this session?`,
                async () => {
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/subjects/${id}`, null);
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/marks_components/${id}`, null);
                    this.showToast("Subject deleted.");
                    await this.loadAllData();
                }
            );
        },

        deleteAssignment: async function (id) {
            this.confirmAction(
                "Remove Assignment?",
                "Are you sure you want to remove this subject assignment?",
                async () => {
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/subject_assignments/${id}`, null);
                    this.showToast("Assignment removed.");
                    await this.loadAllData();
                }
            );
        },

        deleteComponent: async function (subjectId, compId) {
            this.confirmAction(
                "Delete Marks Component?",
                "Are you sure you want to delete this marks component?",
                async () => {
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/marks_components/${subjectId}/components/${compId}`, null);
                    this.showToast("Component deleted.");
                    await this.loadAllData();
                }
            );
        },

        deleteSubjectType: async function (id) {
            const t = this.subjectTypes.find(x => x.id === id);
            if (!t) return;
            this.confirmAction(
                "Delete Subject Type?",
                `Are you sure you want to delete type "${t.name}"?`,
                async () => {
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/subject_types/${id}`, null);
                    this.showToast("Subject type deleted.");
                    await this.loadAllData();
                }
            );
        },

        deleteGradeRule: async function (id) {
            const g = this.gradeRules.find(x => x.id === id);
            if (!g) return;
            this.confirmAction(
                "Delete Grade Rule?",
                `Are you sure you want to delete grade rule "${g.name}"?`,
                async () => {
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/grade_rules/${id}`, null);
                    this.showToast("Grade rule deleted.");
                    await this.loadAllData();
                }
            );
        },

        confirmAction: function (title, message, callback) {
            if (typeof window.showConfirmModal === "function") {
                window.showConfirmModal({ title, message, confirmText: "Confirm", onConfirm: callback });
            } else if (confirm(`${title}\n\n${message}`)) {
                callback();
            }
        },

        showToast: function (msg, type = "success") {
            if (typeof window.showToast === "function") window.showToast(msg, type);
            else alert(msg);
        }
    };

    window.ExamSubjectSetup = SubjectMarksSetup;

    if (window.ExamSystem) {
        window.ExamSystem.registerModule("subjectMarksSetup", SubjectMarksSetup);
    } else {
        window.addEventListener("DOMContentLoaded", () => {
            if (window.ExamSystem) window.ExamSystem.registerModule("subjectMarksSetup", SubjectMarksSetup);
        });
    }
})();
