const normalize=value=>value.normalize('NFKC').toLowerCase().trim();
const digits=value=>String(value).replace(/\d/g,x=>'၀၁၂၃၄၅၆၇၈၉'[Number(x)]);
const prepare=(topic,pick,text)=>({topic,pick,text:normalize(text)});
function matches(row,topic,query) {
  if(topic==='picks'&&!row.pick)return false;
  if(topic!=='all'&&topic!=='picks'&&topic!==row.topic)return false;
  return normalize(query).split(/\s+/).filter(Boolean).every(part=>row.text.includes(part));
}
function getState(search,validTopics) {
  const params=new URLSearchParams(search);
  const topic=params.get('topic');
  return {topic:validTopics.has(topic)?topic:'all',query:(params.get('q')||'').slice(0,120)};
}
function install(document,window) {
  const input=document.querySelector('#search');
  const filters=document.querySelector('.filters');
  if(!input||!filters)return;
  const controls=document.querySelector('.explore-controls');
  const status=document.querySelector('#status');
  const empty=document.querySelector('#empty');
  const reset=document.querySelector('#reset');
  const buttons=Array.from(filters.querySelectorAll('button[data-filter]'));
  const validTopics=new Set(buttons.map(b=>b.dataset.filter));
  const rows=Array.from(document.querySelectorAll('[data-story]'),item=>({
    item, ...prepare(item.dataset.topic,item.dataset.pick==='true',item.dataset.search),
  }));
  let topic='all';
  function load() {
    const current=getState(window.location.search,validTopics);
    topic=current.topic;
    input.value=current.query;
  }
  function render(updateURL=true) {
    let visible=0;
    for(const row of rows) {
      const show=matches(row,topic,input.value);
      row.item.hidden=!show;
      if(show)visible++;
    }
    for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.filter===topic));
    status.textContent=visible?`သတင်း ${digits(visible)} ပုဒ်`:'သတင်း မတွေ့ပါ';
    empty.hidden=visible>0;
    if(updateURL) {
      const url=new URL(window.location.href);
      if(topic==='all')url.searchParams.delete('topic'); else url.searchParams.set('topic',topic);
      const q=input.value.trim().slice(0,120);
      if(q)url.searchParams.set('q',q); else url.searchParams.delete('q');
      try {window.history.replaceState(null,'',url);} catch {/* Read-only file preview. */}
    }
  }
  for(const button of buttons)button.addEventListener('click',()=>{topic=button.dataset.filter; render();});
  input.addEventListener('input',()=>render());
  reset.addEventListener('click',()=>{input.value='';topic='all';render();input.focus();});
  window.addEventListener('popstate',()=>{load();render(false);});
  load(); controls.hidden=false;filters.hidden=false;render(false);
}
if(typeof document!=='undefined')install(document,window);
export {matches,prepare,getState,install};
