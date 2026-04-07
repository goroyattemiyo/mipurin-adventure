// ===== js/tab_page_equip.js =====
// Wrapper layer for equip tab

function drawEquipPageWithBase() {
  const ui = drawTabBase(2);
  if (!ui || !ui.content) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(ui.content.x, ui.content.y, ui.content.w, ui.content.h);
  ctx.clip();

  if (typeof drawEquipTab === 'function') {
    drawEquipTab(ui.content.x, ui.content.y, ui.content.w, ui.content.h);
  }

  ctx.restore();
}
