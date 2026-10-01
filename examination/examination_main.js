/**
 * Mousumi Computer - Dynamic Examination Management System
 * Core Architecture & Compact UI Auto-Injection (Foundation Phase)
 */

(function () {
    "use strict";

    window.ExamSystem = {
        version: "1.0.1-compact",
        dbRoot: "exam_system",
        submodules: {},

        registerModule: function (name, moduleObj) {
            this.submodules[name] = moduleObj;
            if (typeof moduleObj.init === "function") {
                moduleObj.init();
            }
        },

        // Dedicated Compact Styles for Examination System
        injectStyles: function () {
            if (document.getElementById("exam-system-styles")) return;
            const style = document.createElement("style");
            style.id = "exam-system-styles";
            style.innerHTML = `
                /* Compact Top Hero Banner */
                .exam-hero-banner {
                    background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%);
                    border-radius: 12px;
                    padding: 12px 18px;
                    color: #ffffff;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 14px;
                    box-shadow: 0 4px 12px rgba(30, 27, 75, 0.08);
                }
                .exam-hero-left h2 {
                    font-size: 1.15rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin: 0;
                    letter-spacing: -0.2px;
                }
                .exam-hero-left p {
                    font-size: 0.78rem;
                    color: #cbd5e1;
                    margin: 2px 0 0 0;
                }
                .exam-session-pill {
                    background: rgba(255, 255, 255, 0.12);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    padding: 6px 14px;
                    border-radius: 8px;
                    text-align: right;
                    white-space: nowrap;
                }
                .exam-session-pill .label {
                    font-size: 0.65rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #93c5fd;
                    display: block;
                }
                .exam-session-pill .value {
                    font-size: 0.95rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin-top: 1px;
                }

                /* Balanced 4-Column Compact Grid */
                .exam-stat-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 14px;
                }
                @media (max-width: 1200px) {
                    .exam-stat-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 600px) {
                    .exam-stat-grid { grid-template-columns: 1fr; }
                    .exam-hero-banner { flex-direction: column; align-items: flex-start; }
                    .exam-session-pill { text-align: left; width: 100%; }
                }

                /* Compact Metric Card */
                .exam-stat-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-left: 3px solid #4f46e5;
                    border-radius: 10px;
                    padding: 10px 14px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .exam-stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
                }
                .exam-stat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    margin-bottom: 4px;
                }
                .exam-stat-title {
                    font-size: 0.72rem;
                    font-weight: 700;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.4px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0;
                    flex: 1;
                }
                .exam-stat-icon {
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    flex-shrink: 0;
                }
                .exam-stat-amount {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: #0f172a;
                    line-height: 1.2;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Compact Info/Notice Box */
                .exam-notice-box {
                    background: #ffffff;
                    border: 1px dashed #cbd5e1;
                    border-left: 4px solid #4f46e5;
                    border-radius: 10px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .exam-notice-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: #eef2ff;
                    color: #4f46e5;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.95rem;
                    flex-shrink: 0;
                }
                .exam-notice-content h4 {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 0 0 2px 0;
                }
                .exam-notice-content p {
                    font-size: 0.8rem;
                    color: #64748b;
                    margin: 0;
                    line-height: 1.4;
                }
            `;
            document.head.appendChild(style);
        },

        // Auto DOM Ingestion (Sidebar & Views)
        injectDOM: function () {
            this.injectStyles();

            // 1. Sidebar Menu Injection
            if (!document.getElementById("menu-exam-parent")) {
                const settingsMenu = document.getElementById("menu-settings-parent");
                if (settingsMenu && settingsMenu.parentNode) {
                    const li = document.createElement("li");
                    li.className = "menu-item";
                    li.id = "menu-exam-parent";
                    li.innerHTML = `
                        <a onclick="window.ExamSystem.toggleMenu()">
                            <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>Examination Management</span></span>
                            <i class="fa-solid fa-chevron-down chevron-icon"></i>
                        </a>
                        <ul class="submenu-list">
                            <li class="submenu-item" id="sub-exam-dash"><a onclick="ExamSystem.navigateTo('exam-dashboard')"><i class="fa-solid fa-gauge-high"></i> <span>Examination Dashboard</span></a></li>
                            <li class="submenu-item" id="sub-academic-setup"><a onclick="ExamSystem.navigateTo('academic-setup')"><i class="fa-solid fa-school"></i> <span>Academic Setup</span></a></li>
                            <li class="submenu-item" id="sub-student-management"><a onclick="ExamSystem.navigateTo('student-management')"><i class="fa-solid fa-user-graduate"></i> <span>Student Management</span></a></li>
                            <li class="submenu-item" id="sub-subject-marks-setup"><a onclick="ExamSystem.navigateTo('subject-marks-setup')"><i class="fa-solid fa-book-bookmark"></i> <span>Subject & Marks Setup</span></a></li>
                            <li class="submenu-item" id="sub-exam-setup"><a onclick="ExamSystem.navigateTo('exam-setup')"><i class="fa-solid fa-file-pen"></i> <span>Exam Setup</span></a></li>
                            <li class="submenu-item" id="sub-exam-routine"><a onclick="ExamSystem.navigateTo('exam-routine')"><i class="fa-solid fa-calendar-days"></i> <span>Exam Routine</span></a></li>
                            <li class="submenu-item" id="sub-seat-plan"><a onclick="ExamSystem.navigateTo('seat-plan')"><i class="fa-solid fa-chair"></i> <span>Seat Plan</span></a></li>
                            <li class="submenu-item" id="sub-attendance"><a onclick="ExamSystem.navigateTo('attendance')"><i class="fa-solid fa-clipboard-user"></i> <span>Attendance</span></a></li>
                            <li class="submenu-item" id="sub-marks-entry"><a onclick="ExamSystem.navigateTo('marks-entry')"><i class="fa-solid fa-pen-to-square"></i> <span>Marks Entry</span></a></li>
                            <li class="submenu-item" id="sub-marks-verification"><a onclick="ExamSystem.navigateTo('marks-verification')"><i class="fa-solid fa-check-double"></i> <span>Marks Verification</span></a></li>
                            <li class="submenu-item" id="sub-result-processing"><a onclick="ExamSystem.navigateTo('result-processing')"><i class="fa-solid fa-calculator"></i> <span>Result Processing</span></a></li>
                            <li class="submenu-item" id="sub-report-card"><a onclick="ExamSystem.navigateTo('report-card')"><i class="fa-solid fa-id-card"></i> <span>Report Card</span></a></li>
                            <li class="submenu-item" id="sub-tabulation"><a onclick="ExamSystem.navigateTo('tabulation')"><i class="fa-solid fa-table-list"></i> <span>Tabulation Sheet</span></a></li>
                            <li class="submenu-item" id="sub-merit-list"><a onclick="ExamSystem.navigateTo('merit-list')"><i class="fa-solid fa-award"></i> <span>Merit List</span></a></li>
                            <li class="submenu-item" id="sub-result-publish"><a onclick="ExamSystem.navigateTo('result-publish')"><i class="fa-solid fa-bullhorn"></i> <span>Result Publish</span></a></li>
                            <li class="submenu-item" id="sub-examination-reports"><a onclick="ExamSystem.navigateTo('examination-reports')"><i class="fa-solid fa-chart-line"></i> <span>Reports & Analytics</span></a></li>
                        </ul>
                    `;
                    settingsMenu.parentNode.insertBefore(li, settingsMenu);
                }
            }

            // 2. View Panel Ingestion
            if (!document.getElementById("exam-system-view")) {
                const mainWrapper = document.querySelector(".main-wrapper");
                if (mainWrapper) {
                    const viewDiv = document.createElement("div");
                    viewDiv.className = "view-panel";
                    viewDiv.id = "exam-system-view";
                    viewDiv.innerHTML = `
                        <!-- Dashboard Sub-view -->
                        <div id="exam-dashboard-panel" class="exam-sub-panel">
                            <!-- Compact Hero Header -->
                            <div class="exam-hero-banner">
                                <div class="exam-hero-left">
                                    <h2>Examination Management System</h2>
                                    <p>Dynamic Session-Driven Exam, Marks & Result Processing Hub</p>
                                </div>
                                <div class="exam-session-pill">
                                    <span class="label">Active Academic Session</span>
                                    <div class="value" id="examStatActiveSession">Academic Session 2026–2027</div>
                                </div>
                            </div>

                            <!-- Compact Balanced 8-Card Grid (4x2) -->
                            <div class="exam-stat-grid">
                                <!-- Card 1 -->
                                <div class="exam-stat-card" style="border-left-color: #4f46e5;">
                                    <div class="exam-stat-header">
                                        <h4 class="exam-stat-title">Active Session</h4>
                                        <div class="exam-stat-icon" style="background: #eef2ff; color: #4f46e5;"><i class="fa-solid fa-calendar-check"></i></div>
                                    </div>
                                    <div class="exam-stat-amount" id="examStatCardSession" style="font-size: 1.05rem;">2026–2027</div>
                                </div>

                                <!-- Card 2 -->
                                <div class="exam-stat-card" style="border-left-color: #0284c7;">
                                    <div class="exam-stat-header">
                                        <h4 class="exam-stat-title">Total Students</h4>
                                        <div class="exam-stat-icon" style="background: #e0f2fe; color: #0284c7;"><i class="fa-solid fa-user-graduate"></i></div>
                                    </div>
                                    <div class="exam-stat-amount" id="examStatCardTotalStudents">0</div>
                                </div>

                                <!-- Card 3 -->
                                <div class="exam-stat-card" style="border-left-color: #059669;">
                                    <div class="exam-stat-header">
                                        <h4 class="exam-stat-title">Total Classes</h4>
                                        <div class="exam-stat-icon" style="background: #d1fae5; color: #059669;"><i class="fa-solid fa-school"></i></div>
                                    </div>
                                    <div class="exam-stat-amount" id="examStatCardTotalClasses">0</div>
                                </div>

                                <!-- Card 4 -->
                                <div class="exam-stat-card" style="border-left-color: #d97706;">
                                    <div class="exam-stat-header">
                                        <h4 class="exam-stat-title">Total Subjects</h4>
                                        <div class="exam-stat-icon" style="background: #fef3c7; color: #d97706;"><i class="fa-solid fa-book-bookmark"></i></div>
                                    </div>
                                    <div class="exam-stat-amount" id="examStatCardTotalSubjects">0</div>
                                </div>

                                <!-- Card 5 -->
                                <div class="exam-stat-card" style="border-left-color: #8b5cf6;">
                                    <div class="exam-stat-header">
                                        <h4 class="exam-stat-title">Active Exams</h4>
                                        <div class="exam-stat-icon" style="background: #f5f3ff; color: #8b5cf6;"><i class="fa-solid fa-file-pen"></i></div>
                                    </div>
                                    <div class="exam-stat-amount" id="examStatCardActiveExams">0</div>
                                </div>

                                <!-- Card 6 -->
                                <div class="exam-stat-card" style="border-left-color: #f97316;">
                                    <div class="exam-stat-header">
                                        <h4 class="exam-stat-title">Pending Marks</h4>
                                        <div class="exam-stat-icon" style="background: #ffedd5; color: #f97316;"><i class="fa-solid fa-clock-rotate-left"></i></div>
                                    </div>
                                    <div class="exam-stat-amount" id="examStatCardPendingMarks" style="color: #f97316;">0</div>
                                </div>

                                <!-- Card 7 -->
                                <div class="exam-stat-card" style="border-left-color: #ef4444;">
                                    <div class="exam-stat-header">
                                        <h4 class="exam-stat-title">Pending Verification</h4>
                                        <div class="exam-stat-icon" style="background: #fee2e2; color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                                    </div>
                                    <div class="exam-stat-amount" id="examStatCardPendingVerify" style="color: #ef4444;">0</div>
                                </div>

                                <!-- Card 8 -->
                                <div class="exam-stat-card" style="border-left-color: #10b981;">
                                    <div class="exam-stat-header">
                                        <h4 class="exam-stat-title">Published Results</h4>
                                        <div class="exam-stat-icon" style="background: #dcfce7; color: #10b981;"><i class="fa-solid fa-circle-check"></i></div>
                                    </div>
                                    <div class="exam-stat-amount" id="examStatCardPublishedResults" style="color: #10b981;">0</div>
                                </div>
                            </div>

                            <!-- Compact Foundation Notice -->
                            <div class="exam-notice-box">
                                <div class="exam-notice-icon"><i class="fa-solid fa-cubes"></i></div>
                                <div class="exam-notice-content">
                                    <h4>Foundation Phase Initialized</h4>
                                    <p>Examination Management System foundation has been successfully initialized. Academic configuration can now be managed from the Academic Setup module.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Dynamic Placeholder Sub-view -->
                        <div id="exam-module-placeholder-panel" class="exam-sub-panel" style="display: none;">
                            <div class="erp-form-card" style="text-align: center; padding: 35px 20px; max-width: 600px; margin: 20px auto;">
                                <div style="width: 50px; height: 50px; border-radius: 50%; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; margin: 0 auto 12px auto;">
                                    <i id="examPlaceholderIcon" class="fa-solid fa-layer-group"></i>
                                </div>
                                <h3 id="examPlaceholderTitle" style="font-size: 1.15rem; font-weight: 800; color: #1e1b4b; margin-bottom: 6px;">Module Name</h3>
                                <p id="examPlaceholderDesc" style="color: #64748b; font-size: 0.85rem; line-height: 1.5; margin: 0 auto 18px auto;">
                                    This module framework is initialized and ready for configuration.
                                </p>
                                <button class="btn-submit" onclick="ExamSystem.navigateTo('exam-dashboard')" style="display: inline-flex; width: auto; padding: 8px 20px; font-size: 0.85rem; background: #4f46e5;">
                                    <i class="fa-solid fa-arrow-left"></i> Back to Dashboard
                                </button>
                            </div>
                        </div>
                    `;
                    mainWrapper.appendChild(viewDiv);
                }
            }
        },

        toggleMenu: function () {
            const m = document.getElementById("menu-exam-parent");
            if (m) {
                const s = m.querySelector(".submenu-list");
                if (s) s.classList.toggle("show");
                m.classList.toggle("open");
            }
        },

        navigateTo: function (submoduleId) {
            document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("active"));
            const examView = document.getElementById("exam-system-view");
            if (examView) examView.classList.add("active");

            document.querySelectorAll(".menu-item").forEach(m => m.classList.remove("active"));
            const parentMenu = document.getElementById("menu-exam-parent");
            if (parentMenu) parentMenu.classList.add("active");

            document.querySelectorAll("#menu-exam-parent .submenu-item").forEach(sm => sm.classList.remove("active"));
            const activeSub = document.getElementById("sub-" + submoduleId);
            if (activeSub) activeSub.classList.add("active");

            const dashPanel = document.getElementById("exam-dashboard-panel");
            const placeholderPanel = document.getElementById("exam-module-placeholder-panel");

            if (submoduleId === "exam-dashboard") {
                if (dashPanel) dashPanel.style.display = "block";
                if (placeholderPanel) placeholderPanel.style.display = "none";
                const titleEl = document.getElementById("top-title");
                if (titleEl) titleEl.innerText = "Examination Dashboard";

                if (this.submodules.dashboard && typeof this.submodules.dashboard.refresh === "function") {
                    this.submodules.dashboard.refresh();
                }
            } else {
                if (dashPanel) dashPanel.style.display = "none";
                if (placeholderPanel) placeholderPanel.style.display = "block";
                this.renderPlaceholder(submoduleId);
            }
        },

        // All Metadata in Strict Professional English
        renderPlaceholder: function (moduleId) {
            const meta = {
                "academic-setup": { title: "Academic Setup", icon: "fa-school", desc: "Configure academic sessions, shifts, classes, sections, groups, and dynamic grade rules." },
                "student-management": { title: "Student Management", icon: "fa-user-graduate", desc: "Manage student enrollments, academic roll numbers, and class allocations." },
                "subject-marks-setup": { title: "Subject & Marks Setup", icon: "fa-book-bookmark", desc: "Define subject structures, paper combinations, and marks distribution schemes." },
                "exam-setup": { title: "Exam Setup", icon: "fa-file-pen", desc: "Create examinations, set exam types, terms, and total marks configurations." },
                "exam-routine": { title: "Exam Routine", icon: "fa-calendar-days", desc: "Schedule exam dates, time slots, and subject-wise timetables." },
                "seat-plan": { title: "Seat Plan", icon: "fa-chair", desc: "Generate roll-wise room allocations and printable seating arrangements." },
                "attendance": { title: "Exam Attendance", icon: "fa-clipboard-user", desc: "Track student attendance, absentees, and exam room registries." },
                "marks-entry": { title: "Marks Entry", icon: "fa-pen-to-square", desc: "Enter student marks by component (CQ, MCQ, Practical, Assessment)." },
                "marks-verification": { title: "Marks Verification", icon: "fa-check-double", desc: "Audit entered marks, verify discrepancies, and lock entries for processing." },
                "result-processing": { title: "Result Processing", icon: "fa-calculator", desc: "Process GPA, total marks, grades, and pass/fail status dynamically." },
                "report-card": { title: "Report Card", icon: "fa-id-card", desc: "Generate and print individual student grade sheets and progress reports." },
                "tabulation": { title: "Tabulation Sheet", icon: "fa-table-list", desc: "Generate class-wide consolidated tabulation sheets for academic records." },
                "merit-list": { title: "Merit List", icon: "fa-award", desc: "Rank students based on GPA, total marks, and institutional criteria." },
                "result-publish": { title: "Result Publish", icon: "fa-bullhorn", desc: "Approve and publish finalized examination results." },
                "examination-reports": { title: "Reports & Analytics", icon: "fa-chart-line", desc: "View institutional exam performance statistics and analytical reports." }
            };

            const data = meta[moduleId] || { title: moduleId.replace(/-/g, " ").toUpperCase(), icon: "fa-cubes", desc: "Module foundation ready." };
            document.getElementById("examPlaceholderTitle").innerText = data.title;
            document.getElementById("examPlaceholderIcon").className = `fa-solid ${data.icon}`;
            document.getElementById("examPlaceholderDesc").innerText = data.desc;
            document.getElementById("top-title").innerText = data.title;
        },

        initFoundation: function () {
            this.injectDOM();
        }
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => window.ExamSystem.initFoundation());
    } else {
        window.ExamSystem.initFoundation();
    }
})();
