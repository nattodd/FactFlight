// Isolated actual-app navigation with synthetic learner/Guest data only.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),registry=require('../scripts/activity-registry.js'),math=require('../scripts/math-activities.js');
assert.deepEqual(registry.activityOrder.slice().sort(),Object.keys(math.activities).sort());assert.equal(registry.activityOrder.length,8);
const server=http.createServer((req,res)=>{const rel=req.url==='/'?'index.html':req.url.slice(1);if(!/^(index\.html|scripts\/[\w-]+\.js|styles\/[\w-]+\.css|assets\/brand\/[\w-]+\.svg)$/.test(rel)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',rel.endsWith('.js')?'application/javascript':rel.endsWith('.css')?'text/css':rel.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,rel)))});

let browser;const errors=[];
async function framed(p,results=false){await p.waitForFunction(results=>{const v=document.querySelector(results?'#resultsView':'#menuView'),a=v.querySelector(results?'.eyebrow':'.hero')||v.querySelector('h1');return a&&Math.abs(a.getBoundingClientRect().top-12)<2},results);if(!results)assert(await p.locator('#menuView .bottom-actions').evaluate(bar=>{const back=bar.querySelector('.back'),next=bar.querySelector('.primary'),summary=bar.querySelector('.action-summary');if(!back)return true;const b=back.getBoundingClientRect();if(next){const n=next.getBoundingClientRect();const ok=b.left<n.left&&Math.abs(b.top-n.top)<1&&Math.abs(b.bottom-n.bottom)<1;if(!ok)throw Error(JSON.stringify({screen:document.querySelector('#menuView').dataset.screen,back:b.toJSON(),next:n.toJSON(),backStyle:getComputedStyle(back).cssText,margin:getComputedStyle(next).margin,align:getComputedStyle(bar).alignItems}));return ok}return !summary||b.left<=summary.getBoundingClientRect().left}),'Back must be left and align vertically with Continue/Start')}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({channel:'chrome',headless:true});
 for(const width of [320,390,844]){
  const c=await browser.newContext({viewport:{width,height:width===844?390:760}}),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}`);await p.locator('[data-learner="guest"]').click();
  await p.locator('[data-math]').click();await framed(p);await p.locator('[data-operations]').click();await framed(p);
  for(const activity of registry.activityOrder){
   await p.locator(`[data-activity="${activity}"]`).click();await framed(p);
   for(const mode of ['quick','free','timed','test']){
    await p.locator(`[data-mode="${mode}"]`).click();await framed(p);await p.locator('[data-level="4"]').click();await p.locator('[data-next]').click();await framed(p);
    await p.locator('[data-back]').click();assert.equal(await p.evaluate(()=>document.activeElement.hasAttribute('data-next')),true);
    await p.locator('[data-back]').click();assert.equal(await p.evaluate(()=>document.activeElement.dataset.mode),mode);
   }
   await p.locator('[data-back]').click();assert.equal(await p.evaluate(()=>document.activeElement.dataset.activity),activity);
  }
  await p.locator('[data-activity="doubles"]').click();await p.locator('[data-mode="quick"]').click();await p.locator('[data-next]').click();await p.locator('[data-input="keypad"]').click();await p.locator('[data-view="focus"]').click();await p.locator('[data-start]').click();
  for(const label of ['Double 20','Double 39','Double 443','Half of 1998','999 + 99','999 − 99','99 × 12','1188 ÷ 12','900 + ? = 1000']){
   await p.evaluate(label=>{items[index].text=label;renderFocus()},label);
   assert(await p.locator('#focusEquation').evaluate(e=>{const r=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(e);const t=range.getBoundingClientRect();return e.scrollWidth<=e.clientWidth+1&&r.left>=p.left&&r.right<=p.right&&t.left>=r.left-1&&t.right<=r.right+1}),label);
   if(width===390&&label==='Double 39'&&process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,'focus-double-39.png')});
  }
  await p.locator('#end').click();await framed(p,true);
  if(width===390&&process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,'results-framed.png')});
  await p.locator('#resultHome').click();await p.locator('[data-math]').click();await p.locator('[data-operations]').click();await p.locator('[data-activity="halves"]').click();await framed(p);
  if(width===390&&process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,'halves-mode-framed.png')});
  await c.close();console.log(`PASS all eight activities, four modes, settings/ready/Back, results and long questions at ${width}px`);
 }
 assert.deepEqual(errors,[]);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
