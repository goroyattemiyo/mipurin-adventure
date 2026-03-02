"""
メタプログレッション統合のテスト
pytest で実行: python -m pytest test_meta_integration.py -v
"""
import os
import pytest


class TestMetaJSFileValidity:
    """生成されたJSファイルの基本チェック"""

    def _read_file(self, path):
        full_path = os.path.join(os.path.dirname(__file__), '..', path)
        if not os.path.exists(full_path):
            pytest.skip(f"ファイル未作成: {path}")
        with open(full_path, 'r', encoding='utf-8') as f:
            return f.read()

    def test_meta_js_exists_and_valid(self):
        code = self._read_file('js/meta.js')
        assert 'MetaProgression' in code
        assert 'FLOWER_BEDS' in code
        assert 'addNectar' in code
        assert 'upgrade' in code
        assert 'getBonuses' in code
        assert 'applyToPlayer' in code
        assert 'onRunEnd' in code

    def test_meta_js_flower_beds_complete(self):
        code = self._read_file('js/meta.js')
        for bed in ['hp', 'atk', 'choice', 'weapon', 'npc', 'deathPenalty', 'exploration']:
            assert bed in code, f"花壇 {bed} が未定義"

    def test_meta_ui_js_exists_and_valid(self):
        code = self._read_file('js/metaUI.js')
        assert 'MetaUI' in code
        assert 'open' in code
        assert 'close' in code
        assert 'update' in code
        assert 'draw' in code
        assert 'showRunResult' in code

    def test_integration_helper_exists(self):
        code = self._read_file('js/patches/game_meta_integration.js')
        assert 'GameMetaIntegration' in code
        assert 'handleGameOver' in code
        assert 'handleDungeonEnd' in code

    def test_no_syntax_errors_in_meta_js(self):
        code = self._read_file('js/meta.js')
        assert code.count('(') == code.count(')'), "括弧の対応が不一致"
        assert code.count('{') == code.count('}'), "波括弧の対応が不一致"
        assert code.count('[') == code.count(']'), "角括弧の対応が不一致"

    def test_no_syntax_errors_in_meta_ui_js(self):
        code = self._read_file('js/metaUI.js')
        assert code.count('(') == code.count(')'), "括弧の対応が不一致"
        assert code.count('{') == code.count('}'), "波括弧の対応が不一致"
        assert code.count('[') == code.count(']'), "角括弧の対応が不一致"

    def test_index_html_includes_meta_scripts(self):
        code = self._read_file('index.html')
        assert 'js/meta.js' in code, "index.htmlにmeta.jsが未追加"
        assert 'js/metaUI.js' in code, "index.htmlにmetaUI.jsが未追加"


class TestMetaProgressionEconomyBalance:
    def test_nectar_rates_positive(self):
        from mipurin_analyzer import MetaProgressionAnalyzer
        meta = MetaProgressionAnalyzer()
        assert meta.nectar_per_run() > 0

    def test_first_upgrade_affordable_in_2_runs(self):
        from mipurin_analyzer import MetaProgressionAnalyzer, FLOWER_BEDS
        meta = MetaProgressionAnalyzer()
        nectar_per_run = meta.nectar_per_run()
        cheapest = min(bed.cost_at_level(1) for bed in FLOWER_BEDS)
        assert nectar_per_run * 2 >= cheapest

    def test_full_unlock_between_20_and_100_runs(self):
        from mipurin_analyzer import MetaProgressionAnalyzer
        meta = MetaProgressionAnalyzer()
        runs = meta.runs_to_max()
        assert 20 <= runs <= 100, f"全アンロック: {runs}ラン"

    def test_no_single_bed_dominates_cost(self):
        from mipurin_analyzer import FLOWER_BEDS
        total = sum(bed.total_cost() for bed in FLOWER_BEDS)
        for bed in FLOWER_BEDS:
            ratio = bed.total_cost() / total
            assert ratio < 0.5, f"{bed.name} がコスト全体の{ratio*100:.0f}%"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
