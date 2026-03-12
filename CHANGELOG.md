# CHANGELOG

## v6.16.1a (2026-03-12)
### fix: 装備画面レイアウト修正
- ミプリン立ち絵をパネル左側に配置 (panelX+30)
- メイン/サブ/お守りスロットをミプリン右側に縦並び配置
- バックパック4枠をパネル右端に2x2グリッド
- 詳細パネルをパネル下部に横長配置
- Tabキーで装備タブ(tab=2)をデフォルト表示
- cache bust v=1613

## v6.16.1 (2026-03-12) Sprint G Phase 2: Mouse Drag & Drop
- 装備タブでマウスD&D実装 (武器を掴んでスロット間移動)
- ドラッグ中: 元スロット暗転、有効ドロップ先を緑ハイライト、武器名追従
- Bug予防7件対策: canvas外mouseup, 空スロット掴み防止, 同一スロットスキップ,
  武器0本防止, インベントリ閉じ時ドラッグリセット, タブ切替時リセット, タッチ競合回避
- game.js: window mouseup + mouseleave リスナー追加
- ui.js: equipSlotRects グローバル座標管理 + ドラッグ描画
- update.js: D&Dロジック (hitTest + swap + guard)

## v6.16.0b (2026-03-12) Workflow v3: コミット前MD必須ルール
- patch_workflow.md v3: コミット前にREADME/ROADMAP/STATUS/CHANGELOG更新を必須化
- MD更新なしのコミットを禁止するルール追加

## v6.16.0a (2026-03-12) Bug Prevention Workflow
- patch_workflow.md v2: 事前バグ予測フェーズを正式追加
- Reviewer が最低5項目の想定バグを列挙してから実装開始するルール
- 開発方法スコア 75 -> ~82 (bug prevention +12)

## v6.16.0 (2026-03-12) Sprint G Phase 1: 装備システム基盤
- マウス入力基盤追加 (mouse状態 + イベントハンドラ)
- 武器強化システム: initWeapon/upgradeWeapon, 花粉消費でLv0→3
- バックパック4スロット追加 (player.backpack)
- インベントリ3タブ化: アイテム/図鑑/装備
- 装備タブUI: 装備スロット2+バックパック4+詳細+強化ボタン
- 装備タブ操作: ↑↓選択, Z強化, X入替
- 武器ドロップ時Cキーでバックパック収納

## v6.15.1 (2026-03-12)

### 開発基盤強化
- runNectar/loopCount 重複宣言解消 (game.js→systems.jsに統合)
- tools/check_globals.js v2: スコープ解析による偽陽性削減
- tools/check_concat.js: HTML読み込み順の連結構文チェック
- tools/patch_workflow.md: パッチ適用手順書
- VARIABLE_MAP.md: 変数所有権ルール文書

## v6.15.0 (2026-03-12)

### 新機能
- 周回システム: エンディングXキーで2周目（武器/祝福/花粉引継ぎ）
- 敵周回スケーリング: HP x(1+loop x0.5), ATK x(1+loop x0.3)
- 敵色違い: loopHueShift()で色相シフト
- 花粉リロール: 祝福選択Xキー+花粉15
- モバイルタッチ: touch.js（仮想ジョイスティック+ボタン, マルチタッチ）

### バグ修正
- runNectar未加算: 花粉/ボス/フロアの3箇所で加算
- エンディングUI重なり: 画像左/テキスト右パネル分離
- ゲームオーバーUI重なり: テキスト上部/画像下部分離
- タイトル画面: 情報パネル統合, 色改善
- ボスシルエット誤表示: 非ボスダイアログで抑制

## v6.14.1 (2026-03-12)

### バグ修正（18件）
- render.js camX/camY未定義クラッシュ
- update.js updateBubbleタイポ
- game.js タイマー変数宣言
- stopBGMフェード統一
- enemies.js ボスフロアBGM競合
- idleTimerリセット, dashCooldown初期値0.5
- eliteNextリセット, ui_screens.js blinkネスト
- titleVolSel宣言, 重複BGMチェック削除
- 未使用bossLines削除, パーティクル数削減
