# COUNCIL-SESSION-002: ゲームバランス設計

**ID**: COUNCIL-SESSION-002
**Repository**: mipurin-adventure
**Participants**: Claude Opus 4.6 / ChatGPT 5.4
**Status**: RESOLVED
**Date**: 2026-03-08

---

## 1. Question

序盤のバランスが崩壊している。ATK1 vs 被ダメ2〜4、HP5では2〜3発で死亡。ゲームループが回らない。

## 2. Context

- プレイヤー: HP 5, ATK 1, 武器速度 0.18s, DPS ≈ 5.5
- 回復: ドロップ15%でHP+1のみ
- 敵HPスケール: ceil(base × (1 + log2(1+floor) × 0.35))
- 敵DMGスケール: ceil(base × (1 + floor × 0.1))
- F1でbeetle(DMG3), golem(DMG4)が出現可能
- 成長手段: 祝福（ランダム）のみ

## 3. Claude Proposal (5点)

1. 初期ATK 1→2
2. 初期HP 5→8
3. F1の敵DMGスケール無効（×1.0固定）
4. 敵DMGスケール緩和 floor×0.1 → floor×0.06
5. F1〜F2は弱敵限定（mushroom, slime）
6. 回復ドロップ率 15%→25%

## 4. ChatGPT 5.4 Judgment

### 採用（調整あり）
- 初期ATK 1→2 ✅
- 初期HP 5→7（8は甘すぎる） ✅ 修正
- F1敵DMGスケール無効 ✅
- DMGスケール 0.1→0.06 ✅
- F1〜F2弱敵限定 ✅

### 保留
- 回復ドロップ率 → 入れるなら20%から。25%は飛びすぎ。

### 理由
- 問題は「序盤の理不尽さ」であり終盤の厳しさではない
- ATK2は序盤ストレス除去効果が大きい
- HP8はATK2とセットだと序盤が緩すぎる → 7が安全
- 回復率は他の調整を入れた後に判断すべき（何が効いたか分からなくなる）

## 5. Implementation

### v6.3.1 (Balance Hotfix)
- 初期ATK 1→2
- 初期HP 5→7
- F1敵DMGスケール無効
- DMGスケール 0.06
- F1-2弱敵限定

### v6.3.2 (Follow-up)
- 試遊後「回復ないと続かない」→ 回復率 15→20% 採用
- ドロップ名フロート表示追加
- フォント M PLUS Rounded 1c 導入

## 6. Result

- 序盤生存率が大幅改善
- F1-2が学習区間として機能
- F3以降で緊張感が増す設計を維持
- 回復率20%で適度な安心感

## 7. Remaining

- フォントサイズ調整（別コミット）
- 中盤〜終盤バランス検証（F5以降）
- 祝福による成長曲線の設計
- レベルアップ時のHP/ATK上昇量の検討
