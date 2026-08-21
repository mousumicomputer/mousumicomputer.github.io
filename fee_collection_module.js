/**
 * Mousumi Computer ERP - Education & Digital Services Module (COMPLETE VERSION)
 * 1. Entry Form (Original Design)
 * 2. Permanent Records Table (Dynamic Columns)
 * 3. Upload Center (Live Progress Bar & Log - Non-blocking)
 */

(function () {
    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');

        /* Force Kalpurush Font */
        #edu-mod-wrapper, #edu-mod-wrapper * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }

        /* --- SECTION STYLES --- */
        .edu-card { background: #fff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); margin-bottom: 25px; border: 1px solid #e1e4e8; overflow: hidden; }
        .edu-header-dark { background: #34495e; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .edu-header-dark h2 { font-size: 20px !important; margin: 0; font-weight: 600; }
        
        /* Section 1 Form Grid */
        .edu-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 25px; }
        .edu-form-group { display: flex; flex-direction: column; }
        .edu-form-group label { font-size: 15px; font-weight: 600; color: #444; margin-bottom: 6px; }
        .edu-control { padding: 10px 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 16px; outline: none; }
        .edu-control:disabled { background: #f8f9fa; color: #666; }
        .edu-btn-submit { background: #2563eb; color: #fff; border: none; padding: 12px 40px; border-radius: 5px; font-weight: bold; cursor: pointer; float: right; margin: 0 25px 25px 0; }

        /* Tables & Summary Card */
        .edu-summary-box { background: #fff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 15px 20px; margin-bottom: 20px; border-left: 4px solid #2563eb; display: inline-block; min-width: 280px; }
        .edu-table-box { padding: 20px; overflow-x: auto; }
        .edu-main-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 14px !important; }
        .edu-main-table th { background: #f8fafc; color: #475569; padding: 10px; border: 1px solid #e2e8f0; text-align: center; }
        .edu-main-table td { padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #334155; }

        /* Smart Upload UI */
        .upload-area { padding: 40px; text-align: center; border: 2px dashed #cbd5e1; margin: 20px; border-radius: 10px; background: #f8fafc; }
        #progress-box { display: none; background: #f1f5f9; border-radius: 10px; padding: 20px; margin: 20px; text-align: left; }
        .pb-bg { background: #e2e8f0; border-radius: 20px; height: 12px; width: 100%; margin: 10px 0; overflow: hidden; }
        .pb-fill { background: linear-gradient(90deg, #2563eb, #3b82f6); height: 100%; width: 0%; transition: width 0.1s; }
        .log-window { background: #1e293b; color: #10b981; padding: 10px; border-radius: 5px; height: 100px; overflow-y: auto; font-family: monospace; font-size: 12px; margin-top: 10px; line-height: 1.5; }

        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    // ১. মেনু ইনজেকশন
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
                    <li class="submenu-item"><a onclick="switchMainTab('edu-master-data')"><i class="fa-solid fa-angle-right"></i> <span>শিক্ষার্থী ডাটা মাস্টার</span></a></li>
                </ul>
            </li>
        `;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    // ২. প্যানেল ইনজেকশন
    function injectPanels() {
        const main = document.querySelector('.main-wrapper');
        if (!main) return;
        const html = `
            <div id="edu-mod-wrapper">
                <!-- SECTION 1: FEE ENTRY FORM -->
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-card" style="max-width:900px; margin: 0 auto;">
                        <div class="edu-header-dark"><h2>ফি কালেকশন মডিউল (Fee Collection)</h2><span style="font-family:Times New Roman; opacity:0.7;">ERP v2.4</span></div>
                        <form id="feeForm">
                            <div class="edu-form-grid">
                                <div class="edu-form-group"><label>তারিখ (Date)</label><input type="date" id="fDate" class="edu-control" required></div>
                                <div class="edu-form-group"><label>স্টুডেন্ট আইডি (ID)</label><input type="text" id="fId" class="edu-control" placeholder="আইডি লিখুন" required></div>
                                <div class="edu-form-group"><label>শিক্ষার্থীর নাম (Student Name)</label><input type="text" id="fName" class="edu-control" readonly></div>
                                <div class="edu-form-group"><label>বকেয়া (Net Due)</label><input type="text" id="fDue" class="edu-control" readonly value="0.00"></div>
                                <div class="edu-form-group">
                                    <label>ট্রানজেকশন ফি (Txn Fee)</label><input type="number" id="fTxn" class="edu-control" readonly value="0.00">
                                    <span style="font-size:13px; color:#2563eb; font-weight:bold; margin-top:5px;">মোট চার্জ: ৳ <span id="fChargeDisp">0.00</span></span>
                                </div>
                                <div class="edu-form-group"><label>গৃহীত মোট টাকা (Net Received)</label><input type="number" id="fRec" class="edu-control" placeholder="0.00" required></div>
                                <div class="edu-form-group"><label>ছাড় (Discount)</label><input type="number" id="fDisc" class="edu-control" value="0.00"></div>
                            </div>
                            <button type="submit" class="edu-btn-submit">সাবমিট করুন</button><div style="clear:both;"></div>
                        </form>
                    </div>
                </div>

                <!-- SECTION 2: ALL FEE RECORDS -->
                <div class="view-panel" id="edu-fee-records-view">
                    <div class="edu-summary-box"><span>সর্বমোট এন্ট্রি টাকা (Total Received):</span><strong>৳ <span id="totalFeeSum">0.00</span></strong></div>
                    <div class="edu-card">
                        <div class="edu-header-dark"><h2>সকল জমা হওয়া ফি তালিকা (All Fee Records)</h2></div>
                        <div class="edu-table-box">
                            <table class="edu-main-table">
                                <thead id="theadRecords">
                                    <tr><th>SL</th><th>Date</th><th>Student Name</th><th>Id</th><th>Class</th><th>Month</th><th>Category</th><th>Mobile</th><th>Net Due</th><th>Txn Fee</th><th>Total Charge</th><th>Net Received</th><th>Gross Payment</th><th>Remarks</th></tr>
                                </thead>
                                <tbody id="tbodyRecords"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- SECTION 3: DATA MASTER -->
                <div class="view-panel" id="edu-master-data-view">
                    <div class="edu-card">
                        <div class="edu-header-dark"><h2>শিক্ষার্থী ডাটা মাস্টার (Student Data Master)</h2></div>
                        <div class="upload-area" id="up-area">
                            <p style="margin-bottom:20px;">১০০০+ ডাটার জন্য এক্সেল আপলোড করুন।</p>
                            <a href="#" onclick="exportEduSample()" style="background:#10b981; color:#fff; padding:10px 20px; border-radius:5px; text-decoration:none; font-weight:bold; margin-right:10px;">নমুনা ফাইল ডাউনলোড</a>
                            <label for="excelInp" style="background:#2563eb; color:#fff; padding:10px 25px; border-radius:5px; cursor:pointer; font-weight:bold;">ফাইল আপলোড করুন</label>
                            <input type="file" id="excelInp" accept=".xlsx, .xls" style="display:none;">
                        </div>
                        <div id="progress-box">
                            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:14px;"><span id="ps-text">প্রসেস হচ্ছে...</span><span id="ps-percent">০%</span></div>
                            <div class="pb-bg"><div class="pb-fill" id="pb-fill"></div></div>
                            <div style="font-size:12px; color:#64748b;">বাকি সময়: <span id="time-left">...</span></div>
                            <div class="log-window" id="log-win">প্রস্তুত...</div>
                        </div>
                        <div class="edu-table-box">
                            <h4 style="margin-bottom:10px;">মাস্টার ডাটা তালিকা:</h4>
                            <table class="edu-main-table">
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

    // 🟢 স্মার্ট ফাইল আপলোড (লাইভ প্রগ্রেস)
    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const upArea = document.getElementById('up-area');
        const pBox = document.getElementById('progress-box');
        const logWin = document.getElementById('log-win');
        const pb = document.getElementById('pb-fill');
        const stText = document.getElementById('ps-text');
        const ptText = document.getElementById('ps-percent');
        const timeText = document.getElementById('time-left');

        upArea.style.display = 'none';
        pBox.style.display = 'block';
        logWin.innerHTML = "ফাইল লোড হচ্ছে...";

        const reader = new FileReader();
        reader.onload = async function (evt) {
            const workbook = XLSX.read(evt.target.result, { type: 'binary' });
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            const total = json.length;

            if(total > 0) {
                const headers = Object.keys(json[0]);
                const standardKeys = ["STD ID", "Student Name", "Class", "Mobile", "Month Due", "Category", "Due Amount", "Txn Fee"];
                extraColumns = headers.filter(h => !standardKeys.includes(h));

                masterList = [];
                let startTime = Date.now();

                for (let i = 0; i < total; i++) {
                    const row = json[i];
                    const student = {
                        id: String(row["STD ID"] || ""),
                        name: row["Student Name"] || "",
                        class: row["Class"] || "",
                        mobile: row["Mobile"] || "",
                        month: row["Month Due"] || "",
                        category: row["Category"] || "",
                        due: parseFloat(row["Due Amount"]) || 0,
                        txnFee: parseFloat(row["Txn Fee"]) || 0,
                        extras: extraColumns.reduce((obj, key) => ({ ...obj, [key]: row[key] || "" }), {})
                    };
                    masterList.push(student);

                    if (i % 10 === 0 || i === total - 1) {
                        const pc = Math.round(((i + 1) / total) * 100);
                        pb.style.width = pc + "%";
                        ptText.innerText = pc + "%";
                        stText.innerText = `প্রসেস হচ্ছে: ${i + 1} / ${total}`;
                        logWin.innerHTML = `<div>[Log] আপলোড হচ্ছে: ${student.name}</div>` + logWin.innerHTML;
                        const elapsed = (Date.now() - startTime) / 1000;
                        const remaining = Math.round((elapsed / (i + 1)) * (total - (i + 1)));
                        timeText.innerText = remaining + " সেকেন্ড";
                        await new Promise(r => setTimeout(r, 1));
                    }
                }

                await writeToFirebase('erp/eduMasterData', { data: masterList, extras: extraColumns });
                renderMasterTable();
                showToast("মাস্টার ডাটা সফলভাবে আপডেট হয়েছে!", "success");
                setTimeout(() => { pBox.style.display = 'none'; upArea.style.display = 'block'; }, 2000);
            }
        };
        reader.readAsBinaryString(file);
    }

    // লজিক এবং রেন্ডারিং
    function initLogic() {
        const idInp = document.getElementById('fId');
        document.getElementById('fDate').value = new Date().toISOString().split('T')[0];

        idInp.addEventListener('input', function() {
            const student = masterList.find(s => s.id === this.value.trim());
            if(student) {
                document.getElementById('fName').value = student.name;
                document.getElementById('fDue').value = student.due.toFixed(2);
                document.getElementById('fTxn').value = student.txnFee.toFixed(2);
                document.getElementById('fChargeDisp').innerText = student.txnFee.toFixed(2);
            } else {
                document.getElementById('fName').value = ""; document.getElementById('fDue').value = "0.00";
                document.getElementById('fTxn').value = "0.00"; document.getElementById('fChargeDisp').innerText = "0.00";
            }
        });

        document.getElementById('feeForm').onsubmit = async function(e) {
            e.preventDefault();
            const id = idInp.value.trim();
            const student = masterList.find(s => s.id === id);
            if(!student) return alert("আইডি ভুল!");

            showLoader("সংরক্ষণ...");
            const rec = parseFloat(document.getElementById('fRec').value) || 0;
            const txn = parseFloat(document.getElementById('fTxn').value) || 0;

            const entry = {
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
                netReceived: rec,
                grossPayment: rec + txn,
                extras: student.extras,
                remarks: "-",
                id_perm: 'EDU-' + Date.now()
            };

            feeRecords.push(entry);
            await writeToFirebase('erp/eduFeeRecords', feeRecords);
            renderRecordsTable();
            this.reset();
            document.getElementById('fDate').value = new Date().toISOString().split('T')[0];
            hideLoader();
            showToast("সংরক্ষণ সফল!", "success");
        };
    }

    function renderMasterTable() {
        const h = document.getElementById('theadMaster');
        const b = document.getElementById('tbodyMaster');
        h.innerHTML = `<tr><th>Id</th><th>Name</th><th>Class</th><th>Mobile</th>${extraColumns.map(c => `<th>${c}</th>`).join('')}</tr>`;
        b.innerHTML = masterList.slice(0, 10).map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.class}</td><td>${s.mobile}</td>${extraColumns.map(c => `<td>${s.extras[c] || ""}</td>`).join('')}</tr>`).join('');
    }

    function renderRecordsTable() {
        const h = document.getElementById('theadRecords');
        const b = document.getElementById('tbodyRecords');
        let htmlH = `<tr><th>SL</th><th>Date</th><th>Name</th><th>Id</th><th>Class</th><th>Month</th><th>Category</th><th>Mobile</th><th>Due</th><th>Txn</th><th>Total</th><th>Rec</th><th>Gross</th>`;
        extraColumns.forEach(c => htmlH += `<th>${c}</th>`);
        htmlH += `<th>Remarks</th></tr>`;
        h.innerHTML = htmlH;

        let totalRec = 0;
        b.innerHTML = feeRecords.slice().reverse().map((r, i) => {
            totalRec += (parseFloat(r.netReceived) || 0);
            let row = `<tr><td>${feeRecords.length - i}</td><td>${r.date}</td><td>${r.studentName}</td><td>${r.id}</td><td>${r.class}</td><td>${r.month}</td><td>${r.category}</td><td>${r.mobile}</td><td>${r.netDue.toFixed(2)}</td><td>${r.txnFee.toFixed(2)}</td><td>${r.totalCharge.toFixed(2)}</td><td>${r.netReceived.toFixed(2)}</td><td style="color:#2563eb; font-weight:bold;">${r.grossPayment.toFixed(2)}</td>`;
            extraColumns.forEach(c => row += `<td>${r.extras ? (r.extras[c] || "") : ""}</td>`);
            row += `<td>${r.remarks}</td></tr>`;
            return row;
        }).join('');
        document.getElementById('totalFeeSum').innerText = totalRec.toLocaleString('en-US', {minimumFractionDigits:2});
    }

    window.exportEduSample = function() {
        const sample = [{ "Class": "Nursery", "STD ID": "1001", "Student Name": "Rahim", "Mobile": "017...", "Month Due": "1", "Category": "Civil", "Due Amount": "600", "Txn Fee": "6", "Fathers name": "Md Karim" }];
        const ws = XLSX.utils.json_to_sheet(sample);
        const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "MasterData");
        XLSX.writeFile(wb, "Student_Sample.xlsx");
    };

    async function initData() {
        const db = window.getDatabase();
        const { ref, get } = window.firebase_database;
        const mSnap = await get(ref(db, 'erp/eduMasterData'));
        if(mSnap.exists()) { masterList = mSnap.val().data || []; extraColumns = mSnap.val().extras || []; }
        const rSnap = await get(ref(db, 'erp/eduFeeRecords'));
        if(rSnap.exists()) feeRecords = Object.values(rSnap.val());
        renderMasterTable(); renderRecordsTable();
    }

    window.addEventListener('load', () => {
        injectMenu();
        injectPanels();
        initLogic();
        document.getElementById('excelInp').addEventListener('change', handleFileUpload);
        initData();
    });
})();
