const VERSION = 'v6.17.0a';
/*============================================================
  ミプリンの冒険 v6.10 — かわいい蜂の冒険RPG
  明るいテーマ・日本語UI・プロローグ・BGM対応
  1280x960, 64px tiles, Canvas 2D
============================================================*/

// ===== SPRITE LOADER (Sprite Processor JSON compatible) =====
const SpriteLoader = {
  cache: {},
  async load(jsonPath) {
    const res = await fetch(jsonPath);
    const data = await res.json();
    const img = new Image();
    const dir = jsonPath.substring(0, jsonPath.lastIndexOf('/') + 1);
    await new Promise((ok, ng) => { img.onload = ok; img.onerror = ng; img.src = dir + data.image; });
    data._img = img;
    this.cache[data.name] = data;
    return data;
  },
  getAnim(name, animName) {
    const d = this.cache[name];
    if (!d || !d.animations[animName]) return null;
    return d.animations[animName];
  },
  drawFrame(ctx, name, frameIdx, x, y, w, h) {
    const d = this.cache[name];
    if (!d) return false;
    const f = d.frames[frameIdx];
    if (!f) return false;
    ctx.drawImage(d._img, f.sx, f.sy, f.sw, f.sh, x, y, w, h);
    return true;
  }
};

// ===== CONSTANTS =====
const CW = 1280, CH = 960, TILE = 64, COLS = 20, ROWS = 15;

// ===== CANVAS =====
const cvs = document.getElementById('c'), ctx = cvs.getContext('2d');
const DPR = window.devicePixelRatio || 1;
cvs.width = CW * DPR;
cvs.height = CH * DPR;
cvs.style.width = '';
cvs.style.height = '';
ctx.scale(DPR, DPR);
ctx.imageSmoothingEnabled = false;


// ===== UI TEXT SYSTEM =====

// ===== INPUT =====
const keys = {}, pressed = {};
window.addEventListener('keydown', e => { if (['F12','F5','F11'].includes(e.code) || e.ctrlKey || e.metaKey) return; if (!keys[e.code]) pressed[e.code] = true; keys[e.code] = true; e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.code] = false; });
function isDown(c) { return !!keys[c] }
function wasPressed(c) { const v = !!pressed[c]; pressed[c] = false; return v }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v }
function rectOverlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y }

