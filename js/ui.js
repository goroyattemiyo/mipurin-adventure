// ===== UI DRAWING MODULE (ui.js) =====
// Extracted from game.js for maintainability
// All UI screen rendering functions

const UI_TEXT_STYLE = {
  heading:  { font: "bold 28px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'left' },
  subhead:  { font: "bold 22px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'left' },
  label:    { font: "bold 18px 'M PLUS Rounded 1c', sans-serif", color: '#fff', align: 'left' },
  body:     { font: "18px 'M PLUS Rounded 1c', sans-serif", color: '#fff', align: 'left' },
  detail:   { font: "16px 'M PLUS Rounded 1c', sans-serif", color: '#ccc', align: 'left' },
  hint:     { font: "16px 'M PLUS Rounded 1c', sans-serif", color: '#aaa', align: 'center' },
  accent:   { font: "bold 20px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'center' },
  icon:     { font: "48px 'M PLUS Rounded 1c', sans-serif", color: '#fff', align: 'center' },
  cost:     { font: "bold 20px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'center' },
  warn:     { font: "bold 18px 'M PLUS Rounded 1c', sans-serif", color: '#f66', align: 'center' },
};
function drawText(text, x, y, layer, overrides) {
  const s = UI_TEXT_STYLE[layer] || UI_TEXT_STYLE.body;
  ctx.font = (overrides && overrides.font) || s.font;
  ctx.fillStyle = (overrides && overrides.color) || s.color;
  ctx.textAlign = (overrides && overrides.align) || s.align;
  ctx.fillText(text, x, y);
}


function drawInventory() {
  if (!inventoryOpen) return;
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, CW, CH);
  const tabs = ['持ち物', '図鑑'];
  for (let i = 0; i < tabs.length; i++) {
    const tx = CW / 2 - 120 + i * 240, ty = 60;
    ctx.fillStyle = inventoryTab === i ? '#ffd700' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(tx - 80, ty - 20, 160, 40);
    ctx.fillStyle = inventoryTab === i ? '#000' : '#fff';
    ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(tabs[i], tx, ty + 7);
  }
  ctx.textAlign = 'left';
  if (inventoryTab === 0) drawInventoryItems();
  else drawCollectionTab();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('← → でタブ切替  /  TAB で閉じる', CW / 2, CH - 30);
  ctx.textAlign = 'left';
}


function drawInventoryItems() {
  const lx = 120, ly = 140;
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ステータス', lx, ly);
  ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  const stats = ['HP: ' + player.hp + ' / ' + player.maxHp, 'ATK: ' + Math.ceil(player.atk * (player.weapon.dmgMul || 1)), '速度: ' + player.speed, 'フロア: ' + floor, 'スコア: ' + score, '花粉: ' + pollen];
  for (let i = 0; i < stats.length; i++) ctx.fillText(stats[i], lx + 20, ly + 40 + i * 30);
  const wx = CW / 2 + 40, wy = 140;
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('武器', wx, wy);
  ctx.fillStyle = player.weapon.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('⚔ ' + player.weapon.name, wx + 20, wy + 40);
  ctx.fillStyle = '#ccc'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ダメージ倍率: x' + (player.weapon.dmgMul || 1).toFixed(1), wx + 20, wy + 65);
  ctx.fillText('射程: ' + ((player.weapon.range||44) + (player.atkRangeBonus||0)), wx + 20, wy + 85);
    // Weapon slots
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('【おきにいり】', wx + 20, wy + 130);
    const w0 = player.weapons[0];
    if (w0) { ctx.fillStyle = w0.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(w0.name + ' (ATKx' + (w0.dmgMul||1).toFixed(1) + ' 射程' + w0.range + ')', wx + 30, wy + 150); }
    ctx.fillStyle = '#aaa'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('【もうひとつ】', wx + 20, wy + 175);
    const w1 = player.weapons[1];
    if (w1) { ctx.fillStyle = w1.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(w1.name + ' (ATKx' + (w1.dmgMul||1).toFixed(1) + ' 射程' + w1.range + ')', wx + 30, wy + 195); }
    else { ctx.fillStyle = '#666'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('- なし -', wx + 30, wy + 195); }
  ctx.fillText('速度: ' + player.weapon.speed.toFixed(2) + 's', wx + 20, wy + 105);
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('祝福', wx, wy + 220);
  if (activeBlessings.length === 0) { ctx.fillStyle = '#888'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('なし', wx + 20, wy + 255); }
  else { for (let i = 0; i < activeBlessings.length; i++) { const b = activeBlessings[i]; ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.icon + ' ' + b.name, wx + 20, wy + 255 + i * 35); ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.desc, wx + 50, wy + 275 + i * 35); } }
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('アイテム', lx, ly + 280);
  for (let i = 0; i < 3; i++) {
    const sx = lx + 30 + i * 80, sy = ly + 320;
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(sx, sy, 28, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText('[' + (i + 1) + ']', sx, sy + 46);
    if (player.consumables && player.consumables[i]) { ctx.fillStyle = '#fff'; ctx.font = "40px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(player.consumables[i].icon, sx, sy + 8); }
    else { ctx.fillStyle = '#555'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('空', sx, sy + 5); }
    ctx.textAlign = 'left';
  }
}


function drawCollectionTab() {
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('🌸 花の国のいきもの図鑑', 120, 140);
  const names = Object.keys(collection);
  if (names.length === 0) { ctx.fillStyle = '#888'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('まだ誰にも会っていないよ…冒険に出かけよう！', 140, 200); return; }
  // 敵定義からloreを引く
  const allDefs = Object.values(ENEMY_DEFS);
  for (let i = 0; i < names.length; i++) {
    const c = collection[names[i]];
    const row = i;
    const ey = 180 + row * 70;
    if (ey > CH - 80) break; // 画面外防止
    // 敵の色を探す
    const def = allDefs.find(d => d.name === names[i]) || {};
    ctx.fillStyle = def.color || '#fff';
    ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(names[i], 140, ey);
    ctx.fillStyle = '#ccc'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('遭遇: ' + c.seen + '  撃破: ' + c.defeated, 340, ey);
    if (def.lore && c.defeated > 0) {
      ctx.fillStyle = '#999'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(def.lore, 160, ey + 22);
    } else if (c.defeated === 0) {
      ctx.fillStyle = '#666'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('??? （倒すと情報が解放されるよ）', 160, ey + 22);
    }
  }
}


function drawFloatMessages() {
  if (msgQueue.length === 0) return;
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < msgQueue.length; i++) {
    const m = msgQueue[i];
    const alpha = Math.min(1, m.timer * 2.5);
    const slideY = 80 + i * 40;
    // Background
    ctx.globalAlpha = alpha * 0.85;
    ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    const tw = ctx.measureText(m.text).width + 40;
    const rx = CW / 2 - tw / 2, ry = slideY - 16, rh = 34;
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.moveTo(rx + 8, ry); ctx.lineTo(rx + tw - 8, ry);
    ctx.quadraticCurveTo(rx + tw, ry, rx + tw, ry + 8);
    ctx.lineTo(rx + tw, ry + rh - 8);
    ctx.quadraticCurveTo(rx + tw, ry + rh, rx + tw - 8, ry + rh);
    ctx.lineTo(rx + 8, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - 8);
    ctx.lineTo(rx, ry + 8);
    ctx.quadraticCurveTo(rx, ry, rx + 8, ry);
    ctx.closePath(); ctx.fill();
    // Gold border
    ctx.strokeStyle = m.color; ctx.lineWidth = 2; ctx.stroke();
    // Text
    ctx.globalAlpha = alpha;
    ctx.fillStyle = m.color; ctx.fillText(m.text, CW / 2, slideY);
  }
  ctx.restore();
}


function drawDialogWindow() {
  if (!dialogMsg) return;
  ctx.save();
  const dw = CW - 160, dh = 120;
  const dx = 80, dy = CH - dh - 40;
  // Background
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = '#0d0d2b'; ctx.fillRect(dx, dy, dw, dh);
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3; ctx.strokeRect(dx, dy, dw, dh);
  // Inner border
  ctx.strokeStyle = 'rgba(255,215,0,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(dx + 6, dy + 6, dw - 12, dh - 12);
  ctx.globalAlpha = 1;
  // Speaker name
  if (dialogMsg.speaker) {
    const nw = ctx.measureText(dialogMsg.speaker).width + 30;
    ctx.fillStyle = '#1a1a3e'; ctx.fillRect(dx + 20, dy - 16, nw, 28);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(dx + 20, dy - 16, nw, 28);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
    ctx.fillText(dialogMsg.speaker, dx + 35, dy + 3);
  }
  // Text with typewriter
  ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
  const line = dialogMsg.lines[dialogMsg.lineIdx];
  const shown = line.substring(0, dialogMsg.charIdx);
  ctx.fillText(shown, dx + 24, dy + 45);
  // Page indicator
  if (dialogMsg.charIdx >= line.length) {
    ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'right';
    const pageText = dialogMsg.lineIdx < dialogMsg.lines.length - 1 ? 'Z: つぎへ ▼' : 'Z: とじる ▼';
    ctx.fillText(pageText, dx + dw - 20, dy + dh - 15);
  }
  // Page count
  if (dialogMsg.lines.length > 1) {
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
    ctx.fillText((dialogMsg.lineIdx + 1) + '/' + dialogMsg.lines.length, dx + 24, dy + dh - 15);
  }
  ctx.restore();
}


function drawPrologue() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CW, CH);
  const img = prologueImages[prologuePage];
  if (img && img.complete) {
    const scale = Math.min(CW / img.width, CH / img.height) * 0.75;
    const iw = img.width * scale, ih = img.height * scale;
    ctx.globalAlpha = Math.min(prologueFade, 1);
    ctx.drawImage(img, (CW - iw) / 2, (CH - ih) / 2 - 60, iw, ih);
    ctx.globalAlpha = 1;
  }
  const txt = prologueTexts[prologuePage] || '';
  if (txt) {
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, CH - 160, CW, 160);
    ctx.fillStyle = '#fff';
    ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'center';
    ctx.fillText(txt, CW / 2, CH - 80);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('Zキーで次へ  /  Xキーでスキップ', CW / 2, CH - 20);
  ctx.textAlign = 'left';
}


