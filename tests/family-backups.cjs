'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),{execFileSync}=require('node:child_process'),{randomUUID}=require('node:crypto');
function load(released=false){const c=vm.createContext({structuredClone});for(const file of released?['math-activities','profile-store']:['math-activities','content-definitions','family-practice','profile-store'])vm.runInContext(released?execFileSync('git',['show',`v6.2.0:scripts/${file}.js`],{encoding:'utf8'}):fs.readFileSync(require.resolve('../scripts/'+file+'.js'),'utf8'),c);return c;}
const current=load(),old=load(true),profile={id:randomUUID(),name:'Synthetic'},date='2026-11-18T12:00:00.000Z';
const flight=(activity,selection,version)=>({id:randomUUID(),learnerId:profile.id,learnerName:profile.name,date,activity,selection,schemaVersion:version,mode:'practice',input:'keyboard',reason:'manual',elapsed:1000,target:null,practiceType:'quick',timeLimitMs:null,unrecognized:[],invalidated:[],items:[current.FactFlightMath.createQuestionSource({activity,selection},()=>.5).next()]});
const backup=sessions=>({format:'fact-flight-learner-export',version:1,exportedAt:date,profile,sessions});
const legacy=backup([flight('multiplication',{type:'tables',tables:[2,7]},2)]),text=JSON.stringify(legacy);
assert.equal(JSON.stringify(current.FlightProfileStore.parseExport(text)),JSON.stringify(old.FlightProfileStore.parseExport(text)));assert.equal(JSON.stringify(legacy),text);
let checks=0;
for(const activity of ['multiplication','division'])for(const range of [10,12])for(const values of [[1],[11],[12],[2,11,12]]){
 const s=flight(activity,{type:'families',families:values,range},4),b=backup([legacy.sessions[0],s]),raw=JSON.stringify(b);
 assert.equal(JSON.stringify(current.FlightProfileStore.parseExport(raw)),raw);assert.throws(()=>old.FlightProfileStore.parseExport(raw));
 assert.equal(current.FactFlightContent.scopeFromSession(s).range,range);
 for(const mutate of [x=>x.schemaVersion=2,x=>x.selection.range=11,x=>x.selection.families=[0],x=>x.selection.families=[13],x=>x.selection.families=[1,1],x=>x.items[0].answer++,x=>x.items[0].key='bad',x=>x.level=0]){const bad=structuredClone(b);mutate(bad.sessions[1]);assert.throws(()=>current.FlightProfileStore.parseExport(JSON.stringify(bad)));}
 const fact=current.FactFlightMath.reviewFact(s,s.items[0]),review={version:2,source:'results',filter:'all',facts:[fact]};assert(current.FactFlightMath.validReview(review));assert(!old.FactFlightMath.validReview(review));
 const r={...s,id:randomUUID(),activity:'review',schemaVersion:3,practiceType:'review',review,items:[current.FactFlightMath.createReviewSource(review).next()]};delete r.selection;
 const rb=JSON.stringify(backup([legacy.sessions[0],s,r]));assert.equal(JSON.stringify(current.FlightProfileStore.parseExport(rb)),rb);assert.throws(()=>old.FlightProfileStore.parseExport(rb));
 checks++;
}
console.log(`PASS ${checks} new scope backup/review cases: unchanged legacy import, exact round trips, invalid record rejection and expected v6.2 rejection.`);
const reports=require('../scripts/practice-reports.js'),readiness=require('../scripts/practice-readiness.js');
for(const activity of ['multiplication','division']){
 const selection={type:'families',families:[4],range:12};
 const source=current.FactFlightMath.createQuestionSource({activity,selection},()=>.4);
 const sessions=Array.from({length:2},()=>({...flight(activity,selection,4),reason:'complete',items:Array.from({length:12},(_,i)=>{const q=source.next();return {...q,status:'correct',attempts:[{correct:true,value:q.answer,at:i*100,source:'keyboard',transcript:''}]};})}));
 const report=reports.report(sessions,{learnerId:profile.id});assert(readiness.evaluate(report.flights,{kind:'families',activity,families:[4],range:12}).ready);
 const before=JSON.stringify(sessions);reports.report(sessions,{learnerId:profile.id});assert.equal(JSON.stringify(sessions),before);
}
console.log('PASS schema-4 reporting/readiness adapters for multiplication and division through 12, without history mutation.');
