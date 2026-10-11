let generatorPromise;
let running=false;
export async function loadModel(){
 if(!generatorPromise)generatorPromise=(async()=>{
  const {pipeline,env}=await import('@huggingface/transformers');
  env.cacheDir=process.env.NEXORA_MODEL_CACHE||'/app/models';
  return pipeline('text-generation','onnx-community/SmolLM2-135M-Instruct-ONNX-MHA',{
   revision:'5b6682c',dtype:'q8',device:'cpu',session_options:{intraOpNumThreads:2,interOpNumThreads:1}
  });
 })().catch(error=>{generatorPromise=undefined;throw error;});
 return generatorPromise;
}
export async function localSummary(question){
 if(running)return {status:429,error:'Nexora AI is helping someone else. Please try again in a moment.'};
 running=true;
 try{
  const generator=await loadModel();
  const output=await generator([
   {role:'system',content:'You are a helpful assistant. Give a short, clear answer in one paragraph. If asked to summarize text, summarize only the provided text.'},
   {role:'user',content:question}
  ],{max_new_tokens:160,do_sample:false,repetition_penalty:1.1});
  const generated=output[0]?.generated_text;
  const answer=Array.isArray(generated)?generated.at(-1)?.content:generated;
  return typeof answer==='string'&&answer.trim()?{status:200,summary:answer.trim().slice(0,6000)}:{status:503,error:'The model could not produce an answer. Please try a shorter question.'};
 }catch(error){console.error('Local AI inference failed:',error.message);return {status:503,error:'Nexora AI is temporarily unavailable. Please try again.'};}
 finally{running=false;}
}
