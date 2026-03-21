import pathlib

# === H-3: Weapon collection sub-tab in encyclopedia ===
ui = pathlib.Path("js/ui.js").read_text(encoding="utf-8")

# Add collectionSubTab variable
if "collectionSubTab" not in ui:
    ui = ui.replace(
        "const UI_TEXT_STYLE",
        "let collectionSubTab = 0; // 0=enemies, 1=weapons\n\nconst UI_TEXT_STYLE"
    )
    print("[OK] collectionSubTab declared")

# Replace drawCollectionTab to include sub-tabs
old_collection = """function drawCollectionTab() {
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('\uD83C\uDF38 \u82B1\u306E\u56FD\u306E\u3044\u304D\u3082\u306E\u56F3\u9451', 120, 140);"""

new_collection = """function drawCollectionTab() {
  var F = "'M PLUS Rounded 1c', sans-serif";
  // Sub-tabs
  var subTabs = ['\\uD83D\\uDC1B \\u3044\\u304D\\u3082\\u306E', '\\u2694 \\u3076\\u304D'];
  for (var t = 0; t < subTabs.length; t++) {
    var stx = 200 + t * 200, sty = 130;
    ctx.fillStyle = collectionSubTab === t ? '#e056fd' : 'rgba(255,255,255,0.2)';
    ctx.fillRect(stx - 70, sty - 16, 140, 32);
    ctx.fillStyle = collectionSubTab === t ? '#fff' : '#aaa';
    ctx.font = "bold 16px " + F; ctx.textAlign = 'center';
    ctx.fillText(subTabs[t], stx, sty + 5);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "12px " + F; ctx.textAlign = 'center';
  ctx.fillText('\\u2190 \\u2192 \\u3067\\u5207\\u308A\\u66FF\\u3048', 300, 155);
  ctx.textAlign = 'left';
  if (collectionSubTab === 1) { drawWeaponCollection(); return; }
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText('\\uD83C\\uDF38 \\u82B1\\u306E\\u56FD\\u306E\\u3044\\u304D\\u3082\\u306E\\u56F3\\u9451', 120, 190);"""

if old_collection in ui:
    ui = ui.replace(old_collection, new_collection)
    # Adjust enemy list Y positions (shift down by 50px for sub-tab space)
    ui = ui.replace("const names = Object.keys(collection);", "var names = Object.keys(collection);")
    ui = ui.replace(
        "if (names.length === 0) { ctx.fillStyle = '#888'; ctx.font = \"20px 'M PLUS Rounded 1c', sans-serif\"; ctx.fillText('\u307e\u3060\u8ab0\u306b\u3082\u4f1a\u3063\u3066\u3044\u306a\u3044\u3088\u2026\u5192\u967a\u306b\u51fa\u304b\u3051\u3088\u3046\uff01', 140, 200); return; }",
        "if (names.length === 0) { ctx.fillStyle = '#888'; ctx.font = \"20px 'M PLUS Rounded 1c', sans-serif\"; ctx.fillText('\\u307E\\u3060\\u8AB0\\u306B\\u3082\\u4F1A\\u3063\\u3066\\u3044\\u306A\\u3044\\u3088\\u2026\\u5192\\u967A\\u306B\\u51FA\\u304B\\u3051\\u3088\\u3046\\uFF01', 140, 250); return; }"
    )
    ui = ui.replace("const allDefs = Object.values(ENEMY_DEFS);", "var allDefs = Object.values(ENEMY_DEFS);")
    ui = ui.replace("const ey = 180 + row * 70;", "var ey = 230 + row * 70;")
    print("[OK] drawCollectionTab updated with sub-tabs")
else:
    print("[WARN] Exact collection tab header not found, trying partial...")
    if "drawCollectionTab" in ui and "collectionSubTab" not in ui.split("drawCollectionTab")[1][:200]:
        print("[FAIL] Could not patch drawCollectionTab")
    else:
        print("[SKIP] Already patched or structure different")

