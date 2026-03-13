function update(dt) {
  if (typeof mouse !== 'undefined') mouse.clicked = false;
  updateFade(dt);
  if (typeof updateHoneyPools === 'function') updateHoneyPools(dt);
  if (typeof updateHomingProjs === 'function') updateHomingProjs(dt);
  for (const en of enemies) {
    if (en._poisonTimer > 0) { en._poisonTimer -= dt; en._poisonTick -= dt;
   if (en._poisonTick <= 0) { en._poisonTick = 0.5; en.hp -= en._poisonDmg; en.hitFlash = 0.05; spawnDmg(en.x+en.w/2, en.y, en._poisonDmg, '#8e44ad'); emitParticles(en.x+en.w/2, en.y+en.h/2, '#8e44ad', 2, 30, 0.2); }
   if (en.hp <= 0 && en._poisonTimer > 0) { en._poisonTimer = 0; }
    }
    if (en._honeySlow) { en._honeySlowActive = en._honeySlow; en._honeySlow = 0; } else { en._honeySlowActive = 0; }
  }
  if (boss && boss.hp > 0) {
    if (boss._poisonTimer > 0) { boss._poisonTimer -= dt; boss._poisonTick -= dt;
   if (boss._poisonTick <= 0) { boss._poisonTick = 0.5; boss.hp -= boss._poisonDmg; boss.hitFlash = 0.05; spawnDmg(boss.x+boss.w/2, boss.y, boss._poisonDmg, '#8e44ad'); }
    }
    if (boss._honeySlow) { boss._honeySlowActive = boss._honeySlow; boss._honeySlow = 0; } else { boss._honeySlowActive = 0; }
  }
  if (player._parryWindow > 0) player._parryWindow -= dt;
  if (blessingAnimTimer < 1) blessingAnimTimer += dt * 3;
  if (hpBounceTimer > 0) hpBounceTimer -= dt;
  if (floorClearAnimTimer < 2) floorClearAnimTimer += dt;
  if (gameState === 'playing' || gameState === 'waveWait') updateBgParticles(dt, getTheme(floor).name);
  updateMessages(dt);
  if (typeof updateBubbles === "function") updateBubbles(dt);

  if (gameState === 'ending') {
    if (wasPressed('KeyZ')) {
   totalClears++; checkGardenUnlocks();
   nectar += Math.ceil(runNectar * (1 + (player.nectarMul || 0)));
   saveMeta(); stopBGM(); titleGuard = 1.5; gameState = 'title';
    }
    if (wasPressed('KeyX')) {
   totalClears++; checkGardenUnlocks();
   nectar += Math.ceil(runNectar * (1 + (player.nectarMul || 0)));
   saveMeta();
   loopCount++;
   floor = 0; runNectar = 0; score = 0;
   player.hp = player.maxHp;
   player.invTimer = 0; player.attacking = false;
   stopBGM();
   nextFloor();
    }
    return;
  }
  if (gameState === 'title') { titleBlink += dt; if (titleGuard > 0) { titleGuard -= dt; return; }
    if (typeof titleVolSel === 'undefined') titleVolSel = -1;
    if (wasPressed('ArrowUp') || wasPressed('KeyW')) { titleVolSel = titleVolSel <= 0 ? 1 : titleVolSel - 1; Audio.menu_move(); }
    if (wasPressed('ArrowDown') || wasPressed('KeyS')) { titleVolSel = titleVolSel < 0 ? 0 : (titleVolSel + 1) % 2; Audio.menu_move(); }
    if (titleVolSel >= 0 && (wasPressed('ArrowLeft') || wasPressed('KeyA'))) { if(titleVolSel===0) setBgmVol(bgmVolume-0.1); else setSeVol(seVolume-0.1); Audio.menu_move(); }
    if (titleVolSel >= 0 && wasPressed('Escape')) { titleVolSel = -1; Audio.menu_move(); }
    if (titleVolSel >= 0 && (wasPressed('ArrowRight') || wasPressed('KeyD'))) { if(titleVolSel===0) setBgmVol(bgmVolume+0.1); else setSeVol(seVolume+0.1); Audio.menu_move(); }
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
  if (wasPressed('Tab')) { inventoryOpen = !inventoryOpen; if (!inventoryOpen) inventoryTab = 2; } mouse.dragItem = null; mouse.dragFrom = null;
  if (inventoryOpen) {
    mouse.dragItem = null; mouse.dragFrom = null;
    if (wasPressed('Tab')) { inventoryTab = (inventoryTab + 1) % 3; Audio.menu_move(); } mouse.dragItem = null; mouse.dragFrom = null;
    if (inventoryTab === 2) {
   if (wasPressed('ArrowUp') || wasPressed('KeyW')) { equipCursor = (equipCursor + 5) % 6; Audio.menu_move(); equipBounce = 1; }
   if (wasPressed('ArrowDown') || wasPressed('KeyS')) { equipCursor = (equipCursor + 1) % 6; Audio.menu_move(); equipBounce = 1; }
   if (wasPressed('KeyZ')) {
    const selW = equipCursor < 2 ? player.weapons[equipCursor] : player.backpack[equipCursor - 2];
    if (selW && upgradeWeapon(selW)) {
     Audio.level_up(); showFloat('\u2B50 ' + selW.name + ' Lv.' + selW.level + ' \u306B\u5F37\u5316\uFF01', 2, MSG_COLORS.buff);
     if (equipCursor < 2 && equipCursor === player.weaponIdx) player.weapon = selW;
    } else if (selW) { showFloat('\u82B1\u7C89\u4E0D\u8DB3\u304B\u6700\u5927Lv', 1.5, MSG_COLORS.warn); }
   }
   if (wasPressed('KeyX')) {
    if (equipCursor < 2) {
     const emptyBp = player.backpack.indexOf(null);
     if (emptyBp !== -1 && player.weapons[equipCursor] && player.weapons[1 - equipCursor]) {
      player.backpack[emptyBp] = player.weapons[equipCursor]; player.weapons[equipCursor] = null;
      if (equipCursor === player.weaponIdx) { player.weaponIdx = player.weapons[0] ? 0 : 1; player.weapon = player.weapons[player.weaponIdx]; }
      Audio.menu_select(); showFloat('\u30D0\u30C3\u30AF\u30D1\u30C3\u30AF\u3078', 1.5, MSG_COLORS.info);
     }
    } else {
     const bpIdx = equipCursor - 2;
     if (player.backpack[bpIdx]) {
      const emptySlot = player.weapons.indexOf(null);
      if (emptySlot !== -1) { player.weapons[emptySlot] = player.backpack[bpIdx]; player.backpack[bpIdx] = null; Audio.menu_select(); showFloat('\u88C5\u5099\u3078', 1.5, MSG_COLORS.info); }
      else { const t = player.weapons[player.weaponIdx]; player.weapons[player.weaponIdx] = player.backpack[bpIdx]; player.backpack[bpIdx] = t; player.weapon = player.weapons[player.weaponIdx]; Audio.menu_select(); showFloat('\u5165\u308C\u66FF\u3048\uFF01', 1.5, MSG_COLORS.info); }
     }
    }
   }
      if (typeof touchActive === 'undefined' || !touchActive) {
        if (mouse.clicked && !mouse.dragItem && equipSlotRects.length > 0) {
          for (let si = 0; si < equipSlotRects.length; si++) {
            const s = equipSlotRects[si];
            if (mouse.x >= s.x && mouse.x <= s.x+s.w && mouse.y >= s.y && mouse.y <= s.y+s.h) {
              const w = si < 2 ? player.weapons[si] : player.backpack[si-2];
              if (w) { mouse.dragItem = w; mouse.dragFrom = si; equipCursor = si; }
              break;
            }
          }
        }
        if (mouse.dragItem && !mouse.down) {
          let dropTarget = -1;
          for (let si = 0; si < equipSlotRects.length; si++) {
            const s = equipSlotRects[si];
            if (mouse.x >= s.x && mouse.x <= s.x+s.w && mouse.y >= s.y && mouse.y <= s.y+s.h) { dropTarget = si; break; }
          }
          if (dropTarget >= 0 && dropTarget !== mouse.dragFrom) {
            const fromW = mouse.dragFrom < 2 ? player.weapons[mouse.dragFrom] : player.backpack[mouse.dragFrom-2];
            const toW = dropTarget < 2 ? player.weapons[dropTarget] : player.backpack[dropTarget-2];
            let canDrop = true;
            if (mouse.dragFrom < 2 && dropTarget >= 2 && !player.weapons[1 - mouse.dragFrom]) canDrop = false;
            if (canDrop) {
              if (mouse.dragFrom < 2) player.weapons[mouse.dragFrom] = toW; else player.backpack[mouse.dragFrom-2] = toW;
              if (dropTarget < 2) player.weapons[dropTarget] = fromW; else player.backpack[dropTarget-2] = fromW;
              player.weapon = player.weapons[player.weaponIdx] || player.weapons[1-player.weaponIdx];
              Audio.menu_select(); showFloat('\u2694 \u3044\u308C\u304B\u3048\u305F\uFF01', 1.5, MSG_COLORS.info);
            } else { showFloat('\u6B66\u5668\u304C\u306A\u304F\u306A\u3063\u3061\u3083\u3046\uFF01', 1.5, MSG_COLORS.warn); }
          }
          mouse.dragItem = null; mouse.dragFrom = null;
        }
      }
   return;
    }
    return;
  }
  if (gameState === 'dialog') {
    if (wasPressed('KeyZ') || wasPressed('Enter') || wasPressed('Escape')) { advanceDialog(); }
    return;
  }
  if (gameState === 'blessing') {
    if (wasPressed('KeyX') && pollen >= 15) { pollen -= 15; blessingChoices = pickBlessings(); selectCursor = 0; blessingAnimTimer = 0; Audio.menu_select(); showFloat('\uD83C\uDF3C \u82B1\u7C89-15 \u30EA\u30ED\u30FC\u30EB\uFF01', 1.5, '#f1c40f'); return; }
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
    if (currentBGM !== 'shop') playBGM('shop', 0.8);
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
    runNectar += floor;
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
   if (wasPressed('KeyZ')) {
    const w = {...weaponPopup.weapon};
    if (weaponPopup.sparkle) w.dmgMul = (w.dmgMul || 1) + 0.2;
    player.weapons[player.weaponIdx] = w; player.weapon = w;
    if (typeof weaponCollection !== 'undefined') weaponCollection.add(w.id);
    saveCollection();
    Audio.level_up(); weaponPopup.active = false; gameState = 'playing';
   }
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
   if (wasPressed('KeyC') && weaponPopup.active) { const s = player.backpack.indexOf(null); if (s !== -1) { player.backpack[s] = initWeapon({...weaponPopup.weapon}); showFloat('\uD83C\uDF92 \u30D0\u30C3\u30AF\u30D1\u30C3\u30AF\u306B\u53CE\u7D0D', 2, MSG_COLORS.info); } else { showFloat('\u30D0\u30C3\u30AF\u30D1\u30C3\u30AF\u6E80\u676F', 1.5, MSG_COLORS.warn); } weaponPopup.active = false; gameState = 'playing'; return; }
   if (wasPressed('KeyX')) { Audio.menu_move(); weaponPopup.active = false; gameState = 'playing'; }
   return;
    }

  // === Combat (split to combat.js) ===
  if (gameState === "playing") updateCombat(dt);

}


