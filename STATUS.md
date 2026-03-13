# STATUS.md — ミプリンの冒険 開発状況

## Version: v6.18.0
## Date: 2026-03-13

## Development Methodology
- Synapse Council (専門家会議) による設計レビュー
- Synapse Bug Prevention Workflow v3
- **Python自動テスト (test_game.py)** — コミット前に100項目自動チェック
  - ファイル存在・30KB制限
  - Node.js構文チェック全14ファイル
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
- [x] File split (14 modules, all <30KB)
- [x] Equipment UI v6.18 (2-pane: slot + weapon list)
- [x] Weapon upgrade (Lv0-3)
- [x] Backpack (4 slots)
- [x] Sprite-based weapon icons in equip UI
- [x] Mobile fullscreen + dvh + portrait overlay
- [x] Button size compliance (48dp+)
- [x] Tab-only tab switching (no accidental arrow switch)
- [x] Mobile title screen (hide PC controls)
- [x] Python auto test suite (100 checks)

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
| **H: Weapon Tree** | **NEXT** | Charm slots, weapon evolution, new weapons |
| I: Content | PLANNED | 2nd-loop exclusive, SE redesign |
| J: Performance | PLANNED | Optimization + CI |

## Module Sizes (v6.18.0)
| File | Size | Note |
|------|------|------|
| game.js | 10.1 KB | SE detoxed |
| data.js | 27.3 KB | weapon icons added |
| bgm.js | 8.6 KB | currentBGM sync |
| enemies.js | 14.5 KB | |
| blessings.js | 20.0 KB | |
| systems.js | 15.5 KB | sprite cache |
| nodemap.js | 14.1 KB | |
| equip_ui.js | 12.3 KB | 2-pane rewrite |
| ui.js | 20.4 KB | tab hint updated |
| ui_screens.js | 12.2 KB | mobile title |
| combat.js | 16.9 KB | |
| update.js | 14.9 KB | D&D removed |
| render.js | 28.5 KB | MONITOR |
| touch.js | 12.9 KB | D&D removed |

## Scores (self-assessment)
| Category | Score | Notes |
|----------|-------|-------|
| Game Quality | 73 | 2-pane equip, sprite icons |
| Progress | 82 | Sprint G complete, auto test |
| Dev Method | 90 | Python auto test, Synapse v3 |
| **Total** | **80.2** | |

## Next Actions
1. Browser verify: 2-pane equip UI on PC + mobile
2. Sprint H-1: Charm system foundation
3. Sprint H-2: Weapon evolution tree
4. Weapon collection UI in encyclopedia tab
