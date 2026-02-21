/**
 * map.js - マップデータ・タイル描画
 * ミプリンの冒険 v0.4.0
 */
const MapManager = (() => {

  const TILE = {
    GRASS:0, PATH:1, WALL:2, WATER:3, FLOWER_Y:4, FLOWER_R:5,
    TREE:6, HOUSE:7, DOOR:8, SAVE_POINT:9, FENCE:10, WELL:11,
    SIGN:12, BRIDGE:13, CHEST:14, STUMP:15, DARK_GRASS:16, BUSH:17
  };

  const TILE_COLORS = {
    [TILE.GRASS]:'#4a8c2a', [TILE.PATH]:'#c4a035', [TILE.WALL]:'#6b5b3a',
    [TILE.WATER]:'#3a7ecf', [TILE.FLOWER_Y]:'#4a8c2a', [TILE.FLOWER_R]:'#4a8c2a',
    [TILE.TREE]:'#2d5a1e', [TILE.HOUSE]:'#8B7355', [TILE.DOOR]:'#a0522d',
    [TILE.SAVE_POINT]:'#F5A623', [TILE.FENCE]:'#8B7355', [TILE.WELL]:'#708090',
    [TILE.SIGN]:'#c4a035', [TILE.BRIDGE]:'#a0522d', [TILE.CHEST]:'#DAA520',
    [TILE.STUMP]:'#6b5b3a', [TILE.DARK_GRASS]:'#3a6b1e', [TILE.BUSH]:'#3d7a22'
  };

  const TILE_SYMBOLS = {
    [TILE.FLOWER_Y]:'✿', [TILE.FLOWER_R]:'❀', [TILE.TREE]:'🌳',
    [TILE.HOUSE]:'🏠', [TILE.DOOR]:'🚪', [TILE.SAVE_POINT]:'💾',
    [TILE.WELL]:'○', [TILE.SIGN]:'📋', [TILE.CHEST]:'📦',
    [TILE.STUMP]:'◎', [TILE.FENCE]:'┃', [TILE.BUSH]:'🌿'
  };

  const SOLID = {
    [TILE.WALL]:true, [TILE.WATER]:true, [TILE.TREE]:true, [TILE.HOUSE]:true,
    [TILE.FENCE]:true, [TILE.WELL]:true, [TILE.CHEST]:true, [TILE.STUMP]:true,
    [TILE.BUSH]:true
  };

  const _maps = {};
  let _currentMap = null;
  let _currentMapName = '';

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

  /* ── 南の森マップ ── */
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
      6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6
    ],
    playerStart: { x: 9, y: 1 },
    exits: [
      { x: 9, y: 0, to: 'forest_south', spawnX: 9, spawnY: 13 }
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
      2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,
      2,16,16,16,2,16,16,16,16,1,16,16,16,16,2,16,16,16,16,2,
      2,16,16,16,16,16,2,16,16,16,16,16,2,16,16,16,16,16,16,2,
      2,16,2,16,16,16,16,16,16,16,16,16,16,16,16,16,2,16,16,2,
      2,16,16,16,16,2,16,16,16,16,16,16,16,2,16,16,16,16,16,2,
      2,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,2,
      2,2,16,16,16,16,16,16,16,1,16,16,16,16,16,16,16,2,16,2,
      2,16,16,16,2,16,16,16,16,1,16,16,16,16,2,16,16,16,16,2,
      2,16,16,16,16,16,16,16,16,1,16,16,16,16,16,16,16,16,16,2,
      2,2,16,16,16,16,16,2,16,16,16,2,16,16,16,16,16,2,16,2,
      2,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,16,2,
      2,16,2,16,16,16,16,16,16,16,16,16,16,16,16,16,2,16,16,2,
      2,16,16,16,16,2,16,16,16,16,16,16,16,2,16,16,16,16,16,2,
      2,16,16,16,16,16,16,16,16,1,16,16,16,16,16,16,16,16,16,2,
      2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2
    ],
    playerStart: { x: 9, y: 1 },
    exits: [
      { x: 9, y: 0, to: 'forest_north', spawnX: 9, spawnY: 13 },
      { x: 9, y: 14, to: 'flower_field', spawnX: 9, spawnY: 1 }
    ],
    npcs: [
      { id:'granpa', x:10, y:7, name:'グランパ', symbol:'🛡️', color:'#C0C0C0' }
    ],
    enemies: [
      { type:'bat', x:4, y:4 },
      { type:'bat', x:15, y:4 },
      { type:'ice_worm', x:6, y:10 },
      { type:'ice_worm', x:13, y:10 }
    ]
  };

  /* ── 花畑マップ ── */
  _maps.flower_field = {
    cols: 20, rows: 15,
    data: [
      6,6,6,6,6,6,6,6,6,1,6,6,6,6,6,6,6,6,6,6,
      6,0,4,0,5,0,0,4,0,1,0,4,0,0,5,0,4,0,5,6,
      6,5,0,0,0,4,0,0,5,0,5,0,0,4,0,0,0,5,0,6,
      6,0,0,4,0,0,5,0,0,0,0,0,5,0,0,4,0,0,0,6,
      6,4,0,0,0,0,0,0,4,0,4,0,0,0,0,0,0,0,4,6,
      6,0,5,0,0,4,0,0,0,0,0,0,0,4,0,0,5,0,0,6,
      6,0,0,0,5,0,0,5,0,0,0,5,0,0,5,0,0,0,0,6,
      6,4,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,4,0,6,
      6,0,0,5,0,0,4,0,0,1,0,0,4,0,0,5,0,0,0,6,
      6,0,4,0,0,0,0,0,0,1,0,0,0,0,0,0,4,0,0,6,
      6,5,0,0,0,5,0,0,0,0,0,0,0,5,0,0,0,5,0,6,
      6,0,0,4,0,0,0,5,0,0,0,5,0,0,0,4,0,0,0,6,
      6,0,5,0,0,0,4,0,0,0,0,0,4,0,0,0,5,0,0,6,
      6,4,0,0,5,0,0,0,4,0,4,0,0,0,5,0,0,4,0,6,
      6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6
    ],
    playerStart: { x: 9, y: 1 },
    exits: [
      { x: 9, y: 0, to: 'cave', spawnX: 9, spawnY: 13 }
    ],
    npcs: [],
    enemies: [
      { type:'dark_flower', x:5, y:5 },
      { type:'dark_flower', x:14, y:5 },
      { type:'shadow_bee', x:7, y:10 },
      { type:'shadow_bee', x:12, y:10 }
    ]
  };


  function loadMap(name) {
    const map = _maps[name];
    if (!map) { console.warn('マップが見つかりません:', name); return null; }
    _currentMap = map; _currentMapName = name; return map;
  }

  function getTile(col, row) {
    if (!_currentMap) return -1;
    if (col<0||col>=_currentMap.cols||row<0||row>=_currentMap.rows) return -1;
    return _currentMap.data[row * _currentMap.cols + col];
  }

  function isSolid(col, row) { const t = getTile(col,row); if(t===-1) return true; return !!SOLID[t]; }
  function getNpcAt(col, row) { if(!_currentMap||!_currentMap.npcs) return null; return _currentMap.npcs.find(n=>n.x===col&&n.y===row)||null; }
  function getExitAt(col, row) { if(!_currentMap||!_currentMap.exits) return null; return _currentMap.exits.find(e=>e.x===col&&e.y===row)||null; }

  function draw(ctx) {
    if (!_currentMap) return;
    const ts = CONFIG.TILE_SIZE;
    for (let row=0; row<_currentMap.rows; row++) {
      for (let col=0; col<_currentMap.cols; col++) {
        const tile = _currentMap.data[row*_currentMap.cols+col];
        const x = col*ts, y = row*ts;
        ctx.fillStyle = TILE_COLORS[tile]||'#333'; ctx.fillRect(x,y,ts,ts);
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.strokeRect(x,y,ts,ts);
        const sym = TILE_SYMBOLS[tile];
        if (sym) { ctx.font='16px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(sym,x+ts/2,y+ts/2); }
      }
    }
  }

  function drawNpcs(ctx) {
    if (!_currentMap||!_currentMap.npcs) return;
    const ts = CONFIG.TILE_SIZE;
    for (const npc of _currentMap.npcs) {
      const x=npc.x*ts, y=npc.y*ts;
      ctx.fillStyle=npc.color||'#fff'; ctx.beginPath(); ctx.arc(x+ts/2,y+ts/2,ts/2-2,0,Math.PI*2); ctx.fill();
      ctx.font='18px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(npc.symbol||'?',x+ts/2,y+ts/2);
    }
  }

  return { TILE, loadMap, getTile, isSolid, getNpcAt, getExitAt, draw, drawNpcs, getCurrentMap:()=>_currentMap, getCurrentMapName:()=>_currentMapName };
})();
