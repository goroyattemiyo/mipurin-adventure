'use strict';
/*============================================================
  ミプリンの冒険 v2.0 — Phase C/D Complete
  Real-time top-down action roguelike
  960x540 base, 48px tiles, Canvas 2D
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
const CW = 960, CH = 540, TILE = 48, COLS = 20, ROWS = 11;

// ===== CANVAS =====
const cvs = document.getElementById('c'), ctx = cvs.getContext('2d');

// ===== INPUT =====
const keys = {}, pressed = {};
window.addEventListener('keydown', e => { if (!keys[e.code]) pressed[e.code] = true; keys[e.code] = true; e.preventDefault(); });
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
    hit() { play(200, 0.08, 'square', 0.12); play(150, 0.06, 'sawtooth', 0.08); },
    hurt() { play(100, 0.15, 'sawtooth', 0.15); },
    kill() { play(400, 0.1, 'square', 0.1); play(600, 0.15, 'square', 0.08); },
    dash() { play(300, 0.06, 'triangle', 0.08); },
    blessing() { play(523, 0.12, 'sine', 0.1); play(659, 0.12, 'sine', 0.1); setTimeout(() => play(784, 0.2, 'sine', 0.12), 120); },
    clear() { play(523, 0.15, 'square', 0.1); play(659, 0.15, 'square', 0.1); setTimeout(() => play(784, 0.3, 'square', 0.12), 150); },
    shop() { play(440, 0.1, 'sine', 0.08); },
    buy() { play(600, 0.08, 'sine', 0.1); play(800, 0.12, 'sine', 0.1); },
    drop() { play(500, 0.06, 'triangle', 0.06); }
  };
})();

// ===== PALETTE =====
const COL = { bg: '#2b2b3d', wall: '#5a5a78', floor: '#3d3d56', floorAlt: '#35354a',
  player: '#ffd700', playerOutline: '#b8860b',
  hp: '#27ae60', hpBg: '#555', hpLost: '#c0392b',
  text: '#fff', clear: '#2ecc71', dmg: '#ff6b6b',
  dash: 'rgba(255,215,0,0.3)', attack: 'rgba(255,255,255,0.5)',
  telegraph: 'rgba(255,0,0,0.25)',
  bless: '#ffd700', blessBox: 'rgba(30,30,50,0.92)',
  pollen: '#f1c40f', pollenBg: 'rgba(0,0,0,0.5)' };

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
function generateRoom(floor) {
  const map = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) { map.push(1); continue; }
    map.push(0);
  }
  const pillarCount = 2 + Math.min(floor, 6);
  const placed = [];
  for (let i = 0; i < pillarCount; i++) {
    let pc, pr, tries = 0;
    do { pc = 2 + Math.floor(rng() * (COLS - 4)); pr = 2 + Math.floor(rng() * (ROWS - 4)); tries++; }
    while (tries < 50 && (placed.some(p => Math.abs(p[0] - pc) < 3 && Math.abs(p[1] - pr) < 3) || (Math.abs(pc - 10) < 2 && Math.abs(pr - 5) < 2)));
    if (tries < 50) {
      placed.push([pc, pr]); map[pr * COLS + pc] = 1;
      if (pc + 1 < COLS - 1) map[pr * COLS + pc + 1] = 1;
      if (pr + 1 < ROWS - 1) map[(pr + 1) * COLS + pc] = 1;
      if (pc + 1 < COLS - 1 && pr + 1 < ROWS - 1) map[(pr + 1) * COLS + pc + 1] = 1;
    }
  }
  return map;
}
function tileAt(map, c, r) { if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return 1; return map[r * COLS + c]; }

// ===== THEMES =====
const THEMES = [
  { name: 'forest', bg: '#2b2b3d', wall: '#5a5a78', floor: '#3d3d56', floorAlt: '#35354a', wallTop: '#6e6e90' },
  { name: 'cave', bg: '#1a1a2e', wall: '#4b4b5e', floor: '#2d2d44', floorAlt: '#252538', wallTop: '#5e5e72' },
  { name: 'flower', bg: '#2e1a2e', wall: '#6e4878', floor: '#3d2d56', floorAlt: '#35254a', wallTop: '#8a5a94' },
  { name: 'abyss', bg: '#0e0e1a', wall: '#3a3a50', floor: '#1e1e30', floorAlt: '#181828', wallTop: '#4e4e66' },
  { name: 'ruins', bg: '#2b2218', wall: '#7a6848', floor: '#4a3d2e', floorAlt: '#3e3226', wallTop: '#8e7e58' }];
function getTheme(floor) { return THEMES[(floor - 1) % THEMES.length]; }

// ===== WEAPONS =====
const WEAPON_DEFS = [
  { id: 'sword', name: 'Sword', dmgMul: 1, range: 44, speed: 0.3, dur: 0.15, desc: 'Balanced', color: '#aaa' },
  { id: 'spear', name: 'Spear', dmgMul: 0.8, range: 64, speed: 0.35, dur: 0.12, desc: 'Long range', color: '#8ad' },
  { id: 'axe', name: 'Axe', dmgMul: 1.8, range: 48, speed: 0.5, dur: 0.2, desc: 'Slow but strong', color: '#d88' },
  { id: 'dagger', name: 'Dagger', dmgMul: 0.6, range: 32, speed: 0.15, dur: 0.08, desc: 'Very fast', color: '#ccc' },
  { id: 'hammer', name: 'Hammer', dmgMul: 2.2, range: 52, speed: 0.6, dur: 0.25, desc: 'Massive hits', color: '#b97' },
  { id: 'whip', name: 'Whip', dmgMul: 0.7, range: 72, speed: 0.4, dur: 0.18, desc: 'Widest range', color: '#c6a' }];

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
    const db = { x: d.x - 8, y: d.y - 8, w: 16, h: 16 };
    if (rectOverlap(pb, db)) {
      if (d.type === 'pollen') { pollen += 1 + Math.floor(floor / 3); Audio.drop(); }
      if (d.type === 'heal') { player.hp = Math.min(player.hp + 1, player.maxHp); emitParticles(d.x, d.y, '#2ecc71', 6, 60, 0.3); }
      drops.splice(i, 1);
    }
  }
}
function drawDrops() {
  for (const d of drops) {
    const bob = Math.sin(d.bobTimer * 4) * 3;
    ctx.globalAlpha = d.life < 2 ? d.life / 2 : 1;
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

// ===== STATE =====
let roomMap = [], floor = 1, wave = 0, WAVES = [];
let gameState = 'title', clearTimer = 0, shakeTimer = 0, shakeIntensity = 0, score = 0, pollen = 0;
let fadeAlpha = 0, fadeDir = 0, fadeCallback = null;
let titleBlink = 0;

const player = { x: TILE * 10, y: TILE * 5, w: 36, h: 36, speed: 200, hp: 5, maxHp: 5, atk: 1,
  attacking: false, atkTimer: 0, atkDuration: 0.15, atkCooldown: 0,
  atkDir: { x: 0, y: 1 }, dashing: false, dashTimer: 0, dashDuration: 0.15, dashCooldown: 0,
  dashSpeed: 600, dashDir: { x: 0, y: 0 }, invTimer: 0, invDuration: 0.6, animTimer: 0, frame: 0,
  weapon: WEAPON_DEFS[0], atkRangeBonus: 0, spriteData: null };

// ===== ENEMIES =====
const enemies = [];
const dmgNumbers = [];
function spawnDmg(x, y, val, color) { dmgNumbers.push({ x, y, val: String(val), color: color || COL.dmg, life: 0.8 }); }

const ENEMY_COLORS = ['#e74c3c', '#8e44ad', '#e67e22', '#3498db', '#1abc9c', '#e84393', '#d35400', '#2c3e50', '#c0392b', '#6c5ce7', '#00b894', '#fd79a8'];

const ENEMY_DEFS = {
  mushroom:  { hp: 3, speed: 55, w: 36, h: 36, dmg: 1, pattern: 'wander', score: 10, color: '#e74c3c', shape: 'mushroom' },
  slime:     { hp: 4, speed: 45, w: 34, h: 28, dmg: 1, pattern: 'wander', score: 10, color: '#2ecc71', shape: 'blob' },
  spider:    { hp: 4, speed: 90, w: 36, h: 36, dmg: 1, pattern: 'chase', score: 20, color: '#8e44ad', shape: 'spider' },
  bat:       { hp: 3, speed: 110, w: 32, h: 32, dmg: 1, pattern: 'chase', score: 15, color: '#34495e', shape: 'bat' },
  beetle:    { hp: 6, speed: 50, w: 44, h: 44, dmg: 2, pattern: 'charge', score: 30, color: '#e67e22', shape: 'beetle', chargeSpeed: 300, telegraphTime: 0.6, chargeTime: 0.3 },
  wasp:      { hp: 5, speed: 100, w: 36, h: 36, dmg: 2, pattern: 'chase', score: 25, color: '#f1c40f', shape: 'wasp' },
  flower:    { hp: 7, speed: 0, w: 40, h: 40, dmg: 1, pattern: 'shoot', score: 25, color: '#e84393', shape: 'flower', shootInterval: 2.0 },
  worm:      { hp: 8, speed: 35, w: 44, h: 32, dmg: 2, pattern: 'wander', score: 20, color: '#a0522d', shape: 'worm' },
  ghost:     { hp: 5, speed: 70, w: 36, h: 36, dmg: 1, pattern: 'teleport', score: 30, color: '#bdc3c7', shape: 'ghost' },
  golem:     { hp: 12, speed: 30, w: 48, h: 48, dmg: 3, pattern: 'charge', score: 40, color: '#7f8c8d', shape: 'golem', chargeSpeed: 200, telegraphTime: 0.8, chargeTime: 0.4 },
  vine:      { hp: 6, speed: 0, w: 36, h: 36, dmg: 1, pattern: 'shoot', score: 20, color: '#27ae60', shape: 'vine', shootInterval: 1.5 },
  darkbee:   { hp: 8, speed: 95, w: 40, h: 40, dmg: 2, pattern: 'chase', score: 35, color: '#2c3e50', shape: 'darkbee' }
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
        shakeTimer = 0.1; shakeIntensity = 5; Audio.hurt();
        spawnDmg(player.x + player.w / 2, player.y, p.dmg, '#fff');
        emitParticles(player.x + player.w / 2, player.y + player.h / 2, '#fff', 4, 80, 0.2);
        if (player.hp <= 0) gameState = 'dead';
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
    hp: Math.ceil(def.hp * sc), maxHp: Math.ceil(def.hp * sc), dmg: Math.ceil(def.dmg * (1 + floor * 0.1)),
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
  const pool = THEME_ENEMIES[th.name] || THEME_ENEMIES.forest;
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
  { id: 'queen_hornet', name: 'Queen Hornet', hp: 30, speed: 70, w: 56, h: 56, dmg: 3, color: '#f39c12', pattern: 'boss_charge', score: 200, phases: 2 },
  { id: 'fungus_king', name: 'Fungus King', hp: 45, speed: 40, w: 64, h: 64, dmg: 2, color: '#e74c3c', pattern: 'boss_shoot', score: 300, phases: 2 },
  { id: 'crystal_golem', name: 'Crystal Golem', hp: 60, speed: 30, w: 64, h: 64, dmg: 4, color: '#3498db', pattern: 'boss_slam', score: 400, phases: 3 },
  { id: 'shadow_moth', name: 'Shadow Moth', hp: 50, speed: 90, w: 52, h: 52, dmg: 3, color: '#9b59b6', pattern: 'boss_teleport', score: 350, phases: 2 }];

function isBossFloor() { return floor % 3 === 0; }

function spawnBoss() {
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
        player.hp -= boss.dmg; player.invTimer = player.invDuration; Audio.hurt();
        spawnDmg(player.x + player.w / 2, player.y, boss.dmg, '#fff'); if (player.hp <= 0) gameState = 'dead'; }
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
      player.hp -= boss.dmg; player.invTimer = player.invDuration; shakeTimer = 0.12; shakeIntensity = 6; Audio.hurt();
      spawnDmg(player.x + player.w / 2, player.y, boss.dmg, '#fff');
      const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
      moveWithCollision(player, Math.cos(angle) * 40, Math.sin(angle) * 40);
      if (player.hp <= 0) gameState = 'dead';
    }
  }
}

// ===== BLESSINGS =====
const BLESSING_POOL = [
  { id: 'atk_up', name: 'ATK UP', desc: 'Attack +1', icon: '\u2694', apply: () => { player.atk += 1; } },
  { id: 'hp_up', name: 'HP UP', desc: 'Max HP +1 & heal', icon: '\u2665', apply: () => { player.maxHp += 1; player.hp = player.maxHp; } },
  { id: 'speed_up', name: 'SPEED UP', desc: 'Move +15%', icon: '\u21E8', apply: () => { player.speed *= 1.15; } },
  { id: 'heal', name: 'HEAL', desc: 'Full recovery', icon: '\u2728', apply: () => { player.hp = player.maxHp; } },
  { id: 'dash_up', name: 'DASH UP', desc: 'Dash CD -30%', icon: '\u26A1', apply: () => { player.dashCooldown *= 0.7; } },
  { id: 'crit', name: 'CRITICAL', desc: 'ATK +2', icon: '\uD83D\uDDE1', apply: () => { player.atk += 2; } },
  { id: 'armor', name: 'ARMOR', desc: 'Inv time +40%', icon: '\uD83D\uDEE1', apply: () => { player.invDuration *= 1.4; } },
  { id: 'range', name: 'RANGE', desc: 'Attack range +', icon: '\uD83C\uDFF9', apply: () => { player.atkRangeBonus = (player.atkRangeBonus || 0) + 10; } },
  { id: 'vampiric', name: 'VAMPIRIC', desc: 'Kills heal 1HP', icon: '\uD83E\uDE78', apply: () => { player.vampiric = true; } },
  { id: 'thorns', name: 'THORNS', desc: 'Reflect 1 dmg', icon: '\uD83C\uDF35', apply: () => { player.thorns = (player.thorns || 0) + 1; } }];
let blessingChoices = [], activeBlessings = [];

function pickBlessings() {
  const pool = [...BLESSING_POOL]; const picks = [];
  for (let i = 0; i < 3 && pool.length > 0; i++) { const idx = Math.floor(rng() * pool.length); picks.push(pool.splice(idx, 1)[0]); }
  return picks;
}

// ===== SHOP =====
let shopItems = [];
function buildShop() {
  shopItems = [];
  // Heal
  shopItems.push({ name: 'Heal +2', cost: 3 + floor, icon: '\u2665', action: () => { player.hp = Math.min(player.hp + 2, player.maxHp); } });
  // Random weapon
  const wep = WEAPON_DEFS[Math.floor(rng() * WEAPON_DEFS.length)];
  shopItems.push({ name: wep.name, cost: 5 + floor * 2, icon: '\u2694', desc: wep.desc, action: () => { player.weapon = wep; } });
  // Max HP
  shopItems.push({ name: 'Max HP +1', cost: 8 + floor * 2, icon: '\u2B06', action: () => { player.maxHp += 1; player.hp += 1; } });
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
  roomMap = generateRoom(floor);
  if (isBossFloor()) { boss = null; enemies.length = 0; projectiles.length = 0; drops.length = 0; spawnBoss(); WAVES = []; wave = 0; }
  else { boss = null; WAVES = buildWaves(); wave = 0; drops.length = 0; spawnWave(); }
  player.x = TILE * 10; player.y = TILE * 5;
  player.invTimer = 0; player.attacking = false; player.atkCooldown = 0;
  player.dashing = false; player.dashCooldown = 0;
  dmgNumbers.length = 0; particles.length = 0;
  gameState = 'playing'; clearTimer = 0;
  startFade(-1, null);
}

function nextFloor() { floor++; startFade(1, () => startFloor()); }

function resetGame() {
  floor = 1; wave = 0; score = 0; pollen = 0; boss = null;
  player.hp = 5; player.maxHp = 5; player.atk = 1; player.speed = 200;
  player.invDuration = 0.6; player.dashCooldown = 0; player.atkRangeBonus = 0;
  player.weapon = WEAPON_DEFS[0]; player.vampiric = false; player.thorns = 0;
  activeBlessings = []; drops.length = 0; projectiles.length = 0; particles.length = 0;
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

  if (gameState === 'title') { titleBlink += dt; if (wasPressed('KeyZ')) { Audio.blessing(); resetGame(); } return; }
  if (gameState === 'blessing') {
    if (wasPressed('Digit1') && blessingChoices[0]) { blessingChoices[0].apply(); activeBlessings.push(blessingChoices[0]); Audio.blessing(); nextFloor(); }
    if (wasPressed('Digit2') && blessingChoices[1]) { blessingChoices[1].apply(); activeBlessings.push(blessingChoices[1]); Audio.blessing(); nextFloor(); }
    if (wasPressed('Digit3') && blessingChoices[2]) { blessingChoices[2].apply(); activeBlessings.push(blessingChoices[2]); Audio.blessing(); nextFloor(); }
    return;
  }
  if (gameState === 'shop') {
    for (let i = 0; i < shopItems.length; i++) {
      if (wasPressed('Digit' + (i + 1)) && pollen >= shopItems[i].cost) { pollen -= shopItems[i].cost; shopItems[i].action(); Audio.buy(); shopItems.splice(i, 1); break; }
    }
    if (wasPressed('KeyZ') || wasPressed('Escape')) { gameState = 'blessing'; blessingChoices = pickBlessings(); }
    return;
  }
  if (gameState === 'waveWait') { clearTimer += dt; if (clearTimer > 1.0) { spawnWave(); gameState = 'playing'; } return; }
  if (gameState === 'floorClear') { clearTimer += dt; if (clearTimer > 1.5) {
    if (floor % 2 === 0) { gameState = 'shop'; buildShop(); } else { gameState = 'blessing'; blessingChoices = pickBlessings(); }
  } return; }
  if (gameState === 'dead') { if (wasPressed('KeyZ')) { gameState = 'title'; } return; }

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
  if (player.dashing) { player.dashTimer -= dt; if (player.dashTimer <= 0) player.dashing = false;
    else moveWithCollision(player, player.dashDir.x * player.dashSpeed * dt, player.dashDir.y * player.dashSpeed * dt); }
  else {
    if (wasPressed('KeyX') && player.dashCooldown <= 0 && (mx !== 0 || my !== 0)) {
      player.dashing = true; player.dashTimer = player.dashDuration; player.dashCooldown = 0.5;
      player.dashDir.x = mx; player.dashDir.y = my; player.invTimer = player.dashDuration; Audio.dash();
      emitParticles(player.x + player.w / 2, player.y + player.h / 2, COL.player, 5, 60, 0.2);
    }
    if (!player.dashing && !player.attacking) moveWithCollision(player, mx * player.speed * dt, my * player.speed * dt);
  }

  // === Attack ===
  player.atkCooldown = Math.max(0, player.atkCooldown - dt);
  if (wasPressed('KeyZ') && player.atkCooldown <= 0 && !player.attacking && !player.dashing) {
    player.attacking = true; player.atkTimer = player.weapon.dur; player.atkCooldown = player.weapon.speed;
    const box = getAttackBox();
    const atkDmg = Math.ceil(player.atk * player.weapon.dmgMul);
    // Hit enemies
    for (const en of enemies) { if (en.hp <= 0) continue;
      if (rectOverlap(box, en)) { en.hp -= atkDmg; en.hitFlash = 0.1; spawnDmg(en.x + en.w / 2, en.y, atkDmg, COL.dmg);
        shakeTimer = 0.05; shakeIntensity = 3; Audio.hit();
        emitParticles(en.x + en.w / 2, en.y + en.h / 2, '#fff', 3, 60, 0.2);
        const angle = Math.atan2(en.y - player.y, en.x - player.x); moveWithCollision(en, Math.cos(angle) * 20, Math.sin(angle) * 20); } }
    // Hit boss
    if (boss && boss.hp > 0 && rectOverlap(box, boss)) {
      boss.hp -= atkDmg; boss.hitFlash = 0.1; spawnDmg(boss.x + boss.w / 2, boss.y, atkDmg, COL.dmg);
      shakeTimer = 0.06; shakeIntensity = 4; Audio.hit();
      emitParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#fff', 5, 80, 0.3);
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
        spawnDmg(player.x + player.w / 2, player.y, en.dmg, '#fff'); Audio.hurt();
        emitParticles(player.x + player.w / 2, player.y + player.h / 2, '#fff', 4, 80, 0.2);
        const angle = Math.atan2(player.y - en.y, player.x - en.x); moveWithCollision(player, Math.cos(angle) * 30, Math.sin(angle) * 30);
        if (player.thorns) { en.hp -= player.thorns; en.hitFlash = 0.1; spawnDmg(en.x + en.w / 2, en.y, player.thorns, '#c0392b'); }
        if (player.hp <= 0) gameState = 'dead';
      }
    }
  }

  // Boss update
  updateBoss(dt);

  // Remove dead enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hp <= 0) {
      score += enemies[i].score;
      emitParticles(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, enemies[i].color, 8, 80, 0.4);
      Audio.kill();
      if (player.vampiric) player.hp = Math.min(player.hp + 1, player.maxHp);
      // Drops
      if (Math.random() < 0.4) spawnDrop(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, 'pollen');
      if (Math.random() < 0.15) spawnDrop(enemies[i].x + enemies[i].w / 2 + 10, enemies[i].y + enemies[i].h / 2, 'heal');
      enemies.splice(i, 1);
    }
  }

  // Boss death
  if (boss && boss.hp <= 0) {
    score += boss.score || 200; Audio.clear();
    emitParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.color, 20, 120, 0.6);
    for (let i = 0; i < 5; i++) spawnDrop(boss.x + boss.w / 2 + (Math.random() - 0.5) * 40, boss.y + boss.h / 2 + (Math.random() - 0.5) * 40, 'pollen');
    boss = null; gameState = 'floorClear'; clearTimer = 0;
  }

  // Wave clear
  if (!boss && enemies.length === 0 && gameState === 'playing') {
    wave++;
    if (wave >= WAVES.length) { gameState = 'floorClear'; clearTimer = 0; Audio.clear(); }
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
    } else {
      ctx.fillStyle = (c + r) % 2 === 0 ? th.floor : th.floorAlt; ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      // subtle tile border
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.strokeRect(c * TILE, r * TILE, TILE, TILE);
    }
  }
}

function drawEntity(e, color, isP) {
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx, e.y + e.h + 2, e.w / 2.5, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : color;
  if (isP && player.invTimer > 0 && Math.floor(player.invTimer * 10) % 2 === 0) ctx.globalAlpha = 0.4;
  // Body
  const rr = 6; ctx.beginPath(); ctx.moveTo(e.x + rr, e.y); ctx.lineTo(e.x + e.w - rr, e.y);
  ctx.quadraticCurveTo(e.x + e.w, e.y, e.x + e.w, e.y + rr); ctx.lineTo(e.x + e.w, e.y + e.h - rr);
  ctx.quadraticCurveTo(e.x + e.w, e.y + e.h, e.x + e.w - rr, e.y + e.h); ctx.lineTo(e.x + rr, e.y + e.h);
  ctx.quadraticCurveTo(e.x, e.y + e.h, e.x, e.y + e.h - rr); ctx.lineTo(e.x, e.y + rr);
  ctx.quadraticCurveTo(e.x, e.y, e.x + rr, e.y); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = isP ? COL.playerOutline : '#333'; ctx.lineWidth = 2; ctx.stroke(); ctx.globalAlpha = 1;
  // Eyes
  const eyeY = cy - 2, eyeOff = e.w * 0.18; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx - eyeOff, eyeY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + eyeOff, eyeY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222'; const lx = isP ? player.atkDir.x * 1.5 : 0, ly = isP ? player.atkDir.y * 1.5 : 0;
  ctx.beginPath(); ctx.arc(cx - eyeOff + lx, eyeY + ly, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + eyeOff + lx, eyeY + ly, 2, 0, Math.PI * 2); ctx.fill();
  // Player crown
  if (isP) { ctx.fillStyle = COL.player; ctx.beginPath(); ctx.moveTo(cx - 6, e.y); ctx.lineTo(cx, e.y - 10); ctx.lineTo(cx + 6, e.y); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, e.y - 12, 3, 0, Math.PI * 2); ctx.fill();
    // Direction indicator
    const dirX = player.atkDir.x, dirY = player.atkDir.y;
    const indX = cx + dirX * (e.w / 2 + 8), indY = cy + dirY * (e.h / 2 + 8);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.moveTo(indX + dirX * 6, indY + dirY * 6);
    ctx.lineTo(indX - dirY * 4, indY + dirX * 4); ctx.lineTo(indX + dirY * 4, indY - dirX * 4);
    ctx.closePath(); ctx.fill(); }
}

function drawHPBar(e, yOff) {
  const bW = e.w + 4, bH = 5, bx = e.x - 2, by = e.y + yOff;
  ctx.fillStyle = COL.hpBg; ctx.fillRect(bx, by, bW, bH);
  const ratio = Math.max(0, e.hp / e.maxHp);
  ctx.fillStyle = ratio > 0.5 ? COL.hp : ratio > 0.25 ? '#f39c12' : COL.hpLost; ctx.fillRect(bx, by, bW * ratio, bH);
}

function drawAttackEffect() {
  if (!player.attacking) return;
  const box = getAttackBox();
  ctx.fillStyle = COL.attack; ctx.fillRect(box.x, box.y, box.w, box.h);
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  ctx.strokeStyle = player.weapon.color || '#fff'; ctx.lineWidth = 3; ctx.beginPath();
  const ba = Math.atan2(player.atkDir.y, player.atkDir.x); ctx.arc(cx, cy, 22, ba - 0.8, ba + 0.8); ctx.stroke();
  emitParticles(cx, cy, player.weapon.color || '#fff', 1, 40, 0.15);
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
  ctx.fillStyle = '#ff0'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', cx, en.y - 8);
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
  drawEntity(boss, boss.hitFlash > 0 ? '#fff' : boss.color, false);
  // Boss HP bar (top of screen)
  const bw = 300, bh = 12, bx = CW / 2 - bw / 2, by = 8;
  ctx.fillStyle = COL.hpBg; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = COL.hpLost; ctx.fillRect(bx, by, bw * Math.max(0, boss.hp / boss.maxHp), bh);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = COL.text; ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(boss.name + ' P' + boss.phase, CW / 2, by + bh + 12); ctx.textAlign = 'left';
}

function drawHUD() {
  // HP
  const hs = 20;
  for (let i = 0; i < player.maxHp; i++) { ctx.fillStyle = i < player.hp ? COL.hpLost : '#444'; ctx.font = hs + 'px sans-serif'; ctx.fillText(i < player.hp ? '\u2665' : '\u2661', 12 + i * (hs + 4), 12 + hs); }
  // Score & pollen
  ctx.fillStyle = COL.text; ctx.font = '16px sans-serif'; ctx.textAlign = 'right'; ctx.fillText('SCORE: ' + score, CW - 12, 28); ctx.textAlign = 'left';
  ctx.fillStyle = COL.pollen; ctx.font = '14px sans-serif'; ctx.fillText('\uD83C\uDF3C ' + pollen, CW - 120, 48);
  // Floor & wave
  ctx.fillStyle = COL.bless; ctx.font = 'bold 14px sans-serif'; ctx.fillText('F' + floor, CW / 2 - 50, 28);
  if (!isBossFloor() || !boss) { ctx.fillStyle = COL.text; ctx.font = '14px sans-serif'; ctx.fillText('W' + (Math.min(wave + 1, WAVES.length)) + '/' + WAVES.length, CW / 2 - 20, 28); }
  else { ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 14px sans-serif'; ctx.fillText('BOSS', CW / 2 - 20, 28); }
  // Weapon
  ctx.fillStyle = player.weapon.color; ctx.font = '12px sans-serif'; ctx.fillText('\u2694 ' + player.weapon.name, 12, CH - 28);
  ctx.fillStyle = COL.text; ctx.font = '12px sans-serif'; ctx.fillText('ATK:' + Math.ceil(player.atk * player.weapon.dmgMul), 12, CH - 14);
  // Blessings
  if (activeBlessings.length > 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '14px sans-serif';
    for (let i = 0; i < activeBlessings.length; i++) ctx.fillText(activeBlessings[i].icon, CW - 20 - (activeBlessings.length - i) * 22, 68); }
  // Controls
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '11px sans-serif'; ctx.fillText('WASD:move Z:attack X:dash', CW / 2 - 80, CH - 6);
}

function drawBlessing() {
  if (gameState !== 'blessing') return;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = COL.bless; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BLESSING', CW / 2, 70);
  ctx.fillStyle = COL.text; ctx.font = '14px sans-serif'; ctx.fillText('Choose (1, 2, 3)', CW / 2, 95);
  for (let i = 0; i < blessingChoices.length; i++) {
    const b = blessingChoices[i], bx = CW / 2 - 300 + i * 220, by = 120, bw = 180, bh = 220;
    ctx.fillStyle = COL.blessBox; ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = COL.bless; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = COL.text; ctx.font = 'bold 36px sans-serif'; ctx.fillText(b.icon, bx + bw / 2, by + 60);
    ctx.fillStyle = COL.bless; ctx.font = 'bold 18px sans-serif'; ctx.fillText(b.name, bx + bw / 2, by + 100);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '13px sans-serif'; ctx.fillText(b.desc, bx + bw / 2, by + 130);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('[' + (i + 1) + ']', bx + bw / 2, by + 190);
  }
  ctx.textAlign = 'left';
}

function drawShop() {
  if (gameState !== 'shop') return;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = COL.pollen; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SHOP', CW / 2, 70);
  ctx.fillStyle = COL.text; ctx.font = '14px sans-serif'; ctx.fillText('Pollen: ' + pollen + '  (Z or Esc to skip)', CW / 2, 95);
  for (let i = 0; i < shopItems.length; i++) {
    const s = shopItems[i], sx = CW / 2 - 250 + i * 200, sy = 120, sw = 180, sh = 200;
    ctx.fillStyle = pollen >= s.cost ? COL.blessBox : 'rgba(60,30,30,0.9)'; ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = pollen >= s.cost ? COL.pollen : '#555'; ctx.lineWidth = 2; ctx.strokeRect(sx, sy, sw, sh);
    ctx.fillStyle = COL.text; ctx.font = '28px sans-serif'; ctx.fillText(s.icon, sx + sw / 2, sy + 50);
    ctx.fillStyle = COL.pollen; ctx.font = 'bold 16px sans-serif'; ctx.fillText(s.name, sx + sw / 2, sy + 85);
    if (s.desc) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '12px sans-serif'; ctx.fillText(s.desc, sx + sw / 2, sy + 105); }
    ctx.fillStyle = COL.pollen; ctx.font = 'bold 14px sans-serif'; ctx.fillText(s.cost + ' pollen', sx + sw / 2, sy + 140);
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('[' + (i + 1) + ']', sx + sw / 2, sy + 180);
  }
  ctx.textAlign = 'left';
}

function drawTitle() {
  const th = THEMES[0];
  ctx.fillStyle = th.bg; ctx.fillRect(0, 0, CW, CH);
  // Simple bg decoration
  for (let i = 0; i < 15; i++) { ctx.fillStyle = 'rgba(255,215,0,' + (0.03 + Math.sin(titleBlink + i) * 0.02) + ')';
    ctx.beginPath(); ctx.arc(100 + i * 60, 200 + Math.sin(titleBlink * 0.5 + i * 0.7) * 40, 20 + i * 2, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = COL.player; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('MIPURIN ADVENTURE', CW / 2, CH / 2 - 40);
  ctx.fillStyle = COL.text; ctx.font = '18px sans-serif';
  ctx.fillText('v2.0', CW / 2, CH / 2);
  ctx.globalAlpha = 0.5 + Math.sin(titleBlink * 3) * 0.5;
  ctx.fillStyle = COL.text; ctx.font = '20px sans-serif';
  ctx.fillText('Press Z to Start', CW / 2, CH / 2 + 60);
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '12px sans-serif';
  ctx.fillText('WASD: Move  Z: Attack  X: Dash', CW / 2, CH - 30);
  ctx.textAlign = 'left';
}

function drawGameState() {
  if (gameState === 'waveWait') { ctx.fillStyle = COL.text; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('WAVE ' + (wave + 1), CW / 2, CH / 2); ctx.textAlign = 'left'; }
  if (gameState === 'floorClear') { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = COL.clear; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('FLOOR ' + floor + ' CLEAR!', CW / 2, CH / 2); ctx.textAlign = 'left'; }
  if (gameState === 'dead') { ctx.fillStyle = 'rgba(80,0,0,0.7)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = COL.hpLost; ctx.font = 'bold 48px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('GAME OVER', CW / 2, CH / 2 - 30);
    ctx.fillStyle = COL.text; ctx.font = '20px sans-serif'; ctx.fillText('Floor ' + floor + '  Score: ' + score, CW / 2, CH / 2 + 10);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '16px sans-serif'; ctx.fillText('Z: Title', CW / 2, CH / 2 + 50); ctx.textAlign = 'left'; }
}

function drawDmgNumbers() {
  for (const d of dmgNumbers) { ctx.globalAlpha = clamp(d.life / 0.3, 0, 1); ctx.fillStyle = d.color; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(d.val, d.x, d.y); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
}

function draw() {
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

  // Fade overlay
  if (fadeAlpha > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
}

// ===== MAIN LOOP =====
let lastTime = 0;
function loop(time) {
  const rawDt = (time - lastTime) / 1000; lastTime = time;
  const dt = Math.min(rawDt, 0.05);
  update(dt); draw();
  for (const k in pressed) pressed[k] = false;
  requestAnimationFrame(loop);
}
requestAnimationFrame(t => { lastTime = t; requestAnimationFrame(loop); });
