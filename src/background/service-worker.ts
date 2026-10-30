// FormPilot Background Service Worker

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    // Open onboarding page on initial install
    const stored = await chrome.storage.local.get('formpilot_profile');
    if (!stored || !stored.formpilot_profile) {
      chrome.runtime.openOptionsPage();
    }
  }
});

// Listener for content script or popup messages
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'OPEN_OPTIONS') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return true;
  }
  return false;
});
