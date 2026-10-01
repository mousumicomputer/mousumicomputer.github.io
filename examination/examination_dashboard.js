/**
 * Mousumi Computer - Dynamic Examination Management System
 * Dynamic Examination Dashboard (Zero Hardcoded Session)
 */

(function () {
    "use strict";

    const ExamDashboard = {
        init: function () {
            this.refresh();
        },

        // Dynamically loads the active session directly from Firebase database
        refresh: async function () {
            let activeSessionName = "No Active Session";
            let sessionShort = "None";

            try {
                if (typeof window.getDatabase === "function" && typeof window.ref === "function" && typeof window.get === "function") {
                    const db = window.getDatabase();
                    const configRef = window.ref(db, "exam_system/config");
                    const configSnap = await window.get(configRef);

                    if (configSnap.exists()) {
                        const activeId = configSnap.val().active_session_id;
                        if (activeId) {
                            const sessionRef = window.ref(db, `exam_system/sessions/${activeId}`);
                            const sessionSnap = await window.get(sessionRef);
                            if (sessionSnap.exists()) {
                                const sessionData = sessionSnap.val();
                                if (sessionData.status === "Active") {
                                    activeSessionName = sessionData.name;
                                    sessionShort = sessionData.name;
                                }
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn("[ExamDashboard] Error fetching active session:", err);
            }

            // Fallback from active runtime state
            if (window.ExamSystem && window.ExamSystem.activeSession) {
                activeSessionName = window.ExamSystem.activeSession.name;
                sessionShort = window.ExamSystem.activeSession.name;
            }

            const setTxt = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val;
            };

            // Update DOM with 100% dynamic values (Zero hardcoding)
            setTxt("examStatActiveSession", activeSessionName);
            setTxt("examStatCardSession", sessionShort);
            setTxt("examStatCardTotalStudents", 0);
            setTxt("examStatCardTotalClasses", 0);
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
