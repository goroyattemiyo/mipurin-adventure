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
  ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? 'タップで次へ' : 'Zキーで次へ  /  Xキーでスキップ', CW / 2, CH - 20);
  ctx.textAlign = 'left';
}



function drawEnding() {
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, CW, CH);
  const endType = (activeBlessings.length >= 12 && activeDuos.length >= 3) ? 'true' : (activeBlessings.length >= 8) ? 'good' : 'normal';
  // --- Image: left side ---
  ctx.save(); ctx.globalAlpha = 0.9;
  const imgX = 40, imgY = 80, imgW = CW * 0.4, imgH = imgW * 0.85;
  const endImgKey = endType === 'true' ? 'ending_c' : endType === 'good' ? 'ending_b' : 'ending_a';
  if (endingImgs[endImgKey]) {
    ctx.drawImage(endingImgs[endImgKey], imgX, imgY, imgW, imgH);
  } else if (mipurinReady) {
    ctx.drawImage(mipurinImg, 0, 0, 250, 250, imgX + imgW/2 - 100, imgY + imgH/2 - 100, 200, 200);
  }
  ctx.restore();
  // --- Text: right side panel ---
  const px = CW * 0.47, py = 60, pw = CW * 0.5, ph = CH - 120;
  ctx.fillStyle = 'rgba(20,5,15,0.72)';
  ctx.beginPath();
  const cr = 16;
  ctx.moveTo(px+cr,py); ctx.lineTo(px+pw-cr,py); ctx.quadraticCurveTo(px+pw,py,px+pw,py+cr);
  ctx.lineTo(px+pw,py+ph-cr); ctx.quadraticCurveTo(px+pw,py+ph,px+pw-cr,py+ph);
  ctx.lineTo(px+cr,py+ph); ctx.quadraticCurveTo(px,py+ph,px,py+ph-cr);
  ctx.lineTo(px,py+cr); ctx.quadraticCurveTo(px,py,px+cr,py); ctx.fill();
  ctx.strokeStyle = 'rgba(255,200,100,0.3)'; ctx.lineWidth = 2; ctx.stroke();
  const tcx = px + pw / 2;
  ctx.textAlign = 'center';
  // Loop badge
  if (typeof loopCount !== 'undefined' && loopCount > 0) {
    ctx.fillStyle = '#ff6b6b'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(loopCount + '\u5468\u76EE\u30AF\u30EA\u30A2\uFF01', tcx, py + 35);
  }
  // Title
  const endTitle = endType === 'true' ? '\u2728 \u30AF\u30EA\u30B9\u30BF\u30EB\u306E\u518D\u751F \u2728' : endType === 'good' ? '\uD83C\uDF38 \u304B\u3051\u3089\u306E\u5149 \uD83C\uDF38' : '\u5C0F\u3055\u306A\u5E0C\u671B';
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 34px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(endTitle, tcx, py + 75);
  // Story
  ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  if (endType === 'true') {
    ctx.fillText('\u3059\u3079\u3066\u306E\u304B\u3051\u3089\u304C\u96C6\u307E\u308A\u3001\u30AF\u30EA\u30B9\u30BF\u30EB\u304C\u5149\u3092\u53D6\u308A\u623B\u3057\u305F\u3002', tcx, py + 115);
    ctx.fillText('\u5973\u738B\u3055\u307E\u306E\u58F0\u304C\u805E\u3053\u3048\u305F\u2500\u2500\u300C\u3042\u308A\u304C\u3068\u3046\u3001\u30DF\u30D7\u30EA\u30F3\u300D', tcx, py + 145);
  } else if (endType === 'good') {
    ctx.fillText('\u305F\u304F\u3055\u3093\u306E\u304B\u3051\u3089\u3092\u96C6\u3081\u3001\u82B1\u306E\u56FD\u306B\u8272\u304C\u623B\u308A\u306F\u3058\u3081\u305F\u3002', tcx, py + 115);
    ctx.fillText('\u30D5\u30ED\u30FC\u30E9\u306E\u82B1\u58C7\u306B\u898B\u305F\u3053\u3068\u306E\u306A\u3044\u82B1\u304C\u54B2\u3044\u305F\u3002', tcx, py + 145);
  } else {
    ctx.fillText('\u95C7\u306E\u86FE\u3092\u5012\u3057\u3001\u82B1\u7C89\u304C\u5C11\u3057\u305A\u3064\u623B\u308A\u306F\u3058\u3081\u305F\u3002', tcx, py + 115);
    ctx.fillText('\u30AF\u30EA\u30B9\u30BF\u30EB\u306F\u307E\u3060\u7815\u3051\u305F\u307E\u307E\u2026 \u3067\u3082\u5E0C\u671B\u306E\u5149\u306F\u706F\u3063\u305F\u3002', tcx, py + 145);
  }
  // Stats
  ctx.fillStyle = '#ccc'; ctx.font = "18px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('\u30B9\u30B3\u30A2: ' + score + '  \u82B1\u7C89: ' + pollen + '  \u30D5\u30ED\u30A2: ' + floor, tcx, py + 200);
  ctx.fillStyle = '#ffd700'; ctx.fillText('\u7372\u5F97\u30CD\u30AF\u30BF\u30FC: +' + runNectar, tcx, py + 235);
  ctx.fillText('\u795D\u798F: ' + activeBlessings.length + '  \u5171\u9CF4: ' + (typeof activeDuos !== 'undefined' ? activeDuos.length : 0), tcx, py + 265);
  // Prompt
  ctx.font = "22px 'M PLUS Rounded 1c', sans-serif";
  const blinkOn = Math.floor(Date.now() / 500) % 2 === 0;
  ctx.fillStyle = '#ffd700';
  if (blinkOn) ctx.fillText('Z\u30AD\u30FC\u3067\u30BF\u30A4\u30C8\u30EB\u3078', tcx, py + ph - 80);
  ctx.fillStyle = '#87ceeb';
  if (blinkOn) ctx.fillText('X\u30AD\u30FC\u3067\u5F37\u304F\u3066\u30CB\u30E5\u30FC\u30B2\u30FC\u30E0\uFF08' + (typeof loopCount !== 'undefined' ? loopCount + 1 : 1) + '\u5468\u76EE\uFF09', tcx, py + ph - 50);
  ctx.textAlign = 'left';
  if (fadeDir !== 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
}