function drawEnding() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CW, CH);
  ctx.save(); ctx.globalAlpha = 0.8;
  if (mipurinReady) {
    const sz = 200;
    ctx.drawImage(mipurinImg, 0, 0, 250, 250, CW/2 - sz/2, 120, sz, sz);
  }
  ctx.restore();
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText('花の国に平和が戻った！', CW/2, 380);
  ctx.fillStyle = '#fff'; ctx.font = "22px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ミプリンは花粉を取り戻し、', CW/2, 430);
  ctx.fillText('虫たちは再び元気を取り戻した。', CW/2, 460);
  ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('スコア: ' + score + '  花粉: ' + pollen + '  フロア: ' + floor, CW/2, 520);
  ctx.fillStyle = '#ffd700'; ctx.fillText('獲得ネクター: +' + runNectar, CW/2, 580);
  ctx.fillText('祝福: ' + activeBlessings.length + '  共鳴: ' + (typeof activeDuos !== 'undefined' ? activeDuos.length : 0), CW/2, 550);
  ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  const blinkOn = Math.floor(Date.now() / 500) % 2 === 0;
  if (blinkOn) ctx.fillText('Zキーでタイトルへ', CW/2, 620);
  ctx.textAlign = 'left';
  // Consumable use message
  // [REMOVED] old consumableMsg draw - replaced by drawFloatMessages()
  // Weapon swap message
  // drawFloatMessages(); ← moved to draw() end
  // drawDialogWindow(); ← moved to draw() end
  // Fade overlay
  if (fadeDir !== 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
}


