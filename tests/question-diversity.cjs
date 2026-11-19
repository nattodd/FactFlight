// Pure prototype generator tests. Run: node tests/question-diversity.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../design-reference/ui-v6/v6-experience-preview.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const context=vm.createContext({});
vm.runInContext(script.slice(script.indexOf('function questionPool('),script.indexOf('function start(')),context);
const {questionPool,createQuestionSource}=process.env.FF_TEST_APP_MATH?require('../scripts/math-activities.js'):context;
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
let sequences=0;
function check(settings,pool,seed,full=false){
 const source=createQuestionSource(settings,rng(seed),pool),size=pool.length;
 const list=Array.from({length:full?size*2+7:Math.min(size*4+7,407)},()=>source.next());
 const byKey=new Map(pool.map(g=>[g.key,g])),frequencies=new Map();
 for(let i=0;i<list.length;i++){
  const changed=process.env.FF_TEST_APP_MATH&&require('../scripts/content-definitions.js').practiceAllocation(settings.activity,settings.level)&&settings.mode!=='school';
  const q=list[i],gap=changed?0:Math.min(3,size-1);
  assert(!list.slice(Math.max(0,i-gap),i).some(p=>p.key===q.key),'repeat too close');
  assert(byKey.get(q.key)?.variants.some(v=>v.text===q.text&&v.answer===q.answer),'outside selected pool');
  frequencies.set(q.key,(frequencies.get(q.key)||0)+1);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=2500);
 }
 if(process.env.FF_TEST_APP_MATH&&require('../scripts/content-definitions.js').practiceAllocation(settings.activity,settings.level)&&settings.mode!=='school'){sequences++;return;}
 for(let i=0;i+size<=list.length;i+=size)assert.equal(new Set(list.slice(i,i+size).map(p=>p.key)).size,size,'repeat before pool exhausted');
 const counts=pool.map(g=>frequencies.get(g.key)||0);
 assert(Math.max(...counts)-Math.min(...counts)<=1,'uneven frequency');
 sequences++;
}
const expected={addition:[12,36,121,4095,81000],subtraction:[21,66,231,4040,81000],multiplication:[27,54,77,88,869],division:[30,90,132,88,869],bonds:[6,11,21,81,801],doubles:[6,11,21,79,900],halves:[6,11,21,79,900],squares:[5,10,12,8,30]};
for(const [activity,sizes] of Object.entries(expected))for(let level=0;level<5;level++){
 const settings={activity,level,mode:'quick'},pool=questionPool(settings);
 assert.equal(pool.length,sizes[level],`${activity} level ${level} pool completeness`);
 for(let seed=1;seed<=40;seed++)check(settings,pool,seed);
 if(level>=3){
  check(settings,pool,101,true);
  // Independently verify every harder equation and its advertised operand limits.
  for(const group of pool)for(const q of group.variants){
   const nums=q.text.match(/\d+/g).map(Number),[a,b]=nums;
   if(activity==='addition'){assert.equal(q.answer,a+b);const hi=Math.max(a,b),lo=Math.min(a,b);assert(lo>=10&&lo<=99&&hi>=(level===3?10:100)&&hi<=(level===3?99:999));}
   if(activity==='subtraction'){assert.equal(q.answer,a-b);assert(a>=(level===3?20:100)&&a<=(level===3?99:999)&&b>=10&&b<=99&&a>=b);}
   if(activity==='multiplication'){assert.equal(q.answer,a*b);assert(Math.min(a,b)>=2&&Math.min(a,b)<=12&&Math.max(a,b)>=(level===3?13:21)&&Math.max(a,b)<=(level===3?20:99));}
   if(activity==='division'){assert.equal(q.answer,a/b);assert(b>=2&&b<=12&&q.answer>=(level===3?13:21)&&q.answer<=(level===3?20:99));}
   if(activity==='bonds'){assert.equal(a+q.answer,b);assert.equal(b,level===3?100:1000);assert(a>=(level===3?10:100)&&q.answer>=(level===3?10:100));}
   if(activity==='doubles'){assert.equal(q.answer,a*2);assert(a>=(level===3?21:100)&&a<=(level===3?99:999));}
   if(activity==='halves'){assert.equal(q.answer,a/2);assert(a%2===0&&a>=(level===3?42:200)&&a<=(level===3?198:1998));}
   if(activity==='squares'){assert.equal(q.answer,a*a);assert(a>=(level===3?13:21)&&a<=(level===3?20:50));}
  }
 }
 // New sessions should not repeat a fixed deterministic ordering.
 const a=createQuestionSource(settings,rng(1)),b=createQuestionSource(settings,rng(99));
 assert.notDeepEqual(Array.from({length:10},()=>a.next().text),Array.from({length:10},()=>b.next().text));
}
for(let table=2;table<=10;table++){
 const settings={activity:'multiplication',mode:'school',table},pool=questionPool(settings);
 for(let seed=1;seed<=40;seed++)check(settings,pool,seed);
 const source=createQuestionSource(settings,rng(table)),list=Array.from({length:60},()=>source.next());
 for(let factor=1;factor<=10;factor++)assert.equal(list.filter(p=>p.key===`school:${factor}`).length,6);
 for(let round=0;round<6;round++)for(const q of list.slice(round*10,round*10+10)){
  const f=Number(q.key.split(':')[1]);assert.equal(q.text,round%2?`${f} × ${table}`:`${table} × ${f}`);
 }
}
// Tiny pools must terminate, maximize possible gaps, and keep balanced coverage.
for(let size=1;size<=4;size++)for(let seed=1;seed<=40;seed++)check({mode:'quick'},Array.from({length:size},(_,i)=>({key:String(i),variants:[{text:String(i),answer:i}]})),seed);
assert.throws(()=>createQuestionSource({mode:'quick'},rng(1),[]));
// A persistent source keeps spacing across 10-question stream batches.
const settings={activity:'squares',level:0,mode:'free'},source=createQuestionSource(settings,rng(11));
const stream=Array.from({length:5},()=>Array.from({length:10},()=>source.next())).flat();
for(let i=3;i<stream.length;i++)assert(!stream.slice(i-3,i).some(p=>p.key===stream[i].key));
console.log(`PASS: ${sequences} seeded sequences; all 40 activity/level pools, nine School tables, tiny pools 1–4, validity throughout; balanced counts/three-family spacing for unchanged scopes; new allocation/spacing tested in practice-generator.cjs.`);
