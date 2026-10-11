import Fastify from 'fastify';
import pg from 'pg';
import {randomUUID,randomBytes} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {digest} from './auth.js';
import {registerEcosystem} from './ecosystem.js';
import {registerKivo} from './kivo.js';
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:1});
const client=await pool.connect();const schema='velora_test_'+randomBytes(8).toString('hex');const app=Fastify();
const isolated={query:(...args)=>client.query(...args),connect:async()=>({query:(...args)=>client.query(...args),release(){}})};
try{await client.query(`CREATE SCHEMA "${schema}"`);await client.query(`SET search_path TO "${schema}"`);for(const file of ['001-foundation.sql','002-publishing.sql','007-accounts.sql','011-ecosystem.sql'])await client.query(await readFile(new URL('../../database/'+file,import.meta.url),'utf8'));
const users=[];for(let i=0;i<3;i++){const id=randomUUID(),token=randomBytes(32).toString('hex');await client.query('INSERT INTO users(id,username,password_hash) VALUES($1,$2,$3)',[id,'test_'+i,'unused']);await client.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '1 hour')",[digest(token),id]);users.push({id,token});}
registerEcosystem(app,isolated);registerKivo(app,isolated);await app.ready();
async function call(user,method,url,payload,status=200){const response=await app.inject({method,url,headers:user?{authorization:'Bearer '+user.token}:{},payload});assert.equal(response.statusCode,status,method+' '+url+': '+response.body);return response.json();}
const [a,b,c]=users;await call(null,'GET','/v1/nomi/me',undefined,401);await call(a,'GET','/v1/nomi/me');await call(a,'GET','/v1/nomi/profile/test_0',undefined,404);
await call(a,'PUT','/v1/nomi/me',{avatar:'',publicProfile:true,discoverable:true,messagePolicy:'friends'});await call(null,'GET','/v1/nomi/profile/test_0');
const record=await call(a,'POST','/v1/ecosystem/records',{app:'forma',title:'Private document',description:'',payload:{text:'private'},published:false});assert.equal((await call(b,'GET','/v1/ecosystem/records?app=forma&public=true')).records.length,0);
await call(b,'POST','/v1/ecosystem/records',{...record,app:'forma',title:'Stolen',description:'',payload:{text:'bad'},published:true},403);
await call(a,'POST','/v1/ecosystem/records',{...record,revision:99,app:'forma',title:'Conflict',description:'',payload:{text:'bad'},published:false},409);
await call(a,'POST','/v1/ecosystem/records',{...record,app:'forma',title:'Published document',description:'',payload:{text:'public'},published:true});assert.equal((await call(b,'GET','/v1/ecosystem/records?app=forma&public=true')).records.length,1);
await call(a,'POST','/v1/kivo/conversations',{kind:'dm',title:'Test',userId:b.id},403);
await call(a,'POST','/v1/kivo/friends',{userId:b.id});await call(b,'PATCH','/v1/kivo/friends',{userId:a.id,action:'accept'});
const conversation=await call(a,'POST','/v1/kivo/conversations',{kind:'dm',title:'Test',userId:b.id});await call(a,'POST','/v1/kivo/messages/'+conversation.id,{body:'Test message'});assert.equal((await call(b,'GET','/v1/kivo/messages/'+conversation.id)).messages.length,1);await call(c,'GET','/v1/kivo/messages/'+conversation.id,undefined,404);
await call(b,'POST','/v1/kivo/blocks',{userId:a.id,block:true});await call(a,'POST','/v1/kivo/messages/'+conversation.id,{body:'Blocked'},403);
await call(c,'DELETE','/v1/ecosystem/records/'+record.id,undefined,404);await call(a,'DELETE','/v1/ecosystem/records/'+record.id);console.log('Velora PostgreSQL authorization, privacy, revisions, publishing, friends and messaging checks passed.');
}finally{await app.close();await client.query('ROLLBACK').catch(()=>{});await client.query('SET search_path TO public');if(/^velora_test_[a-f0-9]{16}$/.test(schema))await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);client.release();await pool.end();}
