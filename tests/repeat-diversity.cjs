const assert=require('node:assert/strict');
const math=require('../scripts/math-activities.js');
function rng(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
let checks=0;
function check(settings,pool,seed){
 const old=math.createQuestionSource(settings,rng(seed),pool);
 const keys=Array.from({length:Math.min(10,pool.length)},()=>old.next().key);
 const source=math.createQuestionSource({...settings,previousKeys:keys},rng(seed),pool);
 const count=Math.min(pool.length*2+7,300),list=Array.from({length:count},()=>source.next().key);
 if(pool.length>1)assert.notEqual(list[0],keys[0]);
 const unused=pool.filter(g=>!keys.includes(g.key));
 assert(list.slice(0,Math.min(unused.length,list.length)).every(k=>!keys.includes(k)));
 const gap=Math.min(3,pool.length-1);
 for(let i=0;i<list.length;i++)assert(!list.slice(Math.max(0,i-gap),i).includes(list[i]));
 for(let i=0;i+pool.length<=list.length;i+=pool.length)assert.equal(new Set(list.slice(i,i+pool.length)).size,pool.length);
 checks++;
}
for(const activity of Object.keys(math.activities))for(let level=0;level<5;level++)for(let seed=1;seed<=5;seed++){
 const settings={activity,level};check(settings,math.questionPool(settings),seed);
}
for(let size=1;size<=4;size++)for(let seed=1;seed<=5;seed++)check({activity:'squares',level:0},math.questionPool({activity:'squares',level:0}).slice(0,size),seed);
console.log(`PASS: ${checks} repeated-flight sequences, unused-family preference, different opening where possible, spacing and balanced rounds.`);
