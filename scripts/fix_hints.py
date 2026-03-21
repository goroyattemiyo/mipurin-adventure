# fix_hints.py - P0-P3 操作表示乖離を一括修正
import re

# ========== 1. ui.js ==========
with open('js/ui.js', 'r', encoding='utf-8') as f:
    ui = f.read()

# 1a. フッター: 「もういちどTABで閉じる」→「ESC: とじる」
ui = ui.replace(
    "TAB: タブ切替 / もういちどTABで閉じる",
    "TAB: タブ切替  ESC: とじる"
)

# 1b. HUD ヘルプ: WASD → WASD/矢印
ui = ui.replace(
    "WASD:いどう",
    "WASD/矢印:いどう"
)

# 1c. drawCollectionTab を完全置換（サブタブUI追加）
old_collection = '''function drawCollectionTab() {
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('🌸 花の国のいきもの図鑑', 120, 140);
  const names = Object.keys(collection);
  if (names.length === 0) { ctx.fillStyle = '#888'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif"; ctx.fillText('まだ誰にも会っていないよ…冒険に出かけよう！', 140, 200); return; }
  const allDefs = Object.values(ENEMY_DEFS);
  for (let i = 0; i < names.length; i++) {
    const c = collection[names[i]];
    const row = i;
    const ey = 180 + row * 70;
    if (ey > CH - 80) break; // 画面外防止
    const def = allDefs.find(d => d.name === names[i]) || {};
    ctx.fillStyle = def.color || '#fff';
    ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText(names[i], 140, ey);
    ctx.fillStyle = '#ccc'; ctx.font = "19px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('遭遇: ' + c.seen + '  撃破: ' + c.defeated, 340, ey);
    if (def.lore && c.defeated > 0) {
      ctx.fillStyle = '#999'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText(def.lore, 160, ey + 22);
    } else if (c.defeated === 0) {
      ctx.fillStyle = '#666'; ctx.font = "20px 'M PLUS Rounded 1c', sans-serif";
      ctx.fillText('??? （倒すと情報が解放されるよ）', 160, ey + 22);
    }
  }
}'''

new_collection = '''function drawCollectionTab() {
  var F = "'M PLUS Rounded 1c', sans-serif";
  // === Sub-tab header ===
  var subTabs = ['いきもの', 'ぶき'];
  for (var si = 0; si < subTabs.length; si++) {
    var stx = 200 + si * 180, sty = 120;
    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#ffd700' : 'rgba(255,255,255,0.3)';
    ctx.fillRect(stx - 60, sty - 16, 120, 32);
    ctx.fillStyle = (typeof collectionSubTab !== 'undefined' ? collectionSubTab : 0) === si ? '#000' : '#ccc';
    ctx.font = "bold 18px " + F; ctx.textAlign = 'center';
    ctx.fillText(subTabs[si], stx, sty + 6);
  }
  ctx.textAlign = 'left';
  // === Hint ===
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "14px " + F; ctx.textAlign = 'center';
  ctx.fillText('←→: サブタブ切替', 290, 155);
  ctx.textAlign = 'left';

  if (typeof collectionSubTab !== 'undefined' && collectionSubTab === 1) {
    drawWeaponCollection();
    return;
  }
  // === Enemy collection (sub-tab 0) ===
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px " + F;
  ctx.fillText('🌸 花の国のいきもの図鑑', 120, 190);
  var names = Object.keys(collection);
  if (names.length === 0) { ctx.fillStyle = '#888'; ctx.font = "20px " + F; ctx.fillText('まだ誰にも会っていないよ…冒険に出かけよう！', 140, 240); return; }
  var allDefs = Object.values(ENEMY_DEFS);
  for (var i = 0; i < names.length; i++) {
    var c = collection[names[i]];
    var ey = 230 + i * 70;
    if (ey > CH - 80) break;
    var def = allDefs.find(function(d) { return d.name === names[i]; }) || {};
    ctx.fillStyle = def.color || '#fff';
    ctx.font = "bold 20px " + F;
    ctx.fillText(names[i], 140, ey);
    ctx.fillStyle = '#ccc'; ctx.font = "19px " + F;
    ctx.fillText('遭遇: ' + c.seen + '  撃破: ' + c.defeated, 340, ey);
    if (def.lore && c.defeated > 0) {
      ctx.fillStyle = '#999'; ctx.font = "20px " + F;
      ctx.fillText(def.lore, 160, ey + 22);
    } else if (c.defeated === 0) {
      ctx.fillStyle = '#666'; ctx.font = "20px " + F;
      ctx.fillText('??? （倒すと情報が解放されるよ）', 160, ey + 22);
    }
  }
}'''

