/**
 * Mousumi Computer ERP - 3-Way Pending Splitter & Smart Cash Calculator
 * Mode: Standalone & Non-intrusive (Zero Data Loss)
 * Language: English (Short & Compact)
 */

(function () {
    let activeFilter = null; // null | 'multi' | 'old' | 'current'
    let isUpdatingLabel = false;

    // Helper: Parse currency strings to numeric
    function parseAmount(text) {
        if (!text) return 0;
        const clean = text.replace(/[^0-9.]/g, '');
        return parseFloat(clean) || 0;
    }

    // Helper: Extract transaction ID from row
    function getRowTxId(tr) {
        const match = tr.innerHTML.match(/togglePendingRowSelection\('([^']+)'/);
        return match ? match[1] : null;
    }

    // Helper: Parse row date (Format: DD-MM-YYYY)
    function parseRowDate(text) {
        if (!text) return null;
        const match = text.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (!match) return null;
        return {
            day: parseInt(match[1]),
            month: parseInt(match[2]),
            year: parseInt(match[3])
        };
    }

    // Determine the latest/current month in the pending records
    function getActiveMonthYear(rows) {
        let maxYear = 0, maxMonth = 0;
        rows.forEach(tr => {
            if (tr.cells.length >= 8) {
                const dt = parseRowDate(tr.cells[2]?.innerText);
                if (dt) {
                    if (dt.year > maxYear || (dt.year === maxYear && dt.month > maxMonth)) {
                        maxYear = dt.year;
                        maxMonth = dt.month;
                    }
                }
            }
        });
        if (maxYear === 0) {
            const now = new Date();
            return { year: now.getFullYear(), month: now.getMonth() + 1 };
        }
        return { year: maxYear, month: maxMonth };
    }

    // Scan table and categorize each row
    function scanAndCategorize() {
        const rows = document.querySelectorAll('#pendingClearanceTableBody tr');
        const idCounts = {};
        const validRows = [];

        rows.forEach(tr => {
            if (tr.cells.length >= 8) {
                const stdId = tr.cells[3]?.innerText.trim();
                if (stdId && /^\d+$/.test(stdId)) {
                    idCounts[stdId] = (idCounts[stdId] || 0) + 1;
                    validRows.push(tr);
                }
            }
        });

        const activeMY = getActiveMonthYear(validRows);

        let multiUniqueIds = new Set();
        let oldRowCount = 0;
        let currentRowCount = 0;

        validRows.forEach(tr => {
            const stdId = tr.cells[3]?.innerText.trim();
            const dt = parseRowDate(tr.cells[2]?.innerText);
            const isMulti = idCounts[stdId] > 1;

            if (isMulti) {
                multiUniqueIds.add(stdId);
            } else if (dt) {
                const isCurrentMonth = (dt.year === activeMY.year && dt.month === activeMY.month);
                if (isCurrentMonth) {
                    currentRowCount++;
                } else {
                    oldRowCount++;
                }
            }
        });

        return {
            idCounts,
            activeMY,
            multiCount: multiUniqueIds.size,
            oldCount: oldRowCount,
            currentCount: currentRowCount
        };
    }

    // Update buttons appearance and counts
    function updateButtonsUI() {
        const data = scanAndCategorize();

        const btnMulti = document.getElementById('btnToggleMulti');
        const btnOld = document.getElementById('btnToggleOld');
        const btnCurrent = document.getElementById('btnToggleCurrent');

        if (btnMulti) {
            btnMulti.innerHTML = activeFilter === 'multi' ? `⚡ Multi Active (${data.multiCount}) ✕` : `⚡ Multi (${data.multiCount})`;
            btnMulti.style.background = activeFilter === 'multi' ? '#dc2626' : (data.multiCount > 0 ? '#fffbeb' : '#ffffff');
            btnMulti.style.color = activeFilter === 'multi' ? '#ffffff' : (data.multiCount > 0 ? '#b45309' : '#64748b');
            btnMulti.style.borderColor = activeFilter === 'multi' ? '#dc2626' : (data.multiCount > 0 ? '#f59e0b' : '#cbd5e1');
        }

        if (btnOld) {
            btnOld.innerHTML = activeFilter === 'old' ? `⏳ Old Active (${data.oldCount}) ✕` : `⏳ Old (${data.oldCount})`;
            btnOld.style.background = activeFilter === 'old' ? '#7c3aed' : (data.oldCount > 0 ? '#f5f3ff' : '#ffffff');
            btnOld.style.color = activeFilter === 'old' ? '#ffffff' : (data.oldCount > 0 ? '#6d28d9' : '#64748b');
            btnOld.style.borderColor = activeFilter === 'old' ? '#7c3aed' : (data.oldCount > 0 ? '#a78bfa' : '#cbd5e1');
        }

        if (btnCurrent) {
            btnCurrent.innerHTML = activeFilter === 'current' ? `📅 Current Active (${data.currentCount}) ✕` : `📅 Current (${data.currentCount})`;
            btnCurrent.style.background = activeFilter === 'current' ? '#059669' : (data.currentCount > 0 ? '#ecfdf5' : '#ffffff');
            btnCurrent.style.color = activeFilter === 'current' ? '#ffffff' : (data.currentCount > 0 ? '#047857' : '#64748b');
            btnCurrent.style.borderColor = activeFilter === 'current' ? '#059669' : (data.currentCount > 0 ? '#34d399' : '#cbd5e1');
        }
    }

    // Filter Trigger
    function setFilter(type) {
        if (activeFilter === type) {
            activeFilter = null; // Toggle OFF
        } else {
            activeFilter = type; // Toggle ON
        }
        applyFilter();
    }

    // Apply Filter to DOM rows
    function applyFilter() {
        const data = scanAndCategorize();
        const rows = document.querySelectorAll('#pendingClearanceTableBody tr');

        rows.forEach(tr => {
            if (tr.cells.length < 8) return;
            const stdId = tr.cells[3]?.innerText.trim();
            const dt = parseRowDate(tr.cells[2]?.innerText);
            const isMulti = data.idCounts[stdId] > 1;
            const isCurrentMonth = dt ? (dt.year === data.activeMY.year && dt.month === data.activeMY.month) : false;

            let shouldShow = true;
            let highlightBg = '';

            if (activeFilter === 'multi') {
                shouldShow = isMulti;
                highlightBg = '#fffbeb';
            } else if (activeFilter === 'old') {
                shouldShow = !isMulti && !isCurrentMonth;
                highlightBg = '#f5f3ff';
            } else if (activeFilter === 'current') {
                shouldShow = !isMulti && isCurrentMonth;
                highlightBg = '#ecfdf5';
            }

            if (shouldShow) {
                tr.style.display = '';
                tr.style.backgroundColor = activeFilter ? highlightBg : '';
            } else {
                tr.style.display = 'none';
                tr.style.backgroundColor = '';
                // Uncheck hidden rows so they don't corrupt selection
                const chk = tr.querySelector('input.edu-checkbox');
                if (chk && chk.checked) {
                    chk.checked = false;
                    tr.classList.remove('row-selected');
                }
            }
        });

        updateButtonsUI();
        enhanceSelectedLabel();
    }

    // Inject 3 Filter Buttons
    function injectActionButtons() {
        const trigger = document.getElementById('btnFilterAddTrigger');
        if (!trigger || document.getElementById('btnToggleMulti')) return false;

        const container = document.createElement('div');
        container.id = 'quickFilterButtonGroup';
        container.style.display = 'inline-flex';
        container.style.alignItems = 'center';
        container.style.gap = '6px';
        container.style.marginLeft = '8px';

        container.innerHTML = `
            <button type="button" class="btn-filter-add" id="btnToggleMulti" style="font-weight:700;">⚡ Multi (0)</button>
            <button type="button" class="btn-filter-add" id="btnToggleOld" style="font-weight:700;">⏳ Old (0)</button>
            <button type="button" class="btn-filter-add" id="btnToggleCurrent" style="font-weight:700;">📅 Current (0)</button>
        `;

        trigger.parentNode.insertBefore(container, trigger.nextSibling);

        document.getElementById('btnToggleMulti').addEventListener('click', () => setFilter('multi'));
        document.getElementById('btnToggleOld').addEventListener('click', () => setFilter('old'));
        document.getElementById('btnToggleCurrent').addEventListener('click', () => setFilter('current'));

        updateButtonsUI();
        return true;
    }

    // Accurate Cash & Tap Calculation (Only Visible Checked Rows)
    function enhanceSelectedLabel() {
        if (isUpdatingLabel) return;
        const selectedLabel = document.getElementById('pendingSelectedLabel');
        if (!selectedLabel) return;

        const rows = document.querySelectorAll('#pendingClearanceTableBody tr');
        let selectedCount = 0;
        let totalTap = 0;
        let totalCash = 0;

        rows.forEach(tr => {
            // Count ONLY visible rows
            if (tr.style.display !== 'none' && tr.cells.length >= 8) {
                const chk = tr.querySelector('input.edu-checkbox');
                if (chk && chk.checked) {
                    selectedCount++;
                    totalTap += parseAmount(tr.cells[6]?.innerText);
                    totalCash += parseAmount(tr.cells[7]?.innerText);
                }
            }
        });

        isUpdatingLabel = true;
        if (selectedCount > 0) {
            selectedLabel.innerHTML = `
                <strong style="color:#0f172a;">${selectedCount} Selected</strong>
                <span style="color:#cbd5e1; margin:0 6px;">|</span>
                <span style="color:#15803d; font-weight:800; font-size:0.92rem;">Cash: ৳ ${totalCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span style="color:#64748b; font-size:0.8rem; font-weight:600; margin-left:6px;">(Tap: ৳ ${totalTap.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
            `;
        } else {
            selectedLabel.innerHTML = `<span>No student selected</span>`;
        }
        setTimeout(() => { isUpdatingLabel = false; }, 40);
    }

    // Smart Select-All Checkbox (Operates ONLY on Visible Rows)
    function setupSmartSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAllPendingCheckbox');
        if (!selectAllCheckbox) return;

        selectAllCheckbox.addEventListener('click', function (e) {
            if (!activeFilter) return; // If no filter active, let default behavior run

            e.stopImmediatePropagation();
            const checked = this.checked;

            const visibleIds = [];
            const rows = document.querySelectorAll('#pendingClearanceTableBody tr');

            rows.forEach(tr => {
                if (tr.style.display !== 'none' && tr.cells.length >= 8) {
                    const txId = getRowTxId(tr);
                    if (txId) visibleIds.push(txId);
                    const chk = tr.querySelector('input.edu-checkbox');
                    if (chk) chk.checked = checked;
                    if (checked) tr.classList.add('row-selected');
                    else tr.classList.remove('row-selected');
                } else {
                    const chk = tr.querySelector('input.edu-checkbox');
                    if (chk) chk.checked = false;
                    tr.classList.remove('row-selected');
                }
            });

            if (typeof window.toggleSelectAllPending === 'function') {
                window.toggleSelectAllPending(checked, visibleIds);
            }

            enhanceSelectedLabel();
        }, true); // Capture phase
    }

    // DOM Observers
    function setupObservers() {
        const tbody = document.getElementById('pendingClearanceTableBody');
        const selectedLabel = document.getElementById('pendingSelectedLabel');

        if (tbody) {
            const tableObserver = new MutationObserver(() => {
                if (activeFilter) applyFilter();
                else updateButtonsUI();
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
            if (e.target.classList.contains('edu-checkbox')) {
                setTimeout(enhanceSelectedLabel, 20);
            }
        });
    }

    // Auto-detect and initialization
    let attempts = 0;
    const waiter = setInterval(() => {
        attempts++;
        if (injectActionButtons()) {
            setupSmartSelectAll();
            setupObservers();
            clearInterval(waiter);
        }
        if (attempts > 50) clearInterval(waiter);
    }, 400);

})();
