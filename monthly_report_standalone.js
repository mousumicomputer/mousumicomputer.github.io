/**
 * Mousumi Computer ERP - Monthly Financial Statement Module (Fail-Safe Edition)
 * ড্রপডাউনে নিশ্চিত অপশন ইনজেক্ট, প্রিভিউ, PDF এবং Excel এক্সপোর্ট হ্যান্ডলার।
 */

(function () {
    // ১. ড্রপডাউনে নিশ্চিতভাবে 'Monthly Financial Statement' অপশন ইনজেক্ট করা
    function injectMonthlyOption() {
        const allSelects = document.querySelectorAll('select');
        
        allSelects.forEach(select => {
            // যদি সিলেক্ট বক্সে 'Daily Closing' বা 'পূর্ণাঙ্গ আর্থিক বিবরণী' থাকে
            const isReportSelect = Array.from(select.options).some(opt => 
                opt.text.includes('Daily Closing') || 
                opt.text.includes('পূর্ণাঙ্গ আর্থিক বিবরণী') ||
                opt.text.includes('লেনদেনের রিপোর্ট')
            );

            if (isReportSelect) {
                const alreadyExists = Array.from(select.options).some(opt => opt.value === 'monthly_report_final');
                if (!alreadyExists) {
                    const opt = document.createElement('option');
                    opt.value = 'monthly_report_final';
                    opt.innerText = 'Monthly Financial Statement (মাসিক আর্থিক বিবরণী)';
                    opt.style.fontWeight = 'bold';
                    opt.style.color = '#4f46e5';
                    select.appendChild(opt);
                }
            }
        });
    }

    // ২. নির্বাচিত তারিখ ও ডাটা প্রসেস করার ফাংশন
    function getMonthlyData() {
        const closings = window.dailyClosingReports || [];
        
        // সব তারিখ ইনপুট চেক করা
        const dateInputs = document.querySelectorAll('input[type="date"]');
        let selectedDateStr = '';

        for (let inp of dateInputs) {
            if (inp.value) {
                selectedDateStr = inp.value;
                break;
            }
        }

        const date = selectedDateStr ? new Date(selectedDateStr) : new Date();
        const m = date.getMonth();
        const y = date.getFullYear();

        const filtered = closings.filter(r => {
            if (!r.report_date) return false;
            const rd = new Date(r.report_date);
            return rd.getMonth() === m && rd.getFullYear() === y;
        });

        filtered.sort((a, b) => a.report_date.localeCompare(b.report_date));

        return { filtered, m, y };
    }

    // ৩. মাসিক রিপোর্ট প্রিভিউ রেন্ডার করা
    window.renderMonthlyPreview = function () {
        const { filtered, m, y } = getMonthlyData();
        const mNames = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];

        if (filtered.length === 0) {
            alert(`দুঃখিত, ${mNames[m]} ${y} মাসের জন্য কোনো ক্লোজিং ডাটা খুঁজে পাওয়া যায়নি!`);
            return;
        }

        let tPelam = 0, tDilam = 0, tProfit = 0;
        const opening = parseFloat(filtered[0].opening_capital) || 0;
        const closing = parseFloat(filtered[filtered.length - 1].actual_closing) || 0;

        let dailyRowsHtml = '';
        filtered.forEach(r => {
            const p = parseFloat(r.total_pelam) || 0;
            const d = parseFloat(r.total_dilam) || 0;
            const inc = parseFloat(r.income) || 0;

            tPelam += p;
            tDilam += d;
            tProfit += inc;

            dailyRowsHtml += `
                <tr>
                    <td style="border: 1px solid #000; padding: 6px 8px; text-align: center;">${r.report_date}</td>
                    <td style="border: 1px solid #000; padding: 6px 8px; text-align: right;">৳ ${(parseFloat(r.opening_capital) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #000; padding: 6px 8px; text-align: right; color: #16a34a;">৳ ${p.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #000; padding: 6px 8px; text-align: right; color: #dc2626;">৳ ${d.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #000; padding: 6px 8px; text-align: right; font-weight: bold;">৳ ${(parseFloat(r.actual_closing) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style="border: 1px solid #000; padding: 6px 8px; text-align: right; font-weight: bold; color: ${inc >= 0 ? '#16a34a' : '#dc2626'};">৳ ${inc.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                </tr>
            `;
        });

        const fmt = (v) => v.toLocaleString('en-US', { minimumFractionDigits: 2 });

        const html = `
            <div id="monthly-report-printable-area" style="font-family: Arial, Helvetica, sans-serif; padding: 25px; background: #fff; color: #000; line-height: 1.4; border: 1px solid #ddd;">
                <div style="text-align: center; border-bottom: 2.5px solid #000; margin-bottom: 20px; padding-bottom: 12px;">
                    <h2 style="margin: 0; font-size: 24px; text-transform: uppercase;">Mousumi Computer</h2>
                    <p style="margin: 4px 0; font-weight: bold; font-size: 15px;">MONTHLY FINANCIAL STATEMENT (মাসিক আর্থিক বিবরণী)</p>
                    <p style="margin: 0; font-size: 13px;">মাস: <strong>${mNames[m]} - ${y}</strong> | মোট কার্যদিবস: <strong>${filtered.length} দিন</strong></p>
                </div>

                <!-- মূল সারাংশ -->
                <div style="border: 1.5px solid #000; margin-bottom: 25px;">
                    <div style="background: #e2e8f0; padding: 8px 12px; font-weight: bold; border-bottom: 1.5px solid #000; font-size: 13px;">১. মূলধন ও নগদ আদায়-প্রদান সারসংক্ষেপ (CAPITAL & CASH SUMMARY)</div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="background: #f8fafc; font-weight: bold;">
                            <td style="border: 1px solid #000; padding: 10px; font-size: 12px;">বিবরণ (PARTICULARS)</td>
                            <td style="border: 1px solid #000; padding: 10px; text-align: right; font-size: 12px;">পরিমাণ (AMOUNT ৳)</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px 10px;">মাসের প্রারম্ভিক মোট পুঁজি (Opening Capital)</td>
                            <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; font-weight: bold;">৳ ${fmt(opening)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px 10px;">পুরো মাসের মোট আদায় (Total Monthly Collection - Pelam)</td>
                            <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; color: #16a34a; font-weight: bold;">৳ ${fmt(tPelam)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; padding: 8px 10px;">পুরো মাসের মোট প্রদান/বাকি (Total Monthly Credit - Dilam)</td>
                            <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; color: #dc2626; font-weight: bold;">৳ ${fmt(tDilam)}</td>
                        </tr>
                        <tr style="background: #f8fafc;">
                            <td style="border: 1px solid #000; padding: 8px 10px; font-weight: bold;">মাসের সমাপনী মোট সম্পদ (Actual Closing Assets)</td>
                            <td style="border: 1px solid #000; padding: 8px 10px; text-align: right; font-weight: bold;">৳ ${fmt(closing)}</td>
                        </tr>
                        <tr style="background: #cbd5e1; font-weight: 900; font-size: 15px;">
                            <td style="border: 1px solid #000; padding: 12px 10px;">পুরো মাসের সর্বমোট নিট লাভ (NET MONTHLY PROFIT)</td>
                            <td style="border: 1px solid #000; padding: 12px 10px; text-align: right; color: #000;">৳ ${fmt(tProfit)}</td>
                        </tr>
                    </table>
                </div>

                <!-- প্রতিদিনের বিস্তারিত বিবরণ -->
                <div style="border: 1.5px solid #000;">
                    <div style="background: #e2e8f0; padding: 8px 12px; font-weight: bold; border-bottom: 1.5px solid #000; font-size: 13px;">২. দৈনিক ক্লোজিং তালিকা (DAILY BREAKDOWN)</div>
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                        <thead>
                            <tr style="background: #f1f5f9; font-weight: bold;">
                                <th style="border: 1px solid #000; padding: 6px;">তারিখ</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Opening</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Pelam (+)</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Dilam (-)</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Closing</th>
                                <th style="border: 1px solid #000; padding: 6px; text-align: right;">Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dailyRowsHtml}
                        </tbody>
                    </table>
                </div>

                <p style="text-align: center; margin-top: 25px; font-size: 10px; color: #666;">Generated on: ${new Date().toLocaleString()} | Mousumi Computer ERP</p>
            </div>
        `;

        // প্রিভিউ এরিয়া খুঁজে সেখানে বসানো
        const previewTarget = document.getElementById('printable-closing-report') || 
                              document.querySelector('.report-preview-area') || 
                              document.querySelector('[id*="preview"]') ||
                              document.querySelector('.report-main-container');

        if (previewTarget) {
            previewTarget.innerHTML = html;
            previewTarget.style.display = 'block';
            previewTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // ৪. PDF ও Excel এক্সপোর্ট ফাংশন
    window.downloadMonthlyPDF = function () {
        window.renderMonthlyPreview();
        setTimeout(() => {
            const element = document.getElementById('monthly-report-printable-area');
            if (!element) return;
            const { m, y } = getMonthlyData();
            const opt = {
                margin: 8,
                filename: `Monthly_Statement_${m + 1}_${y}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(element).save();
        }, 400);
    };

    window.exportMonthlyExcel = function () {
        const { filtered, m, y } = getMonthlyData();
        if (filtered.length === 0) { alert("এক্সপোর্ট করার জন্য ডাটা পাওয়া যায়নি!"); return; }

        const rows = [
            ["MOUSUMI COMPUTER - MONTHLY FINANCIAL STATEMENT"],
            [`Month: ${m + 1}/${y}`],
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
        XLSX.writeFile(wb, `Monthly_Statement_${m + 1}_${y}.xlsx`);
    };

    // ৫. গ্লোবাল বাটন ইন্টারসেপশন (Preview, PDF, Excel ক্লিকের সময় ধরা)
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button') || e.target;
        if (!btn || !btn.innerText) return;

        const text = btn.innerText.toLowerCase();
        
        // ড্রপডাউন চেক করা
        const activeSelect = document.querySelector('select:has(option[value="monthly_report_final"])') || 
                             Array.from(document.querySelectorAll('select')).find(s => s.value === 'monthly_report_final');

        if (activeSelect && activeSelect.value === 'monthly_report_final') {
            if (text.includes('generate preview')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.renderMonthlyPreview();
            } else if (text.includes('download pdf')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.downloadMonthlyPDF();
            } else if (text.includes('export excel')) {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.exportMonthlyExcel();
            }
        }
    }, true);

    // ৬. ড্রপডাউনে ক্লিক করলেও অপশন চেক করা
    document.addEventListener('mousedown', function (e) {
        if (e.target && e.target.tagName === 'SELECT') {
            injectMonthlyOption();
        }
    });

    // ৭. পেজের সব DOM পরিবর্তনের ওপর নজর রাখা (MutationObserver)
    const observer = new MutationObserver(() => {
        injectMonthlyOption();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // নির্দিষ্ট সময় পর পর চেক করা
    setInterval(injectMonthlyOption, 500);
})();
