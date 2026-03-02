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


class TestWeapons:
    def test_weapons_js_exists(self):
        assert os.path.exists(os.path.join(JS_DIR, "weapons.js"))

    def test_has_6_weapons(self):
        code = read_js("weapons.js")
        weapons = ["bee_sting", "honey_cannon", "pollen_shield", "vine_whip", "feather_shuriken", "queens_staff"]
        for w in weapons:
            assert w in code, f"weapon {w} missing"

    def test_each_weapon_has_special(self):
        code = read_js("weapons.js")
        assert code.count("special:") >= 6

    def test_weapon_types(self):
        code = read_js("weapons.js")
        for t in ["melee", "ranged", "magic"]:
            assert f"type:\'{t}\'" in code, f"type {t} missing"

    def test_weapons_brackets_balanced(self):
        check_balanced(read_js("weapons.js"), "weapons.js")

    def test_serialize_deserialize(self):
        code = read_js("weapons.js")
        assert "serialize" in code
        assert "deserialize" in code


class TestBossPatterns:
    def test_boss_patterns_js_exists(self):
        assert os.path.exists(os.path.join(JS_DIR, "bossPatterns.js"))

    def test_has_4_new_bosses(self):
        code = read_js("bossPatterns.js")
        bosses = ["rotting_tree", "garden_keeper", "abyss_lord", "ice_empress"]
        for b in bosses:
            assert b in code, f"boss {b} missing"

    def test_each_boss_has_3_phases(self):
        code = read_js("bossPatterns.js")
        for boss in ["rotting_tree", "garden_keeper", "abyss_lord", "ice_empress"]:
            # Each boss should have hpThreshold entries
            section_start = code.find(boss)
            section = code[section_start:section_start+800]
            threshold_count = section.count("hpThreshold")
            assert threshold_count >= 3, f"{boss}: only {threshold_count} phases"

    def test_all_phases_have_telegraph(self):
        code = read_js("bossPatterns.js")
        assert code.count("telegraph:") >= 12  # 4 bosses x 3 phases

    def test_counterplay_windows(self):
        code = read_js("bossPatterns.js")
        assert "counterWindow" in code

    def test_boss_lore(self):
        code = read_js("bossPatterns.js")
        assert code.count("lore:") >= 4

    def test_validate_function(self):
        code = read_js("bossPatterns.js")
        assert "validateBoss" in code

    def test_brackets_balanced(self):
        check_balanced(read_js("bossPatterns.js"), "bossPatterns.js")


class TestEvents:
    def test_events_js_exists(self):
        assert os.path.exists(os.path.join(JS_DIR, "events.js"))

    def test_has_12_events(self):
        code = read_js("events.js")
        event_ids = re.findall(r"id:\'([^\']+)\'", code)
        # Filter to only top-level event ids (not choice result types)
        assert len(event_ids) >= 12, f"event count={len(event_ids)}"

    def test_each_event_has_choices(self):
        code = read_js("events.js")
        assert code.count("choices:") >= 12

    def test_event_types_varied(self):
        code = read_js("events.js")
        for t in ["shop", "rest", "blessing", "risk", "npc", "story", "upgrade"]:
            assert f"type:\'{t}\'" in code, f"event type {t} missing"

    def test_resolve_choice(self):
        code = read_js("events.js")
        assert "resolveChoice" in code

    def test_gamble_mechanic(self):
        code = read_js("events.js")
        assert "gamble" in code

    def test_brackets_balanced(self):
        check_balanced(read_js("events.js"), "events.js")


