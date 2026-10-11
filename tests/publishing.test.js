import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword} from '../apps/api/auth.js';
import {domainName,validateHtml} from '../apps/api/publishing.js';
test('salted passwords verify without storing plaintext',async()=>{const a=await hashPassword('an example long password');const b=await hashPassword('an example long password');assert.notEqual(a,b);assert.ok(await verifyPassword('an example long password',a));assert.equal(await verifyPassword('wrong password',a),false);});
test('publishing forbids reserved services and paths',()=>{for(const value of ['home.nex','nexora.kiv','admin-test.nex','hello.nex/path','https://example.com'])assert.throws(()=>domainName(value));assert.equal(domainName('my-space.kiv'),'my-space.kiv');});
test('HTML byte quota and binary content are rejected',()=>{assert.equal(validateHtml('<h1>Hello</h1>'),'<h1>Hello</h1>');for(const value of ['', 'x'.repeat(512*1024+1),'a\0b'])assert.throws(()=>validateHtml(value));});
