// Derived readiness only. Never writes achievements, preferences or saved records.
(function(root){
'use strict';
const common=typeof module!=='undefined'&&module.exports;
const content=common?require('./content-definitions.js'):root.FactFlightContent;
const reports=common?require('./practice-reports.js'):root.FactFlightReports;
const VERSION='readiness-v1';
function requirement(id,value,target){return {id,value,target,met:value>=target,progress:target?Math.min(1,value/target):0}}
function finish(scope,requirements,extra){
 const ready=requirements.every(r=>r.met),encounters=extra.encounters||0,accuracy=extra.accuracy;
 return {version:VERSION,scope:structuredClone(scope),ready,status:ready?'ready':!encounters?'not-tried':encounters>=10&&accuracy<.8?'needs-work':'working-on',progress:Math.min(...requirements.map(r=>r.progress)),requirements,nextUnmet:requirements.filter(r=>!r.met).map(r=>r.id),...extra};
}
function matches(source,target){
 if(!content.validScope(source)||source.activity!==target.activity||source.kind!==target.kind)return false;
 if(target.kind==='level')return source.level===target.level;
 if(target.kind==='school')return source.table===target.table;
 return source.families.includes(target.families[0]);
}
function evidence(flights,scope){
 const cap=scope.kind==='level'?60:40,maxFlights=scope.kind==='level'?12:8;
 const candidates=flights.filter(f=>matches(f.scope,scope)).map(f=>({...f,entries:f.entries.filter(e=>{
  if(!e.encountered)return false;
  if(scope.kind==='level'||!e.fact.valid)return true;
  return content.familyMembers(e.fact,scope).length>0;
 })})).filter(f=>f.entries.length).sort(reports.newest).slice(0,maxFlights);
 let remaining=cap,uncertainBoundary=false;
 const retained=[];
 for(const f of candidates){
  if(!remaining)break;
  const entries=f.entries.slice().sort((a,b)=>(b.at??-Infinity)-(a.at??-Infinity)||b.index-a.index);
  if(entries.length>remaining&&entries.some(e=>e.at===null))uncertainBoundary=true;
  retained.push({...f,entries:entries.slice(0,remaining)});remaining-=Math.min(remaining,entries.length);
 }
 return {retained,uncertainBoundary,window:{maxFlights,maxEncounters:cap},contributingFlights:retained.length,completionEvidenceIds:candidates.filter(f=>f.completed&&f.recordValid&&f.dateMs!==null&&f.entries.every(e=>e.fact.valid&&e.valid)).map(f=>f.id)};
}
function school(flights,scope){
 const attempted=flights.filter(f=>matches(f.scope,scope)&&f.mode==='test'&&f.entries.some(e=>e.encountered)).sort(reports.newest).slice(0,3);
 const qualifies=f=>f.completed&&f.entries.length===60&&f.elapsed!==null&&f.elapsed<=120000&&f.dateMs!==null&&f.entries.every(e=>e.fact.valid&&e.valid)&&reports.metrics(f.entries).first>=57;
 let consecutive=0;for(const f of attempted){if(!qualifies(f))break;consecutive++}
 const m=reports.metrics(attempted.flatMap(f=>f.entries));
 return finish(scope,[requirement('qualifying-timed-tests',consecutive,3)],{encounters:m.encounters,accuracy:m.accuracy,contributingFlights:attempted.length,qualifyingTests:consecutive,evidenceIds:attempted.map(f=>f.id),latestDate:attempted[0]?.date??null});
}
function evaluate(flights,scope){
 if(!content.validScope(scope)||(scope.kind==='families'&&scope.families.length!==1))throw Error('Readiness requires one valid selectable scope');
 if(scope.kind==='school')return school(flights,scope);
 const ev=evidence(flights,scope),entries=ev.retained.flatMap(f=>f.entries),m=reports.metrics(entries);
 // Owner-approved correction: long flights must remain a viable route. Accuracy
 // and coverage use capped encounters; completion credits use the outer window.
 const completed=ev.completionEvidenceIds.length;
 const invalid=entries.some(e=>!e.fact.valid||!e.valid)||ev.retained.some(f=>!f.recordValid||f.dateMs===null)||ev.uncertainBoundary;
 const requirements=[requirement('encounters',m.encounters,scope.kind==='level'?30:20),requirement('completed-flights',completed,scope.kind==='level'?3:2),requirement('first-try-accuracy',m.accuracy??0,.95),requirement('valid-evidence',invalid?0:1,1)];
 let coverage;
 if(scope.kind==='level'){
  const tier=content.tier(scope),keys=new Set(tier.families),selected=entries.filter(e=>e.fact.valid&&keys.has(e.fact.familyKey));
  coverage={available:tier.available,distinct:new Set(selected.map(e=>e.fact.familyKey)).size,requiredDistinct:tier.requiredDistinct,selectedTierEncounters:selected.length,introductoryException:tier.introductoryException};
  requirements.push(requirement('selected-tier-encounters',selected.length,10),requirement('distinct-tier-families',coverage.distinct,tier.requiredDistinct||1),requirement('available-tier',tier.valid?1:0,1));
 }else{
  const members=new Set(entries.filter(e=>e.fact.valid).flatMap(e=>content.familyMembers(e.fact,scope).map(x=>x.member)));
  coverage={members:[...members].sort((a,b)=>a-b),missingMembers:Array.from({length:scope.range},(_,i)=>i+1).filter(n=>!members.has(n)),requiredDistinct:scope.range};
  requirements.push(requirement('family-members',members.size,scope.range));
 }
 return finish(scope,requirements,{encounters:m.encounters,first:m.first,accuracy:m.accuracy,completedFlights:completed,completionEvidenceIds:ev.completionEvidenceIds,contributingFlights:ev.contributingFlights,window:ev.window,uncertainBoundary:ev.uncertainBoundary,coverage,evidenceIds:ev.retained.map(f=>f.id),latestDate:ev.retained[0]?.date??null,oldestDate:ev.retained.at(-1)?.date??null});
}
// Separate bars: levels and each chosen range; no blended accuracy/speed score.
function activity(flights,id,{ranges=[10],familiesThrough=10}={}){
 if(!content.activityOrder.includes(id)||!Array.isArray(ranges)||!ranges.length||new Set(ranges).size!==ranges.length||ranges.some(n=>![10,12].includes(n))||![10,12].includes(familiesThrough))throw Error('Invalid activity summary options');
 const summarize=items=>({items,ready:items.every(x=>x.ready),readyCount:items.filter(x=>x.ready).length,total:items.length,progress:items.reduce((n,x)=>n+x.progress,0)/items.length});
 const levels=summarize(Array.from({length:5},(_,level)=>evaluate(flights,{kind:'level',activity:id,level})));
 const families=['multiplication','division'].includes(id)?ranges.map(range=>({range,...summarize(Array.from({length:familiesThrough},(_,i)=>evaluate(flights,{kind:'families',activity:id,families:[i+1],range})))})):[];
 const timed=id==='multiplication'?summarize(Array.from({length:9},(_,i)=>evaluate(flights,{kind:'school',activity:id,table:i+2}))):null;
 return {activity:id,levels,families,timed,ready:levels.ready&&families.every(x=>x.ready),version:VERSION};
}
// Replay existing evidence to distinguish first readiness from regained readiness.
// No achievement ledger or backup schema is introduced.
function firstAchievements(sessions,current){
 if(!current||current.guest||!current.learnerId||current.reason!=='complete')return [];
 const flights=reports.normalize(sessions.filter(s=>s.id!==current.id).concat(current),{learnerId:current.learnerId});
 const fresh=flights.find(f=>f.id===String(current.id));
 if(!fresh?.completed||!content.validScope(fresh.scope))return [];
 const scopes=fresh.scope.kind==='families'?fresh.scope.families.map(n=>({...fresh.scope,families:[n]})):[fresh.scope];
 return scopes.filter(scope=>{
  const relevant=flights.filter(f=>matches(f.scope,scope));
  if(!evaluate(relevant,scope).ready)return false;
  const prior=relevant.filter(f=>f.id!==fresh.id).sort(reports.newest).reverse(),prefix=[];
  for(const flight of prior){prefix.push(flight);if(evaluate(prefix,scope).ready)return false;}
  return true;
 }).map(scope=>structuredClone(scope));
}
const api={VERSION,evaluate,activity,firstAchievements};
if(common)module.exports=api;else root.FactFlightReadiness=api;
})(globalThis);
