"""weapon_balance.py - 武器DPS・バランス分析ツール"""

# WEAPON_DEFS from data.js (manually extracted)
WEAPONS = [
    # Tier 1
    {"id": "needle",           "name": "蜂の針",       "dmgMul": 1.0, "range": 64,  "speed": 0.18, "tier": 1, "fx": "double"},
    {"id": "honey_cannon",     "name": "蜜砲",         "dmgMul": 1.5, "range": 108, "speed": 0.50, "tier": 1, "fx": "none"},
    {"id": "pollen_shield",    "name": "花粉盾",       "dmgMul": 0.8, "range": 52,  "speed": 0.35, "tier": 1, "fx": "none"},
    {"id": "vine_whip",        "name": "蔦鞭",         "dmgMul": 0.7, "range": 84,  "speed": 0.40, "tier": 1, "fx": "360"},
    {"id": "feather_shuriken", "name": "羽根手裏剣",   "dmgMul": 0.5, "range": 76,  "speed": 0.12, "tier": 1, "fx": "double"},
    {"id": "queen_staff",      "name": "女王の杖",     "dmgMul": 2.0, "range": 68,  "speed": 0.65, "tier": 1, "fx": "aoe"},
    # Tier 2 — speed adjusted 2026-03-24 to ensure T2 Lv0 >= T1 Lv3 * 1.15
    {"id": "golden_needle",    "name": "蜂の金針",     "dmgMul": 1.3, "range": 68,  "speed": 0.064, "tier": 2, "fx": "double"},
    {"id": "amber_cannon",     "name": "蜜の大砲",     "dmgMul": 1.8, "range": 120, "speed": 0.30,  "tier": 2, "fx": "none"},
    {"id": "holy_shield",      "name": "聖花の盾",     "dmgMul": 1.0, "range": 60,  "speed": 0.16,  "tier": 2, "fx": "none"},
    {"id": "cursed_thorn",     "name": "呪いの荊",     "dmgMul": 0.9, "range": 96,  "speed": 0.19,  "tier": 2, "fx": "360"},
    {"id": "storm_wing",       "name": "翼の嵐",       "dmgMul": 0.7, "range": 84,  "speed": 0.033, "tier": 2, "fx": "double"},
    {"id": "queen_true_staff", "name": "女王の真杖",   "dmgMul": 2.5, "range": 76,  "speed": 0.47,  "tier": 2, "fx": "aoe"},
]

UPGRADE_MAX = 3
BASE_ATK = 2  # player initial ATK

def calc_upgraded(w, level):
    """Apply upgrade bonuses (same formula as data.js upgradeWeapon)"""
    dmg = w["dmgMul"] + level * 0.2
    spd = max(0.08, w["speed"] - level * 0.03)
    rng = w["range"] + level * 4
    return dmg, spd, rng

def dps(atk, dmgMul, speed):
    """DPS = ATK * dmgMul / speed (attacks per second)"""
    return atk * dmgMul / speed

def effective_dps(w, level, atk):
    """Factor in fx multipliers"""
    dmg, spd, rng = calc_upgraded(w, level)
    raw = dps(atk, dmg, spd)
    fx = w["fx"]
    # double = 2 hit arcs, roughly 1.5x effective
    # 360 = full circle, roughly 2x vs groups
    # aoe = area explosion, roughly 2.5x vs groups
    fx_multi = {"double": 1.5, "360": 2.0, "aoe": 2.5, "none": 1.0}
    return raw, raw * fx_multi.get(fx, 1.0), rng

print("=" * 90)
print("  WEAPON BALANCE REPORT")
print("  Base ATK: {} | Upgrade Max: Lv{}".format(BASE_ATK, UPGRADE_MAX))
print("=" * 90)

# Header
print(f"\n{'Weapon':<14} {'Tier':>4} {'Lv':>2} {'DmgMul':>6} {'Speed':>5} {'Range':>5} {'DPS':>6} {'EffDPS':>7} {'Rating':>7}")
print("-" * 90)

all_results = []

