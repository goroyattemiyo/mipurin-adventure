# CHANGELOG Draft (auto-generated)
# Review and merge into docs/CHANGELOG.md

## v6.24
### Features
- mobile-first UI toggle, PWA manifest, gray text fix v6.24

## v6.23.1
### Fixes
- add rarity.js+charms.js to index.html, update RULES/STATUS, remove .bak files v6.23.1

## v6.23
### Fixes
- original enemy names, weapon ???, collection scroll, test limit 35KB v6.23
### Documentation
- add RULES.md, DECISIONS.md, BACKLOG.md v6.23

## v6.22
### Features
- enemy variant names (12x4) + weapon rarity sprite tint v6.22
- enemy variant names (12x4) + weapon rarity sprite tint v6.22

## v6.21.1
### Fixes
- collection tab uses webp sprites via drawSpriteImg + hue-rotate for loop variants, brightness(0) silhouettes v6.21.1

## v6.21
### Features
- Pokemon GO style collection - loop-variant entries, hue-shifted sprites, loop badges, completion tracking v6.21

## v6.20.2
### Fixes
- drawEnemyShape signature is (entity,color) not (ctx,x,y,...) - use fakeE object v6.20.2

## v6.20.1
### Fixes
- drawCollectionTab - ENEMY_DEFS is object not array, use Object.values + drawEnemyShape fallback v6.20.1

## v6.20.0a
### Fixes
- Phase 0+1 hotfix - rarity.js split, equip rarity colors, data.js under 30KB v6.20.0a

## v6.20.0
### Features
- Phase 0+1 - collection sprites, color variants, rarity system v6.20.0 - systems.js: Tier2 weapon sprite aliases in SPRITE_MAP - render.js: hue-rotate filter for loop color variants (enemies+boss) - render.js: rarity light pillar effect on weapon drop - data.js: RARITY_DEFS (5 tiers: normal/fine/great/miracle/legend) + rollRarity() - ui.js: drawCollectionTab with 48px enemy sprites, completion bar, silhouettes, loop color preview - equip_ui.js: rarity color in weapon names (list + slots) - combat.js: rollRarity on enemy weapon drops - update.js: rarity assignment on weapon pickup - systems.js: rarity roll in shop weapon purchase
### Other
- debug: add debugFillCollection() - fills enemy/weapon/charm collections for testing

## v6.20
### Fixes
- drawCollectionTab sprites+completion+silhouette+colorvar v6.20

## v6.19.1
### Fixes
- P0-P3 operation hint corrections v6.19.1 - ui.js: footer TAB close -> ESC close - ui.js: drawCollectionTab now has sub-tab UI (いきもの/ぶき) with drawWeaponCollection - ui.js: HUD help shows WASD/矢印 - equip_ui.js: all hints Tab:とじる -> Esc:とじる - equip_ui.js: list mode hint shows Z:強化/しんか - render.js: weapon drop adds C:バックパック hint - 9 verification checks passed