// ===== AUDIO (Chip-tune via Web Audio) =====
const Audio = (() => {
  let actx = null;
  function init() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {} } if (actx && actx.state === 'suspended') actx.resume(); }
  let masterVol = 0.7;
  try { const sv = localStorage.getItem('mipurin_vol'); if (sv !== null) masterVol = parseFloat(sv); } catch(e) {}
  function setVol(v) { masterVol = clamp(v, 0, 1); try { localStorage.setItem('mipurin_vol', masterVol); } catch(e) {} }
  function getVol() { return masterVol; }
  function play(freq, dur, type, vol) {
    init(); if (!actx) return;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime((vol || 0.1) * masterVol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  }
  function playNoise(dur, vol) {
    init(); if (!actx) return;
    const sr = actx.sampleRate, len = sr * dur;
    const buf = actx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
    const src = actx.createBufferSource(), g = actx.createGain();
    src.buffer = buf;
    g.gain.setValueAtTime((vol || 0.08) * masterVol, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    src.connect(g); g.connect(actx.destination); src.start(); src.stop(actx.currentTime + dur);
  }
  return {
    hit() { play(220, 0.1, 'square', 0.12); play(330, 0.08, 'sine', 0.1); play(440, 0.06, 'sine', 0.08); playNoise(0.05, 0.1); },
    hurt() { this.player_hurt(); },
    kill() { this.enemy_die(); },
    dash() { play(300, 0.06, 'triangle', 0.08); },
    blessing() { play(523, 0.15, 'sine', 0.1); play(659, 0.15, 'sine', 0.08); play(784, 0.15, 'sine', 0.06); setTimeout(() => play(1047, 0.2, 'sine', 0.1), 120); setTimeout(() => play(1319, 0.15, 'sine', 0.07), 200); setTimeout(() => play(1568, 0.25, 'sine', 0.05), 300); },
    clear() { play(523, 0.12, 'square', 0.1); play(659, 0.12, 'sine', 0.08); setTimeout(() => play(784, 0.15, 'square', 0.1), 120); setTimeout(() => play(784, 0.15, 'sine', 0.06), 120); setTimeout(() => play(1047, 0.25, 'sine', 0.11), 260); setTimeout(() => play(1319, 0.2, 'sine', 0.07), 300); },
    shop() { play(440, 0.1, 'sine', 0.08); },
    buy() { play(659, 0.08, 'sine', 0.1); play(880, 0.08, 'sine', 0.07); setTimeout(() => play(1047, 0.12, 'sine', 0.09), 70); setTimeout(() => play(1319, 0.15, 'sine', 0.06), 140); },
    drop() { play(500, 0.06, 'triangle', 0.06); },
    game_over() { play(400, 0.3, 'sine', 0.10); play(400, 0.3, 'triangle', 0.06); setTimeout(() => { play(350, 0.25, 'sine', 0.09); play(350, 0.25, 'triangle', 0.05); }, 280); setTimeout(() => { play(280, 0.3, 'sine', 0.08); play(280, 0.3, 'triangle', 0.04); }, 560); setTimeout(() => { play(200, 0.6, 'sine', 0.07); play(200, 0.6, 'triangle', 0.03); }, 880); },
    boss_appear() { play(110, 0.4, 'triangle', 0.10); play(220, 0.4, 'triangle', 0.08); play(165, 0.3, 'sine', 0.06); setTimeout(() => play(82, 0.5, 'triangle', 0.08), 200); setTimeout(() => play(165, 0.5, 'triangle', 0.06), 200); for(var i=0;i<8;i++) setTimeout(((ii)=>()=>play(90+ii*15, 0.07, 'square', 0.03+ii*0.012))(i), 400+i*55); setTimeout(() => { play(110, 0.5, 'triangle', 0.10); play(165, 0.5, 'triangle', 0.06); }, 850); },
    item_get() { play(988, 0.15, 'sine', 0.11); play(784, 0.08, 'sine', 0.07); setTimeout(() => play(1319, 0.2, 'sine', 0.1), 80); setTimeout(() => play(988, 0.1, 'sine', 0.05), 80); },
    level_up() { play(523, 0.12, 'square', 0.1); play(523, 0.12, 'sine', 0.06); setTimeout(() => play(587, 0.1, 'square', 0.1), 90); setTimeout(() => play(659, 0.12, 'square', 0.1), 180); setTimeout(() => play(659, 0.12, 'sine', 0.06), 180); setTimeout(() => play(784, 0.14, 'square', 0.11), 280); setTimeout(() => play(784, 0.14, 'sine', 0.07), 280); setTimeout(() => play(1047, 0.3, 'sine', 0.12), 400); setTimeout(() => play(1319, 0.25, 'sine', 0.08), 420); },
    door_open() { play(250, 0.12, 'triangle', 0.1); play(375, 0.1, 'sine', 0.06); setTimeout(() => play(500, 0.15, 'sine', 0.09), 100); setTimeout(() => play(750, 0.2, 'sine', 0.07), 200); },
    menu_move() { play(580, 0.06, 'square', 0.08); },
    menu_select() { play(784, 0.08, 'sine', 0.1); play(1047, 0.06, 'sine', 0.07); setTimeout(() => play(1319, 0.1, 'sine', 0.08), 60); },
    dialog_open() { play(392, 0.1, 'sine', 0.08); play(523, 0.08, 'sine', 0.05); setTimeout(() => play(659, 0.12, 'sine', 0.07), 70); },
    dialog_close() { play(659, 0.08, 'sine', 0.07); play(523, 0.06, 'sine', 0.04); setTimeout(() => play(392, 0.1, 'sine', 0.06), 60); },
    player_hurt() { play(300, 0.15, 'triangle', 0.10); play(700, 0.05, 'sine', 0.08); setTimeout(() => play(500, 0.08, 'sine', 0.06), 50); setTimeout(() => play(200, 0.1, 'triangle', 0.04), 100); },
    enemy_die() { play(523, 0.08, 'sine', 0.11); play(659, 0.08, 'sine', 0.09); setTimeout(() => play(784, 0.1, 'sine', 0.08), 50); setTimeout(() => play(1047, 0.12, 'sine', 0.06), 110); setTimeout(() => play(1568, 0.08, 'sine', 0.04), 160); },
    setVol, getVol,
    attack() { play(400, 0.12, 'triangle', 0.09); play(520, 0.10, 'sine', 0.07); play(650, 0.06, 'sine', 0.05); setTimeout(() => play(300, 0.08, 'triangle', 0.04), 50); },
    voice_attack() { play(880, 0.08, 'sine', 0.07); play(1100, 0.06, 'sine', 0.05); setTimeout(() => play(1320, 0.05, 'sine', 0.04), 40); },
    voice_hurt() { play(600, 0.1, 'sine', 0.08); play(400, 0.12, 'sine', 0.06); setTimeout(() => play(300, 0.08, 'sine', 0.04), 60); },
    voice_kill() { play(800, 0.06, 'sine', 0.06); play(1000, 0.08, 'sine', 0.07); setTimeout(() => play(1200, 0.1, 'sine', 0.06), 50); setTimeout(() => play(1500, 0.08, 'sine', 0.04), 100); },
    voice_boss_kill() { play(700, 0.1, 'sine', 0.08); play(900, 0.1, 'sine', 0.07); setTimeout(() => play(1100, 0.12, 'sine', 0.08), 80); setTimeout(() => play(1400, 0.15, 'sine', 0.07), 160); setTimeout(() => play(1800, 0.12, 'sine', 0.05), 260); }
  };
})();


