import {env} from 'cloudflare:workers';
import {SETUP_HASH} from '../../../lib/setup-config';
export const dynamic='force-dynamic';
const enc=new TextEncoder();
const hex=(b:ArrayBuffer)=>Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('');
const digest=async(s:string)=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const random=()=>crypto.randomUUID();
async function hash(p:string,s:string){let k=await crypto.subtle.importKey('raw',enc.encode(p),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc.encode(s),iterations:100000},k,256))}
function eq(a:string,b:string){if(a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0}
function ok(data:any,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
function err(message:string,status=400){return ok({error:message},status)}
async function route(req:Request){
 const db=env.DB!;const path=new URL(req.url).pathname.slice(5);let body:any={};
 if(req.method==='POST'){if(Number(req.headers.get('content-length')||0)>20000)return err('Request too large',413);try{body=await req.json()}catch{return err('Invalid request')}}
 if(path==='status')return ok({configured:!!await db.prepare("SELECT key FROM pilot_settings WHERE key='setup'").first(),serverTime:Date.now()});
 if(path==='setup'&&req.method==='POST'){
  if(!eq(await digest(String(body.setupKey||'')),SETUP_HASH))return err('Invalid setup link',403);
  if(await db.prepare("SELECT key FROM pilot_settings WHERE key='setup'").first())return err('Already configured. Sign in with your pilot password.',409);
  for(const k of ['adminPassword','nurse1Password','nurse2Password'])if(typeof body[k]!=='string'||body[k].length<10||body[k].length>128)return err('Choose passwords of 10–128 characters for all three accounts.');
  const now=Date.now(),statements=[db.prepare("INSERT INTO pilot_settings(key,value) VALUES('setup',?)").bind(String(now))];
  for(const [username,name,role,p] of [['admin','Pilot administrator','admin',body.adminPassword],['nurse1','Test Nurse A','nurse',body.nurse1Password],['nurse2','Test Nurse B','nurse',body.nurse2Password]]){const salt=random();statements.push(db.prepare('INSERT INTO pilot_users(id,username,name,role,password_hash,salt) VALUES(?,?,?,?,?,?)').bind(random(),username,name,role,await hash(p,salt),salt))}
  for(let i=1;i<=5;i++)statements.push(db.prepare('INSERT INTO pilot_wards(id,name,floor,created_at) VALUES(?,?,?,?)').bind(i,['General Medicine','Surgical Ward','Critical Care','Paediatrics','Emergency'][i-1],i<4?'Ground floor':'First floor',now));
  try{await db.batch(statements)}catch{return err('Setup already completed or could not be saved. Refresh and sign in.',409)}return ok({configured:true});
 }
 if(path==='login'&&req.method==='POST'){
  const username=String(body.username||'').toLowerCase().trim();if(username.length>80||String(body.password||'').length>128)return err('Invalid credentials',401);
  const key=await digest((req.headers.get('cf-connecting-ip')||'local')+':'+username),now=Date.now(),a:any=await db.prepare('SELECT * FROM pilot_attempts WHERE key=?').bind(key).first();if(a&&now-a.since<900000&&a.count>=8)return err('Too many attempts. Try again in 15 minutes.',429);
  let u:any=await db.prepare('SELECT * FROM pilot_users WHERE username=? AND active=1').bind(username).first();
  if(!u){const names=await db.prepare('SELECT * FROM pilot_users WHERE lower(name)=? AND active=1 LIMIT 2').bind(username).all();if(names.results.length===1)u=names.results[0];}
  if(!u||!eq(await hash(String(body.password||''),u.salt),u.password_hash)){await db.prepare('INSERT INTO pilot_attempts(key,count,since) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN since<? THEN 1 ELSE count+1 END,since=CASE WHEN since<? THEN excluded.since ELSE since END').bind(key,now,now-900000,now-900000).run();return err('Incorrect username or password',401)}
  await db.prepare('DELETE FROM pilot_attempts WHERE key=?').bind(key).run();const token=random()+random();await db.prepare('INSERT INTO pilot_sessions(hash,user_id,expires_at) VALUES(?,?,?)').bind(await digest(token),u.id,now+8*3600000).run();return ok({token,user:{id:u.id,username:u.username,name:u.name,role:u.role}});
 }
 const token=req.headers.get('authorization')?.replace(/^Bearer /,'')||'';if(!token)return err('Sign in to live mode',401);
 const u:any=await db.prepare('SELECT u.* FROM pilot_users u JOIN pilot_sessions s ON u.id=s.user_id WHERE s.hash=? AND s.expires_at>? AND u.active=1').bind(await digest(token),Date.now()).first();if(!u)return err('Session expired. Sign in again.',401);
 if(path==='logout'){await db.prepare('DELETE FROM pilot_sessions WHERE hash=?').bind(await digest(token)).run();return ok({ok:true})}
 if(path==='state'){
  const ws=await db.prepare('SELECT * FROM pilot_wards ORDER BY id').all();const ns=await db.prepare('SELECT id,username,name,ward_id,since,version FROM pilot_users WHERE role=? AND active=1'+(u.role==='admin'?'':' AND id=?')).bind(...(u.role==='admin'?['nurse']:['nurse',u.id])).all();
  const es=await db.prepare('SELECT * FROM pilot_events'+(u.role==='admin'?'':' WHERE user_id=?')+' ORDER BY at DESC LIMIT 2000').bind(...(u.role==='admin'?[]:[u.id])).all();return ok({user:{id:u.id,username:u.username,name:u.name,role:u.role},wards:ws.results,nurses:ns.results,events:es.results,serverTime:Date.now(),historyLimit:2000});
 }
 if(path==='scan'&&req.method==='POST'){
  if(u.role!=='nurse')return err('Only a nursing-officer account can record its own movement.',403);const w=Number(body.wardId),action=body.action;if(!['IN','OUT'].includes(action)||!Number.isInteger(w))return err('Invalid QR destination');
  const ward:any=await db.prepare('SELECT * FROM pilot_wards WHERE id=?').bind(w).first();if(!ward)return err('Ward not found',404);
  if(Number(body.qrVersion)!==ward.qr_version||ward.qr_version<1)return err('This sticker has been replaced or has not been issued. Ask the administrator for the latest QR.',409);
  if(action==='IN'&&u.ward_id===w)return err('Already recorded in this ward. Duplicate entry ignored.',409);
  if(action==='IN'&&u.ward_id!==null)return err('Record OUT from your current ward first.',409);
  if(action==='OUT'&&u.ward_id!==w)return err('OUT rejected: this is not your recorded ward.',409);
  const now=Date.now(),id=random(),results=await db.batch([db.prepare('UPDATE pilot_users SET ward_id=?,since=?,version=version+1,last_event_id=? WHERE id=? AND version=?').bind(action==='IN'?w:null,now,id,u.id,u.version),db.prepare('INSERT INTO pilot_events(id,user_id,ward_id,action,at) SELECT ?,?,?,?,? FROM pilot_users WHERE id=? AND last_event_id=?').bind(id,u.id,w,action,now,u.id,id)]);
  if(!results[0].meta.changes)return err('Another scan was just recorded. Refresh and try again.',409);return ok({message:(action==='IN'?'Welcome, ':'Thank you, ')+u.name+'. '+action+' recorded for '+ward.name+'.',at:now});
 }
 if(u.role!=='admin')return err('Administrator access required',403);
 if(path==='ward'&&req.method==='POST'){
  const name=String(body.name||'').trim(),floor=String(body.floor||'Ground floor').trim();if(!name||name.length>80||floor.length>50)return err('Enter a ward name of 1–80 characters.');const id=Number(body.id);
  if(id){await db.prepare('UPDATE pilot_wards SET name=?,floor=? WHERE id=?').bind(name,floor,id).run()}else{await db.prepare('INSERT INTO pilot_wards(name,floor,created_at) VALUES(?,?,?)').bind(name,floor,Date.now()).run()}return ok({ok:true});
 }
 if(path==='issue'&&req.method==='POST'){let now=Date.now();let r=await db.prepare('UPDATE pilot_wards SET qr_generated_at=?,qr_version=qr_version+1 WHERE id=?').bind(now,Number(body.id)).run();if(!r.meta.changes)return err('Ward not found',404);return ok({ok:true,at:now})}
 if(path==='rename-nurse'&&req.method==='POST'){const name=String(body.name||'').trim();if(!name||name.length>80)return err('Enter a name of 1–80 characters');await db.prepare("UPDATE pilot_users SET name=? WHERE id=? AND role='nurse'").bind(name,String(body.id)).run();return ok({ok:true})}
 return err('Unknown operation',404);
}
export async function GET(req:Request){try{return await route(req)}catch(e){console.error('GARUD API',e);return err('Server unavailable. No movement was recorded. Please retry.',500)}}
export async function POST(req:Request){return GET(req)}