## v6.19.0
### Features
- Sprint H-3 weapon collection encyclopedia v6.19.0 - ui.js: collectionSubTab (enemies/weapons) with left/right switch - ui.js: drawWeaponCollection() - completion bar, 12 weapon cards - ui.js: owned=color+sprite+stats, unknown=silhouette+'???' - ui.js: tier badge (T1=copper border, T2=gold border) - update.js: arrow key sub-tab switch in collection tab
- Sprint H-2 weapon evolution tree v6.19.0 - data.js: EVOLUTION_MAP (6 Tier1->Tier2 paths), evolveWeapon(), canEvolve() - data.js: WEAPON_UPGRADE_COST_T2 [30,60,100], getUpgradeCost() tier-aware - data.js: upgradeWeapon patched for tier-aware cost - equip_ui.js: evolution button in list pane (purple, shows cost) - equip_ui.js: T2 MAX display for fully evolved weapons - update.js: Z key in list mode triggers evolution when Lv3+eligible - Evolution: Tier1 Lv3 + flower cost -> Tier2 Lv0 (re-upgradeable)
- Sprint H-1c charm slot active in equip UI v6.19.0 - equip_ui.js: charm slot shows equipped charm (icon+name+rarity+desc) - equip_ui.js: empty charm shows 'チャーム (未装備)' - equip_ui.js: getSlotWeapon returns player.charm for slot 2 - equip_ui.js: hint text changes for charm slot (no list/upgrade) - update.js: right-arrow blocked when charm selected (no weapon list) - update.js: Z upgrade blocked when charm selected
- Sprint H-1b charm drop + pickup screen v6.19.0 - charms.js: charmPopup state, tryCharmDrop(floor) with rarity-weighted chance - update.js: charmDrop gameState handler (Z=equip, X=skip) - update.js: tryCharmDrop hook after blessing choice - equip_ui.js: drawCharmDrop() purple card with icon/name/rarity/desc - render.js: drawCharmDrop call in render loop - Drop chance: 5% base, 8% floor9+, 12% floor12+
- Sprint H-1a charm system foundation v6.19.0 - NEW js/charms.js: CHARM_DEFS (9 charms: 4 common, 3 rare, 2 legend) - applyCharm() called at run start via resetGame - rollCharmDrop(floor) weighted rarity drop - charmCollection persistent Set (localStorage) - player.charm slot added to data.js - systems.js: charm reset + apply in resetGame - index.html: charms.js loaded before equip_ui.js - test_game.py: charm file + function checks added - cache bust v=1627, VERSION v6.19.0
### Fixes
- test_game.py - replace broken multiline regex with simple string check
- update test_game.py Tab check for new if/else structure
### Documentation
- STATUS.md + ROADMAP.md update for Sprint H completion v6.19.0 - Sprint H (H-1 charm, H-2 evolution, H-3 encyclopedia) marked DONE - Module sizes updated (15 files, all <30KB) - Self-assessment: 85.3 (Quality 80, Progress 88, Method 92) - Next: Sprint I (2nd loop content, SE, Tier2 sprites)
- RULES.md ルール13追加（会話圧縮時の再読み込み義務）

## v6.18.0b
### Fixes
- unified Tab logic - single wasPressed, Escape close, no forced tab=2, equipMode reset v6.18.0b

## v6.18.0
### Features
- 2-pane equipment UI v6.18.0 - LEFT pane: character + 3 equip slots (main/sub/charm) - RIGHT pane: scrollable owned weapon list with sprites - slot mode: up/down select slot, right arrow to list - list mode: up/down browse, Z upgrade, X equip to slot - D&D completely removed (equip_ui, update, touch) - touch.js: tap slot or list row to navigate - rounded rect slots, badge labels, inline stats - cache bust v=1626
### Fixes
- tab switch by Tab key only + hide PC controls on mobile - inventory tab switching: ArrowLeft/Right removed, Tab key cycles tabs - prevents accidental tab change while navigating equip slots - title screen: PC controls hidden on mobile, shows 'tap to start' instead - ui.js hint text updated to reflect Tab-only switching
- equip slots use sprite images instead of emoji - drawSlotIcon uses hasSprite/drawSpriteImg for weapon_<id> sprites - backpack slots also use sprite images - emoji fallback extracted from weapon name if sprite missing - Tier 2 weapons gracefully fall back to emoji (no sprites yet) - active weapon indicator improved (dot with highlight)
### Documentation
- STATUS.md + ROADMAP.md update v6.18.0 - Added Python auto test methodology to STATUS.md - Sprint G marked DONE, Sprint H NEXT - Module size table updated (all <30KB) - Self-assessment scores updated (total 80.2) - ROADMAP: added test_game.py workflow note - Development methodology: test before every commit

## v6.17.0a
### Fixes
- equip UI icon-only slots v6.17.0a - slots show icon only (28px), no text/name/ATK - detail panel (400x150) bottom-center shows all info on selection - rounded corners on detail panel and upgrade button - label above slot (small, translucent) - backpack slots icon-only with flower placeholder - active weapon dot indicator

## v6.17.0
### Features
- equip UI center layout v6.17.0 - equip_ui.js: character center (mipSize responsive, max 250px) - body-part slots: main=left hand, sub=lower-left, charm=right, backpack=below-right - radial glow behind character - connectors from body to each slot - detail panel bottom-center (380x140) - upgrade button centered (180x30) - touch.js: hitTestUpgradeBtn aligned to new layout - game.js: VERSION v6.17.0 - cache bust v=1625

