/**
 * map.js - マップデータ・タイル描画
 * ミプリンの冒険 v0.2.0
 */
const MapManager = (() => {

  /* タイルID定義 */
  const TILE = {
    GRASS:      0,
    PATH:       1,
    WALL:       2,
    WATER:      3,
    FLOWER_Y:   4,
    FLOWER_R:   5,
    TREE:       6,
    HOUSE:      7,
    DOOR:       8,
    SAVE_POINT: 9,
    FENCE:      10,
    WELL:       11,
    SIGN:       12,
    BRIDGE:     13,
    CHEST:      14,
    STUMP:      15
  };

  /* タイルの色（プレースホルダー） */
  const TILE_COLORS = {
    [TILE.GRASS]:      '#4a8c2a',
    [TILE.PATH]:       '#c4a035',
    [TILE.WALL]:       '#6b5b3a',
    [TILE.WATER]:      '#3a7ecf',
    [TILE.FLOWER_Y]:   '#4a8c2a',
    [TILE.FLOWER_R]:   '#4a8c2a',
    [TILE.TREE]:       '#2d5a1e',
    [TILE.HOUSE]:      '#8B7355',
    [TILE.DOOR]:       '#a0522d',
    [TILE.SAVE_POINT]: '#F5A623',
    [TILE.FENCE]:      '#8B7355',
    [TILE.WELL]:       '#708090',
    [TILE.SIGN]:       '#c4a035',
    [TILE.BRIDGE]:     '#a0522d',
    [TILE.CHEST]:      '#DAA520',
    [TILE.STUMP]:      '#6b5b3a'
  };

  /* タイルの装飾記号（プレースホルダー） */
  const TILE_SYMBOLS = {
    [TILE.FLOWER_Y]:   '✿',
    [TILE.FLOWER_R]:   '❀',
    [TILE.TREE]:       '🌳',
    [TILE.HOUSE]:      '🏠',
    [TILE.DOOR]:       '🚪',
    [TILE.SAVE_POINT]: '💾',
    [TILE.WELL]:       '○',
    [TILE.SIGN]:       '📋',
    [TILE.CHEST]:      '📦',
    [TILE.STUMP]:      '◎',
    [TILE.FENCE]:      '┃'
  };

  /* 通行可否 (true = 通行不可) */
  const SOLID = {
    [TILE.WALL]:   true,
    [TILE.WATER]:  true,
    [TILE.TREE]:   true,
    [TILE.HOUSE]:  true,
    [TILE.FENCE]:  true,
    [TILE.WELL]:   true,
    [TILE.CHEST]:  true,
    [TILE.STUMP]:  true
  };

  /* マップデータ格納 */
  const _maps = {};
  let _currentMap = null;
  let _currentMapName = '';

  /* ── 村マップ (20×15) ── */
  const T = TILE;
  _maps.village = {
    cols: 20, rows: 15,
    data: [
      6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,
      6,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,6,
      6,0,7,7,0,1,0,0,4,0,0,5,0,0,1,0,7,7,0,6,
      6,0,7,8,0,1,0,0,0,0,0,0,0,0,1,0,8,7,0,6,
      6,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,6,
      6,0,10,0,0,1,0,0,0,9,0,0,0,0,1,0,0,10,0,6,
      6,0,10,0,0,1,0,0,0,0,0,0,0,0,1,0,0,10,0,6,
      6,0,0,0,0,1,0,0,12,0,0,11,0,0,1,0,0,0,0,6,
      6,0,4,0,0,1,0,0,0,0,0,0,0,0,1,0,0,5,0,6,
      6,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,6,
      6,0,0,15,0,0,0,0,0,1,0,0,0,0,0,0,15,0,0,6,
      6,0,0,0,0,0,4,0,0,1,0,0,5,0,0,0,0,0,0,6,
      6,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,6,
      6,0,0,0,0,0,0,0,0,13,0,0,0,0,0,0,0,0,0,6,
      6,6,6,6,6,6,6,6,6,3,6,6,6,6,6,6,6,6,6,6
    ],
    playerStart: { x: 9, y: 7 },
    exits: [
      { x: 9, y: 14, to: 'forest_south', spawnX: 9, spawnY: 0 }
    ],
    npcs: [
      { id: 'hatch',   x: 8,  y: 6, name: '長老ハッチ',       symbol: '👴', color: '#DEB887' },
      { id: 'miel',    x: 11, y: 6, name: '占い師ミエル',     symbol: '🔮', color: '#9370DB' },
      { id: 'marche',  x: 3,  y: 3, name: '商人マルシェ',     symbol: '🛒', color: '#FF8C00' },
      { id: 'bee',     x: 14, y: 2, name: 'ビー',             symbol: '🐝', color: '#FFD700' },
      { id: 'pore',    x: 16, y: 3, name: 'ポーレ',           symbol: '🧒', color: '#98FB98' }
    ]
  };

  /* ── マップ切替 ── */
  function loadMap(name) {
    const map = _maps[name];
    if (!map) {
      console.warn('マップが見つかりません:', name);
      return null;
    }
    _currentMap = map;
    _currentMapName = name;
    return map;
  }

  /* ── タイル取得 ── */
  function getTile(col, row) {
    if (!_currentMap) return -1;
    if (col < 0 || col >= _currentMap.cols || row < 0 || row >= _currentMap.rows) return -1;
    return _currentMap.data[row * _currentMap.cols + col];
  }

  /* ── 通行判定 ── */
  function isSolid(col, row) {
    const tile = getTile(col, row);
    if (tile === -1) return true;
    return !!SOLID[tile];
  }

  /* ── NPC衝突判定 ── */
  function getNpcAt(col, row) {
    if (!_currentMap || !_currentMap.npcs) return null;
    return _currentMap.npcs.find(n => n.x === col && n.y === row) || null;
  }

  /* ── 出口判定 ── */
  function getExitAt(col, row) {
    if (!_currentMap || !_currentMap.exits) return null;
    return _currentMap.exits.find(e => e.x === col && e.y === row) || null;
  }

  /* ── マップ描画 ── */
  function draw(ctx) {
    if (!_currentMap) return;
    const ts = CONFIG.TILE_SIZE;

    for (let row = 0; row < _currentMap.rows; row++) {
      for (let col = 0; col < _currentMap.cols; col++) {
        const tile = _currentMap.data[row * _currentMap.cols + col];
        const x = col * ts;
        const y = row * ts;

        /* ベース色 */
        ctx.fillStyle = TILE_COLORS[tile] || '#333';
        ctx.fillRect(x, y, ts, ts);

        /* グリッド線（薄く） */
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(x, y, ts, ts);

        /* 装飾記号 */
        const sym = TILE_SYMBOLS[tile];
        if (sym) {
          ctx.font = '16px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.fillText(sym, x + ts / 2, y + ts / 2);
        }
      }
    }
  }

  /* ── NPC描画 ── */
  function drawNpcs(ctx) {
    if (!_currentMap || !_currentMap.npcs) return;
    const ts = CONFIG.TILE_SIZE;

    for (const npc of _currentMap.npcs) {
      const x = npc.x * ts;
      const y = npc.y * ts;

      /* 背景丸 */
      ctx.fillStyle = npc.color || '#fff';
      ctx.beginPath();
      ctx.arc(x + ts / 2, y + ts / 2, ts / 2 - 2, 0, Math.PI * 2);
      ctx.fill();

      /* 記号 */
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(npc.symbol || '?', x + ts / 2, y + ts / 2);
    }
  }

  /* ── 公開 ── */
  return {
    TILE, loadMap, getTile, isSolid, getNpcAt, getExitAt,
    draw, drawNpcs,
    getCurrentMap: () => _currentMap,
    getCurrentMapName: () => _currentMapName
  };
})();
