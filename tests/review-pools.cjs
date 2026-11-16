const assert=require('node:assert/strict'),m=require('../scripts/math-activities.js');
function flight(id,activity='addition',level=0,kind='wrong',offset=0){const q=m.questionPool({activity,level})[offset],v=q.variants[0];return {id,date:new Date(1700000000000+id*1000).toISOString(),activity,level,items:[{key:q.key,...v,status:kind==='success'?'correct':'wrong',attempts:kind==='untouched'||kind==='skip'?[]:[{correct:kind==='success',value:kind==='success'?v.answer:v.answer+1}],skips:kind==='skip'?1:0,ms:0}]}}
const original=[flight(1),flight(2,'division',1),flight(3,'multiplication',1),flight(4,'addition',4)];const before=JSON.stringify(original);
assert.equal(m.reviewCandidates(original).length,4);assert.equal(m.reviewCandidates(original,'addition').length,2);assert.equal(JSON.stringify(original),before);
assert.equal(m.reviewCandidates([flight(1),flight(2,'addition',0,'success')]).length,1);
assert.equal(m.reviewCandidates([flight(1),flight(2,'addition',0,'success'),flight(3,'addition',0,'success')]).length,0);
const dup=flight(2,'addition',0,'success');dup.items.push(structuredClone(dup.items[0]));assert.equal(m.reviewCandidates([flight(1),dup]).length,1);
assert.equal(m.reviewCandidates([flight(1),flight(2,'addition',0,'success'),flight(3,'addition',0,'success'),flight(4)]).length,1);
assert.equal(m.reviewCandidates([flight(1,'addition',0,'untouched')]).length,0);assert.equal(m.reviewCandidates([flight(1,'addition',0,'skip')]).length,1);
assert.equal(m.reviewCandidates([flight(1),...Array.from({length:5},(_,i)=>flight(i+2,'addition',0,'untouched',1))]).length,0);
assert.equal(m.reviewCandidates([flight(1),...Array.from({length:5},(_,i)=>flight(i+2,'division',0,'untouched',1))],'addition').length,1);
const school={id:9,date:new Date().toISOString(),table:3,items:[{a:3,b:4,factor:4,answer:12,skips:1,status:'skipped',attempts:[],ms:0}]};
const f=m.reviewCandidates([school])[0];assert.equal(f.key,'×:3:4');assert.equal(f.table,3);assert(m.validReviewFact(f));
const review={version:1,source:'progress',filter:'all',facts:m.reviewCandidates(original)};assert(m.validReview(review));const src=m.createReviewSource(review,()=>.2),questions=Array.from({length:4},()=>src.next());assert.equal(new Set(questions.map(p=>p.activity+':'+p.key)).size,4);assert(questions.every(p=>p.status==='pending'&&!p.attempts.length&&!p.skips));questions[0].attempts.push({correct:false});assert.equal(JSON.stringify(original),before);assert(m.createReviewSource(review).next().attempts.length===0);
assert(!m.validReview({...review,facts:[review.facts[0],review.facts[0]]}));assert(!m.validReview({...review,facts:[{...review.facts[0],answer:9999}]}));assert(!m.validReview({...review,filter:'squares'}));
console.log('PASS: review selection, window, retirement, deduplication, School identity, metadata validation and fresh pools');
