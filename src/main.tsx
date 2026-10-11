import React from 'react';
import {createRoot} from 'react-dom/client';
import Browser from './Browser';
import {Velora} from './velora/Velora';
createRoot(document.getElementById('root')!).render(new URLSearchParams(location.search).get('desktop')==='velora'?<Velora/>:<Browser/>);
