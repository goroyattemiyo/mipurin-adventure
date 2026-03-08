import re

with open('js/game.js', 'r', encoding='utf-8') as f:
    code = f.read()

# 層別置換マップ: (検索文字列, 置換文字列)
replacements = [
    # === A層: 見出し (120-160px bold) ===
    # タイトル
    ("'bold 64px M PLUS Rounded 1c, sans-serif'", "'bold 140px M PLUS Rounded 1c, sans-serif'"),
    # ゲームオーバー
    ("'bold 48px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc'", "'bold 120px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('\u30b2\u30fc\u30e0\u30aa\u30fc\u30d0\u30fc'"),
    # FLOOR CLEAR
    ("'bold 36px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('FLOOR", "'bold 80px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('FLOOR"),
    # WAVE表示
    ("'bold 28px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('WAVE", "'bold 64px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('WAVE"),
    # Zキーでスタート
    ("'bold 32px M PLUS Rounded 1c, sans-serif'", "'bold 64px M PLUS Rounded 1c, sans-serif'"),
    # バージョン
    ("'24px M PLUS Rounded 1c, sans-serif'", "'40px M PLUS Rounded 1c, sans-serif'"),
    # 花の市場
    ("'bold 28px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center';\n    ctx.fillText('\ud83c\udf38", "'bold 56px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center';\n    ctx.fillText('\ud83c\udf38"),
    # ノード選択タイトル
    ("'48px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('\ud83c\udf3c", "'80px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('\ud83c\udf3c"),

    # === B層: 選択 (48-64px bold) ===
    # ノード名
    ("'bold 22px M PLUS Rounded 1c, sans-serif';\n      ctx.fillText(n.icon", "'bold 48px M PLUS Rounded 1c, sans-serif';\n      ctx.fillText(n.icon"),
    # ショップアイコン
    ("'32px M PLUS Rounded 1c, sans-serif'; ctx.fillText(s.icon", "'48px M PLUS Rounded 1c, sans-serif'; ctx.fillText(s.icon"),
    # ショップ名
    ("'bold 19px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText(s.name", "'bold 36px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText(s.name"),
    # ショップ買う
    ("'bold 20px M PLUS Rounded 1c, sans-serif';\n      ctx.fillText(canBuy", "'bold 36px M PLUS Rounded 1c, sans-serif';\n      ctx.fillText(canBuy"),
    # ショップコスト
    ("'bold 20px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText(s.cost", "'bold 36px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText(s.cost"),
    # イベント選択肢
    ("'bold 22px M PLUS Rounded 1c, sans-serif';\n        ctx.fillText(nodeCursor", "'bold 44px M PLUS Rounded 1c, sans-serif';\n        ctx.fillText(nodeCursor"),

    # === C層: HUD (36-44px bold) ===
    # フロア表示(通常)
    ("'bold 20px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText('\u30d5\u30ed\u30a2 ' + floor + '  W'", "'bold 40px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText('\u30d5\u30ed\u30a2 ' + floor + '  W'"),
    # フロア表示(ボス)
    ("'bold 20px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText('\u30d5\u30ed\u30a2 ' + floor + '  \u30dc\u30b9'", "'bold 40px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText('\u30d5\u30ed\u30a2 ' + floor + '  \u30dc\u30b9'"),
    # 武器名
    ("'20px M PLUS Rounded 1c, sans-serif'; ctx.fillText('\u2694 ' + player.weapon.name", "'36px M PLUS Rounded 1c, sans-serif'; ctx.fillText('\u2694 ' + player.weapon.name"),
    # ATK
    ("'20px M PLUS Rounded 1c, sans-serif'; ctx.fillText('ATK:'", "'36px M PLUS Rounded 1c, sans-serif'; ctx.fillText('ATK:'"),
    # 花粉(ショップ)
    ("'bold 20px M PLUS Rounded 1c, sans-serif';\n  ctx.fillText('\ud83d\udc9b \u82b1\u7c89: '", "'bold 40px M PLUS Rounded 1c, sans-serif';\n  ctx.fillText('\ud83d\udc9b \u82b1\u7c89: '"),

    # === D層: フロート (40-48px bold) ===
    # ダメージ数字
    ("'bold 20px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(d.val", "'bold 40px M PLUS Rounded 1c, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(d.val"),

    # === E層: テキスト (28-36px normal) ===
    # ゲームオーバー スコア
    ("'20px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText('\u30b9\u30b3\u30a2: '", "'32px M PLUS Rounded 1c, sans-serif';\n    ctx.fillText('\u30b9\u30b3\u30a2: '"),
    # 操作説明(タイトル)
    ("'20px M PLUS Rounded 1c, sans-serif';\n  ctx.fillText('\u79fb\u52d5: WASD", "'32px M PLUS Rounded 1c, sans-serif';\n  ctx.fillText('\u79fb\u52d5: WASD"),
    # メニュー操作説明
    ("'20px M PLUS Rounded 1c, sans-serif';\n  ctx.fillText('\u2190\u2191\u3067\u9078\u629e", "'28px M PLUS Rounded 1c, sans-serif';\n  ctx.fillText('\u2190\u2191\u3067\u9078\u629e"),
]

count = 0
for old, new in replacements:
    if old in code:
        code = code.replace(old, new, 1)
        count += 1
        print(f"OK: {old[:40]}...")
    else:
        print(f"MISS: {old[:40]}...")

with open('js/game.js', 'w', encoding='utf-8') as f:
    f.write(code)

print(f"\nDone: {count}/{len(replacements)} replacements applied")
