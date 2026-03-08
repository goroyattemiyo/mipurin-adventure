with open('js/game.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 'bold 20px M PLUS Rounded 1c, sans-serif'
# → "bold 20px 'M PLUS Rounded 1c', sans-serif"
# JSの文字列クォートをシングル→ダブルに変えてフォント名をシングルクォートで囲む

import re

def fix_font(m):
    return m.group(0).replace("ctx.font = '", 'ctx.font = "').rstrip("'") + '"' if m.group(0).endswith("'") else m.group(0)

# すべての ctx.font = '...M PLUS Rounded 1c...' を ctx.font = "...'M PLUS Rounded 1c'..." に変換
code = re.sub(
    r"ctx\.font = '([^']*?)M PLUS Rounded 1c, sans-serif'",
    lambda m: 'ctx.font = "' + m.group(1) + "'M PLUS Rounded 1c', sans-serif" + '"',
    code
)

with open('js/game.js', 'w', encoding='utf-8') as f:
    f.write(code)

import re as re2
count = len(re2.findall(r"'M PLUS Rounded 1c'", code))
print(f"Done: {count} font declarations fixed with quoted family name")
