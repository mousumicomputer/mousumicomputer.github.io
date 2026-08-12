/* 
   Mousumi Computer - PDF Report Generator Module
   আপনার দেওয়া টেমপ্লেট অনুযায়ী এটি কাজ করবে।
*/

// ১. সংখ্যাকে বাংলা সংখ্যায় রূপান্তর এবং কমা ফরম্যাট করার ফাংশন
const formatBengaliAmount = (num) => {
    if (num === undefined || num === null) return "০.০০";
    
    // ইংরেজি ফরম্যাটে কমা ও ২ দশমিক সেট করা
    let formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);

    // ইংরেজি ডিজিটকে বাংলা ডিজিটে রূপান্তর
    const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
    return formatted.replace(/\d/g, d => digits[d]);
};

// ২. পিডিএফ জেনারেট করার মূল ফাংশন
window.generateMousumiPDF = function(reportData) {
    const now = new Date();
    const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    
    const todayDate = `${formatBengaliAmount(now.getDate()).split('.')[0]} ${months[now.getMonth()]} ${formatBengaliAmount(now.getFullYear()).split('.')[0]}`;
    const todayDay = days[now.getDay()];

    // টেবিলের বডি ডায়নামিকভাবে তৈরি
    let tableRows = '';
    let totalAmount = 0;
    let finalBalance = 0;

    reportData.forEach((t, index) => {
        const amount = parseFloat(t.debit) || parseFloat(t.credit) || 0;
        const type = t.debit > 0 ? "বাকী দিলাম" : "বাকী পেলাম";
        totalAmount += amount;
        finalBalance = t.runningBalance || 0; // যদি ব্যালেন্স থাকে

        tableRows += `
            <tr>
                <td class="text-center">${formatBengaliAmount(index + 1).split('.')[0]}।</td>
                <td class="text-center">${t.time}</td>
                <td class="text-left">${t.customerName}</td>
                <td class="text-center">${type}</td>
                <td class="text-right">${formatBengaliAmount(amount)}</td>
                <td class="text-right">${formatBengaliAmount(finalBalance)}</td>
            </tr>
        `;
    });

    // আপনার দেওয়া HTML/CSS টেমপ্লেট
    const elementHTML = `
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Noto Serif Bengali', serif; font-size: 11pt; color: #000; margin: 0; padding: 0; }
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
            .sig-box { display: inline-block; width: 210px; text-align: center; }
            .sig-line { border-top: 1px solid #000; margin-bottom: 6px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>MOUSUMI COMPUTER</h1>
            <h2>লেনদেন এর তালিকা</h2>
        </div>
        <div class="date-bar">
            <span>তারিখ: ${todayDate}</span>
            <span>বার: ${todayDay}</span>
        </div>
        <table>
            <thead>
                <tr>
                    <th style="width: 10%;">ক্রমিক</th>
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
                    <td class="text-right">${formatBengaliAmount(totalAmount)}</td>
                    <td class="text-right">${formatBengaliAmount(finalBalance)}</td>
                </tr>
            </tbody>
        </table>
        <div class="footer-signature">
            <div class="sig-box">
                <div class="sig-line"></div>
                <div>Authorized Signature</div>
            </div>
        </div>
    </body>
    </html>
    `;

    // html2pdf অপশন
    const opt = {
        margin: [15, 12, 15, 12],
        filename: `Mousumi_Report_${now.toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // পিডিএফ জেনারেশন শুরু
    html2pdf().set(opt).from(elementHTML).save();
};
