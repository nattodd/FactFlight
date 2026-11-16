const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const {inspect,safeAuthor,commitIdentity}=require('../scripts/privacy-check.cjs');
let passed=0;function test(name,fn){fn();passed++;console.log('PASS '+name)}
const win=['C:', 'Users', 'PrivatePerson', 'report.txt'].join('\\');
test('Personal paths include slash, backslash and JSON-escaped variants',()=>{
 for(const value of [win,win.replaceAll('\\','/'),JSON.stringify(win),['','Users','PrivatePerson','file'].join('/'),['','home','PrivatePerson','file'].join('/')])assert(inspect('report.md',Buffer.from(value)).some(x=>x.rule==='personal-home-path'));
 assert.equal(inspect('report.md',Buffer.from('<USER_HOME>/reports/test.json')).length,0);
});
test('Private emails fail; GitHub noreply and synthetic example domains pass',()=>{
 const address=['private-person','icloud.com'].join('@');assert(inspect('note.md',Buffer.from(address)).some(x=>x.rule==='personal-email'));
 assert(!safeAuthor(address));assert(safeAuthor('123+developer@users.noreply.github.com'));
 assert.equal(inspect('note.md',Buffer.from('sample@example.com developer@users.noreply.github.com')).length,0);
});
test('Secret-shaped values and sensitive filenames are blocked without echoing values',()=>{
 const values=['gh'+'p_'+'A'.repeat(36),'AK'+'IA'+'B'.repeat(16),'-----BEGIN '+'PRIVATE KEY-----','https://'+'user:secret'+'@host.invalid',"password"+" = '"+'private-value'+"'"];
 for(const value of values){const found=inspect('file.txt',Buffer.from(value));assert(found.length);assert(!JSON.stringify(found).includes(value))}
 for(const name of ['.env','private.pem','fact-flight-'+'learner.json'])assert(inspect(name,Buffer.from('')).some(x=>x.rule==='private-file-name'));
});
test('Binary metadata is inspected and line numbers identify findings',()=>{
 assert(inspect('image.png',Buffer.concat([Buffer.from([137,80,78,71,0]),Buffer.from(win)])).length);
 assert.equal(inspect('report.md',Buffer.from('safe\n'+win))[0].line,2);
});
test('New commit metadata is checked without rewriting history',()=>{
 const header='author Fixture <fixture@users.noreply.github.com> 0 +0000\ncommitter Fixture <fixture@users.noreply.github.com> 0 +0000\n\n';
 assert.equal(commitIdentity(Buffer.from(header+'Safe message')).length,0);
 assert(commitIdentity(Buffer.from(header+win)).length);
 assert(commitIdentity(Buffer.from(header.replace('fixture@users.noreply.github.com',['person','icloud.com'].join('@'))+'Safe message')).length);
});
const root=path.resolve(__dirname,'..'),temp=fs.mkdtempSync(path.join(os.tmpdir(),'ff-privacy-guard-'));
const git=(...args)=>cp.execFileSync('git',args,{cwd:temp,stdio:'pipe'});
const run=(...args)=>cp.spawnSync(process.execPath,[path.join(root,'scripts/privacy-check.cjs'),...args],{cwd:temp,encoding:'utf8'});
try{
 git('init','--quiet');git('config','user.name','Privacy fixture');git('config','user.email','fixture@users.noreply.github.com');
 test('Staged check reads staged bytes, not a cleaned unstaged copy',()=>{
  fs.writeFileSync(path.join(temp,'sample.md'),win);git('add','sample.md');fs.writeFileSync(path.join(temp,'sample.md'),'<USER_HOME>/report.txt');
  const result=run('--staged');assert.equal(result.status,1);assert(!result.stderr.includes('PrivatePerson'));assert.equal(run('--worktree').status,0);
  git('add','sample.md');assert.equal(run('--staged').status,0);
 });
 test('Forced staging cannot bypass ignored private-file rejection',()=>{
  fs.writeFileSync(path.join(temp,'.gitignore'),'.env\n');fs.writeFileSync(path.join(temp,'.env'),'placeholder');git('add','-f','.env');assert.equal(run('--staged').status,1);git('rm','--cached','-f','.env');fs.unlinkSync(path.join(temp,'.env'));
 });
 test('Commit messages and future author identities are checked',()=>{
  const message=path.join(temp,'message.txt');fs.writeFileSync(message,win);assert.equal(run('--message',message).status,1);fs.unlinkSync(message);
  assert.equal(run('--identity').status,0);git('config','user.email',['person','icloud.com'].join('@'));const result=run('--identity');assert.equal(result.status,1);assert(!result.stderr.includes('icloud'));git('config','user.email','fixture@users.noreply.github.com');
 });
 test('Actual pre-commit hook blocks unsafe staged data without creating a commit',()=>{
  fs.mkdirSync(path.join(temp,'scripts'));fs.copyFileSync(path.join(root,'scripts/privacy-check.cjs'),path.join(temp,'scripts/privacy-check.cjs'));
  fs.mkdirSync(path.join(temp,'.githooks'));
  for(const name of ['pre-commit','commit-msg']){const target=path.join(temp,'.githooks',name);fs.copyFileSync(path.join(root,'.githooks',name),target);fs.chmodSync(target,0o755)}
  git('config','core.hooksPath','.githooks');
  fs.writeFileSync(path.join(temp,'sample.md'),win);git('add','sample.md');
  const blocked=cp.spawnSync('git',['hook','run','pre-commit'],{cwd:temp,encoding:'utf8'});assert.notEqual(blocked.status,0);assert(blocked.stderr.includes('personal-home-path'),blocked.stderr);
  fs.writeFileSync(path.join(temp,'sample.md'),'<USER_HOME>/report.txt');git('add','sample.md');git('hook','run','pre-commit');
 });
 test('Actual commit-message hook refuses personal paths without exposing the value',()=>{
  const message=path.join(temp,'message.txt');fs.writeFileSync(message,win);
  const blocked=cp.spawnSync('git',['hook','run','commit-msg','--',message],{cwd:temp,encoding:'utf8'});
  assert.notEqual(blocked.status,0);assert(blocked.stderr.includes('personal-home-path'));assert(!blocked.stderr.includes('PrivatePerson'));
  fs.writeFileSync(message,'Safe commit message');git('hook','run','commit-msg','--',message);fs.unlinkSync(message);
 });
}finally{
 // Only delete this test's freshly created, resolved temporary directory.
 const resolved=path.resolve(temp);assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));assert(path.basename(resolved).startsWith('ff-privacy-guard-'));fs.rmSync(resolved,{recursive:true,force:true});
}
console.log(`PASS ${passed} privacy safeguard tests`);
