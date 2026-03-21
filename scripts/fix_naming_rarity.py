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
  mushroom:  ['どくキノコ',       'あおキノコ',       'きんキノコ',       'やみキノコ'],
  blob:      ['はちみつスライム', 'スライムベス',     'メタルスライム',   'キングスライム'],
  spider:    ['あみぐもちゃん',   'くろぐもちゃん',   'どくぐもちゃん',   'おにぐもちゃん'],
  bat:       ['やみコウモリ',     'あかコウモリ',     'こおりコウモリ',   'きんコウモリ'],
  beetle:    ['かぶとむしナイト', 'くわがたナイト',   'ダイヤナイト',     'りゅうナイト'],
  wasp:      ['わるいハチ',       'どくバチ',         'おおスズメバチ',   'キラーホーネット'],
  flower:    ['パクパクフラワー', 'もえもえフラワー', 'こおりフラワー',   'やみフラワー'],
  worm:      ['もぐもぐイモムシ', 'ぴかぴかイモムシ', 'とげとげイモムシ', 'おおイモムシ'],
  ghost:     ['ひとだまホタル',   'あおびホタル',     'おにびホタル',     'れいこんホタル'],
  golem:     ['いわいわゴーレム', 'こおりゴーレム',   'マグマゴーレム',   'クリスタルゴーレム'],
  vine:      ['つるつるツタ',     'もえるツタ',       'こおるツタ',       'やみのツタ'],
  darkbee:   ['ダークビー',       'シャドービー',     'ファントムビー',   'デスビー']
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
# C: ui.js
# ============================================================
up = os.path.join(BASE, 'js', 'ui.js')
print('[3] Reading', up)
with open(up, 'r', encoding='utf-8') as f:
    us = f.read()

# C1: displayName -> getVariantName
m1 = re.search(r"var displayName = ek\.name \+ \(lp > 0 \?.+?\);", us)
if m1:
    new_dn = "var displayName = (typeof getVariantName === 'function' && getVariantName(ek.shape, lp)) ? getVariantName(ek.shape, lp) : (ek.name + (lp > 0 ? ' [Loop ' + lp + ']' : ''));"
    us = us[:m1.start()] + new_dn + us[m1.end():]
    print('  C1: displayName OK')
else:
    print('  C1: WARN not found')

# C2: unknownName
m2 = re.search(r"var unknownName = .+?;", us)
if m2:
    new_un = "var unknownName = (lp > 0) ? '??? [Loop ' + lp + ']' : '???';"
    us = us[:m2.start()] + new_un + us[m2.end():]
    print('  C2: unknownName OK')
else:
    print('  C2: WARN not found')

# C3: weapon sprite rarity tint
old_ws = "drawSpriteImg(sprId, wx + 4, wy + 8, 48, 48);"
new_ws = "ctx.save();\n        var _wrf = (typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity || 'normal') : 'none';\n        if (_wrf !== 'none') ctx.filter = _wrf;\n        drawSpriteImg(sprId, wx + 4, wy + 8, 48, 48);\n        ctx.restore();"
if old_ws in us:
    us = us.replace(old_ws, new_ws, 1)
    print('  C3: weapon sprite tint OK')
else:
    print('  C3: WARN not found')

# C4: weapon name rarity color
old_wc = "ctx.fillStyle = w.color || '#fff'; ctx.font = 'bold 13px ' + F;"
new_wc = "ctx.fillStyle = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : (w.color || '#fff'); ctx.font = 'bold 13px ' + F;"
if old_wc in us:
    us = us.replace(old_wc, new_wc, 1)
    print('  C4: weapon name color OK')
else:
    print('  C4: WARN not found')

# C5: rarity badge
badge_a = "ctx.fillText('T2', wx + cardW - 20, wy + 14);\n      }\n      // Desc"
badge_n = "ctx.fillText('T2', wx + cardW - 20, wy + 14);\n      }\n      if (w.rarity && w.rarity !== 'normal' && typeof getRarityDef === 'function') {\n        var _rd = getRarityDef(w.rarity);\n        ctx.fillStyle = _rd.color; ctx.font = 'bold 10px ' + F;\n        ctx.fillText(_rd.name, wx + cardW - 22, wy + cardH - 6);\n      }\n      // Desc"
if badge_a in us:
    us = us.replace(badge_a, badge_n, 1)
    print('  C5: rarity badge OK')
else:
    print('  C5: WARN not found')

with open(up, 'w', encoding='utf-8') as f:
    f.write(us)
print('  ui.js:', len(us), 'bytes')

# ============================================================
# D: equip_ui.js
# ============================================================
ep = os.path.join(BASE, 'js', 'equip_ui.js')
print('[4] Reading', ep)
with open(ep, 'r', encoding='utf-8') as f:
    es = f.read()

old_es1 = "drawSpriteImg(spriteId, iconX, iconY, iconSize, iconSize);"
new_es1 = "ctx.save();\n          var _esf = (w.rarity && typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity) : 'none';\n          if (_esf !== 'none') ctx.filter = _esf;\n          drawSpriteImg(spriteId, iconX, iconY, iconSize, iconSize);\n          ctx.restore();"
if old_es1 in es:
    es = es.replace(old_es1, new_es1, 1)
    print('  D1: equip slot tint OK')
else:
    print('  D1: WARN not found')

old_es2 = "drawSpriteImg(sprId, icoX, icoY, icoSize, icoSize);"
new_es2 = "ctx.save();\n          var _elf = (w.rarity && typeof getRarityFilter === 'function') ? getRarityFilter(w.rarity) : 'none';\n          if (_elf !== 'none') ctx.filter = _elf;\n          drawSpriteImg(sprId, icoX, icoY, icoSize, icoSize);\n          ctx.restore();"
if old_es2 in es:
    es = es.replace(old_es2, new_es2, 1)
    print('  D2: equip list tint OK')
else:
    print('  D2: WARN not found')

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

old_pp = "ctx.fillStyle = _nameCol; ctx.font = \"bold 28px 'M PLUS Rounded 1c', sans-serif\"; ctx.textAlign = 'center';\n    ctx.fillText(weaponPopup.weapon.icon + ' ' + weaponPopup.weapon.name"
new_pp = "// Weapon sprite with rarity tint\n    var _wpSprId = 'weapon_' + weaponPopup.weapon.id;\n    if (typeof hasSprite === 'function' && hasSprite(_wpSprId)) {\n      ctx.save();\n      var _wprf = (typeof getRarityFilter === 'function') ? getRarityFilter(_wpR) : 'none';\n      if (_wprf !== 'none') ctx.filter = _wprf;\n      drawSpriteImg(_wpSprId, CW / 2 - 32, CH / 2 - 110, 64, 64);\n      ctx.restore();\n    }\n    ctx.fillStyle = _nameCol; ctx.font = \"bold 28px 'M PLUS Rounded 1c', sans-serif\"; ctx.textAlign = 'center';\n    ctx.fillText(weaponPopup.weapon.icon + ' ' + weaponPopup.weapon.name"
if old_pp in rns:
    rns = rns.replace(old_pp, new_pp, 1)
    print('  E: popup sprite OK')
else:
    print('  E: WARN popup not found')

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
    ('data.js',     'スライムベス'),
    ('data.js',     'キラーホーネット'),
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
