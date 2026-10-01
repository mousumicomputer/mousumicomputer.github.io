/* =========================================================
   EXAMINATION MANAGEMENT SYSTEM
   Main Module
   Version: 1.0
   ========================================================= */

(function () {

    'use strict';

    /* =========================================================
       CONFIG
       ========================================================= */

    const EXAM_MENU_ID = 'examination-menu-parent';
    const EXAM_DASHBOARD_ID = 'examination-dashboard-view';


    /* =========================================================
       1. CREATE EXAMINATION MENU
       ========================================================= */

    function createExaminationMenu() {

        // Already exists
        if (document.getElementById(EXAM_MENU_ID)) {
            return;
        }

        const sidebar =
            document.getElementById('sidebar') ||
            document.querySelector('.sidebar');

        if (!sidebar) {
            console.error(
                'Examination Management: Sidebar not found.'
            );
            return;
        }


        const menu = document.createElement('div');

        menu.id = EXAM_MENU_ID;

        menu.className = 'menu-item';


        menu.innerHTML = `

            <!-- MAIN EXAMINATION MENU -->

            <div
                class="menu-link examination-menu-toggle"
                id="examination-menu-toggle"
            >

                <span class="menu-icon">
                    🎓
                </span>

                <span class="menu-text">
                    Examination Management
                </span>

                <span class="menu-arrow">
                    ⌄
                </span>

            </div>


            <!-- EXAMINATION SUB MENU -->

            <div
                class="examination-submenu"
                id="examination-submenu"
            >

                <div
                    class="examination-submenu-item"
                    data-exam-view="examination-dashboard-view"
                >
                    📊
                    <span>Examination Dashboard</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="academic-setup-view"
                >
                    🏫
                    <span>Academic Setup</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="student-management-view"
                >
                    👨‍🎓
                    <span>Student Management</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="subject-marks-view"
                >
                    📚
                    <span>Subject & Marks Setup</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="exam-setup-view"
                >
                    📝
                    <span>Exam Setup</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="exam-routine-view"
                >
                    📅
                    <span>Exam Routine</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="seat-plan-view"
                >
                    🪑
                    <span>Seat Plan</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="exam-attendance-view"
                >
                    ✅
                    <span>Attendance</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="marks-entry-view"
                >
                    ✏️
                    <span>Marks Entry</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="marks-verification-view"
                >
                    🔍
                    <span>Marks Verification</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="result-processing-view"
                >
                    🧮
                    <span>Result Processing</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="report-card-view"
                >
                    📄
                    <span>Report Card</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="tabulation-view"
                >
                    📋
                    <span>Tabulation Sheet</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="merit-list-view"
                >
                    🏆
                    <span>Merit List</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="result-publish-view"
                >
                    📢
                    <span>Result Publish</span>
                </div>


                <div
                    class="examination-submenu-item"
                    data-exam-view="examination-reports-view"
                >
                    📊
                    <span>Reports & Analytics</span>
                </div>

            </div>

        `;


        /*
         * Add menu at the end of sidebar.
         */
        sidebar.appendChild(menu);


        setupExaminationMenuEvents();
    }



    /* =========================================================
       2. MENU EVENTS
       ========================================================= */

    function setupExaminationMenuEvents() {

        const toggle =
            document.getElementById(
                'examination-menu-toggle'
            );

        const submenu =
            document.getElementById(
                'examination-submenu'
            );


        if (!toggle || !submenu) {
            return;
        }


        /*
         * Open / Close Examination submenu
         */

        toggle.addEventListener(
            'click',
            function (event) {

                event.preventDefault();
                event.stopPropagation();


                const isOpen =
                    submenu.classList.contains(
                        'exam-submenu-open'
                    );


                if (isOpen) {

                    submenu.classList.remove(
                        'exam-submenu-open'
                    );

                    submenu.style.display =
                        'none';


                    const arrow =
                        toggle.querySelector(
                            '.menu-arrow'
                        );

                    if (arrow) {
                        arrow.textContent = '⌄';
                    }

                } else {

                    submenu.classList.add(
                        'exam-submenu-open'
                    );

                    submenu.style.display =
                        'block';


                    const arrow =
                        toggle.querySelector(
                            '.menu-arrow'
                        );

                    if (arrow) {
                        arrow.textContent = '⌃';
                    }
                }

            }
        );


        /*
         * Submenu click
         */

        document
            .querySelectorAll(
                '.examination-submenu-item'
            )
            .forEach(function (item) {

                item.addEventListener(
                    'click',
                    function (event) {

                        event.preventDefault();
                        event.stopPropagation();


                        const viewId =
                            item.getAttribute(
                                'data-exam-view'
                            );


                        if (viewId) {
                            openExaminationView(
                                viewId
                            );
                        }

                    }
                );

            });

    }



    /* =========================================================
       3. CREATE EXAMINATION VIEWS
       ========================================================= */

    function createExaminationViews() {

        /*
         * Prevent duplicate creation
         */

        if (
            document.getElementById(
                EXAM_DASHBOARD_ID
            )
        ) {
            return;
        }


        /*
         * Try to find the existing main content area.
         */

        const mainContainer =
            document.querySelector('main') ||
            document.querySelector(
                '.main-content'
            ) ||
            document.querySelector(
                '.content-area'
            ) ||
            document.getElementById(
                'main-content'
            );


        if (!mainContainer) {

            console.error(
                'Examination Management: Main content area not found.'
            );

            return;
        }


        /*
         * All Examination pages
         */

        const views = [

            {
                id:
                    'examination-dashboard-view',

                title:
                    'Examination Dashboard'
            },


            {
                id:
                    'academic-setup-view',

                title:
                    'Academic Setup'
            },


            {
                id:
                    'student-management-view',

                title:
                    'Student Management'
            },


            {
                id:
                    'subject-marks-view',

                title:
                    'Subject & Marks Setup'
            },


            {
                id:
                    'exam-setup-view',

                title:
                    'Exam Setup'
            },


            {
                id:
                    'exam-routine-view',

                title:
                    'Exam Routine'
            },


            {
                id:
                    'seat-plan-view',

                title:
                    'Seat Plan'
            },


            {
                id:
                    'exam-attendance-view',

                title:
                    'Attendance'
            },


            {
                id:
                    'marks-entry-view',

                title:
                    'Marks Entry'
            },


            {
                id:
                    'marks-verification-view',

                title:
                    'Marks Verification'
            },


            {
                id:
                    'result-processing-view',

                title:
                    'Result Processing'
            },


            {
                id:
                    'report-card-view',

                title:
                    'Report Card'
            },


            {
                id:
                    'tabulation-view',

                title:
                    'Tabulation Sheet'
            },


            {
                id:
                    'merit-list-view',

                title:
                    'Merit List'
            },


            {
                id:
                    'result-publish-view',

                title:
                    'Result Publish'
            },


            {
                id:
                    'examination-reports-view',

                title:
                    'Reports & Analytics'
            }

        ];


        /*
         * Create every view
         */

        views.forEach(
            function (view, index) {

                const panel =
                    document.createElement(
                        'section'
                    );


                panel.id =
                    view.id;


                panel.className =
                    'view-panel examination-view-panel';


                /*
                 * Only dashboard visible initially.
                 */

                panel.style.display =
                    index === 0
                        ? 'block'
                        : 'none';


                /*
                 * Dashboard content
                 */

                if (
                    view.id ===
                    'examination-dashboard-view'
                ) {

                    panel.innerHTML = `

                        <div
                            class="examination-page-header"
                        >

                            <div>

                                <h1>
                                    Examination Dashboard
                                </h1>

                                <p>
                                    Examination Management System
                                </p>

                            </div>

                        </div>


                        <div
                            class="exam-welcome-card"
                        >

                            <div
                                class="exam-welcome-icon"
                            >
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

                    `;

                } else {

                    /*
                     * Other pages are placeholders
                     * for now.
                     */

                    panel.innerHTML = `

                        <div
                            class="examination-page-header"
                        >

                            <div>

                                <h1>
                                    ${view.title}
                                </h1>

                                <p>
                                    Examination Management System
                                </p>

                            </div>

                        </div>


                        <div
                            class="exam-module-placeholder"
                        >

                            <h2>
                                ${view.title}
                            </h2>


                            <p>
                                This module will be developed
                                here.
                            </p>

                        </div>

                    `;

                }


                /*
                 * Add to existing main area.
                 */

                mainContainer.appendChild(
                    panel
                );

            }
        );


        /*
         * Add CSS
         */

        addExaminationStyles();

    }



    /* =========================================================
       4. OPEN EXAMINATION VIEW
       ========================================================= */

    function openExaminationView(
        viewId
    ) {

        /*
         * Hide all existing view panels
         */

        document
            .querySelectorAll(
                '.view-panel'
            )
            .forEach(
                function (panel) {

                    panel.style.display =
                        'none';

                }
            );


        /*
         * Find selected view
         */

        const target =
            document.getElementById(
                viewId
            );


        if (!target) {

            console.error(
                'Examination view not found:',
                viewId
            );

            return;
        }


        /*
         * Show selected view
         */

        target.style.display =
            'block';


        /*
         * Remove active status
         */

        document
            .querySelectorAll(
                '.examination-submenu-item'
            )
            .forEach(
                function (item) {

                    item.classList.remove(
                        'active'
                    );

                }
            );


        /*
         * Add active status
         */

        const activeItem =
            document.querySelector(
                '[data-exam-view="' +
                viewId +
                '"]'
            );


        if (activeItem) {

            activeItem.classList.add(
                'active'
            );

        }


        /*
         * Update top title if available
         */

        const title =
            target.querySelector(
                'h1'
            );


        const topTitle =
            document.getElementById(
                'top-title'
            );


        if (
            title &&
            topTitle
        ) {

            topTitle.textContent =
                title.textContent;

        }

    }



    /* =========================================================
       5. EXAMINATION CSS
       ========================================================= */

    function addExaminationStyles() {

        /*
         * Don't add CSS twice.
         */

        if (
            document.getElementById(
                'examination-main-styles'
            )
        ) {
            return;
        }


        const style =
            document.createElement(
                'style'
            );


        style.id =
            'examination-main-styles';


        style.textContent = `

            /* =================================================
               EXAMINATION MAIN MENU
               ================================================= */

            #examination-menu-parent {

                width: 100%;

                box-sizing: border-box;

                margin: 0;

                padding: 0;

            }


            #examination-menu-parent
            #examination-menu-toggle {

                display: flex;

                align-items: center;

                width: 100%;

                min-height: 46px;

                padding: 8px 12px;

                box-sizing: border-box;

                background: transparent;

                color: #334155;

                border: none;

                border-radius: 8px;

                font-family: inherit;

                font-size: 15px;

                font-weight: 600;

                line-height: 1.3;

                cursor: pointer;

                text-align: left;

            }


            #examination-menu-parent
            #examination-menu-toggle:hover {

                background: rgba(
                    0,
                    0,
                    0,
                    0.035
                );

            }


            /* =================================================
               MAIN ICON
               ================================================= */

            #examination-menu-parent
            .menu-icon {

                display: inline-flex;

                align-items: center;

                justify-content: center;

                width: 27px;

                min-width: 27px;

                margin-right: 8px;

                font-size: 16px;

                line-height: 1;

            }


            /* =================================================
               MENU TEXT
               ================================================= */

            #examination-menu-parent
            .menu-text {

                flex: 1;

                color: #334155;

                white-space: nowrap;

            }


            /* =================================================
               ARROW
               ================================================= */

            #examination-menu-parent
            .menu-arrow {

                display: inline-flex;

                align-items: center;

                justify-content: center;

                width: 20px;

                min-width: 20px;

                color: #334155;

                font-size: 15px;

            }


            /* =================================================
               SUBMENU
               ================================================= */

            #examination-menu-parent
            .examination-submenu {

                display: none;

                width: 100%;

                box-sizing: border-box;

                padding: 3px 5px 6px 32px;

                margin: 0;

            }


            /* =================================================
               SUBMENU ITEM
               ================================================= */

            #examination-menu-parent
            .examination-submenu-item {

                display: flex;

                align-items: center;

                gap: 7px;

                width: 100%;

                min-height: 32px;

                box-sizing: border-box;

                padding: 5px 8px;

                margin: 1px 0;

                border-radius: 6px;

                color: #64748b;

                background: transparent;

                font-family: inherit;

                font-size: 13px;

                font-weight: 500;

                line-height: 1.25;

                cursor: pointer;

                white-space: nowrap;

                transition:
                    background 0.2s ease,
                    color 0.2s ease;

            }


            #examination-menu-parent
            .examination-submenu-item:hover {

                background: #f1f5f9;

                color: #334155;

            }


            #examination-menu-parent
            .examination-submenu-item.active {

                background: #eef2ff;

                color: #4338ca;

                font-weight: 600;

            }


            /* =================================================
               EXAMINATION VIEW
               ================================================= */

            .examination-view-panel {

                width: 100%;

                min-height: 100%;

                padding: 25px;

                box-sizing: border-box;

            }


            /* =================================================
               PAGE HEADER
               ================================================= */

            .examination-page-header {

                display: flex;

                justify-content: space-between;

                align-items: center;

                margin-bottom: 25px;

            }


            .examination-page-header h1 {

                margin: 0;

                color: #1e293b;

                font-size: 28px;

                font-weight: 700;

            }


            .examination-page-header p {

                margin: 6px 0 0;

                color: #64748b;

                font-size: 14px;

            }


            /* =================================================
               WELCOME CARD
               ================================================= */

            .exam-welcome-card {

                background: #ffffff;

                border-radius: 15px;

                padding: 35px;

                text-align: center;

                box-shadow:
                    0 4px 20px
                    rgba(0,0,0,0.07);

            }


            .exam-welcome-icon {

                font-size: 55px;

                margin-bottom: 10px;

            }


            .exam-welcome-card h2 {

                margin: 0 0 10px;

                color: #1e293b;

            }


            .exam-welcome-card p {

                margin: 6px 0;

                color: #64748b;

            }


            /* =================================================
               PLACEHOLDER
               ================================================= */

            .exam-module-placeholder {

                background: #ffffff;

                border-radius: 12px;

                padding: 30px;

                box-shadow:
                    0 3px 15px
                    rgba(0,0,0,0.06);

            }


            .exam-module-placeholder h2 {

                margin: 0 0 8px;

                color: #1e293b;

            }


            .exam-module-placeholder p {

                margin: 0;

                color: #64748b;

            }

        `;


        document.head.appendChild(
            style
        );

    }



    /* =========================================================
       6. INITIALIZE SYSTEM
       ========================================================= */

    function initializeExaminationSystem() {

        try {

            createExaminationMenu();

            createExaminationViews();

            console.log(
                '✓ Examination Management System initialized.'
            );

        } catch (error) {

            console.error(
                'Examination Management initialization error:',
                error
            );

        }

    }



    /* =========================================================
       7. GLOBAL ACCESS
       ========================================================= */

    window.ExaminationManagement = {

        init:
            initializeExaminationSystem,

        openView:
            openExaminationView

    };



    /* =========================================================
       8. START
       ========================================================= */

    if (
        document.readyState ===
        'loading'
    ) {

        document.addEventListener(
            'DOMContentLoaded',
            initializeExaminationSystem
        );

    } else {

        initializeExaminationSystem();

    }

})();
