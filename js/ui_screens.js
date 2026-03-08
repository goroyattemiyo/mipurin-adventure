// ===== UI SCREENS MODULE =====
// Full-screen UI: title, prologue, ending, garden
// Extracted from ui.js for Phase 2 expansion
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