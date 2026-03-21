with open('test_game.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: Boss enemy IDs - exclude by actual boss IDs not prefix
old_boss = "if eid in ['boss_tree', 'boss_spider', 'boss_golem', 'boss_moth']:"
new_boss = "if eid in ['queen_hornet', 'fungus_king', 'crystal_golem', 'shadow_moth']:"
content = content.replace(old_boss, new_boss)

# Fix 2: Also exclude bosses from SPRITE_MAP check
old_sprite = "check(f\"sprite exists for '{eid}'\", eid in sprite_keys or eid.startswith('boss_'),"
new_sprite = "check(f\"sprite exists for '{eid}'\", eid in sprite_keys or eid in ['queen_hornet', 'fungus_king', 'crystal_golem', 'shadow_moth'],"
content = content.replace(old_sprite, new_sprite)

# Fix 3: RARITY_DEFS is object-style, count keys instead
old_rarity = """rarity_ids = re.findall(r"id:\\s*'([^']+)'", rarity_js)
check("RARITY_DEFS has 5 tiers", len(rarity_ids) == 5,
    f"found {len(rarity_ids)}: {rarity_ids}")"""
new_rarity = """rarity_keys = re.findall(r"^\\s+(\\w+):\\s*\\{\\s*name:", rarity_js, re.MULTILINE)
check("RARITY_DEFS has 5 tiers", len(rarity_keys) == 5,
    f"found {len(rarity_keys)}: {rarity_keys}")"""
content = content.replace(old_rarity, new_rarity)

with open('test_game.py', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)

print('[OK] test_game.py fixed: boss exclusion + rarity detection')
