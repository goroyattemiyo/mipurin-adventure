import re

# === 1. Create js/shop_ui.js (new file) ===
shop_ui = """// ===== SHOP UI MODULE =====
// Separated from ui.js for file size management
// Draws the ladybug shopkeeper "Ten-chan" shop screen

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
    'まいど！ いい買い物だね！',
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

  // Background overlay
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, CW, CH);

  var F = "'M PLUS Rounded 1c', sans-serif";

  // Shop title
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 30px ' + F;
  ctx.textAlign = 'center';
  ctx.fillText('\\uD83C\\uDF38 \\u30C6\\u30F3\\u3061\\u3083\\u3093\\u306E\\u304A\\u307F\\u305B \\uD83C\\uDF38', CW / 2, 48);

  // Shopkeeper portrait (left side)
  if (shopkeeperReady) {
    ctx.drawImage(shopkeeperImg, 30, 60, 90, 140);
  }

  // Speech bubble
  var bubX = 130, bubY = 70, bubW = 340, bubH = 50;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath();
  var br = 12;
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
  // Bubble tail
  ctx.beginPath();
  ctx.moveTo(bubX + 10, bubY + bubH);
  ctx.lineTo(bubX - 10, bubY + bubH + 15);
  ctx.lineTo(bubX + 30, bubY + bubH);
  ctx.closePath();
  ctx.fill();

  // Bubble text
  ctx.fillStyle = '#333';
  ctx.font = 'bold 18px ' + F;
  ctx.textAlign = 'left';
  var displayLine = shopLine || SHOP_LINES.enter[0];
  ctx.fillText(displayLine, bubX + 16, bubY + 32);

  // Pollen balance
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 22px ' + F;
  ctx.textAlign = 'center';
  ctx.fillText('\\uD83D\\uDC9B \\u82B1\\u7C89: ' + pollen, CW / 2, 148);

  // Product cards
  var cols = Math.min(shopItems.length, 3);
  var rows = Math.ceil(shopItems.length / cols);
  var cardW = 220, cardH = 180, padX = 20, padY = 16;
  var totalW = cols * cardW + (cols - 1) * padX;
  var startX = CW / 2 - totalW / 2;
  var startY = 168;

  for (var i = 0; i < shopItems.length; i++) {
    var s = shopItems[i];
    var sel = selectCursor === i;
    var row = Math.floor(i / cols), col = i % cols;
    var sx = startX + col * (cardW + padX);
    var sy = startY + row * (cardH + padY);
    var canBuy = pollen >= s.cost;

    // Card background
    ctx.fillStyle = sel
      ? (canBuy ? 'rgba(60,50,100,0.95)' : 'rgba(80,40,40,0.95)')
      : (canBuy ? 'rgba(30,25,50,0.85)' : 'rgba(50,25,25,0.75)');
    // Rounded rect
    var cr = 10;
    ctx.beginPath();
    ctx.moveTo(sx + cr, sy);
    ctx.lineTo(sx + cardW - cr, sy);
    ctx.quadraticCurveTo(sx + cardW, sy, sx + cardW, sy + cr);
    ctx.lineTo(sx + cardW, sy + cardH - cr);
    ctx.quadraticCurveTo(sx + cardW, sy + cardH, sx + cardW - cr, sy + cardH);
    ctx.lineTo(sx + cr, sy + cardH);
    ctx.quadraticCurveTo(sx, sy + cardH, sx, sy + cardH - cr);
    ctx.lineTo(sx, sy + cr);
    ctx.quadraticCurveTo(sx, sy, sx + cr, sy);
    ctx.closePath();
    ctx.fill();

    // Card border
    ctx.strokeStyle = sel ? '#ffd700' : (canBuy ? 'rgba(255,215,0,0.3)' : '#555');
    ctx.lineWidth = sel ? 3 : 1;
    ctx.stroke();

    // Selected glow
    if (sel) {
      ctx.fillStyle = 'rgba(255,215,0,0.08)';
      ctx.fill();
    }

    ctx.textAlign = 'center';

    // Icon
    ctx.fillStyle = '#fff';
    ctx.font = '42px ' + F;
    ctx.fillText(s.icon, sx + cardW / 2, sy + 48);

    // Name
    ctx.fillStyle = canBuy ? '#fff' : '#888';
    ctx.font = 'bold 17px ' + F;
    var nm = s.name.length > 10 ? s.name.slice(0, 10) + '..' : s.name;
    ctx.fillText(nm, sx + cardW / 2, sy + 78);

    // Cost
    ctx.fillStyle = canBuy ? '#ffd700' : '#f66';
    ctx.font = 'bold 20px ' + F;
    ctx.fillText(s.cost + ' \\u82B1\\u7C89', sx + cardW / 2, sy + 108);

    // Description (on select)
    if (sel && s.desc) {
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '14px ' + F;
      var desc = s.desc.length > 20 ? s.desc.slice(0, 20) + '..' : s.desc;
      ctx.fillText(desc, sx + cardW / 2, sy + 130);
    }

    // Action hint
    if (sel) {
      ctx.fillStyle = canBuy ? '#ffd700' : '#f66';
      ctx.font = 'bold 18px ' + F;
      ctx.fillText(canBuy ? '\\u25B6 Z\\u3067\\u304B\\u3046 \\u25C0' : '\\u2716 \\u82B1\\u7C89\\u4E0D\\u8DB3', sx + cardW / 2, sy + 160);
    }
  }

  // Skip button
  var skipY = startY + rows * (cardH + padY) + 16;
  var skipSel = selectCursor >= shopItems.length;
  ctx.fillStyle = skipSel ? '#ffd700' : 'rgba(255,255,255,0.4)';
  ctx.font = (skipSel ? 'bold 20px ' : '20px ') + F;
  ctx.textAlign = 'center';
  ctx.fillText(skipSel ? '\\u25B6 \\u3064\\u304E\\u3078\\u3059\\u3059\\u3080 (Z) \\u25C0' : 'X\\u30AD\\u30FC / Esc\\u3067\\u3064\\u304E\\u3078', CW / 2, skipY);

  // Bottom hint
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '15px ' + F;
  if (typeof touchActive !== 'undefined' && touchActive) {
    ctx.fillText('\\u30BF\\u30C3\\u30D7: \\u3048\\u3089\\u3076  \\u30C0\\u30D6\\u30EB\\u30BF\\u30C3\\u30D7: \\u304B\\u3046', CW / 2, CH - 20);
  } else {
    ctx.fillText('\\u2190\\u2192: \\u3048\\u3089\\u3076  Z: \\u304B\\u3046  X/Esc: \\u3064\\u304E\\u3078', CW / 2, CH - 20);
  }

  ctx.textAlign = 'left';
}
"""

