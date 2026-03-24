// ===== GIMMICKS MODULE (H-A2) =====
// 環境ギミック: 爆発樽(barrel)の処理
// data.js から分離（サイズ管理）

const BARREL_RADIUS = 80;
function explodeBarrel(barrel) {
  if (barrel.exploded) return;
  barrel.exploded = true;
  const bx = barrel.c * TILE + TILE / 2, by = barrel.r * TILE + TILE / 2;
  // 爆発パーティクル
  emitParticles(bx, by, '#ff6600', 16, 120, 0.6);
  emitParticles(bx, by, '#ffcc00', 8, 80, 0.4);
  Audio.player_hurt();
  showFloat('💥 爆発！', 1.5, '#ff6600');
  // プレイヤーへのダメージ
  if (Math.hypot(player.x + player.w/2 - bx, player.y + player.h/2 - by) < BARREL_RADIUS && player.invTimer <= 0) {
    player.hp -= 3; player.invTimer = player.invDuration;
    emitParticles(player.x + player.w/2, player.y + player.h/2, '#ff4444', 6, 80, 0.3);
    showFloat('−3 💥', 1.5, '#ff4444');
    if (player.hp <= 0) { gameState = 'dead'; Audio.game_over(); stopBGM(0.8); }
  }
  // 敵へのダメージ
  for (const en of enemies) {
    if (en.hp <= 0) continue;
    if (Math.hypot(en.x + en.w/2 - bx, en.y + en.h/2 - by) < BARREL_RADIUS) {
      en.hp -= 3; en.hitFlash = 0.2;
      spawnDmg(en.x + en.w/2, en.y, 3, '#ff6600');
    }
  }
  // ボスへのダメージ
  if (boss && boss.hp > 0) {
    if (Math.hypot(boss.x + boss.w/2 - bx, boss.y + boss.h/2 - by) < BARREL_RADIUS) {
      boss.hp -= 3; boss.hitFlash = 0.2;
      spawnDmg(boss.x + boss.w/2, boss.y, 3, '#ff6600');
    }
  }
}
function checkBarrelProjectileHit(px, py) {
  for (const b of roomBarrels) {
    if (b.exploded) continue;
    const bx = b.c * TILE + TILE / 2, by = b.r * TILE + TILE / 2;
    if (Math.hypot(px - bx, py - by) < TILE * 0.6) { explodeBarrel(b); return true; }
  }
  return false;
}
function updateBarrels(dt) {
  for (const b of roomBarrels) {
    if (b.exploded) continue;
    const bx = b.c * TILE + TILE / 2, by = b.r * TILE + TILE / 2;
    const px = player.x + player.w/2, py = player.y + player.h/2;
    if (Math.hypot(px - bx, py - by) < TILE * 0.55) explodeBarrel(b);
  }
}
function drawBarrels() {
  for (const b of roomBarrels) {
    if (b.exploded) continue;
    const bx = b.c * TILE + 4, by = b.r * TILE + 4, bw = TILE - 8, bh = TILE - 8;
    ctx.fillStyle = '#8B5E3C';
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 6) : ctx.rect(bx, by, bw, bh); ctx.fill();
    ctx.strokeStyle = '#4a2f0a'; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = '#c8a020'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx, by + bh * 0.3); ctx.lineTo(bx + bw, by + bh * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, by + bh * 0.7); ctx.lineTo(bx + bw, by + bh * 0.7); ctx.stroke();
    ctx.fillStyle = 'rgba(255,200,100,0.3)';
    ctx.fillRect(bx + 4, by + 4, bw * 0.3, bh * 0.4);
  }
}
