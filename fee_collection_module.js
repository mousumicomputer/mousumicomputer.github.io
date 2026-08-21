/**
 * Mousumi Computer ERP - Independent Education Module (Final Version)
 * Feature: Exact Excel Header Mapping based on user provided image.
 */

(function () {
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        #edu-mod-system, #edu-mod-system * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }

        .edu-card-main { background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px; border: 1px solid #e1e4e8; overflow: hidden; }
        .edu-header-dark { background: #34495e; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .edu-header-dark h2 { font-size: 20px !important; margin: 0; }
        
        .edu-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 25px; }
        .edu-form-group { display: flex; flex-direction: column; }
        .edu-form-group label { font-size: 15px; font-weight: 600; color: #444; margin-bottom: 6px; }
        .edu-input-field { padding: 10px 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; outline: none; }
        .edu-btn-blue { background: #2563eb; color: #fff; border: none; padding: 12px 40px; border-radius: 5px; font-weight: bold; cursor: pointer; float: right; margin: 0 25px 25px 0; }

        .edu-table-box { padding: 20px; overflow-x: auto; }
        .edu-data-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 14px !important; }
        .edu-data-table th { background: #f8fafc; color: #475569; padding: 10px; border: 1px solid #e2e8f0; text-align: center; white-space: nowrap; }
        .edu-data-table td { padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #334155; }

        .edu-upload-area { padding: 40px; text-align: center; border: 2px dashed #cbd5e1; margin: 20px; border-radius: 10px; background: #f8fafc; }
        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    function injectSidebarMenu() {
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
                    <li class="submenu-item"><a onclick="switchMainTab('edu-master-data')"><i class="fa-solid fa-angle-right"></i> <span>শিক্ষার্থী ডাটা মাস্টার</span></a></li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    function injectEduPanels() {
        const main = document.querySelector('.main-wrapper');
        if (!main) return;

        const html = `
            <div id="edu-mod-system">
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-card-main" style="max-width:900px; margin: 0 auto;">
                        <div class="edu-header-dark"><h2>ফি কালেকশন মডিউল (Fee Collection)</h2><span style="font-family:serif; opacity:0.7;">ERP v2.4</span></div>
                        <form id="eduMainForm">
                            <div class="edu-form-grid">
                                <div class="edu-form-group"><label>তারিখ (Date)</label><input type="date" id="fDate" class="edu-input-field" required></div>
                                <div class="edu-form-group"><label>স্টুডেন্ট আইডি (ID)</label><input type="text" id="fId" class="edu-input-field" placeholder="আইডি লিখুন" required></div>
                                <div class="edu-form-group"><label>শিক্ষার্থীর নাম (Student Name)</label><input type="text" id="fName" class="edu-input-field" readonly></div>
                                <div class="edu-form-group"><label>বকেয়া (Net Due)</label><input type="text" id="fDue" class="edu-input-field" readonly value="0.00"></div>
                                <div class="edu-form-group"><label>ট্রানজেকশন ফি (Txn Fee)</label><input type="number" id="fTxn" class="edu-input-field" value="6.00"><span style="font-size:13px; color:#2563eb; font-weight:bold; margin-top:5px;">মোট চার্জ: ৳ <span id="fChargeDisp">6.00</span></span></div>
                                <div class="edu-form-group"><label>গৃহীত মোট টাকা (Net Received)</label><input type="number" id="fRec" class="edu-input-field" placeholder="0.00" required></div>
                                <div class="edu-form-group"><label>ছাড় (Discount)</label><input type="number" id="fDisc" class="edu-input-field" value="0.00"></div>
                            </div>
                            <button type="submit" class="edu-btn-blue">সাবমিট করুন</button><div style="clear:both;"></div>
                        </form>
                    </div>
                </div>

                <div class="view-panel" id="edu-fee-records-view">
                    <div class="edu-card-main">
                        <div class="edu-header-dark"><h2>সকল জমা হওয়া ফি তালিকা (All Fee Records)</h2></div>
                        <div class="edu-table-box">
                            <table class="edu-data-table" id="tableRecords">
                                <thead id="theadRecords">
                                    <tr>
                                        <th>SL</th><th>Date</th><th>Student Name</th><th>Id</th><th>Class</th><th>Month</th>
                                        <th>Category</th><th>Mobile</th><th>Net Due</th><th>Txn Fee</th><th>Total Charge</th>
                                        <th>Net Received</th><th>Gross Payment</th><th id="thRemarks">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody id="tbodyRecords"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div class="view-panel" id="edu-master-data-view">
                    <div class="edu-card-main">
                        <div class="edu-header-dark"><h2>শিক্ষার্থী ডাটা মাস্টার (Student Data Master)</h2></div>
                        <div class="edu-upload-area">
                            <p style="margin-bottom:20px; color:#64748b;">আপনার পাঠানো ছবির ফরম্যাট অনুযায়ী এক্সেল আপলোড করুন।</p>
                            <a href="#" onclick="exportEduSample()" style="background:#10b981; color:#fff; padding:10px 20px; border-radius:5px; text-decoration:none; font-weight:bold; margin-right:10px;">নমুনা ফাইল ডাউনলোড</a>
                            <label for="eduExcelInp" style="background:#2563eb; color:#fff; padding:10px 25px; border-radius:5px; cursor:pointer; font-weight:bold;">ফাইল আপলোড করুন</label>
                            <input type="file" id="eduExcelInp" accept=".xlsx, .xls" style="display:none;">
                        </div>
                        <div class="edu-table-box">
                            <h4 style="margin-bottom:15px;">মাস্টার ডাটা তালিকা:</h4>
                            <table class="edu-data-table">
                                <thead id="theadMaster"></thead>
                                <tbody id="tbodyMaster"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        main.insertAdjacentHTML('beforeend', html);
    }

    let masterList = [];
    let feeRecords = [];
    let extraColumns = [];

    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        showLoader("ফাইল প্রসেস হচ্ছে...");
        const reader = new FileReader();
        reader.onload = async function (evt) {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet);

            if (json.length > 0) {
                const headers = Object.keys(json[0]);
                // আপনার ছবির হেডার ম্যাপিং
                const standardKeys = ["STD ID", "Student Name", "Class", "Mobile", "Month Due", "Category", "Due Amount"];
                extraColumns = headers.filter(h => !standardKeys.includes(h));

                masterList = json.map(row => ({
                    id: String(row["STD ID"] || ""),
                    name: row["Student Name"] || "",
                    class: row["Class"] || "",
                    mobile: row["Mobile"] || "",
                    month: row["Month Due"] || "",
                    category: row["Category"] || "",
                    due: parseFloat(row["Due Amount"]) || 0,
                    extras: extraColumns.reduce((obj, key) => ({ ...obj, [key]: row[key] || "" }), {})
                }));

                await writeToFirebase('erp/eduMasterData', { data: masterList, extras: extraColumns });
                renderMasterUI();
                hideLoader();
                showToast("মাস্টার ডাটা সফলভাবে আপলোড হয়েছে!", "success");
            }
        };
        reader.readAsBinaryString(file);
    }

    function initEduLogic() {
        const idInput = document.getElementById('fId');
        document.getElementById('fDate').value = new Date().toISOString().split('T')[0];

        idInput.addEventListener('input', function() {
            const val = this.value.trim();
            const student = masterList.find(s => s.id === val);
            if(student) {
                document.getElementById('fName').value = student.name;
                document.getElementById('fDue').value = student.due.toFixed(2);
            } else {
                document.getElementById('fName').value = "";
                document.getElementById('fDue').value = "0.00";
            }
        });

        document.getElementById('fTxn').oninput = function() {
            document.getElementById('fChargeDisp').innerText = (parseFloat(this.value) || 0).toFixed(2);
        };

        document.getElementById('eduMainForm').onsubmit = async function(e) {
            e.preventDefault();
            const id = idInput.value.trim();
            const student = masterList.find(s => s.id === id);
            if(!student) return alert("স্টুডেন্ট আইডি পাওয়া যায়নি!");

            showLoader("সংরক্ষণ করা হচ্ছে...");
            const received = parseFloat(document.getElementById('fRec').value) || 0;
            const txn = parseFloat(document.getElementById('fTxn').value) || 0;
            
            const newRecord = {
                date: document.getElementById('fDate').value,
                studentName: student.name,
                id: student.id,
                class: student.class,
                month: student.month,
                category: student.category,
                mobile: student.mobile,
                netDue: student.due,
                txnFee: txn,
                totalCharge: txn,
                netReceived: received,
                grossPayment: received + txn,
                extras: student.extras,
                remarks: "-",
                timestamp: Date.now()
            };

            feeRecords.push(newRecord);
            await writeToFirebase('erp/eduFeeRecords', feeRecords);
            renderRecordsUI();
            this.reset();
            document.getElementById('fDate').value = new Date().toISOString().split('T')[0];
            hideLoader();
            showToast("ফি রেকর্ড সংরক্ষিত হয়েছে!", "success");
        };
    }

    function renderRecordsUI() {
        const thead = document.getElementById('theadRecords');
        const tbody = document.getElementById('tbodyRecords');
        if(!thead || !tbody) return;

        let headerHtml = `<tr><th>SL</th><th>Date</th><th>Student Name</th><th>Id</th><th>Class</th><th>Month</th><th>Category</th><th>Mobile</th><th>Net Due</th><th>Txn Fee</th><th>Total Charge</th><th>Net Received</th><th>Gross Payment</th>`;
        extraColumns.forEach(col => { headerHtml += `<th>${col}</th>`; });
        headerHtml += `<th>Remarks</th></tr>`;
        thead.innerHTML = headerHtml;

        tbody.innerHTML = feeRecords.slice().reverse().map((r, i) => {
            let rowHtml = `<tr><td>${feeRecords.length - i}</td><td>${r.date}</td><td>${r.studentName}</td><td>${r.id}</td><td>${r.class}</td><td>${r.month}</td><td>${r.category}</td><td>${r.mobile}</td><td>${r.netDue.toFixed(2)}</td><td>${(r.txnFee || 0).toFixed(2)}</td><td>${(r.totalCharge || 0).toFixed(2)}</td><td style="font-weight:bold;">${r.netReceived.toFixed(2)}</td><td style="font-weight:bold; color:#2563eb;">${r.grossPayment.toFixed(2)}</td>`;
            extraColumns.forEach(col => { rowHtml += `<td>${r.extras ? (r.extras[col] || "") : ""}</td>`; });
            rowHtml += `<td>${r.remarks}</td></tr>`;
            return rowHtml;
        }).join('');
    }

    function renderMasterUI() {
        const thead = document.getElementById('theadMaster');
        const tbody = document.getElementById('tbodyMaster');
        let hHtml = `<tr><th>STD ID</th><th>Student Name</th><th>Class</th><th>Mobile</th><th>Month Due</th><th>Category</th><th>Due Amount</th>`;
        extraColumns.forEach(col => { hHtml += `<th>${col}</th>`; });
        hHtml += `</tr>`;
        thead.innerHTML = hHtml;

        tbody.innerHTML = masterList.map(s => {
            let rHtml = `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.class}</td><td>${s.mobile}</td><td>${s.month}</td><td>${s.category}</td><td>${s.due.toFixed(2)}</td>`;
            extraColumns.forEach(col => { rHtml += `<td>${s.extras[col] || ""}</td>`; });
            rHtml += `</tr>`;
            return rHtml;
        }).join('');
    }

    // আপনার দেওয়া ছবির কলাম অনুযায়ী স্যাম্পল ডাটা
    window.exportEduSample = function() {
        const sample = [{
            "Class": "Nursery",
            "Section": "Dhorola",
            "STD ID": "1400626",
            "Student Name": "MOST NAFISA KHANDOKER",
            "Category": "Army",
            "Month Due": "1",
            "Due items": "Tuition Fee (August-2026)",
            "Due Amount": "600",
            "Mobile": "01774258066",
            "Fathers name": "MD NABIUL",
            "Fathers Mobile": "01774258066",
            "Mothers Name": "MST DISA KHAN",
            "Mothers Mobile": "01748808957"
        }];
        const ws = XLSX.utils.json_to_sheet(sample);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "MasterData");
        XLSX.writeFile(wb, "Student_Data_Sample.xlsx");
    };

    async function initEduData() {
        const db = window.getDatabase();
        const { ref, get } = window.firebase_database;
        const masterSnap = await get(ref(db, 'erp/eduMasterData'));
        if(masterSnap.exists()){
            const d = masterSnap.val();
            masterList = d.data || [];
            extraColumns = d.extras || [];
        }
        const recordsSnap = await get(ref(db, 'erp/eduFeeRecords'));
        if(recordsSnap.exists()) feeRecords = Object.values(recordsSnap.val());
        renderMasterUI();
        renderRecordsUI();
    }

    window.addEventListener('load', () => {
        injectSidebarMenu();
        injectEduPanels();
        initEduLogic();
        document.getElementById('eduExcelInp').addEventListener('change', handleFileUpload);
        initEduData();
    });
})();
