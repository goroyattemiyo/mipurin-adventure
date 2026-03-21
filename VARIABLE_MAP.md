# VARIABLE_MAP - 変数所有権ルール

## パッチ適用ルール
1. 新しいグローバル変数を追加する前に node tools/check_globals.js を実行
2. 重複が検出されたらコミットしない
3. 変数リストは node tools/check_globals.js --map で自動生成

## ファイル別の役割（変数の所有権）

| ファイル | 役割 | 変数を追加してよいか |
|----------|------|---------------------|
| game.js | Canvas, 入力, Audio, UI設定 | OK（設定系のみ） |
| data.js | テーマ, 武器, アイテム, ゲーム状態 | OK（ゲーム状態変数） |
| enemies.js | 敵, ボス, 弾 | OK（敵関連のみ） |
| blessings.js | 祝福, 共鳴 | OK（祝福関連のみ） |
| systems.js | メタ進行, ショップ, フェード, スプライト | OK（メタ進行変数） |
| nodemap.js | ノードマップ, イベント | OK（マップ関連のみ） |
| ui.js | HUD, UI描画 | OK（UI状態のみ） |
| ui_screens.js | 画面描画 | OK（画面状態のみ） |
| update.js | メインループ | 追加禁止（参照のみ） |
| render.js | 描画ループ | 追加禁止（参照のみ） |
| touch.js | タッチ操作 | OK（タッチ関連のみ） |

## メタ進行変数（systems.js が所有）
nectar, runNectar, loopCount, totalClears, gardenUpgrades, gardenUnlocks

## 変数リスト自動生成
  node tools/check_globals.js --map