/**
 * Mousumi Computer - Dynamic Examination Management System
 * Core Architecture & Auto-DOM Injection Engine (Foundation Phase)
 */

(function () {
    "use strict";

    window.ExamSystem = {
        version: "1.0.0-foundation",
        dbRoot: "exam_system",
        submodules: {},

        registerModule: function (name, moduleObj) {
            this.submodules[name] = moduleObj;
            if (typeof moduleObj.init === "function") {
                moduleObj.init();
            }
        },

        // সাইডবার ও ড্যাশবোর্ড স্বয়ংক্রিয়ভাবে HTML-এ বসানোর ফাংশন
        injectDOM: function () {
            // ১. সাইডবার মেনু ইনজেকশন
            if (!document.getElementById("menu-exam-parent")) {
                const settingsMenu = document.getElementById("menu-settings-parent");
                const menuList = document.querySelector("#sidebar .menu-list");

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

            // ২. ড্যাশবোর্ড ও মডিউল ভিউ ইনজেকশন
            if (!document.getElementById("exam-system-view")) {
                const mainWrapper = document.querySelector(".main-wrapper");
                if (mainWrapper) {
                    const viewDiv = document.createElement("div");
                    viewDiv.className = "view-panel";
                    viewDiv.id = "exam-system-view";
                    viewDiv.innerHTML = `
                        <!-- ড্যাশবোর্ড প্যানেল -->
                        <div id="exam-dashboard-panel" class="exam-sub-panel">
                            <!-- সেশন ব্যানার -->
                            <div class="fintech-hero-card" style="background: linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%); margin-bottom: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
                                    <div style="text-align: left;">
                                        <span style="background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 20px; font-size: 0.78rem; text-transform: uppercase;">
                                            <i class="fa-solid fa-shield-halved"></i> Super Admin Managed
                                        </span>
                                        <h2 style="font-size: 1.6rem; font-weight: 800; margin-top: 8px; color: #fff;">Examination Management</h2>
                                        <p style="font-size: 0.88rem; opacity: 0.85; margin-top: 4px;">ডায়নামিক সেশনভিত্তিক পরীক্ষা ও ফলাফল ব্যবস্থাপনা</p>
                                    </div>
                                    <div style="background: rgba(255,255,255,0.12); padding: 12px 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); text-align: right;">
                                        <div style="font-size: 0.75rem; text-transform: uppercase; color: #cbd5e1;">Active Academic Session</div>
                                        <div id="examStatActiveSession" style="font-size: 1.25rem; font-weight: 800; color: #38bdf8;">Loading...</div>
                                    </div>
                                </div>
                            </div>

                            <!-- ৮টি রিকোয়ার্ড স্ট্যাটিস্টিক কার্ড -->
                            <div class="summary-grid" style="grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 16px; margin-bottom: 25px;">
                                <div class="fintech-card" style="border-left: 4px solid #4f46e5;">
                                    <div class="card-icon" style="background: #eef2ff; color: #4f46e5;"><i class="fa-solid fa-calendar-check"></i></div>
                                    <h4>Active Academic Session</h4>
                                    <div class="amount" id="examStatCardSession" style="font-size: 1.15rem;">None Selected</div>
                                </div>
                                <div class="fintech-card" style="border-left: 4px solid #0284c7;">
                                    <div class="card-icon" style="background: #e0f2fe; color: #0284c7;"><i class="fa-solid fa-user-graduate"></i></div>
                                    <h4>Total Students</h4>
                                    <div class="amount" id="examStatCardTotalStudents">0</div>
                                </div>
                                <div class="fintech-card" style="border-left: 4px solid #059669;">
                                    <div class="card-icon" style="background: #d1fae5; color: #059669;"><i class="fa-solid fa-school"></i></div>
                                    <h4>Total Classes</h4>
                                    <div class="amount" id="examStatCardTotalClasses">0</div>
                                </div>
                                <div class="fintech-card" style="border-left: 4px solid #d97706;">
                                    <div class="card-icon" style="background: #fef3c7; color: #d97706;"><i class="fa-solid fa-book-bookmark"></i></div>
                                    <h4>Total Subjects</h4>
                                    <div class="amount" id="examStatCardTotalSubjects">0</div>
                                </div>
                                <div class="fintech-card" style="border-left: 4px solid #8b5cf6;">
                                    <div class="card-icon" style="background: #f5f3ff; color: #8b5cf6;"><i class="fa-solid fa-file-pen"></i></div>
                                    <h4>Active Examinations</h4>
                                    <div class="amount" id="examStatCardActiveExams">0</div>
                                </div>
                                <div class="fintech-card" style="border-left: 4px solid #f97316;">
                                    <div class="card-icon" style="background: #ffedd5; color: #f97316;"><i class="fa-solid fa-clock-rotate-left"></i></div>
                                    <h4>Pending Marks</h4>
                                    <div class="amount" id="examStatCardPendingMarks" style="color: #f97316;">0</div>
                                </div>
                                <div class="fintech-card" style="border-left: 4px solid #ef4444;">
                                    <div class="card-icon" style="background: #fee2e2; color: #ef4444;"><i class="fa-solid fa-triangle-exclamation"></i></div>
                                    <h4>Pending Verification</h4>
                                    <div class="amount" id="examStatCardPendingVerify" style="color: #ef4444;">0</div>
                                </div>
                                <div class="fintech-card" style="border-left: 4px solid #10b981;">
                                    <div class="card-icon" style="background: #dcfce7; color: #10b981;"><i class="fa-solid fa-circle-check"></i></div>
                                    <h4>Published Results</h4>
                                    <div class="amount" id="examStatCardPublishedResults" style="color: #10b981;">0</div>
                                </div>
                            </div>

                            <!-- ইনফো ব্যানার -->
                            <div class="erp-form-card" style="border: 1px dashed #cbd5e1; background: #ffffff;">
                                <div style="display: flex; align-items: flex-start; gap: 16px;">
                                    <div style="width: 44px; height: 44px; border-radius: 12px; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">
                                        <i class="fa-solid fa-cubes"></i>
                                    </div>
                                    <div>
                                        <h3 style="font-size: 1.1rem; font-weight: 700; color: #1e1b4b; margin-bottom: 6px;">Foundation Phase Ready</h3>
                                        <p style="font-size: 0.9rem; color: #64748b; line-height: 1.5;">
                                            Examination Management System-এর ফ্রেমওয়ার্ক সংযুক্ত হয়েছে। কোনো তথ্য হার্ডকোড করা নেই। পরবর্তী ধাপে "Academic Setup"-এর মাধ্যমে সেশন, ক্লাস ও সেকশন যুক্ত করা যাবে।
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- প্লেসহোল্ডার প্যানেল -->
                        <div id="exam-module-placeholder-panel" class="exam-sub-panel" style="display: none;">
                            <div class="erp-form-card" style="text-align: center; padding: 45px 20px;">
                                <div style="width: 60px; height: 60px; border-radius: 50%; background: #eef2ff; color: #4f46e5; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; margin: 0 auto 15px auto;">
                                    <i id="examPlaceholderIcon" class="fa-solid fa-layer-group"></i>
                                </div>
                                <h3 id="examPlaceholderTitle" style="font-size: 1.3rem; font-weight: 800; color: #1e1b4b; margin-bottom: 8px;">Module Name</h3>
                                <p id="examPlaceholderDesc" style="color: #64748b; font-size: 0.92rem; max-width: 500px; margin: 0 auto 20px auto;">
                                    এই মডিউলটির ফাউন্ডেশন প্রস্তুত। পরবর্তী ধাপে এর ডায়নামিক অ্যাডমিন কন্ট্রোল তৈরি করা হবে।
                                </p>
                                <button class="btn-submit" onclick="ExamSystem.navigateTo('exam-dashboard')" style="display: inline-flex; width: auto; padding: 10px 24px; background: #4f46e5;">
                                    <i class="fa-solid fa-arrow-left"></i> ব্যাক টু ড্যাশবোর্ড
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

        renderPlaceholder: function (moduleId) {
            const meta = {
                "academic-setup": { title: "Academic Setup", icon: "fa-school", desc: "সেশন, শিফট, ক্লাস, সেকশন, গ্রুপ ও ডায়নামিক গ্রেড রুল কনফিগারেশন।" },
                "student-management": { title: "Student Management", icon: "fa-user-graduate", desc: "শ্রেণিভিত্তিক শিক্ষার্থী ডাটা, রোল ও সেশন রেজিস্ট্রেশন।" },
                "subject-marks-setup": { title: "Subject & Marks Setup", icon: "fa-book-bookmark", desc: "বিষয় তালিকা, আবশ্যিক/ঐচ্ছিক ক্যাটাগরি ও মার্কস ডিস্ট্রিবিউশন রুল।" },
                "exam-setup": { title: "Exam Setup", icon: "fa-file-pen", desc: "পরীক্ষার নাম, ধরন, টার্ম ও পূর্ণমান সেটিংস।" },
                "exam-routine": { title: "Exam Routine", icon: "fa-calendar-days", desc: "পরীক্ষার তারিখ, সময় ও বিষয়ভিত্তিক রুটিন প্রস্তুতকরণ।" },
                "seat-plan": { title: "Seat Plan", icon: "fa-chair", desc: "রোলভিত্তিক রুম ও সিট প্ল্যানিং সিস্টেম।" },
                "attendance": { title: "Exam Attendance", icon: "fa-clipboard-user", desc: "পরীক্ষার্থী উপস্থিতি ও অনুপস্থিতির হিসাব ব্যবস্থাপনা।" },
                "marks-entry": { title: "Marks Entry", icon: "fa-pen-to-square", desc: "বিষয় ও খাতভিত্তিক (CQ, MCQ, Practical) নম্বর এন্ট্রি।" },
                "marks-verification": { title: "Marks Verification", icon: "fa-check-double", desc: "নম্বর অডিট, নির্ভুলতা যাচাই ও অনুমোদন।" },
                "result-processing": { title: "Result Processing", icon: "fa-calculator", desc: "জিপিএ, মোট নম্বর ও স্বয়ংক্রিয় পাস/ফেল রেজাল্ট প্রসেসিং।" },
                "report-card": { title: "Report Card", icon: "fa-id-card", desc: "শিক্ষার্থীর একক গ্রেড শিট ও মার্কশিট জেনারেশন।" },
                "tabulation": { title: "Tabulation Sheet", icon: "fa-table-list", desc: "শ্রেণিভিত্তিক সামগ্রিক ট্যাবুলেশন শিট প্রস্তুত ও প্রিন্ট।" },
                "merit-list": { title: "Merit List", icon: "fa-award", desc: "মেধাক্রম, জিপিএ ও সর্বোচ্চ নম্বরের ভিত্তিতে মেধা তালিকা।" },
                "result-publish": { title: "Result Publish", icon: "fa-bullhorn", desc: "ফলাফল চূড়ান্ত অনুমোদন ও সর্বসাধারণের জন্য প্রকাশনা।" },
                "examination-reports": { title: "Reports & Analytics", icon: "fa-chart-line", desc: "পরীক্ষার সামগ্রিক পরিসংখ্যান ও অ্যানালিটিক্স রিপোর্ট।" }
            };

            const data = meta[moduleId] || { title: moduleId.replace(/-/g, " ").toUpperCase(), icon: "fa-cubes", desc: "Foundation Ready." };
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
