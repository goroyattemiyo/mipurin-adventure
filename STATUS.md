# STATUS.md — ミプリンの冒険 v6.14.1

## 最終更新: 2026-03-12

## 現在のフェーズ
Sprint F（スマホ対応）+ Sprint G（武器装備拡張）の設計議論中。
Synapse投入準備。

## 完了済み (v6.14.1)
- Patch A: camX/camY除去, BGM競合修正, idleTimer修正, stopBGMフェード統一, dashCooldown初期値, タイトルUI構造修正, 重複宣言修正
- Patch B: パーティクル最適化, 吹き出し追加(クランプ/復帰/回復/クリア), bossLines除去
- ゲームオーバー画面: テキスト上部パネル/画像下部分離
- タイトル画面: 情報パネル整理、配色改善
- ボスシルエット: 非ボスダイアログ誤表示修正

## 既知の課題
- Q6: 被ダメ吹き出し + voice_hurt 未適用
- F15: コレクションタブのスクロール未実装
- F19: SE/BGM音量の完全分離（部分対応済み）

## 次のアクション
1. Sprint F/G 設計をSynapseに投入
2. Synapse出力レビュー・スコアリング
3. 100点確定後リポ反映

## 開発フロー
設計議論 → Synapse (Orchestrator→Coder→Reviewer) → スコア100点 → リポ反映 → ブラウザテスト