/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: 1:1 Pixel-Perfect Student Table Styling & Single Selection Engine
   Path: cpscl/student_table_actions.js
   Architecture: Exact Match with s3.trusteduerp.xyz | Single Selection | Toolbar Delete
   Language: Pure English (Corporate ERP Standard)
   ========================================================================== */

(function () {
    console.log("Loading CPSCL 1:1 Pixel-Perfect Table Engine...");

    let selectedStudent = null; // Single selection: { id, cloudKey, name }

    // ১. ১ নম্বর ছবির হুবহু প্রিমিয়াম স্টাইল (জেব্রা স্ট্রাইপ, বর্ডার ও ডার্ক টেক্সট)
    function injectTableCustomStyles() {
        if (document.getElementById('cpscl-premium-table-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-premium-table-styles';
        style.innerHTML = `
            /* ডাস্টবিন বাটন ও স্ট্যাটাস কলাম আড়াল করা (১ নম্বর ছবির মতো ক্লিন লুক) */
            .stu-table th:last-child,
            .stu-table td:last-child {
                display: none !important;
            }

            /* টেবিল হেডার (১ নম্বর ছবির মতো হালকা ফন্ট ও অ্যারো লুক) */
            .stu-table th {
                background: #ffffff !important;
                color: #8c98a4 !important;
                font-size: 0.75rem !important;
                font-weight: 700 !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
                padding: 14px 18px !important;
                border-bottom: 1.5px solid #eef2f5 !important;
                user-select: none;
            }

            /* টেবিল ডেটা ফন্ট ও রঙ (নীল রঙ বাদ দিয়ে ১ নম্বর ছবির মতো গাঢ় টেক্সট) */
            .stu-table tbody td {
                color: #334155 !important;
                font-size: 0.87rem !important;
                font-weight: 500 !important;
                padding: 13px 18px !important;
                border-bottom: 1px solid #eef2f5 !important;
            }
            .stu-table tbody td strong,
            .stu-table tbody td span,
            .stu-table tbody td a {
                color: #334155 !important;
                font-weight: 600 !important;
                text-decoration: none !important;
            }

            /* ১ নম্বর ছবির মতো জেব্রা স্ট্রাইপ (এক লাইন সাদা, এক লাইন হালকা ধূসর) */
            .stu-table tbody tr:nth-child(even) {
                background-color: #f8fafc !important;
            }
            .stu-table tbody tr:nth-child(odd) {
                background-color: #ffffff !important;
            }

            /* মাউস নিলে হালকা সফট কালার */
            .stu-table tbody tr:hover {
                background-color: #f1f5f9 !important;
            }

            /* ১ নম্বর ছবির হুবহু সলিড ব্লু সিলেকশন (Solid Vibrant Blue) */
            .stu-table tbody tr.erp-row-selected,
            .stu-table tbody tr.erp-row-selected:nth-child(even),
            .stu-table tbody tr.erp-row-selected:nth-child(odd) {
                background-color: #3b82f6 !important;
            }
            .stu-table tbody tr.erp-row-selected td,
            .stu-table tbody tr.erp-row-selected td * {
                color: #ffffff !important;
            }

            /* "1 row selected" সাধারণ টেক্সট (কোনো ক্যাপসুল বাবল নেই) */
            .erp-selection-text {
                margin-left: 15px;
                font-size: 0.85rem;
                color: #64748b;
                font-weight: 500;
                display: none;
            }

            /* টুলবারের ডিলিট বাটন */
            .btn-tool-danger {
                border-color: #fca5a5 !important;
                color: #dc2626 !important;
                font-weight: 700 !important;
            }
            .btn-tool-danger:hover {
                background-color: #fef2f2 !important;
                border-color: #ef4444 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ২. "1 row selected" সাধারণ টেক্সট তৈরি
    function ensureSelectionTextExists() {
        const tableHeaderLeft = document.querySelector('.stu-table-header div:first-child');
        if (!tableHeaderLeft || document.getElementById('erpSelectionTextDisplay')) return;

        const span = document.createElement('span');
        span.id = 'erpSelectionTextDisplay';
        span.className = 'erp-selection-text';
        tableHeaderLeft.appendChild(span);
    }

    function updateSelectionDisplay() {
        const textEl = document.getElementById('erpSelectionTextDisplay');
        if (!textEl) return;

        if (selectedStudent) {
            textEl.innerText = "1 row selected";
            textEl.style.display = "inline";
        } else {
            textEl.innerText = "";
            textEl.style.display = "none";
        }
    }

    // ৩. সিঙ্গেল সিলেকশন ইঞ্জিন (একবারে মাত্র ১ জনই সিলেক্ট হবে)
    function bindTableRowClickEvents() {
        document.addEventListener('click', (e) => {
            const tr = e.target.closest('.stu-table tbody tr');
            if (!tr) return;

            if (e.target.closest('button') || e.target.closest('input')) return;

            const isAlreadySelected = tr.classList.contains('erp-row-selected');

            // আগের সব সিলেকশন মুছে ফেলা (একের অধিক সিলেক্ট হবে না)
            document.querySelectorAll('.stu-table tbody tr').forEach(row => {
                row.classList.remove('erp-row-selected');
            });
            selectedStudent = null;

            // যদি আগের সিলেক্ট করা না হয়ে থাকে, তবে বর্তমানটাকে সিলেক্ট করা
            if (!isAlreadySelected) {
                tr.classList.add('erp-row-selected');

                const deleteBtn = tr.querySelector('button[onclick*="DeleteStudent"]');
                let studentUniqueId = '';
                if (deleteBtn) {
                    const match = deleteBtn.getAttribute('onclick').match(/'([^']+)'/);
                    if (match) studentUniqueId = match[1];
                }

                const stdIdCell = tr.children[1];
                const stdIdText = stdIdCell ? stdIdCell.innerText.trim() : '';

                selectedStudent = {
                    key: studentUniqueId || stdIdText,
                    cloudKey: studentUniqueId,
                    stdId: stdIdText,
                    name: tr.children[2] ? tr.children[2].innerText.trim() : 'Student'
                };
            }

            updateSelectionDisplay();
        });
    }

    // ৪. টুলবারের Delete বাটনে ক্লিক করলে অ্যাকশন
    function bindToolbarDeleteAction() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-tool');
            if (!btn) return;
            const text = btn.innerText.trim();

            if (text.includes('Delete') || btn.querySelector('.fa-trash-can')) {
                e.preventDefault();
                executeStudentDeletion();
            }
        });
    }

    async function executeStudentDeletion() {
        if (!selectedStudent) {
            if (typeof window.showToast === 'function') {
                window.showToast("Please click and select a student from the table first!", "warning");
            } else {
                alert("Please click and select a student from the table first!");
            }
            return;
        }

        const confirmText = `Are you sure you want to PERMANENTLY delete student "${selectedStudent.name}" (ID: ${selectedStudent.stdId}) from Cloud?`;
        if (!confirm(confirmText)) return;

        try {
            const targetKey = selectedStudent.cloudKey || selectedStudent.key;
            if (typeof window.writeToFirebase === 'function') {
                await window.writeToFirebase(`cpscl_students/${targetKey}`, null);
            }

            // লোকাল ক্যাশ থেকে বাদ দেওয়া
            let localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            localCache = localCache.filter(s => {
                const sId = String(s.std_id || s.id).trim();
                return sId !== selectedStudent.key && s.id !== targetKey;
            });
            localStorage.setItem('cpscl_students_cache', JSON.stringify(localCache));

            if (typeof window.showToast === 'function') {
                window.showToast(`Student "${selectedStudent.name}" deleted successfully!`, "info");
            }

            selectedStudent = null;
            updateSelectionDisplay();

            if (typeof window.fetchAndRenderRealCPSCLStudents === 'function') {
                window.fetchAndRenderRealCPSCLStudents();
            }
        } catch (err) {
            alert("Error deleting student: " + err.message);
        }
    }

    // ৫. টুলবার ডিলিট বাটন স্থায়ী লক
    function lockToolbarDeleteButtonPermanently() {
        try {
            const saved = localStorage.getItem('cpscl_superadmin_master_config');
            let cfg = saved ? JSON.parse(saved) : null;
            if (cfg && Array.isArray(cfg.toolbarButtons)) {
                const btnExists = cfg.toolbarButtons.some(b => b.id === 'tb_delete' || b.label.toLowerCase().includes('delete'));
                if (!btnExists) {
                    cfg.toolbarButtons.push({
                        id: 'tb_delete',
                        label: 'Delete',
                        icon: 'fa-trash-can',
                        hasDropdown: false,
                        colorClass: 'btn-tool-danger',
                        enabled: true
                    });
                    localStorage.setItem('cpscl_superadmin_master_config', JSON.stringify(cfg));
                }
            }
        } catch (e) {}
    }

    function init() {
        lockToolbarDeleteButtonPermanently();
        injectTableCustomStyles();
        ensureSelectionTextExists();
        bindTableRowClickEvents();
        bindToolbarDeleteAction();

        setInterval(ensureSelectionTextExists, 600);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 150);
    }
})();
