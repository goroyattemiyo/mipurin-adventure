// ===== UPDATE =====
function update(dt) {
  updateFade(dt);
  updateMessages(dt);

  if (gameState === 'ending') {
    if (wasPressed('KeyZ')) { nectar += runNectar; saveMeta(); stopBGM(); gameState = 'title'; floor = 1; resetGame(); }
    return;
  }
  if (gameState === 'title') { titleBlink += dt;
    if (wasPressed('KeyZ')) { prologuePage = 0; prologueFade = 0; prologueTimer = 0; prologueGuard = 0.3; playBGM('forest_south'); gameState = 'prologue'; }
    if (wasPressed('KeyX')) { gameState = 'garden'; gardenCursor = 0; Audio.menu_select(); }
    return; }
  if (gameState === 'garden') {
    if (wasPressed('ArrowUp') || wasPressed('KeyW')) { gardenCursor = Math.max(0, gardenCursor - 1); Audio.menu_move(); }
    if (wasPressed('ArrowDown') || wasPressed('KeyS')) { gardenCursor = Math.min(GARDEN_DEFS.length - 1, gardenCursor + 1); Audio.menu_move(); }
    if (wasPressed('KeyZ')) {
      const def = GARDEN_DEFS[gardenCursor];
      const cost = getGardenCost(def.id);
      if (cost > 0 && nectar >= cost) { nectar -= cost; gardenUpgrades[def.id] = (gardenUpgrades[def.id]||0) + 1; saveMeta(); Audio.level_up(); }
      else { Audio.hit(); }
    }
    if (wasPressed('KeyX') || wasPressed('Escape')) { gameState = 'title'; Audio.menu_select(); }
    return; }
  if (gameState === 'prologue') { updatePrologue(dt); return; }
  // Inventory toggle
  if (wasPressed('Tab')) { inventoryOpen = !inventoryOpen; if (!inventoryOpen) inventoryTab = 0; }
  if (inventoryOpen) {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) inventoryTab = 0;
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) inventoryTab = 1;
    return;
  }
  // Dialog state - pause game, Z to advance
  if (gameState === 'dialog') {
    if (wasPressed('KeyZ') || wasPressed('Enter')) { advanceDialog(); }
    return;
  }
  if (gameState === 'blessing') {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { selectCursor = (selectCursor - 1 + blessingChoices.length) % blessingChoices.length; Audio.menu_move(); }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) { selectCursor = (selectCursor + 1) % blessingChoices.length; Audio.menu_move(); }
    if (wasPressed('Digit1') && blessingChoices[0]) { selectCursor = 0; }
    if (wasPressed('Digit2') && blessingChoices[1]) { selectCursor = 1; }
    if (wasPressed('Digit3') && blessingChoices[2]) { selectCursor = 2; }
    if ((wasPressed('KeyZ') || wasPressed('Enter')) && blessingChoices[selectCursor]) {
      const chosenB = blessingChoices[selectCursor]; chosenB.apply(); activeBlessings.push(chosenB); checkDuos(); Audio.level_up(); showFloat(chosenB.icon + ' ' + chosenB.name + ' はつどう！', 2.5, MSG_COLORS.info); nextFloor(); }
    return;
  }
  if (gameState === 'shop') {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { selectCursor = (selectCursor - 1 + (shopItems.length + 1)) % (shopItems.length + 1); Audio.menu_move(); }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) { selectCursor = (selectCursor + 1) % (shopItems.length + 1); Audio.menu_move(); }
    if (wasPressed('ArrowUp') || wasPressed('KeyW')) { selectCursor = Math.max(0, selectCursor - 3); Audio.menu_move(); }
    if (wasPressed('ArrowDown') || wasPressed('KeyS')) { selectCursor = Math.min(shopItems.length, selectCursor + 3); Audio.menu_move(); }
    for (let i = 0; i < shopItems.length; i++) {
      if (wasPressed('Digit' + (i + 1))) { selectCursor = i; }
    }
    if ((wasPressed('KeyZ') || wasPressed('Enter')) && selectCursor < shopItems.length && pollen >= shopItems[selectCursor].cost) {
      pollen -= shopItems[selectCursor].cost; shopItems[selectCursor].action(); Audio.menu_select(); shopItems.splice(selectCursor, 1);
      selectCursor = Math.min(selectCursor, shopItems.length); }
    if (wasPressed('Escape') || wasPressed('KeyX') || (selectCursor >= shopItems.length && (wasPressed('KeyZ') || wasPressed('Enter')))) {
      blessingChoices = pickBlessings(); selectCursor = 0;
      gameState = 'dialog';
      showDialog('ミプリン', ['祝福の花が咲いた！ ひとつ えらんでね！'], function() { gameState = 'blessing'; });
    }
    return;
  }
  if (gameState === 'waveWait') { clearTimer += dt; if (clearTimer > 1.0) { spawnWave(); gameState = 'playing'; } return; }
  if (gameState === 'floorClear') { clearTimer += dt; if (clearTimer > 1.5) {
      if (floor >= MAX_FLOOR && isBossFloor()) { stopBGM(); playBGM('ending'); gameState = 'ending'; return; }
    generateNodes(); gameState = 'nodeSelect';
  } return; }
  if (gameState === 'nodeSelect') {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { nodeCursor = (nodeCursor + 2) % 3; Audio.menu_move(); }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) { nodeCursor = (nodeCursor + 1) % 3; Audio.menu_move(); }
    if (wasPressed('KeyZ')) { Audio.menu_select(); executeNode(nodeChoices[nodeCursor]); }
    return;
  }
  if (gameState === 'event') {
    if (eventPhase === 'choose') {
      if (wasPressed('ArrowUp') || wasPressed('KeyW')) { nodeCursor = 0; Audio.menu_move(); }
      if (wasPressed('ArrowDown') || wasPressed('KeyS')) { nodeCursor = 1; Audio.menu_move(); }
      if (wasPressed('KeyZ')) {
        Audio.menu_select();
        if (nodeCursor === 0) currentEvent.a.apply();
        else currentEvent.b.apply();
        eventPhase = 'done';
      }
    } else if (eventPhase === 'done') {
      if (wasPressed('KeyZ')) { nextFloor(); }
    }
    return;
  }

  if (gameState === 'dead') { deadTimer += dt; if (deadTimer > 2.0 && wasPressed('KeyZ')) { nectar += runNectar; saveMeta(); stopBGM(); gameState = 'title'; floor = 1; resetGame(); } return; }
    if (gameState === 'weaponDrop' && weaponPopup.active) {
      // Z: equip as main
      if (wasPressed('KeyZ')) {
        const w = {...weaponPopup.weapon};
        if (weaponPopup.sparkle) w.dmgMul = (w.dmgMul || 1) + 0.2;
        player.weapons[player.weaponIdx] = w; player.weapon = w;
        if (typeof weaponCollection !== 'undefined') weaponCollection.add(w.id);
        saveCollection();
        Audio.level_up(); weaponPopup.active = false; gameState = 'playing';
      }
      // Q: put in sub slot
      if (wasPressed('KeyQ')) {
        const w = {...weaponPopup.weapon};
        if (weaponPopup.sparkle) w.dmgMul = (w.dmgMul || 1) + 0.2;
        const subIdx = 1 - player.weaponIdx;
        player.weapons[subIdx] = w;
        if (typeof weaponCollection !== 'undefined') weaponCollection.add(w.id);
        saveCollection();
        showFloat(w.name + ' をサブにセット！ Qで持ちかえ！', 2.5, MSG_COLORS.buff);
        Audio.level_up(); weaponPopup.active = false; gameState = 'playing';
      }
      // X: discard
      if (wasPressed('KeyX')) { Audio.menu_move(); weaponPopup.active = false; gameState = 'playing'; }
      return;
    }

  // === Consumable use (1/2/3) ===
  for (let ci = 0; ci < 3; ci++) {
    if (wasPressed('Digit' + (ci + 1)) && player.consumables[ci]) {
      const item = player.consumables[ci];
      item.apply();
      showFloat(item.msg, 2.5, MSG_COLORS.info);
      emitParticles(player.x + player.w/2, player.y + player.h/2, '#fff', 6, 60, 0.3);
      Audio.item_get();
      player.consumables[ci] = null;
    }
  }

  // === Weapon swap (Q key) ===
  if (wasPressed('KeyQ') && player.weapons[1] !== null) {
    player.weaponIdx = 1 - player.weaponIdx;
    player.weapon = player.weapons[player.weaponIdx];
    Audio.menu_select();
    spawnDmg(player.x + player.w/2, player.y - 10, 0, '#ffd700');
    showFloat('ぶんぶん♪ ' + player.weapon.name, 1.5, MSG_COLORS.info);
  }

  // === Player movement ===
  let mx = 0, my = 0;
  if (isDown('ArrowLeft') || isDown('KeyA')) mx -= 1;
  if (isDown('ArrowRight') || isDown('KeyD')) mx += 1;
  if (isDown('ArrowUp') || isDown('KeyW')) my -= 1;
  if (isDown('ArrowDown') || isDown('KeyS')) my += 1;
  if (mx !== 0 && my !== 0) { mx *= 0.707; my *= 0.707; }
  if (mx !== 0 || my !== 0) {
    player.atkDir.x = Math.sign(mx || 0); player.atkDir.y = Math.sign(my || 0);
    if (mx !== 0) player.atkDir.y = 0; if (my !== 0 && mx === 0) player.atkDir.x = 0;
  }

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  // Spike damage (トゲ床) - dash makes you immune
  if (!player.dashing && player.invTimer <= 0) {
    const spc = Math.floor((player.x + player.w/2) / TILE);
    const spr = Math.floor((player.y + player.h/2) / TILE);
    if (spc >= 0 && spc < COLS && spr >= 0 && spr < ROWS && roomMap[spr * COLS + spc] === 2) {
      player.hp -= 1; player.invTimer = player.invDuration;
      Audio.player_hurt();
      emitParticles(player.x + player.w/2, player.y + player.h/2, '#ff4444', 5, 80, 0.3);
      showFloat('いたっ！ トゲ床だ！', 1.5, MSG_COLORS.warn);
      if (player.hp <= 0) { gameState = 'dead'; Audio.game_over(); stopBGM(); }
    }
  }
  if (player.dashing) { player.dashTimer -= dt; if (player.dashTimer <= 0) player.dashing = false;
    else moveWithCollision(player, player.dashDir.x * player.dashSpeed * dt, player.dashDir.y * player.dashSpeed * dt); }
  else {
    if (wasPressed('KeyX') && player.dashCooldown <= 0) {
      player.dashing = true; player.dashTimer = player.dashDuration; player.dashCooldown = 0.5;
      player.dashDir.x = (mx !== 0 || my !== 0) ? mx : player.atkDir.x;
      player.dashDir.y = (mx !== 0 || my !== 0) ? my : player.atkDir.y; player.invTimer = player.dashDuration; Audio.dash();
      emitParticles(player.x + player.w / 2, player.y + player.h / 2, COL.player, 5, 60, 0.2);
    }
    if (!player.dashing && !player.attacking) moveWithCollision(player, mx * player.speed * dt, my * player.speed * dt);
  }

  // === Attack ===
  player.atkCooldown = Math.max(0, player.atkCooldown - dt);
  if (wasPressed('KeyZ') && player.atkCooldown <= 0 && !player.attacking && !player.dashing) {
    player.attacking = true; player.atkTimer = player.weapon.dur; player.atkCooldown = player.weapon.speed * (1 - Math.min(player.atkSpeedBonus, 0.7));
    const atkDmg = Math.ceil(player.atk * player.weapon.dmgMul);
    const wfx = player.weapon.fx || 'none';
    // 360 whip: hit all around
    const r360 = 40 + (player.atkRangeBonus || 0); const box = wfx === '360' ? {x: player.x + player.w/2 - r360, y: player.y + player.h/2 - r360, w: r360 * 2, h: r360 * 2} : getAttackBox();
    // AOE hammer: larger box + shockwave
    const hitBox = wfx === 'aoe' ? {x: box.x - 16, y: box.y - 16, w: box.w + 32, h: box.h + 32} : box;
    if (wfx === 'aoe') { shakeTimer = 0.1; shakeIntensity = 6; emitParticles(box.x + box.w/2, box.y + box.h/2, '#b97', 10, 100, 0.3); }
    // Double dagger: schedule second hit
    if (wfx === 'double') { setTimeout(() => { if (gameState !== 'playing') return;
      for (const en2 of enemies) { if (en2.hp <= 0) continue;
        if (rectOverlap(getAttackBox(), en2)) { en2.hp -= atkDmg; en2.hitFlash = 0.1; hitStopTimer = 0.05; const kb = 16; const ka = Math.atan2(en2.y - player.y, en2.x - player.x); moveWithCollision(en2, Math.cos(ka)*kb, Math.sin(ka)*kb); spawnDmg(en2.x + en2.w/2, en2.y, atkDmg, '#ffa'); emitParticles(en2.x+en2.w/2, en2.y+en2.h/2, '#fff', 5, 80, 0.2); Audio.hit(); }}
      if (boss && boss.hp > 0 && rectOverlap(getAttackBox(), boss)) { boss.hp -= atkDmg; boss.hitFlash = 0.1; hitStopTimer = 0.07; spawnDmg(boss.x + boss.w/2, boss.y, atkDmg, '#ffa'); emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#ffd700', 6, 90, 0.25); Audio.hit(); }
    }, 80); }
    const hitEnList = [];
    // Hit enemies
    for (const en of enemies) { if (en.hp <= 0) continue;
      if (rectOverlap(hitBox, en)) { en.hp -= atkDmg; en.hitFlash = 0.1; hitStopTimer = 0.05; const kb2 = 16; const ka2 = Math.atan2(en.y - player.y, en.x - player.x); moveWithCollision(en, Math.cos(ka2)*kb2, Math.sin(ka2)*kb2); emitParticles(en.x+en.w/2, en.y+en.h/2, '#fff', 5, 80, 0.2); spawnDmg(en.x + en.w / 2, en.y, atkDmg, COL.dmg);
        shakeTimer = 0.05; shakeIntensity = 3; Audio.hit();
        emitParticles(en.x + en.w / 2, en.y + en.h / 2, player.weapon.color, 3, 60, 0.2);
        const angle = Math.atan2(en.y - player.y, en.x - player.x);
        moveWithCollision(en, Math.cos(angle) * (wfx === 'pierce' ? 8 : 20), Math.sin(angle) * (wfx === 'pierce' ? 8 : 20));
        hitEnList.push(en); } }
    // Hit boss
    if (boss && boss.hp > 0 && rectOverlap(hitBox, boss)) {
      boss.hp -= atkDmg; boss.hitFlash = 0.1; hitStopTimer = 0.07; emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#ffd700', 6, 90, 0.25); spawnDmg(boss.x + boss.w / 2, boss.y, atkDmg, COL.dmg);
      shakeTimer = 0.06; shakeIntensity = 4; Audio.hit();
      emitParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, player.weapon.color, 5, 80, 0.3);
    }
  }
  if (player.attacking) { player.atkTimer -= dt; if (player.atkTimer <= 0) player.attacking = false; }
  player.invTimer = Math.max(0, player.invTimer - dt);
  player.animTimer += dt; if (player.animTimer > 0.15) { player.animTimer = 0; player.frame = (player.frame + 1) % 4; }

  // === Enemy AI ===
  for (const en of enemies) {
    if (en.hp <= 0) continue;
    en.hitFlash = Math.max(0, en.hitFlash - dt); en.stateTimer += dt;
    const dx = player.x - en.x, dy = player.y - en.y, d = Math.hypot(dx, dy) || 1;

    if (en.pattern === 'wander') {
      en.wanderTimer -= dt; if (en.wanderTimer <= 0) { const a = Math.random() * Math.PI * 2;
        en.wanderDir = { x: Math.cos(a), y: Math.sin(a) }; en.wanderTimer = 1 + Math.random() * 2; }
      moveWithCollision(en, en.wanderDir.x * en.speed * dt, en.wanderDir.y * en.speed * dt);
    }
    if (en.pattern === 'chase' && d > 0) moveWithCollision(en, (dx / d) * en.speed * dt, (dy / d) * en.speed * dt);
    if (en.pattern === 'charge') {
      if (en.state === 'idle') { en.wanderTimer -= dt;
        if (en.wanderTimer <= 0) { const a = Math.random() * Math.PI * 2; en.wanderDir = { x: Math.cos(a), y: Math.sin(a) }; en.wanderTimer = 1.5 + Math.random(); }
        moveWithCollision(en, en.wanderDir.x * 30 * dt, en.wanderDir.y * 30 * dt);
        if (d < 250) { en.state = 'telegraph'; en.telegraphTimer = en.telegraphTime || 0.6; en.chargeDir = { x: dx / d, y: dy / d }; } }
      if (en.state === 'telegraph') { en.telegraphTimer -= dt; if (en.telegraphTimer <= 0) { en.state = 'charging'; en.stateTimer = 0; } }
      if (en.state === 'charging') { moveWithCollision(en, en.chargeDir.x * (en.chargeSpeed || 300) * dt, en.chargeDir.y * (en.chargeSpeed || 300) * dt);
        if (en.stateTimer > (en.chargeTime || 0.3)) { en.state = 'cooldown'; en.stateTimer = 0; } }
      if (en.state === 'cooldown' && en.stateTimer > 0.8) { en.state = 'idle'; en.stateTimer = 0; en.wanderTimer = 0; }
    }
    if (en.pattern === 'shoot') {
      en.shootTimer -= dt;
      if (en.shootTimer <= 0) { en.shootTimer = en.shootInterval || 2; spawnProjectile(en.x + en.w / 2, en.y + en.h / 2, dx, dy, 100, en.dmg, false); }
    }
    if (en.pattern === 'teleport') {
      en.wanderTimer -= dt;
      if (en.wanderTimer <= 0) { en.x = TILE * (2 + Math.floor(Math.random() * (COLS - 4))); en.y = TILE * (2 + Math.floor(Math.random() * (ROWS - 4)));
      while (tileAt(roomMap, Math.floor(en.x / TILE), Math.floor(en.y / TILE)) === 1) { en.x = TILE * (2 + Math.floor(Math.random() * (COLS - 4))); en.y = TILE * (2 + Math.floor(Math.random() * (ROWS - 4))); }
        emitParticles(en.x + en.w / 2, en.y + en.h / 2, en.color, 6, 60, 0.3); en.wanderTimer = 2 + Math.random() * 2; }
      if (d < 200 && d > 0) moveWithCollision(en, (dx / d) * en.speed * 0.5 * dt, (dy / d) * en.speed * 0.5 * dt);
    }

    // Contact damage
    if (player.invTimer <= 0 && !player.dashing) {
      if (rectOverlap({ x: player.x, y: player.y, w: player.w, h: player.h }, { x: en.x, y: en.y, w: en.w, h: en.h })) {
        player.hp -= en.dmg; player.invTimer = player.invDuration; shakeTimer = 0.1; shakeIntensity = 5;
        spawnDmg(player.x + player.w / 2, player.y, en.dmg, '#fff'); Audio.player_hurt();
        emitParticles(player.x + player.w / 2, player.y + player.h / 2, '#fff', 4, 80, 0.2);
        const angle = Math.atan2(player.y - en.y, player.x - en.x); moveWithCollision(player, Math.cos(angle) * 30, Math.sin(angle) * 30);
        if (player.thorns) { en.hp -= player.thorns; en.hitFlash = 0.1; spawnDmg(en.x + en.w / 2, en.y, player.thorns, '#c0392b'); }
        if (player.hp <= 0) { gameState = 'dead'; deadTimer = 0; Audio.game_over(); stopBGM(); }
      }
    }
  }

  // Boss update
  updateBoss(dt);

  // Remove dead enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hp <= 0) {
      score += enemies[i].score;
      emitParticles(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, enemies[i].color, 15, 120, 0.5);
      Audio.enemy_die();
      if (player.vampiric) player.hp = Math.min(player.hp + 1, player.maxHp);
      // Drops
      if (Math.random() < 0.4) spawnDrop(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, 'pollen');
      if (Math.random() < 0.20) spawnDrop(enemies[i].x + enemies[i].w / 2 + 10, enemies[i].y + enemies[i].h / 2, 'heal');
      recordEnemy(enemies[i].name || enemies[i].type, true);
      enemies.splice(i, 1);
    }
  }

  // Boss death
  if (boss && boss.hp <= 0) {
    score += boss.score || 200; Audio.door_open();
    emitParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.color, 20, 120, 0.6);
    for (let i = 0; i < 5; i++) spawnDrop(boss.x + boss.w / 2 + (Math.random() - 0.5) * 40, boss.y + boss.h / 2 + (Math.random() - 0.5) * 40, 'pollen');
    boss = null; gameState = 'floorClear'; clearTimer = 0;
  }

  // Wave clear
  if (!boss && enemies.length === 0 && gameState === 'playing') {
    wave++;
    if (wave >= WAVES.length) { gameState = 'floorClear'; clearTimer = 0; Audio.door_open(); }
    else { gameState = 'waveWait'; clearTimer = 0; }
  }

  // Projectiles, drops, particles, dmg numbers
  updateProjectiles(dt); updateDrops(dt); updateParticles(dt);
  for (let i = dmgNumbers.length - 1; i >= 0; i--) { dmgNumbers[i].life -= dt; dmgNumbers[i].y -= 40 * dt; if (dmgNumbers[i].life <= 0) dmgNumbers.splice(i, 1); }
  shakeTimer = Math.max(0, shakeTimer - dt);
}

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
  const box = getAttackBox();
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const ba = Math.atan2(player.atkDir.y, player.atkDir.x);
  const wc = player.weapon.color || '#fff';
  const progress = 1 - (player.atkTimer / player.atkDuration);
  ctx.save();
  // Dark outline for contrast on any background
  ctx.globalAlpha = 0.5 * (1 - progress);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(cx, cy, 26 + progress * 14, ba - 1.1, ba + 1.1); ctx.stroke();
  // Main slash arc (bright)
  ctx.globalAlpha = 0.9 * (1 - progress);
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, cy, 26 + progress * 14, ba - 1.0, ba + 1.0); ctx.stroke();
  // Weapon color arc
  ctx.strokeStyle = wc; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(cx, cy, 22 + progress * 10, ba - 0.8, ba + 0.8); ctx.stroke();
  // Bright flash at start
  if (progress < 0.3) {
    ctx.globalAlpha = 0.4 * (1 - progress / 0.3);
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
  emitParticles(cx, cy, wc, 1, 50, 0.18);
}

