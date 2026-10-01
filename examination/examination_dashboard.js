/**
 * Mousumi Computer - Dynamic Examination Management System
 * Examination Dashboard Submodule (English Presentation)
 */

(function () {
    "use strict";

    const ExamDashboard = {
        init: function () {
            this.refresh();
        },

        refresh: function () {
            const stats = {
                activeSession: "Academic Session 2026–2027",
                sessionShort: "2026–2027",
                totalStudents: 0,
                totalClasses: 0,
                totalSubjects: 0,
                activeExams: 0,
                pendingMarks: 0,
                pendingVerify: 0,
                publishedResults: 0
            };

            const setTxt = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.innerText = val;
            };

            setTxt("examStatActiveSession", stats.activeSession);
            setTxt("examStatCardSession", stats.sessionShort);
            setTxt("examStatCardTotalStudents", stats.totalStudents);
            setTxt("examStatCardTotalClasses", stats.totalClasses);
            setTxt("examStatCardTotalSubjects", stats.totalSubjects);
            setTxt("examStatCardActiveExams", stats.activeExams);
            setTxt("examStatCardPendingMarks", stats.pendingMarks);
            setTxt("examStatCardPendingVerify", stats.pendingVerify);
            setTxt("examStatCardPublishedResults", stats.publishedResults);
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
