import pathlib

code = pathlib.Path('test_game.py').read_text(encoding='utf-8')

old_test = '''# Verify Tab doesn't close AND cycle at same time
tab_line = re.search(r"wasPressed\('Tab'\)\)\s*\{\s*inventoryOpen\s*=\s*!inventoryOpen", update_js)
check("Tab toggle is clean (no side effects on same press)",
    bool(tab_line))'''

new_test = '''# Verify Tab open/cycle uses if/else (no simultaneous toggle+cycle)
tab_clean = re.search(r"wasPressed\('Tab'\).*\n\s*if \(!inventoryOpen\).*\n.*else.*inventoryTab", update_js)
check("Tab toggle is clean (no side effects on same press)",
    bool(tab_clean))'''

if old_test in code:
    code = code.replace(old_test, new_test)
    print('[OK] Test updated')
else:
    print('[WARN] Exact match failed, trying line-by-line...')
    code = code.replace(
        "wasPressed\\('Tab'\\)\\)\\s*\\{\\s*inventoryOpen\\s*=\\s*!inventoryOpen",
        "wasPressed\\('Tab'\\).*\\n\\s*if \\(!inventoryOpen\\).*\\n.*else.*inventoryTab"
    )
    print('[OK] Regex pattern updated')

pathlib.Path('test_game.py').write_text(code, encoding='utf-8')
