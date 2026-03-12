# PATCH_WORKFLOW - パッチ適用手順

## 変更前チェック
1. node tools/check_globals.js で現在の重複確認
2. 変更対象の変数が VARIABLE_MAP.md のどのファイルに属するか確認
3. 変更対象の関数の行番号を grep で取得

## パッチ作成ルール
- 行番号指定ではなく、関数名や一意パターンで挿入位置を特定する
- 置換対象の文字列が一意であることを事前に確認する
- 1パッチ1機能。複数機能を1スクリプトに詰め込まない

## 変更後チェック（全て OK でコミット可）
1. node -c js/*.js（個別構文チェック）
2. node tools/check_globals.js（重複ゼロ）
3. node tools/check_concat.js（連結構文チェック）
4. 検証項目（V1-Vn）全 OK

## コミットメッセージ規約
- fix: バグ修正
- feat: 新機能
- docs: ドキュメント
- refactor: リファクタリング