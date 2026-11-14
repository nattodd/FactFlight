// Learner ownership and UI adapters; the tested question, speech and scoring engine remains shared.
(function(){
'use strict';
const $=id=>document.getElementById(id),esc=escapeHTML;
const previous=history.slice(),previousReadable=historyReadable;
let active=null,viewing=null,guest=[],store=null,storeError='',family={version:1,profiles:[],sessions:[]};
const unsaved=new Map(),saveStates=new Map(),pendingWrites=new Map();
let deleteTarget=null,managementMessage="";
try{store=FlightProfileStore.create(localStorage,navigator.locks);family=store.read()}catch(e){storeError=e.message}
function refresh(){try{if(!store)throw Error('Browser storage is unavailable.');family=store.read();storeError=''}catch(e){storeError=e.message}return family}
function name(id){return id==='guest'?'Guest':id==='previous'?'Previous progress':family.profiles.find(p=>p.id===id)?.name||'Learner'}
function records(id){if(id==='guest')return guest;if(id==='previous')return previous;refresh();const saved=family.sessions.filter(s=>s.learnerId===id);return [...unsaved.values()].filter(s=>s.learnerId===id&&!saved.some(r=>r.id===s.id)).concat(saved).sort((a,b)=>new Date(b.date)-new Date(a.date))}
function select(id){if(busy()){requestSessionExit();return}if(id!=='guest'&&!refresh().profiles.some(p=>p.id===id))return;guest=[];active=id;viewing=id;history=records(id);session=null;storageOK=true;FlightMenu.home()}
function change(){if(busy()){requestSessionExit();return}guest=[];active=null;viewing=null;history=[];session=null;FlightMenu.home()}
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
 const writing=Promise.resolve().then(()=>{if(!store)throw Error('Browser storage is unavailable.');return store.save(copy)}).then(()=>{unsaved.delete(copy.id);saveStates.set(copy.id,'Saved to '+name(copy.learnerId)+' on this browser.');refresh()}).catch(e=>{saveStates.set(copy.id,'Could not save: '+e.message+' Export this flight before closing.');}).finally(()=>{if($('resultsView').dataset.sessionId===copy.id){const status=$('profileSaveStatus');if(status)status.textContent=saveStates.get(copy.id)}if(session?.id===copy.id)$('saveStatus').textContent=saveStates.get(copy.id);pendingWrites.delete(copy.id)});
 pendingWrites.set(copy.id,writing);
};
const engineResult=renderResult;
renderResult=function(s){
 storageOK=true;engineResult(s);$('resultsView').dataset.sessionId=String(s.id);
 const note=document.createElement('p');note.id='profileSaveStatus';note.setAttribute('role','status');note.textContent=s.guest?'Guest results are temporary and are not saved. They clear on reload or Change learner.':saveStates.get(s.id)||(s.learnerId?'Saved for '+(s.learnerName||name(s.learnerId))+'.':'Previous progress · kept separate from learner profiles.');$('resultsView').querySelector('h1').after(note);
 if(s.guest)$('exportOne').remove();
 if((s.learnerId||'previous')!==active&&!s.guest)$('again').remove();
 $('seeProgress').textContent=s.guest?'Guest results':'See learner progress';$('seeProgress').onclick=()=>progress(s.guest?'guest':s.learnerId||'previous');
 $('saveStatus').textContent=s.guest?'Guest · not saved':saveStates.get(s.id)||note.textContent;
};
const engineHistory=renderHistory;
renderHistory=function(activity=null){engineHistory(activity);const label=document.createElement('p');label.className='learner-report-label';label.textContent=name(viewing)+(viewing==='guest'?' · Temporary results, not saved':' · Results & Stats');$('historyView').prepend(label);const choose=document.createElement('button');choose.textContent='Choose learner results';choose.onclick=()=>FlightMenu.profiles('statsPicker');$('historyView').querySelector('.controls').prepend(choose);
 if(viewing==='guest'){$('exportAll').remove();$('exportCSV').remove();$('historyView').lastElementChild.textContent='Guest results clear on reload or Change learner. To save future flights, use Change learner → Create Profile before starting.'}
 else if(viewing==='previous'&&!previousReadable){$('historyView').insertAdjacentHTML('afterbegin','<p role="alert">Previous history could not be read. Original data has not been changed.</p>')}
 else {$('exportAll').textContent=viewing==='previous'?'Export previous history JSON':'Export learner history JSON'}
};
$('menuView').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;if('learner'in d)select(d.learner);if('createProfile'in d)FlightMenu.profiles('createProfile');if('changeLearner'in d)change();if('profileCancel'in d)FlightMenu.home();if('profileStats'in d)progress(d.profileStats)});
$('menuView').addEventListener('submit',async e=>{if(e.target.id!=='profileForm')return;e.preventDefault();const form=e.target,button=form.querySelector('button'),value=$('nickname').value;button.disabled=true;try{const p=await store.add(value);refresh();select(p.id)}catch(err){if(form.isConnected){$('profileError').textContent=err.message;button.disabled=false}}});

