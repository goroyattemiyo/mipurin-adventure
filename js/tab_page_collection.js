// ===== js/tab_page_collection.js =====
// Wrapper layer for collection tab (encyclopedia)

function drawCollectionPageWithBase() {
  const ui = drawTabBase(1);
  if (!ui || !ui.content) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(ui.content.x, ui.content.y, ui.content.w, ui.content.h);
  ctx.clip();

  if (typeof drawCollectionTab === 'function') {
    drawCollectionTab();
  }

  ctx.restore();
}