function drawDashTrail() {
  if (!player.dashing) return;
  ctx.fillStyle = COL.dash; ctx.beginPath(); ctx.arc(player.x + player.w / 2, player.y + player.h / 2, 24, 0, Math.PI * 2); ctx.fill();
}

function drawTelegraph(en) {
  if (en.state !== 'telegraph' || !en.chargeDir) return;
  const cx = en.x + en.w / 2, cy = en.y + en.h / 2;
  ctx.fillStyle = COL.telegraph; ctx.beginPath();
  ctx.moveTo(cx - en.chargeDir.y * 20, cy + en.chargeDir.x * 20);
  ctx.lineTo(cx + en.chargeDir.x * 200, cy + en.chargeDir.y * 200);
  ctx.lineTo(cx + en.chargeDir.y * 20, cy - en.chargeDir.x * 20); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff0'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('!', cx, en.y - 8);
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
  if (gameState === 'waveWait') { ctx.fillStyle = COL.text; ctx.font = "bold 64px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('WAVE ' + (wave + 1), CW / 2, CH / 2); ctx.textAlign = 'left'; }
  if (gameState === 'floorClear') { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = COL.clear; ctx.font = "bold 80px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('FLOOR ' + floor + ' CLEAR!', CW / 2, CH / 2); ctx.textAlign = 'left'; }
  if (gameState === 'nodeSelect') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 32px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText('つぎの道をえらぼう', CW / 2, 160);
    for (let i = 0; i < nodeChoices.length; i++) {
      const n = nodeChoices[i];
      const bx = CW / 2 - 360 + i * 240, by = 260, bw = 200, bh = 280;
      // Card bg
      ctx.fillStyle = nodeCursor === i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = nodeCursor === i ? n.color : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = nodeCursor === i ? 4 : 2;
      ctx.strokeRect(bx, by, bw, bh);
      // Icon
      ctx.fillStyle = '#fff'; ctx.font = "48px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(n.icon, bx + bw / 2, by + 70);
      // Name
      ctx.fillStyle = n.color; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(n.name, bx + bw / 2, by + 120);
      // Desc
      ctx.fillStyle = '#ccc'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      const words = n.desc.split(''); let line = '', ly = by + 155;
      for (const ch of words) { line += ch; if (ctx.measureText(line).width > bw - 30) { ctx.fillText(line, bx + bw / 2, ly); ly += 20; line = ''; } }
      if (line) ctx.fillText(line, bx + bw / 2, ly);
      // Cursor
      if (nodeCursor === i) {
        ctx.fillStyle = n.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
        ctx.fillText('▶ Z: えらぶ', bx + bw / 2, by + bh - 20);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('← → で選択  /  Z で決定', CW / 2, CH - 60);
    ctx.textAlign = 'left';
  }
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
        ctx.fillStyle = nodeCursor === i ? 'rgba(52,152,219,0.4)' : 'rgba(255,255,255,0.1)';
        ctx.fillRect(CW / 2 - 200, oy - 25, 400, 50);
        ctx.strokeStyle = nodeCursor === i ? '#3498db' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2; ctx.strokeRect(CW / 2 - 200, oy - 25, 400, 50);
        ctx.fillStyle = nodeCursor === i ? '#fff' : '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
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
    if (gameState === 'dead') { ctx.fillStyle = 'rgba(80,0,0,0.7)'; ctx.fillRect(0, 0, CW, CH);
    // Mipurin fallen
    if (mipurinReady) { ctx.save(); ctx.globalAlpha = 0.6; const sz = 80; ctx.drawImage(mipurinImg, 0, 0, 250, 250, CW/2 - sz/2, CH/2 + 30, sz, sz); ctx.restore(); }
    ctx.fillStyle = COL.hpLost; ctx.font = "bold 120px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('ゲームオーバー', CW / 2, CH / 2 - 40);
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
  drawRoom(); drawDashTrail(); drawDrops();
  for (const en of enemies) if (en.hp > 0) drawTelegraph(en);
  for (const en of enemies) if (en.hp > 0) { drawEntity(en, en.color, false); drawHPBar(en, -8); }
  drawBoss(); drawProjectiles(); drawAttackEffect(); drawEntity(player, COL.player, true); drawParticles(); drawDmgNumbers(); drawHUD();

  ctx.restore();
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
