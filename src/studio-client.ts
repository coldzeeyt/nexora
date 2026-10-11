export type User={id:string;username:string};
export type Site={domain:string;title:string;description:string;html:string;published:boolean;suspended:boolean};
export type StudioResult={error?:string;user?:User;sites?:Site[];available?:boolean;domain?:string;ok?:boolean};
export async function studioApi(operation:string,payload:Record<string,unknown>={}):Promise<StudioResult>{
 if(!window.nexora?.studio)return {error:'Open studio.nex in the Nexora desktop app to sign in and publish. This browser preview shows the interface.'};
 try{return await window.nexora.studio(operation,payload);}catch{return {error:'Studio could not complete this request.'};}
}
