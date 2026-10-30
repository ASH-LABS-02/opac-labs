import assert from 'node:assert/strict';
import { randomBytes, createHmac } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import net from 'node:net';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import { SMTPServer } from 'smtp-server';
const require = createRequire(import.meta.url);
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const inbox = [];
const smtp = new SMTPServer({ secure: false, authOptional: true, disabledCommands: ['AUTH','STARTTLS'],
 onData(stream, session, callback) { let raw = ''; stream.on('data', chunk => { raw += chunk.toString(); }); stream.on('end', () => { inbox.push({ to: session.envelope.rcptTo.map(x => x.address), text: raw.replace(/=\r?\n/g,'').replace(/=([A-F0-9]{2})/g, (_,hex)=>String.fromCharCode(parseInt(hex,16))) }); callback(); }); stream.on('error',callback); }
});
await new Promise(resolve => smtp.listen(0,'127.0.0.1',resolve));
const smtpPort = smtp.server.address().port;
const probe = net.createServer(); await new Promise(resolve => probe.listen(0,'127.0.0.1',resolve)); const port = probe.address().port; await new Promise(resolve => probe.close(resolve));
const base = 'http://127.0.0.1:'+port;
const mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
const client = new MongoClient(mongo.getUri());
const db = client.db('opac_integration');
let server, step='production build', logs='';
const secret=randomBytes(48).toString('base64url'), password=randomBytes(24).toString('base64url');
function jar(){return new Map();}
async function call(cookies,path,method='GET',body, extra={}) {
 const headers={...extra}; if(body!==undefined)headers['Content-Type']='application/json'; if(method!=='GET')headers.Origin=base;
 if(cookies.size)headers.Cookie=[...cookies].map(([k,v])=>k+'='+v).join('; ');
 const response=await fetch(base+path,{method,headers,...(body===undefined?{}:{body:JSON.stringify(body)}),redirect:'manual',signal:AbortSignal.timeout(20000)});
 for(const entry of response.headers.getSetCookie()){const part=entry.split(';')[0],i=part.indexOf('=');if(/Max-Age=0/i.test(entry))cookies.delete(part.slice(0,i));else cookies.set(part.slice(0,i),part.slice(i+1));}
 const text=await response.text();let data;try{data=JSON.parse(text);}catch{data={};}return {status:response.status,data,headers:response.headers};
}
function good(response,expected){assert.ok([].concat(expected).includes(response.status),`Expected HTTP ${expected}; received ${response.status} (${response.data?.code || response.data?.error || 'no error code'})`);}
async function emailLink(email,subject){for(let i=0;i<50;i++){const message=inbox.findLast(x=>x.to.includes(email)&&x.text.includes(subject));const link=message?.text.match(/https?:\/\/[^\s<>]+/g)?.find(x=>x.includes('/api/auth/'));if(link)return link;await pause(100);}throw new Error('Local SMTP did not receive the expected account email.');}
async function register(email){const r=await call(jar(),'/api/auth/sign-up/email','POST',{name:'Deployment test',email,password,role:'admin',callbackURL:base+'/login?next=/request-project'});good(r,[200,201]);const user=await db.collection('user').findOne({email});assert.equal(user.role,'user');const link=await emailLink(email,'Verify your OPAC Labs email');const verified=await fetch(link,{redirect:'manual'});assert.ok([200,302,303].includes(verified.status));return user;}
function totp(key){const abc='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const char of key.toUpperCase().replace(/=+$/,''))bits+=abc.indexOf(char).toString(2).padStart(5,'0');const buffer=Buffer.from(bits.match(/.{8}/g).map(x=>parseInt(x,2)));const time=Buffer.alloc(8);time.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const digest=createHmac('sha1',buffer).update(time).digest();return ((digest.readUInt32BE(digest[19]&15)&0x7fffffff)%1000000).toString().padStart(6,'0');}
try {
 if(process.env.OPAC_INTEGRATION_SKIP_BUILD!=='true'){const build=spawnSync(process.execPath,[require.resolve('next/dist/bin/next'),'build'],{stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});assert.equal(build.status,0,'Production build failed.');}
 step='start compiled production app';
 server=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(port)],{stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_ENV:'production',MONGODB_URI:mongo.getUri(),MONGODB_DB:'opac_integration',MONGODB_TRANSACTIONS:'true',BETTER_AUTH_URL:base,BETTER_AUTH_SECRET:secret,SMTP_HOST:'127.0.0.1',SMTP_PORT:String(smtpPort),SMTP_USER:'',SMTP_PASSWORD:'',EMAIL_FROM:'OPAC Labs <local@example.test>',SMTP_ALLOW_INSECURE_LOCAL:'true',OPAC_LOCAL_MAILBOX:'',OPAC_PAID_AI_ENABLED:'false',OPENAI_API_KEY:'',TRUST_PROXY_HEADERS:'false',TRUSTED_PROXY_PROVIDER:''}});
 server.stdout.on('data',chunk=>{logs+=chunk;});server.stderr.on('data',chunk=>{logs+=chunk;});
 for(let i=0;i<80;i++){try{if((await fetch(base+'/api/health')).ok)break;}catch{}if(i===79)throw new Error('Production server did not become healthy.');await pause(500);}
 const a=jar(),b=jar(),anon=jar();const emailA='opac-a-'+randomBytes(6).toString('hex')+'@example.test',emailB='opac-b-'+randomBytes(6).toString('hex')+'@example.test';
 step='verified registration and role tampering';const userA=await register(emailA),userB=await register(emailB);console.log('PASS: verified registration through local SMTP; client-supplied admin role ignored.');
 step='login and HttpOnly session';good(await call(a,'/api/auth/sign-in/email','POST',{email:emailA,password}),200);good(await call(b,'/api/auth/sign-in/email','POST',{email:emailB,password}),200);assert.ok(a.size>0);const signedIn=await call(a,'/api/auth/get-session');good(signedIn,200);assert.equal(signedIn.data.user.email,emailA);
 step='brief persistence and owner isolation';const brief={name:'Deployment test',email:emailA,phone:'+919876543210',projectType:'software',description:'Temporary end-to-end project verification.',budget:'not-sure',timeline:'flexible'};
 good(await call(anon,'/api/request-project','POST',brief),401);const saved=await call(a,'/api/request-project','POST',{...brief,userId:userB._id.toString()});good(saved,201);const stored=await db.collection('projectRequests').findOne({_id:saved.data.requestId});assert.equal(stored.userId,userA._id.toString());assert.equal(stored.status,'pending');
 assert.equal((await call(a,'/api/request-project')).data.requests.length,1);assert.equal((await call(b,'/api/request-project')).data.requests.length,0);good(await call(a,'/api/request-project','POST',{...brief,projectType:{$ne:null}}),400);console.log('PASS: authenticated briefs persist, ignore forged ownership and remain isolated.');
 step='profile field restrictions';good(await call(a,'/api/profile','PATCH',{name:'Updated test name',phone:'+919876543210',role:'admin'}),200);assert.equal((await db.collection('user').findOne({_id:userA._id})).role,'user');assert.equal((await call(a,'/api/profile')).data.name,'Updated test name');
 step='contact and basic planner';good(await call(anon,'/api/contact','POST',{name:'Deployment test',email:emailA,message:'Temporary contact-form verification.'}),201);const chat=await call(anon,'/api/chat','POST',{messages:[{role:'user',content:'Build an ERP dashboard'}]});good(chat,200);assert.ok(chat.data.suggestions.length>0);console.log('PASS: contact, profile and basic planner work without paid AI.');
 step='chat history isolation and atomic session cap';const message={messages:[{role:'user',content:'Build a website'}]};const history=await call(a,'/api/chat/history','POST',message);good(history,201);good(await call(b,'/api/chat/history','POST',{...message,sessionId:history.data.id}),404);
 const extra=Array.from({length:48},()=>({id:randomBytes(10).toString('hex'),title:'Seeded cap test',messages:message.messages,createdAt:new Date()}));await db.collection('chatHistory').updateOne({_id:userA._id.toString()},{$push:{sessions:{$each:extra}}});const burst=await Promise.all(Array.from({length:4},()=>call(a,'/api/chat/history','POST',message)));assert.equal(burst.filter(x=>x.status===201).length,1);assert.equal(burst.filter(x=>x.status===429).length,3);assert.equal((await db.collection('chatHistory').findOne({_id:userA._id.toString()})).sessions.length,50);console.log('PASS: history owner checks and concurrent 50-session cap.');
 step='MFA enrollment and staff access';await db.collection('user').updateOne({_id:userA._id},{$set:{role:'admin'}});good(await call(a,'/api/admin/inbox?collection=projectRequests'),403);const setup=await call(a,'/api/auth/two-factor/enable','POST',{password,issuer:'OPAC Labs'});good(setup,200);const key=new URL(setup.data.totpURI).searchParams.get('secret');const correct=totp(key);const wrong=((Number(correct)+1)%1000000).toString().padStart(6,'0');good(await call(a,'/api/auth/two-factor/verify-totp','POST',{code:wrong,trustDevice:false}),401);good(await call(a,'/api/admin/inbox?collection=projectRequests'),403);
 good(await call(a,'/api/auth/two-factor/verify-totp','POST',{code:totp(key),trustDevice:false}),200);assert.equal((await call(a,'/api/admin/access')).data.allowed,true);const staff=await call(a,'/api/admin/inbox?collection=projectRequests');good(staff,200);assert.equal(staff.data.rows.length,1);
 good(await call(a,'/api/admin/inbox','PATCH',{collection:'projectRequests',id:saved.data.requestId,status:'reviewing'}),200);assert.equal((await db.collection('projectRequests').findOne({_id:saved.data.requestId})).status,'reviewing');assert.equal(await db.collection('auditLog').countDocuments({recordId:saved.data.requestId}),1);console.log('PASS: wrong TOTP denied; verified staff inbox, status and audit updates succeed.');
 step='expired MFA cannot expose or replace recovery factors';
 await db.collection('session').updateMany({userId:{$in:[userA._id,userA._id.toString()]}},{$set:{mfaVerifiedAt:new Date(0)}});
 good(await call(a,'/api/admin/inbox?collection=projectRequests'),403);
 good(await call(a,'/api/auth/two-factor/get-totp-uri','POST',{password}),403);
 good(await call(a,'/api/auth/two-factor/disable','POST',{password}),403);
 good(await call(a,'/api/auth/two-factor/generate-backup-codes','POST',{password}),403);
 good(await call(a,'/api/auth/two-factor/verify-totp','POST',{code:((Number(totp(key))+1)%1000000).toString().padStart(6,'0'),trustDevice:false}),401);
 good(await call(a,'/api/admin/inbox?collection=projectRequests'),403);
 good(await call(a,'/api/auth/two-factor/verify-totp','POST',{code:totp(key),trustDevice:false}),200);
 good(await call(a,'/api/admin/inbox?collection=projectRequests'),200);
 console.log('PASS: expired staff MFA cannot read/disable factors or regenerate recovery codes; fresh verification restores access.');
 step='MFA login and session revocation';const oldCookies=new Map(a);good(await call(a,'/api/auth/sign-out','POST',{}),200);good(await call(oldCookies,'/api/request-project'),401);const challenge=await call(a,'/api/auth/sign-in/email','POST',{email:emailA,password});good(challenge,200);assert.equal(challenge.data.twoFactorRedirect,true);good(await call(a,'/api/admin/inbox?collection=projectRequests'),403);good(await call(a,'/api/auth/two-factor/verify-totp','POST',{code:totp(key),trustDevice:false}),200);good(await call(a,'/api/admin/inbox?collection=projectRequests'),200);
 step='password reset and stale sessions';await call(anon,'/api/auth/request-password-reset','POST',{email:emailA,redirectTo:base+'/reset-password'});const resetLink=await emailLink(emailA,'Reset your OPAC Labs password');const redirect=await fetch(resetLink,{redirect:'manual'});const token=new URL(redirect.headers.get('location'),base).searchParams.get('token');assert.ok(token);const newPassword=randomBytes(24).toString('base64url');good(await call(anon,'/api/auth/reset-password','POST',{token,newPassword}),200);good(await call(a,'/api/request-project'),401);good(await call(anon,'/api/auth/sign-in/email','POST',{email:emailA,password}),401);console.log('PASS: MFA challenge, sign-out and password reset revoke stale sessions.');
 step='staff revocation';const login=await call(a,'/api/auth/sign-in/email','POST',{email:emailA,password:newPassword});good(login,200);good(await call(a,'/api/auth/two-factor/verify-totp','POST',{code:totp(key),trustDevice:false}),200);await db.collection('user').updateOne({_id:userA._id},{$set:{role:'user'}});good(await call(a,'/api/admin/inbox?collection=projectRequests'),403);console.log('PASS: revoked staff role takes effect on an existing MFA session.');
 console.log('PASS: compiled production API integration completed against disposable MongoDB and local SMTP.');
} catch(error) {
 console.error('FAIL at '+step+': '+error.message);
 if(logs.includes('Error')) console.error(logs.slice(-1600).replace(/mongodb(?:\+srv)?:\/\/[^\s]+/g,'[database URI]').replace(/https?:\/\/[^\s]*token[^\s]*/g,'[account link]'));
 process.exitCode=1;
} finally { server?.kill(); await client.close(); await mongo.stop(); await new Promise(resolve=>smtp.close(resolve)); }
