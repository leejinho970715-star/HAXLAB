import {MAIL_SCENARIOS,createMailIncident,treatMailIncident} from './mail-core.js';
import {NEON_SPIDER_SVG} from './spider.js';
const portrait=(key,alt)=>`<img src="./icons/${key}.png" alt="${alt}">`;
export function renderMailExperience(){
 return `<div class="page-heading"><div><div class="eyebrow">05 / SOCIAL ENGINEERING THEATRE</div><h1><span class="terminal-chevron">&gt;</span>OPEN. INFECT. RECOVER.</h1><p>수상한 메일 한 통. 화면을 뒤덮는 감염. 그리고 당신의 첫 대응.</p></div><div class="header-badge">VIRTUAL INBOX / 03</div></div>
 <div class="mission-introduction"><span class="demo-pill">가상 메일 체험</span><p>메일을 열면 이 브라우저 화면에 붉은 경고와 바이러스가 나타납니다. 경보는 최대 8초이며 언제든 음소거하거나 Esc로 나갈 수 있습니다.</p><label class="mail-sound-option"><input id="mail-sound-enabled" type="checkbox" checked>메일 경보음 켜기</label></div>
 <div class="mail-page-grid"><section class="panel mail-inbox"><div class="panel-header"><h2>⌁ INCOMING TRANSMISSIONS</h2><span class="panel-code">TRAINING INBOX</span></div><div class="mail-inbox-top"><span>받은 편지함</span><b>3 NEW</b></div>${MAIL_SCENARIOS.map((mail,index)=>`<button class="mail-message" data-open-mail="${mail.key}" aria-label="메일 열기: ${mail.subject}"><span class="mail-avatar">${['₩','↗','!'][index]}</span><span><small>${mail.sender} · ${mail.address}</small><strong>${mail.subject}</strong><span>${mail.attachment}</span></span><span class="mail-time">${['09:41','09:36','09:12'][index]}<i>OPEN →</i></span></button>`).join('')}<div class="mail-inbox-foot">모든 주소·첨부파일은 가상입니다. 메일을 열어 감염 연출을 시작하세요.</div></section>
 <aside class="panel mail-brief"><div class="panel-header"><h2>BEFORE YOU CLICK</h2></div>${portrait('trojan','트로이목마를 상징하는 3D 에셋')}<h2>익숙한 문구일수록,<br><em>한 번 더 의심하세요.</em></h2><p>급한 결제, 배송 문제, 보안 업데이트. 이 실험의 메일은 서로 다른 악성코드 동작을 재현합니다.</p><ol><li>발신 주소와 첨부 확장자를 확인하세요.</li><li>감염 화면에서 바이러스의 움직임을 관찰하세요.</li><li>백신으로 검사·격리하고 정상 백업으로 복구하세요.</li></ol><span class="mail-result-note" role="status">아직 연 메일이 없습니다.</span></aside></div>
 <div class="mission-scope">메일 열기만으로 자동 감염되는 연출은 이 체험의 게임 규칙입니다. 실제 감염은 파일 실행, 취약점 등 조건에 따라 달라집니다.</div>`;
}
function createAlarm(report){
 let context,interval,endTimer,muted=false,ended=false;
 const stopNodes=()=>{clearInterval(interval);interval=undefined;context?.suspend().catch(()=>{});};
 const note=()=>{if(!context||document.hidden||muted||ended)return;const now=context.currentTime,osc=context.createOscillator(),gain=context.createGain();osc.type='triangle';osc.frequency.setValueAtTime(520,now);osc.frequency.linearRampToValueAtTime(860,now+.42);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.045,now+.04);gain.gain.linearRampToValueAtTime(0,now+.52);osc.connect(gain).connect(context.destination);osc.start(now);osc.stop(now+.55);osc.onended=()=>{osc.disconnect();gain.disconnect();};};
 const play=()=>{try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){report('경보음 재생 불가');return;}context ||= new Audio();context.resume().then(()=>{if(!muted&&!ended&&!document.hidden){note();if(!interval)interval=setInterval(note,650);report('경보음 재생 중');}}).catch(()=>report('경보음 재생 불가'));}catch{report('경보음 재생 불가');}};
 return {start(enabled){muted=!enabled;if(enabled)play();else report('경보음 꺼짐');endTimer=setTimeout(()=>{ended=true;stopNodes();report('8초 경보 종료');},8000);},toggle(){muted=!muted;if(muted){stopNodes();report('경보음 꺼짐');}else if(!ended)play();else report('8초 경보 종료');return muted;},pause(){stopNodes();report('화면 숨김 · 경보 일시 중지');},resume(){if(!muted&&!ended)play();},stop(){ended=true;clearTimeout(endTimer);stopNodes();context?.close().catch(()=>{});report('경보음 종료');}};
}
export function mountMailExperience(root){
 const lifecycle=new AbortController(),timers=new Set();let dialog,alarm,incident,busy=false,disposed=false;
 const listen=(el,type,fn)=>el.addEventListener(type,fn,{signal:lifecycle.signal});
 const delay=ms=>new Promise(resolve=>{const id=setTimeout(()=>{timers.delete(id);resolve();},ms);timers.add(id);});
 const close=()=>{alarm?.stop();alarm=null;dialog?.close();dialog?.remove();dialog=null;document.body.classList.remove('mail-incident-active');busy=false;};
 const swarm=()=>{
  const remaining=incident.files.filter(file=>file.infected&&!file.quarantined).length;
  return `<div class="mail-swarm" aria-hidden="true">${Array.from({length:remaining},(_,i)=>`<span class="mail-roaming-bug" style="--bug-left:${8+(i*29)%78}%;--bug-top:${10+(i*19)%74}%;--bug-x:${i%2?70:-65}px;--bug-y:${i%3?65:-80}px;--bug-duration:${9+i%4}s;--bug-delay:-${i*1.7}s">${portrait(incident.scenario.virus,'')}<span>${incident.scenario.virus.toUpperCase()}_${String(i+1).padStart(2,'0')}</span></span>`).join('')}</div>`;
 };
 const neonSpiders=()=>incident.phase==='recovered'?'':`<div class="mail-neon-spiders" aria-hidden="true">${Array.from({length:5},(_,index)=>`<span class="mail-neon-spider" style="--patrol-duration:${28+index*7}s;--patrol-delay:-${index*8}s;--rest-x:${8+index*18}vw;--rest-y:${18+index%3*23}vh">${NEON_SPIDER_SVG}<span>CRAWLER_0${index+1}</span></span>`).join('')}</div>`;
 const paint=()=>{
  if(!dialog)return;
  const recovered=incident.phase==='recovered',mail=incident.scenario;
  dialog.classList.toggle('recovered',recovered);dialog.querySelector('.mail-incident-body').innerHTML=`${swarm()}${neonSpiders()}<div class="mail-alert-copy"><span class="mail-alert-code">${recovered?'THREATS QUARANTINED / BACKUP RESTORED':'CRITICAL INCIDENT / TRAINING VM'}</span><h2>${recovered?'백신 처리가 완료됐습니다.':'당신의 화면이 감염됐습니다.'}</h2><p>${recovered?'바이러스를 탐지·격리하고 정상 백업으로 가상 파일을 되돌렸습니다.':'붉은 경고 뒤에서 바이러스가 움직입니다. 지금 대응을 시작하세요.'}</p><div class="mail-incident-metrics"><div><small>INFECTED</small><strong>${incident.files.filter(file=>file.infected&&!file.quarantined).length}</strong></div><div><small>DETECTED</small><strong>${incident.detected}</strong></div><div><small>RECOVERED</small><strong>${recovered?8:0}</strong></div></div><div class="mail-source-evidence"><span>ENTRY POINT / ${mail.attachment}</span><strong>${mail.subject}</strong><p>발신 주소: ${mail.address}</p><p>${mail.hint}</p></div><div class="mail-scan-progress" role="status" aria-live="polite">${recovered?'RECOVERY COMPLETE · 8개 정상 파일':incident.remaining?'일부 위협을 놓쳤습니다. 탐지 방식을 바꿔 다시 검사하세요.':'백신을 선택해 탐지와 격리를 시작하세요.'}</div><div class="mail-defense-actions">${recovered?'<button class="primary-button" data-close-incident>메일함으로 돌아가기</button>':`<button class="outline-button" data-mail-defense="clamav">${portrait('clamav','')}ClamAV 검사·복구</button><button class="outline-button" data-mail-defense="defender">${portrait('defender','')}Defender 검사·복구</button>`}</div><p class="mail-simulation-label">가상 파일 8개에 적용하는 실습 · 실제 기기의 감염이나 치료가 아닙니다.</p></div><div class="mail-files-strip">${incident.files.map(file=>`<span class="${file.infected?'infected':'clean'}">${file.locked?'⌧':file.infected?'!':'✓'} ${file.name}</span>`).join('')}</div>`;
  dialog.querySelector('[data-close-incident]')?.addEventListener('click',close,{signal:lifecycle.signal});
  dialog.querySelectorAll('[data-mail-defense]').forEach(button=>listen(button,'click',async()=>{
   if(busy)return;busy=true;alarm?.stop();const activeDialog=dialog;
   dialog.querySelectorAll('[data-mail-defense]').forEach(el=>el.disabled=true);
   const progress=dialog.querySelector('.mail-scan-progress');
   for(const text of ['SCAN 25% · 가상 파일 검사','SCAN 60% · 표시자·행위 비교','SCAN 100% · 탐지 결과 격리']){progress.textContent=text;await delay(450);if(disposed||dialog!==activeDialog)return;}
   incident=treatMailIncident(incident,button.dataset.mailDefense);busy=false;paint();
   if(incident.phase==='recovered'){dialog.querySelector('[data-close-incident]')?.focus({preventScroll:true});root.querySelector('.mail-result-note').textContent=`${mail.sender}: ${incident.detected}개 탐지·격리 / 정상 백업 복구 완료`;}
  }));
 };
 root.querySelectorAll('[data-open-mail]').forEach(button=>listen(button,'click',()=>{
  close();incident=createMailIncident(button.dataset.openMail);dialog=document.createElement('dialog');dialog.className='mail-incident-dialog';dialog.setAttribute('aria-label','해킹 메일 감염 체험');dialog.innerHTML='<div class="mail-incident-toolbar"><span>HEXLAB / INCIDENT MODE</span><div><span class="mail-alarm-state" role="status"></span><button class="outline-button" id="mute-mail-alarm">경보음 끄기</button><button class="outline-button" id="exit-mail-incident">체험 나가기 · Esc</button></div></div><div class="mail-incident-body"></div>';document.body.append(dialog);document.body.classList.add('mail-incident-active');paint();dialog.showModal();
  const currentDialog=dialog;alarm=createAlarm(text=>{if(dialog===currentDialog){dialog.querySelector('.mail-alarm-state').textContent=text;if(text.includes('종료')){const control=dialog.querySelector('#mute-mail-alarm');control.textContent='경보음 종료';control.disabled=true;}}});const enabled=root.querySelector('#mail-sound-enabled').checked;alarm.start(enabled);dialog.querySelector('#mute-mail-alarm').textContent=enabled?'경보음 끄기':'경보음 켜기';
  listen(dialog.querySelector('#mute-mail-alarm'),'click',event=>{event.currentTarget.textContent=alarm.toggle()?'경보음 켜기':'경보음 끄기';});listen(dialog.querySelector('#exit-mail-incident'),'click',close);listen(dialog,'cancel',event=>{event.preventDefault();close();});dialog.querySelector('#exit-mail-incident').focus({preventScroll:true});
 }));
 listen(document,'visibilitychange',()=>{if(dialog)dialog.classList.toggle('mail-motion-paused',document.hidden);if(document.hidden)alarm?.pause();else alarm?.resume();});listen(window,'pagehide',close);
 return ()=>{disposed=true;lifecycle.abort();timers.forEach(clearTimeout);timers.clear();close();};
}
