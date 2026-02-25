/**
 * map.js - マップデータ・タイル描画
 * ミプリンの冒険 v0.4.0
 */
const MapManager = (() => {

  const TILE = {
    GRASS:0, PATH:1, WALL:2, WATER:3, FLOWER_Y:4, FLOWER_R:5,
    TREE:6, HOUSE:7, DOOR:8, SAVE_POINT:9, FENCE:10, WELL:11,
    SIGN:12, BRIDGE:13, CHEST:14, STUMP:15, DARK_GRASS:16, BUSH:17,
    CAVE_FLOOR:18, FLOWER_GROUND:19, TORCH:20, CHEST_OPEN:21,
    ANCHOR:36, SEAL_WALL:37, EXIT:38
  };

  const TILE_COLORS = {
    [TILE.GRASS]:'#4a8c2a', [TILE.PATH]:'#c4a035', [TILE.WALL]:'#6b5b3a',
    [TILE.WATER]:'#3a7ecf', [TILE.FLOWER_Y]:'#4a8c2a', [TILE.FLOWER_R]:'#4a8c2a',
    [TILE.TREE]:'#2d5a1e', [TILE.HOUSE]:'#8B7355', [TILE.DOOR]:'#a0522d',
    [TILE.SAVE_POINT]:'#F5A623', [TILE.FENCE]:'#8B7355', [TILE.WELL]:'#708090',
    [TILE.SIGN]:'#c4a035', [TILE.BRIDGE]:'#a0522d', [TILE.CHEST]:'#DAA520',
    [TILE.STUMP]:'#6b5b3a', [TILE.DARK_GRASS]:'#3a6b1e', [TILE.BUSH]:'#3d7a22',
    [TILE.CAVE_FLOOR]:'#4b4b4b', [TILE.FLOWER_GROUND]:'#4f8f32',
    [TILE.TORCH]:'#b35a1a', [TILE.CHEST_OPEN]:'#C9A24A',
    [TILE.ANCHOR]:'#708090', [TILE.SEAL_WALL]:'#2ecc71',
    [TILE.EXIT]:'#7CFC00'
  };

  const TILE_SYMBOLS = {
    [TILE.FLOWER_Y]:'✿', [TILE.FLOWER_R]:'❀', [TILE.TREE]:'🌳',
    [TILE.HOUSE]:'🏠', [TILE.DOOR]:'🚪', [TILE.SAVE_POINT]:'💾',
    [TILE.WELL]:'○', [TILE.SIGN]:'📋', [TILE.CHEST]:'📦',
    [TILE.STUMP]:'◎', [TILE.FENCE]:'┃', [TILE.BUSH]:'🌿',
    [TILE.TORCH]:'🔥', [TILE.CHEST_OPEN]:'📭', [TILE.ANCHOR]:'⚓',
    [TILE.SEAL_WALL]:'🧱', [TILE.EXIT]:'🔽'
  };

  const SOLID = {
    [TILE.WALL]:true, [TILE.WATER]:true, [TILE.TREE]:true, [TILE.HOUSE]:true,
    [TILE.FENCE]:true, [TILE.WELL]:true, [TILE.CHEST]:true, [TILE.STUMP]:true,
    [TILE.BUSH]:true, [TILE.ANCHOR]:true, [TILE.SEAL_WALL]:true
  };

  const _maps = {};
  let _currentMap = null;
  let _currentMapName = '';
  let _bgCanvas = null;
  let _bgCtx = null;
  let _bgDirty = true;

  function _ensureBgCanvas(map) {
    const ts = CONFIG.TILE_SIZE;
    const w = map.cols * ts;
    const h = map.rows * ts;
    if (!_bgCanvas) _bgCanvas = document.createElement('canvas');
    if (_bgCanvas.width !== w || _bgCanvas.height !== h) {
      _bgCanvas.width = w;
      _bgCanvas.height = h;
    }
    if (!_bgCtx) _bgCtx = _bgCanvas.getContext('2d');
  }

  function _renderBackground() {
    if (!_currentMap || !_bgCtx || !_bgCanvas) return;
    const ts = CONFIG.TILE_SIZE;
    _bgCtx.clearRect(0, 0, _bgCanvas.width, _bgCanvas.height);
    _bgCtx.font = `${CONFIG.TILE_SIZE / 2}px sans-serif`;
    _bgCtx.textAlign = 'center';
    _bgCtx.textBaseline = 'middle';
    for (let row=0; row<_currentMap.rows; row++) {
      for (let col=0; col<_currentMap.cols; col++) {
        const tile = _currentMap.data[row*_currentMap.cols+col];
        const x = col*ts, y = row*ts;
        _bgCtx.fillStyle = TILE_COLORS[tile]||'#333'; _bgCtx.fillRect(x,y,ts,ts);
        _bgCtx.strokeStyle = 'rgba(0,0,0,0.1)'; _bgCtx.strokeRect(x,y,ts,ts);
        const sym = TILE_SYMBOLS[tile];
        if (sym) { _bgCtx.fillStyle='#fff'; _bgCtx.fillText(sym,x+ts/2,y+ts/2); }
      }
    }
  }

  function _prepareNpcCanvas(npc) {
    const ts = CONFIG.TILE_SIZE;
    const canvas = document.createElement('canvas');
    canvas.width = ts;
    canvas.height = ts;
    const c = canvas.getContext('2d');
    c.fillStyle = npc.color||'#fff';
    c.beginPath(); c.arc(ts/2, ts/2, ts/2-2, 0, Math.PI*2); c.fill();
    c.font = `${Math.floor(CONFIG.TILE_SIZE * 0.56)}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(npc.symbol||'?', ts/2, ts/2);
    npc._canvas = canvas;
  }

  /* ── 村マップ ── */
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
      6,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,6,
      6,6,6,6,6,6,6,6,6,1,6,6,6,6,6,6,6,6,6,6
    ],
    playerStart: { x: 9, y: 7 },
    exits: [
      { x: 9, y: 14, to: 'forest_south', spawnX: 9, spawnY: 1 }
    ],
    npcs: [
      { id:'hatch', x:8, y:6, name:'長老ハッチ', symbol:'👴', color:'#DEB887' },
      { id:'miel', x:11, y:6, name:'占い師ミエル', symbol:'🔮', color:'#9370DB' },
      { id:'marche', x:3, y:3, name:'商人マルシェ', symbol:'🛒', color:'#FF8C00' },
      { id:'bee', x:14, y:2, name:'ビー', symbol:'🐝', color:'#FFD700' },
      { id:'pore', x:16, y:3, name:'ポーレ', symbol:'🧒', color:'#98FB98' }
    ],
    enemies: []
  };

  /* BACKUP: 固定マップ（南/北の森・洞窟・花畑）
  ── 南の森マップ ──
  _maps.forest_south = {
    cols: 20, rows: 15,
    data: [
      6,6,6,6,6,6,6,6,6,1,6,6,6,6,6,6,6,6,6,6,
      6,16,16,0,0,0,6,16,0,1,0,16,6,0,0,0,16,16,16,6,
      6,16,0,0,17,0,0,0,0,0,0,0,0,0,17,0,0,16,16,6,
      6,0,0,6,0,0,0,16,0,0,0,16,0,0,0,6,0,0,0,6,
      6,0,0,0,0,16,0,0,0,0,0,0,0,16,0,0,0,0,0,6,
      6,16,0,0,0,0,0,0,16,0,16,0,0,0,0,0,0,16,0,6,
      6,0,0,6,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,
      6,0,0,0,0,0,16,0,0,12,0,0,16,0,0,0,0,0,0,6,
      6,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,6,
      6,0,0,6,0,17,0,0,0,0,0,0,0,17,0,6,0,0,0,6,
      6,0,0,0,0,0,0,16,0,0,0,16,0,0,0,0,0,0,0,6,
      6,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,6,
      6,16,16,0,0,6,0,0,0,0,0,0,0,6,0,0,16,16,16,6,
      6,16,16,16,0,0,0,0,0,1,0,0,0,0,0,16,16,16,16,6,
      6,6,6,6,6,6,6,6,6,1,6,6,6,6,6,6,6,6,6,6
    ],
    playerStart: { x: 9, y: 1 },
    exits: [
      { x: 9, y: 0, to: 'village', spawnX: 9, spawnY: 13 },
      { x: 9, y: 14, to: 'forest_north', spawnX: 9, spawnY: 1 }
    ],
    npcs: [
      { id:'navi', x:9, y:7, name:'ナビィ', symbol:'🧚', color:'#87CEEB' }
    ],
    enemies: [
      { type:'poison_mushroom', x:3, y:4 },
      { type:'poison_mushroom', x:15, y:3 },
      { type:'green_slime', x:5, y:8 },
      { type:'green_slime', x:14, y:9 },
      { type:'spider', x:10, y:5 }
    ]
  };

  /* ── 北の森マップ（ボス前） ── */
  _maps.forest_north = {
    cols: 20, rows: 15,
    data: [
      6,6,6,6,6,6,6,6,6,1,6,6,6,6,6,6,6,6,6,6,
      6,16,0,0,0,6,16,0,0,1,0,0,16,6,0,0,0,16,16,6,
      6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,
      6,0,6,0,0,0,16,0,0,0,0,0,16,0,0,0,6,0,0,6,
      6,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,6,
      6,16,0,0,6,0,0,0,0,0,0,0,0,0,6,0,0,16,0,6,
      6,0,0,0,0,0,0,16,0,0,0,16,0,0,0,0,0,0,0,6,
      6,0,6,0,0,0,0,0,0,1,0,0,0,0,0,0,6,0,0,6,
      6,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,6,
      6,16,0,0,6,0,0,0,0,1,0,0,0,0,6,0,0,16,0,6,
      6,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,6,
      6,0,6,0,0,0,16,0,0,1,0,0,16,0,0,0,6,0,0,6,
      6,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,6,
      6,16,16,0,0,0,0,0,0,1,0,0,0,0,0,0,16,16,0,6,
      6,6,6,6,6,6,6,6,6,1,6,6,6,6,6,6,6,6,6,6
    ],
    playerStart: { x: 9, y: 1 },
    exits: [
      { x: 9, y: 0, to: 'forest_south', spawnX: 9, spawnY: 13 },
      { x: 9, y: 14, to: 'cave', spawnX: 9, spawnY: 1 }
    ],
    npcs: [],
    enemies: [
      { type:'green_slime', x:4, y:3 },
      { type:'green_slime', x:15, y:3 },
      { type:'spider', x:6, y:6 },
      { type:'spider', x:13, y:6 },
      { type:'poison_mushroom', x:3, y:10 },
      { type:'poison_mushroom', x:16, y:10 }
    ]
  };
    /* ── 洞窟マップ ── */
  _maps.cave = {
    cols: 20, rows: 15,
    data: [
      2,2,2,2,2,2,2,2,2,13,2,2,2,2,2,2,2,2,2,2,
      2,16,16,2,0,0,0,16,0,13,0,16,0,0,2,0,0,16,16,2,
      2,16,0,0,0,2,0,0,0,1,0,0,0,2,0,0,0,0,16,2,
      2,0,0,2,0,0,0,16,0,1,0,16,0,0,0,2,0,0,0,2,
      2,0,0,0,0,16,0,0,37,1,0,0,0,16,0,0,0,0,0,2,
      2,16,0,0,0,0,0,0,16,1,16,0,0,0,0,0,0,16,0,2,
      2,0,0,2,0,0,0,0,0,1,0,0,0,0,0,2,0,0,0,2,
      2,0,0,0,0,0,16,0,0,12,0,0,16,0,0,0,0,0,0,2,
      2,16,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,16,0,2,
      2,0,0,2,0,17,0,0,0,1,0,0,0,17,0,2,0,0,0,2,
      2,0,0,0,0,0,0,16,0,1,0,16,0,0,0,0,0,0,0,2,
      2,16,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,16,0,2,
      2,16,16,0,0,2,0,0,0,1,0,0,0,2,0,0,16,16,16,2,
      2,16,16,16,0,0,0,0,0,13,0,0,0,0,0,16,16,16,16,2,
      2,2,2,2,2,2,2,2,2,13,2,2,2,2,2,2,2,2,2,2
    ],
    playerStart: { x: 9, y: 1 },
    exits: [
      { x: 9, y: 0, to: 'forest_north', spawnX: 9, spawnY: 13 },
      { x: 9, y: 14, to: 'flower_field', spawnX: 9, spawnY: 1 }
    ],
    npcs: [
      { id:'granpa', x:9, y:7, name:'グランパ', symbol:'🧓', color:'#B0A090' }
    ],
    enemies: [
      { type:'bat', x:3, y:3 },
      { type:'bat', x:15, y:3 },
      { type:'ice_worm', x:6, y:9 },
      { type:'ice_worm', x:13, y:10 }
    ]
  };

  /* ── 花畑マップ ── */
  _maps.flower_field = {
    cols: 20, rows: 15,
    data: [
      6,6,6,6,6,6,6,6,6,13,6,6,6,6,6,6,6,6,6,6,
      6,4,4,0,0,0,6,4,0,13,0,5,6,0,0,0,4,4,4,6,
      6,4,0,0,17,0,0,0,4,1,5,0,0,0,17,0,0,4,4,6,
      6,0,0,6,0,0,0,4,0,1,0,5,0,0,0,6,0,0,0,6,
      6,0,0,0,0,4,0,0,5,1,4,0,0,4,0,0,0,0,0,6,
      6,4,0,0,0,0,0,0,4,1,5,0,0,0,0,0,0,4,0,6,
      6,0,0,6,0,0,0,0,0,1,0,0,0,0,0,6,0,0,0,6,
      6,0,0,0,0,0,4,0,0,12,0,0,5,0,0,0,0,0,0,6,
      6,4,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,0,6,
      6,0,0,6,0,17,0,0,0,1,0,0,0,17,0,6,0,0,0,6,
      6,0,0,0,0,0,0,4,0,1,0,5,0,0,0,0,0,0,0,6,
      6,4,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,0,6,
      6,4,4,0,0,6,0,0,0,1,0,0,0,6,0,0,4,4,4,6,
      6,4,4,4,0,0,0,0,0,13,0,0,0,0,0,4,4,4,4,6,
      6,6,6,6,6,6,6,6,6,13,6,6,6,6,6,6,6,6,6,6
    ],
    playerStart: { x: 9, y: 1 },
    exits: [
      { x: 9, y: 0, to: 'cave', spawnX: 9, spawnY: 13 }
    ],
    npcs: [],
    enemies: [
      { type:'dark_flower', x:6, y:4 },
      { type:'dark_flower', x:13, y:4 },
      { type:'shadow_bee', x:4, y:10 },
      { type:'shadow_bee', x:15, y:10 }
    ]
  };
  BACKUP END
  */

  function _mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function _randInt(rng, min, max) {
    return Math.floor(rng() * (max - min + 1)) + min;
  }

  function _pick(rng, arr) {
    return arr[_randInt(rng, 0, arr.length - 1)];
  }

  function _getTilesForTheme(theme) {
    switch (theme) {
      case 'forest': return { floor: TILE.GRASS, wall: TILE.TREE };
      case 'cave': return { floor: TILE.CAVE_FLOOR, wall: TILE.WALL };
      case 'flower': return { floor: TILE.FLOWER_GROUND, wall: TILE.BUSH };
      case 'abyss': return { floor: TILE.DARK_GRASS, wall: TILE.WALL };
      case 'ruins': return { floor: TILE.PATH, wall: TILE.WALL };
      case 'sky_garden': return { floor: TILE.FLOWER_Y, wall: TILE.FENCE };
      default: return { floor: TILE.GRASS, wall: TILE.TREE };
    }
  }

  function _getEnemyPool(theme) {
    switch (theme) {
      case 'forest': return ['poison_mushroom', 'green_slime', 'spider'];
      case 'cave': return ['bat', 'ice_worm', 'dark_slime'];
      case 'flower': return ['dark_flower', 'shadow_bee', 'spider'];
      case 'abyss': return ['dark_slime', 'shadow_bee', 'bat'];
      case 'ruins': return ['spider', 'bat', 'dark_slime'];
      case 'sky_garden': return ['shadow_bee', 'green_slime', 'poison_mushroom'];
      default: return ['green_slime', 'spider'];
    }
  }

  function _getThemeForArea(name, areaLv) {
    if (name === 'forest_south' || name === 'forest_north') return 'forest';
    if (name === 'cave') return 'cave';
    if (name === 'flower_field') return 'flower';
    const themes = ['forest','cave','flower','abyss','ruins','sky_garden'];
    const idx = Math.floor((areaLv - 1) / 10) % themes.length;
    return themes[Math.max(0, idx)];
  }

  function generateRandomMap(areaLv, theme, seed) {
    const rng = _mulberry32(seed || Date.now());
    const cols = 20;
    const rows = 15;
    const tiles = _getTilesForTheme(theme);

    const data = new Array(cols * rows).fill(tiles.wall);
    const rooms = [];
    const corridors = [];

    function node(x, y, w, h) { return { x, y, w, h, left: null, right: null, room: null }; }

    function split(n, depth) {
      const minSize = 4;
      if (depth <= 0 || n.w < minSize * 2 + 2 || n.h < minSize * 2 + 2) return;
      const splitH = n.w > n.h ? false : n.h > n.w ? true : rng() > 0.5;
      if (splitH) {
        const splitAt = _randInt(rng, minSize + 1, n.h - minSize - 1);
        n.left = node(n.x, n.y, n.w, splitAt);
        n.right = node(n.x, n.y + splitAt, n.w, n.h - splitAt);
      } else {
        const splitAt = _randInt(rng, minSize + 1, n.w - minSize - 1);
        n.left = node(n.x, n.y, splitAt, n.h);
        n.right = node(n.x + splitAt, n.y, n.w - splitAt, n.h);
      }
      split(n.left, depth - 1);
      split(n.right, depth - 1);
    }

    function createRoom(n) {
      if (n.left && n.right) { createRoom(n.left); createRoom(n.right); return; }
      const minS = 4;
      const maxS = 8;
      const rw = Math.min(maxS, _randInt(rng, minS, Math.max(minS, n.w - 2)));
      const rh = Math.min(maxS, _randInt(rng, minS, Math.max(minS, n.h - 2)));
      const rx = _randInt(rng, n.x + 1, n.x + n.w - rw - 1);
      const ry = _randInt(rng, n.y + 1, n.y + n.h - rh - 1);
      n.room = { x: rx, y: ry, w: rw, h: rh };
      rooms.push(n.room);
    }

    function getRoom(n) {
      if (n.room) return n.room;
      if (n.left) { const r = getRoom(n.left); if (r) return r; }
      if (n.right) { const r = getRoom(n.right); if (r) return r; }
      return null;
    }

    function connect(n) {
      if (!n.left || !n.right) return;
      connect(n.left);
      connect(n.right);
      const a = getRoom(n.left);
      const b = getRoom(n.right);
      if (!a || !b) return;
      const ax = Math.floor(a.x + a.w / 2);
      const ay = Math.floor(a.y + a.h / 2);
      const bx = Math.floor(b.x + b.w / 2);
      const by = Math.floor(b.y + b.h / 2);
      const corridor = [];
      let cx = ax, cy = ay;
      while (cx !== bx) { corridor.push({ x: cx, y: cy }); cx += cx < bx ? 1 : -1; }
      while (cy !== by) { corridor.push({ x: cx, y: cy }); cy += cy < by ? 1 : -1; }
      corridor.push({ x: bx, y: by });
      corridors.push(corridor);
    }

    const depth = 3;
    const root = node(0, 0, cols, rows);
    split(root, depth);
    createRoom(root);
    connect(root);

    for (const room of rooms) {
      for (let r = room.y; r < room.y + room.h; r++) {
        for (let c = room.x; c < room.x + room.w; c++) {
          data[r * cols + c] = tiles.floor;
        }
      }
    }
    for (const corr of corridors) {
      for (const p of corr) {
        data[p.y * cols + p.x] = tiles.floor;
      }
    }

    const roomCenters = rooms.map(r => ({ x: Math.floor(r.x + r.w / 2), y: Math.floor(r.y + r.h / 2) }));
    const playerStart = roomCenters[0] || { x: 1, y: 1 };
    const exitRoom = rooms[Math.max(0, rooms.length - 1)];
    const exitPos = exitRoom ? { x: Math.floor(exitRoom.x + exitRoom.w / 2), y: Math.floor(exitRoom.y + exitRoom.h / 2) } : { x: cols - 2, y: rows - 2 };

    data[playerStart.y * cols + playerStart.x] = tiles.floor;
    data[exitPos.y * cols + exitPos.x] = TILE.EXIT;

    if (rooms[0]) {
      const sx = Math.min(cols - 2, Math.max(1, Math.floor(rooms[0].x + rooms[0].w / 2) + 1));
      const sy = Math.min(rows - 2, Math.max(1, Math.floor(rooms[0].y + rooms[0].h / 2)));
      data[sy * cols + sx] = TILE.SAVE_POINT;
    }

    const types = [];
    const isBossArea = areaLv % 10 === 0;
    for (let i = 0; i < rooms.length; i++) {
      if (i === 0) { types[i] = 'start'; continue; }
      if (i === rooms.length - 1 && isBossArea) { types[i] = 'boss'; continue; }
      const roll = rng();
      if (roll < 0.50) types[i] = 'combat';
      else if (roll < 0.65) types[i] = 'treasure';
      else if (roll < 0.80) types[i] = 'elite';
      else if (roll < 0.90) types[i] = 'shop';
      else types[i] = 'combat';
    }

    const enemyPool = _getEnemyPool(theme);
    const enemies = [];
    const npcs = [];

    for (let i = 0; i < rooms.length; i++) {
      const room = rooms[i];
      const type = types[i];
      if (!room || type === 'start') continue;
      const center = { x: Math.floor(room.x + room.w / 2), y: Math.floor(room.y + room.h / 2) };

      if (type === 'treasure') {
        const chestCount = _randInt(rng, 1, 2);
        for (let c = 0; c < chestCount; c++) {
          const cx = _randInt(rng, room.x + 1, room.x + room.w - 2);
          const cy = _randInt(rng, room.y + 1, room.y + room.h - 2);
          data[cy * cols + cx] = TILE.CHEST;
        }
        continue;
      }

      if (type === 'shop') {
        npcs.push({ id:'marche', x:center.x, y:center.y, name:'商人', symbol:'🎒', color:'#E67E22' });
        continue;
      }

      if (type === 'boss') {
        continue;
      }

      if (type === 'elite') {
        const eliteType = _pick(rng, enemyPool);
        enemies.push({ type: eliteType, x: center.x, y: center.y, isElite: true });
        for (let k = 0; k < 2; k++) {
          const ex = _randInt(rng, room.x + 1, room.x + room.w - 2);
          const ey = _randInt(rng, room.y + 1, room.y + room.h - 2);
          enemies.push({ type: _pick(rng, enemyPool), x: ex, y: ey });
        }
        continue;
      }

      if (type === 'combat') {
        const count = _randInt(rng, 3, 6);
        for (let k = 0; k < count; k++) {
          const ex = _randInt(rng, room.x + 1, room.x + room.w - 2);
          const ey = _randInt(rng, room.y + 1, room.y + room.h - 2);
          enemies.push({ type: _pick(rng, enemyPool), x: ex, y: ey });
        }
      }
    }

    return { cols, rows, data, playerStart, exits: [], npcs, enemies };
  }

  function loadMap(name) {
    let map = _maps[name];
    if (!map && name !== 'village') {
      const lvl = typeof Game !== 'undefined' && Game.getPlayerLevel ? Game.getPlayerLevel() : 1;
      const aLv = Scaling.areaLevel(lvl, name);
      const theme = _getThemeForArea(name, aLv);
      const seed = Date.now() + aLv;
      map = generateRandomMap(aLv, theme, seed);
    }
    if (!map) { console.warn('マップが見つかりません:', name); return null; }
    _currentMap = map; _currentMapName = name;
    _ensureBgCanvas(map);
    _renderBackground();
    _bgDirty = false;
    if (_currentMap.npcs) {
      for (const npc of _currentMap.npcs) { _prepareNpcCanvas(npc); }
    }
    return map;
  }

  function getTile(col, row) {
    if (!_currentMap) return -1;
    if (col<0||col>=_currentMap.cols||row<0||row>=_currentMap.rows) return -1;
    return _currentMap.data[row * _currentMap.cols + col];
  }

  function setTile(col, row, tile) {
    if (!_currentMap) return false;
    if (col<0||col>=_currentMap.cols||row<0||row>=_currentMap.rows) return false;
    _currentMap.data[row * _currentMap.cols + col] = tile;
    _bgDirty = true;
    return true;
  }

  function isSolid(col, row) { const t = getTile(col,row); if(t===-1) return true; return !!SOLID[t]; }
  function getNpcAt(col, row) { if(!_currentMap||!_currentMap.npcs) return null; return _currentMap.npcs.find(n=>n.x===col&&n.y===row)||null; }
  function getExitAt(col, row) { if(!_currentMap||!_currentMap.exits) return null; return _currentMap.exits.find(e=>e.x===col&&e.y===row)||null; }

  function draw(ctx) {
    if (!_currentMap) return;
    if (_bgDirty) {
      _renderBackground();
      _bgDirty = false;
    }
    if (_bgCanvas) ctx.drawImage(_bgCanvas, 0, 0);
  }

  function drawNpcs(ctx) {
    if (!_currentMap||!_currentMap.npcs) return;
    const ts = CONFIG.TILE_SIZE;
    for (const npc of _currentMap.npcs) {
      const x=npc.x*ts, y=npc.y*ts;
      if (npc._canvas) ctx.drawImage(npc._canvas, x, y);
      else {
        ctx.fillStyle=npc.color||'#fff'; ctx.beginPath(); ctx.arc(x+ts/2,y+ts/2,ts/2-2,0,Math.PI*2); ctx.fill();
        ctx.font='18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(npc.symbol||'?',x+ts/2,y+ts/2);
      }
    }
  }

  return {
    TILE,
    loadMap,
    getTile,
    setTile,
    isSolid,
    getNpcAt,
    getExitAt,
    draw,
    drawNpcs,
    generateRandomMap,
    getThemeForArea: _getThemeForArea,
    getCurrentMap:()=>_currentMap,
    getCurrentMapName:()=>_currentMapName
  };
})();
