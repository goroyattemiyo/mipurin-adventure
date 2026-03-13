// ===== EQUIPMENT UI MODULE =====
// Equipment tab: slots, backpack, upgrade, petals, drag-and-drop
let equipCursor = 0;
let equipSlotRects = [];
const EQUIP_TOTAL_SLOTS = 6;
let equipBounce = 0;
let equipPetals = [];
function spawnEquipPetal() {
  if (equipPetals.length >= 15) return;
  equipPetals.push({ x: Math.random() * 500, y: -10, r: Math.random() * Math.PI * 2,
    speed: 15 + Math.random() * 20, drift: (Math.random() - 0.5) * 30, size: 4 + Math.random() * 4,
    alpha: 0.3 + Math.random() * 0.3, color: ['#ffb7c5','#ffd700','#fff0f5','#f8bbd0'][Math.floor(Math.random()*4)] });
}
function updateEquipPetals(dt) {
  for (let i = equipPetals.length - 1; i >= 0; i--) {
    const p = equipPetals[i]; p.y += p.speed * dt; p.x += p.drift * dt; p.r += dt;
    if (p.y > 500) equipPetals.splice(i, 1);
  }
  if (Math.random() < 0.15) spawnEquipPetal();
}
function drawEquipTab(panelX, panelY, panelW, panelH) {
  ctx.save();
  const dt = 1/60;
  updateEquipPetals(dt);
  equipBounce = Math.max(0, equipBounce - dt * 4);
  const cx = panelX + panelW / 2;
  const F = "'M PLUS Rounded 1c', sans-serif";
  const grad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
  grad.addColorStop(0, 'rgba(26,10,46,0.92)'); grad.addColorStop(1, 'rgba(45,27,78,0.92)');
  ctx.fillStyle = grad; ctx.fillRect(panelX, panelY, panelW, panelH);
  for (let i = 0; i < 20; i++) {
    const sx = panelX + (i * 137 + 50) % panelW, sy = panelY + (i * 97 + 30) % (panelH - 40);
    ctx.fillStyle = 'rgba(255,255,200,' + (0.15 + Math.sin(Date.now()/1000 + i) * 0.1) + ')';
    ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  for (const p of equipPetals) {
    ctx.save(); ctx.globalAlpha = p.alpha; ctx.translate(panelX + p.x, panelY + p.y); ctx.rotate(p.r);
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 26px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\uD83C\uDF38 \u30DF\u30D7\u30EA\u30F3\u306E\u305D\u3046\u3073 \uD83C\uDF38', cx, panelY + 32);
  ctx.fillStyle = '#f8bbd0'; ctx.font = '16px ' + F;
  ctx.fillText('\uD83C\uDF3C\u82B1\u7C89: ' + pollen, cx, panelY + 55);
  const mipX = panelX + 30, mipY = panelY + 80;
  const bob = Math.sin(Date.now() / 600) * 4;
  const bounce = equipBounce > 0 ? Math.sin(equipBounce * Math.PI) * 8 : 0;
  if (typeof mipurinReady !== 'undefined' && mipurinReady) {
    ctx.save(); ctx.globalAlpha = 0.95;
    const mf = MIPURIN_FRAMES['down'];
    ctx.drawImage(mipurinImg, mf.sx, mf.sy, mf.sw, mf.sh, mipX, mipY + bob - bounce, 120, 120);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ffd700'; ctx.font = '60px ' + F; ctx.textAlign = 'center';
    ctx.fillText('\uD83D\uDC1D', mipX + 60, mipY + 75 + bob - bounce);
  }
  function drawSlotHex(sx, sy, sw, sh, selected) {
    const hcx = sx + sw/2, hcy = sy + sh/2, hr = Math.min(sw, sh)/2;
    ctx.beginPath();
    for (let a = 0; a < 6; a++) { const ang = Math.PI/6 + a * Math.PI/3; const px = hcx + Math.cos(ang)*hr; const py = hcy + Math.sin(ang)*hr; a===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py); }
    ctx.closePath();
    ctx.fillStyle = selected ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'; ctx.fill();
    if (selected) { ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3 + Math.sin(Date.now()/200)*0.8; }
    else { ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1; }
    ctx.stroke();
    if (selected) { ctx.save(); ctx.globalAlpha = 0.08 + Math.sin(Date.now()/300)*0.04; ctx.fillStyle = '#ffd700'; ctx.fill(); ctx.restore(); }
  }
  function drawConnector(sx, sy, tx, ty, color) {
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(sx, sy);
    const mx = (sx + tx) / 2 + (ty - sy) * 0.15, my = (sy + ty) / 2;
    ctx.quadraticCurveTo(mx, my, tx, ty); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#2ecc71'; ctx.font = '10px ' + F; ctx.textAlign = 'center';
    ctx.globalAlpha = 0.7; ctx.fillText('\uD83C\uDF3F', mx, my);
    ctx.restore();
  }
  const mainSlot = { x: mipX + 140, y: mipY, w: 110, h: 70 };
  const subSlot = { x: mipX + 140, y: mipY + 90, w: 110, h: 70 };
  const charmSlot = { x: mipX + 140, y: mipY + 180, w: 90, h: 60 };
  const bpBaseX = panelX + panelW - 200, bpBaseY = mipY + 10;
  equipSlotRects = [
    { id:'main', x:mainSlot.x, y:mainSlot.y, w:mainSlot.w, h:mainSlot.h },
    { id:'sub', x:subSlot.x, y:subSlot.y, w:subSlot.w, h:subSlot.h },
    { id:'bp0', x:bpBaseX, y:bpBaseY+5, w:66, h:70 },
    { id:'bp1', x:bpBaseX+72, y:bpBaseY+5, w:66, h:70 },
    { id:'bp2', x:bpBaseX, y:bpBaseY+83, w:66, h:70 },
    { id:'bp3', x:bpBaseX+72, y:bpBaseY+83, w:66, h:70 }
  ];
  drawSlotHex(mainSlot.x, mainSlot.y, mainSlot.w, mainSlot.h, equipCursor === 0);
  drawSlotHex(subSlot.x, subSlot.y, subSlot.w, subSlot.h, equipCursor === 1);
    if (equipCursor === 0) drawConnector(mipX + 120, mipY + 30, mainSlot.x, mainSlot.y + mainSlot.h/2, '#ffd700');
    if (equipCursor === 1) drawConnector(mipX + 120, mipY + 80, subSlot.x, subSlot.y + subSlot.h/2, '#87ceeb');
  function drawWeaponInSlot(w, sx, sy, sw, sh, label, isActive) {
    ctx.textAlign = 'center';
    ctx.fillStyle = isActive ? '#ffd700' : '#888'; ctx.font = 'bold 11px ' + F;
    ctx.fillText(label, sx + sw/2, sy + 14);
    if (w) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 14px ' + F;
      ctx.fillText((w.icon||'\u2694') + ' ' + w.name, sx + sw/2, sy + 34);
      const lvl = w.level || 0;
      ctx.fillStyle = '#ffd700'; ctx.font = '12px ' + F;
      ctx.fillText('\u2B50'.repeat(lvl) + '\u25CB'.repeat(WEAPON_UPGRADE_MAX - lvl), sx + sw/2, sy + 52);
      ctx.fillStyle = '#ccc'; ctx.font = '11px ' + F;
      ctx.fillText('ATK:' + w.dmgMul.toFixed(1), sx + sw/2, sy + 68);
    } else {
      ctx.fillStyle = '#555'; ctx.font = '12px ' + F;
      ctx.fillText('--- \u7A7A ---', sx + sw/2, sy + 40);
    }
  }
  drawWeaponInSlot(player.weapons[0], mainSlot.x, mainSlot.y, mainSlot.w, mainSlot.h, '\u30E1\u30A4\u30F3', player.weaponIdx === 0);
  drawWeaponInSlot(player.weapons[1], subSlot.x, subSlot.y, subSlot.w, subSlot.h, '\u30B5\u30D6', player.weaponIdx === 1);
  ctx.save(); ctx.globalAlpha = 0.4;
  drawSlotHex(charmSlot.x, charmSlot.y, charmSlot.w, charmSlot.h, false);
  ctx.fillStyle = '#888'; ctx.font = '12px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\uD83D\uDD2E ???', charmSlot.x + charmSlot.w/2, charmSlot.y + charmSlot.h/2 + 4);
  ctx.restore();
  ctx.fillStyle = '#f8bbd0'; ctx.font = 'bold 16px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\uD83C\uDF6F \u30D0\u30C3\u30AF\u30D1\u30C3\u30AF', bpBaseX + 65, bpBaseY - 5);
  for (let i = 0; i < 4; i++) {
    const col = i % 2, row = Math.floor(i / 2);
    const sx = bpBaseX + col * 72, sy = bpBaseY + 5 + row * 78;
    const sel = equipCursor === i + 2;
    drawSlotHex(sx, sy, 66, 70, sel);
      if (sel) drawConnector(mipX + 100, mipY + 60, sx, sy + 35, '#f8bbd0');
    const w = player.backpack[i];
    ctx.textAlign = 'center';
    if (w) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 12px ' + F;
      ctx.fillText((w.icon||'\u2694'), sx + 33, sy + 28);
      ctx.fillStyle = '#ddd'; ctx.font = '10px ' + F;
      ctx.fillText(w.name.substring(0,5), sx + 33, sy + 44);
      const lvl = w.level || 0;
      ctx.fillStyle = '#ffd700'; ctx.font = '10px ' + F;
      ctx.fillText('\u2B50'.repeat(lvl), sx + 33, sy + 58);
    } else {
      ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = '#f8bbd0'; ctx.font = '24px sans-serif';
      ctx.fillText('\uD83C\uDF38', sx + 33, sy + 42); ctx.restore();
    }
  }
  const detX = panelX + 15, detY = panelY + panelH - 195, detW = 175, detH = 175;
  const selW = equipCursor < 2 ? player.weapons[equipCursor] : player.backpack[equipCursor - 2];
  ctx.fillStyle = 'rgba(255,240,245,0.08)'; ctx.fillRect(detX, detY, detW, detH);
  ctx.strokeStyle = 'rgba(248,187,208,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(detX, detY, detW, detH);
  if (selW) {
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 16px ' + F; ctx.textAlign = 'center';
    ctx.fillText((selW.icon||'\u2694') + ' ' + selW.name, detX + detW/2, detY + 22);
    ctx.fillStyle = '#f8bbd0'; ctx.font = '13px ' + F;
    ctx.fillText('Lv.' + (selW.level||0) + ' / ' + WEAPON_UPGRADE_MAX, detX + detW/2, detY + 42);
    ctx.fillStyle = '#ffe0b2'; ctx.font = '13px ' + F;
    ctx.fillText('\u2694 ATK\u500D\u7387: ' + selW.dmgMul.toFixed(1), detX + detW/2, detY + 64);
    ctx.fillText('\u26A1 \u901F\u5EA6: ' + selW.speed.toFixed(2), detX + detW/2, detY + 82);
    ctx.fillText('\uD83C\uDFAF \u7BC4\u56F2: ' + selW.range, detX + detW/2, detY + 100);
    if (selW.desc) { ctx.fillStyle = '#ccc'; ctx.font = '11px ' + F; ctx.fillText(selW.desc.substring(0,16), detX + detW/2, detY + 120); }
    const lvl = selW.level || 0;
    if (lvl < WEAPON_UPGRADE_MAX) {
      const cost = WEAPON_UPGRADE_COST[lvl]; const ok = pollen >= cost;
      ctx.fillStyle = ok ? 'rgba(46,204,113,0.2)' : 'rgba(255,100,100,0.12)';
      const btnY = detY + 132; ctx.fillRect(detX+8, btnY, detW-16, 28);
      ctx.strokeStyle = ok ? '#2ecc71' : '#e74c3c'; ctx.lineWidth = 2; ctx.strokeRect(detX+8, btnY, detW-16, 28);
      ctx.fillStyle = ok ? '#2ecc71' : '#e74c3c'; ctx.font = 'bold 13px ' + F;
      ctx.fillText('Z: \u5F37\u5316 (\uD83C\uDF3C' + cost + ')', detX + detW/2, btnY + 19);
    } else {
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 13px ' + F;
      ctx.fillText('\u2728 \u6700\u5927\u5F37\u5316\u6E08 \u2728', detX + detW/2, detY + 148);
    }
  } else {
    ctx.fillStyle = '#888'; ctx.font = '14px ' + F; ctx.textAlign = 'center';
    ctx.fillText('\u2190 \u30B9\u30ED\u30C3\u30C8\u3092\u3048\u3089\u3093\u3067\u306D', detX + detW/2, detY + 70);
  }
  ctx.fillStyle = '#f8bbd0'; ctx.font = '15px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\u2191\u2193:\u3048\u3089\u3076  Z:\u5F37\u5316  X:\u3044\u308C\u304B\u3048  Tab:\u3068\u3058\u308B', cx, panelY + panelH - 10);
  if (mouse.dragItem && typeof touchActive !== 'undefined' && !touchActive) {
    for (let si = 0; si < equipSlotRects.length; si++) {
      if (si === mouse.dragFrom) { ctx.save(); ctx.globalAlpha = 0.3; const ds = equipSlotRects[si]; ctx.fillStyle = '#000'; ctx.fillRect(ds.x, ds.y, ds.w, ds.h); ctx.restore(); continue; }
      const ds = equipSlotRects[si]; const hx = mouse.x >= ds.x && mouse.x <= ds.x+ds.w && mouse.y >= ds.y && mouse.y <= ds.y+ds.h;
      if (hx) { ctx.strokeStyle = '#2ecc71'; ctx.lineWidth = 3; ctx.strokeRect(ds.x-2, ds.y-2, ds.w+4, ds.h+4); }
    }
    ctx.save(); ctx.globalAlpha = 0.75;
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(mouse.x - 50, mouse.y - 15, 100, 30);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(mouse.x - 50, mouse.y - 15, 100, 30);
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px ' + F; ctx.textAlign = 'center';
    ctx.fillText((mouse.dragItem.icon||'\u2694') + ' ' + mouse.dragItem.name, mouse.x, mouse.y + 5);
    ctx.restore();
  }
  ctx.restore();
}
