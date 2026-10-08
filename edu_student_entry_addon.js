/**
 * Mousumi Computer ERP - Student Entry & Edit Addon
 * Safe Addon: No deletion, only Appends & Updates Firebase Master Due Data
 */

(function () {
    let firebaseCore = null;
    let selectedStudentData = null;
    let selectedRowElement = null;
    let isEditMode = false;

    // ১. ফায়ারবেস কানেকশন (নিরাপদ কানেক্টর)
    async function getFirebase() {
        if (firebaseCore) return firebaseCore;
        try {
            const fbApp = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const fbDb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");

            let app;
            for (let i = 0; i < 20; i++) {
                try { app = fbApp.getApp(); if (app) break; } catch (e) {}
                await new Promise(r => setTimeout(r, 150));
            }
            if (!app) {
                app = fbApp.initializeApp({
                    databaseURL: "https://mousumi-computer-default-rtdb.firebaseio.com",
                    projectId: "mousumi-computer"
                }, "studentAddonApp_" + Date.now());
            }

            const db = fbDb.getDatabase(app);
            firebaseCore = { db, ref: fbDb.ref, set: fbDb.set, get: fbDb.get };
            return firebaseCore;
        } catch (err) {
            console.error("Firebase Addon Connection Error:", err);
            return null;
        }
    }

    // ২. গোল শেপের স্টাইল ইনজেকশন
    function injectStyles() {
        if (document.getElementById('student-addon-styles')) return;
        const style = document.createElement('style');
        style.id = 'student-addon-styles';
        style.innerHTML = `
            /* গোল বাটন */
            .btn-rounded-addon {
                border-radius: 25px !important;
                padding: 8px 18px !important;
                font-size: 0.82rem !important;
                font-weight: 700 !important;
                display: inline-flex !important;
                align-items: center !important;
                gap: 6px !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                border: none !important;
            }
            .btn-addon-add { background: #2563eb !important; color: #ffffff !important; }
            .btn-addon-add:hover { background: #1d4ed8 !important; }
            .btn-addon-edit { background: #d97706 !important; color: #ffffff !important; }
            .btn-addon-edit:hover:not(:disabled) { background: #b45309 !important; }
            .btn-addon-edit:disabled { opacity: 0.35 !important; cursor: not-allowed !important; }

            /* টেবিল লাইন সিলেক্ট গোল হাইলাইট */
            #dueDataTableBody tr { cursor: pointer; transition: background 0.15s; }
            #dueDataTableBody tr.addon-row-selected td {
                background: #eff6ff !important;
                color: #1e40af !important;
                border-top: 1px solid #3b82f6 !important;
                border-bottom: 1px solid #3b82f6 !important;
            }
            #dueDataTableBody tr.addon-row-selected td:first-child {
                border-left: 2px solid #2563eb !important;
                border-top-left-radius: 14px !important;
                border-bottom-left-radius: 14px !important;
            }
            #dueDataTableBody tr.addon-row-selected td:last-child {
                border-right: 2px solid #2563eb !important;
                border-top-right-radius: 14px !important;
                border-bottom-right-radius: 14px !important;
            }

            /* গোল পপ-আপ ফর্ম */
            .addon-modal-overlay {
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.45); display: none; align-items: center; 
                justify-content: center; z-index: 999999; backdrop-filter: blur(2px);
            }
            .addon-modal-card {
                background: #ffffff; border-radius: 22px; width: 540px; max-width: 95%;
                padding: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); box-sizing: border-box;
            }
            .addon-modal-header {
                font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 16px;
                border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; display: flex;
                justify-content: space-between; align-items: center;
            }
            .addon-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
            .addon-field label { display: block; font-size: 0.78rem; font-weight: 700; color: #64748b; margin-bottom: 5px; padding-left: 6px; }
            .addon-field input, .addon-field select {
                width: 100%; height: 40px; border: 1px solid #cbd5e1; border-radius: 20px;
                padding: 0 16px; font-size: 0.85rem; font-weight: 600; outline: none; background: #f8fafc;
                box-sizing: border-box; transition: border-color 0.15s;
            }
            .addon-field input:focus, .addon-field select:focus { border-color: #2563eb; background: #ffffff; }
            .addon-modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; border-top: 1px solid #f1f5f9; padding-top: 14px; }
        `;
        document.head.appendChild(style);
    }

    // ৩. টপবারে Add ও Edit বাটন যোগ করা
    function injectActionButtons() {
        const btnDownloadSample = document.getElementById('btnDownloadSample');
        if (!btnDownloadSample || document.getElementById('btnAddStudentAddon')) return;

        const parentBar = btnDownloadSample.parentNode;

        // Add Student Button
        const btnAdd = document.createElement('button');
        btnAdd.type = 'button';
        btnAdd.id = 'btnAddStudentAddon';
        btnAdd.className = 'btn-rounded-addon btn-addon-add';
        btnAdd.innerHTML = `<i class="fa-solid fa-user-plus"></i> Add Student`;
        btnAdd.onclick = () => openStudentModal(false);

        // Edit Student Button
        const btnEdit = document.createElement('button');
        btnEdit.type = 'button';
        btnEdit.id = 'btnEditStudentAddon';
        btnEdit.className = 'btn-rounded-addon btn-addon-edit';
        btnEdit.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Student`;
        btnEdit.disabled = true;
        btnEdit.onclick = () => openStudentModal(true);

        parentBar.appendChild(btnAdd);
        parentBar.appendChild(btnEdit);
    }

    // ৪. পপ-আপ ফর্ম তৈরি
    function injectModal() {
        if (document.getElementById('addonStudentModal')) return;

        const modalHTML = `
            <div class="addon-modal-overlay" id="addonStudentModal">
                <div class="addon-modal-card">
                    <div class="addon-modal-header">
                        <span id="addonModalTitle">Add New Student</span>
                        <span style="cursor:pointer; color:#94a3b8; font-size:18px; font-weight:bold;" id="btnCloseAddonModal">✕</span>
                    </div>

                    <form id="addonStudentForm">
                        <div class="addon-grid-2">
                            <div class="addon-field">
                                <label>STD ID *</label>
                                <input type="text" id="addonInpId" placeholder="e.g. 1400827" required autocomplete="off">
                            </div>
                            <div class="addon-field">
                                <label>Student Name *</label>
                                <input type="text" id="addonInpName" placeholder="Full Name" required autocomplete="off">
                            </div>
                        </div>

                        <div class="addon-grid-2">
                            <div class="addon-field">
                                <label>Class</label>
                                <input type="text" id="addonInpClass" placeholder="e.g. Nursery">
                            </div>
                            <div class="addon-field">
                                <label>Section</label>
                                <input type="text" id="addonInpSection" placeholder="e.g. Dhorola">
                            </div>
                        </div>

                        <div class="addon-grid-2">
                            <div class="addon-field">
                                <label>Category</label>
                                <select id="addonInpCat">
                                    <option value="Army">Army</option>
                                    <option value="Civil">Civil</option>
                                </select>
                            </div>
                            <div class="addon-field">
                                <label>Due Month</label>
                                <input type="text" id="addonInpMonth" placeholder="e.g. 1" value="1">
                            </div>
                        </div>

                        <div class="addon-grid-2">
                            <div class="addon-field">
                                <label>Due Amount (৳) *</label>
                                <input type="number" step="any" id="addonInpAmount" placeholder="0.00" required>
                            </div>
                            <div class="addon-field">
                                <label>Mobile Number</label>
                                <input type="text" id="addonInpMobile" placeholder="017xxxxxxxx">
                            </div>
                        </div>

                        <div class="addon-grid-2">
                            <div class="addon-field">
                                <label>Father's Name / Phone</label>
                                <input type="text" id="addonInpFather" placeholder="Name or Mobile">
                            </div>
                            <div class="addon-field">
                                <label>Mother's Name / Phone</label>
                                <input type="text" id="addonInpMother" placeholder="Name or Mobile">
                            </div>
                        </div>

                        <div class="addon-modal-footer">
                            <button type="button" class="btn-rounded-addon" style="background:#f1f5f9; color:#475569;" id="btnCancelAddonModal">Cancel</button>
                            <button type="submit" class="btn-rounded-addon btn-addon-add" id="btnSubmitAddonForm">Save Student</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // ইভেন্ট বাইন্ডিং
        document.getElementById('btnCloseAddonModal').onclick = closeStudentModal;
        document.getElementById('btnCancelAddonModal').onclick = closeStudentModal;
        document.getElementById('addonStudentForm').onsubmit = handleFormSubmit;
    }

    // ৫. টেবিলে যেকোনো ছাত্রের উপর মাউস ক্লিক ধরবে
    function initRowSelection() {
        document.addEventListener('click', async function (e) {
            const tr = e.target.closest('#dueDataTableBody tr');
            if (!tr || tr.cells.length < 4) return;

            // আগের সিলেকশন সরানো
            if (selectedRowElement) selectedRowElement.classList.remove('addon-row-selected');

            selectedRowElement = tr;
            selectedRowElement.classList.add('addon-row-selected');

            // টেবিলের সেল থেকে আইডি নেওয়া
            const stdId = tr.cells[3]?.innerText?.trim();
            if (!stdId || stdId === '-') return;

            const fb = await getFirebase();
            if (!fb) return;

            // ফায়ারবেস থেকে এই ছাত্রের সম্পূর্ণ তথ্য পাওয়া
            const snap = await fb.get(fb.ref(fb.db, 'erp/studentDueData'));
            if (snap.exists()) {
                const list = Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val());
                const found = list.find(s => String(s.stdId).trim() === stdId);
                if (found) {
                    selectedStudentData = found;
                    const btnEdit = document.getElementById('btnEditStudentAddon');
                    if (btnEdit) btnEdit.disabled = false;
                }
            }
        });
    }

    // ৬. মডাল ওপেন লজিক
    function openStudentModal(editMode) {
        isEditMode = editMode;
        const modal = document.getElementById('addonStudentModal');
        const title = document.getElementById('addonModalTitle');
        const submitBtn = document.getElementById('btnSubmitAddonForm');
        const form = document.getElementById('addonStudentForm');

        if (isEditMode) {
            if (!selectedStudentData) return;
            title.innerHTML = `<i class="fa-solid fa-pen-to-square" style="color:#d97706; margin-right:6px;"></i> Edit Student`;
            submitBtn.innerText = "Update Student";
            submitBtn.className = "btn-rounded-addon btn-addon-edit";

            // ডাটা বসানো
            document.getElementById('addonInpId').value = selectedStudentData.stdId || '';
            document.getElementById('addonInpId').readOnly = true; // এডিটের সময় আইডি ফিক্সড থাকবে
            document.getElementById('addonInpName').value = selectedStudentData.studentName || '';
            document.getElementById('addonInpClass').value = selectedStudentData.class || '';
            document.getElementById('addonInpSection').value = selectedStudentData.section || '';
            document.getElementById('addonInpCat').value = selectedStudentData.category || 'Civil';
            document.getElementById('addonInpMonth').value = selectedStudentData.monthDue || '1';
            document.getElementById('addonInpAmount').value = selectedStudentData.dueAmount || '0';
            document.getElementById('addonInpMobile').value = selectedStudentData.mobile || '';
            document.getElementById('addonInpFather').value = selectedStudentData.fathersName || '';
            document.getElementById('addonInpMother').value = selectedStudentData.mothersName || '';
        } else {
            title.innerHTML = `<i class="fa-solid fa-user-plus" style="color:#2563eb; margin-right:6px;"></i> Add New Student`;
            submitBtn.innerText = "Save Student";
            submitBtn.className = "btn-rounded-addon btn-addon-add";
            form.reset();
            document.getElementById('addonInpId').readOnly = false;
            document.getElementById('addonInpMonth').value = '1';
        }

        modal.style.display = 'flex';
    }

    function closeStudentModal() {
        const modal = document.getElementById('addonStudentModal');
        if (modal) modal.style.display = 'none';
    }

    // ৭. সেভ ও আপডেট লজিক (১০০% নিরাপদ: কোনো ডাটা ডিলিট হবে না)
    async function handleFormSubmit(e) {
        e.preventDefault();

        const stdId = document.getElementById('addonInpId').value.trim();
        const studentName = document.getElementById('addonInpName').value.trim();
        const sClass = document.getElementById('addonInpClass').value.trim() || '-';
        const section = document.getElementById('addonInpSection').value.trim() || '-';
        const category = document.getElementById('addonInpCat').value;
        const monthDue = document.getElementById('addonInpMonth').value.trim() || '1';
        const dueAmount = parseFloat(document.getElementById('addonInpAmount').value) || 0;
        const mobile = document.getElementById('addonInpMobile').value.trim() || '-';
        const father = document.getElementById('addonInpFather').value.trim() || '-';
        const mother = document.getElementById('addonInpMother').value.trim() || '-';

        const fb = await getFirebase();
        if (!fb) return alert("Firebase connection failed!");

        // আগের ডাটাবেস আনা
        const snap = await fb.get(fb.ref(fb.db, 'erp/studentDueData'));
        let currentList = snap.exists() ? (Array.isArray(snap.val()) ? snap.val() : Object.values(snap.val())) : [];

        if (isEditMode) {
            // ১. এডিট মোড: কেবল এই ছাত্রের তথ্য আপডেট হবে, বাকি সবাই অপরিবর্তিত থাকবে
            const index = currentList.findIndex(s => String(s.stdId).trim() === stdId);
            if (index !== -1) {
                currentList[index] = {
                    ...currentList[index],
                    studentName: studentName,
                    class: sClass,
                    section: section,
                    category: category,
                    monthDue: monthDue,
                    dueAmount: dueAmount,
                    mobile: mobile,
                    fathersName: father,
                    mothersName: mother
                };
            }
        } else {
            // ২. নতুন এন্ট্রি: চেক করা আইডি ডুপ্লিকেট কি না
            const exists = currentList.some(s => String(s.stdId).trim() === stdId);
            if (exists) {
                alert(`Student ID "${stdId}" already exists! Please use Edit instead.`);
                return;
            }

            // নতুন ছাত্র সবার শেষে নিরাপদে যুক্ত হবে
            currentList.push({
                class: sClass,
                section: section,
                stdId: stdId,
                studentName: studentName,
                category: category,
                monthDue: monthDue,
                dueItems: "Tuition Fee",
                dueAmount: dueAmount,
                mobile: mobile,
                fathersName: father,
                fathersMobile: "-",
                mothersName: mother,
                mothersMobile: "-"
            });
        }

        // নিরাপদভাবে ফায়ারবেসে রাইট করা
        await fb.set(fb.ref(fb.db, 'erp/studentDueData'), currentList);

        closeStudentModal();
        alert(isEditMode ? "Student updated successfully!" : "New student added successfully!");
    }

    // স্বয়ংক্রিয় লোডার
    let checkInterval = setInterval(() => {
        const btnDownloadSample = document.getElementById('btnDownloadSample');
        if (btnDownloadSample) {
            clearInterval(checkInterval);
            injectStyles();
            injectActionButtons();
            injectModal();
            initRowSelection();
        }
    }, 300);

})();
