// Isolated actual-app navigation with synthetic learner/Guest data only.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),registry=require('../scripts/activity-registry.js'),math=require('../scripts/math-activities.js');
assert.deepEqual(registry.activityOrder.slice().sort(),Object.keys(math.activities).sort());assert.equal(registry.activityOrder.length,8);
const server=http.createServer((req,res)=>{const rel=req.url==='/'?'index.html':req.url.slice(1);if(!/^(index\.html|scripts\/[\w-]+\.js|styles\/[\w-]+\.css|assets\/brand\/[\w-]+\.svg)$/.test(rel)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',rel.endsWith('.js')?'application/javascript':rel.endsWith('.css')?'text/css':rel.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,rel)))});
let browser,url;const errors=[];
async function checkFutureTiles(p){assert(await p.locator('.coming-soon').evaluateAll(es=>es.every(e=>{const s=getComputedStyle(e),b=e.querySelector('.badge');return s.borderTopStyle==='solid'&&Math.abs(e.getBoundingClientRect().bottom-b.getBoundingClientRect().bottom-parseFloat(s.paddingBottom)-parseFloat(s.borderBottomWidth))<1})));}

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({channel:'chrome',headless:true});
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1440,height:1000}]){
  const c=await browser.newContext({viewport}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.locator('[data-learner="guest"]').click();const before=await p.evaluate(()=>JSON.stringify({...localStorage}));
  assert.equal(await p.locator('.tiles .tile:disabled').count(),3);
  for(const theme of ['dark','light']){
   await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);await checkFutureTiles(p);
   assert.equal(await p.locator('.coming-soon .icon svg').count(),2);
   if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`subjects-${theme}-${viewport.width}.png`),fullPage:true});
  }
  await p.locator('[data-math]').click();
  assert.equal(await p.locator('.tiles .tile:disabled').count(),2);
  if(viewport.width<=900){
   assert(await p.locator('#menuView .hero').evaluate(e=>Math.abs(e.getBoundingClientRect().top-12)<2));
   if(viewport.width===390)assert(await p.locator('[data-school]').evaluate(e=>e.getBoundingClientRect().bottom<=document.querySelector('#menuView .bottom-actions').getBoundingClientRect().top-8),'School shortcut must be above the dock on a portrait phone');
  }
  for(const theme of ['light','dark']){
   await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   await checkFutureTiles(p);
   assert(await p.locator('.operations-icon').evaluate(e=>{const r=e.getBoundingClientRect();return [...e.children].every(c=>{const b=c.getBoundingClientRect();return b.left>=r.left&&b.right<=r.right&&b.top>=r.top&&b.bottom<=r.bottom})}));
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`math-${theme}-${viewport.width}.png`),fullPage:false});
  }
  await p.evaluate(()=>document.documentElement.dataset.theme='light');
  assert.equal(await p.locator('[data-operations]').count(),1);assert.equal(await p.locator('[data-school]').count(),1);assert.equal(await p.locator('[data-activity]').count(),0);await p.locator('[data-operations]').click();
  if(viewport.width<=900)assert(await p.locator('#menuView .hero').evaluate(e=>Math.abs(e.getBoundingClientRect().top-12)<2));
  if(viewport.width<=500)assert.equal(await p.locator('[data-activity]').first().evaluate(e=>getComputedStyle(e).minHeight),'190px');
  assert.equal(await p.locator('[data-activity]').count(),8);assert.equal(await p.locator('[data-math-group]').count(),0);
  assert.deepEqual(await p.locator('[data-activity]').evaluateAll(es=>es.map(e=>e.dataset.activity)),registry.activityOrder);
  for(const activity of registry.activityOrder){
   await p.locator(`[data-activity="${activity}"]`).click();assert.equal(await p.locator('[data-mode]').count(),4);await p.locator('[data-back]').click();assert.equal(await p.evaluate(()=>document.activeElement.dataset.activity),activity);assert.equal(await p.locator('[data-activity]').count(),8);
  }
  if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`direct-activities-${viewport.width}.png`),fullPage:true});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await p.locator('[data-math-group],[data-activity]').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)));
  await p.locator('[data-back]').click();assert.equal(await p.evaluate(()=>document.activeElement.hasAttribute('data-operations')),true);await p.locator('[data-back]').click();assert.equal(await p.evaluate(()=>document.activeElement.hasAttribute('data-math')),true);
  await p.locator('[data-quick]').click();assert.equal(await p.locator('[data-activity]').count(),8);assert.equal(await p.locator('[data-operations]').count(),0);await p.locator('[data-activity="squares"]').click();assert.equal(await p.locator('[data-mode]').count(),0);await p.locator('[data-level="2"]').click();await p.locator('[data-next]').click();await p.locator('[data-input="keypad"]').click();await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>session.activity),'squares');await p.locator('#end').click();await p.locator('#resultHome').click();await p.locator('[data-quick-start]').click();assert.equal(await p.evaluate(()=>phase),'running');await p.locator('#end').click();await p.locator('#resultHome').click();
  await p.locator('[data-math]').click();await p.locator('[data-school]').click();await p.locator('[data-table="7"]').click();await p.locator('[data-next]').click();await p.locator('[data-input="keypad"]').click();await p.locator('[data-start]').click();assert.deepEqual(await p.evaluate(()=>[session.table,items.length,flightTimeLimitMs,session.selection]),[7,60,120000,undefined]);await p.locator('#end').click();assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage})),before);
  await c.close();console.log(`PASS direct activity navigation ${viewport.width}×${viewport.height}: registry coverage, hierarchy, Back focus, Quick bypass, School, no Guest persistence`);
 }
 assert.deepEqual(errors,[]);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
