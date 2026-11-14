// Integrated app tests: isolated contexts, synthetic history, no real microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.FF_TEST_OUTPUT||require('node:os').tmpdir();fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const files={'/styles/menus.css':'styles/menus.css','/scripts/menus.js':'scripts/menus.js','/':'index.html','/scripts/math-activities.js':'scripts/math-activities.js','/styles/brand.css':'styles/brand.css','/assets/brand/horizontal.svg':'assets/brand/horizontal.svg'};const f=files[req.url];if(!f){res.writeHead(404);return res.end()}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html');const content=fs.readFileSync(path.join(root,f));res.end(f==='index.html'?require('./engine-fixture.cjs')(content):content)});
const results=[],errors=[];let browser,url;
async function test(name,fn){if(process.env.FF_TEST_FILTER&&!name.includes(process.env.FF_TEST_FILTER))return;try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.stack})}console.log(JSON.stringify(results.at(-1)))}
async function page(options={}){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);return [c,p]}
async function setup(p,activity,level='4',count='5',mode='practice',input='keyboard'){await p.locator('#practiceNav').click();await p.locator('#activity').selectOption(activity);await p.locator('#sessionView').selectOption('worksheet');await p.locator('#level').selectOption(level);await p.locator('#questionCount').selectOption(count);await p.locator(mode==='test'?'#testMode':'#practiceMode').click();await p.locator('#inputMode').selectOption(input)}
async function answer(p,value){await p.locator('.keyboard-active input').fill(String(value??await p.evaluate(()=>items[index].answer)));await p.locator('.keyboard-active input').press('Enter')}
(async()=>{
await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
await test('Focus and Worksheet score identical scripted attempts without changing saved schema',async()=>{
 const [c,p]=await page();const snapshots=[];
 for(const view of ['worksheet','focus']){
  await setup(p,'addition','0','5');await p.locator('#sessionView').selectOption(view);await p.locator('#start').click();
  const input=()=>p.locator(view==='focus'?'#focusAnswer':'.keyboard-active input');
  const send=async n=>{await input().fill(String(n));await input().press('Enter');await require('./feedback-wait.cjs')(p)};
  await send(9999);await send(await p.evaluate(()=>items[index].answer));await p.locator('#skip').click();await p.locator('#undo').click();await p.locator('#skip').click();
  await p.locator('#end').click();snapshots.push(await p.evaluate(()=>({stats:stats(history[0]),fields:Object.keys(history[0]).sort(),attempts:history[0].items.map(p=>[p.status,p.skips,p.attempts.map(a=>a.correct)])})));
  assert(!(await p.locator('body').getAttribute('class')||'').includes('focus-session'));
 }
 assert.deepEqual(snapshots[0],snapshots[1]);await p.reload();assert.equal(await p.evaluate(()=>history.length),2);await c.close();
});
await test('School Focus voice ready, heard text, retry, advance, reconnect and expiry',async()=>{
 const [c,p]=await page();await p.addInitScript(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});await p.reload();await p.clock.install();p.feedbackClock=true;
 assert.equal(await p.locator('#sessionView').inputValue(),'worksheet');await p.locator('#sessionView').selectOption('focus');await p.locator('#start').click();
 let idx=0;const say=text=>p.evaluate(({text,index})=>{const r=[{transcript:text}];r.isFinal=true;testRecognition.onresult({resultIndex:index,results:Array(index+1).fill(r)})},{text,index:idx++});
 await say('ready');assert.equal(await p.evaluate(()=>items.length),60);assert(await p.locator('#focusEquation').isVisible());assert(!(await p.locator('#grid').isVisible()));
 await say('9999');assert.equal(await p.evaluate(()=>index),0);assert((await p.locator('#heard').innerText()).includes('9999'));assert((await p.locator('#focusFeedback').innerText()).includes('try'));
 await say(String(await p.evaluate(()=>items[index].answer)));await require('./feedback-wait.cjs')(p);assert.equal(await p.evaluate(()=>index),1);assert((await p.locator('#focusPosition').innerText()).toLowerCase().includes('2 of 60'));
 await p.evaluate(()=>setMicStatus('disconnected'));await p.locator('#micReconnectTop').click();assert.equal(await p.locator('#micStatus').getAttribute('data-state'),'connected');
 await p.clock.fastForward(120100);assert(await p.locator('#resultsView').isVisible());assert.equal(await p.evaluate(()=>history[0].elapsed),120000);assert.equal(await p.evaluate(()=>history[0].activity),undefined);await c.close();
});
for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1024,768],[1440,900]])await test(`Focus layouts and keypad ${width}x${height}`,async()=>{
 const [c,p]=await page({viewport:{width,height},hasTouch:width<1440,isMobile:width<1440,reducedMotion:'reduce'});
 await p.locator('#activity').selectOption('addition');assert.equal(await p.locator('#sessionView').inputValue(),width<=680?'focus':'worksheet');
 for(const activity of ['addition','subtraction','multiplication','division','bonds','doubles','halves','squares']){
  await setup(p,activity,'4','5');await p.locator('#sessionView').selectOption('focus');await p.locator('#start').click();
  const n=String(await p.evaluate(()=>items[index].answer));for(const d of n)await p.locator(`[data-focus-digit="${d}"]`).click();await p.locator('#focusForm button[type=submit]').click();await require('./feedback-wait.cjs')(p);assert.equal(await p.evaluate(()=>index),1);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow');
  for(const id of ['focusEquation','end','focusAnswer']){await p.locator('#'+id).scrollIntoViewIfNeeded();const box=await p.locator('#'+id).boundingBox();assert(box&&box.y>=-1&&box.y+box.height<=height+1,`${id} outside viewport`)}
  if(activity==='bonds')await p.screenshot({path:path.join(output,`focus-${width}x${height}.png`)});
  await p.locator('#end').click();
 }
 await c.close();
});
await test('School voice phone layout and keypad fallback',async()=>{
 const [c,p]=await page({viewport:{width:320,height:568},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 await p.addInitScript(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});await p.reload();await p.locator('#sessionView').selectOption('focus');await p.locator('#start').click();
 await p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;testRecognition.onresult({resultIndex:0,results:[r]})});
 await p.screenshot({path:path.join(output,'school-voice-phone.png')});for(const id of ['focusEquation','heard','end']){await p.locator('#'+id).scrollIntoViewIfNeeded();const b=await p.locator('#'+id).boundingBox();assert(b&&b.y>=-1&&b.y+b.height<=569,id+' outside screen '+JSON.stringify(b))}
 const n=String(await p.evaluate(()=>items[index].answer));for(const d of n)await p.locator(`[data-focus-digit="${d}"]`).click();await p.locator('#focusForm button[type=submit]').click();await require('./feedback-wait.cjs')(p);assert.equal(await p.evaluate(()=>index),1);await p.screenshot({path:path.join(output,'school-voice-phone.png')});await c.close();
});
await test('School Focus nonvoice completion, first-try and history preserved',async()=>{
 const [c,p]=await page();await p.locator('#sessionView').selectOption('focus');await p.locator('#inputMode').selectOption('keyboard');await p.locator('#start').click();
 for(let i=0;i<60;i++){await p.locator('#focusAnswer').fill(String(await p.evaluate(()=>items[index].answer)));await p.locator('#focusAnswer').press('Enter');await require('./feedback-wait.cjs')(p)}
 assert.equal(await p.evaluate(()=>stats(history[0]).first),60);assert.equal(await p.evaluate(()=>history[0].reason),'complete');await p.reload();await p.locator('#historyNav').click();await p.locator('[data-review="0"]').click();assert(await p.locator('#resultsView').isVisible());await c.close();
});
await test('No uncaught browser errors',()=>assert.deepEqual(errors,[]));
fs.writeFileSync(path.join(output,'focus-results.json'),JSON.stringify({results,errors},null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
