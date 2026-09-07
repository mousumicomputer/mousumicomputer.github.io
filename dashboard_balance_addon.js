/**
 * File: dashboard_balance_addon.js
 * Description: Places "IN-HAND CASH & STOCK" separately at the top row alongside "Total Net Balance"
 * Font: 'Tiro Bangla', serif | Language: 100% English
 */

(function () {
    'use strict';

    // টপ হিরো সেকশনের জন্য ২-কলাম রেসপনসিভ সিএসএস
    const style = document.createElement('style');
    style.innerHTML = `
        .mc-top-kpi-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 16px;
            margin-bottom: 25px;
            font-family: 'Tiro Bangla', serif !important;
        }
        .mc-inhand-hero-card {
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            padding: 20px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.03);
            border-left: 5px solid #4f46e5;
            font-family: 'Tiro Bangla', serif !important;
        }
        .mc-inhand-hero-card * {
            font-family: 'Tiro Bangla', serif !important;
        }
        .mc-inhand-info h3 {
            font-size: 1.05rem;
            color: #1e293b;
            font-weight: 700;
            margin: 0 0 4px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .mc-inhand-info p {
            font-size: 0.8rem;
            color: #64748b;
            margin: 0;
            font-weight: 500;
        }
        .mc-inhand-amount {
            font-size: 1.9rem;
            font-weight: 800;
            color: #4f46e5;
            text-align: right;
            white-space: nowrap;
        }
    `;
    document.head.appendChild(style);

    function updateInHandCard() {
        // ১. নিচের সাধারণ গ্রিড থেকে পুরনো কোনো কার্ড থাকলে মুছে ফেলা
        const oldGridCard = document.getElementById('inHandSummaryCard');
        if (oldGridCard) oldGridCard.remove();

        // ২. ডাটা ক্যালকুলেশন (Accounts + Cash + Card Stock)
        const store = typeof window.getERPStore === 'function' ? window.getERPStore() : {};
        const categories = store.categories || window.categories || [];
        const accounts = store.accounts || window.accounts || [];
        const balanceStore = store.balanceStore || window.balanceStore || {};

        let totalInHand = 0;

        // ব্যাংক, এজেন্ট, পার্সোনাল ও রিচার্জ একাউন্ট
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
        let cardStockVal = 0;
        const cardConfig = store.cardConfig || window.cardConfig || {};
        const cardQuantities = store.cardQuantities || window.cardQuantities || {};
        const ops = ['GP', 'Banglalink', 'Robi', 'Airtel'];

        ops.forEach(op => {
            const cList = Array.isArray(cardConfig[op]) ? cardConfig[op] : Object.values(cardConfig[op] || {});
            const qList = cardQuantities[op] || {};
            cList.forEach(card => {
                const q = parseInt(qList[card.id]) || 0;
                cardStockVal += (q * (parseFloat(card.price) || 0));
            });
        });

        if (cardStockVal === 0) {
            document.querySelectorAll('#dashboardSummaryGrid .fintech-card').forEach(c => {
                const h4 = c.querySelector('h4');
                if (h4 && h4.innerText.includes('CARD INVENTORY')) {
                    const amtText = c.querySelector('.amount')?.innerText || '0';
                    cardStockVal = parseFloat(amtText.replace(/[^\d.]/g, '')) || 0;
                }
            });
        }

        totalInHand += cardStockVal;

        const formattedAmount = '৳ ' + totalInHand.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // ৩. টপ ব্যানারকে ২ কলাম কন্টেইনারে রূপান্তর করা
        const originalHero = document.querySelector('.fintech-hero-card');
        if (!originalHero) return;

        let topContainer = document.getElementById('mcTopKpiContainer');
        if (!topContainer) {
            topContainer = document.createElement('div');
            topContainer.id = 'mcTopKpiContainer';
            topContainer.className = 'mc-top-kpi-container';
            
            // অরিজিনাল কার্ডের পূর্বে কন্টেইনার ঢুকানো
            originalHero.parentNode.insertBefore(topContainer, originalHero);
            
            // নতুন ইন-হ্যান্ড কার্ড
            const inHandHero = document.createElement('div');
            inHandHero.id = 'inHandTopCard';
            inHandHero.className = 'mc-inhand-hero-card';
            inHandHero.innerHTML = `
                <div class="mc-inhand-info">
                    <h3>In-Hand Cash & Stock</h3>
                    <p>Cash Drawer + Banks + Wallets + SIMs + Cards</p>
                </div>
                <div class="mc-inhand-amount" id="inHandTopAmount">৳ 0.00</div>
            `;

            topContainer.appendChild(inHandHero);
            topContainer.appendChild(originalHero); // অরিজিনাল Hero কার্ডটি এর পাশে নেওয়া হলো
        }

        // লাইভ ব্যালেন্স আপডেট
        const amtEl = document.getElementById('inHandTopAmount');
        if (amtEl) amtEl.innerText = formattedAmount;
    }

    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(updateInHandCard, 500);
        setInterval(updateInHandCard, 2000);
    });
    setTimeout(updateInHandCard, 800);
    setInterval(updateInHandCard, 2000);
})();
