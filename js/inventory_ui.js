function drawInventory() {
  if (!inventoryOpen) return;
  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, CW, CH);

  if (typeof drawNotebookBase === 'function') {
    drawNotebookBase(ctx, (CW - 1000) / 2, (CH - 700) / 2 + 20, 1000, 700, '🌸 みぷりんの冒険手帳');
  }

  const tabs = ['持ち物', '図鑑', '装備'];
  for (let i = 0; i < tabs.length; i++) {
    const tx = CW / 2 - 120 + i * 240;
    const ty = 70 + 15 * _M;
    ctx.fillStyle = inventoryTab === i ? '#ffd700' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(tx - 80, ty - 20 * _M, 160, 40 * _M);
    ctx.fillStyle = inventoryTab === i ? '#000' : '#fff';
    ctx.font = "bold " + (20 * _M) + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(tabs[i], tx, ty + 7 * _M);
  }
  ctx.textAlign = 'left';

  if (typeof touchActive === 'undefined' || !touchActive) {
    const _kF = "'M PLUS Rounded 1c', sans-serif";
    const _kY = 128, _kW = 176, _kGap = 6;
    const _kTabs = [['持ち物', 0], ['図鑑', 1], ['装備', 2]];
    const _kSX = CW / 2 - (_kW * 3 + _kGap * 2) / 2;

    for (let _ki = 0; _ki < _kTabs.length; _ki++) {
      const _kAct = inventoryTab === _kTabs[_ki][1];
      const _kX = _kSX + _ki * (_kW + _kGap);

      ctx.fillStyle = _kAct ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.05)';
      ctx.beginPath();
      ctx.roundRect(_kX, _kY - 13, _kW, 24, 5);
      ctx.fill();

      ctx.strokeStyle = _kAct ? '#ffd700' : 'rgba(255,255,255,0.12)';
      ctx.lineWidth = _kAct ? 1.5 : 1;
      ctx.beginPath();
      ctx.roundRect(_kX, _kY - 13, _kW, 24, 5);
      ctx.stroke();

      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.roundRect(_kX + 6, _kY - 9, 22, 16, 3);
      ctx.fill();

      ctx.strokeStyle = _kAct ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = _kAct ? '#ffd700' : '#aaa';
      ctx.font = 'bold 11px ' + _kF;
      ctx.textAlign = 'center';
      ctx.fillText(['I', 'O', 'P'][_ki], _kX + 17, _kY + 2);

      ctx.fillStyle = _kAct ? '#fff' : '#888';
      ctx.font = (_kAct ? 'bold ' : '') + (_M * 13) + 'px ' + _kF;
      ctx.fillText(_kTabs[_ki][0], _kX + _kW / 2 + 6, _kY + 2);

      ctx.textAlign = 'left';
      if (_kAct) {
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(_kX + 3, _kY + 9, _kW - 6, 2);
      }
    }

    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.font = '12px ' + _kF;
    ctx.textAlign = 'right';
    ctx.fillText('[ESC] とじる', CW - 118, _kY + 2);
    ctx.textAlign = 'left';
  }

  if (inventoryTab === 0) drawInventoryItems();
  else if (inventoryTab === 1) drawCollectionTab();
  if (inventoryTab === 2) drawEquipTab(80, 130, CW - 160, CH - 180);

  const _isTch = (typeof touchActive !== 'undefined' && touchActive);
  let _helpLines;
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
    const _ihF = "'M PLUS Rounded 1c', sans-serif";
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, CH - 26, CW, 26);
    const _ihT = inventoryTab === 0
      ? '[I]持ち物  [O]図鑑  [P]装備  [ESC]とじる'
      : inventoryTab === 1
        ? '[I]持ち物  [O]図鑑  [P]装備  [←→]サブタブ  [↑↓]スクロール  [F]フィルタ  [ESC]とじる'
        : '[I]持ち物  [O]図鑑  [P]装備  [↑↓]スクロール  [Z]強化/そうび  [ESC]とじる';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '13px ' + _ihF;
    ctx.textAlign = 'center';
    ctx.fillText(_ihT, CW / 2, CH - 8);
    ctx.textAlign = 'left';
  }

  UIManager.drawHelpIcon(ctx, CW - 160, 55 + 10 * _M, 34, 'inventory');
  if (UIManager.isHelpOpen('inventory')) {
    const _tabName = ['持ち物', '図鑑', '装備'][inventoryTab] || '';
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

  if (isTouch) {
    outer.x = 120;
    outer.y = 180;
    outer.w = CW - 240;
    outer.h = CH - 360;
  }

  return { isTouch, _M, outer };
}

