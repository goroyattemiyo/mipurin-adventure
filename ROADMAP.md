# ROADMAP

## Current: Sprint G - Equipment System
- [x] Phase 1: mouse state, backpack, equip tab UI, weapon upgrade (keyboard)
- [x] Phase 2: mouse drag-and-drop (PC)
- [ ] Phase 3: tap-select equip (mobile)
- [x] Hybrid BGM module (MP3+WebAudio chiptune)

## Completed
- Sprint A: Blessings (78 + 15 duo)
- Sprint B: Node map (2-tier tree)
- Sprint C: Garden meta-progression
- Sprint D: Enemy sprites + boss silhouettes
- Sprint E: Title/death/ending UI polish
- Sprint F: Mobile touch support
- Sprint F2: Loop system + runNectar fix + dev tools
- Sprint G Phase 1-2: Equipment system + mouse D&D

## Next
- Sprint G Phase 3: Tap-select equip (mobile)
- Sprint H: Weapon growth tree + charm slot + new weapons
- Sprint I: 2nd loop exclusive content
- Sprint J: Performance optimization + CI
## Development Methodology Update (2026-03-13)
- Added `test_game.py` — Python auto test suite (100 checks)
  - Run before every commit: `python test_game.py`
  - Covers: file size, syntax, globals, functions, tab logic, equip logic, touch, cross-refs, regression
  - Target: 100% PASS before push
- Equipment UI redesigned to 2-pane (v6.18.0)
  - LEFT: character + 3 equip slots (main/sub/charm)
  - RIGHT: owned weapon list with sprites
  - D&D completely removed
  - Mobile: tap slot or list row
