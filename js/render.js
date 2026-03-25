// ===== ROOM OFFSCREEN CACHE =====
// drawRoom() の 300タイル×複数fillRect を毎フレーム実行しないよう
// startFloor() 後に一度だけ OffscreenCanvas へ焼き込み、以後は drawImage 1回で済ます
let _roomBuffer = null;
let _roomBufferFloor = -1;

function bakeRoomBuffer() {
  const oc = (typeof OffscreenCanvas !== 'undefined')
    ? new OffscreenCanvas(CW, CH)
    : (() => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return c; })();
  const oc2 = oc.getContext('2d');
  const th = getTheme(floor);
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (tileAt(roomMap, c, r) === 1) {
      oc2.fillStyle = th.wall; oc2.fillRect(c * TILE, r * TILE, TILE, TILE);
      oc2.fillStyle = th.wallTop; oc2.fillRect(c * TILE, r * TILE, TILE, 4);
      oc2.fillStyle = 'rgba(0,0,0,0.15)'; oc2.fillRect(c * TILE, r * TILE + TILE - 4, TILE, 4);
    } else if (tileAt(roomMap, c, r) === 2) {
      oc2.fillStyle = (c + r) % 2 === 0 ? th.floor : th.floorAlt; oc2.fillRect(c * TILE, r * TILE, TILE, TILE);
      oc2.fillStyle = 'rgba(180,60,60,0.45)';
      const sx = c * TILE, sy = r * TILE;
      for (let si = 0; si < 3; si++) for (let sj = 0; sj < 3; sj++) {
        const tx = sx + 8 + si * 18, ty = sy + 8 + sj * 18;
        oc2.beginPath(); oc2.moveTo(tx, ty+10); oc2.lineTo(tx+5, ty); oc2.lineTo(tx+10, ty+10); oc2.fill();
      }
    } else if (tileAt(roomMap, c, r) === 3) {
      // 水場: ベース床 + 青みがかった半透明オーバーレイ
      oc2.fillStyle = (c + r) % 2 === 0 ? th.floor : th.floorAlt; oc2.fillRect(c * TILE, r * TILE, TILE, TILE);
      oc2.fillStyle = 'rgba(50,120,220,0.38)'; oc2.fillRect(c * TILE, r * TILE, TILE, TILE);
      oc2.strokeStyle = 'rgba(100,180,255,0.5)'; oc2.lineWidth = 1;
      oc2.beginPath(); oc2.moveTo(c * TILE + 6, r * TILE + TILE/2); oc2.bezierCurveTo(c * TILE + 12, r * TILE + TILE/2 - 4, c * TILE + 20, r * TILE + TILE/2 - 4, c * TILE + 26, r * TILE + TILE/2); oc2.stroke();
      oc2.beginPath(); oc2.moveTo(c * TILE + 10, r * TILE + TILE/2 + 7); oc2.bezierCurveTo(c * TILE + 16, r * TILE + TILE/2 + 3, c * TILE + 24, r * TILE + TILE/2 + 3, c * TILE + 30, r * TILE + TILE/2 + 7); oc2.stroke();
    } else if (tileAt(roomMap, c, r) === 4) {
      // 草むら: ベース床 + 緑の草描画
      oc2.fillStyle = (c + r) % 2 === 0 ? th.floor : th.floorAlt; oc2.fillRect(c * TILE, r * TILE, TILE, TILE);
      oc2.fillStyle = 'rgba(40,160,60,0.45)'; oc2.fillRect(c * TILE, r * TILE, TILE, TILE);
      oc2.fillStyle = '#27ae60';
      const gx = c * TILE, gy = r * TILE;
      for (let gi = 0; gi < 5; gi++) {
        const gbx = gx + 6 + gi * 9, gby = gy + TILE - 4;
        oc2.beginPath(); oc2.moveTo(gbx, gby); oc2.quadraticCurveTo(gbx - 3, gby - 10, gbx, gby - 14); oc2.quadraticCurveTo(gbx + 3, gby - 10, gbx, gby); oc2.fill();
      }
    } else {
      oc2.fillStyle = (c + r) % 2 === 0 ? th.floor : th.floorAlt; oc2.fillRect(c * TILE, r * TILE, TILE, TILE);
      oc2.strokeStyle = 'rgba(255,255,255,0.03)'; oc2.strokeRect(c * TILE, r * TILE, TILE, TILE);
    }
  }
  _roomBuffer = oc;
  _roomBufferFloor = floor;
}

