// Actual app in isolated Chrome contexts. Synthetic records only; no real speech.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const fixtures=require('./progress-fixtures.cjs'),root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const rel=req.url==='/'?'index.html':req.url.slice(1);if(!/^(index\.html|scripts\/[\w-]+\.js|styles\/[\w-]+\.css|assets\/brand\/[\w-]+\.svg)$/.test(rel)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',rel.endsWith('.js')?'application/javascript':rel.endsWith('.css')?'text/css':rel.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,rel)))});
let browser;const errors=[];
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({channel:'chrome',headless:true});
 for(const width of [320,390,1440]){
  const c=await browser.newContext({viewport:{width,height:width===1440?1000:844}}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}`);
  await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill('Demo learner');await p.locator('#profileForm button').click();await p.locator('[data-quick]').waitFor();
  const id=await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).profiles[0].id),rows=fixtures(id);
  await p.evaluate(rows=>{const d=JSON.parse(localStorage.getItem('fact-flight-family-v1'));d.sessions=rows;localStorage.setItem('fact-flight-family-v1',JSON.stringify(d))},rows);
  await p.reload();await p.locator('[data-learner]:not([data-learner=guest])').click();const before=await p.evaluate(()=>JSON.stringify({...localStorage}));await p.locator('#historyNav').click();
  assert.equal(await p.locator('#pdMastery').getAttribute('open'),null);assert.equal(await p.locator('#pdResults').getAttribute('open'),null);
  assert.deepEqual(await p.locator('.pd-card strong').allTextContents(),['10','60','1m 48s']);
  const boxes=await p.locator('.pd-card').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top));assert.equal(new Set(boxes).size,1);
  if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`progress-dashboard-${width}.png`),fullPage:true});
  for(const theme of ['light','dark']){
   await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   const styles=await p.locator('#pdMastery>summary,#pdResults>summary').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return [s.backgroundColor,s.color,s.fontSize,s.padding,s.minHeight]}));assert.deepEqual(styles[0],styles[1]);
   if(process.env.FF_TEST_OUTPUT)await p.locator('.progress-dashboard').screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`progress-warm-${theme}-${width}.png`)});
  }
  await p.evaluate(()=>document.documentElement.dataset.theme='light');

  await p.locator('#pdMastery>summary').focus();await p.keyboard.press('Enter');await p.locator('#pdMastery-squares').waitFor();
  assert((await p.locator('#pdReady-squares-2>summary').textContent()).includes('Mastered'));assert(!(await p.locator('#pdReady-addition-2>summary').textContent()).includes('Mastered'));
  assert((await p.locator('#pdMastery-subtraction>summary').textContent()).includes('Needs work'));
  const dimensions=await p.locator('#pdMasteryContent>.pd-grid>details>summary').evaluateAll(es=>es.map(e=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height]));assert(dimensions.every(x=>x[0]===dimensions[0][0]&&x[1]===dimensions[0][1]));
  await p.locator('#pdMastery-addition>summary').click();
  assert(await p.locator('#pdMastery-addition').evaluate(e=>Math.abs(e.getBoundingClientRect().width-e.parentElement.getBoundingClientRect().width)<1));
  await p.locator('#pdReady-addition-2>summary').click();await p.locator('#pdReady-addition-2Next>summary').click();
  const guidance=await p.locator('#pdReady-addition-2Next').innerText();assert(guidance.includes('Finish 2 more practice flights. Five-question flights count too.'));assert(guidance.includes('Practise 9 more different facts'));assert(!guidance.includes('outer window'));
  assert.equal(await p.locator('#pdReady-addition-2Calculation').getAttribute('open'),null);
  await p.locator('#pdMastery-addition>summary').click();
  if(width>600)assert(await p.locator('#pdMastery-addition').evaluate(e=>e.getBoundingClientRect().width<e.parentElement.getBoundingClientRect().width*.6));
  if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`progress-mastery-${width}.png`),fullPage:true});await p.locator('#pdMastery-squares>summary').click();await p.locator('#pdReady-squares-2>summary').click();assert((await p.locator('#pdReady-squares-2').textContent()).includes('29'));await p.locator('[data-collapse="pdReady-squares-2"]').click();assert.equal(await p.locator('#pdReady-squares-2>summary').evaluate(e=>document.activeElement===e),true);
  await p.locator('[data-collapse="pdMastery"]').click();await p.locator('#pdResults>summary').click();
  assert.equal(await p.locator('.pd-card').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 249, 230)');
  assert(await p.locator('.pd-metrics>div').evaluateAll(es=>es.every(e=>getComputedStyle(e).borderTopWidth==='1px')));
  if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`progress-results-light-${width}.png`),fullPage:true});
  await p.locator('#pdResults-multiplication>summary').click();assert(await p.locator('#pdResults-multiplication').evaluate(e=>Math.abs(e.getBoundingClientRect().width-e.parentElement.getBoundingClientRect().width)<1));await p.locator('#pdTables>summary').click();assert.equal(await p.locator('#pdTables>.pd-body>details').count(),13);await p.locator('#pdHigher>summary').click();assert((await p.locator('#pdHigher').textContent()).includes('16 times table'));assert(!(await p.locator('#pdHigher').textContent()).includes('Mastered'));
  await p.locator('#pdTableWindow').selectOption('recent');assert((await p.locator('#pdTables').textContent()).includes('1 eligible flights'));await p.locator('#pdActivity').selectOption('squares');assert.deepEqual(await p.locator('.pd-card strong').allTextContents(),['6','29','45s']);assert((await p.locator('#pdReady-squares-2>summary').textContent()).includes('Mastered'));
  const dl=p.waitForEvent('download');await p.locator('#exportAll').click();const backup=JSON.parse(fs.readFileSync(await(await dl).path(),'utf8'));assert.deepEqual(backup.sessions.slice().sort((a,b)=>a.id.localeCompare(b.id)),rows);assert.equal(backup.version,1);
  const csv=p.waitForEvent('download');await p.locator('#exportCSV').click();const csvText=fs.readFileSync(await(await csv).path(),'utf8');assert(csvText.includes(rows[0].id));assert(!csvText.includes(rows[6].id));
  await p.locator('#pdLogs>summary').click();assert.equal(await p.locator('[data-flight]').count(),6);await p.locator('[data-flight]').first().click();assert(await p.locator('#resultsView').isVisible());await p.locator('#seeProgress').click();assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage})),before);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.evaluate(()=>document.documentElement.dataset.theme='dark');await p.locator('#pdResults>summary').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`progress-results-dark-${width}.png`),fullPage:true});await p.evaluate(()=>document.documentElement.dataset.theme='light');
  await p.locator('#homeNav').click();await p.locator('[data-change-learner]').click();await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill('Other demo');await p.locator('#profileForm button').click();await p.locator('#historyNav').click();assert.deepEqual(await p.locator('.pd-card strong').allTextContents(),['0','0','0s']);
  await p.locator('#homeNav').click();await p.locator('[data-change-learner]').click();await p.locator('[data-learner=guest]').click();await p.locator('#historyNav').click();assert.equal(await p.locator('#exportAll,#exportCSV').count(),0);assert((await p.locator('#pdBackupNote').textContent()).includes('clear on reload'));
  await c.close();console.log(`PASS dashboard ${width}: summaries, readiness, coverage, keyboard, equal cards, collapse focus, higher factors, filtering, exports, history, learner/Guest isolation, no storage writes`);
 }
 assert.deepEqual(errors,[]);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
