with open('js/game.js', 'r', encoding='utf-8') as f:
    code = f.read()

# ============================================================
# 1. ノード選択のデータ定義と関数を追加（DROPS セクションの前あたり）
# ============================================================
node_system = '''
// ===== NODE SELECT SYSTEM (フロア間選択画面) =====
const NODE_TYPES = [
  { id: 'battle',  icon: '⚔',  name: 'バトル',       desc: '敵と戦う。祝福を獲得', color: '#e74c3c', weight: 40 },
  { id: 'elite',   icon: '💀', name: 'エリート戦',   desc: '強敵！レア祝福確定',   color: '#8e44ad', weight: 15 },
  { id: 'shop',    icon: '🏪', name: 'ショップ',     desc: '花粉でお買い物',       color: '#f39c12', weight: 15 },
  { id: 'rest',    icon: '🌿', name: 'きゅうけい',   desc: 'HP30%回復',            color: '#2ecc71', weight: 15 },
  { id: 'event',   icon: '❓', name: 'イベント',     desc: '何が起こるかな…？',    color: '#3498db', weight: 15 }
];

const EVENT_POOL = [
  { text: '倒れたミツバチを見つけた…',
    a: { label: 'たすける (HP-1)', apply() { player.hp = Math.max(1, player.hp - 1); showFloat('ありがとう…これを…', 2, MSG_COLORS.heal); activeBlessings.push(pickBlessings()[0]); } },
    b: { label: 'とおりすぎる', apply() { showFloat('…見なかったことにした', 2, MSG_COLORS.info); } } },
  { text: 'きらきら光る花粉のみずうみ！',
    a: { label: 'つかる (HP+2, 花粉-5)', apply() { if (pollen >= 5) { pollen -= 5; player.hp = Math.min(player.hp + 2, player.maxHp); showFloat('きもちいい～！', 2, MSG_COLORS.heal); } else { showFloat('花粉がたりない…', 2, MSG_COLORS.warn); } } },
    b: { label: 'のまない', apply() { pollen += 3; showFloat('花粉を3つひろった', 2, MSG_COLORS.info); } } },
  { text: 'あやしいキノコが生えている…',
    a: { label: 'たべる', apply() { if (Math.random() > 0.4) { player.atk += 1; showFloat('ちからがみなぎる！ATK+1', 2, MSG_COLORS.buff); } else { player.hp = Math.max(1, player.hp - 2); showFloat('おなかが…HP-2', 2, MSG_COLORS.warn); } } },
    b: { label: 'やめておく', apply() { showFloat('けんめいな判断だ', 2, MSG_COLORS.info); } } },
  { text: 'こわれたハチの巣箱を見つけた',
    a: { label: 'なおす (花粉-8)', apply() { if (pollen >= 8) { pollen -= 8; player.maxHp += 1; player.hp += 1; showFloat('最大HP+1！', 2, MSG_COLORS.heal); } else { showFloat('花粉がたりない…', 2, MSG_COLORS.warn); } } },
    b: { label: 'そのままにする', apply() { pollen += 2; showFloat('ちかくで花粉を2つ見つけた', 2, MSG_COLORS.info); } } },
  { text: '花の精霊のささやきが聞こえる…',
    a: { label: 'みみをすます', apply() { const b = pickBlessings()[0]; activeBlessings.push(b); b.apply(); showFloat(b.icon + ' ' + b.name + ' を授かった！', 2, MSG_COLORS.buff); } },
    b: { label: 'いそぐ', apply() { player.speed += 15; showFloat('足が軽くなった！速度UP', 2, MSG_COLORS.buff); } } }
];

let nodeChoices = [], nodeCursor = 0, currentEvent = null, eventPhase = 'choose';

function generateNodes() {
  nodeChoices = []; nodeCursor = 0;
  // ボスフロアの次は必ず戦闘を含める
  const totalWeight = NODE_TYPES.reduce((s, n) => s + n.weight, 0);
  const pick = () => {
    let r = Math.random() * totalWeight, acc = 0;
    for (const n of NODE_TYPES) { acc += n.weight; if (r < acc) return {...n}; }
    return {...NODE_TYPES[0]};
  };
  // 3択生成（重複IDを避ける）
  const used = new Set();
  for (let i = 0; i < 3; i++) {
    let node, tries = 0;
    do { node = pick(); tries++; } while (used.has(node.id) && tries < 20);
    used.add(node.id);
    nodeChoices.push(node);
  }
}

function executeNode(node) {
  if (node.id === 'battle') {
    gameState = 'blessing'; blessingChoices = pickBlessings();
  } else if (node.id === 'elite') {
    // エリート: 次フロアの敵を強化して祝福確定
    gameState = 'blessing'; blessingChoices = pickBlessings();
    // エリートボーナス: レア祝福を混ぜる
    showFloat('💀 エリートクリア！レア祝福！', 2, MSG_COLORS.boss);
  } else if (node.id === 'shop') {
    gameState = 'shop'; buildShop();
  } else if (node.id === 'rest') {
    const heal = Math.max(1, Math.ceil(player.maxHp * 0.3));
    player.hp = Math.min(player.hp + heal, player.maxHp);
    emitParticles(player.x + player.w/2, player.y + player.h/2, '#2ecc71', 15, 80, 0.5);
    showFloat('🌿 HP ' + heal + ' 回復！', 2, MSG_COLORS.heal);
    Audio.blessing();
    nextFloor();
  } else if (node.id === 'event') {
    currentEvent = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
    eventPhase = 'choose';
    nodeCursor = 0;
    gameState = 'event';
  }
}
'''

