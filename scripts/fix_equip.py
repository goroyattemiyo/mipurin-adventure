import re

# === Fix update.js ===
with open("js/update.js", encoding="utf-8") as f:
    code = f.read()

# Find the inventoryTab === 2 block (from "if (inventoryTab === 2)" to its matching "return;\n    }")
# We need to replace everything from "if (inventoryTab === 2) {" up to the return+close before the next "return;" at inventoryOpen level

# Strategy: find "if (inventoryTab === 2) {" and replace until the next standalone "return;\n    }\n    return;"
pattern = r'if \(inventoryTab === 2\) \{.*?\n    \}\n    return;'
match = re.search(pattern, code, re.DOTALL)
if match:
    old_block = match.group(0)
    print(f"[FOUND] inventoryTab===2 block: {len(old_block)} chars, lines {code[:match.start()].count(chr(10))+1}-{code[:match.end()].count(chr(10))+1}")
    
    new_block = '''if (inventoryTab === 2) {
      const allWeps = getAllOwnedWeapons();
      if (typeof equipMode === 'undefined') equipMode = 'slot';
      if (equipMode === 'slot') {
        if (wasPressed('ArrowUp') || wasPressed('KeyW')) { equipCursor = (equipCursor + 2) % 3; Audio.menu_move(); equipBounce = 1; }
        if (wasPressed('ArrowDown') || wasPressed('KeyS')) { equipCursor = (equipCursor + 1) % 3; Audio.menu_move(); equipBounce = 1; }
        if (wasPressed('ArrowRight') || wasPressed('KeyD')) { if (allWeps.length > 0) { equipMode = 'list'; equipListCursor = 0; Audio.menu_move(); } }
        if (wasPressed('KeyZ')) {
          const selW = getSlotWeapon(equipCursor);
          if (selW && upgradeWeapon(selW)) {
            Audio.level_up(); showFloat('\\u2B50 ' + selW.name + ' Lv.' + selW.level + ' \\u306B\\u5F37\\u5316\\uFF01', 2, MSG_COLORS.buff);
            if (equipCursor < 2 && equipCursor === player.weaponIdx) player.weapon = selW;
            equipBounce = 1;
          } else if (selW) { showFloat('\\u82B1\\u7C89\\u4E0D\\u8DB3\\u304B\\u6700\\u5927Lv', 1.5, MSG_COLORS.warn); }
        }
      } else if (equipMode === 'list') {
        if (wasPressed('ArrowUp') || wasPressed('KeyW')) { equipListCursor = (equipListCursor - 1 + allWeps.length) % allWeps.length; Audio.menu_move(); }
        if (wasPressed('ArrowDown') || wasPressed('KeyS')) { equipListCursor = (equipListCursor + 1) % allWeps.length; Audio.menu_move(); }
        if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { equipMode = 'slot'; Audio.menu_move(); }
        if (wasPressed('KeyZ')) {
          const entry = allWeps[equipListCursor];
          if (entry && upgradeWeapon(entry.w)) {
            Audio.level_up(); showFloat('\\u2B50 ' + entry.w.name + ' Lv.' + entry.w.level + ' \\u306B\\u5F37\\u5316\\uFF01', 2, MSG_COLORS.buff);
            if (entry.src === 'main' && player.weaponIdx === 0) player.weapon = entry.w;
            if (entry.src === 'sub' && player.weaponIdx === 1) player.weapon = entry.w;
            equipBounce = 1;
          } else if (entry) { showFloat('\\u82B1\\u7C89\\u4E0D\\u8DB3\\u304B\\u6700\\u5927Lv', 1.5, MSG_COLORS.warn); }
        }
        if (wasPressed('KeyX')) {
          if (equipCursor < 2 && allWeps[equipListCursor]) {
            const entry = allWeps[equipListCursor];
            const targetSlot = equipCursor;
            const currentInSlot = player.weapons[targetSlot];
            if (entry.src === 'main') player.weapons[0] = null;
            else if (entry.src === 'sub') player.weapons[1] = null;
            else player.backpack[entry.idx] = null;
            if (currentInSlot && currentInSlot !== entry.w) {
              if (entry.src === 'bp') { player.backpack[entry.idx] = currentInSlot; }
              else { const emptyBp = player.backpack.indexOf(null); if (emptyBp !== -1) player.backpack[emptyBp] = currentInSlot; }
            }
            player.weapons[targetSlot] = entry.w;
            player.weapon = player.weapons[player.weaponIdx] || player.weapons[1 - player.weaponIdx] || player.weapons[0];
            Audio.menu_select(); showFloat('\\u2694 \\u305D\\u3046\\u3073\\u3057\\u305F\\uFF01', 1.5, MSG_COLORS.info);
            equipMode = 'slot'; equipBounce = 1;
          }
        }
      }
      return;
    }
    return;'''
    
    code = code[:match.start()] + new_block + code[match.end():]
    print("[OK] update.js: equip block replaced")
else:
    print("[FAIL] Could not find inventoryTab===2 block")

# Also remove stale mouse.dragItem lines near Tab toggle
code = re.sub(r' mouse\.dragItem = null; mouse\.dragFrom = null;', '', code)
print(f"[OK] Removed {code.count('dragItem')} remaining dragItem refs (should be 0)")

