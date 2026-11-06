/* CodeRecall — personal plan wizard + guided tour */
(function () {
  'use strict';
  const CR = window.CR;

  const BACKGROUNDS = [
    { v: 'student', t: 'Still studying', d: 'I have the theory but little production experience.' },
    { v: 'newgrad', t: 'Recent graduate', d: 'I finished a CS degree and want to be job-ready.' },
    { v: 'returning', t: 'Returning after a break', d: 'I used to code; it has been months or years.' },
    { v: 'working', t: 'Working engineer', d: 'I ship code but some fundamentals got rusty.' },
    { v: 'selftaught', t: 'Self-taught / switching in', d: 'I learned on the job and have gaps in CS basics.' }
  ];

  const FRESHNESS = [
    { v: 'starting', t: 'Mostly gone', d: 'Start me from the foundations. Keep the load light.' },
    { v: 'rusty', t: 'Rusty', d: 'I recognise it, but I cannot recall the details under pressure.' },
    { v: 'current', t: 'Mostly current', d: 'Sharpen the edges and fill specific gaps.' }
  ];

  const GOALS = [
    { v: 'interview', t: 'Interview prep', d: 'DSA, CS core and system design, with enough language detail to answer cleanly.' },
    { v: 'refresh', t: 'Refresh fundamentals', d: 'Rebuild the base: languages, OS, databases and the web.' },
    { v: 'newrole', t: 'New role or stack', d: 'Ramp into a job that uses a different stack or a broader remit.' },
    { v: 'depth', t: 'Go deeper', d: 'I know the basics; I want the trade-offs and the details.' },
    { v: 'habit', t: 'Daily habit', d: 'A small, steady session that keeps everything warm.' }
  ];

  const PACE = {
    light: { name: 'Light', desc: '20 cards · 8 new · ~10 min', dailyGoal: 20, newPerDay: 8 },
    steady: { name: 'Steady', desc: '40 cards · 12 new · ~15 min', dailyGoal: 40, newPerDay: 12 },
    intense: { name: 'Intense', desc: '70 cards · 20 new · ~25 min', dailyGoal: 70, newPerDay: 20 }
  };

  function choiceGrid(group, items, value) {
    return '<div class="choice-grid" data-group="' + group + '">' + items.map(it =>
      '<button type="button" class="choice' + (value === it.v ? ' active' : '') + '" data-choice="' + it.v + '">' +
        '<b>' + CR.esc(it.t) + '</b><span>' + CR.esc(it.d) + '</span></button>').join('') + '</div>';
  }

  function dots(step, total) {
    let html = '';
    for (let i = 0; i < total; i++) html += '<i class="' + (i === step ? 'on' : (i < step ? 'done' : '')) + '"></i>';
    return '<div class="wiz-dots">' + html + '</div>';
  }

  CR.openProfileWizard = function (opts) {
    opts = opts || {};
    const existing = CR.state.profile || {};
    const data = {
      name: CR.state.name || '',
      background: existing.background || '',
      freshness: existing.freshness || '',
      goal: existing.goal || '',
      pace: existing.pace || CR.defaultPace(existing.freshness || 'rusty'),
      interests: Array.isArray(existing.interests) ? existing.interests.slice() : []
    };
    const firstRun = !!opts.firstRun;
    let step = firstRun ? 0 : 1;
    let paceTouched = !!(existing.completedAt || existing.updatedAt);
    let paceChanged = false;
    let showTour = firstRun;
    const total = 5;

    function canNext() {
      if (step === 1) return !!(data.background && data.freshness);
      if (step === 2) return !!data.goal;
      if (step === 3) return data.interests.length > 0;
      return true;
    }

    function planCards() {
      const chosen = new Set(data.interests);
      // Keep the recommendation order so the copy, numbering and queue agree.
      return CR.recommendDecks(data).map(x => x.deck).filter(d => chosen.has(d.id));
    }

    function stepHtml() {
      if (step === 0) {
        return '<div class="onboard-hero">' +
            '<div class="big-mark">&lt;/&gt;</div>' +
            '<h2>Let\'s build your plan.</h2>' +
            '<p>Five quick questions. Your answers decide which decks appear, what gets skipped, and how much new material you see each day.</p>' +
          '</div>' +
          '<div class="onboard-steps">' +
            '<div class="onboard-step"><b>1 · Background</b><span>Where you are now, so the tone fits.</span></div>' +
            '<div class="onboard-step"><b>2 · Focus</b><span>Pick only the areas you care about.</span></div>' +
            '<div class="onboard-step"><b>3 · Plan</b><span>A queue and pace built around that.</span></div>' +
          '</div>' +
          '<div class="divider"></div>' +
          '<div class="field"><label>What should I call you?</label>' +
            '<input class="input" id="wizName" placeholder="Optional" maxlength="40" value="' + CR.esc(data.name) + '"></div>' +
          '<p class="hint" style="margin-top:10px">No account, no email, no telemetry. Everything stays on this machine.</p>';
      }

      if (step === 1) {
        return '<div class="wizard-title"><span class="eyebrow">Background</span><h2>Where are you right now?</h2>' +
            '<p>There is no wrong answer. This only changes which decks are suggested and how the tutor talks to you.</p></div>' +
          '<h3 class="wiz-h3">Your situation</h3>' + choiceGrid('background', BACKGROUNDS, data.background) +
          '<h3 class="wiz-h3">How fresh does it feel?</h3>' + choiceGrid('freshness', FRESHNESS, data.freshness);
      }

      if (step === 2) {
        return '<div class="wizard-title"><span class="eyebrow">Goal</span><h2>What are you optimizing for?</h2>' +
            '<p>One primary goal. You can change it later without losing progress.</p></div>' +
          choiceGrid('goal', GOALS, data.goal);
      }

      if (step === 3) {
        const ranking = CR.recommendDecks(data);
        const rec = new Set(ranking.filter(x => x.recommended).map(x => x.id));
        return '<div class="wizard-title"><span class="eyebrow">Focus</span><h2>Pick your areas.</h2>' +
            '<p>Only these decks enter Today, Study and your review queue. Everything else stays in the library, out of your way.</p></div>' +
          '<div class="row wrap" style="margin-bottom:12px">' +
            '<button type="button" class="btn sm ghost" data-rec>Use recommended</button>' +
            '<button type="button" class="btn sm ghost" data-all>Select all</button>' +
            '<button type="button" class="btn sm ghost" data-none>Clear</button>' +
            '<div class="spacer"></div><span class="hint" id="intCount">' + data.interests.length + ' selected</span></div>' +
          '<div class="interest-grid">' + CR.decks.map(d => {
            const on = data.interests.includes(d.id);
            const n = CR.cards.filter(c => c.deck === d.id).length;
            return '<button type="button" class="interest' + (on ? ' active' : '') + '" data-interest="' + d.id + '" style="--deck:' + d.color + '">' +
              '<span class="deck-ico">' + CR.esc(d.icon) + '</span>' +
              '<span class="int-copy"><b>' + CR.esc(d.name) + '</b><span>' + CR.esc(d.desc) + '</span></span>' +
              '<span class="int-meta">' + n + ' cards' + (rec.has(d.id) ? '<em>Recommended</em>' : '') + '</span></button>';
          }).join('') + '</div>' +
          '<p class="hint" style="margin-top:12px">Prefer one language only? Keep JavaScript, Python or Java &amp; C# and drop the rest. The plan is yours.</p>';
      }

      const a = CR.analyseProfile(data);
      const cards = planCards();
      const chosenCount = cards.reduce((n, d) => n + CR.cards.filter(c => c.deck === d.id).length, 0);
      return '<div class="wizard-title"><span class="eyebrow">Your plan</span><h2>' + CR.esc(a.headline) + '</h2></div>' +
        '<div class="analysis-box">' + a.paragraphs.map(p => '<p>' + CR.esc(p) + '</p>').join('') + '</div>' +
        '<h3 class="wiz-h3">Focus order</h3>' +
        '<div class="focus-list">' + cards.map((d, i) =>
          '<div class="focus-row"><span class="focus-n">' + (i + 1) + '</span>' +
            '<span class="deck-ico" style="--deck:' + d.color + '">' + CR.esc(d.icon) + '</span>' +
            '<span class="focus-name">' + CR.esc(d.name) + '</span>' +
            '<span class="hint">' + CR.cards.filter(c => c.deck === d.id).length + ' cards</span></div>').join('') + '</div>' +
        '<h3 class="wiz-h3">Daily pace</h3>' +
        '<div class="pace-grid">' + Object.keys(PACE).map(k => {
          const p = PACE[k];
          return '<button type="button" class="pace' + (data.pace === k ? ' active' : '') + '" data-pace="' + k + '">' +
            '<b>' + p.name + '</b><span>' + p.desc + '</span></button>';
        }).join('') + '</div>' +
        '<div class="plan-summary"><b>' + cards.length + ' areas</b><span>' + chosenCount + ' cards in your plan</span>' +
          '<span>' + (PACE[data.pace] || PACE.steady).newPerDay + ' new cards / day</span></div>' +
        '<label class="check-row"><input type="checkbox" id="wizTour" ' + (showTour ? 'checked' : '') + '> ' +
          '<span>Show me the 60-second tour when this closes</span></label>';
    }

    function navHtml() {
      const left = step === 0
        ? '<button type="button" class="btn ghost" data-skip>Skip for now</button>'
        : (!firstRun && step === 1)
          ? '<button type="button" class="btn ghost" data-cancel>Cancel</button>'
          : '<button type="button" class="btn ghost" data-back>Back</button>';
      return '<div class="wizard-nav">' + left +
        '<span class="hint">' + (step === 0 ? 'About 40 seconds' : 'Step ' + (step + 1) + ' of ' + total) + '</span>' +
        '<button type="button" class="btn primary" data-next ' + (canNext() ? '' : 'disabled') + '>' +
          (step === total - 1 ? 'Start my plan' : 'Continue') + '</button></div>';
    }

    CR.modal({
      title: '', wide: true, body: '<div id="wizBody"></div>',
      onMount: (modal, close) => {
        const body = modal.querySelector('#wizBody');

        function render() {
          const sc = body.scrollTop;
          body.innerHTML =
            '<div class="wizard">' +
              '<div class="wiz-top">' + dots(step, total) + '<span class="hint">' + (step === 0 ? 'Welcome' : 'Setup') + '</span></div>' +
              stepHtml() + navHtml() +
            '</div>';
          body.scrollTop = sc;
          wire();
        }

        function save(skip) {
          if (skip) {
            CR.state.onboarded = true;
            if (!CR.state.profile) CR.state.profile = {};
            CR.state.profile.skippedAt = new Date().toISOString();
            CR.state.name = (data.name || '').trim();
            CR.save(true);
            close();
            CR.route('today');
            CR.refresh();
            CR.toast('You can set up your plan later from Settings.');
            return;
          }
          const pace = PACE[data.pace] || PACE.steady;
          const now = new Date().toISOString();
          CR.state.name = (data.name || '').trim();
          CR.state.profile = {
            background: data.background,
            freshness: data.freshness,
            goal: data.goal,
            pace: data.pace,
            interests: data.interests.slice(),
            completedAt: now,
            updatedAt: now,
            skippedAt: null
          };
          CR.state.onboarded = true;
          // Editing interests should not silently overwrite a custom daily goal.
          if (firstRun || paceChanged || !existing.completedAt) {
            CR.state.settings.dailyGoal = pace.dailyGoal;
            CR.state.settings.newPerDay = pace.newPerDay;
          }
          CR.save(true);
          close();
          CR.route('today');
          CR.refresh();
          CR.toast('Plan saved · ' + data.interests.length + ' areas · ' + pace.newPerDay + ' new cards/day');
          if (showTour) setTimeout(() => CR.startTour(), 450);
        }

        function next() {
          if (!canNext()) return;
          if (step === total - 1) { save(false); return; }
          step++;
          if (step === 3 && !data.interests.length) {
            const rec = CR.recommendDecks(data).filter(x => x.recommended).map(x => x.id);
            data.interests = rec;
          }
          render();
        }

        function wire() {
          const name = body.querySelector('#wizName');
          if (name) name.addEventListener('input', () => { data.name = name.value; });
          body.querySelectorAll('[data-choice]').forEach(btn => btn.addEventListener('click', () => {
            const group = btn.closest('[data-group]').dataset.group;
            data[group] = btn.dataset.choice;
            if (group === 'freshness' && !paceTouched) data.pace = CR.defaultPace(data.freshness);
            render();
          }));
          body.querySelectorAll('[data-interest]').forEach(btn => btn.addEventListener('click', () => {
            const id = btn.dataset.interest;
            if (data.interests.includes(id)) data.interests = data.interests.filter(x => x !== id);
            else data.interests.push(id);
            const sc = body.scrollTop;
            render();
            body.scrollTop = sc;
          }));
          const recBtn = body.querySelector('[data-rec]');
          if (recBtn) recBtn.addEventListener('click', () => {
            data.interests = CR.recommendDecks(data).filter(x => x.recommended).map(x => x.id);
            render();
          });
          const allBtn = body.querySelector('[data-all]');
          if (allBtn) allBtn.addEventListener('click', () => {
            data.interests = CR.decks.map(d => d.id);
            render();
          });
          const noneBtn = body.querySelector('[data-none]');
          if (noneBtn) noneBtn.addEventListener('click', () => {
            data.interests = [];
            render();
          });
          const tourBox = body.querySelector('#wizTour');
          if (tourBox) tourBox.addEventListener('change', () => { showTour = tourBox.checked; });
          body.querySelectorAll('[data-pace]').forEach(btn => btn.addEventListener('click', () => {
            data.pace = btn.dataset.pace;
            paceTouched = true;
            paceChanged = true;
            render();
          }));
          const nextBtn = body.querySelector('[data-next]');
          if (nextBtn) nextBtn.addEventListener('click', next);
          const backBtn = body.querySelector('[data-back]');
          if (backBtn) backBtn.addEventListener('click', () => { if (step > 0) { step--; render(); } });
          const skipBtn = body.querySelector('[data-skip]');
          if (skipBtn) skipBtn.addEventListener('click', () => save(true));
          const cancelBtn = body.querySelector('[data-cancel]');
          if (cancelBtn) cancelBtn.addEventListener('click', () => close());
        }

        render();
        setTimeout(() => { const n = body.querySelector('#wizName'); if (n) n.focus(); }, 60);
      }
    });
  };

  /* ---------------- guided tour ---------------- */
  CR.startTour = function () {
    if (CR.tourActive) return;
    if (CR.activeSession && CR.exitSession) CR.exitSession();
    if (CR.currentPage && CR.currentPage() !== 'today') CR.route('today');

    const steps = [
      { sel: '.plan-strip', title: 'This is your plan', text: 'Only the areas you chose appear here and in your review queue. Change them anytime with Edit plan.' },
      { sel: '[data-start-all]', title: 'Start a session', text: 'One tap mixes due reviews with a few new cards. Grade honestly — the schedule adapts to you.' },
      { sel: '[data-page="study"]', title: 'Build your own', text: 'Pick one deck, focus on weak spots, or cram without touching your schedule.' },
      { sel: '[data-page="library"]', title: 'Search everything', text: 'Your plan is the default scope, but the whole library is still searchable. Built-in cards are read-only.' },
      { sel: '[data-page="stats"]', title: 'Evidence, not vibes', text: 'Accuracy, maturity and weak topics. Use it to decide what to study next, not to chase a score.' },
      { sel: '[data-page="ai"]', title: 'A free tutor', text: 'Explain a card, generate new cards, or get quizzed. No key needed; the rest of the app works offline.' },
      { sel: '[data-page="settings"]', title: 'Tune it', text: 'Change your plan, daily goal, AI provider and backups. Take this tour again whenever you want.' }
    ];

    CR.tourActive = true;
    let index = 0;
    const root = document.createElement('div');
    root.className = 'tour';
    root.innerHTML = '<div class="tour-hole"></div><div class="tour-card" role="dialog" aria-modal="true"></div>';
    document.body.appendChild(root);
    const hole = root.querySelector('.tour-hole');
    const card = root.querySelector('.tour-card');

    function closeTour() {
      CR.tourActive = false;
      document.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', place);
      root.remove();
    }

    function place() {
      const step = steps[index];
      if (!step) { closeTour(); return; }
      const el = document.querySelector(step.sel);
      if (!el) { index++; place(); return; }
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      setTimeout(() => {
        const r = el.getBoundingClientRect();
        hole.style.left = Math.max(4, r.left - 6) + 'px';
        hole.style.top = Math.max(4, r.top - 6) + 'px';
        hole.style.width = Math.min(window.innerWidth - 8, r.width + 12) + 'px';
        hole.style.height = Math.min(window.innerHeight - 8, r.height + 12) + 'px';

        card.innerHTML =
          '<div class="tour-kicker">Tour · ' + (index + 1) + ' / ' + steps.length + '</div>' +
          '<h3>' + CR.esc(step.title) + '</h3>' +
          '<p>' + CR.esc(step.text) + '</p>' +
          '<div class="tour-actions">' +
            '<button type="button" class="btn ghost sm" data-tour-skip>Skip</button>' +
            '<div class="spacer"></div>' +
            (index > 0 ? '<button type="button" class="btn ghost sm" data-tour-back>Back</button>' : '') +
            '<button type="button" class="btn primary sm" data-tour-next>' + (index === steps.length - 1 ? 'Done' : 'Next') + '</button>' +
          '</div>';

        const cw = card.offsetWidth || 320;
        const ch = card.offsetHeight || 180;
        const gap = 14, pad = 14;
        let x, y;
        const roomRight = window.innerWidth - r.right - gap - pad;
        const roomLeft = r.left - gap - pad;
        const roomBelow = window.innerHeight - r.bottom - gap - pad;
        const roomAbove = r.top - gap - pad;
        if (roomRight >= cw) {
          x = r.right + gap; y = r.top;
        } else if (roomLeft >= cw) {
          x = r.left - cw - gap; y = r.top;
        } else if (roomBelow >= ch) {
          x = r.left; y = r.bottom + gap;
        } else if (roomAbove >= ch) {
          x = r.left; y = r.top - ch - gap;
        } else {
          x = pad; y = window.innerHeight - ch - pad;
        }
        x = Math.max(pad, Math.min(window.innerWidth - cw - pad, x));
        y = Math.max(pad, Math.min(window.innerHeight - ch - pad, y));
        card.style.left = x + 'px';
        card.style.top = y + 'px';

        card.querySelector('[data-tour-skip]').onclick = closeTour;
        const nb = card.querySelector('[data-tour-next]');
        if (nb) nb.onclick = () => { index++; if (index >= steps.length) closeTour(); else place(); };
        const bb = card.querySelector('[data-tour-back]');
        if (bb) bb.onclick = () => { if (index > 0) { index--; place(); } };
      }, 170);
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeTour(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); index++; if (index >= steps.length) closeTour(); else place(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); if (index > 0) { index--; place(); } }
    }

    document.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', place);
    place();
  };
})();
