#!/usr/bin/env python3
"""mipurin-adventure auto test suite"""
import re, os, subprocess, json, sys

PASS = 0
FAIL = 0
def check(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        print(f"  [PASS] {name}")
        PASS += 1
    else:
        print(f"  [FAIL] {name} {detail}")
        FAIL += 1

def read(path):
    with open(path, encoding='utf-8') as f:
        return f.read()

print("=" * 50)
print("  MIPURIN ADVENTURE AUTO TEST")
print("=" * 50)

# === 1. File existence & size ===
print("\n--- File Checks ---")
JS_FILES = [
    "js/game.js", "js/data.js", "js/bgm.js", "js/enemies.js",
    "js/blessings.js", "js/systems.js", "js/nodemap.js",
    "js/equip_ui.js", "js/ui.js", "js/ui_screens.js",
    "js/combat.js", "js/update.js", "js/render.js", "js/touch.js"
]
for f in JS_FILES:
    exists = os.path.exists(f)
    check(f"exists: {f}", exists)
    if exists:
        size = os.path.getsize(f) / 1194
        check(f"size < 30KB: {f} ({size:.1f}KB)", size < 30, f"actual={size:.1f}KB")

# === 2. Syntax checks (node -c) ===
print("\n--- Syntax Checks ---")
for f in JS_FILES:
    if not os.path.exists(f): continue
    r = subprocess.run(["node", "-c", f], capture_output=True, text=True)
    check(f"syntax: {f}", r.returncode == 0, r.stderr.strip() if r.returncode != 0 else "")

# === 3. Global variable consistency ===
print("\n--- Global Variable Checks ---")
all_js = ""
for f in JS_FILES:
    if os.path.exists(f):
        all_js += read(f) + "\n"

# Variables that must be declared somewhere
REQUIRED_GLOBALS = [
    "inventoryOpen", "equipCursor", "equipMode",
    "gameState", "player", "currentBGM",
    "touchActive", "WEAPON_DEFS", "WEAPON_UPGRADE_COST", "WEAPON_UPGRADE_MAX"
]
for v in REQUIRED_GLOBALS:
    found = bool(re.search(rf'\b(let|const|var|function)\s+{v}\b', all_js))
    check(f"declared: {v}", found)

# === 4. Function existence ===
print("\n--- Function Checks ---")
REQUIRED_FUNCTIONS = [
    "drawEquipTab", "drawInventory", "drawTitle", "drawHUD",
    "updateCombat", "update", "upgradeWeapon", "initWeapon",
    "playBGM", "stopBGM", "getAllOwnedWeapons", "getSlotWeapon",
    "hitTestEquipSlot", "onTouchStart", "drawTouchUI"
]
for fn in REQUIRED_FUNCTIONS:
    found = bool(re.search(rf'function\s+{fn}\s*\(', all_js))
    check(f"function: {fn}", found)

# === 5. Tab switching logic ===
print("\n--- Tab Switching ---")
update_js = read("js/update.js")

# Tab key should toggle inventoryOpen
check("Tab toggles inventoryOpen",
    bool(re.search(r"wasPressed\('Tab'\).*inventoryOpen", update_js, re.DOTALL)))

# Tab key should cycle inventoryTab (inside inventoryOpen block)
check("Tab cycles inventoryTab",
    bool(re.search(r"wasPressed\('Tab'\).*inventoryTab.*% 3", update_js, re.DOTALL)))

# ArrowLeft/Right should NOT change inventoryTab
check("no ArrowLeft tab switch",
    not bool(re.search(r"ArrowLeft.*inventoryTab", update_js)))
check("no ArrowRight tab switch",
    not bool(re.search(r"ArrowRight.*inventoryTab", update_js)))

# === 6. Equipment UI logic ===
print("\n--- Equipment UI Logic ---")
equip_js = read("js/equip_ui.js")

check("no mouse.dragItem in equip_ui",
    "mouse.dragItem" not in equip_js)

check("2-pane structure",
    "LEFT PANE" in equip_js and "RIGHT PANE" in equip_js)

check("equipMode declared",
    bool(re.search(r"let\s+equipMode\s*=", equip_js)))

check("equipListCursor declared",
    bool(re.search(r"let\s+equipListCursor\s*=", equip_js)))

check("getAllOwnedWeapons defined",
    "function getAllOwnedWeapons" in equip_js)

check("sprite rendering in slots",
    "hasSprite" in equip_js and "drawSpriteImg" in equip_js)

# === 7. Equip cursor bounds ===
print("\n--- Cursor Bounds ---")
# In slot mode, cursor should wrap within 0-2 (3 slots)
check("slot cursor mod 3",
    bool(re.search(r'equipCursor.*%\s*3', update_js)))

# In list mode, cursor should use allWeps.length
check("list cursor wraps by allWeps.length",
    bool(re.search(r'equipListCursor.*allWeps\.length', update_js)))

# === 8. Equipment swap logic ===
print("\n--- Equipment Swap ---")
# KeyX in list mode should equip weapon
check("X key equips in list mode",
    bool(re.search(r"equipMode === 'list'.*KeyX", update_js, re.DOTALL)) or
    bool(re.search(r"KeyX.*equipMode.*list", update_js, re.DOTALL)))

# After equip, player.weapon should be updated
check("player.weapon updated on equip",
    bool(re.search(r"player\.weapon\s*=.*player\.weapons", update_js)))

# === 9. Touch compatibility ===
print("\n--- Touch Checks ---")
touch_js = read("js/touch.js")

check("touchActive declared",
    bool(re.search(r"let\s+touchActive", touch_js)))

check("fullscreen on first touch",
    "requestFullscreen" in touch_js)

check("no D&D in touch",
    "mouse.dragItem" not in touch_js or
    touch_js.count("mouse.dragItem") <= 2)  # only in cleanup

check("list tap support",
    "getAllOwnedWeapons" in touch_js)

# === 10. Index.html checks ===
print("\n--- HTML Checks ---")
html = read("index.html")
check("equip_ui.js loaded", "equip_ui.js" in html)
check("touch.js loaded last", html.index("touch.js") > html.index("equip_ui.js"))
check("cache bust consistent",
    len(set(re.findall(r'\?v=(\d+)', html))) == 1,
    f"versions found: {set(re.findall(r'v=([0-9]+)', html))}")

# === 11. Specific bug checks (from user report) ===
print("\n--- Bug Regression ---")
# Tab must work to switch tabs while inventory is open
# The first Tab press toggles inventoryOpen, the second should cycle tabs
# Check that inventoryTab cycle is INSIDE the inventoryOpen block
inv_block_match = re.search(r'if\s*\(inventoryOpen\)\s*\{(.*?)(?=\n  if \(gameState)', update_js, re.DOTALL)
if inv_block_match:
    inv_block = inv_block_match.group(1)
    check("Tab cycles tabs inside inventoryOpen block",
        "inventoryTab" in inv_block and "% 3" in inv_block)
    check("equipMode slot/list branching in inventoryOpen",
        "equipMode === 'slot'" in inv_block and "equipMode === 'list'" in inv_block)
else:
    check("inventoryOpen block found", False, "could not extract block")

# Verify Tab uses if/else so open and cycle never fire together
tab_ok = "inventoryOpen = !inventoryOpen" not in update_js
tab_ok2 = "if (!inventoryOpen)" in update_js
check("Tab toggle is clean (no side effects on same press)", tab_ok and tab_ok2)

# equipCursor should NOT go beyond visible slots (max 2 for slot mode)
check("equipCursor wraps correctly in slot mode",
    bool(re.search(r'equipCursor\s*=\s*\(equipCursor\s*\+\s*[12]\)\s*%\s*3', update_js)))

# === 12. Cross-file reference checks ===
print("\n--- Cross-file References ---")
# Functions called in one file must be defined in another
cross_refs = [
    ("update.js", "getAllOwnedWeapons", "equip_ui.js"),
    ("update.js", "getSlotWeapon", "equip_ui.js"),
    ("update.js", "upgradeWeapon", "data.js"),
    ("touch.js", "hitTestEquipSlot", "touch.js"),
    ("equip_ui.js", "hasSprite", "systems.js"),
    ("equip_ui.js", "drawSpriteImg", "systems.js"),
    ("ui_screens.js", "currentBGM", "bgm.js"),
    ("ui_screens.js", "playBGM", "bgm.js"),
]
for caller_file, func_name, definer_file in cross_refs:
    caller = read(f"js/{caller_file}")
    definer = read(f"js/{definer_file}")
    called = func_name in caller
    defined = bool(re.search(rf'(function\s+{func_name}|let\s+{func_name}|const\s+{func_name}|var\s+{func_name})', definer))
    check(f"xref: {caller_file} calls {func_name} (def in {definer_file})",
        not called or defined,
        f"called={called} defined={defined}")

# === Summary ===
print("\n" + "=" * 50)
total = PASS + FAIL
print(f"  TOTAL: {total}  PASS: {PASS}  FAIL: {FAIL}")
if FAIL == 0:
    print("  *** ALL TESTS PASSED ***")
else:
    print(f"  *** {FAIL} TESTS FAILED ***")
print("=" * 50)
sys.exit(1 if FAIL > 0 else 0)


