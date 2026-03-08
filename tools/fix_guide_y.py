with open('js/game.js', 'r', encoding='utf-8') as f:
    c = f.read()

old = "sx + cardW / 2, sy + 145);"
# 2箇所あるはず（descのsy+140は既に変更済み）、残りは◀▶の行
idx = c.find('\u25c4\u25ba\u3067\u9078\u3076')
if idx > 0:
    # Find the sy + 145 near this location
    start = max(0, idx - 80)
    end = idx + 80
    snippet = c[start:end]
    snippet_new = snippet.replace('sy + 145', 'sy + 185')
    c = c[:start] + snippet_new + c[end:]
    print('Fixed guide Y to 185')
else:
    print('MISS: could not find guide text')

with open('js/game.js', 'w', encoding='utf-8', newline='') as f:
    f.write(c)
