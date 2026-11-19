// Isolated real-app Chrome checks, synthetic profiles only. No real microphone.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const rel=req.url==='/'?'index.html':req.url.slice(1);if(!/^(index\.html|scripts\/[\w-]+\.js|styles\/[\w-]+\.css|assets\/brand\/[\w-]+\.svg)$/.test(rel)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',rel.endsWith('.js')?'application/javascript':rel.endsWith('.css')?'text/css':rel.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,rel)))});
let browser;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({channel:'chrome',headless:true});const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}`);
 async function create(name){await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill(name);await p.locator('#profileForm button').click();}
 async function start(){await p.locator('[data-quick]').click();await require('./menu-route.cjs')(p,'squares');await p.locator('[data-level="2"]').click();await p.locator('[data-count="5"]').click();await p.locator('[data-next]').click();await p.locator('[data-input="keypad"]').click();await p.locator('[data-view="focus"]').click();await p.locator('[data-start]').click();}
 await create('Synthetic A');const id=await p.evaluate(()=>FlightProfiles.reviewOwner());
 let questions=[];
 for(let i=0;i<4;i++){
  await start();questions.push(...await p.evaluate(()=>items.map(q=>q.key)));
  // Untouched stopped flights count generated slots and preserve schema.
  await p.locator('#end').click();await p.locator('#resultHome').click();
 }
 assert.equal(questions.filter(k=>['square:11','square:12'].includes(k)).length,12);assert.equal(questions.filter(k=>k==='square:1').length,1);
 assert.equal(await p.evaluate(()=>[...FlightProfiles.generationMemory().values()][0].generated),20);
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('fact-flight-family-v1')));assert(saved.sessions.every(s=>s.schemaVersion===1&&!s.generatorVersion&&!s.carryover));
 await p.locator('[data-change-learner]').click();await create('Synthetic B');assert.equal(await p.evaluate(()=>FlightProfiles.generationMemory().size),0);
 await p.locator('[data-change-learner]').click();await p.locator(`[data-learner="${id}"]`).click();assert.equal(await p.evaluate(()=>[...FlightProfiles.generationMemory().values()][0].generated),20);
 await p.reload();await p.locator(`[data-learner="${id}"]`).click();assert.equal(await p.evaluate(()=>FlightProfiles.generationMemory().size),0);assert.equal(await p.evaluate(()=>history.length),4);
 await p.locator('[data-change-learner]').click();await p.locator('[data-learner="guest"]').click();await start();await p.locator('#end').click();await p.locator('#resultHome').click();assert.equal(await p.evaluate(()=>FlightProfiles.generationMemory().size),1);
 await p.locator('[data-change-learner]').click();await p.locator('[data-learner="guest"]').click();assert.equal(await p.evaluate(()=>FlightProfiles.generationMemory().size),0);
 assert.deepEqual(errors,[]);console.log('PASS real-app Chrome: 4×5 allocation, stopped-flight semantics, learner isolation, Guest reset, reload reset and unchanged saved schemas/history.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
