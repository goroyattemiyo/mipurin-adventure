# -*- coding: utf-8 -*-
import os, sys

UI_PATH = os.path.join('js', 'ui.js')
print('[START] Reading ui.js...')
with open(UI_PATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()
print('[INFO] ' + str(len(lines)) + ' lines')

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
    print('[FAIL] not found start=' + str(start_line) + ' end=' + str(end_line))
    sys.exit(1)
print('[INFO] lines ' + str(start_line+1) + '~' + str(end_line+1))

N = []
N.append('function drawCollectionTab() {')
N.append("  var F = \"'M PLUS Rounded 1c', sans-serif\";")
N.append("  var subTabs = ['\\u3044\\u304d\\u3082\\u306e', '\\u3076\\u304d'];")
N.append('  for (var si = 0; si < subTabs.length; si++) {')
N.append('    var stx = 200 + si * 180, sty = 120;')
N.append("    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#ffd700' : 'rgba(255,255,255,0.3)';")
N.append('    ctx.fillRect(stx - 60, sty - 16, 120, 32);')
N.append("    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#000' : '#ccc';")
N.append("    ctx.font = 'bold 18px ' + F; ctx.textAlign = 'center';")
N.append('    ctx.fillText(subTabs[si], stx, sty + 6);')
N.append('  }')
N.append("  ctx.textAlign = 'left';")
N.append("  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '14px ' + F; ctx.textAlign = 'center';")
N.append("  ctx.fillText('\\u2190\\u2192: \\u30b5\\u30d6\\u30bf\\u30d6\\u5207\\u66ff', 290, 155);")
N.append("  ctx.textAlign = 'left';")
N.append("  if (typeof collectionSubTab !== 'undefined' && collectionSubTab === 1) { drawWeaponCollection(); return; }")
N.append('')
N.append("  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 22px ' + F;")
N.append("  ctx.fillText('\\u82b1\\u306e\\u56fd\\u306e\\u3044\\u304d\\u3082\\u306e\\u56f3\\u9451', 120, 190);")
N.append('')
N.append('  // ENEMY_DEFS is object, convert to array')
N.append('  var allEnemies = (typeof ENEMY_DEFS === "object" && !Array.isArray(ENEMY_DEFS)) ? Object.values(ENEMY_DEFS) : (Array.isArray(ENEMY_DEFS) ? ENEMY_DEFS : []);')
N.append('  var totalE = allEnemies.length || 1;')
N.append('  var ownedE = 0;')
N.append('  for (var ei = 0; ei < allEnemies.length; ei++) {')
N.append('    var ekDef = allEnemies[ei];')
N.append("    if (typeof collection !== 'undefined' && collection[ekDef.name] && collection[ekDef.name].defeated > 0) ownedE++;")
N.append('  }')
N.append('  var pctE = Math.floor(ownedE / totalE * 100);')
N.append("  ctx.fillStyle = '#555'; ctx.fillRect(120, 200, 400, 16);")
N.append("  ctx.fillStyle = '#7ecf6a'; ctx.fillRect(120, 200, 400 * (ownedE / totalE), 16);")
N.append("  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px ' + F; ctx.textAlign = 'center';")
N.append("  ctx.fillText(ownedE + ' / ' + totalE + ' (' + pctE + '%)', 320, 212);")
N.append("  ctx.textAlign = 'left';")
N.append('')
N.append('  var cardH = 68, padY = 6, startY = 228, startX = 120;')
N.append("  var maxLoop = (typeof loopCount !== 'undefined') ? loopCount : 0;")
N.append('  for (var i = 0; i < allEnemies.length; i++) {')
N.append('    var ek = allEnemies[i];')
N.append('    var ey = startY + i * (cardH + padY);')
N.append('    if (ey + cardH > CH - 60) break;')
N.append("    var rec = (typeof collection !== 'undefined' && collection[ek.name]) ? collection[ek.name] : null;")
N.append('    var seenC = rec ? rec.seen : 0;')
N.append('    var defeatedC = rec ? rec.defeated : 0;')
N.append('    var known = defeatedC > 0;')
N.append('')
N.append("    ctx.fillStyle = known ? 'rgba(40,35,60,0.85)' : 'rgba(25,25,25,0.7)';")
N.append('    ctx.fillRect(startX, ey, CW - 240, cardH);')
N.append("    ctx.strokeStyle = known ? (ek.color || '#888') : '#333';")
N.append('    ctx.lineWidth = known ? 2 : 1;')
N.append('    ctx.strokeRect(startX, ey, CW - 240, cardH);')
N.append('')
N.append('    var sprX = startX + 8, sprY = ey + 10;')
N.append('    if (known) {')
N.append('      ctx.save();')
N.append("      if (typeof drawEnemyShape === 'function') {")
N.append('        drawEnemyShape(ctx, sprX + 24, sprY + 24, ek.shape, ek.size || 18, ek.color);')
N.append('      } else {')
N.append("        ctx.fillStyle = ek.color || '#fff'; ctx.font = '32px ' + F; ctx.textAlign = 'center';")
N.append("        ctx.fillText('?', sprX + 24, sprY + 32); ctx.textAlign = 'left';")
N.append('      }')
N.append('      ctx.restore();')
N.append('      if (maxLoop > 0) {')
N.append('        for (var lp = 1; lp <= Math.min(maxLoop, 3); lp++) {')
N.append('          ctx.save();')
N.append("          ctx.filter = 'hue-rotate(' + (lp * 30) + 'deg)';")
N.append('          var pvX = sprX + 52 + (lp - 1) * 22, pvY = sprY + 28;')
N.append("          if (typeof drawEnemyShape === 'function') {")
N.append('            drawEnemyShape(ctx, pvX + 10, pvY + 10, ek.shape, 8, ek.color);')
N.append('          }')
N.append("          ctx.filter = 'none';")
N.append('          ctx.restore();')
N.append('        }')
N.append('      }')
N.append('    } else {')
N.append('      ctx.save();')
N.append('      ctx.globalAlpha = 0.25;')
N.append("      if (typeof drawEnemyShape === 'function') {")
N.append("        drawEnemyShape(ctx, sprX + 24, sprY + 24, ek.shape, ek.size || 18, '#333');")
N.append('      } else {')
N.append("        ctx.fillStyle = '#222'; ctx.font = '32px ' + F; ctx.textAlign = 'center';")
N.append("        ctx.fillText('?', sprX + 24, sprY + 32); ctx.textAlign = 'left';")
N.append('      }')
N.append('      ctx.globalAlpha = 1;')
N.append('      ctx.restore();')
N.append('    }')
N.append('')
N.append('    var txX = startX + 120;')
N.append('    if (known) {')
N.append("      ctx.fillStyle = ek.color || '#fff'; ctx.font = 'bold 17px ' + F;")
N.append('      ctx.fillText(ek.name, txX, ey + 22);')
N.append("      ctx.fillStyle = '#ccc'; ctx.font = '13px ' + F;")
N.append("      ctx.fillText('\\u906d\\u904e: ' + seenC + '  \\u6483\\u7834: ' + defeatedC, txX, ey + 40);")
N.append('      if (ek.lore) {')
N.append("        ctx.fillStyle = '#999'; ctx.font = '12px ' + F;")
N.append("        var loreShort = ek.lore.length > 40 ? ek.lore.slice(0, 40) + '..' : ek.lore;")
N.append('        ctx.fillText(loreShort, txX, ey + 56);')
N.append('      }')
N.append('    } else {')
N.append("      ctx.fillStyle = '#555'; ctx.font = 'bold 17px ' + F;")
N.append("      ctx.fillText('??? \\u307e\\u3060\\u3067\\u3042\\u3063\\u3066\\u3044\\u306a\\u3044', txX, ey + 22);")
N.append("      ctx.fillStyle = '#444'; ctx.font = '12px ' + F;")
N.append("      ctx.fillText(seenC > 0 ? '\\u906d\\u904e\\u3042\\u308a\\u3002\\u305f\\u304a\\u3059\\u3068\\u89e3\\u653e\\uff01' : '\\u307e\\u3060\\u767a\\u898b\\u3055\\u308c\\u3066\\u3044\\u306a\\u3044\\u2026', txX, ey + 40);")
N.append('    }')
N.append('  }')
N.append('}')

new_func = '\n'.join(N) + '\n\n'
new_lines = lines[:start_line] + [new_func] + lines[end_line+1:]

print('[INFO] Writing...')
with open(UI_PATH, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

with open(UI_PATH, 'r', encoding='utf-8') as f:
    v = f.read()

checks = [
    ('Object.values(ENEMY_DEFS)', 'ENEMY_DEFS as object'),
    ('allEnemies', 'allEnemies var'),
    ('ownedE', 'Completion counter'),
    ('hue-rotate', 'Color variant'),
    ('drawEnemyShape', 'Shape fallback'),
    ('pctE', 'Percentage'),
    ('globalAlpha = 0.25', 'Silhouette'),
]
print('')
print('=== Verify ===')
fc = 0
for pat, desc in checks:
    ok = pat in v
    if not ok: fc += 1
    print('  [' + ('PASS' if ok else 'FAIL') + '] ' + desc)

sz = os.path.getsize(UI_PATH)
print('')
print('ui.js: ' + str(sz) + ' bytes (' + str(round(sz/1024,1)) + ' KB)')
if fc == 0:
    print('[ALL PASS]')
else:
    print('[' + str(fc) + ' FAILED]')
