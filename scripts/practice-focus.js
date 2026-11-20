// Disposable local preference and current readiness. Never rewrites learner records.
(function(root){
'use strict';
const prefix='fact-flight-focus-v1:',fallback=new Map();let guest=false,cache=null;
function context(){return root.FlightProfiles.focusContext()}
function enabled(){const {id}=context();if(!id)return false;if(id==='guest')return guest;if(fallback.has(id))return fallback.get(id);try{const value=JSON.parse(localStorage.getItem(prefix+id));return value?.version===1&&value.enabled===true}catch{return false}}
function set(value){const {id}=context();if(!id)return false;if(id==='guest'){guest=!!value;return true}try{localStorage.setItem(prefix+id,JSON.stringify({version:1,enabled:!!value}));fallback.delete(id);return true}catch{fallback.set(id,!!value);return false}}
function resetGuest(){guest=false;cache=null}
function remove(id){fallback.delete(id);localStorage.removeItem(prefix+id);cache=null}
function evidence(){const c=context(),key=JSON.stringify([c.id,c.sessions]);if(cache?.key===key)return cache;
 const sessions=c.id==='guest'?c.sessions.filter(s=>s.guest).map(s=>({...s,guest:false,learnerId:'focus-guest'})):c.sessions;
 cache={key,items:new Map(),activities:new Map(),flights:root.FactFlightReports.normalize(sessions,{learnerId:c.id==='guest'?'focus-guest':c.id||null})};return cache;
}
function scopes(c){if(!c)return [];if(c.mode==='school')return [{kind:'school',activity:'multiplication',table:c.table}];if(c.selection){const scope=root.FactFlightMath.selectionScope(c.activity,c.selection);return scope?scope.families.map(n=>({...scope,families:[n]})):[];}return [{kind:'level',activity:c.activity,level:c.level}]}
function result(scope){const e=evidence(),key=root.FactFlightContent.scopeKey(scope);if(!e.items.has(key))e.items.set(key,root.FactFlightReadiness.evaluate(e.flights,scope));return e.items.get(key)}
function mastered(c){return scopes(c).filter(s=>root.FactFlightContent.validScope(s)&&result(s).ready)}
function activity(id){const e=evidence();if(!e.activities.has(id)){const a=root.FactFlightReadiness.activity(e.flights,id,{ranges:[10,12],familiesThrough:12}),items=[...a.levels.items,...a.families.flatMap(g=>g.items)];e.activities.set(id,{ready:a.ready,readyCount:items.filter(x=>x.ready).length,total:items.length,allSelectableReady:a.ready&&(!a.timed||a.timed.ready)});}return e.activities.get(id)}
function key(c){return JSON.stringify([context().id,scopes(c).map(s=>root.FactFlightContent.scopeKey(s)).sort()])}
root.FactFlightFocus={enabled,set,resetGuest,remove,context,scopes,mastered,activity,key};
})(globalThis);
