const {ipcMain,app,safeStorage}=require('electron');
const fs=require('node:fs');const path=require('node:path');
module.exports=function connectStudio(win,apiOrigin,apiSession){
 let token;let adminToken;const tokenPath=path.join(app.getPath('userData'),'nexora-session.bin');
 try{if(safeStorage.isEncryptionAvailable())token=safeStorage.decryptString(fs.readFileSync(tokenPath));}catch{}
 function setToken(value){token=typeof value==='string'&&/^[a-f0-9]{64}$/.test(value)?value:undefined;try{if(token&&safeStorage.isEncryptionAvailable())fs.writeFileSync(tokenPath,safeStorage.encryptString(token));else if(fs.existsSync(tokenPath))fs.unlinkSync(tokenPath);}catch{/* Session stays in memory when secure OS storage is unavailable. */}}
 const routes={register:['POST','/v1/auth/register'],login:['POST','/v1/auth/login'],recover:['POST','/v1/auth/recover'],logout:['POST','/v1/auth/logout'],me:['GET','/v1/me'],profile:['PATCH','/v1/me'],recovery:['POST','/v1/me/recovery'],deleteAccount:['DELETE','/v1/me'],sites:['GET','/v1/my/sites'],discover:['GET','/v1/sites'],create:['POST','/v1/my/sites'],availability:['GET','/v1/domains/'],publish:['PATCH','/v1/my/sites/'],remove:['DELETE','/v1/my/sites/'],report:['POST','/v1/reports'],update:['PUT','/v1/my/sites/'],files:['GET','/v1/my/sites/'],unpack:['POST','/v1/my/preview'],search:['GET','/v1/search'],health:['GET','/health'],'admin-session':['GET','/v1/admin/usage'],'admin-usage':['GET','/v1/admin/usage'],'admin-reports':['GET','/v1/admin/reports'],'admin-suspend':['PATCH','/v1/admin/sites/'],'admin-remove':['DELETE','/v1/admin/sites/']};
 ipcMain.handle('nexora:studio',async(event,operation,payload={})=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  if(operation==='admin-logout'){adminToken=undefined;return {ok:true};}
  if(!Object.hasOwn(routes,operation)||!payload||typeof payload!=='object'||JSON.stringify(payload).length>4*1024*1024)return {error:'Invalid Studio request.'};
  if(!apiOrigin)return {error:'Studio needs the public backend. Offline mode is enabled.'};
  const admin=operation.startsWith('admin-');
  if(operation==='admin-session'){if(typeof payload.token!=='string'||payload.token.length<32||payload.token.length>256)return {error:'Enter your server administrator token.'};adminToken=payload.token;}
  let [method,route]=routes[operation];
  if(['availability','publish','remove','update','files','admin-suspend','admin-remove'].includes(operation)){if(typeof payload.domain!=='string'||payload.domain.length>80)return {error:'Choose a Nexora address.'};route+=encodeURIComponent(payload.domain);if(operation==='files')route+='/files';}
  if(operation==='search')route+='?'+new URLSearchParams({q:String(payload.q||'').slice(0,100),...(payload.extension?{extension:String(payload.extension)}:{})}).toString();
  const requestPayload={...payload};if(operation==='update')delete requestPayload.domain;
  try{
   const body=['GET','DELETE'].includes(method)&&operation!=='deleteAccount'?undefined:JSON.stringify(operation==='publish'?{published:payload.published}:operation==='admin-suspend'?{suspended:payload.suspended}:requestPayload);
   const auth=admin?adminToken:token;
   const response=await apiSession.fetch(apiOrigin+route,{method,redirect:'error',credentials:'omit',signal:AbortSignal.timeout(45000),headers:{...(body?{'Content-Type':'application/json'}:{}),...(auth?{Authorization:`Bearer ${auth}`}:{})},body});
   const data=await response.json();
   if(['login','register','recover'].includes(operation)&&response.ok){setToken(data.token);return {user:data.user,recoveryCode:data.recoveryCode};}
   if(['logout','deleteAccount'].includes(operation)&&response.ok)setToken(undefined);
   if(!admin&&response.status===401)setToken(undefined);
   if(admin&&response.status===403)adminToken=undefined;
   return data;
  }catch{return {error:'Could not reach Nexora Studio. Please try again.'};}
 });
};