function drawHUD() {
  // HP
  const hs = 22, hSpacing = hs + 6, hPerRow = 15;
  for (let i = 0; i < player.maxHp; i++) { const col = i % hPerRow, row = Math.floor(i / hPerRow); ctx.fillStyle = i < player.hp ? COL.hpLost : '#444'; ctx.font = hs + "px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(i < player.hp ? '\u2665' : '\u2661', 12 + col * hSpacing, 12 + hs + row * (hs + 8)); }
  // Score & pollen
  ctx.fillStyle = COL.text; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'right'; ctx.fillText('スコア: ' + score, CW - 190, 20); ctx.textAlign = 'left';
  ctx.fillStyle = COL.pollen; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('\uD83C\uDF3C ' + pollen, CW - 190, 38);
  // Floor & wave (centered, no overlap)
  ctx.textAlign = 'center';
  if (!isBossFloor() || !boss) {
    ctx.fillStyle = COL.bless; ctx.font = "bold 40px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('フロア ' + floor + '  W' + (Math.min(wave + 1, WAVES.length)) + '/' + WAVES.length, CW / 2, 20);
  } else {
    ctx.fillStyle = '#e74c3c'; ctx.font = "bold 40px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('フロア ' + floor + '  ボス', CW / 2, 20);
  }
  ctx.textAlign = 'left';
  // Weapon
  ctx.fillStyle = player.weapon.color; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('\u2694 ' + player.weapon.name, 12, CH - 28);
  ctx.fillStyle = COL.text; ctx.font = "36px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('ATK:' + Math.ceil(player.atk * player.weapon.dmgMul), 12, CH - 14);
  // Blessings
  if (activeBlessings.length > 0) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
    for (let i = 0; i < activeBlessings.length; i++) ctx.fillText(activeBlessings[i].icon, CW - 20 - (activeBlessings.length - i) * 22, 115); }
  // Controls
  // Consumable slots
    // Item slots with clear labels
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(CW - 185, 50, 170, 55);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('アイテム', CW - 178, 62);
    for (let i = 0; i < 3; i++) {
      const sx = CW - 160 + i * 52, sy = 80;
      // Slot background
      ctx.fillStyle = player.consumables[i] ? 'rgba(50,40,80,0.9)' : 'rgba(0,0,0,0.4)';
      ctx.fillRect(sx - 20, sy - 16, 40, 32);
      ctx.strokeStyle = player.consumables[i] ? '#ffd700' : 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
      ctx.strokeRect(sx - 20, sy - 16, 40, 32);
      if (player.consumables && player.consumables[i]) {
        ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
        ctx.fillText(player.consumables[i].icon, sx, sy + 6); ctx.textAlign = 'left';
      }
      // Key number (always visible)
      ctx.fillStyle = player.consumables[i] ? '#ffd700' : 'rgba(255,255,255,0.3)';
      ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText((i + 1), sx - 16, sy + 20);
    }
    // Sub weapon indicator
    if (player.weapons[1] !== null) {
      const subW = player.weapons[1 - player.weaponIdx];
      if (subW) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(8, CH - 65, 160, 30);
        ctx.strokeStyle = subW.color || '#aaa'; ctx.lineWidth = 2; ctx.strokeRect(8, CH - 65, 160, 30);
        ctx.fillStyle = '#aaa'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('もうひとつ', 14, CH - 52);
        ctx.fillStyle = subW.color || '#fff'; ctx.font = "bold 19px 'M PLUS Rounded 1c', sans-serif";
        ctx.fillText('Q: ' + subW.name, 14, CH - 38);
      }
    }
    // Controls help (context-sensitive)
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(0, CH - 22, CW, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    let helpText = 'WASD:いどう  Z:こうげき  X:ダッシュ  TAB:もちもの';
    if (player.weapons[1] !== null) helpText += '  Q:ぶきもちかえ';
    if (player.consumables.some(c => c !== null)) helpText += '  1/2/3:アイテムつかう';
    ctx.fillText(helpText, CW / 2, CH - 6); ctx.textAlign = 'left';
}


