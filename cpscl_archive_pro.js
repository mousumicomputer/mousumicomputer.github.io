/**
 * CPSCL Academic Evaluation - Super Admin Archive Engine (PRO ADDON)
 * File: cpscl_archive_pro.js
 * Architecture: 100% Non-destructive Read-Only Addon
 * Bug Fix: Tab Visibility Isolation + FontAwesome Icon Specificity Enforcer
 */

(function () {
    // ==========================================================
    // ১. আল্ট্রা-কম্প্যাক্ট ও নিরাপদ সিএসএস ইনজেকশন
    // ==========================================================
    const archiveStyle = document.createElement('style');
    archiveStyle.id = 'cpscl-archive-pro-style';
    archiveStyle.innerHTML = `
        /* ১. ডিসপ্লে ফিক্স: অন্য কোনো মেনুতে দেখাবে না, শুধু active হলে দেখাবে */
        #eval-archive-sec {
            display: none !important;
            width: 100%;
        }
        #eval-archive-sec.active {
            display: flex !important;
            flex-direction: column;
            gap: 8px;
            font-family: 'Inter', 'Plus Jakarta Sans', sans-serif !important;
        }

        /* ২. আইকন ফিক্স: Tiro Bangla ফন্ট ওভাররাইড করে FontAwesome নিশ্চিত করা */
        #eval-archive-sec i, 
        #eval-archive-sec .fa, 
        #eval-archive-sec .fas, 
        #eval-archive-sec .fa-solid, 
        #eval-archive-sec [class*="fa-"],
        #arcSigModal i,
        #arcSigModal [class*="fa-"] {
            font-family: "Font Awesome 6 Free", "FontAwesome" !important;
            font-weight: 900 !important;
            font-style: normal !important;
            display: inline-block !important;
            line-height: 1 !important;
            text-rendering: auto !important;
            -webkit-font-smoothing: antialiased !important;
        }

        .arc-pill-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 10px 16px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }

        .arc-top-strip {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
        }

        .arc-pill-dropdown {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            border: 1.5px solid #0284c7;
            border-radius: 9999px;
            padding: 3px 12px;
            background: #ffffff;
        }
        .arc-pill-dropdown select {
            border: none;
            background: transparent;
            font-size: 12px;
            font-weight: 700;
            color: #0369a1;
            outline: none;
            cursor: pointer;
        }

        .arc-kpi-group {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        .arc-kpi-chip {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            color: #334155;
        }
        .arc-kpi-chip.highlight { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
        .arc-kpi-chip.success { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }

        .arc-locked-badge {
            background: #fef2f2;
            border: 1px solid #fecaca;
            color: #dc2626;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 9999px;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .arc-controls-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
        }
        .arc-title-box h2 {
            font-size: 15px;
            font-weight: 800;
            color: #1e3a8a;
            line-height: 1.2;
            margin: 0;
        }
        .arc-title-box .meta {
            font-size: 11px;
            color: #64748b;
            margin-top: 2px;
        }

        .arc-action-toolbar {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        .arc-search-pill {
            display: flex;
            align-items: center;
            border: 1px solid #e2e8f0;
            border-radius: 9999px;
            padding: 2px 10px;
            height: 30px;
            background: #ffffff;
        }
        .arc-search-pill input {
            border: none;
            outline: none;
            font-size: 11px;
            width: 130px;
        }
        .arc-stream-select {
            height: 30px;
            border: 1.5px solid #cbd5e1;
            border-radius: 9999px;
            padding: 0 10px;
            font-size: 11px;
            font-weight: 700;
            outline: none;
            cursor: pointer;
            background: #ffffff;
            color: #0f172a;
        }

        .arc-btn-pill {
            height: 30px;
            padding: 0 14px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            border: none;
            color: #ffffff;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s ease;
        }
        .arc-btn-pill:hover { opacity: 0.9; transform: translateY(-1px); }
        .arc-btn-pdf { background-color: #1d4ed8; }
        .arc-btn-excel { background-color: #15803d; }
        .arc-btn-blank { background-color: #334155; }
        .arc-btn-admin { background-color: #7c3aed; }

        .arc-table-container {
            width: 100%;
            overflow-x: auto;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #ffffff;
        }
        .arc-table {
            width: 100%;
            border-collapse: collapse;
            text-align: center;
            font-size: 11.5px;
            white-space: nowrap;
        }
        .arc-table thead th {
            background: #f8fafc;
            color: #334155;
            font-weight: 700;
            padding: 6px 8px;
            border-bottom: 1.5px solid #cbd5e1;
            border-right: 1px solid #f1f5f9;
            font-size: 11px;
        }
        .arc-table tbody td {
            padding: 5px 8px;
            border-bottom: 1px solid #f1f5f9;
            border-right: 1px solid #f8fafc;
            color: #1e293b;
        }
        .arc-table tbody tr:hover { background-color: #f8faff; }
        .arc-col-total { background: #eff6ff !important; color: #1d4ed8; font-weight: 800; }
        .arc-merit-tag {
            background: #f1f5f9;
            color: #0f172a;
            padding: 1px 7px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 10.5px;
        }
        .arc-merit-tag.top { background: #fef3c7; color: #b45309; }

        /* Super Admin Modal Scoped */
        .arc-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.45);
            backdrop-filter: blur(2px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999999;
        }
        .arc-modal-box {
            background: #ffffff;
            border-radius: 18px;
            width: 92%;
            max-width: 440px;
            padding: 18px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            border: 1px solid #e2e8f0;
        }
        .arc-sig-row {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #f8fafc;
            padding: 6px 10px;
            border-radius: 9999px;
            border: 1px solid #e2e8f0;
            margin-bottom: 6px;
        }
        .arc-sig-input {
            border: 1px solid #cbd5e1;
            border-radius: 9999px;
            padding: 4px 10px;
            font-size: 12px;
            flex-grow: 1;
            outline: none;
            background: #ffffff;
        }
    `;
    document.head.appendChild(archiveStyle);

    // MASTER SUBJECT DEFINITIONS
    const MASTER_SUBJECTS = {
        Science: [
            { key: 'B1', name: 'Bangla 1st' }, { key: 'B2', name: 'Bangla 2nd' },
            { key: 'E1', name: 'English 1st' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'HM_AG', name: 'HM/AG' },
            { key: 'Phy', name: 'Physics' }, { key: 'Che', name: 'Chemistry' },
            { key: 'Bio', name: 'Biology' }, { key: 'BGS', name: 'BGS' },
            { key: 'Reli', name: 'Religion' }, { key: 'ICT', name: 'ICT' }
        ],
        Humanities: [
            { key: 'B1', name: 'Bangla 1st' }, { key: 'B2', name: 'Bangla 2nd' },
            { key: 'E1', name: 'English 1st' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'AG_HE', name: 'AG/HE' },
            { key: 'His', name: 'History' }, { key: 'Geo', name: 'Geography' },
            { key: 'Civ', name: 'Civics' }, { key: 'Sci', name: 'General Science' },
            { key: 'Reli', name: 'Religion' }, { key: 'ICT', name: 'ICT' }
        ],
        BStudies: [
            { key: 'B1', name: 'Bangla 1st' }, { key: 'B2', name: 'Bangla 2nd' },
            { key: 'E1', name: 'English 1st' }, { key: 'E2', name: 'English 2nd' },
            { key: 'Math', name: 'General Math' }, { key: 'AG_HE', name: 'AG/HE' },
            { key: 'Fin', name: 'Finance' }, { key: 'Acc', name: 'Accounting' },
            { key: 'BE', name: 'Business Ent.' },
            { key: 'Sci', name: 'General Science' }, { key: 'Reli', name: 'Religion' },
            { key: 'ICT', name: 'ICT' }
        ]
    };

    // INTERNAL READ-ONLY STATE
    let _db = null, _ref = null, _get = null;
    let archivesMap = {};
    let activeArchiveId = null;
    let activeArchiveData = null;
    let cachedStudents = [];

    // SUPER ADMIN SIGNATURE CONFIG
    const DEFAULT_SIGNATURES = [
        { id: 1, title: "Course Coordinator", active: true },
        { id: 2, title: "Vice Principal", active: true },
        { id: 3, title: "Principal", active: true }
    ];
    let signatureSettings = JSON.parse(localStorage.getItem('erp_signatures_config')) || {
        enabled: true,
        list: DEFAULT_SIGNATURES
    };

    // ==========================================================
    // ২. ইন্টারফেস রেন্ডার
    // ==========================================================
    function setupArchiveInterface() {
        const targetSec = document.getElementById('eval-archive-sec');
        if (!targetSec || targetSec.getAttribute('data-pro-loaded') === 'true') return;

        targetSec.setAttribute('data-pro-loaded', 'true');
        targetSec.innerHTML = `
            <!-- 1. Top Strip -->
            <div class="arc-pill-card arc-top-strip">
                <div class="arc-pill-dropdown">
                    <i class="fa-solid fa-clock-rotate-left" style="color: #0284c7; font-size: 11px;"></i>
                    <select id="arcExamPicker" onchange="window.arcOnExamChanged()">
                        <option value="">Loading Archived Exams...</option>
                    </select>
                </div>

                <div class="arc-kpi-group">
                    <span class="arc-kpi-chip"><i class="fa-solid fa-users" style="color:#64748b;"></i> Total: <strong id="arcKpiTotal">0</strong></span>
                    <span class="arc-kpi-chip highlight"><i class="fa-solid fa-calculator"></i> Class Avg: <strong id="arcKpiAvg">0</strong></span>
                    <span class="arc-kpi-chip success"><i class="fa-solid fa-trophy"></i> Highest: <strong id="arcKpiMax">0</strong></span>
                    <span class="arc-locked-badge"><i class="fa-solid fa-lock"></i> ARCHIVED & LOCKED</span>
                </div>
            </div>

            <!-- 2. Main Content Panel -->
            <div class="arc-pill-card">
                <div class="arc-controls-row">
                    <div class="arc-title-box">
                        <h2 id="arcDisplayTitle">Select an archived exam</h2>
                        <div class="meta" id="arcDisplayMeta">
                            Per Subject: <strong>15 Marks</strong> • Finalized Statement
                        </div>
                    </div>

                    <div class="arc-action-toolbar">
                        <!-- Live Search -->
                        <div class="arc-search-pill">
                            <i class="fa-solid fa-magnifying-glass" style="font-size:10px; color:#64748b; margin-right:4px;"></i>
                            <input type="text" id="arcLiveSearch" placeholder="Quick search..." onkeyup="window.arcFilterLiveRows()">
                        </div>

                        <!-- Stream Select -->
                        <select id="arcStreamSelect" class="arc-stream-select" onchange="window.arcRenderActiveGrid()">
                            <option value="Science_Merit" selected>Science (Combined Merit)</option>
                            <option value="Group-A">Science (Group-A)</option>
                            <option value="Group-B">Science (Group-B)</option>
                            <option value="Group-C">Science (Group-C)</option>
                            <option value="Humanities">Humanities</option>
                            <option value="B.Studies">Business Studies</option>
                        </select>

                        <!-- Super Admin Signatures Modal Button -->
                        <button class="arc-btn-pill arc-btn-admin" onclick="window.arcOpenSigModal()" title="Super Admin: Manage Signatures">
                            <i class="fa-solid fa-signature"></i> Signatures
                        </button>

                        <!-- Actions -->
                        <button class="arc-btn-pill arc-btn-pdf" onclick="window.arcPrintTabulation(false)">
                            <i class="fa-solid fa-print"></i> Print Result (PDF)
                        </button>
                        <button class="arc-btn-pill arc-btn-excel" onclick="window.arcExportCSV()">
                            <i class="fa-solid fa-file-excel"></i> Export Excel
                        </button>
                        <button class="arc-btn-pill arc-btn-blank" onclick="window.arcPrintTabulation(true)">
                            <i class="fa-solid fa-file-lines"></i> Blank Marksheet
                        </button>
                    </div>
                </div>

                <!-- Marksheet Table Grid -->
                <div class="arc-table-container">
                    <table class="arc-table" id="arcTable">
                        <thead></thead>
                        <tbody>
                            <tr><td colspan="15" style="padding: 24px; color: #94a3b8;">Select a past exam to view full tabulation sheet.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- 3. Super Admin Signature Configuration Modal -->
            <div class="arc-modal-overlay" id="arcSigModal" onclick="if(event.target === this) window.arcCloseSigModal()">
                <div class="arc-modal-box">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px; margin-bottom:12px;">
                        <h3 style="font-size:14px; font-weight:800; color:#1e293b; margin:0;"><i class="fa-solid fa-user-shield" style="color:#7c3aed;"></i> Signature Block Settings</h3>
                        <button style="background:none; border:none; font-size:18px; cursor:pointer; color:#94a3b8;" onclick="window.arcCloseSigModal()">&times;</button>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f1f5f9; padding:6px 12px; border-radius:9999px; margin-bottom:12px; font-size:12px; font-weight:700;">
                        <span>Enable Signature Block in Print</span>
                        <input type="checkbox" id="arcMasterSigToggle" style="cursor:pointer;" checked>
                    </div>

                    <div id="arcSigListContainer" style="max-height: 200px; overflow-y: auto; margin-bottom: 12px;"></div>

                    <button class="arc-btn-pill" style="background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; width:100%; justify-content:center; margin-bottom:14px;" onclick="window.arcAddNewSignatory()">
                        <i class="fa-solid fa-plus"></i> Add Signatory
                    </button>

                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:10px;">
                        <span style="font-size:11px; color:#64748b;"><i class="fa-solid fa-shield"></i> Super Admin Mode</span>
                        <div style="display:flex; gap:6px;">
                            <button class="arc-btn-pill arc-btn-blank" onclick="window.arcCloseSigModal()">Cancel</button>
                            <button class="arc-btn-pill arc-btn-pdf" onclick="window.arcSaveSignatureConfig()">Save & Apply</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================================
    // ৩. ডাটাবেজ রিড ও ড্রপডাউন লোডিং (১০০% READ-ONLY)
    // ==========================================================
    async function loadArchivedExamsFromFirebase() {
        if (!_get || !_ref || !_db) return;

        try {
            const stdSnap = await _get(_ref(_db, 'evaluation_system/students'));
            if (stdSnap.exists()) {
                const val = stdSnap.val();
                cachedStudents = Array.isArray(val) ? val : Object.values(val);
            }

            const arcSnap = await _get(_ref(_db, 'evaluation_system/archives'));
            const picker = document.getElementById('arcExamPicker');
            if (!picker) return;
            picker.innerHTML = '';

            if (arcSnap.exists()) {
                archivesMap = arcSnap.val();
                const keys = Object.keys(archivesMap);
                if (keys.length === 0) {
                    picker.innerHTML = '<option value="">No archives found</option>';
                    return;
                }

                keys.reverse().forEach(k => {
                    const ex = archivesMap[k].examInfo || {};
                    const opt = document.createElement('option');
                    opt.value = k;
                    opt.innerText = `${ex.title || k} (${ex.date || ''})`;
                    picker.appendChild(opt);
                });

                window.arcOnExamChanged();
            } else {
                picker.innerHTML = '<option value="">No archives found</option>';
            }
        } catch (err) {
            console.warn("Archive read notice:", err);
        }
    }

    window.arcOnExamChanged = function () {
        const picker = document.getElementById('arcExamPicker');
        if (!picker) return;
        activeArchiveId = picker.value;
        activeArchiveData = archivesMap[activeArchiveId];

        if (!activeArchiveData) return;

        const exInfo = activeArchiveData.examInfo || {};
        const titleEl = document.getElementById('arcDisplayTitle');
        const metaEl = document.getElementById('arcDisplayMeta');

        if (titleEl) titleEl.innerText = `${exInfo.title || 'Exam'} (${exInfo.date || ''})`;
        if (metaEl) {
            const timeStr = activeArchiveData.archivedAt ? new Date(activeArchiveData.archivedAt).toLocaleString() : '';
            metaEl.innerHTML = `Archived at: ${timeStr} • Per Subject: <strong>${exInfo.max || 15} Marks</strong> • Finalized Statement`;
        }

        window.arcRenderActiveGrid();
    };

    // ==========================================================
    // ৪. রেজাল্ট প্রসেসিং ও টেবিল রেন্ডার
    // ==========================================================
    function getArchiveProcessedData() {
        if (!activeArchiveData) return { activeSubs: [], computedList: [], streamTotalMarks: 0, subGroupLabel: '', groupLabel: '' };

        const grp = document.getElementById('arcStreamSelect') ? document.getElementById('arcStreamSelect').value : 'Science_Merit';
        const exInfo = activeArchiveData.examInfo || {};
        const marks = activeArchiveData.marks || {};

        let activeSubs = MASTER_SUBJECTS.Science;
        let groupLabel = "Science";
        let subGroupLabel = grp;

        if (grp === 'Humanities') {
            activeSubs = MASTER_SUBJECTS.Humanities;
            groupLabel = "Humanities";
            subGroupLabel = "Humanities";
        } else if (grp === 'B.Studies') {
            activeSubs = MASTER_SUBJECTS.BStudies;
            groupLabel = "Business Studies";
            subGroupLabel = "Business Studies";
        } else if (grp === 'Science_Merit') {
            subGroupLabel = "Combined Merit";
        }

        if (exInfo.activeSubjects && exInfo.activeSubjects.length > 0) {
            activeSubs = activeSubs.filter(s => exInfo.activeSubjects.includes(s.key));
        }

        const perSubMax = exInfo.max || 15;
        const streamTotalMarks = activeSubs.length * perSubMax;

        let list = [];
        if (grp === 'Humanities') list = cachedStudents.filter(s => s.group === 'Humanities');
        else if (grp === 'B.Studies') list = cachedStudents.filter(s => s.group === 'B.Studies');
        else if (grp === 'Science_Merit') list = cachedStudents.filter(s => s.group === 'Science');
        else {
            list = cachedStudents.filter(s => {
                if (s.group !== 'Science') return false;
                const sRank = Number(s.overallRank !== undefined && s.overallRank !== null ? s.overallRank : s.sl);
                const subGrp = s.subGroup || (sRank <= 55 ? 'Group-A' : (sRank <= 105 ? 'Group-B' : 'Group-C'));
                return subGrp === grp;
            });
        }

        let computedList = list.map(s => {
            const m = marks[s.id] || {};
            let total = 0;
            activeSubs.forEach(sb => {
                const v = parseFloat(m[sb.key]);
                if (!isNaN(v)) total += v;
            });
            return { ...s, total, marksObj: m };
        });

        if (grp === 'Science_Merit') {
            computedList.sort((a, b) => {
                if (b.total !== a.total) return b.total - a.total;
                const prevRankA = (a.overallRank !== undefined && a.overallRank !== null) ? Number(a.overallRank) : (Number(a.sl) || 9999);
                const prevRankB = (b.overallRank !== undefined && b.overallRank !== null) ? Number(b.overallRank) : (Number(b.sl) || 9999);
                return prevRankA - prevRankB;
            });
        } else {
            computedList.sort((a, b) => {
                const rankA = (a.overallRank !== undefined && a.overallRank !== null) ? Number(a.overallRank) : (Number(a.sl) || 9999);
                const rankB = (b.overallRank !== undefined && b.overallRank !== null) ? Number(b.overallRank) : (Number(b.sl) || 9999);
                return rankA - rankB;
            });
        }

        return { grp, groupLabel, subGroupLabel, activeSubs, streamTotalMarks, computedList };
    }

    window.arcRenderActiveGrid = function () {
        const { activeSubs, streamTotalMarks, computedList } = getArchiveProcessedData();
        const thead = document.querySelector("#arcTable thead");
        const tbody = document.querySelector("#arcTable tbody");
        if (!thead || !tbody) return;

        if (computedList.length === 0) {
            thead.innerHTML = '';
            tbody.innerHTML = `<tr><td colspan="15" style="padding: 24px; color: #94a3b8;">No student records found for this category.</td></tr>`;
            return;
        }

        let headHTML = `<tr>
            <th style="width:35px;">SL</th>
            <th style="width:90px;">STD ID</th>
            <th style="text-align:left; min-width:180px; padding-left:12px;">STUDENT NAME</th>
            <th style="width:50px;">ROLL</th>
            <th style="width:45px;">SEC</th>`;

        activeSubs.forEach(sb => {
            headHTML += `<th style="width:42px;">${sb.key === 'HM_AG' ? 'HM/AG' : (sb.key === 'AG_HE' ? 'AG/HE' : sb.key)}</th>`;
        });
        headHTML += `<th class="arc-col-total" style="width:70px;">TOTAL (${streamTotalMarks})</th>`;
        headHTML += `<th style="width:55px;">MERIT</th></tr>`;
        thead.innerHTML = headHTML;

        let bodyHTML = "";
        let totalSum = 0;
        let maxScore = 0;

        computedList.forEach((s, idx) => {
            totalSum += s.total;
            if (s.total > maxScore) maxScore = s.total;

            bodyHTML += `<tr>
                <td><strong>${idx + 1}</strong></td>
                <td style="font-weight:700; font-family:monospace;">${s.id}</td>
                <td style="text-align:left; font-weight:700; padding-left:12px;">${s.name}</td>
                <td>${s.roll}</td>
                <td><strong>${s.section || ''}</strong></td>`;

            activeSubs.forEach(sb => {
                const markVal = s.marksObj[sb.key];
                const displayMark = (markVal !== undefined && markVal !== null && markVal !== '') ? markVal : '0';
                bodyHTML += `<td>${displayMark}</td>`;
            });

            bodyHTML += `<td class="arc-col-total">${s.total}</td>
                <td><span class="arc-merit-tag ${idx < 2 ? 'top' : ''}">#${idx + 1}</span></td>
            </tr>`;
        });

        tbody.innerHTML = bodyHTML;

        const totalStudents = computedList.length;
        if (document.getElementById("arcKpiTotal")) document.getElementById("arcKpiTotal").innerText = totalStudents;
        if (document.getElementById("arcKpiMax")) document.getElementById("arcKpiMax").innerText = totalStudents > 0 ? `${maxScore}/${streamTotalMarks}` : '0';
        if (document.getElementById("arcKpiAvg")) document.getElementById("arcKpiAvg").innerText = totalStudents > 0 ? (totalSum / totalStudents).toFixed(1) : '0';
    };

    window.arcFilterLiveRows = function () {
        const q = (document.getElementById("arcLiveSearch")?.value || '').toUpperCase();
        const rows = document.querySelectorAll("#arcTable tbody tr");
        rows.forEach(r => {
            r.style.display = r.innerText.toUpperCase().includes(q) ? "" : "none";
        });
    };

    // ==========================================================
    // ৫. প্রিন্ট ইঞ্জিন (A4 Portrait + Super Admin Dynamic Signatures)
    // ==========================================================
    window.arcPrintTabulation = function (isBlank = false) {
        const { groupLabel, subGroupLabel, activeSubs, streamTotalMarks, computedList } = getArchiveProcessedData();
        const exInfo = activeArchiveData?.examInfo || {};

        if (computedList.length === 0) {
            alert("No data available to print!");
            return;
        }

        const printWin = window.open('', '_blank');
        if (!printWin) {
            alert("Pop-up blocked! Please allow pop-ups for this site.");
            return;
        }

        const totalCols = 5 + activeSubs.length + 1;

        let dynamicSigBlockHTML = '';
        if (signatureSettings.enabled) {
            const activeSignatures = signatureSettings.list.filter(item => item.active);
            if (activeSignatures.length > 0) {
                dynamicSigBlockHTML = `
                    <div style="margin-top: calc(60px + 0.8in); display: flex; justify-content: ${activeSignatures.length === 1 ? 'center' : 'space-between'}; padding: 0 30px; font-size: 13px; font-weight: bold;">
                        ${activeSignatures.map(sig => `
                            <div style="text-align: center;">
                                <hr style="width: 140px; border-top: 1px solid #000; margin-bottom: 4px;">
                                ${sig.title}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        const reportHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${exInfo.title || 'Archive'} - ${subGroupLabel} ${isBlank ? '(Blank Sheet)' : ''}</title>
    <style>
        @page { size: A4 portrait; margin: 12mm 10mm 12mm 10mm; }
        * { box-sizing: border-box; }
        body { font-family: 'Times New Roman', Times, serif; color: #000; margin: 0; padding: 0; background-color: #fff; }
        .report-container { width: 100%; max-width: 210mm; margin: 0 auto; }
        .header-cell { border: none !important; padding: 0 0 8px 0 !important; text-align: center; }
        .header-cell h1 { font-size: 18px; font-weight: bold; margin: 0 0 3px 0; }
        .header-cell p { font-size: 13px; margin: 2px 0; font-weight: normal; }
        .date-container { text-align: right; font-size: 12px; font-weight: normal; margin-top: 5px; padding-right: 5px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        thead { display: table-header-group; }
        tr { break-inside: avoid; page-break-inside: avoid; }
        th, td { border: 1px solid #000; padding: 4px 3px; text-align: center; }
        th.col-header { font-weight: bold; font-size: 11px; background-color: #fff; padding: 5px 2px; }
        .col-name { width: 185px; text-align: left; padding-left: 6px; white-space: nowrap; }
        @media print { body { padding: 0; background: #fff; } .report-container { padding: 0; box-shadow: none; } }
    </style>
</head>
<body>
    <div class="report-container">
        <table>
            <thead>
                <tr>
                    <th colspan="${totalCols}" class="header-cell">
                        <h1>Cantonment Public School and College Lalmonirhat</h1>
                        <p>Performance Evaluation Statement (Archive Record)</p>
                        <p>Class: Ten (${groupLabel})</p>
                        <p>${exInfo.title || ''}</p>
                        <p>${subGroupLabel}</p>
                        <div class="date-container">Date : ${exInfo.date || ''}</div>
                    </th>
                </tr>
                <tr>
                    <th class="col-header">SL</th>
                    <th class="col-header">Std ID</th>
                    <th class="col-header col-name">Student Name</th>
                    <th class="col-header">Roll</th>
                    <th class="col-header">Sec</th>
                    ${activeSubs.map(s => `<th class="col-header">${s.key === 'HM_AG' ? 'HM/AG' : (s.key === 'AG_HE' ? 'AG/HE' : s.key)}</th>`).join('')}
                    <th class="col-header">Total<br>(${streamTotalMarks})</th>
                </tr>
            </thead>
            <tbody>
                ${computedList.map((s, idx) => `
                    <tr>
                        <td>${idx + 1}</td>
                        <td>${s.id}</td>
                        <td class="col-name">${s.name}</td>
                        <td>${s.roll}</td>
                        <td>${s.section || ''}</td>
                        ${activeSubs.map(sb => {
                            if (isBlank) return '<td></td>';
                            const markVal = s.marksObj[sb.key];
                            return `<td>${(markVal !== undefined && markVal !== null && markVal !== '') ? markVal : '0'}</td>`;
                        }).join('')}
                        <td>${isBlank ? '' : s.total}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ${dynamicSigBlockHTML}
    </div>
</body>
</html>`;

        printWin.document.open();
        printWin.document.write(reportHTML);
        printWin.document.close();
        setTimeout(() => {
            printWin.focus();
            printWin.print();
        }, 500);
    };

    // ==========================================================
    // ৬. এক্সেল / CSV এক্সপোর্ট
    // ==========================================================
    window.arcExportCSV = function () {
        const { subGroupLabel } = getArchiveProcessedData();
        const exInfo = activeArchiveData?.examInfo || {};
        let csv = [];
        const rows = document.querySelectorAll("#arcTable tr");
        if (rows.length === 0) return;

        rows.forEach(row => {
            let cols = row.querySelectorAll("td, th");
            let line = [];
            cols.forEach(c => line.push('"' + c.innerText.replace(/"/g, '""').replace(/\n/g, ' ').trim() + '"'));
            csv.push(line.join(","));
        });

        const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${exInfo.title || 'Archive'}_${subGroupLabel}_Report.csv`;
        a.click();
    };

    // ==========================================================
    // ৭. সুপার অ্যাডমিন সিগনেচার কন্ট্রোলার ফাংশনসমূহ
    // ==========================================================
    window.arcOpenSigModal = function () {
        document.getElementById('arcMasterSigToggle').checked = signatureSettings.enabled;
        const container = document.getElementById('arcSigListContainer');
        container.innerHTML = '';

        signatureSettings.list.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'arc-sig-row';
            div.innerHTML = `
                <input type="checkbox" class="arc-sig-check" ${item.active ? 'checked' : ''} title="Include in print">
                <input type="text" class="arc-sig-input" value="${item.title}" placeholder="Signatory Title">
                <button style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:14px;" onclick="this.closest('.arc-sig-row').remove()">&times;</button>
            `;
            container.appendChild(div);
        });

        document.getElementById('arcSigModal').style.display = 'flex';
    };

    window.arcCloseSigModal = function () {
        document.getElementById('arcSigModal').style.display = 'none';
    };

    window.arcAddNewSignatory = function () {
        const container = document.getElementById('arcSigListContainer');
        const div = document.createElement('div');
        div.className = 'arc-sig-row';
        div.innerHTML = `
            <input type="checkbox" class="arc-sig-check" checked title="Include in print">
            <input type="text" class="arc-sig-input" placeholder="e.g. Class Teacher" value="New Signatory">
            <button style="background:none; border:none; color:#ef4444; cursor:pointer; font-size:14px;" onclick="this.closest('.arc-sig-row').remove()">&times;</button>
        `;
        container.appendChild(div);
    };

    window.arcSaveSignatureConfig = function () {
        const isEnabled = document.getElementById('arcMasterSigToggle').checked;
        const rows = document.querySelectorAll('.arc-sig-row');
        const updatedList = [];

        rows.forEach((row, index) => {
            const active = row.querySelector('.arc-sig-check').checked;
            const title = row.querySelector('.arc-sig-input').value.trim();
            if (title) updatedList.push({ id: index + 1, title, active });
        });

        signatureSettings = { enabled: isEnabled, list: updatedList };
        localStorage.setItem('erp_signatures_config', JSON.stringify(signatureSettings));
        window.arcCloseSigModal();
        alert("Signature settings updated successfully!");
    };

    // ==========================================================
    // ৮. ফায়ারবেস অটো-সংযোগ ও সেফ ইনিশিয়ালাইজার
    // ==========================================================
    async function initFirebaseBinding(retries = 25) {
        try {
            const fb = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js");
            _get = fb.get;
            _ref = fb.ref;
            if (window.getDatabase) _db = window.getDatabase();
            else if (fb.getDatabase) _db = fb.getDatabase();
        } catch (e) {
            if (window.getDatabase && window.ref && window.get) {
                _db = window.getDatabase();
                _ref = window.ref;
                _get = window.get;
            }
        }

        if (!_db || !_ref || !_get) {
            if (retries > 0) setTimeout(() => initFirebaseBinding(retries - 1), 200);
            return;
        }

        loadArchivedExamsFromFirebase();
    }

    function initAddon() {
        setupArchiveInterface();
        initFirebaseBinding();

        // Exam Archives সাব-মেনুতে ক্লিক ইভেন্ট হুক করা
        const hookMenu = () => {
            const archMenu = document.querySelector('a[onclick*="eval-archive-sec"]');
            if (archMenu && !archMenu.getAttribute('data-arc-hooked')) {
                archMenu.setAttribute('data-arc-hooked', 'true');
                const origOnClick = archMenu.getAttribute('onclick');
                archMenu.onclick = function (e) {
                    setupArchiveInterface();
                    if (origOnClick) eval(origOnClick);
                    loadArchivedExamsFromFirebase();
                };
            }
        };

        hookMenu();
        setInterval(hookMenu, 1000);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initAddon);
    } else {
        initAddon();
    }
})();
