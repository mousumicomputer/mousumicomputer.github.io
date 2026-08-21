/**
 * Mousumi Computer ERP - Independent Education Module (Optimized for 1000+ Students)
 * Features: Inline Progress Bar, Live Import Log, Estimated Time Calculation.
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
        
        /* Progress Box Style */
        #progress-container {
            display: none;
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 20px;
            margin: 20px auto;
            max-width: 800px;
            text-align: left;
        }
        .progress-bar-bg { background: #e2e8f0; border-radius: 20px; height: 12px; width: 100%; margin: 10px 0; overflow: hidden; }
        .progress-bar-fill { background: linear-gradient(90deg, #2563eb, #3b82f6); height: 100%; width: 0%; transition: width 0.1s; }
        .import-stats { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; color: #1e293b; }
        
        /* Live Log Window */
        .import-log {
            background: #1e293b;
            color: #10b981;
            padding: 10px;
            border-radius: 5px;
            height: 100px;
            overflow-y: auto;
            font-family: monospace !important;
            font-size: 12px;
            margin-top: 10px;
            line-height: 1.5;
        }

        .edu-upload-area { padding: 40px; text-align: center; border: 2px dashed #cbd5e1; margin: 20px; border-radius: 10px; background: #f8fafc; }
        .edu-btn-blue { background: #2563eb; color: #fff; border: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; cursor: pointer; }
        .edu-table-box { padding: 20px; overflow-x: auto; }
        .edu-data-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 14px !important; }
        .edu-data-table th { background: #f8fafc; color: #475569; padding: 10px; border: 1px solid #e2e8f0; text-align: center; white-space: nowrap; }
        .edu-data-table td { padding: 10px; border: 1px solid #e2e8f0; text-align: center; color: #334155; }
        
        #menu-edu-parent.open .submenu-list { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    function injectSidebarMenu() {
        const menuList = document.querySelector('.menu-list');
        if (!menuList || document.getElementById('menu-edu-parent')) return;
        const html = `<li class="menu-item" id="menu-edu-parent">
            <a onclick="this.parentElement.classList.toggle('open')">
                <span class="menu-link-inner"><i class="fa-solid fa-graduation-cap"></i> <span>শিক্ষা ও ডিজিটাল সেবা</span></span>
                <i class="fa-solid fa-chevron-down chevron-icon" style="font-size: 0.7rem;"></i>
            </a>
            <ul class="submenu-list">
                <li class="submenu-item"><a onclick="switchMainTab('edu-fee-form')"><i class="fa-solid fa-angle-right"></i> <span>ফি এন্ট্রি (Fee Entry)</span></a></li>
                <li class="submenu-item"><a onclick="switchMainTab('edu-fee-records')"><i class="fa-solid fa-angle-right"></i> <span>সকল ফি রেকর্ডস</span></a></li>
                <li class="submenu-item"><a onclick="switchMainTab('edu-master-data')"><i class="fa-solid fa-angle-right"></i> <span>শিক্ষার্থী ডাটা মাস্টার</span></a></li>
            </ul>
        </li>`;
        menuList.insertAdjacentHTML('beforeend', html);
    }

    function injectEduPanels() {
        const main = document.querySelector('.main-wrapper');
        if (!main) return;
        const html = `
            <div id="edu-mod-system">
                <div class="view-panel" id="edu-fee-form-view">
                    <div class="edu-card-main" style="max-width:900px; margin: 0 auto;">
                        <div class="edu-header-dark"><h2>ফি কালেকশন মডিউল (Fee Collection)</h2></div>
                        <form id="eduMainForm">
                            <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; padding:25px;">
                                <div style="display:flex; flex-direction:column;"><label>তারিখ</label><input type="date" id="fDate" style="padding:10px; border:1px solid #ccc; border-radius:5px;" required></div>
                                <div style="display:flex; flex-direction:column;"><label>স্টুডেন্ট আইডি</label><input type="text" id="fId" style="padding:10px; border:1px solid #ccc; border-radius:5px;" placeholder="ID লিখুন" required></div>
                                <div style="display:flex; flex-direction:column;"><label>শিক্ষার্থীর নাম</label><input type="text" id="fName" style="padding:10px; border:1px solid #ccc; border-radius:5px;" readonly></div>
                                <div style="display:flex; flex-direction:column;"><label>বকেয়া</label><input type="text" id="fDue" style="padding:10px; border:1px solid #ccc; border-radius:5px;" readonly value="0.00"></div>
                                <div style="display:flex; flex-direction:column;"><label>ট্রানজেকশন ফি</label><input type="number" id="fTxn" style="padding:10px; border:1px solid #ccc; border-radius:5px;" readonly value="0.00"></div>
                                <div style="display:flex; flex-direction:column;"><label>গৃহীত টাকা</label><input type="number" id="fRec" style="padding:10px; border:1px solid #ccc; border-radius:5px;" placeholder="0.00" required></div>
                            </div>
                            <button type="submit" class="edu-btn-blue" style="float:right; margin:0 25px 25px 0;">সাবমিট করুন</button><div style="clear:both;"></div>
                        </form>
                    </div>
                </div>

                <div class="view-panel" id="edu-fee-records-view">
                    <div class="edu-card-main">
                        <div class="edu-header-dark"><h2>সকল ফি রেকর্ডস</h2></div>
                        <div class="edu-table-box"><table class="edu-data-table"><thead><tr id="theadRecords"></tr></thead><tbody id="tbodyRecords"></tbody></table></div>
                    </div>
                </div>

                <div class="view-panel" id="edu-master-data-view">
                    <div class="edu-card-main">
                        <div class="edu-header-dark"><h2>শিক্ষার্থী ডাটা মাস্টার (Excel Upload)</h2></div>
                        
                        <div class="edu-upload-area" id="upload-box-area">
                            <p>১০০০+ ডাটার জন্য এক্সেল ফাইল আপলোড করুন।</p>
                            <label for="eduExcelInp" class="edu-btn-blue">ফাইল নির্বাচন করুন</label>
                            <input type="file" id="eduExcelInp" accept=".xlsx, .xls" style="display:none;">
                        </div>

                        <!-- 🟢 লাইভ প্রগ্রেস সেকশন -->
                        <div id="progress-container">
                            <div class="import-stats">
                                <span id="progress-status">ফাইল প্রসেস শুরু হচ্ছে...</span>
                                <span id="progress-percent">০%</span>
                            </div>
                            <div class="progress-bar-bg"><div class="progress-bar-fill" id="pb-fill"></div></div>
                            <div style="font-size:12px; color:#64748b; margin-top:5px;">বাকি সময়: <span id="time-left">হিসাব করা হচ্ছে...</span></div>
                            <div class="import-log" id="log-window">সিস্টেম প্রস্তুত...</div>
                        </div>

                        <div class="edu-table-box">
                            <table class="edu-data-table"><thead><tr id="theadMaster"></tr></thead><tbody id="tbodyMaster"></tbody></table>
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

    // 🟢 উন্নত ফাইল আপলোড হ্যান্ডলার (লাইভ প্রগ্রেস সহ)
    async function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const container = document.getElementById('progress-container');
        const uploadBox = document.getElementById('upload-box-area');
        const logWindow = document.getElementById('log-window');
        const pbFill = document.getElementById('pb-fill');
        const statusText = document.getElementById('progress-status');
        const percentText = document.getElementById('progress-percent');
        const timeText = document.getElementById('time-left');

        uploadBox.style.display = 'none';
        container.style.display = 'block';
        logWindow.innerHTML = "ফাইল পড়া হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...";

        const reader = new FileReader();
        reader.onload = async function (evt) {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            
            const total = json.length;
            if (total === 0) return alert("ফাইলটি খালি!");

            const headers = Object.keys(json[0]);
            const standardKeys = ["STD ID", "Student Name", "Class", "Mobile", "Month Due", "Category", "Due Amount"];
            extraColumns = headers.filter(h => !standardKeys.includes(h));

            masterList = [];
            let startTime = Date.now();

            // লাইভ প্রসেসিং লুপ
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
                    extras: extraColumns.reduce((obj, key) => ({ ...obj, [key]: row[key] || "" }), {})
                };
                masterList.push(student);

                // প্রতি ১০টি ডাটা পর পর UI আপডেট (পারফরম্যান্স এর জন্য)
                if (i % 10 === 0 || i === total - 1) {
                    const percent = Math.round(((i + 1) / total) * 100);
                    pbFill.style.width = percent + "%";
                    percentText.innerText = percent + "%";
                    statusText.innerText = `ডাটা ইনপুট হচ্ছে: ${i + 1} / ${total}`;
                    
                    const logMsg = `<div>[${new Date().toLocaleTimeString()}] প্রসেস হচ্ছে: ${student.name} (ID: ${student.id})</div>`;
                    logWindow.innerHTML = logMsg + logWindow.innerHTML;
                    
                    // সময় হিসাব
                    const elapsed = (Date.now() - startTime) / 1000;
                    const remaining = Math.round((elapsed / (i + 1)) * (total - (i + 1)));
                    timeText.innerText = remaining + " সেকেন্ড বাকি";
                    
                    // ব্রাউজারকে UI আপডেট করার সুযোগ দেওয়া
                    await new Promise(res => setTimeout(res, 1));
                }
            }

            statusText.innerText = "ফায়ারবেসে সেভ হচ্ছে...";
            await writeToFirebase('erp/eduMasterData', { data: masterList, extras: extraColumns });
            
            renderMasterUI();
            logWindow.innerHTML = `<div style="color:#fff">✅ সফলভাবে ${total} জন স্টুডেন্টের ডাটা আপলোড হয়েছে।</div>` + logWindow.innerHTML;
            statusText.innerText = "আপলোড সম্পন্ন!";
            
            setTimeout(() => {
                container.style.display = 'none';
                uploadBox.style.display = 'block';
            }, 3000);
        };
        reader.readAsBinaryString(file);
    }

    // টেবিল রেন্ডারিং এবং লজিক কোড (আগের মতোই)
    function initEduLogic() {
        const idInp = document.getElementById('fId');
        idInp.addEventListener('input', function() {
            const student = masterList.find(s => s.id === this.value.trim());
            if(student) {
                document.getElementById('fName').value = student.name;
                document.getElementById('fDue').value = student.due.toFixed(2);
            }
        });
    }

    function renderMasterUI() {
        const thead = document.getElementById('theadMaster');
        const tbody = document.getElementById('tbodyMaster');
        thead.innerHTML = `<tr><th>STD ID</th><th>Student Name</th><th>Class</th><th>Due Amount</th></tr>`;
        tbody.innerHTML = masterList.slice(0, 10).map(s => `<tr><td>${s.id}</td><td>${s.name}</td><td>${s.class}</td><td>${s.due.toFixed(2)}</td></tr>`).join('');
    }

    window.addEventListener('load', () => {
        injectSidebarMenu();
        injectEduPanels();
        initEduLogic();
        document.getElementById('eduExcelInp').addEventListener('change', handleFileUpload);
    });
})();
