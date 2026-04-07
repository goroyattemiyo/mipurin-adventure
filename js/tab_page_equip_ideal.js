// ===== js/tab_page_equip_ideal.js =====
// Idealized equipment page built on top of tab_ui_base.js
// Goal:
//   left  = mipurin-centered equipment stage
//   right = owned list + detail/comparison

function equipIdealStageSlot(rect, label, item, selected, isCharm) {
  if (typeof drawEquipSlot === 'function') {
    drawEquipSlot(rect, label, item, selected, isCharm);
    return;
  }

  drawTabPanel(rect, label, { bg: 'rgba(253,246,227,0.94)', stroke: selected ? '#f57f17' : '#bca38a', radius: 14 });
  ctx.save();
  ctx.fillStyle = item ? (item.color || '#3e2723') : '#8d6e63';
  ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(item ? item.name : (isCharm ? 'チャームなし' : 'なし'), rect.x + rect.w / 2, rect.y + rect.h / 2 + 8);
  ctx.restore();
}

function equipIdealOwnedList(rect, list) {
  drawTabPanel(rect, '所持一覧', { bg: 'rgba(239,228,210,0.97)', stroke: '#4e342e', radius: 12, titleSize: 18 });

  const inner = tabInsetRect(rect, 12);
  const rowH = 42;
  const listTop = inner.y + 24;
  const maxRows = Math.max(1, Math.floor((inner.h - 28) / rowH));

  let start = 0;
  if (list.length > maxRows) {
    start = Math.max(0, Math.min(equipListCursor - Math.floor(maxRows / 2), list.length - maxRows));
  }

  for (let i = 0; i < maxRows; i++) {
    const idx = start + i;
    if (idx >= list.length) break;
    const entry = list[idx];
    const y = listTop + i * rowH;
    const selected = equipMode === 'list' && idx === equipListCursor;

    ctx.save();
    ctx.fillStyle = selected ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.38)';
    ctx.beginPath();
    ctx.roundRect(inner.x, y, inner.w, rowH - 6, 10);
    ctx.fill();

    if (selected) {
      ctx.strokeStyle = '#f57f17';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(inner.x, y, inner.w, rowH - 6, 10);
      ctx.stroke();
    }

    if (typeof drawEquipItemIcon === 'function') {
      drawEquipItemIcon(entry.w, inner.x + 8, y + 5, 26);
    }

    let prefix = '・';
    if (entry.src === 'main') prefix = 'M';
    else if (entry.src === 'sub') prefix = 'S';
    else if (entry.src === 'bp') prefix = 'B';

    ctx.fillStyle = '#6d4c41';
    ctx.font = "bold 12px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(prefix, inner.x + 48, y + 23);

    const name = entry.w && entry.w.name ? entry.w.name : '不明';
    ctx.fillStyle = entry.w.color || '#3e2723';
    ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'left';
    let safeName = name;
    while (safeName.length > 0 && ctx.measureText(safeName).width > inner.w - 76) {
      safeName = safeName.slice(0, -1);
    }
    if (safeName.length < name.length) safeName += '…';
    ctx.fillText(safeName, inner.x + 62, y + 23);
    ctx.restore();
  }
}

function equipIdealDetail(rect, list) {
  drawTabPanel(rect, '詳細 / 比較', { bg: 'rgba(239,228,210,0.97)', stroke: '#4e342e', radius: 12, titleSize: 18 });

  const item = (typeof getEquipSelectedEntry === 'function') ? getEquipSelectedEntry(list) : null;
  const current = (typeof getSlotWeapon === 'function' && equipCursor < 2) ? getSlotWeapon(equipCursor) : null;
  const inner = tabInsetRect(rect, 14);

  ctx.save();
  ctx.textAlign = 'left';

  if (!item) {
    ctx.fillStyle = '#8d6e63';
    ctx.font = "14px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('表示できる装備がありません', inner.x, inner.y + 30);
    ctx.restore();
    return;
  }

  ctx.fillStyle = item.color || '#3e2723';
  ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(item.name || '不明', inner.x, inner.y + 28);

  const desc = item.desc || '説明なし';
  ctx.fillStyle = '#6d4c41';
  ctx.font = "14px 'M PLUS Rounded 1c', sans-serif";
  let descLine = desc;
  while (descLine.length > 0 && ctx.measureText(descLine).width > inner.w) {
    descLine = descLine.slice(0, -1);
  }
  if (descLine.length < desc.length) descLine += '…';
  ctx.fillText(descLine, inner.x, inner.y + 56);

  const line2 = `Lv.${item.level || 0} / Rare: ${item.rarity || '-'} `;
  ctx.fillStyle = '#8d6e63';
  ctx.fillText(line2, inner.x, inner.y + 84);

  ctx.fillStyle = '#5d4037';
  ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('性能', inner.x, inner.y + 116);

  const perf = `ATK x${((item.dmgMul || 1)).toFixed(1)} / SPD ${((item.speed || 0)).toFixed(2)}`;
  ctx.fillStyle = '#7b5e57';
  ctx.font = "14px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(perf, inner.x, inner.y + 140);

  if (equipMode === 'list' && equipCursor < 2 && current && typeof getStatDeltaText === 'function') {
    ctx.fillStyle = '#5d4037';
    ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('今の装備との差分', inner.x, inner.y + 174);
    ctx.fillStyle = '#7b5e57';
    ctx.font = "14px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(getStatDeltaText(current, item), inner.x, inner.y + 198);
  }

  ctx.fillStyle = '#a1887f';
  ctx.font = "13px 'M PLUS Rounded 1c', sans-serif";
  const hint = equipMode === 'slot'
    ? (equipCursor < 2 ? 'Z: 強化　→: 一覧へ' : 'チャームは表示のみ')
    : 'Z: 強化 / 進化　X: 装備切替　←: 戻る';
  ctx.fillText(hint, inner.x, rect.y + rect.h - 14);
  ctx.restore();
}

