// content.js
(function() {
  'use strict';

  function init() {
    // Create and inject styles only when document.head exists
    const style = document.createElement('style');
    style.textContent = `
      .ds-dex-table-row-base-token-name-boosts {
        display: none !important;
      }
      
      .ds-dex-table-row-base-token-symbol {
        all: unset !important;
      }
    `;

    document.head.appendChild(style);
    console.log('Boost UI elements hidden');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();