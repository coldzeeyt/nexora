export async function soloRequest(route:string,options:RequestInit={}){
 if(!window.nexora?.solo)return {ok:false,json:async()=>({error:'Open solo.zen in the Nexora desktop app to connect to the live room.'})};
 const body=options.body?JSON.parse(String(options.body)):undefined;
 const result=await window.nexora.solo(route,body);
 return {ok:result.ok,json:async()=>result.data};
}
