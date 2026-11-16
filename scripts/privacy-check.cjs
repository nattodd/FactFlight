// Local-only guard. Reports locations and rule names, never matched values.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const rules=[
 ['personal-home-path',/(?:\b[A-Z]:[\\/]+Users[\\/]+[^\\/\s"<>]+|(?<![A-Z0-9:/])\/(?:Users|home)\/[^/\s"<>]+)/gi],
 ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
 ['credential-url',/https?:\/\/[^\s/:"']+:[^\s/@"']+@/g],
 ['service-token',/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|xox[baprs]-[A-Za-z0-9-]{20,})\b/g],
 ['credential-literal',/\b(?:password|passwd|api[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token)\s*[=:]\s*["']([^"'\r\n]{4,})["']/gi],
];
const email=/[A-Z0-9.!#$%&'*+/=?^_`{|}~\[\]-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const safeEmail=value=>/@(?:users\.noreply\.github\.com|noreply\.github\.com|example\.(?:com|org|net)|[^@]+\.(?:test|invalid))$/i.test(value)||/^noreply@github\.com$/i.test(value);
const safeAuthor=value=>/@(?:users\.noreply\.github\.com|noreply\.github\.com)$/i.test(value)||/^noreply@github\.com$/i.test(value);
function inspect(file,bytes){
 const findings=[],text=bytes.toString('utf8');
 if(/(?:^|\/)(?:\.env(?:\..*)?|\.netrc|id_rsa|id_ed25519|credentials(?:\.json)?|[^/]+\.(?:pem|p12|pfx|key)|fact-flight-[^/]*\.json)$/i.test(file))findings.push({file,line:1,rule:'private-file-name'});
 const add=(rule,match)=>findings.push({file,line:text.slice(0,match.index).split('\n').length,rule});
 for(const [rule,re] of rules){re.lastIndex=0;for(const m of text.matchAll(re))add(rule,m)}
 // Compressed image bytes can coincidentally resemble arbitrary email addresses.
 // Check all email domains in text; inspect common personal domains in binaries.
 const binary=bytes.includes(0)||bytes.subarray(0,4).equals(Buffer.from([137,80,78,71]));
 for(const m of text.matchAll(email))if(!safeEmail(m[0])&&(!binary||/@(?:icloud|gmail|outlook|hotmail|yahoo)\./i.test(m[0])))add('personal-email',m);
 return findings;
}
function git(args,options={}){return cp.execFileSync('git',args,{maxBuffer:32*1024*1024,...options})}
function scan(mode='--worktree',ref){
 const root=git(['rev-parse','--show-toplevel']).toString().trim();
 const command=mode==='--staged'?['diff','--cached','--name-only','--diff-filter=ACMR','-z']:mode==='--ref'?['ls-tree','-rz','--name-only',ref]:['ls-files','--cached','--others','--exclude-standard','-z'];
 const files=[...new Set(git(command).toString().split('\0').filter(Boolean))];const findings=[];
 for(const file of files){
  let bytes;
  if(mode==='--staged')bytes=git(['show',':'+file]);
  else if(mode==='--ref')bytes=git(['show',ref+':'+file]);
  else{
   const name=path.join(root,file);if(!fs.existsSync(name))continue;
   const resolved=fs.realpathSync(name),relative=path.relative(root,resolved);
   if(relative==='..'||relative.startsWith('..'+path.sep)||path.isAbsolute(relative)){findings.push({file,line:1,rule:'external-file-reference'});continue}
   bytes=fs.readFileSync(name);
  }
  findings.push(...inspect(file,bytes));
 }
 return {files:files.length,findings};
}
function identity(){
 const findings=[];
 for(const key of ['GIT_AUTHOR_IDENT','GIT_COMMITTER_IDENT']){
  const value=git(['var',key]).toString(),match=value.match(/<([^>]+)>/);
  if(!match||!safeAuthor(match[1]))findings.push({file:'Git identity',line:1,rule:'use-github-noreply-'+key.toLowerCase()});
 }
 return findings;
}
function commitIdentity(bytes){
 const text=bytes.toString(),header=text.split('\n\n')[0],findings=inspect('commit message',Buffer.from(text.slice(header.length+2)));
 for(const key of ['author','committer']){
  const match=header.match(new RegExp('^'+key+' .+ <([^>]+)>','m'));
  if(!match||!safeAuthor(match[1]))findings.push({file:'Git identity',line:1,rule:'use-github-noreply-'+key});
 }
 return findings;
}
function main(args){
 let result;
 if(args[0]==='--identity')result={files:0,findings:identity()};
 else if(args[0]==='--commit'){
  if(!/^[0-9a-f]{40,64}$/i.test(args[1]||''))throw Error('Use a full SHA.');
  result={files:0,findings:commitIdentity(git(['cat-file','commit',args[1]]))};
 }
 else if(args[0]==='--message')result={files:1,findings:inspect('commit message',fs.readFileSync(args[1]))};
 else if(['--worktree','--staged','--ref'].includes(args[0]||'--worktree')){
  if(args[0]==='--ref'&&!/^[0-9a-f]{40,64}$/i.test(args[1]||''))throw Error('Use a full commit SHA for --ref.');
  result=scan(args[0],args[1]);
 }else throw Error('Usage: node scripts/privacy-check.cjs [--worktree|--staged|--ref SHA|--commit SHA|--identity|--message FILE]');
 for(const f of result.findings)console.error(`${f.file}:${f.line}: ${f.rule} (value redacted)`);
 if(result.findings.length){console.error(`Privacy check blocked: ${result.findings.length} finding(s). Redact values; do not bypass the check.`);return 1}
 console.log(`Privacy check passed (${result.files} files).`);return 0;
}
if(require.main===module){try{process.exitCode=main(process.argv.slice(2))}catch{console.error('Privacy check could not complete; refusing to pass. Check Git, Node and file access.');process.exitCode=1}}
module.exports={inspect,scan,safeAuthor,commitIdentity};
