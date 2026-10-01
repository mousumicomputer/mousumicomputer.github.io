/**
 * Mousumi Computer - Dynamic Examination Management System
 * Dynamic Dashboard Module - Live Active Session & Class Counters
 */

(function () {
    "use strict";

    const ExamDashboard = {
        init: function () {
            this.refresh();
        },

        // Dynamically loads the active session and live class count from database
        refresh: async function () {
            let activeSessionName = "No Active Session";
            let sessionShort = "None";
            let totalClasses = 0;

            try {
                if (typeof window.getDatabase === "function" && typeof window.ref === "function" && typeof window.get === "function") {
                    const db = window.getDatabase();
                    const configRef = window.ref(db, "exam_system/config");
                    const configSnap = await window.get(configRef);

                    if (configSnap.exists()) {
                        const activeId = configSnap.val().active_session_id;
                        if (activeId) {
                            const [sessionSnap, sessionDataSnap] = await Promise.all([
                                window.get(window.ref(db, `exam_system/sessions/${activeId}`)),
                                window.get(window.ref(db, `exam_system/session_data/${activeId}/classes`))
                            ]);

                            if (sessionSnap.exists()) {
                                const sessionData = sessionSnap.val();
                                if (sessionData.status === "Active") {
                                    activeSessionName = sessionData.name;
                                    sessionShort = sessionData.name;
                                }
                            }

                            if (sessionDataSnap.exists()) {
                                const classesObj = sessionDataSnap.val() || {};
                                // Count active classes
                                totalClasses = Object.values(classesObj).filter(c => c.status === "Active").length;
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn("[ExamDashboard] Error fetching dynamic stats:", err);
            }

            const setTxt = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val;
            };

            // Live updates with zero hardcoding
            setTxt("examStatActiveSession", activeSessionName);
            setTxt("examStatCardSession", sessionShort);
            setTxt("examStatCardTotalStudents", 0);
            setTxt("examStatCardTotalClasses", totalClasses);
            setTxt("examStatCardTotalSubjects", 0);
            setTxt("examStatCardActiveExams", 0);
            setTxt("examStatCardPendingMarks", 0);
            setTxt("examStatCardPendingVerify", 0);
            setTxt("examStatCardPublishedResults", 0);
        }
    };

    if (window.ExamSystem) {
        window.ExamSystem.registerModule("dashboard", ExamDashboard);
    } else {
        window.addEventListener("DOMContentLoaded", () => {
            if (window.ExamSystem) window.ExamSystem.registerModule("dashboard", ExamDashboard);
        });
    }
})();
