/* =========================================================
   EXAMINATION MANAGEMENT SYSTEM
   Main Module
   ========================================================= */

(function () {
    'use strict';

    const EXAM_MENU_ID = 'examination-menu-parent';
    const EXAM_VIEW_ID = 'examination-dashboard-view';

    /* ---------------------------------------------------------
       MAIN MENU
       --------------------------------------------------------- */

    function createExaminationMenu() {

        if (document.getElementById(EXAM_MENU_ID)) return;

        const sidebar =
            document.getElementById('sidebar') ||
            document.querySelector('.sidebar');

        if (!sidebar) {
            console.error('Examination: Sidebar not found.');
            return;
        }

        const menu = document.createElement('div');

        menu.id = EXAM_MENU_ID;
        menu.className = 'menu-item examination-menu-parent';

        menu.innerHTML = `
            <div class="menu-link examination-menu-toggle"
                 style="cursor:pointer;">

                <span class="menu-icon">🎓</span>

                <span class="menu-text">
                    Examination Management
                </span>

                <span class="menu-arrow">⌄</span>
            </div>

            <div class="examination-submenu"
                 style="display:none;">

                <div class="examination-submenu-item"
                     data-exam-view="examination-dashboard-view">
                    📊 Examination Dashboard
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="academic-setup-view">
                    🏫 Academic Setup
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="student-management-view">
                    👨‍🎓 Student Management
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="subject-marks-view">
                    📚 Subject & Marks Setup
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="exam-setup-view">
                    📝 Exam Setup
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="exam-routine-view">
                    📅 Exam Routine
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="seat-plan-view">
                    🪑 Seat Plan
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="exam-attendance-view">
                    ✅ Attendance
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="marks-entry-view">
                    ✏️ Marks Entry
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="marks-verification-view">
                    🔍 Marks Verification
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="result-processing-view">
                    🧮 Result Processing
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="report-card-view">
                    📄 Report Card
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="tabulation-view">
                    📋 Tabulation Sheet
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="merit-list-view">
                    🏆 Merit List
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="result-publish-view">
                    📢 Result Publish
                </div>

                <div class="examination-submenu-item"
                     data-exam-view="examination-reports-view">
                    📊 Reports & Analytics
                </div>

            </div>
        `;

        sidebar.appendChild(menu);

        setupExaminationMenuEvents();
    }


    /* ---------------------------------------------------------
       MENU EVENTS
       --------------------------------------------------------- */

    function setupExaminationMenuEvents() {

        const toggle =
            document.querySelector('.examination-menu-toggle');

        const submenu =
            document.querySelector('.examination-submenu');

        if (!toggle || !submenu) return;

        toggle.addEventListener('click', function () {

            const isOpen = submenu.style.display === 'block';

            submenu.style.display = isOpen ? 'none' : 'block';

            const arrow =
                toggle.querySelector('.menu-arrow');

            if (arrow) {
                arrow.textContent = isOpen ? '⌄' : '⌃';
            }
        });


        document
            .querySelectorAll('.examination-submenu-item')
            .forEach(item => {

                item.addEventListener('click', function () {

                    const viewId =
                        this.getAttribute('data-exam-view');

                    openExaminationView(viewId);

                });

            });
    }


    /* ---------------------------------------------------------
       VIEW CONTAINER
       --------------------------------------------------------- */

    function createExaminationViews() {

        const existing =
            document.getElementById(EXAM_VIEW_ID);

        if (existing) return;


        const mainContainer =
            document.querySelector('main') ||
            document.querySelector('.main-content') ||
            document.querySelector('.content-area') ||
            document.querySelector('#main-content');

        if (!mainContainer) {
            console.error(
                'Examination: Main content container not found.'
            );
            return;
        }


        const views = [

            {
                id: 'examination-dashboard-view',
                title: 'Examination Dashboard'
            },

            {
                id: 'academic-setup-view',
                title: 'Academic Setup'
            },

            {
                id: 'student-management-view',
                title: 'Student Management'
            },

            {
                id: 'subject-marks-view',
                title: 'Subject & Marks Setup'
            },

            {
                id: 'exam-setup-view',
                title: 'Exam Setup'
            },

            {
                id: 'exam-routine-view',
                title: 'Exam Routine'
            },

            {
                id: 'seat-plan-view',
                title: 'Seat Plan'
            },

            {
                id: 'exam-attendance-view',
                title: 'Attendance'
            },

            {
                id: 'marks-entry-view',
                title: 'Marks Entry'
            },

            {
                id: 'marks-verification-view',
                title: 'Marks Verification'
            },

            {
                id: 'result-processing-view',
                title: 'Result Processing'
            },

            {
                id: 'report-card-view',
                title: 'Report Card'
            },

            {
                id: 'tabulation-view',
                title: 'Tabulation Sheet'
            },

            {
                id: 'merit-list-view',
                title: 'Merit List'
            },

            {
                id: 'result-publish-view',
                title: 'Result Publish'
            },

            {
                id: 'examination-reports-view',
                title: 'Reports & Analytics'
            }

        ];


        views.forEach((view, index) => {

            const panel =
                document.createElement('section');

            panel.id = view.id;

            panel.className =
                'view-panel examination-view-panel';

            panel.style.display =
                index === 0 ? 'block' : 'none';


            panel.innerHTML = `
                <div class="examination-page-header">

                    <div>
                        <h1>${view.title}</h1>

                        <p>
                            Examination Management System
                        </p>
                    </div>

                </div>

                <div class="examination-page-content">

                    ${
                        view.id === EXAM_VIEW_ID
                        ?
                        `
                        <div class="exam-welcome-card">

                            <div class="exam-welcome-icon">
                                🎓
                            </div>

                            <h2>
                                Examination Management
                            </h2>

                            <p>
                                Welcome to the Examination
                                Management System.
                            </p>

                            <p>
                                Academic setup, students,
                                examinations and results
                                will be managed from here.
                            </p>

                        </div>
                        `
                        :
                        `
                        <div class="exam-module-placeholder">

                            <h2>
                                ${view.title}
                            </h2>

                            <p>
                                This module will be developed
                                here.
                            </p>

                        </div>
                        `
                    }

                </div>
            `;


            mainContainer.appendChild(panel);

        });

        addExaminationStyles();
    }


    /* ---------------------------------------------------------
       OPEN VIEW
       --------------------------------------------------------- */

    function openExaminationView(viewId) {

        document
            .querySelectorAll('.view-panel')
            .forEach(panel => {

                panel.style.display = 'none';

            });


        const target =
            document.getElementById(viewId);

        if (!target) {
            console.error(
                'Examination view not found:',
                viewId
            );
            return;
        }


        target.style.display = 'block';


        document
            .querySelectorAll('.examination-submenu-item')
            .forEach(item => {

                item.classList.remove('active');

            });


        const activeItem =
            document.querySelector(
                `[data-exam-view="${viewId}"]`
            );

        if (activeItem) {
            activeItem.classList.add('active');
        }


        const title =
            target.querySelector('h1');

        const topTitle =
            document.getElementById('top-title');

        if (title && topTitle) {
            topTitle.textContent =
                title.textContent;
        }
    }


    /* ---------------------------------------------------------
       CSS
       --------------------------------------------------------- */

    function addExaminationStyles() {

        if (
            document.getElementById(
                'examination-main-styles'
            )
        ) {
            return;
        }


        const style =
            document.createElement('style');

        style.id =
            'examination-main-styles';


        style.textContent = `

            .examination-submenu {
                padding-left: 18px;
                margin-top: 4px;
            }

            .examination-submenu-item {
                padding: 9px 12px;
                margin: 2px 0;
                border-radius: 7px;
                cursor: pointer;
                font-size: 14px;
                transition: 0.2s;
            }

            .examination-submenu-item:hover {
                background: #f0f2ff;
            }

            .examination-submenu-item.active {
                background: #e8eaff;
                font-weight: 600;
            }

            .examination-view-panel {
                padding: 25px;
                box-sizing: border-box;
            }

            .examination-page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }

            .examination-page-header h1 {
                margin: 0;
                font-size: 28px;
            }

            .examination-page-header p {
                margin-top: 6px;
                color: #777;
            }

            .exam-welcome-card {
                background: #ffffff;
                border-radius: 15px;
                padding: 35px;
                text-align: center;
                box-shadow: 0 4px 20px rgba(0,0,0,0.07);
            }

            .exam-welcome-icon {
                font-size: 55px;
                margin-bottom: 10px;
            }

            .exam-welcome-card h2 {
                margin-bottom: 10px;
            }

            .exam-welcome-card p {
                color: #666;
            }

            .exam-module-placeholder {
                background: #fff;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 3px 15px rgba(0,0,0,0.06);
            }

        `;


        document.head.appendChild(style);
    }


    /* ---------------------------------------------------------
       INITIALIZE
       --------------------------------------------------------- */

    function initializeExaminationSystem() {

        createExaminationMenu();

        createExaminationViews();

        console.log(
            'Examination Management System initialized.'
        );
    }


    /* ---------------------------------------------------------
       GLOBAL ACCESS
       --------------------------------------------------------- */

    window.ExaminationManagement = {

        init: initializeExaminationSystem,

        openView: openExaminationView

    };


    /* ---------------------------------------------------------
       START AFTER PAGE LOAD
       --------------------------------------------------------- */

    if (document.readyState === 'loading') {

        document.addEventListener(
            'DOMContentLoaded',
            initializeExaminationSystem
        );

    } else {

        initializeExaminationSystem();

    }

})();
