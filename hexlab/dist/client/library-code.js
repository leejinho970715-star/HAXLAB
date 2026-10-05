import { MALWARE_PRESETS,validateVirus,validateRules } from './core.js?v=f3fb86af5500';

export function libraryCode(key){
 if(MALWARE_PRESETS[key]){
  const {name,marker,effect,spread}=MALWARE_PRESETS[key];
  return '// 가상 파일에만 적용되는 감염 체험 코드\n// effect: mark / lock / replicate, spread: 1–8\nlab.infect('+JSON.stringify({name,marker,effect,spread},null,2)+');';
 }
 const rules=key==='defender'?[{name:'Lock behavior',type:'behavior',match:'file_lock',action:'quarantine'},{name:'Replication behavior',type:'behavior',match:'replication',action:'quarantine'}]:[{name:'Demo signature',type:'signature',match:'HEXLAB_DEMO',action:'quarantine'}];
 return '// 가상 파일의 패턴 또는 행위를 검사합니다.\n// restoreBackup: 검사·격리 후 정상 백업 복원\nlab.scan('+JSON.stringify({rules,restoreBackup:true},null,2)+');';
}

export function parseLibraryCode(text,key){
 if(typeof text!=='string'||text.length>14000)throw Error('코드는 14,000자 이하로 입력하세요.');
 const code=text.split('\n').filter(line=>!line.trim().startsWith('//')).join('\n').trim();
 const match=code.match(/^lab\.(infect|scan)\s*\(([\s\S]*)\)\s*;?$/);
 if(!match)throw Error('예제의 lab.infect({...}) 또는 lab.scan({...}) 형식으로 입력하세요. 설정값은 JSON 형식으로 작성합니다.');
 const malware=Boolean(MALWARE_PRESETS[key]);
 if(match[1]!== (malware?'infect':'scan'))throw Error('선택한 도감 유형과 코드 호출이 다릅니다.');
 let config;try{config=JSON.parse(match[2]);}catch{throw Error('설정값을 확인하세요. 속성 이름과 문자열에 큰따옴표를 사용하고 JSON 형식을 유지하세요.');}
 if(malware){const valid=validateVirus(config);return {kind:'infect',config:{name:valid.name,marker:valid.marker,effect:valid.effect,spread:valid.spread}};}
 const rules=validateRules(config?.rules).map(({name,type,match,action})=>({name,type,match,action}));
 if(config.restoreBackup!==undefined&&typeof config.restoreBackup!=='boolean')throw Error('restoreBackup은 true 또는 false로 지정하세요.');
 return {kind:'scan',rules,restoreBackup:config.restoreBackup===true};
}
