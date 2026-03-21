# -*- coding: utf-8 -*-
import os, sys

print('[START] Pokemon GO style collection upgrade')

# ============ Step 1: data.js - recordEnemy upgrade ============
DATA_PATH = os.path.join('js', 'data.js')
with open(DATA_PATH, 'r', encoding='utf-8') as f:
    data_src = f.read()

OLD_RECORD = 'function recordEnemy(name, defeated) {\n  if (!collection[name]) collection[name] = { seen: 0, defeated: 0 };\n  collection[name].seen++;\n  if (defeated) collection[name].defeated++;\n}'

NEW_RECORD = """function recordEnemy(name, defeated) {
  if (!collection[name]) collection[name] = { seen: 0, defeated: 0 };
  collection[name].seen++;
  if (defeated) collection[name].defeated++;
  var lc = (typeof loopCount !== 'undefined') ? loopCount : 0;
  var lk = name + '_L' + lc;
  if (!collection[lk]) collection[lk] = { seen: 0, defeated: 0, loop: lc };
  collection[lk].seen++;
  if (defeated) collection[lk].defeated++;
}"""

if OLD_RECORD in data_src:
    data_src = data_src.replace(OLD_RECORD, NEW_RECORD)
    print('[OK] recordEnemy upgraded in data.js')
else:
    print('[WARN] recordEnemy pattern not found, trying flexible match')
    import re
    pat = r'function recordEnemy\(name, defeated\)\s*\{[^}]+\}'
    if re.search(pat, data_src):
        data_src = re.sub(pat, NEW_RECORD, data_src)
        print('[OK] recordEnemy replaced via regex')
    else:
        print('[FAIL] recordEnemy not found at all')
        sys.exit(1)

with open(DATA_PATH, 'w', encoding='utf-8') as f:
    f.write(data_src)

# ============ Step 2: game.js - debugFillCollection upgrade ============
GAME_PATH = os.path.join('js', 'game.js')
with open(GAME_PATH, 'r', encoding='utf-8') as f:
    game_src = f.read()

OLD_DEBUG_START = 'window.debugFillCollection = function()'
OLD_DEBUG_END = '};'

# Find and replace the whole debugFillCollection
idx_start = game_src.find(OLD_DEBUG_START)
if idx_start == -1:
    print('[FAIL] debugFillCollection not found in game.js')
    sys.exit(1)

# Find matching closing };
brace = 0
idx_end = -1
for i in range(idx_start, len(game_src)):
    if game_src[i] == '{':
        brace += 1
    elif game_src[i] == '}':
        brace -= 1
        if brace == 0:
            idx_end = i + 1
            # include the ; after }
            if idx_end < len(game_src) and game_src[idx_end] == ';':
                idx_end += 1
            break

if idx_end == -1:
    print('[FAIL] could not find end of debugFillCollection')
    sys.exit(1)

NEW_DEBUG = """window.debugFillCollection = function(maxLoop) {
  maxLoop = maxLoop || 3;
  if (typeof ENEMY_DEFS !== 'undefined' && typeof collection !== 'undefined') {
    var keys = Object.keys(ENEMY_DEFS);
    for (var i = 0; i < keys.length; i++) {
      var def = ENEMY_DEFS[keys[i]];
      if (!collection[def.name]) collection[def.name] = { seen: 0, defeated: 0 };
      collection[def.name].seen = Math.max(collection[def.name].seen, 30);
      collection[def.name].defeated = Math.max(collection[def.name].defeated, 20);
      for (var lp = 0; lp <= maxLoop; lp++) {
        var lk = def.name + '_L' + lp;
        if (!collection[lk]) collection[lk] = { seen: 0, defeated: 0, loop: lp };
        collection[lk].seen = Math.max(collection[lk].seen, 30);
        collection[lk].defeated = Math.max(collection[lk].defeated, 20);
      }
    }
  }
  if (typeof WEAPON_DEFS !== 'undefined' && typeof weaponCollection !== 'undefined') {
    for (var j = 0; j < WEAPON_DEFS.length; j++) {
      weaponCollection.add(WEAPON_DEFS[j].id);
    }
    if (typeof saveCollection === 'function') saveCollection();
  }
  if (typeof CHARM_DEFS !== 'undefined' && typeof charmCollection !== 'undefined') {
    for (var k = 0; k < CHARM_DEFS.length; k++) {
      charmCollection.add(CHARM_DEFS[k].id);
    }
    if (typeof saveCharmCollection === 'function') saveCharmCollection();
  }
  console.log('[DEBUG] All collections filled (loops 0-' + maxLoop + ')! Open TAB > 図鑑 to check.');
};"""

game_src = game_src[:idx_start] + NEW_DEBUG + game_src[idx_end:]

with open(GAME_PATH, 'w', encoding='utf-8') as f:
    f.write(game_src)
print('[OK] debugFillCollection upgraded in game.js')

# ============ Step 3: ui.js - drawCollectionTab Pokemon GO style ============
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
print('[INFO] drawCollectionTab: lines ' + str(start_line+1) + '~' + str(end_line+1))