function drawBlessing() {
  if (gameState !== 'blessing') return;
  ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = COL.bless; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText('祝福を選べ！', CW / 2, 70);
  ctx.fillStyle = COL.text; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('← → で選んで Z で決定', CW / 2, 95);
  for (let i = 0; i < blessingChoices.length; i++) {
    const b = blessingChoices[i], bx = CW / 2 - 300 + i * 220, by = 120, bw = 180, bh = 220;
    const sel = i === selectCursor;
    ctx.fillStyle = sel ? 'rgba(50,50,80,0.95)' : COL.blessBox; ctx.fillRect(bx, by, bw, bh);
    const rCol = b.rarity === 'epic' ? '#ffd700' : b.rarity === 'rare' ? '#3498db' : '#aaa';
    ctx.strokeStyle = sel ? '#fff' : rCol; ctx.lineWidth = sel ? 3 : 2; ctx.strokeRect(bx, by, bw, bh);
    if (sel) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(bx, by, bw, bh); }
    ctx.fillStyle = COL.text; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.icon, bx + bw / 2, by + 55);
    ctx.fillStyle = rCol; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.rarity ? b.rarity.toUpperCase() : 'COMMON', bx + bw / 2, by + 80);
    ctx.fillStyle = COL.bless; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.name, bx + bw / 2, by + 105);
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(b.desc, bx + bw / 2, by + 135);
    ctx.fillStyle = sel ? '#fff' : 'rgba(255,255,255,0.4)'; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(sel ? '> Z <' : '[' + (i + 1) + ']', bx + bw / 2, by + 195);
  }
  ctx.textAlign = 'left';
}


