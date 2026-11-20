// Invented data only. Run: node tests/practice-foundation.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const math=require('../scripts/math-activities.js');
const c=require('../scripts/content-definitions.js'),r=require('../scripts/practice-reports.js'),ready=require('../scripts/practice-readiness.js');
let checks=0;
function test(name,fn){fn();checks++;console.log('PASS '+name)}
const level=(activity,n)=>({kind:'level',activity,level:n});
const family=(activity,n,range=10)=>({kind:'families',activity,families:[n],range});
const school=table=>({kind:'school',activity:'multiplication',table});
function question(activity,n,key){const g=math.questionPool({activity,level:n}).find(g=>g.key===key);assert(g,key);return {key:g.key,...g.variants[0],status:'correct',skips:0,ms:1000,attempts:[{correct:true,at:1000,value:g.variants[0].answer}]}}
function square(n){return {key:`square:${n}`,text:`${n}²`,answer:n*n,status:'correct',skips:0,ms:1000,attempts:[{correct:true,at:1000,value:n*n}]}}
function multiply(a,b){return {key:`×:${Math.min(a,b)}:${Math.max(a,b)}`,text:`${a} × ${b}`,answer:a*b,status:'correct',skips:0,ms:1000,attempts:[{correct:true,at:1000,value:a*b}]}}
function wrong(p){return {...p,attempts:[{correct:false,at:Math.max(0,p.attempts[0].at-500),value:9999},...p.attempts]}}
function stoppedWrong(p){return {...p,status:'wrong',attempts:[{correct:false,at:500,value:9999}]}}
function untouched(p){return {...p,status:'pending',attempts:[],ms:0}}
function flight(id,items,extra={}){return {id:'synthetic-'+id,learnerId:'synthetic-a',activity:'squares',schemaVersion:1,level:2,date:new Date(Date.UTC(2026,0,1)+id*60000).toISOString(),mode:'practice',practiceType:'quick',timeLimitMs:null,input:'keyboard',target:null,reason:'complete',elapsed:items.length*1000,items:items.map((p,i)=>({...p,attempts:p.attempts.map(a=>({...a,at:a.at+i*2000}))})),...extra}}
function squares(count=6,length=5){return Array.from({length:count},(_,i)=>flight(i,Array.from({length},(_,j)=>square(j%2?12:11))))}
function normalized(ss){return r.normalize(ss,{learnerId:'synthetic-a'})}
function tableFlights(count=4,length=5){return Array.from({length:count},(_,i)=>flight(i,Array.from({length},(_,j)=>multiply(7,(i*length+j)%10+1)),{activity:'multiplication',schemaVersion:2,level:undefined,selection:{type:'tables',tables:[7]}}))}
function deepFreeze(x){if(x&&typeof x==='object'){Object.freeze(x);Object.values(x).forEach(deepFreeze)}return x}

