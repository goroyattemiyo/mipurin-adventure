// ===== UPDATE =====
function update(dt) {
  updateFade(dt);
  // 蜜だまり・ホーミング更新
  if (typeof updateHoneyPools === 'function') updateHoneyPools(dt);
  if (typeof updateHomingProjs === 'function') updateHomingProjs(dt);
  // 毒DoT更新
  for (const en of enemies) {
    if (en._poisonTimer > 0) { en._poisonTimer -= dt; en._poisonTick -= dt;
      if (en._poisonTick <= 0) { en._poisonTick = 0.5; en.hp -= en._poisonDmg; en.hitFlash = 0.05; spawnDmg(en.x+en.w/2, en.y, en._poisonDmg, '#8e44ad'); emitParticles(en.x+en.w/2, en.y+en.h/2, '#8e44ad', 2, 30, 0.2); }
      if (en.hp <= 0 && en._poisonTimer > 0) { en._poisonTimer = 0; }
    }
    // 蜜減速リセット
    if (en._honeySlow) { en._honeySlowActive = en._honeySlow; en._honeySlow = 0; } else { en._honeySlowActive = 0; }
  }
  if (boss && boss.hp > 0) {
    if (boss._poisonTimer > 0) { boss._poisonTimer -= dt; boss._poisonTick -= dt;
      if (boss._poisonTick <= 0) { boss._poisonTick = 0.5; boss.hp -= boss._poisonDmg; boss.hitFlash = 0.05; spawnDmg(boss.x+boss.w/2, boss.y, boss._poisonDmg, '#8e44ad'); }
    }
    if (boss._honeySlow) { boss._honeySlowActive = boss._honeySlow; boss._honeySlow = 0; } else { boss._honeySlowActive = 0; }
  }
  // パリィウィンドウ
  if (player._parryWindow > 0) player._parryWindow -= dt;
  if (blessingAnimTimer < 1) blessingAnimTimer += dt * 3;
  if (hpBounceTimer > 0) hpBounceTimer -= dt;
  if (floorClearAnimTimer < 2) floorClearAnimTimer += dt;
  if (gameState === 'playing' || gameState === 'waveWait') updateBgParticles(dt, getTheme(floor).name);
  updateMessages(dt);

  if (gameState === 'ending') {
    if (wasPressed('KeyZ')) { totalClears++; checkGardenUnlocks(); nectar += Math.ceil(runNectar * (1 + (player.nectarMul || 0))); saveMeta(); stopBGM(); titleGuard = 1.5; gameState = 'title'; }
    return;
  }
  if (gameState === 'title') { titleBlink += dt; if (titleGuard > 0) { titleGuard -= dt; return; }
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
  if (gameState === 'cutin') {
    cutinTimer += dt;
    if (cutinPhase === 'slidein' && cutinTimer > 0.6) { cutinPhase = 'hold'; cutinTimer = 0; shakeTimer = 0.2; shakeIntensity = 10; }
    if (cutinPhase === 'hold' && cutinTimer > 1.2) { cutinPhase = 'fade'; cutinTimer = 0; }
    if (cutinPhase === 'fade' && cutinTimer > 0.5) {
      cutinPhase = 'none';
      const bossLines = {
        'queen_hornet': ['ブンブン…… あたまが…おかしく…なる…！', 'ここから… でていけぇ！ …たすけて…'],
        'fungus_king': ['この胞子は… わたしの意志では…ない…', 'クリスタルのかけらが… わたしを狂わせる… 止めて…くれ…'],
        'crystal_golem': ['…ゴゴゴ…… 封印を… 守らなければ…', 'しかし… 体が… いうことを きかない…'],
        'shadow_moth': ['ヒヒヒ… 気づいたか、ちいさなハチさん？', 'クリスタルを砕いたのは… このわたしだよ…']
      };
      const bl = bossLines[cutinBossId] || ['ボスがあらわれた！'];
      gameState = 'dialog';
      showDialog(boss ? boss.name : '???', bl, function() { gameState = 'playing'; });
    }
    return;
  }
  // Inventory toggle
  if (wasPressed('Tab')) { inventoryOpen = !inventoryOpen; if (!inventoryOpen) inventoryTab = 0; }
  if (inventoryOpen) {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) inventoryTab = 0;
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) inventoryTab = 1;
    return;
  }
  // Dialog state - pause game, Z to advance
  if (gameState === 'dialog') {
    if (wasPressed('KeyZ') || wasPressed('Enter') || wasPressed('Escape')) { advanceDialog(); }
    return;
  }
  if (gameState === 'blessing') {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { selectCursor = (selectCursor - 1 + blessingChoices.length) % blessingChoices.length; Audio.menu_move(); }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) { selectCursor = (selectCursor + 1) % blessingChoices.length; Audio.menu_move(); }
    if (wasPressed('Digit1') && blessingChoices[0]) { selectCursor = 0; }
    if (wasPressed('Digit2') && blessingChoices[1]) { selectCursor = 1; }
    if (wasPressed('Digit3') && blessingChoices[2]) { selectCursor = 2; }
    if ((wasPressed('KeyZ') || wasPressed('Enter')) && blessingChoices[selectCursor]) {
      const chosenB = blessingChoices[selectCursor]; chosenB.apply(); activeBlessings.push(chosenB); checkDuos(); emitParticles(CW/2, CH/2, chosenB.icon ? '#ffd700' : '#fff', 25, 120, 0.6); Audio.level_up(); showFloat(chosenB.icon + ' ' + chosenB.name + ' はつどう！', 2.5, MSG_COLORS.info); nextFloor(); }
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
    if (wasPressed('Escape') || wasPressed('KeyX') || (selectCursor >= shopItems.length && (wasPressed('KeyZ') || wasPressed('Enter')))) { finishTree(); }
    return;
  }
  if (gameState === 'waveWait') { clearTimer += dt; if (clearTimer > 1.0) { spawnWave(); gameState = 'playing'; } return; }
  if (gameState === 'floorClear') { clearTimer += dt; if (clearTimer > 1.5) {
      if (floor >= MAX_FLOOR && isBossFloor()) { stopBGM(); playBGM('ending'); gameState = 'ending'; return; }
    if (eliteNext) { eliteNext = false; const rarePlus = BLESSING_POOL.filter(b => b.rarity === 'rare' || b.rarity === 'legend'); const picks = []; const used = new Set(); while (picks.length < 3 && picks.length < rarePlus.length) { const b = rarePlus[Math.floor(rng() * rarePlus.length)]; if (!used.has(b.id)) { used.add(b.id); picks.push(b); } } blessingChoices = picks.length >= 3 ? picks : pickBlessings(); selectCursor = 0; showFloat('💀 エリートクリア！レア祝福確定！', 2.5, MSG_COLORS.boss); gameState = 'dialog'; showDialog('ミプリン', ['強敵を倒した！ すごい祝福がもらえるよ！'], function() { blessingAnimTimer = 0; gameState = 'blessing'; }); } else { blessingChoices = pickBlessings(); selectCursor = 0; gameState = 'dialog'; showDialog('ミプリン', ['祝福の花が咲いた！ ひとつ えらんでね！'], function() { blessingAnimTimer = 0; gameState = 'blessing'; }); }
  } return; }
  if (gameState === 'nodeSelect') { updateNodeSelect(); return; }
  if (gameState === 'event') {
    if (eventPhase === 'choose') {
      if (wasPressed('ArrowUp') || wasPressed('KeyW')) { treeCursor.col = 0; Audio.menu_move(); }
      if (wasPressed('ArrowDown') || wasPressed('KeyS')) { treeCursor.col = 1; Audio.menu_move(); }
      if (wasPressed('KeyZ')) {
        Audio.menu_select();
        if (treeCursor.col === 0) currentEvent.a.apply();
        else currentEvent.b.apply();
        eventPhase = 'done';
      }
    } else if (eventPhase === 'done') {
      if (wasPressed('KeyZ')) { nextFloor(); }
    }
    return;
  }

  if (gameState === 'dead') { deadTimer += dt; if (deadTimer > 2.0 && wasPressed('KeyZ')) { nectar += Math.ceil(runNectar * (1 + (player.nectarMul || 0))); saveMeta(); stopBGM(); titleGuard = 1.5; gameState = 'title'; } return; }
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
  }

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  // Spike damage (トゲ床) - dash makes you immune
  if (!player.dashing && player.invTimer <= 0) {
    const spc = Math.floor((player.x + player.w/2) / TILE);
    const spr = Math.floor((player.y + player.h/2) / TILE);
    if (spc >= 0 && spc < COLS && spr >= 0 && spr < ROWS && roomMap[spr * COLS + spc] === 2) {
      player.hp -= 1; player.invTimer = player.invDuration; hpBounceTimer = 0.3;
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
    player.attacking = true; player.atkTimer = player.weapon.dur; Audio.attack();
    if (player.weapon.comboFx === 'parry') player._parryWindow = 0.2; player.atkCooldown = player.weapon.speed * (1 - Math.min(player.atkSpeedBonus, 0.7));
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
    // === 固有効果発動 ===
    const _cfx = player.weapon.comboFx || '';
    // 蜂の金針: コンボカウンタ
    if (_cfx === 'shockwave') {
      player._comboCount = (player._comboCount || 0) + 1;
      if (player._comboCount >= 3) { player._comboCount = 0; shakeTimer = 0.12; shakeIntensity = 6;
        const scx = player.x+player.w/2+player.atkDir.x*30, scy = player.y+player.h/2+player.atkDir.y*30;
        emitParticles(scx, scy, '#ffaa00', 12, 100, 0.4);
        for (const en of enemies) { if (en.hp <= 0) continue;
          if (Math.hypot(en.x+en.w/2-scx, en.y+en.h/2-scy) < 80) { en.hp -= atkDmg; en.hitFlash = 0.1; spawnDmg(en.x+en.w/2, en.y, atkDmg, '#ffaa00'); } }
        if (boss && boss.hp > 0 && Math.hypot(boss.x+boss.w/2-scx, boss.y+boss.h/2-scy) < 80) { boss.hp -= atkDmg; boss.hitFlash = 0.1; spawnDmg(boss.x+boss.w/2, boss.y, atkDmg, '#ffaa00'); }
        showFloat('💥 衝撃波！', 1.0, MSG_COLORS.buff);
      }
    } else { player._comboCount = 0; }
    // 蜜の大砲: ヒットした敵の位置に蜜だまり
    if (_cfx === 'honeypool' && hitEnList.length > 0) {
      const _he = hitEnList[0]; spawnHoneyPool(_he.x + _he.w/2, _he.y + _he.h/2);
    }
    if (_cfx === 'honeypool' && boss && boss.hp > 0 && rectOverlap(hitBox, boss)) {
      spawnHoneyPool(boss.x + boss.w/2, boss.y + boss.h/2);
    }
    // 呪いの荊: 毒付与
    if (_cfx === 'poison') {
      for (const _he of hitEnList) { _he._poisonTimer = 2.0; _he._poisonTick = 0.5; _he._poisonDmg = Math.max(1, Math.ceil(atkDmg * 0.3)); }
      if (boss && boss.hp > 0 && rectOverlap(hitBox, boss)) { boss._poisonTimer = 2.0; boss._poisonTick = 0.5; boss._poisonDmg = Math.max(1, Math.ceil(atkDmg * 0.3)); }
    }
    // 翼の嵐: ホーミング羽生成
    if (_cfx === 'homing') { spawnHomingProj(player.x+player.w/2, player.y+player.h/2, Math.max(1, Math.ceil(atkDmg * 0.5))); }
    // 女王の真杖: 爆発範囲は既にaoe hitBoxで拡大済み（dmgMul 2.5で対応）
    // Hit boss
    if (boss && boss.hp > 0 && rectOverlap(hitBox, boss)) {
      boss.hp -= atkDmg; boss.hitFlash = 0.12; hitStopTimer = 0.09; emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#ffd700', 6, 90, 0.25); spawnDmg(boss.x + boss.w / 2, boss.y, atkDmg, COL.dmg);
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
    if (en.pattern === 'chase' && d > 0) { const _sl = 1 - (en._honeySlowActive || 0); moveWithCollision(en, (dx / d) * en.speed * _sl * dt, (dy / d) * en.speed * _sl * dt); }
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
      if (en.shootTimer <= 0 && en.state !== 'shootTele') {
        en.state = 'shootTele'; en.shootTeleTimer = 0.4;
        en.shootTarget = { x: player.x + player.w/2, y: player.y + player.h/2 };
      }
      if (en.state === 'shootTele') {
        en.shootTeleTimer -= dt;
        if (en.shootTeleTimer <= 0) {
          en.state = 'idle'; en.shootTimer = en.shootInterval || 2;
          spawnProjectile(en.x + en.w/2, en.y + en.h/2, en.shootTarget.x - (en.x + en.w/2), en.shootTarget.y - (en.y + en.h/2), 100, en.dmg, false);
          Audio.attack();
        }
      }
    }
    if (en.pattern === 'teleport') {
      en.wanderTimer -= dt;
      if (en.wanderTimer <= 0 && en.state !== 'teleWarn') {
        let nx, ny, tries = 0;
        do { nx = TILE * (2 + Math.floor(Math.random() * (COLS - 4))); ny = TILE * (2 + Math.floor(Math.random() * (ROWS - 4))); tries++; }
        while (tries < 30 && tileAt(roomMap, Math.floor(nx / TILE), Math.floor(ny / TILE)) === 1);
        en.teleTarget = { x: nx, y: ny }; en.state = 'teleWarn'; en.teleWarnTimer = 0.3;
        emitParticles(en.x + en.w/2, en.y + en.h/2, en.color, 4, 40, 0.2);
      }
      if (en.state === 'teleWarn') {
        en.teleWarnTimer -= dt;
        if (en.teleWarnTimer <= 0) {
          en.x = en.teleTarget.x; en.y = en.teleTarget.y;
          emitParticles(en.x + en.w/2, en.y + en.h/2, en.color, 6, 60, 0.3);
          en.state = 'idle'; en.wanderTimer = 2 + Math.random() * 2;
        }
      } else {
        if (d < 200 && d > 0) moveWithCollision(en, (dx / d) * en.speed * 0.5 * dt, (dy / d) * en.speed * 0.5 * dt);
      }
    }

    // Contact damage
    if (player.invTimer <= 0 && !player.dashing) {
      if (rectOverlap({ x: player.x, y: player.y, w: player.w, h: player.h }, { x: en.x, y: en.y, w: en.w, h: en.h })) {
        // パリィ判定
        if (player.weapon.comboFx === 'parry' && player._parryWindow > 0) {
          en.hp -= Math.ceil(player.atk * 4); en.hitFlash = 0.2; shakeTimer = 0.15; shakeIntensity = 8;
          spawnDmg(en.x+en.w/2, en.y, Math.ceil(player.atk*4), '#fff0d0');
          emitParticles(player.x+player.w/2, player.y+player.h/2, '#fff0d0', 15, 100, 0.4);
          player.hp = Math.min(player.hp + 1, player.maxHp); player.invTimer = 0.5;
          showFloat('✨ パリィ！', 1.5, MSG_COLORS.buff); Audio.level_up();
          player._parryWindow = 0;
        } else {
        player.hp -= en.dmg; player.invTimer = player.invDuration; hpBounceTimer = 0.3; shakeTimer = 0.1; shakeIntensity = 5;
        spawnDmg(player.x + player.w / 2, player.y, en.dmg, '#fff'); Audio.player_hurt();
        emitParticles(player.x + player.w / 2, player.y + player.h / 2, '#fff', 4, 80, 0.2);
        const angle = Math.atan2(player.y - en.y, player.x - en.x); moveWithCollision(player, Math.cos(angle) * 30, Math.sin(angle) * 30);
        if (player.thorns) { en.hp -= player.thorns; en.hitFlash = 0.1; spawnDmg(en.x + en.w / 2, en.y, player.thorns, '#c0392b'); }
        } // パリィelse閉じ
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
      emitParticles(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, enemies[i].color, 10, 80, 0.4); emitParticles(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, '#fff', 5, 60, 0.3); emitParticles(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, '#ffb7c5', 6, 50, 0.5);
      Audio.enemy_die();
      // 毒撃破: 毒霧拡散
      if (enemies[i]._poisonTimer > 0) {
        emitParticles(enemies[i].x+enemies[i].w/2, enemies[i].y+enemies[i].h/2, '#8e44ad', 10, 80, 0.5);
        for (const _ne of enemies) { if (_ne.hp <= 0 || _ne === enemies[i]) continue;
          if (Math.hypot(_ne.x-enemies[i].x, _ne.y-enemies[i].y) < 80) { _ne._poisonTimer = 2.0; _ne._poisonTick = 0.5; _ne._poisonDmg = enemies[i]._poisonDmg || 1; } }
      }
      if (player.vampiric) player.hp = Math.min(player.hp + 1, player.maxHp);
      if (player.killHeal) player.hp = Math.min(player.hp + player.killHeal, player.maxHp);
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
    const bossPollenAmt = 5 + Math.floor(floor / 2); pollen += bossPollenAmt; showFloat('花粉 +' + bossPollenAmt, 2.0, MSG_COLORS.info); emitParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#f1c40f', 15, 100, 0.4);
    hitStopTimer = 0.15; shakeTimer = 0.5; shakeIntensity = 15; emitParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#ffd700', 30, 150, 0.8);
    const _bdd = {
      'queen_hornet': { s: 'スズメバチの女王', l: ['…はっ… わたし…なにを…？', 'ありがとう、ちいさなハチさん。闇の胞子がわたしを操っていたの…', 'クリスタルのかけらを感じる… もっと奥に…気をつけて'] },
      'fungus_king': { s: 'キノコの王', l: ['…やっと… 楽になれた…', '地下にもっと深い闇がある… クリスタルを砕いたやつが…', 'どうか… この森を… たのむ…'] },
      'crystal_golem': { s: 'クリスタルゴーレム', l: ['…封印の力が… 弱まっている…', 'わたしは女王さまにつくられた番人… クリスタルを守るために…', 'あの闇の蛾を止めてくれ… 奥に進め…'] },
      'shadow_moth': { s: '闇の蛾', l: ['バカな… こんなちいさなハチに…', 'だが遅い… クリスタルはもう砕けた… 女王の力も消えた…', '…いや… おまえの中に光が…？ そんな…バカな…'] }
    };
    const _bd = _bdd[boss.id]; lastBossId = boss.id; boss = null;
    if (_bd) { gameState = 'dialog'; showDialog(_bd.s, _bd.l, function() { floorClearAnimTimer = 0; gameState = 'floorClear'; clearTimer = 0; }); }
    else { floorClearAnimTimer = 0; gameState = 'floorClear'; clearTimer = 0; }
  }

  // Wave clear
  if (!boss && enemies.length === 0 && gameState === 'playing') {
    wave++;
    if (wave >= WAVES.length) { floorClearAnimTimer = 0; gameState = 'floorClear'; clearTimer = 0; Audio.door_open(); }
    else { gameState = 'waveWait'; clearTimer = 0; }
  }

  // Projectiles, drops, particles, dmg numbers
  updateProjectiles(dt); updateDrops(dt); updateParticles(dt);
  for (let i = dmgNumbers.length - 1; i >= 0; i--) { dmgNumbers[i].life -= dt; dmgNumbers[i].y -= 40 * dt; if (dmgNumbers[i].life <= 0) dmgNumbers.splice(i, 1); }
  shakeTimer = Math.max(0, shakeTimer - dt);
}






