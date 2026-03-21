import pathlib

# --- update.js: Add charmDrop handling after weaponDrop block ---
update = pathlib.Path("js/update.js").read_text(encoding="utf-8")

# Find the end of weaponDrop block to insert charmDrop after it
charm_state = """
    if (gameState === 'charmDrop' && charmPopup.active) {
      if (wasPressed('KeyZ')) {
        player.charm = {...charmPopup.charm};
        if (typeof charmCollection !== 'undefined') { charmCollection.add(charmPopup.charm.id); saveCharmCollection(); }
        Audio.level_up();
        showFloat(charmPopup.charm.icon + ' ' + charmPopup.charm.name + ' \u305d\u3046\u3073\uff01', 2.5, MSG_COLORS.buff);
        charmPopup.active = false; gameState = 'playing';
      }
      if (wasPressed('KeyX')) {
        Audio.menu_move();
        showFloat('\u898b\u9001\u3063\u305f\u2026', 1.5, MSG_COLORS.info);
        charmPopup.active = false; gameState = 'playing';
      }
      return;
    }
"""

# Insert before the "// === Combat" line
marker = "// === Combat (split to combat.js) ==="
if marker in update and "charmDrop" not in update:
    update = update.replace(marker, charm_state + "\n  " + marker)
    print("[OK] charmDrop state added to update.js")
else:
    if "charmDrop" in update:
        print("[SKIP] charmDrop already in update.js")
    else:
        print("[FAIL] Could not find combat marker in update.js")

pathlib.Path("js/update.js").write_text(update, encoding="utf-8")

# --- systems.js: Add charm drop trigger in floorClear / blessing flow ---
systems = pathlib.Path("js/systems.js").read_text(encoding="utf-8")

# Add charmPopup variable near weaponPopup area (in game.js actually)
# We need it accessible, add to charms.js instead

# --- charms.js: Add charmPopup and trigger function ---
charms = pathlib.Path("js/charms.js").read_text(encoding="utf-8")

if "charmPopup" not in charms:
    charms += """

// === Charm Popup (drop screen) ===
let charmPopup = { active: false, charm: null };

// Trigger charm drop after floor clear (call from update.js floorClear)
function tryCharmDrop(fl) {
  if (fl < 3) return false;
  var chance = fl >= 12 ? 0.12 : fl >= 9 ? 0.08 : 0.05;
  if (Math.random() > chance) return false;
  var charm = rollCharmDrop(fl);
  if (!charm) return false;
  charmPopup = { active: true, charm: charm };
  return true;
}
"""
    pathlib.Path("js/charms.js").write_text(charms, encoding="utf-8")
    print("[OK] charmPopup + tryCharmDrop added to charms.js")
else:
    print("[SKIP] charmPopup already in charms.js")

# --- update.js: Hook charm drop into floorClear flow ---
# After blessingChoices are set but before gameState = 'blessing',
# check for charm drop. Actually better: after blessing is chosen,
# before nextFloor(), try charm drop.
# Simplest: in the blessing selection, after apply(), check charm.
# But cleanest: add to floorClear transition.

# Find where floor clear triggers blessing
update2 = pathlib.Path("js/update.js").read_text(encoding="utf-8")

# We hook into the blessing choice acceptance (after chosenB.apply())
old_blessing = "nextFloor(); }"
new_blessing = """if (typeof tryCharmDrop === 'function' && tryCharmDrop(floor)) { gameState = 'charmDrop'; } else { nextFloor(); } }"""

if "tryCharmDrop" not in update2 and old_blessing in update2:
    update2 = update2.replace(old_blessing, new_blessing, 1)
    print("[OK] Charm drop hook added after blessing choice")
elif "tryCharmDrop" in update2:
    print("[SKIP] tryCharmDrop already hooked")
else:
    print("[WARN] Could not find blessing nextFloor hook")

pathlib.Path("js/update.js").write_text(update2, encoding="utf-8")

# --- render.js or equip_ui.js: Draw charm drop screen ---
# Add to equip_ui.js since it handles equipment UI
equip = pathlib.Path("js/equip_ui.js").read_text(encoding="utf-8")

