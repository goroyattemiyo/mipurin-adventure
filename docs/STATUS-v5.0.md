# ミプリンの冒険 — 開発ステータス設計書

文書ID: STATUS-v5.0 | 更新日: 2026-03-04 (v5.6.1)

---

## 1. リポジトリ構成

mipurin-adventure/ (branch: v2) ├── index.html # エントリーポイント (1280x960 canvas) ├── js/ │ ├── game.js # メインゲーム (v5.2.1, 約1280行, 単一ファイル) │ ├── analytics.js # 未使用 (旧v1モジュール) │ ├── audio.js # 未使用 (旧v1モジュール) │ ├── balance.js # 未使用 │ ├── battle.js # 未使用 │ ├── blessingUI.js # 未使用 │ ├── blessings.js # 未使用 │ ├── boss.js # 未使用 │ ├── bossPatterns.js # 未使用 │ ├── collection.js # 未使用 │ ├── config.js # 未使用 │ ├── damageNumber.js # 未使用 │ ├── dungeon.js # 未使用 │ ├── enemyAI.js # 未使用 │ ├── engine.js # 未使用 │ ├── equipment.js # 未使用 │ ├── equipmentUI.js # 未使用 │ ├── events.js # 未使用 │ ├── gameFeel.js # 未使用 │ ├── inventory.js # 未使用 │ ├── itemGen.js # 未使用 │ ├── lang.js # 未使用 │ ├── loot.js # 未使用 │ ├── map.js # 未使用 │ ├── meta.js # 未使用 │ ├── metaUI.js # 未使用 │ ├── nodeMap.js # 未使用 │ ├── nodeMapUI.js # 未使用 │ ├── npc.js # 未使用 │ ├── npcDialogue.js # 未使用 │ ├── particles.js # 未使用 │ └── ... (30+ファイル) # GDD v2.0 Phase2用に生成されたが未接続 ├── css/ │ └── style.css # 未使用 (旧v1用) ├── assets/ │ ├── mipurin.png # プレイヤースプライト (500x500, 2x2グリッド, 4方向) │ ├── music/ # BGM 13曲 │ │ ├── title.mp3 # タイトル画面 │ │ ├── forest_south.mp3 # 森エリア │ │ ├── cave.mp3 # 洞窟エリア │ │ ├── flower_field.mp3 # 花畑エリア │ │ ├── forest_north.mp3 # 深淵エリア │ │ ├── nest.mp3 # 遺跡エリア │ │ ├── boss.mp3 # ボス戦 │ │ ├── shop.mp3 # ショップ (未使用) │ │ ├── village.mp3 # 村 (未使用) │ │ ├── nest_boss.mp3 # ネストボス (未使用) │ │ ├── ending.mp3 # エンディング「とべ！ミプリン」(未使用) │ │ ├── end_b.mp3 # エンディングB (未使用) │ │ └── end_c.mp3 # エンディングC (未使用) │ ├── prologue/ # オープニング画像 10枚 │ │ ├── prologue_01.webp ... prologue_10.webp │ ├── se/ # 効果音 14種 (未使用, Web Audio で代替中) │ │ ├── attack.mp3, hit.mp3, enemy_die.mp3, player_hurt.mp3 │ │ ├── item_get.mp3, level_up.mp3, boss_appear.mp3, game_over.mp3 │ │ ├── door_open.mp3, save.mp3, needle.mp3 │ │ ├── dialog_open.mp3, dialog_close.mp3 │ │ └── menu_move.mp3, menu_select.mp3 │ └── sprites/ │ ├── player.json # 旧v1スプライト定義 (32x32, 26フレーム) │ └── player_sheet.png # 旧v1スプライトシート (未使用) ├── docs/ │ ├── GDD-MIPURIN-v2.0.md # ゲームデザイン設計書 (Phase1-3ロードマップ) │ ├── TOOL-SPRITEGEN-v4.0.md # スプライト生成ツール仕様 │ └── STATUS-v5.0.md # ← 本ドキュメント ├── index copy.html # 旧バックアップ (削除候補) └── index copy 2.html # 旧バックアップ (削除候補)


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

