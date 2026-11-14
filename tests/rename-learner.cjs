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

async function manage(p){await p.locator('#homeNav').click();await p.locator('[data-nav=parents]').click();await p.locator('[data-nav=manageLearners]').click()}
async function remove(p,id){await manage(p);await p.locator(`[data-delete-profile="${id}"]`).click();await p.locator('#deleteLearnerDialog').waitFor()}

async function backup(p,id){await manage(p);const [d]=await Promise.all([p.waitForEvent('download'),p.locator(`[data-export-profile="${id}"]`).click()]);return JSON.parse(fs.readFileSync(await d.path(),'utf8'))}
async function upload(p,data){await manage(p);await p.locator('[data-nav=importLearner]').click();await p.locator('#learnerImportFile').setInputFiles({name:'learner.json',mimeType:'application/json',buffer:Buffer.from(typeof data==='string'?data:JSON.stringify(data))})}
async function seed(p){await create(p,'Alex');await flight(p);await saved(p,1);const id=await p.evaluate(()=>session.learnerId);return backup(p,id)}
async function confirm(p){await p.locator('[data-confirm-import]').click();await p.getByRole('heading',{name:'Manage learners',exact:true}).waitFor()}

async function rename(p,id,name){await manage(p);await p.locator(`[data-rename-profile="${id}"]`).click();await p.locator('#renameLearnerName').fill(name);await p.locator('#saveLearnerName').click();await p.locator('#renameLearnerDialog').waitFor({state:'hidden'})}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
 await test('Rename preserves IDs, flights, other learners and legacy stores after reload',async()=>{
  const [c,p]=await page();const data=await seed(p);await p.locator('#homeNav').click();await p.locator('[data-change-learner]').click();await create(p,'Sam');await flight(p,{activity:'squares'});await saved(p,2);await p.evaluate(()=>{localStorage.setItem(KEY,'[]');localStorage.setItem(MATH_KEY,'[ ]')});const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')));await rename(p,data.profile.id,'Sunny');const after=await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')));assert.deepEqual(after.sessions,before.sessions);assert.deepEqual(after.profiles,before.profiles.map(x=>x.id===data.profile.id?{...x,name:'Sunny'}:x));assert.deepEqual(await p.evaluate(()=>[localStorage.getItem(KEY),localStorage.getItem(MATH_KEY)]),['[]','[ ]']);await p.reload();await p.locator(`[data-learner="${data.profile.id}"]`).click();assert(await p.getByText("Sunny's practice").isVisible());await p.locator('#historyNav').click();assert(await p.getByText('Sunny · Results & Stats').isVisible());assert.equal(await p.evaluate(()=>history.length),1);await p.locator('[data-review]').first().click();assert((await p.locator('#profileSaveStatus').innerText()).includes('Sunny'));await c.close();
 });
 await test('Renamed learner accepts old-name backup as duplicates and retains current name',async()=>{
  const [c,p]=await page();const data=await seed(p);await rename(p,data.profile.id,'Sunny');await p.locator('#historyNav').click();await p.locator('[data-review]').first().click();assert((await p.locator('#profileSaveStatus').innerText()).includes('Sunny'));await upload(p,data);await p.locator('[data-confirm-import]').waitFor();assert(await p.getByText('Profile already exists.',{exact:true}).isVisible());assert(await p.getByText('Your current learner name will be kept.',{exact:false}).isVisible());assert.equal(await p.locator('[data-confirm-import]').innerText(),'Already imported');assert(await p.locator('[data-confirm-import]').isDisabled());const fresh=structuredClone(data.sessions[0]);fresh.id=require('crypto').randomUUID();data.sessions.push(fresh);await upload(p,data);await confirm(p);assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).profiles[0].name),'Sunny');await saved(p,2);await c.close();
 });
 await test('Cancel, empty names, overlong names and failed writes do not change data',async()=>{
  const [c,p]=await page();const data=await seed(p),before=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));await manage(p);await p.locator(`[data-rename-profile="${data.profile.id}"]`).click();await p.locator('#renameLearnerName').fill('Changed');await p.locator('#cancelRenameLearner').click();assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),before);await p.locator(`[data-rename-profile="${data.profile.id}"]`).click();await p.locator('#renameLearnerName').fill('   ');await p.locator('#saveLearnerName').click();await p.getByText('Enter a nickname between 1 and 24 characters.',{exact:true}).waitFor();assert(await p.evaluate(async id=>{try{await FlightProfileStore.create(localStorage,navigator.locks).rename(id,'x'.repeat(25),'Alex');return false}catch(e){return true}},data.profile.id));await p.locator('#renameLearnerName').fill('Sunny');await p.evaluate(()=>{Storage.prototype.setItem=()=>{throw Error('Storage blocked')}});await p.locator('#saveLearnerName').click();await p.getByText('Storage blocked',{exact:true}).waitFor();assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),before);await c.close();
 });
 await test('Stale rename does not overwrite another tab; same names remain separate',async()=>{
  const [c,p]=await page();const data=await seed(p);await manage(p);await p.locator(`[data-rename-profile="${data.profile.id}"]`).click();await p.evaluate(async id=>{const store=FlightProfileStore.create(localStorage,navigator.locks);await store.rename(id,'Sam','Alex');await store.add('Sam')},data.profile.id);await p.locator('#renameLearnerName').fill('Sunny');await p.locator('#saveLearnerName').click();await p.getByText('This learner’s name changed in another tab.',{exact:false}).waitFor();const rows=await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).profiles);assert.equal(rows.length,2);assert(rows.every(x=>x.name==='Sam'));assert.notEqual(rows[0].id,rows[1].id);await c.close();
 });
 for(const [width,height] of [[320,568],[390,844],[844,390],[1440,1000]])await test(`Rename dialog layout and escaped name ${width}x${height}`,async()=>{
  const [c,p]=await page({viewport:{width,height}});await create(p,'Alex');const id=await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).profiles[0].id);await manage(p);await p.locator(`[data-rename-profile="${id}"]`).click();assert.equal(await p.evaluate(()=>document.activeElement.id),'renameLearnerName');await p.locator('#saveLearnerName').scrollIntoViewIfNeeded();assert(await p.locator('#saveLearnerName').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=-1&&r.bottom<=innerHeight+1}));if(width===390)await p.screenshot({path:path.join(output,'rename-phone.png'),fullPage:true});await p.locator('#renameLearnerName').fill('<img src=x>');await p.locator('#saveLearnerName').click();await p.locator('#renameLearnerDialog').waitFor({state:'hidden'});assert.equal(await p.locator('.manage-learner img').count(),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await c.close();
 });
 await test('No page errors',async()=>assert.deepEqual(errors,[]));
 await browser.close();server.close();fs.writeFileSync(path.join(output,'rename-results.json'),JSON.stringify(results,null,2));if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
