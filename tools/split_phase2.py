import os

# systems.js -> enemies.js + systems.js
with open('js/systems.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# enemies.js: ENEMIES + PROJECTILES + BOSS (lines 1-189)
with open('js/enemies.js', 'w', encoding='utf-8') as f:
    f.write(''.join(lines[0:189]))
print(f'js/enemies.js: lines 1-189 ({189} lines)')

# systems.js: BLESSINGS ~ COLLISION (lines 190-end)
with open('js/systems_new.js', 'w', encoding='utf-8') as f:
    f.write(''.join(lines[189:]))
print(f'js/systems.js: lines 190-{len(lines)} ({len(lines)-189} lines)')

os.replace('js/systems_new.js', 'js/systems.js')

# engine.js -> update.js + render.js
with open('js/engine.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# update.js: UPDATE (lines 1-300)
with open('js/update.js', 'w', encoding='utf-8') as f:
    f.write(''.join(lines[0:300]))
print(f'js/update.js: lines 1-300 ({300} lines)')

# render.js: DRAWING + MAIN LOOP (lines 301-end)
with open('js/render.js', 'w', encoding='utf-8') as f:
    f.write(''.join(lines[300:]))
print(f'js/render.js: lines 301-{len(lines)} ({len(lines)-300} lines)')

os.remove('js/engine.js')
print('js/engine.js removed')
