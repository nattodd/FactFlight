// Integrated app tests: isolated contexts, synthetic history, no real microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.FF_TEST_OUTPUT||require('node:os').tmpdir();fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const files={'/':'index.html','/scripts/math-activities.js':'scripts/math-activities.js','/styles/brand.css':'styles/brand.css','/assets/brand/horizontal.svg':'assets/brand/horizontal.svg'};const f=files[req.url];if(!f){res.writeHead(404);return res.end()}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,f)))});
const results=[],errors=[];let browser,url;
async function test(name,fn){if(process.env.FF_TEST_FILTER&&!name.includes(process.env.FF_TEST_FILTER))return;try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.stack})}console.log(JSON.stringify(results.at(-1)))}
async function page(options={}){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);return [c,p]}
async function setup(p,activity,level='4',count='5',mode='practice',input='keyboard'){await p.locator('#practiceNav').click();await p.locator('#activity').selectOption(activity);await p.locator('#sessionView').selectOption('worksheet');await p.locator('#level').selectOption(level);await p.locator('#questionCount').selectOption(count);await p.locator(mode==='test'?'#testMode':'#practiceMode').click();await p.locator('#inputMode').selectOption(input)}
async function answer(p,value){await p.locator('.keyboard-active input').fill(String(value??await p.evaluate(()=>items[index].answer)));await p.locator('.keyboard-active input').press('Enter')}
(async()=>{
await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
await test('All 40 activity/level choices, fresh questions and variable-count completion',async()=>{
 const [c,p]=await page();
 for(const activity of ['addition','subtraction','multiplication','division','bonds','doubles','halves','squares'])for(let level=0;level<5;level++){
  await setup(p,activity,String(level));await p.locator('#start').click();
  assert.equal(await p.locator('#grid .fact').count(),5);assert.equal(await p.evaluate(()=>items.length),5);
  assert(!(await p.locator('#grid').innerText()).includes('undefined'));
  const first=await p.evaluate(()=>items.map(p=>p.text).join('|'));
  for(let i=0;i<5;i++)await answer(p);
  assert.equal(await p.evaluate(()=>history[0].items.filter(first).length),5);
  assert((await p.locator('#resultsView').innerText()).includes('/ 5 first try'));
  await setup(p,activity,String(level));await p.locator('#start').click();
  const second=await p.evaluate(()=>items.map(p=>p.text).join('|'));assert.notEqual(first,second);
  await p.locator('#end').click();
 }
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem(MATH_KEY)).length),80);
 await p.reload();assert.equal(await p.evaluate(()=>history.length),80);await c.close();
});
await test('Synthetic v5 records remain byte-identical; mixed-history review, stats and exports',async()=>{
 const [c,p]=await page();
 const legacy=await p.evaluate(()=>{const list=generate(7);list[0].status='correct';list[0].attempts=[{value:list[0].answer,transcript:String(list[0].answer),correct:true,source:'keyboard',at:20}];return JSON.stringify([{id:42,date:'2025-01-01T00:00:00Z',table:7,mode:'test',input:'keyboard',target:null,unrecognized:[],invalidated:[],elapsed:120000,reason:'time',items:list}])});
 await p.evaluate(data=>localStorage.setItem(KEY,data),legacy);await p.reload();
 await setup(p,'addition');await p.locator('#start').click();await answer(p);await answer(p,9999);await answer(p);await p.locator('#skip').click();await p.locator('#undo').click();await p.locator('#skip').click();await p.locator('#end').click();
 assert.deepEqual(await p.evaluate(()=>stats(history[0])),{first:1,correct:2,wrong:0,unanswered:3,errors:1,skips:1});
 assert.equal(await p.evaluate(()=>localStorage.getItem(KEY)),legacy);await p.reload();
 assert.equal(await p.evaluate(()=>localStorage.getItem(KEY)),legacy);assert.equal(await p.evaluate(()=>history.length),2);
 await p.locator('#historyNav').click();assert(!(await p.locator('#historyView').innerText()).includes('NaN'));assert(await p.evaluate(()=>patterns().every(m=>m.seen>0)));assert.equal(await p.locator('[data-activity-progress]').count(),8);
 assert((await p.locator('[data-activity-progress="addition"]').innerText()).includes('1 flights · 2 correct'));
 await p.locator('[data-activity-progress="addition"]').click();assert.equal(await p.locator('[data-review]').count(),1);await p.locator('[data-review="0"]').click();assert((await p.locator('#resultsView').innerText()).toLowerCase().includes('addition'));
 await p.locator('#seeProgress').click();
 for(const [selector,check] of [['#exportAll',text=>{const records=JSON.parse(text);assert.equal(records.length,2);assert.deepEqual(records.find(s=>s.id===42),JSON.parse(legacy)[0])}],['#exportCSV',text=>{assert(!text.includes('undefined'));assert(text.includes('activity'));assert(text.includes('addition'));assert(text.includes('7 ×'))}]]){const pending=p.waitForEvent('download');await p.locator(selector).click();const file=await (await pending).path();check(fs.readFileSync(file,'utf8'))}
 await p.locator('[data-review="1"]').click();assert((await p.locator('#resultsView').innerText()).includes('1 / 60 first try'));await c.close();
});
await test('Spoken whole-number parser covers 0–2500, aliases and duplicate numeric transcripts',async()=>{
 const [c,p]=await page();
 const units=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'],tens=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
 const words=n=>n<20?units[n]:n<100?tens[Math.floor(n/10)]+(n%10?' '+units[n%10]:''):n<1000?units[Math.floor(n/100)]+' hundred'+(n%100?' and '+words(n%100):''):units[Math.floor(n/1000)]+' thousand'+(n%1000?' '+words(n%1000):'');
 const cases=Array.from({length:2501},(_,n)=>[words(n),n]);
 assert.deepEqual(await p.evaluate(cases=>cases.filter(([text,n])=>parseNumber(text)!==n),cases),[]);
 for(const [text,n] of [['',null],['one hundred hundred',null],['one thousand one thousand',null],['two thousand five hundred',2500],['/2500 2500',2500],['2500/2400',null],['to',2],['for',4]])assert.equal(await p.evaluate(text=>parseVoiceNumber(text),text),n,text);
 await c.close();
});
await test('Mock speech ready, advanced answer, reconnect and timed expiry retain results',async()=>{
 const [c,p]=await page();await p.addInitScript(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});await p.reload();
 await p.clock.install();await setup(p,'squares','4','30','test','voice');await p.locator('#start').click();assert.equal(await p.evaluate(()=>phase),'checking');
 let speechIndex=0;const say=text=>p.evaluate(({text,index})=>{const r=[{transcript:text}];r.isFinal=true;const results=Array.from({length:index+1},()=>r);testRecognition.onresult({resultIndex:index,results})},{text,index:speechIndex++});
 await say('ready');assert.equal(await p.evaluate(()=>phase),'running');
 // Feed the actual selected answer; final 2500 word parsing is also checked exhaustively above.
 await say(String(await p.evaluate(()=>items[index].answer)));assert.equal(await p.evaluate(()=>stats({items}).correct),1);
 await p.locator('#resume').click();assert.equal(await p.locator('#micStatus').getAttribute('data-state'),'connected');
 await p.clock.fastForward(120100);assert.equal(await p.evaluate(()=>history[0].reason),'time');assert.equal(await p.evaluate(()=>history[0].activity),'squares');await c.close();
});
for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1024,768],[1440,900]])await test(`New activity layouts and four-digit answers ${width}x${height}`,async()=>{
 const [c,p]=await page({viewport:{width,height},hasTouch:width<1440,isMobile:width<1440,reducedMotion:'reduce'});
 for(const activity of ['addition','subtraction','multiplication','division','bonds','doubles','halves','squares']){
  await setup(p,activity,'4','30');await p.locator('#start').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width<=680){
   for(let i=0;i<(activity==='squares'?30:1);i++){const value=String(await p.evaluate(()=>items[index].answer));for(const digit of value)await p.locator(`[data-digit="${digit}"]`).click();await p.locator('[data-action="enter"]').click()}
   if(activity==='squares')assert.equal(await p.evaluate(()=>history[0].items.some(p=>p.answer===2500&&p.status==='correct')),true);
  }else await answer(p);
  if(width<=680&&await p.evaluate(()=>phase==='running')){const row=await p.locator('.fact.active').boundingBox(),pad=await p.locator('#mobileKeypad').boundingBox();assert(pad&&row.y>=0&&row.y+row.height<=pad.y,'active equation must stay above keypad')}
  if(activity==='bonds')await p.screenshot({path:path.join(output,`math-worksheet-${width}.png`)});
  if(await p.evaluate(()=>phase==='running'))await p.locator('#end').click();
 }
 await p.locator('#historyNav').click();assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(output,`math-progress-${width}.png`),fullPage:true});await c.close();
});
await test('Malformed stored JSON is preserved and does not get overwritten on finish',async()=>{const [c,p]=await page();await p.evaluate(()=>localStorage.setItem(MATH_KEY,'broken'));await p.reload();await setup(p,'addition');await p.locator('#start').click();await p.locator('#end').click();assert.equal(await p.evaluate(()=>localStorage.getItem(MATH_KEY)),'broken');assert((await p.locator('#resultsView').innerText()).includes('saving is unavailable'));await c.close()});
await test('No uncaught browser errors',()=>assert.deepEqual(errors,[]));
fs.writeFileSync(path.join(output,'math-results.json'),JSON.stringify({results,errors},null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
