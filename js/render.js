// ===== DRAWING =====
function drawRoom() {
  const th = getTheme(floor);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (tileAt(roomMap, c, r) === 1) {
      ctx.fillStyle = th.wall; ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      ctx.fillStyle = th.wallTop; ctx.fillRect(c * TILE, r * TILE, TILE, 4);
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(c * TILE, r * TILE + TILE - 4, TILE, 4);
    } else if (tileAt(roomMap, c, r) === 2) {
      ctx.fillStyle = (c + r) % 2 === 0 ? th.floor : th.floorAlt; ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      ctx.fillStyle = 'rgba(180,60,60,0.45)';
      const sx = c * TILE, sy = r * TILE;
      for (let si = 0; si < 3; si++) for (let sj = 0; sj < 3; sj++) {
        const tx = sx + 8 + si * 18, ty = sy + 8 + sj * 18;
        ctx.beginPath(); ctx.moveTo(tx, ty+10); ctx.lineTo(tx+5, ty); ctx.lineTo(tx+10, ty+10); ctx.fill();
      }
    } else {
      ctx.fillStyle = (c + r) % 2 === 0 ? th.floor : th.floorAlt; ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      ctx.strokeStyle = 'rgba(255,255,255,0.03)'; ctx.strokeRect(c * TILE, r * TILE, TILE, TILE);
    }
  }
}