with open('js/shop_ui.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(shop_ui)
print('[OK] js/shop_ui.js created')


# === 2. Remove drawShop from ui.js ===
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui = f.read()

# Find and remove drawShop function
start_marker = 'function drawShop() {'
end_marker = '\nfunction drawDmgNumbers()'

idx_start = ui.find(start_marker)
idx_end = ui.find(end_marker)

if idx_start >= 0 and idx_end >= 0:
    ui = ui[:idx_start] + '// drawShop moved to shop_ui.js\n' + ui[idx_end:]
    with open('js/ui.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(ui)
    print('[OK] js/ui.js - drawShop removed')
else:
    print('[WARN] Could not find drawShop boundaries in ui.js')
    print('  start:', idx_start, 'end:', idx_end)


# === 3. Update index.html - add shop_ui.js and bump cache ===
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add shop_ui.js after ui.js line
if 'shop_ui.js' not in html:
    html = html.replace(
        "js/ui.js?v=1631",
        "js/ui.js?v=1632"
    ).replace(
        "<script src='js/ui.js?v=1632'></script>",
        "<script src='js/ui.js?v=1632'></script>\n<script src='js/shop_ui.js?v=1632'></script>"
    )
    # Bump all other v=1631 to v=1632
    html = html.replace('?v=1631', '?v=1632')
    with open('index.html', 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    print('[OK] index.html - shop_ui.js added, cache bust v=1632')
else:
    print('[SKIP] shop_ui.js already in index.html')


# === 4. Update game.js VERSION ===
with open('js/game.js', 'r', encoding='utf-8') as f:
    gjs = f.read()

gjs = gjs.replace("const VERSION = 'v6.25'", "const VERSION = 'v6.26'")
with open('js/game.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(gjs)
print('[OK] js/game.js - VERSION v6.26')


# === 5. Patch update.js - add pickShopLine on shop enter ===
with open('js/update.js', 'r', encoding='utf-8') as f:
    upd = f.read()

# Find where gameState is set to 'shop' and add pickShopLine call
if 'pickShopLine' not in upd:
    upd = upd.replace(
        "gameState = 'shop'",
        "gameState = 'shop'; if (typeof pickShopLine === 'function') pickShopLine('enter')"
    )
    # Add pickShopLine('buy') after successful purchase
    upd = upd.replace(
        'Audio.buy()',
        "Audio.buy(); if (typeof pickShopLine === 'function') pickShopLine('buy')"
    )
    with open('js/update.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(upd)
    print('[OK] js/update.js - pickShopLine hooks added')
else:
    print('[SKIP] update.js already has pickShopLine')


# === Summary ===
import os
sizes = {}
for fn in ['js/ui.js', 'js/shop_ui.js', 'js/update.js', 'js/game.js']:
    sizes[fn] = round(os.path.getsize(fn) / 1024, 1)

print()
print('=== SHOP UI MIGRATION COMPLETE ===')
for fn, sz in sizes.items():
    flag = ' WARN' if sz > 28 else ' OK'
    print(f'  {fn}: {sz}KB{flag}')
print('  index.html: cache bust v=1632, shop_ui.js added')
print()
print('Next: node -c js/shop_ui.js && node -c js/ui.js && python test_game.py')