## v6.16.4
### Features
- Mobile UX overhaul v6.16.4 (Commit 4/4) - touch.js: 全面リファクタ, オーバーライドチェーン廃止 - コンテキスト適応型ボタン (gameState別表示切替) - ボタン: Z:r60 X:r50 1/2/3:r36 Q:r36 Tab/Esc:r32 - knobRadius:42, hit-test +18 - SE毒抜き: sawtooth完全除去 - fullscreen + dvh + PWA meta - CHANGELOG/VERSION更新, cache bust v=1624
### Fixes
- ボタンサイズ拡大+knob拡大+残sawtooth修正 (Commit 3/4) - Z:r60, X:r50, 1/2/3:r36, Q:r36, Tab/Esc:r32 (48dp基準達成) - joystick knobRadius:30→42 - hit-test margin:+12→+18 - ボタン配置再調整(重なり解消) - boss_appear末尾sawtooth→triangle (sawtooth完全除去)
- SE毒抜きパッチ - 不快音4箇所修正 (Commit 2/4) - player_hurt: sawtooth→triangle, 90Hz→300Hz (柔らかい痛み音) - boss_appear: sawtooth→triangle, 不協和音→協和音 (迫力維持+不快感除去) - game_over: sawtooth→sine, 周波数上昇 (悲しいけど耳障りでない) - attack: sawtooth→triangle, 160Hz→400Hz (軽い振り音) - 本格SE再設計はSprint Iに計上
- mobile fullscreen + CSS dvh + portrait overlay (Commit 1/4) - index.html: 100dvh, viewport-fit=cover, PWA meta tags - CSS portrait overlay with rotation prompt - @supports fallback for browsers without dvh - touch.js: requestFullscreen on first touch - screen.orientation.lock('landscape') attempt - AudioContext resume after fullscreen transition - cache bust v=1623

## v6.16.3a
### Features
- Phase 3 mobile tap equip + currentBGM fix v6.16.3a - bgm.js: let currentBGM復活, playBGM/stopBGM/fadeOutBGMで同期 - touch.js: スロットタップ選択, タブタップ, 強化タップ, D&D - cache bust v=1622, 全14ファイル構文OK, 全30KB以下 - Sprint G Phase 3 完了

## v6.16.3
### Refactoring
- ファイル分割 v6.16.3 (30KB上限遵守) - update.js→update.js(15.6KB)+combat.js(16.7KB): 戦闘ロジック分離 - ui.js→ui.js(20.1KB)+equip_ui.js(10.8KB): 装備タブUI分離 - index.html: combat.js/equip_ui.js追加, cache bust v=1621 - 全14ファイル構文OK, 全30KB以下 - MD更新(CHANGELOG/STATUS)

## v6.16.2
### Features
- Hybrid BGM + bpX fix v6.16.2 - bgm.js: MP3優先+WebAudioチップチューン切替 (PD曲3曲) - data.js: 旧BGM関数削除(-2.4KB) - game.js: setBgmVol→ChipBGM連携, VERSION v6.16.2 - ui.js: bpBaseX定義順修正(ReferenceError解消) - index.html: bgm.js追加, cache bust v=1620 - MD全更新(CHANGELOG/STATUS/ROADMAP) - 全12ファイル構文OK, V1-V11 PASS - 技術的負債: ui.js/update.js 30KB超→次Sprint分割
### Fixes
- 装備画面レイアウト修正 + Tabデフォルト装備タブ - ui.js: ミプリン左配置, スロット右縦並び, BP右2x2, 詳細下部 - update.js: Tab開閉時 inventoryTab=2 - cache bust v=1613 - CHANGELOG更新
- drawEquipTab panelX未定義エラー修正 - drawEquipTab呼び出しに固定座標(80,110,CW-160,CH-160)を渡す - タブ分岐をif/else if/else ifに修正 - cache bust v=1612

