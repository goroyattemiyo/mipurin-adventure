"""dep_graph.py - モジュール間依存関係をMermaid記法で出力"""
import re, os

JS_DIR = 'js'
JS_FILES = sorted([f for f in os.listdir(JS_DIR) if f.endswith('.js')])

# 1. 各ファイルで定義されている関数・変数を収集
definitions = {}  # name -> filename
for fname in JS_FILES:
    with open(os.path.join(JS_DIR, fname), 'r', encoding='utf-8') as f:
        code = f.read()
    
    # function declarations
    for m in re.finditer(r'function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(', code):
        definitions[m.group(1)] = fname
    
    # const/let/var at top level (rough: lines starting with const/let/var)
    for m in re.finditer(r'^(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=', code, re.MULTILINE):
        name = m.group(1)
        # Skip loop vars and short locals
        if len(name) > 2 and name[0].isupper() or name.startswith('draw') or name.startswith('update') or name.startswith('play') or name.startswith('stop'):
            definitions[name] = fname

# 2. 各ファイルが参照する外部定義を検出
edges = {}  # (from_file, to_file) -> set of names
for fname in JS_FILES:
    with open(os.path.join(JS_DIR, fname), 'r', encoding='utf-8') as f:
        code = f.read()
    
    for name, defined_in in definitions.items():
        if defined_in == fname:
            continue  # 自ファイル定義はスキップ
        pattern = r'\b' + re.escape(name) + r'\b'
        if re.search(pattern, code):
            key = (fname, defined_in)
            if key not in edges:
                edges[key] = set()
            edges[key].add(name)

# 3. Mermaid グラフ出力
print('# Module Dependency Graph')
print()
print('```mermaid')
print('graph LR')

# ノード定義（サイズ付き）
for fname in JS_FILES:
    path = os.path.join(JS_DIR, fname)
    size_kb = os.path.getsize(path) / 1024
    node_id = fname.replace('.', '_')
    marker = ':::attention' if size_kb > 28 else ''
    print(f'    {node_id}["{fname}<br/>{size_kb:.1f}KB"]')

print()

# エッジ
for (from_f, to_f), names in sorted(edges.items()):
    from_id = from_f.replace('.', '_')
    to_id = to_f.replace('.', '_')
    count = len(names)
    label = f"{count} refs"
    print(f'    {from_id} -->|{label}| {to_id}')

print('```')
print()

# 4. 依存関係サマリ（テキスト表形式）
print('## Dependency Summary')
print()
print(f'| From | To | Count | Functions/Variables |')
print(f'|---|---|---|---|')
for (from_f, to_f), names in sorted(edges.items(), key=lambda x: -len(x[1])):
    names_str = ', '.join(sorted(names)[:5])
    if len(names) > 5:
        names_str += f' (+{len(names)-5} more)'
    print(f'| {from_f} | {to_f} | {len(names)} | {names_str} |')

print()

# 5. 被依存ランキング（変更影響が大きいファイル）
print('## Impact Ranking (most depended-on files)')
print()
dep_count = {}
for (from_f, to_f), names in edges.items():
    dep_count[to_f] = dep_count.get(to_f, 0) + len(names)

for fname, count in sorted(dep_count.items(), key=lambda x: -x[1]):
    size_kb = os.path.getsize(os.path.join(JS_DIR, fname)) / 1024
    print(f'  {fname:20s} referenced {count:3d} times ({size_kb:.1f} KB)')
