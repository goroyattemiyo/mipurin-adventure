# CONTEXT.md — ミプリンの冒険（毎回必須）
> 最終更新: 2026-04-26 | v6.43 | elite敵システム・壁ハマり修正完了
> **セッション開始時はこのファイル1つだけ渡せばよい**

---

## 1. 現在のスナップショット

| 項目 | 値 |
|------|----|
| バージョン | v6.43 |
| スコア | 74.7/100（Enemy Design強化中） |
| テスト | 157/159 PASS（drawInventory・2-pane structure は既存負債） |
| 残スプリント | Sprint III-B/C（Enemy Design継続） |
| Live | https://goroyattemiyo.github.io/mipurin-adventure |

### スコア詳細

| 項目 | 現在 | 目標(売れる) | 状態 |
|------|------|------------|------|
| Core Loop | 8.3 | 8 | ✅ |
| Meta Progress | 7.0 | 7 | ✅ |
| Randomness | 6.6 | 7 | 🔶 |
| Enemy Design | 6.5 | 8 | 🔶（elite実装済み） |
| Story | 7.0 | 7 | ✅ |
| UI/UX | 7.5 | 7 | ✅ |
| Visual | 7.5 | 7 | ✅ |
| Operation Feel | 7.8 | 7.5 | ✅ |
| Audio | 7.0 | 7.5 | 🔶 |
| **TOTAL** | **74.7** | **88** | 🔶 |

### ファイルサイズ監視

| ファイル | サイズ | 状態 |
|----------|--------|------|
| js/ui.js | 43.5 KB | ✅ OK (上限50KB) |
| js/data.js | 26.4 KB | ✅ OK |
| js/render.js | 16.8 KB | ✅ OK |
| その他全JS | 50KB以下 | ✅ |
| **リポジトリ全体** | **83 MB** | ✅ |

### 技術的負債

- 未使用BGM end_b.mp3 + end_c.mp3 約8.5MB（低優先）
- drawInventory / 2-pane structure テスト FAIL（既存・今回変更無関係）

---

## 2. セッションプロトコル

### 開始時
1. このファイル（CONTEXT.md）を渡す
2. 今回やるタスクを**1つだけ**宣言する
3. コード探索が必要な場合のみ REFERENCE.md を追加で渡す

### 終了時
1. CONTEXT.md のスナップショットを更新（バージョン・スコア・テスト数・サイズ）
2. REFERENCE.md の DECISIONS に今回の判断を追記（該当する場合）
3. git commit → push

### 会話リセット目安
- チャットUI: 10〜15ターンを超えたら新しいセッションへ
- Claude Code: コンテキスト使用量が **+430 を超えたら**作業停止・push・新セッション（CLAUDE.md参照）
- 1スプリント = 1セッションを目安にする
- リセット後はこのファイルを渡すだけで文脈復元できる

---

## 3. 開発ルール（必須）

### 変更前の影響範囲宣言（Blast Radius）
コード変更前に必ず宣言: 変更対象ファイル / 影響ファイル / テストへの影響 / ロールバック方法
5ファイル以上に影響する変更はユーザー承認必須

### スコープロック
「ついでにこれも」は即座にBACKLOG.mdへ。現タスクに戻る。

### ハルシネーションガード
コード内で参照する名前はすべて実在確認。確認できないものは「未確認の想定」と明記。
GitHubはblob URLではなく raw.githubusercontent.com を使う。
GitHub MCPが利用可能な場合はツールで直接ファイルを取得する（Raw URL手動貼り付け不要）。

### ワークフロー

影響範囲宣言 → 2. コード変更 → 3. node -c 構文チェック
→ 4. python test_game.py (157/159 PASS必須) → 5. git push → 6. ブラウザ実機確認

**コード変更はPythonスクリプトで行う（_work/ フォルダに保存）**
- Set-Content で _work/_xxx.py として生成 → python で実行（ファイル読み書き・文字列置換）
- _work/ は .gitignore 除外済み。コミットに混入しない
- ユーザーが実行結果を確認してから次のステップへ進む

### PowerShellコードフェンス回避
ヒアドキュメント内にバッククォート3連を含めない。
代替: `fence = chr(96) * 3` または `~~~js` チルダ記法を使う。

### Synapse Council（設計判断）

複数ファイルにまたがる新機能・設計変更の際に招集する有識者会議。

**メンバー選定（タスク性質から自動選択）**

| 専門家 | 招集条件 |
|--------|---------|
| Roguelite Designer | ゲームループ・バランス変更 |
| Game Balance Designer | 数値調整・難易度設計 |
| Narrative Editor | ストーリー・ダイアログ追加 |
| **Implementer** | **常に招集（必須）** |
| UI Designer | UI/UX変更 |
| Audio Director | BGM・SE追加 |
| Performance Engineer | 描画・ファイルサイズ最適化 |
| **主婦 (Housewife)** | UI/UX・操作性検討時 |
| **学生 (Student)** | 演出・ビジュアル検討時 |
| **ゲーマー (Gamer)** | 全般（特にバランス・QoL） |

**フロー**

メンバー選定
各専門家が意見を出す
スコアリング（40点満点）
→ 32点以上: 着手許可
→ 32点未満: 再設計・再評価
承認された判断を REFERENCE.md の DECISIONS に追記


**省略条件**
1〜2ファイルに閉じるバグ修正はSynapse Councilをスキップしてよい。

**モデル切り替えルール**
- 通常実装: **Sonnet**（デフォルト）
- 複雑な設計・行き詰まり時: **Opus**（`/model` コマンドで切替）

---

## 4. ファイルサイズ制限

| 種別 | 上限 | 分割検討 |
|------|------|---------|
| JSモジュール | 50KB | 40KB超 |
| Markdown | 150行 | — |

