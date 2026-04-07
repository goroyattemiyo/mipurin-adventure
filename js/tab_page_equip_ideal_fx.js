// ===== js/tab_page_equip_ideal_fx.js =====

function drawEquipPageIdealFx() {
  const ui = drawTabBaseV2(2, '装備 | ↑↓ 選択 / →← 移動 / Z 強化 / ESC とじる');
  const content = ui.content;
  const cols = tabSplitColumns(content, 0.48, 16);

  const left = cols.left;
  const right = cols.right;

  drawTabPanel(left, '今の装備', { bg: 'rgba(239,228,210,0.97)', stroke: '#4e342e', radius: 14, titleSize: 18 });
  drawTabUiSparkles(left, 10, ['#ffd700', '#fff8e1', '#f9a8d4']);

  const stage = tabInsetRect(left, 16);
  const centerRect = {
    x: stage.x + Math.floor(stage.w * 0.28),
    y: stage.y + Math.floor(stage.h * 0.20) + tabUiFloat(5, 1.5, 0.0),
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
  if (typeof equipIdealStageSlot === 'function') {
    equipIdealStageSlot(mainRect, 'メイン', getSlotWeapon(0), equipMode === 'slot' && equipCursor === 0, false);
    equipIdealStageSlot(subRect, 'サブ', getSlotWeapon(1), equipMode === 'slot' && equipCursor === 1, false);
    equipIdealStageSlot(charmRect, 'チャーム', getSlotWeapon(2), equipMode === 'slot' && equipCursor === 2, true);
  }

  if (typeof equipDashedPanel === 'function') {
    equipDashedPanel(futureHeadRect.x, futureHeadRect.y, futureHeadRect.w, futureHeadRect.h, 'あたま');
    equipDashedPanel(futureBodyRect.x, futureBodyRect.y, futureBodyRect.w, futureBodyRect.h, 'からだ');
    equipDashedPanel(futureAccessoryRect.x, futureAccessoryRect.y, futureAccessoryRect.w, futureAccessoryRect.h, 'かざり');
  }

  const selectedRect = equipMode === 'slot'
    ? equipSlotRects[Math.max(0, Math.min(2, equipCursor))]
    : null;
  if (selectedRect) {
    drawTabUiSelectionGlow(selectedRect, '#ffd700', 0.16 + tabUiPulse(0.02, 0.10, 2.6, 0.1));
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

  if (typeof equipIdealOwnedList === 'function') equipIdealOwnedList(rightRows[0], owned);
  if (typeof equipIdealDetail === 'function') equipIdealDetail(rightRows[1], owned);
}
