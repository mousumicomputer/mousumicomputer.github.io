/**
 * Mousumi Computer - Professional Document Engine
 * Fixed: Layout, White Page Issue, and Proper A4 Alignment
 */

(function() {
    // ১. সংখ্যাকে বাংলা করা
    const toBn = (num) => {
        if (num === undefined || num === null || isNaN(num)) return "০.০০";
        let formatted = new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Math.abs(num));
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return formatted.replace(/\d/g, d => digits[d]);
    };

    const toBnSimple = (num) => {
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return num.toString().replace(/\d/g, d => digits[d]);
    };

    const escapeHTML = (val) => String(val ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));

    // ২. ১২ ঘণ্টার সময় ফরম্যাট
    const format12hBn = (timeStr) => {
        if (!timeStr) return '--:--';
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        return toBnSimple(hours.toString().padStart(2, '0')) + ":" + toBnSimple(minutes) + " " + ampm;
    };

    // ৩. বাংলা তারিখ ও বার
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

    // ৪. PDF GENERATION ENGINE
    const generateMousumiPDF = async (reportData, startDate) => {
        const startParts = getBnDate(new Date(startDate));
        let tableRows = '';
        let totalMoney = 0;
        let totalBalance = 0;

        reportData.forEach((t, index) => {
            const amount = parseFloat(t.debit) || parseFloat(t.credit) || 0;
            const balance = Math.abs(parseFloat(t.runningBalanceAtTime) || 0);
            const type = parseFloat(t.debit) > 0 ? "বাকী দিলাম" : "বাকী পেলাম";

            totalMoney += amount;
            totalBalance += balance;

            tableRows += `
                <tr>
                    <td style="text-align:center;">${toBnSimple(index + 1)}।</td>
                    <td style="text-align:center;">${format12hBn(t.time)}</td>
                    <td style="text-align:left;">${escapeHTML(t.customerName)}</td>
                    <td style="text-align:center;">${escapeHTML(type)}</td>
                    <td style="text-align:right;">${toBn(amount)}</td>
                    <td style="text-align:right;">${toBn(balance)}</td>
                </tr>`;
        });

        const elementHTML = `
        <div class="mousumi-report">
            <div class="header">
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
                        <td colspan="4" style="text-align:right;">সর্বমোট (Total):</td>
                        <td style="text-align:right;">${toBn(totalMoney)}</td>
                        <td style="text-align:right;">${toBn(totalBalance)}</td>
                    </tr>
                </tbody>
            </table>

            <div class="footer-signature">
                <div class="sig-box">
                    <div class="sig-line"></div>
                    <div>Authorized Signature</div>
                </div>
            </div>
        </div>`;

        const style = `
            <style>
                .mousumi-report { width: 700px; margin: 0 auto; background: #fff; padding: 20px; color: #000; font-family: 'Tiro Bangla', serif; }
                .header { text-align: center; margin-bottom: 25px; }
                .header h1 { font-family: 'Times New Roman', serif; font-size: 32px; margin: 0; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
                .header h2 { font-size: 18px; margin: 5px 0; font-weight: normal; }
                .date-bar { display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; }
                th, td { border: 1px solid #000; padding: 8px 6px; font-size: 13px; }
                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                .total-row td { font-weight: bold; background-color: #fafafa; }
                .footer-signature { margin-top: 70px; display: flex; justify-content: flex-end; }
                .sig-box { width: 220px; text-align: center; font-family: 'Times New Roman', serif; font-size: 14px; }
                .sig-line { border-top: 1.5px solid #000; margin-bottom: 5px; }
            </style>`;

        // সাদা পাতা সমস্যা সমাধানের জন্য এখানে টেম্পোরারি কন্টেইনার তৈরি করা হয়েছে
        const worker = document.createElement('div');
        worker.style.position = 'absolute';
        worker.style.top = '0';
        worker.style.left = '0';
        worker.style.width = '100%';
        worker.style.zIndex = '-1'; // স্ক্রিনে দেখা যাবে না কিন্তু ব্রাউজার রিড করতে পারবে
        worker.innerHTML = style + elementHTML;
        document.body.appendChild(worker);

        const opt = {
            margin: 10,
            filename: `Mousumi_Report_${startDate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 3, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await html2pdf().set(opt).from(worker).save();
        } finally {
            document.body.removeChild(worker); // কাজ শেষ হলে ডিলিট করে দিবে
        }
    };

    // ৫. UI INITIALIZATION
    const initUI = () => {
        const container = document.getElementById('cust-reports-section');
        if (!container) return;
        container.innerHTML = `
            <div style="background:#fff; border-radius:15px; padding:30px; border:1.5px solid #e2e8f0; box-shadow:0 10px 30px rgba(0,0,0,0.05); max-width:600px; margin:0 auto;">
                <h2 style="font-family:'Tiro Bangla', serif; font-size:22px; color:#2176ff; margin-bottom:20px; text-align:center;">রিপোর্ট ডাউনলোড সেন্টার</h2>
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <label style="font-weight:bold;">তারিখ নির্বাচন করুন:</label>
                    <input type="date" id="rc-date" style="padding:12px; border:1.5px solid #cbd5e1; border-radius:10px;">
                    <button id="rc-btn" style="background:#2176ff; color:#fff; border:none; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer;">ডাউনলোড PDF</button>
                </div>
            </div>`;
        document.getElementById('rc-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('rc-btn').onclick = async () => {
            const date = document.getElementById('rc-date').value;
            const txs = window.customerTransactions || [];
            const custs = window.customers || [];
            let filtered = txs.filter(t => t.date === date);
            if (!filtered.length) return alert("এই তারিখে কোনো লেনদেন নেই!");
            const reportData = filtered.map(t => {
                const c = custs.find(x => x.id === t.customerId);
                let bal = parseFloat(c ? c.openingBalance : 0);
                const history = txs.filter(x => x.customerId === t.customerId).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
                for(let e of history){ bal += (parseFloat(e.debit)||0) - (parseFloat(e.credit)||0); if(e.id===t.id) break; }
                return { ...t, customerName: c ? c.name : "Unknown", runningBalanceAtTime: bal };
            });
            await generateMousumiPDF(reportData, date);
        };
    };
    setTimeout(initUI, 2000);
})();
