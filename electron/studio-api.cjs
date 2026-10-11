const {ipcMain}=require('electron');
module.exports=function connectStudio(win,apiOrigin,apiSession){
 let token;
 const routes={register:['POST','/v1/auth/register'],login:['POST','/v1/auth/login'],logout:['POST','/v1/auth/logout'],me:['GET','/v1/me'],sites:['GET','/v1/my/sites'],discover:['GET','/v1/sites'],create:['POST','/v1/my/sites'],availability:['GET','/v1/domains/'],publish:['PATCH','/v1/my/sites/'],remove:['DELETE','/v1/my/sites/'],report:['POST','/v1/reports']};
 ipcMain.handle('nexora:studio',async(event,operation,payload={})=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  if(!Object.hasOwn(routes,operation)||!payload||typeof payload!=='object'||JSON.stringify(payload).length>800000)return {error:'Invalid Studio request.'};
  if(!apiOrigin)return {error:'Studio needs the public backend. Offline mode is enabled.'};
  let [method,route]=routes[operation];
  if(['availability','publish','remove'].includes(operation)){if(typeof payload.domain!=='string'||payload.domain.length>80)return {error:'Choose a Nexora address.'};route+=encodeURIComponent(payload.domain);}
  try{
   const body=['availability','sites','discover','me','remove'].includes(operation)?undefined:JSON.stringify(operation==='publish'?{published:payload.published}:payload);
   const response=await apiSession.fetch(apiOrigin+route,{method,redirect:'error',credentials:'omit',signal:AbortSignal.timeout(15000),headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},body});
   const data=await response.json();
   if(['login','register'].includes(operation)&&response.ok){token=data.token;return {user:data.user};}
   if(operation==='logout'&&response.ok)token=undefined;
   if(response.status===401)token=undefined;
   return data;
  }catch{return {error:'Could not reach Nexora Studio. Please try again.'};}
 });
};