## v6.16.1
### Features
- Sprint G Phase 2 - Mouse D&D v6.16.1 - 装備タブでマウスドラッグ&ドロップ実装 - ドラッグ描画: 元スロット暗転+ドロップ先緑ハイライト+武器名追従 - Bug予防7件: canvas外mouseup, 空掴み防止, 同一スロップスキップ,   武器0本防止, close/tab切替時リセット, タッチ競合回避 - game.js: window mouseup+mouseleave - ui.js: equipSlotRects+ドラッグ描画 - update.js: D&Dロジック(hitTest+swap+guard) - MD全更新, VERSION v6.16.1, cache v=1611

## v6.16.0b
### Refactoring
- patch_workflow v3 - コミット前MD更新必須ルール追加 - patch_workflow.md: Section 5追加(コミット前にREADME/ROADMAP/STATUS/CHANGELOG必須) - CHANGELOG.md: v6.16.0b エントリ追加

## v6.16.0
### Features
- Sprint G Phase 1 完成 - RPG装備画面 v6.16.0 - 装備タブ: ミプリン立ち絵(ふわふわアニメ)+六角形スロット+ツタ風コネクタ - 花びらパーティクル+キラキラ星+グラデーション背景 - メイン/サブ武器スロット+バックパック4枠+お守り枠(将来用???) - 武器強化Lv0-3(花粉消費)+詳細パネル+強化ボタン - バグ予防: initWeapon全箇所適用, 武器0本防止ガード, ctx.save/restore - 3タブ切替(持ち物/図鑑/装備), カーソル6スロット巡回+バウンスアニメ - cache bust v=1610
- Sprint G Phase 1 - 装備システム基盤 v6.16.0 - game.js: マウス状態(mouse) + mousedown/move/upハンドラ - data.js: WEAPON_UPGRADE_COST/MAX, initWeapon(), upgradeWeapon(), player.backpack[4] - systems.js: resetGameでbackpackリセット + initWeaponラップ - ui.js: 装備タブ(drawEquipTab) - スロット2/バックパック4/詳細/強化 - update.js: 3タブ切替, 装備操作(↑↓Z:強化 X:入替), KeyC→バックパック - render.js: weaponDropにC:バックパック追加 - MD全更新(README/ROADMAP/STATUS/CHANGELOG) - 全構文OK, グローバル重複0, V1-V11全PASS
### Fixes
- cache bust v=1351 -> v=1600

## v6.15.1
### Fixes
- runNectar/loopCount重複宣言解消 - systems.jsに統合, check_globals.js追加, VARIABLE_MAP.md追加 - game.js: let loopCount=0,runNectar=0 削除 - systems.js: let runNectar=0,loopCount=0 に統合 - tools/check_globals.js: グローバル変数重複検出ツール新規 - VARIABLE_MAP.md: 変数所有権ルール文書新規
### Refactoring
- 開発基盤強化 v6.15.1 - check_globals v2(偽陽性0), check_concat, patch_workflow, 全MD更新 - tools/check_globals.js v2: スコープ解析で偽陽性46→0 - tools/check_concat.js: 11ファイル連結構文チェック - tools/patch_workflow.md: パッチ適用手順書 - README/ROADMAP/STATUS/CHANGELOG 全更新 - 開発方法スコア 61→推定75 (ツール+プロセス強化)

## v6.15.0
### Features
- 周回システム+runNectar修正+花粉リロール+エンディングUI分離+敵色違い - loopCount追加: エンディングでXキーで2周目開始（武器/祝福引継ぎ） - 敵/ボスHP×(1+loop×0.5), ATK×(1+loop×0.3), 色相シフト - runNectarバグ修正: 花粉拾得/ボス撃破/フロアクリアで加算 - 祝福リロール: Xキー+花粉15で選び直し - エンディング画面: 画像左/テキスト右パネル分離、重なり解消 - render.jsコメント削減(30KB以下)
- Sprint F Phase 1 - モバイルタッチ操作追加 (touch.js新規, 仮想ジョイスティック+ボタン, keys[]注入, マルチタッチ対応, update.js変更なし)
### Documentation
- v6.15.0 全mdファイル更新 - 周回/リロール/モバイル/ネクター修正反映

