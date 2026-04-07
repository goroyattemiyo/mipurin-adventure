// ===== js/equip_ui.js =====
// Equip tab UI: Mipurin-centered layout + owned list + detail panel

let equipCursor = 0;
let equipListCursor = 0;
let equipMode = 'slot'; // 'slot' | 'list'
let equipSlotRects = [];

function getAllOwnedWeapons() {
  const list = [];
  if (player.weapons[0]) list.push({ w: player.weapons[0], src: 'main' });
  if (player.weapons[1]) list.push({ w: player.weapons[1], src: 'sub' });
  player.backpack.forEach((b, i) => {
    if (b) list.push({ w: b, src: 'bp', idx: i });
  });
  return list;
}

function getSlotWeapon(i) {
  return i === 0 ? player.weapons[0] : i === 1 ? player.weapons[1] : player.charm;
}

function equipPanel(x, y, w, h, title, selected) {
  ctx.save();
  ctx.fillStyle = 'rgba(253,246,227,0.94)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();

  ctx.strokeStyle = selected ? '#f57f17' : '#bca38a';
  ctx.lineWidth = selected ? 3 : 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.stroke();

  if (title) {
    ctx.fillStyle = '#5d4037';
    ctx.font = "bold 15px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 12, y + 22);
  }
  ctx.restore();
}

function equipDashedPanel(x, y, w, h, title) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();

  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = "13px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(title, x + w / 2, y + h / 2 + 5);
  ctx.restore();
}

function equipEllipsis(text, maxWidth, font) {
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

function drawEquipItemIcon(item, x, y, size) {
  if (!item) return;
  if (item.id && typeof hasSprite === 'function' && hasSprite('weapon_' + item.id)) {
    drawSpriteImg('weapon_' + item.id, x, y, size, size);
    return;
  }
  ctx.save();
  ctx.fillStyle = item.color || '#8e24aa';
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${Math.floor(size * 0.45)}px 'M PLUS Rounded 1c', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(item.icon || '✦', x + size / 2, y + size * 0.68);
  ctx.restore();
}

function drawEquipSlot(rect, label, item, selected, isCharm) {
  equipPanel(rect.x, rect.y, rect.w, rect.h, label, selected);

  const iconSize = Math.min(54, rect.h - 34);
  const iconX = rect.x + 10;
  const iconY = rect.y + Math.floor((rect.h - iconSize) / 2) + 6;

  if (item) {
    drawEquipItemIcon(item, iconX, iconY, iconSize);
  } else {
    ctx.save();
    ctx.fillStyle = 'rgba(93,64,55,0.14)';
    ctx.beginPath();
    ctx.roundRect(iconX, iconY, iconSize, iconSize, 10);
    ctx.fill();
    ctx.fillStyle = '#8d6e63';
    ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(isCharm ? '✦' : '—', iconX + iconSize / 2, iconY + iconSize / 2 + 7);
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = item ? (item.color || '#3e2723') : '#8d6e63';
  ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'left';
  const name = item ? item.name : '- なし -';
  const font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
  const txt = equipEllipsis(name, rect.w - iconSize - 28, font);
  ctx.fillText(txt, rect.x + iconSize + 18, rect.y + rect.h / 2 + 6);
  ctx.restore();
}

function drawMipurinCenter(rect) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.24)';
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 18);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,215,0,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 18);
  ctx.stroke();

  const glow = ctx.createRadialGradient(
    rect.x + rect.w / 2,
    rect.y + rect.h / 2,
    0,
    rect.x + rect.w / 2,
    rect.y + rect.h / 2,
    rect.w * 0.45
  );
  glow.addColorStop(0, 'rgba(255,215,0,0.18)');
  glow.addColorStop(1, 'rgba(255,215,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, rect.w * 0.45, 0, Math.PI * 2);
  ctx.fill();

  if (typeof mipurinReady !== 'undefined' && mipurinReady && typeof MIPURIN_FRAMES !== 'undefined' && MIPURIN_FRAMES.down) {
    const f = MIPURIN_FRAMES.down;
    const size = Math.min(rect.w - 16, rect.h - 16);
    const dx = rect.x + rect.w / 2 - size / 2;
    const dy = rect.y + rect.h / 2 - size / 2;
    ctx.drawImage(mipurinImg, f.sx, f.sy, f.sw, f.sh, dx, dy, size, size);
  } else {
    ctx.fillStyle = '#fff8e1';
    ctx.beginPath();
    ctx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2 + 12, 54, 62, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb74d';
    ctx.font = "bold 44px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('🐝', rect.x + rect.w / 2, rect.y + rect.h / 2 + 22);
  }
  ctx.restore();
}

