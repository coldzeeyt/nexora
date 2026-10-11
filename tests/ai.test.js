import {test} from 'node:test';
import assert from 'node:assert/strict';
import {summarize} from '../apps/api/ai.js';
test('no key uses the self-hosted model',async()=>{let called=false;const result=await summarize('hello',{key:'',local:async question=>{called=question==='hello';return {status:200,summary:'Hello.'};}});assert.ok(called);assert.equal(result.summary,'Hello.');});
test('only requests free router and limits output',async()=>{let body;const r=await summarize('what is nexora?',{key:'test-key',request:async(_url,options)=>{body=JSON.parse(options.body);return new Response(JSON.stringify({choices:[{message:{content:'A small community network.'}}]}));}});assert.equal(body.model,'openrouter/free');assert.equal(r.summary,'A small community network.');});
test('quota failures have no paid fallback',async()=>{let calls=0;const r=await summarize('hello',{key:'test-key',request:async()=>{calls++;return new Response('',{status:429});}});assert.equal(calls,1);assert.equal(r.status,429);});
