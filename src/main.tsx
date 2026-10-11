import {initializeMobile} from './mobile/bootstrap';
import React from 'react';
import {createRoot} from 'react-dom/client';
import Browser from './Browser';
import {Standalone} from './velora/Standalone';
import {Velora} from './velora/Velora';
initializeMobile().then(()=>createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).get('app')?<Standalone app={new URLSearchParams(location.search).get('app')!}/>:new URLSearchParams(location.search).get('desktop')==='velora'?<Velora/>:<Browser/>)).catch(()=>{document.getElementById('root')!.textContent='Device services could not initialize. Close and reopen the app to try again.';});
