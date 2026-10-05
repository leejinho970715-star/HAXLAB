import test from 'node:test';
import assert from 'node:assert/strict';
import { explainReport,reportDocument,projectedScore,removeSavedReport,restoreSavedReports } from '../src/report.js';
import { detectTechnology,projectFiles } from '../src/frameworks.js';
import { codeCoordinate,trackingStep } from '../src/tracking.js';

test('reports explain observed protections, prioritize weaknesses and keep unassessed areas explicit',()=>{
 const r={url:'https://example.com',finalUrl:'https://example.com',status:200,score:60,demo:false,issues:[{id:'csp',severity:'medium',title:'Missing CSP',description:'missing',fix:'set CSP',weight:15},{id:'cookie',severity:'high',title:'Cookie missing Secure',description:'missing',fix:'set Secure',weight:10}]};
 const m=explainReport(r);assert.ok(m.strengths.some(i=>i.title.includes('HTTPS')));assert.ok(!m.strengths.some(i=>i.title.includes('CSP')));assert.equal(m.weaknesses[0].id,'cookie');assert.ok(m.weaknesses[0].impact.includes('HTTP'));assert.ok(m.unknowns.some(i=>i.includes('実際')||i.includes('실제')));
 assert.equal(projectedScore(r,['csp','csp']),75);assert.equal(projectedScore(r,['unrelated']),60);
 const html=reportDocument({...r,url:'<img onerror=evil>',scannedAt:'now',grade:'C'});assert.ok(!html.includes('<img onerror'));assert.ok(html.includes('&lt;img'));
});
test('saved report deletion is precise and does not mutate the original list',()=>{
 const reports=[{id:1},{id:2},{id:3}];assert.deepEqual(removeSavedReport(reports,1),[{id:1},{id:3}]);assert.equal(reports.length,3);assert.deepEqual(removeSavedReport(reports,8),reports);
});
test('undo restores deleted reports without dropping newer scans or duplicating records',()=>{
 const old={url:'https://old.example',scannedAt:'2026-10-04'},fresh={url:'https://new.example',scannedAt:'2026-10-06'};
 assert.deepEqual(restoreSavedReports([fresh],[old,fresh]),[fresh,old]);
});
test('framework detection uses observable markers and does not invent an unavailable server language',()=>{
 assert.equal(detectTechnology('<script src="/_next/static/app.js"></script>').mode,'next');
 assert.equal(detectTechnology('<div data-v-123abcff></div>').mode,'vue');
 assert.equal(detectTechnology('<div data-reactroot></div>').mode,'react');
 assert.equal(detectTechnology('<link href="/wp-content/style.css">').name,'WordPress');
 assert.equal(detectTechnology('<h1>React training</h1>').name,'확인되지 않음');
});
test('tracking starts at eight nonempty lines, parses coordinate text and never evaluates code',()=>{
 assert.equal(trackingStep('hello\n\n\n\n\n\n\n\n').active,false);
 const code='lat=37.5665\nlng=126.9780\n'+Array.from({length:6},(_,i)=>'observe('+i+')').join('\n');
 assert.equal(trackingStep(code).active,true);assert.deepEqual(codeCoordinate(code),{lat:37.5665,lng:126.978});
 assert.deepEqual(codeCoordinate('{"latitude": -33.8, "longitude": 151.2}'),{lat:-33.8,lng:151.2});
 assert.equal(codeCoordinate('lat=91\nlng=0'),null);assert.equal(codeCoordinate('lat=37\nlng=999'),null);
 assert.equal(codeCoordinate('globalThis.sideEffect = true;'),null);assert.equal(globalThis.sideEffect,undefined);
});
test('exported React, Vue and Next projects include their actual entrypoints and build scripts',()=>{
 const versions={react:'19.3.0','react-dom':'19.3.0',vue:'3.5.43'};
 const base={html:'<html><head></head><body><h1>demo</h1></body></html>',css:'body{}',js:'',component:'export default function App(){return null}'};
 for(const [mode,entry]of [['react','src/App.jsx'],['react-ts','src/App.tsx'],['vue','src/App.vue'],['next','app/page.tsx']]){
  const files=projectFiles({...base,mode},versions);assert.equal(files[entry],base.component);assert.ok(JSON.parse(files['package.json']).scripts.build);assert.ok(files['README.md'].includes('原本')||files['README.md'].includes('원본'));
  if(mode==='next')assert.ok(files['app/layout.tsx'].includes('<html'));else assert.ok(files['vite.config.js'].includes('plugins'));
 }
 const vanilla=projectFiles({...base,mode:'vanilla'},versions);assert.ok(vanilla['index.html'].includes('src="script.js"'));
});
