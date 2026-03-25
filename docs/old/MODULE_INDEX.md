# MODULE_INDEX — 関数・定義の所在

最終更新: 2026-03-22 (v6.27)

---

## 武器
- WEAPON_DEFS: js/data.js
- EVOLUTION_MAP: js/data.js
- WEAPON_UPGRADE_COST/MAX: js/data.js
- upgradeWeapon(), initWeapon(), evolveWeapon(): js/data.js
- drawWeaponCollection(): js/ui.js
- weaponCollection (Set): js/data.js
- 武器スプライト: SPRITE_MAP 内 js/systems.js

## 敵
- ENEMY_DEFS: js/enemies.js
- ENEMY_VARIANT_NAMES: js/data.js
- spawnWave(), spawnBoss(): js/enemies.js
- updateCombat(): js/combat.js
- drawEnemyShape(): js/render.js
- recordEnemy(): js/data.js

## 祝福
- BLESSING_DEFS: js/blessings.js
- DUO_DEFS: js/blessings.js
- rollBlessings(), applyBlessing(): js/blessings.js
- drawBlessing(): js/ui.js

## メタ進行
- GARDEN_DEFS: js/systems.js
- gardenUpgrades, gardenUnlocks, nectar, totalClears: js/systems.js
- saveMeta(), loadMeta(), applyGardenBonuses(): js/systems.js
- drawGarden(): js/ui_screens.js
- buildShop(): js/systems.js
- drawShop(), pickShopLine(): js/shop_ui.js

## スプライト
- SPRITE_MAP: js/systems.js
- loadAllSprites(), drawSpriteImg(), hasSprite(): js/systems.js
- MIPURIN_FRAMES: js/systems.js
- mipurinImg, floraImg: js/systems.js

## BGM / SE
- TRACKS, playBGM(), stopBGM(): js/bgm.js
- Audio.*(): js/game.js (Web Audio 合成 SE)
- checkHpLowPass(): js/bgm.js

## UI
- drawHUD(), drawInventory(), drawBlessing(): js/ui.js
- drawEquipTab(), getAllOwnedWeapons(): js/equip_ui.js
- drawTitle(), drawGarden(), drawEnding(), drawPrologue(): js/ui_screens.js
- drawShop(): js/shop_ui.js
- drawTouchUI(), onTouchStart(): js/touch.js

## ゲームループ
- update(dt): js/update.js
- draw(): js/render.js
- gameState: js/data.js
- player: js/data.js

## ダンジョン
- generateRoom(), applyTemplate(): js/data.js
- THEMES, getTheme(): js/data.js
- startFloor(), nextFloor(): js/systems.js
- drawNodeMap(): js/nodemap.js

## チャーム
- CHARM_DEFS: js/charms.js
- rollRarity(): js/rarity.js
