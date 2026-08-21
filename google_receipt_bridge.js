/**
 * Mousumi Computer ERP - Google Sheet Direct A5 Receipt Bridge
 */

(function () {
    // ⚠️ নিচে আপনার গুগল অ্যাপস স্ক্রিপ্ট ডিপ্লয়মেন্টের Web App URL বসান:
    const GOOGLE_WEB_APP_URL = "YOUR_GOOGLE_WEB_APP_URL_HERE";

    function attachSubmitListener() {
        const form = document.getElementById('feeFormOriginal');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            // ফর্মের তথ্য সংগ্রহ
            const studentId = document.getElementById('origId')?.value.trim();
            const studentName = document.getElementById('origName')?.value.trim();
            const netDue = parseFloat(document.getElementById('origDue')?.value) || 0;
            const txnFee = parseFloat(document.getElementById('origTxn')?.value) || 0;
            const discount = parseFloat(document.getElementById('origDisc')?.value) || 0;
            const netReceived = parseFloat(document.getElementById('origRec')?.value) || 0;
            const date = document.getElementById('origDate')?.value || new Date().toISOString().split('T')[0];

            if (!studentId || netReceived <= 0) return;

            if (typeof showLoader === 'function') {
                showLoader("গুগল শিট থেকে আসল A5 রিসিট জেনারেট হচ্ছে...");
            }

            const payload = {
                studentId: studentId,
                studentName: studentName || 'N/A',
                netDue: netDue,
                txnFee: txnFee,
                discount: discount,
                netReceived: netReceived,
                date: date
            };

            try {
                const res = await fetch(GOOGLE_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify(payload)
                });

                const result = await res.json();

                if (result.status === "success" && result.pdfUrl) {
                    if (typeof showToast === 'function') {
                        showToast(`রিসিট #${result.serialNumber} তৈরি হয়েছে! ডাউনলোড হচ্ছে...`, "success");
                    }
                    
                    // গুগল শিটের ডিজাইন করা PDF ফাইল নতুন ট্যাবে ডাউনলোড হবে
                    const link = document.createElement('a');
                    link.href = result.pdfUrl;
                    link.download = `Receipt_${result.serialNumber}_${studentId}.pdf`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                } else {
                    throw new Error(result.message || "গুগল শিট থেকে এরর এসেছে");
                }
            } catch (err) {
                console.error("Google Sheet PDF Bridge Error:", err);
                if (typeof showToast === 'function') {
                    showToast("গুগল শিট রিসিট তৈরি করতে সমস্যা হয়েছে: " + err.message, "error");
                }
            } finally {
                if (typeof hideLoader === 'function') hideLoader();
            }
        }, true); // Use capture to seamlessly sync alongside existing actions
    }

    window.addEventListener('load', attachSubmitListener);
})();
