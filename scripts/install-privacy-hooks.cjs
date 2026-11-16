// Installs repository-local hooks only; never overwrites a different hook setup.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=cp.execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const config=cp.spawnSync('git',['config','--get','core.hooksPath'],{cwd:root,encoding:'utf8'});
if(config.status!==0&&config.status!==1)throw Error('Could not inspect hook configuration.');
if(config.stdout.trim()&&config.stdout.trim()!=='.githooks')throw Error('Existing hook configuration preserved. Integrate the privacy checks with it before proceeding.');
const defaultHooks=cp.execFileSync('git',['rev-parse','--git-path','hooks'],{cwd:root,encoding:'utf8'}).trim();
if(!config.stdout.trim()&&fs.existsSync(path.resolve(root,defaultHooks))&&fs.readdirSync(path.resolve(root,defaultHooks)).some(name=>!name.endsWith('.sample')))throw Error('Existing hooks preserved. Integrate the privacy checks before installing.');
for(const name of ['pre-commit','commit-msg'])fs.chmodSync(path.join(root,'.githooks',name),0o755);
cp.execFileSync('git',['config','--local','core.hooksPath','.githooks'],{cwd:root});
console.log('Repository-local privacy hooks enabled. Run the identity check before your next commit.');
