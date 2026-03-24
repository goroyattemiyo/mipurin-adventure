// ===== NODE MAP SYSTEM (Sprint B) =====
// 2-tier mini-tree with connections
// Depends: player, pollen, floor, showFloat, MSG_COLORS, Audio,
//          pickBlessings, activeBlessings (blessings.js), buildShop (systems.js)

const NODE_TYPES = [
  { id:'battle',  icon:'⚔',  name:'バトル',     desc:'敵と戦う。祝福を獲得',   color:'#e74c3c', weight:40 },
  { id:'elite',   icon:'💀', name:'エリート戦', desc:'強敵！レア祝福確定',     color:'#8e44ad', weight:12 },
  { id:'shop',    icon:'🏪', name:'ショップ',   desc:'花粉でお買い物',         color:'#f39c12', weight:15 },
  { id:'rest',    icon:'🌿', name:'きゅうけい', desc:'HP30%回復',              color:'#2ecc71', weight:18 },
  { id:'event',   icon:'❓', name:'イベント',   desc:'何が起こるかな…？',      color:'#3498db', weight:15 },
  { id:'chest',   icon:'💎', name:'宝箱',       desc:'何か入ってるかも！',     color:'#f1c40f', weight:8  }
];

const EVENT_POOL = [
  { text:'倒れたミツバチを見つけた… その羽はまだかすかに光っている。闇の胞子に抗った痕だろうか',
    a:{ label:'たすける (HP-1)', apply(){ player.hp = Math.max(1, player.hp-1); showFloat('ありがとう…これを…',2,MSG_COLORS.heal); const b=pickBlessings()[0]; activeBlessings.push(b); b.apply(); showFloat(b.icon+' '+b.name,2,MSG_COLORS.buff); }},
    b:{ label:'とおりすぎる', apply(){ showFloat('…見なかったことにした',2,MSG_COLORS.info); }}},
  { text:'きらきら光る花粉のみずうみ！ クリスタルの光が残った泉かもしれない',
    a:{ label:'つかる (HP+2, 花粉-5)', apply(){ if(pollen>=5){pollen-=5;player.hp=Math.min(player.hp+2,player.maxHp);showFloat('きもちいい～！',2,MSG_COLORS.heal);}else{showFloat('花粉がたりない…',2,MSG_COLORS.warn);}}},
    b:{ label:'のまない', apply(){ pollen+=3; showFloat('花粉を3つひろった',2,MSG_COLORS.info); }}},
  { text:'あやしいキノコが生えている… キノコの王の胞子がここまで飛んできたのだろうか',
    a:{ label:'たべる', apply(){ if(Math.random()>0.4){player.atk+=1;showFloat('ちからがみなぎる！ATK+1',2,MSG_COLORS.buff);}else{player.hp=Math.max(1,player.hp-2);showFloat('おなかが…HP-2',2,MSG_COLORS.warn);}}},
    b:{ label:'やめておく', apply(){ showFloat('けんめいな判断だ',2,MSG_COLORS.info); }}},
  { text:'こわれたハチの巣箱を見つけた。かつてミプリンの仲間が暮らしていた場所だ',
    a:{ label:'なおす (花粉-8)', apply(){ if(pollen>=8){pollen-=8;player.maxHp+=1;player.hp+=1;showFloat('最大HP+1！',2,MSG_COLORS.heal);}else{showFloat('花粉がたりない…',2,MSG_COLORS.warn);}}},
    b:{ label:'そのままにする', apply(){ pollen+=2; showFloat('ちかくで花粉を2つ見つけた',2,MSG_COLORS.info); }}},
  { text:'花の精霊のささやきが聞こえる… クリスタルの欠片が近くにあるのかもしれない',
    a:{ label:'みみをすます', apply(){ const b=pickBlessings()[0]; activeBlessings.push(b); b.apply(); showFloat(b.icon+' '+b.name+' を授かった！',2,MSG_COLORS.buff); }},
    b:{ label:'いそぐ', apply(){ player.speed+=15; showFloat('足が軽くなった！速度UP',2,MSG_COLORS.buff); }}},
  { text:'光る泉を見つけた！ 女王さまが魔力をこめた癒やしの泉だという言い伝えがある',
    a:{ label:'飲む', apply(){ player.maxHp+=1; player.hp=player.maxHp; showFloat('体が軽い！最大HP+1＆全回復！',2,MSG_COLORS.heal); }},
    b:{ label:'花粉を投げ入れる (花粉-3)', apply(){ if(pollen>=3){pollen-=3;player.atk+=1;player.atkRangeBonus+=10;showFloat('泉が光った！ATK+1 範囲+10',2,MSG_COLORS.buff);}else{showFloat('花粉がたりない…',2,MSG_COLORS.warn);}}}},
  { text:'道に宝箱が落ちている… 封印の番人が守っていた宝物かもしれない',
    a:{ label:'あける', apply(){ if(Math.random()>0.3){pollen+=8;showFloat('花粉を8つ見つけた！',2,MSG_COLORS.info);}else{player.hp=Math.max(1,player.hp-1);showFloat('罠だった！HP-1',2,MSG_COLORS.warn);}}},
    b:{ label:'無視する', apply(){ showFloat('用心に越したことはない',2,MSG_COLORS.info); }}},
  { text:'さまよう花の商人に出会った。クリスタルが砕ける前はこの道で賑やかに店を開いていたらしい',
    a:{ label:'取引する (花粉-6)', apply(){ if(pollen>=6){pollen-=6;player.atkSpeedBonus+=0.15;showFloat('攻撃速度+15%！',2,MSG_COLORS.buff);}else{showFloat('花粉がたりない…',2,MSG_COLORS.warn);}}},
    b:{ label:'話だけ聞く', apply(){ showFloat('いい情報を聞いた気がする…',2,MSG_COLORS.info); }}}
];

