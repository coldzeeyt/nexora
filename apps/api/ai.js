import {localSummary} from './local-ai.js';
export async function summarize(question, {key=process.env.OPENROUTER_API_KEY,request=fetch,local=localSummary}={}) {
  if(!key) return local(question);
  try {
    const response=await request('https://openrouter.ai/api/v1/chat/completions',{
      method:'POST',redirect:'error',signal:AbortSignal.timeout(30000),
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},
      body:JSON.stringify({model:'openrouter/free',max_tokens:400,messages:[
        {role:'system',content:'You are Nexora AI. Answer the question or summarize the supplied text in a concise plain-text paragraph. Be accurate; acknowledge uncertainty. Do not claim live web access. Do not include HTML.'},
        {role:'user',content:question}
      ]})
    });
    if(!response.ok) return {status:response.status===429?429:503,error:response.status===429?'The free AI limit has been reached. Please try again later.':'The free AI provider is unavailable. Please try again later.'};
    const data=await response.json();const summary=data.choices?.[0]?.message?.content;
    return typeof summary==='string'&&summary.trim()?{status:200,summary:summary.slice(0,6000)}:{status:503,error:'The AI did not return a summary. Please try again.'};
  } catch {return {status:503,error:'The free AI provider could not be reached. Please try again later.'};}
}
