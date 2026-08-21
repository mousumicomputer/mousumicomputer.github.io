/**
 * Mousumi Computer ERP - Google Sheet Direct A5 Receipt Bridge
 * Auto pushes form submission to Google Sheet and triggers A5 PDF download.
 */

(function () {
    // আপনার ডিপ্লয়কৃত Web App URL
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyKE66KEqM1yoYihUfyhGptC3Txk2RCCuJuPqZvPcRy3dLYJUZiL2NuOEa-rphiFa-qBw/exec";

    function attachSubmitListener() {
        const form = document.getElementById('feeFormOriginal');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            // ফর্মের ফিল্ডগুলো থেকে ডেটা নেওয়া
            const studentId = document.getElementById('origId')?.value.trim();
            const studentName = document.getElementById('origName')?.value.trim();
            const netDue = parseFloat(document.getElementById('origDue')?.value) || 0;
            const txnFee = parseFloat(document.getElementById('origTxn')?.value) || 0;
            const discount = parseFloat(document.getElementById('origDisc')?.value) || 0;
            const netReceived = parseFloat(document.getElementById('origRec')?.value) || 0;
            const date = document.getElementById('origDate')?.value || new Date().toISOString().split('T')[0];

            if (!studentId || netReceived <= 0) return;

            if (typeof showLoader === 'function') {
                showLoader("গুগল শিটে ডাটা এন্ট্রি ও আসল A5 রিসিট জেনারেট হচ্ছে...");
            }

            const payload = {
                studentId: studentId,
                studentName: studentName || 'Student',
                netDue: netDue,
                txnFee: txnFee,
                discount: discount,
                netReceived: netReceived,
                date: date
            };

            try {
                // গুগল অ্যাপস স্ক্রিপ্ট ওয়েব অ্যাপে ডেটা পাঠানো (no-cors রিডাইরেক্ট সেফলি হ্যান্ডেল করার জন্য text/plain ব্যবহার করা হয়েছে)
                const res = await fetch(GOOGLE_WEB_APP_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'text/plain;charset=utf-8'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();

                if (result.status === "success" && result.pdfUrl) {
                    if (typeof showToast === 'function') {
                        showToast(`রিসিট #${result.serialNumber} সফলভাবে তৈরি হয়েছে! ডাউনলোড হচ্ছে...`, "success");
                    }

                    // গুগল শিট থেকে তৈরি করা আসল ডিজাইনের PDF টি সরাসরি ওপেন / ডাউনলোড করা
                    const win = window.open(result.pdfUrl, '_blank');
                    if (!win) {
                        // পপআপ ব্লক থাকলে সরাসরি লিংকে ক্লিক করানো হবে
                        const dlLink = document.createElement('a');
                        dlLink.href = result.pdfUrl;
                        dlLink.target = '_blank';
                        dlLink.download = `Receipt_${result.serialNumber}_${studentId}.pdf`;
                        document.body.appendChild(dlLink);
                        dlLink.click();
                        dlLink.remove();
                    }
                } else {
                    throw new Error(result.message || "গুগল শিট থেকে রেসপন্স পেতে সমস্যা হয়েছে");
                }
            } catch (err) {
                console.error("Google Sheet PDF Bridge Error:", err);
                if (typeof showToast === 'function') {
                    showToast("গুগল শিটে রিসিট প্রসেস করতে সমস্যা হয়েছে: " + err.message, "error");
                }
            } finally {
                if (typeof hideLoader === 'function') {
                    hideLoader();
                }
            }
        }, true);
    }

    // পেজ পুরোপুরি লোড হওয়ার পর ব্রিজ কানেক্ট হবে
    if (document.readyState === 'complete') {
        attachSubmitListener();
    } else {
        window.addEventListener('load', attachSubmitListener);
    }
})();
