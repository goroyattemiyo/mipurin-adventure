# ROADMAP

## Current: Sprint I - Content Expansion
- [ ] I-1: 2nd loop exclusive enemies/bosses
- [ ] I-2: SE redesign (new chip-tune sounds)
- [ ] I-3: Tier2 weapon sprites
- [ ] I-4: Balance tuning

## Completed
- Sprint A: Blessings (78 + 15 duo)
- Sprint B: Node map (2-tier tree)
- Sprint C: Garden meta-progression
- Sprint D: Enemy sprites + boss silhouettes
- Sprint E: Title/death/ending UI polish
- Sprint F: Mobile touch support
- Sprint F2: Loop system + runNectar fix + dev tools
- Sprint G: Equipment system (2-pane UI, upgrade, backpack, sprite icons)
- Sprint G-BGM: Hybrid BGM (MP3 + WebAudio chip-tune)
- Sprint G-UX: Mobile UX overhaul (fullscreen, buttons, SE detox)
- Sprint H-1: Charm system (9 charms, drop, equip slot active)
- Sprint H-2: Weapon evolution tree (6 Tier1->Tier2 paths, tier-aware cost)
- Sprint H-3: Weapon encyclopedia (collection sub-tab, completion bar, tier badges)

## Next
- Sprint I: 2nd loop content + SE + Tier2 sprites
- Sprint J: Performance optimization + CI

## Development Methodology
- Synapse Council design review before major features
- Python auto test suite (`test_game.py`, 100 checks)
  - Run before every commit: `python test_game.py`
  - Covers: file size, syntax, globals, functions, tab logic, equip logic, touch, cross-refs, regression
  - Target: 100% PASS before push
- Equipment UI: 2-pane layout (left: character + 3 slots, right: weapon list)
- Charm system: passive accessories, floor-based drop, persistent collection
- Weapon evolution: Tier1 Lv3 + pollen cost -> Tier2 Lv0 (re-upgradeable)
- 15 JS modules, all under 30KB limit
