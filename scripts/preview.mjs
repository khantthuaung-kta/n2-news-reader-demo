import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {stat} from 'node:fs/promises';
import {extname,join,relative,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const argumentsFor=process.argv.slice(2);
const option=(name,defaultValue)=>argumentsFor.includes(name)?argumentsFor[argumentsFor.indexOf(name)+1]:defaultValue;
const host=option('--host','127.0.0.1');
const port=Number(option('--port','4173'));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
try { await stat(join(dist,'index.html')); } catch { console.error('Run npm run build first.'); process.exit(1); }
const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; style-src 'self'; font-src 'self'; script-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'"};
const server=createServer(async(request,response)=>{
  if(request.method!=='GET'&&request.method!=='HEAD') {
    response.writeHead(405,{...headers,Allow:'GET, HEAD'}).end();return;
  }
  try{
    const url=new URL(request.url,'http://localhost');
    let path=decodeURIComponent(url.pathname);
    if(path.endsWith('/'))path+='index.html';
    if(path.includes('\\')||path.includes('\0'))throw Error();
    const file=resolve(dist,'.'+path);
    const within=relative(dist,file);
    if(!within||within==='..'||within.startsWith('..'+sep)||!mime[extname(file)])throw Error();
    const metadata=await stat(file);
    if(!metadata.isFile())throw Error();
    response.writeHead(200,{...headers,'Content-Type':mime[extname(file)],'Content-Length':metadata.size});
    if(request.method==='HEAD')response.end(); else createReadStream(file).pipe(response);
  }catch{response.writeHead(404,headers).end('Not found.');}
});
server.listen(port,host,()=>console.log(`N2 demo preview: http://${host}:${server.address().port}/`));
