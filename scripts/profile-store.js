// Local family data. Legacy history keys are read elsewhere and are never rewritten here.
(function(root){
 'use strict';
 const KEY='fact-flight-family-v1';
 // Canonical comparison ignores JSON property order, but preserves every stored field/value.
 function canonical(value){
  if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
  if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
  return JSON.stringify(value);
 }
 function parseExport(text){
  let data;try{data=JSON.parse(text)}catch(e){throw Error('This file is not valid JSON. Choose a learner export from Manage learners.')}
  const fail=()=>{throw Error('This is not a supported, complete learner export. Use Export results JSON in Manage learners. Nothing was saved.')};
  const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
  const num=v=>Number.isFinite(v)&&v>=0,integer=v=>num(v)&&Number.isInteger(v);
  const str=v=>typeof v==='string',date=v=>str(v)&&Number.isFinite(Date.parse(v));
  const activities=['addition','subtraction','multiplication','division','bonds','doubles','halves','squares'];
  if(!data||data.format!=='fact-flight-learner-export'||data.version!==1||!date(data.exportedAt)||!data.profile||!uuid(data.profile.id)||!str(data.profile.name)||!data.profile.name.trim()||data.profile.name.length>24||!Array.isArray(data.sessions))fail();
  // Limit nesting, including unknown extension fields, before comparing untrusted JSON.
  function depth(v,n=0){if(n>20)fail();if(v&&typeof v==='object')for(const [key,item] of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(key))fail();depth(item,n+1)}}depth(data);
  for(const s of data.sessions){
   if(!s||!uuid(s.id)||s.learnerId!==data.profile.id||!str(s.learnerName)||s.guest||!date(s.date)||!['practice','test'].includes(s.mode)||!['voice','keyboard'].includes(s.input)||!['complete','manual','time'].includes(s.reason)||!num(s.elapsed)||(s.target!==null&&(!integer(s.target)||s.target<1))||!Array.isArray(s.items)||!Array.isArray(s.invalidated)||!Array.isArray(s.unrecognized))fail();
   if(s.activity!==undefined){if(!activities.includes(s.activity)||!integer(s.level)||s.level>4||s.schemaVersion!==1)fail()}
   else if(!integer(s.table)||s.table<2||s.table>10)fail();
   for(const p of s.items){
    if(!p||!integer(p.answer)||!integer(p.skips)||!num(p.ms)||!['pending','correct','wrong','skipped'].includes(p.status)||!Array.isArray(p.attempts))fail();
    if(s.activity){if(!str(p.text)||!str(p.key))fail()}else if(!integer(p.a)||!integer(p.b)||!integer(p.factor))fail();
    for(const a of p.attempts)if(!a||!integer(a.value)||!str(a.transcript)||!['voice','keyboard','button'].includes(a.source)||typeof a.correct!=='boolean'||!num(a.at))fail();
   }
   for(const a of s.invalidated)if(!a||!(a.value==='skip'||integer(a.value))||!str(a.text)||!['voice','keyboard','button'].includes(a.source)||!num(a.at))fail();
   for(const a of s.unrecognized)if(!a||!str(a.text)||!num(a.at))fail();
  }
  return data;
 }
 function reviewImport(data,backup){
  const existing=data.profiles.find(p=>p.id===backup.profile.id),conflicts=[],newSessions=[],seen=new Map(data.sessions.map(s=>[s.id,s]));let duplicates=0;
  if(existing&&canonical(existing)!==canonical(backup.profile))conflicts.push({id:backup.profile.id,reason:'The learner ID already exists with different profile details.'});
  for(const s of backup.sessions){const old=seen.get(s.id);if(old){if(canonical(old)===canonical(s))duplicates++;else conflicts.push({id:s.id,reason:old.learnerId!==backup.profile.id?'This flight ID belongs to another learner.':'This flight ID has different results.'})}else{seen.set(s.id,s);newSessions.push(s)}}
  return {existing:!!existing,newSessions,duplicates,conflicts,sameName:data.profiles.some(p=>p.id!==backup.profile.id&&p.name===backup.profile.name),fingerprint:canonical(data)};
 }
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
   review:backup=>reviewImport(read(),parseExport(JSON.stringify(backup))),
   restore:(backup,expected)=>update(data=>{
    const checked=parseExport(JSON.stringify(backup)),review=reviewImport(data,checked);
    if(review.fingerprint!==expected)throw Error('Saved data changed after your review. Review the file again before saving.');
    if(review.conflicts.length)throw Error('Conflicts must be resolved in the backup before it can be imported. Nothing was replaced.');
    if(!review.existing)data.profiles.push(structuredClone(checked.profile));
    data.sessions.unshift(...structuredClone(review.newSessions));
    return {added:review.newSessions.length,duplicates:review.duplicates};
   }),
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
 root.FlightProfileStore={KEY,create,validate,parseExport};
})(globalThis);
