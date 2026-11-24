import assert from 'node:assert/strict';
import {test} from 'node:test';
import {spawn} from 'node:child_process';
import {dirname,join,normalize} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,readdir} from 'node:fs/promises';
import fixture from '../src/fixtures/editions.mjs';
import {checkFixtures,esc,pages,storyPath} from '../src/reader.mjs';
import {getState,matches,prepare} from '../src/assets/explore.mjs';

const hash=value=>createHash('sha256').update(value).digest('hex');

test('build covers all dated editions and stories with no absolute external links',()=>{
  const output=pages(fixture);
  const ordered=checkFixtures(fixture);
  const total=ordered.reduce((n,e)=>n+e.stories.length,0);
  assert.equal(output.size,2+ordered.length+total);
  assert.match(output.get('index.html'),new RegExp(ordered[0].date));
  assert.match(output.get('archive.html'),new RegExp(ordered[1].date));
  for(const [route,html] of output) {
    assert.match(html,/Fictional content only/);
    assert.equal((html.match(/<h1[ >]/g)||[]).length,1);
    for(const [attr,raw] of [...html.matchAll(/\b(href|src)="([^"]+)"/g)].map(x=>x.slice(1))) {
      assert.ok(!raw.startsWith('/')&&!raw.match(/^(?:https?:|\/\/)/i),`${route} ${attr} ${raw}`);
      const [path,fragment]=raw.split('#');
      if(path) {
        const to=normalize(join(dirname(route),path));
        if(to.startsWith('assets/'))assert.match(to,/^assets\/[a-zA-Z0-9-.]+$/);
        else assert.ok(output.has(to),`${route} -> ${to}`);
      } else if(fragment)assert.ok(html.includes(`id="${fragment}"`),`${route} -> #${fragment}`);
    }
  }
  for(const edition of ordered)for(const s of edition.stories) {
    const page=output.get(storyPath(edition,s));
    for(const text of [s.title,s.summary,s.why,s.action,s.source,...s.paragraphs])assert.ok(page.includes(esc(text)));
  }
});

test('query handles multi-term Unicode search, topics, picks, and invalid URL state',()=>{
  const story=prepare('tools',true,'N2 ရွေးပေးတာ FloW Tool သင်ယူရေး');
  assert.equal(matches(story,'all','flow သင်ယူရေး'),true);
  assert.equal(matches(story,'picks','FLOW'),true);
  assert.equal(matches(story,'tools','missing word'),false);
  assert.equal(matches(story,'myanmar','flow'),false);
  assert.equal(matches(prepare('tools',false,'Flow'),'picks','flow'),false);
  assert.deepEqual(getState('?topic=private&q=test',new Set(['all','tools'])),{topic:'all',query:'test'});
  assert.equal(getState('?q='+'x'.repeat(121),new Set()).query.length,120);
});

test('fixture validation and rendering reject broken routes and never emit injected markup',()=>{
  const copy=structuredClone(fixture);
  copy[0].stories[0].title='Two & two <script src="test"></script>';
  const result=pages(copy);
  assert.match(result.get('index.html'),/Two &amp; two &lt;script/);
  assert.doesNotMatch(result.get('index.html'),/<script src="test">/);
  copy[0].stories[0].id='../bad';
  assert.throws(()=>pages(copy),/Bad, duplicate/);
  assert.throws(()=>pages([fixture[0],fixture[0]]),/duplicate edition date/);
});

async function fileDigests(path,base=path) {
  const output={};
  for(const entry of await readdir(path,{withFileTypes:true})) {
    const full=join(path,entry.name);
    if(entry.isDirectory())Object.assign(output,await fileDigests(full,base));
    else output[full.slice(base.length+1)]=hash(await readFile(full));
  }
  return output;
}
test('build is deterministic and local preview serves real pages but accepts no writes',async t=>{
  execFileSync(process.execPath,['scripts/build.mjs']);
  const first=await fileDigests('dist');
  execFileSync(process.execPath,['scripts/build.mjs']);
  assert.deepEqual(await fileDigests('dist'),first);
  const server=spawn(process.execPath,['scripts/preview.mjs','--port','0'],{stdio:['ignore','pipe','inherit']});
  t.after(()=>server.kill());
  const url=await new Promise((ok,fail)=>{
    const timer=setTimeout(()=>fail(Error('Demo did not start.')),4000);
    server.once('error',err=>{clearTimeout(timer);fail(err)});
    server.stdout.once('data',data=>{clearTimeout(timer);ok(String(data).match(/http:\/\/[^ ]+?\/\s*$/)?.[0].trim())});
  });
  const home=await fetch(url);
  assert.equal(home.status,200);
  assert.match(await home.text(),/Portfolio Demo/);
  assert.equal((await fetch(url+'assets/explore.mjs')).headers.get('Content-Type'),'text/javascript; charset=utf-8');
  assert.equal((await fetch(url+storyPath(fixture[0],fixture[0].stories[0]))).status,200);
  assert.equal((await fetch(url+'api/editions',{method:'PUT'})).status,405);
  assert.equal((await fetch(url+'%2e%2e/src/fixtures/editions.mjs')).status,404);
});
