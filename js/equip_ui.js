// ===== EQUIPMENT UI MODULE (v6.18 Two-Pane) =====
let equipCursor = 0;       // 0=main, 1=sub, 2=charm (left pane slots)
let equipListCursor = 0;   // right pane list index
let equipMode = 'slot';    // 'slot' or 'list'
let equipSlotRects = [];
let equipBounce = 0;
let equipPetals = [];
const EQUIP_SLOT_COUNT = 3; // main, sub, charm

function spawnEquipPetal() {
  if (equipPetals.length >= 12) return;
  equipPetals.push({ x: Math.random() * 600, y: -10, r: Math.random() * Math.PI * 2,
    speed: 12 + Math.random() * 18, drift: (Math.random() - 0.5) * 25, size: 3 + Math.random() * 4,
    alpha: 0.2 + Math.random() * 0.25, color: ['#ffb7c5','#ffd700','#fff0f5','#f8bbd0'][Math.floor(Math.random()*4)] });
}
function updateEquipPetals(dt) {
  for (let i = equipPetals.length - 1; i >= 0; i--) {
    const p = equipPetals[i]; p.y += p.speed * dt; p.x += p.drift * dt; p.r += dt;
    if (p.y > 500) equipPetals.splice(i, 1);
  }
  if (Math.random() < 0.12) spawnEquipPetal();
}

// Get all weapons player owns (equipped + backpack)
function getAllOwnedWeapons() {
  const list = [];
  if (player.weapons[0]) list.push({ w: player.weapons[0], src: 'main', idx: 0 });
  if (player.weapons[1]) list.push({ w: player.weapons[1], src: 'sub', idx: 1 });
  for (let i = 0; i < player.backpack.length; i++) {
    if (player.backpack[i]) list.push({ w: player.backpack[i], src: 'bp', idx: i });
  }
  return list;
}

// Get currently selected slot's weapon
function getSlotWeapon(slotIdx) {
  if (slotIdx === 0) return player.weapons[0];
  if (slotIdx === 1) return player.weapons[1];
  if (slotIdx === 2) return null; // charm: not yet
  return null;
}

