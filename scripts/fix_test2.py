import pathlib

lines = pathlib.Path('test_game.py').read_text(encoding='utf-8').split('\n')
new_lines = []
skip = 0
for i, line in enumerate(lines):
    if skip > 0:
        skip -= 1
        continue
    # Detect the broken block (starts with comment about Tab open/cycle)
    if 'Tab open/cycle uses if/else' in line or "Tab doesn't close AND cycle" in line:
        # Skip this comment + next lines until we pass bool(tab_clean)) or bool(tab_line))
        skip = 0
        for j in range(i+1, min(i+6, len(lines))):
            if 'bool(tab_clean)' in lines[j] or 'bool(tab_line)' in lines[j]:
                skip = j - i
                break
        if skip == 0:
            skip = 3
        # Insert fixed version
        new_lines.append('# Verify Tab uses if/else so open and cycle never fire together')
        new_lines.append('tab_ok = "inventoryOpen = !inventoryOpen" not in update_js')
        new_lines.append('tab_ok2 = "if (!inventoryOpen)" in update_js')
        new_lines.append('check("Tab toggle is clean (no side effects on same press)", tab_ok and tab_ok2)')
        continue
    new_lines.append(line)

pathlib.Path('test_game.py').write_text('\n'.join(new_lines), encoding='utf-8')
print('[DONE] test_game.py fixed')
