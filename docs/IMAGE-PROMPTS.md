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

## 1. タイトル背景 (`assets/title_bg.webp`)

- **解像度**: 1280×960
- **用途**: タイトル画面の全面背景（上にロゴとキャラを重ねる）

**Midjourney / DALL-E:**
Copy
A dreamy pastel watercolor illustration of a magical forest meadow at golden hour. Soft pink cherry blossom petals float in the air. In the center, a small sunlit clearing surrounded by tall mossy trees with warm lantern-like flowers glowing on branches. Tiny fireflies and sparkles drift through the scene. The color palette is soft pink, mint green, warm gold, and lavender. Studio Ghibli inspired, children's picture book style, extremely detailed, no characters, no text, warm lighting, depth of field. --ar 4:3 --style raw --v 6


**Stable Diffusion (positive):**
masterpiece, best quality, watercolor illustration, magical forest meadow, golden hour, cherry blossom petals floating, mossy trees, glowing flower lanterns, fireflies, sparkles, pastel pink mint green gold lavender, studio ghibli style, childrens picture book, no people, no text

**Negative:** `text, watermark, person, character, dark, realistic, photo`

---

## 2. 死亡画面ミプリン (`assets/sprites/dead_mipurin.webp`)

- **解像度**: 400×400
- **用途**: ゲームオーバー画面の中央イラスト

**Midjourney / DALL-E:**
A small cute round yellow bee character sleeping peacefully on a soft green leaf bed, surrounded by tiny glowing flowers. The bee has a gentle sad smile, closed eyes with small sparkling teardrops, tiny translucent wings folded. Soft purple and pink tones, dreamy atmosphere, watercolor children's book illustration style. Simple white background. Chibi kawaii style, pastel colors, no text. --ar 1:1 --v 6


---

## 3. エンディングA – ノーマルエンド (`assets/sprites/ending_a.webp`)

- **解像度**: 800×600
- **用途**: 通常クリア時のエンディング背景

**Midjourney / DALL-E:**
A joyful watercolor illustration of a small cute yellow bee character standing triumphantly on a flower-covered hilltop, looking at a beautiful sunrise over a magical flower-filled valley. Golden light rays stream across the sky. Colorful butterflies flying around, cherry blossoms and flower petals in the wind. Warm gold, pink, and sky blue palette. Studio Ghibli inspired, children's picture book, heartwarming triumphant mood, no text. --ar 4:3 --v 6


---

## 4. エンディングB – グッドエンド (`assets/sprites/ending_b.webp`)

- **解像度**: 800×600
- **用途**: 祝福8個以上でクリア時

**Midjourney / DALL-E:**
An ethereal watercolor illustration of a small yellow bee character surrounded by six glowing flower spirits (rose, lily, sunflower, wisteria, lotus, chrysanthemum) in a magical circle of light. Golden pollen swirls and rainbow sparkles fill the air. A massive ancient tree of life glows warmly in the background. Ethereal, mystical, breathtaking beauty. Pastel rainbow colors with gold accents. Fairy tale illustration style, no text. --ar 4:3 --v 6


---

## 5. エンディングC – トゥルーエンド (`assets/sprites/ending_c.webp`)

- **解像度**: 800×600
- **用途**: 祝福12個+デュオ3個以上でクリア時

**Midjourney / DALL-E:**
A magnificent watercolor illustration of a small yellow bee character with glowing golden wings, wearing a tiny flower crown, floating above a restored magical kingdom of flowers and insects. Below, hundreds of happy insects celebrate among blooming flowers. The sky is filled with aurora-like streams of flower pollen in every color. Epic yet cute, triumphant and heartwarming. Pastel colors with brilliant gold highlights. Studio Ghibli masterpiece quality, no text. --ar 4:3 --v 6


---

## 6. NPC フローラ立ち絵 (`assets/sprites/flora_portrait.webp`)

- **解像度**: 300×500
- **用途**: 花壇メニュー右下のNPC表示

