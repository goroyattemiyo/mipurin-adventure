import re

with open('js/game.js', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# Find function boundaries by brace counting
def find_func_end(lines, start_idx):
    depth = 0
    started = False
    for i in range(start_idx, len(lines)):
        for ch in lines[i]:
            if ch == '{':
                depth += 1
                started = True
            elif ch == '}':
                depth -= 1
                if started and depth == 0:
                    return i
    return len(lines) - 1

# Functions to extract (0-indexed line numbers)
extract = [
    ('drawText', 61),
    ('drawInventory', 142),
    ('drawInventoryItems', 165),
    ('drawCollectionTab', 208),
    ('drawFloatMessages', 612),
    ('drawDialogWindow', 645),
    ('drawPrologue', 1183),
    ('drawEnding', 1776),
    ('drawHUD', 1886),
    ('drawBlessing', 1949),
    ('drawShop', 1971),
    ('drawGarden', 2030),
    ('drawTitle', 2078),
    ('drawDmgNumbers', 2197),
]

# Also extract UI_TEXT_STYLE constant (line 49 to line before drawText)
style_start = 49  # const UI_TEXT_STYLE

results = []
for name, start in extract:
    end = find_func_end(lines, start)
    results.append((name, start, end))
    print(f'{name}: L{start+1}-L{end+1} ({end-start+1} lines)')

# Build ui.js content
ui_lines = []
ui_lines.append('// ===== UI DRAWING MODULE (ui.js) =====')
ui_lines.append('// Extracted from game.js for maintainability')
ui_lines.append('// All UI screen rendering functions')
ui_lines.append('')

# Add UI_TEXT_STYLE (lines 49-60)
for i in range(49, 62):
    ui_lines.append(lines[i])
ui_lines.append('')

# Add each function
for name, start, end in sorted(results, key=lambda x: x[1]):
    ui_lines.append('')
    for i in range(start, end + 1):
        ui_lines.append(lines[i])
    ui_lines.append('')

with open('js/ui.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(ui_lines))

# Remove extracted lines from game.js (replace with empty/comment)
# Collect all line ranges to remove
remove_ranges = [(49, 61)]  # UI_TEXT_STYLE block
for name, start, end in results:
    remove_ranges.append((start, end))

# Sort and merge
remove_ranges.sort()
remove_set = set()
for s, e in remove_ranges:
    for i in range(s, e + 1):
        remove_set.add(i)

new_game_lines = []
removed_count = 0
for i, line in enumerate(lines):
    if i in remove_set:
        removed_count += 1
    else:
        new_game_lines.append(line)

with open('js/game.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(new_game_lines))

print(f'\nExtracted {len(remove_set)} lines to js/ui.js')
print(f'game.js reduced by {removed_count} lines')
print(f'ui.js has {len(ui_lines)} lines')
