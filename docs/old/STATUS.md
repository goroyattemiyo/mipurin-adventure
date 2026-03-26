# STATUS.md — ミプリンの冒険 開発状況
> 最終更新: 2026-03-26 (v6.35 / Phase C rot.js 導入完了)

## スコア概要
| 項目 | 現在 | 目標(Ph2) | 状態 |
|------|------|-----------|------|
| Core Loop | 8.3 | 8 | ✅ 超過 |
| Meta Progress | 7.0 | 7 | ✅ 達成 |
| Randomness | 6.6 | 7 | 🔶 +0.4 改善 |
| Enemy Design | 6.0 | 7 | ❌ 未達 |
| Story | 7.0 | 7 | ✅ 達成 |
| UI/UX | 7.5 | 7 | ✅ 超過 |
| Visual | 7.5 | 7 | ✅ 超過 |
| Operation Feel | 7.8 | 7.5 | ✅ 超過 |
| Audio | 7.0 | 7.5 | 🔶 未達 |
| **TOTAL** | **74.7** | **73** | **✅ Phase 2 達成** |

## 完了スプリント
- G-B: BGM強化 (shop切替, boss静音intro, 低HP LPF)
- G-C: 花壇拡張 (記憶の花壇, 不屈の花壇)
- H-A-1~3: 宝箱ノード, 巨大化はちみつ, 環境ギミック
- H-A2: 水場・草むら・爆発樽
- G-C2: 花壇UI刷新
- H-B: 武器アクションUI再設計 + 武器固有アクション
- H-C: 百科事典ロア拡充 + 隠しエンディング強化
- **Phase C: rot.js導入（BSPダンジョン生成 + A*経路探索）** ← NEW

## 残スプリント
| Sprint | 内容 | スコア影響 |
|--------|------|-----------|
| I | 最終ボス「闇の根」+ 女王帰還 | +2.0 (Enemy Design, Story) |

## ファイルサイズ監視
| ファイル | サイズ | 上限 | 状態 |
|----------|--------|------|------|
| js/game.js | 11.4 KB | 35 KB | ✅ OK |
| js/data.js | 26.4 KB | 35 KB | 🔶 注意 |
| js/data_room.js | ~9 KB | 35 KB | ✅ OK |
| js/enemies.js | 17.3 KB | 35 KB | ✅ OK |
| js/render.js | 16.8 KB | 35 KB | ✅ OK |
| js/render_entities.js | 18.2 KB | 35 KB | ✅ OK |
| js/ui.js | 31.6 KB | 35 KB | ⚠️ 警告 |
| js/ui_screens.js | 24.5 KB | 35 KB | ✅ OK |
| js/combat.js | ~22 KB | 35 KB | ✅ OK |
| js/nodemap.js | 17.8 KB | 35 KB | ✅ OK |
| js/touch.js | 16.3 KB | 35 KB | ✅ OK |
| js/update.js | 20.7 KB | 35 KB | ✅ OK |
| js/bgm.js | ~15 KB | 35 KB | ✅ OK |
| js/lore.js | ~4 KB | 35 KB | ✅ OK |

## テスト: 157/157 PASS

## 技術的負債 (高優先)
- ui.js 31.6 KB — 28KB超過、35KB接近中。次の大規模UI追加時に分割検討
- 未使用BGM ~8.5 MB (low)

## リポジトリ
- GitHub: https://github.com/goroyattemiyo/mipurin-adventure
- Live: https://goroyattemiyo.github.io/mipurin-adventure
- Local: C:\dev\mipurin-adventure