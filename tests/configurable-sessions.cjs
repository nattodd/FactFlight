// Integrated app tests: isolated contexts, synthetic history, no real microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.FF_TEST_OUTPUT||require('node:os').tmpdir();fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const files={'/scripts/profile-store.js':'scripts/profile-store.js','/scripts/profiles.js':'scripts/profiles.js','/':'index.html','/scripts/menus.js':'scripts/menus.js','/styles/menus.css':'styles/menus.css','/scripts/math-activities.js':'scripts/math-activities.js','/styles/brand.css':'styles/brand.css','/assets/brand/horizontal.svg':'assets/brand/horizontal.svg'};const f=files[req.url];if(!f){res.writeHead(404);return res.end()}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,f)))});
const results=[],errors=[];let browser,url;
async function test(name,fn){if(process.env.FF_TEST_FILTER&&!name.includes(process.env.FF_TEST_FILTER))return;try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.stack})}console.log(JSON.stringify(results.at(-1)))}
async function page(options={}){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.locator("[data-create-profile]").click();await p.locator("#nickname").fill("Test learner");await p.locator("#profileForm button").click();await p.locator("[data-quick]").waitFor();return [c,p]}

async function choose(p,{activity='addition',mode='quick',view='focus',input='keypad',level=0,count=5,table=2,minutes=2}={}){
 if(await p.locator('[data-learner]').count())await p.locator('[data-learner]:not([data-learner=guest])').first().click();
 await p.locator('#homeNav').click();
 if(mode==='school'){await p.locator('[data-math]').click();await p.locator('[data-school]').click();await p.locator(`[data-table="${table}"]`).click()}
 else {
  await p.locator(mode==='quick'?'[data-quick]':'[data-math]').click();await p.locator(`[data-activity="${activity}"]`).click();
  if(mode!=='quick')await p.locator(`[data-mode="${mode}"]`).click();
  await p.locator(`[data-level="${level}"]`).click();if(mode!=='free')await p.locator(`[data-count="${count}"]`).click();
 }
 if(['timed','test'].includes(mode))await p.locator(`[data-minutes="${minutes}"]`).click();
 await p.locator('[data-next]').click();await p.locator(`[data-input="${input}"]`).click();await p.locator(`[data-view="${view}"]`).click();
 await p.locator('[data-start]').click();
}
async function answer(p,value){const field=p.locator(await p.evaluate(()=>activeView==='focus')?'#focusAnswer':'.keyboard-active input');await field.fill(String(value??await p.evaluate(()=>items[index].answer)));await field.press('Enter');await require('./feedback-wait.cjs')(p)}

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
 for(const minutes of [1,2,5])await test(`Configured ${minutes}-minute deadlines in both modes and views`,async()=>{
  for(const mode of ['timed','test'])for(const view of ['focus','worksheet']){
   const [c,p]=await page();await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+1000));p.feedbackClock=true;
   await choose(p,{mode,view,minutes,count:10});assert.equal(await p.evaluate(()=>items.length),10);assert.equal(await p.locator('#clock').innerText(),minutes+':00');
   await answer(p,9999);await answer(p);await p.locator('#skip').click();await p.locator('#undo').click();assert.equal(await p.evaluate(()=>index),1);
   await p.evaluate(ms=>{started=performance.now()-ms+100;tick()},minutes*60000);assert.equal(await p.evaluate(()=>phase),'running');await p.clock.runFor(200);
   assert.equal(await p.evaluate(()=>phase),'done');assert.deepEqual(await p.evaluate(()=>[history[0].elapsed,history[0].timeLimitMs,history[0].practiceType,stats(history[0]).correct,stats(history[0]).errors]),[minutes*60000,minutes*60000,mode,1,1]);
   await p.waitForFunction(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length===1);
   const original=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));await p.reload();assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),original);await p.locator('[data-learner]:not([data-learner=guest])').first().click();
   const validation=await p.evaluate(()=>{const data=JSON.parse(localStorage.getItem('fact-flight-family-v1')),backup={format:'fact-flight-learner-export',version:1,exportedAt:new Date().toISOString(),profile:data.profiles[0],sessions:data.sessions};const parsed=FlightProfileStore.parseExport(JSON.stringify(backup));return parsed.sessions[0].timeLimitMs});assert.equal(validation,minutes*60000);
   await c.close();
  }
 });
 await test('All eight activities support custom counts; completion and repeat retain settings',async()=>{
  const [c,p]=await page();for(const activity of ['addition','subtraction','multiplication','division','bonds','doubles','halves','squares']){await choose(p,{activity,mode:'test',count:5,minutes:5,view:'worksheet'});for(let i=0;i<5;i++)await answer(p);assert.equal(await p.evaluate(()=>history[0].reason),'complete');assert.equal(await p.evaluate(()=>stats(history[0]).first),5);await p.locator('#changeOptions').click();assert((await p.locator('.review').innerText()).includes('5 questions · 5 minutes'));await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>items.length),5);await p.locator('#end').click()}
  await c.close();
 });
 await test('Custom deadline preserves final green hold completion and rejects late answers',async()=>{
  for(const late of [false,true]){const [c,p]=await page();await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+1000));p.feedbackClock=true;await choose(p,{mode:'test',count:5,minutes:1});for(let i=0;i<4;i++)await answer(p);await p.evaluate(late=>{started=performance.now()-(late?60000:59900);submit(items[index].answer,String(items[index].answer),'keyboard')},late);await p.clock.runFor(400);assert.equal(await p.evaluate(()=>history[0].reason),late?'time':'complete');assert.equal(await p.evaluate(()=>stats(history[0]).first),late?4:5);await c.close()}
 });
 await test('Voice ready starts chosen clock; School remains fixed after custom session',async()=>{
  const [c,p]=await page();await p.addInitScript(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});await p.reload();await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+1000));p.feedbackClock=true;await choose(p,{mode:'timed',minutes:5,count:30,input:'voice'});await p.clock.runFor(10000);assert.equal(await p.evaluate(()=>phase),'checking');
  await p.locator('#retryMic').click();let n=0;const say=text=>p.evaluate(({text,n})=>{const r=[{transcript:text}];r.isFinal=true;testRecognition.onresult({resultIndex:n,results:Array(n+1).fill(r)})},{text,n:n++});await say('ready');assert.equal(await p.evaluate(()=>flightTimeLimitMs),300000);await say(String(await p.evaluate(()=>items[index].answer)));await p.clock.runFor(400);assert.equal(await p.evaluate(()=>index),1);await p.evaluate(()=>setMicStatus('disconnected'));await p.locator('#micReconnectTop').click();assert.equal(await p.locator('#micStatus').getAttribute('data-state'),'waiting');await p.locator('#end').click();
  await choose(p,{mode:'school',table:7,view:'worksheet'});assert.deepEqual(await p.evaluate(()=>[items.length,flightTimeLimitMs,table,session.practiceType]),[60,120000,7,undefined]);assert.equal(await p.locator('#clock').innerText(),'2:00');await p.clock.runFor(120100);assert.equal(await p.evaluate(()=>history[0].elapsed),120000);await c.close();
 });
 await test('New metadata rejects invalid imports; old exports stay accepted and unchanged',async()=>{
  const [c,p]=await page();await choose(p,{mode:'test',minutes:1});await p.locator('#end').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length===1);
  const result=await p.evaluate(()=>{const data=JSON.parse(localStorage.getItem('fact-flight-family-v1')),b={format:'fact-flight-learner-export',version:1,exportedAt:new Date().toISOString(),profile:data.profiles[0],sessions:data.sessions};let rejected=0;for(const patch of [{timeLimitMs:0},{timeLimitMs:90000},{practiceType:'other'},{practiceType:'free'},{elapsed:60001}]){const copy=structuredClone(b);Object.assign(copy.sessions[0],patch);try{FlightProfileStore.parseExport(JSON.stringify(copy))}catch{rejected++}}delete b.sessions[0].timeLimitMs;delete b.sessions[0].practiceType;const before=JSON.stringify(b);const parsed=FlightProfileStore.parseExport(before);return {rejected,unchanged:JSON.stringify(parsed)===before}});assert.deepEqual(result,{rejected:5,unchanged:true});await c.close();
 });
 for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1440,1000]])await test(`Custom setup layout ${width}x${height}`,async()=>{
  const [c,p]=await page({viewport:{width,height},isMobile:width<1000,hasTouch:width<1000});await p.locator('[data-math]').click();await p.locator('[data-activity=addition]').click();await p.locator('[data-mode=test]').click();assert.equal(await p.locator('[data-count]').count(),6);assert.equal(await p.locator('[data-minutes]').count(),3);await p.locator('[data-count="30"]').click();await p.locator('[data-minutes="5"]').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width===390||width===1440)await p.screenshot({path:path.join(output,`custom-setup-${width}.png`),fullPage:true});await p.locator('[data-next]').click();assert((await p.locator('.review').innerText()).includes('30 questions · 5 minutes'));await p.locator('[data-back]').click();assert.equal(await p.locator('[data-minutes="5"]').getAttribute('aria-pressed'),'true');await c.close();
 });

 await test('All count choices, goal bounds, and JSON restore preserve configuration',async()=>{
  const [c,p]=await page();for(const count of [5,10,15,20,30,60]){await choose(p,{mode:'test',count,minutes:1,view:'worksheet'});assert.equal(await p.evaluate(()=>items.length),count);await p.locator('#end').click()}
  await p.locator('#changeOptions').click();await p.locator('#menuView summary').click();await p.locator('#target').fill('61');await p.locator('[data-start]').click();assert.notEqual(await p.evaluate(()=>phase),'running');await p.locator('#target').fill('60');await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>session.target),60);await p.locator('#end').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length===7);
  const restore=await p.evaluate(async()=>{const data=JSON.parse(localStorage.getItem('fact-flight-family-v1')),backup={format:'fact-flight-learner-export',version:1,exportedAt:new Date().toISOString(),profile:data.profiles[0],sessions:data.sessions};const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)},locks={request:async(name,fn)=>fn()};const store=FlightProfileStore.create(storage,locks);const other=await store.add('Other');const review=store.review(backup);await store.restore(backup,review.fingerprint);const restored=store.read();return {sessions:restored.sessions.length,limit:restored.sessions[0].timeLimitMs,other:restored.profiles.some(p=>p.id===other.id),duplicates:store.review(backup).duplicates}});assert.deepEqual(restore,{sessions:7,limit:60000,other:true,duplicates:7});await c.close();
 });
 await test('No browser errors',()=>assert.deepEqual(errors,[]));fs.writeFileSync(path.join(output,'configurable-results.json'),JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
