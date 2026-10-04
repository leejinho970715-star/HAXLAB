import { mkdir,readFile,writeFile,copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const origin='https://leejinho970715-star.github.io/HAXLAB';
const dir=resolve('dist/client');await mkdir(dir,{recursive:true});
for(const name of ['index.html','style.css','app.js','core.js','library.js','config.js','typer.js','favicon.svg','anonymous.png','og.png']){if(name==='index.html'){const html=(await readFile('src/index.html','utf8')).replaceAll('__SITE_ORIGIN__',origin);await writeFile(resolve(dir,name),html);}else await copyFile('src/'+name,resolve(dir,name));}
await mkdir(resolve(dir,'icons'),{recursive:true});for(const name of ['virus','wannacry','worm','trojan','defender','clamav'])await copyFile('src/icons/'+name+'.png',resolve(dir,'icons/'+name+'.png'));
await writeFile(resolve(dir,'.nojekyll'),'');await copyFile(resolve(dir,'index.html'),resolve(dir,'404.html'));
await mkdir('dist/server',{recursive:true});await copyFile('src/worker.mjs','dist/server/index.js');
console.log('Built GitHub Pages frontend: dist/client');console.log('Built Worker API: dist/server/index.js');
