// ===== js/weapon_collection_ui.js (Adventure Notebook) =====
function drawWeaponCollection() {
  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  const bookW = CW * 0.9, bookH = CH * 0.85;
  const bookX = (CW - bookW) / 2, bookY = (CH - bookH) / 2 + 20;

  ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, CW, CH);
  if (typeof drawNotebookBase === 'function') {
    drawNotebookBase(ctx, bookX, bookY, bookW, bookH, '📖 みぷりんの冒険記録 — ずかん');
  }
  ctx.fillStyle = '#3e2723'; ctx.font = "bold 20px 'M PLUS Rounded 1c'";
  ctx.fillText('発見したアイテムを記録中...', bookX + 50, bookY + 100);
}
