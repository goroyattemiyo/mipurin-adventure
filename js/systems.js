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

