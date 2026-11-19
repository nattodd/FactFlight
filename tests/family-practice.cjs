'use strict';
const assert=require('node:assert/strict'),families=require('../scripts/family-practice.js'),math=require('../scripts/math-activities.js'),content=require('../scripts/content-definitions.js');
const rng=s=>()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296};
let scopes=0;
for(const activity of ['multiplication','division'])for(const range of [10,12])for(let mask=1;mask<4096;mask++){
 const choices=Array.from({length:12},(_,i)=>i+1).filter(n=>mask&(1<<(n-1))),scope={kind:'families',activity,families:choices,range};
 const before=JSON.stringify(scope),pool=families.pool(scope);assert.equal(new Set(pool.map(g=>g.key)).size,pool.length);
 for(const group of pool)for(const q of group.variants){
  const [a,b]=q.text.match(/\d+/g).map(Number);assert.equal(q.answer,activity==='division'?a/b:a*b);
  assert(content.classify({...q,key:group.key},scope).valid);
 }
 if(activity==='division')assert.equal(pool.length,choices.length*range);
 if(activity==='multiplication'&&range===10&&choices.every(n=>n<=10))assert.deepEqual(pool,math.questionPool({activity,selection:{type:'tables',tables:choices}}));
 const next=families.next(scope);assert.equal(next===null,choices.includes(12));if(next){assert.equal(next.range,range);assert.deepEqual(next.families,choices.map(n=>n+1));}
 assert.equal(JSON.stringify(scope),before);scopes++;
}
let streams=0;
for(const activity of ['multiplication','division'])for(const range of [10,12])for(const choices of [[1],[11],[12],[2,7,11],[1,2,3,4,5,6,7,8,9,10,11,12]])for(let seed=1;seed<=16;seed++){
 const scope={kind:'families',activity,families:choices,range},pool=families.pool(scope),source=families.createSource(scope,rng(seed)),qs=Array.from({length:pool.length*2},()=>source.next());
 assert.equal(new Set(qs.slice(0,pool.length).map(q=>q.key)).size,pool.length);
 for(let i=0;i<qs.length;i++){assert(content.classify(qs[i],scope).valid);assert(!qs.slice(Math.max(0,i-3),i).some(q=>q.key===qs[i].key));}
 for(const q of qs){assert.deepEqual(q.attempts,[]);assert.equal(q.skips,0);assert.equal(q.status,'pending');}
 streams++;
}
for(const scope of [{kind:'families',activity:'division',families:[],range:12},{kind:'families',activity:'division',families:[0],range:12},{kind:'families',activity:'division',families:[13],range:12},{kind:'families',activity:'division',families:[2,2],range:12},{kind:'families',activity:'division',families:[4],range:11}])assert.throws(()=>families.pool(scope));
const four={kind:'families',activity:'division',families:[4],range:12};assert.equal(families.pool(four).at(-1).variants[0].text,'48 ÷ 4');assert.equal(families.pool(four).at(-1).variants[0].answer,12);
console.log(`PASS ${scopes} family/range subsets and ${streams} seeded streams; exact arithmetic, membership, unchanged legacy table pools, coverage, spacing, Next scope and invalid selection rejection.`);
