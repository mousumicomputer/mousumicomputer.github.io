/**
 * Mousumi Computer ERP - Monthly Report Standalone (Advanced Hook)
 * এটি সরাসরি ইভেন্ট লিসেনার ব্যবহার করে ড্রপডাউন এবং বাটন কন্ট্রোল করবে।
 */

(function() {
    // ১. ড্রপডাউনে অপশন ইনজেক্ট করা
    function injectMonthlyOption() {
        const select = document.querySelector('select[id*="Type"]') || 
                       Array.from(document.querySelectorAll('select')).find(s => s.innerText.includes('Daily Closing'));
        
        if (select && !document.getElementById('monthly-stat-v3')) {
            const opt = document.createElement('option');
            opt.id = 'monthly-stat-v3';
            opt.value = 'monthly_report_final';
            opt.innerText = 'Monthly Financial Statement (মাসিক আর্থিক বিবরণী)';
            select.appendChild(opt);
        }
    }

    // ২. মাসিক রিপোর্ট জেনারেশন ফাংশন
    window.renderMonthlyPreview = function() {
        const closings = window.dailyClosingReports || [];
        // স্ক্রিনশট অনুযায়ী 'From Date' ইনপুট খুঁজে নেওয়া
        const fromDateInput = document.querySelectorAll('input[type="date"]')[0]; 
        
        if (!fromDateInput || !fromDateInput.value) {
            alert("দয়া করে একটি শুরু তারিখ (From Date) নির্বাচন করুন!");
            return;
        }

        const date = new Date(fromDateInput.value);
        const m = date.getMonth();
        const y = date.getFullYear();

        const filtered = closings.filter(r => {
            const rd = new Date(r.report_date);
            return rd.getMonth() === m && rd.getFullYear() === y;
        });

        if (filtered.length === 0) {
            alert("দুঃখিত, এই মাসের জন্য কোনো ক্লোজিং ডাটা খুঁজে পাওয়া যায়নি!");
            return;
        }

        filtered.sort((a, b) => a.report_date.localeCompare(b.report_date));

        let tPelam = 0, tDilam = 0, tProfit = 0;
        const opening = filtered[0].opening_capital || 0;
        const closing = filtered[filtered.length - 1].actual_closing || 0;

        filtered.forEach(r => {
            tPelam += parseFloat(r.total_pelam) || 0;
            tDilam += parseFloat(r.total_dilam) || 0;
            tProfit += parseFloat(r.income) || 0;
        });

        const mNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
        const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2 });

        const html = `
            <div id="monthly-report-output" style="font-family: 'Arial', sans-serif; padding: 30px; background: #fff; color: #000; line-height: 1.5;">
                <div style="text-align: center; border-bottom: 2.5px solid #000; margin-bottom: 20px; padding-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 26px; text-transform: uppercase;">Mousumi Computer</h2>
                    <p style="margin: 5px 0; font-weight: bold; font-size: 16px;">MONTHLY FINANCIAL STATEMENT</p>
                    <p style="margin: 0; font-size: 14px;">মাস: ${mNames[m]} - ${y}</p>
                </div>

                <div style="border: 1.5px solid #000;">
                    <div style="background: #f1f5f9; padding: 10px; font-weight: bold; border-bottom: 1.5px solid #000; font-size: 14px;">CAPITAL & CASH RECONCILIATION</div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f8fafc; font-weight: bold;">
                            <td style="border: 1px solid #000; padding: 12px; font-size: 13px;">DESCRIPTION</td>
                            <td style="border: 1px solid #000; padding: 12px; text-align: right; font-size: 13px;">AMOUNT (৳)</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 10px;">Opening Capital (মাসের শুরুতে মোট পুঁজি)</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: right;">৳ ${fmt(opening)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 10px;">Total Monthly Collection (মোট নগদ আদায়)</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: right; color: #10b981; font-weight: bold;">৳ ${fmt(tPelam)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 10px;">Total Monthly Credit/Sales (মোট প্রদান/বাকি)</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: right; color: #ef4444; font-weight: bold;">৳ ${fmt(tDilam)}</td>
                        </tr>
                        <tr style="background: #f8fafc; font-weight: bold;">
                            <td style="border: 1px solid #000; padding: 10px;">Actual Closing Assets (মাসের শেষে মোট নগদ সম্পদ)</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: right;">৳ ${fmt(closing)}</td>
                        </tr>
                        <tr style="background: #e2e8f0; font-weight: 900; font-size: 16px;">
                            <td style="border: 1px solid #000; padding: 15px;">NET MONTHLY PROFIT (পুরো মাসের নিট লাভ)</td>
                            <td style="border: 1px solid #000; padding: 15px; text-align: right;">৳ ${fmt(tProfit)}</td>
                        </tr>
                    </table>
                </div>
                <p style="text-align: center; margin-top: 30px; font-size: 11px; color: #666;">Generated on: ${new Date().toLocaleString()}</p>
            </div>
        `;

        // রিপোর্টটি প্রিভিউ এরিয়াতে বসানো
        const previewBox = document.getElementById('printable-closing-report') || 
                           document.querySelector('.report-preview-area') || 
                           document.querySelector('[id*="preview"]');
                           
        if (previewBox) {
            previewBox.innerHTML = html;
            previewBox.style.display = 'block';
            window.scrollTo({ top: previewBox.offsetTop - 100, behavior: 'smooth' });
        }
    };

    // ৩. গ্লোবাল বাটন ক্লিক লিসেনার (সবচেয়ে কার্যকর পদ্ধতি)
    document.addEventListener('click', function(e) {
        // যদি ক্লিক করা এলিমেন্ট 'Generate Preview' বাটন হয়
        if (e.target && (e.target.innerText.includes('Generate Preview') || e.target.closest('button')?.innerText.includes('Generate Preview'))) {
            const select = document.querySelector('select[id*="Type"]') || 
                           Array.from(document.querySelectorAll('select')).find(s => s.innerText.includes('Daily Closing'));
            
            if (select && select.value === 'monthly_report_final') {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.renderMonthlyPreview();
            }
        }
    }, true); // true মানে এটি অন্য সব ইভেন্টের আগে কাজ করবে

    // ৪. অটো ইনজেকশন রান করা
    setInterval(injectMonthlyOption, 2000);

})();
