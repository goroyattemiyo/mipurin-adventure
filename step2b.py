path = r'C:\dev\mipurin-adventure\js\ui.js'

with open(path, 'r', encoding='utf-8') as f:
    src = f.read()

# 改行コードを問わず削除
import re
new_src, count = re.subn(r'let collectionSubTab = 0; // 0=enemies, 1=weapons\r?\n', '', src, count=1)

if count == 0:
    # 先頭付近を16進ダンプして確認
    print('NOT FOUND. 先頭200文字:')
    print(repr(src[:200]))
else:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_src)
    print('OK: collectionSubTab宣言を削除しました')
