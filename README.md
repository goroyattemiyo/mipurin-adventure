# ミプリンの冒険
**Browser Action RPG / Roguelite** - Canvas 2D, Pure JavaScript

## 概要
花の国のちいさなハチ「ミプリン」が、砕けたクリスタルのかけらを集めて冒険するアクションRPG。
フロアを進み、敵を倒し、祝福を集めてボスに挑もう！

**Version**: v6.15.1 (2026-03-12) | **Branch**: v2

## 操作方法
| キー | 操作 |
|------|------|
| WASD / 矢印 | 移動 |
| Z | 攻撃 / 決定 |
| X | ダッシュ / キャンセル / リロール(祝福) / 2周目(エンディング) |
| Q | 武器切替 |
| 1-3 | アイテム使用 |
| TAB | インベントリ |

## モバイル対応
タッチデバイスでは仮想ジョイスティック+ボタンが自動表示（touch.js）

## ファイル構成（11モジュール, 各30KB以下）
| ファイル | サイズ | 内容 |
|----------|--------|------|
| game.js | ~9 KB | Canvas, 入力, Audio, UI設定変数 |
| data.js | ~28 KB | テーマ, 武器, アイテム, ゲーム状態変数 |
| enemies.js | ~15 KB | 敵12種, ボス4体, 弾, 色相シフト |
| blessings.js | ~20 KB | 祝福78種 + 共鳴15種 |
| systems.js | ~13 KB | メタ進行, ショップ, フェード, スプライト |
| nodemap.js | ~14 KB | ノードマップ, イベント8種 |
| ui.js | ~21 KB | HUD, 祝福選択, ショップ, インベントリ |
| ui_screens.js | ~12 KB | タイトル, プロローグ, エンディング, 花壇 |
| update.js | ~30 KB | メインループ, 戦闘, AI, 周回 |
| render.js | ~29 KB | 描画, エフェクト, ボス |
| touch.js | ~10 KB | モバイルタッチ操作 |

## 主な機能
- 15フロア + ボス4体 + 3種エンディング + プロローグ
- 祝福78種 + 共鳴15種（レアリティ付き, 花粉リロール対応）
- 武器12種（固有効果: パリィ, 蜜だまり, 毒, ホーミング等）
- 周回システム（敵HP/ATKスケール + 色違い, 武器/祝福引継ぎ）
- ネクター+花壇メタ進行（6種アップグレード）
- ノードマップ（ショップ, イベント, エリート戦）

## 開発ワークフロー
[Synapse System](https://github.com/goroyattemiyo/Synapse) で Orchestrator-Coder-Reviewer の3段階レビュー。
パッチ適用手順は tools/patch_workflow.md を参照。

## 品質管理ツール
- tools/check_globals.js: グローバル変数重複検出（スコープ解析v2）
- tools/check_concat.js: 全ファイル連結構文チェック
- VARIABLE_MAP.md: 変数所有権ルール

## 関連ドキュメント
ROADMAP.md / CHANGELOG.md / STATUS.md / VARIABLE_MAP.md