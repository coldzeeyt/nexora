const {ipcMain,session}=require('electron');
const origin='https://solo-live-production.up.railway.app';
const allowedActions=new Set(['join','viewerbeat','leave','signal','message']);
module.exports=function connectSolo(win){
 const soloSession=session.fromPartition('persist:nexora-solo');
 soloSession.webRequest.onBeforeRequest((details,done)=>{let allowed=false;try{const url=new URL(details.url);allowed=url.origin===origin&&['/api/room','/api/ice'].includes(url.pathname);}catch{}done({cancel:!allowed});});
 ipcMain.handle('nexora:solo',async(event,route,body)=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  if(typeof route!=='string'||route.length>300||!/^\/api\/(room(?:\?[^#]*)?|ice)$/.test(route))return {ok:false,data:{error:'Unsupported Solo request.'}};
  if(body!==undefined&&(!body||typeof body!=='object'||!allowedActions.has(body.action)||JSON.stringify(body).length>90000||(body.action==='signal'&&body.direction!=='host')))return {ok:false,data:{error:'This Nexora page provides Solo viewing and chat only.'}};
  try{const response=await soloSession.fetch(origin+route,{method:body===undefined?'GET':'POST',credentials:'include',redirect:'error',signal:AbortSignal.timeout(10000),headers:body===undefined?{}:{'Content-Type':'application/json',Origin:origin},body:body===undefined?undefined:JSON.stringify(body)});return {ok:response.ok,data:await response.json()};}catch{return {ok:false,data:{error:'The Solo room could not be reached. Please try again.'}};}
 });
};
