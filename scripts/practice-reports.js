// Pure reporting adapters. No DOM, storage, transcript copying or history mutation.
(function(root){
'use strict';
const content=typeof module!=='undefined'&&module.exports?require('./content-definitions.js'):root.FactFlightContent;
const VERSION='reports-v1';
const nonnegative=n=>Number.isFinite(n)&&n>=0;
function outcome(p){
 const attempts=Array.isArray(p?.attempts)?p.attempts:[],skips=Number.isSafeInteger(p?.skips)&&p.skips>=0?p.skips:0;
 const encountered=attempts.length>0||skips>0,wrong=attempts.filter(a=>a?.correct===false).length;
 const valid=Array.isArray(p?.attempts)&&Number.isSafeInteger(p.skips)&&p.skips>=0&&attempts.every(a=>typeof a?.correct==='boolean')&&['pending','correct','wrong','skipped'].includes(p.status)&&(!attempts.length||p.status!=='correct'||attempts.at(-1).correct===true);
 return {encountered,valid,first:encountered&&p.status==='correct'&&!skips&&attempts.length===1&&attempts[0].correct===true?1:0,correct:p?.status==='correct'?1:0,wrong,unresolvedWrong:p?.status!=='correct'&&wrong>0?1:0,skips,ms:nonnegative(p?.ms)?p.ms:null,
  // Skip timestamps are not saved. Do not pretend display order proves chronology.
  at:!skips&&attempts.length&&nonnegative(attempts[0]?.at)?attempts[0].at:null,
  incorrectValues:attempts.filter(a=>a?.correct===false&&Number.isFinite(a.value)).map(a=>a.value)};
}
function normalize(sessions,{learnerId}={}){
 if(learnerId!==null&&(typeof learnerId!=='string'||!learnerId))throw Error('Select a learner ID, or null for unassigned legacy history');
 if(!Array.isArray(sessions))throw Error('Sessions must be an array');
 const seen=new Set();
 return sessions.filter(s=>s&&(!s.guest)&&(learnerId===null?s.learnerId===undefined:s.learnerId===learnerId)).map(s=>{
  if((typeof s.id!=='string'&&typeof s.id!=='number')||seen.has(String(s.id)))throw Error('Missing or duplicate session ID in selected history');
  seen.add(String(s.id));
  const scope=content.scopeFromSession(s),items=Array.isArray(s.items)?s.items:[];
  const entries=items.map((p,index)=>{
   p=p&&typeof p==='object'?p:{};
   let itemScope=scope;
   if(s.activity==='review'){
    const origin={...p,schemaVersion:p.selection?.type==='families'?4:p.selection?2:1};
    if(p.table!==undefined){delete origin.activity;delete origin.schemaVersion;}
    itemScope=content.scopeFromSession(origin);
   }
   return {index,...outcome(p),fact:content.classify(p,itemScope),activity:s.activity==='review'?p.activity:scope?.activity||s.activity||'unknown'};
  });
  const dateMs=Date.parse(s.date),elapsed=nonnegative(s.elapsed)?s.elapsed:null;
  const completed=s.reason==='complete'&&entries.length>0&&entries.every(e=>e.correct&&e.encountered&&e.valid);
  const timeLimitMs=scope?.kind==='school'?(s.mode==='test'?120000:null):s.timeLimitMs;
  const comparable=!!scope&&['voice','keyboard'].includes(s.input)&&['test','practice'].includes(s.mode)&&(scope.kind==='school'||['quick','free','timed','test'].includes(s.practiceType))&&(s.mode==='practice'?timeLimitMs===null:nonnegative(timeLimitMs)&&timeLimitMs>0)&&(s.target===null||Number.isSafeInteger(s.target)&&s.target>0);
  return {id:String(s.id),date:Number.isFinite(dateMs)?new Date(dateMs).toISOString():null,dateMs:Number.isFinite(dateMs)?dateMs:null,scope,activity:scope?.activity||s.activity||'unknown',mode:s.mode,practiceType:s.practiceType|| (scope?.kind==='school'?'school':null),input:s.input||null,target:s.target??null,timeLimitMs:timeLimitMs??null,elapsed,completed,reason:s.reason||null,recordValid:Array.isArray(s.items),comparable,entries};
 });
}
function metrics(entries){
 const encountered=entries.filter(e=>e.encountered),timed=encountered.filter(e=>e.ms!==null),first=encountered.reduce((n,e)=>n+e.first,0);
 return {generated:entries.length,encounters:encountered.length,untouched:entries.length-encountered.length,first,correct:entries.reduce((n,e)=>n+e.correct,0),wrong:encountered.reduce((n,e)=>n+e.wrong,0),unresolvedWrong:encountered.reduce((n,e)=>n+e.unresolvedWrong,0),skips:encountered.reduce((n,e)=>n+e.skips,0),accuracy:encountered.length?first/encountered.length:null,score:entries.length?first/entries.length:null,distinctFamilies:new Set(encountered.filter(e=>e.fact.valid).map(e=>e.fact.activity+':'+e.fact.familyKey)).size,invalidFacts:entries.filter(e=>!e.fact.valid).length,invalidOutcomes:entries.filter(e=>!e.valid).length,timed:timed.length,activeMs:timed.reduce((n,e)=>n+e.ms,0),averageActiveMs:timed.length?timed.reduce((n,e)=>n+e.ms,0)/timed.length:null};
}
function summary(flights){
 const times=flights.filter(f=>f.elapsed!==null);
 return {...metrics(flights.flatMap(f=>f.entries)),sessions:flights.length,completed:flights.filter(f=>f.completed).length,practiceMs:times.reduce((n,f)=>n+f.elapsed,0),missingPracticeTimes:flights.length-times.length};
}
function tableContent(flights,{selectableThrough=10,window='all'}={}){
 if(![10,12].includes(selectableThrough)||!['all','recent'].includes(window))throw Error('Unsupported table report options');
 let eligible=flights.map(f=>({...f,entries:f.entries.filter(e=>e.encountered&&e.fact.valid&&e.fact.activity==='multiplication')})).filter(f=>f.entries.length).sort(newest);
 const eligibleFlights=eligible.length;if(window==='recent')eligible=eligible.slice(0,5);
 const entries=eligible.flatMap(f=>f.entries),tables=new Map(Array.from({length:selectableThrough},(_,i)=>[i+1,[]]));
 for(const e of entries)for(const n of new Set(e.fact.operands)){if(!tables.has(n))tables.set(n,[]);tables.get(n).push(e)}
 const rows=[...tables].sort((a,b)=>a[0]-b[0]).map(([table,es])=>({table,...metrics(es)}));
 return {flights:eligible.length,eligibleFlights,total:metrics(entries),selectable:rows.filter(r=>r.table>=1&&r.table<=selectableThrough),higherFactors:rows.filter(r=>r.table>selectableThrough),otherFactors:rows.filter(r=>r.table<1),overlap:true};
}
function newest(a,b){return (b.dateMs??-Infinity)-(a.dateMs??-Infinity)||a.id.localeCompare(b.id,'en')}
function comparableKey(f){
 return f.comparable?JSON.stringify([content.scopeKey(f.scope),f.entries.length,f.mode,f.practiceType,f.timeLimitMs,f.input,f.target]):null;
}
function setupReports(flights){
 const groups=new Map();
 for(const f of flights){const key=comparableKey(f);if(key===null)continue;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f)}
 return [...groups].sort((a,b)=>a[0].localeCompare(b[0],'en')).map(([key,fs])=>{
  const completed=fs.filter(f=>f.completed&&f.elapsed!==null&&f.entries.every(e=>e.fact.valid&&e.valid));
  const clean=completed.filter(f=>f.entries.every(e=>e.first)),corrected=completed.filter(f=>!f.entries.every(e=>e.first));
  const fastest=xs=>xs.length?Math.min(...xs.map(f=>f.elapsed)):null;
  return {key,scope:structuredClone(fs[0].scope),...summary(fs),cleanSamples:clean.length,correctedSamples:corrected.length,fastestCleanMs:fastest(clean),fastestCorrectedMs:fastest(corrected)};
 });
}
function factsToFocusOn(flights){
 const groups=new Map();
 // Stable oldest-to-newest flight order, then saved first-attempt order where
 // available. Missing skip chronology remains disclosed by readiness, not guessed.
 for(const f of flights.slice().sort(newest).reverse())for(const e of f.entries.slice().sort((a,b)=>(a.at??Infinity)-(b.at??Infinity)||a.index-b.index))if(e.encountered&&e.fact.valid){const key=e.fact.activity+':'+e.fact.familyKey;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e)}
 return [...groups].map(([key,es])=>({key,activity:es[0].fact.activity,display:es[0].fact.displayKey,...metrics(es),recentIncorrectValues:es.flatMap(e=>e.incorrectValues||[]).slice(-12),incorrectValueOrder:'flight date, first-attempt time where known, stable item-index fallback'})).sort((a,b)=>(b.wrong+b.skips)-(a.wrong+a.skips)||a.key.localeCompare(b.key,'en'));
}
function report(sessions,options){
 const flights=normalize(sessions,options),activities=content.activityOrder.map(activity=>{
  const relevant=flights.filter(f=>f.entries.some(e=>e.activity===activity)||f.activity===activity);
  const subset=relevant.map(f=>({...f,entries:f.entries.filter(e=>e.activity===activity),elapsed:f.activity==='review'?f.entries.filter(e=>e.activity===activity&&e.ms!==null).reduce((n,e)=>n+e.ms,0):f.elapsed,completed:f.activity==='review'?false:f.completed}));
  return {activity,...summary(subset),mixedReviewFlights:relevant.filter(f=>f.activity==='review').length,timeBasis:'session elapsed; matching active time for mixed review',countsOverlap:true};
 });
 return {version:VERSION,summary:summary(flights),activities,tables:tableContent(flights,options),setups:setupReports(flights),uncomparableSessions:flights.filter(f=>!f.comparable).length,facts:factsToFocusOn(flights),flights};
}
const api={VERSION,outcome,normalize,metrics,summary,tableContent,newest,comparableKey,setupReports,factsToFocusOn,report};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactFlightReports=api;
})(globalThis);
