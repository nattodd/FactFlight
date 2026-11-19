// Design-only checks; no production app/history or real microphone access.
// NODE_PATH must point to a separately installed Playwright package.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const output=process.env.FF_TEST_OUTPUT||path.join(require('node:os').tmpdir(),'factflight-design-tests');
fs.mkdirSync(output,{recursive:true});
const url=pathToFileURL(path.resolve(__dirname,'../design-reference/ui-v6/v6-experience-preview.html')).href;
let browser;const results=[],errors=[];
const test=async(name,fn)=>{try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.message})}console.log(JSON.stringify(results.at(-1)))};
(async()=>{
 browser=await chromium.launch({headless:true,channel:'chrome'});
 const ctx=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
 await ctx.addInitScript(()=>{Storage.prototype.getItem=Storage.prototype.setItem=()=>{throw Error('Preview accessed persistent storage')};});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 p.on('request',r=>{if(/^https?:/.test(r.url()))errors.push('Remote request: '+r.url())});
 await p.goto(url);
 const answer=async()=>{const n=await p.evaluate(()=>flight.items[flight.index].answer);for(const d of String(n))await p.locator(`[data-digit="${d}"]`).click();await p.locator('#answer-form button[type=submit]').click()};
 await test('Home, theme, logo and optional learner journey',async()=>{
  assert.equal(await p.locator('[data-activity]').count(),8);
  assert(await p.locator('.logo').evaluate(e=>e.complete&&e.naturalWidth>0));
  await p.screenshot({path:path.join(output,'home-desktop-light.png'),fullPage:true});
  await p.locator('[data-action=theme]').click();await p.screenshot({path:path.join(output,'home-desktop-dark.png'),fullPage:true});
  await p.locator('[data-action=profiles]').click();await p.locator('[data-profile=comet]').click();assert((await p.locator('.learner').innerText()).includes('Comet'));
  await p.locator('[data-action=profiles]').click();await p.locator('#profile-form button[type=submit]').click();assert((await p.locator('.learner').innerText()).includes('Learner 3'));
 });
 await test('Quick flow: wrong, correction, skip, undo, completion and learner progress',async()=>{
  await p.locator('[data-action=quick]').click();await p.locator('[data-digit="9"]').click();await p.locator('[data-digit="9"]').click();await p.locator('#answer-form button[type=submit]').click();assert((await p.locator('.feedback').innerText()).includes('Try again'));
  await answer();await p.locator('[data-action=skip]').click();await p.locator('[data-action=undo]').click();assert.equal(await p.evaluate(()=>flight.index),1);
  for(let i=0;i<4;i++)await answer();assert.equal(await p.evaluate(()=>screen),'results');assert.equal(await p.evaluate(()=>lastResult.items.filter(p=>p.attempts.length===1&&p.status==='correct').length),4);
  await p.locator('#app [data-go=progress]').click();await p.locator('[data-progress-activity=multiplication]').click();assert.equal(await p.locator('[data-review]').count(),1);await p.locator('[data-review="0"]').click();assert.equal(await p.evaluate(()=>screen),'results');
 });
 await test('School worksheet, exit confirmation and return Home',async()=>{
  await p.locator('#app [data-go=home]').click();await p.locator('[data-action=school]').click();await p.locator('[data-action=start]').click();assert.equal(await p.locator('.fact').count(),60);assert.equal(await p.locator('.column').count(),3);
  await p.locator('nav [data-go=home]').click();assert(await p.locator('#leave').isVisible());await p.locator('[data-action=continue]').click();assert.equal(await p.evaluate(()=>flight.done),false);
  await p.locator('[data-action=leave]').click();await p.locator('[data-action=finish]').click();assert.equal(await p.evaluate(()=>screen),'results');await p.locator('#app [data-go=home]').click();assert.equal(await p.evaluate(()=>screen),'home');
 });
 await test('All activity levels produce valid illustrative answers',async()=>{
  assert(await p.evaluate(()=>{for(const a of Object.keys(activities))for(let l=0;l<5;l++){config={...config,activity:a,level:l,mode:'quick'};const source=createQuestionSource(config);for(let i=0;i<60;i++){const q=source.next();if(!Number.isInteger(q.answer)||q.answer<0||q.answer>2500)return false;}}return true}));
  for(const activity of ['addition','subtraction','division','bonds','doubles','halves','squares','multiplication']){
   await require('./menu-route.cjs')(p,activity);await p.locator('#level').selectOption('4');assert.equal(await p.locator('#level').inputValue(),'4');await p.locator('#app [data-go=home]').click();
  }
 });
 await test('Practice again randomizes identical settings across all eight activities',async()=>{
  for(const activity of ['multiplication','addition','subtraction','division','bonds','doubles','halves','squares']){
   await require('./menu-route.cjs')(p,activity);
   await p.locator('#level').selectOption('2');await p.locator('#count').selectOption('20');
   await p.locator('[data-action=start]').click();
   const first=await p.evaluate(()=>({config:flight.config,keys:flight.items.map(q=>q.key),text:flight.items.map(q=>q.text)}));
   await p.locator('[data-action=leave]').click();await p.locator('[data-action=finish]').click();
   await p.locator('[data-action=again]').click();await p.locator('[data-action=start]').click();
   const second=await p.evaluate(()=>({config:flight.config,keys:flight.items.map(q=>q.key),text:flight.items.map(q=>q.text)}));
   assert.deepEqual(second.config,first.config,`${activity}: settings changed`);
   assert.notDeepEqual(second.keys,first.keys,`${activity}: fact order repeated`);
   assert.notDeepEqual(second.text,first.text,`${activity}: display order repeated`);
   // Different sessions may legitimately share facts, especially in small pools.
   // Check ordering here; seeded generator tests cover pool coverage and spacing.
   await p.locator('[data-action=leave]').click();await p.locator('[data-action=finish]').click();await p.locator('#app [data-go=home]').click();
  }
 });
 await test('Challenge timeout with fake clock; free practice adds a batch',async()=>{
  await p.clock.install();await require('./menu-route.cjs')(p,'addition');await p.locator('#mode').selectOption('challenge');await p.locator('#seconds').selectOption('60');await p.locator('[data-action=start]').click();await p.clock.fastForward(61000);assert.equal(await p.evaluate(()=>lastResult.reason),'Time’s up');
  await p.locator('#app [data-go=home]').click();await require('./menu-route.cjs')(p,'addition');await p.locator('#mode').selectOption('free');await p.locator('[data-action=start]').click();for(let i=0;i<10;i++)await answer();assert.equal(await p.evaluate(()=>flight.items.length),20);await p.locator('[data-action=leave]').click();await p.locator('[data-action=finish]').click();
 });
 await test('Sample export/import review and memory reset',async()=>{
  await p.locator('nav [data-go=settings]').click();const wait=p.waitForEvent('download');await p.locator('[data-action=export]').click();const d=await wait;const sample=JSON.parse(fs.readFileSync(await d.path(),'utf8'));assert(sample.notAnAppBackup);
  await p.locator('[data-action=import]').click();await p.locator('[data-action=confirm-import]').click();assert((await p.locator('#backup-message').innerText()).includes('No records'));
  await p.reload();assert.equal(await p.evaluate(()=>profiles.length),2);assert.equal(await p.evaluate(()=>results.length),0);
 });
 for(const [w,h] of [[390,844],[320,568],[844,390],[768,1024],[1024,768]])await test(`Responsive Home and Focus ${w}x${h}`,async()=>{
  const c=await browser.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});const q=await c.newPage();q.on('pageerror',e=>errors.push(e.message));await q.goto(url);
  assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Home horizontal overflow');await q.screenshot({path:path.join(output,`home-${w}x${h}.png`),fullPage:true});
  await q.locator('[data-action=quick]').click();assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Focus horizontal overflow');
  await q.screenshot({path:path.join(output,`focus-${w}x${h}.png`),fullPage:true});
  const finish=await q.locator('[data-action=leave]').boundingBox();assert(finish.y+finish.height<=h,`Focus Finish below viewport: ${finish.y+finish.height} > ${h}`);await c.close();
 });
 await test('Higher levels fit small screens and accept four-digit answers',async()=>{
  for(const [w,h] of [[320,568],[844,390]]){
   const c=await browser.newContext({viewport:{width:w,height:h},hasTouch:true,isMobile:true});const q=await c.newPage();q.on('pageerror',e=>errors.push(e.message));await q.goto(url);
   for(const activity of ['addition','subtraction','multiplication','division','bonds','doubles','halves','squares']){
    await require('./menu-route.cjs')(q,activity);await q.locator('#level').selectOption('4');await q.locator('[data-action=start]').click();
    assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${activity}: overflow`);
    const finish=await q.locator('[data-action=leave]').boundingBox();assert(finish.y+finish.height<=h,`${activity}: finish hidden`);
    await q.locator('[data-action=leave]').click();await q.locator('[data-action=finish]').click();await q.locator('#app [data-go=home]').click();
   }
   await c.close();
  }
  await require('./menu-route.cjs')(p,'squares');await p.locator('#level').selectOption('4');await p.locator('#mode').selectOption('challenge');await p.locator('#count').selectOption('30');await p.locator('#seconds').selectOption('0');await p.locator('[data-action=start]').click();
  assert(await p.evaluate(()=>flight.items.some(q=>q.answer===2500)));
  for(let i=0;i<30;i++)await answer();assert.equal(await p.evaluate(()=>lastResult.items.filter(q=>q.status==='correct').length),30);
  await p.locator('#app [data-go=home]').click();
 });
 await test('Activity summaries, learner isolation, drill-down and mobile layout',async()=>{
  const c=await browser.newContext({viewport:{width:1280,height:900}});const q=await c.newPage();q.on('pageerror',e=>errors.push(e.message));await q.goto(url);
  await q.evaluate(()=>{
   const make=(activity,owner,items)=>({config:{...config,activity,mode:'quick'},learner:owner,name:owner,items,start:Date.now(),elapsed:30,done:true,reason:'Session ended'});
   const fact=(status,attempts,skips=0)=>({text:'2 + 2',answer:4,status,attempts,skips});
   results=[make('addition','guest',[fact('correct',[true]),fact('correct',[false,true]),fact('wrong',[false,false]),fact('skipped',[],1),fact('pending',[]),fact('correct',[true],1)]),make('addition','guest',[fact('correct',[true])]),make('division','guest',[fact('wrong',[false])]),make('addition','comet',[fact('correct',[true])])];
   go('progress');
  });
  assert.deepEqual(await q.evaluate(()=>progressTotals(results.filter(r=>r.learner==='guest'&&r.config.activity==='addition'))),{flights:2,questions:7,correct:4,wrong:1,unanswered:2,first:2,wrongAttempts:3,skips:2});
  assert.equal(await q.locator('[data-metric=flights]').innerText(),'3');
  assert.equal(await q.locator('[data-progress-activity]').count(),8);
  await q.screenshot({path:path.join(output,'progress-desktop.png'),fullPage:true});
  await q.locator('[data-progress-activity=addition]').click();
  assert.equal(await q.locator('[data-review]').count(),2);
  assert.equal(await q.locator('[data-metric=correct]').innerText(),'4');
  await q.locator('[data-review="0"]').click();await q.locator('[data-progress-activity=addition]').click();
  assert.equal(await q.locator('[data-review]').count(),2);
  await q.locator('[data-action=profiles]').click();await q.locator('[data-profile=comet]').click();
  assert.equal(await q.locator('[data-review]').count(),1);assert.equal(await q.locator('[data-metric=correct]').innerText(),'1');
  await q.locator('#app [data-go=progress]').click();await q.locator('[data-progress-activity=squares]').click();
  assert((await q.locator('#app').innerText()).includes('No squares flights yet.'));
  await q.locator('#app [data-go=progress]').click();await q.setViewportSize({width:320,height:568});
  assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await q.screenshot({path:path.join(output,'progress-phone.png'),fullPage:true});
  await q.locator('[data-progress-activity=addition]').click();assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await c.close();
 });
 await test('No page errors or remote requests in monitored flows',async()=>assert.deepEqual(errors,[]));
 fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({browser:browser.version(),results,errors},null,2));console.log('Artifacts:',output);process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>browser?.close());