function isGardenVisible(def) {
  if (!def.unlock) return true;
  return gardenUnlocks[def.unlock] === true;
}

function drawGarden() {
  if (currentBGM !== 'garden') playBGM('garden', 0.6);
  const visibleDefs = GARDEN_DEFS.filter(d => isGardenVisible(d));
  ctx.fillStyle = '#1a0a2e'; ctx.fillRect(0, 0, CW, CH);
  for (let i = 0; i < 40; i++) { ctx.globalAlpha = 0.3 + Math.sin(Date.now()/1000 + i) * 0.2; ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc((i*137)%CW, (i*97)%CH, 1.5, 0, Math.PI*2); ctx.fill(); }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 52px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText('🌸 ミプリンの花壇 🌸', CW/2, 55);
  ctx.fillStyle = '#aaa'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ネクター: ' + nectar + '  クリア回数: ' + totalClears, CW/2, 85);
  const floraW=220, floraH=340, floraX=40, floraY=100;
  const floraFloat = Math.sin(Date.now()/800)*5;
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.roundRect(floraX-10, floraY-10, floraW+20, floraH+60, 16); ctx.fill();
  if (typeof floraReady !== 'undefined' && floraReady) { ctx.save(); ctx.globalAlpha=0.95; ctx.drawImage(floraImg, floraX, floraY+floraFloat, floraW, floraH); ctx.restore(); }
  ctx.fillStyle = '#90ee90'; ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillText('🌸 フローラ', floraX+floraW/2, floraY+floraH+25);
  const bx=floraX+floraW+20, by=floraY, bw=320, bh=90;
  ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 12); ctx.fill();
  ctx.fillStyle = '#333'; ctx.font = "17px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
  const ftext = (function(){var g=['お花を育てて、冒険を有利にしよう！','ネクターで花壇を強化できるわよ！','新しい花が咲いたら教えてね！','ミプリン、がんばってね～！'];return g[Math.floor(Date.now()/10000)%g.length]})();
  const chars = ftext.split(''); let fline = '', fly = by+25;
  for (const ch of chars) { fline += ch; if (ctx.measureText(fline).width > bw-30) { ctx.fillText(fline, bx+15, fly); fly += 22; fline = ''; } }
  if (fline) ctx.fillText(fline, bx+15, fly);
  const cardX=380, cardW=860, cardH=68, startY=110;
  const gap = Math.min(75, (CH-startY-50)/Math.max(visibleDefs.length, 1));
  for (let i = 0; i < visibleDefs.length; i++) {
    const def = visibleDefs[i]; const lv = gardenUpgrades[def.id]||0; const cost = getGardenCost(def.id); const y = startY + i*gap; const selected = i === gardenCursor;
    ctx.fillStyle = selected ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.roundRect(cardX, y, cardW, cardH, 10); ctx.fill();
    if (selected) { ctx.strokeStyle = '#ffd700'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(cardX, y, cardW, cardH, 10); ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
    ctx.fillText(def.icon + ' ' + def.name, cardX+15, y+28);
    ctx.fillStyle = '#ccc'; ctx.font = "18px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(def.desc, cardX+15, y+52);
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'right';
    let lvText = 'Lv.' + lv + ' / ' + def.max; if (lv >= def.max) lvText += ' (MAX)';
    ctx.fillText(lvText, cardX+cardW-15, y+28);
    if (cost > 0) { ctx.fillStyle = nectar >= cost ? '#8f8' : '#f88'; ctx.font = "18px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('コスト: ' + cost + ' ネクター', cardX+cardW-15, y+52); }
    else { ctx.fillStyle = '#ffd700'; ctx.font = "18px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('✅ 最大強化済', cardX+cardW-15, y+52); }
  }
  ctx.textAlign = 'center'; ctx.fillStyle = '#888'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? 'タップで選択・購入' : '↑↓で選択 / Zで購入 / Xで戻る', CW/2, CH-15);
  ctx.textAlign = 'left';
}




function drawTitle() {
  if (currentBGM !== 'title') playBGM('title', 0.8);
  // === Background ===
  ctx.fillStyle = '#fffde7';
  if (titleBgReady) { ctx.drawImage(titleBgImg, 0, 0, CW, CH); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(0, 0, CW, CH); } else { ctx.fillRect(0, 0, CW, CH); }

  // === Mipurin sprite ===
  if (mipurinReady) {
    const f = MIPURIN_FRAMES.down; const sz = 220;
    ctx.drawImage(mipurinImg, f.sx, f.sy, f.sw, f.sh, CW/2 - sz/2, 80, sz, sz);
  }

  // === Title ===
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff9800';
  ctx.font = "bold 120px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('ミプリンの冒険', CW/2, 390);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = "18px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(VERSION, CW/2, 420);

  // === Start prompt (blink) ===
  if (Math.sin(titleBlink * 3) > -0.3) {
    ctx.fillStyle = '#ffcc00';
    ctx.font = "bold 34px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? 'タップでスタート' : 'Zキーでスタート', CW/2, 500);
  }

  // === Info panel (bottom) ===
  const panelY = 560;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  const pw = 700, px = CW/2 - pw/2, ph = CH - panelY - 20;
  ctx.beginPath();
  const cr = 16;
  ctx.moveTo(px + cr, panelY); ctx.lineTo(px + pw - cr, panelY);
  ctx.quadraticCurveTo(px + pw, panelY, px + pw, panelY + cr);
  ctx.lineTo(px + pw, panelY + ph - cr);
  ctx.quadraticCurveTo(px + pw, panelY + ph, px + pw - cr, panelY + ph);
  ctx.lineTo(px + cr, panelY + ph);
  ctx.quadraticCurveTo(px, panelY + ph, px, panelY + ph - cr);
  ctx.lineTo(px, panelY + cr);
  ctx.quadraticCurveTo(px, panelY, px + cr, panelY);
  ctx.closePath(); ctx.fill();

  // Controls (1 line, compact)
  ctx.fillStyle = '#e0d6c2';
  ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? 'ジョイスティックで移動　ボタンで操作' : '移動: WASD / 矢印　　攻撃: Z　　ダッシュ: X　　アイテム: 1·2·3', CW/2, panelY + 40);

  // Garden + Nectar (1 line)
  ctx.fillStyle = '#ffd700';
  ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('🌸 ネクター: ' + nectar + '　　　Xキーで花壇メニュー', CW/2, panelY + 80);

  // === Volume control ===
  if (typeof titleVolSel === 'undefined') titleVolSel = -1;
  if (titleVolSel >= 0) {
    const labels = ['BGM', 'SE'];
    const vols = [typeof bgmVolume !== 'undefined' ? bgmVolume : 0.7, typeof seVolume !== 'undefined' ? seVolume : 0.7];
    for (let i = 0; i < 2; i++) {
      const vy = panelY + 120 + i * 30;
      ctx.fillStyle = titleVolSel === i ? '#ffd700' : '#ccc';
      ctx.font = "18px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(labels[i] + '  \u25C0 ' + Math.round(vols[i] * 100) + '% \u25B6', CW/2, vy);
    }
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = "16px 'M PLUS Rounded 1c', sans-serif";
    if (typeof touchActive === 'undefined' || !touchActive) ctx.fillText('↑↓: 音量調整  ←→: 変更', CW/2, panelY + 130);
  }

  ctx.textAlign = 'left';
  // Fade overlay
  if (typeof fadeDir !== 'undefined' && fadeDir !== 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
}

// ===== 記憶の花壇: 祝福持ち越し選択画面 =====
function drawMemorySelect() {
  // Background
  ctx.fillStyle = '#0a0515';
  ctx.fillRect(0, 0, CW, CH);

  // Title area
  const maxSel = Math.min((gardenUpgrades.memory || 1), activeBlessings.length);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700';
  ctx.font = "bold 30px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('🌸 記憶の花壇', CW / 2, 52);
  ctx.fillStyle = '#f0c0e0';
  ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('次のランに持ち越す祝福を ' + maxSel + ' 個選んでね', CW / 2, 82);
  ctx.fillStyle = '#aaa';
  ctx.font = "15px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('←→: 選ぶ  Z: 選択/解除  X: 決定', CW / 2, 108);

  // Blessing cards
  const blessings = activeBlessings;
  const cardW = Math.min(160, (CW - 40) / Math.max(1, Math.min(blessings.length, 5)));
  const cardH = 130;
  const visMax = Math.min(blessings.length, Math.floor((CW - 40) / (cardW + 8)));
  // Scroll window centered on cursor
  let startIdx = Math.max(0, Math.min(memoryCursor - Math.floor(visMax / 2), blessings.length - visMax));
  const totalW = visMax * (cardW + 8) - 8;
  const startX = (CW - totalW) / 2;
  const cardY = 140;

  for (let i = 0; i < visMax; i++) {
    const idx = startIdx + i;
    if (idx >= blessings.length) break;
    const b = blessings[idx];
    const cx = startX + i * (cardW + 8);
    const isCursor = (idx === memoryCursor);
    const isChosen = memorySelected.has(b.id);

    // Card background
    ctx.save();
    if (isCursor) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 16; }
    ctx.fillStyle = isChosen ? 'rgba(255,215,0,0.22)' : isCursor ? 'rgba(255,255,255,0.12)' : 'rgba(30,10,50,0.75)';
    ctx.strokeStyle = isChosen ? '#ffd700' : isCursor ? '#fff' : 'rgba(200,150,255,0.3)';
    ctx.lineWidth = isChosen ? 2.5 : 1.5;
    ctx.beginPath();
    const r = 12;
    ctx.moveTo(cx + r, cardY); ctx.lineTo(cx + cardW - r, cardY);
    ctx.quadraticCurveTo(cx + cardW, cardY, cx + cardW, cardY + r);
    ctx.lineTo(cx + cardW, cardY + cardH - r);
    ctx.quadraticCurveTo(cx + cardW, cardY + cardH, cx + cardW - r, cardY + cardH);
    ctx.lineTo(cx + r, cardY + cardH);
    ctx.quadraticCurveTo(cx, cardY + cardH, cx, cardY + cardH - r);
    ctx.lineTo(cx, cardY + r);
    ctx.quadraticCurveTo(cx, cardY, cx + r, cardY);
    ctx.fill(); ctx.stroke();
    ctx.restore();

    // Icon
    ctx.textAlign = 'center';
    ctx.font = "36px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(b.icon || '✨', cx + cardW / 2, cardY + 46);

    // Name
    ctx.font = "bold 13px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillStyle = isChosen ? '#ffd700' : '#fff';
    const nameTxt = b.name || b.id;
    const shortName = nameTxt.length > 9 ? nameTxt.slice(0, 8) + '…' : nameTxt;
    ctx.fillText(shortName, cx + cardW / 2, cardY + 68);

    // Desc
    ctx.font = "12px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillStyle = '#ccc';
    const descTxt = b.desc || '';
    const shortDesc = descTxt.length > 12 ? descTxt.slice(0, 11) + '…' : descTxt;
    ctx.fillText(shortDesc, cx + cardW / 2, cardY + 86);

    // Checkmark if selected
    if (isChosen) {
      ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillStyle = '#ffd700';
      ctx.fillText('✔', cx + cardW / 2, cardY + 108);
    }
  }

  // Scroll arrows hint
  if (startIdx > 0) { ctx.textAlign = 'center'; ctx.fillStyle = '#aaa'; ctx.font = "20px sans-serif"; ctx.fillText('◀', startX - 14, cardY + cardH / 2 + 8); }
  if (startIdx + visMax < blessings.length) { ctx.textAlign = 'center'; ctx.fillStyle = '#aaa'; ctx.font = "20px sans-serif"; ctx.fillText('▶', startX + totalW + 14, cardY + cardH / 2 + 8); }

  // Selected list
  const selY = cardY + cardH + 22;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f0c0e0';
  ctx.font = "17px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('選択中 [' + memorySelected.size + ' / ' + maxSel + ']', CW / 2, selY);

  if (memorySelected.size > 0) {
    const names = Array.from(memorySelected).map(bid => {
      const bl = activeBlessings.find(b => b.id === bid);
      return bl ? (bl.icon || '') + ' ' + (bl.name || bid) : bid;
    }).join('  ');
    ctx.fillStyle = '#ffd700';
    ctx.font = "15px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(names.slice(0, 60), CW / 2, selY + 26);
  }

  // Confirm button hint
  const confirmY = CH - 55;
  ctx.fillStyle = memorySelected.size > 0 ? '#87ceeb' : 'rgba(255,255,255,0.3)';
  ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
  if (Math.floor(Date.now() / 600) % 2 === 0 || memorySelected.size === 0) {
    ctx.fillText('X キーで決定（0個でも進める）', CW / 2, confirmY);
  }

  ctx.textAlign = 'left';
  // Fade
  if (typeof fadeDir !== 'undefined' && fadeDir !== 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
}