for w in WEAPONS:
    for lv in range(UPGRADE_MAX + 1):
        dmg, spd, rng = calc_upgraded(w, lv)
        raw, eff, _ = effective_dps(w, lv, BASE_ATK)
        all_results.append({
            "name": w["name"], "tier": w["tier"], "lv": lv,
            "dmg": dmg, "spd": spd, "rng": rng,
            "raw_dps": raw, "eff_dps": eff, "fx": w["fx"]
        })
        if lv == 0 or lv == UPGRADE_MAX:
            print(f"  {w['name']:<12} T{w['tier']:>1}  Lv{lv} {dmg:>6.2f} {spd:>5.2f} {rng:>5.0f} {raw:>6.1f} {eff:>7.1f}   {w['fx']}")

# Analysis
print("\n" + "=" * 90)
print("  BALANCE ANALYSIS")
print("=" * 90)

# Compare Lv0 Tier1 weapons
t1_lv0 = [r for r in all_results if r["tier"] == 1 and r["lv"] == 0]
t1_lv0.sort(key=lambda x: x["eff_dps"], reverse=True)
print("\n  [Tier 1 Lv0 EffDPS Ranking]")
for i, r in enumerate(t1_lv0):
    bar = "#" * int(r["eff_dps"] * 2)
    print(f"    {i+1}. {r['name']:<12} {r['eff_dps']:>6.1f}  {bar}")

# Compare Lv3 Tier1 vs Lv0 Tier2
t1_max = [r for r in all_results if r["tier"] == 1 and r["lv"] == UPGRADE_MAX]
t2_lv0 = [r for r in all_results if r["tier"] == 2 and r["lv"] == 0]

print("\n  [Tier1 Lv3 vs Tier2 Lv0 — Evolution Worth?]")
print(f"    {'Weapon':<12} {'T1 Lv3':>7} {'T2 Lv0':>7} {'Gain':>7} {'Verdict'}")
print("    " + "-" * 55)

evo_pairs = [
    ("蜂の針", "蜂の金針"), ("蜜砲", "蜜の大砲"), ("花粉盾", "聖花の盾"),
    ("蔦鞭", "呪いの荊"), ("羽根手裏剣", "翼の嵐"), ("女王の杖", "女王の真杖")
]
for t1_name, t2_name in evo_pairs:
    t1 = next(r for r in t1_max if r["name"] == t1_name)
    t2 = next(r for r in t2_lv0 if r["name"] == t2_name)
    gain = ((t2["eff_dps"] / t1["eff_dps"]) - 1) * 100
    verdict = "GOOD" if gain > 10 else "WEAK" if gain > 0 else "DOWNGRADE!"
    print(f"    {t1_name:<12} {t1['eff_dps']:>7.1f} {t2['eff_dps']:>7.1f} {gain:>+6.1f}%  {verdict}")

# Compare Tier2 Lv3 (endgame)
t2_max = [r for r in all_results if r["tier"] == 2 and r["lv"] == UPGRADE_MAX]
t2_max.sort(key=lambda x: x["eff_dps"], reverse=True)
print("\n  [Tier 2 Lv3 EffDPS Ranking — Endgame]")
for i, r in enumerate(t2_max):
    bar = "#" * int(r["eff_dps"])
    print(f"    {i+1}. {r['name']:<12} {r['eff_dps']:>6.1f}  {bar}")

# Outlier detection
all_eff = [r["eff_dps"] for r in all_results if r["lv"] == 0]
avg = sum(all_eff) / len(all_eff)
print(f"\n  [Outlier Detection — Lv0 Average EffDPS: {avg:.1f}]")
for r in all_results:
    if r["lv"] != 0:
        continue
    ratio = r["eff_dps"] / avg
    if ratio > 1.5:
        print(f"    WARNING: {r['name']} T{r['tier']} is {ratio:.1f}x average — possibly overpowered")
    elif ratio < 0.5:
        print(f"    WARNING: {r['name']} T{r['tier']} is {ratio:.1f}x average — possibly underpowered")

print("\n" + "=" * 90)
