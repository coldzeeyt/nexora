const {ipcMain}=require('electron');
module.exports=function connectStudio(win,apiOrigin,apiSession){
 let token;
 const routes={register:['POST','/v1/auth/register'],login:['POST','/v1/auth/login'],logout:['POST','/v1/auth/logout'],me:['GET','/v1/me'],sites:['GET','/v1/my/sites'],discover:['GET','/v1/sites'],create:['POST','/v1/my/sites'],availability:['GET','/v1/domains/'],publish:['PATCH','/v1/my/sites/'],remove:['DELETE','/v1/my/sites/'],report:['POST','/v1/reports'],update:['PUT','/v1/my/sites/'],files:['GET','/v1/my/sites/'],unpack:['POST','/v1/my/preview'],search:['GET','/v1/search'],health:['GET','/health']};
 ipcMain.handle('nexora:studio',async(event,operation,payload={})=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  if(!Object.hasOwn(routes,operation)||!payload||typeof payload!=='object'||JSON.stringify(payload).length>4*1024*1024)return {error:'Invalid Studio request.'};
  if(!apiOrigin)return {error:'Studio needs the public backend. Offline mode is enabled.'};
  let [method,route]=routes[operation];
  if(['availability','publish','remove','update','files'].includes(operation)){if(typeof payload.domain!=='string'||payload.domain.length>80)return {error:'Choose a Nexora address.'};route+=encodeURIComponent(payload.domain);if(operation==='files')route+='/files';}
  if(operation==='search')route+='?'+new URLSearchParams({q:String(payload.q||'').slice(0,100),...(payload.extension?{extension:String(payload.extension)}:{})}).toString();
  const requestPayload={...payload};if(operation==='update')delete requestPayload.domain;
  try{
   const body=['availability','sites','discover','me','remove','files','search','health'].includes(operation)?undefined:JSON.stringify(operation==='publish'?{published:payload.published}:requestPayload);
   const response=await apiSession.fetch(apiOrigin+route,{method,redirect:'error',credentials:'omit',signal:AbortSignal.timeout(45000),headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},body});
   const data=await response.json();
   if(['login','register'].includes(operation)&&response.ok){token=data.token;return {user:data.user};}
   if(operation==='logout'&&response.ok)token=undefined;
   if(response.status===401)token=undefined;
   return data;
  }catch{return {error:'Could not reach Nexora Studio. Please try again.'};}
 });
};
