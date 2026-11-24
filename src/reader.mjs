/** Static Burmese editorial reader. The demo has no back end, state, or network calls. */
const TOPICS={
  all:['အားလုံး',''],picks:['N2 ရွေးပေးတာ','lime'],
  myanmar:['မြန်မာ','terracotta'],japan:['ဂျပန်','mint'],ai:['AI','violet'],tools:['အခမဲ့ Tools','blue'],
  world:['ကမ္ဘာ','sand'],business:['စီးပွားရေး','sand'],film:['ရုပ်ရှင်','violet'],sports:['အားကစား','lime'],
};
const MONTHS=['ဇန်နဝါရီ','ဖေဖော်ဝါရီ','မတ်','ဧပြီ','မေ','ဇွန်','ဇူလိုင်','ဩဂုတ်','စက်တင်ဘာ','အောက်တိုဘာ','နိုဝင်ဘာ','ဒီဇင်ဘာ'];
const esc=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[ch]));
const digits=value=>String(value).replace(/\d/g,x=>'၀၁၂၃၄၅၆၇၈၉'[Number(x)]);
const storyPath=(edition,story)=>`editions/${edition.date}/${story.id}.html`;
const editionPath=edition=>`editions/${edition.date}/index.html`;
const label=topic=>TOPICS[topic][0];
function dateLabel(date) {
  const [y,m,d]=date.split('-').map(Number);
  return `${digits(d)} ${MONTHS[m-1]} ${digits(y)}`;
}
function checkFixtures(editions) {
  const fail=message=>{throw Error(message);};
  if (!Array.isArray(editions)||!editions.length) fail('At least one demo edition is required.');
  const dates=new Set();
  for(const edition of editions) {
    const time=Date.parse(edition.date+'T00:00:00Z');
    if(!/^20\d{2}-\d{2}-\d{2}$/.test(edition.date)||!Number.isFinite(time)||
       new Date(time).toISOString().slice(0,10)!==edition.date||dates.has(edition.date))fail('Bad or duplicate edition date.');
    dates.add(edition.date);
    if(!Array.isArray(edition.stories)||!edition.stories.length||!edition.brief?.length)fail('Empty demo edition.');
    const ids=new Set();
    for(const story of edition.stories) {
      if(!/^[a-z0-9-]{1,50}$/.test(story.id)||ids.has(story.id)||story.id==='index')fail('Bad, duplicate, or reserved story ID.');
      ids.add(story.id);
      if(!Object.hasOwn(TOPICS,story.topic)||['all','picks'].includes(story.topic))fail('Unknown topic.');
      for(const key of ['title','summary','why','action','source'])if(typeof story[key]!=='string'||!story[key].trim())fail('Missing story field.');
      if(!Array.isArray(story.paragraphs)||!story.paragraphs.length||story.paragraphs.some(x=>typeof x!=='string'||!x.trim()))fail('Missing story body.');
      if(!story.source.includes('(စိတ်ကူးယဉ်)'))fail('Demo sources must be explicitly fictional.');
    }
  }
  return [...editions].sort((a,b)=>b.date.localeCompare(a.date));
}
function badge(story) {
  return `<span class="topic-badge" data-color="${TOPICS[story.topic][1]}">${label(story.topic)}</span>${story.pick?`<span class="topic-badge pick-badge">N2 ရွေးပေးတာ</span>`:''}`;
}
function shell(title,desc,rel,body,{active='',search=false}={}) {
  return `<!doctype html>
<html lang="my"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#f8faf7"><meta name="referrer" content="no-referrer">
<link rel="icon" href="${rel}assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="${rel}assets/noto-sans-myanmar.woff2" as="font" crossorigin type="font/woff2">
<link rel="stylesheet" href="${rel}assets/styles.css"><link rel="stylesheet" href="${rel}assets/demo.css">
${search?`<script type="module" src="${rel}assets/explore.mjs"></script>`:''}
</head><body>
<a class="skip" href="#main">အကြောင်းအရာသို့</a>
<header class="masthead"><div class="masthead-inner wrap">
<a class="brand" href="${rel}index.html" aria-label="N2 သတင်းစဉ် ပင်မစာမျက်နှာ"><span class="monogram" aria-hidden="true">N2</span><span class="brand-text">သတင်းစဉ် <small>THE BRIEFING</small></span></a>
<span class="edition-note">Portfolio Demo</span>
</div></header>
<nav class="edition-nav wrap" aria-label="စာစောင်လမ်းညွှန်"><a href="${rel}index.html"${active==='home'?' aria-current="page"':''}>နောက်ဆုံးစာစောင်</a><a href="${rel}archive.html"${active==='archive'?' aria-current="page"':''}>စာစောင်ဟောင်းများ</a></nav>
${body}
<footer class="site-footer"><div class="wrap"><span class="footer-logo">N2 သတင်းစဉ်</span><span>စိတ်ကူးယဉ် သရုပ်ပြစာစောင် · Fictional content only</span></div></footer></body></html>`;
}
const fictionalNote=`<p class="demo-notice wrap"><strong>စိတ်ကူးယဉ် သရုပ်ပြ</strong> ဒီစာစောင်က တကယ့်သတင်း မဟုတ်ပါ။ လူ၊ အဖွဲ့၊ နေရာနဲ့ အဖြစ်အပျက်တွေကို demo အတွက် ဖန်တီးထားပါတယ်။</p>`;
const time=edition=>`<time datetime="${edition.date}">${dateLabel(edition.date)}</time>`;
const paragraphs=parts=>parts.map(x=>`<p>${esc(x)}</p>`).join('');
function storyCard(edition,story,rel,{date=false}={}) {
  const terms=[story.title,story.summary,story.why,story.action,label(story.topic),story.source,...story.paragraphs,story.pick?'N2 ရွေးပေးတာ':''].join(' ');
  return `<li class="card" data-story data-topic="${story.topic}" data-pick="${Boolean(story.pick)}" data-search="${esc(terms)}"><div class="card-top"><div class="topic-badges">${badge(story)}</div>${date?`<span class="card-date">${time(edition)}</span>`:''}</div><h3><a href="${rel+storyPath(edition,story)}">${esc(story.title)}</a></h3><p class="card-summary">${esc(story.summary)}</p><span class="read-cue" aria-hidden="true">ဆက်ဖတ်ရန်</span></li>`;
}
const SEARCH_ICON='<svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.5 15.5 4 4"/></svg>';
function controls(stories,title) {
  const active=new Set(['all',...stories.map(s=>s.topic)]);
  if(stories.some(s=>s.pick))active.add('picks');
  const buttons=Object.entries(TOPICS).filter(([key])=>active.has(key)).map(([key,[tag]])=>`<button type="button" class="topic-filter" data-filter="${key}" aria-pressed="${key==='all'}">${tag}</button>`).join('');
  return `<div class="explore-top"><div><h2 id="stories-title">${title}</h2><p class="result-line" id="status" role="status" aria-live="polite">သတင်း ${digits(stories.length)} ပုဒ်</p></div><div class="explore-controls" hidden><label class="search-box" for="search">${SEARCH_ICON}<span class="sr-only">သတင်း ရှာဖွေရန်</span><input type="search" id="search" placeholder="သတင်း ရှာဖွေရန်" autocomplete="off" enterkeyhint="search" maxlength="120"></label></div></div><div class="filters" aria-label="သတင်းအမျိုးအစား" hidden>${buttons}</div>`;
}
function explorer(items,rel,{heading='သတင်းအားလုံး',archive=false}={}) {
  return `<section class="explore" id="stories" aria-labelledby="stories-title">${controls(items.map(x=>x.story),heading)}<ul class="story-grid">${items.map(({edition,story})=>storyCard(edition,story,rel,{date:archive})).join('')}</ul><div class="empty" id="empty" hidden><h3>ကိုက်ညီတဲ့ သတင်း မတွေ့ပါ။</h3><p>တခြားစကားလုံး သို့မဟုတ် အမျိုးအစား ရွေးကြည့်ပါ။</p><button type="button" id="reset">ရှာဖွေမှု ရှင်းရန်</button></div></section>`;
}
function editionPage(edition,rel,{home=false}={}) {
  const brief=edition.brief.map(note=>`<li><span class="brief-mark" aria-hidden="true"></span>${esc(note)}</li>`).join('');
  const feature=edition.stories.find(s=>s.pick)||edition.stories[0];
  const body=`${fictionalNote}<main id="main" class="wrap">
  <section class="cover" aria-labelledby="cover-title">
    <div class="cover-main"><div class="cover-meta">${time(edition)}<span aria-hidden="true">·</span><span>သတင်း ${digits(edition.stories.length)} ပုဒ်</span></div><h1 id="cover-title">N2 သတင်းအစုံ</h1>
    <p class="cover-deck">သတင်း၊ အနှစ်ချုပ်နဲ့ လက်တွေ့အသုံးချစရာတွေကို တစ်နေရာတည်းမှာ ဖတ်ပါ။</p><a class="cover-cta" href="#stories">သတင်းအားလုံး ဖတ်ရန်</a></div>
    <aside class="cover-brief" aria-labelledby="brief-title"><p class="brief-en">THE SHORT LIST</p><h2 id="brief-title">အဓိကဖတ်စရာ ${digits(edition.brief.length)} ခု</h2><ul>${brief}</ul></aside>
  </section>
  <section class="lead" aria-labelledby="lead-title"><div class="lead-mark" aria-hidden="true"><div class="lead-pattern"><div class="line-grid"></div><span>N2</span><div class="lead-disc"></div></div></div><div class="lead-body"><p class="section-kicker">အထူးဖတ်စရာ</p>${badge(feature)}<h2 id="lead-title"><a href="${rel+storyPath(edition,feature)}">${esc(feature.title)}</a></h2><p>${esc(feature.summary)}</p><a class="text-link" href="${rel+storyPath(edition,feature)}">အသေးစိတ် ဖတ်ရန်</a></div></section>
  ${explorer(edition.stories.map(story=>({edition,story})),rel)}
</main>`;
  return shell('N2 သတင်းစဉ် | Fictional demo','A Burmese editorial reader with fictional demo editions.',rel,body,{active:home?'home':'',search:true});
}
function archivePage(editions) {
  const list=editions.map(edition=>`<li><a href="${editionPath(edition)}"><strong>${time(edition)}</strong><span>သတင်း ${digits(edition.stories.length)} ပုဒ်</span></a></li>`).join('');
  const stories=editions.flatMap(edition=>edition.stories.map(story=>({edition,story})));
  const body=`${fictionalNote}<main id="main" class="wrap"><header class="article-head archive-header"><p class="section-kicker">N2 သတင်းစဉ်</p><h1>စာစောင်ဟောင်းများ</h1><p>ရက်စွဲအလိုက် ဖတ်ပါ သို့မဟုတ် စာစောင်အားလုံးထဲက သတင်းတစ်ပုဒ် ရှာပါ။</p></header><ul class="archive-list">${list}</ul>${explorer(stories,'',{heading:'စာစောင်အားလုံးထဲက သတင်းများ',archive:true})}</main>`;
  return shell('စာစောင်ဟောင်းများ | N2 Demo','Read and search every fictional N2 edition.','',body,{active:'archive',search:true});
}
function articlePage(edition,story) {
  const index=edition.stories.indexOf(story);
  const panels=[['အနှစ်ချုပ်',story.summary],['ဘာကြောင့် သိသင့်လဲ',story.why],['ဘာလုပ်ထားသင့်လဲ',story.action]].map(([h,v],i)=>`<section class="detail-panel" aria-labelledby="panel-${i}"><h2 id="panel-${i}">${h}</h2><p>${esc(v)}</p></section>`).join('');
  const nav=[[-1,'အရင်သတင်း'],[1,'နောက်သတင်း']].flatMap(([step,txt])=>edition.stories[index+step]?
    [`<a href="${edition.stories[index+step].id}.html"><span>${txt}</span><strong>${esc(edition.stories[index+step].title)}</strong></a>`]:[]).join('');
  const body=`${fictionalNote}<main id="main" class="article-wrap wrap"><nav class="crumb" aria-label="တည်နေရာ"><a href="index.html#stories">စာစောင်သို့ ပြန်သွားရန်</a><span aria-hidden="true">/</span><span>${label(story.topic)}</span></nav><article><header class="article-head"><div class="article-meta">${badge(story)}${time(edition)}</div><h1>${esc(story.title)}</h1><p class="article-edition">နမူနာစာစောင် · ${digits(index+1)}/${digits(edition.stories.length)}</p></header>
  <div class="article-content"><div class="story-body">${paragraphs(story.paragraphs)}</div>${panels}<section class="sources demo-source" aria-labelledby="source-info"><h2 id="source-info">ရင်းမြစ် နမူနာ</h2><p>${esc(story.source)}</p><p class="source-note">တကယ့်ထုတ်ဝေမှု မဟုတ်လို့ ပြင်ပလင့်ခ် မပါပါ။</p></section></div></article>${nav?`<nav class="story-nav" aria-label="အခြားသတင်းများ">${nav}</nav>`:''}</main>`;
  return shell(story.title+' | N2 Demo',story.summary,'../../',body);
}
function pages(input) {
  const editions=checkFixtures(input);
  const out=new Map([['index.html',editionPage(editions[0],'',{home:true})],['archive.html',archivePage(editions)]]);
  for(const edition of editions) {
    out.set(editionPath(edition),editionPage(edition,'../../'));
    for(const story of edition.stories)out.set(storyPath(edition,story),articlePage(edition,story));
  }
  return out;
}

export {checkFixtures,esc,pages,storyPath};
