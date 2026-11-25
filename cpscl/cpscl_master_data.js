/* ==========================================================================
   MODULE: CPSCL Academic ERP
   SUB-SECTION: Master Data Foundation (Phase 1)
   Path: cpscl/cpscl_master_data.js
   Architecture: Direct Firebase REST | Strictly additive

   Provides (as window.CPSCL_MASTER):
     - SUBJECTS / GROUPS         : frozen master lists (single source of truth)
     - GROUP_NAMES               : the 5 frozen SSC-27 group names, exact strings
     - subjectKey(anyName)       : legacy / full / short name -> master key
     - resolveLegacy(name, grp)  : legacy combined routine slot -> master keys
     - subjectsForGroup(grp, o)  : subjects applicable to a group (+ religion)
     - seed()                    : idempotent, non-destructive Firebase seeding

   Firebase collections written (PATCH, missing keys only, never overwrites):
     - subjects_master/{subjectKey}
     - groups_master/{groupKey}

   PROTECTED ZONE: Group promotion thresholds (e.g. ranks 1-55 / 56-105) and
   intra-group merit logic are intentionally NOT stored here. They remain
   exclusively in weekly_tabulation_manager.js and ssc27_exam_manager.js.

   LOAD ORDER: include this file BEFORE teacher_evaluation_manager.js,
               ssc27_exam_manager.js and weekly_tabulation_manager.js.
   ========================================================================== */

