// Explicit in-memory family scopes. Saved-record adaptation is a separate boundary.
(function(root){
'use strict';
const math=typeof module!=='undefined'&&module.exports?require('./math-activities.js'):root.FactFlightMath;
const content=typeof module!=='undefined'&&module.exports?require('./content-definitions.js'):root.FactFlightContent;
function valid(scope){return !!scope&&scope.kind==='families'&&content.validScope(scope);}
function pool(scope){
 if(!valid(scope))throw Error('Choose families 1–12 and a range of 10 or 12');
 const groups=new Map();
 for(const family of scope.families)for(let member=1;member<=scope.range;member++){
  const multiply=scope.activity==='multiplication';
  const key=multiply?`×:${Math.min(family,member)}:${Math.max(family,member)}`:`divide:${family*member}:${family}`;
  const variant=multiply?{text:`${family} × ${member}`,answer:family*member}:{text:`${family*member} ÷ ${family}`,answer:member};
  if(!groups.has(key))groups.set(key,{key,variants:[]});
  const group=groups.get(key);if(!group.variants.some(v=>v.text===variant.text))group.variants.push(variant);
 }
 return [...groups.values()];
}
function createSource(scope,random=Math.random,previousKeys=[]){
 return math.createQuestionSource({previousKeys},random,pool(scope));
}
function next(scope){
 if(!valid(scope)||scope.families.includes(12))return null;
 return {...scope,families:scope.families.map(n=>n+1).sort((a,b)=>a-b)};
}
function label(scope){
 if(!valid(scope))throw Error('Invalid family selection');
 return `${scope.activity==='multiplication'?'Tables':'Divide by'} ${scope.families.slice().sort((a,b)=>a-b).join(', ')} · ${scope.activity==='multiplication'?'other factor':'answers'} 1–${scope.range}`;
}
const api={valid,pool,createSource,next,label};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.FactFlightFamilies=api;
})(globalThis);