## 3. game.js 現在の構造 (v5.2.1, 約1280行)

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
| 163-173 | WEAPON_DEFS (6種, GDD準拠: 蜂の針等) | OK |
| 175-212 | Drops (pollen, heal のみ) | 部分的 |
| 214-222 | State変数, Player初期化 | OK |
| 224-250 | ENEMY_DEFS (12種, 日本語名+lore), THEME_ENEMIES | OK |
| 252-295 | Projectiles | OK |
| 297-340 | spawnEnemy, buildWaves, spawnWave | OK |
| 342-410 | Boss (4種, 4パターン) | OK |
| 412-440 | BLESSING_POOL (12種, 花の精霊6系統) | OK |
| 442-455 | Shop (3品, 日本語) | OK |
| 457-465 | Fade | OK |
| 467-478 | startFloor (BGM対応) | OK |
| 480-493 | mipurin.png ロード, MIPURIN_FRAMES | OK |
| 495-560 | プロローグ (画像10枚, テキスト6行) | OK (v5.0.5で修正) |
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
- プロローグ (画像10枚+テキスト, Zで進む, Xでスキップ)
- 明るいテーマ (5テーマ: 森/洞窟/花畑/深淵/遺跡)
- 日本語UI (HUD, 祝福, ショップ, 武器名)
- mipurin.png スプライト描画 (4方向)
- WASD移動, Z攻撃, Xダッシュ (静止時も発動可)
- 敵12種 (日本語名+フレーバーテキスト付き), ボス4種, 5テーマ
- 武器6種 (GDD準拠: 蜂の針, 蜜砲, 花粉盾, 蔦鞭, 羽根手裏剣, 女王の杖)
- 祝福12種 (花の精霊6系統: ローザ/リリア/ソーレ/フジカ/ハスミ/キクネ)
- BGM切り替え (フロアごと, ボス戦)
- フェード演出, パーティクル
- ドロップ (花粉40%, 回復15%)
- TABキーでインベントリ画面 (持ち物タブ+図鑑タブ)
- 図鑑 (撃破でフレーバーテキスト解放)

