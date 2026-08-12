/**
 * Mousumi Computer - Professional Document Engine (Final Version)
 * ১ নং ছবির হুবহু ডিজাইন এবং গাণিতিক যোগফল ফিক্সড।
 */

(function() {
    // ১. সংখ্যাকে বাংলা করা (কমা ও দশমিক সহ)
    const toBn = (num) => {
        if (num === undefined || num === null || isNaN(num)) return "০.০০";
        let formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(num));
        
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return formatted.replace(/\d/g, d => digits[d]);
    };

    // ২. সাধারণ বাংলা সংখ্যা (সিরিয়াল ও বছরের জন্য)
    const toBnSimple = (num) => {
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return num.toString().replace(/\d/g, d => digits[d]);
    };

    // ৩. ১২ ঘণ্টার সময় ফরম্যাট
    const format12h = (timeStr) => {
        if (!timeStr) return '--:-- --';
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    // ৪. বাংলা তারিখ ও বার জেনারেশন
    const getBnDate = (dateObj) => {
        const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        return {
            day: days[dateObj.getDay()],
            date: toBnSimple(dateObj.getDate()),
            month: months[dateObj.getMonth()],
            year: toBnSimple(dateObj.getFullYear())
        };
    };

    // ৫. পিডিএফ জেনারেশন ফাংশন (The Powerful Engine)
    const generateMousumiPDF = (reportData, startDate) => {
        const startParts = getBnDate(new Date(startDate));
        
        let tableRows = '';
        let verticalSumTaka = 0;       // টাকা কলামের খাড়া যোগফল
        let verticalSumRemaining = 0;  // অবশিষ্ট বাকী কলামের খাড়া যোগফল

        reportData.forEach((t, index) => {
            const amount = parseFloat(t.debit) || parseFloat(t.credit) || 0;
            const balance = Math.abs(parseFloat(t.runningBalanceAtTime) || 0);
            const type = t.debit > 0 ? "বাকী দিলাম" : "বাকী পেলাম";
            
            // ১ নং ছবির লজিক: কলামে যা দেখা যাচ্ছে তার যোগফল
            verticalSumTaka += amount;
            verticalSumRemaining += balance;

            tableRows += `
                <tr>
                    <td style="text-align:center;">${toBnSimple(index + 1)}।</td>
                    <td style="text-align:center;">${format12h(t.time)}</td>
                    <td style="text-align:left; padding-left:15px;">${t.customerName}</td>
                    <td style="text-align:center;">${type}</td>
                    <td style="text-align:right; padding-right:15px;">${toBn(amount)}</td>
                    <td style="text-align:right; padding-right:15px;">${toBn(balance)}</td>
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
                @page { size: A4; margin: 12mm; }
                body {
                    font-family: 'Noto Sans Bengali', sans-serif;
                    margin: 0; padding: 0; color: #000;
                    background: #fff;
                }
                .main-header { text-align: center; margin-bottom: 20px; }
                .main-header h1 {
                    font-family: 'Times New Roman', serif;
                    font-size: 40pt;
                    font-weight: bold;
                    margin: 0;
                    letter-spacing: 2px;
                }
                .main-header h2 {
                    font-size: 16pt;
                    margin: 5px 0;
                    font-weight: bold;
                    display: inline-block;
                    border-bottom: 1px solid #000;
                    padding: 0 20px 3px 20px;
                }
                .date-bar {
                    display: flex; justify-content: space-between;
                    font-weight: bold; font-size: 11pt;
                    margin-bottom: 8px; padding: 0 5px;
                }
                table {
                    width: 100%; border-collapse: collapse;
                    border: 1.5px solid #000;
                }
                th, td {
                    border: 1px solid #000;
                    padding: 9px 5px;
                    font-size: 11pt;
                    line-height: 1.2;
                }
                th { background-color: #f9f9f9; font-weight: bold; text-align: center; }
                .total-row td {
                    font-weight: bold;
                    background-color: #fff;
                }
                .sig-container {
                    margin-top: 60px;
                    display: flex; justify-content: flex-end;
                }
                .sig-box {
                    width: 250px; text-align: center;
                    border-top: 1.5px solid #000;
                    padding-top: 5px; font-weight: bold; font-size: 11pt;
                }
            </style>
        </head>
        <body>
            <div class="main-header">
                <h1>MOUSUMI COMPUTER</h1>
                <h2>লেনদেন এর তালিকা</h2>
            </div>
            <div class="date-bar">
                <div>তারিখ: ${startParts.date} ${startParts.month} ${startParts.year}</div>
                <div>বার: ${startParts.day}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 8%;">ক্রমিক</th>
                        <th style="width: 14%;">সময়</th>
                        <th>কাস্টমার</th>
                        <th style="width: 16%;">লেনদেন</th>
                        <th style="width: 18%;">টাকা</th>
                        <th style="width: 20%;">অবশিষ্ট বাকী</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="total-row">
                        <td colspan="4" style="text-align:right; padding-right:15px;">সর্বমোট (Total):</td>
                        <td style="text-align:right; padding-right:15px;">${toBn(verticalSumTaka)}</td>
                        <td style="text-align:right; padding-right:15px;">${toBn(verticalSumRemaining)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="sig-container">
                <div class="sig-box">Authorized Signature</div>
            </div>
        </body>
        </html>
        `;

        // PDF Generation Options
        const opt = {
            margin: 0,
            filename: `Mousumi_Report_${startDate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(elementHTML).save();
    };

    // ৬. রিপোর্ট সেন্টার UI (অপরিবর্তিত)
    const initReportUI = () => {
        const container = document.getElementById('cust-reports-section');
        if (!container) return;
        container.innerHTML = `
        <div style="background:#fff; border-radius:12px; padding:25px; border:1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
            <h3 style="margin-top:0; font-size:18px;">Download Report</h3>
            <div style="display:flex; gap:15px; margin-bottom:20px;">
                <div style="flex:1;">
                    <label style="display:block; margin-bottom:5px; font-weight:600;">তারিখ নির্বাচন করুন</label>
                    <input type="date" id="rc-start" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                </div>
            </div>
            <button id="rc-download-btn" style="background:#000; color:#fff; border:none; padding:12px 25px; border-radius:8px; font-weight:700; cursor:pointer;">
                Generate PDF Report
            </button>
        </div>
        `;

        document.getElementById('rc-start').value = new Date().toISOString().split('T')[0];
        document.getElementById('rc-download-btn').onclick = () => {
            const start = document.getElementById('rc-start').value;
            const allTxs = window.customerTransactions || [];
            const allCusts = window.customers || [];
            let filtered = allTxs.filter(t => t.date === start);
            if (filtered.length === 0) return alert("এই তারিখে কোনো লেনদেন নেই!");

            const reportData = filtered.map(t => {
                const cust = allCusts.find(x => x.id === t.customerId);
                let balanceAtTime = parseFloat(cust ? cust.openingBalance : 0);
                const history = allTxs.filter(x => x.customerId === t.customerId)
                                     .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
                for (let entry of history) {
                    balanceAtTime += (parseFloat(entry.debit) || 0);
                    balanceAtTime -= (parseFloat(entry.credit) || 0);
                    if (entry.id === t.id) break;
                }
                return { ...t, customerName: cust ? cust.name : "Unknown", runningBalanceAtTime: balanceAtTime };
            });
            generateMousumiPDF(reportData, start);
        };
    };

    setTimeout(initReportUI, 1500);
})();