function drawRoom() {
  // フロアが変わった / バッファ未生成の場合のみ再ベイク
  if (!_roomBuffer || _roomBufferFloor !== floor) bakeRoomBuffer();
  ctx.drawImage(_roomBuffer, 0, 0);
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

  if (gameState === 'charmDrop' && typeof drawCharmDrop === 'function') drawCharmDrop();
  if (gameState === 'weaponDrop' && weaponPopup.active) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, CW, CH);
      ctx.fillStyle = '#ffd700'; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
      // Rarity light pillar
    var _wpR = weaponPopup.weapon.rarity || 'normal';
    var _pillarCol = _wpR === 'legend' ? '#e67e22' : _wpR === 'miracle' ? '#e056fd' : _wpR === 'great' ? '#ffd700' : _wpR === 'fine' ? '#87ceeb' : null;
    if (_pillarCol) {
      ctx.save();
      var _pa = 0.3 + Math.sin(Date.now() / 300) * 0.15;
      ctx.globalAlpha = _pa;
      var _pg = ctx.createLinearGradient(CW/2, 0, CW/2, CH);
      _pg.addColorStop(0, _pillarCol); _pg.addColorStop(0.5, 'transparent'); _pg.addColorStop(1, _pillarCol);
      ctx.fillStyle = _pg;
      ctx.fillRect(CW/2 - 30, 0, 60, CH);
      ctx.restore();
    }
    // Rarity name color
    var _nameCol = _wpR === 'legend' ? '#e67e22' : _wpR === 'miracle' ? '#e056fd' : _wpR === 'great' ? '#ffd700' : _wpR === 'fine' ? '#87ceeb' : '#fff';
    // Weapon sprite with rarity tint
    var _wpSprId = 'weapon_' + weaponPopup.weapon.id;
    if (typeof hasSprite === 'function' && hasSprite(_wpSprId)) {
      ctx.save();
      var _wprf = (typeof getRarityFilter === 'function') ? getRarityFilter(_wpR) : 'none';
      if (_wprf !== 'none') ctx.filter = _wprf;
      drawSpriteImg(_wpSprId, CW / 2 - 32, CH / 2 - 110, 64, 64);
      ctx.restore();
    }
    // Weapon sprite with rarity tint
    var _wpSprId = 'weapon_' + weaponPopup.weapon.id;
    if (typeof hasSprite === 'function' && hasSprite(_wpSprId)) {
      ctx.save();
      var _wprf = (typeof getRarityFilter === 'function') ? getRarityFilter(_wpR) : 'none';
      if (_wprf !== 'none') ctx.filter = _wprf;
      drawSpriteImg(_wpSprId, CW / 2 - 32, CH / 2 - 110, 64, 64);
      ctx.restore();
    }
    ctx.fillStyle = _nameCol; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText(weaponPopup.weapon.icon + ' ' + weaponPopup.weapon.name + (weaponPopup.sparkle ? ' ✦' : ''), CW / 2, CH / 2 - 40);
      ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('ATK: ' + weaponPopup.weapon.atk + '  ' + (weaponPopup.weapon.desc || ''), CW / 2, CH / 2);
      ctx.fillText('Z: おきにいりに  Q: もうひとつに  X: すてる', CW / 2, CH / 2 + 40);
      ctx.textAlign = 'left';
    }
    if (gameState === 'dead') {
      ctx.fillStyle = 'rgba(30,10,25,0.78)'; ctx.fillRect(0, 0, CW, CH);

      if (deadImgReady) {
        ctx.save(); ctx.globalAlpha = 0.85;
        const dsz = 280;
        ctx.beginPath(); ctx.arc(CW/2, CH - dsz/2 - 30, dsz/2, 0, Math.PI * 2); ctx.clip();
        ctx.drawImage(deadMipurinImg, CW/2 - dsz/2, CH - dsz - 30, dsz, dsz);
        ctx.restore();
      } else if (mipurinReady) {
        ctx.save(); ctx.globalAlpha = 0.5;
        const dsz = 100;
        ctx.drawImage(mipurinImg, 0, 0, 250, 250, CW/2 - dsz/2, CH - dsz - 60, dsz, dsz);
        ctx.restore();
      }

      const panelX = CW/2 - 320, panelY = 100, panelW = 640, panelH = 360;
      ctx.fillStyle = 'rgba(20,5,15,0.72)';
      ctx.beginPath();
      const pr = 20;
      ctx.moveTo(panelX + pr, panelY);
      ctx.lineTo(panelX + panelW - pr, panelY);
      ctx.quadraticCurveTo(panelX + panelW, panelY, panelX + panelW, panelY + pr);
      ctx.lineTo(panelX + panelW, panelY + panelH - pr);
      ctx.quadraticCurveTo(panelX + panelW, panelY + panelH, panelX + panelW - pr, panelY + panelH);
      ctx.lineTo(panelX + pr, panelY + panelH);
      ctx.quadraticCurveTo(panelX, panelY + panelH, panelX, panelY + panelH - pr);
      ctx.lineTo(panelX, panelY + pr);
      ctx.quadraticCurveTo(panelX, panelY, panelX + pr, panelY);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,100,120,0.3)'; ctx.lineWidth = 2; ctx.stroke();

      ctx.fillStyle = COL.hpLost;
      ctx.font = "bold 64px 'M PLUS Rounded 1c', sans-serif";
      ctx.textAlign = 'center';
      ctx.fillText('おやすみ、ミプリン…', CW/2, panelY + 80);

      ctx.fillStyle = '#ddd';
      ctx.font = "28px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('スコア: ' + score + '  フロア: ' + floor + '  花粉: ' + pollen, CW/2, panelY + 145);

      ctx.fillStyle = '#ffd700';
      ctx.font = "bold 26px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('獲得ネクター: +' + runNectar, CW/2, panelY + 195);

      if (deadTimer > 1.0) {
        const DEATH_LINES = ['まだ…負けないもん…','お花…守らなきゃ…','うぅ…くやしい…','フローラさん…ごめんね…','つぎは…がんばる…'];
        ctx.font = "italic 22px 'M PLUS Rounded 1c', sans-serif";
        ctx.fillStyle = '#ffb7c5';
        ctx.fillText('\u300C' + DEATH_LINES[Math.floor((deadTimer - 1.0) * 1.7) % DEATH_LINES.length] + '\u300D', CW/2, panelY + 260);
      }

      ctx.font = "22px 'M PLUS Rounded 1c', sans-serif";
      if (deadTimer > 2.0) {
        if (typeof touchActive !== 'undefined' && touchActive) {
          ctx.fillStyle = '#ffcc00';
          var _dbx=CW/2-200,_dby=panelY+290,_dbw=400,_dbh=60;
          ctx.beginPath(); ctx.moveTo(_dbx+30,_dby); ctx.lineTo(_dbx+_dbw-30,_dby);
          ctx.quadraticCurveTo(_dbx+_dbw,_dby,_dbx+_dbw,_dby+30); ctx.lineTo(_dbx+_dbw,_dby+_dbh-30);
          ctx.quadraticCurveTo(_dbx+_dbw,_dby+_dbh,_dbx+_dbw-30,_dby+_dbh); ctx.lineTo(_dbx+30,_dby+_dbh);
          ctx.quadraticCurveTo(_dbx,_dby+_dbh,_dbx,_dby+_dbh-30); ctx.lineTo(_dbx,_dby+30);
          ctx.quadraticCurveTo(_dbx,_dby,_dbx+30,_dby); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#1a1a2e'; ctx.font = "bold 26px 'M PLUS Rounded 1c', sans-serif";
          ctx.fillText('タップしてタイトルへ', CW/2, _dby+38);
        } else {
          const blinkOn = Math.floor(Date.now() / 500) % 2 === 0;
          ctx.fillStyle = blinkOn ? '#fff' : 'rgba(255,255,255,0.3)';
          ctx.fillText('Zキーでタイトルへ', CW/2, panelY + 320);
        }
      } else {
        ctx.fillStyle = '#888';
        ctx.fillText('しばらくおまちください...', CW/2, panelY + 320);
      }
      ctx.textAlign = 'left';
    }
}

