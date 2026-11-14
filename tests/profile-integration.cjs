// Integrated app tests: isolated contexts, synthetic history, no real microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.FF_TEST_OUTPUT||require('node:os').tmpdir();fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const files={'/scripts/profile-store.js':'scripts/profile-store.js','/scripts/profiles.js':'scripts/profiles.js','/':'index.html','/scripts/menus.js':'scripts/menus.js','/styles/menus.css':'styles/menus.css','/scripts/math-activities.js':'scripts/math-activities.js','/styles/brand.css':'styles/brand.css','/assets/brand/horizontal.svg':'assets/brand/horizontal.svg'};const f=files[req.url];if(!f){res.writeHead(404);return res.end()}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,f)))});
const results=[],errors=[];let browser,url;
async function test(name,fn){if(process.env.FF_TEST_FILTER&&!name.includes(process.env.FF_TEST_FILTER))return;try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.stack})}console.log(JSON.stringify(results.at(-1)))}
async function page(options={}){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);return [c,p]}

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
async function answer(p,value){const field=p.locator(await p.evaluate(()=>activeView==='focus')?'#focusAnswer':'.keyboard-active input');await field.fill(String(value??await p.evaluate(()=>items[index].answer)));await field.press('Enter');await require('./feedback-wait.cjs')(p)}

