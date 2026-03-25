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
  // 隠しエンディング判定: 図鑑コンプリート && loopCount >= 1
  const _encComp = (typeof isEncyclopediaComplete === 'function') && isEncyclopediaComplete();
  const _loopOk  = (typeof loopCount !== 'undefined') && loopCount >= 1;
  if (_encComp && _loopOk && currentBGM !== 'end_c') playBGM('end_c', 0.8);
  const endType = (_encComp && _loopOk) ? 'hidden'
    : (typeof queenReturned !== 'undefined' && queenReturned) ? 'queen'
    : (activeBlessings.length >= 12 && activeDuos.length >= 3) ? 'true'
    : (activeBlessings.length >= 8) ? 'good' : 'normal';
  // --- Image: left side ---
  ctx.save(); ctx.globalAlpha = 0.9;
  const imgX = 40, imgY = 80, imgW = CW * 0.4, imgH = imgW * 0.85;
  const endImgKey = endType === 'hidden' ? 'ending_c' : endType === 'queen' ? 'ending_c' : endType === 'true' ? 'ending_c' : endType === 'good' ? 'ending_b' : 'ending_a';
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
  const endTitle = endType === 'hidden' ? '🌟 解放の歌 🌟'
    : endType === 'queen' ? '👑 女王帰還 — 光の再誕 👑'
    : endType === 'true' ? '✨ クリスタルの再生 ✨'
    : endType === 'good' ? '🌸 かけらの光 🌸' : '小さな希望';
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 34px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(endTitle, tcx, py + 75);
  // Story
  ctx.fillStyle = '#fff'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  if (endType === 'hidden') {
    // 隠しエンディング専用: 紫グロウ演出 + 特別ストーリー
    ctx.save();
    ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 18;
    ctx.fillStyle = '#e0ccff';
    ctx.fillText('すべての影を見た者よ。', tcx, py + 108);
    ctx.fillText('砕けたクリスタルが、いま再び歌い始める——', tcx, py + 133);
    ctx.fillText('ダークビーたちに光が戻った。', tcx, py + 158);
    ctx.restore();
    // スペシャルバッジ
    ctx.fillStyle = 'rgba(167,139,250,0.18)'; ctx.fillRect(tcx - 160, py + 223, 320, 26);
    ctx.fillStyle = '#a78bfa'; ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('🖤 図鑑コンプリート + ループクリア達成！', tcx, py + 185);
    ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  } else if (endType === 'queen') {
    // 女王帰還エンディング: 金グロウ演出
    ctx.save();
    ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 16;
    ctx.fillStyle = '#fffde7';
    ctx.fillText('闇の根が砕けた瞬間——', tcx, py + 108);
    ctx.fillText('女王フローラの声が、花の国に響き渡った。', tcx, py + 133);
    ctx.fillText('クリスタルの光が、完全に取り戻された。', tcx, py + 158);
    ctx.restore();
    ctx.fillStyle = '#ffd700'; ctx.font = "bold 14px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('👑 最終ボス撃破 — 女王帰還エンディング達成！', tcx, py + 185);
    ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
  } else if (endType === 'true') {
    ctx.fillText('すべてのかけらが集まり、クリスタルが光を取り戻した。', tcx, py + 115);
    ctx.fillText('女王さまの声が聞こえた——「ありがとう、ミプリン」', tcx, py + 145);
  } else if (endType === 'good') {
    ctx.fillText('たくさんのかけらを集め、花の国に色が戻りはじめた。', tcx, py + 115);
    ctx.fillText('フローラの花壇に見たことのない花が咲いた。', tcx, py + 145);
  } else {
    ctx.fillText('闇の蛾を倒し、花粉が少しずつ戻りはじめた。', tcx, py + 115);
    ctx.fillText('クリスタルはまだ砕けたまま… でも希望の光は灯った。', tcx, py + 145);
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
  if (endType === 'hidden') {
    var _t = Date.now() / 1000;
    for (var _pi = 0; _pi < 12; _pi++) {
      var _px = (CW * 0.1) + ((_pi * 137 + Math.sin(_t + _pi) * 80) % (CW * 0.8));
      var _py2 = (CH * 0.1) + ((_pi * 97 + Math.cos(_t * 0.7 + _pi * 2) * 60) % (CH * 0.8));
      ctx.globalAlpha = 0.3 + Math.sin(_t * 2 + _pi) * 0.2;
      ctx.fillStyle = _pi % 3 === 0 ? '#ffd700' : _pi % 3 === 1 ? '#a78bfa' : '#fff';
      ctx.beginPath(); ctx.arc(_px, _py2, 2 + Math.sin(_t + _pi * 0.5) * 1.5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (endType === 'queen') {
    var _qt = Date.now() / 1000;
    for (var _qi = 0; _qi < 10; _qi++) {
      var _qx = (CW * 0.05) + ((_qi * 151 + Math.sin(_qt + _qi) * 90) % (CW * 0.9));
      var _qy3 = (CH * 0.05) + ((_qi * 89 + Math.cos(_qt * 0.7 + _qi * 2) * 70) % (CH * 0.9));
      ctx.globalAlpha = 0.35 + Math.sin(_qt * 2 + _qi) * 0.2;
      ctx.fillStyle = _qi % 2 === 0 ? '#ffd700' : '#fffde7';
      ctx.beginPath(); ctx.arc(_qx, _qy3, 3 + Math.sin(_qt + _qi * 0.5) * 2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  if (fadeDir !== 0) { ctx.fillStyle = 'rgba(0,0,0,' + fadeAlpha + ')'; ctx.fillRect(0, 0, CW, CH); }
}



function isGardenVisible(def) {
  if (!def.unlock) return true;
  return gardenUnlocks[def.unlock] === true;
}

function drawGarden() {
  if (currentBGM !== 'garden') playBGM('garden', 0.6);
  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  const visibleDefs = GARDEN_DEFS.filter(d => isGardenVisible(d));
  const now = Date.now();

  // ── 背景 ──────────────────────────────────────────
  ctx.fillStyle = '#120820'; ctx.fillRect(0, 0, CW, CH);
  // 星粒
  for (let i = 0; i < 55; i++) {
    ctx.globalAlpha = 0.2 + Math.sin(now / 1100 + i * 1.7) * 0.18;
    ctx.fillStyle = i % 3 === 0 ? '#f9a8d4' : i % 3 === 1 ? '#ffd700' : '#a5f3fc';
    ctx.beginPath(); ctx.arc((i * 173) % CW, (i * 113) % CH, i % 2 === 0 ? 1.2 : 1.8, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── ヘッダー (高さ72px) ───────────────────────────
  const hdrH = 72;
  // ヘッダー帯
  const hdrGrad = ctx.createLinearGradient(0, 0, CW, 0);
  hdrGrad.addColorStop(0, 'rgba(255,182,193,0.18)');
  hdrGrad.addColorStop(0.5, 'rgba(255,215,0,0.22)');
  hdrGrad.addColorStop(1, 'rgba(255,182,193,0.18)');
  ctx.fillStyle = hdrGrad; ctx.fillRect(0, 0, CW, hdrH);
  ctx.strokeStyle = 'rgba(255,215,0,0.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(0, hdrH); ctx.lineTo(CW, hdrH); ctx.stroke();
  // タイトル
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd700'; ctx.font = "bold " + (38*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('🌸 ミプリンの花壇 🌸', CW / 2, 44 + 10*(_M-1));
  // ネクター / クリア（右上）
  ctx.textAlign = 'right'; ctx.fillStyle = '#ffd700'; ctx.font = "bold " + (20*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('🍯 ' + nectar, CW - 20, 32 + 8*(_M-1));
  ctx.fillStyle = '#a5f3fc'; ctx.font = (16*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('クリア ' + totalClears + '回', CW - 20, 56 + 10*(_M-1));

  // ── フローラ エリア (左側) ───────────────────────
  // flora: アスペクト 2:3、CH=960 の場合 下揃え余白30
  const floraH = Math.round(CH * 0.72);        // 691
  const floraW = Math.round(floraH * (2 / 3)); // 461
  const floraX = 18;
  const floraY = CH - floraH - 28;             // 241
  const floraFloat = Math.sin(now / 750) * 6;

  // フローラ背後グロー（柔らかいピンク光輪）
  const glowR = floraW * 0.62;
  const glowCx = floraX + floraW / 2;
  const glowCy = floraY + floraH * 0.42;
  const glow = ctx.createRadialGradient(glowCx, glowCy, 0, glowCx, glowCy, glowR);
  glow.addColorStop(0, 'rgba(255,182,193,0.28)');
  glow.addColorStop(0.55, 'rgba(255,215,0,0.10)');
  glow.addColorStop(1, 'rgba(255,182,193,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.ellipse(glowCx, glowCy, glowR * 1.1, glowR, 0, 0, Math.PI * 2); ctx.fill();

  // フローラ足元グラデ
  const footGrad = ctx.createLinearGradient(floraX, floraY + floraH - 80, floraX, floraY + floraH + 28);
  footGrad.addColorStop(0, 'rgba(18,8,32,0)');
  footGrad.addColorStop(1, 'rgba(18,8,32,0.85)');
  ctx.fillStyle = footGrad; ctx.fillRect(floraX, floraY + floraH - 80, floraW, 108);

  // フローラ画像
  if (typeof floraReady !== 'undefined' && floraReady) {
    ctx.save(); ctx.globalAlpha = 0.97;
    ctx.drawImage(floraImg, floraX, floraY + floraFloat, floraW, floraH);
    ctx.restore();
  } else {
    // 未ロード時フォールバック
    ctx.fillStyle = 'rgba(255,182,193,0.12)';
    ctx.beginPath(); ctx.roundRect(floraX, floraY, floraW, floraH, 20); ctx.fill();
    ctx.textAlign = 'center'; ctx.fillStyle = '#f9a8d4'; ctx.font = "48px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('🌸', floraX + floraW / 2, floraY + floraH / 2);
  }

  // 「フローラ」名前バッジ
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(18,8,32,0.6)'; ctx.beginPath(); ctx.roundRect(floraX + floraW / 2 - 62*_M, CH - 28 - 24*_M, 124*_M, 28*_M, 14); ctx.fill();
  ctx.fillStyle = '#f9a8d4'; ctx.font = "bold " + (17*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('🌸 フローラ', floraX + floraW / 2, CH - 28 - 5*_M);

  // ── フローラ吹き出し ────────────────────────────
  const FLORA_LINES = [
    'お花を育てて、冒険を有利にしよう！',
    'ネクターをたくさん集めてね～♪',
    '新しい花が咲いたら教えてね！',
    'ミプリン、いつも応援してるよ！',
    '花壇の力で、どんな敵も怖くないよ！',
    'まだ咲いてない花もあるかも…？',
    '一緒にがんばろうね、ミプリン！',
    'ネクターが増えると花がキラキラするよ！',
  ];
  const ftext = FLORA_LINES[Math.floor(now / 8000) % FLORA_LINES.length];
  const bx = floraX + floraW + 14;
  const bw = _M === 2 ? 430 : 290, bh = _M === 2 ? 110 : 78;
  const by = floraY + floraFloat + 18; // 吹き出しをフローラ上部に合わせる
  // 吹き出しシェイプ
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.fill();
  ctx.strokeStyle = '#f9a8d4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 14); ctx.stroke();
  // 吹き出し三角（左向き）
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  ctx.beginPath(); ctx.moveTo(bx, by + 26); ctx.lineTo(bx - 14, by + 36); ctx.lineTo(bx, by + 48); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#f9a8d4'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx, by + 26); ctx.lineTo(bx - 14, by + 36); ctx.lineTo(bx, by + 48); ctx.stroke();
  // テキスト折り返し
  const _bfs = 16 * _M;
  ctx.fillStyle = '#444'; ctx.font = _bfs + "px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'left';
  let fline = '', fly2 = by + _bfs * 1.5;
  for (const ch of ftext.split('')) {
    fline += ch;
    if (ctx.measureText(fline).width > bw - 24) { ctx.fillText(fline, bx + 12, fly2); fly2 += _bfs * 1.4; fline = ''; }
  }
  if (fline) ctx.fillText(fline, bx + 12, fly2);

  // ── 花壇カードリスト ───────────────────────────
  const cardX = floraX + floraW + 14;
  const cardW = CW - cardX - 18;
  const cardH = _M === 2 ? 120 : 64;
  const listTop = by + bh + 18; // 吹き出し直下
  const listBot = CH - 42;
  const maxVisible = Math.floor((listBot - listTop) / (cardH + 8));
  // スクロールウィンドウ
  const scrollStart = Math.max(0, Math.min(gardenCursor - Math.floor(maxVisible / 2), visibleDefs.length - maxVisible));

  for (let vi = 0; vi < maxVisible; vi++) {
    const i = scrollStart + vi;
    if (i >= visibleDefs.length) break;
    const def = visibleDefs[i];
    const lv = gardenUpgrades[def.id] || 0;
    const cost = getGardenCost(def.id);
    const cy = listTop + vi * (cardH + 8);
    const selected = i === gardenCursor;

    // カード背景
    ctx.save();
    if (selected) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 18; }
    ctx.fillStyle = selected ? 'rgba(255,215,0,0.18)' : 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.roundRect(cardX, cy, cardW, cardH, 12); ctx.fill();
    if (selected) { ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(cardX, cy, cardW, cardH, 12); ctx.stroke(); }
    ctx.restore();

    // アイコン + 名前
    const _cTY = _M === 2 ? 42 : 26, _cDY = _M === 2 ? 88 : 50;
    ctx.textAlign = 'left'; ctx.fillStyle = '#fff'; ctx.font = "bold " + (20*_M) + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(def.icon + ' ' + def.name, cardX + 14, cy + _cTY);
    // 説明
    ctx.fillStyle = '#bbb'; ctx.font = (15*_M) + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(def.desc, cardX + 14, cy + _cDY);

    // Lv バー（右側）
    const _bBarW = _M === 2 ? 200 : 130, _bBarH = _M === 2 ? 18 : 12;
    const barX = cardX + cardW - (_M === 2 ? 280 : 200), barY = cy + (_M === 2 ? 18 : 14), barW = _bBarW, barH2 = _bBarH;
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH2, 6); ctx.fill();
    if (lv > 0) {
      const barFill = ctx.createLinearGradient(barX, 0, barX + barW, 0);
      barFill.addColorStop(0, '#ffd700'); barFill.addColorStop(1, '#ff9800');
      ctx.fillStyle = barFill;
      ctx.beginPath(); ctx.roundRect(barX, barY, barW * (lv / def.max), barH2, 6); ctx.fill();
    }
    ctx.textAlign = 'right'; ctx.fillStyle = lv >= def.max ? '#ffd700' : '#ccc'; ctx.font = "bold " + (17*_M) + "px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(lv >= def.max ? 'MAX' : 'Lv.' + lv + '/' + def.max, cardX + cardW - 14, cy + _cTY);

    // コスト
    if (cost > 0) {
      ctx.fillStyle = nectar >= cost ? '#86efac' : '#fca5a5'; ctx.font = (15*_M) + "px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('🍯 ' + cost, cardX + cardW - 14, cy + _cDY);
    } else {
      ctx.fillStyle = '#ffd700'; ctx.font = (15*_M) + "px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('✅ 完了', cardX + cardW - 14, cy + _cDY);
    }
  }

  // スクロールインジケーター
  if (scrollStart > 0) { ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,215,0,0.6)'; ctx.font = (16*_M) + "px sans-serif"; ctx.fillText('▲', cardX + cardW / 2, listTop - 6); }
  if (scrollStart + maxVisible < visibleDefs.length) { ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,215,0,0.6)'; ctx.font = (16*_M) + "px sans-serif"; ctx.fillText('▼', cardX + cardW / 2, listBot + 4); }

  // フッター操作ヒント
  ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = (17*_M) + "px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? '◀ で タイトルへ　　タップで購入' : '↑↓ 選択　Z 購入　X/ESC 戻る', CW / 2, CH - 12 - 4*(_M-1));
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

  // === Start prompt ===
  if (typeof touchActive !== 'undefined' && touchActive) {
    // モバイル: スタート／花壇ボタンを描画
    var _btnY=470, _btnH=72, _gap=24, _bwS=330, _bwG=220;
    var _bxS=CW/2 - (_bwS+_gap+_bwG)/2, _bxG=_bxS+_bwS+_gap, _rr=36;
    // スタートボタン（黄）
    ctx.fillStyle='#ffcc00';
    ctx.beginPath(); ctx.moveTo(_bxS+_rr,_btnY); ctx.lineTo(_bxS+_bwS-_rr,_btnY);
    ctx.quadraticCurveTo(_bxS+_bwS,_btnY,_bxS+_bwS,_btnY+_rr); ctx.lineTo(_bxS+_bwS,_btnY+_btnH-_rr);
    ctx.quadraticCurveTo(_bxS+_bwS,_btnY+_btnH,_bxS+_bwS-_rr,_btnY+_btnH); ctx.lineTo(_bxS+_rr,_btnY+_btnH);
    ctx.quadraticCurveTo(_bxS,_btnY+_btnH,_bxS,_btnY+_btnH-_rr); ctx.lineTo(_bxS,_btnY+_rr);
    ctx.quadraticCurveTo(_bxS,_btnY,_bxS+_rr,_btnY); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#1a1a2e'; ctx.font="bold 30px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('🌟 スタート', _bxS+_bwS/2, _btnY+46);
    // 花壇ボタン（緑）
    ctx.fillStyle='#4caf50';
    ctx.beginPath(); ctx.moveTo(_bxG+_rr,_btnY); ctx.lineTo(_bxG+_bwG-_rr,_btnY);
    ctx.quadraticCurveTo(_bxG+_bwG,_btnY,_bxG+_bwG,_btnY+_rr); ctx.lineTo(_bxG+_bwG,_btnY+_btnH-_rr);
    ctx.quadraticCurveTo(_bxG+_bwG,_btnY+_btnH,_bxG+_bwG-_rr,_btnY+_btnH); ctx.lineTo(_bxG+_rr,_btnY+_btnH);
    ctx.quadraticCurveTo(_bxG,_btnY+_btnH,_bxG,_btnY+_btnH-_rr); ctx.lineTo(_bxG,_btnY+_rr);
    ctx.quadraticCurveTo(_bxG,_btnY,_bxG+_rr,_btnY); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font="bold 28px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('🌸 花壇', _bxG+_bwG/2, _btnY+46);
  } else {
    if (Math.sin(titleBlink * 3) > -0.3) {
      ctx.fillStyle = '#ffcc00';
      ctx.font = "bold 34px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('Zキーでスタート', CW/2, 500);
    }
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
  ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? '🌸 ネクター: ' + nectar : '🌸 ネクター: ' + nectar + '　　　Xキーで花壇メニュー', CW/2, panelY + 80);

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

