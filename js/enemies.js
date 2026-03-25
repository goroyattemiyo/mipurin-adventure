// === Loop color shift ===
function loopHueShift(hexColor, loop) {
  if (!loop) return hexColor;
  const m = hexColor.match(/^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!m) return hexColor;
  let r = parseInt(m[1],16)/255, g = parseInt(m[2],16)/255, b = parseInt(m[3],16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  let h = 0, s = max ? d/max : 0, v = max;
  if (d) { if (max===r) h=(g-b)/d+(g<b?6:0); else if(max===g) h=(b-r)/d+2; else h=(r-g)/d+4; h/=6; }
  h = (h + loop * 0.083) % 1;
  const hi = Math.floor(h*6), f = h*6-hi, p = v*(1-s), q = v*(1-f*s), t = v*(1-(1-f)*s);
  let ro,go,bo;
  switch(hi%6){ case 0:ro=v;go=t;bo=p;break; case 1:ro=q;go=v;bo=p;break; case 2:ro=p;go=v;bo=t;break; case 3:ro=p;go=q;bo=v;break; case 4:ro=t;go=p;bo=v;break; default:ro=v;go=p;bo=q; }
  return '#'+[ro,go,bo].map(x=>Math.round(x*255).toString(16).padStart(2,'0')).join('');
}
// ===== ENEMIES =====
const enemies = [];
const dmgNumbers = [];
function spawnDmg(x, y, val, color) { dmgNumbers.push({ x, y, val: String(val), color: color || COL.dmg, life: 0.8 }); }

const ENEMY_COLORS = ['#e74c3c', '#8e44ad', '#e67e22', '#3498db', '#1abc9c', '#e84393', '#d35400', '#2c3e50', '#c0392b', '#6c5ce7', '#00b894', '#fd79a8'];

const ENEMY_DEFS = {
  mushroom:  { hp: 3, speed: 55, w: 48, h: 48, dmg: 1, pattern: 'wander', score: 10, color: '#e74c3c', shape: 'mushroom', name: 'どくキノコ', lore: '闇の胞子で変異したキノコ。もとは花の国の薬草だった。かつてはフローラが煎じ薬に使っていたという。胞子が晴れれば、きっと元の優しい草に戻れる' },
  slime:     { hp: 4, speed: 45, w: 44, h: 36, dmg: 1, pattern: 'wander', score: 10, color: '#2ecc71', shape: 'blob', name: 'はちみつスライム', lore: 'こぼれた蜜から生まれた。ぷるぷるしていてちょっとかわいい。クリスタルの光を浴びると虹色に輝くらしい。甘い匂いがするので、ミプリンはちょっと食べてみたいと思っている' },
  spider:    { hp: 4, speed: 90, w: 48, h: 48, dmg: 1, pattern: 'chase', score: 20, color: '#8e44ad', shape: 'spider', name: 'あみぐもちゃん', lore: '花の国の糸使い。すばしっこくて追いかけてくる！その糸はかつて花のブランコを編むのに使われていた。闇に染まってからは、光を嫌って暗い角に巣を張っている' },
  bat:       { hp: 3, speed: 110, w: 42, h: 42, dmg: 1, pattern: 'chase', score: 15, color: '#34495e', shape: 'bat', name: 'やみコウモリ', lore: '洞窟に住む小さなコウモリ。暗いところが大好き。実は花の国の夜警だった。クリスタルが光っていた頃は、その反射で美しく飛んでいたという' },
  beetle:    { hp: 6, speed: 50, w: 52, h: 52, dmg: 2, pattern: 'charge', score: 30, color: '#e67e22', shape: 'beetle', name: 'かぶとむしナイト', lore: '立派なツノで突進してくる！赤く光ったら要注意。花の国では騎士として尊敬されていた。闇に操られても、その誇り高い突進だけは変わらない', chargeSpeed: 300, telegraphTime: 0.6, chargeTime: 0.3 },
  wasp:      { hp: 5, speed: 100, w: 48, h: 48, dmg: 2, pattern: 'chase', score: 25, color: '#f1c40f', shape: 'wasp', name: 'わるいハチ', lore: 'ミプリンと違って意地悪なハチ。すごく速い！でも本当は、クリスタルの光を失って不安なだけなのかもしれない。ミプリンを見ると少しだけ動きが鈍る気がする…' },
  flower:    { hp: 7, speed: 0, w: 48, h: 48, dmg: 1, pattern: 'shoot', score: 25, color: '#e84393', shape: 'flower', name: 'パクパクフラワー', lore: '動けないけど花粉弾を飛ばしてくる。きれいだけど危険！クリスタルの光があった頃は、旅人に道を教える優しい花だった。いまは誰かれ構わず花粉を撃ってしまう', shootInterval: 2.0 },
  worm:      { hp: 8, speed: 35, w: 52, h: 40, dmg: 2, pattern: 'wander', score: 20, color: '#a0522d', shape: 'worm', name: 'もぐもぐイモムシ', lore: 'のんびり屋だけど体が丈夫。踏まないように注意！花の国の土を耕す大切な存在だった。いまも本能で土を掘り続けている。いつか蝶になる夢を見ているらしい' },
  ghost:     { hp: 5, speed: 70, w: 48, h: 48, dmg: 1, pattern: 'teleport', score: 30, color: '#bdc3c7', shape: 'ghost', name: 'ひとだまホタル', lore: 'クリスタルの破片に引き寄せられた霊体。光に未練があるらしい…その正体は、クリスタルが砕けた夜に消えた蛍の魂だという。光を取り戻せば、きっと安らかに眠れる' },
  golem:     { hp: 12, speed: 30, w: 48, h: 48, dmg: 3, pattern: 'charge', score: 40, color: '#7f8c8d', shape: 'golem', name: 'いわいわゴーレム', lore: '女王さまがつくった古い番人。封印の力が弱まり暴走している。胸に刻まれた紋章は「守護」の古代語。命令者を失ってもなお、何かを守ろうとしている姿が切ない', chargeSpeed: 200, telegraphTime: 0.8, chargeTime: 0.4 },
  vine:      { hp: 6, speed: 0, w: 48, h: 48, dmg: 1, pattern: 'shoot', score: 20, color: '#27ae60', shape: 'vine', name: 'つるつるツタ', lore: '地面から生えたツタ。種を飛ばして攻撃してくる。花の国の壁や橋を支えていた縁の下の力持ち。クリスタルの光を失い、行き場のないエネルギーを種にこめて撃ち出している', shootInterval: 1.5 },
  darkbee:   { hp: 8, speed: 95, w: 48, h: 48, dmg: 2, pattern: 'chase', score: 35, color: '#2c3e50', shape: 'darkbee', name: 'ダークビー', lore: '闇の胞子に染まったミツバチ。かつてはミプリンの仲間だった。クリスタルが砕けた夜、仲間を守ろうとして闇に飲まれた。その目にはまだ微かな光が残っている——きっと救える' }
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
    // H-A2: 弾丸がbarrelに当たったら爆発
    if (typeof checkBarrelProjectileHit === 'function' && checkBarrelProjectileHit(p.x, p.y)) {
      projectiles.splice(i, 1); continue;
    }
    if (!p.friendly) {
      const pb = { x: player.x, y: player.y, w: player.w, h: player.h };
      if (player.invTimer <= 0 && !player.dashing && rectOverlap(pb, { x: p.x - p.size, y: p.y - p.size, w: p.size * 2, h: p.size * 2 })) {
        player.hp -= p.dmg; player.invTimer = player.invDuration;
        shakeTimer = 0.1; shakeIntensity = 5; Audio.player_hurt();
        spawnDmg(player.x + player.w / 2, player.y, p.dmg, '#fff');
        emitParticles(player.x + player.w / 2, player.y + player.h / 2, '#fff', 4, 80, 0.2);
        if (player.hp <= 0) { gameState = 'dead'; Audio.game_over(); stopBGM(0.8); }
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
  const lc = (typeof loopCount !== 'undefined') ? loopCount : 0;
  const hpScale = (1 + lc * 0.5);
  const dmgScale = (1 + lc * 0.3);
  const eColor = lc > 0 && def.color ? loopHueShift(def.color, lc) : (def.color || '#fff');
  enemies.push({ ...def, type, x: col * TILE + (TILE - def.w) / 2, y: row * TILE + (TILE - def.h) / 2,
    hp: Math.ceil(def.hp * sc * hpScale), maxHp: Math.ceil(def.hp * sc * hpScale),
    dmg: Math.ceil(def.dmg * (floor <= 1 ? 1 : (1 + floor * 0.06)) * dmgScale),
    score: Math.ceil(def.score * (1 + floor * 0.05)),
    color: eColor,
    vx: 0, vy: 0, state: 'idle', stateTimer: 0, wanderDir: { x: 1, y: 0 }, wanderTimer: 0,
    chargeDir: null, telegraphTimer: 0, hitFlash: 0, shootTimer: def.shootInterval || 2 });
}

function randEnemyPos() {
  let c, r, tries = 0;
  var _efb = getFloorBounds(floor);
  do { c = _efb.c0 + 1 + Math.floor(rng() * Math.max(1, _efb.c1 - _efb.c0 - 2)); r = _efb.r0 + 1 + Math.floor(rng() * Math.max(1, _efb.r1 - _efb.r0 - 2)); tries++; }
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
  { id: 'queen_hornet',  name: 'スズメバチの女王',   hp: 30, speed: 70, w: 112, h: 112, dmg: 3, color: '#f39c12', pattern: 'boss_charge',   score: 200, phases: 2,
    lore: 'かつては花の国の守護者だった。クリスタルが砕けた日から心が闇に染まり、花粉を奪い続けている。本当はミプリンを試しているのかもしれない…' },
  { id: 'fungus_king',   name: 'キノコの王',         hp: 45, speed: 40, w: 128, h: 128, dmg: 2, color: '#e74c3c', pattern: 'boss_shoot',    score: 300, phases: 2,
    lore: '地底の洞窟に根を張る菌糸の王。クリスタルの欠片を栄養に巨大化した。胞子の雨は花を枯らすが、王の内部には一輪の生きた花が宿っているという。' },
  { id: 'crystal_golem', name: 'クリスタルゴーレム', hp: 60, speed: 30, w: 128, h: 128, dmg: 4, color: '#3498db', pattern: 'boss_slam',     score: 400, phases: 3,
    lore: '女王が遠い昔に作った不滅の番人。封印の力が失われ、命令もなく暴走を続ける。胸の核はクリスタルの最大の破片。砕けたとき、青い涙が落ちたように見えた。' },
  { id: 'shadow_moth',   name: '闇の蛾',             hp: 50, speed: 90, w: 104, h: 104, dmg: 3, color: '#9b59b6', pattern: 'boss_teleport', score: 350, phases: 2,
    lore: 'クリスタルの最後の守り手だった夜の蛾。砕け散った光の代わりに闇をまとい、世界の終わりを待っている。その羽の紋様はかつて「希望」を意味する古代語だ。' },
  { id: 'dark_root',     name: '闇の根',             hp: 90, speed: 45, w: 128, h: 128, dmg: 5, color: '#2d0040', pattern: 'boss_dark_root', score: 600, phases: 3,
    lore: '花の国の地底深くに眠っていた原初の闇。ミプリンたちが咲かせた花の光に目覚めた。その根は世界中に張り巡らされ、光あるものを飲み込もうとしていた。しかし…光を知った根は、もう闇だけには戻れなかった。' }];

const MAX_FLOOR = 15;
function isBossFloor() { return floor % 3 === 0; }

function spawnBoss() { Audio.boss_appear();
  shakeTimer = 0.3; shakeIntensity = 8; emitParticles(CW/2, CH/2, '#ffd700', 15, 100, 0.6);
  // Boss dialog will be triggered after spawn
  const _bPool = BOSS_DEFS.length - 1; // dark_root を通常ローテーションから除外
  const bi = floor >= MAX_FLOOR ? BOSS_DEFS.length - 1 : Math.floor((floor / 3 - 1) % _bPool);
  const def = BOSS_DEFS[bi];
  const lc = (typeof loopCount !== 'undefined') ? loopCount : 0; const sc = (1 + floor * 0.12) * (1 + lc * 0.5);
  boss = { ...def, x: CW / 2 - def.w / 2, y: TILE * 4, hp: Math.ceil(def.hp * sc), maxHp: Math.ceil(def.hp * sc),
    dmg: Math.ceil(def.dmg * (1 + floor * 0.08) * (1 + lc * 0.3)), phase: 1, stateTimer: 0, state: 'idle', hitFlash: 0,
    chargeDir: null, telegraphTimer: 0, shootTimer: 0, slamTimer: 0, teleTimer: 0,
    rootSummonTimer: 4.0, erosionTimer: 3.5, _lastPhase: 1 };
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
        spawnDmg(player.x + player.w / 2, player.y, boss.dmg, '#fff'); if (player.hp <= 0) { gameState = 'dead'; deadTimer = 0; Audio.game_over(); stopBGM(0.8); } }
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

  if (boss.pattern === 'boss_dark_root') {
    // フェーズ遷移アナウンス
    if (boss.phase !== boss._lastPhase) {
      if (boss.phase === 2) { showFloat('⚠ フェーズ2：フィールド侵食！', 2.5, MSG_COLORS.boss); shakeTimer = 0.4; shakeIntensity = 10; emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#2d0040', 20, 120, 0.6); }
      else if (boss.phase === 3) { showFloat('💀 フェーズ3：本体解放！', 2.5, MSG_COLORS.boss); shakeTimer = 0.6; shakeIntensity = 15; emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#2d0040', 30, 150, 0.8); }
      boss._lastPhase = boss.phase;
    }
    const _drSpd = boss.phase >= 3 ? 2.2 : boss.phase >= 2 ? 1.4 : 0.5;
    moveWithCollision(boss, (dx/d)*boss.speed*_drSpd*dt, (dy/d)*boss.speed*_drSpd*dt);
    // Phase 1: 根っこ召喚
    if (boss.phase === 1) {
      boss.rootSummonTimer -= dt;
      if (boss.rootSummonTimer <= 0) { boss.rootSummonTimer = 4.0; const [_rc,_rr] = randEnemyPos(); spawnEnemy('vine', _rc, _rr); emitParticles(_rc*TILE+TILE/2, _rr*TILE+TILE/2, '#27ae60', 8, 60, 0.4); showFloat('🌿 根っこが召喚された！', 1.5, MSG_COLORS.boss); }
    }
    // Phase 2: フィールド侵食 + 3方向弾
    if (boss.phase === 2) {
      boss.erosionTimer -= dt;
      if (boss.erosionTimer <= 0) { boss.erosionTimer = 3.5; let _et=0; const _pc2=Math.floor((player.x+player.w/2)/TILE); const _pr2=Math.floor((player.y+player.h/2)/TILE); while(_et++<20){const _ec=2+Math.floor(rng()*(COLS-4)); const _er=2+Math.floor(rng()*(ROWS-4)); if(tileAt(roomMap,_ec,_er)!==1&&(Math.abs(_ec-_pc2)>1||Math.abs(_er-_pr2)>1)){roomMap[_er*COLS+_ec]=1; if(typeof _roomBufferFloor!=='undefined')_roomBufferFloor=-1; emitParticles(_ec*TILE+TILE/2,_er*TILE+TILE/2,'#2d0040',10,70,0.5); shakeTimer=0.15; shakeIntensity=5; showFloat('🌑 床が侵食される！', 1.5, MSG_COLORS.boss); break;}} }
      boss.shootTimer += dt;
      if (boss.shootTimer >= 1.4) { boss.shootTimer = 0; for (const _a of [-0.35,0,0.35]) { const _ca=Math.cos(_a),_sa=Math.sin(_a); spawnProjectile(boss.x+boss.w/2, boss.y+boss.h/2, (dx/d)*_ca-(dy/d)*_sa, (dx/d)*_sa+(dy/d)*_ca, 135, boss.dmg-1, false); } }
    }
    // Phase 3: 高速追尾 + 5方向連射
    if (boss.phase >= 3) {
      boss.shootTimer += dt;
      if (boss.shootTimer >= 0.7) { boss.shootTimer = 0; for (let _ai=0; _ai<5; _ai++) { const _a2=(_ai-2)*0.28; const _ca2=Math.cos(_a2),_sa2=Math.sin(_a2); spawnProjectile(boss.x+boss.w/2, boss.y+boss.h/2, (dx/d)*_ca2-(dy/d)*_sa2, (dx/d)*_sa2+(dy/d)*_ca2, 165, boss.dmg-1, false); } }
    }
  }

  // Boss contact damage
  if (player.invTimer <= 0 && !player.dashing) {
    if (rectOverlap({ x: player.x, y: player.y, w: player.w, h: player.h }, { x: boss.x, y: boss.y, w: boss.w, h: boss.h })) {
      player.hp -= boss.dmg; player.invTimer = player.invDuration; shakeTimer = 0.12; shakeIntensity = 6; Audio.player_hurt();
      spawnDmg(player.x + player.w / 2, player.y, boss.dmg, '#fff');
      const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
      moveWithCollision(player, Math.cos(angle) * 40, Math.sin(angle) * 40);
      if (player.hp <= 0) { gameState = 'dead'; deadTimer = 0; Audio.game_over(); stopBGM(0.8); }
    }
  }
}
