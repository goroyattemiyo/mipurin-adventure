# -*- coding: utf-8 -*-
import os, sys

UI_PATH = os.path.join('js', 'ui.js')

print('[START] Reading ui.js...')
with open(UI_PATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()
print('[INFO] ui.js: ' + str(len(lines)) + ' lines')

start_line = -1
end_line = -1
brace_depth = 0
inside = False

for i, line in enumerate(lines):
    if not inside and 'function drawCollectionTab()' in line:
        start_line = i
        inside = True
        brace_depth = 0
    if inside:
        brace_depth += line.count('{') - line.count('}')
        if brace_depth <= 0 and i > start_line:
            end_line = i
            break

if start_line == -1 or end_line == -1:
    print('[FAIL] drawCollectionTab not found')
    sys.exit(1)

print('[INFO] Found: lines ' + str(start_line+1) + ' to ' + str(end_line+1))

NEW_FUNC = 'function drawCollectionTab() {\n'
NEW_FUNC += "  var F = \"'M PLUS Rounded 1c', sans-serif\";\n"
NEW_FUNC += "  var subTabs = ['\\u3044\\u304d\\u3082\\u306e', '\\u3076\\u304d'];\n"
NEW_FUNC += '  for (var si = 0; si < subTabs.length; si++) {\n'
NEW_FUNC += '    var stx = 200 + si * 180, sty = 120;\n'
NEW_FUNC += "    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#ffd700' : 'rgba(255,255,255,0.3)';\n"
NEW_FUNC += '    ctx.fillRect(stx - 60, sty - 16, 120, 32);\n'
NEW_FUNC += "    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#000' : '#ccc';\n"
NEW_FUNC += '    ctx.font = "bold 18px " + F; ctx.textAlign = \'center\';\n'
NEW_FUNC += '    ctx.fillText(subTabs[si], stx, sty + 6);\n'
NEW_FUNC += '  }\n'
NEW_FUNC += "  ctx.textAlign = 'left';\n"
NEW_FUNC += "  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = \"14px \" + F; ctx.textAlign = 'center';\n"
NEW_FUNC += "  ctx.fillText('\\u2190\\u2192: \\u30b5\\u30d6\\u30bf\\u30d6\\u5207\\u66ff', 290, 155);\n"
NEW_FUNC += "  ctx.textAlign = 'left';\n"
NEW_FUNC += "  if (typeof collectionSubTab !== 'undefined' && collectionSubTab === 1) { drawWeaponCollection(); return; }\n"
NEW_FUNC += '\n'
NEW_FUNC += "  ctx.fillStyle = '#ffd700'; ctx.font = \"bold 22px \" + F;\n"
NEW_FUNC += "  ctx.fillText('\\u82b1\\u306e\\u56fd\\u306e\\u3044\\u304d\\u3082\\u306e\\u56f3\\u9451', 120, 190);\n"
NEW_FUNC += '\n'
NEW_FUNC += "  var totalE = (typeof ENEMY_DEFS !== 'undefined') ? ENEMY_DEFS.length : 12;\n"
NEW_FUNC += '  var ownedE = 0;\n'
NEW_FUNC += '  for (var ei = 0; ei < totalE; ei++) {\n'
NEW_FUNC += '    var ekDef = ENEMY_DEFS[ei];\n'
NEW_FUNC += "    if (typeof collection !== 'undefined' && collection[ekDef.name] && collection[ekDef.name].defeated > 0) ownedE++;\n"
NEW_FUNC += '  }\n'
NEW_FUNC += '  var pctE = Math.floor(ownedE / totalE * 100);\n'
NEW_FUNC += "  ctx.fillStyle = '#555'; ctx.fillRect(120, 200, 400, 16);\n"
NEW_FUNC += "  ctx.fillStyle = '#7ecf6a'; ctx.fillRect(120, 200, 400 * (ownedE / totalE), 16);\n"
NEW_FUNC += "  ctx.fillStyle = '#fff'; ctx.font = \"bold 12px \" + F; ctx.textAlign = 'center';\n"
NEW_FUNC += "  ctx.fillText(ownedE + ' / ' + totalE + ' (' + pctE + '%)', 320, 212);\n"
NEW_FUNC += "  ctx.textAlign = 'left';\n"
NEW_FUNC += '\n'
NEW_FUNC += '  var cardH = 68, padY = 6, startY = 228, startX = 120;\n'
NEW_FUNC += "  var maxLoop = (typeof loopCount !== 'undefined') ? loopCount : 0;\n"
NEW_FUNC += '  for (var i = 0; i < totalE; i++) {\n'
NEW_FUNC += '    var ek = ENEMY_DEFS[i];\n'
NEW_FUNC += '    var ey = startY + i * (cardH + padY);\n'
NEW_FUNC += '    if (ey + cardH > CH - 60) break;\n'
NEW_FUNC += "    var rec = (typeof collection !== 'undefined' && collection[ek.name]) ? collection[ek.name] : null;\n"
NEW_FUNC += '    var seenC = rec ? rec.seen : 0;\n'
NEW_FUNC += '    var defeatedC = rec ? rec.defeated : 0;\n'
NEW_FUNC += '    var known = defeatedC > 0;\n'
NEW_FUNC += '\n'
NEW_FUNC += "    ctx.fillStyle = known ? 'rgba(40,35,60,0.85)' : 'rgba(25,25,25,0.7)';\n"
NEW_FUNC += '    ctx.fillRect(startX, ey, CW - 240, cardH);\n'
NEW_FUNC += "    ctx.strokeStyle = known ? (ek.color || '#888') : '#333';\n"
NEW_FUNC += '    ctx.lineWidth = known ? 2 : 1;\n'
NEW_FUNC += '    ctx.strokeRect(startX, ey, CW - 240, cardH);\n'
NEW_FUNC += '\n'
NEW_FUNC += '    var sprX = startX + 8, sprY = ey + 10;\n'
NEW_FUNC += "    var sprId = 'enemy_' + ek.shape;\n"
NEW_FUNC += '    if (known) {\n'
NEW_FUNC += '      ctx.save();\n'
NEW_FUNC += "      if (typeof hasSprite === 'function' && hasSprite(sprId)) {\n"
NEW_FUNC += '        drawSpriteImg(sprId, sprX, sprY, 48, 48);\n'
NEW_FUNC += "      } else if (typeof drawEnemyShape === 'function') {\n"
NEW_FUNC += '        drawEnemyShape(ctx, sprX + 24, sprY + 24, ek.shape, ek.size || 18, ek.color);\n'
NEW_FUNC += '      } else {\n'
NEW_FUNC += "        ctx.fillStyle = ek.color || '#fff'; ctx.font = \"32px \" + F; ctx.textAlign = 'center';\n"
NEW_FUNC += "        ctx.fillText('?', sprX + 24, sprY + 32); ctx.textAlign = 'left';\n"
NEW_FUNC += '      }\n'
NEW_FUNC += '      ctx.restore();\n'
NEW_FUNC += '      if (maxLoop > 0) {\n'
NEW_FUNC += '        for (var lp = 1; lp <= Math.min(maxLoop, 3); lp++) {\n'
NEW_FUNC += '          ctx.save();\n'
NEW_FUNC += "          ctx.filter = 'hue-rotate(' + (lp * 30) + 'deg)';\n"
NEW_FUNC += '          var pvX = sprX + 52 + (lp - 1) * 22, pvY = sprY + 28;\n'
NEW_FUNC += "          if (typeof hasSprite === 'function' && hasSprite(sprId)) {\n"
NEW_FUNC += '            drawSpriteImg(sprId, pvX, pvY, 20, 20);\n'
NEW_FUNC += "          } else if (typeof drawEnemyShape === 'function') {\n"
NEW_FUNC += '            drawEnemyShape(ctx, pvX + 10, pvY + 10, ek.shape, 8, ek.color);\n'
NEW_FUNC += '          }\n'
NEW_FUNC += "          ctx.filter = 'none';\n"
NEW_FUNC += '          ctx.restore();\n'
NEW_FUNC += '        }\n'
NEW_FUNC += '      }\n'
NEW_FUNC += '    } else {\n'
NEW_FUNC += '      ctx.save();\n'
NEW_FUNC += "      if (typeof hasSprite === 'function' && hasSprite(sprId)) {\n"
NEW_FUNC += "        ctx.filter = 'brightness(0)'; ctx.globalAlpha = 0.4;\n"
NEW_FUNC += '        drawSpriteImg(sprId, sprX, sprY, 48, 48);\n'
NEW_FUNC += "      } else if (typeof drawEnemyShape === 'function') {\n"
NEW_FUNC += '        ctx.globalAlpha = 0.3;\n'
NEW_FUNC += "        drawEnemyShape(ctx, sprX + 24, sprY + 24, ek.shape, ek.size || 18, '#222');\n"
NEW_FUNC += '      } else {\n'
NEW_FUNC += '        ctx.globalAlpha = 0.3;\n'
NEW_FUNC += "        ctx.fillStyle = '#222'; ctx.font = \"32px \" + F; ctx.textAlign = 'center';\n"
NEW_FUNC += "        ctx.fillText('?', sprX + 24, sprY + 32); ctx.textAlign = 'left';\n"
NEW_FUNC += '      }\n'
NEW_FUNC += "      ctx.filter = 'none'; ctx.globalAlpha = 1;\n"
NEW_FUNC += '      ctx.restore();\n'
NEW_FUNC += '    }\n'
NEW_FUNC += '\n'
NEW_FUNC += '    var txX = startX + 120;\n'
NEW_FUNC += '    if (known) {\n'
NEW_FUNC += "      ctx.fillStyle = ek.color || '#fff'; ctx.font = \"bold 17px \" + F;\n"
NEW_FUNC += '      ctx.fillText(ek.name, txX, ey + 22);\n'
NEW_FUNC += "      ctx.fillStyle = '#ccc'; ctx.font = \"13px \" + F;\n"
NEW_FUNC += "      ctx.fillText('\\u906d\\u904e: ' + seenC + '  \\u6483\\u7834: ' + defeatedC, txX, ey + 40);\n"
NEW_FUNC += '      if (ek.lore) {\n'
NEW_FUNC += "        ctx.fillStyle = '#999'; ctx.font = \"12px \" + F;\n"
NEW_FUNC += "        var loreShort = ek.lore.length > 40 ? ek.lore.slice(0, 40) + '..' : ek.lore;\n"
NEW_FUNC += '        ctx.fillText(loreShort, txX, ey + 56);\n'
NEW_FUNC += '      }\n'
NEW_FUNC += '    } else {\n'
NEW_FUNC += "      ctx.fillStyle = '#555'; ctx.font = \"bold 17px \" + F;\n"
NEW_FUNC += "      ctx.fillText('??? \\u307e\\u3060\\u3067\\u3042\\u3063\\u3066\\u3044\\u306a\\u3044', txX, ey + 22);\n"
NEW_FUNC += "      ctx.fillStyle = '#444'; ctx.font = \"12px \" + F;\n"
NEW_FUNC += "      ctx.fillText(seenC > 0 ? '\\u906d\\u904e\\u3042\\u308a\\u3002\\u305f\\u304a\\u3059\\u3068\\u89e3\\u653e\\uff01' : '\\u307e\\u3060\\u767a\\u898b\\u3055\\u308c\\u3066\\u3044\\u306a\\u3044\\u2026', txX, ey + 40);\n"
NEW_FUNC += '    }\n'
NEW_FUNC += '  }\n'
NEW_FUNC += '}'

new_lines = lines[:start_line] + [NEW_FUNC + '\n\n'] + lines[end_line+1:]

print('[INFO] Writing ui.js...')
with open(UI_PATH, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

with open(UI_PATH, 'r', encoding='utf-8') as f:
    verify = f.read()

checks = [
    ('drawSpriteImg(sprId', 'Enemy sprite'),
    ('ownedE', 'Completion counter'),
    ('hue-rotate', 'Color variant'),
    ('brightness(0)', 'Silhouette'),
    ('drawEnemyShape', 'Fallback shape'),
    ('ENEMY_DEFS[ei]', 'Full iteration'),
    ('pctE', 'Percentage'),
]
print('')
print('=== Verification ===')
fail_count = 0
for pat, desc in checks:
    found = pat in verify
    tag = 'PASS' if found else 'FAIL'
    if not found:
        fail_count += 1
    print('  [' + tag + '] ' + desc)

sz = os.path.getsize(UI_PATH)
kb = round(sz / 1024, 1)
print('')
print('ui.js: ' + str(sz) + ' bytes (' + str(kb) + ' KB)')
if fail_count == 0:
    print('[ALL PASS]')
else:
    print('[' + str(fail_count) + ' FAILED]')
