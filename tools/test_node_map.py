"""
ノードマップ生成のテスト
pytest で実行: python -m pytest test_node_map.py -v
"""
import os
import re
import pytest


class TestNodeMapJSValidity:
    """nodeMap.js の構文・構造チェック"""

    def _read_file(self, path):
        full_path = os.path.join(os.path.dirname(__file__), '..', path)
        if not os.path.exists(full_path):
            pytest.skip(f"ファイル未作成: {path}")
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()

    def test_node_map_js_exists(self):
        code = self._read_file('js/nodeMap.js')
        assert 'NodeMap' in code

    def test_node_map_has_required_functions(self):
        code = self._read_file('js/nodeMap.js')
        required = [
            'generateStage', 'start', 'advanceStage',
            'getAvailableNextNodes', 'moveToNode',
            'clearCurrentNode', 'getCurrentNode',
            'getCurrentStage', 'isActive', 'end'
        ]
        for fn in required:
            assert fn in code, f"必須関数 {fn} が未定義"

    def test_node_types_complete(self):
        """7種のノードタイプが定義されている"""
        code = self._read_file('js/nodeMap.js')
        types = ['start', 'combat', 'elite', 'shop', 'event', 'treasure', 'rest', 'boss']
        for t in types:
            assert t in code, f"ノードタイプ {t} が未定義"

    def test_brackets_balanced(self):
        code = self._read_file('js/nodeMap.js')
        assert code.count('(') == code.count(')'), "括弧不一致"
        assert code.count('{') == code.count('}'), "波括弧不一致"
        assert code.count('[') == code.count(']'), "角括弧不一致"

    def test_node_map_ui_exists(self):
        code = self._read_file('js/nodeMapUI.js')
        assert 'NodeMapUI' in code

    def test_node_map_ui_has_required_functions(self):
        code = self._read_file('js/nodeMapUI.js')
        required = ['open', 'close', 'isOpen', 'update', 'draw']
        for fn in required:
            assert fn in code, f"必須関数 {fn} が未定義"

    def test_node_map_ui_brackets_balanced(self):
        code = self._read_file('js/nodeMapUI.js')
        assert code.count('(') == code.count(')'), "括弧不一致"
        assert code.count('{') == code.count('}'), "波括弧不一致"
        assert code.count('[') == code.count(']'), "角括弧不一致"

    def test_index_html_includes_node_map(self):
        code = self._read_file('index.html')
        assert 'js/nodeMap.js' in code, "index.htmlにnodeMap.js未追加"
        assert 'js/nodeMapUI.js' in code, "index.htmlにnodeMapUI.js未追加"


