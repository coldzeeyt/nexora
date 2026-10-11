export type User={id:string;username:string;displayName?:string;bio?:string};
export type WebsiteFile={path:string;data:string};
export type Site={domain:string;title:string;description:string;html:string;published:boolean;suspended:boolean;bytes?:number;files?:string[]};
export type StoreApp={id:string;title:string;description:string;version:string;revision:number;published?:boolean;files?:WebsiteFile[]};
export type StudioResult={error?:string;ready?:boolean;apps?:StoreApp[];id?:string;title?:string;description?:string;version?:string;revision?:number;user?:User;sites?:Site[];available?:boolean;domain?:string;ok?:boolean;files?:WebsiteFile[];quotaBytes?:number;status?:string;recoveryCode?:string;reports?:{id:string;domain:string;reason:string;created_at:string}[];users?:number};
export async function studioApi(operation:string,payload:Record<string,unknown>={}):Promise<StudioResult>{
 if(!window.nexora?.studio)return {error:'Open studio.nex in the Nexora desktop app to sign in and publish. This browser preview shows the interface.'};
 try{return await window.nexora.studio(operation,payload);}catch{return {error:'Studio could not complete this request.'};}
}
