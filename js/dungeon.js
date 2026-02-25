/**
 * dungeon.js - 無限巣窟モード（BSP自動生成・スケーリング・スコア）
 * ミプリンの冒険 v0.5.0
 */
const Dungeon = (() => {

  /* ============ 状態 ============ */
  let _floor = 1;
  let _score = 0;
  let _kills = 0;
  let _pollenCollected = 0;
  let _mapData = null;
  let _rooms = [];
  let _corridors = [];
  let _bossRoom = null;
  let _exitTile = null;
  let _cleared = false;
  let _active = false;

  /* 永続成長（巣窟内でのみ有効、セーブ対象） */
  let _growth = { maxHp: 0, atk: 0, speed: 0, needleDmg: 0 };

  /* 一時バフ（ラン内のみ、死亡でリセット） */
  let _tempBuffs = [];

  const COLS = Balance.DUNGEON.COLS;
  const ROWS = Balance.DUNGEON.ROWS;

  /* ============ BSP木構造 ============ */
  function _BSPNode(x, y, w, h) {
    return { x, y, w, h, left: null, right: null, room: null };
  }

  function _split(node, depth) {
    if (depth <= 0 || node.w < Balance.DUNGEON.MIN_ROOM_SIZE * 2 + 2 || node.h < Balance.DUNGEON.MIN_ROOM_SIZE * 2 + 2) {
      return;
    }
    const splitH = node.w > node.h ? false : node.h > node.w ? true : Math.random() > 0.5;

    if (splitH) {
      const minSplit = Balance.DUNGEON.MIN_ROOM_SIZE + 1;
      if (node.h < minSplit * 2) return;
      const split = minSplit + Math.floor(Math.random() * (node.h - minSplit * 2));
      node.left = _BSPNode(node.x, node.y, node.w, split);
      node.right = _BSPNode(node.x, node.y + split, node.w, node.h - split);
    } else {
      const minSplit = Balance.DUNGEON.MIN_ROOM_SIZE + 1;
      if (node.w < minSplit * 2) return;
      const split = minSplit + Math.floor(Math.random() * (node.w - minSplit * 2));
      node.left = _BSPNode(node.x, node.y, split, node.h);
      node.right = _BSPNode(node.x + split, node.y, node.w - split, node.h);
    }

    _split(node.left, depth - 1);
    _split(node.right, depth - 1);
  }

  function _createRoom(node) {
    if (node.left && node.right) {
      _createRoom(node.left);
      _createRoom(node.right);
      return;
    }
    const minS = Balance.DUNGEON.MIN_ROOM_SIZE;
    const maxS = Balance.DUNGEON.MAX_ROOM_SIZE;
    const rw = Math.min(maxS, minS + Math.floor(Math.random() * (node.w - minS - 1)));
    const rh = Math.min(maxS, minS + Math.floor(Math.random() * (node.h - minS - 1)));
    const rx = node.x + 1 + Math.floor(Math.random() * (node.w - rw - 1));
    const ry = node.y + 1 + Math.floor(Math.random() * (node.h - rh - 1));
    node.room = { x: rx, y: ry, w: rw, h: rh };
    _rooms.push(node.room);
  }

  function _getRoom(node) {
    if (node.room) return node.room;
    if (node.left) { const r = _getRoom(node.left); if (r) return r; }
    if (node.right) { const r = _getRoom(node.right); if (r) return r; }
    return null;
  }

  function _connectRooms(node) {
    if (!node.left || !node.right) return;
    _connectRooms(node.left);
    _connectRooms(node.right);

    const rA = _getRoom(node.left);
    const rB = _getRoom(node.right);
    if (!rA || !rB) return;

    const ax = Math.floor(rA.x + rA.w / 2);
    const ay = Math.floor(rA.y + rA.h / 2);
    const bx = Math.floor(rB.x + rB.w / 2);
    const by = Math.floor(rB.y + rB.h / 2);

    const corridor = [];
    let cx = ax, cy = ay;

    // 水平→垂直
    while (cx !== bx) {
      corridor.push({ x: cx, y: cy });
      cx += cx < bx ? 1 : -1;
    }
    while (cy !== by) {
      corridor.push({ x: cx, y: cy });
      cy += cy < by ? 1 : -1;
    }
    corridor.push({ x: bx, y: by });
    _corridors.push(corridor);
  }

  /* ============ マップ生成 ============ */
  function _generateMap() {
    _rooms = [];
    _corridors = [];
    _bossRoom = null;
    _exitTile = null;
    _cleared = false;

    // 全タイルを壁に
    _mapData = new Array(ROWS);
    for (let r = 0; r < ROWS; r++) {
      _mapData[r] = new Array(COLS).fill(2); // WALL
    }

    // BSP分割
    const maxDepth = 3 + Math.min(2, Math.floor(_floor / 5));
    const root = _BSPNode(0, 0, COLS, ROWS);
    _split(root, maxDepth);
    _createRoom(root);
    _connectRooms(root);

    // 部屋を床に
    for (const room of _rooms) {
      for (let r = room.y; r < room.y + room.h && r < ROWS; r++) {
        for (let c = room.x; c < room.x + room.w && c < COLS; c++) {
          _mapData[r][c] = _getFloorTile();
        }
      }
    }

    // 廊下を床に
    for (const corr of _corridors) {
      for (const p of corr) {
        if (p.y >= 0 && p.y < ROWS && p.x >= 0 && p.x < COLS) {
          _mapData[p.y][p.x] = _getFloorTile();
        }
      }
    }

    // ボスフロア判定
    const isBossFloor = (_floor % Balance.DUNGEON.BOSS_EVERY_N_FLOORS === 0);
    if (isBossFloor && _rooms.length >= 2) {
      _bossRoom = _rooms[_rooms.length - 1];
      // ボス部屋の入口にロックタイル
      const bx = Math.floor(_bossRoom.x + _bossRoom.w / 2);
      const by = _bossRoom.y;
      if (by > 0) _mapData[by][bx] = 34; // 封印扉
    }

    // 出口配置（最後の部屋）
    const lastRoom = isBossFloor ? _rooms[Math.max(0, _rooms.length - 2)] : _rooms[_rooms.length - 1];
    const ex = Math.floor(lastRoom.x + lastRoom.w / 2);
    const ey = Math.floor(lastRoom.y + lastRoom.h / 2);
    _exitTile = { x: ex, y: ey };
    _mapData[ey][ex] = 28; // 階段下

    // セーブポイント（最初の部屋中央）
    if (_rooms.length > 0) {
      const fr = _rooms[0];
      _mapData[Math.floor(fr.y + fr.h / 2)][Math.floor(fr.x + fr.w / 2) + 1] = 31; // セーブポイント
    }
  }

  function _getFloorTile() {
    const theme = _getTheme();
    switch (theme) {
      case 'forest': return 1;  // 草
      case 'cave':   return 4;  // 洞窟床
      case 'flower': return 5;  // 花畑
      case 'abyss':  return 4;  // 洞窟床(暗め)
      default:       return 1;
    }
  }

  function _getTheme() {
    const themes = Balance.DUNGEON.THEMES;
    const cycle = Balance.DUNGEON.THEME_CYCLE;
    return themes[Math.floor((_floor - 1) / cycle) % themes.length];
  }

  /* ============ 敵配置 ============ */
  function _spawnEnemies() {
    const enemies = [];
    const theme = _getTheme();
    const isBossFloor = (_floor % Balance.DUNGEON.BOSS_EVERY_N_FLOORS === 0);

    // テーマごとの出現敵リスト
    const enemyPool = _getEnemyPool(theme);

    for (let i = 0; i < _rooms.length; i++) {
      const room = _rooms[i];
      // ボス部屋はボスのみ
      if (isBossFloor && room === _bossRoom) {
        const bossId = _getBossForFloor();
        if (bossId) {
          enemies.push({
            type: bossId,
            x: Math.floor(room.x + room.w / 2),
            y: Math.floor(room.y + room.h / 2),
            isBoss: true
          });
        }
        continue;
      }
      // 最初の部屋（スポーン部屋）は敵なし
      if (i === 0) continue;

      const count = Balance.DUNGEON.ENEMIES_PER_ROOM_MIN +
        Math.floor(Math.random() * (Balance.DUNGEON.ENEMIES_PER_ROOM_MAX - Balance.DUNGEON.ENEMIES_PER_ROOM_MIN + 1));

      for (let j = 0; j < count; j++) {
        const ex = room.x + 1 + Math.floor(Math.random() * (room.w - 2));
        const ey = room.y + 1 + Math.floor(Math.random() * (room.h - 2));
        const eid = enemyPool[Math.floor(Math.random() * enemyPool.length)];
        enemies.push({ type: eid, x: ex, y: ey, isBoss: false });
      }
    }
    return enemies;
  }

  function _getEnemyPool(theme) {
    switch (theme) {
      case 'forest': return ['poison_mushroom','green_slime','spider','bomb_mushroom'];
      case 'cave':   return ['bat','ice_worm','dark_slime','blue_mushroom'];
      case 'flower': return ['dark_flower','shadow_bee','dark_slime'];
      case 'abyss':  return ['abyss_worm','shadow_bee','dark_flower','mega_bat','crystal_slime'];
      default:       return ['green_slime','poison_mushroom'];
    }
  }

  function _getBossForFloor() {
    const cycle = Math.floor((_floor - 1) / Balance.DUNGEON.BOSS_EVERY_N_FLOORS) % 3;
    switch (cycle) {
      case 0: return 'mushroom_king';
      case 1: return 'ice_beetle';
      case 2: return 'dark_queen';
      default: return 'mushroom_king';
    }
  }

  /* ============ スケーリング適用 ============ */
  function getScaledEnemy(baseTemplate) {
    const scaled = { ...baseTemplate };
    scaled.hp = Balance.dungeonEnemyHp(baseTemplate.hp, _floor);
    scaled.atk = Balance.dungeonEnemyAtk(baseTemplate.atk, _floor);
    scaled.pollen = Balance.dungeonPollen(baseTemplate.pollen, _floor);
    return scaled;
  }

  /* ============ 公開API ============ */

  /** 巣窟モード開始 */
  function start(hasGreenKey) {
    _active = true;
    _floor = hasGreenKey ? 2 : 1;
    _score = 0;
    _kills = 0;
    _pollenCollected = 0;
    _tempBuffs = [];
    _generateMap();
  }

  /** 次の階層へ */
  function nextFloor() {
    _floor++;
    _generateMap();
    return _floor;
  }

  /** ボス撃破時の成長ポイント付与 */
  function awardGrowthPoint() {
    // 呼び出し側で選択UIを出し、結果をapplyGrowthで反映
    return Balance.DUNGEON.GROWTH_POINT_PER_BOSS;
  }

  /** 成長ポイント適用 */
  function applyGrowth(stat, player) {
    const caps = {
      maxHp: Number.POSITIVE_INFINITY,
      atk: Number.POSITIVE_INFINITY,
      speed: Number.POSITIVE_INFINITY,
      needleDmg: Number.POSITIVE_INFINITY
    };
    if (!caps[stat]) return false;

    switch (stat) {
      case 'maxHp':
        if (player.maxHp < caps.maxHp) { player.maxHp++; player.hp = player.maxHp; _growth.maxHp++; return true; }
        break;
      case 'atk':
        if (player.atk < caps.atk) { player.atk++; _growth.atk++; return true; }
        break;
      case 'speed':
        if (player.speed < caps.speed) { player.speed++; _growth.speed++; return true; }
        break;
      case 'needleDmg':
        if (player.needleDmg < caps.needleDmg) { player.needleDmg += 2; _growth.needleDmg++; return true; }
        break;
    }
    return false;
  }

  /** 敵撃破記録 */
  function recordKill(pollenDrop) {
    _kills++;
    _pollenCollected += pollenDrop;
  }

  /** スコア計算 */
  function calculateScore(pollenRemain) {
    _score = Balance.dungeonScore(_floor, _kills, pollenRemain);
    return _score;
  }

  /** ラン終了（死亡 or リタイア） */
  function endRun(pollenRemain) {
    _active = false;
    const finalScore = calculateScore(pollenRemain);
    _tempBuffs = [];
    return {
      floor: _floor,
      kills: _kills,
      pollen: _pollenCollected,
      score: finalScore
    };
  }

  /** マップをMapManager互換形式に変換 */
  function getMapForRenderer() {
    if (!_mapData) return null;
    const flat = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        flat.push(_mapData[r][c]);
      }
    }
    const spawnRoom = _rooms[0];
    const px = spawnRoom ? Math.floor(spawnRoom.x + spawnRoom.w / 2) : 1;
    const py = spawnRoom ? Math.floor(spawnRoom.y + spawnRoom.h / 2) : 1;

    return {
      cols: COLS, rows: ROWS,
      data: flat,
      playerStart: { x: px, y: py },
      exits: _exitTile ? [{ x: _exitTile.x, y: _exitTile.y, to: 'dungeon_next' }] : [],
      npcs: [],
      enemies: _spawnEnemies()
    };
  }

  /** ミニマップ描画 */
  function drawMinimap(ctx, playerCol, playerRow, hasMap) {
    if (!hasMap || !_mapData) return;

    const mmX = CONFIG.CANVAS_WIDTH - 110;
    const mmY = 8;
    const cellSize = 5;

    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(mmX - 2, mmY - 2, COLS * cellSize + 4, ROWS * cellSize + 4);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = _mapData[r][c];
        if (tile === 2) continue; // 壁は描画しない
        ctx.fillStyle = tile === 28 ? '#0f0' : tile === 31 ? '#ff0' : tile === 34 ? '#f00' : '#555';
        ctx.fillRect(mmX + c * cellSize, mmY + r * cellSize, cellSize - 1, cellSize - 1);
      }
    }

    // プレイヤー位置
    ctx.fillStyle = '#F5A623';
    ctx.fillRect(mmX + playerCol * cellSize, mmY + playerRow * cellSize, cellSize, cellSize);

    // 階数
    ctx.fillStyle = '#fff'; ctx.font = '10px monospace'; ctx.textAlign = 'left';
    ctx.fillText('B' + _floor, mmX, mmY + ROWS * cellSize + 12);
  }

  /** 巣窟HUD描画 */
  function drawHud(ctx) {
    if (!_active) return;
    const W = CONFIG.CANVAS_WIDTH;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(W - 180, CONFIG.CANVAS_HEIGHT - 30, 172, 24);
    ctx.fillStyle = '#fff'; ctx.font = '12px monospace'; ctx.textAlign = 'right';
    ctx.fillText('B' + _floor + ' | Kill:' + _kills + ' | Score:' + _score, W - 14, CONFIG.CANVAS_HEIGHT - 14);
  }

  /* ============ セーブ/ロード ============ */
  function serializeGrowth() { return { ..._growth }; }
  function deserializeGrowth(data) { if (data) Object.assign(_growth, data); }

  function getGrowth() { return { ..._growth }; }
  function getFloor() { return _floor; }
  function isActive() { return _active; }
  function getTheme() { return _getTheme(); }
  function isBossFloor() { return _floor % Balance.DUNGEON.BOSS_EVERY_N_FLOORS === 0; }

  return {
    start, nextFloor, endRun,
    awardGrowthPoint, applyGrowth, recordKill, calculateScore,
    getScaledEnemy, getMapForRenderer,
    drawMinimap, drawHud,
    serializeGrowth, deserializeGrowth, getGrowth,
    getFloor, isActive, getTheme, isBossFloor
  };
})();
