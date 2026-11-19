// Guided menus adapt choices to the existing session engine; profiles own storage and learner UI.
(function(){

const $=id=>document.getElementById(id);

const activities={
 addition:{name:'Addition',icon:'+',desc:'Put numbers together',levels:['Sums to 5','Sums to 10','Sums to 20','Two-digit sums','Bigger sums'],examples:['2 + 3','4 + 6','8 + 7','24 + 37','684 + 78'],scope:['Sums within 5','Sums within 10','Sums within 20','Both numbers 10–99','One number 100–999, one 10–99']},
 subtraction:{name:'Subtraction',icon:'−',desc:'Find what is left',levels:['Take from 5','Take from 10','Take from 20','Two-digit numbers','Bigger numbers'],examples:['5 − 2','9 − 4','18 − 7','63 − 24','732 − 86'],scope:['Subtract within 5','Subtract within 10','Subtract within 20','Start with 20–99; subtract 10–99','Start with 100–999; subtract 10–99']},
 multiplication:{name:'Multiplication',icon:'×',desc:'Explore times tables',levels:['2, 5 & 10','Tables to 10','Tables to 12','Tables 13–20','Bigger numbers'],examples:['2 × 4','7 × 8','12 × 9','16 × 7','47 × 8'],scope:['2/5/10 tables × 1–10','2–10 tables × 1–10','2–12 tables × 1–12','13–20 × 2–12','21–99 × 2–12']},
 division:{name:'Division',icon:'÷',desc:'Share into equal groups',levels:['2, 5 & 10','Divide by 2–10','Divide by 2–12','Bigger answers','Biggest answers'],examples:['10 ÷ 2','56 ÷ 7','108 ÷ 9','112 ÷ 7','564 ÷ 6'],scope:['Divisors 2/5/10; answers 1–10','Divisors 2–10; answers 1–10','Divisors 2–12; answers 1–12','Divisors 2–12; answers 13–20','Divisors 2–12; answers 21–99']},
 bonds:{name:'Number bonds',icon:'◡',desc:'Find the missing piece',levels:['Make 5','Make 10','Make 20','Make 100','Make 1,000'],examples:['2 + ? = 5','6 + ? = 10','8 + ? = 20','35 + ? = 100','375 + ? = 1000'],scope:['Parts of 5','Parts of 10','Parts of 20','Parts 10–90','Parts 100–900']},
 doubles:{name:'Doubles',icon:'2×',desc:'Twice as many',levels:['Double to 5','Double to 10','Double to 20','Two-digit numbers','Three-digit numbers'],examples:['Double 3','Double 8','Double 16','Double 47','Double 675'],scope:['Double 0–5','Double 0–10','Double 0–20','Double 21–99','Double 100–999']},
 halves:{name:'Halves',icon:'½',desc:'Split into two equal parts',levels:['Halve to 10','Halve to 20','Halve to 40','Bigger numbers','Biggest numbers'],examples:['Half of 6','Half of 18','Half of 32','Half of 94','Half of 1350'],scope:['Even numbers 0–10','Even numbers 0–20','Even numbers 0–40','Even numbers 42–198','Even numbers 200–1,998']},
 squares:{name:'Squares',icon:'n²',desc:'A number times itself',levels:['Numbers 1–5','Numbers 1–10','Numbers 1–12','Numbers 13–20','Numbers 21–50'],examples:['3²','8²','12²','17²','47²'],scope:['Bases 1–5','Bases 1–10','Bases 1–12','Bases 13–20','Bases 21–50']}
};
const modes={quick:['Quick Practice','A little practice','5, 10, 15 or 20 questions. No clock.','⚡'],free:['Free Practice','Take your time','Keep going. No question limit or clock to beat. Finish when you like.','∞'],timed:['Timed Practice','Find your rhythm','Choose your questions and 1, 2 or 5 minutes.','◷'],test:['Custom Test','See how you’re doing','Choose your questions and time. Review your results.','✓']};
modes.untimed=['Untimed Practice','Take your time','A fixed set with no time limit.','∞'];
let replayNote='',repeatSource=null;const flightChoices=new WeakMap();
function defaultConfig(activity='addition'){return {activity,mode:'quick',level:0,count:5,minutes:2,table:2,input:'keypad',view:matchMedia('(max-width:680px)').matches?'focus':'worksheet',target:'',schoolUntimed:false}}
// One validation boundary for remembered settings and menu launches; results stay unchanged.
function validSelection(c){return c.selection===undefined||c.selection===null||(c.mode!=='school'&&!!FactFlightMath.selectionScope(c.activity,c.selection))}
function chosenValues(c){return c.selection?.tables||c.selection?.families||c.tableChoices||[2]}
function chosenRange(c){return c.selection?.type==='tables'?10:c.selection?.range||c.familyRange||10}
function selectionLabel(c){return c.selection?FactFlightMath.selectionLabel(c.activity,c.selection):'Level '+(c.level+1)}
function setFamilies(values,range=chosenRange(cfg)){cfg.selection=FactFlightMath.makeSelection(cfg.activity,values,range);cfg.tableChoices=values.slice();cfg.familyRange=range;}
function validConfig(c){return !!c&&validSelection(c)&&(c.tableChoices===undefined||(Array.isArray(c.tableChoices)&&(c.tableChoices.length===0||FactFlightMath.validFamilies(c.tableChoices))))&&(c.familyRange===undefined||[10,12].includes(c.familyRange))&&Object.hasOwn(activities,c.activity)&&['quick','free','timed','test','school','untimed'].includes(c.mode)&&Number.isInteger(c.level)&&c.level>=0&&c.level<=4&&(c.mode==='quick'?[5,10,15,20]:[5,10,15,20,30,60]).includes(c.count)&&[1,2,5].includes(c.minutes)&&Number.isInteger(c.table)&&c.table>=2&&c.table<=10&&['keypad','voice'].includes(c.input)&&['focus','worksheet'].includes(c.view)&&(c.schoolUntimed===undefined||typeof c.schoolUntimed==='boolean')&&(c.mode!=='school'||c.activity==='multiplication')&&(c.target===''||(typeof c.target==='string'&&/^\d+$/.test(c.target)&&Number(c.target)>=1&&Number(c.target)<=(['school','free'].includes(c.mode)?60:c.count)))}
function changeMode(mode){if(cfg.mode===mode)return;cfg.mode=mode;if(mode==='school')delete cfg.selection;cfg.schoolUntimed=false;cfg.count=mode==='quick'?5:mode==='test'||mode==='school'||mode==='free'?60:20;cfg.minutes=2;if(Number(cfg.target)>cfg.count)cfg.target=''}
let screen='home',trail=[],quickRoute=false,cfg=defaultConfig();
const navigation=FactFlightActivities;
const drafts=new Map();
// One-flight allowances live only in this tab and are bound to learner + scope.
const focus=FactFlightFocus,esc=escapeHTML;
let focusAllowance=null,focusBypass=false,focusChoices=[];
function focusAllowed(c){return focusAllowance===focus.key(c)}
function focusBlocked(c){return focus.enabled()&&!focusAllowed(c)?focus.mastered(c):[]}
function focusLabel(s){return s.kind==='level'?`Level ${s.level+1}`:s.kind==='school'?`School Test table ${s.table}`:`${s.activity==='division'?'Divisor':'Table'} ${s.families[0]} (through ${s.range})`}
function focusPanel(){
 const ctx=focus.context(),blocked=focusBlocked(cfg);
 if(!ctx.id)return '';
 if(screen==='parents')return `<section class="section focus-parent"><h2>Practice focus · ${esc(ctx.name)}</h2><label class="microphone-restriction"><input id="focusUnmastered" type="checkbox" ${focus.enabled()?'checked':''}> Focus on unmastered practice</label><p>Keep practice choices focused on skills that are not yet ready. A parent can allow review.</p><p>${ctx.id==='guest'?'Guest only: this setting clears on reload or Change learner.':'Applies only to this learner in this browser. It is separate from learner backups.'} Off by default.</p><p class="small">This is a preference, not a PIN lock. Anyone using Parent corner can change it. Mastered means ready under the current practice rule, not proven long-term retention. Missed-fact review stays available.</p><p id="focusSaveStatus" role="status"></p></section>`;
 if(screen==='review')return focus.enabled()?'<p class="notice">Missed-fact review remains available with practice focus on, so your child can revisit recurring mistakes.</p>':'';
 if(!['practice','ready','operations'].includes(screen)||!focus.enabled())return '';
 if(screen==='operations')return '<p class="notice">Practice focus is on. Mastered choices keep their trophies. A parent can choose review below, or turn focus off in Parent corner.</p>';
 return `<section class="focus-notice" aria-label="Practice focus"><p>${blocked.length?`Mastered — parent focus setting: ${blocked.map(focusLabel).map(esc).join(', ')}. Your selection has not been changed.`:focusAllowed(cfg)?'A parent has allowed this flight for review. The focus setting will still apply to the next flight.':'Practice focus is on. Choose an unmastered choice, or ask a parent to allow one flight for review.'}</p>${blocked.length?'<button data-focus-current>Allow this flight for review</button>':''}${blocked.length&&cfg.selection?'<button data-focus-remove>Remove mastered choices</button>':''}<button data-nav="parents">Parent corner</button></section>`;
}
function decorateFocus(){
 focusChoices=[];const host=$('menuView');
 const panel=focusPanel();if(panel){const holder=document.createElement('div');holder.innerHTML=panel;host.querySelector('h1')?.after(holder)}
 for(const b of host.querySelectorAll('[data-activity],[data-level],[data-fact-table],[data-table]')){
  const d=b.dataset;let candidate,ready=false,blocked=false,partial='';
  if(d.activity){const a=focus.activity(d.activity);ready=a.ready;blocked=focus.enabled()&&a.allSelectableReady;partial=a.readyCount?`${a.readyCount} / ${a.total} practice choices mastered`:'';}
  else {candidate={...cfg};if('level'in d){candidate.level=Number(d.level);delete candidate.selection}else if('table'in d){candidate.mode='school';candidate.table=Number(d.table);delete candidate.selection}else{candidate.selection=FactFlightMath.makeSelection(cfg.activity,[Number(d.factTable)],chosenRange(cfg));}ready=focus.mastered(candidate).length>0;blocked=ready&&focus.enabled()&&!focusAllowed(candidate);}
  if(ready){const badge=document.createElement('span');badge.className='menu-trophy'+(d.activity?' activity-status':'');badge.textContent=d.activity?'🏆 Facts mastered':'🏆 Mastered';b.append(badge)}
  else if(partial){const count=document.createElement('span');count.className='sub activity-status';count.textContent=partial;b.append(count)}
  if(!blocked)continue;
  b.classList.add('focus-restricted');
  // A selected restricted family may still be removed deliberately.
  const removing='factTable'in d&&chosenValues(cfg).includes(Number(d.factTable));
  b.setAttribute('aria-disabled',String(!removing));
  const explanation=document.createElement('span');explanation.className='focus-explanation';explanation.id='focusExplanation'+focusChoices.length;explanation.textContent='Mastered — parent focus setting.'+(removing?' Select to remove.':'');b.setAttribute('aria-describedby',explanation.id);
  const wrap=document.createElement('div');wrap.className='focus-choice';b.replaceWith(wrap);wrap.append(b,explanation);
  const allow=document.createElement('button');allow.className='focus-allow';allow.textContent=d.activity?'Choose an activity for review':'Allow this flight for review';allow.dataset.focusChoice=String(focusChoices.length);focusChoices.push(b);wrap.append(allow);
 }
 const q=FlightProfiles.quickChoice(),quick=host.querySelector('[data-quick-start]');if(q&&quick&&focus.mastered(q).length){quick.insertAdjacentHTML('beforeend',' <span class="menu-trophy">🏆</span>');if(focusBlocked(q).length)quick.firstChild.textContent='Review choices → ';}
}
function blockStart(c){
 if(!focusBlocked(c).length)return false;
 // This also handles the engine's alternate start route, not just menu clicks.
 cfg={...cfg,...c};if(c.selection===undefined)delete cfg.selection;
 if(phase==='checking')cancelCheck();else {releaseMicrophone();controls(false);}
 go('ready',false);$('menuView').querySelector('[data-focus-current]')?.focus();return true;
}
function engineConfig(){return {...cfg,activity:$('activity').value==='school'?'multiplication':$('activity').value,mode:$('activity').value==='school'?'school':configuredPracticeType||'untimed',table,level:Number($('level').value),selection:configuredSelection||undefined}}
$('menuView').addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(!focusBypass&&b.getAttribute('aria-disabled')==='true'){e.preventDefault();e.stopImmediatePropagation();return}
 if('focusCurrent'in b.dataset){e.stopImmediatePropagation();focusAllowance=focus.key(cfg);render();$('menuView').querySelector('[data-start],[data-next]')?.focus();return}
 if('focusChoice'in b.dataset){e.stopImmediatePropagation();const choice=focusChoices[Number(b.dataset.focusChoice)];if(!choice)return;const wasRemoval='factTable'in choice.dataset&&chosenValues(cfg).includes(Number(choice.dataset.factTable));if(!wasRemoval){focusBypass=true;try{choice.click()}finally{focusBypass=false}}if(!('activity'in choice.dataset)){focusAllowance=focus.key(cfg);render();$('menuView').querySelector('[data-start],[data-next]')?.focus();}return}
 if('focusRemove'in b.dataset){e.stopImmediatePropagation();const restricted=new Set(focusBlocked(cfg).flatMap(x=>x.families||[]));setFamilies(chosenValues(cfg).filter(n=>!restricted.has(n)));focusAllowance=null;render();return}
},true);
$('menuView').addEventListener('change',e=>{if(e.target.id==='focusUnmastered'){focusAllowance=null;const saved=focus.set(e.target.checked);$('focusSaveStatus').textContent=saved?'Practice focus '+(focus.enabled()?'on.':'off.'):'This preference could not be saved. It applies in this tab only until reload.';}});
window.addEventListener('storage',e=>{if(e.key?.startsWith('fact-flight-focus-v1:')||e.key==='fact-flight-family-v1'){if(!busy()&&['home','operations','practice','ready','parents'].includes(screen)&&!$('menuView').classList.contains('hidden'))render();}});
function resetDrafts(){focusAllowance=null;configuredReview=null;reviewDraft=null;repeatSource=null;drafts.clear();cfg=defaultConfig();replayNote='';quickRoute=false}
function chooseActivity(activity){if(screen==='practice'||screen==='ready')drafts.set(cfg.activity,{...cfg});const quick=FlightProfiles.quickChoice();cfg=drafts.get(activity)||FlightProfiles.practiceChoice(activity)||(quick?.activity===activity?{...defaultConfig(activity),...quick}:defaultConfig(activity));cfg={...cfg};if(quickRoute)changeMode('quick');replayNote=''}
const selected=(a,b)=>a===b?' selected':'';
function positionMenu(target=null){
 const view=$('menuView'),heading=view.querySelector('h1');
 if(target)target.focus({preventScroll:true});else if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}
 if(!matchMedia('(max-width:900px)').matches||!['home','math','operations','mode','practice','ready','review'].includes(screen)){window.scrollTo(0,0);return}
 // Measure after the mobile Back control moves into its action bar.
 syncActions();
 const anchor=view.querySelector('.hero')||heading;
 frameMobileView(view,anchor);
 if(target){const r=target.getBoundingClientRect(),bar=view.querySelector('.bottom-actions.is-docked'),bottom=bar?bar.getBoundingClientRect().top:innerHeight;if(r.bottom>bottom-12)window.scrollBy({top:r.bottom-bottom+12,behavior:'instant'});else if(r.top<12)window.scrollBy({top:r.top-12,behavior:'instant'})}
}
function go(next,remember=true){if(busy()){requestSessionExit();return}releaseMicrophone();show('menuView');if(remember){const trigger=document.activeElement;const attr=[...(trigger?.attributes||[])].find(a=>a.name.startsWith('data-'));trail.push({screen,focus:attr?'['+attr.name+'="'+CSS.escape(attr.value)+'"]':null});}screen=next;render();positionMenu()}
function back(){if(screen==='practice'||screen==='ready'||screen==='mode')drafts.set(cfg.activity,{...cfg});show('menuView');const previous=trail.pop()||'home';screen=typeof previous==='string'?previous:previous.screen;if(screen==='home')resetDrafts();render();const target=typeof previous==='object'&&previous.focus?$('menuView').querySelector(previous.focus):null;positionMenu(target)}
const steps=stage=>`<div class="steps" aria-label="Setup steps">${(quickRoute?['Activity','Your practice','Ready']:['Activity','Mode','Your practice','Ready']).map((s,i)=>`<span class="${s===stage?'current':''}">${i+1} · ${s}</span>`).join('')}</div>`;
const backButton=()=>'<button class="quiet back" data-back>← Back</button>';
const context=()=>`<div class="context"><b>${activities[cfg.activity].name}</b><span class="dot">•</span>${cfg.mode==='school'?'Original School Test':modes[cfg.mode][0]}</div>`;
function quickCard(){const q=FlightProfiles.quickChoice();return `<section class="quick"><div><div class="eyebrow">Just a few questions</div><h2>Quick Practice</h2>${q?`<p>${activities[q.activity].name} · ${selectionLabel(q)} · ${q.count} questions</p><p>${q.input==='voice'?'Voice':'Tap or type'} · ${q.view==='focus'?'Focus':'Worksheet'} · No timer${q.target?' · First-try goal: '+q.target:''}</p>`:'<p>Pick any math activity and a small set. No timer.</p><span class="quick-tag">5 · 10 · 15 · 20 questions</span>'}</div><div class="quick-actions">${q?'<button class="primary launch" data-quick-start>Start again →</button><button data-quick>Change options</button>':'<button class="primary launch" data-quick>Let’s go →</button>'}</div></section>${FlightProfiles.quickWarning()?`<p role="status">${FlightProfiles.quickWarning()}</p>`:''}`}
function loadQuick(q){replayNote='';cfg.schoolUntimed=false;Object.assign(cfg,{activity:q.activity,level:q.level,count:q.count,input:q.input,view:q.view,target:q.target,mode:'quick',selection:q.selection?structuredClone(q.selection):undefined,tableChoices:q.tableChoices?.slice(),familyRange:q.familyRange});drafts.set(q.activity,{...cfg});quickRoute=true}
function comingSoonTile(icon,name,description){const drawings={'123':'<path d="M2 11l4-3v16M2 24h8M12 11c0-4 7-4 7 0 0 4-7 7-7 13h7M23 9h4a3 3 0 0 1 0 6h-2m2 0a4 4 0 0 1 0 8h-4"/>',book:'<path d="M16 8c-4-3-8-3-12-2v19c4-1 8-1 12 2 4-3 8-3 12-2V6c-4-1-8-1-12 2Zm0 0v19"/>',shapes:'<circle cx="10" cy="10" r="6"/><path d="M16 16h12v12H16zM5 26l5-9 5 9Z"/>',clock:'<circle cx="16" cy="16" r="12"/><path d="M16 8v8l6 4"/>'};const art=drawings[icon]?`<svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${drawings[icon]}</svg>`:icon;return `<button class="tile coming-soon" disabled><span class="icon" aria-hidden="true">${art}</span><strong>${name}</strong><span class="sub">${description}</span><span class="badge">Coming Soon</span></button>`}
function home(){if(!FlightProfiles.hasSelection())return FlightProfiles.entry();return `${FlightProfiles.identity()}<div class="hero"><div class="eyebrow">Little practice. Big confidence.</div><h1>Where will you fly today?</h1><p>Pick something to explore. A little practice goes a long way.</p></div>${quickCard()}<h2>Choose your adventure</h2><div class="tiles"><button class="tile available" data-math><span class="icon">＋</span><strong>Math</strong><span class="sub">Eight ways to play with numbers</span><span class="sub">Explore →</span></button>${comingSoonTile("Aa","Letters & Sounds","Explore letters and their sounds")}${comingSoonTile("shapes","Colors & Shapes","Discover colors and shapes")}${comingSoonTile("book","Reading","Explore words and stories")}</div><div class="bottom"><span class="small">Free to learn. No account needed.</span><button data-nav="progress">Results & Stats ↗</button><button class="quiet" data-nav="parents">Parent corner</button></div>`}
function schoolShortcut(){return `<section class="row school"><div><h3>The original School Test</h3><p>Multiplication · 60 facts · 2 minutes · tables 2–10</p></div><button data-school>Choose a table →</button></section>`}
function math(){return `${backButton()}<div class="hero"><div class="eyebrow">Math</div><h1>Explore Math</h1><p>Choose a group to find your practice.</p></div><div class="tiles"><button class="tile" data-operations><span class="icon operations-icon" aria-hidden="true"><svg viewBox="0 0 40 40" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M7 11h10M12 6v10M25 11h10M8 26l8 8M16 26l-8 8M25 30h10"/><circle cx="30" cy="25" r="1" fill="currentColor" stroke="none"/><circle cx="30" cy="35" r="1" fill="currentColor" stroke="none"/></svg></span><strong>Operations & Facts</strong><span class="sub">Addition, subtraction, multiplication and more</span></button>${comingSoonTile("123","Numbers & Counting","Explore numbers and counting")}${comingSoonTile("clock","Time & Clocks","Practice telling the time")}</div><p class="small">Later: Money & Measurement</p>${schoolShortcut()}`}
function operations(){return `${backButton()}${steps('Activity')}<div class="hero"><div class="eyebrow">${quickRoute?'Quick Practice':'Math · Operations & Facts'}</div><h1>What shall we practice?</h1><p>Choose an activity. Trophies show current readiness.</p></div><div class="tiles">${navigation.activityOrder.map(id=>{const a=activities[id];return `<button class="tile" data-activity="${id}"><span class="icon" aria-hidden="true">${a.icon}</span><strong>${a.name}</strong><span class="sub">${a.desc}</span></button>`}).join('')}</div>${quickRoute?'':schoolShortcut()}`}
function modeMenu(){return `${backButton()}${steps('Mode')}<div class="hero"><div class="eyebrow">${activities[cfg.activity].name}</div><h1>How would you like to practice?</h1><p>A little at a time, or a challenge? It’s up to you.</p></div><div class="tiles modes">${Object.entries(modes).filter(([id])=>id!=='untimed').map(([id,m])=>`<button class="tile${selected(cfg.mode,id)}" aria-pressed="${cfg.mode===id}" data-mode="${id}"><span class="icon">${m[3]}</span><strong>${m[0]}</strong><span class="sub">${m[1]}</span><span class="sub">${m[2]}</span></button>`).join('')}</div>${cfg.activity==='multiplication'?`<div class="row school"><div><h3>Practicing for school?</h3><p>The original 60-fact, two-minute multiplication test.</p></div><button class="${selected(cfg.mode,'school')}" aria-pressed="${cfg.mode==='school'}" data-school>School Test →</button></div>`:''}`}
function selectionMenu(){
 const a=activities[cfg.activity],tables=chosenValues(cfg),chosen=!!cfg.selection,division=cfg.activity==='division',supported=['multiplication','division'].includes(cfg.activity),range=chosenRange(cfg);
 const toggle=supported?`<div class="pills section" aria-label="${a.name} selection"><button data-selection="level" aria-pressed="${!chosen}" class="${selected(chosen,false)}">By Level</button><button data-selection="tables" aria-pressed="${chosen}" class="${selected(chosen,true)}">${division?'Choose Divisors':'Choose Tables'}</button></div>`:'';
 if(!chosen)return toggle+`<div class="levels section">${a.levels.map((label,i)=>`<button class="choice${selected(cfg.level,i)}" aria-pressed="${cfg.level===i}" data-level="${i}"><span class="number">Level ${i+1}</span><strong>${label}</strong><span class="example">${a.examples[i]}</span></button>`).join('')}</div><p class="example-note">Selected: ${a.scope[cfg.level]} · whole-number answers</p>`;
 return toggle+`<h2>${division?'Divide by which numbers?':'Which tables?'}</h2><p>Choose one or more ${division?'divisors':'tables'}.</p><div class="pills section table-choices">${Array.from({length:12},(_,i)=>i+1).map(n=>`<button data-fact-table="${n}" aria-pressed="${tables.includes(n)}" class="${selected(tables.includes(n),true)}">${n}</button>`).join('')}</div><h2>${division?'Answer range':'Other factor range'}</h2><div class="pills section" aria-label="${division?'Answer':'Other factor'} range">${[10,12].map(n=>`<button data-family-range="${n}" aria-pressed="${range===n}" class="${selected(range,n)}">1–${n}</button>`).join('')}</div><p role="status">${tables.length?selectionLabel(cfg):'Select at least one '+(division?'divisor':'table')+' to continue.'}</p>${cfg.selection.type==='families'?'<p class="small">Saved results for this selection require Fact Flight v6.3 or later.</p>':''}`;
}
function practice(){const a=activities[cfg.activity],school=cfg.mode==='school';return `${backButton()}${steps('Your practice')}${context()}<h1>${school?'Which times table?':'Pick your challenge.'}</h1><p>${school?'The same school test you know. Pick a table to begin.':['multiplication','division'].includes(cfg.activity)?'Choose a level or pick the families you want to practice.':'Pick what feels right today. Trophies show current readiness.'}</p>${school?`<div class="pills section">${Array.from({length:9},(_,i)=>i+2).map(n=>`<button class="${selected(cfg.table,n)}" aria-pressed="${cfg.table===n}" data-table="${n}">${n}</button>`).join('')}</div>`:selectionMenu()}${cfg.mode==='free'?'<div class="review"><strong>Keep going until you choose Finish</strong><p>No timer and no question limit. Skip moves on; you can review skipped questions afterward.</p></div>':cfg.mode==='school'?`<div class="review"><strong>60 questions · ${cfg.schoolUntimed?'no time limit':'2 minutes'}</strong><p>Finish early if you need to. You can review every answer afterward.</p></div>`:`<section class="section"><h2>How many questions?</h2><div class="pills">${(cfg.mode==='quick'?[5,10,15,20]:[5,10,15,20,30,60]).map(n=>`<button class="${selected(cfg.count,n)}" aria-pressed="${cfg.count===n}" data-count="${n}">${n}</button>`).join('')}</div><p class="small">${['timed','test'].includes(cfg.mode)?'Finish your set or keep going until time runs out.':'No time limit. Take your time.'}</p></section>`}${['timed','test'].includes(cfg.mode)?`<section class="section"><h2>How much time?</h2><div class="pills">${[1,2,5].map(n=>`<button class="${selected(cfg.minutes,n)}" aria-pressed="${cfg.minutes===n}" data-minutes="${n}">${n} ${n===1?'minute':'minutes'}</button>`).join('')}</div><p class="small">The clock starts when you’re ready. Finish early whenever you need to.</p></section>`:''}<div class="footer-action"><p>Next: choose how to answer.</p><button class="primary" data-next ${validSelection(cfg)?'':'disabled'}>Continue →</button></div>`}
function ready(){return `${backButton()}${steps('Ready')}${context()}<h1>Ready for takeoff?</h1><p>Choose how you want to answer.</p>${replayNote?`<p class="notice">${replayNote}</p>`:''}<div class="pair"><button class="tile${selected(cfg.input,'keypad')}" data-input="keypad" aria-pressed="${cfg.input==='keypad'}"><span class="icon">▦</span><strong>Tap or type</strong><span class="sub">Use the number pad or your keyboard.</span></button><button class="tile${selected(cfg.input,'voice')}" data-input="voice" ${microphoneRestricted()?'disabled title="Parent restricted"':''} aria-pressed="${cfg.input==='voice'}"><span class="icon">♪</span><strong>Say it out loud</strong>${microphoneRestricted()?'<span class="sub">Parent restricted</span>':''}<span class="sub">${microphoneRestricted()?'Use Tap or type instead.':'Use your microphone. Say “ready” to begin.'}</span></button></div><section class="section"><h2>How do you want to see it?</h2><div class="pair"><button class="tile${selected(cfg.view,'focus')}" data-view="focus" aria-pressed="${cfg.view==='focus'}"><span class="view-art">[ ? ]</span><strong>One at a time</strong><span class="sub">Focus View · one big, clear question.</span></button><button class="tile${selected(cfg.view,'worksheet')}" data-view="worksheet" aria-pressed="${cfg.view==='worksheet'}"><span class="view-art">☷ ☷ ☷</span><strong>The whole sheet</strong><span class="sub">Worksheet View · see your set of facts.</span></button></div></section><div class="review"><strong>${activities[cfg.activity].name} · ${cfg.mode==='school'?cfg.table+' times table':selectionLabel(cfg)}</strong><p>${cfg.mode==='school'?'Original School Test':modes[cfg.mode][0]} · ${cfg.mode==='free'?'Questions until you finish':(cfg.mode==='school'?60:cfg.count)+' questions'} · ${cfg.mode==='school'?(cfg.schoolUntimed?'no time limit':'2 minutes'):['test','timed'].includes(cfg.mode)?cfg.minutes+' '+(cfg.minutes===1?'minute':'minutes'):'no time limit'}</p></div><details><summary>Grown-up options</summary><label for="target">Optional first-try goal</label><p>Leave blank for no goal. ${cfg.mode==='free'?'Choose a goal from 1 to 60 first-try answers, or leave it blank.':'Choose a number up to your question count, or leave it blank.'}</p><input id="target" type="number" min="1" max="${['school','free'].includes(cfg.mode)?60:cfg.count}" value="${cfg.target}" placeholder="No goal"><p>Use Skip, Undo, or Finish during your flight. ${FlightProfiles.isGuest()?"Guest results are temporary and are not saved.":"Review answers and export your learner results from Progress."}</p></details><div class="footer-action"><p>${cfg.input==='voice'?'Allow the microphone, then say “ready.”':'Your keyboard or number pad is ready.'}</p><button class="primary" data-start>Start ${cfg.mode==='school'?'School Test':cfg.mode==='test'?'test':'practice'} →</button></div>`}
function parents(){return `${backButton()}<div class="hero"><div class="eyebrow">Parent corner</div><h1>A little help for grown-ups.</h1><p>Keep the practice path simple. Keep guidance easy to find.</p></div><button class="primary" data-nav="manageLearners">Manage learners →</button><section class="section"><h2>Microphone privacy</h2><label class="microphone-restriction"><input id="disableMicrophone" type="checkbox" ${microphoneRestricted()?'checked':''}> Disable microphone</label><p>Applies to every learner and Guest in this browser on this device. Voice choices are marked Parent restricted. Tap or type remains available.</p><p class="small">This is not a PIN lock. Anyone with access to Parent corner can change it. Other browsers and cleared website data have separate settings. To block microphone access outside Fact Flight, use your browser or device permissions.</p><p id="microphonePolicyStatus" role="status"></p></section><details open><summary>Microphone help</summary><p>Allow microphone and speech recognition access when your browser asks. During a flight, use Reconnect microphone if listening stops. Browser speech may use an online service. The app stores recognized text with results locally; it does not save audio recordings.</p></details><details><summary>Results and backups</summary><p>Open Progress for activity totals, flight reviews, and JSON/CSV exports. Results stay in this browser unless deliberately exported.</p></details><div class="notice">Profiles save separate progress in this browser. Guest results are temporary and cannot be saved or exported. Change learner before starting to keep future progress.</div>`}
// Presentation only: move existing controls, never clone launch handlers.
const actionMedia=matchMedia('(max-width:900px)');
const actionAreas=new Map();
let actionFrame=0;
function scheduleActions(){if(!actionFrame)actionFrame=requestAnimationFrame(()=>{actionFrame=0;syncActions()})}
function registerActions(view,bar,back=null){
 const old=actionAreas.get(view);old?.observer.disconnect();
 if(old?.back&&old.marker.isConnected)old.marker.replaceWith(old.back);
 view.classList.remove('has-bottom-actions');view.style.removeProperty('--action-height');
 const marker=back?document.createComment('Back button desktop position'):null;
 if(back)back.before(marker);
 bar.classList.add('bottom-actions');bar.setAttribute('role','group');bar.setAttribute('aria-label',view.id==='resultsView'?'Next practice actions':'Practice navigation');
 const observer=new ResizeObserver(scheduleActions);observer.observe(bar);
 actionAreas.set(view,{bar,back,marker,observer});
 scheduleActions();
}
function syncActions(){
 let reserved=0;
 const viewport=window.visualViewport;
 const available=viewport?.height||innerHeight;
 const editing=document.activeElement?.matches('textarea,select,input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit])');
 for(const [view,area] of actionAreas){
  const {bar,back,marker}=area;
  if(!bar.isConnected){area.observer.disconnect();actionAreas.delete(view);view.classList.remove('has-bottom-actions');continue}
  if(back){
   const focused=document.activeElement===back;
   if(actionMedia.matches&&back.parentElement!==bar)bar.prepend(back);
   else if(!actionMedia.matches&&marker.parentNode&&back.parentElement===bar)marker.after(back);
   if(focused)back.focus({preventScroll:true});
  }
  // Keep natural flow for keyboards, pinch zoom, short landscape, or very tall text.
  const mobile=actionMedia.matches&&!view.classList.contains('hidden');
  const height=Math.ceil(bar.getBoundingClientRect().height);
  const fixed=mobile&&!editing&&available>=440&&(!viewport||viewport.scale<=1.05)&&height<=available*.4;
  bar.classList.toggle('is-docked',fixed);
  if(view.classList.contains('has-bottom-actions')!==fixed)view.classList.toggle('has-bottom-actions',fixed);
  view.style.setProperty('--action-height',fixed?height+'px':'0px');
  if(fixed)reserved=height;
 }
 document.documentElement.style.setProperty('--bottom-action-space',reserved+'px');
}
function setupActions(){
 const view=$('menuView');
 if(screen==='review'){registerActions(view,view.querySelector('.footer-action'),view.querySelector('[data-review-back]'));return}
 if(!['math','operations','mode','practice','ready'].includes(screen)){scheduleActions();return}
 let bar=view.querySelector('.footer-action');
 if(!bar){bar=document.createElement('div');bar.className='footer-action back-only';view.append(bar)}
 const summary=document.createElement('div');summary.className='action-summary';
 const school=cfg.mode==='school';
 summary.textContent=screen==='math'?'Math':screen==='operations'?'Operations & Facts':screen==='mode'?activities[cfg.activity].name+' · Choose a mode':
  activities[cfg.activity].name+' · '+(school?'Table '+cfg.table:cfg.selection?(chosenValues(cfg).length?selectionLabel(cfg):'Choose at least one family'):selectionLabel(cfg))+
  ' · '+(cfg.mode==='free'?'Until Finish':(school?60:cfg.count)+' questions')+
  ' · '+(school?(cfg.schoolUntimed?'Untimed':'2 min'):['timed','test'].includes(cfg.mode)?cfg.minutes+' min':'Untimed');
 bar.prepend(summary);
 registerActions(view,bar,view.querySelector('[data-back]'));
}
actionMedia.addEventListener('change',scheduleActions);
window.addEventListener('resize',scheduleActions);
window.visualViewport?.addEventListener('resize',scheduleActions);
window.visualViewport?.addEventListener('scroll',scheduleActions);
document.addEventListener('focusin',scheduleActions);
document.addEventListener('focusout',scheduleActions);
const actionVisibility=new MutationObserver(scheduleActions);
for(const id of ['menuView','resultsView'])actionVisibility.observe($(id),{attributes:true,attributeFilter:['class']});

