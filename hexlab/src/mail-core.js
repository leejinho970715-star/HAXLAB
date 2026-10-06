import {createVirtualFiles,infectFiles,scanVirtualFiles,restoreVirtualFiles} from './core.js';
export const MAIL_SCENARIOS = Object.freeze([
 {key:'invoice',virus:'wannacry',subject:'[긴급] 미확인 결제 내역을 확인하세요',sender:'Billing Center',address:'billing@invoice-alert.invalid',attachment:'Invoice_2026.pdf.exe',effect:'lock',hint:'문서처럼 보이는 이중 확장자와 급한 결제 안내',copy:'결제 내역이 첨부되었습니다. 지금 확인하지 않으면 이용이 제한됩니다.',spread:8},
 {key:'delivery',virus:'trojan',subject:'배송 주소 오류 · 수령 확인이 필요합니다',sender:'Parcel Support',address:'support@parcel-update.invalid',attachment:'Delivery_Details.exe',effect:'mark',hint:'예상하지 못한 배송 메일과 실행 파일 첨부',copy:'배송을 완료할 수 없습니다. 첨부 안내서를 열고 수령 정보를 확인하세요.',spread:6},
 {key:'update',virus:'worm',subject:'보안 업데이트 완료를 위한 최종 안내',sender:'IT Help Desk',address:'admin@security-patch.invalid',attachment:'Security_Update.exe',effect:'replicate',hint:'공식 담당자를 사칭하며 첨부 프로그램 실행을 요구',copy:'중요 보안 패치를 첨부했습니다. 즉시 실행하여 업데이트를 완료하세요.',spread:8}
]);
export function createMailIncident(key){
 const scenario=MAIL_SCENARIOS.find(item=>item.key===key);if(!scenario)throw new Error('Unknown mail');
 const result=infectFiles(createVirtualFiles(),{name:scenario.subject,marker:'HEXLAB_MAIL_DEMO',effect:scenario.effect,spread:scenario.spread});
 return {scenario,files:result.files,phase:'infected',detected:0,quarantined:0};
}
export function treatMailIncident(incident,defense){
 if(!['clamav','defender'].includes(defense))throw new Error('Unknown defense');
 const rules=defense==='clamav'?[{name:'Demo signature',type:'signature',match:'HEXLAB_MAIL_DEMO',action:'quarantine'}]:[{name:'Lock behavior',type:'behavior',match:'file_lock',action:'quarantine'},{name:'Replication behavior',type:'behavior',match:'replication',action:'quarantine'}];
 const result=scanVirtualFiles(incident.files,rules),remaining=result.files.filter(file=>file.infected&&!file.quarantined).length;
 return {...incident,files:remaining?result.files:restoreVirtualFiles(result.files),phase:remaining?'infected':'recovered',detected:result.detected,quarantined:result.quarantined,remaining};
}
