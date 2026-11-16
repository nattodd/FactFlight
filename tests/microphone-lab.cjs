// Isolated browser checks with fake recognition/synthesis; no real microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..');
const files={'/microphone-lab.html':'text/html','/scripts/microphone-lab.js':'application/javascript','/styles/brand.css':'text/css','/assets/brand/horizontal.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{if(!files[req.url]){res.writeHead(404);return res.end()}res.setHeader('Content-Type',files[req.url]);res.end(fs.readFileSync(path.join(root,req.url)))});
let browser,base,checks=0;
async function setup(){
 const c=await browser.newContext({viewport:{width:390,height:844}}),p=await c.newPage();
 await p.addInitScript(()=>{
  localStorage.setItem('lab-history-sentinel','unchanged');
  window.instances=[];window.autoEnd=true;window.cues=[];
  window.SpeechRecognition=class {
   constructor(){instances.push(this)}
   start(){this.onstart?.();this.onaudiostart?.()}
   stop(){this.stopped=true;if(autoEnd)this.onend?.()}
   abort(){this.aborted=true;if(autoEnd)this.onend?.()}
  };
  window.SpeechSynthesisUtterance=class {constructor(text){this.text=text}};
  Object.defineProperty(window,'speechSynthesis',{value:{speak(u){cues.push(u)},cancel(){}}});
 });
 await p.goto(base+'/microphone-lab.html');await p.clock.install();await p.clock.pauseAt(new Date());return {c,p};
}
async function result(p,final=true){await p.evaluate(final=>{const r=[{transcript:'PRIVATE TEST PHRASE'}];r.isFinal=final;instances.at(-1).onresult({resultIndex:0,results:[r]})},final)}
async function check(name,fn){await fn();checks++;console.log('PASS '+name)}
async function speak(p,text){await p.evaluate(text=>{const r=[{transcript:text}];r.isFinal=true;instances.at(-1).onresult({resultIndex:0,results:[r]})},text)}
async function cueEnd(p){await p.evaluate(()=>cues.at(-1).onend())}
async function naturalEnd(p){await p.evaluate(()=>instances.at(-1).onend());await p.clock.runFor(400)}
async function continuousWord(p,text,index,final=true){await p.evaluate(({text,index,final})=>{
 const r=[{transcript:text}];r.isFinal=final;
 const results=Array.from({length:index+1},()=>[{transcript:'earlier'}]);results[index]=r;
 instances.at(-1).onresult({resultIndex:index,results});
},{text,index,final})}
(async()=>{try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;
 browser=await chromium.launch({headless:true,channel:'chrome'});
 await check('Ten natural sessions use fresh objects, no forced stops, and cooldown before next tap',async()=>{
  const {c,p}=await setup();for(let i=0;i<10;i++){
   await p.locator('#start').click();await result(p);
   assert.equal(await p.evaluate(()=>instances.at(-1).continuous),false);
   assert.equal(await p.evaluate(()=>!!instances.at(-1).stopped||!!instances.at(-1).aborted),false);
   await p.evaluate(()=>instances.at(-1).onend());assert(await p.locator('#start').isDisabled());await p.clock.runFor(400);
  }assert.equal(await p.evaluate(()=>instances.length),10);await c.close();
 });
 await check('Silent recognition remains open after 20 seconds; cancel blocks overlap until end',async()=>{
  const {c,p}=await setup();await p.evaluate(()=>autoEnd=false);await p.locator('#start').click();await p.clock.runFor(21000);
  assert.match(await p.locator('#status').textContent(),/No results after 20/);assert.equal(await p.evaluate(()=>!!instances[0].aborted),false);
  await p.locator('#cancel').click();await p.clock.runFor(6000);assert(await p.locator('#start').isDisabled());
  await p.evaluate(()=>instances[0].onend());await p.clock.runFor(400);assert(await p.locator('#start').isEnabled());await c.close();
 });
 await check('Explicit-stop mode ignores interim results and stops on final result',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('stop');await p.locator('#start').click();await result(p,false);
  assert.equal(await p.evaluate(()=>!!instances[0].stopped),false);await result(p);assert(await p.evaluate(()=>instances[0].stopped));await c.close();
 });
 await check('Cue mode waits for synthesis end; cancelled cue cannot start recognition',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('cue');await p.locator('#start').click();
  assert.equal(await p.evaluate(()=>instances.length),0);await p.evaluate(()=>cues[0].onend());assert.equal(await p.evaluate(()=>instances.length),1);
  await p.locator('#cancel').click();await p.clock.runFor(400);await p.locator('#start').click();await p.evaluate(()=>window.lateCue=cues[1].onend);
  await p.locator('#cancel').click();await p.evaluate(()=>lateCue());assert.equal(await p.evaluate(()=>instances.length),1);await c.close();
 });
 await check('Cue timeout and permission error recover without overlapping sessions',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('cue');await p.locator('#start').click();await p.clock.runFor(10400);
  assert(await p.locator('#start').isEnabled());assert.equal(await p.evaluate(()=>instances.length),0);
  await p.locator('#mode').selectOption('natural');await p.locator('#start').click();await p.evaluate(()=>instances[0].onerror({error:'not-allowed'}));
  assert(await p.locator('#start').isDisabled());await p.evaluate(()=>instances[0].onend());await p.clock.runFor(400);assert(await p.locator('#start').isEnabled());await c.close();
 });
 await check('Export excludes transcripts; storage intact; page hide releases capture',async()=>{
  const {c,p}=await setup();await p.locator('#start').click();await result(p);
  const pending=p.waitForEvent('download');await p.locator('#download').click();const data=fs.readFileSync(await (await pending).path(),'utf8');
  assert(!data.includes('PRIVATE TEST PHRASE'));assert.equal(JSON.parse(data).attempts[0].results,1);
  assert.deepEqual(await p.evaluate(()=>Object.entries(localStorage)),[['lab-history-sentinel','unchanged']]);
  await p.evaluate(()=>dispatchEvent(new Event('pagehide')));assert(await p.evaluate(()=>instances[0].aborted));await c.close();
 });
 await check('Phone and landscape layouts fit without horizontal overflow',async()=>{
  const {c,p}=await setup();for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390}]){
   await p.setViewportSize(viewport);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await p.locator('#cancel').scrollIntoViewIfNeeded();const b=await p.locator('#cancel').boundingBox();assert(b.height>=44);
  }await p.setViewportSize({width:390,height:844});await p.screenshot({path:path.join(require('node:os').tmpdir(),'factflight-microphone-lab.png'),fullPage:true});await c.close();
 });
 await check('Hands-free flight uses one tap for ready plus five answers, next flight skips ready',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('flight');await p.locator('#start').click();
  for(const word of ['ready','two','3','four.','five','six']){await cueEnd(p);await speak(p,word);await naturalEnd(p)}
  assert.match(await p.locator('#status').textContent(),/Flight complete/);assert.equal(await p.locator('#start').textContent(),'Next flight');
  await p.locator('#start').click();await cueEnd(p);assert.match(await p.locator('#status').textContent(),/Question 1 of 5/);
  await speak(p,'2');await naturalEnd(p);
  for(const word of ['3','4','5','6']){await cueEnd(p);await speak(p,word);await naturalEnd(p)}
  assert.equal(await p.evaluate(()=>instances.length),11);
  assert(await p.evaluate(()=>instances.every(r=>!r.aborted&&!r.stopped)));
  const pending=p.waitForEvent('download');await p.locator('#download').click();const data=JSON.parse(fs.readFileSync(await (await pending).path(),'utf8'));
  assert.equal(data.events.filter(e=>e.event==='tap-start').length,2);assert.equal(data.events.filter(e=>e.event==='flight-completed').length,2);
  assert.equal(data.attempts.filter(r=>r.accepted).length,11);await c.close();
 });
 await check('Cancellation during automatic cooldown prevents next cue and invalidates late callbacks',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('flight');await p.locator('#start').click();await cueEnd(p);await speak(p,'ready');
  await p.evaluate(()=>{window.lateResult=instances[0].onresult;instances[0].onend()});await p.locator('#cancel').click();await p.clock.runFor(1000);
  assert.equal(await p.evaluate(()=>cues.length),1);assert(await p.locator('#start').isEnabled());
  await p.locator('#start').click();await p.evaluate(()=>lateResult({resultIndex:0,results:[]}));await cueEnd(p);assert.match(await p.locator('#status').textContent(),/Say ready/);await c.close();
 });
 await check('Wrong final answer and recognition error end flight without automatic retries',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('flight');await p.locator('#start').click();await cueEnd(p);await speak(p,'PRIVATE WRONG PHRASE');await naturalEnd(p);
  assert.match(await p.locator('#status').textContent(),/stopped before completion/);assert.equal(await p.evaluate(()=>cues.length),1);
  await p.locator('#start').click();await cueEnd(p);await speak(p,'ready');await p.evaluate(()=>instances.at(-1).onerror({error:'network'}));await naturalEnd(p);
  assert.match(await p.locator('#status').textContent(),/stopped before completion/);assert.equal(await p.evaluate(()=>cues.length),2);await c.close();
 });
 await check('Mode E uses one short cue and one continuous recognizer per flight, no question restarts',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('continuous');await p.locator('#start').click();
  assert.equal(await p.evaluate(()=>cues[0].text),'E');await cueEnd(p);assert(await p.evaluate(()=>instances[0].continuous));
  await continuousWord(p,'ready',0,false);assert.match(await p.locator('#status').textContent(),/Say ready/);
  const words=['ready','two','three','four','five','six'];
  for(let i=0;i<words.length;i++){
   await continuousWord(p,words[i],i);
   if(i<5){await continuousWord(p,words[i],i);assert.equal(await p.evaluate(()=>!!instances[0].stopped),false)}
  }
  assert(await p.evaluate(()=>instances[0].stopped));await p.clock.runFor(400);assert.match(await p.locator('#status').textContent(),/Flight complete/);
  await p.locator('#start').click();await cueEnd(p);assert.match(await p.locator('#status').textContent(),/Question 1/);
  for(let i=0;i<5;i++)await continuousWord(p,String(i+2),i);
  await p.clock.runFor(400);assert.match(await p.locator('#status').textContent(),/Flight complete/);
  assert.equal(await p.evaluate(()=>instances.length),2);assert.equal(await p.evaluate(()=>cues.length),2);
  const pending=p.waitForEvent('download');await p.locator('#download').click();const data=JSON.parse(fs.readFileSync(await (await pending).path(),'utf8'));
  assert.deepEqual(data.attempts.map(r=>r.acceptedCount),[6,5]);assert.equal(data.events.filter(e=>e.event==='flight-completed').length,2);await c.close();
 });
 await check('Mode E premature end, mismatch, and cancellation stop without automatic retries',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('continuous');await p.locator('#start').click();await cueEnd(p);
  await continuousWord(p,'ready',0);await naturalEnd(p);assert.match(await p.locator('#status').textContent(),/stopped before completion/);
  await p.locator('#start').click();await cueEnd(p);await continuousWord(p,'PRIVATE WRONG PHRASE',0);await p.clock.runFor(400);
  assert.match(await p.locator('#status').textContent(),/stopped before completion/);assert(await p.evaluate(()=>instances[1].stopped));
  await p.locator('#start').click();await cueEnd(p);await p.evaluate(()=>window.lateContinuous=instances.at(-1).onresult);await p.locator('#cancel').click();
  await p.evaluate(()=>lateContinuous({resultIndex:0,results:[]}));await p.clock.runFor(1000);assert.equal(await p.evaluate(()=>instances.length),3);assert(await p.locator('#start').isEnabled());await c.close();
 });
 await check('Mode F preserves D sequencing and cooldown, with E before all eleven phrases',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('shortFlight');await p.locator('#start').click();
  for(const word of ['ready','2','3','4','5','6']){
   await cueEnd(p);assert.equal(await p.evaluate(()=>instances.at(-1).continuous),false);await speak(p,word);
   const before=await p.evaluate(()=>cues.length);await p.evaluate(()=>instances.at(-1).onend());await p.clock.runFor(399);
   assert.equal(await p.evaluate(()=>cues.length),before);await p.clock.runFor(1);
  }
  assert.match(await p.locator('#status').textContent(),/Flight complete/);await p.locator('#start').click();
  for(const word of ['2','3','4','5','6']){await cueEnd(p);await speak(p,word);await naturalEnd(p)}
  assert.match(await p.locator('#status').textContent(),/Flight complete/);
  assert(await p.evaluate(()=>cues.length===11&&cues.every(u=>u.text==='E')));
  assert(await p.evaluate(()=>instances.length===11&&instances.every(r=>!r.stopped&&!r.aborted)));
  const pending=p.waitForEvent('download');await p.locator('#download').click();const data=JSON.parse(fs.readFileSync(await (await pending).path(),'utf8'));
  assert(data.attempts.every(r=>r.mode==='shortFlight'&&r.accepted));assert.equal(data.events.filter(e=>e.event==='flight-completed').length,2);
  await p.locator('#mode').selectOption('flight');await p.locator('#start').click();assert.equal(await p.evaluate(()=>cues.at(-1).text),'Your turn');await c.close();
 });
 await check('Mode F cancellation blocks automatic next, and mismatch stops the flight',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('shortFlight');await p.locator('#start').click();await cueEnd(p);await speak(p,'ready');
  await p.evaluate(()=>instances[0].onend());await p.locator('#cancel').click();await p.clock.runFor(1000);assert.equal(await p.evaluate(()=>cues.length),1);
  await p.locator('#start').click();await cueEnd(p);await speak(p,'PRIVATE WRONG PHRASE');await naturalEnd(p);
  assert.match(await p.locator('#status').textContent(),/stopped before completion/);assert.equal(await p.evaluate(()=>cues.length),2);await c.close();
 });
 await check('Mode G keeps D natural endings and 400ms cooldown with rate-2 cues and timing events',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('fastFlight');await p.locator('#start').click();
  for(const word of ['ready','2','3','4','5','6']){
   await p.evaluate(()=>cues.at(-1).onstart());await cueEnd(p);await speak(p,word);
   const before=await p.evaluate(()=>cues.length);await p.evaluate(()=>instances.at(-1).onend());await p.clock.runFor(399);
   assert.equal(await p.evaluate(()=>cues.length),before);await p.clock.runFor(1);
  }
  await p.locator('#start').click();for(const word of ['2','3','4','5','6']){await p.evaluate(()=>cues.at(-1).onstart());await cueEnd(p);await speak(p,word);await naturalEnd(p)}
  assert.match(await p.locator('#status').textContent(),/Flight complete/);
  assert(await p.evaluate(()=>cues.length===11&&cues.every(u=>u.text==='Your turn'&&u.rate===2)));
  assert(await p.evaluate(()=>instances.every(r=>!r.continuous&&!r.stopped&&!r.aborted)));
  const pending=p.waitForEvent('download');await p.locator('#download').click();const data=JSON.parse(fs.readFileSync(await (await pending).path(),'utf8'));
  assert.equal(data.events.filter(e=>e.event==='cue-start').length,11);assert(data.events.filter(e=>e.event==='cue-requested').every(e=>e.rate===2));
  await p.locator('#mode').selectOption('flight');await p.locator('#start').click();assert.equal(await p.evaluate(()=>cues.at(-1).rate),undefined);assert.equal(await p.evaluate(()=>cues.at(-1).text),'Your turn');await c.close();
 });
 await check('Mode G heard text uses plain text, survives mismatch, never exports and clears on retry/cancel/mode change',async()=>{
  const {c,p}=await setup();await p.locator('#mode').selectOption('fastFlight');await p.locator('#start').click();await cueEnd(p);
  const secret='<img src=x> PRIVATE SIX MISMATCH';await speak(p,secret);await naturalEnd(p);
  assert.equal(await p.locator('#heardText').textContent(),'Final: '+secret);assert.equal(await p.locator('#heardText img').count(),0);
  const pending=p.waitForEvent('download');await p.locator('#download').click();const data=fs.readFileSync(await (await pending).path(),'utf8');assert(!data.includes('PRIVATE SIX MISMATCH'));
  assert.deepEqual(await p.evaluate(()=>Object.entries(localStorage)),[['lab-history-sentinel','unchanged']]);assert.equal(await p.evaluate(()=>sessionStorage.length),0);
  await p.locator('#clearHeard').click();assert.equal(await p.locator('#heardText').textContent(),'');
  await p.locator('#start').click();await cueEnd(p);await speak(p,'ready');await naturalEnd(p);assert.equal(await p.locator('#heardText').textContent(),'');
  await cueEnd(p);await speak(p,'2');await p.locator('#cancel').click();assert.equal(await p.locator('#heardText').textContent(),'');await p.clock.runFor(400);
  await p.locator('#mode').selectOption('flight');assert(await p.locator('#heardPanel').isHidden());await c.close();
 });
 console.log(`${checks} checks passed; real device speech remains unverified.`);
}finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
