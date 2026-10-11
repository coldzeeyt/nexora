const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('nexora',{ask:question=>ipcRenderer.invoke('nexora:ask',question),studio:(operation,payload)=>ipcRenderer.invoke('nexora:studio',operation,payload),solo:(route,body)=>ipcRenderer.invoke('nexora:solo',route,body)});
