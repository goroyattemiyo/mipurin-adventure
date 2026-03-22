import os

# === 1. Patch js/systems.js - add 2 new GARDEN_DEFS + applyGardenBonuses ===
with open('js/systems.js', 'r', encoding='utf-8') as f:
    sys = f.read()

# Add luck and explore to GARDEN_DEFS
old_garden_end = "{ id: 'nectar', name: '\uD83C\uDF6F \u871C\u306E\u82B1\u58C7', desc: '\u30CD\u30AF\u30BF\u30FC +10%', cost: [30, 80, 180], max: 3, icon: '\uD83C\uDF6F', unlock: 'nectar' }"
new_garden_end = old_garden_end + """,
  { id: 'luck', name: '\uD83C\uDF40 \u5E78\u904B\u306E\u82B1\u58C7', desc: '\u30EC\u30A2\u30C9\u30ED\u30C3\u30D7\u7387 +5%', cost: [20, 50, 100], max: 3, icon: '\uD83C\uDF40', unlock: 'luck' },
  { id: 'explore', name: '\uD83D\uDD2D \u597D\u5947\u306E\u82B1\u58C7', desc: '\u30B7\u30E7\u30C3\u30D7\u5546\u54C1 +1', cost: [30, 70, 140], max: 3, icon: '\uD83D\uDD2D', unlock: 'explore' }"""

if "'luck'" not in sys:
    sys = sys.replace(old_garden_end, new_garden_end)
    print('[OK] GARDEN_DEFS: added luck + explore')
else:
    print('[SKIP] GARDEN_DEFS already has luck')

# Add unlock conditions in checkGardenUnlocks
old_unlock = "if (totalClears >= 5) gardenUnlocks.nectar = true;"
new_unlock = old_unlock + "\n  if (totalClears >= 3) gardenUnlocks.luck = true;\n  if (totalClears >= 5) gardenUnlocks.explore = true;"

if 'gardenUnlocks.luck' not in sys:
    sys = sys.replace(old_unlock, new_unlock)
    print('[OK] checkGardenUnlocks: added luck(3) + explore(5)')
else:
    print('[SKIP] checkGardenUnlocks already has luck')

# Extend applyGardenBonuses
old_bonus_end = "player.nectarMul = (player.nectarMul || 0) + (gardenUpgrades.nectar || 0) * 0.10;"
new_bonus_end = old_bonus_end + """
  player.luckBonus = (gardenUpgrades.luck || 0) * 0.05;
  player.exploreBonus = (gardenUpgrades.explore || 0);"""

if 'player.luckBonus' not in sys:
    sys = sys.replace(old_bonus_end, new_bonus_end)
    print('[OK] applyGardenBonuses: added luckBonus + exploreBonus')
else:
    print('[SKIP] applyGardenBonuses already has luckBonus')

# Extend buildShop to use exploreBonus (add extra item)
old_buildshop_end = "shopItems.push({ name: '\u6700\u5927HP +1', cost: 8 + floor * 2, icon: '\\u2B06', action: () => { player.maxHp += 1; player.hp += 1; } });"
new_buildshop_end = old_buildshop_end + """
  // Explore bonus: extra random item
  if (player.exploreBonus && player.exploreBonus > 0) {
    for (var _ei = 0; _ei < player.exploreBonus; _ei++) {
      var _extraPool = [
        { name: '\u56DE\u5FA9 +3', cost: 5 + floor, icon: '\\u2665', desc: 'HP\u30923\u56DE\u5FA9', action: function() { player.hp = Math.min(player.hp + 3, player.maxHp); } },
        { name: '\u82B1\u7C89\u00D72', cost: 3 + floor, icon: '\\uD83C\\uDF3C', desc: '\u82B1\u7C8810\u7372\u5F97', action: function() { pollen += 10; showFloat('\\uD83C\\uDF3C +10', 1.5, MSG_COLORS.info); } }
      ];
      shopItems.push(_extraPool[Math.floor(rng() * _extraPool.length)]);
    }
  }"""

if 'exploreBonus' not in sys.split('buildShop')[1] if 'buildShop' in sys else True:
    sys = sys.replace(old_buildshop_end, new_buildshop_end)
    print('[OK] buildShop: added explore bonus items')
else:
    print('[SKIP] buildShop already has exploreBonus')

