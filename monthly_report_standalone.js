/**
 * Mousumi Computer ERP - Monthly Report Standalone Plugin
 * এটি অটোমেটিক ড্রপডাউন খুঁজে "Monthly Financial Statement" যোগ করবে।
 */

(function() {
    // ১. ড্রপডাউনে অপশনটি ইনজেক্ট করার ফাংশন
    function injectMonthlyOption() {
        // সিস্টেমে থাকা সব ড্রপডাউন (select) চেক করা
        const allSelects = document.querySelectorAll('select');
        let reportDropdown = null;

        allSelects.forEach(select => {
            // ড্রপডাউনের ভেতরে যদি Daily Closing কথাটি থাকে তবে সেটিই আমাদের টার্গেট
            if (select.innerText.includes('Daily Closing')) {
                reportDropdown = select;
            }
        });

        // যদি ড্রপডাউন পাওয়া যায় এবং আমাদের অপশনটি আগে থেকে না থাকে
        if (reportDropdown && !document.getElementById('monthly-stat-opt')) {
            const opt = document.createElement('option');
            opt.id = 'monthly-stat-opt';
            opt.value = 'monthly_financial_report';
            opt.innerText = 'Monthly Financial Statement (মাসিক আর্থিক বিবরণী)';
            reportDropdown.appendChild(opt);
            console.log("Monthly Report Option Added!");
        }
    }

    // ২. মাসিক লাভ-ক্ষতি ক্যালকুলেশন লজিক
    window.runMonthlyReportLogic = function() {
        const closings = window.dailyClosingReports || [];
        // তারিখ ইনপুট ফিল্ড খুঁজে বের করা
        const dateInput = document.querySelector('input[type="date"]');
        
        if (!dateInput || !dateInput.value) {
            alert("দয়া করে তারিখ নির্বাচন করুন!");
            return;
        }

        const selectedDate = new Date(dateInput.value);
        const targetMonth = selectedDate.getMonth();
        const targetYear = selectedDate.getFullYear();

        // নির্বাচিত মাসের ডাটা ফিল্টার করা
        const monthlyClosings = closings.filter(r => {
            const d = new Date(r.report_date);
            return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });

        if (monthlyClosings.length === 0) {
            alert("নির্বাচিত মাসের কোনো ক্লোজিং ডাটা পাওয়া যায়নি!");
            return;
        }

        // তারিখ অনুযায়ী সাজানো
        monthlyClosings.sort((a, b) => a.report_date.localeCompare(b.report_date));

        let totalPelam = 0, totalDilam = 0, totalProfit = 0;
        const openingBal = monthlyClosings[0].opening_capital || 0;
        const finalAsset = monthlyClosings[monthlyClosings.length - 1].actual_closing || 0;

        monthlyClosings.forEach(r => {
            totalPelam += parseFloat(r.total_pelam) || 0;
            totalDilam += parseFloat(r.total_dilam) || 0;
            totalProfit += parseFloat(r.income) || 0;
        });

        // ৩. প্রফেশনাল রিপোর্ট ডিজাইন (আপনার ১নং ছবির মতো)
        const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
        const numFmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2 });

        const html = `
            <div id="monthly-report-wrapper" style="font-family: Arial, sans-serif; color: #000; padding: 25px; background: #fff;">
                <div style="text-align: center; border-bottom: 2px solid #333; margin-bottom: 15px; padding-bottom: 10px;">
                    <h2 style="margin: 0; font-size: 24px; color: #1e1b4b;">MOUSUMI COMPUTER</h2>
                    <p style="margin: 5px 0; font-weight: bold; font-size: 15px;">MONTHLY FINANCIAL STATEMENT</p>
                    <p style="margin: 0; font-size: 13px;">মাস: ${months[targetMonth]} - ${targetYear}</p>
                </div>

                <div style="border: 1px solid #000; margin-top: 10px;">
                    <div style="background: #f1f5f9; padding: 8px; font-weight: bold; border-bottom: 1px solid #000; font-size: 13px;">MONTHLY CASH RECONCILIATION</div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f8fafc; font-weight: bold; font-size: 12px;">
                            <td style="border: 1px solid #000; padding: 10px;">DESCRIPTION</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: right;">AMOUNT (৳)</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">Opening Capital (মাসের শুরুতে পুঁজি)</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right;">৳ ${numFmt(openingBal)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">(+) Total Cash Collection (সারা মাসে মোট আদায়)</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #10b981;">৳ ${numFmt(totalPelam)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px; font-size: 12px;">(-) Total Sales/Credit (সারা মাসে মোট প্রদান)</td>
                            <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #ef4444;">৳ ${numFmt(totalDilam)}</td>
                        </tr>
                        <tr style="font-weight: bold; background: #f8fafc;">
                            <td style="border: 1px solid #000; padding: 10px; font-size: 12px;">Actual Closing Assets (মাসের শেষে মোট নগদ সম্পদ)</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: right;">৳ ${numFmt(finalAsset)}</td>
                        </tr>
                        <tr style="font-weight: bold; background: #e2e8f0; font-size: 15px;">
                            <td style="border: 1px solid #000; padding: 12px;">NET PROFIT OF THE MONTH (মাসিক নিট লাভ)</td>
                            <td style="border: 1px solid #000; padding: 12px; text-align: right;">৳ ${numFmt(totalProfit)}</td>
                        </tr>
                    </table>
                </div>
                <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
                    Generated by Mousumi Computer ERP - ${new Date().toLocaleString()}
                </div>
            </div>
        `;

        // প্রিভিউ এরিয়াতে ডাটা দেখানো
        const previewDiv = document.getElementById('printable-closing-report') || 
                           document.getElementById('report-preview-area');
        if (previewDiv) {
            previewDiv.innerHTML = html;
            if(window.showToast) window.showToast("Monthly Report Generated!", "success");
        }
    };

    // ৪. জেনারেট বাটনের সাথে লজিক হুক করা
    function hookGenerateButton() {
        const btns = document.querySelectorAll('button');
        btns.forEach(btn => {
            if (btn.innerText.includes('Generate Preview')) {
                btn.addEventListener('click', function(e) {
                    const sel = document.querySelector('select');
                    if (sel && sel.value === 'monthly_financial_report') {
                        e.stopImmediatePropagation(); // মূল কোডের ইভেন্ট বন্ধ করা
                        window.runMonthlyReportLogic();
                    }
                }, true); // Use capture to run before original event
            }
        });
    }

    // ৫. অটো-রান
    setInterval(injectMonthlyOption, 2000); // ২ সেকেন্ড পর পর চেক করবে
    setTimeout(hookGenerateButton, 3000);   // ৩ সেকেন্ড পর বাটনে হুক করবে

})();
