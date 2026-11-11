/**
 * Mousumi Computer ERP - Multi-Pending & Cash Calculator Addon
 * Mode: Standalone & Non-intrusive
 * Language: English (Short & Compact)
 */

(function () {
    let isMultiOnly = false;
    let isUpdatingLabel = false;

    // Helper: Parse currency
    function parseAmount(text) {
        if (!text) return 0;
        const clean = text.replace(/[^0-9.]/g, '');
        return parseFloat(clean) || 0;
    }

    // 1. Scan rows & count Student ID frequency
    function getIdCounts() {
        const counts = {};
        const rows = document.querySelectorAll('#pendingClearanceTableBody tr');
        rows.forEach(tr => {
            if (tr.cells.length >= 8) {
                const stdId = tr.cells[3]?.innerText.trim();
                if (stdId && /^\d+$/.test(stdId)) {
                    counts[stdId] = (counts[stdId] || 0) + 1;
                }
            }
        });
        return counts;
    }

    // 2. Update Multi button badge and state
    function updateMultiButtonState() {
        const btn = document.getElementById('btnToggleMultiPending');
        if (!btn) return;

        const counts = getIdCounts();
        const multiCount = Object.values(counts).filter(c => c > 1).length;

        if (isMultiOnly) {
            btn.innerHTML = `⚡ Multi Active (${multiCount}) ✕`;
            btn.style.background = '#dc2626';
            btn.style.color = '#ffffff';
            btn.style.borderColor = '#dc2626';
        } else {
            btn.innerHTML = `⚡ Multi (${multiCount})`;
            btn.style.background = multiCount > 0 ? '#fffbeb' : '#ffffff';
            btn.style.color = multiCount > 0 ? '#b45309' : '#64748b';
            btn.style.borderColor = multiCount > 0 ? '#f59e0b' : '#cbd5e1';
        }
    }

    // 3. Toggle Filter Action
    function toggleMultiFilter() {
        isMultiOnly = !isMultiOnly;
        applyMultiFilter();
    }

    function applyMultiFilter() {
        const counts = getIdCounts();
        const rows = document.querySelectorAll('#pendingClearanceTableBody tr');

        rows.forEach(tr => {
            if (tr.cells.length < 8) return;
            const stdId = tr.cells[3]?.innerText.trim();

            if (isMultiOnly) {
                if (counts[stdId] > 1) {
                    tr.style.display = '';
                    tr.style.backgroundColor = '#fffbeb';
                } else {
                    tr.style.display = 'none';
                    tr.style.backgroundColor = '';
                }
            } else {
                tr.style.display = '';
                tr.style.backgroundColor = '';
            }
        });

        updateMultiButtonState();
    }

    // 4. Inject Multi Button beside Filter button
    function injectMultiButton() {
        const trigger = document.getElementById('btnFilterAddTrigger');
        if (!trigger || document.getElementById('btnToggleMultiPending')) return false;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'btnToggleMultiPending';
        btn.className = 'btn-filter-add';
        btn.style.marginLeft = '8px';
        btn.style.fontWeight = '700';
        btn.style.transition = 'all 0.15s ease';
        btn.innerHTML = '⚡ Multi (0)';

        btn.addEventListener('click', toggleMultiFilter);
        trigger.parentNode.insertBefore(btn, trigger.nextSibling);

        updateMultiButtonState();
        return true;
    }

    // 5. Enhanced Selection Label (Cash + Tap calculation)
    function enhanceSelectedLabel() {
        if (isUpdatingLabel) return;
        const selectedLabel = document.getElementById('pendingSelectedLabel');
        if (!selectedLabel) return;

        const rows = document.querySelectorAll('#pendingClearanceTableBody tr');
        let selectedCount = 0;
        let totalTap = 0;
        let totalCash = 0;

        rows.forEach(tr => {
            if (tr.cells.length >= 8) {
                const chk = tr.querySelector('input.edu-checkbox');
                if (chk && chk.checked) {
                    selectedCount++;
                    totalTap += parseAmount(tr.cells[6]?.innerText);   // Col 6: TAP PAYABLE
                    totalCash += parseAmount(tr.cells[7]?.innerText);  // Col 7: COLLECTED (Cash)
                }
            }
        });

        if (selectedCount > 0) {
            isUpdatingLabel = true;
            selectedLabel.innerHTML = `
                <strong style="color:#0f172a;">${selectedCount} Selected</strong>
                <span style="color:#cbd5e1; margin:0 6px;">|</span>
                <span style="color:#15803d; font-weight:800; font-size:0.92rem;">Cash: ৳ ${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span style="color:#64748b; font-size:0.8rem; font-weight:600; margin-left:6px;">(Tap: ৳ ${totalTap.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
            `;
            setTimeout(() => { isUpdatingLabel = false; }, 50);
        }
    }

    // 6. Listeners & Observers
    function setupObservers() {
        const tbody = document.getElementById('pendingClearanceTableBody');
        const selectedLabel = document.getElementById('pendingSelectedLabel');

        if (tbody) {
            const tableObserver = new MutationObserver(() => {
                if (isMultiOnly) applyMultiFilter();
                else updateMultiButtonState();
                enhanceSelectedLabel();
            });
            tableObserver.observe(tbody, { childList: true, subtree: true });
        }

        if (selectedLabel) {
            const labelObserver = new MutationObserver(() => {
                enhanceSelectedLabel();
            });
            labelObserver.observe(selectedLabel, { childList: true, characterData: true });
        }

        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('edu-checkbox') || e.target.id === 'selectAllPendingCheckbox') {
                setTimeout(enhanceSelectedLabel, 30);
            }
        });
    }

    // 7. Auto-detect & Wait for Main Module to load
    let attempts = 0;
    const waiter = setInterval(() => {
        attempts++;
        const injected = injectMultiButton();
        if (injected) {
            setupObservers();
            clearInterval(waiter);
        }
        if (attempts > 50) { // 25 seconds timeout
            clearInterval(waiter);
        }
    }, 500);

})();
