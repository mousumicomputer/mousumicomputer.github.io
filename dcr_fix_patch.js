/**
 * Mousumi Computer - Daily Closing Auto-Patch (Standalone)
 * File Name: dcr_fix_patch.js
 */

(function () {
    console.log("DCR Fix Patch Loaded Successfully!");

    // ১. ভিউ বাটন ফিক্স (ফাঁকা থাকা দূর করা)
    window.renderDailyClosingReportView = function(snap) {
        const container = document.getElementById('printable-closing-report');
        if (!container) return;

        const fmt = (n) => '৳ ' + (parseFloat(n) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
        const company = "Mousumi Computer";
        const rDate = snap.report_date || '---';
        const rTime = snap.closing_time || '---';
        const rId = snap.report_id || 'DCR-N/A';

        const opening = snap.opening_capital || 0;
        const pelam = snap.total_pelam || 0;
        const dilam = snap.total_dilam || 0;
        const expected = snap.expected_closing !== undefined ? snap.expected_closing : (opening + pelam - dilam);
        const actual = snap.actual_closing || 0;
        const income = snap.income !== undefined ? snap.income : (actual - expected);

        let html = `
        <div style="font-family: Arial, sans-serif; color: #1e293b; padding: 20px; background: #fff;">
            <div style="text-align: center; border-bottom: 2px dashed #cbd5e1; margin-bottom: 20px; padding-bottom: 10px;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a;">${company}</h2>
                <p style="margin: 5px 0; font-weight: bold; color: #4f46e5;">DAILY CLOSING FINANCIAL STATEMENT</p>
                <p style="margin: 0; font-size: 11px; color: #64748b;">Date: ${rDate} | Time: ${rTime} | ID: ${rId}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px; color: #64748b;">Opening Capital (প্রারম্ভিক মূলধন)</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold;">${fmt(opening)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px; color: #16a34a;">(+) Total Pelam (মোট আদায়)</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; color: #16a34a;">${fmt(pelam)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 10px; color: #ef4444;">(-) Total Dilam (মোট প্রদান)</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; color: #ef4444;">${fmt(dilam)}</td>
                </tr>
                <tr style="border-bottom: 1.5px solid #cbd5e1; background: #f8fafc;">
                    <td style="padding: 10px; font-weight: bold;">Expected Closing (হওয়ার কথা ছিল)</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold;">${fmt(expected)}</td>
                </tr>
                <tr style="border-bottom: 1.5px solid #cbd5e1;">
                    <td style="padding: 12px 10px; font-weight: bold; color: #4f46e5;">Actual Closing Capital (আসল সম্পদ)</td>
                    <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #4f46e5; font-size: 15px;">${fmt(actual)}</td>
                </tr>
                <tr style="background: ${income >= 0 ? '#ecfdf5' : '#fef2f2'};">
                    <td style="padding: 12px 10px; font-weight: bold; color: ${income >= 0 ? '#065f46' : '#991b1b'};">Today's Net Income (নিট আয়)</td>
                    <td style="padding: 12px 10px; text-align: right; font-weight: bold; font-size: 16px; color: ${income >= 0 ? '#047857' : '#b91c1c'};">${fmt(income)}</td>
                </tr>
            </table>

            <div style="text-align: right;">
                <button onclick="window.print()" style="padding: 8px 16px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
                    <i class="fa-solid fa-print"></i> Print
                </button>
            </div>
        </div>`;
        container.innerHTML = html;
    };

    // ২. হিস্ট্রি টেবিলে Delete বাটন ইঞ্জেক্ট ও ওভাররাইড করা
    window.renderDailyClosingHistory = function() {
        const tbody = document.getElementById('dailyClosingHistoryTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        const reports = window.dailyClosingReports || [];

        if (reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8;">কোনো হিস্ট্রি রেকর্ড পাওয়া যায়নি।</td></tr>';
            return;
        }

        reports.forEach(r => {
            const tr = document.createElement('tr');
            const fmt = (val) => '৳ ' + (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });

            tr.innerHTML = `
                <td style="color: #1e1b4b; font-weight: 700; padding: 15px;">${r.report_date}</td>
                <td style="color: #64748b; padding: 15px;">${fmt(r.opening_capital)}</td>
                <td style="color: #4f46e5; font-weight: 700; padding: 15px;">${fmt(r.actual_closing)}</td>
                <td style="color: ${r.income >= 0 ? '#10b981' : '#ef4444'}; font-weight: 800; padding: 15px;">${fmt(r.income)}</td>
                <td style="text-align:center; padding: 15px;">
                    <span style="background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;">✔ CLOSED</span>
                </td>
                <td style="text-align:center; padding: 15px;">
                    <div style="display: flex; gap: 6px; justify-content: center;">
                        <button class="btn-action btn-edit" onclick="viewDCRReport('${r.report_id}')" style="background: #f1f5f9; color: #1e1b4b; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">
                            <i class="fa-solid fa-eye"></i> View
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteDCRReport('${r.report_id}')" title="মুছে ফেলুন" style="background: #fee2e2; color: #ef4444; border: 1px solid #fecaca; padding: 6px 10px; border-radius: 6px; cursor: pointer;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    };

    // ৩. স্বয়ংক্রিয় রিফ্রেশ টাইমার
    setInterval(() => {
        const rows = document.querySelectorAll('#dailyClosingHistoryTableBody tr');
        if (rows.length > 0) {
            const hasDelete = rows[0].querySelector('.btn-delete');
            if (!hasDelete && typeof window.renderDailyClosingHistory === 'function') {
                window.renderDailyClosingHistory();
            }
        }
    }, 1500);

})();
