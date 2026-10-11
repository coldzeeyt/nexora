const fs=require('node:fs');
const path=require('node:path');
const branding=require('../electron/branding.cjs');
const directory=path.resolve(__dirname,'../build');
fs.mkdirSync(directory,{recursive:true});
fs.writeFileSync(path.join(directory,'nexora.ico'),Buffer.from(branding.icon,'base64'));