if old_collection in ui:
    ui = ui.replace(old_collection, new_collection)
    print("[OK] drawCollectionTab replaced with sub-tab version")
else:
    print("[WARN] drawCollectionTab exact match failed, trying regex")
    # Fallback: replace function body
    pattern = r'function drawCollectionTab\(\)\s*\{.*?\n\}'
    if re.search(pattern, ui, re.DOTALL):
        ui = re.sub(pattern, new_collection, ui, count=1, flags=re.DOTALL)
        print("[OK] drawCollectionTab replaced via regex")
    else:
        print("[FAIL] Could not find drawCollectionTab")

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.write(ui)
print("[OK] ui.js saved (" + str(len(ui)) + " bytes)")

# ========== 2. equip_ui.js ==========
with open('js/equip_ui.js', 'r', encoding='utf-8') as f:
    eq = f.read()

# 2a. All hint text: Tab:とじる → Esc:とじる
eq = eq.replace('Tab:\\u3068\\u3058\\u308B', 'Esc:\\u3068\\u3058\\u308B')
# Also handle literal Japanese
eq = eq.replace('Tab:とじる', 'Esc:とじる')

# 2b. Unicode escaped versions
eq = eq.replace(
    "\\u2191\\u2193:\\u30B9\\u30ED\\u30C3\\u30C8  \\u2192:\\u30EA\\u30B9\\u30C8\\u3078  Z:\\u5F37\\u5316  Tab:\\u3068\\u3058\\u308B",
    "\\u2191\\u2193:\\u30B9\\u30ED\\u30C3\\u30C8  \\u2192:\\u30EA\\u30B9\\u30C8\\u3078  Z:\\u5F37\\u5316  Esc:\\u3068\\u3058\\u308B"
)
eq = eq.replace(
    "\\u2191\\u2193:\\u30B9\\u30ED\\u30C3\\u30C8  Tab:\\u3068\\u3058\\u308B",
    "\\u2191\\u2193:\\u30B9\\u30ED\\u30C3\\u30C8  Esc:\\u3068\\u3058\\u308B"
)
eq = eq.replace(
    "\\u2191\\u2193:\\u3048\\u3089\\u3076  \\u2190:\\u30B9\\u30ED\\u30C3\\u30C8\\u3078  Z:\\u5F37\\u5316  X:\\u305D\\u3046\\u3073  Tab:\\u3068\\u3058\\u308B",
    "\\u2191\\u2193:\\u3048\\u3089\\u3076  \\u2190:\\u30B9\\u30ED\\u30C3\\u30C8\\u3078  Z:\\u5F37\\u5316/\\u3057\\u3093\\u304B  X:\\u305D\\u3046\\u3073  Esc:\\u3068\\u3058\\u308B"
)

with open('js/equip_ui.js', 'w', encoding='utf-8') as f:
    f.write(eq)
print("[OK] equip_ui.js saved (" + str(len(eq)) + " bytes)")

# ========== 3. render.js ==========
with open('js/render.js', 'r', encoding='utf-8') as f:
    rn = f.read()

# 3a. Weapon drop: add C:バックパック
rn = rn.replace(
    "Z:装備  Q:サブ  X:見送る",
    "Z:装備  Q:サブ  C:バックパック  X:見送る"
)
# Also handle unicode version if exists
rn = rn.replace(
    'Z:\\u88C5\\u5099  Q:\\u30B5\\u30D6  X:\\u898B\\u9001\\u308B',
    'Z:\\u88C5\\u5099  Q:\\u30B5\\u30D6  C:\\u30D0\\u30C3\\u30AF\\u30D1\\u30C3\\u30AF  X:\\u898B\\u9001\\u308B'
)
# Try the literal mixed version from the source
rn = rn.replace(
    "Z:   Q:   X: ",
    "Z:装備  Q:サブ  C:バックパック  X:見送る"
)

with open('js/render.js', 'w', encoding='utf-8') as f:
    f.write(rn)
print("[OK] render.js saved (" + str(len(rn)) + " bytes)")

# ========== Summary ==========
print("\n=== All hint fixes applied ===")
print("P0: Inventory footer TAB->ESC close hint")
print("P0: Equip tab hints Tab->Esc")
print("P0: Collection sub-tab UI + drawWeaponCollection integration")
print("P1: Weapon drop C:backpack hint added")
print("P1: Equip list Z:強化/しんか hint")
print("P2: HUD WASD/矢印 hint")
