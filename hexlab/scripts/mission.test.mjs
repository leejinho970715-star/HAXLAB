import test from 'node:test';
import assert from 'node:assert/strict';
import {ATTACKS,newMatch,incomingKey,launchAttack,tapThreat,defendWave,nextRound} from '../src/game-core.js';
import {MAIL_SCENARIOS,createMailIncident,treatMailIncident} from '../src/mail-core.js';
test('all mail simulations infect virtual records then quarantine and restore originals',()=>{
 for(const scenario of MAIL_SCENARIOS){const incident=createMailIncident(scenario.key);assert.equal(incident.files.filter(file=>file.infected).length,scenario.spread);const clean=treatMailIncident(incident,'clamav');assert.equal(clean.phase,'recovered');assert.equal(clean.detected,scenario.spread);assert(clean.files.every(file=>!file.infected&&!file.locked));assert(incident.files.some(file=>file.infected));}
});
test('behavior-only mail defense misses a marker-only Trojan and allows a correct retry',()=>{
 const missed=treatMailIncident(createMailIncident('delivery'),'defender');assert.equal(missed.phase,'infected');assert.equal(missed.detected,0);assert.equal(missed.remaining,6);assert.equal(treatMailIncident(missed,'clamav').phase,'recovered');
 assert.equal(treatMailIncident(createMailIncident('invoice'),'defender').phase,'recovered');
});
test('duel wins through firewall breach, synthetic intelligence capture and matched defenses',()=>{
 let state=newMatch('duel',2);for(const key of ['worm','trojan','trojan','trojan','virus','virus']){state=launchAttack(state,key);assert.equal(state.phase,'defense');state=defendWave(state,ATTACKS[state.incoming].counter);if(state.phase==='result')state=nextRound(state);}
 assert.equal(state.phase,'finished');assert.equal(state.won,true);assert.equal(state.intel.length,3);assert(state.health>0);
});
test('incorrect defense loses health, duplicate taps and out-of-phase actions have no effect',()=>{
 let state=newMatch('defense',0),tapped=tapThreat(state,0);assert.equal(tapThreat(tapped,0),tapped);assert.equal(tapThreat(tapped,9),tapped);
 for(let i=0;i<6&&state.phase!=='finished';i++){const wrong=ATTACKS[incomingKey(state)].counter==='clamav'?'defender':'clamav';state=defendWave(state,wrong);assert.equal(launchAttack(state,'virus'),state);if(state.phase==='result')state=nextRound(state);}
 assert.equal(state.phase,'finished');assert.equal(state.won,false);assert.equal(state.health,0);
 assert.throws(()=>newMatch('remote'));assert.throws(()=>createMailIncident('url'));assert.throws(()=>defendWave(newMatch(),'unknown'));
});
test('defense mission survives six waves, keeps zero synthetic intelligence and resets independently',()=>{
 let state=newMatch('defense',3);for(let i=0;i<6;i++){const key=incomingKey(state);state=tapThreat(tapThreat(tapThreat(state,0),1),2);state=defendWave(state,ATTACKS[key].counter);if(state.phase==='result')state=nextRound(state);}
 assert.equal(state.won,true);assert.equal(state.intel.length,0);assert.equal(state.health,100);assert.equal(newMatch('duel').score,0);
});
