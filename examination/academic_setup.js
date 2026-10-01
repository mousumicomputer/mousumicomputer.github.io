/**
 * Mousumi Computer - Dynamic Examination Management System
 * Academic Session Management Module (100% Dynamic - Zero Hardcode)
 */

(function () {
    "use strict";

    const AcademicSetup = {
        sessions: [],
        activeSessionId: null,
        editingSessionId: null,

        init: function () {
            this.bindEvents();
            this.fetchSessions();
        },

        bindEvents: function () {
            // Re-render when navigated to academic setup
            window.addEventListener("exam-navigate", (e) => {
                if (e.detail === "academic-setup") {
                    this.fetchSessions();
                }
            });
        },

        // Fetch all sessions from Firebase RTDB
        fetchSessions: async function () {
            try {
                if (typeof window.getDatabase === "function" && typeof window.ref === "function" && typeof window.get === "function") {
                    const db = window.getDatabase();
                    const sessionsRef = window.ref(db, "exam_system/sessions");
                    const configRef = window.ref(db, "exam_system/config");

                    const [sessionsSnap, configSnap] = await Promise.all([
                        window.get(sessionsRef),
                        window.get(configRef)
                    ]);

                    const rawSessions = sessionsSnap.exists() ? sessionsSnap.val() : {};
                    this.sessions = Object.values(rawSessions).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

                    const configData = configSnap.exists() ? configSnap.val() : {};
                    this.activeSessionId = configData.active_session_id || null;

                    // Ensure active session consistency
                    const activeObj = this.sessions.find(s => s.id === this.activeSessionId && s.status === "Active");
                    if (activeObj) {
                        window.ExamSystem.activeSession = activeObj;
                    } else if (this.sessions.length > 0) {
                        const fallbackActive = this.sessions.find(s => s.status === "Active");
                        if (fallbackActive) {
                            this.activeSessionId = fallbackActive.id;
                            window.ExamSystem.activeSession = fallbackActive;
                        } else {
                            window.ExamSystem.activeSession = null;
                        }
                    } else {
                        window.ExamSystem.activeSession = null;
                    }
                }
            } catch (err) {
                console.error("[AcademicSetup] Error loading sessions:", err);
            }

            this.render();
            // Sync with dashboard
            if (window.ExamSystem && window.ExamSystem.submodules.dashboard) {
                window.ExamSystem.submodules.dashboard.refresh();
            }
        },

        // Render Session Management UI
        render: function () {
            const container = document.getElementById("exam-academic-setup-panel");
            if (!container) return;

            const activeSession = this.sessions.find(s => s.id === this.activeSessionId && s.status === "Active");

            container.innerHTML = `
                <!-- Active Session Banner -->
                <div class="exam-active-banner ${activeSession ? "banner-active" : "banner-empty"}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div class="active-badge-icon">
                            <i class="fa-solid ${activeSession ? "fa-circle-check" : "fa-triangle-exclamation"}"></i>
                        </div>
                        <div>
                            <span class="active-banner-label">Current Active Academic Session</span>
                            <h3 class="active-banner-title">
                                ${activeSession ? activeSession.name : "No Active Session Configured"}
                            </h3>
                            <p class="active-banner-dates">
                                ${activeSession ? `Timeline: ${activeSession.startDate} to ${activeSession.endDate} &bull; ${activeSession.description || "Active academic cycle"}` : "Please set an active session to process examinations, routines, and marks."}
                            </p>
                        </div>
                    </div>
                    <button class="btn-submit" onclick="ExamAcademicSetup.openModal()" style="width: auto; padding: 9px 18px; font-size: 0.85rem; background: #4f46e5; border-radius: 8px;">
                        <i class="fa-solid fa-plus"></i> Add New Session
                    </button>
                </div>

                <!-- Session List Container Card -->
                <div class="erp-form-card" style="max-width: 100%; padding: 20px;">
                    <div class="erp-form-header" style="margin-bottom: 16px;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fa-solid fa-calendar-days" style="color: #4f46e5;"></i>
                            <span>Academic Sessions Repository</span>
                        </div>
                        <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">Total Sessions: ${this.sessions.length}</span>
                    </div>

                    <!-- Search and Status Filter Toolbar -->
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
                        <div style="position: relative; flex: 1; max-width: 320px;">
                            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 12px; top: 11px; color: #94a3b8; font-size: 0.85rem;"></i>
                            <input type="text" id="sessionSearchInput" placeholder="Search sessions..." oninput="ExamAcademicSetup.filterTable()" 
                                style="width: 100%; padding: 8px 12px 8px 34px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; outline: none;">
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <select id="sessionStatusFilter" onchange="ExamAcademicSetup.filterTable()" 
                                style="padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.85rem; outline: none; background: #ffffff;">
                                <option value="ALL">All Statuses</option>
                                <option value="Active">Active Only</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Closed">Closed</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <!-- Sessions Data Table -->
                    <div class="table-container">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                                    <th style="padding: 12px 14px; font-size: 0.78rem; text-transform: uppercase; color: #64748b;">Session Name</th>
                                    <th style="padding: 12px 14px; font-size: 0.78rem; text-transform: uppercase; color: #64748b;">Start Date</th>
                                    <th style="padding: 12px 14px; font-size: 0.78rem; text-transform: uppercase; color: #64748b;">End Date</th>
                                    <th style="padding: 12px 14px; font-size: 0.78rem; text-transform: uppercase; color: #64748b;">Status</th>
                                    <th style="padding: 12px 14px; font-size: 0.78rem; text-transform: uppercase; color: #64748b;">Description</th>
                                    <th style="padding: 12px 14px; font-size: 0.78rem; text-transform: uppercase; color: #64748b; text-align: right;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="academicSessionsTableBody">
                                ${this.generateTableRows(this.sessions)}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Add / Edit Session Modal -->
                <div class="modal-overlay" id="sessionFormModal" style="display: none; align-items: center; justify-content: center; z-index: 999999;">
                    <div class="modal-card" style="max-width: 500px; width: 92%; text-align: left; padding: 22px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
                            <h3 id="sessionModalTitle" style="font-size: 1.1rem; font-weight: 800; color: #1e1b4b; margin: 0;">Add Academic Session</h3>
                            <button type="button" onclick="ExamAcademicSetup.closeModal()" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;">&times;</button>
                        </div>

                        <div id="sessionModalAlert" style="display: none; padding: 8px 12px; border-radius: 6px; font-size: 0.8rem; margin-bottom: 12px; font-weight: 600;"></div>

                        <form id="academicSessionForm" onsubmit="ExamAcademicSetup.handleSubmit(event)">
                            <div style="margin-bottom: 12px;">
                                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 4px;">Session Name <span style="color: #ef4444;">*</span></label>
                                <input type="text" id="sessionInputName" placeholder="e.g. 2026-2027 or 2027-2028" required 
                                    style="width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; outline: none;">
                            </div>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                                <div>
                                    <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 4px;">Start Date <span style="color: #ef4444;">*</span></label>
                                    <input type="date" id="sessionInputStartDate" required 
                                        style="width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem; outline: none;">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 4px;">End Date <span style="color: #ef4444;">*</span></label>
                                    <input type="date" id="sessionInputEndDate" required 
                                        style="width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem; outline: none;">
                                </div>
                            </div>

                            <div style="margin-bottom: 12px;">
                                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 4px;">Lifecycle Status <span style="color: #ef4444;">*</span></label>
                                <select id="sessionInputStatus" required 
                                    style="width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; outline: none; background: #ffffff;">
                                    <option value="Active">Active (Current Running Session)</option>
                                    <option value="Inactive">Inactive (Planned / Not Started)</option>
                                    <option value="Closed">Closed (Completed Academic Cycle)</option>
                                    <option value="Archived">Archived (Historical Records Only)</option>
                                </select>
                            </div>

                            <div style="margin-bottom: 16px;">
                                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 4px;">Description / Notes (Optional)</label>
                                <textarea id="sessionInputDesc" rows="2" placeholder="Institutional remarks or notes regarding this session..." 
                                    style="width: 100%; padding: 9px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.85rem; outline: none; resize: none;"></textarea>
                            </div>

                            <div style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #f1f5f9; padding-top: 14px;">
                                <button type="button" class="btn-modal-cancel" onclick="ExamAcademicSetup.closeModal()" style="width: auto; padding: 9px 18px;">Cancel</button>
                                <button type="submit" id="btnSaveSession" class="btn-submit" style="width: auto; padding: 9px 24px; background: #4f46e5;">
                                    <i class="fa-solid fa-floppy-disk"></i> Save Session
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        // Generate rows with status tags and protected actions
        generateTableRows: function (list) {
            if (!list || list.length === 0) {
                return `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8; font-weight: 600;">No academic sessions found. Click 'Add New Session' to register your first session.</td></tr>`;
            }

            return list.map(s => {
                const isCurrent = (s.id === this.activeSessionId && s.status === "Active");
                let badgeStyle = "background: #f1f5f9; color: #475569;";
                if (s.status === "Active") badgeStyle = "background: #dcfce7; color: #15803d;";
                if (s.status === "Closed") badgeStyle = "background: #fef3c7; color: #b45309;";
                if (s.status === "Archived") badgeStyle = "background: #f1f5f9; color: #64748b;";

                return `
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                        <td style="padding: 12px 14px; font-weight: 700; color: #1e293b;">
                            ${s.name}
                            ${isCurrent ? `<span style="margin-left: 8px; font-size: 0.68rem; background: #4f46e5; color: #ffffff; padding: 2px 8px; border-radius: 12px; font-weight: 700; text-transform: uppercase;">Current Active</span>` : ""}
                        </td>
                        <td style="padding: 12px 14px; color: #64748b; font-size: 0.85rem;">${s.startDate}</td>
                        <td style="padding: 12px 14px; color: #64748b; font-size: 0.85rem;">${s.endDate}</td>
                        <td style="padding: 12px 14px;">
                            <span style="display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; ${badgeStyle}">
                                ${s.status}
                            </span>
                        </td>
                        <td style="padding: 12px 14px; color: #64748b; font-size: 0.85rem; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            ${s.description || "-"}
                        </td>
                        <td style="padding: 12px 14px; text-align: right; white-space: nowrap;">
                            ${!isCurrent && s.status !== "Archived" ? `
                                <button class="btn-action" onclick="ExamAcademicSetup.setActive('${s.id}')" title="Set as Active Session" 
                                    style="background: #eef2ff; color: #4f46e5; padding: 5px 9px;">
                                    <i class="fa-solid fa-star"></i> Activate
                                </button>
                            ` : ""}
                            
                            <button class="btn-action btn-edit" onclick="ExamAcademicSetup.openEditModal('${s.id}')" title="Edit Session" style="padding: 5px 9px;">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>

                            ${s.status === "Active" ? `
                                <button class="btn-action" onclick="ExamAcademicSetup.closeSession('${s.id}')" title="Deactivate / Close Session" 
                                    style="background: #fef3c7; color: #b45309; padding: 5px 9px;">
                                    <i class="fa-solid fa-lock"></i>
                                </button>
                            ` : ""}

                            ${s.status !== "Archived" ? `
                                <button class="btn-action" onclick="ExamAcademicSetup.archiveSession('${s.id}')" title="Archive Session" 
                                    style="background: #f1f5f9; color: #475569; padding: 5px 9px;">
                                    <i class="fa-solid fa-box-archive"></i>
                                </button>
                            ` : ""}

                            <button class="btn-action btn-delete" onclick="ExamAcademicSetup.deleteSession('${s.id}')" title="Delete Session" style="padding: 5px 9px;">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join("");
        },

        // Client-side search and status filter
        filterTable: function () {
            const query = (document.getElementById("sessionSearchInput")?.value || "").toLowerCase().trim();
            const statusFilter = document.getElementById("sessionStatusFilter")?.value || "ALL";

            const filtered = this.sessions.filter(s => {
                const matchesQuery = s.name.toLowerCase().includes(query) || (s.description || "").toLowerCase().includes(query);
                const matchesStatus = (statusFilter === "ALL" || s.status === statusFilter);
                return matchesQuery && matchesStatus;
            });

            const tbody = document.getElementById("academicSessionsTableBody");
            if (tbody) tbody.innerHTML = this.generateTableRows(filtered);
        },

        openModal: function () {
            this.editingSessionId = null;
            document.getElementById("sessionModalTitle").innerText = "Add New Academic Session";
            document.getElementById("academicSessionForm").reset();
            document.getElementById("sessionInputStatus").value = "Active";
            document.getElementById("sessionModalAlert").style.display = "none";
            document.getElementById("sessionFormModal").style.display = "flex";
        },

        openEditModal: function (id) {
            const s = this.sessions.find(item => item.id === id);
            if (!s) return;

            this.editingSessionId = s.id;
            document.getElementById("sessionModalTitle").innerText = "Edit Academic Session";
            document.getElementById("sessionInputName").value = s.name;
            document.getElementById("sessionInputStartDate").value = s.startDate;
            document.getElementById("sessionInputEndDate").value = s.endDate;
            document.getElementById("sessionInputStatus").value = s.status;
            document.getElementById("sessionInputDesc").value = s.description || "";
            document.getElementById("sessionModalAlert").style.display = "none";
            document.getElementById("sessionFormModal").style.display = "flex";
        },

        closeModal: function () {
            document.getElementById("sessionFormModal").style.display = "none";
            this.editingSessionId = null;
        },

        showModalAlert: function (msg, isSuccess = false) {
            const el = document.getElementById("sessionModalAlert");
            if (!el) return;
            el.innerText = msg;
            el.style.display = "block";
            el.style.background = isSuccess ? "#dcfce7" : "#fee2e2";
            el.style.color = isSuccess ? "#15803d" : "#ef4444";
        },

        // Submit Form Handler with Data Validation
        handleSubmit: async function (e) {
            e.preventDefault();
            const name = document.getElementById("sessionInputName").value.trim();
            const startDate = document.getElementById("sessionInputStartDate").value;
            const endDate = document.getElementById("sessionInputEndDate").value;
            const status = document.getElementById("sessionInputStatus").value;
            const description = document.getElementById("sessionInputDesc").value.trim();

            if (!name) {
                this.showModalAlert("Please enter a valid session name.");
                return;
            }

            // Date validation: End date must be after Start date
            if (new Date(endDate) <= new Date(startDate)) {
                this.showModalAlert("End Date must be strictly after Start Date.");
                return;
            }

            // Duplicate Name validation
            const duplicate = this.sessions.find(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== this.editingSessionId);
            if (duplicate) {
                this.showModalAlert(`A session with the name "${name}" already exists.`);
                return;
            }

            const btn = document.getElementById("btnSaveSession");
            btn.disabled = true;
            btn.innerText = "Saving...";

            try {
                const now = Date.now();
                let sessionId = this.editingSessionId;

                if (!sessionId) {
                    sessionId = "sess_" + now;
                }

                const sessionPayload = {
                    id: sessionId,
                    name: name,
                    startDate: startDate,
                    endDate: endDate,
                    status: status,
                    description: description,
                    updatedAt: now
                };

                if (!this.editingSessionId) {
                    sessionPayload.createdAt = now;
                }

                // If this session is marked Active, deactivate all others
                if (status === "Active") {
                    for (const s of this.sessions) {
                        if (s.id !== sessionId && s.status === "Active") {
                            await window.ExamSystem.saveData(`sessions/${s.id}/status`, "Inactive");
                        }
                    }
                    await window.ExamSystem.saveData("config/active_session_id", sessionId);
                    this.activeSessionId = sessionId;
                } else if (this.activeSessionId === sessionId) {
                    // If the currently active session is being marked inactive/closed/archived
                    await window.ExamSystem.saveData("config/active_session_id", null);
                    this.activeSessionId = null;
                }

                // Save session in Firebase RTDB
                await window.ExamSystem.saveData(`sessions/${sessionId}`, sessionPayload);

                this.closeModal();
                if (typeof window.showToast === "function") {
                    window.showToast("Academic session saved successfully.", "success");
                }
                await this.fetchSessions();
            } catch (err) {
                this.showModalAlert("Failed to save session: " + err.message);
            } finally {
                btn.disabled = false;
                btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Save Session`;
            }
        },

        // Set as Current Active Session
        setActive: async function (id) {
            const target = this.sessions.find(s => s.id === id);
            if (!target) return;

            if (typeof window.showConfirmModal === "function") {
                window.showConfirmModal({
                    title: "Activate Academic Session?",
                    message: `Set "${target.name}" as the active academic session? All subsequent examination and marks operations will default to this session.`,
                    confirmText: "Activate Now",
                    onConfirm: async () => {
                        await this.executeActivation(id);
                    }
                });
            } else {
                if (confirm(`Activate session "${target.name}"?`)) {
                    await this.executeActivation(id);
                }
            }
        },

        executeActivation: async function (id) {
            if (typeof window.showLoader === "function") window.showLoader("Activating Session...");
            try {
                for (const s of this.sessions) {
                    if (s.id !== id && s.status === "Active") {
                        await window.ExamSystem.saveData(`sessions/${s.id}/status`, "Inactive");
                    }
                }
                await window.ExamSystem.saveData(`sessions/${id}/status`, "Active");
                await window.ExamSystem.saveData("config/active_session_id", id);
                await this.fetchSessions();
                if (typeof window.showToast === "function") {
                    window.showToast("Session activated successfully.", "success");
                }
            } catch (err) {
                if (typeof window.showToast === "function") window.showToast("Failed to activate session: " + err.message, "error");
            } finally {
                if (typeof window.hideLoader === "function") window.hideLoader();
            }
        },

        // Deactivate / Close Session
        closeSession: async function (id) {
            const target = this.sessions.find(s => s.id === id);
            if (!target) return;

            const proceed = () => {
                window.showConfirmModal({
                    title: "Close Academic Session?",
                    message: `Closing "${target.name}" will conclude its academic examination cycle. The session will no longer be Active.`,
                    confirmText: "Close Session",
                    onConfirm: async () => {
                        if (typeof window.showLoader === "function") window.showLoader("Closing Session...");
                        try {
                            await window.ExamSystem.saveData(`sessions/${id}/status`, "Closed");
                            if (this.activeSessionId === id) {
                                await window.ExamSystem.saveData("config/active_session_id", null);
                            }
                            await this.fetchSessions();
                            if (typeof window.showToast === "function") window.showToast("Session closed.", "info");
                        } catch (err) {
                            if (typeof window.showToast === "function") window.showToast(err.message, "error");
                        } finally {
                            if (typeof window.hideLoader === "function") window.hideLoader();
                        }
                    }
                });
            };

            if (typeof window.showConfirmModal === "function") {
                proceed();
            } else if (confirm(`Close session "${target.name}"?`)) {
                await window.ExamSystem.saveData(`sessions/${id}/status`, "Closed");
                await this.fetchSessions();
            }
        },

        // Archive Session
        archiveSession: async function (id) {
            const target = this.sessions.find(s => s.id === id);
            if (!target) return;

            const handleArchive = async () => {
                if (typeof window.showLoader === "function") window.showLoader("Archiving Session...");
                try {
                    await window.ExamSystem.saveData(`sessions/${id}/status`, "Archived");
                    if (this.activeSessionId === id) {
                        await window.ExamSystem.saveData("config/active_session_id", null);
                    }
                    await this.fetchSessions();
                    if (typeof window.showToast === "function") window.showToast("Session archived.", "success");
                } catch (err) {
                    if (typeof window.showToast === "function") window.showToast(err.message, "error");
                } finally {
                    if (typeof window.hideLoader === "function") window.hideLoader();
                }
            };

            if (typeof window.showConfirmModal === "function") {
                window.showConfirmModal({
                    title: "Archive Academic Session?",
                    message: `Archiving "${target.name}" retains historical examination records while locking further modifications.`,
                    confirmText: "Archive Now",
                    onConfirm: handleArchive
                });
            } else if (confirm(`Archive session "${target.name}"?`)) {
                handleArchive();
            }
        },

        // Protected Delete: Verifies whether data is associated with this session
        deleteSession: async function (id) {
            const target = this.sessions.find(s => s.id === id);
            if (!target) return;

            // Safety Rule 1: Active session cannot be deleted
            if (target.status === "Active" || this.activeSessionId === id) {
                if (typeof window.showToast === "function") {
                    window.showToast("Cannot delete an Active Session. Please activate another session or close this session first.", "warning");
                } else {
                    alert("Cannot delete an Active Session.");
                }
                return;
            }

            // Safety Rule 2: Check if session has linked student/exam records in `session_data/{id}`
            try {
                if (typeof window.getDatabase === "function" && typeof window.ref === "function" && typeof window.get === "function") {
                    const db = window.getDatabase();
                    const sessionDataRef = window.ref(db, `exam_system/session_data/${id}`);
                    const snap = await window.get(sessionDataRef);

                    if (snap.exists() && Object.keys(snap.val() || {}).length > 0) {
                        const alertMsg = `Cannot delete "${target.name}" because it already has student, examination, or marks records attached. Please Archive or Close this session instead.`;
                        if (typeof window.showToast === "function") {
                            window.showToast(alertMsg, "error");
                        } else {
                            alert(alertMsg);
                        }
                        return;
                    }
                }
            } catch (e) {
                console.warn("[AcademicSetup] Record check error:", e);
            }

            // Confirmation modal
            const handleDelete = async () => {
                if (typeof window.showLoader === "function") window.showLoader("Deleting Session...");
                try {
                    await window.ExamSystem.saveData(`sessions/${id}`, null);
                    await this.fetchSessions();
                    if (typeof window.showToast === "function") window.showToast("Session deleted successfully.", "success");
                } catch (err) {
                    if (typeof window.showToast === "function") window.showToast("Error deleting session: " + err.message, "error");
                } finally {
                    if (typeof window.hideLoader === "function") window.hideLoader();
                }
            };

            if (typeof window.showConfirmModal === "function") {
                window.showConfirmModal({
                    title: "Delete Academic Session?",
                    message: `Are you sure you want to permanently delete session "${target.name}"? This operation cannot be undone.`,
                    confirmText: "Delete Session",
                    onConfirm: handleDelete
                });
            } else if (confirm(`Permanently delete "${target.name}"?`)) {
                handleDelete();
            }
        }
    };

    window.ExamAcademicSetup = AcademicSetup;

    // Register into Core Exam System
    if (window.ExamSystem) {
        window.ExamSystem.registerModule("academicSetup", AcademicSetup);
    } else {
        window.addEventListener("DOMContentLoaded", () => {
            if (window.ExamSystem) window.ExamSystem.registerModule("academicSetup", AcademicSetup);
        });
    }
})();
