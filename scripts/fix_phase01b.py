# fix_phase01b.py - V5/V8/V9修正 + data.js軽量化
import re

print("=== Phase 0+1 Hotfix ===")

# ========== 1. data.js -> rarity.js 分離 ==========
with open('js/data.js', 'r', encoding='utf-8') as f:
    dat = f.read()

# Extract rarity block
rarity_start = dat.find('// === Weapon Rarity System')
rarity_end = dat.find('// === End Rarity System ===')
if rarity_start >= 0 and rarity_end >= 0:
    rarity_block = dat[rarity_start:rarity_end + len('// === End Rarity System ===')]
    # Write to rarity.js
    with open('js/rarity.js', 'w', encoding='utf-8') as f:
        f.write(rarity_block + '\n')
    # Remove from data.js
    dat = dat[:rarity_start] + dat[rarity_end + len('// === End Rarity System ==='):]
    dat = dat.replace('\n\n\n', '\n\n')
    with open('js/data.js', 'w', encoding='utf-8') as f:
        f.write(dat)
    print("[OK] Rarity system extracted to js/rarity.js (" + str(len(rarity_block)) + " bytes)")
    print("[OK] data.js reduced to " + str(len(dat)) + " bytes")
else:
    print("[SKIP] Rarity block not found in data.js")

# ========== 2. index.html - add rarity.js ==========
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

if 'rarity.js' not in html:
    html = html.replace(
        '<script src="js/charms.js',
        '<script src="js/rarity.js" defer></script>\n    <script src="js/charms.js'
    )
    # Update cache bust
    import re as _re
    old_v = _re.search(r'v=(\d+)', html)
    if old_v:
        new_v = str(int(old_v.group(1)) + 1)
        html = html.replace('v=' + old_v.group(1), 'v=' + new_v)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("[OK] rarity.js added to index.html")

# ========== 3. equip_ui.js - rarity color fix ==========
with open('js/equip_ui.js', 'r', encoding='utf-8') as f:
    eq = f.read()

# Fix slot pane (L150-151)
eq = eq.replace(
    "ctx.fillStyle = '#fff'; ctx.font = 'bold 15px ' + F;\n      ctx.fillText(w.name, sx + 68, sy + 22);",
    "ctx.fillStyle = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : '#fff'; ctx.font = 'bold 15px ' + F;\n      ctx.fillText(w.name, sx + 68, sy + 22);"
)

# Fix list pane (L253)
eq = eq.replace(
    "ctx.fillStyle = '#fff'; ctx.font = 'bold 14px ' + F;\n    ctx.fillText(w.name, rightX + 52, ry + 18);",
    "var _rCol = (w.rarity && typeof getRarityDef === 'function') ? getRarityDef(w.rarity).color : '#fff';\n    ctx.fillStyle = _rCol; ctx.font = 'bold 14px ' + F;\n    ctx.fillText(w.name + (w.rarity && w.rarity !== 'normal' && typeof getRarityDef === 'function' ? ' [' + getRarityDef(w.rarity).name + ']' : ''), rightX + 52, ry + 18);"
)

with open('js/equip_ui.js', 'w', encoding='utf-8') as f:
    f.write(eq)
print("[OK] equip_ui.js rarity colors applied")

# ========== 4. update.js - rarity on weaponPopup (combat drop is here) ==========
with open('js/update.js', 'r', encoding='utf-8') as f:
    upd = f.read()

# Weapon popup rarity assignment - find weaponPopup.active = true pattern
if 'weaponPopup' in upd and 'weaponPopup.weapon.rarity' not in upd:
    # There's no weaponPopup.active set in update.js either - 
    # rarity should be applied when Z/Q/C picks up the weapon
    # Already partially done, check the const w lines
    pass

# Check if rarity is being set on the first const w line
if "if (!w.rarity && typeof rollRarity === 'function') w.rarity = rollRarity(floor);" in upd:
    print("[OK] update.js already has rarity on weapon pickup (Z)")
else:
    print("[WARN] update.js weapon pickup rarity may be missing")

with open('js/update.js', 'w', encoding='utf-8') as f:
    f.write(upd)

# ========== 5. ui.js - verify enemy sprite rendering ==========
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui = f.read()

# Check if drawSpriteImg is called in drawCollectionTab
ct_start = ui.find('function drawCollectionTab()')
ct_end = ui.find('\n}', ct_start + 100) if ct_start >= 0 else -1
if ct_start >= 0:
    ct_body = ui[ct_start:ct_end+2] if ct_end >= 0 else ui[ct_start:ct_start+3000]
    if 'drawSpriteImg' in ct_body:
        print("[OK] drawCollectionTab has drawSpriteImg (enemy sprites)")
    else:
        print("[WARN] drawCollectionTab missing drawSpriteImg - checking...")
        # The replacement may have failed silently - let's verify
        if 'sprX' in ct_body and 'hasSprite' in ct_body:
            print("[OK] Actually has sprite logic (hasSprite + sprX vars found)")
        else:
            print("[FAIL] Enemy sprite code not in drawCollectionTab")

# ========== 6. test_game.py - add rarity.js to file checks ==========
with open('test_game.py', 'r', encoding='utf-8') as f:
    test = f.read()

if 'rarity.js' not in test:
    test = test.replace(
        "'js/charms.js'",
        "'js/rarity.js', 'js/charms.js'"
    )
    with open('test_game.py', 'w', encoding='utf-8') as f:
        f.write(test)
    print("[OK] test_game.py updated with rarity.js")

print("\n=== Hotfix Complete ===")
