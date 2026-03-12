# CHANGELOG - ミプリンの冒険

## v6.14.1 (2026-03-12)
### Bug Fixes (18件)
- F1: render.js camX/camY未定義クラッシュ修正
- F2: update.js updateBubble→updateBubbles タイポ修正
- F4: game.js タイマー変数の正式宣言 (blessingAnimTimer等)
- F5: enemies.js stopBGM()にフェード(0.8)統一
- F6: systems.js ボスフロアBGM競合修正
- F7: update.js idleTimerリセット位置修正
- F8: systems.js dashCooldown初期値0.5に修正
- F9: systems.js resetGame()にidleTimer=0追加
- F10: systems.js resetGame()にeliteNext=false追加
- F11+F13: ui_screens.js タイトルUI blink内ネスト修正+Escape処理
- F12: game.js titleVolSel正式宣言
- F14: index.html タイトルをv6.14.1に更新
- F16: update.js 重複BGMチェック除去
- F18: systems.js 未使用bossLines除去
- F20: update.js パーティクル数削減

### UI/UX Improvements
- ゲームオーバー画面: テキスト上部パネル+画像下部の分離レイアウト
- タイトル画面: 情報パネルにまとめ、配色改善、フォント統一
- ボスシルエット: 非ボスダイアログでの誤表示を修正
- 吹き出し: クランプ処理、復帰/回復/クリア時のセリフ追加
- 死亡セリフ: 「」付き表示、ローテーション安定化

### Quality of Life
- Q1: 吹き出し画面端クランプ
- Q2: アイドル復帰吹き出し
- Q3: 回復時吹き出し (40%確率)
- Q4: フロアクリア吹き出し
- Q5: 死亡セリフ安定化