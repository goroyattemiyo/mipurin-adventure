# ファイル: mipurin_analyzer.py
"""
ミプリンの冒険 - ゲームバランス分析エンジン
GDD v2.0 の改善項目を定量的に分析し、改善パラメータを提案する。
"""
import math
from dataclasses import dataclass, field
from typing import Optional


# ============================================================
# バランステーブル（現行の balance.js を忠実に再現）
# ============================================================

@dataclass
class PlayerStats:
    """プレイヤー基本ステータス"""
    base_hp: int = 20
    hp_per_lv: int = 2
    base_atk: int = 3
    atk_per_lv: float = 0.5
    base_speed: int = 6
    needle_dmg: int = 10
    attack_cooldown: float = 0.5

    def hp_at_level(self, level: int) -> int:
        """指定レベルでのHP"""
        return self.base_hp + (level - 1) * self.hp_per_lv

    def atk_at_level(self, level: int) -> float:
        """指定レベルでのATK"""
        return self.base_atk + (level - 1) * self.atk_per_lv


@dataclass
class EnemyTemplate:
    """敵テンプレート"""
    id: str
    name: str
    hp: int
    atk: int
    speed: float
    xp: int
    pollen: int
    pattern: str


@dataclass
class DungeonConfig:
    """巣窟スケーリング設定"""
    hp_scale_per_floor: float = 0.15
    atk_scale_per_floor: float = 0.10
    pollen_scale_per_floor: float = 0.05
    boss_every_n_floors: int = 3


# 現行の敵データ
ENEMIES = {
    "poison_mushroom": EnemyTemplate("poison_mushroom", "ドクキノコ", 3, 1, 0.8, 1, 1, "wander"),
    "green_slime": EnemyTemplate("green_slime", "ミドリスライム", 4, 1, 1.0, 1, 1, "chase"),
    "spider": EnemyTemplate("spider", "クモ", 5, 2, 1.5, 2, 2, "ambush"),
    "bomb_mushroom": EnemyTemplate("bomb_mushroom", "バクダンキノコ", 6, 3, 0.6, 3, 2, "explode"),
    "dark_slime": EnemyTemplate("dark_slime", "ヤミスライム", 8, 2, 1.2, 3, 2, "chase"),
    "bat": EnemyTemplate("bat", "コウモリ", 4, 2, 2.0, 2, 1, "swoop"),
    "ice_worm": EnemyTemplate("ice_worm", "コオリムシ", 10, 3, 0.5, 4, 3, "burrow"),
    "dark_flower": EnemyTemplate("dark_flower", "ヤミバナ", 12, 4, 0.7, 5, 3, "root_attack"),
    "shadow_bee": EnemyTemplate("shadow_bee", "カゲバチ", 8, 3, 2.5, 4, 2, "dive"),
}


# ============================================================
# バランス分析エンジン
# ============================================================

