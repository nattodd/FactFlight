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
async function answer(p,value){const field=p.locator(await p.evaluate(()=>activeView==='focus')?'#focusAnswer':'.keyboard-active input'),v=String(value??await p.evaluate(()=>items[index].answer));if(await field.evaluate(e=>e.readOnly)){for(const n of v)await p.locator('[data-focus-digit="'+n+'"]').click();await p.locator('#focusKeys button[type=submit]').click()}else{await field.fill(v);await field.press('Enter')}await require('./feedback-wait.cjs')(p)}


async function finish(p){await p.locator('#end').click();await p.waitForFunction(()=>document.querySelector('#profileSaveStatus').textContent.startsWith('Saved'))}
async function home(p){await p.locator('#resultHome').click()}
async function download(p,selector){const pending=p.waitForEvent('download');await p.locator(selector).click();return JSON.parse(fs.readFileSync(await (await pending).path(),'utf8'))}
async function dock(p,selector){
 await p.waitForFunction(s=>document.querySelector(s)?.classList.contains('is-docked'),selector);
 const box=await p.locator(selector).boundingBox(),size=p.viewportSize();
 assert(box.y>=0&&box.y+box.height<=size.height+1);
 assert(box.height<size.height*.4);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 return box;
}
async function seed(p){
 return p.evaluate(()=>{
  const data=JSON.parse(localStorage.getItem('fact-flight-family-v1')),owner=data.profiles[0];
  const specs=[['multiplication',1,2],['division',1,1],['addition',4,2]];
  const records=specs.map(([activity,level,count],i)=>{
   const source=FactFlightMath.createQuestionSource({activity,level}),items=Array.from({length:count},()=>source.next());
   for(const q of items){q.status='correct';q.attempts=[{value:q.answer+1,correct:false,source:'keyboard',transcript:'wrong',at:100},{value:q.answer,correct:true,source:'keyboard',transcript:String(q.answer),at:200}];q.ms=200}
   return {id:crypto.randomUUID(),learnerId:owner.id,learnerName:owner.name,date:new Date(Date.now()-i*1000).toISOString(),activity,level,schemaVersion:1,mode:'practice',input:'keyboard',target:null,reason:'complete',elapsed:count*200,items,invalidated:[],unrecognized:[]};
  });
  data.sessions=records;localStorage.setItem('fact-flight-family-v1',JSON.stringify(data));FlightProfiles.progress();return records;
 });
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,channel:'chrome'});
 await test('Mixed five-fact review, fresh state, per-activity analytics, export and reload replay',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const originals=await seed(p);
  assert.equal(await p.locator('#reviewActivity').inputValue(),'all');await p.locator('#progressReview').click();
  assert.equal(await p.locator('[data-review-fact]:checked').count(),5);assert((await p.locator('#menuView').innerText()).includes('Level 5'));
  await dock(p,'#menuView .bottom-actions');await p.screenshot({path:path.join(output,'mixed-review-setup.png')});
  await p.locator('[data-review-start]').click();
  assert.equal(await p.evaluate(()=>phase),'running');assert.equal(await p.evaluate(()=>session.activity),'review');
  assert.deepEqual(await p.evaluate(()=>items.reduce((a,p)=>(a[p.activity]=(a[p.activity]||0)+1,a),{})),{multiplication:2,division:1,addition:2});
  assert(await p.evaluate(()=>items.every(p=>p.attempts.length===0&&p.skips===0&&p.ms===0)));
  for(let i=0;i<5;i++)await answer(p);await p.waitForFunction(()=>document.querySelector('#profileSaveStatus')?.textContent.startsWith('Saved'));
  const backup=await download(p,'#exportOne');assert.equal(backup.sessions.length,4);
  assert.deepEqual(backup.sessions.slice(1),originals);
  assert(await p.evaluate(b=>!!FlightProfileStore.parseExport(JSON.stringify(b)),backup));
  const restored=await browser.newContext(),rp=await restored.newPage();await rp.goto(url);
  await rp.evaluate(async b=>{const store=FlightProfileStore.create(localStorage,navigator.locks),r=store.review(b);await store.restore(b,r.fingerprint)},backup);
  await rp.reload();await rp.locator('[data-learner]:not([data-learner=guest])').first().click();await rp.locator('#historyNav').click();await rp.locator('[data-review="0"]').click();await rp.locator('#again').click();assert.equal(await rp.locator('[data-review-fact]:checked').count(),5);await restored.close();
  const bad=structuredClone(backup);bad.sessions[0].items[0].activity='squares';assert(await p.evaluate(b=>{try{FlightProfileStore.parseExport(JSON.stringify(b));return false}catch{return true}},bad));
  await p.locator('#seeProgress').click();await p.locator('[data-activity-progress=addition]').click();
  assert.equal(await p.evaluate(()=>activityFlights('addition').reduce((n,s)=>n+s.items.length,0)),4);
  const pendingCSV=p.waitForEvent('download');await p.locator('#exportCSV').click();const csv=fs.readFileSync(await (await pendingCSV).path(),'utf8');assert(csv.includes('"addition","5","review"'));assert(csv.includes('"division","2","review"'));
  await p.reload();await p.locator('[data-learner]:not([data-learner=guest])').first().click();await p.locator('#historyNav').click();await p.locator('[data-review="0"]').click();await p.locator('#again').click();
  assert.equal(await p.locator('[data-review-fact]:checked').count(),5);await p.locator('[data-review-start]').click();assert.equal(await p.evaluate(()=>session.activity),'review');await c.close();
 });
 await test('Activity filter, Results-only scope, empty and tiny pools',async()=>{
  const [c,p]=await page();await seed(p);await p.locator('#reviewActivity').selectOption('division');await p.locator('#progressReview').click();
  assert.equal(await p.locator('[data-review-fact]').count(),1);await p.locator('[data-review-fact]').uncheck();assert(await p.locator('[data-review-start]').isDisabled());await p.locator('[data-review-fact]').check();
  await p.locator('[data-review-start]').click();await answer(p);await p.locator('#reviewMissed').click();assert.equal(await p.locator('[data-review-fact]').count(),0);assert(await p.locator('[data-review-start]').isDisabled());
  await p.locator('[data-review-back]').click();await p.locator('#seeProgress').click();await p.locator('[data-review="2"]').click();await p.locator('#reviewMissed').click();assert.equal(await p.locator('[data-review-fact]').count(),1);await c.close();
 });
 await test('Mock voice readiness, cancel, duplicate-start guard and return to ordinary practice',async()=>{
  const [c,p]=await page();await seed(p);
  await p.evaluate(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});
  await p.locator('#progressReview').click();await p.locator('[data-review-input=voice]').click();await p.locator('[data-review-start]').click();assert.equal(await p.evaluate(()=>phase),'checking');
  await p.locator('#cancelMic').click();assert.equal(await p.locator('[data-review-fact]').count(),5);await p.locator('[data-review-start]').click();
  await p.evaluate(()=>document.querySelector('[data-review-start]').click());assert.equal(await p.evaluate(()=>phase),'checking');
  await p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;testRecognition.onresult({resultIndex:0,results:[r]})});assert.equal(await p.evaluate(()=>phase),'running');await finish(p);
  await choose(p,{activity:'subtraction'});assert.equal(await p.evaluate(()=>session.activity),'subtraction');assert.equal(await p.evaluate(()=>items.length),5);await c.close();
 });
 await test('Learner ownership and Guest scope',async()=>{
  const [c,p]=await page();await seed(p);await p.locator('#progressReview').click();
  await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('fact-flight-family-v1'));d.profiles=[];d.sessions=[];localStorage.setItem('fact-flight-family-v1',JSON.stringify(d))});await p.locator('[data-review-start]').click();assert.notEqual(await p.evaluate(()=>phase),'running');
  await p.locator('#homeNav').click();await p.locator('[data-learner=guest]').click();await choose(p);await answer(p,9999);await finishGuest(p);await p.locator('#reviewMissed').click();assert.equal(await p.locator('[data-review-fact]').count(),1);await p.locator('[data-review-start]').click();await finishGuest(p);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length),0);await p.locator('#seeProgress').click();assert.equal(await p.locator('#progressReview').count(),0);await c.close();
 });
 for(const mobile of [false,true])await test('Review defaults and remembered retry choices '+(mobile?'mobile':'desktop'),async()=>{
  const [c,p]=await page({viewport:mobile?{width:390,height:844}:{width:1440,height:1000}});await seed(p);await p.locator('#progressReview').click();
  const defaultView=mobile?'focus':'worksheet',chosen=mobile?'worksheet':'focus';
  assert.equal(await p.locator('[data-review-view='+defaultView+']').getAttribute('aria-pressed'),'true');
  await p.locator('[data-review-view='+chosen+']').click();for(const i of [2,3,4])await p.locator('[data-review-fact="'+i+'"]').uncheck();
  await p.locator('[data-review-start]').click();assert.equal(await p.evaluate(()=>activeView),chosen);await finish(p);
  await p.locator('#again').click();assert.equal(await p.locator('[data-review-view='+chosen+']').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('[data-review-fact]:checked').count(),2);
  await p.locator('[data-review-start]').click();await finish(p);await p.locator('#seeProgress').click();await p.locator('#progressReview').click();assert.equal(await p.locator('[data-review-view='+chosen+']').getAttribute('aria-pressed'),'true');
  await p.reload();await p.locator('[data-learner]:not([data-learner=guest])').first().click();await p.locator('#historyNav').click();await p.locator('#progressReview').click();assert.equal(await p.locator('[data-review-view='+chosen+']').getAttribute('aria-pressed'),'true');
  // The other viewport category starts with its own default.
  await p.setViewportSize(mobile?{width:1440,height:1000}:{width:390,height:844});await p.locator('#historyNav').click();await p.locator('#progressReview').click();assert.equal(await p.locator('[data-review-view='+(mobile?'worksheet':'focus')+']').getAttribute('aria-pressed'),'true');
  await c.close();
 });
 await test('Voice review preferences save after ready, cancel preserves them, Guest clears them',async()=>{
  const [c,p]=await page();await seed(p);await p.evaluate(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});
  await p.locator('#progressReview').click();await p.locator('[data-review-input=voice]').click();await p.locator('[data-review-view=focus]').click();await p.locator('[data-review-start]').click();
  assert.equal(await p.evaluate(()=>FlightProfiles.reviewChoice()),null);
  await p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;testRecognition.onresult({resultIndex:0,results:[r]})});await finish(p);await p.locator('#seeProgress').click();await p.locator('#progressReview').click();
  assert.equal(await p.locator('[data-review-input=voice]').getAttribute('aria-pressed'),'true');assert.equal(await p.locator('[data-review-view=focus]').getAttribute('aria-pressed'),'true');
  await p.locator('[data-review-view=worksheet]').click();await p.locator('[data-review-start]').click();await p.locator('#cancelMic').click();await p.locator('#historyNav').click();await p.locator('#progressReview').click();assert.equal(await p.locator('[data-review-view=focus]').getAttribute('aria-pressed'),'true');
  await p.locator('#homeNav').click();await p.locator('[data-change-learner]').click();await p.locator('[data-learner=guest]').click();assert.equal(await p.evaluate(()=>FlightProfiles.reviewChoice()),null);
  await p.evaluate(()=>FlightProfiles.rememberReview({input:'keypad',view:'focus'}));assert.equal(await p.evaluate(()=>FlightProfiles.reviewChoice().view),'focus');
  await p.locator('[data-change-learner]').click();await p.locator('[data-learner=guest]').click();assert.equal(await p.evaluate(()=>FlightProfiles.reviewChoice()),null);await c.close();
 });
 await test('Results retry removes facts after two successful review flights',async()=>{
  const [c,p]=await page();await seed(p);await p.locator('#progressReview').click();await p.locator('[data-review-view=focus]').click();
  for(let round=0;round<2;round++){
   assert.equal(await p.locator('[data-review-fact]:checked').count(),5);await p.locator('[data-review-start]').click();
   for(let i=0;i<5;i++)await answer(p);
   await p.waitForFunction(()=>document.querySelector('#profileSaveStatus')?.textContent.startsWith('Saved'));
   await p.locator('#again').click();
  }
  assert.equal(await p.locator('[data-review-fact]').count(),0);assert(await p.locator('[data-review-start]').isDisabled());
  await p.locator('#historyNav').click();await p.locator('#progressReview').click();assert.equal(await p.locator('[data-review-fact]').count(),0);await c.close();
 });
 await test('Repeated voice review accepts stable interim ready and reconnect',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844}});await seed(p);
  await p.evaluate(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});
  const say=(text,final=true)=>p.evaluate(({text,final})=>{const r=[{transcript:text}];r.isFinal=final;testRecognition.onresult({resultIndex:0,results:[r]})},{text,final});
  await p.locator('#progressReview').click();await p.locator('[data-review-input=voice]').click();await p.locator('[data-review-start]').click();await say('ready');await finish(p);
  await p.locator('#again').click();await p.locator('[data-review-start]').click();assert.equal(await p.evaluate(()=>phase),'checking');
  await say('ready',false);await p.waitForFunction(()=>phase==='running',{},{timeout:3500});await finish(p);
  await p.locator('#again').click();await p.locator('[data-review-start]').click();await p.locator('#retryMic').click();await say('I am ready',false);await p.waitForFunction(()=>phase==='running',{},{timeout:3500});await c.close();
 });
 await test('Interim ready replacement, cancellation, stale reconnect and final-result guards',async()=>{
  const [c,p]=await page();await seed(p);await p.evaluate(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});
  const say=(text,final=false)=>p.evaluate(({text,final})=>{const r=[{transcript:text}];r.isFinal=final;testRecognition.onresult({resultIndex:0,results:[r]})},{text,final});
  await p.locator('#progressReview').click();await p.locator('[data-review-input=voice]').click();await p.locator('[data-review-start]').click();
  await say('ready');await say('ready or not');await p.waitForTimeout(1450);assert.equal(await p.evaluate(()=>phase),'checking');assert((await p.locator('#micMessage').innerText()).includes('ready or not'));
  await say('ready');await p.locator('#cancelMic').click();await p.waitForTimeout(1450);assert.equal(await p.evaluate(()=>phase),'idle');
  await p.locator('[data-review-start]').click();await say('ready');await p.locator('#retryMic').click();await p.waitForTimeout(1450);assert.equal(await p.evaluate(()=>phase),'checking');
  await say('ready');await say('ready',true);assert.equal(await p.evaluate(()=>phase),'running');const id=await p.evaluate(()=>session.id);await p.waitForTimeout(1450);assert.equal(await p.evaluate(()=>session.id),id);assert(await p.evaluate(()=>items.every(q=>q.attempts.length===0)));await c.close();
 });
 await test('Ordinary Practice Again starts after complete spoken-answer flight',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844}});await p.evaluate(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this;this.results=[]}start(){this.onstart?.()}abort(){}}});
  const say=text=>p.evaluate(text=>{const r=[{transcript:text}];r.isFinal=true;const rec=testRecognition;rec.results.push(r);rec.onresult({resultIndex:rec.results.length-1,results:rec.results})},text);
  await choose(p,{input:'voice'});await say('ready');
  for(let i=0;i<5;i++){await say(String(await p.evaluate(()=>items[index].answer)));await require('./feedback-wait.cjs')(p)}
  await p.waitForFunction(()=>phase==='done');await p.locator('#again').click();assert.equal(await p.evaluate(()=>phase),'checking');await say('hello there');assert((await p.locator('#micMessage').innerText()).includes('hello there'));
  await p.locator('#retryMic').click();await say('ready');assert.equal(await p.evaluate(()=>phase),'running');await say(String(await p.evaluate(()=>items[index].answer)));await require('./feedback-wait.cjs')(p);assert.equal(await p.evaluate(()=>items.filter(q=>q.status==='correct').length),1);await c.close();
 });
 const ios={viewport:{width:390,height:844},isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 CriOS/140 Mobile/15E148 Safari/604.1'};
 async function mockRecoveryVoice(p){
  const install=()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){setTimeout(()=>this.onend?.(),0)}}};
  await p.addInitScript(install);await p.evaluate(install);
 }
 await test('iPhone recovery restores selected review and learner without starting or changing history',async()=>{
  const [c,p]=await page(ios);await seed(p);await mockRecoveryVoice(p);
  const before=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));
  await p.locator('#progressReview').click();await p.locator('[data-review-fact="4"]').uncheck();await p.locator('[data-review-input=voice]').click();await p.locator('[data-review-view=worksheet]').click();await p.locator('[data-review-start]').click();
  assert(await p.locator('#refreshVoice').isVisible());
  await p.locator('#refreshVoice').click();await p.locator('[data-review-start]').waitFor();
  assert.equal(await p.evaluate(()=>phase),'idle');assert.equal(await p.evaluate(()=>!!window.testRecognition),false);
  assert.equal(await p.locator('[data-review-fact]:checked').count(),4);assert.equal(await p.locator('[data-review-view=worksheet]').getAttribute('aria-pressed'),'true');
  assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),before);
  assert.equal(await p.evaluate(()=>sessionStorage.getItem('fact-flight-voice-recovery-v1')),null);
  await p.locator('[data-review-start]').click();assert.equal(await p.evaluate(()=>phase),'checking');
  await p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;testRecognition.onresult({resultIndex:0,results:[r]})});
  assert.equal(await p.evaluate(()=>phase),'running');assert.equal(await p.evaluate(()=>session.items?.length||items.length),4);
  await finish(p);await p.locator('#again').click();await p.locator('[data-review-start]').click();await p.locator('#refreshVoice').click();await p.locator('[data-review-start]').waitFor();
  await p.locator('[data-review-start]').click();await p.locator('#cancelMic').click();assert.equal(await p.evaluate(()=>phase),'idle');
  await p.reload();assert(await p.locator('[data-learner]').count());assert.equal(await p.locator('[data-review-start]').count(),0);await c.close();
 });
 for(const mode of ['quick','timed','school'])await test('iPhone recovery preserves ordinary '+mode+' settings and voice-ready gate',async()=>{
  const [c,p]=await page(ios);await mockRecoveryVoice(p);await choose(p,{mode,activity:'multiplication',level:3,count:10,minutes:5,table:7,input:'voice',view:'focus'});
  await p.locator('#refreshVoice').click();await p.locator('[data-start]').waitFor();assert.equal(await p.evaluate(()=>phase),'idle');
  await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>phase),'checking');
  assert.equal(await p.locator('#inputMode').inputValue(),'voice');assert.equal(await p.locator('#sessionView').inputValue(),'focus');
  if(mode==='school')assert.equal(await p.evaluate(()=>table),7);
  else{assert.equal(await p.locator('#level').inputValue(),'3');assert.equal(await p.locator('#questionCount').inputValue(),'10')}
  if(mode==='timed')assert.equal(await p.evaluate(()=>configuredTimeLimitMs),300000);
  await p.locator('#cancelMic').click();await c.close();
 });
 await test('Recovery blocks Guest, unsaved results and unavailable session storage',async()=>{
  const [c,p]=await page(ios);await mockRecoveryVoice(p);
  await p.locator('[data-change-learner]').click();await p.locator('[data-learner=guest]').click();await choose(p,{input:'voice'});
  await p.locator('#refreshVoice').click();assert((await p.locator('#micMessage').innerText()).includes('Guest results are temporary'));assert.equal(await p.evaluate(()=>phase),'checking');await p.locator('#cancelMic').click();
  await p.locator('#homeNav').click();await p.locator('[data-change-learner]').click();await p.locator('[data-learner]:not([data-learner=guest])').first().click();
  await choose(p,{input:'voice'});await p.waitForFunction(()=>rec&&micState==='waiting');await p.evaluate(()=>{window.originalSet=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(this===sessionStorage)throw Error('blocked');return originalSet.call(this,k,v)}});
  await p.locator('#refreshVoice').click();assert((await p.locator('#micMessage').innerText()).includes('Could not keep your setup'));assert.equal(await p.evaluate(()=>phase),'checking');
  await p.evaluate(()=>{Storage.prototype.setItem=originalSet;const r=[{transcript:'ready'}];r.isFinal=true;testRecognition.onresult({resultIndex:0,results:[r]});Storage.prototype.setItem=function(k,v){if(k==='fact-flight-family-v1')throw Error('quota');return originalSet.call(this,k,v)}});
  await p.locator('#end').click();await p.waitForFunction(()=>document.querySelector('#profileSaveStatus')?.textContent.includes('Could not save'));
  await p.locator('#again').click();await p.locator('#refreshVoice').click();assert((await p.locator('#micMessage').innerText()).includes('Results are still saving'));assert.equal(await p.evaluate(()=>phase),'checking');await c.close();
 });
 await test('Recovery rejects expired, malformed and deleted-owner setup',async()=>{
  const [c,p]=await page(ios);const owner=await p.evaluate(()=>FlightProfiles.reviewOwner());
  const config={activity:'addition',mode:'quick',level:0,count:5,minutes:2,table:2,input:'voice',view:'focus',target:'',schoolUntimed:false};
  for(const change of [{at:Date.now()-700000},{owner:'missing-learner'},{review:{version:1,facts:[]}},{config:{...config,activity:'invalid'}}]){
   await p.evaluate(v=>sessionStorage.setItem('fact-flight-voice-recovery-v1',JSON.stringify(v)),{version:1,at:Date.now(),owner,view:'focus',config,...change});await p.reload();
   assert.equal(await p.evaluate(()=>FlightProfiles.reviewOwner()),null);assert.equal(await p.locator('[data-start]').count(),0);assert.equal(await p.evaluate(()=>sessionStorage.getItem('fact-flight-voice-recovery-v1')),null);
  }
  await c.close();
 });
 await test('No browser errors',()=>assert.deepEqual(errors,[]));
 fs.writeFileSync(path.join(output,'missed-review-results.json'),JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
async function finishGuest(p){await p.locator('#end').click();await p.locator('#reviewMissed').waitFor()}
