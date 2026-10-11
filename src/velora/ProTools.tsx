import React,{useState} from 'react';
import type {DesktopData} from './model';
export function ProTools({data,setData,open,spaces,switchSpace,addSpace}:{data:DesktopData;setData:React.Dispatch<React.SetStateAction<DesktopData>>;open:(app:string)=>void;spaces:{id:string;name:string}[];switchSpace:(id:string)=>void;addSpace:()=>void}){
 const [input,setInput]=useState('');const [history,setHistory]=useState<string[]>([]);const [lines,setLines]=useState(['Velora Terminal · Local commands only. Type help.']);const [index,setIndex]=useState(-1);
 const commands=['help','clear','apps list','apps open','system info','system status','files list','spaces list','spaces switch','spaces create','settings show','theme dark','theme light','files create','files delete'];
 function run(){const command=input.trim();if(!command)return;setHistory(h=>[...h,command].slice(-100));setIndex(-1);setInput('');let result='Unknown command. Type help.';
 if(command==='clear'){setLines([]);return;}
 if(command==='help')result=commands.join('\n');
 else if(command==='apps list')result=data.installed.join('\n');
 else if(command.startsWith('apps open ')){const id=command.slice(10).trim();if(data.installed.includes(id)){open(id);result='Opened '+id;}else result='App is not installed.';}
 else if(command==='system info')result='Velora Pro · Free · Virtual workspace inside an app';
 else if(command==='system status')result=data.settings.networkOnline?'Online mode is enabled. Individual feature switches still apply.':'Offline mode. Velora network features are disabled.';
 else if(command==='files list')result=data.files.map(f=>f.name).join('\n')||'No virtual files.';
 else if(command==='spaces list')result=spaces.map(s=>s.name).join('\n');
 else if(command==='spaces create'){addSpace();result='Space creation opened.';}
 else if(command.startsWith('spaces switch ')){const s=spaces.find(s=>s.name.toLowerCase()===command.slice(14).toLowerCase());if(s){switchSpace(s.id);result='Switched to '+s.name;}else result='Space not found.';}
 else if(command==='theme dark'||command==='theme light'){setData(d=>({...d,settings:{...d.settings,dark:command==='theme dark'}}));result='Appearance updated.';}
 else if(command.startsWith('files create ')){const name=command.slice(13).trim();if(!/^[^<>:\"/\\|?*\x00-\x1f]{1,100}$/.test(name)||data.files.length>=500)result='Use a valid file name; up to 500 files.';else{setData(d=>({...d,files:[...d.files,{id:crypto.randomUUID(),name,parent:'root',folder:false,data:'',bytes:0,modified:new Date().toISOString()}]}));result='Created '+name;}}
 else if(command.startsWith('files delete ')){const name=command.slice(13).trim();const matches=data.files.filter(f=>f.name===name);if(matches.length!==1)result='Choose a unique existing file name.';else if(confirm('Move '+name+' to Trash?')){setData(d=>({...d,files:d.files.map(f=>f.id===matches[0].id?{...f,trashed:true}:f)}));result='Moved to Trash.';}else result='Canceled.';}
 else if(command==='settings show')result=JSON.stringify(data.settings,null,2);
 setLines(l=>[...l,'> '+command,result].slice(-200));
 }
 return <section className="v-pro-terminal"><h2>Terminal</h2><small>Commands control Velora only. No operating system shell.</small><pre aria-live="polite">{lines.join('\n')}</pre><form onSubmit={e=>{e.preventDefault();run();}}><label htmlFor="pro-command">❯</label><input id="pro-command" autoFocus value={input} placeholder="help" onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Tab'){e.preventDefault();setInput(commands.find(c=>c.startsWith(input))||input);}if(e.key==='ArrowUp'){e.preventDefault();const n=index<0?history.length-1:Math.max(0,index-1);setIndex(n);setInput(history[n]||'');}if(e.key==='ArrowDown'){e.preventDefault();const n=index+1;setIndex(n);setInput(history[n]||'');}}}/><button>Run</button></form></section>;
}
