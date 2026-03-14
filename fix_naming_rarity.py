import os, re
BASE = os.path.dirname(os.path.abspath(__file__))

# ============================================================
# A: data.js - ENEMY_VARIANT_NAMES + getVariantName
# ============================================================
dp = os.path.join(BASE, 'js', 'data.js')
print('[1] Reading', dp)
with open(dp, 'r', encoding='utf-8') as f:
    ds = f.read()

VBLOCK = """
// === Enemy Variant Names ===
const ENEMY_VARIANT_NAMES = {
  mushroom:  ['\u3069\u304f\u30ad\u30ce\u30b3',       '\u3042\u304a\u30ad\u30ce\u30b3',       '\u304d\u3093\u30ad\u30ce\u30b3',       '\u3084\u307f\u30ad\u30ce\u30b3'],
  blob:      ['\u306f\u3061\u307f\u3064\u30b9\u30e9\u30a4\u30e0', '\u30b9\u30e9\u30a4\u30e0\u30d9\u30b9',     '\u30e1\u30bf\u30eb\u30b9\u30e9\u30a4\u30e0',   '\u30ad\u30f3\u30b0\u30b9\u30e9\u30a4\u30e0'],
  spider:    ['\u3042\u307f\u3050\u3082\u3061\u3083\u3093',   '\u304f\u308d\u3050\u3082\u3061\u3083\u3093',   '\u3069\u304f\u3050\u3082\u3061\u3083\u3093',   '\u304a\u306b\u3050\u3082\u3061\u3083\u3093'],
  bat:       ['\u3084\u307f\u30b3\u30a6\u30e2\u30ea',     '\u3042\u304b\u30b3\u30a6\u30e2\u30ea',     '\u3053\u304a\u308a\u30b3\u30a6\u30e2\u30ea',   '\u304d\u3093\u30b3\u30a6\u30e2\u30ea'],
  beetle:    ['\u304b\u3076\u3068\u3080\u3057\u30ca\u30a4\u30c8', '\u304f\u308f\u304c\u305f\u30ca\u30a4\u30c8',   '\u30c0\u30a4\u30e4\u30ca\u30a4\u30c8',     '\u308a\u3085\u3046\u30ca\u30a4\u30c8'],
  wasp:      ['\u308f\u308b\u3044\u30cf\u30c1',       '\u3069\u304f\u30d0\u30c1',         '\u304a\u304a\u30b9\u30ba\u30e1\u30d0\u30c1',   '\u30ad\u30e9\u30fc\u30db\u30fc\u30cd\u30c3\u30c8'],
  flower:    ['\u30d1\u30af\u30d1\u30af\u30d5\u30e9\u30ef\u30fc', '\u3082\u3048\u3082\u3048\u30d5\u30e9\u30ef\u30fc', '\u3053\u304a\u308a\u30d5\u30e9\u30ef\u30fc',   '\u3084\u307f\u30d5\u30e9\u30ef\u30fc'],
  worm:      ['\u3082\u3050\u3082\u3050\u30a4\u30e2\u30e0\u30b7', '\u3074\u304b\u3074\u304b\u30a4\u30e2\u30e0\u30b7', '\u3068\u3052\u3068\u3052\u30a4\u30e2\u30e0\u30b7', '\u304a\u304a\u30a4\u30e2\u30e0\u30b7'],
  ghost:     ['\u3072\u3068\u3060\u307e\u30db\u30bf\u30eb',   '\u3042\u304a\u3073\u30db\u30bf\u30eb',     '\u304a\u306b\u3073\u30db\u30bf\u30eb',     '\u308c\u3044\u3053\u3093\u30db\u30bf\u30eb'],
  golem:     ['\u3044\u308f\u3044\u308f\u30b4\u30fc\u30ec\u30e0', '\u3053\u304a\u308a\u30b4\u30fc\u30ec\u30e0',   '\u30de\u30b0\u30de\u30b4\u30fc\u30ec\u30e0',   '\u30af\u30ea\u30b9\u30bf\u30eb\u30b4\u30fc\u30ec\u30e0'],
  vine:      ['\u3064\u308b\u3064\u308b\u30c4\u30bf',     '\u3082\u3048\u308b\u30c4\u30bf',       '\u3053\u304a\u308b\u30c4\u30bf',       '\u3084\u307f\u306e\u30c4\u30bf'],
  darkbee:   ['\u30c0\u30fc\u30af\u30d3\u30fc',       '\u30b7\u30e3\u30c9\u30fc\u30d3\u30fc',     '\u30d5\u30a1\u30f3\u30c8\u30e0\u30d3\u30fc',   '\u30c7\u30b9\u30d3\u30fc']
};
function getVariantName(shape, loop) {
  var names = ENEMY_VARIANT_NAMES[shape];
  if (!names) return null;
  var idx = Math.min(loop || 0, names.length - 1);
  return names[idx];
}
// === End Enemy Variant Names ===
"""

