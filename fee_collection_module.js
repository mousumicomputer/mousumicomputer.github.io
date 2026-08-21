/**
 * Mousumi Computer ERP - Education Module (PRO Version)
 * Optimized for 1000+ Records with Search & Professional UI
 */

(function () {
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        #edu-wrapper, #edu-wrapper * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }

        /* --- SECTION 1 & 2 (ORIGINAL) --- */
        .edu-card { background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px; border: 1px solid #e1e4e8; overflow: hidden; }
        .edu-header { background: #34495e; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .edu-header h2 { font-size: 20px !important; margin: 0; }
        .edu-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 25px; }
        .edu-control { padding: 10px 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; width: 100%; outline: none; }
        .edu-btn-submit { background: #2563eb; color: #fff; border: none; padding: 10px 30px; border-radius: 5px; font-weight: bold; cursor: pointer; float: right; margin: 0 25px 25px 0; }

        /* --- SECTION 3: IMAGE 2 STYLE TABLE --- */
        .master-controls { display: flex; justify-content: space-between; align-items: center; padding: 20px 25px; background: #fff; border-bottom: 1px solid #eee; }
        .search-box { padding: 8px 15px; border: 1px solid #ddd; border-radius: 20px; width: 250px; outline: none; font-size: 14px; }
        .entry-info { color: #666; font-size: 14px; }

        .pro-table-wrapper { padding: 0; overflow-x: auto; background: #fff; }
        .pro-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
        .pro-table th { background: #f8fafc; color: #7f8c8d; font-size: 13px; text-transform: uppercase; padding: 15px 10px; text-align: left; border-bottom: 2px solid #edf2f7; font-weight: 600; }
        .pro-table td { padding: 15px 10px; border-bottom: 1px solid #f1f5f9; color: #2c3e50; font-size: 15px; }
        
        /* Zebra Stripes */
        .pro-table tr:nth-child(even) { background-color: #fcfcfc; }
        .pro-table tr:hover { background-color: #f1f7ff; }

        .btn-upload-simple { background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px; display: inline-flex; align-items: center; gap: 8px; transition: 0.3s; }
        .btn-upload-simple:hover { background: #e2e8f0; }

        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    function injectSidebar() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-edu-parent')) return;
        menuList.insertAdjacentHTML('beforeend', `
            <li class="menu-item" id="menu-edu-parent">
                <a onclick="this.parentElement.classList.toggle('open')">
                    <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>শিক্ষা ও ডিজিটাল সেবা</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon" style="font-size: 0.7rem;"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-form')"><span>ফি এন্ট্রি (Entry)</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-records')"><span>সকল রেকর্ডস</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-master')"><span>শিক্ষার্থী মাস্টার ডাটা</span></a></li>
                </ul>
            </li>
        `);
    }

    function injectPanels() {
        const main = document.querySelector('.main-wrapper');
        if (!main) return;
        main.insertAdjacentHTML('beforeend', `
            <div id="edu-wrapper">
                <!-- SECTION 1 -->
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-card" style="max-width:900px; margin: 20px auto;">
                        <div class="edu-header"><h2>ফি কালেকশন মডিউল</h2><span>ERP v2.4</span></div>
                        <form id="eduEntryForm">
                            <div class="edu-form-grid">
                                <div><label>তারিখ</label><input type="date" id="edDate" class="edu-control" required></div>
                                <div><label>স্টুডেন্ট আইডি</label><input type="text" id="edId" class="edu-control" placeholder="ID লিখুন" required></div>
                                <div><label>শিক্ষার্থীর নাম</label><input type="text" id="edName" class="edu-control" readonly></div>
                                <div><label>বকেয়া</label><input type="text" id="edDue" class="edu-control" readonly value="0.00"></div>
                                <div><label>গৃহীত টাকা</label><input type="number" id="edRec" class="edu-control" required></div>
                            </div>
                            <button type="submit" class="edu-btn-submit">সাবমিট করুন</button><div style="clear:both;"></div>
                        </form>
                    </div>
                </div>

                <!-- SECTION 2: RECORDS -->
                <div class="view-panel" id="edu-fee-records-view">
                   <div style="padding:20px;"><h3>জমা হওয়া ফি তালিকা</h3></div>
                   <div class="pro-table-wrapper"><table class="pro-table"><thead><tr><th>SL</th><th>Date</th><th>Name</th><th>ID</th><th>Received</th></tr></thead><tbody id="recTableBody"></tbody></table></div>
                </div>

                <!-- SECTION 3: MASTER DATA (IMAGE 2 STYLE) -->
                <div class="view-panel" id="edu-master-view">
                    <div class="edu-card">
                        <div class="edu-header"><h2>শিক্ষার্থী মাস্টার ডাটা (Student Master)</h2></div>
                        
                        <div class="master-controls">
                            <div class="entry-info" id="showing-text">Showing 0 to 0 of 0 entries</div>
                            <div style="display:flex; gap:15px; align-items:center;">
                                <input type="text" class="search-box" id="masterSearch" placeholder="খুঁজুন (নাম বা আইডি)..." oninput="renderMasterTable()">
                                <label for="xlInp" class="btn-upload-simple"><i class="fa-solid fa-cloud-arrow-up"></i> আপলোড এক্সেল</label>
                                <input type="file" id="xlInp" accept=".xlsx, .xls" style="display:none;">
                            </div>
                        </div>

                        <div class="pro-table-wrapper">
                            <table class="pro-table">
                                <thead>
                                    <tr><th>SL</th><th>MONTH</th><th>STUDENT NAME</th><th>STUDENT ID</th><th>DUE AMOUNT</th><th>FEE NOTE</th></tr>
                                </thead>
                                <tbody id="masterTableBody">
                                    <tr><td colspan="6" style="text-align:center; padding:50px; color:#999;">কোনো তথ্য নেই, ফাইল আপলোড করুন।</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    let masterList = [];
    let records = [];

    async function handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        showLoader("ফাইল পড়া হচ্ছে...");
        const reader = new FileReader();
        reader.onload = async function (evt) {
            const json = XLSX.utils.sheet_to_json(XLSX.read(evt.target.result, { type: 'binary' }).Sheets[XLSX.read(evt.target.result, { type: 'binary' }).SheetNames[0]]);
            
            masterList = json.map(r => ({
                id: String(r["STD ID"] || ""),
                name: r["Student Name"] || "",
                month: r["Month Due"] || r["MONTH"] || "N/A",
                due: parseFloat(r["Due Amount"] || r["DUE AMOUNT"]) || 0,
                note: r["Due items"] || r["FEE NOTE"] || "-"
            }));

            await writeToFirebase('erp/eduMasterData', masterList);
            renderMasterTable();
            hideLoader();
            showToast("ডাটা সফলভাবে আপলোড হয়েছে!", "success");
        };
        reader.readAsBinaryString(file);
    }

    function renderMasterTable() {
        const body = document.getElementById('masterTableBody');
        const search = document.getElementById('masterSearch').value.toLowerCase();
        const info = document.getElementById('showing-text');
        
        let filtered = masterList.filter(s => s.name.toLowerCase().includes(search) || s.id.includes(search));
        
        body.innerHTML = filtered.slice(0, 50).map((s, i) => `
            <tr>
                <td style="color:#7f8c8d;">${filtered.length - i}</td>
                <td>${s.month}</td>
                <td style="font-weight:600; color:#34495e;">${s.name}</td>
                <td style="color:#2980b9;">${s.id}</td>
                <td style="font-weight:bold;">${s.due.toFixed(2)}</td>
                <td style="color:#7f8c8d; font-size:13px;">${s.note}</td>
            </tr>
        `).join('');

        info.innerText = `Showing 1 to ${Math.min(50, filtered.length)} of ${filtered.length} entries`;
    }

    function initLogic() {
        const idInp = document.getElementById('edId');
        document.getElementById('edDate').value = new Date().toISOString().split('T')[0];

        idInp.addEventListener('input', function() {
            const s = masterList.find(x => x.id === this.value.trim());
            if(s) {
                document.getElementById('edName').value = s.name;
                document.getElementById('edDue').value = s.due.toFixed(2);
            }
        });

        document.getElementById('eduEntryForm').onsubmit = async function(e) {
            e.preventDefault();
            const id = idInp.value.trim();
            const s = masterList.find(x => x.id === id);
            if(!s) return alert("আইডি খুঁজে পাওয়া যায়নি!");

            showLoader("সংরক্ষণ...");
            const tx = { date: document.getElementById('edDate').value, id: s.id, name: s.name, rec: document.getElementById('edRec').value, timestamp: Date.now() };
            records.push(tx);
            await writeToFirebase('erp/eduFeeRecords', records);
            this.reset();
            hideLoader();
            showToast("ফি জমা হয়েছে!", "success");
        };
    }

    async function load() {
        const db = window.getDatabase();
        const { ref, get } = window.firebase_database;
        const mSnap = await get(ref(db, 'erp/eduMasterData'));
        if(mSnap.exists()) masterList = mSnap.val();
        const rSnap = await get(ref(db, 'erp/eduFeeRecords'));
        if(rSnap.exists()) records = Object.values(rSnap.val());
        renderMasterTable();
    }

    window.addEventListener('load', () => {
        injectSidebar(); injectPanels(); initLogic();
        document.getElementById('xlInp').addEventListener('change', handleUpload);
        load();
    });
})();
