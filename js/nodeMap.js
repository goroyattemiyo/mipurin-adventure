/**
 * nodeMap.js - ノードマップ方式ダンジョン構造
 * ミプリンの冒険 v1.2.0
 *
 * 巣窟モードで「次にどの部屋に進むか」を選択させる。
 * Slay the Spire / Hades 風の分岐マップ。
 *
 * 構造:
 *   Layer 0: スタート（1ノード）
 *   Layer 1~N: 2-3分岐のノード
 *   最終Layer: ボス（1ノード、全ルート収束）
 */
const NodeMap = (() => {

  /* ============ ノードタイプ定義 ============ */
  var NODE_TYPES = {
    start:    { id: 'start',    icon: '🏠', weight: 0,    label: 'スタート',   color: '#F5A623' },
    combat:   { id: 'combat',   icon: '⚔️',  weight: 0.45, label: '戦闘',       color: '#e74c3c' },
    elite:    { id: 'elite',    icon: '💀', weight: 0.15, label: 'エリート',   color: '#8e44ad' },
    shop:     { id: 'shop',     icon: '🏪', weight: 0.10, label: 'ショップ',   color: '#e67e22' },
    event:    { id: 'event',    icon: '❓', weight: 0.10, label: 'イベント',   color: '#3498db' },
    treasure: { id: 'treasure', icon: '💎', weight: 0.05, label: '宝箱',       color: '#f1c40f' },
    rest:     { id: 'rest',     icon: '🌿', weight: 0.10, label: '休憩',       color: '#27ae60' },
    boss:     { id: 'boss',     icon: '👑', weight: 0,    label: 'ボス',       color: '#c0392b' }
  };

  /* ============ 状態 ============ */
  var _stages = [];        // 全ステージのノードマップ配列
  var _currentStage = 0;   // 現在のステージ番号
  var _currentNodeId = null;  // 現在いるノードID
  var _visitedNodes = new Set();
  var _active = false;

  /* ============ Mulberry32 PRNG ============ */
  function _mulberry32(seed) {
    var a = seed >>> 0;
    return function() {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ============ ステージ生成 ============ */
  /**
   * 1ステージ分のノードマップを生成
   * @param {number} stageIndex - ステージ番号(0-based)
   * @param {number} seed - 乱数シード
   * @returns {Object} { stageIndex, layers, allNodes }
   */
  function generateStage(stageIndex, seed) {
    var rng = _mulberry32((seed || Date.now()) + stageIndex * 7919);
    var middleCount = 4 + Math.floor(rng() * 3); // 中間層4-6 → 合計6-8ノード層
    var layers = [];
    var allNodes = {};
    var nodeIdCounter = 0;

    // Layer 0: スタート
    var startNode = _createNode(nodeIdCounter++, 'start', 0, 0);
    layers.push([startNode]);
    allNodes[startNode.id] = startNode;

    // Layer 1~middleCount: 中間ノード
    for (var i = 0; i < middleCount; i++) {
      var width = 2 + Math.floor(rng() * 2); // 2-3ノード/層
      var layer = [];
      for (var j = 0; j < width; j++) {
        var type = _rollNodeType(rng, i, middleCount, stageIndex);
        var node = _createNode(nodeIdCounter++, type, i + 1, j);
        layer.push(node);
        allNodes[node.id] = node;
      }
      layers.push(layer);
    }

    // 最終Layer: ボス
    var bossNode = _createNode(nodeIdCounter++, 'boss', middleCount + 1, 0);
    layers.push([bossNode]);
    allNodes[bossNode.id] = bossNode;

    // 接続生成
    _generateConnections(layers, rng);

    // 到達可能性検証・修復
    _ensureAllReachable(layers);

    return {
      stageIndex: stageIndex,
      layers: layers,
      allNodes: allNodes,
      totalNodes: nodeIdCounter
    };
  }

  function _createNode(id, type, layerIdx, posInLayer) {
    return {
      id: 'node_' + id,
      type: type,
      layerIdx: layerIdx,
      posInLayer: posInLayer,
      connections: [],   // 次の層への接続先ノードID
      cleared: false,
      reward: null,
      x: 0,             // UI用座標（nodeMapUI.jsで設定）
      y: 0
    };
  }

  /**
   * ノードタイプをウェイトベースでロール
   * ステージ進行に応じて出現率を調整
   */
  function _rollNodeType(rng, layerIdx, totalLayers, stageIndex) {
    var progress = layerIdx / totalLayers;
    var types = [];
    var weights = [];

    for (var key in NODE_TYPES) {
      if (key === 'start' || key === 'boss') continue;
      var t = NODE_TYPES[key];
      var w = t.weight;

      // 序盤: エリート抑制、戦闘多め
      if (key === 'elite' && progress < 0.3) w *= 0.3;
      if (key === 'combat' && progress < 0.3) w *= 1.3;

      // 中盤: ショップ・イベント増加
      if (key === 'shop' && progress > 0.3 && progress < 0.7) w *= 1.5;
      if (key === 'event' && progress > 0.2 && progress < 0.8) w *= 1.3;

      // 終盤: 休憩増加、エリート増加
      if (key === 'rest' && progress > 0.6) w *= 2.0;
      if (key === 'elite' && progress > 0.5) w *= 1.5;

      // 高ステージ: エリート・戦闘比率UP
      if (stageIndex > 2 && (key === 'elite' || key === 'combat')) w *= 1.2;

      types.push(key);
      weights.push(w);
    }

    var totalWeight = 0;
    for (var i = 0; i < weights.length; i++) totalWeight += weights[i];

    var roll = rng() * totalWeight;
    for (var i = 0; i < types.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return types[i];
    }
    return 'combat';
  }

  /**
   * 層間の接続を生成
   * 各ノードから次の層の1-2ノードへ接続
   */
  function _generateConnections(layers, rng) {
    for (var i = 0; i < layers.length - 1; i++) {
      var currentLayer = layers[i];
      var nextLayer = layers[i + 1];

      for (var j = 0; j < currentLayer.length; j++) {
        var node = currentLayer[j];
        // 1-2接続（最終層手前は全て収束）
        var maxConn = (i === layers.length - 2) ? nextLayer.length : Math.min(nextLayer.length, 1 + Math.floor(rng() * 2));

        // 位置に基づいて近いノードを優先接続（クロスしすぎない）
        var candidates = [];
        for (var k = 0; k < nextLayer.length; k++) {
          candidates.push({ idx: k, dist: Math.abs(j - k) });
        }
        candidates.sort(function(a, b) { return a.dist - b.dist; });

        var connCount = Math.min(maxConn, candidates.length);
        // 近いものから優先だが、少しランダム性を持たせる
        for (var c = 0; c < connCount; c++) {
          var targetIdx = candidates[c].idx;
          var targetId = nextLayer[targetIdx].id;
          if (node.connections.indexOf(targetId) === -1) {
            node.connections.push(targetId);
          }
        }
      }
    }
  }

  /**
   * 全ノードが到達可能か検証し、孤立ノードを修復
   */
  function _ensureAllReachable(layers) {
    for (var i = 1; i < layers.length; i++) {
      var prevLayer = layers[i - 1];
      var currentLayer = layers[i];

      for (var j = 0; j < currentLayer.length; j++) {
        var nodeId = currentLayer[j].id;
        var isReachable = false;

        for (var k = 0; k < prevLayer.length; k++) {
          if (prevLayer[k].connections.indexOf(nodeId) !== -1) {
            isReachable = true;
            break;
          }
        }

        if (!isReachable) {
          // 最も近い前層ノードから接続追加
          var bestIdx = 0;
          var bestDist = Infinity;
          for (var k = 0; k < prevLayer.length; k++) {
            var dist = Math.abs(k - j);
            if (dist < bestDist) { bestDist = dist; bestIdx = k; }
          }
          prevLayer[bestIdx].connections.push(nodeId);
        }
      }
    }
  }

  /* ============ ゲーム操作 ============ */

  /** ノードマップモード開始 */
  function start(seed) {
    _stages = [];
    _currentStage = 0;
    _currentNodeId = null;
    _visitedNodes = new Set();
    _active = true;

    var stage = generateStage(0, seed || Date.now());
    _stages.push(stage);
    _currentNodeId = stage.layers[0][0].id;
    _visitedNodes.add(_currentNodeId);
    stage.allNodes[_currentNodeId].cleared = true;
  }

  /** 次のステージへ（ボスクリア後） */
  function advanceStage(seed) {
    _currentStage++;
    var stage = generateStage(_currentStage, seed || (Date.now() + _currentStage));
    _stages.push(stage);
    _currentNodeId = stage.layers[0][0].id;
    _visitedNodes.add(_currentNodeId);
    stage.allNodes[_currentNodeId].cleared = true;
    return stage;
  }

  /** 現在のノードから移動可能な次ノード一覧 */
  function getAvailableNextNodes() {
    if (!_active || !_currentNodeId) return [];
    var stage = _stages[_currentStage];
    if (!stage) return [];

    var currentNode = stage.allNodes[_currentNodeId];
    if (!currentNode) return [];

    var available = [];
    for (var i = 0; i < currentNode.connections.length; i++) {
      var nextId = currentNode.connections[i];
      var nextNode = stage.allNodes[nextId];
      if (nextNode) {
        available.push(nextNode);
      }
    }
    return available;
  }

  /** ノードに移動 */
  function moveToNode(nodeId) {
    if (!_active) return false;
    var stage = _stages[_currentStage];
    if (!stage) return false;

    var currentNode = stage.allNodes[_currentNodeId];
    if (!currentNode) return false;

    // 接続先か確認
    if (currentNode.connections.indexOf(nodeId) === -1) return false;

    _currentNodeId = nodeId;
    _visitedNodes.add(nodeId);
    return true;
  }

  /** 現在のノードをクリア済みにする */
  function clearCurrentNode() {
    if (!_active || !_currentNodeId) return;
    var stage = _stages[_currentStage];
    if (!stage) return;
    var node = stage.allNodes[_currentNodeId];
    if (node) node.cleared = true;
  }

  /** 現在のノード情報を取得 */
  function getCurrentNode() {
    if (!_active || !_currentNodeId) return null;
    var stage = _stages[_currentStage];
    if (!stage) return null;
    return stage.allNodes[_currentNodeId] || null;
  }

  /** 現在のステージデータを取得 */
  function getCurrentStage() {
    return _stages[_currentStage] || null;
  }

  /** ノードマップが有効か */
  function isActive() { return _active; }

  /** 終了 */
  function end() { _active = false; }

  /** ステージ番号取得 */
  function getStageIndex() { return _currentStage; }

  /** 訪問済みノードか */
  function isVisited(nodeId) { return _visitedNodes.has(nodeId); }

  /** 現在ノードがボスか */
  function isCurrentBoss() {
    var node = getCurrentNode();
    return node && node.type === 'boss';
  }

  /** ノードタイプ定義を公開 */
  function getNodeTypes() { return NODE_TYPES; }

  return {
    NODE_TYPES: NODE_TYPES,
    generateStage: generateStage,
    start: start,
    advanceStage: advanceStage,
    getAvailableNextNodes: getAvailableNextNodes,
    moveToNode: moveToNode,
    clearCurrentNode: clearCurrentNode,
    getCurrentNode: getCurrentNode,
    getCurrentStage: getCurrentStage,
    isActive: isActive,
    end: end,
    getStageIndex: getStageIndex,
    isVisited: isVisited,
    isCurrentBoss: isCurrentBoss,
    getNodeTypes: getNodeTypes
  };
})();