function invInsetRect(r, pad) {
  return {
    x: r.x + pad,
    y: r.y + pad,
    w: r.w - pad * 2,
    h: r.h - pad * 2
  };
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
  const bg = opts.bg || 'rgba(243,232,214,0.96)';
  const stroke = opts.stroke || '#4e342e';
  const titleColor = opts.titleColor || '#2f241c';
  const radius = opts.radius || 12;
  const titleSize = opts.titleSize || 18;

  ctx.save();

  // 本体
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
  ctx.fill();

  // 内側のうっすら明るい面を入れて、ベタ塗り感を減らす
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.roundRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4, Math.max(4, radius - 2));
  ctx.fill();

  // 枠線を濃く
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
  ctx.stroke();

  if (title) {
    ctx.fillStyle = titleColor;
    ctx.font = `bold ${titleSize}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(title, r.x + 14, r.y + 24);

    // タイトル下ラインを追加して視線誘導
    ctx.strokeStyle = 'rgba(78,52,46,0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r.x + 14, r.y + 32);
    ctx.lineTo(r.x + r.w - 14, r.y + 32);
    ctx.stroke();
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

    ctx.fillStyle = '#4e342e';
    ctx.font = `bold ${Math.max(16, 14 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText(stats[i][0], cx + 10, cy + 20);

    ctx.fillStyle = '#1f1712';
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
  const isTouch = (typeof touchActive !== 'undefined' && touchActive);

  const rows = [
    ['メイン', player.weapons[0] ? player.weapons[0].name : '- なし -', player.weapons[0]?.color || '#666'],
    ['サブ', player.weapons[1] ? player.weapons[1].name : '- なし -', player.weapons[1]?.color || '#666'],
    ['チャーム', player.charm ? ((player.charm.icon || '🔮') + ' ' + player.charm.name) : '- なし -', player.charm ? '#8e24aa' : '#666']
  ];

  for (let i = 0; i < rows.length; i++) {
    const y = startY + i * lineGap;
    const selected = !isTouch && inventoryDetailSection === 0 && inventoryEquipCursor === i;

    if (selected) {
      ctx.fillStyle = 'rgba(255,215,0,0.24)';
      ctx.beginPath();
      ctx.roundRect(inner.x - 6, y - 18, inner.w + 12, 24 * _M, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,180,0,0.85)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(inner.x - 6, y - 18, inner.w + 12, 24 * _M, 8);
      ctx.stroke();
    }

    ctx.fillStyle = '#4e342e';
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
  const isTouch = (typeof touchActive !== 'undefined' && touchActive);

  for (let i = 0; i < count; i++) {
    const sx = startX + i * (slotSize + gap);
    const icon = player.consumables && player.consumables[i] ? player.consumables[i].icon : '－';
    const selected = !isTouch && inventoryDetailSection === 1 && inventoryItemCursor === i;

    ctx.fillStyle = selected ? 'rgba(255,215,0,0.24)' : 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.roundRect(sx, cy - slotSize / 2, slotSize, slotSize, 12);
    ctx.fill();

    ctx.strokeStyle = selected ? 'rgba(255,180,0,0.9)' : 'rgba(93,64,55,0.72)';
    ctx.lineWidth = selected ? 2.5 : 2;
    ctx.beginPath();
    ctx.roundRect(sx, cy - slotSize / 2, slotSize, slotSize, 12);
    ctx.stroke();

    ctx.fillStyle = '#3e2723';
    ctx.font = `${Math.max(24, 20 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(icon, sx + slotSize / 2, cy + 8 * _M);

    ctx.fillStyle = selected ? '#3e2723' : '#6d4c41';
    ctx.font = `bold ${Math.max(14, 12 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText('[' + (i + 1) + ']', sx + slotSize / 2, cy + slotSize / 2 + 16 * _M);
  }

  ctx.textAlign = 'left';
}

function drawInventoryBlessingSummaryBlock(r, _M) {
  invDrawPanel(r, '祝福要約', { titleSize: 18 * _M });

  const inner = invInsetRect(r, 14);
  const isTouch = (typeof touchActive !== 'undefined' && touchActive);

  if (!activeBlessings || activeBlessings.length === 0) {
    ctx.fillStyle = '#8d6e63';
    ctx.font = `${Math.max(16, 14 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText('なし', inner.x, inner.y + 34);
    return;
  }

  const maxCount = (isTouch ? 4 : 5);
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

    const selected = !isTouch && inventoryDetailSection === 2 && inventoryBlessingCursor === i;
    ctx.fillStyle = selected ? 'rgba(255,215,0,0.24)' : 'rgba(255,255,255,0.42)';
    ctx.beginPath();
    ctx.roundRect(x, y - 18, pillW, 22 * _M, 999);
    ctx.fill();

    if (selected) {
      ctx.strokeStyle = 'rgba(255,215,0,0.65)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x, y - 18, pillW, 22 * _M, 999);
      ctx.stroke();
    }

    ctx.fillStyle = '#352821';
    ctx.fillText(invEllipsis(label, pillW - 14, ctx.font), x + 10, y);
    x += pillW + 8;
  }

  if (activeBlessings.length > maxCount) {
    ctx.fillStyle = '#8d6e63';
    ctx.font = `${Math.max(14, 12 * _M)}px 'M PLUS Rounded 1c', sans-serif`;
    ctx.fillText(`+${activeBlessings.length - maxCount}`, inner.x, r.y + r.h - 12);
  }
}

function getInventoryDetailData() {
  const isTouch = (typeof touchActive !== 'undefined' && touchActive);
  const section = isTouch ? 0 : inventoryDetailSection;

  if (section === 0) {
    if ((isTouch ? 0 : inventoryEquipCursor) === 0) {
      const w = player.weapons[0];
      return w
        ? { title: 'メイン', text: `⚔ ${w.name} — ${w.desc || ''}` }
        : { title: 'メイン', text: 'メイン武器はありません' };
    }
    if ((isTouch ? 0 : inventoryEquipCursor) === 1) {
      const w = player.weapons[1];
      return w
        ? { title: 'サブ', text: `🪄 ${w.name} — ${w.desc || ''}` }
        : { title: 'サブ', text: 'サブ武器はありません' };
    }
    const c = player.charm;
    return c
      ? { title: 'チャーム', text: `${c.icon || '🔮'} ${c.name} — ${c.desc || ''}` }
      : { title: 'チャーム', text: 'チャームは装備していません' };
  }

  if (section === 1) {
    const idx = isTouch ? 0 : inventoryItemCursor;
    const it = player.consumables && player.consumables[idx];
    return it
      ? { title: `アイテム [${idx + 1}]`, text: `${it.icon} ${it.name} — ${it.desc || it.msg || ''}` }
      : { title: `アイテム [${idx + 1}]`, text: 'このスロットは空です' };
  }

  if (activeBlessings && activeBlessings.length > 0) {
    const idx = Math.min(isTouch ? 0 : inventoryBlessingCursor, activeBlessings.length - 1);
    const b = activeBlessings[idx];
    return { title: '祝福', text: `${b.icon} ${b.name} — ${b.desc || ''}` };
  }

  return { title: '祝福', text: '祝福はありません' };
}

function drawInventoryDetailBlock(r, _M) {
  const detail = getInventoryDetailData();
  invDrawPanel(r, detail.title || '詳細', { titleSize: 18 * _M });

  const inner = invInsetRect(r, 14);
  const maxWidth = inner.w;
  const fontSize = Math.max(14, 12 * _M);
  ctx.fillStyle = '#3a2c24';
  ctx.font = `${fontSize}px 'M PLUS Rounded 1c', sans-serif`;

  const chars = (detail.text || '').split('');
  let line = '';
  let y = inner.y + 28;
  const lineH = 20 * _M;
  const maxLines = 2;
  let lineCount = 0;

  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth) {
      ctx.fillText(line, inner.x, y);
      line = chars[i];
      y += lineH;
      lineCount += 1;
      if (lineCount >= maxLines - 1) break;
    } else {
      line = test;
    }
  }

  if (line) {
    let out = line;
    const consumed = (detail.text || '').indexOf(line) + line.length;
    const rest = (detail.text || '').slice(Math.max(0, consumed));
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
  const gap = 14 * _M;
  const panel = invInsetRect(outer, 4);

  if (!isTouch) {
    const detailH = 84;
    const top = {
      x: panel.x,
      y: panel.y,
      w: panel.w,
      h: panel.h - detailH - gap
    };
    const detail = {
      x: panel.x,
      y: panel.y + panel.h - detailH,
      w: panel.w,
      h: detailH
    };

    const cols = invSplitColumns(top, 0.48, gap);
    const leftRows = invStackRows(cols.left, [190, 120], gap);
    const rightRows = invStackRows(cols.right, [150, top.h - 150 - gap], gap);

    drawInventoryStatusBlock(leftRows[0], _M);
    drawInventoryItemsBlock(leftRows[1], _M);
    drawInventoryEquipSummaryBlock(rightRows[0], _M);
    drawInventoryBlessingSummaryBlock(rightRows[1], _M);
    drawInventoryDetailBlock(detail, _M);
  } else {
    const rows = invStackRows(panel, [120, 100, 90, 74, 74], gap);

    drawInventoryStatusBlock(rows[0], _M);
    drawInventoryEquipSummaryBlock(rows[1], _M);
    drawInventoryItemsBlock(rows[2], _M);
    drawInventoryBlessingSummaryBlock(rows[3], _M);
    drawInventoryDetailBlock(rows[4], _M);
  }
}