with open('js/game.js', 'r', encoding='utf-8') as f:
    code = f.read()

replacements = {
    # hit: 短く厚い和音パンッ✨ (0.12秒)
    "hit() { play(200, 0.1, 'square', 0.13); play(300, 0.08, 'square', 0.1); play(400, 0.06, 'sine', 0.08); setTimeout(() => play(500, 0.08, 'sine', 0.05), 40); }":
    "hit() { play(220, 0.1, 'square', 0.12); play(330, 0.08, 'sine', 0.1); play(440, 0.06, 'sine', 0.08); }",

    # attack: ブンッ!低音の振り抜き (0.18秒)
    "attack() { play(180, 0.18, 'sawtooth', 0.12); play(250, 0.15, 'square', 0.1); play(120, 0.1, 'triangle', 0.08); setTimeout(() => play(350, 0.08, 'sine', 0.06), 50); setTimeout(() => play(100, 0.15, 'triangle', 0.04), 80); }":
    "attack() { play(160, 0.18, 'sawtooth', 0.11); play(240, 0.14, 'square', 0.09); play(320, 0.08, 'sine', 0.06); setTimeout(() => play(120, 0.12, 'triangle', 0.05), 60); }",

    # player_hurt: イタタッ!かわいく痛い (0.25秒)
    "player_hurt() { play(80, 0.2, 'sawtooth', 0.14); play(600, 0.06, 'square', 0.12); play(750, 0.04, 'square', 0.08); setTimeout(() => play(400, 0.08, 'sawtooth', 0.06), 60); setTimeout(() => play(50, 0.2, 'sawtooth', 0.05), 100); }":
    "player_hurt() { play(90, 0.2, 'sawtooth', 0.12); play(700, 0.05, 'sine', 0.1); setTimeout(() => play(500, 0.08, 'sine', 0.07), 50); setTimeout(() => play(60, 0.15, 'sawtooth', 0.05), 100); }",

    # enemy_die: パキーン✨上昇キラキラ (0.25秒)
    "enemy_die() { play(300, 0.06, 'square', 0.12); play(500, 0.08, 'square', 0.1); setTimeout(() => play(700, 0.1, 'sine', 0.07), 60); setTimeout(() => play(900, 0.15, 'sine', 0.05), 120); }":
    "enemy_die() { play(523, 0.08, 'sine', 0.11); play(659, 0.08, 'sine', 0.09); setTimeout(() => play(784, 0.1, 'sine', 0.08), 50); setTimeout(() => play(1047, 0.12, 'sine', 0.06), 110); }",

    # item_get: マリオコイン的キラーン♪ (0.3秒)
    "item_get() { play(660, 0.08, 'sine', 0.09); setTimeout(() => play(880, 0.12, 'sine', 0.1), 60); setTimeout(() => play(990, 0.08, 'sine', 0.06), 130); }":
    "item_get() { play(988, 0.15, 'sine', 0.11); play(784, 0.08, 'sine', 0.07); setTimeout(() => play(1319, 0.2, 'sine', 0.1), 80); setTimeout(() => play(988, 0.1, 'sine', 0.05), 80); }",

    # level_up: テレレレレン♪5音ファンファーレ (0.6秒)
    "level_up() { play(523, 0.1, 'square', 0.1); setTimeout(() => play(587, 0.08, 'square', 0.09), 80); setTimeout(() => play(659, 0.1, 'square', 0.1), 160); setTimeout(() => play(784, 0.12, 'square', 0.11), 260); setTimeout(() => play(1047, 0.25, 'sine', 0.12), 380); }":
    "level_up() { play(523, 0.12, 'square', 0.1); play(523, 0.12, 'sine', 0.06); setTimeout(() => play(587, 0.1, 'square', 0.1), 90); setTimeout(() => play(659, 0.12, 'square', 0.1), 180); setTimeout(() => play(659, 0.12, 'sine', 0.06), 180); setTimeout(() => play(784, 0.14, 'square', 0.11), 280); setTimeout(() => play(784, 0.14, 'sine', 0.07), 280); setTimeout(() => play(1047, 0.3, 'sine', 0.12), 400); setTimeout(() => play(1319, 0.25, 'sine', 0.08), 420); }",

    # blessing: 神聖ドミソ和音+キラキラ (0.45秒)
    "blessing() { play(523, 0.12, 'sine', 0.1); play(659, 0.12, 'sine', 0.1); setTimeout(() => play(784, 0.2, 'sine', 0.12), 120); }":
    "blessing() { play(523, 0.15, 'sine', 0.1); play(659, 0.15, 'sine', 0.08); play(784, 0.15, 'sine', 0.06); setTimeout(() => play(1047, 0.2, 'sine', 0.1), 120); setTimeout(() => play(1319, 0.15, 'sine', 0.07), 200); setTimeout(() => play(1568, 0.25, 'sine', 0.05), 300); }",

    # boss_appear: 不穏な不協和音+ドラムロール (1.0秒)
    "boss_appear() { play(80, 0.3, 'sawtooth', 0.12); play(85, 0.3, 'sawtooth', 0.1); setTimeout(() => play(60, 0.4, 'sawtooth', 0.1), 150); setTimeout(() => play(63, 0.4, 'sawtooth', 0.08), 150); for(let i=0;i<6;i++) setTimeout(() => play(100+i*10, 0.06, 'square', 0.04+i*0.01), 300+i*60); setTimeout(() => play(50, 0.6, 'sawtooth', 0.12), 700); }":
    "boss_appear() { play(82, 0.4, 'sawtooth', 0.12); play(87, 0.4, 'sawtooth', 0.1); play(110, 0.3, 'square', 0.06); setTimeout(() => play(62, 0.5, 'sawtooth', 0.1), 200); setTimeout(() => play(66, 0.5, 'sawtooth', 0.08), 200); for(var i=0;i<8;i++) setTimeout(((ii)=>()=>play(90+ii*15, 0.07, 'square', 0.03+ii*0.012))(i), 400+i*55); setTimeout(() => { play(50, 0.7, 'sawtooth', 0.13); play(55, 0.7, 'sawtooth', 0.08); }, 850); }",

    # game_over: 長い絶望の4段下降 (1.2秒)
    "game_over() { play(200, 0.3, 'sawtooth', 0.14); setTimeout(() => play(150, 0.3, 'sawtooth', 0.12), 250); setTimeout(() => play(80, 0.5, 'sawtooth', 0.1), 500); setTimeout(() => play(50, 0.8, 'sawtooth', 0.06), 800); }":
    "game_over() { play(200, 0.35, 'sawtooth', 0.13); play(200, 0.35, 'sine', 0.07); setTimeout(() => { play(160, 0.3, 'sawtooth', 0.11); play(160, 0.3, 'sine', 0.06); }, 280); setTimeout(() => { play(100, 0.4, 'sawtooth', 0.1); play(100, 0.4, 'sine', 0.05); }, 560); setTimeout(() => { play(55, 0.8, 'sawtooth', 0.09); play(55, 0.8, 'sine', 0.04); }, 880); }",

    # door_open: 開放感パカッ♪ (0.35秒)
    "door_open() { play(250, 0.15, 'triangle', 0.1); setTimeout(() => play(380, 0.15, 'triangle', 0.09), 100); setTimeout(() => play(500, 0.2, 'sine', 0.07), 200); }":
    "door_open() { play(250, 0.12, 'triangle', 0.1); play(375, 0.1, 'sine', 0.06); setTimeout(() => play(500, 0.15, 'sine', 0.09), 100); setTimeout(() => play(750, 0.2, 'sine', 0.07), 200); }",

    # clear: フロアクリア華やか (0.5秒)
    "clear() { play(523, 0.15, 'square', 0.1); play(659, 0.15, 'square', 0.1); setTimeout(() => play(784, 0.3, 'square', 0.12), 150); }":
    "clear() { play(523, 0.12, 'square', 0.1); play(659, 0.12, 'sine', 0.08); setTimeout(() => play(784, 0.15, 'square', 0.1), 120); setTimeout(() => play(784, 0.15, 'sine', 0.06), 120); setTimeout(() => play(1047, 0.25, 'sine', 0.11), 260); setTimeout(() => play(1319, 0.2, 'sine', 0.07), 300); }",

    # menu_select: ピコッ♪明るく (0.18秒)
    "menu_select() { play(700, 0.08, 'square', 0.09); setTimeout(() => play(1000, 0.1, 'square', 0.08), 60); }":
    "menu_select() { play(784, 0.08, 'sine', 0.1); play(1047, 0.06, 'sine', 0.07); setTimeout(() => play(1319, 0.1, 'sine', 0.08), 60); }",

    # dialog_open: ポワン♪柔らかく上昇 (0.2秒)
    "dialog_open() { play(350, 0.08, 'sine', 0.08); setTimeout(() => play(520, 0.1, 'sine', 0.07), 60); }":
    "dialog_open() { play(392, 0.1, 'sine', 0.08); play(523, 0.08, 'sine', 0.05); setTimeout(() => play(659, 0.12, 'sine', 0.07), 70); }",

    # dialog_close: ポロン♪柔らかく下降 (0.2秒)
    "dialog_close() { play(520, 0.06, 'sine', 0.07); setTimeout(() => play(330, 0.1, 'sine', 0.06), 50); }":
    "dialog_close() { play(659, 0.08, 'sine', 0.07); play(523, 0.06, 'sine', 0.04); setTimeout(() => play(392, 0.1, 'sine', 0.06), 60); }",

    # buy: チャリン♪お買い物 (0.25秒)
    "buy() { play(600, 0.08, 'sine', 0.1); play(800, 0.12, 'sine', 0.1); }":
    "buy() { play(659, 0.08, 'sine', 0.1); play(880, 0.08, 'sine', 0.07); setTimeout(() => play(1047, 0.12, 'sine', 0.09), 70); setTimeout(() => play(1319, 0.15, 'sine', 0.06), 140); }",
}

count = 0
for old, new in replacements.items():
    if old in code:
        code = code.replace(old, new)
        count += 1
        print(f"OK: {old[:40]}...")
    else:
        print(f"MISS: {old[:40]}...")

with open('js/game.js', 'w', encoding='utf-8') as f:
    f.write(code)

print(f"Done: {count}/{len(replacements)} SE upgraded to rich version")
