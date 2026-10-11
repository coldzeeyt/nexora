import {loadModel} from './local-ai.js';
const generator=await loadModel();
await generator.dispose();
console.log('Nexora AI model cached in the deployment image.');
