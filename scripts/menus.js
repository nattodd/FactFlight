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
function validSelection(c){return c.selection===undefined||c.selection===null||(c.activity==='multiplication'&&c.mode!=='school'&&c.selection.type==='tables'&&FactFlightMath.validTables(c.selection.tables))}
function selectionLabel(c){return c.selection?.type==='tables'?'Tables '+c.selection.tables.join(', '):'Level '+(c.level+1)}
function validConfig(c){return !!c&&validSelection(c)&&(c.tableChoices===undefined||(Array.isArray(c.tableChoices)&&(c.tableChoices.length===0||FactFlightMath.validTables(c.tableChoices))))&&Object.hasOwn(activities,c.activity)&&['quick','free','timed','test','school','untimed'].includes(c.mode)&&Number.isInteger(c.level)&&c.level>=0&&c.level<=4&&(c.mode==='quick'?[5,10,15,20]:[5,10,15,20,30,60]).includes(c.count)&&[1,2,5].includes(c.minutes)&&Number.isInteger(c.table)&&c.table>=2&&c.table<=10&&['keypad','voice'].includes(c.input)&&['focus','worksheet'].includes(c.view)&&(c.schoolUntimed===undefined||typeof c.schoolUntimed==='boolean')&&(c.mode!=='school'||c.activity==='multiplication')&&(c.target===''||(typeof c.target==='string'&&/^\d+$/.test(c.target)&&Number(c.target)>=1&&Number(c.target)<=(['school','free'].includes(c.mode)?60:c.count)))}
function changeMode(mode){if(cfg.mode===mode)return;cfg.mode=mode;if(mode==='school')delete cfg.selection;cfg.schoolUntimed=false;cfg.count=mode==='quick'?5:mode==='test'||mode==='school'||mode==='free'?60:20;cfg.minutes=2;if(Number(cfg.target)>cfg.count)cfg.target=''}
let screen='home',trail=[],quickRoute=false,cfg=defaultConfig();
const drafts=new Map();
function resetDrafts(){repeatSource=null;drafts.clear();cfg=defaultConfig();replayNote='';quickRoute=false}
function chooseActivity(activity){if(screen==='practice'||screen==='ready')drafts.set(cfg.activity,{...cfg});const quick=FlightProfiles.quickChoice();cfg=drafts.get(activity)||FlightProfiles.practiceChoice(activity)||(quick?.activity===activity?{...defaultConfig(activity),...quick}:defaultConfig(activity));cfg={...cfg};if(quickRoute)changeMode('quick');replayNote=''}
const selected=(a,b)=>a===b?' selected':'';
function go(next,remember=true){if(busy()){requestSessionExit();return}show('menuView');if(remember)trail.push(screen);screen=next;render();window.scrollTo(0,0);const heading=$('menuView').querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}
function back(){if(screen==='practice'||screen==='ready'||screen==='mode')drafts.set(cfg.activity,{...cfg});show('menuView');screen=trail.pop()||'home';if(screen==='home')resetDrafts();render();window.scrollTo(0,0)}
const steps=stage=>`<div class="steps" aria-label="Setup steps">${(quickRoute?['Activity','Your practice','Ready']:['Activity','Mode','Your practice','Ready']).map((s,i)=>`<span class="${s===stage?'current':''}">${i+1} · ${s}</span>`).join('')}</div>`;
const backButton=()=>'<button class="quiet back" data-back>← Back</button>';
const context=()=>`<div class="context"><b>${activities[cfg.activity].name}</b><span class="dot">•</span>${cfg.mode==='school'?'Original School Test':modes[cfg.mode][0]}</div>`;
function quickCard(){const q=FlightProfiles.quickChoice();return `<section class="quick"><div><div class="eyebrow">Just a few questions</div><h2>Quick Practice</h2>${q?`<p>${activities[q.activity].name} · ${selectionLabel(q)} · ${q.count} questions</p><p>${q.input==='voice'?'Voice':'Tap or type'} · ${q.view==='focus'?'Focus':'Worksheet'} · No timer${q.target?' · First-try goal: '+q.target:''}</p>`:'<p>Pick any math activity and a small set. No timer.</p><span class="quick-tag">5 · 10 · 15 · 20 questions</span>'}</div><div class="quick-actions">${q?'<button class="primary launch" data-quick-start>Start again →</button><button data-quick>Change options</button>':'<button class="primary launch" data-quick>Let’s go →</button>'}</div></section>${FlightProfiles.quickWarning()?`<p role="status">${FlightProfiles.quickWarning()}</p>`:''}`}
function loadQuick(q){replayNote='';cfg.schoolUntimed=false;Object.assign(cfg,{activity:q.activity,level:q.level,count:q.count,input:q.input,view:q.view,target:q.target,mode:'quick',selection:q.selection?structuredClone(q.selection):undefined,tableChoices:q.tableChoices?.slice()});drafts.set(q.activity,{...cfg});quickRoute=true}
function home(){if(!FlightProfiles.hasSelection())return FlightProfiles.entry();return `${FlightProfiles.identity()}<div class="hero"><div class="eyebrow">Little practice. Big confidence.</div><h1>Where will you fly today?</h1><p>Pick something to explore. A little practice goes a long way.</p></div>${quickCard()}<h2>Choose your adventure</h2><div class="tiles"><button class="tile available" data-math><span class="icon">＋</span><strong>Math</strong><span class="sub">Eight ways to play with numbers</span><span class="sub">Explore →</span></button>${[['Aa','Letters & Sounds','Discover letters and their sounds'],['○△','Colors & Shapes','Explore the world around you'],['Ab','Reading','Build confidence with words']].map(([icon,title,desc])=>`<button class="tile" disabled><span class="icon" aria-hidden="true">${icon}</span><strong>${title}</strong><span class="sub">${desc}</span><span class="badge">Coming Soon</span></button>`).join('')}</div><div class="bottom"><span class="small">Free to learn. No account needed.</span><button data-nav="progress">Results & Stats ↗</button><button class="quiet" data-nav="parents">Parent corner</button></div>`}
function math(){return `${backButton()}${steps('Activity')}<div class="hero"><div class="eyebrow">${quickRoute?'Quick Practice':'Math'}</div><h1>What shall we practice?</h1><p>${quickRoute?'Any activity. A few questions. You choose.':'Tap a tile to start your next adventure.'}</p></div><div class="tiles">${Object.entries(activities).map(([id,a])=>`<button class="tile" data-activity="${id}"><span class="icon">${a.icon}</span><strong>${a.name}</strong><span class="sub">${a.desc}</span></button>`).join('')}</div>${quickRoute?'':`<section class="row school"><div><h3>The original School Test</h3><p>Multiplication · 60 facts · 2 minutes · tables 2–10</p></div><button data-school>Choose a table →</button></section>`}`}
function modeMenu(){return `${backButton()}${steps('Mode')}<div class="hero"><div class="eyebrow">${activities[cfg.activity].name}</div><h1>How would you like to practice?</h1><p>A little at a time, or a challenge? It’s up to you.</p></div><div class="tiles modes">${Object.entries(modes).filter(([id])=>id!=='untimed').map(([id,m])=>`<button class="tile${selected(cfg.mode,id)}" aria-pressed="${cfg.mode===id}" data-mode="${id}"><span class="icon">${m[3]}</span><strong>${m[0]}</strong><span class="sub">${m[1]}</span><span class="sub">${m[2]}</span></button>`).join('')}</div>${cfg.activity==='multiplication'?`<div class="row school"><div><h3>Practicing for school?</h3><p>The original 60-fact, two-minute multiplication test.</p></div><button class="${selected(cfg.mode,'school')}" aria-pressed="${cfg.mode==='school'}" data-school>School Test →</button></div>`:''}`}
function selectionMenu(){
 const a=activities[cfg.activity],tables=cfg.selection?.tables||cfg.tableChoices||[2],chosen=cfg.selection?.type==='tables';
 const toggle=cfg.activity==='multiplication'?`<div class="pills section" aria-label="Multiplication selection"><button data-selection="level" aria-pressed="${!chosen}" class="${selected(chosen,false)}">By Level</button><button data-selection="tables" aria-pressed="${chosen}" class="${selected(chosen,true)}">Choose Tables</button></div>`:'';
 if(!chosen)return toggle+`<div class="levels section">${a.levels.map((label,i)=>`<button class="choice${selected(cfg.level,i)}" aria-pressed="${cfg.level===i}" data-level="${i}"><span class="number">Level ${i+1}</span><strong>${label}</strong><span class="example">${a.examples[i]}</span></button>`).join('')}</div><p class="example-note">Selected: ${a.scope[cfg.level]} · whole-number answers</p>`;
 return toggle+`<h2>Which tables?</h2><p>Choose one or more tables. Each uses factors 1–10.</p><div class="pills section table-choices">${Array.from({length:10},(_,i)=>i+1).map(n=>`<button data-fact-table="${n}" aria-pressed="${tables.includes(n)}" class="${selected(tables.includes(n),true)}">${n}</button>`).join('')}</div><p role="status">${tables.length?'Selected tables: '+tables.join(', '):'Select at least one table to continue.'}</p>`;
}
function practice(){const a=activities[cfg.activity],school=cfg.mode==='school';return `${backButton()}${steps('Your practice')}${context()}<h1>${school?'Which times table?':'Pick your challenge.'}</h1><p>${school?'The same school test you know. Pick a table to begin.':cfg.activity==='multiplication'?'Choose a level or pick the tables you want to practice.':'Every level is open. Pick what feels right today.'}</p>${school?`<div class="pills section">${Array.from({length:9},(_,i)=>i+2).map(n=>`<button class="${selected(cfg.table,n)}" aria-pressed="${cfg.table===n}" data-table="${n}">${n}</button>`).join('')}</div>`:selectionMenu()}${cfg.mode==='free'?'<div class="review"><strong>Keep going until you choose Finish</strong><p>No timer and no question limit. Skip moves on; you can review skipped questions afterward.</p></div>':cfg.mode==='school'?`<div class="review"><strong>60 questions · ${cfg.schoolUntimed?'no time limit':'2 minutes'}</strong><p>Finish early if you need to. You can review every answer afterward.</p></div>`:`<section class="section"><h2>How many questions?</h2><div class="pills">${(cfg.mode==='quick'?[5,10,15,20]:[5,10,15,20,30,60]).map(n=>`<button class="${selected(cfg.count,n)}" aria-pressed="${cfg.count===n}" data-count="${n}">${n}</button>`).join('')}</div><p class="small">${['timed','test'].includes(cfg.mode)?'Finish your set or keep going until time runs out.':'No time limit. Take your time.'}</p></section>`}${['timed','test'].includes(cfg.mode)?`<section class="section"><h2>How much time?</h2><div class="pills">${[1,2,5].map(n=>`<button class="${selected(cfg.minutes,n)}" aria-pressed="${cfg.minutes===n}" data-minutes="${n}">${n} ${n===1?'minute':'minutes'}</button>`).join('')}</div><p class="small">The clock starts when you’re ready. Finish early whenever you need to.</p></section>`:''}<div class="footer-action"><p>Next: choose how to answer.</p><button class="primary" data-next ${validSelection(cfg)?'':'disabled'}>Continue →</button></div>`}
function ready(){return `${backButton()}${steps('Ready')}${context()}<h1>Ready for takeoff?</h1><p>Choose how you want to answer.</p>${replayNote?`<p class="notice">${replayNote}</p>`:''}<div class="pair"><button class="tile${selected(cfg.input,'keypad')}" data-input="keypad" aria-pressed="${cfg.input==='keypad'}"><span class="icon">▦</span><strong>Tap or type</strong><span class="sub">Use the number pad or your keyboard.</span></button><button class="tile${selected(cfg.input,'voice')}" data-input="voice" aria-pressed="${cfg.input==='voice'}"><span class="icon">♪</span><strong>Say it out loud</strong><span class="sub">Use your microphone. Say “ready” to begin.</span></button></div><section class="section"><h2>How do you want to see it?</h2><div class="pair"><button class="tile${selected(cfg.view,'focus')}" data-view="focus" aria-pressed="${cfg.view==='focus'}"><span class="view-art">[ ? ]</span><strong>One at a time</strong><span class="sub">Focus View · one big, clear question.</span></button><button class="tile${selected(cfg.view,'worksheet')}" data-view="worksheet" aria-pressed="${cfg.view==='worksheet'}"><span class="view-art">☷ ☷ ☷</span><strong>The whole sheet</strong><span class="sub">Worksheet View · see your set of facts.</span></button></div></section><div class="review"><strong>${activities[cfg.activity].name} · ${cfg.mode==='school'?cfg.table+' times table':selectionLabel(cfg)}</strong><p>${cfg.mode==='school'?'Original School Test':modes[cfg.mode][0]} · ${cfg.mode==='free'?'Questions until you finish':(cfg.mode==='school'?60:cfg.count)+' questions'} · ${cfg.mode==='school'?(cfg.schoolUntimed?'no time limit':'2 minutes'):['test','timed'].includes(cfg.mode)?cfg.minutes+' '+(cfg.minutes===1?'minute':'minutes'):'no time limit'}</p></div><details><summary>Grown-up options</summary><label for="target">Optional first-try goal</label><p>Leave blank for no goal. ${cfg.mode==='free'?'Choose a goal from 1 to 60 first-try answers, or leave it blank.':'Choose a number up to your question count, or leave it blank.'}</p><input id="target" type="number" min="1" max="${['school','free'].includes(cfg.mode)?60:cfg.count}" value="${cfg.target}" placeholder="No goal"><p>Use Skip, Undo, or Finish during your flight. ${FlightProfiles.isGuest()?"Guest results are temporary and are not saved.":"Review answers and export your learner results from Progress."}</p></details><div class="footer-action"><p>${cfg.input==='voice'?'Allow the microphone, then say “ready.”':'Your keyboard or number pad is ready.'}</p><button class="primary" data-start>Start ${cfg.mode==='school'?'School Test':cfg.mode==='test'?'test':'practice'} →</button></div>`}
function parents(){return `${backButton()}<div class="hero"><div class="eyebrow">Parent corner</div><h1>A little help for grown-ups.</h1><p>Keep the practice path simple. Keep guidance easy to find.</p></div><button class="primary" data-nav="manageLearners">Manage learners →</button><details open><summary>Microphone help</summary><p>Allow microphone and speech recognition access when your browser asks. During a flight, use Reconnect microphone if listening stops. Browser speech may use an online service. The app stores recognized text with results locally; it does not save audio recordings.</p></details><details><summary>Results and backups</summary><p>Open Progress for activity totals, flight reviews, and JSON/CSV exports. Results stay in this browser unless deliberately exported.</p></details><div class="notice">Profiles save separate progress in this browser. Guest results are temporary and cannot be saved or exported. Change learner before starting to keep future progress.</div>`}
function render(){const focused=document.activeElement?.dataset;for(const id of ['homeNav','practiceNav','historyNav'])$(id).removeAttribute('aria-current');$(screen==='home'?'homeNav':'practiceNav').setAttribute('aria-current','page');$('menuView').innerHTML=({home,math,mode:modeMenu,practice,ready,parents,createProfile:FlightProfiles.create,statsPicker:FlightProfiles.picker,manageLearners:FlightProfiles.manage,importLearner:FlightProfiles.importStart,reviewImport:FlightProfiles.reviewScreen}[screen])();if(focused){const key=Object.keys(focused).find(k=>['level','count','minutes','table','input','view','factTable','selection'].includes(k));if(key)$('menuView').querySelector(`[data-${key==='factTable'?'fact-table':key}="${focused[key]}"]`)?.focus({preventScroll:true})}}
$('menuView').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;const d=b.dataset;
 if(d.nav){if(d.nav==='progress'){FlightProfiles.progress();return}if(d.nav==='home'){FlightMenu.home();return}go(d.nav);return}if('back'in d){back();return}
 if('quickStart'in d){const q=FlightProfiles.quickChoice();if(q){loadQuick(q);startFromMenu()}else{quickRoute=true;cfg.mode='quick';cfg.count=5;cfg.target='';go('math')}return}
 if('quick'in d){replayNote='';const q=FlightProfiles.quickChoice();if(q){loadQuick(q);go('math')}else{quickRoute=true;cfg.mode='quick';cfg.count=5;cfg.target='';go('math')}return}if('math'in d){quickRoute=false;go('math');return}
 if(d.activity){chooseActivity(d.activity);go(quickRoute?'practice':'mode');return}
 if(d.mode){replayNote='';changeMode(d.mode);go('practice');return}
 if('school'in d){replayNote='';chooseActivity('multiplication');const wasSchool=cfg.mode==='school';changeMode('school');cfg.schoolUntimed=false;if(!wasSchool)cfg.view='worksheet';go('practice');return}
 if(d.selection){if(d.selection==='tables')cfg.selection={type:'tables',tables:(cfg.selection?.tables||cfg.tableChoices||[2]).slice()};else {cfg.tableChoices=cfg.selection?.tables.slice()||cfg.tableChoices;delete cfg.selection}render();return}
 if('factTable'in d){const n=Number(d.factTable),tables=cfg.selection.tables;cfg.selection={type:'tables',tables:(tables.includes(n)?tables.filter(x=>x!==n):[...tables,n]).sort((a,b)=>a-b)};cfg.tableChoices=cfg.selection.tables.slice();render();return}
 if('minutes'in d){cfg.minutes=Number(d.minutes);render();return}if('level'in d){cfg.level=Number(d.level);render();return}if('count'in d){cfg.count=Number(d.count);render();return}if('table'in d){cfg.table=Number(d.table);render();return}
 if('next'in d){if(validSelection(cfg))go('ready');return}if(d.input){cfg.input=d.input;render();return}if(d.view){cfg.view=d.view;render();return}
 if('start'in d){startFromMenu();return}
});document.addEventListener('input',e=>{if(e.target.id==='target')cfg.target=e.target.value.replace(/[^0-9]/g,'')});
function startFromMenu(){
 if(busy())return;
 if(repeatSource&&!FlightProfiles.canRepeat(repeatSource)){repeatSource=null;FlightMenu.home();return}
 if(!FlightProfiles.hasSelection()){FlightMenu.home();return}
 const school=cfg.mode==='school',count=school||cfg.mode==='free'?60:cfg.count;
 const target=cfg.target;
 if(target&&(!Number.isInteger(Number(target))||Number(target)<1||Number(target)>count)){
   const field=$('target');field.closest('details').open=true;field.focus();field.reportValidity();return;
 }
 if(!validConfig(cfg)){replayNote='Please review your practice settings.';go('ready',false);return}
 $('activity').value=school?'school':cfg.activity;configureActivity();
 if(school){document.querySelector(`#numbers .number:nth-child(${cfg.table-1})`).click()}
 else {$('level').value=String(cfg.level);$('questionCount').value=String(count)}
 configuredSelection=school?null:cfg.selection?structuredClone(cfg.selection):null;
 configuredTimeLimitMs=school?120000:cfg.minutes*60000;configuredPracticeType=cfg.mode==='untimed'?null:cfg.mode;
 freePractice=cfg.mode==='free';setMode(['school','test','timed'].includes(cfg.mode)&&!cfg.schoolUntimed?'test':'practice');
 $('inputMode').value=cfg.input==='voice'?'voice':'keyboard';$('sessionView').value=cfg.view;$('threshold').value=target;updateSetup();updateIOSVoiceGuidance();
 show('practiceView');$('start').click();
}
const profileBegin=begin;
begin=function(){
 if(repeatSource&&!FlightProfiles.canRepeat(repeatSource)){
  repeatSource=null;if(phase==='checking')cancelCheck();FlightMenu.home();return;
 }
 repeatQuestionKeys=repeatSource?.activity===cfg.activity&&(cfg.selection?.type==='tables'?JSON.stringify(repeatSource.selection)===JSON.stringify(cfg.selection):repeatSource.level===cfg.level)?(repeatSource.items||[]).slice(-60).map(p=>p.key):[];
 repeatSchoolFirstFactor=cfg.mode==='school'&&repeatSource?.table===cfg.table?repeatSource.items?.[0]?.factor:null;
 try{profileBegin()}finally{repeatQuestionKeys=[];repeatSchoolFirstFactor=null;repeatSource=null}
 if(phase==='running'){
  flightChoices.set(session,structuredClone(cfg));FlightProfiles.rememberPractice(cfg);
  if(cfg.mode==='quick')FlightProfiles.rememberQuick({version:1,activity:cfg.activity,level:cfg.level,count:cfg.count,input:cfg.input,view:cfg.view,target:cfg.target,...(cfg.selection?{selection:structuredClone(cfg.selection)}:{}),...(cfg.tableChoices?{tableChoices:cfg.tableChoices.slice()}:{})});
 }
};
function replay(s,action='review'){
 if(busy())return;
 if(!FlightProfiles.canRepeat(s)){FlightMenu.home();return}
 repeatSource=s;
 const remembered=flightChoices.get(s),school=!s.activity;
 if(remembered){cfg=structuredClone(remembered);replayNote='Review these settings before starting a fresh set.'}
 else {
  const count=s.items.length,known=['quick','free','timed','test'].includes(s.practiceType);
  const selectedMode=school?'school':known?s.practiceType:s.mode==='test'?'test':'untimed';
  const counts=selectedMode==='quick'?[5,10,15,20]:[5,10,15,20,30,60];
  cfg={activity:school?'multiplication':s.activity,mode:selectedMode,level:Number.isInteger(s.level)?s.level:0,count:counts.includes(count)?count:20,minutes:[60000,120000,300000].includes(s.timeLimitMs)?s.timeLimitMs/60000:2,table:school?s.table:2,input:s.input==='voice'?'voice':'keypad',view:school?'worksheet':matchMedia('(max-width:680px)').matches?'focus':'worksheet',target:'',schoolUntimed:school&&s.mode==='practice'};
  if(s.selection?.type==='tables')cfg.selection=structuredClone(s.selection);
  const maximum=['school','free'].includes(cfg.mode)?60:cfg.count;if(Number.isInteger(s.target)&&s.target>=1&&s.target<=maximum)cfg.target=String(s.target);
  replayNote='Settings restored from this flight. Its view was not saved; choose Focus or Worksheet below.';
  if(!school&&!known)replayNote+=' Older flights do not identify Quick, Free or Timed Practice; this opens a fixed set with the original timed or untimed setting.';
  if(!school&&cfg.mode!=='free'&&!counts.includes(count))replayNote+=' This older question count is unavailable; the set defaults to 20 questions.';
 }
 quickRoute=cfg.mode==='quick';trail=['home','math','practice'];
 if(action==='next'){if(!canAdvance(s))return;cfg.level++}
 if(action!=='review'&&remembered&&validConfig(cfg)){startFromMenu();return}
 go('ready',false);
}

