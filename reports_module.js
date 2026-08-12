/**
 * Mousumi Computer - Final Unified Report Module
 * ডিজাইন ও লেআউট: ২নং ছবির হুবহু ডিজাইন (Bengali PDF)
 */

(function() {
    // ১. সংখ্যা ও টাকাকে বাংলা ফরম্যাটে রূপান্তর (৳ চিহ্ন ছাড়া, কমা ও দশমিকসহ)
    const toBn = (num) => {
        if (num === undefined || num === null || isNaN(num)) return "০.০০";
        let formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return formatted.replace(/\d/g, d => digits[d]);
    };

    // ২. বার এবং মাসের নাম বাংলা করার ফাংশন
    const getBnDate = (dateObj) => {
        const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        return {
            day: days[dateObj.getDay()],
            date: toBn(dateObj.getDate()).split('.')[0],
            month: months[dateObj.getMonth()],
            year: toBn(dateObj.getFullYear()).split('.')[0]
        };
    };

    // ৩. পিডিএফ জেনারেশন ইঞ্জিন (আপনার দেওয়া PDF.html টেমপ্লেট অনুযায়ী)
    const generateMousumiPDF = (reportData, startDate, endDate) => {
        const startParts = getBnDate(new Date(startDate));
        
        let tableRows = '';
        let totalAmount = 0;
        let finalBalance = 0;

        reportData.forEach((t, index) => {
            const amount = parseFloat(t.debit) || parseFloat(t.credit) || 0;
            const type = t.debit > 0 ? "বাকী দিলাম" : "বাকী পেলাম";
            totalAmount += amount;
            finalBalance = t.runningBalance || 0;

            tableRows += `
                <tr>
                    <td style="text-align: center;">${toBn(index + 1).split('.')[0]}।</td>
                    <td style="text-align: center;">${t.time || '--'}</td>
                    <td style="text-align: left;">${t.customerName}</td>
                    <td style="text-align: center;">${type}</td>
                    <td style="text-align: right;">${toBn(amount)}</td>
                    <td style="text-align: right;">${toBn(finalBalance)}</td>
                </tr>
            `;
        });

        const elementHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Noto Serif Bengali', serif; color: #000; margin: 0; padding: 0; line-height: 1.2; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { font-size: 24pt; font-weight: bold; margin: 0; text-transform: uppercase; }
                .header h2 { font-size: 15pt; margin: 5px 0 0 0; font-weight: normal; }
                .date-bar { width: 100%; margin-bottom: 12px; font-size: 11.5pt; display: flex; justify-content: space-between; }
                table { width: 100%; border-collapse: collapse; margin-top: 5px; }
                th, td { border: 1px solid #000; padding: 6px 8px; font-size: 11pt; }
                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .total-row { font-weight: bold; background-color: #fafafa; }
                .footer-signature { margin-top: 65px; text-align: right; }
                .sig-box { display: inline-block; width: 210px; text-align: center; border-top: 1px solid #000; padding-top: 5px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MOUSUMI COMPUTER</h1>
                <h2>লেনদেন এর তালিকা</h2>
            </div>
            <div class="date-bar">
                <span>তারিখ: ${startParts.date} ${startParts.month} ${startParts.year}</span>
                <span>বার: ${startParts.day}</span>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 10%;">ক্রমিক</th>
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
                        <td colspan="4" class="text-right">সর্বমোট (Total):</td>
                        <td class="text-right">${toBn(totalAmount)}</td>
                        <td class="text-right">${toBn(finalBalance)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="footer-signature">
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

    // ৪. ইউআই (UI) ইনজেকশন ফাংশন (Update.html ডিজাইন অনুযায়ী)
    const initReportUI = () => {
        const reportContainer = document.getElementById('cust-reports-section');
        if (!reportContainer) return;

        reportContainer.innerHTML = `
        <style>
            .rc-card { background: #fff; border-radius: 12px; padding: 25px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
            .rc-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; margin-bottom: 20px; }
            .rc-title { font-size: 18px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 10px; }
            .rc-presets { display: flex; gap: 6px; }
            .rc-preset-btn { background: #f8fafc; border: 1px solid #cbd5e1; padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 6px; cursor: pointer; color: #475569; }
            .rc-preset-btn.active { background: #2563eb; color: #fff; border-color: #2563eb; }
            .rc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .rc-label { font-weight: 600; color: #334155; font-size: 13px; margin-bottom: 8px; display: block; }
            .rc-input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; outline: none; }
            .rc-btn-main { background: #2563eb; color: #fff; border: none; padding: 12px 25px; border-radius: 8px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; width: auto; margin-left: auto; }
            .rc-btn-main:hover { background: #1d4ed8; }
        </style>

        <div class="rc-card">
            <div class="rc-header">
                <div class="rc-title"><i class="fa-solid fa-file-invoice"></i> Report Download Center</div>
                <div class="rc-presets">
                    <button class="rc-preset-btn active" id="rc-today">Today</button>
                    <button class="rc-preset-btn" id="rc-week">Week</button>
                    <button class="rc-preset-btn" id="rc-month">Month</button>
                </div>
            </div>
            <div class="rc-grid">
                <div>
                    <label class="rc-label">Date Range</label>
                    <div style="display:flex; align-items:center; gap:5px;">
                        <input type="date" id="rc-start" class="rc-input">
                        <span style="color:#94a3b8; font-size:12px;">to</span>
                        <input type="date" id="rc-end" class="rc-input">
                    </div>
                </div>
                <div>
                    <label class="rc-label">Report Type</label>
                    <select id="rc-type" class="rc-input">
                        <option value="all">All Transactions Report</option>
                        <option value="due">Outstanding Due Only</option>
                    </select>
                </div>
                <div>
                    <label class="rc-label">Format</label>
                    <select id="rc-format" class="rc-input">
                        <option value="pdf">PDF Document (.pdf)</option>
                        <option value="excel">Excel Spreadsheet (.xlsx)</option>
                    </select>
                </div>
            </div>
            <button class="rc-btn-main" id="rc-download-btn"><i class="fa-solid fa-download"></i> Generate & Download</button>
        </div>
        `;

        const setDates = (days) => {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - days);
            document.getElementById('rc-start').value = start.toISOString().split('T')[0];
            document.getElementById('rc-end').value = end.toISOString().split('T')[0];
        };

        setDates(0);

        document.getElementById('rc-today').onclick = (e) => { setActive(e); setDates(0); };
        document.getElementById('rc-week').onclick = (e) => { setActive(e); setDates(7); };
        document.getElementById('rc-month').onclick = (e) => { setActive(e); setDates(30); };

        const setActive = (e) => {
            document.querySelectorAll('.rc-preset-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        };

        document.getElementById('rc-download-btn').onclick = () => {
            const start = document.getElementById('rc-start').value;
            const end = document.getElementById('rc-end').value;
            const format = document.getElementById('rc-format').value;

            // ডাটা সোর্স রিড করা (window object থেকে)
            const allTxs = window.customerTransactions || [];
            const allCusts = window.customers || [];

            if (allTxs.length === 0) {
                alert("তথ্য এখনও লোড হচ্ছে, দয়া করে ১ সেকেন্ড পর আবার চেষ্টা করুন!");
                return;
            }

            if (format === 'excel') {
                if (typeof window.exportOutstandingDueExcel === 'function') {
                    window.exportOutstandingDueExcel();
                } else {
                    alert("Excel ফাংশনটি পাওয়া যায়নি!");
                }
            } else {
                // PDF জেনারেশন লজিক
                let filtered = allTxs.filter(t => t.date >= start && t.date <= end);
                
                if (filtered.length === 0) {
                    alert("নির্বাচিত তারিখের কোনো লেনদেন পাওয়া যায়নি!");
                    return;
                }

                const reportData = filtered.map(t => {
                    const c = allCusts.find(x => x.id === t.customerId);
                    // মূল অ্যাপের ব্যালেন্স ফাংশন ব্যবহারের চেষ্টা
                    const currentDue = typeof window.calculateCustomerCurrentDue === 'function' ? window.calculateCustomerCurrentDue(t.customerId) : 0;
                    return {
                        ...t,
                        customerName: c ? c.name : "Unknown",
                        runningBalance: currentDue
                    };
                });

                generateMousumiPDF(reportData, start, end);
            }
        };
    };

    // অ্যাপ লোড হওয়ার ১.৫ সেকেন্ড পর ইউআই ইনজেক্ট হবে (নিরাপত্তার জন্য)
    setTimeout(initReportUI, 1500);
})();
