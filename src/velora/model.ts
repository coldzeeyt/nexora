import {ecosystemDefaults,ecosystems,type EcosystemData,type MediaItem} from './ecosystem-model';
export type AppId=string;
export type Rect={x:number;y:number;w:number;h:number};
export type DesktopWindow={id:number;app:AppId;rect:Rect;minimized:boolean;maximized:boolean};
export type VirtualFile={id:string;parent:string;name:string;folder:boolean;data:string;bytes:number;modified:string};
export type Note={id:string;title:string;text:string};
export type Project={id:string;name:string;description:string;html:string;css:string;js:string;storeId?:string;version?:string};
export type StoreBundle={id:string;title:string;description:string;version:string;revision:number;files:import('../studio-client').WebsiteFile[]};
export type NetworkFeatures={ai:boolean;publishing:boolean;messaging:boolean;community:boolean;cloud:boolean;updates:boolean;nexora:boolean;browser:boolean};
export type Settings={dark:boolean;networkOnline:boolean;networkFeatures:NetworkFeatures;online:boolean;wallpaper:string;animations:boolean;notifications:boolean;dock:string;startup:string;restore:boolean;welcome:boolean};
export type DesktopData={version:1;ecosystem:EcosystemData;settings:Settings;notes:Note[];files:VirtualFile[];projects:Project[];tasks:{id:string;text:string;done:boolean}[];bundles:StoreBundle[];installed:AppId[];positions:Partial<Record<AppId,Rect>>};
export const defaults:DesktopData={version:1,ecosystem:ecosystemDefaults,settings:{dark:true,networkOnline:false,networkFeatures:{ai:true,publishing:true,messaging:true,community:true,cloud:true,updates:true,nexora:true,browser:false},online:false,wallpaper:'contour',animations:true,notifications:true,dock:'center',startup:'desktop',restore:true,welcome:false},notes:[],files:[],projects:[],tasks:[],bundles:[],installed:['nomi','kivo','reson','luma','vexa','nuvio','plixo','forma','zento','orbi','mira','fluxa','online','nexora','settings','store','studio'],positions:{}};
export const catalog:{id:AppId;name:string;description:string;symbol:string;core:boolean}[]=[...ecosystems.map(a=>({...a,symbol:'◇',core:true})),{id:'online',name:'Online',description:'A basic real-web browser. Enable it in Settings.',symbol:'◎',core:true},{id:'nexora',name:'Nexora',description:'Browse and publish on the Nexora network.',symbol:'N',core:true},{id:'studio',name:'Forge',description:'Build, preview and publish your own applications.',symbol:'⌘',core:true},{id:'store',name:'Store',description:'Install and update community applications.',symbol:'⊞',core:true},{id:'settings',name:'Settings',description:'Your desktop preferences, guide and updates.',symbol:'⚙',core:true}];
export function clampRect(rect:Rect,width:number,height:number):Rect{const w=Math.min(Math.max(300,rect.w),width),h=Math.min(Math.max(220,rect.h),height);return {w,h,x:Math.max(0,Math.min(width-w,rect.x)),y:Math.max(0,Math.min(height-h,rect.y))};}
declare global{interface Window{velora?:{network:(operation:string,value?:boolean|{online:boolean;features:NetworkFeatures})=>Promise<{online:boolean}>;media:(operation:string,payload?:Record<string,unknown>)=>Promise<{items?:MediaItem[];item?:MediaItem;file?:{name:string;type:string;data:string};error?:string;ok?:boolean;canceled?:boolean;added?:string[]}>;onFlush:(callback:()=>void)=>()=>void;runApp:(files:import('../studio-client').WebsiteFile[])=>Promise<{url?:string;error?:string}>;closeApp:(url:string)=>Promise<void>;store:(operation:string,payload?:unknown)=>Promise<{data?:DesktopData;ok?:boolean;error?:string;canceled?:boolean;file?:Omit<VirtualFile,'parent'|'folder'>}>}}}