function drawEquipTab(panelX, panelY, panelW, panelH) {
  ctx.save();
  const dt = 1/60;
  updateEquipPetals(dt);
  equipBounce = Math.max(0, equipBounce - dt * 4);
  const F = "'M PLUS Rounded 1c', sans-serif";

  // --- Background ---
  const grad = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
  grad.addColorStop(0, 'rgba(26,10,46,0.93)'); grad.addColorStop(1, 'rgba(45,27,78,0.93)');
  ctx.fillStyle = grad; ctx.fillRect(panelX, panelY, panelW, panelH);
  // Stars
  for (let i = 0; i < 15; i++) {
    const sx = panelX + (i * 137 + 50) % panelW, sy = panelY + (i * 97 + 30) % (panelH - 40);
    ctx.fillStyle = 'rgba(255,255,200,' + (0.15 + Math.sin(Date.now()/1000 + i) * 0.1) + ')';
    ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  // Petals
  for (const p of equipPetals) {
    ctx.save(); ctx.globalAlpha = p.alpha; ctx.translate(panelX + p.x, panelY + p.y); ctx.rotate(p.r);
    ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // --- Title + pollen ---
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 24px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\uD83C\uDF38 \u305D\u3046\u3073 \uD83C\uDF38', panelX + panelW/2, panelY + 30);
  ctx.fillStyle = '#f8bbd0'; ctx.font = '14px ' + F;
  ctx.fillText('\uD83C\uDF3C ' + pollen, panelX + panelW/2, panelY + 48);

  // ========== LEFT PANE: Character + Equip Slots ==========
  const leftW = Math.floor(panelW * 0.45);
  const leftX = panelX + 10;
  const leftY = panelY + 60;

  // Character
  const mipSize = Math.min(leftW * 0.55, 160);
  const mipX = leftX + (leftW - mipSize) / 2;
  const mipY = leftY + 5;
  const bob = Math.sin(Date.now() / 600) * 3;
  const bounce = equipBounce > 0 ? Math.sin(equipBounce * Math.PI) * 6 : 0;
  // Glow
  ctx.save(); ctx.globalAlpha = 0.1;
  const glowGrad = ctx.createRadialGradient(mipX + mipSize/2, mipY + mipSize/2, 0, mipX + mipSize/2, mipY + mipSize/2, mipSize * 0.55);
  glowGrad.addColorStop(0, '#ffd700'); glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.beginPath(); ctx.arc(mipX + mipSize/2, mipY + mipSize/2, mipSize * 0.55, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (typeof mipurinReady !== 'undefined' && mipurinReady) {
    ctx.save(); ctx.globalAlpha = 0.95;
    const mf = MIPURIN_FRAMES['down'];
    ctx.drawImage(mipurinImg, mf.sx, mf.sy, mf.sw, mf.sh, mipX, mipY + bob - bounce, mipSize, mipSize);
    ctx.restore();
  } else {
    ctx.fillStyle = '#ffd700'; ctx.font = (mipSize * 0.45) + 'px ' + F; ctx.textAlign = 'center';
    ctx.fillText('\uD83D\uDC1D', mipX + mipSize/2, mipY + mipSize * 0.6 + bob - bounce);
  }

  // --- Equipment Slots (below character) ---
  const slotLabels = ['\u30E1\u30A4\u30F3', '\u30B5\u30D6', '\uD83D\uDD2E\u30C1\u30E3\u30FC\u30E0'];
  const slotColors = ['#ffd700', '#87ceeb', '#e056fd'];
  const slotW = Math.min(leftW - 20, 280);
  const slotH = 54;
  const slotStartY = mipY + mipSize + 12;
  equipSlotRects = [];

  for (let i = 0; i < 3; i++) {
    const sx = leftX + (leftW - slotW) / 2;
    const sy = slotStartY + i * (slotH + 8);
    const selected = equipMode === 'slot' && equipCursor === i;
    equipSlotRects.push({ id: i === 0 ? 'main' : i === 1 ? 'sub' : 'charm', x: sx, y: sy, w: slotW, h: slotH });

    // Slot background
    ctx.fillStyle = selected ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    const r = 8;
    ctx.moveTo(sx+r, sy); ctx.lineTo(sx+slotW-r, sy); ctx.arcTo(sx+slotW, sy, sx+slotW, sy+r, r);
    ctx.lineTo(sx+slotW, sy+slotH-r); ctx.arcTo(sx+slotW, sy+slotH, sx+slotW-r, sy+slotH, r);
    ctx.lineTo(sx+r, sy+slotH); ctx.arcTo(sx, sy+slotH, sx, sy+slotH-r, r);
    ctx.lineTo(sx, sy+r); ctx.arcTo(sx, sy, sx+r, sy, r);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = selected ? slotColors[i] : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = selected ? 2.5 : 1; ctx.stroke();

    // Selection arrow
    if (selected) {
      ctx.fillStyle = slotColors[i]; ctx.font = 'bold 16px ' + F; ctx.textAlign = 'left';
      ctx.fillText('\u25B6', sx + 4, sy + slotH/2 + 6);
    }

    const w = getSlotWeapon(i);
    ctx.textAlign = 'left';

    if (i < 2 && w) {
      // Weapon icon (sprite)
      const iconSize = 40;
      const iconX = sx + 22, iconY = sy + (slotH - iconSize) / 2;
      const spriteId = 'weapon_' + w.id;
      if (typeof hasSprite === 'function' && hasSprite(spriteId)) {
        drawSpriteImg(spriteId, iconX, iconY, iconSize, iconSize);
      } else {
        ctx.fillStyle = '#fff'; ctx.font = '26px ' + F; ctx.textAlign = 'center';
        const emoji = w.name.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF][\uFE0F\u20E3]?|^./);
        ctx.fillText(emoji ? emoji[0] : '\u2694', iconX + iconSize/2, iconY + iconSize/2 + 8);
        ctx.textAlign = 'left';
      }
      // Name + level
      ctx.fillStyle = '#fff'; ctx.font = 'bold 15px ' + F;
      ctx.fillText(w.name, sx + 68, sy + 22);
      ctx.fillStyle = '#ffd700'; ctx.font = '12px ' + F;
      const lvl = w.level || 0;
      ctx.fillText('\u2B50'.repeat(lvl) + '\u25CB'.repeat(WEAPON_UPGRADE_MAX - lvl) + '  ATK ' + w.dmgMul.toFixed(1), sx + 68, sy + 40);
      // Label
      ctx.fillStyle = slotColors[i]; ctx.font = '10px ' + F; ctx.textAlign = 'right';
      ctx.fillText(slotLabels[i], sx + slotW - 8, sy + 14);
      ctx.textAlign = 'left';
    } else if (i === 2) {
      // Charm slot (locked)
      ctx.save(); ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#888'; ctx.font = '14px ' + F;
      ctx.fillText('  \uD83D\uDD2E \u30C1\u30E3\u30FC\u30E0 (???)', sx + 22, sy + slotH/2 + 5);
      ctx.restore();
      ctx.fillStyle = '#e056fd'; ctx.font = '10px ' + F; ctx.textAlign = 'right';
      ctx.fillText(slotLabels[i], sx + slotW - 8, sy + 14);
      ctx.textAlign = 'left';
    } else {
      ctx.fillStyle = '#555'; ctx.font = '14px ' + F;
      ctx.fillText('  \u2795 \u7A7A\u304D\u30B9\u30ED\u30C3\u30C8', sx + 22, sy + slotH/2 + 5);
      ctx.fillStyle = slotColors[i]; ctx.font = '10px ' + F; ctx.textAlign = 'right';
      ctx.fillText(slotLabels[i], sx + slotW - 8, sy + 14);
      ctx.textAlign = 'left';
    }
  }

  // ========== RIGHT PANE: Weapon List ==========
  const rightX = panelX + leftW + 20;
  const rightY = panelY + 60;
  const rightW = panelW - leftW - 35;
  const rightH = panelH - 90;

  // Right pane background
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  const rr = 10;
  ctx.moveTo(rightX+rr, rightY); ctx.lineTo(rightX+rightW-rr, rightY); ctx.arcTo(rightX+rightW, rightY, rightX+rightW, rightY+rr, rr);
  ctx.lineTo(rightX+rightW, rightY+rightH-rr); ctx.arcTo(rightX+rightW, rightY+rightH, rightX+rightW-rr, rightY+rightH, rr);
  ctx.lineTo(rightX+rr, rightY+rightH); ctx.arcTo(rightX, rightY+rightH, rightX, rightY+rightH-rr, rr);
  ctx.lineTo(rightX, rightY+rr); ctx.arcTo(rightX, rightY, rightX+rr, rightY, rr);
  ctx.closePath(); ctx.fill();

  ctx.fillStyle = '#f8bbd0'; ctx.font = 'bold 16px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\uD83C\uDF92 \u3082\u3061\u3082\u306E\u30EA\u30B9\u30C8', rightX + rightW/2, rightY + 20);

  const allWeapons = getAllOwnedWeapons();
  const listStartY = rightY + 35;
  const rowH = 52;
  const maxVisible = Math.floor((rightH - 50) / rowH);

  if (allWeapons.length === 0) {
    ctx.fillStyle = '#666'; ctx.font = '14px ' + F;
    ctx.fillText('\u3076\u304D\u304C\u306A\u3044\u3088', rightX + rightW/2, listStartY + 40);
  }

  for (let i = 0; i < Math.min(allWeapons.length, maxVisible); i++) {
    const entry = allWeapons[i];
    const w = entry.w;
    const ry = listStartY + i * rowH;
    const listSel = equipMode === 'list' && equipListCursor === i;

    // Row background
    ctx.fillStyle = listSel ? 'rgba(255,215,0,0.12)' : (i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)');
    ctx.fillRect(rightX + 4, ry, rightW - 8, rowH - 4);
    if (listSel) {
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
      ctx.strokeRect(rightX + 4, ry, rightW - 8, rowH - 4);
    }

    // Where is it equipped?
    let badge = '';
    if (entry.src === 'main') badge = '\u30E1\u30A4\u30F3';
    else if (entry.src === 'sub') badge = '\u30B5\u30D6';
    else badge = '\u30D0\u30C3\u30AF';

    // Icon
    const icoSize = 36;
    const icoX = rightX + 10, icoY = ry + (rowH - icoSize) / 2 - 2;
    const sprId = 'weapon_' + w.id;
    if (typeof hasSprite === 'function' && hasSprite(sprId)) {
      drawSpriteImg(sprId, icoX, icoY, icoSize, icoSize);
    } else {
      ctx.fillStyle = '#fff'; ctx.font = '22px ' + F; ctx.textAlign = 'center';
      const em = w.name.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF][\uFE0F\u20E3]?|^./);
      ctx.fillText(em ? em[0] : '\u2694', icoX + icoSize/2, icoY + icoSize/2 + 7);
    }

    // Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px ' + F;
    ctx.fillText(w.name, rightX + 52, ry + 18);

    // Stats
    ctx.fillStyle = '#ffe0b2'; ctx.font = '11px ' + F;
    const lvl = w.level || 0;
    ctx.fillText('\u2B50'.repeat(lvl) + '\u25CB'.repeat(WEAPON_UPGRADE_MAX - lvl) + '  ATK ' + w.dmgMul.toFixed(1) + '  SPD ' + w.speed.toFixed(2), rightX + 52, ry + 35);

    // Badge
    ctx.textAlign = 'right';
    const badgeCol = entry.src === 'main' ? '#ffd700' : entry.src === 'sub' ? '#87ceeb' : '#aaa';
    ctx.fillStyle = badgeCol; ctx.font = '10px ' + F;
    ctx.fillText(badge, rightX + rightW - 10, ry + 16);

    // Upgrade cost if selected
    if (listSel && lvl < WEAPON_UPGRADE_MAX) {
      const cost = WEAPON_UPGRADE_COST[lvl]; const ok = pollen >= cost;
      ctx.fillStyle = ok ? '#2ecc71' : '#e74c3c'; ctx.font = 'bold 11px ' + F;
      ctx.fillText('Z:\u5F37\u5316(' + cost + '\uD83C\uDF3C)', rightX + rightW - 10, ry + rowH - 10);
    } else if (listSel && lvl >= WEAPON_UPGRADE_MAX) {
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px ' + F;
      ctx.fillText('\u2728MAX', rightX + rightW - 10, ry + rowH - 10);
    }
    ctx.textAlign = 'left';
  }

  // ========== BOTTOM: Detail + Controls ==========
  const selW = equipMode === 'list' && allWeapons[equipListCursor]
    ? allWeapons[equipListCursor].w
    : getSlotWeapon(equipCursor);

  if (selW && selW.desc) {
    ctx.fillStyle = '#ccc'; ctx.font = '12px ' + F; ctx.textAlign = 'center';
    ctx.fillText(selW.desc, panelX + panelW/2, panelY + panelH - 28);
  }

  // Controls
  ctx.fillStyle = 'rgba(248,187,208,0.5)'; ctx.font = '12px ' + F; ctx.textAlign = 'center';
  const hint = equipMode === 'slot'
    ? '\u2191\u2193:\u30B9\u30ED\u30C3\u30C8  \u2192:\u30EA\u30B9\u30C8\u3078  Z:\u5F37\u5316  Tab:\u3068\u3058\u308B'
    : '\u2191\u2193:\u3048\u3089\u3076  \u2190:\u30B9\u30ED\u30C3\u30C8\u3078  Z:\u5F37\u5316  X:\u305D\u3046\u3073  Tab:\u3068\u3058\u308B';
  ctx.fillText(hint, panelX + panelW/2, panelY + panelH - 10);

  ctx.restore();
}


