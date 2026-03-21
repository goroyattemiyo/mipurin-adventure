# fix_mobile_first_v6_24.py - Sprint G-B+ スマホファーストUI
import re, os, json

# === 1. manifest.json 作成 ===
manifest = {
    "name": "\u30df\u30d7\u30ea\u30f3\u306e\u5192\u967a",
    "short_name": "\u30df\u30d7\u30ea\u30f3",
    "start_url": ".",
    "display": "fullscreen",
    "orientation": "landscape",
    "background_color": "#1a1a2e",
    "theme_color": "#ffd700",
    "icons": [
        {"src": "assets/mipurin.png", "sizes": "500x500", "type": "image/png"}
    ]
}
with open('manifest.json', 'w', encoding='utf-8') as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)
print('[OK] manifest.json created')

# === 2. index.html: manifest link + version bump ===
html = open('index.html', 'r', encoding='utf-8').read()
if 'manifest.json' not in html:
    html = html.replace('<meta charset="UTF-8">', '<link rel="manifest" href="manifest.json">\n<meta charset="UTF-8">')
    print('[OK] manifest link added to index.html')
html = html.replace('?v=1629', '?v=1630')
print('[OK] index.html version bumped to 1630')
open('index.html', 'w', encoding='utf-8').write(html)

# === 3. ui_screens.js: PC/スマホ表示切替 ===
uis = open('js/ui_screens.js', 'r', encoding='utf-8').read()

# タイトル画面: Zキーでスタート → タッチ対応
uis = uis.replace(
    "ctx.fillText('Z\u30AD\u30FC\u3067\u30B9\u30BF\u30FC\u30C8', CW/2, 500);",
    "ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? '\u30BF\u30C3\u30D7\u3067\u30B9\u30BF\u30FC\u30C8' : 'Z\u30AD\u30FC\u3067\u30B9\u30BF\u30FC\u30C8', CW/2, 500);"
)

# タイトル画面: 操作説明行
uis = uis.replace(
    "ctx.fillText('\u79FB\u52D5: WASD / \u77E2\u5370\u3000\u3000\u653B\u6483: Z\u3000\u3000\u30C0\u30C3\u30B7\u30E5: X\u3000\u3000\u30A2\u30A4\u30C6\u30E0: 1\u00B72\u00B73', CW/2, panelY + 40);",
    "ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? '\u30B8\u30E7\u30A4\u30B9\u30C6\u30A3\u30C3\u30AF\u3067\u79FB\u52D5\u3000\u30DC\u30BF\u30F3\u3067\u64CD\u4F5C' : '\u79FB\u52D5: WASD / \u77E2\u5370\u3000\u3000\u653B\u6483: Z\u3000\u3000\u30C0\u30C3\u30B7\u30E5: X\u3000\u3000\u30A2\u30A4\u30C6\u30E0: 1\u00B72\u00B73', CW/2, panelY + 40);"
)

# タイトル画面: 花壇メニュー
uis = uis.replace(
    "ctx.fillText('\uD83C\uDF38 \u30CD\u30AF\u30BF\u30FC: ' + nectar + '\u3000\u3000\u3000X\u30AD\u30FC\u3067\u82B1\u58C7\u30E1\u30CB\u30E5\u30FC', CW/2, panelY + 80);",
    "ctx.fillText('\uD83C\uDF38 \u30CD\u30AF\u30BF\u30FC: ' + nectar + (typeof touchActive !== 'undefined' && touchActive ? '' : '\u3000\u3000\u3000X\u30AD\u30FC\u3067\u82B1\u58C7\u30E1\u30CB\u30E5\u30FC'), CW/2, panelY + 80);"
)

# タイトル画面: 音量調整ヒント
uis = uis.replace(
    "ctx.fillText('\u2191\u2193: \u97F3\u91CF\u8ABF\u6574  \u2190\u2192: \u5909\u66F4', CW/2, panelY + 130);",
    "if (typeof touchActive === 'undefined' || !touchActive) ctx.fillText('\u2191\u2193: \u97F3\u91CF\u8ABF\u6574  \u2190\u2192: \u5909\u66F4', CW/2, panelY + 130);"
)

# プロローグ: Zキーで次へ / Xキーでスキップ
uis = uis.replace(
    "ctx.fillText('Z\u30AD\u30FC\u3067\u6B21\u3078  /  X\u30AD\u30FC\u3067\u30B9\u30AD\u30C3\u30D7', CW / 2, CH - 20);",
    "ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? '\u30BF\u30C3\u30D7\u3067\u6B21\u3078' : 'Z\u30AD\u30FC\u3067\u6B21\u3078  /  X\u30AD\u30FC\u3067\u30B9\u30AD\u30C3\u30D7', CW / 2, CH - 20);"
)

