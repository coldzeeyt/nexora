import yauzl from 'yauzl';
import path from 'node:path';
export const SITE_LIMIT=2*1024*1024, ACCOUNT_LIMIT=8*1024*1024;
export const MIME={html:'text/html; charset=utf-8',htm:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',json:'application/json',txt:'text/plain; charset=utf-8',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',ico:'image/x-icon',avif:'image/avif',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',otf:'font/otf',pdf:'application/pdf',mp3:'audio/mpeg',ogg:'audio/ogg',wav:'audio/wav',mp4:'video/mp4',webm:'video/webm'};
export function safePath(value){
 if(typeof value!=='string'||value.length>240||!value||value.startsWith('/')||value.includes('\\')||! /^[a-zA-Z0-9_ ./-]+$/.test(value)||value.split('/').some(part=>!part||part.startsWith('.')||part.endsWith('.')||part.endsWith(' ')))throw new Error('Website files must use safe relative paths.');
 const ext=path.posix.extname(value).slice(1).toLowerCase();
 if(!MIME[ext]||/^(?:package(?:-lock)?|credentials|secrets)\.json$/i.test(path.posix.basename(value)))throw new Error(`Unsupported website file: ${value}`);
 return value;
}
export function validateFiles(files){
 if(!Array.isArray(files)||files.length===0||files.length>200)throw new Error('Upload 1–200 static website files.');
 let bytes=0;const names=new Set();
 for(const file of files){safePath(file.path);if(names.has(file.path.toLowerCase()))throw new Error('The upload contains duplicate file paths.');names.add(file.path.toLowerCase());if(!Buffer.isBuffer(file.data))throw new Error('Invalid file data.');if(file.data.length>1024*1024||/\.html?$/i.test(file.path)&&file.data.length>512*1024)throw new Error('Files must be at most 1 MB; HTML at most 512 KB.');bytes+=file.data.length;if(bytes>SITE_LIMIT)throw new Error('A website must be 2 MB or smaller.');}
 const index=files.find(file=>file.path==='index.html');if(!index||!index.data.length||index.data.includes(0))throw new Error('The website needs a text index.html at its root.');
 // Fatal decoding rejects binary files masquerading as HTML.
 new TextDecoder('utf-8',{fatal:true}).decode(index.data);
 return files;
}
export async function readZip(buffer){
 if(!Buffer.isBuffer(buffer)||buffer.length>SITE_LIMIT||buffer.length<22)throw new Error('Choose a ZIP of 2 MB or smaller.');
 const zip=await yauzl.fromBufferPromise(buffer,{validateEntrySizes:true,strictFileNames:true});const files=[];let bytes=0;
 try{
  if(zip.entryCount>400)throw new Error('The archive has too many entries.');
  for await(const entry of zip.eachEntry()){
   const mode=(entry.externalFileAttributes>>>16)&0xf000;
   if(entry.generalPurposeBitFlag&1||mode&&mode!==0x8000&&mode!==0x4000)throw new Error('Encrypted files, links and special files are not supported.');
   if(entry.fileName.endsWith('/')){const name=entry.fileName.slice(0,-1);if(name.split('/').some(p=>!p||p.startsWith('.'))||name.includes('\\')||name.startsWith('/'))throw new Error('Unsafe archive directory.');continue;}
   safePath(entry.fileName);
   if(files.length>=200||entry.uncompressedSize>1024*1024||entry.uncompressedSize+bytes>SITE_LIMIT||entry.uncompressedSize>200*Math.max(1,entry.compressedSize))throw new Error('The extracted archive exceeds the safe upload limits.');
   const stream=await zip.openReadStreamPromise(entry);const chunks=[];let size=0;
   for await(const chunk of stream){size+=chunk.length;if(size>1024*1024||bytes+size>SITE_LIMIT){stream.destroy();throw new Error('The extracted archive exceeds the safe upload limits.');}chunks.push(chunk);}
   bytes+=size;files.push({path:entry.fileName,data:Buffer.concat(chunks)});
  }
  return validateFiles(files);
 }finally{zip.close();}
}
export function manifestBytes(manifest){return Object.values(manifest||{}).reduce((total,file)=>total+file.bytes,0);}
export function uniqueStorageBytes(draft,published){const objects=new Map();for(const file of [...Object.values(draft||{}),...Object.values(published||{})])objects.set(file.key,file.bytes);return [...objects.values()].reduce((sum,value)=>sum+value,0);}
