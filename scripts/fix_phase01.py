# fix_phase01.py - Phase 0+1: sprites, color variants, rarity system
import re

print("=== Phase 0+1 Unified Fix ===")

# ========== 1. systems.js - Tier2 weapon sprite aliases ==========
with open('js/systems.js', 'r', encoding='utf-8') as f:
    sys = f.read()

tier2_sprites = """  // Tier2 weapon sprites (alias to Tier1 until unique art)
  weapon_golden_needle: 'assets/sprites/weapon_needle.webp',
  weapon_amber_cannon: 'assets/sprites/weapon_honey_cannon.webp',
  weapon_holy_shield: 'assets/sprites/weapon_pollen_shield.webp',
  weapon_cursed_thorn: 'assets/sprites/weapon_vine_whip.webp',
  weapon_storm_wing: 'assets/sprites/weapon_feather_shuriken.webp',
  weapon_queen_true_staff: 'assets/sprites/weapon_queen_staff.webp',"""

if 'weapon_golden_needle' not in sys:
    sys = sys.replace(
        "weapon_queen_staff: 'assets/sprites/weapon_queen_staff.webp'",
        "weapon_queen_staff: 'assets/sprites/weapon_queen_staff.webp',\n" + tier2_sprites
    )
    print("[OK] Tier2 weapon sprite aliases added to SPRITE_MAP")
else:
    print("[SKIP] Tier2 aliases already exist")

with open('js/systems.js', 'w', encoding='utf-8') as f:
    f.write(sys)

# ========== 2. render.js - hue-rotate for loop color variants ==========
with open('js/render.js', 'r', encoding='utf-8') as f:
    rn = f.read()

# In drawEntity, after sprite drawing, apply hue-rotate for loop
old_sprite_draw = "drawSpriteImg(spriteId, -e.w / 2, -e.h / 2, e.w, e.h);"
new_sprite_draw = """var _lc = (typeof loopCount !== 'undefined') ? loopCount : 0;
    if (_lc > 0) ctx.filter = 'hue-rotate(' + (_lc * 30) + 'deg)';
    drawSpriteImg(spriteId, -e.w / 2, -e.h / 2, e.w, e.h);
    if (_lc > 0) ctx.filter = 'none';"""

if 'hue-rotate' not in rn and old_sprite_draw in rn:
    rn = rn.replace(old_sprite_draw, new_sprite_draw, 1)
    print("[OK] Enemy sprite hue-rotate for loop added")
else:
    print("[WARN] Enemy sprite hue-rotate: pattern not found or already exists")

# Same for boss sprite
old_boss_sprite = "drawSpriteImg(bossId, boss.x, boss.y + bob, boss.w, boss.h);"
new_boss_sprite = """var _blc = (typeof loopCount !== 'undefined') ? loopCount : 0;
    if (_blc > 0) ctx.filter = 'hue-rotate(' + (_blc * 30) + 'deg)';
    drawSpriteImg(bossId, boss.x, boss.y + bob, boss.w, boss.h);
    if (_blc > 0) ctx.filter = 'none';"""

if old_boss_sprite in rn:
    rn = rn.replace(old_boss_sprite, new_boss_sprite, 1)
    print("[OK] Boss sprite hue-rotate for loop added")

