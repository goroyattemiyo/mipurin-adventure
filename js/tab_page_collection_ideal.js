// ===== js/tab_page_collection_ideal.js =====
// Idealized encyclopedia page built on top of tab_ui_base.js
// Goal: 3-row layout inside shared content rect
//   row1: sub tabs
//   row2: filters + progress
//   row3: featured carousel card area

function collIdealPill(x, y, w, h, label, active) {
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

function collIdealDrawProgress(rect, ownedCount, totalCount) {
  const ratio = totalCount > 0 ? (ownedCount / totalCount) : 0;
  const barW = Math.min(420, rect.w - 20);
  const barH = 12;
  const barX = rect.x + Math.floor((rect.w - barW) / 2);
  const barY = rect.y + 6;

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 999);
  ctx.fill();

  ctx.fillStyle = '#7ecf6a';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW * ratio, barH, 999);
  ctx.fill();

  const pct = totalCount > 0 ? Math.floor(ratio * 100) : 0;
  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.font = "13px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(ownedCount + ' / ' + totalCount + ' (' + pct + '%)', rect.x + rect.w / 2, barY + 16);
  ctx.restore();
}

function collIdealDrawMainCard(rect, item) {
  const known = item && (item.type === 'enemy' ? (item.rec && item.rec.defeated > 0) : item.known);
  const rarCol = !item ? '#888'
    : item.type === 'weapon' && item.def.tier === 2 ? '#ffd700'
    : item.type === 'weapon' ? '#cd7f32'
    : item.type === 'enemy' && item.def.color ? item.def.color
    : '#888';

  ctx.save();
  drawTabPanel(rect, '', { bg: 'rgba(28,20,48,0.96)', stroke: rarCol, radius: 18 });

  const inner = tabInsetRect(rect, 20);
  const spriteBox = {
    x: inner.x + Math.floor((inner.w - 200) / 2),
    y: inner.y + 8,
    w: 200,
    h: 200,
  };

  // glow
  const glow = ctx.createRadialGradient(
    spriteBox.x + spriteBox.w / 2,
    spriteBox.y + spriteBox.h / 2,
    0,
    spriteBox.x + spriteBox.w / 2,
    spriteBox.y + spriteBox.h / 2,
    120
  );
  glow.addColorStop(0, 'rgba(255,215,0,0.16)');
  glow.addColorStop(1, 'rgba(255,215,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(spriteBox.x + spriteBox.w / 2, spriteBox.y + spriteBox.h / 2, 120, 0, Math.PI * 2);
  ctx.fill();

  if (!item) {
    ctx.fillStyle = '#666';
    ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('データなし', rect.x + rect.w / 2, rect.y + rect.h / 2);
    ctx.restore();
    return;
  }

  if (known) {
    if (item.type === 'enemy') {
      if (typeof hasSprite === 'function' && hasSprite(item.def.shape)) {
        drawSpriteImg(item.def.shape, spriteBox.x + 36, spriteBox.y + 20, 128, 128);
      } else if (typeof drawEnemyShape === 'function') {
        drawEnemyShape({ x: spriteBox.x + 36, y: spriteBox.y + 20, w: 128, h: 128, shape: item.def.shape, hitFlash: 0 }, item.def.color || '#fff');
      }
    } else {
      const sprId = 'weapon_' + item.def.id;
      if (typeof hasSprite === 'function' && hasSprite(sprId)) {
        drawSpriteImg(sprId, spriteBox.x + 36, spriteBox.y + 20, 128, 128);
      } else {
        ctx.fillStyle = item.def.color || '#fff';
        ctx.font = "bold 96px 'M PLUS Rounded 1c', sans-serif";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.def.icon || '⚔', spriteBox.x + spriteBox.w / 2, spriteBox.y + spriteBox.h / 2);
      }
    }
  } else {
    ctx.save();
    ctx.globalAlpha = 0.3;
    if (item.type === 'enemy' && typeof drawEnemyShape === 'function') {
      drawEnemyShape({ x: spriteBox.x + 36, y: spriteBox.y + 20, w: 128, h: 128, shape: item.def.shape, hitFlash: 99 }, '#222');
    } else {
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.roundRect(spriteBox.x + 36, spriteBox.y + 20, 128, 128, 16);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#777';
    ctx.font = "bold 42px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText('?', spriteBox.x + spriteBox.w / 2, spriteBox.y + spriteBox.h / 2 + 16);
  }

  const name = !known
    ? '???'
    : item.type === 'enemy'
      ? ((typeof getVariantName === 'function' && getVariantName(item.def.shape, item.loop)) || item.def.name)
      : (item.def.name || '').replace(/^[\uD800-\uDBFF][\uDC00-\uDFFF][\uFE0F\u20E3]?\s*/, '');

  ctx.fillStyle = known ? rarCol : '#777';
  ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(name, rect.x + rect.w / 2, inner.y + 250);

  const lore = !known
    ? 'まだ見つかっていません'
    : item.type === 'enemy'
      ? ((item.rec && item.rec.defeated > 0) ? 'みつけた敵の記録です' : '未発見')
      : (item.def.desc || item.def.flavor || '武器の記録です');

  const maxW = inner.w - 40;
  let lines = [];
  let cur = '';
  ctx.fillStyle = '#ddd';
  ctx.font = "16px 'M PLUS Rounded 1c', sans-serif";
  for (const ch of lore.split('')) {
    const test = cur + ch;
    if (ctx.measureText(test).width > maxW && cur.length > 0) {
      lines.push(cur);
      cur = ch;
      if (lines.length >= 2) break;
    } else {
      cur = test;
    }
  }
  if (cur && lines.length < 2) lines.push(cur);
  if (lines.length === 2 && lines.join('').length < lore.length) {
    while (lines[1].length > 0 && ctx.measureText(lines[1] + '…').width > maxW) {
      lines[1] = lines[1].slice(0, -1);
    }
    lines[1] += '…';
  }
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], rect.x + rect.w / 2, inner.y + 284 + i * 22);
  }

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = "14px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText((typeof touchActive !== 'undefined' && touchActive) ? '左右タップで切替 / タップで詳細' : '←→ で切替 / Z で詳細', rect.x + rect.w / 2, rect.y + rect.h - 18);
  ctx.restore();
}

