// Isolated Windows Chrome calculation smoke; no real profile or microphone.
const {chromium}=require('playwright');
const assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('about:blank');
  await page.evaluate(()=>{for(const key of ['localStorage','sessionStorage','indexedDB'])Object.defineProperty(window,key,{get(){throw Error('Storage access is forbidden in calculation tests')}})});
  for(const file of ['math-activities','content-definitions','practice-reports','practice-readiness'])await page.addScriptTag({path:path.join(__dirname,'../scripts/'+file+'.js')});
  const result=await page.evaluate(()=>{
   const sessions=Array.from({length:6},(_,i)=>({id:'synthetic-'+i,learnerId:'synthetic-a',date:new Date(Date.UTC(2026,0,i+1)).toISOString(),activity:'squares',schemaVersion:1,level:2,mode:'practice',practiceType:'quick',timeLimitMs:null,target:null,input:'keyboard',reason:'complete',elapsed:5000,items:Array.from({length:5},(_,j)=>{const n=j%2?12:11;return {key:'square:'+n,text:n+'²',answer:n*n,status:'correct',skips:0,ms:1000,attempts:[{correct:true,at:j*1000}]}})}));
   const before=JSON.stringify(sessions),report=FactFlightReports.report(sessions,{learnerId:'synthetic-a'}),readiness=FactFlightReadiness.evaluate(report.flights,{kind:'level',activity:'squares',level:2});
   return {first:report.summary.first,sessions:report.summary.sessions,ready:readiness.ready,coverage:readiness.coverage.distinct,unchanged:before===JSON.stringify(sessions),version:readiness.version};
  });
  assert.deepEqual(result,{first:30,sessions:6,ready:true,coverage:2,unchanged:true,version:'readiness-v1'});assert.deepEqual(errors,[]);
  console.log('PASS Windows Chrome isolated calculation smoke: browser globals, short-flight readiness, coverage, immutable inputs and no storage access');
 }finally{await browser.close()}
})().catch(e=>{console.error(e.message);process.exitCode=1});
