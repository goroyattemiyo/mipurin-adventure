# ミプリンの冒険 — Mipurin Adventure
> Browser Action RPG + Roguelite | Canvas 2D | Pure JavaScript

## 概要
花の国を舞台に、小さなミツバチ「ミプリン」が花粉を取り戻す冒険RPG。
ローグライト要素（祝福・ノードマップ・メタ進行）を備えたブラウザゲーム。

## プレイ方法
- **移動**: WASD / 矢印キー
- **攻撃**: Z
- **ダッシュ**: X
- **アイテム使用**: 1 / 2 / 3
- **武器持ち替え**: Q
- **インベントリ**: TAB
- **花壇メニュー**: タイトル画面で X

## 現在のバージョン: v6.10.2

### 実装済み機能

#### Sprint A-0: ファイル分割 ✅
単一 game.js を10ファイルに分割（全ファイル 30KB 未満）

| ファイル | サイズ | 内容 |
|---------|--------|------|
| game.js | 6.5 KB | Canvas初期化, 入力, Audio SE, RNG, パーティクル, 部屋生成 |
| data.js | 16.8 KB | BGM, パレット, テーマ, 武器, 消耗品, ドロップ, メッセージ, NPC台詞 |
| enemies.js | 12.9 KB | 敵定義, ボス定義, ウェーブ生成, 投射物 |
| blessings.js | 20 KB | 78祝福 (6家族×13) + 15デュオ, 祝福選択・適用ロジック |
| systems.js | 13.3 KB | メタ進行（花壇6種+解放）, ショップ, フェード, フロア管理, スプライト |
| nodemap.js | 14.1 KB | 2段ミニツリーノードマップ, 8イベント, ノード実行 |
| ui.js | 19.4 KB | HUD, 祝福選択画面, ショップ画面, インベントリ, ダイアログ |
| ui_screens.js | 8.1 KB | タイトル, プロローグ, エンディング(3種), 花壇画面 |
| update.js | 18.2 KB | ゲームループ, 入力処理, 戦闘, 敵AI, 状態遷移 |
| render.js | 20.1 KB | 描画メイン, 敵形状, スプライト, エフェクト, ボス描画 |

#### Sprint A-1: 祝福システム拡張 ✅
- 78種の祝福（6ファミリー × 13種）
  - 🌹 ローザ（攻撃特化）
  - 🤍 リリア（防御特化）
  - 🌻 ソーレ（速度・機動力）
  - 💜 フジカ（範囲・毒）
  - 🌸 ハスミ（回復・生存）
  - ✨ キクネ（収集・磁力）
- 15種のデュオ祝福（ファミリー組合せボーナス）
- レアリティ: Common 48 / Rare 24 / Legend 6

#### Sprint B: ツリー型ノードマップ ✅
- 2段×3列のミニツリー構造
- 上段選択 → 接続線で繋がった下段ノードを選択
- ノードタイプ: バトル, エリート, ショップ, 休憩, イベント
- エリートクリア時はレア以上の祝福確定
- バトルノードは実際に次フロア戦闘を開始
- ショップ終了後は祝福なしで次フロアへ
- 8種のランダムイベント

#### Sprint C: 花壇拡張・NPC・エンディング ✅
- 花壇6種（HP, ATK, 速度, ダッシュCD, 磁力, ネクター倍率）
- クリア回数による段階解放システム
  - 1回クリア: 疾風の花壇
  - 2回クリア: 閃光の花壇
  - 3回クリア: 収穫の花壇
  - 5回クリア: 蜜の花壇
- NPC「フローラ」（花壇画面に常駐、状況に応じた10種のセリフ）
- 3種エンディング分岐
  - ノーマル: フロア15クリア
  - グッド: 祝福8個以上でクリア
  - トゥルー: 祝福12個以上 & デュオ3個以上でクリア

#### UI修正 ✅
- フォントレンダリング改善（image-rendering:pixelated 除去）
- HUD テキスト重なり・切れ修正（フロア表示, 武器名/ATK, ヘルプテキスト）
- スプライト描画時のみ imageSmoothingEnabled=false

### 未実装（次期スプリント）

#### Sprint D-1: SE システム
- Web Audio API ベースの SE 生成（13種実装済み in game.js Audio オブジェクト）
- BGM は外部 mp3 ファイル（assets/music/）

#### Sprint D-2: 敵AI強化
- 複合パターン, 旋回型パターン追加
- ボスフェーズ遷移の明確化

#### Sprint E: ビジュアルポリッシュ
- テーマ別背景パーティクル
- 祝福選択カード登場アニメ
- HP 減少ハートバウンス
- テレグラフ表示改善

## 技術仕様
- **言語**: Pure JavaScript (ES6+)
- **描画**: Canvas 2D (HiDPI対応)
- **音声**: Web Audio API (チップチューン SE)
- **フォント**: M PLUS Rounded 1c (Google Fonts)
- **解像度**: 1280×960 (64px タイル)
- **保存**: localStorage (メタ進行・武器コレクション)

## オーディオファイル（ローカル配置用・リポジトリ非含）

### BGM (\ssets/music/\)
village.mp3, nest.mp3, forest_north.mp3, flower_field.mp3, title.mp3, end_b.mp3, forest_south.mp3, boss.mp3, end_c.mp3, cave.mp3, nest_boss.mp3, shop.mp3

### SE (\ssets/se/\)
menu_select.mp3, enemy_die.mp3, attack.mp3, boss_appear.mp3, save.mp3, level_up.mp3, door_open.mp3, needle.mp3, player_hurt.mp3, hit.mp3, item_get.mp3, menu_move.mp3, dialog_close.mp3, game_over.mp3, dialog_open.mp3

## コミット履歴 (v2 branch)
- v6.10.2: HUD テキスト重なり/切れ修正
- v6.10.1: フォントレンダリング改善
- v6.10.0: Sprint C — 花壇6種, NPC フローラ, 3種エンディング
- v6.9.2: ノードフロー修正（battle→実戦闘, shop→祝福なし, elite→レア確定）
- v6.9.1: nodeSelect ハンドラ修正
- v6.9.0: Sprint B — 2段ミニツリーノードマップ
- v6.8.0: Sprint A-0/A-1 — 10ファイル分割 + 78祝福 + 15デュオ