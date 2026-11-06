/* CodeRecall — AI tutor (free or bring-your-own-key) */
(function () {
  'use strict';
  const CR = window.CR;

  function profileContext() {
    const p = CR.state.profile || {};
    const labels = CR.PROFILE_LABELS || {};
    const bits = [];
    if (labels.background && labels.background[p.background]) bits.push('They are ' + labels.background[p.background] + '.');
    if (labels.freshness && labels.freshness[p.freshness]) bits.push('Their knowledge is ' + labels.freshness[p.freshness] + '.');
    if (labels.goal && labels.goal[p.goal]) bits.push('Their focus is ' + labels.goal[p.goal] + '.');
    const active = (CR.activeDeckIds ? CR.activeDeckIds() : [])
      .map(id => (CR.deckById[id] || {}).name)
      .filter(Boolean);
    if (active.length && active.length < CR.decks.length) {
      bits.push('Their active areas are: ' + active.join(', ') + '.');
    }
    return bits.join(' ');
  }

  function systemPrompt() {
    const context = profileContext();
    return 'You are CodeRecall, a precise tutor for a software engineer rebuilding recall. ' +
      (context ? context + ' ' : '') +
      'Be direct and compact. Prefer one concrete example over abstractions. Never invent APIs or facts. ' +
      'Use short paragraphs and code blocks where they help. Keep answers under 200 words unless code is requested.';
  }

  let chat = [];

  function providerText() {
    const ai = CR.state.settings.ai || {};
    if (ai.provider === 'offline') return 'Offline mode';
    if (ai.provider === 'free') return 'Free AI · no key needed';
    if (ai.key) return CR.aiLabel();
    return CR.aiLabel() + ' · key needed';
  }

  function renderMessages() {
    const body = CR.qs('#chatBody');
    if (!body) return;
    if (!chat.length) {
      chat.push({
        role: 'assistant',
        text: 'Ask me anything you half-remember. I can explain a concept, walk a code example, quiz you, or turn a topic into new cards.\n\nTry: **“Explain the JavaScript event loop like I have an interview tomorrow.”**'
      });
    }
    body.innerHTML = chat.map(m =>
      '<div class="msg ' + (m.role === 'user' ? 'me' : '') + '">' +
        '<div class="avatar ' + (m.role === 'user' ? 'me' : 'ai') + '">' + (m.role === 'user' ? 'YOU' : 'CR') + '</div>' +
        '<div class="bubble">' + (m.error ? '<span class="red">' + CR.esc(m.text) + '</span>' : CR.mdToHtml(m.text)) + '</div>' +
      '</div>').join('');
    if (typingState) {
      body.insertAdjacentHTML('beforeend',
        '<div class="msg"><div class="avatar ai">CR</div><div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div></div>');
    }
    body.scrollTop = body.scrollHeight;
  }

  let typingState = false;
  function setTyping(on) { typingState = on; renderMessages(); }

  async function send(text) {
    text = (text || '').trim();
    if (!text) return;
    if (!CR.aiAvailable()) {
      CR.toast('AI is set to offline. Pick a provider in Settings — the free one needs no key.', 'err');
      return;
    }
    chat.push({ role: 'user', text });
    renderMessages();
    setTyping(true);

    try {
      const history = chat.filter(m => !m.error).slice(-10).map(m => ({ role: m.role, content: m.text }));
      const messages = [{ role: 'system', content: systemPrompt() }].concat(history);
      const answer = await CR.aiChat(messages, 900);
      chat.push({ role: 'assistant', text: answer });
    } catch (e) {
      chat.push({ role: 'assistant', error: true, text: 'AI unavailable: ' + e.message + '\n\nThe rest of CodeRecall works offline. Try again, or switch provider in Settings.' });
    } finally {
      typingState = false;
      renderMessages();
    }
  }

  CR.pages.ai = function () {
    const ai = CR.state.settings.ai || {};
    CR.qs('#main').innerHTML =
      '<div class="page">' +
        '<div class="page-head"><div class="grow"><div class="eyebrow">AI Tutor</div><h1>Ask the thing you forgot.</h1>' +
          '<div class="sub">No judgement, no fluff. Free by default, or plug in your own key. The app is fully usable with AI off.</div></div>' +
          '<button class="btn ghost" data-settings>AI settings</button></div>' +
        '<div class="ai-layout">' +
          '<div class="chat">' +
            '<div class="chat-head">' +
              '<div class="avatar ai">CR</div><div><div style="font-size:12.5px;font-weight:600">CodeRecall tutor</div>' +
              '<div class="hint" style="margin-top:1px">' + CR.esc(providerText()) + '</div></div>' +
              '<div class="spacer"></div>' +
              '<button class="btn sm ghost" data-clear>Clear</button>' +
            '</div>' +
            '<div class="chat-body" id="chatBody"></div>' +
            '<div class="chat-foot">' +
              '<div class="quick-prompts">' +
                '<button data-prompt="Explain closures in JavaScript with one tiny example.">Closures</button>' +
                '<button data-prompt="Explain database indexes like I am revising for interviews. When do they hurt?">DB indexes</button>' +
                '<button data-prompt="Give me the five Big-O facts people actually get asked, with one-line reasons.">Big-O</button>' +
                '<button data-prompt="Quiz me: ask one interview question about HTTP status codes, then wait for my answer.">Quiz me</button>' +
              '</div>' +
              '<div class="composer">' +
                '<textarea id="chatInput" rows="1" placeholder="Ask a question…  (Enter to send, Shift+Enter for a line)"></textarea>' +
                '<button class="btn primary" data-send>Send</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="ai-side">' +
            '<div class="panel">' +
              '<div class="eyebrow">Current provider</div>' +
              '<div class="provider-row" style="margin-top:6px"><span class="dot"></span><b style="font-size:13px">' + CR.esc(CR.aiLabel()) + '</b>' +
                '<div class="spacer"></div><button class="btn sm ghost" data-settings>Change</button></div>' +
              '<p class="hint" style="margin-top:9px">' + (ai.provider === 'free'
                ? 'The free endpoint needs no account or key. It can occasionally be rate-limited; retry or switch provider.'
                : ai.provider === 'offline'
                  ? 'No requests leave your machine. Card explanations still work from the built-in notes.'
                  : 'Requests go directly from this app to your provider. Your key is stored encrypted with Windows DPAPI.') + '</p>' +
            '</div>' +
            '<div class="panel">' +
              '<div class="panel-h"><h2>Turn a topic into cards</h2></div>' +
              '<p class="hint" style="margin-top:0">Give me a topic and I will write atomic, exam-style cards you can edit before adding.</p>' +
              '<button class="btn violet block" style="margin-top:11px" data-generate>Generate cards</button>' +
            '</div>' +
            '<div class="panel">' +
              '<div class="panel-h"><h2>Good prompts</h2></div>' +
              '<ul class="ans-list" style="font-size:12px">' +
                '<li>Explain X like I have an interview tomorrow.</li>' +
                '<li>What is the difference between X and Y?</li>' +
                '<li>Find the bug in this code: …</li>' +
                '<li>Quiz me on X, one question at a time.</li>' +
                '<li>What should I revise first for a backend interview?</li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    const main = CR.qs('#main');
    renderMessages();

    const input = CR.qs('#chatInput');
    const sendNow = () => { const t = input.value; input.value = ''; send(t); };
    main.querySelector('[data-send]').addEventListener('click', sendNow);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendNow(); }
    });
    main.querySelector('[data-clear]').addEventListener('click', () => { chat = []; renderMessages(); });
    main.querySelectorAll('[data-settings]').forEach(b => b.addEventListener('click', () => CR.route('settings')));
    main.querySelectorAll('[data-prompt]').forEach(b => b.addEventListener('click', () => send(b.dataset.prompt)));
    main.querySelector('[data-generate]').addEventListener('click', () => openGenerate());
    setTimeout(() => input.focus(), 60);
  };

  /* ---------------- generate cards ---------------- */
  function openGenerate() {
    const body =
      '<div class="row wrap" style="gap:10px">' +
        '<div class="field grow" style="min-width:220px"><label>Topic</label>' +
          '<input class="input" id="genTopic" placeholder="e.g. SQL indexes, closures, TCP handshake"></div>' +
        '<div class="field" style="width:170px"><label>Deck</label><select class="input" id="genDeck">' + CR.deckOptions() + '</select></div>' +
        '<div class="field" style="width:100px"><label>Cards</label><select class="input" id="genCount">' +
          '<option>5</option><option selected>8</option><option>10</option></select></div>' +
      '</div>' +
      '<div class="field" style="margin-top:10px"><label>Angle (optional)</label>' +
        '<input class="input" id="genAngle" placeholder="e.g. interview-level, focus on gotchas"></div>' +
      '<div id="genResult" style="margin-top:14px"></div>';
    const close = CR.modal({
      title: 'Generate cards',
      sub: 'AI drafts them. You approve every card before it enters your library.',
      wide: true, body,
      foot: '<button class="btn ghost" data-cancel>Cancel</button><button class="btn primary" data-gen>Generate</button>',
      onMount: (modal, closeFn) => {
        const topic = modal.querySelector('#genTopic');
        topic.focus();
        const result = modal.querySelector('#genResult');
        const btn = modal.querySelector('[data-gen]');
        modal.querySelector('[data-cancel]').onclick = closeFn;

        btn.onclick = async () => {
          const t = topic.value.trim();
          if (!t) { CR.toast('Add a topic first.', 'err'); return; }
          if (!CR.aiAvailable()) { CR.toast('AI is offline. Switch provider in Settings.', 'err'); return; }

          const deck = modal.querySelector('#genDeck').value;
          const n = Number(modal.querySelector('#genCount').value) || 6;
          const angle = modal.querySelector('#genAngle').value.trim();
          const lang = (CR.deckById[deck] || {}).id === 'py' ? 'Python' : 'JavaScript or TypeScript';

          btn.disabled = true;
          result.innerHTML = '<div class="panel flat" style="display:flex;align-items:center;gap:10px"><span class="typing"><i></i><i></i><i></i></span>' +
            '<span class="hint">Drafting ' + n + ' cards on ' + CR.esc(t) + '…</span></div>';

          const prompt =
            'Write ' + n + ' spaced-repetition cards for a software engineer revising "' + t + '".' +
            (angle ? ' Angle: ' + angle + '.' : '') +
            '\nReturn ONLY a JSON array. No prose, no markdown fences. Each object must have exactly:\n' +
            '{"q": "one clear question", "a": ["2 to 4 short answer points"], "code": "optional short code or null", "lang": "js|py|java|cs|sql|null", "why": "one sentence on why it matters", "hint": "optional nudge or null", "topic": "short topic label"}\n' +
            'Rules: each card must test exactly one idea; answers must be correct and concise; prefer ' + lang + ' in code; no trivia; no duplicate angles; at most one code block per card.';

          try {
            const context = profileContext();
            const text = await CR.aiChat([
              { role: 'system', content: 'You generate precise programming flashcards. Output valid JSON only. No commentary.' + (context ? ' Context: ' + context : '') },
              { role: 'user', content: prompt }
            ], 2200);
            const cards = parseCards(text);
            if (!cards.length) throw new Error('No cards could be parsed from the answer.');
            result.innerHTML = '<div class="row between" style="margin-bottom:8px"><b style="font-size:12.5px">' + cards.length + ' draft cards</b>' +
              '<button class="btn sm ghost" data-all>Toggle all</button></div><div class="list">' +
              cards.map((c, i) =>
                '<label class="list-row" style="cursor:pointer;align-items:flex-start">' +
                  '<input type="checkbox" data-pick="' + i + '" checked style="margin-top:3px;accent-color:#7cf2c0">' +
                  '<div class="lr-main"><div class="lr-title" style="white-space:normal">' + CR.esc(c.q) + '</div>' +
                  '<div class="lr-sub" style="white-space:normal;display:block">' + CR.esc((c.a || []).join(' · ')) + '</div></div>' +
                '</label>').join('') + '</div>' +
              '<div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn primary" data-add>Add selected to ' + CR.esc(CR.deckById[deck].name) + '</button></div>';

            const picks = Array.from(result.querySelectorAll('[data-pick]'));
            result.querySelector('[data-all]').onclick = () => {
              const allOn = picks.every(p => p.checked);
              picks.forEach(p => { p.checked = !allOn; });
            };
            result.querySelector('[data-add]').onclick = () => {
              const selected = picks.filter(p => p.checked).map(p => cards[Number(p.dataset.pick)]);
              if (!selected.length) { CR.toast('Select at least one card.', 'err'); return; }
              CR.state.customCards = CR.state.customCards || [];
              selected.forEach(c => {
                CR.state.customCards.push({
                  id: 'usr-gen-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
                  deck, topic: c.topic || t, type: c.code ? 'code' : 'concept',
                  q: c.q, a: c.a, code: c.code || undefined, lang: c.lang || undefined,
                  why: c.why || undefined, hint: c.hint || undefined, source: 'ai'
                });
              });
              CR.rebuildCards();
              CR.save(true);
              CR.refreshChrome();
              closeFn();
              CR.toast(selected.length + ' cards added. Edit anything that feels off.');
              CR.route('library');
            };
            btn.disabled = false;
          } catch (e) {
            btn.disabled = false;
            result.innerHTML = '<div class="hintbox"><b class="red">Generation failed · </b>' + CR.esc(e.message) +
              '<br><br>Try again, use a shorter topic, or switch provider in Settings. Free AI can be rate-limited.</div>';
          }
        };
      }
    });
    return close;
  }

  function parseCards(text) {
    let s = String(text || '').trim();
    s = s.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
    const start = s.indexOf('[');
    const end = s.lastIndexOf(']');
    if (start >= 0 && end > start) s = s.slice(start, end + 1);
    let arr;
    try { arr = JSON.parse(s); }
    catch (e) {
      // tolerate trailing commas
      try { arr = JSON.parse(s.replace(/,\s*([}\]])/g, '$1')); }
      catch (e2) { throw new Error('The model did not return valid JSON. Try again.'); }
    }
    if (!Array.isArray(arr)) throw new Error('The model returned the wrong shape.');
    return arr.filter(c => c && typeof c.q === 'string' && Array.isArray(c.a) && c.a.length)
      .map(c => ({
        q: String(c.q).trim(),
        a: c.a.map(x => String(x).trim()).filter(Boolean).slice(0, 5),
        code: c.code && String(c.code).trim() ? String(c.code).trim() : null,
        lang: c.lang ? String(c.lang).trim() : null,
        why: c.why ? String(c.why).trim() : null,
        hint: c.hint ? String(c.hint).trim() : null,
        topic: c.topic ? String(c.topic).trim() : 'AI generated'
      }));
  }

  /* ---------------- per-card explainer ---------------- */
  CR.aiExplainCard = function (card, kind) {
    const offline = !CR.aiAvailable();
    if (offline) {
      CR.modal({
        title: 'Offline tutor',
        sub: 'Built-in explanation · no network',
        wide: true,
        body: '<div style="white-space:pre-wrap;font-size:13.5px;line-height:1.6">' +
          CR.esc(card.why || (card.a || []).join('\n')) + '</div>' +
          '<div class="hintbox" style="margin-top:16px">The AI tutor is off or has no key. Everything here still works offline. You can enable free AI in Settings.</div>',
        foot: '<button class="btn ghost" data-settings>AI settings</button><button class="btn primary" data-close>Got it</button>',
        onMount: (modal, close) => {
          modal.querySelector('[data-close]').onclick = close;
          modal.querySelector('[data-settings]').onclick = () => { close(); CR.route('settings'); };
        }
      });
      return;
    }

    const titles = { simpler: 'Explain it simpler', example: 'Show me code', quiz: 'Quiz me on this' };
    const body = '<div id="aiBody" style="min-height:120px"><div class="row" style="gap:10px;align-items:center">' +
      '<span class="typing"><i></i><i></i><i></i></span><span class="hint">Thinking…</span></div></div>' +
      '<div class="divider"></div>' +
      '<div class="hint"><b class="muted">Card:</b> ' + CR.esc(card.q) + '</div>' +
      '<div class="row" style="justify-content:flex-end;gap:7px;margin-top:14px">' +
        '<button class="btn sm ghost" data-local>Built-in note</button><button class="btn sm ghost" data-regenerate>Try again</button></div>';

    const close = CR.modal({
      title: titles[kind] || 'AI tutor', sub: CR.deckOf(card).name + ' · ' + card.topic, wide: true, body,
      onMount: (modal) => run(modal)
    });

    async function run(modal) {
      const box = modal.querySelector('#aiBody');
      box.innerHTML = '<div class="row" style="gap:10px;align-items:center"><span class="typing"><i></i><i></i><i></i></span><span class="hint">Thinking…</span></div>';
      const base = 'Card question: ' + card.q + '\nCorrect answer points: ' + (card.a || []).join('; ') +
        (card.code ? '\nCode on card:\n' + card.code : '') +
        (card.why ? '\nWhy it matters: ' + card.why : '');

      let prompt, sys = systemPrompt();
      if (kind === 'simpler') prompt = base + '\n\nExplain this in the simplest correct terms. Use an analogy only if it is accurate. Max 120 words.';
      else if (kind === 'example') prompt = base + '\n\nGive one small, runnable ' + (card.lang || 'JavaScript') + ' example that demonstrates the idea. Add two short bullet takeaways. Keep it under 25 lines.';
      else {
        sys = 'You write one fair multiple-choice question. Output valid JSON only, with keys question, choices (4 strings), correct (index), explanation.';
        prompt = base + '\n\nWrite one exam-style multiple-choice question that tests this idea without repeating the card wording. Output JSON only.';
      }

      try {
        const text = await CR.aiChat([{ role: 'system', content: sys }, { role: 'user', content: prompt }], kind === 'quiz' ? 700 : 800);
        if (kind === 'quiz') {
          let q;
          try {
            let s = text.replace(/```(?:json)?/ig, '').trim();
            q = JSON.parse(s.slice(s.indexOf('{'), s.lastIndexOf('}') + 1));
          } catch (e) { q = null; }
          if (q && Array.isArray(q.choices)) {
            box.innerHTML = '<div style="font-size:15px;line-height:1.5;font-weight:550;margin-bottom:12px">' + CR.esc(q.question) + '</div>' +
              '<div class="mcq-grid" id="aiQuiz">' + q.choices.map((c, i) =>
                '<button class="mcq" data-q="' + i + '"><span class="letter">' + String.fromCharCode(65 + i) + '</span>' +
                '<span class="mtext">' + CR.esc(c) + '</span></button>').join('') + '</div><div id="quizExp"></div>';
            box.querySelectorAll('[data-q]').forEach(btn => btn.addEventListener('click', () => {
              const i = Number(btn.dataset.q);
              box.querySelectorAll('[data-q]').forEach((b, j) => {
                b.classList.toggle('correct', j === q.correct);
                b.classList.toggle('wrong', j === i && i !== q.correct);
              });
              box.querySelector('#quizExp').innerHTML = '<div class="why" style="margin-top:12px"><b>' +
                (i === q.correct ? 'Correct · ' : 'Not quite · ') + '</b>' + CR.esc(q.explanation || '') + '</div>' +
                '<div class="row" style="margin-top:10px"><button class="btn sm ghost" data-regenerate>Another question</button></div>';
              box.querySelector('[data-regenerate]').onclick = () => run(modal);
            }));
          } else {
            box.innerHTML = '<div style="white-space:pre-wrap;line-height:1.65;font-size:13.5px">' + CR.mdToHtml(text) + '</div>';
          }
        } else {
          box.innerHTML = '<div style="line-height:1.65;font-size:13.5px">' + CR.mdToHtml(text) + '</div>';
        }
      } catch (e) {
        box.innerHTML = '<div class="hintbox"><b class="red">AI unavailable · </b>' + CR.esc(e.message) + '</div>' +
          '<div style="margin-top:12px"><div class="ans-label" style="font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--mint);font-weight:650;margin-bottom:8px">Built-in note</div>' +
          '<div style="white-space:pre-wrap;line-height:1.6;font-size:13px">' + CR.esc(card.why || (card.a || []).join('\n')) + '</div></div>';
      }
    }

    const modalEl = CR.qs('#modalRoot .modal');
    if (modalEl) {
      const local = modalEl.querySelector('[data-local]');
      if (local) local.onclick = () => {
        const box = modalEl.querySelector('#aiBody');
        box.innerHTML = '<div style="white-space:pre-wrap;line-height:1.65;font-size:13.5px">' + CR.esc(card.why || (card.a || []).join('\n')) + '</div>' +
          '<div class="hintbox" style="margin-top:14px">This note ships with the card, so it works with no connection.</div>';
      };
      const regen = modalEl.querySelector('[data-regenerate]');
      if (regen) regen.onclick = () => run(modalEl);
    }
    return close;
  };
})();
