const {test,before,after,beforeEach}=require('node:test');
const {initializeTestEnvironment,assertSucceeds,assertFails}=require('@firebase/rules-unit-testing');
const {doc,setDoc,getDoc,collection,getDocs,runTransaction,serverTimestamp,updateDoc}=require('firebase/firestore');
const fs=require('fs');let env;
before(async()=>{env=await initializeTestEnvironment({projectId:'demo-garud',firestore:{rules:fs.readFileSync('firestore.rules','utf8')}})});
after(async()=>{await env?.cleanup()});
beforeEach(async()=>{await env.clearFirestore();await env.withSecurityRulesDisabled(async c=>{let db=c.firestore();await setDoc(doc(db,'roles','n1'),{role:'nurse'});await setDoc(doc(db,'roles','a1'),{role:'admin'});await setDoc(doc(db,'officers','n1'),{uid:'n1',employeeId:'NO1',name:'Test Nurse',active:true});await setDoc(doc(db,'wards','1'),{name:'Ward One',enabled:true,floor:0});await setDoc(doc(db,'wards','2'),{name:'Ward Two',enabled:true,floor:0});})});
function db(uid){return env.authenticatedContext(uid,{email:uid+'@example.com'}).firestore()}
async function move(d,uid,action,w,id){const state=doc(d,'current',uid),ev=doc(d,'events',id);return runTransaction(d,async t=>{let old=await t.get(state);let p=old.exists()?old.data():null;t.set(ev,{officerUid:uid,wardId:w,action,at:serverTimestamp(),prevEventId:p?.lastEventId||null});t.set(state,{officerUid:uid,wardId:action==='ENTRY'?w:null,since:serverTimestamp(),lastEventId:id})})}
test('anonymous clients cannot read officer roster',async()=>assertFails(getDocs(collection(env.unauthenticatedContext().firestore(),'officers'))));
test('nurse can enter and exit own ward atomically',async()=>{await assertSucceeds(move(db('n1'),'n1','ENTRY',1,'e1'));await assertSucceeds(move(db('n1'),'n1','EXIT',1,'e2'))});
test('duplicate entry and wrong ward exit are rejected',async()=>{await move(db('n1'),'n1','ENTRY',1,'e1');await assertFails(move(db('n1'),'n1','ENTRY',2,'e2'));await assertFails(move(db('n1'),'n1','EXIT',2,'e3'))});
test('officers cannot impersonate colleagues',async()=>assertFails(move(db('n1'),'other','ENTRY',1,'e1')));
test('officers cannot grant themselves admin or edit roster',async()=>{await assertFails(setDoc(doc(db('n1'),'roles','n1'),{role:'admin'}));await assertFails(updateDoc(doc(db('n1'),'officers','n1'),{active:false}))});
test('events cannot be written without paired current state',async()=>assertFails(setDoc(doc(db('n1'),'events','alone'),{officerUid:'n1',wardId:1,action:'ENTRY',at:serverTimestamp(),prevEventId:null})));
test('current state cannot be written without event',async()=>assertFails(setDoc(doc(db('n1'),'current','n1'),{officerUid:'n1',wardId:1,since:serverTimestamp(),lastEventId:'missing'})));
test('existing events cannot be changed',async()=>{await move(db('n1'),'n1','ENTRY',1,'e1');await assertFails(updateDoc(doc(db('n1'),'events','e1'),{wardId:2}))});
test('admin can read roster but cannot submit a nurse scan',async()=>{await assertSucceeds(getDocs(collection(db('a1'),'officers')));await assertFails(move(db('a1'),'a1','ENTRY',1,'e1'))});
test('pending account cannot access movements',async()=>assertFails(getDocs(collection(db('pending'),'events'))));
