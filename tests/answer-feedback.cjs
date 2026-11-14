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

async function start(p,opts={}){await create(p,'Feedback');await p.clock.install();await p.clock.pauseAt(await p.evaluate(()=>Date.now()+1000));p.feedbackClock=true;await choose(p,{view:'focus',...opts})}
async function rawAnswer(p,value){await p.locator('#focusAnswer').fill(String(value));await p.locator('#focusAnswer').press('Enter')}
async function kind(p){return p.locator('#focusCard').getAttribute('data-feedback')}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));url=`http://127.0.0.1:${server.address().port}`;browser=await chromium.launch({headless:true,channel:'chrome'});
 await test('Wrong stays red and shakes again; correct holds green then advances once',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844}});await start(p);await rawAnswer(p,9999);assert.equal(await kind(p),'wrong');assert((await p.locator('#focusFeedback').innerText()).includes('✕'));await p.clock.runFor(2000);assert.equal(await kind(p),'wrong');await rawAnswer(p,9998);assert.equal(await p.evaluate(()=>items[0].attempts.length),2);assert((await p.locator('#focusCard').getAttribute('class')).includes('shake'));await p.screenshot({path:path.join(output,'feedback-wrong-phone.png'),fullPage:true});const equation=await p.locator('#focusEquation').innerText();await rawAnswer(p,await p.evaluate(()=>items[0].answer));assert.equal(await kind(p),'correct');assert.equal(await p.evaluate(()=>index),0);assert.equal(await p.locator('#focusEquation').innerText(),equation);await p.screenshot({path:path.join(output,'feedback-correct-phone.png'),fullPage:true});await p.evaluate(()=>submit(999,'999','keyboard'));assert.equal(await p.evaluate(()=>items[0].attempts.length),3);await p.clock.runFor(349);assert.equal(await p.evaluate(()=>index),0);await p.clock.runFor(1);assert.equal(await p.evaluate(()=>index),1);assert.equal(await kind(p),null);assert.equal(await p.evaluate(()=>stats({items}).correct),1);await c.close();
 });
 await test('Skip clears wrong; Undo cancels pending advance and restores scoring',async()=>{
  const [c,p]=await page();await start(p);await rawAnswer(p,9999);await p.locator('#skip').click();assert.equal(await kind(p),null);assert.equal(await p.evaluate(()=>index),1);await rawAnswer(p,await p.evaluate(()=>items[index].answer));await p.locator('#undo').click();await p.clock.runFor(500);assert.equal(await p.evaluate(()=>index),1);assert.equal(await p.evaluate(()=>items[1].status),'pending');assert.equal(await kind(p),null);assert.equal(await p.evaluate(()=>stats({items}).correct),0);await c.close();
 });
 await test('Unrecognized speech flashes neutral without scoring, repeated unclear speech returns to red',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844}});await p.addInitScript(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});await p.reload();await start(p,{input:'voice'});let k=0;const say=text=>p.evaluate(({text,k})=>{const r=[{transcript:text}];r.isFinal=true;testRecognition.onresult({resultIndex:k,results:Array(k+1).fill(r)})},{text,k:k++});await say('ready');await say('hello airplane');assert.equal(await kind(p),'unheard');assert.equal(await p.evaluate(()=>items[0].attempts.length),0);assert(await p.locator('#focusFeedback').isVisible());await p.screenshot({path:path.join(output,'feedback-unheard-phone.png'),fullPage:true});await p.clock.runFor(650);assert.equal(await kind(p),null);await say('9999');assert.equal(await kind(p),'wrong');await say('hello again');await p.clock.runFor(100);await say('unclear words');assert.equal(await kind(p),'unheard');await p.clock.runFor(650);assert.equal(await kind(p),'wrong');assert.equal(await p.evaluate(()=>items[0].attempts.length),1);await say(String(await p.evaluate(()=>items[0].answer)));await say('another phrase');assert.equal(await kind(p),'correct');assert.equal(await p.evaluate(()=>session.unrecognized.length),3);const delayed=k++;await p.evaluate(k=>{const r=[{transcript:'777'}];r.isFinal=false;testRecognition.onresult({resultIndex:k,results:Array(k+1).fill(r)})},delayed);await p.clock.runFor(350);await p.evaluate(k=>{const r=[{transcript:'777'}];r.isFinal=true;testRecognition.onresult({resultIndex:k,results:Array(k+1).fill(r)})},delayed);assert.equal(await p.evaluate(()=>index),1);assert.equal(await p.evaluate(()=>items[1].attempts.length),0);await c.close();
 });
 await test('Finish during feedback saves once; timer expiry cancels delayed advance',async()=>{
  for(const exit of ['finish','time']){const [c,p]=await page();await start(p,{mode:'timed'});if(exit==='time')await p.clock.runFor(119900);await rawAnswer(p,await p.evaluate(()=>items[0].answer));if(exit==='finish')await p.locator('#end').click();else await p.clock.runFor(100);await p.clock.runFor(500);assert.equal(await p.evaluate(()=>phase),'done');assert.equal(await p.evaluate(()=>history.length),1);assert.equal(await p.evaluate(()=>stats(history[0]).correct),1);assert.equal(await p.evaluate(()=>index),0);await c.close()}
 });
 await test('Last correct answer before deadline retains complete outcome and exact completion time',async()=>{
  const [c,p]=await page();await start(p,{mode:'timed',count:5});for(let i=0;i<4;i++)await answer(p);await p.evaluate(()=>{started=performance.now()-119900;submit(items[index].answer,String(items[index].answer),'keyboard')});const completed=await p.evaluate(()=>completedAt-started);await p.clock.runFor(400);assert.equal(await p.evaluate(()=>history[0].reason),'complete');assert.equal(await p.evaluate(()=>history[0].elapsed),completed);assert.equal(await p.evaluate(()=>stats(history[0]).first),5);await c.close();
 });
 await test('Both themes have distinct feedback colors and reduced motion retains visible labels',async()=>{
  const [c,p]=await page({reducedMotion:'reduce'});await start(p);for(const theme of ['light','dark']){await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);const colors=[];for(const state of ['wrong','correct','unheard']){await p.evaluate(state=>flashAnswerFeedback(state),state);colors.push(await p.locator('#focusCard').evaluate(e=>getComputedStyle(e).backgroundColor));assert.equal(await p.locator('#focusCard').evaluate(e=>getComputedStyle(e).animationName),'none');assert((await p.locator('#focusFeedback').innerText()).length>0)}assert.equal(new Set(colors).size,3)}await c.close();
 });
 await test('Worksheet input keeps immediate advancement and wrong-answer row feedback',async()=>{
  const [c,p]=await page();await start(p,{view:'worksheet'});await p.evaluate(()=>flashAnswerFeedback('unheard'));await answer(p,9999);assert.equal(await p.locator('#fact0').getAttribute('data-feedback'),null);assert((await p.locator('#fact0').getAttribute('class')).includes('wrong'));await answer(p);assert.equal(await p.evaluate(()=>index),1);assert.equal(await p.evaluate(()=>transitioning),false);await c.close();
 });
 await test('No page errors',async()=>assert.deepEqual(errors,[]));
 await browser.close();server.close();fs.writeFileSync(path.join(output,'feedback-results.json'),JSON.stringify(results,null,2));if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