// === Charm Drop Screen ===
function drawCharmDrop() {
  if (!charmPopup || !charmPopup.active) return;
  var F = "'M PLUS Rounded 1c', sans-serif";
  var c = charmPopup.charm;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, CW, CH);

  // Card
  var cx = CW/2, cy = CH/2;
  var cw = 360, ch = 320;

  // Rarity glow
  var glowCol = c.rarity === 'legend' ? '#ffd700' : c.rarity === 'rare' ? '#3498db' : '#aaa';
  ctx.save(); ctx.globalAlpha = 0.15;
  ctx.fillStyle = glowCol;
  ctx.beginPath(); ctx.arc(cx, cy - 20, 140, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Card bg (purple tint for charms)
  ctx.fillStyle = 'rgba(60, 20, 80, 0.95)';
  ctx.beginPath();
  var r = 16, x0 = cx - cw/2, y0 = cy - ch/2;
  ctx.moveTo(x0+r, y0); ctx.lineTo(x0+cw-r, y0); ctx.arcTo(x0+cw, y0, x0+cw, y0+r, r);
  ctx.lineTo(x0+cw, y0+ch-r); ctx.arcTo(x0+cw, y0+ch, x0+cw-r, y0+ch, r);
  ctx.lineTo(x0+r, y0+ch); ctx.arcTo(x0, y0+ch, x0, y0+ch-r, r);
  ctx.lineTo(x0, y0+r); ctx.arcTo(x0, y0, x0+r, y0, r);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = glowCol; ctx.lineWidth = 3; ctx.stroke();

  // Title
  ctx.fillStyle = '#e056fd'; ctx.font = 'bold 22px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\uD83D\uDD2E \u30C1\u30E3\u30FC\u30E0\u767A\u898B\uFF01', cx, y0 + 35);

  // Icon
  ctx.font = '64px ' + F;
  ctx.fillText(c.icon, cx, cy - 30);

  // Name
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px ' + F;
  ctx.fillText(c.name, cx, cy + 20);

  // Rarity
  ctx.fillStyle = glowCol; ctx.font = '16px ' + F;
  ctx.fillText(c.rarity ? c.rarity.toUpperCase() : 'COMMON', cx, cy + 45);

  // Description
  ctx.fillStyle = '#ccc'; ctx.font = '16px ' + F;
  ctx.fillText(c.desc, cx, cy + 72);

  // Current charm comparison
  if (player.charm) {
    ctx.fillStyle = '#f8bbd0'; ctx.font = '14px ' + F;
    ctx.fillText('\u73FE\u5728: ' + player.charm.icon + ' ' + player.charm.name, cx, cy + 100);
    ctx.fillStyle = '#ffab91'; ctx.font = '12px ' + F;
    ctx.fillText('\u2192 \u4E0A\u66F8\u304D\u3055\u308C\u307E\u3059', cx, cy + 118);
  }

  // Controls
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 18px ' + F;
  ctx.fillText('Z: \u305D\u3046\u3073\u3059\u308B', cx, y0 + ch - 45);
  ctx.fillStyle = '#aaa'; ctx.font = '16px ' + F;
  ctx.fillText('X: \u898B\u9001\u308B', cx, y0 + ch - 20);

  ctx.textAlign = 'left';
}
