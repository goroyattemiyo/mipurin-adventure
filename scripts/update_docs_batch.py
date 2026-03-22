import os

today = '2026-03-22'

# === 1. docs/RULES.md ===
with open('docs/RULES.md', 'r', encoding='utf-8') as f:
    rules = f.read()

size_old = [
    ('js/game.js        11.6KB  OK', 'js/game.js        11.4KB  OK'),
    ('js/data.js        30.2KB', 'js/data.js        29.0KB'),
    ('js/bgm.js          8.6KB  OK', 'js/bgm.js          9.5KB  OK'),
    ('js/blessings.js   20.0KB', 'js/blessings.js   20.1KB'),
    ('js/nodemap.js     14.1KB', 'js/nodemap.js     13.1KB'),
    ('js/ui.js          29.8KB', 'js/ui.js          29.5KB'),
    ('js/ui_screens.js  12.2KB', 'js/ui_screens.js  12.6KB'),
    ('js/update.js      17.8KB', 'js/update.js      17.9KB'),
    ('100件合格, 0件失敗', '146件合格, 0件失敗'),
]
for old, new in size_old:
    rules = rules.replace(old, new)

if '2026-03-22' not in rules:
    rules = rules.replace(
        '- 2026-03-21: v2',
        '- 2026-03-22: ファイルサイズ監視テーブル更新(v6.25対応), テスト146件反映\n- 2026-03-21: v2'
    )

with open('docs/RULES.md', 'w', encoding='utf-8', newline='\n') as f:
    f.write(rules)
print('[OK] docs/RULES.md updated')


# === 2. docs/ROADMAP.md ===
with open('docs/ROADMAP.md', 'r', encoding='utf-8') as f:
    road = f.read()

road = road.replace(
    'ステージ1: 開発ツール整備（現在）',
    'ステージ1: 開発ツール整備（✔ 完了 2026-03-21）'
)
road = road.replace(
    'ステージ2: BGM・音響強化（Sprint G-B）',
    'ステージ2: BGM・音響強化（Sprint G-B） ← 進行中'
)
road = road.replace(
    '| ステージ1（ツール） | 65（変動なし） |',
    '| ステージ1（ツール） | 65 ✔ |'
)

with open('docs/ROADMAP.md', 'w', encoding='utf-8', newline='\n') as f:
    f.write(road)
print('[OK] docs/ROADMAP.md updated')


# === 3. docs/DECISIONS.md ===
decisions = """# DECISIONS - 設計判断ログ

（新しい判断を上に追記する）

---

## D-003: テントウムシ・ショップUI改善提案
- 日付: 2026-03-22
- 背景: ショップ画面が数値カード表示のみで吸引力に乏しい
- 選択肢: A) 現状維持 B) NPC店主追加 C) テントウムシの行商人「テンちゃん」
- 決定: C (承認待ち)
- 理由: かわいい世界観に合致、セリフで感情移入を誘え、商品ラインナップ改善も同時実施
- スコア: 35/40 (着手許可ライン32以上)

## D-002: 武器進化DPSダウングレード問題
- 日付: 2026-03-21
- 背景: weapon_balance.pyで全武器のDPSをシミュレーションした結果、Tier1 Lv3→Tier2 Lv0でDPSが-21%〜-54%低下
- 選択肢: A) 即座修正 B) 記録して次スプリントで対応 C) 進化コスト調整
- 決定: B
- 理由: バランス変動はゲームプレイの手触りに影響が大きいため、慎重に対応すべき。現段階はツール整備を優先

## D-001: Stage 1 ツール整備の優先順位
- 日付: 2026-03-21
- 背景: 外部ライブラリ導入とPythonツールチェーンのどちらを先に進めるか
- 選択肢: A) ライブラリ先行(Howler.js等) B) Pythonツール先行 C) 並行
- 決定: B (Pythonツール先行)
- 理由: ライブラリは既存コードに影響が大きく、test_game.pyの更新も必要。Pythonツールはゲームコードに触れず品質改善可能
"""

with open('docs/DECISIONS.md', 'w', encoding='utf-8', newline='\n') as f:
    f.write(decisions)
print('[OK] docs/DECISIONS.md updated (3 entries)')


# === 4. docs/BACKLOG.md ===
with open('docs/BACKLOG.md', 'r', encoding='utf-8') as f:
    backlog = f.read()

if 'DPS' not in backlog:
    entry = '| 2026-03-21 | 武器進化DPSダウングレード修正(Tier1 Lv3→Tier2 Lv0で-21〜-54%) | weapon_balance.pyシミュレーション | 高 | 未着手 |'
    backlog = backlog.rstrip() + '\n' + entry + '\n'
    with open('docs/BACKLOG.md', 'w', encoding='utf-8', newline='\n') as f:
        f.write(backlog)
    print('[OK] docs/BACKLOG.md updated (added DPS downgrade entry)')
else:
    print('[SKIP] docs/BACKLOG.md already has DPS entry')


# === Summary ===
print()
print('=== BATCH UPDATE COMPLETE ===')
print('  1. docs/RULES.md      - file size table + history')
print('  2. docs/ROADMAP.md    - Stage 1 done, Stage 2 active')
print('  3. docs/DECISIONS.md  - D-001, D-002, D-003')
print('  4. docs/BACKLOG.md    - DPS downgrade entry')
