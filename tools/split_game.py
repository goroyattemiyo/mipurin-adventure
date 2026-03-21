with open('js/game.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

total = len(lines)
print(f'Total lines: {total}')

# Split points (0-indexed)
# game.js:   1-96   (Canvas, Input, Audio, BGM)
# data.js:   97-512  (BGM system thru Message System end)
# systems.js: 513-1051 (Enemies thru Collision start)
# engine.js:  1052-end (Collision, Update, Drawing, Main Loop)

splits = {
    'js/game.js':    (0, 96),
    'js/data.js':    (96, 512),
    'js/systems.js': (512, 1051),
    'js/engine.js':  (1051, total),
}

for fname, (start, end) in splits.items():
    chunk = lines[start:end]
    with open(fname, 'w', encoding='utf-8', newline='\n') as f:
        f.write(''.join(chunk))
    print(f'{fname}: lines {start+1}-{end} ({len(chunk)} lines)')
