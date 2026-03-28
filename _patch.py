path = 'js/data.js'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()
insert = (
    "\n// ===== COLLECTION UI STATE =====\n"
    "let collectionSubTab = 0;\n"
    "let collectionCursor  = { blessing: 0, enemy: 0, weapon: 0 };\n"
    "let collectionFilter  = { blessing: 'all', enemy: 'all', weapon: 'all' };\n"
    "let collectionDetailOpen = false;\n"
    "let collectionAnimX   = { blessing: 0.0, enemy: 0.0, weapon: 0.0 };\n"
)
target = '// ===== TITLE PARTICLES ====='
assert target in src, 'TARGET NOT FOUND'
src = src.replace(target, insert + target)
with open(path, 'w', encoding='utf-8') as f:
    f.write(src)
print('OK: data.js')
