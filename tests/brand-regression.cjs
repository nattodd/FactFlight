// Run with NODE_PATH pointing to a separately installed Playwright package.
// Uses isolated browser contexts and synthetic records only; no user browser data.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const output = process.env.FF_TEST_OUTPUT || path.join(require('node:os').tmpdir(), 'factflight-test-results');
fs.mkdirSync(output, { recursive: true });
const results = [], errors = [], external = [];
const test = async (name, fn) => {
  try { await fn(); results.push({ name, status: 'PASS' }); }
  catch (e) { results.push({ name, status: 'FAIL', error: e.message }); }
  console.log(JSON.stringify(results.at(-1)));
};
const server = http.createServer((req, res) => {
  const files = { '/scripts/math-activities.js': 'scripts/math-activities.js', '/': 'index.html', '/styles/brand.css': 'styles/brand.css', '/assets/brand/horizontal.svg': 'assets/brand/horizontal.svg' };
  const file = files[req.url];
  if (!file) { res.writeHead(404); return res.end(); }
  res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : file.endsWith('.svg') ? 'image/svg+xml' : 'text/html');
  res.end(fs.readFileSync(path.join(root, file)));
});
let browser;
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, ...(process.env.FF_CHROME_CHANNEL ? { channel: process.env.FF_CHROME_CHANNEL } : {}) });
  console.log('Browser:', browser.version());
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light', acceptDownloads: true });
  const p = await ctx.newPage();
  p.on('pageerror', e => errors.push(e.message));
  p.on('request', r => { if (!r.url().startsWith(url)) external.push(r.url()); });
  await p.goto(url);
  const start = async (mode = 'test') => {
    await p.locator('#practiceNav').click();
    await p.locator(mode === 'test' ? '#testMode' : '#practiceMode').click();
    await p.locator('#inputMode').selectOption('keyboard');
    await p.locator('#start').click();
  };
  const answer = async (wrong = false) => {
    const value = await p.evaluate(() => items[index].answer);
    await p.locator('.keyboard-active input').fill(String(wrong ? 999 : value));
    await p.locator('.keyboard-active input').press('Enter');
  };
  await test('Logo loaded, no remote requests, theme toggle and reload', async () => {
    assert(await p.locator('.brand-art').evaluate(e => e.complete && e.naturalWidth > 0));
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'light');
    await p.screenshot({ path: path.join(output, 'desktop-light.png'), fullPage: true });
    await p.locator('#theme').click();
    await p.reload();
    assert.equal(await p.locator('html').getAttribute('data-theme'), 'dark');
    await p.screenshot({ path: path.join(output, 'desktop-dark.png'), fullPage: true });
    assert.deepEqual(external, []);
  });
  await test('School Test generation: 60 questions, three columns, factors and spacing', async () => {
    await start();
    assert.equal(await p.locator('#grid .column').count(), 3);
    assert.equal(await p.locator('#grid .fact').count(), 60);
    assert(await p.evaluate(() => {
      for (let t = 2; t <= 10; t++) for (let run = 0; run < 20; run++) {
        const list = generate(t);
        if (list.length !== 60) return false;
        for (let f = 1; f <= 10; f++) if (list.filter(p => p.factor === f).length !== 6) return false;
        if (list.some((p, i) => p.answer !== p.a * p.b || list.slice(Math.max(0, i - 3), i).some(q => q.factor === p.factor))) return false;
      }
      return true;
    }));
  });
  await test('Keyboard scoring, correction, skip, undo and non-color symbols', async () => {
    await answer();
    await answer(true); await answer();
    await p.locator('#skip').click();
    assert.deepEqual(await p.evaluate(() => [stats({items}).first, stats({items}).correct, stats({items}).errors, stats({items}).skips]), [1, 2, 1, 1]);
    await p.locator('#undo').click();
    assert.equal(await p.evaluate(() => stats({items}).skips), 0);
    await answer();
    assert.equal(await p.evaluate(() => stats({items}).first), 2);
    assert((await p.locator('#fact0 .value').evaluate(e => getComputedStyle(e, '::before').content)).includes('✓'));
    await p.locator('#end').click();
    assert(await p.locator('#resultsView').isVisible());
    assert(await p.evaluate(() => history[0].items.some(p => p.ms > 0)));
  });
  let saved;
  await test('Detailed results, JSON/CSV export and history persistence', async () => {
    saved = await p.evaluate(() => localStorage.getItem(KEY));
    const download = async selector => {
      const wait = p.waitForEvent('download'); await p.locator(selector).click();
      return fs.readFileSync(await (await wait).path(), 'utf8');
    };
    assert.equal(JSON.parse(await download('#exportOne')).items.length, 60);
    await p.locator('#seeProgress').click();
    assert.equal(JSON.parse(await download('#exportAll')).length, 1);
    const csv = await download('#exportCSV');
    assert(csv.includes('recognized') && csv.includes('999'));
    assert((await p.locator('#historyView').innerText()).includes('Facts to focus on'));
    await p.reload();
    assert.equal(await p.evaluate(() => localStorage.getItem(KEY)), saved);
    await p.locator('#historyNav').click();
    await p.locator('[data-review="0"]').click();
    assert(await p.locator('#resultsView').isVisible());
  });
  await test('Untimed completion and preservation of existing synthetic history', async () => {
    await start('practice');
    for (let i = 0; i < 60; i++) await answer();
    assert.equal(await p.evaluate(() => history[0].reason), 'complete');
    assert.equal(await p.evaluate(() => stats(history[0]).first), 60);
    assert.deepEqual(await p.evaluate(() => history[1]), JSON.parse(saved)[0]);
    await p.reload();
    assert.equal(await p.evaluate(() => history.length), 2);
  });
  await test('Timed expiry at two minutes using simulated clock', async () => {
    await p.clock.install(); await start();
    await p.clock.fastForward(120100);
    assert.equal(await p.evaluate(() => history[0].reason), 'time');
    assert.equal(await p.evaluate(() => history[0].elapsed), 120000);
    assert.equal(await p.locator('#clock').innerText(), '0:00');
  });
  await test('Speech unavailable: cancel setup and use keyboard fallback', async () => {
    const c = await browser.newContext(); const q = await c.newPage();
    await q.addInitScript(() => { window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined; });
    await q.goto(url); await q.locator('#start').click();
    assert((await q.locator('#micMessage').innerText()).includes('unavailable'));
    await q.locator('#cancelMic').click();
    await q.locator('#inputMode').selectOption('keyboard'); await q.locator('#start').click();
    assert.equal(await q.evaluate(() => phase), 'running');
    await c.close();
  });
  await test('Speech ready gate, duplicate protection and reconnect with mocked recognition', async () => {
    const c = await browser.newContext(); const q = await c.newPage();
    await q.addInitScript(() => {
      window.SpeechRecognition = class {
        constructor() { window.testRecognition = this; }
        start() { this.onstart?.(); }
        abort() {}
      };
    });
    await q.goto(url); await q.locator('#start').click();
    assert.equal(await q.evaluate(() => phase), 'checking');
    assert.equal(await q.locator('#clock').innerText(), '2:00');
    const say = text => q.evaluate(text => {
      const result = [{transcript:text}]; result.isFinal = true;
      testRecognition.onresult({ resultIndex: 0, results: [result] });
    }, text);
    await say('ready'); assert.equal(await q.evaluate(() => phase), 'running');
    await q.locator('#resume').click();
    await say(String(await q.evaluate(() => items[index].answer)));
    const firstIndex = await q.evaluate(() => index);
    await say('99'); assert.equal(await q.evaluate(() => index), firstIndex);
    await q.locator('#resume').click();
    assert.equal(await q.locator('#micStatus').getAttribute('data-state'), 'connected');
    await q.locator('#end').click(); await c.close();
  });
  for (const [w, h, touch] of [[320,568,true],[390,844,true],[844,390,true],[768,1024,true],[1024,768,true],[1440,900,false]]) {
    await test(`Layout and answer controls ${w}x${h} touch=${touch}`, async () => {
      const c = await browser.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:touch,reducedMotion:'reduce'});
      const q = await c.newPage(); q.on('pageerror', e => errors.push(e.message));
      await q.goto(url);
      assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow before session');
      await q.locator('#inputMode').selectOption('keyboard'); await q.locator('#start').click();
      assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page overflow during session');
      if (w <= 680 && touch) {
        assert(await q.locator('#mobileKeypad').isVisible());
        const n = String(await q.evaluate(() => items[index].answer));
        for (const digit of n) await q.locator(`[data-digit="${digit}"]`).click();
        await q.locator('[data-action="delete"]').click();
        await q.locator(`[data-digit="${n.at(-1)}"]`).click();
        await q.locator('[data-action="enter"]').click();
        assert.equal(await q.evaluate(() => stats({items}).first),1);
        const row = await q.locator('.fact.active').boundingBox();
        const pad = await q.locator('#mobileKeypad').boundingBox();
        assert(row.y >= 0 && row.y + row.height <= pad.y, 'active fact obscured by keypad');
      } else assert(await q.locator('.keyboard-active input').isVisible());
      await q.screenshot({path:path.join(output,`worksheet-${w}x${h}.png`),fullPage:true});
      await c.close();
    });
  }
  await test('No uncaught page errors', async () => assert.deepEqual(errors, []));
  await test('Light/dark semantic text, control and focus contrast', async () => {
    const c = await browser.newContext(); const q = await c.newPage(); await q.goto(url);
    for (const theme of ['light', 'dark']) {
      const checks = await q.evaluate(theme => {
        document.documentElement.dataset.theme = theme;
        const css = getComputedStyle(document.documentElement);
        const color = token => {
          const probe = document.createElement('span'); probe.style.color = `var(${token})`; document.body.append(probe);
          const rgb = getComputedStyle(probe).color.match(/[\d.]+/g).slice(0,3).map(Number); probe.remove();
          return rgb.map(v => {v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;}).reduce((n,v,i) => n + v * [.2126,.7152,.0722][i],0);
        };
        const pairs = [['--ink','--card',4.5],['--muted','--card',4.5],['--muted','--bg',4.5],['--accent','--card',4.5],['--primary-text','--primary-bg',4.5],['--red','--redbg',4.5],['--green','--greenbg',4.5],['--control-line','--card',3],['--control-line','--bg',3],['--focus-ring','--card',3],['--focus-ring','--bg',3],['--focus-ring','--active',3]];
        return pairs.map(([fg,bg,min]) => {const a=color(fg),b=color(bg); return {fg,bg,min,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});
      },theme);
      for(const check of checks) assert(check.ratio >= check.min, `${theme} ${check.fg}/${check.bg}: ${check.ratio.toFixed(2)}`);
    }
    await c.close();
  });
  await test('Keyboard focus indicator, enlarged-text reflow and reduced motion', async () => {
    const c = await browser.newContext({viewport:{width:640,height:800},reducedMotion:'reduce'}); const q = await c.newPage(); await q.goto(url);
    await q.keyboard.press('Tab');
    assert.equal(await q.evaluate(() => document.activeElement.id), 'practiceNav');
    assert.equal(await q.evaluate(() => getComputedStyle(document.activeElement).outlineWidth), '3px');
    await q.addStyleTag({content:'body{font-size:200%}'});
    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'enlarged-text overflow');
    assert.equal(await q.locator('.primary').evaluate(e => getComputedStyle(e).transitionDuration), '0s');
    await c.close();
  });
  await test('Skipped question is revisited and cannot earn first-try credit', async () => {
    const c = await browser.newContext(); const q = await c.newPage(); await q.goto(url);
    await q.locator('#inputMode').selectOption('keyboard'); await q.locator('#practiceMode').click(); await q.locator('#start').click();
    await q.locator('#skip').click();
    // State-level completion of remaining questions; skip and final answer use UI.
    await q.evaluate(() => {for(let i=0;i<59;i++) submit(items[index].answer,String(items[index].answer),'keyboard');});
    assert.equal(await q.evaluate(() => index),0);
    await q.locator('.keyboard-active input').fill(String(await q.evaluate(() => items[0].answer)));
    await q.locator('.keyboard-active input').press('Enter');
    assert.deepEqual(await q.evaluate(() => [stats(history[0]).first,stats(history[0]).correct,stats(history[0]).skips]),[59,60,1]);
    await c.close();
  });
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({browser:browser.version(),results,errors,external}, null, 2));
  console.log('Artifacts:', output);
  process.exitCode = results.some(r => r.status === 'FAIL') ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => { await browser?.close(); server.close(); });
