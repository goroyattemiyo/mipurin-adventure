// ===== DATA_ROOM.JS - Room Generation (split from data.js) =====
// ===== ROOM GENERATION =====
// ===== ROOM TEMPLATES (Sprint 2) =====
// 0=floor, 1=wall, 2=spike, 3=water, 4=bush, 5=barrel(barrel is dynamic object, not tile)
let roomSpikes = [];
// === 環境ギミック (H-A2) ===
let roomBarrels = [];  // { c, r, hp:1, exploded:false }
// テーマ別 水場/草むら 生成有無
const THEME_GIMMICKS = {
  forest: { water: true, bush: false, barrel: false },
  cave:   { water: false, bush: false, barrel: true },
  flower: { water: false, bush: true,  barrel: false },
  abyss:  { water: true, bush: false, barrel: false },
  ruins:  { water: false, bush: true,  barrel: true }
};
const THEME_TEMPLATES = {
  forest:  ['pillars', 'scattered', 'corridors'],
  cave:    ['corridors', 'ring', 'scattered'],
  flower:  ['pillars', 'scattered', 'ring'],
  abyss:   ['corridors', 'ring', 'pillars'],
  ruins:   ['ring', 'corridors', 'scattered']
};
const PC = 10, PR = 7;
function safeZone(c, r) { return Math.abs(c - PC) < 3 && Math.abs(r - PR) < 3; }

function floodFill(map) {
  const visited = new Uint8Array(COLS * ROWS);
  const queue = [PR * COLS + PC]; visited[PR * COLS + PC] = 1; let count = 0;
  while (queue.length > 0) {
    const idx = queue.shift(); const c = idx % COLS, r = Math.floor(idx / COLS); count++;
    for (const [dc, dr] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      const nc = c+dc, nr = r+dr;
      if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS) {
        const ni = nr * COLS + nc;
        if (!visited[ni] && map[ni] !== 1) { visited[ni] = 1; queue.push(ni); }
      }
    }
  }
  let total = 0; for (let i = 0; i < map.length; i++) if (map[i] !== 1) total++;
  return count >= total;
}