# Add weapon drop light pillar effect
old_weapon_drop = "ctx.fillText(weaponPopup.weapon.icon + ' ' + weaponPopup.weapon.name"
new_weapon_drop_block = """// Rarity light pillar
    var _wpR = weaponPopup.weapon.rarity || 'normal';
    var _pillarCol = _wpR === 'legend' ? '#e67e22' : _wpR === 'miracle' ? '#e056fd' : _wpR === 'great' ? '#ffd700' : _wpR === 'fine' ? '#87ceeb' : null;
    if (_pillarCol) {
      ctx.save();
      var _pa = 0.3 + Math.sin(Date.now() / 300) * 0.15;
      ctx.globalAlpha = _pa;
      var _pg = ctx.createLinearGradient(CW/2, 0, CW/2, CH);
      _pg.addColorStop(0, _pillarCol); _pg.addColorStop(0.5, 'transparent'); _pg.addColorStop(1, _pillarCol);
      ctx.fillStyle = _pg;
      ctx.fillRect(CW/2 - 30, 0, 60, CH);
      ctx.restore();
    }
    // Rarity name color
    var _nameCol = _wpR === 'legend' ? '#e67e22' : _wpR === 'miracle' ? '#e056fd' : _wpR === 'great' ? '#ffd700' : _wpR === 'fine' ? '#87ceeb' : '#fff';
    ctx.fillStyle = _nameCol; ctx.font = "bold 28px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
    ctx.fillText(weaponPopup.weapon.icon + ' ' + weaponPopup.weapon.name"""

if "Rarity light pillar" not in rn:
    rn = rn.replace(old_weapon_drop, new_weapon_drop_block)
    print("[OK] Weapon drop light pillar + rarity color added")
else:
    print("[SKIP] Light pillar already exists")

with open('js/render.js', 'w', encoding='utf-8') as f:
    f.write(rn)

# ========== 3. data.js - Rarity system for weapons ==========
with open('js/data.js', 'r', encoding='utf-8') as f:
    dat = f.read()

rarity_code = """
// === Weapon Rarity System (Phase 1) ===
const RARITY_DEFS = {
  normal:  { name: 'ふつう',   color: '#ffffff', weight: 50 },
  fine:    { name: 'きれい',   color: '#87ceeb', weight: 30 },
  great:   { name: 'すてき',   color: '#ffd700', weight: 15 },
  miracle: { name: 'きせき',   color: '#e056fd', weight: 4 },
  legend:  { name: 'でんせつ', color: '#e67e22', weight: 1 }
};

function rollRarity(floorNum) {
  var bonus = Math.min(floorNum * 0.5, 8);
  var weights = {};
  var keys = Object.keys(RARITY_DEFS);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    weights[k] = RARITY_DEFS[k].weight;
    if (k !== 'normal') weights[k] += bonus;
  }
  var total = 0;
  for (var j = 0; j < keys.length; j++) total += weights[keys[j]];
  var roll = Math.random() * total;
  var acc = 0;
  for (var m = 0; m < keys.length; m++) {
    acc += weights[keys[m]];
    if (roll < acc) return keys[m];
  }
  return 'normal';
}

function getRarityDef(r) { return RARITY_DEFS[r] || RARITY_DEFS.normal; }
// === End Rarity System ===
"""

if 'RARITY_DEFS' not in dat:
    # Insert before CONSUMABLE_DEFS
    dat = dat.replace("// ===== CONSUMABLES =====", rarity_code + "\n// ===== CONSUMABLES =====")
    print("[OK] Rarity system added to data.js")
else:
    print("[SKIP] Rarity system already exists")

with open('js/data.js', 'w', encoding='utf-8') as f:
    f.write(dat)

# ========== 4. enemies.js - Apply rarity to weapon drops ==========
with open('js/enemies.js', 'r', encoding='utf-8') as f:
    en = f.read()

# No changes needed to enemies.js for now - rarity is applied in systems.js weapon drop

# ========== 5. systems.js - Apply rarity on weapon drop ==========
with open('js/systems.js', 'r', encoding='utf-8') as f:
    sys = f.read()

# Find weapon drop in shop (buildShop) and add rarity
old_shop_weapon = "player.weapons[player.weaponIdx] = initWeapon({...wep}); player.weapon = player.weapons[player.weaponIdx];"
new_shop_weapon = """var _sw = initWeapon({...wep});
      _sw.rarity = (typeof rollRarity === 'function') ? rollRarity(floor) : 'normal';
      player.weapons[player.weaponIdx] = _sw; player.weapon = _sw;"""

if '_sw.rarity' not in sys and old_shop_weapon in sys:
    sys = sys.replace(old_shop_weapon, new_shop_weapon)
    print("[OK] Shop weapon rarity roll added")

