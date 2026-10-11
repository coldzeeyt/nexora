import {Backup} from './Backup';
import type {EcoProps} from './Publication';
import {Kivo} from './Kivo';
import {Reson,Luma,Vexa} from './MediaApps';
import {Nuvio,Forma,Mira} from './WorkApps';
import {Plixo,Orbi} from './PlayApps';
import {Fluxa} from './Fluxa';
import {Zento} from './Zento';
import './ecosystem.css';
export function EcoApp({app,...props}:EcoProps&{app:string;active:boolean}){
 const Component={backup:Backup,kivo:Kivo,reson:Reson,luma:Luma,vexa:Vexa,nuvio:Nuvio,forma:Forma,mira:Mira,plixo:Plixo,orbi:Orbi,fluxa:Fluxa,zento:Zento}[app as 'kivo'];
 return Component?<Component {...props}/>:null;
}
