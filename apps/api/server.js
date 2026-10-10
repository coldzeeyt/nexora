import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import pg from 'pg';
import parser from '../../shared/address.cjs';
import {summarize} from './ai.js';
const app=Fastify({logger:true,bodyLimit:1024*1024});
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:5});
await import('./migrate.js');
await app.register(rateLimit,{max:60,timeWindow:'1 minute'});
app.post('/v1/ask',{config:{rateLimit:{max:5,timeWindow:'1 minute'}},schema:{body:{type:'object',additionalProperties:false,required:['question'],properties:{question:{type:'string',minLength:1,maxLength:2000}}}}},async(req,reply)=>{const question=req.body.question.trim();if(!question)return reply.code(400).send({error:'Enter a question or some text.'});const result=await summarize(question);reply.header('Cache-Control','no-store');return reply.code(result.status).send(result.summary?{summary:result.summary}:{error:result.error});});
app.get('/health',async(_req,reply)=>{try{await pool.query('SELECT domain FROM websites LIMIT 1');return {status:'ok'};}catch{reply.code(503);return {status:'unavailable'};}});
app.get('/v1/sites',async()=>{const result=await pool.query('SELECT domain,title,description FROM websites WHERE published=true AND suspended=false ORDER BY domain LIMIT 50');return {sites:result.rows};});
app.get('/v1/resolve/:domain',async(req,reply)=>{let domain;try{domain=parser.parseAddress(req.params.domain).host;}catch{return reply.code(400).send({error:'Invalid Nexora address'});}const result=await pool.query('SELECT domain,title,description,html FROM websites WHERE domain=$1 AND published=true AND suspended=false',[domain]);if(!result.rowCount)return reply.code(404).send({error:'Address not found'});reply.header('Cache-Control','no-store');return result.rows[0];});
app.setErrorHandler((error,_req,reply)=>{app.log.error(error);reply.code(error.statusCode||500).send({error:error.statusCode===429?'Too many requests':'Request could not be completed'});});
await app.listen({port:Number(process.env.PORT||3000),host:'0.0.0.0'});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();await pool.end();process.exit(0);});

