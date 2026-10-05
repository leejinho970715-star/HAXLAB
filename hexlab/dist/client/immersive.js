const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountImmersiveLab(root,actions){
 let disposed=false,busy=false,phase='ready',progress=0,focused='invoice.pdf',result=null;
 const timers=new Set(),listeners=new AbortController();
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 root.innerHTML=`<section class="panel immersive-lab"><div class="panel-header"><h2>◈ INCIDENT EXPERIENCE</h2><span class="demo-pill">가상 데스크톱</span></div><div class="incident-toolbar"><div><strong>감염을 목격하고, 직접 복구하세요.</strong><p>파일을 열어 변화를 확인하세요. 격리와 백업 복구는 서로 다른 단계입니다.</p></div><div class="incident-actions"><button class="primary-button" data-incident="infect">감염 시나리오 실행</button><button class="outline-button" data-incident="scan">백신으로 검사·격리</button><button class="outline-button" data-incident="restore">백업에서 복원</button><button class="icon-button" data-incident="reset" aria-label="데스크톱 실험 초기화">↻</button></div></div><div class="incident-desktop"><div class="desktop-menubar"><span>HEXLAB OS <b>/</b> TRAINING VM</span><span class="desktop-health"></span></div><div class="desktop-files" role="group" aria-label="데스크톱 가상 파일"></div><div class="incident-window" aria-live="polite"></div><div class="desktop-file-viewer"></div><div class="desktop-taskbar"><span>▦</span><span>FILES</span><span>DEFENSE CENTER</span><small>시뮬레이션 · 실제 시스템 접근 없음</small></div></div><div class="incident-lesson"></div></section>`;
 const state=()=>actions.getState();
 function draw(){
  if(disposed)return;
  const {files,config}=state();const affected=files.filter(f=>f.infected),q=files.filter(f=>f.quarantined);
  const threat=affected.some(f=>!f.quarantined);
  root.querySelector('.incident-desktop').dataset.status=threat?'infected':q.length?'quarantined':phase==='restored'?'restored':'clean';
  root.querySelector('.desktop-health').textContent=busy?'PROCESSING':threat?'THREAT ACTIVE':q.length?'THREAT CONTAINED':'SYSTEM HEALTHY';
  root.querySelector('.desktop-files').innerHTML=files.map(f=>`<button class="desktop-file ${f.quarantined?'quarantined':f.locked?'locked':f.infected?'infected':''}" data-virtual-file="${esc(f.name)}" aria-label="가상 파일 ${esc(f.name)} 열기"><span class="desktop-file-icon">${f.quarantined?'◈':f.locked?'▣':f.name.endsWith('.exe')?'⚙':'▤'}</span><span>${esc(f.name)}${f.locked?'.locked':''}</span><small>${f.quarantined?'격리':f.locked?'잠금':f.infected?'감염':'정상'}</small></button>`).join('');
  const window=root.querySelector('.incident-window');
  const model=config.effect==='lock'?'FILE LOCK / RANSOMWARE':config.effect==='replicate'?'PROPAGATION / WORM':'FILE INFECTION';
  if(busy)window.innerHTML=`<div class="incident-window-title">${phase==='infecting'?'SCENARIO ENGINE':phase==='scanning'?'DEFENSE CENTER':'BACKUP RECOVERY'} <span>SIMULATION</span></div><div class="incident-window-body"><span class="incident-symbol">${phase==='infecting'?'!':'◇'}</span><h3>${phase==='infecting'?'감염 흐름을 재현하고 있습니다.':phase==='scanning'?'가상 파일을 검사하고 있습니다.':'정상 백업을 복원하고 있습니다.'}</h3><p>${phase==='infecting'?'진입 → 파일 변화 → 화면 증상':phase==='scanning'?'패턴 검사 → 행위 분석 → 탐지 규칙 적용':'격리 상태 확인 → 정상 내용 복원 → 접근 확인'}</p><div class="incident-progress"><i style="width:${progress}%"></i></div><strong>${progress}%</strong></div>`;
  else if(phase==='scan-complete')window.innerHTML=`<div class="incident-window-title">DEFENSE CENTER <span>${result?.detected?'DETECTED':'SCAN COMPLETE'}</span></div><div class="incident-window-body"><span class="incident-symbol">${result?.detected?'◇':'?'}</span><h3>${result?.quarantined?'위협을 격리했습니다.':result?.detected?'위협을 발견했습니다.':'탐지된 항목이 없습니다.'}</h3><p>${result?.detected||0}개 탐지 · ${result?.quarantined||0}개 격리</p><p>${q.length?'격리된 파일은 실행·확산 대상에서 제외됩니다. 잠긴 파일의 내용은 정상 백업으로 복원하세요.':affected.length?'파일은 감염 상태입니다. 표시자와 규칙을 비교하거나 행위 탐지를 선택해 다시 검사하세요.':'가상 파일이 정상 상태입니다.'}</p><div class="incident-evidence">${(result?.results||[]).map(f=>`<div>${esc(f.name)} <b>${esc(f.rule)}</b></div>`).join('')||'현재 규칙과 일치하는 표시자·이벤트 없음'}</div></div>`;
  else if(phase==='restored'&&!affected.length)window.innerHTML='<div class="incident-window-title">RECOVERY COMPLETE <span>VERIFIED</span></div><div class="incident-window-body"><span class="incident-symbol">✓</span><h3>정상 파일로 돌아왔습니다.</h3><p>8개 가상 파일의 원래 내용이 복원됐습니다. 파일을 다시 열어 잠금 해제와 정상 내용을 확인하세요.</p><div class="incident-recovery-check">✓ 위협 표시 제거<br>✓ 백업 내용 복원<br>✓ 가상 파일 접근 가능</div></div>';
  else if(affected.length)window.innerHTML=`<div class="incident-window-title">${model} <span>SIMULATED INCIDENT</span></div><div class="incident-window-body"><span class="incident-symbol">${config.effect==='lock'?'▣':'!'}</span><h3>${config.effect==='lock'?'파일을 열 수 없습니다.':config.effect==='replicate'?'확산 이벤트가 관측됐습니다.':'파일이 원래 상태와 달라졌습니다.'}</h3><p>${esc(config.name)} · ${affected.length}개 감염 · ${q.length}개 격리</p><p>${config.effect==='lock'?'문서와 설정 파일에 접근 불가 상태가 표시됩니다. 백신으로 위협을 격리한 뒤 정상 백업으로 복원하세요.':config.effect==='replicate'?'가상 복제 이벤트가 발생했습니다. 추가 감염을 실행하면 남은 가상 파일로 확산됩니다.':'가상 감염 표시자가 파일에 추가되었습니다. 파일 검사로 변경 흔적을 찾아보세요.'}</p><div class="incident-evidence">${affected.slice(0,4).map(f=>`<div>${esc(f.name)} <b>${f.quarantined?'격리됨':f.locked?'접근 불가':f.events.includes('replication')?'복제 이벤트':'내용 변조'}</b></div>`).join('')}</div></div>`;
  else window.innerHTML='<div class="incident-window-title">WORKSPACE / READY <span>ISOLATED VM</span></div><div class="incident-window-body"><span class="incident-symbol">◈</span><h3>평범한 작업 화면에서 시작합니다.</h3><p>아래에서 악성코드와 백신 유형을 선택하고 감염 시나리오를 실행하세요. 파일 아이콘을 눌러 감염 전후를 직접 비교할 수 있습니다.</p><div class="incident-recovery-check">01 감염 화면 체험<br>02 백신 검사·격리<br>03 백업 복원과 비교</div></div>';
  const file=files.find(f=>f.name===focused)||files[0];
  root.querySelector('.desktop-file-viewer').innerHTML=`<span>FILE VIEWER / ${esc(file.name)}</span><h4>${file.quarantined?'보호를 위해 격리된 파일입니다.':file.locked?'파일 접근이 차단되었습니다.':file.infected?'파일 내용이 변경됐습니다.':'파일을 정상적으로 열었습니다.'}</h4><pre>${esc(file.locked?'[가상 잠금 상태]\n정상 백업을 복원하면 내용이 표시됩니다.':file.quarantined?'[격리 보관]\n백업에서 복원하여 정상 파일로 교체하세요.':file.content)}</pre>`;
  root.querySelector('.incident-lesson').innerHTML=`<strong>이번 실험의 핵심</strong><p>${config.effect==='lock'?'랜섬웨어를 제거하는 것과 암호화된 파일을 복호화하는 것은 다릅니다. 이 화면의 복원은 저장해 둔 가상 백업으로 되돌리는 과정입니다.':config.effect==='replicate'?'시그니처가 없어도 복제 행위를 탐지할 수 있습니다. 격리는 추가 확산을 차단하는 단계입니다.':'백신의 탐지 규칙과 실제 파일의 표시자가 일치해야 탐지됩니다. 정상 파일의 원본과 변경 내용을 비교해보세요.'}</p>`;
  root.querySelectorAll('[data-incident]').forEach(b=>b.disabled=busy);
  for(const id of ['run-virus','run-av','restore-files','new-experiment']){const el=document.getElementById(id);if(el)el.disabled=busy;}
 }
 const wait=ms=>new Promise(resolve=>{const timer=setTimeout(()=>{timers.delete(timer);resolve();},reduced.matches?0:ms);timers.add(timer);});
 async function run(kind){
  if(busy||disposed)return;busy=true;progress=0;phase=kind==='infect'?'infecting':kind==='scan'?'scanning':'recovering';draw();
  for(const amount of [20,48,76,100]){await wait(250);if(disposed)return;progress=amount;draw();}
  result=kind==='infect'?actions.infect():kind==='scan'?actions.scan():actions.restore();
  if(disposed)return;busy=false;
  if(result?.error){phase='ready';draw();root.querySelector('.incident-lesson').textContent=result.error;return;}
  phase=kind==='scan'?'scan-complete':kind==='restore'?'restored':'compromised';draw();return result;
 }
 root.addEventListener('click',event=>{
  const file=event.target.closest('[data-virtual-file]');if(file){focused=file.dataset.virtualFile;draw();return;}
  const action=event.target.closest('[data-incident]');if(!action)return;
  if(action.dataset.incident==='reset'){actions.reset();phase='ready';result=null;draw();}
  else run(action.dataset.incident);
 },{signal:listeners.signal});
 draw();
 return {sync:draw,run,reset(){if(busy)return;actions.reset();phase='ready';result=null;draw();},dispose(){disposed=true;listeners.abort();for(const timer of timers)clearTimeout(timer);timers.clear();}};
}
