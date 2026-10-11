const {ipcMain,app,dialog,screen}=require('electron');
const fs=require('node:fs/promises');const path=require('node:path');const {randomUUID}=require('node:crypto');
module.exports=win=>{
 const root=path.join(app.getPath('userData'),'velora');const target=path.join(root,'desktop.json');let desktopBounds;let extended=false;let pending=Promise.resolve();let canClose=false;let closeTimer;
 const recover=()=>{if(extended){extended=false;if(desktopBounds&&!win.isDestroyed()){const display=screen.getDisplayMatching(desktopBounds).workArea;win.setBounds({x:display.x,y:display.y,width:Math.min(desktopBounds.width,display.width),height:Math.min(desktopBounds.height,display.height)});}}};screen.on('display-removed',recover);win.once('closed',()=>screen.removeListener('display-removed',recover));
 win.on('close',event=>{if(canClose)return;event.preventDefault();if(closeTimer)return;win.webContents.send('velora:flush');closeTimer=setTimeout(()=>{canClose=true;win.close();},3000);});
 ipcMain.handle('velora:store',async(event,operation,payload)=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  try{
   if(operation==='close-ready'){clearTimeout(closeTimer);closeTimer=undefined;await pending;canClose=true;win.close();return {ok:true};}
   if(operation==='close-cancel'){clearTimeout(closeTimer);closeTimer=undefined;const result=await dialog.showMessageBox(win,{type:'warning',message:'Velora could not save your changes.',detail:'Keep the app open to try again, or close without saving the latest changes.',buttons:['Keep open','Close without saving'],defaultId:0,cancelId:0});if(result.response===1){canClose=true;win.close();}return {ok:true};}
   if(operation==='load'){await pending;try{return {data:JSON.parse(await fs.readFile(target,'utf8'))};}catch(e){if(e.code==='ENOENT')return {};throw e;}}
   if(operation==='backup-list'){await pending;try{return {backups:JSON.parse(await fs.readFile(path.join(root,'backups.json'),'utf8'))};}catch(e){if(e.code==='ENOENT')return {backups:[]};throw e;}}
   if(operation==='backup-save'){if(!payload||payload.version!==1||JSON.stringify(payload).length>38*1024*1024)return {error:'Invalid workspace snapshot.'};const json=JSON.stringify(payload);pending=pending.catch(()=>{}).then(async()=>{await fs.mkdir(root,{recursive:true});let saved=[];try{saved=JSON.parse(await fs.readFile(path.join(root,'backups.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}if(saved[0]&&JSON.stringify(saved[0].data)===json)return;const snapshots=[{createdAt:new Date().toISOString(),data:payload},...saved].slice(0,3);const temp=path.join(root,randomUUID()+'.tmp');await fs.writeFile(temp,JSON.stringify(snapshots));await fs.rename(temp,path.join(root,'backups.json'));});await pending;return {ok:true};}
   if(operation==='save'){
    if(!payload||typeof payload!=='object'||JSON.stringify(payload).length>38*1024*1024)return {error:'Desktop storage is limited to 32 MB.'};
    const json=JSON.stringify(payload);pending=pending.catch(()=>{}).then(async()=>{await fs.mkdir(root,{recursive:true});const temp=path.join(root,randomUUID()+'.tmp');await fs.writeFile(temp,json);await fs.rename(temp,target);});await pending;return {ok:true};
   }
   if(operation==='import'||operation==='import-backup'){
    const selected=await dialog.showOpenDialog(win,{title:'Import into Velora Files',properties:['openFile']});if(selected.canceled)return {canceled:true};const source=selected.filePaths[0];const stat=await fs.stat(source);if(!stat.isFile()||stat.size>8*1024*1024)return {error:'Import files up to 2 MB.'};return {file:{id:randomUUID(),name:path.basename(source),data:(await fs.readFile(source)).toString('base64'),bytes:stat.size,modified:new Date().toISOString()}};
   }
   if(operation==='export'){
    if(!payload||typeof payload.name!=='string'||typeof payload.data!=='string'||payload.data.length>11184812)return {error:'Invalid export.'};const name=path.basename(payload.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').slice(0,120)||'Velora-file';const selected=await dialog.showSaveDialog(win,{title:'Export Velora file',defaultPath:name});if(selected.canceled||!selected.filePath)return {canceled:true};await fs.writeFile(selected.filePath,Buffer.from(payload.data,'base64'));return {ok:true};
   }
   if(operation==='display-status')return {extended,displayCount:screen.getAllDisplays().length};
   if(operation==='extend-desktop'){if(process.env.VELORA_PRO!=='1')return {error:'This control belongs to Velora Pro.'};if(payload===false){if(desktopBounds)win.setBounds(desktopBounds);extended=false;return {ok:true,extended:false};}if(payload!==true)return {error:'Invalid display operation.'};const displays=screen.getAllDisplays();if(displays.length<2)return {error:'Connect two monitors to extend this workspace.'};const areas=displays.map(d=>d.workArea);const x=Math.min(...areas.map(a=>a.x)),y=Math.min(...areas.map(a=>a.y));const width=Math.max(...areas.map(a=>a.x+a.width))-x,height=Math.max(...areas.map(a=>a.y+a.height))-y;if(width>16000||height>16000)return {error:'This monitor arrangement is too large.'};if(!extended)desktopBounds=win.getBounds();win.setFullScreen(false);win.unmaximize();win.setBounds({x,y,width,height});extended=true;return {ok:true,extended:true};}
   if(operation==='performance'){const metrics=app.getAppMetrics();return {performance:{processes:metrics.length,memoryKB:metrics.reduce((sum,p)=>sum+(p.memory?.workingSetSize||0),0),cpuPercent:metrics.reduce((sum,p)=>sum+(p.cpu?.percentCPUUsage||0),0),measuredAt:new Date().toISOString()}};}
   if(operation==='fullscreen'){win.setFullScreen(Boolean(payload));return {ok:true};}
   return {error:'Unknown desktop operation.'};
  }catch{return {error:'Velora could not access its local storage. Please try again.'};}
 });
};

