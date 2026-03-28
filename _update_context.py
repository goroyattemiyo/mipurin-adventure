path = 'docs/CONTEXT.md'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

old = "### ワークフロー\n```\n1. 影響範囲宣言 → 2. コード変更 → 3. node -c 構文チェック\n→ 4. python test_game.py (157/157 PASS必須) → 5. git push → 6. ブラウザ実機確認\n```"

new = "### ワークフロー\n```\n1. 影響範囲宣言 → 2. コード変更 → 3. node -c 構文チェック\n→ 4. python test_game.py (157/157 PASS必須) → 5. git push → 6. ブラウザ実機確認\n```\n**コード変更はPythonスクリプトで行う**\n- Set-Content で .py ファイルを生成 → python で実行（ファイル読み書き・文字列置換）\n- ユーザーが実行結果を確認してから次のステップへ進む"

src = src.replace(old, new, 1)

old2 = '- 2026-03-28: セッションプロトコルに「必要ファイルのRaw URLを列挙→ユーザーに貼付」ルール追加'
new2 = '- 2026-03-28: コード変更はPythonスクリプト生成（Set-Content→python実行）、確認後に次ステップへ進むルールを明文化\n' + old2

src = src.replace(old2, new2, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)
print('OK')
