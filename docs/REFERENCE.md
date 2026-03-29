# REFERENCE.md — ミプリンの冒険（必要時のみ渡す）
> コード探索・設計判断・計画確認のときだけ CONTEXT.md に追加して渡す

---

## 1. MODULE_INDEX — 関数・定義の所在

### 武器
- WEAPON_DEFS / EVOLUTION_MAP / upgradeWeapon() / evolveWeapon(): `js/data.js`
- drawWeaponCollection(): `js/ui.js`
- 武器スプライト SPRITE_MAP: `js/systems.js`

### 敵
- ENEMY_DEFS / spawnWave() / spawnBoss(): `js/enemies.js`
- ENEMY_VARIANT_NAMES: `js/data.js`
- updateCombat(): `js/combat.js`
- drawEnemyShape(): `js/render.js`

### 祝福
- BLESSING_DEFS / DUO_DEFS / rollBlessings() / applyBlessing(): `js/blessings.js`
- drawBlessing(): `js/ui.js`

### メタ進行
- GARDEN_DEFS / saveMeta() / loadMeta() / applyGardenBonuses(): `js/systems.js`
- drawGarden(): `js/ui_screens.js`
- buildShop() / drawShop(): `js/systems.js` / `js/shop_ui.js`

### スプライト / BGM / UI
- SPRITE_MAP / loadAllSprites(): `js/systems.js`
- TRACKS / playBGM() / stopBGM() / checkHpLowPass(): `js/bgm.js`
- drawHUD() / drawInventory(): `js/ui.js`
- drawTitle() / drawGarden() / drawEnding() / drawPrologue(): `js/ui_screens.js`
- drawTouchUI() / onTouchStart(): `js/touch.js`

### ゲームループ / ダンジョン
- update(dt): `js/update.js` | draw(): `js/render.js`
- gameState / player / WEAPON_DEFS: `js/data.js`
- generateRoom() / applyTemplate() / THEMES: `js/data.js`
- startFloor() / nextFloor(): `js/systems.js`
- drawNodeMap(): `js/nodemap.js`

### チャーム / レアリティ / Lore
- CHARM_DEFS: `js/charms.js`
- rollRarity(): `js/rarity.js`
- WORLD_LORE / isEncyclopediaComplete(): `js/lore.js`

---

## 2. ROADMAP — 残タスクと計画

### 残スプリント

| Sprint | 内容 | スコア影響 |
|--------|------|-----------|
| I-1 | 最終ボス「闇の根」（3フェーズ） | Enemy Design +1 |
| I-2 | 女王帰還イベント + トゥルーエンド完全版 | Story +1 |

完了後スコア見込み: 74.7 → 76.7/100

### Phase 3 以降（BACKLOG扱い）
- Howler.js / Tween.js / SAT.js / rot.js 導入検討
- バランスシミュレーター拡張
- ローカライズ（英語対応）
- Service Worker 完全オフライン対応

### スコア推移
| 日付 | バージョン | スコア |
|------|-----------|--------|
| 2026-02-26 | v5.x | 36/100 |
| 2026-03-08 | v6.6.2 | 61/100 |
| 2026-03-22 | v6.27 | 66.3/100 |
| 2026-03-24 | v6.34 | 74.7/100 |
| 目標 Phase 3 | — | 80/100 |

---

## 3. DECISIONS — 設計判断ログ

（新しい判断を上に追記する）

## D-011: TAB UI要件定義の新設 (2026-03-29)
* 背景: 持ち物 / 図鑑 / 装備タブの改善議論が進み、PC/スマホ分離・非重複・可読性・主人公中心の装備UIなどの設計前提を固定する必要が生じた
* 決定: docs/TAB_UI_REQUIREMENTS.md を新設し、TABメニューUI改修の要件定義を集約。READMEに参照を追加し、以後の実装・議論はこの要件を基準とする
* スコア: -（設計文書追加）

