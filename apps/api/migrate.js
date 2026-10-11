import pg from 'pg';
import {readFile} from 'node:fs/promises';
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL});
try{for(const file of ['001-foundation.sql','002-publishing.sql','003-solo.sql','004-remove-starters.sql','005-freq.sql','006-static-sites.sql'])await pool.query(await readFile(new URL(`../../database/${file}`,import.meta.url),'utf8'));}finally{await pool.end();}
