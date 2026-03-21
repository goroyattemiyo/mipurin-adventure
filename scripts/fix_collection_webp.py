# -*- coding: utf-8 -*-
import os, sys

print('[START] Collection tab: use webp sprites via drawSpriteImg')

UI_PATH = os.path.join('js', 'ui.js')
with open(UI_PATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()

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
N.append('  var allEnemies = (typeof ENEMY_DEFS === "object" && !Array.isArray(ENEMY_DEFS)) ? Object.values(ENEMY_DEFS) : (Array.isArray(ENEMY_DEFS) ? ENEMY_DEFS : []);')
N.append('  var maxLoopFound = 0;')
N.append("  if (typeof collection !== 'undefined') {")
N.append('    var ckeys = Object.keys(collection);')
N.append('    for (var ci = 0; ci < ckeys.length; ci++) {')
N.append("      var lm = ckeys[ci].match(/_L(\\d+)$/);")
N.append('      if (lm && parseInt(lm[1]) > maxLoopFound) maxLoopFound = parseInt(lm[1]);')
N.append('    }')
N.append('  }')
N.append('')
N.append('  var entries = [];')
N.append('  for (var ei = 0; ei < allEnemies.length; ei++) {')
N.append('    var eDef = allEnemies[ei];')
N.append('    for (var lp = 0; lp <= maxLoopFound; lp++) {')
N.append("      var lk = eDef.name + '_L' + lp;")
N.append("      var rec = (typeof collection !== 'undefined' && collection[lk]) ? collection[lk] : null;")
N.append('      entries.push({ def: eDef, loop: lp, rec: rec });')
N.append('    }')
N.append('  }')
N.append('')
N.append('  var totalE = entries.length || 1;')
N.append('  var ownedE = 0;')
N.append('  for (var oi = 0; oi < entries.length; oi++) {')
N.append('    if (entries[oi].rec && entries[oi].rec.defeated > 0) ownedE++;')
N.append('  }')
N.append('  var pctE = Math.floor(ownedE / totalE * 100);')
N.append("  ctx.fillStyle = '#555'; ctx.fillRect(120, 200, 400, 16);")
N.append("  ctx.fillStyle = '#7ecf6a'; ctx.fillRect(120, 200, 400 * (ownedE / totalE), 16);")
N.append("  ctx.fillStyle = '#fff'; ctx.font = 'bold 12px ' + F; ctx.textAlign = 'center';")
N.append("  ctx.fillText(ownedE + ' / ' + totalE + ' (' + pctE + '%)', 320, 212);")
N.append("  ctx.textAlign = 'left';")
N.append('')
N.append('  var cardH = 62, padY = 4, startY = 228, startX = 120;')
N.append('  var maxRows = Math.floor((CH - 80 - startY) / (cardH + padY));')
N.append('  for (var i = 0; i < Math.min(entries.length, maxRows); i++) {')
N.append('    var ent = entries[i];')
N.append('    var ek = ent.def;')
N.append('    var lp = ent.loop;')
N.append('    var ey = startY + i * (cardH + padY);')
N.append('    var rec = ent.rec;')
N.append('    var seenC = rec ? rec.seen : 0;')
N.append('    var defeatedC = rec ? rec.defeated : 0;')
N.append('    var known = defeatedC > 0;')
N.append('')
N.append("    ctx.fillStyle = known ? 'rgba(40,35,60,0.85)' : 'rgba(25,25,25,0.7)';")
N.append('    ctx.fillRect(startX, ey, CW - 240, cardH);')
N.append("    var borderCol = known ? (ek.color || '#888') : '#333';")
N.append("    if (known && lp > 0 && typeof loopHueShift === 'function') borderCol = loopHueShift(ek.color || '#888', lp);")
N.append('    ctx.strokeStyle = borderCol;')
N.append('    ctx.lineWidth = known ? 2 : 1;')
N.append('    ctx.strokeRect(startX, ey, CW - 240, cardH);')
N.append('')
N.append("    if (lp > 0) {")
N.append("      ctx.fillStyle = 'rgba(255,215,0,0.2)'; ctx.fillRect(startX + CW - 242 - 48, ey + 2, 46, 18);")
N.append("      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px ' + F;")
N.append("      ctx.fillText('Loop ' + lp, startX + CW - 242 - 44, ey + 14);")
N.append('    }')
N.append('')
# Sprite area - use webp via drawSpriteImg with hue-rotate for loop variants
N.append('    var sprX = startX + 6, sprY = ey + 7;')
N.append('    var sprW = 48, sprH = 48;')
N.append('    var sprId = ek.shape;')
N.append('    if (known) {')
N.append('      ctx.save();')
N.append("      if (lp > 0) ctx.filter = 'hue-rotate(' + (lp * 30) + 'deg)';")
N.append("      if (typeof hasSprite === 'function' && hasSprite(sprId)) {")
N.append('        drawSpriteImg(sprId, sprX, sprY, sprW, sprH);')
N.append('      } else {')
# Fallback: drawEnemyShape with fakeE
N.append("        var shiftedColor = (lp > 0 && typeof loopHueShift === 'function') ? loopHueShift(ek.color, lp) : ek.color;")
N.append('        var fakeE = { x: sprX, y: sprY, w: sprW, h: sprH, shape: ek.shape, hitFlash: 0 };')
N.append("        if (typeof drawEnemyShape === 'function') drawEnemyShape(fakeE, shiftedColor);")
N.append('      }')
N.append("      ctx.filter = 'none';")
N.append('      ctx.restore();')
N.append('    } else {')
# Silhouette: dark + low alpha
N.append('      ctx.save();')
N.append("      ctx.filter = 'brightness(0)';")
N.append('      ctx.globalAlpha = 0.3;')
N.append("      if (typeof hasSprite === 'function' && hasSprite(sprId)) {")
N.append('        drawSpriteImg(sprId, sprX, sprY, sprW, sprH);')
N.append('      } else {')
N.append('        var fakeE2 = { x: sprX, y: sprY, w: sprW, h: sprH, shape: ek.shape, hitFlash: 99 };')
N.append("        if (typeof drawEnemyShape === 'function') drawEnemyShape(fakeE2, '#222');")
N.append('      }')
N.append("      ctx.filter = 'none'; ctx.globalAlpha = 1;")
N.append('      ctx.restore();')
N.append('    }')
N.append('')
N.append('    var txX = startX + 66;')
N.append('    if (known) {')
N.append("      var dispColor = (lp > 0 && typeof loopHueShift === 'function') ? loopHueShift(ek.color, lp) : ek.color;")
N.append("      ctx.fillStyle = dispColor; ctx.font = 'bold 16px ' + F;")
N.append("      var displayName = ek.name + (lp > 0 ? ' [\\u8272\\u9055\\u3044 ' + lp + ']' : '');")
N.append('      ctx.fillText(displayName, txX, ey + 20);')
N.append("      ctx.fillStyle = '#ccc'; ctx.font = '12px ' + F;")
N.append("      ctx.fillText('\\u906d\\u904e: ' + seenC + '  \\u6483\\u7834: ' + defeatedC, txX, ey + 36);")
N.append('      if (ek.lore) {')
N.append("        ctx.fillStyle = '#888'; ctx.font = '11px ' + F;")
N.append("        var ls = ek.lore.length > 45 ? ek.lore.slice(0, 45) + '..' : ek.lore;")
N.append('        ctx.fillText(ls, txX, ey + 52);')
N.append('      }')
N.append('    } else {')
N.append("      ctx.fillStyle = '#555'; ctx.font = 'bold 16px ' + F;")
N.append("      var unknownName = '??? ' + (lp > 0 ? '[Loop ' + lp + ']' : '');")
N.append('      ctx.fillText(unknownName, txX, ey + 20);')
N.append("      ctx.fillStyle = '#444'; ctx.font = '12px ' + F;")
N.append("      ctx.fillText(seenC > 0 ? '\\u906d\\u904e\\u3042\\u308a\\u3002\\u305f\\u304a\\u3059\\u3068\\u89e3\\u653e\\uff01' : '\\u307e\\u3060\\u767a\\u898b\\u3055\\u308c\\u3066\\u3044\\u306a\\u3044\\u2026', txX, ey + 36);")
N.append('    }')
N.append('  }')
N.append('}')

new_func = '\n'.join(N) + '\n\n'
new_lines = lines[:start_line] + [new_func] + lines[end_line+1:]

with open(UI_PATH, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print('[OK] drawCollectionTab updated with webp sprites')

with open(UI_PATH, 'r', encoding='utf-8') as f:
    v = f.read()

checks = [
    ('hasSprite(sprId)', 'webp sprite check'),
    ('drawSpriteImg(sprId', 'webp sprite draw'),
    ('hue-rotate', 'loop color shift'),
    ("brightness(0)", 'silhouette filter'),
    ('drawEnemyShape', 'fallback shape'),
    ('loopHueShift', 'color shift func'),
    ('entries.push', 'flat entry list'),
    ('maxLoopFound', 'loop detection'),
    ('ownedE', 'completion counter'),
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
