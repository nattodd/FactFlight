// Integrated app tests: isolated contexts, synthetic history, no real microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.FF_TEST_OUTPUT||require('node:os').tmpdir();fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const files={'/scripts/profile-store.js':'scripts/profile-store.js','/scripts/profiles.js':'scripts/profiles.js','/':'index.html','/scripts/menus.js':'scripts/menus.js','/styles/menus.css':'styles/menus.css','/scripts/math-activities.js':'scripts/math-activities.js','/styles/brand.css':'styles/brand.css','/assets/brand/horizontal.svg':'assets/brand/horizontal.svg'};const f=files[req.url];if(!f){res.writeHead(404);return res.end()}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,f)))});
const results=[],errors=[];let browser,url;
async function test(name,fn){if(process.env.FF_TEST_FILTER&&!name.includes(process.env.FF_TEST_FILTER))return;try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.stack})}console.log(JSON.stringify(results.at(-1)))}
async function page(options={}){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.locator("[data-create-profile]").click();await p.locator("#nickname").fill("Test learner");await p.locator("#profileForm button").click();await p.locator("[data-quick]").waitFor();return [c,p]}

async function choose(p,{activity='addition',mode='quick',view='focus',input='keypad',level=0,count=5,table=2}={}){
 if(await p.locator('[data-learner]').count())await p.locator('[data-learner]:not([data-learner=guest])').first().click();
 await p.locator('#homeNav').click();
 if(mode==='school'){await p.locator('[data-math]').click();await p.locator('[data-school]').click();await p.locator(`[data-table="${table}"]`).click()}
 else {
  await p.locator(mode==='quick'?'[data-quick]':'[data-math]').click();await p.locator(`[data-activity="${activity}"]`).click();
  if(mode!=='quick')await p.locator(`[data-mode="${mode}"]`).click();
  await p.locator(`[data-level="${level}"]`).click();if(!['free','test'].includes(mode))await p.locator(`[data-count="${count}"]`).click();
 }
 await p.locator('[data-next]').click();await p.locator(`[data-input="${input}"]`).click();await p.locator(`[data-view="${view}"]`).click();
 await p.locator('[data-start]').click();
}
async function answer(p,value){const field=p.locator(await p.evaluate(()=>activeView==='focus')?'#focusAnswer':'.keyboard-active input');await field.fill(String(value??await p.evaluate(()=>items[index].answer)));await field.press('Enter')}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
 await test('Home tiles and Quick completion for all eight activities in both views',async()=>{
  const [c,p]=await page();assert(await p.locator('#menuView').isVisible());assert.equal(await p.locator('#menuView button:disabled').count(),3);assert.equal(await p.locator('select:visible').count(),0);
  for(const view of ['focus','worksheet'])for(const activity of ['addition','subtraction','multiplication','division','bonds','doubles','halves','squares']){
   await choose(p,{activity,view,level:4});assert.equal(await p.evaluate(()=>items.length),5);
   for(let i=0;i<5;i++)await answer(p);
   assert.equal(await p.evaluate(()=>history[0].reason),'complete');assert.equal(await p.evaluate(()=>stats(history[0]).first),5);assert(await p.locator('#resultHome').isVisible());await p.locator('#resultHome').click();
  }
  await p.waitForFunction(()=>JSON.parse(localStorage.getItem("fact-flight-family-v1")).sessions.length===16);await p.reload();await p.locator("[data-learner]:not([data-learner=guest])").first().click();assert.equal(await p.evaluate(()=>history.length),16);await c.close();
 });
 await test('Free Practice exceeds 120 answers, preserves skip/undo and excludes unseen tail',async()=>{
  for(const view of ['focus','worksheet']){const [c,p]=await page();await p.clock.install();await choose(p,{mode:'free',view,activity:'squares'});await p.clock.fastForward(180000);assert.equal(await p.evaluate(()=>phase),'running');
   assert.equal(await p.evaluate(()=>items.length),1);await answer(p,9999);await answer(p);await p.locator('#skip').click();
   const next=await p.evaluate(()=>items[index].text);await p.locator('#undo').click();assert.equal(await p.evaluate(()=>index),1);await p.locator('#skip').click();assert.equal(await p.evaluate(()=>items[index].text),next);
   // Exercise continuous generation well past every previous question-count limit.
   await p.evaluate(()=>{for(let n=0;n<125;n++)submit(items[index].answer,String(items[index].answer),'keyboard')});
   assert.equal(await p.evaluate(()=>phase),'running');assert.equal(await p.evaluate(()=>index),127);assert.equal(await p.evaluate(()=>items.length),128);
   assert(await p.evaluate(()=>items.every((p,i)=>!items.slice(Math.max(0,i-3),i).some(q=>q.key===p.key))));
   await p.locator('#end').click();assert.equal(await p.evaluate(()=>history[0].items.length),127);assert.deepEqual(await p.evaluate(()=>stats(history[0])),{first:125,correct:126,wrong:0,unanswered:1,errors:1,skips:1});
   await p.waitForFunction(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length===1);const saved=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));await p.reload();assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),saved);await c.close();
  }
 });
 await test('Home/Progress guard retains session, finish saves once, timer expires through dialog',async()=>{
  const [c,p]=await page();await p.clock.install();await choose(p,{mode:'timed',count:10});await answer(p);
  const before=await p.evaluate(()=>JSON.stringify(items));for(const nav of ['sessionHome','homeNav','historyNav']){await p.locator('#'+nav).evaluate(e=>e.click());assert(await p.locator('#exitDialog').isVisible());await p.clock.fastForward(1000);await p.locator('#continueFlight').click();assert.equal(await p.evaluate(()=>JSON.stringify(items)),before)}
  await p.locator('#sessionHome').click();await p.locator('#finishFlight').click();assert(await p.locator('#resultsView').isVisible());assert.equal(await p.evaluate(()=>history.length),1);await p.locator('#resultHome').click();assert(await p.locator('[data-quick]').isVisible());
  await choose(p,{mode:'test'});assert.equal(await p.evaluate(()=>items.length),60);await p.locator('#sessionHome').click();await p.clock.fastForward(120100);assert(!(await p.locator('#exitDialog').isVisible()));assert.equal(await p.evaluate(()=>history[0].reason),'time');await c.close();
 });
 await test('School original preset and voice ready/retry/reconnect through tile menus',async()=>{
  const [c,p]=await page();await p.addInitScript(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});await p.reload();await choose(p,{mode:'school',table:7,input:'voice'});assert.equal(await p.evaluate(()=>phase),'checking');
  let idx=0;const say=text=>p.evaluate(({text,index})=>{const r=[{transcript:text}];r.isFinal=true;testRecognition.onresult({resultIndex:index,results:Array(index+1).fill(r)})},{text,index:idx++});
  await say('ready');assert.equal(await p.evaluate(()=>items.length),60);assert.equal(await p.evaluate(()=>table),7);assert.equal(await p.evaluate(()=>mode),'test');assert.equal(await p.evaluate(()=>freePractice),false);
  await say('9999');assert.equal(await p.evaluate(()=>index),0);await say(String(await p.evaluate(()=>items[index].answer)));assert.equal(await p.evaluate(()=>index),1);assert((await p.locator('#heard').innerText()).includes('Heard'));
  await p.evaluate(()=>setMicStatus('disconnected'));await p.locator('#micReconnectTop').click();assert.equal(await p.locator('#micStatus').getAttribute('data-state'),'connected');await p.locator('#end').click();assert.equal(await p.evaluate(()=>history[0].table),7);assert.equal(await p.evaluate(()=>history[0].activity),undefined);await c.close();
 });
 await test('Microphone cancellation returns to selected ready step and keyboard fallback',async()=>{
  const [c,p]=await page();await p.addInitScript(()=>{window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined});await p.reload();await choose(p,{input:'voice'});await p.locator('#cancelMic').click();assert(await p.locator('[data-start]').isVisible());await p.locator('[data-input=keypad]').click();await p.locator('[data-start]').click();await answer(p);await p.locator('#end').click();assert.equal(await p.evaluate(()=>stats(history[0]).first),1);await c.close();
 });
 await test('Empty Free finish, target validation, Back and activity reports',async()=>{
  const [c,p]=await page();await choose(p,{mode:'free'});await p.locator('#end').click();assert(!(await p.locator('#resultsView').innerText()).includes('NaN'));assert.equal(await p.evaluate(()=>history[0].items.length),0);await p.locator('#again').click();assert((await p.locator('.review').innerText()).includes('until you finish'));await p.locator('#menuView summary').click();await p.locator('#target').fill('50');await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>session.target),50);await p.locator('#end').click();
  if(await p.locator('[data-learner]').count())await p.locator('[data-learner]:not([data-learner=guest])').first().click();
 await p.locator('#homeNav').click();await p.locator('[data-quick]').click();await p.locator('[data-activity=bonds]').click();await p.locator('[data-level="3"]').click();await p.locator('[data-count="10"]').click();await p.locator('[data-next]').click();await p.locator('#menuView summary').click();await p.locator('#target').fill('11');await p.locator('[data-start]').click();assert(await p.locator('#target').isVisible());assert.notEqual(await p.evaluate(()=>phase),'running');await p.locator('#target').fill('5');await p.locator('[data-back]').click();assert.equal(await p.locator('[data-level="3"]').getAttribute('aria-pressed'),'true');await p.locator('[data-next]').click();await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>session.target),5);await p.locator('#end').click();await p.locator('#seeProgress').click();await p.locator('[data-activity-progress=bonds]').click();assert.equal(await p.locator('[data-review]').count(),1);await c.close();
 });
 for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1440,1000]])await test(`Tile menu and session layout ${width}x${height}`,async()=>{
  const [c,p]=await page({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,reducedMotion:'reduce'});
  const shot=async step=>{assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),step+' overflow');if(width===390||width===1440)await p.screenshot({path:path.join(output,`menu-${step}-${width}.png`),fullPage:true})};
  await shot('home');await p.locator('[data-math]').click();await shot('math');await p.locator('[data-activity=addition]').click();await shot('mode');await p.locator('[data-mode=free]').click();await shot('level');await p.locator('[data-next]').click();await shot('ready');await p.locator('[data-view=focus]').click();await p.locator('[data-start]').click();
  const flightBox=await p.locator('#practiceView').boundingBox();if(flightBox.height<height-32)assert(Math.abs(flightBox.y+flightBox.height/2-height/2)<5,'flight should be vertically centered');
  for(const id of ['skip','undo','end','sessionHome']){await p.locator('#'+id).scrollIntoViewIfNeeded();const b=await p.locator('#'+id).boundingBox();assert(b&&b.y>=-1&&b.y+b.height<=height+1,id+' unreachable after scrolling')}
  if(width===390||width===1440)await p.screenshot({path:path.join(output,`flight-centered-${width}.png`)});
  await p.locator('#sessionHome').click();await p.locator('#continueFlight').click();await p.locator('[data-focus-digit="1"]').click();await p.locator('#focusForm button[type=submit]').click();await p.locator('#end').click();await p.locator('#resultHome').click();assert(await p.locator('[data-math]').isVisible());await c.close();
 });
 await test('Short Focus viewport keeps the top and scrollable controls reachable',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await choose(p);await p.setViewportSize({width:390,height:400});
  await p.evaluate(()=>window.scrollTo(0,0));assert((await p.locator('#practiceView').boundingBox()).y>=0);
  await p.locator('#sessionHome').scrollIntoViewIfNeeded();const b=await p.locator('#sessionHome').boundingBox();assert(b.y>=0&&b.y+b.height<=400);await p.locator('#sessionHome').click();assert(await p.locator('#exitDialog').isVisible());await c.close();
 });
 await test('No uncaught browser errors',()=>assert.deepEqual(errors,[]));fs.writeFileSync(path.join(output,'menu-results.json'),JSON.stringify({results,errors},null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
