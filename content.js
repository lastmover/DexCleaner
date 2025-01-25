(function () {
  'use strict';

  let styleElement;
  let mutationObserver;
  const containerSeen = new WeakMap();

  function toggleBoosts(hide) {
    if (!styleElement) {
      styleElement = document.createElement('style');
      document.head.appendChild(styleElement);
    }

    const boostsCSS = hide ? `
      .ds-dex-table-row-base-token-name-boosts {
        display: none !important;
      }
      .ds-dex-table-row-base-token-symbol {
        color: unset !important;
      }
    ` : '';

    styleElement.textContent = `
      .ds-duplicate-row {
        display: none !important;
      }
      ${boostsCSS}
    `;
  }

  function checkDuplicates() {
    document.querySelectorAll('.ds-dex-table.ds-dex-table-top').forEach(container => {
      const seen = new Set();
      containerSeen.set(container, seen);
      
      container.querySelectorAll('.ds-dex-table-row').forEach(row => {
        const img = row.querySelector('.ds-dex-table-row-token-icon-img');
        if (img) {
          const src = img.getAttribute('src').split('?')[0]; // Remove cache busters
          if (seen.has(src)) {
            row.classList.add('ds-duplicate-row');
          } else {
            seen.add(src);
            row.classList.remove('ds-duplicate-row');
          }
        }
      });
    });
  }

  function startDuplicateObserver() {
    mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.addedNodes.length) checkDuplicates();
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

function stopDuplicateObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }
  // WeakMap doesn't need explicit clearing
}

  function toggleDuplicates(hide) {
    if (hide) {
      checkDuplicates();
      startDuplicateObserver();
    } else {
    stopDuplicateObserver();
    // Clear classes from all containers
    document.querySelectorAll('.ds-dex-table.ds-dex-table-top').forEach(container => {
      container.querySelectorAll('.ds-duplicate-row').forEach(row => {
        row.classList.remove('ds-duplicate-row');
      });
    });
    }
  }

  function init() {
    chrome.storage.local.get(['dexcleaner-hide-boosts', 'dexcleaner-hide-duplicates'], (result) => {
      const hideBoosts = result['dexcleaner-hide-boosts'] !== false;
      const hideDuplicates = result['dexcleaner-hide-duplicates'] !== false;
      toggleBoosts(hideBoosts);
      toggleDuplicates(hideDuplicates);
    });

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'updateStyles') {
        toggleBoosts(message.hideBoosts);
      } else if (message.action === 'updateDuplicates') {
        toggleDuplicates(message.hideDuplicates);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();