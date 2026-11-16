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


async function seed(p){await choose(p,{activity:'multiplication',view:'worksheet'});await p.locator('#end').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length===1);await p.evaluate(()=>{const data=JSON.parse(localStorage.getItem('fact-flight-family-v1')),base=data.sessions[0];data.sessions=Array.from({length:5},(_,i)=>({...structuredClone(base),id:crypto.randomUUID(),date:new Date(Date.UTC(2026,10,14,12,i)).toISOString(),items:[{text:i<3?'4 × 7':`${i+5} × 8`,key:i<3?'×:4:7':`×:${i+5}:8`,answer:i<3?28:(i+5)*8,status:'correct',skips:0,ms:1800,attempts:[...(i===0?[{value:325,transcript:'325',source:'voice',correct:false,at:1000}]:[]),{value:i<3?28:(i+5)*8,transcript:'answer',source:'keyboard',correct:true,at:1800}]},{text:`2 × ${i+2}`,key:`×:2:${i+2}`,answer:2*(i+2),status:'correct',skips:0,ms:1000,attempts:[{value:2*(i+2),transcript:'answer',source:'keyboard',correct:true,at:2800}]}]}));localStorage.setItem('fact-flight-family-v1',JSON.stringify(data))});await p.reload();await p.locator('[data-learner]:not([data-learner=guest])').click();await p.locator('#historyNav').click()}

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
 await test('Table report uses selected learner, activity, window and exact counts without writes',async()=>{
 const [c,p]=await page();await seed(p);const before=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));
 await p.locator('#tableChoice').selectOption('4');const card=p.locator('[data-progress-table="4"]');assert((await card.innerText()).includes('3 correct first try / 4 encounters'));assert((await card.innerText()).includes('Small sample'));
 await p.locator('#tableWindow').selectOption('all');assert.equal(await p.locator('#tableCards article').count(),1);assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),before);
 await p.locator('[data-activity-progress=addition]').click();assert.equal(await p.locator('#tableProgress').count(),0);await p.locator('#allActivities').click();await p.locator('[data-activity-progress=multiplication]').click();assert(await p.locator('#tableProgress').isVisible());
 await p.locator('#homeNav').click();await p.locator('[data-change-learner]').click();await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill('Other');await p.locator('#profileForm button').click();await p.locator('#historyNav').click();assert((await p.locator('#tableCards').innerText()).includes('No multiplication practice'));await c.close();
 });
 await test('Empty selected table, keyboard selection and timing caveat are accessible',async()=>{
 const [c,p]=await page();await seed(p);await p.locator('#tableChoice').selectOption('1');assert((await p.locator('#tableCards').innerText()).includes('No practice in this window'));
 await p.locator('#tableWindow').focus();await p.keyboard.press('ArrowDown');assert.equal(await p.locator('#tableWindow').inputValue(),'all');assert((await p.locator('.table-timing').innerText()).includes('not recall speed'));assert((await p.locator('.table-timing').innerText()).includes('iPhone'));await c.close();
 });
 for(const [width,height] of [[320,568],[390,844],[844,390],[1440,1000]])await test(`Table report layout ${width}x${height}`,async()=>{
 const [c,p]=await page({viewport:{width,height}});await seed(p);await p.locator('#tableChoice').selectOption('4');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 if(width===1440)await p.locator('#tableChoice').selectOption('all');
 for(const theme of ['light','dark']){await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);assert(await p.locator('#tableChoice').isVisible());if(width===390||width===1440)await p.locator('#tableProgress').screenshot({path:path.join(output,`table-progress-${width}-${theme}.png`)});}
 await c.close();
 });

 await test('Progress previews expand independently and reset with filters',async()=>{
 const [c,p]=await page();await seed(p);assert.equal(await p.locator('#tableCards article:visible').count(),3);assert.equal(await p.locator('#activityCards button:visible').count(),3);
 await p.locator('#tableCardsToggle').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#tableCards article:visible').count(),8);assert.equal(await p.locator('#activityCards button:visible').count(),3);
 await p.locator('#activityCardsToggle').click();assert.equal(await p.locator('#activityCards button:visible').count(),8);await p.locator('#tableCardsToggle').click();assert.equal(await p.locator('#tableCards article:visible').count(),3);
 await p.locator('#tableChoice').selectOption('4');assert.equal(await p.locator('#tableCardsToggle').count(),0);await p.locator('#tableChoice').selectOption('all');assert.equal(await p.locator('#tableCards article:visible').count(),3);
 await p.locator('[data-activity-progress=division]').click();assert.equal(await p.locator('#tableProgress').count(),0);await c.close();
 });
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
 await test('Existing report toggles have consistent space after the table',async()=>{
 const [c,p]=await page();await seed(p);for(const [button,table] of [['#toggleFacts','#factsReport'],['#toggleFlights','#flightsReport']]){const b=await p.locator(button).boundingBox(),t=await p.locator(table).boundingBox();assert(b.y-(t.y+t.height)>=13);assert.equal(await p.locator(button).evaluate(e=>getComputedStyle(e).display),'block');await p.locator(button).click();assert.equal(await p.locator(button).getAttribute('aria-expanded'),'true');await p.locator(button).click();}
 await c.close();
 });
 for(const width of [390,1440])await test(`Activity drill-down keeps heading and facts in view ${width}`,async()=>{
 const [c,p]=await page({viewport:{width,height:844}});await seed(p);
 await choose(p,{activity:'subtraction',view:'worksheet'});const fact=await p.evaluate(()=>items[0].text);await answer(p,9999);await answer(p);await p.locator('#end').click();await p.waitForFunction(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.length===6);await p.locator('#seeProgress').click();
 const before=await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1'));await p.locator('#tableCardsToggle').click();await p.locator('#activityCardsToggle').click();
 const activity=p.locator('[data-activity-progress=subtraction]');if(width===1440){await activity.focus();await p.keyboard.press('Enter')}else await activity.click();
 const heading=p.getByRole('heading',{name:'Subtraction',exact:true});let box=await heading.boundingBox();assert(box.y>=0&&box.y<80,`Selected heading outside viewport: ${box.y}`);
 assert(await heading.evaluate(e=>document.activeElement===e));const facts=p.getByRole('heading',{name:'Facts to focus on',exact:true});box=await facts.boundingBox();assert(box.y>=0&&box.y<844);assert((await p.locator('#factsReport').innerText()).includes(fact));assert.equal(await p.locator('#tableProgress').count(),0);
 if(width===390)await p.screenshot({path:path.join(output,'subtraction-progress-phone.png')});
 await p.locator('#allActivities').click();const all=p.getByRole('heading',{name:'Progress by activity',exact:true});box=await all.boundingBox();assert(box.y>=0&&box.y<80);assert(await all.evaluate(e=>document.activeElement===e));
 await p.locator('[data-activity-progress=multiplication]').click();const mult=p.getByRole('heading',{name:'Multiplication',exact:true});box=await mult.boundingBox();assert(box.y>=0&&box.y<80);assert.equal(await p.locator('#tableProgress').count(),1);
 assert.equal(await p.evaluate(()=>localStorage.getItem('fact-flight-family-v1')),before);await c.close();
 });
 await test('No page errors',()=>assert.deepEqual(errors,[]));fs.writeFileSync(path.join(output,'table-progress-results.json'),JSON.stringify(results,null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