with open("js/update.js", "w", encoding="utf-8") as f:
    f.write(code)

# === Fix touch.js ===
with open("js/touch.js", encoding="utf-8") as f:
    tcode = f.read()

# Remove D&D related code
tcode = tcode.replace("equipTouchStart = { x: pos.x, y: pos.y, time: Date.now(), slotIdx: slotHit };", "")
tcode = re.sub(r'let equipTouchStart.*?;', 'let equipTouchStart = { x:0, y:0, time:0, slotIdx:-1 };', tcode)

# Replace old slot touch with new (slot + list tap)
old_slot = '''var slotHit = hitTestEquipSlot(pos.x, pos.y);
        if (slotHit >= 0) {
          equipCursor = slotHit;
          if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
          return;
        }'''

new_slot = '''var slotHit = hitTestEquipSlot(pos.x, pos.y);
        if (slotHit >= 0) {
          equipCursor = slotHit; if (typeof equipMode !== 'undefined') equipMode = 'slot';
          if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
          return;
        }
        // List item tap (right pane)
        if (typeof getAllOwnedWeapons === 'function' && typeof equipMode !== 'undefined') {
          var allW = getAllOwnedWeapons();
          if (allW.length > 0) {
            var pW2 = CW - 160, pX2 = 80, pY2 = 110;
            var lW2 = Math.floor(pW2 * 0.45);
            var rX2 = pX2 + lW2 + 20, rY2 = pY2 + 95;
            var rW2 = pW2 - lW2 - 35, rH2 = 52;
            for (var li = 0; li < allW.length; li++) {
              var ry2 = rY2 + li * rH2;
              if (pos.x >= rX2 && pos.x <= rX2 + rW2 && pos.y >= ry2 && pos.y <= ry2 + rH2) {
                equipMode = 'list'; equipListCursor = li;
                if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
                return;
              }
            }
          }
        }'''

if old_slot in tcode:
    tcode = tcode.replace(old_slot, new_slot)
    print("[OK] touch.js: slot+list tap replaced")
else:
    # Try normalized
    old_norm = re.sub(r'\s+', ' ', old_slot)
    t_norm = re.sub(r'\s+', ' ', tcode)
    if old_norm in t_norm:
        print("[WARN] whitespace mismatch, trying line-by-line replacement")
    else:
        print("[WARN] Could not find old slot touch block, inserting after hitTestEquipSlot")
    # Fallback: insert list tap code after the existing slot hit block
    insert_after = "if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();\n          return;\n        }"
    list_tap_code = '''
        // List item tap (right pane)
        if (typeof getAllOwnedWeapons === 'function' && typeof equipMode !== 'undefined') {
          var allW = getAllOwnedWeapons();
          if (allW.length > 0) {
            var pW2 = CW - 160, pX2 = 80, pY2 = 110;
            var lW2 = Math.floor(pW2 * 0.45);
            var rX2 = pX2 + lW2 + 20, rY2 = pY2 + 95;
            var rW2 = pW2 - lW2 - 35, rH2 = 52;
            for (var li = 0; li < allW.length; li++) {
              var ry2 = rY2 + li * rH2;
              if (pos.x >= rX2 && pos.x <= rX2 + rW2 && pos.y >= ry2 && pos.y <= ry2 + rH2) {
                equipMode = 'list'; equipListCursor = li;
                if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
                return;
              }
            }
          }
        }'''
    # Find first occurrence inside inventoryTab === 2 section
    idx = tcode.find("equipCursor = slotHit;")
    if idx > 0:
        # Find the return; } after it
        ret_idx = tcode.find("return;\n        }", idx)
        if ret_idx > 0:
            insert_pos = ret_idx + len("return;\n        }")
            tcode = tcode[:insert_pos] + list_tap_code + tcode[insert_pos:]
            print("[OK] touch.js: list tap inserted after slot hit")

# Remove D&D drag in onTouchMove
tcode = re.sub(
    r'// Equipment drag\n.*?if \(equipTouchStart\.slotIdx >= 0.*?\}\n.*?\}\n.*?if \(mouse\.dragItem\).*?\}\n.*?continue;\n.*?\}',
    '// Equipment touch (no D&D)',
    tcode,
    flags=re.DOTALL
)

# Remove D&D drop in onTouchEnd  
tcode = re.sub(
    r'// Equipment drop\n.*?if \(mouse\.dragItem && mouse\.dragFrom.*?\}\n.*?equipTouchStart = .*?\}',
    '// Equipment touch end (no D&D)',
    tcode,
    flags=re.DOTALL
)

# Also set equipMode on slot tap
tcode = tcode.replace(
    "equipCursor = slotHit;\n          if (typeof Audio",
    "equipCursor = slotHit; if (typeof equipMode !== 'undefined') equipMode = 'slot';\n          if (typeof Audio"
)

with open("js/touch.js", "w", encoding="utf-8") as f:
    f.write(tcode)
print(f"[OK] touch.js saved, dragItem count: {tcode.count('dragItem')}")

print("\n=== Done ===")
