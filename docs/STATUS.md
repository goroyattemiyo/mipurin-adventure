# ミプリンの冒険 — 開発ステータス

最終更新: 2026-03-24 (v6.32)

---

## 1. 現在の状態

- バージョン: v6.32
- スコア: 72.3/100 (目標 Phase 2: 73)
- ブランチ: main
- テスト: 153/153 PASS
- JS: 18ファイル (game/data/bgm/enemies/blessings/systems/nodemap/equip_ui/ui/shop_ui/ui_screens/combat/update/render/touch/rarity/charms/gimmicks)

## 2. スコア推定 (v6.30)

| # | 項目 | v6.31 | v6.32 | Phase2目標 |
|---|---|---|---|---|
| 1 | コアループ | 8.3 | 8.3 | 8 |
| 2 | メタ進行 | 7.0 | 7.0 | 7 |
| 3 | ランダム性 | 6.2 | 6.2 | 7 |
| 4 | 敵デザイン | 6 | 6 | 7 |
| 5 | ストーリー | 6.5 | 6.5 | 7 |
| 6 | ビジュアル | 6.5 | 7.0 | 7 |
| 7 | オーディオ | 7.0 | 7.0 | 7.5 |
| 8 | 操作感 | 7.5 | 8.0 | 8 |
| 9 | UI/UX | 7.5 | 8.0 | 7.5 |
| 10 | 技術品質 | 7.5 | 7.5 | 7 |
| **合計** | | **70.8** | **72.3** | **73** |

※ 操作感+0.5(→8.0 目標達成): H-B武器固有アクション(聖花パリィ/嵐3連射/クリスタル爆発)で攻撃の手応え向上
※ UI/UX+0.5(→8.0 超過): 花壇リデザイン(フローラ大型化/グロー/吹き出し強化)でキャラ愛着UP
※ ビジュアル+0.5(→7.0 目標達成): パリィ光輪エフェクト、花壇演出改善

## 3. 現在のスプリント

| Sprint | 内容 | スコア影響 | 状態 |
|---|---|---|---|
| G-B | BGM演出強化 | +0.5 オーディオ | ✅ 完了 |
| G-C | 花壇拡張(luck/explore) | +0.8 メタ | ✅ 完了 |
| H-A-1 | 宝箱ノード追加 | +0.5 コアループ | ✅ 完了 |
| H-A-2 | 鍵アイテム＆宝箱ロック連携 | +0.5 ランダム性 | ✅ 完了 |
| H-A-3 | 巨大化はちみつ | +1.0 コアループ | ✅ 完了 |
| H-A2 | 環境ギミック(💧水場/🌿草むら/💥樽) | +0.5 | ✅ 完了 |
| G-C2 | 花壇拡張(🌸記憶/🛡️不屈) | +1.2 メタ | ✅ 完了 |
| H-B  | 武器固有アクション + 花壇UIリデザイン | +1.5 操作/UI/ビジュアル | ✅ 完了 |
| H-B | 武器固有アクション | +0.5 | 未着手 |
| H-C | 図鑒拡充 + 隠しエンディング | +1.0 | 未着手 |
| I | 最終ボス + 女王帰還 | +2.0 | 未着手 |

## 4. ファイルサイズ監視

    game.js           11.4KB OK
    data.js           31.7KB ← 要注意 (35KB上限)
    bgm.js            9.5KB OK
    enemies.js        14.2KB OK
    blessings.js      19.9KB OK
    systems.js        17.6KB OK
    nodemap.js        16.8KB OK
    equip_ui.js       17.0KB OK
    ui.js             26.5KB OK
    shop_ui.js        7.5KB OK
    ui_screens.js     12.5KB OK
    combat.js         17.2KB OK
    update.js         18.0KB OK
    render.js         31.5KB ← 要注意 (35KB上限)
    touch.js          12.9KB OK
    rarity.js         1.4KB OK
    charms.js         4.1KB OK

## 5. 技術的負債（最新）

| 項目 | 詳細 | 優先度 | 状態 |
|---|---|---|---|
| render.js 30.8KB | 35KB上限に接近。OffscreenCanvas導入済み。デッドコード整理検討 | 高 | 監視中 |
| data.js 30.1KB | 同上 | 高 | 監視中 |
| ui.js 26.5KB | 28KB警告ライン未満に改善 | 中 | 改善済み |
| 未使用BGM 8.5MB | end_b.mp3(5.7MB)+end_c.mp3(2.8MB) エンディング実装時に活用 | 中 | BACKLOG |
| fix_*.py散在 | ルートに大量のスクリプト → scripts/に整理済み | 低 | ✅ 対応済み |
| Tier2武器スプライト | Tier1画像流用中 | 低 | BACKLOG |
| 武器進化DPSダウングレード | Tier1 Lv3→Tier2 Lv0で-21〜-54% (weapon_balance.py確認済み) | 高 | ✅ 対応済み (全5武器+13〜+54%) |
| 敵色/バリアント名不一致 | hue-rotateの色と名前が合わない個体あり | 低 | BACKLOG |
| CHANGELOG欠落 | v6.14〜v6.23の変更が未記載 (CHANGELOG_DRAFT.mdに草稿あり) | 中 | 対応保留 |

## 6. 環境

- リポジトリ: https://github.com/goroyattemiyo/mipurin-adventure
- デプロイ: https://goroyattemiyo.github.io/mipurin-adventure
- ローカル: C:\\dev\\mipurin-adventure
- 開発ルール: docs/RULES.md 参照
- Sprint履歴: docs/HISTORY.md 参照
- 設計判断: docs/DECISIONS.md 参照
- 関数・定義所在: docs/MODULE_INDEX.md 参照
