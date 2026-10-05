import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {SOUNDTRACKS} from '../src/soundtracks.js';
const rate=22050,tau=2*Math.PI;
const hz=note=>440*2**((note-69)/12);
await mkdir('src/audio',{recursive:true});
for(const [key,track] of Object.entries(SOUNDTRACKS)){
 const beat=60/track.bpm,duration=beat*32,length=Math.round(duration*rate);
 const left=new Float32Array(length),right=new Float32Array(length);
 let seed=key.split('').reduce((a,c)=>a*31+c.charCodeAt(0),17)>>>0;
 const noise=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/2147483648-1;};
 function voice(note,start,seconds,level,kind='pad',pan=0){
  const f=hz(note),offset=Math.round(start*rate),samples=Math.ceil(seconds*rate),l=Math.sqrt((1-pan)/2),r=Math.sqrt((1+pan)/2);
  for(let i=0;i<samples;i++){
   const t=i/rate,p=t/seconds;
   const attack=Math.min(1,t/(kind==='pad'?.24:.012)),release=Math.min(1,(seconds-t)/(kind==='pad'?.38:.08));
   const envelope=kind==='arp'?Math.exp(-p*5):kind==='bass'?Math.exp(-p*1.5):.75+.25*Math.sin(p*Math.PI);
   const phase=tau*f*t;
   const wave=kind==='pad'?.64*Math.sin(phase)+.20*Math.sin(phase*1.003)+.10*Math.sin(phase*2):kind==='bass'?.85*Math.sin(phase)+.15*Math.sin(phase*2):.65*Math.sin(phase)+.22*Math.sin(phase*2)+.10*Math.sin(phase*3);
   const sample=wave*attack*release*envelope*level,index=(offset+i)%length;
   left[index]+=sample*l;right[index]+=sample*r;
  }
 }
 function drum(start,kind,level){
  const seconds=kind==='kick'?.33:kind==='snare'?.15:.06,offset=Math.round(start*rate);let previous=0;
  for(let i=0;i<seconds*rate;i++){
   const t=i/rate,n=noise(),wave=kind==='kick'?Math.sin(tau*(46*t+100*(1-Math.exp(-32*t))/32))*Math.exp(-t*14):kind==='snare'?(n*.7+Math.sin(tau*170*t)*.3)*Math.exp(-t*28):(n-previous)*Math.exp(-t*75)*.35;
   previous=n;const index=(offset+i)%length,sample=wave*level*Math.min(1,t/.003);left[index]+=sample*.707;right[index]+=sample*.707;
  }
 }
 for(let bar=0;bar<8;bar++){
  const root=track.roots[bar%4],start=bar*4*beat;
  [0,3,7,14].forEach((step,i)=>voice(root+12+step,start,beat*4.1,.070,'pad',(i-1.5)/2));
  const stride=track.rhythm==='ambient'?1:track.rhythm==='defense'?1:.5;
  for(let b=0;b<4;b+=stride){const step=track.arps[(bar*8+Math.round(b/stride))%8];voice(root+24+step,start+b*beat,beat*.8,track.rhythm==='ambient'?.027:.044,'arp',Math.sin(b*2+bar)*.5);}
  for(let b=0;b<4;b++){voice(root,start+b*beat,beat*.7,track.rhythm==='ambient'?.04:.095,'bass');if(track.rhythm!=='ambient')drum(start+b*beat,'kick',track.rhythm==='defense'?.075:.14);}
  if(['groove','drive','pulse'].includes(track.rhythm))for(let b=0;b<4;b+=.5)drum(start+b*beat,'hat',track.rhythm==='drive'?.045:.027);
  if(['groove','drive'].includes(track.rhythm)){drum(start+beat,'snare',.044);drum(start+3*beat,'snare',.044);}
 }
 const dryLeft=left.slice(),dryRight=right.slice();
 for(const [delay,gain] of [[beat*.75,.22],[beat*1.5,.12],[beat*2.25,.06]]){
  const shift=Math.round(delay*rate);for(let i=0;i<length;i++){const target=(i+shift)%length;left[target]+=dryRight[i]*gain;right[target]+=dryLeft[i]*gain;}
 }
 let peak=0;for(let i=0;i<length;i++)peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));
 const scale=.64/peak,wav=Buffer.alloc(44+length*4);
 wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(2,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*4,28);wav.writeUInt16LE(4,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(length*4,40);
 for(let i=0;i<length;i++){wav.writeInt16LE(Math.round(left[i]*scale*32767),44+i*4);wav.writeInt16LE(Math.round(right[i]*scale*32767),46+i*4);}
 await writeFile(resolve('src/audio',track.file),wav);
 console.log(`${track.name}: ${duration.toFixed(2)}s stereo loop, ${track.bpm} BPM`);
}