function drawCollectionPageIdeal() {
  const ui = drawTabBase(1);
  const content = ui.content;
  const gap = 10;

  const rows = tabStackRows(content, [48, 58, content.h - 48 - 58 - gap * 2], gap);
  const rowTabs = rows[0];
  const rowFilters = rows[1];
  const rowMain = rows[2];

  const subTabs = ['いきもの', 'ぶき', 'せかい'];
  const subTabW = Math.min(160, Math.floor((rowTabs.w - 20) / 3));
  const subGap = Math.max(8, Math.floor((rowTabs.w - subTabW * 3) / 4));

  for (let i = 0; i < subTabs.length; i++) {
    const x = rowTabs.x + subGap + i * (subTabW + subGap);
    collIdealPill(x, rowTabs.y + 4, subTabW, 40, subTabs[i], collectionSubTab === i);
  }

  if (collectionSubTab === 2) {
    if (typeof drawWorldLoreTab === 'function') {
      drawWorldLoreTab(rowMain);
    }
    return;
  }

  const subKey = collectionSubTab === 0 ? 'enemy' : 'weapon';
  const filter = collectionFilter[subKey];
  const items = getFilteredItems(collectionSubTab, filter);

  const filterKeys = collectionSubTab === 0
    ? ['all', 'forest', 'cave', 'flower', 'boss']
    : ['all', 'tier1', 'tier2'];
  const filterLabels = collectionSubTab === 0
    ? ['ALL', 'forest', 'cave', 'flower', 'boss']
    : ['ALL', 'Tier1', 'Tier2'];

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
    collIdealPill(cx, rowFilters.y + 4, widths[i], 32, filterLabels[i], filter === filterKeys[i]);
    cx += widths[i] + filterGap;
  }

  const ownedCount = items.filter(function(it) {
    return it.type === 'enemy' ? (it.rec && it.rec.defeated > 0) : it.known;
  }).length;

  collIdealDrawProgress({
    x: rowFilters.x + Math.max(0, totalW + 20),
    y: rowFilters.y,
    w: rowFilters.w - Math.max(0, totalW + 20),
    h: rowFilters.h,
  }, ownedCount, items.length);

  const current = items[collectionCursor[subKey]] || null;
  collIdealDrawMainCard({
    x: rowMain.x + Math.floor((rowMain.w - 420) / 2),
    y: rowMain.y + 4,
    w: 420,
    h: rowMain.h - 8,
  }, current);

  if (collectionDetailOpen && current && typeof drawCollectionDetail === 'function') {
    drawCollectionDetail(ctx, current);
  }
}
