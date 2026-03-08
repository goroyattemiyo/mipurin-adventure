'use strict';
/*============================================================
  ミプリンの冒険 v5.0 — かわいい蜂の冒険RPG
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
  function play(freq, dur, type, vol) {
    init();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'square'; o.frequency.value = freq;
    g.gain.setValueAtTime(vol || 0.1, actx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  }
  return {
    hit() { play(220, 0.1, 'square', 0.12); play(330, 0.08, 'sine', 0.1); play(440, 0.06, 'sine', 0.08); },
    hurt() { play(100, 0.15, 'sawtooth', 0.15); },
    kill() { play(400, 0.1, 'square', 0.1); play(600, 0.15, 'square', 0.08); },
    dash() { play(300, 0.06, 'triangle', 0.08); },
    blessing() { play(523, 0.15, 'sine', 0.1); play(659, 0.15, 'sine', 0.08); play(784, 0.15, 'sine', 0.06); setTimeout(() => play(1047, 0.2, 'sine', 0.1), 120); setTimeout(() => play(1319, 0.15, 'sine', 0.07), 200); setTimeout(() => play(1568, 0.25, 'sine', 0.05), 300); },
    clear() { play(523, 0.12, 'square', 0.1); play(659, 0.12, 'sine', 0.08); setTimeout(() => play(784, 0.15, 'square', 0.1), 120); setTimeout(() => play(784, 0.15, 'sine', 0.06), 120); setTimeout(() => play(1047, 0.25, 'sine', 0.11), 260); setTimeout(() => play(1319, 0.2, 'sine', 0.07), 300); },
    shop() { play(440, 0.1, 'sine', 0.08); },
    buy() { play(659, 0.08, 'sine', 0.1); play(880, 0.08, 'sine', 0.07); setTimeout(() => play(1047, 0.12, 'sine', 0.09), 70); setTimeout(() => play(1319, 0.15, 'sine', 0.06), 140); },
    drop() { play(500, 0.06, 'triangle', 0.06); },
    game_over() { play(200, 0.35, 'sawtooth', 0.13); play(200, 0.35, 'sine', 0.07); setTimeout(() => { play(160, 0.3, 'sawtooth', 0.11); play(160, 0.3, 'sine', 0.06); }, 280); setTimeout(() => { play(100, 0.4, 'sawtooth', 0.1); play(100, 0.4, 'sine', 0.05); }, 560); setTimeout(() => { play(55, 0.8, 'sawtooth', 0.09); play(55, 0.8, 'sine', 0.04); }, 880); },
    boss_appear() { play(82, 0.4, 'sawtooth', 0.12); play(87, 0.4, 'sawtooth', 0.1); play(110, 0.3, 'square', 0.06); setTimeout(() => play(62, 0.5, 'sawtooth', 0.1), 200); setTimeout(() => play(66, 0.5, 'sawtooth', 0.08), 200); for(var i=0;i<8;i++) setTimeout(((ii)=>()=>play(90+ii*15, 0.07, 'square', 0.03+ii*0.012))(i), 400+i*55); setTimeout(() => { play(50, 0.7, 'sawtooth', 0.13); play(55, 0.7, 'sawtooth', 0.08); }, 850); },
    item_get() { play(988, 0.15, 'sine', 0.11); play(784, 0.08, 'sine', 0.07); setTimeout(() => play(1319, 0.2, 'sine', 0.1), 80); setTimeout(() => play(988, 0.1, 'sine', 0.05), 80); },
    level_up() { play(523, 0.12, 'square', 0.1); play(523, 0.12, 'sine', 0.06); setTimeout(() => play(587, 0.1, 'square', 0.1), 90); setTimeout(() => play(659, 0.12, 'square', 0.1), 180); setTimeout(() => play(659, 0.12, 'sine', 0.06), 180); setTimeout(() => play(784, 0.14, 'square', 0.11), 280); setTimeout(() => play(784, 0.14, 'sine', 0.07), 280); setTimeout(() => play(1047, 0.3, 'sine', 0.12), 400); setTimeout(() => play(1319, 0.25, 'sine', 0.08), 420); },
    door_open() { play(250, 0.12, 'triangle', 0.1); play(375, 0.1, 'sine', 0.06); setTimeout(() => play(500, 0.15, 'sine', 0.09), 100); setTimeout(() => play(750, 0.2, 'sine', 0.07), 200); },
    menu_move() { play(580, 0.06, 'square', 0.08); },
    menu_select() { play(784, 0.08, 'sine', 0.1); play(1047, 0.06, 'sine', 0.07); setTimeout(() => play(1319, 0.1, 'sine', 0.08), 60); },
    dialog_open() { play(392, 0.1, 'sine', 0.08); play(523, 0.08, 'sine', 0.05); setTimeout(() => play(659, 0.12, 'sine', 0.07), 70); },
    dialog_close() { play(659, 0.08, 'sine', 0.07); play(523, 0.06, 'sine', 0.04); setTimeout(() => play(392, 0.1, 'sine', 0.06), 60); },
    player_hurt() { play(90, 0.2, 'sawtooth', 0.12); play(700, 0.05, 'sine', 0.1); setTimeout(() => play(500, 0.08, 'sine', 0.07), 50); setTimeout(() => play(60, 0.15, 'sawtooth', 0.05), 100); },
    enemy_die() { play(523, 0.08, 'sine', 0.11); play(659, 0.08, 'sine', 0.09); setTimeout(() => play(784, 0.1, 'sine', 0.08), 50); setTimeout(() => play(1047, 0.12, 'sine', 0.06), 110); },
    attack() { play(160, 0.18, 'sawtooth', 0.11); play(240, 0.14, 'square', 0.09); play(320, 0.08, 'sine', 0.06); setTimeout(() => play(120, 0.12, 'triangle', 0.05), 60); }
  };
})();

// ===== BGM SYSTEM =====
let bgmAudio = null, currentBGM = '';
function playBGM(name) {
  if (currentBGM === name) return;
  stopBGM();
  currentBGM = name;
  bgmAudio = new window.Audio('assets/music/' + name + '.mp3');
  bgmAudio.loop = true; bgmAudio.volume = 0.3;
  bgmAudio.play().catch(() => {});
}
function stopBGM() {
  if (bgmAudio) { bgmAudio.pause(); bgmAudio.currentTime = 0; bgmAudio = null; }
  currentBGM = '';
}

// ===== HIT STOP SYSTEM =====
let hitStopTimer = 0;
// ===== COLLECTION (図鑑) =====
const collection = {};
function recordEnemy(name, defeated) {
  if (!collection[name]) collection[name] = { seen: 0, defeated: 0 };
  collection[name].seen++;
  if (defeated) collection[name].defeated++;
}

// ===== INVENTORY SCREEN =====
let inventoryOpen = false, inventoryTab = 0;
function drawInventory() {
  if (!inventoryOpen) return;
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, CW, CH);
  const tabs = ['持ち物', '図鑑'];
  for (let i = 0; i < tabs.length; i++) {
    const tx = CW / 2 - 120 + i * 240, ty = 60;
    ctx.fillStyle = inventoryTab === i ? '#ffd700' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(tx - 80, ty - 20, 160, 40);
    ctx.fillStyle = inventoryTab === i ? '#000' : '#fff';
    ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(tabs[i], tx, ty + 7);
  }
  ctx.textAlign = 'left';
  if (inventoryTab === 0) drawInventoryItems();
  else drawCollectionTab();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('← → でタブ切替  /  TAB で閉じる', CW / 2, CH - 30);
  ctx.textAlign = 'left';
}
function drawInventoryItems() {
  const lx = 120, ly = 140;
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ステータス', lx, ly);
  ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  const stats = ['HP: ' + player.hp + ' / ' + player.maxHp, 'ATK: ' + Math.ceil(player.atk * (player.weapon.dmgMul || 1)), '速度: ' + player.speed, 'フロア: ' + floor, 'スコア: ' + score, '花粉: ' + pollen];
  for (let i = 0; i < stats.length; i++) ctx.fillText(stats[i], lx + 20, ly + 40 + i * 30);
  const wx = CW / 2 + 40, wy = 140;
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('武器', wx, wy);
  ctx.fillStyle = player.weapon.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('⚔ ' + player.weapon.name, wx + 20, wy + 40);
  ctx.fillStyle = '#ccc'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ダメージ倍率: x' + (player.weapon.dmgMul || 1).toFixed(1), wx + 20, wy + 65);
  ctx.fillText('射程: ' + player.weapon.range, wx + 20, wy + 85);
    // Weapon slots
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('【おきにいり】', wx + 20, wy + 115);
    const w0 = player.weapons[0];
    if (w0) { ctx.fillStyle = w0.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(w0.name + ' (ATKx' + (w0.dmgMul||1).toFixed(1) + ' 射程' + w0.range + ')', wx + 30, wy + 135); }
    ctx.fillStyle = '#aaa'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('【もうひとつ】', wx + 20, wy + 160);
    const w1 = player.weapons[1];
    if (w1) { ctx.fillStyle = w1.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(w1.name + ' (ATKx' + (w1.dmgMul||1).toFixed(1) + ' 射程' + w1.range + ')', wx + 30, wy + 180); }
    else { ctx.fillStyle = '#666'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('- なし -', wx + 30, wy + 180); }
  ctx.fillText('速度: ' + player.weapon.speed.toFixed(2) + 's', wx + 20, wy + 105);
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('祝福', wx, wy + 150);
  if (activeBlessings.length === 0) { ctx.fillStyle = '#888'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('なし', wx + 20, wy + 185); }
  else { for (let i = 0; i < activeBlessings.length; i++) { const b = activeBlessings[i]; ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.icon + ' ' + b.name, wx + 20, wy + 185 + i * 28); ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.desc, wx + 50, wy + 200 + i * 28); } }
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('アイテム', lx, ly + 280);
  for (let i = 0; i < 3; i++) {
    const sx = lx + 30 + i * 80, sy = ly + 320;
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(sx, sy, 28, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText('[' + (i + 1) + ']', sx, sy + 46);
    if (player.consumables && player.consumables[i]) { ctx.fillStyle = '#fff'; ctx.font = "40px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(player.consumables[i].icon, sx, sy + 8); }
    else { ctx.fillStyle = '#555'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('空', sx, sy + 5); }
    ctx.textAlign = 'left';
  }
}
function drawCollectionTab() {
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('🌸 花の国のいきもの図鑑', 120, 140);
  const names = Object.keys(collection);
  if (names.length === 0) { ctx.fillStyle = '#888'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('まだ誰にも会っていないよ…冒険に出かけよう！', 140, 200); return; }
  // 敵定義からloreを引く
  const allDefs = Object.values(ENEMY_DEFS);
  for (let i = 0; i < names.length; i++) {
    const c = collection[names[i]];
    const row = i;
    const ey = 180 + row * 70;
    if (ey > CH - 80) break; // 画面外防止
    // 敵の色を探す
    const def = allDefs.find(d => d.name === names[i]) || {};
    ctx.fillStyle = def.color || '#fff';
    ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(names[i], 140, ey);
    ctx.fillStyle = '#ccc'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('遭遇: ' + c.seen + '  撃破: ' + c.defeated, 340, ey);
    if (def.lore && c.defeated > 0) {
      ctx.fillStyle = '#999'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(def.lore, 160, ey + 22);
    } else if (c.defeated === 0) {
      ctx.fillStyle = '#666'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('??? （倒すと情報が解放されるよ）', 160, ey + 22);
    }
  }
}




// ===== PALETTE =====
const COL = { bg: '#a8d5ba', wall: '#6b8f71', floor: '#c8e6c9', floorAlt: '#b2dfb5',
  player: '#ffd700', playerOutline: '#b8860b',
  hp: '#e74c3c', hpBg: '#ddd', hpLost: '#c0392b',
  text: '#333', clear: '#2ecc71', dmg: '#e74c3c',
  dash: 'rgba(255,215,0,0.4)', attack: 'rgba(255,200,50,0.5)',
  telegraph: 'rgba(255,0,0,0.2)',
  bless: '#ffd700', blessBox: 'rgba(255,255,255,0.95)',
  pollen: '#f1c40f', pollenBg: 'rgba(255,255,255,0.7)' };

// ===== SEEDED RNG =====
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
let rng = mulberry32(Date.now());

// ===== PARTICLES =====
const particles = [];
function emitParticles(x, y, color, count, spd, life) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2, s = Math.random() * spd;
    particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: life || 0.4, maxLife: life || 0.4, color, size: 2 + Math.random() * 3 });
  }
}
function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}
function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

// ===== ROOM GENERATION =====
// ===== ROOM TEMPLATES (Sprint 2) =====
// 0=floor, 1=wall, 2=spike
let roomSpikes = [];
const THEME_TEMPLATES = {
  forest:  ['open', 'circular', 'L_shape'],
  cave:    ['maze', 'L_shape', 'cross'],
  flower:  ['open', 'circular', 'open'],
  abyss:   ['maze', 'cross', 'L_shape'],
  ruins:   ['cross', 'L_shape', 'circular']
};
const PC = 10, PR = 7;
function safeZone(c, r) { return Math.abs(c - PC) < 3 && Math.abs(r - PR) < 3; }

function floodFill(map) {
  const visited = new Uint8Array(COLS * ROWS);
  const queue = [PR * COLS + PC]; visited[PR * COLS + PC] = 1; let count = 0;
  while (queue.length > 0) {
    const idx = queue.shift(); const c = idx % COLS, r = Math.floor(idx / COLS); count++;
    for (const [dc, dr] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nc = c+dc, nr = r+dr;
      if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
        const ni = nr * COLS + nc;
        if (!visited[ni] && map[ni] !== 1) { visited[ni] = 1; queue.push(ni); }
      }
    }
  }
  let total = 0; for (let i = 0; i < map.length; i++) if (map[i] !== 1) total++;
  return count >= total;
}

function setBlock(map, c, r) {
  for (const [bc, br] of [[c,r],[c+1,r],[c,r+1],[c+1,r+1]]) {
    if (bc > 0 && bc < COLS-1 && br > 0 && br < ROWS-1 && !safeZone(bc,br)) map[br*COLS+bc] = 1;
  }
}

function applyTemplate(map, name, floor) {
  if (name === 'open') {
    const cnt = 2 + Math.min(floor, 4); const placed = [];
    for (let i = 0; i < cnt; i++) {
      let pc, pr, tries = 0;
      do { pc = 2+Math.floor(rng()*(COLS-4)); pr = 2+Math.floor(rng()*(ROWS-4)); tries++; }
      while (tries < 50 && (placed.some(p => Math.abs(p[0]-pc)<3 && Math.abs(p[1]-pr)<3) || safeZone(pc,pr)));
      if (tries < 50) { placed.push([pc,pr]); setBlock(map,pc,pr); }
    }
  } else if (name === 'maze') {
    const segs = 3 + Math.floor(rng()*3);
    for (let i = 0; i < segs; i++) {
      const horiz = rng() > 0.5, len = 3+Math.floor(rng()*3);
      const sc = 2+Math.floor(rng()*(COLS-6)), sr = 2+Math.floor(rng()*(ROWS-6));
      for (let j = 0; j < len; j++) {
        const c = horiz ? sc+j : sc, r = horiz ? sr : sr+j;
        if (c>0 && c<COLS-1 && r>0 && r<ROWS-1 && !safeZone(c,r)) map[r*COLS+c] = 1;
      }
      const mid = Math.floor(len/2);
      const gc = horiz ? sc+mid : sc, gr = horiz ? sr : sr+mid;
      if (gc>0 && gc<COLS-1 && gr>0 && gr<ROWS-1) map[gr*COLS+gc] = 0;
    }
  } else if (name === 'circular') {
    const cx = Math.floor(COLS/2), cy = Math.floor(ROWS/2), rx = 5, ry = 4;
    for (let r = 1; r < ROWS-1; r++) for (let c = 1; c < COLS-1; c++) {
      const dx = (c-cx)/rx, dy = (r-cy)/ry, dist = dx*dx + dy*dy;
      if (dist > 0.65 && dist < 1.3 && !safeZone(c,r)) map[r*COLS+c] = 1;
    }
    for (let d = -1; d <= 1; d++) {
      if (cy+d>0 && cy+d<ROWS-1) { map[(cy+d)*COLS+(cx-rx)] = 0; map[(cy+d)*COLS+(cx+rx)] = 0; }
      if (cx+d>0 && cx+d<COLS-1) { map[(cy-ry)*COLS+cx+d] = 0; map[(cy+ry)*COLS+cx+d] = 0; }
    }
  } else if (name === 'L_shape') {
    const quads = [[2,2],[12,2],[2,9],[12,9]];
    const qi = Math.floor(rng()*3), q = quads[qi<2?qi:3];
    const bx=q[0], by=q[1], bw=3+Math.floor(rng()*2), bh=2+Math.floor(rng()*2);
    for (let r=by; r<by+bh && r<ROWS-1; r++)
      for (let c=bx; c<bx+bw && c<COLS-1; c++) if (!safeZone(c,r)) map[r*COLS+c]=1;
    if (rng()>0.5) {
      for (let r=by+bh; r<by+bh+3 && r<ROWS-1; r++)
        for (let c=bx; c<bx+2 && c<COLS-1; c++) if (!safeZone(c,r)) map[r*COLS+c]=1;
    } else {
      for (let r=by; r<by+2 && r<ROWS-1; r++)
        for (let c=bx+bw; c<bx+bw+3 && c<COLS-1; c++) if (!safeZone(c,r)) map[r*COLS+c]=1;
    }
    const opp = quads[qi<2?3-qi:0];
    setBlock(map, opp[0]+Math.floor(rng()*2), opp[1]+Math.floor(rng()*2));
  } else if (name === 'cross') {
    const cx = Math.floor(COLS/2), cy = Math.floor(ROWS/2);
    for (let c=cx-6; c<=cx+6; c++)
      if (c>0 && c<COLS-1 && !safeZone(c,cy) && (c-cx+6)%4!==0) map[cy*COLS+c]=1;
    for (let r=cy-4; r<=cy+4; r++)
      if (r>0 && r<ROWS-1 && !safeZone(cx,r) && (r-cy+4)%4!==0) map[r*COLS+cx]=1;
    for (let r=cy-1; r<=cy+1; r++)
      for (let c=cx-1; c<=cx+1; c++) if (r>0 && c>0) map[r*COLS+c]=0;
  }
}

function generateRoom(floor) {
  const themeName = getTheme(floor).name;
  const templates = THEME_TEMPLATES[themeName] || ['open'];
  const pick = isBossFloor() ? 'open' : templates[Math.floor(rng()*templates.length)];
  for (let attempt = 0; attempt < 5; attempt++) {
    const map = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (r===0||r===ROWS-1||c===0||c===COLS-1) { map.push(1); continue; } map.push(0);
    }
    applyTemplate(map, pick, floor);
    roomSpikes = [];
    if (floor >= 4 && !isBossFloor()) {
      const maxSp = Math.min(2 + Math.floor((floor-3)*1.5), 10);
      for (let i = 0; i < maxSp; i++) {
        let sc, sr, tries = 0;
        do { sc=2+Math.floor(rng()*(COLS-4)); sr=2+Math.floor(rng()*(ROWS-4)); tries++; }
        while (tries<30 && (map[sr*COLS+sc]!==0 || safeZone(sc,sr)));
        if (tries<30 && map[sr*COLS+sc]===0) { map[sr*COLS+sc]=2; roomSpikes.push({c:sc,r:sr}); }
      }
    }
    if (floodFill(map)) return map;
  }
  const map = [];
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    if (r===0||r===ROWS-1||c===0||c===COLS-1) map.push(1); else map.push(0);
  }
  roomSpikes = []; return map;
}
function tileAt(map, c, r) { if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return 1; return map[r * COLS + c]; }

// ===== THEMES =====
const THEMES = [
  { name: 'forest', bg: '#a8d5ba', wall: '#6b8f71', floor: '#c8e6c9', floorAlt: '#b2dfb5', wallTop: '#7da882', bgm: 'forest_south' },
  { name: 'cave', bg: '#b0c4de', wall: '#708090', floor: '#c5d3e0', floorAlt: '#b8c8d8', wallTop: '#8a9aaa', bgm: 'cave' },
  { name: 'flower', bg: '#fce4ec', wall: '#e91e63', floor: '#f8bbd0', floorAlt: '#f48fb1', wallTop: '#ec407a', bgm: 'flower_field' },
  { name: 'abyss', bg: '#e8eaf6', wall: '#5c6bc0', floor: '#c5cae9', floorAlt: '#b3b9e0', wallTop: '#7986cb', bgm: 'forest_north' },
  { name: 'ruins', bg: '#fff3e0', wall: '#ff9800', floor: '#ffe0b2', floorAlt: '#ffcc80', wallTop: '#ffa726', bgm: 'nest' }];
function getTheme(floor) { return THEMES[(floor - 1) % THEMES.length]; }

// ===== WEAPONS =====
const WEAPON_DEFS = [
  { id: 'needle', name: '\ud83d\udc1d 蜂の針', dmgMul: 1, range: 64, speed: 0.18, dur: 0.15, desc: 'ミプリンの初期装備！素早い3連撃', color: '#ffd700', fx: 'double' },
  { id: 'honey_cannon', name: '\ud83c\udf6f 蜜砲', dmgMul: 1.5, range: 108, speed: 0.5, dur: 0.2, desc: '甘い蜜の弾を飛ばす遠距離武器', color: '#f0a030', fx: 'none' },
  { id: 'pollen_shield', name: '\ud83d\udee1\ufe0f 花粉盾', dmgMul: 0.8, range: 52, speed: 0.35, dur: 0.15, desc: 'カウンター！パリィで2倍反撃', color: '#f1c40f', fx: 'none' },
  { id: 'vine_whip', name: '\ud83c\udf3f 蔦鞭', dmgMul: 0.7, range: 84, speed: 0.4, dur: 0.18, desc: '広範囲なぎ払い＋毒付与', color: '#27ae60', fx: '360' },
  { id: 'feather_shuriken', name: '\ud83e\udeb6 羽根手裏剣', dmgMul: 0.5, range: 76, speed: 0.12, dur: 0.08, desc: '連射！小さな羽が追尾する', color: '#87ceeb', fx: 'double' },
  { id: 'queen_staff', name: '\ud83d\udc51 女王の杖', dmgMul: 2.0, range: 68, speed: 0.65, dur: 0.25, desc: 'チャージで範囲爆発！最強武器', color: '#e040fb', fx: 'aoe' }];


// ===== WEAPON COLLECTION =====
let weaponCollection = new Set();
function saveCollection() { try { localStorage.setItem('mipurin_weaponcol', JSON.stringify([...weaponCollection])); } catch(e) {} }
function loadCollection() { try { const d = localStorage.getItem('mipurin_weaponcol'); if (d) weaponCollection = new Set(JSON.parse(d)); } catch(e) {} }
loadCollection();
// Record initial weapon
weaponCollection.add(WEAPON_DEFS[0].id); saveCollection();

// ===== CONSUMABLES =====
const CONSUMABLE_DEFS = [
  { id: 'honey_drop', name: '🍯 はちみつドロップ', desc: 'HP+3', icon: '🍯', msg: 'あまくておいしい！', apply: () => { player.hp = Math.min(player.hp + 3, player.maxHp); } },
  { id: 'spicy_pollen', name: '🌶️ ピリカラ花粉', desc: '8秒ATK+2', icon: '🌶️', msg: 'からい！でもちからがわく！', apply: () => { player.atk += 2; setTimeout(() => { player.atk = Math.max(1, player.atk - 2); }, 8000); } },
  { id: 'royal_jelly', name: '✨ ロイヤルゼリー', desc: '3秒無敵', icon: '✨', msg: '女王さまのちから…！', apply: () => { player.invTimer = 3.0; } }
];
// [REMOVED] old consumableMsg - replaced by msgQueue
// ===== DROPS =====
const drops = [];
function spawnDrop(x, y, type) {
  drops.push({ x, y, type, life: 8, bobTimer: 0 });
}
function updateDrops(dt) {
  for (let i = drops.length - 1; i >= 0; i--) {
    const d = drops[i]; d.life -= dt; d.bobTimer += dt;
    if (d.life <= 0) { drops.splice(i, 1); continue; }
    const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
    const magR = player.magnetRange || 0;
    if (magR > 0 && Math.hypot(d.x - (player.x + player.w/2), d.y - (player.y + player.h/2)) < magR) {
      const mdx = player.x + player.w/2 - d.x, mdy = player.y + player.h/2 - d.y;
      const md = Math.hypot(mdx, mdy) || 1;
      d.x += (mdx / md) * 200 * dt; d.y += (mdy / md) * 200 * dt;
    }
    const db = { x: d.x - 8, y: d.y - 8, w: 16, h: 16 };
    if (rectOverlap(pb, db)) {
      if (d.type === 'pollen') { const amt = 1 + Math.floor(floor / 3); pollen += amt; Audio.item_get(); showFloat('\uD83C\uDF3C \u82B1\u7C89 +' + amt, 1.2, '#f1c40f'); }
      if (d.type === 'heal') { player.hp = Math.min(player.hp + 1, player.maxHp); emitParticles(d.x, d.y, '#2ecc71', 6, 60, 0.3); showFloat('\uD83C\uDF6F HP+1', 1.2, '#2ecc71'); }
      drops.splice(i, 1);
    }
  }
}
function drawDrops() {
  for (const d of drops) {
    const bob = Math.sin(d.bobTimer * 4) * 3;
    ctx.globalAlpha = d.life < 2 ? d.life / 2 : 1;
    // Try sprite icon first
    if (hasSprite('drop_' + d.type) && drawSpriteImg('drop_' + d.type, d.x - 12, d.y + bob - 12, 24, 24)) {
      ctx.globalAlpha = 1; continue;
    }
    // Fallback canvas shapes
    if (d.type === 'pollen') {
      ctx.fillStyle = COL.pollen; ctx.beginPath(); ctx.arc(d.x, d.y + bob, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(d.x - 2, d.y + bob - 2, 2, 0, Math.PI * 2); ctx.fill();
    }
    if (d.type === 'heal') {
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(d.x - 2, d.y + bob - 6, 4, 12); ctx.fillRect(d.x - 6, d.y + bob - 2, 12, 4);
    }
    ctx.globalAlpha = 1;
  }
}


// ===== NODE SELECT SYSTEM (フロア間選択画面) =====
const NODE_TYPES = [
  { id: 'battle',  icon: '⚔',  name: 'バトル',       desc: '敵と戦う。祝福を獲得', color: '#e74c3c', weight: 40 },
  { id: 'elite',   icon: '💀', name: 'エリート戦',   desc: '強敵！レア祝福確定',   color: '#8e44ad', weight: 15 },
  { id: 'shop',    icon: '🏪', name: 'ショップ',     desc: '花粉でお買い物',       color: '#f39c12', weight: 15 },
  { id: 'rest',    icon: '🌿', name: 'きゅうけい',   desc: 'HP30%回復',            color: '#2ecc71', weight: 15 },
  { id: 'event',   icon: '❓', name: 'イベント',     desc: '何が起こるかな…？',    color: '#3498db', weight: 15 }
];

const EVENT_POOL = [
  { text: '倒れたミツバチを見つけた…',
    a: { label: 'たすける (HP-1)', apply() { player.hp = Math.max(1, player.hp - 1); showFloat('ありがとう…これを…', 2, MSG_COLORS.heal); activeBlessings.push(pickBlessings()[0]); } },
    b: { label: 'とおりすぎる', apply() { showFloat('…見なかったことにした', 2, MSG_COLORS.info); } } },
  { text: 'きらきら光る花粉のみずうみ！',
    a: { label: 'つかる (HP+2, 花粉-5)', apply() { if (pollen >= 5) { pollen -= 5; player.hp = Math.min(player.hp + 2, player.maxHp); showFloat('きもちいい～！', 2, MSG_COLORS.heal); } else { showFloat('花粉がたりない…', 2, MSG_COLORS.warn); } } },
    b: { label: 'のまない', apply() { pollen += 3; showFloat('花粉を3つひろった', 2, MSG_COLORS.info); } } },
  { text: 'あやしいキノコが生えている…',
    a: { label: 'たべる', apply() { if (Math.random() > 0.4) { player.atk += 1; showFloat('ちからがみなぎる！ATK+1', 2, MSG_COLORS.buff); } else { player.hp = Math.max(1, player.hp - 2); showFloat('おなかが…HP-2', 2, MSG_COLORS.warn); } } },
    b: { label: 'やめておく', apply() { showFloat('けんめいな判断だ', 2, MSG_COLORS.info); } } },
  { text: 'こわれたハチの巣箱を見つけた',
    a: { label: 'なおす (花粉-8)', apply() { if (pollen >= 8) { pollen -= 8; player.maxHp += 1; player.hp += 1; showFloat('最大HP+1！', 2, MSG_COLORS.heal); } else { showFloat('花粉がたりない…', 2, MSG_COLORS.warn); } } },
    b: { label: 'そのままにする', apply() { pollen += 2; showFloat('ちかくで花粉を2つ見つけた', 2, MSG_COLORS.info); } } },
  { text: '花の精霊のささやきが聞こえる…',
    a: { label: 'みみをすます', apply() { const b = pickBlessings()[0]; activeBlessings.push(b); b.apply(); showFloat(b.icon + ' ' + b.name + ' を授かった！', 2, MSG_COLORS.buff); } },
    b: { label: 'いそぐ', apply() { player.speed += 15; showFloat('足が軽くなった！速度UP', 2, MSG_COLORS.buff); } } }
];

let nodeChoices = [], nodeCursor = 0, currentEvent = null, eventPhase = 'choose';

function generateNodes() {
  nodeChoices = []; nodeCursor = 0;
  // ボスフロアの次は必ず戦闘を含める
  const totalWeight = NODE_TYPES.reduce((s, n) => s + n.weight, 0);
  const pick = () => {
    let r = Math.random() * totalWeight, acc = 0;
    for (const n of NODE_TYPES) { acc += n.weight; if (r < acc) return {...n}; }
    return {...NODE_TYPES[0]};
  };
  // 3択生成（重複IDを避ける）
  const used = new Set();
  for (let i = 0; i < 3; i++) {
    let node, tries = 0;
    do { node = pick(); tries++; } while (used.has(node.id) && tries < 20);
    used.add(node.id);
    nodeChoices.push(node);
  }
}

function executeNode(node) {
  if (node.id === 'battle') {
    gameState = 'blessing'; blessingChoices = pickBlessings();
  } else if (node.id === 'elite') {
    // エリート: 次フロアの敵を強化して祝福確定
    gameState = 'blessing'; blessingChoices = pickBlessings();
    // エリートボーナス: レア祝福を混ぜる
    showFloat('💀 エリートクリア！レア祝福！', 2, MSG_COLORS.boss);
  } else if (node.id === 'shop') {
    gameState = 'shop'; buildShop();
  } else if (node.id === 'rest') {
    const heal = Math.max(1, Math.ceil(player.maxHp * 0.3));
    player.hp = Math.min(player.hp + heal, player.maxHp);
    emitParticles(player.x + player.w/2, player.y + player.h/2, '#2ecc71', 15, 80, 0.5);
    showFloat('🌿 HP ' + heal + ' 回復！', 2, MSG_COLORS.heal);
    Audio.blessing();
    nextFloor();
  } else if (node.id === 'event') {
    currentEvent = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
    eventPhase = 'choose';
    nodeCursor = 0;
    gameState = 'event';
  }
}

// ===== STATE =====
let roomMap = [], floor = 1, wave = 0, WAVES = [];
// [REMOVED] old weaponSwapMsg - replaced by msgQueue

// ===== Unified Message Window System =====
let msgQueue = [];        // float messages: [{text, timer, maxTimer, color, icon}]
let dialogMsg = null;     // dialog message: {lines:[], lineIdx:0, charIdx:0, charTimer:0, onDone:null, speaker:''}
let dialogCallback = null;

const MSG_COLORS = { info: '#ffd700', warn: '#ff6b6b', heal: '#2ecc71', buff: '#3498db', boss: '#e74c3c', duo: '#e056fd' };

function showFloat(text, duration, color) {
  duration = duration || 2.0;
  color = color || MSG_COLORS.info;
  msgQueue.push({ text: text, timer: duration, maxTimer: duration, color: color });
  if (msgQueue.length > 4) msgQueue.shift();
}

function showDialog(speaker, lines, onDone) {
  if (typeof lines === 'string') lines = [lines];
  dialogMsg = { speaker: speaker, lines: lines, lineIdx: 0, charIdx: 0, charTimer: 0, done: false };
  dialogCallback = onDone || null;
  Audio.dialog_open();
}

function advanceDialog() {
  if (!dialogMsg) return;
  if (dialogMsg.charIdx < dialogMsg.lines[dialogMsg.lineIdx].length) {
    dialogMsg.charIdx = dialogMsg.lines[dialogMsg.lineIdx].length;
    return;
  }
  dialogMsg.lineIdx++;
  if (dialogMsg.lineIdx >= dialogMsg.lines.length) {
    Audio.dialog_close();
    const cb = dialogCallback;
    dialogMsg = null; dialogCallback = null;
    if (cb) cb();
    return;
  }
  dialogMsg.charIdx = 0; dialogMsg.charTimer = 0;
}

function updateMessages(dt) {
  // Float messages
  for (let i = msgQueue.length - 1; i >= 0; i--) {
    msgQueue[i].timer -= dt;
    if (msgQueue[i].timer <= 0) msgQueue.splice(i, 1);
  }
  // Dialog typewriter
  if (dialogMsg && !dialogMsg.done) {
    dialogMsg.charTimer += dt;
    const charsPerSec = 20;
    const targetChars = Math.floor(dialogMsg.charTimer * charsPerSec);
    if (targetChars > dialogMsg.charIdx) dialogMsg.charIdx = Math.min(targetChars, dialogMsg.lines[dialogMsg.lineIdx].length);
  }
}

function drawFloatMessages() {
  if (msgQueue.length === 0) return;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < msgQueue.length; i++) {
    const m = msgQueue[i];
    const alpha = Math.min(1, m.timer * 2.5);
    const slideY = 80 + i * 40;
    // Background
    ctx.globalAlpha = alpha * 0.85;
    ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    const tw = ctx.measureText(m.text).width + 40;
    const rx = CW / 2 - tw / 2, ry = slideY - 16, rh = 34;
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(rx + 8, ry); ctx.lineTo(rx + tw - 8, ry);
    ctx.quadraticCurveTo(rx + tw, ry, rx + tw, ry + 8);
    ctx.lineTo(rx + tw, ry + rh - 8);
    ctx.quadraticCurveTo(rx + tw, ry + rh, rx + tw - 8, ry + rh);
    ctx.lineTo(rx + 8, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - 8);
    ctx.lineTo(rx, ry + 8);
    ctx.quadraticCurveTo(rx, ry, rx + 8, ry);
    ctx.closePath(); ctx.fill();
    // Gold border
    ctx.strokeStyle = m.color; ctx.lineWidth = 2; ctx.stroke();
    // Text
    ctx.globalAlpha = alpha;
    ctx.fillStyle = m.color; ctx.fillText(m.text, CW / 2, slideY);
  }
  ctx.restore();
}

function drawDialogWindow() {
  if (!dialogMsg) return;
  ctx.save();
  const dw = CW - 160, dh = 120;
  const dx = 80, dy = CH - dh - 40;
  // Background
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = '#0d0d2b'; ctx.fillRect(dx, dy, dw, dh);
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3; ctx.strokeRect(dx, dy, dw, dh);
  // Inner border
  ctx.strokeStyle = 'rgba(255,215,0,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(dx + 6, dy + 6, dw - 12, dh - 12);
  ctx.globalAlpha = 1;
  // Speaker name
  if (dialogMsg.speaker) {
    const nw = ctx.measureText(dialogMsg.speaker).width + 30;
    ctx.fillStyle = '#1a1a3e'; ctx.fillRect(dx + 20, dy - 16, nw, 28);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(dx + 20, dy - 16, nw, 28);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
    ctx.fillText(dialogMsg.speaker, dx + 35, dy + 3);
  }
  // Text with typewriter
  ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
  const line = dialogMsg.lines[dialogMsg.lineIdx];
  const shown = line.substring(0, dialogMsg.charIdx);
  ctx.fillText(shown, dx + 24, dy + 45);
  // Page indicator
  if (dialogMsg.charIdx >= line.length) {
    ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'right';
    const pageText = dialogMsg.lineIdx < dialogMsg.lines.length - 1 ? 'Z: つぎへ ▼' : 'Z: とじる ▼';
    ctx.fillText(pageText, dx + dw - 20, dy + dh - 15);
  }
  // Page count
  if (dialogMsg.lines.length > 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
    ctx.fillText((dialogMsg.lineIdx + 1) + '/' + dialogMsg.lines.length, dx + 24, dy + dh - 15);
  }
  ctx.restore();
}
// ===== End Message System =====

let gameState = 'title', clearTimer = 0, deadTimer = 0, shakeTimer = 0, shakeIntensity = 0, score = 0, pollen = 0;
let fadeAlpha = 0, fadeDir = 0, fadeCallback = null;
let titleBlink = 0;

const player = { x: TILE * 10, y: TILE * 7, w: 52, h: 52, speed: 200, hp: 5, maxHp: 5, atk: 1,
  attacking: false, atkTimer: 0, atkDuration: 0.15, atkCooldown: 0,
  atkDir: { x: 0, y: 1 }, dashing: false, dashTimer: 0, dashDuration: 0.15, dashCooldown: 0,
  dashSpeed: 600, dashDir: { x: 0, y: 0 }, invTimer: 0, invDuration: 0.6, animTimer: 0, frame: 0,
  weapon: WEAPON_DEFS[0], weapons: [WEAPON_DEFS[0], null], weaponIdx: 0, atkRangeBonus: 0, atkSpeedBonus: 0, spriteData: null, consumables: [null, null, null] };

// ===== ENEMIES =====
const enemies = [];
const dmgNumbers = [];
function spawnDmg(x, y, val, color) { dmgNumbers.push({ x, y, val: String(val), color: color || COL.dmg, life: 0.8 }); }

const ENEMY_COLORS = ['#e74c3c', '#8e44ad', '#e67e22', '#3498db', '#1abc9c', '#e84393', '#d35400', '#2c3e50', '#c0392b', '#6c5ce7', '#00b894', '#fd79a8'];

const ENEMY_DEFS = {
  mushroom:  { hp: 3, speed: 55, w: 48, h: 48, dmg: 1, pattern: 'wander', score: 10, color: '#e74c3c', shape: 'mushroom', name: 'どくキノコ', lore: '森にひっそり生える毒キノコ。近づくとふらふら歩いてくる' },
  slime:     { hp: 4, speed: 45, w: 44, h: 36, dmg: 1, pattern: 'wander', score: 10, color: '#2ecc71', shape: 'blob', name: 'はちみつスライム', lore: 'こぼれた蜜から生まれた。ぷるぷるしていてちょっとかわいい' },
  spider:    { hp: 4, speed: 90, w: 48, h: 48, dmg: 1, pattern: 'chase', score: 20, color: '#8e44ad', shape: 'spider', name: 'あみぐもちゃん', lore: '花の国の糸使い。すばしっこくて追いかけてくる！' },
  bat:       { hp: 3, speed: 110, w: 42, h: 42, dmg: 1, pattern: 'chase', score: 15, color: '#34495e', shape: 'bat', name: 'やみコウモリ', lore: '洞窟に住む小さなコウモリ。暗いところが大好き' },
  beetle:    { hp: 6, speed: 50, w: 52, h: 52, dmg: 2, pattern: 'charge', score: 30, color: '#e67e22', shape: 'beetle', name: 'かぶとむしナイト', lore: '立派なツノで突進してくる！赤く光ったら要注意', chargeSpeed: 300, telegraphTime: 0.6, chargeTime: 0.3 },
  wasp:      { hp: 5, speed: 100, w: 48, h: 48, dmg: 2, pattern: 'chase', score: 25, color: '#f1c40f', shape: 'wasp', name: 'わるいハチ', lore: 'ミプリンと違って意地悪なハチ。すごく速い！' },
  flower:    { hp: 7, speed: 0, w: 48, h: 48, dmg: 1, pattern: 'shoot', score: 25, color: '#e84393', shape: 'flower', name: 'パクパクフラワー', lore: '動けないけど花粉弾を飛ばしてくる。きれいだけど危険！', shootInterval: 2.0 },
  worm:      { hp: 8, speed: 35, w: 52, h: 40, dmg: 2, pattern: 'wander', score: 20, color: '#a0522d', shape: 'worm', name: 'もぐもぐイモムシ', lore: 'のんびり屋だけど体が丈夫。踏まないように注意！' },
  ghost:     { hp: 5, speed: 70, w: 48, h: 48, dmg: 1, pattern: 'teleport', score: 30, color: '#bdc3c7', shape: 'ghost', name: 'ひとだまホタル', lore: '消えたり現れたり…幽霊みたいなホタル。つかまえられる？' },
  golem:     { hp: 12, speed: 30, w: 48, h: 48, dmg: 3, pattern: 'charge', score: 40, color: '#7f8c8d', shape: 'golem', name: 'いわいわゴーレム', lore: '岩でできた大きな番人。遅いけどパワーはすごい！', chargeSpeed: 200, telegraphTime: 0.8, chargeTime: 0.4 },
  vine:      { hp: 6, speed: 0, w: 48, h: 48, dmg: 1, pattern: 'shoot', score: 20, color: '#27ae60', shape: 'vine', name: 'つるつるツタ', lore: '地面から生えたツタ。種を飛ばして攻撃してくる', shootInterval: 1.5 },
  darkbee:   { hp: 8, speed: 95, w: 48, h: 48, dmg: 2, pattern: 'chase', score: 35, color: '#2c3e50', shape: 'darkbee', name: 'ダークビー', lore: '闇に染まったミツバチ。かつては仲間だったのかも…' }
};

const THEME_ENEMIES = {
  forest: ['mushroom', 'slime', 'spider', 'bat'],
  cave: ['bat', 'worm', 'beetle', 'golem'],
  flower: ['flower', 'vine', 'wasp', 'slime'],
  abyss: ['ghost', 'darkbee', 'golem', 'spider'],
  ruins: ['beetle', 'worm', 'ghost', 'darkbee']
};

// ===== PROJECTILES =====
const projectiles = [];
function spawnProjectile(x, y, dx, dy, spd, dmg, friendly) {
  if (projectiles.length >= 50) projectiles.shift();
  const d = Math.hypot(dx, dy) || 1;
  projectiles.push({ x, y, vx: (dx / d) * spd, vy: (dy / d) * spd, dmg, friendly: !!friendly, life: 3, size: 8 });
}
function updateProjectiles(dt) {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
    const tc = Math.floor(p.x / TILE), tr = Math.floor(p.y / TILE);
    if (p.life <= 0 || tileAt(roomMap, tc, tr) === 1) { projectiles.splice(i, 1); continue; }
    if (!p.friendly) {
      const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (player.invTimer <= 0 && !player.dashing && rectOverlap(pb, { x: p.x - p.size, y: p.y - p.size, w: p.size * 2, h: p.size * 2 })) {
        player.hp -= p.dmg; player.invTimer = player.invDuration;
        shakeTimer = 0.1; shakeIntensity = 5; Audio.player_hurt();
        spawnDmg(player.x + player.w / 2, player.y, p.dmg, '#fff');
        emitParticles(player.x + player.w / 2, player.y + player.h / 2, '#fff', 4, 80, 0.2);
        if (player.hp <= 0) { gameState = 'dead'; Audio.game_over(); stopBGM(); }
        projectiles.splice(i, 1);
      }
    }
  }
}
function drawProjectiles() {
  for (const p of projectiles) {
    const col = p.friendly ? '#ffd700' : '#e74c3c';
    ctx.fillStyle = p.friendly ? 'rgba(255,215,0,0.2)' : 'rgba(231,76,60,0.2)';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2); ctx.fill();
  }
}

function spawnEnemy(type, col, row) {
  const def = ENEMY_DEFS[type]; if (!def) return;
  const sc = 1 + Math.log2(1 + floor) * 0.35;
  enemies.push({ ...def, type, x: col * TILE + (TILE - def.w) / 2, y: row * TILE + (TILE - def.h) / 2,
    hp: Math.ceil(def.hp * sc), maxHp: Math.ceil(def.hp * sc), dmg: Math.ceil(def.dmg * (floor <= 1 ? 1 : (1 + floor * 0.06))),
    score: Math.ceil(def.score * (1 + floor * 0.05)),
    vx: 0, vy: 0, state: 'idle', stateTimer: 0, wanderDir: { x: 1, y: 0 }, wanderTimer: 0,
    chargeDir: null, telegraphTimer: 0, hitFlash: 0, shootTimer: def.shootInterval || 2 });
}

function randEnemyPos() {
  let c, r, tries = 0;
  do { c = 2 + Math.floor(rng() * (COLS - 4)); r = 2 + Math.floor(rng() * (ROWS - 4)); tries++; }
  while (tries < 30 && (tileAt(roomMap, c, r) === 1 || tileAt(roomMap, c-1, r) === 1 || tileAt(roomMap, c+1, r) === 1 || tileAt(roomMap, c, r-1) === 1 || tileAt(roomMap, c, r+1) === 1 || (Math.abs(c - 10) < 3 && Math.abs(r - 5) < 3)));
  return [c, r];
}

function buildWaves() {
  const th = getTheme(floor);
  let pool = THEME_ENEMIES[th.name] || THEME_ENEMIES.forest;
    if (floor <= 2) pool = ['mushroom', 'slime'];
  const waveCount = Math.min(2 + Math.floor(floor / 2), 5);
  const waves = [];
  for (let w = 0; w < waveCount; w++) {
    const count = Math.min(2 + w + Math.floor(floor / 3), 7);
    const wv = [];
    for (let i = 0; i < count; i++) {
      const ti = Math.floor(rng() * Math.min(2 + w + Math.floor(floor / 2), pool.length));
      const [c, r] = randEnemyPos();
      wv.push({ type: pool[ti], col: c, row: r });
    }
    waves.push(wv);
  }
  return waves;
}

function spawnWave() {
  enemies.length = 0; projectiles.length = 0;
  if (wave < WAVES.length) { for (const e of WAVES[wave]) spawnEnemy(e.type, e.col, e.row); }
}

// ===== BOSS =====
let boss = null;
const BOSS_DEFS = [
  { id: 'queen_hornet', name: 'スズメバチの女王', hp: 30, speed: 70, w: 56, h: 56, dmg: 3, color: '#f39c12', pattern: 'boss_charge', score: 200, phases: 2 },
  { id: 'fungus_king', name: 'キノコの王', hp: 45, speed: 40, w: 64, h: 64, dmg: 2, color: '#e74c3c', pattern: 'boss_shoot', score: 300, phases: 2 },
  { id: 'crystal_golem', name: 'クリスタルゴーレム', hp: 60, speed: 30, w: 64, h: 64, dmg: 4, color: '#3498db', pattern: 'boss_slam', score: 400, phases: 3 },
  { id: 'shadow_moth', name: '闇の蛾', hp: 50, speed: 90, w: 52, h: 52, dmg: 3, color: '#9b59b6', pattern: 'boss_teleport', score: 350, phases: 2 }];

const MAX_FLOOR = 15;
function isBossFloor() { return floor % 3 === 0; }

function spawnBoss() { Audio.boss_appear();
  // Boss dialog will be triggered after spawn
  const bi = Math.floor((floor / 3 - 1) % BOSS_DEFS.length);
  const def = BOSS_DEFS[bi];
  const sc = 1 + floor * 0.12;
  boss = { ...def, x: CW / 2 - def.w / 2, y: TILE * 2, hp: Math.ceil(def.hp * sc), maxHp: Math.ceil(def.hp * sc),
    dmg: Math.ceil(def.dmg * (1 + floor * 0.08)), phase: 1, stateTimer: 0, state: 'idle', hitFlash: 0,
    chargeDir: null, telegraphTimer: 0, shootTimer: 0, slamTimer: 0, teleTimer: 0 };
}

function updateBoss(dt) {
  if (!boss || boss.hp <= 0) return;
  boss.hitFlash = Math.max(0, boss.hitFlash - dt);
  boss.stateTimer += dt;
  const dx = player.x - boss.x, dy = player.y - boss.y, d = Math.hypot(dx, dy) || 1;
  boss.phase = boss.hp < boss.maxHp * 0.3 ? (boss.phases >= 3 ? 3 : 2) : boss.hp < boss.maxHp * 0.6 ? 2 : 1;
  const spdMul = boss.phase >= 2 ? 1.3 : 1;

  if (boss.pattern === 'boss_charge') {
    if (boss.state === 'idle') { moveWithCollision(boss, (dx / d) * boss.speed * spdMul * 0.5 * dt, (dy / d) * boss.speed * spdMul * 0.5 * dt);
      if (boss.stateTimer > (2.5 / spdMul)) { boss.state = 'telegraph'; boss.telegraphTimer = 0.5; boss.chargeDir = { x: dx / d, y: dy / d }; } }
    if (boss.state === 'telegraph') { boss.telegraphTimer -= dt; if (boss.telegraphTimer <= 0) { boss.state = 'charging'; boss.stateTimer = 0; } }
    if (boss.state === 'charging') { moveWithCollision(boss, boss.chargeDir.x * 350 * spdMul * dt, boss.chargeDir.y * 350 * spdMul * dt);
      if (boss.stateTimer > 0.4) { boss.state = 'cooldown'; boss.stateTimer = 0; } }
    if (boss.state === 'cooldown') { if (boss.stateTimer > 0.6) { boss.state = 'idle'; boss.stateTimer = 0; }
      if (boss.phase >= 2 && boss.stateTimer > 0.3) { spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, dx, dy, 150, boss.dmg - 1, false); boss.stateTimer = 0.6; } }
  }
  if (boss.pattern === 'boss_shoot') {
    moveWithCollision(boss, (dx / d) * boss.speed * 0.3 * dt, (dy / d) * boss.speed * 0.3 * dt);
    boss.shootTimer += dt;
    const interval = boss.phase >= 2 ? 0.8 : 1.5;
    if (boss.shootTimer >= interval) { boss.shootTimer = 0;
      const angles = boss.phase >= 2 ? [-0.3, 0, 0.3] : [0];
      for (const a of angles) { const bx = dx / d, by = dy / d; const ca = Math.cos(a), sa = Math.sin(a);
        spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, bx * ca - by * sa, bx * sa + by * ca, 120, boss.dmg - 1, false); } }
  }
  if (boss.pattern === 'boss_slam') {
    if (boss.state === 'idle') { moveWithCollision(boss, (dx / d) * boss.speed * spdMul * dt, (dy / d) * boss.speed * spdMul * dt);
      if (d < 80 || boss.stateTimer > 3) { boss.state = 'telegraph'; boss.telegraphTimer = 0.6; } }
    if (boss.state === 'telegraph') { boss.telegraphTimer -= dt; if (boss.telegraphTimer <= 0) { boss.state = 'slam'; boss.stateTimer = 0;
      shakeTimer = 0.3; shakeIntensity = 8;
      const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (Math.hypot(player.x - boss.x, player.y - boss.y) < 100 && player.invTimer <= 0 && !player.dashing) {
        player.hp -= boss.dmg; player.invTimer = player.invDuration; Audio.player_hurt();
        spawnDmg(player.x + player.w / 2, player.y, boss.dmg, '#fff'); if (player.hp <= 0) { gameState = 'dead'; deadTimer = 0; Audio.game_over(); stopBGM(); } }
      emitParticles(boss.x + boss.w / 2, boss.y + boss.h, '#aaa', 12, 100, 0.4); } }
    if (boss.state === 'slam') { if (boss.stateTimer > 0.8) { boss.state = 'idle'; boss.stateTimer = 0; } }
  }
  if (boss.pattern === 'boss_teleport') {
    moveWithCollision(boss, (dx / d) * boss.speed * spdMul * 0.6 * dt, (dy / d) * boss.speed * spdMul * 0.6 * dt);
    boss.teleTimer += dt; boss.shootTimer += dt;
    if (boss.teleTimer > (boss.phase >= 2 ? 2 : 3)) { boss.teleTimer = 0;
      boss.x = TILE * (2 + Math.floor(rng() * (COLS - 4))); boss.y = TILE * (2 + Math.floor(rng() * (ROWS - 4)));
      while (tileAt(roomMap, Math.floor(boss.x / TILE), Math.floor(boss.y / TILE)) === 1) { boss.x = TILE * (2 + Math.floor(rng() * (COLS - 4))); boss.y = TILE * (2 + Math.floor(rng() * (ROWS - 4))); }
      emitParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.color, 8, 80, 0.3); }
    if (boss.shootTimer > 1) { boss.shootTimer = 0; spawnProjectile(boss.x + boss.w / 2, boss.y + boss.h / 2, dx, dy, 140, boss.dmg - 1, false); }
  }

  // Boss contact damage
  if (player.invTimer <= 0 && !player.dashing) {
    if (rectOverlap({ x: player.x, y: player.y, w: player.w, h: player.h }, { x: boss.x, y: boss.y, w: boss.w, h: boss.h })) {
      player.hp -= boss.dmg; player.invTimer = player.invDuration; shakeTimer = 0.12; shakeIntensity = 6; Audio.player_hurt();
      spawnDmg(player.x + player.w / 2, player.y, boss.dmg, '#fff');
      const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
      moveWithCollision(player, Math.cos(angle) * 40, Math.sin(angle) * 40);
      if (player.hp <= 0) { gameState = 'dead'; deadTimer = 0; Audio.game_over(); stopBGM(); }
    }
  }
}

// ===== BLESSINGS =====
// ===== META PROGRESSION (Sprint 5) =====
let nectar = 0;
let gardenUpgrades = { hp: 0, atk: 0 };
const GARDEN_DEFS = [
  { id: 'hp', name: '🌱 生命の花壇', desc: '初期HP +1', cost: [10, 25, 50, 100, 200], max: 5, icon: '❤️' },
  { id: 'atk', name: '🌹 力の花壇', desc: '初期ATK +1', cost: [15, 35, 70, 140, 250], max: 5, icon: '⚔️' }
];
let gardenCursor = 0;
let runNectar = 0; // nectar earned this run

function saveMeta() {
  try { localStorage.setItem('mipurin_nectar', nectar); localStorage.setItem('mipurin_garden', JSON.stringify(gardenUpgrades)); } catch(e) {}
}
function loadMeta() {
  try {
    const n = localStorage.getItem('mipurin_nectar'); if (n !== null) nectar = parseInt(n) || 0;
    const g = localStorage.getItem('mipurin_garden'); if (g) gardenUpgrades = JSON.parse(g);
  } catch(e) {}
}
loadMeta();

function getGardenCost(id) {
  const def = GARDEN_DEFS.find(d => d.id === id);
  const lv = gardenUpgrades[id] || 0;
  if (lv >= def.max) return -1;
  return def.cost[lv];
}

function applyGardenBonuses() {
  player.maxHp = 7 + (gardenUpgrades.hp || 0);
  player.hp = player.maxHp;
  player.atk = 2 + (gardenUpgrades.atk || 0);
}

const BLESSING_POOL = [
  { id: 'rose_atk', name: '🌹 ローザの力', desc: '攻撃力 +1', icon: '🌹', rarity: 'common', family: 'rose', apply: () => { player.atk += 1; } },
  { id: 'rose_crit', name: '🗡️ ローザの刃', desc: '攻撃力 +2', icon: '🗡️', rarity: 'rare', family: 'rose', apply: () => { player.atk += 2; } },
  { id: 'rose_range', name: '🌹 ローザの蔓', desc: '攻撃範囲 +20', icon: '🌹', rarity: 'rare', family: 'rose', apply: () => { player.atkRangeBonus += 20; } },
  { id: 'rose_vampire', name: '🩸 ローザの渇き', desc: '撃破時HP回復', icon: '🩸', rarity: 'legend', family: 'rose', apply: () => { player.vampiric = true; } },
  { id: 'lily_hp', name: '🤍 リリアの守り', desc: '最大HP +1 & 全回復', icon: '🤍', rarity: 'common', family: 'lily', apply: () => { player.maxHp += 1; player.hp = player.maxHp; } },
  { id: 'lily_shield', name: '🛡️ リリアの結界', desc: '無敵時間 +50%', icon: '🛡️', rarity: 'rare', family: 'lily', apply: () => { player.invDuration *= 1.5; } },
  { id: 'lily_armor', name: '🤍 リリアの鎧', desc: '最大HP +2', icon: '🤍', rarity: 'rare', family: 'lily', apply: () => { player.maxHp += 2; player.hp = Math.min(player.hp + 2, player.maxHp); } },
  { id: 'lily_thorns', name: '🌿 リリアの棘', desc: '被弾時に反撃ダメージ2', icon: '🌿', rarity: 'legend', family: 'lily', apply: () => { player.thorns = 2; } },
  { id: 'sunflower_speed', name: '🌻 ソーレの風', desc: '移動速度 +15%', icon: '🌻', rarity: 'common', family: 'sunflower', apply: () => { player.speed *= 1.15; } },
  { id: 'sunflower_dash', name: '⚡ ソーレの疾走', desc: 'ダッシュCD -40%', icon: '⚡', rarity: 'rare', family: 'sunflower', apply: () => { player.dashCooldown = Math.max(0.1, player.dashCooldown * 0.6); } },
  { id: 'sunflower_atkspd', name: '🌻 ソーレの連撃', desc: '攻撃速度 +25%', icon: '🌻', rarity: 'rare', family: 'sunflower', apply: () => { player.atkSpeedBonus += 0.25; } },
  { id: 'sunflower_burst', name: '☀️ ソーレの閃光', desc: '移動速度+30% & ダッシュCD-30%', icon: '☀️', rarity: 'legend', family: 'sunflower', apply: () => { player.speed *= 1.3; player.dashCooldown = Math.max(0.1, player.dashCooldown * 0.7); } },
  { id: 'wisteria_poison', name: '💜 フジカの毒', desc: '攻撃にダメージ追加 +1', icon: '💜', rarity: 'common', family: 'wisteria', apply: () => { player.atk += 1; } },
  { id: 'wisteria_slow', name: '💜 フジカの霧', desc: '攻撃力+1 & 範囲+10', icon: '💜', rarity: 'rare', family: 'wisteria', apply: () => { player.atk += 1; player.atkRangeBonus += 10; } },
  { id: 'wisteria_web', name: '🕸️ フジカの絡み', desc: '攻撃範囲 +30', icon: '🕸️', rarity: 'rare', family: 'wisteria', apply: () => { player.atkRangeBonus += 30; } },
  { id: 'wisteria_miasma', name: '☠️ フジカの瘴気', desc: '攻撃力+3 & 範囲+15', icon: '☠️', rarity: 'legend', family: 'wisteria', apply: () => { player.atk += 3; player.atkRangeBonus += 15; } },
  { id: 'lotus_heal', name: '🌸 ハスミの癒し', desc: 'HPを全回復', icon: '🌸', rarity: 'common', family: 'lotus', apply: () => { player.hp = player.maxHp; } },
  { id: 'lotus_grace', name: '🌸 ハスミの恩寵', desc: 'HP+2回復 & 無敵+20%', icon: '🌸', rarity: 'rare', family: 'lotus', apply: () => { player.hp = Math.min(player.hp + 2, player.maxHp); player.invDuration *= 1.2; } },
  { id: 'lotus_bloom', name: '🌺 ハスミの開花', desc: '最大HP+1 & 移動速度+10%', icon: '🌺', rarity: 'rare', family: 'lotus', apply: () => { player.maxHp += 1; player.hp = player.maxHp; player.speed *= 1.1; } },
  { id: 'lotus_regen', name: '💖 ハスミの生命力', desc: '最大HP +3 & 全回復', icon: '💖', rarity: 'legend', family: 'lotus', apply: () => { player.maxHp += 3; player.hp = player.maxHp; } },
  { id: 'chrysanth_luck', name: '✨ キクネの幸運', desc: 'ドロップ磁力+80', icon: '✨', rarity: 'common', family: 'chrysanth', apply: () => { player.magnetRange = (player.magnetRange||0) + 80; } },
  { id: 'chrysanth_gold', name: '✨ キクネの黄金', desc: '花粉ドロップ+倍', icon: '✨', rarity: 'rare', family: 'chrysanth', apply: () => { player.pollenBonus = (player.pollenBonus||0) + 1; } },
  { id: 'chrysanth_sight', name: '👁️ キクネの千里眼', desc: '攻撃範囲+15 & 磁力+40', icon: '👁️', rarity: 'rare', family: 'chrysanth', apply: () => { player.atkRangeBonus += 15; player.magnetRange = (player.magnetRange||0) + 40; } },
  { id: 'chrysanth_fortune', name: '🌟 キクネの大福', desc: '磁力+120 & 花粉+倍 & HP+1', icon: '🌟', rarity: 'legend', family: 'chrysanth', apply: () => { player.magnetRange = (player.magnetRange||0) + 120; player.pollenBonus = (player.pollenBonus||0) + 1; player.maxHp += 1; player.hp = player.maxHp; } },
];

// ===== DUO BLESSINGS =====
const DUO_DEFS = [
  { families: ['rose', 'wisteria'], name: '🌹💜 棘毒の共鳴', desc: '攻撃力 +3', apply: () => { player.atk += 3; } },
  { families: ['lily', 'lotus'], name: '🤍🌸 守護の花環', desc: '最大HP+2 & 無敵+30%', apply: () => { player.maxHp += 2; player.hp = player.maxHp; player.invDuration *= 1.3; } },
  { families: ['sunflower', 'rose'], name: '🌻🌹 烈火の追風', desc: '攻撃力+2 & 速度+20%', apply: () => { player.atk += 2; player.speed *= 1.2; } },
  { families: ['wisteria', 'chrysanth'], name: '💜✨ 毒蝶の舞', desc: '攻撃+2 & 磁力+100', apply: () => { player.atk += 2; player.magnetRange = (player.magnetRange||0) + 100; } },
  { families: ['lotus', 'lily'], name: '🌸🤍 不滅の蓮華', desc: '最大HP+3 & 被弾反撃1', apply: () => { player.maxHp += 3; player.hp = player.maxHp; player.thorns = Math.max(player.thorns||0, 1); } },
  { families: ['sunflower', 'chrysanth'], name: '🌻✨ 黄金の収穫', desc: '速度+25% & 花粉+倍 & 磁力+60', apply: () => { player.speed *= 1.25; player.pollenBonus = (player.pollenBonus||0) + 1; player.magnetRange = (player.magnetRange||0) + 60; } }
];
let activeDuos = [];

function checkDuos() {
  const fams = new Set(activeBlessings.map(b => b.family));
  for (const duo of DUO_DEFS) {
    if (activeDuos.some(d => d.name === duo.name)) continue;
    if (duo.families.every(f => fams.has(f))) {
      duo.apply(); activeDuos.push(duo); showFloat('✨ ' + duo.name + ' はつどう！', 3.0, MSG_COLORS.duo);
      spawnDmg(player.x + player.w/2, player.y - 20, 0, '#ffd700');
      emitParticles(player.x + player.w/2, player.y + player.h/2, '#ffd700', 12, 100, 0.5);
      Audio.level_up();
    }
  }
}
let blessingChoices = [], activeBlessings = [], selectCursor = 0;

function pickBlessings() {
  const pool = [...BLESSING_POOL];
  // Weight: common=50, rare=35, epic=15
  const weighted = [];
  for (const b of pool) { const w = b.rarity === 'legend' ? 10 : b.rarity === 'rare' ? 30 : 50; for (let i = 0; i < w; i++) weighted.push(b); }
  const picks = [], used = new Set();
  while (picks.length < 3 && used.size < pool.length) {
    const b = weighted[Math.floor(rng() * weighted.length)];
    if (!used.has(b.id)) { used.add(b.id); picks.push(b); }
  }
  selectCursor = 0;
  return picks;
}

// ===== SHOP =====
let shopItems = [];
function buildShop() {
  shopItems = [];
  // Heal
  shopItems.push({ name: '回復 +2', cost: 3 + floor, icon: '\u2665', action: () => { player.hp = Math.min(player.hp + 2, player.maxHp); } });
  // Consumable shop items
  for (const cdef of CONSUMABLE_DEFS) {
    const baseCost = cdef.id === 'honey_drop' ? 5 : cdef.id === 'spicy_pollen' ? 8 : 12;
    shopItems.push({ name: cdef.name, cost: baseCost + floor, icon: cdef.icon, action: () => {
      // Find empty consumable slot
      const slot = player.consumables.indexOf(null);
      if (slot !== -1) { player.consumables[slot] = {...cdef}; Audio.item_get(); showFloat(cdef.icon + ' ゲット！ ' + (slot+1) + 'キーで使えるよ！', 2.5, MSG_COLORS.info); }
      else { showFloat('アイテム枠がいっぱい！', 2.0, MSG_COLORS.warn); }
    }});
  }
  // Random weapon
  const wep = WEAPON_DEFS[Math.floor(rng() * WEAPON_DEFS.length)];
  shopItems.push({ name: wep.name, cost: 5 + floor * 2, icon: '⚔', desc: wep.desc, action: () => {
      player.weapons[player.weaponIdx] = {...wep}; player.weapon = player.weapons[player.weaponIdx];
      if (typeof weaponCollection !== 'undefined') { weaponCollection.add(wep.id); saveCollection(); }
      Audio.level_up();
    } });
  // Max HP
  shopItems.push({ name: '最大HP +1', cost: 8 + floor * 2, icon: '\u2B06', action: () => { player.maxHp += 1; player.hp += 1; } });
}

// ===== FADE =====
function startFade(dir, cb) { fadeDir = dir; fadeAlpha = dir === 1 ? 0 : 1; fadeCallback = cb; }
function updateFade(dt) {
  if (fadeDir === 0) return;
  fadeAlpha += fadeDir * dt * 3;
  if (fadeDir === 1 && fadeAlpha >= 1) { fadeAlpha = 1; fadeDir = 0; if (fadeCallback) { fadeCallback(); fadeCallback = null; } }
  if (fadeDir === -1 && fadeAlpha <= 0) { fadeAlpha = 0; fadeDir = 0; }
}

// ===== GAME FLOW =====
function startFloor() {
  rng = mulberry32(Date.now() + floor);
  roomSpikes = []; roomMap = generateRoom(floor);
  if (isBossFloor()) { boss = null; enemies.length = 0; projectiles.length = 0; drops.length = 0; spawnBoss(); WAVES = []; wave = 0;
    // Boss entrance dialog
    const bossLines = {
      'queen_hornet': ['ブンブンブン…… ここはわたしの巣よ！', 'ミプリンなんかに まけないわ！'],
      'fungus_king': ['フフフ…… キノコの胞子が おまえをつつむ……', 'ここから先は とおさないぞ！'],
      'crystal_golem': ['…………ゴゴゴ……', 'このクリスタルのかたさ、ためしてみるか？'],
      'shadow_moth': ['ヒラヒラ…… やみのなかへ おいで……', 'わたしの はやさに ついてこれるかしら？']
    };
    if (boss) {
      gameState = 'dialog';
      const bl = bossLines[boss.id] || [boss.name + ' があらわれた！'];
      showDialog(boss.name, bl, function() { gameState = 'playing'; });
    }
  }
  else { boss = null; WAVES = buildWaves(); wave = 0; drops.length = 0; spawnWave(); }
  player.x = TILE * 10; player.y = TILE * 7;
  player.invTimer = 0; player.attacking = false; player.atkCooldown = 0;
  player.dashing = false; player.dashCooldown = 0;
  dmgNumbers.length = 0; particles.length = 0;
  gameState = 'playing'; clearTimer = 0; deadTimer = 0;
  if (isBossFloor()) { showFloat('⚠ ボスフロア！ きをつけて！', 2.5, MSG_COLORS.boss); }
  else { const tn = getTheme(floor).name || ''; showFloat('🌿 フロア ' + floor + (tn ? ' — ' + tn : ''), 2.5, MSG_COLORS.info); }
  const floorTheme = getTheme(floor);
  if (floorTheme.bgm) playBGM(floorTheme.bgm);
  if (isBossFloor()) playBGM('boss');
  startFade(-1, null);
}

function nextFloor() { floor++; startFade(1, () => startFloor()); }

const mipurinImg = new Image(); mipurinImg.src = 'assets/mipurin.png';
let mipurinReady = false; mipurinImg.onload = () => { mipurinReady = true; console.log('mipurin.png loaded'); };

// ===== SPRITE ENGINE (Individual PNG) =====
const SPRITE_MAP = {
  // Enemies
  mushroom: 'assets/sprites/enemy_mushroom.webp',
  slime: 'assets/sprites/enemy_slime.webp',
  spider: 'assets/sprites/enemy_spider.webp',
  bat: 'assets/sprites/enemy_bat.webp',
  beetle: 'assets/sprites/enemy_beetle.webp',
  wasp: 'assets/sprites/enemy_wasp.webp',
  flower: 'assets/sprites/enemy_flower.webp',
  worm: 'assets/sprites/enemy_worm.webp',
  ghost: 'assets/sprites/enemy_ghost.webp',
  golem: 'assets/sprites/enemy_golem.webp',
  vine: 'assets/sprites/enemy_vine.webp',
  darkbee: 'assets/sprites/enemy_darkbee.webp',
  // Aliases (shape name -> sprite)
  blob: 'assets/sprites/enemy_slime.webp',
  // Bosses
  queen_hornet: 'assets/sprites/boss_queen_hornet.webp',
  fungus_king: 'assets/sprites/boss_fungus_king.webp',
  crystal_golem: 'assets/sprites/boss_crystal_golem.webp',
  shadow_moth: 'assets/sprites/boss_shadow_moth.webp',
  // Items & drops
  drop_pollen: 'assets/sprites/drop_pollen.webp',
  drop_heal: 'assets/sprites/drop_heal.webp',
  // Consumables
  consumable_honey: 'assets/sprites/consumable_honey.webp',
  consumable_spicy: 'assets/sprites/consumable_spicy.webp',
  consumable_royal: 'assets/sprites/consumable_royal.webp',
  // Weapons
  weapon_needle: 'assets/sprites/weapon_needle.webp',
  weapon_honey_cannon: 'assets/sprites/weapon_honey_cannon.webp',
  weapon_pollen_shield: 'assets/sprites/weapon_pollen_shield.webp',
  weapon_vine_whip: 'assets/sprites/weapon_vine_whip.webp',
  weapon_feather_shuriken: 'assets/sprites/weapon_feather_shuriken.webp',
  weapon_queen_staff: 'assets/sprites/weapon_queen_staff.webp'
};

const spriteCache = {};
let spritesLoaded = 0;
let spritesTotal = 0;

function loadAllSprites() {
  const keys = Object.keys(SPRITE_MAP);
  spritesTotal = keys.length;
  keys.forEach(id => {
    const img = new Image();
    img.onload = () => {
      spriteCache[id] = img;
      spritesLoaded++;
      if (spritesLoaded >= spritesTotal) console.log('All ' + spritesTotal + ' sprites loaded!');
    };
    img.onerror = () => {
      spritesLoaded++;
    };
    img.src = SPRITE_MAP[id];
  });
}

function hasSprite(id) { return !!spriteCache[id]; }

function drawSpriteImg(id, x, y, w, h) {
  const img = spriteCache[id];
  if (!img) return false;
  // Maintain aspect ratio: fit inside w x h, center, scale up 20%
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const scale = Math.min(w / iw, h / ih) * 1.2;
  const dw = iw * scale, dh = ih * scale;
  const dx = x + (w - dw) / 2, dy = y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
  return true;
}

// Enemy idle bob animation (code-based)
function getEnemyBob(e) {
  if (!e._bobOffset) e._bobOffset = Math.random() * Math.PI * 2;
  return Math.sin(Date.now() / 400 + e._bobOffset) * 2;
}

// Boss phase visual effects (code-based)
function drawBossPhaseEffect(b) {
  if (b.phase >= 2) {
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = b.phase >= 3 ? '#ff0000' : '#ff6600';
    ctx.beginPath(); ctx.arc(b.x + b.w/2, b.y + b.h/2, b.w * 0.7, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

loadAllSprites();
// ===== END SPRITE ENGINE =====

const MIPURIN_FRAMES = {
  down:  { sx: 0,   sy: 0,   sw: 250, sh: 250 },
  up:    { sx: 250, sy: 0,   sw: 250, sh: 250 },
  left:  { sx: 250, sy: 250, sw: 250, sh: 250 },
  right: { sx: 0,   sy: 250, sw: 250, sh: 250 }
};
function getPlayerDir() {
  const ax = player.atkDir.x, ay = player.atkDir.y;
  if (Math.abs(ax) > Math.abs(ay)) return ax > 0 ? 'right' : 'left';
  return ay < 0 ? 'up' : 'down';
}


// ===== PROLOGUE (OPENING) =====
const prologueImages = [];
let prologueLoaded = 0;
for (let i = 1; i <= 10; i++) {
  const img = new Image();
  img.onload = () => { prologueLoaded++; };
  img.src = 'assets/prologue/prologue_' + String(i).padStart(2, '0') + '.webp';
  prologueImages.push(img);
}
const prologueTexts = [
  'ある日、花の国に異変が起きた…',
  '花粉が枯れ、虫たちは元気をなくしていった',
  '小さなミツバチのミプリンは決意した',
  '「わたしが花粉を取り戻す！」',
  '冒険の旅が、今はじまる──',
  ''
];
let prologuePage = 0, prologueTimer = 0, prologueFade = 0, prologueGuard = 0;

function drawPrologue() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CW, CH);
  const img = prologueImages[prologuePage];
  if (img && img.complete) {
    const scale = Math.min(CW / img.width, CH / img.height) * 0.75;
    const iw = img.width * scale, ih = img.height * scale;
    ctx.globalAlpha = Math.min(prologueFade, 1);
    ctx.drawImage(img, (CW - iw) / 2, (CH - ih) / 2 - 60, iw, ih);
    ctx.globalAlpha = 1;
  }
  const txt = prologueTexts[prologuePage] || '';
  if (txt) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, CH - 160, CW, 160);
    ctx.fillStyle = '#fff';
    ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(txt, CW / 2, CH - 80);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('Zキーで次へ  /  Xキーでスキップ', CW / 2, CH - 20);
  ctx.textAlign = 'left';
}

function updatePrologue(dt) {
  prologueFade += dt * 2;
  prologueTimer += dt;
  if (prologueGuard > 0) { prologueGuard -= dt; wasPressed('KeyZ'); wasPressed('KeyX'); return; }
  if (wasPressed('KeyX')) {
    stopBGM();
    resetGame();
    return;
  }
  if (wasPressed('KeyZ') || prologueTimer > 6) {
    prologuePage++;
    prologueFade = 0;
    prologueTimer = 0;
    if (prologuePage >= prologueTexts.length) {
      stopBGM();
      resetGame();
    }
  }
}

function resetGame() {
  floor = 1; wave = 0; score = 0; pollen = 0; boss = null; runNectar = 0;
  player.hp = 5; player.maxHp = 5; player.atk = 1; player.speed = 200;
  player.invDuration = 0.6; player.dashCooldown = 0; player.atkRangeBonus = 0;
  player.weapon = WEAPON_DEFS[0]; player.weapons = [WEAPON_DEFS[0], null]; player.weaponIdx = 0; player.atkSpeedBonus = 0; player.vampiric = false; player.thorns = 0; player.magnetRange = 0; player.consumables = [null, null, null];
  activeBlessings = []; activeDuos = []; drops.length = 0; projectiles.length = 0; particles.length = 0;
  applyGardenBonuses();
  startFade(1, () => startFloor());
}

// ===== COLLISION =====
function moveWithCollision(ent, dx, dy) {
  let nx = ent.x + dx, bl = false;
  let c0 = Math.floor(nx / TILE), c1 = Math.floor((nx + ent.w - 1) / TILE);
  let r0 = Math.floor(ent.y / TILE), r1 = Math.floor((ent.y + ent.h - 1) / TILE);
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) if (tileAt(roomMap, c, r) === 1) bl = true;
  if (!bl) ent.x = nx;
  let ny = ent.y + dy; bl = false;
  let c2 = Math.floor(ent.x / TILE), c3 = Math.floor((ent.x + ent.w - 1) / TILE);
  let r2 = Math.floor(ny / TILE), r3 = Math.floor((ny + ent.h - 1) / TILE);
  for (let r = r2; r <= r3; r++) for (let c = c2; c <= c3; c++) if (tileAt(roomMap, c, r) === 1) bl = true;
  if (!bl) ent.y = ny;
}

function getAttackBox() {
  const range = (player.weapon.range || 44) + (player.atkRangeBonus || 0);
  const ax = player.atkDir.x, ay = player.atkDir.y;
  return { x: player.x + player.w / 2 + ax * 24 - range / 2, y: player.y + player.h / 2 + ay * 24 - range / 2, w: range, h: range };
}

// ===== UPDATE =====
function update(dt) {
  updateFade(dt);
  updateMessages(dt);

  if (gameState === 'ending') {
    if (wasPressed('KeyZ')) { nectar += runNectar; saveMeta(); stopBGM(); gameState = 'title'; floor = 1; resetGame(); }
    return;
  }
  if (gameState === 'title') { titleBlink += dt;
    if (wasPressed('KeyZ')) { prologuePage = 0; prologueFade = 0; prologueTimer = 0; prologueGuard = 0.3; playBGM('forest_south'); gameState = 'prologue'; }
    if (wasPressed('KeyX')) { gameState = 'garden'; gardenCursor = 0; Audio.menu_select(); }
    return; }
  if (gameState === 'garden') {
    if (wasPressed('ArrowUp') || wasPressed('KeyW')) { gardenCursor = Math.max(0, gardenCursor - 1); Audio.menu_move(); }
    if (wasPressed('ArrowDown') || wasPressed('KeyS')) { gardenCursor = Math.min(GARDEN_DEFS.length - 1, gardenCursor + 1); Audio.menu_move(); }
    if (wasPressed('KeyZ')) {
      const def = GARDEN_DEFS[gardenCursor];
      const cost = getGardenCost(def.id);
      if (cost > 0 && nectar >= cost) { nectar -= cost; gardenUpgrades[def.id] = (gardenUpgrades[def.id]||0) + 1; saveMeta(); Audio.level_up(); }
      else { Audio.hit(); }
    }
    if (wasPressed('KeyX') || wasPressed('Escape')) { gameState = 'title'; Audio.menu_select(); }
    return; }
  if (gameState === 'prologue') { updatePrologue(dt); return; }
  // Inventory toggle
  if (wasPressed('Tab')) { inventoryOpen = !inventoryOpen; if (!inventoryOpen) inventoryTab = 0; }
  if (inventoryOpen) {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) inventoryTab = 0;
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) inventoryTab = 1;
    return;
  }
  // Dialog state - pause game, Z to advance
  if (gameState === 'dialog') {
    if (wasPressed('KeyZ') || wasPressed('Enter')) { advanceDialog(); }
    return;
  }
  if (gameState === 'blessing') {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { selectCursor = (selectCursor - 1 + blessingChoices.length) % blessingChoices.length; Audio.menu_move(); }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) { selectCursor = (selectCursor + 1) % blessingChoices.length; Audio.menu_move(); }
    if (wasPressed('Digit1') && blessingChoices[0]) { selectCursor = 0; }
    if (wasPressed('Digit2') && blessingChoices[1]) { selectCursor = 1; }
    if (wasPressed('Digit3') && blessingChoices[2]) { selectCursor = 2; }
    if ((wasPressed('KeyZ') || wasPressed('Enter')) && blessingChoices[selectCursor]) {
      const chosenB = blessingChoices[selectCursor]; chosenB.apply(); activeBlessings.push(chosenB); checkDuos(); Audio.level_up(); showFloat(chosenB.icon + ' ' + chosenB.name + ' はつどう！', 2.5, MSG_COLORS.info); nextFloor(); }
    return;
  }
  if (gameState === 'shop') {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { selectCursor = (selectCursor - 1 + (shopItems.length + 1)) % (shopItems.length + 1); Audio.menu_move(); }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) { selectCursor = (selectCursor + 1) % (shopItems.length + 1); Audio.menu_move(); }
    if (wasPressed('ArrowUp') || wasPressed('KeyW')) { selectCursor = Math.max(0, selectCursor - 3); Audio.menu_move(); }
    if (wasPressed('ArrowDown') || wasPressed('KeyS')) { selectCursor = Math.min(shopItems.length, selectCursor + 3); Audio.menu_move(); }
    for (let i = 0; i < shopItems.length; i++) {
      if (wasPressed('Digit' + (i + 1))) { selectCursor = i; }
    }
    if ((wasPressed('KeyZ') || wasPressed('Enter')) && selectCursor < shopItems.length && pollen >= shopItems[selectCursor].cost) {
      pollen -= shopItems[selectCursor].cost; shopItems[selectCursor].action(); Audio.menu_select(); shopItems.splice(selectCursor, 1);
      selectCursor = Math.min(selectCursor, shopItems.length); }
    if (wasPressed('Escape') || wasPressed('KeyX') || (selectCursor >= shopItems.length && (wasPressed('KeyZ') || wasPressed('Enter')))) {
      blessingChoices = pickBlessings(); selectCursor = 0;
      gameState = 'dialog';
      showDialog('ミプリン', ['祝福の花が咲いた！ ひとつ えらんでね！'], function() { gameState = 'blessing'; });
    }
    return;
  }
  if (gameState === 'waveWait') { clearTimer += dt; if (clearTimer > 1.0) { spawnWave(); gameState = 'playing'; } return; }
  if (gameState === 'floorClear') { clearTimer += dt; if (clearTimer > 1.5) {
      if (floor >= MAX_FLOOR && isBossFloor()) { stopBGM(); playBGM('ending'); gameState = 'ending'; return; }
    generateNodes(); gameState = 'nodeSelect';
  } return; }
  if (gameState === 'nodeSelect') {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { nodeCursor = (nodeCursor + 2) % 3; Audio.menu_move(); }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) { nodeCursor = (nodeCursor + 1) % 3; Audio.menu_move(); }
    if (wasPressed('KeyZ')) { Audio.menu_select(); executeNode(nodeChoices[nodeCursor]); }
    return;
  }
  if (gameState === 'event') {
    if (eventPhase === 'choose') {
      if (wasPressed('ArrowUp') || wasPressed('KeyW')) { nodeCursor = 0; Audio.menu_move(); }
      if (wasPressed('ArrowDown') || wasPressed('KeyS')) { nodeCursor = 1; Audio.menu_move(); }
      if (wasPressed('KeyZ')) {
        Audio.menu_select();
        if (nodeCursor === 0) currentEvent.a.apply();
        else currentEvent.b.apply();
        eventPhase = 'done';
      }
    } else if (eventPhase === 'done') {
      if (wasPressed('KeyZ')) { nextFloor(); }
    }
    return;
  }

  if (gameState === 'dead') { deadTimer += dt; if (deadTimer > 2.0 && wasPressed('KeyZ')) { nectar += runNectar; saveMeta(); stopBGM(); gameState = 'title'; floor = 1; resetGame(); } return; }
    if (gameState === 'weaponDrop' && weaponPopup.active) {
      // Z: equip as main
      if (wasPressed('KeyZ')) {
        const w = {...weaponPopup.weapon};
        if (weaponPopup.sparkle) w.dmgMul = (w.dmgMul || 1) + 0.2;
        player.weapons[player.weaponIdx] = w; player.weapon = w;
        if (typeof weaponCollection !== 'undefined') weaponCollection.add(w.id);
        saveCollection();
        Audio.level_up(); weaponPopup.active = false; gameState = 'playing';
      }
      // Q: put in sub slot
      if (wasPressed('KeyQ')) {
        const w = {...weaponPopup.weapon};
        if (weaponPopup.sparkle) w.dmgMul = (w.dmgMul || 1) + 0.2;
        const subIdx = 1 - player.weaponIdx;
        player.weapons[subIdx] = w;
        if (typeof weaponCollection !== 'undefined') weaponCollection.add(w.id);
        saveCollection();
        showFloat(w.name + ' をサブにセット！ Qで持ちかえ！', 2.5, MSG_COLORS.buff);
        Audio.level_up(); weaponPopup.active = false; gameState = 'playing';
      }
      // X: discard
      if (wasPressed('KeyX')) { Audio.menu_move(); weaponPopup.active = false; gameState = 'playing'; }
      return;
    }

  // === Consumable use (1/2/3) ===
  for (let ci = 0; ci < 3; ci++) {
    if (wasPressed('Digit' + (ci + 1)) && player.consumables[ci]) {
      const item = player.consumables[ci];
      item.apply();
      showFloat(item.msg, 2.5, MSG_COLORS.info);
      emitParticles(player.x + player.w/2, player.y + player.h/2, '#fff', 6, 60, 0.3);
      Audio.item_get();
      player.consumables[ci] = null;
    }
  }

  // === Weapon swap (Q key) ===
  if (wasPressed('KeyQ') && player.weapons[1] !== null) {
    player.weaponIdx = 1 - player.weaponIdx;
    player.weapon = player.weapons[player.weaponIdx];
    Audio.menu_select();
    spawnDmg(player.x + player.w/2, player.y - 10, 0, '#ffd700');
    showFloat('ぶんぶん♪ ' + player.weapon.name, 1.5, MSG_COLORS.info);
  }

  // === Player movement ===
  let mx = 0, my = 0;
  if (isDown('ArrowLeft') || isDown('KeyA')) mx -= 1;
  if (isDown('ArrowRight') || isDown('KeyD')) mx += 1;
  if (isDown('ArrowUp') || isDown('KeyW')) my -= 1;
  if (isDown('ArrowDown') || isDown('KeyS')) my += 1;
  if (mx !== 0 && my !== 0) { mx *= 0.707; my *= 0.707; }
  if (mx !== 0 || my !== 0) {
    player.atkDir.x = Math.sign(mx || 0); player.atkDir.y = Math.sign(my || 0);
    if (mx !== 0) player.atkDir.y = 0; if (my !== 0 && mx === 0) player.atkDir.x = 0;
  }

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  // Spike damage (トゲ床) - dash makes you immune
  if (!player.dashing && player.invTimer <= 0) {
    const spc = Math.floor((player.x + player.w/2) / TILE);
    const spr = Math.floor((player.y + player.h/2) / TILE);
    if (spc >= 0 && spc < COLS && spr >= 0 && spr < ROWS && roomMap[spr * COLS + spc] === 2) {
      player.hp -= 1; player.invTimer = player.invDuration;
      Audio.player_hurt();
      emitParticles(player.x + player.w/2, player.y + player.h/2, '#ff4444', 5, 80, 0.3);
      showFloat('いたっ！ トゲ床だ！', 1.5, MSG_COLORS.warn);
      if (player.hp <= 0) { gameState = 'dead'; Audio.game_over(); stopBGM(); }
    }
  }
  if (player.dashing) { player.dashTimer -= dt; if (player.dashTimer <= 0) player.dashing = false;
    else moveWithCollision(player, player.dashDir.x * player.dashSpeed * dt, player.dashDir.y * player.dashSpeed * dt); }
  else {
    if (wasPressed('KeyX') && player.dashCooldown <= 0) {
      player.dashing = true; player.dashTimer = player.dashDuration; player.dashCooldown = 0.5;
      player.dashDir.x = (mx !== 0 || my !== 0) ? mx : player.atkDir.x;
      player.dashDir.y = (mx !== 0 || my !== 0) ? my : player.atkDir.y; player.invTimer = player.dashDuration; Audio.dash();
      emitParticles(player.x + player.w / 2, player.y + player.h / 2, COL.player, 5, 60, 0.2);
    }
    if (!player.dashing && !player.attacking) moveWithCollision(player, mx * player.speed * dt, my * player.speed * dt);
  }

  // === Attack ===
  player.atkCooldown = Math.max(0, player.atkCooldown - dt);
  if (wasPressed('KeyZ') && player.atkCooldown <= 0 && !player.attacking && !player.dashing) {
    player.attacking = true; player.atkTimer = player.weapon.dur; player.atkCooldown = player.weapon.speed * (1 - Math.min(player.atkSpeedBonus, 0.7));
    const atkDmg = Math.ceil(player.atk * player.weapon.dmgMul);
    const wfx = player.weapon.fx || 'none';
    // 360 whip: hit all around
    const box = wfx === '360' ? {x: player.x + player.w/2 - 40, y: player.y + player.h/2 - 40, w: 80, h: 80} : getAttackBox();
    // AOE hammer: larger box + shockwave
    const hitBox = wfx === 'aoe' ? {x: box.x - 16, y: box.y - 16, w: box.w + 32, h: box.h + 32} : box;
    if (wfx === 'aoe') { shakeTimer = 0.1; shakeIntensity = 6; emitParticles(box.x + box.w/2, box.y + box.h/2, '#b97', 10, 100, 0.3); }
    // Double dagger: schedule second hit
    if (wfx === 'double') { setTimeout(() => { if (gameState !== 'playing') return;
      for (const en2 of enemies) { if (en2.hp <= 0) continue;
        if (rectOverlap(getAttackBox(), en2)) { en2.hp -= atkDmg; en2.hitFlash = 0.1; hitStopTimer = 0.05; const kb = 16; const ka = Math.atan2(en2.y - player.y, en2.x - player.x); moveWithCollision(en2, Math.cos(ka)*kb, Math.sin(ka)*kb); spawnDmg(en2.x + en2.w/2, en2.y, atkDmg, '#ffa'); emitParticles(en2.x+en2.w/2, en2.y+en2.h/2, '#fff', 5, 80, 0.2); Audio.hit(); }}
      if (boss && boss.hp > 0 && rectOverlap(getAttackBox(), boss)) { boss.hp -= atkDmg; boss.hitFlash = 0.1; hitStopTimer = 0.07; spawnDmg(boss.x + boss.w/2, boss.y, atkDmg, '#ffa'); emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#ffd700', 6, 90, 0.25); Audio.hit(); }
    }, 80); }
    const hitEnList = [];
    // Hit enemies
    for (const en of enemies) { if (en.hp <= 0) continue;
      if (rectOverlap(hitBox, en)) { en.hp -= atkDmg; en.hitFlash = 0.1; hitStopTimer = 0.05; const kb2 = 16; const ka2 = Math.atan2(en.y - player.y, en.x - player.x); moveWithCollision(en, Math.cos(ka2)*kb2, Math.sin(ka2)*kb2); emitParticles(en.x+en.w/2, en.y+en.h/2, '#fff', 5, 80, 0.2); spawnDmg(en.x + en.w / 2, en.y, atkDmg, COL.dmg);
        shakeTimer = 0.05; shakeIntensity = 3; Audio.hit();
        emitParticles(en.x + en.w / 2, en.y + en.h / 2, player.weapon.color, 3, 60, 0.2);
        const angle = Math.atan2(en.y - player.y, en.x - player.x);
        moveWithCollision(en, Math.cos(angle) * (wfx === 'pierce' ? 8 : 20), Math.sin(angle) * (wfx === 'pierce' ? 8 : 20));
        hitEnList.push(en); } }
    // Hit boss
    if (boss && boss.hp > 0 && rectOverlap(hitBox, boss)) {
      boss.hp -= atkDmg; boss.hitFlash = 0.1; hitStopTimer = 0.07; emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#ffd700', 6, 90, 0.25); spawnDmg(boss.x + boss.w / 2, boss.y, atkDmg, COL.dmg);
      shakeTimer = 0.06; shakeIntensity = 4; Audio.hit();
      emitParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, player.weapon.color, 5, 80, 0.3);
    }
  }
  if (player.attacking) { player.atkTimer -= dt; if (player.atkTimer <= 0) player.attacking = false; }
  player.invTimer = Math.max(0, player.invTimer - dt);
  player.animTimer += dt; if (player.animTimer > 0.15) { player.animTimer = 0; player.frame = (player.frame + 1) % 4; }

  // === Enemy AI ===
  for (const en of enemies) {
    if (en.hp <= 0) continue;
    en.hitFlash = Math.max(0, en.hitFlash - dt); en.stateTimer += dt;
    const dx = player.x - en.x, dy = player.y - en.y, d = Math.hypot(dx, dy) || 1;

    if (en.pattern === 'wander') {
      en.wanderTimer -= dt; if (en.wanderTimer <= 0) { const a = Math.random() * Math.PI * 2;
        en.wanderDir = { x: Math.cos(a), y: Math.sin(a) }; en.wanderTimer = 1 + Math.random() * 2; }
      moveWithCollision(en, en.wanderDir.x * en.speed * dt, en.wanderDir.y * en.speed * dt);
    }
    if (en.pattern === 'chase' && d > 0) moveWithCollision(en, (dx / d) * en.speed * dt, (dy / d) * en.speed * dt);
    if (en.pattern === 'charge') {
      if (en.state === 'idle') { en.wanderTimer -= dt;
        if (en.wanderTimer <= 0) { const a = Math.random() * Math.PI * 2; en.wanderDir = { x: Math.cos(a), y: Math.sin(a) }; en.wanderTimer = 1.5 + Math.random(); }
        moveWithCollision(en, en.wanderDir.x * 30 * dt, en.wanderDir.y * 30 * dt);
        if (d < 250) { en.state = 'telegraph'; en.telegraphTimer = en.telegraphTime || 0.6; en.chargeDir = { x: dx / d, y: dy / d }; } }
      if (en.state === 'telegraph') { en.telegraphTimer -= dt; if (en.telegraphTimer <= 0) { en.state = 'charging'; en.stateTimer = 0; } }
      if (en.state === 'charging') { moveWithCollision(en, en.chargeDir.x * (en.chargeSpeed || 300) * dt, en.chargeDir.y * (en.chargeSpeed || 300) * dt);
        if (en.stateTimer > (en.chargeTime || 0.3)) { en.state = 'cooldown'; en.stateTimer = 0; } }
      if (en.state === 'cooldown' && en.stateTimer > 0.8) { en.state = 'idle'; en.stateTimer = 0; en.wanderTimer = 0; }
    }
    if (en.pattern === 'shoot') {
      en.shootTimer -= dt;
      if (en.shootTimer <= 0) { en.shootTimer = en.shootInterval || 2; spawnProjectile(en.x + en.w / 2, en.y + en.h / 2, dx, dy, 100, en.dmg, false); }
    }
    if (en.pattern === 'teleport') {
      en.wanderTimer -= dt;
      if (en.wanderTimer <= 0) { en.x = TILE * (2 + Math.floor(Math.random() * (COLS - 4))); en.y = TILE * (2 + Math.floor(Math.random() * (ROWS - 4)));
      while (tileAt(roomMap, Math.floor(en.x / TILE), Math.floor(en.y / TILE)) === 1) { en.x = TILE * (2 + Math.floor(Math.random() * (COLS - 4))); en.y = TILE * (2 + Math.floor(Math.random() * (ROWS - 4))); }
        emitParticles(en.x + en.w / 2, en.y + en.h / 2, en.color, 6, 60, 0.3); en.wanderTimer = 2 + Math.random() * 2; }
      if (d < 200 && d > 0) moveWithCollision(en, (dx / d) * en.speed * 0.5 * dt, (dy / d) * en.speed * 0.5 * dt);
    }

    // Contact damage
    if (player.invTimer <= 0 && !player.dashing) {
      if (rectOverlap({ x: player.x, y: player.y, w: player.w, h: player.h }, { x: en.x, y: en.y, w: en.w, h: en.h })) {
        player.hp -= en.dmg; player.invTimer = player.invDuration; shakeTimer = 0.1; shakeIntensity = 5;
        spawnDmg(player.x + player.w / 2, player.y, en.dmg, '#fff'); Audio.player_hurt();
        emitParticles(player.x + player.w / 2, player.y + player.h / 2, '#fff', 4, 80, 0.2);
        const angle = Math.atan2(player.y - en.y, player.x - en.x); moveWithCollision(player, Math.cos(angle) * 30, Math.sin(angle) * 30);
        if (player.thorns) { en.hp -= player.thorns; en.hitFlash = 0.1; spawnDmg(en.x + en.w / 2, en.y, player.thorns, '#c0392b'); }
        if (player.hp <= 0) { gameState = 'dead'; deadTimer = 0; Audio.game_over(); stopBGM(); }
      }
    }
  }

  // Boss update
  updateBoss(dt);

  // Remove dead enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hp <= 0) {
      score += enemies[i].score;
      emitParticles(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, enemies[i].color, 15, 120, 0.5);
      Audio.enemy_die();
      if (player.vampiric) player.hp = Math.min(player.hp + 1, player.maxHp);
      // Drops
      if (Math.random() < 0.4) spawnDrop(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, 'pollen');
      if (Math.random() < 0.20) spawnDrop(enemies[i].x + enemies[i].w / 2 + 10, enemies[i].y + enemies[i].h / 2, 'heal');
      recordEnemy(enemies[i].name || enemies[i].type, true);
      enemies.splice(i, 1);
    }
  }

  // Boss death
  if (boss && boss.hp <= 0) {
    score += boss.score || 200; Audio.door_open();
    emitParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.color, 20, 120, 0.6);
    for (let i = 0; i < 5; i++) spawnDrop(boss.x + boss.w / 2 + (Math.random() - 0.5) * 40, boss.y + boss.h / 2 + (Math.random() - 0.5) * 40, 'pollen');
    boss = null; gameState = 'floorClear'; clearTimer = 0;
  }

  // Wave clear
  if (!boss && enemies.length === 0 && gameState === 'playing') {
    wave++;
    if (wave >= WAVES.length) { gameState = 'floorClear'; clearTimer = 0; Audio.door_open(); }
    else { gameState = 'waveWait'; clearTimer = 0; }
  }

  // Projectiles, drops, particles, dmg numbers
  updateProjectiles(dt); updateDrops(dt); updateParticles(dt);
  for (let i = dmgNumbers.length - 1; i >= 0; i--) { dmgNumbers[i].life -= dt; dmgNumbers[i].y -= 40 * dt; if (dmgNumbers[i].life <= 0) dmgNumbers.splice(i, 1); }
  shakeTimer = Math.max(0, shakeTimer - dt);
}

// ===== DRAWING =====
function drawRoom() {
  const th = getTheme(floor);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (tileAt(roomMap, c, r) === 1) {
      ctx.fillStyle = th.wall; ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      ctx.fillStyle = th.wallTop; ctx.fillRect(c * TILE, r * TILE, TILE, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(c * TILE, r * TILE + TILE - 4, TILE, 4);
    } else if (tileAt(roomMap, c, r) === 2) {
      ctx.fillStyle = (c + r) % 2 === 0 ? th.floor : th.floorAlt; ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      ctx.fillStyle = 'rgba(180,60,60,0.45)';
      const sx = c * TILE, sy = r * TILE;
      for (let si = 0; si < 3; si++) for (let sj = 0; sj < 3; sj++) {
        const tx = sx + 8 + si * 18, ty = sy + 8 + sj * 18;
        ctx.beginPath(); ctx.moveTo(tx, ty+10); ctx.lineTo(tx+5, ty); ctx.lineTo(tx+10, ty+10); ctx.fill();
      }
    } else {
      ctx.fillStyle = (c + r) % 2 === 0 ? th.floor : th.floorAlt; ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.strokeRect(c * TILE, r * TILE, TILE, TILE);
    }
  }
}

function drawEnemyShape(e, color) {
  const cx = e.x + e.w/2, cy = e.y + e.h/2, hw = e.w/2, hh = e.h/2;
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : color;
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
  const s = e.shape || 'default';
  if (s === 'mushroom') {
    // Cap (half circle)
    ctx.beginPath(); ctx.arc(cx, cy - hh*0.15, hw, Math.PI, 0); ctx.fill(); ctx.stroke();
    // Stem
    ctx.fillRect(cx - hw*0.35, cy - hh*0.15, hw*0.7, hh*0.8);
    ctx.strokeRect(cx - hw*0.35, cy - hh*0.15, hw*0.7, hh*0.8);
    // Spots
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - hw*0.3, cy - hh*0.4, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + hw*0.2, cy - hh*0.55, 2.5, 0, Math.PI*2); ctx.fill();
  } else if (s === 'blob') {
    ctx.beginPath(); ctx.ellipse(cx, cy + hh*0.15, hw, hh*0.75, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(cx - hw*0.3, cy - hh*0.1, hw*0.25, hh*0.2, -0.3, 0, Math.PI*2); ctx.fill();
  } else if (s === 'spider') {
    // Body
    ctx.beginPath(); ctx.ellipse(cx, cy, hw*0.7, hh*0.6, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Legs (4 pairs)
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 2) {
      for (let j = 0; j < 4; j++) {
        const lx = cx + i * hw * (0.4 + j*0.15), ly = cy - hh*0.2 + j*hh*0.2;
        ctx.beginPath(); ctx.moveTo(cx + i*hw*0.4, cy - hh*0.1 + j*hh*0.15);
        ctx.lineTo(lx + i*8, ly + 6); ctx.stroke();
      }
    }
  } else if (s === 'bat') {
    // Body
    ctx.beginPath(); ctx.ellipse(cx, cy, hw*0.5, hh*0.5, 0, 0, Math.PI*2); ctx.fill();
    // Wings
    ctx.beginPath(); ctx.moveTo(cx - hw*0.4, cy); ctx.quadraticCurveTo(cx - hw, cy - hh, cx - hw*0.2, cy - hh*0.3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + hw*0.4, cy); ctx.quadraticCurveTo(cx + hw, cy - hh, cx + hw*0.2, cy - hh*0.3); ctx.fill();
  } else if (s === 'beetle') {
    // Shell
    ctx.beginPath(); ctx.ellipse(cx, cy, hw, hh*0.85, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(cx, cy - hh*0.85); ctx.lineTo(cx, cy + hh*0.85); ctx.stroke();
    // Horn
    ctx.fillStyle = '#555'; ctx.beginPath(); ctx.moveTo(cx - 4, e.y); ctx.lineTo(cx, e.y - 10); ctx.lineTo(cx + 4, e.y); ctx.fill();
  } else if (s === 'wasp') {
    // Body segments
    ctx.beginPath(); ctx.ellipse(cx, cy - hh*0.2, hw*0.5, hh*0.4, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy + hh*0.3, hw*0.6, hh*0.45, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Stripes
    ctx.fillStyle = '#333'; ctx.fillRect(cx - hw*0.5, cy + hh*0.15, hw, 3);
    ctx.fillRect(cx - hw*0.5, cy + hh*0.35, hw, 3);
    // Wings
    ctx.fillStyle = 'rgba(200,230,255,0.5)';
    ctx.beginPath(); ctx.ellipse(cx - hw*0.6, cy - hh*0.3, hw*0.5, hh*0.25, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + hw*0.6, cy - hh*0.3, hw*0.5, hh*0.25, 0.3, 0, Math.PI*2); ctx.fill();
  } else if (s === 'flower') {
    // Petals
    for (let i = 0; i < 5; i++) { const a = i * Math.PI*2/5 - Math.PI/2;
      ctx.fillStyle = e.hitFlash > 0 ? '#fff' : color;
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(a)*hw*0.5, cy + Math.sin(a)*hh*0.5, hw*0.35, hh*0.2, a, 0, Math.PI*2); ctx.fill(); }
    // Center
    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(cx, cy, hw*0.3, 0, Math.PI*2); ctx.fill();
  } else if (s === 'worm') {
    // Segments
    for (let i = 0; i < 4; i++) { ctx.fillStyle = e.hitFlash > 0 ? '#fff' : (i%2===0 ? color : '#8B4513');
      ctx.beginPath(); ctx.ellipse(cx - hw*0.5 + i*hw*0.35, cy, hw*0.28, hh*0.45, 0, 0, Math.PI*2); ctx.fill(); }
  } else if (s === 'ghost') {
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(cx, cy - hh*0.2, hw*0.7, Math.PI, 0); ctx.lineTo(cx + hw*0.7, cy + hh*0.4);
    for (let i = 3; i >= 0; i--) { ctx.lineTo(cx - hw*0.7 + i*hw*0.35, cy + hh*(i%2===0 ? 0.2 : 0.5)); }
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  } else if (s === 'golem') {
    // Blocky body
    ctx.fillRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8); ctx.strokeRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
    // Cracks
    ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.moveTo(cx - 6, e.y + 8); ctx.lineTo(cx - 2, cy); ctx.lineTo(cx + 5, cy + 5); ctx.stroke();
  } else if (s === 'vine') {
    // Stem
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#2d6b1e'; ctx.fillRect(cx - 3, cy - hh*0.2, 6, hh*0.8);
    // Leaves
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : color;
    ctx.beginPath(); ctx.ellipse(cx - hw*0.4, cy - hh*0.1, hw*0.4, hh*0.25, -0.4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + hw*0.4, cy + hh*0.1, hw*0.4, hh*0.25, 0.4, 0, Math.PI*2); ctx.fill();
    // Flower bud
    ctx.fillStyle = '#e84393'; ctx.beginPath(); ctx.arc(cx, cy - hh*0.5, hw*0.25, 0, Math.PI*2); ctx.fill();
  } else if (s === 'darkbee') {
    // Like wasp but darker
    ctx.beginPath(); ctx.ellipse(cx, cy, hw*0.6, hh*0.7, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.fillRect(cx - hw*0.5, cy - 2, hw, 4); ctx.fillRect(cx - hw*0.5, cy + hh*0.25, hw, 4);
    ctx.fillStyle = 'rgba(150,150,200,0.4)';
    ctx.beginPath(); ctx.ellipse(cx - hw*0.5, cy - hh*0.4, hw*0.5, hh*0.2, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + hw*0.5, cy - hh*0.4, hw*0.5, hh*0.2, 0.3, 0, Math.PI*2); ctx.fill();
  } else {
    // Default rounded rect
    const rr = 6; ctx.beginPath(); ctx.moveTo(e.x+rr,e.y); ctx.lineTo(e.x+e.w-rr,e.y);
    ctx.quadraticCurveTo(e.x+e.w,e.y,e.x+e.w,e.y+rr); ctx.lineTo(e.x+e.w,e.y+e.h-rr);
    ctx.quadraticCurveTo(e.x+e.w,e.y+e.h,e.x+e.w-rr,e.y+e.h); ctx.lineTo(e.x+rr,e.y+e.h);
    ctx.quadraticCurveTo(e.x,e.y+e.h,e.x,e.y+e.h-rr); ctx.lineTo(e.x,e.y+rr);
    ctx.quadraticCurveTo(e.x,e.y,e.x+rr,e.y); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

function drawEntity(e, color, isP) {
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx, e.y + e.h + 2, e.w / 2.5, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Invincibility blink
  if (isP && player.invTimer > 0 && Math.floor(player.invTimer * 10) % 2 === 0) ctx.globalAlpha = 0.4;
  // Hit flash
  if (!isP && e.hitFlash > 0) ctx.globalAlpha = 0.6;

  // === PLAYER ===
  if (isP) {
    if (mipurinReady) {
      const dir = getPlayerDir();
      const mf = MIPURIN_FRAMES[dir];
      const drawSz = e.w + 24;
      // Code animation: bob when moving
      const isMoving = keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD'] ||
                       keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight'];
      const bob = isMoving ? Math.sin(Date.now() / 100) * 2 : 0;
      const squash = isMoving ? 1 + Math.sin(Date.now() / 120) * 0.03 : 1;
      ctx.save();
      ctx.translate(cx, e.y + e.h / 2 + bob);
      ctx.scale(squash, 2 - squash);
      ctx.translate(-cx, -(e.y + e.h / 2));
      ctx.drawImage(mipurinImg, mf.sx, mf.sy, mf.sw, mf.sh, e.x - 12, e.y - 12, drawSz, drawSz);
      ctx.restore();
      ctx.globalAlpha = 1;
      return;
    }
    // Fallback canvas player
    ctx.fillStyle = COL.player;
    const rr = 6; ctx.beginPath(); ctx.moveTo(e.x+rr,e.y); ctx.lineTo(e.x+e.w-rr,e.y);
    ctx.quadraticCurveTo(e.x+e.w,e.y,e.x+e.w,e.y+rr); ctx.lineTo(e.x+e.w,e.y+e.h-rr);
    ctx.quadraticCurveTo(e.x+e.w,e.y+e.h,e.x+e.w-rr,e.y+e.h); ctx.lineTo(e.x+rr,e.y+e.h);
    ctx.quadraticCurveTo(e.x,e.y+e.h,e.x,e.y+e.h-rr); ctx.lineTo(e.x,e.y+rr);
    ctx.quadraticCurveTo(e.x,e.y,e.x+rr,e.y); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }

  // === ENEMY with sprite ===
  const spriteId = e.shape || e.id || 'default';
  if (hasSprite(spriteId)) {
    const bob = getEnemyBob(e);
    // Code animation: bob + squash & stretch + tilt
    const isMoving = Math.abs(e.vx || 0) > 5 || Math.abs(e.vy || 0) > 5;
    const squash = isMoving ? 1 + Math.sin(Date.now() / 150) * 0.12 : 1 + Math.sin(Date.now() / 600) * 0.06;
    const tilt = isMoving ? Math.sin(Date.now() / 200) * 0.15 : Math.sin(Date.now() / 800) * 0.03;
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2 + bob);
    ctx.rotate(tilt);
    ctx.scale(squash, 2 - squash);
    drawSpriteImg(spriteId, -e.w / 2, -e.h / 2, e.w, e.h);
    if (e.hitFlash > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    return;
  }

  // === Fallback: canvas enemy shape ===
  if (e.shape) {
    drawEnemyShape(e, color);
  } else {
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : color;
    const rr = 6; ctx.beginPath(); ctx.moveTo(e.x+rr,e.y); ctx.lineTo(e.x+e.w-rr,e.y);
    ctx.quadraticCurveTo(e.x+e.w,e.y,e.x+e.w,e.y+rr); ctx.lineTo(e.x+e.w,e.y+e.h-rr);
    ctx.quadraticCurveTo(e.x+e.w,e.y+e.h,e.x+e.w-rr,e.y+e.h); ctx.lineTo(e.x+rr,e.y+e.h);
    ctx.quadraticCurveTo(e.x,e.y+e.h,e.x,e.y+e.h-rr); ctx.lineTo(e.x,e.y+rr);
    ctx.quadraticCurveTo(e.x,e.y,e.x+rr,e.y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();
  }
  // Eyes for canvas enemies
  const eyeY = cy - 2, eyeOff = e.w * 0.18; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx - eyeOff, eyeY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + eyeOff, eyeY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(cx - eyeOff, eyeY, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + eyeOff, eyeY, 2, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawHPBar(e, yOff) {
  const bW = e.w + 4, bH = 5, bx = e.x - 2, by = e.y + yOff;
  ctx.fillStyle = COL.hpBg; ctx.fillRect(bx, by, bW, bH);
  const ratio = Math.max(0, e.hp / e.maxHp);
  ctx.fillStyle = ratio > 0.5 ? COL.hp : ratio > 0.25 ? '#f39c12' : COL.hpLost; ctx.fillRect(bx, by, bW * ratio, bH);
}

function drawEnding() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CW, CH);
  ctx.save(); ctx.globalAlpha = 0.8;
  if (mipurinReady) {
    const sz = 200;
    ctx.drawImage(mipurinImg, 0, 0, 250, 250, CW/2 - sz/2, 120, sz, sz);
  }
  ctx.restore();
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText('花の国に平和が戻った！', CW/2, 380);
  ctx.fillStyle = '#fff'; ctx.font = "22px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ミプリンは花粉を取り戻し、', CW/2, 430);
  ctx.fillText('虫たちは再び元気を取り戻した。', CW/2, 460);
  ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('スコア: ' + score + '  花粉: ' + pollen + '  フロア: ' + floor, CW/2, 520);
  ctx.fillStyle = '#ffd700'; ctx.fillText('獲得ネクター: +' + runNectar, CW/2, 580);
  ctx.fillText('祝福: ' + activeBlessings.length + '  共鳴: ' + (typeof activeDuos !== 'undefined' ? activeDuos.length : 0), CW/2, 550);
  ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  const blinkOn = Math.floor(Date.now() / 500) % 2 === 0;
  if (blinkOn) ctx.fillText('Zキーでタイトルへ', CW/2, 620);
  ctx.textAlign = 'left';
  // Consumable use message
  // [REMOVED] old consumableMsg draw - replaced by drawFloatMessages()
  // Weapon swap message
  // drawFloatMessages(); ← moved to draw() end
  // drawDialogWindow(); ← moved to draw() end
  // Fade overlay
  if (fadeDir !== 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
}

function drawAttackEffect() {
  if (!player.attacking) return;
  const box = getAttackBox();
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const ba = Math.atan2(player.atkDir.y, player.atkDir.x);
  const wc = player.weapon.color || '#fff';
  const progress = 1 - (player.atkTimer / player.atkDuration);
  ctx.save();
  // Dark outline for contrast on any background
  ctx.globalAlpha = 0.5 * (1 - progress);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(cx, cy, 26 + progress * 14, ba - 1.1, ba + 1.1); ctx.stroke();
  // Main slash arc (bright)
  ctx.globalAlpha = 0.9 * (1 - progress);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, cy, 26 + progress * 14, ba - 1.0, ba + 1.0); ctx.stroke();
  // Weapon color arc
  ctx.strokeStyle = wc; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 22 + progress * 10, ba - 0.8, ba + 0.8); ctx.stroke();
  // Bright flash at start
  if (progress < 0.3) {
    ctx.globalAlpha = 0.4 * (1 - progress / 0.3);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  emitParticles(cx, cy, wc, 1, 50, 0.18);
}

function drawDashTrail() {
  if (!player.dashing) return;
  ctx.fillStyle = COL.dash; ctx.beginPath(); ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 24, 0, Math.PI * 2); ctx.fill();
}

function drawTelegraph(en) {
  if (en.state !== 'telegraph' || !en.chargeDir) return;
  const cx = en.x + en.w / 2, cy = en.y + en.h / 2;
  ctx.fillStyle = COL.telegraph; ctx.beginPath();
  ctx.moveTo(cx - en.chargeDir.y * 20, cy + en.chargeDir.x * 20);
  ctx.lineTo(cx + en.chargeDir.x * 200, cy + en.chargeDir.y * 200);
  ctx.lineTo(cx + en.chargeDir.y * 20, cy - en.chargeDir.x * 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff0'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('!', cx, en.y - 8);
}

function drawBoss() {
  if (!boss || boss.hp <= 0) return;
  // Telegraph
  if (boss.state === 'telegraph' && boss.chargeDir) {
    const cx = boss.x + boss.w / 2, cy = boss.y + boss.h / 2;
    ctx.fillStyle = 'rgba(255,0,0,0.3)'; ctx.beginPath();
    ctx.moveTo(cx - boss.chargeDir.y * 30, cy + boss.chargeDir.x * 30);
    ctx.lineTo(cx + boss.chargeDir.x * 300, cy + boss.chargeDir.y * 300);
    ctx.lineTo(cx + boss.chargeDir.y * 30, cy - boss.chargeDir.x * 30); ctx.closePath(); ctx.fill();
  }
  if (boss.pattern === 'boss_slam' && boss.state === 'telegraph') {
    ctx.fillStyle = 'rgba(255,0,0,0.2)'; ctx.beginPath(); ctx.arc(boss.x + boss.w / 2, boss.y + boss.h / 2, 100, 0, Math.PI * 2); ctx.fill();
  }
  // Try boss sprite
  const bossId = boss.id || 'default';
  if (hasSprite(bossId)) {
    drawBossPhaseEffect(boss);
    const bob = getEnemyBob(boss);
    drawSpriteImg(bossId, boss.x, boss.y + bob, boss.w, boss.h);
    if (boss.hitFlash > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(boss.x, boss.y + bob, boss.w, boss.h);
      ctx.globalCompositeOperation = 'source-over';
    }
  } else {
    drawEntity(boss, boss.hitFlash > 0 ? '#fff' : boss.color, false);
  }
  // Boss HP bar (top of screen)
  const bw = 300, bh = 12, bx = CW / 2 - bw / 2, by = 8;
  ctx.fillStyle = COL.hpBg; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = COL.hpLost; ctx.fillRect(bx, by, bw * Math.max(0, boss.hp / boss.maxHp), bh);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = COL.text; ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText(boss.name + ' P' + boss.phase, CW / 2, by + bh + 12); ctx.textAlign = 'left';
}

function drawHUD() {
  // HP
  const hs = 20;
  for (let i = 0; i < player.maxHp; i++) { ctx.fillStyle = i < player.hp ? COL.hpLost : '#444'; ctx.font = hs + 'px M PLUS Rounded 1c, sans-serif'; ctx.fillText(i < player.hp ? '\u2665' : '\u2661', 12 + i * (hs + 4), 12 + hs); }
  // Score & pollen
  ctx.fillStyle = COL.text; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'right'; ctx.fillText('スコア: ' + score, CW - 190, 20); ctx.textAlign = 'left';
  ctx.fillStyle = COL.pollen; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('\uD83C\uDF3C ' + pollen, CW - 190, 38);
  // Floor & wave (centered, no overlap)
  ctx.textAlign = 'center';
  if (!isBossFloor() || !boss) {
    ctx.fillStyle = COL.bless; ctx.font = "bold 40px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('フロア ' + floor + '  W' + (Math.min(wave + 1, WAVES.length)) + '/' + WAVES.length, CW / 2, 20);
  } else {
    ctx.fillStyle = '#e74c3c'; ctx.font = "bold 40px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('フロア ' + floor + '  ボス', CW / 2, 20);
  }
  ctx.textAlign = 'left';
  // Weapon
  ctx.fillStyle = player.weapon.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('\u2694 ' + player.weapon.name, 12, CH - 28);
  ctx.fillStyle = COL.text; ctx.font = "36px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('ATK:' + Math.ceil(player.atk * player.weapon.dmgMul), 12, CH - 14);
  // Blessings
  if (activeBlessings.length > 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
    for (let i = 0; i < activeBlessings.length; i++) ctx.fillText(activeBlessings[i].icon, CW - 20 - (activeBlessings.length - i) * 22, 115); }
  // Controls
  // Consumable slots
    // Item slots with clear labels
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(CW - 185, 50, 170, 55);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('アイテム', CW - 178, 62);
    for (let i = 0; i < 3; i++) {
      const sx = CW - 160 + i * 52, sy = 80;
      // Slot background
      ctx.fillStyle = player.consumables[i] ? 'rgba(50,40,80,0.9)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(sx - 20, sy - 16, 40, 32);
      ctx.strokeStyle = player.consumables[i] ? '#ffd700' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
      ctx.strokeRect(sx - 20, sy - 16, 40, 32);
      if (player.consumables && player.consumables[i]) {
        ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
        ctx.fillText(player.consumables[i].icon, sx, sy + 6); ctx.textAlign = 'left';
      }
      // Key number (always visible)
      ctx.fillStyle = player.consumables[i] ? '#ffd700' : 'rgba(255,255,255,0.3)';
      ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText((i + 1), sx - 16, sy + 20);
    }
    // Sub weapon indicator
    if (player.weapons[1] !== null) {
      const subW = player.weapons[1 - player.weaponIdx];
      if (subW) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(8, CH - 65, 160, 30);
        ctx.strokeStyle = subW.color || '#aaa'; ctx.lineWidth = 2; ctx.strokeRect(8, CH - 65, 160, 30);
        ctx.fillStyle = '#aaa'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('もうひとつ', 14, CH - 52);
        ctx.fillStyle = subW.color || '#fff'; ctx.font = "bold 19px 'M PLUS Rounded 1c', sans-serif";
        ctx.fillText('Q: ' + subW.name, 14, CH - 38);
      }
    }
    // Controls help (context-sensitive)
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, CH - 22, CW, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    let helpText = 'WASD:いどう  Z:こうげき  X:ダッシュ  TAB:もちもの';
    if (player.weapons[1] !== null) helpText += '  Q:ぶきもちかえ';
    if (player.consumables.some(c => c !== null)) helpText += '  1/2/3:アイテムつかう';
    ctx.fillText(helpText, CW / 2, CH - 6); ctx.textAlign = 'left';
}

function drawBlessing() {
  if (gameState !== 'blessing') return;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = COL.bless; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('祝福を選べ！', CW / 2, 70);
  ctx.fillStyle = COL.text; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('← → で選んで Z で決定', CW / 2, 95);
  for (let i = 0; i < blessingChoices.length; i++) {
    const b = blessingChoices[i], bx = CW / 2 - 300 + i * 220, by = 120, bw = 180, bh = 220;
    const sel = i === selectCursor;
    ctx.fillStyle = sel ? 'rgba(50,50,80,0.95)' : COL.blessBox; ctx.fillRect(bx, by, bw, bh);
    const rCol = b.rarity === 'epic' ? '#ffd700' : b.rarity === 'rare' ? '#3498db' : '#aaa';
    ctx.strokeStyle = sel ? '#fff' : rCol; ctx.lineWidth = sel ? 3 : 2; ctx.strokeRect(bx, by, bw, bh);
    if (sel) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(bx, by, bw, bh); }
    ctx.fillStyle = COL.text; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.icon, bx + bw / 2, by + 55);
    ctx.fillStyle = rCol; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.rarity ? b.rarity.toUpperCase() : 'COMMON', bx + bw / 2, by + 80);
    ctx.fillStyle = COL.bless; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.name, bx + bw / 2, by + 105);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.desc, bx + bw / 2, by + 135);
    ctx.fillStyle = sel ? '#fff' : 'rgba(255,255,255,0.4)'; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(sel ? '> Z <' : '[' + (i + 1) + ']', bx + bw / 2, by + 195);
  }
  ctx.textAlign = 'left';
}

function drawShop() {
  if (gameState !== 'shop') return;
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, CW, CH);
  // Title
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 30px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText('🌸 はなの市場 🌸', CW / 2, 55);
  ctx.fillStyle = '#ddd'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('いらっしゃい！ なにがほしいの？', CW / 2, 82);
  ctx.fillStyle = COL.pollen; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('💛 花粉: ' + pollen, CW / 2, 108);
  // Layout: 2 rows x 3 cols (or fewer)
  const cols = 3;
  const cardW = 200, cardH = 160, padX = 20, padY = 16;
  const totalW = cols * cardW + (cols - 1) * padX;
  const startX = CW / 2 - totalW / 2;
  const startY = 130;
  for (let i = 0; i < shopItems.length; i++) {
    const s = shopItems[i];
    const row = Math.floor(i / cols), col = i % cols;
    const sx = startX + col * (cardW + padX);
    const sy = startY + row * (cardH + padY);
    const sel = i === selectCursor;
    const canBuy = pollen >= s.cost;
    // Card background
    ctx.fillStyle = canBuy ? (sel ? 'rgba(60,50,90,0.95)' : 'rgba(30,30,50,0.85)') : 'rgba(60,30,30,0.8)';
    ctx.fillRect(sx, sy, cardW, cardH);
    // Border
    ctx.strokeStyle = sel ? '#ffd700' : (canBuy ? 'rgba(255,215,0,0.4)' : '#555');
    ctx.lineWidth = sel ? 3 : 1; ctx.strokeRect(sx, sy, cardW, cardH);
    // Icon
    ctx.fillStyle = '#fff'; ctx.font = "48px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(s.icon, sx + cardW / 2, sy + 40);
    // Name
    ctx.fillStyle = canBuy ? '#fff' : '#888'; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(s.name, sx + cardW / 2, sy + 70);
    // Desc
    if (s.desc) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(s.desc, sx + cardW / 2, sy + 90); }
    // Cost
    ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(s.cost + ' 花粉', sx + cardW / 2, sy + 115);
    // Select indicator
    if (sel) {
      ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(canBuy ? '▶ Zで買う ◀' : '花粉が足りない…', sx + cardW / 2, sy + 145);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('◀▶で選ぶ', sx + cardW / 2, sy + 145);
    }
  }
  // Skip button
  const skipRow = Math.floor(shopItems.length / cols) + 1;
  const skipY = startY + skipRow * (cardH + padY) + 10;
  const skipSel = selectCursor >= shopItems.length;
  ctx.fillStyle = skipSel ? '#ffd700' : 'rgba(255,255,255,0.4)';
  ctx.font = (skipSel ? 'bold 20px' : '20px') + ' M PLUS Rounded 1c, sans-serif';
  ctx.fillText(skipSel ? '▶ つぎへすすむ (Z) ◀' : 'Xキー / Escでつぎへ', CW / 2, skipY);
  ctx.textAlign = 'left';
}

function drawGarden() {
  ctx.fillStyle = '#1a0a2e'; ctx.fillRect(0, 0, CW, CH);
  // Stars
  for (let i = 0; i < 30; i++) {
    const sx = (i * 137 + 50) % CW, sy = (i * 97 + 30) % (CH - 200) + 50;
    ctx.fillStyle = 'rgba(255,255,200,' + (0.3 + Math.sin(Date.now()/1000 + i) * 0.2) + ')';
    ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 64px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText('🌸 ミプリンの花壇 🌸', CW / 2, 60);
  ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ネクター: ' + nectar, CW / 2, 95);
  for (let i = 0; i < GARDEN_DEFS.length; i++) {
    const def = GARDEN_DEFS[i];
    const lv = gardenUpgrades[def.id] || 0;
    const cost = getGardenCost(def.id);
    const y = 150 + i * 100;
    const selected = i === gardenCursor;
    // Box
    ctx.fillStyle = selected ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(CW/2 - 250, y, 500, 80);
    if (selected) { ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(CW/2 - 250, y, 500, 80); }
    // Icon + Name
    ctx.fillStyle = '#fff'; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
    ctx.fillText(def.icon + ' ' + def.name, CW/2 - 230, y + 30);
    // Desc
    ctx.fillStyle = '#ccc'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(def.desc, CW/2 - 230, y + 55);
    // Level
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'right';
    let lvText = 'Lv.' + lv + ' / ' + def.max;
    if (lv >= def.max) lvText += ' (MAX)';
    ctx.fillText(lvText, CW/2 + 230, y + 30);
    // Cost
    if (cost > 0) {
      ctx.fillStyle = nectar >= cost ? '#8f8' : '#f88';
      ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('コスト: ' + cost + ' ネクター', CW/2 + 230, y + 55);
    } else {
      ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('✅ 最大強化済', CW/2 + 230, y + 55);
    }
  }
  ctx.textAlign = 'center'; ctx.fillStyle = '#888'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('↑↓で選択 / Zで購入 / Xで戻る', CW / 2, CH - 40);
  ctx.textAlign = 'left';
}

function drawTitle() {
  if (currentBGM !== 'title') playBGM('title');
  ctx.fillStyle = '#fffde7';
  ctx.fillRect(0, 0, CW, CH);
  // Draw cute mipurin
  if (mipurinReady) {
    const f = MIPURIN_FRAMES.down;
    const sz = 240;
    ctx.drawImage(mipurinImg, f.sx, f.sy, f.sw, f.sh, CW / 2 - sz / 2, 120, sz, sz);
  }
  // Title text
  ctx.fillStyle = '#ff9800';
  ctx.font = "bold 140px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('ミプリンの冒険', CW / 2, 440);
  ctx.fillStyle = '#795548';
  ctx.font = "24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('v5.0', CW / 2, 480);
  // Blink
  titleBlink += 1 / 60;
  if (Math.sin(titleBlink * 3) > -0.3) {
    ctx.fillStyle = '#e65100';
    ctx.font = "bold 32px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('Zキーでスタート', CW / 2, 560);
    ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('Xキーで花壇メニュー', CW / 2, 595);
    ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('ネクター: ' + nectar, CW / 2, 755);
  }
  ctx.fillStyle = '#888';
  ctx.font = "32px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('移動: WASD  攻撃: Z  ダッシュ: X', CW / 2, 640);
  ctx.fillText('アイテム: 1/2/3', CW / 2, 670);
  ctx.textAlign = 'left';
}

function drawGameState() {
  if (gameState === 'waveWait') { ctx.fillStyle = COL.text; ctx.font = "bold 64px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('WAVE ' + (wave + 1), CW / 2, CH / 2); ctx.textAlign = 'left'; }
  if (gameState === 'floorClear') { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = COL.clear; ctx.font = "bold 80px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('FLOOR ' + floor + ' CLEAR!', CW / 2, CH / 2); ctx.textAlign = 'left'; }
  if (gameState === 'nodeSelect') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 32px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText('つぎの道をえらぼう', CW / 2, 160);
    for (let i = 0; i < nodeChoices.length; i++) {
      const n = nodeChoices[i];
      const bx = CW / 2 - 360 + i * 240, by = 260, bw = 200, bh = 280;
      // Card bg
      ctx.fillStyle = nodeCursor === i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = nodeCursor === i ? n.color : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = nodeCursor === i ? 4 : 2;
      ctx.strokeRect(bx, by, bw, bh);
      // Icon
      ctx.fillStyle = '#fff'; ctx.font = "48px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(n.icon, bx + bw / 2, by + 70);
      // Name
      ctx.fillStyle = n.color; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(n.name, bx + bw / 2, by + 120);
      // Desc
      ctx.fillStyle = '#ccc'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      const words = n.desc.split(''); let line = '', ly = by + 155;
      for (const ch of words) { line += ch; if (ctx.measureText(line).width > bw - 30) { ctx.fillText(line, bx + bw / 2, ly); ly += 20; line = ''; } }
      if (line) ctx.fillText(line, bx + bw / 2, ly);
      // Cursor
      if (nodeCursor === i) {
        ctx.fillStyle = n.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
        ctx.fillText('▶ Z: えらぶ', bx + bw / 2, by + bh - 20);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('← → で選択  /  Z で決定', CW / 2, CH - 60);
    ctx.textAlign = 'left';
  }
  if (gameState === 'event' && currentEvent) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = '#3498db'; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText('❓ イベント', CW / 2, 200);
    ctx.fillStyle = '#fff'; ctx.font = "22px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(currentEvent.text, CW / 2, 280);
    if (eventPhase === 'choose') {
      const opts = [currentEvent.a.label, currentEvent.b.label];
      for (let i = 0; i < 2; i++) {
        const oy = 370 + i * 70;
        ctx.fillStyle = nodeCursor === i ? 'rgba(52,152,219,0.4)' : 'rgba(255,255,255,0.1)';
        ctx.fillRect(CW / 2 - 200, oy - 25, 400, 50);
        ctx.strokeStyle = nodeCursor === i ? '#3498db' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2; ctx.strokeRect(CW / 2 - 200, oy - 25, 400, 50);
        ctx.fillStyle = nodeCursor === i ? '#fff' : '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
        ctx.fillText(opts[i], CW / 2, oy + 7);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('↑↓ で選択  /  Z で決定', CW / 2, 540);
    } else {
      ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('Z: つぎへ', CW / 2, 400);
    }
    ctx.textAlign = 'left';
  }

  if (gameState === 'weaponDrop' && weaponPopup.active) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, CW, CH);
      ctx.fillStyle = '#ffd700'; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
      ctx.fillText(weaponPopup.weapon.icon + ' ' + weaponPopup.weapon.name + (weaponPopup.sparkle ? ' ✦' : ''), CW / 2, CH / 2 - 40);
      ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('ATK: ' + weaponPopup.weapon.atk + '  ' + (weaponPopup.weapon.desc || ''), CW / 2, CH / 2);
      ctx.fillText('Z: おきにいりに  Q: もうひとつに  X: すてる', CW / 2, CH / 2 + 40);
      ctx.textAlign = 'left';
    }
    if (gameState === 'dead') { ctx.fillStyle = 'rgba(80,0,0,0.7)'; ctx.fillRect(0, 0, CW, CH);
    // Mipurin fallen
    if (mipurinReady) { ctx.save(); ctx.globalAlpha = 0.6; const sz = 80; ctx.drawImage(mipurinImg, 0, 0, 250, 250, CW/2 - sz/2, CH/2 + 30, sz, sz); ctx.restore(); }
    ctx.fillStyle = COL.hpLost; ctx.font = "bold 120px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('ゲームオーバー', CW / 2, CH / 2 - 40);
    ctx.fillStyle = '#ddd'; ctx.font = "32px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('スコア: ' + score + '　フロア: ' + floor + '　花粉: ' + pollen, CW / 2, CH / 2 + 10);
    ctx.fillStyle = '#ffd700'; ctx.fillText('獲得ネクター: +' + runNectar, CW / 2, CH / 2 + 40);
    ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
    if (deadTimer > 2.0) { const blinkOn = Math.floor(Date.now() / 500) % 2 === 0; if (blinkOn) ctx.fillText('Zキーでタイトルへ', CW / 2, CH / 2 + 130); }
    else { ctx.fillText('...', CW / 2, CH / 2 + 130); }
    ctx.textAlign = 'left'; }
}
function drawDmgNumbers() {
  for (const d of dmgNumbers) { ctx.globalAlpha = clamp(d.life / 0.3, 0, 1); ctx.fillStyle = d.color; ctx.font = "bold 40px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText(d.val, d.x, d.y); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
}

function draw() {
  if (gameState === 'ending') { drawEnding(); return; }
  if (gameState === 'prologue') { drawPrologue(); return; } if (gameState === 'garden') { drawGarden(); return; }
  if (gameState === 'title') { drawTitle(); return; }

  ctx.save();
  if (shakeTimer > 0) ctx.translate((Math.random() - 0.5) * shakeIntensity * 2, (Math.random() - 0.5) * shakeIntensity * 2);

  const th = getTheme(floor); ctx.fillStyle = th.bg; ctx.fillRect(0, 0, CW, CH);
  drawRoom(); drawDashTrail(); drawDrops();
  for (const en of enemies) if (en.hp > 0) drawTelegraph(en);
  for (const en of enemies) if (en.hp > 0) { drawEntity(en, en.color, false); drawHPBar(en, -8); }
  drawBoss(); drawProjectiles(); drawAttackEffect(); drawEntity(player, COL.player, true); drawParticles(); drawDmgNumbers(); drawHUD();

  ctx.restore();
  drawGameState(); drawBlessing(); drawShop();

  drawInventory();
  // Fade overlay
  if (fadeAlpha > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
  drawFloatMessages();
  drawDialogWindow();
}

// ===== MAIN LOOP =====
let lastTime = 0;
function loop(time) {
  const rawDt = (time - lastTime) / 1000; lastTime = time;
  const dt = Math.min(rawDt, 0.05);
  if (hitStopTimer > 0) { hitStopTimer -= dt; draw(); } else { update(dt); draw(); }
  for (const k in pressed) pressed[k] = false;
  requestAnimationFrame(loop);
}
requestAnimationFrame(t => { lastTime = t; requestAnimationFrame(loop); });
