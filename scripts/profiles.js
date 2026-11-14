// Learner ownership and UI adapters; the tested question, speech and scoring engine remains shared.
(function(){
'use strict';
const $=id=>document.getElementById(id),esc=escapeHTML;
const previous=history.slice(),previousReadable=historyReadable;
let active=null,viewing=null,guest=[],store=null,storeError='',family={version:1,profiles:[],sessions:[]};
// Disposable per-browser preferences are separate from learner/results backups.
const quickPrefix='fact-flight-quick-v1:',quickMemory=new Map();
let quickWarning='';
function validQuick(q){return q&&q.version===1&&Object.hasOwn(FactFlightMath.activities,q.activity)&&Number.isInteger(q.level)&&q.level>=0&&q.level<=4&&[5,10,15,20].includes(q.count)&&['keypad','voice'].includes(q.input)&&['focus','worksheet'].includes(q.view)&&(q.target===''||(typeof q.target==='string'&&/^\d+$/.test(q.target)&&Number(q.target)>=1&&Number(q.target)<=q.count))}
function quickChoice(){
 if(!active||!hasSelection())return null;
 let q=quickMemory.get(active);
 if(active!=='guest'&&!q)try{q=JSON.parse(localStorage.getItem(quickPrefix+active))||q}catch{}
 return validQuick(q)?structuredClone(q):null;
}
function rememberQuick(q){
 if(!active||!hasSelection()||!validQuick(q))return;
 quickMemory.set(active,structuredClone(q));quickWarning='';
 if(active!=='guest')try{localStorage.setItem(quickPrefix+active,JSON.stringify(q));quickMemory.delete(active)}catch{quickWarning='Quick Practice choices could not be saved for next time. You can still practice.'}
}
const unsaved=new Map(),saveStates=new Map(),pendingWrites=new Map();
let deleteTarget=null,managementMessage="",importCandidate=null,importReview=null;
try{store=FlightProfileStore.create(localStorage,navigator.locks);family=store.read()}catch(e){storeError=e.message}
function refresh(){try{if(!store)throw Error('Browser storage is unavailable.');family=store.read();storeError=''}catch(e){storeError=e.message}return family}
function name(id){return id==='guest'?'Guest':id==='previous'?'Previous progress':family.profiles.find(p=>p.id===id)?.name||'Learner'}
function records(id){if(id==='guest')return guest;if(id==='previous')return previous;refresh();const saved=family.sessions.filter(s=>s.learnerId===id);return [...unsaved.values()].filter(s=>s.learnerId===id&&!saved.some(r=>r.id===s.id)).concat(saved).sort((a,b)=>new Date(b.date)-new Date(a.date))}
function select(id){if(busy()){requestSessionExit();return}if(id!=='guest'&&!refresh().profiles.some(p=>p.id===id))return;guest=[];quickMemory.delete('guest');quickWarning='';active=id;viewing=id;history=records(id);session=null;storageOK=true;FlightMenu.home()}
function change(){if(busy()){requestSessionExit();return}guest=[];quickMemory.delete('guest');quickWarning='';active=null;viewing=null;history=[];session=null;FlightMenu.home()}
function tile(p,stats=false){return `<button class="learner" ${stats?'data-profile-stats':'data-learner'}="${esc(p.id)}"><span class="avatar" aria-hidden="true">${esc(p.name.slice(0,1).toUpperCase())}</span><strong>${esc(p.name)}</strong><span>${stats?'See results':'Tap to start'}</span></button>`}
function entry(){refresh();return `<section class="learner-entry"><div class="eyebrow">Your learning space</div><div class="accent-line"></div><h1>Who's ready to take flight?</h1><p class="intro">Pick a learner, or jump in as a guest.<br>No sign-in, no fuss.</p>${storeError?`<p class="notice" role="alert">${esc(storeError)} You can still practice as Guest.</p>`:''}<div class="learners">${family.profiles.map(p=>tile(p)).join('')}<button class="learner outline" data-create-profile ${storeError?'disabled':''}><span class="avatar" aria-hidden="true">+</span><strong>Create Profile</strong><span>Nickname only</span></button><button class="learner outline" data-learner="guest"><span class="avatar" aria-hidden="true">☆</span><strong>Continue as Guest</strong><span>Not saved</span></button></div><button class="primary results-link" data-nav="progress">Results & Stats →</button><button class="quiet parent-entry" data-nav="parents">Parent corner</button><p class="family-footer">Free to learn · No account needed · Progress stays in this browser on this device</p></section>`}
function create(){return `<button class="quiet back" data-profile-cancel>← Back</button><div class="profile-form"><span class="avatar" aria-hidden="true">+</span><h1>A little space of your own.</h1><p>Create a learner profile. No email or password needed.</p><form id="profileForm"><label for="nickname">What should we call you?</label><p id="nicknameHelp">A nickname is enough. You can leave this blank.</p><input id="nickname" maxlength="24" autocomplete="off" aria-describedby="nicknameHelp" placeholder="e.g. Sunny"><p>Progress stays in this browser on this device.</p><p id="profileError" role="alert"></p><button class="primary" type="submit">Create profile & explore →</button></form><button class="quiet" data-profile-cancel>Cancel</button></div>`}
function identity(){return `<div class="learner-identity"><div><strong>${esc(name(active))}'s practice</strong><p>${active==='guest'?'Guest · results are not saved':'Your own learning space'}</p></div><button data-change-learner>Change learner</button></div>`}
function picker(){refresh();return `<section class="learner-entry"><div class="eyebrow">Results & Stats</div><h1>Whose progress shall we see?</h1><p>Each learner has their own story.</p>${storeError?`<p class="notice" role="alert">${esc(storeError)}</p>`:''}<div class="learners">${family.profiles.map(p=>tile(p,true)).join('')}${active==='guest'?'<button class="learner outline" data-profile-stats="guest"><span class="avatar">☆</span><strong>Guest</strong><span>Temporary results</span></button>':''}<button class="learner outline" data-profile-stats="previous"><span class="avatar" aria-hidden="true">↶</span><strong>Previous progress</strong><span>Before profiles</span></button></div><p class="family-footer">Results remain separate for each learner.</p></section>`}
function progress(id=active){if(busy()){requestSessionExit();return}if(!id){FlightMenu.profiles('statsPicker');return}viewing=id;history=records(id);renderHistory();show('historyView');window.scrollTo(0,0)}
const engineBegin=begin;
begin=function(){if(!hasSelection(true)){if(phase==='checking')cancelCheck();FlightMenu.home();return}history=records(active);viewing=active;storageOK=true;engineBegin();session.id=crypto.randomUUID();session.learnerId=active==='guest'?null:active;session.learnerName=name(active);if(active==='guest')session.guest=true;};
// Engine finish retains its synchronous lifecycle. Durable writes run under a cross-tab lock.
saveSession=function(record){
 if(record.guest)return;
 const copy=structuredClone(record);unsaved.set(copy.id,copy);saveStates.set(copy.id,'Saving to '+name(copy.learnerId)+'…');
 const writing=Promise.resolve().then(()=>{if(!store)throw Error('Browser storage is unavailable.');return store.save(copy)}).then(()=>{unsaved.delete(copy.id);refresh();saveStates.set(copy.id,'Saved to '+name(copy.learnerId)+' on this browser.')}).catch(e=>{saveStates.set(copy.id,'Could not save: '+e.message+' Export this flight before closing.');}).finally(()=>{if($('resultsView').dataset.sessionId===copy.id){const status=$('profileSaveStatus');if(status)status.textContent=saveStates.get(copy.id)}if(session?.id===copy.id)$('saveStatus').textContent=saveStates.get(copy.id);pendingWrites.delete(copy.id)});
 pendingWrites.set(copy.id,writing);
};
const engineResult=renderResult;
renderResult=function(s){
 storageOK=true;engineResult(s);$('resultsView').dataset.sessionId=String(s.id);
 const note=document.createElement('p');note.id='profileSaveStatus';note.setAttribute('role','status');note.textContent=s.guest?'Guest results are temporary and are not saved. They clear on reload or Change learner.':(unsaved.has(s.id)?saveStates.get(s.id):null)||(s.learnerId?'Saved for '+(family.profiles.some(p=>p.id===s.learnerId)?name(s.learnerId):s.learnerName||'Learner')+'.':'Previous progress · kept separate from learner profiles.');$('resultsView').querySelector('h1').after(note);
 if(s.guest)$('exportOne').remove();
 else if(s.learnerId){$('exportOne').textContent='Export learner backup JSON';$('exportOne').onclick=()=>backupFromReport(s.learnerId,s)}
 else $('exportOne').textContent='Export previous flight archive JSON';
 if((s.learnerId||'previous')!==active&&!s.guest)$('again').remove();
 $('seeProgress').textContent=s.guest?'Guest results':'See learner progress';$('seeProgress').onclick=()=>progress(s.guest?'guest':s.learnerId||'previous');
 $('saveStatus').textContent=s.guest?'Guest · not saved':note.textContent;
};
const engineHistory=renderHistory;
renderHistory=function(activity=null){engineHistory(activity);const label=document.createElement('p');label.className='learner-report-label';label.textContent=name(viewing)+(viewing==='guest'?' · Temporary results, not saved':' · Results & Stats');$('historyView').prepend(label);const choose=document.createElement('button');choose.textContent='Choose learner results';choose.onclick=()=>FlightMenu.profiles('statsPicker');$('historyView').querySelector('.controls').prepend(choose);
 if(viewing==='guest'){$('exportAll').remove();$('exportCSV').remove();$('historyView').lastElementChild.textContent='Guest results clear on reload or Change learner. To save future flights, use Change learner → Create Profile before starting.'}
 else if(viewing==='previous'&&!previousReadable){$('historyView').insertAdjacentHTML('afterbegin','<p role="alert">Previous history could not be read. Original data has not been changed.</p>')}
 else if(viewing==='previous'){$('exportAll').textContent='Export previous history archive JSON';$('historyView').lastElementChild.textContent+=' Previous progress archives cannot be restored with Import learner.'}
 else {const owner=viewing;$('exportAll').textContent='Export learner backup JSON';$('exportAll').onclick=()=>backupFromReport(owner);$('historyView').lastElementChild.textContent+=' JSON backup includes all of this learner’s flights, including unsaved results, and restores through Manage learners → Import learner.'}
};
$('menuView').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;if('learner'in d)select(d.learner);if('createProfile'in d)FlightMenu.profiles('createProfile');if('changeLearner'in d)change();if('profileCancel'in d)FlightMenu.home();if('profileStats'in d)progress(d.profileStats)});
$('menuView').addEventListener('submit',async e=>{if(e.target.id!=='profileForm')return;e.preventDefault();const form=e.target,button=form.querySelector('button'),value=$('nickname').value;button.disabled=true;try{const p=await store.add(value);refresh();select(p.id)}catch(err){if(form.isConnected){$('profileError').textContent=err.message;button.disabled=false}}});

