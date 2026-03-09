## v6.12.6 (2026-03-09)
- フローラパネル位置修正（キー操作案内との重なり解消）
- フローラふわふわアニメーション追加（sin波 ±6px）
- キー操作案内を画面最下部に移動

## v6.12.5 (2026-03-09)
- ボスカットイン修正（startFloor gameState上書き防止）
- ボススポーンY座標修正（壁めり込み防止）
- ダッシュ強化（dashSpeed 700, dashDuration 0.22s, 移動距離≈2.4タイル）
- 動的フロアサイズ（F1-2: 14×11, F3ボス: 20×15, F4-5: 16×13）
- 部屋テンプレート5種追加（pillars, corridors, arena, scattered, ring）
- タイトル背景に半透明黒オーバーレイ追加
- dead_mipurin円形クリップ描画（背景除去代替）
- フローラ画像拡大（320px）＋中央下配置
- ボス撃破後シルエット半透明化＋ダイアログ終了時クリア
- COUNCIL-SESSION統合（STATUS.mdに結論統合、元ファイル削除）
- シナプス議論定義をSynapse/Synapse2有識者召喚方式に訂正
## v6.6.2 (2026-03-08)
- systems.js を enemies.js (189行) + systems.js (350行) に分割
- engine.js を update.js (300行) + render.js (422行) に分割
- engine.js 削除
- index.html 読み込み順序を7ファイル体制に更新 (?v=950)

## v6.6.1 (2026-03-08)
- 64ファイル削除（JS 36 + Python 17 + その他11）約11,500行除去
- blessings.js, collection.js, npc.js を js/future/ にアーカイブ
- tools/ は split_game.py のみ残存

## v6.6.0 (2026-03-08)
- 設計書統合: 5ドキュメント → 3ドキュメント体制 (GDD.md, STATUS.md, CHANGELOG.md)
- COUNCIL-SESSION-001.md, TOOL-SPRITEGEN-v4.0.md を docs/archive/ に移動
- STATUS-v5.0.md を STATUS.md に置換（バージョンレス化、v6.6.2時点の全情報反映）
- GDD-MIPURIN-v2.0.md を GDD.md にリネーム、第11章をファイル構成に更新

# ミプリンの冒険 — CHANGELOG

## v6.3.2 (2026-03-08)
- 回復ドロップ率 15% → 20%
- ドロップ取得時に名前フロート表示（🌼 花粉 +N / 🍯 HP+1）
- フォントを M PLUS Rounded 1c（丸ゴシック）に変更

## v6.3.1 (2026-03-08)
- バランスホットフィックス
  - 初期ATK 1 → 2
  - 初期HP 5 → 7
  - F1の敵DMGスケール無効（×1.0固定）
  - 敵DMGスケール係数 0.1 → 0.06
  - F1〜F2は弱敵限定（mushroom, slime）

## v6.3.0 (2026-03-08)
- フロア間ノード選択画面追加（3択ルートシステム）
- ノードタイプ: バトル / エリート / ショップ / 休憩 / イベント
- イベント2択システム（EVENT_POOL）
- 休憩ノードでHP30%回復

## v6.2.2 (2026-03-07)
- 全19種SEをリッチ化（和音・倍音・長い余韻）
- 主要SE: attack, player_hurt, enemy_die, game_over, boss_appear, level_up等

## v6.2.1 (2026-03-07)
- SE品質改善（attack, hurt, die, boss, levelup, dialog等）

## v6.2.0 (2026-03-07)
- 全SEをWeb Audio合成に統一
- 14個のmp3 SEファイル廃止
- 13個のAudio関数追加

## v6.1.1 (2026-03-06)
- ダッシュSE修正（needle.mp3 → Audio.dash()）

## v6.1.0 (2026-03-06)
- 全27スプライト完成（武器6 + 消耗品3 + ドロップ2）
- WebP変換・SPRITE_MAP統合

## v6.0.5 (2026-03-05)
- BGMゲームオーバー後残留バグ修正
- 敵スプライトアニメーション強化（squash/tilt）
- weaponDropハンドラ復元

## v6.0.4 (2026-03-05)
- 敵スプライトアニメーション追加（bob + squash/stretch + tilt）
- ゲームオーバーテキスト重複修正

## v6.0.3 (2026-03-05)
- ゲームオーバーテキスト重複削除

## v6.0.2 (2026-03-05)
- スプライトアスペクト比修正・20%拡大

## v6.0.1 (2026-03-05)
- スプライトエイリアス修正（blob→slime）

## v6.0.0 (2026-03-05)
- スプライト統合開始: 敵12種 + ボス4種 WebP化
- SPRITE_MAP導入

## 以前
- v5.x: コアゲームループ、5テーマ、12敵、4ボス、6武器、12祝福、BGM切替、プロローグ

