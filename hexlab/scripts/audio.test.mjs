import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { SOUNDTRACKS,soundtrackFor } from '../src/soundtracks.js';

test('all five tracks are distinct, playable stereo PCM loops with safe headroom',async()=>{
  const hashes=new Set();
  for(const track of Object.values(SOUNDTRACKS)){
    const wav=await readFile(new URL('../src/audio/'+track.file,import.meta.url));
    assert.equal(wav.toString('ascii',0,4),'RIFF');
    assert.equal(wav.toString('ascii',8,12),'WAVE');
    assert.equal(wav.readUInt16LE(20),1);assert.equal(wav.readUInt16LE(22),2);
    assert.equal(wav.readUInt16LE(34),16);assert.equal(wav.readUInt32LE(40),wav.length-44);
    const rate=wav.readUInt32LE(24),frames=(wav.length-44)/4;
    assert.ok(Math.abs(frames/rate-32*60/track.bpm)<1/rate);
    let peak=0,total=0;
    for(let i=44;i<wav.length;i+=2){const sample=wav.readInt16LE(i)/32768;peak=Math.max(peak,Math.abs(sample));total+=sample*sample;}
    assert.ok(peak>.25&&peak<.8,track.name+' headroom');
    assert.ok(Math.sqrt(total/((wav.length-44)/2))>.02,track.name+' audible content');
    for(let channel=0;channel<2;channel++)assert.ok(Math.abs(wav.readInt16LE(44+channel*2)-wav.readInt16LE(wav.length-4+channel*2))<1500,track.name+' loop boundary');
    hashes.add(createHash('sha256').update(wav).digest('hex'));
  }
  assert.equal(hashes.size,5);
  assert.equal(soundtrackFor('lab','web'),SOUNDTRACKS.web);
  assert.equal(soundtrackFor('lab','bio'),SOUNDTRACKS.bio);
});
