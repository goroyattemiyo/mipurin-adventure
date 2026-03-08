# COUNCIL-SESSION-002: Game Balance & Display

## Status: PHASE 1 RESOLVED / PHASE 2 IN PROGRESS

---

## Phase 1: Balance Hotfix (v6.3.1)

- Initial ATK: 1 → 2
- Initial HP: 5 → 7
- F1 enemy DMG scale: fixed ×1.0
- DMG scale coefficient: floor×0.1 → floor×0.06
- F1-2 weak enemies only (mushroom, slime)
- Heal drop rate: 15% → 20% (v6.3.2)

## Phase 2: Font & Display (v6.3.2 - v6.4.1)

### Problem
Canvas内部1280×960がCSS表示927×695に縮小（72%）、さらにdevicePixelRatio 1.25でHiDPI未対応。フォントが意図の50-70%サイズで表示。

### Resolution
1. **v6.3.2**: M PLUS Rounded 1c導入、ドロップ名フロート表示
2. **v6.3.7**: フォント5層階層システム（A:見出し B:選択 C:HUD D:フロート E:テキスト）
3. **v6.3.8**: タイトル画面レイアウト修正（タイトル120px、ミプリン拡大）
4. **v6.3.9**: CSS最大化（min(100vw,133.33vh) / min(75vw,100vh)）
5. **v6.4.0**: Canvas ctx.fontのフォント名クォート修正（101箇所）
6. **v6.4.1**: HiDPI対応（canvas解像度をCW×DPR、ctx.scale(DPR,DPR)）

### Root Cause
- CSS縮小: canvas表示が画面に収まるよう縮小
- HiDPI未対応: devicePixelRatio=1.25でCanvasピクセルと物理ピクセル不一致
- ctx.fontのフォント名にクォート不足でGoogle Font未適用

### Current Status
- タイトル画面: OK（120px丸ゴシック表示確認）
- 戦闘中HUD/ドロップ/ノード選択/ショップ: 試遊確認中

## Phase 3: Pending Investigation

- 祝福効果の反映確認（攻撃範囲拡大等）
- ハート表示の重なり問題
- 個別フォントサイズ微調整（試遊後）

## Versions

| Version | Change |
|---------|--------|
| v6.3.1 | Balance hotfix (ATK2, HP7, F1 DMG flat, scale 0.06) |
| v6.3.2 | Heal drop 20%, drop name floats, M PLUS Rounded 1c |
| v6.3.7 | Font hierarchy 5-layer system |
| v6.3.8 | Title screen layout fix |
| v6.3.9 | CSS maximize canvas display |
| v6.4.0 | Fix canvas font quotes (101 declarations) |
| v6.4.1 | HiDPI devicePixelRatio support |