# ミプリンの冒険 — 開発ステータス設計書

文書ID: STATUS-v5.0 | 更新日: 2026-03-04

---

## 1. リポジトリ構成

mipurin-adventure/ (branch: v2) ├── index.html # エントリーポイント (1280x960 canvas) ├── js/ │ ├── game.js # メインゲーム (v5.0, 約1170行, 単一ファイル) │ ├── analytics.js # 未使用 (旧v1モジュール) │ ├── audio.js # 未使用 (旧v1モジュール) │ ├── balance.js # 未使用 │ ├── battle.js # 未使用 │ ├── blessingUI.js # 未使用 │ ├── blessings.js # 未使用 │ ├── boss.js # 未使用 │ ├── bossPatterns.js # 未使用 │ ├── collection.js # 未使用 │ ├── config.js # 未使用 │ ├── damageNumber.js # 未使用 │ ├── dungeon.js # 未使用 │ ├── enemyAI.js # 未使用 │ ├── engine.js # 未使用 │ ├── equipment.js # 未使用 │ ├── equipmentUI.js # 未使用 │ ├── events.js # 未使用 │ ├── gameFeel.js # 未使用 │ ├── inventory.js # 未使用 │ ├── itemGen.js # 未使用 │ ├── lang.js # 未使用 │ ├── loot.js # 未使用 │ ├── map.js # 未使用 │ ├── meta.js # 未使用 │ ├── metaUI.js # 未使用 │ ├── nodeMap.js # 未使用 │ ├── nodeMapUI.js # 未使用 │ ├── npc.js # 未使用 │ ├── npcDialogue.js # 未使用 │ ├── particles.js # 未使用 │ └── ... (30+ファイル) # GDD v2.0 Phase2用に生成されたが未接続 ├── css/ │ └── style.css # 未使用 (旧v1用) ├── assets/ │ ├── mipurin.png # プレイヤースプライト (500x500, 2x2グリッド, 4方向) │ ├── music/ # BGM 13曲 │ │ ├── title.mp3 # タイトル画面 │ │ ├── forest_south.mp3 # 森エリア │ │ ├── cave.mp3 # 洞窟エリア │ │ ├── flower_field.mp3 # 花畑エリア │ │ ├── forest_north.mp3 # 深淵エリア │ │ ├── nest.mp3 # 遺跡エリア │ │ ├── boss.mp3 # ボス戦 │ │ ├── shop.mp3 # ショップ (未使用) │ │ ├── village.mp3 # 村 (未使用) │ │ ├── nest_boss.mp3 # ネストボス (未使用) │ │ ├── ending.mp3 # エンディング「とべ！ミプリン」(未使用) │ │ ├── end_b.mp3 # エンディングB (未使用) │ │ └── end_c.mp3 # エンディングC (未使用) │ ├── prologue/ # オープニング画像 10枚 │ │ ├── prologue_01.webp ... prologue_10.webp │ ├── se/ # 効果音 14種 (未使用, Web Audio で代替中) │ │ ├── attack.mp3, hit.mp3, enemy_die.mp3, player_hurt.mp3 │ │ ├── item_get.mp3, level_up.mp3, boss_appear.mp3, game_over.mp3 │ │ ├── door_open.mp3, save.mp3, needle.mp3 │ │ ├── dialog_open.mp3, dialog_close.mp3 │ │ └── menu_move.mp3, menu_select.mp3 │ └── sprites/ │ ├── player.json # 旧v1スプライト定義 (32x32, 26フレーム) │ └── player_sheet.png # 旧v1スプライトシート (未使用) ├── docs/ │ ├── GDD-MIPURIN-v2.0.md # ゲームデザイン設計書 (Phase1-3ロードマップ) │ ├── TOOL-SPRITEGEN-v4.0.md # スプライト生成ツール仕様 │ └── STATUS-v5.0.md # ← 本ドキュメント ├── index copy.html # 旧バックアップ (削除候補) └── index copy 2.html # 旧バックアップ (削除候補)


---

## 2. 環境情報

| 項目 | 内容 |
|---|---|
| 自宅環境 | Windows VSCode, C:\dev\mipurin-adventure |
| 会社環境 | GitHub Codespaces (Bash) |
| ブランチ | v2 |
| デプロイ | GitHub Pages (goroyattemiyo.github.io/mipurin-adventure) |
| 関連ツール | Synapse (github.com/goroyattemiyo/Synapse) — マルチAIエージェント協調開発 |

---

## 3. game.js 現在の構造 (v5.0.4, 約1170行)