class TestNpcDialogue:
    def test_npc_dialogue_js_exists(self):
        assert os.path.exists(os.path.join(JS_DIR, "npcDialogue.js"))

    def test_has_7_npcs(self):
        code = read_js("npcDialogue.js")
        npcs = ["hatch", "miel", "marche", "bee", "pore", "navi", "granpa"]
        for n in npcs:
            assert f"{n}:" in code, f"npc {n} missing"

    def test_min_10_stages_per_npc(self):
        code = read_js("npcDialogue.js")
        npcs = ["hatch", "miel", "marche", "bee", "pore", "navi", "granpa"]
        for n in npcs:
            # Find the stages array for this NPC
            start = code.find(f"{n}:")
            end = code.find("\n    },", start)
            if end < 0:
                end = code.find("\n    }", start)
            section = code[start:end+100] if end > start else code[start:start+2000]
            level_count = len(re.findall(r"level:\d+", section))
            assert level_count >= 10, f"npc {n}: only {level_count} stages (need 10+)"

    def test_affinity_system(self):
        code = read_js("npcDialogue.js")
        assert "getAffinity" in code
        assert "addAffinity" in code

    def test_talk_to_function(self):
        code = read_js("npcDialogue.js")
        assert "talkTo" in code

    def test_serialize(self):
        code = read_js("npcDialogue.js")
        assert "serialize" in code
        assert "deserialize" in code

    def test_brackets_balanced(self):
        check_balanced(read_js("npcDialogue.js"), "npcDialogue.js")


class TestHTMLIntegration:
    def test_index_includes_weapons(self):
        with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        assert "weapons.js" in html

    def test_index_includes_boss_patterns(self):
        with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        assert "bossPatterns.js" in html

    def test_index_includes_events(self):
        with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        assert "events.js" in html

    def test_index_includes_npc_dialogue(self):
        with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        assert "npcDialogue.js" in html

    def test_weapons_before_battle(self):
        with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        assert html.find("weapons.js") < html.find("battle.js")

    def test_boss_patterns_before_boss(self):
        with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
            html = f.read()
        assert html.find("bossPatterns.js") < html.find("boss.js")


class TestNodeJSRuntime:
    def _run_node(self, script):
        return subprocess.run(
            ["node", "-e", script],
            capture_output=True, text=True, timeout=10, cwd=ROOT
        )

    def test_weapons_runtime(self):
        script = (
            'global.window={};global.CONFIG={TILE_SIZE:64};'
            'var fs=require("fs");'
            'eval(fs.readFileSync("./js/weapons.js","utf8"));'
            'var w=window.WeaponSystem;w.init();'
            'console.log(JSON.stringify({count:w.getWeaponCount(),current:w.getCurrentWeaponId()}));'
        )
        r = self._run_node(script)
        assert r.returncode == 0, r.stderr
        data = json.loads(r.stdout.strip())
        assert data["count"] == 6
        assert data["current"] == "bee_sting"

    def test_boss_patterns_runtime(self):
        script = (
            'global.window={};'
            'var fs=require("fs");'
            'eval(fs.readFileSync("./js/bossPatterns.js","utf8"));'
            'var bp=window.BossPatterns;'
            'var ids=bp.getBossIds();'
            'var v=bp.validateBoss("rotting_tree");'
            'console.log(JSON.stringify({count:bp.getBossCount(),ids:ids,valid:v.valid}));'
        )
        r = self._run_node(script)
        assert r.returncode == 0, r.stderr
        data = json.loads(r.stdout.strip())
        assert data["count"] == 4
        assert data["valid"] == True

    def test_events_runtime(self):
        script = (
            'global.window={};'
            'var fs=require("fs");'
            'eval(fs.readFileSync("./js/events.js","utf8"));'
            'var ev=window.GameEvents;'
            'var e=ev.getRandomEvent(1,[]);'
            'console.log(JSON.stringify({count:ev.getEventCount(),hasChoices:e.choices.length>0}));'
        )
        r = self._run_node(script)
        assert r.returncode == 0, r.stderr
        data = json.loads(r.stdout.strip())
        assert data["count"] == 12
        assert data["hasChoices"] == True

    def test_npc_dialogue_runtime(self):
        script = (
            'global.window={};'
            'var fs=require("fs");'
            'eval(fs.readFileSync("./js/npcDialogue.js","utf8"));'
            'var nd=window.NpcDialogue;nd.init();'
            'var d1=nd.talkTo("hatch");'
            'var d2=nd.talkTo("hatch");'
            'console.log(JSON.stringify({npcs:nd.getNpcCount(),lines:nd.getTotalDialogueLines(),a:nd.getAffinity("hatch")}));'
        )
        r = self._run_node(script)
        assert r.returncode == 0, r.stderr
        data = json.loads(r.stdout.strip())
        assert data["npcs"] == 7
        assert data["lines"] >= 70
        assert data["a"] == 2  # talkTo increments affinity