## v6.14.1
### Fixes
- ボスシルエット非ボスダイアログ誤表示修正 + STATUS.md/CHANGELOG.md更新
- タイトル画面整理 - 情報パネルにまとめ、色改善、blink内ネスト修正
- ゲームオーバー画面レイアウト修正 - テキスト上部パネル/画像下部に分離、重なり解消
- cache-buster v1351
- game.js重複let宣言削除(blessingAnimTimer/hpBounceTimer/floorClearAnimTimer) - data.js側が正
### Documentation
- 全mdファイル統合再構成 - README(v6.14.1+武器表+Synapse連携), ROADMAP(Sprint F/G/H+スコアリング), STATUS, CHANGELOG更新
### Other
- v6.14.1: 18件バグ修正+品質改善 - camX/camY除去, BGM競合修正, idleTimer位置修正, stopBGMフェード統一, dashCooldown初期値修正, タイトルUI構造修正, 吹き出しクランプ, 被ダメ/回復/復帰/クリア吹き出し追加, パーティクル最適化

## v6.14.0
### Fixes
- data.js showBubble/updateBubbles 重複定義を修正
### Documentation
- Sprint G-B0 完了 - STATUS.md/CHANGELOG.md 更新
### Other
- v6.14.0: Sprint G-B BGM演出強化 - フェードイン/アウト, ボス前無音, ボス第2フェーズBGM, ショップ/ガーデンBGM切替, 音量調整UI

## v6.12.4
### Other
- v6.12.4: ボスカットイン演出 + フローラ拡大 + ボス spawn修正 + ボスドロップ自動回収 + シルエット活用拡張

## v6.12.3
### Other
- v6.12.3: 画面品質一括修正 (rembg2枚, タイトル背景修正, 死亡画面テキスト, 遷移ガード, ボス2倍化, squash強化, フローラ配置, ボスシルエット全画面演出)

## v6.12.2
### Fixes
- v6.12.2-fix: drawTitleのendType未定義エラー修正
### Other
- v6.12.2-fix5: VERSION重複行削除
- v6.12.2-fix4: VERSION定数をコメント外に移動
- v6.12.2-fix3: cache-buster v1220
- v6.12.2-fix2: VERSION定数修正, drawEnding endType重複削除, bossLines重複削除
- v6.12.2: 強化武器6種+固有効果 (衝撃波/蜜だまり/パリィ/毒DoT/ホーミング/megaAOE) + フロア制限ショップ

## v6.12.1
### Other
- v6.12.1: STATUS.md更新 (v6.12.1対応, Sprint F/G-A実績, スコア65/100, 次Sprint計画)
- v6.12.1: Sprint G-A ストーリー全面改修 (プロローグ10P, ボス入場/撃破ダイアログ, フローラNPC, エンディング, 敵lore, 蜂蜜クリスタル設定)

## v6.12.0
### Other
- v6.12.0: Sprint F Phase C - 11画像統合 (タイトル背景, 死亡画面, エンディング3種, フローラ, 店主, ボスシルエット4種)

## v6.11.6
### Other
- v6.11.6: webp_update)
- v6.11.6: 8-dir attack + weapon-specific VFX (360 ring, AOE shockwave, double slash)
- v6.11.6: 8-dir attack + weapon-specific VFX (360 ring, AOE shockwave, double slash)

## v6.11.5
### Other
- v6.11.5: Sprint F Phase B - cuteness polish (pof effect, drop sparkle, title petals, boss entrance, wave msg)

## v6.11.4
### Other
- v6.11.4: Sprint F Phase A - bug fixes (cache v1100, VERSION const, death screen, sel var) + IMAGE-PROMPTS.md

## v6.11.3
### Documentation
- STATUS.md Sprint E complete (v6.11.3, score 61/100)
- STATUS.md Sprint E complete (v6.11.3, score 61/100)
### Other
- v6.11.3: Sprint E Step 3 - blessing card slide-in anim, HP heart bounce, floor clear scale+particles

## v6.11.2
### Other
- v6.11.2: Sprint E Step 2 - shoot/teleport telegraph, hit-stop tuning (boss 0.09s hit, 0.15s kill)

## v6.11.1
### Other
- v6.11.1: Sprint E Step 1 - bg particles (theme), dash ghost trail (3-frame), blessing burst, boss kill mega-shake

