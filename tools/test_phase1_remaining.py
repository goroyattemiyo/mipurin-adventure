import os
import re
import subprocess
import json
import pytest

ROOT = os.path.join(os.path.dirname(__file__), "..")
JS_DIR = os.path.join(ROOT, "js")

def read_js(name):
    path = os.path.join(JS_DIR, name)
    assert os.path.exists(path), f"{name} not found"
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def check_balanced(code, filename):
    for o, c, label in [("(",")", "paren"), ("{","}", "brace"), ("[","]", "bracket")]:
        assert code.count(o) == code.count(c), f"{filename}: {label} mismatch {code.count(o)} vs {code.count(c)}"


class TestBlessingsExpansion:
    def test_blessings_js_exists(self):
        assert os.path.exists(os.path.join(JS_DIR, "blessings.js"))

    def test_total_blessings_78(self):
        code = read_js("blessings.js")
        ids = re.findall(r"id:'([^']+)'", code)
        blessing_ids = [i for i in ids if not i.startswith("duo_")]
        assert len(blessing_ids) == 78, f"count={len(blessing_ids)}"

    def test_duo_blessings_15(self):
        code = read_js("blessings.js")
        duo_ids = re.findall(r"id:'(duo_\d+)'", code)
        assert len(duo_ids) == 15, f"duo count={len(duo_ids)}"

    def test_six_families_present(self):
        code = read_js("blessings.js")
        for f in ["rose", "lily", "sunflower", "wisteria", "lotus", "chrysanthemum"]:
            assert f"family:'{f}'" in code, f"family {f} missing"

    def test_legendaries_exist(self):
        code = read_js("blessings.js")
        count = len(re.findall(r"rarity:'legendary'", code))
        assert count >= 6, f"legendary count={count}"

    def test_duo_detection_function(self):
        code = read_js("blessings.js")
        assert "_checkDuoActivation" in code

    def test_blessings_brackets_balanced(self):
        check_balanced(read_js("blessings.js"), "blessings.js")

    def test_blessing_ui_legendary_support(self):
        code = read_js("blessingUI.js")
        assert "legendary" in code
        assert "showDuoNotification" in code

    def test_blessing_ui_brackets_balanced(self):
        check_balanced(read_js("blessingUI.js"), "blessingUI.js")


class TestEnemyAI:
    def test_enemy_ai_js_exists(self):
        assert os.path.exists(os.path.join(JS_DIR, "enemyAI.js"))

    def test_has_original_patterns(self):
        code = read_js("enemyAI.js")
        for p in ["wander", "chase", "ambush", "explode", "swoop", "burrow", "root_attack", "dive"]:
            assert p in code, f"pattern {p} missing"

    def test_has_new_patterns(self):
        code = read_js("enemyAI.js")
        for p in ["patrol", "sniper", "shield", "summoner"]:
            assert p in code, f"new pattern {p} missing"

    def test_has_telegraph(self):
        code = read_js("enemyAI.js")
        assert "drawTelegraph" in code
        assert "_telegraphTimer" in code

    def test_has_vulnerable_indicator(self):
        code = read_js("enemyAI.js")
        assert "isVulnerable" in code
        assert "drawVulnerableIndicator" in code

    def test_state_machine_functions(self):
        code = read_js("enemyAI.js")
        assert "initEnemy" in code
        assert "updateEnemy" in code

    def test_counterplay_states(self):
        code = read_js("enemyAI.js")
        found = sum(1 for s in ["recover", "pause", "stun", "relocate"] if f"'{s}'" in code)
        assert found >= 3, f"counterplay states={found}"

    def test_enemy_ai_brackets_balanced(self):
        check_balanced(read_js("enemyAI.js"), "enemyAI.js")