if 'ENEMY_VARIANT_NAMES' in ds:
    ds = re.sub(r'// === Enemy Variant Names ===.*?// === End Enemy Variant Names ===\n?', '', ds, flags=re.DOTALL)
    print('  Removed old ENEMY_VARIANT_NAMES')

marker = "if (defeated) collection[lk].defeated++;\n}"
pos = ds.find(marker)
if pos >= 0:
    ip = pos + len(marker)
    ds = ds[:ip] + "\n" + VBLOCK + ds[ip:]
    print('  Inserted ENEMY_VARIANT_NAMES')
else:
    print('  ERROR: recordEnemy end marker not found')

with open(dp, 'w', encoding='utf-8') as f:
    f.write(ds)
print('  data.js:', len(ds), 'bytes')

# ============================================================
# B: rarity.js - getRarityFilter
# ============================================================
rp = os.path.join(BASE, 'js', 'rarity.js')
print('[2] Reading', rp)
with open(rp, 'r', encoding='utf-8') as f:
    rs = f.read()

RFBLOCK = """
// === Rarity Sprite Filter ===
function getRarityFilter(rarity) {
  if (rarity === 'fine')    return 'hue-rotate(180deg) saturate(1.3)';
  if (rarity === 'great')   return 'hue-rotate(40deg) saturate(1.5) brightness(1.2)';
  if (rarity === 'miracle') return 'hue-rotate(270deg) saturate(1.8)';
  if (rarity === 'legend')  return 'hue-rotate(15deg) saturate(2.0) brightness(1.3)';
  return 'none';
}
// === End Rarity Sprite Filter ===
"""

if 'getRarityFilter' in rs:
    rs = re.sub(r'// === Rarity Sprite Filter ===.*?// === End Rarity Sprite Filter ===\n?', '', rs, flags=re.DOTALL)
    print('  Removed old getRarityFilter')

end_tag = '// === End Rarity System ==='
if end_tag in rs:
    rs = rs.replace(end_tag, RFBLOCK.strip() + '\n' + end_tag)
else:
    rs = rs.rstrip() + '\n' + RFBLOCK

with open(rp, 'w', encoding='utf-8') as f:
    f.write(rs)
print('  rarity.js:', len(rs), 'bytes')

# ============================================================
# C: ui.js - variant names + weapon rarity tint
# ============================================================
up = os.path.join(BASE, 'js', 'ui.js')
print('[3] Reading', up)
with open(up, 'r', encoding='utf-8') as f:
    us = f.read()

# C1: displayName in drawCollectionTab
old_dn = "var displayName = ek.name + (lp > 0 ? ' [\\u8272\\u9055\\u3044 ' + lp + ']' : '');"
new_dn = "var displayName = (typeof getVariantName === 'function' && getVariantName(ek.shape, lp)) ? getVariantName(ek.shape, lp) : (ek.name + (lp > 0 ? ' [Loop ' + lp + ']' : ''));"
if old_dn in us:
    us = us.replace(old_dn, new_dn, 1)
    print('  C1: displayName replaced')