class BalanceAnalyzer:
    """ゲームバランスを分析し、問題点と改善提案を生成する"""

    def __init__(
        self,
        player: Optional[PlayerStats] = None,
        dungeon: Optional[DungeonConfig] = None,
    ):
        self.player = player or PlayerStats()
        self.dungeon = dungeon or DungeonConfig()

    # ---- スケーリング計算 ----

    def dungeon_enemy_hp(self, base_hp: int, floor: int) -> int:
        """現行の線形スケーリング（問題あり）"""
        return math.ceil(base_hp * (1 + floor * self.dungeon.hp_scale_per_floor))

    def dungeon_enemy_atk(self, base_atk: int, floor: int) -> int:
        """現行の線形スケーリング（問題あり）"""
        return math.ceil(base_atk * (1 + floor * self.dungeon.atk_scale_per_floor))

    def improved_enemy_hp(self, base_hp: int, floor: int) -> int:
        """改善版: 対数的スケーリング（後半の単調さを改善）
        序盤は急成長、後半は緩やかに。プレイヤーの成長曲線に合わせる。
        """
        # 対数+線形のハイブリッド
        log_factor = math.log2(floor + 1)
        linear_factor = floor * 0.05
        return math.ceil(base_hp * (1 + log_factor * 0.5 + linear_factor))

    def improved_enemy_atk(self, base_atk: int, floor: int) -> int:
        """改善版: 平方根的スケーリング（ダメージインフレを抑制）"""
        sqrt_factor = math.sqrt(floor)
        return math.ceil(base_atk * (1 + sqrt_factor * 0.3))

    # ---- 経験値カーブ ----

    def exp_for_level(self, level: int) -> int:
        """推奨経験値カーブ（現行は未定義のため新規設計）
        Level 1→2: 10 XP, 以降は1.4倍ずつ増加
        """
        if level <= 0:
            return 0
        return math.ceil(10 * (1.4 ** (level - 1)))

    # ---- TTK (Time To Kill) 分析 ----

    def ttk_current(self, player_level: int, enemy_id: str, floor: int = 0) -> float:
        """現行パラメータでの敵撃破時間（秒）"""
        enemy = ENEMIES.get(enemy_id)
        if not enemy:
            return float("inf")

        player_atk = self.player.atk_at_level(player_level)
        if floor > 0:
            enemy_hp = self.dungeon_enemy_hp(enemy.hp, floor)
        else:
            enemy_hp = enemy.hp

        # 攻撃クールダウンごとに1回攻撃
        hits_needed = math.ceil(enemy_hp / max(1, player_atk))
        return hits_needed * self.player.attack_cooldown

    def ttk_improved(self, player_level: int, enemy_id: str, floor: int = 0) -> float:
        """改善版パラメータでの敵撃破時間（秒）"""
        enemy = ENEMIES.get(enemy_id)
        if not enemy:
            return float("inf")

        player_atk = self.player.atk_at_level(player_level)
        if floor > 0:
            enemy_hp = self.improved_enemy_hp(enemy.hp, floor)
        else:
            enemy_hp = enemy.hp

        hits_needed = math.ceil(enemy_hp / max(1, player_atk))
        return hits_needed * self.player.attack_cooldown

    # ---- 生存時間分析 ----

    def survival_hits(self, player_level: int, enemy_id: str, floor: int = 0) -> int:
        """プレイヤーが耐えられる被弾回数"""
        enemy = ENEMIES.get(enemy_id)
        if not enemy:
            return 0

        player_hp = self.player.hp_at_level(player_level)
        if floor > 0:
            enemy_atk = self.dungeon_enemy_atk(enemy.atk, floor)
        else:
            enemy_atk = enemy.atk

        return math.ceil(player_hp / max(1, enemy_atk))

    # ---- 経済バランス分析 ----

    def pollen_per_floor(self, floor: int, enemies_per_floor: int = 8) -> int:
        """1フロアあたりの花粉収入"""
        avg_base_pollen = sum(e.pollen for e in ENEMIES.values()) / len(ENEMIES)
        scaled_pollen = math.ceil(
            avg_base_pollen * (1 + floor * self.dungeon.pollen_scale_per_floor)
        )
        return scaled_pollen * enemies_per_floor

    # ---- 祝福バランス分析 ----

    def blessing_power_score(self, blessings: list[dict]) -> float:
        """祝福の組み合わせパワースコアを計算
        現行の加算式の問題: atkMul が 0.15 × N で線形に増加 → 壊れやすい
        """
        bonuses: dict[str, float] = {}
        for b in blessings:
            effect_type = b.get("type", "")
            value = b.get("value", 0)
            bonuses[effect_type] = bonuses.get(effect_type, 0) + value

        # パワースコア計算（攻撃系と防御系の積）
        atk_mult = 1 + bonuses.get("atkMul", 0)
        crit_rate = bonuses.get("critRate", 0)
        crit_dmg_mult = 1.5  # 固定
        effective_atk = atk_mult * (1 + crit_rate * (crit_dmg_mult - 1))

        def_mult = 1 - bonuses.get("defMul", 0)
        dodge = bonuses.get("dodge", 0)
        effective_def = (1 - dodge) * def_mult

        # 速度補正
        speed_mult = 1 + bonuses.get("speedMul", 0)

        # 総合パワースコア（攻撃力 × 生存力 × 機動力）
        return effective_atk * (1 / max(0.01, effective_def)) * speed_mult

    def detect_broken_combos(self, all_blessings: list[dict], threshold: float = 5.0) -> list[tuple]:
        """壊れた祝福の組み合わせを検出する
        パワースコアが閾値を超える3つ以下の組み合わせを報告
        """
        broken = []
        n = len(all_blessings)
        # 2つ組み合わせ
        for i in range(n):
            for j in range(i + 1, n):
                combo = [all_blessings[i], all_blessings[j]]
                score = self.blessing_power_score(combo)
                if score >= threshold:
                    ids = tuple(b.get("id", "?") for b in combo)
                    broken.append((ids, score))
        # 3つ組み合わせ
        for i in range(n):
            for j in range(i + 1, n):
                for k in range(j + 1, n):
                    combo = [all_blessings[i], all_blessings[j], all_blessings[k]]
                    score = self.blessing_power_score(combo)
                    if score >= threshold:
                        ids = tuple(b.get("id", "?") for b in combo)
                        broken.append((ids, score))
        return sorted(broken, key=lambda x: -x[1])

    # ---- 総合レポート ----

    def generate_report(self, max_floor: int = 30) -> dict:
        """バランスレポートを生成"""
        report = {
            "scaling_comparison": [],
            "ttk_analysis": [],
            "exp_curve": [],
            "economy": [],
            "issues": [],
        }

        # スケーリング比較
        for floor in range(1, max_floor + 1, 5):
            for eid, enemy in ENEMIES.items():
                current_hp = self.dungeon_enemy_hp(enemy.hp, floor)
                improved_hp = self.improved_enemy_hp(enemy.hp, floor)
                current_atk = self.dungeon_enemy_atk(enemy.atk, floor)
                improved_atk = self.improved_enemy_atk(enemy.atk, floor)
                report["scaling_comparison"].append({
                    "floor": floor,
                    "enemy": eid,
                    "current_hp": current_hp,
                    "improved_hp": improved_hp,
                    "current_atk": current_atk,
                    "improved_atk": improved_atk,
                })

        # TTK分析（プレイヤーレベル1,5,10でスライムを殴る）
        for lvl in [1, 5, 10, 15, 20]:
            for eid in ["green_slime", "spider", "dark_flower"]:
                for floor in [0, 5, 10, 20]:
                    report["ttk_analysis"].append({
                        "player_level": lvl,
                        "enemy": eid,
                        "floor": floor,
                        "ttk_current": round(self.ttk_current(lvl, eid, floor), 2),
                        "ttk_improved": round(self.ttk_improved(lvl, eid, floor), 2),
                    })

        # 経験値カーブ
        for lvl in range(1, 31):
            report["exp_curve"].append({
                "level": lvl,
                "exp_needed": self.exp_for_level(lvl),
                "total_exp": sum(self.exp_for_level(l) for l in range(1, lvl + 1)),
            })

        # 経済分析
        for floor in range(1, max_floor + 1, 3):
            report["economy"].append({
                "floor": floor,
                "pollen_income": self.pollen_per_floor(floor),
            })

        # 問題検出
        # 問題1: 高階層でのTTK爆発
        for floor in [15, 20, 25, 30]:
            ttk = self.ttk_current(10, "dark_flower", floor)
            if ttk > 10:
                report["issues"].append(
                    f"[深刻] Floor {floor}: ヤミバナのTTKが{ttk:.1f}秒 → プレイヤーレベル10でも倒すのに時間がかかりすぎ"
                )

        # 問題2: 序盤の難易度不足
        for eid in ["poison_mushroom", "green_slime"]:
            ttk = self.ttk_current(1, eid, 0)
            if ttk < 1.0:
                report["issues"].append(
                    f"[軽微] {eid}のTTKが{ttk:.1f}秒 → 序盤の敵が弱すぎて緊張感がない"
                )

        # 問題3: 生存性の崩壊
        for floor in [10, 15, 20]:
            hits = self.survival_hits(5, "shadow_bee", floor)
            if hits <= 2:
                report["issues"].append(
                    f"[深刻] Floor {floor}: カゲバチに{hits}回で死亡 → レベル5プレイヤーの即死リスク"
                )

        return report


