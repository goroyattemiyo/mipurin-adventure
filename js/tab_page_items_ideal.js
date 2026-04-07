// ===== js/tab_page_items_ideal.js =====
// Idealized items page built on top of tab_ui_base.js

function drawItemsPageIdeal() {
  const ui = drawTabBase(0);
  const content = ui.content;
  const gap = 12;
  const rows = tabStackRows(content, [190, 104, content.h - 190 - 104 - 90 - gap * 3, 90], gap);
  const top = rows[0];
  const middle = rows[1];
  const lower = rows[2];
  const detail = rows[3];

  const cols = tabSplitColumns(top, 0.48, 14);
  drawInventoryStatusBlock(cols.left, ui._M);
  drawInventoryEquipSummaryBlock(cols.right, ui._M);

  const lowerCols = tabSplitColumns(lower, 0.42, 14);
  drawInventoryItemsBlock(middle, ui._M);
  drawInventoryBlessingSummaryBlock(lowerCols.left, ui._M);

  drawTabPanel(lowerCols.right, 'サマリー', { titleSize: 18 * ui._M });
  const inner = tabInsetRect(lowerCols.right, 14);
  ctx.save();
  ctx.fillStyle = '#5a4335';
  ctx.font = "bold 16px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'left';
  ctx.fillText('現在武器', inner.x, inner.y + 28);
  ctx.fillText('サブ武器', inner.x, inner.y + 58);
  ctx.fillText('チャーム', inner.x, inner.y + 88);

  ctx.fillStyle = '#2f241e';
  ctx.font = "16px 'M PLUS Rounded 1c', sans-serif";
  const mainName = player.weapons[0] ? player.weapons[0].name : '- なし -';
  const subName = player.weapons[1] ? player.weapons[1].name : '- なし -';
  const charmName = player.charm ? ((player.charm.icon || '🔮') + ' ' + player.charm.name) : '- なし -';
  ctx.fillText(mainName, inner.x + 92, inner.y + 28);
  ctx.fillText(subName, inner.x + 92, inner.y + 58);
  ctx.fillText(charmName, inner.x + 92, inner.y + 88);
  ctx.restore();

  drawInventoryDetailBlock(detail, ui._M);
}
