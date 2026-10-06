import { soundtrackFor } from './soundtracks.js?v=233799fa9190';

export function mountBackgroundMusic(root) {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('hexlab-bgm') || '{}'); } catch {}
  let enabled = saved.enabled !== false;
  let volume = Number.isFinite(saved.volume) ? Math.max(0, Math.min(1, saved.volume)) : .18;
  let activated = false, context, gain, generation = 0, timer;
  let track = soundtrackFor('intro');
  root.innerHTML = `<div class="bgm-heading"><span class="bgm-indicator"></span><strong class="bgm-track"></strong><span class="bgm-badge">BGM</span></div>
    <div class="bgm-controls"><button class="bgm-toggle" type="button" aria-label="배경음악 재생"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5"/><path class="bgm-waves" d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/><path class="bgm-mute-mark" d="m16 9 5 6m0-6-5 6"/></svg></button><div class="bgm-volume"><label for="bgm-volume">VOLUME <output id="bgm-percent"></output></label><input id="bgm-volume" aria-label="BGM 볼륨" type="range" min="0" max="100" step="1"></div></div>
    <div class="bgm-caption"><span class="bgm-mood"></span><span class="bgm-status" role="status"></span></div><audio id="bgm-audio" loop preload="none" hidden></audio>`;
  const audio = root.querySelector('audio');
  const toggle = root.querySelector('.bgm-toggle');
  const slider = root.querySelector('input');
  const status = root.querySelector('.bgm-status');
  slider.value = Math.round(volume * 100);
  const save = () => { try { localStorage.setItem('hexlab-bgm', JSON.stringify({enabled,volume})); } catch {} };
  const paint = (state) => {
    root.dataset.state = state;
    status.textContent = {pending:'첫 터치 후 재생',playing:'PLAYING',muted:'OFF',paused:'PAUSED',loading:'LOADING',error:'터치하여 재생'}[state];
    toggle.setAttribute('aria-pressed', String(!enabled));
    toggle.setAttribute('aria-label', state === 'playing' || state === 'loading' ? '배경음악 음소거' : '배경음악 재생');
    root.querySelector('#bgm-percent').textContent = `${Math.round(volume * 100)}%`;
  };
  const cancelTransition = () => { clearTimeout(timer); timer = undefined; generation++; };
  const fade = (target, seconds = .35) => {
    if (!gain) { audio.volume = target; return; }
    const now = context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(target, now + seconds);
  };
  const loadTrack = () => {
    audio.src = new URL('./audio/' + track.file, import.meta.url).href;
    root.querySelector('.bgm-track').textContent = track.name;
    root.querySelector('.bgm-mood').textContent = track.mood;
  };
  const prepare = () => {
    activated = true;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!context && AudioContext) {
      context = new AudioContext();
      gain = context.createGain();
      gain.gain.value = 0;
      context.createMediaElementSource(audio).connect(gain);
      gain.connect(context.destination);
    }
  };
  const play = async () => {
    if (!activated || !enabled || document.hidden) return;
    if (audio.src !== new URL('./audio/' + track.file, import.meta.url).href) loadTrack();
    const current = generation;
    paint('loading');
    try {
      // Start both operations in the user gesture, before awaiting either promise.
      await Promise.all([context?.resume(), audio.play()]);
      if (current !== generation || !enabled || document.hidden) return;
      fade(volume, .65);
      paint('playing');
    } catch {
      if (current === generation && enabled) paint('error');
    }
  };
  const pause = (state) => { cancelTransition(); audio.pause(); fade(0, 0); paint(state); };
  toggle.addEventListener('click', () => {
    if (enabled && activated && !audio.paused) { enabled = false; pause('muted'); }
    else { enabled = true; cancelTransition(); prepare(); play(); }
    save();
  });
  slider.addEventListener('input', () => {
    volume = Number(slider.value) / 100;
    fade(enabled ? volume : 0, .08);
    root.querySelector('#bgm-percent').textContent = `${slider.value}%`;
    save();
  });
  const gesture = (event) => {
    if (event.target.closest?.('.bgm-player') || !enabled || document.hidden) return;
    if (event.type === 'keydown' && (event.ctrlKey || event.metaKey || event.altKey)) return;
    prepare();
    if (audio.paused && !timer) play();
  };
  document.addEventListener('pointerdown', gesture, {passive:true});
  document.addEventListener('keydown', gesture);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause(enabled ? 'paused' : 'muted');
    else if (activated && enabled) play();
  });
  window.addEventListener('pagehide', () => pause(enabled ? 'paused' : 'muted'));
  window.addEventListener('pageshow', () => { if (activated && enabled) play(); });
  audio.addEventListener('error', () => { if (enabled) paint('error'); });
  loadTrack();
  paint(enabled ? 'pending' : 'muted');
  return {
    setPage(page, mode) {
      const next = soundtrackFor(page, mode);
      if (next.file === track.file) return;
      cancelTransition();
      track = next;
      const current = generation;
      const switchTrack = () => {
        timer = undefined;
        if (current !== generation) return;
        audio.pause();
        loadTrack();
        if (activated && enabled && !document.hidden) play();
        else paint(enabled ? activated ? 'paused' : 'pending' : 'muted');
      };
      if (!audio.paused && enabled && !document.hidden) { fade(0, .18); timer = setTimeout(switchTrack, 190); }
      else switchTrack();
    }
  };
}
