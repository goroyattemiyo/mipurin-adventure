"""find_dead_code.py - 未使用関数・変数の検出"""
import re, os, sys

JS_DIR = 'js'
JS_FILES = [f for f in os.listdir(JS_DIR) if f.endswith('.js')]

# 1. 全ファイルの内容を読み込み
all_code = {}
for fname in JS_FILES:
    with open(os.path.join(JS_DIR, fname), 'r', encoding='utf-8') as f:
        all_code[fname] = f.read()

full_code = '\n'.join(all_code.values())

# 2. 関数定義を抽出 (function name(...) と const/let/var name = function)
func_defs = {}
for fname, code in all_code.items():
    # function funcName(
    for m in re.finditer(r'function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(', code):
        name = m.group(1)
        if name not in func_defs:
            func_defs[name] = fname

    # const/let/var funcName = function
    for m in re.finditer(r'(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:function|\()', code):
        name = m.group(1)
        if name not in func_defs:
            func_defs[name] = fname

# 3. 各関数が他の場所で参照されているか確認
# 定義行自体を除外するため、関数名の出現回数をカウント
dead_functions = []
for name, defined_in in sorted(func_defs.items()):
    # 定義パターンを除いた参照を探す
    # 関数名が単語境界で出現する回数
    pattern = r'\b' + re.escape(name) + r'\b'
    occurrences = len(re.findall(pattern, full_code))

    # 定義自体で1回は出現するので、2回以上なら使われている
    if occurrences <= 1:
        dead_functions.append((name, defined_in))

# 4. index.html からの参照もチェック (onload等)
html_code = ''
if os.path.exists('index.html'):
    with open('index.html', 'r', encoding='utf-8') as f:
        html_code = f.read()

# HTML から参照されているものは除外
dead_filtered = []
for name, defined_in in dead_functions:
    if name in html_code:
        continue
    dead_filtered.append((name, defined_in))

# 5. 結果出力
print('=' * 60)
print(f'  Dead Code Detection Report')
print(f'  Scanned: {len(JS_FILES)} JS files')
print(f'  Total functions found: {len(func_defs)}')
print('=' * 60)

if dead_filtered:
    print(f'\n  POTENTIALLY UNUSED FUNCTIONS: {len(dead_filtered)}')
    print('-' * 60)
    by_file = {}
    for name, defined_in in dead_filtered:
        by_file.setdefault(defined_in, []).append(name)
    for fname in sorted(by_file.keys()):
        print(f'\n  {fname}:')
        for name in sorted(by_file[fname]):
            print(f'    - {name}()')
    print()
else:
    print('\n  No dead code found!\n')

# 6. サイズ影響の推定
print('-' * 60)
print('  File sizes (attention needed):')
for fname in sorted(JS_FILES):
    path = os.path.join(JS_DIR, fname)
    size_kb = os.path.getsize(path) / 1024
    marker = ' *** ATTENTION' if size_kb > 28 else ''
    dead_in_file = [n for n, f in dead_filtered if f == fname]
    dead_str = f' ({len(dead_in_file)} unused)' if dead_in_file else ''
    print(f'    {fname:20s} {size_kb:6.1f} KB{dead_str}{marker}')

print('=' * 60)
