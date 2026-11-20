const assert=require('node:assert/strict'),M=require('../scripts/practice-readiness.js'),fixtures=require('./focus-fixtures.cjs');
const rows=fixtures('demo'),level=rows.filter(s=>s.activity==='squares'),fresh=level.at(-1),prior=level.slice(0,-1);
assert.equal(M.firstAchievements(prior,fresh).length,1);
assert.deepEqual(M.firstAchievements([],fresh),[]);
assert.deepEqual(M.firstAchievements(prior,{...fresh,reason:'manual'}),[]);
assert.deepEqual(M.firstAchievements(prior,{...fresh,guest:true}),[]);
assert.deepEqual(M.firstAchievements(prior.map(s=>({...s,learnerId:'other'})),fresh),[]);
const next={...structuredClone(fresh),id:'next',date:'2026-08-01T00:00:00Z'};
assert.deepEqual(M.firstAchievements(level,next),[]);
const losses=Array.from({length:12},(_,i)=>({...structuredClone(fresh),id:'loss'+i,date:new Date(Date.UTC(2026,7,2+i)).toISOString(),items:fresh.items.map(p=>({...structuredClone(p),attempts:[{value:999,correct:false,at:0},{value:p.answer,correct:true,at:1}]}))}));
const regained=Array.from({length:3},(_,i)=>({...structuredClone(fresh),id:'regain'+i,date:new Date(Date.UTC(2026,8,1+i)).toISOString()}));
assert.deepEqual(M.firstAchievements([...level,...losses,...regained.slice(0,2)],regained[2]),[]);
for(const activity of ['multiplication','division']){
 const family=rows.filter(s=>s.activity===activity);assert.equal(M.firstAchievements(family.slice(0,-1),family.at(-1)).length,1);
}
const school=rows.filter(s=>s.table);assert.equal(M.firstAchievements(school.slice(0,-1),school.at(-1))[0].kind,'school');
const snapshot=JSON.stringify(rows);M.firstAchievements(rows,fresh);assert.equal(JSON.stringify(rows),snapshot);
console.log('PASS first achievement: level, families, timed achievement, no repeat/regain, stopped/Guest/insufficient evidence, learner isolation, immutable history');
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const rel=req.url==='/'?'index.html':req.url.slice(1);if(!/^(index\.html|scripts\/[\w-]+\.js|styles\/[\w-]+\.css|assets\/brand\/[\w-]+\.svg)$/.test(rel)){res.writeHead(404);return res.end()}res.setHeader('Content-Type',rel.endsWith('.js')?'application/javascript':rel.endsWith('.css')?'text/css':rel.endsWith('.svg')?'image/svg+xml':'text/html');res.end(fs.readFileSync(path.join(root,rel)))});
let browser;
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));browser=await chromium.launch({channel:'chrome',headless:true});
for(const width of [320,390,1440]){
 const context=await browser.newContext({viewport:{width,height:900}}),p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(`http://127.0.0.1:${server.address().port}`);
 await p.locator('[data-create-profile]').click();await p.locator('#nickname').fill('Achievement demo');await p.locator('#profileForm button').click();await p.locator('[data-quick]').waitFor();
 const id=await p.evaluate(()=>FlightProfiles.reviewOwner()),samples=fixtures(id).filter(s=>s.activity==='squares');
 await p.evaluate(samples=>{const data=JSON.parse(localStorage.getItem('fact-flight-family-v1'));data.sessions=samples.slice(0,2);localStorage.setItem('fact-flight-family-v1',JSON.stringify(data));window.achievementSample=samples[2];saveSession(achievementSample);renderResult(achievementSample);show('resultsView')},samples);
 await p.waitForFunction(()=>document.querySelector('#profileSaveStatus').textContent.startsWith('Saved'));
 assert.equal(await p.locator('.mastery-notification').count(),1);assert((await p.locator('.mastery-notification').innerText()).includes('Squares · Level 3'));
 for(const theme of ['light','dark']){await p.evaluate(t=>document.documentElement.dataset.theme=t,theme);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));if(process.env.FF_TEST_OUTPUT)await p.screenshot({path:path.join(process.env.FF_TEST_OUTPUT,`new-mastery-${width}-${theme}.png`),fullPage:true});}
 await p.locator('.mastery-details').click();assert(await p.locator('#historyView').isVisible());await p.waitForFunction(()=>document.querySelector('#pdMastery').open);await p.waitForFunction(()=>document.querySelector('#pdReady-squares-2')?.open);assert(await p.locator('#pdReady-squares-2>summary').evaluate(e=>document.activeElement===e));
 await p.evaluate(()=>{renderResult(achievementSample);show('resultsView')});assert.equal(await p.locator('.mastery-notification').count(),0);
 await p.reload();await p.locator('[data-learner]:not([data-learner=guest])').click();await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem('fact-flight-family-v1')).sessions.find(s=>s.activity==='squares');renderResult(s);show('resultsView')});assert.equal(await p.locator('.mastery-notification').count(),0);assert.deepEqual(errors,[]);await context.close();console.log(`PASS notification UI ${width}: fresh result, details link, no reopened/reloaded notification, both themes`);
}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server.close()});
