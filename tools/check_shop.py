with open('js/game.js', 'r', encoding='utf-8') as f:
    c = f.read()

checks = [
    ('guide Y185', '\u25c4\u25ba\u3067\u9078\u3076', 'sy + 185'),
    ('name 18px', "bold 18px 'M PLUS Rounded 1c'", 'slice(0,8)'),
    ('pollen short', '\u2716 \u82b1\u7c89\u4e0d\u8db3', None),
    ('desc Y140', 'sy + 140', None),
]
for label, needle, extra in checks:
    found = needle in c
    print(f'{label}: {"OK" if found else "MISS"}')
