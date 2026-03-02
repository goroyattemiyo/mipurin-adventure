"""
スケーリング改善のテスト
pytest で実行: python -m pytest test_scaling_improved.py -v
"""
import os
import json
import subprocess
import pytest


class TestScalingJSChanges:
    """balance.js のスケーリング変更を検証"""

    def _read_file(self, path):
        full_path = os.path.join(os.path.dirname(__file__), '..', path)
        if not os.path.exists(full_path):
            pytest.skip(f"ファイル未作成: {path}")
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()

    def _run_node(self, script):
        setup = """
global.Scaling = { areaLevel: function(lv, area) { return lv; } };
var fs = require('fs');
var sc = fs.readFileSync('./js/scaling.js', 'utf8');
sc = sc.replace('const Scaling', 'global.Scaling');
eval(sc);
var bc = fs.readFileSync('./js/balance.js', 'utf8');
bc = bc.replace('const Balance', 'global.Balance');
eval(bc);
"""
        result = subprocess.run(
            ['node', '-e', setup + script],
            capture_output=True, text=True, timeout=10,
            cwd=os.path.join(os.path.dirname(__file__), '..')
        )
        if result.returncode != 0:
            pytest.fail(f"Node.js error: {result.stderr}")
        return result.stdout.strip()

    def test_balance_js_uses_log2(self):
        """balance.js がlog2ベーススケーリングを使用"""
        code = self._read_file('js/balance.js')
        assert 'Math.log2' in code, "対数スケーリング未適用"

    def test_balance_js_uses_sqrt(self):
        """balance.js がsqrtベーススケーリングを使用"""
        code = self._read_file('js/balance.js')
        assert 'Math.sqrt' in code, "平方根スケーリング未適用"

    def test_hp_scaling_monotonic(self):
        """HPスケーリングが単調増加"""
        out = self._run_node("""
var results = [];
var prev = 0;
for (var f = 0; f <= 30; f++) {
  var hp = Balance.dungeonEnemyHp(10, f);
  results.push({ floor: f, hp: hp, ok: hp >= prev });
  prev = hp;
}
console.log(JSON.stringify(results));
""")
        data = json.loads(out)
        for entry in data:
            assert entry['ok'], f"Floor {entry['floor']}: HP {entry['hp']} が前より小さい"

    def test_atk_scaling_monotonic(self):
        """ATKスケーリングが単調増加"""
        out = self._run_node("""
var results = [];
var prev = 0;
for (var f = 0; f <= 30; f++) {
  var atk = Balance.dungeonEnemyAtk(3, f);
  results.push({ floor: f, atk: atk, ok: atk >= prev });
  prev = atk;
}
console.log(JSON.stringify(results));
""")
        data = json.loads(out)
        for entry in data:
            assert entry['ok'], f"Floor {entry['floor']}: ATK {entry['atk']} が前より小さい"

    def test_hp_scaling_slower_than_linear_at_floor_30(self):
        """Floor 30で旧線形より緩やか"""
        out = self._run_node("""
var newHp = Balance.dungeonEnemyHp(10, 30);
var oldHp = Math.ceil(10 * (1 + 30 * 0.15));
console.log(JSON.stringify({ newHp: newHp, oldHp: oldHp }));
""")
        data = json.loads(out)
        assert data['newHp'] < data['oldHp'], \
            f"新HP({data['newHp']}) >= 旧HP({data['oldHp']}) → 改善されていない"

    def test_atk_scaling_slower_than_linear_at_floor_30(self):
        """Floor 30で旧線形より緩やか"""
        out = self._run_node("""
var newAtk = Balance.dungeonEnemyAtk(3, 30);
var oldAtk = Math.ceil(3 * (1 + 30 * 0.10));
console.log(JSON.stringify({ newAtk: newAtk, oldAtk: oldAtk }));
""")
        data = json.loads(out)
        assert data['newAtk'] < data['oldAtk'], \
            f"新ATK({data['newAtk']}) >= 旧ATK({data['oldAtk']}) → 改善されていない"

    def test_floor_0_returns_base(self):
        """Floor 0では基本値を返す"""
        out = self._run_node("""
var hp = Balance.dungeonEnemyHp(10, 0);
var atk = Balance.dungeonEnemyAtk(3, 0);
console.log(JSON.stringify({ hp: hp, atk: atk }));
""")
        data = json.loads(out)
        assert data['hp'] == 10, f"Floor 0 HP: {data['hp']} != 10"
        assert data['atk'] == 3, f"Floor 0 ATK: {data['atk']} != 3"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