async function create(p,name){await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill(name);await p.locator('#profileForm button').click();await p.locator('[data-quick]').waitFor()}
async function flight(p,options={}){await choose(p,options);await answer(p,9999);await answer(p);await p.locator('#skip').click();await p.locator('#end').click()}
async function saved(p,n){await p.waitForFunction(n=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length===n,n)}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
 await test('Separate learners, ownership, exports, Home, activity totals, and reload',async()=>{
  const [c,p]=await page();await create(p,'Alex');await flight(p);await saved(p,1);const alex=await p.evaluate(()=>session.learnerId);assert.equal(await p.evaluate(()=>stats(history[0]).correct),1);
  await p.locator('#resultHome').click();assert(await p.getByText("Alex's practice").isVisible());await p.locator('[data-change-learner]').click();await create(p,'Sam');await flight(p,{activity:'squares',mode:'free'});await saved(p,2);assert.notEqual(await p.evaluate(()=>session.learnerId),alex);assert.equal(await p.evaluate(()=>history.length),1);
  await p.locator('#seeProgress').click();assert(await p.locator('.learner-report-label').getByText('Sam · Results & Stats').isVisible());const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#exportAll').click()]);const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(exported.length,1);assert.equal(exported[0].activity,'squares');
  await p.reload();assert(await p.locator('[data-create-profile]').isVisible());await p.locator(`[data-learner="${alex}"]`).click();assert.equal(await p.evaluate(()=>history.length),1);assert.equal(await p.evaluate(()=>history[0].activity),'addition');await c.close();
 });
 await test('Guest never saves or exports, survives Home, clears on learner switch/reload',async()=>{
  const [c,p]=await page();await p.locator('[data-learner=guest]').click();await flight(p);assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),null);assert.equal(await p.locator('#exportOne').count(),0);await p.locator('#seeProgress').click();assert.equal(await p.locator('#exportAll,#exportCSV').count(),0);assert.equal(await p.evaluate(()=>history.length),1);await p.locator('#homeNav').click();assert(await p.getByText("Guest's practice").isVisible());await p.locator('[data-change-learner]').click();await create(p,'Sunny');assert.equal(await p.evaluate(()=>history.length),0);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length),0);await p.reload();await p.locator('[data-learner=guest]').click();assert.equal(await p.evaluate(()=>history.length),0);await c.close();
 });
 await test('Synthetic v5 and expanded legacy history stay byte-for-byte intact and readable',async()=>{
  const [c,p]=await page();await create(p,'Seed');await flight(p,{mode:'school'});await saved(p,1);let legacy=await p.evaluate(()=>structuredClone(session));delete legacy.learnerId;delete legacy.learnerName;legacy.id=123;await p.locator('#resultHome').click();await flight(p);await saved(p,2);let math=await p.evaluate(()=>structuredClone(session));delete math.learnerId;delete math.learnerName;math.id=456;const raw=[JSON.stringify([legacy]),JSON.stringify([math])];await p.evaluate(raw=>{localStorage.setItem('fact-flight-history-v1',raw[0]);localStorage.setItem('fact-flight-math-history-v1',raw[1]);localStorage.removeItem('fact-flight-family-v1')},raw);await p.reload();await p.locator('#historyNav').click();await p.locator('[data-profile-stats=previous]').click();assert.equal(await p.evaluate(()=>history.length),2);assert.equal(await p.evaluate(()=>stats(history[0]).correct),1);await p.locator('#homeNav').click();await create(p,'New learner');await flight(p);await saved(p,1);await p.reload();assert.deepEqual(await p.evaluate(()=>[localStorage.getItem(KEY),localStorage.getItem(MATH_KEY)]),raw);await c.close();
 });
 await test('Damaged/unsupported family data is preserved; Guest still works',async()=>{
  for(const raw of ['{broken',JSON.stringify({version:99,profiles:[],sessions:[]})]){const [c,p]=await page();await p.evaluate(raw=>localStorage.setItem('fact-flight-family-v1',raw),raw);await p.reload();assert(await p.locator('[data-create-profile]').isDisabled());await p.locator('[data-learner=guest]').click();await flight(p);assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),raw);await c.close()}
 });
 await test('Quota failure retains unsaved profile flight and allows export without claiming saved',async()=>{
  const [c,p]=await page();await create(p,'Alex');await p.evaluate(()=>{const old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='fact-flight-family-v1')throw new DOMException('Quota full','QuotaExceededError');return old.call(this,k,v)}});await flight(p);await p.waitForFunction(()=>document.querySelector('#profileSaveStatus').textContent.includes('Could not save'));assert.equal(await p.evaluate(()=>history.length),1);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length),0);assert(await p.locator('#exportOne').isVisible());await p.locator('#resultHome').click();await p.locator('#historyNav').click();assert.equal(await p.evaluate(()=>history.length),1);await c.close();
 });
 await test('Two tabs retain overlapping profile creations and session saves',async()=>{
  const [c,p]=await page();const q=await c.newPage();await q.goto(url);await Promise.all([create(p,'Alex'),create(q,'Sam')]);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).profiles.length),2);await Promise.all([flight(p),flight(q)]);await saved(p,2);const data=await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')));assert.equal(new Set(data.sessions.map(s=>s.learnerId)).size,2);await c.close();
 });
 await test('Optional and unsafe nicknames render as plain text; same names keep separate IDs',async()=>{
  const [c,p]=await page();await create(p,'');assert(await p.getByText("Learner 1's practice").isVisible());await p.locator('[data-change-learner]').click();await create(p,'<img src=x onerror=1>');assert.equal(await p.locator('.learner-identity img').count(),0);await p.locator('[data-change-learner]').click();await create(p,'Learner 1');const data=await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')));assert.equal(new Set(data.profiles.map(p=>p.id)).size,3);await c.close();
 });
 for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1440,1000]])await test(`Learner Home and creation layout ${width}x${height}`,async()=>{
  const [c,p]=await page({viewport:{width,height}});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await create(p,'Alex');await p.locator('[data-change-learner]').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width===390||width===1440)await p.screenshot({path:path.join(output,`profiles-home-${width}.png`),fullPage:true});await p.locator('#themeBtn').count();await c.close();
 });

 await test('Store refuses unknown owners, conflicting IDs, and unsafe unlocked writes',async()=>{
  const [c,p]=await page();await create(p,'Alex');await flight(p);await saved(p,1);assert(await p.evaluate(async()=>{const store=FlightProfileStore.create(localStorage,navigator.locks),before=localStorage.getItem('fact-flight-family-v1'),record=JSON.parse(before).sessions[0];for(const changed of [{...record,id:'new',learnerId:'missing'},{...record,reason:'different'}]){let rejected=false;try{await store.save(changed)}catch(e){rejected=true}if(!rejected||localStorage.getItem('fact-flight-family-v1')!==before)return false}try{await FlightProfileStore.create(localStorage,null).add('Unsafe');return false}catch(e){}return localStorage.getItem('fact-flight-family-v1')===before}));await c.close();
 });
 await test('Profile picker dark theme, long nickname and creation controls remain reachable',async()=>{
  const [c,p]=await page({viewport:{width:320,height:568}});await create(p,'A very long learner name');await p.locator('[data-change-learner]').click();await p.evaluate(()=>document.documentElement.dataset.theme='dark');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(output,'profiles-home-dark-320.png'),fullPage:true});await p.locator('[data-create-profile]').click();await p.locator('#profileForm button').scrollIntoViewIfNeeded();assert(await p.locator('#profileForm button').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=-1&&r.bottom<=innerHeight+1}));await c.close();
 });
 await test('No page errors',async()=>assert.deepEqual(errors,[]));
 await browser.close();server.close();fs.writeFileSync(path.join(output,'profile-results.json'),JSON.stringify(results,null,2));if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
