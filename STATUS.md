# STATUS.md — ミプリンの冒険 開発状況

## Version: v6.19.0
## Date: 2026-03-14

## Development Methodology
- Synapse Council (専門家会議) による設計レビュー
- Synapse Bug Prevention Workflow v3
- **Python自動テスト (test_game.py)** — コミット前に100項目自動チェック
  - ファイル存在・30KB制限
  - Node.js構文チェック全15ファイル
  - グローバル変数・関数の宣言確認
  - タブ切り替えロジック整合性
  - 装備UIカーソル範囲・装備ロジック
  - D&D残骸検出
  - クロスファイル参照チェック
  - バグ回帰テスト

## Completed Features
- [x] Core combat (15F + 4 Boss)
- [x] Blessing 78 + Duo 15
- [x] Node map (2-tier)
- [x] Garden meta-progression
- [x] Mobile touch UI (fullscreen + PWA + context-aware buttons)
- [x] Loop system (2nd run)
- [x] Hybrid BGM (MP3 + WebAudio chip-tune)
- [x] SE detox (sawtooth removal)
- [x] File split (15 modules, all <30KB)
- [x] Equipment UI v6.18 (2-pane: slot + weapon list)
- [x] Weapon upgrade (Lv0-3, tier-aware cost)
- [x] Backpack (4 slots)
- [x] Sprite-based weapon icons in equip UI
- [x] Mobile fullscreen + dvh + portrait overlay
- [x] Button size compliance (48dp+)
- [x] Tab-only tab switching (no accidental arrow switch)
- [x] Mobile title screen (hide PC controls)
- [x] Python auto test suite (100 checks)
- [x] Charm system (9 charms: 4 common, 3 rare, 2 legend)
- [x] Charm drop (5%/8%/12% by floor) + purple pickup screen
- [x] Charm slot active in equip UI
- [x] Weapon evolution tree (6 Tier1->Tier2 paths)
- [x] Tier2 upgrade cost (30/60/100)
- [x] Weapon encyclopedia (collection sub-tab, completion bar)

## Sprint Status
| Sprint | Status | Notes |
|--------|--------|-------|
| A: Blessings | DONE | 78 blessings + 15 duo |
| B: Node Map | DONE | 2-tier tree |
| C: Garden | DONE | Meta-progression |
| D: Sprites | DONE | Enemy + boss sprites |
| E: UI Polish | DONE | Title/death/ending |
| F: Mobile | DONE | Touch + fullscreen |
| F2: Loop | DONE | 2nd run + dev tools |
| G: Equipment | DONE | 2-pane UI, upgrade, mobile tap |
| G-BGM: Hybrid | DONE | MP3 + chip-tune |
| G-UX: Mobile UX | DONE | Fullscreen, buttons, SE |
| **H-1: Charm** | **DONE** | 9 charms, drop, equip slot |
| **H-2: Evolution** | **DONE** | 6 T1->T2 paths, tier-aware cost |
| **H-3: Encyclopedia** | **DONE** | Weapon collection, completion bar |
| I: Content | NEXT | 2nd-loop exclusive, new enemies, SE |
| J: Performance | PLANNED | Optimization + CI |

## Module Sizes (v6.19.0)
| File | Size | Note |
|------|------|------|
| game.js | 10.1 KB | SE detoxed |
| data.js | 28.6 KB | +evolution map |
| bgm.js | 8.6 KB | currentBGM sync |
| charms.js | 4.2 KB | NEW: charm system |
| enemies.js | 14.5 KB | |
| blessings.js | 20.0 KB | |
| systems.js | 15.6 KB | +applyCharm |
| nodemap.js | 14.1 KB | |
| equip_ui.js | 14.0 KB | +charm slot, evo btn, charm drop |
| ui.js | 22.5 KB | +weapon encyclopedia |
| ui_screens.js | 12.2 KB | mobile title |
| combat.js | 16.9 KB | |
| update.js | 16.0 KB | +charm drop state, evo logic |
| render.js | 28.6 KB | +drawCharmDrop call |
| touch.js | 12.9 KB | D&D removed |

## Scores (self-assessment)
| Category | Score | Notes |
|----------|-------|-------|
| Game Quality | 80 | Charm + evolution + encyclopedia |
| Progress | 88 | Sprint H complete |
| Dev Method | 92 | Python auto test, 100/100 stable |
| **Total** | **85.3** | |

## Next Actions
1. Browser verify: charm drop, evolution, encyclopedia
2. Sprint I-1: 2nd loop exclusive content (new enemies/bosses)
3. Sprint I-2: SE redesign (new chip-tune sounds)
4. Sprint I-3: Tier2 weapon sprites
5. Balance tuning (charm effects, evolution costs)
