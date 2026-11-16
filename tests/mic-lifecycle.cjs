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


async function finish(p){await p.locator('#end').click();await p.waitForFunction(()=>document.querySelector('#profileSaveStatus').textContent.startsWith('Saved'))}
async function home(p){await p.locator('#resultHome').click()}
async function download(p,selector){const pending=p.waitForEvent('download');await p.locator(selector).click();return JSON.parse(fs.readFileSync(await (await pending).path(),'utf8'))}

const ios={viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 CriOS/140 Mobile/15E148 Safari/604.1'};
async function setup(){
 const [c,p]=await page(ios);await p.clock.install();await p.clock.pauseAt(new Date());
 await p.evaluate(()=>{window.instances=[];window.abortEnds=true;window.SpeechRecognition=class{
  constructor(){this.starts=0;instances.push(this);window.testRecognition=this}
  start(){this.starts++;this.onstart?.()}
  abort(){this.aborted=true;if(abortEnds)setTimeout(()=>this.onend?.(),50)}
 }});await choose(p,{input:'voice'});return [c,p];
}
async function ready(p){await p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;testRecognition.onresult({resultIndex:0,results:[r]})})}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,channel:'chrome'});
 await test('Manual reconnect waits for end plus cooldown and uses a fresh recognizer',async()=>{
  const [c,p]=await setup();await p.locator('#retryMic').click();assert.equal(await p.evaluate(()=>instances.length),1);
  await p.clock.runFor(449);assert.equal(await p.evaluate(()=>instances.length),1);
  await p.clock.runFor(1);assert.equal(await p.evaluate(()=>instances.length),2);assert(await p.evaluate(()=>instances.every(r=>r.starts===1)));
  await ready(p);assert.equal(await p.evaluate(()=>phase),'running');await c.close();
 });
 await test('Manual retry during a natural-end cooldown cannot bypass the delay',async()=>{
  const [c,p]=await setup();await p.evaluate(()=>{const late=testRecognition.onresult;testRecognition.onend();const r=[{transcript:'ready'}];r.isFinal=true;late({resultIndex:0,results:[r]})});assert.equal(await p.evaluate(()=>phase),'checking');await p.locator('#retryMic').click();await p.clock.runFor(399);assert.equal(await p.evaluate(()=>instances.length),1);await p.clock.runFor(1);assert.equal(await p.evaluate(()=>instances.length),2);await p.clock.runFor(1100);assert.equal(await p.evaluate(()=>instances.length),2);await c.close();
 });
 await test('Automatic end reconnect creates fresh objects and remains bounded',async()=>{
  const [c,p]=await setup();await ready(p);
  for(let i=0;i<12;i++){await p.evaluate(()=>testRecognition.onend());await p.clock.runFor(1500)}
  assert.equal(await p.evaluate(()=>instances.length),13);assert(await p.evaluate(()=>instances.every(r=>r.starts===1)));
  await p.evaluate(()=>testRecognition.onend());await p.clock.runFor(5000);assert.equal(await p.evaluate(()=>instances.length),13);assert.equal(await p.evaluate(()=>micState),'disconnected');await c.close();
 });
 await test('Silent ready startup stops after five seconds and requires a fresh tap',async()=>{
  const [c,p]=await setup();assert.equal(await p.evaluate(()=>micState),'waiting');
  await p.clock.runFor(4999);assert.equal(await p.evaluate(()=>micState),'waiting');
  await p.clock.runFor(1);assert.equal(await p.evaluate(()=>phase),'checking');assert.equal(await p.evaluate(()=>micState),'disconnected');assert.equal(await p.evaluate(()=>session),null);
  await p.clock.runFor(20000);assert.equal(await p.evaluate(()=>instances.length),1);
  await p.locator('#retryMic').click();await ready(p);assert.equal(await p.evaluate(()=>phase),'running');await c.close();
 });
 await test('Natural end in ready check stops without automatic retries',async()=>{
  const [c,p]=await setup();await p.evaluate(()=>testRecognition.onend());await p.clock.runFor(20000);assert.equal(await p.evaluate(()=>instances.length),1);assert.equal(await p.evaluate(()=>phase),'checking');assert.equal(await p.evaluate(()=>micState),'disconnected');await c.close();
 });
 await test('Speech detection cancels startup watchdog and thinking time never restarts a flight',async()=>{
  const [c,p]=await setup();await p.evaluate(()=>testRecognition.onspeechstart());await p.clock.runFor(10000);assert.equal(await p.evaluate(()=>instances.length),1);
  await ready(p);await p.clock.runFor(20000);assert.equal(await p.evaluate(()=>instances.length),1);assert.equal(await p.evaluate(()=>phase),'running');await c.close();
 });
 await test('Cancel during shutdown invalidates pending launch and late callbacks',async()=>{
  const [c,p]=await setup();await p.evaluate(()=>{window.lateResult=testRecognition.onresult;window.lateStart=testRecognition.onstart});
  await p.locator('#retryMic').click();await p.locator('#cancelMic').click();await p.clock.runFor(1000);
  await p.evaluate(()=>{lateStart();const r=[{transcript:'ready'}];r.isFinal=true;lateResult({resultIndex:0,results:[r]})});
  assert.equal(await p.evaluate(()=>instances.length),1);assert.equal(await p.evaluate(()=>phase),'idle');assert.equal(await p.evaluate(()=>session),null);await c.close();
 });
 await test('Missing shutdown confirmation blocks overlap; late end permits a later manual retry',async()=>{
  const [c,p]=await setup();await p.evaluate(()=>abortEnds=false);await p.locator('#retryMic').click();await p.clock.runFor(3000);
  assert.equal(await p.evaluate(()=>instances.length),1);assert((await p.locator('#micMessage').innerText()).includes('not confirmed'));
  await p.locator('#retryMic').click();assert.equal(await p.evaluate(()=>instances.length),1);
  await p.evaluate(()=>instances[0].onend());await p.clock.runFor(400);await p.locator('#retryMic').click();assert.equal(await p.evaluate(()=>instances.length),2);await ready(p);assert.equal(await p.evaluate(()=>phase),'running');await c.close();
 });
 await test('Repeated taps launch only the latest request; permission failures never auto-loop',async()=>{
  const [c,p]=await setup();await p.locator('#retryMic').click();await p.locator('#retryMic').click();await p.clock.runFor(450);assert.equal(await p.evaluate(()=>instances.length),2);
  await p.evaluate(()=>{testRecognition.onerror({error:'not-allowed'});testRecognition.onend()});await p.clock.runFor(30000);assert.equal(await p.evaluate(()=>instances.length),2);assert.equal(await p.evaluate(()=>phase),'checking');await c.close();
 });
 await test('Five completed voice flights stop and restart without rewriting earlier results',async()=>{
  const [c,p]=await setup();const ids=[];
  for(let i=0;i<5;i++){
   await ready(p);ids.push(await p.evaluate(()=>session.id));
   for(let k=1;k<=5;k++){
    await p.evaluate(k=>{const r=[{transcript:String(items[index].answer)}];r.isFinal=true;testRecognition.onresult({resultIndex:k,results:Array(k+1).fill(r)})},k);
    await p.clock.runFor(400);
   }
   await p.waitForFunction(()=>document.querySelector('#profileSaveStatus')?.textContent.startsWith('Saved'));
   assert.equal(await p.evaluate(()=>phase),'done');assert(await p.evaluate(()=>session.items.every(first)));
   assert.equal(await p.evaluate(()=>rec),null);
   if(i<4){await p.locator('#again').click();await p.clock.runFor(450);assert.equal(await p.evaluate(()=>phase),'checking')}
  }
  assert.equal(new Set(ids).size,5);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length),5);assert(await p.evaluate(()=>instances.every(r=>r.starts===1&&r.aborted)));await c.close();
 });
 await test('Diagnostic export contains bounded event metadata but no speech or learner data',async()=>{
  const [c,p]=await setup();
  await p.evaluate(()=>{testRecognition.onaudiostart();testRecognition.onsoundstart();testRecognition.onspeechstart();
   for(let i=0;i<210;i++){const r=[{transcript:'private spoken words'}];r.isFinal=false;testRecognition.onresult({resultIndex:0,results:[r]})}
   testRecognition.onerror({error:'private error details'});
  });
  await p.locator('#micDiagnostics summary').click();assert((await p.locator('#micDiagnosticLog').innerText()).includes('result'));
  const pending=p.waitForEvent('download');await p.locator('#downloadMicLog').click();const raw=fs.readFileSync(await (await pending).path(),'utf8'),data=JSON.parse(raw);
  assert.equal(data.events.length,200);assert.equal(data.ios,true);assert.equal(data.events.at(-1).error,'unknown');
  assert(!raw.includes('private'));assert(!raw.includes('Test learner'));assert(!raw.includes('learnerId'));assert(!raw.includes('transcript'));
  assert(data.events.every(e=>Object.keys(e).every(k=>['ms','connection','phase','event','error'].includes(k))));
  await p.reload();assert.equal(await p.evaluate(()=>micEvents.length),0);await c.close();
 });
 await test('Trace distinguishes audio startup from absent recognition on the repeated flight',async()=>{
  const [c,p]=await setup();await p.evaluate(()=>testRecognition.onaudiostart());await ready(p);await finish(p);
  await p.locator('#again').click();await p.clock.runFor(450);await p.evaluate(()=>testRecognition.onaudiostart());await p.clock.runFor(5000);
  const trace=await p.evaluate(()=>micEvents);const started=trace.filter(e=>e.event==='start');assert(started.length>=2);
  const repeat=trace.filter(e=>e.connection===started[1].connection);
  assert(repeat.some(e=>e.event==='audiostart'));assert(repeat.some(e=>e.event==='startup-watchdog'));assert(!repeat.some(e=>e.event==='result'));
  await c.close();
 });
 await test('No browser errors',()=>assert.deepEqual(errors,[]));
 fs.writeFileSync(path.join(output,'mic-lifecycle-results.json'),JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
