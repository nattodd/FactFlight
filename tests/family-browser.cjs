// Real app, isolated Chrome contexts and synthetic learners only.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const rel=req.url==='/'?'index.html':req.url.slice(1);if(!/^(index\.html|scripts\/[\w-]+\.js|styles\/[\w-]+\.css|assets\/brand\/[\w-]+\.svg)$/.test(rel)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',rel.endsWith('.js')?'application/javascript':rel.endsWith('.css')?'text/css':rel.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,rel)))});
let browser,url;const errors=[];
async function page(options={}){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);return [c,p];}
async function create(p){await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill('Synthetic');await p.locator('#profileForm button').click();}
async function choose(p,activity,range,values,mode='quick',start=true){
 await p.locator('#homeNav').click();await p.locator(mode==='quick'?'[data-quick]':'[data-math]').click();await require('./menu-route.cjs')(p,activity);if(mode!=='quick')await p.locator(`[data-mode="${mode}"]`).click();await p.locator('[data-selection="tables"]').click();
 for(const n of await p.locator('[data-fact-table][aria-pressed="true"]').evaluateAll(es=>es.map(e=>e.dataset.factTable)))await p.locator(`[data-fact-table="${n}"]`).click();
 assert(await p.locator('[data-next]').isDisabled());for(const n of values)await p.locator(`[data-fact-table="${n}"]`).click();await p.locator(`[data-family-range="${range}"]`).click();
 assert.equal(await p.evaluate(()=>document.activeElement.dataset.familyRange),String(range));
 if(!start)return;await p.locator('[data-next]').click();await p.locator('[data-input="keypad"]').click();await p.locator('[data-view="focus"]').click();await p.locator('[data-start]').click();
}
async function finish(p){await p.locator('#end').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.some(s=>s.id===session.id));}
async function exported(p){const [d]=await Promise.all([p.waitForEvent('download'),p.locator('#exportOne').click()]);return JSON.parse(fs.readFileSync(await d.path(),'utf8'));}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({channel:'chrome',headless:true});
 for(const activity of ['multiplication','division'])for(const range of [10,12])for(const mode of ['quick','free','timed','test']){
  const [c,p]=await page();await create(p);await choose(p,activity,range,[2,11],mode);
  assert.deepEqual(await p.evaluate(()=>[session.activity,session.schemaVersion,session.selection,session.practiceType]),[activity,4,{type:'families',families:[2,11],range},mode]);
  assert(await p.evaluate(()=>items.every(q=>FactFlightContent.classify(q,FactFlightMath.selectionScope(session.activity,session.selection)).valid)));
  assert((await p.locator('#sheetTitle').textContent()).includes('1–'+range));assert((await p.locator('#sessionScope').textContent()).includes('1–'+range));
  await p.locator('#focusAnswer').fill('9999');await p.locator('#focusAnswer').press('Enter');await finish(p);
  const before=await p.evaluate(()=>JSON.stringify(history));await p.locator('#again').click();assert.equal(await p.evaluate(()=>session.selection.range),range);await finish(p);
  assert((await p.evaluate(()=>JSON.stringify(history))).includes(JSON.parse(before)[0].id));
  await p.locator('#nextTables').click();assert.deepEqual(await p.evaluate(()=>session.selection),{type:'families',families:[3,12],range});await finish(p);assert.equal(await p.locator('#nextTables').count(),0);
  const data=await exported(p);assert.equal(data.sessions.length,3);assert(await p.evaluate(data=>!!FlightProfileStore.parseExport(JSON.stringify(data)),data));
  await p.reload();await p.locator('[data-learner]:not([data-learner="guest"])').click();assert.equal(await p.evaluate(()=>history.length),3);
  if(mode==='quick'){await p.locator('[data-quick-start]').click();assert.deepEqual(await p.evaluate(()=>session.selection),{type:'families',families:[3,12],range});await finish(p);}
  await c.close();console.log(`PASS ${activity} through ${range}, ${mode}: generation, repeat, next boundary, labels, save/export/reload`);
 }
 const [c,p]=await page();await create(p);await choose(p,'division',12,[4]);await p.locator('#focusAnswer').fill('9999');await p.locator('#focusAnswer').press('Enter');await finish(p);
 await p.locator('#reviewMissed').click();await p.locator('[data-review-start]').click();assert.equal(await p.evaluate(()=>session.review.version),2);assert.equal(await p.evaluate(()=>items[0].selection.range),12);await finish(p);const backup=await exported(p);
 const csv=await p.evaluate(()=>{const original=download;let result;download=(name,text)=>result=text;try{exportCSV();return result}finally{download=original}});assert(csv.includes('selected_scope'));assert(csv.includes('Divide by 4 · answers 1–12'));assert(!csv.includes('NaN'));
 const [c2,p2]=await page();await p2.locator('[data-nav="parents"]').click();await p2.locator('[data-nav="manageLearners"]').click();await p2.locator('[data-nav="importLearner"]').click();await p2.locator('#learnerImportFile').setInputFiles({name:'synthetic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});await p2.locator('[data-confirm-import]').click();await p2.waitForFunction(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length===2);await p2.reload();assert.deepEqual(await p2.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions),backup.sessions);await c.close();await c2.close();console.log('PASS new division missed-fact review and full export/import/reload round trip');
 {
  const [c,p]=await page();await p.addInitScript(()=>{window.SpeechRecognition=class {constructor(){window.syntheticRecognition=this}start(){this.onstart?.()}abort(){}}});await p.reload();await create(p);await choose(p,'division',12,[11],'quick',false);await p.locator('[data-next]').click();await p.locator('[data-input="voice"]').click();await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>phase),'checking');
  const say=text=>p.evaluate(text=>{const r=[{transcript:text}];r.isFinal=true;syntheticRecognition.onresult({resultIndex:0,results:[r]})},text);await say('ready');assert.equal(await p.evaluate(()=>session.selection.range),12);assert.equal(await p.evaluate(()=>session.activity),'division');await say('9999');await finish(p);await p.locator('#again').click();assert.equal(await p.evaluate(()=>phase),'checking');await say('ready');assert.deepEqual(await p.evaluate(()=>session.selection),{type:'families',families:[11],range:12});await finish(p);await c.close();console.log('PASS mocked voice ready/repeat preserves new division scope and range');
 }
 for(const width of [320,390,844]){const [c,p]=await page({viewport:{width,height:844}});await create(p);await choose(p,'division',12,[1,11,12],'quick',false);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.equal(await p.locator('[data-fact-table]').count(),12);assert(await p.locator('[data-fact-table]').evaluateAll(es=>es.every(e=>e.getBoundingClientRect().height>=44)));if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`division-families-${width}.png`),fullPage:true});await c.close();}
 assert.deepEqual(errors,[]);console.log('PASS responsive selectors at 320/390/844 px, keyboard focus and no browser errors');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