## D-010: UIウィンドウの重なり防止と排他制御 (2026-03-29)
* 背景: ショップや祝福画面などの最中に、キー入力で図鑑や持ち物UIが開き、描画が重なる問題が発生。
* 決定: update.js に canOpenMenu (playing/waveWait時のみ許可) と closeAllUI() を導入し、状態の一元管理と排他制御を実装。同時にEscキー等でのキャンセル操作を統合。
* スコア: 37/40 (UI/UX向上とファイルサイズ削減を両立)


## D-008: test_game.py サイズ閾値更新 (2026-03-28)
* 背景: ファイルサイズ上限緩和(D-008 35KB→50KB)に合わせてテストも更新が必要
* 決定: size < 35KB → size < 50KB、警告閾値 28KB → 40KB に修正
* スコア: -

## D-004 (2026-03-22)
- 背景: Sprint G-C 花壇拡張で4種追加を検討
- 決定: luck+exploreのみ先行（memory/reviveはバランス影響大）
- スコア: 35/40

## D-003: テントウムシ・ショップUI
- 日付: 2026-03-22
- 決定: テントウムシの行商人「テンちゃん」追加（承認待ち）
- 理由: 世界観に合致、セリフで感情移入、商品改善も同時実施
- スコア: 35/40

## D-002: 武器進化DPSダウングレード問題
- 日付: 2026-03-21
- 決定: 記録して次スプリントで対応（v6.29で修正済み）
- 理由: バランス変動は慎重に。当時はツール整備を優先

## D-001: ツール整備の優先順位
- 日付: 2026-03-21
- 決定: Pythonツール先行（ライブラリより先）

---

## 4. Learned Patterns

- **武器進化はDPSダウングレードに注意**: 進化後の武器がDPS低下するケースがある。v6.29で修正済み。進化バランス変更時は必ず事前にDPS比較を行う。
- **memory/reviveは先行実装するとバランス影響大**: D-004の教訓。復活系機能はゲームループ全体の難易度設計が固まってから実装すること。
- **ファイル分割は28KB超えたら早めに検討**: ui.js・data.jsで肥大化を経験。28KB到達時点で分割計画を立て、35KB到達前に実施する。
- **Synapse会議の結果は必ずここ（DECISIONS）に追記していく**: 設計判断の根拠を残すことで、同じ議論の繰り返しを防ぐ。
- **AI役割分担: Opus設計 → Sonnet/Claude Code実装**: 複雑な機能（ボス設計・システム変更等）はOpusで設計・議論を先に固め、その結果をSonnetまたはClaude Codeに渡して実装する。設計なしで実装に入ると手戻りが大きい。
- **ボス画像サイズは512×512px**: 通常敵スプライトは128×128だがボスは512×512で高品質を維持する。process_sprites.pyはデフォルト128×128なのでボス処理時は手動でリサイズサイズを指定すること。
- **キャッシュバスターはリリース時に必ず更新**: index.htmlの`?v=XXXX`を `Get-Date -Format 'MMddHHmm'` で更新しないとブラウザが古いファイルを使い続ける。
- **sw.jsのfetchハンドラはResponse.error()でフォールバック**: `caches.match()`がundefinedを返す場合に備え `r || Response.error()` を必ず付ける。- 理由: ライブラリは既存コードへの影響が大きい


## D-009: タッチUI修正方針 (2026-03-29)
* 問題: キーヒントQ/E/W/SがスマホUIと重なる、ヘルプアイコンのタップ非対応
* 決定:
  - キーヒントはtouchActive===trueで完全非表示（PC専用機能）
  - UIManager.drawHelpIconはmouse.clicked専用のため、touch.jsで_helpKeyを直接トグル
  - カルーセルhitboxを設計書通りCW/2±117, CH/2+20±150に修正
  - サブタブ判定はinventoryTab===1の外（全タブ共通）に配置
* スコア: -（バグ修正のためSynapse Council不要）

## D-008: コレクションUI統一リファクタ (2026-03-28)
* 変更: drawCollectionCarousel/drawCollectionDetail追加、drawWeaponCollection削除
*       collectionCursor/collectionFilter/collectionAnimX をdata.jsに追加
*       collectionSubTab をui.jsからdata.jsに移動
*       update.js カーソル操作・詳細パネル開閉追加
*       touch.js 横スワイプ・中央タップ・フィルタタップ追加
* スコア: 36/40