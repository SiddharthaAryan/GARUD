/* GARUD: no credentials or staff records are embedded in the source. */
const params=new URLSearchParams(location.search);
let qrModule;
async function buildQR(){
 const grid=document.getElementById('qrGrid');if(grid.children.length)return;
 try{
 qrModule=qrModule||await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.4/+esm');
 for(const w of wards)for(const action of ['ENTRY','EXIT']){
  const url=new URL(location.pathname,location.origin);url.searchParams.set('ward',w.id);url.searchParams.set('action',action);if(!window.garudLive)url.searchParams.set('demo','1');
  const card=document.createElement('div');card.className='card';const title=document.createElement('h2');title.textContent=`Ward ${w.id} · ${action}`;card.append(title);const label=document.createElement('p');label.textContent=w.name;card.append(label);const canvas=document.createElement('canvas');card.append(canvas);const api=qrModule.default||qrModule;await api.toCanvas(canvas,url.href,{width:210,margin:2});const a=document.createElement('a');a.href=url.href;a.textContent='Open '+action.toLowerCase()+' link';card.append(a);const note=document.createElement('p');note.className='muted';note.textContent=window.garudLive?'Sign in with your enrolled account. Static QR; physical presence not verified.':'DEMO ONLY · simulated identity';card.append(note);grid.append(card);
 }
 }catch(e){grid.textContent='QR generation unavailable. Check internet access and reopen this page.'}
}
if(params.has('ward')&&params.get('demo')==='1'){document.getElementById('scanWard').value=params.get('ward');showPage('scan');document.getElementById('scanResult').textContent='Demo QR opened. Select a synthetic officer and simulate '+params.get('action')+'.'}
(async()=>{
 if(params.get('demo')==='1'||!window.GARUD_CONFIG?.projectId){document.getElementById('authStatus').textContent='Cloud project not configured.';return;}
 window.garudLive=true;
 const gate=document.getElementById('gate'),status=document.getElementById('authStatus');gate.classList.remove('hidden');
 document.getElementById('modeLabel').textContent='CLOUD PILOT · AUTHENTICATION REQUIRED';
 const fail=message=>{const e=document.getElementById('cloudError');e.textContent=message;e.classList.remove('hidden');};
 try{
 const [appSDK,authSDK,dbSDK]=await Promise.all([import('https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js')]);
 const app=appSDK.initializeApp(window.GARUD_CONFIG),auth=authSDK.getAuth(app),db=dbSDK.getFirestore(app);
 const {doc,collection,getDoc,setDoc,onSnapshot,query,where,orderBy,limit,runTransaction,serverTimestamp}=dbSDK;
 let unsubs=[],userNow=null,role=null,rosterReady=false,currentReady=false,autoDone=false;
 const logout=()=>authSDK.signOut(auth);document.getElementById('logout').onclick=logout;document.getElementById('gateLogout').onclick=logout;
 document.getElementById('googleLogin').onclick=async()=>{status.textContent='Opening secure Google sign-in…';try{await authSDK.signInWithPopup(auth,new authSDK.GoogleAuthProvider())}catch(e){status.textContent=e.message}};
 status.textContent='Sign in to continue.';
 const note=document.getElementById('notice');note.textContent='Connected pilot · last recorded QR location, not continuous tracking. Only approved pilot records. No patient data.';
 const originalScan=scan;
 scan=async function(action){
 if(!userNow||!role){fail('Sign in with an approved staff account.');return}
 if(role==='admin'){fail('Administrators monitor the dashboard. Only enrolled nursing officers may record their own scans.');return}
 if(!navigator.onLine){document.getElementById('scanResult').textContent='Offline. Scan has NOT been recorded. Reconnect and scan again.';return}
 const w=Number(document.getElementById('scanWard').value),officerRef=doc(db,'officers',userNow.uid),stateRef=doc(db,'current',userNow.uid),eventRef=doc(collection(db,'events'));
 document.querySelectorAll('#scan button').forEach(b=>b.disabled=true);
 try{await runTransaction(db,async tx=>{
 const [off,old,ward]=await Promise.all([tx.get(officerRef),tx.get(stateRef),tx.get(doc(db,'wards',String(w)))]);
 if(!off.exists()||!off.data().active)throw Error('Your officer profile is not active.');if(!ward.exists()||!ward.data().enabled)throw Error('This ward is not enabled.');
 const prev=old.exists()?old.data():null;
 if(action==='ENTRY'&&prev?.wardId===w)throw Error('Already recorded in this ward. Duplicate entry ignored.');
 if(action==='ENTRY'&&prev?.wardId)throw Error('Exit your recorded ward first, or request a correction.');
 if(action==='EXIT'&&prev?.wardId!==w)throw Error('Exit rejected: this is not your recorded ward.');
 tx.set(eventRef,{officerUid:userNow.uid,wardId:w,action,at:serverTimestamp(),prevEventId:prev?.lastEventId||null});
 tx.set(stateRef,{officerUid:userNow.uid,wardId:action==='ENTRY'?w:null,since:serverTimestamp(),lastEventId:eventRef.id});
 });document.getElementById('scanResult').textContent=(action==='ENTRY'?'Welcome, ':'Thank you, ')+(nurses.find(n=>n.uid===userNow.uid)?.name||'Nursing Officer')+'. '+action+' recorded for Ward '+w+'.';
 }catch(e){document.getElementById('scanResult').textContent=e.message}finally{document.querySelectorAll('#scan button').forEach(b=>b.disabled=false)}
 };
 function update(){if(!rosterReady||!currentReady)return;render();document.getElementById('stats').querySelectorAll('small')[0].textContent='Approved pilot roster';if(role==='nurse'){showPage('scan');const own=nurses.find(n=>n.uid===userNow.uid);document.getElementById('scanNurse').innerHTML='';if(own)document.getElementById('scanNurse').add(new Option(own.name,own.id));document.getElementById('scanNurse').disabled=true}if(params.has('ward')&&!autoDone&&role==='nurse'){autoDone=true;const w=Number(params.get('ward')),a=params.get('action');if(wards.some(x=>x.id===w)&&['ENTRY','EXIT'].includes(a)){document.getElementById('scanWard').value=String(w);showPage('scan');scan(a)}}}
 let currentDocs=[];
 function merge(){for(const e of events){e.officer=nurses.find(n=>n.uid===e.uid)?.id||e.officer}for(const n of nurses){const s=currentDocs.find(x=>x.id===n.uid);n.ward=s?.wardId||null;n.since=s?.since?.toMillis()||null}update()}
 authSDK.onAuthStateChanged(auth,async user=>{
 unsubs.forEach(f=>f());unsubs=[];nurses=[];events=[];currentDocs=[];role=null;rosterReady=false;currentReady=false;autoDone=false;render();
 userNow=user;gate.classList.remove('hidden');document.getElementById('logout').classList.add('hidden');
 if(!user){status.textContent='Sign in to continue.';return}
 document.getElementById('gateLogout').classList.remove('hidden');status.textContent='Checking approved role…';
 try{const r=await getDoc(doc(db,'roles',user.uid));if(!r.exists()||!['admin','nurse'].includes(r.data().role)){
 await setDoc(doc(db,'enrollmentRequests',user.uid),{email:user.email||'',displayName:user.displayName||'',requestedAt:serverTimestamp()},{merge:true});status.textContent='Account awaiting approval. Ask the pilot administrator to approve your account. UID: '+user.uid;return}
 role=r.data().role;gate.classList.add('hidden');document.getElementById('logout').classList.remove('hidden');document.getElementById('modeLabel').textContent='CLOUD PILOT · '+role.toUpperCase();
 if(role==='nurse'){
 document.querySelector('main>h1').textContent='Welcome, Nursing Officer';
 document.querySelectorAll('nav button').forEach(b=>{if(!['scan'].includes(b.dataset.page)&&b.id!=='logout')b.classList.add('hidden')});
 document.getElementById('stats').classList.add('hidden');document.querySelector('#scan .tag').textContent='AUTHENTICATED STAFF SCAN';document.querySelector('#scan p').textContent='Your signed-in account identifies you. Scan the entry or exit QR at the ward door.';
 }else{document.querySelector('main>h1').textContent='Welcome, Dr. Pawan Kumar Sharma';document.querySelectorAll('nav button').forEach(b=>b.classList.remove('hidden'));document.getElementById('stats').classList.remove('hidden');showPage('overview')}
 const rosterQ=role==='admin'?collection(db,'officers'):query(collection(db,'officers'),where('uid','==',user.uid));
 const currentQ=role==='admin'?collection(db,'current'):query(collection(db,'current'),where('officerUid','==',user.uid));
 const eventsQ=role==='admin'?query(collection(db,'events'),orderBy('at','desc'),limit(1000)):query(collection(db,'events'),where('officerUid','==',user.uid),orderBy('at','desc'),limit(1000));
 unsubs.push(onSnapshot(rosterQ,s=>{nurses=s.docs.map(d=>({...d.data(),uid:d.id,id:d.data().employeeId}));rosterReady=true;merge()},e=>fail('Roster unavailable: '+e.message)));
 unsubs.push(onSnapshot(currentQ,s=>{currentDocs=s.docs.map(d=>({id:d.id,...d.data()}));currentReady=true;merge()},e=>fail('Live state unavailable: '+e.message)));
 unsubs.push(onSnapshot(eventsQ,s=>{events=s.docs.map(d=>{let e=d.data();return{id:d.id,officer:nurses.find(n=>n.uid===e.officerUid)?.id||e.officerUid,uid:e.officerUid,ward:e.wardId,action:e.action,time:e.at?.toMillis()||Date.now()}});logs();document.querySelector('#logs p').textContent='Latest 1,000 recorded events · charts reflect loaded history, not guaranteed full shifts';},e=>fail('History unavailable: '+e.message)));
 unsubs.push(onSnapshot(collection(db,'wards'),s=>{wards.splice(0,wards.length,...s.docs.map(d=>({id:Number(d.id),name:d.data().name,floor:d.data().floor||0})).sort((a,b)=>a.id-b.id));document.getElementById('scanWard').innerHTML='';document.getElementById('wardFilter').innerHTML='<option value="all">All wards</option>';for(const w of wards){document.getElementById('scanWard').add(new Option('Ward '+w.id+' · '+w.name,w.id));document.getElementById('wardFilter').add(new Option('Ward '+w.id,w.id))}if(wards.length){selected=wards[0].id;update()}},e=>fail(e.message)));
 }catch(e){status.textContent='Connection error: '+e.message}
 });
 }catch(e){status.textContent='Cloud initialization failed: '+e.message}
})();
