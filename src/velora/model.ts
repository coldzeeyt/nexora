export type AppId=string;
export type Rect={x:number;y:number;w:number;h:number};
export type DesktopWindow={id:number;app:AppId;rect:Rect;minimized:boolean;maximized:boolean};
export type VirtualFile={id:string;parent:string;name:string;folder:boolean;data:string;bytes:number;modified:string};
export type Note={id:string;title:string;text:string};
export type Project={id:string;name:string;description:string;html:string;css:string;js:string;storeId?:string;version?:string};
export type StoreBundle={id:string;title:string;description:string;version:string;revision:number;files:import('../studio-client').WebsiteFile[]};
export type Settings={dark:boolean;online:boolean;wallpaper:string;animations:boolean;notifications:boolean;dock:string;startup:string;restore:boolean;welcome:boolean};
export type DesktopData={version:1;settings:Settings;notes:Note[];files:VirtualFile[];projects:Project[];bundles:StoreBundle[];installed:AppId[];positions:Partial<Record<AppId,Rect>>};
export const defaults:DesktopData={version:1,settings:{dark:true,online:false,wallpaper:'contour',animations:true,notifications:true,dock:'center',startup:'desktop',restore:true,welcome:false},notes:[],files:[],projects:[],bundles:[],installed:['online','account','nexora','files','notes','settings','store','studio'],positions:{}};
export const catalog:{id:AppId;name:string;description:string;symbol:string;core:boolean}[]=[{id:'online',name:'Online',description:'A basic real-web browser. Enable it in Settings.',symbol:'◎',core:true},{id:'account',name:'Nexora Account',description:'One account for Velora and the Nexora network.',symbol:'◎',core:true},{id:'nexora',name:'Nexora',description:'Your browser for the community network.',symbol:'N',core:true},{id:'files',name:'Files',description:'A private virtual space for your files.',symbol:'▱',core:true},{id:'notes',name:'Notes',description:'Thoughts, saved automatically and offline.',symbol:'≡',core:true},{id:'studio',name:'Studio',description:'Create and preview HTML, CSS and JavaScript apps.',symbol:'⌘',core:true},{id:'store',name:'Store',description:'Discover trusted apps bundled with Velora.',symbol:'⊞',core:true},{id:'settings',name:'Settings',description:'Make your desktop feel like yours.',symbol:'⚙',core:true},{id:'calculator',name:'Calculator',description:'A small offline arithmetic calculator.',symbol:'±',core:false},{id:'clock',name:'Clock',description:'Local time and a stopwatch.',symbol:'◷',core:false}];
export function clampRect(rect:Rect,width:number,height:number):Rect{const w=Math.min(Math.max(300,rect.w),width),h=Math.min(Math.max(220,rect.h),height);return {w,h,x:Math.max(0,Math.min(width-w,rect.x)),y:Math.max(0,Math.min(height-h,rect.y))};}
declare global{interface Window{velora?:{onFlush:(callback:()=>void)=>()=>void;runApp:(files:import('../studio-client').WebsiteFile[])=>Promise<{url?:string;error?:string}>;closeApp:(url:string)=>Promise<void>;store:(operation:string,payload?:unknown)=>Promise<{data?:DesktopData;ok?:boolean;error?:string;canceled?:boolean;file?:Omit<VirtualFile,'parent'|'folder'>}>}}}