function hasSelection(force=false){
 if(active&&active!=='guest'&&(!busy()||force)){refresh();if(!storeError&&!family.profiles.some(p=>p.id===active)){active=null;viewing=null;history=[];session=null}}
 return active!==null;
}
function manage(){
 refresh();return `<button class="quiet back" data-nav="parents">← Parent corner</button><h1>Manage learners</h1><p>Change a learner’s name, export, restore, or remove their profile in this browser.</p><p class="notice">Export before deleting if you want to keep a copy. You can restore a Manage learners JSON export using Import learner.</p><button class="primary" data-nav="importLearner">Import learner →</button><p id="managementStatus" role="status">${esc(managementMessage||storeError)}</p><div class="manage-list">${family.profiles.map(p=>{const count=records(p.id).length;return `<section class="manage-learner"><div><h2>${esc(p.name)}</h2><p>${count} flight${count===1?'':'s'}${active===p.id?' · Current learner':''}</p></div><div class="manage-actions"><button data-rename-profile="${esc(p.id)}" ${storeError?'disabled':''}>Change Learner Name</button><button data-export-profile="${esc(p.id)}" ${storeError?'disabled':''}>Export results JSON</button><button data-delete-profile="${esc(p.id)}" ${storeError?'disabled':''}>Delete profile…</button></div></section>`}).join('')||'<p>No learner profiles yet.</p>'}</div><p>Other learners and Previous progress are kept separate.</p>`;
}
function backupFromReport(id,recovery=null){
 try{exportProfile(id)}catch(e){
  // A profile deleted in another tab must not strand an unsaved flight or be recreated automatically.
  if(recovery&&unsaved.has(recovery.id)){
   const profile={id,name:recovery.learnerName||'Learner'},sessions=[...unsaved.values()].filter(s=>s.learnerId===id);
   download(`fact-flight-recovery-${id}.json`,JSON.stringify({format:'fact-flight-learner-export',version:1,exportedAt:new Date().toISOString(),profile,sessions},null,2),'application/json');
   $('profileSaveStatus').textContent='Recovery backup exported with unsaved flights only. Saved learner data could not be read; it has not been changed.';return;
  }
  const note=document.createElement('p');note.setAttribute('role','alert');note.textContent='Could not export backup: '+e.message;$( $('resultsView').classList.contains('hidden')?'historyView':'resultsView').append(note);
 }
}
function exportProfile(id){
 if(busy())return;refresh();if(storeError)throw Error(storeError);const profile=family.profiles.find(p=>p.id===id);if(!profile)throw Error('This learner no longer exists. Refresh the list.');
 download(`fact-flight-learner-${profile.id}.json`,JSON.stringify({format:'fact-flight-learner-export',version:1,exportedAt:new Date().toISOString(),profile,sessions:records(id)},null,2),'application/json');
}
const deleteDialog=document.createElement('dialog');deleteDialog.id='deleteLearnerDialog';deleteDialog.setAttribute('aria-labelledby','deleteLearnerTitle');
deleteDialog.innerHTML=`<h2 id="deleteLearnerTitle">Delete learner?</h2><p id="deleteLearnerSummary"></p><p>This permanently removes the profile and its results from this browser. Other learners and Previous progress stay untouched.</p><p>Export a copy first if needed. A Manage learners JSON export can be restored using Import learner.</p><button id="exportBeforeDelete">Export results JSON</button><p id="deleteLearnerError" role="alert"></p><div class="controls"><button id="cancelDeleteLearner" autofocus>Keep learner</button><button id="confirmDeleteLearner">Delete profile & results</button></div>`;
document.body.append(deleteDialog);
async function confirmDeletion(id){
 if(busy()){requestSessionExit();return}
 await Promise.all([...pendingWrites.entries()].filter(([key])=>unsaved.get(key)?.learnerId===id).map(([,promise])=>promise));
 refresh();if(storeError)throw Error(storeError);const profile=family.profiles.find(p=>p.id===id);if(!profile)throw Error('This learner no longer exists. Refresh the list.');
 deleteTarget={id,snapshot:store.snapshot(family,id),name:profile.name};
 const rows=records(id);$('deleteLearnerTitle').textContent=`Delete ${profile.name}?`;$('deleteLearnerSummary').textContent=`${rows.length} flight${rows.length===1?'':'s'} will be removed, including any unsaved results for this learner in this tab.`;
 $('deleteLearnerError').textContent='';$('confirmDeleteLearner').disabled=false;deleteDialog.showModal();$('cancelDeleteLearner').focus();
}
$('exportBeforeDelete').onclick=()=>{try{if(deleteTarget)exportProfile(deleteTarget.id)}catch(e){$('deleteLearnerError').textContent=e.message}};
$('cancelDeleteLearner').onclick=()=>deleteDialog.close();
$('confirmDeleteLearner').onclick=async()=>{
 if(!deleteTarget||busy())return;const target=deleteTarget;$('confirmDeleteLearner').disabled=true;
 try{
  await store.remove(target.id,target.snapshot);
  quickMemory.delete(target.id);let preferenceWarning='';try{localStorage.removeItem(quickPrefix+target.id)}catch{preferenceWarning=' Quick Practice preferences could not be cleared.'}
  for(const [id,record] of unsaved)if(record.learnerId===target.id){unsaved.delete(id);saveStates.delete(id)}
  if(active===target.id){active=null;session=null}if(viewing===target.id){viewing=null;history=[]}if(session?.learnerId===target.id)session=null;
  // Remove stale rendered copies from this tab after the confirmed deletion.
  $('resultsView').replaceChildren();$('historyView').replaceChildren();
  refresh();managementMessage=`${target.name} and their results were deleted.${preferenceWarning}`;deleteDialog.close();deleteTarget=null;FlightMenu.profiles('manageLearners');
 }catch(e){$('deleteLearnerError').textContent=e.message;$('confirmDeleteLearner').disabled=false}
};
$('menuView').addEventListener('click',async e=>{const button=e.target.closest('button');if(!button||button.disabled)return;
 try{if(button.dataset.exportProfile)exportProfile(button.dataset.exportProfile);if(button.dataset.deleteProfile)await confirmDeletion(button.dataset.deleteProfile)}catch(err){if($('managementStatus'))$('managementStatus').textContent=err.message}
});