### 禁止ファイル（絶対に渡さない）
`package-lock.json` / `node_modules/` / `*.lock` / フルHDスクショ / PDFの直接アップロード

---

## 5. Claude使用効率化

### 画像・スクショ
- 800×600px以下に縮小してから貼る
- コンソールエラーはテキストでコピペ（スクショ禁止）
- 画像は毎ターン再送される。不要になったら引き継がない

### PDF
- 必ずMD/テキストに変換してから渡す

### Claude Code vs チャットUI
| 用途 | 推奨 |
|------|------|
| コード実装・ファイル修正 | Claude Code |
| 設計議論・質問 | チャットUI |
| モデル | 基本Sonnet / 複雑な設計のみOpus |

---

## 6. 変数所有権（クイックリファレンス）

| ファイル | 追加可否 |
|----------|---------|
| game.js | 設定系のみ |
| data.js | ゲーム状態変数OK |
| systems.js | メタ進行変数OK |
| update.js / render.js / combat.js | **追加禁止（参照のみ）** |

---

## 7. ルール変更履歴

- 2026-04-26: elite敵システム実装（フロア3以降wave最終体、HP×2/score×3/金オーラ/⭐アイコン）
- 2026-04-26: 敵spawn壁ハマり修正（spawnEnemy末尾にpushout補正追加）
- 2026-04-19: 売れる目標スコアを88点に設定（itch.io+BOOTH、1000〜2000円）
- 2026-04-19: Enemy Design強化ロードマップ確定（Sprint III-A/B/C）
- 2026-04-19: stash mergeコンフリクト解消・origin/mainと同期
- 2026-03-29: スクリプトはダウンロード不要。Set-Content で直接 _work\_xxx.py を生成してから python で実行する
- 2026-03-29: コマンドは1つのコードブロックにまとめて出力する（コピペ回数削減）
- 2026-03-29: キーヒント（Q/E/W/S）はPC専用。touchActive===trueの環境では描画しない
- 2026-03-29: UIManagerのヘルプはmouse.clicked専用設計。タッチでは_helpKeyを直接トグルする
- 2026-03-28: Pythonスクリプト生成はヒアドキュメント + Set-Content経由で.pyファイル保存後に実行する形式に統一
- 2026-03-28: GitHub MCP連携を使いファイル取得はツールで行う（Raw URL手動貼り付け不要）
- 2026-03-28: タブUIキーヒント表示タスクを次セッションへ持ち越し
- 2026-03-28: セッション終了。次タスク：TAB画面（図鑑・装備）改修（BACKLOG）
- 2026-03-28: いきもの図鑑をトレカ型グリッド表示に変更
- 2026-03-28: Sprint I完了（闇の根3フェーズ・女王帰還エンディング実装）
- 2026-03-26: ファイルサイズ制限を緩和（上限35KB→50KB）
- 2026-03-26: Phase A — Howler.js 2.2.4 導入
- 2026-03-26: assets/sprites/raw/ をgit履歴ごと削除（215MB → 83MB）
- 2026-03-25: UIManager v2 導入
- 2026-03-24: CONTEXT/REFERENCE/ARCHIVE の3ファイル体制へ再編
- 2026-03-21: v2 → main 統合

---

## 8. 開発ロードマップ

### Sprint III（Enemy Design 6.5→8.0）
| Sprint | 内容 | 状態 |
|--------|------|------|
| III-A | elite敵システム（金オーラ・HP×2・score×3） | ✅ 完了 |
| III-B | ギミック敵（召喚・分裂・壁抜け） | 未着手 |
| III-C | 中ボス演出強化 | 未着手 |

### BACKLOG
- TAB画面（図鑑・装備）の改修
- 販売ページ整備（itch.io・BOOTH）
- Randomness強化（シード表示・イベントルーム追加）
- Audio強化（SE追加）
- ローカライズ（英語対応）

---

## 9. ファイル一覧 & Raw URL

| タスク | fetchするファイル |
|--------|-----------------|
| UI変更・画面追加 | js/ui.js, js/ui_screens.js, js/ui/UIManager.js |
| 敵追加・バランス調整 | js/enemies.js, js/combat.js, js/data.js |
| タッチ・操作系 | js/touch.js, js/update.js |
| コレクション・装備 | js/equip_ui.js, js/shop_ui.js |
| BGM・SE | js/bgm.js |
| ダンジョン・部屋生成 | js/data_room.js, js/data.js |
| 祝福・チャーム | js/blessings.js, js/charms.js |
| メタ進行・花壇 | js/systems.js |
| レンダリング | js/render.js, js/render_entities.js |
| Lore・図鑑 | js/lore.js, js/rarity.js |
| ゲーム設定 | js/game.js |

### 全jsファイル Raw URL
- js/data.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/data.js
- js/ui.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/ui.js
- js/render.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/render.js
- js/systems.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/systems.js
- js/update.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/update.js
- js/combat.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/combat.js
- js/enemies.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/enemies.js
- js/blessings.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/blessings.js
- js/ui_screens.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/ui_screens.js
- js/touch.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/touch.js
- js/bgm.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/bgm.js
- js/game.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/game.js
- js/nodemap.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/nodemap.js
- js/data_room.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/data_room.js
- js/charms.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/charms.js
- js/lore.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/lore.js
- js/rarity.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/rarity.js
- js/render_entities.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/render_entities.js
- js/equip_ui.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/equip_ui.js
- js/shop_ui.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/shop_ui.js
- js/gimmicks.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/gimmicks.js
- js/ui/UIManager.js https://raw.githubusercontent.com/goroyattemiyo/mipurin-adventure/main/js/ui/UIManager.js
