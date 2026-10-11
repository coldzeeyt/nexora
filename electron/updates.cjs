const {ipcMain,app}=require('electron');
const {autoUpdater}=require('electron-updater');
const {CancellationToken}=require('builder-util-runtime');
const {allowedUpdateUrl}=require('../shared/update-policy.cjs');
module.exports=function updates(win,velora){
 if(process.platform==="darwin")return require("./mac-updates.cjs")(win);
 let state={status:app.isPackaged?'idle':'development',version:app.getVersion(),progress:0};let busy=false;let downloadToken;const network=require('./network-state.cjs');const unsubscribe=network.subscribe(()=>{if(!network.allowed('updates')){downloadToken?.cancel();emit({status:'offline',error:'Updates stopped because Online mode or updates were disabled.'});}});win.once('closed',()=>{unsubscribe();downloadToken?.cancel();});
 const emit=patch=>{state={...state,...patch};if(!win.isDestroyed())win.webContents.send('nexora:update-state',state);};
 autoUpdater.autoDownload=false;autoUpdater.autoInstallOnAppQuit=false;autoUpdater.allowPrerelease=false;autoUpdater.channel=process.env.VELORA_APP||(process.env.VELORA_PRO==='1'?'velora-pro':velora?'velora':'nexora');autoUpdater.allowDowngrade=false;if(process.env.VELORA_PRO==='1')autoUpdater.setFeedURL({provider:'generic',url:'https://github.com/coldzeeyt/nexora/releases/download/velora-pro-latest',channel:'velora-pro'});
 autoUpdater.netSession.setPermissionRequestHandler((_wc,_permission,done)=>done(false));
 autoUpdater.netSession.webRequest.onBeforeRequest((details,done)=>done({cancel:!require('./network-state.cjs').allowed('updates')||!allowedUpdateUrl(details.url)}));
 autoUpdater.on('checking-for-update',()=>emit({status:'checking',error:undefined}));
 autoUpdater.on('update-available',info=>emit({status:'available',availableVersion:info.version,progress:0}));
 autoUpdater.on('update-not-available',()=>emit({status:'current',error:undefined}));
 autoUpdater.on('download-progress',info=>emit({status:'downloading',progress:Math.round(info.percent)}));
 autoUpdater.on('update-downloaded',info=>emit({status:'downloaded',availableVersion:info.version,progress:100}));
 autoUpdater.on('error',()=>emit({status:'error',error:'The update service could not finish. Check your connection and try again.'}));
 async function check(){if(!require('./network-state.cjs').allowed('updates')){emit({status:'offline',error:'Turn on Online mode in Velora Settings to check for updates.'});return;}if(busy||!app.isPackaged)return;busy=true;try{await autoUpdater.checkForUpdates();}catch{emit({status:'error',error:'Could not check for updates. Please try again.'});}finally{busy=false;}}
 ipcMain.handle('nexora:update',async(event,operation)=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  if(operation==='status')return state;
  if(!app.isPackaged)return state;
  if(operation==='check'){await check();return state;}
  if(operation==='download'){
   if(!require('./network-state.cjs').allowed('updates')){emit({status:'offline',error:'Turn on Online mode to download updates.'});return state;}
   if(busy||state.status!=='available')return state;busy=true;emit({status:'downloading',progress:0});try{downloadToken=new CancellationToken();await autoUpdater.downloadUpdate(downloadToken);}catch{emit({status:'error',error:'Could not download the update. Check your connection and try again.'});}finally{busy=false;downloadToken=undefined;}return state;
  }
  if(operation==='install'&&state.status==='downloaded'){emit({status:'installing'});setTimeout(()=>autoUpdater.quitAndInstall(false,true),150);return state;}
  return state;
 });
 if(app.isPackaged&&process.env.NEXORA_TEST_HIDDEN!=='1'){const timer=setTimeout(()=>void check(),10000);timer.unref();const interval=setInterval(()=>void check(),6*60*60*1000);interval.unref();}
};
