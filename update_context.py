path = r'C:\dev\mipurin-adventure\docs\CONTEXT.md'

with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

addition = "- 2026-03-28: Pythonスクリプト生成はヒアドキュメント + Set-Content経由で.pyファイル保存後に実行する形式に統一。PowerShellの引用符干渉回避のため。インラインpython -c は使わない。\n"

target = '## 7. ルール変更履歴'
if target not in src:
    print('ERROR: 挿入位置が見つかりません')
else:
    src = src.replace(target, target + '\n' + addition)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    print('OK: CONTEXT.md ルール変更履歴を更新しました')
