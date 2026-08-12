/* 
   Mousumi Computer - Report Center Upgrade Module
   এই ফাইলটি মূল index.html এর রিপোর্ট সেকশনকে আপডেট করবে।
*/

const upgradeReportSection = () => {
    const reportContainer = document.getElementById('cust-reports-section');
    if (!reportContainer) return;

    // নতুন ডিজাইনের HTML এবং CSS
    reportContainer.innerHTML = `
    <style>
        .report-card-new { background: #ffffff; width: 100%; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; font-family: 'Inter', sans-serif; }
        .brand-header-new { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .brand-title-new h2 { color: #0f172a; font-size: 18px; font-weight: 700; margin:0; }
        .date-presets-new { display: flex; gap: 5px; }
        .preset-btn-new { background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 12px; font-size: 11px; font-weight: 600; border-radius: 6px; cursor: pointer; }
        .preset-btn-new.active { background: #2563eb; color: white; border-color: #2563eb; }
        .grid-row-new { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .form-group-new { display: flex; flex-direction: column; gap: 5px; }
        .form-group-new label { font-weight: 600; color: #475569; font-size: 12px; }
        .form-control-new { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none; }
        .btn-group-new { display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid #f1f5f9; padding-top: 15px; }
        .btn-new { padding: 10px 20px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 7px; }
        .btn-download-new { background-color: #2563eb; color: white; }
    </style>

    <div class="report-card-new">
        <div class="brand-header-new">
            <div class="brand-title-new">
                <h2><i class="fa-solid fa-file-invoice" style="color: #2563eb;"></i> Report Download Center</h2>
            </div>
            <div class="date-presets-new">
                <button type="button" class="preset-btn-new active" id="btn-today">Today</button>
                <button type="button" class="preset-btn-new" id="btn-week">Week</button>
                <button type="button" class="preset-btn-new" id="btn-month">Month</button>
            </div>
        </div>

        <div class="grid-row-new">
            <div class="form-group-new">
                <label>Date Range</label>
                <div style="display:flex; align-items:center; gap:5px;">
                    <input type="date" id="repStartDate" class="form-control-new">
                    <span style="font-size:11px; color:#94a3b8;">to</span>
                    <input type="date" id="repEndDate" class="form-control-new">
                </div>
            </div>
            <div class="form-group-new">
                <label>Report Type</label>
                <select id="repType" class="form-control-new">
                    <option value="due">Outstanding Due Report</option>
                    <option value="statement">Individual Customer Statement</option>
                    <option value="closing">Daily Closing History</option>
                </select>
            </div>
            <div class="form-group-new">
                <label>Format</label>
                <select id="repFormat" class="form-control-new">
                    <option value="excel">Excel Spreadsheet (.xlsx)</option>
                    <option value="pdf">PDF Document (.pdf)</option>
                </select>
            </div>
        </div>

        <div class="btn-group-new">
            <button type="button" class="btn-new btn-download-new" id="btn-main-download">
                <i class="fa-solid fa-download"></i> Generate & Download
            </button>
        </div>
    </div>
    `;

    // ডেট ফিল্টার লজিক
    const setDates = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        document.getElementById('repStartDate').value = start.toISOString().split('T')[0];
        document.getElementById('repEndDate').value = end.toISOString().split('T')[0];
    };

    setDates(0); // ডিফল্ট আজকের তারিখ

    document.getElementById('btn-today').onclick = () => setDates(0);
    document.getElementById('btn-week').onclick = () => setDates(7);
    document.getElementById('btn-month').onclick = () => setDates(30);

    // ডাউনলোড বাটন লজিক (আপনার মূল অ্যাপের ফাংশনের সাথে কানেক্ট করা)
    document.getElementById('btn-main-download').onclick = () => {
        const type = document.getElementById('repType').value;
        
        if(type === 'due') {
            if(typeof window.exportOutstandingDueExcel === 'function') {
                window.exportOutstandingDueExcel();
            } else {
                alert("Export function not found!");
            }
        } else if(type === 'statement') {
            alert("Please go to Customer Ledger to export individual statements.");
        } else {
            alert("Generating " + type + " report...");
        }
    };
};

// যখন পেজ লোড হবে তখন এটি রান করবে
setTimeout(upgradeReportSection, 1000);
