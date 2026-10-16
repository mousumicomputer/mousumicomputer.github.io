/* ==========================================================================
   MODULE: CPSCL
   SUB-SECTION: 1:1 Pixel-Perfect Table Engine with Real Pagination & Counter
   Path: cpscl/student_table_actions.js
   Architecture: Real Student Count | Pagination (10, 25, 50, 100) | Single Selection
   Language: Pure English (Corporate ERP Standard)
   ========================================================================== */

(function () {
    console.log("Loading CPSCL 1:1 Real Pagination & Dynamic Counter Engine...");

    let allStudentsData = [];
    let currentPage = 1;
    let entriesPerPage = 25;
    let selectedStudent = null;
    let searchQuery = '';

    // ১. ২ নম্বর ছবির হুবহু পেজিনেশন ও ফুটার সিএসএস
    function injectPaginationStyles() {
        if (document.getElementById('cpscl-pagination-styles')) return;
        const style = document.createElement('style');
        style.id = 'cpscl-pagination-styles';
        style.innerHTML = `
            /* ডাস্টবিন বাটন আড়াল করা */
            .stu-table th:last-child,
            .stu-table td:last-child {
                display: none !important;
            }

            /* টেবিল হেডার */
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

            /* টেবিল ডেটা ফন্ট ও ডার্ক টেক্সট (১ নম্বর ছবির মতো) */
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

            /* জেব্রা স্ট্রাইপ */
            .stu-table tbody tr:nth-child(even) { background-color: #f8fafc !important; }
            .stu-table tbody tr:nth-child(odd) { background-color: #ffffff !important; }
            .stu-table tbody tr:hover { background-color: #f1f5f9 !important; }

            /* ৩ নম্বর ছবির সলিড ব্লু সিলেকশন */
            .stu-table tbody tr.erp-row-selected,
            .stu-table tbody tr.erp-row-selected:nth-child(even),
            .stu-table tbody tr.erp-row-selected:nth-child(odd) {
                background-color: #3b82f6 !important;
            }
            .stu-table tbody tr.erp-row-selected td,
            .stu-table tbody tr.erp-row-selected td * {
                color: #ffffff !important;
            }

            /* ২ নম্বর ছবির মতো ফুটার ও পেজিনেশন বার */
            .erp-table-footer-bar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 18px 22px;
                background: #ffffff;
                border-top: 1px solid #f1f5f9;
                flex-wrap: wrap;
                gap: 15px;
                font-family: inherit;
            }
            .erp-page-size-wrapper {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.85rem;
                color: #64748b;
                font-weight: 500;
            }
            .erp-select-entries {
                padding: 6px 12px;
                border: 1px solid #cbd5e1;
                border-radius: 8px;
                font-size: 0.85rem;
                font-weight: 700;
                color: #1e293b;
                outline: none;
                background: #ffffff;
                cursor: pointer;
            }
            .erp-pagination-buttons {
                display: flex;
                align-items: center;
                gap: 4px;
                user-select: none;
            }
            .erp-page-btn {
                min-width: 34px;
                height: 34px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 0 8px;
                border: 1px solid #e2e8f0;
                background: #ffffff;
                color: #475569;
                border-radius: 6px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;
            }
            .erp-page-btn:hover:not(.disabled):not(.active) {
                background: #f1f5f9;
                border-color: #cbd5e1;
            }
            .erp-page-btn.active {
                background: #3b82f6 !important;
                border-color: #3b82f6 !important;
                color: #ffffff !important;
                font-weight: 700;
            }
            .erp-page-btn.disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }

            /* উপরে "1 row selected" টেক্সট */
            .erp-selection-text {
                margin-left: 12px;
                font-size: 0.85rem;
                color: #64748b;
                font-weight: 600;
                display: none;
            }
        `;
        document.head.appendChild(style);
    }

    // ২. পেজিনেশন বার ইনজেকশন (২ নম্বর ছবির মতো টেবিলের নিচে)
    function injectPaginationFooter() {
        const mainCard = document.querySelector('.stu-main-card');
        if (!mainCard || document.getElementById('erpPaginationFooterBox')) return;

        const footer = document.createElement('div');
        footer.id = 'erpPaginationFooterBox';
        footer.className = 'erp-table-footer-bar';
        footer.innerHTML = `
            <div class="erp-page-size-wrapper">
                <select class="erp-select-entries" id="erpEntriesPerPageSelect" onchange="window.changeCPSCLEntriesPerPage(this.value)">
                    <option value="10">10</option>
                    <option value="25" selected>25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                </select>
                <span>entries per page</span>
            </div>
            <div class="erp-pagination-buttons" id="erpPaginationBtnContainer"></div>
        `;

        mainCard.appendChild(footer);
    }

    // ৩. রিয়েল কাউন্টার ও পেজ বাটন রেন্ডার ইঞ্জিন
    function renderPaginationControls(totalItems) {
        const container = document.getElementById('erpPaginationBtnContainer');
        if (!container) return;

        const totalPages = Math.ceil(totalItems / entriesPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        let btnsHtml = '';

        // প্রথম ও আগের পৃষ্ঠা বাটন (« <)
        btnsHtml += `<button class="erp-page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="window.goToCPSCLPage(1)">«</button>`;
        btnsHtml += `<button class="erp-page-btn ${currentPage === 1 ? 'disabled' : ''}" onclick="window.goToCPSCLPage(${currentPage - 1})">&lt;</button>`;

        // পেজ নম্বর বাটন (1, 2, 3...)
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

        for (let i = startPage; i <= endPage; i++) {
            btnsHtml += `<button class="erp-page-btn ${i === currentPage ? 'active' : ''}" onclick="window.goToCPSCLPage(${i})">${i}</button>`;
        }

        if (endPage < totalPages) {
            btnsHtml += `<span style="padding:0 4px; color:#94a3b8;">...</span>`;
            btnsHtml += `<button class="erp-page-btn" onclick="window.goToCPSCLPage(${totalPages})">${totalPages}</button>`;
        }

        // পরের ও শেষ পৃষ্ঠা বাটন (> »)
        btnsHtml += `<button class="erp-page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="window.goToCPSCLPage(${currentPage + 1})">&gt;</button>`;
        btnsHtml += `<button class="erp-page-btn ${currentPage === totalPages ? 'disabled' : ''}" onclick="window.goToCPSCLPage(${totalPages})">»</button>`;

        container.innerHTML = btnsHtml;
    }

    // ৪. টেবিলের উপরের টেক্সট আপডেট (রিয়েল হিসাব: Showing 1 to 25 of 81 entries)
    function updateHeaderCounterText(totalItems) {
        const headerDiv = document.querySelector('.stu-table-header div:first-child');
        if (!headerDiv) return;

        let start = totalItems === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
        let end = Math.min(currentPage * entriesPerPage, totalItems);

        let selectionHtml = selectedStudent 
            ? `<span class="erp-selection-text" style="display:inline;">${selectedStudent ? '1 row selected' : ''}</span>`
            : '';

        headerDiv.innerHTML = `Showing ${start} to ${end} of ${totalItems} entries ${selectionHtml}`;
    }

    // ৫. পৃষ্ঠায় শিক্ষার্থী তালিকা আঁকা
    window.renderPaginatedStudentsTable = function () {
        const tbody = document.querySelector('.stu-table tbody');
        if (!tbody) return;

        // সার্চ কুয়েরি অনুযায়ী ফিল্টার
        let filtered = allStudentsData.filter(s => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (s.student_name && s.student_name.toLowerCase().includes(q)) ||
                   (s.std_id && String(s.std_id).toLowerCase().includes(q)) ||
                   (s.roll_no && String(s.roll_no).toLowerCase().includes(q));
        });

        const totalItems = filtered.length;
        injectPaginationFooter();
        renderPaginationControls(totalItems);
        updateHeaderCounterText(totalItems);

        tbody.innerHTML = '';

        if (totalItems === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:35px; color:#94a3b8;">No student records found in database.</td></tr>`;
            return;
        }

        // বর্তমান পৃষ্ঠার জন্য স্লাইস করা (যেমন: ১ থেকে ২৫)
        const startIndex = (currentPage - 1) * entriesPerPage;
        const pageStudents = filtered.slice(startIndex, startIndex + entriesPerPage);

        const masterCfg = typeof window.getCPSCLMasterConfig === 'function' ? window.getCPSCLMasterConfig() : {};
        const activeCols = (masterCfg.tableColumns || []).filter(c => c.enabled);

        pageStudents.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.dataset.studentId = s.id || s.std_id;

            // যদি আগের সিলেক্ট করা ছাত্র হয়
            if (selectedStudent && (selectedStudent.key === s.id || selectedStudent.key === s.std_id)) {
                tr.classList.add('erp-row-selected');
            }

            let colsHtml = '';
            activeCols.forEach(col => {
                let val = '-';
                if (col.id === 'col_serial') val = (startIndex + idx + 1);
                else if (col.id === 'col_stdid') val = `<strong>${s.std_id || s.id}</strong>`;
                else if (col.id === 'col_name') val = `${s.student_name || '-'}`;
                else if (col.id === 'col_roll') val = s.roll_no || '-';
                else if (col.id === 'col_father') val = s.father_name || '-';
                else if (col.id === 'col_mother') val = s.mother_name || '-';
                else if (col.id === 'col_status') val = `<span style="color: #15803d; font-weight: 700; font-size: 0.8rem;">Active</span>`;
                else val = s[col.id] || '-';

                colsHtml += `<td>${val}</td>`;
            });

            // ডিলিট বাটন ব্যাকগ্রাউন্ডে রাখা
            colsHtml += `
                <td style="display:none;">
                    <button onclick="confirmSuperAdminDeleteStudent('${s.id}')"></button>
                </td>
            `;

            tr.innerHTML = colsHtml;
            tbody.appendChild(tr);
        });
    };

    // ৬. পেজ পরিবর্তন ও পেজ সাইজ পরিবর্তন হ্যান্ডলার
    window.goToCPSCLPage = function (pageNum) {
        currentPage = pageNum;
        window.renderPaginatedStudentsTable();
    };

    window.changeCPSCLEntriesPerPage = function (size) {
        entriesPerPage = parseInt(size) || 25;
        currentPage = 1;
        window.renderPaginatedStudentsTable();
    };

    // ৭. সিঙ্গেল রো সিলেকশন ইঞ্জিন
    function bindTableRowClickEvents() {
        document.addEventListener('click', (e) => {
            const tr = e.target.closest('.stu-table tbody tr');
            if (!tr) return;

            if (e.target.closest('button') || e.target.closest('input')) return;

            const isAlreadySelected = tr.classList.contains('erp-row-selected');

            document.querySelectorAll('.stu-table tbody tr').forEach(row => {
                row.classList.remove('erp-row-selected');
            });
            selectedStudent = null;

            if (!isAlreadySelected) {
                tr.classList.add('erp-row-selected');
                const stdIdCell = tr.children[1];
                const stdIdText = stdIdCell ? stdIdCell.innerText.trim() : '';

                selectedStudent = {
                    key: tr.dataset.studentId || stdIdText,
                    cloudKey: tr.dataset.studentId,
                    stdId: stdIdText,
                    name: tr.children[2] ? tr.children[2].innerText.trim() : 'Student'
                };
            }

            updateHeaderCounterText(allStudentsData.length);
        });
    }

    // ৮. সার্চ ইনপুট লাইভ ফিল্টার
    function bindLiveSearchInput() {
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('stu-search-input')) {
                searchQuery = e.target.value.trim();
                currentPage = 1;
                window.renderPaginatedStudentsTable();
            }
        });
    }

    // ৯. ক্লাউড ও ক্যাশ থেকে ডেটা লোড
    function syncStudentsFromCloudAndCache() {
        const localCache = JSON.parse(localStorage.getItem('cpscl_students_cache') || '[]');
        if (localCache.length > 0) {
            allStudentsData = localCache;
            window.renderPaginatedStudentsTable();
        }

        if (window.getDatabase && window.ref && window.get) {
            try {
                const db = window.getDatabase();
                const stuRef = window.ref(db, 'cpscl_students');
                window.get(stuRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        allStudentsData = Object.values(snapshot.val());
                        localStorage.setItem('cpscl_students_cache', JSON.stringify(allStudentsData));
                        window.renderPaginatedStudentsTable();
                    }
                }).catch(err => console.warn("Cloud student sync:", err));
            } catch(e) {}
        }
    }

    // ১০. টুলবার Delete বাটন অ্যাকশন
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

            allStudentsData = allStudentsData.filter(s => {
                const sId = String(s.std_id || s.id).trim();
                return sId !== selectedStudent.key && s.id !== targetKey;
            });
            localStorage.setItem('cpscl_students_cache', JSON.stringify(allStudentsData));

            if (typeof window.showToast === 'function') {
                window.showToast(`Student "${selectedStudent.name}" deleted successfully!`, "info");
            }

            selectedStudent = null;
            window.renderPaginatedStudentsTable();
        } catch (err) {
            alert("Error deleting student: " + err.message);
        }
    }

    // গ্লোবাল ফাংশন ওভাররাইড যাতে ফায়ারবেস আপডেট হলে পেজিনেশন কাজ করে
    window.fetchAndRenderRealCPSCLStudents = function () {
        syncStudentsFromCloudAndCache();
    };

    const originalRenderScreen = window.renderDynamicStudentScreen;
    window.renderDynamicStudentScreen = function () {
        if (typeof originalRenderScreen === 'function') {
            originalRenderScreen.apply(this, arguments);
        }
        setTimeout(syncStudentsFromCloudAndCache, 80);
    };

    function init() {
        injectPaginationStyles();
        bindTableRowClickEvents();
        bindLiveSearchInput();
        bindToolbarDeleteAction();

        syncStudentsFromCloudAndCache();
        setTimeout(syncStudentsFromCloudAndCache, 800);
        setTimeout(syncStudentsFromCloudAndCache, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 150);
    }
})();
