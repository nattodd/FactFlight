// Local family data. Legacy history keys are read elsewhere and are never rewritten here.
(function(root){
 'use strict';
 const KEY='fact-flight-family-v1';
 function validate(data){
  if(!data||data.version!==1||!Array.isArray(data.profiles)||!Array.isArray(data.sessions))throw Error('Unsupported or damaged learner data. Original data has been preserved.');
  const ids=new Set();
  for(const p of data.profiles){if(!p||typeof p.id!=='string'||!p.id||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||p.name.length>24)throw Error('Invalid learner data. Original data has been preserved.');ids.add(p.id)}
  const sessions=new Set();
  for(const s of data.sessions){if(!s||typeof s.id!=='string'||sessions.has(s.id)||!ids.has(s.learnerId)||!Array.isArray(s.items)||!Array.isArray(s.invalidated)||!Array.isArray(s.unrecognized)||!s.items.every(p=>p&&Number.isFinite(p.answer)&&Array.isArray(p.attempts)))throw Error('Invalid learner history. Original data has been preserved.');sessions.add(s.id)}
  return data;
 }
 function create(storage,locks){
  const read=()=>validate(JSON.parse(storage.getItem(KEY)||'{"version":1,"profiles":[],"sessions":[]}'));
  async function update(change){
   if(!locks?.request)throw Error('Safe saving is unavailable in this browser. Try an updated browser, or continue as Guest.');
   return locks.request(KEY,()=>{const data=read();const result=change(data);validate(data);storage.setItem(KEY,JSON.stringify(data));return result});
  }
  const snapshot=(data,id)=>JSON.stringify({profile:data.profiles.find(p=>p.id===id),sessions:data.sessions.filter(s=>s.learnerId===id)});
  return {read,snapshot,
   remove:(id,expected)=>update(data=>{
    if(!data.profiles.some(p=>p.id===id))throw Error('This learner no longer exists. Close this confirmation and refresh the list.');
    if(snapshot(data,id)!==expected)throw Error('This learner’s results changed in another tab. Close this confirmation and review the updated flight count before deleting.');
    data.sessions=data.sessions.filter(s=>s.learnerId!==id);
    data.profiles=data.profiles.filter(p=>p.id!==id);
   }),
   add:name=>update(data=>{const profile={id:crypto.randomUUID(),name:name.trim().slice(0,24)||`Learner ${data.profiles.length+1}`};data.profiles.push(profile);return profile}),
   save:record=>update(data=>{const existing=data.sessions.find(s=>s.id===record.id);if(existing){if(JSON.stringify(existing)!==JSON.stringify(record))throw Error('A different flight has this ID. Nothing was replaced.');return}data.sessions.unshift(structuredClone(record))})
  };
 }
 root.FlightProfileStore={KEY,create,validate};
})(globalThis);
