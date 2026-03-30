

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
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, CW, CH); if(typeof drawNotebookBase==='function') drawNotebookBase(ctx, (CW-1000)/2, (CH-700)/2+20, 1000, 700, '🌸 みぷりんの冒険手帳');
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
  if(typeof touchActive==='undefined'||!touchActive){
    // PC key hint bar
    var _kF="'M PLUS Rounded 1c', sans-serif";
    var _kY=128,_kW=176,_kGap=6;
    var _kTabs=[['持ち物',0],['図鑑',1],['装備',2]];
    var _kSX=CW/2-(_kW*3+_kGap*2)/2;
    for(var _ki=0;_ki<_kTabs.length;_ki++){
      var _kAct=inventoryTab===_kTabs[_ki][1];
      var _kX=_kSX+_ki*(_kW+_kGap);
      ctx.fillStyle=_kAct?'rgba(255,215,0,0.18)':'rgba(255,255,255,0.05)';
      ctx.beginPath();ctx.roundRect(_kX,_kY-13,_kW,24,5);ctx.fill();
      ctx.strokeStyle=_kAct?'#ffd700':'rgba(255,255,255,0.12)';
      ctx.lineWidth=_kAct?1.5:1;
      ctx.beginPath();ctx.roundRect(_kX,_kY-13,_kW,24,5);ctx.stroke();
      ctx.fillStyle='rgba(0,0,0,0.55)';ctx.beginPath();
      ctx.roundRect(_kX+6,_kY-9,22,16,3);ctx.fill();
      ctx.strokeStyle=_kAct?'rgba(255,215,0,0.6)':'rgba(255,255,255,0.2)';
      ctx.lineWidth=1;ctx.stroke();
      ctx.fillStyle=_kAct?'#ffd700':'#aaa';ctx.font='bold 11px '+_kF;ctx.textAlign='center';
      ctx.fillText(['I','O','P'][_ki],_kX+17,_kY+2);
      ctx.fillStyle=_kAct?'#fff':'#888';
      ctx.font=(_kAct?'bold ':'')+_M*13+'px '+_kF;
      ctx.fillText(_kTabs[_ki][0],_kX+_kW/2+6,_kY+2);
      ctx.textAlign='left';
      if(_kAct){ctx.fillStyle='#ffd700';ctx.fillRect(_kX+3,_kY+9,_kW-6,2);}
    }
    ctx.fillStyle='rgba(255,255,255,0.28)';ctx.font='12px '+_kF;ctx.textAlign='right';
    ctx.fillText('[ESC] とじる',CW-118,_kY+2);ctx.textAlign='left';
  }
  if (inventoryTab === 0) drawInventoryItems();
  else if (inventoryTab === 1) drawCollectionTab();
  if (inventoryTab === 2) drawEquipTab(80, 130, CW - 160, CH - 180);

  // ヘルプアイコン（タブ共通・最前面）
  var _isTch = (typeof touchActive !== 'undefined' && touchActive);
  var _helpLines;
  if (inventoryTab === 0) {
    _helpLines = _isTch
      ? ['花粉 = ショップで使う通貨', 'HP / ATK / 速度: プレイヤーの状態', '☰ボタン: タブ切替', '◄ボタン: とじる']
      : ['花粉 = ショップで使う通貨', 'HP / ATK / 速度: プレイヤーの状態', 'TAB キー: タブ切替', 'ESC キー: とじる'];
  } else if (inventoryTab === 1) {
    _helpLines = _isTch
      ? ['上下スワイプ: スクロール', '左右のタブをタップ: サブタブ切替', '☰ボタン: タブ切替', '◄ボタン: とじる']
      : ['↑↓ キー: スクロール', '← → キー: サブタブ切替', 'TAB キー: タブ切替', 'ESC キー: とじる'];
  } else {
    _helpLines = _isTch
      ? ['スロットをタップ: 選択', 'リスト項目をタップ: 武器選択', 'Zボタン: 強化 / そうび', 'Xボタン: そうびを切り替え', '◄ボタン: とじる']
      : ['↑↓: スロット選択', '→: リストへ (武器スロット)', 'Z: 強化 / そうび', 'X: そうびを切り替え', 'ESC: とじる'];
  }
  if (typeof touchActive === 'undefined' || !touchActive) {
    var _ihF = "'M PLUS Rounded 1c', sans-serif";
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, CH-26, CW, 26);
    var _ihT = inventoryTab===0 ? '[I]持ち物  [O]図鑑  [P]装備  [ESC]とじる' : inventoryTab===1 ? '[I]持ち物  [O]図鑑  [P]装備  [←→]サブタブ  [↑↓]スクロール  [F]フィルタ  [ESC]とじる' : '[I]持ち物  [O]図鑑  [P]装備  [↑↓]スクロール  [Z]強化/そうび  [ESC]とじる';
    ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='13px '+_ihF; ctx.textAlign='center';
    ctx.fillText(_ihT, CW/2, CH-8); ctx.textAlign='left';
  }
  UIManager.drawHelpIcon(ctx, CW - 160, 55 + 10*_M, 34, 'inventory');
  if (UIManager.isHelpOpen('inventory')) {
    var _tabName = ['持ち物', '図鑑', '装備'][inventoryTab] || '';
    UIManager.showModal(ctx, _tabName + ' — 操作ガイド', _helpLines);
  }
}
function getInventorySafeLayout() {
  const isTouch = (typeof touchActive !== 'undefined' && touchActive);
  const _M = isTouch ? 2 : 1;

  const outer = {
    x: 80,
    y: 100 + 40 * _M,
    w: CW - 160,
    h: CH - (100 + 40 * _M) - 70
  };

  // スマホでは上部TAB/ヘルプと下部タッチUIの干渉を避けて本文領域を少し絞る
  if (isTouch) {
    outer.x = 120;
    outer.y = 180;
    outer.w = CW - 240;
    outer.h = CH - 360;
  }

  return { isTouch, _M, outer };
}

