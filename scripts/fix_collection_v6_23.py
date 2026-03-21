# fix_collection_v6_23.py — 敵名オリジナル化 + 武器図鑑???表示 + いきもの図鑑スクロール
import re, os

def read(p):
    with open(p, encoding='utf-8') as f: return f.read()
def write(p, s):
    with open(p, 'w', encoding='utf-8', newline='\n') as f: f.write(s)

# ========== 1. data.js — 敵名リネーム ==========
djs = read('js/data.js')

old_names = {
    "'スライムベス'":     "'みずあめスライム'",
    "'メタルスライム'":   "'ほしぞらスライム'",
    "'キングスライム'":   "'にじいろスライム'",
    "'キラーホーネット'": "'まおうバチ'",
}
for old, new in old_names.items():
    if old in djs:
        djs = djs.replace(old, new)
        print(f'  [data.js] {old} -> {new}')
    else:
        print(f'  [data.js] WARN: {old} not found')

write('js/data.js', djs)
print('[OK] data.js updated')

# ========== 2. ui.js — 3つの修正 ==========
ujs = read('js/ui.js')

# --- 2a. collectionScroll 変数追加 ---
if 'collectionScroll' not in ujs:
    # collectionSubTab = 0 の直後に追加
    ujs = ujs.replace(
        'let collectionSubTab = 0; // 0=enemies, 1=weapons',
        'let collectionSubTab = 0; // 0=enemies, 1=weapons\nlet collectionScroll = 0; // enemy collection scroll offset'
    )
    print('  [ui.js] collectionScroll variable added')
else:
    print('  [ui.js] collectionScroll already exists')

# --- 2b. drawCollectionTab にスクロール追加 ---
# 現在: for (var i = 0; i < Math.min(entries.length, maxRows); i++) {
#        var ent = entries[i];
# 変更: for (var i = 0; i < Math.min(entries.length - collectionScroll, maxRows); i++) {
#        var ent = entries[i + collectionScroll];

old_loop = 'for (var i = 0; i < Math.min(entries.length, maxRows); i++) {\n    var ent = entries[i];'
new_loop = '''// Scroll clamp
  if (typeof collectionScroll === 'undefined') collectionScroll = 0;
  collectionScroll = Math.max(0, Math.min(collectionScroll, Math.max(0, entries.length - maxRows)));
  for (var i = 0; i < Math.min(entries.length - collectionScroll, maxRows); i++) {
    var ent = entries[i + collectionScroll];'''

if old_loop in ujs:
    ujs = ujs.replace(old_loop, new_loop)
    print('  [ui.js] collection scroll loop patched')
else:
    print('  [ui.js] WARN: scroll loop pattern not found, trying flexible match')
    # Try more flexible pattern
    pat = r'for \(var i = 0; i < Math\.min\(entries\.length, maxRows\); i\+\+\) \{\s*\n\s*var ent = entries\[i\];'
    repl = '''// Scroll clamp
  if (typeof collectionScroll === 'undefined') collectionScroll = 0;
  collectionScroll = Math.max(0, Math.min(collectionScroll, Math.max(0, entries.length - maxRows)));
  for (var i = 0; i < Math.min(entries.length - collectionScroll, maxRows); i++) {
    var ent = entries[i + collectionScroll];'''
    ujs_new = re.sub(pat, repl, ujs)
    if ujs_new != ujs:
        ujs = ujs_new
        print('  [ui.js] collection scroll loop patched (flexible)')
    else:
        print('  [ui.js] ERROR: could not patch scroll loop')

# --- 2c. スクロールバー + ヒント表示追加 (drawCollectionTab末尾に追加) ---
# drawCollectionTab 関数の最後の } の前にスクロールバーを挿入
# 最後のエントリ描画ループの後、関数末尾の } の前
scroll_hint_block = '''
  // --- Scroll bar & hint ---
  if (entries.length > maxRows) {
    var sbX = CW - 130, sbY = startY, sbH = maxRows * (cardH + padY);
    var thumbH = Math.max(20, sbH * (maxRows / entries.length));
    var thumbY = sbY + (sbH - thumbH) * (collectionScroll / Math.max(1, entries.length - maxRows));
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(sbX, sbY, 8, sbH);
    ctx.fillStyle = 'rgba(255,215,0,0.5)'; ctx.fillRect(sbX, thumbY, 8, thumbH);
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '13px ' + F; ctx.textAlign = 'center';
    ctx.fillText('↑↓: スクロール (' + (collectionScroll + 1) + '-' + Math.min(collectionScroll + maxRows, entries.length) + ' / ' + entries.length + ')', CW / 2, CH - 55);
    ctx.textAlign = 'left';
  }
'''

# Find the closing brace of drawCollectionTab before drawFloatMessages
# The pattern: the } that appears before 'function drawFloatMessages'
float_msg_marker = 'function drawFloatMessages()'
if float_msg_marker in ujs:
    idx = ujs.index(float_msg_marker)
    # Find the last } before this marker
    # Search backwards for the closing brace of drawCollectionTab
    search_area = ujs[:idx]
    last_brace = search_area.rstrip().rfind('}')
    if last_brace > 0:
        # Check if scroll hint already there
        if 'Scroll bar & hint' not in ujs:
            ujs = ujs[:last_brace] + scroll_hint_block + '\n' + ujs[last_brace:]
            print('  [ui.js] scroll bar + hint added to drawCollectionTab')
        else:
            print('  [ui.js] scroll bar already exists')
    else:
        print('  [ui.js] WARN: closing brace not found')
else:
    print('  [ui.js] WARN: drawFloatMessages marker not found')

