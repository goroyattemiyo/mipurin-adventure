with open('js/ui.js', 'r', encoding='utf-8') as f:
    c = f.read()

fixes = 0

# 1. 重複drawText定義を除去（不完全な1行目）
old_dup = "function drawText(text, x, y, layer, overrides) {\n\n\nfunction drawText"
new_dup = "function drawText"
if old_dup in c:
    c = c.replace(old_dup, new_dup)
    fixes += 1
    print('FIX 1: removed duplicate drawText')

# 2. 末尾の余分な } を除去
if c.rstrip().endswith('}\n}') or c.rstrip().endswith('}\r\n}'):
    c = c.rstrip() + '\n'
    fixes += 1
    print('FIX 2: removed trailing brace')
elif c.count('{') != c.count('}'):
    diff = c.count('}') - c.count('{')
    if diff == 1:
        # Remove last }
        idx = c.rstrip().rfind('}')
        c = c[:idx] + c[idx+1:]
        fixes += 1
        print(f'FIX 2: brace balance corrected (removed extra closing brace)')

# 3. ハート表示を折り返し対応に修正
old_heart = "const hs = 20;\n  for (let i = 0; i < player.maxHp; i++) { ctx.fillStyle = i < player.hp ? COL.hpLost : '#444'; ctx.font = hs + 'px M PLUS Rounded 1c, sans-serif'; ctx.fillText(i < player.hp ? '\\u2665' : '\\u2661', 12 + i * (hs + 4), 12 + hs); }"
new_heart = "const hs = 22, hSpacing = hs + 6, hPerRow = 15;\n  for (let i = 0; i < player.maxHp; i++) { const col = i % hPerRow, row = Math.floor(i / hPerRow); ctx.fillStyle = i < player.hp ? COL.hpLost : '#444'; ctx.font = hs + \"px 'M PLUS Rounded 1c', sans-serif\"; ctx.fillText(i < player.hp ? '\\u2665' : '\\u2661', 12 + col * hSpacing, 12 + hs + row * (hs + 8)); }"
if old_heart in c:
    c = c.replace(old_heart, new_heart)
    fixes += 1
    print('FIX 3: heart display with row wrap')
else:
    print('MISS 3: heart pattern not found, checking variant...')
    if "const hs = 20;" in c and "hs + 4" in c:
        c = c.replace("const hs = 20;", "const hs = 22, hSpacing = hs + 6, hPerRow = 15;")
        c = c.replace("12 + i * (hs + 4), 12 + hs", "12 + (i % hPerRow) * hSpacing, 12 + hs + Math.floor(i / hPerRow) * (hs + 8)")
        c = c.replace("hs + 'px M PLUS Rounded 1c, sans-serif'", """hs + "px 'M PLUS Rounded 1c', sans-serif\"""")
        fixes += 1
        print('FIX 3b: heart display fixed via partial replace')

with open('js/ui.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(c)

print(f'\nTotal fixes: {fixes}')
print(f'Brace balance: {{ {c.count("{")} }} {c.count("}")}')
