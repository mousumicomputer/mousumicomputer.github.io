/**
 * Mousumi Computer ERP - Monthly Report Plugin
 * মূল ফাইলে হাত না দিয়ে এটি ড্রপডাউনে অপশন যোগ করবে এবং রিপোর্ট তৈরি করবে।
 */

(function() {
    // ১. সিস্টেমে নতুন অপশন ইনজেক্ট করা (মূল কোড স্পর্শ না করে)
    function injectMonthlyOption() {
        // আপনার সিস্টেমে রিপোর্ট টাইপ ড্রপডাউনটি খুঁজে বের করা
        const reportSelect = document.querySelector('select[id*="Type"]') || 
                           document.querySelector('select:has(option[value*="Customer"])') ||
                           document.getElementById('txType'); // এখানে আপনার ড্রপডাউনের আইডি দিতে পারেন

        if (reportSelect && !document.getElementById('opt-monthly')) {
            const opt = document.createElement('option');
            opt.id = 'opt-monthly';
            opt.value = 'monthly_summary_report';
            opt.innerText = 'Monthly Summary Report (মাসিক লাভ-ক্ষতি)';
            reportSelect.appendChild(opt);
            console.log("Monthly Report Option Injected Successfully!");
        }
    }

    // ২. রিপোর্ট জেনারেশন লজিক
    window.generateMonthlySummary = function() {
        // ডাটা সোর্স (মূল কোড থেকে গ্লোবাল ডাটা নেওয়া)
        const closings = window.dailyClosingReports || [];
        const fromDateVal = document.querySelector('input[type="date"]').value; 

        if (!fromDateVal) {
            alert("দয়া করে একটি তারিখ সিলেক্ট করুন!");
            return;
        }

        const dateObj = new Date(fromDateVal);
        const targetMonth = dateObj.getMonth(); // 0-11
        const targetYear = dateObj.getFullYear();

        // নির্দিষ্ট মাসের ডাটা ফিল্টার
        const monthData = closings.filter(r => {
            const d = new Date(r.report_date);
            return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });

        if (monthData.length === 0) {
            alert("নির্বাচিত মাসের কোনো ক্লোজিং ডাটা পাওয়া যায়নি!");
            return;
        }

        // ছোট থেকে বড় তারিখ অনুযায়ী সাজানো
        monthData.sort((a, b) => a.report_date.localeCompare(b.report_date));

        let totalIncome = 0, totalInflow = 0, totalOutflow = 0;
        let openingCap = monthData[0].opening_capital;
        let closingCap = monthData[monthData.length - 1].actual_closing;

        monthData.forEach(r => {
            totalIncome += parseFloat(r.income) || 0;
            totalInflow += parseFloat(r.total_pelam) || 0;
            totalOutflow += parseFloat(r.total_dilam) || 0;
        });

        // ৩. রিপোর্ট টেম্পলেট (আপনার ERP স্টাইলে)
        const monthNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
        const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

        const html = `
            <div id="monthly-report-print" style="font-family: Arial, sans-serif; color: #000; padding: 30px; background: #fff;">
                <div style="text-align: center; border-bottom: 2px solid #000; margin-bottom: 15px; padding-bottom: 10px;">
                    <h2 style="margin: 0; font-size: 22px;">MOUSUMI COMPUTER</h2>
                    <p style="margin: 5px 0; font-weight: bold;">MONTHLY FINANCIAL SUMMARY</p>
                    <p style="margin: 0; font-size: 14px;">Month: ${monthNames[targetMonth]} - ${targetYear}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-top: 20px; border: 1px solid #000;">
                    <tr style="background: #f2f2f2; font-weight: bold;">
                        <td style="border: 1px solid #000; padding: 10px;">DESCRIPTION</td>
                        <td style="border: 1px solid #000; padding: 10px; text-align: right;">AMOUNT (৳)</td>
                    </tr>
                    <tr><td style="border: 1px solid #000; padding: 8px;">Opening Capital (Start of Month)</td><td style="border: 1px solid #000; padding: 8px; text-align: right;">৳ ${fmt(openingCap)}</td></tr>
                    <tr><td style="border: 1px solid #000; padding: 8px;">Total Monthly Cash Collection (+)</td><td style="border: 1px solid #000; padding: 8px; text-align: right;">৳ ${fmt(totalInflow)}</td></tr>
                    <tr><td style="border: 1px solid #000; padding: 8px;">Total Monthly Credit/Sales (-)</td><td style="border: 1px solid #000; padding: 8px; text-align: right;">(৳ ${fmt(totalOutflow)})</td></tr>
                    <tr style="font-weight: bold;"><td style="border: 1px solid #000; padding: 8px;">Current Total Asset (End of Month)</td><td style="border: 1px solid #000; padding: 8px; text-align: right;">৳ ${fmt(closingCap)}</td></tr>
                    <tr style="background: #e9ecef; font-weight: bold; font-size: 16px;">
                        <td style="border: 1px solid #000; padding: 12px;">NET PROFIT / INCOME OF THE MONTH</td>
                        <td style="border: 1px solid #000; padding: 12px; text-align: right; color: ${totalIncome >= 0 ? 'green' : 'red'};">৳ ${fmt(totalIncome)}</td>
                    </tr>
                </table>
                <div style="margin-top: 40px; text-align: center; font-size: 10px;">Report Generated: ${new Date().toLocaleString()}</div>
            </div>
        `;

        // প্রিভিউ এরিয়াতে ডাটা পাঠানো
        const previewDiv = document.getElementById('printable-closing-report') || 
                          document.getElementById('report-preview-area');
        if(previewDiv) {
            previewDiv.innerHTML = html;
            window.showToast("Monthly Report Generated!", "success");
        }
    };

    // ৪. বাটন ক্লিক ইন্টারসেপ্টর
    function hookGenerateButton() {
        const genBtn = document.querySelector('button[onclick*="Preview"]') || 
                      document.querySelector('button.mc-btn-primary');
        
        if (genBtn) {
            const originalClick = genBtn.onclick;
            genBtn.onclick = function(e) {
                const select = document.querySelector('select[id*="Type"]') || document.querySelector('select');
                if (select && select.value === 'monthly_summary_report') {
                    window.generateMonthlySummary();
                } else if (originalClick) {
                    originalClick.apply(this, arguments);
                }
            };
        }
    }

    // ৫. অটো-রান ফাংশন
    setInterval(injectMonthlyOption, 2000); // নতুন এলিমেন্ট আসলে ২ সেকেন্ড পর পর চেক করবে
    setTimeout(hookGenerateButton, 3000); // বাটন লোড হতে সময় দিলে ৩ সেকেন্ড পর হুক করবে

})();
