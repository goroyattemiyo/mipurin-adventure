import os

# === 1. Rewrite js/shop_ui.js - bust-up counter layout ===
shop_code = ""
shop_code += "// ===== SHOP UI MODULE =====\n"
shop_code += "// Ten-chan's shop - face-to-face counter layout\n\n"
shop_code += "var shopLine = '';\n"
shop_code += "var shopLineTimer = 0;\n\n"
shop_code += "var SHOP_LINES = {\n"
shop_code += "  enter: [\n"
shop_code += "    '\u3044\u3089\u3063\u3057\u3083\u3044\u3001\u304A\u304D\u3083\u304F\u3061\u3083\u3093\uFF01',\n"
shop_code += "    '\u30C6\u30F3\u3061\u3083\u3093\u306E\u304A\u5E97\u3078\u3088\u3046\u3053\u305D\uFF01',\n"
shop_code += "    '\u304D\u3087\u3046\u3082\u3044\u3044\u3082\u306E\u3042\u308B\u3088\uff5e\uFF01',\n"
shop_code += "    '\u308F\u3041\u3001\u30DF\u30D7\u30EA\u30F3\u3061\u3083\u3093\u3060\uFF01'\n"
shop_code += "  ],\n"
shop_code += "  buy: [\n"
shop_code += "    '\u307E\u3044\u3069\uFF01 \u3044\u3044\u304B\u3044\u3082\u306E\u3060\u306D\uFF01',\n"
shop_code += "    '\u3048\u3078\u3078\u3001\u3042\u308A\u304C\u3068\u3046\uFF01',\n"
shop_code += "    '\u305D\u308C\u3001\u304A\u3059\u3059\u3081\u3060\u3088\uFF01',\n"
shop_code += "    '\u304D\u3063\u3068\u5F79\u306B\u7ACB\u3064\u3088\uFF01'\n"
shop_code += "  ],\n"
shop_code += "  poor: [\n"
shop_code += "    '\u3046\u30FC\u3093\u3001\u3061\u3087\u3063\u3068\u8DB3\u308A\u306A\u3044\u304B\u306A\u2026',\n"
shop_code += "    '\u3082\u3046\u3059\u3053\u3057\u82B1\u7C89\u3092\u3042\u3064\u3081\u3066\u304D\u3066\u306D\uFF01',\n"
shop_code += "    '\u3054\u3081\u3093\u306D\u3001\u304A\u307E\u3051\u306F\u3067\u304D\u306A\u3044\u306E\u2026'\n"
shop_code += "  ],\n"
shop_code += "  exit: [\n"
shop_code += "    '\u307E\u305F\u304D\u3066\u306D\uff5e\uFF01',\n"
shop_code += "    '\u304D\u3092\u3064\u3051\u3066\u3044\u3063\u3066\u3089\u3063\u3057\u3083\u3044\uFF01',\n"
shop_code += "    '\u3064\u304E\u3082\u5F85\u3063\u3066\u308B\u3088\uFF01'\n"
shop_code += "  ]\n"
shop_code += "};\n\n"
shop_code += "function pickShopLine(category) {\n"
shop_code += "  var lines = SHOP_LINES[category] || SHOP_LINES.enter;\n"
shop_code += "  shopLine = lines[Math.floor(Math.random() * lines.length)];\n"
shop_code += "  shopLineTimer = 3.0;\n"
shop_code += "}\n\n"
shop_code += "function drawShop() {\n"
shop_code += "  if (gameState !== 'shop') return;\n"
shop_code += "  var F = \"'M PLUS Rounded 1c', sans-serif\";\n\n"
shop_code += "  // === Full background (warm wood tone) ===\n"
shop_code += "  ctx.fillStyle = '#1a1210';\n"
shop_code += "  ctx.fillRect(0, 0, CW, CH);\n"
shop_code += "  ctx.fillStyle = 'rgba(80,50,30,0.25)';\n"
shop_code += "  ctx.fillRect(0, 0, CW, CH);\n"
shop_code += "  var grd = ctx.createLinearGradient(0, 0, 0, CH * 0.55);\n"
shop_code += "  grd.addColorStop(0, 'rgba(60,35,20,0.9)');\n"
shop_code += "  grd.addColorStop(1, 'rgba(30,18,10,0.95)');\n"
shop_code += "  ctx.fillStyle = grd;\n"
shop_code += "  ctx.fillRect(0, 0, CW, CH * 0.55);\n\n"
shop_code += "  // === Shop title ===\n"
shop_code += "  ctx.fillStyle = '#ffd700';\n"
shop_code += "  ctx.font = 'bold 26px ' + F;\n"
shop_code += "  ctx.textAlign = 'center';\n"
shop_code += "  ctx.fillText('\\u2606 \\u30C6\\u30F3\\u3061\\u3083\\u3093\\u306E\\u304A\\u307F\\u305B \\u2606', CW / 2, 34);\n\n"
shop_code += "  // === Ten-chan bust-up (left, large) ===\n"
shop_code += "  var tenX = 30, tenY = 45, tenW = 260, tenH = 400;\n"
shop_code += "  if (shopkeeperReady) {\n"
shop_code += "    ctx.save();\n"
shop_code += "    ctx.globalAlpha = 0.12;\n"
shop_code += "    ctx.fillStyle = '#ffd700';\n"
shop_code += "    ctx.beginPath();\n"
shop_code += "    ctx.arc(tenX + tenW / 2, tenY + tenH / 2, tenW * 0.55, 0, Math.PI * 2);\n"
shop_code += "    ctx.fill();\n"
shop_code += "    ctx.restore();\n"
shop_code += "    ctx.drawImage(shopkeeperImg, tenX, tenY, tenW, tenH);\n"
shop_code += "  }\n\n"
shop_code += "  // === Speech bubble (right of Ten-chan) ===\n"
shop_code += "  var bubX = tenX + tenW + 16, bubY = 55, bubW = CW - bubX - 50, bubH = 80;\n"
shop_code += "  ctx.fillStyle = 'rgba(255,255,245,0.95)';\n"
shop_code += "  var br = 16;\n"
shop_code += "  ctx.beginPath();\n"
shop_code += "  ctx.moveTo(bubX + br, bubY);\n"
shop_code += "  ctx.lineTo(bubX + bubW - br, bubY);\n"
shop_code += "  ctx.quadraticCurveTo(bubX + bubW, bubY, bubX + bubW, bubY + br);\n"
shop_code += "  ctx.lineTo(bubX + bubW, bubY + bubH - br);\n"
shop_code += "  ctx.quadraticCurveTo(bubX + bubW, bubY + bubH, bubX + bubW - br, bubY + bubH);\n"
shop_code += "  ctx.lineTo(bubX + br, bubY + bubH);\n"
shop_code += "  ctx.quadraticCurveTo(bubX, bubY + bubH, bubX, bubY + bubH - br);\n"
shop_code += "  ctx.lineTo(bubX, bubY + br);\n"
shop_code += "  ctx.quadraticCurveTo(bubX, bubY, bubX + br, bubY);\n"
shop_code += "  ctx.closePath();\n"
shop_code += "  ctx.fill();\n"
shop_code += "  // Tail\n"
shop_code += "  ctx.beginPath();\n"
shop_code += "  ctx.moveTo(bubX, bubY + 22);\n"
shop_code += "  ctx.lineTo(bubX - 20, bubY + 35);\n"
shop_code += "  ctx.lineTo(bubX, bubY + 48);\n"
shop_code += "  ctx.closePath();\n"
shop_code += "  ctx.fill();\n"
shop_code += "  ctx.strokeStyle = 'rgba(200,160,100,0.4)';\n"
shop_code += "  ctx.lineWidth = 2;\n"
shop_code += "  ctx.stroke();\n\n"
shop_code += "  // Speech text\n"
shop_code += "  ctx.fillStyle = '#4a3520';\n"
shop_code += "  ctx.font = 'bold 22px ' + F;\n"
shop_code += "  ctx.textAlign = 'left';\n"
shop_code += "  var displayLine = shopLine || SHOP_LINES.enter[0];\n"
shop_code += "  ctx.fillText(displayLine, bubX + 20, bubY + 35);\n"
shop_code += "  ctx.fillStyle = '#c0392b';\n"
shop_code += "  ctx.font = 'bold 15px ' + F;\n"
shop_code += "  ctx.fillText('\\u30C6\\u30F3\\u3061\\u3083\\u3093', bubX + 20, bubY + 62);\n\n"
shop_code += "  // === Pollen balance ===\n"
shop_code += "  var balX = bubX, balY = bubY + bubH + 14;\n"
shop_code += "  ctx.fillStyle = 'rgba(0,0,0,0.4)';\n"
shop_code += "  ctx.fillRect(balX, balY, 210, 36);\n"
shop_code += "  ctx.fillStyle = '#ffd700';\n"
shop_code += "  ctx.font = 'bold 20px ' + F;\n"
shop_code += "  ctx.textAlign = 'center';\n"
shop_code += "  ctx.fillText('\\uD83D\\uDC9B \\u82B1\\u7C89: ' + pollen, balX + 105, balY + 25);\n\n"
shop_code += "  // === Showcase divider ===\n"
shop_code += "  var divY = CH * 0.48;\n"
shop_code += "  ctx.strokeStyle = 'rgba(255,215,0,0.3)';\n"
shop_code += "  ctx.lineWidth = 2;\n"
shop_code += "  ctx.beginPath(); ctx.moveTo(30, divY); ctx.lineTo(CW - 30, divY); ctx.stroke();\n"
shop_code += "  ctx.fillStyle = 'rgba(255,215,0,0.5)';\n"
shop_code += "  ctx.font = '13px ' + F;\n"
shop_code += "  ctx.textAlign = 'center';\n"
shop_code += "  ctx.fillText('\\u2500\\u2500 \\u30B7\\u30E7\\u30FC\\u30B1\\u30FC\\u30B9 \\u2500\\u2500', CW / 2, divY - 6);\n\n"
shop_code += "  // === Product cards ===\n"
shop_code += "  var cardW = 160, cardH = 200, padX = 14;\n"
shop_code += "  var totalW = shopItems.length * cardW + (shopItems.length - 1) * padX;\n"
shop_code += "  if (totalW > CW - 60) { cardW = Math.floor((CW - 60 - (shopItems.length - 1) * padX) / shopItems.length); totalW = shopItems.length * cardW + (shopItems.length - 1) * padX; }\n"
shop_code += "  var startX = CW / 2 - totalW / 2;\n"
shop_code += "  var startY = divY + 14;\n"
shop_code += "  ctx.fillStyle = 'rgba(20,12,8,0.5)';\n"
shop_code += "  ctx.fillRect(25, divY + 2, CW - 50, CH - divY - 44);\n\n"
shop_code += "  for (var i = 0; i < shopItems.length; i++) {\n"
shop_code += "    var s = shopItems[i];\n"
shop_code += "    var sel = selectCursor === i;\n"
shop_code += "    var sx = startX + i * (cardW + padX);\n"
shop_code += "    var sy = startY;\n"
shop_code += "    var canBuy = pollen >= s.cost;\n"
shop_code += "    ctx.fillStyle = sel ? (canBuy ? 'rgba(80,60,120,0.92)' : 'rgba(100,40,40,0.92)') : (canBuy ? 'rgba(40,30,55,0.8)' : 'rgba(55,30,30,0.7)');\n"
shop_code += "    var cr = 12;\n"
shop_code += "    ctx.beginPath();\n"
shop_code += "    ctx.moveTo(sx + cr, sy); ctx.lineTo(sx + cardW - cr, sy);\n"
shop_code += "    ctx.quadraticCurveTo(sx + cardW, sy, sx + cardW, sy + cr);\n"
shop_code += "    ctx.lineTo(sx + cardW, sy + cardH - cr);\n"
shop_code += "    ctx.quadraticCurveTo(sx + cardW, sy + cardH, sx + cardW - cr, sy + cardH);\n"
shop_code += "    ctx.lineTo(sx + cr, sy + cardH);\n"
shop_code += "    ctx.quadraticCurveTo(sx, sy + cardH, sx, sy + cardH - cr);\n"
shop_code += "    ctx.lineTo(sx, sy + cr);\n"
shop_code += "    ctx.quadraticCurveTo(sx, sy, sx + cr, sy);\n"
shop_code += "    ctx.closePath(); ctx.fill();\n"
shop_code += "    ctx.strokeStyle = sel ? '#ffd700' : (canBuy ? 'rgba(255,215,0,0.25)' : '#444');\n"
shop_code += "    ctx.lineWidth = sel ? 3 : 1; ctx.stroke();\n"
shop_code += "    if (sel) { ctx.save(); ctx.globalAlpha = 0.06 + Math.sin(Date.now() / 300) * 0.04; ctx.fillStyle = '#ffd700'; ctx.fill(); ctx.restore(); }\n"
shop_code += "    ctx.textAlign = 'center';\n"
shop_code += "    ctx.fillStyle = '#fff'; ctx.font = '44px ' + F;\n"
shop_code += "    ctx.fillText(s.icon, sx + cardW / 2, sy + 55);\n"
shop_code += "    ctx.fillStyle = canBuy ? '#fff' : '#777'; ctx.font = 'bold 16px ' + F;\n"
shop_code += "    var nm = s.name.length > 8 ? s.name.slice(0, 8) + '..' : s.name;\n"
shop_code += "    ctx.fillText(nm, sx + cardW / 2, sy + 85);\n"
shop_code += "    ctx.fillStyle = canBuy ? 'rgba(255,215,0,0.2)' : 'rgba(255,50,50,0.2)';\n"
shop_code += "    ctx.fillRect(sx + 20, sy + 95, cardW - 40, 28);\n"
shop_code += "    ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = 'bold 18px ' + F;\n"
shop_code += "    ctx.fillText(s.cost + ' \\u82B1\\u7C89', sx + cardW / 2, sy + 115);\n"
shop_code += "    if (sel && s.desc) { ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = '13px ' + F; var desc = s.desc.length > 14 ? s.desc.slice(0, 14) + '..' : s.desc; ctx.fillText(desc, sx + cardW / 2, sy + 142); }\n"
shop_code += "    if (sel) { ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = 'bold 16px ' + F; ctx.fillText(canBuy ? '\\u25B6 Z\\u3067\\u304B\\u3046 \\u25C0' : '\\u2716 \\u82B1\\u7C89\\u4E0D\\u8DB3', sx + cardW / 2, sy + 175); }\n"
shop_code += "    else { ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '13px ' + F; ctx.fillText('\\u25C0\\u25B6\\u3067\\u3048\\u3089\\u3076', sx + cardW / 2, sy + 178); }\n"
shop_code += "  }\n\n"
shop_code += "  // Skip\n"
shop_code += "  var skipSel = selectCursor >= shopItems.length;\n"
shop_code += "  var rows = 1;\n"
shop_code += "  var skipY = startY + cardH + 20;\n"
shop_code += "  ctx.fillStyle = skipSel ? '#ffd700' : 'rgba(255,255,255,0.35)';\n"
shop_code += "  ctx.font = (skipSel ? 'bold 20px ' : '18px ') + F;\n"
shop_code += "  ctx.textAlign = 'center';\n"
shop_code += "  ctx.fillText(skipSel ? '\\u25B6 \\u3064\\u304E\\u3078\\u3059\\u3059\\u3080 (Z) \\u25C0' : 'X\\u30AD\\u30FC / Esc\\u3067\\u3064\\u304E\\u3078', CW / 2, skipY);\n\n"
shop_code += "  // Bottom hint\n"
shop_code += "  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '14px ' + F;\n"
shop_code += "  if (typeof touchActive !== 'undefined' && touchActive) {\n"
shop_code += "    ctx.fillText('\\u30BF\\u30C3\\u30D7: \\u3048\\u3089\\u3076  \\u30C0\\u30D6\\u30EB\\u30BF\\u30C3\\u30D7: \\u304B\\u3046', CW / 2, CH - 14);\n"
shop_code += "  } else {\n"
shop_code += "    ctx.fillText('\\u2190\\u2192: \\u3048\\u3089\\u3076  Z: \\u304B\\u3046  X/Esc: \\u3064\\u304E\\u3078', CW / 2, CH - 14);\n"
shop_code += "  }\n"
shop_code += "  ctx.textAlign = 'left';\n"
shop_code += "}\n"