else:
    print('  C1: WARN displayName not found exactly, trying regex')
    m = re.search(r"var displayName = ek\.name \+ \(lp > 0 \?.+?\);", us)
    if m:
        us = us[:m.start()] + new_dn + us[m.end():]
        print('  C1: displayName replaced via regex')
    else:
        print('  C1: FAIL')

# C2: unknownName
old_un = "var unknownName = '??? ' + (lp > 0 ? '[Loop ' + lp + ']' : '');"
new_un = "var unknownName = (lp > 0) ? '??? [Loop ' + lp + ']' : '???';"
if old_un in us:
    us = us.replace(old_un, new_un, 1)
    print('  C2: unknownName replaced')
else:
    m2 = re.search(r"var unknownName = .+?;", us)
    if m2:
        us = us[:m2.start()] + new_un + us[m2.end():]
        print('  C2: unknownName replaced via regex')
    else:
        print('  C2: WARN unknownName not found')

# C3: weapon sprite rarity tint in drawWeaponCollection
old_ws = "drawSpriteImg(sprId, wx + 4, wy + 8, 48, 48);"
new_ws = """ctx.save();
        var _wrf = (typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity || 'normal') : 'none';
        if (_wrf !== 'none') ctx.filter = _wrf;
        drawSpriteImg(sprId, wx + 4, wy + 8, 48, 48);
        ctx.restore();"""
if old_ws in us:
    us = us.replace(old_ws, new_ws, 1)
    print('  C3: weapon sprite rarity tint added')
else:
    print('  C3: WARN weapon sprite draw not found')

# C4: weapon name color -> rarity color in drawWeaponCollection
old_wc = "ctx.fillStyle = w.color || '#fff'; ctx.font = 'bold 13px ' + F;"
new_wc = "ctx.fillStyle = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : (w.color || '#fff'); ctx.font = 'bold 13px ' + F;"
if old_wc in us:
    us = us.replace(old_wc, new_wc, 1)
    print('  C4: weapon name rarity color')
else:
    print('  C4: WARN weapon name color not found')

# C5: rarity badge on weapon cards
# Find: ctx.fillText('T2', wx + cardW - 20, wy + 14);  (first one inside "if (has)")
# Add rarity label after the T2 badge block
badge_anchor = "ctx.fillText('T2', wx + cardW - 20, wy + 14);\n      }\n      // Desc"
badge_new = """ctx.fillText('T2', wx + cardW - 20, wy + 14);
      }
      if (w.rarity && w.rarity !== 'normal' && typeof getRarityDef === 'function') {
        var _rd = getRarityDef(w.rarity);
        ctx.fillStyle = _rd.color; ctx.font = 'bold 10px ' + F;
        ctx.fillText(_rd.name, wx + cardW - 22, wy + cardH - 6);
      }
      // Desc"""
if badge_anchor in us:
    us = us.replace(badge_anchor, badge_new, 1)
    print('  C5: rarity badge added')
else:
    print('  C5: WARN badge anchor not found')

with open(up, 'w', encoding='utf-8') as f:
    f.write(us)
print('  ui.js:', len(us), 'bytes')

# ============================================================
# D: equip_ui.js - weapon rarity tint
# ============================================================
ep = os.path.join(BASE, 'js', 'equip_ui.js')
print('[4] Reading', ep)
with open(ep, 'r', encoding='utf-8') as f:
    es = f.read()

# D1: slot sprite
old_es1 = "drawSpriteImg(spriteId, iconX, iconY, iconSize, iconSize);"
new_es1 = """ctx.save();
          var _esf = (w.rarity && typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity) : 'none';
          if (_esf !== 'none') ctx.filter = _esf;
          drawSpriteImg(spriteId, iconX, iconY, iconSize, iconSize);
          ctx.restore();"""
