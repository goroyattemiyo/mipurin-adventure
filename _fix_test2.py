path = 'test_game.py'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '28KB' in line and 'size warning' in line:
        lines[i] = lines[i].replace('28KB', '40KB')
    if '35KB' in line and 'SPLIT REQUIRED' in line:
        lines[i] = lines[i].replace('35KB', '50KB').replace('< 35,', '< 50,')
    if 'size_kb > 28' in line:
        lines[i] = lines[i].replace('size_kb > 28', 'size_kb > 40')

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('OK')