if "drawCharmDrop" not in equip:
    equip += """

// === Charm Drop Screen ===
function drawCharmDrop() {
  if (!charmPopup || !charmPopup.active) return;
  var F = "'M PLUS Rounded 1c', sans-serif";
  var c = charmPopup.charm;

  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, CW, CH);

  // Card
  var cx = CW/2, cy = CH/2;
  var cw = 360, ch = 320;

  // Rarity glow
  var glowCol = c.rarity === 'legend' ? '#ffd700' : c.rarity === 'rare' ? '#3498db' : '#aaa';
  ctx.save(); ctx.globalAlpha = 0.15;
  ctx.fillStyle = glowCol;
  ctx.beginPath(); ctx.arc(cx, cy - 20, 140, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Card bg (purple tint for charms)
  ctx.fillStyle = 'rgba(60, 20, 80, 0.95)';
  ctx.beginPath();
  var r = 16, x0 = cx - cw/2, y0 = cy - ch/2;
  ctx.moveTo(x0+r, y0); ctx.lineTo(x0+cw-r, y0); ctx.arcTo(x0+cw, y0, x0+cw, y0+r, r);
  ctx.lineTo(x0+cw, y0+ch-r); ctx.arcTo(x0+cw, y0+ch, x0+cw-r, y0+ch, r);
  ctx.lineTo(x0+r, y0+ch); ctx.arcTo(x0, y0+ch, x0, y0+ch-r, r);
  ctx.lineTo(x0, y0+r); ctx.arcTo(x0, y0, x0+r, y0, r);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = glowCol; ctx.lineWidth = 3; ctx.stroke();

  // Title
  ctx.fillStyle = '#e056fd'; ctx.font = 'bold 22px ' + F; ctx.textAlign = 'center';
  ctx.fillText('\\uD83D\\uDD2E \\u30C1\\u30E3\\u30FC\\u30E0\\u767A\\u898B\\uFF01', cx, y0 + 35);

  // Icon
  ctx.font = '64px ' + F;
  ctx.fillText(c.icon, cx, cy - 30);

  // Name
  ctx.fillStyle = '#fff'; ctx.font = 'bold 20px ' + F;
  ctx.fillText(c.name, cx, cy + 20);

  // Rarity
  ctx.fillStyle = glowCol; ctx.font = '16px ' + F;
  ctx.fillText(c.rarity ? c.rarity.toUpperCase() : 'COMMON', cx, cy + 45);

  // Description
  ctx.fillStyle = '#ccc'; ctx.font = '16px ' + F;
  ctx.fillText(c.desc, cx, cy + 72);

  // Current charm comparison
  if (player.charm) {
    ctx.fillStyle = '#f8bbd0'; ctx.font = '14px ' + F;
    ctx.fillText('\\u73FE\\u5728: ' + player.charm.icon + ' ' + player.charm.name, cx, cy + 100);
    ctx.fillStyle = '#ffab91'; ctx.font = '12px ' + F;
    ctx.fillText('\\u2192 \\u4E0A\\u66F8\\u304D\\u3055\\u308C\\u307E\\u3059', cx, cy + 118);
  }

  // Controls
  ctx.fillStyle = '#ffd700'; ctx.font = 'bold 18px ' + F;
  ctx.fillText('Z: \\u305D\\u3046\\u3073\\u3059\\u308B', cx, y0 + ch - 45);
  ctx.fillStyle = '#aaa'; ctx.font = '16px ' + F;
  ctx.fillText('X: \\u898B\\u9001\\u308B', cx, y0 + ch - 20);

  ctx.textAlign = 'left';
}
"""
    pathlib.Path("js/equip_ui.js").write_text(equip, encoding="utf-8")
    print("[OK] drawCharmDrop added to equip_ui.js")
else:
    print("[SKIP] drawCharmDrop already exists")

# --- render.js: Call drawCharmDrop in render loop ---
render = pathlib.Path("js/render.js").read_text(encoding="utf-8")

if "drawCharmDrop" not in render:
    # Find where drawWeaponDrop or similar is called, or add near end
    if "weaponDrop" in render:
        # Add charmDrop draw near weaponDrop draw
        render = render.replace(
            "if (gameState === 'weaponDrop'",
            "if (gameState === 'charmDrop' && typeof drawCharmDrop === 'function') drawCharmDrop();\n  if (gameState === 'weaponDrop'"
        )
        print("[OK] drawCharmDrop call added to render.js")
    else:
        print("[WARN] No weaponDrop in render.js, searching alternative...")
        # Add before final closing
        render = render.rstrip()
        if render.endswith("}"):
            render = render[:-1] + "\n  if (gameState === 'charmDrop' && typeof drawCharmDrop === 'function') drawCharmDrop();\n}"
            print("[OK] drawCharmDrop added at end of render.js")
        else:
            print("[FAIL] Could not add to render.js")

    pathlib.Path("js/render.js").write_text(render, encoding="utf-8")
else:
    print("[SKIP] drawCharmDrop already in render.js")

print("[DONE] H-1b complete")
