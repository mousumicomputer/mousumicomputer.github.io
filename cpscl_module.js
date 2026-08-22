/**
 * CPSCL Module - Dynamic Multi-Template ERP Engine
 * Clean Separated View with Global Template Selector
 */

(function () {
    function initCPSCLModule() {
        const menuList = document.querySelector('.sidebar .menu-list');
        const mainWrapper = document.querySelector('.main-wrapper');

        if (!menuList || !mainWrapper) {
            setTimeout(initCPSCLModule, 100);
            return;
        }

        if (document.getElementById('menu-cpscl-parent')) return;

        /* ==========================================================
           ১. সাইডবারে CPSCL মেনু
           ========================================================== */
        const cpsclMenuItem = document.createElement('li');
        cpsclMenuItem.className = 'menu-item';
        cpsclMenuItem.id = 'menu-cpscl-parent';

        cpsclMenuItem.innerHTML = `
            <a onclick="toggleParentMenu('menu-cpscl-parent')">
                <span class="menu-link-inner">
                    <i class="fa-solid fa-graduation-cap"></i> 
                    <span>CPSCL</span>
                </span>
                <i class="fa-solid fa-chevron-down chevron-icon"></i>
            </a>
            <ul class="submenu-list">
                <li class="submenu-item active" id="sub-cpscl-entry">
                    <a onclick="switchCPSCLSubSection('entry')">
                        <i class="fa-solid fa-pen-to-square"></i> <span>Student Entry</span>
                    </a>
                </li>
                <li class="submenu-item" id="sub-cpscl-preview">
                    <a onclick="switchCPSCLSubSection('preview')">
                        <i class="fa-solid fa-print"></i> <span>Certificate Print</span>
                    </a>
                </li>
            </ul>
        `;

        const settingsMenu = document.getElementById('menu-settings-parent');
        if (settingsMenu) {
            menuList.insertBefore(cpsclMenuItem, settingsMenu);
        } else {
            menuList.appendChild(cpsclMenuItem);
        }

        /* ==========================================================
           ২. CPSCL ভিউ প্যানেল (টেমপ্লেট সিলেক্টরসহ)
           ========================================================== */
        const cpsclViewPanel = document.createElement('div');
        cpsclViewPanel.className = 'view-panel';
        cpsclViewPanel.id = 'cpscl-view';

        cpsclViewPanel.innerHTML = `
            <style>
                .cpscl-form-card {
                    background: #ffffff;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    padding: 30px;
                    max-width: 920px;
                    margin: 0 auto;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                }
                .cpscl-template-select-box {
                    background: #eef2ff;
                    border: 1.5px solid #c7d2fe;
                    color: #3730a3;
                    font-weight: 700;
                    padding: 8px 14px;
                    border-radius: 10px;
                    outline: none;
                    cursor: pointer;
                    font-size: 0.92rem;
                }
                .cpscl-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 18px;
                    margin-bottom: 25px;
                }
                .cpscl-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .cpscl-input-group label {
                    font-size: 0.88rem;
                    font-weight: 700;
                    color: #475569;
                }
                .cpscl-input-group label span {
                    color: #ef4444;
                }
                .cpscl-control {
                    width: 100%;
                    height: 46px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 0 14px;
                    font-size: 0.95rem;
                    color: #1e293b;
                    outline: none;
                    background: #fcfdfe;
                    transition: 0.2s;
                }
                .cpscl-control:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                    background: #fff;
                }

                /* A4 Preview Wrapper & Toolbars */
                .cpscl-preview-wrapper {
                    background: #525659;
                    padding: 30px 15px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow-x: auto;
                }
                .cpscl-toolbar {
                    width: 210mm;
                    max-width: 100%;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .cpscl-a4-sheet {
                    background: #ffffff;
                    width: 210mm;
                    min-height: 297mm;
                    padding: 70mm 25mm 25mm 25mm; /* প্যাডের উপরের অংশের জন্য ফাঁকা */
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                    color: #000;
                    font-family: 'Monotype Corsiva', 'Times New Roman', cursive, serif;
                    box-sizing: border-box;
                    position: relative;
                }
                .cert-ref {
                    font-family: Arial, sans-serif;
                    font-size: 13px;
                    font-weight: bold;
                    margin-bottom: 30px;
                }
                .cert-body {
                    font-size: 18.5px;
                    line-height: 1.9;
                    text-align: justify;
                    font-style: italic;
                }
                .cert-bold {
                    font-family: Arial, sans-serif;
                    font-weight: 800;
                    font-style: normal;
                    text-transform: uppercase;
                }
                .cert-meta-bold {
                    font-family: Arial, sans-serif;
                    font-weight: 800;
                    font-style: normal;
                }
                .cert-footer-date {
                    font-family: Arial, sans-serif;
                    font-size: 11px;
                    font-weight: bold;
                    margin-top: 55px;
                }

                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #cpsclPrintArea, #cpsclPrintArea * {
                        visibility: visible !important;
                    }
                    #cpsclPrintArea {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 65mm 20mm 20mm 20mm !important;
                        box-shadow: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            </style>

            <!-- ================= ১. এন্ট্রি সেকশন ================= -->
            <div id="cpscl-entry-view" class="cpscl-sub-view">
                <div class="cpscl-form-card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 15px; flex-wrap: wrap; gap: 12px;">
                        <div>
                            <h2 style="font-size: 1.3rem; color: #1e293b; font-weight: 800;"><i class="fa-solid fa-pen-to-square" style="color: #4f46e5;"></i> Student Information Entry</h2>
                            <p style="font-size: 0.85rem; color: #64748b; margin-top: 2px;">তথ্য ইনপুট দিন এবং টেমপ্লেট নির্বাচন করুন</p>
                        </div>
                        
                        <!-- টেমপ্লেট ড্রপডাউন -->
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label style="font-size: 0.85rem; font-weight: 700; color: #475569;"><i class="fa-solid fa-layer-group"></i> Template:</label>
                            <select id="entryTemplateSelect" class="cpscl-template-select-box" onchange="onTemplateChange(this.value)">
                                <option value="ssc_testimonial">SSC Testimonial (এসএসসি প্রশংসাপত্র)</option>
                                <option value="hsc_testimonial">HSC Testimonial (এইচএসসি প্রশংসাপত্র)</option>
                                <option value="tc_certificate">Transfer Certificate - TC (ছাড়পত্র)</option>
                                <option value="character_cert">Character Certificate (চারিত্রিক সনদ)</option>
                            </select>
                        </div>
                    </div>

                    <form id="cpsclEntryForm" onsubmit="event.preventDefault(); generateAndGoPreview();">
                        <div class="cpscl-grid">
                            <div class="cpscl-input-group" style="grid-column: 1 / -1;">
                                <label>Reference No. <span>*</span></label>
                                <input type="text" id="inpRef" class="cpscl-control" value="CPSCL/ 801023/SSC-26/001" required>
                            </div>
                            <div class="cpscl-input-group" style="grid-column: 1 / -1;">
                                <label>Student's Full Name <span>*</span></label>
                                <input type="text" id="inpName" class="cpscl-control" value="K M ANISUJJAMAN MASUM" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Gender <span>*</span></label>
                                <select id="inpGender" class="cpscl-control">
                                    <option value="Male">Male (Son / He / His)</option>
                                    <option value="Female">Female (Daughter / She / Her)</option>
                                </select>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Father's Name <span>*</span></label>
                                <input type="text" id="inpFather" class="cpscl-control" value="MD ASHRAFUL HABIB" required>
                            </div>
                            <div class="cpscl-input-group" style="grid-column: 1 / -1;">
                                <label>Mother's Name <span>*</span></label>
                                <input type="text" id="inpMother" class="cpscl-control" value="MST AKLIMA KHATUN" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Roll No <span>*</span></label>
                                <input type="text" id="inpRoll" class="cpscl-control" value="229083" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Registration No <span>*</span></label>
                                <input type="text" id="inpReg" class="cpscl-control" value="2317722960" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Session <span>*</span></label>
                                <input type="text" id="inpSession" class="cpscl-control" value="2024-2025" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Passing Year <span>*</span></label>
                                <input type="text" id="inpYear" class="cpscl-control" value="2026" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Group <span>*</span></label>
                                <input type="text" id="inpGroup" class="cpscl-control" value="Science" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Education Board <span>*</span></label>
                                <input type="text" id="inpBoard" class="cpscl-control" value="Dinajpur" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>GPA <span>*</span></label>
                                <input type="text" id="inpGpa" class="cpscl-control" value="5.00" required>
                            </div>
                            <div class="cpscl-input-group">
                                <label>Result Publication Date</label>
                                <input type="text" id="inpPubDate" class="cpscl-control" value="10 August 2026">
                            </div>
                        </div>

                        <div style="display: flex; justify-content: flex-end; gap: 15px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                            <button type="reset" class="btn-submit" style="width: auto; padding: 12px 25px; background: #94a3b8; border-radius: 10px;">
                                <i class="fa-solid fa-rotate-left"></i> Reset
                            </button>
                            <button type="submit" class="btn-submit" style="width: auto; padding: 12px 35px; background: #4f46e5; border-radius: 10px; font-size: 1rem;">
                                <i class="fa-solid fa-file-circle-check"></i> Generate & View Certificate
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- ================= ২. প্রিন্ট ও প্রিভিউ সেকশন (টুলবারে ড্রপডাউনসহ) ================= -->
            <div id="cpscl-preview-view" class="cpscl-sub-view" style="display:none;">
                <div class="cpscl-preview-wrapper">
                    
                    <!-- প্রিভিউ টুলবার -->
                    <div class="cpscl-toolbar">
                        <button class="btn-submit" onclick="switchCPSCLSubSection('entry')" style="width: auto; padding: 10px 18px; background: #334155; border-radius: 8px;">
                            <i class="fa-solid fa-arrow-left"></i> Back to Edit Info
                        </button>
                        
                        <!-- প্রিভিউ পেজেও টেমপ্লেট ড্রপডাউন -->
                        <div style="display: flex; align-items: center; gap: 8px; background: #fff; padding: 4px 12px; border-radius: 8px;">
                            <span style="font-size: 0.85rem; font-weight: 700; color: #475569;">Selected Template:</span>
                            <select id="previewTemplateSelect" class="cpscl-template-select-box" style="border: none; background: transparent; padding: 4px 6px;" onchange="onTemplateChange(this.value)">
                                <option value="ssc_testimonial">SSC Testimonial (এসএসসি প্রশংসাপত্র)</option>
                                <option value="hsc_testimonial">HSC Testimonial (এইচএসসি প্রশংসাপত্র)</option>
                                <option value="tc_certificate">Transfer Certificate - TC (ছাড়পত্র)</option>
                                <option value="character_cert">Character Certificate (চারিত্রিক সনদ)</option>
                            </select>
                        </div>

                        <button class="btn-submit" onclick="window.print()" style="width: auto; padding: 10px 25px; background: #22c55e; border-radius: 8px; font-weight: 800; font-size: 1rem;">
                            <i class="fa-solid fa-print"></i> Print / Download PDF
                        </button>
                    </div>

                    <!-- A4 সার্টিফিকেট শিট -->
                    <div class="cpscl-a4-sheet" id="cpsclPrintArea">
                        <div class="cert-ref" id="prevRef">CPSCL/ 801023/SSC-26/001</div>
                        
                        <div class="cert-body" id="certificateBodyContainer">
                            This is to certify that <span class="cert-bold" id="prevName">K M ANISUJJAMAN MASUM</span>, <span id="prevRelation">son of</span> <span class="cert-bold" id="prevFather">MD ASHRAFUL HABIB</span> and <span class="cert-bold" id="prevMother">MST AKLIMA KHATUN</span> bearing Roll No. <span class="cert-meta-bold" id="prevRoll">229083</span>, Registration No. <span class="cert-meta-bold" id="prevReg">2317722960</span>, Session <span class="cert-meta-bold" id="prevSession">2024-2025</span> passed <span id="prevExamName">Secondary School Certificate Examination</span> in <span class="cert-meta-bold" id="prevYear">2026</span> from <span class="cert-meta-bold" id="prevGroup">Science</span> group under the Board of Intermediate and Secondary Education, <span id="prevBoard">Dinajpur</span> as a regular student of this institution and acquired GPA- <span class="cert-meta-bold" id="prevGpa">5.00</span>.
                            <br><br>
                            <span id="prevPronoun">He</span> bears a good moral character. To the best of my concern, <span id="prevPronounLower">he</span> did not take part in any activity subversive of the state or against discipline during <span id="prevPossessive">his</span> stay at this institution.
                            <br><br>
                            I wish <span id="prevObjective">him</span> a bright future.
                        </div>

                        <div class="cert-footer-date">
                            [Result Publication Date: <span id="prevPubDate">10 August 2026</span>]
                        </div>
                    </div>
                </div>
            </div>
        `;

        mainWrapper.appendChild(cpsclViewPanel);
    }

    /* ==========================================================
       ৩. টেমপ্লেট পরিবর্তন হ্যান্ডলার
       ========================================================== */
    window.onTemplateChange = function (templateVal) {
        // উভয় ড্রপডাউনকে সিঙ্ক রাখা
        const entrySel = document.getElementById('entryTemplateSelect');
        const prevSel = document.getElementById('previewTemplateSelect');
        if (entrySel) entrySel.value = templateVal;
        if (prevSel) prevSel.value = templateVal;

        const examSpan = document.getElementById('prevExamName');
        const refInp = document.getElementById('inpRef');

        if (templateVal === 'hsc_testimonial') {
            if (examSpan) examSpan.innerText = "Higher Secondary Certificate Examination";
            if (refInp && refInp.value.includes('SSC')) refInp.value = refInp.value.replace('SSC', 'HSC');
        } else {
            if (examSpan) examSpan.innerText = "Secondary School Certificate Examination";
            if (refInp && refInp.value.includes('HSC')) refInp.value = refInp.value.replace('HSC', 'SSC');
        }

        updateCertificateData();
    };

    /* ==========================================================
       ৪. সাব-সেকশন সুইচ করার ফাংশন
       ========================================================== */
    window.switchCPSCLSubSection = function (sectionType) {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.submenu-item').forEach(s => s.classList.remove('active'));

        const panel = document.getElementById('cpscl-view');
        if (panel) panel.classList.add('active');

        const parentMenu = document.getElementById('menu-cpscl-parent');
        if (parentMenu) parentMenu.classList.add('active');

        const entryView = document.getElementById('cpscl-entry-view');
        const previewView = document.getElementById('cpscl-preview-view');
        const subEntry = document.getElementById('sub-cpscl-entry');
        const subPreview = document.getElementById('sub-cpscl-preview');

        if (sectionType === 'entry') {
            if (entryView) entryView.style.display = 'block';
            if (previewView) previewView.style.display = 'none';
            if (subEntry) subEntry.classList.add('active');
            document.getElementById('top-title').innerText = "CPSCL - STUDENT ENTRY";
        } else {
            updateCertificateData();
            if (entryView) entryView.style.display = 'none';
            if (previewView) previewView.style.display = 'block';
            if (subPreview) subPreview.classList.add('active');
            document.getElementById('top-title').innerText = "CPSCL - CERTIFICATE PRINT";
        }
    };

    /* ==========================================================
       ৫. সার্টিফিকেট ডাটা আপডেট
       ========================================================== */
    function updateCertificateData() {
        const isMale = document.getElementById('inpGender').value === 'Male';

        document.getElementById('prevRef').innerText = document.getElementById('inpRef').value;
        document.getElementById('prevName').innerText = document.getElementById('inpName').value;
        document.getElementById('prevFather').innerText = document.getElementById('inpFather').value;
        document.getElementById('prevMother').innerText = document.getElementById('inpMother').value;
        document.getElementById('prevRoll').innerText = document.getElementById('inpRoll').value;
        document.getElementById('prevReg').innerText = document.getElementById('inpReg').value;
        document.getElementById('prevSession').innerText = document.getElementById('inpSession').value;
        document.getElementById('prevYear').innerText = document.getElementById('inpYear').value;
        document.getElementById('prevGroup').innerText = document.getElementById('inpGroup').value;
        document.getElementById('prevBoard').innerText = document.getElementById('inpBoard').value;
        document.getElementById('prevGpa').innerText = document.getElementById('inpGpa').value;
        document.getElementById('prevPubDate').innerText = document.getElementById('inpPubDate').value;

        // Gender Pronouns Auto Update
        document.getElementById('prevRelation').innerText = isMale ? "son of" : "daughter of";
        document.getElementById('prevPronoun').innerText = isMale ? "He" : "She";
        document.getElementById('prevPronounLower').innerText = isMale ? "he" : "she";
        document.getElementById('prevPossessive').innerText = isMale ? "his" : "her";
        document.getElementById('prevObjective').innerText = isMale ? "him" : "her";
    }

    window.generateAndGoPreview = function () {
        switchCPSCLSubSection('preview');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCPSCLModule);
    } else {
        initCPSCLModule();
    }
})();
