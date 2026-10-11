export type AiResult={summary?:string;error?:string};
declare global {interface Window {nexora?:{ask:(question:string)=>Promise<AiResult>;studio:(operation:string,payload:Record<string,unknown>)=>Promise<import('./studio-client').StudioResult>;solo:(route:string,body?:Record<string,unknown>)=>Promise<{ok:boolean;data:any}>}}}
export function isAddressInput(value:string){return /^(?:[a-z][a-z0-9+.-]*:\/\/|[a-z][a-z0-9+.-]*:|[^\s/]+\.[^\s/?#]+(?:[/?#]|$))/i.test(value.trim());}
export async function askAi(question:string):Promise<AiResult>{if(!window.nexora)return {error:'AI is available in the Nexora desktop app. This preview shows the interface only.'};try{return await window.nexora.ask(question);}catch{return {error:'Nexora AI could not complete this request.'};}}

