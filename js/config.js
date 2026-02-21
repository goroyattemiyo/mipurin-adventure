/**
 * config.js - 全設定値・定数
 * ミプリンの冒険 v5.2
 */
const CONFIG = {
  // 表示
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 720,
  TILE_SIZE: 32,
  FPS: 30,
  FRAME_DURATION: 1000 / 30,
  MAX_FRAME_SKIP: 3,

  // マップ
  MAP_COLS: 20,
  MAP_ROWS: 15,

  // プレイヤー初期値
  PLAYER: {
    HP: 5,
    ATK: 1,
    SPEED: 3,
    NEEDLE_DMG: 10,
    NEEDLE_HP_COST: 1,
    ATTACK_COOLDOWN: 15,   // フレーム数 (0.5秒)
    NEEDLE_COOLDOWN: 60,   // フレーム数 (2秒)
    INPUT_BUFFER: 7        // フレーム数
  },

  // 巣窟スケーリング
  DUNGEON: {
    HP_SCALE: 0.15,
    ATK_SCALE: 0.10,
    POLLEN_SCALE: 0.05,
    BOSS_EVERY: 3,
    THEMES: ['forest', 'cave', 'flower', 'abyss']
  },

  // 描画
  IMAGE_SMOOTHING: false,

  // 音響
  BGM_VOLUME: 0.5,
  SE_VOLUME: 0.7,

  // HSLバリアント
  VARIANTS: {
    skin_sakura:  { hue: 330, sat: -10, lit: 5 },
    skin_ice:     { hue: 180, sat: 10,  lit: 10 },
    skin_gold:    { hue: 0,   sat: 30,  lit: 15 },
    dark_1:       { hue: 0,   sat: -15, lit: -20 },
    dark_2:       { hue: 0,   sat: -30, lit: -40 },
    dark_3:       { hue: 0,   sat: -50, lit: -60 },
    damage_red:   { mode: 'tint',       color: '#DC3D3D', amount: 0.7 },
    flash_white:  { mode: 'silhouette', color: '#FFFFFF' }
  },

  // 言語
  LANG: 'ja',

  // バックエンド
  GAS_URL: '',
  STRIPE_ENABLED: false,

  // デバッグ
  DEBUG: new URLSearchParams(window.location.search).get('debug') === '1',

  // バージョン
  VERSION: '0.1.0'
};
