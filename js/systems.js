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