function importStart(){
 importCandidate=null;importReview=null;
 return `<button class="quiet back" data-nav="manageLearners">← Manage learners</button><h1>Import a learner</h1><p>Choose a learner backup from Results, Progress, or Manage learners.</p><div class="profile-form"><label for="learnerImportFile">Learner backup file</label><input id="learnerImportFile" type="file" accept=".json,application/json"><p id="importFileStatus" role="status"></p><p>You will review the learner and flight counts before saving. The file stays on this device.</p><p>CSV, previous-history archives, and older single-flight or Progress-array exports are not supported by this importer.</p></div>`;
}
async function prepareReview(stillCurrent=()=>true){
 await Promise.all(pendingWrites.values());
 if(!stillCurrent())return;
 if(unsaved.size)throw Error('Some flights in this tab have not saved. Export those results before reloading and importing a learner.');
 if(!store)throw Error('Browser storage is unavailable.');
 importReview=store.review(importCandidate);FlightMenu.profiles('reviewImport');
}
function reviewScreen(){
 if(!importCandidate||!importReview)return importStart();
 const r=importReview,blocked=r.conflicts.length>0,nothing=r.existing&&r.newSessions.length===0;
 return `<button class="quiet back" data-nav="importLearner">← Choose another file</button><h1>Review learner import</h1><section class="profile-form"><h2>${esc(r.currentName||importCandidate.profile.name)}</h2>${r.nameChanged?`<p class="notice">This profile already exists as ${esc(r.currentName)}. The backup uses the name ${esc(importCandidate.profile.name)}. Your current learner name will be kept.</p>`:''}<p>${r.existing?'Add new flights to the existing learner with this ID.':'Restore this learner as a separate profile.'}</p>${r.sameName?'<p class="notice">Another learner has the same name but a different ID. These profiles will stay separate.</p>':''}<dl class="import-counts"><div><dt>New flights</dt><dd>${r.newSessions.length}</dd></div><div><dt>Duplicate flights skipped</dt><dd>${r.duplicates}</dd></div><div><dt>Conflicts</dt><dd>${r.conflicts.length}</dd></div></dl>${blocked?`<p role="alert">Import is blocked. Existing data will not be overwritten. Choose a backup without these conflicts.</p><ul class="import-conflicts">${r.conflicts.map(c=>`<li>${esc(c.reason)}<br><small>Record ID: ${esc(c.id)}</small></li>`).join('')}</ul>`:''}<p>Other learners and Previous progress will remain unchanged.</p>${nothing&&!blocked?'<p class="notice" role="status"><strong>Profile already exists.</strong> All flights in this backup are already saved. Nothing needs to be added.</p>':''}<p id="importSaveStatus" role="alert"></p><div class="manage-actions"><button data-nav="manageLearners">Cancel</button><button data-review-import>Review again</button><button class="primary" data-confirm-import ${blocked||nothing?'disabled':''}>${nothing&&!blocked?'Already imported':r.existing?'Import new flights':'Restore learner'}</button></div></section>`;
}
$('menuView').addEventListener('change',async e=>{
 if(e.target.id!=='learnerImportFile')return;const input=e.target,file=input.files[0];if(!file)return;
 try{
  if(file.size>20*1024*1024)throw Error('This file is too large. Choose a learner JSON export smaller than 20 MB.');
  $('importFileStatus').textContent='Reading backup…';const text=await file.text();if(!input.isConnected)return;
  importCandidate=FlightProfileStore.parseExport(text);await prepareReview(()=>input.isConnected);
 }catch(err){importCandidate=null;importReview=null;if(input.isConnected)$('importFileStatus').textContent=err.message}
});
$('menuView').addEventListener('click',async e=>{
 const button=e.target.closest('button');if(!button||button.disabled)return;
 if('reviewImport'in button.dataset){try{await prepareReview(()=>button.isConnected)}catch(err){if($('importSaveStatus'))$('importSaveStatus').textContent=err.message}return}
 if(!('confirmImport'in button.dataset)||!importCandidate||!importReview||busy())return;
 button.disabled=true;const candidate=importCandidate,review=importReview;
 try{
  if(unsaved.size)throw Error('Some flights have not saved. Export those results before importing.');
  const restored=await store.restore(candidate,review.fingerprint);
  refresh();managementMessage=`${candidate.profile.name}: ${restored.added} flights imported; ${restored.duplicates} duplicates skipped.`;
  importCandidate=null;importReview=null;FlightMenu.profiles('manageLearners');
 }catch(err){if($('importSaveStatus'))$('importSaveStatus').textContent=err.message;/* Require another review after failure. */}
});


