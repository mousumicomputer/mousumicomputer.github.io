/* ==========================================================
   CUSTOMER MANAGEMENT MODULE (Mousumi ERP)
   File: customer_management_module.js
   ========================================================== */

// ১. সংখ্যাকে বাংলা সংখ্যায় রূপান্তর করার ফাংশন
function toBanglaDigits(num) {
    if (num === undefined || num === null) return '০';
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, i => bnDigits[i]);
}

// ২. গ্রাহক তালিকা ও সামারি কার্ড রেন্ডার করার ফাংশন
window.renderCustomerListTable = function() {
    const tbody = document.getElementById('customerTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const customers = window.customers || [];
    const customerTransactions = window.customerTransactions || [];

    const searchInput = document.getElementById('custSearchInput');
    const filterVal = (searchInput ? searchInput.value : '').toLowerCase();

    const filtered = customers.filter(c => 
        (c.name || '').toLowerCase().includes(filterVal) ||
        (c.phone || '').toLowerCase().includes(filterVal) ||
        (c.id || '').toLowerCase().includes(filterVal)
    );

    // স্ট্যাটিসটিকস ক্যালকুলেশন
    let totalReceivable = 0;
    let totalPayable = 0;
    let dueCount = 0;
    let todayColl = 0;
    const todayStr = new Date().toISOString().split('T')[0];

    customers.forEach(c => {
        const currentDue = typeof calculateCustomerCurrentDue === 'function' ? calculateCustomerCurrentDue(c.id) : 0;

        if (currentDue > 0) {
            totalReceivable += currentDue;
            dueCount++;
        } else if (currentDue < 0) {
            totalPayable += Math.abs(currentDue);
        }
    });

    // আজকের আদায়ের হিসাব
    customerTransactions.filter(t => t.date === todayStr).forEach(t => {
        todayColl += (parseFloat(t.credit) || 0);
    });

    // সামারি কার্ডে ডাটা বসানো
    if (document.getElementById('statTotalCust')) {
        document.getElementById('statTotalCust').innerText = toBanglaDigits(customers.length);
    }
    if (document.getElementById('statTotalDue')) {
        document.getElementById('statTotalDue').innerText = '৳ ' + totalReceivable.toLocaleString('bn-BD', { minimumFractionDigits: 2 });
    }
    if (document.getElementById('statTodayCollection')) {
        document.getElementById('statTodayCollection').innerText = '৳ ' + todayColl.toLocaleString('bn-BD', { minimumFractionDigits: 2 });
    }
    if (document.getElementById('statDueCustomers')) {
        document.getElementById('statDueCustomers').innerText = toBanglaDigits(dueCount);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #9ca3af; padding: 20px;">কোনো গ্রাহক পাওয়া যায়নি।</td></tr>';
        return;
    }

    // টেবিল তৈরি করা
    filtered.forEach(c => {
        const currentDue = typeof calculateCustomerCurrentDue === 'function' ? calculateCustomerCurrentDue(c.id) : 0;
        const firstLetter = (c.name || 'G').charAt(0).toUpperCase();
        
        const colors = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="display: flex; align-items: center;">
                    <div class="mc-avatar" style="background: ${randomColor}15; color: ${randomColor}; border: 1.5px solid ${randomColor}30;">${firstLetter}</div>
                    <div style="font-family: 'Tiro Bangla', serif;">
                        <div style="font-weight: 800; color: #1e293b;">${c.name}</div>
                        <div style="font-size: 0.75rem; color: #94a3b8;">ID: ${c.id}</div>
                    </div>
                </div>
            </td>
            <td style="color: #64748b; font-weight: 600;">${c.phone || '-'}</td>
            <td style="color: #64748b;">-</td> 
            <td style="font-weight: 800; color: ${currentDue > 0 ? '#e11d48' : '#1e293b'};">৳ ${currentDue.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}</td>
            <td style="text-align: right;">
                <button class="mc-btn-details" onclick="openCustomerLedgerDirect('${c.id}')">বিস্তারিত <i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; margin-left: 5px;"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
};

console.log("Customer Management Module Loaded Successfully!");
