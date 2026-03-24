# ミプリンの冒険 – AI画像生成プロンプト集

> 生成ツール推奨: Midjourney v6 / DALL-E 3 / Stable Diffusion XL  
> 出力形式: WebP, 品質80, 指定解像度  
> 全画像共通ネガティブ: text, letters, words, writing, watermark, signature

---

## 共通スタイルガイド

- **アートスタイル**: パステル水彩・絵本風、Studio Ghibli inspired
- **色調**: 明るいパステルカラー（ピンク、ミントグリーン、ゴールド、ラベンダー）
- **キャラデザイン統一**: ミプリン = 丸い黄色のミツバチ、大きなキラキラ目、ピンクの頬、小さな羽
- **背景透過が必要な画像**: 白背景で生成後、背景除去ツールで透過処理
- **配置先**: キャラ系 → `assets/sprites/`、背景系 → `assets/`

---

## 優先度早見表（2026-03-24 更新）

| 優先 | グループ | 枚数 | かわいさROI | 状態 |
|------|----------|------|-------------|------|
| 🔴 最高 | A: Tier2武器スプライト | 6枚 | ★★★★★ | ⬜ 未生成 |
| 🔴 最高 | B: 新アイテムアイコン（鍵/巨大はちみつ/爆発樽） | 3枚 | ★★★★★ | ⬜ 未生成 |
| 🟠 高 | C: ノードマップアイコン | 5枚 | ★★★★☆ | ⬜ 未生成 |
| 🟡 中 | D: タイトル背景（改訂版） | 1枚 | ★★★☆☆ | ⬜ 未生成 |
| 🟢 低 | 既存#1〜#8（旧版） | 11枚 | — | ⬜ 未生成 |

> **理由まとめ**: Tier2武器は進化達成感に直結・毎プレイで目にする。新アイテムはcanvas多角形描画を置き換え世界観を統一。ノードマップはプレイ中最も長く見る画面。

---

## グループA: Tier2武器スプライト（6枚・各256×256）

> 配置先: `assets/sprites/weapon_***.webp`  
> 用途: 装備UI・ショップ・コレクション画面  
> 生成後: `js/systems.js` の SPRITE_MAP で alias → 本画像パスに切り替え

### A-1. 蜂の金針 `weapon_golden_needle.webp`

```
A single elegant golden bee stinger weapon icon, long and slender, glowing with warm golden light aura. Tiny honeycomb patterns etched along its length. Small golden sparkle particles and tiny bee wings floating around it. Shiny metallic gold with amber accents. Kawaii chibi item icon style, pastel watercolor illustration, pure white background, slight top-down angle. 256x256. No text, no watermark.
```

### A-2. 蜜の大砲 `weapon_amber_cannon.webp`

```
A tiny adorable amber honey cannon weapon icon. Round barrel shaped like a chubby honey pot with a cute smiling face carved on the side. Thick golden honey dripping from the nozzle tip. A small bow ribbon on the handle. Warm amber, gold and cream colors, honeycomb texture details. Kawaii chibi item icon style, pastel watercolor illustration, pure white background. 256x256. No text, no watermark.
```

### A-3. 聖花の盾 `weapon_holy_shield.webp`

```
A small magical holy flower shield weapon icon. Perfectly round shield decorated with glowing white and rose-pink flower petals arranged in a beautiful mandala pattern. Soft golden holy light radiates from a pearl center gem. Tiny sparkle stars around the edges. Pearl white, rose gold and soft pink colors. Kawaii chibi item icon style, pastel watercolor illustration, pure white background. 256x256. No text, no watermark.
```

### A-4. 呪いの荊 `weapon_cursed_thorn.webp`

```
A cute but slightly mysterious purple thorn whip weapon icon. A twisted purple-black thorned vine coiled elegantly, with small glowing violet flower buds blooming along it. Soft purple mist wisps curl around the tip. Deep purple, lavender and dark green colors with a hint of magic sparkle. Kawaii chibi item icon style, pastel watercolor illustration, pure white background. 256x256. No text, no watermark.
```

### A-5. 翼の嵐 `weapon_storm_wing.webp`

```
A cute magical storm wing weapon icon. A pair of small sky-blue and white feathered wings with tiny golden lightning bolt details on each feather. Soft cyan wind swirl lines and silver sparkles surround the wings. Light blue, white and gold color palette. Kawaii chibi item icon style, pastel watercolor illustration, pure white background. 256x256. No text, no watermark.
```

### A-6. 女王の真杖 `weapon_queen_true_staff.webp`

```
An elegant magical queen's true staff weapon icon. A slender golden staff topped with a large sparkling crystal diamond surrounded by tiny golden crown points and white flower petal decorations. Rainbow prismatic light rays emanate from the crystal gem. Purple, gold and crystal-clear colors with tiny star sparkles. Kawaii chibi item icon style, pastel watercolor illustration, pure white background. 256x256. No text, no watermark.
```

---

## グループB: 新アイテムアイコン（3枚・各128×128）

