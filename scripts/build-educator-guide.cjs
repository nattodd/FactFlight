// Documentation only. Never imported by the application.
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const check=process.argv.includes('--check');
const proposal=JSON.parse(read('docs/data/question-mix-proposal.json'));
const audit=JSON.parse(execFileSync(process.execPath,['tests/question-mix-audit.cjs'],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}));
const baseline=JSON.parse(read('docs/data/question-mix-baseline.json')).audit;
const names={addition:'Addition',subtraction:'Subtraction',multiplication:'Multiplication',division:'Division',bonds:'Number bonds',doubles:'Doubles',halves:'Halves',squares:'Squares'};
const sum=a=>a.reduce((x,y)=>x+y,0),pct=(n,d)=>(100*n/d).toFixed(2)+'%',esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
assert.equal(audit.rows.length,40);
for(const r of baseline.rows)for(const length of [5,20]){
 assert.equal(r.simulations[length].sequence.exactAdjacent.total,0,'Update fresh-flight repeat finding');
 assert.equal(r.simulations[length].sequence.recentFamilyRepeats.total,0,'Update recent-family finding');
}
const rows=baseline.rows.map(r=>{
 const measured=audit.rows.find(a=>a.activity===r.activity&&a.level===r.level);
 assert.deepEqual(measured.nonIdentityTiers,r.nonIdentityTiers,'Pool changed: review baseline comparison');
 assert.deepEqual(measured.identityTiers,r.identityTiers,'Identity eligibility changed');
 const current=[r.nonIdentityTiers[r.level-1],...r.nonIdentityTiers.slice(0,3).map((n,i)=>i<r.level-1?n:0),sum(r.identityTiers)];
 assert.equal(sum(current),r.families,'Unsupported new review tier: update documentation buckets');
 const unchanged=proposal.unchangedLevels.includes(r.level);
 const target=unchanged?current:r.activity==='bonds'?proposal.bondsLevel2And3:r.activity==='squares'&&r.level===3?proposal.squaresLevel3:proposal['level'+r.level];
 if(!unchanged){assert.equal(sum(target),20);target.forEach((n,i)=>assert(!n||current[i]>0,'Proposed bucket unavailable'));}
 if(!unchanged)assert.deepEqual(target,require('./content-definitions.js').practiceAllocation(r.activity,r.level-1),'Documentation/runtime allocation mismatch');
 const zero=target.slice();if(!unchanged){zero[0]+=zero[4];zero[4]=0;}
 const floor=slots=>sum(slots.map((n,i)=>Math.max(0,n-current[i])));
 const repeats=Math.max(0,20-r.families);
 assert.equal(20-r.simulations['20'].distinctFamilies.mean,repeats);
 const old=r.simulations['20'];
 const beforeBuckets=[old.selectedNonIdentity.mean,20-old.selectedNonIdentity.mean-old.identities.mean,0,0,old.identities.mean];
 const m=measured.simulations['20'];
 if(!unchanged){assert.equal(m.selectedNonIdentity.min,target[0]);assert.equal(m.selectedNonIdentity.max,target[0]);assert.equal(m.identities.max,target[4]);}
 const afterBuckets=[m.selectedNonIdentity.mean,20-m.selectedNonIdentity.mean-m.identities.mean,0,0,m.identities.mean];
 return {...r,measured,beforeBuckets,afterBuckets,measuredRepeats:20-m.distinctFamilies.mean,currentBuckets:current,proposedBuckets:target,unchanged,currentRepeats:repeats,proposedRepeatFloor:unchanged?repeats:floor(target),zeroIdentityRepeatFloor:unchanged?repeats:floor(zero)};
});
const files=['scripts/math-activities.js','scripts/content-definitions.js','scripts/practice-generator.js','tests/question-mix-audit.cjs','docs/data/question-mix-proposal.json','docs/data/question-mix-baseline.json'];
const hashes=Object.fromEntries(files.map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')]));
let matchesRelease=false;
try{matchesRelease=execFileSync('git',['show','v6.2.0:scripts/math-activities.js'],{cwd:root,encoding:'utf8'}).replace(/\r\n/g,'\n')===read(files[0]);}catch{}
const output=new Map();
output.set('docs/data/educator-practice-data.json',JSON.stringify({proposal,sourceHashes:hashes,currentGeneratorMatchesLocalV620Tag:matchesRelease,audit:{...audit,rows}},null,2)+'\n');
const colors=['#0072b2','#778899','#d55e00'];
function svg(activity,rs){
 let s=`<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="1050" viewBox="0 0 1040 1050" role="img" aria-labelledby="title desc"><title id="title">${names[activity]}: released and local question mix</title><desc id="desc">Five levels. Measured released versus local twenty-question flights. Repeated encounters compare the released baseline, measured local mean and allocation minimum. Exact values appear in the companion Markdown table.</desc><rect width="1040" height="1050" fill="white"/><style>text{font-family:Arial,sans-serif;fill:#172b40} .small{font-size:14px} .label{font-size:16px}</style>`;
 const t=(x,y,text,size=16)=>{s+=`<text x="${x}" y="${y}" font-size="${size}">${esc(text)}</text>`};
 t(28,38,names[activity]+' · Levels 1–5',26);t(28,66,'Released baseline vs LOCAL implementation · not published',17);
 ['Selected-tier ordinary','Earlier ordinary review','Zero / identity'].forEach((v,i)=>{s+=`<rect x="${28+i*330}" y="86" width="18" height="18" fill="${colors[i]}"/>`;t(54+i*330,101,v,15)});
 const x=215,w=740;
 for(let n=0;n<=100;n+=25){t(x+w*n/100-10,137,n+'%',13);s+=`<path d="M${x+w*n/100},145 V510" stroke="#e2e8f0"/>`;}
 rs.forEach((r,i)=>{
  const y=164+i*70;t(28,y+13,'L'+r.level,19);
  [['Released mean',r.beforeBuckets], ['Local measured',r.afterBuckets]].forEach(([label,b],j)=>{
   const yy=y+j*27;t(76,yy+13,label,14);let xx=x;const parts=[b[0],sum(b.slice(1,4)),b[4]],den=sum(b);
   parts.forEach((n,k)=>{const ww=w*n/den;s+=`<rect x="${xx}" y="${yy}" width="${ww}" height="20" fill="${colors[k]}"/>`;if(n/den>.08)s+=`<text x="${xx+ww/2}" y="${yy+15}" text-anchor="middle" style="fill:white;font-size:13px">${pct(n,den)}</text>`;xx+=ww;});
  });
 });
 t(28,545,'Both bars: means of 128 fresh twenty-question flights. Exact pools and targets are in the tables.',15);
 t(28,580,'Repeated-family encounters per 20 questions',22);
 t(28,607,'Released repeats vs measured local mean and allocation minimum (20 questions)',15);
 const rc=['#334155','#0072b2','#d55e00'];
 ['Released baseline','Local measured mean','Allocation minimum'].forEach((v,i)=>{s+=`<rect x="${28+i*330}" y="627" width="16" height="16" fill="${rc[i]}"/>`;t(50+i*330,640,v,14)});
 for(let n=0;n<=20;n+=5){const yy=915-n*11;t(30,yy+5,n,14);s+=`<path d="M65,${yy} H1000" stroke="#e2e8f0"/>`;}
 rs.forEach((r,i)=>{const xx=90+i*185;[r.currentRepeats,r.measuredRepeats,r.proposedRepeatFloor].forEach((n,j)=>{s+=`<rect x="${xx+j*43}" y="${915-n*11}" width="34" height="${n*11}" fill="${rc[j]}"/>`;t(xx+j*43+3,907-n*11,Number(n.toFixed(2)),14)});t(xx+40,943,'L'+r.level,18)});
 t(28,982,'Repeat means an encounter beyond the first occurrence of its family, anywhere in the flight.',15);
 t(28,1007,'L1 / L4 / L5 retain current pools. More focus can mean fewer distinct facts in a short flight.',15);
 return s+'</svg>\n';
}
let figures='';
for(const activity of Object.keys(names)){
 const rs=rows.filter(r=>r.activity===activity),file=`docs/images/educator-guide/${activity}-mix.svg`;output.set(file,svg(activity,rs));
 figures+=`### ${names[activity]}\n\n![${names[activity]} released and measured local mix and repetition, all five levels](images/educator-guide/${activity}-mix.svg)\n\n`;
 figures+='| Level | Released pool selected / earlier / identity | Approved target selected / earlier / identity | Ordinary review split | Repeats in 20: released → local mean (minimum) |\n|---|---|---|---|---|\n';
 for(const r of rs){const fmt=b=>[b[0],sum(b.slice(1,4)),b[4]].map(n=>pct(n,sum(b))).join(' / ');figures+=`| L${r.level} | ${fmt(r.currentBuckets)} | ${r.unchanged?'Unchanged: ':''}${fmt(r.proposedBuckets)} | ${r.unchanged?'Existing pool':r.proposedBuckets.slice(1,4).map((n,i)=>n?`L${i+1}: ${n}/20`:'').filter(Boolean).join('; ')||'None'} | ${r.currentRepeats} → ${r.measuredRepeats.toFixed(2)} (${r.proposedRepeatFloor}–${r.zeroIdentityRepeatFloor}) |\n`;}
 figures+='\nTarget percentages show the identity ceiling filled; missing identity capacity moves to selected-tier ordinary facts. Minimum endpoints correspond to using and not using that slot. The local implementation uses one identity per cycle where eligible; five-question flights share the cycle in memory.\n\n';
 if(['addition','subtraction'].includes(activity)){
  figures+=`Even ordinary advanced facts differ structurally. ${rs.filter(r=>r.level>=4).map(r=>`L${r.level}: ${r.structure.noRegroup}/${r.families} (${pct(r.structure.noRegroup,r.families)}) require no ${activity==='addition'?'carrying':'borrowing'}`).join('; ')}. These overlapping descriptors are not mastery or difficulty ratings.\n\n`;
 }
}
const ranges='| Activity | Level | Current range label | Families | Ordinary families by earliest L1 / L2 / L3 / L4 / L5 | Zero/identity families |\n|---|---|---|---:|---|---:|\n'+rows.map(r=>`| ${names[r.activity]} | L${r.level} | ${r.label} | ${r.families.toLocaleString('en-US')} | ${r.nonIdentityTiers.join(' / ')} | ${sum(r.identityTiers)} |`).join('\n');
const findings='The released baseline and local implementation each use 128 seeds per scope at 5 and 20 questions, plus 128 chains of four five-question flights. Local chains carry allocation state across flights. Counts below compare the same test design, not learner performance. Immediate repeats in unchanged scopes remain a known limitation; tighter selected-tier allocation can require relaxing the three-family gap.\n\n| Activity | Level | Identity run: before → local | Same-answer run: before → local | Recent-three-family repeat encounters: before → local (total / 2,560) | Exact boundary duplicates: before → local (/384) |\n|---|---|---:|---:|---:|---:|\n'+rows.map(r=>{const a=r.simulations['20'].sequence,b=r.measured.simulations['20'].sequence;return `| ${names[r.activity]} | L${r.level} | ${a.longestIdentityRun.max} → ${b.longestIdentityRun.max} | ${a.longestSameAnswerRun.max} → ${b.longestSameAnswerRun.max} | ${a.recentFamilyRepeats.total} → ${b.recentFamilyRepeats.total} | ${r.repeatChains.exactAtBoundary} → ${r.measured.repeatChains.exactAtBoundary} |`}).join('\n')+'\n\nAll identity, exact/family repeat, shared-operand and neighboring-pattern counters remain available in the [generated dataset](data/educator-practice-data.json). Similarity measures overlap and must not be added.';
const method=`The audit contains **40 scopes, 30,720 synthetic flights and 230,400 generated questions**. It uses 128 deterministic seeds dispersed across the random-number state space, not learner histories. Both mix bars show sampled means; exact family counts remain in the tables. Local bars use newly generated samples. Allocation targets are recorded in the [documentation-only allocation input](data/question-mix-proposal.json).\n\nThe [complete generated dataset](data/educator-practice-data.json) records exact counts, simulated distributions, sequence diagnostics and source hashes. SHA-256 fingerprints normalize line endings; no machine paths or timestamps are captured.\n\n| Source | SHA-256 |\n|---|---|\n${Object.entries(hashes).map(([p,h])=>`| \`${p}\` | \`${h}\` |`).join('\n')}`;
let guide=read('docs/what-children-practice.md');
const sections={STATUS:`**Source check:** the local generator ${matchesRelease?'matches':'does not match'} the local \`v6.2.0\` release tag. This is a source comparison, not verification of a live deployment. Allocation: \`${proposal.id}\`, dated ${proposal.reviewDate}; **${proposal.status.toLowerCase()}**. Released baseline data is retained separately; local generator version is numbered-mix-v1.`,RANGES:ranges,'ACTIVITY FIGURES':figures.trim(),'SEQUENCE FINDINGS':findings,METHOD:method};
for(const [key,value] of Object.entries(sections)){const start=`<!-- BEGIN GENERATED ${key} -->`,end=`<!-- END GENERATED ${key} -->`;assert(guide.includes(start)&&guide.includes(end));const a=guide.indexOf(start)+start.length,b=guide.indexOf(end);guide=guide.slice(0,a)+'\n'+value+'\n'+guide.slice(b);}
output.set('docs/what-children-practice.md',guide);
let stale=[];for(const [file,value] of output){if(check){if(!fs.existsSync(path.join(root,file))||read(file)!==value)stale.push(file);}else{fs.mkdirSync(path.dirname(path.join(root,file)),{recursive:true});fs.writeFileSync(path.join(root,file),value);}}
if(stale.length){console.error('Stale generated documentation: '+stale.join(', '));process.exitCode=1;}else console.log(`${check?'Verified':'Generated'} educator guide, eight graphs and synthetic dataset (40 scopes).`);
