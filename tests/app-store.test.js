import {test} from 'node:test';import assert from 'node:assert/strict';import {decodeApp} from '../apps/api/app-store.js';
const app={id:'my-tool',title:'My tool',description:'An isolated web application',version:'1.0.0',files:[{path:'index.html',data:Buffer.from('<h1>Hello</h1>').toString('base64')}]};
test('developer app uploads use the static-site sandbox format and reject privileged files',()=>{
 assert.equal(decodeApp(app)[0].path,'index.html');
 for(const id of ['nexora','settings','notes','../escape','My Tool'])assert.throws(()=>decodeApp({...app,id}));
 assert.throws(()=>decodeApp({...app,version:'latest'}));
 assert.throws(()=>decodeApp({...app,files:[...app.files,{path:'program.exe',data:Buffer.from('binary').toString('base64')}]}));
 assert.throws(()=>decodeApp({...app,files:[...app.files,{path:'../outside.js',data:''}]}));
});