let renameTarget=null;
const renameDialog=document.createElement('dialog');renameDialog.id='renameLearnerDialog';renameDialog.setAttribute('aria-labelledby','renameLearnerTitle');
renameDialog.innerHTML=`<h2 id="renameLearnerTitle">Change Learner Name</h2><form id="renameLearnerForm"><label for="renameLearnerName">Learner nickname</label><input id="renameLearnerName" maxlength="24" required autocomplete="off" aria-describedby="renameLearnerHelp"><p id="renameLearnerHelp">A nickname is enough. Changing it keeps all of this learner’s progress.</p><p id="renameLearnerError" role="alert"></p><div class="controls"><button type="button" id="cancelRenameLearner">Cancel</button><button class="primary" type="submit" id="saveLearnerName">Save name</button></div></form>`;
document.body.append(renameDialog);
function openRename(id){
 if(busy()){requestSessionExit();return}refresh();if(storeError)throw Error(storeError);const profile=family.profiles.find(p=>p.id===id);if(!profile)throw Error('This learner no longer exists. Refresh the list.');
 renameTarget={id,name:profile.name};$('renameLearnerName').value=profile.name;$('renameLearnerError').textContent='';$('saveLearnerName').disabled=false;renameDialog.showModal();$('renameLearnerName').focus();$('renameLearnerName').select();
}
$('cancelRenameLearner').onclick=()=>renameDialog.close();
$('renameLearnerForm').onsubmit=async e=>{
 e.preventDefault();if(!renameTarget||busy())return;const target=renameTarget,value=$('renameLearnerName').value;$('saveLearnerName').disabled=true;
 try{const profile=await store.rename(target.id,value,target.name);refresh();managementMessage=`Learner name changed to ${profile.name}. Their progress is unchanged.`;renameDialog.close();renameTarget=null;FlightMenu.profiles('manageLearners')}
 catch(err){$('renameLearnerError').textContent=err.message;$('saveLearnerName').disabled=false}
};
$('menuView').addEventListener('click',e=>{const button=e.target.closest('[data-rename-profile]');if(!button||button.disabled)return;try{openRename(button.dataset.renameProfile)}catch(err){if($('managementStatus'))$('managementStatus').textContent=err.message}});

window.FlightProfiles={quickChoice,rememberQuick,quickWarning:()=>quickWarning,entry,create,identity,picker,progress,manage,importStart,reviewScreen,hasSelection,isGuest:()=>active==='guest'};
history=[];
})();