with open('js/systems.js', 'w', encoding='utf-8') as f:
    f.write(sys)

# ========== 6. update.js - Apply rarity on weapon popup drop ==========
with open('js/update.js', 'r', encoding='utf-8') as f:
    upd = f.read()

# weaponDrop Z key - add rarity to picked weapon
old_wdrop_z = "const w = {...weaponPopup.weapon};"
new_wdrop_z = """const w = {...weaponPopup.weapon};
    if (!w.rarity && typeof rollRarity === 'function') w.rarity = rollRarity(floor);"""

if "w.rarity" not in upd and old_wdrop_z in upd:
    upd = upd.replace(old_wdrop_z, new_wdrop_z, 1)
    print("[OK] Weapon drop rarity assignment added (Z key)")

# Also for Q key
old_wdrop_q_line = "const w = {...weaponPopup.weapon};\n    if (weaponPopup.sparkle) w.dmgMul = (w.dmgMul || 1) + 0.2;\n    const subIdx"
# More reliable: find the second occurrence
count = upd.count("const w = {...weaponPopup.weapon};")
if count >= 2:
    # Already handled first, second is Q key - it's the same pattern
    # The first replace only did count=1, so second is still original
    idx1 = upd.index("const w = {...weaponPopup.weapon};")
    idx2 = upd.index("const w = {...weaponPopup.weapon};", idx1 + 1)
    # Check if rarity already added to second
    snippet_after = upd[idx2:idx2+200]
    if "w.rarity" not in snippet_after:
        upd = upd[:idx2] + "const w = {...weaponPopup.weapon};\n    if (!w.rarity && typeof rollRarity === 'function') w.rarity = rollRarity(floor);" + upd[idx2 + len("const w = {...weaponPopup.weapon};"):]
        print("[OK] Weapon drop rarity assignment added (Q key)")

with open('js/update.js', 'w', encoding='utf-8') as f:
    f.write(upd)

# ========== 7. ui.js - Full collection tab rewrite + rarity colors ==========
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui = f.read()

