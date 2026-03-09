// ===== BGM SYSTEM =====
let bgmAudio = null, currentBGM = '';
function playBGM(name) {
  if (currentBGM === name) return;
  stopBGM();
  currentBGM = name;
  bgmAudio = new window.Audio('assets/music/' + name + '.mp3');
  bgmAudio.loop = true; bgmAudio.volume = 0.3;
  bgmAudio.onerror = () => { bgmAudio = null; currentBGM = ''; };
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

// ===== FLOOR SIZE =====
function getFloorBounds(floor) {
  if (isBossFloor()) return { c0: 1, r0: 1, c1: COLS - 2, r1: ROWS - 2 }; // full
  if (floor <= 2) return { c0: 3, r0: 2, c1: COLS - 4, r1: ROWS - 3 }; // 14x11
  if (floor <= 5) return { c0: 2, r0: 1, c1: COLS - 3, r1: ROWS - 2 }; // 16x13
  return { c0: 1, r0: 1, c1: COLS - 2, r1: ROWS - 2 }; // 18x14 or full
}
// ===== PARTICLES =====
const particles = [];
function emitParticles(x, y, color, count, spd, life) {
  const maxNew = Math.min(count, 60 - particles.length); for (let i = 0; i < maxNew; i++) {
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
  forest:  ['pillars', 'scattered', 'corridors'],
  cave:    ['corridors', 'ring', 'scattered'],
  flower:  ['pillars', 'scattered', 'ring'],
  abyss:   ['corridors', 'ring', 'pillars'],
  ruins:   ['ring', 'corridors', 'scattered']
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

function applyTemplate(map, name, fl) {
  const fb = getFloorBounds(fl);
  const mc = Math.floor((fb.c0 + fb.c1) / 2), mr = Math.floor((fb.r0 + fb.r1) / 2);
  const fw = fb.c1 - fb.c0, fh = fb.r1 - fb.r0;
  function put(c, r) { if (c > fb.c0 && c < fb.c1 && r > fb.r0 && r < fb.r1 && !safeZone(c, r)) map[r * COLS + c] = 1; }
  function clr(c, r) { if (c >= 0 && c < COLS && r >= 0 && r < ROWS) map[r * COLS + c] = 0; }

  if (name === 'pillars') {
    var spacing = fl <= 2 ? 3 : 4;
    for (var r = fb.r0 + 2; r < fb.r1 - 1; r += spacing) {
      for (var c = fb.c0 + 2; c < fb.c1 - 1; c += spacing) {
        if (rng() < 0.7) put(c, r);
      }
    }
  } else if (name === 'corridors') {
    var wallCount = 1 + Math.floor(rng() * 2);
    for (var w = 0; w < wallCount; w++) {
      var horiz = rng() > 0.5;
      if (horiz) {
        var wr = fb.r0 + 2 + Math.floor(rng() * Math.max(1, fh - 4));
        for (var c = fb.c0 + 1; c < fb.c1; c++) put(c, wr);
        var g1 = fb.c0 + 2 + Math.floor(rng() * Math.max(1, Math.floor(fw / 2)));
        var g2 = mc + 1 + Math.floor(rng() * Math.max(1, Math.floor(fw / 2) - 2));
        clr(g1, wr); clr(g1 + 1, wr); clr(g2, wr); clr(g2 + 1, wr);
      } else {
        var wc = fb.c0 + 3 + Math.floor(rng() * Math.max(1, fw - 6));
        for (var r = fb.r0 + 1; r < fb.r1; r++) put(wc, r);
        var g1 = fb.r0 + 2 + Math.floor(rng() * Math.max(1, Math.floor(fh / 2)));
        var g2 = mr + 1 + Math.floor(rng() * Math.max(1, Math.floor(fh / 2) - 2));
        clr(wc, g1); clr(wc, g1 + 1); clr(wc, g2); clr(wc, g2 + 1);
      }
    }
    for (var i = 0; i < 2 + Math.floor(rng() * 2); i++) {
      put(fb.c0 + 2 + Math.floor(rng() * Math.max(1, fw - 3)), fb.r0 + 2 + Math.floor(rng() * Math.max(1, fh - 3)));
    }
  } else if (name === 'arena') {
    var offC = Math.max(2, Math.floor(fw * 0.2)), offR = Math.max(2, Math.floor(fh * 0.25));
    put(mc - offC, mr - offR); put(mc + offC, mr - offR);
    put(mc - offC, mr + offR); put(mc + offC, mr + offR);
    put(fb.c0 + 2, fb.r0 + 2); put(fb.c0 + 3, fb.r0 + 2);
    put(fb.c1 - 2, fb.r0 + 2); put(fb.c1 - 3, fb.r0 + 2);
    put(fb.c0 + 2, fb.r1 - 2); put(fb.c0 + 3, fb.r1 - 2);
    put(fb.c1 - 2, fb.r1 - 2); put(fb.c1 - 3, fb.r1 - 2);
  } else if (name === 'scattered') {
    var cnt = 4 + Math.floor(fl * 0.8);
    for (var i = 0; i < cnt; i++) {
      var pc = fb.c0 + 2 + Math.floor(rng() * Math.max(1, fw - 3));
      var pr = fb.r0 + 2 + Math.floor(rng() * Math.max(1, fh - 3));
      put(pc, pr);
      if (rng() < 0.5) put(pc + (rng() > 0.5 ? 1 : 0), pr + (rng() > 0.5 ? 1 : 0));
    }
  } else if (name === 'ring') {
    var rx = Math.max(2, Math.floor(fw * 0.3)), ry = Math.max(2, Math.floor(fh * 0.3));
    for (var r = fb.r0 + 1; r < fb.r1; r++) {
      for (var c = fb.c0 + 1; c < fb.c1; c++) {
        var dx = (c - mc) / rx, dy = (r - mr) / ry, dist = dx * dx + dy * dy;
        if (dist > 0.6 && dist < 1.1) put(c, r);
      }
    }
    for (var d = -1; d <= 1; d++) { clr(mc + d, mr - ry); clr(mc + d, mr + ry); clr(mc - rx, mr + d); clr(mc + rx, mr + d); }
    if (rng() < 0.6) put(mc - 1, mr);
    if (rng() < 0.6) put(mc + 1, mr);
  } else {
    for (var i = 0; i < 3 + Math.floor(rng() * 3); i++) {
      put(fb.c0 + 2 + Math.floor(rng() * Math.max(1, fw - 3)), fb.r0 + 2 + Math.floor(rng() * Math.max(1, fh - 3)));
    }
  }
}

function generateRoom(fl) {
  var themeName = getTheme(fl).name;
  var templates = THEME_TEMPLATES[themeName] || ['pillars'];
  var pick = isBossFloor() ? 'arena' : templates[Math.floor(rng() * templates.length)];
  for (var attempt = 0; attempt < 5; attempt++) {
    var map = [];
    var _fb = getFloorBounds(fl);
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1 || r < _fb.r0 || r > _fb.r1 || c < _fb.c0 || c > _fb.c1) { map.push(1); continue; } map.push(0);
    }
    applyTemplate(map, pick, fl);
    roomSpikes = [];
    if (fl >= 4 && !isBossFloor()) {
      var maxSp = Math.min(2 + Math.floor((fl - 3) * 1.5), 10);
      for (var i = 0; i < maxSp; i++) {
        var sc, sr, tries = 0;
        do { sc = _fb.c0 + 1 + Math.floor(rng() * Math.max(1, _fb.c1 - _fb.c0 - 2)); sr = _fb.r0 + 1 + Math.floor(rng() * Math.max(1, _fb.r1 - _fb.r0 - 2)); tries++; }
        while (tries < 30 && (map[sr * COLS + sc] !== 0 || safeZone(sc, sr)));
        if (tries < 30 && map[sr * COLS + sc] === 0) { map[sr * COLS + sc] = 2; roomSpikes.push({ c: sc, r: sr }); }
      }
    }
    if (floodFill(map)) return map;
  }
  var map = [];
  var _fb2 = getFloorBounds(fl);
  for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
    if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1 || r < _fb2.r0 || r > _fb2.r1 || c < _fb2.c0 || c > _fb2.c1) map.push(1); else map.push(0);
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
  { id: 'queen_staff', name: '\ud83d\udc51 女王の杖', dmgMul: 2.0, range: 68, speed: 0.65, dur: 0.25, desc: 'チャージで範囲爆発！最強武器', color: '#e040fb', fx: 'aoe' },
  { id: 'golden_needle', name: '🐝 蜂の金針', dmgMul: 1.3, range: 68, speed: 0.16, dur: 0.15, desc: '3撃目に衝撃波！金色の連撃', color: '#ffaa00', fx: 'double', tier: 2, minFloor: 6, comboFx: 'shockwave' },
  { id: 'amber_cannon', name: '🍯 蜜の大砲', dmgMul: 1.8, range: 120, speed: 0.45, dur: 0.2, desc: '着弾に蜜だまり。敵が減速する', color: '#cc7700', fx: 'none', tier: 2, minFloor: 6, comboFx: 'honeypool' },
  { id: 'holy_shield', name: '✨ 聖花の盾', dmgMul: 1.0, range: 60, speed: 0.3, dur: 0.18, desc: 'パリィ成功でATK×4＋HP回復！', color: '#fff0d0', fx: 'none', tier: 2, minFloor: 9, comboFx: 'parry' },
  { id: 'cursed_thorn', name: '💜 呪いの荊', dmgMul: 0.9, range: 96, speed: 0.38, dur: 0.2, desc: '攻撃に毒付与。毒撃破で毒霧拡散', color: '#8e44ad', fx: '360', tier: 2, minFloor: 9, comboFx: 'poison' },
  { id: 'storm_wing', name: '🌪️ 翼の嵐', dmgMul: 0.7, range: 84, speed: 0.1, dur: 0.08, desc: '羽がホーミングで敵を追尾する！', color: '#00bcd4', fx: 'double', tier: 2, minFloor: 9, comboFx: 'homing' },
  { id: 'queen_true_staff', name: '💎 女王の真杖', dmgMul: 2.5, range: 76, speed: 0.5, dur: 0.3, desc: '爆発範囲1.5倍！クリスタルの光', color: '#e1bee7', fx: 'aoe', tier: 2, minFloor: 12, comboFx: 'megaaoe' }];


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
      if (Math.random() < 0.15) emitParticles(d.x, d.y, '#ffd700', 1, 30, 0.2);
    }
    const db = { x: d.x - 8, y: d.y - 8, w: 16, h: 16 };
    if (rectOverlap(pb, db)) {
      if (d.type === 'pollen') { emitParticles(d.x, d.y, '#f1c40f', 4, 50, 0.3); const amt = 1 + Math.floor(floor / 3); pollen += amt; Audio.item_get(); showFloat('\uD83C\uDF3C \u82B1\u7C89 +' + amt, 1.2, '#f1c40f'); }
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




// ===== HONEY POOL (蜜だまり) =====
const honeyPools = [];
function spawnHoneyPool(x, y) {
  honeyPools.push({ x, y, life: 3.0, radius: 40 });
}
function updateHoneyPools(dt) {
  for (let i = honeyPools.length - 1; i >= 0; i--) {
    honeyPools[i].life -= dt;
    if (honeyPools[i].life <= 0) { honeyPools.splice(i, 1); continue; }
    // 敵減速
    for (const en of enemies) {
      if (en.hp <= 0) continue;
      const dx = en.x + en.w/2 - honeyPools[i].x, dy = en.y + en.h/2 - honeyPools[i].y;
      if (Math.hypot(dx, dy) < honeyPools[i].radius) en._honeySlow = 0.3;
    }
    if (boss && boss.hp > 0) {
      const dx = boss.x + boss.w/2 - honeyPools[i].x, dy = boss.y + boss.h/2 - honeyPools[i].y;
      if (Math.hypot(dx, dy) < honeyPools[i].radius) boss._honeySlow = 0.3;
    }
  }
}
function drawHoneyPools() {
  for (const hp of honeyPools) {
    ctx.globalAlpha = 0.3 * (hp.life / 3.0);
    ctx.fillStyle = '#cc7700';
    ctx.beginPath(); ctx.arc(hp.x, hp.y, hp.radius, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.15 * (hp.life / 3.0);
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath(); ctx.arc(hp.x, hp.y, hp.radius * 0.6, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ===== HOMING PROJECTILES (ホーミング羽) =====
const homingProjs = [];
function spawnHomingProj(x, y, dmg) {
  homingProjs.push({ x, y, dmg, life: 2.0, speed: 180, size: 6 });
}
function updateHomingProjs(dt) {
  for (let i = homingProjs.length - 1; i >= 0; i--) {
    const h = homingProjs[i]; h.life -= dt;
    if (h.life <= 0) { homingProjs.splice(i, 1); continue; }
    // 最寄り敵を探す
    let nearest = null, nd = 9999;
    for (const en of enemies) {
      if (en.hp <= 0) continue;
      const d = Math.hypot(en.x + en.w/2 - h.x, en.y + en.h/2 - h.y);
      if (d < nd) { nd = d; nearest = en; }
    }
    if (boss && boss.hp > 0) {
      const d = Math.hypot(boss.x + boss.w/2 - h.x, boss.y + boss.h/2 - h.y);
      if (d < nd) { nd = d; nearest = boss; }
    }
    if (nearest) {
      const tx = (nearest.x || nearest.x) + (nearest.w||0)/2, ty = (nearest.y||nearest.y) + (nearest.h||0)/2;
      const dx = tx - h.x, dy = ty - h.y, d = Math.hypot(dx, dy) || 1;
      h.x += (dx/d) * h.speed * dt; h.y += (dy/d) * h.speed * dt;
      // 当たり判定
      if (d < 20) {
        nearest.hp -= h.dmg; nearest.hitFlash = 0.1;
        spawnDmg(nearest.x + (nearest.w||0)/2, nearest.y, h.dmg, '#00bcd4');
        emitParticles(h.x, h.y, '#00bcd4', 3, 40, 0.2);
        Audio.hit();
        homingProjs.splice(i, 1);
      }
    }
  }
}
function drawHomingProjs() {
  for (const h of homingProjs) {
    ctx.globalAlpha = h.life / 2.0;
    ctx.fillStyle = '#00bcd4';
    ctx.beginPath(); ctx.arc(h.x, h.y, h.size, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(h.x, h.y, h.size * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
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


// ===== End Message System =====

let gameState = 'title', clearTimer = 0, deadTimer = 0, shakeTimer = 0, shakeIntensity = 0, score = 0, pollen = 0;
let fadeAlpha = 0, fadeDir = 0, fadeCallback = null;
let titleBlink = 0;

const player = { x: TILE * 10, y: TILE * 7, w: 52, h: 52, speed: 200, hp: 5, maxHp: 5, atk: 1,
  attacking: false, atkTimer: 0, atkDuration: 0.15, atkCooldown: 0,
  atkDir: { x: 0, y: 1 }, dashing: false, dashTimer: 0, dashDuration: 0.22, dashCooldown: 0,
  dashSpeed: 700, dashDir: { x: 0, y: 0 }, invTimer: 0, invDuration: 0.6, animTimer: 0, frame: 0,
  weapon: WEAPON_DEFS[0], weapons: [WEAPON_DEFS[0], null], weaponIdx: 0, atkRangeBonus: 0, atkSpeedBonus: 0, spriteData: null, consumables: [null, null, null] };



// ===== NPC FLORA LINES =====
const NPC_LINES = [
  { cond: () => totalClears === 0, text: 'わたしはフローラ。女王さまにお仕えしていたの… クリスタルが砕けてから、女王さまが行方不明で…' },
  { cond: () => totalClears === 1, text: 'おかえり！ クリスタルのかけらの力を感じるわ。花壇に新しい芽がでたよ！' },
  { cond: () => totalClears === 2, text: 'あのボスたち… 本当は悪い子じゃないの。闇の胞子に操られていたんだと思う…' },
  { cond: () => totalClears === 3, text: 'クリスタルゴーレムは女王さまがつくった封印の番人だったの。封印が壊れて暴走してしまった…' },
  { cond: () => totalClears >= 5, text: '闇の蛾の奥にもっと大きな闇があるって… いつか女王さまを見つけられるかもしれない' },
  { cond: () => totalClears >= 8, text: 'ミプリンの中にクリスタルと同じ光を感じるの… もしかして女王さまの力が宿っている…？' },
  { cond: () => Object.values(gardenUpgrades).every(v => v >= 3), text: 'すべての花壇に精霊の力が満ちたわ。きっとクリスタルを元に戻せる日がくる…！' },
  { cond: () => nectar >= 500, text: 'こんなにたくさんのかけら… 女王さまもきっと喜んでいるわ' },
  { cond: () => true, text: 'クリスタルのかけらを集めて花壇を育てて。この国にもう一度花を咲かせよう' }
];
function getFloraLine() {
  for (const line of NPC_LINES) { if (line.cond()) return line.text; }
  return NPC_LINES[NPC_LINES.length - 1].text;
}
// ===== BACKGROUND PARTICLES (Sprint E) =====
const bgParticles = [];
const BG_PARTICLE_MAX = 40;
const BG_THEMES = {
  forest:  { icons: ['🍃','🌿','🍂'], colors: ['#8bc34a','#66bb6a','#a5d6a7'], drift: 15 },
  cave:    { icons: ['💎','✨','🪨'], colors: ['#90a4ae','#78909c','#b0bec5'], drift: 8 },
  flower:  { icons: ['🌸','🌺','🌷'], colors: ['#f48fb1','#f06292','#ec407a'], drift: 12 },
  abyss:   { icons: ['🔮','💜','✨'], colors: ['#9575cd','#7e57c2','#b39ddb'], drift: 10 },
  ruins:   { icons: ['🔥','💫','⭐'], colors: ['#ffb74d','#ffa726','#ff9800'], drift: 14 }
};
function spawnBgParticle(themeName) {
  const t = BG_THEMES[themeName] || BG_THEMES.forest;
  bgParticles.push({
    x: Math.random() * CW,
    y: -10,
    vx: (Math.random() - 0.5) * t.drift,
    vy: 10 + Math.random() * t.drift,
    rot: Math.random() * Math.PI * 2,
    rotSpd: (Math.random() - 0.5) * 2,
    alpha: 0.15 + Math.random() * 0.25,
    size: 10 + Math.random() * 8,
    icon: t.icons[Math.floor(Math.random() * t.icons.length)],
    color: t.colors[Math.floor(Math.random() * t.colors.length)]
  });
}
function updateBgParticles(dt, themeName) {
  // Spawn
  if (bgParticles.length < BG_PARTICLE_MAX && Math.random() < 0.15) spawnBgParticle(themeName);
  // Update
  for (let i = bgParticles.length - 1; i >= 0; i--) {
    const p = bgParticles[i];
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.rotSpd * dt;
    if (p.y > CH + 20 || p.x < -20 || p.x > CW + 20) bgParticles.splice(i, 1);
  }
}
function drawBgParticles() {
  for (const p of bgParticles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.font = p.size + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.icon, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ===== UI ANIMATION STATE (Sprint E Step 3) =====
let blessingAnimTimer = 0;    // blessing card slide-in timer
let hpBounceTimer = 0;        // HP heart bounce on damage
let floorClearAnimTimer = 0;  // floor clear text animation

// ===== TITLE PARTICLES =====
const titleParticles = [];
function updateTitleParticles() {
  if (titleParticles.length < 25 && Math.random() < 0.08) {
    titleParticles.push({
      x: Math.random() * CW, y: -10,
      vx: (Math.random() - 0.5) * 20,
      vy: 15 + Math.random() * 20,
      rot: Math.random() * Math.PI * 2,
      rotSpd: (Math.random() - 0.5) * 2,
      alpha: 0.2 + Math.random() * 0.3,
      size: 14 + Math.random() * 10,
      icon: ['🌸','🌺','🍃','✨','🌼'][Math.floor(Math.random() * 5)]
    });
  }
  for (let i = titleParticles.length - 1; i >= 0; i--) {
    const p = titleParticles[i];
    p.x += p.vx * 0.016; p.y += p.vy * 0.016; p.rot += p.rotSpd * 0.016;
    if (p.y > CH + 20) titleParticles.splice(i, 1);
  }
}
function drawTitleParticles() {
  for (const p of titleParticles) {
    ctx.save(); ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y); ctx.rotate(p.rot);
    ctx.font = p.size + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(p.icon, 0, 0);
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}
