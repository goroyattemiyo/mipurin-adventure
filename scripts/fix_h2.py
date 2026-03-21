import pathlib

# === H-2a: EVOLUTION_MAP + evolveWeapon() in data.js ===
data = pathlib.Path("js/data.js").read_text(encoding="utf-8")

if "EVOLUTION_MAP" not in data:
    # Insert after WEAPON_UPGRADE section (after upgradeWeapon function)
    marker = "// === End Weapon Upgrade ==="
    if marker in data:
        evo_code = """
// === Weapon Evolution (Sprint H-2) ===
const EVOLUTION_MAP = {
  needle:           { to: 'golden_needle',    cost: 100 },
  honey_cannon:     { to: 'amber_cannon',     cost: 100 },
  pollen_shield:    { to: 'holy_shield',      cost: 120 },
  vine_whip:        { to: 'cursed_thorn',     cost: 120 },
  feather_shuriken: { to: 'storm_wing',       cost: 120 },
  queen_staff:      { to: 'queen_true_staff', cost: 150 }
};
const WEAPON_UPGRADE_COST_T2 = [30, 60, 100];

function canEvolve(w) {
  if (!w || w.level < WEAPON_UPGRADE_MAX) return false;
  if (w.tier === 2) return false;
  var evo = EVOLUTION_MAP[w.id];
  if (!evo) return false;
  return pollen >= evo.cost;
}

function getEvoCost(w) {
  if (!w) return -1;
  var evo = EVOLUTION_MAP[w.id];
  return evo ? evo.cost : -1;
}

function evolveWeapon(w) {
  if (!canEvolve(w)) return null;
  var evo = EVOLUTION_MAP[w.id];
  var t2def = WEAPON_DEFS.find(function(d) { return d.id === evo.to; });
  if (!t2def) return null;
  pollen -= evo.cost;
  var evolved = initWeapon({...t2def});
  evolved.level = 0;
  evolved._baseDmgMul = t2def.dmgMul;
  evolved._baseSpeed = t2def.speed;
  evolved._baseRange = t2def.range;
  if (typeof weaponCollection !== 'undefined') { weaponCollection.add(evolved.id); saveCollection(); }
  return evolved;
}

function getUpgradeCost(w) {
  if (!w || w.level >= WEAPON_UPGRADE_MAX) return -1;
  return (w.tier === 2) ? WEAPON_UPGRADE_COST_T2[w.level] : WEAPON_UPGRADE_COST[w.level];
}
// === End Weapon Evolution ===
"""
        data = data.replace(marker, marker + evo_code)
        # Also patch upgradeWeapon to use tier-aware cost
        data = data.replace(
            "const cost = WEAPON_UPGRADE_COST[w.level];",
            "const cost = (typeof getUpgradeCost === 'function') ? getUpgradeCost(w) : WEAPON_UPGRADE_COST[w.level]; if (cost < 0) return false;"
        )
        pathlib.Path("js/data.js").write_text(data, encoding="utf-8")
        print("[OK] EVOLUTION_MAP + evolveWeapon added to data.js")
    else:
        print("[FAIL] End Weapon Upgrade marker not found")
else:
    print("[SKIP] EVOLUTION_MAP already exists")

# === H-2b: Evolution button in equip UI ===
equip = pathlib.Path("js/equip_ui.js").read_text(encoding="utf-8")

