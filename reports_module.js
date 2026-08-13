/**
 * Mousumi Computer - Professional Document Engine (Advanced Edition)
 * PDF Design + Tiro Bangla Font + Advanced Calculations
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

    // ২. সাধারণ বাংলা সংখ্যা
    const toBnSimple = (num) => {
        const digits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
        return num.toString().replace(/\d/g, d => digits[d]);
    };

    const escapeHTML = (val) => String(val ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m]));

    // ৩. ১২ ঘণ্টার সময় ফরম্যাট
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

    // ৫. PDF GENERATION ENGINE
    const generateMousumiPDF = async (reportData, startDate) => {
        const startParts = getBnDate(new Date(startDate));
        let tableRows = '';
        let verticalSumTaka = 0;
        let verticalSumRemaining = 0;

        reportData.forEach((t, index) => {
            const amount = parseFloat(t.debit) || parseFloat(t.credit) || 0;
            const balance = Math.abs(parseFloat(t.runningBalanceAtTime) || 0);
            const type = parseFloat(t.debit) > 0 ? "বাকী দিলাম" : "বাকী পেলাম";
            const description = String(t.description ?? t.details ?? t.note ?? "").trim();

            verticalSumTaka += amount;
            verticalSumRemaining += balance;

            tableRows += `
                <tr>
                    <td class="col-no">${toBnSimple(index + 1)}।</td>
                    <td class="col-time">${escapeHTML(format12h(t.time))}</td>
                    <td class="col-customer">${escapeHTML(t.customerName || "Unknown")}</td>
                    <td class="col-type">${escapeHTML(type)}</td>
                    <td class="col-description">${escapeHTML(description || "—")}</td>
                    <td class="col-money">${toBn(amount)}</td>
                    <td class="col-balance">${toBn(balance)}</td>
                </tr>`;
        });

        const elementHTML = `
        <div class="mousumi-pdf-page">
            <div class="main-header">
                <h1>MOUSUMI COMPUTER</h1>
                <h2>দৈনিক লেনদেন রিপোর্ট</h2>
            </div>
            <div class="date-bar">
                <div>তারিখ: ${startParts.date} ${startParts.month} ${startParts.year}</div>
                <div>বার: ${startParts.day}</div>
            </div>
            <table class="transaction-table">
                <thead>
                    <tr>
                        <th style="width:7%">ক্রমিক</th>
                        <th style="width:11%">সময়</th>
                        <th style="width:18%">কাস্টমার</th>
                        <th style="width:14%">লেনদেন</th>
                        <th style="width:20%">বিবরণ</th>
                        <th style="width:14%">টাকা</th>
                        <th style="width:16%">অবশিষ্ট বাকী</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                    <tr class="total-row">
                        <td colspan="5" style="text-align:right; padding-right:10px;">সর্বমোট (Total):</td>
                        <td class="col-money">${toBn(verticalSumTaka)}</td>
                        <td class="col-balance">${toBn(verticalSumRemaining)}</td>
                    </tr>
                </tbody>
            </table>
            <div class="sig-container"><div class="sig-box">Authorized Signature</div></div>
        </div>`;

        const css = `
            @page { size: A4 portrait; margin: 0; }
            .mousumi-pdf-page { width: 794px; min-height: 1123px; padding: 40px 50px; font-family: 'Tiro Bangla', serif !important; color: #000; background: #fff; }
            .main-header { text-align: center; margin-bottom: 30px; }
            .main-header h1 { font-size: 32px; margin: 0; font-family: Arial !important; font-weight: bold; }
            .main-header h2 { font-size: 16px; margin: 5px 0; border: 1px solid #000; display: inline-block; padding: 2px 15px; border-radius: 20px; }
            .date-bar { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 15px; font-size: 12px; }
            .transaction-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
            .transaction-table th, .transaction-table td { border: 1px solid #000; padding: 6px 4px; font-size: 11px; text-align: center; }
            .transaction-table th { background: #f2f2f2; font-weight: bold; }
            .col-customer, .col-description { text-align: left !important; padding-left: 8px !important; }
            .col-money, .col-balance { text-align: right !important; padding-right: 8px !important; }
            .total-row { font-weight: bold; background: #eee; }
            .sig-container { margin-top: 60px; display: flex; justify-content: flex-end; }
            .sig-box { width: 200px; border-top: 1px solid #000; text-align: center; font-size: 12px; padding-top: 5px; }
        `;

        let renderHost = document.createElement('div');
        renderHost.style.position = 'fixed'; renderHost.style.left = '-10000px';
        renderHost.innerHTML = `<style>${css}</style>${elementHTML}`;
        document.body.appendChild(renderHost);

        const opt = {
            margin: 0, filename: `Mousumi_Report_${startDate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(renderHost).save();
        document.body.removeChild(renderHost);
    };

    // ৬. REPORT CENTER UI INITIALIZATION
    const initReportUI = () => {
        const container = document.getElementById('cust-reports-section');
        if (!container) return;

        container.innerHTML = `
        <div style="background:#fff; border-radius:12px; padding:25px; border:1px solid #e2e8f0; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
            <h3 style="margin-top:0; font-size:20px; font-family:'Tiro Bangla', serif;">রিপোর্ট ডাউনলোড সেন্টার</h3>
            <div style="display:flex; gap:15px; margin-bottom:20px; align-items:flex-end;">
                <div style="flex:1;">
                    <label style="display:block; margin-bottom:5px; font-weight:bold;">তারিখ নির্বাচন করুন</label>
                    <input type="date" id="rc-start" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:8px;">
                </div>
                <button id="rc-download-btn" style="background:#2176ff; color:#fff; border:none; padding:12px 30px; border-radius:8px; font-weight:700; cursor:pointer;">PDF ডাউনলোড করুন</button>
            </div>
        </div>`;

        document.getElementById('rc-start').value = new Date().toISOString().split('T')[0];

        document.getElementById('rc-download-btn').onclick = async () => {
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

            await generateMousumiPDF(reportData, start);
        };
    };

    setTimeout(initReportUI, 2000);
})();
