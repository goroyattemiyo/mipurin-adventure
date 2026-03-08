// ===== BLESSINGS SYSTEM (Sprint A-1) =====
// 78 blessings (6 families x 13) + 15 duo blessings
// Uses apply() pattern compatible with player object

const BLESSING_POOL = [
  // ===== ROSE (ローザ) — 攻撃特化 =====
  { id:'rose_1', name:'🌹 ローザの力', desc:'攻撃力 +1', icon:'🌹', rarity:'common', family:'rose', apply:()=>{ player.atk += 1; }},
  { id:'rose_2', name:'🌹 ローザの一撃', desc:'攻撃力 +1', icon:'🌹', rarity:'common', family:'rose', apply:()=>{ player.atk += 1; }},
  { id:'rose_3', name:'🌹 ローザの連撃', desc:'攻撃速度 +15%', icon:'🌹', rarity:'common', family:'rose', apply:()=>{ player.atkSpeedBonus += 0.15; }},
  { id:'rose_4', name:'🌹 ローザの蔓', desc:'攻撃範囲 +15', icon:'🌹', rarity:'common', family:'rose', apply:()=>{ player.atkRangeBonus += 15; }},
  { id:'rose_5', name:'🌹 棘の構え', desc:'攻撃力 +1 & 範囲 +10', icon:'🌹', rarity:'common', family:'rose', apply:()=>{ player.atk += 1; player.atkRangeBonus += 10; }},
  { id:'rose_6', name:'🌹 赤い閃光', desc:'攻撃速度 +10%', icon:'🌹', rarity:'common', family:'rose', apply:()=>{ player.atkSpeedBonus += 0.10; }},
  { id:'rose_7', name:'🌹 棘の雨', desc:'攻撃範囲 +20', icon:'🌹', rarity:'common', family:'rose', apply:()=>{ player.atkRangeBonus += 20; }},
  { id:'rose_8', name:'🌹 薔薇の怒り', desc:'攻撃力 +1 & 攻撃速度 +10%', icon:'🌹', rarity:'common', family:'rose', apply:()=>{ player.atk += 1; player.atkSpeedBonus += 0.10; }},
  { id:'rose_9', name:'🗡️ ローザの刃', desc:'攻撃力 +2', icon:'🗡️', rarity:'rare', family:'rose', apply:()=>{ player.atk += 2; }},
  { id:'rose_10', name:'🌹 ローザの蔓・極', desc:'攻撃範囲 +30', icon:'🌹', rarity:'rare', family:'rose', apply:()=>{ player.atkRangeBonus += 30; }},
  { id:'rose_11', name:'🩸 ローザの渇き', desc:'撃破時HP回復', icon:'🩸', rarity:'rare', family:'rose', apply:()=>{ player.vampiric = true; }},
  { id:'rose_12', name:'🌹 棘の反撃', desc:'被弾時に反撃ダメージ2', icon:'🌹', rarity:'rare', family:'rose', apply:()=>{ player.thorns = Math.max(player.thorns||0, 2); }},
  { id:'rose_13', name:'👑 深紅の女王', desc:'攻撃力 +3 & 範囲 +20 & 速度 +15%', icon:'👑', rarity:'legend', family:'rose', apply:()=>{ player.atk += 3; player.atkRangeBonus += 20; player.atkSpeedBonus += 0.15; }},

  // ===== LILY (リリア) — 防御特化 =====
  { id:'lily_1', name:'🤍 リリアの守り', desc:'最大HP +1 & 全回復', icon:'🤍', rarity:'common', family:'lily', apply:()=>{ player.maxHp += 1; player.hp = player.maxHp; }},
  { id:'lily_2', name:'🤍 リリアの花弁', desc:'最大HP +1', icon:'🤍', rarity:'common', family:'lily', apply:()=>{ player.maxHp += 1; player.hp = Math.min(player.hp+1, player.maxHp); }},
  { id:'lily_3', name:'🤍 白百合の壁', desc:'無敵時間 +20%', icon:'🤍', rarity:'common', family:'lily', apply:()=>{ player.invDuration *= 1.2; }},
  { id:'lily_4', name:'🤍 リリアの癒し', desc:'HP全回復', icon:'🤍', rarity:'common', family:'lily', apply:()=>{ player.hp = player.maxHp; }},
  { id:'lily_5', name:'🤍 花弁の守り', desc:'最大HP +1 & 無敵 +10%', icon:'🤍', rarity:'common', family:'lily', apply:()=>{ player.maxHp += 1; player.hp = Math.min(player.hp+1, player.maxHp); player.invDuration *= 1.1; }},
  { id:'lily_6', name:'🤍 リリアのささやき', desc:'フロア開始時HP2回復', icon:'🤍', rarity:'common', family:'lily', apply:()=>{ player.roomHeal = (player.roomHeal||0) + 2; }},
  { id:'lily_7', name:'🤍 百合の風', desc:'無敵時間 +15%', icon:'🤍', rarity:'common', family:'lily', apply:()=>{ player.invDuration *= 1.15; }},
  { id:'lily_8', name:'🤍 堅き蕾', desc:'最大HP +1 & HP全回復', icon:'🤍', rarity:'common', family:'lily', apply:()=>{ player.maxHp += 1; player.hp = player.maxHp; }},
  { id:'lily_9', name:'🛡️ リリアの結界', desc:'無敵時間 +50%', icon:'🛡️', rarity:'rare', family:'lily', apply:()=>{ player.invDuration *= 1.5; }},
  { id:'lily_10', name:'🤍 リリアの鎧', desc:'最大HP +2 & HP+2', icon:'🤍', rarity:'rare', family:'lily', apply:()=>{ player.maxHp += 2; player.hp = Math.min(player.hp+2, player.maxHp); }},
  { id:'lily_11', name:'🌿 リリアの棘', desc:'被弾時反撃3 & 無敵+20%', icon:'🌿', rarity:'rare', family:'lily', apply:()=>{ player.thorns = Math.max(player.thorns||0, 3); player.invDuration *= 1.2; }},
  { id:'lily_12', name:'🤍 聖百合の祈り', desc:'撃破時HP1回復', icon:'🤍', rarity:'rare', family:'lily', apply:()=>{ player.killHeal = (player.killHeal||0) + 1; }},
  { id:'lily_13', name:'👑 永遠の白百合', desc:'最大HP +3 & 無敵2倍 & 反撃3', icon:'👑', rarity:'legend', family:'lily', apply:()=>{ player.maxHp += 3; player.hp = player.maxHp; player.invDuration *= 2; player.thorns = Math.max(player.thorns||0, 3); }},

  // ===== SUNFLOWER (ソーレ) — 速度・機動力 =====
  { id:'sun_1', name:'🌻 ソーレの風', desc:'移動速度 +15%', icon:'🌻', rarity:'common', family:'sunflower', apply:()=>{ player.speed *= 1.15; }},
  { id:'sun_2', name:'🌻 ソーレの足取り', desc:'移動速度 +10%', icon:'🌻', rarity:'common', family:'sunflower', apply:()=>{ player.speed *= 1.10; }},
  { id:'sun_3', name:'🌻 陽光の加速', desc:'ダッシュCD -20%', icon:'🌻', rarity:'common', family:'sunflower', apply:()=>{ player.dashCooldown = Math.max(0.1, player.dashCooldown * 0.8); }},
  { id:'sun_4', name:'🌻 ソーレの連撃', desc:'攻撃速度 +15%', icon:'🌻', rarity:'common', family:'sunflower', apply:()=>{ player.atkSpeedBonus += 0.15; }},
  { id:'sun_5', name:'🌻 太陽の恵み', desc:'移動速度 +10% & 攻撃速度 +10%', icon:'🌻', rarity:'common', family:'sunflower', apply:()=>{ player.speed *= 1.10; player.atkSpeedBonus += 0.10; }},
  { id:'sun_6', name:'🌻 ひまわりの種', desc:'HP+1回復 & 速度 +5%', icon:'🌻', rarity:'common', family:'sunflower', apply:()=>{ player.hp = Math.min(player.hp+1, player.maxHp); player.speed *= 1.05; }},
  { id:'sun_7', name:'🌻 陽光の守り', desc:'ダッシュCD -15% & 無敵 +10%', icon:'🌻', rarity:'common', family:'sunflower', apply:()=>{ player.dashCooldown = Math.max(0.1, player.dashCooldown * 0.85); player.invDuration *= 1.1; }},
  { id:'sun_8', name:'🌻 太陽の追い風', desc:'移動速度 +20%', icon:'🌻', rarity:'common', family:'sunflower', apply:()=>{ player.speed *= 1.20; }},
  { id:'sun_9', name:'⚡ ソーレの疾走', desc:'ダッシュCD -40%', icon:'⚡', rarity:'rare', family:'sunflower', apply:()=>{ player.dashCooldown = Math.max(0.1, player.dashCooldown * 0.6); }},
  { id:'sun_10', name:'🌻 ソーレの連撃・極', desc:'攻撃速度 +25%', icon:'🌻', rarity:'rare', family:'sunflower', apply:()=>{ player.atkSpeedBonus += 0.25; }},
  { id:'sun_11', name:'🌻 太陽の暴風', desc:'移動速度 +25% & ダッシュCD -25%', icon:'🌻', rarity:'rare', family:'sunflower', apply:()=>{ player.speed *= 1.25; player.dashCooldown = Math.max(0.1, player.dashCooldown * 0.75); }},
  { id:'sun_12', name:'🌻 ソーレの閃光', desc:'速度+20% & 攻撃速度+20%', icon:'🌻', rarity:'rare', family:'sunflower', apply:()=>{ player.speed *= 1.2; player.atkSpeedBonus += 0.20; }},
  { id:'sun_13', name:'👑 太陽神の祝福', desc:'速度+30% & ダッシュCD-50% & 攻速+25%', icon:'👑', rarity:'legend', family:'sunflower', apply:()=>{ player.speed *= 1.3; player.dashCooldown = Math.max(0.1, player.dashCooldown * 0.5); player.atkSpeedBonus += 0.25; }},

  // ===== WISTERIA (フジカ) — 範囲・毒 =====
  { id:'wist_1', name:'💜 フジカの毒', desc:'攻撃力 +1', icon:'💜', rarity:'common', family:'wisteria', apply:()=>{ player.atk += 1; }},
  { id:'wist_2', name:'💜 フジカの霧', desc:'攻撃範囲 +15', icon:'💜', rarity:'common', family:'wisteria', apply:()=>{ player.atkRangeBonus += 15; }},
  { id:'wist_3', name:'💜 紫の絡み', desc:'攻撃力 +1 & 範囲 +10', icon:'💜', rarity:'common', family:'wisteria', apply:()=>{ player.atk += 1; player.atkRangeBonus += 10; }},
  { id:'wist_4', name:'💜 藤の蔓', desc:'攻撃範囲 +20', icon:'💜', rarity:'common', family:'wisteria', apply:()=>{ player.atkRangeBonus += 20; }},
  { id:'wist_5', name:'💜 紫煙', desc:'攻撃力 +1 & 攻撃速度 +10%', icon:'💜', rarity:'common', family:'wisteria', apply:()=>{ player.atk += 1; player.atkSpeedBonus += 0.10; }},
  { id:'wist_6', name:'💜 フジカの息吹', desc:'範囲 +10 & 速度 +5%', icon:'💜', rarity:'common', family:'wisteria', apply:()=>{ player.atkRangeBonus += 10; player.speed *= 1.05; }},
  { id:'wist_7', name:'💜 藤の花弁', desc:'攻撃範囲 +12 & 攻撃速度 +8%', icon:'💜', rarity:'common', family:'wisteria', apply:()=>{ player.atkRangeBonus += 12; player.atkSpeedBonus += 0.08; }},
  { id:'wist_8', name:'💜 紫の波動', desc:'攻撃力 +1 & 範囲 +15', icon:'💜', rarity:'common', family:'wisteria', apply:()=>{ player.atk += 1; player.atkRangeBonus += 15; }},
  { id:'wist_9', name:'🕸️ フジカの絡み', desc:'攻撃範囲 +30', icon:'🕸️', rarity:'rare', family:'wisteria', apply:()=>{ player.atkRangeBonus += 30; }},
  { id:'wist_10', name:'💜 フジカの霧・極', desc:'攻撃力 +2 & 範囲 +15', icon:'💜', rarity:'rare', family:'wisteria', apply:()=>{ player.atk += 2; player.atkRangeBonus += 15; }},
  { id:'wist_11', name:'💜 紫電の一撃', desc:'攻撃力 +2 & 攻撃速度 +15%', icon:'💜', rarity:'rare', family:'wisteria', apply:()=>{ player.atk += 2; player.atkSpeedBonus += 0.15; }},
  { id:'wist_12', name:'💜 藤の結界', desc:'範囲 +25 & 無敵 +20%', icon:'💜', rarity:'rare', family:'wisteria', apply:()=>{ player.atkRangeBonus += 25; player.invDuration *= 1.2; }},
  { id:'wist_13', name:'👑 フジカの瘴気', desc:'攻撃力 +3 & 範囲 +30 & 攻速 +20%', icon:'👑', rarity:'legend', family:'wisteria', apply:()=>{ player.atk += 3; player.atkRangeBonus += 30; player.atkSpeedBonus += 0.20; }},

  // ===== LOTUS (ハスミ) — 回復・生存 =====
  { id:'lotus_1', name:'🌸 ハスミの癒し', desc:'HP全回復', icon:'🌸', rarity:'common', family:'lotus', apply:()=>{ player.hp = player.maxHp; }},
  { id:'lotus_2', name:'🌸 ハスミの花弁', desc:'HP +2回復', icon:'🌸', rarity:'common', family:'lotus', apply:()=>{ player.hp = Math.min(player.hp+2, player.maxHp); }},
  { id:'lotus_3', name:'🌸 蓮の息吹', desc:'最大HP +1 & HP全回復', icon:'🌸', rarity:'common', family:'lotus', apply:()=>{ player.maxHp += 1; player.hp = player.maxHp; }},
  { id:'lotus_4', name:'🌸 ハスミの微笑み', desc:'フロア開始時HP1回復', icon:'🌸', rarity:'common', family:'lotus', apply:()=>{ player.roomHeal = (player.roomHeal||0) + 1; }},
  { id:'lotus_5', name:'🌸 蓮華の光', desc:'HP +3回復', icon:'🌸', rarity:'common', family:'lotus', apply:()=>{ player.hp = Math.min(player.hp+3, player.maxHp); }},
  { id:'lotus_6', name:'🌸 ハスミの祈り', desc:'最大HP +1 & 無敵 +10%', icon:'🌸', rarity:'common', family:'lotus', apply:()=>{ player.maxHp += 1; player.hp = Math.min(player.hp+1, player.maxHp); player.invDuration *= 1.1; }},
  { id:'lotus_7', name:'🌸 蓮の守り', desc:'HP +2 & 速度 +5%', icon:'🌸', rarity:'common', family:'lotus', apply:()=>{ player.hp = Math.min(player.hp+2, player.maxHp); player.speed *= 1.05; }},
  { id:'lotus_8', name:'🌸 花の恵み', desc:'最大HP +1 & HP全回復 & 範囲+5', icon:'🌸', rarity:'common', family:'lotus', apply:()=>{ player.maxHp += 1; player.hp = player.maxHp; player.atkRangeBonus += 5; }},
  { id:'lotus_9', name:'🌸 ハスミの恩寵', desc:'HP+2 & 無敵+20%', icon:'🌸', rarity:'rare', family:'lotus', apply:()=>{ player.hp = Math.min(player.hp+2, player.maxHp); player.invDuration *= 1.2; }},
  { id:'lotus_10', name:'🌺 ハスミの開花', desc:'最大HP+1 & 速度+10%', icon:'🌺', rarity:'rare', family:'lotus', apply:()=>{ player.maxHp += 1; player.hp = player.maxHp; player.speed *= 1.1; }},
  { id:'lotus_11', name:'🌸 蓮華の奇跡', desc:'最大HP +2 & HP全回復', icon:'🌸', rarity:'rare', family:'lotus', apply:()=>{ player.maxHp += 2; player.hp = player.maxHp; }},
  { id:'lotus_12', name:'🌸 ハスミの抱擁', desc:'撃破時HP1回復 & 最大HP+1', icon:'🌸', rarity:'rare', family:'lotus', apply:()=>{ player.killHeal = (player.killHeal||0) + 1; player.maxHp += 1; player.hp = Math.min(player.hp+1, player.maxHp); }},
  { id:'lotus_13', name:'👑 ハスミの生命力', desc:'最大HP +3 & HP全回復 & 無敵+50%', icon:'👑', rarity:'legend', family:'lotus', apply:()=>{ player.maxHp += 3; player.hp = player.maxHp; player.invDuration *= 1.5; }},

  // ===== CHRYSANTH (キクネ) — 収集・磁力 =====
  { id:'chr_1', name:'✨ キクネの幸運', desc:'ドロップ磁力 +60', icon:'✨', rarity:'common', family:'chrysanth', apply:()=>{ player.magnetRange = (player.magnetRange||0) + 60; }},
  { id:'chr_2', name:'✨ キクネの導き', desc:'ドロップ磁力 +50', icon:'✨', rarity:'common', family:'chrysanth', apply:()=>{ player.magnetRange = (player.magnetRange||0) + 50; }},
  { id:'chr_3', name:'✨ 金色の風', desc:'花粉ドロップ+倍', icon:'✨', rarity:'common', family:'chrysanth', apply:()=>{ player.pollenBonus = (player.pollenBonus||0) + 1; }},
  { id:'chr_4', name:'✨ キクネの瞳', desc:'磁力 +40 & 攻撃範囲 +10', icon:'✨', rarity:'common', family:'chrysanth', apply:()=>{ player.magnetRange = (player.magnetRange||0) + 40; player.atkRangeBonus += 10; }},
  { id:'chr_5', name:'✨ 黄金の粒', desc:'花粉ドロップ+倍 & 磁力+30', icon:'✨', rarity:'common', family:'chrysanth', apply:()=>{ player.pollenBonus = (player.pollenBonus||0) + 1; player.magnetRange = (player.magnetRange||0) + 30; }},
  { id:'chr_6', name:'✨ キクネのささやき', desc:'ネクター+20%', icon:'✨', rarity:'common', family:'chrysanth', apply:()=>{ player.nectarMul = (player.nectarMul||0) + 0.20; }},
  { id:'chr_7', name:'✨ 菊の知恵', desc:'磁力 +50 & 速度 +5%', icon:'✨', rarity:'common', family:'chrysanth', apply:()=>{ player.magnetRange = (player.magnetRange||0) + 50; player.speed *= 1.05; }},
  { id:'chr_8', name:'✨ 秋の実り', desc:'花粉+倍 & HP+1', icon:'✨', rarity:'common', family:'chrysanth', apply:()=>{ player.pollenBonus = (player.pollenBonus||0) + 1; player.hp = Math.min(player.hp+1, player.maxHp); }},
  { id:'chr_9', name:'✨ キクネの黄金', desc:'花粉ドロップ+倍 & 磁力+60', icon:'✨', rarity:'rare', family:'chrysanth', apply:()=>{ player.pollenBonus = (player.pollenBonus||0) + 1; player.magnetRange = (player.magnetRange||0) + 60; }},
  { id:'chr_10', name:'👁️ キクネの千里眼', desc:'範囲+15 & 磁力+40', icon:'👁️', rarity:'rare', family:'chrysanth', apply:()=>{ player.atkRangeBonus += 15; player.magnetRange = (player.magnetRange||0) + 40; }},
  { id:'chr_11', name:'✨ 黄金の雨', desc:'花粉+倍2 & ネクター+15%', icon:'✨', rarity:'rare', family:'chrysanth', apply:()=>{ player.pollenBonus = (player.pollenBonus||0) + 2; player.nectarMul = (player.nectarMul||0) + 0.15; }},
  { id:'chr_12', name:'✨ キクネの祝福', desc:'磁力+80 & 花粉+倍 & 攻撃+1', icon:'✨', rarity:'rare', family:'chrysanth', apply:()=>{ player.magnetRange = (player.magnetRange||0) + 80; player.pollenBonus = (player.pollenBonus||0) + 1; player.atk += 1; }},
  { id:'chr_13', name:'👑 キクネの大福', desc:'磁力+120 & 花粉+倍2 & HP+1 & ネクター+30%', icon:'👑', rarity:'legend', family:'chrysanth', apply:()=>{ player.magnetRange = (player.magnetRange||0) + 120; player.pollenBonus = (player.pollenBonus||0) + 2; player.maxHp += 1; player.hp = player.maxHp; player.nectarMul = (player.nectarMul||0) + 0.30; }},
];