## v6.11.0
### Documentation
- STATUS.md update - repo structure (10 files), dev rules (file limits, workflow rules, phase transition protocol)
### Other
- v6.11.0: Sprint E Step 0 - fix dialog persist bug, HUD overlap, blessing desc wrap, blessing list overflow, ESC dialog close

## v6.10.3b
### Other
- v6.10.3b: update version display to v6.10 (title screen, header, page title)

## v6.10.3
### Documentation
- update README with full Sprint A-C progress, file map, and feature list
### Other
- v6.10.3: audio improvements - master volume, noise burst on hit, attack swing SE, BGM onerror fallback, redirect hurt/kill

## v6.10.2
### Other
- v6.10.2: fix HUD text overlap/clipping - floor title, weapon/ATK, score, help text repositioned

## v6.10.1
### Other
- v6.10.1: fix font rendering - remove image-rendering:pixelated, use imageSmoothingEnabled for sprites only

## v6.10.0
### Other
- v6.10.0: Sprint C - garden 6 types with unlock system, NPC Flora, 3 endings (normal/good/true), clear counter

## v6.9.2
### Other
- v6.9.2: fix node flow - battle/elite trigger real combat, shop no longer grants blessings, elite flag for rare+ blessing on floor clear

## v6.9.1
### Other
- v6.9.1: fix nodeSelect handler - replace old nodeCursor/nodeChoices with updateNodeSelect()/drawNodeMap()

## v6.9.0
### Other
- v6.9.0: Sprint B - 2-tier mini-tree node map, 8 events, elite rare+ blessings, connection lines

## v6.8.0
### Other
- v6.8.0: Sprint A-0/A-1 - 10 file split + 78 blessings + 15 duos

## v6.5.4
### Other
- v6.5.4: fix ui.js - remove duplicate drawText, fix brace balance, heart row wrap

## v6.5.3
### Other
- v6.5.3: fix load order - ui.js before game.js (definitions before loop)

## v6.5.2
### Other
- v6.5.2: fix script load order - game.js then ui.js

## v6.5.1
### Other
- v6.5.1: extract UI drawing to ui.js (462 lines) - drawHUD/Shop/Blessing/Inventory/Title/etc

## v6.5.0
### Other
- v6.5.0: UI text system - UI_TEXT_STYLE/drawText, inventory layout fix, blessing/weapon spacing

## v6.4.6
### Other
- v6.4.6: shop UI polish - name truncate, short warning, guide/desc Y fix

## v6.4.5
### Other
- v6.4.5: shop card fix - 240x200 cards, font hierarchy, desc on select only

## v6.4.4
### Other
- v6.4.4: shop card layout overhaul - larger cards, layered info (desc on select only)

## v6.4.3
### Other
- v6.4.3: apply atkRangeBonus 100% to 360 whip hitbox

## v6.4.2
### Other
- v6.4.2: fix range UI to include bonus, fix heart overlap with spacing+row wrap

## v6.4.1
### Other
- v6.4.1: HiDPI support - scale canvas by devicePixelRatio for crisp text rendering

## v6.4.0
### Other
- v6.4.0: fix canvas font - quote 'M PLUS Rounded 1c' in all 101 ctx.font declarations

## v6.3.9
### Other
- v6.3.9: CSS fix - maximize canvas display with 4:3 ratio using min()

## v6.3.8
### Other
- v6.3.8: title screen layout fix - 120px title, enlarged mipurin, repositioned all text

## v6.3.7
### Other
- v6.3.7: font hierarchy overhaul - 5-layer system (A:heading B:select C:HUD D:float E:text)

## v6.3.6
### Other
- v6.3.6: title screen overhaul - title 140px, mipurin 300px, all text enlarged

## v6.3.5
### Other
- v6.3.5: enlarge title screen fonts - title 96px, start 48px, info 28px

## v6.3.4
### Other
- v6.3.4: responsive canvas - fill screen while maintaining 4:3 aspect ratio

## v6.3.3
### Documentation
- copy COUNCIL-SESSION-001 from main to v2
- add COUNCIL-SESSION-002 - balance design discussion log
### Other
- v6.3.3: font size overhaul - minimum 18px, all text readable on 1280x960

