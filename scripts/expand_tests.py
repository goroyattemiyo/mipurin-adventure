"""test_game.py の拡張パッチ"""

with open('test_game.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix size calculation bug (1194 -> 1024)
content = content.replace('/ 1194', '/ 1024')

# 2. Add rarity.js and charms.js to JS_FILES
old_files = '''    "js/combat.js", "js/update.js", "js/render.js", "js/touch.js"
]'''
new_files = '''    "js/combat.js", "js/update.js", "js/render.js", "js/touch.js",
    "js/rarity.js", "js/charms.js"
]'''
content = content.replace(old_files, new_files)

# 3. Update size limit from 30KB to 35KB (per RULES.md)
content = content.replace('size < 30', 'size < 35')
content = content.replace('size < 30KB', 'size < 35KB')

# 4. Add cross-data integrity checks before summary
insert_marker = '# === Summary ==='
new_tests = '''# === 13. Cross-data integrity ===
print("\\n--- Cross-data Integrity ---")

# WEAPON_DEFS ids must be unique
wep_ids = re.findall(r"id:\\s*'([^']+)'", read("js/data.js"))
check("WEAPON_DEFS ids unique", len(wep_ids) == len(set(wep_ids)),
    f"duplicates: {[x for x in wep_ids if wep_ids.count(x) > 1]}")

# EVOLUTION_MAP keys must exist in WEAPON_DEFS
evo_keys = re.findall(r"^\\s+(\\w+):\\s+\\{\\s*to:", read("js/data.js"), re.MULTILINE)
for ek in evo_keys:
    check(f"evo source '{ek}' in WEAPON_DEFS", ek in wep_ids)

evo_targets = re.findall(r"to:\\s*'([^']+)'", read("js/data.js"))
for et in evo_targets:
    check(f"evo target '{et}' in WEAPON_DEFS", et in wep_ids)

# ENEMY_DEFS ids must match ENEMY_VARIANT_NAMES keys
enemies_js = read("js/enemies.js")
enemy_ids = re.findall(r"id:\\s*'([^']+)'", enemies_js)
variant_keys = re.findall(r"^\\s+(\\w+):\\s*\\[", enemies_js, re.MULTILINE)
if variant_keys:
    for eid in enemy_ids:
        if eid in ['boss_tree', 'boss_spider', 'boss_golem', 'boss_moth']:
            continue  # bosses may not have variants
        check(f"enemy '{eid}' has variant names", eid in variant_keys,
            f"missing from ENEMY_VARIANT_NAMES")

# SPRITE_MAP should cover all enemies
systems_js = read("js/systems.js")
sprite_keys = re.findall(r"'([^']+)'\\s*:", systems_js[systems_js.find("SPRITE_MAP"):systems_js.find("SPRITE_MAP")+3000])
for eid in enemy_ids:
    check(f"sprite exists for '{eid}'", eid in sprite_keys or eid.startswith('boss_'),
        "missing from SPRITE_MAP")

# CHARM_DEFS ids must be unique
charms_js = read("js/charms.js")
charm_ids = re.findall(r"id:\\s*'([^']+)'", charms_js)
check("CHARM_DEFS ids unique", len(charm_ids) == len(set(charm_ids)),
    f"duplicates: {[x for x in charm_ids if charm_ids.count(x) > 1]}")

# RARITY_DEFS must have 5 tiers
rarity_js = read("js/rarity.js")
rarity_ids = re.findall(r"id:\\s*'([^']+)'", rarity_js)
check("RARITY_DEFS has 5 tiers", len(rarity_ids) == 5,
    f"found {len(rarity_ids)}: {rarity_ids}")

# index.html loads all 16 JS files
html = read("index.html")
for f in ["rarity.js", "charms.js", "bgm.js", "combat.js", "touch.js"]:
    check(f"index.html loads {f}", f in html)

# === 14. File size monitoring (RULES.md compliance) ===
print("\\n--- File Size Monitoring ---")
attention_files = []
for f in JS_FILES:
    if not os.path.exists(f): continue
    size_kb = os.path.getsize(f) / 1024
    if size_kb > 28:
        attention_files.append((f, size_kb))
        check(f"size warning: {f} ({size_kb:.1f}KB > 28KB)", size_kb < 35,
            f"SPLIT REQUIRED: {size_kb:.1f}KB >= 35KB")
    else:
        check(f"size ok: {f} ({size_kb:.1f}KB)", True)

'''

content = content.replace(insert_marker, new_tests + insert_marker)

with open('test_game.py', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

# Count total checks
check_count = content.count('check(')
print(f'[OK] test_game.py updated: ~{check_count} checks estimated')
print('     - Fixed size calc (1194 -> 1024)')
print('     - Added rarity.js + charms.js to JS_FILES')
print('     - Updated size limit 30KB -> 35KB')
print('     - Added cross-data integrity checks')
print('     - Added file size monitoring')