(function () {
    "use strict";

    if (window.CPSCL_MASTER) return; // load once

    const DB = "https://mousumi-computer-default-rtdb.firebaseio.com";

    // ---------- helpers ----------
    const norm = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');

    async function getJSON(path) {
        const r = await fetch(`${DB}/${path}.json`);
        if (!r.ok) throw new Error(`Firebase read error ${r.status} (${path})`);
        return await r.json();
    }
    async function patchJSON(path, body) {
        const r = await fetch(`${DB}/${path}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!r.ok) throw new Error(`Firebase write error ${r.status} (${path})`);
    }

    // ---------- GROUPS (frozen) ----------
    // track: 'science' | 'humanities' | 'business'
    const GROUPS = Object.freeze([
        { key: 'group_a_science',      name: 'Group A (Science)',          shortLabel: 'A (Science)',    track: 'science',    order: 1 },
        { key: 'group_b_science',      name: 'Group B (Science)',          shortLabel: 'B (Science)',    track: 'science',    order: 2 },
        { key: 'group_c_science',      name: 'Group C (Science)',          shortLabel: 'C (Science)',    track: 'science',    order: 3 },
        { key: 'group_d_humanities',   name: 'Group D (Humanities)',       shortLabel: 'D (Humanities)', track: 'humanities', order: 4 },
        { key: 'group_d_business',     name: 'Group D (Business Studies)', shortLabel: 'D (Business)',   track: 'business',   order: 5 }
    ].map(Object.freeze));

    const GROUP_NAMES = Object.freeze(GROUPS.map(g => g.name));

    // ---------- SUBJECTS ----------
    // type    : 'core' (all tracks) | 'track' (specific track) | 'elective' (4th subject)
    // streams : tracks for which the subject is offered
    //           ASSUMPTION: derived from the existing isSubjectAllowedForGroup() guard
    //           in index.html plus the standard SSC curriculum. Items marked
    //           "CONFIRM" are open questions for the school administration.
    // audience: 'all' | 'islam' | 'hinduism' (drives IME / HME filtering)
    const ALL = ['science', 'humanities', 'business'];
    const SUBJECT_DEFS = [
        { key: 'ban1', code: 'Ban 1', name: 'Bangla 1st Paper',                             type: 'core',     streams: ALL,                         audience: 'all' },
        { key: 'ban2', code: 'Ban 2', name: 'Bangla 2nd Paper',                             type: 'core',     streams: ALL,                         audience: 'all' },
        { key: 'eng1', code: 'Eng 1', name: 'English 1st Paper',                            type: 'core',     streams: ALL,                         audience: 'all' },
        { key: 'eng2', code: 'Eng 2', name: 'English 2nd Paper',                            type: 'core',     streams: ALL,                         audience: 'all' },
        { key: 'math', code: 'Math',  name: 'Mathematics',                                  type: 'core',     streams: ALL,                         audience: 'all' },
        { key: 'ict',  code: 'ICT',   name: 'Information & Communication Technology',       type: 'core',     streams: ALL,                         audience: 'all' },
        { key: 'ime',  code: 'IME',   name: 'Islam & Moral Education',                      type: 'core',     streams: ALL,                         audience: 'islam' },
        { key: 'hme',  code: 'HME',   name: 'Hindu Religion & Moral Education',             type: 'core',     streams: ALL,                         audience: 'hinduism' },
        { key: 'bgs',  code: 'BGS',   name: 'Bangladesh & Global Studies',                  type: 'core',     streams: ALL,                         audience: 'all' },
        { key: 'phy',  code: 'Phy',   name: 'Physics',                                      type: 'track',    streams: ['science'],                 audience: 'all' },
        { key: 'che',  code: 'Che',   name: 'Chemistry',                                    type: 'track',    streams: ['science'],                 audience: 'all' },
        { key: 'bio',  code: 'Bio',   name: 'Biology',                                      type: 'track',    streams: ['science'],                 audience: 'all' },
        { key: 'hm',   code: 'HM',    name: 'Higher Mathematics',                           type: 'elective', streams: ['science'],                 audience: 'all' },
        { key: 'sci',  code: 'Sci',   name: 'General Science',                              type: 'track',    streams: ['humanities', 'business'],  audience: 'all' },
        { key: 'acc',  code: 'Acc',   name: 'Accounting',                                   type: 'track',    streams: ['business'],                audience: 'all' },   // CONFIRM
        { key: 'fin',  code: 'Fin',   name: 'Finance & Banking',                            type: 'track',    streams: ['business'],                audience: 'all' },   // CONFIRM
        { key: 'bent', code: 'B.Ent', name: 'Business Entrepreneurship',                    type: 'track',    streams: ['business'],                audience: 'all' },   // CONFIRM
        { key: 'his',  code: 'His',   name: 'History of Bangladesh & World Civilization',   type: 'track',    streams: ['humanities'],              audience: 'all' },   // CONFIRM
        { key: 'geo',  code: 'Geo',   name: 'Geography & Environment',                      type: 'track',    streams: ['humanities'],              audience: 'all' },   // CONFIRM
        { key: 'civ',  code: 'Civ',   name: 'Civics & Citizenship',                         type: 'track',    streams: ['humanities'],              audience: 'all' },   // CONFIRM
        { key: 'agri', code: 'Agri',  name: 'Agriculture Studies',                          type: 'elective', streams: ['science'],                 audience: 'all' },   // CONFIRM
        { key: 'hs',   code: 'HS',    name: 'Home Science',                                 type: 'elective', streams: ['science'],                 audience: 'all' }    // CONFIRM
    ];

    const SUBJECTS = Object.freeze(SUBJECT_DEFS.map((s, i) =>
        Object.freeze(Object.assign({ order: i + 1, streams: Object.freeze(s.streams.slice()) }, s, { streams: Object.freeze(s.streams.slice()) }))
    ));

    // ---------- alias table: any known spelling -> master key ----------
    const EXTRA_ALIASES = {
        ban1: ['bangla1', 'bangla1st'],
        ban2: ['bangla2', 'bangla2nd'],
        eng1: ['english1', 'english1st'],
        eng2: ['english2', 'english2nd'],
        math: ['mat', 'maths', 'generalmath', 'generalmathematics'],
        ict:  ['informationcommunicationtechnology'],
        ime:  ['islam', 'islamreligion', 'islamandmoraleducation', 'islamicstudies'],
        hme:  ['hindu', 'hinduism', 'hindureligion'],
        bgs:  ['bangladeshglobalstudies'],
        phy:  ['phys'],
        che:  ['chem'],
        bio:  ['biol'],
        hm:   ['highermath', 'highermaths'],
        sci:  ['science', 'gensci'],
        fin:  ['financebanking'],
        bent: ['businessent', 'entrepreneurship'],
        his:  ['history'],
        geo:  ['geography'],
        civ:  ['civics'],
        agri: ['agriculture'],
        hs:   ['homesci']
    };

    const ALIAS_INDEX = (function () {
        const idx = new Map();
        const put = (alias, key) => {
            const n = norm(alias);
            if (!n) return;
            if (idx.has(n) && idx.get(n) !== key) {
                console.warn(`CPSCL_MASTER: alias collision "${n}" (${idx.get(n)} vs ${key}); keeping first.`);
                return;
            }
            idx.set(n, key);
        };
        SUBJECTS.forEach(s => {
            put(s.key, s.key); put(s.code, s.key); put(s.name, s.key);
            (EXTRA_ALIASES[s.key] || []).forEach(a => put(a, s.key));
        });
        return idx;
    })();

    const SUBJECT_BY_KEY = new Map(SUBJECTS.map(s => [s.key, s]));

    // Legacy combined routine slots (still present in existing exam data).
    // Value: function(track) -> array of master keys.
    const LEGACY_COMBINED = {
        reli:      () => ['ime', 'hme'],
        accgeo:    t => t === 'business' ? ['acc'] : t === 'humanities' ? ['geo'] : ['acc', 'geo'],
        finhis:    t => t === 'business' ? ['fin'] : t === 'humanities' ? ['his'] : ['fin', 'his'],
        bentciv:   t => t === 'business' ? ['bent'] : t === 'humanities' ? ['civ'] : ['bent', 'civ'],
        hmagrihs:  () => ['hm', 'agri', 'hs']
    };

    // ---------- public helpers ----------

    /** Any known spelling (code, full name, legacy spelling) -> master key, or null. */
    function subjectKey(name) {
        return ALIAS_INDEX.get(norm(name)) || null;
    }

    function getSubject(nameOrKey) {
        const k = subjectKey(nameOrKey);
        return k ? SUBJECT_BY_KEY.get(k) : null;
    }

    function getGroup(name) {
        const n = norm(name);
        return GROUPS.find(g => norm(g.name) === n || g.key === String(name)) || null;
    }

    function trackOfGroup(groupName) {
        const g = getGroup(groupName);
        return g ? g.track : null;
    }

    function isLegacyCombined(name) {
        return Object.prototype.hasOwnProperty.call(LEGACY_COMBINED, norm(name));
    }

    /** Legacy combined routine slot (e.g. "Acc-Geo") -> master keys for the given group. */
    function resolveLegacy(name, groupName) {
        const fn = LEGACY_COMBINED[norm(name)];
        if (!fn) {
            const k = subjectKey(name);
            return k ? [k] : [];
        }
        return fn(trackOfGroup(groupName));
    }

    /**
     * Subjects offered to a group.
     * opts.religion: 'islam' | 'hinduism' -> removes the other religion subject.
     *                Omit to return both IME and HME.
     * opts.includeElectives: default true.
     */
    function subjectsForGroup(groupName, opts) {
        const o = opts || {};
        const track = trackOfGroup(groupName);
        if (!track) return [];
        return SUBJECTS.filter(s => {
            if (!s.streams.includes(track)) return false;
            if (o.includeElectives === false && s.type === 'elective') return false;
            if (o.religion && s.audience !== 'all' && s.audience !== o.religion) return false;
            return true;
        });
    }

    /** Student religion at read time: everything except an explicit 'hinduism' is 'islam'. */
    function religionOf(student) {
        const r = norm(student && student.religion);
        return r === 'hinduism' || r === 'hindu' ? 'hinduism' : 'islam';
    }

    // ---------- Firebase seeding (idempotent, non-destructive) ----------
    let seedPromise = null;

    function subjectRecord(s) {
        return {
            code: s.code, name: s.name, order: s.order, type: s.type,
            streams: s.streams.slice(), audience: s.audience,
            active: true, source: 'seed-v1', createdAt: new Date().toISOString()
        };
    }
    function groupRecord(g) {
        return {
            name: g.name, shortLabel: g.shortLabel, track: g.track, order: g.order,
            active: true, source: 'seed-v1', createdAt: new Date().toISOString()
        };
    }

    /**
     * Writes only the master entries that are missing in Firebase.
     * Existing entries (including any admin edits) are never overwritten.
     * Safe to call many times; the work runs once per page load.
     * Resolves to { subjectsAdded, groupsAdded } or { error }.
     */
    function seed() {
        if (seedPromise) return seedPromise;
        seedPromise = (async () => {
            try {
                const [sm, gm] = await Promise.all([getJSON('subjects_master'), getJSON('groups_master')]);
                const subjPatch = {}, grpPatch = {};
                SUBJECTS.forEach(s => { if (!sm || !sm[s.key]) subjPatch[s.key] = subjectRecord(s); });
                GROUPS.forEach(g => { if (!gm || !gm[g.key]) grpPatch[g.key] = groupRecord(g); });
                if (Object.keys(subjPatch).length) await patchJSON('subjects_master', subjPatch);
                if (Object.keys(grpPatch).length) await patchJSON('groups_master', grpPatch);
                return { subjectsAdded: Object.keys(subjPatch).length, groupsAdded: Object.keys(grpPatch).length };
            } catch (e) {
                console.warn('CPSCL_MASTER: seeding skipped -', e.message);
                seedPromise = null; // allow retry on next call
                return { error: e.message };
            }
        })();
        return seedPromise;
    }

    window.CPSCL_MASTER = Object.freeze({
        SUBJECTS, GROUPS, GROUP_NAMES,
        subjectKey, getSubject, getGroup, trackOfGroup,
        isLegacyCombined, resolveLegacy, subjectsForGroup, religionOf,
        seed
    });

    console.log("CPSCL Master Data Foundation loaded.");
})();
