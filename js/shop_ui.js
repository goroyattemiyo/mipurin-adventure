// ===== SHOP UI MODULE =====
// Ten-chan's shop - face-to-face counter layout

var shopLine = '';
var shopLineTimer = 0;

var SHOP_LINES = {
  enter: [
    'いらっしゃい、おきゃくちゃん！',
    'テンちゃんのお店へようこそ！',
    'きょうもいいものあるよ～！',
    'わぁ、ミプリンちゃんだ！'
  ],
  buy: [
    'まいど！ いいかいものだね！',
    'えへへ、ありがとう！',
    'それ、おすすめだよ！',
    'きっと役に立つよ！'
  ],
  poor: [
    'うーん、ちょっと足りないかな…',
    'もうすこし花粉をあつめてきてね！',
    'ごめんね、おまけはできないの…'
  ],
  exit: [
    'またきてね～！',
    'きをつけていってらっしゃい！',
    'つぎも待ってるよ！'
  ]
};

function pickShopLine(category) {
  var lines = SHOP_LINES[category] || SHOP_LINES.enter;
  shopLine = lines[Math.floor(Math.random() * lines.length)];
  shopLineTimer = 3.0;
}

function drawShop() {
  if (gameState !== 'shop') return;
  var F = "'M PLUS Rounded 1c', sans-serif";

  // === Full background (warm wood tone) ===
  ctx.fillStyle = '#1a1210';
  ctx.fillRect(0, 0, CW, CH);
  ctx.fillStyle = 'rgba(80,50,30,0.25)';
  ctx.fillRect(0, 0, CW, CH);
  var grd = ctx.createLinearGradient(0, 0, 0, CH * 0.55);
  grd.addColorStop(0, 'rgba(60,35,20,0.9)');
  grd.addColorStop(1, 'rgba(30,18,10,0.95)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, CW, CH * 0.55);

  // === Shop title ===
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 26px ' + F;
  ctx.textAlign = 'center';
  ctx.fillText('\u2606 \u30C6\u30F3\u3061\u3083\u3093\u306E\u304A\u307F\u305B \u2606', CW / 2, 34);

  // === Ten-chan bust-up (left, large) ===
  var tenX = 30, tenY = 45, tenW = 260, tenH = 400;
  if (shopkeeperReady) {
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(tenX + tenW / 2, tenY + tenH / 2, tenW * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.drawImage(shopkeeperImg, tenX, tenY, tenW, tenH);
  }

  // === Speech bubble (right of Ten-chan) ===
  var bubX = tenX + tenW + 16, bubY = 55, bubW = CW - bubX - 50, bubH = 80;
  ctx.fillStyle = 'rgba(255,255,245,0.95)';
  var br = 16;
  ctx.beginPath();
  ctx.moveTo(bubX + br, bubY);
  ctx.lineTo(bubX + bubW - br, bubY);
  ctx.quadraticCurveTo(bubX + bubW, bubY, bubX + bubW, bubY + br);
  ctx.lineTo(bubX + bubW, bubY + bubH - br);
  ctx.quadraticCurveTo(bubX + bubW, bubY + bubH, bubX + bubW - br, bubY + bubH);
  ctx.lineTo(bubX + br, bubY + bubH);
  ctx.quadraticCurveTo(bubX, bubY + bubH, bubX, bubY + bubH - br);
  ctx.lineTo(bubX, bubY + br);
  ctx.quadraticCurveTo(bubX, bubY, bubX + br, bubY);
  ctx.closePath();
  ctx.fill();
  // Tail
  ctx.beginPath();
  ctx.moveTo(bubX, bubY + 22);
  ctx.lineTo(bubX - 20, bubY + 35);
  ctx.lineTo(bubX, bubY + 48);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,160,100,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Speech text
  ctx.fillStyle = '#4a3520';
  ctx.font = 'bold 22px ' + F;
  ctx.textAlign = 'left';
  var displayLine = shopLine || SHOP_LINES.enter[0];
  ctx.fillText(displayLine, bubX + 20, bubY + 35);
  ctx.fillStyle = '#c0392b';
  ctx.font = 'bold 15px ' + F;
  ctx.fillText('\u30C6\u30F3\u3061\u3083\u3093', bubX + 20, bubY + 62);

  // === Pollen balance ===
  var balX = bubX, balY = bubY + bubH + 14;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fillRect(balX, balY, 210, 36);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 20px ' + F;
  ctx.textAlign = 'center';
  ctx.fillText('\uD83D\uDC9B \u82B1\u7C89: ' + pollen, balX + 105, balY + 25);

  // === Showcase divider ===
  var divY = CH * 0.48;
  ctx.strokeStyle = 'rgba(255,215,0,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(30, divY); ctx.lineTo(CW - 30, divY); ctx.stroke();
  ctx.fillStyle = 'rgba(255,215,0,0.5)';
  ctx.font = '13px ' + F;
  ctx.textAlign = 'center';
  ctx.fillText('\u2500\u2500 \u30B7\u30E7\u30FC\u30B1\u30FC\u30B9 \u2500\u2500', CW / 2, divY - 6);

  // === Product cards ===
  var cardW = 160, cardH = 200, padX = 14;
  var totalW = shopItems.length * cardW + (shopItems.length - 1) * padX;
  if (totalW > CW - 60) { cardW = Math.floor((CW - 60 - (shopItems.length - 1) * padX) / shopItems.length); totalW = shopItems.length * cardW + (shopItems.length - 1) * padX; }
  var startX = CW / 2 - totalW / 2;
  var startY = divY + 14;
  ctx.fillStyle = 'rgba(20,12,8,0.5)';
  ctx.fillRect(25, divY + 2, CW - 50, CH - divY - 44);

  for (var i = 0; i < shopItems.length; i++) {
    var s = shopItems[i];
    var sel = selectCursor === i;
    var sx = startX + i * (cardW + padX);
    var sy = startY;
    var canBuy = pollen >= s.cost;
    ctx.fillStyle = sel ? (canBuy ? 'rgba(80,60,120,0.92)' : 'rgba(100,40,40,0.92)') : (canBuy ? 'rgba(40,30,55,0.8)' : 'rgba(55,30,30,0.7)');
    var cr = 12;
    ctx.beginPath();
    ctx.moveTo(sx + cr, sy); ctx.lineTo(sx + cardW - cr, sy);
    ctx.quadraticCurveTo(sx + cardW, sy, sx + cardW, sy + cr);
    ctx.lineTo(sx + cardW, sy + cardH - cr);
    ctx.quadraticCurveTo(sx + cardW, sy + cardH, sx + cardW - cr, sy + cardH);
    ctx.lineTo(sx + cr, sy + cardH);
    ctx.quadraticCurveTo(sx, sy + cardH, sx, sy + cardH - cr);
    ctx.lineTo(sx, sy + cr);
    ctx.quadraticCurveTo(sx, sy, sx + cr, sy);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = sel ? '#ffd700' : (canBuy ? 'rgba(255,215,0,0.25)' : '#444');
    ctx.lineWidth = sel ? 3 : 1; ctx.stroke();
    if (sel) { ctx.save(); ctx.globalAlpha = 0.06 + Math.sin(Date.now() / 300) * 0.04; ctx.fillStyle = '#ffd700'; ctx.fill(); ctx.restore(); }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.font = '44px ' + F;
    ctx.fillText(s.icon, sx + cardW / 2, sy + 55);
    ctx.fillStyle = canBuy ? '#fff' : '#777'; ctx.font = 'bold 16px ' + F;
    var nm = s.name.length > 8 ? s.name.slice(0, 8) + '..' : s.name;
    ctx.fillText(nm, sx + cardW / 2, sy + 85);
    ctx.fillStyle = canBuy ? 'rgba(255,215,0,0.2)' : 'rgba(255,50,50,0.2)';
    ctx.fillRect(sx + 20, sy + 95, cardW - 40, 28);
    ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = 'bold 18px ' + F;
    ctx.fillText(s.cost + ' \u82B1\u7C89', sx + cardW / 2, sy + 115);
    if (sel && s.desc) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '13px ' + F; var desc = s.desc.length > 14 ? s.desc.slice(0, 14) + '..' : s.desc; ctx.fillText(desc, sx + cardW / 2, sy + 142); }
    if (sel) { ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = 'bold 16px ' + F; ctx.fillText(canBuy ? '\u25B6 Z\u3067\u304B\u3046 \u25C0' : '\u2716 \u82B1\u7C89\u4E0D\u8DB3', sx + cardW / 2, sy + 175); }
    else { ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '13px ' + F; ctx.fillText('\u25C0\u25B6\u3067\u3048\u3089\u3076', sx + cardW / 2, sy + 178); }
  }

  // Skip
  var skipSel = selectCursor >= shopItems.length;
  var rows = 1;
  var skipY = startY + cardH + 20;
  ctx.fillStyle = skipSel ? '#ffd700' : 'rgba(255,255,255,0.35)';
  ctx.font = (skipSel ? 'bold 20px ' : '18px ') + F;
  ctx.textAlign = 'center';
  ctx.fillText(skipSel ? '\u25B6 \u3064\u304E\u3078\u3059\u3059\u3080 (Z) \u25C0' : 'X\u30AD\u30FC / Esc\u3067\u3064\u304E\u3078', CW / 2, skipY);

  // Bottom hint
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px ' + F;
  if (typeof touchActive !== 'undefined' && touchActive) {
    ctx.fillText('\u30BF\u30C3\u30D7: \u3048\u3089\u3076  \u30C0\u30D6\u30EB\u30BF\u30C3\u30D7: \u304B\u3046', CW / 2, CH - 14);
  } else {
    ctx.fillText('\u2190\u2192: \u3048\u3089\u3076  Z: \u304B\u3046  X/Esc: \u3064\u304E\u3078', CW / 2, CH - 14);
  }
  ctx.textAlign = 'left';
}
