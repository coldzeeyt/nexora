import {test} from 'node:test';import assert from 'node:assert/strict';import policy from '../shared/online-policy.cjs';
test('Online accepts public HTTPS addresses and rejects host and local resources',()=>{
 assert.equal(policy.onlineAddress('youtube.com'),'https://youtube.com/');assert.equal(policy.onlineResource('https://www.youtube.com/watch?v=test'),true);assert.equal(policy.onlineResource('blob:https://www.youtube.com/123'),true);
 for(const url of ['file:///C:/Windows','nexora://home.nex','https://localhost/','https://127.0.0.1/','https://10.0.0.1/','https://192.168.1.1/','https://[::1]/','https://user:pass@example.com/','https://example.com:8443/','http://example.com/'])assert.throws(()=>policy.onlineAddress(url),url);
});
