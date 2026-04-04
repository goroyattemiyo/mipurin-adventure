// ===== js/tab_page_items.js =====
// Wrapper layer: existing inventory items UI rendered inside unified content rect.

function drawItemsPageWithBase() {
  const ui = drawTabBase(0);
  if (!ui || !ui.content) return;

  // Temporarily reuse existing implementation inside constrained rect
  ctx.save();
  ctx.beginPath();
  ctx.rect(ui.content.x, ui.content.y, ui.content.w, ui.content.h);
  ctx.clip();

  if (typeof drawInventoryItems === 'function') {
    drawInventoryItems();
  }

  ctx.restore();
}
