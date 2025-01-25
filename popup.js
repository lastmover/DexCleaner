document.addEventListener('DOMContentLoaded', () => {
  const toggleCheckbox = document.getElementById('toggleBoosts');
  const toggleDuplicatesCheckbox = document.getElementById('toggleDuplicates');

  // Load initial state
  chrome.storage.local.get(['dexcleaner-hide-boosts', 'dexcleaner-hide-duplicates'], (data) => {
    toggleCheckbox.checked = data['dexcleaner-hide-boosts'] !== false;
    toggleDuplicatesCheckbox.checked = data['dexcleaner-hide-duplicates'] !== false;
  });

  // Handle boosts toggle
  toggleCheckbox.addEventListener('change', (e) => {
    const hide = e.target.checked;
    chrome.storage.local.set({ 'dexcleaner-hide-boosts': hide }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        tabs[0] && chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateStyles',
          hideBoosts: hide
        });
      });
    });
  });

  // Handle duplicates toggle
  toggleDuplicatesCheckbox.addEventListener('change', (e) => {
    const hide = e.target.checked;
    chrome.storage.local.set({ 'dexcleaner-hide-duplicates': hide }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        tabs[0] && chrome.tabs.sendMessage(tabs[0].id, {
          action: 'updateDuplicates',
          hideDuplicates: hide
        });
      });
    });
  });
});