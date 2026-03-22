// ===== SYSTEMS MODULE =====
// Meta progression, shop, fade, game flow, sprites, prologue, collision

// ===== META PROGRESSION (Sprint 5) =====
let nectar = 0;
let gardenUpgrades = { hp: 0, atk: 0, speed: 0, dash: 0, magnet: 0, nectar: 0 };
let gardenUnlocks = { speed: false, dash: false, magnet: false, nectar: false };
let totalClears = 0;
const GARDEN_DEFS = [
  { id: 'hp', name: '🌱 生命の花壇', desc: '初期HP +1', cost: [10, 25, 50, 100, 200], max: 5, icon: '❤️', unlock: null },
  { id: 'atk', name: '🌹 力の花壇', desc: '初期ATK +1', cost: [15, 35, 70, 140, 250], max: 5, icon: '⚔️', unlock: null },
  { id: 'speed', name: '🌻 疾風の花壇', desc: '初期速度 +8%', cost: [20, 45, 90], max: 3, icon: '💨', unlock: 'speed' },
  { id: 'dash', name: '⚡ 閃光の花壇', desc: 'ダッシュCD -15%', cost: [25, 60, 120], max: 3, icon: '⚡', unlock: 'dash' },
  { id: 'magnet', name: '✨ 収穫の花壇', desc: '磁力 +40', cost: [15, 30, 60], max: 3, icon: '🧲', unlock: 'magnet' },
  { id: 'nectar', name: '🍯 蜜の花壇', desc: 'ネクター +10%', cost: [30, 80, 180], max: 3, icon: '🍯', unlock: 'nectar' },
  { id: 'luck', name: '🍀 幸運の花壇', desc: 'ドロップ率 +5%', cost: [20, 50, 100], max: 3, icon: '🍀', unlock: 'luck' },
  { id: 'explore', name: '🔎 探索の花壇', desc: 'ショップ商品 +1', cost: [30, 70, 140], max: 3, icon: '🔎', unlock: 'explore' }
];
let gardenCursor = 0;
let runNectar = 0, loopCount = 0; // nectar earned this run

function saveMeta() {
  try {
    localStorage.setItem('mipurin_nectar', nectar);
    localStorage.setItem('mipurin_garden', JSON.stringify(gardenUpgrades));
    localStorage.setItem('mipurin_unlocks', JSON.stringify(gardenUnlocks));
    localStorage.setItem('mipurin_clears', totalClears);
  } catch(e) {}
}
function loadMeta() {
  try {
    const n = localStorage.getItem('mipurin_nectar'); if (n !== null) nectar = parseInt(n) || 0;
    const g = localStorage.getItem('mipurin_garden'); if (g) Object.assign(gardenUpgrades, JSON.parse(g));
    const u = localStorage.getItem('mipurin_unlocks'); if (u) Object.assign(gardenUnlocks, JSON.parse(u));
    const c = localStorage.getItem('mipurin_clears'); if (c !== null) totalClears = parseInt(c) || 0;
    checkGardenUnlocks();
  } catch(e) {}
}
loadMeta();

function getGardenCost(id) {
  const def = GARDEN_DEFS.find(d => d.id === id);
  const lv = gardenUpgrades[id] || 0;
  if (lv >= def.max) return -1;
  return def.cost[lv];
}

function checkGardenUnlocks() {
  if (totalClears >= 1) gardenUnlocks.speed = true;
  if (totalClears >= 2) gardenUnlocks.dash = true;
  if (totalClears >= 3) gardenUnlocks.magnet = true;
  if (totalClears >= 5) gardenUnlocks.nectar = true;
  if (totalClears >= 3) gardenUnlocks.luck = true;
  if (totalClears >= 5) gardenUnlocks.explore = true;
}