function drawOwnedWeaponList(x, y, w, h, list) {
  equipPanel(x, y, w, h, '所持一覧', equipMode === 'list');
  const rowH = 42;
  const innerX = x + 10;
  const innerY = y + 34;
  const maxRows = Math.max(1, Math.floor((h - 44) / rowH));

  let start = 0;
  if (list.length > maxRows) {
    start = Math.max(0, Math.min(equipListCursor - Math.floor(maxRows / 2), list.length - maxRows));
  }

  for (let i = 0; i < maxRows; i++) {
    const idx = start + i;
    if (idx >= list.length) break;
    const entry = list[idx];
    const selected = equipMode === 'list' && idx === equipListCursor;
    const ry = innerY + i * rowH;

    ctx.save();
    ctx.fillStyle = selected ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.28)';
    ctx.beginPath();
    ctx.roundRect(innerX, ry, w - 20, rowH - 6, 10);
    ctx.fill();
    if (selected) {
      ctx.strokeStyle = '#f57f17';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(innerX, ry, w - 20, rowH - 6, 10);
      ctx.stroke();
    }

    const iconSize = 26;
    drawEquipItemIcon(entry.w, innerX + 8, ry + 5, iconSize);

    let prefix = '・';
    if (entry.src === 'main') prefix = 'M';
    else if (entry.src === 'sub') prefix = 'S';
    else if (entry.src === 'bp') prefix = 'B';

    ctx.fillStyle = '#6d4c41';
    ctx.font = "bold 12px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(prefix, innerX + 52, ry + 24);

    ctx.fillStyle = entry.w.color || '#3e2723';
    const font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
    ctx.font = font;
    ctx.textAlign = 'left';
    ctx.fillText(equipEllipsis(entry.w.name || '不明', w - 110, font), innerX + 64, ry + 24);
    ctx.restore();
  }
}

function getEquipSelectedEntry(list) {
  if (equipMode === 'list' && list[equipListCursor]) return list[equipListCursor].w;
  return getSlotWeapon(equipCursor);
}

function getStatDeltaText(currentItem, candidateItem) {
  if (!currentItem || !candidateItem) return '差分なし';
  const curD = currentItem.dmgMul || 1;
  const newD = candidateItem.dmgMul || 1;
  const curS = currentItem.speed || 0;
  const newS = candidateItem.speed || 0;
  const dmgArrow = newD > curD ? 'ATK↑' : newD < curD ? 'ATK↓' : 'ATK=';
  const spdArrow = newS > curS ? 'SPD↑' : newS < curS ? 'SPD↓' : 'SPD=';
  return `${dmgArrow}  ${spdArrow}`;
}

function drawEquipDetail(x, y, w, h, list) {
  equipPanel(x, y, w, h, '詳細 / 比較', false);
  const item = getEquipSelectedEntry(list);
  const current = equipCursor < 2 ? getSlotWeapon(equipCursor) : null;

  ctx.save();
  ctx.textAlign = 'left';

  if (!item) {
    ctx.fillStyle = '#8d6e63';
    ctx.font = "14px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('表示できる装備がありません', x + 14, y + 48);
    ctx.restore();
    return;
  }

  ctx.fillStyle = item.color || '#3e2723';
  ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(item.name || '不明', x + 14, y + 48);

  const desc = item.desc || '説明なし';
  ctx.fillStyle = '#6d4c41';
  ctx.font = "14px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(equipEllipsis(desc, w - 28, "14px 'M PLUS Rounded 1c', sans-serif"), x + 14, y + 78);

  const line2 = `Lv.${item.level || 0} / Rare: ${item.rarity || '-'}`;
  ctx.fillStyle = '#8d6e63';
  ctx.fillText(line2, x + 14, y + 106);

  if (equipMode === 'list' && equipCursor < 2 && current) {
    ctx.fillStyle = '#5d4037';
    ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('今の装備との差分', x + 14, y + 136);
    ctx.fillStyle = '#7b5e57';
    ctx.fillText(getStatDeltaText(current, item), x + 14, y + 162);
  } else if (equipMode === 'slot' && equipCursor < 2 && current) {
    const perf = `ATK x${(current.dmgMul || 1).toFixed(1)} / SPD ${(current.speed || 0).toFixed(2)}`;
    ctx.fillStyle = '#7b5e57';
    ctx.fillText(perf, x + 14, y + 136);
  }

  ctx.fillStyle = '#a1887f';
  ctx.font = "13px 'M PLUS Rounded 1c', sans-serif";
  const hint = equipMode === 'slot'
    ? (equipCursor < 2 ? 'Z: 強化　→: 一覧へ' : 'チャームは表示のみ')
    : 'Z: 強化 / 進化　X: 装備切替　←: 戻る';
  ctx.fillText(hint, x + 14, y + h - 16);
  ctx.restore();
}