# 7a. drawCollectionTab - complete replacement with sprites + completion bar
new_collection = '''function drawCollectionTab() {
  var F = "'M PLUS Rounded 1c', sans-serif";
  // === Sub-tab header ===
  var subTabs = ['いきもの', 'ぶき'];
  for (var si = 0; si < subTabs.length; si++) {
    var stx = 200 + si * 180, sty = 120;
    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#ffd700' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(stx - 60, sty - 16, 120, 32);
    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#000' : '#ccc';
    ctx.font = "bold 18px " + F; ctx.textAlign = 'center';
    ctx.fillText(subTabs[si], stx, sty + 6);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "14px " + F; ctx.textAlign = 'center';
  ctx.fillText('\\u2190\\u2192: \\u30b5\\u30d6\\u30bf\\u30d6\\u5207\\u66ff', 290, 155);
  ctx.textAlign = 'left';

  if (typeof collectionSubTab !== 'undefined' && collectionSubTab === 1) {
    drawWeaponCollection();
    return;
  }
  // === Enemy collection (sub-tab 0) ===
  var allKeys = Object.keys(typeof ENEMY_DEFS !== 'undefined' ? ENEMY_DEFS : {});
  var totalE = allKeys.length;
  var ownedE = 0;
  for (var ei = 0; ei < allKeys.length; ei++) {
    var eDef = ENEMY_DEFS[allKeys[ei]];
    if (typeof collection !== 'undefined' && collection[eDef.name] && collection[eDef.name].seen > 0) ownedE++;
  }

  // Title + completion bar
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 22px " + F;
  ctx.fillText('\\ud83c\\udf38 \\u82b1\\u306e\\u56fd\\u306e\\u3044\\u304d\\u3082\\u306e\\u56f3\\u9451', 120, 185);
  ctx.fillStyle = '#555'; ctx.fillRect(120, 195, 400, 14);
  ctx.fillStyle = '#ffd700'; ctx.fillRect(120, 195, 400 * (ownedE / Math.max(1, totalE)), 14);
  ctx.fillStyle = '#fff'; ctx.font = "bold 11px " + F; ctx.textAlign = 'center';
  ctx.fillText(ownedE + ' / ' + totalE + ' (' + Math.floor(ownedE / Math.max(1, totalE) * 100) + '%)', 320, 206);
  ctx.textAlign = 'left';

  if (ownedE === 0) {
    ctx.fillStyle = '#888'; ctx.font = "20px " + F;
    ctx.fillText('\\u307e\\u3060\\u8ab0\\u306b\\u3082\\u4f1a\\u3063\\u3066\\u3044\\u306a\\u3044\\u3088\\u2026\\u5192\\u967a\\u306b\\u51fa\\u304b\\u3051\\u3088\\u3046\\uff01', 140, 250);
    return;
  }

  // Enemy rows with sprites
  var rowH = 64, startY = 222;
  for (var i = 0; i < allKeys.length; i++) {
    var ek = allKeys[i];
    var eDef = ENEMY_DEFS[ek];
    var ey = startY + i * rowH;
    if (ey > CH - 100) break;
    var col = (typeof collection !== 'undefined' && collection[eDef.name]) ? collection[eDef.name] : null;
    var hasSeen = col && col.seen > 0;
    var hasKill = col && col.defeated > 0;

    // Row bg
    ctx.fillStyle = (i % 2 === 0) ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)';
    ctx.fillRect(120, ey - 8, CW - 260, rowH - 4);

    // Sprite (48px) or silhouette
    var sprX = 130, sprY = ey - 2, sprS = 48;
    if (typeof hasSprite === 'function' && hasSprite(ek)) {
      ctx.save();
      if (!hasSeen) {
        ctx.filter = 'brightness(0)';
      }
      drawSpriteImg(ek, sprX, sprY, sprS, sprS);
      // Loop color variant preview (small icons)
      var _tc = (typeof totalClears !== 'undefined') ? totalClears : 0;
      var _maxPreview = Math.min(Math.floor(_tc), 3);
      if (hasSeen && _maxPreview > 0) {
        for (var lp = 1; lp <= _maxPreview; lp++) {
          ctx.filter = 'hue-rotate(' + (lp * 30) + 'deg)';
          drawSpriteImg(ek, sprX + sprS + 2 + (lp - 1) * 28, sprY + 24, 24, 24);
        }
      }
      ctx.filter = 'none';
      ctx.restore();
    } else {
      ctx.fillStyle = hasSeen ? (eDef.color || '#fff') : '#333';
      ctx.font = '28px ' + F; ctx.textAlign = 'center';
      ctx.fillText(hasSeen ? '?' : '?', sprX + sprS / 2, sprY + sprS / 2 + 8);
      ctx.textAlign = 'left';
    }

    // Name + stats
    var textX = sprX + sprS + (_tc > 0 && hasSeen ? Math.min(Math.floor(_tc), 3) * 28 + 10 : 10);
    if (hasSeen) {
      ctx.fillStyle = eDef.color || '#fff'; ctx.font = "bold 17px " + F;
      ctx.fillText(eDef.name, textX, ey + 12);
      ctx.fillStyle = '#ccc'; ctx.font = "14px " + F;
      ctx.fillText('\\u906d\\u9047: ' + col.seen + '  \\u6483\\u7834: ' + col.defeated, textX + 200, ey + 12);
      if (hasKill && eDef.lore) {
        ctx.fillStyle = '#999'; ctx.font = "13px " + F;
        var loreShort = eDef.lore.length > 30 ? eDef.lore.slice(0, 30) + '...' : eDef.lore;
        ctx.fillText(loreShort, textX, ey + 32);
      } else if (!hasKill) {
        ctx.fillStyle = '#666'; ctx.font = "13px " + F;
        ctx.fillText('??? (\\u5012\\u3059\\u3068\\u60c5\\u5831\\u89e3\\u653e)', textX, ey + 32);
      }
    } else {
      ctx.fillStyle = '#555'; ctx.font = "bold 17px " + F;
      ctx.fillText('??? \\u307e\\u3060\\u3067\\u3042\\u3063\\u3066\\u3044\\u306a\\u3044', textX, ey + 12);
    }
  }
}'''

