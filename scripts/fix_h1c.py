import pathlib

# --- equip_ui.js: Enable charm slot display ---
equip = pathlib.Path("js/equip_ui.js").read_text(encoding="utf-8")

# Replace the locked charm slot block with active charm display
old_charm = """} else if (i === 2) {
      // Charm slot (locked)
      ctx.save(); ctx.globalAlpha = 0.4;
      ctx.fillStyle = '#888'; ctx.font = '14px ' + F;
      ctx.fillText('  \\uD83D\\uDD2E \\u30C1\\u30E3\\u30FC\\u30E0 (???)', sx + 22, sy + slotH/2 + 5);
      ctx.restore();
      ctx.fillStyle = '#e056fd'; ctx.font = '10px ' + F; ctx.textAlign = 'right';
      ctx.fillText(slotLabels[i], sx + slotW - 8, sy + 14);
      ctx.textAlign = 'left';"""

new_charm = """} else if (i === 2) {
      // Charm slot (active)
      var ch = player.charm;
      if (ch) {
        ctx.fillStyle = '#fff'; ctx.font = '26px ' + F; ctx.textAlign = 'center';
        ctx.fillText(ch.icon || '\\uD83D\\uDD2E', sx + 42, sy + slotH/2 + 9);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#fff'; ctx.font = 'bold 15px ' + F;
        ctx.fillText(ch.name, sx + 68, sy + 22);
        ctx.fillStyle = '#e056fd'; ctx.font = '12px ' + F;
        var rarTxt = ch.rarity === 'legend' ? '\\u2605LEGEND' : ch.rarity === 'rare' ? '\\u2605RARE' : 'COMMON';
        ctx.fillText(rarTxt + '  ' + ch.desc, sx + 68, sy + 40);
      } else {
        ctx.save(); ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#888'; ctx.font = '14px ' + F;
        ctx.fillText('  \\uD83D\\uDD2E \\u30C1\\u30E3\\u30FC\\u30E0 (\\u672A\\u88C5\\u5099)', sx + 22, sy + slotH/2 + 5);
        ctx.restore();
      }
      ctx.fillStyle = '#e056fd'; ctx.font = '10px ' + F; ctx.textAlign = 'right';
      ctx.fillText(slotLabels[i], sx + slotW - 8, sy + 14);
      ctx.textAlign = 'left';"""

if old_charm in equip:
    equip = equip.replace(old_charm, new_charm)
    print("[OK] Charm slot display updated")
else:
    print("[WARN] Exact charm slot block not found, trying partial match...")
    if "Charm slot (locked)" in equip:
        # Find and replace between markers
        lines = equip.split("\n")
        new_lines = []
        skip = False
        for line in lines:
            if "Charm slot (locked)" in line:
                skip = True
                new_lines.append("      // Charm slot (active)")
                new_lines.append("      var ch = player.charm;")
                new_lines.append("      if (ch) {")
                new_lines.append("        ctx.fillStyle = '#fff'; ctx.font = '26px ' + F; ctx.textAlign = 'center';")
                new_lines.append("        ctx.fillText(ch.icon || '\\uD83D\\uDD2E', sx + 42, sy + slotH/2 + 9);")
                new_lines.append("        ctx.textAlign = 'left';")
                new_lines.append("        ctx.fillStyle = '#fff'; ctx.font = 'bold 15px ' + F;")
                new_lines.append("        ctx.fillText(ch.name, sx + 68, sy + 22);")
                new_lines.append("        ctx.fillStyle = '#e056fd'; ctx.font = '12px ' + F;")
                new_lines.append("        var rarTxt = ch.rarity === 'legend' ? '\\u2605LEGEND' : ch.rarity === 'rare' ? '\\u2605RARE' : 'COMMON';")
                new_lines.append("        ctx.fillText(rarTxt + '  ' + ch.desc, sx + 68, sy + 40);")
                new_lines.append("      } else {")
                new_lines.append("        ctx.save(); ctx.globalAlpha = 0.5;")
                new_lines.append("        ctx.fillStyle = '#888'; ctx.font = '14px ' + F;")
                new_lines.append("        ctx.fillText('  \\uD83D\\uDD2E \\u30C1\\u30E3\\u30FC\\u30E0 (\\u672A\\u88C5\\u5099)', sx + 22, sy + slotH/2 + 5);")
                new_lines.append("        ctx.restore();")
                new_lines.append("      }")
                new_lines.append("      ctx.fillStyle = '#e056fd'; ctx.font = '10px ' + F; ctx.textAlign = 'right';")
                new_lines.append("      ctx.fillText(slotLabels[i], sx + slotW - 8, sy + 14);")
                new_lines.append("      ctx.textAlign = 'left';")
                continue
            if skip:
                if "ctx.textAlign = 'left';" in line and "slotLabels" not in line:
                    skip = False
                continue
            new_lines.append(line)
        equip = "\n".join(new_lines)
        print("[OK] Charm slot updated via line-by-line")
    else:
        print("[FAIL] No charm slot block found")