**Midjourney / DALL-E:**
A cute fairy character design sheet, full body portrait. She is small with delicate wings made of pink flower petals. Wearing a dress made of green leaves and tiny flowers. Long flowing green hair with small cherry blossoms woven in. Holding a small golden watering can. Warm gentle smile, big sparkling green eyes with long eyelashes. Pastel watercolor style, kawaii anime aesthetic, white background, character concept art, no text. --ar 3:5 --v 6


---

## 7. ショップ店主 (`assets/sprites/shopkeeper.webp`)

- **解像度**: 300×500
- **用途**: ショップ画面のNPC表示

**Midjourney / DALL-E:**
A friendly ladybug shopkeeper character design, full body. Cute anthropomorphic ladybug wearing a tiny striped apron and small merchant beret hat. Standing behind a small wooden market stall decorated with flowers and lanterns. Holding up a shiny golden potion bottle. Warm cheerful expression with rosy cheeks, kawaii chibi style. Pastel watercolor, children's book illustration, white background, no text. --ar 3:5 --v 6


---

## 8. ボス登場シルエット (4種)

- **解像度**: 各256×256
- **用途**: ボス入場暗転演出時のシルエット表示

### 8a. スズメバチの女王 (`assets/sprites/boss_silhouette_hornet.webp`)
A dramatic dark silhouette of a giant wasp queen monster against a glowing amber gold radial background. Ominous but slightly cute rounded shapes, large wings spread wide, crown on head. Strong backlighting creating a halo glow effect. Digital art, clean edges, no text. --ar 1:1 --v 6


### 8b. キノコの王 (`assets/sprites/boss_silhouette_fungus.webp`)
A dramatic dark silhouette of a large mushroom monarch creature against a glowing toxic green radial background. Huge mushroom cap, stubby limbs, spore particles floating. Ominous but cute rounded shapes. Strong backlighting halo effect. Digital art, clean edges, no text. --ar 1:1 --v 6


### 8c. クリスタルゴーレム (`assets/sprites/boss_silhouette_golem.webp`)
A dramatic dark silhouette of a massive crystal rock giant against a glowing icy blue radial background. Angular crystal formations on shoulders and head, powerful stance. Ominous but slightly cute proportions. Strong backlighting halo effect. Digital art, clean edges, no text. --ar 1:1 --v 6


### 8d. 闇の蛾 (`assets/sprites/boss_silhouette_moth.webp`)
A dramatic dark silhouette of a large mystical moth with glowing purple eyes against a deep purple radial background. Elaborate wing patterns visible as slightly lighter shapes within the silhouette. Hypnotic, mysterious. Strong backlighting halo effect. Digital art, clean edges, no text. --ar 1:1 --v 6


---

## 生成チェックリスト

| # | ファイル名 | サイズ | 配置先 | 状態 |
|---|---|---|---|---|
| 1 | title_bg.webp | 1280×960 | assets/ | ⬜ 未生成 |
| 2 | dead_mipurin.webp | 400×400 | assets/sprites/ | ⬜ 未生成 |
| 3 | ending_a.webp | 800×600 | assets/sprites/ | ⬜ 未生成 |
| 4 | ending_b.webp | 800×600 | assets/sprites/ | ⬜ 未生成 |
| 5 | ending_c.webp | 800×600 | assets/sprites/ | ⬜ 未生成 |
| 6 | flora_portrait.webp | 300×500 | assets/sprites/ | ⬜ 未生成 |
| 7 | shopkeeper.webp | 300×500 | assets/sprites/ | ⬜ 未生成 |
| 8a | boss_silhouette_hornet.webp | 256×256 | assets/sprites/ | ⬜ 未生成 |
| 8b | boss_silhouette_fungus.webp | 256×256 | assets/sprites/ | ⬜ 未生成 |
| 8c | boss_silhouette_golem.webp | 256×256 | assets/sprites/ | ⬜ 未生成 |
| 8d | boss_silhouette_moth.webp | 256×256 | assets/sprites/ | ⬜ 未生成 |
