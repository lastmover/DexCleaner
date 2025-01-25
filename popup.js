document.addEventListener('DOMContentLoaded', () => {
  const toggleCheckbox = document.getElementById('toggleBoosts');

  // Load initial state
  chrome.storage.local.get('dexcleaner-hide-boosts', (data) => {
    const isHidden = data['dexcleaner-hide-boosts'] !== false;
    toggleCheckbox.checked = isHidden;
  });

  // Update on change
  toggleCheckbox.addEventListener('change', (e) => {
    const hide = e.target.checked;
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
});