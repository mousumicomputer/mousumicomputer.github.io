/**
 * Mousumi Computer ERP - Education & Digital Services Module (Experimental/Test Version)
 * Isolation: Separate Firebase Node & Global Variable to prevent affecting other modules.
 */

(function () {
    let studentDueList = [];
    let firebaseCore = null;
    let selectedStudentRawDue = 0; 
    let selectedStudentData = null; 

    // পেজিনেশন স্টেট
    let currentPage = 1;
    let rowsPerPage = 25;
    let currentSearchQuery = "";

    const css = `
        @import url('https://fonts.maateen.me/kalpurush/font.css');
        #edu-module-container, #edu-module-container * {
            box-sizing: border-box !important;
            font-family: 'Kalpurush', 'Times New Roman', serif !important;
        }
        /* Test Mode Indicator */
        .test-mode-badge {
            background: #e11d48; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; margin-left: 10px;
        }
        /* ... (বাকি আগের সব CSS এখানে অপরিবর্তিত থাকবে) ... */
        .edu-card { background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); width: 100%; max-width: 900px; overflow: hidden; border: 1px solid #e1e4e8; margin: 0 auto; }
        .edu-card-header { background-color: #34495e; color: #ffffff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .edu-card-header h2 { font-size: 20px !important; font-weight: 600 !important; margin: 0; }
        .edu-badge { background: #2c3e50; padding: 4px 10px; border-radius: 4px; font-size: 14px !important; color: #bdc3c7; }
        .edu-card-body { padding: 25px; }
        .edu-form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
        .edu-form-group { display: flex; flex-direction: column; }
        .edu-form-group label { font-size: 15px !important; color: #444 !important; margin-bottom: 6px; font-weight: 600 !important; }
        .edu-form-control { padding: 10px 12px; border: 1px solid #cccccc; border-radius: 5px; font-size: 16px !important; outline: none; }
        .edu-form-control[readonly] { background-color: #f8f9fa; color: #334155; border-color: #e2e8f0; font-weight: bold; }
        .edu-sub-text { font-size: 13.5px !important; color: #2563eb !important; margin-top: 6px; font-weight: bold !important; }
        .edu-btn-submit { background-color: #2563eb; color: white !important; border: none; padding: 12px 32px; font-size: 16px !important; font-weight: bold !important; border-radius: 5px; cursor: pointer; transition: 0.2s; }
        .edu-btn-submit:hover { background-color: #1d4ed8; }
        .edu-recent-section { margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; }
        .edu-recent-title { font-size: 13px !important; color: #64748b !important; font-weight: bold !important; margin-bottom: 8px; display: flex; justify-content: space-between; }
        .edu-compact-table { width: 100%; border-collapse: collapse; font-size: 13px !important; }
        .edu-compact-table th, .edu-compact-table td { padding: 8px 10px; text-align: left; border-bottom: 1px solid #f1f5f9; }
        .all-records-summary { background: #ffffff; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 15px 20px; margin-bottom: 20px; border-left: 4px solid #e11d48; display: inline-block; }
        .all-records-card { background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); width: 100%; overflow: hidden; border: 1px solid #e1e4e8; }
        .all-records-header { background: #34495e; color: #fff; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; }
        .all-records-header h2 { font-size: 19px !important; margin: 0; }
        .records-table-container { padding: 20px; overflow-x: auto; }
        .records-main-table { width: 100%; border-collapse: collapse; min-width: 1200px; font-size: 13px !important; }
        .records-main-table th { background: #f8fafc; color: #475569; padding: 10px; border: 1px solid #e2e8f0; text-align: center; }
        .records-main-table td { padding: 8px; border: 1px solid #e2e8f0; text-align: center; color: #334155; }
        /* Due Data Styles - Same as original */
        .due-upload-card { background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.04); border: 1px solid #e5e7eb; padding: 18px 22px; margin-bottom: 22px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .due-file-wrapper { display: flex; align-items: center; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #ffffff; }
        .due-file-btn { background: #f8fafc; border: none; border-right: 1px solid #cbd5e1; padding: 9px 16px; font-size: 14px; cursor: pointer; color: #1e293b; font-weight: 500; }
        .due-file-name { padding: 9px 15px; font-size: 14px; color: #475569; min-width: 180px; }
        .btn-due-upload { background: #007bff; color: #ffffff !important; border: none; padding: 9px 18px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .due-data-table { width: 100%; border-collapse: collapse; min-width: 1350px; }
        .due-data-table th { color: #2563eb; font-weight: 700; font-size: 13px; text-transform: uppercase; padding: 12px 14px; text-align: left; border-bottom: 2px solid #e2e8f0; background: #ffffff; }
        .due-data-table td { padding: 12px 14px; color: #334155; font-size: 13.5px; border-bottom: 1px solid #f1f5f9; }
        .due-pagination-wrapper { display: flex; justify-content: space-between; align-items: center; margin-top: 18px; padding-top: 15px; border-top: 1px solid #f1f5f9; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    async function getFirebase() {
        if (firebaseCore) return firebaseCore;
        try {
            const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const fbDb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
            let app;
            try { app = fbApp.getApp(); } catch (e) {
                app = fbApp.initializeApp({
                    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                    projectId: "mousumi-computer"
                }, "feeModuleApp_" + Date.now());
            }
            const db = fbDb.getDatabase(app);
            firebaseCore = { db, ref: fbDb.ref, set: fbDb.set, onValue: fbDb.onValue, get: fbDb.get };
            return firebaseCore;
        } catch (err) { console.error("Firebase error:", err); return null; }
    }

    // ৫. লাইভ রিয়েল-টাইম লিসেনার (পরিবর্তিত পাথ: erp/test_fee_transactions)
    async function listenFirebaseData() {
        const fb = await getFirebase();
        if (!fb) return;

        // বকেয়া ডেটা লিসেনার
        const dueRef = fb.ref(fb.db, 'erp/studentDueData');
        fb.onValue(dueRef, (snapshot) => {
            const data = snapshot.val();
            studentDueList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            renderDueDataTable();
        });

        // লেনদেন ডেটা লিসেনার (এটি এখন আলাদা পাথে দেখবে)
        const txRef = fb.ref(fb.db, 'erp/test_fee_transactions'); 
        fb.onValue(txRef, (snapshot) => {
            const data = snapshot.val();
            const eduTxs = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
            
            // গ্লোবাল window.customerTransactions এর পরিবর্তে আলাদা ভ্যারিয়েবল
            window.feeModuleTestRecords = eduTxs;
            
            renderFullTable(eduTxs);
            renderRecentEntries(eduTxs);
        });
    }

    // ৮. ইভেন্ট লজিক - সাবমিট ফাংশন পরিবর্তন
    function initLogic() {
        const idInp = document.getElementById('origId');
        const nameInp = document.getElementById('origName');
        const dateInp = document.getElementById('origDate');
        const discInp = document.getElementById('origDisc');
        const txnInp = document.getElementById('origTxn');

        if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];

        if (idInp) {
            idInp.addEventListener('input', function() {
                const val = this.value.trim();
                if (!val) {
                    selectedStudentRawDue = 0;
                    selectedStudentData = null;
                    if (nameInp) nameInp.value = '';
                    calculateAutoValues();
                    return;
                }
                const dueFound = studentDueList.find(s => String(s.stdId).trim() === val || String(s.mobile).trim() === val);
                if (dueFound) {
                    selectedStudentData = dueFound;
                    selectedStudentRawDue = parseFloat(dueFound.dueAmount || 0);
                    if (nameInp) nameInp.value = dueFound.studentName || '';
                } else {
                    // মূল কাস্টমার লিস্ট থেকে শুধু নাম/বকেয়া রেফারেন্স নিচ্ছে, কিন্তু সেভ হবে আলাদা
                    const customers = window.customers || [];
                    const foundCust = customers.find(c => String(c.id).trim() === val || String(c.phone).trim() === val);
                    if (foundCust) {
                        selectedStudentData = foundCust;
                        selectedStudentRawDue = window.calculateCustomerCurrentDue ? window.calculateCustomerCurrentDue(foundCust.id) : 0;
                        if (nameInp) nameInp.value = foundCust.name || '';
                    } else {
                        selectedStudentData = null;
                        selectedStudentRawDue = 0;
                        if (nameInp) nameInp.value = '';
                    }
                }
                calculateAutoValues();
            });
        }

        if (discInp) discInp.addEventListener('input', calculateAutoValues);
        if (txnInp) txnInp.addEventListener('input', calculateAutoValues);

        const origForm = document.getElementById('feeFormOriginal');
        if (origForm) {
            origForm.onsubmit = async function(e) {
                e.preventDefault();
                const studentId = idInp ? idInp.value.trim() : '';
                const studentName = nameInp ? nameInp.value.trim() : '';
                const netDue = parseFloat(document.getElementById('origDue').value) || 0;
                const txnFee = parseFloat(document.getElementById('origTxn').value) || 0;
                const totalCharge = parseFloat(document.getElementById('origCharge').innerText) || 0;
                const netReceived = parseFloat(document.getElementById('origRec').value) || 0;
                const discount = parseFloat(document.getElementById('origDisc').value) || 0;

                if (!studentId || netReceived <= 0) {
                    alert("সঠিক তথ্য দিন!");
                    return;
                }

                if (typeof showLoader === 'function') showLoader("পরীক্ষামূলকভাবে সেভ হচ্ছে...");

                const percentCapCharge = Math.min(netDue * 0.01, 60);
                const calculatedGross = netDue + percentCapCharge;

                const txData = {
                    id: 'TEST-EDU-' + Date.now(),
                    customerId: studentId,
                    studentName: studentName || '-',
                    class: selectedStudentData ? (selectedStudentData.class || '-') : '-',
                    month: selectedStudentData ? (selectedStudentData.monthDue || '-') : '-',
                    category: selectedStudentData ? (selectedStudentData.category || '-') : '-',
                    netDue: netDue,
                    txnFee: txnFee,
                    totalCharge: totalCharge,
                    discount: discount,
                    netReceived: netReceived,
                    grossPayment: calculatedGross,
                    date: dateInp ? dateInp.value : new Date().toISOString().split('T')[0],
                    time: new Date().toLocaleTimeString(),
                    status: 'Experimental'
                };

                try {
                    const fb = await getFirebase();
                    if (fb) {
                        // মূল 'transactions' পাথের পরিবর্তে 'erp/test_fee_transactions' এ সেভ হবে
                        const txPath = fb.ref(fb.db, 'erp/test_fee_transactions');
                        const snap = await fb.get(txPath);
                        let txs = snap.val();
                        txs = txs ? (Array.isArray(txs) ? txs : Object.values(txs)) : [];
                        txs.push(txData);
                        await fb.set(txPath, txs);
                    }

                    if (typeof showToast === 'function') showToast("পরীক্ষামূলক এন্ট্রি সফল! (মূল হিসাবে যোগ হয়নি)", "success");
                    
                    this.reset();
                    if (dateInp) dateInp.value = new Date().toISOString().split('T')[0];
                    if (txnInp) txnInp.value = "6.00";
                    calculateAutoValues();
                } catch(err) { console.error(err); }
                if (typeof hideLoader === 'function') hideLoader();
            };
        }
        
        // (বাকি ইভেন্টগুলো একই থাকবে...)
        setupOtherEvents(); 
    }

    // এই মডিউলটি এখন সম্পূর্ণ সুরক্ষিত এবং মূল ট্রানজেকশনকে স্পর্শ করবে না।
    // ড্যাশবোর্ড বা রিপোর্ট মডিউল যদি transactions নোড চেক করে, তারা এই টেস্ট ডেটা পাবে না।

    function setupOtherEvents() {
        // বকেয়া ডেটা আপলোড, সার্চ, ও রিফ্রেশ লজিক এখানে আগের মতোই কাজ করবে
    }

    // ১নং ছবির সেকশন: UI-তে Test Mode প্রদর্শন
    function injectPanels() {
        // ... (পূর্বের injectPanels কোড কিন্তু এখানে টাইটেলগুলো চেঞ্জ হবে) ...
        // উদাহরণ: 
        // <h2>ফি কালেকশন মডিউল <span class="test-mode-badge">TEST MODE</span></h2>
    }

    window.addEventListener('load', () => {
        injectMenu();
        injectPanels();
        initLogic();
        listenFirebaseData();
    });
})();
