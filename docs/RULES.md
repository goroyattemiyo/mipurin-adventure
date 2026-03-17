---

## 3. セッション開始プロトコル

### 3.1 新規会話の開始時

毎回の会話開始時に、以下をリポジトリから raw.githubusercontent.com 経由で読み込む:
1. docs/RULES.md - 開発ルール（本ドキュメント）
2. docs/STATUS.md - 現在の開発状況
3. docs/ROADMAP.md - 開発計画（存在する場合）
4. docs/DECISIONS.md - 過去の設計判断（存在する場合）

### 3.2 会話圧縮が発生した場合

同じ手順でファイルを再読み込みする。AIの記憶に頼らず、常にファイルが正（Single Source of Truth）。

### 3.3 セッション終了時

以下を更新してからコミットする:
- STATUS.md の進捗・Module Sizes・Next Actions
- ROADMAP.md の Sprint Status
- docs/DECISIONS.md に今回の設計判断を追記（該当する場合）
- CHANGELOG.md に変更を追記
- docs/RULES.md のファイルサイズ監視テーブル（変更があった場合）

---

## 4. 変更前の影響範囲宣言（Blast Radius）

コード変更の前に、以下を宣言すること:

1. **変更対象ファイル**: どのファイルを変更するか一覧
2. **影響を受けるファイル**: グローバル変数や関数の依存で間接的に影響するファイル
3. **テストへの影響**: test_game.py の既存チェックが壊れる可能性があるか
4. **ロールバック方法**: 問題が起きた場合の戻し方（git revert で十分か）

5ファイル以上に影響する変更は、必ずユーザーの承認を得てから実行する。

---

## 5. ハルシネーションガード

AIがコード内で参照する名前は、すべて実在確認を行う:

- **ファイルパス**: リポジトリAPIまたはraw URLで確認
- **関数名・変数名**: 実際のソースコードをcrawlerで確認
- **スプライトID**: SPRITE_MAP の定義と assets/ の実在を確認
- **BGM名**: bgm.js の TRACKS 定義と assets/music/ の実在を確認
- **敵名・武器名**: ENEMY_DEFS / WEAPON_DEFS の実際の定義を確認
- **GitHub参照**: blob URLではなく必ず raw.githubusercontent.com を使う

確認できないものは「未確認の想定」と明記し、確認を求めてから使用する。

---

## 6. スコープロック & バックログ規律

### 6.1 現タスク以外の変更禁止

AIが「ついでにこれも改善しましょう」と提案した場合:
- 即座に BACKLOG.md に追記する
- 現タスクの実装に戻る
- ユーザーが優先順位を判断してから着手する

### 6.2 BACKLOG.md の形式

    | 日付 | 提案内容 | 発生経緯 | 優先度 | 状態 |
    |------|----------|----------|--------|------|
    | YYYY-MM-DD | 内容 | どのタスク中に発見 | 未定 | 未着手 |

---

## 7. 決定ログ（DECISIONS.md）

### 7.1 目的

「なぜこう実装したか」を記録し、会話が消えても設計意図を残す。

### 7.2 記録形式

    ## D-001: [タイトル]
    - 日付: YYYY-MM-DD
    - 背景: なぜこの判断が必要だったか
    - 選択肢: 検討した選択肢の一覧
    - 決定: 何を選んだか
    - 理由: なぜその選択肢を選んだか
    - スコア: スコアリング結果（該当する場合）

---

## 8. ファイルサイズ制限

### 8.1 JavaScript

    | 種別 | 上限 | 分割検討 | 強制分割 |
    |------|------|----------|----------|
    | JSモジュール | 35KB | 28KB超 | 35KB超 |

test_game.py のサイズチェック閾値と連動。超過時はモジュール分割を計画する。

### 8.2 ドキュメント

    | 種別 | 上限 | 目安 |
    |------|------|------|
    | Markdown | 300行 | AIが1回で読めるサイズを維持 |

### 8.3 アセット

    | 種別 | 推奨サイズ | 備考 |
    |------|-----------|------|
    | スプライト (webp) | 50KB未満/枚 | 透過PNG から webp変換推奨 |
    | BGM (mp3) | 5MB未満/曲 | 未使用BGMは削除 or BACKLOG |
    | プロローグ画像 (webp) | 200KB未満/枚 | |

---

## 9. ワークフロールール

### 9.1 ブランチ・コミット

- v2 ブランチで作業（ソロ開発）
- コミットメッセージ: feat:, fix:, docs:, test:, refactor: プレフィックス
- コミット前に必ず node -c 構文チェック + python test_game.py を通す
- 100/100 PASS 必須。FAIL があればプッシュ禁止

