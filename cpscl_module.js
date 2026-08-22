/**
 * CPSCL Module - Professional ERP Template Engine
 * Single submenu: Templates
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
           ১. সাইডবারে CPSCL মেনু (শুধু Templates সাব-মেনুসহ)
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
                <li class="submenu-item active" id="sub-cpscl-templates">
                    <a onclick="openCPSCLTemplates()">
                        <i class="fa-solid fa-file-lines"></i> <span>Templates</span>
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
           ২. CPSCL টেমপ্লেট ভিউ প্যানেল (Clean ERP Layout)
           ========================================================== */
        const cpsclViewPanel = document.createElement('div');
        cpsclViewPanel.className = 'view-panel';
        cpsclViewPanel.id = 'cpscl-view';

        cpsclViewPanel.innerHTML = `
            <style>
                .cpscl-container {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 25px;
                }
                @media (max-width: 1024px) {
                    .cpscl-container {
                        grid-template-columns: 1fr;
                    }
                }
                .cpscl-form-group {
                    margin-bottom: 12px;
                }
                .cpscl-form-group label {
                    display: block;
                    font-size: 0.85rem;
                    font-weight: 700;
                    color: #475569;
                    margin-bottom: 4px;
                }
                .cpscl-form-control {
                    width: 100%;
                    padding: 9px 12px;
                    border: 1.5px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    outline: none;
                }
                .cpscl-form-control:focus {
                    border-color: #4f46e5;
                }

                /* A4 Certificate Printable Sheet */
                .cpscl-sheet-wrapper {
                    background: #525659;
                    padding: 20px;
                    border-radius: 12px;
                    display: flex;
                    justify-content: center;
                    overflow-x: auto;
                }
                .cpscl-a4-sheet {
                    background: #ffffff;
                    width: 210mm;
                    min-height: 297mm;
                    padding: 65mm 25mm 25mm 25mm; /* প্যাডের উপরের অংশের জন্য জায়গা */
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
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
                    font-size: 18px;
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
                    margin-top: 50px;
                }

                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #cpsclPrintArea, #cpsclPrintArea * {
                        visibility: visible;
                    }
                    #cpsclPrintArea {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 60mm 20mm 20mm 20mm !important;
                        box-shadow: none;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            </style>

            <div class="erp-form-card" style="max-width: 100%;">
                <div class="erp-form-header">
                    <span><i class="fa-solid fa-stamp" style="color: #4f46e5;"></i> CPSCL Document & Template Management</span>
                    <div>
                        <select id="cpsclTemplateSelect" class="cpscl-form-control" style="width: auto; font-weight: bold; display: inline-block;">
                            <option value="ssc_testimonial">SSC Testimonial (প্রশংসাপত্র)</option>
                        </select>
                    </div>
                </div>

                <div class="cpscl-container">
                    <!-- বাম পাশ: ডাটা এন্ট্রি ফরম -->
                    <div>
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                            <h3 style="font-size: 1rem; color: #1e293b; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
                                <i class="fa-solid fa-pen-to-square"></i> Student Information
                            </h3>

                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div class="cpscl-form-group" style="grid-column: span 2;">
                                    <label>Reference No.</label>
                                    <input type="text" id="inpRef" class="cpscl-form-control" value="CPSCL/ 801023/SSC-26/001" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group" style="grid-column: span 2;">
                                    <label>Student's Full Name</label>
                                    <input type="text" id="inpName" class="cpscl-form-control" value="K M ANISUJJAMAN MASUM" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group">
                                    <label>Gender</label>
                                    <select id="inpGender" class="cpscl-form-control" onchange="updatePreview()">
                                        <option value="Male">Male (Son)</option>
                                        <option value="Female">Female (Daughter)</option>
                                    </select>
                                </div>
                                <div class="cpscl-form-group">
                                    <label>Father's Name</label>
                                    <input type="text" id="inpFather" class="cpscl-form-control" value="MD ASHRAFUL HABIB" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group" style="grid-column: span 2;">
                                    <label>Mother's Name</label>
                                    <input type="text" id="inpMother" class="cpscl-form-control" value="MST AKLIMA KHATUN" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group">
                                    <label>Roll No</label>
                                    <input type="text" id="inpRoll" class="cpscl-form-control" value="229083" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group">
                                    <label>Registration No</label>
                                    <input type="text" id="inpReg" class="cpscl-form-control" value="2317722960" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group">
                                    <label>Session</label>
                                    <input type="text" id="inpSession" class="cpscl-form-control" value="2024-2025" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group">
                                    <label>Passing Year</label>
                                    <input type="text" id="inpYear" class="cpscl-form-control" value="2026" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group">
                                    <label>Group</label>
                                    <input type="text" id="inpGroup" class="cpscl-form-control" value="Science" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group">
                                    <label>Education Board</label>
                                    <input type="text" id="inpBoard" class="cpscl-form-control" value="Dinajpur" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group">
                                    <label>GPA</label>
                                    <input type="text" id="inpGpa" class="cpscl-form-control" value="5.00" oninput="updatePreview()">
                                </div>
                                <div class="cpscl-form-group">
                                    <label>Result Publication Date</label>
                                    <input type="text" id="inpPubDate" class="cpscl-form-control" value="10 August 2026" oninput="updatePreview()">
                                </div>
                            </div>

                            <div style="display: flex; gap: 10px; margin-top: 15px;">
                                <button class="btn-submit" onclick="window.print()" style="background: #4f46e5;">
                                    <i class="fa-solid fa-print"></i> Print / Save PDF
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- ডান পাশ: লাইভ A4 প্রিভিউ -->
                    <div>
                        <div class="cpscl-sheet-wrapper">
                            <div class="cpscl-a4-sheet" id="cpsclPrintArea">
                                <div class="cert-ref" id="prevRef">CPSCL/ 801023/SSC-26/001</div>
                                
                                <div class="cert-body">
                                    This is to certify that <span class="cert-bold" id="prevName">K M ANISUJJAMAN MASUM</span>, <span id="prevRelation">son of</span> <span class="cert-bold" id="prevFather">MD ASHRAFUL HABIB</span> and <span class="cert-bold" id="prevMother">MST AKLIMA KHATUN</span> bearing Roll No. <span class="cert-meta-bold" id="prevRoll">229083</span>, Registration No. <span class="cert-meta-bold" id="prevReg">2317722960</span>, Session <span class="cert-meta-bold" id="prevSession">2024-2025</span> passed Secondary School Certificate Examination in <span class="cert-meta-bold" id="prevYear">2026</span> from <span class="cert-meta-bold" id="prevGroup">Science</span> group under the Board of Intermediate and Secondary Education, <span id="prevBoard">Dinajpur</span> as a regular student of this institution and acquired GPA- <span class="cert-meta-bold" id="prevGpa">5.00</span>.
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
                </div>
            </div>
        `;

        mainWrapper.appendChild(cpsclViewPanel);
    }

    /* ==========================================================
       ৩. রিয়েল-টাইম প্রিভিউ আপডেট ফাংশন
       ========================================================== */
    window.updatePreview = function () {
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

        // Gender Pronouns
        document.getElementById('prevRelation').innerText = isMale ? "son of" : "daughter of";
        document.getElementById('prevPronoun').innerText = isMale ? "He" : "She";
        document.getElementById('prevPronounLower').innerText = isMale ? "he" : "she";
        document.getElementById('prevPossessive').innerText = isMale ? "his" : "her";
        document.getElementById('prevObjective').innerText = isMale ? "him" : "her";
    };

    /* ==========================================================
       ৪. CPSCL Templates ওপেন করার ফাংশন
       ========================================================== */
    window.openCPSCLTemplates = function () {
        document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));

        const panel = document.getElementById('cpscl-view');
        if (panel) panel.classList.add('active');

        const parentMenu = document.getElementById('menu-cpscl-parent');
        if (parentMenu) parentMenu.classList.add('active');

        const titleEl = document.getElementById('top-title');
        if (titleEl) titleEl.innerText = "CPSCL - TEMPLATES";

        updatePreview();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCPSCLModule);
    } else {
        initCPSCLModule();
    }
})();
