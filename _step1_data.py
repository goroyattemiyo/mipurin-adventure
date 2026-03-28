path = 'js/data.js'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

insert = """// ===== COLLECTION UI STATE =====
let collectionCursor = { blessing: 0, enemy: 0, weapon: 0 };
let collectionFilter = { blessing: 'all', enemy: 'all', weapon: 'all' };
let collectionDetailOpen = false;

"""

target = '// ===== INVENTORY SCREEN ====='
src = src.replace(target, insert + target, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)
print('OK')
