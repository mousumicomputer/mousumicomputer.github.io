/* ==========================================================
   CUSTOMER MANAGEMENT MODULE (Mousumi ERP)
   File: customer_management_module.js
   With: Transaction Delete & Edit Feature
   ========================================================== */

// ১. সংখ্যাকে বাংলায় রূপান্তর
function toBanglaDigits(num) {
    if (num === undefined || num === null) return '০';
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, i => bnDigits[i]);
}

// ২. গ্রাহক তালিকা ও সামারি কার্ড রেন্ডার করা
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

    customerTransactions.filter(t => t.date === todayStr).forEach(t => {
        todayColl += (parseFloat(t.credit) || 0);
    });

    if (document.getElementById('statTotalCust')) document.getElementById('statTotalCust').innerText = toBanglaDigits(customers.length);
    if (document.getElementById('statTotalDue')) document.getElementById('statTotalDue').innerText = '৳ ' + totalReceivable.toLocaleString('bn-BD', { minimumFractionDigits: 2 });
    if (document.getElementById('statTodayCollection')) document.getElementById('statTodayCollection').innerText = '৳ ' + todayColl.toLocaleString('bn-BD', { minimumFractionDigits: 2 });
    if (document.getElementById('statDueCustomers')) document.getElementById('statDueCustomers').innerText = toBanglaDigits(dueCount);

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #9ca3af; padding: 20px;">কোনো গ্রাহক পাওয়া যায়নি।</td></tr>';
        return;
    }

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

// ৩. কাস্টমার লেজার স্টেটমেন্ট রেন্ডার (ডিলিট বাটন সহ)
window.renderCustomerStatement = function(custId) {
    const area = document.getElementById('modern-statement-table-area');
    if (!area) return;
    
    const customers = window.customers || [];
    const cust = customers.find(c => c.id === custId);
    if (!cust) return;

    let cleanPhone = cust.phone || '';
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);

    if (document.getElementById('stmtName')) document.getElementById('stmtName').innerText = cust.name;
    if (document.getElementById('stmtPhone')) document.getElementById('stmtPhone').innerText = '+৮৮০ ' + toBanglaDigits(cleanPhone);
    if (document.getElementById('stmtAvatar')) document.getElementById('stmtAvatar').innerText = cust.name.charAt(0).toUpperCase();
    
    const now = new Date();
    const localToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (document.getElementById('txDateInput')) document.getElementById('txDateInput').value = localToday;
    
    const currentDue = typeof calculateCustomerCurrentDue === 'function' ? calculateCustomerCurrentDue(cust.id) : 0;
    if (document.getElementById('stmtDueAmount')) {
        document.getElementById('stmtDueAmount').innerText = '৳ ' + toBanglaDigits(currentDue.toLocaleString('en-US'));
    }

    const allTxs = window.customerTransactions || [];
    let txs = allTxs.filter(t => t.customerId === custId);
    txs.sort((a,b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))).reverse();

    let html = `
    <table class="mc-table">
        <thead>
            <tr>
                <th>তারিখ</th>
                <th>বিবরণ</th>
                <th style="color:#ef4444;">দিলাম (+)</th>
                <th style="color:#22c55e;">পেলাম (-)</th>
                <th style="text-align: center; width: 60px;">অ্যাকশন</th>
            </tr>
        </thead>
        <tbody>`;

    txs.forEach(t => {
        html += `
        <tr>
            <td style="font-size: 0.85rem; color: #64748b; font-family: 'Tiro Bangla', serif;">
                ${toBanglaDigits(new Date(t.date).toLocaleDateString('bn-BD'))}
            </td>
            <td style="font-weight: 600; color: #1e293b;">${t.description || '-'}</td>
            <td style="font-weight: 800; color: #ef4444;">${t.debit > 0 ? '৳ ' + toBanglaDigits(t.debit.toLocaleString()) : '-'}</td>
            <td style="font-weight: 800; color: #22c55e;">${t.credit > 0 ? '৳ ' + toBanglaDigits(t.credit.toLocaleString()) : '-'}</td>
            <td style="text-align: center;">
                <button onclick="deleteCustomerTransaction('${t.id}', '${custId}')" title="মুছে ফেলুন" 
                    style="background: #fee2e2; color: #ef4444; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: 0.2s;">
                    <i class="fa-solid fa-trash-can" style="font-size: 0.85rem;"></i>
                </button>
            </td>
        </tr>`;
    });

    html += `</tbody></table>`;
    area.innerHTML = txs.length > 0 ? html : '<div style="text-align:center; padding: 30px; color: #94a3b8;">কোনো লেনদেন পাওয়া যায়নি।</div>';
};

// ৪. লেনদেন মুছে ফেলার (Delete) মূল ফাংশন
window.deleteCustomerTransaction = function(txId, custId) {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal({
            title: "লেনদেন মুছে ফেলবেন?",
            message: "এই লেনদেনটি স্থায়ীভাবে মুছে ফেলা হবে এবং ব্যালেন্স স্বয়ংক্রিয়ভাবে আপডেট হবে।",
            confirmText: "মুছে ফেলুন",
            onConfirm: async () => {
                await executeTransactionDeletion(txId, custId);
            }
        });
    } else {
        if (confirm("আপনি কি নিশ্চিত এই লেনদেনটি মুছে ফেলতে চান?")) {
            executeTransactionDeletion(txId, custId);
        }
    }
};

// ৫. ডাটাবেজ থেকে মুছে ফেলা ও ব্যালেন্স রি-ক্যালকুলেশন
async function executeTransactionDeletion(txId, custId) {
    if (typeof showLoader === 'function') showLoader("লেনদেন মুছে ফেলা হচ্ছে...");
    try {
        let allTxs = window.customerTransactions || [];
        // সিলেক্টেড ট্রানজ্যাকশন বাদ দেওয়া
        const updatedTxs = allTxs.filter(t => t.id !== txId);

        // ফায়ারবেসে সেভ করা
        const { getDatabase, ref, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        const db = getDatabase();
        await set(ref(db, 'transactions'), updatedTxs);

        window.customerTransactions = updatedTxs;

        // UI আপডেট করা
        if (typeof renderCustomerStatement === 'function') renderCustomerStatement(custId);
        if (typeof renderCustomerListTable === 'function') renderCustomerListTable();
        if (typeof updateDashboardCards === 'function') updateDashboardCards();

        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("লেনদেন সফলভাবে মুছে ফেলা হয়েছে!", "success");
    } catch (err) {
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("লেনদেন মুছতে সমস্যা হয়েছে: " + err.message, "error");
        console.error("Delete Error:", err);
    }
}

console.log("Customer Management Module Loaded with Delete Feature!");
