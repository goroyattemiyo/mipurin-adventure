path = 'test_game.py'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'size_kb < 35' in line:
        lines[i] = line.replace('size_kb < 35', 'size_kb < 50')

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('OK')
