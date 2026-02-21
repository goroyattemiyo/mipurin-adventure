/**
 * battle.js - プレイヤー操作・移動・インタラクション
 * ミプリンの冒険 v0.2.0
 */
const PlayerController = (() => {

  /* プレイヤー描画色（プレースホルダー） */
  const P_COLOR   = '#F5A623';
  const P_OUTLINE = '#2B1B0E';

  /* ── 移動更新 ── */
  function update(player, dt) {
    if (player.hitStopFrames > 0) {
      player.hitStopFrames--;
      return;
    }

    /* 方向入力 */
    let dx = 0, dy = 0;
    if (Engine.isPressed('up'))    { dy = -1; player.dir = 'up'; }
    if (Engine.isPressed('down'))  { dy =  1; player.dir = 'down'; }
    if (Engine.isPressed('left'))  { dx = -1; player.dir = 'left'; }
    if (Engine.isPressed('right')) { dx =  1; player.dir = 'right'; }

    if (dx !== 0 || dy !== 0) {
      player.lastInputDir = player.dir;
      player.animTimer += dt;
      if (player.animTimer >= 0.15) {
        player.animTimer = 0;
        player.animFrame = (player.animFrame + 1) % 4;
      }

      /* 移動先のタイル座標を計算 */
      const ts = CONFIG.TILE_SIZE;
      const newPx = player.x + dx * player.speed * dt * 60;
      const newPy = player.y + dy * player.speed * dt * 60;

      /* 左上・右下の角で衝突判定 */
      const margin = 4;
      const newCol1 = Math.floor((newPx + margin) / ts);
      const newRow1 = Math.floor((newPy + margin) / ts);
      const newCol2 = Math.floor((newPx + ts - margin - 1) / ts);
      const newRow2 = Math.floor((newPy + ts - margin - 1) / ts);

      /* X軸判定 */
      const testColL = Math.floor((newPx + margin) / ts);
      const testColR = Math.floor((newPx + ts - margin - 1) / ts);
      const curRow1  = Math.floor((player.y + margin) / ts);
      const curRow2  = Math.floor((player.y + ts - margin - 1) / ts);
      if (!MapManager.isSolid(testColL, curRow1) &&
          !MapManager.isSolid(testColR, curRow1) &&
          !MapManager.isSolid(testColL, curRow2) &&
          !MapManager.isSolid(testColR, curRow2) &&
          !MapManager.getNpcAt(testColL, curRow1) &&
          !MapManager.getNpcAt(testColR, curRow1) &&
          !MapManager.getNpcAt(testColL, curRow2) &&
          !MapManager.getNpcAt(testColR, curRow2)) {
        player.x = newPx;
      }

      /* Y軸判定 */
      const curCol1  = Math.floor((player.x + margin) / ts);
      const curCol2  = Math.floor((player.x + ts - margin - 1) / ts);
      const testRow1 = Math.floor((newPy + margin) / ts);
      const testRow2 = Math.floor((newPy + ts - margin - 1) / ts);
      if (!MapManager.isSolid(curCol1, testRow1) &&
          !MapManager.isSolid(curCol2, testRow1) &&
          !MapManager.isSolid(curCol1, testRow2) &&
          !MapManager.isSolid(curCol2, testRow2) &&
          !MapManager.getNpcAt(curCol1, testRow1) &&
          !MapManager.getNpcAt(curCol2, testRow1) &&
          !MapManager.getNpcAt(curCol1, testRow2) &&
          !MapManager.getNpcAt(curCol2, testRow2)) {
        player.y = newPy;
      }
    } else {
      player.animFrame = 0;
      player.animTimer = 0;
    }

    /* クールダウン */
    if (player.attackCooldown > 0) player.attackCooldown--;
    if (player.needleCooldown > 0) player.needleCooldown--;
  }

  /* ── インタラクション判定 ── */
  function checkInteract(player) {
    if (!Engine.consumePress('interact')) return null;

    const ts = CONFIG.TILE_SIZE;
    const centerCol = Math.floor((player.x + ts / 2) / ts);
    const centerRow = Math.floor((player.y + ts / 2) / ts);

    let targetCol = centerCol;
    let targetRow = centerRow;
    switch (player.dir) {
      case 'up':    targetRow--; break;
      case 'down':  targetRow++; break;
      case 'left':  targetCol--; break;
      case 'right': targetCol++; break;
    }

    /* NPC */
    const npc = MapManager.getNpcAt(targetCol, targetRow);
    if (npc) return { type: 'npc', npc: npc };

    /* セーブポイント */
    const tile = MapManager.getTile(targetCol, targetRow);
    if (tile === MapManager.TILE.SAVE_POINT) return { type: 'save' };
    if (tile === MapManager.TILE.SIGN) return { type: 'sign' };
    if (tile === MapManager.TILE.CHEST) return { type: 'chest' };

    return null;
  }

  /* ── 出口判定 ── */
  function checkExit(player) {
    const ts = CONFIG.TILE_SIZE;
    const col = Math.floor((player.x + ts / 2) / ts);
    const row = Math.floor((player.y + ts / 2) / ts);
    return MapManager.getExitAt(col, row);
  }

  /* ── 描画 ── */
  function draw(ctx, player) {
    const ts = CONFIG.TILE_SIZE;
    const x = Math.round(player.x);
    const y = Math.round(player.y);

    /* 影 */
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x + ts / 2, y + ts - 2, ts / 3, ts / 6, 0, 0, Math.PI * 2);
    ctx.fill();

    /* 体（丸） */
    ctx.fillStyle = P_COLOR;
    ctx.strokeStyle = P_OUTLINE;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + ts / 2, y + ts / 2 - 2, ts / 2 - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    /* 方向の目印（小さな三角） */
    ctx.fillStyle = P_OUTLINE;
    ctx.beginPath();
    const cx = x + ts / 2;
    const cy = y + ts / 2 - 2;
    const s = 5;
    switch (player.dir) {
      case 'up':
        ctx.moveTo(cx, cy - s * 2); ctx.lineTo(cx - s, cy - s); ctx.lineTo(cx + s, cy - s);
        break;
      case 'down':
        ctx.moveTo(cx, cy + s * 2); ctx.lineTo(cx - s, cy + s); ctx.lineTo(cx + s, cy + s);
        break;
      case 'left':
        ctx.moveTo(cx - s * 2, cy); ctx.lineTo(cx - s, cy - s); ctx.lineTo(cx - s, cy + s);
        break;
      case 'right':
        ctx.moveTo(cx + s * 2, cy); ctx.lineTo(cx + s, cy - s); ctx.lineTo(cx + s, cy + s);
        break;
    }
    ctx.fill();

    /* 歩きアニメ（バウンス） */
    if (player.animFrame % 2 === 1) {
      /* 足元に小さな点を描く */
      ctx.fillStyle = '#fff';
      ctx.fillRect(x + ts / 2 - 1, y + ts - 4, 3, 3);
    }
  }

  return { update, checkInteract, checkExit, draw };
})();