function applyTemplate(map, name, fl) {
  const fb = getFloorBounds(fl);
  const mc = Math.floor((fb.c0 + fb.c1) / 2), mr = Math.floor((fb.r0 + fb.r1) / 2);
  const fw = fb.c1 - fb.c0, fh = fb.r1 - fb.r0;
  function put(c, r) { if (c > fb.c0 && c < fb.c1 && r > fb.r0 && r < fb.r1 && !safeZone(c, r)) map[r * COLS + c] = 1; }
  function clr(c, r) { if (c >= 0 && c < COLS && r >= 0 && r < ROWS) map[r * COLS + c] = 0; }

  if (name === 'pillars') {
    var spacing = fl <= 2 ? 3 : 4;
    for (var r = fb.r0 + 2; r < fb.r1 - 1; r += spacing) {
      for (var c = fb.c0 + 2; c < fb.c1 - 1; c += spacing) {
        if (rng() < 0.7) put(c, r);
      }
    }
  } else if (name === 'corridors') {
    var wallCount = 1 + Math.floor(rng() * 2);
    for (var w = 0; w < wallCount; w++) {
      var horiz = rng() > 0.5;
      if (horiz) {
        var wr = fb.r0 + 2 + Math.floor(rng() * Math.max(1, fh - 4));
        for (var c = fb.c0 + 1; c < fb.c1; c++) put(c, wr);
        var g1 = fb.c0 + 2 + Math.floor(rng() * Math.max(1, Math.floor(fw / 2)));
        var g2 = mc + 1 + Math.floor(rng() * Math.max(1, Math.floor(fw / 2) - 2));
        clr(g1, wr); clr(g1 + 1, wr); clr(g2, wr); clr(g2 + 1, wr);
      } else {
        var wc = fb.c0 + 3 + Math.floor(rng() * Math.max(1, fw - 6));
        for (var r = fb.r0 + 1; r < fb.r1; r++) put(wc, r);
        var g1 = fb.r0 + 2 + Math.floor(rng() * Math.max(1, Math.floor(fh / 2)));
        var g2 = mr + 1 + Math.floor(rng() * Math.max(1, Math.floor(fh / 2) - 2));
        clr(wc, g1); clr(wc, g1 + 1); clr(wc, g2); clr(wc, g2 + 1);
      }
    }
    for (var i = 0; i < 2 + Math.floor(rng() * 2); i++) {
      put(fb.c0 + 2 + Math.floor(rng() * Math.max(1, fw - 3)), fb.r0 + 2 + Math.floor(rng() * Math.max(1, fh - 3)));
    }
  } else if (name === 'arena') {
    var offC = Math.max(2, Math.floor(fw * 0.2)), offR = Math.max(2, Math.floor(fh * 0.25));
    put(mc - offC, mr - offR); put(mc + offC, mr - offR);
    put(mc - offC, mr + offR); put(mc + offC, mr + offR);
    put(fb.c0 + 2, fb.r0 + 2); put(fb.c0 + 3, fb.r0 + 2);
    put(fb.c1 - 2, fb.r0 + 2); put(fb.c1 - 3, fb.r0 + 2);
    put(fb.c0 + 2, fb.r1 - 2); put(fb.c0 + 3, fb.r1 - 2);
    put(fb.c1 - 2, fb.r1 - 2); put(fb.c1 - 3, fb.r1 - 2);
  } else if (name === 'scattered') {
    var cnt = 4 + Math.floor(fl * 0.8);
    for (var i = 0; i < cnt; i++) {
      var pc = fb.c0 + 2 + Math.floor(rng() * Math.max(1, fw - 3));
      var pr = fb.r0 + 2 + Math.floor(rng() * Math.max(1, fh - 3));
      put(pc, pr);
      if (rng() < 0.5) put(pc + (rng() > 0.5 ? 1 : 0), pr + (rng() > 0.5 ? 1 : 0));
    }
  } else if (name === 'ring') {
    var rx = Math.max(2, Math.floor(fw * 0.3)), ry = Math.max(2, Math.floor(fh * 0.3));
    for (var r = fb.r0 + 1; r < fb.r1; r++) {
      for (var c = fb.c0 + 1; c < fb.c1; c++) {
        var dx = (c - mc) / rx, dy = (r - mr) / ry, dist = dx * dx + dy * dy;
        if (dist > 0.6 && dist < 1.1) put(c, r);
      }
    }
    for (var d = -1; d <= 1; d++) { clr(mc + d, mr - ry); clr(mc + d, mr + ry); clr(mc - rx, mr + d); clr(mc + rx, mr + d); }
    if (rng() < 0.6) put(mc - 1, mr);
    if (rng() < 0.6) put(mc + 1, mr);
  } else {
    for (var i = 0; i < 3 + Math.floor(rng() * 3); i++) {
      put(fb.c0 + 2 + Math.floor(rng() * Math.max(1, fw - 3)), fb.r0 + 2 + Math.floor(rng() * Math.max(1, fh - 3)));
    }
  }
}

