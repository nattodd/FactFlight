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
async function setup(mobile=true){
 const [c,p]=await page(mobile?ios:{});await p.clock.install();await p.clock.pauseAt(new Date());
 await p.evaluate(()=>{
 window.instances=[];window.cues=[];window.abortEnds=true;
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};
 Object.defineProperty(window,'speechSynthesis',{value:{speak(u){cues.push(u)},cancel(){}}});
 window.SpeechRecognition=class{
 constructor(){this.starts=0;instances.push(this);window.testRecognition=this}
 start(){this.starts++;this.onstart?.()}
 abort(){this.aborted=true;if(abortEnds)setTimeout(()=>this.onend?.(),50)}
 };
 });await choose(p,{input:'voice'});return [c,p];
}
async function cue(p){await p.evaluate(()=>cues.at(-1).onend());}
async function speech(p,text,{final=true,end=true}={}){await p.evaluate(({text,final,end})=>{const r=[{transcript:text}];r.isFinal=final;testRecognition.onresult({resultIndex:0,results:[r]});if(end)testRecognition.onend?.()},{text,final,end})}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,channel:'chrome'});
 await test('iOS cue, audiostart prompt, final-only readiness and natural end cooldown',async()=>{
 const [c,p]=await setup();assert.equal(await p.evaluate(()=>instances.length),0);assert.deepEqual(await p.evaluate(()=>[cues[0].text,cues[0].rate]),['Your turn',2]);await cue(p);
 assert.equal(await p.evaluate(()=>testRecognition.continuous),false);assert((await p.locator('#micMessage').innerText()).includes('Wait'));
 await p.evaluate(()=>{testRecognition.onaudiostart();testRecognition.onstart()});assert((await p.locator('#micMessage').innerText()).includes('Listening'));
 await speech(p,'freddy',{final:false,end:false});await p.clock.runFor(1500);assert.equal(await p.evaluate(()=>phase),'checking');
 await speech(p,'freddy',{end:false});assert.equal(await p.evaluate(()=>phase),'checking');await p.evaluate(()=>testRecognition.onend());assert.equal(await p.evaluate(()=>phase),'running');
 await p.clock.runFor(399);assert.equal(await p.evaluate(()=>cues.length),1);await p.clock.runFor(1);assert.equal(await p.evaluate(()=>cues.length),2);
 assert(await p.evaluate(()=>instances.every(r=>!r.aborted)));await c.close();
 });
 await test('iOS five flights use fresh natural sessions, preserve scoring/history and retry',async()=>{
 const [c,p]=await setup();const ids=[];
 for(let f=0;f<5;f++){
 await cue(p);await speech(p,'ready');ids.push(await p.evaluate(()=>session.id));
 for(let q=0;q<5;q++){await p.clock.runFor(400);await cue(p);await speech(p,await p.evaluate(()=>String(items[index].answer)));}
 await p.clock.runFor(400);await p.waitForFunction(()=>document.querySelector('#profileSaveStatus')?.textContent.startsWith('Saved'));
 assert.equal(await p.evaluate(()=>phase),'done');assert(await p.evaluate(()=>session.items.every(first)));assert.equal(await p.evaluate(()=>rec),null);
 if(f<4){await p.locator('#again').click();await p.clock.runFor(400)}
 }
 assert.equal(new Set(ids).size,5);assert.equal(await p.evaluate(()=>instances.length),30);assert(await p.evaluate(()=>instances.every((r,i)=>r.starts===1&&Boolean(r.aborted)===(i%6===5))));
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length),5);await p.reload();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length),5);await c.close();
 });
 await test('iOS substitutions are exact and independent of correct answer; freddy is readiness only',async()=>{
 const [c,p]=await setup();await cue(p);await speech(p,'ready');
 for(const [word,value] of [['sex',6],['thor',4],['poor',4]]){
 await p.clock.runFor(400);await cue(p);await p.evaluate(()=>items[index].answer=99);await speech(p,word);assert.equal(await p.evaluate(()=>items[index].attempts.at(-1).value),value);assert.equal(await p.evaluate(()=>items[index].attempts.at(-1).correct),false);
 }
 await p.clock.runFor(400);await cue(p);const n=await p.evaluate(()=>items[index].attempts.length);await speech(p,'freddy');assert.equal(await p.evaluate(()=>items[index].attempts.length),n);assert.equal(await p.evaluate(()=>session.unrecognized.at(-1).text),'freddy');await c.close();
 });
 await test('Cancel during cue prevents late start; cue failure and timeout permit fallback',async()=>{
 const [c,p]=await setup();await p.evaluate(()=>window.lateCue=cues[0].onend);await p.locator('#cancelMic').click();await p.evaluate(()=>lateCue());assert.equal(await p.evaluate(()=>instances.length),0);assert.equal(await p.evaluate(()=>phase),'idle');await c.close();
 for(const timeout of [false,true]){const [c,p]=await setup();if(timeout)await p.clock.runFor(10000);else await p.evaluate(()=>cues[0].onerror());assert.equal(await p.evaluate(()=>micState),'disconnected');assert.equal(await p.evaluate(()=>session),null);assert.equal(await p.evaluate(()=>instances.length),0);await c.close()}
 });
 await test('Retry waits for confirmed end plus 400ms; missing shutdown blocks overlap',async()=>{
 const [c,p]=await setup();await cue(p);await p.locator('#retryMic').click();await p.clock.runFor(449);assert.equal(await p.evaluate(()=>cues.length),1);await p.clock.runFor(1);assert.equal(await p.evaluate(()=>cues.length),2);await cue(p);
 await p.evaluate(()=>abortEnds=false);await p.locator('#retryMic').click();await p.clock.runFor(3000);assert.equal(await p.evaluate(()=>cues.length),2);assert.equal(await p.evaluate(()=>micState),'disconnected');await c.close();
 });
 await test('Silent and error sessions never loop; observation does not forcibly stop speech',async()=>{
 for(const error of [null,'not-allowed','audio-capture','network']){
 const [c,p]=await setup();await cue(p);await p.evaluate(()=>testRecognition.onaudiostart());await p.clock.runFor(20000);assert.equal(await p.evaluate(()=>!!testRecognition.aborted),false);assert.equal(await p.evaluate(()=>phase),'checking');
 if(error)await p.evaluate(error=>testRecognition.onerror({error}),error);await p.evaluate(()=>testRecognition.onend());await p.clock.runFor(5000);assert.equal(await p.evaluate(()=>cues.length),1);assert.equal(await p.evaluate(()=>micState),'disconnected');await c.close();
 }
 });
 await test('Cancellation during cooldown invalidates next cue and late recognition',async()=>{
 const [c,p]=await setup();await cue(p);await p.evaluate(()=>window.lateResult=testRecognition.onresult);await speech(p,'not ready');await p.locator('#cancelMic').click();await p.clock.runFor(500);await p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;lateResult({resultIndex:0,results:[r]})});assert.equal(await p.evaluate(()=>cues.length),1);assert.equal(await p.evaluate(()=>phase),'idle');await c.close();
 });
 await test('Desktop retains continuous recognition, immediate final ready, interim fallback and no cues',async()=>{
 const [c,p]=await setup(false);assert.equal(await p.evaluate(()=>testRecognition.continuous),true);assert.equal(await p.evaluate(()=>cues.length),0);
 await speech(p,'freddy',{final:false,end:false});assert.equal(await p.evaluate(()=>phase),'checking');await speech(p,'ready',{end:false});assert.equal(await p.evaluate(()=>phase),'running');
 await p.evaluate(()=>{const r=[{transcript:String(items[index].answer)}];r.isFinal=false;testRecognition.onresult({resultIndex:1,results:[[],r]})});await p.clock.runFor(1300);await p.clock.runFor(400);assert.equal(await p.evaluate(()=>index),1);assert.equal(await p.evaluate(()=>parseVoiceNumber('sex')),null);assert.equal(await p.evaluate(()=>cues.length),0);await c.close();
 });

 await test('iOS timed expiry cancels pending cue; keyboard fallback and background stop remain usable',async()=>{
 const [c,p]=await setup();await cue(p);await speech(p,'ready');await p.clock.runFor(400);
 await p.evaluate(()=>{window.lateCue=cues.at(-1).onend;mode='test';flightTimeLimitMs=60000;started=performance.now()-60000;tick()});
 await p.evaluate(()=>lateCue());assert.equal(await p.evaluate(()=>phase),'done');assert.equal(await p.evaluate(()=>instances.length),1);assert.equal(await p.evaluate(()=>history[0].elapsed),60000);await c.close();
 const [c2,p2]=await setup();await cue(p2);await speech(p2,'ready');await p2.clock.runFor(400);await p2.evaluate(()=>window.dispatchEvent(new Event('pagehide')));assert.equal(await p2.evaluate(()=>micState),'disconnected');
 await p2.locator('#focusAnswer').fill(await p2.evaluate(()=>String(items[index].answer)));await p2.locator('#focusAnswer').press('Enter');await p2.clock.runFor(400);assert.equal(await p2.evaluate(()=>index),1);assert.equal(await p2.evaluate(()=>cues.length),2);await c2.close();
 });
 await test('Diagnostics exclude speech and learner data',async()=>{
 const [c,p]=await setup();await cue(p);await speech(p,'private spoken words');await p.locator('#micDiagnostics summary').click();const data=await download(p,'#downloadMicLog');const raw=JSON.stringify(data);assert(!raw.includes('private'));assert(!raw.includes('Test learner'));assert(!raw.includes('transcript'));await c.close();
 });
 await test('Completed iOS flights explicitly release final recognizer; background cannot restart it',async()=>{
 const [c,p]=await setup();await cue(p);await speech(p,'ready');
 for(let q=0;q<5;q++){await p.clock.runFor(400);await cue(p);await speech(p,await p.evaluate(()=>String(items[index].answer)));}
 await p.clock.runFor(400);assert.equal(await p.evaluate(()=>phase),'done');assert(await p.evaluate(()=>instances.at(-1).aborted));
 const count=await p.evaluate(()=>instances.length);await p.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await p.clock.runFor(30000);assert.equal(await p.evaluate(()=>instances.length),count);
 await p.locator('#again').click();await p.clock.runFor(400);await cue(p);await speech(p,'ready');assert.equal(await p.evaluate(()=>phase),'running');await c.close();
 });
 await test('Parent restriction persists, disables all learners and blocks direct reconnects and remembered voice',async()=>{
 const [c,p]=await setup(false);await p.locator('#cancelMic').click();await p.locator('#homeNav').click();await p.locator('[data-nav=parents]').click();await p.locator('#disableMicrophone').check();
 assert.equal(await p.evaluate(()=>localStorage.getItem(microphoneRestrictionKey)),'true');
 const before=await p.evaluate(()=>instances.length);await p.evaluate(()=>{connectMic();connectIOSMic()});assert.equal(await p.evaluate(()=>instances.length),before);
 await p.locator('#homeNav').click();await p.locator('[data-quick]').click();await p.locator('[data-activity=addition]').click();await p.locator('[data-next]').click();assert(await p.locator('[data-input=voice]').isDisabled());assert((await p.locator('[data-input=voice]').innerText()).includes('Parent restricted'));
 await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>session.input),'keyboard');await p.locator('#end').click();await p.reload();assert(await p.evaluate(()=>microphoneRestricted()));
 await p.locator('[data-learner=guest]').click();await p.locator('[data-nav=parents]').click();assert(await p.locator('#disableMicrophone').isChecked());await p.locator('#disableMicrophone').uncheck();assert.equal(await p.evaluate(()=>microphoneRestricted()),false);await c.close();
 });
 await test('Restriction arriving during iOS cue or recognition cancels capture and stale callbacks',async()=>{
 for(const launched of [false,true]){const [c,p]=await setup();if(launched)await cue(p);
 await p.evaluate(()=>{window.oldCue=cues.at(-1).onend;setMicrophoneRestriction(true)});await p.evaluate(()=>oldCue?.());await p.clock.runFor(1000);
 assert.equal(await p.evaluate(()=>phase),'idle');assert.equal(await p.evaluate(()=>rec),null);assert(await p.evaluate(()=>instances.every(r=>r.aborted)));await c.close();}
 });
 await test('Cross-tab parent restriction interrupts running voice and fails closed on storage errors',async()=>{
 const [c,p]=await setup(false);await speech(p,'ready',{end:false});const other=await c.newPage();await other.goto(url);await other.evaluate(()=>localStorage.setItem('fact-flight-microphone-disabled-v1','true'));await p.waitForFunction(()=>microphoneRestricted());
 assert.equal(await p.evaluate(()=>rec),null);assert(await p.locator('#resume').isDisabled());assert.equal(await p.evaluate(()=>phase),'running');await p.locator('#focusAnswer').fill(await p.evaluate(()=>String(items[index].answer)));await p.locator('#focusAnswer').press('Enter');await p.clock.runFor(400);assert.equal(await p.evaluate(()=>items.filter(first).length),1);
 await p.evaluate(()=>{Storage.prototype.setItem=function(){throw Error('blocked')};window.savedPolicy=setMicrophoneRestriction(false)});assert.equal(await p.evaluate(()=>savedPolicy),false);assert(await p.evaluate(()=>microphoneRestricted()));await c.close();
 });
 await test('Parent restriction covers missed review and remembered Quick start without touching history',async()=>{
 const [c,p]=await setup(false);await speech(p,'ready',{end:false});await p.evaluate(()=>submit(9999,'9999','voice'));await p.locator('#end').click();await p.waitForFunction(()=>document.querySelector('#profileSaveStatus')?.textContent.startsWith('Saved'));
 const history=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));await p.locator('#seeProgress').click();await p.locator('#progressReview').click();await p.evaluate(()=>setMicrophoneRestriction(true));assert(await p.locator('[data-review-input=voice]').isDisabled());assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),history);
 await p.locator('[data-review-start]').click();assert.equal(await p.evaluate(()=>session.input),'keyboard');await p.locator('#end').click();await p.locator('#resultHome').click();await p.locator('[data-quick-start]').click();assert.equal(await p.evaluate(()=>session.input),'keyboard');await c.close();
 });
 await test('No browser errors',()=>assert.deepEqual(errors,[]));
 fs.writeFileSync(path.join(output,'mic-lifecycle-results.json'),JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