# ============================================================
# 祝福データ（現行24種 + 追加54種 = 78種の設計）
# ============================================================

CURRENT_BLESSINGS = [
    {"id": "rose_1", "type": "atkMul", "value": 0.15, "family": "rose", "rarity": "common"},
    {"id": "rose_2", "type": "critRate", "value": 0.10, "family": "rose", "rarity": "common"},
    {"id": "rose_3", "type": "lifeSteal", "value": 1, "family": "rose", "rarity": "rare"},
    {"id": "rose_4", "type": "thorns", "value": 5, "family": "rose", "rarity": "rare"},
    {"id": "lily_1", "type": "defMul", "value": 0.15, "family": "lily", "rarity": "common"},
    {"id": "lily_2", "type": "roomHeal", "value": 5, "family": "lily", "rarity": "common"},
    {"id": "lily_3", "type": "maxHp", "value": 20, "family": "lily", "rarity": "rare"},
    {"id": "lily_4", "type": "barrier", "value": 3, "family": "lily", "rarity": "rare"},
    {"id": "sun_1", "type": "regenMul", "value": 2.0, "family": "sunflower", "rarity": "common"},
    {"id": "sun_2", "type": "healMul", "value": 0.30, "family": "sunflower", "rarity": "common"},
    {"id": "sun_3", "type": "lowHpAtk", "value": 0.25, "family": "sunflower", "rarity": "rare"},
    {"id": "sun_4", "type": "revive", "value": 0.30, "family": "sunflower", "rarity": "rare"},
    {"id": "wist_1", "type": "speedMul", "value": 0.20, "family": "wisteria", "rarity": "common"},
    {"id": "wist_2", "type": "atkSpeedMul", "value": 0.15, "family": "wisteria", "rarity": "common"},
    {"id": "wist_3", "type": "dodge", "value": 0.10, "family": "wisteria", "rarity": "rare"},
    {"id": "wist_4", "type": "dashMul", "value": 0.50, "family": "wisteria", "rarity": "rare"},
    {"id": "lotus_1", "type": "dropRate", "value": 0.15, "family": "lotus", "rarity": "common"},
    {"id": "lotus_2", "type": "nectarMul", "value": 0.20, "family": "lotus", "rarity": "common"},
    {"id": "lotus_3", "type": "extraChoice", "value": 1, "family": "lotus", "rarity": "rare"},
    {"id": "lotus_4", "type": "goldMul", "value": 0.50, "family": "lotus", "rarity": "rare"},
    {"id": "chr_1", "type": "expMul", "value": 0.25, "family": "chrysanthemum", "rarity": "common"},
    {"id": "chr_2", "type": "explode", "value": 10, "family": "chrysanthemum", "rarity": "common"},
    {"id": "chr_3", "type": "cdReduce", "value": 0.20, "family": "chrysanthemum", "rarity": "common"},
    {"id": "chr_4", "type": "bonusBlessing", "value": 1, "family": "chrysanthemum", "rarity": "rare"},
]


# ============================================================
# メタプログレッション分析
# ============================================================

@dataclass
class FlowerBed:
    """花壇（永続アンロック）"""
    name: str
    category: str
    max_level: int
    base_cost: int
    cost_multiplier: float
    effect_per_level: float

    def cost_at_level(self, level: int) -> int:
        """指定レベルへのアップグレードコスト"""
        if level <= 0 or level > self.max_level:
            return 0
        return math.ceil(self.base_cost * (self.cost_multiplier ** (level - 1)))

    def total_cost(self) -> int:
        """全レベルへの総コスト"""
        return sum(self.cost_at_level(lv) for lv in range(1, self.max_level + 1))


# GDD v2.0 の花壇設計
FLOWER_BEDS = [
    FlowerBed("体力の花壇", "hp", 5, 10, 2.0, 5),
    FlowerBed("力の花壇", "atk", 5, 15, 2.0, 1),
    FlowerBed("幸運の花壇", "choice", 2, 50, 4.0, 1),
    FlowerBed("記憶の花壇", "weapon", 6, 100, 1.0, 1),
    FlowerBed("交流の花壇", "npc", 5, 30, 1.5, 1),
    FlowerBed("復活の花壇", "death_penalty", 1, 150, 1.0, 1),
    FlowerBed("探索の花壇", "exploration", 1, 200, 1.0, 1),
]


