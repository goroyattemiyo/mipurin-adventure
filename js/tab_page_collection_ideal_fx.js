// ===== js/tab_page_collection_ideal_fx.js =====

function collFxPill(x, y, w, h, label, active) {
  ctx.save();
  ctx.fillStyle = active ? '#ffd700' : 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = active ? 'rgba(255,215,0,0.92)' : 'rgba(255,255,255,0.10)';
  ctx.lineWidth = active ? 2 : 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.stroke();
  ctx.fillStyle = active ? '#000' : '#ddd';
  ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, y + h / 2 + 1);
  ctx.restore();
}

function collFxMiniCard(rect, item, side) {
  if (!item) return;
  const known = item.type === 'enemy' ? (item.rec && item.rec.defeated > 0) : item.known;
  ctx.save();
  ctx.globalAlpha = 0.42;
  drawTabPanel(rect, '', { bg: 'rgba(20,15,40,0.80)', stroke: 'rgba(255,255,255,0.15)', radius: 14 });
  if (known) {
    if (item.type === 'enemy' && typeof drawEnemyShape === 'function') {
      drawEnemyShape({ x: rect.x + 26, y: rect.y + 26, w: rect.w - 52, h: rect.w - 52, shape: item.def.shape, hitFlash: 0 }, item.def.color || '#fff');
    } else if (item.type === 'weapon') {
      const sprId = 'weapon_' + item.def.id;
      if (typeof hasSprite === 'function' && hasSprite(sprId)) {
        drawSpriteImg(sprId, rect.x + 26, rect.y + 26, rect.w - 52, rect.w - 52);
      }
    }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.font = "bold 12px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(side === 'left' ? '◀' : '▶', rect.x + rect.w / 2, rect.y + rect.h - 16);
  ctx.restore();
}

function drawCollectionPageIdealFx() {
  const ui = drawTabBaseV2(1, '図鑑 | ←→ 切替 / Z 詳細 / ESC とじる');
  const content = ui.content;
  const rows = tabStackRows(content, [48, 58, content.h - 48 - 58 - 20], 10);
  const rowTabs = rows[0];
  const rowFilters = rows[1];
  const rowMain = rows[2];

  const subTabs = ['いきもの', 'ぶき', 'せかい'];
  const subTabW = Math.min(160, Math.floor((rowTabs.w - 20) / 3));
  const subGap = Math.max(8, Math.floor((rowTabs.w - subTabW * 3) / 4));

  for (let i = 0; i < subTabs.length; i++) {
    const x = rowTabs.x + subGap + i * (subTabW + subGap);
    collFxPill(x, rowTabs.y + 4, subTabW, 40, subTabs[i], collectionSubTab === i);
  }

  if (collectionSubTab === 2) {
    if (typeof drawWorldLoreTab === 'function') drawWorldLoreTab(rowMain);
    return;
  }

  const subKey = collectionSubTab === 0 ? 'enemy' : 'weapon';
  const filter = collectionFilter[subKey];
  const items = getFilteredItems(collectionSubTab, filter);
  const filterKeys = collectionSubTab === 0 ? ['all', 'forest', 'cave', 'flower', 'boss'] : ['all', 'tier1', 'tier2'];
  const filterLabels = collectionSubTab === 0 ? ['ALL', 'forest', 'cave', 'flower', 'boss'] : ['ALL', 'Tier1', 'Tier2'];

  let widths = [];
  let totalW = 0;
  for (let i = 0; i < filterKeys.length; i++) {
    const fw = Math.max(74, Math.min(106, 28 + filterLabels[i].length * 11));
    widths.push(fw);
    totalW += fw;
  }
  const filterGap = 8;
  totalW += filterGap * (widths.length - 1);
  let cx = rowFilters.x + 10;
  for (let i = 0; i < filterKeys.length; i++) {
    collFxPill(cx, rowFilters.y + 4, widths[i], 32, filterLabels[i], filter === filterKeys[i]);
    cx += widths[i] + filterGap;
  }

  const ownedCount = items.filter(function(it) {
    return it.type === 'enemy' ? (it.rec && it.rec.defeated > 0) : it.known;
  }).length;

  const progRect = { x: rowFilters.x + Math.max(0, totalW + 18), y: rowFilters.y, w: rowFilters.w - Math.max(0, totalW + 18), h: rowFilters.h };
  if (typeof collIdealDrawProgress === 'function') {
    collIdealDrawProgress(progRect, ownedCount, items.length);
  }

  const curIndex = collectionCursor[subKey];
  const current = items[curIndex] || null;
  const prev = curIndex > 0 ? items[curIndex - 1] : null;
  const next = curIndex < items.length - 1 ? items[curIndex + 1] : null;

  const mainRect = {
    x: rowMain.x + Math.floor((rowMain.w - 420) / 2),
    y: rowMain.y + 4,
    w: 420,
    h: rowMain.h - 8,
  };
  const miniW = 150;
  const miniH = 210;
  const miniY = rowMain.y + Math.floor((rowMain.h - miniH) / 2) + tabUiFloat(4, 1.2, 0.4);
  const leftMini = { x: mainRect.x - miniW - 18, y: miniY, w: miniW, h: miniH };
  const rightMini = { x: mainRect.x + mainRect.w + 18, y: miniY, w: miniW, h: miniH };

  collFxMiniCard(leftMini, prev, 'left');
  collFxMiniCard(rightMini, next, 'right');
  if (typeof collIdealDrawMainCard === 'function') {
    collIdealDrawMainCard(mainRect, current);
  }
  drawTabUiSelectionGlow(mainRect, '#ffd700', 0.18 + tabUiPulse(0.02, 0.10, 2.2, 0.2));
  drawTabUiSparkles(mainRect, 14, ['#ffd700', '#fff', '#a78bfa']);

  if (collectionDetailOpen && current && typeof drawCollectionDetail === 'function') {
    drawCollectionDetail(ctx, current);
  }
}
