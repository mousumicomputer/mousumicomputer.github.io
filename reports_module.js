/**
 * Mousumi Computer - Final Professional Document Engine
 * Fixed: 7 Columns, Proper Date, Day & Real Time Formatting
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

    const toBnSimple = (num) => {
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return num.toString().replace(/\d/g, d => digits[d]);
    };

    const escapeHTML = (val) => String(val ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));

    // ২. ১২ ঘণ্টার সময় ফরম্যাট (English AM/PM to Bengali)
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

    // ৪. PDF GENERATION
    const generateMousumiPDF = async (reportData, startDate) => {
        const startParts = getBnDate(new Date(startDate));
        let tableRows = '';
        let totalMoney = 0;
        let totalBalance = 0;

        reportData.forEach((t, index) => {
            const amount = parseFloat(t.debit) || parseFloat(t.credit) || 0;
            const balance = Math.abs(parseFloat(t.runningBalanceAtTime) || 0);
            const type = parseFloat(t.debit) > 0 ? "বাকী দিলাম" : "বাকী পেলাম";
            const description = String(t.description ?? t.details ?? "").trim();

            totalMoney += amount;
            totalBalance += balance;

            tableRows += `
                <tr>
                    <td style="text-align:center;">${toBnSimple(index + 1)}</td>
                    <td style="text-align:center;">${format12hBn(t.time)}</td>
                    <td style="text-align:left; padding-left:5px;">${escapeHTML(t.customerName)}</td>
                    <td style="text-align:center;">${escapeHTML(type)}</td>
                    <td style="text-align:left; padding-left:5px;">${escapeHTML(description || "—")}</td>
                    <td style="text-align:right; padding-right:5px;">${toBn(amount)}</td>
                    <td style="text-align:right; padding-right:5px;">${toBn(balance)}</td>
                </tr>`;
        });

        const elementHTML = `
        <div class="pdf-container">
            <div class="header">
                <h1>MOUSUMI COMPUTER</h1>
                <p class="subtitle">লেনদেন এর তালিকা</p>
            </div>
            <div class="meta-info">
                <span>তারিখ: ${startParts.date} ${startParts.month}, ${startParts.year}</span>
                <span>বার: ${startParts.day}</span>
            </div>
            <table class="report-table">
                <thead>
                    <tr>
                        <th style="width:6%">ক্রমিক</th>
                        <th style="width:12%">সময়</th>
                        <th style="width:18%">কাস্টমার</th>
                        <th style="width:12%">লেনদেন</th>
                        <th style="width:22%">বিবরণ</th>
                        <th style="width:14%">টাকা</th>
                        <th style="width:16%">অবশিষ্ট বাকী</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="footer-row">
                        <td colspan="5">সর্বমোট (Total):</td>
                        <td>${toBn(totalMoney)}</td>
                        <td>${toBn(totalBalance)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="signature-section">
                <p class="sig-line">Authorized Signature</p>
            </div>
        </div>`;

        const style = `
            <style>
                .pdf-container { width: 794px; padding: 40px 50px; background: #fff; color: #000; font-family: 'Tiro Bangla', serif; }
                .header { text-align: center; margin-bottom: 25px; }
                .header h1 { font-family: Arial, sans-serif; font-size: 28px; margin: 0; font-weight: bold; }
                .header .subtitle { font-size: 16px; font-weight: bold; margin: 5px 0; border-bottom: 1px solid #000; display: inline-block; padding-bottom: 2px; }
                .meta-info { display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; margin-bottom: 10px; }
                .report-table { width: 100%; border-collapse: collapse; border: 1.5px solid #000; }
                .report-table th, .report-table td { border: 1px solid #000; padding: 6px 3px; font-size: 11.5px; }
                .report-table th { background: #f0f0f0; font-weight: bold; }
                .footer-row { font-weight: bold; background: #f9f9f9; text-align: right; }
                .footer-row td { padding-right: 5px; }
                .signature-section { margin-top: 80px; text-align: right; }
                .sig-line { display: inline-block; border-top: 1px solid #000; width: 200px; padding-top: 5px; font-size: 12px; font-family: Arial; }
            </style>`;

        const worker = document.createElement('div');
        worker.style.position = 'fixed'; worker.style.left = '-9999px';
        worker.innerHTML = style + elementHTML;
        document.body.appendChild(worker);

        await html2pdf().set({
            margin: 0, filename: `Mousumi_Report_${startDate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2.5, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(worker).save();

        document.body.removeChild(worker);
    };

    // ৫. UI INITIALIZATION
    const initUI = () => {
        const container = document.getElementById('cust-reports-section');
        if (!container) return;
        container.innerHTML = `
            <div style="background:#fff; border-radius:15px; padding:30px; border:1.5px solid #e2e8f0; box-shadow:0 10px 30px rgba(0,0,0,0.05); max-width:600px; margin:0 auto;">
                <h2 style="font-family:'Tiro Bangla', serif; font-size:22px; color:#2176ff; margin-bottom:20px; text-align:center; border-bottom:2px solid #f1f5f9; padding-bottom:10px;">রিপোর্ট সেন্টার</h2>
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <label style="font-weight:bold; color:#475569;">তারিখ নির্বাচন করুন:</label>
                    <input type="date" id="rc-date" style="padding:12px; border:1.5px solid #cbd5e1; border-radius:10px; font-size:16px;">
                    <button id="rc-btn" style="background:#2176ff; color:#fff; border:none; padding:15px; border-radius:10px; font-weight:bold; font-size:16px; cursor:pointer; transition:0.3s;">PDF রিপোর্ট তৈরি করুন</button>
                </div>
            </div>`;
        document.getElementById('rc-date').value = new Date().toISOString().split('T')[0];
        document.getElementById('rc-btn').onclick = async () => {
            const date = document.getElementById('rc-date').value;
            const txs = window.customerTransactions || [];
            const custs = window.customers || [];
            let filtered = txs.filter(t => t.date === date);
            if (!filtered.length) return alert("এই তারিখে কোনো লেনদেন পাওয়া যায়নি!");
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
