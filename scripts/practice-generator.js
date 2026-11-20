// Bounded, in-memory ordinary-practice allocation. No storage or answer records.
(function(root){
'use strict';
const content=typeof module!=='undefined'&&module.exports?require('./content-definitions.js'):root.FactFlightContent;
const VERSION='numbered-mix-v1';
function createSource(settings,random,pool){
 if(!pool.length)throw Error('Choose a nonempty question pool');
 const scope={kind:'level',activity:settings.activity,level:settings.level};
 const buckets=Array.from({length:5},()=>[]);
 for(const g of pool){const f=content.classify({...g.variants[0],key:g.key},scope);if(!f.valid)throw Error('Invalid practice family');buckets[f.identity?4:f.earliestLevel===settings.level?0:f.earliestLevel+1].push(g);}
 const allocation=content.practiceAllocation(settings.activity,settings.level);
 if(!allocation)throw Error('Unsupported allocation scope');
 // Missing identity/review capacity returns to selected ordinary; never expand range.
 for(let i=1;i<5;i++)if(!buckets[i].length){allocation[0]+=allocation[i];allocation[i]=0;}
 if(!buckets[0].length)throw Error('Selected-tier pool is empty');
 const signature=VERSION+':'+settings.activity+':'+settings.level+':'+pool.map(g=>g.key).join('|');
 const memory=settings.carryover;
 let state=memory?.get(signature);
 if(!state){state={tickets:[],bags:buckets.map(()=>[]),recent:(settings.previousKeys||[]).slice(-3),answers:[],counts:new Map(),generated:0};if(memory)memory.set(signature,state);}
 const pick=xs=>xs[Math.floor(random()*xs.length)];
 function cycle(){
  // Smooth weighted round, then random rotation: exact totals without fixed easy openings.
  const used=allocation.map(()=>0),tickets=[];
  for(let n=1;n<=20;n++){const scores=allocation.map((a,i)=>used[i]<a?a*n/20-used[i]:-Infinity),best=Math.max(...scores);const i=pick(scores.map((x,i)=>x===best?i:-1).filter(i=>i>=0));used[i]++;tickets.push(i);}
  const offset=Math.floor(random()*20);return tickets.slice(offset).concat(tickets.slice(0,offset));
 }
 return {policyVersion:VERSION,next(){
  if(!state.tickets.length)state.tickets=cycle();
  const bucket=state.tickets.shift();
  if(!state.bags[bucket].length)state.bags[bucket]=buckets[bucket].slice();
  const bag=state.bags[bucket],last=state.recent.at(-1);
  // Allocation and bucket-balanced rounds precede diversity. Relax gap before validity.
  const score=g=>(g.key===last?100:0)+(state.recent.includes(g.key)?10:0)+(state.answers.length===2&&state.answers.every(a=>a===g.variants[0].answer)?1:0);
  const best=Math.min(...bag.map(score)),g=pick(bag.filter(g=>score(g)===best));
  bag.splice(bag.indexOf(g),1);
  const counts=state.counts.get(g.key)||g.variants.map(()=>0),least=Math.min(...counts),i=pick(counts.map((n,i)=>n===least?i:-1).filter(i=>i>=0));counts[i]++;state.counts.set(g.key,counts);
  const v=g.variants[i];state.recent.push(g.key);state.recent=state.recent.slice(-3);state.answers.push(v.answer);state.answers=state.answers.slice(-2);state.generated++;
  return {text:v.text,answer:v.answer,status:'pending',attempts:[],skips:0,ms:0,key:g.key};
 }};
}
const api={VERSION,createSource};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactFlightGenerator=api;
})(globalThis);
