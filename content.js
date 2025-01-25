(function () {
'use strict';

  let styleElement;
  let mutationObserver;
  const containerSeen = new WeakMap();
  let processedRows = new WeakSet();
  let showTwitterLinks = true;

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

  async function addTwitterLink(row) {
    if (processedRows.has(row)) return;
    processedRows.add(row);
    
    const rowLink = row.closest('a.ds-dex-table-row-top');
    if (!rowLink) return;

    const hrefParts = rowLink.getAttribute('href').split('/').filter(p => p);
    if (hrefParts.length < 2) return;
    
    const [chain, pairAddress] = hrefParts;
    const apiUrl = `https://api.dexscreener.com/latest/dex/pairs/${chain}/${pairAddress}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const twitterUrl = data.pairs?.[0]?.info?.socials?.find(s => s.type === 'twitter')?.url;
      
      if (twitterUrl) {
const twitterLink = document.createElement('a');
        twitterLink.classList.add('ds-twitter-link');
        twitterLink.href = twitterUrl;
        twitterLink.target = '_blank';
        twitterLink.style.marginLeft = '8px';
        twitterLink.innerHTML = `
          <img src="${chrome.runtime.getURL('x_icon.svg')}"
               width="14"
               height="14"
               alt="X (Twitter)"
               style="vertical-align: middle; filter: invert(1)">
        `;
        twitterLink.addEventListener('click', e => e.stopPropagation());

        const nameSpan = row.querySelector('.ds-dex-table-row-base-token-name-text');
        if (nameSpan) nameSpan.after(twitterLink);
      }
    } catch (error) {
      console.log('Twitter link fetch error:', error);
    }
  }

  function checkDuplicates() {
    document.querySelectorAll('.ds-dex-table.ds-dex-table-top').forEach(container => {
      const seen = new Set();
      containerSeen.set(container, seen);
      
      container.querySelectorAll('.ds-dex-table-row').forEach(row => {
        const img = row.querySelector('.ds-dex-table-row-token-icon-img');
        if (img) {
          const src = img.getAttribute('src').split('?')[0];
          if (seen.has(src)) {
            row.classList.add('ds-duplicate-row');
          } else {
            seen.add(src);
            row.classList.remove('ds-duplicate-row');
          }
        }
        addTwitterLink(row);
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
    chrome.storage.local.get([
      'dexcleaner-hide-boosts',
      'dexcleaner-hide-duplicates',
      'dexcleaner-show-twitter'
    ], (result) => {
      showTwitterLinks = result['dexcleaner-show-twitter'] !== false;
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
} else if (message.action === 'updateTwitter') {
        showTwitterLinks = message.showTwitter;
        // If we're hiding them, remove existing links
        if (!showTwitterLinks) {
          document.querySelectorAll('.ds-twitter-link').forEach(link => link.remove());
        } else {
          // If we're showing them, re-check so we add them again
          processedRows = new WeakSet();
          checkDuplicates();
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();