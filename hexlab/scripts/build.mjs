import { mkdir,readFile,writeFile,copyFile,readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
const isVercel=process.env.VERCEL==='1';
const origin=(process.env.SITE_ORIGIN||(isVercel?'https://'+(process.env.VERCEL_PROJECT_PRODUCTION_URL||'haxlab-ten.vercel.app'):'https://leejinho970715-star.github.io/HAXLAB')).replace(/\/$/,'');
const moduleNames=['app.js','core.js','library.js','config.js','typer.js','intro.js','bgm.js','soundtracks.js','report.js','immersive.js','frameworks.js','tracking.js','welcome.js','spider.js','geo-views.js','library-code.js'];
const sourceFiles=await Promise.all([...moduleNames,'style.css','index.html'].map(name=>readFile('src/'+name,'utf8')));
const version=createHash('sha256').update(sourceFiles.join('\n')).digest('hex').slice(0,12);
const dir=resolve('dist/client');await mkdir(dir,{recursive:true});
for(const name of ['index.html','style.css',...moduleNames,'favicon.svg','anonymous.png','og.png']){
 if(name==='index.html'){
  let html=(await readFile('src/index.html','utf8')).replaceAll('__SITE_ORIGIN__',origin).replaceAll('./app.js','./app.js?v='+version).replaceAll('./style.css','./style.css?v='+version);
  if(isVercel)html=html.replace('<head>','<head>\n  <base href="/">');
  await writeFile(resolve(dir,name),html);
 }else if(moduleNames.includes(name)){
  const source=name==='config.js'&&isVercel?"export const API_BASE = '';\n":await readFile('src/'+name,'utf8');
  await writeFile(resolve(dir,name),source.replace(/from '(\.\/[^']+\.js)'/g,(_,path)=>`from '${path}?v=${version}'`));
 }else await copyFile('src/'+name,resolve(dir,name));
}
await mkdir(resolve(dir,'icons'),{recursive:true});for(const name of ['virus','wannacry','worm','trojan','defender','clamav'])await copyFile('src/icons/'+name+'.png',resolve(dir,'icons/'+name+'.png'));
await mkdir(resolve(dir,'audio'),{recursive:true});
for(const name of ['intro','scan','web','bio','code'])await copyFile('src/audio/'+name+'.wav',resolve(dir,'audio/'+name+'.wav'));
for(const folder of ['fonts','vendor','sections','maps']){
 await mkdir(resolve(dir,folder),{recursive:true});
 const names=folder==='fonts'?['PretendardVariable.woff2','ShareTechMono-Regular.ttf','Orbitron-Regular.ttf','Orbitron-Bold.ttf','Pretendard-LICENSE.txt','ShareTechMono-LICENSE.txt','Orbitron-LICENSE.txt']:folder==='sections'?['scan-core.png','web-workspace.png','defense-core.png','code-terminal.png','finale-operations-room.png']:await readdir('src/'+folder);
 for(const name of names)await copyFile('src/'+folder+'/'+name,resolve(dir,folder,name));
}
await writeFile(resolve(dir,'.nojekyll'),'');await copyFile(resolve(dir,'index.html'),resolve(dir,'404.html'));
await mkdir('dist/server',{recursive:true});await copyFile('src/worker.mjs','dist/server/index.js');
console.log('Built '+(isVercel?'Vercel':'GitHub Pages')+' frontend: dist/client');console.log('Built Worker API: dist/server/index.js');