# --- Also update getSlotWeapon to return charm info ---
old_get = "if (slotIdx === 2) return null; // charm: not yet"
new_get = "if (slotIdx === 2) return player.charm || null; // charm slot"
if old_get in equip:
    equip = equip.replace(old_get, new_get)
    print("[OK] getSlotWeapon returns charm")
else:
    print("[WARN] getSlotWeapon charm line not found")

# --- Update detail panel to show charm desc ---
# The detail panel at bottom shows selW.desc - charm has desc too, so it works.
# But upgrade button should be hidden for charms (no upgrade in Phase 1)
# The hint text should change for charm slot
old_hint_slot = "'\\u2191\\u2193:\\u30B9\\u30ED\\u30C3\\u30C8  \\u2192:\\u30EA\\u30B9\\u30C8\\u3078  Z:\\u5F37\\u5316  Tab:\\u3068\\u3058\\u308B'"
new_hint_slot = "equipCursor === 2 ? '\\u2191\\u2193:\\u30B9\\u30ED\\u30C3\\u30C8  Tab:\\u3068\\u3058\\u308B' : '\\u2191\\u2193:\\u30B9\\u30ED\\u30C3\\u30C8  \\u2192:\\u30EA\\u30B9\\u30C8\\u3078  Z:\\u5F37\\u5316  Tab:\\u3068\\u3058\\u308B'"
if old_hint_slot in equip:
    equip = equip.replace(old_hint_slot, new_hint_slot)
    print("[OK] Hint text updated for charm slot")
else:
    print("[WARN] Hint slot text not found")

pathlib.Path("js/equip_ui.js").write_text(equip, encoding="utf-8")

# --- update.js: Block right-arrow when charm slot selected (no list for charms) ---
update = pathlib.Path("js/update.js").read_text(encoding="utf-8")

old_right = "if (wasPressed('ArrowRight') || wasPressed('KeyD')) { if (allWeps.length > 0) { equipMode = 'list'; equipListCursor = 0; Audio.menu_move(); } }"
new_right = "if ((wasPressed('ArrowRight') || wasPressed('KeyD')) && equipCursor < 2) { if (allWeps.length > 0) { equipMode = 'list'; equipListCursor = 0; Audio.menu_move(); } }"
if old_right in update:
    update = update.replace(old_right, new_right)
    print("[OK] Blocked list mode for charm slot")
else:
    print("[WARN] Right arrow block pattern not found")

# Also block Z upgrade when charm slot selected
old_z = """if (wasPressed('KeyZ')) {
          const selW = getSlotWeapon(equipCursor);
          if (selW && upgradeWeapon(selW)) {"""
new_z = """if (wasPressed('KeyZ') && equipCursor < 2) {
          const selW = getSlotWeapon(equipCursor);
          if (selW && upgradeWeapon(selW)) {"""
if old_z in update:
    update = update.replace(old_z, new_z)
    print("[OK] Blocked upgrade for charm slot")
else:
    print("[WARN] Z upgrade block pattern not found")

pathlib.Path("js/update.js").write_text(update, encoding="utf-8")

print("[DONE] H-1c complete")
