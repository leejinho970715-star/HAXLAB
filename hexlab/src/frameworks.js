export const PROJECT_MODES={vanilla:{name:'HTML / CSS / JavaScript',file:'index.html'},react:{name:'React · JSX',file:'src/App.jsx'},'react-ts':{name:'React · TypeScript',file:'src/App.tsx'},vue:{name:'Vue · SFC',file:'src/App.vue'},next:{name:'Next.js · TSX',file:'app/page.tsx'}};
export function detectTechnology(html){
 const patterns=[['next','Next.js / React',/__NEXT_DATA__|\/_next\/|self\.__next_f/,'Next.js 문서·번들 경로'],['vue','Nuxt / Vue',/__NUXT__|\/_nuxt\//,'Nuxt 문서·번들 경로'],['vue','Vue',/data-v-[a-f0-9]{6,}|vue(?:\.global|\.runtime|\.min)\.js/i,'Vue 스타일 또는 런타임 흔적'],['react','React',/data-reactroot|data-reactid|react-dom(?:\.production)?|react(?:\.production)?\.min\.js/i,'React 마커 또는 런타임 경로'],['vanilla','WordPress',/wp-content\/|wp-includes\//,'WordPress 자산 경로 · PHP 원본 소스는 공개 응답으로 확인 불가'],['vanilla','Angular',/ng-version=|ng-server-context=|_ngcontent-/,'Angular 문서 마커'],['vanilla','Svelte / SvelteKit',/__sveltekit|svelte-[a-z0-9]{5,}/,'Svelte 문서·스타일 마커']];
 const match=patterns.find(([, ,pattern])=>pattern.test(html));
 return match?{mode:match[0],name:match[1],evidence:match[3],confidence:'문서 흔적 기반 추정'}:{mode:'vanilla',name:'확인되지 않음',evidence:'공개 HTML에 식별 가능한 프레임워크 흔적 없음',confidence:'기술 확인 불가'};
}
export function projectTabs(project){return project.mode&&project.mode!=='vanilla'?[{key:'component',label:project.mode==='vue'?'APP.VUE':project.mode==='react'?'APP.JSX':'APP.TSX'},{key:'css',label:'CSS'}]:[{key:'html',label:'HTML'},{key:'css',label:'CSS'},{key:'js',label:'JS'}];}
function parts(html){const doc=new DOMParser().parseFromString(html,'text/html');return{body:doc.body.innerHTML,styles:[...doc.querySelectorAll('style')].map(s=>s.textContent).join('\n')};}
function toJSX(html,typed=false){
 const doc=new DOMParser().parseFromString(html,'text/html');
 const names={class:'className',for:'htmlFor',tabindex:'tabIndex',readonly:'readOnly',maxlength:'maxLength',colspan:'colSpan',rowspan:'rowSpan',autocomplete:'autoComplete',autofocus:'autoFocus',srcset:'srcSet',contenteditable:'contentEditable',viewbox:'viewBox','fill-rule':'fillRule','clip-rule':'clipRule','stroke-width':'strokeWidth','stroke-linecap':'strokeLinecap','stroke-linejoin':'strokeLinejoin','xlink:href':'xlinkHref','xmlns:xlink':'xmlnsXlink','xml:space':'xmlSpace','xml:lang':'xmlLang'};
 const node=n=>{
  if(n.nodeType===3)return n.textContent.trim()?'{'+JSON.stringify(n.textContent)+'}':'';
  if(n.nodeType!==1)return'';
  const tag=n.localName;
  const attrs=[...n.attributes].filter(a=>!/^on/i.test(a.name)).map(a=>{
   if(a.name==='style'){const styles={};for(const key of n.style)styles[key.startsWith('--')?key:key.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=n.style.getPropertyValue(key);return 'style={'+JSON.stringify(styles)+(typed?' as React.CSSProperties':'')+'}';}
   if(['disabled','checked','selected','multiple','required','readonly','autofocus','hidden','open','controls','loop','muted','novalidate'].includes(a.name))return (names[a.name]||a.name)+'={true}';
   return (names[a.name]||a.name)+'={'+JSON.stringify(a.value)+'}';
  }).join(' ');
  const children=[...n.childNodes].map(node).join('');
  return '<'+tag+(attrs?' '+attrs:'')+(children?'>'+children+'</'+tag+'>':' />');
 };
 return [...doc.body.childNodes].map(node).join('\n');
}
export function convertProject(project,mode){
 if(!PROJECT_MODES[mode])throw Error('지원하지 않는 프로젝트 형식입니다.');
 const previous=project.mode||'vanilla';
 const variants={...project.variants,[previous]:{component:project.component,css:project.css,js:project.js}};
 const p={...project,mode,variants,js:mode==='vanilla'?project.js:''};
 if(variants[mode])return {...p,...variants[mode]};
 if(mode==='vanilla')return p;
 const {body,styles}=parts(project.html);p.css=project.css+'\n'+styles;
 if(mode==='vue')p.component=`<template>\n  <section v-pre>\n${body}\n  </section>\n  <aside class="lab-customizer">\n    <h2>{{ headline }}</h2>\n    <button @click="count++">클릭 체험 {{ count }}</button>\n  </aside>\n</template>\n\n<script>\nexport default {\n  data() {\n    return { headline: '나만의 Vue 페이지', count: 0 };\n  }\n};\n</script>\n`;
 else p.component=`${mode==='next'?"'use client';\n":''}import React, { useState } from 'react';\n\nexport default function ${mode==='next'?'Page':'App'}() {\n  const [count, setCount] = useState${mode==='react'?'':'<number>'}(0);\n  return (\n    <>\n${toJSX(project.html,mode!=='react')}\n      <aside className="lab-customizer">\n        <h2>나만의 ${mode==='next'?'Next.js':'React'} 페이지</h2>\n        <button onClick={() => setCount(count + 1)}>클릭 체험 {count}</button>\n      </aside>\n    </>\n  );\n}\n`;
 p.css+='\n.lab-customizer { padding: 24px; margin: 20px; border: 1px solid #38f899; border-radius: 10px; background: #081c13; color: #b4e2cc; }\n.lab-customizer button { cursor: pointer; background: #38f899; color: #031209; padding: 12px; border: 0; border-radius: 10px; }';
 return p;
}
const scripts=new Map(),runtime=new Map();
export function ensureVendor(name){
 if(!scripts.has(name))scripts.set(name,new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('./vendor/'+name,import.meta.url).href;script.onload=resolve;script.onerror=()=>{scripts.delete(name);reject(Error('컴파일 도구를 불러오지 못했습니다. 다시 적용하세요.'));};document.head.append(script);}));
 return scripts.get(name);
}
async function runtimeText(name){if(!runtime.has(name))runtime.set(name,fetch(new URL('./vendor/'+name,import.meta.url)).then(r=>{if(!r.ok)throw Error('실습 런타임을 불러오지 못했습니다.');return r.text();}).catch(e=>{runtime.delete(name);throw e;}));return runtime.get(name);}
const safeScript=value=>value.replace(/<\/script/gi,'<\\/script');
export async function frameworkDocument(project){
 await ensureVendor('babel.min.js');
 const isVue=project.mode==='vue';let code=project.component,template='',sfcCSS='';
 if(isVue){
  const templateMatch=code.match(/<template\b[^>]*>([\s\S]*)<\/template>/i),scriptMatch=code.match(/<script\b([^>]*)>([\s\S]*?)<\/script>/i);
  if(!templateMatch||!scriptMatch)throw Error('App.vue에 <template>과 <script>를 작성하세요.');
  if(/\bsetup\b/.test(scriptMatch[1]))throw Error('이 미리보기에서는 Options API <script>를 사용하세요. script setup은 내보낸 프로젝트에서 실행할 수 있습니다.');
  template=templateMatch[1];code=scriptMatch[2];sfcCSS=[...project.component.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n');
 }
 const filename=isVue?'App.ts':project.mode==='react'?'App.jsx':'App.tsx';
 const compiled=window.Babel.transform(code,{filename,presets:[['react',{runtime:'classic'}],['typescript',{allExtensions:true,isTSX:!isVue}]],plugins:['transform-modules-commonjs']}).code;
 const vendor=await runtimeText(isVue?'vue-runtime.min.js':'react-runtime.min.js');
 const csp="default-src 'none'; script-src 'unsafe-inline' "+(isVue?"'unsafe-eval' ":'')+"; style-src 'unsafe-inline'; img-src data: https:; font-src data: https:; connect-src 'none'; form-action 'none'; base-uri 'none';";
 const bridge=`window.addEventListener('error',e=>{parent.postMessage({type:'hexlab-error',message:String(e.message).slice(0,240)},'*');const box=document.createElement('pre');box.style.cssText='padding:20px;background:#30130f;color:#ffb4a4;white-space:pre-wrap';box.textContent='미리보기 오류: '+e.message;document.body.append(box);});document.addEventListener('submit',e=>e.preventDefault());document.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault();});`;
 const execution=`const module={exports:{}};const exports=module.exports;function require(id){if(id==='react')return React;if(id==='react-dom/client')return ReactDOM;if(id==='vue')return Vue;throw Error('미리보기에서 지원하지 않는 import: '+id+' · 프로젝트를 내보내 설치하세요.');}\n${compiled}\nconst RootComponent=module.exports.default;if(!RootComponent)throw Error('컴포넌트를 export default로 내보내세요.');\n`+(isVue?`RootComponent.template=${JSON.stringify(template)};Vue.createApp(RootComponent).mount('#root');`:`ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(RootComponent));`);
 return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="referrer" content="no-referrer"><style>${(project.css+'\n'+sfcCSS).replace(/<\/style/gi,'<\\/style')}</style></head><body><div id="root"></div><script>${safeScript(bridge)}<\/script><script>${safeScript(vendor)}<\/script><script>${safeScript('(function(){'+execution+'\n})();')}<\/script></body></html>`;
}
export function projectFiles(project,versions){
 const mode=project.mode||'vanilla',files={};
 files['README.md']='# HEXLAB 재구성 프로젝트\n\n공개 페이지를 바탕으로 새로 구성한 실습 프로젝트입니다. 원본 서버·소스·인증 기능은 포함하지 않습니다.\n\n'+(mode==='vanilla'?'index.html을 로컬 정적 서버에서 여세요.':'npm install\nnpm run dev\n\nNext.js의 서버 기능은 로컬 Next.js 개발 서버에서 실행하세요.');
 if(mode==='vanilla'){
  files['index.html']=project.html.replace(/<\/head>/i,'<link rel="stylesheet" href="style.css"></head>').replace(/<\/body>/i,'<script src="script.js"></script></body>');files['style.css']=project.css;files['script.js']=project.js;
 }else if(mode==='next'){
  files['package.json']=JSON.stringify({name:'hexlab-next-project',private:true,scripts:{dev:'next dev',build:'next build',start:'next start'},dependencies:{next:'^16.0.0',react:versions.react,'react-dom':versions['react-dom']},devDependencies:{typescript:'^5.9.0','@types/react':'^19.0.0','@types/node':'^22.0.0'}},null,2);
  files['app/page.tsx']=project.component;files['app/globals.css']=project.css;files['app/layout.tsx']="import './globals.css';\nimport type { ReactNode } from 'react';\nexport default function RootLayout({children}: {children: ReactNode}) {return <html lang=\"ko\"><body>{children}</body></html>;}\n";
  files['next-env.d.ts']='/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n';
 }else{
  const vue=mode==='vue',ts=mode==='react-ts';
  files['package.json']=JSON.stringify({name:'hexlab-'+mode+'-project',private:true,type:'module',scripts:{dev:'vite',build:'vite build',preview:'vite preview'},dependencies:vue?{vue:versions.vue}:{react:versions.react,'react-dom':versions['react-dom']},devDependencies:{vite:'^7.0.0',...(vue?{'@vitejs/plugin-vue':'^6.0.0'}:{'@vitejs/plugin-react':'^5.0.0'}),...(ts?{typescript:'^5.9.0'}:{})}},null,2);
  const extension=vue?'vue':ts?'tsx':'jsx';files['src/App.'+extension]=project.component;files['src/style.css']=project.css;
  files['src/main.'+(ts?'tsx':'js')]=vue?"import { createApp } from 'vue';\nimport App from './App.vue';\nimport './style.css';\ncreateApp(App).mount('#root');":"import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App."+extension+"';\nimport './style.css';\ncreateRoot(document.getElementById('root')"+(ts?'!':'')+").render(React.createElement(App));";
  files['index.html']='<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><div id="root"></div><script type="module" src="/src/main.'+(ts?'tsx':'js')+'"></script></body></html>';
  files['vite.config.js']="import { defineConfig } from 'vite';\nimport plugin from '"+(vue?'@vitejs/plugin-vue':'@vitejs/plugin-react')+"';\nexport default defineConfig({plugins:[plugin()]});";
 }
 return files;
}
export async function projectArchive(project){
 await ensureVendor('zip-runtime.min.js');
 const versions=await fetch(new URL('./vendor/framework-versions.json',import.meta.url)).then(r=>r.json());
 return window.HexZip.zipSync(Object.fromEntries(Object.entries(projectFiles(project,versions)).map(([name,text])=>[name,window.HexZip.strToU8(text)])));
}
