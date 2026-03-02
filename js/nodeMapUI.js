/**
 * nodeMapUI.js - ノードマップ画面の描画と操作
 * ミプリンの冒険 v1.2.0
 */
const NodeMapUI = (() => {
  var S = CONFIG.SCALE;
  var PX = function(v) { return v * S; };

  var _open = false;
  var _cursor = 0;       // 選択中のノードインデックス
  var _animTimer = 0;
  var _scrollY = 0;

  function open() {
    _open = true;
    _cursor = 0;
    _animTimer = 0;
    _scrollY = 0;
  }

  function close() { _open = false; }
  function isOpen() { return _open; }

  function update() {
    if (!_open) return null;
    _animTimer += 1 / 60;

    var available = NodeMap.getAvailableNextNodes();
    if (available.length === 0) return null;

    // カーソル移動
    if (Engine.consumePress('left') || Engine.consumePress('up')) {
      _cursor = (_cursor - 1 + available.length) % available.length;
      Audio.playSe('menu_move');
    }
    if (Engine.consumePress('right') || Engine.consumePress('down')) {
      _cursor = (_cursor + 1) % available.length;
      Audio.playSe('menu_move');
    }

    // 決定
    if (Engine.consumePress('interact') || Engine.consumePress('attack') || Engine.consumeClick()) {
      var selectedNode = available[_cursor];
      if (selectedNode) {
        NodeMap.moveToNode(selectedNode.id);
        Audio.playSe('menu_select');
        _cursor = 0;
        return { action: 'move', node: selectedNode };
      }
    }

    return null;
  }

  function draw(ctx) {
    if (!_open) return;

    var W = CONFIG.CANVAS_WIDTH;
    var H = CONFIG.CANVAS_HEIGHT;
    var stage = NodeMap.getCurrentStage();
    if (!stage) return;

    // 背景
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    // タイトル
    ctx.fillStyle = '#F5A623';
    ctx.font = 'bold ' + CONFIG.FONT_LG + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('巣窟 B' + (NodeMap.getStageIndex() + 1) + 'F', W / 2, PX(45));

    var layers = stage.layers;
    var layerCount = layers.length;
    var mapH = H - PX(140);
    var mapY = PX(70);
    var layerSpacing = mapH / Math.max(1, layerCount - 1);

    // レイアウト計算（各ノードにx,y座標を設定）
    for (var i = 0; i < layers.length; i++) {
      var layer = layers[i];
      var y = mapY + i * layerSpacing;
      var nodeSpacing = W / (layer.length + 1);
      for (var j = 0; j < layer.length; j++) {
        layer[j].x = nodeSpacing * (j + 1);
        layer[j].y = y;
      }
    }

    // 接続線描画
    for (var i = 0; i < layers.length - 1; i++) {
      for (var j = 0; j < layers[i].length; j++) {
        var node = layers[i][j];
        for (var c = 0; c < node.connections.length; c++) {
          var targetNode = stage.allNodes[node.connections[c]];
          if (!targetNode) continue;

          var isPath = NodeMap.isVisited(node.id) && NodeMap.isVisited(targetNode.id);
          var isOption = (node.id === NodeMap.getCurrentNode().id);

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(targetNode.x, targetNode.y);

          if (isPath) {
            ctx.strokeStyle = '#F5A623';
            ctx.lineWidth = PX(3);
          } else if (isOption) {
            ctx.strokeStyle = 'rgba(245, 166, 35, 0.5)';
            ctx.lineWidth = PX(2);
          } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = PX(1);
          }
          ctx.stroke();
        }
      }
    }

    // ノード描画
    var currentNode = NodeMap.getCurrentNode();
    var available = NodeMap.getAvailableNextNodes();
    var availableIds = {};
    for (var i = 0; i < available.length; i++) {
      availableIds[available[i].id] = i;
    }

    for (var i = 0; i < layers.length; i++) {
      for (var j = 0; j < layers[i].length; j++) {
        var node = layers[i][j];
        var typeDef = NodeMap.NODE_TYPES[node.type] || NodeMap.NODE_TYPES.combat;
        var isCurrent = (currentNode && node.id === currentNode.id);
        var isAvailable = (availableIds[node.id] !== undefined);
        var isSelected = isAvailable && availableIds[node.id] === _cursor;
        var visited = NodeMap.isVisited(node.id);

        var radius = PX(20);

        // 選択中ハイライト（脈動）
        if (isSelected) {
          var pulse = 1 + Math.sin(_animTimer * 6) * 0.15;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius * pulse + PX(6), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(245, 166, 35, 0.3)';
          ctx.fill();
        }

        // ノード本体
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);

        if (isCurrent) {
          ctx.fillStyle = '#F5A623';
        } else if (visited) {
          ctx.fillStyle = '#555';
        } else if (isAvailable) {
          ctx.fillStyle = typeDef.color || '#666';
        } else {
          ctx.fillStyle = '#2a2a2a';
        }
        ctx.fill();

        // 枠線
        ctx.strokeStyle = isSelected ? '#FFD700' : (isCurrent ? '#fff' : '#444');
        ctx.lineWidth = isSelected ? PX(3) : PX(1);
        ctx.stroke();

        // アイコン
        ctx.fillStyle = isCurrent || isAvailable ? '#fff' : '#666';
        ctx.font = PX(18) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typeDef.icon, node.x, node.y);

        // クリア済みチェック
        if (node.cleared && !isCurrent) {
          ctx.fillStyle = 'rgba(39, 174, 96, 0.7)';
          ctx.font = PX(14) + 'px monospace';
          ctx.fillText('✓', node.x + radius * 0.7, node.y - radius * 0.7);
        }
      }
    }

    // 選択中ノード情報
    if (available.length > 0 && _cursor < available.length) {
      var sel = available[_cursor];
      var selType = NodeMap.NODE_TYPES[sel.type] || NodeMap.NODE_TYPES.combat;

      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(PX(40), H - PX(90), W - PX(80), PX(60));
      ctx.strokeStyle = selType.color || '#F5A623';
      ctx.lineWidth = PX(2);
      ctx.strokeRect(PX(40), H - PX(90), W - PX(80), PX(60));

      ctx.fillStyle = selType.color || '#fff';
      ctx.font = 'bold ' + CONFIG.FONT_BASE + 'px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selType.icon + ' ' + selType.label, W / 2, H - PX(68));

      ctx.fillStyle = '#aaa';
      ctx.font = CONFIG.FONT_SM + 'px monospace';
      ctx.fillText(_getNodeDescription(sel.type), W / 2, H - PX(48));
    }

    // 操作説明
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = CONFIG.FONT_SM + 'px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('←→: えらぶ　Z/Enter: すすむ', W / 2, H - PX(15));
  }

  function _getNodeDescription(type) {
    var descs = {
      combat: '敵2-4体と戦闘。祝福を獲得できる。',
      elite: '強敵と戦闘。レア祝福確定ドロップ。',
      shop: '花粉でアイテムを購入できる。',
      event: '選択式のランダムイベント。',
      treasure: '装備アイテム確定ドロップ。',
      rest: 'HPを回復、または祝福を強化。',
      boss: 'ステージボスとの決戦。'
    };
    return descs[type] || '';
  }

  return {
    open: open, close: close, isOpen: isOpen,
    update: update, draw: draw
  };
})();