function drawEquipTab(px, py, pw, ph) {
  const F = "'M PLUS Rounded 1c', sans-serif";
  const isTouch = (typeof touchActive !== 'undefined' && touchActive);
  const _M = isTouch ? 2 : 1;

  drawNotebookBase(ctx, px, py, pw, ph, '🌸 みぷりんの冒険手帳 — そうび');

  const leftW = Math.floor(pw * (isTouch ? 0.50 : 0.47));
  const rightW = pw - leftW - 34;
  const leftX = px + 18;
  const leftY = py + 58;
  const leftH = ph - 76;
  const rightX = leftX + leftW + 18;
  const rightY = leftY;
  const rightH = leftH;

  // --- Left pane ---
  equipPanel(leftX, leftY, leftW, leftH, '今の装備', equipMode === 'slot');

  const centerRect = {
    x: leftX + 8,
    y: leftY + 32,
    w: leftW - 16,
    h: Math.floor(leftH * 0.58)
  };
  const _slotY = leftY + Math.floor(leftH * 0.60);
  const _slotH = 72;
  const _slotW = Math.floor((leftW - 40) / 3);
  const mainRect  = { x: leftX + 8,                      y: _slotY, w: _slotW, h: _slotH };
  const subRect   = { x: leftX + 8 + (_slotW+8),         y: _slotY, w: _slotW, h: _slotH };
  const charmRect = { x: leftX + 8 + (_slotW+8)*2,       y: _slotY, w: _slotW, h: _slotH };

  const futureHeadRect      = { x:0,y:0,w:0,h:0 };
  const futureBodyRect      = { x:0,y:0,w:0,h:0 };
  const futureAccessoryRect = { x:0,y:0,w:0,h:0 };

  equipSlotRects = [mainRect, subRect, charmRect];

  drawMipurinCenter(centerRect);
  drawEquipSlot(mainRect, 'メイン', getSlotWeapon(0), equipMode === 'slot' && equipCursor === 0, false);
  drawEquipSlot(subRect, 'サブ', getSlotWeapon(1), equipMode === 'slot' && equipCursor === 1, false);
  drawEquipSlot(charmRect, 'チャーム', getSlotWeapon(2), equipMode === 'slot' && equipCursor === 2, true);

  // Future dress-up reserved slots (visual only)
  equipDashedPanel(futureHeadRect.x, futureHeadRect.y, futureHeadRect.w, futureHeadRect.h, 'あたま');
  equipDashedPanel(futureBodyRect.x, futureBodyRect.y, futureBodyRect.w, futureBodyRect.h, 'からだ');
  equipDashedPanel(futureAccessoryRect.x, futureAccessoryRect.y, futureAccessoryRect.w, futureAccessoryRect.h, 'かざり');

  // スロットラベルはequipSlot内のtitleで表示

  // --- Right pane ---
  const owned = getAllOwnedWeapons();
  const listH = Math.floor(rightH * 0.56);
  drawOwnedWeaponList(rightX, rightY, rightW, listH, owned);
  drawEquipDetail(rightX, rightY + listH + 14, rightW, rightH - listH - 14, owned);

  // Footer hint
  if (!isTouch) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.fillRect(px, py + ph - 28, pw, 28);
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = "13px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    const hint = equipMode === 'slot'
      ? '[↑↓]スロット選択  [→]一覧へ  [Z]強化  [ESC]とじる'
      : '[↑↓]一覧選択  [Z]強化/進化  [X]そうび切替  [←]戻る  [ESC]とじる';
    ctx.fillText(hint, px + pw / 2, py + ph - 9);
    ctx.restore();
  }
}
