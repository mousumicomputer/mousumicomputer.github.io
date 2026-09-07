/**
 * Mousumi Computer - Zero Flicker Transaction Report Addon
 */
(function() {
    // ১. বাংলা সংখ্যা ও টাকার ফরম্যাটার
    function toBnNum(num) {
        if (num === null || num === undefined) return '';
        const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return num.toString().replace(/\d/g, d => bnDigits[d]);
    }

    function formatBnAmount(amount) {
        const n = parseFloat(amount) || 0;
        const parts = n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split('.');
        return toBnNum(parts[0]) + '.' + toBnNum(parts[1]);
    }

    function formatBnDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return toBnNum(dateStr);
        const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
        const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
        return `${toBnNum(d.getDate())} ${months[d.getMonth()]} ${toBnNum(d.getFullYear())} (${days[d.getDay()]})`;
    }

    // ২. তাৎক্ষণিক রিপোর্ট রেন্ডারার (কোনো বিলম্ব ছাড়া)
    window.renderInstantModernTransactionReport = function(fromDate, toDate) {
        const allTxs = window.customerTransactions || [];
        const allCusts = window.customers || [];

        // ফিল্টারিং
        const txList = allTxs.filter(t => {
            if (!t.date) return false;
            return t.date >= fromDate && t.date <= toDate;
        }).sort((a, b) => (a.date + ' ' + (a.time || '')).localeCompare(b.date + ' ' + (b.time || '')));

        const dateHeading = (fromDate === toDate) 
            ? formatBnDate(fromDate) 
            : `${formatBnDate(fromDate)} হতে ${formatBnDate(toDate)}`;

        let totalPelam = 0, totalDilam = 0, totalKhoroch = 0;
        let rowsHtml = '';

        if (txList.length === 0) {
            rowsHtml = `<tr><td colspan="7" style="border:1px solid #334155; text-align:center; padding: 12px; color: #64748b;">এই তারিখে কোনো লেনদেনের রেকর্ড পাওয়া যায়নি।</td></tr>`;
        } else {
            txList.forEach((t, index) => {
                const cust = allCusts.find(c => c.id === t.customerId);
                const custName = cust ? cust.name : (t.customerName || 'সাধারণ কাস্টমার');
                const desc = t.description || 'লেনদেন';

                // ব্যয় বা খরচ যাচাই
                const isExpense = custName.includes('দোকানের ব্যয়') || 
                                  custName.includes('খরচ') || 
                                  desc.includes('দোকানের ব্যয়') || 
                                  desc.includes('খরচ');

                let pelamVal = '-', dilamVal = '-', khorochVal = '-';
                const debit = parseFloat(t.debit) || 0;
                const credit = parseFloat(t.credit) || 0;

                if (isExpense) {
                    const expAmount = debit > 0 ? debit : credit;
                    totalKhoroch += expAmount;
                    khorochVal = formatBnAmount(expAmount);
                } else if (credit > 0 || t.type === 'Credit') {
                    totalPelam += credit;
                    pelamVal = formatBnAmount(credit);
                } else if (debit > 0 || t.type === 'Debit') {
                    totalDilam += debit;
                    dilamVal = formatBnAmount(debit);
                }

                rowsHtml += `
                    <tr>
                        <td style="border: 1px solid #334155; padding: 4px 7px; text-align: center;">${toBnNum(index + 1)}।</td>
                        <td style="border: 1px solid #334155; padding: 4px 7px; text-align: center;">${t.time || '-'}</td>
                        <td style="border: 1px solid #334155; padding: 4px 7px; text-align: left;">${custName}</td>
                        <td style="border: 1px solid #334155; padding: 4px 7px; text-align: left;">${desc}</td>
                        <td style="border: 1px solid #334155; padding: 4px 7px; text-align: right;">${pelamVal}</td>
                        <td style="border: 1px solid #334155; padding: 4px 7px; text-align: right;">${dilamVal}</td>
                        <td style="border: 1px solid #334155; padding: 4px 7px; text-align: right;">${khorochVal}</td>
                    </tr>
                `;
            });
        }

        const reportHtml = `
        <div id="printable-modern-report" style="max-width: 850px; margin: 0 auto; background: #ffffff; padding: 25px 30px; border: 1px solid #cbd5e1; font-family: 'Tiro Bangla', Arial, sans-serif; color: #0f172a;">
            <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px;">
                <h1 style="font-size: 22px; font-weight: 700; text-transform: uppercase; margin: 0;">MOUSUMI COMPUTER</h1>
                <div style="font-size: 15px; font-weight: 600; margin-top: 2px; color: #334155;">দৈনিক পূর্ণাঙ্গ লেনদেন রিপোর্ট</div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 12px; padding: 4px 0; border-bottom: 1px dashed #94a3b8;">
                <span>তারিখ: ${dateHeading}</span>
                <span>মোট লেনদেন: ${toBnNum(txList.length)} টি</span>
            </div>

            <table style="width: 100%; border: 1.5px solid #0f172a; border-collapse: collapse; margin-bottom: 14px;">
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="width: 33.33%; padding: 5px 8px; font-size: 13.5px; border: 1px solid #cbd5e1; text-align: center; font-weight: 600;">মোট আদায় (পেলাম)</th>
                        <th style="width: 33.33%; padding: 5px 8px; font-size: 13.5px; border: 1px solid #cbd5e1; text-align: center; font-weight: 600;">মোট বাকী বিক্রয় (দিলাম)</th>
                        <th style="width: 33.33%; padding: 5px 8px; font-size: 13.5px; border: 1px solid #cbd5e1; text-align: center; font-weight: 600;">মোট দোকানের খরচ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="padding: 6px 8px; font-size: 16px; font-weight: 700; border: 1px solid #cbd5e1; text-align: center;">${formatBnAmount(totalPelam)}</td>
                        <td style="padding: 6px 8px; font-size: 16px; font-weight: 700; border: 1px solid #cbd5e1; text-align: center;">${formatBnAmount(totalDilam)}</td>
                        <td style="padding: 6px 8px; font-size: 16px; font-weight: 700; border: 1px solid #cbd5e1; text-align: center;">${formatBnAmount(totalKhoroch)}</td>
                    </tr>
                </tbody>
            </table>

            <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; margin-bottom: 20px;">
                <thead>
                    <tr style="background: #f1f5f9; color: #0f172a;">
                        <th style="border: 1px solid #334155; padding: 4px 7px; width: 6%; text-align: center; font-weight: 600;">ক্রমিক</th>
                        <th style="border: 1px solid #334155; padding: 4px 7px; width: 12%; text-align: center; font-weight: 600;">সময়</th>
                        <th style="border: 1px solid #334155; padding: 4px 7px; width: 26%; text-align: left; font-weight: 600;">কাস্টমার / খাত</th>
                        <th style="border: 1px solid #334155; padding: 4px 7px; width: 26%; text-align: left; font-weight: 600;">বিবরণ ও মাধ্যম</th>
                        <th style="border: 1px solid #334155; padding: 4px 7px; width: 10%; text-align: right; font-weight: 600;">পেলাম</th>
                        <th style="border: 1px solid #334155; padding: 4px 7px; width: 10%; text-align: right; font-weight: 600;">দিলাম</th>
                        <th style="border: 1px solid #334155; padding: 4px 7px; width: 10%; text-align: right; font-weight: 600;">খরচ</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                    <tr style="font-weight: 700; background: #f8fafc; border-top: 1.5px solid #0f172a; font-size: 14px;">
                        <td colspan="4" style="border: 1px solid #334155; padding: 6px 7px; text-align: right;">উপ-মোট (Sub Total):</td>
                        <td style="border: 1px solid #334155; padding: 6px 7px; text-align: right;">${formatBnAmount(totalPelam)}</td>
                        <td style="border: 1px solid #334155; padding: 6px 7px; text-align: right;">${formatBnAmount(totalDilam)}</td>
                        <td style="border: 1px solid #334155; padding: 6px 7px; text-align: right;">${formatBnAmount(totalKhoroch)}</td>
                    </tr>
                </tbody>
            </table>

            <div style="display: flex; justify-content: space-between; margin-top: 35px; padding: 0 20px;">
                <div style="text-align: center; font-size: 13px; border-top: 1px solid #0f172a; padding-top: 4px; width: 150px;">প্রস্তুতকারীর স্বাক্ষর</div>
                <div style="text-align: center; font-size: 13px; border-top: 1px solid #0f172a; padding-top: 4px; width: 150px;">কর্তৃপক্ষের স্বাক্ষর</div>
            </div>
        </div>
        `;

        // নির্দিষ্ট প্রিভিউ কনটেইনারে তাত্ক্ষণিক সেট করা
        const target = document.querySelector('#printable-closing-report') || 
                       document.querySelector('.report-preview-area') || 
                       document.querySelector('#reportPreview');

        if (target) {
            target.innerHTML = reportHtml;
        }
    };

    // ৩. ক্লিকে সরাসরি ইন্টারসেপ্ট (Capture Phase-এ কাজ করবে, তাই কোনো ঝিলিক থাকবে না)
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const text = btn.innerText || '';
        if (text.includes('Generate Preview') || text.includes('প্রিভিউ')) {
            const selectEl = document.querySelector('select');
            const selectedVal = selectEl ? selectEl.value : '';

            if (selectedVal.includes('Customer Transactions') || selectedVal.includes('লেনদেনের রিপোর্ট')) {
                const dateInputs = document.querySelectorAll('input[type="date"]');
                let fDate = dateInputs[0] ? dateInputs[0].value : '';
                let tDate = dateInputs[1] ? dateInputs[1].value : fDate;

                // সরাসরি ও তাৎক্ষণিক রান হবে
                window.renderInstantModernTransactionReport(fDate, tDate);
            }
        }
    }, true); // 'true' থাকায় এটি সবার আগে এক্সিকিউট হবে
})();
