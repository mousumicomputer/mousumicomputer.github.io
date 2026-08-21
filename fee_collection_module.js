/**
 * Mousumi Computer ERP - Independent Education Module
 * SECTION 1 & 2: REVERTED TO USER'S ORIGINAL DESIGN (Untouched)
 * SECTION 3: INLINE UPLOAD (No Full Screen Loader, Incremental Refresh)
 */

(function () {
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        #edu-mod-wrapper, #edu-mod-wrapper * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }

        /* --- SECTION 1: USER ORIGINAL STYLE --- */
        .edu-card { background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); width: 100%; max-width: 900px; overflow: hidden; border: 1px solid #e1e4e8; margin: 0 auto; }
        .edu-card-header { background-color: #34495e; color: #ffffff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .edu-card-body { padding: 25px; }
        .edu-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .edu-form-group { display: flex; flex-direction: column; }
        .edu-form-group label { font-size: 15px; color: #444; margin-bottom: 6px; font-weight: 600; }
        .edu-form-control { padding: 10px 12px; border: 1px solid #cccccc; border-radius: 5px; font-size: 16px; outline: none; }
        .edu-form-control[readonly] { background-color: #f8f9fa; color: #6c757d; }
        .edu-btn-submit { background-color: #2563eb; color: white !important; border: none; padding: 10px 28px; font-size: 16px; font-weight: bold; border-radius: 5px; cursor: pointer; }
        
        /* --- SECTION 3: CLEAN PROFESSIONAL STYLE (IMAGE 2) --- */
        .master-top-bar { display: flex; justify-content: space-between; align-items: center; padding: 15px 25px; background: #fff; border-bottom: 1px solid #eee; }
        .search-input { padding: 8px 15px; border: 1px solid #ddd; border-radius: 4px; width: 250px; font-size: 14px; }
        .upload-status-inline { font-size: 13px; font-weight: bold; color: #2563eb; margin-right: 15px; }
        
        .pro-table-container { width: 100%; overflow-x: auto; background: #fff; }
        .pro-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
        .pro-table th { background: #f8fafc; color: #64748b; font-size: 13px; text-transform: uppercase; padding: 12px 10px; text-align: left; border-bottom: 2px solid #edf2f7; }
        .pro-table td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; }
        .pro-table tr:nth-child(even) { background-color: #fcfcfc; }
        .pro-table tr:hover { background-color: #f1f7ff; }

        .btn-xl-up { background: #f8fafc; border: 1px solid #cbd5e1; padding: 7px 15px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: bold; display: inline-flex; align-items: center; gap: 5px; }

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
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-form')"><span>ফি এন্ট্রি (Fee Entry)</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-records')"><span>সকল ফি রেকর্ডস</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-master')"><span>শিক্ষার্থী ডাটা মাস্টার</span></a></li>
                </ul>
            </li>
        `);
    }

    function injectPanels() {
        const main = document.querySelector('.main-wrapper');
        if (!main) return;
        main.insertAdjacentHTML('beforeend', `
            <div id="edu-mod-wrapper">
                <!-- SECTION 1 (User Original Design) -->
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-card">
                        <div class="edu-card-header"><h2>ফি কালেকশন মডিউল (Fee Collection)</h2><span class="edu-badge">ERP v2.4</span></div>
                        <div class="edu-card-body">
                            <form id="origFeeForm">
                                <div class="edu-form-grid">
                                    <div class="edu-form-group"><label>তারিখ (Date)</label><input type="date" id="oDate" class="edu-form-control" required></div>
                                    <div class="edu-form-group"><label>স্টুডেন্ট আইডি (ID)</label><input type="text" id="oId" class="edu-form-control" placeholder="আইডি লিখুন" required></div>
                                    <div class="edu-form-group"><label>শিক্ষার্থীর নাম (Student Name)</label><input type="text" id="oName" class="edu-form-control" readonly></div>
                                </div>
                                <div class="edu-form-grid">
                                    <div class="edu-form-group"><label>বকেয়া (Net Due)</label><input type="text" id="oDue" class="edu-form-control" value="0.00" readonly></div>
                                    <div class="edu-form-group"><label>ট্রানজেকশন ফি (Txn Fee)</label><input type="number" id="oTxn" class="edu-form-control" value="6.00"></div>
                                    <div class="edu-form-group"><label>গৃহীত মোট টাকা (Net Received)</label><input type="number" id="oRec" class="edu-form-control" required></div>
                                </div>
                                <div style="text-align:right; margin-top:10px;"><button type="submit" class="edu-btn-submit">সাবমিট করুন</button></div>
                            </form>
                        </div>
                    </div>
                </div>

                <!-- SECTION 2 (All Records) -->
                <div class="view-panel" id="edu-fee-records-view">
                    <div class="edu-card" style="max-width:100%;"><div class="edu-card-header"><h2>সকল ফি রেকর্ডস তালিকা</h2></div>
                    <div class="pro-table-container"><table class="pro-table"><thead><tr><th>SL</th><th>DATE</th><th>STUDENT NAME</th><th>ID</th><th>RECEIVED</th></tr></thead><tbody id="allRecBody"></tbody></table></div></div>
                </div>

                <!-- SECTION 3 (Image 2 Professional Style) -->
                <div class="view-panel" id="edu-master-view">
                    <div class="edu-card" style="max-width:100%;">
                        <div class="master-top-bar">
                            <div class="entry-info" id="showing-count">Showing 0 to 0 entries</div>
                            <div style="display:flex; align-items:center;">
                                <span class="upload-status-inline" id="up-status"></span>
                                <input type="text" class="search-input" id="mSearch" placeholder="Search students..." oninput="renderMasterUI()">
                                <label for="xlInp" class="btn-xl-up" style="margin-left:10px;"><i class="fa-solid fa-file-excel"></i> আপলোড</label>
                                <input type="file" id="xlInp" accept=".xlsx, .xls" style="display:none;">
                            </div>
                        </div>
                        <div class="pro-table-container">
                            <table class="pro-table">
                                <thead><tr><th>SL</th><th>MONTH</th><th>STUDENT NAME</th><th>STUDENT ID</th><th>DUE AMOUNT</th><th>FEE NOTE</th></tr></thead>
                                <tbody id="mTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `);
    }

    let masterList = [];
    let feeRecords = [];

    // 🟢 ইনলাইন আপলোড হ্যান্ডলার (ফুল স্ক্রিন লোড ছাড়া)
    async function handleUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const statusLabel = document.getElementById('up-status');
        statusLabel.innerText = "ফাইল পড়া হচ্ছে...";

        const reader = new FileReader();
        reader.onload = async function (evt) {
            const json = XLSX.utils.sheet_to_json(XLSX.read(evt.target.result, { type: 'binary' }).Sheets[XLSX.read(evt.target.result, { type: 'binary' }).SheetNames[0]]);
            const total = json.length;
            masterList = [];
            let startTime = Date.now();

            // ডাটা ইনপুট প্রসেস (৫০০ জন করে ব্যাচ আকারে)
            for (let i = 0; i < total; i++) {
                const r = json[i];
                masterList.push({
                    id: String(r["STD ID"] || r["STUDENT ID"] || ""),
                    name: r["Student Name"] || r["STUDENT NAME"] || "",
                    month: r["Month Due"] || r["MONTH"] || "N/A",
                    due: parseFloat(r["Due Amount"] || r["DUE AMOUNT"]) || 0,
                    note: r["Due items"] || r["FEE NOTE"] || "-"
                });

                // প্রতি ১০০ ডাটা পর পর টেবিল রিফ্রেশ এবং সময় আপডেট
                if (i % 100 === 0 || i === total - 1) {
                    const elapsed = (Date.now() - startTime) / 1000;
                    const remaining = Math.round((elapsed / (i + 1)) * (total - (i + 1)));
                    statusLabel.innerText = `আপলোড হচ্ছে: ${i + 1}/${total} (বাকি ${remaining} সে.)`;
                    renderMasterUI(); // তৎক্ষণাৎ টেবিলে ডাটা দেখানো
                    await new Promise(res => setTimeout(res, 1));
                }
            }

            statusLabel.innerText = "ডাটাবেসে সংরক্ষিত হচ্ছে...";
            await writeToFirebase('erp/eduMasterData', masterList);
            statusLabel.innerText = "✅ আপলোড সম্পন্ন!";
            setTimeout(() => statusLabel.innerText = "", 5000);
        };
        reader.readAsBinaryString(file);
    }

    function renderMasterUI() {
        const body = document.getElementById('mTableBody');
        const search = document.getElementById('mSearch').value.toLowerCase();
        const filtered = masterList.filter(s => s.name.toLowerCase().includes(search) || s.id.includes(search));
        
        body.innerHTML = filtered.slice(0, 50).map((s, i) => `
            <tr><td>${filtered.length - i}</td><td>${s.month}</td><td style="font-weight:600">${s.name}</td><td style="color:#2980b9">${s.id}</td><td style="font-weight:bold">${s.due.toFixed(2)}</td><td style="color:#94a3b8">${s.note}</td></tr>
        `).join('');
        document.getElementById('showing-count').innerText = `Showing 1 to ${Math.min(50, filtered.length)} of ${filtered.length} entries`;
    }

    function setupLogic() {
        const idInp = document.getElementById('oId');
        document.getElementById('oDate').value = new Date().toISOString().split('T')[0];

        idInp.addEventListener('input', function() {
            const s = masterList.find(x => x.id === this.value.trim());
            if(s) { document.getElementById('oName').value = s.name; document.getElementById('oDue').value = s.due.toFixed(2); }
        });

        document.getElementById('origFeeForm').onsubmit = async function(e) {
            e.preventDefault();
            showLoader("সংরক্ষণ...");
            const s = masterList.find(x => x.id === idInp.value.trim());
            const tx = { date: document.getElementById('oDate').value, id: s.id, name: s.name, rec: document.getElementById('oRec').value, timestamp: Date.now() };
            feeRecords.push(tx);
            await writeToFirebase('erp/eduFeeRecords', feeRecords);
            this.reset(); renderRecords(); hideLoader();
            showToast("ফি জমা হয়েছে!", "success");
        };
    }

    function renderRecords() {
        const body = document.getElementById('allRecBody');
        body.innerHTML = feeRecords.slice().reverse().map((r, i) => `
            <tr><td>${feeRecords.length - i}</td><td>${r.date}</td><td>${r.name}</td><td>${r.id}</td><td>৳ ${parseFloat(r.rec).toFixed(2)}</td></tr>
        `).join('');
    }

    async function loadData() {
        const db = window.getDatabase(); const { ref, get } = window.firebase_database;
        const mSnap = await get(ref(db, 'erp/eduMasterData')); if(mSnap.exists()) masterList = mSnap.val();
        const rSnap = await get(ref(db, 'erp/eduFeeRecords')); if(rSnap.exists()) feeRecords = Object.values(rSnap.val());
        renderMasterUI(); renderRecords();
    }

    window.addEventListener('load', () => {
        injectSidebar(); injectPanels(); setupLogic();
        document.getElementById('xlInp').addEventListener('change', handleUpload);
        loadData();
    });
})();
