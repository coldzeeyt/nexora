const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('nexora',{ask:question=>ipcRenderer.invoke('nexora:ask',question)});