class TestUIHelper:
    def test_ui_helper_js_exists(self):
        assert os.path.exists(os.path.join(JS_DIR, "uiHelper.js"))

    def test_has_hud_regions(self):
        code = read_js("uiHelper.js")
        for fn in ["drawTopLeft", "drawTopRight", "drawBottomLeft", "drawBottomRight"]:
            assert fn in code, f"{fn} missing"

    def test_has_unified_draw(self):
        assert "drawHUD" in read_js("uiHelper.js")

    def test_has_drop_log(self):
        code = read_js("uiHelper.js")
        assert "addDropLog" in code
        assert "updateDropLog" in code

    def test_has_tooltip(self):
        assert "drawTooltip" in read_js("uiHelper.js")

    def test_ui_helper_brackets_balanced(self):
        check_balanced(read_js("uiHelper.js"), "uiHelper.js")


class TestHTMLIntegration:
    def test_index_includes_enemy_ai(self):
        with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        assert "enemyAI.js" in html

    def test_index_includes_ui_helper(self):
        with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        assert "uiHelper.js" in html

    def test_enemy_ai_before_battle(self):
        with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        assert html.find("enemyAI.js") < html.find("battle.js")


class TestNodeJSRuntime:
    def _run_node(self, script):
        return subprocess.run(
            ["node", "-e", script],
            capture_output=True, text=True, timeout=10, cwd=ROOT
        )

    def test_blessings_count_runtime(self):
        script = (
            'global.window={};'
            'global.CONFIG={TILE_SIZE:64,FONT_BASE:32,FONT_SM:24,FONT_LG:48};'
            'var fs=require("fs");'
            'eval(fs.readFileSync("./js/blessings.js","utf8"));'
            'var b=window.Blessings;'
            'console.log(JSON.stringify({b:b.BLESSING_DATA.length,d:b.DUO_BLESSINGS.length}));'
        )
        r = self._run_node(script)
        assert r.returncode == 0, r.stderr
        data = json.loads(r.stdout.strip())
        assert data["b"] == 78
        assert data["d"] == 15

    def test_enemy_ai_patterns_runtime(self):
        script = (
            'global.window={};'
            'global.CONFIG={TILE_SIZE:64};'
            'global.MapManager={isSolid:function(){return false}};'
            'global.Particles={emit:function(){}};'
            'var fs=require("fs");'
            'eval(fs.readFileSync("./js/enemyAI.js","utf8"));'
            'var ai=window.EnemyAI;'
            'console.log(JSON.stringify({c:ai.getPatternNames().length}));'
        )
        r = self._run_node(script)
        assert r.returncode == 0, r.stderr
        data = json.loads(r.stdout.strip())
        assert data["c"] >= 12

    def test_duo_activation_runtime(self):
        script = (
            'global.window={};'
            'global.CONFIG={TILE_SIZE:64,FONT_BASE:32,FONT_SM:24,FONT_LG:48};'
            'var fs=require("fs");'
            'eval(fs.readFileSync("./js/blessings.js","utf8"));'
            'var b=window.Blessings;'
            'b.resetBlessings();'
            'b.applyBlessing(b.BLESSING_DATA[0],{});'
            'b.applyBlessing(b.BLESSING_DATA[13],{});'
            'console.log(JSON.stringify({d:b.getActiveDuos().length}));'
        )
        r = self._run_node(script)
        assert r.returncode == 0, r.stderr
        data = json.loads(r.stdout.strip())
        assert data["d"] >= 1

    def test_enemy_ai_state_machine_runtime(self):
        script = (
            'global.window={};'
            'global.CONFIG={TILE_SIZE:64};'
            'global.MapManager={isSolid:function(){return false}};'
            'global.Particles={emit:function(){}};'
            'var fs=require("fs");'
            'eval(fs.readFileSync("./js/enemyAI.js","utf8"));'
            'var ai=window.EnemyAI;'
            'var e={x:100,y:100,speed:3,movePattern:"ambush",dead:false,hurtTimer:0};'
            'ai.initEnemy(e);'
            'var ctx={player:{x:200,y:100}};'
            'for(var i=0;i<60;i++)ai.updateEnemy(e,1/30,ctx);'
            'console.log(JSON.stringify({s:e._aiState,t:e._aiTimer!==undefined}));'
        )
        r = self._run_node(script)
        assert r.returncode == 0, r.stderr
        data = json.loads(r.stdout.strip())
        assert data["t"] == True
