/* Isolated diagnostic experiment. No quiz imports, storage, audio recording or uploads. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
  const descriptions = {
    natural: 'Single-phrase recognition. The browser ends the session itself.',
    stop: 'Single-phrase recognition. Request stop after the first final result.',
    cue: 'The app says “Your turn,” then opens single-phrase recognition. Let the browser end it.',
    flight: 'One tap: say ready, then answer five displayed sums. Wait for Listening before each answer. No taps between questions.',
    continuous: 'One short “E” cue per flight, then continuous listening. Say ready once, then five answers. No cues or microphone restarts between questions.',
    shortFlight: 'Mode D sequence with “E” instead of “Your turn” before every phrase. Wait for Listening before ready and each answer.'
  };
  const origin = performance.now(), events = [], attempts = [];
  let current = null, cooling = false, cooldown, flight = null, flightCount = 0, nextFlight = false;
  const prompts = ['Say ready.', '1 + 1 = ?', '1 + 2 = ?', '2 + 2 = ?', '2 + 3 = ?', '3 + 3 = ?'];
  const expected = [['ready'], ['2','two'], ['3','three'], ['4','four'], ['5','five'], ['6','six']];
  const isSingleFlight = mode => ['flight','shortFlight'].includes(mode);
  const isFlight = mode => isSingleFlight(mode) || mode === 'continuous';
  function trace(event, run = current, extra = {}) {
    events.push({ms: Math.round(performance.now() - origin), attempt: run?.id || 0,
      mode: run?.mode || $('mode').value, ...(run?.flightId ? {flight:run.flightId,step:run.step} : {}), event, ...extra});
    if (events.length > 1500) events.shift();
    $('log').textContent = events.slice(-80).map(e => JSON.stringify(e)).join('\n');
  }
  function status(message) { $('status').textContent = message; }
  function controls() {
    $('start').textContent = isFlight($('mode').value) && nextFlight ? 'Next flight' : 'Start attempt';
    $('start').disabled = !Speech || !window.isSecureContext || !!current || cooling;
    $('mode').disabled = !!current || cooling;
    $('cancel').disabled = !current && !flight;
    $('counts').textContent = attempts.length ? Object.keys(descriptions).map(mode => {
      const runs = attempts.filter(r => r.mode === mode);
      return `${({natural:'A',stop:'B',cue:'C',flight:'D',continuous:'E',shortFlight:'F'})[mode]}: ${runs.filter(r => r.results > 0).length}/${runs.length} sessions received results`;
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
      if (isFlight(run.mode) && flight && !run.cancelled && !run.failed && run.accepted) {
        if (isSingleFlight(run.mode) && run.step < 5) {
          cooling = false;
          const next = newRun(run.mode, run.step + 1);
          trace('automatic-next', next); beginRun(next); return;
        }
        trace('flight-completed', run); flight = null; nextFlight = true; cooling = false; controls();
        status('Flight complete: all five answers accepted. Tap Next flight for five more answers, without saying ready again.'); return;
      }
      if (isFlight(run.mode)) { flight = null; nextFlight = false; }
      cooling = false; controls();
      status(isFlight(run.mode) ? 'Flight stopped before completion. Download the log; tap Start attempt to retry from ready.' : `${run.results ? 'Speech results received.' : 'No speech results received.'} Session ended. Tap Start attempt to repeat.`);
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
    if (flight) {
      nextFlight = false;
      flight = null;
      if (!current) { clearTimeout(cooldown); cooling = false; trace(reason); status('Flight cancelled between questions. Microphone is off.'); controls(); return; }
    }
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
    rec.lang = 'en-US'; rec.continuous = run.mode === 'continuous'; rec.interimResults = true;
    const processed = new Set();
    run.handlers = [];
    function on(name, callback) {
      run.handlers.push('on' + name);
      rec['on' + name] = event => { if (current === run) callback(event); };
    }
    on('start', () => {
      trace('start', run);
      if (run.cancelled) return;
      status(isFlight(run.mode) ? `Listening · ${run.step ? 'Question '+run.step+' of 5 · ' : ''}${prompts[run.step]}` : 'Say ready. Waiting for speech results…');
    });
    for (const name of ['audiostart','audioend','soundstart','soundend','speechstart','speechend'])
      on(name, () => trace(name, run));
    on('result', event => {
      if (run.cancelled) { trace('result-after-cancel-ignored', run); return; }
      let final = false;
      for (let i = event.resultIndex; i < event.results.length; i++) final ||= event.results[i].isFinal;
      if (run.mode === 'continuous') {
        if (run.stopRequested || run.failed) return;
        run.results++; trace('result', run, {final}); controls();
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (!event.results[i].isFinal || processed.has(i)) continue;
          processed.add(i);
          const value = String(event.results[i][0]?.transcript || '').toLowerCase().trim().replace(/[.!?,]+$/g, '').trim();
          const accepted = expected[run.step].includes(value);
          trace('answer-checked', run, {accepted});
          if (accepted) run.acceptedCount++;
          if (!accepted || run.step === 5) {
            run.accepted = accepted; run.failed = !accepted; run.stopRequested = true;
            clearTimeout(run.observation);
            status(accepted ? 'All five answers accepted. Releasing microphone…' : 'Expected answer not recognized. Ending this test flight…');
            trace('stop-requested', run); awaitEnd(run);
            try { rec.stop(); } catch (_) { trace('stop-threw', run); }
            return;
          }
          run.step++;
          trace('continuous-next', run);
          status(`Listening · Question ${run.step} of 5 · ${prompts[run.step]}`);
          observe();
        }
        return;
      }
      if (isSingleFlight(run.mode)) {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (!event.results[i].isFinal || run.accepted) continue;
          // Compare transiently; never retain or export the spoken text.
          const value = String(event.results[i][0]?.transcript || '').toLowerCase().trim().replace(/[.!?,]+$/g, '').trim();
          run.accepted = expected[run.step].includes(value);
          trace('answer-checked', run, {accepted:run.accepted});
        }
      }
      run.results++; trace('result', run, {final}); controls();
      status(isSingleFlight(run.mode) && final ? `${run.accepted ? 'Accepted.' : 'Expected answer not recognized.'} Waiting for the browser to end the session…` : 'Speech result received. Waiting for the browser to end the session…');
      if (run.mode === 'stop' && final && !run.stopRequested) {
        run.stopRequested = true; trace('stop-requested', run); awaitEnd(run);
        try { rec.stop(); } catch (_) { trace('stop-threw', run); }
      }
    });
    on('error', event => {
      run.failed = true;
      const allowed = ['no-speech','aborted','audio-capture','network','not-allowed','service-not-allowed','bad-grammar','language-not-supported'];
      trace('error', run, {code: allowed.includes(event.error) ? event.error : 'other'});
      status('Browser reported a recognition error. Waiting for shutdown; Cancel remains available.');
      awaitEnd(run);
    });
    on('end', () => { trace('end', run); finish(run, run.cancelled ? 'cancelled' : 'browser-end'); });
    function observe() {
    clearTimeout(run.observation);
    run.observation = setTimeout(() => {
      if (current !== run || run.cancelled) return;
      trace('observation-20s', run, {receivedResults: run.results > 0});
      status(run.mode === 'continuous' ? `Still waiting · ${prompts[run.step]} You can cancel if recognition is stuck.` : run.results ? 'Results arrived, but the session is still open. You can cancel.' : 'No results after 20 seconds. Still listening; Cancel to release the microphone.');
    }, 20000);
    }
    observe();
    try { trace('start-requested', run); rec.start(); }
    catch (_) { trace('start-threw', run); cancel('start-failed'); }
  }
  function newRun(mode, step = 0) {
    const run = {id: attempts.length + 1, mode, results: 0, handlers: [], acceptedCount:0, ...(isFlight(mode) ? {flightId:flight.id,step} : {})};
    attempts.push(run); current = run; controls(); return run;
  }
  function beginRun(run) {
    status('Opening recognition. Wait for “Say ready.”');
    if (run.mode !== 'cue' && !isFlight(run.mode)) { launch(run); return; }
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      trace('synthesis-unavailable', run); finish(run, 'synthesis-unavailable'); return;
    }
    status(isFlight(run.mode) ? `Preparing · ${prompts[run.step]} Wait for Listening before speaking.` : 'Listen to the app cue. Then say ready when prompted.');
    const utterance = new SpeechSynthesisUtterance(['continuous','shortFlight'].includes(run.mode) ? 'E' : 'Your turn');
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
  }
  $('start').onclick = () => {
    if (current || cooling || !Speech || !window.isSecureContext) return;
    if (isFlight($('mode').value)) flight = {id:++flightCount};
    const run = newRun($('mode').value, isFlight($('mode').value) && nextFlight ? 1 : 0);
    trace('tap-start', run); beginRun(run);
  };
  $('mode').onchange = () => { nextFlight = false; controls(); $('description').textContent = descriptions[$('mode').value]; trace('mode-selected'); };
  $('cancel').onclick = () => cancel();
  $('download').onclick = () => {
    const payload = {format: 1, implementation: 'isolated-microphone-lab-4',
      environment: {ios: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), chromeIOS: /CriOS/.test(navigator.userAgent)},
      attempts: attempts.map(r => ({id: r.id, mode: r.mode, results: r.results, cancelled: !!r.cancelled,
        ...(r.flightId ? {flight:r.flightId,step:r.step,accepted:!!r.accepted} : {}),
        ...(r.mode === 'continuous' ? {acceptedCount:r.acceptedCount} : {})})), events};
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], {type:'application/json'}));
    const a = document.createElement('a'); a.href = url; a.download = 'fact-flight-microphone-lab.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel('page-hidden'); });
  window.addEventListener('pagehide', () => cancel('page-exit'));
  controls();
  if (!Speech || !window.isSecureContext) status('Speech recognition requires a supported browser and HTTPS or localhost.');
})();
