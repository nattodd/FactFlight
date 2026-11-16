/* Isolated diagnostic experiment. No quiz imports, storage, audio recording or uploads. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  const descriptions = {
    natural: 'Single-phrase recognition. The browser ends the session itself.',
    stop: 'Single-phrase recognition. Request stop after the first final result.',
    cue: 'The app says “Your turn,” then opens single-phrase recognition. Let the browser end it.'
  };
  const origin = performance.now(), events = [], attempts = [];
  let current = null, cooling = false, cooldown;
  function trace(event, run = current, extra = {}) {
    events.push({ms: Math.round(performance.now() - origin), attempt: run?.id || 0,
      mode: run?.mode || $('mode').value, event, ...extra});
    if (events.length > 1500) events.shift();
    $('log').textContent = events.slice(-80).map(e => JSON.stringify(e)).join('\n');
  }
  function status(message) { $('status').textContent = message; }
  function controls() {
    $('start').disabled = !Speech || !window.isSecureContext || !!current || cooling;
    $('mode').disabled = !!current || cooling;
    $('cancel').disabled = !current;
    $('counts').textContent = attempts.length ? Object.keys(descriptions).map(mode => {
      const runs = attempts.filter(r => r.mode === mode);
      return `${mode === 'natural' ? 'A' : mode === 'stop' ? 'B' : 'C'}: ${runs.filter(r => r.results > 0).length}/${runs.length} attempts received results`;
    }).join(' · ') : 'No attempts yet.';
  }
  function clearTimers(run) { clearTimeout(run.observation); clearTimeout(run.shutdown); clearTimeout(run.cueTimer); }
  function finish(run, reason) {
    if (current !== run) return;
    clearTimers(run);
    if (run.rec) for (const name of run.handlers) run.rec[name] = null;
    if (run.utterance) run.utterance.onend = run.utterance.onerror = null;
    run.rec = null; run.utterance = null;
    current = null; cooling = true;
    trace('completed', run, {reason});
    status(`${run.results ? 'Speech results received.' : 'No speech results received.'} Releasing session…`);
    controls();
    cooldown = setTimeout(() => {
      cooling = false; controls();
      status(`${run.results ? 'Speech results received.' : 'No speech results received.'} Session ended. Tap Start attempt to repeat.`);
    }, 400);
  }
  function awaitEnd(run) {
    clearTimeout(run.shutdown);
    run.shutdown = setTimeout(() => {
      if (current !== run) return;
      trace('shutdown-unconfirmed', run);
      status('Browser has not confirmed shutdown. Cancel again or download the log and close this page. New starts are blocked.');
    }, 5000);
  }
  function cancel(reason = 'cancel') {
    const run = current;
    if (!run) return;
    run.cancelled = true; trace(reason, run); clearTimers(run);
    if (run.utterance) {
      run.utterance.onend = run.utterance.onerror = null;
      window.speechSynthesis.cancel();
    }
    if (!run.rec) { finish(run, 'cancelled-before-recognition'); return; }
    status('Requesting microphone release…'); awaitEnd(run);
    try { run.rec.abort(); } catch (_) { trace('abort-threw', run); }
  }
  function launch(run) {
    if (current !== run || run.cancelled) return;
    clearTimeout(run.cueTimer);
    let rec;
    try { rec = new Speech(); } catch (_) { trace('constructor-threw', run); finish(run, 'constructor-failed'); return; }
    run.rec = rec; trace('created', run);
    rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = true;
    run.handlers = [];
    function on(name, callback) {
      run.handlers.push('on' + name);
      rec['on' + name] = event => { if (current === run) callback(event); };
    }
    on('start', () => {
      trace('start', run);
      if (run.cancelled) return;
      status('Say ready. Waiting for speech results…');
    });
    for (const name of ['audiostart','audioend','soundstart','soundend','speechstart','speechend'])
      on(name, () => trace(name, run));
    on('result', event => {
      if (run.cancelled) { trace('result-after-cancel-ignored', run); return; }
      let final = false;
      for (let i = event.resultIndex; i < event.results.length; i++) final ||= event.results[i].isFinal;
      run.results++; trace('result', run, {final}); controls();
      status('Speech result received. Waiting for the browser to end the session…');
      if (run.mode === 'stop' && final && !run.stopRequested) {
        run.stopRequested = true; trace('stop-requested', run); awaitEnd(run);
        try { rec.stop(); } catch (_) { trace('stop-threw', run); }
      }
    });
    on('error', event => {
      const allowed = ['no-speech','aborted','audio-capture','network','not-allowed','service-not-allowed','bad-grammar','language-not-supported'];
      trace('error', run, {code: allowed.includes(event.error) ? event.error : 'other'});
      status('Browser reported a recognition error. Waiting for shutdown; Cancel remains available.');
      awaitEnd(run);
    });
    on('end', () => { trace('end', run); finish(run, run.cancelled ? 'cancelled' : 'browser-end'); });
    run.observation = setTimeout(() => {
      if (current !== run || run.cancelled) return;
      trace('observation-20s', run, {receivedResults: run.results > 0});
      status(run.results ? 'Results arrived, but the session is still open. You can cancel.' : 'No results after 20 seconds. Still listening; Cancel to release the microphone.');
    }, 20000);
    try { trace('start-requested', run); rec.start(); }
    catch (_) { trace('start-threw', run); cancel('start-failed'); }
  }
  $('start').onclick = () => {
    if (current || cooling || !Speech || !window.isSecureContext) return;
    const run = {id: attempts.length + 1, mode: $('mode').value, results: 0, handlers: []};
    attempts.push(run); current = run; controls(); trace('tap-start', run);
    status('Opening recognition. Wait for “Say ready.”');
    if (run.mode !== 'cue') { launch(run); return; }
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      trace('synthesis-unavailable', run); finish(run, 'synthesis-unavailable'); return;
    }
    status('Listen to the app cue. Then say ready when prompted.');
    const utterance = new SpeechSynthesisUtterance('Your turn');
    utterance.lang = 'en-US'; run.utterance = utterance;
    utterance.onend = () => {
      if (current !== run || run.cancelled) return;
      utterance.onend = utterance.onerror = null;
      trace('cue-end', run); launch(run);
    };
    utterance.onerror = () => { if (current === run) cancel('cue-error'); };
    run.cueTimer = setTimeout(() => { if (current === run) cancel('cue-timeout'); }, 10000);
    try { trace('cue-requested', run); window.speechSynthesis.speak(utterance); }
    catch (_) { cancel('cue-threw'); }
  };
  $('mode').onchange = () => { $('description').textContent = descriptions[$('mode').value]; trace('mode-selected'); };
  $('cancel').onclick = () => cancel();
  $('download').onclick = () => {
    const payload = {format: 1, implementation: 'isolated-microphone-lab-1',
      environment: {ios: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), chromeIOS: /CriOS/.test(navigator.userAgent)},
      attempts: attempts.map(r => ({id: r.id, mode: r.mode, results: r.results, cancelled: !!r.cancelled})), events};
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'fact-flight-microphone-lab.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel('page-hidden'); });
  window.addEventListener('pagehide', () => cancel('page-exit'));
  controls();
  if (!Speech || !window.isSecureContext) status('Speech recognition requires a supported browser and HTTPS or localhost.');
})();
