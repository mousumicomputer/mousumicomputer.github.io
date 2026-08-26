/**
 * Mousumi Computer ERP - Monthly Financial Statement (Final Fixed Engine)
 * প্রিভিউ এরিয়া নিখুঁতভাবে শনাক্ত এবং ১ ক্লিকে রিপোর্ট জেনারেশন।
 */

(function () {
    // ১. ড্রপডাউনে অপশন যুক্ত রাখা
    function ensureMonthlyOption() {
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            const hasOption = Array.from(select.options).some(o => o.value === 'monthly_report_final');
            if (!hasOption) {
                // রিপোর্ট টাইপ সিলেক্ট বক্স কিনা নিশ্চিত করা
                const isReportBox = Array.from(select.options).some(o => 
                    o.text.includes('Daily Closing') || 
                    o.text.includes('আর্থিক বিবরণী') || 
                    o.text.includes('Transactions')
                );
                if (isReportBox) {
                    const opt = document.createElement('option');
                    opt.value = 'monthly_report_final';
                    opt.text = 'Monthly Financial Statement (মাসিক আর্থিক বিবরণী)';
                    opt.style.fontWeight = 'bold';
                    opt.style.color = '#4f46e5';
                    select.appendChild(opt);
                }
            }
        });
    }

    // ২. ফিল্টার করা ডাটা এবং নির্বাচিত মাস সংগ্রহ
    function getReportDataset() {
        const closings = window.dailyClosingReports || 
                         (window.getERPStore ? window.getERPStore().dailyClosingReports : []) || [];

        // তারিখ ইনপুটগুলো থেকে মান নেওয়া
        const allInputs = Array.from(document.querySelectorAll('input'));
        const dateInputs = allInputs.filter(i => i.type === 'date' || i.value.includes('-') || i.value.includes('/'));

        let fromDateVal = dateInputs[0] ? dateInputs[0].value : '';
        let toDateVal = dateInputs[1] ? dateInputs[1].value : fromDateVal;

        let targetMonth, targetYear;

        if (fromDateVal) {
            const d = new Date(fromDateVal);
            targetMonth = d.getMonth();
            targetYear = d.getFullYear();
        } else {
            const now = new Date();
            targetMonth = now.getMonth();
            targetYear = now.getFullYear();
        }

        // ওই মাস ও বছরের সব রিপোর্ট ফিল্টার করা
        let filtered = closings.filter(r => {
            if (!r.report_date) return false;
            const rd = new Date(r.report_date);
            return rd.getMonth() === targetMonth && rd.getFullYear() === targetYear;
        });

        filtered.sort((a, b) => a.report_date.localeCompare(b.report_date));

        return { filtered, targetMonth, targetYear, allClosings: closings };
    }

    // ৩. প্রিভিউ কন্টেইনার খুঁজে পাওয়ার ফাংশন
    function findPreviewContainer() {
        // স্ক্রিনশটে থাকা "Report Ready for Generation" এরিয়া খুঁজে নেওয়া
        const allDivs = document.querySelectorAll('div');
        for (let div of allDivs) {
            if (div.innerText && div.innerText.includes('Report Ready for Generation')) {
                return div;
            }
        }
        return document.getElementById('printable-closing-report') || 
               document.getElementById('reportPreviewArea') || 
               document.querySelector('.report-main-container');
    }

    // ৪. মূল রিপোর্ট প্রিভিউ রেন্ডার করা
    window.renderMonthlyPreview = function () {
        const { filtered, targetMonth, targetYear, allClosings } = getReportDataset();
        const mNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

        const previewBox = findPreviewContainer();

        if (!previewBox) {
            alert("রিপোর্ট প্রিভিউ এরিয়া খুঁজে পাওয়া যায়নি!");
            return;
        }

        if (filtered.length === 0) {
            previewBox.innerHTML = `
                <div style="text-align: center; padding: 40px; background: #fff; border-radius: 12px; border: 1px dashed #cbd5e1;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #f59e0b; margin-bottom: 12px;"></i>
                    <h3 style="color: #1e293b; font-weight: 700; margin-bottom: 6px;">কোনো ক্লোজিং ডাটা পাওয়া যায়নি</h3>
                    <p style="color: #64748b; font-size: 0.9rem;">${mNames[targetMonth]} ${targetYear} মাসের জন্য কোনো Daily Closing সম্পন্ন করা হয়নি।</p>
                </div>
            `;
            return;
        }

        let tPelam = 0, tDilam = 0, tProfit = 0;
        const opening = parseFloat(filtered[0].opening_capital) || 0;
        const closing = parseFloat(filtered[filtered.length - 1].actual_closing) || 0;

        let dailyRows = '';
        filtered.forEach(r => {
            const p = parseFloat(r.total_pelam) || 0;
            const d = parseFloat(r.total_dilam) || 0;
            const inc = parseFloat(r.income) || 0;

            tPelam += p;
            tDilam += d;
            tProfit += inc;

            dailyRows += `
                <tr>
                    <td style="border: 1px solid #000; padding: 6px; text-align: center;">${r.report_date}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right;">৳ ${(parseFloat(r.opening_capital) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #16a34a; font-weight: 600;">৳ ${p.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right; color: #dc2626; font-weight: 600;">৳ ${d.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold;">৳ ${(parseFloat(r.actual_closing) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #000; padding: 6px; text-align: right; font-weight: bold; color: ${inc >= 0 ? '#16a34a' : '#dc2626'};">৳ ${inc.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        });

        const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2 });

        const html = `
            <div id="monthly-statement-capture" style="font-family: Arial, Helvetica, sans-serif; padding: 25px; background: #ffffff; color: #000; border-radius: 12px; border: 1.5px solid #000; margin-top: 15px;">
                <div style="text-align: center; border-bottom: 2px solid #000; margin-bottom: 20px; padding-bottom: 12px;">
                    <h2 style="margin: 0; font-size: 24px; text-transform: uppercase; color: #000;">Mousumi Computer</h2>
                    <p style="margin: 4px 0; font-weight: bold; font-size: 15px;">MONTHLY FINANCIAL STATEMENT (মাসিক আর্থিক বিবরণী)</p>
                    <p style="margin: 0; font-size: 13px;">মাস: <strong>${mNames[targetMonth]} - ${targetYear}</strong> | মোট ক্লোজিং দিন: <strong>${filtered.length} দিন</strong></p>
                </div>

                <!-- ১. মূলধন ও নগদ সমন্বয় -->
                <div style="border: 1.5px solid #000; margin-bottom: 20px;">
                    <div style="background: #f1f5f9; padding: 8px 12px; font-weight: bold; border-bottom: 1.5px solid #000; font-size: 13px;">১. মূলধন ও নগদ আদায়-প্রদান সারসংক্ষেপ (CAPITAL & CASH RECONCILIATION)</div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                        <tr style="background: #f8fafc; font-weight: bold;">
                            <td style="border: 1px solid #000; padding: 10px;">বিবরণ (DESCRIPTION)</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: right;">পরিমাণ (AMOUNT ৳)</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px 10px;">মাসের প্রারম্ভিক মোট পুঁজি (Opening Capital)</td>
                            <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; font-weight: bold;">৳ ${fmt(opening)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px 10px;">পুরো মাসের মোট নগদ আদায় (Total Monthly Pelam / Collection)</td>
                            <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; color: #16a34a; font-weight: bold;">৳ ${fmt(tPelam)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px 10px;">পুরো মাসের মোট প্রদান/বাকি (Total Monthly Dilam / Sales)</td>
                            <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; color: #dc2626; font-weight: bold;">৳ ${fmt(tDilam)}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                            <td style="border: 1px solid #000; padding: 8px 10px; font-weight: bold;">মাসের সমাপনী মোট সম্পদ (Actual Closing Assets)</td>
                            <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; font-weight: bold; color: #4f46e5;">৳ ${fmt(closing)}</td>
                        </tr>
                        <tr style="background: #e2e8f0; font-weight: 900; font-size: 15px;">
                            <td style="border: 1px solid #000; padding: 12px 10px;">পুরো মাসের নিট লাভ (NET MONTHLY PROFIT)</td>
                            <td style="border: 1px solid #000; padding: 12px 10px; text-align: right; color: #000;">৳ ${fmt(tProfit)}</td>
                        </tr>
                    </table>
                </div>

                <!-- ২. দৈনিক ক্লোজিং তালিকা -->
                <div style="border: 1.5px solid #000;">
                    <div style="background: #f1f5f9; padding: 8px 12px; font-weight: bold; border-bottom: 1.5px solid #000; font-size: 13px;">২. দৈনিক ক্লোজিং তালিকা (DAILY BREAKDOWN)</div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: #f8fafc; font-weight: bold;">
                                <th style="border: 1px solid #000; padding: 6px;">তারিখ</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Opening</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Pelam (+)</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Dilam (-)</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Actual Closing</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Daily Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dailyRows}
                        </tbody>
                    </table>
                </div>

                <p style="text-align: center; margin-top: 20px; font-size: 11px; color: #64748b;">Generated on: ${new Date().toLocaleString()} | Mousumi Computer ERP</p>
            </div>
        `;

        previewBox.innerHTML = html;
        previewBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // ৫. PDF ডাউনলোড
    window.downloadMonthlyPDF = function () {
        window.renderMonthlyPreview();
        setTimeout(() => {
            const el = document.getElementById('monthly-statement-capture');
            if (!el) return;
            const { targetMonth, targetYear } = getReportDataset();
            const opt = {
                margin: 8,
                filename: `Monthly_Statement_${targetMonth + 1}_${targetYear}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(el).save();
        }, 300);
    };

    // ৬. Excel এক্সপোর্ট
    window.exportMonthlyExcel = function () {
        const { filtered, targetMonth, targetYear } = getReportDataset();
        if (filtered.length === 0) { alert("এক্সপোর্ট করার মতো কোনো ডাটা পাওয়া যায়নি!"); return; }

        const rows = [
            ["MOUSUMI COMPUTER - MONTHLY FINANCIAL STATEMENT"],
            [`Month: ${targetMonth + 1}/${targetYear}`],
            [],
            ["Date", "Opening Capital", "Total Pelam", "Total Dilam", "Actual Closing", "Daily Profit"]
        ];

        filtered.forEach(r => {
            rows.push([
                r.report_date,
                parseFloat(r.opening_capital) || 0,
                parseFloat(r.total_pelam) || 0,
                parseFloat(r.total_dilam) || 0,
                parseFloat(r.actual_closing) || 0,
                parseFloat(r.income) || 0
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Monthly Statement");
        XLSX.writeFile(wb, `Monthly_Statement_${targetMonth + 1}_${targetYear}.xlsx`);
    };

    // ৭. নিখুঁত বাটন ক্লিক হ্যান্ডলার
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const btnText = (btn.innerText || '').toLowerCase();
        
        // বর্তমান ড্রপডাউন সিলেক্ট করা কিনা চেক করা
        const currentSelect = Array.from(document.querySelectorAll('select')).find(s => 
            s.value === 'monthly_report_final' || 
            (s.options[s.selectedIndex] && s.options[s.selectedIndex].text.includes('Monthly Financial Statement'))
        );

        if (currentSelect) {
            if (btnText.includes('generate preview')) {
                e.preventDefault();
                e.stopPropagation();
                window.renderMonthlyPreview();
            } else if (btnText.includes('download pdf')) {
                e.preventDefault();
                e.stopPropagation();
                window.downloadMonthlyPDF();
            } else if (btnText.includes('export excel')) {
                e.preventDefault();
                e.stopPropagation();
                window.exportMonthlyExcel();
            }
        }
    }, true);

    // ৮. স্বয়ংক্রিয়ভাবে ড্রপডাউন পর্যবেক্ষণ
    setInterval(ensureMonthlyOption, 500);
})();