# STATEセクションの直前に挿入
code = code.replace(
    "// ===== STATE =====",
    node_system + "\n// ===== STATE ====="
)

# ============================================================
# 2. floorClear → nodeSelect に遷移を変更
# ============================================================
old_floorClear = """if (gameState === 'floorClear') { clearTimer += dt; if (clearTimer > 1.5) {
      if (floor >= MAX_FLOOR && isBossFloor()) { stopBGM(); playBGM('ending'); gameState = 'ending'; return; }
    if (floor % 2 === 0) { gameState = 'shop'; buildShop(); } else { gameState = 'blessing'; blessingChoices = pickBlessings(); }
  } return; }"""

new_floorClear = """if (gameState === 'floorClear') { clearTimer += dt; if (clearTimer > 1.5) {
      if (floor >= MAX_FLOOR && isBossFloor()) { stopBGM(); playBGM('ending'); gameState = 'ending'; return; }
    generateNodes(); gameState = 'nodeSelect';
  } return; }"""

code = code.replace(old_floorClear, new_floorClear)

# ============================================================
# 3. nodeSelect と event の update ハンドラを追加
# ============================================================
# floorClear の return; } の直後に挿入
node_update = """
  if (gameState === 'nodeSelect') {
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { nodeCursor = (nodeCursor + 2) % 3; Audio.menu_move(); }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) { nodeCursor = (nodeCursor + 1) % 3; Audio.menu_move(); }
    if (wasPressed('KeyZ')) { Audio.menu_select(); executeNode(nodeChoices[nodeCursor]); }
    return;
  }
  if (gameState === 'event') {
    if (eventPhase === 'choose') {
      if (wasPressed('ArrowUp') || wasPressed('KeyW')) { nodeCursor = 0; Audio.menu_move(); }
      if (wasPressed('ArrowDown') || wasPressed('KeyS')) { nodeCursor = 1; Audio.menu_move(); }
      if (wasPressed('KeyZ')) {
        Audio.menu_select();
        if (nodeCursor === 0) currentEvent.a.apply();
        else currentEvent.b.apply();
        eventPhase = 'done';
      }
    } else if (eventPhase === 'done') {
      if (wasPressed('KeyZ')) { nextFloor(); }
    }
    return;
  }
"""

