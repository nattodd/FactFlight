// Integrated app tests: isolated contexts, synthetic history, no real microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.FF_TEST_OUTPUT||require('node:os').tmpdir();fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const files={'/scripts/profile-store.js':'scripts/profile-store.js','/scripts/profiles.js':'scripts/profiles.js','/scripts/practice-focus.js':'scripts/practice-focus.js','/scripts/practice-reports.js':'scripts/practice-reports.js','/scripts/practice-readiness.js':'scripts/practice-readiness.js','/scripts/progress-dashboard.js':'scripts/progress-dashboard.js','/styles/progress.css':'styles/progress.css','/':'index.html','/scripts/menus.js':'scripts/menus.js','/styles/menus.css':'styles/menus.css','/scripts/math-activities.js':'scripts/math-activities.js','/scripts/activity-registry.js':'scripts/activity-registry.js','/scripts/family-practice.js':'scripts/family-practice.js','/scripts/content-definitions.js':'scripts/content-definitions.js','/scripts/practice-generator.js':'scripts/practice-generator.js','/styles/brand.css':'styles/brand.css','/assets/brand/horizontal.svg':'assets/brand/horizontal.svg'};const f=files[req.url];if(!f){res.writeHead(404);return res.end()}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,f)))});
const results=[],errors=[];let browser,url;
async function test(name,fn){if(process.env.FF_TEST_FILTER&&!name.includes(process.env.FF_TEST_FILTER))return;try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.stack})}console.log(JSON.stringify(results.at(-1)))}
async function page(options={}){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.locator("[data-create-profile]").click();await p.locator("#nickname").fill("Test learner");await p.locator("#profileForm button").click();await p.locator("[data-quick]").waitFor();return [c,p]}

async function choose(p,{activity='addition',mode='quick',view='focus',input='keypad',level=0,count=5,table=2,minutes=2}={}){
 if(await p.locator('[data-learner]').count())await p.locator('[data-learner]:not([data-learner=guest])').first().click();
 await p.locator('#homeNav').click();
 if(mode==='school'){await p.locator('[data-math]').click();await p.locator('[data-school]').click();await p.locator(`[data-table="${table}"]`).click()}
 else {
  await p.locator(mode==='quick'?'[data-quick]':'[data-math]').click();await require('./menu-route.cjs')(p,activity);
  if(mode!=='quick')await p.locator(`[data-mode="${mode}"]`).click();
  await p.locator(`[data-level="${level}"]`).click();if(mode!=='free')await p.locator(`[data-count="${count}"]`).click();
 }
 if(['timed','test'].includes(mode))await p.locator(`[data-minutes="${minutes}"]`).click();
 await p.locator('[data-next]').click();await p.locator(`[data-input="${input}"]`).click();await p.locator(`[data-view="${view}"]`).click();
 await p.locator('[data-start]').click();
}
async function answer(p,value){const field=p.locator(await p.evaluate(()=>activeView==='focus')?'#focusAnswer':'.keyboard-active input');await field.fill(String(value??await p.evaluate(()=>items[index].answer)));await field.press('Enter');await require('./feedback-wait.cjs')(p)}


