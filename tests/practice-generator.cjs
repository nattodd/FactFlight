'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),{execFileSync}=require('node:child_process');
const math=require('../scripts/math-activities.js'),content=require('../scripts/content-definitions.js');
const rng=s=>()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};
const legacy={};vm.runInNewContext(execFileSync('git',['show','v6.2.0:scripts/math-activities.js'],{encoding:'utf8'}),legacy);
const fs=require('node:fs');
const releasedHTML=execFileSync('git',['show','v6.2.0:index.html'],{encoding:'utf8'}).replace(/\r\n/g,'\n'),localHTML=fs.readFileSync(require.resolve('../index.html'),'utf8').replace(/\r\n/g,'\n');
const school=html=>html.slice(html.indexOf('function freshSchoolQuestions('),html.indexOf('function begin('));
assert.equal(school(localHTML),school(releasedHTML),'Original live School generator must remain byte-identical');
let checked=0;
for(const activity of content.activityOrder)for(let level=0;level<5;level++)for(let seed=1;seed<=32;seed++){
 const carryover=new Map(),random=rng(seed),settings={activity,level,carryover};let qs=[];
 for(let flight=0;flight<8;flight++){const source=math.createQuestionSource(settings,random);qs.push(...Array.from({length:5},()=>source.next()));}
 for(const q of qs)assert(content.classify(q,{kind:'level',activity,level}).valid);
 const target=content.practiceAllocation(activity,level);
 if(target){for(let offset=0;offset<40;offset+=20){const counts=[0,0,0,0,0];for(const q of qs.slice(offset,offset+20)){const f=content.classify(q,{kind:'level',activity,level});counts[f.identity?4:f.earliestLevel===level?0:f.earliestLevel+1]++;}assert.deepEqual(counts,target);}
  assert(!qs.some((q,i)=>i&&q.key===qs[i-1].key),'Immediate family repeat');
  const whole=math.createQuestionSource({activity,level},rng(seed));assert.deepEqual(qs,Array.from({length:40},()=>whole.next()),'Short flights must preserve stream');
 }else{const a=math.createQuestionSource({activity,level},rng(seed)),b=legacy.FactFlightMath.createQuestionSource({activity,level},rng(seed));assert.deepEqual(JSON.stringify(Array.from({length:60},()=>a.next())),JSON.stringify(Array.from({length:60},()=>b.next())));}
 checked++;
}
for(let table=2;table<=10;table++)for(let seed=1;seed<=32;seed++){
 const s={activity:'multiplication',mode:'school',table},a=math.createQuestionSource(s,rng(seed)),b=legacy.FactFlightMath.createQuestionSource(s,rng(seed));assert.equal(JSON.stringify(Array.from({length:60},()=>a.next())),JSON.stringify(Array.from({length:60},()=>b.next())));
}
const s={activity:'squares',level:2},pool=math.questionPool(s),noIdentity=pool.filter(g=>g.key!=='square:1');
const source=math.createQuestionSource(s,rng(4),noIdentity),qs=Array.from({length:20},()=>source.next());assert.equal(qs.filter(q=>['square:11','square:12'].includes(q.key)).length,13);assert(!qs.some(q=>q.key==='square:1'));
assert.equal(new Set(qs.map(q=>q.key)).size<=10,true);
for(const value of [0,.999999]){const source=math.createQuestionSource(s,()=>value);for(let i=0;i<200;i++)assert(content.classify(source.next(),{kind:'level',...s}).valid);}
console.log(`PASS ${checked} scoped seeded checks; exact cycles, 5-question carryover, validity, unchanged L1/L4/L5 and 288 School sequences, missing-identity reallocation.`);
