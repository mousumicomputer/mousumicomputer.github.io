/**
 * Mousumi Computer - Unified Report & PDF Module
 * Features: Modern UI, Date Presets, Bengali PDF (Noto Serif Layout)
 */

(function() {
    // ১. সংখ্যা ও টাকাকে বাংলা ফরম্যাটে রূপান্তর করার ফাংশন
    const toBn = (num) => {
        if (num === undefined || num === null) return "০.০০";
        let formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return formatted.replace(/\d/g, d => digits[d]);
    };

    // ২. বার এবং মাসের নাম বাংলা করা
    const getBnDateParts = (dateObj) => {
        const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        return {
            day: days[dateObj.getDay()],
            date: toBn(dateObj.getDate()).split('.')[0],
            month: months[dateObj.getMonth()],
            year: toBn(dateObj.getFullYear()).split('.')[0]
        };
    };

    // ৩. পিডিএফ জেনারেটর ফাংশন (আপনার টেমপ্লেট অনুযায়ী)
    const generateMousumiPDF = (reportData, startDate, endDate) => {
        const startParts = getBnDateParts(new Date(startDate));
        const endParts = getBnDateParts(new Date(endDate));
        
        let tableRows = '';
        let totalAmount = 0;
        let totalBalance = 0;

        reportData.forEach((t, index) => {
            const amount = parseFloat(t.debit) || parseFloat(t.credit) || 0;
            const type = t.debit > 0 ? "বাকী দিলাম" : "বাকী পেলাম";
            totalAmount += amount;
            totalBalance = t.runningBalance || 0;

            tableRows += `
                <tr>
                    <td style="text-align: center;">${toBn(index + 1).split('.')[0]}।</td>
                    <td style="text-align: center;">${t.time || '--'}</td>
                    <td>${t.customerName}</td>
                    <td style="text-align: center;">${type}</td>
                    <td style="text-align: right;">${toBn(amount)}</td>
                    <td style="text-align: right;">${toBn(totalBalance)}</td>
                </tr>
            `;
        });

        const elementHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Noto Serif Bengali', serif; color: #000; margin: 0; padding: 0; line-height: 1.3; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { font-size: 26pt; font-weight: bold; margin: 0; letter-spacing: 1px; }
                .header h2 { font-size: 16pt; margin: 5px 0 0 0; font-weight: normal; }
                .info-bar { width: 100%; margin: 15px 0 10px 0; font-size: 12pt; display: flex; justify-content: space-between; border-bottom: 0.5px solid #eee; padding-bottom: 5px;}
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th, td { border: 1px solid #000; padding: 8px 10px; font-size: 11.5pt; }
                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                .text-right { text-align: right; }
                .total-row { font-weight: bold; background-color: #fafafa; }
                .footer { margin-top: 80px; width: 100%; }
                .sig-box { float: right; width: 220px; text-align: center; border-top: 1px solid #000; padding-top: 5px; font-size: 11pt; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MOUSUMI COMPUTER</h1>
                <h2>লেনদেন এর তালিকা</h2>
            </div>
            <div class="info-bar">
                <div>তারিখ: ${startParts.date} ${startParts.month} ${startParts.year} ${startDate !== endDate ? ' হতে ' + endParts.date + ' ' + endParts.month : ''}</div>
                <div style="text-align:right;">বার: ${startParts.day}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 8%;">ক্রমিক</th>
                        <th style="width: 15%;">সময়</th>
                        <th>কাস্টমার</th>
                        <th style="width: 18%;">লেনদেন</th>
                        <th style="width: 18%;">টাকা</th>
                        <th style="width: 20%;">অবশিষ্ট বাকী</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="total-row">
                        <td colspan="4" style="text-align: right;">সর্বমোট (Total):</td>
                        <td style="text-align: right;">${toBn(totalAmount)}</td>
                        <td style="text-align: right;">${toBn(totalBalance)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="footer">
                <div class="sig-box">Authorized Signature</div>
            </div>
        </body>
        </html>
        `;

        const opt = {
            margin: [15, 12, 15, 12],
            filename: `Mousumi_Report_${startDate}.pdf`,
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(elementHTML).save();
    };

    // ৪. ইউআই (UI) ইনজেকশন ফাংশন
    const initReportUI = () => {
        const container = document.getElementById('cust-reports-section');
        if (!container) return;

        container.innerHTML = `
        <style>
            .rc-card { background: #fff; border-radius: 12px; padding: 25px; border: 1px solid #eef2f6; box-shadow: 0 10px 30px rgba(0,0,0,0.03); font-family: sans-serif; }
            .rc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; }
            .rc-title { font-size: 18px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 10px; }
            .rc-presets { display: flex; gap: 8px; }
            .rc-btn-p { border: 1px solid #e2e8f0; background: #fff; padding: 6px 15px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; color: #64748b; transition: 0.2s; }
            .rc-btn-p.active { background: #3b82f6; color: #fff; border-color: #3b82f6; }
            .rc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px; }
            .rc-label { display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 8px; }
            .rc-input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; box-sizing: border-box; }
            .rc-footer { display: flex; justify-content: flex-end; padding-top: 15px; border-top: 1px solid #f1f5f9; }
            .rc-btn-main { background: #3b82f6; color: #fff; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 10px; }
        </style>

        <div class="rc-card">
            <div class="rc-header">
                <div class="rc-title"><i class="fa-solid fa-file-export"></i> Report Download Center</div>
                <div class="rc-presets">
                    <button class="rc-btn-p active" id="p-today">Today</button>
                    <button class="rc-btn-p" id="p-week">Week</button>
                    <button class="rc-btn-p" id="p-month">Month</button>
                </div>
            </div>
            <div class="rc-grid">
                <div>
                    <label class="rc-label">Date Range</label>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <input type="date" id="r-start" class="rc-input">
                        <span style="color:#94a3b8; font-size:12px;">to</span>
                        <input type="date" id="r-end" class="rc-input">
                    </div>
                </div>
                <div>
                    <label class="rc-label">Report Type</label>
                    <select id="r-type" class="rc-input">
                        <option value="all">All Transactions Report</option>
                        <option value="due">Outstanding Due Only</option>
                    </select>
                </div>
                <div>
                    <label class="rc-label">Format</label>
                    <select id="r-format" class="rc-input">
                        <option value="pdf">PDF Document (.pdf)</option>
                        <option value="excel">Excel Spreadsheet (.xlsx)</option>
                    </select>
                </div>
            </div>
            <div class="rc-footer">
                <button class="rc-btn-main" id="r-download-btn"><i class="fa-solid fa-download"></i> Generate & Download</button>
            </div>
        </div>
        `;

        // ডেট সেট করার লজিক
        const setDates = (days) => {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - days);
            document.getElementById('r-start').value = start.toISOString().split('T')[0];
            document.getElementById('r-end').value = end.toISOString().split('T')[0];
        };

        setDates(0);

        document.getElementById('p-today').onclick = (e) => { setActive(e); setDates(0); };
        document.getElementById('p-week').onclick = (e) => { setActive(e); setDates(7); };
        document.getElementById('p-month').onclick = (e) => { setActive(e); setDates(30); };

        const setActive = (e) => {
            document.querySelectorAll('.rc-btn-p').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        };

        // ডাউনলোড বাটন ক্লিক হ্যান্ডলার
        document.getElementById('r-download-btn').onclick = () => {
            const start = document.getElementById('r-start').value;
            const end = document.getElementById('r-end').value;
            const type = document.getElementById('r-type').value;
            const format = document.getElementById('r-format').value;

            if (format === 'excel') {
                if (typeof window.exportOutstandingDueExcel === 'function') {
                    window.exportOutstandingDueExcel();
                } else {
                    alert("Excel export function not found!");
                }
            } else {
                // PDF জেনারেশন লজিক
                if (!window.customerTransactions) {
                    alert("Transaction data not loaded yet!");
                    return;
                }

                let filtered = window.customerTransactions.filter(t => t.date >= start && t.date <= end);
                
                if (filtered.length === 0) {
                    alert("No transactions found for the selected period.");
                    return;
                }

                // গ্রাহকের নাম ম্যাপিং
                const reportData = filtered.map(t => {
                    const cust = window.customers.find(c => c.id === t.customerId);
                    return {
                        ...t,
                        customerName: cust ? cust.name : "Unknown",
                        runningBalance: typeof calculateCustomerCurrentDue === 'function' ? calculateCustomerCurrentDue(t.customerId) : 0
                    };
                });

                generateMousumiPDF(reportData, start, end);
            }
        };
    };

    // মূল অ্যাপ লোড হওয়ার ১ সেকেন্ড পর ইউআই ইনজেক্ট করবে
    setTimeout(initReportUI, 1000);
})();
