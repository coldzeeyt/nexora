import {FolderClosed,NotebookPen,Settings2,Store,SquareCode,Calculator,Clock3,UserRound,PackageOpen,Globe2} from 'lucide-react';
import {logo} from '../logo';
export function AppIcon({id,size=24}:{id:string;size?:number}){if(id==='nexora')return <img className="v-nexora-icon" src={logo} alt="Nexora" style={{width:size+6,height:size+6}}/>;const Icon=id==='online'?Globe2:id==='files'?FolderClosed:id==='notes'?NotebookPen:id==='settings'?Settings2:id==='store'?Store:id==='studio'?SquareCode:id==='calculator'?Calculator:id==='clock'?Clock3:id==='account'?UserRound:PackageOpen;return <Icon size={size} strokeWidth={1.6} aria-hidden="true"/>;}

