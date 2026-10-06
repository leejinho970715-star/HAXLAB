// Game balance and synthetic mission records only; no host or network access.
export const ATTACKS = Object.freeze({
  virus: {name:'File Virus',label:'파일 바이러스',breach:14,stealAt:28,counter:'clamav',hint:'알려진 파일 표시자',damage:20},
  worm: {name:'Computer Worm',label:'웜',breach:24,stealAt:-1,counter:'defender',hint:'복제·확산 행위',damage:26},
  trojan: {name:'Trojan Horse',label:'트로이목마',breach:8,stealAt:40,counter:'clamav',hint:'위장 파일의 알려진 패턴',damage:24},
  wannacry: {name:'WannaCry',label:'랜섬웨어 개념',breach:28,stealAt:-1,counter:'defender',hint:'파일 잠금·복제 행위',damage:30}
});
export const DEFENDERS = Object.freeze({
  clamav:{name:'ClamAV',label:'시그니처 방어',hint:'알려진 파일 표시자·위장 패턴'},
  defender:{name:'Microsoft Defender',label:'행위 방어',hint:'복제·확산·파일 잠금'}
});
export const INTEL = ['가상 미션 일정','가상 네트워크 지도','가상 작전 노트'];
export function newMatch(mode='duel',seed=0){
  if(!['duel','defense'].includes(mode))throw new Error('Unknown mission');
  return {mode,seed:Math.abs(Math.trunc(Number(seed)||0))%4,round:1,maxRounds:6,health:100,firewall:60,intel:[],score:0,phase:mode==='defense'?'defense':'attack',incoming:null,tapped:[],log:['[BOOT] Two virtual computers connected.'],last:null};
}
export function incomingKey(state){return Object.keys(ATTACKS)[(state.seed+state.round-1)%4];}
export function launchAttack(state,key){
  if(!ATTACKS[key])throw new Error('Unknown attack');
  if(state.phase!=='attack')return state;
  const attack=ATTACKS[key],firewall=Math.max(0,state.firewall-attack.breach),intel=[...state.intel];
  const stolen=firewall<=attack.stealAt&&intel.length<3;
  if(stolen)intel.push(INTEL[intel.length]);
  const message=`${attack.name}: 방화벽 ${state.firewall} → ${firewall}${stolen?' / 가상 정보 1개 확보':' / 방화벽 약화'}`;
  return {...state,firewall,intel,score:state.score+attack.breach+(stolen?120:0),phase:'defense',incoming:incomingKey(state),tapped:[],last:{kind:'attack',message},log:[...state.log,'[SEND] '+message].slice(-40)};
}
export function tapThreat(state,index){
  if(state.phase!=='defense'||!Number.isInteger(index)||index<0||index>2||state.tapped.includes(index))return state;
  return {...state,tapped:[...state.tapped,index],score:state.score+10};
}
export function defendWave(state,key){
  if(!DEFENDERS[key])throw new Error('Unknown defense');
  if(state.phase!=='defense')return state;
  const threatKey=state.incoming||incomingKey(state),threat=ATTACKS[threatKey],matched=threat.counter===key;
  const damage=Math.max(0,(matched?4:threat.damage+state.round*2)-state.tapped.length*2);
  const health=Math.max(0,Math.min(100,state.health-damage+(matched?3:0)));
  const message=matched?`${DEFENDERS[key].name}: ${threat.name} 격파 · 피해 ${damage}`:`대응 불일치 · ${threat.hint}에 맞는 ${DEFENDERS[threat.counter].label} 필요 · 피해 ${damage}`;
  const finished=health===0||state.round===state.maxRounds;
  const won=finished&&health>0&&(state.mode==='defense'||state.intel.length===3);
  return {...state,health,score:state.score+(matched?100:0),phase:finished?'finished':'result',won,finishReason:health===0?'내 가상 컴퓨터가 다운됐습니다.':state.mode==='duel'&&state.intel.length<3?'6라운드 안에 가상 정보 3개를 확보하지 못했습니다.':'미션 목표를 달성했습니다.',last:{kind:'defense',matched,damage,message},log:[...state.log,'[DEFEND] '+message].slice(-40)};
}
export function nextRound(state){
  if(state.phase!=='result')return state;
  return {...state,round:state.round+1,phase:state.mode==='defense'?'defense':'attack',incoming:null,tapped:[],last:null};
}