class TestNodeMapGeneration:
    """Node.jsでnodeMap.jsの生成ロジックをテスト"""

    def _run_node(self, script):
        """Node.jsスクリプトを実行して出力を返す"""
        import subprocess
        full_script = """
global.CONFIG = { SCALE: 2, CANVAS_WIDTH: 960, CANVAS_HEIGHT: 720,
  FONT_LG: 24, FONT_BASE: 16, FONT_SM: 12, TILE_SIZE: 32 };
var fs = require('fs');
var code = fs.readFileSync('./js/nodeMap.js', 'utf8');
code = code.replace('const NodeMap', 'global.NodeMap');
eval(code);
""" + script
        result = subprocess.run(
            ['node', '-e', full_script],
            capture_output=True, text=True, timeout=10,
            cwd=os.path.join(os.path.dirname(__file__), '..')
        )
        if result.returncode != 0:
            pytest.fail(f"Node.js error: {result.stderr}")
        return result.stdout.strip()

    def test_generate_stage_returns_data(self):
        """ステージ生成がデータを返す"""
        out = self._run_node("""
var stage = NodeMap.generateStage(0, 12345);
console.log(JSON.stringify({
  layers: stage.layers.length,
  totalNodes: stage.totalNodes,
  firstType: stage.layers[0][0].type,
  lastType: stage.layers[stage.layers.length-1][0].type
}));
""")
        import json
        data = json.loads(out)
        assert data['layers'] >= 6, f"層数が少なすぎ: {data['layers']}"
        assert data['layers'] <= 9, f"層数が多すぎ: {data['layers']}"
        assert data['firstType'] == 'start'
        assert data['lastType'] == 'boss'

    def test_all_nodes_reachable(self):
        """全ノードがスタートから到達可能"""
        out = self._run_node("""
var stage = NodeMap.generateStage(0, 99999);
var reachable = new Set();
var queue = [stage.layers[0][0].id];
reachable.add(queue[0]);
while (queue.length > 0) {
  var nid = queue.shift();
  var node = stage.allNodes[nid];
  if (!node) continue;
  for (var i = 0; i < node.connections.length; i++) {
    if (!reachable.has(node.connections[i])) {
      reachable.add(node.connections[i]);
      queue.push(node.connections[i]);
    }
  }
}
var allIds = Object.keys(stage.allNodes);
var unreachable = allIds.filter(function(id) { return !reachable.has(id); });
console.log(JSON.stringify({ total: allIds.length, reachable: reachable.size, unreachable: unreachable }));
""")
        import json
        data = json.loads(out)
        assert data['reachable'] == data['total'], \
            f"到達不能ノードあり: {data['unreachable']}"

    def test_boss_always_reachable(self):
        """ボスノードが常に到達可能（10回生成して確認）"""
        out = self._run_node("""
var results = [];
for (var s = 0; s < 10; s++) {
  var stage = NodeMap.generateStage(0, s * 1000 + 42);
  var bossId = stage.layers[stage.layers.length - 1][0].id;
  var reachable = new Set();
  var queue = [stage.layers[0][0].id];
  reachable.add(queue[0]);
  while (queue.length > 0) {
    var nid = queue.shift();
    var node = stage.allNodes[nid];
    if (!node) continue;
    for (var i = 0; i < node.connections.length; i++) {
      if (!reachable.has(node.connections[i])) {
        reachable.add(node.connections[i]);
        queue.push(node.connections[i]);
      }
    }
  }
  results.push(reachable.has(bossId));
}
console.log(JSON.stringify(results));
""")
        import json
        data = json.loads(out)
        assert all(data), f"ボス到達不能なケースあり: {data}"

    def test_node_type_distribution(self):
        """ノードタイプの分布が偏りすぎていない（100ステージ統計）"""
        out = self._run_node("""
var counts = {};
for (var s = 0; s < 100; s++) {
  var stage = NodeMap.generateStage(0, s * 777);
  for (var id in stage.allNodes) {
    var type = stage.allNodes[id].type;
    counts[type] = (counts[type] || 0) + 1;
  }
}
console.log(JSON.stringify(counts));
""")
        import json
        data = json.loads(out)
        # 戦闘が最多であるべき
        assert data.get('combat', 0) > data.get('treasure', 0), \
            "戦闘ノードが宝箱より少ない"
        # ボスとスタートは各100個（1ステージ1個）
        assert data.get('boss', 0) == 100
        assert data.get('start', 0) == 100

    def test_movement_works(self):
        """start → moveToNode が正常動作"""
        out = self._run_node("""
NodeMap.start(12345);
var current = NodeMap.getCurrentNode();
var avail = NodeMap.getAvailableNextNodes();
var moved = false;
if (avail.length > 0) {
  moved = NodeMap.moveToNode(avail[0].id);
}
var after = NodeMap.getCurrentNode();
console.log(JSON.stringify({
  startType: current.type,
  availCount: avail.length,
  moved: moved,
  afterType: after.type
}));
""")
        import json
        data = json.loads(out)
        assert data['startType'] == 'start'
        assert data['availCount'] > 0
        assert data['moved'] is True
        assert data['afterType'] != 'start'


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
