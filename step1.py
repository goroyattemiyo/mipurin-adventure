import re

path = r'C:\dev\mipurin-adventure\js\data.js'

with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

insert = (
    "\n// ===== COLLECTION UI STATE =====\n"
    "let collectionCursor = { blessing: 0, enemy: 0, weapon: 0 };\n"
    "let collectionFilter = { blessing: 'all', enemy: 'all', weapon: 'all' };\n"
    "let collectionAnimX = 0;\n"
    "let collectionDetailOpen = false;\n"
    "let collectionSubTab = 'enemy';\n\n"
)

target = '// ===== TITLE PARTICLES ====='
if target not in src:
    print('ERROR: 挿入位置が見つかりません')
else:
    src = src.replace(target, insert + target)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    print('OK: collection UI変数を追加しました')
