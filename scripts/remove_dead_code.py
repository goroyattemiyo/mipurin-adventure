"""remove_dead_code.py - 確認済み未使用関数を削除"""
import re

targets = {
    'js/bgm.js': ['fadeOutBGM'],
    'js/data.js': ['drawTitleParticles', 'setBlock', 'updateTitleParticles'],
    'js/nodemap.js': ['generateNodes'],
    'js/ui.js': ['drawText'],
}

total_removed = 0

for filepath, funcs in targets.items():
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    new_lines = []
    skip = False
    brace_depth = 0
    removed_in_file = 0
    removed_lines = 0

    i = 0
    while i < len(lines):
        line = lines[i]

        # Check if this line starts a dead function
        start_match = False
        for fname in funcs:
            if re.match(r'function\s+' + re.escape(fname) + r'\s*\(', line.strip()):
                start_match = True
                break

        if start_match:
            # Count braces to find end of function
            brace_depth = 0
            started = False
            while i < len(lines):
                for ch in lines[i]:
                    if ch == '{':
                        brace_depth += 1
                        started = True
                    elif ch == '}':
                        brace_depth -= 1
                if started and brace_depth == 0:
                    removed_lines += 1
                    i += 1
                    removed_in_file += 1
                    break
                removed_lines += 1
                i += 1
        else:
            new_lines.append(line)
            i += 1

    if removed_in_file > 0:
        with open(filepath, 'w', encoding='utf-8', newline='\n') as f:
            f.writelines(new_lines)

        old_size = sum(len(l.encode('utf-8')) for l in lines)
        new_size = sum(len(l.encode('utf-8')) for l in new_lines)
        saved = (old_size - new_size) / 1024
        print(f'[OK] {filepath}: removed {removed_in_file} function(s), saved {saved:.1f} KB')
        total_removed += removed_in_file

print(f'\nTotal: {total_removed} dead functions removed')