function hasSelection(force=false){
 if(active&&active!=='guest'&&(!busy()||force)){refresh();if(!storeError&&!family.profiles.some(p=>p.id===active)){active=null;viewing=null;history=[];session=null}}
 return active!==null;
}
function manage(){
 refresh();return `<button class="quiet back" data-nav="parents">← Parent corner</button><h1>Manage learners</h1><p>Export a learner’s results or remove their profile from this browser.</p><p class="notice">Deletion cannot be undone here. Export first if you want to keep a copy. Backup import/restore is not available yet.</p><p id="managementStatus" role="status">${esc(managementMessage||storeError)}</p><div class="manage-list">${family.profiles.map(p=>{const count=records(p.id).length;return `<section class="manage-learner"><div><h2>${esc(p.name)}</h2><p>${count} flight${count===1?'':'s'}${active===p.id?' · Current learner':''}</p></div><div class="manage-actions"><button data-export-profile="${esc(p.id)}" ${storeError?'disabled':''}>Export results JSON</button><button data-delete-profile="${esc(p.id)}" ${storeError?'disabled':''}>Delete profile…</button></div></section>`}).join('')||'<p>No learner profiles yet.</p>'}</div><p>Other learners and Previous progress are kept separate.</p>`;
}
function exportProfile(id){
 if(busy())return;refresh();if(storeError)throw Error(storeError);const profile=family.profiles.find(p=>p.id===id);if(!profile)throw Error('This learner no longer exists. Refresh the list.');
 download(`fact-flight-learner-${profile.id}.json`,JSON.stringify({format:'fact-flight-learner-export',version:1,exportedAt:new Date().toISOString(),profile,sessions:records(id)},null,2),'application/json');
}
const deleteDialog=document.createElement('dialog');deleteDialog.id='deleteLearnerDialog';deleteDialog.setAttribute('aria-labelledby','deleteLearnerTitle');
deleteDialog.innerHTML=`<h2 id="deleteLearnerTitle">Delete learner?</h2><p id="deleteLearnerSummary"></p><p>This permanently removes the profile and its results from this browser. Other learners and Previous progress stay untouched.</p><p>Export a copy first if needed. Import/restore is not available yet.</p><button id="exportBeforeDelete">Export results JSON</button><p id="deleteLearnerError" role="alert"></p><div class="controls"><button id="cancelDeleteLearner" autofocus>Keep learner</button><button id="confirmDeleteLearner">Delete profile & results</button></div>`;
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
  for(const [id,record] of unsaved)if(record.learnerId===target.id){unsaved.delete(id);saveStates.delete(id)}
  if(active===target.id){active=null;session=null}if(viewing===target.id){viewing=null;history=[]}if(session?.learnerId===target.id)session=null;
  // Remove stale rendered copies from this tab after the confirmed deletion.
  $('resultsView').replaceChildren();$('historyView').replaceChildren();
  refresh();managementMessage=`${target.name} and their results were deleted.`;deleteDialog.close();deleteTarget=null;FlightMenu.profiles('manageLearners');
 }catch(e){$('deleteLearnerError').textContent=e.message;$('confirmDeleteLearner').disabled=false}
};
$('menuView').addEventListener('click',async e=>{const button=e.target.closest('button');if(!button||button.disabled)return;
 try{if(button.dataset.exportProfile)exportProfile(button.dataset.exportProfile);if(button.dataset.deleteProfile)await confirmDeletion(button.dataset.deleteProfile)}catch(err){if($('managementStatus'))$('managementStatus').textContent=err.message}
});

window.FlightProfiles={entry,create,identity,picker,progress,manage,hasSelection,isGuest:()=>active==='guest'};
history=[];
})();