// ===== DUO BLESSINGS (15 combos) =====
const DUO_DEFS = [
  { families:['rose','lily'], name:'🌹🤍 棘盾の共鳴', desc:'攻撃+2 & 最大HP+1 & 反撃2', apply:()=>{ player.atk += 2; player.maxHp += 1; player.hp = Math.min(player.hp+1, player.maxHp); player.thorns = Math.max(player.thorns||0, 2); }},
  { families:['rose','sunflower'], name:'🌹🌻 烈火の追風', desc:'攻撃+2 & 速度+20%', apply:()=>{ player.atk += 2; player.speed *= 1.2; }},
  { families:['rose','wisteria'], name:'🌹💜 棘毒の共鳴', desc:'攻撃力 +3 & 範囲+15', apply:()=>{ player.atk += 3; player.atkRangeBonus += 15; }},
  { families:['rose','lotus'], name:'🌹🌸 血花の契約', desc:'攻撃+2 & 撃破HP回復', apply:()=>{ player.atk += 2; player.vampiric = true; }},
  { families:['rose','chrysanth'], name:'🌹✨ 赤金の嵐', desc:'攻撃+2 & 磁力+80 & 花粉+倍', apply:()=>{ player.atk += 2; player.magnetRange = (player.magnetRange||0) + 80; player.pollenBonus = (player.pollenBonus||0) + 1; }},
  { families:['lily','sunflower'], name:'🤍🌻 花風の守護', desc:'最大HP+2 & 速度+15%', apply:()=>{ player.maxHp += 2; player.hp = Math.min(player.hp+2, player.maxHp); player.speed *= 1.15; }},
  { families:['lily','wisteria'], name:'🤍💜 結界の霧', desc:'最大HP+1 & 範囲+20 & 無敵+20%', apply:()=>{ player.maxHp += 1; player.hp = Math.min(player.hp+1, player.maxHp); player.atkRangeBonus += 20; player.invDuration *= 1.2; }},
  { families:['lily','lotus'], name:'🤍🌸 不滅の蓮華', desc:'最大HP+3 & 無敵+30% & 反撃1', apply:()=>{ player.maxHp += 3; player.hp = player.maxHp; player.invDuration *= 1.3; player.thorns = Math.max(player.thorns||0, 1); }},
  { families:['lily','chrysanth'], name:'🤍✨ 守護の光', desc:'最大HP+2 & 磁力+60', apply:()=>{ player.maxHp += 2; player.hp = Math.min(player.hp+2, player.maxHp); player.magnetRange = (player.magnetRange||0) + 60; }},
  { families:['sunflower','wisteria'], name:'🌻💜 疾風の毒霧', desc:'速度+20% & 攻撃+1 & 範囲+20', apply:()=>{ player.speed *= 1.2; player.atk += 1; player.atkRangeBonus += 20; }},
  { families:['sunflower','lotus'], name:'🌻🌸 陽光の癒し', desc:'速度+15% & 最大HP+2 & HP全回復', apply:()=>{ player.speed *= 1.15; player.maxHp += 2; player.hp = player.maxHp; }},
  { families:['sunflower','chrysanth'], name:'🌻✨ 黄金の収穫', desc:'速度+25% & 花粉+倍 & 磁力+60', apply:()=>{ player.speed *= 1.25; player.pollenBonus = (player.pollenBonus||0) + 1; player.magnetRange = (player.magnetRange||0) + 60; }},
  { families:['wisteria','lotus'], name:'💜🌸 紫蓮の癒し', desc:'範囲+25 & 最大HP+1 & HP全回復', apply:()=>{ player.atkRangeBonus += 25; player.maxHp += 1; player.hp = player.maxHp; }},
  { families:['wisteria','chrysanth'], name:'💜✨ 毒蝶の舞', desc:'攻撃+2 & 範囲+15 & 磁力+100', apply:()=>{ player.atk += 2; player.atkRangeBonus += 15; player.magnetRange = (player.magnetRange||0) + 100; }},
  { families:['lotus','chrysanth'], name:'🌸✨ 生命の収穫', desc:'最大HP+2 & 花粉+倍 & 磁力+80', apply:()=>{ player.maxHp += 2; player.hp = Math.min(player.hp+2, player.maxHp); player.pollenBonus = (player.pollenBonus||0) + 1; player.magnetRange = (player.magnetRange||0) + 80; }},
];

