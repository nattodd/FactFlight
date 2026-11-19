// Entirely invented examples; no learner export or private mockup data.
const math=require('../scripts/math-activities.js');
module.exports=function fixtures(learnerId){
 let n=0;
 const q=(activity,level,key)=>{const g=math.questionPool({activity,level}).find(x=>x.key===key);return {...g.variants[0],key,status:'correct',skips:0,ms:1000,attempts:[{value:g.variants[0].answer,correct:true,at:1000,source:'keyboard',transcript:''}]}};
 const flight=(activity,level,items,extra={})=>({id:`10000000-0000-4000-8000-${String(++n).padStart(12,'0')}`,learnerId,learnerName:'Demo learner',invalidated:[],unrecognized:[],schemaVersion:1,activity,level,date:new Date(Date.UTC(2026,0,n)).toISOString(),mode:'practice',practiceType:'quick',timeLimitMs:null,input:'keyboard',target:null,reason:'complete',elapsed:items.length*1500,items:items.map((p,i)=>({...p,attempts:p.attempts.map(a=>({...a,at:1000+i*1500}))})),...extra});
 const squares=Array.from({length:6},()=>flight('squares',2,Array.from({length:5},(_,i)=>q('squares',2,i%2?'square:12':'square:11'))));
 squares[0].items[0].attempts.unshift({value:120,correct:false,at:500,source:'keyboard',transcript:''});
 const poor=flight('addition',2,Array.from({length:30},()=>q('addition',2,'+:3:8')));
 const mult=flight('multiplication',3,[q('multiplication',3,'×:7:16')]);
 const stopped=flight('subtraction',2,Array.from({length:10},()=>q('subtraction',2,'subtract:8:3')),{reason:'manual'});
 stopped.items.forEach(p=>{p.status='wrong';p.attempts=[{value:4,correct:false,at:1000,source:'keyboard',transcript:''}]});
 const untouched=flight('division',0,[q('division',0,'divide:5:5')],{reason:'manual'});untouched.items[0].status='pending';untouched.items[0].attempts=[];
 return [...squares,poor,mult,stopped,untouched];
};
