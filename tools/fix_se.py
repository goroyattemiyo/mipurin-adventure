import re

with open('js/game.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Audioオブジェクトに新SE関数を追加
old_audio_end = "    drop() { play(500, 0.06, 'triangle', 0.06); }\n  };"

new_audio_end = """    drop() { play(500, 0.06, 'triangle', 0.06); },
    game_over() { play(150, 0.3, 'sawtooth', 0.15); setTimeout(() => play(80, 0.5, 'sawtooth', 0.12), 200); },
    boss_appear() { play(80, 0.4, 'sawtooth', 0.12); setTimeout(() => play(60, 0.6, 'sawtooth', 0.1), 300); setTimeout(() => play(100, 0.3, 'square', 0.08), 500); },
    item_get() { play(880, 0.08, 'sine', 0.1); setTimeout(() => play(1100, 0.12, 'sine', 0.12), 60); },
    level_up() { play(523, 0.1, 'square', 0.1); setTimeout(() => play(659, 0.1, 'square', 0.1), 100); setTimeout(() => play(784, 0.1, 'square', 0.1), 200); setTimeout(() => play(1047, 0.2, 'square', 0.12), 300); },
    door_open() { play(300, 0.15, 'triangle', 0.1); setTimeout(() => play(450, 0.2, 'triangle', 0.08), 100); },
    menu_move() { play(600, 0.04, 'square', 0.06); },
    menu_select() { play(800, 0.06, 'square', 0.08); play(1000, 0.08, 'square', 0.06); },
    dialog_open() { play(400, 0.06, 'sine', 0.08); play(600, 0.08, 'sine', 0.06); },
    dialog_close() { play(500, 0.05, 'sine', 0.06); play(300, 0.08, 'sine', 0.05); },
    player_hurt() { play(100, 0.15, 'sawtooth', 0.15); },
    enemy_die() { play(400, 0.1, 'square', 0.1); play(600, 0.15, 'square', 0.08); },
    attack() { play(250, 0.06, 'square', 0.08); play(350, 0.04, 'sawtooth', 0.06); }
  };"""

code = code.replace(old_audio_end, new_audio_end)

# 2. playSE()をAudio.xxx()に置換
se_mapping = {
    'hit': 'Audio.hit()',
    'player_hurt': 'Audio.player_hurt()',
    'enemy_die': 'Audio.enemy_die()',
    'game_over': 'Audio.game_over()',
    'boss_appear': 'Audio.boss_appear()',
    'item_get': 'Audio.item_get()',
    'level_up': 'Audio.level_up()',
    'door_open': 'Audio.door_open()',
    'menu_move': 'Audio.menu_move()',
    'menu_select': 'Audio.menu_select()',
    'dialog_open': 'Audio.dialog_open()',
    'dialog_close': 'Audio.dialog_close()',
    'needle': 'Audio.attack()',
    'attack': 'Audio.attack()',
    'save': 'Audio.item_get()',
}

for se_name, replacement in se_mapping.items():
    code = code.replace("playSE('" + se_name + "')", replacement)

# 3. SE_FILES, SEオブジェクト, playSE関数を削除
code = re.sub(r'\n// ===== SE SYSTEM \(mp3\) =====\n.*?function playSE\(name\) \{[^}]+\}\n', '\n', code, flags=re.DOTALL)

# 4. ゲームオーバー時のSE.game_over参照も削除
code = code.replace("if (SE.game_over) { SE.game_over.pause(); SE.game_over.currentTime = 0; } ", "")

with open('js/game.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('Done: Audio synth SE integrated, playSE removed')
