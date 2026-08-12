/**
 * Mousumi Computer - Pro PDF Module (Final Fix)
 * ফিক্সড: বার কাটা, বছরের কমা, ১২ ঘণ্টা সময়, রানিং ব্যালেন্স এবং বর্ডার।
 */

(function() {
    // ১. সংখ্যাকে বাংলা করা (টাকার জন্য - কমা থাকবে)
    const toBn = (num) => {
        if (num === undefined || num === null || isNaN(num)) return "০.০০";
        let formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(num);
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return formatted.replace(/\d/g, d => digits[d]);
    };

    // ২. বছরের জন্য বাংলা সংখ্যা (কমা ছাড়া)
    const toBnYear = (num) => {
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return num.toString().replace(/\d/g, d => digits[d]);
    };

    // ৩. সময়কে ১২ ঘণ্টার ফরম্যাটে (AM/PM) রূপান্তর
    const format12h = (timeStr) => {
        if (!timeStr) return '--:-- --';
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // ০ হলে ১২
        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    // ৪. বাংলা তারিখ ও বার জেনারেশন
    const getBnDate = (dateObj) => {
        const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        return {
            day: days[dateObj.getDay()],
            date: toBnYear(dateObj.getDate()),
            month: months[dateObj.getMonth()],
            year: toBnYear(dateObj.getFullYear())
        };
    };

    // ৫. পিডিএফ জেনারেশন ফাংশন
    const generateMousumiPDF = (reportData, startDate) => {
        const startParts = getBnDate(new Date(startDate));
        
        let tableRows = '';
        let totalAmount = 0;
        let lastRunningBalance = 0;

        reportData.forEach((t, index) => {
            const amount = parseFloat(t.debit) || parseFloat(t.credit) || 0;
            const type = t.debit > 0 ? "বাকী দিলাম" : "বাকী পেলাম";
            totalAmount += amount;
            lastRunningBalance = t.runningBalanceAtTime; // সঠিক সময়ের ব্যালেন্স

            tableRows += `
                <tr>
                    <td class="text-center">${toBnYear(index + 1)}।</td>
                    <td class="text-center">${format12h(t.time)}</td>
                    <td class="text-left">${t.customerName}</td>
                    <td class="text-center">${type}</td>
                    <td class="text-right">${toBn(amount)}</td>
                    <td class="text-right">${toBn(lastRunningBalance)}</td>
                </tr>
            `;
        });

        const elementHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;700&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 15mm 12mm; }
                body {
                    font-family: 'Noto Sans Bengali', sans-serif;
                    font-size: 11pt;
                    color: #000;
                    margin: 0;
                    padding: 0;
                    line-height: 1.4;
                    -webkit-font-smoothing: antialiased;
                }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 {
                    font-family: 'Times New Roman', serif;
                    font-size: 28pt;
                    font-weight: bold;
                    margin: 0;
                    text-transform: uppercase;
                }
                .header h2 { font-size: 16pt; margin: 0; font-weight: normal; border-bottom: 1px solid #000; display: inline-block; padding: 0 10px; }
                
                .date-bar-container {
                    width: 100%;
                    margin-top: 15px;
                    margin-bottom: 10px;
                    display: flex;
                    justify-content: space-between;
                    font-size: 12pt;
                    font-weight: bold;
                }

                table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
                th, td { border: 1px solid #000; padding: 6px 8px; font-size: 10.5pt; }
                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .text-left { text-align: left; }
                .total-row td { font-weight: bold; background-color: #fafafa; }

                .footer-signature { margin-top: 60px; width: 100%; display: flex; justify-content: flex-end; }
                .sig-box { width: 220px; text-align: center; border-top: 1px solid #000; padding-top: 5px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MOUSUMI COMPUTER</h1>
                <h2>লেনদেন এর তালিকা</h2>
            </div>

            <div class="date-bar-container">
                <div>তারিখ: ${startParts.date} ${startParts.month} ${startParts.year}</div>
                <div style="white-space: nowrap;">বার: ${startParts.day}</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 8%;">ক্রমিক</th>
                        <th style="width: 15%;">সময়</th>
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
                        <td class="text-right">${toBn(lastRunningBalance)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer-signature">
                <div class="sig-box">Authorized Signature</div>
            </div>
        </body>
        </html>
        `;

        html2pdf().set({
            margin: 0,
            filename: `Mousumi_Report_${startDate}.pdf`,
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(elementHTML).save();
    };

    // ৬. রিপোর্ট সেন্টার UI জেনারেশন
    const initReportUI = () => {
        const container = document.getElementById('cust-reports-section');
        if (!container) return;

        container.innerHTML = `
        <div style="background:#fff; border-radius:12px; padding:25px; border:1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:15px; margin-bottom:20px;">
                <h3 style="font-size:18px; font-weight:700; color:#0f172a; margin:0;"><i class="fa-solid fa-file-invoice"></i> Report Download Center</h3>
                <div style="display:flex; gap:8px;">
                    <button class="rc-btn" onclick="document.getElementById('rc-start').value=new Date().toISOString().split('T')[0]; document.getElementById('rc-end').value=new Date().toISOString().split('T')[0];" style="padding:6px 12px; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer; font-weight:600;">Today</button>
                </div>
            </div>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:15px; margin-bottom:20px;">
                <div>
                    <label style="font-weight:600; font-size:13px; color:#334155; display:block; margin-bottom:8px;">Date Range</label>
                    <input type="date" id="rc-start" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                </div>
                <div>
                    <label style="font-weight:600; font-size:13px; color:#334155; display:block; margin-bottom:8px;">Format</label>
                    <select id="rc-format" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                        <option value="pdf">PDF Document (.pdf)</option>
                        <option value="excel">Excel Spreadsheet (.xlsx)</option>
                    </select>
                </div>
            </div>
            <button id="rc-download-btn" style="background:#2563eb; color:#fff; border:none; padding:12px 25px; border-radius:8px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; margin-left:auto;">
                <i class="fa-solid fa-download"></i> Generate & Download
            </button>
        </div>
        `;

        document.getElementById('rc-start').value = new Date().toISOString().split('T')[0];

        document.getElementById('rc-download-btn').onclick = () => {
            const start = document.getElementById('rc-start').value;
            const format = document.getElementById('rc-format').value;

            const allTxs = window.customerTransactions || [];
            const allCusts = window.customers || [];

            if (allTxs.length === 0) return alert("তথ্য লোড হচ্ছে...");

            if (format === 'excel') {
                if (typeof window.exportOutstandingDueExcel === 'function') window.exportOutstandingDueExcel();
            } else {
                // ১. তারিখ অনুযায়ী ফিল্টার
                let filtered = allTxs.filter(t => t.date === start);
                
                if (filtered.length === 0) return alert("এই তারিখে কোনো লেনদেন নেই!");

                // ২. রানিং ব্যালেন্স লজিক ফিক্স
                // প্রতিটি কাস্টমারের জন্য ওপেনিং ব্যালেন্স থেকে শুরু করে ওই ট্রানজ্যাকশন পর্যন্ত যোগফল
                const reportData = filtered.map(t => {
                    const cust = allCusts.find(x => x.id === t.customerId);
                    let balanceAtTime = parseFloat(cust ? cust.openingBalance : 0);
                    
                    // ওই কাস্টমারের সমস্ত লেনদেন সময় অনুযায়ী সাজিয়ে হিসাব করা
                    const history = allTxs.filter(x => x.customerId === t.customerId)
                                         .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
                    
                    for (let entry of history) {
                        balanceAtTime += (parseFloat(entry.debit) || 0);
                        balanceAtTime -= (parseFloat(entry.credit) || 0);
                        // যদি বর্তমান লুপের এন্ট্রি আমাদের টার্গেট এন্ট্রি হয়, তবে ব্রেক
                        if (entry.id === t.id) break;
                    }

                    return {
                        ...t,
                        customerName: cust ? cust.name : "Unknown",
                        runningBalanceAtTime: balanceAtTime
                    };
                });

                generateMousumiPDF(reportData, start);
            }
        };
    };

    setTimeout(initReportUI, 1500);
})();