## v5.9.2
### Other
- v5.9.2: sprite engine - individual PNG, code animation (bob/squash), bg removal tools, batch processor

## v5.9.1
### Other
- v5.9.1: HUD overlap fix, STATUS-v5.0.md full update (v5.3.0-v5.9.1 changelog, sprint status, score 56/100, remaining tasks)

## v5.9.0
### Other
- v5.9.0: sprite engine - sheet loader, drawEntity/drawBoss/drawDrops sprite support, canvas fallback

## v5.8.2
### Other
- v5.8.2: fix dialog state handler missing in update() - Z key now advances dialog

## v5.8.1
### Other
- v5.8.1: fix message draw order - move drawFloatMessages/drawDialogWindow after fade overlay

## v5.8.0
### Other
- v5.8.0: unified message system - float/dialog types, boss entrance dialog, floor/spike/duo/blessing messages, theme names

## v5.7.2
### Other
- v5.7.2: UX overhaul - shop X exit, context-sensitive controls, item slot labels, tutorial messages, visible feedback

## v5.7.1
### Other
- v5.7.1: shop UI redesign - 2-row grid, Japanese text, WASD navigation, weapon collection on purchase

## v5.7.0
### Documentation
- Sprint 5.5 design - equipment, consumables, weapon collection (4 experts reviewed)
### Other
- v5.7.0: Sprint 5.5 - weapon inventory (2 slots), consumables (3 items), weapon collection, atkSpeed fix

## v5.6.1
### Other
- v5.6.1: fix deadTimer not defined

## v5.6.0
### Other
- v5.6.0: Sprint 5 - nectar currency, garden upgrades (HP/ATK), localStorage save, death/ending nectar display

## v5.5.2
### Other
- v5.5.2: attack effect visibility - dark outline, white flash, brighter arcs

## v5.5.1
### Other
- v5.5.1: game over screen - 2s guard, stats display, all death paths SE/BGM, mipurin image

## v5.5.0
### Other
- v5.5.0: Sprint 3 - 24 blessings, 6 duo synergies, ending screen (F15), rarity fix

## v5.4.3
### Other
- v5.4.3: replace yellow attack rect with slash arc effect

## v5.4.2
### Other
- v5.4.2: hotfix - remove yellow bg behind mipurin, weapon range+12, knockback 32px, needle dur fix

## v5.4.1
### Other
- v5.4.1: Sprint 2 complete - 5 room templates, flood-fill, spike floor, theme mapping

## v5.4.0
### Documentation
- Sprint 1 complete checkmarks
- 開発ルール追記 - 忖度禁止、対等議論、品質妥協禁止、根拠ベース意思決定、スコープ厳守
### Other
- v5.4.0: Sprint 2 - 5 room templates (theme-mapped), flood-fill, spike floor (F4+)

## v5.3.0
### Other
- v5.3.0: Sprint 1 - hit stop, knockback, SE mp3, particle boost

## v5.2.1
### Other
- v5.2.1: world building fix - GDD weapons, JP enemies+lore, flower blessings, enhanced collection

## v5.2.0
### Other
- v5.2.0: world building - GDD weapons, JP enemy names+lore, flower spirit blessings, enhanced collection

## v5.1.0
### Other
- v5.1.0: TAB inventory/collection screen, enemy tracking, remove debug logs

## v5.0.6
### Other
- v5.0.6: debug logs for drop and dash

## v5.0.5
### Other
- v5.0.5: cache buster for game.js and style.css
- v5.0.5: fix prologue not visible - add return after drawPrologue

## v5.0.4
### Other
- v5.0.4: fix prologue skipping due to Z key carry-over

## v5.0.3
### Other
- v5.0.3: fix consumables undefined crash, JP blessing text

## v5.0.2
### Other
- v5.0.2: fix title->prologue transition

## v5.0.1
### Other
- v5.0.1: fix F12, mipurin sprite in drawEntity, title->prologue flow

## v4.2
### Other
- v4.2: use mipurin.png 4-direction sprite instead of old sprite sheet

## v4.1
### Other
- v4.1: sprite animation system, screen 1280x960, enemy size up, all fixes

