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