code = code.replace(
    new_floorClear,
    new_floorClear + node_update
)

# ============================================================
# 4. nodeSelect と event の draw を追加
# ============================================================
# floorClear描画の直後に挿入
node_draw = """
  if (gameState === 'nodeSelect') {
    ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 32px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('つぎの道をえらぼう', CW / 2, 160);
    for (let i = 0; i < nodeChoices.length; i++) {
      const n = nodeChoices[i];
      const bx = CW / 2 - 360 + i * 240, by = 260, bw = 200, bh = 280;
      // Card bg
      ctx.fillStyle = nodeCursor === i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)';
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = nodeCursor === i ? n.color : 'rgba(255,255,255,0.3)';
      ctx.lineWidth = nodeCursor === i ? 4 : 2;
      ctx.strokeRect(bx, by, bw, bh);
      // Icon
      ctx.fillStyle = '#fff'; ctx.font = '48px sans-serif';
      ctx.fillText(n.icon, bx + bw / 2, by + 70);
      // Name
      ctx.fillStyle = n.color; ctx.font = 'bold 22px sans-serif';
      ctx.fillText(n.name, bx + bw / 2, by + 120);
      // Desc
      ctx.fillStyle = '#ccc'; ctx.font = '14px sans-serif';
      const words = n.desc.split(''); let line = '', ly = by + 155;
      for (const ch of words) { line += ch; if (ctx.measureText(line).width > bw - 30) { ctx.fillText(line, bx + bw / 2, ly); ly += 20; line = ''; } }
      if (line) ctx.fillText(line, bx + bw / 2, ly);
      // Cursor
      if (nodeCursor === i) {
        ctx.fillStyle = n.color; ctx.font = '16px sans-serif';
        ctx.fillText('▶ Z: えらぶ', bx + bw / 2, by + bh - 20);
      }
    }
    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '16px sans-serif';
    ctx.fillText('← → で選択  /  Z で決定', CW / 2, CH - 60);
    ctx.textAlign = 'left';
  }
  if (gameState === 'event' && currentEvent) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = '#3498db'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('❓ イベント', CW / 2, 200);
    ctx.fillStyle = '#fff'; ctx.font = '22px sans-serif';
    ctx.fillText(currentEvent.text, CW / 2, 280);
    if (eventPhase === 'choose') {
      const opts = [currentEvent.a.label, currentEvent.b.label];
      for (let i = 0; i < 2; i++) {
        const oy = 370 + i * 70;
        ctx.fillStyle = nodeCursor === i ? 'rgba(52,152,219,0.4)' : 'rgba(255,255,255,0.1)';
        ctx.fillRect(CW / 2 - 200, oy - 25, 400, 50);
        ctx.strokeStyle = nodeCursor === i ? '#3498db' : 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2; ctx.strokeRect(CW / 2 - 200, oy - 25, 400, 50);
        ctx.fillStyle = nodeCursor === i ? '#fff' : '#aaa'; ctx.font = '20px sans-serif';
        ctx.fillText(opts[i], CW / 2, oy + 7);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '14px sans-serif';
      ctx.fillText('↑↓ で選択  /  Z で決定', CW / 2, 540);
    } else {
      ctx.fillStyle = '#ffd700'; ctx.font = '18px sans-serif';
      ctx.fillText('Z: つぎへ', CW / 2, 400);
    }
    ctx.textAlign = 'left';
  }
"""

# floorClear描画ブロックの後に挿入
old_floorClear_draw = """if (gameState === 'floorClear') { ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = COL.clear; ctx.font = 'bold 36px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('FLOOR ' + floor + ' CLEAR!', CW / 2, CH / 2); ctx.textAlign = 'left'; }"""

code = code.replace(
    old_floorClear_draw,
    old_floorClear_draw + node_draw
)

with open('js/game.js', 'w', encoding='utf-8') as f:
    f.write(code)

print('Done: Node select system added')