async function home(p){await p.locator('#end').click();await p.locator('#resultHome').click()}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
 async function openActivity(p,activity){await p.locator('#homeNav').click();await p.locator('[data-math]').click();await require('./menu-route.cjs')(p,activity)}
 async function selected(p,selector){assert.equal(await p.locator(selector).getAttribute('aria-pressed'),'true')}
 await test('Last started activity settings survive Home and reload; selecting the same mode preserves count and timer',async()=>{
  const [c,p]=await page();await choose(p,{activity:'division',mode:'timed',level:3,count:30,minutes:5,view:'worksheet'});await home(p);
  await p.reload();await p.locator('[data-learner]:not([data-learner=guest])').click();await openActivity(p,'division');await selected(p,'[data-mode=timed]');await p.locator('[data-mode=timed]').click();await selected(p,'[data-level="3"]');await selected(p,'[data-count="30"]');await selected(p,'[data-minutes="5"]');await p.locator('[data-next]').click();await selected(p,'[data-view=worksheet]');await selected(p,'[data-input=keypad]');await p.locator('[data-start]').click();assert.deepEqual(await p.evaluate(()=>[session.activity,session.level,items.length,flightTimeLimitMs,activeView]),['division',3,30,300000,'worksheet']);await c.close();
 });
 await test('Activities and learners stay separate; abandoned drafts do not replace started choices',async()=>{
  const [c,p]=await page();await choose(p,{activity:'division',mode:'timed',level:3,count:30,minutes:5});await home(p);await choose(p,{activity:'squares',mode:'free',level:2});await home(p);
  await openActivity(p,'division');await selected(p,'[data-mode=timed]');await p.locator('[data-mode=test]').click();await p.locator('[data-level="4"]').click();await openActivity(p,'division');await selected(p,'[data-mode=timed]');await p.locator('[data-mode=timed]').click();await selected(p,'[data-level="3"]');
  await openActivity(p,'squares');await selected(p,'[data-mode=free]');await p.locator('#homeNav').click();await p.locator('[data-change-learner]').click();await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill('Second');await p.locator('#profileForm button').click();await openActivity(p,'division');await selected(p,'[data-mode=quick]');await p.locator('[data-mode=quick]').click();await selected(p,'[data-level="0"]');await c.close();
 });
 await test('Back preserves draft choices, switching mode clears incompatible goal',async()=>{
  const [c,p]=await page();await choose(p,{activity:'addition',mode:'test',count:60});await home(p);await openActivity(p,'addition');await p.locator('[data-mode=test]').click();await p.locator('[data-level="2"]').click();await p.locator('[data-next]').click();await p.locator('summary').filter({hasText:'Grown-up options'}).click();await p.locator('#target').fill('50');await p.locator('[data-back]').click();await p.locator('[data-back]').click();await p.locator('[data-mode=test]').click();await selected(p,'[data-level="2"]');await p.locator('[data-back]').click();await p.locator('[data-mode=quick]').click();await p.locator('[data-next]').click();assert.equal(await p.locator('#target').inputValue(),'');await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>items.length),5);await c.close();
 });
 await test('Guest general preferences are memory-only and clear on learner change',async()=>{
  const [c,p]=await page();await p.locator('[data-change-learner]').click();await p.locator('[data-learner=guest]').click();const before=await p.evaluate(()=>JSON.stringify({...localStorage}));await choose(p,{activity:'halves',mode:'free',level:2});await home(p);await openActivity(p,'halves');await selected(p,'[data-mode=free]');assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage})),before);await p.locator('#homeNav').click();await p.locator('[data-change-learner]').click();await p.locator('[data-learner=guest]').click();await openActivity(p,'halves');await selected(p,'[data-mode=quick]');await c.close();
 });
 await test('Cancelled voice start does not overwrite the previous started configuration',async()=>{
  const [c,p]=await page();await p.addInitScript(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});await p.reload();await choose(p,{activity:'division',mode:'timed',level:1,count:10});await home(p);await choose(p,{activity:'division',mode:'test',level:3,count:30,input:'voice'});await p.locator('#cancelMic').click();await openActivity(p,'division');await selected(p,'[data-mode=timed]');await p.locator('[data-mode=timed]').click();await selected(p,'[data-level="1"]');await c.close();
 });
 await test('Corrupt preferences fall back; failed saves remain usable and deletion clears preferences',async()=>{
  const [c,p]=await page();await p.evaluate(()=>{const id=JSON.parse(localStorage.getItem('fact-flight-family-v1')).profiles[0].id;localStorage.setItem('fact-flight-practice-v1:'+id+':division',JSON.stringify({version:1,config:{activity:'division',mode:'test',level:99}}))});await openActivity(p,'division');await selected(p,'[data-mode=quick]');await p.evaluate(()=>{const original=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('fact-flight-practice-v1:'))throw Error('quota');return original.call(this,k,v)}});await choose(p,{activity:'division',mode:'timed',count:15});await home(p);assert((await p.locator('#menuView').innerText()).includes('could not be saved'));await openActivity(p,'division');await selected(p,'[data-mode=timed]');await p.locator('#homeNav').click();await p.locator('[data-nav=parents]').click();await p.locator('[data-nav=manageLearners]').click();await p.locator('[data-delete-profile]').click();await p.locator('#confirmDeleteLearner').click();await p.waitForFunction(()=>!Object.keys(localStorage).some(k=>k.startsWith('fact-flight-practice-v1:')));await c.close();
 });
 await test('School Test restores table and view but retains its fixed preset',async()=>{
  const [c,p]=await page();await choose(p,{mode:'school',table:7,view:'focus'});await home(p);await openActivity(p,'multiplication');await selected(p,'[data-school]');await p.locator('[data-school]').click();await selected(p,'[data-table="7"]');await p.locator('[data-next]').click();await selected(p,'[data-view=focus]');await p.locator('[data-start]').click();assert.deepEqual(await p.evaluate(()=>[session.table,items.length,flightTimeLimitMs]),[7,60,120000]);await c.close();
 });
 for(const [width,height] of [[320,568],[390,844]])await test(`Selected mode remains visible at ${width}x${height}`,async()=>{
  const [c,p]=await page({viewport:{width,height}});await choose(p,{activity:'division',mode:'timed',count:10});await home(p);await openActivity(p,'division');await selected(p,'[data-mode=timed]');assert.equal(await p.locator('.modes .selected').count(),1);assert.equal(await p.locator('.modes .selected').evaluate(el=>getComputedStyle(el).position),'relative');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(output,`setup-mode-${width}.png`),fullPage:true});await c.close();
 });
 await test('No page errors',()=>assert.deepEqual(errors,[]));fs.writeFileSync(path.join(output,'setup-results.json'),JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