let bgmVolume = 0.7, seVolume = 0.7;
try { const bv = localStorage.getItem('mipurin_bgmvol'); if (bv !== null) bgmVolume = parseFloat(bv); } catch(e) {}
try { const sv = localStorage.getItem('mipurin_sevol'); if (sv !== null) seVolume = parseFloat(sv); } catch(e) {}
function setBgmVol(v) { bgmVolume = clamp(v,0,1); try{localStorage.setItem('mipurin_bgmvol',bgmVolume);}catch(e){} if(typeof ChipBGM!=='undefined') ChipBGM.setVolume(bgmVolume); }
// SE volume controls chip-tune master; BGM volume controls bgmAudio separately
function setSeVol(v) { seVolume = clamp(v,0,1); try{localStorage.setItem('mipurin_sevol',seVolume);}catch(e){} Audio.setVol(seVolume); }

let titleVolSel = -1;
let weaponPopup = { active: false, weapon: null, sparkle: false };
let titleGuard = 0;

// === Mouse state (Sprint G) ===
const mouse = { x: 0, y: 0, down: false, clicked: false, dragItem: null, dragFrom: null };
function screenToCanvasMouse(ex, ey) {
  const rect = cvs.getBoundingClientRect();
  return { x: (ex - rect.left) / rect.width * CW, y: (ey - rect.top) / rect.height * CH };
}
cvs.addEventListener('mousedown', e => {
  const p = screenToCanvasMouse(e.clientX, e.clientY);
  mouse.x = p.x; mouse.y = p.y; mouse.down = true; mouse.clicked = true;
});
cvs.addEventListener('mousemove', e => {
  const p = screenToCanvasMouse(e.clientX, e.clientY);
  mouse.x = p.x; mouse.y = p.y;
});
cvs.addEventListener('mouseup', e => {
  const p = screenToCanvasMouse(e.clientX, e.clientY);
  mouse.x = p.x; mouse.y = p.y; mouse.down = false;
});
window.addEventListener('mouseup', () => { mouse.down = false; });
cvs.addEventListener('mouseleave', () => { mouse.down = false; });
// === End Mouse state ===

let cutinTimer = 0, cutinBossId = '', cutinPhase = 'none', lastBossId = '';


