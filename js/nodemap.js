// ===== NODE MAP & EVENT SYSTEM =====
// Extracted from data.js for Phase 2 expansion
// Depends on: player, pollen, floor, showFloat, MSG_COLORS, Audio,
//             pickBlessings (blessings.js), buildShop (systems.js)
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

