import re

with open('js/game.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

targets = [
    'UI_TEXT_STYLE', 'function drawText(',
    'function drawInventory()', 'function drawInventoryItems()',
    'function drawCollectionTab()', 'function drawHUD()',
    'function drawBlessing()', 'function drawShop()',
    'function drawGarden()', 'function drawTitle()',
    'function drawFloatMessages()', 'function drawDmgNumbers()',
    'function drawDialogWindow()', 'function drawPrologue()',
    'function drawEnding()'
]

for t in targets:
    for i, line in enumerate(lines):
        if t in line:
            print(f'L{i+1}: {line.rstrip()[:80]}')
            break
    else:
        print(f'MISS: {t}')
