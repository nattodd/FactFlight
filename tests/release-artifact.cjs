// Verify the actual static release tree, not a hidden-link or routing-only exclusion.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),http=require('node:http');
const root=path.resolve(__dirname,'..'),results=[];
async function test(name,fn){await fn();results.push({name,status:'PASS'});console.log('PASS '+name)}
const removed=['microphone-lab.html','scripts/microphone-lab.js'];
const server=http.createServer((req,res)=>{const relative=req.url==='/'?'index.html':req.url.slice(1);const file=path.resolve(root,relative);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}res.end(fs.readFileSync(file))});
(async()=>{
 await test('Executable lab files are absent from the release tree',()=>{for(const file of removed)assert(!fs.existsSync(path.join(root,file)),file)});
 await test('Application assets have no lab dependency and identify the release candidate',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert(html.includes('name="application-version" content="6.2.0-rc.1"'));
 for(const file of ['index.html',...fs.readdirSync(path.join(root,'scripts')).filter(f=>f.endsWith('.js')).map(f=>'scripts/'+f)])assert(!fs.readFileSync(path.join(root,file),'utf8').includes('microphone-lab'),file);
 for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){const asset=match[1];if(!/^(https?:|data:)/.test(asset))assert(fs.existsSync(path.join(root,asset)),asset)}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 await test('Static hosting serves the app and returns 404 for both retired lab URLs',async()=>{assert.equal((await fetch(base+'/')).status,200);for(const file of removed)assert.equal((await fetch(base+'/'+file)).status,404)});
 if(process.env.FF_TEST_OUTPUT){fs.mkdirSync(process.env.FF_TEST_OUTPUT,{recursive:true});fs.writeFileSync(path.join(process.env.FF_TEST_OUTPUT,'release-artifact-results.json'),JSON.stringify(results,null,2))}
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>server.close());
