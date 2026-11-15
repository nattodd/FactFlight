// Activity definitions and pure session-scoped generators. No storage or browser APIs.
(function(root){
'use strict';
const activities={
 multiplication:{name:'Multiplication',symbol:'×',desc:'Build confidence with times tables',levels:['2, 5 & 10 tables','2–10 tables','2–12 tables','13–20 × 2–12','21–99 × 2–12']},
 addition:{name:'Addition',symbol:'+',desc:'Put numbers together',levels:['Sums within 5','Sums within 10','Sums within 20','Two digits + two digits (10–99)','Three digits + two digits']},
 subtraction:{name:'Subtraction',symbol:'−',desc:'Find what is left',levels:['Subtract within 5','Subtract within 10','Subtract within 20','Two digits − two digits','Three digits − two digits']},
 division:{name:'Division',symbol:'÷',desc:'Share into equal groups',levels:['2, 5 & 10 families','Divide by 2–10','Divide by 2–12','Exact division · quotients 13–20','Exact division · quotients 21–99']},
 bonds:{name:'Number bonds',symbol:'◡',desc:'Find the missing part',levels:['Make 5','Make 10','Make 20','Make 100 · parts 10–90','Make 1,000 · parts 100–900']},
 doubles:{name:'Doubles',symbol:'2×',desc:'Twice as many',levels:['Double 0–5','Double 0–10','Double 0–20','Double 21–99','Double 100–999']},
 halves:{name:'Halves',symbol:'½',desc:'Two equal parts',levels:['Even numbers to 10','Even numbers to 20','Even numbers to 40','Even numbers 42–198','Even numbers 200–1,998']},
 squares:{name:'Squares',symbol:'n²',desc:'A number times itself',levels:['Bases 1–5','Bases 1–10','Bases 1–12','Bases 13–20','Bases 21–50']}
};
function validTables(tables){return Array.isArray(tables)&&tables.length>0&&tables.length<=10&&new Set(tables).size===tables.length&&tables.every(n=>Number.isInteger(n)&&n>=1&&n<=10)}
function questionPool(settings){
 if(settings.selection!==undefined&&settings.selection!==null&&(!settings.selection||settings.selection.type!=='tables'||settings.activity!=='multiplication'||!validTables(settings.selection.tables)))throw Error('Choose one or more multiplication tables from 1 to 10');
 const groups=new Map(),kind=settings.activity,l=settings.level;
 const add=(key,text,answer)=>{if(!groups.has(key))groups.set(key,{key,variants:[]});const g=groups.get(key);if(!g.variants.some(v=>v.text===text))g.variants.push({text,answer})};
 const family=(op,a,b,answer)=>add(`${op}:${Math.min(a,b)}:${Math.max(a,b)}`,`${a} ${op} ${b}`,answer);
 if(settings.mode==='school'){
  for(let f=1;f<=10;f++){add(`school:${f}`,`${settings.table} × ${f}`,settings.table*f);add(`school:${f}`,`${f} × ${settings.table}`,settings.table*f)}
 }else if(kind==='multiplication'&&settings.selection?.type==='tables'){
  for(const a of settings.selection.tables)for(let b=1;b<=10;b++)family('×',a,b,a*b);
 }else if(kind==='addition'){
  if(l<3){const max=[5,10,20,99,999][l],min=l<3?0:l===3?21:100;for(let a=min;a<=max;a++)for(let b=0;b<=max-a;b++)family('+',a,b,a+b)}
  else {for(let a=l===3?10:100;a<=(l===3?99:999);a++)for(let b=10;b<=99;b++){family('+',a,b,a+b);family('+',b,a,a+b)}}
 }else if(kind==='subtraction'){
  if(l<3){const max=[5,10,20,99,999][l],min=l<3?0:l===3?21:100;for(let a=min;a<=max;a++)for(let b=0;b<=a;b++)add(`subtract:${a}:${b}`,`${a} − ${b}`,a-b)}
  else {for(let a=l===3?20:100;a<=(l===3?99:999);a++)for(let b=10;b<=Math.min(99,a);b++)add(`subtract:${a}:${b}`,`${a} − ${b}`,a-b)}
 }else if(kind==='multiplication'||kind==='division'){
  if(l<3){const tables=l===0?[2,5,10]:Array.from({length:l===1?9:11},(_,i)=>i+2),max=l===2?12:10;
   for(const a of tables)for(let b=1;b<=max;b++)if(kind==='multiplication')family('×',a,b,a*b);else add(`divide:${a*b}:${a}`,`${a*b} ÷ ${a}`,b);
  }else {for(let a=l===3?13:21;a<=(l===3?20:99);a++)for(let b=2;b<=12;b++)if(kind==='multiplication'){family('×',a,b,a*b);family('×',b,a,a*b)}else add(`divide:${a*b}:${b}`,`${a*b} ÷ ${b}`,a)}
 }else if(kind==='bonds'){
  const total=[5,10,20,100,1000][l],min=l<3?0:l===3?10:100;for(let a=min;a<=total-min;a++){add(`bond:${total}:${a}`,`${a} + ? = ${total}`,total-a);add(`bond:${total}:${a}`,`? + ${a} = ${total}`,total-a)}
 }else if(kind==='doubles'||kind==='halves'){
  const max=[5,10,20,99,999][l],min=l<3?0:l===3?21:100;for(let a=min;a<=max;a++)add(`${kind}:${a}`,kind==='doubles'?`Double ${a}`:`Half of ${2*a}`,kind==='doubles'?2*a:a);
 }else if(kind==='squares'){
  for(let a=l<3?1:l===3?13:21;a<=[5,10,12,20,50][l];a++)add(`square:${a}`,`${a}²`,a*a);
 }
 return [...groups.values()];
}
function createQuestionSource(settings,random=Math.random,pool=questionPool(settings)){
 if(!pool.length)throw Error('Choose a nonempty question pool');
 let remaining=[],recent=[],round=0;
 const variantCounts=new Map();
 // Prefer unseen families in the first balanced round of a repeated flight.
 const previous=new Set(settings.previousKeys||[]),previousFirst=settings.previousKeys?.[0];
 let unseen=previous.size?pool.filter(g=>!previous.has(g.key)).length:0,emitted=0;
 const pick=list=>list[Math.floor(random()*list.length)];
 return {next(){
  if(!remaining.length){remaining=pool.slice();round++}
  // Random swap-removal avoids rescanning large pools for every question.
  let slot=-1;
  const eligible=g=>!recent.includes(g.key)&&!(emitted===0&&pool.length>1&&g.key===previousFirst);
  const preferred=g=>eligible(g)&&(round!==1||!unseen||!previous.has(g.key));
  for(let trial=0;trial<8;trial++){const i=Math.floor(random()*remaining.length);if(preferred(remaining[i])){slot=i;break}}
  if(slot<0)slot=remaining.findIndex(preferred);
  if(slot<0)slot=remaining.findIndex(eligible);
  if(slot<0)slot=remaining.findIndex(g=>!recent.includes(g.key));
  // Tiny pools use the longest possible gap without looping or changing range.
  if(slot<0){const earliest=Math.min(...remaining.map(g=>recent.lastIndexOf(g.key)));slot=remaining.findIndex(g=>recent.lastIndexOf(g.key)===earliest)}
  const group=remaining[slot];remaining[slot]=remaining[remaining.length-1];remaining.pop();
  if(round===1&&unseen&&!previous.has(group.key))unseen--;emitted++;
  recent.push(group.key);recent=recent.slice(-3);
  let variant;
  if(settings.mode==='school')variant=group.variants[(round-1)%group.variants.length];
  else {const counts=variantCounts.get(group.key)||group.variants.map(()=>0),least=Math.min(...counts);const i=pick(counts.map((n,i)=>i).filter(i=>counts[i]===least));variant=group.variants[i];counts[i]++;variantCounts.set(group.key,counts)}
  return {text:variant.text,answer:variant.answer,status:"pending",attempts:[],skips:0,ms:0,key:group.key};
 }};
}

function parseWholeNumber(raw){
 const text=String(raw).toLowerCase().replace(/[.,!?]/g,'').replace(/-/g,' ').trim().replace(/^(?:the answer is|answer is|it is|it's|its)\s+/,'').replace(/\s+/g,' ');
 if(!text)return null;
 if(/^\d{1,4}$/.test(text))return Number(text);
 const units=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
 const tens={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
 const small=s=>{if(units.includes(s))return units.indexOf(s);const w=s.split(' ');if(w[0] in tens&&(w.length===1||(w.length===2&&units.indexOf(w[1])>0&&units.indexOf(w[1])<10)))return tens[w[0]]+(w.length===2?units.indexOf(w[1]):0);return null};
 const underThousand=s=>{if(!s)return 0;if(!s.includes('hundred'))return small(s);const m=s.match(/^(a|one|two|three|four|five|six|seven|eight|nine) hundred(?: (?:and )?(.+))?$/);if(!m)return null;const tail=m[2]?small(m[2]):0;return tail===null?null:(m[1]==='a'?1:units.indexOf(m[1]))*100+tail};
 if(!text.includes('thousand'))return underThousand(text);
 const m=text.match(/^(a|one|two|three|four|five|six|seven|eight|nine) thousand(?: (?:and )?(.+))?$/);if(!m)return null;
 const tail=underThousand(m[2]||'');return tail===null?null:(m[1]==='a'?1:units.indexOf(m[1]))*1000+tail;
}
const api={validTables,activities,questionPool,createQuestionSource,parseWholeNumber};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactFlightMath=api;
})(globalThis);