# Extend saveMeta/loadMeta for new unlocks (gardenUnlocks already serialized as JSON, so luck/explore auto-saved)

with open('js/systems.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(sys)
print('[OK] js/systems.js saved')


# === 2. Patch js/data.js - add luckBonus to drop rate ===
with open('js/data.js', 'r', encoding='utf-8') as f:
    data = f.read()

# Find drop rate logic and apply luckBonus
# Look for the pollen/heal drop chance
if 'luckBonus' not in data:
    # Add luckBonus effect to drop chance - boost heal/rare drop
    old_drop = "var healChance = 0.20;"
    new_drop = "var healChance = 0.20 + (player.luckBonus || 0);"
    if old_drop in data:
        data = data.replace(old_drop, new_drop)
        with open('js/data.js', 'w', encoding='utf-8', newline='\n') as f:
            f.write(data)
        print('[OK] js/data.js: luckBonus applied to healChance')
    else:
        # Try alternative pattern
        print('[INFO] js/data.js: healChance pattern not found, checking alternatives...')
        if 'dropChance' in data or '0.20' in data:
            print('[WARN] Found 0.20 but not exact pattern. Manual check needed.')
        else:
            print('[SKIP] No drop rate found in data.js - luck may need to be applied elsewhere')
else:
    print('[SKIP] data.js already has luckBonus')


# === 3. Patch js/data.js - add luck/explore to resetGame player init ===
old_reset_props = "player.nectarMul = 0;"
new_reset_props = old_reset_props + "\n  player.luckBonus = 0; player.exploreBonus = 0;"

if 'player.luckBonus' not in data:
    # Re-read if not already modified
    with open('js/data.js', 'r', encoding='utf-8') as f:
        data = f.read()

# Check if resetGame is in systems.js instead
with open('js/systems.js', 'r', encoding='utf-8') as f:
    sys2 = f.read()

if 'player.luckBonus = 0' not in sys2 and old_reset_props in sys2:
    sys2 = sys2.replace(old_reset_props, new_reset_props)
    with open('js/systems.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(sys2)
    print('[OK] systems.js resetGame: added luckBonus/exploreBonus init')
elif 'player.luckBonus = 0' in sys2:
    print('[SKIP] resetGame already has luckBonus init')
else:
    print('[WARN] resetGame nectarMul pattern not found')


# === 4. Update game.js VERSION ===
with open('js/game.js', 'r', encoding='utf-8') as f:
    gjs = f.read()
gjs = gjs.replace("const VERSION = 'v6.26'", "const VERSION = 'v6.27'")
with open('js/game.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(gjs)
print('[OK] js/game.js: VERSION v6.27')


# === 5. Update index.html cache buster ===
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()
html = html.replace('?v=1632', '?v=1633')
with open('index.html', 'w', encoding='utf-8', newline='\n') as f:
    f.write(html)
print('[OK] index.html: cache bust v=1633')


# === 6. Add memory/revive to BACKLOG ===
with open('docs/BACKLOG.md', 'r', encoding='utf-8') as f:
    bl = f.read()
new_items = []
if '\u8A18\u61B6\u306E\u82B1\u58C7' not in bl:
    new_items.append('| 2026-03-22 | \u82B1\u58C7\u62E1\u5F35: \u8A18\u61B6\u306E\u82B1\u58C7(\u795D\u798F\u4FDD\u6301) + \u4E0D\u5C48\u306E\u82B1\u58C7(\u5FA9\u6D3B) | Sprint G-C\u8B70\u8AD6\u3067\u6848B\u63A1\u7528 | \u9AD8 | \u672A\u7740\u624B |')
if new_items:
    bl = bl.rstrip() + '\n' + '\n'.join(new_items) + '\n'
    with open('docs/BACKLOG.md', 'w', encoding='utf-8', newline='\n') as f:
        f.write(bl)
    print(f'[OK] BACKLOG.md: {len(new_items)} entries added (memory/revive deferred)')


# === Summary ===
print()
print('=== SPRINT G-C (PARTIAL) COMPLETE ===')
for fn in ['js/systems.js', 'js/data.js', 'js/game.js', 'index.html']:
    print(f'  {fn}: {round(os.path.getsize(fn)/1024,1)}KB')
print()
print('Next: node -c js/systems.js && node -c js/data.js && python test_game.py')
