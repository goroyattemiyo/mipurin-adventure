// ===== ENEMIES =====
const enemies = [];
const dmgNumbers = [];
function spawnDmg(x, y, val, color) { dmgNumbers.push({ x, y, val: String(val), color: color || COL.dmg, life: 0.8 }); }

const ENEMY_COLORS = ['#e74c3c', '#8e44ad', '#e67e22', '#3498db', '#1abc9c', '#e84393', '#d35400', '#2c3e50', '#c0392b', '#6c5ce7', '#00b894', '#fd79a8'];

const ENEMY_DEFS = {
  mushroom:  { hp: 3, speed: 55, w: 48, h: 48, dmg: 1, pattern: 'wander', score: 10, color: '#e74c3c', shape: 'mushroom', name: 'どくキノコ', lore: '闇の胞子で変異したキノコ。もとは花の国の薬草だった' },
  slime:     { hp: 4, speed: 45, w: 44, h: 36, dmg: 1, pattern: 'wander', score: 10, color: '#2ecc71', shape: 'blob', name: 'はちみつスライム', lore: 'こぼれた蜜から生まれた。ぷるぷるしていてちょっとかわいい' },
  spider:    { hp: 4, speed: 90, w: 48, h: 48, dmg: 1, pattern: 'chase', score: 20, color: '#8e44ad', shape: 'spider', name: 'あみぐもちゃん', lore: '花の国の糸使い。すばしっこくて追いかけてくる！' },
  bat:       { hp: 3, speed: 110, w: 42, h: 42, dmg: 1, pattern: 'chase', score: 15, color: '#34495e', shape: 'bat', name: 'やみコウモリ', lore: '洞窟に住む小さなコウモリ。暗いところが大好き' },
  beetle:    { hp: 6, speed: 50, w: 52, h: 52, dmg: 2, pattern: 'charge', score: 30, color: '#e67e22', shape: 'beetle', name: 'かぶとむしナイト', lore: '立派なツノで突進してくる！赤く光ったら要注意', chargeSpeed: 300, telegraphTime: 0.6, chargeTime: 0.3 },
  wasp:      { hp: 5, speed: 100, w: 48, h: 48, dmg: 2, pattern: 'chase', score: 25, color: '#f1c40f', shape: 'wasp', name: 'わるいハチ', lore: 'ミプリンと違って意地悪なハチ。すごく速い！' },
  flower:    { hp: 7, speed: 0, w: 48, h: 48, dmg: 1, pattern: 'shoot', score: 25, color: '#e84393', shape: 'flower', name: 'パクパクフラワー', lore: '動けないけど花粉弾を飛ばしてくる。きれいだけど危険！', shootInterval: 2.0 },
  worm:      { hp: 8, speed: 35, w: 52, h: 40, dmg: 2, pattern: 'wander', score: 20, color: '#a0522d', shape: 'worm', name: 'もぐもぐイモムシ', lore: 'のんびり屋だけど体が丈夫。踏まないように注意！' },
  ghost:     { hp: 5, speed: 70, w: 48, h: 48, dmg: 1, pattern: 'teleport', score: 30, color: '#bdc3c7', shape: 'ghost', name: 'ひとだまホタル', lore: 'クリスタルの破片に引き寄せられた霊体。光に未練があるらしい…' },
  golem:     { hp: 12, speed: 30, w: 48, h: 48, dmg: 3, pattern: 'charge', score: 40, color: '#7f8c8d', shape: 'golem', name: 'いわいわゴーレム', lore: '女王さまがつくった古い番人。封印の力が弱まり暴走している', chargeSpeed: 200, telegraphTime: 0.8, chargeTime: 0.4 },
  vine:      { hp: 6, speed: 0, w: 48, h: 48, dmg: 1, pattern: 'shoot', score: 20, color: '#27ae60', shape: 'vine', name: 'つるつるツタ', lore: '地面から生えたツタ。種を飛ばして攻撃してくる', shootInterval: 1.5 },
  darkbee:   { hp: 8, speed: 95, w: 48, h: 48, dmg: 2, pattern: 'chase', score: 35, color: '#2c3e50', shape: 'darkbee', name: 'ダークビー', lore: '闇の胞子に染まったミツバチ。かつてはミプリンの仲間だった… クリスタルが元に戻れば救えるかもしれない' }
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
  { id: 'queen_hornet', name: 'スズメバチの女王', hp: 30, speed: 70, w: 112, h: 112, dmg: 3, color: '#f39c12', pattern: 'boss_charge', score: 200, phases: 2 },
  { id: 'fungus_king', name: 'キノコの王', hp: 45, speed: 40, w: 128, h: 128, dmg: 2, color: '#e74c3c', pattern: 'boss_shoot', score: 300, phases: 2 },
  { id: 'crystal_golem', name: 'クリスタルゴーレム', hp: 60, speed: 30, w: 128, h: 128, dmg: 4, color: '#3498db', pattern: 'boss_slam', score: 400, phases: 3 },
  { id: 'shadow_moth', name: '闇の蛾', hp: 50, speed: 90, w: 104, h: 104, dmg: 3, color: '#9b59b6', pattern: 'boss_teleport', score: 350, phases: 2 }];

const MAX_FLOOR = 15;
function isBossFloor() { return floor % 3 === 0; }

function spawnBoss() { Audio.boss_appear();
  shakeTimer = 0.3; shakeIntensity = 8; emitParticles(CW/2, CH/2, '#ffd700', 15, 100, 0.6);
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

