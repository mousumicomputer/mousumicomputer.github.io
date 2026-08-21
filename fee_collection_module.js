/**
 * Mousumi Computer ERP - Independent Education Module
 * Section 1: Entry Form (Auto-populates from Section 3)
 * Section 2: Permanent Records Table (Static)
 * Section 3: Data Master (Excel Upload Center)
 */

(function () {
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        #edu-mod, #edu-mod * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }

        /* --- SECTION 3: UPLOAD CENTER STYLE --- */
        .edu-master-card { background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px; border: 1px solid #e1e4e8; overflow: hidden; }
        .edu-master-header { background: #34495e; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .edu-upload-box { padding: 30px; text-align: center; border: 2px dashed #cbd5e1; margin: 20px; border-radius: 10px; background: #f8fafc; }
        .btn-download { background: #10b981; color: #fff !important; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-right: 10px; display: inline-block; cursor: pointer; }
        .btn-upload-label { background: #2563eb; color: #fff; padding: 10px 25px; border-radius: 5px; cursor: pointer; font-weight: bold; display: inline-block; }
        
        /* --- TABLE STYLE (SECTION 2 & 3) --- */
        .edu-table-wrapper { padding: 20px; overflow-x: auto; }
        .edu-full-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 14px !important; }
        .edu-full-table th { background: #f8fafc; color: #475569; padding: 10px; border: 1px solid #e2e8f0; text-align: center; }
        .edu-full-table td { padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #334155; }

        /* --- SECTION 1 (ORIGINAL DESIGN) --- */
        .edu-card-original { background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e1e4e8; overflow: hidden; max-width: 900px; margin: 0 auto 25px auto; }
        .edu-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 25px; }
        .edu-form-group { display: flex; flex-direction: column; }
        .edu-form-group label { font-size: 15px; color: #444; margin-bottom: 6px; font-weight: 600; }
        .edu-control { padding: 10px 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; outline: none; }
        .edu-btn-submit { background: #2563eb; color: #fff; border: none; padding: 12px 40px; border-radius: 5px; font-weight: bold; cursor: pointer; float: right; margin: 0 25px 25px 0; }

        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ১. সাইডবার মেনু তৈরি
    function injectMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-edu-parent')) return;

        const html = `
            <li class="menu-item" id="menu-edu-parent">
                <a onclick="this.parentElement.classList.toggle('open')">
                    <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>শিক্ষা ও ডিজিটাল সেবা</span></span>
                    <i class="fa-solid fa-chevron-down chevron-icon" style="font-size: 0.7rem;"></i>
                </a>
                <ul class="submenu-list">
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-form')"><i class="fa-solid fa-angle-right"></i> <span>ফি এন্ট্রি (Fee Entry)</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-fee-records')"><i class="fa-solid fa-angle-right"></i> <span>সকল ফি রেকর্ডস</span></a></li>
                    <li class="submenu-item"><a onclick="switchMainTab('edu-data-master')"><i class="fa-solid fa-angle-right"></i> <span>শিক্ষার্থী ডাটা মাস্টার</span></a></li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    // ২. ৩টি সেকশনের প্যানেল ইনজেক্ট করা
    function injectPanels() {
        const wrapper = document.querySelector('.main-wrapper');
        if (!wrapper) return;

        const html = `
            <div id="edu-mod">
                <!-- SECTION 1: FEE ENTRY -->
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-card-original">
                        <div class="edu-master-header"><h2>ফি কালেকশন মডিউল (Fee Collection)</h2><span style="font-family:Times New Roman; opacity:0.7;">ERP v2.4</span></div>
                        <form id="feeForm">
                            <div class="edu-form-grid">
                                <div class="edu-form-group"><label>তারিখ (Date)</label><input type="date" id="fDate" class="edu-control" required></div>
                                <div class="edu-form-group"><label>স্টুডেন্ট আইডি (ID)</label><input type="text" id="fId" class="edu-control" placeholder="আইডি লিখুন" required></div>
                                <div class="edu-form-group"><label>শিক্ষার্থীর নাম (Student Name)</label><input type="text" id="fName" class="edu-control" readonly></div>
                                <div class="edu-form-group"><label>বকেয়া (Net Due)</label><input type="text" id="fDue" class="edu-control" readonly value="0.00"></div>
                                <div class="edu-form-group"><label>ট্রানজেকশন ফি (Txn Fee)</label><input type="number" id="fTxn" class="edu-control" readonly value="0.00"><span style="font-size:13px; color:#2563eb; font-weight:bold; margin-top:5px;">মোট চার্জ: ৳ <span id="fChargeDisp">0.00</span></span></div>
                                <div class="edu-form-group"><label>গৃহীত মোট টাকা (Net Received)</label><input type="number" id="fRec" class="edu-control" placeholder="0.00" required></div>
                                <div class="edu-form-group"><label>ছাড় (Discount)</label><input type="number" id="fDisc" class="edu-control" value="0.00"></div>
                            </div>
                            <button type="submit" class="edu-btn-submit">সাবমিট করুন</button>
                            <div style="clear:both;"></div>
                        </form>
                    </div>
                </div>

                <!-- SECTION 2: ALL FEE RECORDS -->
                <div class="view-panel" id="edu-fee-records-view">
                    <div class="edu-master-card">
                        <div class="edu-master-header"><h2>সকল জমা হওয়া ফি তালিকা (All Fee Records)</h2></div>
                        <div class="edu-table-wrapper">
                            <table class="edu-full-table">
                                <thead>
                                    <tr>
                                        <th>SL</th><th>Date</th><th>Student Name</th><th>Id</th><th>Class</th><th>Month</th>
                                        <th>Category</th><th>Mobile</th><th>Net Due</th><th>Txn Fee</th><th>Total Charge</th>
                                        <th>Net Received</th><th>Gross Payment</th><th>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody id="recordsBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SECTION 3: STUDENT DATA MASTER (UPLOAD) -->
                <div class="view-panel" id="edu-data-master-view">
                    <div class="edu-master-card">
                        <div class="edu-master-header"><h2>শিক্ষার্থী ডাটা মাস্টার (Student Data Master)</h2></div>
                        <div class="edu-upload-box">
                            <p style="margin-bottom:20px; color:#64748b;">প্রথমে নমুনা ফাইলটি ডাউনলোড করুন, ডাটা ইনপুট দিন এবং তারপর আপলোড করুন।</p>
                            <a class="btn-download" onclick="downloadSampleExcel()"><i class="fa-solid fa-download"></i> নমুনা ফাইল ডাউনলোড (Sample Copy)</a>
                            <label class="btn-upload-label" for="excelUpload"><i class="fa-solid fa-file-excel"></i> এক্সেল ফাইল আপলোড করুন (Upload Excel)</label>
                            <input type="file" id="excelUpload" accept=".xlsx, .xls" style="display:none;">
                        </div>
                        <div class="edu-table-wrapper">
                            <h4 style="margin-bottom:15px; color:#34495e;">বর্তমানে আপলোডকৃত শিক্ষার্থী তালিকা:</h4>
                            <table class="edu-full-table">
                                <thead>
                                    <tr><th>Id</th><th>Student Name</th><th>Class</th><th>Mobile</th><th>Month</th><th>Category</th><th>Net Due</th><th>Txn Fee</th></tr>
                                </thead>
                                <tbody id="masterDataBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        wrapper.insertAdjacentHTML('beforeend', html);
    }

    // ৩. এক্সেল প্রসেসিং এবং ফায়ারবেস স্টোরেজ
    let eduMasterData = [];
    let eduFeeRecords = [];

    async function handleExcelUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        showLoader("ফাইল প্রসেস হচ্ছে...");
        const reader = new FileReader();
        reader.onload = async function (evt) {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

            // আপনার চাহিদা অনুযায়ী নতুন সিট আপলোড মানে পুরানো সব ডাটা প্রতিস্থাপন (৩ নং সেকশন)
            eduMasterData = json.map(row => ({
                id: String(row['Id'] || ''),
                name: row['Student Name'] || '',
                class: row['Class'] || '',
                mobile: row['Mobile'] || '',
                month: row['Month'] || '',
                category: row['Category'] || '',
                due: parseFloat(row['Net Due']) || 0,
                txnFee: parseFloat(row['Txn Fee']) || 0
            }));

            await writeToFirebase('erp/eduMasterData', eduMasterData);
            renderMasterTable();
            hideLoader();
            showToast("ডাটা মাস্টার আপডেট হয়েছে!", "success");
        };
        reader.readAsBinaryString(file);
    }

    // ৪. নমুনা এক্সেল ডাউনলোড লজিক
    window.downloadSampleExcel = function() {
        const sample = [{
            "Id": "101", "Student Name": "Abdur Rahman", "Class": "10", "Mobile": "01700000000",
            "Month": "January", "Category": "Monthly Fee", "Net Due": "1000", "Txn Fee": "6"
        }];
        const ws = XLSX.utils.json_to_sheet(sample);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "SampleData");
        XLSX.writeFile(wb, "Edu_Sample_Sheet.xlsx");
    };

    // ৫. ফি এন্ট্রি লজিক (অটো পপুলেশন)
    function setupLogic() {
        const idInp = document.getElementById('fId');
        document.getElementById('fDate').value = new Date().toISOString().split('T')[0];

        idInp.addEventListener('input', function() {
            const val = this.value.trim();
            const found = eduMasterData.find(s => s.id === val);
            
            if(found) {
                document.getElementById('fName').value = found.name;
                document.getElementById('fDue').value = found.due.toFixed(2);
                document.getElementById('fTxn').value = found.txnFee.toFixed(2);
                document.getElementById('fChargeDisp').innerText = found.txnFee.toFixed(2);
            } else {
                document.getElementById('fName').value = "";
                document.getElementById('fDue').value = "0.00";
                document.getElementById('fTxn').value = "0.00";
                document.getElementById('fChargeDisp').innerText = "0.00";
            }
        });

        document.getElementById('feeForm').onsubmit = async function(e) {
            e.preventDefault();
            const id = idInp.value.trim();
            const found = eduMasterData.find(s => s.id === id);
            if(!found) return alert("স্টুডেন্ট আইডি পাওয়া যায়নি!");

            showLoader("সংরক্ষণ করা হচ্ছে...");
            const rec = parseFloat(document.getElementById('fRec').value) || 0;
            const txn = parseFloat(document.getElementById('fTxn').value) || 0;

            const record = {
                sl: eduFeeRecords.length + 1,
                date: document.getElementById('fDate').value,
                studentName: found.name,
                id: found.id,
                class: found.class,
                month: found.month,
                category: found.category,
                mobile: found.mobile,
                netDue: found.due,
                txnFee: txn,
                totalCharge: txn,
                netReceived: rec,
                grossPayment: rec + txn,
                remarks: "-",
                id_permanent: 'EDU-' + Date.now()
            };

            eduFeeRecords.push(record);
            await writeToFirebase('erp/eduFeeRecords', eduFeeRecords);
            
            // ২ নং সেকশনে ডাটা পাঠানো মানে ওটা ফিক্সড থাকবে
            renderRecordsTable();
            this.reset();
            document.getElementById('fDate').value = new Date().toISOString().split('T')[0];
            hideLoader();
            showToast("ফি রেকর্ড সংরক্ষিত হয়েছে!", "success");
        };
    }

    // ৬. রেন্ডার টেবিল ফাংশনসমূহ
    function renderMasterTable() {
        const body = document.getElementById('masterDataBody');
        body.innerHTML = eduMasterData.map(s => `
            <tr><td>${s.id}</td><td>${s.name}</td><td>${s.class}</td><td>${s.mobile}</td><td>${s.month}</td><td>${s.category}</td><td>${s.due.toFixed(2)}</td><td>${s.txnFee.toFixed(2)}</td></tr>
        `).join('');
    }

    function renderRecordsTable() {
        const body = document.getElementById('recordsBody');
        body.innerHTML = eduFeeRecords.slice().reverse().map((r, i) => `
            <tr>
                <td>${eduFeeRecords.length - i}</td><td>${r.date}</td><td>${r.studentName}</td><td>${r.id}</td><td>${r.class}</td><td>${r.month}</td>
                <td>${r.category}</td><td>${r.mobile}</td><td>${r.netDue.toFixed(2)}</td><td>${r.txnFee.toFixed(2)}</td><td>${r.totalCharge.toFixed(2)}</td>
                <td style="font-weight:bold;">${r.netReceived.toFixed(2)}</td><td style="font-weight:bold; color:#2563eb;">${r.grossPayment.toFixed(2)}</td><td>${r.remarks}</td>
            </tr>
        `).join('');
    }

    // ডাটা ইনিশিয়ালাইজেশন
    async function initData() {
        const db = window.getDatabase();
        const { ref, get } = window.firebase_database;
        
        const masterSnap = await get(ref(db, 'erp/eduMasterData'));
        if(masterSnap.exists()) eduMasterData = Object.values(masterSnap.val());
        
        const recordsSnap = await get(ref(db, 'erp/eduFeeRecords'));
        if(recordsSnap.exists()) eduFeeRecords = Object.values(recordsSnap.val());
        
        renderMasterTable();
        renderRecordsTable();
    }

    window.addEventListener('load', () => {
        injectMenu();
        injectPanels();
        setupLogic();
        document.getElementById('excelUpload').addEventListener('change', handleExcelUpload);
        initData();
    });

})();
