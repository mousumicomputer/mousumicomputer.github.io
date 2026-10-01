/**
 * Mousumi Computer - Dynamic Examination Management System
 * Academic Setup: Sessions, Classes, Sections, Groups & Shifts Management
 * 100% Dynamic - Session Partitioned - Zero Hardcoding
 */

(function () {
    "use strict";

    const AcademicSetup = {
        activeTab: "sessions", // "sessions" | "classes" | "sections" | "groups" | "shifts"
        sessions: [],
        activeSessionId: null,
        activeSessionObj: null,

        // Data stores for current active session
        classes: [],
        sections: [],
        groups: [],
        shifts: [],

        // Modal tracking
        modalType: null, // "session" | "class" | "section" | "group" | "shift"
        editingId: null,

        init: function () {
            this.injectStyles();
            this.bindEvents();
            this.loadAllData();
        },

        injectStyles: function () {
            if (document.getElementById("academic-setup-extra-styles")) return;
            const style = document.createElement("style");
            style.id = "academic-setup-extra-styles";
            style.innerHTML = `
                /* Academic Setup Tabs Header */
                .acad-tabs-bar {
                    display: flex;
                    gap: 6px;
                    border-bottom: 2px solid #e2e8f0;
                    margin-bottom: 16px;
                    overflow-x: auto;
                    background: #ffffff;
                    padding: 8px 12px 0 12px;
                    border-radius: 10px 10px 0 0;
                }
                .acad-tab-btn {
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
                .acad-tab-btn:hover {
                    color: #4f46e5;
                    background: #f8fafc;
                }
                .acad-tab-btn.active {
                    color: #4f46e5;
                    border-bottom-color: #4f46e5;
                    background: #f5f3ff;
                    border-radius: 8px 8px 0 0;
                }
                .acad-tab-count {
                    font-size: 0.72rem;
                    background: #e2e8f0;
                    color: #475569;
                    padding: 1px 7px;
                    border-radius: 12px;
                    font-weight: 800;
                }
                .acad-tab-btn.active .acad-tab-count {
                    background: #4f46e5;
                    color: #ffffff;
                }
                /* Badge styling */
                .acad-badge-active { background: #dcfce7; color: #15803d; }
                .acad-badge-inactive { background: #fee2e2; color: #b91c1c; }
                .acad-badge-neutral { background: #f1f5f9; color: #475569; }
            `;
            document.head.appendChild(style);
        },

        bindEvents: function () {
            window.addEventListener("exam-navigate", (e) => {
                if (e.detail === "academic-setup") {
                    this.loadAllData();
                }
            });
        },

        // Master Data Loader
        loadAllData: async function () {
            try {
                if (typeof window.getDatabase === "function" && typeof window.ref === "function" && typeof window.get === "function") {
                    const db = window.getDatabase();

                    // 1. Fetch Sessions & Config
                    const [sessionsSnap, configSnap] = await Promise.all([
                        window.get(window.ref(db, "exam_system/sessions")),
                        window.get(window.ref(db, "exam_system/config"))
                    ]);

                    const rawSessions = sessionsSnap.exists() ? sessionsSnap.val() : {};
                    this.sessions = Object.values(rawSessions).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

                    const configData = configSnap.exists() ? configSnap.val() : {};
                    this.activeSessionId = configData.active_session_id || null;
                    this.activeSessionObj = this.sessions.find(s => s.id === this.activeSessionId && s.status === "Active") || null;

                    // 2. Fetch Session-Partitioned Data for the active session
                    if (this.activeSessionId) {
                        const sessionDataRef = window.ref(db, `exam_system/session_data/${this.activeSessionId}`);
                        const sessionDataSnap = await window.get(sessionDataRef);

                        if (sessionDataSnap.exists()) {
                            const data = sessionDataSnap.val();
                            this.classes = Object.values(data.classes || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
                            this.sections = Object.values(data.sections || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
                            this.groups = Object.values(data.groups || {}).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                            this.shifts = Object.values(data.shifts || {}).sort((a, b) => (a.order || 0) - (b.order || 0));
                        } else {
                            this.classes = [];
                            this.sections = [];
                            this.groups = [];
                            this.shifts = [];
                        }
                    } else {
                        this.classes = [];
                        this.sections = [];
                        this.groups = [];
                        this.shifts = [];
                    }
                }
            } catch (err) {
                console.error("[AcademicSetup] Error loading data:", err);
            }

            this.render();

            // Refresh Dashboard live metrics
            if (window.ExamSystem && window.ExamSystem.submodules.dashboard) {
                window.ExamSystem.submodules.dashboard.refresh();
            }
        },

        switchTab: function (tab) {
            this.activeTab = tab;
            this.render();
        },

        // Render main view
        render: function () {
            const container = document.getElementById("exam-academic-setup-panel");
            if (!container) return;

            const isSessionActive = !!this.activeSessionObj;

            container.innerHTML = `
                <!-- Active Academic Session Indicator Banner -->
                <div class="exam-active-banner ${isSessionActive ? "banner-active" : "banner-empty"}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="active-badge-icon">
                            <i class="fa-solid ${isSessionActive ? "fa-circle-check" : "fa-triangle-exclamation"}"></i>
                        </div>
                        <div>
                            <span class="active-banner-label">Active Academic Session Context</span>
                            <h3 class="active-banner-title">
                                ${isSessionActive ? this.activeSessionObj.name : "No Active Academic Session"}
                            </h3>
                            <p class="active-banner-dates">
                                ${isSessionActive ? `All Classes, Sections, Groups & Shifts below belong exclusively to session "${this.activeSessionObj.name}".` : "Please create and activate an Academic Session before managing classes and sections."}
                            </p>
                        </div>
                    </div>
                    ${this.activeTab === "sessions" ? `
                        <button class="btn-submit" onclick="ExamAcademicSetup.openAddModal('session')" style="width: auto; padding: 9px 18px; font-size: 0.85rem; background: #4f46e5; border-radius: 8px;">
                            <i class="fa-solid fa-plus"></i> Add New Session
                        </button>
                    ` : ""}
                </div>

                <!-- Navigation Tabs Bar -->
                <div class="acad-tabs-bar">
                    <button class="acad-tab-btn ${this.activeTab === "sessions" ? "active" : ""}" onclick="ExamAcademicSetup.switchTab('sessions')">
                        <i class="fa-solid fa-calendar-days"></i> Academic Sessions <span class="acad-tab-count">${this.sessions.length}</span>
                    </button>
                    <button class="acad-tab-btn ${this.activeTab === "classes" ? "active" : ""}" onclick="ExamAcademicSetup.switchTab('classes')">
                        <i class="fa-solid fa-school"></i> Classes <span class="acad-tab-count">${this.classes.length}</span>
                    </button>
                    <button class="acad-tab-btn ${this.activeTab === "sections" ? "active" : ""}" onclick="ExamAcademicSetup.switchTab('sections')">
                        <i class="fa-solid fa-layer-group"></i> Sections <span class="acad-tab-count">${this.sections.length}</span>
                    </button>
                    <button class="acad-tab-btn ${this.activeTab === "groups" ? "active" : ""}" onclick="ExamAcademicSetup.switchTab('groups')">
                        <i class="fa-solid fa-users-rectangle"></i> Groups <span class="acad-tab-count">${this.groups.length}</span>
                    </button>
                    <button class="acad-tab-btn ${this.activeTab === "shifts" ? "active" : ""}" onclick="ExamAcademicSetup.switchTab('shifts')">
                        <i class="fa-solid fa-clock"></i> Shifts <span class="acad-tab-count">${this.shifts.length}</span>
                    </button>
                </div>

                <!-- Active Tab Content Area -->
                <div class="erp-form-card" style="max-width: 100%; padding: 20px; border-radius: 0 0 10px 10px;">
                    ${this.renderActiveTabContent()}
                </div>

                <!-- Universal Add/Edit Modal -->
                <div class="modal-overlay" id="acadMasterModal" style="display: none; align-items: center; justify-content: center; z-index: 999999;">
                    <div class="modal-card" style="max-width: 520px; width: 92%; text-align: left; padding: 22px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
                            <h3 id="acadModalTitle" style="font-size: 1.1rem; font-weight: 800; color: #1e1b4b; margin: 0;">Add Item</h3>
                            <button type="button" onclick="ExamAcademicSetup.closeModal()" style="background: none; border: none; font-size: 1.3rem; cursor: pointer; color: #64748b;">&times;</button>
                        </div>
                        <div id="acadModalAlert" style="display: none; padding: 8px 12px; border-radius: 6px; font-size: 0.82rem; margin-bottom: 12px; font-weight: 600;"></div>
                        <form id="acadMasterForm" onsubmit="ExamAcademicSetup.handleModalSubmit(event)">
                            <div id="acadModalBody"></div>
                            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #f1f5f9; padding-top: 14px; margin-top: 16px;">
                                <button type="button" class="btn-modal-cancel" onclick="ExamAcademicSetup.closeModal()" style="width: auto; padding: 8px 18px;">Cancel</button>
                                <button type="submit" id="btnSaveAcadModal" class="btn-submit" style="width: auto; padding: 8px 24px; background: #4f46e5;">
                                    <i class="fa-solid fa-floppy-disk"></i> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        // Render tab content dynamically
        renderActiveTabContent: function () {
            if (this.activeTab === "sessions") return this.renderSessionsView();
            if (!this.activeSessionObj) {
                return `
                    <div style="text-align: center; padding: 45px 20px; color: #64748b;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.2rem; color: #f59e0b; margin-bottom: 12px;"></i>
                        <h4 style="font-size: 1.05rem; font-weight: 800; color: #1e1b4b; margin-bottom: 6px;">No Active Academic Session Found</h4>
                        <p style="font-size: 0.85rem; max-width: 480px; margin: 0 auto 16px auto;">
                            To configure ${this.activeTab}, an active academic session is required so that records are safely partitioned without conflicting across school years.
                        </p>
                        <button class="btn-submit" onclick="ExamAcademicSetup.switchTab('sessions')" style="display: inline-flex; width: auto; padding: 8px 20px; background: #4f46e5;">
                            Go to Academic Sessions
                        </button>
                    </div>
                `;
            }

            if (this.activeTab === "classes") return this.renderClassesView();
            if (this.activeTab === "sections") return this.renderSectionsView();
            if (this.activeTab === "groups") return this.renderGroupsView();
            if (this.activeTab === "shifts") return this.renderShiftsView();
            return "";
        },

        // ---------------- TAB 1: SESSIONS VIEW ----------------
        renderSessionsView: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <span><i class="fa-solid fa-calendar-days" style="color: #4f46e5;"></i> Academic Sessions Repository</span>
                    <button class="btn-submit" onclick="ExamAcademicSetup.openAddModal('session')" style="width: auto; padding: 7px 16px; font-size: 0.82rem; background: #4f46e5;">
                        <i class="fa-solid fa-plus"></i> New Session
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Session Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>Status</th>
                                <th>Description</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.sessions.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding: 25px; color:#94a3b8;">No academic sessions found. Click 'New Session' to create one.</td></tr>` : ""}
                            ${this.sessions.map(s => {
                                const isCurrent = (s.id === this.activeSessionId && s.status === "Active");
                                return `
                                    <tr>
                                        <td style="font-weight: 700; color: #1e293b;">
                                            ${s.name} ${isCurrent ? `<span style="font-size:0.68rem; background:#4f46e5; color:#fff; padding:2px 8px; border-radius:12px; margin-left:6px;">Current Active</span>` : ""}
                                        </td>
                                        <td style="color: #64748b;">${s.startDate}</td>
                                        <td style="color: #64748b;">${s.endDate}</td>
                                        <td><span class="badge ${s.status === "Active" ? "acad-badge-active" : "acad-badge-neutral"}">${s.status}</span></td>
                                        <td style="color: #64748b;">${s.description || "-"}</td>
                                        <td style="text-align: right; white-space: nowrap;">
                                            ${!isCurrent && s.status !== "Archived" ? `
                                                <button class="btn-action" onclick="ExamAcademicSetup.setActiveSession('${s.id}')" style="background: #eef2ff; color: #4f46e5;"><i class="fa-solid fa-star"></i> Activate</button>
                                            ` : ""}
                                            <button class="btn-action btn-edit" onclick="ExamAcademicSetup.openEditModal('session', '${s.id}')"><i class="fa-solid fa-pen"></i></button>
                                            <button class="btn-action btn-delete" onclick="ExamAcademicSetup.deleteSession('${s.id}')"><i class="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        },

        // ---------------- TAB 2: CLASSES VIEW ----------------
        renderClassesView: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <div>
                        <span><i class="fa-solid fa-school" style="color: #4f46e5;"></i> Classes Management</span>
                        <p style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin: 2px 0 0 0;">Configuring classes for session: <strong>${this.activeSessionObj.name}</strong></p>
                    </div>
                    <button class="btn-submit" onclick="ExamAcademicSetup.openAddModal('class')" style="width: auto; padding: 7px 16px; font-size: 0.82rem; background: #4f46e5;">
                        <i class="fa-solid fa-plus"></i> Add Class
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 80px;">Order</th>
                                <th>Class Name</th>
                                <th>Class Code</th>
                                <th>Status</th>
                                <th>Sections Count</th>
                                <th>Description</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.classes.length === 0 ? `<tr><td colspan="7" style="text-align:center; padding: 25px; color:#94a3b8;">No classes added yet for this session. Click 'Add Class' to create one.</td></tr>` : ""}
                            ${this.classes.map(c => {
                                const secCount = this.sections.filter(sec => sec.classId === c.id).length;
                                return `
                                    <tr>
                                        <td style="font-weight: 800; color: #475569;">#${c.order || 1}</td>
                                        <td style="font-weight: 700; color: #1e293b;">${c.name}</td>
                                        <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700;">${c.code}</code></td>
                                        <td><span class="badge ${c.status === "Active" ? "acad-badge-active" : "acad-badge-inactive"}">${c.status}</span></td>
                                        <td style="font-weight: 700; color: #4f46e5;">${secCount} Sections</td>
                                        <td style="color: #64748b;">${c.description || "-"}</td>
                                        <td style="text-align: right; white-space: nowrap;">
                                            <button class="btn-action" onclick="ExamAcademicSetup.toggleClassStatus('${c.id}')" title="Toggle Status" style="background:#f1f5f9; color:#334155;">
                                                <i class="fa-solid fa-power-off"></i>
                                            </button>
                                            <button class="btn-action btn-edit" onclick="ExamAcademicSetup.openEditModal('class', '${c.id}')"><i class="fa-solid fa-pen"></i></button>
                                            <button class="btn-action btn-delete" onclick="ExamAcademicSetup.deleteClass('${c.id}')"><i class="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        },

        // ---------------- TAB 3: SECTIONS VIEW ----------------
        renderSectionsView: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <div>
                        <span><i class="fa-solid fa-layer-group" style="color: #4f46e5;"></i> Class Sections Management</span>
                        <p style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin: 2px 0 0 0;">Configuring sections for session: <strong>${this.activeSessionObj.name}</strong></p>
                    </div>
                    <button class="btn-submit" onclick="ExamAcademicSetup.openAddModal('section')" style="width: auto; padding: 7px 16px; font-size: 0.82rem; background: #4f46e5;">
                        <i class="fa-solid fa-plus"></i> Add Section
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Class</th>
                                <th>Section Name</th>
                                <th>Section Code</th>
                                <th style="width: 80px;">Order</th>
                                <th>Status</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.sections.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding: 25px; color:#94a3b8;">No sections configured yet. Click 'Add Section' to assign a section to a class.</td></tr>` : ""}
                            ${this.sections.map(s => {
                                const parentClass = this.classes.find(c => c.id === s.classId);
                                const className = parentClass ? parentClass.name : "Unassigned";
                                return `
                                    <tr>
                                        <td style="font-weight: 700; color: #4f46e5;">${className}</td>
                                        <td style="font-weight: 700; color: #1e293b;">${s.name}</td>
                                        <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700;">${s.code}</code></td>
                                        <td style="font-weight: 800; color: #475569;">#${s.order || 1}</td>
                                        <td><span class="badge ${s.status === "Active" ? "acad-badge-active" : "acad-badge-inactive"}">${s.status}</span></td>
                                        <td style="text-align: right; white-space: nowrap;">
                                            <button class="btn-action" onclick="ExamAcademicSetup.toggleSectionStatus('${s.id}')" title="Toggle Status" style="background:#f1f5f9; color:#334155;">
                                                <i class="fa-solid fa-power-off"></i>
                                            </button>
                                            <button class="btn-action btn-edit" onclick="ExamAcademicSetup.openEditModal('section', '${s.id}')"><i class="fa-solid fa-pen"></i></button>
                                            <button class="btn-action btn-delete" onclick="ExamAcademicSetup.deleteSection('${s.id}')"><i class="fa-solid fa-trash"></i></button>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        },

        // ---------------- TAB 4: GROUPS VIEW ----------------
        renderGroupsView: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <div>
                        <span><i class="fa-solid fa-users-rectangle" style="color: #4f46e5;"></i> Academic Groups</span>
                        <p style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin: 2px 0 0 0;">Configuring academic discipline groups (e.g. Science, Humanities, Business Studies) for session: <strong>${this.activeSessionObj.name}</strong></p>
                    </div>
                    <button class="btn-submit" onclick="ExamAcademicSetup.openAddModal('group')" style="width: auto; padding: 7px 16px; font-size: 0.82rem; background: #4f46e5;">
                        <i class="fa-solid fa-plus"></i> Add Group
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Group Name</th>
                                <th>Group Code</th>
                                <th>Status</th>
                                <th>Description</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.groups.length === 0 ? `<tr><td colspan="5" style="text-align:center; padding: 25px; color:#94a3b8;">No academic groups created yet. Click 'Add Group' to define one.</td></tr>` : ""}
                            ${this.groups.map(g => `
                                <tr>
                                    <td style="font-weight: 700; color: #1e293b;">${g.name}</td>
                                    <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700;">${g.code}</code></td>
                                    <td><span class="badge ${g.status === "Active" ? "acad-badge-active" : "acad-badge-inactive"}">${g.status}</span></td>
                                    <td style="color: #64748b;">${g.description || "-"}</td>
                                    <td style="text-align: right; white-space: nowrap;">
                                        <button class="btn-action" onclick="ExamAcademicSetup.toggleGroupStatus('${g.id}')" title="Toggle Status" style="background:#f1f5f9; color:#334155;">
                                            <i class="fa-solid fa-power-off"></i>
                                        </button>
                                        <button class="btn-action btn-edit" onclick="ExamAcademicSetup.openEditModal('group', '${g.id}')"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-action btn-delete" onclick="ExamAcademicSetup.deleteGroup('${g.id}')"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        },

        // ---------------- TAB 5: SHIFTS VIEW ----------------
        renderShiftsView: function () {
            return `
                <div class="erp-form-header" style="margin-bottom: 14px;">
                    <div>
                        <span><i class="fa-solid fa-clock" style="color: #4f46e5;"></i> Shifts Management</span>
                        <p style="font-size: 0.78rem; color: #64748b; font-weight: 500; margin: 2px 0 0 0;">Configuring academic shifts (e.g. Morning, Day) for session: <strong>${this.activeSessionObj.name}</strong></p>
                    </div>
                    <button class="btn-submit" onclick="ExamAcademicSetup.openAddModal('shift')" style="width: auto; padding: 7px 16px; font-size: 0.82rem; background: #4f46e5;">
                        <i class="fa-solid fa-plus"></i> Add Shift
                    </button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 80px;">Order</th>
                                <th>Shift Name</th>
                                <th>Shift Code</th>
                                <th>Time Interval</th>
                                <th>Status</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.shifts.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding: 25px; color:#94a3b8;">No shifts created yet. Click 'Add Shift' to define one.</td></tr>` : ""}
                            ${this.shifts.map(sh => `
                                <tr>
                                    <td style="font-weight: 800; color: #475569;">#${sh.order || 1}</td>
                                    <td style="font-weight: 700; color: #1e293b;">${sh.name}</td>
                                    <td><code style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:700;">${sh.code}</code></td>
                                    <td style="color: #475569; font-weight: 600;">
                                        ${sh.startTime || "--:--"} - ${sh.endTime || "--:--"}
                                    </td>
                                    <td><span class="badge ${sh.status === "Active" ? "acad-badge-active" : "acad-badge-inactive"}">${sh.status}</span></td>
                                    <td style="text-align: right; white-space: nowrap;">
                                        <button class="btn-action" onclick="ExamAcademicSetup.toggleShiftStatus('${sh.id}')" title="Toggle Status" style="background:#f1f5f9; color:#334155;">
                                            <i class="fa-solid fa-power-off"></i>
                                        </button>
                                        <button class="btn-action btn-edit" onclick="ExamAcademicSetup.openEditModal('shift', '${sh.id}')"><i class="fa-solid fa-pen"></i></button>
                                        <button class="btn-action btn-delete" onclick="ExamAcademicSetup.deleteShift('${sh.id}')"><i class="fa-solid fa-trash"></i></button>
                                    </td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        },

        // ---------------- MODAL BUILDER & HANDLERS ----------------
        openAddModal: function (type) {
            this.modalType = type;
            this.editingId = null;
            this.buildModalForm();
            document.getElementById("acadMasterModal").style.display = "flex";
        },

        openEditModal: function (type, id) {
            this.modalType = type;
            this.editingId = id;
            this.buildModalForm();
            document.getElementById("acadMasterModal").style.display = "flex";
        },

        closeModal: function () {
            document.getElementById("acadMasterModal").style.display = "none";
            this.modalType = null;
            this.editingId = null;
        },

        showModalAlert: function (msg, isSuccess = false) {
            const el = document.getElementById("acadModalAlert");
            if (!el) return;
            el.innerText = msg;
            el.style.display = "block";
            el.style.background = isSuccess ? "#dcfce7" : "#fee2e2";
            el.style.color = isSuccess ? "#15803d" : "#ef4444";
        },

        buildModalForm: function () {
            const titleEl = document.getElementById("acadModalTitle");
            const bodyEl = document.getElementById("acadModalBody");
            const alertEl = document.getElementById("acadModalAlert");
            if (alertEl) alertEl.style.display = "none";

            const isEdit = !!this.editingId;

            // 1. Session Modal Form
            if (this.modalType === "session") {
                const s = isEdit ? this.sessions.find(x => x.id === this.editingId) : {};
                titleEl.innerText = isEdit ? "Edit Academic Session" : "Add Academic Session";
                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Session Name <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="f_session_name" value="${s.name || ""}" placeholder="e.g. 2026-2027" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Start Date <span style="color:#ef4444;">*</span></label>
                            <input type="date" id="f_session_start" value="${s.startDate || ""}" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">End Date <span style="color:#ef4444;">*</span></label>
                            <input type="date" id="f_session_end" value="${s.endDate || ""}" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Status</label>
                        <select id="f_session_status" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                            <option value="Active" ${s.status === "Active" ? "selected" : ""}>Active (Set as current session)</option>
                            <option value="Inactive" ${s.status === "Inactive" ? "selected" : ""}>Inactive</option>
                            <option value="Closed" ${s.status === "Closed" ? "selected" : ""}>Closed</option>
                            <option value="Archived" ${s.status === "Archived" ? "selected" : ""}>Archived</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Description (Optional)</label>
                        <textarea id="f_session_desc" rows="2" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; resize:none;">${s.description || ""}</textarea>
                    </div>
                `;
            }

            // 2. Class Modal Form
            else if (this.modalType === "class") {
                const c = isEdit ? this.classes.find(x => x.id === this.editingId) : {};
                titleEl.innerText = isEdit ? "Edit Class" : "Add Class";
                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Class Name <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="f_class_name" value="${c.name || ""}" placeholder="e.g. Class 6, Class 10, Grade 9" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Class Code <span style="color:#ef4444;">*</span></label>
                            <input type="text" id="f_class_code" value="${c.code || ""}" placeholder="e.g. CL-06, C10" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Display Order <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="f_class_order" value="${c.order || (this.classes.length + 1)}" min="1" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Status</label>
                        <select id="f_class_status" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                            <option value="Active" ${c.status === "Active" ? "selected" : ""}>Active</option>
                            <option value="Inactive" ${c.status === "Inactive" ? "selected" : ""}>Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Description (Optional)</label>
                        <textarea id="f_class_desc" rows="2" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; resize:none;">${c.description || ""}</textarea>
                    </div>
                `;
            }

            // 3. Section Modal Form
            else if (this.modalType === "section") {
                const sec = isEdit ? this.sections.find(x => x.id === this.editingId) : {};
                titleEl.innerText = isEdit ? "Edit Section" : "Add Section";

                if (this.classes.length === 0) {
                    bodyEl.innerHTML = `<p style="color:#ef4444; font-weight:700; padding:15px 0;">Please create at least one Class first before adding Sections.</p>`;
                    return;
                }

                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Assign to Class <span style="color:#ef4444;">*</span></label>
                        <select id="f_sec_class" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                            ${this.classes.map(cl => `<option value="${cl.id}" ${sec.classId === cl.id ? "selected" : ""}>${cl.name} (${cl.code})</option>`).join("")}
                        </select>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Section Name <span style="color:#ef4444;">*</span></label>
                            <input type="text" id="f_sec_name" value="${sec.name || ""}" placeholder="e.g. A, B, Padma, Rose" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Section Code <span style="color:#ef4444;">*</span></label>
                            <input type="text" id="f_sec_code" value="${sec.code || ""}" placeholder="e.g. SEC-A, PADMA" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Display Order</label>
                            <input type="number" id="f_sec_order" value="${sec.order || (this.sections.length + 1)}" min="1" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Status</label>
                            <select id="f_sec_status" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                                <option value="Active" ${sec.status === "Active" ? "selected" : ""}>Active</option>
                                <option value="Inactive" ${sec.status === "Inactive" ? "selected" : ""}>Inactive</option>
                            </select>
                        </div>
                    </div>
                `;
            }

            // 4. Group Modal Form
            else if (this.modalType === "group") {
                const g = isEdit ? this.groups.find(x => x.id === this.editingId) : {};
                titleEl.innerText = isEdit ? "Edit Academic Group" : "Add Academic Group";
                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Group Name <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="f_grp_name" value="${g.name || ""}" placeholder="e.g. Science, Humanities, Business Studies, General" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Group Code <span style="color:#ef4444;">*</span></label>
                            <input type="text" id="f_grp_code" value="${g.code || ""}" placeholder="e.g. SCI, HUM, BIZ, GEN" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Status</label>
                            <select id="f_grp_status" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                                <option value="Active" ${g.status === "Active" ? "selected" : ""}>Active</option>
                                <option value="Inactive" ${g.status === "Inactive" ? "selected" : ""}>Inactive</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Description (Optional)</label>
                        <textarea id="f_grp_desc" rows="2" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; resize:none;">${g.description || ""}</textarea>
                    </div>
                `;
            }

            // 5. Shift Modal Form
            else if (this.modalType === "shift") {
                const sh = isEdit ? this.shifts.find(x => x.id === this.editingId) : {};
                titleEl.innerText = isEdit ? "Edit Shift" : "Add Shift";
                bodyEl.innerHTML = `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Shift Name <span style="color:#ef4444;">*</span></label>
                        <input type="text" id="f_shift_name" value="${sh.name || ""}" placeholder="e.g. Morning, Day, Evening" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Shift Code <span style="color:#ef4444;">*</span></label>
                            <input type="text" id="f_shift_code" value="${sh.code || ""}" placeholder="e.g. MOR, DAY" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Display Order</label>
                            <input type="number" id="f_shift_order" value="${sh.order || (this.shifts.length + 1)}" min="1" required style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px;">
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Start Time</label>
                            <input type="time" id="f_shift_start" value="${sh.startTime || "08:00"}" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">End Time</label>
                            <input type="time" id="f_shift_end" value="${sh.endTime || "13:00"}" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px;">
                        </div>
                    </div>
                    <div>
                        <label style="display:block; font-size:0.8rem; font-weight:700; color:#334155; margin-bottom:4px;">Status</label>
                        <select id="f_shift_status" style="width:100%; padding:9px 12px; border:1px solid #cbd5e1; border-radius:8px; background:#fff;">
                            <option value="Active" ${sh.status === "Active" ? "selected" : ""}>Active</option>
                            <option value="Inactive" ${sh.status === "Inactive" ? "selected" : ""}>Inactive</option>
                        </select>
                    </div>
                `;
            }
        },

        // Universal Form Submission Router
        handleModalSubmit: async function (e) {
            e.preventDefault();
            const btn = document.getElementById("btnSaveAcadModal");
            btn.disabled = true;
            btn.innerText = "Saving...";

            try {
                if (this.modalType === "session") await this.saveSession();
                else if (this.modalType === "class") await this.saveClass();
                else if (this.modalType === "section") await this.saveSection();
                else if (this.modalType === "group") await this.saveGroup();
                else if (this.modalType === "shift") await this.saveShift();
            } catch (err) {
                this.showModalAlert("Error: " + err.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Changes`;
            }
        },

        // Save Session
        saveSession: async function () {
            const name = document.getElementById("f_session_name").value.trim();
            const startDate = document.getElementById("f_session_start").value;
            const endDate = document.getElementById("f_session_end").value;
            const status = document.getElementById("f_session_status").value;
            const description = document.getElementById("f_session_desc").value.trim();

            if (new Date(endDate) <= new Date(startDate)) {
                this.showModalAlert("End Date must be after Start Date.");
                return;
            }

            const duplicate = this.sessions.find(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== this.editingId);
            if (duplicate) {
                this.showModalAlert(`A session named "${name}" already exists.`);
                return;
            }

            const now = Date.now();
            const id = this.editingId || "sess_" + now;
            const payload = { id, name, startDate, endDate, status, description, updatedAt: now };
            if (!this.editingId) payload.createdAt = now;

            if (status === "Active") {
                for (const s of this.sessions) {
                    if (s.id !== id && s.status === "Active") {
                        await window.ExamSystem.saveData(`sessions/${s.id}/status`, "Inactive");
                    }
                }
                await window.ExamSystem.saveData("config/active_session_id", id);
                this.activeSessionId = id;
            } else if (this.activeSessionId === id) {
                await window.ExamSystem.saveData("config/active_session_id", null);
                this.activeSessionId = null;
            }

            await window.ExamSystem.saveData(`sessions/${id}`, payload);
            this.closeModal();
            this.showToast("Academic Session saved successfully.");
            await this.loadAllData();
        },

        // Save Class
        saveClass: async function () {
            const name = document.getElementById("f_class_name").value.trim();
            const code = document.getElementById("f_class_code").value.trim().toUpperCase();
            const order = parseInt(document.getElementById("f_class_order").value) || 1;
            const status = document.getElementById("f_class_status").value;
            const description = document.getElementById("f_class_desc").value.trim();

            // Validation: Duplicate Name or Code within same session
            const dupName = this.classes.find(c => c.name.toLowerCase() === name.toLowerCase() && c.id !== this.editingId);
            if (dupName) {
                this.showModalAlert(`A class named "${name}" already exists in this session.`);
                return;
            }
            const dupCode = this.classes.find(c => c.code.toLowerCase() === code.toLowerCase() && c.id !== this.editingId);
            if (dupCode) {
                this.showModalAlert(`Class code "${code}" is already in use.`);
                return;
            }

            const now = Date.now();
            const id = this.editingId || "cls_" + now;
            const payload = { id, name, code, order, status, description, updatedAt: now };
            if (!this.editingId) payload.createdAt = now;

            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/classes/${id}`, payload);
            this.closeModal();
            this.showToast("Class saved successfully.");
            await this.loadAllData();
        },

        // Save Section
        saveSection: async function () {
            const classId = document.getElementById("f_sec_class").value;
            const name = document.getElementById("f_sec_name").value.trim();
            const code = document.getElementById("f_sec_code").value.trim().toUpperCase();
            const order = parseInt(document.getElementById("f_sec_order").value) || 1;
            const status = document.getElementById("f_sec_status").value;

            // Validation: Duplicate Section Name or Code for the same class
            const dupName = this.sections.find(s => s.classId === classId && s.name.toLowerCase() === name.toLowerCase() && s.id !== this.editingId);
            if (dupName) {
                this.showModalAlert(`Section "${name}" already exists for this class.`);
                return;
            }

            const now = Date.now();
            const id = this.editingId || "sec_" + now;
            const payload = { id, classId, name, code, order, status, updatedAt: now };
            if (!this.editingId) payload.createdAt = now;

            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/sections/${id}`, payload);
            this.closeModal();
            this.showToast("Section saved successfully.");
            await this.loadAllData();
        },

        // Save Group
        saveGroup: async function () {
            const name = document.getElementById("f_grp_name").value.trim();
            const code = document.getElementById("f_grp_code").value.trim().toUpperCase();
            const status = document.getElementById("f_grp_status").value;
            const description = document.getElementById("f_grp_desc").value.trim();

            const dup = this.groups.find(g => (g.name.toLowerCase() === name.toLowerCase() || g.code === code) && g.id !== this.editingId);
            if (dup) {
                this.showModalAlert(`Group name or code already exists.`);
                return;
            }

            const now = Date.now();
            const id = this.editingId || "grp_" + now;
            const payload = { id, name, code, status, description, updatedAt: now };
            if (!this.editingId) payload.createdAt = now;

            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/groups/${id}`, payload);
            this.closeModal();
            this.showToast("Group saved successfully.");
            await this.loadAllData();
        },

        // Save Shift
        saveShift: async function () {
            const name = document.getElementById("f_shift_name").value.trim();
            const code = document.getElementById("f_shift_code").value.trim().toUpperCase();
            const startTime = document.getElementById("f_shift_start").value;
            const endTime = document.getElementById("f_shift_end").value;
            const order = parseInt(document.getElementById("f_shift_order").value) || 1;
            const status = document.getElementById("f_shift_status").value;

            const dup = this.shifts.find(s => (s.name.toLowerCase() === name.toLowerCase() || s.code === code) && s.id !== this.editingId);
            if (dup) {
                this.showModalAlert(`Shift name or code already exists.`);
                return;
            }

            const now = Date.now();
            const id = this.editingId || "shf_" + now;
            const payload = { id, name, code, startTime, endTime, order, status, updatedAt: now };
            if (!this.editingId) payload.createdAt = now;

            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/shifts/${id}`, payload);
            this.closeModal();
            this.showToast("Shift saved successfully.");
            await this.loadAllData();
        },

        // ---------------- TOGGLE STATUS ACTIONS ----------------
        toggleClassStatus: async function (id) {
            const item = this.classes.find(x => x.id === id);
            if (!item) return;
            const newStatus = item.status === "Active" ? "Inactive" : "Active";
            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/classes/${id}/status`, newStatus);
            this.showToast(`Class "${item.name}" marked ${newStatus}.`);
            await this.loadAllData();
        },

        toggleSectionStatus: async function (id) {
            const item = this.sections.find(x => x.id === id);
            if (!item) return;
            const newStatus = item.status === "Active" ? "Inactive" : "Active";
            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/sections/${id}/status`, newStatus);
            this.showToast(`Section "${item.name}" marked ${newStatus}.`);
            await this.loadAllData();
        },

        toggleGroupStatus: async function (id) {
            const item = this.groups.find(x => x.id === id);
            if (!item) return;
            const newStatus = item.status === "Active" ? "Inactive" : "Active";
            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/groups/${id}/status`, newStatus);
            this.showToast(`Group "${item.name}" marked ${newStatus}.`);
            await this.loadAllData();
        },

        toggleShiftStatus: async function (id) {
            const item = this.shifts.find(x => x.id === id);
            if (!item) return;
            const newStatus = item.status === "Active" ? "Inactive" : "Active";
            await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/shifts/${id}/status`, newStatus);
            this.showToast(`Shift "${item.name}" marked ${newStatus}.`);
            await this.loadAllData();
        },

        // ---------------- DELETE PROTECTION ACTIONS ----------------
        deleteClass: async function (id) {
            const item = this.classes.find(x => x.id === id);
            if (!item) return;

            // Protection Rule 1: Check if sections exist under this class
            const hasSections = this.sections.some(s => s.classId === id);
            if (hasSections) {
                this.showToast(`Cannot delete class "${item.name}" because active sections are assigned to it. Please reassign or delete its sections first, or set status to Inactive.`, "error");
                return;
            }

            this.confirmAction(
                "Delete Class?",
                `Are you sure you want to permanently delete class "${item.name}" from this academic session?`,
                async () => {
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/classes/${id}`, null);
                    this.showToast("Class deleted successfully.");
                    await this.loadAllData();
                }
            );
        },

        deleteSection: async function (id) {
            const item = this.sections.find(x => x.id === id);
            if (!item) return;

            this.confirmAction(
                "Delete Section?",
                `Are you sure you want to delete section "${item.name}"? If students are assigned to this section in future steps, consider disabling it instead.`,
                async () => {
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/sections/${id}`, null);
                    this.showToast("Section deleted.");
                    await this.loadAllData();
                }
            );
        },

        deleteGroup: async function (id) {
            const item = this.groups.find(x => x.id === id);
            if (!item) return;

            this.confirmAction(
                "Delete Group?",
                `Are you sure you want to delete group "${item.name}"?`,
                async () => {
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/groups/${id}`, null);
                    this.showToast("Group deleted.");
                    await this.loadAllData();
                }
            );
        },

        deleteShift: async function (id) {
            const item = this.shifts.find(x => x.id === id);
            if (!item) return;

            this.confirmAction(
                "Delete Shift?",
                `Are you sure you want to delete shift "${item.name}"?`,
                async () => {
                    await window.ExamSystem.saveData(`session_data/${this.activeSessionId}/shifts/${id}`, null);
                    this.showToast("Shift deleted.");
                    await this.loadAllData();
                }
            );
        },

        // Helper: Delete Session
        deleteSession: async function (id) {
            const target = this.sessions.find(s => s.id === id);
            if (!target) return;

            if (target.status === "Active" || this.activeSessionId === id) {
                this.showToast("Cannot delete an Active Session. Please activate another session or close this session first.", "warning");
                return;
            }

            this.confirmAction(
                "Delete Academic Session?",
                `Permanently delete session "${target.name}" and all its historical class/section configurations?`,
                async () => {
                    await window.ExamSystem.saveData(`sessions/${id}`, null);
                    await window.ExamSystem.saveData(`session_data/${id}`, null);
                    this.showToast("Session deleted.");
                    await this.loadAllData();
                }
            );
        },

        // Set Active Session
        setActiveSession: async function (id) {
            const target = this.sessions.find(s => s.id === id);
            if (!target) return;

            this.confirmAction(
                "Activate Academic Session?",
                `Set "${target.name}" as the active academic session? All class, section, exam, and marks views will automatically shift to this session context.`,
                async () => {
                    for (const s of this.sessions) {
                        if (s.id !== id && s.status === "Active") {
                            await window.ExamSystem.saveData(`sessions/${s.id}/status`, "Inactive");
                        }
                    }
                    await window.ExamSystem.saveData(`sessions/${id}/status`, "Active");
                    await window.ExamSystem.saveData("config/active_session_id", id);
                    this.showToast(`Session "${target.name}" is now Active.`);
                    await this.loadAllData();
                }
            );
        },

        // Universal Confirmation Bridge
        confirmAction: function (title, message, callback) {
            if (typeof window.showConfirmModal === "function") {
                window.showConfirmModal({
                    title: title,
                    message: message,
                    confirmText: "Confirm",
                    onConfirm: callback
                });
            } else {
                if (confirm(`${title}\n\n${message}`)) {
                    callback();
                }
            }
        },

        showToast: function (msg, type = "success") {
            if (typeof window.showToast === "function") {
                window.showToast(msg, type);
            } else {
                alert(msg);
            }
        }
    };

    window.ExamAcademicSetup = AcademicSetup;

    if (window.ExamSystem) {
        window.ExamSystem.registerModule("academicSetup", AcademicSetup);
    } else {
        window.addEventListener("DOMContentLoaded", () => {
            if (window.ExamSystem) window.ExamSystem.registerModule("academicSetup", AcademicSetup);
        });
    }
})();