with open('js/shop_ui.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(shop_code)
sz1 = round(os.path.getsize('js/shop_ui.js') / 1024, 1)
print(f'[OK] js/shop_ui.js rewritten ({sz1}KB) - bust-up counter layout')


# === 2. Patch update.js - add pickShopLine hooks ===
with open('js/update.js', 'r', encoding='utf-8') as f:
    upd = f.read()

patched = 0

# 2a. Shop enter: after playBGM('shop')
if 'pickShopLine' not in upd:
    # On shop entry (when BGM starts)
    upd = upd.replace(
        "if (currentBGM !== 'shop') playBGM('shop', 0.8);",
        "if (currentBGM !== 'shop') { playBGM('shop', 0.8); if (typeof pickShopLine === 'function') pickShopLine('enter'); }"
    )
    patched += 1

    # On successful purchase
    upd = upd.replace(
        "Audio.menu_select(); shopItems.splice(selectCursor, 1);",
        "Audio.menu_select(); if (typeof pickShopLine === 'function') pickShopLine('buy'); shopItems.splice(selectCursor, 1);"
    )
    patched += 1

    # On shop exit
    upd = upd.replace(
        "if (wasPressed('Escape') || wasPressed('KeyX') || (selectCursor >= shopItems.length && (wasPressed('KeyZ') || wasPressed('Enter')))) { finishTree(); }",
        "if (wasPressed('Escape') || wasPressed('KeyX') || (selectCursor >= shopItems.length && (wasPressed('KeyZ') || wasPressed('Enter')))) { if (typeof pickShopLine === 'function') pickShopLine('exit'); finishTree(); }"
    )
    patched += 1

    with open('js/update.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(upd)
    print(f'[OK] js/update.js - {patched} pickShopLine hooks added')
else:
    print('[SKIP] update.js already has pickShopLine')


# === 3. Update BACKLOG.md ===
with open('docs/BACKLOG.md', 'r', encoding='utf-8') as f:
    bl = f.read()

new_entries = []
if 'PWA' not in bl:
    new_entries.append('| 2026-03-22 | PWA\u300C\u30DB\u30FC\u30E0\u753B\u9762\u306B\u8FFD\u52A0\u300D\u6848\u5185\u8868\u793A | \u30D6\u30E9\u30A6\u30B6\u78BA\u8A8D\u6642 | \u4E2D | \u672A\u7740\u624B |')
if '\u30A8\u30F3\u30C7\u30A3\u30F3\u30B0\u5206\u5C90BGM' not in bl:
    pass  # already in backlog as low priority

if new_entries:
    bl = bl.rstrip() + '\n' + '\n'.join(new_entries) + '\n'
    with open('docs/BACKLOG.md', 'w', encoding='utf-8', newline='\n') as f:
        f.write(bl)
    print(f'[OK] docs/BACKLOG.md - {len(new_entries)} entries added')
else:
    print('[SKIP] BACKLOG.md already up to date')


# === Summary ===
print()
print('=== BATCH COMPLETE ===')
print(f'  js/shop_ui.js: {sz1}KB (bust-up layout)')
print(f'  js/update.js: {round(os.path.getsize("js/update.js")/1024,1)}KB ({patched} hooks)')
print(f'  docs/BACKLOG.md: updated')
print()
print('Next: node -c js/shop_ui.js && node -c js/update.js && python test_game.py')
