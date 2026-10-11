import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import fs from 'node:fs';
// Inspect the pure resource policy without launching Electron.
const module={exports:{}};
vm.runInNewContext(fs.readFileSync(new URL('../electron/freq-view.cjs',import.meta.url),'utf8'),{module,require:()=>({}),URL});
const allowed=module.exports.allowedResource;
test('Freq resources are confined to its service and stock-video paths',()=>{
 for(const url of ['https://freqfm.up.railway.app/api/feed','https://freqfm.up.railway.app/media/clip.mp4','https://assets.mixkit.co/videos/123/123-720.mp4','blob:https://freqfm.up.railway.app/example'])assert.equal(allowed(url),true,url);
 for(const url of ['https://example.com','https://freqfm.up.railway.app.evil.test','https://user:pass@freqfm.up.railway.app','http://freqfm.up.railway.app','file:///C:/Users/david/file','https://assets.mixkit.co/other','blob:https://example.com/id'])assert.equal(allowed(url),false,url);
});
