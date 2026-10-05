export const WELCOME_LINES=[
 '너도 해커가 되고 싶어?',
 '좋아. 여기서는 누구나 해커가 될 수 있어.',
 '사실, 너도 누군가의 시스템을 해킹해 보고 싶었잖아.',
 '누구에게나 숨겨둔 어두운 호기심이 있어.',
 '그 어두운 마음, 여기서 마음껏 풀어봐.',
 '이곳은 가상의 시스템이 네 무대가 되는 해킹 월드야.',
 '무너뜨려 보고, 고쳐 보고, 다시 지켜내 봐.',
 '네 첫 번째 미션, 지금 시작할까?'
];

export function renderWelcome(icon){
 return `<section class="welcome-stage" aria-labelledby="welcome-title"><div class="welcome-top"><a class="intro-logo" href="#/">${icon('terminal')} HEX<span>LAB</span></a><span><i class="signal-dot"></i> SECURE CHANNEL / CONNECTED</span><a class="welcome-quick-entry" href="#/home">메인 바로 입장 →</a></div><div class="welcome-grid"><div class="welcome-character"><img src="./anonymous.png" alt="검은 후드와 어나니머스 스타일 가면을 쓴 실사 보안 가이드" fetchpriority="high"><div class="welcome-frame" aria-hidden="true"></div><span class="welcome-identity">ANONYMOUS / YOUR GUIDE<span>IDENTITY HIDDEN. POTENTIAL UNLIMITED.</span></span><div class="welcome-transmission" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><span>TRANSMITTING</span></div></div><div class="welcome-dialogue"><div class="eyebrow">// INCOMING MESSAGE FROM GUIDE_01</div><p class="welcome-channel"><span class="signal-dot"></span> 낯선 세계에 온 걸 환영해.</p><h1 id="welcome-title"><span class="sr-only">${WELCOME_LINES[0]}</span><span data-greeting-line="0" aria-hidden="true"></span></h1><div class="welcome-message"><p class="sr-only">${WELCOME_LINES.slice(1).join(' ')}</p>${WELCOME_LINES.slice(1).map((_,i)=>`<p data-greeting-line="${i+1}" aria-hidden="true"></p>`).join('')}</div><div class="welcome-actions"><button class="primary-button" id="welcome-enter">메인으로 입장 ${icon('arrow')}</button><button class="outline-button" id="welcome-skip">인사말 건너뛰기</button></div><div class="welcome-status"><span class="welcome-typing-state" role="status">가이드가 인사말을 입력하고 있습니다.</span><span>YOUR FIRST MISSION AWAITS _</span></div></div></div></section>`;
}

export function mountWelcome(root,onEnter){
 const lines=[...root.querySelectorAll('[data-greeting-line]')],skip=root.querySelector('#welcome-skip'),status=root.querySelector('.welcome-typing-state');
 const lifecycle=new AbortController(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let timer=0,line=0,character=0,finished=false,disposed=false;
 function complete(){clearTimeout(timer);timer=0;finished=true;lines.forEach((element,i)=>{element.textContent=WELCOME_LINES[i];element.classList.remove('greeting-active');});skip.textContent='인사 다시 보기';status.textContent='연결 완료. 첫 번째 미션을 시작하세요.';root.querySelector('.welcome-stage').classList.add('greeting-complete');}
 function tick(){if(disposed)return;const element=lines[line];lines.forEach(n=>n.classList.toggle('greeting-active',n===element));const chars=Array.from(WELCOME_LINES[line]);element.textContent=chars.slice(0,++character).join('');if(character<chars.length)timer=setTimeout(tick,34);else if(line<lines.length-1){line++;character=0;timer=setTimeout(tick,420);}else complete();}
 function start(){clearTimeout(timer);finished=false;line=character=0;lines.forEach(n=>{n.textContent='';n.classList.remove('greeting-active');});skip.textContent='인사말 건너뛰기';status.textContent='가이드가 인사말을 입력하고 있습니다.';root.querySelector('.welcome-stage').classList.remove('greeting-complete');if(reduced.matches)complete();else timer=setTimeout(tick,350);}
 root.querySelector('#welcome-enter').addEventListener('click',onEnter,{signal:lifecycle.signal});
 skip.addEventListener('click',()=>finished?start():complete(),{signal:lifecycle.signal});
 reduced.addEventListener('change',()=>{if(reduced.matches)complete();},{signal:lifecycle.signal});
 start();return()=>{disposed=true;clearTimeout(timer);lifecycle.abort();};
}