function invInsetRect(r, pad) {
  return { x: r.x + pad, y: r.y + pad, w: r.w - pad * 2, h: r.h - pad * 2 };
}

function invSplitColumns(r, leftRatio, gap) {
  const leftW = Math.floor((r.w - gap) * leftRatio);
  const rightW = r.w - gap - leftW;
  return {
    left: { x: r.x, y: r.y, w: leftW, h: r.h },
    right: { x: r.x + leftW + gap, y: r.y, w: rightW, h: r.h }
  };
}

function invStackRows(r, heights, gap) {
  const out = [];
  let cy = r.y;
  for (let i = 0; i < heights.length; i++) {
    out.push({ x: r.x, y: cy, w: r.w, h: heights[i] });
    cy += heights[i] + gap;
  }
  return out;
}

function invDrawPanel(r, title, opts) {
  opts = opts || {};
  const bg = opts.bg || 'rgba(253,246,227,0.92)';
  const stroke = opts.stroke || '#5d4037';
  const titleColor = opts.titleColor || '#3e2723';
  const radius = opts.radius || 12;
  const titleSize = opts.titleSize || 18;

  ctx.save();
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
  ctx.fill();

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
  ctx.stroke();

  if (title) {
    ctx.fillStyle = titleColor;
    ctx.font = `bold ${titleSize}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(title, r.x + 14, r.y + 24);
  }
  ctx.restore();
}

function invFitText(text, maxWidth, baseSize, minSize, weight) {
  let size = baseSize;
  ctx.font = `${weight ? 'bold ' : ''}${size}px 'M PLUS Rounded 1c', sans-serif`;
  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 1;
    ctx.font = `${weight ? 'bold ' : ''}${size}px 'M PLUS Rounded 1c', sans-serif`;
  }
  return size;
}

function invEllipsis(text, maxWidth, font) {
  ctx.save();
  ctx.font = font;
  if (ctx.measureText(text).width <= maxWidth) {
    ctx.restore();
    return text;
  }
  let out = text;
  while (out.length > 0 && ctx.measureText(out + '…').width > maxWidth) {
    out = out.slice(0, -1);
  }
  ctx.restore();
  return out + '…';
}

function drawInventoryStatusBlock(r, _M) {
  invDrawPanel(r, 'いまのようす', { titleSize: 18 * _M });

  const inner = invInsetRect(r, 14);
  const stats = [
    ['HP', player.hp + ' / ' + player.maxHp],
    ['ATK', Math.ceil(player.atk * (player.weapon.dmgMul || 1)).toString()],
    ['速度', String(player.speed)],
    ['花粉', String(pollen)],
    ['Floor', String(floor)],
    ['Score', String(score)],
  ];

  const cols = 2;
  const rows = 3;
  const gapX = 10 * _M;
  const gapY = 10 * _M;
  const topY = inner.y + 22 * _M;
  const cellW = Math.floor((inner.w - gapX) / cols);
  const cellH = Math.floor((inner.h - 34 * _M - gapY * (rows - 1)) / rows);

  for (let i = 0; i < stats.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = inner.x + col * (cellW + gapX);
    const cy = topY + row * (cellH + gapY);

    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.roundRect(cx, cy, cellW, cellH, 10);
    ctx.fill();

    ctx.fillStyle = '#6d4c41';
    ctx.font = `bold ${Math.max(16, 14 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText(stats[i][0], cx + 10, cy + 20);

    ctx.fillStyle = '#3e2723';
    const valueSize = invFitText(stats[i][1], cellW - 20, 20 * _M, 14 * _M, true);
    ctx.font = `bold ${valueSize}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText(stats[i][1], cx + 10, cy + cellH - 10);
  }
}

function drawInventoryEquipSummaryBlock(r, _M) {
  invDrawPanel(r, 'そうび概要', { titleSize: 18 * _M });

  const inner = invInsetRect(r, 14);
  const lineGap = 30 * _M;
  const startY = inner.y + 42 * _M;
  const labelW = 90 * _M;
  const valueW = inner.w - labelW - 10;

  const rows = [
    ['メイン', player.weapons[0] ? player.weapons[0].name : '- なし -', player.weapons[0]?.color || '#666'],
    ['サブ', player.weapons[1] ? player.weapons[1].name : '- なし -', player.weapons[1]?.color || '#666'],
    ['チャーム', player.charm ? (player.charm.icon + ' ' + player.charm.name) : '- なし -', player.charm ? '#8e24aa' : '#666']
  ];

  for (let i = 0; i < rows.length; i++) {
    const y = startY + i * lineGap;
    ctx.fillStyle = '#6d4c41';
    ctx.font = `bold ${Math.max(15, 14 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText(rows[i][0], inner.x, y);

    ctx.fillStyle = rows[i][2];
    const font = `${Math.max(15, 14 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    const txt = invEllipsis(rows[i][1], valueW, font);
    ctx.font = font;
    ctx.fillText(txt, inner.x + labelW, y);
  }

  const w = player.weapon;
  if (w) {
    const summary = `ATK x${(w.dmgMul || 1).toFixed(1)} / 射程 ${(w.range || 0) + (player.atkRangeBonus || 0)} / SPD ${w.speed.toFixed(2)}`;
    ctx.fillStyle = '#8d6e63';
    ctx.font = `${Math.max(14, 12 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    const txt = invEllipsis(summary, inner.w, ctx.font);
    ctx.fillText(txt, inner.x, r.y + r.h - 14);
  }
}

function drawInventoryItemsBlock(r, _M) {
  invDrawPanel(r, 'アイテム', { titleSize: 18 * _M });

  const inner = invInsetRect(r, 12);
  const count = 3;
  const gap = 14 * _M;
  const slotSize = Math.min(64 * _M, Math.floor((inner.w - gap * (count - 1)) / count));
  const totalW = slotSize * count + gap * (count - 1);
  const startX = inner.x + Math.floor((inner.w - totalW) / 2);
  const cy = inner.y + 24 * _M + slotSize / 2;

  for (let i = 0; i < count; i++) {
    const sx = startX + i * (slotSize + gap);
    const icon = player.consumables && player.consumables[i] ? player.consumables[i].icon : '－';

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.roundRect(sx, cy - slotSize / 2, slotSize, slotSize, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(93,64,55,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sx, cy - slotSize / 2, slotSize, slotSize, 12);
    ctx.stroke();

    ctx.fillStyle = '#3e2723';
    ctx.font = `${Math.max(24, 20 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(icon, sx + slotSize / 2, cy + 8 * _M);

    ctx.fillStyle = '#6d4c41';
    ctx.font = `bold ${Math.max(14, 12 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText('[' + (i + 1) + ']', sx + slotSize / 2, cy + slotSize / 2 + 16 * _M);
  }

  ctx.textAlign = 'left';
}

function drawInventoryBlessingSummaryBlock(r, _M) {
  invDrawPanel(r, '祝福要約', { titleSize: 18 * _M });

  const inner = invInsetRect(r, 14);
  if (!activeBlessings || activeBlessings.length === 0) {
    ctx.fillStyle = '#8d6e63';
    ctx.font = `${Math.max(16, 14 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText('なし', inner.x, inner.y + 34);
    return;
  }

  const maxCount = ((typeof touchActive !== 'undefined' && touchActive) ? 4 : 5);
  const list = activeBlessings.slice(0, maxCount);

  let x = inner.x;
  let y = inner.y + 34;
  const lineH = 28 * _M;
  const maxW = inner.x + inner.w;

  for (let i = 0; i < list.length; i++) {
    const b = list[i];
    const label = `${b.icon} ${b.name}`;
    ctx.font = `${Math.max(14, 12 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    const pillW = Math.min(inner.w, ctx.measureText(label).width + 20);

    if (x + pillW > maxW) {
      x = inner.x;
      y += lineH;
    }

    ctx.fillStyle = 'rgba(255,255,255,0.38)';
    ctx.beginPath();
    ctx.roundRect(x, y - 18, pillW, 22 * _M, 999);
    ctx.fill();

    ctx.fillStyle = '#4e342e';
    ctx.fillText(invEllipsis(label, pillW - 14, ctx.font), x + 10, y);
    x += pillW + 8;
  }

  if (activeBlessings.length > maxCount) {
    ctx.fillStyle = '#8d6e63';
    ctx.font = `${Math.max(14, 12 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText(`+${activeBlessings.length - maxCount}`, inner.x, r.y + r.h - 12);
  }
}

function drawInventoryDetailBlock(r, _M) {
  invDrawPanel(r, '詳細', { titleSize: 18 * _M });

  const inner = invInsetRect(r, 14);

  // 最初は固定で「現在メイン武器の説明」を出す
  // 将来的に選択連動へ拡張しやすいように1か所へ集約
  let detail = '';
  if (player.weapon && player.weapon.desc) {
    detail = `⚔ ${player.weapon.name} — ${player.weapon.desc}`;
  } else {
    detail = '選択中の要素の説明をここに表示';
  }

  const maxWidth = inner.w;
  const fontSize = Math.max(14, 12 * _M);
  ctx.fillStyle = '#5d4037';
  ctx.font = `${fontSize}px 'M PLUS Rounded 1c', sans-serif`;

  const words = detail.split('');
  let line = '';
  let y = inner.y + 28;
  const lineH = 20 * _M;
  const maxLines = 2;
  let lines = 0;

  for (let i = 0; i < words.length; i++) {
    const test = line + words[i];
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, inner.x, y);
      line = words[i];
      y += lineH;
      lines += 1;
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }

  if (line) {
    let out = line;
    const rest = words.slice(detail.indexOf(line) + line.length).join('');
    if (rest.length > 0) {
      while (ctx.measureText(out + '…').width > maxWidth && out.length > 0) {
        out = out.slice(0, -1);
      }
      out += '…';
    }
    ctx.fillText(out, inner.x, y);
  }
}

function drawInventoryItems() {
  const { isTouch, _M, outer } = getInventorySafeLayout();

  // 全体の本文ベース
  const gap = 14 * _M;
  const panel = invInsetRect(outer, 4);

  if (!isTouch) {
    // PC: 左右2カラム + 下段詳細
    const detailH = 84;
    const top = { x: panel.x, y: panel.y, w: panel.w, h: panel.h - detailH - gap };
    const detail = { x: panel.x, y: panel.y + panel.h - detailH, w: panel.w, h: detailH };

    const cols = invSplitColumns(top, 0.48, gap);
    const leftRows = invStackRows(cols.left, [190, 120], gap);
    const rightRows = invStackRows(cols.right, [150, top.h - 150 - gap], gap);

    drawInventoryStatusBlock(leftRows[0], _M);
    drawInventoryItemsBlock(leftRows[1], _M);
    drawInventoryEquipSummaryBlock(rightRows[0], _M);
    drawInventoryBlessingSummaryBlock(rightRows[1], _M);
    drawInventoryDetailBlock(detail, _M);
  } else {
    // スマホ: 縦積み固定
    const rows = invStackRows(panel, [120, 100, 90, 74, 74], gap);

    drawInventoryStatusBlock(rows[0], _M);
    drawInventoryEquipSummaryBlock(rows[1], _M);
    drawInventoryItemsBlock(rows[2], _M);
    drawInventoryBlessingSummaryBlock(rows[3], _M);
    drawInventoryDetailBlock(rows[4], _M);
  }
}

function getFilteredItems(subTab, filter) {
  if (subTab === 0) {
    var allEnemies = (typeof ENEMY_DEFS === 'object' && !Array.isArray(ENEMY_DEFS))
      ? Object.values(ENEMY_DEFS) : (Array.isArray(ENEMY_DEFS) ? ENEMY_DEFS : []);
    var maxLoop = 0;
    if (typeof collection !== 'undefined') {
      Object.keys(collection).forEach(function(k) {
        var m = k.match(/_L(\d+)$/);
        if (m && parseInt(m[1]) > maxLoop) maxLoop = parseInt(m[1]);
      });
    }
    var items = [];
    allEnemies.forEach(function(eDef) {
      for (var lp = 0; lp <= maxLoop; lp++) {
        var lk = eDef.name + '_L' + lp;
        var rec = (typeof collection !== 'undefined' && collection[lk]) ? collection[lk] : null;
        items.push({ type: 'enemy', def: eDef, loop: lp, rec: rec });
      }
    });
    if (filter === 'all') return items;
    var themeMap = { forest: ['mushroom','worm','vine'], cave: ['golem','bat','ghost'],
      flower: ['flower','blob','spider'], volcano: ['wasp','beetle','darkbee'] };
    if (filter === 'boss') return items.filter(function(it) { return it.def.isBoss; });
    var shapes = themeMap[filter] || [];
    return items.filter(function(it) { return shapes.indexOf(it.def.shape) >= 0; });
  }
  if (subTab === 1) {
    var items = WEAPON_DEFS.map(function(w) {
      var has = typeof weaponCollection !== 'undefined' && weaponCollection.has(w.id);
      return { type: 'weapon', def: w, known: has };
    });
    if (filter === 'all') return items;
    if (filter === 'tier1') return items.filter(function(it) { return !it.def.tier || it.def.tier === 1; });
    if (filter === 'tier2') return items.filter(function(it) { return it.def.tier === 2; });
    return items;
  }
  return [];
}

function drawCollectionCarousel(ctx, items, cursorKey, subTab) {
  if (!items || items.length === 0) return;
  var F = "'M PLUS Rounded 1c', sans-serif";
  var CX = CW / 2, CY = CH / 2 + 20;
  var CARD_W = 180, CARD_H = 230, GAP = 220;
  var target = collectionCursor[cursorKey];
  collectionAnimX[cursorKey] += (target - collectionAnimX[cursorKey]) * 0.22;
  var animX = collectionAnimX[cursorKey];
  for (var i = 0; i < items.length; i++) {
    var dx = i - animX;
    if (Math.abs(dx) > 2.2) continue;
    var absD = Math.min(Math.abs(dx), 1);
    var scale = Math.abs(dx) < 0.01 ? 1.3 : (Math.abs(dx) < 1 ? 1.3 - absD * 0.5 : 0.8);
    var alpha = Math.abs(dx) < 0.01 ? 1.0 : (Math.abs(dx) < 1 ? 1.0 - absD * 0.5 : 0.5);
    if (Math.abs(dx) > 1.55) { scale = 0.5; alpha = 0.3; }
    var item = items[i];
    var known = item.type === 'enemy' ? (item.rec && item.rec.defeated > 0) : item.known;
    var rarCol = '#888';
    if (item.type === 'weapon' && item.def.tier === 2) rarCol = '#ffd700';
    else if (item.type === 'weapon') rarCol = '#cd7f32';
    else if (item.type === 'enemy' && item.def.color) rarCol = item.def.color;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(CX + dx * GAP, CY);
    ctx.scale(scale, scale);
    var bx = -CARD_W / 2, by = -CARD_H / 2;
    var isCenter = Math.abs(dx) < 0.1;
    ctx.fillStyle = isCenter ? 'rgba(40,25,80,0.97)' : 'rgba(20,15,40,0.85)';
    ctx.beginPath(); ctx.roundRect(bx, by, CARD_W, CARD_H, 12); ctx.fill();
    if (isCenter) { ctx.shadowColor = rarCol; ctx.shadowBlur = 18; }
    ctx.strokeStyle = known ? rarCol : '#333';
    ctx.lineWidth = isCenter ? 2.5 : 1;
    ctx.beginPath(); ctx.roundRect(bx, by, CARD_W, CARD_H, 12); ctx.stroke();
    ctx.shadowBlur = 0;
    var sprY = by + 18, sprSize = 72;
    if (known) {
      if (item.type === 'enemy') {
        ctx.save();
        if (item.loop > 0 && typeof loopHueShift === 'function')
          ctx.filter = 'hue-rotate(' + (item.loop * 30) + 'deg)';
        if (typeof hasSprite === 'function' && hasSprite(item.def.shape)) {
          drawSpriteImg(item.def.shape, -sprSize/2, sprY, sprSize, sprSize);
        } else if (typeof drawEnemyShape === 'function') {
          var col = (item.loop > 0 && typeof loopHueShift === 'function')
            ? loopHueShift(item.def.color, item.loop) : item.def.color;
          drawEnemyShape({ x:-sprSize/2, y:sprY, w:sprSize, h:sprSize, shape:item.def.shape, hitFlash:0 }, col);
        }
        ctx.restore();
      } else {
        var wSprId = 'weapon_' + item.def.id;
        if (typeof hasSprite === 'function' && hasSprite(wSprId)) {
          drawSpriteImg(wSprId, -sprSize/2, sprY, sprSize, sprSize);
        } else {
          ctx.fillStyle = item.def.color || '#fff';
          ctx.font = '48px ' + F; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
          var em = (item.def.name||'').match(/^[\uD800-\uDBFF][\uDC00-\uDFFF]|^./);
          ctx.fillText(em ? em[0] : '\u2694', 0, sprY + 10);
        }
      }
    } else {
      ctx.save(); ctx.filter = 'brightness(0)'; ctx.globalAlpha = 0.3;
      if (item.type === 'enemy' && typeof drawEnemyShape === 'function') {
        drawEnemyShape({ x:-sprSize/2, y:sprY, w:sprSize, h:sprSize, shape:item.def.shape, hitFlash:99 }, '#222');
      } else {
        ctx.fillStyle = '#444'; ctx.font = '48px ' + F;
        ctx.textAlign = 'center'; ctx.textBaseline = 'top';
        ctx.fillText('?', 0, sprY + 10);
      }
      ctx.restore();
      ctx.fillStyle = '#555'; ctx.font = 'bold 28px ' + F;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', 0, sprY + sprSize / 2);
    }
    ctx.textBaseline = 'alphabetic';
    var nameY = by + 110;
    if (known) {
      var dispName = item.type === 'enemy'
        ? ((typeof getVariantName === 'function' && getVariantName(item.def.shape, item.loop)) || item.def.name)
        : item.def.name.replace(/^[\uD800-\uDBFF][\uDC00-\uDFFF][\uFE0F\u20E3]?\s*/, '');
      ctx.fillStyle = rarCol; ctx.font = 'bold 15px ' + F; ctx.textAlign = 'center';
      if (ctx.measureText(dispName).width > CARD_W - 16) ctx.font = 'bold 12px ' + F;
      ctx.fillText(dispName, 0, nameY);
    } else {
      ctx.fillStyle = '#555'; ctx.font = 'bold 14px ' + F;
      ctx.textAlign = 'center'; ctx.fillText('???', 0, nameY);
    }
    var badgeY = by + CARD_H - 18;
    if (item.type === 'weapon' && item.def.tier === 2) {
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px ' + F;
      ctx.textAlign = 'center'; ctx.fillText('Tier 2', 0, badgeY);
    } else if (item.type === 'weapon') {
      ctx.fillStyle = '#cd7f32'; ctx.font = '11px ' + F;
      ctx.textAlign = 'center'; ctx.fillText('Tier 1', 0, badgeY);
    } else if (item.type === 'enemy' && item.loop > 0) {
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px ' + F;
      ctx.textAlign = 'center'; ctx.fillText('Loop ' + item.loop, 0, badgeY);
    }
    if (isCenter && known) {
      ctx.fillStyle = 'rgba(255,215,0,0.7)'; ctx.font = 'bold 11px ' + F; ctx.textAlign = 'center';
      ctx.fillText((typeof touchActive !== 'undefined' && touchActive) ? 'tap:detail' : 'Z:detail', 0, by + CARD_H - 4);
    }
    ctx.restore();
  }
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = 'bold 36px ' + F; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  var cur = collectionCursor[cursorKey];
  if (cur > 0) ctx.fillText('<', CX - GAP + CARD_W / 2 - 20, CY);
  if (cur < items.length - 1) ctx.fillText('>', CX + GAP - CARD_W / 2 + 20, CY);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '13px ' + F; ctx.textAlign = 'center';
  ctx.fillText((cur + 1) + ' / ' + items.length, CX, CY + 145);
  ctx.textAlign = 'left';
}

function drawCollectionDetail(ctx, item) {
  var F = "'M PLUS Rounded 1c', sans-serif";
  var PW = Math.min(520, CW - 60), PH = Math.floor(CH * 0.6);
  var px = (CW - PW) / 2, py = (CH - PH) / 2;
  ctx.fillStyle = 'rgba(0,0,0,0.62)'; ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = 'rgba(18,10,40,0.98)';
  ctx.beginPath(); ctx.roundRect(px, py, PW, PH, 16); ctx.fill();
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(px, py, PW, PH, 16); ctx.stroke();
  if (item.type === 'enemy') {
    var eDef = item.def, lp = item.loop, rec = item.rec;
    var known = rec && rec.defeated > 0;
    var col = (lp > 0 && typeof loopHueShift === 'function') ? loopHueShift(eDef.color, lp) : eDef.color;
    var sprSize = 96, sprX = px + PW/2 - 48, sprY = py + 18;
    ctx.save();
    if (lp > 0) ctx.filter = 'hue-rotate(' + (lp * 30) + 'deg)';
    if (known) {
      if (typeof hasSprite === 'function' && hasSprite(eDef.shape)) {
        drawSpriteImg(eDef.shape, sprX, sprY, sprSize, sprSize);
      } else if (typeof drawEnemyShape === 'function') {
        drawEnemyShape({ x:sprX, y:sprY, w:sprSize, h:sprSize, shape:eDef.shape, hitFlash:0 }, col);
      }
    } else {
      ctx.filter = 'brightness(0)'; ctx.globalAlpha = 0.25;
      if (typeof hasSprite === 'function' && hasSprite(eDef.shape))
        drawSpriteImg(eDef.shape, sprX, sprY, sprSize, sprSize);
    }
    ctx.restore();
    var dispName = known
      ? ((typeof getVariantName === 'function' && getVariantName(eDef.shape, lp)) || eDef.name)
      : '???';
    ctx.fillStyle = known ? col : '#555'; ctx.font = 'bold 22px ' + F; ctx.textAlign = 'center';
    ctx.fillText(dispName, px + PW/2, py + 126);
    ctx.textAlign = 'left';
    if (!known) {
      ctx.fillStyle = '#666'; ctx.font = '15px ' + F; ctx.textAlign = 'center';
      ctx.fillText('not found yet', px + PW/2, py + 155);
      ctx.textAlign = 'left';
    } else {
      var sX = px + 30, sY = py + 152;
      ctx.fillStyle = '#ccc'; ctx.font = '14px ' + F;
      ctx.fillText('seen:' + (rec?rec.seen:0) + '  defeated:' + (rec?rec.defeated:0), sX, sY);
      if (eDef.lore) {
        ctx.fillStyle = '#aaa'; ctx.font = 'italic 13px ' + F;
        var maxW = PW - 60, ls = eDef.lore;
        while (ls.length > 0 && ctx.measureText(ls).width > maxW) ls = ls.slice(0,-1);
        if (ls.length < eDef.lore.length) ls += '...';
        ctx.fillText(ls, sX, sY + 22);
      }
      var vnY = py + 210;
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 13px ' + F; ctx.fillText('variant:', px+30, vnY);
      var vnames = (typeof ENEMY_VARIANT_NAMES !== 'undefined' && ENEMY_VARIANT_NAMES[eDef.shape]) || [];
      for (var vi = 0; vi < Math.min(vnames.length,4); vi++) {
        ctx.fillStyle = vi===lp ? col : '#666';
        ctx.font = (vi===lp?'bold ':'') + '12px ' + F;
        ctx.fillText('L'+vi+':'+vnames[vi], px+100+vi*95, vnY);
      }
    }
  } else if (item.type === 'weapon') {
    var w = item.def, known = item.known, col = w.color || '#fff';
    var sprSize = 96, sprX = px + PW/2 - 48, sprY = py + 18;
    var wSprId = 'weapon_' + w.id;
    if (known && typeof hasSprite === 'function' && hasSprite(wSprId)) {
      drawSpriteImg(wSprId, sprX, sprY, sprSize, sprSize);
    } else {
      ctx.fillStyle = known ? col : '#444';
      ctx.font = '64px ' + F; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      var em = known ? (w.name.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF]|^./)||['\u2694'])[0] : '?';
      ctx.fillText(em, px+PW/2, sprY+8);
      ctx.textBaseline = 'alphabetic';
    }
    ctx.fillStyle = known ? col : '#555'; ctx.font = 'bold 22px ' + F; ctx.textAlign = 'center';
    ctx.fillText(known ? w.name : '???', px+PW/2, py+128);
    ctx.textAlign = 'left';
    if (!known) {
      ctx.fillStyle = '#666'; ctx.font = '15px ' + F; ctx.textAlign = 'center';
      ctx.fillText('not obtained yet', px+PW/2, py+156);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = w.tier===2 ? '#ffd700' : '#cd7f32'; ctx.font = 'bold 12px ' + F; ctx.textAlign = 'center';
      ctx.fillText(w.tier===2 ? 'Tier 2' : 'Tier 1', px+PW/2, py+146);
      ctx.textAlign = 'left';
      var sX = px+30, sY = py+168;
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 13px ' + F; ctx.fillText('stats', sX, sY);
      ctx.fillStyle = '#ccc'; ctx.font = '13px ' + F;
      ctx.fillText('ATK x'+w.dmgMul.toFixed(1), sX, sY+18);
      ctx.fillText('SPD '+w.speed.toFixed(2)+'s', sX+110, sY+18);
      ctx.fillText('RNG '+w.range, sX+220, sY+18);
      ctx.fillStyle = '#aaa'; ctx.font = '13px ' + F; ctx.fillText(w.desc||'', sX, sY+38);
      if (typeof EVOLUTION_MAP !== 'undefined') {
        var evo = EVOLUTION_MAP[w.id], evoY = sY+62;
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 13px ' + F; ctx.fillText('evo', sX, evoY);
        if (evo) {
          var t2d = WEAPON_DEFS.find(function(d){return d.id===evo.to;});
          ctx.fillStyle = '#e040fb'; ctx.font = '13px ' + F;
          ctx.fillText('->'+(t2d?t2d.name:evo.to)+' (pollen '+evo.cost+')', sX+40, evoY);
        } else {
          ctx.fillStyle = '#555'; ctx.font = '13px ' + F;
          ctx.fillText(w.tier===2?'max':'none', sX+40, evoY);
        }
      }
    }
  }
  ctx.fillStyle = 'rgba(200,200,200,0.5)'; ctx.font = '13px ' + F; ctx.textAlign = 'center';
  ctx.fillText('X/ESC: close', CW/2, py+PH-8);
  ctx.textAlign = 'left';
}

function drawCollectionTab() {
  var F = "'M PLUS Rounded 1c', sans-serif";
  var _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  var subTabs = ['\u3044\u304d\u3082\u306e','\u3076\u304d','\u305b\u304b\u3044'];
  for (var si = 0; si < subTabs.length; si++) {
    var stx = 180 + si * 160, sty = 120;
    ctx.fillStyle = collectionSubTab === si ? '#ffd700' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(stx - 56, sty - 16, 112, 32 * _M);
    ctx.fillStyle = collectionSubTab === si ? '#000' : '#ccc';
    ctx.font = 'bold ' + (18*_M) + 'px ' + F; ctx.textAlign = 'center';
    ctx.fillText(subTabs[si], stx, sty + 6*_M);
  }
  ctx.textAlign = 'left';
  if(typeof touchActive==='undefined'||!touchActive){
    drawKeyHint(ctx,340,106,'W');
    drawKeyHint(ctx,340,120+32*_M+14,'S');
  }
  if (collectionSubTab === 2) { drawWorldLoreTab(); return; }
  var subKey = collectionSubTab === 0 ? 'enemy' : 'weapon';
  var filter = collectionFilter[subKey];
  var items = getFilteredItems(collectionSubTab, filter);
  var filterKeys = collectionSubTab === 0
    ? ['all','forest','cave','flower','boss'] : ['all','tier1','tier2'];
  var filterLabels = collectionSubTab === 0
    ? ['ALL','forest','cave','flower','boss'] : ['ALL','Tier1','Tier2'];
  var fY = 155, fStart = 120;
  for (var fi = 0; fi < filterKeys.length; fi++) {
    var fW = 70, fX = fStart + fi * (fW + 8);
    var isActive = filter === filterKeys[fi];
    ctx.fillStyle = isActive ? '#ffd700' : 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.roundRect(fX, fY-14, fW, 26, 6); ctx.fill();
    ctx.fillStyle = isActive ? '#000' : '#aaa';
    ctx.font = 'bold 12px ' + F; ctx.textAlign = 'center';
    ctx.fillText(filterLabels[fi], fX + fW/2, fY+4);
  }
  ctx.textAlign = 'left';
  var ownedC = items.filter(function(it) {
    return it.type === 'enemy' ? (it.rec && it.rec.defeated > 0) : it.known;
  }).length;
  var pct = items.length > 0 ? Math.floor(ownedC / items.length * 100) : 0;
  ctx.fillStyle = '#333'; ctx.fillRect(120, 175, 400, 10);
  ctx.fillStyle = '#7ecf6a'; ctx.fillRect(120, 175, 400*(ownedC/Math.max(1,items.length)), 10);
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '11px ' + F; ctx.textAlign = 'center';
  ctx.fillText(ownedC+' / '+items.length+' ('+pct+'%)', 320, 184);
  ctx.textAlign = 'left';
  drawCollectionCarousel(ctx, items, subKey, collectionSubTab);
  if (collectionDetailOpen) {
    var cur2 = collectionCursor[subKey];
    var item2 = items[cur2];
    if (item2) drawCollectionDetail(ctx, item2);
  }
  if (typeof isEncyclopediaComplete === 'function' && isEncyclopediaComplete()) {
    ctx.fillStyle = 'rgba(255,215,0,0.15)'; ctx.fillRect(CW-230, 185, 210, 30);
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px ' + F; ctx.textAlign = 'center';
    ctx.fillText('complete!', CW-125, 205);
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
  ctx.fillStyle = '#5d4037'; ctx.font = 'bold 11px ' + F; ctx.textAlign = 'center';
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
  ctx.fillStyle = '#5d4037'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
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
  // 武器名・ATK: タッチ時はジョイスティックと重なるので非表示
  if (_M === 1) {
    ctx.fillStyle = player.weapon.color; ctx.font = "18px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('\u2694 ' + player.weapon.name, 12, CH - 52);
    ctx.fillStyle = COL.text; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('ATK:' + Math.ceil(player.atk * player.weapon.dmgMul), 12, CH - 30);
  }
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
        ctx.fillStyle = '#5d4037'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
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
      let helpText = 'WASD/いどう  Z:こうげき  X:ダッシュ  [I]持ち物  [O]図鑑  [P]装備';
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
    ctx.font = '54px ' + F; ctx.fillStyle = '#5d4037';
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
  ctx.fillStyle = '#5d4037';
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

function drawKeyHint(ctx,x,y,key){
  var w=key.length>1?22:16,h=16;
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,0.45)';ctx.strokeStyle='rgba(255,255,200,0.6)';ctx.lineWidth=1;
  if(typeof ctx.roundRect==='function'){ctx.beginPath();ctx.roundRect(x-w/2,y-h/2,w,h,3);}
  else roundRect(ctx,x-w/2,y-h/2,w,h,3);
  ctx.fill();ctx.stroke();
  ctx.fillStyle='rgba(255,255,200,0.9)';ctx.font='bold 9px monospace';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(key,x,y);ctx.restore();
}

function drawDmgNumbers() {
  for (const d of dmgNumbers) { ctx.globalAlpha = clamp(d.life / 0.3, 0, 1); ctx.fillStyle = d.color; ctx.font = "bold 40px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText(d.val, d.x, d.y); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
}




// 🌸 手帳メニュー専用の台紙描画
function drawNotebookBase(ctx, x, y, w, h, title) {
  ctx.fillStyle = '#fdf6e3'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 15); ctx.fill();
  ctx.strokeStyle = '#5d4037'; ctx.lineWidth = 5; ctx.stroke();
  if (title) {
    ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.roundRect(x, y, w, 50, [15, 15, 0, 0]); ctx.fill();
    ctx.fillStyle = '#fdf6e3'; ctx.font = "bold 22px 'M PLUS Rounded 1c'";
    ctx.textAlign = 'center'; ctx.fillText(title, x + w/2, y + 33); ctx.textAlign = 'left';
  }
  ctx.fillStyle = '#795548'; ctx.font = "bold 14px 'M PLUS Rounded 1c'";
  ctx.textAlign = 'right'; ctx.fillText('↩ [Tab] キーで閉じる', x + w - 20, y + h - 20); ctx.textAlign = 'left';
}
