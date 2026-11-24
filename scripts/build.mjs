import {cp,mkdir,rm,writeFile} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import editions from '../src/fixtures/editions.mjs';
import {pages} from '../src/reader.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const dist=join(root,'dist');
const generated=pages(editions);
await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
await cp(join(root,'src/assets'),join(dist,'assets'),{recursive:true});
for(const [name,html] of generated) {
  const dest=join(dist,name);
  await mkdir(dirname(dest),{recursive:true});
  await writeFile(dest,html+'\n');
}
console.log(`Built ${generated.size} HTML pages under dist/.`);