test('all forty existing pools classify without changing their boundaries',()=>{
 for(const activity of c.activityOrder)for(let n=0;n<5;n++){
  const pool=math.questionPool({activity,level:n}),summary=c.contentSummary(level(activity,n));
  assert.equal(summary.families,pool.length);assert.equal(summary.identities+summary.selectedTier+summary.earlierReview,pool.length);
  for(const g of pool)for(const p of g.variants){const f=c.classify({...p,key:g.key},level(activity,n));assert(f.valid,activity+' '+g.key);assert(f.earliestLevel<=n)}
 }
});
test('canonical reversed families, ordered operations and bond semantics',()=>{
 const a=c.classify(question('addition',2,'+:3:8'),level('addition',2));
 assert.equal(a.familyKey,c.classify({...question('addition',2,'+:3:8'),text:'8 + 3'},level('addition',2)).familyKey);
 assert.equal(a.earliestLevel,2);
 assert(!c.classify({...question('subtraction',2,'subtract:8:3'),text:'3 − 8'},level('subtraction',2)).valid);
 const bond=question('bonds',1,'bond:10:3');assert(c.classify({...bond,text:'? + 3 = 10'},level('bonds',1)).valid);
 assert(!c.classify(bond,level('bonds',0)).valid);
 assert.equal(c.classify(question('division',2,'divide:12:12'),level('division',2)).earliestLevel,2);
});
test('identity flags are narrow and explicit for every activity',()=>{
 for(const [activity,n,key,flag] of [['addition',0,'+:0:4','zero-addend'],['subtraction',0,'subtract:4:4','equal-operands'],['multiplication',0,'×:1:5','unit-factor'],['division',0,'divide:5:5','equal-operands'],['bonds',0,'bond:5:0','zero-part'],['doubles',0,'doubles:0','zero-input'],['halves',0,'halves:0','zero-input'],['squares',0,'square:1','zero-or-unit-base']])assert(c.classify(question(activity,n,key),level(activity,n)).identityFlags.includes(flag));
 assert(!c.classify(multiply(2,5),level('multiplication',0)).identity);
 assert.equal(c.contentSummary(level('squares',2)).selectedTier,2);
 assert.equal(c.contentSummary(level('multiplication',3)).identities,0);
 assert.equal(c.contentSummary(level('multiplication',3)).earlierReview,0);
});
test('display/key/answer disagreement and out-of-pool facts are rejected',()=>{
 assert(!c.classify({...square(11),answer:120},level('squares',2)).valid);
 assert(!c.classify({...square(11),text:'12²'},level('squares',2)).valid);
 assert(!c.classify(square(13),level('squares',2)).valid);
 assert(!c.classify({...square(11),key:'square:011'},level('squares',2)).valid);
 assert(!c.validScope(level('squares',5)));assert(!c.validScope(family('addition',1)));
});
test('through-12 records use explicit schema 4; legacy table meaning stays through 10',()=>{
 assert(c.classify(multiply(12,11),family('multiplication',12,12)).valid);
 assert(!c.classify(multiply(12,11),family('multiplication',12,10)).valid);
 const q={key:'divide:48:4',text:'48 ÷ 4',answer:12};assert(c.classify(q,family('division',4,12)).valid);assert(!c.classify(q,family('division',4,10)).valid);
 const f=tableFlights()[0];assert.equal(c.scopeFromSession(f).range,10);
 assert.equal(c.scopeFromSession({...f,selection:{type:'tables',tables:[7],range:12}}),null);
 assert.equal(c.scopeFromSession({...f,selection:{type:'tables',tables:[12]}}),null);
});
test('six short flights accumulate, including one corrected error',()=>{
 const ss=squares();ss[0].items[0]=wrong(ss[0].items[0]);const result=ready.evaluate(normalized(ss),level('squares',2));
 assert(result.ready);assert.equal(result.first,29);assert.equal(result.encounters,30);assert.equal(result.completedFlights,6);assert.equal(result.coverage.distinct,2);
});
test('high accuracy cannot hide missing tier coverage',()=>{
 let ss=squares();ss.forEach(s=>s.items=s.items.map(()=>square(11)));
 let result=ready.evaluate(normalized(ss),level('squares',2));assert(!result.ready);assert(result.nextUnmet.includes('distinct-tier-families'));
 ss.forEach(s=>s.items=s.items.map(()=>square(5)));result=ready.evaluate(normalized(ss),level('squares',2));assert.equal(result.coverage.selectedTierEncounters,0);assert(!result.ready);
 const repeated=Array.from({length:6},(_,i)=>flight(i,Array.from({length:5},()=>question('addition',2,'+:8:9')),{activity:'addition'}));
 assert(!ready.evaluate(normalized(repeated),level('addition',2)).ready);
});
test('table short flights qualify through ten, not through twelve',()=>{
 const ss=tableFlights();ss[0].items[0]=wrong(ss[0].items[0]);const fs=normalized(ss);
 assert(ready.evaluate(fs,family('multiplication',7)).ready);
 const twelve=ready.evaluate(fs,family('multiplication',7,12));assert(!twelve.ready);assert.deepEqual(twelve.coverage.missingMembers,[11,12]);
});
test('future division calculations use explicit in-memory fixtures, not a new record schema',()=>{
 const fs=normalized(tableFlights()).map(f=>({...f,scope:family('division',4,12),activity:'division'}));
 let i=0;for(const f of fs)for(const e of f.entries){const member=(i++%12)+1;e.fact=c.classify({key:`divide:${4*member}:4`,text:`${4*member} ÷ 4`,answer:member},f.scope);e.activity='division'}
 assert(ready.evaluate(fs,family('division',4,12)).ready);
});
test('stopped errors remain in aggregate evidence without completion credit',()=>{
 const ss=squares();ss.push(flight(7,Array.from({length:5},()=>stoppedWrong(square(11))),{reason:'manual'}));
 const x=ready.evaluate(normalized(ss),level('squares',2));assert.equal(x.first,30);assert.equal(x.encounters,35);assert.equal(x.completedFlights,6);assert(!x.ready);assert.equal(x.status,'working-on');
});
test('untouched flights do not consume evidence windows',()=>{
 const ss=squares();for(let i=10;i<30;i++)ss.push(flight(i,[untouched(square(11))],{reason:'manual'}));
 assert(ready.evaluate(normalized(ss),level('squares',2)).ready);assert.equal(r.report(ss,{learnerId:'synthetic-a'}).summary.sessions,26);
});
test('long flights use outer-window completion credits after owner correction',()=>{
 const x=ready.evaluate(normalized(squares(3,60)),level('squares',2));assert(x.ready);assert.equal(x.encounters,60);assert.equal(x.completedFlights,3);assert.equal(x.evidenceIds.length,1);assert.equal(x.completionEvidenceIds.length,3);
 assert(ready.evaluate(normalized(tableFlights(2,60)),family('multiplication',7)).ready);
});
test('flight and encounter caps apply independently, including stopped flights',()=>{
 const ss=squares(13,5);ss[0].items.forEach(p=>p.attempts=wrong(p).attempts);
 const x=ready.evaluate(normalized(ss),level('squares',2));assert.equal(x.encounters,60);assert.equal(x.completedFlights,12);assert.equal(x.accuracy,1);assert(!x.evidenceIds.includes('synthetic-0'));
});
test('boundary ordering uses saved first-attempt times, independent of display/input order',()=>{
 const ss=squares(3,30);ss[0].items.forEach(p=>p.attempts=wrong(p).attempts);
 const fs=normalized(ss),before=ready.evaluate(fs,level('squares',2));assert(before.ready);
 fs.reverse();fs.forEach(f=>f.entries.reverse());assert.deepEqual(ready.evaluate(fs,level('squares',2)),before);
});
test('unknown skip chronology at a cut boundary is disclosed and cannot lock practice',()=>{
 const ss=squares(3,25);ss[0].items[0]={...ss[0].items[0],status:'skipped',skips:1,attempts:[]};
 const x=ready.evaluate(normalized(ss),level('squares',2));assert(x.uncertainBoundary);assert(!x.ready);assert(x.nextUnmet.includes('valid-evidence'));
});
test('invalid scope facts remain visible and cannot inflate readiness',()=>{
 const ss=squares();ss[5].items[0].answer=9999;const x=ready.evaluate(normalized(ss),level('squares',2));assert(!x.ready);assert(x.nextUnmet.includes('valid-evidence'));assert.equal(r.report(ss,{learnerId:'synthetic-a'}).summary.invalidFacts,1);
});
test('mixed selections attribute only explicitly chosen families',()=>{
 const ss=tableFlights();ss.forEach(s=>s.selection.tables=[7,8]);const fs=normalized(ss);
 assert(ready.evaluate(fs,family('multiplication',7)).ready);assert(!ready.evaluate(fs,family('multiplication',8)).ready);
 assert.equal(ready.evaluate(fs,family('multiplication',4)).encounters,0);
 const numbered=ss.map(s=>({...s,selection:undefined,schemaVersion:1,level:1}));assert.equal(ready.evaluate(normalized(numbered),family('multiplication',7)).encounters,0);
});
test('review content contributes reports but never scope readiness',()=>{
 const s=flight(1,[{...square(11),activity:'squares',level:2}],{activity:'review',level:undefined,schemaVersion:3,practiceType:'review'});
 const report=r.report([s],{learnerId:'synthetic-a'});assert.equal(report.summary.first,1);assert.equal(report.activities.find(a=>a.activity==='squares').encounters,1);assert.equal(ready.evaluate(report.flights,level('squares',2)).encounters,0);
});
test('accuracy status boundaries and missing evidence are explicit',()=>{
 assert.equal(ready.evaluate([],level('squares',2)).status,'not-tried');
 const ss=squares(2);ss[0].items[0]=wrong(ss[0].items[0]);ss[0].items[1]=wrong(ss[0].items[1]);
 assert.equal(ready.evaluate(normalized(ss),level('squares',2)).status,'working-on');ss[0].items[2]=wrong(ss[0].items[2]);assert.equal(ready.evaluate(normalized(ss),level('squares',2)).status,'needs-work');
 const tooFew=squares(1);tooFew[0].items=tooFew[0].items.map(stoppedWrong);assert.equal(ready.evaluate(normalized(tooFew),level('squares',2)).status,'working-on');
});
test('School achievement remains distinct and rejects stopped/untimed tests',()=>{
 const ss=Array.from({length:3},(_,i)=>flight(i,Array.from({length:60},(_,j)=>({a:7,b:j%10+1,factor:j%10+1,answer:7*(j%10+1),status:'correct',skips:0,ms:1000,attempts:[{correct:true,at:j*1000}]})),{activity:undefined,level:undefined,schemaVersion:undefined,table:7,practiceType:undefined,timeLimitMs:undefined,mode:'test',elapsed:120000}));
 ss.forEach(s=>{for(let i=0;i<3;i++)s.items[i]=wrong(s.items[i])});
 assert(ready.evaluate(normalized(ss),school(7)).ready);
 ss.push({...ss[2],id:'synthetic-last',date:'2026-02-01',reason:'manual'});assert(!ready.evaluate(normalized(ss),school(7)).ready);
 ss.pop();ss[2].mode='practice';assert(!ready.evaluate(normalized(ss),school(7)).ready);
});
test('report denominators distinguish generated, encountered, submissions and corrections',()=>{
 const ss=[flight(1,[square(11),wrong(square(12)),stoppedWrong(square(11)),untouched(square(12))],{reason:'manual'})];
 const x=r.report(ss,{learnerId:'synthetic-a'}).summary;
 assert.equal(x.generated,4);assert.equal(x.encounters,3);assert.equal(x.first,1);assert.equal(x.correct,2);assert.equal(x.wrong,2);assert.equal(x.unresolvedWrong,1);assert.equal(x.accuracy,1/3);assert.equal(x.score,1/4);assert.equal(x.practiceMs,4000);
});
test('higher factors, overlap and square factors retain global totals',()=>{
 const ss=[flight(1,[multiply(16,7),multiply(7,7)],{activity:'multiplication',level:3})];
 // The second item has its own valid source level in a mixed review fixture.
 ss[0].activity='review';ss[0].level=undefined;ss[0].items.forEach((p,i)=>Object.assign(p,{activity:'multiplication',level:i?1:3}));
 const x=r.report(ss,{learnerId:'synthetic-a'}).tables;assert.equal(x.total.encounters,2);assert.equal(x.selectable.find(t=>t.table===7).encounters,2);assert.equal(x.higherFactors.find(t=>t.table===16).encounters,1);
 assert.equal(r.report(ss,{learnerId:'synthetic-a',selectableThrough:12}).tables.selectable.length,12);
});
test('table metrics agree with production for valid reversed, zero-time and legacy records',()=>{
 const ss=tableFlights();ss[0].items[0].ms=0;ss[0].items[1].ms=undefined;ss[0].items[2]=wrong(ss[0].items[2]);
 const old=math.tableProgress(ss,'all'),now=r.tableContent(normalized(ss));
 assert.equal(now.total.encounters,old.total.encounters);assert.equal(now.total.first,old.total.first);assert.equal(now.total.wrong,old.total.wrong);assert.equal(now.total.averageActiveMs,old.total.averageMs);
});
test('learner selection is mandatory; IDs, Guest and legacy never mix',()=>{
 const ss=squares();ss.push({...ss[0],learnerId:'synthetic-b'});ss.push({...ss[0],learnerId:undefined,id:'legacy'});ss.push({...ss[0],id:'guest',guest:true});
 assert.equal(normalized(ss).length,6);assert.equal(r.normalize(ss,{learnerId:null}).length,1);assert.equal(r.normalize(ss,{learnerId:'synthetic-b'}).length,1);assert.throws(()=>r.normalize(ss));assert.throws(()=>normalized([ss[0],ss[0]]));
});
test('personal best groups separate setups, clean and corrected completions',()=>{
 const ss=squares(3);ss[1].elapsed=4000;ss[1].items[0]=wrong(ss[1].items[0]);ss[2].input='voice';
 const report=r.report(ss,{learnerId:'synthetic-a'});assert.equal(report.setups.length,2);
 const keyboard=report.setups.find(s=>s.correctedSamples);assert.equal(keyboard.fastestCleanMs,5000);assert.equal(keyboard.fastestCorrectedMs,4000);assert.equal(keyboard.cleanSamples,1);
 ss[2].practiceType=undefined;assert.equal(r.report(ss,{learnerId:'synthetic-a'}).uncomparableSessions,1);
});
test('activity summaries keep range and timed achievements separate',()=>{
 const x=ready.activity(normalized(squares()),'multiplication',{ranges:[10,12],familiesThrough:12});
 assert.equal(x.levels.total,5);assert.equal(x.families.length,2);assert.equal(x.families[0].total,12);assert.equal(x.timed.total,9);assert(!x.ready);assert(!Object.hasOwn(x,'progress'));
});
test('readers and derived calculations do not mutate frozen history',()=>{
 const ss=deepFreeze(squares()),before=JSON.stringify(ss);const report=r.report(ss,{learnerId:'synthetic-a'});deepFreeze(report.flights);ready.evaluate(report.flights,level('squares',2));assert.equal(JSON.stringify(ss),before);
 const tier=c.tier(level('squares',2));tier.families.length=0;assert.equal(c.tier(level('squares',2)).available,2);
});
test('boundary truncation retains newest encounters, not the most successful ones',()=>{
 const ss=squares(3,25);ss[0].items.slice(15).forEach(p=>Object.assign(p,wrong(p)));
 const x=ready.evaluate(normalized(ss),level('squares',2));assert.equal(x.encounters,60);assert.equal(x.first,50);assert(!x.ready);assert.equal(x.completedFlights,3);
});
test('only the outer family window grants completion credits',()=>{
 const ss=tableFlights(10);ss.slice(2).forEach(s=>s.reason='manual');
 const x=ready.evaluate(normalized(ss),family('multiplication',7));assert.equal(x.completedFlights,0);assert.equal(x.encounters,40);assert(!x.ready);
});
test('unknown dates and invalid outcomes cannot grant readiness',()=>{
 const ss=squares();ss[5].date='unknown';let x=ready.evaluate(normalized(ss),level('squares',2));assert(!x.ready);assert(x.nextUnmet.includes('valid-evidence'));
 ss[5].date='2026-01-02';ss[5].items[0].attempts[0].correct='yes';x=ready.evaluate(normalized(ss),level('squares',2));assert(!x.ready);
 const damaged=r.report([flight(1,[],{items:[null]})],{learnerId:'synthetic-a'});assert.equal(damaged.summary.invalidFacts,1);assert.equal(damaged.summary.invalidOutcomes,1);
});
test('actual legacy School adapter preserves scores and time without requiring activity metadata',()=>{
 const s=flight(1,[{a:4,b:7,factor:4,answer:28,status:'correct',skips:0,ms:0,attempts:[{correct:true,at:100}]}],{activity:undefined,level:undefined,schemaVersion:undefined,table:7,practiceType:undefined,timeLimitMs:undefined,mode:'test'});
 const old=math.tableProgress([s],'all'),report=r.report([s],{learnerId:'synthetic-a'});
 assert.equal(report.tables.total.encounters,old.total.encounters);assert.equal(report.tables.total.averageActiveMs,old.total.averageMs);assert.equal(report.summary.first,1);
 assert.equal(c.scopeFromSession({...s,schemaVersion:99}),null);
});
test('reporting recent windows, mixed review time and missing time are explicit',()=>{
 const ss=tableFlights(6);const fs=normalized(ss);assert.equal(r.tableContent(fs,{window:'recent'}).flights,5);
 const s=flight(10,[{...square(11),activity:'squares',level:2},{...multiply(7,8),activity:'multiplication',level:1}],{activity:'review',level:undefined,elapsed:9000});
 ss.push(s);const report=r.report(ss,{learnerId:'synthetic-a'});
 assert.equal(report.activities.find(a=>a.activity==='squares').practiceMs,1000);assert.equal(report.summary.practiceMs,39000);
 ss[0].elapsed=undefined;assert.equal(r.report(ss,{learnerId:'synthetic-a'}).summary.missingPracticeTimes,1);
});
test('reports include bounded incorrect numeric values without speech transcripts',()=>{
 const ss=squares();ss.forEach(s=>s.items=s.items.map(p=>({...wrong(p),attempts:[{correct:false,at:100,value:123,transcript:'synthetic private speech'},{correct:true,at:200,value:p.answer}]})));
 const report=r.report(ss,{learnerId:'synthetic-a'});assert(report.facts.every(f=>f.recentIncorrectValues.length<=12));assert.equal(report.facts[0].recentIncorrectValues[0],123);assert(!JSON.stringify(report).includes('synthetic private speech'));
});
test('scope ranges, counts, target and input prevent mismatched best comparisons',()=>{
 const ss=tableFlights(3);ss[1].target=4;ss[2].items.pop();assert.equal(r.report(ss,{learnerId:'synthetic-a'}).setups.length,3);
 const fs=normalized(tableFlights(2));fs[1].scope.range=12;assert.equal(r.setupReports(fs).length,2);
});
test('browser-global calculations remain pure and load before the Progress UI',()=>{
 const context=vm.createContext({structuredClone});
 for(const file of ['math-activities','content-definitions','practice-reports','practice-readiness'])vm.runInContext(fs.readFileSync(require.resolve('../scripts/'+file+'.js'),'utf8'),context);
 assert(context.FactFlightReadiness.evaluate([],level('squares',2)).status==='not-tried');
 const html=fs.readFileSync(require.resolve('../index.html'),'utf8');for(const name of ['practice-reports','practice-readiness'])assert(html.indexOf('scripts/'+name+'.js')<html.indexOf('scripts/progress-dashboard.js'));
});
console.log(`PASS ${checks} foundation groups; exhaustive existing-pool variants included`);
