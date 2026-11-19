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


async function finish(p){await p.locator('#end').click();await p.waitForFunction(()=>document.querySelector('#profileSaveStatus').textContent.startsWith('Saved'))}
async function home(p){await p.locator('#resultHome').click()}
async function download(p,selector){const pending=p.waitForEvent('download');await p.locator(selector).click();return JSON.parse(fs.readFileSync(await (await pending).path(),'utf8'))}


const ios={viewport:{width:390,height:844},userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 27_0_1 like Mac OS X) AppleWebKit/605.1.15 CriOS/140 Mobile/15E148 Safari/604.1'};
async function setup(mobile=true,choice={}){
 const [c,p]=await page(mobile?ios:{});await p.clock.install();await p.clock.pauseAt(new Date());
 await p.evaluate(()=>{
 window.instances=[];window.cues=[];window.abortEnds=true;window.autoStart=true;window.startThrows=false;window.audioTypes=[];
 Object.defineProperty(navigator,'audioSession',{configurable:true,value:{set type(v){audioTypes.push(v)}}});
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 Object.defineProperty(window,'speechSynthesis',{value:{speak(u){cues.push(u)},cancel(){throw Error('Unexpected synthesis cleanup')}}});
 window.SpeechRecognition=class{
 constructor(){this.starts=0;this.results=[];instances.push(this);window.testRecognition=this}
 start(){this.starts++;if(startThrows)throw Error('start failed');if(autoStart)this.onstart?.()}
 abort(){if(this.ended)return;this.aborted=true;if(abortEnds)setTimeout(()=>{this.ended=true;this.onend?.()},50)}
 };
 });await choose(p,{input:'voice',...choice});return [c,p];
}
async function speech(p,text,{final=true,replace=false}={}){await p.evaluate(({text,final,replace})=>{
 const rec=testRecognition,r=[{transcript:text}];r.isFinal=final;
 const index=replace?rec.results.length-1:rec.results.length;rec.results[index]=r;
 rec.onresult?.({resultIndex:index,results:rec.results});
},{text,final,replace})}
async function correct(p){await speech(p,await p.evaluate(()=>String(items[index].answer)));await p.clock.runFor(400)}
async function ended(p){await p.evaluate(()=>{testRecognition.ended=true;testRecognition.onend?.()})}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,channel:'chrome'});
 await test('iOS continuous ready and five answers share one instance; completion aborts before natural end',async()=>{
 const [c,p]=await setup();assert.equal(await p.evaluate(()=>testRecognition.continuous),true);assert.equal(await p.evaluate(()=>phase),'checking');
 await speech(p,'ready');for(let q=0;q<5;q++)await correct(p);
 assert.equal(await p.evaluate(()=>phase),'done');assert.equal(await p.evaluate(()=>instances.length),1);assert(await p.evaluate(()=>instances[0].aborted));
 assert.equal(await p.evaluate(()=>rec),null);assert(await p.evaluate(()=>session.items.every(first)));assert.deepEqual(await p.evaluate(()=>[cues,audioTypes]),[[],[]]);await c.close();
 });
 await test('Five repeated flights preserve independent saved history and require deliberate starts',async()=>{
 const [c,p]=await setup();const ids=[];
 for(let f=0;f<5;f++){
 await speech(p,'ready');ids.push(await p.evaluate(()=>session.id));for(let q=0;q<5;q++)await correct(p);
 await p.waitForFunction(()=>document.querySelector('#profileSaveStatus')?.textContent.startsWith('Saved'));
 await p.clock.runFor(500);assert.equal(await p.evaluate(()=>instances.length),f+1);if(f<4){await p.locator('#again').click();assert.equal(await p.evaluate(()=>phase),'checking')}
 }
 assert.equal(new Set(ids).size,5);assert(await p.evaluate(()=>instances.every(r=>r.starts===1&&r.aborted)));
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length),5);await p.reload();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length),5);await c.close();
 });
 await test('Wrong answers, correction, skip and interim/final deduplication preserve first-try scoring',async()=>{
 const [c,p]=await setup();await speech(p,'ready');await speech(p,'9999');assert.equal(await p.evaluate(()=>items[0].attempts.length),1);
 await speech(p,await p.evaluate(()=>String(items[0].answer)),{final:false});await p.clock.runFor(1300);await p.clock.runFor(400);
 await speech(p,await p.evaluate(()=>String(items[0].answer)),{replace:true});assert.equal(await p.evaluate(()=>index),1);assert.equal(await p.evaluate(()=>items[0].attempts.length),2);assert.equal(await p.evaluate(()=>first(items[0])),false);
 await speech(p,'skip');assert.equal(await p.evaluate(()=>items[1].skips),1);await p.locator('#end').click();assert.equal(await p.evaluate(()=>phase),'done');await c.close();
 });
 await test('iOS aliases are exact, independent of expected answer; freddy is readiness only',async()=>{
 const [c,p]=await setup();await speech(p,'freddy');assert.equal(await p.evaluate(()=>phase),'running');
 for(const [word,value] of [['sex',6],['thor',4],['poor',4]]){await p.evaluate(()=>items[index].answer=99);await speech(p,word);assert.equal(await p.evaluate(()=>items[index].attempts.at(-1).value),value);assert.equal(await p.evaluate(()=>items[index].attempts.at(-1).correct),false)}
 const n=await p.evaluate(()=>items[index].attempts.length);await speech(p,'freddy');await speech(p,'sixteen extra');assert.equal(await p.evaluate(()=>items[index].attempts.length),n);await c.close();
 });
 await test('Stable interim ready starts once and late final ready never scores an answer',async()=>{
 const [c,p]=await setup();await speech(p,'freddy',{final:false});await p.clock.runFor(1300);assert.equal(await p.evaluate(()=>phase),'running');const id=await p.evaluate(()=>session.id);
 await speech(p,'freddy',{replace:true});assert.equal(await p.evaluate(()=>session.id),id);assert.equal(await p.evaluate(()=>items[0].attempts.length),0);await c.close();
 });
 await test('Cancellation invalidates captured callbacks and pending start before microphone connects',async()=>{
 const [c,p]=await setup();await p.evaluate(()=>{autoStart=false;window.lateResult=testRecognition.onresult;window.lateEnd=testRecognition.onend});await p.locator('#cancelMic').click();await p.clock.runFor(500);
 await p.locator('[data-start]').click();await p.evaluate(()=>window.lateStart=testRecognition.onstart);await p.locator('#cancelMic').click();
 await p.evaluate(()=>{lateStart();lateEnd();const r=[{transcript:'ready'}];r.isFinal=true;lateResult({resultIndex:0,results:[r]})});await p.clock.runFor(30000);
 assert.equal(await p.evaluate(()=>phase),'idle');assert.equal(await p.evaluate(()=>session),null);assert.equal(await p.evaluate(()=>instances.length),2);await c.close();
 });
 await test('Manual retry waits for active abort confirmation; absent shutdown blocks overlap',async()=>{
 const [c,p]=await setup();await p.locator('#retryMic').click();await p.clock.runFor(449);assert.equal(await p.evaluate(()=>instances.length),1);await p.clock.runFor(1);assert.equal(await p.evaluate(()=>instances.length),2);
 await p.evaluate(()=>abortEnds=false);await p.locator('#retryMic').click();await p.clock.runFor(3000);assert.equal(await p.evaluate(()=>instances.length),2);assert((await p.locator('#micMessage').innerText()).includes('shutdown'));assert(await p.locator('#iosVoiceRecovery').evaluate(e=>e.open));await c.close();
 });
 await test('No-result watchdog survives speechstart and exposes refresh after a failed retry',async()=>{
 const [c,p]=await setup();await p.evaluate(()=>testRecognition.onspeechstart());await p.clock.runFor(8000);assert(await p.evaluate(()=>instances[0].aborted));assert.equal(await p.evaluate(()=>instances.length),1);assert((await p.locator('#micMessage').innerText()).includes('No speech results'));
 await p.clock.runFor(450);await p.locator('#retryMic').click();await p.clock.runFor(8000);assert(await p.locator('#iosVoiceRecovery').evaluate(e=>e.open));assert.equal(await p.evaluate(()=>phase),'checking');assert.equal(await p.evaluate(()=>session),null);await c.close();
 });
 await test('Missing onstart times out without automatic retry; start exceptions remain recoverable',async()=>{
 for(const variant of ['silent','throws']){const [c,p]=await setup();await p.locator('#cancelMic').click();await p.clock.runFor(450);await p.evaluate(v=>{autoStart=false;startThrows=v==='throws'},variant);await p.locator('[data-start]').click();await p.clock.runFor(8500);
 assert.equal(await p.evaluate(()=>micState),'disconnected');assert.equal(await p.evaluate(()=>instances.length),2);assert((await p.locator('#micMessage').innerText()).includes(variant==='silent'?'confirm a start':'Could not start'));await c.close();}
 });
 await test('Permission, service and interruption errors terminate capture with distinct guidance',async()=>{
 for(const error of ['not-allowed','service-not-allowed','audio-capture','network','no-speech','aborted']){
 const [c,p]=await setup();await p.evaluate(error=>testRecognition.onerror({error}),error);assert(await p.evaluate(()=>instances[0].aborted));const message=await p.locator('#micMessage').innerText();
 assert(message.includes(['not-allowed','service-not-allowed'].includes(error)?'denied':error==='no-speech'?'No speech results':error==='aborted'?'interrupted':error));await p.clock.runFor(30000);assert.equal(await p.evaluate(()=>instances.length),1);await c.close();}
 });
 await test('Unsupported recognition does not create a session; typed setup preserves selected settings',async()=>{
 const [c,p]=await setup(true,{count:10,view:'worksheet',activity:'multiplication',level:3});await p.locator('#cancelMic').click();await p.clock.runFor(450);await p.evaluate(()=>{window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined});await p.locator('[data-start]').click();assert((await p.locator('#micMessage').innerText()).includes('unavailable'));
 await p.locator('#typeInstead').click();assert.equal(await p.evaluate(()=>phase),'idle');assert.equal(await p.locator('[data-input=keypad]').getAttribute('aria-pressed'),'true');await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>session.input),'keyboard');assert.equal(await p.evaluate(()=>items.length),10);assert.equal(await p.evaluate(()=>session.level),3);assert.equal(await p.evaluate(()=>activeView),'worksheet');await c.close();
 });
 await test('Unexpected natural end during ready or answers never automatically restarts iOS',async()=>{
 for(const running of [false,true]){const [c,p]=await setup();if(running)await speech(p,'ready');await ended(p);await p.clock.runFor(30000);assert.equal(await p.evaluate(()=>instances.length),1);assert.equal(await p.evaluate(()=>micState),'disconnected');await p.locator(running?'#micReconnectTop':'#retryMic').click();assert.equal(await p.evaluate(()=>instances.length),2);await c.close();}
 });
 await test('In-flight no-results preserves answers and allows keyboard completion',async()=>{
 const [c,p]=await setup();await speech(p,'ready');await correct(p);await p.clock.runFor(20000);assert.equal(await p.evaluate(()=>phase),'running');assert.equal(await p.evaluate(()=>index),1);assert(await p.evaluate(()=>instances[0].aborted));assert((await p.locator('#heard').innerText()).includes('answers are kept'));
 for(let q=1;q<5;q++){await p.locator('#focusAnswer').fill(await p.evaluate(()=>String(items[index].answer)));await p.locator('#focusAnswer').press('Enter');await p.clock.runFor(400)}
 assert.equal(await p.evaluate(()=>phase),'done');assert.equal(await p.evaluate(()=>instances.length),1);await c.close();
 });
 await test('Background and return during setup, answers and Results never restart automatically',async()=>{
 for(const stage of ['checking','running','done']){const [c,p]=await setup();if(stage!=='checking')await speech(p,'ready');if(stage==='done')for(let q=0;q<5;q++)await correct(p);
 await p.evaluate(()=>{window.late=testRecognition.onresult;Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));window.dispatchEvent(new Event('pagehide'))});await p.clock.runFor(30000);
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));const r=[{transcript:'ready'}];r.isFinal=true;late?.({resultIndex:0,results:[r]})});
 assert.equal(await p.evaluate(()=>instances.length),1);assert(await p.evaluate(()=>instances[0].aborted));assert.equal(await p.evaluate(()=>phase),stage);
 if(stage!=='done'){await p.locator(stage==='checking'?'#retryMic':'#micReconnectTop').click();assert.equal(await p.evaluate(()=>instances.length),2)}await c.close();}
 });
 await test('Navigation finish, timed expiry and late result callbacks cannot change saved results',async()=>{
 for(const reason of ['navigation','time']){const [c,p]=await setup();await speech(p,'ready');await correct(p);await p.evaluate(()=>{window.late=testRecognition.onresult;window.lateEnd=testRecognition.onend});
 if(reason==='navigation'){await p.locator('#sessionHome').click();await p.locator('#finishFlight').click()}else await p.evaluate(()=>{mode='test';flightTimeLimitMs=60000;started=performance.now()-60000;tick()});
 const saved=await p.evaluate(()=>JSON.stringify(session));await p.evaluate(()=>{lateEnd();const r=[{transcript:'4'}];r.isFinal=true;late({resultIndex:0,results:[r]})});await p.clock.runFor(30000);assert.equal(await p.evaluate(()=>JSON.stringify(session)),saved);assert(await p.evaluate(()=>instances[0].aborted));assert.equal(await p.evaluate(()=>instances.length),1);await c.close();}
 });
 await test('Longer flight and original School Test preserve count, timing and scoring with continuous voice',async()=>{
 for(const choice of [{count:20},{mode:'school',table:7,view:'worksheet'}]){const [c,p]=await setup(true,choice);await speech(p,'ready');const count=choice.mode==='school'?60:20;assert.equal(await p.evaluate(()=>items.length),count);if(count===60){assert.equal(await p.evaluate(()=>flightTimeLimitMs),120000);assert.equal(await p.evaluate(()=>mode),'test')}
 for(let q=0;q<count;q++)await correct(p);assert.equal(await p.evaluate(()=>phase),'done');assert(await p.evaluate(()=>session.items.every(first)));assert.equal(await p.evaluate(()=>instances.length),1);assert(await p.evaluate(()=>instances[0].aborted));await c.close();}
 });
 await test('Desktop continuous recognition, interim fallback and automatic end recovery remain unchanged',async()=>{
 const [c,p]=await setup(false);assert.equal(await p.evaluate(()=>testRecognition.continuous),true);await speech(p,'freddy',{final:false});await p.clock.runFor(1300);assert.equal(await p.evaluate(()=>phase),'checking');await speech(p,'ready');await speech(p,await p.evaluate(()=>String(items[index].answer)),{final:false});await p.clock.runFor(1700);assert.equal(await p.evaluate(()=>index),1);await ended(p);await p.clock.runFor(500);assert.equal(await p.evaluate(()=>instances.length),2);assert.equal(await p.evaluate(()=>parseVoiceNumber('sex')),null);assert.deepEqual(await p.evaluate(()=>[cues,audioTypes]),[[],[]]);await c.close();
 });
 await test('Diagnostics exclude speech and learner data and include shutdown requests',async()=>{
 const [c,p]=await setup();await speech(p,'private spoken words');await p.clock.runFor(8000);await p.locator('#micDiagnostics summary').click();const data=await download(p,'#downloadMicLog');const raw=JSON.stringify(data);assert(!raw.includes('private'));assert(!raw.includes('Test learner'));assert(!raw.includes('transcript'));assert(raw.includes('abort-requested'));assert.equal(data.implementation,'voice-lifecycle-diagnostics-4-continuous-recovery');await c.close();
 });
 await test('Parent restriction persists, disables all learners and blocks direct reconnects and remembered voice',async()=>{
 const [c,p]=await setup(false);await p.locator('#cancelMic').click();await p.locator('#homeNav').click();await p.locator('[data-nav=parents]').click();await p.locator('#disableMicrophone').check();
 assert.equal(await p.evaluate(()=>localStorage.getItem(microphoneRestrictionKey)),'true');
 const before=await p.evaluate(()=>instances.length);await p.evaluate(()=>{connectMic()});assert.equal(await p.evaluate(()=>instances.length),before);
 await p.locator('#homeNav').click();await p.locator('[data-quick]').click();await require('./menu-route.cjs')(p,'addition');await p.locator('[data-next]').click();assert(await p.locator('[data-input=voice]').isDisabled());assert((await p.locator('[data-input=voice]').innerText()).includes('Parent restricted'));
 await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>session.input),'keyboard');await p.locator('#end').click();await p.reload();assert(await p.evaluate(()=>microphoneRestricted()));
 await p.locator('[data-learner=guest]').click();await p.locator('[data-nav=parents]').click();assert(await p.locator('#disableMicrophone').isChecked());await p.locator('#disableMicrophone').uncheck();assert.equal(await p.evaluate(()=>microphoneRestricted()),false);await c.close();
 });
 await test('Restriction during pending shutdown prevents a late manual start',async()=>{
 const [c,p]=await setup();await p.locator('#retryMic').click();await p.evaluate(()=>setMicrophoneRestriction(true));await p.clock.runFor(1000);assert.equal(await p.evaluate(()=>phase),'idle');assert.equal(await p.evaluate(()=>instances.length),1);assert(await p.evaluate(()=>instances[0].aborted));await p.evaluate(()=>setMicrophoneRestriction(false));await p.clock.runFor(1000);assert.equal(await p.evaluate(()=>instances.length),1);await c.close();
 });
 await test('Cross-tab parent restriction interrupts running voice and fails closed on storage errors',async()=>{
 const [c,p]=await setup(false);await speech(p,'ready',{end:false});const other=await c.newPage();await other.goto(url);await other.evaluate(()=>localStorage.setItem('fact-flight-microphone-disabled-v1','true'));await p.waitForFunction(()=>microphoneRestricted());
 assert.equal(await p.evaluate(()=>rec),null);assert(await p.locator('#resume').isDisabled());assert.equal(await p.evaluate(()=>phase),'running');await p.locator('#focusAnswer').fill(await p.evaluate(()=>String(items[index].answer)));await p.locator('#focusAnswer').press('Enter');await p.clock.runFor(400);assert.equal(await p.evaluate(()=>items.filter(first).length),1);
 await p.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('blocked')};window.savedPolicy=setMicrophoneRestriction(false)});assert.equal(await p.evaluate(()=>savedPolicy),false);assert(await p.evaluate(()=>microphoneRestricted()));await c.close();
 });
 await test('Parent restriction covers missed review and remembered Quick start without touching history',async()=>{
 const [c,p]=await setup(false);await speech(p,'ready',{end:false});await p.evaluate(()=>submit(9999,'9999','voice'));await p.locator('#end').click();await p.waitForFunction(()=>document.querySelector('#profileSaveStatus')?.textContent.startsWith('Saved'));
 const history=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));await p.locator('#seeProgress').click();await p.locator('#pdReviewFacts').evaluate(e=>e.open=true);await p.locator('#progressReview').click();await p.evaluate(()=>setMicrophoneRestriction(true));assert(await p.locator('[data-review-input=voice]').isDisabled());assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),history);
 await p.locator('[data-review-start]').click();assert.equal(await p.evaluate(()=>session.input),'keyboard');await p.locator('#end').click();await p.locator('#resultHome').click();await p.locator('[data-quick-start]').click();assert.equal(await p.evaluate(()=>session.input),'keyboard');await c.close();
 });
 await test('Cancelled voice cannot affect another learner or Guest',async()=>{
 const [c,p]=await setup();await p.evaluate(()=>window.oldResult=testRecognition.onresult);await p.locator('#cancelMic').click();await p.clock.runFor(450);await p.locator('#homeNav').click();await p.locator('[data-change-learner]').click();await p.locator('[data-learner=guest]').click();await choose(p,{input:'keypad'});
 const before=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));await p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;oldResult({resultIndex:0,results:[r]})});assert(await p.evaluate(()=>FlightProfiles.isGuest()));assert.equal(await p.evaluate(()=>items[0].attempts.length),0);await p.locator('#end').click();assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),before);await c.close();
 });
 await test('Phone recovery actions remain separate and reachable',async()=>{
 const [c,p]=await setup();await p.clock.runFor(8500);await p.locator('#retryMic').click();await p.clock.runFor(8500);
 const boxes=await p.locator('#micDialog .mic-actions button').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,width:r.width}}));
 assert.equal(boxes.length,3);for(let i=1;i<boxes.length;i++)assert(boxes[i].top>boxes[i-1].bottom);assert(boxes.every(b=>b.width>200));
 await p.screenshot({path:path.join(output,'iphone-recovery.png')});await p.locator('#typeInstead').click();assert.equal(await p.evaluate(()=>phase),'idle');await c.close();
 });
 await test('No browser errors',()=>assert.deepEqual(errors,[]));
 fs.writeFileSync(path.join(output,'mic-lifecycle-results.json'),JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