# Add drawWeaponCollection function
if "drawWeaponCollection" not in ui:
    weapon_collection_fn = """

function drawWeaponCollection() {
  var F = "'M PLUS Rounded 1c', sans-serif";
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 22px " + F;
  ctx.fillText('\\u2694 \\u3076\\u304D\\u305A\\u304B\\u3093', 120, 190);

  // Completion bar
  var total = typeof WEAPON_DEFS !== 'undefined' ? WEAPON_DEFS.length : 12;
  var owned = typeof weaponCollection !== 'undefined' ? weaponCollection.size : 0;
  var pct = Math.floor(owned / total * 100);
  ctx.fillStyle = '#555'; ctx.fillRect(120, 200, 400, 16);
  ctx.fillStyle = '#ffd700'; ctx.fillRect(120, 200, 400 * (owned / total), 16);
  ctx.fillStyle = '#fff'; ctx.font = "bold 12px " + F; ctx.textAlign = 'center';
  ctx.fillText(owned + ' / ' + total + ' (' + pct + '%)', 320, 212);
  ctx.textAlign = 'left';

  // Weapon cards
  var cardW = 200, cardH = 80, cols = 5, padX = 12, padY = 8;
  var startX = 120, startY = 230;
  for (var i = 0; i < WEAPON_DEFS.length; i++) {
    var w = WEAPON_DEFS[i];
    var col = i % cols, row = Math.floor(i / cols);
    var wx = startX + col * (cardW + padX);
    var wy = startY + row * (cardH + padY);
    if (wy > CH - 100) break;
    var has = typeof weaponCollection !== 'undefined' && weaponCollection.has(w.id);
    var isTier2 = w.tier === 2;

    // Card bg
    ctx.fillStyle = has ? 'rgba(40,30,60,0.9)' : 'rgba(30,30,30,0.7)';
    ctx.fillRect(wx, wy, cardW, cardH);
    // Border (copper=tier1, gold=tier2)
    ctx.strokeStyle = has ? (isTier2 ? '#ffd700' : '#cd7f32') : '#333';
    ctx.lineWidth = has ? 2 : 1;
    ctx.strokeRect(wx, wy, cardW, cardH);

    if (has) {
      // Icon
      var sprId = 'weapon_' + w.id;
      if (typeof hasSprite === 'function' && hasSprite(sprId)) {
        drawSpriteImg(sprId, wx + 4, wy + 8, 48, 48);
      } else {
        ctx.fillStyle = '#fff'; ctx.font = '28px ' + F; ctx.textAlign = 'center';
        var em = w.name.match(/^[\\uD800-\\uDBFF][\\uDC00-\\uDFFF][\\uFE0F\\u20E3]?|^./);
        ctx.fillText(em ? em[0] : '\\u2694', wx + 28, wy + 42);
        ctx.textAlign = 'left';
      }
      // Name
      ctx.fillStyle = w.color || '#fff'; ctx.font = 'bold 13px ' + F;
      var shortName = w.name.length > 10 ? w.name.slice(0, 10) + '..' : w.name;
      ctx.fillText(shortName, wx + 56, wy + 25);
      // Stats
      ctx.fillStyle = '#ccc'; ctx.font = '11px ' + F;
      ctx.fillText('ATK ' + w.dmgMul.toFixed(1) + '  SPD ' + w.speed.toFixed(2), wx + 56, wy + 42);
      // Tier badge
      if (isTier2) {
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 10px ' + F;
        ctx.fillText('T2', wx + cardW - 20, wy + 14);
      }
      // Desc
      ctx.fillStyle = '#999'; ctx.font = '10px ' + F;
      var shortDesc = w.desc.length > 18 ? w.desc.slice(0, 18) + '..' : w.desc;
      ctx.fillText(shortDesc, wx + 56, wy + 58);
    } else {
      // Silhouette
      ctx.fillStyle = '#444'; ctx.font = '28px ' + F; ctx.textAlign = 'center';
      ctx.fillText('?', wx + 28, wy + 42);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#555'; ctx.font = '13px ' + F;
      ctx.fillText('??? \\u307E\\u3060\\u3067\\u3042\\u3063\\u3066\\u3044\\u306A\\u3044', wx + 56, wy + 35);
      if (isTier2) {
        ctx.fillStyle = '#665500'; ctx.font = 'bold 10px ' + F;
        ctx.fillText('T2', wx + cardW - 20, wy + 14);
      }
    }
  }
}
"""
    ui += weapon_collection_fn
    print("[OK] drawWeaponCollection function added")

pathlib.Path("js/ui.js").write_text(ui, encoding="utf-8")

# === update.js: Add left/right sub-tab switching in collection tab ===
update = pathlib.Path("js/update.js").read_text(encoding="utf-8")

if "collectionSubTab" not in update:
    # Inside inventoryOpen block, when inventoryTab === 1, handle arrow keys
    # Find the return statement after inventoryTab === 2 block
    # We need to add handling for tab 1 before the final return
    marker = "if (inventoryTab === 2) {"
    if marker in update:
        sub_tab_code = """if (inventoryTab === 1) {
      if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { collectionSubTab = 0; if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move(); }
      if (wasPressed('ArrowRight') || wasPressed('KeyD')) { collectionSubTab = 1; if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move(); }
    }
    """
        update = update.replace(marker, sub_tab_code + marker)
        print("[OK] Sub-tab switching added to update.js")
    else:
        print("[FAIL] inventoryTab === 2 marker not found")

    pathlib.Path("js/update.js").write_text(update, encoding="utf-8")
else:
    print("[SKIP] collectionSubTab already in update.js")

print("[DONE] H-3 complete")