> 配置先: `assets/sprites/***`  
> 用途: ドロップ拾得・消耗品スロット・ギミックオブジェクト  
> 生成後: `js/systems.js` SPRITE_MAP に `drop_chest_key`, `consumable_giant_honey`, `gimmick_barrel` を追加

### B-1. 古い鍵 `drop_chest_key.webp`

```
A charming old brass skeleton key item icon with a cute round bow end shaped like a tiny honeycomb cell. The key shaft has a small bee silhouette cutout. Warm antique gold and amber colors, soft glowing magical aura around it. Kawaii chibi item icon style, pastel watercolor illustration, pure white background. 128x128. No text, no watermark.
```

### B-2. 巨大化はちみつ `consumable_giant_honey.webp`

```
An oversized adorable honey jar item icon. A chubby round glass jar filled with thick glowing golden honey, with a cute bear face label sticker on the front (no text on label, just the bear face). A small golden crown sits on the lid. Honey drips down the side. Warm amber, cream and gold colors. Kawaii chibi item icon style, pastel watercolor illustration, pure white background. 128x128. No text, no watermark.
```

### B-3. 爆発樽 `gimmick_barrel.webp`

```
A cute small wooden barrel item icon with a chubby round shape and a mischievous winking smiley face carved into the wood. Brown barrel with shiny golden metal bands around it. A tiny lit fuse on the top with a small sparkling orange flame. Slightly cartoon-exaggerated cute proportions. Warm brown, tan and gold colors. Kawaii chibi item icon style, pastel watercolor illustration, pure white background. 128x128. No text, no watermark.
```

---

## グループC: ノードマップアイコン（5枚・各64×64）

> 配置先: `assets/sprites/node_***.webp`  
> 用途: ノードマップ上の各ノード種別アイコン  
> 生成後: `js/nodemap.js` に画像読み込み＋描画処理追加

### C-1. 戦闘ノード `node_battle.webp`

```
A tiny cute crossed swords icon for a game node map. Two small pastel steel-blue swords crossed diagonally with a tiny golden shield in the center. Small white sparkle impacts around the blades. Round chibi style. Steel blue, silver and gold colors. Kawaii icon style, pastel watercolor, pure white background, 64x64. No text, no watermark.
```

### C-2. 宝箱ノード `node_chest.webp`

```
A tiny adorable treasure chest icon for a game node map. A small round-cornered wooden chest slightly open, with golden sparkles and light beaming out from inside. Brown wood texture, gold trim and hinges, a cute small heart-shaped lock. Kawaii chibi icon style, pastel watercolor, pure white background, 64x64. No text, no watermark.
```

### C-3. ショップノード `node_shop.webp`

```
A tiny cute merchant shop stall icon for a game node map. A small red-and-white striped candy-cane awning over a tiny wooden counter with a single golden coin sparkling on it. A tiny ladybug silhouette peeking from behind. Warm red, cream and gold colors. Kawaii chibi icon style, pastel watercolor, pure white background, 64x64. No text, no watermark.
```

### C-4. 休息ノード `node_rest.webp`

```
A tiny peaceful rest spot icon for a game node map. A small pink cherry blossom flower with soft petals, and a tiny white cloud with three small Z letters floating above it (the Z's can be implied as soft puff shapes). Soft pink, white and mint green colors, dreamy peaceful mood. Kawaii chibi icon style, pastel watercolor, pure white background, 64x64. No text, no watermark.
```

### C-5. ボスノード `node_boss.webp`

```
A tiny dramatic boss warning icon for a game node map. A small cute skull with big round surprised eyes wearing a tiny golden crown. Deep purple and violet aura glow pulses around it, small lightning bolt shapes in the background. Slightly scary but mostly cute chibi style. Purple, gold and white colors. Kawaii chibi icon style, pastel watercolor, pure white background, 64x64. No text, no watermark.
```

---

## グループD: タイトル背景 改訂版（1枚・1280×960）

> 配置先: `assets/title_bg.webp`（既存を上書き）  
> 用途: タイトル画面の全面背景

### D-1. タイトル背景 `title_bg.webp`

```
A breathtaking dreamy pastel watercolor illustration of a magical bee kingdom meadow at golden hour. In the center background, a grand ancient hollow tree palace with glowing honeycomb-patterned windows and flower garland decorations hanging from its branches. Soft pink cherry blossoms and golden pollen sparkles drift lazily through warm amber afternoon light. Tiny fireflies glow among tall lavender flowers in the foreground. Rolling green hills dotted with colorful wildflowers stretch to the horizon. A gentle river with reflections of the golden sky winds through the scene. Color palette: mint green, warm gold, soft pink, lavender, sky blue. Studio Ghibli masterpiece quality, children's picture book illustration, no characters, no text, cinematic depth of field, highly detailed. --ar 4:3
```

---

## 生成チェックリスト（全25枚）