// ===== TREE STATE =====
let treeRows = [];       // [{nodes:[{type,x,y,conn:[]},...]},...] 2 rows
let treeCursor = {row:0, col:0};
let treeSelected = null;  // row0 selected node index
let eliteNext = false;
let currentEvent = null, eventPhase = 'choose';

// ===== TREE GENERATION =====
function pickNodeType(isBossNext) {
  // Boss前は battle/rest を高確率
  let types = NODE_TYPES;
  if (isBossNext) types = NODE_TYPES.map(t => ({...t, weight: (t.id==='battle'||t.id==='rest') ? t.weight*2 : t.weight}));
  const total = types.reduce((s,t) => s+t.weight, 0);
  let r = Math.random()*total, acc = 0;
  for (const t of types) { acc += t.weight; if (r < acc) return {...t}; }
  return {...types[0]};
}


// ===== NODE POSITIONS (for drawing) =====
const TREE_LAYOUT = {
  row0Y: 200, row1Y: 500,
  nodeW: 180, nodeH: 160,
  getX(col) { return CW/2 - 330 + col * 240; }
};

// ===== TREE DRAWING =====
function drawNodeMap() {
  if (gameState !== 'nodeSelect') return;
  ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, CW, CH);

  // Title
  ctx.fillStyle = '#ffd700'; ctx.font = "bold 30px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('🗺️ つぎの道をえらぼう', CW/2, 100);
  ctx.fillStyle = '#aaa'; ctx.font = "18px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(treeSelected === null ? '▲ 第1段を選んでね ▲' : '▼ 第2段を選んでね ▼', CW/2, 130);

  // Draw connections first (behind nodes)
  for (let i = 0; i < treeRows[0].nodes.length; i++) {
    const n0 = treeRows[0].nodes[i];
    const x0 = TREE_LAYOUT.getX(i) + TREE_LAYOUT.nodeW/2;
    const y0 = TREE_LAYOUT.row0Y + TREE_LAYOUT.nodeH;
    for (const ci of n0.conn) {
      const x1 = TREE_LAYOUT.getX(ci) + TREE_LAYOUT.nodeW/2;
      const y1 = TREE_LAYOUT.row1Y;
      // Highlight active connections
      const active = treeSelected === i;
      const available = treeSelected === null || active;
      ctx.strokeStyle = active ? n0.color : (available ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)');
      ctx.lineWidth = active ? 3 : 1;
      ctx.setLineDash(active ? [] : [6, 4]);
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Draw Row 0 nodes
  for (let i = 0; i < treeRows[0].nodes.length; i++) {
    const n = treeRows[0].nodes[i];
    const nx = TREE_LAYOUT.getX(i), ny = TREE_LAYOUT.row0Y;
    const sel = treeCursor.row === 0 && treeCursor.col === i;
    const done = treeSelected === i;
    const dimmed = treeSelected !== null && treeSelected !== i;
    drawNodeCard(n, nx, ny, sel, done, dimmed);
  }

  // Draw Row 1 nodes
  for (let i = 0; i < treeRows[1].nodes.length; i++) {
    const n = treeRows[1].nodes[i];
    const nx = TREE_LAYOUT.getX(i), ny = TREE_LAYOUT.row1Y;
    const sel = treeCursor.row === 1 && treeCursor.col === i;
    const reachable = treeSelected !== null && treeRows[0].nodes[treeSelected].conn.includes(i);
    const dimmed = treeSelected !== null && !reachable;
    const locked = treeSelected === null;
    drawNodeCard(n, nx, ny, sel, false, dimmed || locked);
  }

  // Controls hint
  ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = "18px 'M PLUS Rounded 1c', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText('← → : えらぶ   Z : けってい' + (treeSelected !== null ? '   X : もどる' : ''), CW/2, CH - 40);
  ctx.textAlign = 'left';
}

function drawNodeCard(n, x, y, selected, done, dimmed) {
  const w = TREE_LAYOUT.nodeW, h = TREE_LAYOUT.nodeH;
  ctx.save();
  if (dimmed) ctx.globalAlpha = 0.3;

  // Card background
  ctx.fillStyle = selected ? 'rgba(255,255,255,0.18)' : (done ? 'rgba(100,255,100,0.15)' : 'rgba(255,255,255,0.06)');
  ctx.fillRect(x, y, w, h);

  // Border
  ctx.strokeStyle = done ? '#2ecc71' : (selected ? n.color : 'rgba(255,255,255,0.25)');
  ctx.lineWidth = selected ? 4 : (done ? 3 : 1);
  ctx.strokeRect(x, y, w, h);

  // Pulse animation on selected
  if (selected) {
    const pulse = 0.08 * Math.sin(Date.now()/200);
    ctx.globalAlpha = (dimmed ? 0.3 : 1) * (0.15 + pulse);
    ctx.fillStyle = n.color;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = dimmed ? 0.3 : 1;
  }

  // Done checkmark
  if (done) {
    ctx.fillStyle = '#2ecc71'; ctx.font = "bold 24px 'M PLUS Rounded 1c', sans-serif";
    ctx.textAlign = 'right'; ctx.fillText('✓', x+w-8, y+24); ctx.textAlign = 'center';
  }

  // Icon
  ctx.font = "42px 'M PLUS Rounded 1c', sans-serif"; ctx.textAlign = 'center';
  ctx.fillStyle = '#fff'; ctx.fillText(n.icon, x+w/2, y+55);

  // Name
  ctx.fillStyle = n.color; ctx.font = "bold 20px 'M PLUS Rounded 1c', sans-serif";
  ctx.fillText(n.name, x+w/2, y+90);

  // Desc (word wrap)
  ctx.fillStyle = '#ccc'; ctx.font = "16px 'M PLUS Rounded 1c', sans-serif";
  const chars = n.desc.split('');
  let line = '', ly = y+115;
  for (const ch of chars) {
    line += ch;
    if (ctx.measureText(line).width > w-24) { ctx.fillText(line, x+w/2, ly); ly += 18; line = ''; }
  }
  if (line) ctx.fillText(line, x+w/2, ly);

  // Select prompt
  if (selected && !done) {
    ctx.fillStyle = n.color; ctx.font = "bold 18px 'M PLUS Rounded 1c', sans-serif";
    ctx.fillText('▶ Z ◀', x+w/2, y+h-12);
  }

  ctx.textAlign = 'left';
  ctx.restore();
}

// ===== NODE EXECUTION =====
function executeNode(node) {
  if (node.id === 'battle') { finishTree(); } else if (node.id === 'elite') {
    // Elite: filter rare+ blessings
    const rarePlus = BLESSING_POOL.filter(b => b.rarity === 'rare' || b.rarity === 'legend');
    const picks = [];
    const used = new Set();
    while (picks.length < 3 && picks.length < rarePlus.length) {
      const b = rarePlus[Math.floor(rng() * rarePlus.length)];
      if (!used.has(b.id)) { used.add(b.id); picks.push(b); }
    }
    blessingChoices = picks.length >= 3 ? picks : pickBlessings();
    selectCursor = 0;
    showFloat('💀 エリートクリア！レア祝福確定！', 2.5, MSG_COLORS.boss);
    gameState = 'dialog';
    showDialog('ミプリン', ['強敵を倒した！ すごい祝福がもらえるよ！'], function() { gameState = 'blessing'; });
  } else if (node.id === 'shop') {
    gameState = 'shop'; buildShop(); selectCursor = 0;
  } else if (node.id === 'rest') {
    const heal = Math.max(1, Math.ceil(player.maxHp * 0.3));
    player.hp = Math.min(player.hp + heal, player.maxHp);
    emitParticles(player.x + player.w/2, player.y + player.h/2, '#2ecc71', 15, 80, 0.5);
    showFloat('🌿 HP ' + heal + ' 回復！', 2, MSG_COLORS.heal);
    Audio.blessing();
    finishTree();
  } else if (node.id === 'event') {
    currentEvent = EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
    eventPhase = 'choose';
    treeCursor.col = 0;
    gameState = 'event';
  } else if (node.id === 'chest') {
    openChestNode();
  }
}

// ===== CHEST NODE =====
// 鍵なし: 40%罠(HP-2) / 60%通常開封
// 鍵あり: 必ず開封、祝福確率アップ(40%→60%)、鍵を消費
function _hasKey() {
  return player.consumables.some(c => c && c.id === 'chest_key');
}
function _consumeKey() {
  const idx = player.consumables.findIndex(c => c && c.id === 'chest_key');
  if (idx !== -1) player.consumables[idx] = null;
}

function openChestNode() {
  const hasKey = _hasKey();
  // 鍵なし: 40%で罠
  if (!hasKey && Math.random() < 0.40) {
    const dmg = 2;
    player.hp = Math.max(1, player.hp - dmg);
    emitParticles(player.x + player.w/2, player.y + player.h/2, '#e74c3c', 12, 90, 0.5);
    Audio.player_hit && Audio.player_hit();
    showDialog('ミプリン', ['宝箱をあけたら…', '💥 ブービートラップ！ HP-' + dmg + ' …', '🗝️ 鍵があれば安全に開けられるよ'], function() { finishTree(); });
    return;
  }
  // 鍵あり: 消費してボーナス判定
  if (hasKey) {
    _consumeKey();
    showFloat('🗝️ 鍵を使った！', 1.5, '#ffd700');
  }
  // 中身抽選（鍵あり: 祝福60% / 花粉30% / 消耗品10%、鍵なし: 祝福40% / 花粉35% / 消耗品25%）
  const roll = Math.random();
  const blessThresh = hasKey ? 0.60 : 0.40;
  const pollenThresh = hasKey ? 0.90 : 0.75;
  if (roll < blessThresh) {
    // 祝福（鍵あり: レジェンド優先プール、鍵なし: レア+プール）
    const topPool = BLESSING_POOL.filter(b => b.rarity === (hasKey ? 'legend' : 'rare') || b.rarity === 'legend');
    const rarePlus = BLESSING_POOL.filter(b => b.rarity === 'rare' || b.rarity === 'legend');
    const pool = (hasKey ? (topPool.length >= 1 ? topPool : rarePlus) : (rarePlus.length >= 3 ? rarePlus : BLESSING_POOL));
    const used = new Set(activeBlessings.map(b => b.id));
    const candidates = pool.filter(b => !used.has(b.id));
    const b = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : pickBlessings()[0];
    activeBlessings.push(b); b.apply();
    emitParticles(player.x + player.w/2, player.y + player.h/2, '#f1c40f', 20, 100, 0.6);
    Audio.blessing();
    const bonusMsg = hasKey ? '✨ 鍵のおかげでレア祝福確定！' : b.icon + ' ' + b.name + ' をゲット！';
    showDialog('ミプリン', ['宝箱をあけたよ！', bonusMsg], function() { finishTree(); });
  } else if (roll < pollenThresh) {
    // 花粉（鍵あり: +15〜25、鍵なし: +10〜15）
    const amt = hasKey ? 15 + Math.floor(Math.random() * 11) : 10 + Math.floor(Math.random() * 6);
    pollen += amt;
    emitParticles(player.x + player.w/2, player.y + player.h/2, '#f1c40f', 15, 80, 0.5);
    Audio.item_get();
    showDialog('ミプリン', ['宝箱をあけたよ！', '🌸 花粉が ' + amt + ' こ 入ってた！'], function() { finishTree(); });
  } else {
    // 消耗品
    const cdef = CONSUMABLE_DEFS[Math.floor(Math.random() * CONSUMABLE_DEFS.length)];
    const slot = player.consumables.indexOf(null);
    if (slot !== -1) {
      player.consumables[slot] = {...cdef};
      emitParticles(player.x + player.w/2, player.y + player.h/2, '#f1c40f', 15, 80, 0.5);
      Audio.item_get();
      showDialog('ミプリン', ['宝箱をあけたよ！', cdef.icon + ' ' + cdef.name + ' ゲット！'], function() { finishTree(); });
    } else {
      pollen += 8;
      emitParticles(player.x + player.w/2, player.y + player.h/2, '#f1c40f', 15, 80, 0.5);
      Audio.item_get();
      showDialog('ミプリン', ['宝箱をあけたよ！', 'カバンがいっぱい…花粉 8こ もらった！'], function() { finishTree(); });
    }
  }
}

function finishTree() {
  nextFloor();
}

// ===== UPDATE NODE SELECT =====
function updateNodeSelect() {
  if (treeSelected === null) {
    // Row 0 selection
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) { treeCursor.col = (treeCursor.col + 2) % 3; Audio.menu_move(); }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) { treeCursor.col = (treeCursor.col + 1) % 3; Audio.menu_move(); }
    if (wasPressed('KeyZ')) {
      treeSelected = treeCursor.col;
      treeCursor.row = 1;
      // Snap to first reachable node in row1
      treeCursor.col = treeRows[0].nodes[treeSelected].conn[0];
      Audio.menu_select();
    }
  } else {
    // Row 1 selection (only connected nodes)
    const conns = treeRows[0].nodes[treeSelected].conn;
    if (wasPressed('ArrowLeft') || wasPressed('KeyA')) {
      const idx = conns.indexOf(treeCursor.col);
      treeCursor.col = conns[(idx - 1 + conns.length) % conns.length];
      Audio.menu_move();
    }
    if (wasPressed('ArrowRight') || wasPressed('KeyD')) {
      const idx = conns.indexOf(treeCursor.col);
      treeCursor.col = conns[(idx + 1) % conns.length];
      Audio.menu_move();
    }
    if (wasPressed('KeyX')) {
      // Go back to row 0
      treeSelected = null;
      treeCursor.row = 0;
      Audio.menu_move();
    }
    if (wasPressed('KeyZ')) {
      Audio.menu_select();
      // Execute row0 node first, then row1
      const node0 = treeRows[0].nodes[treeSelected];
      const node1 = treeRows[1].nodes[treeCursor.col];
      // Execute row0 immediately (non-blocking types execute inline)
      executeRow0Then(node0, node1);
    }
  }
}

function executeRow0Then(node0, node1) {
  // For simplicity: row0 gives a minor bonus, row1 is the main action
  // Row0 bonus: small effect based on type
  if (node0.id === 'battle') { showFloat('⚔ 戦闘の気合！ ATK+1 (このフロア)', 2, MSG_COLORS.buff); player.atk += 1; }
  else if (node0.id === 'elite') { showFloat('💀 覚悟を決めた！ 攻撃範囲+15', 2, MSG_COLORS.buff); player.atkRangeBonus += 15; }
  else if (node0.id === 'shop') { pollen += 3; showFloat('🏪 道中で花粉+3 拾った', 2, MSG_COLORS.info); }
  else if (node0.id === 'rest') { const h = Math.max(1, Math.ceil(player.maxHp*0.15)); player.hp = Math.min(player.hp+h, player.maxHp); showFloat('🌿 小休止 HP+'+h, 1.5, MSG_COLORS.heal); }
  else if (node0.id === 'event') { showFloat('❓ 不思議な力を感じる… 速度+10', 1.5, MSG_COLORS.buff); player.speed += 10; }

  // Then execute row1 as the main node
  executeNode(node1);
}
