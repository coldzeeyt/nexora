const {WebContentsView,session,ipcMain}=require('electron');
const ORIGIN='https://freqfm.up.railway.app';
function allowedResource(value){
 try{const u=new URL(value);return !u.username&&!u.password&&((u.origin===ORIGIN)||(u.origin==='https://assets.mixkit.co'&&u.pathname.startsWith('/videos/'))||u.protocol==='blob:'&&u.origin===ORIGIN||u.protocol==='data:');}catch{return false;}
}
module.exports=function connectFreq(win){
 const ses=session.fromPartition('persist:nexora-freq');
 ses.webRequest.onBeforeRequest((details,done)=>done({cancel:!allowedResource(details.url)}));
 ses.setPermissionRequestHandler((_wc,_permission,done)=>done(false));
 ses.setPermissionCheckHandler(()=>false);
 ses.on('will-download',event=>event.preventDefault());
 let view;let currentKey;let attached=false;
 ipcMain.handle('nexora:freq',async(event,payload)=>{
  if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame||!event.senderFrame.url.startsWith('file://'))throw new Error('Access denied');
  if(payload?.action==='hide'){
   if(payload.key===currentKey&&attached){win.contentView.removeChildView(view);attached=false;}
   return {};
  }
  if(payload?.action!=='show'||typeof payload.key!=='string'||payload.key.length>160)return {error:'Invalid Freq view.'};
  const b=payload.bounds;const [width,height]=win.getContentSize();
  if(!b||!['x','y','width','height'].every(k=>Number.isFinite(b[k]))||b.y<80||b.y>=height||b.x<0||b.x>=width||b.width<1||b.height<1)return {error:'Invalid Freq bounds.'};
  if(!view){
   view=new WebContentsView({webPreferences:{session:ses,nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
   view.webContents.setWindowOpenHandler(()=>({action:'deny'}));
   const restrict=(event,url)=>{try{if(new URL(url).origin!==ORIGIN)event.preventDefault();}catch{event.preventDefault();}};
   view.webContents.on('will-navigate',restrict);view.webContents.on('will-redirect',restrict);
   // Remote project pages receive no Nexora preload or privileged bridge.
  }
  const changed=currentKey!==payload.key;currentKey=payload.key;
  view.setBounds({x:Math.round(b.x),y:Math.round(b.y),width:Math.min(Math.round(b.width),width-Math.round(b.x)),height:Math.min(Math.round(b.height),height-Math.round(b.y))});
  if(!attached){win.contentView.addChildView(view);attached=true;}
  if(changed){try{await view.webContents.loadURL(ORIGIN);return {};}catch{if(currentKey===payload.key&&attached){win.contentView.removeChildView(view);attached=false;}return {error:'Could not load Freq. Check your connection and refresh.'};}}
  return {};
 });
 win.on('closed',()=>{if(view&&!view.webContents.isDestroyed())view.webContents.close();});
};
module.exports.allowedResource=allowedResource;
