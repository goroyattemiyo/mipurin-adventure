# CHANGELOG — ミプリンの冒険

## v6.14.1 (2026-03-12)

### Bug Fixes (18件)
- F1: render.js camX/camY未定義クラッシュ修正
- F2: update.js updateBubble→updateBubbles タイポ修正
- F4: game.js タイマー変数正式宣言 (blessingAnimTimer等)
- F5: enemies.js stopBGM()フェード(0.8)統一
- F6: systems.js ボスフロアBGM競合修正
- F7: update.js idleTimerリセット位置修正
- F8: systems.js dashCooldown初期値0.5修正
- F9: systems.js resetGame() idleTimer=0
- F10: systems.js resetGame() eliteNext=false
- F11+F13: ui_screens.js タイトルUI blink修正+Escape
- F12: game.js titleVolSel正式宣言
- F14: index.html タイトルv6.14.1
- F16: update.js 重複BGMチェック除去
- F18: systems.js 未使用bossLines除去
- F20: update.js パーティクル数削減

### UI/UX
- ゲームオーバー画面: レイアウト分離（テキスト上部/画像下部）
- タイトル画面: 情報パネル統合、配色・フォント改善
- ボスシルエット: 非ボスダイアログ表示修正（cutinTimer guard）
- 吹き出し: クランプ, 復帰/回復/クリア時セリフ, 死亡セリフ安定化

## 過去バージョン
- v6.10.2: HUDテキスト重なり修正
- v6.10.1: フォントレンダリング改善
- v6.10.0: Sprint C — 花壇6種, NPCフローラ, 3種エンディング
- v6.9.x: Sprint B — ノードマップ
- v6.8.0: Sprint A — 10ファイル分割 + 78祝福 + 15デュオ