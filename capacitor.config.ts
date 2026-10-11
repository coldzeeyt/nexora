import type {CapacitorConfig} from '@capacitor/cli';
const id=process.env.STANDALONE_APP||'velora';
const config:CapacitorConfig={appId:'network.velora.android.'+id,appName:id==='velora'?'Velora':id==='studio'?'Forge':id[0].toUpperCase()+id.slice(1),webDir:'dist',server:{androidScheme:'https',allowNavigation:[]},android:{allowMixedContent:false,webContentsDebuggingEnabled:false},plugins:{SystemBars:{insetsHandling:'native',initialViewportFitValueHint:'cover'},CapacitorHttp:{enabled:false}}};export default config;
