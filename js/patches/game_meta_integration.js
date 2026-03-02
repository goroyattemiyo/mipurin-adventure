/**
 * game_meta_integration.js - game.js統合ヘルパー
 *
 * === 統合手順 ===
 * 1. index.html に meta.js, metaUI.js を追加済み
 * 2. game.js の init() 内で MetaProgression.init() を呼ぶ
 * 3. game.js の _initMapScene() 内で MetaProgression.applyToPlayer(player) を呼ぶ
 * 4. メニューに 'menu_garden' を追加し MetaUI.open() を呼ぶ
 * 5. ゲームオーバー時に GameMetaIntegration.handleGameOver() を呼ぶ
 * 6. メインループで MetaUI.isOpen() なら MetaUI.update()/draw() を呼ぶ
 */
const GameMetaIntegration = (() => {

  function handleGameOver(player, flags, floor, bossId) {
    MetaProgression.init();
    var pollen = (typeof Inventory !== 'undefined' && Inventory.getCount)
      ? Inventory.getCount('pollen') : 0;

    var result = MetaProgression.onRunEnd({
      floor: floor || 1,
      kills: flags.killCount || 0,
      eliteKills: 0,
      bossKills: bossId ? 1 : 0,
      noDamage: (flags.killCount > 0 && player.hp === player.maxHp),
      bossId: bossId || null,
      pollen: pollen
    });

    if (result.pollenKept > 0 && typeof Inventory !== 'undefined') {
      setTimeout(function() {
        if (Inventory.addItem) {
          for (var i = 0; i < result.pollenKept; i++) {
            Inventory.addItem('pollen');
          }
        }
      }, 100);
    }
    return result;
  }

  function handleDungeonEnd(dungeonResult, player, bossId) {
    MetaProgression.init();
    return MetaProgression.onRunEnd({
      floor: dungeonResult.floor || 1,
      kills: dungeonResult.kills || 0,
      eliteKills: 0,
      bossKills: bossId ? 1 : 0,
      noDamage: false,
      bossId: bossId,
      pollen: dungeonResult.pollen || 0
    });
  }

  function getMenuLabel() {
    return '花壇 (✦' + MetaProgression.getNectar() + ')';
  }

  return {
    handleGameOver: handleGameOver,
    handleDungeonEnd: handleDungeonEnd,
    getMenuLabel: getMenuLabel
  };
})();
