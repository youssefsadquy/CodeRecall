/* CodeRecall — settings */
(function () {
  'use strict';
  const CR = window.CR;

  const PROVIDERS = {
    free: {
      label: 'Free AI — no key', model: 'openai',
      note: 'Uses a public free endpoint. No account, no key. It can be rate-limited at busy times; retry or switch provider.'
    },
    openrouter: {
      label: 'OpenRouter', model: 'deepseek/deepseek-chat-v3-0324:free',
      note: 'Get a key at openrouter.ai/keys. Free models are available; paid models need credits.'
    },
    groq: {
      label: 'Groq', model: 'llama-3.3-70b-versatile',
      note: 'Fast free tier at console.groq.com. Create an API key and paste it here.'
    },
    gemini: {
      label: 'Google Gemini', model: 'gemini-2.0-flash',
      note: 'Free tier key at aistudio.google.com/apikey. Uses Gemini’s OpenAI-compatible endpoint.'
    },
    ollama: {
      label: 'Local Ollama', model: 'llama3.2',
      note: 'Runs entirely on this machine. Install Ollama, then run a model such as `ollama run llama3.2`. No key needed.'
    },
    custom: {
      label: 'Custom OpenAI-compatible API', model: 'gpt-4o-mini',
      note: 'Any endpoint that accepts POST /chat/completions. Enter the base URL, for example https://api.example.com/v1.'
    },
    offline: {
      label: 'Offline only', model: '',
      note: 'No network requests. Card explanations and the whole study engine still work. No AI generation.'
    }
  };

  function aiDefaults(provider) {
    return (PROVIDERS[provider] || PROVIDERS.free).model;
  }

  CR.pages.settings = function () {
    const s = CR.state;
    const ai = s.settings.ai || {};
    const provider = ai.provider || 'free';
    const info = PROVIDERS[provider] || PROVIDERS.free;

    CR.qs('#main').innerHTML =
      '<div class="page narrow">' +
        '<div class="page-head"><div class="grow"><div class="eyebrow">Settings</div><h1>Make it yours.</h1>' +
          '<div class="sub">Everything is stored locally on this machine. No account, no telemetry, no cloud sync.</div></div></div>' +

        '<div class="settings-grid">' +
          '<div class="stack">' +
            '<div class="panel">' +
              '<div class="panel-h"><h2>Your plan</h2><div class="spacer"></div><span class="pill mint">' + CR.planStats().decks + ' areas</span></div>' +
              '<p class="hint" style="margin-top:0">' + CR.esc(CR.profileLine()) + '. Only these decks enter your queue.</p>' +
              '<div class="plan-chips" style="margin:10px 0 14px">' + CR.activeDeckIds().map(id => {
                const d = CR.deckById[id];
                return d ? '<span class="plan-chip" style="--deck:' + d.color + '"><i></i>' + CR.esc(d.name) + '</span>' : '';
              }).join('') + '</div>' +
              '<div class="row wrap"><button class="btn primary sm" data-edit-plan>Edit plan</button>' +
                '<button class="btn ghost sm" data-tour>Take the tour</button>' +
                '<button class="btn ghost sm" data-redo>Redo setup</button></div>' +
            '</div>' +
            '<div class="panel">' +
              '<div class="panel-h"><h2>Study</h2></div>' +
              '<div class="settings-row"><div class="sr-copy"><b>Your name</b><span>Used in the greeting, nothing else.</span></div>' +
                '<input class="input" id="setName" style="width:170px" placeholder="Optional" value="' + CR.esc(s.name || '') + '"></div>' +
              '<div class="settings-row"><div class="sr-copy"><b>Daily goal</b><span>Cards reviewed per day. 40 is a steady habit.</span></div>' +
                '<input class="input" id="setGoal" type="number" min="5" max="300" step="5" style="width:90px" value="' + (s.settings.dailyGoal || 40) + '"></div>' +
              '<div class="settings-row"><div class="sr-copy"><b>New cards per day</b><span>Caps new material so reviews do not pile up.</span></div>' +
                '<input class="input" id="setNew" type="number" min="0" max="60" step="1" style="width:90px" value="' + (s.settings.newPerDay || 12) + '"></div>' +
              '<div class="settings-row"><div class="sr-copy"><b>Show hints</b><span>Allow a nudge before revealing the answer.</span></div>' +
                '<div class="switch' + (s.settings.showHints !== false ? ' on' : '') + '" id="setHints"></div></div>' +
              '<div class="settings-row"><div class="sr-copy"><b>Keyboard shortcuts</b><span>Space reveal · 1–4 grade · B bookmark · E edit.</span></div>' +
                '<button class="btn sm ghost" data-shortcuts>View all</button></div>' +
            '</div>' +

            '<div class="panel">' +
              '<div class="panel-h"><h2>Your data</h2></div>' +
              '<p class="hint" style="margin-top:0">Progress lives in <span class="mono" id="dataPath">…</span>. Back it up or move it to another PC.</p>' +
              '<div class="row wrap" style="margin-top:12px">' +
                '<button class="btn ghost" data-export>Export backup</button>' +
                '<button class="btn ghost" data-import>Import backup</button>' +
                '<button class="btn ghost" data-folder>Open folder</button>' +
              '</div>' +
              '<div class="divider"></div>' +
              '<div class="row between"><div class="sr-copy"><b style="font-size:12.5px">Reset progress</b>' +
                '<span style="font-size:11px;color:var(--dim)">Clears scheduling, history and streaks. Keeps your custom cards.</span></div>' +
                '<button class="btn sm danger" data-reset>Reset</button></div>' +
            '</div>' +
          '</div>' +

          '<div class="stack">' +
            '<div class="panel">' +
              '<div class="panel-h"><h2>AI tutor</h2><div class="spacer"></div>' +
                '<span class="pill ' + (provider === 'offline' ? '' : 'mint') + '">' + (provider === 'offline' ? 'off' : 'on') + '</span></div>' +
              '<div class="field" style="margin-bottom:10px"><label>Provider</label>' +
                '<select class="input" id="aiProvider">' +
                  Object.keys(PROVIDERS).map(k => '<option value="' + k + '"' + (k === provider ? ' selected' : '') + '>' + PROVIDERS[k].label + '</option>').join('') +
                '</select></div>' +
              '<p class="hint" style="margin:0 0 12px">' + CR.esc(info.note) + '</p>' +
              '<div class="field" style="margin-bottom:10px"><label>Model</label>' +
                '<input class="input" id="aiModel" placeholder="' + CR.esc(aiDefaults(provider)) + '" value="' + CR.esc(ai.model || '') + '"></div>' +
              '<div class="field" style="margin-bottom:10px"><label>API key' + (provider === 'free' || provider === 'ollama' ? ' (not needed)' : '') + '</label>' +
                '<input class="input" id="aiKey" type="password" autocomplete="off" placeholder="' + (provider === 'free' ? 'No key required' : 'Paste key') + '" value="' + CR.esc(ai.key || '') + '"></div>' +
              '<div class="field" id="baseWrap" style="margin-bottom:10px;display:' + (provider === 'custom' ? 'flex' : 'none') + '">' +
                '<label>Base URL</label><input class="input" id="aiBase" placeholder="https://api.example.com/v1" value="' + CR.esc(ai.baseUrl || '') + '"></div>' +
              '<div class="row"><button class="btn primary sm" data-test>Test connection</button>' +
                '<button class="btn ghost sm" data-saveai>Save</button>' +
                '<div class="spacer"></div><span class="hint" id="testOut"></span></div>' +
              '<p class="hint" style="margin-top:11px">Keys are encrypted with Windows DPAPI for this user. Requests go straight from this app to the provider.</p>' +
            '</div>' +

            '<div class="panel">' +
              '<div class="panel-h"><h2>About</h2></div>' +
              '<div class="row between" style="padding:6px 0"><span class="hint">Version</span><span class="mono" style="font-size:12px" id="appVersion">…</span></div>' +
              '<div class="row between" style="padding:6px 0"><span class="hint">Cards in your plan</span><span class="mono" style="font-size:12px">' + CR.planStats().cards + ' / ' + CR.cards.length + '</span></div>' +
              '<div class="row between" style="padding:6px 0"><span class="hint">Engine</span><span class="mono" style="font-size:12px">SM-2 flavoured</span></div>' +
              '<div class="divider"></div>' +
              '<p class="hint" style="margin:0">Built for one job: getting a working engineer back to speed quickly. No streaks-for-streaks-sake, no ads, no account.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    const main = CR.qs('#main');

    /* --- study settings --- */
    main.querySelector('#setName').addEventListener('change', e => {
      CR.state.name = e.target.value.trim(); CR.save(true); CR.toast('Saved');
    });
    main.querySelector('#setGoal').addEventListener('change', e => {
      CR.state.settings.dailyGoal = CR.clamp(Number(e.target.value) || 40, 5, 300);
      e.target.value = CR.state.settings.dailyGoal; CR.save(true); CR.refreshChrome();
    });
    main.querySelector('#setNew').addEventListener('change', e => {
      CR.state.settings.newPerDay = CR.clamp(Number(e.target.value) || 12, 0, 60);
      e.target.value = CR.state.settings.newPerDay; CR.save(true);
    });
    const hints = main.querySelector('#setHints');
    hints.addEventListener('click', () => {
      CR.state.settings.showHints = !(CR.state.settings.showHints !== false);
      hints.classList.toggle('on', CR.state.settings.showHints);
      CR.save(true);
    });
    main.querySelector('[data-shortcuts]').addEventListener('click', CR.showShortcuts);
    const planBtn = main.querySelector('[data-edit-plan]');
    if (planBtn) planBtn.addEventListener('click', () => CR.openProfileWizard({ edit: true }));
    const tourBtn = main.querySelector('[data-tour]');
    if (tourBtn) tourBtn.addEventListener('click', () => CR.startTour());
    const redoBtn = main.querySelector('[data-redo]');
    if (redoBtn) redoBtn.addEventListener('click', () => CR.openProfileWizard({ firstRun: true, redo: true }));

    /* --- AI settings --- */
    const sel = main.querySelector('#aiProvider');
    const model = main.querySelector('#aiModel');
    const key = main.querySelector('#aiKey');
    const base = main.querySelector('#aiBase');
    const baseWrap = main.querySelector('#baseWrap');
    const out = main.querySelector('#testOut');

    sel.addEventListener('change', () => {
      const p = sel.value;
      CR.state.settings.ai.provider = p;
      if (!model.value || Object.values(PROVIDERS).some(x => x.model === model.value)) {
        model.value = aiDefaults(p);
        CR.state.settings.ai.model = model.value;
      }
      baseWrap.style.display = p === 'custom' ? 'flex' : 'none';
      CR.save(true);
      CR.refreshChrome();
      CR.pages.settings(); // re-render notes for the selected provider
    });
    [model, key, base].forEach(el => el.addEventListener('change', () => saveAI(false)));

    function readAI() {
      return {
        provider: sel.value,
        model: model.value.trim() || aiDefaults(sel.value),
        key: key.value.trim(),
        baseUrl: base.value.trim()
      };
    }

    function saveAI(showToast) {
      const val = readAI();
      CR.state.settings.ai.provider = val.provider;
      CR.state.settings.ai.model = val.model;
      CR.state.settings.ai.baseUrl = val.baseUrl;
      CR.state.settings.ai.key = val.key;
      CR.call('secret.set', val.key).catch(() => {});
      CR.save(true);
      CR.refreshChrome();
      if (showToast) CR.toast('AI settings saved');
    }

    main.querySelector('[data-saveai]').addEventListener('click', () => saveAI(true));

    main.querySelector('[data-test]').addEventListener('click', async () => {
      const val = readAI();
      if (val.provider === 'offline') { out.innerHTML = '<span class="dim">Offline — nothing to test.</span>'; return; }
      out.innerHTML = '<span class="typing"><i></i><i></i><i></i></span>';
      try {
        const res = await CR.call('ai.test', val);
        out.innerHTML = '<span class="mint">Connected ✓</span>';
        CR.toast('AI connected: ' + (res && res.text ? res.text.slice(0, 40) : 'OK'));
      } catch (e) {
        out.innerHTML = '<span class="red">Failed</span>';
        CR.toast(e.message, 'err');
      }
    });

    /* --- data --- */
    CR.call('app.info').then(info => {
      const v = CR.qs('#appVersion');
      if (v) v.textContent = info && info.version ? 'v' + info.version : '—';
      const p = CR.qs('#dataPath');
      if (p) p.textContent = info && info.dataDir ? info.dataDir : 'local app data';
    }).catch(() => {});

    main.querySelector('[data-folder]').addEventListener('click', () => CR.call('app.openData').catch(() => {}));

    main.querySelector('[data-export]').addEventListener('click', async () => {
      saveAI(false);
      const snap = JSON.parse(JSON.stringify(CR.state));
      if (snap.settings && snap.settings.ai) snap.settings.ai.key = '';
      const payload = { app: 'CodeRecall', version: 1, exportedAt: new Date().toISOString(), state: snap };
      try {
        const res = await CR.call('file.export', {
          name: 'coderecall-backup-' + CR.todayKey() + '.json',
          content: JSON.stringify(payload, null, 2)
        });
        if (res && res.saved) CR.toast('Backup saved');
      } catch (e) { CR.toast(e.message, 'err'); }
    });

    main.querySelector('[data-import]').addEventListener('click', async () => {
      try {
        const res = await CR.call('file.import');
        if (!res || !res.loaded) return;
        const parsed = JSON.parse(res.content);
        const incoming = parsed.state || parsed;
        if (!incoming || typeof incoming !== 'object' || !incoming.cards) throw new Error('That does not look like a CodeRecall backup.');
        const ok = await CR.confirm('Replace current progress?',
          'Your current scheduling and history will be overwritten by the backup. Your custom cards are included in the backup.', 'Import and replace');
        if (!ok) return;
        const keepKey = CR.state.settings.ai.key;
        CR.state = Object.assign({}, CR.state, incoming);
        CR.state.settings = Object.assign({}, incoming.settings || {});
        CR.state.settings.ai = Object.assign({ provider: 'free', model: 'openai', baseUrl: '', key: '' }, (incoming.settings && incoming.settings.ai) || {});
        CR.state.settings.ai.key = keepKey;
        CR.state.customCards = incoming.customCards || [];
        CR.rebuildCards();
        CR.save(true);
        CR.toast('Backup imported');
        CR.route('today');
      } catch (e) {
        CR.toast('Import failed: ' + e.message, 'err');
      }
    });

    main.querySelector('[data-reset]').addEventListener('click', async () => {
      const ok = await CR.confirm('Reset all progress?',
        'Scheduling, streaks, history and statistics will be erased. Your custom cards and settings stay.', 'Reset progress', true);
      if (!ok) return;
      const keepSettings = CR.state.settings;
      const keepName = CR.state.name;
      const keepCustom = CR.state.customCards || [];
      CR.state.cards = {};
      CR.state.days = {};
      CR.state.log = [];
      CR.state.customCards = keepCustom;
      CR.state.settings = keepSettings;
      CR.state.name = keepName;
      CR.rebuildCards();
      CR.save(true);
      CR.toast('Progress reset');
      CR.route('today');
    });
  };
})();
