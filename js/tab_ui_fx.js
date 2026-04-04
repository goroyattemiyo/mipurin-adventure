// ===== js/tab_ui_fx.js =====

function tabUiTime() {
  return Date.now() / 1000;
}

function tabUiPulse(minV, maxV, speed, offset) {
  const t = tabUiTime() * (speed || 1) + (offset || 0);
  const m = (Math.sin(t) + 1) / 2;
  return minV + (maxV - minV) * m;
}

function tabUiFloat(amount, speed, offset) {
  return Math.sin(tabUiTime() * (speed || 1) + (offset || 0)) * (amount || 6);
}

function drawTabUiSelectionGlow(rect, color, alphaMul) {
  ctx.save();
  ctx.globalAlpha = alphaMul || 0.35;
  ctx.shadowColor = color || '#ffd700';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = color || '#ffd700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.w, rect.h, 14);
  ctx.stroke();
  ctx.restore();
}

function drawTabUiSparkles(rect, count, palette) {
  const colors = palette || ['#ffd700', '#fff', '#f9a8d4'];
  const t = tabUiTime();
  ctx.save();
  for (let i = 0; i < (count || 12); i++) {
    const x = rect.x + ((i * 97 + Math.sin(t + i) * 25) % Math.max(20, rect.w));
    const y = rect.y + ((i * 61 + Math.cos(t * 0.8 + i * 2) * 18) % Math.max(20, rect.h));
    const r = 1.6 + (Math.sin(t * 2 + i) + 1) * 1.2;
    ctx.globalAlpha = 0.24 + ((Math.sin(t * 2.4 + i) + 1) / 2) * 0.26;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
