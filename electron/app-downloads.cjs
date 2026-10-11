const {ipcMain,shell,app:electronApp}=require('electron');const fs=require('node:fs');const path=require('node:path');
module.exports=win=>ipcMain.handle('nexora:installer',async(event,app)=>{
 if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
 if(!['Nexora','Velora'].includes(app))return {error:'Choose a supported application.'};
 try{
  if(process.platform==='darwin'){await shell.openExternal('https://github.com/coldzeeyt/nexora/releases/latest/download/Velora-Installer-'+process.arch+'.dmg');return {ok:true};}
  if(app==='Velora'){
   const bundled=electronApp.isPackaged?path.join(process.resourcesPath,'Velora-Setup.exe'):path.join(__dirname,'../release-velora/Velora-Setup.exe');
   if(fs.existsSync(bundled)){const error=await shell.openPath(bundled);return error?{error:'Windows could not open the bundled Velora installer.'}:{ok:true,bundled:true};}
  }
  await shell.openExternal(`https://github.com/coldzeeyt/nexora/releases/latest/download/Velora-Installer.exe`);return {ok:true};
 }catch{return {error:'Could not open the application installer.'};}
});
