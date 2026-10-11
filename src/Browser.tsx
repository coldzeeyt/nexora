import React, {useEffect,useState} from 'react';

import {parseAddress} from '../shared/address.cjs';
import './style.css';
import {askAi,isAddressInput,type AiResult} from './ai';
import {AiBox} from './AiBox';
import {Studio} from './Studio';
import {ReportSite} from './ReportSite';
import {studioApi} from './studio-client';



import {logo} from './logo';
import {Account} from './Account';
import {Downloads} from './Downloads';
import {Apps} from './Apps';
import {UpdatePanel} from './UpdatePanel';
import {Search,Domains,Status,Admin} from './NetworkPages';
type Tab={id:number;entries:string[];position:number};
const starters:string[][]=[];
function read<T,>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback;}catch{return fallback;}}
export default function App({enabled=true,initialAddress="home.nex"}:{enabled?:boolean;initialAddress?:string}){
 const [tabs,setTabs]=useState<Tab[]>([{id:1,entries:[initialAddress],position:0}]);const [active,setActive]=useState(1);
 useEffect(()=>{localStorage.setItem('linked-sites-removed','1');},[]);
 const [places,setPlaces]=useState(starters);const [reportDomain,setReportDomain]=useState('');const [input,setInput]=useState('home.nex');const [query,setQuery]=useState('');const [question,setQuestion]=useState('');const [aiResult,setAiResult]=useState<AiResult>({});const [aiPending,setAiPending]=useState(false);const [error,setError]=useState('');const [refresh,setRefresh]=useState(0);const [loading,setLoading]=useState(false);
 const [dark,setDark]=useState(()=>read('dark',false));const [bookmarks,setBookmarks]=useState<string[]>(()=>read<string[]>('bookmarks',[]).filter(h=>!['welcome.zen','makers.vnt','journal.kiv',...(localStorage.getItem('linked-sites-removed')?[]:['solo.zen','freq.zen'])].includes(h.split(/[/?#]/)[0])));const [history,setHistory]=useState<string[]>(()=>read<string[]>('history',[]).filter(h=>!['welcome.zen','makers.vnt','journal.kiv',...(localStorage.getItem('linked-sites-removed')?[]:['solo.zen','freq.zen'])].includes(h.split(/[/?#]/)[0])));
 useEffect(()=>{void studioApi('discover').then(result=>{if(result.sites)setPlaces(result.sites.map(site=>[site.domain,site.title,site.description]));});},[active,refresh]);

 const tab=tabs.find(t=>t.id===active)!;const address=tab.entries[tab.position];const official=['home.nex','settings.nex','help.nex','search.nex','explore.nex','history.nex','bookmarks.nex','ai.nex','studio.nex','report.nex','account.nex','domains.nex','status.nex','admin.nex','downloads.nex','apps.nex','velora.nex'];
 useEffect(()=>{setInput(address);setError('');},[address,active]);
 useEffect(()=>{localStorage.setItem('dark',JSON.stringify(dark));document.documentElement.dataset.theme=dark?'dark':'light';},[dark]);
 useEffect(()=>{localStorage.setItem('bookmarks',JSON.stringify(bookmarks));},[bookmarks]);useEffect(()=>{localStorage.setItem('history',JSON.stringify(history));},[history]);
 function navigate(value:string){try{const parsed=parseAddress(value);if(parsed.address===address)return;setTabs(ts=>ts.map(t=>t.id===active?{...t,entries:[...t.entries.slice(0,t.position+1),parsed.address],position:t.position+1}:t));setHistory(h=>[parsed.address,...h.filter(x=>x!==parsed.address)].slice(0,100));setError('');setLoading(!official.includes(parsed.host));}catch(e){setError((e as Error).message);}}
 async function submit(value:string){if(!value.trim())return;if(isAddressInput(value)){navigate(value);return;}setQuestion(value.trim());setAiResult({});setAiPending(true);navigate('ai.nex');setAiResult(await askAi(value.trim()));setAiPending(false);}
 function addTab(){const id=Date.now();setTabs(t=>[...t,{id,entries:[initialAddress],position:0}]);setActive(id);}
 function closeTab(id:number){if(tabs.length===1){navigate('home.nex');return;}setTabs(t=>t.filter(x=>x.id!==id));if(active===id)setActive(tabs.find(t=>t.id!==id)!.id);}
 function move(delta:number){setTabs(ts=>ts.map(t=>t.id===active?{...t,position:Math.max(0,Math.min(t.entries.length-1,t.position+delta))}:t));}
 useEffect(()=>{const handler=(e:KeyboardEvent)=>{if(!enabled)return;if(e.ctrlKey&&e.key==='l'){e.preventDefault();document.getElementById('address')?.focus();}if(e.ctrlKey&&e.key==='t'){e.preventDefault();addTab();}if(e.ctrlKey&&e.key==='w'){e.preventDefault();closeTab(active);}if(e.key==='F5'){e.preventDefault();setRefresh(x=>x+1);}};window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);});
 useEffect(()=>window.nexora?.onShortcut(action=>{if(!enabled)return;if(action==='address')document.getElementById('address')?.focus();if(action==='new-tab')addTab();if(action==='close-tab')closeTab(active);if(action==='refresh')setRefresh(x=>x+1);}),[active,address,tabs,enabled]);
 useEffect(()=>{if(initialAddress!==address)navigate(initialAddress);},[initialAddress]);
 useEffect(()=>window.nexora?.onNavigate(value=>navigate(value)),[active,address]);
 const host=address.split(/[/?#]/)[0];const toggleBookmark=()=>setBookmarks(b=>b.includes(address)?b.filter(x=>x!==address):[...b,address]);
 return <div className="browser" data-browser-theme={dark?"dark":"light"}><header><div className="tabs"><span className="brand"><img src={logo} alt="Nexora"/></span>{tabs.map(t=><div className={'tab '+(t.id===active?'selected':'')} key={t.id}><button onClick={()=>setActive(t.id)}>{t.entries[t.position].split('/')[0]}</button><button aria-label="Close tab" onClick={()=>closeTab(t.id)}>×</button></div>)}<button title="New tab (Ctrl+T)" onClick={addTab}>+</button></div><div className="toolbar"><button aria-label="Back" disabled={tab.position===0} onClick={()=>move(-1)}>←</button><button aria-label="Forward" disabled={tab.position===tab.entries.length-1} onClick={()=>move(1)}>→</button><button aria-label="Refresh" onClick={()=>setRefresh(x=>x+1)}>↻</button><button aria-label="Home" onClick={()=>navigate('home.nex')}>⌂</button><form onSubmit={e=>{e.preventDefault();void submit(input);}}><span className="network-dot"/><input id="address" aria-label="Nexora address" value={input} onChange={e=>setInput(e.target.value)} spellCheck={false}/></form><button aria-label="Bookmark page" onClick={toggleBookmark}>{bookmarks.includes(address)?'★':'☆'}</button>{!official.includes(host)&&<button aria-label="Report site" onClick={()=>{setReportDomain(host);navigate('report.nex');}}>⚑</button>}<button aria-label="Settings" onClick={()=>navigate('settings.nex')}>⚙</button></div></header>{loading&&<div className="loading"/>}{error?<main><span className="eyebrow">NEXORA NETWORK</span><h1>Stay within Nexora.</h1><p>{error}</p><button className="primary" onClick={()=>navigate('home.nex')}>Go home</button></main>:!official.includes(host)&&(window as any).mobileNexora?<main><h1>{host}</h1><p>Open this published site in an isolated view.</p><button className="primary" onClick={()=>void (window as any).mobileNexora.openSite(host)}>Open site</button></main>:!official.includes(host)?<iframe key={`${active}-${address}-${refresh}`} title={address} src={`nexora://${address}`} sandbox="allow-scripts" onLoad={()=>setLoading(false)}/>:<main key={`${active}-${address}-${refresh}`}>{host==='apps.nex'?<Apps navigate={navigate}/>:host==='velora.nex'?<Apps navigate={navigate} velora/>:host==='downloads.nex'?<Downloads/>:host==='account.nex'?<Account navigate={navigate}/>:host==='domains.nex'?<Domains navigate={navigate}/>:host==='status.nex'?<Status/>:host==='admin.nex'?<Admin/>:host==='search.nex'?<Search navigate={navigate}/>:host==='report.nex'?<ReportSite domain={reportDomain} navigate={navigate}/>:host==='studio.nex'?<Studio navigate={navigate} initialDomain={new URL('nexora://'+address).searchParams.get('domain')||undefined}/>:host==='ai.nex'?<AiBox question={question} result={aiResult} pending={aiPending}/>:host==='home.nex'?<><span className="eyebrow">A SMALLER, MORE HUMAN NETWORK</span><h1>A space of your own.</h1><p>Explore a new corner of the internet. Made by people. Free for everyone.</p><form className="search" onSubmit={e=>{e.preventDefault();void submit(query);}}><span>⌕</span><input aria-label="Explore a Nexora address" placeholder="Enter a Nexora address, or ask anything" value={query} onChange={e=>setQuery(e.target.value)}/><button aria-label="Open address">→</button></form><nav><button onClick={()=>navigate('studio.nex')}>Create a site ↗</button><button onClick={()=>navigate('explore.nex')}>Explore ↗</button><button onClick={()=>navigate('search.nex')}>Search sites</button><button onClick={()=>navigate('apps.nex')}>Apps</button><button onClick={()=>navigate('bookmarks.nex')}>Bookmarks</button><button onClick={()=>navigate('help.nex')}>Getting started</button></nav><section><div className="section-title"><h2>On the network</h2><span>PUBLISHED SITES</span></div><div className="cards">{!places.length&&<p>Be one of the first to publish here. Create your site in Studio.</p>}{places.map(([domain,title,description])=><button className="card" key={domain} onClick={()=>navigate(domain)}><span className="site-mark">{title[0]}</span><h3>{title}</h3><p>{description}</p><span>{domain} ↗</span></button>)}</div></section>{history.length>0&&<section><h2>Recently visited</h2>{history.slice(0,5).map(h=><button className="row" key={h} onClick={()=>navigate(h)}>{h}<span>↗</span></button>)}</section>}</>:host==='settings.nex'?<><span className="eyebrow">YOUR BROWSER</span><h1>Keep it simple.</h1><p>Preferences stay on this computer.</p><div className="row">Dark appearance<input aria-label="Dark appearance" type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)}/></div><button className="row" onClick={()=>setHistory([])}>Clear browsing history<span>→</span></button><nav><button onClick={()=>navigate('downloads.nex')}>Downloads</button><button onClick={()=>navigate('account.nex')}>Account</button><button onClick={()=>navigate('domains.nex')}>Addresses</button><button onClick={()=>navigate('status.nex')}>Network status</button><button onClick={()=>navigate('admin.nex')}>Moderation</button></nav><UpdatePanel/><p className="note">Nexora is free to use. Your browser connects to the shared Nexora registry.</p></>:host==='help.nex'?<><h1>Hello, Nexora.</h1><p>Open studio.nex to publish your own website or velora.nex to download Velora Desktop. Use + to open a tab, ☆ to bookmark a page, and Settings to change appearance.</p><p>Ctrl+L focuses the address bar. Ctrl+T opens a tab. Ctrl+W closes it. F5 refreshes.</p><p>Free accounts and website publishing are available in studio.nex. You can upload ZIP websites, use the visual builder or code editor, and recover your password with a private recovery code.</p></>:<><span className="eyebrow">NEXORA NETWORK</span><h1>{host==='bookmarks.nex'?'Your saved places.':host==='history.nex'?'Where you’ve been.':'Find your next corner.'}</h1>{(host==='bookmarks.nex'?bookmarks:host==='history.nex'?history:places.map(s=>s[0])).map(h=><button className="row" key={h} onClick={()=>navigate(h)}>{h}<span>↗</span></button>)}{host==='bookmarks.nex'&&!bookmarks.length&&<p>Save a page with the star in the address bar.</p>}</>}<footer><span>NEXORA</span><span>Free to explore. Free to belong.</span><button onClick={()=>navigate('history.nex')}>History</button></footer></main>}</div>;
}













