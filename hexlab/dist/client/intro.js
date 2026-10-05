const steps=items=>`<ol class="experience-steps">${items.map(([title,copy],i)=>`<li><span>0${i+1}</span><div><strong>${title}</strong><p>${copy}</p></div></li>`).join('')}</ol>`;
const scenes={SCAN:['scan-core','빛나는 스캔 링과 보안 방패에 둘러싸인 3D 지구'],SANDBOX:['web-workspace','코드와 웹 화면이 떠 있는 유리 큐브 실습 공간'],DEFENSE:['defense-core','가상 파일을 보호하는 녹색 방패와 붉은 악성코드 상징'],OPERATOR:['code-terminal','코드가 쏟아지는 홀로그램 터미널과 키보드']};
const pane=(label,content,foot)=>{const [scene,alt]=scenes[label.split(' /')[0]];return `<div class="experience-demo"><div class="tour-pane-top"><span><i></i><i></i><i></i></span><b>${label}</b><em>PREVIEW</em></div><div class="tour-scene"><img class="tour-floating" src="./sections/${scene}.png" alt="${alt}" width="1536" height="1024" loading="lazy" decoding="async"></div>${content}<div class="tour-pane-foot"><span class="signal-dot"></span>${foot}</div></div>`;};

export function renderIntroDetails(icon){
 return `<div class="intro-details" id="intro-details">
 <div class="experience-intro"><div class="eyebrow">// FOUR WAYS TO THINK LIKE AN OPERATOR</div><h2>궁금한 웹에서,<br><span>당신의 첫 실험까지.</span></h2><p>분석으로 시작해 실험으로 이해하고, 방어로 완성하세요.<br>각 콘텐츠가 어떤 경험을 제공하는지 먼저 살펴보세요.</p><span class="tour-scroll-cue">SCROLL TO EXPLORE ${icon('arrow')}</span></div>
 <nav class="experience-nav" aria-label="콘텐츠 소개 바로가기"><button data-tour-jump="tour-scan"><span>01</span> RECON</button><button data-tour-jump="tour-web"><span>02</span> SANDBOX</button><button data-tour-jump="tour-bio"><span>03</span> DEFENSE</button><button data-tour-jump="tour-code"><span>04</span> CODE</button></nav>
 <div class="tour-scroll-track" aria-hidden="true"><i class="tour-progress-fill"></i></div>
 <section class="experience-section" id="tour-scan" aria-labelledby="tour-scan-title">
  <div class="experience-copy"><div class="experience-kicker"><span>01</span> RECONNAISSANCE / SECURITY SCAN</div><h2 id="tour-scan-title">웹의 보안을,<br><em>근거와 함께 읽다.</em></h2><p class="experience-description">URL 하나로 공개 웹페이지의 응답을 살펴보세요. 보안 헤더와 HTTPS 설정을 확인하고, 점수 뒤에 있는 관측 근거와 개선 방법까지 연결합니다.</p><div class="experience-tags"><span>HTTP HEADERS</span><span>EVIDENCE</span><span>REPORT</span></div>${steps([['URL 입력','분석할 공개 웹사이트 주소를 입력하세요.'],['응답과 설정 확인','CSP·HSTS·프레임 보호 등 관측된 항목을 읽으세요.'],['개선 가이드 활용','장점·단점과 개선 우선순위를 읽고 JSON·HTML 리포트를 저장하세요.']])}<button class="primary-button" data-start="scan">웹사이트 분석 시작 ${icon('arrow')}</button><small>공개 HTTP 응답 기준의 점검입니다. 전체 보안 수준을 보증하는 등급은 아닙니다.</small></div>
  ${pane('SCAN / example.com',`<div class="tour-scan-target">${icon('globe')} https://example.com <span>GET / 200</span></div><div class="tour-score"><div class="tour-score-orb tour-floating"><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="67"/><circle class="tour-score-arc" cx="80" cy="80" r="67"/></svg><div><b data-tour-count="72">72</b><span>/ 100</span></div></div><div><span class="tour-micro">SECURITY SCORE</span><strong>B+</strong><small>OBSERVE. UNDERSTAND. IMPROVE.</small></div></div><div class="tour-check-list"><div><span>CSP policy</span><b class="medium">REVIEW</b></div><div><span>HTTPS connection</span><b>VERIFIED</b></div><div><span>Frame protection</span><b class="medium">REVIEW</b></div></div><div class="tour-evidence"><span>// OBSERVED → RECOMMENDED</span><p>헤더 누락을 발견했다면,<br>설정 방법과 확인할 사항까지 함께.</p></div>`,'학습용 샘플 리포트 / 실제 대상 분석 결과와 구분')}
 </section>
 <section class="experience-section experience-reverse" id="tour-web" aria-labelledby="tour-web-title">
  <div class="experience-copy"><div class="experience-kicker"><span>02</span> EXPERIMENT / WEB SANDBOX</div><h2 id="tour-web-title">같은 웹페이지,<br><em>당신만의 실험실.</em></h2><p class="experience-description">공개 페이지의 기술 흔적을 읽고 React·TypeScript·Vue·Next.js 프로젝트로 재구성하세요. 컴포넌트를 편집해 실제 미리보기에서 실행하고 소스 ZIP을 저장할 수 있습니다.</p><div class="experience-tags"><span>CLONE & EDIT</span><span>LIVE PREVIEW</span><span>CODE INSPECTION</span></div>${steps([['복제하거나 예제로 시작','공개 URL 또는 Studio·Shop·Login 예제를 선택하세요.'],['직접 바꾸고 확인','프로젝트 형식을 선택하고 컴포넌트·스타일을 직접 편집하세요.'],['위험한 패턴 개선','코드 검사를 실행하고 발견된 패턴을 수정해 비교하세요.']])}<button class="primary-button" data-start="web">웹 실습실 입장 ${icon('arrow')}</button><small>복제는 정적 HTML·CSS 스냅샷입니다. 원본 서버, 로그인과 동적 기능은 포함되지 않습니다.</small></div>
  ${pane('SANDBOX / INDEPENDENT WORKSPACE',`<div class="tour-web-grid"><div class="tour-site-preview"><span>NEXUS<span>®</span></span><small>DIGITAL STUDIO</small><h3>Your idea.<br><em>Your rules.</em></h3><p>Change the code.<br>See what happens.</p><div class="tour-fake-button">LET'S BUILD ↗</div><div class="tour-site-grid"></div></div><div class="tour-mini-editor"><div>HTML <span>CSS</span> JS</div><pre><span class="tour-code-comment">// make it your own</span>\n<span class="tour-code-keyword">const</span> title =\n  document.querySelector('h1');\n\ntitle.<span class="tour-code-accent">textContent</span> =\n  'Your rules.';\n\n<span class="tour-code-comment">// inspect & improve</span>\nrenderPreview(project);</pre></div></div><div class="tour-pipeline"><span>CLONE</span><i></i><span>EDIT</span><i></i><span>INSPECT</span></div><div class="tour-findings"><span>${icon('shield')} SAFE OUTPUT</span><p>innerHTML → <b>textContent</b></p></div>`,'원본과 분리된 미리보기 / 브라우저에 프로젝트 저장')}
 </section>
 <section class="experience-section" id="tour-bio" aria-labelledby="tour-bio-title">
  <div class="experience-copy"><div class="experience-kicker"><span>03</span> DEFENSE / MALWARE & ANTIVIRUS</div><h2 id="tour-bio-title">감염을 이해하고,<br><em>방어를 설계하다.</em></h2><p class="experience-description">바이러스·웜·트로이목마·WannaCry의 개념과 백신의 탐지 방식을 살펴보세요. 가상 파일과 직접 편집한 규칙으로 감염된 데스크톱을 열고 파일 잠금, 백신 검사·격리, 백업 복구의 흐름을 직접 체험합니다.</p><div class="experience-tags"><span>6 CONCEPT MODELS</span><span>VIRTUAL FILES</span><span>DETECT & RESTORE</span></div>${steps([['개념 모델 선택','3D 아이콘과 역할 설명을 읽고 실습 프리셋을 불러오세요.'],['감염·탐지 규칙 설계','표시자, 가상 잠금·복제, 시그니처·행위 규칙을 편집하세요.'],['검사하고 복구','가상 파일의 변화를 비교하고 격리·복구 과정을 확인하세요.']])}<button class="primary-button" data-start="bio">바이러스 & 백신 실험 ${icon('arrow')}</button><small>가상 파일로 재현하는 학습 모델입니다. 실제 악성코드나 백신 엔진을 실행하지 않습니다.</small></div>
  ${pane('DEFENSE / VIRTUAL FILESYSTEM',`<div class="tour-model-duel"><div class="tour-model"><img class="tour-floating" src="./icons/virus.png" alt="파일 바이러스의 붉은 3D 상징 아이콘" loading="lazy"><span>MALWARE</span><b>SIMULATE</b></div><div class="tour-duel-connector">${icon('arrow')}<span>OBSERVE<br>& DEFEND</span></div><div class="tour-model"><img class="tour-floating" src="./icons/defender.png" alt="탐지와 방어를 상징하는 녹색 3D 방패 아이콘" loading="lazy"><span>ANTIVIRUS</span><b>DETECT</b></div></div><div class="tour-files"><div><span>${icon('file')} index.html</span><b>CLEAN</b></div><div><span>${icon('file')} invoice.pdf</span><b class="high">LOCKED</b></div><div><span>${icon('file')} backup.zip</span><b class="medium">QUARANTINED</b></div></div><div class="tour-pipeline"><span>CREATE</span><i></i><span>DETECT</span><i></i><span>RESTORE</span></div>`,'8개 가상 파일 / 표시·탐지·격리·복구 개념 실험')}
 </section>
 <section class="experience-section experience-reverse" id="tour-code" aria-labelledby="tour-code-title">
  <div class="experience-copy"><div class="experience-kicker"><span>04</span> CODE THEATRE / HACKER TYPING BOARD</div><h2 id="tour-code-title">아무 키나 누르세요.<br><em>코드가 쏟아집니다.</em></h2><p class="experience-description">코드를 작성하면 3D 네온 지도가 깨어납니다. 8줄부터 좌표 이동·회전·줌과 가상 CCTV 시점이 이어지고, 입력할수록 새로운 탐색 연출이 반복됩니다.</p><div class="experience-tags"><span>RANDOM CODE</span><span>3 FORMATS</span><span>YOUR PACE</span></div>${steps([['빈 보드에 입장','키보드 입력이 가능한 빈 터미널을 열어보세요.'],['마음대로 타이핑','아무 글자나 입력하면 랜덤 코드가 연속으로 나타납니다.'],['나만의 연출 선택','연출 타이핑·직접 코드 입력을 선택하고 lat·lng 좌표를 바꿔보세요.']])}<button class="primary-button" data-start="code">해킹 코드 삽입 시작 ${icon('arrow')}</button><small>예제 코드는 화면에 표시하는 연출용 텍스트입니다.</small></div>
  ${pane('OPERATOR / CODE THEATRE',`<div class="tour-typing-toolbar"><span>RANDOM MIX</span><span>FAST <i class="signal-dot"></i></span></div><pre class="tour-typing-preview"><span class="tour-code-line tour-code-comment">// integrity-check.js</span><span class="tour-code-line"><b>async function</b> fingerprint(text) {</span><span class="tour-code-line">  const bytes = new TextEncoder()</span><span class="tour-code-line">    .encode(text);</span><span class="tour-code-line">  const digest = await crypto.subtle</span><span class="tour-code-line">    .digest('SHA-256', bytes);</span><span class="tour-code-line">  return digest;</span><span class="tour-code-line">}</span><span class="tour-code-line tour-code-comment">// one key. a whole new flow.</span><span class="tour-code-line">operator@hexlab:~$ <i>▌</i></span></pre><div class="tour-keyboard" aria-hidden="true"><span>Q</span><span>W</span><span>E</span><span>R</span><span>T</span><span>Y</span><span>↵</span></div>`,'CODE → 3D MAP → SYNTHETIC CAMERA / 입력량에 반응하는 연출')}
 </section>
 <div class="experience-finale"><span class="eyebrow">// YOUR NEXT LEVEL STARTS HERE</span><h2>읽었다면,<br><em>이제 직접 경험하세요.</em></h2><p>하나의 URL, 한 번의 수정, 하나의 규칙.<br>작은 실험이 더 깊은 이해로 이어집니다.</p><div><button class="primary-button" data-start="scan">첫 보안 분석 시작 ${icon('arrow')}</button><button class="outline-button" data-tour-jump="mission-selector">다른 미션 선택 ${icon('arrow')}</button></div><span class="tour-finale-caption">PRACTICE. LEARN. SECURE.</span></div>
 </div>`;
}

export function mountIntroMotion(root){
 const {gsap,ScrollTrigger}=window;
 const lifecycle=new AbortController();
 root.querySelectorAll('[data-tour-jump]').forEach(button=>button.addEventListener('click',()=>{
  root.querySelector('#'+button.dataset.tourJump)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 },{signal:lifecycle.signal}));
 if(!gsap||!ScrollTrigger)return()=>lifecycle.abort();
 gsap.registerPlugin(ScrollTrigger);
 const media=gsap.matchMedia();let disposed=false;
 media.add({motion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width: 761px)'},context=>{
  if(!context.conditions.motion)return;
  const distance=context.conditions.desktop?46:24;
  gsap.from('.experience-intro > *',{y:distance,opacity:0,duration:.8,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:'.experience-intro',start:'top 85%',toggleActions:'play none none reverse'}});
  root.querySelectorAll('.experience-section').forEach(section=>{
   const timeline=gsap.timeline({scrollTrigger:{trigger:section,start:'top 82%',toggleActions:'play none none reverse'},defaults:{ease:'power3.out'}});
   timeline.from(section.querySelectorAll('.experience-copy > *'),{y:distance,opacity:0,duration:.75,stagger:.08},0)
    .from(section.querySelector('.experience-demo'),{x:context.conditions.desktop?(section.classList.contains('experience-reverse')?-45:45):0,y:24,opacity:0,duration:1},.12);
   const connectors=section.querySelectorAll('.tour-pipeline i');
   if(connectors.length)timeline.from(connectors,{scaleX:0,transformOrigin:'left',duration:.6,stagger:.1},.55);
   const lines=section.querySelectorAll('.tour-code-line');
   if(lines.length)timeline.from(lines,{opacity:0,x:-8,stagger:.09,duration:.25},.65);
   const number=section.querySelector('[data-tour-count]');
   if(number){timeline.from(number,{textContent:0,snap:{textContent:1},duration:1.3},.35);timeline.from(section.querySelector('.tour-score-arc'),{strokeDashoffset:421,duration:1.4},.3);}
   const floating=section.querySelectorAll('.tour-floating');
   if(floating.length)gsap.fromTo(floating,{y:12},{y:-12,ease:'none',scrollTrigger:{trigger:section,start:'top bottom',end:'bottom top',scrub:1}});
  });
  gsap.fromTo('.tour-progress-fill',{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:'.intro-details',start:'top center',end:'bottom bottom',scrub:.4}});
  gsap.from('.experience-finale > *',{y:distance,opacity:0,duration:.8,stagger:.1,scrollTrigger:{trigger:'.experience-finale',start:'top 82%',toggleActions:'play none none reverse'}});
 },root);
 const refresh=()=>{if(!disposed)ScrollTrigger.refresh();};
 document.fonts?.ready.then(refresh);
 return()=>{disposed=true;lifecycle.abort();media.revert();};
}
