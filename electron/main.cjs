const {app,BrowserWindow,protocol,session} = require('electron');
const path = require('node:path');
const {parseAddress} = require('../shared/address.cjs');
protocol.registerSchemesAsPrivileged([{scheme:'nexora',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
const sites = {
 'welcome.zen':'<h1>A place to begin.</h1><p>Welcome to the Nexora community. This local starter site is included with your browser.</p>',
 'makers.vnt':'<h1>Made by people.</h1><p>A quiet corner for curious builders. Share ideas, create something useful, and make yourself at home.</p>',
 'journal.kiv':'<h1>Small observations.</h1><p>A personal journal starter. Your own space can be as simple as a single HTML file.</p>'
};
app.whenReady().then(() => {
 session.defaultSession.webRequest.onBeforeRequest((details,done) => done({cancel:!details.url.startsWith('file://') && !details.url.startsWith('nexora://')}));
 const configuredOrigin=process.env.NEXORA_API_URL;
 let apiOrigin;
 if(configuredOrigin){const parsed=new URL(configuredOrigin);if(parsed.protocol!=='https:'||parsed.username||parsed.password||parsed.pathname!=='/')throw new Error('NEXORA_API_URL must be an HTTPS origin');apiOrigin=parsed.origin;}
 protocol.handle('nexora', async request => {
  let host;
  try {host=parseAddress(request.url).host;} catch {return new Response('Unsupported address',{status:400});}
  let content=sites[host];
  if(apiOrigin){try{const response=await fetch(`${apiOrigin}/v1/resolve/${encodeURIComponent(host)}`,{redirect:'error',signal:AbortSignal.timeout(10000)});if(response.ok){const data=await response.json();content=typeof data.html==='string'&&data.html.length<=1024*1024?data.html:undefined;}else if(response.status===404){content=undefined;}else{return new Response('Nexora backend unavailable',{status:503,headers:{'Content-Type':'text/plain'}});}}catch{return new Response('Could not connect to the Nexora backend',{status:503,headers:{'Content-Type':'text/plain'}});}}
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><style>body{font:18px system-ui;max-width:720px;margin:100px auto;padding:32px;color:#222}h1{font-size:48px;font-weight:500;letter-spacing:-2px}p{line-height:1.8;color:#666}</style>${content||'<h1>Address not found</h1><p>This address is not registered in the local network.</p>'}</html>`,{status:content?200:404,headers:{'Content-Type':'text/html','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'none'; frame-ancestors 'self' file:"}});
 });
 const win=new BrowserWindow({width:1280,height:850,minWidth:760,minHeight:560,title:'Nexora',backgroundColor:'#fafafa',autoHideMenuBar:true,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',event=>event.preventDefault());
 session.defaultSession.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 session.defaultSession.on('will-download',event=>event.preventDefault());
 win.loadFile(path.join(__dirname,'../dist/index.html'));
});
app.on('window-all-closed',()=>app.quit());