### 9.2 実装フロー

    1. 有識者議論 → スコアリング → 着手許可
    2. 影響範囲宣言（Blast Radius）
    3. PowerShell + Python スクリプトでコード変更
    4. node -c 構文チェック（変更ファイル全部）
    5. python test_game.py → 100/100 PASS 確認
    6. git add → git commit → git push origin v2
    7. ブラウザ実機確認（Ctrl+Shift+R → コンソールテスト → 目視）
    8. セッション終了時にドキュメント更新

### 9.3 PowerShell + Python パターン

コード変更は PowerShell の ヒアドキュメントで Python スクリプトを生成し実行する。直接エディタで編集するのではなく、再現可能なスクリプトとして記録する。スクリプトは fix_*.py でリポジトリにコミットし、変更の履歴を残す。

### 9.4 コードブロック消失の回避

PowerShell ヒアドキュメント内に Markdown コードフェンス（バッククォート3連）を含めると、チャット UI でスクリプトの一部が消失する。

Python スクリプト内でコードフェンスを文字列として書く必要がある場合:

回避策A（chr 使用）:
    fence = chr(96) * 3
    f.write(fence + 'js' + chr(10) + '...' + chr(10) + fence)

回避策B（チルダ使用）:
    f.write('~~~js' + chr(10) + '...' + chr(10) + '~~~')

この制約は AI の応答テキストにも適用される。

---

## 10. テストルール

### 10.1 test_game.py (自動テスト)

- コミット前に毎回実行
- 100項目: ファイル存在、サイズ制限、構文、グローバル変数、関数、タブ切替、装備UI、タッチ、クロスファイル参照、回帰テスト
- 新機能追加時はテスト項目も追加を検討

### 10.2 ブラウザ手動テスト

UI・描画変更後は以下を実施:
1. ハードリロード（Ctrl+Shift+R）
2. コンソールでデバッグコマンド実行（debugFillCollection() 等）
3. 該当機能の目視確認
4. スクリーンショット提出

### 10.3 デバッグツール

    debugFillCollection(maxLoop) -- 図鑑を全埋め
    loopCount = N -- ループ数を設定
    player.weapons[0].rarity = 'legend' -- レアリティ変更
    weaponCollection.clear(); weaponCollection.add('needle') -- 武器コレクションリセット

---

## 11. 変数所有権ルール

    game.js       -- Canvas, 入力, Audio -- 設定系のみ追加可
    data.js       -- テーマ, 武器, 敵名, ゲーム状態 -- ゲーム状態変数OK
    enemies.js    -- 敵, ボス, 弾 -- 敵関連のみ
    blessings.js  -- 祝福, 共鳴 -- 祝福関連のみ
    systems.js    -- メタ進行, ショップ, スプライト -- メタ進行変数OK
    nodemap.js    -- ノードマップ, イベント -- マップ関連のみ
    ui.js         -- HUD, UI描画 -- UI状態のみ
    equip_ui.js   -- 装備UI -- 装備UI状態のみ
    update.js     -- メインループ -- 追加禁止（参照のみ）
    render.js     -- 描画ループ -- 追加禁止（参照のみ）
    combat.js     -- 戦闘処理 -- 追加禁止（参照のみ）
    touch.js      -- タッチ操作 -- タッチ関連のみ
    rarity.js     -- レアリティ定義 -- レアリティ関連のみ
    charms.js     -- チャーム定義 -- チャーム関連のみ
    bgm.js        -- BGM再生 -- BGM関連のみ

---

## 12. 技術的負債台帳

    #1 render.js 30.7KB（35KB上限に迫る） -- 中 -- 要監視
    #2 data.js 30.2KB（同上） -- 中 -- 要監視
    #3 未使用BGM: end_b.mp3, end_c.mp3 (計8.5MB) -- 低 -- 未着手
    #4 Tier2武器スプライトがTier1と同一画像 -- 低 -- 未着手
    #5 モンスター色とバリアント名の不一致 -- 中 -- 未着手
    #6 fix_*.py スクリプトがルートに散在 -- 低 -- 未着手

---

## 13. ファイルサイズ監視

    js/game.js        11.6KB  OK
    js/data.js        30.2KB  要注意
    js/bgm.js          8.6KB  OK
    js/enemies.js     14.5KB  OK
    js/blessings.js   20.0KB  OK
    js/systems.js     16.1KB  OK
    js/nodemap.js     14.1KB  OK
    js/equip_ui.js    17.5KB  OK
    js/ui.js          29.8KB  要注意
    js/ui_screens.js  12.2KB  OK
    js/combat.js      16.9KB  OK
    js/update.js      17.8KB  OK
    js/render.js      30.7KB  要注意
    js/touch.js       12.9KB  OK
    js/rarity.js       1.5KB  OK
    js/charms.js       4.2KB  OK

テスト状況: 100件合格, 0件失敗

---

## 14. ルール変更履歴

- 2026-03-17: 初版作成（RULES_TEMPLATE.md ベースにミプリン用カスタマイズ。STATUS.md セクション7のルールを統合）
