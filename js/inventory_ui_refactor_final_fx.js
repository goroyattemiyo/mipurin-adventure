// ===== js/inventory_ui_refactor_final_fx.js =====

function drawInventoryRefactorFinalFx() {
  if (!inventoryOpen) return;

  if (inventoryTab === 0 && typeof drawItemsPageIdealFx === 'function') {
    drawItemsPageIdealFx();
  } else if (inventoryTab === 1 && typeof drawCollectionPageIdealFx === 'function') {
    drawCollectionPageIdealFx();
  } else if (inventoryTab === 2 && typeof drawEquipPageIdealFx === 'function') {
    drawEquipPageIdealFx();
  } else if (typeof drawInventoryRefactorFinal === 'function') {
    drawInventoryRefactorFinal();
  }
}
