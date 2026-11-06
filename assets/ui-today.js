/* CodeRecall — Today dashboard */
(function () {
  'use strict';
  const CR = window.CR;

  CR.renderHeatmap = function (weeks) {
    const hm = CR.heatmap(weeks || 16);
    let cells = '';
    hm.cells.forEach(c => {
      if (!c) { cells += '<i></i>'; return; }
      const n = c.count;
      const lvl = n === 0 ? '' : n < 6 ? 'l1' : n < 15 ? 'l2' : n < 30 ? 'l3' : 'l4';
      cells += '<i class="' + lvl + (c.today ? ' today' : '') + '" title="' + c.key + ' · ' + n + ' reviews"></i>';
    });
    return '<div class="heat-wrap"><div class="heat-days"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span>Sun</span></div>' +
      '<div class="heat">' + cells + '</div></div>' +
      '<div class="heat-legend"><span>Less</span><i style="background:rgba(255,255,255,.045)"></i>' +
      '<i style="background:rgba(124,242,192,.18)"></i><i style="background:rgba(124,242,192,.36)"></i>' +
      '<i style="background:rgba(124,242,192,.6)"></i><i style="background:rgba(124,242,192,.88)"></i><span>More</span></div>';
  };

  function deckCard(d) {
    const st = CR.deckStats(d.id);
    const dueTotal = st.due + Math.min(st.news, CR.stats().newRemaining);
    return '<div class="deck-card" data-deck="' + d.id + '" style="--deck:' + d.color + '">' +
      '<div class="deck-top">' +
        '<div class="deck-ico">' + CR.esc(d.icon) + '</div>' +
        '<div class="grow"><div class="deck-name">' + CR.esc(d.name) + '</div>' +
        '<div class="deck-desc">' + CR.esc(d.desc) + '</div></div>' +
        (dueTotal > 0 ? '<span class="pill mint">' + dueTotal + ' ready</span>' : '<span class="pill">clear</span>') +
      '</div>' +
      '<div class="deck-foot">' +
        '<span class="deck-meta"><b>' + st.total + '</b> cards</span>' +
        '<div class="bar"><i style="width:' + st.mastery + '%"></i></div>' +
        '<span class="deck-meta"><b>' + st.mastery + '%</b></span>' +
      '</div>' +
    '</div>';
  }

  function forecastHtml() {
    const f = CR.forecast(7);
    const max = Math.max(1, ...f.map(x => x.count));
    return '<div class="bars">' + f.map((x, i) => {
      const h = Math.max(2, Math.round((x.count / max) * 100));
      const label = i === 0 ? 'Today' : CR.weekday(x.date);
      return '<div class="bar-col' + (x.count === 0 ? ' dim' : '') + '">' +
        '<b>' + (x.count || '') + '</b>' +
        '<div class="bv" style="height:' + h + '%"></div>' +
        '<span>' + label + '</span></div>';
    }).join('') + '</div>';
  }

  function weakHtml() {
    const weak = CR.weakTopics(3);
    if (!weak.length) {
      return '<div class="empty" style="padding:22px 8px"><div class="em-ico">✦</div><b>No weak spots yet</b>' +
        '<span>Grade a few cards and CodeRecall will find the topics that slip.</span></div>';
    }
    return '<div class="list">' + weak.map(w => {
      const d = CR.deckById[w.deck] || {};
      return '<div class="list-row" data-weak="' + CR.esc(w.deck) + '" data-topic="' + CR.esc(w.topic) + '" style="cursor:pointer">' +
        '<div class="deck-ico" style="--deck:' + (d.color || '#7cf2c0') + ';width:26px;height:26px;font-size:9.5px">' + CR.esc(d.icon || '?') + '</div>' +
        '<div class="lr-main"><div class="lr-title">' + CR.esc(w.topic) + '</div>' +
        '<div class="lr-sub">' + CR.esc(d.name || w.deck) + ' · ' + w.cards.length + ' cards</div></div>' +
        '<span class="btn sm ghost">Drill</span></div>';
    }).join('') + '</div>';
  }

  function planStripHtml() {
    const p = CR.state.profile || {};
    const ps = CR.planStats();
    const labels = CR.PROFILE_LABELS;
    const goal = (labels.goal[p.goal] || 'your own focus');
    const bg = (labels.background[p.background] || 'not set yet');
    const active = CR.activeDeckIds();
    return '<div class="plan-strip">' +
      '<div class="ps-copy"><span class="eyebrow">Your plan</span>' +
        '<b>' + CR.esc(goal.charAt(0).toUpperCase() + goal.slice(1)) + '</b>' +
        '<span>' + CR.esc(bg) + ' · ' + ps.decks + ' areas · ' + ps.cards + ' cards</span></div>' +
      '<div class="plan-chips">' + active.map(id => {
        const d = CR.deckById[id];
        return d ? '<span class="plan-chip" style="--deck:' + d.color + '"><i></i>' + CR.esc(d.short) + '</span>' : '';
      }).join('') + '</div>' +
      '<button class="btn sm ghost" data-edit-plan>Edit plan</button>' +
    '</div>';
  }

  CR.pages.today = function () {
    const s = CR.stats();
    const name = (CR.state.name || '').trim();
    const first = name ? name.split(/\s+/)[0] : '';
    const dateStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const plan = s.due + Math.min(s.newRemaining, s.newCards);
    const target = Math.min(plan, 60);

    const html =
      '<div class="page">' +
        '<div class="page-head">' +
          '<div class="grow">' +
            '<div class="eyebrow">' + CR.esc(dateStr) + '</div>' +
            '<h1>' + CR.greeting() + (first ? ', ' + CR.esc(first) : '') + '.</h1>' +
            '<div class="sub">' + (plan > 0
              ? '<b class="mint">' + plan + ' cards ready</b> · about ' + Math.max(3, Math.round(target * 0.35)) + ' minutes if you start now.'
              : 'Nothing is due. Do a short cram, or add cards from your own revision.') + '</div>' +
          '</div>' +
          '<div class="row" style="gap:8px;margin-top:4px">' +
            '<button class="btn ghost" data-go="library">Browse library</button>' +
            '<button class="btn primary lg" data-start-all ' + (plan === 0 ? 'data-cram="1"' : '') + '>' +
              '<svg viewBox="0 0 24 24"><path d="M5 3l14 9-14 9z"/></svg>' +
              (plan > 0 ? 'Start session' : 'Start a cram') +
            '</button>' +
          '</div>' +
        '</div>' +

        '<div class="stat-grid">' +
          '<div class="stat mint"><div class="st-glow"></div><div class="st-label">Due now</div>' +
            '<div class="st-value">' + s.due + '<small>cards</small></div>' +
            '<div class="st-sub">' + s.newCards + ' new in your plan</div></div>' +
          '<div class="stat amber"><div class="st-glow"></div><div class="st-label">Streak</div>' +
            '<div class="st-value">' + s.streak + '<small>days</small></div>' +
            '<div class="st-sub">' + (s.reviewedToday ? s.reviewedToday + ' reviewed today' : 'Review one card to start') + '</div></div>' +
          '<div class="stat violet"><div class="st-glow"></div><div class="st-label">Retention · 30d</div>' +
            '<div class="st-value">' + (s.retention == null ? '—' : s.retention + '<small>%</small>') + '</div>' +
            '<div class="st-sub">' + (s.retention == null ? 'Needs a few reviews' : 'Share of Good / Easy answers') + '</div></div>' +
          '<div class="stat blue"><div class="st-glow"></div><div class="st-label">Mastered</div>' +
            '<div class="st-value">' + s.mastery + '<small>%</small></div>' +
            '<div class="st-sub">' + s.mature + ' mature · ' + s.young + ' young</div></div>' +
        '</div>' +

        planStripHtml() +
        '<div class="panel" style="margin-bottom:16px">' +
          '<div class="panel-h"><h2>Your decks</h2><div class="spacer"></div>' +
            '<span class="hint">' + CR.planStats().cards + ' cards in your plan</span></div>' +
          '<div class="deck-grid">' + CR.activeDeckIds().map(id => deckCard(CR.deckById[id])).join('') + '</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1.45fr 1fr;gap:14px;align-items:start">' +
          '<div class="panel"><div class="panel-h"><h2>Consistency</h2><div class="spacer"></div>' +
            '<span class="hint">Last 16 weeks</span></div>' +
            CR.renderHeatmap(16) +
            '<div class="divider"></div>' +
            '<div class="panel-h" style="margin-bottom:8px"><h3>Next 7 days</h3><div class="spacer"></div><span class="hint">cards scheduled</span></div>' +
            forecastHtml() +
          '</div>' +
          '<div class="panel"><div class="panel-h"><h2>Weak spots</h2><div class="spacer"></div>' +
            '<span class="hint">drill these</span></div>' + weakHtml() + '</div>' +
        '</div>' +
      '</div>';

    const main = CR.qs('#main');
    main.innerHTML = html;

    main.querySelector('[data-start-all]').addEventListener('click', () => {
      const cram = plan === 0;
      CR.startSession({ deckIds: [], mode: cram ? 'cram' : 'mix' });
    });
    main.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => CR.route(b.dataset.go)));
    main.querySelectorAll('[data-edit-plan]').forEach(b => b.addEventListener('click', () => CR.openProfileWizard({ edit: true })));
    main.querySelectorAll('.deck-card').forEach(el => {
      el.addEventListener('click', () => {
        CR.startSession({ deckIds: [el.dataset.deck], mode: 'mix' });
      });
    });
    main.querySelectorAll('[data-weak]').forEach(el => {
      el.addEventListener('click', () => {
        CR.startSession({ deckIds: [el.dataset.weak], topic: el.dataset.topic, mode: 'weak' });
      });
    });
  };
})();
