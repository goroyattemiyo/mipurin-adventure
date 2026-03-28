
let collectionSubTab = 0; // 0=enemies, 1=weapons
let collectionScroll = 0; // enemy collection scroll offset

const UI_TEXT_STYLE = {
  heading:  { font: "bold 28px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'left' },
  subhead:  { font: "bold 22px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'left' },
  label:    { font: "bold 18px 'M PLUS Rounded 1c', sans-serif", color: '#fff', align: 'left' },
  body:     { font: "18px 'M PLUS Rounded 1c', sans-serif", color: '#fff', align: 'left' },
  detail:   { font: "16px 'M PLUS Rounded 1c', sans-serif", color: '#ccc', align: 'left' },
  hint:     { font: "16px 'M PLUS Rounded 1c', sans-serif", color: '#aaa', align: 'center' },
  accent:   { font: "bold 20px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'center' },
  icon:     { font: "48px 'M PLUS Rounded 1c', sans-serif", color: '#fff', align: 'center' },
  cost:     { font: "bold 20px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'center' },
  warn:     { font: "bold 18px 'M PLUS Rounded 1c', sans-serif", color: '#f66', align: 'center' },
};

function drawInventory() {
  if (!inventoryOpen) return;
  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, CW, CH);
  const tabs = ['持ち物', '図鑑', '装備'];
  for (let i = 0; i < tabs.length; i++) {
    const tx = CW / 2 - 120 + i * 240, ty = 70 + 15*_M;
    ctx.fillStyle = inventoryTab === i ? '#ffd700' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(tx - 80, ty - 20*_M, 160, 40*_M);
    ctx.fillStyle = inventoryTab === i ? '#000' : '#fff';
    ctx.font = "bold " + (20*_M) + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(tabs[i], tx, ty + 7*_M);
  }
  ctx.textAlign = 'left';
  if (inventoryTab === 0) drawInventoryItems();
  else if (inventoryTab === 1) drawCollectionTab();
  if (inventoryTab === 2) drawEquipTab(80, 130, CW - 160, CH - 180);

  // ヘルプアイコン（タブ共通・最前面）
  var _helpLines;
  if (inventoryTab === 0) {
    _helpLines = ['花粉 = ショップで使う通貨', 'HP / ATK / 速度: プレイヤーの状態', 'TAB キー: タブ切替', 'ESC キー: とじる'];
  } else if (inventoryTab === 1) {
    _helpLines = ['↑↓ キー: スクロール', '← → キー: サブタブ切替', 'TAB キー: タブ切替', 'ESC キー: とじる'];
  } else {
    _helpLines = ['↑↓: スロット選択', '→: リストへ (武器スロット)', 'Z: 強化 / そうび', 'X: そうびを切り替え', 'ESC: とじる'];
  }
  UIManager.drawHelpIcon(ctx, CW - 110, 55 + 10*_M, 34, 'inventory');
  if (UIManager.isHelpOpen('inventory')) {
    var _tabName = ['持ち物', '図鑑', '装備'][inventoryTab] || '';
    UIManager.showModal(ctx, _tabName + ' — 操作ガイド', _helpLines);
  }
}

function drawInventoryItems() {
  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  const lx = 80, ly = 100 + 40*_M;
  const sp = 30 * _M; // line spacing
  ctx.fillStyle = '#ffd700'; ctx.font = "bold " + (24*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ステータス', lx, ly);
  ctx.fillStyle = '#fff'; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  const stats = ['HP: ' + player.hp + ' / ' + player.maxHp, 'ATK: ' + Math.ceil(player.atk * (player.weapon.dmgMul || 1)), '速度: ' + player.speed, 'フロア: ' + floor, 'スコア: ' + score, '花粉: ' + pollen];
  for (let i = 0; i < stats.length; i++) ctx.fillText(stats[i], lx + 20, ly + sp + i * sp);
  const wx = CW / 2 + 40, wy = ly;
  ctx.fillStyle = '#ffd700'; ctx.font = "bold " + (24*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('武器', wx, wy);
  ctx.fillStyle = player.weapon.color; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('⚔ ' + player.weapon.name, wx + 20, wy + sp);
  ctx.fillStyle = '#ccc'; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ダメージ倍率: x' + (player.weapon.dmgMul || 1).toFixed(1), wx + 20, wy + sp*2);
  ctx.fillText('射程: ' + ((player.weapon.range||44) + (player.atkRangeBonus||0)), wx + 20, wy + sp*3);
  ctx.fillText('速度: ' + player.weapon.speed.toFixed(2) + 's', wx + 20, wy + sp*4);
  ctx.fillStyle = '#ffd700'; ctx.font = "bold " + (20*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('【おきにいり】', wx + 20, wy + sp*5);
  const w0 = player.weapons[0];
  if (w0) { ctx.fillStyle = w0.color; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(w0.name + ' (ATKx' + (w0.dmgMul||1).toFixed(1) + ' 射程' + w0.range + ')', wx + 30, wy + sp*6); }
  ctx.fillStyle = '#aaa'; ctx.font = "bold " + (20*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('【もうひとつ】', wx + 20, wy + sp*7);
  const w1 = player.weapons[1];
  if (w1) { ctx.fillStyle = w1.color; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(w1.name + ' (ATKx' + (w1.dmgMul||1).toFixed(1) + ' 射程' + w1.range + ')', wx + 30, wy + sp*8); }
  else { ctx.fillStyle = '#666'; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('- なし -', wx + 30, wy + sp*8); }
  ctx.fillStyle = '#ffd700'; ctx.font = "bold " + (24*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('祝福', wx, wy + sp*9 + 10);
  if (activeBlessings.length === 0) { ctx.fillStyle = '#bbb'; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('なし', wx + 20, wy + sp*10 + 10); }
  else { for (let i = 0; i < Math.min(activeBlessings.length, 5); i++) { const b = activeBlessings[i]; ctx.fillStyle = '#fff'; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.icon + ' ' + b.name, wx + 20, wy + sp*10 + 10 + i * sp); ctx.fillStyle = '#aaa'; ctx.font = (16*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.desc, wx + 50, wy + sp*10 + 10 + i * sp + 18*_M); } }
  if (activeBlessings.length > 5) { ctx.fillStyle = '#aaa'; ctx.font = (18*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('...他 ' + (activeBlessings.length - 5) + ' 個', wx + 20, wy + sp*10 + 10 + 5 * sp); }
  ctx.fillStyle = '#ffd700'; ctx.font = "bold " + (24*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('アイテム', lx, ly + sp * 8);
  for (let i = 0; i < 3; i++) {
    const sz = 28 * _M;
    const sx = lx + sz + i * (sz * 2 + 16 * _M), sy = ly + sp * 8 + sz + 10;
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(sx, sy, sz, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText('[' + (i + 1) + ']', sx, sy + sz + 16*_M);
    if (player.consumables && player.consumables[i]) { ctx.fillStyle = '#fff'; ctx.font = (40*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(player.consumables[i].icon, sx, sy + 10*_M); }
    else { ctx.fillStyle = '#555'; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('空', sx, sy + 5*_M); }
    ctx.textAlign = 'left';
  }
}

function drawCollectionTab() {
  var F = "'M PLUS Rounded 1c', sans-serif";
  var _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  // 3 sub-tabs: 0=いきもの, 1=ぶき, 2=せかい
  var subTabs = ['\u3044\u304d\u3082\u306e', '\u3076\u304d', '\u305b\u304b\u3044'];
  for (var si = 0; si < subTabs.length; si++) {
    var stx = 180 + si * 160, sty = 120;
    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#ffd700' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(stx - 56, sty - 16, 112, 32*_M);
    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#000' : '#ccc';
    ctx.font = 'bold ' + (18*_M) + 'px ' + F; ctx.textAlign = 'center';
    ctx.fillText(subTabs[si], stx, sty + 6*_M);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = (14*_M) + 'px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\u2190\u2192: \u30b5\u30d6\u30bf\u30d6\u5207\u66ff', 340, 155);
  ctx.textAlign = 'left';
  if (typeof collectionSubTab !== 'undefined' && collectionSubTab === 1) { drawWeaponCollection(); return; }
  if (typeof collectionSubTab !== 'undefined' && collectionSubTab === 2) { drawWorldLoreTab(); return; }

  ctx.fillStyle = '#ffd700'; ctx.font = 'bold ' + (22*_M) + 'px ' + F;
  ctx.fillText('\u82b1\u306e\u56fd\u306e\u3044\u304d\u3082\u306e\u56f3\u9451', 120, 190);

  var allEnemies = (typeof ENEMY_DEFS === "object" && !Array.isArray(ENEMY_DEFS)) ? Object.values(ENEMY_DEFS) : (Array.isArray(ENEMY_DEFS) ? ENEMY_DEFS : []);
  var maxLoopFound = 0;
  if (typeof collection !== 'undefined') {
    var ckeys = Object.keys(collection);
    for (var ci = 0; ci < ckeys.length; ci++) {
      var lm = ckeys[ci].match(/_L(\d+)$/);
      if (lm && parseInt(lm[1]) > maxLoopFound) maxLoopFound = parseInt(lm[1]);
    }
  }

  var entries = [];
  for (var ei = 0; ei < allEnemies.length; ei++) {
    var eDef = allEnemies[ei];
    for (var lp = 0; lp <= maxLoopFound; lp++) {
      var lk = eDef.name + '_L' + lp;
      var rec = (typeof collection !== 'undefined' && collection[lk]) ? collection[lk] : null;
      entries.push({ def: eDef, loop: lp, rec: rec });
    }
  }

  var totalE = entries.length || 1;
  var ownedE = 0;
  for (var oi = 0; oi < entries.length; oi++) {
    if (entries[oi].rec && entries[oi].rec.defeated > 0) ownedE++;
  }
  var pctE = Math.floor(ownedE / totalE * 100);
  ctx.fillStyle = '#555'; ctx.fillRect(120, 200, 400, 16);
  ctx.fillStyle = '#7ecf6a'; ctx.fillRect(120, 200, 400 * (ownedE / totalE), 16);
  ctx.fillStyle = '#fff'; ctx.font = 'bold ' + (12*_M) + 'px ' + F; ctx.textAlign = 'center';
  ctx.fillText(ownedE + ' / ' + totalE + ' (' + pctE + '%)', 320, 212);
  ctx.textAlign = 'left';

  var cardH = 70 * _M, padY = 4 * _M, startY = 228, startX = 120;
  var maxRows = Math.floor((CH - 80 - startY) / (cardH + padY));
  // Scroll clamp
  if (typeof collectionScroll === 'undefined') collectionScroll = 0;
  collectionScroll = Math.max(0, Math.min(collectionScroll, Math.max(0, entries.length - maxRows)));
  for (var i = 0; i < Math.min(entries.length - collectionScroll, maxRows); i++) {
    var ent = entries[i + collectionScroll];
    var ek = ent.def;
    var lp = ent.loop;
    var ey = startY + i * (cardH + padY);
    var rec = ent.rec;
    var seenC = rec ? rec.seen : 0;
    var defeatedC = rec ? rec.defeated : 0;
    var known = defeatedC > 0;

    ctx.fillStyle = known ? 'rgba(40,35,60,0.85)' : 'rgba(25,25,25,0.7)';
    ctx.beginPath(); ctx.roundRect(startX, ey, CW - 160, cardH, 12); ctx.fill();
    var borderCol = known ? (ek.color || '#888') : '#333';
    if (known && lp > 0 && typeof loopHueShift === 'function') borderCol = loopHueShift(ek.color || '#888', lp);
    ctx.strokeStyle = borderCol;
    ctx.lineWidth = known ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(startX, ey, CW - 160, cardH, 12); ctx.stroke();

    if (lp > 0) {
      ctx.fillStyle = 'rgba(255,215,0,0.2)'; ctx.fillRect(startX + CW - 242 - 48*_M, ey + 2, 46*_M, 18*_M);
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold ' + (11*_M) + 'px ' + F;
      ctx.fillText('Loop ' + lp, startX + CW - 242 - 44*_M, ey + 14*_M);
    }

    var sprX = startX + 6, sprY = ey + 7;
    var sprW = 48 * _M, sprH = 48 * _M;
    var sprId = ek.shape;
    if (known) {
      ctx.save();
      if (lp > 0) ctx.filter = 'hue-rotate(' + (lp * 30) + 'deg)';
      if (typeof hasSprite === 'function' && hasSprite(sprId)) {
        drawSpriteImg(sprId, sprX, sprY, sprW, sprH);
      } else {
        var shiftedColor = (lp > 0 && typeof loopHueShift === 'function') ? loopHueShift(ek.color, lp) : ek.color;
        var fakeE = { x: sprX, y: sprY, w: sprW, h: sprH, shape: ek.shape, hitFlash: 0 };
        if (typeof drawEnemyShape === 'function') drawEnemyShape(fakeE, shiftedColor);
      }
      ctx.filter = 'none';
      ctx.restore();
    } else {
      ctx.save();
      ctx.filter = 'brightness(0)';
      ctx.globalAlpha = 0.3;
      if (typeof hasSprite === 'function' && hasSprite(sprId)) {
        drawSpriteImg(sprId, sprX, sprY, sprW, sprH);
      } else {
        var fakeE2 = { x: sprX, y: sprY, w: sprW, h: sprH, shape: ek.shape, hitFlash: 99 };
        if (typeof drawEnemyShape === 'function') drawEnemyShape(fakeE2, '#222');
      }
      ctx.filter = 'none'; ctx.globalAlpha = 1;
      ctx.restore();
    }

    var txX = startX + 60 * _M;
    var _nameSize = 16 * _M, _statsSize = 12 * _M, _loreSize = 11 * _M;
    var _curY = ey + 4 * _M + _nameSize;  // 上パディング + ベースライン
    if (known) {
      var dispColor = (lp > 0 && typeof loopHueShift === 'function') ? loopHueShift(ek.color, lp) : ek.color;
      ctx.fillStyle = dispColor; ctx.font = 'bold ' + _nameSize + 'px ' + F;
      var displayName = (typeof getVariantName === 'function' && getVariantName(ek.shape, lp)) ? getVariantName(ek.shape, lp) : (ek.name + (lp > 0 ? ' [Loop ' + lp + ']' : ''));
      ctx.fillText(displayName, txX, _curY);
      _curY += Math.ceil(_nameSize * 1.4);
      ctx.fillStyle = '#ccc'; ctx.font = _statsSize + 'px ' + F;
      ctx.fillText('\u906d\u904e: ' + seenC + '  \u6483\u7834: ' + defeatedC, txX, _curY);
      if (ek.lore) {
        var _loreY = _curY + Math.ceil(_statsSize * 1.4);
        if (_loreY + _loreSize <= _loreBottom) {
          ctx.fillStyle = '#aaa'; ctx.font = _loreSize + 'px ' + F;
          var _loreMaxW = (CW - 160) - (txX - startX) - 20;
          var ls = ek.lore;
          while (ls.length > 0 && ctx.measureText(ls).width > _loreMaxW) ls = ls.slice(0, -1);
          if (ls.length < ek.lore.length) ls += '\u2026';
          ctx.fillText(ls, txX, Math.min(_loreY, _loreBottom - _loreSize));
        }
      }
    } else {
      ctx.fillStyle = '#555'; ctx.font = 'bold ' + _nameSize + 'px ' + F;
      var unknownName = (lp > 0) ? '??? [Loop ' + lp + ']' : '???';
      ctx.fillText(unknownName, txX, _curY);
      _curY += Math.ceil(_nameSize * 1.4);
      ctx.fillStyle = '#444'; ctx.font = _statsSize + 'px ' + F;
      ctx.fillText(seenC > 0 ? '\u906d\u904e\u3042\u308a\u3002\u305f\u304a\u3059\u3068\u89e3\u653e\uff01' : '\u307e\u3060\u767a\u898b\u3055\u308c\u3066\u3044\u306a\u3044\u2026', txX, _curY);
    }
  }

  // --- Scroll bar & hint ---
  if (entries.length > maxRows) {
    var sbX = CW - 130, sbY = startY, sbH = maxRows * (cardH + padY);
    var thumbH = Math.max(20, sbH * (maxRows / entries.length));
    var thumbY = sbY + (sbH - thumbH) * (collectionScroll / Math.max(1, entries.length - maxRows));
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sbX, sbY, 8, sbH);
    ctx.fillStyle = 'rgba(255,215,0,0.5)'; ctx.fillRect(sbX, thumbY, 8, thumbH);
    // スクロール件数表示（ヒントはヘルプモーダルへ移動）
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '12px ' + F; ctx.textAlign = 'right';
    ctx.fillText((collectionScroll + 1) + '-' + Math.min(collectionScroll + maxRows, entries.length) + ' / ' + entries.length, CW - 140, CH - 55);
    ctx.textAlign = 'left';
  }

  // 図鑑コンプリートバッジ
  if (typeof isEncyclopediaComplete === 'function' && isEncyclopediaComplete()) {
    ctx.fillStyle = 'rgba(255,215,0,0.15)';
    ctx.fillRect(CW - 230, 185, 210, 30);
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px ' + F; ctx.textAlign = 'center';
    ctx.fillText('🌟 図鑑コンプリート！', CW - 125, 205);
    ctx.textAlign = 'left';
  }
}

// ===== 世界ロアタブ (H-C) =====
// let worldLoreScroll は update.js から参照するため宣言はここに
var worldLoreScroll = 0;

function drawWorldLoreTab() {
  var F = "'M PLUS Rounded 1c', sans-serif";
  var tc = typeof totalClears !== 'undefined' ? totalClears : 0;
  var lores = (typeof WORLD_LORE !== 'undefined') ? WORLD_LORE : [];

  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 22px ' + F;
  ctx.fillText('🌍 せかいのきろく', 120, 190);

  // アンロック済みエントリ
  var unlocked = lores.filter(function(e) { return e.minClears <= tc; });
  var locked = lores.filter(function(e) { return e.minClears > tc; });

  // 進捗バー
  ctx.fillStyle = '#333'; ctx.fillRect(120, 200, 400, 14);
  ctx.fillStyle = '#a78bfa'; ctx.fillRect(120, 200, 400 * (unlocked.length / Math.max(1, lores.length)), 14);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px ' + F; ctx.textAlign = 'center';
  ctx.fillText(unlocked.length + ' / ' + lores.length, 320, 211);
  ctx.textAlign = 'left';

  var cardH2 = 90, padY2 = 6, startY2 = 225, startX2 = 120;
  var cardW2 = CW - 250;
  var maxRows2 = Math.floor((CH - 80 - startY2) / (cardH2 + padY2));
  var allEntries = unlocked.concat(locked.map(function(e) { return { id: e.id, title: '???', icon: '🔒', minClears: e.minClears, text: 'クリア回数 ' + e.minClears + ' 回でアンロック', _locked: true }; }));

  worldLoreScroll = Math.max(0, Math.min(worldLoreScroll, Math.max(0, allEntries.length - maxRows2)));

  for (var wi = 0; wi < Math.min(allEntries.length - worldLoreScroll, maxRows2); wi++) {
    var we = allEntries[wi + worldLoreScroll];
    var wy = startY2 + wi * (cardH2 + padY2);
    var isLocked = we._locked;

    ctx.fillStyle = isLocked ? 'rgba(20,20,30,0.7)' : 'rgba(30,20,55,0.88)';
    ctx.beginPath(); ctx.roundRect(startX2, wy, cardW2, cardH2, 12); ctx.fill();
    ctx.strokeStyle = isLocked ? '#333' : '#a78bfa'; ctx.lineWidth = isLocked ? 1 : 2;
    ctx.beginPath(); ctx.roundRect(startX2, wy, cardW2, cardH2, 12); ctx.stroke();

    // アイコン
    ctx.fillStyle = isLocked ? '#444' : '#fff'; ctx.font = '32px ' + F;
    ctx.textAlign = 'center'; ctx.fillText(we.icon, startX2 + 36, wy + 38); ctx.textAlign = 'left';

    // タイトル
    ctx.fillStyle = isLocked ? '#555' : '#d4b4ff'; ctx.font = 'bold 16px ' + F;
    ctx.fillText(we.title, startX2 + 68, wy + 24);

    // 本文（折り返しなし・1行表示）
    if (!isLocked) {
      ctx.fillStyle = '#ccc'; ctx.font = '12px ' + F;
      var txt = we.text || '';
      var maxLen = cardW2 - 80;
      // 幅オーバー分は省略
      while (txt.length > 0 && ctx.measureText(txt).width > maxLen) { txt = txt.slice(0, -1); }
      if (txt.length < (we.text || '').length) txt += '…';
      ctx.fillText(txt, startX2 + 68, wy + 46);
      // 2行目（残り）
      var rest = (we.text || '').slice(txt.replace(/…$/, '').length);
      if (rest && !txt.endsWith('…')) {
        var rest2 = rest;
        while (rest2.length > 0 && ctx.measureText(rest2).width > maxLen) rest2 = rest2.slice(0, -1);
        if (rest2.length < rest.length) rest2 += '…';
        ctx.fillText(rest2, startX2 + 68, wy + 62);
      }
    } else {
      ctx.fillStyle = '#555'; ctx.font = '12px ' + F;
      ctx.fillText(we.text, startX2 + 68, wy + 46);
    }
  }

  // スクロールバー
  if (allEntries.length > maxRows2) {
    var sbX2 = CW - 130, sbY2 = startY2, sbH2 = maxRows2 * (cardH2 + padY2);
    var thumbH2 = Math.max(20, sbH2 * (maxRows2 / allEntries.length));
    var thumbY2 = sbY2 + (sbH2 - thumbH2) * (worldLoreScroll / Math.max(1, allEntries.length - maxRows2));
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sbX2, sbY2, 8, sbH2);
    ctx.fillStyle = 'rgba(167,139,250,0.5)'; ctx.fillRect(sbX2, thumbY2, 8, thumbH2);
    ctx.textAlign = 'left';
  }
}







function drawFloatMessages() {
  if (msgQueue.length === 0) return;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < msgQueue.length; i++) {
    const m = msgQueue[i];
    const alpha = Math.min(1, m.timer * 2.5);
    const slideY = 80 + i * 40;
    ctx.globalAlpha = alpha * 0.85;
    ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    const tw = ctx.measureText(m.text).width + 40;
    const rx = CW / 2 - tw / 2, ry = slideY - 16, rh = 34;
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(rx + 8, ry); ctx.lineTo(rx + tw - 8, ry);
    ctx.quadraticCurveTo(rx + tw, ry, rx + tw, ry + 8);
    ctx.lineTo(rx + tw, ry + rh - 8);
    ctx.quadraticCurveTo(rx + tw, ry + rh, rx + tw - 8, ry + rh);
    ctx.lineTo(rx + 8, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - 8);
    ctx.lineTo(rx, ry + 8);
    ctx.quadraticCurveTo(rx, ry, rx + 8, ry);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = m.color; ctx.lineWidth = 2; ctx.stroke();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = m.color; ctx.fillText(m.text, CW / 2, slideY);
  }
  ctx.restore();
}

function drawDialogWindow() {
  if (!dialogMsg) return;
  ctx.save();
  const dw = CW - 160, dh = 150;
  const dx = 80, dy = CH - dh - 40;
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = '#0d0d2b'; ctx.fillRect(dx, dy, dw, dh);
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3; ctx.strokeRect(dx, dy, dw, dh);
  ctx.strokeStyle = 'rgba(255,215,0,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(dx + 6, dy + 6, dw - 12, dh - 12);
  ctx.globalAlpha = 1;
  if (dialogMsg.speaker) {
    const nw = ctx.measureText(dialogMsg.speaker).width + 30;
    ctx.fillStyle = '#1a1a3e'; ctx.fillRect(dx + 20, dy - 16, nw, 28);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(dx + 20, dy - 16, nw, 28);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
    ctx.fillText(dialogMsg.speaker, dx + 35, dy + 3);
  }
  ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
  const line = dialogMsg.lines[dialogMsg.lineIdx];
  const shown = line.substring(0, dialogMsg.charIdx);
  // CJK折り返し（文字単位）
  const _tmw = dw - 48;
  let _wl = '', _wr = 0;
  for (const _ch of shown) {
    const _t = _wl + _ch;
    if (ctx.measureText(_t).width > _tmw) { ctx.fillText(_wl, dx + 24, dy + 48 + _wr * 28); _wl = _ch; _wr++; }
    else { _wl = _t; }
  }
  if (_wl) ctx.fillText(_wl, dx + 24, dy + 48 + _wr * 28);
  if (dialogMsg.charIdx >= line.length) {
    ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'right';
    const pageText = dialogMsg.lineIdx < dialogMsg.lines.length - 1 ? 'Z: つぎへ ▼' : 'Z: とじる ▼';
    ctx.fillText(pageText, dx + dw - 20, dy + dh - 15);
  }
  if (dialogMsg.lines.length > 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
    ctx.fillText((dialogMsg.lineIdx + 1) + '/' + dialogMsg.lines.length, dx + 24, dy + dh - 15);
  }
  ctx.restore();
}

function drawHUD() {
  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  const hs = 22 * _M, hSpacing = hs + 6, hPerRow = _M === 2 ? 10 : 15;
  for (let i = 0; i < player.maxHp; i++) { const col = i % hPerRow, row = Math.floor(i / hPerRow); const hBounce = (hpBounceTimer > 0 && i < player.hp) ? Math.sin((hpBounceTimer * 20) + i * 0.5) * 4 : 0; ctx.fillStyle = i < player.hp ? COL.hpLost : '#444'; ctx.font = hs + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(i < player.hp ? '\u2665' : '\u2661', 12 + col * hSpacing, 12 + hs + row * (hs + 8) + hBounce); }
  // On mobile, skip score/pollen (overlaps with touch item buttons area) and show compact at center-right
  if (_M === 1) {
    ctx.fillStyle = COL.text; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'right'; ctx.fillText('スコア: ' + score, CW - 190, 32); ctx.textAlign = 'left';
    ctx.fillStyle = COL.pollen; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('\uD83C\uDF3C ' + pollen, CW - 190, 56);
  }
  ctx.textAlign = 'center';
  if (!isBossFloor() || !boss) {
    ctx.fillStyle = COL.bless; ctx.font = "bold " + (28*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('フロア ' + floor + '  W' + (Math.min(wave + 1, WAVES.length)) + '/' + WAVES.length, CW / 2, 40*_M);
  } else {
    ctx.fillStyle = '#e74c3c'; ctx.font = "bold " + (28*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('フロア ' + floor + '  ボス', CW / 2, 40*_M);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = player.weapon.color; ctx.font = (18*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('\u2694 ' + player.weapon.name, 12, CH - 52);
  ctx.fillStyle = COL.text; ctx.font = "bold " + (22*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('ATK:' + Math.ceil(player.atk * player.weapon.dmgMul), 12, CH - 30);
  if (activeBlessings.length > 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = (20*_M) + "px 'M PLUS Rounded 1c', sans-serif";
    for (let i = 0; i < activeBlessings.length; i++) ctx.fillText(activeBlessings[i].icon, CW - 20 - (activeBlessings.length - i) * 22, 115); }
  // Item box: only draw on PC (mobile uses touch buttons in top-right)
  if (_M === 1) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(CW - 185, 50, 170, 55);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('アイテム', CW - 178, 62);
    for (let i = 0; i < 3; i++) {
      const sx = CW - 160 + i * 52, sy = 80;
      ctx.fillStyle = player.consumables[i] ? 'rgba(50,40,80,0.9)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(sx - 20, sy - 16, 40, 32);
      ctx.strokeStyle = player.consumables[i] ? '#ffd700' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
      ctx.strokeRect(sx - 20, sy - 16, 40, 32);
      if (player.consumables && player.consumables[i]) {
        ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
        ctx.fillText(player.consumables[i].icon, sx, sy + 6); ctx.textAlign = 'left';
      }
      ctx.fillStyle = player.consumables[i] ? '#ffd700' : 'rgba(255,255,255,0.3)';
      ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText((i + 1), sx - 16, sy + 20);
    }
  }
    if (player.weapons[1] !== null) {
      const subW = player.weapons[1 - player.weaponIdx];
      if (subW) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(8, CH - 65, 160 * _M, 30 * _M);
        ctx.strokeStyle = subW.color || '#aaa'; ctx.lineWidth = 2; ctx.strokeRect(8, CH - 65, 160 * _M, 30 * _M);
        ctx.fillStyle = '#aaa'; ctx.font = (19*_M) + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('もうひとつ', 14, CH - 52);
        ctx.fillStyle = subW.color || '#fff'; ctx.font = "bold " + (19*_M) + "px 'M PLUS Rounded 1c', sans-serif";
        ctx.fillText((_M === 2 ? '' : 'Q: ') + subW.name, 14, CH - 38);
      }
    }
    if (_M === 1) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, CH - 22, CW, 22);
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
      let helpText = 'WASD/矢印:いどう  Z:こうげき  X:ダッシュ  TAB:もちもの';
      if (player.weapons[1] !== null) helpText += '  Q:ぶきもちかえ';
      if (player.consumables.some(c => c !== null)) helpText += '  1/2/3:アイテムつかう';
      ctx.fillText(helpText, CW / 2, CH - 12); ctx.textAlign = 'left';
    }
}

function drawBlessing() {
  if (gameState !== 'blessing') return;
  // Tween アニメーション更新
  if (typeof TWEEN !== 'undefined') TWEEN.update(performance.now());

  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  const F = "'M PLUS Rounded 1c', sans-serif";
  const carX = typeof blessingCarouselX !== 'undefined' ? blessingCarouselX : selectCursor;

  // ── 背景オーバーレイ ──
  ctx.fillStyle = 'rgba(0,0,0,0.78)';
  ctx.fillRect(0, 0, CW, CH);
  const bg = ctx.createLinearGradient(0, 0, 0, CH * 0.65);
  bg.addColorStop(0, 'rgba(50,15,100,0.45)');
  bg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, CW, CH);

  // ── タイトル ──
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold ' + (30 * _M) + 'px ' + F;
  ctx.textAlign = 'center';
  ctx.fillText('\u273F \u795D\u798F\u3092\u9078\u3079 \u273F', CW / 2, 44 + 18 * _M);

  // ── カルーセルカード ──
  const CARD_W = 250, CARD_H = 310;
  const CARD_GAP = 340;
  const CENTER_Y = CH / 2 - 10;

  for (let i = 0; i < blessingChoices.length; i++) {
    const b = blessingChoices[i];
    const dx = i - carX;
    if (Math.abs(dx) > 1.55) continue;

    const distClamped = Math.min(Math.abs(dx), 1);
    const scale = 1.0 - distClamped * 0.32;
    const alpha = 1.0 - distClamped * 0.52;
    const isCenter = i === selectCursor;

    // 入場アニメーション
    const delay = i * 0.12;
    const prog = Math.min(1, Math.max(0, ((typeof blessingAnimTimer !== 'undefined' ? blessingAnimTimer : 1) - delay) * 2.8));
    const eased = 1 - Math.pow(1 - prog, 3);

    const rCol = b.rarity === 'epic' ? '#ffd700' : b.rarity === 'rare' ? '#4da6ff' : '#aaa';
    const bx = -CARD_W / 2, by = -CARD_H / 2;

    ctx.save();
    ctx.globalAlpha = alpha * eased;
    ctx.translate(CW / 2 + dx * CARD_GAP, CENTER_Y + (1 - eased) * 55);
    ctx.scale(scale * (0.7 + eased * 0.3), scale * (0.7 + eased * 0.3));

    // カード背景
    ctx.fillStyle = isCenter ? 'rgba(65,35,125,0.97)' : 'rgba(28,18,50,0.90)';
    ctx.beginPath(); ctx.roundRect(bx, by, CARD_W, CARD_H, 14); ctx.fill();

    // ボーダー & グロー
    if (isCenter) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 22; }
    ctx.strokeStyle = isCenter ? '#ffd700' : rCol;
    ctx.lineWidth = isCenter ? 3 : 1.5;
    ctx.beginPath(); ctx.roundRect(bx, by, CARD_W, CARD_H, 14); ctx.stroke();
    ctx.shadowBlur = 0;

    // アイコン
    ctx.font = '54px ' + F; ctx.fillStyle = '#fff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillText(b.icon || '\u2756', 0, by + 18);

    // レアリティ
    ctx.font = '12px ' + F; ctx.fillStyle = rCol;
    ctx.fillText((b.rarity || 'COMMON').toUpperCase(), 0, by + 80);

    // 名前
    ctx.font = 'bold 20px ' + F; ctx.fillStyle = '#ffe4a0';
    ctx.fillText(b.name || '', 0, by + 100);

    // 説明（中央カードのみ）
    if (isCenter) {
      ctx.font = '14px ' + F; ctx.fillStyle = 'rgba(255,255,255,0.75)';
      const maxLW = CARD_W - 30;
      let dl = '', dY = by + 130;
      for (const ch of (b.desc || '')) {
        dl += ch;
        if (ctx.measureText(dl).width > maxLW) {
          if (dY + 18 > by + CARD_H - 48) { ctx.fillText(dl.slice(0, -1) + '\u2026', 0, dY); dl = ''; break; }
          ctx.fillText(dl, 0, dY); dY += 18; dl = '';
        }
      }
      if (dl) ctx.fillText(dl, 0, dY);
    }

    // 決定プロンプト（中央カードのみ）
    if (isCenter) {
      ctx.font = 'bold 14px ' + F; ctx.fillStyle = 'rgba(255,215,0,0.9)';
      ctx.textBaseline = 'bottom';
      ctx.fillText(touchActive ? '\u25B6 \u30BF\u30C3\u30D7\u3067\u8A73\u7D30' : '\u25B6 Z \u30AD\u30FC\u3067\u8A73\u7D30', 0, by + CARD_H - 8);
    }
    ctx.restore();
  }

  // 左右矢印ヒント
  if (blessingChoices.length > 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 38px ' + F; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (selectCursor > 0)
      ctx.fillText('\u2039', CW / 2 - CARD_GAP + CARD_W / 2 - 24, CENTER_Y);
    if (selectCursor < blessingChoices.length - 1)
      ctx.fillText('\u203A', CW / 2 + CARD_GAP - CARD_W / 2 + 24, CENTER_Y);
  }

  // ── 下部インフォバー ──
  const selB = blessingChoices[selectCursor] || blessingChoices[0];
  if (selB) {
    ctx.fillStyle = 'rgba(0,0,0,0.68)';
    ctx.fillRect(0, CH - 72, CW, 72);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold ' + (20 * _M) + 'px ' + F;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(selB.icon + '  ' + selB.name, CW / 2, CH - 50);
    ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.font = (15 * _M) + 'px ' + F;
    UIManager.drawSmartText(ctx, selB.desc || '', CW / 2 - (CW - 80) / 2, CH - 22, CW - 80, (15 * _M) + 'px ' + F);
  }

  // リロールヒント
  ctx.fillStyle = pollen >= 15 ? '#f1c40f' : '#555';
  ctx.font = '14px ' + F; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText('X: \u30EA\u30ED\u30FC\u30EB (\u82B1\u7C89-15)  \u73FE\u5728:' + pollen, 20, CH - 6);

  // ── ヘルプアイコン ──
  UIManager.drawHelpIcon(ctx, CW - 46, 46, 32, 'blessing');
  if (UIManager.isHelpOpen('blessing')) {
    UIManager.showModal(ctx, '\u795D\u798F\u9078\u629E \u2014 \u64CD\u4F5C\u30AC\u30A4\u30C9', [
      '\u2190 \u2192 (A/D): \u30AB\u30FC\u30C9\u3092\u5207\u308A\u66FF\u3048',
      'Z / Enter: \u8A73\u7D30\u3092\u898B\u308B\uFF08\u3082\u3046\u4E00\u5EA6\u3067\u6C7A\u5B9A\uFF09',
      'ESC: \u8A73\u7D30\u3092\u9589\u3058\u308B',
      'X: \u30EA\u30ED\u30FC\u30EB\uFF08\u82B1\u7C89-15\uFF09',
      '1 / 2 / 3: \u76F4\u63A5\u9078\u629E',
    ]);
  }

  // ── 詳細ポップアップ ──
  if (typeof blessingDetailOpen !== 'undefined' && blessingDetailOpen) {
    _drawBlessingDetail(ctx, blessingChoices[selectCursor], F);
  }

  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
}

// 祝福詳細ポップアップ（カードをズームして浮き出る演出）
function _drawBlessingDetail(ctx, b, F) {
  if (!b) return;
  const t = Math.min(1, typeof blessingDetailAnimT !== 'undefined' ? blessingDetailAnimT : 1);
  const ease = 1 - Math.pow(1 - t, 3);

  const PW = 520, PH = 380;
  const px = (CW - PW) / 2, py = (CH - PH) / 2;
  const rCol = b.rarity === 'epic' ? '#ffd700' : b.rarity === 'rare' ? '#4da6ff' : '#aaa';

  ctx.save();
  // 背景暗転
  ctx.fillStyle = 'rgba(0,0,0,' + (0.55 * ease) + ')';
  ctx.fillRect(0, 0, CW, CH);

  // ズームイン
  ctx.translate(CW / 2, CH / 2);
  ctx.scale(0.55 + ease * 0.45, 0.55 + ease * 0.45);
  ctx.translate(-CW / 2, -CH / 2);
  ctx.globalAlpha = ease;

  // ポップアップ背景
  ctx.fillStyle = 'rgba(22,12,50,0.98)';
  ctx.beginPath(); ctx.roundRect(px, py, PW, PH, 20); ctx.fill();
  ctx.shadowColor = rCol; ctx.shadowBlur = 36;
  ctx.strokeStyle = rCol; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(px, py, PW, PH, 20); ctx.stroke();
  ctx.shadowBlur = 0;

  // アイコン
  ctx.font = '68px ' + F; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.fillStyle = '#fff';
  ctx.fillText(b.icon || '\u2756', CW / 2, py + 22);

  // レアリティ
  ctx.font = 'bold 13px ' + F; ctx.fillStyle = rCol;
  ctx.fillText((b.rarity || 'COMMON').toUpperCase(), CW / 2, py + 100);

  // 名前
  ctx.font = 'bold 30px ' + F; ctx.fillStyle = '#ffe4a0';
  ctx.fillText(b.name || '', CW / 2, py + 122);

  // 区切り線
  ctx.strokeStyle = 'rgba(255,215,0,0.25)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 40, py + 163); ctx.lineTo(px + PW - 40, py + 163); ctx.stroke();

  // フレーバーテキスト（大きめフォント・読みやすく）
  ctx.font = '17px ' + F; ctx.fillStyle = '#e0d8ff';
  ctx.textBaseline = 'top';
  const maxLW = PW - 56;
  let dl = '', dY = py + 174;
  for (const ch of (b.desc || '')) {
    dl += ch;
    if (ctx.measureText(dl).width > maxLW) {
      ctx.fillText(dl, CW / 2, dY); dY += 24; dl = '';
    }
  }
  if (dl) ctx.fillText(dl, CW / 2, dY);

  // ボタンヒント
  ctx.font = 'bold 17px ' + F; ctx.textBaseline = 'bottom';
  ctx.fillStyle = '#ffd700';
  ctx.fillText('Z / Enter : \u3053\u308C\u306B\u3059\u308B', CW / 2 - 90, py + PH - 12);
  ctx.fillStyle = 'rgba(200,200,200,0.6)';
  ctx.fillText('ESC : \u623B\u308B', CW / 2 + 90, py + PH - 12);

  ctx.restore();
}

// drawShop moved to shop_ui.js

function drawDmgNumbers() {
  for (const d of dmgNumbers) { ctx.globalAlpha = clamp(d.life / 0.3, 0, 1); ctx.fillStyle = d.color; ctx.font = "bold 40px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText(d.val, d.x, d.y); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
}




function drawWeaponCollection() {
  var F = "'M PLUS Rounded 1c', sans-serif";
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 22px " + F;
  ctx.fillText('\u2694 \u3076\u304D\u305A\u304B\u3093', 120, 190);

  // Completion bar
  var total = typeof WEAPON_DEFS !== 'undefined' ? WEAPON_DEFS.length : 12;
  var owned = typeof weaponCollection !== 'undefined' ? weaponCollection.size : 0;
  var pct = Math.floor(owned / total * 100);
  ctx.fillStyle = '#555'; ctx.fillRect(120, 200, 400, 16);
  ctx.fillStyle = '#ffd700'; ctx.fillRect(120, 200, 400 * (owned / total), 16);
  ctx.fillStyle = '#fff'; ctx.font = "bold 12px " + F; ctx.textAlign = 'center';
  ctx.fillText(owned + ' / ' + total + ' (' + pct + '%)', 320, 212);
  ctx.textAlign = 'left';

  // Weapon cards
  var cardW = 200, cardH = 80, cols = 5, padX = 12, padY = 8;
  var startX = 120, startY = 230;
  for (var i = 0; i < WEAPON_DEFS.length; i++) {
    var w = WEAPON_DEFS[i];
    var col = i % cols, row = Math.floor(i / cols);
    var wx = startX + col * (cardW + padX);
    var wy = startY + row * (cardH + padY);
    if (wy > CH - 100) break;
    var has = typeof weaponCollection !== 'undefined' && weaponCollection.has(w.id);
    var isTier2 = w.tier === 2;

    // Card bg
    ctx.fillStyle = has ? 'rgba(40,30,60,0.9)' : 'rgba(30,30,30,0.7)';
    ctx.beginPath(); ctx.roundRect(wx, wy, cardW, cardH, 8); ctx.fill();
    // Border (copper=tier1, gold=tier2)
    ctx.strokeStyle = has ? (isTier2 ? '#ffd700' : '#cd7f32') : '#333';
    ctx.lineWidth = has ? 2 : 1;
    ctx.beginPath(); ctx.roundRect(wx, wy, cardW, cardH, 8); ctx.stroke();

    if (has) {
      // Icon
      var sprId = 'weapon_' + w.id;
      if (typeof hasSprite === 'function' && hasSprite(sprId)) {
        ctx.save();
        var _wrf = (typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity || 'normal') : 'none';
        if (_wrf !== 'none') ctx.filter = _wrf;
        ctx.save();
        var _wrf = (typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity || 'normal') : 'none';
        if (_wrf !== 'none') ctx.filter = _wrf;
        drawSpriteImg(sprId, wx + 4, wy + 8, 48, 48);
        ctx.restore();
        ctx.restore();
      } else {
        ctx.fillStyle = '#fff'; ctx.font = '28px ' + F; ctx.textAlign = 'center';
        var em = w.name.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF][\uFE0F\u20E3]?|^./);
        ctx.fillText(em ? em[0] : '\u2694', wx + 28, wy + 42);
        ctx.textAlign = 'left';
      }
      // Name
      ctx.fillStyle = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : (w.color || '#fff'); ctx.font = 'bold 13px ' + F;
      var shortName = w.name.length > 10 ? w.name.slice(0, 10) + '..' : w.name;
      ctx.fillText(shortName, wx + 56, wy + 25);
      // Stats
      ctx.fillStyle = '#ccc'; ctx.font = '11px ' + F;
      ctx.fillText('ATK ' + w.dmgMul.toFixed(1) + '  SPD ' + w.speed.toFixed(2), wx + 56, wy + 42);
      // Tier badge
      if (isTier2) {
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 10px ' + F;
        ctx.fillText('T2', wx + cardW - 20, wy + 14);
      }
      if (w.rarity && w.rarity !== 'normal' && typeof getRarityDef === 'function') {
        var _rd = getRarityDef(w.rarity);
        ctx.fillStyle = _rd.color; ctx.font = 'bold 10px ' + F;
        ctx.fillText(_rd.name, wx + cardW - 22, wy + cardH - 6);
      }
      // Desc
      ctx.fillStyle = '#999'; ctx.font = '10px ' + F;
      var shortDesc = w.desc.length > 18 ? w.desc.slice(0, 18) + '..' : w.desc;
      ctx.fillText(shortDesc, wx + 56, wy + 58);
    } else {
      // Silhouette
      ctx.fillStyle = '#444'; ctx.font = '28px ' + F; ctx.textAlign = 'center';
      ctx.fillText('?', wx + 28, wy + 42);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#555'; ctx.font = 'bold 13px ' + F;
      ctx.fillText('???', wx + 56, wy + 25);
      ctx.fillStyle = '#444'; ctx.font = '11px ' + F;
      ctx.fillText('みつけてない…', wx + 56, wy + 42);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#555'; ctx.font = '13px ' + F;
      ctx.fillText('??? \u307E\u3060\u3067\u3042\u3063\u3066\u3044\u306A\u3044', wx + 56, wy + 35);
      if (isTier2) {
        ctx.fillStyle = '#665500'; ctx.font = 'bold 10px ' + F;
        ctx.fillText('T2', wx + cardW - 20, wy + 14);
      }
    }
  }
}
