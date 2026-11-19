// Invented, valid records for real readiness calculations; no private learner data.
const math=require('../scripts/math-activities.js'),content=require('../scripts/content-definitions.js');
module.exports=function(owner,all=false){
 let serial=0;const out=[];
 function add(items,extra){const s={id:`20000000-0000-4000-8000-${String(++serial).padStart(12,'0')}`,learnerId:owner,learnerName:'Focus demo',date:new Date(Date.UTC(2026,6,1)+serial*60000).toISOString(),mode:'practice',practiceType:'quick',timeLimitMs:null,input:'keyboard',reason:'complete',elapsed:items.length*1000,target:null,invalidated:[],unrecognized:[],...extra,items:items.map((p,i)=>({...p,status:'correct',skips:0,ms:1000,attempts:[{value:p.answer,correct:true,at:i*1000,source:'keyboard',transcript:''}]}))};out.push(s);}
 for(const activity of all?content.activityOrder:['squares'])for(const level of all?[0,1,2,3,4]:[2]){
  const tier=content.tier({kind:'level',activity,level}),pool=new Map(math.questionPool({activity,level}).map(g=>[g.key,{key:g.key,...g.variants[0]}]));
  for(let f=0;f<3;f++)add(Array.from({length:10},(_,i)=>pool.get(tier.families[(f*10+i)%Math.min(tier.families.length,10)])),{activity,level,schemaVersion:1});
 }
 for(const activity of ['multiplication','division'])for(const range of all?[10,12]:activity==='multiplication'?[10]:[12])for(const n of all?Array.from({length:12},(_,i)=>i+1):[activity==='multiplication'?7:4]){
  const selection=math.makeSelection(activity,[n],range),items=Array.from({length:range},(_,i)=>{const b=i+1;return activity==='multiplication'?{key:`×:${Math.min(n,b)}:${Math.max(n,b)}`,text:`${n} × ${b}`,answer:n*b}:{key:`divide:${n*b}:${n}`,text:`${n*b} ÷ ${n}`,answer:b}});
  for(let f=0;f<2;f++)add(items,{activity,selection,schemaVersion:selection.type==='tables'?2:4});
 }
 for(const table of all?[2,3,4,5,6,7,8,9,10]:[7])for(let f=0;f<3;f++){add(Array.from({length:60},(_,i)=>({a:table,b:i%10+1,factor:i%10+1,answer:table*(i%10+1)})),{table,mode:'test',elapsed:90000});delete out.at(-1).practiceType;delete out.at(-1).timeLimitMs;}
 if(!all)out[2].items[0].attempts.unshift({value:999,correct:false,at:0,source:'keyboard',transcript:''});
 return out;
};