function drawShop() {
  if (gameState !== 'shop') return;
  ctx.fillStyle = 'rgba(0,0,0,0.65)'; ctx.fillRect(0, 0, CW, CH);
  // Title
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 30px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText('🌸 はなの市場 🌸', CW / 2, 55);
  ctx.fillStyle = '#ddd'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('いらっしゃい！ なにがほしいの？', CW / 2, 82);
  ctx.fillStyle = COL.pollen; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('💛 花粉: ' + pollen, CW / 2, 108);
  // Layout: 2 rows x 3 cols (or fewer)
  const cols = 3;
  const cardW = 240, cardH = 200, padX = 24, padY = 20;
  const totalW = cols * cardW + (cols - 1) * padX;
  const startX = CW / 2 - totalW / 2;
  const startY = 130;
  for (let i = 0; i < shopItems.length; i++) {
    const s = shopItems[i];
    const row = Math.floor(i / cols), col = i % cols;
    const sx = startX + col * (cardW + padX);
    const sy = startY + row * (cardH + padY);
    const sel = i === selectCursor;
    const canBuy = pollen >= s.cost;
    // Card background
    ctx.fillStyle = canBuy ? (sel ? 'rgba(60,50,90,0.95)' : 'rgba(30,30,50,0.85)') : 'rgba(60,30,30,0.8)';
    ctx.fillRect(sx, sy, cardW, cardH);
    // Border
    ctx.strokeStyle = sel ? '#ffd700' : (canBuy ? 'rgba(255,215,0,0.4)' : '#555');
    ctx.lineWidth = sel ? 3 : 1; ctx.strokeRect(sx, sy, cardW, cardH);
    // Icon
    ctx.fillStyle = '#fff'; ctx.font = "48px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(s.icon, sx + cardW / 2, sy + 50);
    // Name
    ctx.fillStyle = canBuy ? '#fff' : '#888'; ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif";
    const nm = s.name.length > 8 ? s.name.slice(0,8) + '..' : s.name;
    ctx.fillText(nm, sx + cardW / 2, sy + 85);
    // Desc
    if (sel && s.desc) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = "16px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(s.desc, sx + cardW / 2, sy + 140); }
    // Cost
    ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(s.cost + ' 花粉', sx + cardW / 2, sy + 115);
    // Select indicator
    if (sel) {
      ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(canBuy ? '▶ Zで買う ◀' : '✖ 花粉不足', sx + cardW / 2, sy + 178);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('◀▶で選ぶ', sx + cardW / 2, sy + 185);
    }
  }
  // Skip button
  const skipRow = Math.floor(shopItems.length / cols) + 1;
  const skipY = startY + skipRow * (cardH + padY) + 10;
  const skipSel = selectCursor >= shopItems.length;
  ctx.fillStyle = skipSel ? '#ffd700' : 'rgba(255,255,255,0.4)';
  ctx.font = (skipSel ? 'bold 20px' : '20px') + ' M PLUS Rounded 1c, sans-serif';
  ctx.fillText(skipSel ? '▶ つぎへすすむ (Z) ◀' : 'Xキー / Escでつぎへ', CW / 2, skipY);
  ctx.textAlign = 'left';
}