function drawEnemyShape(e, color) {
  const cx = e.x + e.w/2, cy = e.y + e.h/2, hw = e.w/2, hh = e.h/2;
  ctx.fillStyle = e.hitFlash > 0 ? '#fff' : color;
  ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
  const s = e.shape || 'default';
  if (s === 'mushroom') {
    // Cap (half circle)
    ctx.beginPath(); ctx.arc(cx, cy - hh*0.15, hw, Math.PI, 0); ctx.fill(); ctx.stroke();
    // Stem
    ctx.fillRect(cx - hw*0.35, cy - hh*0.15, hw*0.7, hh*0.8);
    ctx.strokeRect(cx - hw*0.35, cy - hh*0.15, hw*0.7, hh*0.8);
    // Spots
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - hw*0.3, cy - hh*0.4, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + hw*0.2, cy - hh*0.55, 2.5, 0, Math.PI*2); ctx.fill();
  } else if (s === 'blob') {
    ctx.beginPath(); ctx.ellipse(cx, cy + hh*0.15, hw, hh*0.75, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(cx - hw*0.3, cy - hh*0.1, hw*0.25, hh*0.2, -0.3, 0, Math.PI*2); ctx.fill();
  } else if (s === 'spider') {
    // Body
    ctx.beginPath(); ctx.ellipse(cx, cy, hw*0.7, hh*0.6, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Legs (4 pairs)
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i += 2) {
      for (let j = 0; j < 4; j++) {
        const lx = cx + i * hw * (0.4 + j*0.15), ly = cy - hh*0.2 + j*hh*0.2;
        ctx.beginPath(); ctx.moveTo(cx + i*hw*0.4, cy - hh*0.1 + j*hh*0.15);
        ctx.lineTo(lx + i*8, ly + 6); ctx.stroke();
      }
    }
  } else if (s === 'bat') {
    // Body
    ctx.beginPath(); ctx.ellipse(cx, cy, hw*0.5, hh*0.5, 0, 0, Math.PI*2); ctx.fill();
    // Wings
    ctx.beginPath(); ctx.moveTo(cx - hw*0.4, cy); ctx.quadraticCurveTo(cx - hw, cy - hh, cx - hw*0.2, cy - hh*0.3); ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx + hw*0.4, cy); ctx.quadraticCurveTo(cx + hw, cy - hh, cx + hw*0.2, cy - hh*0.3); ctx.fill();
  } else if (s === 'beetle') {
    // Shell
    ctx.beginPath(); ctx.ellipse(cx, cy, hw, hh*0.85, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(cx, cy - hh*0.85); ctx.lineTo(cx, cy + hh*0.85); ctx.stroke();
    // Horn
    ctx.fillStyle = '#555'; ctx.beginPath(); ctx.moveTo(cx - 4, e.y); ctx.lineTo(cx, e.y - 10); ctx.lineTo(cx + 4, e.y); ctx.fill();
  } else if (s === 'wasp') {
    // Body segments
    ctx.beginPath(); ctx.ellipse(cx, cy - hh*0.2, hw*0.5, hh*0.4, 0, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx, cy + hh*0.3, hw*0.6, hh*0.45, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    // Stripes
    ctx.fillStyle = '#333'; ctx.fillRect(cx - hw*0.5, cy + hh*0.15, hw, 3);
    ctx.fillRect(cx - hw*0.5, cy + hh*0.35, hw, 3);
    // Wings
    ctx.fillStyle = 'rgba(200,230,255,0.5)';
    ctx.beginPath(); ctx.ellipse(cx - hw*0.6, cy - hh*0.3, hw*0.5, hh*0.25, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + hw*0.6, cy - hh*0.3, hw*0.5, hh*0.25, 0.3, 0, Math.PI*2); ctx.fill();
  } else if (s === 'flower') {
    // Petals
    for (let i = 0; i < 5; i++) { const a = i * Math.PI*2/5 - Math.PI/2;
      ctx.fillStyle = e.hitFlash > 0 ? '#fff' : color;
      ctx.beginPath(); ctx.ellipse(cx + Math.cos(a)*hw*0.5, cy + Math.sin(a)*hh*0.5, hw*0.35, hh*0.2, a, 0, Math.PI*2); ctx.fill(); }
    // Center
    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(cx, cy, hw*0.3, 0, Math.PI*2); ctx.fill();
  } else if (s === 'worm') {
    // Segments
    for (let i = 0; i < 4; i++) { ctx.fillStyle = e.hitFlash > 0 ? '#fff' : (i%2===0 ? color : '#8B4513');
      ctx.beginPath(); ctx.ellipse(cx - hw*0.5 + i*hw*0.35, cy, hw*0.28, hh*0.45, 0, 0, Math.PI*2); ctx.fill(); }
  } else if (s === 'ghost') {
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(cx, cy - hh*0.2, hw*0.7, Math.PI, 0); ctx.lineTo(cx + hw*0.7, cy + hh*0.4);
    for (let i = 3; i >= 0; i--) { ctx.lineTo(cx - hw*0.7 + i*hw*0.35, cy + hh*(i%2===0 ? 0.2 : 0.5)); }
    ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
  } else if (s === 'golem') {
    // Blocky body
    ctx.fillRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8); ctx.strokeRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
    // Cracks
    ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.moveTo(cx - 6, e.y + 8); ctx.lineTo(cx - 2, cy); ctx.lineTo(cx + 5, cy + 5); ctx.stroke();
  } else if (s === 'vine') {
    // Stem
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : '#2d6b1e'; ctx.fillRect(cx - 3, cy - hh*0.2, 6, hh*0.8);
    // Leaves
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : color;
    ctx.beginPath(); ctx.ellipse(cx - hw*0.4, cy - hh*0.1, hw*0.4, hh*0.25, -0.4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + hw*0.4, cy + hh*0.1, hw*0.4, hh*0.25, 0.4, 0, Math.PI*2); ctx.fill();
    // Flower bud
    ctx.fillStyle = '#e84393'; ctx.beginPath(); ctx.arc(cx, cy - hh*0.5, hw*0.25, 0, Math.PI*2); ctx.fill();
  } else if (s === 'darkbee') {
    // Like wasp but darker
    ctx.beginPath(); ctx.ellipse(cx, cy, hw*0.6, hh*0.7, 0, 0, Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111'; ctx.fillRect(cx - hw*0.5, cy - 2, hw, 4); ctx.fillRect(cx - hw*0.5, cy + hh*0.25, hw, 4);
    ctx.fillStyle = 'rgba(150,150,200,0.4)';
    ctx.beginPath(); ctx.ellipse(cx - hw*0.5, cy - hh*0.4, hw*0.5, hh*0.2, -0.3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx + hw*0.5, cy - hh*0.4, hw*0.5, hh*0.2, 0.3, 0, Math.PI*2); ctx.fill();
  } else {
    // Default rounded rect
    const rr = 6; ctx.beginPath(); ctx.moveTo(e.x+rr,e.y); ctx.lineTo(e.x+e.w-rr,e.y);
    ctx.quadraticCurveTo(e.x+e.w,e.y,e.x+e.w,e.y+rr); ctx.lineTo(e.x+e.w,e.y+e.h-rr);
    ctx.quadraticCurveTo(e.x+e.w,e.y+e.h,e.x+e.w-rr,e.y+e.h); ctx.lineTo(e.x+rr,e.y+e.h);
    ctx.quadraticCurveTo(e.x,e.y+e.h,e.x,e.y+e.h-rr); ctx.lineTo(e.x,e.y+rr);
    ctx.quadraticCurveTo(e.x,e.y,e.x+rr,e.y); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}

function drawEntity(e, color, isP) {
  const cx = e.x + e.w / 2, cy = e.y + e.h / 2;
  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx, e.y + e.h + 2, e.w / 2.5, 4, 0, 0, Math.PI * 2); ctx.fill();

  // Invincibility blink
  if (isP && player.invTimer > 0 && Math.floor(player.invTimer * 10) % 2 === 0) ctx.globalAlpha = 0.4;
  // Hit flash
  if (!isP && e.hitFlash > 0) ctx.globalAlpha = 0.6;

  // === PLAYER ===
  if (isP) {
    if (mipurinReady) {
      const dir = getPlayerDir();
      const mf = MIPURIN_FRAMES[dir];
      const drawSz = e.w + 24;
      // Code animation: bob when moving
      const isMoving = keys['KeyW'] || keys['KeyA'] || keys['KeyS'] || keys['KeyD'] ||
                       keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight'];
      const bob = isMoving ? Math.sin(Date.now() / 100) * 2 : 0;
      const squash = isMoving ? 1 + Math.sin(Date.now() / 120) * 0.03 : 1;
      ctx.save();
      ctx.translate(cx, e.y + e.h / 2 + bob);
      ctx.scale(squash, 2 - squash);
      ctx.translate(-cx, -(e.y + e.h / 2));
      ctx.drawImage(mipurinImg, mf.sx, mf.sy, mf.sw, mf.sh, e.x - 12, e.y - 12, drawSz, drawSz);
      ctx.restore();
      ctx.globalAlpha = 1;
      return;
    }
    // Fallback canvas player
    ctx.fillStyle = COL.player;
    const rr = 6; ctx.beginPath(); ctx.moveTo(e.x+rr,e.y); ctx.lineTo(e.x+e.w-rr,e.y);
    ctx.quadraticCurveTo(e.x+e.w,e.y,e.x+e.w,e.y+rr); ctx.lineTo(e.x+e.w,e.y+e.h-rr);
    ctx.quadraticCurveTo(e.x+e.w,e.y+e.h,e.x+e.w-rr,e.y+e.h); ctx.lineTo(e.x+rr,e.y+e.h);
    ctx.quadraticCurveTo(e.x,e.y+e.h,e.x,e.y+e.h-rr); ctx.lineTo(e.x,e.y+rr);
    ctx.quadraticCurveTo(e.x,e.y,e.x+rr,e.y); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    return;
  }

  // === ENEMY with sprite ===
  const spriteId = e.shape || e.id || 'default';
  if (hasSprite(spriteId)) {
    const bob = getEnemyBob(e);
    // Code animation: bob + squash & stretch + tilt
    const isMoving = Math.abs(e.vx || 0) > 5 || Math.abs(e.vy || 0) > 5;
    const squash = isMoving ? 1 + Math.sin(Date.now() / 150) * 0.12 : 1 + Math.sin(Date.now() / 600) * 0.06;
    const tilt = isMoving ? Math.sin(Date.now() / 200) * 0.15 : Math.sin(Date.now() / 800) * 0.03;
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2 + bob);
    ctx.rotate(tilt);
    ctx.scale(squash, 2 - squash);
    drawSpriteImg(spriteId, -e.w / 2, -e.h / 2, e.w, e.h);
    if (e.hitFlash > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(-e.w / 2, -e.h / 2, e.w, e.h);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.restore();
    ctx.globalAlpha = 1;
    return;
  }

  // === Fallback: canvas enemy shape ===
  if (e.shape) {
    drawEnemyShape(e, color);
  } else {
    ctx.fillStyle = e.hitFlash > 0 ? '#fff' : color;
    const rr = 6; ctx.beginPath(); ctx.moveTo(e.x+rr,e.y); ctx.lineTo(e.x+e.w-rr,e.y);
    ctx.quadraticCurveTo(e.x+e.w,e.y,e.x+e.w,e.y+rr); ctx.lineTo(e.x+e.w,e.y+e.h-rr);
    ctx.quadraticCurveTo(e.x+e.w,e.y+e.h,e.x+e.w-rr,e.y+e.h); ctx.lineTo(e.x+rr,e.y+e.h);
    ctx.quadraticCurveTo(e.x,e.y+e.h,e.x,e.y+e.h-rr); ctx.lineTo(e.x,e.y+rr);
    ctx.quadraticCurveTo(e.x,e.y,e.x+rr,e.y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#333'; ctx.lineWidth = 2; ctx.stroke();
  }
  // Eyes for canvas enemies
  const eyeY = cy - 2, eyeOff = e.w * 0.18; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(cx - eyeOff, eyeY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + eyeOff, eyeY, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(cx - eyeOff, eyeY, 2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx + eyeOff, eyeY, 2, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}

function drawHPBar(e, yOff) {
  const bW = e.w + 4, bH = 5, bx = e.x - 2, by = e.y + yOff;
  ctx.fillStyle = COL.hpBg; ctx.fillRect(bx, by, bW, bH);
  const ratio = Math.max(0, e.hp / e.maxHp);
  ctx.fillStyle = ratio > 0.5 ? COL.hp : ratio > 0.25 ? '#f39c12' : COL.hpLost; ctx.fillRect(bx, by, bW * ratio, bH);
}


function drawAttackEffect() {
  if (!player.attacking) return;
  const wfx = player.weapon.fx || 'none';
  const wc = player.weapon.color || '#fff';
  const progress = 1 - (player.atkTimer / player.atkDuration);
  const px = player.x + player.w / 2, py = player.y + player.h / 2;
  let ax = player.atkDir.x, ay = player.atkDir.y;
  const al = Math.hypot(ax, ay) || 1; ax /= al; ay /= al;
  const ba = Math.atan2(ay, ax);
  ctx.save();
  if (wfx === '360') {
    // 蔦鞭: 全方位なぎ払いリング
    const r = 30 + progress * 25;
    ctx.globalAlpha = 0.5 * (1 - progress);
    ctx.strokeStyle = wc; ctx.lineWidth = 5 + progress * 3;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 0.15 * (1 - progress);
    ctx.fillStyle = wc;
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill();
    // 回転する葉っぱ風の弧
    ctx.globalAlpha = 0.6 * (1 - progress);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
    const spinA = ba + progress * Math.PI * 3;
    ctx.beginPath(); ctx.arc(px, py, r - 6, spinA - 1.2, spinA + 1.2); ctx.stroke();
  } else if (wfx === 'aoe') {
    // 女王の杖: 衝撃波 + 放射線
    const cx = px + ax * 24, cy = py + ay * 24;
    const r = 20 + progress * 50;
    ctx.globalAlpha = 0.4 * (1 - progress);
    ctx.fillStyle = wc;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.globalAlpha = 0.6 * (1 - progress);
    for (let i = 0; i < 8; i++) {
      const ra = i * Math.PI / 4 + progress * 0.5;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ra) * r * 0.9, cy + Math.sin(ra) * r * 0.9); ctx.stroke();
    }
    ctx.strokeStyle = wc; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  } else if (wfx === 'double') {
    // 蜂の針 / 羽根手裏剣: 素早い二重斬り
    const ox = px + ax * 20, oy = py + ay * 20;
    // 第1弧
    ctx.globalAlpha = 0.7 * (1 - progress);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(ox, oy, 22 + progress * 14, ba - 0.9, ba + 0.9); ctx.stroke();
    ctx.strokeStyle = wc; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(ox, oy, 18 + progress * 10, ba - 0.7, ba + 0.7); ctx.stroke();
    // 第2弧 (少し遅れて小さい)
    const p2 = Math.max(0, progress - 0.2) / 0.8;
    if (p2 > 0) {
      ctx.globalAlpha = 0.5 * (1 - p2);
      ctx.strokeStyle = wc; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(ox, oy, 14 + p2 * 12, ba - 0.5 + p2 * 0.3, ba + 0.5 - p2 * 0.3); ctx.stroke();
    }
    // 閃光
    if (progress < 0.2) {
      ctx.globalAlpha = 0.5 * (1 - progress / 0.2);
      ctx.fillStyle = wc;
      ctx.beginPath(); ctx.arc(ox, oy, 10, 0, Math.PI * 2); ctx.fill();
    }
  } else {
    // デフォルト (蜜砲, 花粉盾など): 従来のスラッシュ弧
    const box = getAttackBox();
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    ctx.globalAlpha = 0.5 * (1 - progress);
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx, cy, 26 + progress * 14, ba - 1.1, ba + 1.1); ctx.stroke();
    ctx.globalAlpha = 0.9 * (1 - progress);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(cx, cy, 26 + progress * 14, ba - 1.0, ba + 1.0); ctx.stroke();
    ctx.strokeStyle = wc; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(cx, cy, 22 + progress * 10, ba - 0.8, ba + 0.8); ctx.stroke();
    if (progress < 0.3) {
      ctx.globalAlpha = 0.4 * (1 - progress / 0.3);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  emitParticles(px + ax * 16, py + ay * 16, wc, 1, 50, 0.18);
}


function drawDashTrail() {
  if (!player.dashing) return;
  const cx = player.x + player.w / 2, cy = player.y + player.h / 2;
  const ddx = player.dashDir.x, ddy = player.dashDir.y;
  // 3-frame ghost trail
  for (let g = 3; g >= 1; g--) {
    const gx = cx - ddx * g * 18, gy = cy - ddy * g * 18;
    ctx.globalAlpha = 0.12 * g;
    if (mipurinReady) {
      const dir = getPlayerDir();
      const mf = MIPURIN_FRAMES[dir];
      const sz = player.w + 24;
      ctx.drawImage(mipurinImg, mf.sx, mf.sy, mf.sw, mf.sh, gx - sz/2, gy - sz/2, sz, sz);
    } else {
      ctx.fillStyle = COL.player;
      ctx.beginPath(); ctx.arc(gx, gy, player.w/2, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  // Bright dash circle
  ctx.fillStyle = COL.dash; ctx.beginPath(); ctx.arc(cx, cy, 24, 0, Math.PI * 2); ctx.fill();
}

function drawTelegraph(en) {
  // Charge telegraph (existing)
  if (en.state === 'telegraph' && en.chargeDir) {
    const cx = en.x + en.w/2, cy = en.y + en.h/2;
    ctx.fillStyle = COL.telegraph; ctx.beginPath();
    ctx.moveTo(cx - en.chargeDir.y * 20, cy + en.chargeDir.x * 20);
    ctx.lineTo(cx + en.chargeDir.x * 200, cy + en.chargeDir.y * 200);
    ctx.lineTo(cx + en.chargeDir.y * 20, cy - en.chargeDir.x * 20); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff0'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('!', cx, en.y - 8);
  }
  // Shoot telegraph — pulsing ring around enemy
  if (en.state === 'shootTele' && en.shootTarget) {
    const cx = en.x + en.w/2, cy = en.y + en.h/2;
    const prog = 1 - (en.shootTeleTimer || 0) / 0.4;
    ctx.strokeStyle = 'rgba(255,100,50,' + (0.3 + prog * 0.5) + ')'; ctx.lineWidth = 2 + prog * 2;
    ctx.beginPath(); ctx.arc(cx, cy, en.w/2 + 8 + prog * 12, 0, Math.PI * 2); ctx.stroke();
    // Aim line to target
    ctx.strokeStyle = 'rgba(255,50,50,' + (0.2 + prog * 0.4) + ')'; ctx.lineWidth = 1; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(en.shootTarget.x, en.shootTarget.y); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#ff0'; ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('!', cx, en.y - 8);
  }
  // Teleport telegraph — pulsing ring at destination
  if (en.state === 'teleWarn' && en.teleTarget) {
    const prog = 1 - (en.teleWarnTimer || 0) / 0.3;
    ctx.strokeStyle = 'rgba(180,100,255,' + (0.2 + prog * 0.6) + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(en.teleTarget.x + en.w/2, en.teleTarget.y + en.h/2, en.w/2 + prog * 15, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(180,100,255,' + (0.1 + prog * 0.2) + ')'; ctx.beginPath(); ctx.arc(en.teleTarget.x + en.w/2, en.teleTarget.y + en.h/2, en.w/2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.textAlign = 'left';
}

function drawBoss() {
  if (!boss || boss.hp <= 0) return;
  // Telegraph
  if (boss.state === 'telegraph' && boss.chargeDir) {
    const cx = boss.x + boss.w / 2, cy = boss.y + boss.h / 2;
    ctx.fillStyle = 'rgba(255,0,0,0.3)'; ctx.beginPath();
    ctx.moveTo(cx - boss.chargeDir.y * 30, cy + boss.chargeDir.x * 30);
    ctx.lineTo(cx + boss.chargeDir.x * 300, cy + boss.chargeDir.y * 300);
    ctx.lineTo(cx + boss.chargeDir.y * 30, cy - boss.chargeDir.x * 30); ctx.closePath(); ctx.fill();
  }
  if (boss.pattern === 'boss_slam' && boss.state === 'telegraph') {
    ctx.fillStyle = 'rgba(255,0,0,0.2)'; ctx.beginPath(); ctx.arc(boss.x + boss.w / 2, boss.y + boss.h / 2, 100, 0, Math.PI * 2); ctx.fill();
  }
  // Try boss sprite
  const bossId = boss.id || 'default';
  if (hasSprite(bossId)) {
    drawBossPhaseEffect(boss);
    const bob = getEnemyBob(boss);
    drawSpriteImg(bossId, boss.x, boss.y + bob, boss.w, boss.h);
    if (boss.hitFlash > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillRect(boss.x, boss.y + bob, boss.w, boss.h);
      ctx.globalCompositeOperation = 'source-over';
    }
  } else {
    drawEntity(boss, boss.hitFlash > 0 ? '#fff' : boss.color, false);
  }
  // Boss HP bar (top of screen)
  const bw = 300, bh = 12, bx = CW / 2 - bw / 2, by = 8;
  ctx.fillStyle = COL.hpBg; ctx.fillRect(bx, by, bw, bh);
  ctx.fillStyle = COL.hpLost; ctx.fillRect(bx, by, bw * Math.max(0, boss.hp / boss.maxHp), bh);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(bx, by, bw, bh);
  ctx.fillStyle = COL.text; ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText(boss.name + ' P' + boss.phase, CW / 2, by + bh + 12); ctx.textAlign = 'left';
}






function drawGameState() {
  if (gameState === 'waveWait') { ctx.fillStyle = COL.text; ctx.font = "bold 64px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('🌸 ウェーブ ' + (wave + 1) + ' 🌸', CW / 2, CH / 2); ctx.fillStyle = '#fff'; ctx.font = "24px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('がんばれ、ミプリン！', CW / 2, CH / 2 + 50); ctx.textAlign = 'left'; }
  if (gameState === 'floorClear') {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, CW, CH);
    const fcProg = Math.min(1, floorClearAnimTimer * 1.5);
    const fcScale = fcProg < 0.5 ? 0.5 + fcProg * 1.5 : 1.25 - (fcProg - 0.5) * 0.5;
    const fcAlpha = Math.min(1, fcProg * 2);
    ctx.save();
    ctx.translate(CW / 2, CH / 2); ctx.scale(fcScale, fcScale);
    ctx.globalAlpha = fcAlpha;
    ctx.fillStyle = COL.clear; ctx.font = "bold 80px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText('FLOOR ' + floor + ' CLEAR!', 0, 0);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('+ ' + score + ' pts', 0, 50);
    ctx.restore();
    if (floorClearAnimTimer < 0.1) emitParticles(CW/2, CH/2, '#ffd700', 15, 100, 0.5);
    ctx.textAlign = 'left';
  }
  if (gameState === 'nodeSelect') { drawNodeMap(); }
  if (gameState === 'event' && currentEvent) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = '#3498db'; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText('❓ イベント', CW / 2, 200);
    ctx.fillStyle = '#fff'; ctx.font = "22px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(currentEvent.text, CW / 2, 280);
    if (eventPhase === 'choose') {
      const opts = [currentEvent.a.label, currentEvent.b.label];
      for (let i = 0; i < 2; i++) {
        const oy = 370 + i * 70;
        ctx.fillStyle = treeCursor.col === i ? 'rgba(52,152,219,0.4)' : 'rgba(255,255,255,0.1)';
        ctx.fillRect(CW / 2 - 200, oy - 25, 400, 50);
        ctx.strokeStyle = treeCursor.col === i ? '#3498db' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2; ctx.strokeRect(CW / 2 - 200, oy - 25, 400, 50);
        ctx.fillStyle = treeCursor.col === i ? '#fff' : '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
        ctx.fillText(opts[i], CW / 2, oy + 7);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('↑↓ で選択  /  Z で決定', CW / 2, 540);
    } else {
      ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('Z: つぎへ', CW / 2, 400);
    }
    ctx.textAlign = 'left';
  }

  if (gameState === 'weaponDrop' && weaponPopup.active) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, CW, CH);
      ctx.fillStyle = '#ffd700'; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
      ctx.fillText(weaponPopup.weapon.icon + ' ' + weaponPopup.weapon.name + (weaponPopup.sparkle ? ' ✦' : ''), CW / 2, CH / 2 - 40);
      ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('ATK: ' + weaponPopup.weapon.atk + '  ' + (weaponPopup.weapon.desc || ''), CW / 2, CH / 2);
      ctx.fillText('Z: おきにいりに  Q: もうひとつに  X: すてる', CW / 2, CH / 2 + 40);
      ctx.textAlign = 'left';
    }
    if (gameState === 'dead') { ctx.fillStyle = 'rgba(50,15,40,0.65)'; ctx.fillRect(0, 0, CW, CH);
    // Mipurin fallen
    if (deadImgReady) { ctx.save(); ctx.globalAlpha = 0.8; const sz = 160; ctx.drawImage(deadMipurinImg, CW/2 - sz/2, CH/2 + 20, sz, sz); ctx.restore(); } else if (mipurinReady) { ctx.save(); ctx.globalAlpha = 0.6; const sz = 80; ctx.drawImage(mipurinImg, 0, 0, 250, 250, CW/2 - sz/2, CH/2 + 30, sz, sz); ctx.restore(); }
    ctx.fillStyle = COL.hpLost; ctx.font = "bold 60px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('おやすみ、ミプリン…', CW / 2, CH / 2 - 40);
    ctx.fillStyle = '#ddd'; ctx.font = "32px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('スコア: ' + score + '　フロア: ' + floor + '　花粉: ' + pollen, CW / 2, CH / 2 + 10);
    ctx.fillStyle = '#ffd700'; ctx.fillText('獲得ネクター: +' + runNectar, CW / 2, CH / 2 + 40);
    ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
    if (deadTimer > 2.0) { const blinkOn = Math.floor(Date.now() / 500) % 2 === 0; if (blinkOn) ctx.fillText('Zキーでタイトルへ', CW / 2, CH / 2 + 130); }
    else { ctx.fillText('...', CW / 2, CH / 2 + 130); }
    ctx.textAlign = 'left'; }
}

function draw() {
  if (gameState === 'ending') { drawEnding(); return; }
  if (gameState === 'prologue') { drawPrologue(); return; } if (gameState === 'garden') { drawGarden(); return; }
  if (gameState === 'title') { drawTitle(); return; }

  ctx.save();
  if (shakeTimer > 0) ctx.translate((Math.random() - 0.5) * shakeIntensity * 2, (Math.random() - 0.5) * shakeIntensity * 2);

  const th = getTheme(floor); ctx.fillStyle = th.bg; ctx.fillRect(0, 0, CW, CH);
  drawRoom(); drawBgParticles(); drawDashTrail(); drawDrops();
  for (const en of enemies) if (en.hp > 0) drawTelegraph(en);
  for (const en of enemies) if (en.hp > 0) { drawEntity(en, en.color, false); drawHPBar(en, -8); }
  drawBoss(); drawProjectiles(); drawAttackEffect(); drawEntity(player, COL.player, true); drawParticles(); drawDmgNumbers(); drawHUD();

  ctx.restore();
  // Boss silhouette during dialog
  if (gameState === 'dialog' && boss && bossSilhouettes[boss.id]) { ctx.save(); ctx.globalAlpha = 0.3 + Math.sin(Date.now()/300) * 0.1; const silSz = 200; ctx.drawImage(bossSilhouettes[boss.id], CW/2 - silSz/2, CH/2 - silSz/2 - 60, silSz, silSz); ctx.restore(); }
  drawGameState(); drawBlessing(); drawShop();

  drawInventory();
  // Fade overlay
  if (fadeAlpha > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
  drawFloatMessages();
  drawDialogWindow();
}

// ===== MAIN LOOP =====
let lastTime = 0;
function loop(time) {
  const rawDt = (time - lastTime) / 1000; lastTime = time;
  const dt = Math.min(rawDt, 0.05);
  if (hitStopTimer > 0) { hitStopTimer -= dt; draw(); } else { update(dt); draw(); }
  for (const k in pressed) pressed[k] = false;
  requestAnimationFrame(loop);
}
requestAnimationFrame(t => { lastTime = t; requestAnimationFrame(loop); });

