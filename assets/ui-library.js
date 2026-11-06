/* CodeRecall — library, card viewer, editor */
(function () {
  'use strict';
  const CR = window.CR;

  let query = '';
  let deckFilter = '';
  let statusFilter = 'all';

  function counts() {
    const s = CR.state;
    const cards = CR.activeCards();
    return {
      total: cards.length,
      allTotal: CR.cards.length,
      due: cards.filter(c => { const st = s.cards[c.id]; return st && !st.suspended && st.reps > 0 && st.due <= Date.now(); }).length,
      news: cards.filter(c => { const st = s.cards[c.id]; return st && !st.suspended && st.reps === 0; }).length,
      flagged: cards.filter(c => { const st = s.cards[c.id]; return st && st.bookmarked; }).length
    };
  }

  function statusOptions() {
    return [
      ['all', 'All cards'], ['due', 'Due now'], ['new', 'New'], ['learning', 'Learning'],
      ['mature', 'Mature'], ['flagged', 'Bookmarked'], ['suspended', 'Suspended']
    ].map(o => '<option value="' + o[0] + '"' + (statusFilter === o[0] ? ' selected' : '') + '>' + o[1] + '</option>').join('');
  }

  function deckOptions() {
    const active = CR.decks.filter(d => CR.isDeckActive(d.id));
    const hidden = CR.decks.filter(d => !CR.isDeckActive(d.id));
    let html = '<option value="">My plan · ' + active.length + ' decks</option>';
    html += active.map(d =>
      '<option value="' + d.id + '"' + (deckFilter === d.id ? ' selected' : '') + '>' + CR.esc(d.name) + '</option>').join('');
    html += '<option value="__all"' + (deckFilter === '__all' ? ' selected' : '') + '>All decks · ' + CR.cards.length + ' cards</option>';
    if (hidden.length) {
      html += '<optgroup label="Outside your plan">' + hidden.map(d =>
        '<option value="' + d.id + '"' + (deckFilter === d.id ? ' selected' : '') + '>' + CR.esc(d.name) + '</option>').join('') + '</optgroup>';
    }
    return html;
  }

  function rowsHtml() {
    const list = CR.searchCards(query, deckFilter, statusFilter);
    if (!list.length) {
      return '<div class="empty"><div class="em-ico">∅</div><b>Nothing matches</b><span>Try a different search, deck or status.</span></div>';
    }
    return '<div class="list">' + list.slice(0, 400).map(c => {
      const d = CR.deckOf(c);
      const st = CR.state.cards[c.id] || CR.newCardState();
      const stt = CR.cardStatus(c.id);
      const dueTxt = st.reps === 0 ? 'new' : (st.due <= Date.now() ? 'due now' : 'due ' + CR.dueLabel(st.due));
      return '<div class="list-row" data-card="' + CR.esc(c.id) + '">' +
        '<span class="pill" style="color:' + d.color + ';border-color:color-mix(in srgb,' + d.color + ' 25%, transparent)">' + CR.esc(d.short) + '</span>' +
        '<div class="lr-main"><div class="lr-title">' + CR.esc(c.q) + '</div>' +
          '<div class="lr-sub"><span>' + CR.esc(c.topic) + '</span>' +
            (c.custom ? '<span class="pill violet">Yours</span>' : '') +
            (st.bookmarked ? '<span class="pill amber">Flagged</span>' : '') +
          '</div></div>' +
        '<div class="right"><div class="pill ' + stt.cls + '">' + stt.label + '</div>' +
          '<div class="hint" style="margin-top:4px">' + CR.esc(dueTxt) + '</div></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  CR.pages.library = function (opts) {
    const c = counts();
    CR.qs('#main').innerHTML =
      '<div class="page">' +
        '<div class="page-head">' +
          '<div class="grow"><div class="eyebrow">Library</div><h1>Every card, searchable.</h1>' +
            '<div class="sub">' + c.total + ' cards in your plan · <b class="mint">' + c.due + ' due</b> · ' + c.news + ' new · ' + c.flagged + ' bookmarked' +
            (c.allTotal > c.total ? ' · ' + (c.allTotal - c.total) + ' outside your plan' : '') + '</div></div>' +
          '<div class="row" style="gap:8px">' +
            '<button class="btn ghost" data-edit-plan>Edit plan</button>' +
            '<button class="btn primary" data-add><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg> Add card</button>' +
          '</div>' +
        '</div>' +
        '<div class="toolbar">' +
          '<div class="search"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
            '<input id="libSearch" placeholder="Search questions, topics, code…" value="' + CR.esc(query) + '"></div>' +
          '<select class="input" id="libDeck" style="height:37px">' + deckOptions() + '</select>' +
          '<select class="input" id="libStatus" style="height:37px">' + statusOptions() + '</select>' +
        '</div>' +
        '<div id="libList">' + rowsHtml() + '</div>' +
        '<p class="hint" style="margin-top:14px">Click a card to inspect it. Built-in cards are read-only — duplicating one creates your own editable copy.</p>' +
      '</div>';

    const main = CR.qs('#main');
    const search = CR.qs('#libSearch');
    const list = CR.qs('#libList');

    function refreshList() { list.innerHTML = rowsHtml(); wireRows(); }
    function wireRows() {
      list.querySelectorAll('[data-card]').forEach(el => el.addEventListener('click', () => CR.showCard(el.dataset.card)));
    }
    search.addEventListener('input', () => { query = search.value; refreshList(); });
    CR.qs('#libDeck').addEventListener('change', (e) => { deckFilter = e.target.value; refreshList(); });
    CR.qs('#libStatus').addEventListener('change', (e) => { statusFilter = e.target.value; refreshList(); });
    main.querySelector('[data-add]').addEventListener('click', () => CR.openCardEditor(null, deckFilter === '__all' ? '' : deckFilter));
    main.querySelectorAll('[data-edit-plan]').forEach(b => b.addEventListener('click', () => CR.openProfileWizard({ edit: true })));
    wireRows();

    if (opts && opts.focusSearch) setTimeout(() => { search.focus(); search.select(); }, 30);
  };

  /* ---------------- card detail ---------------- */
  CR.showCard = function (id) {
    const card = CR.cardById[id];
    if (!card) return;
    const d = CR.deckOf(card);
    const st = CR.state.cards[id] || CR.newCardState();
    const stt = CR.cardStatus(id);
    const mcq = card.type === 'mcq' && Array.isArray(card.choices);

    const body =
      '<div class="row" style="margin-bottom:12px;gap:7px">' +
        '<span class="pill" style="color:' + d.color + ';border-color:color-mix(in srgb,' + d.color + ' 25%, transparent)">' + CR.esc(d.name) + '</span>' +
        '<span class="pill">' + CR.esc(card.topic) + '</span>' +
        '<span class="pill ' + stt.cls + '">' + stt.label + '</span>' +
        (card.custom ? '<span class="pill violet">Your card</span>' : '') +
      '</div>' +
      '<div style="font-size:19px;line-height:1.5;font-weight:550;letter-spacing:-.02em;white-space:pre-wrap">' + CR.esc(card.q) + '</div>' +
      CR.codeBlock(card.code, card.lang) +
      (mcq ? '<div class="mcq-grid">' + card.choices.map((ch, i) =>
        '<div class="mcq' + (i === card.correct ? ' correct' : '') + '" style="cursor:default"><span class="letter">' + String.fromCharCode(65 + i) + '</span>' +
        '<span class="mtext">' + CR.esc(ch) + '</span></div>').join('') + '</div>' : '') +
      '<div class="divider"></div>' +
      '<div class="ans-label" style="font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--mint);font-weight:650;margin-bottom:10px">Answer</div>' +
      '<ul class="ans-list">' + (card.a || []).map(x => '<li>' + CR.esc(x) + '</li>').join('') + '</ul>' +
      (card.why ? '<div class="why"><b>Why it matters · </b>' + CR.esc(card.why) + '</div>' : '') +
      (card.hint ? '<div class="hintbox"><b class="amber">Hint · </b>' + CR.esc(card.hint) + '</div>' : '') +
      '<div class="divider"></div>' +
      '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;text-align:center">' +
        stat('Ease', st.ease.toFixed(2)) +
        stat('Interval', st.interval ? CR.dueLabel(st.due).replace('in ', '') : 'new') +
        stat('Reviews', st.reps) +
        stat('Lapses', st.lapses) +
        stat('Accuracy', st.correct + st.wrong ? Math.round(st.correct / (st.correct + st.wrong) * 100) + '%' : '—') +
      '</div>';

    const foot =
      '<button class="btn ghost" data-flag>' + (st.bookmarked ? 'Remove flag' : 'Bookmark') + '</button>' +
      '<button class="btn ghost" data-susp>' + (st.suspended ? 'Unsuspend' : 'Suspend') + '</button>' +
      (card.custom
        ? '<button class="btn ghost" data-edit>Edit</button><button class="btn danger" data-del>Delete</button>'
        : '<button class="btn ghost" data-copy>Duplicate &amp; edit</button>') +
      '<button class="btn primary" data-review>Review now</button>';

    const close = CR.modal({
      title: 'Card', sub: d.name, wide: true, body, foot,
      onMount: (modal) => {
        modal.querySelector('[data-flag]').onclick = () => {
          CR.bookmark(id); close(); CR.showCard(id); CR.refreshChrome();
        };
        modal.querySelector('[data-susp]').onclick = () => {
          CR.suspend(id); close(); CR.showCard(id); CR.refreshChrome();
        };
        const editBtn = modal.querySelector('[data-edit]');
        if (editBtn) editBtn.onclick = () => { close(); CR.openCardEditor(id); };
        const copyBtn = modal.querySelector('[data-copy]');
        if (copyBtn) copyBtn.onclick = () => { close(); CR.openCardEditor(id, null, true); };
        const delBtn = modal.querySelector('[data-del]');
        if (delBtn) delBtn.onclick = () => {
          CR.confirm('Delete this card?', 'This removes your copy permanently. Built-in cards are not affected.', 'Delete', true)
            .then(ok => {
              if (!ok) return;
              CR.state.customCards = (CR.state.customCards || []).filter(c => c.id !== id);
              delete CR.state.cards[id];
              CR.rebuildCards(); CR.save(true); close();
              CR.toast('Card deleted');
              if (CR.currentPage() === 'library') CR.pages.library({});
            });
        };
        modal.querySelector('[data-review]').onclick = () => {
          close();
          CR.startSession({ cardId: id, deckIds: [], mode: 'review' });
        };
      }
    });

    function stat(label, value) {
      return '<div style="border:1px solid var(--line);border-radius:9px;padding:8px 4px">' +
        '<div style="font-size:15px;font-weight:650">' + CR.esc(String(value)) + '</div>' +
        '<div class="hint" style="font-size:10px;margin-top:1px">' + label + '</div></div>';
    }
  };

  /* ---------------- card editor ---------------- */
  CR.openCardEditor = function (id, presetDeck, forceCopy) {
    const existing = id ? CR.cardById[id] : null;
    const copy = !!existing && (!existing.custom || forceCopy);
    const source = existing || null;
    const deckId = presetDeck || (source ? source.deck : (CR.decks[0] && CR.decks[0].id));
    const isMcq = source ? source.type === 'mcq' : false;

    const body =
      (copy ? '<p class="hint" style="margin:-4px 0 14px">Built-in cards are read-only. Saving creates your own editable copy — the original stays in the deck.</p>' : '') +
      '<div class="row wrap" style="gap:10px;margin-bottom:12px">' +
        '<div class="field" style="flex:1;min-width:180px"><label>Deck</label><select class="input" id="edDeck">' + CR.deckOptions() + '</select></div>' +
        '<div class="field" style="flex:1;min-width:140px"><label>Topic</label><input class="input" id="edTopic" placeholder="e.g. Closures" value="' + CR.esc(source ? source.topic : '') + '"></div>' +
        '<div class="field" style="width:150px"><label>Type</label><select class="input" id="edType">' +
          ['concept', 'code', 'mcq'].map(t => '<option value="' + t + '"' + (source && source.type === t ? ' selected' : '') + '>' +
            ({ concept: 'Concept', code: 'Code reading', mcq: 'Multiple choice' }[t]) + '</option>').join('') +
        '</select></div>' +
      '</div>' +
      '<div class="stack" style="gap:12px">' +
        '<div class="field"><label>Question / prompt</label><textarea class="input" id="edQ" placeholder="What do you want to be able to recall?">' + CR.esc(source ? source.q : '') + '</textarea></div>' +
        '<div class="field"><label>Answer — one point per line</label><textarea class="input" id="edA" style="min-height:96px" placeholder="Key idea&#10;Why it matters&#10;A gotcha">' + CR.esc(source ? (source.a || []).join('\n') : '') + '</textarea></div>' +
        '<div class="row" style="gap:10px;align-items:flex-start">' +
          '<div class="field grow"><label>Code (optional)</label><textarea class="input" id="edCode" style="font-family:var(--mono);font-size:12px;min-height:86px">' + CR.esc(source ? (source.code || '') : '') + '</textarea></div>' +
          '<div class="field" style="width:105px"><label>Language</label><input class="input" id="edLang" placeholder="js" value="' + CR.esc(source ? (source.lang || '') : '') + '"></div>' +
        '</div>' +
        '<div class="field"><label>Why it matters (offline tutor note)</label><textarea class="input" id="edWhy" style="min-height:60px">' + CR.esc(source ? (source.why || '') : '') + '</textarea></div>' +
        '<div class="field"><label>Hint (optional)</label><input class="input" id="edHint" value="' + CR.esc(source ? (source.hint || '') : '') + '"></div>' +
        '<div id="mcqFields" style="display:' + (isMcq ? 'block' : 'none') + '">' +
          '<div class="field"><label>Choices — one per line (2–6)</label><textarea class="input" id="edChoices" style="min-height:78px">' + CR.esc(source && source.choices ? source.choices.join('\n') : '') + '</textarea></div>' +
          '<div class="field" style="margin-top:8px;width:160px"><label>Correct choice</label><select class="input" id="edCorrect">' +
            ['A', 'B', 'C', 'D', 'E', 'F'].map((l, i) => '<option value="' + i + '"' + (source && source.correct === i ? ' selected' : '') + '>' + l + '</option>').join('') +
          '</select></div>' +
        '</div>' +
      '</div>';

    const close = CR.modal({
      title: existing ? (copy ? 'Duplicate card' : 'Edit card') : 'Add a card',
      sub: 'Write it the way future-you needs to read it.',
      wide: true, body,
      foot: '<button class="btn ghost" data-cancel>Cancel</button><button class="btn primary" data-save>Save card</button>',
      onMount: (modal, closeFn) => {
        const deck = modal.querySelector('#edDeck');
        deck.value = deckId;
        const type = modal.querySelector('#edType');
        const mcq = modal.querySelector('#mcqFields');
        type.addEventListener('change', () => { mcq.style.display = type.value === 'mcq' ? 'block' : 'none'; });
        modal.querySelector('[data-cancel]').onclick = closeFn;
        modal.querySelector('[data-save]').onclick = () => {
          const q = modal.querySelector('#edQ').value.trim();
          const answers = modal.querySelector('#edA').value.split('\n').map(x => x.trim()).filter(Boolean);
          if (!q) { CR.toast('Add a question first.', 'err'); return; }
          if (!answers.length) { CR.toast('Add at least one answer point.', 'err'); return; }

          const c = {
            id: existing && existing.custom ? existing.id : 'usr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
            deck: deck.value,
            topic: modal.querySelector('#edTopic').value.trim() || 'General',
            type: type.value,
            q: q,
            a: answers,
            code: modal.querySelector('#edCode').value.trim() || undefined,
            lang: modal.querySelector('#edLang').value.trim() || undefined,
            why: modal.querySelector('#edWhy').value.trim() || undefined,
            hint: modal.querySelector('#edHint').value.trim() || undefined
          };

          if (type.value === 'mcq') {
            const choices = modal.querySelector('#edChoices').value.split('\n').map(x => x.trim()).filter(Boolean);
            if (choices.length < 2) { CR.toast('Multiple choice needs at least 2 choices.', 'err'); return; }
            c.choices = choices.slice(0, 6);
            c.correct = CR.clamp(Number(modal.querySelector('#edCorrect').value) || 0, 0, c.choices.length - 1);
          }

          CR.state.customCards = CR.state.customCards || [];
          if (existing && existing.custom) {
            const i = CR.state.customCards.findIndex(x => x.id === existing.id);
            if (i >= 0) CR.state.customCards[i] = c;
          } else {
            CR.state.customCards.push(c);
          }
          CR.rebuildCards();
          CR.save(true);
          closeFn();
          CR.toast(existing && existing.custom ? 'Card updated' : 'Card added — bookmark it if you want it handy.');
          CR.refreshChrome();
          if (CR.currentPage() === 'library') CR.pages.library({});
          else if (CR.currentPage() === 'study' && CR.activeSession) CR.pages.study();
        };
      }
    });
    return close;
  };
})();
