const id=require('../package.json').veloraApp||process.env.STANDALONE_APP;
if(!require('../shared/standalone-apps.cjs')[id])throw Error('Unsupported app.');
process.env.VELORA_APP=id;process.env.VELORA_DESKTOP='1';require('./main.cjs');