function drawGarden() {
  ctx.fillStyle = '#1a0a2e'; ctx.fillRect(0, 0, CW, CH);
  // Stars
  for (let i = 0; i < 30; i++) {
    const sx = (i * 137 + 50) % CW, sy = (i * 97 + 30) % (CH - 200) + 50;
    ctx.fillStyle = 'rgba(255,255,200,' + (0.3 + Math.sin(Date.now()/1000 + i) * 0.2) + ')';
    ctx.beginPath(); ctx.arc(sx, sy, 1.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 64px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText('🌸 ミプリンの花壇 🌸', CW / 2, 60);
  ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ネクター: ' + nectar, CW / 2, 95);
  for (let i = 0; i < GARDEN_DEFS.length; i++) {
    const def = GARDEN_DEFS[i];
    const lv = gardenUpgrades[def.id] || 0;
    const cost = getGardenCost(def.id);
    const y = 150 + i * 100;
    const selected = i === gardenCursor;
    // Box
    ctx.fillStyle = selected ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.05)';
    ctx.fillRect(CW/2 - 250, y, 500, 80);
    if (selected) { ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(CW/2 - 250, y, 500, 80); }
    // Icon + Name
    ctx.fillStyle = '#fff'; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
    ctx.fillText(def.icon + ' ' + def.name, CW/2 - 230, y + 30);
    // Desc
    ctx.fillStyle = '#ccc'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(def.desc, CW/2 - 230, y + 55);
    // Level
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'right';
    let lvText = 'Lv.' + lv + ' / ' + def.max;
    if (lv >= def.max) lvText += ' (MAX)';
    ctx.fillText(lvText, CW/2 + 230, y + 30);
    // Cost
    if (cost > 0) {
      ctx.fillStyle = nectar >= cost ? '#8f8' : '#f88';
      ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('コスト: ' + cost + ' ネクター', CW/2 + 230, y + 55);
    } else {
      ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('✅ 最大強化済', CW/2 + 230, y + 55);
    }
  }
  ctx.textAlign = 'center'; ctx.fillStyle = '#888'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('↑↓で選択 / Zで購入 / Xで戻る', CW / 2, CH - 40);
  ctx.textAlign = 'left';
}


function drawTitle() {
  if (currentBGM !== 'title') playBGM('title');
  ctx.fillStyle = '#fffde7';
  ctx.fillRect(0, 0, CW, CH);
  // Draw cute mipurin
  if (mipurinReady) {
    const f = MIPURIN_FRAMES.down;
    const sz = 240;
    ctx.drawImage(mipurinImg, f.sx, f.sy, f.sw, f.sh, CW / 2 - sz / 2, 120, sz, sz);
  }
  // Title text
  ctx.fillStyle = '#ff9800';
  ctx.font = "bold 140px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('ミプリンの冒険', CW / 2, 440);
  ctx.fillStyle = '#795548';
  ctx.font = "24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('v5.0', CW / 2, 480);
  // Blink
  titleBlink += 1 / 60;
  if (Math.sin(titleBlink * 3) > -0.3) {
    ctx.fillStyle = '#e65100';
    ctx.font = "bold 32px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('Zキーでスタート', CW / 2, 560);
    ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('Xキーで花壇メニュー', CW / 2, 595);
    ctx.fillStyle = '#ffd700'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('ネクター: ' + nectar, CW / 2, 755);
  }
  ctx.fillStyle = '#888';
  ctx.font = "32px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('移動: WASD  攻撃: Z  ダッシュ: X', CW / 2, 640);
  ctx.fillText('アイテム: 1/2/3', CW / 2, 670);
  ctx.textAlign = 'left';
}


function drawDmgNumbers() {
  for (const d of dmgNumbers) { ctx.globalAlpha = clamp(d.life / 0.3, 0, 1); ctx.fillStyle = d.color; ctx.font = "bold 40px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center'; ctx.fillText(d.val, d.x, d.y); ctx.textAlign = 'left'; ctx.globalAlpha = 1; }
}


