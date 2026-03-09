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
  ctx.save(); ctx.globalAlpha = 0.9;
  const endImgKey = endType === 'true' ? 'ending_c' : endType === 'good' ? 'ending_b' : 'ending_a'; if (endingImgs[endImgKey]) { const eiw = Math.min(CW * 0.6, 700), eih = eiw * 0.75; ctx.drawImage(endingImgs[endImgKey], CW/2 - eiw/2, 40, eiw, eih); } else if (mipurinReady) {
    const sz = 200;
    ctx.drawImage(mipurinImg, 0, 0, 250, 250, CW/2 - sz/2, 120, sz, sz);
  }
  ctx.restore();
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    const endType = (activeBlessings.length >= 12 && activeDuos.length >= 3) ? 'true' : (activeBlessings.length >= 8) ? 'good' : 'normal';
  const endTitle = endType === 'true' ? '✨ クリスタルの再生 ✨' : endType === 'good' ? '🌸 かけらの光 🌸' : '小さな希望';
  ctx.fillText(endTitle, CW/2, 380);
  ctx.fillStyle = '#fff'; ctx.font = "22px 'M PLUS Rounded 1c', sans-serif";
  if (endType === 'true') {
    ctx.fillText('すべてのかけらが集まり、クリスタルが光を取り戻した。', CW/2, 430);
    ctx.fillText('女王さまの声が聞こえた──「ありがとう、ミプリン」', CW/2, 460);
  } else if (endType === 'good') {
    ctx.fillText('たくさんのかけらを集め、花の国に色が戻りはじめた。', CW/2, 430);
    ctx.fillText('フローラの花壇に見たことのない花が咲いた。', CW/2, 460);
  } else {
    ctx.fillText('闇の蛾を倒し、花粉が少しずつ戻りはじめた。', CW/2, 430);
    ctx.fillText('クリスタルはまだ砕けたまま… でも希望の光は灯った。', CW/2, 460);
  }
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



function isGardenVisible(def) {
  if (!def.unlock) return true;
  return gardenUnlocks[def.unlock] === true;
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
    const visibleDefs = GARDEN_DEFS.filter(d => isGardenVisible(d));
  // NPC Flora（右下）
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(CW - 320, CH - 200, 300, 160);
  ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1; ctx.strokeRect(CW - 320, CH - 200, 300, 160);
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
  if (floraReady) { ctx.drawImage(floraImg, CW - 100, CH - 200, 80, 140); }
  ctx.fillText('🌸 フローラ', CW - 310, CH - 175);
  ctx.fillStyle = '#fff'; ctx.font = "17px 'M PLUS Rounded 1c', sans-serif";
  const floraText = typeof getFloraLine === 'function' ? getFloraLine() : '';
  const words = floraText.split('');
  let fline = '', fly = CH - 150;
  for (const ch of words) { fline += ch; if (ctx.measureText(fline).width > 260) { ctx.fillText(fline, CW - 310, fly); fly += 20; fline = ''; } }
  if (fline) ctx.fillText(fline, CW - 310, fly);
  // クリア数表示
  ctx.fillStyle = '#aaa'; ctx.font = "16px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('クリア回数: ' + totalClears, CW - 310, CH - 50);
  ctx.textAlign = 'center';
  for (let i = 0; i < visibleDefs.length; i++) {
    const def = visibleDefs[i];
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
  if (titleBgReady) { ctx.drawImage(titleBgImg, 0, 0, CW, CH); } else { ctx.fillRect(0, 0, CW, CH); }
  ctx.fillRect(0, 0, CW, CH);
  // Draw cute mipurin
  if (mipurinReady) {
    const f = MIPURIN_FRAMES.down; const sz = 240;
    ctx.drawImage(mipurinImg, f.sx, f.sy, f.sw, f.sh, CW / 2 - sz / 2, 120, sz, sz);
  }
  // Title text
  ctx.fillStyle = '#ff9800';
  ctx.font = "bold 140px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('ミプリンの冒険', CW / 2, 440);
  ctx.fillStyle = '#795548';
  ctx.font = "24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(VERSION, CW / 2, 480);
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