function canAdvance(s){
 const c=flightChoices.get(s);
 return !!c&&validConfig(c)&&c.mode!=='school'&&c.level<4&&(!c.selection||c.selection.type==='level');
}
function resultActions(s){
 const again=$('again');if(!again)return;
 if(!FlightProfiles.canRepeat(s)){again.remove();return}
 const c=flightChoices.get(s),complete=c&&validConfig(c);
 again.textContent=complete?'Practice Again →':'Review settings →';
 again.onclick=()=>replay(s,'again');
 const group=document.createElement('div');group.className='repeat-actions';again.before(group);group.append(again);
 if(complete){
  if(canAdvance(s)){const next=document.createElement('button');next.id='nextLevel';next.textContent='Next Level · '+(c.level+2)+' →';next.onclick=()=>replay(s,'next');group.append(next)}
  const change=document.createElement('button');change.id='changeOptions';change.textContent='Change options';change.onclick=()=>replay(s);group.append(change);
 }
}
window.FlightMenu={replay,resultActions,validConfig,home:()=>{if(busy()){requestSessionExit();return}resetDrafts();trail=[];go('home',false)},math:()=>{if(busy()){requestSessionExit();return}resetDrafts();trail=['home'];go(FlightProfiles.hasSelection()?'math':'home',false)},ready:()=>go(FlightProfiles.hasSelection()?'ready':'home',false),profiles:next=>go(next)};
$('homeNav').onclick=()=>FlightMenu.home();$('practiceNav').onclick=()=>FlightMenu.math();
$('historyNav').onclick=()=>{if(busy()){requestSessionExit();return}FlightProfiles.progress()};
FlightMenu.home();

})();
