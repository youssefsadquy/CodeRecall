/* CodeRecall — progress analytics */
(function () {
  'use strict';
  const CR = window.CR;

  function totalReviews() {
    return Object.values(CR.state.days).reduce((a, d) => a + (d.reviews || 0), 0);
  }
  function totalSeconds() {
    return Object.values(CR.state.days).reduce((a, d) => a + (d.secs || 0), 0);
  }
  function accuracyFor(filterDeck) {
    let right = 0, all = 0;
    (filterDeck ? CR.cards.filter(c => c.deck === filterDeck) : CR.activeCards()).forEach(c => {
      const st = CR.state.cards[c.id];
      if (!st) return;
      right += st.correct || 0;
      all += (st.correct || 0) + (st.wrong || 0);
    });
    return all ? Math.round(right / all * 100) : null;
  }
  function fmtTime(sec) {
    if (sec < 60) return sec + 's';
    const m = Math.round(sec / 60);
    if (m < 60) return m + 'm';
    const h = Math.floor(m / 60);
    return h + 'h ' + (m % 60) + 'm';
  }

  function last14Html() {
    const arr = [];
    for (let i = 13; i >= 0; i--) {
      const d = CR.addDays(new Date(), -i);
      const k = CR.dateKey(d);
      const day = CR.state.days[k];
      arr.push({ d, count: day ? day.reviews : 0 });
    }
    const max = Math.max(1, ...arr.map(x => x.count));
    return '<div class="bars" style="height:96px">' + arr.map(x =>
      '<div class="bar-col' + (x.count === 0 ? ' dim' : '') + '">' +
        '<b>' + (x.count || '') + '</b>' +
        '<div class="bv" style="height:' + Math.max(2, Math.round(x.count / max * 100)) + '%"></div>' +
        '<span>' + x.d.getDate() + '</span></div>').join('') + '</div>';
  }

  function maturityHtml() {
    const s = CR.stats();
    const total = CR.activeCards().length || 1;
    const parts = [
      { label: 'Mature', n: s.mature, color: 'var(--mint)' },
      { label: 'Young', n: s.young, color: 'var(--violet)' },
      { label: 'Learning', n: s.learning, color: 'var(--amber)' },
      { label: 'New', n: s.newCards, color: 'rgba(255,255,255,.18)' }
    ];
    const deg = parts.map(p => p.n / total * 360);
    let acc = 0;
    const stops = parts.map((p, i) => {
      const from = acc; acc += deg[i];
      return p.color + ' ' + from + 'deg ' + acc + 'deg';
    }).join(', ');
    return '<div style="display:flex;gap:18px;align-items:center">' +
      '<div style="width:112px;height:112px;border-radius:50%;background:conic-gradient(' + stops + ');position:relative;flex:0 0 112px">' +
        '<div style="position:absolute;inset:14px;border-radius:50%;background:#0f1420;display:grid;place-items:center;text-align:center">' +
          '<div><div style="font-size:22px;font-weight:650;letter-spacing:-.03em">' + s.mastery + '%</div>' +
          '<div class="hint" style="font-size:10px">mastered</div></div></div></div>' +
      '<div class="stack" style="gap:8px;flex:1">' + parts.map(p =>
        '<div class="row between" style="font-size:11.5px"><span class="row" style="gap:7px"><i style="width:7px;height:7px;border-radius:2px;background:' + p.color + '"></i>' + p.label + '</span>' +
        '<span class="muted">' + p.n + '</span></div>').join('') + '</div></div>';
  }

  CR.pages.stats = function () {
    const s = CR.stats();
    const reviews = totalReviews();
    const secs = totalSeconds();
    const weak = CR.weakTopics(6);

    const deckAcc = CR.decks.filter(d => CR.isDeckActive(d.id)).map(d => {
      const a = accuracyFor(d.id);
      const ds = CR.deckStats(d.id);
      return { d, a, ds };
    }).sort((x, y) => (y.a || 0) - (x.a || 0));

    const weakest = CR.activeCards().filter(c => {
      const st = CR.state.cards[c.id];
      return st && st.reps > 0 && (st.lapses > 0 || st.lastGrade <= 1);
    }).sort((a, b) => {
      const A = CR.state.cards[a.id], B = CR.state.cards[b.id];
      return (B.lapses * 3 + (B.lastGrade === 0 ? 2 : 0) + (3 - B.ease)) -
             (A.lapses * 3 + (A.lastGrade === 0 ? 2 : 0) + (3 - A.ease));
    }).slice(0, 8);

    CR.qs('#main').innerHTML =
      '<div class="page">' +
        '<div class="page-head"><div class="grow"><div class="eyebrow">Progress</div><h1>The evidence.</h1>' +
          '<div class="sub">Numbers you can act on across your ' + CR.planStats().decks + ' plan areas — what is sticking, what is slipping, and what is coming next.</div></div>' +
          '<button class="btn ghost" data-edit-plan>Edit plan</button></div>' +

        '<div class="stat-grid">' +
          '<div class="stat mint"><div class="st-glow"></div><div class="st-label">Reviews</div><div class="st-value">' + CR.fmtNum(reviews) + '</div><div class="st-sub">all time</div></div>' +
          '<div class="stat violet"><div class="st-glow"></div><div class="st-label">Accuracy</div><div class="st-value">' + (s.retention == null ? '—' : s.retention + '<small>%</small>') + '</div><div class="st-sub">last 30 days</div></div>' +
          '<div class="stat amber"><div class="st-glow"></div><div class="st-label">Time invested</div><div class="st-value">' + fmtTime(secs) + '</div><div class="st-sub">focused recall</div></div>' +
          '<div class="stat blue"><div class="st-glow"></div><div class="st-label">Cards mature</div><div class="st-value">' + s.mature + '<small>/' + CR.activeCards().length + '</small></div><div class="st-sub">21+ day intervals</div></div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:14px;align-items:start;margin-bottom:14px">' +
          '<div class="panel"><div class="panel-h"><h2>Activity</h2><div class="spacer"></div><span class="hint">last 14 days</span></div>' +
            last14Html() + '<div class="divider"></div>' + CR.renderHeatmap(16) + '</div>' +
          '<div class="panel"><div class="panel-h"><h2>Card maturity</h2></div>' + maturityHtml() +
            '<div class="divider"></div>' +
            '<div class="panel-h" style="margin-bottom:6px"><h3>Scheduled ahead</h3></div>' +
            '<div class="bars" style="height:88px">' + CR.forecast(7).map((x, i) => {
              const max = Math.max(1, ...CR.forecast(7).map(y => y.count));
              return '<div class="bar-col' + (x.count === 0 ? ' dim' : '') + '">' +
                '<b>' + (x.count || '') + '</b><div class="bv" style="height:' + Math.max(2, x.count / max * 100) + '%"></div>' +
                '<span>' + (i === 0 ? 'Now' : CR.weekday(x.date)) + '</span></div>';
            }).join('') + '</div>' +
          '</div>' +
        '</div>' +

        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start">' +
          '<div class="panel"><div class="panel-h"><h2>Accuracy by deck</h2><div class="spacer"></div><span class="hint">graded answers</span></div>' +
            '<div class="stack" style="gap:9px">' + deckAcc.map(x =>
              '<div class="mastery-row"><span class="mr-name">' + CR.esc(x.d.name) + '</span>' +
              '<div class="bar"><i style="width:' + (x.a == null ? 0 : x.a) + '%;background:' + x.d.color + '"></i></div>' +
              '<span class="mr-pct">' + (x.a == null ? '—' : x.a + '%') + '</span></div>').join('') + '</div>' +
            '<p class="hint" style="margin-top:12px">Overall accuracy: <b class="mint">' + (accuracyFor(null) == null ? '—' : accuracyFor(null) + '%') + '</b>. Below 70% usually means the card is too big — split it.</p>' +
          '</div>' +
          '<div class="panel"><div class="panel-h"><h2>Needs attention</h2><div class="spacer"></div><span class="hint">failed or hard</span></div>' +
            (weakest.length ? '<div class="list">' + weakest.map(c => {
              const d = CR.deckOf(c);
              return '<div class="list-row" data-card="' + CR.esc(c.id) + '"><div class="lr-main">' +
                '<div class="lr-title">' + CR.esc(c.q) + '</div>' +
                '<div class="lr-sub"><span style="color:' + d.color + '">' + CR.esc(d.short) + '</span> ' + CR.esc(c.topic) +
                ' · ' + (CR.state.cards[c.id].lapses || 0) + ' lapses</div></div></div>';
            }).join('') + '</div>' : '<div class="empty" style="padding:24px"><div class="em-ico">✓</div><b>Nothing flagged</b><span>Keep grading honestly and this fills up.</span></div>') +
          '</div>' +
        '</div>' +
      '</div>';

    CR.qsa('#main [data-card]').forEach(el => el.addEventListener('click', () => CR.showCard(el.dataset.card)));
    CR.qsa('#main [data-edit-plan]').forEach(el => el.addEventListener('click', () => CR.openProfileWizard({ edit: true })));
  };
})();