function applyGardenBonuses() {
  player.maxHp = 7 + (gardenUpgrades.hp || 0);
  player.hp = player.maxHp;
  player.atk = 2 + (gardenUpgrades.atk || 0);
  const spdLv = gardenUpgrades.speed || 0;
  if (spdLv > 0) player.speed = player.speed * (1 + spdLv * 0.08);
  const dashLv = gardenUpgrades.dash || 0;
  if (dashLv > 0) player.dashCooldown = player.dashCooldown * (1 - dashLv * 0.15);
  player.magnetRange = (player.magnetRange || 0) + (gardenUpgrades.magnet || 0) * 40;
  player.nectarMul = (player.nectarMul || 0) + (gardenUpgrades.nectar || 0) * 0.10;
  player.luckBonus = (gardenUpgrades.luck || 0) * 0.05;
  player.exploreBonus = (gardenUpgrades.explore || 0);
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
  const _wpPool = WEAPON_DEFS.filter(w => !w.minFloor || floor >= w.minFloor); const wep = _wpPool[Math.floor(rng() * _wpPool.length)];
  shopItems.push({ name: wep.name, cost: 5 + floor * 2, icon: '⚔', desc: wep.desc, action: () => {
      var _sw = initWeapon({...wep});
      _sw.rarity = (typeof rollRarity === 'function') ? rollRarity(floor) : 'normal';
      player.weapons[player.weaponIdx] = _sw; player.weapon = _sw;
      if (typeof weaponCollection !== 'undefined') { weaponCollection.add(wep.id); saveCollection(); }
      Audio.level_up();
    } });
  // Max HP
  shopItems.push({ name: '最大HP +1', cost: 8 + floor * 2, icon: '\u2B06', action: () => { player.maxHp += 1; player.hp += 1; } });
  // Explore bonus: extra random item
  if (player.exploreBonus && player.exploreBonus > 0) {
    for (var _ei = 0; _ei < player.exploreBonus; _ei++) {
      var _extraPool = [
        { name: '回復 +3', cost: 5 + floor, icon: '\u2665', desc: 'HPを3回復', action: function() { player.hp = Math.min(player.hp + 3, player.maxHp); } },
        { name: '花粉×2', cost: 3 + floor, icon: '\uD83C\uDF3C', desc: '花粈10獲得', action: function() { pollen += 10; showFloat('\uD83C\uDF3C +10', 1.5, MSG_COLORS.info); } }
      ];
      shopItems.push(_extraPool[Math.floor(rng() * _extraPool.length)]);
    }
  }
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
  if(typeof MONOLOGUES!=="undefined"&&Math.random()<0.6) setTimeout(()=>showBubble(MONOLOGUES[Math.floor(Math.random()*MONOLOGUES.length)]),800);
  dialogMsg = null; dialogCallback = null;
  rng = mulberry32(Date.now() + floor);
  roomSpikes = []; roomMap = generateRoom(floor);
  if (isBossFloor()) { boss = null; enemies.length = 0; projectiles.length = 0; drops.length = 0; spawnBoss(); WAVES = []; wave = 0;
    // Boss entrance dialog
    if (boss) { cutinBossId = boss.id; cutinTimer = 0; cutinPhase = 'slidein'; gameState = 'cutin'; lastBossId = boss.id; }
  }
  else { boss = null; WAVES = buildWaves(); wave = 0; drops.length = 0; spawnWave(); }
  player.x = TILE * 10; player.y = TILE * 7;
  player.invTimer = 0; player.attacking = false; player.atkCooldown = 0;
  player.dashing = false; player.dashCooldown = 0.5;
  dmgNumbers.length = 0; particles.length = 0;
  if (cutinPhase === 'none') gameState = 'playing'; clearTimer = 0; deadTimer = 0;
  if (player.roomHeal) { player.hp = Math.min(player.hp + player.roomHeal, player.maxHp); showFloat("🌸 フロア開始HP+" + player.roomHeal, 1.5, MSG_COLORS.heal); }
  if (isBossFloor()) { showFloat('⚠ ボスフロア！ きをつけて！', 2.5, MSG_COLORS.boss); }
  else { const tn = getTheme(floor).name || ''; showFloat('🌿 フロア ' + floor + (tn ? ' — ' + tn : ''), 2.5, MSG_COLORS.info); }
  const floorTheme = getTheme(floor);
  if (!isBossFloor() && floorTheme.bgm) playBGM(floorTheme.bgm, 0.8);
  if (isBossFloor()) { stopBGM(1.2); setTimeout(() => { Audio.boss_appear(); playBGM('boss', 0.5); }, 2000); }
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
  weapon_queen_staff: 'assets/sprites/weapon_queen_staff.webp',
  // Tier2 weapon sprites (alias to Tier1 until unique art)
  weapon_golden_needle: 'assets/sprites/weapon_needle.webp',
  weapon_amber_cannon: 'assets/sprites/weapon_honey_cannon.webp',
  weapon_holy_shield: 'assets/sprites/weapon_pollen_shield.webp',
  weapon_cursed_thorn: 'assets/sprites/weapon_vine_whip.webp',
  weapon_storm_wing: 'assets/sprites/weapon_feather_shuriken.webp',
  weapon_queen_true_staff: 'assets/sprites/weapon_queen_staff.webp',
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
  '花の国──花粉と蜜であふれる、ちいさな楽園',
  'でも ある日、花がいろをうしない、雨がやまなくなった',
  'みんなで祈った。どうか、この国を守ってと──',
  '花の国の命のみなもと──「蜂蜜のクリスタル」',
  '女王さまがずっと守ってきた、たいせつな宝物',
  '──けれど、闇がクリスタルを砕いた。女王さまは姿を消した',
  '花は枯れ、国は灰色に沈んでいった…',
  'まっくらな世界に、ひとつだけ光が残っていた',
  '「わたしが行く。クリスタルのかけらを取り戻す！」',
  'ミプリンの冒険が、今はじまる──'
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
  dialogMsg = null; dialogCallback = null;
  floor = 1; wave = 0; score = 0; pollen = 0; boss = null; runNectar = 0;
  player.hp = 5; player.maxHp = 5; player.atk = 1; player.speed = 200;
  player.invDuration = 0.6; player.dashCooldown = 0.5; player.atkRangeBonus = 0;
  player.weapon = initWeapon({...WEAPON_DEFS[0]}); player.weapons = [initWeapon({...WEAPON_DEFS[0]}), null]; player.weaponIdx = 0; player.atkSpeedBonus = 0; player.vampiric = false; player.thorns = 0; player.magnetRange = 0; player.consumables = [null, null, null];
  player.backpack = [null, null, null, null]; player.charm = null;
  player.roomHeal = 0; player.killHeal = 0; player.nectarMul = 0;
  player.luckBonus = 0; player.exploreBonus = 0;
  activeBlessings = []; activeDuos = []; idleTimer = 0; eliteNext = false; drops.length = 0; projectiles.length = 0; particles.length = 0;
  applyGardenBonuses();
  if (typeof applyCharm === 'function') applyCharm();
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
  let ax = player.atkDir.x, ay = player.atkDir.y;
  const len = Math.hypot(ax, ay) || 1;
  ax /= len; ay /= len;
  return { x: player.x + player.w / 2 + ax * 24 - range / 2, y: player.y + player.h / 2 + ay * 24 - range / 2, w: range, h: range };
}





