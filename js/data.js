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


// ===== End Message System =====

let gameState = 'title', clearTimer = 0, deadTimer = 0, shakeTimer = 0, shakeIntensity = 0, score = 0, pollen = 0;
let fadeAlpha = 0, fadeDir = 0, fadeCallback = null;
let titleBlink = 0;

const player = { x: TILE * 10, y: TILE * 7, w: 52, h: 52, speed: 200, hp: 5, maxHp: 5, atk: 1,
  attacking: false, atkTimer: 0, atkDuration: 0.15, atkCooldown: 0,
  atkDir: { x: 0, y: 1 }, dashing: false, dashTimer: 0, dashDuration: 0.15, dashCooldown: 0,
  dashSpeed: 600, dashDir: { x: 0, y: 0 }, invTimer: 0, invDuration: 0.6, animTimer: 0, frame: 0,
  weapon: WEAPON_DEFS[0], weapons: [WEAPON_DEFS[0], null], weaponIdx: 0, atkRangeBonus: 0, atkSpeedBonus: 0, spriteData: null, consumables: [null, null, null] };

