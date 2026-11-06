/* CodeRecall core: bridge, state, scheduler, helpers. */
(function () {
  'use strict';

  const CR = window.CR = {};
  CR.pages = {};
  const DAY = 86400000;

  /* ---------------- data index ---------------- */
  CR.decks = (window.DECKS || []).slice();
  CR.cards = (window.CARDS || []).slice();
  CR.deckById = {};
  CR.decks.forEach(d => { CR.deckById[d.id] = d; });
  CR.cardById = {};
  CR.cards.forEach(c => { CR.cardById[c.id] = c; });

  /* ---------------- tiny utilities ---------------- */
  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  CR.esc = esc;
  CR.qs = (sel, root) => (root || document).querySelector(sel);
  CR.qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  CR.fmtNum = n => Number(n || 0).toLocaleString('en-GB');
  CR.pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
  CR.plural = (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's'));
  CR.clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  CR.dateKey = (d) => {
    const x = d || new Date();
    return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' +
      String(x.getDate()).padStart(2, '0');
  };
  CR.startOfDay = (d) => {
    const x = new Date(d || Date.now());
    x.setHours(0, 0, 0, 0);
    return x;
  };
  CR.addDays = (d, n) => new Date(new Date(d).getTime() + n * DAY);
  CR.todayKey = () => CR.dateKey(new Date());
  CR.shortDate = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  CR.weekday = (d) => new Date(d).toLocaleDateString('en-GB', { weekday: 'short' });

  CR.timeAgo = (ts) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.round(diff / 60000) + 'm ago';
    if (diff < DAY) return Math.round(diff / 3600000) + 'h ago';
    return Math.round(diff / DAY) + 'd ago';
  };

  CR.dueLabel = (ts) => {
    const now = Date.now();
    if (!ts || ts <= now) return 'due now';
    const diff = ts - now;
    if (diff < 3600000) return 'in ' + Math.max(1, Math.round(diff / 60000)) + 'm';
    if (diff < DAY) return 'in ' + Math.round(diff / 3600000) + 'h';
    if (diff < 30 * DAY) return 'in ' + Math.round(diff / DAY) + 'd';
    if (diff < 365 * DAY) return 'in ' + (diff / (30 * DAY)).toFixed(1) + 'mo';
    return 'in ' + (diff / (365 * DAY)).toFixed(1) + 'y';
  };

  CR.greeting = () => {
    const h = new Date().getHours();
    if (h < 5) return 'Still up';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  /* ---------------- bridge ---------------- */
  const hasNative = !!(window.chrome && window.chrome.webview);
  CR.native = hasNative;
  const pending = new Map();
  let seq = 1;

  if (hasNative) {
    window.chrome.webview.addEventListener('message', (ev) => {
      const msg = ev.data;
      if (!msg || !msg.id) return;
      const p = pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.ok) p.resolve(msg.data);
      else p.reject(new Error(msg.error || 'Unknown error'));
    });
  }

  function call(cmd, payload, timeoutMs) {
    if (!hasNative) return mockCall(cmd, payload);
    return new Promise((resolve, reject) => {
      const id = 'c' + (seq++);
      pending.set(id, { resolve, reject });
      try {
        window.chrome.webview.postMessage({ id, cmd, payload });
      } catch (e) {
        pending.delete(id);
        reject(e);
        return;
      }
      setTimeout(() => {
        if (pending.has(id)) {
          pending.delete(id);
          reject(new Error('The app took too long to respond.'));
        }
      }, timeoutMs || 130000);
    });
  }
  CR.call = call;

  /* Browser-preview fallback: lets the UI be developed/tested outside the exe. */
  function mockCall(cmd, payload) {
    const K = 'coderecall.mock.';
    return new Promise((resolve, reject) => {
      if (cmd === 'state.load') return resolve(localStorage.getItem(K + 'state'));
      if (cmd === 'state.save') {
        localStorage.setItem(K + 'state', typeof payload === 'string' ? payload : JSON.stringify(payload));
        return resolve({ saved: true });
      }
      if (cmd === 'secret.get') return resolve(localStorage.getItem(K + 'secret'));
      if (cmd === 'secret.set') { localStorage.setItem(K + 'secret', payload || ''); return resolve({ stored: true }); }
      if (cmd === 'secret.clear') { localStorage.removeItem(K + 'secret'); return resolve({ stored: false }); }
      if (cmd === 'app.info') return resolve({ version: '1.0.0-preview', dataDir: '(browser preview)' });
      if (cmd === 'app.openData' || cmd === 'app.openUrl') return resolve({ opened: true });
      if (cmd === 'win.drag' || cmd === 'win.min' || cmd === 'win.max' || cmd === 'win.close') return resolve({ ok: true });
      if (cmd === 'file.export') {
        const blob = new Blob([payload.content], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = payload.name || 'coderecall.json'; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        return resolve({ saved: true, path: a.download });
      }
      if (cmd === 'file.import') return resolve({ loaded: false });
      if (cmd === 'ai.chat' || cmd === 'ai.test') {
        setTimeout(() => resolve({ text: 'PREVIEW MODE\n\nThe AI bridge only runs inside the CodeRecall desktop app. This canned answer lets you test the interface. In the real app the free provider needs no key.' }), 700);
        return;
      }
      resolve(null);
    });
  }

  /* ---------------- state ---------------- */
  const defaultAI = () => ({ provider: 'free', model: 'openai', baseUrl: '', key: '' });

  function defaultState() {
    return {
      v: 1,
      created: new Date().toISOString(),
      onboarded: false,
      name: '',
      profile: {
        background: '',
        freshness: '',
        goal: '',
        pace: 'steady',
        interests: [],
        completedAt: null
      },
      settings: {
        dailyGoal: 40,
        newPerDay: 12,
        showHints: true,
        reduceMotion: false,
        ai: defaultAI()
      },
      cards: {},
      days: {},
      log: []
    };
  }

  CR.state = defaultState();
  CR.ready = false;

  function newCardState() {
    return {
      ease: 2.5,
      interval: 0,
      due: Date.now(),
      reps: 0,
      lapses: 0,
      lastGrade: null,
      lastReview: null,
      suspended: false,
      bookmarked: false,
      correct: 0,
      wrong: 0
    };
  }

  CR.newCardState = newCardState;

  function mergeState(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object') return base;
    const out = Object.assign(base, raw);
    out.settings = Object.assign(base.settings, raw.settings || {});
    out.settings.ai = Object.assign(defaultAI(), (raw.settings && raw.settings.ai) || {});
    out.profile = Object.assign({}, base.profile, raw.profile || {});
    out.profile.interests = Array.isArray(out.profile.interests)
      ? out.profile.interests.filter(id => CR.deckById[id])
      : [];
    out.cards = raw.cards && typeof raw.cards === 'object' ? raw.cards : {};
    out.days = raw.days && typeof raw.days === 'object' ? raw.days : {};
    out.log = Array.isArray(raw.log) ? raw.log : [];
    return out;
  }

  CR.rebuildCards = function () {
    const base = (window.CARDS || []).slice();
    const custom = (CR.state.customCards || []).map(c => Object.assign({}, c, { custom: true }));
    CR.cards = base.concat(custom);
    CR.cardById = {};
    CR.cards.forEach(c => { CR.cardById[c.id] = c; });
    CR.cards.forEach(c => {
      if (!CR.state.cards[c.id]) CR.state.cards[c.id] = newCardState();
    });
  };

  /* ---------------- profile + personal plan ---------------- */
  CR.profileComplete = function () {
    const p = CR.state.profile || {};
    return !!(p.completedAt && Array.isArray(p.interests) && p.interests.length);
  };

  CR.activeDeckIds = function () {
    const p = CR.state.profile || {};
    const chosen = Array.isArray(p.interests) ? p.interests.filter(id => CR.deckById[id]) : [];
    return chosen.length ? chosen : CR.decks.map(d => d.id);
  };

  CR.activeDeckSet = function () {
    return new Set(CR.activeDeckIds());
  };

  CR.isDeckActive = function (id) {
    return CR.activeDeckSet().has(id);
  };

  CR.activeCards = function () {
    const set = CR.activeDeckSet();
    return CR.cards.filter(c => set.has(c.deck));
  };

  CR.planStats = function () {
    const active = CR.activeDeckSet();
    const cards = CR.cards.filter(c => active.has(c.deck));
    return {
      decks: active.size,
      cards: cards.length,
      totalCards: CR.cards.length,
      hiddenDecks: CR.decks.length - active.size,
      hiddenCards: CR.cards.length - cards.length
    };
  };

  const BG_LABEL = {
    student: 'still studying',
    newgrad: 'a recent graduate',
    returning: 'returning after a break',
    working: 'a working engineer',
    selftaught: 'self-taught or switching in'
  };
  const FRESH_LABEL = {
    starting: 'mostly gone',
    rusty: 'rusty but recognisable',
    current: 'mostly current'
  };
  const GOAL_LABEL = {
    interview: 'interview preparation',
    refresh: 'refreshing the fundamentals',
    newrole: 'preparing for a new role or stack',
    depth: 'going deeper in your current area',
    habit: 'building a steady daily habit'
  };
  const PACE = {
    light: { label: 'light', dailyGoal: 20, newPerDay: 8, minutes: 10 },
    steady: { label: 'steady', dailyGoal: 40, newPerDay: 12, minutes: 15 },
    intense: { label: 'intense', dailyGoal: 70, newPerDay: 20, minutes: 25 }
  };
  CR.PROFILE_LABELS = { background: BG_LABEL, freshness: FRESH_LABEL, goal: GOAL_LABEL, pace: PACE };

  // A small, explainable scoring model. No AI, no network.
  CR.recommendDecks = function (profile) {
    const p = profile || CR.state.profile || {};
    const weights = {};
    CR.decks.forEach(d => { weights[d.id] = 1; });

    const goals = {
      interview: { dsa: 6, core: 5, sys: 4, tool: 3, web: 2, js: 2, py: 2, jvm: 1 },
      refresh: { core: 5, js: 4, py: 4, jvm: 3, tool: 3, web: 2, dsa: 2, sys: 2 },
      newrole: { web: 4, tool: 4, sys: 3, core: 3, dsa: 2, js: 3, py: 2, jvm: 2 },
      depth: { js: 4, py: 4, jvm: 4, sys: 4, web: 4, dsa: 3, core: 3, tool: 2 },
      habit: { core: 4, js: 4, dsa: 4, sys: 3, web: 3, py: 2, tool: 2, jvm: 2 }
    };
    const backgrounds = {
      student: { core: 3, dsa: 3, tool: 1 },
      newgrad: { dsa: 3, core: 2, tool: 2, sys: 1 },
      returning: { core: 3, js: 2, py: 2, tool: 1 },
      working: { sys: 2, web: 2, tool: 1 },
      selftaught: { core: 3, tool: 2, web: 1 }
    };
    const freshness = {
      starting: { core: 2, dsa: 2, js: 1 },
      rusty: {},
      current: { sys: 1, web: 1 }
    };

    [goals[p.goal], backgrounds[p.background], freshness[p.freshness]].forEach(map => {
      if (!map) return;
      Object.keys(map).forEach(id => { if (weights[id] != null) weights[id] += map[id]; });
    });

    const limit = p.freshness === 'starting' ? 5 : p.freshness === 'current' ? 8 : 6;
    return CR.decks
      .map((d, i) => ({ id: d.id, deck: d, score: weights[d.id], order: i }))
      .sort((a, b) => b.score - a.score || a.order - b.order)
      .map((x, i) => Object.assign(x, { recommended: i < limit }));
  };

  CR.defaultPace = function (freshness) {
    if (freshness === 'starting') return 'light';
    if (freshness === 'current') return 'intense';
    return 'steady';
  };

  CR.analyseProfile = function (profile) {
    const p = profile || CR.state.profile || {};
    const ranking = CR.recommendDecks(p);
    const chosen = new Set(Array.isArray(p.interests) ? p.interests : []);
    const focus = (chosen.size ? ranking.filter(x => chosen.has(x.id)) : ranking.filter(x => x.recommended))
      .slice(0, 8);
    const names = focus.map(x => x.deck.name);
    const pace = PACE[p.pace] || PACE.steady;
    const bg = BG_LABEL[p.background] || 'a software engineer';
    const goal = GOAL_LABEL[p.goal] || 'rebuilding your recall';
    const fresh = FRESH_LABEL[p.freshness] || 'somewhere in the middle';

    let opener = 'You are ' + bg + '. Your focus is ' + goal + ', and your knowledge is ' + fresh + '.';
    let plan;
    if (names.length === 0) {
      plan = 'Pick at least one area and CodeRecall will build the queue around it.';
    } else if (names.length === 1) {
      plan = 'Your plan starts with ' + names[0] + '. Everything else stays out of the queue until you add it.';
    } else {
      const tail = names.length > 2
        ? ' Then rotate through ' + names.slice(2).join(', ') + '.'
        : '';
      plan = 'Your first focus is ' + names[0] + ', followed by ' + names[1] + '.' + tail;
    }
    const habit = 'That is ' + pace.newPerDay + ' new cards a day and about ' +
      pace.minutes + ' minutes on the ' + pace.label + ' plan. Decks outside your plan stay in the library but never enter your queue.';
    return {
      headline: p.goal === 'interview' ? 'Interview-ready, without the re-reading.'
        : p.goal === 'refresh' ? 'Rebuild the foundations, one card at a time.'
        : p.goal === 'newrole' ? 'A focused ramp into the new role.'
        : p.goal === 'depth' ? 'Sharpen the edges you already have.'
        : 'A small habit that compounds.',
      paragraphs: [opener, plan, habit],
      focus: focus.map(x => x.id),
      pace
    };
  };

  CR.profileLine = function () {
    const p = CR.state.profile || {};
    const bits = [];
    if (BG_LABEL[p.background]) bits.push(BG_LABEL[p.background]);
    if (GOAL_LABEL[p.goal]) bits.push(GOAL_LABEL[p.goal]);
    return bits.join(' · ') || 'Personal plan not set';
  };

  CR.loadState = async function () {
    let raw = null;
    try { raw = await call('state.load'); } catch (e) { console.warn('state load failed', e); }
    let parsed = null;
    try { parsed = raw ? JSON.parse(raw) : null; } catch (e) { console.warn('state parse failed', e); }
    CR.state = mergeState(parsed);
    if (!Array.isArray(CR.state.customCards)) CR.state.customCards = [];

    CR.rebuildCards();

    try {
      const key = await call('secret.get');
      if (key) CR.state.settings.ai.key = key;
    } catch (e) { /* no stored key */ }

    CR.ready = true;
    return CR.state;
  };

  let saveTimer = null;
  let savingPromise = Promise.resolve();
  CR.save = function (immediate) {
    if (!CR.ready) return;
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    const doSave = () => {
      // Never persist the API key inside state.json — it lives in DPAPI-encrypted secrets.dat.
      const snapshot = JSON.parse(JSON.stringify(CR.state));
      if (snapshot.settings && snapshot.settings.ai) snapshot.settings.ai.key = '';
      const json = JSON.stringify(snapshot);
      savingPromise = savingPromise.then(() => call('state.save', json)).catch(err => {
        console.warn('save failed', err);
      });
    };
    if (immediate) doSave();
    else saveTimer = setTimeout(doSave, 160);
  };

  CR.stats = function () {
    const s = CR.state;
    const today = CR.todayKey();
    const days = s.days;
    const reviewed = days[today] ? days[today].reviews : 0;
    const goal = s.settings.dailyGoal || 40;
    const cards = CR.activeCards();
    let due = 0, newCards = 0, learning = 0, young = 0, mature = 0, suspended = 0;
    const now = Date.now();
    cards.forEach(c => {
      const st = s.cards[c.id];
      if (!st) return;
      if (st.suspended) { suspended++; return; }
      if (st.reps === 0) newCards++;
      else if (st.interval >= 21) mature++;
      else if (st.interval >= 1) young++;
      else learning++;
      if (st.reps > 0 && st.due <= now) due++;
    });

    // streak
    let streak = 0;
    let cursor = new Date();
    if (!days[CR.dateKey(cursor)] || !days[CR.dateKey(cursor)].reviews) cursor = CR.addDays(cursor, -1);
    for (let i = 0; i < 3650; i++) {
      const k = CR.dateKey(cursor);
      if (days[k] && days[k].reviews > 0) { streak++; cursor = CR.addDays(cursor, -1); }
      else break;
    }

    // retention over last 30 days
    let rReviews = 0, rCorrect = 0;
    for (let i = 0; i < 30; i++) {
      const k = CR.dateKey(CR.addDays(new Date(), -i));
      if (days[k]) { rReviews += days[k].reviews || 0; rCorrect += days[k].correct || 0; }
    }

    const todayNew = days[today] ? (days[today].newCards || 0) : 0;
    const totalSeen = cards.length - newCards - suspended;
    const mastery = cards.length
      ? Math.round(((mature * 1 + young * 0.6 + learning * 0.2) / cards.length) * 100) : 0;

    return {
      due, newCards, learning, young, mature, suspended,
      reviewedToday: reviewed, goal, goalPct: CR.clamp(Math.round(reviewed / goal * 100), 0, 100),
      retention: rReviews ? Math.round(rCorrect / rReviews * 100) : null,
      streak, totalSeen, mastery, todayNew,
      newRemaining: Math.max(0, (s.settings.newPerDay || 12) - todayNew)
    };
  };

  CR.deckStats = function (deckId) {
    const s = CR.state;
    const now = Date.now();
    const cards = deckId ? CR.cards.filter(c => c.deck === deckId) : CR.cards;
    let due = 0, news = 0, learning = 0, young = 0, mature = 0, total = cards.length, seen = 0;
    cards.forEach(c => {
      const st = s.cards[c.id] || newCardState();
      if (st.suspended) { total--; return; }
      if (st.reps === 0) news++;
      else {
        seen++;
        if (st.interval >= 21) mature++;
        else if (st.interval >= 1) young++;
        else learning++;
        if (st.due <= now) due++;
      }
    });
    const mastery = total ? Math.round(((mature + young * 0.6 + learning * 0.2) / total) * 100) : 0;
    return { deckId, total, due, news, learning, young, mature, seen, mastery };
  };

  CR.dueAll = function (deckIds) {
    const s = CR.state;
    const now = Date.now();
    const ids = deckIds && deckIds.length ? deckIds : CR.activeDeckIds();
    const set = new Set(ids);
    return CR.cards.filter(c => {
      if (!set.has(c.deck)) return false;
      const st = s.cards[c.id];
      return st && !st.suspended && st.reps > 0 && st.due <= now;
    });
  };

  CR.newAll = function (deckIds) {
    const s = CR.state;
    const ids = deckIds && deckIds.length ? deckIds : CR.activeDeckIds();
    const set = new Set(ids);
    return CR.cards.filter(c => {
      if (!set.has(c.deck)) return false;
      const st = s.cards[c.id];
      return st && !st.suspended && st.reps === 0;
    });
  };

  /* ---------------- scheduler (SM-2 flavoured) ---------------- */
  const GRADE = { again: 0, hard: 1, good: 2, easy: 3 };
  CR.GRADE = GRADE;

  function schedule(st, grade, nowTs) {
    const now = nowTs || Date.now();
    const next = Object.assign({}, st);
    const g = Number(grade);
    const wasNew = next.reps === 0;
    let intervalDays;

    if (g === 0) {
      next.ease = Math.max(1.3, next.ease - 0.2);
      next.lapses += 1;
      next.interval = 0;
      intervalDays = 0;
      next.due = now + 10 * 60000;
    } else if (wasNew) {
      if (g === 1) intervalDays = 0.25;
      else if (g === 2) intervalDays = 1;
      else { intervalDays = 4; next.ease = Math.min(3.2, next.ease + 0.12); }
      next.interval = intervalDays;
      next.due = now + intervalDays * DAY;
    } else {
      const base = Math.max(0.5, next.interval || 1);
      if (g === 1) { intervalDays = Math.max(1, base * 1.2); next.ease = Math.max(1.3, next.ease - 0.15); }
      else if (g === 2) { intervalDays = Math.max(1, base * next.ease); }
      else {
        intervalDays = Math.max(2, base * next.ease * 1.3);
        next.ease = Math.min(3.2, next.ease + 0.12);
      }
      intervalDays = Math.min(3650, intervalDays);
      next.interval = intervalDays;
      next.due = now + intervalDays * DAY;
    }

    next.reps = (next.reps || 0) + 1;
    next.lastGrade = g;
    next.lastReview = now;
    if (g >= 2) next.correct = (next.correct || 0) + 1;
    else next.wrong = (next.wrong || 0) + 1;
    return next;
  }
  CR.schedule = schedule;

  function intervalLabel(days) {
    if (days <= 0) return '10m';
    if (days < 1 / 24 * 60) return Math.round(days * 24 * 60) + 'm';
    if (days < 1) return Math.round(days * 24) + 'h';
    if (days < 30) return (days < 10 ? days.toFixed(1).replace('.0', '') : Math.round(days)) + 'd';
    if (days < 365) return (days / 30).toFixed(1).replace('.0', '') + 'mo';
    return (days / 365).toFixed(1).replace('.0', '') + 'y';
  }

  CR.previewIntervals = function (st) {
    const out = {};
    [0, 1, 2, 3].forEach(g => {
      const n = schedule(st, g, Date.now());
      out[g] = g === 0 ? '10m' : intervalLabel(n.interval);
    });
    return out;
  };

  CR.recordGrade = function (cardId, g) {
    const st = CR.state.cards[cardId] || newCardState();
    const wasNew = st.reps === 0;
    const next = schedule(st, g);
    CR.state.cards[cardId] = next;

    const day = CR.todayKey();
    const d = CR.state.days[day] || (CR.state.days[day] = { reviews: 0, correct: 0, secs: 0, newCards: 0 });
    d.reviews += 1;
    if (g >= 2) d.correct += 1;
    if (wasNew) d.newCards += 1;

    CR.state.log.push({ t: Date.now(), id: cardId, g });
    if (CR.state.log.length > 4000) CR.state.log.splice(0, CR.state.log.length - 4000);
    CR.save(true);
    return next;
  };

  CR.suspend = function (cardId) {
    const st = CR.state.cards[cardId];
    if (st) { st.suspended = !st.suspended; CR.save(true); }
  };

  CR.bookmark = function (cardId) {
    const st = CR.state.cards[cardId];
    if (st) { st.bookmarked = !st.bookmarked; CR.save(true); }
    return st && st.bookmarked;
  };

  /* ---------------- heatmap + forecast ---------------- */
  CR.heatmap = function (weeks) {
    const w = weeks || 16;
    const today = CR.startOfDay(new Date());
    const dow = (today.getDay() + 6) % 7; // Monday=0
    const start = CR.addDays(today, -(w * 7 - 1) - (0) + (6 - dow) * 0); // end aligned today
    const startAligned = CR.addDays(today, -(w * 7 - 1) - dow);
    const cells = [];
    for (let i = 0; i < w * 7; i++) {
      const d = CR.addDays(startAligned, i);
      if (d > today) { cells.push(null); continue; }
      const k = CR.dateKey(d);
      const day = CR.state.days[k];
      cells.push({ key: k, count: day ? day.reviews : 0, today: k === CR.dateKey(today) });
    }
    return { cells, weeks: w };
  };

  CR.forecast = function (days) {
    const n = days || 7;
    const out = [];
    const now = new Date();
    for (let i = 0; i < n; i++) {
      const d = CR.addDays(CR.startOfDay(now), i);
      const end = d.getTime() + DAY;
      let count = 0;
      CR.activeCards().forEach(c => {
        const st = CR.state.cards[c.id];
        if (!st || st.suspended || st.reps === 0) return;
        if (st.due >= d.getTime() && st.due < end) count++;
      });
      out.push({ date: d, count });
    }
    return out;
  };

  CR.weakTopics = function (limit) {
    const map = {};
    CR.activeCards().forEach(c => {
      const st = CR.state.cards[c.id];
      if (!st || st.suspended || st.reps === 0) return;
      const weak = (st.lapses || 0) * 2 + (st.lastGrade <= 1 ? 2 : 0) + (st.ease < 2.1 ? 1 : 0);
      if (weak < 2) return;
      const key = c.deck + '|' + c.topic;
      if (!map[key]) map[key] = { deck: c.deck, topic: c.topic, score: 0, cards: [] };
      map[key].score += weak;
      map[key].cards.push(c.id);
    });
    return Object.values(map).sort((a, b) => b.score - a.score).slice(0, limit || 3);
  };

  /* ---------------- syntax highlighting ---------------- */
  const KW = 'const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|super|this|try|catch|finally|throw|typeof|instanceof|in|of|import|export|from|default|async|await|yield|static|public|private|protected|readonly|interface|type|enum|implements|package|void|int|long|double|float|boolean|char|byte|short|string|bool|def|elif|lambda|pass|raise|with|as|not|and|or|is|None|True|False|null|undefined|true|false|fun|val|record|using|namespace|struct|override|virtual|abstract|final|throws|select|from|where|join|group|order|by|insert|update|delete|create|table|index|constraint|primary|foreign|key|references|sum|count|avg|distinct|limit|having|inner|left|right|outer|on|is|like|between|exists|union|all|as|case|when|then|end';

  const TOKEN_RE = new RegExp(
    '(\\/\\/[^\\n]*|#[^\\n]*|--[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)' +          // 1 comments
    '|("(?:\\\\.|[^"\\\\])*"|\'(?:\\\\.|[^\'\\\\])*\'|`(?:\\\\.|[^`\\\\])*`)' + // 2 strings
    '|(\\b\\d+(?:\\.\\d+)?\\b)' +                                          // 3 numbers
    '|(\\b(?:' + KW + ')\\b)' +                                            // 4 keywords
    '|(\\b[A-Za-z_$][\\w$]*(?=\\s*\\())' +                                 // 5 calls
    '|(\\b[A-Z][A-Za-z0-9_]*\\b)', 'g');                                    // 6 types

  CR.highlight = function (code, lang) {
    let src = String(code || '');
    let out = '';
    let last = 0;
    let m;
    TOKEN_RE.lastIndex = 0;
    while ((m = TOKEN_RE.exec(src))) {
      out += esc(src.slice(last, m.index));
      let cls = '';
      if (m[1]) cls = 'tok-com';
      else if (m[2]) cls = 'tok-str';
      else if (m[3]) cls = 'tok-num';
      else if (m[4]) cls = 'tok-key';
      else if (m[5]) cls = 'tok-fn';
      else if (m[6]) cls = 'tok-type';
      out += '<span class="' + cls + '">' + esc(m[0]) + '</span>';
      last = m.index + m[0].length;
    }
    out += esc(src.slice(last));
    return out;
  };

  CR.codeBlock = function (code, lang) {
    if (!code) return '';
    const label = (lang || 'code').toUpperCase();
    return '<div class="codeblock"><div class="cb-head"><span class="dotrow"><i></i><i></i><i></i></span><span>' +
      esc(label) + '</span></div><pre>' + CR.highlight(code, lang) + '</pre></div>';
  };

  /* ---------------- markdown-ish for AI ---------------- */
  CR.mdToHtml = function (text) {
    const src = String(text || '');
    const blocks = src.split(/```(\w*)\n?([\s\S]*?)```/g);
    let html = '';
    for (let i = 0; i < blocks.length; i += 3) {
      const prose = blocks[i];
      const lang = blocks[i + 1];
      const code = blocks[i + 2];
      if (prose) {
        let s = esc(prose);
        s = s.replace(/^### (.+)$/gm, '<span class="b-h">$1</span>');
        s = s.replace(/^## (.+)$/gm, '<span class="b-h">$1</span>');
        s = s.replace(/^# (.+)$/gm, '<span class="b-h">$1</span>');
        s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
        s = s.replace(/`([^`\n]+)`/g, '<code>$1</code>');
        s = s.replace(/^\s*[-*] (.+)$/gm, '• $1');
        html += s;
      }
      if (code) html += '<pre>' + CR.highlight(code, lang) + '</pre>';
    }
    return html;
  };

  /* ---------------- toast + modal ---------------- */
  CR.toast = function (msg, type) {
    const root = CR.qs('#toastRoot');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'err' ? ' err' : '');
    el.innerHTML = '<span class="t-dot"></span><span>' + esc(msg) + '</span>';
    root.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .25s, transform .25s';
      el.style.opacity = '0'; el.style.transform = 'translateY(6px)';
      setTimeout(() => el.remove(), 260);
    }, type === 'err' ? 6500 : 3200);
  };

  let modalOpen = null;

  CR.modal = function (opts) {
    CR.closeModal();
    const root = CR.qs('#modalRoot');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = '<div class="modal ' + (opts.wide ? 'wide ' : '') + (opts.narrow ? 'narrow ' : '') + '" role="dialog" aria-modal="true">' +
      '<div class="modal-head"><div><h2>' + esc(opts.title || '') + '</h2>' +
      (opts.sub ? '<p>' + esc(opts.sub) + '</p>' : '') + '</div>' +
      '<button class="icon-btn" data-close aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="modal-body"></div>' +
      (opts.foot ? '<div class="modal-foot">' + opts.foot + '</div>' : '') + '</div>';
    root.appendChild(overlay);
    const body = overlay.querySelector('.modal-body');
    if (typeof opts.body === 'string') body.innerHTML = opts.body;
    else if (opts.body) body.appendChild(opts.body);

    const close = () => CR.closeModal();
    overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('[data-close]').addEventListener('click', close);
    modalOpen = { overlay, close, opts };
    if (opts.onMount) opts.onMount(overlay.querySelector('.modal'), close);
    return close;
  };

  CR.closeModal = function () {
    if (modalOpen) {
      const { overlay } = modalOpen;
      modalOpen = null;
      overlay.remove();
    }
  };
  CR.isModalOpen = () => !!modalOpen;
  CR.hasModal = () => !!modalOpen;

  CR.confirm = function (title, text, confirmLabel, danger) {
    return new Promise(resolve => {
      let done = false;
      const close = CR.modal({
        title, narrow: true,
        body: '<p class="sub" style="margin:0">' + esc(text) + '</p>',
        foot: '<button class="btn ghost" data-no>Cancel</button>' +
              '<button class="btn ' + (danger ? 'danger' : 'primary') + '" data-yes>' + esc(confirmLabel || 'Confirm') + '</button>',
        onMount: (modal, closeFn) => {
          modal.querySelector('[data-no]').onclick = () => { done = true; closeFn(); resolve(false); };
          modal.querySelector('[data-yes]').onclick = () => { done = true; closeFn(); resolve(true); };
        }
      });
      const check = setInterval(() => {
        if (!CR.isModalOpen()) { clearInterval(check); if (!done) resolve(false); }
      }, 100);
      setTimeout(() => clearInterval(check), 300000);
      return close;
    });
  };

  /* ---------------- keyboard helper ---------------- */
  CR.isTyping = function (e) {
    const t = e.target;
    if (!t) return false;
    const tag = (t.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
  };

  /* ---------------- AI helpers ---------------- */
  CR.aiSettings = function () {
    const ai = CR.state.settings.ai || defaultAI();
    return { provider: ai.provider, model: ai.model, baseUrl: ai.baseUrl, key: ai.key || '' };
  };

  CR.aiLabel = function () {
    const p = (CR.state.settings.ai || {}).provider || 'free';
    return {
      free: 'Free AI · no key', openrouter: 'OpenRouter', groq: 'Groq',
      gemini: 'Gemini', ollama: 'Local Ollama', custom: 'Custom API', offline: 'Offline only'
    }[p] || p;
  };

  CR.aiChat = async function (messages, maxTokens) {
    const res = await call('ai.chat', {
      settings: CR.aiSettings(),
      messages,
      maxTokens: maxTokens || 1200
    });
    if (!res || !res.text) throw new Error('The AI returned an empty answer.');
    return res.text;
  };

  CR.aiAvailable = function () {
    const p = (CR.state.settings.ai || {}).provider || 'free';
    if (p === 'offline') return false;
    if (p === 'free') return true;
    return !!((CR.state.settings.ai || {}).key);
  };

  /* ---------------- card helpers ---------------- */
  CR.deckOf = function (card) { return CR.deckById[card.deck] || { id: card.deck, name: card.deck, color: '#7cf2c0', short: '?' }; };

  CR.cardStatus = function (id) {
    const st = CR.state.cards[id] || newCardState();
    if (st.suspended) return { key: 'suspended', label: 'Suspended', cls: '' };
    if (st.reps === 0) return { key: 'new', label: 'New', cls: 'violet' };
    if (st.due <= Date.now()) return { key: 'due', label: 'Due', cls: 'mint' };
    if (st.interval >= 21) return { key: 'mature', label: 'Mature', cls: '' };
    if (st.interval >= 1) return { key: 'young', label: 'Learning', cls: 'amber' };
    return { key: 'learning', label: 'Relearning', cls: 'amber' };
  };

  CR.searchCards = function (query, deckId, status, scope) {
    const q = (query || '').trim().toLowerCase();
    const active = CR.activeDeckSet();
    return CR.cards.filter(c => {
      if (deckId === '__all') {
        // explicit "everything", including decks outside the plan
      } else if (deckId) {
        if (c.deck !== deckId) return false;
      } else if (scope !== 'all' && !active.has(c.deck)) {
        return false;
      }
      const st = CR.state.cards[c.id] || newCardState();
      if (status === 'due' && !(st.reps > 0 && st.due <= Date.now() && !st.suspended)) return false;
      if (status === 'new' && !(st.reps === 0 && !st.suspended)) return false;
      if (status === 'learning' && !(st.reps > 0 && st.interval < 1 && !st.suspended)) return false;
      if (status === 'mature' && !(st.interval >= 21 && !st.suspended)) return false;
      if (status === 'flagged' && !st.bookmarked) return false;
      if (status === 'suspended' && !st.suspended) return false;
      if (!q) return true;
      return (c.q + ' ' + c.topic + ' ' + (c.a || []).join(' ') + ' ' + (c.code || '') + ' ' + (c.why || ''))
        .toLowerCase().includes(q);
    });
  };

  CR.deckOptions = function () {
    return CR.decks.map(d => '<option value="' + esc(d.id) + '">' + esc(d.name) + '</option>').join('');
  };

  /* ---------------- lifecycle ---------------- */
  window.addEventListener('beforeunload', () => { if (CR.ready) CR.save(true); });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && CR.ready) CR.save(true);
  });
})();
