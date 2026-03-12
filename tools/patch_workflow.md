# Patch Workflow v3 (Synapse System)

## 1. 事前議論フェーズ
- Orchestrator が変更内容を提示
- **Reviewer が想定バグを列挙** (最低5項目)
  - 変数重複/未宣言
  - 状態遷移の抜け (gameState, カーソル範囲外)
  - 関数呼び出し漏れ (initWeapon等の全箇所適用)
  - ctx状態汚染 (save/restore)
  - ファイルサイズ超過 (30KB制限)
  - 入力競合 (キーバインドの衝突)
  - エッジケース (null参照, 0除算, 配列範囲外)
- **各バグに対策コードを設計に織り込む**
- Reviewer APPROVED 後に実装開始

## 2. 事前チェック
- node tools/check_globals.js で対象変数の既存宣言を確認
- VARIABLE_MAP.md で変数所有権を確認
- 追加先ファイルの現在サイズを確認 (30KB制限)

## 3. パッチ作成ルール
- 行番号ではなくパターンマッチで挿入位置を特定
- 正規表現の置換は1行ずつ、置換前の値をログ出力
- 新規変数は VARIABLE_MAP.md のルールに従い正しいファイルに配置
- 全武器生成箇所で initWeapon() をラップ
- UI描画関数は ctx.save()/restore() で囲む

## 4. 事後検証
- node -c で全11ファイル構文チェック
- node tools/check_globals.js で重複ゼロ確認
- node tools/check_concat.js で結合構文チェック
- 全ファイルサイズ 30KB 以下確認 (許容: 30.5KBまで)
- 機能別 V1-Vn テストで PASS 確認
- index.html の cache bust 番号を更新

## 5. コミット前 必須: MD更新
- **README.md**: 機能追加があれば反映
- **ROADMAP.md**: 完了項目にチェック、次項目を更新
- **STATUS.md**: 新機能のステータスを追加/更新、スコア更新
- **CHANGELOG.md**: 新バージョンエントリを先頭に追加
- ※ MD更新なしのコミットは禁止

## 6. コミット規約
- feat: / fix: / refactor: プレフィックス
- 変更ファイル・検証結果をコミットメッセージに記載
- MD ファイルが含まれていることを確認してからコミット