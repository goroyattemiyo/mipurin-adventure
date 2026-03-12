# ROADMAP.md — ミプリンの冒険

## 開発方針
全機能は Synapse (Orchestrator→Coder→Reviewer) で議論→スコア100点→実装。

---

## Sprint F: スマホ対応 [★★★★★]

### F-1: タッチ入力システム (touch.js 新規)
- 仮想ジョイスティック（左下, 移動→keys[]統合）
- 仮想ボタン（右下, 攻撃Z/ダッシュX/アイテム1-3）
- touchstart/touchmove/touchend ハンドリング
- PC入力との共存（タッチ検出時のみ仮想UI表示）

### F-2: レスポンシブCanvas (game.js修正)
- 画面サイズ自動検出 (現在1280×960固定)
- アスペクト比16:12維持フィッティング
- viewport meta追加, CSS: overflow:hidden, touch-action:none
- resize イベントでCanvas再計算

### F-3: モバイルUI (ui.js/ui_screens.js修正)
- タッチ対応メニュー（祝福選択/ショップ/ノードマップ）
- ボタン最低44×44px
- HUD配置モバイル最適化

### Synapse投入
- Goal: 「1280×960 Canvas 2DゲームにモバイルVジョイスティック+ボタンを追加。既存keys[]に統合。touch.js新規作成」
- 入力: game.js, index.html, ui.js
- 出力: touch.js(新規), game.js修正, index.html修正

---

## Sprint G: 武器装備システム拡張 [★★★★]

### G-1: 武器強化ツリー
- 武器ごとに3-5ノードの強化パス（花粉消費）
- 分岐選択（攻撃力 or 速度 or 特殊効果）
- 現在12武器: needle→golden_needle の進化パスは定義済み
- localStorage保存

### G-2: 武器スロット拡張
- 2枠→3枠（3枠目は花壇解放 or 特定フロア到達）
- サブ武器パッシブ効果

### G-3: 武器合成
- 2武器→新武器（合成レシピ）
- ショップ内に合成UI追加

### G-4: 装備画面UI
- TABインベントリ内に武器比較(差分表示)
- 武器コレクション図鑑拡充

### Synapse投入
- Goal: 「WEAPON_DEFSに強化ツリーを追加、花粉で武器強化するシステム。data.js/systems.js/ui.js修正」
- 入力: data.js(WEAPON_DEFS 12種), systems.js(ショップ), ui.js(インベントリ)
- 出力: data.js修正, systems.js修正, ui.js修正

---

## Sprint H: 残バグ [★★★]
- Q6: 被ダメ吹き出し + voice_hurt (update.js)
- F15: コレクションタブのスクロール (ui.js drawCollectionTab)
- F19: SE/BGM音量の完全分離 (game.js setSeVol/setBgmVol)

---

## スコアリング基準 (Synapse検証用)
| 項目 | 配点 |
|------|------|
| 機能要件充足 | 30点 |
| バグ・クラッシュなし | 25点 |
| UI/UXの品質 | 20点 |
| コード品質 | 15点 |
| パフォーマンス | 10点 |
| **合計** | **100点** |

100点未満 → Synapseで修正ラウンド継続。