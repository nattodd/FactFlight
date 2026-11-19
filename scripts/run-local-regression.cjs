// Full local suite; isolated test servers/Chrome contexts, never a deploy command.
// NODE_PATH must expose the separately installed Playwright package.
// Usage: node scripts/run-local-regression.cjs <private-output-directory> [suite ...]
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),destination=process.argv[2];
if(!destination)throw Error('Provide a private output directory for logs and synthetic screenshots.');
const excluded=new Set(['engine-fixture','feedback-wait','focus-fixtures','menu-route','progress-fixtures','progress-disclosure']);
const available=fs.readdirSync(path.join(root,'tests')).filter(f=>f.endsWith('.cjs')&&!excluded.has(f.slice(0,-4))).map(f=>f.slice(0,-4));
available.push('question-diversity-runtime');
const selected=process.argv.slice(3),names=selected.length?selected:available;
if(names.some(n=>!available.includes(n)))throw Error('Unknown regression suite.');
const out=path.join(path.resolve(destination),new Date().toISOString().replace(/[:.]/g,'-'));
fs.mkdirSync(out,{recursive:true});
const results=[];let next=0;
async function run(name){
 const folder=path.join(out,name);fs.mkdirSync(folder);const started=Date.now();console.log('START '+name);
 const env={...process.env,FF_TEST_OUTPUT:folder,FF_CHROME_CHANNEL:'chrome'};delete env.FF_TEST_FILTER;delete env.FF_TEST_APP_MATH;
 if(name==='question-diversity-runtime')env.FF_TEST_APP_MATH='1';
 const file=name==='question-diversity-runtime'?'question-diversity':name;
 const child=spawn(process.execPath,[path.join(root,'tests',file+'.cjs')],{cwd:root,env,windowsHide:true});let output='';
 child.stdout.on('data',s=>output+=s);child.stderr.on('data',s=>output+=s);
 const exit=await new Promise(resolve=>{child.on('error',e=>resolve({exitCode:-1,error:e.message}));child.on('close',code=>resolve({exitCode:code}))});
 const checks=output.split(/\r?\n/).flatMap(line=>{try{const v=JSON.parse(line);return v.name&&v.status?[v]:[]}catch{return []}});
 const status=exit.exitCode===0&&!checks.some(t=>t.status==='FAIL')?'PASS':'FAIL';
 results.push({suite:name,...exit,status,seconds:Math.round((Date.now()-started)/1000),checks});
 fs.writeFileSync(path.join(folder,'run.log'),output);fs.writeFileSync(path.join(out,'summary.json'),JSON.stringify(results,null,2));
 console.log(`${status} ${name} (${checks.length} individually named checks; other assertions remain in the suite log)`);
}
async function worker(){while(next<names.length)await run(names[next++])}
Promise.all([worker(),worker()]).then(()=>{const failed=results.filter(r=>r.status!=='PASS');console.log(`${results.length-failed.length}/${results.length} suite configurations passed.`);process.exitCode=failed.length?1:0}).catch(e=>{console.error(e.message);process.exitCode=1});
