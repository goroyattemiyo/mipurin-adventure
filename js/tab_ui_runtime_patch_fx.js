// ===== js/tab_ui_runtime_patch_fx.js =====

(function(){
  const original = window.drawInventory;
  window.drawInventory = function() {
    if (typeof drawInventoryRefactorFinalFx === 'function') {
      drawInventoryRefactorFinalFx();
    } else if (typeof drawInventoryRefactorFinal === 'function') {
      drawInventoryRefactorFinal();
    } else if (original) {
      original();
    }
  };
})();
