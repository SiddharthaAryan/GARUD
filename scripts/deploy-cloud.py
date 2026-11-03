"""Run in an authorized Google Cloud Shell; tokens stay in process memory."""
import subprocess,json,urllib.request,gzip,hashlib,pathlib
PROJECT='garud-10e8d'
token=subprocess.check_output(['gcloud','auth','print-access-token'],text=True).strip()
def request(url,body=None,method=None,raw=False):
 data=body if raw else (json.dumps(body).encode() if body is not None else None)
 req=urllib.request.Request(url,data=data,method=method or ('POST' if body is not None else 'GET'),headers={'Authorization':'Bearer '+token,'Content-Type':'application/octet-stream' if raw else 'application/json'})
 with urllib.request.urlopen(req) as r:
  result=r.read()
  return json.loads(result) if result else {}
base='https://firebasehosting.googleapis.com/v1beta1/sites/'+PROJECT
try:request('https://firebasehosting.googleapis.com/v1beta1/projects/'+PROJECT+'/sites',{'siteId':PROJECT,'type':'DEFAULT_SITE'})
except urllib.error.HTTPError as e:
 if e.code!=409:raise
v=request(base+'/versions',{'config':{'headers':[{'glob':'**','headers':{'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Permissions-Policy':'camera=(), microphone=(), geolocation=()'}}]}})['name']
files={};compressed={}
for p in pathlib.Path('public').rglob('*'):
 if p.is_file():
  data=gzip.compress(p.read_bytes(),mtime=0);digest=hashlib.sha256(data).hexdigest();files['/'+p.relative_to('public').as_posix()]=digest;compressed[digest]=data
pop=request('https://firebasehosting.googleapis.com/v1beta1/'+v+':populateFiles',{'files':files})
for h in pop.get('uploadRequiredHashes',[]):request(pop['uploadUrl']+'/'+h,compressed[h],raw=True)
request('https://firebasehosting.googleapis.com/v1beta1/'+v+'?update_mask=status',{'status':'FINALIZED'},method='PATCH')
release=request(base+'/releases?versionName='+v,{})
print('Hosting deployed: https://'+PROJECT+'.web.app')
# Publish validated rules; keep database default-deny until this succeeds.
rules=request('https://firebaserules.googleapis.com/v1/projects/'+PROJECT+'/rulesets',{'source':{'files':[{'name':'firestore.rules','content':pathlib.Path('firestore.rules').read_text()}]}})
release_name='projects/'+PROJECT+'/releases/cloud.firestore'
try:request('https://firebaserules.googleapis.com/v1/'+release_name,{'release':{'name':release_name,'rulesetName':rules['name']},'updateMask':'ruleset_name'},method='PATCH')
except urllib.error.HTTPError as e:
 if e.code!=404:raise
 request('https://firebaserules.googleapis.com/v1/projects/'+PROJECT+'/releases',{'name':release_name,'rulesetName':rules['name']})
print('Firestore access rules published.')
# Only illustrative ward definitions. No staff records are seeded.
for i,name in enumerate(['General medicine','Surgical care','Orthopaedics','Paediatrics','Critical care','Emergency'],1):
 request('https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/documents/wards/'+str(i),{'fields':{'name':{'stringValue':name},'floor':{'integerValue':str(0 if i<4 else 1)},'enabled':{'booleanValue':True}}},method='PATCH')
print('Six illustrative ward definitions provisioned. Staff enrollment remains approval-gated.')
index={'queryScope':'COLLECTION','fields':[{'fieldPath':'officerUid','order':'ASCENDING'},{'fieldPath':'at','order':'DESCENDING'}]}
try:request('https://firestore.googleapis.com/v1/projects/'+PROJECT+'/databases/(default)/collectionGroups/events/indexes',index)
except urllib.error.HTTPError as e:
 if e.code!=409:raise
print('History index requested.')