function draw() {
  if (gameState === 'ending') { drawEnding(); return; }
  if (gameState === 'memorySelect') { drawMemorySelect(); return; }
  if (gameState === 'prologue') { drawPrologue(); return; } if (gameState === 'garden') { drawGarden(); return; }
  if (gameState === 'title') { drawTitle(); return; }
  if (gameState === 'cutin') {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CW, CH);
    var silImg = bossSilhouettes[cutinBossId];
    if (silImg) {
      var prog = 0;
      if (cutinPhase === 'slidein') { prog = Math.min(1, cutinTimer / 0.6); var sx = CW * (1 - prog); ctx.globalAlpha = prog; ctx.drawImage(silImg, sx, 0, CW, CH); ctx.globalAlpha = 1; }
      else if (cutinPhase === 'hold') { var pulse = 1 + Math.sin(cutinTimer * 8) * 0.03; ctx.save(); ctx.translate(CW/2, CH/2); ctx.scale(pulse, pulse); ctx.drawImage(silImg, -CW/2, -CH/2, CW, CH); ctx.restore(); ctx.fillStyle = '#fff'; ctx.globalAlpha = 0.9; ctx.font = "bold 48px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; var bname = boss ? boss.name : '???'; ctx.fillText(bname, CW/2, CH - 100); ctx.globalAlpha = 1; ctx.textAlign = 'left'; }
      else if (cutinPhase === 'fade') { ctx.globalAlpha = 1 - cutinTimer / 0.5; ctx.drawImage(silImg, 0, 0, CW, CH); ctx.globalAlpha = 1; }
    }
    return;
  }

  ctx.save();
  if (shakeTimer > 0) ctx.translate((Math.random() - 0.5) * shakeIntensity * 2, (Math.random() - 0.5) * shakeIntensity * 2);

  const th = getTheme(floor); ctx.fillStyle = th.bg; ctx.fillRect(0, 0, CW, CH);
  drawRoom(); drawBgParticles(); if (typeof drawHoneyPools === 'function') drawHoneyPools(); drawDashTrail(); drawDrops();
  // H-A2: 爆発樽描画（エンティティの下レイヤー）
  if (typeof drawBarrels === 'function') drawBarrels();
  for (const en of enemies) if (en.hp > 0) drawTelegraph(en);
  for (const en of enemies) if (en.hp > 0) { drawEntity(en, en.color, false); drawHPBar(en, -8); }
  drawBoss(); drawProjectiles(); if (typeof drawHomingProjs === 'function') drawHomingProjs(); drawAttackEffect();
  // H-A2: 草むら中はプレイヤー半透明
  if (player._inBush) { ctx.globalAlpha = 0.38; }
  drawEntity(player, COL.player, true);
  if (player._inBush) { ctx.globalAlpha = 1; }
  // H-B: パリィ窓ビジュアル（盾の光輪）
  if (player._parryWindow > 0) {
    const _pr = (player.w * 0.72) * (player.weapon.id === 'holy_shield' ? 1.3 : 1.0);
    const _pa = player._parryWindow * (player.weapon.id === 'holy_shield' ? 2.8 : 5.0); // フェード
    ctx.save();
    ctx.globalAlpha = Math.min(0.8, _pa);
    ctx.strokeStyle = player.weapon.id === 'holy_shield' ? '#fff0d0' : '#f1c40f';
    ctx.lineWidth = player.weapon.id === 'holy_shield' ? 3.5 : 2.5;
    ctx.shadowColor = player.weapon.id === 'holy_shield' ? '#fff0d0' : '#ffd700';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(player.x + player.w/2, player.y + player.h/2, _pr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // H-A2: 水場中は青いリップルエフェクト
  if (player._inWater) {
    const _wp = player.x + player.w/2, _wq = player.y + player.h/2;
    const _wa = (Math.sin(Date.now() / 200) * 0.15 + 0.25);
    ctx.globalAlpha = _wa; ctx.strokeStyle = '#60b0ff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(_wp, _wq + player.h/3, player.w * 0.7, 6, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if(typeof bubbles!=="undefined"&&bubbles.length>0){
    const b=bubbles[0]; ctx.save(); ctx.globalAlpha=Math.max(0,b.alpha);
    let bx=player.x+player.w/2, by=player.y-30; const bw2=ctx.measureText(b.text).width+24; if(bx-bw2/2<10)bx=10+bw2/2; if(bx+bw2/2>CW-10)bx=CW-10-bw2/2; if(by-30<10)by=40;
    const bw=bw2, bh=30, rx=bx-bw/2, ry=by-bh;
    ctx.fillStyle='rgba(255,255,255,0.92)';
    ctx.beginPath(); ctx.moveTo(rx+8,ry); ctx.lineTo(rx+bw-8,ry);
    ctx.quadraticCurveTo(rx+bw,ry,rx+bw,ry+8); ctx.lineTo(rx+bw,ry+bh-8);
    ctx.quadraticCurveTo(rx+bw,ry+bh,rx+bw-8,ry+bh); ctx.lineTo(bx+4,ry+bh);
    ctx.lineTo(bx,ry+bh+8); ctx.lineTo(bx-4,ry+bh); ctx.lineTo(rx+8,ry+bh);
    ctx.quadraticCurveTo(rx,ry+bh,rx,ry+bh-8); ctx.lineTo(rx,ry+8);
    ctx.quadraticCurveTo(rx,ry,rx+8,ry); ctx.fill();
    ctx.fillStyle='#5a3040'; ctx.font='bold 14px "M PLUS Rounded 1c"';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(b.text, bx, ry+bh/2); ctx.restore();
  } drawParticles(); drawDmgNumbers(); drawHUD();

  ctx.restore();
  if (gameState === 'dialog' && lastBossId && bossSilhouettes[lastBossId] && !boss && cutinTimer > 0) { ctx.save(); ctx.globalAlpha = 0.18 + Math.sin(Date.now() / 400) * 0.04; ctx.drawImage(bossSilhouettes[lastBossId], 0, 0, CW, CH); ctx.restore(); }
  drawGameState(); drawBlessing(); drawShop();

  drawInventory();
  if (fadeAlpha > 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
  drawFloatMessages();
  drawDialogWindow();
  if (typeof updateTouch === 'function') updateTouch();
  if (typeof drawTouchUI === 'function') drawTouchUI();
}

let lastTime = 0;
function loop(time) {
  const rawDt = (time - lastTime) / 1000; lastTime = time;
  const dt = Math.min(rawDt, 0.05);
  if (hitStopTimer > 0) { hitStopTimer -= dt; draw(); } else { update(dt); draw(); }
  for (const k in pressed) pressed[k] = false;
  requestAnimationFrame(loop);
}
requestAnimationFrame(t => { lastTime = t; requestAnimationFrame(loop); });


