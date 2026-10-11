const {parseAddress}=require('../shared/address.cjs');
const CSP="default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' blob:; connect-src 'self'; frame-src 'none'; worker-src 'none'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors file:";
module.exports=function registerSiteProtocol(protocol,apiOrigin,apiSession){
 const headers={'Content-Security-Policy':CSP,'Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'};
 function error(message,status){return new Response(`<!doctype html><html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:16px system-ui;padding:40px;max-width:650px;margin:60px auto;color:#333}h1{font-size:32px;font-weight:500}p{line-height:1.7}</style><h1>${status===404?'Address or page not found':'Unable to open this page'}</h1><p>${message}</p></html>`,{status,headers:{...headers,'Content-Type':'text/html; charset=utf-8'}});}
 protocol.handle('nexora',async request=>{
  let parsed;try{parsed=parseAddress(request.url);}catch{return error('Use a registered Nexora address.',400);}
  if(!['GET','HEAD'].includes(request.method))return error('Website forms cannot submit to the registry.',405);
  if(!require('./network-state.cjs').allowed('nexora'))return error('Turn on Online mode in Velora Settings to browse the Nexora network.',503);
  if(!apiOrigin)return error('The shared Nexora network is unavailable in offline mode.',503);
  let filePath;try{filePath=decodeURIComponent(new URL(parsed.url).pathname).slice(1);if(!filePath||filePath.endsWith('/'))filePath+='index.html';if(filePath.split('/').some(part=>part.startsWith('.')||!part)||filePath.includes('\\'))return error('Invalid website path.',400);}catch{return error('Invalid website path.',400);}
  try{
   const response=await apiSession.fetch(`${apiOrigin}/v1/assets/${encodeURIComponent(parsed.host)}/${filePath.split('/').map(encodeURIComponent).join('/')}`,{redirect:'error',credentials:'omit',signal:AbortSignal.timeout(15000)});
   if(response.status===404)return error('This website is unpublished, unavailable, or does not contain that page.',404);
   if(!response.ok)return error('The Nexora server could not return this page. Try refreshing.',503);
   const data=await response.arrayBuffer();if(data.byteLength>1024*1024)return error('This file exceeds the safe resource limit.',413);
   return new Response(request.method==='HEAD'?null:data,{status:200,headers:{...headers,'Content-Type':response.headers.get('content-type')||'application/octet-stream'}});
  }catch{return error('Could not connect to the Nexora network. Check your connection and refresh.',503);}
 });
};
module.exports.CSP=CSP;
