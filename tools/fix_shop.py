import re

with open('js/game.js', 'r', encoding='utf-8') as f:
    c = f.read()

# Find and replace card dimensions
c = c.replace('cardW = 200, cardH = 160, padX = 20, padY = 16', 'cardW = 240, cardH = 200, padX = 24, padY = 20')

# Replace shop font sizes and layout
c = c.replace(
    """ctx.fillStyle = '#fff'; ctx.font = "48px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(s.icon, sx + cardW / 2, sy + 40);""",
    """ctx.fillStyle = '#fff'; ctx.font = "48px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(s.icon, sx + cardW / 2, sy + 50);"""
)
c = c.replace(
    """ctx.fillStyle = canBuy ? '#fff' : '#888'; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif";\n    ctx.fillText(s.name, sx + cardW / 2, sy + 70);""",
    """ctx.fillStyle = canBuy ? '#fff' : '#888'; ctx.font = "bold 22px 'M PLUS Rounded 1c', sans-serif";\n    ctx.fillText(s.name, sx + cardW / 2, sy + 85);"""
)
c = c.replace(
    """ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif";\n    ctx.fillText(s.cost + ' \u82b1\u7c89', sx + cardW / 2, sy + 115);""",
    """ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";\n    ctx.fillText(s.cost + ' \u82b1\u7c89', sx + cardW / 2, sy + 115);"""
)

# Desc: show only when selected
old_desc = """if (s.desc) { ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(s.desc, sx + cardW / 2, sy + 90); }"""
new_desc = """if (sel && s.desc) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = "16px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText(s.desc, sx + cardW / 2, sy + 145); }"""
c = c.replace(old_desc, new_desc)

# Select indicator: adjust Y
c = c.replace(
    """ctx.fillText(canBuy ? '\u25b6 Z\u3067\u8cb7\u3046 \u25c0' : '\u82b1\u7c89\u304c\u8db3\u308a\u306a\u3044\u2026', sx + cardW / 2, sy + 145);""",
    """ctx.fillText(canBuy ? '\u25b6 Z\u3067\u8cb7\u3046 \u25c0' : '\u82b1\u7c89\u304c\u8db3\u308a\u306a\u3044\u2026', sx + cardW / 2, sy + 178);"""
)
c = c.replace(
    """ctx.fillText('\u25c4\u25ba\u3067\u9078\u3076', sx + cardW / 2, sy + 145);""",
    """ctx.fillText('\u25c4\u25ba\u3067\u9078\u3076', sx + cardW / 2, sy + 178);"""
)

# Select indicator font size
c = c.replace(
    """ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = "bold 36px 'M PLUS Rounded 1c', sans-serif";\n      ctx.fillText(canBuy ? '\u25b6 Z\u3067\u8cb7\u3046 \u25c0'""",
    """ctx.fillStyle = canBuy ? '#ffd700' : '#f66'; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";\n      ctx.fillText(canBuy ? '\u25b6 Z\u3067\u8cb7\u3046 \u25c0'"""
)

count = 0
if 'cardW = 240' in c: count += 1
if 'sy + 50' in c: count += 1
if 'bold 22px' in c: count += 1

with open('js/game.js', 'w', encoding='utf-8', newline='') as f:
    f.write(c)

print(f'Replacements verified: {count}/3 key changes')