class MetaProgressionAnalyzer:
    """メタプログレッション（永続進行）の経済バランスを分析"""

    def __init__(self, flower_beds: Optional[list[FlowerBed]] = None):
        self.beds = flower_beds or FLOWER_BEDS

    def total_nectar_needed(self) -> int:
        """全花壇を最大レベルにするために必要なネクター合計"""
        return sum(bed.total_cost() for bed in self.beds)

    def nectar_per_run(self, avg_floor: int = 5, avg_kills: int = 20, boss_kills: int = 1) -> int:
        """1ランあたりの平均ネクター収入
        通常敵: 1, エリート: 5, ボス: 20, 初クリアボーナス: 50（初回のみ）
        """
        normal_kills = max(0, avg_kills - boss_kills * 1)  # エリートは別途
        elite_kills = max(0, avg_kills - normal_kills - boss_kills)
        return normal_kills * 1 + elite_kills * 5 + boss_kills * 20

    def runs_to_max(self, avg_floor: int = 5, avg_kills: int = 20, boss_kills: int = 1) -> int:
        """全花壇最大化に必要なラン数"""
        nectar_per_run = self.nectar_per_run(avg_floor, avg_kills, boss_kills)
        if nectar_per_run <= 0:
            return float("inf")
        total = self.total_nectar_needed()
        return math.ceil(total / nectar_per_run)

    def progression_curve(self, total_runs: int = 50) -> list[dict]:
        """ラン数ごとの花壇アンロック進捗"""
        curve = []
        nectar_per_run = self.nectar_per_run()
        accumulated = 0
        beds_unlocked = 0
        # コストの安い順にソート
        sorted_costs = []
        for bed in self.beds:
            for lv in range(1, bed.max_level + 1):
                sorted_costs.append((bed.cost_at_level(lv), bed.name, lv))
        sorted_costs.sort(key=lambda x: x[0])

        unlock_idx = 0
        for run in range(1, total_runs + 1):
            accumulated += nectar_per_run
            while unlock_idx < len(sorted_costs) and accumulated >= sorted_costs[unlock_idx][0]:
                accumulated -= sorted_costs[unlock_idx][0]
                beds_unlocked += 1
                unlock_idx += 1
            total_unlockable = sum(bed.max_level for bed in self.beds)
            curve.append({
                "run": run,
                "nectar_earned": run * nectar_per_run,
                "beds_unlocked": beds_unlocked,
                "progress_pct": round(beds_unlocked / total_unlockable * 100, 1),
            })
        return curve

    def generate_report(self) -> dict:
        """メタプログレッション分析レポート"""
        report = {
            "total_nectar_needed": self.total_nectar_needed(),
            "nectar_per_run": self.nectar_per_run(),
            "runs_to_max": self.runs_to_max(),
            "bed_details": [],
            "progression_curve": self.progression_curve(50),
            "issues": [],
        }

        for bed in self.beds:
            report["bed_details"].append({
                "name": bed.name,
                "max_level": bed.max_level,
                "total_cost": bed.total_cost(),
                "costs_per_level": [bed.cost_at_level(lv) for lv in range(1, bed.max_level + 1)],
            })

        # 問題検出
        runs = report["runs_to_max"]
        if runs > 100:
            report["issues"].append(
                f"[深刻] 全アンロックに{runs}ラン必要 → 50ラン以内が望ましい"
            )
        if runs < 10:
            report["issues"].append(
                f"[軽微] 全アンロックに{runs}ランで完了 → もっと長く楽しめるように調整"
            )

        # 花壇間コストバランス
        costs = [(bed.name, bed.total_cost()) for bed in self.beds]
        max_cost = max(c for _, c in costs)
        min_cost = min(c for _, c in costs)
        if max_cost > min_cost * 10:
            report["issues"].append(
                f"[注意] 花壇間コスト格差が大きい（{min_cost}〜{max_cost}）→ 段階的に解放されない"
            )

        return report
# ファイル: mipurin_patch_generator.py
"""
ミプリンの冒険 - JavaScript改善パッチ生成器
GDD v2.0の改善項目に基づき、既存コードに適用するJSパッチを生成する。
"""
import json
import textwrap
from typing import Optional


