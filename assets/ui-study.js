/* CodeRecall — study setup + session */
(function () {
  'use strict';
  const CR = window.CR;

  const MODES = {
    mix: { name: 'Due + new', desc: 'Clear scheduled reviews, then meet a few new cards.', icon: 'M4 6h16M4 12h10M4 18h7' },
    review: { name: 'Due only', desc: 'Everything whose review date has arrived.', icon: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5' },
    new: { name: 'New only', desc: 'Cards you have never seen before.', icon: 'M12 5v14M5 12h14' },
    weak: { name: 'Weak spots', desc: 'Cards you failed or rated hard. Highest priority first.', icon: 'M12 3l9 17H3z' },
    cram: { name: 'Cram', desc: 'All cards, shuffled. Grades do not change your schedule.', icon: 'M4 19V5M4 5l8 7-8 7M12 19V5M12 5l8 7-8 7' }
  };

  function shuffle(a) {
    const x = a.slice();
    for (let i = x.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [x[i], x[j]] = [x[j], x[i]];
    }
    return x;
  }

  function weakCards(deckIds, topic) {
    const set = deckIds && deckIds.length ? new Set(deckIds) : null;
    return CR.cards.filter(c => {
      if (set ? !set.has(c.deck) : !CR.isDeckActive(c.deck)) return false;
      if (topic && c.topic !== topic) return false;
      const st = CR.state.cards[c.id];
      if (!st || st.suspended || st.reps === 0) return false;
      return (st.lapses || 0) > 0 || (st.lastGrade != null && st.lastGrade <= 1) || st.due <= Date.now();
    }).sort((a, b) => {
      const A = CR.state.cards[a.id], B = CR.state.cards[b.id];
      return (B.lapses * 2 + (B.lastGrade <= 1 ? 1 : 0)) - (A.lapses * 2 + (A.lastGrade <= 1 ? 1 : 0));
    });
  }

  function counts(deckIds, topic) {
    const due = CR.dueAll(deckIds).filter(c => !topic || c.topic === topic).length;
    const s = CR.stats();
    const newAvail = CR.newAll(deckIds).filter(c => !topic || c.topic === topic);
    const newBudget = Math.min(s.newRemaining, newAvail.length);
    return { due, newAvail: newAvail.length, newBudget, weak: weakCards(deckIds, topic).length, all: CR.cards.filter(c => (deckIds.length ? deckIds.includes(c.deck) : CR.isDeckActive(c.deck)) && (!topic || c.topic === topic) && !CR.state.cards[c.id].suspended).length };
  }

  function buildQueue(opts) {
    const deckIds = opts.deckIds || [];
    const topic = opts.topic || null;
    const mode = opts.mode || 'mix';
    const s = CR.stats();

    if (opts.cardId && CR.cardById[opts.cardId]) {
      return { ids: [opts.cardId], noSchedule: false };
    }

    if (mode === 'cram') {
      let all = CR.cards.filter(c => (deckIds.length ? deckIds.includes(c.deck) : CR.isDeckActive(c.deck)) &&
        (!topic || c.topic === topic) && !CR.state.cards[c.id].suspended);
      return { ids: shuffle(all).slice(0, 100).map(c => c.id), noSchedule: true };
    }
    if (mode === 'weak') {
      const weak = weakCards(deckIds, topic).slice(0, 40);
      return { ids: weak.map(c => c.id), noSchedule: false };
    }

    const due = CR.dueAll(deckIds).filter(c => !topic || c.topic === topic)
      .sort((a, b) => CR.state.cards[a.id].due - CR.state.cards[b.id].due).map(c => c.id);
    const newAllowed = Math.max(0, Math.min(
      opts.newLimit != null ? opts.newLimit : s.newRemaining,
      CR.newAll(deckIds).filter(c => !topic || c.topic === topic).length));
    const news = shuffle(CR.newAll(deckIds).filter(c => !topic || c.topic === topic)).slice(0, newAllowed).map(c => c.id);

    if (mode === 'review') return { ids: due, noSchedule: false };
    if (mode === 'new') return { ids: news, noSchedule: false };

    // mix: due reviews first, with new cards sprinkled in every few cards
    const out = [];
    let ni = 0;
    due.forEach((id, i) => {
      out.push(id);
      if ((i + 1) % 3 === 0 && ni < news.length) out.push(news[ni++]);
    });
    while (ni < news.length) out.push(news[ni++]);
    return { ids: out, noSchedule: false };
  }

  CR.startSession = function (opts) {
    opts = opts || {};
    const built = buildQueue(opts);
    if (!built.ids.length) {
      CR.toast(opts.mode === 'weak' ? 'No weak spots yet — grade a few cards first.' : 'Nothing in that selection. Try Cram or another deck.');
      return false;
    }
    const session = {
      mode: opts.mode || 'mix',
      deckIds: opts.deckIds || [],
      topic: opts.topic || null,
      noSchedule: !!built.noSchedule,
      queue: built.ids.slice(1),
      cardId: built.ids[0],
      total: built.ids.length,
      completed: 0,
      reviewed: 0,
      correct: 0,
      results: [],
      startTs: Date.now(),
      shownTs: Date.now(),
      revealed: false,
      choice: null,
      hintShown: false,
      finished: false
    };
    CR.activeSession = session;
    CR.route('study');
    return true;
  };

  /* ---------------- setup ---------------- */
  function renderSetup(opts) {
    const deckIds = opts.deck ? [opts.deck] : (opts.deckIds || []);
    let selected = deckIds.slice();
    let mode = opts.mode || 'mix';
    let newLimit = CR.stats().newRemaining;
    const topic = opts.topic || null;

    const main = CR.qs('#main');
    const activeDecks = CR.decks.filter(d => CR.isDeckActive(d.id));
    const hidden = CR.decks.length - activeDecks.length;
    main.innerHTML =
      '<div class="page narrow">' +
        '<div class="setup-hero">' +
          '<div class="eyebrow">Study</div>' +
          '<h1>Build a session.</h1>' +
          '<p class="sub">' + (topic ? 'Focusing on <b class="mint">' + CR.esc(topic) + '</b>. ' : '') +
            'Pick from your plan. Short sessions beat marathons — 20 to 40 cards is plenty.</p>' +
        '</div>' +
        '<div class="setup-grid">' +
          '<div class="stack">' +
            '<div class="panel">' +
              '<div class="panel-h"><h2>Your decks</h2><div class="spacer"></div>' +
                '<button class="btn sm ghost" data-all>All</button>' +
                '<button class="btn sm ghost" data-edit-plan>Edit plan</button></div>' +
              '<div class="chip-row" id="deckChips">' +
                activeDecks.map(d => {
                  const st = CR.deckStats(d.id);
                  const on = !selected.length || selected.includes(d.id);
                  return '<button class="chip' + (on ? ' active' : '') + '" data-chip="' + d.id + '" style="--deck:' + d.color + '">' +
                    '<span class="cdot"></span>' + CR.esc(d.name) +
                    '<span class="cnum">' + st.due + ' due</span></button>';
                }).join('') +
              '</div>' +
              '<p class="hint" style="margin:11px 0 0">Leave every deck cleared to study your whole plan.' +
                (hidden > 0 ? ' <a href="#" data-edit-plan>' + hidden + ' deck' + (hidden === 1 ? '' : 's') + ' hidden by your plan</a>.' : '') + '</p>' +
            '</div>' +

            '<div class="panel">' +
              '<div class="panel-h"><h2>Mode</h2></div>' +
              '<div class="mode-grid" id="modeGrid">' +
                Object.keys(MODES).map(k => {
                  const m = MODES[k];
                  return '<button class="mode-card' + (mode === k ? ' active' : '') + '" data-mode="' + k + '">' +
                    '<div class="mc-top"><svg viewBox="0 0 24 24"><path d="' + m.icon + '"/></svg>' + m.name +
                    '<span class="mc-n" data-count="' + k + '"></span></div>' +
                    '<div class="mc-desc">' + m.desc + '</div></button>';
                }).join('') +
              '</div>' +
            '</div>' +
          '</div>' +

          '<div class="panel" style="position:sticky;top:12px">' +
            '<div class="eyebrow">This session</div>' +
            '<div style="font-size:38px;font-weight:650;letter-spacing:-.05em;line-height:1.1" id="sumN">0</div>' +
            '<div class="hint" id="sumWord">cards</div>' +
            '<div class="divider"></div>' +
            '<div class="row between" style="margin-bottom:8px"><span class="hint">New cards</span><span class="range-val" id="newVal">' + newLimit + '</span></div>' +
            '<div class="slider-row"><input type="range" id="newRange" min="0" max="30" step="1" value="' + newLimit + '"></div>' +
            '<p class="hint" style="margin:8px 0 14px">New cards are limited so reviews never pile up. <span id="newHint"></span></p>' +
            '<button class="btn primary block lg" id="startBtn">Start session</button>' +
            '<p class="hint" style="margin-top:10px;text-align:center">' + CR.esc(CR.aiLabel()) + ' tutor available inside every card.</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    function refresh() {
      const c = counts(selected, topic);
      const map = {
        mix: c.due + Math.min(newLimit, c.newAvail),
        review: c.due,
        new: Math.min(newLimit, c.newAvail),
        weak: c.weak,
        cram: Math.min(c.all, 100)
      };
      CR.qsa('#modeGrid [data-count]').forEach(el => {
        const n = map[el.dataset.count] || 0;
        el.textContent = n ? n : '';
      });
      const n = map[mode] || 0;
      CR.qs('#sumN').textContent = n;
      CR.qs('#sumWord').textContent = n === 1 ? 'card ready' : 'cards ready';
      CR.qs('#startBtn').textContent = n > 0 ? 'Start ' + n + ' cards' : 'Nothing selected';
      CR.qs('#startBtn').disabled = n === 0;
      CR.qs('#newHint').textContent = c.newBudget + ' new available today.';
      CR.qsa('#deckChips .chip').forEach(ch => ch.classList.toggle('active', !selected.length || selected.includes(ch.dataset.chip)));
    }

    main.querySelectorAll('[data-chip]').forEach(ch => ch.addEventListener('click', () => {
      const id = ch.dataset.chip;
      if (selected.includes(id)) selected = selected.filter(x => x !== id);
      else selected.push(id);
      if (selected.length === CR.decks.length) selected = [];
      refresh();
    }));
    main.querySelector('[data-all]').addEventListener('click', () => { selected = []; refresh(); });
    main.querySelectorAll('[data-edit-plan]').forEach(el => el.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      CR.openProfileWizard({ edit: true });
    }));
    main.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
      mode = b.dataset.mode;
      CR.qsa('#modeGrid .mode-card').forEach(x => x.classList.toggle('active', x.dataset.mode === mode));
      refresh();
    }));
    const range = CR.qs('#newRange');
    const newVal = CR.qs('#newVal');
    range.addEventListener('input', () => { newLimit = Number(range.value); newVal.textContent = newLimit; refresh(); });
    CR.qs('#startBtn').addEventListener('click', () => {
      CR.startSession({ deckIds: selected, mode, newLimit, topic });
    });

    refresh();
  }

  /* ---------------- session ---------------- */
  function renderSession() {
    const s = CR.activeSession;
    if (!s) { renderSetup({}); return; }
    if (s.finished) { renderSummary(); return; }
    const card = CR.cardById[s.cardId];
    if (!card) { CR.activeSession = null; renderSetup({}); return; }

    const deck = CR.deckOf(card);
    const st = CR.state.cards[card.id] || CR.newCardState();
    const prev = CR.previewIntervals(st);
    const pct = s.total ? Math.round((s.completed / s.total) * 100) : 0;
    const isMcq = card.type === 'mcq' && Array.isArray(card.choices);
    const typeLabel = { concept: 'Concept', code: 'Code reading', mcq: 'Multiple choice', cloze: 'Fill the gap' }[card.type] || 'Card';

    let choicesHtml = '';
    if (isMcq) {
      choicesHtml = '<div class="mcq-grid">' + card.choices.map((c, i) => {
        let cls = 'mcq';
        if (s.revealed) {
          if (i === card.correct) cls += ' correct';
          else if (s.choice === i) cls += ' wrong';
        }
        return '<button class="' + cls + '" data-choice="' + i + '">' +
          '<span class="letter">' + String.fromCharCode(65 + i) + '</span>' +
          '<span class="mtext">' + CR.esc(c) + '</span></button>';
      }).join('') + '</div>';
    }

    const answerHtml = s.revealed
      ? '<div class="answer">' +
          '<div class="ans-label">Answer</div>' +
          '<ul class="ans-list">' + (card.a || []).map(x => '<li>' + CR.esc(x) + '</li>').join('') + '</ul>' +
          (card.why ? '<div class="why"><b>Why it matters · </b>' + CR.esc(card.why) + '</div>' : '') +
          (s.hintShown && card.hint ? '<div class="hintbox"><b class="amber">Hint · </b>' + CR.esc(card.hint) + '</div>' : '') +
          '<div class="row wrap" style="margin-top:16px;gap:6px">' +
            '<button class="btn sm ghost" data-ai="simpler">✦ Explain simpler</button>' +
            '<button class="btn sm ghost" data-ai="example">Code example</button>' +
            '<button class="btn sm ghost" data-ai="quiz">Quiz me</button>' +
          '</div>' +
          '<div class="grade-row">' +
            gradeBtn('again', 'Again', prev[0], 1) +
            gradeBtn('hard', 'Hard', prev[1], 2) +
            gradeBtn('good', 'Good', prev[2], 3) +
            gradeBtn('easy', 'Easy', prev[3], 4) +
          '</div>' +
        '</div>'
      : '<div class="reveal-wrap">' +
          '<button class="reveal-btn" data-reveal><span class="kbd">Space</span> Reveal answer</button>' +
        '</div>';

    CR.qs('#main').innerHTML =
      '<div class="study-shell">' +
        '<div class="study-top">' +
          '<button class="icon-btn" data-exit title="End session (Esc)"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>' +
          '<div class="st-deck"><span class="dot" style="background:' + deck.color + ';box-shadow:none"></span><b>' + CR.esc(deck.name) + '</b>' +
            (card.topic ? '<span class="dim">· ' + CR.esc(card.topic) + '</span>' : '') + '</div>' +
          '<div class="progress"><i style="width:' + pct + '%"></i></div>' +
          '<div class="study-count">' + s.completed + ' / ' + s.total + '</div>' +
        '</div>' +

        '<div class="qcard">' +
          '<div class="qcard-head">' +
            '<span class="pill" style="border-color:color-mix(in srgb,' + deck.color + ' 30%, transparent);color:' + deck.color + '">' + CR.esc(typeLabel) + '</span>' +
            '<span class="q-tag">' + CR.esc(card.topic || '') + '</span>' +
            (st.reps === 0 ? '<span class="pill violet">New</span>' : '') +
            '<div class="spacer"></div>' +
            '<button class="icon-btn" data-bookmark title="Bookmark (B)">' +
              '<svg viewBox="0 0 24 24" style="' + (st.bookmarked ? 'fill:var(--mint);stroke:var(--mint)' : '') + '"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg></button>' +
            '<button class="icon-btn" data-edit title="Edit / duplicate (E)"><svg viewBox="0 0 24 24"><path d="M4 20h4L20 8l-4-4L4 16z"/></svg></button>' +
          '</div>' +

          '<div class="q-body">' +
            '<div class="q-front' + (card.type === 'code' && /^[^\n]{0,80}$/.test(card.q) ? '' : '') + '">' + CR.esc(card.q) + '</div>' +
            CR.codeBlock(card.code, card.lang) +
            (s.hintShown && !s.revealed && card.hint ? '<div class="hintbox"><b class="amber">Hint · </b>' + CR.esc(card.hint) + '</div>' : '') +
            choicesHtml +
            answerHtml +
          '</div>' +
        '</div>' +

        '<div class="study-foot">' +
          '<span>' + (s.mode === 'cram' ? 'Cram · schedule untouched' : 'Scheduling on') + '</span>' +
          '<span>·</span><span>' + s.reviewed + ' reviewed</span>' +
          '<div class="spacer"></div>' +
          '<button class="btn sm ghost" data-hint ' + (!card.hint || s.revealed ? 'disabled' : '') + '>Hint · H</button>' +
          '<button class="btn sm ghost" data-suspend>Suspend</button>' +
        '</div>' +
      '</div>';

    /* wiring */
    const main = CR.qs('#main');
    main.querySelector('[data-exit]').addEventListener('click', CR.exitSession);
    main.querySelector('[data-reveal]') && main.querySelector('[data-reveal]').addEventListener('click', reveal);
    main.querySelectorAll('[data-choice]').forEach(b => b.addEventListener('click', () => {
      if (s.revealed) return;
      s.choice = Number(b.dataset.choice);
      reveal();
    }));
    main.querySelectorAll('[data-grade]').forEach(b => b.addEventListener('click', () => grade(Number(b.dataset.grade))));
    main.querySelector('[data-bookmark]').addEventListener('click', () => {
      const on = CR.bookmark(card.id);
      CR.toast(on ? 'Bookmarked' : 'Bookmark removed');
      renderSession();
    });
    main.querySelector('[data-edit]').addEventListener('click', () => CR.openCardEditor(card.id));
    main.querySelector('[data-hint]') && main.querySelector('[data-hint]').addEventListener('click', showHint);
    main.querySelector('[data-suspend]').addEventListener('click', () => {
      CR.suspend(card.id);
      CR.toast('Card suspended. It will not appear in reviews.');
      s.queue = s.queue.filter(x => x !== card.id);
      advance();
    });
    main.querySelectorAll('[data-ai]').forEach(b => b.addEventListener('click', () => {
      CR.aiExplainCard(card, b.dataset.ai);
    }));

    if (!s.revealed) {
      // put focus on the document so Space works without clicking
      document.body.focus();
    }
    CR.setTitleMid('<span>' + s.completed + ' of ' + s.total + ' complete</span>');
  }

  function gradeBtn(kind, label, when, key) {
    return '<button class="grade ' + kind + '" data-grade="' + (key - 1) + '">' +
      '<span class="g-name">' + label + ' <span class="kbd">' + key + '</span></span>' +
      '<span class="g-when">' + when + '</span></button>';
  }

  function reveal() {
    const s = CR.activeSession;
    if (!s || s.revealed) return;
    s.revealed = true;
    if (s.choice == null) {
      const card = CR.cardById[s.cardId];
      if (card.type === 'mcq' && Array.isArray(card.choices)) s.choice = -1;
    }
    renderSession();
  }

  function showHint() {
    const s = CR.activeSession;
    if (!s || s.revealed) return;
    s.hintShown = true;
    renderSession();
  }

  function grade(g) {
    const s = CR.activeSession;
    if (!s || !s.revealed || s.finished) return;
    const card = CR.cardById[s.cardId];
    const st = CR.state.cards[card.id] || CR.newCardState();
    const wasNew = st.reps === 0;
    const ms = Date.now() - s.shownTs;

    if (s.noSchedule) {
      const day = CR.todayKey();
      const d = CR.state.days[day] || (CR.state.days[day] = { reviews: 0, correct: 0, secs: 0, newCards: 0 });
      d.reviews += 1;
      if (g >= 2) d.correct += 1;
      d.secs += Math.round(ms / 1000);
      CR.state.log.push({ t: Date.now(), id: card.id, g });
      CR.save(true);
    } else {
      CR.recordGrade(card.id, g);
      const day = CR.todayKey();
      const d = CR.state.days[day];
      if (d) d.secs = (d.secs || 0) + Math.round(ms / 1000);
    }

    s.results.push({ id: card.id, g, ms, wasNew });
    s.reviewed += 1;
    if (g === 0) {
      // bring it back within this session
      const at = Math.min(3, s.queue.length);
      s.queue.splice(at, 0, card.id);
    } else {
      s.completed += 1;
      if (g >= 2) s.correct += 1;
    }
    advance();
  }

  function advance() {
    const s = CR.activeSession;
    if (!s) return;
    if (!s.queue.length) { finish(); return; }
    s.cardId = s.queue.shift();
    s.revealed = false;
    s.choice = null;
    s.hintShown = false;
    s.shownTs = Date.now();
    renderSession();
    CR.refreshChrome();
  }

  function finish() {
    const s = CR.activeSession;
    if (!s) return;
    s.finished = true;
    CR.save(true);
    CR.refreshChrome();
    renderSummary();
  }

  function renderSummary() {
    const s = CR.activeSession;
    const total = s.results.length;
    const acc = total ? Math.round((s.correct / total) * 100) : 0;
    const secs = Math.round((Date.now() - s.startTs) / 1000);
    const mins = Math.floor(secs / 60), rem = secs % 60;
    const revisit = [];
    const seen = new Set();
    s.results.forEach(r => {
      if (r.g === 0 && !seen.has(r.id)) { seen.add(r.id); revisit.push(CR.cardById[r.id]); }
    });
    const st = CR.stats();

    CR.qs('#main').innerHTML =
      '<div class="page narrow" style="max-width:820px">' +
        '<div class="setup-hero" style="text-align:center">' +
          '<div class="big-mark" style="width:58px;height:58px;margin:0 auto 14px;border-radius:16px;display:grid;place-items:center;font-size:20px;background:linear-gradient(145deg,#8ff7cd,#4fdcae);color:#06251a;box-shadow:0 16px 40px rgba(61,214,160,.28)">✓</div>' +
          '<div class="eyebrow">Session complete</div>' +
          '<h1 style="font-size:32px">' + (acc >= 80 ? 'Locked in.' : acc >= 55 ? 'Good work.' : 'That one was heavy.') + '</h1>' +
          '<p class="sub">You reviewed ' + total + ' time' + (total === 1 ? '' : 's') + ' across ' + s.total + ' card' + (s.total === 1 ? '' : 's') + ' in ' + mins + 'm ' + rem + 's.</p>' +
        '</div>' +
        '<div class="stat-grid" style="grid-template-columns:repeat(3,1fr)">' +
          '<div class="stat mint"><div class="st-glow"></div><div class="st-label">Accuracy</div><div class="st-value">' + acc + '<small>%</small></div><div class="st-sub">Good + Easy answers</div></div>' +
          '<div class="stat violet"><div class="st-glow"></div><div class="st-label">Cards passed</div><div class="st-value">' + s.completed + '<small>/' + s.total + '</small></div><div class="st-sub">' + (s.results.filter(r => r.g === 0).length) + ' “again” answers</div></div>' +
          '<div class="stat amber"><div class="st-glow"></div><div class="st-label">Streak</div><div class="st-value">' + st.streak + '<small>days</small></div><div class="st-sub">' + st.reviewedToday + ' reviewed today</div></div>' +
        '</div>' +
        (revisit.length
          ? '<div class="panel" style="margin-top:4px"><div class="panel-h"><h2>Worth another look</h2><div class="spacer"></div><span class="hint">' + revisit.length + ' card' + (revisit.length === 1 ? '' : 's') + '</span></div><div class="list">' +
            revisit.slice(0, 6).map(c => {
              const d = CR.deckOf(c);
              return '<div class="list-row" data-preview="' + CR.esc(c.id) + '"><div class="lr-main"><div class="lr-title">' + CR.esc(c.q) + '</div>' +
                '<div class="lr-sub"><span class="pill" style="color:' + d.color + '">' + CR.esc(d.short) + '</span> ' + CR.esc(c.topic) + '</div></div></div>';
            }).join('') + '</div></div>'
          : '') +
        '<div class="row" style="justify-content:center;margin-top:18px;gap:9px">' +
          '<button class="btn ghost" data-home>Back to Today</button>' +
          '<button class="btn primary" data-again>Another session</button>' +
        '</div>' +
      '</div>';

    const main = CR.qs('#main');
    main.querySelector('[data-home]').addEventListener('click', () => {
      CR.activeSession = null;
      CR.route('today');
    });
    main.querySelector('[data-again]').addEventListener('click', () => {
      CR.activeSession = null;
      renderSetup({});
    });
    main.querySelectorAll('[data-preview]').forEach(el => {
      el.addEventListener('click', () => CR.showCard(el.dataset.preview));
    });
    CR.setTitleMid('');
  }

  CR.pages.study = function (opts) {
    if (CR.activeSession) renderSession();
    else renderSetup(opts || {});
  };

  CR.exitSession = function () {
    const s = CR.activeSession;
    if (!s) { CR.route('study'); return; }
    if (s.finished || s.reviewed === 0) {
      CR.activeSession = null;
      CR.route('study');
      return;
    }
    CR.confirm('End this session?', 'Your completed reviews are already saved. Unseen cards will still be waiting.', 'End session', true)
      .then(ok => {
        if (ok) { CR.activeSession = null; CR.route('study'); CR.refreshChrome(); }
      });
  };

  CR.studyKey = function (e) {
    const s = CR.activeSession;
    if (!s || s.finished) return false;
    const k = e.key.toLowerCase();
    if (e.key === ' ' || k === 'enter') { if (!s.revealed) { reveal(); return true; } return false; }
    if (!s.revealed) {
      if (k === 'h') { showHint(); return true; }
      if (k === 'b') { CR.bookmark(s.cardId); renderSession(); return true; }
      if (k === 'e') { CR.openCardEditor(s.cardId); return true; }
      if (['a', 'b', 'c', 'd'].includes(k) && s.cardId) {
        const card = CR.cardById[s.cardId];
        if (card.type === 'mcq' && Array.isArray(card.choices)) {
          const i = k.charCodeAt(0) - 97;
          if (i < card.choices.length) { s.choice = i; reveal(); return true; }
        }
      }
      return false;
    }
    if (['1', '2', '3', '4'].includes(e.key)) { grade(Number(e.key) - 1); return true; }
    if (k === 'b') { CR.bookmark(s.cardId); renderSession(); return true; }
    if (k === 'e') { CR.openCardEditor(s.cardId); return true; }
    return false;
  };

  document.addEventListener('keydown', (e) => {
    if (CR.isModalOpen() || CR.isTyping(e)) return;
    if (e.key === ' ' && CR.activeSession && !CR.activeSession.finished && CR.activeSession.revealed) {
      e.preventDefault();
    }
  });
})();
