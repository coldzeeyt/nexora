export function desktopPrompt(message:string,initial=''):Promise<string|null>{
 return new Promise(resolve=>{
  const host=document.createElement('div');host.className='eco-dialog-backdrop';
  const form=document.createElement('form');form.className='eco-dialog';form.setAttribute('role','dialog');form.setAttribute('aria-modal','true');form.setAttribute('aria-label',message);
  const label=document.createElement('label');label.textContent=message;
  const input=document.createElement('input');input.value=initial;input.maxLength=1000;input.setAttribute('aria-label',message);label.append(input);
  const buttons=document.createElement('div');buttons.className='v-inline';
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';
  const save=document.createElement('button');save.type='submit';save.className='v-primary';save.textContent='Continue';buttons.append(cancel,save);form.append(label,buttons);host.append(form);
  const previous=document.activeElement as HTMLElement|null;
  function finish(value:string|null){host.remove();previous?.focus();resolve(value);}
  cancel.onclick=()=>finish(null);form.onsubmit=e=>{e.preventDefault();finish(input.value);};host.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();finish(null);}if(e.key==='Tab'){const controls=[input,cancel,save];const index=controls.indexOf(document.activeElement as HTMLInputElement);e.preventDefault();controls[(index+(e.shiftKey?2:1))%3].focus();}};
  (document.querySelector('.velora-desktop')||document.body).append(host);input.focus();input.select();
 });
}
