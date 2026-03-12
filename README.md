# ミプリンの冒険 — Mipurin Adventure v6.14.1
> Browser Action RPG + Roguelite | Canvas 2D | Pure JavaScript (ES6+)

## 概要
花の国を舞台に、小さなミツバチ「ミプリン」が花粉を取り戻す冒険RPG。
ローグライト要素（祝福・ノードマップ・メタ進行）を備えたブラウザゲーム。

## プレイ方法
| 操作 | キー |
|------|------|
| 移動 | WASD / 矢印 |
| 攻撃 | Z |
| ダッシュ | X |
| アイテム | 1 / 2 / 3 |
| 武器持ち替え | Q |
| インベントリ | TAB |
| 花壇メニュー | タイトルでX |

## ファイル構成 (10ファイル, 各30KB以下)
| ファイル | 内容 |
|---------|------|
| game.js | Canvas初期化(1280×960), 入力(keys[]), Audio SE(Web Audio API), 音量管理 |
| data.js | BGM再生, パレット(COL), テーマ(5種), 武器(12種), 消耗品(3種), ドロップ, 蜜だまり, ホーミング, メッセージシステム, NPC台詞, 背景パーティクル |
| enemies.js | 敵定義(12形状), ボス定義(4種), ウェーブ生成, 投射物 |
| blessings.js | 78祝福(6家族×13) + 15デュオ, 選択・適用ロジック |
| systems.js | メタ進行(花壇6種+解放), ショップ, フェード, フロア管理, スプライトエンジン(28画像), 衝突判定, プロローグ |
| nodemap.js | 2段ミニツリーノードマップ, 8イベント, ノード実行 |
| ui.js | HUD, 祝福選択画面, ショップ画面, インベントリ(2タブ), ダイアログ, ダメージ数字 |
| ui_screens.js | タイトル, プロローグ, エンディング(3種), 花壇画面 |
| update.js | ゲームループ, 入力処理, 戦闘(5武器効果), 敵AI(5パターン), 状態遷移 |
| render.js | 描画メイン, 敵形状(12種), スプライト, エフェクト, ボス描画, ゲームオーバー画面 |

## 実装済み機能
- Sprint A: 10ファイル分割 + 78祝福(Common48/Rare24/Legend6) + 15デュオ
- Sprint B: 2段×3列ノードマップ, 5ノードタイプ, 8イベント
- Sprint C: 花壇6種(HP/ATK/速度/ダッシュCD/磁力/ネクター倍率), NPCフローラ(10台詞), 3エンディング分岐
- Sprint D: Web Audio API SE(15種) + BGM(12曲)
- Sprint E: テーマ別背景パーティクル, 祝福カードアニメ, HPバウンス
- v6.14.1: 18件バグ修正, UI改善(ゲームオーバー/タイトル/ボスシルエット), QoL(吹き出し5種)

## 武器一覧 (12種)
| 武器 | 倍率 | 射程 | 速度 | 特殊効果 |
|------|------|------|------|----------|
| 蜂の針 | x1.0 | 64 | 0.18s | 2連撃 |
| 蜜砲 | x1.5 | 108 | 0.5s | 遠距離 |
| 花粉盾 | x0.8 | 52 | 0.35s | パリィ反撃 |
| 蔦鞭 | x0.7 | 84 | 0.4s | 360°+毒 |
| 羽根手裏剣 | x0.5 | 76 | 0.12s | 連射 |
| 女王の杖 | x2.0 | 68 | 0.65s | 範囲爆発 |
| 蜂の金針 | x1.3 | 68 | 0.16s | 3撃目衝撃波 (F6+) |
| 蜜の大砲 | x1.8 | 120 | 0.45s | 蜜だまり減速 (F6+) |
| 聖花の盾 | x1.0 | 60 | 0.3s | パリィATK×4+HP回復 (F9+) |
| 呪いの荊 | x0.9 | 96 | 0.38s | 毒+毒霧拡散 (F9+) |
| 翼の嵐 | x0.7 | 84 | 0.1s | ホーミング追尾 (F9+) |
| 女王の真杖 | x2.5 | 76 | 0.5s | 範囲1.5倍爆発 (F12+) |

## 技術仕様
- 描画: Canvas 2D (HiDPI対応, 1280×960, 64pxタイル, DPR自動スケール)
- 音声: Web Audio API (チップチューンSE 20種) + 外部mp3 (BGM 12曲 / SE 15ファイル)
- フォント: M PLUS Rounded 1c (Google Fonts)
- 保存: localStorage (メタ進行/武器コレクション/音量設定)
- スプライト: 28画像(webp), 個別PNG読み込み+キャッシュ

## 開発ワークフロー
**[Synapse](https://github.com/goroyattemiyo/Synapse)** (3-AI Agent System: Orchestrator→Coder→Reviewer) で設計→実装→検証。
1. 設計議論 → ROADMAP.md にスコアリング・仕様確定
2. Synapse投入 → 自動実装・レビュー（最大3ラウンド）
3. スコア100点で mipurin-adventure リポに反映
4. ブラウザテスト → STATUS.md 更新

## 関連ドキュメント
- [ROADMAP.md](ROADMAP.md) — 開発ロードマップ・Synapse投入計画
- [CHANGELOG.md](CHANGELOG.md) — バージョン履歴
- [STATUS.md](STATUS.md) — 現在の開発状況

## オーディオ (ローカル配置, リポ非含)
- BGM: village, nest, forest_north, flower_field, title, end_b, forest_south, boss, end_c, cave, nest_boss, shop
- SE: menu_select, enemy_die, attack, boss_appear, save, level_up, door_open, needle, player_hurt, hit, item_get, menu_move, dialog_close, game_over, dialog_open