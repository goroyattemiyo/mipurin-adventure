// ===== js/inventory_ui_refactor_final.js =====

function drawInventoryRefactorFinal() {
  if (!inventoryOpen) return;

  if (inventoryTab === 0 && typeof drawItemsPageIdeal === 'function') {
    drawItemsPageIdeal();
  } else if (inventoryTab === 1 && typeof drawCollectionPageIdeal === 'function') {
    drawCollectionPageIdeal();
  } else if (inventoryTab === 2 && typeof drawEquipPageIdeal === 'function') {
    drawEquipPageIdeal();
  }
}