### バグ・未完成
| # | 問題 | 原因 | 優先度 |
|---|---|---|---|
| B1 | ~~プロローグが表示されない~~ | ✅ v5.0.5で修正。draw()にreturn追加+キャッシュバスター | 解決済 |
| B2 | ~~敵撃破でドロップしない~~ | ✅ キャッシュ問題。v5.0.5のキャッシュバスターで解決。花粉40%+回復15%は動作中 | 解決済 |
| B3 | ~~Xダッシュが移動中しか発動しない~~ | ✅ 実際にはatkDir方向にダッシュ可能。キャッシュ問題 | 解決済 |
| B4 | assets/se/*.mp3 が未使用 | AudioはWeb Audioチップチューンのみ。SE用mp3に切り替え未完 | 低 |
| B5 | js/ 内の30+モジュールが未接続 | 旧v1/GDD Phase2用に生成されたが、game.js単体で完結しており参照なし | 整理 |
| B6 | index copy.html, index copy 2.html | 不要バックアップ | 削除 |
| B7 | ending.mp3 未使用 | エンディング画面が未実装 | 低 |

---

## 5. GDD v2.0 との乖離

| GDD設計 | 現在の実装 | ギャップ |
|---|---|---|
| 78祝福 (6系統×13) | 12祝福 (6系統: 薔薇/百合/向日葵/藤/蓮/菊) | 中 (数が不足) |
| 15デュオ祝福 | なし | 大 |
| 6武器 (蜂の針等) | 6武器 (蜂の針/蜜砲/花粉盾/蔦鞭/羽根手裏剣/女王の杖) ✅ | 完了 |
| ノードマップ方式 | 固定部屋+ウェーブ | 大 |
| メタプログレッション (ネクター+花壇) | なし | 大 |
| 部屋テンプレート5種 | 柱ランダム配置のみ | 中 |
| ヒットストップ/ゲームフィール | 画面シェイクのみ | 中 |
| AIスプライト | mipurin.png 4方向のみ | 中 |
| 14種SE (mp3) | Web Audio合成音 | 中 |
| NPC・ストーリー | プロローグ6行のみ | 大 |
| 図鑑・コレクション | TABキーで開閉、敵12種+lore表示 | 小 (Lore拡充のみ) |

---

## 6. Phase 1 ロードマップ (目標: 55/100)

### 現在のスコア推定 (v5.2.1)

| # | 項目 | GDD開始時 | 現在 | Phase1目標 | 差分 |
|---|---|---|---|---|---|
| 1 | コアループ | 4 | 5 | 7 | +2 |
| 2 | メタ | 3 | 3 | 5 | +2 |
| 3 | ランダム生成 | 4 | 4 | 6 | +2 |
| 4 | 敵デザイン | 3 | 4 | 6 | +2 |
| 5 | ストーリー | 3 | 4 | 4 | +0 |
| 6 | ビジュアル | 2 | 3 | 5 | +2 |
| 7 | 音響 | 5 | 5.5 | 6 | +0.5 |
| 8 | 操作性 | 4 | 5 | 6 | +1 |
| 9 | UI/UX | 3 | 5 | 6 | +1 |
| 10 | 技術品質 | 5 | 5 | 6 | +1 |

### Sprint計画

**Sprint 1: 手触り強化 (+4点: 操作性+2, 音響+1.5, コアループ+0.5)** ✅ v5.3.0
- [x] ヒットストップ (攻撃命中時 3-5F停止)
- [x] 敵被弾ノックバック (16px) + 白フラッシュ (0.1秒)
- [x] SE接続 (assets/se/ 14種mp3をイベントに紐付け)
- [x] 攻撃命中時のパーティクル強化

**Sprint 2: マップ多様性 (+2点: ランダム生成+2)** ✅ v5.4.1
- [ ] 部屋テンプレート5種 (開放/迷路/環状/L字/十字)
- [ ] 環境ギミック1種 (トゲ床)
- [ ] generateRoom関数の置換

**Sprint 3: ビルド多様性 (+2点: コアループ+1.5, 敵デザイン+0.5)** ✅ v5.5.0
- [ ] 祝福を24種に拡張 (各系統4つ)
- [ ] デュオ祝福6種 (薔薇×藤, 百合×蓮, 向日葵×薔薇, 藤×菊, 蓮×百合, 向日葵×菊)
- [ ] エンディング画面 (ending.mp3使用)

**Sprint 4: ビジュアル (+3点: ビジュアル+2, 敵デザイン+1)**
- [ ] sprite-generator.html 作成 (TOOL-SPRITEGEN-v4.0準拠)
- [ ] 敵12種+ボス4種のスプライト画像生成
- [ ] プレイヤー歩行アニメーション (2フレーム)
- [ ] または: 手動でドット絵を用意するルートも検討

**Sprint 5: メタ基盤 (+2点: メタ+2)** ✅ v5.6.0
- [x] ネクター (永続通貨) 基本実装
- [x] 死亡時ネクター獲得表示
- [x] 花壇メニュー (HP+1, ATK+1 の2種のみ)

**Sprint 5.5: 装備・消耗品システム (+2点: コアループ+1, UI/UX+1)**
有識者議論済み: かわいいデザイナー、ゲームバランス設計者、UX/UIデザイナー、ローグライク設計者

武器インベントリ:
- [ ] 武器2本持ち（おきにいり/もうひとつ）
- [ ] Qキーで瞬時切替（SE: menu_select, 表示:「ぶんぶん♪ [武器名]」0.5秒）
- [ ] weaponDrop時「そうび/サブにいれる/すてる」3択
- [ ] TAB持ち物タブに武器2本表示、weapon.color枠、↑↓Zで切替

消耗品:
- [ ] 3種定義: はちみつドロップ(🍯HP+3,5+floor花粉), ピリカラ花粉(🌶️ATK+2/8秒,8+floor), ロイヤルゼリー(✨3秒無敵,12+floor)
- [ ] 使用時セリフ表示(dmgNumber流用,0.8秒)
- [ ] ショップ購入のみ（敵ドロップなし）
- [ ] Digit1/2/3で使用（playing時のみ、blessing時は祝福選択）
- [ ] ラン間持ち越し不可（resetGameでクリア）

武器コレクション:
- [ ] weaponCollection(Set)で入手済み武器ID記録
- [ ] localStorage永続保存
- [ ] 図鑑タブに武器セクション追加（desc表示）
- [ ] 6種コンプリート判定＋演出

バグ修正:
- [ ] ソーレの連撃: player.weapon直接変更 → player.atkSpeedBonus方式に変更

設計判断メモ:
- 武器3本→2本に削減（トレードオフ重視、ローグライク設計者意見）
- 消耗品は敵ドロップなし（バランス崩壊防止、バランス設計者意見）
- 無敵5秒→3秒、ATK+3→+2に下方修正（バランス設計者意見）
- 武器固有アクション（パリィ、遠距離射出等）はPhase 2に送る
- 消耗品名・セリフはミプリン世界観に合わせる（かわいいデザイナー意見）
- Sprint 4のスプライトへの影響: 武器スプライトは不要（弧線エフェクト）、消耗品はemoji

### スプライト方針 (決定事項)

Sprint 1-3で「遊んで楽しい」基盤を作ってからSprint 4でビジュアルに投資する。
理由: 幾何学図形でもゲームフィールが良ければ楽しめるが、見た目が良くても手触りが悪ければつまらない。

スプライト生成手段:
1. TOOL-SPRITEGEN-v4.0 の sprite-generator.html を実装 (Gemini API使用)
2. 手動ドット絵 (Aseprite等)
3. 外部AI画像生成+ピクセルアート変換
→ Sprint 4 開始時に最適な方法を選択する。

### アーキテクチャ方針 (決定事項)

Phase 1 の間は game.js 単一ファイルを維持する。
理由: 1300行程度なら1ファイルで管理可能。モジュール分割はPhase 2で検討。
js/ 内の未使用30+ファイルはPhase 1完了後に整理 (削除 or 統合)。

---

## 7. 開発方針: Synapse駆動開発

本プロジェクトは **Synapse** (マルチAIエージェント協調開発システム) の概念に基づいて開発を進める。

### Synapseとは
- リポジトリ: https://github.com/goroyattemiyo/Synapse
- 3つのAIエージェントが協調してコードを生成・検証するシステム
- Anthropic Claude API を使用

### エージェント役割

| Agent | 役割 | 担当 |
|---|---|---|
| Orchestrator (指揮者) | ゴール分析・計画立案・タスク分割 | 何を作るか決める |
| Coder (実装者) | コード実装・ファイル生成 | 実際にコードを書く |
| Reviewer (検証者) | コードレビュー・テスト・品質保証 | バグを見つけて指摘する |

### 開発フロー

ユーザーがゴールを提示
Orchestrator が計画を作成（ファイル構成・要件・テスト方針）
Coder が実装（write_file → run_command でテスト）
Reviewer が検証（read_file → run_command でテスト実行）
APPROVED or 修正指示 → 2-4を最大3ラウンド繰り返し
成果物をリポジトリにコミット

### 開発ルール（絶対遵守）

**1. 忖度禁止**
ユーザーの意見・提案・要望に対して、気を遣って同調したり曖昧に肯定したりしない。
技術的に問題がある、設計として筋が悪い、優先順位が間違っている、工数に見合わない、
と判断した場合は **理由を明示して率直に反対意見を述べる**。
「いいですね」「素晴らしい」等の社交辞令は不要。事実と根拠だけで会話する。

**2. 議論における対等性**
AIエージェント（Orchestrator/Coder/Reviewer）はユーザーの下請けではなく、
プロジェクトの共同開発者として対等に議論する。
ユーザーの判断が誤っていると考える場合、遠慮なく指摘し代替案を提示する義務がある。

**3. 品質に対する妥協禁止**
「とりあえず動けばいい」「後で直す」を安易に許容しない。
技術的負債を積む場合は、その負債の内容・返済時期・リスクを必ず明記する。

**4. 根拠ベースの意思決定**
感覚や好みではなく、GDD v2.0のスコア表・ユーザーテスト結果・コード品質指標など
客観的な根拠に基づいて優先順位と設計判断を行う。
根拠が不十分な場合は「根拠不足」と明言し、判断を保留する。

**5. スコープ厳守**
Phase 1の目標は55/100。それを超える機能要望が出た場合、
Phase 2以降に明確に先送りし、現Sprintのスコープを守る。
スコープクリープ（範囲の肥大化）はプロジェクト失敗の最大原因である。

### 本チャットでの適用

Synapse を直接実行しなくても、会話内で3エージェントの視点を意識して議論する:
- **Orchestrator視点**: 次に何をすべきか、優先順位、設計判断
- **Coder視点**: 具体的な実装方法、行数、影響範囲
- **Reviewer視点**: バグの原因分析、テスト項目、品質チェック

### 関連リソース

| リソース | URL |
|---|---|
| Synapse リポジトリ | https://github.com/goroyattemiyo/Synapse |
| ミプリンの冒険 リポジトリ | https://github.com/goroyattemiyo/mipurin-adventure |
| ミプリンの冒険 デプロイ | https://goroyattemiyo.github.io/mipurin-adventure |
| GDD v2.0 設計書 | docs/GDD-MIPURIN-v2.0.md |
| 本ステータス文書 | docs/STATUS-v5.0.md |

---

## 8. 変更履歴

| バージョン | コミット | 主な変更 |
|---|---|---|
| v5.0 | — | 明るいテーマ, 日本語UI, BGM, プロローグ基盤 |
| v5.0.1 | e8135d8 | F12修正, mipurinスプライト, title→prologue遷移 |
| v5.0.2 | d476144 | タイトル→プロローグ遷移修正 |
| v5.0.3 | 5ac5027 | consumables undefined crash修正, 祝福テキスト日本語化 |
| v5.0.4 | 14a763c | プロローグZキー連打スキップ防止 (prologueGuard) |
| v5.0.5 | — | draw()にreturn追加, キャッシュバスター導入 → B1/B2/B3解決 |
| v5.0.6 | — | デバッグログ追加 (後に削除) |
| v5.1.0 | e356860 | TABインベントリ/図鑑画面, 敵撃破トラッキング |
| v5.2.0 | 0be8d9b | GDD準拠武器名, 敵日本語名+lore, 花の精霊祝福, 図鑑フレーバーテキスト |
| v5.2.1 | 90a9b13 | 世界観パッチ修正（行番号ベース置換）、デバッグログ削除、キャッシュバスターv530 |
