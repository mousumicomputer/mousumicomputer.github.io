/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: Premium Student Table Styling & Toolbar Delete Engine
   Path: cpscl/student_table_actions.js
   Architecture: Toolbar Integrated | Permanent Auto-Lock | 1:1 ERP Selection
   Language: Pure English (Corporate ERP Standard)
   ========================================================================== */

(function () {
    console.log("Loading CPSCL Toolbar Delete & Premium Table UI Engine...");

    let selectedStudentRecords = new Map(); // id -> { stdId, name }

    // ১. টুলবার বাটনকে আজীবনের জন্য লক ও স্থায়ী রাখার ইঞ্জিন (কালকে আর হারাবে না)
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
        } catch (e) {
            console.error("Toolbar config sync error:", e);
        }
    }

    // মাস্টার কনফিগারেশনে ৩ নম্বর ট্যাবে বাটনটি চিরস্থায়ী করা
    const origGetMasterConfig = window.getCPSCLMasterConfig;
    window.getCPSCLMasterConfig = function () {
        let cfg = typeof origGetMasterConfig === 'function' ? origGetMasterConfig() : null;
        if (cfg && Array.isArray(cfg.toolbarButtons)) {
            const hasBtn = cfg.toolbarButtons.some(b => b.id === 'tb_delete' || b.label.toLowerCase().includes('delete'));
            if (!hasBtn) {
                cfg.toolbarButtons.push({
                    id: 'tb_delete',
                    label: 'Delete',
                    icon: 'fa-trash-can',
                    hasDropdown: false,
                    colorClass: 'btn-tool-danger',
                    enabled: true
                });
                try {
                    localStorage.setItem('cpscl_superadmin_master_config', JSON.stringify(cfg));
                } catch(e){}
            }
        }
        return cfg;
    };

    // ২. প্রিমিয়াম সিএসএস (আসল ERP-এর মতো টেবিল ও লাল টুলবার বাটন)
    function injectTableCustomStyles() {
        if (document.getElementById('cpscl-premium-table-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-premium-table-styles';
        style.innerHTML = `
            /* সারির ডানপাশের পুরোনো ডাস্টবিনগুলো চিরতরে মুছে ফেলা */
            .stu-table th:last-child,
            .stu-table td:last-child {
                display: none !important;
            }

            /* টুলবারের লাল ডিলিট বাটন স্টাইল */
            .btn-tool-danger {
                border-color: #fca5a5 !important;
                color: #dc2626 !important;
                font-weight: 700 !important;
            }
            .btn-tool-danger:hover {
                background-color: #fef2f2 !important;
                border-color: #ef4444 !important;
            }

            /* টেবিল হেডার */
            .stu-table th {
                background: #f8fafc !important;
                color: #64748b !important;
                font-size: 0.76rem !important;
                font-weight: 800 !important;
                letter-spacing: 0.5px !important;
                padding: 13px 18px !important;
                border-bottom: 2px solid #e2e8f0 !important;
                user-select: none;
            }

            /* রো হোভার */
            .stu-table tbody tr {
                cursor: pointer !important;
                transition: background-color 0.15s ease;
            }
            .stu-table tbody tr:hover {
                background-color: #f1f5f9 !important;
            }

            /* ক্লিক করলে উজ্জ্বল নীল সিলেকশন (৩ নম্বর ছবির মতো) */
            .stu-table tbody tr.erp-row-selected {
                background-color: #3b82f6 !important;
                color: #ffffff !important;
            }
            .stu-table tbody tr.erp-row-selected td {
                color: #ffffff !important;
            }
            .stu-table tbody tr.erp-row-selected td strong,
            .stu-table tbody tr.erp-row-selected td span {
                color: #ffffff !important;
            }

            /* সিলেকশন কাউন্টার ব্যাজ ("1 row selected") */
            .erp-selection-counter-badge {
                display: none;
                margin-left: 12px;
                background: #eff6ff;
                color: #2563eb;
                border: 1px solid #bfdbfe;
                padding: 3px 12px;
                border-radius: 20px;
                font-size: 0.8rem;
                font-weight: 700;
                animation: fadeInBadge 0.2s ease-out;
            }
            @keyframes fadeInBadge {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
        `;
        document.head.appendChild(style);
    }

    // ৩. সিলেকশন কাউন্টার ("1 row selected")
    function ensureSelectionCounterExists() {
        const tableHeaderLeft = document.querySelector('.stu-table-header div:first-child');
        if (!tableHeaderLeft || document.getElementById('erpSelectionCounterDisplay')) return;

        const badge = document.createElement('span');
        badge.id = 'erpSelectionCounterDisplay';
        badge.className = 'erp-selection-counter-badge';
        tableHeaderLeft.appendChild(badge);
    }

    function updateSelectionCounterUI() {
        const badge = document.getElementById('erpSelectionCounterDisplay');
        const count = selectedStudentRecords.size;

        if (badge) {
            if (count > 0) {
                badge.innerText = `${count} ${count === 1 ? 'row' : 'rows'} selected`;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    }

    // ৪. রো ক্লিক সিলেকশন ইঞ্জিন
    function bindTableRowClickEvents() {
        document.addEventListener('click', (e) => {
            const tr = e.target.closest('.stu-table tbody tr');
            if (!tr) return;

            if (e.target.closest('button') || e.target.closest('input')) return;

            const deleteBtn = tr.querySelector('button[onclick*="DeleteStudent"]');
            let studentUniqueId = '';

            if (deleteBtn) {
                const match = deleteBtn.getAttribute('onclick').match(/'([^']+)'/);
                if (match) studentUniqueId = match[1];
            }

            const stdIdCell = tr.children[1];
            const stdIdText = stdIdCell ? stdIdCell.innerText.trim() : '';
            const key = studentUniqueId || stdIdText;

            if (!key) return;

            // টগল সিলেকশন (ক্লিক করলে নীল হবে, আবার দিলে স্বাভাবিক হবে)
            if (selectedStudentRecords.has(key)) {
                selectedStudentRecords.delete(key);
                tr.classList.remove('erp-row-selected');
            } else {
                selectedStudentRecords.set(key, {
                    cloudKey: studentUniqueId,
                    stdId: stdIdText,
                    name: tr.children[2] ? tr.children[2].innerText.trim() : 'Student'
                });
                tr.classList.add('erp-row-selected');
            }

            updateSelectionCounterUI();
        });
    }

    // ৫. টুলবারের Delete বাটনে ক্লিক করলে অ্যাকশন
    function bindToolbarDeleteAction() {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-tool');
            if (!btn) return;
            const text = btn.innerText.trim();

            if (text.includes('Delete') || btn.querySelector('.fa-trash-can')) {
                e.preventDefault();
                executeSelectedStudentDeletion();
            }
        });
    }

    // ৬. ক্লাউড ফায়ারবেস থেকে পার্মানেন্ট ডিলিট ইঞ্জিন
    async function executeSelectedStudentDeletion() {
        const count = selectedStudentRecords.size;

        if (count === 0) {
            if (typeof window.showToast === 'function') {
                window.showToast("Please click and select a student from the table first!", "warning");
            } else {
                alert("Please click and select a student from the table first!");
            }
            return;
        }

        const confirmText = count === 1
            ? "Are you sure you want to PERMANENTLY delete this selected student from Cloud?"
            : `Are you sure you want to PERMANENTLY delete ${count} selected students from Cloud?`;

        if (!confirm(confirmText)) return;

        try {
            for (let [key, student] of selectedStudentRecords) {
                const targetKey = student.cloudKey || key;
                if (typeof window.writeToFirebase === 'function') {
                    await window.writeToFirebase(`cpscl_students/${targetKey}`, null);
                }
            }

            let localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
            localCache = localCache.filter(s => {
                const isMatched = selectedStudentRecords.has(s.id) || selectedStudentRecords.has(String(s.std_id).trim());
                return !isMatched;
            });
            localStorage.setItem('cpscl_students_cache', JSON.stringify(localCache));

            if (typeof window.showToast === 'function') {
                window.showToast(`Deleted ${count} student(s) permanently!`, "info");
            }

            selectedStudentRecords.clear();
            updateSelectionCounterUI();

            if (typeof window.fetchAndRenderRealCPSCLStudents === 'function') {
                window.fetchAndRenderRealCPSCLStudents();
            }
        } catch (err) {
            alert("Error deleting student: " + err.message);
        }
    }

    function init() {
        lockToolbarDeleteButtonPermanently();
        injectTableCustomStyles();
        ensureSelectionCounterExists();
        bindTableRowClickEvents();
        bindToolbarDeleteAction();

        // স্ক্রিন রেন্ডার যাতে বাটনটি ৩ নম্বর ট্যাবে ও টুলবারে সাথে সাথে বসে যায়
        if (typeof window.renderDynamicStudentScreen === 'function') {
            window.renderDynamicStudentScreen();
        }

        setInterval(ensureSelectionCounterExists, 600);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 150);
    }
})();
