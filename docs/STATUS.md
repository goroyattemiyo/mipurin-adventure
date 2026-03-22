# ミプリンの冒険 — 開発ステータス

最終更新: 2026-03-22 (v6.27)

---

## 1. 現在の状態

- バージョン: v6.27
- スコア: 66.3/100 (目標 Phase 2: 73)
- ブランチ: main
- テスト: 146/146 PASS
- キャッシュバスター: ?v=1633
- JS: 17ファイル (game/data/bgm/enemies/blessings/systems/nodemap/equip_ui/ui/shop_ui/ui_screens/combat/update/render/touch/rarity/charms)

## 2. スコア推定 (v6.27)

| # | 項目 | v6.12.1 | v6.27 | Phase2目標 |
|---|---|---|---|---|
| 1 | コアループ | 7 | 7 | 8 |
| 2 | メタ進行 | 5 | 5.8 | 7 |
| 3 | ランダム性 | 5.5 | 5.5 | 7 |
| 4 | 敵デザイン | 6 | 6 | 7 |
| 5 | ストーリー | 6.5 | 6.5 | 7 |
| 6 | ビジュアル | 6.5 | 6.5 | 7 |
| 7 | オーディオ | 6.5 | 7.0 | 7.5 |
| 8 | 操作感 | 7.5 | 7.5 | 8 |
| 9 | UI/UX | 7.5 | 7.5 | 7.5 |
| 10 | 技術品質 | 7 | 7 | 7 |
| **合計** | | **65** | **66.3** | **73** |

## 3. 現在のスプリント

| Sprint | 内容 | スコア影響 | 状態 |
|---|---|---|---|
| G-B | BGM演出強化 | +0.5 オーディオ | ✅ 完了 |
| G-C | 花壇拡張(luck/explore) | +0.8 メタ | ✅ 部分完了 |
| H-A | 宝箱＆鍵 + 巨大化はちみつ | +1.5 | 未着手 |
| H-A2 | 環境ギミック | +0.5 | 未着手 |
| H-B | 武器固有アクション | +0.5 | 未着手 |
| H-C | 図鑒拡充 + 隠しエンディング | +1.0 | 未着手 |
| I | 最終ボス + 女王帰還 | +2.0 | 未着手 |

## 4. ファイルサイズ監視

    game.js           11.4KB OK
    data.js           29.0KB ← 要注意
    bgm.js            9.5KB OK
    enemies.js        14.5KB OK
    blessings.js      20.1KB OK
    systems.js        16.9KB OK
    nodemap.js        13.1KB OK
    equip_ui.js       17.5KB OK
    ui.js             26.6KB OK
    shop_ui.js        7.5KB OK
    ui_screens.js     12.6KB OK
    combat.js         16.9KB OK
    update.js         18.1KB OK
    render.js         30.7KB ← 要注意
    touch.js          12.9KB OK
    rarity.js         1.5KB OK
    charms.js         4.2KB OK

## 5. 環境

- リポジトリ: https://github.com/goroyattemiyo/mipurin-adventure
- デプロイ: https://goroyattemiyo.github.io/mipurin-adventure
- ローカル: C:\\dev\\mipurin-adventure
- 開発ルール: docs/RULES.md 参照
- Sprint履歴: docs/HISTORY.md 参照
- 設計判断: docs/DECISIONS.md 参照
- 関数・定義所在: docs/MODULE_INDEX.md 参照
