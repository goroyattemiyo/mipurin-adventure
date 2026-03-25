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
  if (slotIdx === 2) return player.charm || null; // charm slot
  return null;
}

function drawEquipTab(panelX, panelY, panelW, panelH) {
  ctx.save();
  const dt = 1/60;
  updateEquipPetals(dt);
  equipBounce = Math.max(0, equipBounce - dt * 4);
  const F = "'M PLUS Rounded 1c', sans-serif";
  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;

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
  const hdrH = 20 + 28*_M; // header section height
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold ' + (24*_M) + 'px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\uD83C\uDF38 \u305D\u3046\u3073 \uD83C\uDF38', panelX + panelW/2, panelY + 14*_M);
  ctx.fillStyle = '#f8bbd0'; ctx.font = (14*_M) + 'px ' + F;
  ctx.fillText('\uD83C\uDF3C ' + pollen, panelX + panelW/2, panelY + hdrH);

  // ========== LEFT PANE: Character + Equip Slots ==========
  const leftW = Math.floor(panelW * 0.45);
  const leftX = panelX + 10;
  const leftY = panelY + hdrH + 8;

  // Character — cap size so slots still fit in panel
  const maxMipSize = Math.min(leftW * 0.55, 140);
  // Reserve space: 3 slots * (slotH + gap) + some margin
  // Base slot height raised to 72 so 18px font fits on 2 lines comfortably
  const slotH = Math.min(72 * _M, Math.floor((panelH - hdrH - 40 - maxMipSize - 3 * 10) / 3));
  const mipSize = Math.min(maxMipSize, panelH - hdrH - 40 - 3 * (slotH + 10));
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
  const slotW = Math.min(leftW - 20, 320 * _M);
  const slotStartY = mipY + mipSize + 10;
  const slotGap = 6 * _M;
  // Font sizes: start at 18/14/12px (PC) or 2× (mobile), capped to slot geometry
  // Dynamic reduction via ctx.measureText is applied per-text at draw time
  const slotNameFz = Math.min(18 * _M, Math.floor(slotH * 0.30));
  const slotStatFz = Math.min(14 * _M, Math.floor(slotH * 0.22));
  const slotLabelFz = Math.min(12 * _M, Math.floor(slotH * 0.18));
  const iconSize = Math.min(44 * _M, slotH - 8);
  equipSlotRects = [];

  for (let i = 0; i < 3; i++) {
    const sx = leftX + (leftW - slotW) / 2;
    const sy = slotStartY + i * (slotH + slotGap);
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
      ctx.fillStyle = slotColors[i]; ctx.font = 'bold ' + (16*_M) + 'px ' + F; ctx.textAlign = 'left';
      ctx.fillText('\u25B6', sx + 4, sy + slotH/2 + 6*_M);
    }

    // Label tag (top-right of slot) — measure label width to define reserved zone
    ctx.fillStyle = slotColors[i]; ctx.font = slotLabelFz + 'px ' + F; ctx.textAlign = 'right';
    ctx.fillText(slotLabels[i], sx + slotW - 6, sy + slotLabelFz + 4);
    ctx.textAlign = 'left';
    // Reserved right margin = label width + 10px padding (prevents text overlap)
    const labelReservedW = ctx.measureText(slotLabels[i]).width + 10;

    const w = getSlotWeapon(i);
    const iconX = sx + 18 + (selected ? 12*_M : 0);
    const iconY = sy + (slotH - iconSize) / 2;
    const textX = iconX + iconSize + 8;
    // Available width for text: from textX to right edge minus label zone
    const textAvailW = (sx + slotW - labelReservedW) - textX;
    // Vertical positions: name at ~35%, stats at ~70% of slot height
    const nameY = sy + Math.round(slotH * 0.38);
    const statY = sy + Math.round(slotH * 0.72);

    if (i < 2 && w) {
      // Weapon icon
      const spriteId = 'weapon_' + w.id;
      if (typeof hasSprite === 'function' && hasSprite(spriteId)) {
        ctx.save();
        var _esf = (w.rarity && typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity) : 'none';
        if (_esf !== 'none') ctx.filter = _esf;
        drawSpriteImg(spriteId, iconX, iconY, iconSize, iconSize);
        ctx.restore();
      } else {
        ctx.fillStyle = '#fff'; ctx.font = Math.floor(iconSize * 0.65) + 'px ' + F; ctx.textAlign = 'center';
        const emoji = w.name.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF][\uFE0F\u20E3]?|^./);
        ctx.fillText(emoji ? emoji[0] : '\u2694', iconX + iconSize/2, iconY + iconSize * 0.7);
        ctx.textAlign = 'left';
      }
      // Line 1: weapon name — dynamic font reduction via measureText
      ctx.fillStyle = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : '#fff';
      let nameFz = slotNameFz;
      ctx.font = 'bold ' + nameFz + 'px ' + F;
      while (nameFz > 10 && ctx.measureText(w.name).width > textAvailW) {
        nameFz--;
        ctx.font = 'bold ' + nameFz + 'px ' + F;
      }
      ctx.fillText(w.name, textX, nameY);
      // Line 2: ★ level + ATK — dynamic reduction
      const lvl = w.level || 0;
      const statStr = '\u2B50'.repeat(lvl) + '\u25CB'.repeat(WEAPON_UPGRADE_MAX - lvl) + '  ATK ' + w.dmgMul.toFixed(1);
      ctx.fillStyle = '#ffd700';
      let statFz = slotStatFz;
      ctx.font = statFz + 'px ' + F;
      while (statFz > 8 && ctx.measureText(statStr).width > textAvailW) {
        statFz--;
        ctx.font = statFz + 'px ' + F;
      }
      ctx.fillText(statStr, textX, statY);
    } else if (i === 2) {
      var ch = player.charm;
      if (ch) {
        ctx.fillStyle = '#fff'; ctx.font = Math.floor(iconSize * 0.65) + 'px ' + F; ctx.textAlign = 'center';
        ctx.fillText(ch.icon || '\uD83D\uDD2E', iconX + iconSize/2, iconY + iconSize * 0.72);
        ctx.textAlign = 'left';
        // Name
        let cnameFz = slotNameFz;
        ctx.fillStyle = '#fff'; ctx.font = 'bold ' + cnameFz + 'px ' + F;
        while (cnameFz > 10 && ctx.measureText(ch.name).width > textAvailW) {
          cnameFz--; ctx.font = 'bold ' + cnameFz + 'px ' + F;
        }
        ctx.fillText(ch.name, textX, nameY);
        // Rarity — separate from desc to guarantee fit
        ctx.fillStyle = '#e056fd';
        var rarTxt = ch.rarity === 'legend' ? '\u2605LEGEND' : ch.rarity === 'rare' ? '\u2605RARE' : 'COMMON';
        let cstatFz = slotStatFz;
        ctx.font = cstatFz + 'px ' + F;
        while (cstatFz > 8 && ctx.measureText(rarTxt).width > textAvailW) {
          cstatFz--; ctx.font = cstatFz + 'px ' + F;
        }
        ctx.fillText(rarTxt, textX, statY);
      } else {
        ctx.save(); ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#888'; ctx.font = slotNameFz + 'px ' + F;
        ctx.fillText('\uD83D\uDD2E \u30C1\u30E3\u30FC\u30E0 (\u672A\u88C5\u5099)', sx + 22, sy + slotH/2 + slotNameFz/3);
        ctx.restore();
      }
    } else {
      ctx.fillStyle = '#555'; ctx.font = slotNameFz + 'px ' + F;
      ctx.fillText('\u2795 \u7A7A\u304D\u30B9\u30ED\u30C3\u30C8', sx + 22, sy + slotH/2 + slotNameFz/3);
    }
  }

  // ========== RIGHT PANE: Weapon List ==========
  const rightX = panelX + leftW + 20;
  const rightY = panelY + hdrH + 8;
  const rightW = panelW - leftW - 35;
  const rightH = panelH - hdrH - 18;

  // Right pane background
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  const rr = 10;
  ctx.moveTo(rightX+rr, rightY); ctx.lineTo(rightX+rightW-rr, rightY); ctx.arcTo(rightX+rightW, rightY, rightX+rightW, rightY+rr, rr);
  ctx.lineTo(rightX+rightW, rightY+rightH-rr); ctx.arcTo(rightX+rightW, rightY+rightH, rightX+rightW-rr, rightY+rightH, rr);
  ctx.lineTo(rightX+rr, rightY+rightH); ctx.arcTo(rightX, rightY+rightH, rightX, rightY+rightH-rr, rr);
  ctx.lineTo(rightX, rightY+rr); ctx.arcTo(rightX, rightY, rightX+rr, rightY, rr);
  ctx.closePath(); ctx.fill();

  const listTitleFz = 16 * _M;
  ctx.fillStyle = '#f8bbd0'; ctx.font = 'bold ' + listTitleFz + 'px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\uD83C\uDF92 \u3082\u3061\u3082\u306E\u30EA\u30B9\u30C8', rightX + rightW/2, rightY + listTitleFz + 2);

  const allWeapons = getAllOwnedWeapons();
  const listHeaderH = listTitleFz + 10;
  const listStartY = rightY + listHeaderH;
  // Row height: start at 64px (fits 18px name + 14px stats + padding), cap at 3 rows min
  const rowH = Math.min(64 * _M, Math.floor((rightH - listHeaderH - 30) / 3));
  const maxVisible = Math.floor((rightH - listHeaderH - 30) / rowH);
  // Font sizes: 18/14/12 as starting points, geometry-capped
  const rowNameFz = Math.min(18 * _M, Math.floor(rowH * 0.32));
  const rowStatFz = Math.min(14 * _M, Math.floor(rowH * 0.24));
  const rowBadgeFz = Math.min(12 * _M, Math.floor(rowH * 0.20));
  const icoSzList = Math.min(40 * _M, rowH - 8);

  if (allWeapons.length === 0) {
    ctx.fillStyle = '#666'; ctx.font = (14*_M) + 'px ' + F;
    ctx.fillText('\u3076\u304D\u304C\u306A\u3044\u3088', rightX + rightW/2, listStartY + 40);
  }

  for (let i = 0; i < Math.min(allWeapons.length, maxVisible); i++) {
    const entry = allWeapons[i];
    const w = entry.w;
    const ry = listStartY + i * rowH;
    const listSel = equipMode === 'list' && equipListCursor === i;

    ctx.fillStyle = listSel ? 'rgba(255,215,0,0.12)' : (i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)');
    ctx.fillRect(rightX + 4, ry, rightW - 8, rowH - 4);
    if (listSel) {
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2;
      ctx.strokeRect(rightX + 4, ry, rightW - 8, rowH - 4);
    }

    let badge = entry.src === 'main' ? '\u30E1\u30A4\u30F3' : entry.src === 'sub' ? '\u30B5\u30D6' : '\u30D0\u30C3\u30AF';

    // Icon
    const icoX = rightX + 10, icoY = ry + (rowH - icoSzList) / 2;
    const sprId = 'weapon_' + w.id;
    if (typeof hasSprite === 'function' && hasSprite(sprId)) {
      ctx.save();
      var _elf = (w.rarity && typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity) : 'none';
      if (_elf !== 'none') ctx.filter = _elf;
      drawSpriteImg(sprId, icoX, icoY, icoSzList, icoSzList);
      ctx.restore();
    } else {
      ctx.fillStyle = '#fff'; ctx.font = Math.floor(icoSzList * 0.6) + 'px ' + F; ctx.textAlign = 'center';
      const em = w.name.match(/^[\uD800-\uDBFF][\uDC00-\uDFFF][\uFE0F\u20E3]?|^./);
      ctx.fillText(em ? em[0] : '\u2694', icoX + icoSzList/2, icoY + icoSzList * 0.72);
    }

    const textStartX = rightX + icoSzList + 14;
    // Measure badge width first to know the exact reserved right margin
    ctx.font = rowBadgeFz + 'px ' + F;
    const badgeColW = ctx.measureText(badge).width + 12;
    // Text zone: from textStartX to (right edge - badge margin)
    const rowTextEndX = rightX + rightW - badgeColW - 6;
    const rowTextAvailW = rowTextEndX - textStartX;
    // Vertical: name ~38%, stats ~72%
    const rNameY = ry + Math.round(rowH * 0.38);
    const rStatY = ry + Math.round(rowH * 0.72);

    // Badge drawn first (right-aligned, top of row)
    ctx.textAlign = 'right';
    const badgeCol = entry.src === 'main' ? '#ffd700' : entry.src === 'sub' ? '#87ceeb' : '#aaa';
    ctx.fillStyle = badgeCol; ctx.font = rowBadgeFz + 'px ' + F;
    ctx.fillText(badge, rightX + rightW - 6, ry + rowBadgeFz + 4);

    // Name (left-aligned, dynamic font reduction)
    ctx.textAlign = 'left';
    var _rCol = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : '#fff';
    ctx.fillStyle = _rCol;
    const rarity_suffix = (w.rarity && w.rarity !== 'normal' && typeof getRarityDef === 'function') ? ' [' + getRarityDef(w.rarity).name + ']' : '';
    let rNFz = rowNameFz;
    ctx.font = 'bold ' + rNFz + 'px ' + F;
    while (rNFz > 10 && ctx.measureText(w.name + rarity_suffix).width > rowTextAvailW) {
      rNFz--; ctx.font = 'bold ' + rNFz + 'px ' + F;
    }
    ctx.fillText(w.name + rarity_suffix, textStartX, rNameY);

    // Stats (dynamic reduction to stay within text zone)
    const lvl = w.level || 0;
    const rowStatStr = '\u2B50'.repeat(lvl) + '\u25CB'.repeat(WEAPON_UPGRADE_MAX - lvl) + ' ATK ' + w.dmgMul.toFixed(1) + ' SPD ' + w.speed.toFixed(2);
    ctx.fillStyle = '#ffe0b2';
    let rSFz = rowStatFz;
    ctx.font = rSFz + 'px ' + F;
    while (rSFz > 8 && ctx.measureText(rowStatStr).width > rowTextAvailW) {
      rSFz--; ctx.font = rSFz + 'px ' + F;
    }
    ctx.fillText(rowStatStr, textStartX, rStatY);

    // Upgrade/evolve label (bottom-right of selected row — below stats zone)
    if (listSel) {
      ctx.textAlign = 'right';
      let upgradeStr = '';
      let upgradeCol = '#2ecc71';
      if (lvl < WEAPON_UPGRADE_MAX) {
        var ucost = (typeof getUpgradeCost === 'function') ? getUpgradeCost(w) : WEAPON_UPGRADE_COST[lvl];
        upgradeStr = 'Z:\u5F37\u5316(' + ucost + '\uD83C\uDF3C)';
        upgradeCol = (pollen >= ucost) ? '#2ecc71' : '#e74c3c';
      } else if (typeof canEvolve === 'function' && canEvolve(w)) {
        upgradeStr = 'Z:\u2728(' + getEvoCost(w) + '\uD83C\uDF3C)';
        upgradeCol = '#e056fd';
      } else if (typeof EVOLUTION_MAP !== 'undefined' && EVOLUTION_MAP[w.id]) {
        upgradeStr = '\u2728\u3057\u3093\u304B(' + getEvoCost(w) + '\uD83C\uDF3C)';
        upgradeCol = '#e74c3c';
      } else if (lvl >= WEAPON_UPGRADE_MAX) {
        upgradeStr = (w.tier === 2) ? '\u2728T2 MAX' : '\u2728MAX';
        upgradeCol = '#ffd700';
      }
      if (upgradeStr) {
        ctx.fillStyle = upgradeCol;
        let uFz = rowStatFz;
        ctx.font = 'bold ' + uFz + 'px ' + F;
        ctx.fillText(upgradeStr, rightX + rightW - 6, ry + rowH - 4);
      }
    }
    ctx.textAlign = 'left';
  }

  // ========== BOTTOM: Detail + Controls ==========
  const selW = equipMode === 'list' && allWeapons[equipListCursor]
    ? allWeapons[equipListCursor].w
    : getSlotWeapon(equipCursor);

  const bottomY = panelY + panelH;
  if (selW && selW.desc) {
    ctx.fillStyle = '#ccc'; ctx.font = (12*_M) + 'px ' + F; ctx.textAlign = 'center';
    ctx.fillText(selW.desc, panelX + panelW/2, bottomY - 28*_M);
  }

  // Controls (PC only — mobile uses touch buttons)
  if (_M === 1) {
    ctx.fillStyle = 'rgba(248,187,208,0.5)'; ctx.font = '12px ' + F; ctx.textAlign = 'center';
    const hint = equipMode === 'slot'
      ? equipCursor === 2 ? '\u2191\u2193:\u30B9\u30ED\u30C3\u30C8  Esc:\u3068\u3058\u308B' : '\u2191\u2193:\u30B9\u30ED\u30C3\u30C8  \u2192:\u30EA\u30B9\u30C8\u3078  Z:\u5F37\u5316  Esc:\u3068\u3058\u308B'
      : '\u2191\u2193:\u3048\u3089\u3076  \u2190:\u30B9\u30ED\u30C3\u30C8\u3078  Z:\u5F37\u5316  X:\u305D\u3046\u3073  Esc:\u3068\u3058\u308B';
    ctx.fillText(hint, panelX + panelW/2, bottomY - 10);
  }

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
