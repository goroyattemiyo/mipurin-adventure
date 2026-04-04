// ===== js/inventory_ui_refactor.js =====
// Replacement dispatcher for notebook/tab UI.
// This file is intended to replace drawInventory() routing once switchover is approved.

function drawInventoryRefactor() {
  if (!inventoryOpen) return;

  const _M = (typeof touchActive !== 'undefined' && touchActive) ? 2 : 1;
  const _isTch = (typeof touchActive !== 'undefined' && touchActive);

  if (inventoryTab === 0) {
    if (typeof drawItemsPageWithBase === 'function') {
      drawItemsPageWithBase();
    } else if (typeof drawInventoryItems === 'function') {
      drawInventoryItems();
    }
  } else if (inventoryTab === 1) {
    if (typeof drawCollectionPageWithBase === 'function') {
      drawCollectionPageWithBase();
    } else if (typeof drawCollectionTab === 'function') {
      drawCollectionTab();
    }
  } else if (inventoryTab === 2) {
    if (typeof drawEquipPageWithBase === 'function') {
      drawEquipPageWithBase();
    } else if (typeof drawEquipTab === 'function') {
      const outer = (typeof getInventorySafeLayout === 'function')
        ? getInventorySafeLayout().outer
        : { x: 80, y: 130, w: CW - 160, h: CH - 180 };
      drawEquipTab(outer.x, outer.y, outer.w, outer.h);
    }
  }

  let _helpLines;
  if (inventoryTab === 0) {
    _helpLines = _isTch
      ? ['花粉 = ショップで使う通貨', 'HP / ATK / 速度: プレイヤーの状態', '☰ボタン: タブ切替', '◄ボタン: とじる']
      : ['花粉 = ショップで使う通貨', 'HP / ATK / 速度: プレイヤーの状態', 'TAB キー: タブ切替', 'ESC キー: とじる'];
  } else if (inventoryTab === 1) {
    _helpLines = _isTch
      ? ['上下スワイプ: スクロール', '左右のタブをタップ: サブタブ切替', '☰ボタン: タブ切替', '◄ボタン: とじる']
      : ['↑↓ キー: スクロール', '← → キー: サブタブ切替', 'TAB キー: タブ切替', 'ESC キー: とじる'];
  } else {
    _helpLines = _isTch
      ? ['スロットをタップ: 選択', 'リスト項目をタップ: 武器選択', 'Zボタン: 強化 / そうび', 'Xボタン: そうびを切り替え', '◄ボタン: とじる']
      : ['↑↓: スロット選択', '→: リストへ (武器スロット)', 'Z: 強化 / そうび', 'X: そうびを切り替え', 'ESC: とじる'];
  }

  UIManager.drawHelpIcon(ctx, CW - 160, 55 + 10 * _M, 34, 'inventory');
  if (UIManager.isHelpOpen('inventory')) {
    const _tabName = ['持ち物', '図鑑', '装備'][inventoryTab] || '';
    UIManager.showModal(ctx, _tabName + ' — 操作ガイド', _helpLines);
  }
}
