(function () {
    const GOOGLE_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyKE66KEqM1yoYihUfyhGptC3Txk2RCCuJuPqZvPcRy3dLYJUZiL2NuOEa-rphiFa-qBw/exec";

    function attachSubmitListener() {
        const form = document.getElementById('feeFormOriginal');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            const studentId = document.getElementById('origId')?.value.trim();
            const studentName = document.getElementById('origName')?.value.trim();
            const netDue = parseFloat(document.getElementById('origDue')?.value) || 0;
            const txnFee = parseFloat(document.getElementById('origTxn')?.value) || 0;
            const discount = parseFloat(document.getElementById('origDisc')?.value) || 0;
            const netReceived = parseFloat(document.getElementById('origRec')?.value) || 0;
            const date = document.getElementById('origDate')?.value || new Date().toISOString().split('T')[0];

            if (!studentId || netReceived <= 0) return;

            if (typeof showLoader === 'function') {
                showLoader("রিসিট জেনারেট হচ্ছে...");
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
                const res = await fetch(GOOGLE_WEB_APP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(payload)
                });

                const result = await res.json();

                if (result.status === "success" && result.base64Pdf) {
                    if (typeof showToast === 'function') {
                        showToast(`রিসিট #${result.serialNumber} তৈরি হয়েছে!`, "success");
                    }

                    // সরাসরি মেমরি থেকে ইনস্ট্যান্ট ডাউনলোড (০ সেকেন্ড ডাউনলোড ডিলে)
                    const byteCharacters = atob(result.base64Pdf);
                    const byteNumbers = new Array(byteCharacters.length);
                    for (let i = 0; i < byteCharacters.length; i++) {
                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                    }
                    const byteArray = new Uint8Array(byteNumbers);
                    const blob = new Blob([byteArray], { type: 'application/pdf' });

                    const blobUrl = URL.createObjectURL(blob);
                    const dlLink = document.createElement('a');
                    dlLink.href = blobUrl;
                    dlLink.download = `Receipt_${result.serialNumber}_${studentId}.pdf`;
                    document.body.appendChild(dlLink);
                    dlLink.click();
                    dlLink.remove();
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                } else {
                    throw new Error(result.message || "এরর হয়েছে");
                }
            } catch (err) {
                console.error("PDF Bridge Error:", err);
                if (typeof showToast === 'function') {
                    showToast("সমস্যা: " + err.message, "error");
                }
            } finally {
                if (typeof hideLoader === 'function') hideLoader();
            }
        }, true);
    }

    if (document.readyState === 'complete') {
        attachSubmitListener();
    } else {
        window.addEventListener('load', attachSubmitListener);
    }
})();
