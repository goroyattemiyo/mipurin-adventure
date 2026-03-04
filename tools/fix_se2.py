with open('js/game.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 全SE関数を一括置換
replacements = {
    # attack: ブンッと振り切る3段斬撃
    "attack() { play(220, 0.12, 'square', 0.1); play(330, 0.08, 'sawtooth', 0.08); setTimeout(() => play(180, 0.1, 'square', 0.06), 50); }":
    "attack() { play(200, 0.15, 'square', 0.1); play(320, 0.1, 'sawtooth', 0.08); setTimeout(() => play(150, 0.12, 'triangle', 0.06), 40); }",

    # player_hurt: ピキッ+低音ズシン
    "player_hurt() { play(100, 0.15, 'sawtooth', 0.15); }":
    "player_hurt() { play(90, 0.18, 'sawtooth', 0.13); play(800, 0.04, 'square', 0.1); setTimeout(() => play(60, 0.12, 'sawtooth', 0.06), 80); }",

    # enemy_die: パンッ+キラキラ余韻
    "enemy_die() { play(400, 0.1, 'square', 0.1); play(600, 0.15, 'square', 0.08); }":
    "enemy_die() { play(300, 0.06, 'square', 0.12); play(500, 0.08, 'square', 0.1); setTimeout(() => play(700, 0.1, 'sine', 0.07), 60); setTimeout(() => play(900, 0.15, 'sine', 0.05), 120); }",

    # game_over: 3段下降+長い余韻
    "game_over() { play(150, 0.3, 'sawtooth', 0.15); setTimeout(() => play(80, 0.5, 'sawtooth', 0.12), 200); }":
    "game_over() { play(200, 0.3, 'sawtooth', 0.14); setTimeout(() => play(150, 0.3, 'sawtooth', 0.12), 250); setTimeout(() => play(80, 0.5, 'sawtooth', 0.1), 500); setTimeout(() => play(50, 0.8, 'sawtooth', 0.06), 800); }",

    # boss_appear: 不協和音+連打ドラムロール
    "boss_appear() { play(80, 0.4, 'sawtooth', 0.12); setTimeout(() => play(60, 0.6, 'sawtooth', 0.1), 300); setTimeout(() => play(100, 0.3, 'square', 0.08), 500); }":
    "boss_appear() { play(80, 0.3, 'sawtooth', 0.12); play(85, 0.3, 'sawtooth', 0.1); setTimeout(() => play(60, 0.4, 'sawtooth', 0.1), 150); setTimeout(() => play(63, 0.4, 'sawtooth', 0.08), 150); for(let i=0;i<6;i++) setTimeout(() => play(100+i*10, 0.06, 'square', 0.04+i*0.01), 300+i*60); setTimeout(() => play(50, 0.6, 'sawtooth', 0.12), 700); }",

    # level_up: 5音階ファンファーレ
    "level_up() { play(523, 0.1, 'square', 0.1); setTimeout(() => play(659, 0.1, 'square', 0.1), 100); setTimeout(() => play(784, 0.1, 'square', 0.1), 200); setTimeout(() => play(1047, 0.2, 'square', 0.12), 300); }":
    "level_up() { play(523, 0.1, 'square', 0.1); setTimeout(() => play(587, 0.08, 'square', 0.09), 80); setTimeout(() => play(659, 0.1, 'square', 0.1), 160); setTimeout(() => play(784, 0.12, 'square', 0.11), 260); setTimeout(() => play(1047, 0.25, 'sine', 0.12), 380); }",

    # item_get: 周波数下げ+柔らかく
    "item_get() { play(880, 0.08, 'sine', 0.1); setTimeout(() => play(1100, 0.12, 'sine', 0.12), 60); }":
    "item_get() { play(660, 0.08, 'sine', 0.09); setTimeout(() => play(880, 0.12, 'sine', 0.1), 60); setTimeout(() => play(990, 0.08, 'sine', 0.06), 130); }",

    # dialog_open: 上昇2音
    "dialog_open() { play(400, 0.06, 'sine', 0.08); play(600, 0.08, 'sine', 0.06); }":
    "dialog_open() { play(350, 0.08, 'sine', 0.08); setTimeout(() => play(520, 0.1, 'sine', 0.07), 60); }",

    # dialog_close: 下降2音
    "dialog_close() { play(500, 0.05, 'sine', 0.06); play(300, 0.08, 'sine', 0.05); }":
    "dialog_close() { play(520, 0.06, 'sine', 0.07); setTimeout(() => play(330, 0.1, 'sine', 0.06), 50); }",

    # menu_move: 音量UP+少し長く
    "menu_move() { play(600, 0.04, 'square', 0.06); }":
    "menu_move() { play(580, 0.06, 'square', 0.08); }",

    # menu_select: メリハリ強化
    "menu_select() { play(800, 0.06, 'square', 0.08); play(1000, 0.08, 'square', 0.06); }":
    "menu_select() { play(700, 0.08, 'square', 0.09); setTimeout(() => play(1000, 0.1, 'square', 0.08), 60); }",

    # door_open: 重みのある開放感
    "door_open() { play(300, 0.15, 'triangle', 0.1); setTimeout(() => play(450, 0.2, 'triangle', 0.08), 100); }":
    "door_open() { play(250, 0.15, 'triangle', 0.1); setTimeout(() => play(380, 0.15, 'triangle', 0.09), 100); setTimeout(() => play(500, 0.2, 'sine', 0.07), 200); }",
}

for old, new in replacements.items():
    if old in code:
        code = code.replace(old, new)
        print(f"OK: replaced {old[:30]}...")
    else:
        print(f"MISS: {old[:30]}...")

with open('js/game.js', 'w', encoding='utf-8') as f:
    f.write(code)

print("Done: all SE improved")
