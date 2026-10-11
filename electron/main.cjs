const {app,BrowserWindow,protocol,session,ipcMain,nativeImage} = require('electron');
const path = require('node:path');
const {parseAddress} = require('../shared/address.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'nexora',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}},{scheme:'nexora-preview',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);
app.whenReady().then(() => {
 session.defaultSession.webRequest.onBeforeRequest((details,done) => done({cancel:!details.url.startsWith('file://') && !details.url.startsWith('nexora://') && !details.url.startsWith('nexora-preview://')}));
 const configuredOrigin=process.env.NEXORA_API_URL || (process.env.NEXORA_LOCAL==='1' ? undefined : require('./config.cjs').apiOrigin);
 let apiOrigin;
 if(configuredOrigin){const parsed=new URL(configuredOrigin);if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.pathname!=='/')throw new Error('NEXORA_API_URL must be an HTTPS origin');apiOrigin=parsed.origin;}
 const apiSession=session.fromPartition('nexora-internal');
 apiSession.webRequest.onBeforeRequest((details,done)=>{let allowed=false;try{allowed=!!apiOrigin&&new URL(details.url).origin===apiOrigin;}catch{}done({cancel:!allowed});});
 require('./site-protocol.cjs')(protocol,apiOrigin,apiSession);
 const win=new BrowserWindow({show:process.env.NEXORA_TEST_HIDDEN!=='1',width:1280,height:850,minWidth:360,minHeight:560,title:'Nexora',icon:nativeImage.createFromDataURL(require('./branding.cjs').image),backgroundColor:'#fafafa',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 ipcMain.handle('nexora:ask',async(event,question)=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  if(typeof question!=='string'||!question.trim()||question.length>2000)return {error:'Enter up to 2,000 characters.'};
  if(!apiOrigin)return {error:'AI needs the public Nexora backend. Offline mode is enabled.'};
  try{const response=await apiSession.fetch(`${apiOrigin}/v1/ask`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});const data=await response.json();return {summary:typeof data.summary==='string'?data.summary:undefined,error:typeof data.error==='string'?data.error:undefined};}catch{return {error:'Could not reach Nexora AI. Please try again later.'};}
 });
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 require('./studio-api.cjs')(win,apiOrigin,apiSession);
 require('./solo-api.cjs')(win);
 require('./freq-view.cjs')(win);
 require('./preview.cjs')(win,protocol);
 win.webContents.on('will-navigate',event=>event.preventDefault());
 win.webContents.on('will-frame-navigate',event=>{if(event.isMainFrame){event.preventDefault();return;}try{if(!event.url.startsWith('nexora-preview://'))parseAddress(event.url);}catch{event.preventDefault();}});
 const reportNavigation=(url)=>{try{win.webContents.send('nexora:navigate',parseAddress(url).address);}catch{}};
 win.webContents.on('did-frame-navigate',(_event,url,_code,_status,isMainFrame)=>{if(!isMainFrame)reportNavigation(url);});
 win.webContents.on('did-navigate-in-page',(_event,url,isMainFrame)=>{if(!isMainFrame)reportNavigation(url);});
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 session.defaultSession.on('will-download',event=>event.preventDefault());
 win.loadFile(path.join(__dirname,'../dist/index.html'));
});
app.on('window-all-closed',()=>app.quit());



