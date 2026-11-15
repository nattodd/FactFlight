const assert=require('node:assert/strict'),math=require('../scripts/math-activities.js');
let count=0;
for(let mask=1;mask<1024;mask++){
 const tables=Array.from({length:10},(_,i)=>i+1).filter(n=>mask&(1<<(n-1))),settings={activity:'multiplication',level:4,selection:{type:'tables',tables}};
 const pool=math.questionPool(settings),expected=new Set();for(const a of tables)for(let b=1;b<=10;b++)expected.add(`×:${Math.min(a,b)}:${Math.max(a,b)}`);
 assert.deepEqual(new Set(pool.map(g=>g.key)),expected);
 for(const g of pool)for(const v of g.variants){const [a,b]=v.text.split(' × ').map(Number);assert(tables.includes(a));assert(b>=1&&b<=10);assert.equal(v.answer,a*b)}
 const source=math.createQuestionSource(settings,()=>0.37),list=Array.from({length:pool.length*2+3},()=>source.next());
 for(let i=0;i<list.length;i++){assert(!list.slice(Math.max(0,i-3),i).some(p=>p.key===list[i].key));assert.equal(list[i].attempts.length,0)}
 for(let i=0;i<pool.length*2;i+=pool.length)assert.equal(new Set(list.slice(i,i+pool.length).map(p=>p.key)).size,pool.length);
 count++;
}
for(const tables of [[],[0],[11],[2,2],['2'],null])assert.throws(()=>math.questionPool({activity:'multiplication',selection:{type:'tables',tables}}));
assert.throws(()=>math.questionPool({activity:'division',selection:{type:'tables',tables:[2]}}));
assert.deepEqual(math.questionPool({activity:'multiplication',level:0}),math.questionPool({activity:'multiplication',level:0,selection:null}));
console.log(`PASS: ${count} table subsets; valid ranges, exact answers, deduplicated families, balanced rounds, repeat spacing and invalid-selection rejection.`);
