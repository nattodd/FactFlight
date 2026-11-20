// Integrated app tests: isolated contexts, synthetic history, no real microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.FF_TEST_OUTPUT||require('node:os').tmpdir();fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const files={'/scripts/profile-store.js':'scripts/profile-store.js','/scripts/profiles.js':'scripts/profiles.js','/scripts/practice-focus.js':'scripts/practice-focus.js','/scripts/practice-reports.js':'scripts/practice-reports.js','/scripts/practice-readiness.js':'scripts/practice-readiness.js','/scripts/progress-dashboard.js':'scripts/progress-dashboard.js','/styles/progress.css':'styles/progress.css','/':'index.html','/scripts/menus.js':'scripts/menus.js','/styles/menus.css':'styles/menus.css','/scripts/math-activities.js':'scripts/math-activities.js','/scripts/activity-registry.js':'scripts/activity-registry.js','/scripts/family-practice.js':'scripts/family-practice.js','/scripts/content-definitions.js':'scripts/content-definitions.js','/scripts/practice-generator.js':'scripts/practice-generator.js','/styles/brand.css':'styles/brand.css','/assets/brand/horizontal.svg':'assets/brand/horizontal.svg'};const f=files[req.url];if(!f){res.writeHead(404);return res.end()}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,f)))});
const results=[],errors=[];let browser,url;
async function test(name,fn){if(process.env.FF_TEST_FILTER&&!name.includes(process.env.FF_TEST_FILTER))return;try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.stack})}console.log(JSON.stringify(results.at(-1)))}
async function page(options={}){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);await p.locator("[data-create-profile]").click();await p.locator("#nickname").fill("Test learner");await p.locator("#profileForm button").click();await p.locator("[data-quick]").waitFor();return [c,p]}

async function choose(p,{activity='addition',mode='quick',view='focus',input='keypad',level=0,count=5,table=2,minutes=2}={}){
 if(await p.locator('[data-learner]').count())await p.locator('[data-learner]:not([data-learner=guest])').first().click();
 await p.locator('#homeNav').click();
 if(mode==='school'){await p.locator('[data-math]').click();await p.locator('[data-school]').click();await p.locator(`[data-table="${table}"]`).click()}
 else {
  await p.locator(mode==='quick'?'[data-quick]':'[data-math]').click();await require('./menu-route.cjs')(p,activity);
  if(mode!=='quick')await p.locator(`[data-mode="${mode}"]`).click();
  await p.locator(`[data-level="${level}"]`).click();if(mode!=='free')await p.locator(`[data-count="${count}"]`).click();
 }
 if(['timed','test'].includes(mode))await p.locator(`[data-minutes="${minutes}"]`).click();
 await p.locator('[data-next]').click();await p.locator(`[data-input="${input}"]`).click();await p.locator(`[data-view="${view}"]`).click();
 await p.locator('[data-start]').click();
}
async function answer(p,value){const field=p.locator(await p.evaluate(()=>activeView==='focus')?'#focusAnswer':'.keyboard-active input');await field.fill(String(value??await p.evaluate(()=>items[index].answer)));await field.press('Enter');await require('./feedback-wait.cjs')(p)}


async function seed(p){await choose(p,{activity:'multiplication',view:'worksheet'});await p.locator('#end').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length===1);await p.evaluate(()=>{const data=JSON.parse(localStorage.getItem('fact-flight-family-v1')),base=data.sessions[0];data.sessions=Array.from({length:5},(_,i)=>({...structuredClone(base),id:crypto.randomUUID(),date:new Date(Date.UTC(2026,10,14,12,i)).toISOString(),items:[{text:i<3?'4 × 7':`${i+5} × 8`,key:i<3?'×:4:7':`×:${i+5}:8`,answer:i<3?28:(i+5)*8,status:'correct',skips:0,ms:1800,attempts:[...(i===0?[{value:325,transcript:'325',source:'voice',correct:false,at:1000}]:[]),{value:i<3?28:(i+5)*8,transcript:'answer',source:'keyboard',correct:true,at:1800}]},{text:`2 × ${i+2}`,key:`×:2:${i+2}`,answer:2*(i+2),status:'correct',skips:0,ms:1000,attempts:[{value:2*(i+2),transcript:'answer',source:'keyboard',correct:true,at:2800}]}]}));localStorage.setItem('fact-flight-family-v1',JSON.stringify(data))});await p.reload();await p.locator('[data-learner]:not([data-learner=guest])').click();await p.locator('#historyNav').click()}

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
 // Table content and disclosure coverage now lives in progress-dashboard.cjs.
 for(const width of [390,800,1440])await test(`Short worksheet answer alignment ${width}`,async()=>{
 const [c,p]=await page({viewport:{width,height:900}});await p.evaluate(()=>document.documentElement.dataset.theme='dark');await choose(p,{activity:'multiplication',view:'worksheet'});
 assert.equal(await p.locator('#grid.short-sheet .fact').count(),5);assert.equal(await p.locator('#grid .coltitle:visible').count(),0);
 const row=await p.locator('.keyboard-active').boundingBox(),field=await p.locator('.keyboard-active input').boundingBox();assert(field.y>=row.y&&field.y+field.height<=row.y+row.height);assert.equal(await p.locator('.keyboard-active .value:visible').count(),0);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await answer(p);assert.equal(await p.evaluate(()=>index),1);await p.evaluate(()=>document.documentElement.dataset.theme='dark');if(width===800)await p.locator('#practiceView .sheet').screenshot({path:path.join(output,'worksheet-refined.png')});
 await p.locator('#end').click();await choose(p,{mode:'school',view:'worksheet'});assert.equal(await p.locator('#grid.short-sheet').count(),0);assert.equal(await p.locator('#grid .column').count(),3);assert.equal(await p.locator('#grid .fact').count(),60);await c.close();
 });

 for(const width of [390,1000,1440])await test(`Ten-question worksheet grid ${width}`,async()=>{
 const [c,p]=await page({viewport:{width,height:1000}});await p.evaluate(()=>document.documentElement.dataset.theme='dark');await choose(p,{activity:'multiplication',view:'worksheet',count:10});
 const boxes=await p.locator('#grid .fact').evaluateAll(rows=>rows.map(r=>{const b=r.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height}}));
 assert.equal(boxes.length,10);if(width>=900){assert.equal(boxes[0].x,boxes[4].x);assert.equal(boxes[5].x,boxes[9].x);assert(boxes[5].x>boxes[0].x);assert.equal(boxes[0].y,boxes[5].y);assert.equal(boxes[4].y,boxes[9].y)}else assert.equal(new Set(boxes.map(b=>b.x)).size,1);
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(width===1440)await p.locator('#practiceView .sheet').screenshot({path:path.join(output,'worksheet-ten-grid.png')});
 for(let i=0;i<6;i++)await answer(p);assert.equal(await p.evaluate(()=>index),6);await c.close();
 });
 await test('No page errors',()=>assert.deepEqual(errors,[]));fs.writeFileSync(path.join(output,'table-progress-results.json'),JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