## v3.3
### Other
- v3.3: scale enemies 2x, enlarge HUD (hearts, fonts, consumables, hints)

## v3.2.2
### Other
- v3.2.2: enlarge player sprite to 96px

## v3.2.1
### Fixes
- CSS canvas size to 1280x960
### Other
- v3.2.1: match v1 sprite size - player 64px, enemy 52px, full tile draw

## v3.2
### Other
- v3.2: screen size 1280x960, tile 64px, larger sprites matching v1 scale

## v3.1.1
### Other
- v3.1.1: regenerate map each wave for variety

## v3.1
### Fixes
- swap left/right sprite frames
### Other
- v3.1: arena map patterns (open/cross/lwall/pillar/scatter) + seeded random

## v3.0
### Other
- v3.0: weapons, accessories, consumables, collection encyclopedia, prologue system, BGM loader

## v2.5
### Features
- enemy silhouettes, weapon FX, cursor UI, blessing rarity, magnet
### Fixes
- wall clipping, teleport safety, projectile glow/cap, audio init, direction indicator, log scaling, spawn safety
### Other
- v2.5: cute edition - sprite integration, kawaii enemies, poyon hitstop, pastel themes, synergy blessings

## v2.3
### Fixes
- spriteProcessor v2.3 - JSZipに切替（ZIP破損修正）

## v2.2
### Features
- spriteProcessor v2.2 - アニメーション定義UI改善（プリセット/サムネ番号/クリック選択/個別再生）
### Other
- 機能追加
- 変更
- 修正
- SE追加
- BGM
- 変更
- 変更
- 変更
- 修正
- 変更
- Merge pull request #7 from goroyattemiyo/codex/add-integration-tests-and-fix-bugs-pefwtx
- Merge branch 'main' into codex/add-integration-tests-and-fix-bugs-pefwtx

## v0.3.0
### Other
- v0.3.0: 全バグ修正（マップ重複・壁スナップ・ショップUI・ポーレンドロップ・図鑑登録 他）
- Merge pull request #6 from goroyattemiyo/codex/add-integration-tests-and-fix-bugs-1bc2o8
- Merge branch 'main' into codex/add-integration-tests-and-fix-bugs-1bc2o8
- Fix wall-edge disappearance and improve debug version overlay
- Merge branch 'main' of https://github.com/goroyattemiyo/mipurin-adventure
- ver表記
- Merge pull request #5 from goroyattemiyo/codex/add-integration-tests-and-fix-bugs-z6lnb1
- Merge branch 'main' into codex/add-integration-tests-and-fix-bugs-z6lnb1
- Fix smoke test global object checks
- Merge branch 'main' of https://github.com/goroyattemiyo/mipurin-adventure
- 音声ON
- Merge pull request #4 from goroyattemiyo/codex/add-integration-tests-and-fix-bugs-oy4tjt
- Merge branch 'main' into codex/add-integration-tests-and-fix-bugs-oy4tjt
- Fix 5 bugs: shop UI, dialog overflow, wall snap, shadow_bee, invincibility
- 配置変更
- Merge branch 'main' of https://github.com/goroyattemiyo/mipurin-adventure
- SE
- Merge pull request #2 from goroyattemiyo/codex/add-integration-tests-and-fix-bugs-n5c1da
- Merge branch 'main' into codex/add-integration-tests-and-fix-bugs-n5c1da
- Remove MP3 placeholders and document required audio filenames in README
- 変更
- Merge branch 'main' of https://github.com/goroyattemiyo/mipurin-adventure
- tuiki
- Merge pull request #1 from goroyattemiyo/codex/add-integration-tests-and-fix-bugs
- Revert unrelated gameplay changes to keep README-only update
- 最新化
- M3
- 変更追加
- 変更
- 変更
- 変更
- 変更
- resolve conflict: use local game.js
- 変更
- スライドショー追加
- 変更
- 変更
- 変更
- 変更
- 変更
- Rename config.js to js /config.js
- Rename tileEngine.js to js/tileEngine.js
- Create game.js
- Create engine.js
- Create sprites.js
- Create tileEngine.js
- Create ja.json
- Rename config to config.js
- Create lang.js
- Create config
- Update README.md
- Create index.html
- Initial commit