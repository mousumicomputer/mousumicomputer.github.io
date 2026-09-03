/**
 * CPSCL Addon: Modern Header, Zero-Bengali Minimalist UI & Calibrated Bulk Print
 * Works independently on top of cpscl_module (2).js without modifying it.
 */

(function () {
    let currentFilter = 'all';

    // ১. প্রয়োজনীয় সিএসএস ও প্রিন্ট স্টাইল ইনজেক্ট করা
    function injectCustomStyles() {
        if (document.getElementById('cpscl-addon-styles')) return;

        const style = document.createElement('style');
        style.id = 'cpscl-addon-styles';
        style.innerHTML = `
            /* টপ হেডার বার (Image 1 অনুযায়ী হুবহু ডিজাইন) */
            .cpscl-modern-header {
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 16px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 15px;
                margin-bottom: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.02);
            }
            .cpscl-modern-header .header-left h2 {
                font-size: 1.25rem;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 3px;
            }
            .cpscl-modern-header .header-left p {
                font-size: 0.85rem;
                color: #64748b;
                margin: 0;
            }
            .cpscl-action-group {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }

            /* Image 1 এর বাটনসমূহ */
            .btn-upload-dashed {
                background: #f8faff;
                border: 1.5px dashed #60a5fa;
                color: #2563eb;
                padding: 8px 16px;
                border-radius: 8px;
                font-size: 0.88rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: all 0.2s;
            }
            .btn-upload-dashed:hover {
                background: #eff6ff;
                border-color: #3b82f6;
            }

            .btn-sample-cyan {
                background: #0284c7;
                border: none;
                color: #ffffff;
                padding: 9px 16px;
                border-radius: 8px;
                font-size: 0.88rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: background 0.2s;
            }
            .btn-sample-cyan:hover { background: #0369a1; }

            .btn-add-purple {
                background: #6366f1;
                border: none;
                color: #ffffff;
                padding: 9px 18px;
                border-radius: 8px;
                font-size: 0.88rem;
                font-weight: 700;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                transition: background 0.2s;
            }
            .btn-add-purple:hover { background: #4f46e5; }

            /* Image 2 (Style 1): গ্রিন প্রিন্টার বাটন + লাল ফ্লোটিং ব্যাজ */
            .btn-bulk-print-box {
                width: 42px;
                height: 42px;
                background: #059669;
                border: none;
                border-radius: 10px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
                color: #ffffff;
                font-size: 1.2rem;
                box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3);
                transition: transform 0.15s, background 0.2s;
            }
            .btn-bulk-print-box:hover {
                background: #047857;
                transform: translateY(-1px);
            }
            .btn-bulk-print-box .print-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #ef4444;
                color: #ffffff;
                font-size: 0.72rem;
                font-weight: 800;
                min-width: 20px;
                height: 20px;
                padding: 0 5px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid #ffffff;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }

            /* বাল্ক প্রিন্ট কনটেইনার স্ক্রিনে লুকানো থাকবে */
            #cpsclAddonBulkWrapper {
                display: none;
            }

            /* ==========================================================
               প্রিন্ট মিডিয়া অপটিমাইজেশন (মাল্টি-পেজ A4 ল্যান্ডস্কেপ)
               ========================================================== */
            @media print {
                body.cpscl-bulk-active * {
                    visibility: hidden !important;
                }
                body.cpscl-bulk-active #cpsclAddonBulkWrapper,
                body.cpscl-bulk-active #cpsclAddonBulkWrapper * {
                    visibility: visible !important;
                }
                body.cpscl-bulk-active #cpsclAddonBulkWrapper {
                    display: block !important;
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 297mm !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                body.cpscl-bulk-active .cpscl-a4-sheet {
                    page-break-after: always !important;
                    break-after: page !important;
                    height: 210mm !important;
                    max-height: 210mm !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    overflow: hidden !important;
                    box-sizing: border-box !important;
                }
                body.cpscl-bulk-active .cpscl-a4-sheet:last-child {
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ২. UI রূপান্তর এবং সম্পূর্ণ বাংলা লেখা অপসারণ
    function transformCPSCLInterface() {
        const listView = document.getElementById('cpscl-list-view');
        if (!listView) return false;

        const firstCard = listView.querySelector('.cpscl-card');
        if (firstCard && !firstCard.classList.contains('cpscl-header-transformed')) {
            firstCard.className = 'cpscl-modern-header cpscl-header-transformed';
            firstCard.innerHTML = `
                <div class="header-left">
                    <h2>Student Excel Import & Database</h2>
                    <p>Manage student profiles, import data, and generate certificates</p>
                </div>
                <div class="cpscl-action-group">
                    <button class="btn-upload-dashed" onclick="document.getElementById('excelFileInput').click()">
                        <i class="fa-solid fa-arrow-up-from-bracket"></i> Upload Excel (.xlsx)
                    </button>
                    <button class="btn-sample-cyan" onclick="downloadSampleExcel()">
                        <i class="fa-solid fa-download"></i> Sample
                    </button>
                    <button class="btn-add-purple" onclick="switchCPSCLSubSection('entry')">
                        <i class="fa-solid fa-user-plus"></i> Add Student
                    </button>
                    <button class="btn-bulk-print-box" title="Print All Filtered Certificates" onclick="executeAddonBulkPrint()">
                        <i class="fa-solid fa-print"></i>
                        <span class="print-badge" id="addonPrintCountBadge">0</span>
                    </button>
                    <input type="file" id="excelFileInput" accept=".xlsx, .xls, .csv" style="display: none;" onchange="handleExcelUpload(event)">
                </div>
            `;
        }

        // সার্চ বক্স ও লেবেলের বাংলা পরিবর্তন
        const searchInput = document.getElementById('studentSearchInput');
        if (searchInput) {
            searchInput.placeholder = "Search by Roll, Name or Reg...";
        }

        const countContainer = document.querySelector('#cpscl-list-view div[style*="font-weight: 700; color: #64748b;"]');
        if (countContainer) {
            countContainer.childNodes.forEach(node => {
                if (node.nodeType === 3 && node.textContent.includes('মোট')) {
                    node.textContent = 'Total Students: ';
                } else if (node.nodeType === 3 && node.textContent.includes('জন')) {
                    node.textContent = ' ';
                }
            });

            const clearBtn = countContainer.querySelector('button');
            if (clearBtn) {
                clearBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Clear Database';
            }
        }

        // টেবিল হেডার থেকে বাংলা অপসারণ
        const tableThs = document.querySelectorAll('#cpscl-list-view table thead th');
        const englishHeaders = ['Roll', 'Registration', 'Student Name', "Father's Name", 'Gender', 'Template', 'Group/Class', 'GPA', 'Action'];
        if (tableThs.length === englishHeaders.length) {
            tableThs.forEach((th, i) => {
                th.innerText = englishHeaders[i];
            });
        }

        return true;
    }

    // ৩. ডাটাবেজ থেকে বর্তমান ফিল্টার্ড তালিকা সংগ্রহ
    function getFilteredList() {
        const raw = localStorage.getItem('cpscl_students_data') || '[]';
        let list = [];
        try { list = JSON.parse(raw); } catch (e) { list = []; }

        const searchVal = (document.getElementById('studentSearchInput')?.value || '').toLowerCase().trim();

        return list.filter(s => {
            const matchesSearch = String(s.roll || '').toLowerCase().includes(searchVal) ||
                                  String(s.reg || '').toLowerCase().includes(searchVal) ||
                                  String(s.name || '').toLowerCase().includes(searchVal);
            const matchesTemplate = (currentFilter === 'all') || (s.template === currentFilter);
            return matchesSearch && matchesTemplate;
        });
    }

    // ৪. ব্যাজের সংখ্যা আপডেট
    function updateBadgeCount() {
        const badge = document.getElementById('addonPrintCountBadge');
        if (badge) {
            const count = getFilteredList().length;
            badge.innerText = count;
        }
    }

    // ৫. একক সার্টিফিকেটের হুবহু ক্যালিব্রেটেড HTML তৈরি
    function createCertificateHTML(st) {
        const isMale = (st.gender || 'Male').toLowerCase().startsWith('m');
        const relation = isMale ? "son of" : "daughter of";
        const pronoun = isMale ? "He" : "She";
        const pronounLower = isMale ? "he" : "she";
        const possessive = isMale ? "his" : "her";
        const objective = isMale ? "him" : "her";
        const examName = st.template === 'hsc_testimonial'
            ? "Higher Secondary Certificate Examination"
            : "Secondary School Certificate Examination";

        return `
            <div class="cpscl-a4-sheet">
                <div class="cert-ref">${st.ref || ''}</div>
                <div class="cert-body-block">
                    <p class="cert-paragraph">
                        This is to certify that <span class="cert-bold">${st.name || ''}</span>, 
                        <span>${relation}</span> <span class="cert-bold">${st.father || ''}</span> and 
                        <span class="cert-bold">${st.mother || ''}</span> bearing Roll No. 
                        <span class="cert-meta-bold">${st.roll || ''}</span>, Registration No. 
                        <span class="cert-meta-bold">${st.reg || ''}</span>, Session 
                        <span class="cert-meta-bold">${st.session || ''}</span> passed 
                        <span>${examName}</span> in <span class="cert-meta-bold">${st.year || ''}</span> 
                        from <span class="cert-meta-bold">${st.group || ''}</span> group under the Board of 
                        Intermediate and Secondary Education, <span>${st.board || ''}</span> as a regular 
                        student of this institution and acquired GPA- <span class="cert-meta-bold">${st.gpa || ''}</span>.
                    </p>
                    <p class="cert-paragraph">
                        <span>${pronoun}</span> bears a good moral character. To the best of my concern, 
                        <span>${pronounLower}</span> did not take part in any activity subversive of the 
                        state or against discipline during <span>${possessive}</span> stay at this institution.
                    </p>
                    <p class="cert-paragraph">
                        I wish <span>${objective}</span> a bright future.
                    </p>
                </div>
                <div class="cert-footer-date">
                    [Result Publication Date: <span>${st.pubDate || ''}</span>]
                </div>
            </div>
        `;
    }

    // ৬. অল প্রিন্ট এক্সিকিউশন
    window.executeAddonBulkPrint = function () {
        const studentsToPrint = getFilteredList();

        if (studentsToPrint.length === 0) {
            alert("No students found to print!");
            return;
        }

        let bulkWrapper = document.getElementById('cpsclAddonBulkWrapper');
        if (!bulkWrapper) {
            bulkWrapper = document.createElement('div');
            bulkWrapper.id = 'cpsclAddonBulkWrapper';
            document.body.appendChild(bulkWrapper);
        }

        // সব সার্টিফিকেটের এইচটিএমএল যোগ করা
        bulkWrapper.innerHTML = studentsToPrint.map(s => createCertificateHTML(s)).join('');

        // প্রিন্ট ট্রিগার
        document.body.classList.add('cpscl-bulk-active');
        window.print();

        // প্রিন্ট শেষে ক্লিনআপ
        setTimeout(() => {
            document.body.classList.remove('cpscl-bulk-active');
            bulkWrapper.innerHTML = '';
        }, 1000);
    };

    // ৭. মূল কোডের রেন্ডার ফাংশন ইন্টারসেপ্ট করে টেবিল ও ব্যাজ নিখুঁত রাখা
    function hookOriginalFunctions() {
        if (window.renderStudentTable) {
            const originalRender = window.renderStudentTable;
            window.renderStudentTable = function () {
                originalRender.apply(this, arguments);

                // টেবিলের ভিতরের বাটন ও নোটিফিকেশন টেক্সট ইংরেজি করা
                const tbody = document.getElementById('studentTableBody');
                if (tbody) {
                    tbody.querySelectorAll('tr').forEach(tr => {
                        const btn = tr.querySelector('button');
                        if (btn && btn.innerHTML.includes('Print Certificate')) {
                            btn.innerHTML = '<i class="fa-solid fa-print"></i> Print';
                            btn.style.padding = '5px 12px';
                        }
                        const emptyTd = tr.querySelector('td[colspan="9"]');
                        if (emptyTd && emptyTd.innerText.includes('কোনো')) {
                            emptyTd.innerText = "No student records found.";
                        }
                    });
                }
                updateBadgeCount();
            };
        }

        if (window.filterByTemplate) {
            const originalFilter = window.filterByTemplate;
            window.filterByTemplate = function (tpl, btn) {
                currentFilter = tpl;
                originalFilter.apply(this, arguments);
                updateBadgeCount();
            };
        }
    }

    // ৮. অটো ইনিশিয়ালাইজার
    function initAddon() {
        injectCustomStyles();
        hookOriginalFunctions();

        const timer = setInterval(() => {
            if (transformCPSCLInterface()) {
                updateBadgeCount();

                const searchInp = document.getElementById('studentSearchInput');
                if (searchInp) {
                    searchInp.addEventListener('input', updateBadgeCount);
                }
                clearInterval(timer);
            }
        }, 150);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAddon);
    } else {
        initAddon();
    }
})();
