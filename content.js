(function () {
  'use strict';

  let styleElement;

  function toggleBoosts(hide) {
    if (!styleElement) {
      styleElement = document.createElement('style');
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = hide ? `
      .ds-dex-table-row-base-token-name-boosts {
        display: none !important;
      }
      .ds-dex-table-row-base-token-symbol {
        color: unset !important;
      }
    ` : '';
  }

  function init() {
    chrome.storage.local.get(['dexcleaner-hide-boosts'], (result) => {
      const hideBoosts = result['dexcleaner-hide-boosts'] !== false;
      toggleBoosts(hideBoosts);
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'updateStyles') {
        toggleBoosts(message.hideBoosts);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();