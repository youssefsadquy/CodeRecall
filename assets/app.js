/* CodeRecall shell: routing, chrome, onboarding, shortcuts. */
(function () {
  'use strict';
  const CR = window.CR;
  CR.pages = CR.pages || {};

  let currentPage = 'today';

  /* ---------------- chrome ---------------- */
  function refreshBadges() {
    const s = CR.stats();
    const studyBadge = s.due + Math.min(s.newRemaining, s.newCards);
    const badge = document.querySelector('[data-badge="study"]');
    if (badge) badge.textContent = studyBadge > 0 ? studyBadge : '';
    const todayBadge = document.querySelector('[data-badge="today"]');
    if (todayBadge) todayBadge.textContent = s.due > 0 ? s.due : '';

    const side = CR.qs('#sideProgress');
    if (side) {
      const pct = s.goalPct;
      const ring = 'conic-gradient(var(--mint) ' + (pct * 3.6) + 'deg, rgba(255,255,255,.08) 0deg)';
      side.innerHTML =
        '<div class="sc-top"><span class="sc-label">Daily goal</span><span class="sc-value">' + s.reviewedToday + '/' + s.goal + '</span></div>' +
        '<div class="goal-line">' +
          '<div class="goal-ring" style="background:' + ring + '"><b>' + pct + '%</b></div>' +
          '<div class="goal-copy"><strong>' + (s.streak > 0 ? s.streak + ' day streak' : 'Start a streak') + '</strong>' +
          '<span>' + (s.due > 0 ? s.due + ' cards due' : 'All caught up') + '</span></div>' +
        '</div>';
    }

    const dot = CR.qs('#aiDot');
    const label = CR.qs('#aiStatus');
    if (dot && label) {
      const p = (CR.state.settings.ai || {}).provider || 'free';
      dot.className = 'dot' + (p === 'offline' ? ' off' : (p !== 'free' && !CR.state.settings.ai.key ? ' warn' : ''));
      label.textContent = CR.aiLabel();
    }
  }
  CR.refreshChrome = refreshBadges;

  CR.setTitleMid = function (text) {
    const el = CR.qs('#titleMid');
    if (el) el.innerHTML = text || '';
  };

  CR.route = function (page, opts) {
    currentPage = page;
    CR.closeModal();
    CR.qsa('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.page === page));
    const main = CR.qs('#main');
    main.scrollTop = 0;
    CR.setTitleMid('');
    const fn = CR.pages[page] || CR.pages.today;
    fn(opts || {});
    refreshBadges();
  };

  CR.currentPage = () => currentPage;
  CR.refresh = function () { refreshBadges(); };

  /* ---------------- window chrome ---------------- */
  function wireWindow() {
    CR.qsa('[data-win]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        CR.call('win.' + btn.dataset.win).catch(() => {});
      });
    });

    const bar = CR.qs('#titlebar');
    bar.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('button, input, a, .no-drag')) return;
      CR.call('win.drag').catch(() => {});
    });

    window.__winState = function (state) {
      document.body.classList.toggle('maximized', state === 'max');
    };
  }

  /* ---------------- keyboard ---------------- */
  function shortcutsHtml() {
    const rows = [
      ['Space', 'Reveal the answer'],
      ['1 / 2 / 3 / 4', 'Again · Hard · Good · Easy'],
      ['H', 'Show a hint'],
      ['B', 'Bookmark the card'],
      ['E', 'Edit the current card'],
      ['Ctrl + K', 'Search the library'],
      ['Ctrl + 1…6', 'Jump between pages'],
      ['Esc', 'Close dialog / end session'],
      ['?', 'This help']
    ];
    return '<div class="list">' + rows.map(r =>
      '<div class="row between" style="padding:7px 2px;border-bottom:1px solid var(--line)">' +
      '<span class="muted" style="font-size:12.5px">' + CR.esc(r[1]) + '</span>' +
      '<span class="kbd" style="min-width:auto;padding:0 8px">' + CR.esc(r[0]) + '</span></div>').join('') +
      '</div><p class="hint" style="margin-top:12px">Tip: answer out loud before revealing. Producing the answer is what builds memory — re-reading is not.</p>';
  }

  CR.showShortcuts = function () {
    CR.modal({
      title: 'Keyboard shortcuts',
      sub: 'Everything important is one key away.',
      narrow: true,
      body: shortcutsHtml(),
      foot: '<button class="btn ghost" data-tour>Take the tour</button><button class="btn primary" data-ok>Got it</button>',
      onMount: (modal, close) => {
        modal.querySelector('[data-ok]').onclick = close;
        modal.querySelector('[data-tour]').onclick = () => { close(); setTimeout(() => CR.startTour(), 120); };
      }
    });
  };

  document.addEventListener('keydown', (e) => {
    if (CR.tourActive) return;
    if (e.key === 'Escape') {
      if (CR.isModalOpen()) { e.preventDefault(); CR.closeModal(); return; }
      if (CR.activeSession && CR.exitSession) { e.preventDefault(); CR.exitSession(); return; }
    }
    if (CR.isModalOpen()) return;
    if (CR.isTyping(e)) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); goSearch();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault(); goSearch(); return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
      e.preventDefault();
      const pages = ['today', 'study', 'library', 'stats', 'ai', 'settings'];
      CR.route(pages[Number(e.key) - 1]);
      return;
    }
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault(); CR.showShortcuts(); return;
    }
    if (CR.activeSession && CR.studyKey) {
      if (CR.studyKey(e)) e.preventDefault();
    }
  });

  function goSearch() {
    CR.route('library', { focusSearch: true });
  }

  /* ---------------- onboarding ---------------- */
  function showOnboarding() {
    if (CR.openProfileWizard) CR.openProfileWizard({ firstRun: true });
  }

  /* ---------------- boot ---------------- */
  async function boot() {
    wireWindow();
    CR.qsa('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => CR.route(btn.dataset.page));
    });

    try {
      await CR.loadState();
    } catch (e) {
      console.error(e);
      CR.toast('Could not load saved progress. Starting fresh.', 'err');
    }

    document.querySelectorAll('a[data-action="shortcuts"]').forEach(() => {});
    const links = CR.qsa('[data-action="shortcuts"]');
    links.forEach(a => a.addEventListener('click', CR.showShortcuts));

    CR.route('today');
    const p = CR.state.profile || {};
    if (!CR.state.onboarded || (!p.completedAt && !p.skippedAt)) showOnboarding();
    refreshBadges();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
