# Sprite Generator v4 設計書

文書ID: TOOL-SPRITEGEN-v4.0 | 日付: 2026-02-26

## 概要

AI画像生成パイプラインベースのスプライト生成Webアプリ。
tools/sprite-generator.html 1ファイルに全機能収容。

## パイプライン

Copy
テキスト/アップロード → Gemini AI生成 → 背景除去(@imgly) → ピクセルアート変換 → 4方向生成 → 3フレームアニメ → シート組立 → PNG+JSON出力


## 技術スタック

| 機能 | 技術 |
|---|---|
| AI画像生成 | Gemini 2.5 Flash Image (REST) |
| 背景除去 | @imgly/background-removal v1.5 (CDN ESM) |
| ピクセルアート | Canvas 2D (median cut, dithering, outline) |
| 4方向AI | Gemini image-to-image |
| 4方向フォールバック | Canvas反転/暗化 |
| ZIP | JSZip v3.10 (CDN) |
| ダウンロード | FileSaver v2.0 (CDN) |

## UI構成 (8セクション)

1. API設定 - キー入力, localStorage保存
2. キャラクター生成 - 名前, スタイル(chibi/sd/realistic), サイズ(32/48/64), 追加プロンプト, AI生成 or アップロード
3. 背景除去 - Before/After, 進捗バー, 自動実行オプション
4. ピクセルアート変換 - パレット色数(4-32), 輪郭線, ディザリング, リアルタイムプレビュー
5. 4方向生成 - 正面/左/右/後ろ, AI or プログラム, 個別リトライ
6. アニメーションフレーム - idle/walk1/walk2, ループプレビュー
7. シート出力 - 4x3=12コマ, PNG/JSON DL, インポートコード
8. バッチモード - 全敵プリセット, 一括生成, ZIP DL

## GeminiAPI クラス

- endpoint: generativelanguage.googleapis.com/v1beta/models
- model: gemini-2.5-flash-image
- generateImage(prompt) - text→image
- editImage(prompt, base64) - image-to-image
- buildCharacterPrompt(name, style, size, extras) - テンプレート組立
- buildDirectionPrompt(direction) - 方向変更プロンプト
- CORS: ?key= クエリパラメータ方式

## BgRemover クラス

- import from CDN ESM
- model: isnet_fp16 (~80MB, cached)
- progress callback
- output: foreground PNG

## PixelConverter クラス

- nearest-neighbor resize
- medianCut palette generation
- applyNearest or floydSteinberg dithering
- addOutline (黒1px輪郭)

## DirectionGenerator クラス

- AIモード: Gemini image-to-image × 3方向
- プログラムモード: flipH(right), darken(back), identity(left)

## FrameGenerator クラス

- idle: そのまま
- walk1: 1px上シフト
- walk2: 1px下シフト

## SheetAssembler クラス

- 4rows × 3cols canvas
- generateMeta(name, size) → JSON
- generateImportCode(name, size) → コードスニペット

## BatchProcessor クラス

- PRESETS: slime, mushroom, spider, bat, worm, flower, bee, golem, ghost
- 2秒間隔でAPI呼び出し
- JSZip でPNG+JSON → ZIP

## API制限

- 無料: 500画像/日
- 1キャラ: 4コール
- 全9種: 36コール (無料枠の7.2%)

## CDN

```html
<script type="importmap">{"imports":{"@imgly/background-removal":"https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.8/+esm"}}</script>
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js"></script>
```

テスト項目 (15項目)
APIキー保存/復元
AI画像生成
画像アップロード
背景除去+進捗
ピクセルアート変換
AI 4方向
プログラム4方向
アニメーション再生
PNG DL
JSON DL
インポートコード
バッチ実行
ZIP DL
APIキー無しフロー
エラーハンドリング
