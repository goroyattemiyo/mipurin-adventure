with open('js/ui.js', 'r', encoding='utf-8') as f:
    c = f.read()
opens = c.count('{')
closes = c.count('}')
print(f'{{ count: {opens}')
print(f'}} count: {closes}')
print(f'diff: {opens - closes}')
