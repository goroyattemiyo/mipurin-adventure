// ===== js/tab_ui_runtime_patch.js =====

(function(){
  const original = window.drawInventory;
  window.drawInventory = function() {
    if (typeof drawInventoryRefactorFinal === 'function') {
      drawInventoryRefactorFinal();
    } else if (original) {
      original();
    }
  };
})();
