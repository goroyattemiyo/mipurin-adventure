path = r'C:\dev\mipurin-adventure\js\ui.js'

with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

errors = []

# (1) collectionSubTab の二重宣言を削除
old1 = "let collectionSubTab = 0; // 0=enemies, 1=weapons\n"
if old1 not in src:
    errors.append('ERROR: collectionSubTab宣言が見つかりません')
else:
    src = src.replace(old1, '')
    print('OK: collectionSubTab宣言を削除しました')

# (2) getFilteredItems() を worldLoreScroll 宣言の直前に追加
target2 = '// ===== \u4e16\u754c\u30ed\u30a2\u30bf\u30d6 (H-C) ====='
new_func = (
    "// ===== COLLECTION FILTER =====\n"
    "function getFilteredItems(subTab, filter) {\n"
    "  if (subTab === 'enemy') {\n"
    "    var allEnemies = (typeof ENEMY_DEFS === 'object' && !Array.isArray(ENEMY_DEFS))\n"
    "      ? Object.values(ENEMY_DEFS) : (Array.isArray(ENEMY_DEFS) ? ENEMY_DEFS : []);\n"
    "    if (!filter || filter === 'all') return allEnemies;\n"
    "    if (filter === 'boss') return allEnemies.filter(function(e) { return e.isBoss; });\n"
    "    return allEnemies.filter(function(e) { return e.theme === filter; });\n"
    "  }\n"
    "  if (subTab === 'weapon') {\n"
    "    var allW = (typeof WEAPON_DEFS !== 'undefined') ? WEAPON_DEFS : [];\n"
    "    if (!filter || filter === 'all') return allW;\n"
    "    if (filter === 'tier1') return allW.filter(function(w) { return !w.tier || w.tier === 1; });\n"
    "    if (filter === 'tier2') return allW.filter(function(w) { return w.tier === 2; });\n"
    "    return allW.filter(function(w) { return w.fx === filter; });\n"
    "  }\n"
    "  if (subTab === 'blessing') {\n"
    "    var allB = (typeof BLESSING_DEFS !== 'undefined') ? BLESSING_DEFS : [];\n"
    "    if (!filter || filter === 'all') return allB;\n"
    "    if (filter === 'duo') {\n"
    "      var allD = (typeof DUO_DEFS !== 'undefined') ? DUO_DEFS : [];\n"
    "      return allD;\n"
    "    }\n"
    "    return allB.filter(function(b) { return b.category === filter; });\n"
    "  }\n"
    "  return [];\n"
    "}\n\n"
)

if target2 not in src:
    errors.append('ERROR: 挿入位置(worldLoreTab)が見つかりません')
else:
    src = src.replace(target2, new_func + target2)
    print('OK: getFilteredItems()を追加しました')

if errors:
    for e in errors:
        print(e)
else:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    print('OK: ui.jsを保存しました')
