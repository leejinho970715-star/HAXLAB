export function codeCoordinate(text){
 const latitude=text.match(/\b(?:lat|latitude)\s*["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
 const longitude=text.match(/\b(?:lng|lon|longitude)\s*["']?\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
 if(!latitude||!longitude)return null;
 const lat=Number(latitude[1]),lng=Number(longitude[1]);
 return Math.abs(lat)<=90&&Math.abs(lng)<=180?{lat,lng}:null;
}
export function trackingStep(text){const lines=text.split('\n').filter(line=>line.trim()).length;return {lines,active:lines>=8,step:Math.floor(text.length/160),coordinate:codeCoordinate(text)};}
export function mountTrackingScene(root){
 let frame=0,last=0,disposed=false,active=false,paused=false,currentStep=-1,target={lat:37.5665,lng:126.978},yaw=.55,zoom=1,panX=0,panZ=0,targetYaw=.55,targetZoom=1,targetX=0,targetZ=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),events=new AbortController();
 root.innerHTML=`<section class="panel tracking-panel"><div class="panel-header"><h2>◈ GEO TRACE / CODE THEATRE</h2><span class="demo-pill">가상 장면</span></div><div class="tracking-top"><span class="tracking-state">AWAITING CODE</span><button class="icon-button tracking-pause" aria-label="지도 모션 일시 정지">Ⅱ</button></div><div class="tracking-map-wrap"><canvas class="tracking-map" aria-label="코드 입력에 반응하는 녹색 네온 3D 가상 도시 지도"></canvas><div class="tracking-wait"><span>⌁</span><strong>코드가 공간을 깨웁니다.</strong><p>8줄 이상 작성하면 좌표 탐색과<br>3D 카메라 연출이 시작됩니다.</p></div><div class="tracking-crosshair" aria-hidden="true"></div><span class="tracking-sector">SECTOR / STANDBY</span><span class="tracking-scale">VECTOR GRID · 3D VIEW</span></div><div class="tracking-coordinates"><div><small>LATITUDE</small><strong class="tracking-lat">37.566500</strong></div><div><small>LONGITUDE</small><strong class="tracking-lng">126.978000</strong></div><div><small>CODE SIGNAL</small><strong class="tracking-lines">0 / 8 LINES</strong></div></div><div class="tracking-camera"><div class="camera-label"><span>● CCTV / SYNTHETIC CAMERA</span><strong class="tracking-camera-id">CAM_01</strong></div><canvas class="tracking-cctv" aria-label="실제 CCTV 영상이 아닌 가상 도시 카메라 장면"></canvas><span class="camera-caption">생성된 가상 장면 · 실제 CCTV 연결 없음</span><span class="camera-time"></span></div><div class="tracking-events" aria-live="polite">[ WAIT ] 키 입력을 기다리고 있습니다.</div><p class="tracking-note">지도·동선·카메라는 시각 연출입니다. 위치 추적이나 비공개 CCTV에 연결하지 않습니다. 직접 코드 모드에서 <code>lat=37.5665</code>, <code>lng=126.9780</code>를 입력하면 표시 좌표가 바뀝니다.</p></section>`;
 const map=root.querySelector('.tracking-map'),cctv=root.querySelector('.tracking-cctv'),ctx=map.getContext('2d'),camera=cctv.getContext('2d');
 const sizes={map:{w:1,h:1},cctv:{w:1,h:1}};
 const buildings=[];
 for(let x=-5;x<=5;x++)for(let z=-5;z<=5;z++){if(x===0||z===0||(x+z)%4===0)continue;buildings.push({x:x*38,z:z*38,h:18+((Math.abs(x*19+z*31)*13)%80),w:21,d:24});}
 function size(){for(const [name,canvas,context]of [['map',map,ctx],['cctv',cctv,camera]]){const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,2);sizes[name]={w:rect.width,h:rect.height};canvas.width=Math.max(1,Math.round(rect.width*ratio));canvas.height=Math.max(1,Math.round(rect.height*ratio));context.setTransform(ratio,0,0,ratio,0,0);}draw(0);}
 const resize=new ResizeObserver(size);resize.observe(map);resize.observe(cctv);
 const vertices=b=>[[b.x-b.w/2,0,b.z-b.d/2],[b.x+b.w/2,0,b.z-b.d/2],[b.x+b.w/2,0,b.z+b.d/2],[b.x-b.w/2,0,b.z+b.d/2],[b.x-b.w/2,b.h,b.z-b.d/2],[b.x+b.w/2,b.h,b.z-b.d/2],[b.x+b.w/2,b.h,b.z+b.d/2],[b.x-b.w/2,b.h,b.z+b.d/2]];
 function polygon(context,points,fill,stroke='#3fffa16e'){context.beginPath();points.forEach((p,i)=>i?context.lineTo(...p):context.moveTo(...p));context.closePath();context.fillStyle=fill;context.fill();context.strokeStyle=stroke;context.lineWidth=.7;context.stroke();}
 function drawMap(time){
  const {w,h}=sizes.map;ctx.fillStyle='#020b08';ctx.fillRect(0,0,w,h);
  const project=([x,y,z])=>{x-=panX;z-=panZ;const a=x*Math.cos(yaw)-z*Math.sin(yaw),b=x*Math.sin(yaw)+z*Math.cos(yaw);return[w/2+a*zoom*.85,h*.55+b*zoom*.42-y*zoom*.9];};
  for(let n=-300;n<=300;n+=30){ctx.beginPath();ctx.moveTo(...project([n,0,-300]));ctx.lineTo(...project([n,0,300]));ctx.moveTo(...project([-300,0,n]));ctx.lineTo(...project([300,0,n]));ctx.strokeStyle=n===0?'#47ffa07d':'#2aff6e19';ctx.lineWidth=n===0?4:1;ctx.stroke();}
  const sorted=buildings.slice().sort((a,b)=>(a.x*Math.sin(yaw)+a.z*Math.cos(yaw))-(b.x*Math.sin(yaw)+b.z*Math.cos(yaw)));
  for(const b of sorted){const p=vertices(b).map(project);polygon(ctx,[p[0],p[1],p[5],p[4]],'#06251b');polygon(ctx,[p[1],p[2],p[6],p[5]],'#0a3526');polygon(ctx,[p[4],p[5],p[6],p[7]],'#13563b');ctx.strokeStyle='#7affb134';ctx.beginPath();ctx.moveTo(...p[4]);ctx.lineTo(...p[0]);ctx.stroke();}
  if(active){
   const route=[[-150,0,0],[-90,0,0],[-90,0,90],[0,0,90],[0,0,0],[90,0,0],[90,0,-120]].map(project);
   ctx.beginPath();route.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle='#71ffaac9';ctx.setLineDash([5,7]);ctx.lineDashOffset=reduced.matches?0:-time/80;ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
   const selected=route[Math.abs(currentStep)%route.length];ctx.beginPath();ctx.arc(...selected,5,0,Math.PI*2);ctx.fillStyle='#c6ffe0';ctx.fill();ctx.beginPath();ctx.arc(...selected,14+(reduced.matches?0:(time/100)%10),0,Math.PI*2);ctx.strokeStyle='#71ffaa88';ctx.stroke();
   for(let i=0;i<4;i++){const p=route[(i+currentStep+route.length*100)%route.length];ctx.fillStyle='#a6eac1';ctx.font='8px monospace';ctx.fillText('CAM_0'+(i+1),p[0]+9,p[1]-8);}
  }
 }
 function drawCamera(time){
  const {w,h}=sizes.cctv;camera.fillStyle='#03120b';camera.fillRect(0,0,w,h);
  const turn=active ? .11*Math.sin(yaw) : 0;
  const project=([x,y,z])=>{const px=x*Math.cos(turn)-z*Math.sin(turn),pz=300+x*Math.sin(turn)+z*Math.cos(turn);const depth=Math.max(55,pz),scale=Math.min(w,h*2)/depth;return[w/2+px*scale,h*.51+(28-y)*scale];};
  for(let i=-200;i<=200;i+=35){camera.beginPath();camera.moveTo(...project([i,0,-210]));camera.lineTo(...project([i,0,260]));camera.moveTo(...project([-260,0,i]));camera.lineTo(...project([260,0,i]));camera.strokeStyle='#35fc6227';camera.stroke();}
  for(const b of buildings.slice().sort((a,b)=>b.z-a.z)){if(b.z<-185)continue;const p=vertices(b).map(project);polygon(camera,[p[0],p[1],p[5],p[4]],'#07331c','#4dff7755');polygon(camera,[p[1],p[2],p[6],p[5]],'#0a4927','#4dff7755');polygon(camera,[p[4],p[5],p[6],p[7]],'#125a31','#63ff9755');}
  if(active){const motion=reduced.matches?0:(time/100)%90;for(let i=0;i<3;i++){const p=project([i*33-30,8,40+motion]);camera.strokeStyle='#bdffc7';camera.lineWidth=1;camera.strokeRect(p[0]-4,p[1]-13,8,19);camera.font='7px monospace';camera.fillStyle='#6ffe8d';camera.fillText('SIM_'+(i+1),p[0]+7,p[1]-6);}}
  for(let line=0;line<h;line+=4){camera.fillStyle='#010a0755';camera.fillRect(0,line,w,1);}
  camera.strokeStyle='#4fff8777';camera.strokeRect(12,12,w-24,h-24);
  root.querySelector('.camera-time').textContent=active?new Date().toLocaleTimeString('en-GB'):'--:--:--';
 }
 function draw(time){if(disposed)return;drawMap(time);drawCamera(time);}
 function tick(time){frame=0;if(disposed||document.hidden)return;if(time-last>32){last=time;yaw+=(targetYaw-yaw)*.035;zoom+=(targetZoom-zoom)*.055;panX+=(targetX-panX)*.035;panZ+=(targetZ-panZ)*.035;draw(time);}if(active&&!paused&&!reduced.matches)frame=requestAnimationFrame(tick);}
 function requestDraw(){if(!frame&&!disposed&&!document.hidden){if(reduced.matches||paused){yaw=targetYaw;zoom=targetZoom;panX=targetX;panZ=targetZ;draw(0);}else frame=requestAnimationFrame(tick);}}
 root.querySelector('.tracking-pause').addEventListener('click',()=>{paused=!paused;root.querySelector('.tracking-pause').textContent=paused?'▷':'Ⅱ';root.querySelector('.tracking-pause').setAttribute('aria-label',paused?'지도 모션 재생':'지도 모션 일시 정지');if(paused){cancelAnimationFrame(frame);frame=0;}else requestDraw();},{signal:events.signal});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else requestDraw();},{signal:events.signal});
 return {progress({text}){
  if(disposed)return;const signal=trackingStep(text);root.querySelector('.tracking-lines').textContent=signal.lines+' / 8 LINES';
  if(!signal.active){active=false;currentStep=-1;cancelAnimationFrame(frame);frame=0;root.querySelector('.tracking-wait').hidden=false;root.querySelector('.tracking-state').textContent='AWAITING CODE';root.querySelector('.tracking-events').textContent='[ WAIT ] '+signal.lines+'줄 작성 · 8줄 이상이면 지도 활성화';draw(0);return;}
  active=true;root.querySelector('.tracking-wait').hidden=true;root.querySelector('.tracking-state').textContent='SIGNAL LOCKED / SCENE ACTIVE';
  if(signal.step!==currentStep||signal.coordinate&&(signal.coordinate.lat!==target.lat||signal.coordinate.lng!==target.lng)){
   currentStep=signal.step;target=signal.coordinate||{lat:37.5665+(currentStep%9)*.0013,lng:126.978+(currentStep%7)*.0018};
   const coordinateSeed=Math.abs(Math.round(target.lat*1000)+Math.round(target.lng*1000))%17;
   targetYaw=.55+currentStep*.42+coordinateSeed*.08;targetZoom=[1,1.28,.82,1.55,1.12][currentStep%5];targetX=Math.sin(currentStep*1.7+coordinateSeed)*90;targetZ=Math.cos(currentStep*1.3+coordinateSeed)*70;
   root.querySelector('.tracking-lat').textContent=target.lat.toFixed(6);root.querySelector('.tracking-lng').textContent=target.lng.toFixed(6);root.querySelector('.tracking-sector').textContent='SECTOR / '+String(currentStep%12+1).padStart(2,'0');root.querySelector('.tracking-camera-id').textContent='CAM_0'+(currentStep%4+1);
   root.querySelector('.tracking-events').textContent='[ '+String(currentStep).padStart(3,'0')+' ] '+['좌표 이동 → 경로 표시','3D 시점 회전 → 카메라 전환','구역 확장 → 줌 아웃','상세 지점 → 줌 인'][currentStep%4]+'\n[ SOURCE ] '+(signal.coordinate?'입력된 좌표 텍스트':'가상 예제 좌표')+' / 코드 실행 없음';
  }
  requestDraw();
 },dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();events.abort();}};
}