function drawEquipPageIdeal() {
  const ui = drawTabBase(2);
  const content = ui.content;
  const cols = tabSplitColumns(content, 0.48, 16);

  const left = cols.left;
  const right = cols.right;

  drawTabPanel(left, '今の装備', { bg: 'rgba(239,228,210,0.97)', stroke: '#4e342e', radius: 14, titleSize: 18 });

  const stage = tabInsetRect(left, 16);
  const centerRect = {
    x: stage.x + Math.floor(stage.w * 0.28),
    y: stage.y + Math.floor(stage.h * 0.20),
    w: Math.floor(stage.w * 0.44),
    h: Math.floor(stage.h * 0.42)
  };

  const mainRect = {
    x: stage.x + 8,
    y: centerRect.y + Math.floor(centerRect.h * 0.38),
    w: Math.floor(stage.w * 0.26),
    h: 88
  };

  const subRect = {
    x: stage.x + stage.w - Math.floor(stage.w * 0.26) - 8,
    y: centerRect.y + Math.floor(centerRect.h * 0.38),
    w: Math.floor(stage.w * 0.26),
    h: 88
  };

  const charmRect = {
    x: stage.x + Math.floor(stage.w * 0.5) - Math.floor(stage.w * 0.16),
    y: stage.y + 26,
    w: Math.floor(stage.w * 0.32),
    h: 76
  };

  const futureHeadRect = {
    x: stage.x + Math.floor(stage.w * 0.5) - 42,
    y: charmRect.y - 34,
    w: 84,
    h: 24
  };
  const futureBodyRect = {
    x: stage.x + Math.floor(stage.w * 0.5) - 42,
    y: centerRect.y + centerRect.h + 8,
    w: 84,
    h: 24
  };
  const futureAccessoryRect = {
    x: stage.x + Math.floor(stage.w * 0.5) - 42,
    y: futureBodyRect.y + 30,
    w: 84,
    h: 24
  };

  equipSlotRects = [mainRect, subRect, charmRect];

  if (typeof drawMipurinCenter === 'function') {
    drawMipurinCenter(centerRect);
  }
  equipIdealStageSlot(mainRect, 'メイン', getSlotWeapon(0), equipMode === 'slot' && equipCursor === 0, false);
  equipIdealStageSlot(subRect, 'サブ', getSlotWeapon(1), equipMode === 'slot' && equipCursor === 1, false);
  equipIdealStageSlot(charmRect, 'チャーム', getSlotWeapon(2), equipMode === 'slot' && equipCursor === 2, true);

  if (typeof equipDashedPanel === 'function') {
    equipDashedPanel(futureHeadRect.x, futureHeadRect.y, futureHeadRect.w, futureHeadRect.h, 'あたま');
    equipDashedPanel(futureBodyRect.x, futureBodyRect.y, futureBodyRect.w, futureBodyRect.h, 'からだ');
    equipDashedPanel(futureAccessoryRect.x, futureAccessoryRect.y, futureAccessoryRect.w, futureAccessoryRect.h, 'かざり');
  }

  ctx.save();
  ctx.fillStyle = 'rgba(93,64,55,0.75)';
  ctx.font = "bold 16px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('⚔', centerRect.x - 12, centerRect.y + centerRect.h * 0.56);
  ctx.fillText('🪄', centerRect.x + centerRect.w + 12, centerRect.y + centerRect.h * 0.56);
  ctx.fillText('🔮', centerRect.x + centerRect.w / 2, centerRect.y - 8);
  ctx.restore();

  const rightRows = tabStackRows(right, [Math.floor(right.h * 0.54), right.h - Math.floor(right.h * 0.54) - 12], 12);
  const owned = (typeof getAllOwnedWeapons === 'function') ? getAllOwnedWeapons() : [];

  equipIdealOwnedList(rightRows[0], owned);
  equipIdealDetail(rightRows[1], owned);
}
