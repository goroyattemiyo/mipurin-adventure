# CONTEXT.md 更新
path = 'docs/CONTEXT.md'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

# バージョン・テスト数更新
src = src.replace('| バージョン | v6.37 |', '| バージョン | v6.38 |')
src = src.replace('| テスト | 157/157 PASS |', '| テスト | 159/159 PASS |')

# ルール変更履歴に追記
old = '- 2026-03-28: コード変更はPythonスクリプト生成'
new = '- 2026-03-28: タブUIキーヒント表示タスクを次セッションへ持ち越し（原神風）\n' + old
src = src.replace(old, new, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)
print('CONTEXT OK')

# REFERENCE.md 更新
path2 = 'docs/REFERENCE.md'
with open(path2, 'r', encoding='utf-8') as f:
    src2 = f.read()

old2 = '## D-004 (2026-03-22)'
new2 = '''## D-008: test_game.py サイズ閾値更新 (2026-03-28)
* 背景: ファイルサイズ上限緩和(D-008 35KB→50KB)に合わせてテストも更新が必要
* 決定: size < 35KB → size < 50KB、警告閾値 28KB → 40KB に修正
* スコア: -

## D-004 (2026-03-22)'''
src2 = src2.replace(old2, new2, 1)

with open(path2, 'w', encoding='utf-8') as f:
    f.write(src2)
print('REFERENCE OK')
