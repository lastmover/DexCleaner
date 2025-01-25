document.addEventListener('DOMContentLoaded', () => {
  const toggleBoosts = document.getElementById('toggleBoosts');
  const toggleDuplicates = document.getElementById('toggleDuplicates');
  const toggleTwitter = document.getElementById('toggleTwitter');

  // Load initial state
  chrome.storage.local.get([
    'dexcleaner-hide-boosts',
    'dexcleaner-hide-duplicates',
    'dexcleaner-show-twitter'
  ], (data) => {
    // For "Boosts": we stored "hide-boosts". If it's true, that means user wants to hide, so the toggle (show) is false.
    toggleBoosts.checked = data['dexcleaner-hide-boosts'] === false;

    // For "Duplicate Rows": we stored "hide-duplicates". If it's true, that means user wants to hide, so the toggle (show) is false.
    toggleDuplicates.checked = data['dexcleaner-hide-duplicates'] === false;

    // For "X Links": we stored "show-twitter". If it's true, user wants to show, so toggle is true.
    toggleTwitter.checked = data['dexcleaner-show-twitter'] !== false;
  });

  // If user checks "Boosts", we want to show them => hideBoosts = !checked
  toggleBoosts.addEventListener('change', (e) => {
    const hide = !e.target.checked;
    chrome.storage.local.set({ 'dexcleaner-hide-boosts': hide }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateStyles',
            hideBoosts: hide
          });
        }
      });
    });
  });

  // If user checks "Duplicate Rows", we want to show them => hideDuplicates = !checked
  toggleDuplicates.addEventListener('change', (e) => {
    const hide = !e.target.checked;
    chrome.storage.local.set({ 'dexcleaner-hide-duplicates': hide }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateDuplicates',
            hideDuplicates: hide
          });
        }
      });
    });
  });

  // If user checks "X Links", we want to show => showTwitter = checked
  toggleTwitter.addEventListener('change', (e) => {
    const show = e.target.checked;
    chrome.storage.local.set({ 'dexcleaner-show-twitter': show }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updateTwitter',
            showTwitter: show
          });
        }
      });
    });
  });
});