# Replace existing drawCollectionTab
pattern = r'function drawCollectionTab\(\)\s*\{.*?\n\}'
if re.search(pattern, ui, re.DOTALL):
    ui = re.sub(pattern, new_collection, ui, count=1, flags=re.DOTALL)
    print("[OK] drawCollectionTab replaced with sprite+bar version")
else:
    print("[FAIL] Could not find drawCollectionTab to replace")

# 7b. drawWeaponCollection - add rarity color to owned weapon names
old_wc_name = "ctx.fillStyle = w.color || '#fff'; ctx.font = 'bold 13px ' + F;"
new_wc_name = """var _wRarCol = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : (w.color || '#fff');
      ctx.fillStyle = _wRarCol; ctx.font = 'bold 13px ' + F;"""

if '_wRarCol' not in ui:
    ui = ui.replace(old_wc_name, new_wc_name)
    print("[OK] Weapon collection rarity color added")

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui)

# ========== 8. equip_ui.js - Rarity color in equip weapon list ==========
with open('js/equip_ui.js', 'r', encoding='utf-8') as f:
    eq = f.read()

# Weapon name in list: add rarity color
old_eq_name = "ctx.fillStyle = '#fff'; ctx.font = 'bold 14px ' + F;\n    ctx.fillText(w.name, rightX + 52, ry + 18);"
new_eq_name = """var _eqRarCol = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : '#fff';
    ctx.fillStyle = _eqRarCol; ctx.font = 'bold 14px ' + F;
    ctx.fillText(w.name + (w.rarity && w.rarity !== 'normal' && typeof getRarityDef === 'function' ? ' [' + getRarityDef(w.rarity).name + ']' : ''), rightX + 52, ry + 18);"""

if '_eqRarCol' not in eq and old_eq_name in eq:
    eq = eq.replace(old_eq_name, new_eq_name)
    print("[OK] Equip UI rarity color added")
else:
    print("[WARN] Equip UI name pattern not matched")

# Also for left pane slot weapon name
old_slot_name = "ctx.fillStyle = '#fff'; ctx.font = 'bold 15px ' + F;\n      ctx.fillText(w.name, sx + 68, sy + 22);"
new_slot_name = """var _slotRarCol = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : '#fff';
      ctx.fillStyle = _slotRarCol; ctx.font = 'bold 15px ' + F;
      ctx.fillText(w.name, sx + 68, sy + 22);"""

if '_slotRarCol' not in eq and old_slot_name in eq:
    eq = eq.replace(old_slot_name, new_slot_name)
    print("[OK] Equip slot rarity color added")

with open('js/equip_ui.js', 'w', encoding='utf-8') as f:
    f.write(eq)

# ========== 9. combat.js - Apply rarity to enemy weapon drops ==========
with open('js/combat.js', 'r', encoding='utf-8') as f:
    cmb = f.read()

# Find weapon drop spawn and add rarity
if 'weaponPopup' in cmb and '.rarity' not in cmb:
    # Add rarity to weaponPopup weapon
    cmb = cmb.replace(
        'weaponPopup.active = true;',
        'if (typeof rollRarity === "function") weaponPopup.weapon.rarity = rollRarity(floor);\n      weaponPopup.active = true;'
    )
    print("[OK] Combat weapon drop rarity added")
else:
    print("[SKIP/WARN] combat.js weaponPopup rarity")

with open('js/combat.js', 'w', encoding='utf-8') as f:
    f.write(cmb)

# ========== DONE ==========
print("\n=== Phase 0+1 Complete ===")
print("Phase 0: Enemy sprites in collection, completion bar, hue-rotate color variants")
print("Phase 1: Rarity system (5 tiers), drop light pillar, rarity colors in UI")