class PatchGenerator:
    """ゲーム改善パッチを生成するクラス"""

    def __init__(self):
        self._patches: list[dict] = []

    # ============================================================
    # パッチ1: スケーリング改善（balance.js への修正）
    # ============================================================

    def generate_scaling_patch(self) -> str:
        """対数ハイブリッドスケーリングのJSコード"""
        js = textwrap.dedent("""\
        // === PATCH: 改善版スケーリング関数 ===
        // balance.js の dungeonEnemyHp / dungeonEnemyAtk を置換

        /**
         * 改善版: 対数+線形ハイブリッドスケーリング
         * 序盤は急成長（手応え）、後半は緩やか（理不尽さ回避）
         * @param {number} baseHp - 敵の基本HP
         * @param {number} floor - 現在の階層
         * @returns {number} スケーリング後のHP
         */
        function improvedDungeonEnemyHp(baseHp, floor) {
          const logFactor = Math.log2(floor + 1);
          const linearFactor = floor * 0.05;
          return Math.ceil(baseHp * (1 + logFactor * 0.5 + linearFactor));
        }

        /**
         * 改善版: 平方根ベースの攻撃力スケーリング
         * ダメージインフレを抑制し、プレイヤーの成長との均衡を保つ
         * @param {number} baseAtk - 敵の基本ATK
         * @param {number} floor - 現在の階層
         * @returns {number} スケーリング後のATK
         */
        function improvedDungeonEnemyAtk(baseAtk, floor) {
          const sqrtFactor = Math.sqrt(floor);
          return Math.ceil(baseAtk * (1 + sqrtFactor * 0.3));
        }

        /**
         * 経験値カーブ（推奨）
         * @param {number} level - 現在のレベル
         * @returns {number} 次のレベルに必要な経験値
         */
        function expForLevel(level) {
          if (level <= 0) return 0;
          return Math.ceil(10 * Math.pow(1.4, level - 1));
        }
        """)
        self._patches.append({
            "target": "js/balance.js",
            "description": "スケーリング関数を対数ハイブリッドに改善",
            "code": js,
        })
        return js

    # ============================================================
    # パッチ2: 追加祝福54種の生成
    # ============================================================

    def generate_additional_blessings(self) -> str:
        """GDD v2.0で設計された追加祝福データを生成"""
        # 各系統13種（基本8+レア4+伝説1）のうち、現在4種ずつ実装済み
        # 残り9種×6系統 = 54種を追加
        additional = []
        families = {
            "rose": {
                "icon": "🌹",
                "blessings": [
                    ("rose_5", "薔薇の棘", "攻撃力+25%", "common", "atkMul", 0.25),
                    ("rose_6", "紅蓮の一撃", "クリティカルダメージ+30%", "common", "critDmg", 0.30),
                    ("rose_7", "血の契約", "HP消費で攻撃力2倍（HP-5）", "common", "bloodPact", 2.0),
                    ("rose_8", "荊の王冠", "攻撃力+10%（祝福1個ごと）", "common", "atkPerBlessing", 0.10),
                    ("rose_9", "炎の薔薇", "攻撃にDOT付与（3秒間ATK*0.5）", "rare", "fireDot", 0.5),
                    ("rose_10", "吸血の牙", "クリティカル時HP3回復", "rare", "critHeal", 3),
                    ("rose_11", "怒りの収穫", "HP30%以下で攻撃力+50%", "rare", "rageAtk", 0.50),
                    ("rose_12", "薔薇の嵐", "攻撃範囲+40%", "rare", "atkRange", 0.40),
                    ("rose_legend", "永遠の薔薇", "全攻撃がクリティカル（10秒ごと5秒間）", "legendary", "autoPerCrit", 1.0),
                ],
            },
            "lily": {
                "icon": "🌷",
                "blessings": [
                    ("lily_5", "堅牢の花", "防御力+25%", "common", "defMul", 0.25),
                    ("lily_6", "再生の露", "被ダメ時HP1回復（3秒CD）", "common", "dmgHeal", 1),
                    ("lily_7", "根の壁", "ノックバック無効", "common", "noKnockback", 1),
                    ("lily_8", "白百合の祈り", "無敵時間+0.5秒", "common", "invulnExt", 0.5),
                    ("lily_9", "聖域", "静止中被ダメ-50%", "rare", "stillDef", 0.50),
                    ("lily_10", "献身の花", "HP50%以上で防御力+30%", "rare", "highHpDef", 0.30),
                    ("lily_11", "花の盾", "バリア+2（部屋移動時回復）", "rare", "roomBarrier", 2),
                    ("lily_12", "不屈の茎", "致死ダメージ時HP1で耐える（30秒CD）", "rare", "guts", 1),
                    ("lily_legend", "永遠の百合", "全ダメージ1固定（5秒間/30秒CD）", "legendary", "invincibleBurst", 1.0),
                ],
            },
            "sunflower": {
                "icon": "🌻",
                "blessings": [
                    ("sun_5", "朝露の恵み", "毎秒HP0.5回復", "common", "passiveRegen", 0.5),
                    ("sun_6", "太陽の抱擁", "回復時にATK+10%（10秒）", "common", "healAtk", 0.10),
                    ("sun_7", "光合成", "静止中HP回復2倍", "common", "stillRegen", 2.0),
                    ("sun_8", "花の蜜", "回復アイテム効果+50%", "common", "itemHeal", 0.50),
                    ("sun_9", "太陽の盾", "HP満タン時被ダメ-25%", "rare", "fullHpDef", 0.25),
                    ("sun_10", "燃える心", "HP消費攻撃のHP消費-50%", "rare", "bloodCostReduce", 0.50),
                    ("sun_11", "生命の泉", "最大HP+10,現在HP全回復", "rare", "fullHeal", 10),
                    ("sun_12", "不死鳥の涙", "復活時にATK+50%（30秒）", "rare", "reviveAtk", 0.50),
                    ("sun_legend", "太陽の化身", "HP回復量=与ダメージの20%（常時）", "legendary", "omnivamp", 0.20),
                ],
            },
            "wisteria": {
                "icon": "💜",
                "blessings": [
                    ("wist_5", "紫の疾風", "移動速度+30%", "common", "speedMul", 0.30),
                    ("wist_6", "雷光", "攻撃速度+25%", "common", "atkSpeedMul", 0.25),
                    ("wist_7", "風の足跡", "移動中に回避率+15%", "common", "moveDodge", 0.15),
                    ("wist_8", "紫電一閃", "ダッシュ後最初の攻撃のダメージ+50%", "common", "dashAtk", 0.50),
                    ("wist_9", "分身", "攻撃が2回ヒットする（2回目は50%ダメージ）", "rare", "doubleStrike", 0.50),
                    ("wist_10", "時間歪曲", "ダッシュCD-40%", "rare", "dashCdReduce", 0.40),
                    ("wist_11", "幻影", "被弾時30%で分身を生成（3秒間囮）", "rare", "decoy", 0.30),
                    ("wist_12", "嵐の目", "速度が上がるほど攻撃力UP（速度*5%）", "rare", "speedToAtk", 0.05),
                    ("wist_legend", "紫電の化身", "常時ダッシュ状態（攻撃可能）", "legendary", "permaDash", 1.0),
                ],
            },
            "lotus": {
                "icon": "🪷",
                "blessings": [
                    ("lotus_5", "蓮の恵み", "ドロップ率+25%", "common", "dropRate", 0.25),
                    ("lotus_6", "黄金の花粉", "花粉獲得+30%", "common", "pollenMul", 0.30),
                    ("lotus_7", "発見の目", "宝箱部屋の確率+15%", "common", "treasureRate", 0.15),
                    ("lotus_8", "収穫の喜び", "アイテム使用時HP5回復", "common", "itemUseHeal", 5),
                    ("lotus_9", "幸運の渦", "祝福のレアリティUP", "rare", "rarityUp", 1),
                    ("lotus_10", "蓮華の導き", "選択肢+1（5択に）", "rare", "extraChoice", 1),
                    ("lotus_11", "黄金蓮", "ボス撃破時追加ドロップ×2", "rare", "bossLoot", 2),
                    ("lotus_12", "運命の蓮", "祝福選択肢にデュオ祝福確定1個", "rare", "duoGuarantee", 1),
                    ("lotus_legend", "究極の蓮", "全ドロップがレア以上に", "legendary", "allRare", 1.0),
                ],
            },
            "chrysanthemum": {
                "icon": "🌸",
                "blessings": [
                    ("chr_5", "知恵の菊", "EXP獲得+40%", "common", "expMul", 0.40),
                    ("chr_6", "連鎖爆発", "爆発が連鎖する（30%確率）", "common", "chainExplode", 0.30),
                    ("chr_7", "花粉弾", "針の一撃の範囲+25%", "common", "needleRange", 0.25),
                    ("chr_8", "集中", "スキルポイント+1", "common", "skillPoint", 1),
                    ("chr_9", "超新星", "敵撃破時爆発ダメージ2倍", "rare", "explodeMul", 2.0),
                    ("chr_10", "時の花弁", "全クールダウン-30%", "rare", "cdReduce", 0.30),
                    ("chr_11", "覚醒", "レベルアップ時にランダム祝福1個", "rare", "lvUpBlessing", 1),
                    ("chr_12", "花の知識", "敵のHPが見える+弱点表示", "rare", "enemyInfo", 1),
                    ("chr_legend", "輪廻の花園", "死亡時に祝福を3個保持して復活", "legendary", "keepBlessings", 3),
                ],
            },
        }

        for family_id, family_data in families.items():
            for b_id, name, desc, rarity, effect_type, value in family_data["blessings"]:
                additional.append({
                    "id": b_id,
                    "name": name,
                    "description": desc,
                    "family": family_id,
                    "rarity": rarity,
                    "icon": family_data["icon"],
                    "effect": {"type": effect_type, "value": value},
                })

        js_code = "// === PATCH: 追加祝福54種（GDD v2.0準拠） ===\n"
        js_code += "// blessings.js の BLESSING_DATA 配列に追加\n\n"
        js_code += f"const ADDITIONAL_BLESSINGS = {json.dumps(additional, ensure_ascii=False, indent=2)};\n\n"
        js_code += "// 既存データとマージ\n"
        js_code += "// BLESSING_DATA.push(...ADDITIONAL_BLESSINGS);\n"

        self._patches.append({
            "target": "js/blessings.js",
            "description": f"祝福{len(additional)}種を追加（合計78種）",
            "code": js_code,
        })
        return js_code

    # ============================================================
    # パッチ3: デュオ祝福（シナジー）システム
    # ============================================================

    def generate_duo_blessings(self) -> str:
        """デュオ祝福15種のJSコード"""
        duos = [
            {"id": "duo_rose_wist", "name": "毒薔薇", "families": ["rose", "wisteria"],
             "description": "クリティカル時に毒を周囲散布",
             "effect": {"type": "critPoison", "value": 3, "radius": 3}},
            {"id": "duo_lily_sun", "name": "不滅の蓮", "families": ["lily", "sunflower"],
             "description": "HP0で1回だけ全回復復活",
             "effect": {"type": "fullRevive", "value": 1}},
            {"id": "duo_sun_rose", "name": "灼熱突撃", "families": ["sunflower", "rose"],
             "description": "ダッシュ中接触敵に大ダメージ",
             "effect": {"type": "dashDamage", "value": 15}},
            {"id": "duo_wist_chr", "name": "腐食の収穫", "families": ["wisteria", "chrysanthemum"],
             "description": "速度上昇中に花粉自動収集",
             "effect": {"type": "autoCollect", "value": 1}},
            {"id": "duo_sun_lily", "name": "生命の壁", "families": ["sunflower", "lily"],
             "description": "シールドがHP回復量に比例",
             "effect": {"type": "healShield", "value": 0.5}},
            {"id": "duo_chr_lotus", "name": "黄金疾走", "families": ["chrysanthemum", "lotus"],
             "description": "EXP獲得時に花粉も獲得",
             "effect": {"type": "expToPollen", "value": 0.2}},
            {"id": "duo_rose_lily", "name": "鉄薔薇", "families": ["rose", "lily"],
             "description": "攻撃力が防御力にも加算",
             "effect": {"type": "atkToDef", "value": 0.3}},
            {"id": "duo_rose_sun", "name": "生命吸収", "families": ["rose", "sunflower"],
             "description": "与ダメージの10%をHP回復",
             "effect": {"type": "omnivamp", "value": 0.10}},
            {"id": "duo_lily_wist", "name": "風の盾", "families": ["lily", "wisteria"],
             "description": "ダッシュ使用時バリア1回復",
             "effect": {"type": "dashBarrier", "value": 1}},
            {"id": "duo_lily_chr", "name": "知恵の守り", "families": ["lily", "chrysanthemum"],
             "description": "レベルアップ時バリア全回復",
             "effect": {"type": "lvUpBarrier", "value": 1}},
            {"id": "duo_sun_wist", "name": "光速回復", "families": ["sunflower", "wisteria"],
             "description": "移動速度に応じてHP回復",
             "effect": {"type": "speedRegen", "value": 0.1}},
            {"id": "duo_sun_chr", "name": "太陽の知恵", "families": ["sunflower", "chrysanthemum"],
             "description": "回復時にEXP獲得",
             "effect": {"type": "healToExp", "value": 2}},
            {"id": "duo_wist_lotus", "name": "幸運の疾風", "families": ["wisteria", "lotus"],
             "description": "高速移動中ドロップ率+50%",
             "effect": {"type": "speedDrop", "value": 0.50}},
            {"id": "duo_rose_chr", "name": "爆裂薔薇", "families": ["rose", "chrysanthemum"],
             "description": "クリティカル撃破で超爆発",
             "effect": {"type": "critExplode", "value": 20}},
            {"id": "duo_lotus_lily", "name": "幸運の花壇", "families": ["lotus", "lily"],
             "description": "宝箱から追加アイテム+1",
             "effect": {"type": "extraChestItem", "value": 1}},
        ]

        js_code = "// === PATCH: デュオ祝福15種 ===\n"
        js_code += f"const DUO_BLESSINGS = {json.dumps(duos, ensure_ascii=False, indent=2)};\n\n"
        js_code += textwrap.dedent("""\
        /**
         * デュオ祝福の取得判定
         * プレイヤーが2つの系統の祝福を持っている場合にデュオ候補に追加
         * @param {Array} owned - 所持祝福リスト
         * @returns {Array} 取得可能なデュオ祝福
         */
        function getAvailableDuoBlessings(owned) {
          const ownedFamilies = new Set(owned.map(b => b.family));
          return DUO_BLESSINGS.filter(duo =>
            duo.families.every(f => ownedFamilies.has(f)) &&
            !owned.some(b => b.id === duo.id)
          );
        }
        """)

        self._patches.append({
            "target": "js/blessings.js",
            "description": "デュオ祝福15種を追加",
            "code": js_code,
        })
        return js_code

    # ============================================================
    # パッチ4: メタプログレッション（ネクター＋花壇）
    # ============================================================

    def generate_meta_progression(self) -> str:
        """メタプログレッションシステムのJSコード"""
        js = textwrap.dedent("""\
        // === PATCH: メタプログレッション（ネクター＋花壇） ===
        // 新規ファイル: js/meta.js

        const MetaProgression = (() => {
          const SAVE_KEY = 'mipurin_meta';

          // 花壇定義
          const FLOWER_BEDS = {
            hp:          { name: '体力の花壇',   maxLevel: 5, baseCost: 10,  costMult: 2.0, effectPerLv: 5,  desc: 'HP+5/Lv' },
            atk:         { name: '力の花壇',     maxLevel: 5, baseCost: 15,  costMult: 2.0, effectPerLv: 1,  desc: 'ATK+1/Lv' },
            choice:      { name: '幸運の花壇',   maxLevel: 2, baseCost: 50,  costMult: 4.0, effectPerLv: 1,  desc: '祝福選択肢+1/Lv' },
            weapon:      { name: '記憶の花壇',   maxLevel: 6, baseCost: 100, costMult: 1.0, effectPerLv: 1,  desc: '武器解放' },
            npc:         { name: '交流の花壇',   maxLevel: 5, baseCost: 30,  costMult: 1.5, effectPerLv: 1,  desc: 'NPC会話解放' },
            deathPenalty: { name: '復活の花壇',   maxLevel: 1, baseCost: 150, costMult: 1.0, effectPerLv: 1,  desc: '死亡時花粉50%保持' },
            exploration:  { name: '探索の花壇',   maxLevel: 1, baseCost: 200, costMult: 1.0, effectPerLv: 1,  desc: '隠し部屋率UP' }
          };

          let _nectar = 0;
          let _levels = {};  // { hp: 0, atk: 0, ... }
          let _totalRuns = 0;

          /** 初期化 */
          function init() {
            const saved = localStorage.getItem(SAVE_KEY);
            if (saved) {
              try {
                const data = JSON.parse(saved);
                _nectar = data.nectar || 0;
                _levels = data.levels || {};
                _totalRuns = data.totalRuns || 0;
              } catch (e) {
                console.warn('メタデータ読込失敗:', e);
              }
            }
            // 未初期化の花壇をレベル0に
            for (const key of Object.keys(FLOWER_BEDS)) {
              if (_levels[key] === undefined) _levels[key] = 0;
            }
          }

          /** セーブ */
          function save() {
            localStorage.setItem(SAVE_KEY, JSON.stringify({
              nectar: _nectar,
              levels: _levels,
              totalRuns: _totalRuns
            }));
          }

          /** ネクター加算 */
          function addNectar(amount) {
            if (amount <= 0) return;
            _nectar += amount;
            save();
          }

          /** 花壇アップグレードコスト */
          function upgradeCost(bedKey) {
            const bed = FLOWER_BEDS[bedKey];
            if (!bed) return Infinity;
            const currentLv = _levels[bedKey] || 0;
            if (currentLv >= bed.maxLevel) return Infinity;
            return Math.ceil(bed.baseCost * Math.pow(bed.costMult, currentLv));
          }

          /** 花壇アップグレード実行 */
          function upgrade(bedKey) {
            const cost = upgradeCost(bedKey);
            if (_nectar < cost) return false;
            _nectar -= cost;
            _levels[bedKey] = (_levels[bedKey] || 0) + 1;
            save();
            return true;
          }

          /** プレイヤーへの永続ボーナス取得 */
          function getBonuses() {
            return {
              maxHp:         (_levels.hp || 0) * FLOWER_BEDS.hp.effectPerLv,
              atk:           (_levels.atk || 0) * FLOWER_BEDS.atk.effectPerLv,
              extraChoices:  (_levels.choice || 0) * FLOWER_BEDS.choice.effectPerLv,
              deathPenalty:  (_levels.deathPenalty || 0) > 0,
              exploration:   (_levels.exploration || 0) > 0
            };
          }

          /** ラン終了時の処理 */
          function onRunEnd(result) {
            _totalRuns++;
            // ネクター計算: 通常撃破*1 + ボス撃破*20 + 無傷ボーナス
            let nectarGain = (result.kills || 0);
            nectarGain += (result.bossKills || 0) * 19; // +19 (計20)
            if (result.noDamage) nectarGain += 3;
            if (result.firstClear) nectarGain += 50;

            // 花壇ボーナス適用
            // ... 死亡時花粉保持など

            addNectar(nectarGain);
            return { nectarGain, totalNectar: _nectar };
          }

          /** 状態取得 */
          function getState() {
            return {
              nectar: _nectar,
              levels: { ..._levels },
              totalRuns: _totalRuns,
              bonuses: getBonuses()
            };
          }

          return {
            FLOWER_BEDS, init, save, addNectar,
            upgradeCost, upgrade, getBonuses,
            onRunEnd, getState
          };
        })();
        """)

        self._patches.append({
            "target": "js/meta.js",
            "description": "メタプログレッションシステム（ネクター通貨+花壇アンロックツリー）",
            "code": js,
        })
        return js

    # ============================================================
    # パッチ5: ノードマップ生成
    # ============================================================

    def generate_node_map(self) -> str:
        """ノードマップ方式のダンジョン構造JSコード"""
        js = textwrap.dedent("""\
        // === PATCH: ノードマップ方式ダンジョン構造 ===
        // 新規ファイル: js/nodeMap.js

        const NodeMap = (() => {
          /**
           * ノードタイプ定義
           * GDD v2.0準拠: 7種類のノード
           */
          const NODE_TYPES = {
            COMBAT:   { id: 'combat',   icon: '⚔',  weight: 0.50, label: '戦闘' },
            ELITE:    { id: 'elite',    icon: '💀', weight: 0.15, label: 'エリート' },
            SHOP:     { id: 'shop',     icon: '🏪', weight: 0.10, label: 'ショップ' },
            EVENT:    { id: 'event',    icon: '❓', weight: 0.10, label: 'イベント' },
            TREASURE: { id: 'treasure', icon: '💎', weight: 0.05, label: '宝箱' },
            REST:     { id: 'rest',     icon: '🌿', weight: 0.05, label: '休憩' },
            BOSS:     { id: 'boss',     icon: '👑', weight: 0,    label: 'ボス' }
          };

          /**
           * 階層マップを生成
           * @param {number} stageIndex - 階層番号 (0-based)
           * @param {number} seed - 乱数シード
           * @returns {Object} ノードマップデータ
           */
          function generateStage(stageIndex, seed) {
            const rng = mulberry32(seed + stageIndex * 1000);
            const nodeCount = 7 + Math.floor(rng() * 4); // 7-10ノード
            const layers = [];

            // Layer 0: スタート（1ノード）
            layers.push([{ id: 'start', type: 'start', connections: [] }]);

            // Layer 1~N-2: 分岐 (2-3ノード/層)
            const middleLayers = nodeCount - 2;
            for (let i = 0; i < middleLayers; i++) {
              const width = 2 + Math.floor(rng() * 2); // 2-3分岐
              const layer = [];
              for (let j = 0; j < width; j++) {
                const type = _rollNodeType(rng, i, middleLayers);
                layer.push({
                  id: `node_${i}_${j}`,
                  type: type,
                  connections: [],
                  cleared: false,
                  reward: null
                });
              }
              layers.push(layer);
            }

            // 最終Layer: ボス（1ノード、収束）
            layers.push([{ id: 'boss', type: 'boss', connections: [] }]);

            // 接続生成（各ノードから次の層の1-2ノードへ）
            for (let i = 0; i < layers.length - 1; i++) {
              for (const node of layers[i]) {
                const nextLayer = layers[i + 1];
                // 最低1接続、最大2接続
                const connCount = Math.min(nextLayer.length, 1 + Math.floor(rng() * 2));
                const indices = [];
                while (indices.length < connCount) {
                  const idx = Math.floor(rng() * nextLayer.length);
                  if (!indices.includes(idx)) indices.push(idx);
                }
                node.connections = indices.map(idx => nextLayer[idx].id);
              }

              // 全ノードが到達可能か確認（孤立ノード防止）
              const nextLayer = layers[i + 1];
              for (let j = 0; j < nextLayer.length; j++) {
                const isReachable = layers[i].some(n => n.connections.includes(nextLayer[j].id));
                if (!isReachable) {
                  // ランダムな前ノードから接続追加
                  const fromIdx = Math.floor(rng() * layers[i].length);
                  layers[i][fromIdx].connections.push(nextLayer[j].id);
                }
              }
            }

            return { stageIndex, layers, nodeCount };
          }

          /**
           * ノードタイプをウェイトに基づいてロール
           */
          function _rollNodeType(rng, layerIdx, totalLayers) {
            // 序盤は戦闘多め、中盤にショップ/イベント、終盤はエリート
            const progress = layerIdx / totalLayers;

            const types = Object.values(NODE_TYPES).filter(t => t.id !== 'boss');
            let totalWeight = 0;
            const weights = types.map(t => {
              let w = t.weight;
              if (t.id === 'elite' && progress < 0.3) w *= 0.3; // 序盤エリート抑制
              if (t.id === 'rest' && progress > 0.7) w *= 2.0;  // 終盤休憩増
              if (t.id === 'shop' && progress > 0.3 && progress < 0.7) w *= 1.5; // 中盤ショップ
              totalWeight += w;
              return w;
            });

            let roll = rng() * totalWeight;
            for (let i = 0; i < types.length; i++) {
              roll -= weights[i];
              if (roll <= 0) return types[i].id;
            }
            return 'combat';
          }

          /** Mulberry32 PRNG */
          function mulberry32(seed) {
            let a = seed >>> 0;
            return () => {
              a |= 0;
              a = (a + 0x6D2B79F5) | 0;
              let t = Math.imul(a ^ (a >>> 15), 1 | a);
              t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
              return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
          }

          return { NODE_TYPES, generateStage };
        })();
        """)

        self._patches.append({
            "target": "js/nodeMap.js",
            "description": "ノードマップ方式のダンジョン構造（GDD v2.0 第4章準拠）",
            "code": js,
        })
        return js

    # ============================================================
    # パッチ一覧取得
    # ============================================================

    def generate_all_patches(self) -> list[dict]:
        """全パッチを生成して返す"""
        self._patches = []
        self.generate_scaling_patch()
        self.generate_additional_blessings()
        self.generate_duo_blessings()
        self.generate_meta_progression()
        self.generate_node_map()
        return self._patches

    def get_summary(self) -> str:
        """パッチサマリーを文字列で返す"""
        if not self._patches:
            self.generate_all_patches()

        lines = ["=" * 60, "ミプリンの冒険 改善パッチサマリー", "=" * 60, ""]
        for i, patch in enumerate(self._patches, 1):
            lines.append(f"パッチ {i}: {patch['description']}")
            lines.append(f"  対象: {patch['target']}")
            lines.append(f"  コード長: {len(patch['code'])} 文字")
            lines.append("")

        lines.append(f"合計パッチ数: {len(self._patches)}")
        lines.append(f"合計コード量: {sum(len(p['code']) for p in self._patches)} 文字")
        return "\n".join(lines)