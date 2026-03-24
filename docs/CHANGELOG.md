## v6.29 (2026-03-24) Sprint H-A-3 + 技術負債解消

### Features
- **H-A-3: 巨大化はちみつ** (data.js / combat.js / render.js / systems.js / update.js)
  - `🐻 巨大化はちみつ`（CONSUMABLE_DEFS に追加）: 使用すると10秒間ATK+3
  - 巨大化中はプレイヤースプライト×1.6拡大＋オレンジオーラ（sin波動）表示
  - 効果終了時に自動でATK復元＋「巨大化おわり」フロート表示
  - 入手方法: 敵撃破で3%ドロップ / ショップで花粉18から購入
  - ドロップ描画: 橙色の大きな円＋光沢＋輝き記号（✦）

### Bug Fixes / Debt
- **武器進化DPSダウングレード修正** (data.js): T2武器speed/dmgMul再調整で全5武器が進化後+13〜+54%アップ確認
- **fix_*.pyをscripts/へ整理**: ルートディレクトリのスクリプト群を scripts/ に移動済み

## v6.28 (2026-03-24) Sprint H-A-1〜H-A-2 + パフォーマンス最適化

### Features
- **H-A-1: 宝箱ノード追加** (nodemap.js)
  - NODE_TYPES に `chest` 追加（💎 weight=8）
  - 中身: 祝福40% / 花粉35% / 消耗品25%（消耗品スロット満杯時は花粉+8）
- **H-A-2: 鍵アイテム & 宝箱ロック連携** (data.js / nodemap.js / systems.js / combat.js)
  - `🗝️ 古い鍵`（CHEST_KEY_DEF）を消耗品スロットに実装（noUse:true で手動使用不可）
  - 敵撃破で5%確率ドロップ（luck祝福で最大8%）、ショップで花粉15で購入可
  - 鍵なし宝箱: 40%でブービートラップ（HP-2）、60%通常開封
  - 鍵あり宝箱: 鍵を自動消費、祝福確率60%・レジェンド優先、花粉+15〜25

### Performance
- **DPR上限制限** (game.js): `Math.min(devicePixelRatio, 2)` でRetina DPR=3端末の描画コスト最大44%削減
- **getBoundingClientRectキャッシュ** (touch.js): タッチイベント毎のDOMレイアウト再計算を排除、resize/orientationchangeで再取得
- **ルームOffscreenCanvasキャッシュ** (render.js / systems.js): 毎フレーム300タイル×fillRect → drawImage 1回に削減、startFloor()でキャッシュクリア

## v6.13.0 (2026-03-09) Sprint G-B0: かわいさ最大化
- 吹き出しシステム追加（攻撃30%/被ダメ40%/撃破25%/ボス撃破100%でセリフ表示）
- 敵消滅「ぽふっ」煙エフェクト（ピンク〜白8方向パーティクル）
- アイドルアニメーション（5秒無操作で揺れ＋「…zzZ」吹き出し）
- 死亡画面セリフ（「まだ…負けないもん…」等5種ローテーション）
- フロア開始時独り言（60%確率、9種からランダム）
- ボイス風SE（voice_attack/voice_hurt/voice_kill/voice_boss_kill）
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

