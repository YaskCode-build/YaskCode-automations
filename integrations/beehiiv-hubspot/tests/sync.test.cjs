const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../apps-script/src/YaskCode_V4.gs'),'utf8');
const sub=(email='person@example.com',status='active')=>({email,status,created:1700000000});
const contact=(status='active')=>({id:'synthetic-contact',properties:{beehiiv_subscription_status:status,yaskcode_contact_source:'beehiiv_newsletter',yaskcode_relationship:'newsletter_subscriber'}});
function run({subs=[sub()],contacts=[],real=false,fetchHook,props=true,locked=false}={}){
 let searches=0,released=0;const calls=[],logs=[],sleeps=[];
 const context={console:{log:x=>logs.push(String(x))},PropertiesService:{getScriptProperties:()=>({getProperty:()=>props?'SYNTHETIC_VALUE':null})},LockService:{getScriptLock:()=>({tryLock:()=>!locked,releaseLock:()=>released++})},Utilities:{sleep:ms=>sleeps.push(ms)},UrlFetchApp:{fetch:(url,options)=>{
  const call={url,options};calls.push(call);
  let result=fetchHook?.(call,calls.length);
  if(!result){
   if(url.includes('api.beehiiv.com'))result={code:200,body:{data:subs,pagination:{has_more:false,next_cursor:null}}};
   else if(url.endsWith('/search'))result={code:200,body:{results:typeof contacts==='function'?contacts(searches++):contacts}};
   else if(options.method==='post')result={code:201,body:{id:'synthetic-new'}};
   else result={code:200,body:{id:'synthetic-contact',properties:JSON.parse(options.payload).properties}};
  }
  return {getResponseCode:()=>result.code,getContentText:()=>JSON.stringify(result.body)};
 }}};
 // Exercise the write path only inside this isolated VM with a fully mocked fetch.
 const code=real?source.replace('const DRY_RUN = true;','const DRY_RUN = false;'):source;
 vm.createContext(context);vm.runInContext(code,context);
 let error;try{context.sincronizarYaskCodeV4();}catch(e){error=e;}
 return {calls,logs,sleeps,error,released,writes:calls.filter(c=>!c.url.includes('api.beehiiv.com')&&!c.url.endsWith('/search'))};
}
test('default dry run plans an addition without writing or logging its email',()=>{const r=run();assert.ifError(r.error);assert.equal(r.writes.length,0);assert.ok(r.logs.join('').includes('SIMULACIÓN'));assert.ok(!r.logs.join('').includes('person@example.com'));assert.equal(r.released,1);});
test('real path normalizes email and creates at most one of two contacts',()=>{const r=run({real:true,subs:[sub(' PERSON@EXAMPLE.COM '),sub('other@example.com')]});assert.ifError(r.error);assert.equal(r.writes.length,1);assert.equal(JSON.parse(r.writes[0].options.payload).properties.email,'person@example.com');});
test('inactive update is prioritized over addition and preserves unrelated properties',()=>{const r=run({real:true,subs:[sub('new@example.com'),sub('old@example.com','inactive')],contacts:n=>n===0?[]:[contact()]});assert.ifError(r.error);assert.equal(r.writes.length,1);assert.equal(r.writes[0].options.method,'patch');assert.deepEqual(Object.keys(JSON.parse(r.writes[0].options.payload).properties).sort(),['beehiiv_last_sync','beehiiv_subscription_status']);});
test('reactivation is not written',()=>{const r=run({real:true,contacts:[contact('inactive')]});assert.ifError(r.error);assert.equal(r.writes.length,0);});
test('duplicate normalized emails stop before writes',()=>{const r=run({real:true,subs:[sub(),sub('PERSON@example.com')]});assert.equal(r.error?.message,'YASKCODE_SYNC_FAILED');assert.equal(r.writes.length,0);assert.equal(r.released,1);});
test('unknown state blocks otherwise valid addition',()=>{const r=run({real:true,subs:[sub(),sub('unknown@example.com','unexpected')]});assert.ifError(r.error);assert.equal(r.writes.length,0);assert.ok(r.logs.join('').includes('BLOQUEADO'));});
test('ambiguous CRM matches block writes',()=>{const r=run({real:true,contacts:[contact(),contact()]});assert.ifError(r.error);assert.equal(r.writes.length,0);});
test('incomplete pagination stops before writes',()=>{const r=run({real:true,fetchHook:c=>c.url.includes('beehiiv')?{code:200,body:{data:[],pagination:{has_more:true,next_cursor:null}}}:null});assert.ok(r.error);assert.equal(r.writes.length,0);});
test('a failing write is not retried',()=>{const r=run({real:true,fetchHook:c=>c.options.method==='post'&&!c.url.endsWith('/search')?{code:503,body:{}}:null});assert.ok(r.error);assert.equal(r.writes.length,1);assert.equal(r.released,1);});
test('read 429 is retried and recovers',()=>{let first=true;const r=run({fetchHook:c=>{if(first&&c.url.includes('beehiiv')){first=false;return{code:429,body:{}};}}});assert.ifError(r.error);assert.deepEqual(r.sleeps,[1000]);});
test('platform errors are redacted',()=>{const r=run({fetchHook:()=>{throw Error('PRIVATE person@example.com');}});assert.equal(r.error.message,'YASKCODE_SYNC_FAILED');assert.ok(!r.logs.join('').includes('PRIVATE'));});
test('changed CRM relationship blocks update',()=>{const r=run({real:true,subs:[sub('person@example.com','inactive')],contacts:n=>n===0?[contact()]:[{...contact(),properties:{beehiiv_subscription_status:'active'}}]});assert.ok(r.error);assert.equal(r.writes.length,0);});
test('missing secrets fail closed and release lock',()=>{const r=run({props:false});assert.ok(r.error);assert.equal(r.calls.length,0);assert.equal(r.released,1);});
test('held lock prevents all API access',()=>{const r=run({locked:true});assert.ifError(r.error);assert.equal(r.calls.length,0);assert.equal(r.released,0);});