function generateRoom(fl) {
  var themeName = getTheme(fl).name;
  var templates = THEME_TEMPLATES[themeName] || ['pillars'];
  var pick = isBossFloor() ? 'arena' : templates[Math.floor(rng() * templates.length)];
  for (var attempt = 0; attempt < 5; attempt++) {
    var map = [];
    var _fb = getFloorBounds(fl);
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
      if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1 || r < _fb.r0 || r > _fb.r1 || c < _fb.c0 || c > _fb.c1) { map.push(1); continue; } map.push(0);
    }
    applyTemplate(map, pick, fl);
    roomSpikes = [];
    roomBarrels = [];
    if (fl >= 4 && !isBossFloor()) {
      var maxSp = Math.min(2 + Math.floor((fl - 3) * 1.5), 10);
      for (var i = 0; i < maxSp; i++) {
        var sc, sr, tries = 0;
        do { sc = _fb.c0 + 1 + Math.floor(rng() * Math.max(1, _fb.c1 - _fb.c0 - 2)); sr = _fb.r0 + 1 + Math.floor(rng() * Math.max(1, _fb.r1 - _fb.r0 - 2)); tries++; }
        while (tries < 30 && (map[sr * COLS + sc] !== 0 || safeZone(sc, sr)));
        if (tries < 30 && map[sr * COLS + sc] === 0) { map[sr * COLS + sc] = 2; roomSpikes.push({ c: sc, r: sr }); }
      }
    }
    // H-A2: 環境ギミック（水場・草むら・爆発樽）
    if (!isBossFloor()) {
      var _gim = THEME_GIMMICKS[themeName] || {};
      // 水場 (tile=3): fl>=2 テーマ対象
      if (_gim.water && fl >= 2) {
        var waterCount = 1 + Math.floor(rng() * 2);
        for (var wi = 0; wi < waterCount; wi++) {
          // 2×2 の水場パッチ
          var wc0, wr0, wt = 0;
          do { wc0 = _fb.c0 + 2 + Math.floor(rng() * Math.max(1, _fb.c1 - _fb.c0 - 5)); wr0 = _fb.r0 + 2 + Math.floor(rng() * Math.max(1, _fb.r1 - _fb.r0 - 5)); wt++; }
          while (wt < 20 && (map[wr0 * COLS + wc0] !== 0 || safeZone(wc0, wr0)));
          if (wt < 20) {
            for (var dwr = 0; dwr < 2; dwr++) for (var dwc = 0; dwc < 2; dwc++) {
              var nc = wc0 + dwc, nr = wr0 + dwr;
              if (nc > _fb.c0 && nc < _fb.c1 && nr > _fb.r0 && nr < _fb.r1 && map[nr * COLS + nc] === 0 && !safeZone(nc, nr))
                map[nr * COLS + nc] = 3;
            }
          }
        }
      }
      // 草むら (tile=4): fl>=1 テーマ対象
      if (_gim.bush && fl >= 1) {
        var bushCount = 2 + Math.floor(rng() * 3);
        for (var bi = 0; bi < bushCount; bi++) {
          var bc, br, bt = 0;
          do { bc = _fb.c0 + 1 + Math.floor(rng() * Math.max(1, _fb.c1 - _fb.c0 - 2)); br = _fb.r0 + 1 + Math.floor(rng() * Math.max(1, _fb.r1 - _fb.r0 - 2)); bt++; }
          while (bt < 20 && (map[br * COLS + bc] !== 0 || safeZone(bc, br)));
          if (bt < 20) map[br * COLS + bc] = 4;
        }
      }
      // 爆発樽 (dynamic obj): fl>=3 テーマ対象
      if (_gim.barrel && fl >= 3) {
        var barrelCount = 1 + Math.floor(rng() * 2);
        for (var bri = 0; bri < barrelCount; bri++) {
          var bac, bar_, bat = 0;
          do { bac = _fb.c0 + 1 + Math.floor(rng() * Math.max(1, _fb.c1 - _fb.c0 - 2)); bar_ = _fb.r0 + 1 + Math.floor(rng() * Math.max(1, _fb.r1 - _fb.r0 - 2)); bat++; }
          while (bat < 20 && (map[bar_ * COLS + bac] !== 0 || safeZone(bac, bar_)));
          if (bat < 20) roomBarrels.push({ c: bac, r: bar_, hp: 1, exploded: false });
        }
      }
    }
    if (floodFill(map)) return map;
  }
  var map = [];
  var _fb2 = getFloorBounds(fl);
  for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
    if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1 || r < _fb2.r0 || r > _fb2.r1 || c < _fb2.c0 || c > _fb2.c1) map.push(1); else map.push(0);
  }
  roomSpikes = []; roomBarrels = []; return map;
}
function tileAt(map, c, r) { if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return 1; return map[r * COLS + c]; }
