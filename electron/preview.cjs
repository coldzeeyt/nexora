const {ipcMain}=require('electron');
const {randomUUID}=require('node:crypto');
const {CSP}=require('./site-protocol.cjs');
const MIME={html:'text/html',htm:'text/html',css:'text/css',js:'text/javascript',mjs:'text/javascript',json:'application/json',txt:'text/plain',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',ico:'image/x-icon',avif:'image/avif',woff:'font/woff',woff2:'font/woff2',ttf:'font/ttf',otf:'font/otf',pdf:'application/pdf',mp3:'audio/mpeg',ogg:'audio/ogg',wav:'audio/wav',mp4:'video/mp4',webm:'video/webm'};
module.exports=function preview(win,protocol){
 let host;let files=new Map();
 ipcMain.handle('nexora:preview',(event,payload)=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  if(payload===null){host=undefined;files.clear();return {};}
  if(!Array.isArray(payload)||!payload.length||payload.length>200)return {error:'Invalid preview files.'};
  const next=new Map();let bytes=0;
  for(const file of payload){const name=file.path;const type=MIME[name?.split('.').at(-1).toLowerCase()];if(typeof name!=='string'||name.length>240||!type||! /^[a-zA-Z0-9_ ./-]+$/.test(name)||name.split('/').some(p=>!p||p.startsWith('.'))||typeof file.data!=='string'||file.data.length>1398104||next.has(name))return {error:'Invalid preview file.'};const data=Buffer.from(file.data,'base64');bytes+=data.length;if(data.length>1024*1024||bytes>2*1024*1024)return {error:'Preview exceeds 2 MB.'};next.set(name,{data,type});}
  if(!next.has('index.html'))return {error:'Preview needs index.html.'};
  host=randomUUID();files=next;return {url:`nexora-preview://${host}/index.html`};
 });
 protocol.handle('nexora-preview',request=>{let url;try{url=new URL(request.url);}catch{return new Response('Invalid preview',{status:400});}let name;try{name=decodeURIComponent(url.pathname).slice(1);if(!name||name.endsWith('/'))name+='index.html';}catch{return new Response('Invalid preview',{status:400});}const file=url.hostname===host&&['GET','HEAD'].includes(request.method)&&files.get(name);if(!file)return new Response('Preview page not found',{status:404});return new Response(request.method==='HEAD'?null:file.data,{headers:{'Content-Type':file.type,'Content-Security-Policy':CSP,'Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'}});});
};
