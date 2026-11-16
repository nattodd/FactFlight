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
async function dock(p,selector){
 await p.waitForFunction(s=>document.querySelector(s)?.classList.contains('is-docked'),selector);
 const box=await p.locator(selector).boundingBox(),size=p.viewportSize();
 assert(box.y>=0&&box.y+box.height<=size.height+1);
 assert(box.height<size.height*.4);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 return box;
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port;browser=await chromium.launch({headless:true,channel:'chrome'});
 for(const [width,height] of [[320,568],[390,844],[430,932]])await test('Setup/results actions '+width+'x'+height,async()=>{
  const [c,p]=await page({viewport:{width,height},hasTouch:true,isMobile:true});
  await p.locator('[data-quick]').click();await dock(p,'#menuView .bottom-actions');
  assert.equal(await p.locator('[data-back]').count(),1);
  await p.locator('[data-activity=multiplication]').click();await dock(p,'#menuView .bottom-actions');
  await p.locator('[data-selection=tables]').click();await p.locator('[data-fact-table="2"]').click();
  assert(await p.locator('[data-next]').isDisabled());
  assert((await p.locator('#menuView .action-summary').innerText()).includes('Choose at least one table'));
  await p.locator('[data-fact-table="3"]').click();await p.locator('[data-fact-table="9"]').click();
  await p.locator('[data-next]').click();await dock(p,'#menuView .bottom-actions');
  await p.locator('[data-back]').click();assert(await p.locator('[data-next]').isVisible());
  await p.locator('[data-next]').click();await p.locator('[data-view=focus]').click();
  await p.locator('#menuView details').evaluate(e=>e.scrollIntoView({block:'start'}));
  const bounds=await p.locator('#menuView details').boundingBox(),bar=await dock(p,'#menuView .bottom-actions');
  assert(bounds.y+bounds.height<=bar.y+1);
  await p.screenshot({path:path.join(output,'actions-setup-'+width+'.png')});
  await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>phase),'running');
  assert.equal(await p.locator('.is-docked:visible').count(),0);
  await finish(p);await dock(p,'#resultsView .bottom-actions');
  assert.equal(await p.locator('#again').count(),1);assert.equal(await p.locator('#nextTables').count(),1);
  await p.screenshot({path:path.join(output,'actions-results-'+width+'.png')});
  await p.locator('#nextTables').click();assert.deepEqual(await p.evaluate(()=>session.selection.tables),[4,10]);
  await finish(p);await dock(p,'#resultsView .bottom-actions');assert.equal(await p.locator('#nextTables').count(),0);
  await p.locator('#again').click();assert.equal(await p.evaluate(()=>phase),'running');await c.close();
 });
 await test('Keyboard editing, landscape fallback, desktop Back',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await p.locator('[data-quick]').click();await p.locator('[data-activity=addition]').click();await p.locator('[data-next]').click();
  await p.locator('#menuView summary').click();await p.locator('#target').fill('3');
  await p.waitForFunction(()=>!document.querySelector('#menuView .bottom-actions').classList.contains('is-docked'));
  await p.setViewportSize({width:844,height:390});await p.locator('#target').blur();
  await p.waitForFunction(()=>!document.querySelector('#menuView .bottom-actions').classList.contains('is-docked'));
  await p.locator('[data-start]').scrollIntoViewIfNeeded();
  await p.screenshot({path:path.join(output,'actions-landscape.png'),fullPage:true});
  await p.setViewportSize({width:1440,height:1000});
  await p.waitForFunction(()=>document.querySelector('[data-back]').parentElement.id==='menuView');
  assert.equal(await p.locator('[data-back]').count(),1);
  await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>session.target),3);await c.close();
 });
 await test('Large text and long table summary',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await p.locator('[data-quick]').click();await p.locator('[data-activity=multiplication]').click();await p.locator('[data-selection=tables]').click();
  for(const n of [1,3,4,5,6,7,8,9,10])await p.locator('[data-fact-table="'+n+'"]').click();
  await p.addStyleTag({content:'.bottom-actions *{font-size:24px!important}'});
  await dock(p,'#menuView .bottom-actions');await p.locator('[data-next]').click();await dock(p,'#menuView .bottom-actions');
  await p.screenshot({path:path.join(output,'actions-large-text.png')});
  await p.locator('[data-start]').click();await finish(p);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('#again').click();assert.equal(await p.evaluate(()=>phase),'running');await c.close();
 });
 await test('Mobile voice ready, cancellation and guarded repeat',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await p.addInitScript(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});
  await p.reload();await choose(p,{input:'voice'});
  assert.equal(await p.evaluate(()=>phase),'checking');assert.equal(await p.locator('.is-docked:visible').count(),0);
  await p.evaluate(()=>cancelCheck());await dock(p,'#menuView .bottom-actions');
  await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>phase),'checking');
  const ready=()=>p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;testRecognition.onresult({resultIndex:0,results:[r]})});
  await ready();await finish(p);await dock(p,'#resultsView .bottom-actions');
  await p.locator('#nextLevel').click();assert.equal(await p.evaluate(()=>phase),'checking');
  await ready();assert.equal(await p.evaluate(()=>session.level),1);await finish(p);
  await p.locator('#again').click();assert.equal(await p.evaluate(()=>phase),'checking');
  await p.evaluate(()=>FlightMenu.replay(history[0],'again'));await ready();
  assert.equal(await p.evaluate(()=>history.length),2);await c.close();
 });

 await test('Dock adapts to resizing, focus navigation and dark theme without duplicated controls',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await p.locator('[data-math]').click();await p.locator('[data-activity=division]').click();
  await dock(p,'#menuView .bottom-actions');
  await p.locator('[data-mode=timed]').click();await dock(p,'#menuView .bottom-actions');
  await p.locator('[data-minutes="5"]').click();
  assert((await p.locator('#menuView .action-summary').innerText()).includes('5 min'));
  await p.locator('[data-minutes="1"]').focus();await p.keyboard.press('Tab');
  const focusBox=await p.locator(':focus').boundingBox(),bar=await dock(p,'#menuView .bottom-actions');
  assert(focusBox.y>=0&&focusBox.y+focusBox.height<=bar.y+1);
  await p.locator('[data-next]').click();
  await p.evaluate(()=>document.documentElement.dataset.theme='dark');
  await p.screenshot({path:path.join(output,'actions-dark.png')});
  await p.setViewportSize({width:1440,height:1000});
  await p.waitForFunction(()=>document.querySelector('[data-back]').parentElement.id==='menuView');
  await p.setViewportSize({width:390,height:844});await dock(p,'#menuView .bottom-actions');
  assert.equal(await p.locator('[data-start]').count(),1);assert.equal(await p.locator('[data-back]').count(),1);
  await p.locator('#homeNav').click();
  await p.waitForFunction(()=>!document.querySelector('.is-docked'));
  assert.equal(await p.locator('#menuView.has-bottom-actions').count(),0);
  await c.close();
 });
 await test('No browser errors',()=>assert.deepEqual(errors,[]));
 fs.writeFileSync(path.join(output,'mobile-actions-results.json'),JSON.stringify({results,errors},null,2));
 process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
