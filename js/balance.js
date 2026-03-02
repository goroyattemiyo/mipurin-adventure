/**
 * balance.js - バランステーブル（全数値外部化）
 * ミプリンの冒険 v0.5.0
 */
const Balance = (() => {

  /* ============ プレイヤー基本値 ============ */
  const PLAYER = {
    HP: 20,
    BASE_HP: 20, HP_PER_LV: 2,
    ATK: 3,
    BASE_ATK: 3, ATK_PER_LV: 0.5,
    SPEED: 6,
    BASE_SPEED: 6,
    NEEDLE_DMG: 10,
    ATTACK_COOLDOWN_SEC: 0.5,
    INPUT_BUFFER_FRAMES: 7,
    KNOCKBACK_SPEED: 6,
    KNOCKBACK_DURATION: 0.15,
    HITSTOP_FRAMES_GIVE: 3,
    HITSTOP_FRAMES_TAKE: 5,
    INVINCIBLE_SEC: 1.0
  };

  const EXP_CURVE = (lv) => Scaling.expForLevel(lv);

  /* ============ 敵テンプレート ============ */
  // 南の森
  const ENEMY_POISON_MUSHROOM = { id:'poison_mushroom', name:'ドクキノコ', hp:3, atk:1, speed:0.8, xp:1, pollen:1, pattern:'wander', symbol:'🍄', color:'#9B59B6' };
  const ENEMY_GREEN_SLIME     = { id:'green_slime',     name:'ミドリスライム', hp:4, atk:1, speed:1.0, xp:1, pollen:1, pattern:'chase', symbol:'🟢', color:'#2ECC71' };
  const ENEMY_SPIDER          = { id:'spider',          name:'クモ',     hp:5, atk:2, speed:1.5, xp:2, pollen:2, pattern:'ambush', symbol:'🕷', color:'#555' };

  // 北の森
  const ENEMY_BOMB_MUSHROOM   = { id:'bomb_mushroom',   name:'バクダンキノコ', hp:6, atk:3, speed:0.6, xp:3, pollen:2, pattern:'explode', symbol:'💥', color:'#E74C3C' };
  const ENEMY_DARK_SLIME      = { id:'dark_slime',      name:'ヤミスライム', hp:8, atk:2, speed:1.2, xp:3, pollen:2, pattern:'chase', symbol:'🟣', color:'#8E44AD' };

  // 洞窟
  const ENEMY_BAT             = { id:'bat',             name:'コウモリ', hp:4, atk:2, speed:2.0, xp:2, pollen:1, pattern:'swoop', symbol:'🦇', color:'#7F8C8D' };
  const ENEMY_ICE_WORM        = { id:'ice_worm',        name:'コオリムシ', hp:10, atk:3, speed:0.5, xp:4, pollen:3, pattern:'burrow', symbol:'🐛', color:'#3498DB' };

  // 花畑
  const ENEMY_DARK_FLOWER     = { id:'dark_flower',     name:'ヤミバナ', hp:12, atk:4, speed:0.7, xp:5, pollen:3, pattern:'root_attack', symbol:'🌸', color:'#1A1A2A' };
  const ENEMY_SHADOW_BEE      = { id:'shadow_bee',      name:'カゲバチ', hp:8, atk:3, speed:2.5, xp:4, pollen:2, pattern:'dive', symbol:'🐝', color:'#2C3E50' };

  const ENEMIES = {
    poison_mushroom: ENEMY_POISON_MUSHROOM,
    green_slime: ENEMY_GREEN_SLIME,
    spider: ENEMY_SPIDER,
    bomb_mushroom: ENEMY_BOMB_MUSHROOM,
    dark_slime: ENEMY_DARK_SLIME,
    bat: ENEMY_BAT,
    ice_worm: ENEMY_ICE_WORM,
    dark_flower: ENEMY_DARK_FLOWER,
    shadow_bee: ENEMY_SHADOW_BEE
  };

  /* ============ ボステンプレート ============ */
  const BOSSES = {
    mushroom_king: {
      id:'mushroom_king', name:'マッシュルーム王',
      hp:30, atk:3, speed:1.0, xp:20, pollen:10,
      phases: [
        { hpThreshold:1.0, pattern:'charge',  chargeSpeed:3, pauseSec:1.5 },
        { hpThreshold:0.5, pattern:'spore',   sporeCount:5, sporeDmg:1, pauseSec:1.0 },
        { hpThreshold:0.2, pattern:'frenzy',  chargeSpeed:5, sporeCount:8, pauseSec:0.5 }
      ],
      symbol:'👑', color:'#E74C3C', size:2
    },
    ice_beetle: {
      id:'ice_beetle', name:'氷カブトムシ',
      hp:50, atk:4, speed:1.2, xp:30, pollen:15,
      phases: [
        { hpThreshold:1.0, pattern:'ice_shot',  bulletCount:3, bulletSpeed:2 },
        { hpThreshold:0.6, pattern:'charge',     chargeSpeed:4, wallSpawn:true },
        { hpThreshold:0.3, pattern:'ice_storm',  bulletCount:8, chargeSpeed:5 }
      ],
      symbol:'🪲', color:'#3498DB', size:2
    },
    dark_queen: {
      id:'dark_queen', name:'闇蜂女王レイラ',
      hp:80, atk:5, speed:1.5, xp:50, pollen:20,
      phases: [
        { hpThreshold:1.0, pattern:'dark_barrage', bulletCount:5, bulletSpeed:2 },
        { hpThreshold:0.7, pattern:'summon',        summonType:'shadow_bee', summonCount:3 },
        { hpThreshold:0.4, pattern:'charge',        chargeSpeed:6, screenShake:true },
        { hpThreshold:0.15, pattern:'weaken',       pauseSec:3, voiceLine:'leila_plea' }
      ],
      symbol:'👸', color:'#1A1A2A', size:2,
      endingTrigger: true
    }
  };

  /* ============ 巣窟スケーリング ============ */
  const DUNGEON = {
    HP_SCALE_PER_FLOOR: 0.15,
    ATK_SCALE_PER_FLOOR: 0.10,
    POLLEN_SCALE_PER_FLOOR: 0.05,
    BOSS_EVERY_N_FLOORS: 3,
    THEMES: ['forest','cave','flower','abyss'],
    THEME_CYCLE: 4,
    GROWTH_POINT_PER_BOSS: 1,
    COLS: 20, ROWS: 15,
    MIN_ROOM_SIZE: 4, MAX_ROOM_SIZE: 8,
    MIN_ROOMS: 3, MAX_ROOMS: 6,
    ENEMIES_PER_ROOM_MIN: 1, ENEMIES_PER_ROOM_MAX: 4
  };

  /** 巣窟の敵HP計算 */
  function dungeonEnemyHp(baseHp, floor) { /* 改善版: 対数ハイブリッド */
    var logFactor = Math.log2(floor + 1); var linearFactor = floor * 0.05; return Math.ceil(baseHp * (1 + logFactor * 0.5 + linearFactor));
  }
  /** 巣窟の敵ATK計算 */
  function dungeonEnemyAtk(baseAtk, floor) { /* 改善版: 平方根ベース */
    var sqrtFactor = Math.sqrt(floor); return Math.ceil(baseAtk * (1 + sqrtFactor * 0.3));
  }
  /** 巣窟のポーレン量計算 */
  function dungeonPollen(basePollen, floor) {
    return Math.ceil(basePollen * (1 + floor * DUNGEON.POLLEN_SCALE_PER_FLOOR));
  }
  /** 巣窟スコア計算 */
  function dungeonScore(floor, kills, pollenRemain) {
    return floor * kills * Math.max(1, pollenRemain);
  }

  /* ============ アイテム効果値 ============ */
  const ITEM_EFFECTS = {
    royal_jelly:      { type:'heal_full' },
    pollen:           { type:'heal', amount:1 },
    wax_shield:       { type:'buff_def', reduction:1, durationSec:30 },
    pollen_bomb:      { type:'aoe_damage', damage:2, radius:3 },
    speed_honey:      { type:'buff_speed', multiplier:1.5, durationSec:20 },
    torch:            { type:'buff_vision', radiusTiles:5, durationSec:60 },
    antidote:         { type:'cure_poison' },
    hard_candy:       { type:'buff_atk', bonus:1, durationSec:30 },
    ancient_map:      { type:'minimap' },
    nest_key:         { type:'unlock_boss_room' }
  };

  /* ============ ポーレン収支 ============ */
  const POLLEN_BUDGET = {
    forest_south: 12,
    forest_north: 16,
    cave: 18,
    flower_field: 12,
    total: 58,
    ending_required: 50
  };

  /* ============ killCount 閾値 ============ */
  const KILL_THRESHOLDS = {
    SATURATION_START: 1,
    NPC_UNEASY: 6,
    NPC_FEAR: 16,
    NPC_DISAPPEAR: 25,
    BGM_LOWPASS_START: 5,
    BGM_LOWPASS_MAX: 20,
    DRONE_START: 15,
    WORLD_GREY: 30
  };

  /* ============ 針リソース管理 ============ */
  const NEEDLE = {
    MAX: 10,
    INITIAL: 3,
    REGEN_INTERVAL: 60,  // 秒
    DROP_RATE_NORMAL: 0.15,
    DROP_RATE_ELITE: 1.0,
    SHOP_BUNDLE: 3,
    SHOP_PRICE: 50
  };

  /* ============ スキン価格 ============ */
  const SKINS = {
    skin_sakura: { name:'桜スキン',  price:300, variant:'skin_sakura' },
    skin_ice:    { name:'氷スキン',  price:500, variant:'skin_ice' },
    skin_gold:   { name:'黄金スキン', price:800, variant:'skin_gold' }
  };

  return {
    PLAYER, ENEMIES, BOSSES, DUNGEON,
    ITEM_EFFECTS, POLLEN_BUDGET,
    KILL_THRESHOLDS, NEEDLE, SKINS,
    dungeonEnemyHp, dungeonEnemyAtk, dungeonPollen, dungeonScore,
    EXP_CURVE
  };
})();
