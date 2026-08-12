/**
 * Mousumi Computer - Ultimate PDF Module (Fixed & Verified)
 * লক্ষ্য: ১ নং ছবির হুবহু ডিজাইন এবং সঠিক যোগফল নিশ্চিত করা।
 */

(function() {
    // ১. সংখ্যাকে বাংলা করা (টাকার ফরম্যাট - কমা সহ)
    const toBn = (num) => {
        if (num === undefined || num === null || isNaN(num)) return "০.০০";
        let formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(num));
        
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return formatted.replace(/\d/g, d => digits[d]);
    };

    // ২. সিরিয়াল ও বছরের জন্য বাংলা সংখ্যা (কমা ছাড়া)
    const toBnSimple = (num) => {
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return num.toString().replace(/\d/g, d => digits[d]);
    };

    // ৩. সময় ফরম্যাট (AM/PM)
    const format12h = (timeStr) => {
        if (!timeStr) return '--:-- --';
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    };

    // ৪. বাংলা তারিখ ও বার
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

    // ৫. পিডিএফ জেনারেশন ফাংশন
    const generateMousumiPDF = (reportData, startDate) => {
        const startParts = getBnDate(new Date(startDate));
        
        let tableRows = '';
        let totalTakaColumn = 0;
        let totalRemainingColumn = 0;

        reportData.forEach((t, index) => {
            const takaAmount = parseFloat(t.debit) || parseFloat(t.credit) || 0;
            const transType = t.debit > 0 ? "বাকী দিলাম" : "বাকী পেলাম";
            const runningBal = Math.abs(parseFloat(t.runningBalanceAtTime) || 0);
            
            totalTakaColumn += takaAmount;
            totalRemainingColumn += runningBal; // ১ নং ছবির লজিক: কলামের সব সংখ্যার যোগফল

            tableRows += `
                <tr>
                    <td class="text-center">${toBnSimple(index + 1)}।</td>
                    <td class="text-center">${format12h(t.time)}</td>
                    <td class="text-left">${t.customerName}</td>
                    <td class="text-center">${transType}</td>
                    <td class="text-right">${toBn(takaAmount)}</td>
                    <td class="text-right">${toBn(runningBal)}</td>
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
                @page { size: A4; margin: 10mm; }
                body {
                    font-family: 'Noto Sans Bengali', sans-serif;
                    color: #000;
                    margin: 0; padding: 10px;
                }
                .header-container { text-align: center; margin-bottom: 20px; }
                .header-container h1 {
                    font-family: 'Times New Roman', Times, serif;
                    font-size: 36pt;
                    font-weight: bold;
                    margin: 0;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                }
                .header-container h2 { 
                    font-size: 18pt; 
                    margin: 5px 0; 
                    font-weight: bold;
                    display: inline-block;
                    border-bottom: 2px solid #000;
                    padding-bottom: 2px;
                }
                
                .meta-info {
                    display: flex;
                    justify-content: space-between;
                    font-weight: bold;
                    font-size: 12pt;
                    margin-bottom: 10px;
                    padding: 0 5px;
                }

                table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; }
                th, td { 
                    border: 1px solid #000; 
                    padding: 8px 6px; 
                    font-size: 11pt;
                    line-height: 1.2;
                }
                th { background-color: #f2f2f2; font-weight: bold; }
                
                .text-right { text-align: right; padding-right: 10px; }
                .text-center { text-align: center; }
                .text-left { text-align: left; padding-left: 10px; }
                
                .total-row { font-weight: bold; background-color: #ffffff; }
                .total-label { text-align: right; font-weight: bold; }

                .signature-wrapper {
                    margin-top: 60px;
                    text-align: right;
                }
                .signature-line {
                    display: inline-block;
                    width: 250px;
                    border-top: 1.5px solid #000;
                    text-align: center;
                    padding-top: 5px;
                    font-weight: bold;
                    font-size: 11pt;
                }
            </style>
        </head>
        <body>
            <div class="header-container">
                <h1>MOUSUMI COMPUTER</h1>
                <h2>লেনদেন এর তালিকা</h2>
            </div>

            <div class="meta-info">
                <div>তারিখ: ${startParts.date} ${startParts.month} ${startParts.year}</div>
                <div>বার: ${startParts.day}</div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th style="width: 7%;">ক্রমিক</th>
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
                        <td colspan="4" class="total-label">সর্বমোট (Total):</td>
                        <td class="text-right">${toBn(totalTakaColumn)}</td>
                        <td class="text-right">${toBn(totalRemainingColumn)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="signature-wrapper">
                <div class="signature-line">Authorized Signature</div>
            </div>
        </body>
        </html>
        `;

        const opt = {
            margin: 5,
            filename: `Mousumi_Report_${startDate}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(elementHTML).save();
    };

    // ৬. রিপোর্ট সেন্টার UI (অপরিবর্তিত কিন্তু ফাংশনাল)
    const initReportUI = () => {
        const container = document.getElementById('cust-reports-section');
        if (!container) return;

        container.innerHTML = `
        <div style="background:#fff; border-radius:12px; padding:25px; border:1px solid #cbd5e1;">
            <h3 style="margin-top:0;">রিপোর্ট ডাউনলোড সেন্টার</h3>
            <div style="display:flex; gap:15px; margin-bottom:20px;">
                <div style="flex:1;">
                    <label>তারিখ নির্বাচন করুন</label>
                    <input type="date" id="rc-start" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                </div>
                <div style="flex:1;">
                    <label>ফরম্যাট</label>
                    <select id="rc-format" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px;">
                        <option value="pdf">PDF Document</option>
                    </select>
                </div>
            </div>
            <button id="rc-download-btn" style="background:#000; color:#fff; padding:12px 25px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">
                Generate & Download PDF
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
