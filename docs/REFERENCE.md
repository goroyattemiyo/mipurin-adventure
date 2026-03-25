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
- 理由: ライブラリは既存コードへの影響が大きい