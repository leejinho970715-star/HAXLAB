const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const severityOrder={critical:0,high:1,medium:2,low:3,info:4};
const impacts={
 https:'로그인 정보나 페이지 내용이 이동 중 노출·변조될 가능성을 높입니다.',
 csp:'다른 원인으로 스크립트 삽입이 발생했을 때 피해를 제한하는 방어층이 부족합니다.',
 frame:'다른 사이트가 이 화면을 프레임에 넣을 때, 사용자를 속이는 클릭 유도에 대응하는 방어층이 부족합니다.',
 cookie:'해당 쿠키가 HTTP 요청에 포함될 수 있습니다. 인증 쿠키인지 추가 확인이 필요합니다.',
 hsts:'사용자가 HTTP 주소로 접속하는 상황에서 HTTPS 강제를 브라우저가 기억하지 못합니다.',
 nosniff:'브라우저가 응답 형식을 추측하는 동작에 대한 방어 설정이 부족합니다.',
 referrer:'외부 링크로 이동할 때 어느 수준의 URL 정보가 전달되는지 정책이 명확하지 않습니다.',
 disclosure:'공개된 런타임 정보가 공격자의 기술 파악에 단서가 될 수 있습니다.'
};
export function explainReport(report){
 const issues=Array.isArray(report.issues)?report.issues:[];
 const strengths=[];
 if(String(report.finalUrl||report.url).startsWith('https:'))strengths.push({title:'HTTPS로 연결됩니다',detail:'브라우저와 사이트 사이에 전송되는 데이터를 TLS로 암호화합니다.',evidence:'최종 URL의 HTTPS 프로토콜',scope:'전송 구간'});
 if(Number(report.status)>=200&&Number(report.status)<300)strengths.push({title:'공개 페이지가 정상 응답합니다',detail:'분석 요청에 성공 상태로 응답해 점검할 수 있었습니다. 서비스 전체의 가용성을 보증하는 결과는 아닙니다.',evidence:'HTTP '+report.status,scope:'응답 상태'});
 if(!report.demo){
  const protections=[['csp','콘텐츠 출처를 제한하는 CSP가 관측됐습니다','허용한 출처를 기준으로 브라우저의 콘텐츠 로드를 제한하는 방어층입니다.'],['frame','프레임 삽입 방어가 관측됐습니다','X-Frame-Options 또는 CSP frame-ancestors 설정이 관측됐습니다.'],['nosniff','응답 형식 추측 방지가 설정돼 있습니다','X-Content-Type-Options: nosniff가 관측됐습니다.'],['hsts','HTTPS 강제 정책이 관측됐습니다','브라우저가 HTTPS 연결을 사용하도록 하는 HSTS 헤더가 관측됐습니다.'],['referrer','출처 정보 전달 정책이 명시돼 있습니다','Referrer-Policy 헤더가 관측됐습니다. 정책의 구체적인 강도는 별도 확인이 필요합니다.']];
  for(const [id,title,detail]of protections)if(!issues.some(i=>i.id===id)&&(id!=='hsts'||String(report.finalUrl||report.url).startsWith('https:')))strengths.push({title,detail,evidence:'공개 응답 헤더 점검 결과',scope:'브라우저 방어 설정'});
 }
 const weaknesses=issues.map(i=>({...i,impact:impacts[i.id]||i.description,priority:['critical','high'].includes(i.severity)?'우선 조치':i.severity==='medium'?'다음 배포에서 개선':'설정 검토'})).sort((a,b)=>(severityOrder[a.severity]??5)-(severityOrder[b.severity]??5));
 const unknowns=['로그인·권한 검사와 서버 내부 코드','데이터베이스·비밀 키 관리와 원본 소스','실제 공격 성공 여부와 전체 서비스 가용성'];
 return {strengths,weaknesses,unknowns,verdict:issues.length?`${strengths.length}가지 확인된 장점이 있지만 ${issues.length}개 보완 항목이 있습니다. ${weaknesses[0]?.priority} 항목부터 확인하세요.`:'점검한 공개 응답에서 보완 항목이 발견되지 않았습니다. 서버 내부와 인증 흐름도 추가 점검하세요.'};
}
export function projectedScore(report,fixedIds){
 const weights={https:25,csp:15,frame:10,nosniff:10,hsts:10,referrer:5,cookie:10,disclosure:3};
 const fixed=new Set(fixedIds);
 return Math.min(100,report.score+(report.issues||[]).filter(i=>fixed.has(i.id)).reduce((sum,i)=>sum+(Number.isFinite(i.weight)?i.weight:weights[i.id]||0),0));
}
export function reportStory(report,full=false){
 const m=explainReport(report);
 const cards=list=>list.map(i=>`<article><span>${esc(i.scope||i.priority)}</span><h3>${esc(i.title)}</h3><p>${esc(i.detail||i.impact)}</p>${full?`<small>${esc(i.evidence)}</small>${i.fix?`<p class="report-fix">개선: ${esc(i.fix)}</p>`:''}`:''}</article>`).join('');
 return `<section class="report-story"><div class="report-verdict"><span>// WHAT THIS MEANS FOR YOU</span><h2>보안 상태를 한눈에 읽으세요.</h2><p>${esc(m.verdict)}</p><small>${report.demo?'샘플 데이터 기반 설명':'공개 HTTP 응답에 근거한 분석'} · 누락된 설정과 확인된 취약점을 구분합니다.</small></div><div class="report-balance"><div class="report-positive"><h2>+ 확인된 장점 <b>${m.strengths.length}</b></h2>${cards(m.strengths)||'<p>이 점검 범위에서 확인된 장점이 없습니다.</p>'}</div><div class="report-negative"><h2>! 보완할 단점 <b>${m.weaknesses.length}</b></h2>${cards(full?m.weaknesses:m.weaknesses.slice(0,3))}${!full&&m.weaknesses.length>3?`<p>외 ${m.weaknesses.length-3}개 · 전체 리포트에서 확인</p>`:''}</div></div><div class="report-boundary"><strong>아직 확인하지 못한 영역</strong><p>${m.unknowns.map(esc).join(' · ')}</p></div></section>`;
}
export function reportDocument(report){return`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>HEXLAB 보안 분석 리포트</title><style>body{max-width:900px;margin:40px auto;padding:20px;font:15px/1.8 sans-serif;color:#163222}h1,h2,h3{line-height:1.4}article{border:1px solid #bdd5c5;border-radius:10px;padding:16px;margin:12px 0;break-inside:avoid}small{color:#557965;overflow-wrap:anywhere}.report-balance{display:grid;grid-template-columns:1fr 1fr;gap:24px}.report-positive h2{color:#1a834d}.report-negative h2{color:#b13b32}.report-boundary{background:#eef5f0;padding:16px}.report-verdict{padding:16px;background:#e4f2e9}.report-fix{font-weight:bold}@media(max-width:600px){.report-balance{display:block}}@media print{body{margin:0}}</style></head><body><h1>HEXLAB / 보안 분석 리포트</h1><p>${esc(report.url)}<br>${esc(report.scannedAt)} · ${report.score}/100 · ${esc(report.grade)}</p>${reportStory(report,true)}</body></html>`;}
export function removeSavedReport(reports,index){return reports.filter((_,i)=>i!==index);}
export function restoreSavedReports(current,deleted){const key=r=>r.url+'|'+r.scannedAt;const seen=new Set();return [...current,...deleted].filter(r=>{const id=key(r);if(seen.has(id))return false;seen.add(id);return true;}).sort((a,b)=>(Date.parse(b.scannedAt)||0)-(Date.parse(a.scannedAt)||0)).slice(0,12);}
