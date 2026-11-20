// Pure, derived content definitions. Existing pools remain the source of truth.
// Analysis scopes are in-memory descriptors, NOT a new saved-session format.
(function(root){
'use strict';
const math=typeof module!=='undefined'&&module.exports?require('./math-activities.js'):root.FactFlightMath;
const VERSION='content-v1';
const activityOrder=Object.freeze(['addition','subtraction','multiplication','division','bonds','doubles','halves','squares']);
const catalogs=new Map();
const integer=n=>Number.isSafeInteger(n)&&n>=0;
function validScope(s){
 if(!s||!activityOrder.includes(s.activity))return false;
 if(s.kind==='level')return Number.isInteger(s.level)&&s.level>=0&&s.level<5;
 if(s.kind==='school')return s.activity==='multiplication'&&Number.isInteger(s.table)&&s.table>=2&&s.table<=10;
 return s.kind==='families'&&['multiplication','division'].includes(s.activity)&&[10,12].includes(s.range)&&Array.isArray(s.families)&&s.families.length>0&&s.families.length<=12&&new Set(s.families).size===s.families.length&&s.families.every(n=>Number.isInteger(n)&&n>=1&&n<=12);
}
function scopeKey(s){
 if(!validScope(s))return null;
 return s.kind==='level'?`${s.activity}:level:${s.level}`:s.kind==='school'?`multiplication:school:${s.table}`:`${s.activity}:families:${s.families.slice().sort((a,b)=>a-b).join(',')}:through:${s.range}`;
}
function scopeFromSession(s){
 if(!s||s.activity==='review')return null;
 const selected=s.selection!==undefined&&s.selection!==null;
 if(s.table!==undefined){
  const scope={kind:'school',activity:'multiplication',table:s.table};
  return !s.activity&&s.schemaVersion===undefined&&s.level===undefined&&!selected&&validScope(scope)?scope:null;
 }
 if(selected){
  if(s.schemaVersion===4&&s.level===undefined&&s.selection.type==='families')return math.selectionScope(s.activity,s.selection);
  // Only the existing v6.1/v6.2 contract is adapted here. No speculative schema.
  if(s.schemaVersion!==2||s.activity!=='multiplication'||s.level!==undefined||s.selection.type!=='tables'||Object.keys(s.selection).some(k=>!['type','tables'].includes(k))||!math.validTables(s.selection.tables))return null;
  return {kind:'families',activity:'multiplication',families:s.selection.tables.slice().sort((a,b)=>a-b),range:10};
 }
 const scope={kind:'level',activity:s.activity,level:s.level};
 return (s.schemaVersion===undefined||s.schemaVersion===1)&&validScope(scope)?scope:null;
}
// Decode exact, existing canonical keys, never guess a tier from display text.
function decode(activity,key){
 if(typeof key!=='string')return null;
 const parts=key.split(':'),op=parts.shift();
 if(!parts.every(x=>/^(0|[1-9]\d*)$/.test(x)))return null;
 const ns=parts.map(Number);if(!ns.every(integer))return null;
 const [a,b]=ns,flags=[];let answer,texts;
 if(activity==='addition'&&op==='+'&&ns.length===2&&a<=b){answer=a+b;texts=[`${a} + ${b}`,`${b} + ${a}`];if(a===0)flags.push('zero-addend');}
 else if(activity==='multiplication'&&op==='×'&&ns.length===2&&a<=b){answer=a*b;texts=[`${a} × ${b}`,`${b} × ${a}`];if(a===0)flags.push('zero-factor');if(a===1||b===1)flags.push('unit-factor');}
 else if(activity==='subtraction'&&op==='subtract'&&ns.length===2&&a>=b){answer=a-b;texts=[`${a} − ${b}`];if(b===0)flags.push('subtract-zero');if(a===b)flags.push('equal-operands');}
 else if(activity==='division'&&op==='divide'&&ns.length===2&&b>0&&a%b===0){answer=a/b;texts=[`${a} ÷ ${b}`];if(a===0)flags.push('zero-dividend');if(b===1)flags.push('unit-divisor');if(a===b)flags.push('equal-operands');}
 else if(activity==='bonds'&&op==='bond'&&ns.length===2&&b<=a){answer=a-b;texts=[`${b} + ? = ${a}`,`? + ${b} = ${a}`];if(b===0||answer===0)flags.push('zero-part');}
 else if(activity==='doubles'&&op==='doubles'&&ns.length===1){answer=2*a;texts=[`Double ${a}`];if(a===0)flags.push('zero-input');}
 else if(activity==='halves'&&op==='halves'&&ns.length===1){answer=a;texts=[`Half of ${2*a}`];if(a===0)flags.push('zero-input');}
 else if(activity==='squares'&&op==='square'&&ns.length===1){answer=a*a;texts=[`${a}²`];if(a===0||a===1)flags.push('zero-or-unit-base');}
 else return null;
 return integer(answer)?{key,activity,operands:ns,answer,texts:[...new Set(texts)],identityFlags:flags}:null;
}
function catalog(activity,maxLevel=4){
 const cacheKey=activity+':'+maxLevel;
 if(!activityOrder.includes(activity))throw Error('Unknown activity');
 if(!catalogs.has(cacheKey)){
  const families=new Map();
  for(let level=0;level<=maxLevel;level++)for(const g of math.questionPool({activity,level,mode:'practice'})){
   const f=decode(activity,g.key);if(!f)throw Error('Activity pool has an unsupported family key');
   let row=families.get(g.key);
   if(!row){row={...f,earliestLevel:level,levels:[],variants:new Map()};families.set(g.key,row)}
   row.levels.push(level);
   for(const v of g.variants){if(v.answer!==f.answer||!f.texts.includes(v.text))throw Error('Activity pool and canonical definition disagree');row.variants.set(v.text,v.answer)}
  }
  catalogs.set(cacheKey,families);
 }
 return catalogs.get(cacheKey);
}
function familyMembers(f,scope){
 if(!validScope(scope)||scope.kind!=='families'||f.activity!==scope.activity)return [];
 const [a,b]=f.operands;
 if(f.activity==='division')return scope.families.includes(b)&&f.answer>=1&&f.answer<=scope.range?[{family:b,member:f.answer}]:[];
 const out=[];
 if(scope.families.includes(a)&&b>=1&&b<=scope.range)out.push({family:a,member:b});
 if(b!==a&&scope.families.includes(b)&&a>=1&&a<=scope.range)out.push({family:b,member:a});
 return out;
}
function classify(item,scope){
 if(!validScope(scope)||!item)return {valid:false,reason:'unknown-scope'};
 let key=item.key,text=item.text;
 if(scope.kind==='school'&&key===undefined&&integer(item.a)&&integer(item.b)){
  key=`×:${Math.min(item.a,item.b)}:${Math.max(item.a,item.b)}`;
  text=`${item.a} × ${item.b}`;
 }
 const f=decode(scope.activity,key);
 if(!f||!f.texts.includes(text)||item.answer!==f.answer)return {valid:false,reason:'invalid-fact'};
 const row=catalog(scope.activity,scope.kind==='level'?scope.level:4).get(key);
 let allowed=false;
 if(scope.kind==='level')allowed=!!row?.levels.includes(scope.level)&&row.variants.get(text)===item.answer;
 else if(scope.kind==='families')allowed=familyMembers(f,scope).length>0;
 else {const [a,b]=f.operands;allowed=(a===scope.table&&b>=1&&b<=10)||(b===scope.table&&a>=1&&a<=10);if(item.factor!==undefined)allowed=allowed&&integer(item.factor)&&item.factor>=1&&item.factor<=10&&item.factor*scope.table===item.answer;}
 if(!allowed)return {valid:false,reason:'outside-selected-pool'};
 const identity=f.identityFlags.length>0,earliestLevel=row?.earliestLevel??null;
 return {valid:true,version:VERSION,activity:scope.activity,familyKey:key,displayKey:text,answer:f.answer,operands:f.operands.slice(),identityFlags:f.identityFlags.slice(),identity,earliestLevel,classificationSource:'inferred-from-recorded-fact',bucket:identity?'identity':scope.kind==='level'?(earliestLevel===scope.level?'selected-tier':'earlier-review'):'selected-family'};
}
function tier(scope){
 if(!validScope(scope)||scope.kind!=='level')throw Error('A numbered level is required');
 const rows=[...catalog(scope.activity,scope.level).values()].filter(f=>f.levels.includes(scope.level)&&f.earliestLevel===scope.level);
 const nonIdentity=rows.filter(f=>!f.identityFlags.length),introductoryException=scope.level===0&&rows.length>0&&!nonIdentity.length;
 const eligible=introductoryException?rows:nonIdentity;
 // The approved two-family example requires BOTH new squares, not ceil(.3*2)=1.
 const requiredDistinct=eligible.length<=2?eligible.length:Math.min(10,Math.ceil(.3*eligible.length));
 return {families:eligible.map(f=>f.key),available:eligible.length,requiredDistinct,requiredEncounters:10,introductoryException,valid:eligible.length>0};
}
function contentSummary(scope){
 if(!validScope(scope)||scope.kind!=='level')throw Error('A numbered level is required');
 const rows=[...catalog(scope.activity,scope.level).values()].filter(f=>f.levels.includes(scope.level));
 return {scope:{...scope},families:rows.length,identities:rows.filter(f=>f.identityFlags.length).length,selectedTier:rows.filter(f=>!f.identityFlags.length&&f.earliestLevel===scope.level).length,earlierReview:rows.filter(f=>!f.identityFlags.length&&f.earliestLevel<scope.level).length};
}
// Exclusive buckets: selected ordinary, L1 review, L2 review, L3 review, identity.
function practiceAllocation(activity,level){
 if(!activityOrder.includes(activity)||![1,2].includes(level))return null;
 return activity==='bonds'?[19,0,0,0,1]:activity==='squares'&&level===2?[12,2,5,0,1]:level===1?[15,4,0,0,1]:[15,1,3,0,1];
}
const api={VERSION,activityOrder,validScope,scopeKey,scopeFromSession,classify,familyMembers,tier,contentSummary,practiceAllocation};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactFlightContent=api;
})(globalThis);
