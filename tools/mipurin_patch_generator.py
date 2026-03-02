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