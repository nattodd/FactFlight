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
 console.log(`${checks} checks passed; real device speech remains unverified.`);
}finally{await browser?.close();server.close()}})().catch(e=>{console.error(e);process.exitCode=1});