| 行範囲 | セクション | 状態 |
|---|---|---|
| 1-35 | SpriteLoader (JSON式, 未使用) | 死コード |
| 37 | 定数 CW=1280, CH=960, TILE=64 | OK |
| 39-52 | Canvas, Input, ユーティリティ | OK |
| 54-76 | Audio (Web Audio チップチューン) | 動作中 |
| 78-86 | BGM システム (mp3再生) | 動作中 |
| 88-96 | COL パレット (明るいテーマ) | OK |
| 98-115 | RNG, パーティクル | OK |
| 117-140 | generateRoom (柱配置) | OK |
| 142-161 | THEMES (5テーマ, 明るい色+BGM名) | OK |
| 163-173 | WEAPON_DEFS (6種, 日本語名) | OK |
| 175-212 | Drops (pollen, heal のみ) | 部分的 |
| 214-222 | State変数, Player初期化 | OK |
| 224-250 | ENEMY_DEFS (12種), THEME_ENEMIES | OK |
| 252-295 | Projectiles | OK |
| 297-340 | spawnEnemy, buildWaves, spawnWave | OK |
| 342-410 | Boss (4種, 4パターン) | OK |
| 412-440 | BLESSING_POOL (12種, 日本語) | OK |
| 442-455 | Shop (3品, 日本語) | OK |
| 457-465 | Fade | OK |
| 467-478 | startFloor (BGM対応) | OK |
| 480-493 | mipurin.png ロード, MIPURIN_FRAMES | OK |
| 495-560 | プロローグ (画像10枚, テキスト6行) | バグあり |
| 562-570 | resetGame | OK |
| 572-590 | moveWithCollision, getAttackBox | OK |
| 592-690 | update() メインループ | OK |
| 692-760 | 敵AI (wander, chase, charge, shoot, teleport) | OK |
| 762-830 | drawRoom, drawDashTrail, drawTelegraph | OK |
| 832-900 | drawEntity (mipurin対応), drawEnemyShape | OK |
| 902-945 | drawHPBar, drawBoss, drawAttackEffect | OK |
| 947-960 | drawDmgNumbers | OK |
| 962-1035 | drawHUD (日本語, 消耗品スロット) | OK |
| 1037-1055 | drawBlessing (日本語) | OK |
| 1056-1080 | drawShop | OK |
| 1082-1135 | drawTitle (ミプリン画像, 日本語) | OK |
| 1137-1160 | draw(), loop() | OK |

---

## 4. 動作状況

### 動いているもの
- タイトル画面 (ミプリン画像, 「ミプリンの冒険」, title.mp3 再生)
- 明るいテーマ (緑の森)
- 日本語UI (HUD, 祝福, ショップ, 武器名)
- mipurin.png スプライト描画 (4方向)
- WASD移動, Z攻撃, Xダッシュ
- 敵12種, ボス4種, 5テーマ
- BGM切り替え (フロアごと, ボス戦)
- フェード演出
- パーティクル
- ドロップ (花粉, 回復)

### バグ・未完成
| # | 問題 | 原因 | 優先度 |
|---|---|---|---|
| B1 | プロローグが表示されない | Z入力ガード(v5.0.4)が効いていない。タイトルの`wasPressed`が同フレームでプロローグに伝搬するか、キャッシュ問題 | 高 |
| B2 | 敵撃破でドロップしない | spawnDropの呼び出しが花粉40%+回復15%のみ。武器・消耗品ドロップ未実装 | 中 |
| B3 | Xダッシュが移動中しか発動しない | ダッシュ条件に`mx!==0\|\|my!==0`がある可能性 | 中 |
| B4 | assets/se/*.mp3 が未使用 | AudioはWeb Audioチップチューンのみ。SE用mp3に切り替え未完 | 低 |
| B5 | js/ 内の30+モジュールが未接続 | 旧v1/GDD Phase2用に生成されたが、game.js単体で完結しており参照なし | 整理 |
| B6 | index copy.html, index copy 2.html | 不要バックアップ | 削除 |
| B7 | ending.mp3 未使用 | エンディング画面が未実装 | 低 |

---

## 5. GDD v2.0 との乖離

| GDD設計 | 現在の実装 | ギャップ |
|---|---|---|
| 78祝福 (6系統×13) | 12祝福 (系統なし) | 大 |
| 15デュオ祝福 | なし | 大 |
| 6武器 (蜂の針等) | 6武器 (剣等, 世界観不一致) | 中 |
| ノードマップ方式 | 固定部屋+ウェーブ | 大 |
| メタプログレッション (ネクター+花壇) | なし | 大 |
| 部屋テンプレート5種 | 柱ランダム配置のみ | 中 |
| ヒットストップ/ゲームフィール | 画面シェイクのみ | 中 |
| AIスプライト | mipurin.png 4方向のみ | 中 |
| 14種SE (mp3) | Web Audio合成音 | 中 |
| NPC・ストーリー | プロローグ6行のみ | 大 |
| 図鑑・コレクション | なし | 大 |

---

## 6. 次のアクション (有識者議論用)

### 議論ポイント

**A. アーキテクチャ方針:**
game.js 単一ファイル (1170行) を維持するか、GDD v2.0 の14モジュール構成に移行するか。
既存の js/*.js ファイル群は使えるコードが含まれているか、全て書き直しか。

**B. プロローグバグ修正:**
wasPressed のフレーム伝搬問題。ガードタイマーで直したはずだが効いていない。
根本原因: wasPressed消費タイミング vs gameState遷移タイミング。

**C. 優先順位:**
1. バグ修正 (B1プロローグ, B2ドロップ, B3ダッシュ) → 安定版確立
2. GDD Phase1 基盤 → 祝福系統, ゲームフィール, 部屋テンプレート
3. SE切り替え (Web Audio → mp3)
4. モジュール分割 or 単一ファイル維持

**D. Synapse活用:**
Synapse (Orchestrator/Coder/Reviewer) をこのプロジェクトに使うか。
使う場合: ゴール定義 → Synapse実行 → 生成コードをgame.jsに統合。

**E. スプライトエンジン:**
mipurin.pngから歩行・攻撃モーションを自動生成する構想。
Gemini API or 画像処理で実現可能か。後回しか。
