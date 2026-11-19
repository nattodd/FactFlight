// Isolated real Chrome UI with synthetic history; speech is mocked.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const fixtures=require('./focus-fixtures.cjs'),root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const rel=req.url==='/'?'index.html':req.url.slice(1);if(!/^(index\.html|scripts\/[\w-]+\.js|styles\/[\w-]+\.css|assets\/brand\/[\w-]+\.svg)$/.test(rel)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',rel.endsWith('.js')?'application/javascript':rel.endsWith('.css')?'text/css':rel.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,rel)))});
let browser,url;const errors=[];
async function seed(p,all=false){const id=await p.evaluate(()=>FlightProfiles.reviewOwner());await p.evaluate(rows=>{const d=JSON.parse(localStorage.getItem('fact-flight-family-v1'));d.sessions=rows;localStorage.setItem('fact-flight-family-v1',JSON.stringify(d));},fixtures(id,all));return id}
async function home(p){await p.locator('#homeNav').click()}
async function parent(p){await home(p);await p.locator('[data-nav=parents]').click()}
async function choose(p,a='squares'){await home(p);await p.locator('[data-quick]').click();await p.locator(`[data-activity=${a}]`).click()}
async function activityLayout(p,label){
 const viewport=p.viewportSize();
 for(const width of [320,390,1440])for(const theme of ['light','dark']){
  await p.setViewportSize({width,height:900});
  await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  const failures=await p.locator('[data-activity]').evaluateAll(tiles=>tiles.flatMap(tile=>{
   const status=tile.querySelector('.activity-status');if(!status)return [];
   const box=tile.getBoundingClientRect(),r=status.getBoundingClientRect(),css=getComputedStyle(tile),previous=status.previousElementSibling.getBoundingClientRect();
   const errors=[];
   if(Math.abs(box.bottom-r.bottom-parseFloat(css.paddingBottom)-parseFloat(css.borderBottomWidth))>2)errors.push('status not at bottom');
   if(r.top<previous.bottom+parseFloat(css.rowGap)-2)errors.push('status overlaps description');
   for(const child of tile.children){const range=document.createRange();range.selectNodeContents(child);for(const rect of range.getClientRects())if(rect.left<box.left||rect.right>box.right+1||rect.bottom>box.bottom)errors.push('content outside tile');}
   return errors.map(e=>tile.dataset.activity+': '+e);
  }));
  assert.deepEqual(failures,[],`${label} ${width} ${theme}`);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(process.env.FF_TEST_OUTPUT&&width===390)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`activity-status-${label}-${theme}.png`),fullPage:true});
 }
 await p.setViewportSize(viewport);
}
async function familyLayout(p,label){
 const viewport=p.viewportSize();
 for(const width of [320,390,1440])for(const theme of ['light','dark']){
  await p.setViewportSize({width,height:900});await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);
  const result=await p.locator('[data-fact-table]').evaluateAll(tiles=>{
   const heights=[],errors=[];
   for(const tile of tiles){const box=tile.getBoundingClientRect();heights.push(box.height);
    const range=document.createRange();range.selectNodeContents(tile);
    for(const r of range.getClientRects())if(r.left<box.left||r.right>box.right+1||r.bottom>box.bottom||r.top<box.top)errors.push(tile.dataset.factTable+' overflows');
   }return {errors,spread:Math.max(...heights)-Math.min(...heights)};
  });
  assert.deepEqual(result.errors,[],`${label} ${width} ${theme}`);assert(result.spread<2,`${label}: unequal family tiles`);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(process.env.FF_TEST_OUTPUT&&width===390)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`families-${label}-${theme}.png`),fullPage:true});
 }
 await p.setViewportSize(viewport);
}
async function finish(p){await p.locator('#end').click();await p.waitForFunction(()=>document.querySelector('#profileSaveStatus').textContent.startsWith('Saved'))}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({channel:'chrome',headless:true});
 for(const width of [390,1440]){
  const ctx=await browser.newContext({viewport:{width,height:900}}),p=await ctx.newPage();p.setDefaultTimeout(7000);p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>{window.SpeechRecognition=window.webkitSpeechRecognition=class {constructor(){window.focusRecognition=this}start(){this.onstart?.()}stop(){}abort(){}}});
  await p.goto(url);await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill('Focus demo');await p.locator('#profileForm button').click();await p.locator('[data-quick]').waitFor();const id=await seed(p);
  await home(p);await p.locator('[data-quick]').click();await activityLayout(p,'partial');
  await parent(p);assert(!(await p.locator('#focusUnmastered').isChecked()));const original=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));await p.locator('#focusUnmastered').check();assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),original);if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`focus-parent-${width}.png`),fullPage:true});
  await choose(p);assert((await p.locator('[data-level="2"]').textContent()).includes('🏆'));assert.equal(await p.locator('[data-level="2"]').getAttribute('aria-disabled'),'true');assert.equal(await p.locator('[data-level="1"]').getAttribute('aria-disabled'),null);
  await p.locator('[data-level="2"]').dispatchEvent('click');assert.equal(await p.locator('[data-level="0"]').getAttribute('aria-pressed'),'true');
  if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`focus-menu-${width}.png`),fullPage:true});
  await p.locator('.focus-choice').filter({has:p.locator('[data-level="2"]')}).locator('[data-focus-choice]').click();await p.locator('[data-next]').click();await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>phase),'running');
  await p.evaluate(()=>{FactFlightFocus.set(false);FactFlightFocus.set(true)});assert.equal(await p.evaluate(()=>phase),'running');await finish(p);
  await p.locator('#again').click();assert(await p.locator('[data-focus-current]').isVisible());assert.notEqual(await p.evaluate(()=>phase),'running');
  await home(p);await p.locator('[data-quick-start]').click();assert(await p.locator('[data-focus-current]').isVisible());assert.equal(await p.locator('#menuView .review strong').textContent(),'Squares · Level 3');
  // An alternate engine start must also check the actual selected scope.
  await p.evaluate(()=>{document.getElementById('activity').value='squares';configureActivity();document.getElementById('level').value='2';configuredSelection=null;document.getElementById('inputMode').value='keyboard';document.getElementById('start').click()});assert.notEqual(await p.evaluate(()=>phase),'running');
  await parent(p);await p.locator('#focusUnmastered').uncheck();await choose(p);assert.equal(await p.locator('[data-level="2"]').getAttribute('aria-disabled'),null);await p.locator('[data-level="2"]').click();await p.locator('[data-next]').click();await p.locator('[data-input=voice]').click();await p.locator('[data-start]').click();assert.equal(await p.evaluate(()=>phase),'checking');
  await p.evaluate(()=>FactFlightFocus.set(true));await p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;focusRecognition.onresult({resultIndex:0,results:[r]})});assert.notEqual(await p.evaluate(()=>phase),'running');assert(await p.locator('[data-focus-current]').isVisible());
  // Mixed selections remain intact until the user explicitly removes or allows them.
  await choose(p,'multiplication');await p.locator('[data-selection=tables]').click();await familyLayout(p,'partial-restricted');await p.locator('[data-fact-table="2"]').click();await p.locator('[data-fact-table="8"]').click();
  await p.locator('.focus-choice').filter({has:p.locator('[data-fact-table="7"]')}).locator('[data-focus-choice]').click();await p.locator('[data-family-range="12"]').click();assert.equal(await p.locator('[data-fact-table="7"]').getAttribute('aria-disabled'),null);await p.locator('[data-family-range="10"]').click();
  assert(await p.locator('[data-focus-remove]').isVisible());assert.equal(await p.locator('[data-fact-table="7"]').getAttribute('aria-pressed'),'true');await p.locator('[data-focus-remove]').click();assert.equal(await p.locator('[data-fact-table="7"]').getAttribute('aria-pressed'),'false');assert.equal(await p.locator('[data-fact-table="8"]').getAttribute('aria-pressed'),'true');
  await choose(p,'division');await p.locator('[data-selection=tables]').click();await p.locator('[data-family-range="12"]').click();assert((await p.locator('[data-fact-table="4"]').textContent()).includes('🏆'));assert.equal(await p.locator('[data-fact-table="4"]').getAttribute('aria-disabled'),'true');
  await home(p);await p.locator('[data-math]').click();await p.locator('[data-school]').click();assert.equal(await p.locator('[data-table="7"]').getAttribute('aria-disabled'),'true');await p.locator('.focus-choice').filter({has:p.locator('[data-table="7"]')}).locator('[data-focus-choice]').click();await p.locator('[data-next]').click();await p.locator('[data-input=keypad]').click();await p.locator('[data-start]').click();assert.deepEqual(await p.evaluate(()=>[session.table,items.length,flightTimeLimitMs]),[7,60,120000]);await finish(p);
  await p.locator('#seeProgress').click();await p.locator('#pdReviewFacts>summary').click();await p.locator('#reviewActivity').selectOption('squares');await p.locator('#progressReview').click();assert((await p.locator('#menuView').textContent()).includes('Missed-fact review remains available'));await p.locator('[data-review-start]').click();assert.equal(await p.evaluate(()=>session.activity),'review');await finish(p);
  await p.reload();await p.locator(`[data-learner="${id}"]`).click();await parent(p);assert(await p.locator('#focusUnmastered').isChecked());
  await home(p);await p.locator('[data-change-learner]').click();await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill('Other demo');await p.locator('#profileForm button').click();await parent(p);assert(!(await p.locator('#focusUnmastered').isChecked()));
  await home(p);await p.locator('[data-change-learner]').click();await p.locator('[data-learner=guest]').click();await parent(p);assert(!(await p.locator('#focusUnmastered').isChecked()));const beforeGuest=await p.evaluate(()=>JSON.stringify({...localStorage}));await p.locator('#focusUnmastered').check();assert.equal(await p.evaluate(()=>JSON.stringify({...localStorage})),beforeGuest);await p.reload();await p.locator('[data-learner=guest]').click();await parent(p);assert(!(await p.locator('#focusUnmastered').isChecked()));
  await home(p);await p.locator('[data-change-learner]').click();await p.locator(`[data-learner="${id}"]`).click();await seed(p,true);await home(p);await p.locator('[data-quick]').click();assert.equal(await p.locator('[data-activity][aria-disabled=true]').count(),8);assert.equal(await p.locator('[data-focus-choice]').count(),8);await activityLayout(p,'all-restricted');await p.evaluate(()=>FactFlightFocus.set(false));await home(p);await p.locator('[data-quick]').click();assert.equal(await p.locator('[data-activity] .menu-trophy').count(),8);await activityLayout(p,'all-mastered');for(const activity of ['multiplication','division']){await choose(p,activity);await p.locator('[data-selection=tables]').click();await familyLayout(p,activity+'-mastered');await p.evaluate(()=>FactFlightFocus.set(true));await home(p);await p.locator('[data-quick]').click();await p.locator('.focus-choice').filter({has:p.locator('[data-activity='+activity+']')}).locator('[data-focus-choice]').click();await p.locator('[data-selection=tables]').click();await familyLayout(p,activity+'-restricted');await p.evaluate(()=>FactFlightFocus.set(false));}await p.evaluate(()=>FactFlightFocus.set(true));await home(p);await p.locator('[data-quick]').click();await p.locator('.focus-choice').filter({has:p.locator('[data-activity=addition]')}).locator('[data-focus-choice]').click();assert.equal(await p.locator('[data-level][aria-disabled=true]').count(),5);assert(await p.locator('[data-nav=parents]').isVisible());
  await p.locator('.focus-choice').filter({has:p.locator('[data-level="0"]')}).locator('[data-focus-choice]').click();await p.locator('[data-next]').click();await p.locator('[data-input=keypad]').click();await p.locator('[data-start]').click();await finish(p);await p.locator('#nextLevel').click();assert.notEqual(await p.evaluate(()=>phase),'running');assert((await p.locator('.focus-notice').textContent()).includes('Level 2'));
  await home(p);await p.locator('[data-quick]').click();await p.locator('.focus-choice').filter({has:p.locator('[data-activity=multiplication]')}).locator('[data-focus-choice]').click();await p.locator('[data-selection=tables]').click();await p.locator('[data-focus-current]').click();await p.locator('[data-next]').click();await p.locator('[data-input=keypad]').click();await p.locator('[data-start]').click();await finish(p);await p.locator('#nextTables').click();assert.notEqual(await p.evaluate(()=>phase),'running');assert(await p.locator('[data-focus-current]').isVisible());
  await parent(p);await p.locator('#focusUnmastered').uncheck();await p.evaluate(()=>{window.focusOriginalWrite=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k.startsWith('fact-flight-focus-v1:'))throw new DOMException('Full','QuotaExceededError');return focusOriginalWrite.call(this,k,v)}});await p.locator('#focusUnmastered').check();assert((await p.locator('#focusSaveStatus').textContent()).includes('could not be saved'));assert(await p.evaluate(()=>FactFlightFocus.enabled()));await p.evaluate(()=>{Storage.prototype.setItem=focusOriginalWrite});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await ctx.close();console.log(`PASS focus ${width}: default off, trophies, disabled choices, one-flight exception, repeat/Quick/alternate/voice-delay guards, live-flight stability, range separation, mixed selection removal, School preset, reload, learners, Guest, all-mastered review escape`);
 }
 assert.deepEqual(errors,[]);
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
