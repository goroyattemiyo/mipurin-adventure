/**
 * sprites.js - スプライト定義
 * 画像が完成したら SPRITE_DEFS にエントリを追加する
 * 現段階ではプレースホルダー定義のみ
 */
const SPRITE_DEFS = {
  // === プレイヤー ===
  // player_walk_down:  { sheet:'player', frameSize:[32,32], frames:[{sx:0,sy:0},{sx:32,sy:0},{sx:64,sy:0}] },
  // player_walk_up:    { sheet:'player', frameSize:[32,32], frames:[{sx:0,sy:32},{sx:32,sy:32},{sx:64,sy:32}] },
  // player_walk_left:  { sheet:'player', frameSize:[32,32], frames:[{sx:0,sy:64},{sx:32,sy:64},{sx:64,sy:64}] },
  // player_attack_down: ...
  // player_needle_down: ...
  // player_idle:        ...
  // player_hurt:        ...
  // player_dead:        ...
};

/**
 * スプライトシート読み込みリスト
 * 画像完成後に有効化する
 */
const SHEET_LIST = [
  // { name: 'player',  src: 'assets/sprites/player.png',  json: 'assets/sprites/player.json' },
  // { name: 'enemies', src: 'assets/sprites/enemies.png', json: 'assets/sprites/enemies.json' },
  // { name: 'bosses',  src: 'assets/sprites/bosses.png',  json: 'assets/sprites/bosses.json' },
  // { name: 'npcs',    src: 'assets/sprites/npcs.png',    json: 'assets/sprites/npcs.json' },
  // { name: 'tiles',   src: 'assets/sprites/tiles.png',   json: 'assets/sprites/tiles.json' },
  // { name: 'items',   src: 'assets/sprites/items.png',   json: 'assets/sprites/items.json' },
  // { name: 'ui',      src: 'assets/sprites/ui.png',      json: 'assets/sprites/ui.json' },
  // { name: 'vfx',     src: 'assets/sprites/vfx.png',     json: 'assets/sprites/vfx.json' },
];