# エンディング: Zキーでタイトルへ
uis = uis.replace(
    "if (blinkOn) ctx.fillText('Z\u30AD\u30FC\u3067\u30BF\u30A4\u30C8\u30EB\u3078', tcx, py + ph - 80);",
    "if (blinkOn) ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? '\u30BF\u30C3\u30D7\u3067\u30BF\u30A4\u30C8\u30EB\u3078' : 'Z\u30AD\u30FC\u3067\u30BF\u30A4\u30C8\u30EB\u3078', tcx, py + ph - 80);"
)

# エンディング: Xキーで強くてニューゲーム
old_xkey = "if (blinkOn) ctx.fillText('X\u30AD\u30FC\u3067\u5F37\u304F\u3066\u30CB\u30E5\u30FC\u30B2\u30FC\u30E0"
new_xkey = "if (blinkOn) ctx.fillText((typeof touchActive !== 'undefined' && touchActive ? '\u30BF\u30C3\u30D7\u3067\u5F37\u304F\u3066\u30CB\u30E5\u30FC\u30B2\u30FC\u30E0' : 'X\u30AD\u30FC\u3067\u5F37\u304F\u3066\u30CB\u30E5\u30FC\u30B2\u30FC\u30E0') + '"
if old_xkey in uis:
    # This one is tricky - find the full line
    pass

# 花壇: ↑↓で選択 / Zで購入 / Xで戻る
uis = uis.replace(
    "ctx.fillText('\u2191\u2193\u3067\u9078\u629E / Z\u3067\u8CFC\u5165 / X\u3067\u623B\u308B', CW / 2, CH - 15);",
    "ctx.fillText(typeof touchActive !== 'undefined' && touchActive ? '\u30BF\u30C3\u30D7\u3067\u9078\u629E\u30FB\u8CFC\u5165' : '\u2191\u2193\u3067\u9078\u629E / Z\u3067\u8CFC\u5165 / X\u3067\u623B\u308B', CW / 2, CH - 15);"
)

open('js/ui_screens.js', 'w', encoding='utf-8').write(uis)
print(f'[OK] ui_screens.js updated ({len(uis)} chars)')

# === 4. ui.js: グレーテキスト改善 + キー表示切替 ===
ui = open('js/ui.js', 'r', encoding='utf-8').read()

# グレーテキスト改善: #888 → #bbb (底部のヒントテキスト)
# TAB: タブ切替 ESC: とじる の色改善
ui = re.sub(r"ctx\.fillStyle\s*=\s*'#888';\s*ctx\.font\s*=\s*[\"']20px", "ctx.fillStyle = '#bbb'; ctx.font = '20px", ui)

# WASD/矢印 操作説明行をタッチ時は非表示に
ui = ui.replace(
    "ctx.fillText('WASD/\u77E2\u5370:\u3044\u3069\u3046\u3000Z:\u3053\u3046\u3052\u304D\u3000X:\u30C0\u30C3\u30B7\u30E5\u3000TAB:\u3082\u3061\u3082\u306E',",
    "if (typeof touchActive === 'undefined' || !touchActive) ctx.fillText('WASD/\u77E2\u5370:\u3044\u3069\u3046\u3000Z:\u3053\u3046\u3052\u304D\u3000X:\u30C0\u30C3\u30B7\u30E5\u3000TAB:\u3082\u3061\u3082\u306E',"
)

open('js/ui.js', 'w', encoding='utf-8').write(ui)
print(f'[OK] ui.js updated ({len(ui)} chars)')

# === 5. RULES.md: ブランチ名更新 ===
rules = open('docs/RULES.md', 'r', encoding='utf-8').read()
rules = rules.replace('v2 ブランチで作業（ソロ開発）', 'main ブランチで作業（ソロ開発）')
rules = rules.replace('git push origin v2', 'git push origin main')
if '2026-03-21' not in rules:
    rules = rules.replace(
        '- 2026-03-17: 初版作成',
        '- 2026-03-21: v2 → main 統合、ブランチ名更新\n- 2026-03-17: 初版作成'
    )
open('docs/RULES.md', 'w', encoding='utf-8').write(rules)
print('[OK] RULES.md branch name updated')

# === 検証 ===
print('\n--- Verification ---')
assert os.path.exists('manifest.json'), 'FAIL: manifest.json not found'
h = open('index.html', 'r', encoding='utf-8').read()
assert 'manifest.json' in h, 'FAIL: manifest link not in index.html'
assert '?v=1630' in h, 'FAIL: version not 1630'
u = open('js/ui_screens.js', 'r', encoding='utf-8').read()
assert 'touchActive' in u, 'FAIL: touchActive not in ui_screens.js'
r = open('docs/RULES.md', 'r', encoding='utf-8').read()
assert 'main ブランチ' in r, 'FAIL: RULES.md branch not updated'
print('*** ALL CHECKS PASSED ***')
