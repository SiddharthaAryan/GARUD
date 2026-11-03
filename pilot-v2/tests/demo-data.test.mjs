import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const page=fs.readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
const source=page.slice(page.indexOf('type Ward='),page.indexOf('export default function Home'));
const js=ts.transpile(source,{target:ts.ScriptTarget.ES2022});
const {seed,distribution}=new Function(js+';return {seed,distribution}')();
test('synthetic histories contain varied ward splits and consistent current states',()=>{
 const d=seed();assert.equal(d.nurses.length,600);
 assert.equal(d.nurses.filter(n=>n.ward_id!==null).length,80);
 const signatures=new Set();
 for(const n of d.nurses.slice(0,100)){
  const es=d.events.filter(e=>e.user_id===n.id);
  let loc=null;
  for(const e of es){assert.ok(e.at<=d.serverTime);if(e.action==='IN'){assert.equal(loc,null);loc=e.ward_id}else{assert.equal(loc,e.ward_id);loc=null}}
  assert.equal(n.ward_id,loc);assert.equal(n.since,es.at(-1).at);
  const split=distribution(d,n.id);
  assert.ok(split.filter(x=>x.id>0).length>=2);
  assert.ok(split.some(x=>x.id===0));
  assert.equal(split.reduce((s,x)=>s+x.value,0),d.serverTime-es[0].at);
  signatures.add(split.map(x=>x.id+':'+x.value).join(','));
 }
 assert.ok(signatures.size>50);
 assert.equal(d.nurses[0].ward_id,1);assert.equal(d.nurses[1].ward_id,5);
 assert.ok(d.nurses.slice(100).every(n=>distribution(d,n.id).length===0));
});
