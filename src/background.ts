// Background service worker — relays keyboard shortcut commands to content scripts

chrome.commands.onCommand.addListener(async (command) => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  if (command === 'regenerate-awb') {
    chrome.tabs.sendMessage(tab.id, { action: 'regenerate' });
  }
  if (command === 'toggle-widget') {
    chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});
