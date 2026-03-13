// ===== HYBRID BGM MODULE =====
// MP3 priority with WebAudio chiptune fallback
// Public domain: Satie(1888), Vivaldi(1725), Beethoven(1808)
"use strict";
const ChipBGM = (() => {
  let actx = null, masterGain = null, melGain = null, bassGain = null;
  let currentName = '', playing = false, useChip = false;
  let melIdx = 0, bassIdx = 0, melTime = 0, bassTime = 0, schedId = null;
  const AHEAD = 2.0;
  let mp3Audio = null, mp3Fading = null;
  let _vol = 0.7;
  try { const v = localStorage.getItem('mipurin_bgmvol'); if (v !== null) _vol = parseFloat(v); } catch(e) {}
  const NF = {
    '_':0,'C2':65.41,'D2':73.42,'E2':82.41,'F2':87.31,'G2':98.00,'Ab2':103.83,'A2':110.00,'Bb2':116.54,'B2':123.47,
    'C3':130.81,'D3':146.83,'Eb3':155.56,'E3':164.81,'F3':174.61,'G3':196.00,'Ab3':207.65,'A3':220.00,'Bb3':233.08,'B3':246.94,
    'C4':261.63,'Db4':277.18,'D4':293.66,'Eb4':311.13,'E4':329.63,'F4':349.23,'F#4':369.99,'G4':392.00,'Ab4':415.30,'A4':440.00,'Bb4':466.16,'B4':493.88,
    'C5':523.25,'D5':587.33,'Eb5':622.25,'E5':659.25,'F5':698.46,'G5':783.99,'A5':880.00
  };
  const T_MEL=[['_',1],['F#4',1],['E4',1],['F#4',2],['E4',1],['F#4',1],['D4',1],['E4',1],['B3',3],['_',1],['F#4',1],['E4',1],['F#4',2],['E4',1],['F#4',1],['D4',1],['E4',1],['A3',3],['_',1],['F#4',1],['E4',1],['F#4',2],['E4',1],['D4',1],['E4',1],['F#4',1],['E4',2],['D4',1],['E4',1],['D4',1],['B3',1],['A3',3],['_',3]];
  const T_BAS=[['G2',3],['D3',3],['G2',3],['D3',3],['G2',3],['D3',3],['A2',3],['E3',3],['G2',3],['D3',3],['G2',3],['D3',3],['A2',3],['E3',3],['D2',3],['A2',3]];
  const F_MEL=[['E5',.75],['E5',.25],['E5',.5],['E5',.5],['E5',.75],['E5',.25],['E5',.5],['E5',.5],['E5',.5],['F5',.25],['E5',.25],['D5',.5],['E5',.5],['E5',.75],['E5',.25],['E5',.5],['E5',.5],['E5',.75],['E5',.25],['E5',.5],['E5',.5],['E5',.5],['F5',.25],['E5',.25],['D5',.5],['E5',.5],['E5',.5],['D5',.25],['C5',.25],['D5',.5],['E5',.5],['D5',.5],['C5',.25],['B4',.25],['C5',.5],['D5',.5],['C5',.5],['B4',.25],['A4',.25],['B4',1],['E4',.5],['E5',.5],['E5',1]];
  const F_BAS=[['E3',2],['E3',2],['A3',1],['B3',1],['E3',2],['E3',2],['E3',2],['A3',1],['B3',1],['E3',2],['A3',1],['E3',1],['A3',1],['E3',1],['A3',1],['E3',1],['A3',1],['B3',1],['A3',2],['E3',2]];
  const B_MEL=[['_',.5],['G4',.25],['G4',.25],['G4',.25],['Eb4',1.5],['_',.5],['F4',.25],['F4',.25],['F4',.25],['D4',1.5],['_',.5],['G4',.25],['G4',.25],['G4',.25],['Eb4',.75],['_',.25],['G4',.25],['G4',.25],['G4',.25],['C5',1],['Bb4',.25],['Bb4',.25],['Bb4',.25],['Ab4',1],['_',.25],['F4',.25],['F4',.25],['F4',.25],['G4',1],['_',.5],['G4',.25],['G4',.25],['G4',.25],['Eb4',1.5],['_',.5],['F4',.25],['F4',.25],['F4',.25],['D4',2]];
  const B_BAS=[['C3',2.75],['Ab2',2.75],['Bb2',2.75],['Eb3',2.75],['C3',1.75],['Eb3',2],['Ab2',1.25],['G2',1.75],['C3',2.75],['Ab2',2.75],['Bb2',2.75],['G2',2.75]];
  const TRACKS = {
    title:{mel:T_MEL,bas:T_BAS,bpm:66,mT:'sine',bT:'triangle',mV:.12,bV:.08},
    village:{mel:T_MEL,bas:T_BAS,bpm:66,mT:'sine',bT:'triangle',mV:.12,bV:.08},
    forest_south:{mel:F_MEL,bas:F_BAS,bpm:140,mT:'square',bT:'triangle',mV:.08,bV:.06},
    cave:{mel:F_MEL,bas:F_BAS,bpm:120,mT:'triangle',bT:'sine',mV:.07,bV:.05},
    flower_field:{mel:F_MEL,bas:F_BAS,bpm:150,mT:'sine',bT:'triangle',mV:.09,bV:.06},
    forest_north:{mel:F_MEL,bas:F_BAS,bpm:130,mT:'square',bT:'triangle',mV:.07,bV:.05},
    nest:{mel:F_MEL,bas:F_BAS,bpm:135,mT:'triangle',bT:'sine',mV:.08,bV:.06},
    boss:{mel:B_MEL,bas:B_BAS,bpm:108,mT:'sawtooth',bT:'square',mV:.10,bV:.08}
  };
  function initCtx() {
    if (actx) return true;
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return false; }
    masterGain = actx.createGain(); masterGain.gain.value = _vol * 0.3; masterGain.connect(actx.destination);
    melGain = actx.createGain(); melGain.connect(masterGain);
    bassGain = actx.createGain(); bassGain.connect(masterGain);
    return true;
  }
  function resume() { if (actx && actx.state === 'suspended') actx.resume(); }
  function schedNote(freq, start, dur, type, gn, vol) {
    if (!actx || freq <= 0) return;
    var o = actx.createOscillator(), e = actx.createGain();
    o.type = type; o.frequency.value = freq;
    e.gain.setValueAtTime(vol * _vol, start);
    e.gain.exponentialRampToValueAtTime(0.001, start + dur - 0.02);
    o.connect(e); e.connect(gn); o.start(start); o.stop(start + dur);
  }
  function scheduler() {
    if (!playing || !actx) return;
    var tr = TRACKS[currentName]; if (!tr) return;
    var beatDur = 60 / tr.bpm, now = actx.currentTime;
    while (melTime < now + AHEAD) {
      var n = tr.mel[melIdx % tr.mel.length], freq = NF[n[0]] || 0, dur = n[1] * beatDur;
      if (freq > 0) schedNote(freq, melTime, dur * 0.9, tr.mT, melGain, tr.mV);
      melTime += dur; melIdx++;
    }
    while (bassTime < now + AHEAD) {
      var n = tr.bas[bassIdx % tr.bas.length], freq = NF[n[0]] || 0, dur = n[1] * beatDur;
      if (freq > 0) schedNote(freq, bassTime, dur * 0.85, tr.bT, bassGain, tr.bV);
      bassTime += dur; bassIdx++;
    }
  }
  function startChip(name) {
    if (!initCtx()) return; resume();
    if (!TRACKS[name]) return;
    melIdx = 0; bassIdx = 0;
    melTime = actx.currentTime + 0.1; bassTime = actx.currentTime + 0.1;
    playing = true;
    if (schedId) clearInterval(schedId);
    schedId = setInterval(scheduler, 200); scheduler();
  }
  function stopChip() { playing = false; if (schedId) { clearInterval(schedId); schedId = null; } }
  function startMp3(name, fadeIn) {
    mp3Audio = new window.Audio('assets/music/' + name + '.mp3');
    mp3Audio.loop = true;
    var target = _vol * 0.3;
    if (fadeIn) {
      mp3Audio.volume = 0; mp3Audio.play().catch(function(){});
      var step = 0.05, inc = target / Math.max(1, fadeIn / step);
      var iv = setInterval(function() {
        if (!mp3Audio) { clearInterval(iv); return; }
        mp3Audio.volume = Math.min(target, mp3Audio.volume + inc);
        if (mp3Audio.volume >= target - 0.001) { mp3Audio.volume = target; clearInterval(iv); }
      }, step * 1000);
    } else { mp3Audio.volume = target; mp3Audio.play().catch(function(){}); }
  }
  function stopMp3(fadeDur, cb) {
    if (!mp3Audio) { if (cb) cb(); return; }
    if (!fadeDur) { mp3Audio.pause(); mp3Audio.currentTime = 0; mp3Audio = null; if (cb) cb(); return; }
    var step = 0.05, steps = Math.max(1, fadeDur / step), dec = mp3Audio.volume / steps;
    if (mp3Fading) clearInterval(mp3Fading);
    mp3Fading = setInterval(function() {
      if (!mp3Audio) { clearInterval(mp3Fading); mp3Fading = null; if (cb) cb(); return; }
      mp3Audio.volume = Math.max(0, mp3Audio.volume - dec);
      if (mp3Audio.volume <= 0.001) {
        clearInterval(mp3Fading); mp3Fading = null;
        mp3Audio.pause(); mp3Audio.currentTime = 0; mp3Audio = null; if (cb) cb();
      }
    }, step * 1000);
  }
  function play(name, fadeIn) {
    if (currentName === name) return;
    var doStart = function() {
      currentName = name;
      if (useChip) { startChip(name); } else { startMp3(name, fadeIn); }
    };
    if (currentName) { stop(0.8, doStart); } else { doStart(); }
  }
  function stop(fadeDur, cb) { stopChip(); stopMp3(fadeDur, function() { currentName = ''; if (cb) cb(); }); }
  function fadeOut(dur, cb) { stop(dur, cb); }
  function setVolume(v) {
    _vol = Math.max(0, Math.min(1, v));
    try { localStorage.setItem('mipurin_bgmvol', _vol); } catch(e) {}
    if (masterGain) masterGain.gain.value = _vol * 0.3;
    if (mp3Audio) mp3Audio.volume = _vol * 0.3;
  }
  function getVolume() { return _vol; }
  function setChipMode(on) {
    var was = useChip; useChip = !!on;
    try { localStorage.setItem('mipurin_chipbgm', useChip ? '1' : '0'); } catch(e) {}
    if (was !== useChip && currentName) { var name = currentName; stop(0.5, function() { play(name); }); }
  }
  function isChipMode() { return useChip; }
  try { useChip = localStorage.getItem('mipurin_chipbgm') === '1'; } catch(e) {}
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) { if (playing) { clearInterval(schedId); schedId = null; } }
    else { if (playing && !schedId) { schedId = setInterval(scheduler, 200); scheduler(); } }
  });
  return { play:play, stop:stop, fadeOut:fadeOut, setVolume:setVolume, getVolume:getVolume, setChipMode:setChipMode, isChipMode:isChipMode, resume:resume };
})();
let currentBGM = '';
function playBGM(name, fadeIn) { ChipBGM.play(name, fadeIn); currentBGM = name; }
function stopBGM(fadeDur, cb) { ChipBGM.stop(fadeDur, function() { currentBGM = ''; if (cb) cb(); }); }
function fadeOutBGM(dur, cb) { ChipBGM.fadeOut(dur, function() { currentBGM = ''; if (cb) cb(); }); }
