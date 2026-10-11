const http=require('node:http');const fs=require('node:fs');const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'index.html'));
const logo=Buffer.from(require('./logo.cjs').split(',')[1],'base64');
http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
 if(pathname==='/health'){res.setHeader('Content-Type','application/json');res.end('{"status":"ok"}');return;}
 if(pathname==='/logo.png'){res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public,max-age=86400');res.end(logo);return;}
 if(pathname!=='/'){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Page not found');return;}
 res.setHeader('Content-Type','text/html; charset=utf-8');res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");res.end(html);
}).listen(Number(process.env.PORT||3000),'0.0.0.0');
