import { trackingStep } from './tracking.js';

const FRAGMENTS=['trace(node);','scan_sector();','route.next();','checksum: OK','map.expand();','signal.lock();','[SIM] connected','verify(origin);','0x3F8A // trace','camera.switch();','await inspect();','defense.ready();'];

export function mountCodeSpider(root){
 const lifecycle=new AbortController(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const overlay=document.createElement('div');overlay.className='code-spider-overlay';overlay.hidden=true;overlay.setAttribute('aria-hidden','true');
 overlay.innerHTML='<div class="code-spider"><svg viewBox="-65 -60 130 120" fill="none" xmlns="http://www.w3.org/2000/svg"><g class="spider-legs">'+[-1,1].map(side=>Array.from({length:4},(_,i)=>'<path class="spider-leg" style="--leg-phase:'+((i+(side===1?1:0))%2)*-.22+'s" d="M '+side*10+' '+(-14+i*10)+' Q '+side*(25+i*3)+' '+(-33+i*20)+' '+side*(42+i*4)+' '+(-39+i*25)+' L '+side*(57-i*2)+' '+(-54+i*35)+'" />').join('')).join('')+'</g><ellipse cx="0" cy="14" rx="16" ry="24"/><ellipse cx="0" cy="-15" rx="11" ry="13"/><path d="M -6 -26 L -10 -34 M 6 -26 L 10 -34 M 0 -9 L 0 35 M -10 10 Q 0 17 10 10 M -12 24 Q 0 31 12 24"/><g class="spider-eyes"><circle cx="-4" cy="-19" r="1.4"/><circle cx="4" cy="-19" r="1.4"/></g></svg><span>CRAWLER_01</span></div>';
 document.body.append(overlay);
 const spider=overlay.querySelector('.code-spider'),toggle=document.createElement('button');toggle.type='button';toggle.className='outline-button spider-toggle';toggle.textContent='거미 모션 끄기';toggle.setAttribute('aria-pressed','true');toggle.hidden=true;
 root.querySelector('.typer-hints').append(toggle);
 let disposed=false,active=false,enabled=true,frame=0,last=0,time=0,drop=0,point=0,x=0,y=0,angle=0,target={x:0,y:0},fragments=[];
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
 function destinations(){
  const candidates=[];for(const selector of ['.typer-panel','.tracking-map-wrap','.tracking-camera','.page-heading']){const rect=root.querySelector(selector)?.getBoundingClientRect();if(!rect||rect.bottom<30||rect.top>innerHeight-30)continue;for(const [px,py]of [[rect.left+45,rect.top+35],[rect.right-55,rect.top+45],[rect.right-45,rect.bottom-45],[rect.left+65,rect.bottom-40]])candidates.push({x:clamp(px,65,innerWidth-65),y:clamp(py,70,innerHeight-90)});}
  return candidates.length?candidates:[{x:innerWidth*.4,y:innerHeight*.35},{x:innerWidth*.8,y:innerHeight*.7}];
 }
 function chooseTarget(){const places=destinations();point=(point+1)%places.length;target=places[point];}
 function place(){spider.style.transform='translate3d('+(x-55)+'px,'+(y-50)+'px,0) rotate('+angle+'deg)';}
 function clearFragments(){fragments.forEach(f=>f.node.remove());fragments=[];}
 function updateVisible(){const visible=active&&enabled&&!document.hidden&&!document.querySelector('dialog[open]');overlay.hidden=!visible;if(!visible){cancelAnimationFrame(frame);frame=0;clearFragments();}else if(reduced.matches){x=target.x;y=target.y;angle=0;place();}else if(!frame)frame=requestAnimationFrame(tick);}
 function tick(now){frame=0;if(disposed||!active||!enabled||document.hidden)return;if(document.querySelector('dialog[open]')){updateVisible();return;}
  const delta=Math.min(now-last||16,50);last=now;time+=delta;const dx=target.x-x,dy=target.y-y,distance=Math.hypot(dx,dy);
  if(distance<12){chooseTarget();}else{const travel=Math.min(distance,delta*.065);x+=dx/distance*travel;y+=dy/distance*travel;const desired=Math.atan2(dy,dx)*180/Math.PI+90;angle+=((desired-angle+540)%360-180)*.1;}
  place();
  if(time-drop>760){drop=time;const node=document.createElement('span');node.className='spider-code-fragment';node.textContent=FRAGMENTS[Math.floor(Math.random()*FRAGMENTS.length)];node.style.left=clamp(x,8,innerWidth-135)+'px';node.style.top=y+'px';node.style.setProperty('--fragment-drift',(Math.random()*70-35)+'px');overlay.append(node);fragments.push({node,expires:time+1900});}
  fragments=fragments.filter(f=>{if(time>f.expires){f.node.remove();return false;}return true;});frame=requestAnimationFrame(tick);
 }
 toggle.addEventListener('click',()=>{enabled=!enabled;toggle.textContent=enabled?'거미 모션 끄기':'거미 모션 켜기';toggle.setAttribute('aria-pressed',String(enabled));updateVisible();},{signal:lifecycle.signal});
 for(const event of ['resize','scroll'])window.addEventListener(event,()=>{if(active){chooseTarget();updateVisible();}},{signal:lifecycle.signal,passive:true});
 document.addEventListener('visibilitychange',()=>{last=0;updateVisible();},{signal:lifecycle.signal});
 reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;clearFragments();updateVisible();},{signal:lifecycle.signal});
 const dialog=document.querySelector('#detail-dialog');dialog?.addEventListener('close',updateVisible,{signal:lifecycle.signal});
 return {progress({text}){if(disposed)return;const signal=trackingStep(text),wasActive=active;active=signal.active;toggle.hidden=!active;if(active&&!wasActive){const places=destinations();x=places[0].x;y=places[0].y;chooseTarget();last=0;time=drop=0;root.querySelector('#typer-state').textContent='CRAWLER ONLINE';}if(active)root.querySelector('#typer-state').textContent='CRAWLER ONLINE';updateVisible();},dispose(){disposed=true;cancelAnimationFrame(frame);lifecycle.abort();clearFragments();overlay.remove();toggle.remove();}};
}
