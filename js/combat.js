// ===== COMBAT MODULE =====
// Player input, movement, attack, enemy AI, drops, boss
function updateCombat(dt) {
  for (let ci = 0; ci < 3; ci++) {
    if (wasPressed('Digit' + (ci + 1)) && player.consumables[ci]) {
   const item = player.consumables[ci];
   if (item.noUse) { showFloat(item.icon + ' は宝箱で自動使用されるよ！', 1.8, '#ffd700'); continue; }
   item.apply();
   showFloat(item.msg, 2.5, MSG_COLORS.info);
   emitParticles(player.x + player.w/2, player.y + player.h/2, '#fff', 6, 60, 0.3);
   Audio.item_get();
   player.consumables[ci] = null;
    }
  }

  if (wasPressed('KeyQ') && player.weapons[1] !== null) {
    player.weaponIdx = 1 - player.weaponIdx;
    player.weapon = player.weapons[player.weaponIdx];
    Audio.menu_select();
    spawnDmg(player.x + player.w/2, player.y - 10, 0, '#ffd700');
    showFloat('ぶんぶん♪ ' + player.weapon.name, 1.5, MSG_COLORS.info);
  }

  let mx = 0, my = 0;
  if (isDown('ArrowLeft') || isDown('KeyA')) mx -= 1;
  if (isDown('ArrowRight') || isDown('KeyD')) mx += 1;
  if (isDown('ArrowUp') || isDown('KeyW')) my -= 1;
  if (isDown('ArrowDown') || isDown('KeyS')) my += 1;
  // スマホジョイスティック: touch.jsが4方向スナップ済みなので斜め入力は来ない
  // キーボード斜め入力のみ0.707正規化（スマホ操作性を損なわない）
  if (mx !== 0 && my !== 0) { mx *= 0.707; my *= 0.707; }
  if (mx !== 0 || my !== 0) {
    player.atkDir.x = Math.sign(mx || 0); player.atkDir.y = Math.sign(my || 0);
  }
  if (mx !== 0 || my !== 0 || isDown('KeyZ') || isDown('KeyX')) { if (idleTimer > 5) showBubble('ふぁ…おはよ', 1.0); idleTimer = 0; } else { idleTimer += dt; }

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  if (!player.dashing && player.invTimer <= 0) {
    const spc = Math.floor((player.x + player.w/2) / TILE);
    const spr = Math.floor((player.y + player.h/2) / TILE);
    if (spc >= 0 && spc < COLS && spr >= 0 && spr < ROWS && roomMap[spr * COLS + spc] === 2) {
   player.hp -= 1; player.invTimer = player.invDuration; hpBounceTimer = 0.3;
   Audio.player_hurt();
   emitParticles(player.x + player.w/2, player.y + player.h/2, '#ff4444', 5, 80, 0.3);
   showFloat('いたっ！ トゲ床だ！', 1.5, MSG_COLORS.warn);
   if (player.hp <= 0) { if (tryRevival()) {} else { gameState = 'dead'; Audio.game_over(); stopBGM(0.8); } }
    }
  }
  // H-A2: 水場(tile=3) — 移動速度-40%、毒沼(forest/abyss)はtimer付きHP-1
  {
    const twc = Math.floor((player.x + player.w/2) / TILE);
    const twr = Math.floor((player.y + player.h/2) / TILE);
    const onWater = twc >= 0 && twc < COLS && twr >= 0 && twr < ROWS && roomMap[twr * COLS + twc] === 3;
    player._inWater = onWater;
    if (onWater) {
      // 毒沼判定（forest/abyss）
      const themeName = (typeof getTheme === 'function') ? getTheme(floor).name : '';
      if ((themeName === 'forest' || themeName === 'abyss') && player.invTimer <= 0) {
        player._poisonWaterTimer = (player._poisonWaterTimer || 0) + dt;
        if (player._poisonWaterTimer >= 3.0) {
          player._poisonWaterTimer = 0;
          player.hp -= 1; player.invTimer = 0.3;
          emitParticles(player.x + player.w/2, player.y + player.h/2, '#27ae60', 4, 50, 0.3);
          showFloat('💧 毒沼！ HP-1', 1.5, MSG_COLORS.warn);
          if (player.hp <= 0) { if (tryRevival()) {} else { gameState = 'dead'; Audio.game_over(); stopBGM(0.8); } }
        }
      } else {
        player._poisonWaterTimer = 0;
      }
    } else {
      player._poisonWaterTimer = 0;
    }
  }
  // H-A2: 草むら(tile=4) — プレイヤー在中フラグのみ（render.jsで透明化）
  {
    const tbc = Math.floor((player.x + player.w/2) / TILE);
    const tbr = Math.floor((player.y + player.h/2) / TILE);
    player._inBush = tbc >= 0 && tbc < COLS && tbr >= 0 && tbr < ROWS && roomMap[tbr * COLS + tbc] === 4;
  }
  // H-A2: 爆発樽 barrel 更新
  if (typeof updateBarrels === 'function') updateBarrels(dt);
  if (player.dashing) { player.dashTimer -= dt; if (player.dashTimer <= 0) player.dashing = false;
    else moveWithCollision(player, player.dashDir.x * player.dashSpeed * dt, player.dashDir.y * player.dashSpeed * dt); }
  else {
    if (wasPressed('KeyX') && player.dashCooldown <= 0) {
   player.dashing = true; player.dashTimer = player.dashDuration; player.dashCooldown = 0.5;
   player.dashDir.x = (mx !== 0 || my !== 0) ? mx : player.atkDir.x;
   player.dashDir.y = (mx !== 0 || my !== 0) ? my : player.atkDir.y; player.invTimer = player.dashDuration; Audio.dash();
   emitParticles(player.x + player.w / 2, player.y + player.h / 2, COL.player, 5, 60, 0.2);
    }
    if (!player.dashing && !player.attacking) {
      const _waterMul = player._inWater ? 0.6 : 1.0;
      moveWithCollision(player, mx * player.speed * _waterMul * dt, my * player.speed * _waterMul * dt);
    }
  }

  player.atkCooldown = Math.max(0, player.atkCooldown - dt);
  if (wasPressed('KeyZ') && player.atkCooldown <= 0 && !player.attacking && !player.dashing) {
    player.attacking = true; player.atkTimer = player.weapon.dur; Audio.attack(); Audio.voice_attack();
    if (Math.random() < 0.15) showBubble('えいっ！', 0.8);
    if (player.weapon.comboFx === 'parry') {
      // H-B: holy_shield(T2) はパリィ窓が長く(0.35s)、通常 pollen_shield(T1) は短め(0.2s)
      player._parryWindow = player.weapon.id === 'holy_shield' ? 0.35 : 0.2;
      showFloat('🛡️ 構え！', 0.6, '#fff0d0');
    }
    player.atkCooldown = player.weapon.speed * (1 - Math.min(player.atkSpeedBonus, 0.7));
    const atkDmg = Math.ceil(player.atk * player.weapon.dmgMul);
    const wfx = player.weapon.fx || 'none';
    const r360 = 40 + (player.atkRangeBonus || 0); const box = wfx === '360' ? {x: player.x + player.w/2 - r360, y: player.y + player.h/2 - r360, w: r360 * 2, h: r360 * 2} : getAttackBox();
    const hitBox = wfx === 'aoe' ? {x: box.x - 16, y: box.y - 16, w: box.w + 32, h: box.h + 32} : box;
    if (wfx === 'aoe') { shakeTimer = 0.1; shakeIntensity = 6; emitParticles(box.x + box.w/2, box.y + box.h/2, '#b97', 10, 100, 0.3); }
    if (wfx === 'double') { setTimeout(() => { if (gameState !== 'playing') return;
   for (const en2 of enemies) { if (en2.hp <= 0) continue;
    if (rectOverlap(getAttackBox(), en2)) { en2.hp -= atkDmg; en2.hitFlash = 0.1; hitStopTimer = 0.05; const kb = 16; const ka = Math.atan2(en2.y - player.y, en2.x - player.x); moveWithCollision(en2, Math.cos(ka)*kb, Math.sin(ka)*kb); spawnDmg(en2.x + en2.w/2, en2.y, atkDmg, '#ffa'); emitParticles(en2.x+en2.w/2, en2.y+en2.h/2, '#fff', 5, 80, 0.2); Audio.hit(); if(Math.random()<0.3) showBubble(["えいっ！","とりゃ！","それっ！","やぁ！"][Math.floor(Math.random()*4)]); if(typeof Audio.voice_attack==="function"&&Math.random()<0.25) Audio.voice_attack(); }}
   if (boss && boss.hp > 0 && rectOverlap(getAttackBox(), boss)) { boss.hp -= atkDmg; boss.hitFlash = 0.1; hitStopTimer = 0.07; spawnDmg(boss.x + boss.w/2, boss.y, atkDmg, '#ffa'); emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#ffd700', 6, 90, 0.25); Audio.hit(); }
    }, 80); }
    const hitEnList = [];
    for (const en of enemies) { if (en.hp <= 0) continue;
   if (rectOverlap(hitBox, en)) { en.hp -= atkDmg; en.hitFlash = 0.1; hitStopTimer = 0.05; const kb2 = 16; const ka2 = Math.atan2(en.y - player.y, en.x - player.x); moveWithCollision(en, Math.cos(ka2)*kb2, Math.sin(ka2)*kb2); emitParticles(en.x+en.w/2, en.y+en.h/2, '#fff', 5, 80, 0.2); spawnDmg(en.x + en.w / 2, en.y, atkDmg, COL.dmg);
    shakeTimer = 0.05; shakeIntensity = 3; Audio.hit();
    emitParticles(en.x + en.w / 2, en.y + en.h / 2, player.weapon.color, 3, 60, 0.2);
    const angle = Math.atan2(en.y - player.y, en.x - player.x);
    moveWithCollision(en, Math.cos(angle) * (wfx === 'pierce' ? 8 : 20), Math.sin(angle) * (wfx === 'pierce' ? 8 : 20));
    hitEnList.push(en); } }
    // H-A2: 近接攻撃がbarrelにヒットしたら爆発
    if (typeof roomBarrels !== 'undefined') {
      for (const _b of roomBarrels) {
        if (_b.exploded) continue;
        const _bx = _b.c * TILE + TILE / 2, _by = _b.r * TILE + TILE / 2;
        if (rectOverlap(hitBox, { x: _bx - TILE/2, y: _by - TILE/2, w: TILE, h: TILE })) explodeBarrel(_b);
      }
    }
    const _cfx = player.weapon.comboFx || '';
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
    if (_cfx === 'honeypool' && hitEnList.length > 0) {
   const _he = hitEnList[0]; spawnHoneyPool(_he.x + _he.w/2, _he.y + _he.h/2);
    }
    if (_cfx === 'honeypool' && boss && boss.hp > 0 && rectOverlap(hitBox, boss)) {
   spawnHoneyPool(boss.x + boss.w/2, boss.y + boss.h/2);
    }
    if (_cfx === 'poison') {
   for (const _he of hitEnList) { _he._poisonTimer = 2.0; _he._poisonTick = 0.5; _he._poisonDmg = Math.max(1, Math.ceil(atkDmg * 0.3)); }
   if (boss && boss.hp > 0 && rectOverlap(hitBox, boss)) { boss._poisonTimer = 2.0; boss._poisonTick = 0.5; boss._poisonDmg = Math.max(1, Math.ceil(atkDmg * 0.3)); }
    }
    // H-B: homing — feather(1発) vs storm_wing(3連射)
    if (_cfx === 'homing') {
      const _homDmg = Math.max(1, Math.ceil(atkDmg * 0.5));
      const _shots = player.weapon.id === 'storm_wing' ? 3 : 1;
      for (let _si = 0; _si < _shots; _si++) {
        setTimeout(() => { if (gameState !== 'playing') return; spawnHomingProj(player.x+player.w/2, player.y+player.h/2, _homDmg); }, _si * 80);
      }
      if (player.weapon.id === 'storm_wing') { showFloat('🌪️ 嵐の羽！', 1.0, '#00bcd4'); emitParticles(player.x+player.w/2, player.y+player.h/2, '#00bcd4', 8, 70, 0.3); }
    }
    // H-B: megaaoe — queen_true_staff: 爆発範囲1.5倍 + クリスタルパーティクル
    if (_cfx === 'megaaoe') {
      const _mR = 72 + (player.atkRangeBonus || 0) * 1.5; // 通常aoe より1.5倍
      const _mcx = box.x + box.w/2, _mcy = box.y + box.h/2;
      shakeTimer = 0.18; shakeIntensity = 9;
      emitParticles(_mcx, _mcy, '#e1bee7', 18, 130, 0.5);
      emitParticles(_mcx, _mcy, '#ffd700', 10, 110, 0.4);
      showFloat('💎 クリスタル爆発！', 1.5, '#e1bee7');
      for (const _en of enemies) { if (_en.hp <= 0) continue;
        if (Math.hypot(_en.x+_en.w/2-_mcx, _en.y+_en.h/2-_mcy) < _mR) {
          _en.hp -= atkDmg; _en.hitFlash = 0.15; spawnDmg(_en.x+_en.w/2, _en.y, atkDmg, '#e1bee7');
          emitParticles(_en.x+_en.w/2, _en.y+_en.h/2, '#e1bee7', 4, 60, 0.25);
        }
      }
      if (boss && boss.hp > 0 && Math.hypot(boss.x+boss.w/2-_mcx, boss.y+boss.h/2-_mcy) < _mR) {
        boss.hp -= atkDmg; boss.hitFlash = 0.15; spawnDmg(boss.x+boss.w/2, boss.y, atkDmg, '#e1bee7');
        emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#e1bee7', 8, 100, 0.4);
      }
    }
    if (boss && boss.hp > 0 && rectOverlap(hitBox, boss)) {
   boss.hp -= atkDmg; boss.hitFlash = 0.12; hitStopTimer = 0.09; emitParticles(boss.x+boss.w/2, boss.y+boss.h/2, '#ffd700', 6, 90, 0.25); spawnDmg(boss.x + boss.w / 2, boss.y, atkDmg, COL.dmg);
   shakeTimer = 0.06; shakeIntensity = 4; Audio.hit();
   emitParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, player.weapon.color, 5, 80, 0.3);
    }
  }
  if (player.attacking) { player.atkTimer -= dt; if (player.atkTimer <= 0) player.attacking = false; }
  player.invTimer = Math.max(0, player.invTimer - dt);
  // H-B: パリィ窓カウントダウン
  if (player._parryWindow > 0) { player._parryWindow = Math.max(0, player._parryWindow - dt); }
  // 巨大化はちみつ: タイマーカウントダウン・期限で解除
  if (player._giantTimer > 0) {
    player._giantTimer -= dt;
    if (player._giantTimer <= 0) {
      player._giantTimer = 0;
      const boost = player._giantAtkBoost || 3;
      player.atk = Math.max(1, player.atk - boost);
      player._giantAtkBoost = 0;
      showFloat('🐻 巨大化おわり', 1.5, '#f0a030');
    }
  }
  player.animTimer += dt; if (player.animTimer > 0.15) { player.animTimer = 0; player.frame = (player.frame + 1) % 4; }

  for (const en of enemies) {
    if (en.hp <= 0) continue;
    en.hitFlash = Math.max(0, en.hitFlash - dt); en.stateTimer += dt;
    const dx = player.x - en.x, dy = player.y - en.y, d = Math.hypot(dx, dy) || 1;

    if (en.pattern === 'wander') {
   en.wanderTimer -= dt; if (en.wanderTimer <= 0) { const a = Math.random() * Math.PI * 2;
    en.wanderDir = { x: Math.cos(a), y: Math.sin(a) }; en.wanderTimer = 1 + Math.random() * 2; }
   moveWithCollision(en, en.wanderDir.x * en.speed * dt, en.wanderDir.y * en.speed * dt);
    }
    if (en.pattern === 'chase' && d > 0) {
      const _sl = 1 - (en._honeySlowActive || 0);
      // rot.js A* 経路探索（0.3s毎に再計算、壁回避）
      en._astarTimer = (en._astarTimer || 0) - dt;
      if (en._astarTimer <= 0) {
        en._astarTimer = 0.3;
        const _ec = Math.floor((en.x + en.w/2) / TILE), _er = Math.floor((en.y + en.h/2) / TILE);
        const _pc = Math.floor((player.x + player.w/2) / TILE), _pr = Math.floor((player.y + player.h/2) / TILE);
        en._astarDir = null;
        try {
          var _ast = new ROT.Path.AStar(_pc, _pr, function(x, y) { return tileAt(roomMap, x, y) !== 1; }, { topology: 4 });
          var _steps = []; _ast.compute(_ec, _er, function(x, y) { _steps.push({x:x, y:y}); });
          if (_steps.length >= 2) { var _ns = _steps[1]; var _ddx = _ns.x*TILE+TILE/2-(en.x+en.w/2), _ddy = _ns.y*TILE+TILE/2-(en.y+en.h/2), _ddd = Math.hypot(_ddx,_ddy)||1; en._astarDir = {x:_ddx/_ddd, y:_ddy/_ddd}; }
        } catch(e) {}
      }
      var _dir = en._astarDir || {x:dx/d, y:dy/d};
      moveWithCollision(en, _dir.x * en.speed * _sl * dt, _dir.y * en.speed * _sl * dt);
    }
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

    if (en.pattern === 'summon') {
      en._astarTimer = (en._astarTimer || 0) - dt;
      if (en._astarTimer <= 0) {
        en._astarTimer = 0.3;
        const _ec = Math.floor((en.x+en.w/2)/TILE), _er = Math.floor((en.y+en.h/2)/TILE);
        const _pc = Math.floor((player.x+player.w/2)/TILE), _pr = Math.floor((player.y+player.h/2)/TILE);
        en._astarDir = null;
        try {
          var _ast = new ROT.Path.AStar(_pc, _pr, function(x,y){return tileAt(roomMap,x,y)!==1;},{topology:4});
          var _steps=[]; _ast.compute(_ec,_er,function(x,y){_steps.push({x,y});});
          if(_steps.length>=2){var _ns=_steps[1];var _ddx=_ns.x*TILE+TILE/2-(en.x+en.w/2),_ddy=_ns.y*TILE+TILE/2-(en.y+en.h/2),_ddd=Math.hypot(_ddx,_ddy)||1;en._astarDir={x:_ddx/_ddd,y:_ddy/_ddd};}
        } catch(e) {}
      }
      var _sdir = en._astarDir || {x:dx/d, y:dy/d};
      moveWithCollision(en, _sdir.x*en.speed*0.5*dt, _sdir.y*en.speed*0.5*dt);
      en.summonTimer = (en.summonTimer !== undefined ? en.summonTimer : (en.summonInterval || 5.0)) - dt;
      if (en.summonTimer <= 0) {
        en.summonTimer = en.summonInterval || 5.0;
        if (enemies.filter(e=>e.hp>0).length < 7) {
          const [_sc, _sr] = randEnemyPos();
          spawnEnemy(en.summonType || 'spider', _sc, _sr);
          emitParticles(en.x+en.w/2, en.y+en.h/2, '#c0392b', 8, 70, 0.4);
          showFloat('※ 手下を呼んだ！', 1.5, '#c0392b');
        }
      }
    }
    if (player.invTimer <= 0 && !player.dashing) {
   if (rectOverlap({ x: player.x, y: player.y, w: player.w, h: player.h }, { x: en.x, y: en.y, w: en.w, h: en.h })) {
    if (player.weapon.comboFx === 'parry' && player._parryWindow > 0) {
      // H-B: T2 holy_shield は ATK×4+HP回復、T1 pollen_shield は ATK×2のみ
      const _isT2Parry = player.weapon.id === 'holy_shield';
      const _parryMul = _isT2Parry ? 4 : 2;
      const _parryDmg = Math.ceil(player.atk * _parryMul);
      en.hp -= _parryDmg; en.hitFlash = 0.2; shakeTimer = 0.15; shakeIntensity = 8;
      spawnDmg(en.x+en.w/2, en.y, _parryDmg, '#fff0d0');
      emitParticles(player.x+player.w/2, player.y+player.h/2, '#fff0d0', _isT2Parry ? 18 : 10, 100, 0.4);
      player.invTimer = _isT2Parry ? 0.8 : 0.5;
      if (_isT2Parry) { player.hp = Math.min(player.hp + 2, player.maxHp); showFloat('✨ 聖花パリィ！ HP+2', 1.8, '#fff0d0'); }
      else { showFloat('🛡️ パリィ！', 1.5, '#fff0d0'); }
      Audio.level_up();
      player._parryWindow = 0;
    } else {
    player.hp -= en.dmg; player.invTimer = player.invDuration; hpBounceTimer = 0.3; shakeTimer = 0.1; shakeIntensity = 5;
    spawnDmg(player.x + player.w / 2, player.y, en.dmg, '#fff'); Audio.player_hurt();
    emitParticles(player.x + player.w / 2, player.y + player.h / 2, '#fff', 4, 80, 0.2);
    const angle = Math.atan2(player.y - en.y, player.x - en.x); moveWithCollision(player, Math.cos(angle) * 30, Math.sin(angle) * 30);
    if (player.thorns) { en.hp -= player.thorns; en.hitFlash = 0.1; spawnDmg(en.x + en.w / 2, en.y, player.thorns, '#c0392b'); }
    } // パリィelse閉じ
    if (player.hp <= 0) { if (tryRevival()) {} else { gameState = 'dead'; deadTimer = 0; Audio.game_over(); stopBGM(0.8); } }
   }
    }
  }

  updateBoss(dt);

  for (let i = enemies.length - 1; i >= 0; i--) {
    if (enemies[i].hp <= 0) {
   score += enemies[i].score;
     if (enemies[i].type === 'splitslime' && (enemies[i].splitCount || 0) === 0) {
       const _sx = enemies[i].x, _sy = enemies[i].y;
       for (let _si = 0; _si < 2; _si++) {
         const _sc2 = Math.max(1, Math.min(COLS-2, Math.floor(_sx/TILE) + (_si===0?-1:1)));
         const _sr2 = Math.max(1, Math.min(ROWS-2, Math.floor(_sy/TILE)));
         spawnEnemy('splitslime', _sc2, _sr2);
         const _ne = enemies[enemies.length-1];
         _ne.splitCount = 1;
         _ne.hp = Math.max(1, Math.ceil(_ne.maxHp * 0.5));
         _ne.maxHp = _ne.hp;
         _ne.w = 32; _ne.h = 26;
         emitParticles(_sx+24, _sy+18, '#1abc9c', 6, 60, 0.3);
       }
       showFloat('✨ 分裂！', 1.2, '#1abc9c');
     }
     for(let p=0;p<8;p++){const a=Math.PI*2*p/8;emitParticles(enemies[i].x+enemies[i].w/2+Math.cos(a)*12,enemies[i].y+enemies[i].h/2+Math.sin(a)*12,["#ffb7c5","#fff","#ffe4e1","#ffd1dc"][p%4], 2,60,0.3);} if(Math.random()<0.25) showBubble(["やったぁ！","えへへ♪","ばいばーい！","おつかれ〜"][Math.floor(Math.random()*4)]);
   emitParticles(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, enemies[i].color, 6, 80, 0.4); emitParticles(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, '#fff', 3, 60, 0.3); emitParticles(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, '#ffb7c5', 3, 50, 0.5);
   Audio.enemy_die();
   if (enemies[i]._poisonTimer > 0) {
    emitParticles(enemies[i].x+enemies[i].w/2, enemies[i].y+enemies[i].h/2, '#8e44ad', 10, 80, 0.5);
    for (const _ne of enemies) { if (_ne.hp <= 0 || _ne === enemies[i]) continue;
     if (Math.hypot(_ne.x-enemies[i].x, _ne.y-enemies[i].y) < 80) { _ne._poisonTimer = 2.0; _ne._poisonTick = 0.5; _ne._poisonDmg = enemies[i]._poisonDmg || 1; } }
   }
   if (player.vampiric) player.hp = Math.min(player.hp + 1, player.maxHp);
   if (player.killHeal) player.hp = Math.min(player.hp + player.killHeal, player.maxHp);
   if (Math.random() < 0.4) spawnDrop(enemies[i].x + enemies[i].w / 2, enemies[i].y + enemies[i].h / 2, 'pollen');
   if (Math.random() < 0.20 + (player.luckBonus || 0)) spawnDrop(enemies[i].x + enemies[i].w / 2 + 10, enemies[i].y + enemies[i].h / 2, 'heal');
   // 5% で鍵をドロップ（luck祝福で最大8%）
   if (Math.random() < 0.05 + (player.luckBonus || 0) * 0.5) spawnDrop(enemies[i].x + enemies[i].w / 2 - 10, enemies[i].y + enemies[i].h / 2, 'chest_key');
   // 3% で巨大化はちみつをドロップ
   if (Math.random() < 0.03) spawnDrop(enemies[i].x + enemies[i].w / 2 + 16, enemies[i].y + enemies[i].h / 2, 'giant_honey');
   recordEnemy(enemies[i].name || enemies[i].type, true);
   enemies.splice(i, 1);
    }
  }

    if (boss && boss.hp > 0 && boss.hp <= boss.maxHp * 0.5 && currentBGM !== 'nest_boss') { playBGM('nest_boss', 1.0); }

    if (boss && boss.hp <= 0) {
    score += boss.score || 200; Audio.door_open(); showBubble("やったぁ！ ボスたおしたよ！"); if(typeof Audio.voice_boss_kill==="function") Audio.voice_boss_kill();
    runNectar += 10;
    emitParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.color, 20, 120, 0.6);
    const bossPollenAmt = 5 + Math.floor(floor / 2); pollen += bossPollenAmt; showFloat('花粉 +' + bossPollenAmt, 2.0, MSG_COLORS.info); emitParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#f1c40f', 15, 100, 0.4);
    hitStopTimer = 0.15; shakeTimer = 0.5; shakeIntensity = 15; emitParticles(boss.x + boss.w/2, boss.y + boss.h/2, '#ffd700', 30, 150, 0.8);
    const _bdd = {
   'queen_hornet': { s: 'スズメバチの女王', l: ['…はっ… わたし…なにを…？', 'ありがとう、ちいさなハチさん。闇の胞子がわたしを操っていたの…', 'クリスタルのかけらを感じる… もっと奥に…気をつけて'] },
   'fungus_king': { s: 'キノコの王', l: ['…やっと… 楽になれた…', '地下にもっと深い闇がある… クリスタルを砕いたやつが…', 'どうか… この森を… たのむ…'] },
   'crystal_golem': { s: 'クリスタルゴーレム', l: ['…封印の力が… 弱まっている…', 'わたしは女王さまにつくられた番人… クリスタルを守るために…', 'あの闇の蛾を止めてくれ… 奥に進め…'] },
   'shadow_moth': { s: '闇の蛾', l: ['バカな… こんなちいさなハチに…', 'だが遅い… クリスタルはもう砕けた… 女王の力も消えた…', '…いや… おまえの中に光が…？ そんな…バカな…'] },
   'dark_root': { s: '闇の根', l: ['お前たちが…咲かせた花が…私を目覚めさせた…', '…光に…負けるとは……！', '…女王の……声が…聞こえる……'] }
    };
    const _bd = _bdd[boss.id]; lastBossId = boss.id; boss = null;
    if (_bd) { gameState = 'dialog'; showDialog(_bd.s, _bd.l, function() {
      // ボスロア表示（BOSS_DEFS の lore フィールド）
      var _bossLore = null;
      for (var _bi = 0; _bi < BOSS_DEFS.length; _bi++) { if (BOSS_DEFS[_bi].id === lastBossId) { _bossLore = BOSS_DEFS[_bi].lore; break; } }
      if (_bossLore) {
        showDialog(String.fromCodePoint(0x1F4D6) + ' ' + _bd.s + ' \u306E\u8A18\u9332', [_bossLore], function() { var _wdr=lastBossId==='dark_root'; lastBossId=''; floorClearAnimTimer=0; if(_wdr){if(typeof queenReturned!=='undefined')queenReturned=true;gameState='dialog';showDialog('女王フローラ',['…ミプリン……やっと会えたね','あなたの光が咲かせた花が…闇の根を目覚めさせてしまった…','でも……その光こそが、クリスタルを取り戻す唯一の力','ありがとう、私の花の国の……希望の光よ'],function(){gameState='floorClear';clearTimer=0;});}else{gameState='floorClear';clearTimer=0;} });
      } else { var _wdr2=lastBossId==='dark_root'; lastBossId=''; floorClearAnimTimer=0; if(_wdr2){if(typeof queenReturned!=='undefined')queenReturned=true;gameState='dialog';showDialog('女王フローラ',['…ミプリン……やっと会えたね','あなたの光が咲かせた花が…闇の根を目覚めさせてしまった…','でも……その光こそが、クリスタルを取り戻す唯一の力','ありがとう、私の花の国の……希望の光よ'],function(){gameState='floorClear';clearTimer=0;});}else{gameState='floorClear';clearTimer=0;} }
    }); }
    else { floorClearAnimTimer = 0; gameState = 'floorClear'; clearTimer = 0; }
  }

  if (!boss && enemies.length === 0 && gameState === 'playing') {
    wave++;
    if (wave >= WAVES.length) { floorClearAnimTimer = 0; gameState = 'floorClear'; clearTimer = 0; Audio.door_open(); stopBGM(0.8); showBubble('やったぁ！クリア！',1.5); }
    else { gameState = 'waveWait'; clearTimer = 0; }
  }

  updateProjectiles(dt); updateDrops(dt); updateParticles(dt); if(typeof updateBubbles==="function") updateBubbles(dt);
  for (let i = dmgNumbers.length - 1; i >= 0; i--) { dmgNumbers[i].life -= dt; dmgNumbers[i].y -= 40 * dt; if (dmgNumbers[i].life <= 0) dmgNumbers.splice(i, 1); }
  shakeTimer = Math.max(0, shakeTimer - dt);
}

// === 不屈の花壇: Guts Revival ===
// Returns true if revival triggered (player keeps going), false if dead
function tryRevival() {
  if (!player._revival) return false;
  player._revival = false;
  revivalUsed = true;
  player.hp = player._revivalHp || 1;
  player.invTimer = 2.0; // 2秒の無敵
  emitParticles(player.x + player.w/2, player.y + player.h/2, '#ffd700', 12, 100, 0.6);
  showFloat('🛡️ 不屈！ HP' + player.hp + 'で復活！', 2.5, '#ffd700');
  Audio.item_get();
  return true;
}

// === HP Low-Pass Filter (Sprint G-B) ===
function checkHpLowPass() {
  if (typeof setLowPass !== 'function') return;
  var ratio = player.hp / player.maxHp;
  if (ratio <= 0.3 && gameState === 'playing') { setLowPass(true); }
  else { setLowPass(false); }
}
