const {app,BrowserWindow,protocol,session,ipcMain,nativeImage} = require('electron');
const path = require('node:path');
const {parseAddress} = require('../shared/address.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'nexora',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}},{scheme:'velora-media',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true,stream:true}},{scheme:'nexora-preview',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);
const velora=process.env.VELORA_DESKTOP==='1';const standalone=process.env.VELORA_APP;const product=standalone?require('../shared/standalone-apps.cjs')[standalone]:'Velora';if(standalone&&!product)throw Error('Unsupported app');
if(velora){app.setName(product);app.setPath('userData',process.argv.find(a=>a.startsWith('--user-data-dir='))?.slice(16)||path.join(app.getPath('appData'),standalone?'VeloraApps/'+standalone:'Velora'));}
const network=require('./network-state.cjs');
app.whenReady().then(() => {
 session.defaultSession.webRequest.onBeforeRequest((details,done) => done({cancel:!details.url.startsWith('file://') && !details.url.startsWith('nexora://') && !details.url.startsWith('nexora-preview://') && !(velora&&details.url.startsWith('velora-media://'))}));
 const configuredOrigin=process.env.NEXORA_API_URL || (process.env.NEXORA_LOCAL==='1' ? undefined : require('./config.cjs').apiOrigin);
 let apiOrigin;
 if(configuredOrigin){const parsed=new URL(configuredOrigin);if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.pathname!=='/')throw new Error('NEXORA_API_URL must be an HTTPS origin');apiOrigin=parsed.origin;}
 const apiSession=session.fromPartition('nexora-internal');
 apiSession.webRequest.onBeforeRequest((details,done)=>{let allowed=false;try{allowed=network.allowedApi(details.url)&&!!apiOrigin&&new URL(details.url).origin===apiOrigin;}catch{}done({cancel:!allowed});});
 require('./site-protocol.cjs')(protocol,apiOrigin,apiSession);
 if(!velora&&app.isPackaged&&process.env.NEXORA_TEST_HIDDEN!=='1')app.setAsDefaultProtocolClient('nexora');
 const win=new BrowserWindow({show:process.env.NEXORA_TEST_HIDDEN!=='1',width:1280,height:850,minWidth:360,minHeight:560,title:velora?product:'Nexora',icon:nativeImage.createFromDataURL(standalone?require('./standalone-branding.cjs')[standalone]:velora?require('./velora-brand.cjs'):require('./branding.cjs').image),backgroundColor:'#fafafa',autoHideMenuBar:true,webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,backgroundThrottling:process.env.NEXORA_TEST_HIDDEN!=='1'}});
 ipcMain.handle('nexora:ask',async(event,question)=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  if(typeof question!=='string'||!question.trim()||question.length>2000)return {error:'Enter up to 2,000 characters.'};
  if(!network.allowed('ai'))return {error:'AI is off. Enable Online mode and AI in Velora’s connectivity settings.'};
  if(!apiOrigin)return {error:'AI needs the public Nexora backend. Offline mode is enabled.'};
  try{const response=await apiSession.fetch(`${apiOrigin}/v1/ask`,{method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});const data=await response.json();return {summary:typeof data.summary==='string'?data.summary:undefined,error:typeof data.error==='string'?data.error:undefined};}catch{return {error:'Could not reach Nexora AI. Please try again later.'};}
 });
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 require('./studio-api.cjs')(win,apiOrigin,apiSession);
 require('./app-downloads.cjs')(win);
 require('./updates.cjs')(win,velora);
 if(velora){network.install(win);require('./velora-store.cjs')(win);require('./online-view.cjs')(win);require('./media-library.cjs')(win,protocol);}
 
 require('./preview.cjs')(win,protocol);
 require('./downloads.cjs')(win,apiOrigin,apiSession);
 require('./shortcuts.cjs')(win.webContents,win);
 win.webContents.on('will-navigate',event=>event.preventDefault());
 win.webContents.on('will-frame-navigate',event=>{if(event.isMainFrame){event.preventDefault();return;}try{if(!event.url.startsWith('nexora-preview://'))parseAddress(event.url);}catch{event.preventDefault();}});
 const reportNavigation=(url)=>{try{win.webContents.send('nexora:navigate',parseAddress(url).address);}catch{}};
 win.webContents.on('did-frame-navigate',(_event,url,_code,_status,isMainFrame)=>{if(!isMainFrame)reportNavigation(url);});
 win.webContents.on('did-navigate-in-page',(_event,url,isMainFrame)=>{if(!isMainFrame)reportNavigation(url);});
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 session.defaultSession.on('will-download',event=>event.preventDefault());
 const initialAddress=process.argv.find(arg=>arg.startsWith('nexora://'));
 if(initialAddress)win.webContents.once('did-finish-load',()=>setTimeout(()=>{try{win.webContents.send('nexora:navigate',parseAddress(initialAddress).address);}catch{}},200));
 win.loadFile(path.join(__dirname,'../dist/index.html'),velora?{query:{desktop:'velora',...(standalone?{app:standalone}:{})}}:{});

});
app.on('window-all-closed',()=>app.quit());