// ===== TITLE BACKGROUND =====
const titleBgImg = new Image();
titleBgImg.src = 'assets/sprites/title_bg.webp';
let titleBgReady = false;
titleBgImg.onload = () => { titleBgReady = true; };

// ===== DEATH SCREEN IMAGE =====
const deadMipurinImg = new Image();
deadMipurinImg.src = 'assets/sprites/dead_mipurin.webp';
let deadImgReady = false;
deadMipurinImg.onload = () => { deadImgReady = true; };

// ===== ENDING IMAGES =====
const endingImgs = {};
['ending_a','ending_b','ending_c'].forEach(id => {
  const img = new Image();
  img.src = 'assets/sprites/' + id + '.webp';
  img.onload = () => { endingImgs[id] = img; };
});

// ===== NPC FLORA PORTRAIT =====
const floraImg = new Image();
floraImg.src = 'assets/sprites/flora_portrait.webp';
let floraReady = false;
floraImg.onload = () => { floraReady = true; };

// ===== SHOPKEEPER IMAGE =====
const shopkeeperImg = new Image();
shopkeeperImg.src = 'assets/sprites/shopkeeper.webp';
let shopkeeperReady = false;
shopkeeperImg.onload = () => { shopkeeperReady = true; };

// ===== BOSS SILHOUETTE IMAGES =====
const bossSilhouettes = {};
const BOSS_SIL_MAP = {
  queen_hornet: 'assets/sprites/boss_silhouette_hornet.webp',
  fungus_king: 'assets/sprites/boss_silhouette_fungus.webp',
  crystal_golem: 'assets/sprites/boss_silhouette_golem.webp',
  shadow_moth: 'assets/sprites/boss_silhouette_moth.webp'
};
Object.keys(BOSS_SIL_MAP).forEach(id => {
  const img = new Image();
  img.src = BOSS_SIL_MAP[id];
  img.onload = () => { bossSilhouettes[id] = img; };
});


