with open('js/systems.js', 'r', encoding='utf-8') as f:
    code = f.read()

old = "if (isBossFloor()) { stopBGM(1.2); setTimeout(() => playBGM('boss', 0.5), 2000); }"
new = "if (isBossFloor()) { stopBGM(1.2); setTimeout(() => { Audio.boss_appear(); playBGM('boss', 0.5); }, 2000); }"

if old in code:
    code = code.replace(old, new)
    with open('js/systems.js', 'w', encoding='utf-8', newline='\n') as f:
        f.write(code)
    print('[OK] systems.js patched: boss_appear SE added')
else:
    print('[SKIP] pattern not found')
