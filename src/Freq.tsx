import {useEffect,useRef,useState} from 'react';
export function Freq({viewKey}:{viewKey:string}){
 const container=useRef<HTMLDivElement>(null);const [error,setError]=useState('');
 useEffect(()=>{
  const bridge=window.nexora;if(!bridge){setError('Open freq.zen in the Nexora desktop app to use Freq.');return;}
  let active=true;
  const resize=()=>{const box=container.current?.getBoundingClientRect();if(!box)return;void bridge.freq({action:'show',key:viewKey,bounds:{x:box.x,y:box.y,width:box.width,height:box.height}}).then(result=>{if(active)setError(result.error||'');}).catch(()=>{if(active)setError('Freq could not open. Refresh to try again.');});};
  const observer=new ResizeObserver(resize);if(container.current)observer.observe(container.current);
  return()=>{active=false;observer.disconnect();void bridge.freq({action:'hide',key:viewKey});};
 },[viewKey]);
 return <div ref={container} className="freq-page">{error?<div className="freq-message"><h1>Freq</h1><p>{error}</p></div>:<p className="freq-message" role="status">Connecting to Freq…</p>}</div>;
}
