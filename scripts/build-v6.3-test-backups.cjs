// Generate portable, invented learner backups for manual candidate testing.
// Usage: node scripts/build-v6.3-test-backups.cjs <output-directory>
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const destination=process.argv[2];if(!destination)throw Error('Provide an output directory for synthetic test backups.');
const root=path.resolve(__dirname,'..'),fixtures=require('../tests/focus-fixtures.cjs'),context=vm.createContext({structuredClone});
for(const file of ['math-activities','content-definitions','family-practice','profile-store'])vm.runInContext(fs.readFileSync(path.join(__dirname,file+'.js'),'utf8'),context);
fs.mkdirSync(destination,{recursive:true});
for(const [prefix,name,all,file] of [['c1000000','Demo Focus',false,'v6.3-demo-focus.json'],['c2000000','Demo All Ready',true,'v6.3-demo-all-ready.json']]){
 const profile={id:`${prefix}-0000-4000-8000-000000000000`,name,createdAt:'2026-01-01T00:00:00.000Z'};
 const sessions=fixtures(profile.id,all).map((s,i)=>({...s,id:`${prefix}-0000-4000-8000-${String(i+1).padStart(12,'0')}`,learnerName:name}));
 const backup={format:'fact-flight-learner-export',version:1,exportedAt:'2026-11-19T12:00:00.000Z',profile,sessions};
 const json=JSON.stringify(backup,null,2);assert.equal(JSON.stringify(context.FlightProfileStore.parseExport(json)),JSON.stringify(backup));
 fs.writeFileSync(path.join(destination,file),json+'\n');console.log(`PASS ${file}: ${sessions.length} synthetic flights; validated by current importer.`);
}
