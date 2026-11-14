// Integrated app tests: isolated contexts, synthetic history, no real microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),output=process.env.FF_TEST_OUTPUT||require('node:os').tmpdir();fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{const files={'/':'index.html','/scripts/menus.js':'scripts/menus.js','/styles/menus.css':'styles/menus.css','/scripts/math-activities.js':'scripts/math-activities.js','/styles/brand.css':'styles/brand.css','/assets/brand/horizontal.svg':'assets/brand/horizontal.svg'};const f=files[req.url];if(!f){res.writeHead(404);return res.end()}res.setHeader('Content-Type',f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,f)))});
const results=[],errors=[];let browser,url;
async function test(name,fn){if(process.env.FF_TEST_FILTER&&!name.includes(process.env.FF_TEST_FILTER))return;try{await fn();results.push({name,status:'PASS'})}catch(e){results.push({name,status:'FAIL',error:e.stack})}console.log(JSON.stringify(results.at(-1)))}
async function page(options={}){const c=await browser.newContext(options),p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url);return [c,p]}

async function choose(p,{activity='addition',mode='quick',view='focus',input='keypad',level=0,count=5,table=2}={}){
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
 for(const [width,height] of [[320,568],[390,844],[430,932],[844,390],[768,1024],[1440,1000]])await test(`Readable menus and questions ${width}x${height}`,async()=>{
  const [c,p]=await page({viewport:{width,height},hasTouch:width<1000,isMobile:width<1000,reducedMotion:'reduce'});
  assert.equal(await p.locator('[data-math] strong').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)),20);assert.equal(await p.locator('[data-math] .sub').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize)),16);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===390)await p.screenshot({path:path.join(output,'larger-home-phone.png'),fullPage:true});
  for(const activity of ['addition','subtraction','multiplication','division','bonds','doubles','halves','squares']){
   await choose(p,{activity,level:4});
   assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),activity+' overflow');
   const font=await p.locator('#focusEquation').evaluate(e=>parseFloat(getComputedStyle(e).fontSize));assert(font>=34,activity+' prompt too small');
   // Every token stays inside the prompt card, even when the equation wraps.
   assert(await p.locator('#focusEquation').evaluate(e=>e.scrollWidth<=e.clientWidth+1),activity+' prompt clipped');
   for(const id of ['focusEquation','skip','undo','end','sessionHome']){await p.locator('#'+id).scrollIntoViewIfNeeded();const b=await p.locator('#'+id).boundingBox();assert(b.y>=-1&&b.y+b.height<=height+1,id+' unreachable '+JSON.stringify(b))}
   const value=String(await p.evaluate(()=>items[index].answer));for(const d of value)await p.locator(`[data-focus-digit="${d}"]`).click();await p.locator('#focusForm button[type=submit]').click();assert.equal(await p.evaluate(()=>index),1);
   await p.locator('#end').click();
  }
  await c.close();
 });
 await test('Large School prompt and voice feedback in light and dark phone themes',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await p.addInitScript(()=>{window.SpeechRecognition=class{constructor(){window.testRecognition=this}start(){this.onstart?.()}abort(){}}});await p.reload();
  await choose(p,{mode:'school',table:9,input:'voice'});await p.evaluate(()=>{const r=[{transcript:'ready'}];r.isFinal=true;testRecognition.onresult({resultIndex:0,results:[r]})});
  assert(await p.locator('#focusEquation').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=54));assert(await p.locator('#heard').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=16));
  for(const theme of ['light','dark']){await p.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await p.screenshot({path:path.join(output,`larger-school-${theme}.png`)});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))}
  await p.locator('#end').click();await c.close();
 });
 await test('Larger original School worksheet keeps three columns and touch input',async()=>{
  const [c,p]=await page({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await choose(p,{mode:'school',view:'worksheet',table:9});assert.equal(await p.locator('#grid .column').count(),3);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const n=String(await p.evaluate(()=>items[index].answer));for(const d of n)await p.locator(`[data-digit="${d}"]`).click();await p.locator('[data-action=enter]').click();assert.equal(await p.evaluate(()=>index),1);await p.screenshot({path:path.join(output,'larger-worksheet.png')});await c.close();
 });
 await test('No browser errors',()=>assert.deepEqual(errors,[]));fs.writeFileSync(path.join(output,'readability-results.json'),JSON.stringify({results,errors},null,2));process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
