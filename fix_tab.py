import pathlib, re

path = pathlib.Path('js/update.js')
code = path.read_text(encoding='utf-8')

# --- Step 1: Find and replace broken Tab toggle ---
# Pattern: wasPressed('Tab') with inventoryOpen toggle + forced tab=2,
# followed by inventoryOpen block with second wasPressed('Tab')

# Try exact string match first
old1 = "if (wasPressed('Tab')) { inventoryOpen = !inventoryOpen; if (!inventoryOpen) inventoryTab = 2; }"
if old1 in code:
    code = code.replace(old1, '/* old Tab removed */')
    print('[OK] Removed old Tab toggle line')
else:
    print('[WARN] Exact Tab toggle not found, trying regex...')
    code = re.sub(
        r"if \(wasPressed\('Tab'\)\) \{ inventoryOpen = !inventoryOpen;[^}]*\}",
        '/* old Tab removed */',
        code, count=1
    )
    print('[OK] Removed Tab toggle via regex')

# Remove the second wasPressed('Tab') inside inventoryOpen block
old2 = "if (wasPressed('Tab')) { inventoryTab = (inventoryTab + 1) % 3; Audio.menu_move(); }"
if old2 in code:
    code = code.replace(old2, '/* old Tab cycle removed */')
    print('[OK] Removed old Tab cycle line')
else:
    print('[WARN] Tab cycle line not found')

# --- Step 2: Insert new unified Tab + Escape logic ---
# Place it right before "if (inventoryOpen) {"
marker = 'if (inventoryOpen) {'
if marker in code:
    new_tab_logic = """if (wasPressed('Tab')) {
    if (!inventoryOpen) {
      inventoryOpen = true;
      if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
    } else {
      inventoryTab = (inventoryTab + 1) % 3;
      if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
      if (inventoryTab === 2) { equipMode = 'slot'; equipCursor = 0; equipListCursor = 0; }
    }
  }
  if (inventoryOpen && wasPressed('Escape')) {
    inventoryOpen = false;
    if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move();
  }
  """
    # Replace the marker, keeping it after the new logic
    idx = code.index(marker)
    # Remove the "/* old Tab removed */" leftovers near marker
    code = code.replace('/* old Tab removed */\n  ', '')
    code = code.replace('/* old Tab removed */', '')
    code = code.replace('/* old Tab cycle removed */\n   \n    ', '')
    code = code.replace('/* old Tab cycle removed */', '')
    # Re-find marker after cleanup
    idx = code.index(marker)
    code = code[:idx] + new_tab_logic + code[idx:]
    print('[OK] Inserted new Tab + Escape logic')
else:
    print('[FAIL] Could not find inventoryOpen marker')

# --- Step 3: Remove any leftover mouse.dragItem in equip section ---
code = code.replace('mouse.dragItem = null; mouse.dragFrom = null;', '/* D&D removed */')
print('[OK] Cleaned dragItem references')

# --- Step 4: Write ---
path.write_text(code, encoding='utf-8')
print('[DONE] update.js saved')

# Count wasPressed Tab occurrences
count = len(re.findall(r"wasPressed\('Tab'\)", code))
print(f'[INFO] wasPressed Tab count: {count} (expect 1)')
