const {WebContentsView,session,ipcMain}=require('electron');const {onlineAddress,onlineResource}=require('../shared/online-policy.cjs');
module.exports=win=>{
 const ses=session.fromPartition('persist:velora-online');ses.webRequest.onBeforeRequest((details,done)=>done({cancel:!onlineResource(details.url)}));ses.setPermissionRequestHandler((_wc,_permission,done)=>done(false));ses.setPermissionCheckHandler(()=>false);ses.on('will-download',e=>e.preventDefault());
 let enabled=false,view,attached=false;let state={url:'',loading:false,back:false,forward:false,error:''};
 function emit(patch={}){state={...state,...patch};if(view&&!view.webContents.isDestroyed())state={...state,back:view.webContents.navigationHistory.canGoBack(),forward:view.webContents.navigationHistory.canGoForward()};if(!win.isDestroyed())win.webContents.send('velora:online-state',state);}
 function hide(){if(view&&!view.webContents.isDestroyed()){view.webContents.setAudioMuted(true);void view.webContents.executeJavaScript('document.querySelectorAll("video,audio").forEach(media=>media.pause())').catch(()=>{});}if(attached){win.contentView.removeChildView(view);attached=false;}}
 function destroy(){hide();if(view&&!view.webContents.isDestroyed())view.webContents.close();view=undefined;state={url:'',loading:false,back:false,forward:false,error:''};}
 function create(){if(view)return;view=new WebContentsView({webPreferences:{session:ses,nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,backgroundThrottling:true}});view.webContents.setWindowOpenHandler(()=>({action:'deny'}));const restrict=(event,url)=>{try{onlineAddress(url);}catch{event.preventDefault();}};view.webContents.on('will-navigate',restrict);view.webContents.on('will-redirect',restrict);view.webContents.on('did-start-loading',()=>emit({loading:true,error:''}));view.webContents.on('did-stop-loading',()=>emit({loading:false}));view.webContents.on('did-navigate',(_e,url)=>emit({url,error:''}));view.webContents.on('did-navigate-in-page',(_e,url)=>emit({url}));view.webContents.on('did-fail-load',(_e,code,_description,_url,main)=>{if(main&&code!==-3)emit({loading:false,error:'This page could not load. Check the address and try again.'});});}
 ipcMain.handle('velora:online',async(event,payload)=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw Error('Access denied');
  if(payload?.action==='enable'){enabled=payload.enabled===true;if(!enabled)destroy();return {enabled,...state};}
  if(payload?.action==='status')return {enabled,...state};
  if(payload?.action==='hide'){hide();return state;}
  if(payload?.action==='close'){destroy();return state;}
  if(!enabled)return {error:'Enable Online in Velora Settings first.'};
  if(payload?.action==='show'){
   const b=payload.bounds;const [width,height]=win.getContentSize();if(!b||!['x','y','width','height'].every(k=>Number.isFinite(b[k]))||b.x<0||b.y<70||b.x>=width||b.y>=height||b.width<1||b.height<1)return {error:'Invalid browser bounds.'};if(!view||!view.webContents.getURL())return state;view.setBounds({x:Math.round(b.x),y:Math.round(b.y),width:Math.min(Math.round(b.width),width-Math.round(b.x)),height:Math.min(Math.round(b.height),height-Math.round(b.y))});if(!attached){win.contentView.addChildView(view);attached=true;}view.webContents.setAudioMuted(false);return state;
  }
  if(payload?.action==='navigate'){let url;try{url=onlineAddress(payload.url);}catch(e){return {error:e.message};}create();try{await view.webContents.loadURL(url);return state;}catch{return {error:'This page could not load. Check the address and try again.'};}}
  if(payload?.action==='back'&&view?.webContents.navigationHistory.canGoBack())view.webContents.navigationHistory.goBack();
  if(payload?.action==='forward'&&view?.webContents.navigationHistory.canGoForward())view.webContents.navigationHistory.goForward();
  if(payload?.action==='refresh'&&view&&!view.webContents.isDestroyed())view.webContents.reload();return state;
 });
 win.on('closed',()=>{if(view&&!view.webContents.isDestroyed())view.webContents.close();});
};