# --- 2d. drawWeaponCollection: 未取得は「???」表示（名前・ステータス非表示）---
# 現在の else ブロック (has が false のとき) を見つけて修正
# 現在: } else {
#         // Silhouette
#         ctx.fillStyle = '#444'; ctx.font = '28px ' + F; ctx.textAlign = 'center';
#         ctx.fillText('?', wx + 28, wy + 42);
# を以下に置換:
old_weapon_else = "ctx.fillText('?', wx + 28, wy + 42);"
new_weapon_else = """ctx.fillText('?', wx + 28, wy + 42);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#555'; ctx.font = 'bold 13px ' + F;
      ctx.fillText('???', wx + 56, wy + 25);
      ctx.fillStyle = '#444'; ctx.font = '11px ' + F;
      ctx.fillText('みつけてない…', wx + 56, wy + 42);"""

if old_weapon_else in ujs:
    ujs = ujs.replace(old_weapon_else, new_weapon_else, 1)
    print('  [ui.js] weapon collection ??? placeholder updated')
else:
    print('  [ui.js] WARN: weapon else pattern not found')

write('js/ui.js', ujs)
print('[OK] ui.js updated')

# ========== 3. update.js — ↑↓キーでスクロール追加 ==========
upjs = read('js/update.js')

# 現在の inventoryTab === 1 ブロック:
#   if (inventoryTab === 1) {
#     if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { collectionSubTab = 0; ...
#     if (wasPressed('ArrowRight') || wasPressed('KeyD')) { collectionSubTab = 1; ...
#   }
# ↑↓スクロールを追加

scroll_key_code = """      // Enemy collection scroll
      if (collectionSubTab === 0) {
        if (wasPressed('ArrowUp') || wasPressed('KeyW')) { if (typeof collectionScroll !== 'undefined') collectionScroll = Math.max(0, collectionScroll - 1); if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move(); }
        if (wasPressed('ArrowDown') || wasPressed('KeyS')) { if (typeof collectionScroll !== 'undefined') collectionScroll++; if (typeof Audio !== 'undefined' && Audio.menu_move) Audio.menu_move(); }
      }"""

# Find the second occurrence of the collection sub-tab key handling (the one inside inventoryOpen block, not inside Tab handler)
# Pattern: inside "if (inventoryOpen) {" block, "if (inventoryTab === 1) {"
# The second block that has ArrowRight/collectionSubTab
marker = "if (inventoryTab === 1) {\n      if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { collectionSubTab = 0;"

if 'Enemy collection scroll' not in upjs:
    # Find the inventoryOpen block's inventoryTab === 1 section
    # There are two: one inside Tab press handler, one in the inventoryOpen general handler
    # We need the second one
    occurrences = [m.start() for m in re.finditer(r"if \(inventoryTab === 1\) \{", upjs)]
    if len(occurrences) >= 2:
        # Insert after the closing } of the second inventoryTab===1 block
        # Find the end of this block
        second_start = occurrences[1]
        # Find the matching closing brace
        # The block has two if statements for ArrowLeft and ArrowRight
        # Find the } that closes this if (inventoryTab === 1) block
        # Look for the pattern: collectionSubTab = 1; ... } }
        # After the second occurrence, find the next '}' that closes the block
        rest = upjs[second_start:]
        # Find the closing } of the inventoryTab === 1 block
        # It should be: if (...) { ... if (...) { ... } if (...) { ... } }
        brace_count = 0
        end_pos = 0
        for ci, ch in enumerate(rest):
            if ch == '{': brace_count += 1
            elif ch == '}':
                brace_count -= 1
                if brace_count == 0:
                    end_pos = ci
                    break
        
        insert_pos = second_start + end_pos  # before the closing }
        upjs = upjs[:insert_pos] + '\n' + scroll_key_code + '\n    ' + upjs[insert_pos:]
        print('  [update.js] scroll key handlers added')
    else:
        print(f'  [update.js] WARN: found {len(occurrences)} inventoryTab===1 blocks, expected >=2')
else:
    print('  [update.js] scroll keys already exist')

write('js/update.js', upjs)
print('[OK] update.js updated')

# ========== VERIFICATION ==========
print('\n===== VERIFICATION =====')
errs = 0

djs = read('js/data.js')
for name in ['みずあめスライム', 'ほしぞらスライム', 'にじいろスライム', 'まおうバチ']:
    if name in djs:
        print(f'  [PASS] {name} found in data.js')
    else:
        print(f'  [FAIL] {name} NOT found in data.js')
        errs += 1
for bad in ['スライムベス', 'メタルスライム', 'キングスライム', 'キラーホーネット']:
    if bad in djs:
        print(f'  [FAIL] {bad} still in data.js!')
        errs += 1
    else:
        print(f'  [PASS] {bad} removed from data.js')

ujs = read('js/ui.js')
for pat in ['collectionScroll', 'entries[i + collectionScroll]', 'Scroll bar & hint', 'みつけてない']:
    if pat in ujs:
        print(f'  [PASS] "{pat}" found in ui.js')
    else:
        print(f'  [FAIL] "{pat}" NOT found in ui.js')
        errs += 1

upjs = read('js/update.js')
if 'Enemy collection scroll' in upjs:
    print('  [PASS] scroll key handlers found in update.js')
else:
    print('  [FAIL] scroll key handlers NOT found in update.js')
    errs += 1

# File sizes
for f in ['js/data.js', 'js/ui.js', 'js/update.js']:
    print(f'  {f}: {os.path.getsize(f)} bytes')

if errs == 0:
    print('\n  *** ALL CHECKS PASSED ***')
else:
    print(f'\n  *** {errs} CHECK(S) FAILED ***')
