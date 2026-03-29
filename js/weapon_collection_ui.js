function drawWeaponCollection() {
  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  const bookW = Math.min(CW * 0.9, 1000), bookH = Math.min(CH * 0.85, 700);
  const bookX = (CW - bookW) / 2, bookY = (CH - bookH) / 2 + 20;
  ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, CW, CH);
  if (typeof drawNotebookBase === 'function') {
    drawNotebookBase(ctx, bookX, bookY, bookW, bookH, '📖 みぷりんの図鑑 — アイテム記録');
  }
  const tCol = '#3e2723';
  ctx.fillStyle = tCol; ctx.font = "bold " + (20*_M) + "px 'M PLUS Rounded 1c'";
  ctx.fillText('これまでに出会った装備やアイテムがここに並びます...', bookX + 60, bookY + 110);
}
