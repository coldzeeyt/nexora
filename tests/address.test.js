import {test} from 'node:test';
import assert from 'node:assert/strict';
import parser from '../shared/address.cjs';
test('supported names preserve paths, queries and fragments',()=>{for(const ext of ['nex','vnt','zen','orb','kiv'])assert.equal(parser.parseAddress(`hello.${ext}/page?q=1#part`).address,`hello.${ext}/page?q=1#part`);});
test('reject external navigation and ambiguous authorities',()=>{for(const value of ['https://google.com','google.com','javascript:alert(1)','file:///etc/passwd','user@home.nex','home.nex:80','sub.home.nex','home.nex\\evil','-bad.nex'])assert.throws(()=>parser.parseAddress(value),value);});
test('normalize case and accept custom scheme',()=>assert.equal(parser.parseAddress('nexora://HOME.NEX').address,'home.nex'));
