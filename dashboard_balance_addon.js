/**
 * File: dashboard_balance_addon.js
 * Description: Adds ONLY ONE single matching card for "IN-HAND CASH & STOCK"
 * Font: 'Tiro Bangla', serif | Language: 100% English
 */

(function () {
    'use strict';

    function updateInHandCard() {
        // ১. আগের তৈরি হওয়া সব বাড়তি বড় বক্স ও স্টাইল মুছে ফেলা
        const oldTri = document.getElementById('mcDynamicHeroTriGrid');
        if (oldTri) oldTri.remove();

        const oldHero = document.querySelector('.fintech-hero-card');
        if (oldHero) oldHero.style.display = ''; // মূল টপ ব্যানার আগের মতো স্বাভাবিক রাখা হলো

        const grid = document.getElementById('dashboardSummaryGrid');
        if (!grid) return;

        // ২. মোট হাতে থাকা ব্যালেন্স হিসাব (Accounts + Cash + Card Stock)
        const store = typeof window.getERPStore === 'function' ? window.getERPStore() : {};
        const categories = store.categories || window.categories || [];
        const accounts = store.accounts || window.accounts || [];
        const balanceStore = store.balanceStore || window.balanceStore || {};

        let totalInHand = 0;

        // ব্যাংক, এজেন্ট, পার্সোনাল ও রিচার্জ একাউন্টের যোগফল
        categories.forEach(cat => {
            if (cat.enabled !== false) {
                const catAccs = accounts.filter(a => a.catId === cat.id && a.enabled !== false);
                catAccs.forEach(acc => {
                    totalInHand += (parseFloat(balanceStore[acc.id]) || 0);
                });
            }
        });

        // ক্যাশ ইনভেন্টরি
        if (typeof window.calculateCashGrandTotal === 'function') {
            totalInHand += window.calculateCashGrandTotal();
        } else {
            const denomList = [1000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
            const cashQ = store.cashQuantities || window.cashQuantities || {};
            denomList.forEach(d => {
                totalInHand += ((parseInt(cashQ[d]) || 0) * d);
            });
            totalInHand += (parseFloat(store.cashOthersAmount || window.cashOthersAmount) || 0);
        }

        // কার্ড ইনভেন্টরি স্টক
        if (typeof window.calculateGrandCardInventoryValue === 'function') {
            totalInHand += window.calculateGrandCardInventoryValue();
        }

        const formattedAmount = '৳ ' + totalInHand.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // ৩. অন্যান্য কার্ডের সাথে হুবহু মিল রেখে মাত্র ১টি কার্ড তৈরি বা আপডেট করা
        let card = document.getElementById('inHandSummaryCard');
        if (!card) {
            card = document.createElement('div');
            card.id = 'inHandSummaryCard';
            card.className = 'fintech-card';
            card.style.fontFamily = "'Tiro Bangla', serif";
            // গ্রিডের সবার প্রথমে কার্ডটি বসানো হলো
            grid.insertBefore(card, grid.firstChild);
        }

        card.innerHTML = `
            <div class="card-icon" style="background: #e0e7ff; color: #4338ca;">
                <i class="fa-solid fa-vault"></i>
            </div>
            <h4 style="font-family: 'Tiro Bangla', serif; text-transform: uppercase;">IN-HAND CASH & STOCK</h4>
            <div class="amount" style="font-family: 'Tiro Bangla', serif; color: #4338ca;">${formattedAmount}</div>
        `;
    }

    // পেজ লোড ও রিয়েলটাইম আপডেট
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(updateInHandCard, 500);
        setInterval(updateInHandCard, 2000);
    });
    setTimeout(updateInHandCard, 800);
    setInterval(updateInHandCard, 2000);
})();
