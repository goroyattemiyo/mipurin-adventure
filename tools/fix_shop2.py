with open('js/game.js', 'r', encoding='utf-8') as f:
    c = f.read()

fixes = 0

# 1. 非選択時の操作ガイドをカード下部に移動 (145→185)
old = """ctx.fillText('\u25c4\u25ba\u3067\u9078\u3076', sx + cardW / 2, sy + 145);"""
new = """ctx.fillText('\u25c4\u25ba\u3067\u9078\u3076', sx + cardW / 2, sy + 185);"""
if old in c: c = c.replace(old, new); fixes += 1

# 2. 商品名のフォントサイズを制限（22→18に下げて幅収まりやすく）
old = """ctx.fillStyle = canBuy ? '#fff' : '#888'; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(s.name, sx + cardW / 2, sy + 85);"""
new = """ctx.fillStyle = canBuy ? '#fff' : '#888'; ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif";
    const nm = s.name.length > 8 ? s.name.slice(0,8) + '..' : s.name;
    ctx.fillText(nm, sx + cardW / 2, sy + 85);"""
if old in c: c = c.replace(old, new); fixes += 1

# 3. 「花粉が足りない」を短縮
old = """canBuy ? '\u25b6 Z\u3067\u8cb7\u3046 \u25c0' : '\u82b1\u7c89\u304c\u8db3\u308a\u306a\u3044\u2026'"""
new = """canBuy ? '\u25b6 Z\u3067\u8cb7\u3046 \u25c0' : '\u2716 \u82b1\u7c89\u4e0d\u8db3'"""
if old in c: c = c.replace(old, new); fixes += 1

# 4. descのY位置を調整して操作ガイドと離す (145→140)
old = """ctx.fillText(s.desc, sx + cardW / 2, sy + 145);"""
new = """ctx.fillText(s.desc, sx + cardW / 2, sy + 140);"""
if old in c: c = c.replace(old, new); fixes += 1

with open('js/game.js', 'w', encoding='utf-8', newline='') as f:
    f.write(c)

print(f'Shop UI fixes applied: {fixes}/4')
