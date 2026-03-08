with open('js/game.js', 'r', encoding='utf-8') as f:
    c = f.read()

# 1. UI_TEXT_STYLE + drawText を INPUT セクションの前に挿入
style_code = '''
// ===== UI TEXT SYSTEM =====
const UI_TEXT_STYLE = {
  heading:  { font: "bold 28px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'left' },
  subhead:  { font: "bold 22px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'left' },
  label:    { font: "bold 18px 'M PLUS Rounded 1c', sans-serif", color: '#fff', align: 'left' },
  body:     { font: "18px 'M PLUS Rounded 1c', sans-serif", color: '#fff', align: 'left' },
  detail:   { font: "16px 'M PLUS Rounded 1c', sans-serif", color: '#ccc', align: 'left' },
  hint:     { font: "16px 'M PLUS Rounded 1c', sans-serif", color: '#aaa', align: 'center' },
  accent:   { font: "bold 20px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'center' },
  icon:     { font: "48px 'M PLUS Rounded 1c', sans-serif", color: '#fff', align: 'center' },
  cost:     { font: "bold 20px 'M PLUS Rounded 1c', sans-serif", color: '#ffd700', align: 'center' },
  warn:     { font: "bold 18px 'M PLUS Rounded 1c', sans-serif", color: '#f66', align: 'center' },
};
function drawText(text, x, y, layer, overrides) {
  const s = UI_TEXT_STYLE[layer] || UI_TEXT_STYLE.body;
  ctx.font = (overrides && overrides.font) || s.font;
  ctx.fillStyle = (overrides && overrides.color) || s.color;
  ctx.textAlign = (overrides && overrides.align) || s.align;
  ctx.fillText(text, x, y);
}

'''

anchor = '// ===== INPUT ====='
c = c.replace(anchor, style_code + anchor)

# 2. インベントリのレイアウト修正 - 武器欄と祝福欄の重なりを解消
# 問題: 武器スロット(wy+115~180)と祝福見出し(wy+150)が重なっている
# 修正: 祝福見出しをwy+220に、祝福リストをwy+250開始に移動

c = c.replace(
    "ctx.fillText('\u7956\u798f', wx, wy + 150);",
    "ctx.fillText('\u7956\u798f', wx, wy + 220);"
)
c = c.replace(
    "ctx.fillText('\u306a\u3057', wx + 20, wy + 185);",
    "ctx.fillText('\u306a\u3057', wx + 20, wy + 255);"
)
c = c.replace(
    "ctx.fillText(b.icon + ' ' + b.name, wx + 20, wy + 185 + i * 28);",
    "ctx.fillText(b.icon + ' ' + b.name, wx + 20, wy + 255 + i * 35);"
)
c = c.replace(
    "ctx.fillText(b.desc, wx + 50, wy + 200 + i * 28);",
    "ctx.fillText(b.desc, wx + 50, wy + 275 + i * 35);"
)

# 3. 武器速度の行がスロットの後に来て重なる問題を修正
# 速度表示(wy+105)を射程の次(wy+105)はOKだが、スロットが115から始まるので詰まる
# スロット開始をwy+130に下げる
c = c.replace(
    "ctx.fillText('\u3010\u304a\u304d\u306b\u3044\u308a\u3011', wx + 20, wy + 115);",
    "ctx.fillText('\u3010\u304a\u304d\u306b\u3044\u308a\u3011', wx + 20, wy + 130);"
)
c = c.replace(
    "ctx.fillText(w0.name + ' (ATKx' + (w0.dmgMul||1).toFixed(1) + ' \u5c04\u7a0b' + w0.range + ')', wx + 30, wy + 135);",
    "ctx.fillText(w0.name + ' (ATKx' + (w0.dmgMul||1).toFixed(1) + ' \u5c04\u7a0b' + w0.range + ')', wx + 30, wy + 150);"
)
c = c.replace(
    "ctx.fillText('\u3010\u3082\u3046\u3072\u3068\u3064\u3011', wx + 20, wy + 160);",
    "ctx.fillText('\u3010\u3082\u3046\u3072\u3068\u3064\u3011', wx + 20, wy + 175);"
)
c = c.replace(
    "ctx.fillText(w1.name + ' (ATKx' + (w1.dmgMul||1).toFixed(1) + ' \u5c04\u7a0b' + w1.range + ')', wx + 30, wy + 180);",
    "ctx.fillText(w1.name + ' (ATKx' + (w1.dmgMul||1).toFixed(1) + ' \u5c04\u7a0b' + w1.range + ')', wx + 30, wy + 195);"
)
c = c.replace(
    "ctx.fillText('- \u306a\u3057 -', wx + 30, wy + 180);",
    "ctx.fillText('- \u306a\u3057 -', wx + 30, wy + 195);"
)

with open('js/game.js', 'w', encoding='utf-8', newline='') as f:
    f.write(c)

# Verify
checks = {
    'UI_TEXT_STYLE': 'UI_TEXT_STYLE' in c,
    'drawText func': 'function drawText(' in c,
    'blessing Y220': 'wy + 220' in c,
    'slot1 Y130': 'wy + 130' in c,
    'slot2 Y175': 'wy + 175' in c,
}
for k, v in checks.items():
    print(f'{k}: {"OK" if v else "MISS"}')
