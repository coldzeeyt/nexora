const {ipcMain,app,dialog}=require('electron');
const fs=require('node:fs/promises');const path=require('node:path');const {randomUUID}=require('node:crypto');
module.exports=win=>{
 const root=path.join(app.getPath('userData'),'velora');const target=path.join(root,'desktop.json');let pending=Promise.resolve();
 ipcMain.handle('velora:store',async(event,operation,payload)=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  try{
   if(operation==='load'){await pending;try{return {data:JSON.parse(await fs.readFile(target,'utf8'))};}catch(e){if(e.code==='ENOENT')return {};throw e;}}
   if(operation==='save'){
    if(!payload||typeof payload!=='object'||JSON.stringify(payload).length>32*1024*1024)return {error:'Desktop storage is limited to 32 MB.'};
    const json=JSON.stringify(payload);pending=pending.catch(()=>{}).then(async()=>{await fs.mkdir(root,{recursive:true});const temp=path.join(root,randomUUID()+'.tmp');await fs.writeFile(temp,json);await fs.rename(temp,target);});await pending;return {ok:true};
   }
   if(operation==='import'){
    const selected=await dialog.showOpenDialog(win,{title:'Import into Velora Files',properties:['openFile']});if(selected.canceled)return {canceled:true};const source=selected.filePaths[0];const stat=await fs.stat(source);if(!stat.isFile()||stat.size>2*1024*1024)return {error:'Import files up to 2 MB.'};return {file:{id:randomUUID(),name:path.basename(source),data:(await fs.readFile(source)).toString('base64'),bytes:stat.size,modified:new Date().toISOString()}};
   }
   if(operation==='export'){
    if(!payload||typeof payload.name!=='string'||typeof payload.data!=='string'||payload.data.length>2796204)return {error:'Invalid export.'};const name=path.basename(payload.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,120)||'Velora-file';const selected=await dialog.showSaveDialog(win,{title:'Export Velora file',defaultPath:name});if(selected.canceled||!selected.filePath)return {canceled:true};await fs.writeFile(selected.filePath,Buffer.from(payload.data,'base64'));return {ok:true};
   }
   if(operation==='fullscreen'){win.setFullScreen(Boolean(payload));return {ok:true};}
   return {error:'Unknown desktop operation.'};
  }catch{return {error:'Velora could not access its local storage. Please try again.'};}
 });
};
