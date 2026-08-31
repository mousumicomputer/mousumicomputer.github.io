/* ==========================================================
   CUSTOMER MANAGEMENT MODULE (Mousumi ERP)
   File: customer_management_module.js
   Full Features: Due Calculation, List, Statement & Delete
   ========================================================== */

// সংখ্যাকে বাংলায় রূপান্তর
function toBanglaDigits(num) {
    if (num === undefined || num === null) return '০';
    const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, i => bnDigits[i]);
}

// গ্রাহকের বর্তমান বকেয়া হিসাব করার ফাংশন (গ্লোবাল)
window.calculateCustomerCurrentDue = function(custId) {
    const customers = window.customers || [];
    const cust = customers.find(c => c.id === custId);
    if (!cust) return 0;

    let due = parseFloat(cust.openingBalance) || 0;
    const txs = (window.customerTransactions || []).filter(t => t.customerId === custId);

    txs.forEach(t => {
        due += (parseFloat(t.debit) || 0);
        due -= (parseFloat(t.credit) || 0);
    });

    return due;
};

// কাস্টমার তালিকা ও সামারি রেন্ডার
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
        const currentDue = window.calculateCustomerCurrentDue(c.id);
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
        const currentDue = window.calculateCustomerCurrentDue(c.id);
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

// কাস্টমার স্টেটমেন্ট (ডিলিট বাটনসহ)
window.renderCustomerStatement = function(custId) {
    const area = document.getElementById('modern-statement-table-area');
    if (!area) return;
    
    window.activeViewingCustomerId = custId;
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
    
    const currentDue = window.calculateCustomerCurrentDue(cust.id);
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

// ডুয়াল ইনপুট হ্যান্ডলার
window.handleDualInput = function(type) {
    const d = document.getElementById('modernTxDebit');
    const c = document.getElementById('modernTxCredit');
    if (!d || !c) return;

    if (type === 'debit' && d.value.length > 0) {
        c.value = ''; c.disabled = true;
    } else if (type === 'credit' && c.value.length > 0) {
        d.value = ''; d.disabled = true;
    } else {
        d.disabled = false; c.disabled = false;
    }
};

// লেনদেন নিশ্চিত করার ফাংশন
window.submitModernTransaction = async function() {
    const dElement = document.getElementById('modernTxDebit');
    const cElement = document.getElementById('modernTxCredit');
    const descElement = document.getElementById('txCommonDesc');
    const dateElement = document.getElementById('txDateInput');

    const dValue = parseFloat(dElement.value) || 0;
    const cValue = parseFloat(cElement.value) || 0;

    if (dValue === 0 && cValue === 0) {
        if(typeof showToast === 'function') showToast("টাকার অংক লিখুন!", "error");
        return;
    }

    if(typeof showLoader === 'function') showLoader("সংরক্ষণ করা হচ্ছে...");
    const now = new Date();
    const txObj = {
        id: 'tx_' + Date.now(),
        customerId: window.activeViewingCustomerId,
        type: dValue > 0 ? 'Debit' : 'Credit',
        debit: dValue,
        credit: cValue,
        date: (dateElement && dateElement.value) ? dateElement.value : now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0,5),
        description: descElement.value.trim() || (dValue > 0 ? 'পণ্য বিক্রয়/ধার' : 'টাকা গ্রহণ')
    };

    try {
        let allTxs = window.customerTransactions || [];
        allTxs.push(txObj);

        const { getDatabase, ref, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        const db = getDatabase();
        await set(ref(db, 'transactions'), allTxs);

        window.customerTransactions = allTxs;
        dElement.value = ''; cElement.value = ''; descElement.value = '';
        dElement.disabled = false; cElement.disabled = false;

        renderCustomerStatement(window.activeViewingCustomerId);
        renderCustomerListTable(); 
        if(typeof updateDashboardCards === 'function') updateDashboardCards();
        if(typeof hideLoader === 'function') hideLoader();
        if(typeof showToast === 'function') showToast("লেনদেন সংরক্ষিত হয়েছে!", "success");
    } catch(err) { 
        if(typeof hideLoader === 'function') hideLoader(); 
        if(typeof showToast === 'function') showToast("Error!", "error"); 
    }
};

// লেনদেন মুছে ফেলার ফাংশন
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

async function executeTransactionDeletion(txId, custId) {
    if (typeof showLoader === 'function') showLoader("মুছে ফেলা হচ্ছে...");
    try {
        let allTxs = window.customerTransactions || [];
        const updatedTxs = allTxs.filter(t => t.id !== txId);

        const { getDatabase, ref, set } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
        const db = getDatabase();
        await set(ref(db, 'transactions'), updatedTxs);

        window.customerTransactions = updatedTxs;

        renderCustomerStatement(custId);
        renderCustomerListTable();
        if (typeof updateDashboardCards === 'function') updateDashboardCards();

        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("লেনদেন মুছে ফেলা হয়েছে!", "success");
    } catch (err) {
        if (typeof hideLoader === 'function') hideLoader();
        if (typeof showToast === 'function') showToast("Error: " + err.message, "error");
    }
}