| # | ファイル名 | サイズ | 配置先 | 優先 | 状態 |
|---|-----------|--------|--------|------|------|
| A-1 | weapon_golden_needle.webp | 256×256 | assets/sprites/ | 🔴 | ⬜ 未生成 |
| A-2 | weapon_amber_cannon.webp | 256×256 | assets/sprites/ | 🔴 | ⬜ 未生成 |
| A-3 | weapon_holy_shield.webp | 256×256 | assets/sprites/ | 🔴 | ⬜ 未生成 |
| A-4 | weapon_cursed_thorn.webp | 256×256 | assets/sprites/ | 🔴 | ⬜ 未生成 |
| A-5 | weapon_storm_wing.webp | 256×256 | assets/sprites/ | 🔴 | ⬜ 未生成 |
| A-6 | weapon_queen_true_staff.webp | 256×256 | assets/sprites/ | 🔴 | ⬜ 未生成 |
| B-1 | drop_chest_key.webp | 128×128 | assets/sprites/ | 🔴 | ⬜ 未生成 |
| B-2 | consumable_giant_honey.webp | 128×128 | assets/sprites/ | 🔴 | ⬜ 未生成 |
| B-3 | gimmick_barrel.webp | 128×128 | assets/sprites/ | 🔴 | ⬜ 未生成 |
| C-1 | node_battle.webp | 64×64 | assets/sprites/ | 🟠 | ⬜ 未生成 |
| C-2 | node_chest.webp | 64×64 | assets/sprites/ | 🟠 | ⬜ 未生成 |
| C-3 | node_shop.webp | 64×64 | assets/sprites/ | 🟠 | ⬜ 未生成 |
| C-4 | node_rest.webp | 64×64 | assets/sprites/ | 🟠 | ⬜ 未生成 |
| C-5 | node_boss.webp | 64×64 | assets/sprites/ | 🟠 | ⬜ 未生成 |
| D-1 | title_bg.webp | 1280×960 | assets/ | 🟡 | ⬜ 未生成 |
| 旧1 | title_bg.webp (旧版) | 1280×960 | assets/ | 🟢 | ⬜ 未生成 |
| 旧2 | dead_mipurin.webp | 400×400 | assets/sprites/ | 🟢 | ⬜ 未生成 |
| 旧3 | ending_a.webp | 800×600 | assets/sprites/ | 🟢 | ⬜ 未生成 |
| 旧4 | ending_b.webp | 800×600 | assets/sprites/ | 🟢 | ⬜ 未生成 |
| 旧5 | ending_c.webp | 800×600 | assets/sprites/ | 🟢 | ⬜ 未生成 |
| 旧6 | flora_portrait.webp | 300×500 | assets/sprites/ | 🟢 | ⬜ 未生成 |
| 旧7 | shopkeeper.webp | 300×500 | assets/sprites/ | 🟢 | ⬜ 未生成 |
| 旧8a | boss_silhouette_hornet.webp | 256×256 | assets/sprites/ | 🟢 | ⬜ 未生成 |
| 旧8b | boss_silhouette_fungus.webp | 256×256 | assets/sprites/ | 🟢 | ⬜ 未生成 |
| 旧8c | boss_silhouette_golem.webp | 256×256 | assets/sprites/ | 🟢 | ⬜ 未生成 |
| 旧8d | boss_silhouette_moth.webp | 256×256 | assets/sprites/ | 🟢 | ⬜ 未生成 |

---

## 生成後の組み込み手順

### グループA（Tier2武器）組み込み
```js
// js/systems.js の SPRITE_MAP 内 Tier2 alias を本画像に切り替え
weapon_golden_needle:   'assets/sprites/weapon_golden_needle.webp',
weapon_amber_cannon:    'assets/sprites/weapon_amber_cannon.webp',
weapon_holy_shield:     'assets/sprites/weapon_holy_shield.webp',
weapon_cursed_thorn:    'assets/sprites/weapon_cursed_thorn.webp',
weapon_storm_wing:      'assets/sprites/weapon_storm_wing.webp',
weapon_queen_true_staff:'assets/sprites/weapon_queen_true_staff.webp',
```

### グループB（新アイテム）組み込み
```js
// js/systems.js の SPRITE_MAP に追加
drop_chest_key:         'assets/sprites/drop_chest_key.webp',
consumable_giant_honey: 'assets/sprites/consumable_giant_honey.webp',
gimmick_barrel:         'assets/sprites/gimmick_barrel.webp',
```
```js
// js/gimmicks.js の drawBarrels() でスプライト使用に切り替え
if (hasSprite('gimmick_barrel')) {
  drawSpriteImg('gimmick_barrel', bx, by, bw, bh);
} else { /* 既存canvas描画フォールバック */ }
```

### グループC（ノードアイコン）組み込み
```js
// js/systems.js の SPRITE_MAP に追加
node_battle: 'assets/sprites/node_battle.webp',
node_chest:  'assets/sprites/node_chest.webp',
node_shop:   'assets/sprites/node_shop.webp',
node_rest:   'assets/sprites/node_rest.webp',
node_boss:   'assets/sprites/node_boss.webp',
```
```js
// js/nodemap.js の各ノード描画でスプライト使用に切り替え
// NODE_TYPES の各タイプに対応するスプライトIDを参照
```
