import {scrypt as derive,randomBytes,createHash,timingSafeEqual,randomUUID} from 'node:crypto';
import {promisify} from 'node:util';
const scrypt=promisify(derive);
export const digest=token=>createHash('sha256').update(token).digest('hex');
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,64);return `${salt}:${key.toString('hex')}`;}
export async function verifyPassword(password,stored){const [salt,hex]=stored.split(':');const expected=Buffer.from(hex,'hex');const actual=await scrypt(password,salt,64);return expected.length===actual.length&&timingSafeEqual(expected,actual);}
export async function newSession(pool,user){const token=randomBytes(32).toString('hex');await pool.query('DELETE FROM sessions WHERE expires_at < now()');await pool.query("INSERT INTO sessions(token_hash,user_id,expires_at) VALUES($1,$2,now()+interval '7 days')",[digest(token),user.id]);return {token,user:{id:user.id,username:user.username}};}
export function requireUser(pool){return async(req,reply)=>{const bearer=req.headers.authorization;if(!bearer?.startsWith('Bearer ')||bearer.length>200)return reply.code(401).send({error:'Please sign in.'});const result=await pool.query('SELECT u.id,u.username FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()',[digest(bearer.slice(7))]);if(!result.rowCount)return reply.code(401).send({error:'Your session has expired. Please sign in.'});req.user=result.rows[0];req.tokenHash=digest(bearer.slice(7));};}
export function registerAuth(app,pool){
 const credentials={body:{type:'object',additionalProperties:false,required:['username','password'],properties:{username:{type:'string',pattern:'^[a-zA-Z0-9_]{3,24}$'},password:{type:'string',minLength:12,maxLength:128}}}};
 app.post('/v1/auth/register',{schema:credentials,config:{rateLimit:{max:3,timeWindow:'1 hour'}}},async(req,reply)=>{
  if(process.env.OPEN_REGISTRATION!=='true'||!process.env.NEXORA_ADMIN_TOKEN)return reply.code(503).send({error:'Registration is closed while the network is being prepared.'});
  const username=req.body.username.toLowerCase();const hash=await hashPassword(req.body.password);const client=await pool.connect();
  try{await client.query('BEGIN');await client.query("SELECT pg_advisory_xact_lock(hashtext('nexora:registration'))");const count=await client.query('SELECT count(*)::int AS count FROM users');if(count.rows[0].count>=100){await client.query('ROLLBACK');return reply.code(409).send({error:'The initial community account limit has been reached.'});}const user={id:randomUUID(),username};await client.query('INSERT INTO users(id,username,password_hash) VALUES($1,$2,$3)',[user.id,username,hash]);await client.query('COMMIT');return reply.code(201).send(await newSession(pool,user));}catch(e){await client.query('ROLLBACK');if(e.code==='23505')return reply.code(409).send({error:'That username is already taken.'});throw e;}finally{client.release();}
 });
 app.post('/v1/auth/login',{schema:credentials,config:{rateLimit:{max:10,timeWindow:'1 minute'}}},async(req,reply)=>{const result=await pool.query('SELECT id,username,password_hash FROM users WHERE username=$1',[req.body.username.toLowerCase()]);const stored=result.rows[0]?.password_hash||'00000000000000000000000000000000:'+ '00'.repeat(64);const valid=await verifyPassword(req.body.password,stored);if(!result.rowCount||!valid)return reply.code(401).send({error:'Username or password is incorrect.'});return newSession(pool,result.rows[0]);});
 const preHandler=requireUser(pool);
 app.get('/v1/me',{preHandler},async req=>({user:req.user}));
 app.post('/v1/auth/logout',{preHandler},async req=>{await pool.query('DELETE FROM sessions WHERE token_hash=$1',[req.tokenHash]);return {ok:true};});
 app.delete('/v1/me',{preHandler,schema:{body:{type:'object',additionalProperties:false,required:['password'],properties:{password:{type:'string',maxLength:128}}}}},async(req,reply)=>{const result=await pool.query('SELECT password_hash FROM users WHERE id=$1',[req.user.id]);if(!await verifyPassword(req.body.password,result.rows[0].password_hash))return reply.code(403).send({error:'Password confirmation failed.'});await pool.query('DELETE FROM users WHERE id=$1',[req.user.id]);return {ok:true};});
}