function render(){$('menuView').dataset.screen=screen;if(focusAllowance&&focusAllowance!==focus.key(cfg))focusAllowance=null;if(microphoneRestricted()){cfg.input='keypad';if(reviewDraft)reviewDraft.input='keypad'}const focused=document.activeElement?.dataset;for(const id of ['homeNav','practiceNav','historyNav'])$(id).removeAttribute('aria-current');$(screen==='home'?'homeNav':'practiceNav').setAttribute('aria-current','page');$('menuView').innerHTML=({home,math,operations,mode:modeMenu,practice,ready,review:reviewReady,parents,createProfile:FlightProfiles.create,statsPicker:FlightProfiles.picker,manageLearners:FlightProfiles.manage,importLearner:FlightProfiles.importStart,reviewImport:FlightProfiles.reviewScreen}[screen])();decorateFocus();setupActions();if(focused){const key=Object.keys(focused).find(k=>['level','count','minutes','table','input','view','factTable','selection','familyRange'].includes(k));if(key)$('menuView').querySelector(`[data-${key==='factTable'?'fact-table':key==='familyRange'?'family-range':key}="${focused[key]}"]`)?.focus({preventScroll:true})}}
$('menuView').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
 if('reviewBack'in d){reviewDraft.back();return}if('reviewStart'in d){startReview();return}
 if(d.reviewInput){reviewDraft.input=d.reviewInput;render();return}if(d.reviewView){reviewDraft.view=d.reviewView;render();return}
 if(d.nav){if(d.nav==='progress'){FlightProfiles.progress();return}if(d.nav==='home'){FlightMenu.home();return}go(d.nav);return}if('back'in d){back();return}
 if('quickStart'in d){const q=FlightProfiles.quickChoice();if(q){loadQuick(q);startFromMenu()}else{quickRoute=true;cfg.mode='quick';cfg.count=5;cfg.target='';go('operations')}return}
 if('quick'in d){replayNote='';const q=FlightProfiles.quickChoice();if(q){loadQuick(q);go('operations')}else{quickRoute=true;cfg.mode='quick';cfg.count=5;cfg.target='';go('operations')}return}if('math'in d){quickRoute=false;go('math');return}
 if('operations'in d){go('operations');return}
 if(d.activity){chooseActivity(d.activity);go(quickRoute?'practice':'mode');return}
 if(d.mode){replayNote='';changeMode(d.mode);go('practice');return}
 if('school'in d){replayNote='';chooseActivity('multiplication');const wasSchool=cfg.mode==='school';changeMode('school');cfg.schoolUntimed=false;if(!wasSchool)cfg.view='worksheet';go('practice');return}
 if(d.selection){if(d.selection==='tables')setFamilies(chosenValues(cfg),chosenRange(cfg));else {cfg.tableChoices=chosenValues(cfg).slice();cfg.familyRange=chosenRange(cfg);delete cfg.selection}render();return}
 if('factTable'in d){const n=Number(d.factTable),values=chosenValues(cfg);setFamilies((values.includes(n)?values.filter(x=>x!==n):[...values,n]).sort((a,b)=>a-b));render();return}
 if('familyRange'in d){setFamilies(chosenValues(cfg),Number(d.familyRange));render();return}
 if('minutes'in d){cfg.minutes=Number(d.minutes);render();return}if('level'in d){cfg.level=Number(d.level);render();return}if('count'in d){cfg.count=Number(d.count);render();return}if('table'in d){cfg.table=Number(d.table);render();return}
 if('next'in d){if(validSelection(cfg))go('ready');return}if(d.input){cfg.input=d.input;render();return}if(d.view){cfg.view=d.view;render();return}
 if('start'in d){startFromMenu();return}
});document.addEventListener('input',e=>{if(e.target.id==='target')cfg.target=e.target.value.replace(/[^0-9]/g,'')});
function startFromMenu(){
 if(microphoneRestricted())cfg.input='keypad';
 if(busy())return;
 configuredReview=null;
 if(repeatSource&&!FlightProfiles.canRepeat(repeatSource)){repeatSource=null;FlightMenu.home();return}
 if(!FlightProfiles.hasSelection()){FlightMenu.home();return}
 const school=cfg.mode==='school',count=school||cfg.mode==='free'?60:cfg.count;
 const target=cfg.target;
 if(target&&(!Number.isInteger(Number(target))||Number(target)<1||Number(target)>count)){
   const field=$('target');field.closest('details').open=true;field.focus();field.reportValidity();return;
 }
 if(!validConfig(cfg)){replayNote='Please review your practice settings.';go('ready',false);return}
 if(blockStart(cfg))return;
 $('activity').value=school?'school':cfg.activity;configureActivity();
 if(school){document.querySelector(`#numbers .number:nth-child(${cfg.table-1})`).click()}
 else {$('level').value=String(cfg.level);$('questionCount').value=String(count)}
 configuredSelection=school?null:cfg.selection?structuredClone(cfg.selection):null;
 configuredTimeLimitMs=school?120000:cfg.minutes*60000;configuredPracticeType=cfg.mode==='untimed'?null:cfg.mode;
 freePractice=cfg.mode==='free';setMode(['school','test','timed'].includes(cfg.mode)&&!cfg.schoolUntimed?'test':'practice');
 $('inputMode').value=cfg.input==='voice'?'voice':'keyboard';$('sessionView').value=cfg.view;$('threshold').value=target;updateSetup();updateIOSVoiceGuidance();
 show('practiceView');$('start').click();
}
const focusEngineStart=$('start').onclick;
$('start').onclick=()=>{if(phase==='running')return;if(!configuredReview&&blockStart(engineConfig()))return;focusEngineStart()};
const profileBegin=begin;
begin=function(){
 if(configuredReview){if(!reviewDraft||!FlightProfiles.reviewAccess(reviewDraft.owner)){if(phase==='checking')cancelCheck();FlightMenu.home();return}profileBegin();if(phase==='running'){focusAllowance=null;FlightProfiles.rememberReview(reviewDraft)}return}
 if(repeatSource&&!FlightProfiles.canRepeat(repeatSource)){
  repeatSource=null;if(phase==='checking')cancelCheck();FlightMenu.home();return;
 }
 if(blockStart(engineConfig()))return;
 repeatQuestionKeys=repeatSource?.activity===cfg.activity&&(cfg.selection?JSON.stringify(repeatSource.selection)===JSON.stringify(cfg.selection):repeatSource.level===cfg.level)?(repeatSource.items||[]).slice(-60).map(p=>p.key):[];
 repeatSchoolFirstFactor=cfg.mode==='school'&&repeatSource?.table===cfg.table?repeatSource.items?.[0]?.factor:null;
 try{profileBegin()}finally{repeatQuestionKeys=[];repeatSchoolFirstFactor=null;repeatSource=null}
 if(phase==='running'){
  focusAllowance=null;flightChoices.set(session,structuredClone(cfg));FlightProfiles.rememberPractice(cfg);
  if(cfg.mode==='quick')FlightProfiles.rememberQuick({version:1,activity:cfg.activity,level:cfg.level,count:cfg.count,input:cfg.input,view:cfg.view,target:cfg.target,...(cfg.selection?{selection:structuredClone(cfg.selection)}:{}),...(cfg.tableChoices?{tableChoices:cfg.tableChoices.slice(),familyRange:chosenRange(cfg)}:{})});
 }
};
function replay(s,action='review'){
 if(busy())return;
 if(!FlightProfiles.canRepeat(s)){FlightMenu.home();return}
 if(s.activity==='review'){openReview(FlightProfiles.reviewRetryFacts(s),{source:s.review.source,filter:s.review.filter,owner:FlightProfiles.reviewOwner(),input:s.input==='voice'?'voice':'keypad'});return}
 repeatSource=s;
 const remembered=flightChoices.get(s),school=!s.activity;
 if(remembered){cfg=structuredClone(remembered);replayNote='Review these settings before starting a fresh set.'}
 else {
  const count=s.items.length,known=['quick','free','timed','test'].includes(s.practiceType);
  const selectedMode=school?'school':known?s.practiceType:s.mode==='test'?'test':'untimed';
  const counts=selectedMode==='quick'?[5,10,15,20]:[5,10,15,20,30,60];
  cfg={activity:school?'multiplication':s.activity,mode:selectedMode,level:Number.isInteger(s.level)?s.level:0,count:counts.includes(count)?count:20,minutes:[60000,120000,300000].includes(s.timeLimitMs)?s.timeLimitMs/60000:2,table:school?s.table:2,input:s.input==='voice'?'voice':'keypad',view:school?'worksheet':matchMedia('(max-width:680px)').matches?'focus':'worksheet',target:'',schoolUntimed:school&&s.mode==='practice'};
  if(s.selection)cfg.selection=structuredClone(s.selection);
  const maximum=['school','free'].includes(cfg.mode)?60:cfg.count;if(Number.isInteger(s.target)&&s.target>=1&&s.target<=maximum)cfg.target=String(s.target);
  replayNote='Settings restored from this flight. Its view was not saved; choose Focus or Worksheet below.';
  if(!school&&!known)replayNote+=' Older flights do not identify Quick, Free or Timed Practice; this opens a fixed set with the original timed or untimed setting.';
  if(!school&&cfg.mode!=='free'&&!counts.includes(count))replayNote+=' This older question count is unavailable; the set defaults to 20 questions.';
 }
 quickRoute=cfg.mode==='quick';trail=['home',...(quickRoute?[]:['math']),'operations','practice'];
 if(action==='next'){if(!canAdvance(s))return;cfg.level++}
 if(action==='nextTables'){if(!canAdvanceTables(s))return;setFamilies(chosenValues(cfg).map(n=>n+1),chosenRange(cfg))}
 if(action!=='review'&&remembered&&validConfig(cfg)){startFromMenu();return}
 go('ready',false);
}

