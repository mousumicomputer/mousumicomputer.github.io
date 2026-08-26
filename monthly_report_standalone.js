/**
 * Mousumi Computer ERP - Monthly Financial Statement (Scoped Preview Fixed)
 * ফুল পেজ ওভাররাইট বন্ধ করে নির্দিষ্ট প্রিভিউ বক্সে রিপোর্ট প্রদর্শন।
 */

(function () {
    // ১. ড্রপডাউনে অপশন নিশ্চিত করা
    function ensureMonthlyOption() {
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            const hasOption = Array.from(select.options).some(o => o.value === 'monthly_report_final');
            if (!hasOption) {
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

    // ২. ফিল্টার করা ডাটা সংগ্রহ
    function getReportDataset() {
        const closings = window.dailyClosingReports || 
                         (window.getERPStore ? window.getERPStore().dailyClosingReports : []) || [];

        const allInputs = Array.from(document.querySelectorAll('input'));
        const dateInputs = allInputs.filter(i => i.type === 'date' || (i.value && (i.value.includes('-') || i.value.includes('/'))));

        let fromDateVal = dateInputs[0] ? dateInputs[0].value : '';

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

        let filtered = closings.filter(r => {
            if (!r.report_date) return false;
            const rd = new Date(r.report_date);
            return rd.getMonth() === targetMonth && rd.getFullYear() === targetYear;
        });

        filtered.sort((a, b) => a.report_date.localeCompare(b.report_date));

        return { filtered, targetMonth, targetYear };
    }

    // ৩. শুধুমাত্র নিচের নির্দিষ্ট প্রিভিউ বক্স খুঁজে বের করার নিখুঁত লজিক
    function getExactPreviewBox() {
        // বাটনের নিচের নির্দিষ্ট কার্ড/বক্স খোঁজা (যাতে উপরের ফিল্টার মুছে না যায়)
        const generateBtn = Array.from(document.querySelectorAll('button')).find(b => 
            (b.innerText || '').toLowerCase().includes('generate preview')
        );

        if (generateBtn) {
            // বাটন যেখানে আছে তার পরের কন্টেইনার বা কার্ড
            const parentCard = generateBtn.closest('.erp-form-card') || 
                               generateBtn.closest('.mc-form-card') || 
                               generateBtn.closest('.report-download-filter-card') || 
                               generateBtn.parentElement.parentElement;

            if (parentCard && parentCard.nextElementSibling) {
                return parentCard.nextElementSibling;
            }
        }

        // বিকল্প: নির্দিষ্ট আইডি চেক করা
        return document.getElementById('reportPreviewContainer') || 
               document.getElementById('reportPreviewArea') || 
               document.getElementById('printable-closing-report');
    }

    // ৪. প্রিভিউ রেন্ডার করা
    window.renderMonthlyPreview = function () {
        const { filtered, targetMonth, targetYear } = getReportDataset();
        const mNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

        const previewBox = getExactPreviewBox();

        if (!previewBox) {
            alert("প্রিভিউ বক্স পাওয়া যায়নি!");
            return;
        }

        if (filtered.length === 0) {
            previewBox.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; background: #ffffff; border-radius: 16px; border: 1px dashed #cbd5e1; margin-top: 20px;">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #f59e0b; margin-bottom: 12px;"></i>
                    <h3 style="color: #1e293b; font-weight: 700; margin-bottom: 6px;">কোনো ক্লোজিং ডাটা পাওয়া যায়নি</h3>
                    <p style="color: #64748b; font-size: 0.9rem;">${mNames[targetMonth]} ${targetYear} মাসের কোনো Daily Closing হিস্ট্রি নেই।</p>
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
                    <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: center; font-weight: 600;">${r.report_date}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: right;">৳ ${(parseFloat(r.opening_capital) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: right; color: #16a34a; font-weight: 700;">৳ ${p.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: right; color: #dc2626; font-weight: 700;">৳ ${d.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: right; font-weight: 700; color: #4f46e5;">৳ ${(parseFloat(r.actual_closing) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #e2e8f0; padding: 10px; text-align: right; font-weight: 800; color: ${inc >= 0 ? '#16a34a' : '#dc2626'};">৳ ${inc.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        });

        const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2 });

        const html = `
            <div id="monthly-statement-capture" style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); margin-top: 20px;">
                
                <!-- হেডার -->
                <div style="text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 15px; margin-bottom: 25px;">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Mousumi Computer</h2>
                    <p style="margin: 5px 0; font-weight: 700; font-size: 15px; color: #4f46e5;">MONTHLY FINANCIAL STATEMENT (মাসিক আর্থিক বিবরণী)</p>
                    <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 600;">মাস: <span style="color: #0f172a; font-weight: 700;">${mNames[targetMonth]} - ${targetYear}</span> | মোট কার্যদিবস: <span style="color: #0f172a; font-weight: 700;">${filtered.length} দিন</span></p>
                </div>

                <!-- ১. মূলধন ও নগদ আদায়-প্রদান সারসংক্ষেপ -->
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 25px;">
                    <div style="background: #f8fafc; padding: 12px 18px; font-weight: 800; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
                        ১. মূলধন ও নগদ আদায়-প্রদান সারসংক্ষেপ (CAPITAL & CASH RECONCILIATION)
                    </div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
                        <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 18px; color: #475569; font-weight: 600;">মাসের প্রারম্ভিক মোট পুঁজি (Opening Capital)</td>
                            <td style="padding: 12px 18px; text-align: right; font-weight: 700; color: #0f172a;">৳ ${fmt(opening)}</td>
                        </tr>
                        <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 18px; color: #475569; font-weight: 600;">পুরো মাসের মোট নগদ আদায় (Total Monthly Pelam / Collection)</td>
                            <td style="padding: 12px 18px; text-align: right; color: #16a34a; font-weight: 700;">৳ ${fmt(tPelam)}</td>
                        </tr>
                        <tr style="background: #ffffff; border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 12px 18px; color: #475569; font-weight: 600;">পুরো মাসের মোট প্রদান/বাকি (Total Monthly Dilam / Sales)</td>
                            <td style="padding: 12px 18px; text-align: right; color: #dc2626; font-weight: 700;">৳ ${fmt(tDilam)}</td>
                        </tr>
                        <tr style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 12px 18px; color: #0f172a; font-weight: 700;">মাসের সমাপনী মোট সম্পদ (Actual Closing Assets)</td>
                            <td style="padding: 12px 18px; text-align: right; font-weight: 800; color: #4f46e5; font-size: 14px;">৳ ${fmt(closing)}</td>
                        </tr>
                        <tr style="background: #eef2ff;">
                            <td style="padding: 16px 18px; font-weight: 800; color: #1e1b4b; font-size: 14.5px;">পুরো মাসের নিট লাভ (NET MONTHLY PROFIT)</td>
                            <td style="padding: 16px 18px; text-align: right; font-weight: 900; color: #1e1b4b; font-size: 16px;">৳ ${fmt(tProfit)}</td>
                        </tr>
                    </table>
                </div>

                <!-- ২. দৈনিক ক্লোজিং তালিকা -->
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                    <div style="background: #f8fafc; padding: 12px 18px; font-weight: 800; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">
                        ২. দৈনিক ক্লোজিং তালিকা (DAILY BREAKDOWN)
                    </div>
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 12.5px;">
                            <thead>
                                <tr style="background: #f1f5f9; color: #475569; font-weight: 700;">
                                    <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: center;">তারিখ</th>
                                    <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: right;">Opening</th>
                                    <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: right;">Pelam (+)</th>
                                    <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: right;">Dilam (-)</th>
                                    <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: right;">Actual Closing</th>
                                    <th style="border: 1px solid #e2e8f0; padding: 10px; text-align: right;">Daily Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${dailyRows}
                            </tbody>
                        </table>
                    </div>
                </div>

                <p style="text-align: center; margin-top: 25px; font-size: 11px; color: #94a3b8; font-weight: 600;">
                    Generated on: ${new Date().toLocaleString()} | Mousumi Computer ERP
                </p>
            </div>
        `;

        previewBox.innerHTML = html;
        previewBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ৫. PDF ডাউনলোড
    window.downloadMonthlyPDF = function () {
        window.renderMonthlyPreview();
        setTimeout(() => {
            const el = document.getElementById('monthly-statement-capture');
            if (!el) return;
            const { targetMonth, targetYear } = getReportDataset();
            const opt = {
                margin: 10,
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
        if (filtered.length === 0) { alert("ডাটা পাওয়া যায়নি!"); return; }

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

    // ৭. বাটন ক্লিক হ্যান্ডলার
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const btnText = (btn.innerText || '').toLowerCase();
        
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

    setInterval(ensureMonthlyOption, 500);
})();
