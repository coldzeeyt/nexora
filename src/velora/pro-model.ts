import type {DesktopWindow} from './model';
export type Space={id:string;name:string;wallpaper:string;windows:DesktopWindow[]};
export type ProWorkspace={version:1;active:string;spaces:Space[]};
export const proDefaults:ProWorkspace={version:1,active:'everyday',spaces:[{id:'everyday',name:'Everyday',wallpaper:'contour',windows:[]}]};
export function readProWorkspace():ProWorkspace{
 try{const value=JSON.parse(localStorage.getItem('velora-pro-workspace')||'null');if(value?.version!==1||!Array.isArray(value.spaces))return structuredClone(proDefaults);
 const spaces:Space[]=value.spaces.slice(0,12).filter((s:Space)=>typeof s.id==='string'&&typeof s.name==='string').map((s:Space)=>({id:s.id.slice(0,80),name:s.name.slice(0,40),wallpaper:['contour','plain','grid'].includes(s.wallpaper)?s.wallpaper:'contour',windows:Array.isArray(s.windows)?s.windows.slice(0,40).filter((w:DesktopWindow)=>Number.isSafeInteger(w.id)&&typeof w.app==='string'&&w.rect&&['x','y','w','h'].every(k=>Number.isFinite(w.rect[k as keyof typeof w.rect]))).map((w:DesktopWindow)=>({...w,minimized:Boolean(w.minimized),maximized:Boolean(w.maximized)})):[]}));
 return spaces.length?{version:1,spaces,active:spaces.some(s=>s.id===value.active)?value.active:spaces[0].id}:structuredClone(proDefaults);
 }catch{return structuredClone(proDefaults);}
}