N = []
N.append('function drawCollectionTab() {')
N.append("  var F = \"'M PLUS Rounded 1c', sans-serif\";")
# Sub-tab header
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
# Title
N.append("  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 22px ' + F;")
N.append("  ctx.fillText('\\u82b1\\u306e\\u56fd\\u306e\\u3044\\u304d\\u3082\\u306e\\u56f3\\u9451', 120, 190);")
N.append('')
# Build allEnemies + find maxLoop from collection keys
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
# Build flat list: [{def, loop, rec}]
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
# Completion bar
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
# Scrollable card list
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
# Card BG
N.append("    ctx.fillStyle = known ? 'rgba(40,35,60,0.85)' : 'rgba(25,25,25,0.7)';")
N.append('    ctx.fillRect(startX, ey, CW - 240, cardH);')
# Border color: hue-shifted
N.append("    var borderCol = known ? (ek.color || '#888') : '#333';")
N.append("    if (known && lp > 0 && typeof loopHueShift === 'function') borderCol = loopHueShift(ek.color || '#888', lp);")
N.append('    ctx.strokeStyle = borderCol;')
N.append('    ctx.lineWidth = known ? 2 : 1;')
N.append('    ctx.strokeRect(startX, ey, CW - 240, cardH);')
N.append('')
# Loop badge
N.append("    if (lp > 0) {")
N.append("      ctx.fillStyle = 'rgba(255,215,0,0.2)'; ctx.fillRect(startX + CW - 242 - 48, ey + 2, 46, 18);")
N.append("      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px ' + F;")
N.append("      ctx.fillText('Loop ' + lp, startX + CW - 242 - 44, ey + 14);")
N.append('    }')
N.append('')
# Sprite
N.append('    var sprX = startX + 6, sprY = ey + 7;')
N.append('    var sprW = 48, sprH = 48;')
N.append("    var shiftedColor = (lp > 0 && typeof loopHueShift === 'function') ? loopHueShift(ek.color, lp) : ek.color;")
N.append('    var fakeE = { x: sprX, y: sprY, w: sprW, h: sprH, shape: ek.shape, hitFlash: 0 };')
N.append('    if (known) {')
N.append('      ctx.save();')
N.append("      if (typeof drawEnemyShape === 'function') {")
N.append('        drawEnemyShape(fakeE, shiftedColor);')
N.append('      } else {')
N.append("        ctx.fillStyle = shiftedColor; ctx.beginPath();")
N.append('        ctx.arc(sprX + sprW/2, sprY + sprH/2, sprW/3, 0, Math.PI * 2); ctx.fill();')
N.append('      }')
N.append('      ctx.restore();')
N.append('    } else {')
N.append('      ctx.save(); ctx.globalAlpha = 0.2;')
N.append("      if (typeof drawEnemyShape === 'function') {")
N.append("        fakeE.hitFlash = 99;")
N.append("        drawEnemyShape(fakeE, '#222');")
N.append('      } else {')
N.append("        ctx.fillStyle = '#333'; ctx.beginPath();")
N.append('        ctx.arc(sprX + sprW/2, sprY + sprH/2, sprW/3, 0, Math.PI * 2); ctx.fill();')
N.append('      }')
N.append('      ctx.globalAlpha = 1; ctx.restore();')
N.append('    }')
N.append('')
# Text
N.append('    var txX = startX + 66;')
N.append('    if (known) {')
N.append("      ctx.fillStyle = shiftedColor; ctx.font = 'bold 16px ' + F;")
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
print('[OK] drawCollectionTab upgraded in ui.js')

# ============ Step 4: Verify ============
for fpath in [DATA_PATH, GAME_PATH, UI_PATH]:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    sz = os.path.getsize(fpath)
    print(os.path.basename(fpath) + ': ' + str(sz) + ' bytes (' + str(round(sz/1024,1)) + ' KB)')
    if sz > 30720:
        print('  [WARN] exceeds 30KB!')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    dv = f.read()
with open(GAME_PATH, 'r', encoding='utf-8') as f:
    gv = f.read()
with open(UI_PATH, 'r', encoding='utf-8') as f:
    uv = f.read()

checks = [
    ("_L' + lc" in dv, 'recordEnemy loop key'),
    ('collection[lk]' in dv, 'recordEnemy loop collection'),
    ("'_L' + lp" in gv, 'debugFill loop keys'),
    ('maxLoopFound' in uv, 'UI detects max loop'),
    ('entries.push' in uv, 'UI flat entry list'),
    ('loopHueShift' in uv, 'UI color shift'),
    ("'Loop '" in uv, 'UI loop badge'),
    ('ownedE' in uv, 'UI completion counter'),
    ('drawEnemyShape(fakeE' in uv, 'UI correct shape call'),
]
print('')
print('=== Verify ===')
fc = 0
for ok, desc in checks:
    if not ok: fc += 1
    print('  [' + ('PASS' if ok else 'FAIL') + '] ' + desc)

if fc == 0:
    print('\n[ALL PASS]')
else:
    print('\n[' + str(fc) + ' FAILED]')
