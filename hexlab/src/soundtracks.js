export const SOUNDTRACKS={
 intro:{name:'GHOST ENTRY',file:'intro.wav',mood:'미스터리 앰비언트',bpm:72,roots:[40,36,45,47],arps:[0,7,12,15,12,7,3,7],rhythm:'ambient'},
 scan:{name:'SIGNAL RECON',file:'scan.wav',mood:'미니멀 일렉트로',bpm:92,roots:[42,38,45,40],arps:[0,12,7,3,14,7,12,3],rhythm:'pulse'},
 web:{name:'SANDBOX FLOW',file:'web.wav',mood:'유연한 신스웨이브',bpm:104,roots:[45,41,48,43],arps:[0,7,12,19,15,12,7,3],rhythm:'groove'},
 bio:{name:'DEFENSE MATRIX',file:'bio.wav',mood:'긴장감 있는 다크 앰비언트',bpm:80,roots:[38,34,43,45],arps:[0,3,7,10,15,10,7,3],rhythm:'defense'},
 code:{name:'TERMINAL DRIVE',file:'code.wav',mood:'몰입하는 사이버 테크노',bpm:118,roots:[40,38,36,47],arps:[0,7,12,7,3,14,7,12],rhythm:'drive'}
};
export function soundtrackFor(page,mode='web'){return SOUNDTRACKS[page==='lab'?mode:page==='mail'?'bio':page==='game'?'code':page]||SOUNDTRACKS.intro;}