function canAdvance(s){
 const c=flightChoices.get(s);
 return !!c&&validConfig(c)&&c.mode!=='school'&&c.level<4&&(!c.selection||c.selection.type==='level');
}
function canAdvanceTables(s){
 const c=flightChoices.get(s);
 return !!c&&validConfig(c)&&!!c.selection&&chosenValues(c).every(n=>n<12);
}
let reviewDraft=null;
function openReview(facts,options){
 if(busy()||!FlightProfiles.reviewAccess(options.owner))return;
 configuredReview=null;repeatSource=null;
 const remembered=FlightProfiles.reviewChoice();
 reviewDraft={...options,facts:structuredClone(facts),selected:facts.slice(0,5).map(f=>f.activity+':'+f.key),input:remembered?.input||options.input||'keypad',view:remembered?.view||(matchMedia('(max-width:680px)').matches?'focus':'worksheet'),back:options.back||(()=>FlightProfiles.progress())};
 show('menuView');go('review',false);window.scrollTo(0,0);
}
function reviewReady(){
 const d=reviewDraft,esc=escapeHTML;
 return `<button class="quiet back" data-review-back>← Back</button><h1>Review missed facts</h1><p>${d.source==='results'?'Missed or skipped facts from that session.':'Missed or skipped facts from the latest five eligible flights. A fact leaves this review after first-try success in two later flights; leaving the window does not mean mastery.'}</p><p>${d.filter==='all'?'All activities':activities[d.filter].name} · Untimed · Choose up to five facts.</p>${d.facts.length?`<p>${d.facts.length<5?'A short review is enough. You can practice these facts again afterward.':'The most recent missed facts are selected first. You can change the selection.'}</p><div class="review-facts">${d.facts.map((f,i)=>`<label><input type="checkbox" data-review-fact="${i}" ${d.selected.includes(f.activity+':'+f.key)?'checked':''}> <span>${esc(activities[f.activity].name)} · ${esc(f.text)}<small>${f.level!==undefined?'Level '+(f.level+1):f.table?'School table '+f.table:FactFlightMath.selectionLabel(f.activity,f.selection)}</small></span></label>`).join('')}</div><p id="reviewSelectionStatus" role="status"></p><h2>How would you like to answer?</h2><div class="pills"><button data-review-input="keypad" aria-pressed="${d.input==='keypad'}">Tap or type</button><button data-review-input="voice" ${microphoneRestricted()?'disabled title="Parent restricted"':''} aria-pressed="${d.input==='voice'}">Say it out loud${microphoneRestricted()?' · Parent restricted':''}</button></div><h2>Choose your view</h2><div class="pills"><button data-review-view="focus" aria-pressed="${d.view==='focus'}">One at a time</button><button data-review-view="worksheet" aria-pressed="${d.view==='worksheet'}">The whole sheet</button></div>`:'<p>No missed facts to review in this scope. You can choose another activity or start ordinary practice.</p><button data-nav="math">Choose practice →</button>'}<div class="footer-action"><div class="action-summary">${d.selected.length} facts · Untimed review</div><p>${d.input==='voice'?'Allow the microphone, then say “ready.”':'Your keyboard or number pad is ready.'}</p><button class="primary" data-review-start ${d.selected.length?'':'disabled'}>Start review →</button></div>`;
}
$('menuView').addEventListener('change',e=>{
 if(!e.target.matches('[data-review-fact]')||!reviewDraft)return;
 const f=reviewDraft.facts[Number(e.target.dataset.reviewFact)],key=f.activity+':'+f.key;
 if(e.target.checked&&reviewDraft.selected.length>=5){e.target.checked=false;$('reviewSelectionStatus').textContent='Choose up to five facts. Uncheck one to choose another.';return}
 reviewDraft.selected=e.target.checked?[...reviewDraft.selected,key]:reviewDraft.selected.filter(k=>k!==key);
 $('menuView').querySelector('[data-review-start]').disabled=!reviewDraft.selected.length;
 $('menuView').querySelector('.action-summary').textContent=reviewDraft.selected.length+' facts · Untimed review';
 $('reviewSelectionStatus').textContent=reviewDraft.selected.length+' selected';scheduleActions();
});
function startReview(){
 if(microphoneRestricted()&&reviewDraft)reviewDraft.input='keypad';
 if(busy()||!reviewDraft||!FlightProfiles.reviewAccess(reviewDraft.owner))return;
 const d=reviewDraft,r={version:d.facts.some(f=>d.selected.includes(f.activity+':'+f.key)&&f.selection?.type==='families')?2:1,source:d.source,filter:d.filter,facts:d.facts.filter(f=>d.selected.includes(f.activity+':'+f.key))};
 if(!FactFlightMath.validReview(r))return;
 configuredReview=null;configuredSelection=null;configuredPracticeType=null;
 $('activity').value='addition';configureActivity();$('level').value='0';$('questionCount').value='5';freePractice=false;setMode('practice');
 configuredReview=r;$('inputMode').value=d.input==='voice'?'voice':'keyboard';$('sessionView').value=d.view;$('threshold').value='';updateSetup();
 $('sheetTitle').textContent='Missed-fact review · '+(d.filter==='all'?'All activities':activities[d.filter].name);
 $('sessionScope').textContent=r.facts.length+' facts · Untimed. Each fact keeps its original operation. Skipped facts return later.';
 show('practiceView');$('start').click();
}
function resultActions(s){
 const again=$('again');if(!again)return;
 if(!FlightProfiles.canRepeat(s)){again.remove();return}
 const c=flightChoices.get(s),complete=c&&validConfig(c);
 again.textContent=s.activity==='review'?'Review remaining facts →':complete?'Practice Again →':'Review settings →';
 again.onclick=()=>replay(s,'again');
 const group=document.createElement('div');group.className='repeat-actions';again.before(group);group.append(again);
 if(complete){
  if(canAdvance(s)){const next=document.createElement('button');next.id='nextLevel';next.textContent='Next Level · '+(c.level+2)+' →';next.onclick=()=>replay(s,'next');group.append(next)}
  if(canAdvanceTables(s)){const next=document.createElement('button');next.id='nextTables';next.textContent=(c.activity==='division'?(chosenValues(c).length===1?'Next Divisor':'Next Divisors'):(chosenValues(c).length===1?'Next Table':'Next Tables'))+' · '+chosenValues(c).map(n=>n+1).join(', ')+' →';next.onclick=()=>replay(s,'nextTables');group.append(next)}
  const change=document.createElement('button');change.id='changeOptions';change.textContent='Change options';change.onclick=()=>replay(s);group.after(change);
 }
 const summary=document.createElement('div');summary.className='action-summary';summary.textContent=sessionLabel(s);group.prepend(summary);
 registerActions($('resultsView'),group);
 if(!s.guest||s===session){const review=document.createElement('button');review.id='reviewMissed';review.textContent='Review missed facts';review.onclick=()=>{if(!FlightProfiles.canRepeat(s)||(s.guest&&s!==session))return;openReview(FactFlightMath.reviewCandidates([s],'all',false),{source:'results',filter:'all',owner:FlightProfiles.reviewOwner(),input:s.input==='voice'?'voice':'keypad',back:()=>{renderResult(s);show('resultsView')}})};group.after(review)}
}
// One-shot, tab-local setup recovery; no history, transcripts or active flight are copied.
const voiceRecoveryKey='fact-flight-voice-recovery-v1';
function refreshVoice(){
 if(phase!=='checking'||$('inputMode').value!=='voice')return;
 const problem=FlightProfiles.voiceRefreshProblem();
 if(problem){$('micMessage').textContent=problem;return}
 const payload={version:1,at:Date.now(),owner:FlightProfiles.reviewOwner(),view:$('sessionView').value};
 if(configuredReview&&reviewDraft){payload.review=structuredClone(configuredReview)}
 else if(validConfig(cfg)){payload.config=structuredClone(cfg)}
 else {$('micMessage').textContent='Please cancel and review your practice settings.';return}
 try{sessionStorage.setItem(voiceRecoveryKey,JSON.stringify(payload))}
 catch{$('micMessage').textContent='Could not keep your setup for a refresh. Cancel and choose Tap or type, or try the microphone again.';return}
 releaseMicrophone();location.reload();
}
function restoreVoiceSetup(){
 let payload;
 try{const raw=sessionStorage.getItem(voiceRecoveryKey);sessionStorage.removeItem(voiceRecoveryKey);if(!raw||raw.length>20000)return;payload=JSON.parse(raw)}catch{return}
 if(!payload||payload.version!==1||!Number.isFinite(payload.at)||Date.now()-payload.at<0||Date.now()-payload.at>600000||!['focus','worksheet'].includes(payload.view))return;
 if(payload.review?!FactFlightMath.validReview(payload.review):!validConfig(payload.config))return;
 if(!FlightProfiles.restoreVoiceOwner(payload.owner))return;
 if(payload.review){
  openReview(payload.review.facts,{source:payload.review.source,filter:payload.review.filter,owner:payload.owner,input:'voice'});
  reviewDraft.input='voice';reviewDraft.view=payload.view;render();
 }else{cfg={...payload.config,input:'voice',view:payload.view};trail=['home','practice'];go('ready',false)}
 const notice=document.createElement('p');notice.className='notice';notice.setAttribute('role','status');notice.textContent='Your setup is restored. Tap Reconnect microphone, then say “ready.” The timer has not started.';
 $('menuView').querySelector('h1').after(notice);
 $('menuView').querySelector('[data-review-start], [data-start]').textContent='Reconnect microphone →';
}
function useTypedSetup(){
 if(phase!=='checking')return;
 cfg.input='keypad';if(reviewDraft)reviewDraft.input='keypad';
 $('inputMode').value='keyboard';cancelCheck();
}
window.FlightMenu={useTypedSetup,refreshVoice,openReview,replay,resultActions,validConfig,home:()=>{if(busy()){requestSessionExit();return}resetDrafts();trail=[];go('home',false)},math:()=>{if(busy()){requestSessionExit();return}resetDrafts();trail=['home'];go(FlightProfiles.hasSelection()?'math':'home',false)},ready:()=>{if(reviewDraft&&configuredReview){show('menuView');go('review',false)}else go(FlightProfiles.hasSelection()?'ready':'home',false)},profiles:next=>go(next)};
$('homeNav').onclick=()=>FlightMenu.home();$('practiceNav').onclick=()=>FlightMenu.math();
$('historyNav').onclick=()=>{if(busy()){requestSessionExit();return}FlightProfiles.progress()};
window.addEventListener('microphonepolicychange',()=>{if(!busy()&&!$('menuView').classList.contains('hidden'))render()});
$('menuView').addEventListener('change',e=>{if(e.target.id==='disableMicrophone'){
 const saved=setMicrophoneRestriction(e.target.checked);
 $('microphonePolicyStatus').textContent=saved?(microphoneRestricted()?'Microphone disabled for all learners in this browser.':'Microphone enabled. It starts only when voice is chosen.'):'Could not save this setting. Microphone stays blocked in this tab; use browser permissions for a lasting restriction.';
}});
applyMicrophoneRestriction();
FlightMenu.home();
restoreVoiceSetup();

})();