if old_es1 in es:
    es = es.replace(old_es1, new_es1, 1)
    print('  D1: equip slot rarity tint')
else:
    print('  D1: WARN slot sprite not found')

# D2: list sprite
old_es2 = "drawSpriteImg(sprId, icoX, icoY, icoSize, icoSize);"
new_es2 = """ctx.save();
          var _elf = (w.rarity && typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity) : 'none';
          if (_elf !== 'none') ctx.filter = _elf;
          drawSpriteImg(sprId, icoX, icoY, icoSize, icoSize);
          ctx.restore();"""
if old_es2 in es:
    es = es.replace(old_es2, new_es2, 1)
    print('  D2: equip list rarity tint')
else:
    print('  D2: WARN list sprite not found')

with open(ep, 'w', encoding='utf-8') as f:
    f.write(es)
print('  equip_ui.js:', len(es), 'bytes')

# ============================================================
# E: render.js - weapon drop popup sprite
# ============================================================
rndp = os.path.join(BASE, 'js', 'render.js')
print('[5] Reading', rndp)
with open(rndp, 'r', encoding='utf-8') as f:
    rns = f.read()

old_popup = """ctx.fillStyle = _nameCol; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText(weaponPopup.weapon.icon + ' ' + weaponPopup.weapon.name"""
new_popup = """// Weapon sprite with rarity tint
    var _wpSprId = 'weapon_' + weaponPopup.weapon.id;
    if (typeof hasSprite === 'function' && hasSprite(_wpSprId)) {
      ctx.save();
      var _wprf = (typeof getRarityFilter === 'function') ? getRarityFilter(_wpR) : 'none';
      if (_wprf !== 'none') ctx.filter = _wprf;
      drawSpriteImg(_wpSprId, CW / 2 - 32, CH / 2 - 110, 64, 64);
      ctx.restore();
    }
    ctx.fillStyle = _nameCol; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText(weaponPopup.weapon.icon + ' ' + weaponPopup.weapon.name"""
if old_popup in rns:
    rns = rns.replace(old_popup, new_popup, 1)
    print('  E: weapon drop popup sprite added')
else:
    print('  E: WARN popup pattern not found')

with open(rndp, 'w', encoding='utf-8') as f:
    f.write(rns)
print('  render.js:', len(rns), 'bytes')

# ============================================================
# VERIFY
# ============================================================
print('\n=== VERIFY ===')
ap = True
checks = [
    ('data.js',     'ENEMY_VARIANT_NAMES'),
    ('data.js',     'getVariantName'),
    ('rarity.js',   'getRarityFilter'),
    ('rarity.js',   'hue-rotate(270deg)'),
    ('ui.js',       'getVariantName(ek.shape'),
    ('ui.js',       'getRarityFilter'),
    ('ui.js',       'getRarityDef(w.rarity).color'),
    ('equip_ui.js', 'getRarityFilter'),
    ('render.js',   'getRarityFilter'),
    ('render.js',   '_wpSprId'),
]
for fn, pat in checks:
    fp = os.path.join(BASE, 'js', fn)
    with open(fp, 'r', encoding='utf-8') as f:
        c = f.read()
    ok = pat in c
    if not ok: ap = False
    print('  [' + ('PASS' if ok else 'FAIL') + '] ' + fn + ': ' + pat[:50])

print('\n=== SIZES ===')
for fn in ['data.js','rarity.js','ui.js','equip_ui.js','render.js']:
    fp = os.path.join(BASE, 'js', fn)
    sz = os.path.getsize(fp)
    print('  ' + fn + ': ' + str(sz) + ' (' + str(round(sz/1024,1)) + ' KB)')

print('\n' + ('[ALL PASS]' if ap else '[SOME FAILED]') + ' v6.22 done.')