let activeDuos = [];
let blessingChoices = [], activeBlessings = [], selectCursor = 0;

function checkDuos() {
  const fams = new Set(activeBlessings.map(b => b.family));
  for (const duo of DUO_DEFS) {
    if (activeDuos.some(d => d.name === duo.name)) continue;
    if (duo.families.every(f => fams.has(f))) {
      duo.apply(); activeDuos.push(duo);
      showFloat('✨ ' + duo.name + ' はつどう！', 3.0, MSG_COLORS.duo);
      spawnDmg(player.x + player.w/2, player.y - 20, 0, '#ffd700');
      emitParticles(player.x + player.w/2, player.y + player.h/2, '#ffd700', 12, 100, 0.5);
      Audio.level_up();
    }
  }
}

function pickBlessings() {
  const pool = [...BLESSING_POOL];
  const weighted = [];
  for (const b of pool) {
    const w = b.rarity === 'legend' ? 5 : b.rarity === 'rare' ? 25 : 50;
    for (let i = 0; i < w; i++) weighted.push(b);
  }
  const picks = [], used = new Set();
  while (picks.length < 3 && used.size < pool.length) {
    const b = weighted[Math.floor(rng() * weighted.length)];
    if (!used.has(b.id)) { used.add(b.id); picks.push(b); }
  }
  selectCursor = 0;
  return picks;
}