if "canEvolve" not in equip:
    # In the left pane slot drawing, after upgrade cost display in list,
    # add evolution indicator. Actually, add to the detail/hint area.
    # Find the upgrade cost display in the list pane
    old_list_upgrade = """if (listSel && lvl < WEAPON_UPGRADE_MAX) {
      const cost = WEAPON_UPGRADE_COST[lvl]; const ok = pollen >= cost;
      ctx.fillStyle = ok ? '#2ecc71' : '#e74c3c'; ctx.font = 'bold 11px ' + F;
      ctx.fillText('Z:\\u5F37\\u5316(' + cost + '\\uD83C\\uDF3C)', rightX + rightW - 10, ry + rowH - 10);
    } else if (listSel && lvl >= WEAPON_UPGRADE_MAX) {
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px ' + F;
      ctx.fillText('\\u2728MAX', rightX + rightW - 10, ry + rowH - 10);
    }"""

    new_list_upgrade = """if (listSel && lvl < WEAPON_UPGRADE_MAX) {
      var ucost = (typeof getUpgradeCost === 'function') ? getUpgradeCost(w) : WEAPON_UPGRADE_COST[lvl];
      var uok = pollen >= ucost;
      ctx.fillStyle = uok ? '#2ecc71' : '#e74c3c'; ctx.font = 'bold 11px ' + F;
      ctx.fillText('Z:\\u5F37\\u5316(' + ucost + '\\uD83C\\uDF3C)', rightX + rightW - 10, ry + rowH - 10);
    } else if (listSel && lvl >= WEAPON_UPGRADE_MAX && typeof canEvolve === 'function' && canEvolve(w)) {
      var ecost = getEvoCost(w);
      ctx.fillStyle = '#e056fd'; ctx.font = 'bold 11px ' + F;
      ctx.fillText('Z:\\u2728\\u3057\\u3093\\u304B(' + ecost + '\\uD83C\\uDF3C)', rightX + rightW - 10, ry + rowH - 10);
    } else if (listSel && lvl >= WEAPON_UPGRADE_MAX && typeof EVOLUTION_MAP !== 'undefined' && EVOLUTION_MAP[w.id]) {
      var ecost2 = getEvoCost(w);
      ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 11px ' + F;
      ctx.fillText('\\u2728\\u3057\\u3093\\u304B(' + ecost2 + '\\uD83C\\uDF3C)', rightX + rightW - 10, ry + rowH - 10);
    } else if (listSel && lvl >= WEAPON_UPGRADE_MAX) {
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px ' + F;
      ctx.fillText((w.tier === 2) ? '\\u2728T2 MAX' : '\\u2728MAX', rightX + rightW - 10, ry + rowH - 10);
    }"""

    if old_list_upgrade in equip:
        equip = equip.replace(old_list_upgrade, new_list_upgrade)
        print("[OK] Evolution button added to list pane")
    else:
        print("[WARN] List upgrade block not found exactly")

    pathlib.Path("js/equip_ui.js").write_text(equip, encoding="utf-8")
else:
    print("[SKIP] canEvolve already in equip_ui.js")

# === H-2b: Evolution logic in update.js (Z key in list mode) ===
update = pathlib.Path("js/update.js").read_text(encoding="utf-8")

if "evolveWeapon" not in update:
    # Find the Z key upgrade in list mode and add evolution fallback
    old_z_list = """if (wasPressed('KeyZ')) {
          const entry = allWeps[equipListCursor];
          if (entry && upgradeWeapon(entry.w)) {"""

    new_z_list = """if (wasPressed('KeyZ')) {
          const entry = allWeps[equipListCursor];
          if (entry && entry.w && typeof canEvolve === 'function' && canEvolve(entry.w)) {
            var evolved = evolveWeapon(entry.w);
            if (evolved) {
              if (entry.src === 'main') { player.weapons[0] = evolved; if (player.weaponIdx === 0) player.weapon = evolved; }
              else if (entry.src === 'sub') { player.weapons[1] = evolved; if (player.weaponIdx === 1) player.weapon = evolved; }
              else { player.backpack[entry.idx] = evolved; }
              Audio.level_up(); showFloat('\\u2728 ' + evolved.name + ' \\u306B\\u3057\\u3093\\u304B\\uFF01', 2.5, MSG_COLORS.buff);
              equipBounce = 1;
            }
          } else if (entry && upgradeWeapon(entry.w)) {"""

    if old_z_list in update:
        update = update.replace(old_z_list, new_z_list)
        # Need to add closing brace for the new if block
        # The original code after upgradeWeapon has the else block
        # We need to close the outer if properly - it should work since
        # the else-if chains naturally
        print("[OK] Evolution logic added to update.js list mode")
    else:
        print("[WARN] Z list upgrade pattern not found")

    pathlib.Path("js/update.js").write_text(update, encoding="utf-8")
else:
    print("[SKIP] evolveWeapon already in update.js")

print("[DONE] H-2a + H-2b complete")
