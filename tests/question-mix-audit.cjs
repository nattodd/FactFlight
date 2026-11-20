// Read-only audit of current pools and seeded generation. No learner data or writes.
// Run: node tests/question-mix-audit.cjs > <audit-output.json>
const math=require('../scripts/math-activities.js');
const content=require('../scripts/content-definitions.js');
const assert=require('node:assert/strict');
const rows=[];
const rng=initial=>{let seed=initial;return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}};
const stats=xs=>{const sorted=xs.slice().sort((a,b)=>a-b);return {min:sorted[0],median:sorted[Math.floor(sorted.length/2)],max:sorted.at(-1),mean:xs.reduce((a,b)=>a+b,0)/xs.length}};
function regroup(a,b,subtract){let carry=0,events=0;while(a||b){const x=a%10,y=b%10;carry=subtract?Number(x-carry<y):Number(x+y+carry>=10);events+=carry;a=Math.floor(a/10);b=Math.floor(b/10)}return events}
function sequenceMetrics(questions,classified){
 const out={exactAdjacent:0,familyAdjacent:0,sameAnswerAdjacent:0,identityAdjacent:0,sameIdentityPatternAdjacent:0,sharedOperandAdjacent:0,neighboringPatternAdjacent:0,recentFamilyRepeats:0,repeatedFamilyEncounters:questions.length-new Set(questions.map(q=>q.key)).size,longestIdentityRun:0,longestSameAnswerRun:questions.length?1:0};
 let identityRun=0,answerRun=0;
 questions.forEach((q,i)=>{
  const f=classified.get(q.key),prev=questions[i-1],g=prev&&classified.get(prev.key);
  identityRun=f.identity?identityRun+1:0;answerRun=prev?.answer===q.answer?answerRun+1:1;
  out.longestIdentityRun=Math.max(out.longestIdentityRun,identityRun);out.longestSameAnswerRun=Math.max(out.longestSameAnswerRun,answerRun);
  if(questions.slice(Math.max(0,i-3),i).some(p=>p.key===q.key))out.recentFamilyRepeats++;
  if(!prev)return;
  out.exactAdjacent+=Number(prev.text===q.text);out.familyAdjacent+=Number(prev.key===q.key);out.sameAnswerAdjacent+=Number(prev.answer===q.answer);out.identityAdjacent+=Number(f.identity&&g.identity);
  out.sameIdentityPatternAdjacent+=Number(f.identityFlags.some(flag=>g.identityFlags.includes(flag)));
  // Canonical operands: bonds omit their fixed total so it does not make every pair similar.
  const operands=h=>h.activity==='bonds'?[h.operands[1]]:h.operands;
  const a=operands(f),b=operands(g);
  out.sharedOperandAdjacent+=Number(a.some(n=>b.includes(n)));
  out.neighboringPatternAdjacent+=Number(f.familyKey!==g.familyKey&&a.length===b.length&&a.every((n,j)=>Math.abs(n-b[j])<=1));
 });
 return out;
}
// Independent, deliberately repetitive fixtures verify the audit counters.
{
 const qs=[{key:'subtract:4:4',text:'4 − 4',answer:0},{key:'subtract:5:5',text:'5 − 5',answer:0},{key:'subtract:5:5',text:'5 − 5',answer:0}];
 const lookup=new Map(qs.map(q=>[q.key,content.classify(q,{kind:'level',activity:'subtraction',level:0})]));
 const m=sequenceMetrics(qs,lookup);
 assert.equal(m.exactAdjacent,1);assert.equal(m.familyAdjacent,1);assert.equal(m.sameAnswerAdjacent,2);assert.equal(m.sameIdentityPatternAdjacent,2);assert.equal(m.neighboringPatternAdjacent,1);assert.equal(m.longestIdentityRun,3);assert.equal(m.repeatedFamilyEncounters,1);
 assert.equal(regroup(24,36,false),1);assert.equal(regroup(11,22,false),0);assert.equal(regroup(100,99,true),2);assert.equal(regroup(55,22,true),0);
}
for(const activity of content.activityOrder)for(let level=0;level<5;level++){
 const settings={activity,level,mode:'practice'},scope={kind:'level',activity,level},pool=math.questionPool(settings);
 const allTiers=[0,0,0,0,0],nonIdentityTiers=[0,0,0,0,0],identityTiers=[0,0,0,0,0],classified=new Map();
 const structure={noRegroup:0,regroup:0,singleDigitAnswer:0,hasRoundTenOperand:0,containsFactor2or5or10:0};
 for(const g of pool){
  const f=content.classify({...g.variants[0],key:g.key},scope);assert(f.valid);classified.set(g.key,f);allTiers[f.earliestLevel]++;(f.identity?identityTiers:nonIdentityTiers)[f.earliestLevel]++;
  const [a,b]=f.operands;
  if(['addition','subtraction'].includes(activity)){structure[regroup(a,b,activity==='subtraction')?'regroup':'noRegroup']++;if(f.answer<10)structure.singleDigitAnswer++;if(a%10===0||b%10===0)structure.hasRoundTenOperand++;}
  if(activity==='multiplication'&&f.operands.some(n=>[2,5,10].includes(n)))structure.containsFactor2or5or10++;
 }
 const simulations={};
 for(const length of [5,20]){
  const selected=[],identities=[],distinct=[],longestIdentity=[],sequences=[];
  for(let seed=1;seed<=128;seed++){
   // Spread starting states across uint32 space; adjacent small LCG seeds can
   // bias first draws in short flights. This remains a deterministic sample.
   const source=math.createQuestionSource(settings,rng(Math.imul(seed,0x9e3779b1)>>>0),pool),questions=Array.from({length},()=>source.next());
   const facts=questions.map(q=>classified.get(q.key));let run=0,longest=0;
   for(const f of facts){run=f.identity?run+1:0;longest=Math.max(run,longest)}
   selected.push(facts.filter(f=>f.bucket==='selected-tier').length);identities.push(facts.filter(f=>f.identity).length);distinct.push(new Set(questions.map(q=>q.key)).size);longestIdentity.push(longest);
   sequences.push(sequenceMetrics(questions,classified));
  }
  simulations[length]={flights:128,selectedNonIdentity:stats(selected),identities:stats(identities),distinctFamilies:stats(distinct),longestIdentityRun:Math.max(...longestIdentity),sequence:Object.fromEntries(Object.keys(sequences[0]).map(k=>[k,{total:sequences.reduce((n,s)=>n+s[k],0),max:Math.max(...sequences.map(s=>s[k]))}]))};
 }
 const repeatChains={chains:128,flightsPerChain:4,questionsPerFlight:5,exactAtBoundary:0,familyAtBoundary:0,sameAnswerAtBoundary:0,totalBoundaries:128*3,longestIdentityRun:0,longestSameAnswerRun:0,allocationTotals:[0,0,0,0,0]};
 for(let seed=1;seed<=128;seed++){
  const random=rng(Math.imul(seed,0x9e3779b1)>>>0);let previous=[],chain=[];const carryover=new Map();
  for(let flight=0;flight<4;flight++){
   const source=math.createQuestionSource({...settings,previousKeys:previous.map(q=>q.key),carryover},random,pool),next=Array.from({length:5},()=>source.next());
   if(previous.length){repeatChains.exactAtBoundary+=Number(previous.at(-1).text===next[0].text);repeatChains.familyAtBoundary+=Number(previous.at(-1).key===next[0].key);repeatChains.sameAnswerAtBoundary+=Number(previous.at(-1).answer===next[0].answer)}
   chain.push(...next);previous=next;
  }
  const counts=[0,0,0,0,0];for(const q of chain){const f=classified.get(q.key);counts[f.identity?4:f.earliestLevel===level?0:f.earliestLevel+1]++;}
  counts.forEach((n,i)=>repeatChains.allocationTotals[i]+=n);
  const target=content.practiceAllocation(activity,level);if(target)assert.deepEqual(counts,target,'Carried short-flight allocation');
  const m=sequenceMetrics(chain,classified);repeatChains.longestIdentityRun=Math.max(repeatChains.longestIdentityRun,m.longestIdentityRun);repeatChains.longestSameAnswerRun=Math.max(repeatChains.longestSameAnswerRun,m.longestSameAnswerRun);
 }
 assert.equal(allTiers.reduce((a,b)=>a+b),pool.length);assert.equal(nonIdentityTiers.reduce((a,b)=>a+b)+identityTiers.reduce((a,b)=>a+b),pool.length);
 rows.push({activity,level:level+1,label:math.activities[activity].levels[level],families:pool.length,allTiers,nonIdentityTiers,identityTiers,structure,simulations,repeatChains});
}
assert.equal(rows.length,40);
console.log(JSON.stringify({basis:'Current canonical fact-family pools; mathematical tier eligibility, not measured difficulty',seedCount:128,lengths:[5,20],scopeCount:rows.length,rows},null,2));
