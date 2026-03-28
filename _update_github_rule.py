path = 'docs/CONTEXT.md'
with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

old = '- 2026-03-28: タブUIキーヒント表示タスクを次セッションへ持ち越し（原神風）'
new = '- 2026-03-28: GitHub MCP連携を使いファイル取得はツールで行う（Raw URL手動貼り付け不要）\n- 2026-03-28: タブUIキーヒント表示タスクを次セッションへ持ち越し（原神風）'
src = src.replace(old, new, 1)

old2 = 'GitHubはblob URLではなく raw.githubusercontent.com を使う。'
new2 = 'GitHubはblob URLではなく raw.githubusercontent.com を使う。\nGitHub MCPが利用可能な場合はツールで直接ファイルを取得する（Raw URL手動貼り付け不要）。'
src = src.replace(old2, new2, 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(src)
print('OK')
