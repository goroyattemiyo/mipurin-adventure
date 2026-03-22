with open('js/combat.js', 'r', encoding='utf-8') as f:
    code = f.read()

old = "if (Math.random() < 0.20) spawnDrop"
new = "if (Math.random() < 0.20 + (player.luckBonus || 0)) spawnDrop"

if 'luckBonus' not in code:
    code = code.replace(old, new)
    with open('js/combat.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(code)
    print('[OK] combat.js: luckBonus applied to heal drop (0.20 + luckBonus)')
else:
    print('[SKIP] already patched')
