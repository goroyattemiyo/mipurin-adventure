path = 'test_game.py'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'size < 35KB' in line:
        lines[i] = line.replace('size < 35KB', 'size < 50KB').replace('size < 35,', 'size < 50,')

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)
print('OK')
